"use strict";
const fs=require("node:fs"),path=require("node:path"),child=require("node:child_process");
const {validate}=require("./paid-msix-preflight.cjs");
function prepare(env,root=path.resolve(__dirname,"..")){
 const gate=validate(env);
 if(!gate.ready)throw Error("PAID_MSIX_HOLD: "+gate.errors.join(" | "));
 if(process.platform!=="win32")throw Error("MSIX must be built and validated on Windows");
 const stage=path.join(root,"build","paid-msix-app"),out=path.join(root,"dist-paid-msix-candidate");
 if(fs.existsSync(stage))throw Error("Staging folder already exists; refusing to overwrite it");
 if(fs.existsSync(out)&&fs.readdirSync(out).some(x=>x.endsWith(".msix")))
  throw Error("MSIX candidate already exists; use a fresh build workspace");
 fs.mkdirSync(stage,{recursive:true});
 for(const item of ["index.html","styles.css"]){
  const source=path.join(root,item);
  if(!fs.existsSync(source))throw Error("Missing production input: "+item);
  fs.copyFileSync(source,path.join(stage,item));
 }
 fs.cpSync(path.join(root,"src"),path.join(stage,"src"),{recursive:true,force:false,errorOnExist:true});
 fs.copyFileSync(path.join(root,"desktop","main.cjs"),path.join(stage,"main.cjs"));
 const pkg={name:"night-office-auditor-paid-24-case",version:gate.value.version.split(".").slice(0,3).join("."),
  private:true,main:"main.cjs",description:"Offline paid 24-case mystery investigation game"};
 fs.writeFileSync(path.join(stage,"package.json"),JSON.stringify(pkg,null,2)+"\n");
 const sourceCommit=env.SOURCE_GIT_COMMIT||env.GITHUB_SHA;
 fs.writeFileSync(path.join(stage,"SOURCE_GIT_COMMIT.txt"),sourceCommit+"\n");
 const suffix=gate.value.identityName.split(".").pop().replace(/[^A-Za-z0-9]/g,"").toLowerCase();
 if(!suffix)throw Error("Invalid identity suffix");
 const config={
  appId:"com.okinawadesktoptools."+suffix,productName:gate.value.storeDisplayName,
  electronVersion:"44.6.0",asar:true,
  directories:{app:"build/paid-msix-app",output:"dist-paid-msix-candidate",buildResources:"build"},
  win:{target:[{target:"msix",arch:["x64"]}]},
  msix:{
   applicationId:"Paid"+suffix,identityName:gate.value.identityName,publisher:gate.value.publisher,
   publisherDisplayName:gate.value.publisherDisplayName,
   displayName:gate.value.storeDisplayName,languages:["ja-JP"],
   createMsixupload:true,setBuildNumber:false,capabilities:["runFullTrust"]
  },
  appxManifestCreated:"./scripts/paid-msix-manifest-hook.cjs"
 };
 const cfg=path.join(root,"paid-msix-candidate.generated.json");
 fs.writeFileSync(cfg,JSON.stringify(config,null,2)+"\n",{flag:"wx"});
 return {stage,out,cfg,sourceCommit};
}
function run(){
 const result=prepare(process.env);
 const root=path.resolve(__dirname,".."),builder=path.join(root,"node_modules","electron-builder","cli.js");
 if(!fs.existsSync(builder))throw Error("Pinned electron-builder not installed in CI");
 const p=child.spawnSync(process.execPath,[builder,"--win","msix","--x64","--config",result.cfg,"--publish","never"],
  {cwd:root,env:process.env,stdio:"inherit",shell:false});
 if(p.error||p.status!==0)throw Error("Electron-builder x64 MSIX failed; exit "+p.status);
 const check=child.spawnSync("powershell.exe",["-NoProfile","-ExecutionPolicy","Bypass","-File",
  path.join(root,"scripts","verify-paid-msix.ps1")],{cwd:root,env:process.env,stdio:"inherit",shell:false});
 if(check.error||check.status!==0)throw Error("MSIX manifest/hash verification failed");
}
if(require.main===module){
 try{run();}catch(e){console.error("PAID_MSIX_BUILD_BLOCKED_OR_FAILED: "+e.message);process.exitCode=2;}
}
module.exports={prepare,run};
