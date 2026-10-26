"use strict";
const fs=require("node:fs"),path=require("node:path");
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
function validate(env){
 const errors=[],value={};
 for(const [field,key] of Object.entries(FIELD)){
  const raw=String(env[key]||"").trim();value[field]=raw;
  if(!raw)errors.push("Partner Center confirmed value missing: "+key);
  else if(/^(?:TBD|TODO|UNKNOWN|PLACEHOLDER|EXAMPLE|HOLD)$/i.test(raw))errors.push("Placeholder is forbidden: "+key);
 }
 if(env.NIGHT_PAID_IDENTITY_OWNER_CONFIRMED!=="YES")errors.push("Independent paid-edition Identity has not been owner-confirmed");
 if(value.identityName===CHEAP_IDENTITY||value.storeId===CHEAP_STORE_ID)
  errors.push("Low-price 12-case product Identity or Store ID cannot be reused");
 if(value.identityName&&!/^[A-Za-z0-9][A-Za-z0-9._-]{1,100}$/.test(value.identityName))
  errors.push("Invalid Package Identity Name");
 if(value.storeId&&!/^[A-Z0-9]{8,20}$/i.test(value.storeId))errors.push("Invalid Store ID");
 if(value.publisher&&!/^CN=.{1,200}$/i.test(value.publisher))errors.push("Publisher must exactly match Partner Center and start with CN=");
 if(value.version){
  const pieces=value.version.split(".");
  if(pieces.length!==4||pieces.some(v=>!/^\d+$/.test(v)||Number(v)>65535)||
    Number(pieces[0])<1||Number(pieces[3])!==0)
   errors.push("Store Version must be valid Major.Minor.Build.0 with Major > 0");
 }
 if(!/^[0-9a-f]{40}$/i.test(String(env.SOURCE_GIT_COMMIT||env.GITHUB_SHA||"")))
  errors.push("Exact 40-digit source Git SHA required");
 return {ready:errors.length===0,errors,value};
}
function report(env=process.env){
 const result=validate(env);
 const output=path.resolve("dist-paid-msix-candidate");
 fs.mkdirSync(output,{recursive:true});
 if(!result.ready){
  const record={status:"HOLD_IDENTITY_NOT_CONFIRMED_NO_MSIX_CREATED",
   product:"Night Office Auditor - paid 24 cases",sourceCommit:env.SOURCE_GIT_COMMIT||env.GITHUB_SHA||null,
   reasons:result.errors,
   note:"No 12-case Identity substitution, no invented Identity, no Store submission."};
  fs.writeFileSync(path.join(output,"MSIX_BUILD_HOLD.json"),JSON.stringify(record,null,2)+"\n");
 }
 if(env.GITHUB_OUTPUT)fs.appendFileSync(env.GITHUB_OUTPUT,"ready="+result.ready+"\n");
 console.log(result.ready?"PAID_MSIX_PREFLIGHT_READY":"PAID_MSIX_PREFLIGHT_HOLD: "+result.errors.join(" | "));
 return result;
}
if(require.main===module){report();}
module.exports={validate,report,FIELD};
