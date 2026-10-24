"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const G=require("../src/engine.js"),book=require("../src/case-proofbook.js");
test("all 24 cases have source-specific documentary proof, limits and stable outcomes",()=>{
 assert.equal(book.length,24);
 const distribution=[0,0,0],ids=new Set();
 for(let i=0;i<24;i++){
  const p=book[i],a=G.spec(20261024,i),other=G.spec(99999,i);
  distribution[p.verdict]++;
  assert.equal(a.truth,p.verdict,"authored verdict for "+p.code);
  assert.equal(a.truth,other.truth,"not randomized by seed "+p.code);
  assert.equal(p.code,"N"+String(i+1).padStart(2,"0"));
  assert.ok(["ledger","timeline","approval"].includes(p.primary));
  assert.ok(p.conclusion.length>=20&&p.alternative.length>=15&&p.limits.length>=12);
  for(const source of G.SOURCES){
   const doc=p.evidence[source.id];
   assert.ok(doc.detail.length>=20,doc.id);
   assert.ok(!ids.has(doc.id),"duplicate "+doc.id);
   assert.match(doc.id,/^N[0-9]{2}-[LTA]$/);ids.add(doc.id);
  }
 }
 assert.deepEqual(distribution,[8,8,8]);assert.equal(ids.size,72);
});
test("inspection exposes exactly the selected case document, not hidden conclusions",()=>{
 for(let i=0;i<24;i++){
  let s=G.initial(20261024);
  for(let j=0;j<i;j++)s=G.decide(s,"review").state;
  const source=G.SOURCES[i%3].id,expected=book[i].evidence[source];
  const result=G.inspect(s,source);
  assert.equal(result.finding.documentId,expected.id);
  assert.equal(result.finding.detail,expected.detail);
  assert.equal(G.current(result.state).findings[0].detail,expected.detail);
  assert.ok(!Object.hasOwn(G.current(result.state),"truth"),"truth cannot be in current view");
 }
});
test("post-judgment report traces evidence, flags uninspected records, avoids unsupported personal blame",()=>{
 let s=G.initial(24680);const p=book[23];
 for(let i=0;i<23;i++)s=G.decide(s,"review").state;
 let chosen=[p.primary,...G.SOURCES.map(q=>q.id).filter(id=>id!==p.primary).slice(0,1)];
 s=G.inspect(s,chosen[0]).state;s=G.inspect(s,chosen[1]).state;
 const out=G.decide(s,G.CHOICES[p.verdict].id),r=out.report;
 assert.equal(r.supported,true);assert.equal(r.actual,"問題あり と判断する");
 assert.equal(r.postReviewDocuments.length,3);
 assert.deepEqual(r.reviewedDocumentIds,chosen.map(id=>p.evidence[id].id));
 assert.equal(r.primaryDocument,p.evidence[p.primary].id);
 assert.match(r.proofExplanation,/認証|本人|改訂/);
 assert.match(r.attributionLimits,/動機|共犯|金品/);
 assert.equal(r.postReviewDocuments.filter(x=>x.reviewed).length,2);
 assert.equal(out.state.complete,true);
});
test("an accurate guess without corroboration is explicitly unsubstantiated",()=>{
 const s=G.initial(),r=G.decide(s,G.CHOICES[book[0].verdict].id).report;
 assert.equal(r.correct,true);assert.equal(r.supported,false);
 assert.match(r.message,/裏付けが不十分/);
});
test("new save schema stays distinct from the old prototype",()=>{
 assert.equal(G.VERSION,3);
 const cur=G.initial();
 assert.equal(G.validate(cur).version,3);
 assert.throws(()=>G.validate({...cur,version:2}),/セーブ形式/);
});
