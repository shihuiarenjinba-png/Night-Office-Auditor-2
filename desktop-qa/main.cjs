/* Unsigned Windows QA preview only. No Store Identity. */
"use strict";
const {app,BrowserWindow,session}=require("electron");
const fs=require("node:fs"),path=require("node:path"),url=require("node:url");
const runArg=process.argv.find(x=>x.startsWith("--qa-capture="));
const out=process.env.NIGHT_QA_CAPTURE_DIR||(runArg?runArg.slice("--qa-capture=".length):null);
if(out)app.disableHardwareAcceleration();
app.setName("NightOfficePaidPreview_QA_UNSIGNED");
function restrict(win){
 win.webContents.setWindowOpenHandler(()=>({action:"deny"}));
 win.webContents.on("will-navigate",(event,target)=>{
  try{
   const file=url.fileURLToPath(target);
   const allowed=path.resolve(file).startsWith(path.resolve(__dirname)+path.sep);
   if(!allowed)event.preventDefault();
  }catch{event.preventDefault();}
 });
}
async function screenshot(win,dest,width,height){
 const d=win.webContents.debugger;
 if(!d.isAttached())d.attach("1.3");
 await d.sendCommand("Emulation.setDeviceMetricsOverride",{width,height,deviceScaleFactor:1,mobile:false});
 await d.sendCommand("Page.enable");
 const result=await Promise.race([d.sendCommand("Page.captureScreenshot",{
  format:"png",fromSurface:true,captureBeyondViewport:false,
  clip:{x:0,y:0,width,height,scale:1}
 }),new Promise((_,reject)=>setTimeout(()=>reject(Error("CDP screenshot timeout after 15 seconds")),15000))]);
 const bytes=Buffer.from(result.data,"base64");
 const pixelWidth=bytes.readUInt32BE(16),pixelHeight=bytes.readUInt32BE(20);
 if(pixelWidth!==width||pixelHeight!==height)throw Error("Screenshot size mismatch: "+pixelWidth+"x"+pixelHeight);
 fs.writeFileSync(dest,bytes);
 await d.sendCommand("Emulation.clearDeviceMetricsOverride");
 return {width:pixelWidth,height:pixelHeight,bytes:bytes.length};
}
app.whenReady().then(async()=>{
 session.defaultSession.setPermissionRequestHandler((_wc,_p,respond)=>respond(false));
 const win=new BrowserWindow({width:1280,height:720,show:true,
  backgroundColor:"#07141c",webPreferences:{
   nodeIntegration:false,contextIsolation:true,sandbox:true,webSecurity:true,
   webviewTag:false,allowRunningInsecureContent:false}
 });
 restrict(win);
 await win.loadFile(path.join(__dirname,"index.html"));
 await new Promise(resolve=>setTimeout(resolve,900));
 if(out){
  try{
   fs.mkdirSync(out,{recursive:true});
   fs.writeFileSync(path.join(out,"WINDOWS_QA_STAGE.txt"),"APP_LOADED "+new Date().toISOString()+"\n");
   const state=await win.webContents.executeJavaScript('({title:document.title,caseCount:document.getElementById("count")?.textContent,caseNumber:document.getElementById("caseNo")?.textContent,tabCount:document.querySelectorAll("[data-tab]").length,playerScreens:document.querySelectorAll("[data-screen]").length,internalContent:/QA_UNSIGNED|GitHub Actions|Store Identity|WACK|MSIX|開発工程/.test(document.body.innerText)})');
   if(state.caseCount!=="1 / 24"||state.caseNumber!=="01"||state.tabCount!==5||state.playerScreens!==5||state.internalContent||!state.title.includes("深夜監査室"))
    throw Error("Unexpected Windows DOM "+JSON.stringify(state));
   fs.appendFileSync(path.join(out,"WINDOWS_QA_STAGE.txt"),"DOM_VERIFIED "+JSON.stringify(state)+"\n");
   const before=await screenshot(win,path.join(out,"windows-1280x720.png"),1280,720);
   const action=await win.webContents.executeJavaScript('(()=>{document.querySelector("[data-tab=evidence]").click();document.querySelector(".source:not([disabled])").click();return {evidenceVisible:!document.querySelector("[data-screen=evidence]").hidden,findings:document.querySelectorAll(".finding").length,remaining:document.getElementById("timerTitle")?.innerText}})()');
   if(!action.evidenceVisible||action.findings!==1)throw Error("Windows evidence tab/card did not respond.");
   fs.appendFileSync(path.join(out,"WINDOWS_QA_STAGE.txt"),"FIRST_SCREEN_CAPTURED "+JSON.stringify(before)+"\n");
   const after=await screenshot(win,path.join(out,"windows-1024x768-after-choice.png"),1024,768);
   fs.writeFileSync(path.join(out,"WINDOWS_QA.json"),JSON.stringify({
    status:"PASS",source:"Windows packaged Electron QA preview",appName:app.getName(),
    title:state.title,caseCount:24,firstCaseEvidenceTypes:3,
    tabs:state.tabCount,before,after,interactiveEvidence:true,playerUIReleaseTextHidden:true,
    signed:false,storeCandidate:false,wack:false,msix:false
   },null,2)+"\n");
   console.log("WINDOWS_PAID_QA_PASS "+JSON.stringify({state,before,after}));
  }catch(e){
   console.error("WINDOWS_PAID_QA_FAIL",e.stack);
   try{fs.writeFileSync(path.join(out,"WINDOWS_QA_ERROR.txt"),String(e.stack||e));}catch{}
   process.exitCode=1;
  }finally{
   if(win.webContents.debugger.isAttached())win.webContents.debugger.detach();
   win.destroy();app.quit();
  }
 }
 }).catch(e=>{console.error("ELECTRON_START_FAILED",e.stack);if(out)try{fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,"WINDOWS_START_ERROR.txt"),String(e.stack||e));}catch{}app.exit(1);});
app.on("window-all-closed",()=>app.quit());
