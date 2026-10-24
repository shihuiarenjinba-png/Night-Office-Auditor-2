"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const G=require("../src/deduction-campaign.js");
const run=(s,a)=>G.apply(s,a);
function solve(s,id,pairIndex=0){
 s=run(s,{type:"approach",caseId:id,choice:pairIndex?"confront":"cooperate"});
 const cfg=G.CASES.find(x=>x.id===id),opened=new Set();
 for(const q of cfg.questions)for(const c of q.proofs[pairIndex])opened.add(c);
 for(const cardId of opened)s=run(s,{type:"open",caseId:id,cardId});
 for(const q of cfg.questions){
  const [first,second]=q.proofs[pairIndex];
  s=run(s,{type:"assign",caseId:id,questionId:q.id,first,second});
  s=run(s,{type:"answer",caseId:id,questionId:q.id,choice:q.correct});
 }
 const answer=id==="05"?"escalate":"clear";
 s=run(s,{type:"report",caseId:id,choice:answer});
 return s;
}
test("campaign offers exactly 3 authored cases and a 6-card cap",()=>{
 const v=G.view(G.initial());assert.deepEqual(v.unlocked,["01"]);assert.equal(v.cardLimit,6);
 assert.equal(v.cases.length,3);assert.equal(new Set(v.cases.map(c=>c.id)).size,3);
 for(const c of v.cases){assert.equal(c.cards.length,8);assert.equal(c.questions.length,2);assert.equal(c.remaining,6);}
});
test("each case has at least two independent four-card ways to prove essentials",()=>{
 for(const c of G.CASES){
  for(const idx of [0,1]){
   const ids=new Set(c.questions.flatMap(q=>q.proofs[idx]));
   assert.equal(ids.size,4, c.id+" alternate path "+idx);
   assert.ok(ids.size<G.REVEAL_LIMIT);
   for(const q of c.questions)assert.equal(q.proofs.length,2);
  }
 }
});
test("Case 01 unlocks both 04 and 05 without fixing their order",()=>{
 const a=solve(G.initial(),"01"),v=G.view(a);
 assert.deepEqual(v.unlocked,["01","04","05"]);assert.equal(v.completed,1);
 assert.equal(v.cases[0].proved,true);
 const first=solve(a,"05");assert.equal(G.view(first).cases[2].proved,true);
 const second=solve(first,"04");assert.equal(G.view(second).completed,3);
 const other=solve(solve(a,"04"),"05");
 assert.equal(G.view(other).completed,3);
});
test("answers and correct document links are hidden until report",()=>{
 let s=G.initial();s=run(s,{type:"approach",caseId:"01",choice:"cooperate"});
 s=run(s,{type:"open",caseId:"01",cardId:"A"});
 s=run(s,{type:"open",caseId:"01",cardId:"B"});
 s=run(s,{type:"assign",caseId:"01",questionId:"record",first:"A",second:"B"});
 let v=G.view(s);assert.equal(v.cases[0].questions[0].answer,null);
 assert.equal(v.cases[0].questions[0].correctChoice,undefined);
 assert.equal(v.cases[0].questions[0].allowedPairs,undefined);
 assert.equal(v.cases[0].questions[0].explain,undefined);
 s=run(s,{type:"answer",caseId:"01",questionId:"record",choice:"yes"});
 v=G.view(s);assert.equal(v.cases[0].questions[0].correctChoice,undefined);
 assert.equal(v.cases[0].caseExplanation,undefined);
});
test("correct answer on wrong documents is not substantiated",()=>{
 let s=G.initial();s=run(s,{type:"approach",caseId:"01",choice:"cooperate"});
 for(const id of ["A","B","D","E"])s=run(s,{type:"open",caseId:"01",cardId:id});
 s=run(s,{type:"assign",caseId:"01",questionId:"record",first:"A",second:"D"});
 s=run(s,{type:"answer",caseId:"01",questionId:"record",choice:"yes"});
 s=run(s,{type:"assign",caseId:"01",questionId:"cancel",first:"D",second:"E"});
 s=run(s,{type:"answer",caseId:"01",questionId:"cancel",choice:"offset"});
 s=run(s,{type:"report",caseId:"01",choice:"clear"});
 const v=G.view(s);assert.equal(v.cases[0].proved,false);
 assert.equal(v.cases[0].questions[0].correctAnswer,true);
 assert.equal(v.cases[0].questions[0].correctPair,false);
});
test("six-card cap and incomplete review safely progress the campaign",()=>{
 let s=G.initial();s=run(s,{type:"approach",caseId:"01",choice:"confront"});
 for(const id of ["A","B","C","D","G","H"])s=run(s,{type:"open",caseId:"01",cardId:id});
 assert.throws(()=>run(s,{type:"open",caseId:"01",cardId:"E"}),/6枚/);
 assert.throws(()=>run(s,{type:"report",caseId:"01",choice:"clear"}),/断定/);
 s=run(s,{type:"report",caseId:"01",choice:"review"});
 assert.deepEqual(G.view(s).unlocked,["01","04","05"]);
 assert.throws(()=>run(s,{type:"open",caseId:"01",cardId:"E"}),/報告済み/);
});
test("bonus records can be found with spare card slots",()=>{
 let s=G.initial();s=solve(s,"01");const c=G.view(s).cases[0];
 assert.equal(c.bonus.revealed,false);
 assert.equal(c.proved,true);
});
test("cross-case verdict distinguishes genuine unauthorized change from canceled entries",()=>{
 let s=solve(G.initial(),"01");
 s=solve(s,"04");s=solve(s,"05");
 const before=G.view(s);assert.equal(before.finale,null);
 assert.throws(()=>run(G.initial(),{type:"final",choice:"distinguish"}),/全事件/);
 s=run(s,{type:"final",choice:"distinguish"});
 const after=G.view(s);assert.doesNotMatch(after.finalReport,/T-7/);
 assert.match(after.finalReport,/自然人|人物/);
 assert.match(after.finalReport,/重大な不一致/);
 assert.throws(()=>run(s,{type:"final",choice:"accuse_all"}),/操作履歴/);
});
test("persisted campaign is replay-safe and rejects injected proofs and stages",()=>{
 let s=solve(G.initial(),"01");assert.deepEqual(G.view(JSON.parse(JSON.stringify(s))),G.view(s));
 assert.throws(()=>G.view({...s,version:99}),/形式/);
 assert.throws(()=>G.view({version:1,actions:[{type:"answer",caseId:"01",questionId:"record",choice:"yes"}]}),/根拠/);
 assert.throws(()=>G.view({version:1,actions:[{type:"open",caseId:"05",cardId:"A"}]}),/第1事件/);
});

