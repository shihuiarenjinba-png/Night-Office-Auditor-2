"use strict";
// Production entry point for the separate 24-case paid edition; no developer/QA UI.
const {app,BrowserWindow,session}=require("electron");
const path=require("node:path"),url=require("node:url");
app.setName("深夜監査室");
app.whenReady().then(async()=>{
 session.defaultSession.setPermissionRequestHandler((_w,_p,respond)=>respond(false));
 const win=new BrowserWindow({
  width:1280,height:760,minWidth:900,minHeight:650,backgroundColor:"#07141c",
  show:false,webPreferences:{
   nodeIntegration:false,contextIsolation:true,sandbox:true,webSecurity:true,
   webviewTag:false,allowRunningInsecureContent:false
  }
 });
 win.webContents.setWindowOpenHandler(()=>({action:"deny"}));
 win.webContents.on("will-navigate",(event,target)=>{
  try{
   const requested=path.resolve(url.fileURLToPath(target));
   const allowed=path.resolve(__dirname,"index.html");
   if(requested!==allowed)event.preventDefault();
  }catch{event.preventDefault();}
 });
 await win.loadFile(path.join(__dirname,"index.html"));
 win.show();
}).catch(error=>{console.error("Application startup failed:",error);app.exit(1);});
app.on("window-all-closed",()=>app.quit());
