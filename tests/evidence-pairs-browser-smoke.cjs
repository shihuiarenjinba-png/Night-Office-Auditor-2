"use strict";
const {chromium}=require("playwright"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),url=require("node:url");
const output=path.resolve("evidence-pairs-ui-review");fs.mkdirSync(output,{recursive:true});
const entry=url.pathToFileURL(path.resolve("evidence-pairs-case04.html")).href;
(async()=>{
 const browser=await chromium.launch({headless:true}),jsErrors=[],remote=[];
 const attach=page=>{page.on("pageerror",e=>jsErrors.push(e.message));page.on("request",req=>{if(/^https?:/.test(req.url()))remote.push(req.url());});page.on("dialog",d=>d.accept());};
 const shot=(page,name)=>page.screenshot({path:path.join(output,name),fullPage:true});
 try{
  const context=await browser.newContext({viewport:{width:1280,height:720}});
  const page=await context.newPage();attach(page);await page.goto(entry,{waitUntil:"load"});
  const card=name=>page.locator(".evidence-card").filter({hasText:name});
  assert.equal(await page.locator(".evidence-card").count(),8);
  assert.equal(await page.locator("#budget").innerText(),"0 / 6");
  assert.equal(await page.locator(".question.done").count(),0);
  await shot(page,"01-1280-budget-opening.png");
  await card("紙の発注書").click();await card("代理承認の規程").click();
  await page.locator("#connect").click();
  assert.equal(await page.locator(".evidence-card.open").count(),2);
  assert.equal(await page.locator("#budget").innerText(),"2 / 6");
  assert.match(await page.locator("#feedback").innerText(),/減点はありません/);
  await shot(page,"02-1280-wrong-pair-retained.png");
  await card("紙の発注書").click();await card("電子発注台帳").click();await page.locator("#connect").click();
  assert.equal(await page.locator("#progress").innerText(),"1 / 3");
  await shot(page,"03-1280-first-pair.png");
  await page.locator('[data-tab="notes"]').click();
  assert.equal(await page.locator('[data-screen="notes"]').isVisible(),true);
  assert.equal(await page.locator('[data-screen="board"]').isVisible(),false);
  assert.match(await page.locator("#findings").innerText(),/EVT-044/);
  await page.locator('[data-tab="board"]').click();
  await card("発注登録ログ").click();await card("電子承認ログ").click();await page.locator("#connect").click();
  assert.equal(await page.locator("#progress").innerText(),"2 / 3");
  await card("代理承認の規程").click();await card("承認者の電子署名").click();await page.locator("#connect").click();
  assert.equal(await page.locator("#budget").innerText(),"6 / 6");
  assert.equal(await page.locator("#progress").innerText(),"3 / 3");
  assert.equal(await page.locator(".evidence-card.open").count(),6);
  assert.equal(await card("現場主任のメール").isDisabled(),true);
  await shot(page,"04-1280-six-used-three-proven.png");
  await page.locator('[data-tab="report"]').click();assert.equal(await page.locator('[data-screen="report"]').isVisible(),true);
  assert.equal(await page.locator('[data-verdict="clear"]').isEnabled(),true);
  await page.locator('[data-verdict="clear"]').click();
  assert.match(await page.locator("#finalReport").innerText(),/23分前/);
  await shot(page,"05-1280-proven-verdict.png");

  const second=await browser.newContext({viewport:{width:1280,height:720}});
  const p=await second.newPage();attach(p);await p.goto(entry);
  const c=name=>p.locator(".evidence-card").filter({hasText:name});
  for(const name of ["現場主任のメール","機材の納品チェック票","紙の発注書","電子発注台帳","発注登録ログ","電子承認ログ"])await c(name).click();
  assert.equal(await p.locator("#budget").innerText(),"6 / 6");
  assert.equal(await c("承認者の電子署名").isDisabled(),true);
  await p.locator("#clearSelection").click();
  await c("紙の発注書").click();await c("電子発注台帳").click();await p.locator("#connect").click();
  await c("発注登録ログ").click();await c("電子承認ログ").click();await p.locator("#connect").click();
  assert.equal(await p.locator("#progress").innerText(),"2 / 3");
  await shot(p,"06-1280-budget-insufficient.png");
  await p.locator('[data-tab="report"]').click();
  assert.equal(await p.locator('[data-verdict="clear"]').isDisabled(),true);
  assert.equal(await p.locator('[data-verdict="review"]').isEnabled(),true);
  await p.locator('[data-verdict="review"]').click();
  assert.match(await p.locator("#finalReport").innerText(),/報告時点で不足していた根拠/);
  assert.match(await p.locator("#finalReport").innerText(),/正式照会/);
  await shot(p,"07-1280-need-additional-review.png");

  const small=await browser.newContext({viewport:{width:1024,height:768}});
  const q=await small.newPage();attach(q);await q.goto(entry);assert.equal(await q.locator(".evidence-card").count(),8);
  await shot(q,"08-1024-budget-opening.png");
  assert.deepEqual(jsErrors,[]);assert.deepEqual(remote,[]);
  const record={status:"PASS",cards:8,revealLimit:6,successfulEvidencePairs:3,wrongPairRetainsCards:true,blockedSeventhReveal:true,
    insufficientEvidenceReview:true,threeScreensFunctional:true,fullEvidenceVerdict:true,screenshots:8,viewports:["1280x720","1024x768"],
    jsErrors,remote,scope:"Chromium standalone HTML only; Electron/MSIX install QA not performed"};
  fs.writeFileSync(path.join(output,"CARD_BUDGET_QA.json"),JSON.stringify(record,null,2)+"\n");
  console.log("CARD_BUDGET_BROWSER_PASS "+JSON.stringify(record));
 }finally{await browser.close();}
})().catch(err=>{console.error(err.stack);process.exitCode=1;});
