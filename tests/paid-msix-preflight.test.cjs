"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const {validate}=require("../scripts/paid-msix-preflight.cjs");
const {paint}=require("../scripts/make-paid-msix-icons.cjs");
const {rewrite}=require("../scripts/paid-msix-manifest-hook.cjs");
function example(){
 // Test-only values: NOT a real Store account, Identity or registration.
 return {
  SOURCE_GIT_COMMIT:"a".repeat(40),NIGHT_PAID_IDENTITY_OWNER_CONFIRMED:"YES",
  NIGHT_PAID_STORE_ID:"FAKETEST0000",
  NIGHT_PAID_IDENTITY_NAME:"TestOnly.UnregisteredPaidEdition",
  NIGHT_PAID_PUBLISHER:"CN=TestOnly-Not-A-Publisher",
  NIGHT_PAID_PUBLISHER_DISPLAY_NAME:"Test-Only",
  NIGHT_PAID_STORE_DISPLAY_NAME:"Test edition",
  NIGHT_PAID_STORE_VERSION:"1.0.0.0"
 };
}
test("independent Store identity is mandatory for a paid MSIX",()=>{
 const e=validate({SOURCE_GIT_COMMIT:"a".repeat(40)});
 assert.equal(e.ready,false);
 assert.match(e.errors.join(" "),/NIGHT_PAID_IDENTITY_NAME/);
});
test("cheap 12-case Identity and Store ID are rejected even if marked approved",()=>{
 const env=example();env.NIGHT_PAID_IDENTITY_NAME="OkinawaDesktopTools.NightOfficeAuditor";
 env.NIGHT_PAID_STORE_ID="9P6SQX67J3R9";
 assert.equal(validate(env).ready,false);
 assert.match(validate(env).errors.join(" "),/cannot be reused/);
});
test("Store Version and explicit owner confirmation must pass independently",()=>{
 const env=example();env.NIGHT_PAID_STORE_VERSION="1.0.0.3";
 assert.equal(validate(env).ready,false);
 env.NIGHT_PAID_STORE_VERSION="1.0.0.0";env.NIGHT_PAID_IDENTITY_OWNER_CONFIRMED="HOLD";
 assert.equal(validate(env).ready,false);
 env.NIGHT_PAID_IDENTITY_OWNER_CONFIRMED="YES";
 assert.equal(validate(env).ready,true);
});
test("manifest hook verifies exact Identity, both display names and approved Version",()=>{
 const input='<Package><Identity Name="TestOnly.UnregisteredPaidEdition" Publisher="CN=TestOnly-Not-A-Publisher" Version="0.1.0.0"/>'+
 '<Properties><DisplayName>Test edition</DisplayName><PublisherDisplayName>Test-Only</PublisherDisplayName></Properties>'+
 '<Applications><Application><uap:VisualElements DisplayName="Test edition"/></Application></Applications></Package>';
 const env=example(),output=rewrite(input,env);
 assert.match(output,/Version="1\.0\.0\.0"/);
 assert.throws(()=>rewrite(input,{...env,NIGHT_PAID_PUBLISHER:"CN=other"}),/Publisher mismatch/);
 assert.throws(()=>rewrite(input,{...env,NIGHT_PAID_STORE_DISPLAY_NAME:"Wrong title"}),/DisplayName mismatch/);
 assert.throws(()=>rewrite(input,{...env,NIGHT_PAID_PUBLISHER_DISPLAY_NAME:"Wrong publisher name"}),/PublisherDisplayName mismatch/);
 assert.throws(()=>rewrite(input.replace('VisualElements DisplayName="Test edition"','VisualElements DisplayName="Wrong title"'),env),/VisualElements DisplayName mismatch/);
});
test("candidate icons are valid PNG images with intended dimensions",()=>{
 for(const [w,h] of [[44,44],[50,50],[150,150],[310,150]]){
  const png=paint(w,h);assert.equal(png.subarray(0,8).toString("hex"),"89504e470d0a1a0a");
  assert.equal(png.readUInt32BE(16),w);assert.equal(png.readUInt32BE(20),h);
 }
});
