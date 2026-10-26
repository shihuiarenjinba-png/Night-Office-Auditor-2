"use strict";
const fs=require("node:fs");
function rewrite(xml,env){
 const version=env.NIGHT_PAID_STORE_VERSION;
 const tag=(xml.match(/<Identity\b[^>]*>/g)||[]);
 if(tag.length!==1)throw Error("Expected exactly one MSIX Identity");
 function attribute(element,name){
  const m=element.match(new RegExp("\\b"+name+"\\s*=\\s*([\"'])(.*?)\\1"));
  if(!m)throw Error("Manifest missing "+name);
  return m[2].replace(/&amp;/g,"&").replace(/&quot;/g,'"');
 }
 if(attribute(tag[0],"Name")!==env.NIGHT_PAID_IDENTITY_NAME)throw Error("MSIX Identity Name mismatch");
 if(attribute(tag[0],"Publisher")!==env.NIGHT_PAID_PUBLISHER)throw Error("MSIX Publisher mismatch");
 if(!/\bVersion\s*=\s*(["'])(.*?)\1/.test(tag[0]))throw Error("MSIX Identity Version missing");
 const updated=tag[0].replace(/\bVersion\s*=\s*(["'])(.*?)\1/,'Version="'+version+'"');
 return xml.replace(tag[0],updated);
}
module.exports={rewrite};
module.exports.default=async file=>{
 if(!file)throw Error("Manifest hook requires file");
 fs.writeFileSync(file,rewrite(fs.readFileSync(file,"utf8"),process.env),"utf8");
};
