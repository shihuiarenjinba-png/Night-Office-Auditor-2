"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm");
const G=require("../src/evidence-pairs-case04.js");
const reveal=(s,id)=>G.apply(s,{type:"reveal",id});
const link=(s,a,b)=>G.apply(s,{type:"link",a,b});
test("six named clues are always available, not randomly assigned",()=>{
 assert.equal(G.CARDS.length,6);assert.equal(G.PAIRS.length,3);
 assert.equal(new Set(G.CARDS.map(c=>c.id)).size,6);
 assert.equal(G.view(G.initial()).progress,0);
 assert.equal(G.view(G.initial()).cards.filter(c=>c.revealed).length,0);
 assert.deepEqual(G.initial(),G.initial());
});
test("flipped evidence remains visible and never returns to face down",()=>{
 let s=G.initial();s=reveal(s,"A");let v=G.view(s);
 assert.equal(v.cards.find(c=>c.id==="A").revealed,true);
 s=reveal(s,"B");v=G.view(s);
 assert.equal(v.cards.filter(c=>c.revealed).length,2);
 assert.equal(v.questions.filter(x=>x.completed).length,0);
 assert.throws(()=>reveal(s,"A"),/不正な証拠めくり/);
});
test("wrong matches do not erase cards, subtract time, or block progress",()=>{
 let s=G.initial();s=reveal(s,"A");s=reveal(s,"E");s=link(s,"A","E");
 const v=G.view(s);assert.equal(v.wrong,1);assert.equal(v.opened,2);assert.equal(v.progress,0);
 assert.equal(v.cards.filter(c=>c.revealed).length,2);
 s=reveal(s,"B");s=link(s,"A","B");
 assert.equal(G.view(s).progress,1);
 assert.equal(G.view(s).wrong,1);
});
test("each of three linked pairs resolves precisely one question with a reason",()=>{
 let s=G.initial();
 for(const id of ["A","E","C","F","B","D"])s=reveal(s,id);
 assert.equal(G.view(s).opened,6);
 for(const [a,b] of [["D","C"],["A","B"],["F","E"]]){
  s=link(s,a,b);
  const v=G.view(s);
  assert.equal(v.questions.filter(q=>q.completed).length,v.progress);
  assert.ok(v.questions.filter(q=>q.completed).every(q=>q.answer&&q.documentIds.length===2));
 }
 assert.equal(G.view(s).progress,3);
 assert.equal(G.view(s).hints.length,0);
 assert.throws(()=>link(s,"A","B"),/解明済み/);
});
test("report is unavailable until all 3 links are resolved",()=>{
 const s=G.initial();assert.throws(()=>G.apply(s,{type:"report",choice:"clear"}),/関連付け/);
 let a=s;for(const c of G.CARDS)a=reveal(a,c.id);
 for(const p of G.PAIRS)a=link(a,p.cards[0],p.cards[1]);
 for(const choice of ["clear","review","escalate"]){
  const end=G.apply(a,{type:"report",choice}),v=G.view(end);
  assert.equal(v.verdict,choice);assert.ok(v.ending.length>30);
  assert.match(v.finalReason,/23分前/);assert.throws(()=>reveal(end,"Z"),/報告後/);
 }
});
test("save log replay is deterministic and invalid IDs cannot fabricate progress",()=>{
 let s=G.initial();s=reveal(s,"A");s=reveal(s,"B");s=link(s,"A","B");
 assert.deepEqual(G.view(JSON.parse(JSON.stringify(s))),G.view(s));
 assert.throws(()=>G.view({...s,version:22}),/不正/);
 assert.throws(()=>G.view({...s,actions:[{type:"link",a:"A",b:"B"}]}),/未公開/);
 assert.throws(()=>G.view({...s,actions:[{type:"reveal",id:"Q"}]}),/不正/);
});
test("standalone UI keeps real tabs and isolated local-save key without remote resources",()=>{
 const html=fs.readFileSync("evidence-pairs-case04.html","utf8");
 const js=fs.readFileSync("src/evidence-pairs-case04-ui.js","utf8");
 for(const id of ["board","notes","report"]){assert.ok(html.includes('data-tab="'+id+'"'));assert.ok(html.includes('data-screen="'+id+'"'));}
 for(const id of ["questions","cards","connect","hint","findings","finalReport"]){assert.ok(html.includes('id="'+id+'"'));}
 assert.match(html,/connect-src 'none'/);assert.match(html,/まだ分からないこと/);
 assert.match(js,/night-office-case04-evidence-pairs:v1/);assert.match(js,/AudioContext/);
 assert.doesNotMatch(js,/fetch\(|XMLHttpRequest|sendBeacon/);
 assert.doesNotThrow(()=>new vm.Script(js));
});
