"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),G=require("../src/engine.js");
test("expanded edition has 24 distinct fictional cases with location/story/signature",()=>{
 assert.equal(G.CASE_COUNT,24);assert.equal(G.SCENARIOS.length,24);
 const titles=new Set(G.SCENARIOS.map(x=>x.title));assert.equal(titles.size,24);
 for(const s of G.SCENARIOS){assert.ok(s.location&&s.story&&s.note&&s.chapter);}
 const state=G.initial(20261024),c=G.current(state);
 assert.equal(c.caseNumber,1);assert.match(c.location,/架空/);assert.ok(c.signature.length>5);
});
test("24-case truth distribution stays balanced",()=>{
 const counts=[0,0,0];for(let i=0;i<G.CASE_COUNT;i++)counts[G.spec(20261024,i).truth]++;
 assert.deepEqual(counts,[8,8,8]);
});
test("evidence consumes time and no more than two sources can be checked",()=>{
 let s=G.initial();s=G.inspect(s,"ledger").state;assert.equal(s.active.minutesLeft,7);
 s=G.inspect(s,"timeline").state;assert.equal(s.active.minutesLeft,3);
 assert.throws(()=>G.inspect(s,"approval"),/時間/);
});
test("a judgment advances the campaign and survives validation",()=>{
 let s=G.initial();s=G.inspect(s,"ledger").state;const out=G.decide(s,"review");
 assert.equal(out.state.index,1);assert.equal(out.report.caseNumber,1);assert.doesNotThrow(()=>G.validate(out.state));
});
test("24 cases can be completed with deterministic valid saves",()=>{
 let s=G.initial(24680);for(let i=0;i<G.CASE_COUNT;i++){s=G.inspect(s,"ledger").state;s=G.decide(s,i%3===0?"clear":i%3===1?"review":"escalate").state;}
 assert.equal(s.complete,true);assert.equal(s.index,24);assert.equal(G.current(s).processed,24);
});
