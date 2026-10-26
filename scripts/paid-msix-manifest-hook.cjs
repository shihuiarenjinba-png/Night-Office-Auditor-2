"use strict";
const fs=require("node:fs");
const {validate}=require("./paid-msix-preflight.cjs");
function decode(v){
 return String(v).replace(/&lt;/g,"<").replace(/&gt;/g,">")
  .replace(/&quot;/g,'"').replace(/&apos;/g,"'")
  .replace(/&#x([0-9a-f]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16)))
  .replace(/&#([0-9]+);/g,(_,n)=>String.fromCodePoint(parseInt(n,10)))
  .replace(/&amp;/g,"&");
}
function attribute(element,name){
 const all=Array.from(element.matchAll(new RegExp("\\b"+name+"\\s*=\\s*([\"'])(.*?)\\1","g")));
 if(all.length!==1)throw Error("MSIX Manifest attribute "+name+" must occur exactly once");
 return decode(all[0][2]);
}
function singleMatch(input,re,label){
 const found=Array.from(input.matchAll(re));
 if(found.length!==1)throw Error("MSIX Manifest needs exactly one "+label);
 return found[0];
}
function rewrite(xml,env){
 const gate=validate(env);
 if(!gate.ready)throw Error("Owner-confirmed paid Identity is required: "+gate.errors.join(" | "));
 const tag=singleMatch(xml,/<Identity\b[^>]*>/g,"Identity")[0];
 if(attribute(tag,"Name")!==env.NIGHT_PAID_IDENTITY_NAME)throw Error("MSIX Identity Name mismatch");
 if(attribute(tag,"Publisher")!==env.NIGHT_PAID_PUBLISHER)throw Error("MSIX Publisher mismatch");
 const props=singleMatch(xml,/<Properties\b[^>]*>([\s\S]*?)<\/Properties>/g,"Properties")[1];
 const display=singleMatch(props,/<DisplayName\b[^>]*>([\s\S]*?)<\/DisplayName>/g,"Properties/DisplayName")[1];
 const publisher=singleMatch(props,/<PublisherDisplayName\b[^>]*>([\s\S]*?)<\/PublisherDisplayName>/g,"Properties/PublisherDisplayName")[1];
 if(decode(display.trim())!==env.NIGHT_PAID_STORE_DISPLAY_NAME)throw Error("MSIX DisplayName mismatch");
 if(decode(publisher.trim())!==env.NIGHT_PAID_PUBLISHER_DISPLAY_NAME)throw Error("MSIX PublisherDisplayName mismatch");
 const visual=singleMatch(xml,/<(?:[A-Za-z0-9_-]+:)?VisualElements\b[^>]*>/g,"VisualElements")[0];
 if(attribute(visual,"DisplayName")!==env.NIGHT_PAID_STORE_DISPLAY_NAME)throw Error("MSIX VisualElements DisplayName mismatch");
 const validVersion=attribute(tag,"Version");
 if(!/^\d+\.\d+\.\d+\.\d+$/.test(validVersion))throw Error("MSIX original Version malformed");
 const updated=tag.replace(/\bVersion\s*=\s*(["'])(.*?)\1/,'Version="'+env.NIGHT_PAID_STORE_VERSION+'"');
 if(updated===tag)throw Error("MSIX Version replacement failed");
 return xml.replace(tag,updated);
}
module.exports={rewrite,decode};
module.exports.default=async file=>{
 if(!file)throw Error("Manifest hook requires file");
 fs.writeFileSync(file,rewrite(fs.readFileSync(file,"utf8"),process.env),"utf8");
};