test("cross-case final summary cites shared terminal only when the player saw those sources",()=>{
 let state=solve(G.initial(),"01");
 state=solve(state,"04");
 state=solve(state,"05");
 assert.equal(G.view(state).finale,null);
 const unseen=G.view(G.apply(state,{type:"final",choice:"distinguish"}));
 assert.doesNotMatch(unseen.finalReport,/T-7/);
});

test("character choices persist across cases, changing future scenes without changing truth",()=>{
 let cooperative=solve(G.initial(),"01");
 let confront=G.initial();
 confront=G.apply(confront,{type:"approach",caseId:"01",choice:"confront"});
 confront=G.apply(confront,{type:"report",caseId:"01",choice:"review"});
 const a=G.view(cooperative),b=G.view(confront);
 assert.notEqual(a.cases[1].story.voice,b.cases[1].story.voice);
 assert.match(a.cases[1].story.voice,/前回|一緒/);
 assert.match(b.cases[1].story.voice,/前回|追及|照会/);
 assert.notEqual(a.trust,b.trust);
 assert.equal(a.cases[1].questions[0].text,b.cases[1].questions[0].text);
 assert.equal(a.cases[1].questions[0].correctChoice,undefined);
});
test("case 05 hidden terminal remains secret until relevant cards are opened",()=>{
 let s=solve(G.initial(),"01");
 s=G.apply(s,{type:"approach",caseId:"05",choice:"cooperate"});
 assert.doesNotMatch(G.view(s).cases[2].story.callback,/T-7/);
 s=G.apply(s,{type:"open",caseId:"05",cardId:"G"});
 assert.match(G.view(s).cases[2].story.callback,/T-7/);
 assert.doesNotMatch(G.view(s).cases[2].story.callback,/複数人/);
 s=G.apply(s,{type:"open",caseId:"05",cardId:"H"});
 assert.match(G.view(s).cases[2].story.callback,/複数人/);
});
test("final report retains relationship consequences separate from factual case verdict",()=>{
 let cooperative=solve(solve(solve(G.initial(),"01"),"04"),"05");
 let adversarial=G.initial();
 adversarial=G.apply(adversarial,{type:"approach",caseId:"01",choice:"confront"});
 adversarial=G.apply(adversarial,{type:"report",caseId:"01",choice:"review"});
 for(const id of ["04","05"]){
   adversarial=G.apply(adversarial,{type:"approach",caseId:id,choice:"confront"});
   adversarial=G.apply(adversarial,{type:"report",caseId:id,choice:"review"});
 }
 const a=G.view(G.apply(cooperative,{type:"final",choice:"distinguish"}));
 const b=G.view(G.apply(adversarial,{type:"final",choice:"distinguish"}));
 assert.ok(a.trust>b.trust);
 assert.notEqual(a.teamwork,b.teamwork);
 assert.match(a.finalReport,/口座変更/);
 assert.match(b.finalReport,/口座変更/);
 assert.ok(a.finalReport.includes(a.teamwork));
 assert.ok(b.finalReport.includes(b.teamwork));
});
