"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const {validate,readRecord}=require("../scripts/paid-msix-preflight.cjs");
const {paint}=require("../scripts/make-paid-msix-icons.cjs");
const {rewrite}=require("../scripts/paid-msix-manifest-hook.cjs");
const sha="a".repeat(40);
const env=()=>({SOURCE_GIT_COMMIT:sha});
const current=()=>readRecord();
test("only source commit and owner-confirmed independent Identity may produce a QA-only candidate",()=>{
 const unverified=validate({});assert.equal(unverified.ready,false);
 const verified=validate(env());
 assert.equal(verified.ready,true,verified.errors.join("\n"));
 assert.equal(verified.storeVersionVerified,false,"screenshot does not show Store package version");
 assert.equal(verified.value.identityName,"OkinawaDesktopTools.13632C049648B");
 assert.equal(verified.value.storeId,"9NJ0Q36BQ0G4");
 assert.equal(verified.value.version,"0.1.0.0");
});
test("12-case identity and Store ID are refused even with a confirmed screenshot flag",()=>{
 const record=current();
 record.identityName="OkinawaDesktopTools.NightOfficeAuditor";
 record.storeId="9P6SQX67J3R9";
 const r=validate(env(),record);
 assert.equal(r.ready,false);assert.match(r.errors.join(" "),/cannot be reused/);
});
test("actions variables cannot override screenshot values, missing version cannot be promoted",()=>{
 const r=validate({...env(),NIGHT_PAID_IDENTITY_NAME:"TestOnly.Fake"});
 assert.equal(r.ready,false);assert.match(r.errors.join(" "),/conflicts/);
 const b=validate({...env(),NIGHT_PAID_STORE_VERSION:"1.0.0.0"});
 assert.equal(b.ready,false);assert.match(b.errors.join(" "),/without a verified reservation/);
 const blocked=validate({...env(),NIGHT_PAID_IDENTITY_OWNER_CONFIRMED:"HOLD"});
 assert.equal(blocked.ready,false);
});
test("manifest hook checks Identity, product display names and QA-only version",()=>{
 const input='<Package><Identity Name="OkinawaDesktopTools.13632C049648B" Publisher="CN=46263F21-A700-41DB-8C9B-114C22FB82FC" Version="0.1.0.0"/>'+
 '<Properties><DisplayName>深夜監査室</DisplayName><PublisherDisplayName>Okinawa Desktop Tools</PublisherDisplayName></Properties>'+
 '<Applications><Application><uap:VisualElements DisplayName="深夜監査室"/></Application></Applications></Package>';
 const output=rewrite(input,env());assert.match(output,/Version="0\.1\.0\.0"/);
 assert.throws(()=>rewrite(input,{...env(),NIGHT_PAID_IDENTITY_NAME:"Fake.Name"}),/conflicts/);
 assert.throws(()=>rewrite(input.replace('VisualElements DisplayName="深夜監査室"','VisualElements DisplayName="Wrong"'),env()),/VisualElements DisplayName mismatch/);
});
test("candidate PNG assets have valid width and height",()=>{
 for(const [w,h] of [[44,44],[50,50],[150,150],[310,150]]){
  const png=paint(w,h);assert.equal(png.subarray(0,8).toString("hex"),"89504e470d0a1a0a");
  assert.equal(png.readUInt32BE(16),w);assert.equal(png.readUInt32BE(20),h);
 }
});
