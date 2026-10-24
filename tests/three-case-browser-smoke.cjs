"use strict";
const {chromium}=require("playwright");
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),url=require("node:url");
const output=path.resolve("three-case-review");fs.mkdirSync(output,{recursive:true});
const site=url.pathToFileURL(path.resolve("deduction-campaign.html")).href;
(async()=>{
 const browser=await chromium.launch({headless:true}),errors=[],requests=[];
 const track=p=>{
  p.on("pageerror",e=>errors.push(e.message));
  p.on("request",req=>{if(/^https?:/.test(req.url()))requests.push(req.url());});
  p.on("dialog",d=>d.accept());
 };
 try{
  const context=await browser.newContext({viewport:{width:1280,height:720}});
  const p=await context.newPage();track(p);await p.goto(site,{waitUntil:"load"});
  const screenshot=name=>p.screenshot({path:path.join(output,name),fullPage:true});
  const caseButton=id=>p.locator(".case-item").filter({hasText:"CASE "+id});
  const card=name=>p.locator(".evidence-card").filter({hasText:name});
  async function pickCard(name){await card(name).click();}
  async function submitQuestion(name1,name2,question,answerLabel){
   await pickCard(name1);await pickCard(name2);
   await p.locator("#whichQuestion").selectOption(question);
   await p.locator("#assignButton").click();
   await p.getByRole("radio",{name:answerLabel}).check();
  }
  async function caseRun(id,proofs,verdict){
   if(id!=="01")await caseButton(id).click();
   assert.match(await p.locator("#caseTitle").innerText(),new RegExp(id));
   await p.getByRole("button",{name:/状況を聞いて協力/}).click();
   const links=p.locator(".evidence-card.opened");
   assert.equal(await links.count(),0);
   for(const [a,b,q,answer] of proofs)await submitQuestion(a,b,q,answer);
   assert.equal(await links.count(),4,"four cards should be sufficient");
   assert.equal(await p.locator("#answerCount").innerText(),"2 / 2");
   assert.equal(await p.locator("#revealCount").innerText(),"4 / 6");
   assert.equal(await p.locator("#reportResult").isVisible(),false);
   await p.locator(".verdict."+verdict).click();
   assert.equal(await p.locator("#reportResult").isVisible(),true);
   assert.match(await p.locator("#reportResult").innerText(),/資料と結論が整合/);
  }
  assert.equal(await p.locator(".case-item").count(),3);
  assert.equal(await caseButton("04").isDisabled(),true);
  assert.equal(await card("伝票0418の控え").count(),1);
  await screenshot("01-case01-opening.png");
  await caseRun("01",[
   ["伝票番号の一覧","伝票0418の控え","record","対応する原票が残っている"],
   ["取消処理の記録","元伝票の起票ログ","cancel","起票と取消の相殺で説明できる"]
  ],"clear");
  await screenshot("02-case01-proven.png");
  assert.equal(await caseButton("04").isEnabled(),true);
  assert.equal(await caseButton("05").isEnabled(),true);

  // Choose fifth case before fourth to prove the order is not hard-coded.
  await caseRun("05",[
   ["支払先マスタ（旧）","支払先マスタ（新）","changed","登録口座が変更された"],
   ["取引先確認メール","変更依頼メール","authorized","正規の変更依頼を確認できない"]
  ],"escalate");
  await screenshot("03-case05-issue.png");
  await caseRun("04",[
   ["紙の発注書","電子購買台帳","other","同じ発注の電子申請が存在する"],
   ["発注の登録ログ","電子承認のログ","valid","時刻と権限に整合がある"]
  ],"clear");
  await screenshot("04-case04-proof.png");
  assert.equal(await p.locator("#campaignProgress").innerText(),"3 / 3");
  assert.equal(await p.locator("#finale").isVisible(),true);
  await screenshot("05-final-choice-before-submit.png");
  await p.getByRole("button",{name:/3件それぞれの根拠と未確定点/}).click();
  assert.match(await p.locator("#finaleResult").innerText(),/T-7/);
  await screenshot("06-cross-case-ending.png");

  // Independent browser context: insufficient evidence review still unlocks next cases.
  const alt=await browser.newContext({viewport:{width:1024,height:768}});
  const q=await alt.newPage();track(q);await q.goto(site,{waitUntil:"load"});
  await q.getByRole("button",{name:/記録の不一致を厳しく追及/}).click();
  for(const text of ["伝票番号の一覧","伝票0418の控え","倉庫担当のメモ","夜間処理の運用メモ","取消処理の記録","夜間締めの照合票"]){
   await q.locator(".evidence-card").filter({hasText:text}).click();
  }
  assert.equal(await q.locator("#revealCount").innerText(),"6 / 6");
  assert.equal(await q.locator(".evidence-card").filter({hasText:"元伝票の起票ログ"}).isDisabled(),true);
  await q.locator(".verdict.review").click();
  assert.equal(await q.locator("#reportResult").isVisible(),true);
  assert.equal(await q.locator(".case-item").filter({hasText:"CASE 04"}).isEnabled(),true);
  await q.screenshot({path:path.join(output,"07-1024-limited-evidence-review.png"),fullPage:true});

  assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);
  const result={status:"PASS",cases:["01","05","04"],nonlinearOrder:true,fourCardSolve:true,
   evidenceCap:6,reviewAlternative:true,spoilerBeforeReport:false,intercaseFinale:true,
   screenshots:7,viewports:["1280x720","1024x768"],pageErrors:errors,remoteRequests:requests,
   scope:"Chromium browser HTML only; NOT Electron/MSIX or Store submission QA"};
  fs.writeFileSync(path.join(output,"THREE_CASE_QA.json"),JSON.stringify(result,null,2)+"\n");
  console.log("THREE_CASE_BROWSER_QA_PASS "+JSON.stringify(result));
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
