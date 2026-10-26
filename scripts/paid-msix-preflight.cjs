"use strict";
const fs=require("node:fs"),path=require("node:path");
const recordPath=path.resolve(__dirname,"..","store","partner-center-identity.json");
const FIELD={
 storeId:"NIGHT_PAID_STORE_ID",
 identityName:"NIGHT_PAID_IDENTITY_NAME",
 publisher:"NIGHT_PAID_PUBLISHER",
 publisherDisplayName:"NIGHT_PAID_PUBLISHER_DISPLAY_NAME",
 storeDisplayName:"NIGHT_PAID_STORE_DISPLAY_NAME",
 version:"NIGHT_PAID_STORE_VERSION"
};
const CHEAP_IDENTITY="OkinawaDesktopTools.NightOfficeAuditor";
const CHEAP_STORE_ID="9P6SQX67J3R9";
function readRecord(){return JSON.parse(fs.readFileSync(recordPath,"utf8"));}
function validate(env,record=readRecord()){
 const errors=[],value={};
 for(const [field,key] of Object.entries(FIELD)){
  if(field==="version")continue;
  const canonical=String(record[field]||"").trim(),given=String(env[key]||"").trim();
  if(!canonical||/^(?:TBD|TODO|UNKNOWN|PLACEHOLDER|EXAMPLE|HOLD)$/i.test(canonical))
   errors.push("Owner-verified Partner Center value missing: "+field);
  if(given&&given!==canonical)errors.push("Actions variable conflicts with owner screenshot: "+key);
  value[field]=canonical;
 }
 if(record.repository!=="shihuiarenjinba-png/Night-Office-Auditor-2")
  errors.push("Independent paid edition repository mismatch");
 if(!/owner-provided Partner Center/i.test(record.verificationSource||""))
  errors.push("Independent paid edition not verified by owner screenshot");
 if(env.NIGHT_PAID_IDENTITY_OWNER_CONFIRMED&&env.NIGHT_PAID_IDENTITY_OWNER_CONFIRMED!=="YES")
  errors.push("Owner has explicitly blocked identity approval");
 if(value.identityName===CHEAP_IDENTITY||value.storeId===CHEAP_STORE_ID)
  errors.push("Low-price 12-case product Identity or Store ID cannot be reused");
 if(value.identityName&&!/^[A-Za-z0-9][A-Za-z0-9._-]{1,100}$/.test(value.identityName))
  errors.push("Invalid Package Identity Name");
 if(value.storeId&&!/^[A-Z0-9]{8,20}$/i.test(value.storeId))
  errors.push("Invalid Store ID");
 if(value.publisher&&!/^CN=.{1,200}$/.test(value.publisher))
  errors.push("Publisher must exactly match Partner Center and start with CN=");
 const official=String(record.storeVersion||"").trim();
 const override=String(env.NIGHT_PAID_STORE_VERSION||"").trim();
 // Unconfirmed Store versions must never silently be promoted to official.
 if(official&&override&&official!==override)errors.push("Actions Store Version differs from Partner Center record");
 if(override&&!official)errors.push("Store Version variable supplied without a verified reservation; update the canonical record only after checking Partner Center");
 const candidate=official||String(record.qaCandidateVersion||"").trim();
 value.version=candidate;
 const bits=candidate.split(".");
 if(bits.length!==4||bits.some(v=>!/^\d+$/.test(v)||Number(v)>65535)||Number(bits[3])!==0)
  errors.push("Invalid MSIX QA version");
 const app=JSON.parse(fs.readFileSync(path.resolve(__dirname,"..","package.json"),"utf8"));
 if(!official&&candidate!==app.version+".0")
  errors.push("QA-only version must be derived from package.json version");
 if(!/^[0-9a-f]{40}$/i.test(String(env.SOURCE_GIT_COMMIT||env.GITHUB_SHA||"")))
  errors.push("Exact 40-digit source Git SHA required");
 return{ready:errors.length===0,storeVersionVerified:Boolean(official),errors,value};
}
function report(env=process.env){
 const result=validate(env);
 const output=path.resolve("dist-paid-msix-candidate");
 fs.mkdirSync(output,{recursive:true});
 if(!result.ready){
  fs.writeFileSync(path.join(output,"MSIX_BUILD_HOLD.json"),JSON.stringify({
   status:"HOLD_NO_MSIX",sourceCommit:env.SOURCE_GIT_COMMIT||env.GITHUB_SHA||null,
   reasons:result.errors,note:"12-case Identity substitution and invented Store Version forbidden."
  },null,2)+"\n");
 }
 if(env.GITHUB_OUTPUT)fs.appendFileSync(env.GITHUB_OUTPUT,
  "ready="+result.ready+"\nstore_version_verified="+result.storeVersionVerified+"\n");
 console.log(result.ready?
  (result.storeVersionVerified?"PAID_MSIX_PREFLIGHT_READY_STORE_VERSION_VERIFIED":
    "PAID_MSIX_PREFLIGHT_QA_ONLY_STORE_VERSION_UNVERIFIED"):
  "PAID_MSIX_PREFLIGHT_HOLD: "+result.errors.join(" | "));
 return result;
}
if(require.main===module)report();
module.exports={validate,report,readRecord,FIELD};
