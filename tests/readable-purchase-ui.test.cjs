"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs");
const css=fs.readFileSync("styles.css","utf8");
const patterns=[
 [".hud span",12],
 [".case-number small",12],
 [".chapter",12],
 [".operation-tabs button small",12],
 [".screen-title small",12],
 [".evidence-preview h3 span",12]
];
test("player-facing status, navigation and chapter metadata never regress to microscopic type",()=>{
 for(const [selector,min] of patterns){
  const before=css.indexOf(selector+"{");
  assert.ok(before>=0,"missing buyer-facing selector "+selector);
  const tail=css.slice(before+selector.length+1);
  const rule=tail.slice(0,tail.indexOf("}"));
  const match=rule.match(/(?:^|;)font(?::|-size:)(?:[^;]*?\s)?(\d+)px/);
  assert.ok(match,"missing font size for "+selector+": "+rule);
  assert.ok(Number(match[1])>=min,selector+" is only "+match[1]+"px; minimum "+min+"px");
 }
});
test("1024px navigation can collapse from fixed sidebar into scrolling tabs",()=>{
 assert.match(css,/@media\(max-width:1120px\)/);
 assert.match(css,/\.operation-tabs\{position:sticky;top:0;right:auto;width:auto;display:flex;flex-direction:row;overflow-x:auto/);
});
test("reduced-motion visitors are not forced into animated transitions",()=>{
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});
