"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm");
const G=require("../src/engine.js"),Q=require("../src/paid-questions.js"),proof=require("../src/case-proofbook.js");
test("24 individual reasoning questions match precisely 24 authored evidence ledgers",()=>{
 assert.equal(Q.length,24);
 const uniq=new Set();
 for(let i=0;i<24;i++){
  const q=Q[i],p=proof[i];
  assert.equal(q.caseId,p.code);
  assert.ok(q.question.length>=10);
  assert.equal(q.options.length,3);
  assert.deepEqual(q.options.map(x=>x.id),["clear","review","escalate"]);
  assert.equal(new Set(q.options.map(x=>x.label)).size,3);
  assert.ok(q.options.every(x=>x.label.length>=8));
  assert.equal(G.spec(20261024,i).title.length>0,true);
  uniq.add(q.question);
 }
 assert.equal(uniq.size,24);
});
test("paid deduction screen displays player evidence and multiple-choice submission, not development pipeline",()=>{
 const html=fs.readFileSync("index.html","utf8"),script=fs.readFileSync("src/app.js","utf8");
 for(const id of ["caseQuestion","selectedDocuments","submitDecision","choices","sources","findings"]){
  assert.ok(html.includes('id="'+id+'"'),id);
 }
 assert.match(html,/src\/paid-questions\.js/);
 assert.match(script,/type="checkbox"/);
 assert.match(script,/type="radio"/);
 assert.match(script,/night-office-auditor-expanded:notes:v1/);
 assert.match(script,/out\.report|G\.decide/);
 for(const exposed of ["QA_UNSIGNED","Store Identity","MSIX","WACK","GitHub Actions","開発工程","残工程","デバッグ"]){
  assert.ok(!html.includes(exposed),"internal release term must not be player-facing: "+exposed);
 }
 assert.doesNotThrow(()=>new vm.Script(script));
});
test("no factual evidence truth is exposed before judgment",()=>{
 let state=G.initial();
 for(let i=0;i<24;i++){
  const current=G.current(state),p=proof[i];
  assert.equal(Object.hasOwn(current,"truth"),false);
  assert.equal(Object.hasOwn(current,"conclusion"),false);
  assert.equal(current.findings.length,0);
  const a=G.inspect(state,"ledger");
  assert.equal(a.finding.detail,p.evidence.ledger.detail);
  assert.ok(!Object.hasOwn(G.current(a.state),"truth"));
  state=G.decide(state,"review").state;
 }
 assert.equal(state.complete,true);
});
test("all cases permit a supported documentary decision without impossible reveal budgets",()=>{
 for(let i=0;i<24;i++){
  let s=G.initial();
  for(let j=0;j<i;j++)s=G.decide(s,"review").state;
  const req=proof[i].required,other=G.SOURCES.find(x=>!req.includes(x.id)).id;
  const docs=[...new Set([...req,other])].slice(0,2);
  for(const id of docs)s=G.inspect(s,id).state;
  const verdict=["clear","review","escalate"][proof[i].verdict];
  const out=G.decide(s,verdict);
  assert.equal(out.report.correct,true);
  assert.equal(out.report.supported,true,"case "+(i+1)+" must be provable with two inspected docs");
 }
});
test("legacy 24-case save remains valid while new notebook is a separate UI data store",()=>{
 const s=G.decide(G.inspect(G.initial(),"ledger").state,"review").state;
 const saved=JSON.stringify(s);
 assert.deepEqual(G.validate(JSON.parse(saved)),s);
 assert.equal(s.version,3);
});
