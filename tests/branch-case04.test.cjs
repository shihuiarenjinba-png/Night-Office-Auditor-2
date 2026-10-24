"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm");
const G=require("../src/branch-case04.js");
function play(actions){let s=G.initial();for(const a of actions)s=G.choose(s,a);return G.view(s);}
test("opening has three different routes and documented persons",()=>{
 const v=G.view(G.initial());assert.deepEqual(v.actions.map(x=>x.id),["site","accounts","confrontation"]);
 assert.equal(Object.keys(v.people).length,3);assert.equal(v.documents.length,0);
});
test("respectful route unlocks evidence and cooperative substantive ending",()=>{
 const v=play(["site","respect","protect","trace_id","verify_rule","clear"]);
 assert.equal(v.ending,"substantiated");assert.equal(v.documents.length,3);
 assert.match(v.epilogue,/次の案件/);assert.equal(v.staff.nakamura,2);
 assert.ok(v.history.some(x=>/発注の23分前/.test(x.text)));
});
test("demanding names changes character relation despite discovering same truth",()=>{
 const v=play(["accounts","demand","formal_copy","verify_rule","clear"]);
 assert.equal(v.ending,"substantiated");assert.equal(v.documents.length,3);
 assert.ok(v.staff.nakamura<0);assert.doesNotMatch(v.epilogue,/資料提供の申し出/);
});
test("early accusation creates a different scene and an accountable fallout",()=>{
 const v=play(["confrontation","rush_report","escalate"]);
 assert.equal(v.ending,"false_accusation");assert.equal(v.documents.length,0);
 assert.ok(v.pressure>=4);assert.match(v.epilogue,/訂正要請/);
});
test("unsubstantiated correct guess is not treated as proven",()=>{
 const v=play(["accounts","demand","skip_trace","clear"]);
 assert.equal(v.ending,"unsubstantiated");assert.equal(v.proven,false);
});
test("pending outcome remains unresolved rather than fabricated proof",()=>{
 const v=play(["site","pressure","demand","skip_trace","review"]);
 assert.equal(v.ending,"pending");assert.equal(v.documents.length,0);
});
test("formal verification after a retracted accusation is possible but costly",()=>{
 const v=play(["confrontation","withdraw","formal_copy","verify_rule","clear"]);
 assert.equal(v.ending,"substantiated");assert.equal(v.minutes,4);
 assert.ok(v.pressure>0);assert.ok(v.staff.nakamura<0);
});
test("invalid actions and tampered game saves are rejected",()=>{
 const s=G.initial();assert.throws(()=>G.choose(s,"verify_rule"),/選べない/);
 assert.throws(()=>G.replay({...s,actions:["confrontation","trace_id"]}),/一致/);
 assert.throws(()=>G.replay({...s,version:999}),/形式/);
 const finished=["site","respect","protect","trace_id","verify_rule","clear"].reduce((q,a)=>G.choose(q,a),s);
 assert.throws(()=>G.choose(finished,"clear"),/選べない/);
 assert.deepEqual(G.view(JSON.parse(JSON.stringify(finished))),G.view(finished));
});
test("no real-world evidence attribution is inferred from missing source documents",()=>{
 const v=play(["confrontation","rush_report","clear"]);
 assert.equal(v.proven,false);
 assert.equal(v.ending,"unsubstantiated");
});
test("HTML uses functioning tabs and segregated local save, without network access",()=>{
 const html=fs.readFileSync("branch-case04.html","utf8"),ui=fs.readFileSync("src/branch-case04-ui.js","utf8"),style=fs.readFileSync("branch-case04.css","utf8");
 for(const tab of ["scene","interview","records"]){assert.match(html,new RegExp('data-screen="'+tab+'"'));assert.match(html,new RegExp('data-tab="'+tab+'"'));}
 assert.match(html,/connect-src 'none'/);assert.match(ui,/night-office-expanded-case04-branch:v1/);
 assert.match(ui,/AudioContext/);assert.match(ui,/\.hidden=e\.dataset\.screen!==id/);
 assert.ok(style.includes("[hidden]"));assert.doesNotThrow(()=>new vm.Script(ui));
 assert.doesNotMatch(ui,/fetch\s*\(|XMLHttpRequest|sendBeacon/);
});

test("guided objective tells beginners exactly what to check at each stage",()=>{
 const start=G.view(G.initial());
 assert.match(start.guidance.caseQuestion,/正式に承認/);
 assert.match(start.guidance.heading,/最初の疑問/);
 assert.equal(start.guidance.milestones.length,3);
 assert.equal(start.guidance.milestones.filter(s=>s.ready).length,0);
 const doc=play(["accounts","protect"]);
 assert.equal(doc.guidance.milestones.filter(s=>s.ready).length,1);
 assert.match(doc.guidance.latest.title,/発注台帳/);
 assert.match(doc.guidance.latest.next,/EVT-044/);
 const clock=play(["accounts","protect","trace_id"]);
 assert.equal(clock.guidance.milestones.filter(s=>s.ready).length,2);
 assert.match(clock.guidance.heading,/代理権限|承認/);
 const all=play(["accounts","protect","trace_id","verify_rule"]);
 assert.equal(all.guidance.milestones.filter(s=>s.ready).length,3);
 assert.match(all.guidance.next,/3つの資料/);
});
test("a risky route has clear objectives and a document request fallback",()=>{
 const first=play(["confrontation","withdraw"]);
 assert.match(first.guidance.next,/承認ID/);
 assert.deepEqual(first.actions.map(x=>x.id),["formal_copy","skip_trace"]);
 const recovered=play(["confrontation","withdraw","formal_copy"]);
 assert.equal(recovered.documents.length,2);
 assert.match(recovered.guidance.latest.text,/23分前/);
});
test("guided UI shows immediate evidence implications, not only a separate notebook",()=>{
 const html=fs.readFileSync("branch-case04.html","utf8");
 const ui=fs.readFileSync("src/branch-case04-ui.js","utf8");
 for(const id of ["mainQuestion","proofSteps","guideHeading","guideNext","discovery"]){
   assert.match(html,new RegExp('id="'+id+'"'));
   assert.match(ui,new RegExp('\\$\\("'+id+'"\\)'));
 }
 assert.match(ui,/今回の調査で判明したこと/);
 assert.match(ui,/次の手がかり/);
 assert.match(ui,/報告後の事実照合/);
 assert.doesNotMatch(html,/今夜、あなたは誰を信用する/);
});

test("case starts with known facts and three explicit unanswered questions, not answers",()=>{
 const v=G.view(G.initial());
 assert.equal(v.guidance.unknowns.length,3);
 assert.equal(v.guidance.unknowns.filter(x=>x.resolved).length,0);
 assert.ok(v.guidance.known.some(x=>/42万円/.test(x)));
 assert.ok(v.guidance.known.some(x=>/署名.*ない/.test(x)));
 assert.ok(v.guidance.unknowns.some(x=>/発注前/.test(x.question)));
 assert.ok(v.guidance.unknowns.some(x=>/権限/.test(x.question)));
 assert.ok(!v.guidance.known.join(" ").includes("正式な代理承認"));
});
test("one unanswered question closes only when its own evidence is acquired",()=>{
 const one=play(["accounts","protect"]).guidance;
 assert.deepEqual(one.unknowns.map(x=>x.resolved),[true,false,false]);
 assert.match(one.unknowns[0].answer,/EVT-044/);
 assert.doesNotMatch(one.unknowns[0].answer,/正式に承認された/);
 const two=play(["accounts","protect","trace_id"]).guidance;
 assert.deepEqual(two.unknowns.map(x=>x.resolved),[true,true,false]);
 const all=play(["accounts","protect","trace_id","verify_rule"]).guidance;
 assert.deepEqual(all.unknowns.map(x=>x.resolved),[true,true,true]);
});
test("optional routes retain explicitly unresolved questions rather than fabricating answers",()=>{
 const v=play(["confrontation","rush_report","clear"]).guidance;
 assert.equal(v.unknowns.filter(x=>x.resolved).length,0);
 const h=fs.readFileSync("branch-case04.html","utf8");
 const ui=fs.readFileSync("src/branch-case04-ui.js","utf8");
 for(const id of ["caseKnown","caseUnknowns","sceneLead"]){
   assert.ok(h.includes('id="'+id+'"'));
   assert.ok(ui.includes('$("'+id+'")'));
 }
 assert.ok(h.includes("解決するために、まだ分からないこと"));
 assert.ok(!h.includes("署名が消えていた"));
});
