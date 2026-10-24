"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm");
const G=require("../src/evidence-pairs-case04.js");
const act=(s,a)=>G.apply(s,a),open=(s,id)=>act(s,{type:"reveal",id});
const pair=(s,q,a,b)=>act(s,{type:"assign",question:q,a,b});
const choice=(s,q,answer)=>act(s,{type:"choose",question:q,answer});
const full=()=>{
 let s=G.initial();
 for(const id of ["A","B","C","D","E","F"])s=open(s,id);
 for(const [q,a,b,answer] of [["approval","A","B","yes"],["timing","C","D","before"],["authority","E","F","authorized"]]){
  s=pair(s,q,a,b);s=choice(s,q,answer);
 }
 return s;
};
test("eight fixed cards, six-reveal cap, and three explicit questions",()=>{
 const v=G.view(G.initial());assert.equal(G.VERSION,3);
 assert.equal(v.cards.length,8);assert.equal(v.cardLimit,6);assert.equal(v.questions.length,3);
 assert.equal(v.opened,0);assert.equal(v.readyToConclude,false);
});
test("card backs have raw observations and no solution text",()=>{
 const v=G.view(G.initial());
 for(const c of v.cards){assert.equal(c.revealed,false);assert.ok(c.category);assert.ok(c.title);}
 const descriptions=G.CARDS.map(x=>x.detail).join(" ");
 assert.doesNotMatch(descriptions,/正式な承認|正当な承認|だから|すなわち|無断発注ではない|真相は/);
 assert.match(descriptions,/20:48/);assert.match(descriptions,/20:25/);
});
test("revealing cards never returns an answer, grading, outcome, or conclusion",()=>{
 let s=G.initial();
 s=open(s,"A");s=open(s,"B");
 const v=G.view(s);
 assert.equal(v.opened,2);
 assert.equal(v.evaluation,null);assert.equal(v.outcome,null);assert.equal(v.submitted,false);
 assert.equal(v.questions[0].assigned,null);assert.equal(v.questions[0].answer,null);
 assert.ok(!Object.hasOwn(v,"finalReason"));
 assert.throws(()=>open(s,"A"),/無効/);
});
test("player assigns a pair to a specific question without immediate validation",()=>{
 let s=G.initial();s=open(s,"A");s=open(s,"E");
 s=pair(s,"timing","A","E");
 let v=G.view(s);
 assert.deepEqual(v.questions[1].assignedIds,["A","E"]);
 assert.equal(v.questions[1].answer,null);assert.equal(v.evaluation,null);
 s=choice(s,"timing","before");
 v=G.view(s);
 assert.equal(v.questions[1].answer,"before");
 assert.equal(v.evaluation,null);
 assert.equal(v.readyToConclude,false);
});
test("player can change evidence pair and choice before submission",()=>{
 let s=G.initial();for(const id of ["A","B","C","D"])s=open(s,id);
 s=pair(s,"approval","A","C");s=choice(s,"approval","no");
 s=pair(s,"approval","A","B");s=choice(s,"approval","yes");
 const v=G.view(s);assert.deepEqual(v.questions[0].assignedIds,["A","B"]);
 assert.equal(v.questions[0].answer,"yes");
 assert.equal(v.evaluation,null);
});
test("assignments require two distinct revealed documents and choosing requires assignment",()=>{
 let s=G.initial();s=open(s,"A");
 assert.throws(()=>pair(s,"approval","A","B"),/開いた2枚/);
 assert.throws(()=>pair(s,"approval","A","A"),/開いた2枚/);
 assert.throws(()=>choice(s,"approval","yes"),/先に/);
});
test("opening limit cannot be exceeded even by tampering save actions",()=>{
 let s=G.initial();for(const id of ["A","B","C","D","E","F"])s=open(s,id);
 assert.equal(G.view(s).remaining,0);assert.throws(()=>open(s,"G"),/6枚/);
 const corrupted={...s,actions:[...s.actions,{type:"reveal",id:"H"}]};
 assert.throws(()=>G.view(corrupted),/6枚/);
});
test("full correct hypothesis is graded only after explicit final report",()=>{
 const s=full();let v=G.view(s);
 assert.equal(v.readyToConclude,true);assert.equal(v.evaluation,null);
 s.actions.forEach(a=>assert.notEqual(a.type,"report"));
 const done=act(s,{type:"report",verdict:"clear"});v=G.view(done);
 assert.equal(v.submitted,true);assert.equal(v.report,"clear");
 assert.equal(v.substantiated,true);assert.equal(v.evaluation.length,3);
 assert.ok(v.evaluation.every(x=>x.substantiated&&x.explanation.length>20));
 assert.match(v.outcome,/立証/);
 assert.throws(()=>open(done,"G"),/操作履歴/);
});
test("guessing a correct choice with wrong evidence does not prove the claim",()=>{
 let s=G.initial();for(const id of ["A","B","C","D","E","F"])s=open(s,id);
 for(const [q,a,b,answer] of [["approval","A","C","yes"],["timing","C","D","before"],["authority","E","F","authorized"]]){
  s=pair(s,q,a,b);s=choice(s,q,answer);
 }
 assert.equal(G.view(s).evaluation,null);
 const result=G.view(act(s,{type:"report",verdict:"clear"}));
 assert.equal(result.substantiated,false);
 assert.equal(result.evaluation[0].correctAnswer,true);
 assert.equal(result.evaluation[0].correctEvidence,false);
});
test("wrong choice gets explained after report, but not beforehand",()=>{
 let s=full();s=choice(s,"approval","no");
 const before=G.view(s);assert.equal(before.evaluation,null);
 const after=G.view(act(s,{type:"report",verdict:"clear"}));
 assert.equal(after.evaluation[0].correctEvidence,true);
 assert.equal(after.evaluation[0].correctAnswer,false);
 assert.match(after.evaluation[0].correctLabel,/存在/);
});
test("limited-information player can file an explicit review without guessing",()=>{
 let s=G.initial();for(const id of ["A","C","E","G","H","B"])s=open(s,id);
 assert.throws(()=>act(s,{type:"report",verdict:"clear"}),/すべての疑問/);
 const review=G.view(act(s,{type:"report",verdict:"review"}));
 assert.equal(review.submitted,true);assert.equal(review.report,"review");
 assert.ok(review.evaluation.every(x=>!x.substantiated));
 assert.match(review.outcome,/追加資料/);
});
test("state and grading are deterministic on JSON replay, old saves are isolated",()=>{
 let s=full();s=act(s,{type:"report",verdict:"clear"});
 assert.deepEqual(G.view(JSON.parse(JSON.stringify(s))),G.view(s));
 assert.throws(()=>G.view({...s,version:2}),/形式/);
});
test("HTML presents choice controls and cannot show grading before submission",()=>{
 const html=fs.readFileSync("evidence-pairs-case04.html","utf8");
 const ui=fs.readFileSync("src/evidence-pairs-case04-ui.js","utf8");
 for(const id of ["board","notes","report"]){assert.ok(html.includes('data-tab="'+id+'"'));assert.ok(html.includes('data-screen="'+id+'"'));}
 for(const id of ["targetQuestion","connect","cards","findings","finalReport"]){assert.ok(html.includes('id="'+id+'"'));}
 assert.match(ui,/type="radio"/);assert.match(ui,/night-office-case04-player-deductions:v3/);
 assert.match(ui,/if\(v\.submitted\)/);assert.match(html,/connect-src 'none'/);
 assert.doesNotMatch(ui,/fetch\s*\(|XMLHttpRequest|sendBeacon/);
 assert.doesNotThrow(()=>new vm.Script(ui));
});
