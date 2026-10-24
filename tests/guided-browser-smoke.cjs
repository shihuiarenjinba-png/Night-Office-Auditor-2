"use strict";
// Actual Chromium browser smoke test for the standalone guided story prototype.
const {chromium}=require("playwright");
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),url=require("node:url");
const dest=path.resolve("guided-flow-ui-review");fs.mkdirSync(dest,{recursive:true});
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
(async()=>{
 const browser=await chromium.launch({headless:true});
 const errors=[],requests=[];
 try{
  const context=await browser.newContext({viewport:{width:1280,height:720}});
  const page=await context.newPage();
  page.on("pageerror",e=>errors.push(e.message));
  page.on("request",r=>{if(/^https?:/.test(r.url()))requests.push(r.url())});
  await page.goto(url.pathToFileURL(path.resolve("branch-case04.html")).href,{waitUntil:"load"});
  await page.locator("#guideHeading").waitFor();
  assert.match(await page.locator("#mainQuestion").innerText(),/正式に承認/);
  assert.equal(await page.locator(".proof-step.ready").count(),0);
  assert.equal(await page.locator(".unknown-entry.resolved").count(),0);
  assert.equal(await page.locator(".unknown-entry").count(),3);
  assert.match(await page.locator("#caseUnknowns").innerText(),/まだ|未解明|発注前/);
  await page.screenshot({path:path.join(dest,"1280-01-opening.png"),fullPage:true});
  await page.locator("#start").click();
  assert.equal(await page.locator('[data-screen="interview"]').isVisible(),true);
  await page.getByRole("button",{name:/経理担当・仲村を保護して聞く/}).click();
  await page.getByRole("button",{name:/責任追及を急がないと約束して原本を照合/}).click();
  assert.equal(await page.locator(".proof-step.ready").count(),1);
  assert.match(await page.locator("#discovery").innerText(),/発注台帳/);
  await page.locator('[data-tab="scene"]').click();
  assert.equal(await page.locator(".unknown-entry.resolved").count(),1);
  assert.match(await page.locator("#caseKnown").innerText(),/EVT-044/);
  await page.screenshot({path:path.join(dest,"1280-02a-unknowns-updated.png"),fullPage:true});
  await page.locator('[data-tab="interview"]').click();
  await page.screenshot({path:path.join(dest,"1280-02-proof-unlocked.png"),fullPage:true});
  await page.locator('[data-tab="records"]').click();
  assert.equal(await page.locator('[data-screen="records"]').isVisible(),true);
  assert.equal(await page.locator('[data-screen="interview"]').isVisible(),false);
  await page.locator('[data-tab="interview"]').click();
  assert.equal(await page.locator('[data-screen="interview"]').isVisible(),true);
  await page.getByRole("button",{name:/電子承認ID EVT-044の署名ログを照合/}).click();
  assert.equal(await page.locator(".proof-step.ready").count(),2);
  await page.getByRole("button",{name:/金城の代理権限と電子署名を検証/}).click();
  assert.equal(await page.locator(".proof-step.ready").count(),3);
  await page.locator('[data-tab="scene"]').click();
  assert.equal(await page.locator(".unknown-entry.resolved").count(),3);
  assert.match(await page.locator("#sceneLead").innerText(),/3つの疑問が解消/);
  await page.screenshot({path:path.join(dest,"1280-03a-all-questions-resolved.png"),fullPage:true});
  await page.locator('[data-tab="interview"]').click();
  await page.screenshot({path:path.join(dest,"1280-03-evidence-chain.png"),fullPage:true});
  await page.getByRole("button",{name:/問題なしと報告する/}).click();
  assert.match(await page.locator("#ending").innerText(),/証拠が結びついた結末/);
  assert.match(await page.locator(".afterword").innerText(),/発注の23分前/);
  await page.screenshot({path:path.join(dest,"1280-04-result.png"),fullPage:true});
  const small=await browser.newContext({viewport:{width:1024,height:768}});
  const mobile=await small.newPage();mobile.on("pageerror",e=>errors.push(e.message));
  await mobile.goto(url.pathToFileURL(path.resolve("branch-case04.html")).href);
  await mobile.locator("#guideHeading").waitFor();
  await mobile.screenshot({path:path.join(dest,"1024-01-opening.png"),fullPage:true});
  assert.equal(await mobile.locator(".investigation-guide").isVisible(),true);
  assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);
  fs.writeFileSync(path.join(dest,"GUIDED_FLOW_QA.json"),JSON.stringify({
   result:"PASS",screenshots:7,tabSwitch:true,evidenceChain:[0,1,2,3],unansweredQuestionStates:[3,2,1,0],ending:"substantiated",
   noJavaScriptErrors:true,noRemoteRequests:true,viewportSizes:["1280x720","1024x768"],
   note:"Standalone Chromium HTML preview, not an Electron/MSIX install test"
  },null,2)+"\n");
  console.log("GUIDED_BROWSER_QA_PASS 7 screenshots; question boards; tab switches; 0,1,2,3 evidence; ending");
 }finally{await browser.close();}
})().catch(err=>{console.error(err.stack);process.exitCode=1;});
