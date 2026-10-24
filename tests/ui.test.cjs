"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm");
const html=fs.readFileSync("index.html","utf8"),tabs=fs.readFileSync("src/operation-tabs.js","utf8"),app=fs.readFileSync("src/app.js","utf8");
test("five paid-edition screens and tab controls exist",()=>{
 for(const id of ["case","evidence","decision","result","save"]){assert.match(html,new RegExp('data-screen="'+id+'"'));assert.match(html,new RegExp('data-tab="'+id+'"'));}
 assert.equal((html.match(/data-tab=/g)||[]).length,5);
});
test("UI includes location line, signature line and 24-case HUD",()=>{
 assert.match(html,/id="locationLine"/);assert.match(html,/id="signatureLine"/);assert.match(html,/1 \/ 24/);
 assert.match(app,/今夜の事件は、/);
});
test("tabs synthesize an optional local sound and contain no network calls",()=>{
 assert.match(tabs,/AudioContext/);assert.match(tabs,/createOscillator/);
 assert.doesNotMatch(tabs,/fetch\(|XMLHttpRequest|sendBeacon/);assert.doesNotThrow(()=>new vm.Script(tabs));
});
test("renderer uses isolated expanded save key and no network calls",()=>{
 assert.match(app,/night-office-auditor-expanded:save:v3/);assert.doesNotMatch(app,/fetch\(|XMLHttpRequest|sendBeacon/);
});
test("CSP blocks network access",()=>{assert.match(html,/connect-src 'none'/);assert.doesNotMatch(html,/<script[^>]+src="https?:/);});
