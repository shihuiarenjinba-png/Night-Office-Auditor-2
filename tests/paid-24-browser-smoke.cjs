"use strict";
const {chromium}=require("playwright"),assert=require("node:assert/strict");
const proof=require("../src/case-proofbook.js"),game=require("../src/engine.js");
const fs=require("node:fs"),path=require("node:path"),url=require("node:url");
const output=path.resolve("paid-24-review");fs.mkdirSync(output,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true}),errors=[],remotes=[];
 const source=url.pathToFileURL(path.resolve("index.html")).href;
 const subscribe=page=>{page.on("pageerror",e=>errors.push(e.message));page.on("request",r=>{if(/^https?:/.test(r.url()))remotes.push(r.url());});page.on("dialog",dialog=>dialog.accept());};
 try{
  const context=await browser.newContext({viewport:{width:1280,height:720}});
  const p=await context.newPage();subscribe(p);
  await p.goto(source,{waitUntil:"load"});
  const shot=filename=>p.screenshot({path:path.join(output,filename),fullPage:true});
  assert.equal(await p.locator("#count").innerText(),"1 / 24");
  assert.equal(await p.locator('[data-tab]').count(),5);
  await shot("01-opening-1280.png");
  const outcomes=["clear","review","escalate"];
  const docs=game.SOURCES;
  for(let i=0;i<24;i++){
   assert.equal(await p.locator("#caseNo").innerText(),String(i+1).padStart(2,"0"),"case index should match");
   assert.equal(await p.locator(".witness-choice").count(),2,"each case should offer character decisions");
   const response=i%3===1?"press":"careful";
   await p.locator(".witness-choice").nth(response==="careful"?0:1).click();
   assert.equal(await p.locator(".witness-choice").count(),0,"interview response should be committed");
   assert.ok((await p.locator("#witnessReply").innerText()).length>8);

   await p.locator('[data-tab="evidence"]').click();
   const required=proof[i].required;
   const complementary=docs.find(x=>!required.includes(x.id)).id;
   const used=[...new Set([...required,complementary])].slice(0,2);
   for(const id of used){
     const label=docs.find(x=>x.id===id).label;
     await p.locator(".source").filter({hasText:label}).click();
   }
   assert.equal(await p.locator(".finding").count(),2);
   await p.locator('[data-tab="decision"]').click();
   assert.equal(await p.locator(".document-choice").count(),2);
   assert.equal(await p.locator(".deduction-option").count(),3);
   assert.match(await p.locator("#caseQuestion").innerText(),/.{8}/);
   assert.equal(await p.locator("#submitDecision").isDisabled(),true);
   for(const checkbox of await p.locator(".document-choice input").all())await checkbox.check();
   const answer=outcomes[proof[i].verdict];
   await p.locator('.deduction-option input[value="'+answer+'"]').check();
   assert.equal(await p.locator("#submitDecision").isEnabled(),true);
   if(i===3)await shot("02-fourth-case-reasoning.png");
   if(i===11){
    await p.reload();
    assert.equal(await p.locator("#count").innerText(),"12 / 24");
    assert.ok((await p.locator("#witnessReply").innerText()).length>10,"witness choice should persist through reload");

    await p.locator('[data-tab="decision"]').click();
    assert.equal(await p.locator(".document-choice input:checked").count(),2);
    assert.equal(await p.locator('.deduction-option input[value="'+answer+'"]').isChecked(),true);
   }
   assert.equal(await p.locator("#result").innerText().then(v=>/資料照合後の判定/.test(v)),false,"no solution before report");
   await p.locator("#submitDecision").click();
   assert.match(await p.locator("#result").innerText(),/資料照合後の判定/);
   assert.match(await p.locator("#result").innerText(),/監査室による報告後の照合/);
   if(i===23){await shot("04-final-verdict.png");break;}
   await p.locator("#nextCase").click();
   if(i===11)await shot("03-halfway-after-12.png");
  }
  assert.equal(await p.locator("#count").innerText(),"24 / 24");
  assert.match(await p.locator("#caseTitle").innerText(),/監査官|調査員/);
  assert.match(await p.locator("#witnessContext").innerText(),/関係者と話し合った夜は24回/);
  assert.match(await p.locator("#witnessReply").innerText(),/仲村|島袋/);

  const dump=await p.locator("body").innerText();
  for(const secret of ["QA_UNSIGNED","GitHub Actions","Store Identity","WACK","MSIX","開発工程","残工程"]){
   assert.equal(dump.includes(secret),false,"internal steps leaked to player UI "+secret);
  }
  const narrow=await browser.newContext({viewport:{width:1024,height:768}});
  const n=await narrow.newPage();subscribe(n);await n.goto(source);
  assert.equal(await n.locator("#count").innerText(),"1 / 24");
  const extent=await n.evaluate(()=>({scroll:document.documentElement.scrollWidth,inner:innerWidth}));
  assert.ok(extent.scroll<=extent.inner+2,"1024px horizontal overflow: "+JSON.stringify(extent));
  await n.screenshot({path:path.join(output,"05-opening-1024.png"),fullPage:true});
  assert.deepEqual(errors,[]);assert.deepEqual(remotes,[]);
  const qa={status:"PASS",casesCompleted:24,sourceDocs:72,finalReportOnlySpoilers:true,notebookReload:true,allFiveTabs:true,devTextHidden:true,
   witnessInterviews:24,witnessPersistsAcrossReload:true,screenshots:5,viewports:["1280x720","1024x768"],pageErrors:errors,networkRequests:remotes,
   scope:"Chromium complete gameplay; Windows Electron dedicated runtime separately"};
  fs.writeFileSync(path.join(output,"FULL_24_QA.json"),JSON.stringify(qa,null,2)+"\n");
  console.log("FULL24_BROWSER_QA_PASS "+JSON.stringify(qa));
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
