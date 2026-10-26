"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs");
const G=require("../src/engine.js"),app=fs.readFileSync("src/app.js","utf8");
const start=app.indexOf("async function importSave(file){"),end=app.indexOf("\nfunction init(){",start);
assert.ok(start>0&&end>start,"24-case importer must remain accessible to safety tests");
const snippet=app.slice(start,end);
function fixture(failAt=0){
 const KEY="night-office-auditor-expanded:save:v3",
  NOTEKEY="night-office-auditor-expanded:notes:v1",
  VOICEKEY="night-office-auditor-expanded:voices:v1";
 const original=G.initial(20261024),priorNote={version:1,index:0,seed:original.seed,choice:null,docs:[]};
 const data=new Map([[KEY,JSON.stringify(original)],[NOTEKEY,JSON.stringify(priorNote)],
 [VOICEKEY,JSON.stringify({seed:original.seed,choices:Array(24).fill(null)})]]);
 const before=new Map(data);let count=0,alerts=[],renderCount=0;
 const storage={
  getItem:key=>data.get(key)??null,
  setItem(key,value){count++;if(failAt&&count===failAt)throw Error("test simulated storage refusal");data.set(key,value);},
  removeItem:key=>data.delete(key)
 };
 const expected=G.decide(original,"review").state;
 const validateNote=(raw,target)=>raw&&raw.version===1&&raw.index===target.index&&raw.seed===target.seed&&
   Array.isArray(raw.docs)&&raw.docs.length<=2&&raw.docs.every(id=>target.active.checked.includes(id))?
   raw:null;
 const validateVoices=raw=>Array.isArray(raw)&&raw.length===24&&raw.every(x=>x===null||x==="careful"||x==="press")?[...raw]:null;
 const ctor=new Function("G","localStorage","confirm","alert","render","validateNote","validateVoices",
  "KEY","NOTEKEY","VOICEKEY","startState","startNote",`
 let state=startState,lastReport=null,unreadableRaw=null,recoveryBlocked=false,notice="",
 notebook=startNote,conversations=Array(24).fill(null);
 `+snippet+`
 return {importSave,getState:()=>state,getNote:()=>notebook,getVoices:()=>conversations};`);
 const sut=ctor(G,storage,()=>true,msg=>alerts.push(msg),()=>{renderCount++;},validateNote,validateVoices,
  KEY,NOTEKEY,VOICEKEY,original,priorNote);
 const payload={schema:G.VERSION,state:expected,notebook:{version:1,index:expected.index,seed:expected.seed,choice:null,docs:[]},conversations:Array(24).fill(null)};
 const file=override=>{const str=JSON.stringify(override??payload);return{size:str.length,text:async()=>str}};
 return{...sut,original,expected,data,before,alerts,file,getRenders:()=>renderCount};
}
test("complete three-part import updates campaign and related notes together",async()=>{
 const h=fixture();await h.importSave(h.file());
 assert.deepEqual(h.getState(),h.expected);
 assert.deepEqual(JSON.parse(h.data.get("night-office-auditor-expanded:save:v3")),h.expected);
 assert.equal(JSON.parse(h.data.get("night-office-auditor-expanded:notes:v1")).index,h.expected.index);
 assert.equal(h.alerts.length,0);assert.equal(h.getRenders(),1);
});
test("each rejected write rolls back bundle and preserves game state",async()=>{
 for(const failAt of [1,2,3]){
  const h=fixture(failAt);await h.importSave(h.file());
  assert.deepEqual(h.getState(),h.original,"memory must remain on original case");
  assert.deepEqual([...h.data],[...h.before],"all prior storage keys must remain unchanged");
  assert.equal(h.alerts.length,1);
  assert.equal(h.getRenders(),0);
 }
});
test("invalid case metadata never modifies the active bundle",async()=>{
 const h=fixture(),bad={schema:G.VERSION,state:h.expected,
  notebook:{version:1,index:999,seed:h.expected.seed,choice:null,docs:[]},
  conversations:Array(24).fill(null)};
 await h.importSave(h.file(bad));
 assert.deepEqual([...h.data],[...h.before]);
 assert.deepEqual(h.getState(),h.original);
 assert.match(h.alerts.join(","),/メモ/);
});
