"use strict";
const {chromium}=require("playwright"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),url=require("node:url");
const dir=path.resolve("evidence-pairs-ui-review");fs.mkdirSync(dir,{recursive:true});
const entry=url.pathToFileURL(path.resolve("evidence-pairs-case04.html")).href;
(async()=>{
 const browser=await chromium.launch({headless:true});const errors=[],network=[];
 const hook=p=>{p.on("pageerror",e=>errors.push(e.message));p.on("request",r=>{if(/^https?:/.test(r.url()))network.push(r.url());});p.on("dialog",d=>d.accept());};
 const shot=(p,name)=>p.screenshot({path:path.join(dir,name),fullPage:true});
 try{
  const context=await browser.newContext({viewport:{width:1280,height:720}});
  const p=await context.newPage();hook(p);await p.goto(entry,{waitUntil:"load"});
  const card=name=>p.locator(".evidence-card").filter({hasText:name});
  assert.equal(await card("紙の発注書").count(),1);
  assert.equal(await p.locator(".evidence-card").count(),8);
  assert.equal(await p.locator("#budget").innerText(),"0 / 6");
  assert.equal(await p.locator("#finalReport").isVisible(),false);
  await shot(p,"01-1280-card-fronts.png");
  async function hypothesis(question,a,b,answer){
   await p.locator('[data-tab="board"]').click();
   await card(a).click();await card(b).click();
   await p.locator("#targetQuestion").selectOption(question);
   await p.locator("#connect").click();
   assert.equal(await p.locator('[data-screen="notes"]').isVisible(),true);
   await p.getByRole("radio",{name:answer}).check();
   assert.equal(await p.locator("#finalReport").isVisible(),false);
  }
  await hypothesis("approval","紙の発注書","購買台帳の登録行","別の承認記録が存在する");
  assert.equal(await p.locator("#budget").innerText(),"2 / 6");
  assert.match(await p.locator("#questions").innerText(),/仮説を記録済み/);
  assert.doesNotMatch(await p.locator("#questions").innerText(),/正しい回答：|照合に必要な資料/);
  await shot(p,"02-1280-player-first-hypothesis.png");
  await hypothesis("timing","発注処理の記録","承認処理の記録","発注前に承認されていた");
  await hypothesis("authority","業務規程・第3条","電子署名の検証票","必要な代理承認権限があった");
  assert.equal(await p.locator("#budget").innerText(),"6 / 6");
  assert.equal(await p.locator("#remaining").innerText(),"回答準備 3 / 3");
  await shot(p,"03-1280-three-choices-before-submit.png");
  await p.locator('[data-tab="board"]').click();
  assert.equal(await card("現場主任からのメール").isDisabled(),true);
  await p.locator('[data-tab="report"]').click();
  assert.equal(await p.locator('[data-verdict="clear"]').isEnabled(),true);
  assert.equal(await p.locator("#finalReport").isVisible(),false);
  await shot(p,"04-1280-report-choice-no-spoiler.png");
  await p.locator('[data-verdict="clear"]').click();
  assert.equal(await p.locator("#finalReport").isVisible(),true);
  assert.match(await p.locator("#finalReport").innerText(),/正しい回答/);
  assert.match(await p.locator("#finalReport").innerText(),/23分前/);
  assert.match(await p.locator("#finalReport").innerText(),/証拠と回答が一致/);
  await shot(p,"05-1280-post-submit-reasons.png");

  const other=await browser.newContext({viewport:{width:1280,height:720}});
  const q=await other.newPage();hook(q);await q.goto(entry,{waitUntil:"load"});
  for(const name of ["現場主任からのメール","機材の納品確認票","紙の発注書","購買台帳の登録行","発注処理の記録","承認処理の記録"])
    await q.locator(".evidence-card").filter({hasText:name}).click();
  assert.equal(await q.locator("#budget").innerText(),"6 / 6");
  await q.locator('[data-tab="report"]').click();
  assert.equal(await q.locator('[data-verdict="clear"]').isDisabled(),true);
  assert.equal(await q.locator('[data-verdict="review"]').isEnabled(),true);
  await shot(q,"06-1280-evidence-limited.png");
  await q.locator('[data-verdict="review"]').click();
  assert.match(await q.locator("#finalReport").innerText(),/追加資料/);
  await shot(q,"07-1280-review-after-submission.png");

  const narrow=await browser.newContext({viewport:{width:1024,height:768}});
  const n=await narrow.newPage();hook(n);await n.goto(entry,{waitUntil:"load"});
  assert.equal(await n.locator(".evidence-card").count(),8);
  await shot(n,"08-1024-opening.png");
  assert.deepEqual(errors,[]);assert.deepEqual(network,[]);
  const summary={status:"PASS",cards:8,revealLimit:6,playerChoosesQuestionAndEvidence:true,
   playerChoosesThreeAnswers:true,spoilersBeforeSubmit:false,gradingAfterSubmit:true,
   incompleteInvestigationReview:true,tabSwitch:true,screenshots:8,viewports:["1280x720","1024x768"],
   pageErrors:errors,remoteRequests:network,scope:"Chromium standalone HTML only; not Windows Electron/MSIX installation"};
  fs.writeFileSync(path.join(dir,"DEDUCTIONS_BROWSER_QA.json"),JSON.stringify(summary,null,2)+"\n");
  console.log("PLAYER_DEDUCTIONS_BROWSER_PASS "+JSON.stringify(summary));
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
