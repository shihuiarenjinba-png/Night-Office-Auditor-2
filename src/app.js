/* Night Office Auditor Expanded — UI controller. */
(()=>{"use strict";
const G=globalThis.NightOfficeGame,Q=globalThis.NightOfficeQuestions,W=globalThis.NightOfficeWitnesses,$=id=>document.getElementById(id),KEY="night-office-auditor-expanded:save:v3",NOTEKEY="night-office-auditor-expanded:notes:v1",VOICEKEY="night-office-auditor-expanded:voices:v1";
let state=null,lastReport=null,unreadableRaw=null,recoveryBlocked=false,notice="",notebook={version:1,index:0,seed:20261024,choice:null,docs:[]},conversations=Array(24).fill(null);
const el=(tag,text,cls)=>{const x=document.createElement(tag);if(text!==undefined)x.textContent=text;if(cls)x.className=cls;return x;};
function load(){let raw=null;try{raw=localStorage.getItem(KEY);return raw?G.validate(JSON.parse(raw)):G.initial();}catch{unreadableRaw=raw;recoveryBlocked=true;notice="保存記録を確認できません。元データは保持しています。";return G.initial();}}
function emptyNote(){return {version:1,index:state.index,seed:state.seed,choice:null,docs:[]};}
function validateNote(raw){
 const valid=raw&&raw.version===1&&raw.index===state.index&&raw.seed===state.seed&&Array.isArray(raw.docs)&&raw.docs.length<=2&&new Set(raw.docs).size===raw.docs.length&&
 raw.docs.every(id=>state.active.checked.includes(id))&&[null,"clear","review","escalate"].includes(raw.choice);
 return valid?{version:1,index:raw.index,seed:raw.seed,choice:raw.choice,docs:[...raw.docs]}:null;
}
function loadNote(){
 notebook=emptyNote();
 try{const raw=localStorage.getItem(NOTEKEY);if(raw){const parsed=JSON.parse(raw),v=validateNote(parsed);if(v)notebook=v;}}
 catch{notice="前回の推理メモを読み込めません。監査記録自体は保持されています。";}
}
function saveNote(){
 if(recoveryBlocked)return;
 try{localStorage.setItem(NOTEKEY,JSON.stringify(notebook));}
 catch{notice="推理メモの保存に失敗しました。";}
}
function changeProof(id,on){
 if(recoveryBlocked||state.complete||!state.active.checked.includes(id))return;
 if(on){if(!notebook.docs.includes(id)&&notebook.docs.length<2)notebook.docs.push(id);}
 else notebook.docs=notebook.docs.filter(x=>x!==id);
 saveNote();render();
}
function chooseAnswer(id){if(recoveryBlocked||state.complete)return;notebook.choice=id;saveNote();render();}
function canSubmit(){return notebook.choice==="review"||(
 notebook.choice!==null&&notebook.docs.length===2&&
 notebook.docs.every(id=>state.active.checked.includes(id)));}
function submitDecision(){
 if(recoveryBlocked||state.complete||!canSubmit())return;
 const c=G.current(state),q=Q[state.index],label=q.options.find(o=>o.id===notebook.choice)?.label||"";
 const shown=notebook.docs.map(id=>c.findings.find(x=>x.id===id)?.documentId).filter(Boolean);
 if(!confirm("「"+label+"」と報告しますか？\n根拠："+(shown.join("・")||"追加照会")+"\n報告後に、記録の照合結果が開示されます。"))return;
 try{
  const out=G.decide(state,notebook.choice);
  state=out.state;lastReport=out.report;notice=out.report.correct?
   "監査報告を提出しました。":"報告を提出しました。資料照合の説明を確認してください。";
  notebook=emptyNote();saveNote();persist();render();
  globalThis.OperationTabs?.open("result",{sound:true});
 }catch(e){notice=e.message;render();}
}
function validateVoices(data){
 if(!Array.isArray(data)||data.length!==24||data.some(x=>![null,"careful","press"].includes(x)))return null;
 return [...data];
}
function loadVoices(){
 conversations=Array(24).fill(null);
 try{const raw=localStorage.getItem(VOICEKEY);if(raw){const payload=JSON.parse(raw);if(payload.seed===state.seed&&validateVoices(payload.choices))conversations=validateVoices(payload.choices);}}
 catch{notice="以前の聞取りメモを読み込めません。監査記録は保持されています。";}
}
function saveVoices(){
 if(recoveryBlocked)return;
 try{localStorage.setItem(VOICEKEY,JSON.stringify({seed:state.seed,choices:conversations}));}
 catch{notice="会話記録を保存できません。";}
}
function interview(choice){
 if(state.complete||recoveryBlocked||conversations[state.index]!==null||!["careful","press"].includes(choice))return;
 conversations[state.index]=choice;saveVoices();render();
}
function witness(c){
 const root=$("witnessChoices");root.replaceChildren();
 if(recoveryBlocked){$("witnessPanel").hidden=true;return;}
 $("witnessPanel").hidden=false;
 if(c.complete){
  const joined=conversations.filter(Boolean);
  const supportive=joined.filter(x=>x==="careful").length;
  $("witnessName").textContent="夜明け前、監査室で";
  $("witnessContext").textContent=joined.length?
   "関係者と話し合った夜は"+joined.length+"回。そのうち"+supportive+"回、協力を求める聞取りを選んだ。":
   "記録だけを頼りに監査を終えた。";
  $("witnessReply").textContent=supportive>joined.length/2?"仲村「最後まで話を聞いてくれて、ありがとう。次の夜も協力します」":
   joined.length?"島袋「証拠は確かに残った。信頼を取り戻すには、これからの説明が必要だ」":"仲村「証拠の記録は残っています。今度は人の声も聞いてください」";
  return;
 }
 const info=W.speaking(state.index,conversations[state.index],conversations.slice(0,state.index));
 $("witnessName").textContent=info.name;
 $("witnessContext").textContent=info.callback||"あなたはどんな姿勢でこの人に話を聞きますか？";
 $("witnessReply").textContent=info.reply?"「"+info.reply+"」":"";
 if(!conversations[state.index]){
  for(const [choice,label] of [["careful","協力を求め、話を聞く"],["press","矛盾点について、説明を求める"]]){
   const btn=el("button",label,"witness-choice");btn.type="button";
   btn.addEventListener("click",()=>interview(choice));root.append(btn);
  }
 }
}
function persist(){if(recoveryBlocked)return false;try{localStorage.setItem(KEY,JSON.stringify(state));return true;}catch{notice="自動保存できません。必要ならセーブを書き出してください。";return false;}}
function stats(c){$("count").textContent=state.complete?G.CASE_COUNT+" / "+G.CASE_COUNT:c.caseNumber+" / "+G.CASE_COUNT;$("score").textContent=state.score.toLocaleString("ja-JP");$("trust").textContent=state.trust+" / 100";$("time").textContent=state.complete?"終了":c.minutesLeft+"分";}
function caseView(c){
 if(c.complete){$("caseNo").textContent=String(G.CASE_COUNT).padStart(2,"0");$("chapterLabel").textContent="CASE FILE COMPLETE";$("caseTitle").textContent=c.rating;$("locationLine").textContent="夜明けが来た。24件の記録は閉じられた。";$("caseStory").textContent="評価点 "+c.finalScore.toLocaleString("ja-JP")+" / 信用 "+c.finalTrust+"。記録はセーブ画面から確認できます。";$("caseNote").textContent="終わった案件も、記録として残る。";$("signatureLine").textContent="夜が明けても、証拠は残る。";return;}
 $("caseNo").textContent=String(c.caseNumber).padStart(2,"0");$("chapterLabel").textContent=c.chapter;$("caseTitle").textContent=c.title;$("locationLine").textContent="今夜の事件は、"+c.location+"で起きている。";$("caseStory").textContent=c.story;$("caseNote").textContent=c.note;$("signatureLine").textContent=c.signature;
}
function timer(c){const remain=recoveryBlocked||c.complete?0:c.minutesLeft;$("timerTitle").textContent=c.complete?"調査完了":"残り"+remain+"分";$("timerBar").value=remain;}
function sources(c){const root=$("sources"),found=$("findings");root.replaceChildren();found.replaceChildren();if(recoveryBlocked||c.complete){root.append(el("p",recoveryBlocked?"保存記録の復旧が必要です。":"24件の調査は完了しました。","muted"));return;}for(const source of c.sources){const b=el("button",undefined,source.checked?"source checked":"source");b.type="button";b.disabled=!source.available||recoveryBlocked;b.append(el("strong",source.label),el("span",source.checked?"確認済み":source.available?"調査時間 "+source.cost+"分":"残り時間不足"));b.addEventListener("click",()=>{try{state=G.inspect(state,source.id).state;notice="";persist();render();}catch(e){notice=e.message;render();}});root.append(b);}if(!c.findings.length)found.append(el("p","まだ証拠を開いていません。何を調べるか選んでください。","muted"));for(const f of c.findings){const card=el("div",undefined,"finding");card.append(el("strong",f.title),el("small",f.reliability),el("p",f.detail));found.append(card);}}
function choices(c){
 const root=$("choices"),docRoot=$("selectedDocuments");
 root.replaceChildren();docRoot.replaceChildren();$("submitDecision").disabled=true;
 if(recoveryBlocked||c.complete){
  docRoot.append(el("p",recoveryBlocked?"保存記録を復旧してください。":"報告は完了しています。","muted"));
  return;
 }
 const q=Q[state.index];$("caseQuestion").textContent=q.question;
 if(!c.findings.length)docRoot.append(el("p","証拠・資料の画面で、まず記録を開いてください。","muted"));
 for(const f of c.findings){
  const row=el("label",undefined,"document-choice"+(notebook.docs.includes(f.id)?" chosen":""));
  const input=el("input");input.type="checkbox";input.checked=notebook.docs.includes(f.id);
  input.setAttribute("aria-label",f.documentId+"を根拠にする");
  input.addEventListener("change",()=>changeProof(f.id,input.checked));
  row.append(input,el("span",f.documentId+" / "+f.title));docRoot.append(row);
 }
 for(const opt of q.options){
  const row=el("label",undefined,"deduction-option"+(notebook.choice===opt.id?" chosen":""));
  const inp=el("input");inp.type="radio";inp.name="deduction-answer";inp.value=opt.id;
  inp.checked=notebook.choice===opt.id;
  inp.addEventListener("change",()=>chooseAnswer(opt.id));
  row.append(inp,el("span",opt.label));root.append(row);
 }
 $("submitDecision").disabled=!canSubmit();
 $("submitDecision").textContent=notebook.choice==="review"?"追加調査として報告する":"この内容で監査報告する";
}
function result(){const root=$("result");root.replaceChildren();if(!lastReport){root.append(el("p",state.history.length?"直近の判定は保存されています。記録・セーブ画面で確認できます。":"報告後、ここに今回の判断結果が表示されます。","muted"));$("nextCase").hidden=true;return;}const r=lastReport,card=el("div",undefined,"result-card"),metrics=el("div",undefined,"result-metrics");for(const [name,val] of [["今回の評価点",(r.scoreDelta>=0?"+":"")+r.scoreDelta],["信用の変化",(r.trustDelta>=0?"+":"")+r.trustDelta]]){const d=el("div");d.append(el("small",name),el("strong",val));metrics.append(d);}card.append(el("h3",r.caseNumber+"件目「"+r.title+"」"),el("p",r.location),metrics,
 el("p","あなたの報告："+r.judgment),el("p","資料照合後の判定："+r.actual),
 el("p",r.message,r.correct&&r.supported?"good":"bad"));
 const review=el("section",undefined,"proof-review");
 review.append(el("h4","監査室による報告後の照合"));
 review.append(el("p","報告後に3種類の原始資料を再照合した結果です。調査していない資料は報告前に知り得た情報として扱いません。","muted"));
 for(const doc of r.postReviewDocuments){
  const item=el("div",undefined,"proof-document");
  item.append(el("strong",doc.id+" / "+doc.title),el("span",doc.reviewed?"報告前に確認済み":"報告後に開示"),el("p",doc.detail));
  review.append(item);
 }
 review.append(el("h4","資料から導ける結論"),el("p",r.proofExplanation),
  el("h4","別の説明を退ける理由"),el("p",r.alternative),
  el("h4","断定してはいけないこと"),el("p",r.attributionLimits));
 card.append(review);root.append(card);$("nextCase").hidden=state.complete||recoveryBlocked;}
function history(){const root=$("history");root.replaceChildren();if(!state.history.length){root.append(el("p","まだ監査記録はありません。","muted"));return;}for(const h of state.history.slice(-12).reverse()){const c=G.CHOICES.find(x=>x.id===h.choice),a=G.CHOICES[h.truth],row=el("div",(h.index+1)+"件目 ｜ "+c.label+" / 実際："+a.label+" ｜ 評価 "+(h.scoreDelta>=0?"+":"")+h.scoreDelta,"history-row");root.append(row);}}
function render(){const c=G.current(state);stats(c);caseView(c);witness(c);timer(c);sources(c);choices(c);result();history();$("warning").textContent=notice;}
function download(name,raw){const url=URL.createObjectURL(new Blob([raw],{type:"application/json"})),a=el("a");a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function exportSave(){if(recoveryBlocked&&unreadableRaw===null){alert("元データを取得できません。");return;}download(recoveryBlocked?"night-office-expanded-unreadable.json":"night-office-expanded-case-"+state.index+".json",recoveryBlocked?unreadableRaw:JSON.stringify({schema:G.VERSION,state,notebook,conversations},null,2));}
async function importSave(file){if(!file)return;try{if(file.size>500000)throw Error("セーブファイルが大きすぎます。");const payload=JSON.parse(await file.text());if(payload.schema!==G.VERSION)throw Error("対応していないセーブバージョンです。");const next=G.validate(payload.state);if(!confirm("現在の進行状況を読み込んだ記録で置き換えますか？"))return;state=next;lastReport=null;unreadableRaw=null;recoveryBlocked=false;notebook=emptyNote();const restored=payload.notebook?validateNote(payload.notebook):null;if(restored)notebook=restored;saveNote();conversations=validateVoices(payload.conversations)||Array(24).fill(null);saveVoices();notice="セーブを読み込みました。";persist();render();}catch(e){alert("セーブ読込に失敗しました："+e.message);}}
function init(){state=load();loadNote();loadVoices();if(!recoveryBlocked)persist();render();$("submitDecision").addEventListener("click",submitDecision);$("nextCase").addEventListener("click",()=>{lastReport=null;render();globalThis.OperationTabs?.open("case",{sound:true});});$("export").addEventListener("click",exportSave);$("import").addEventListener("click",()=>$("savefile").click());$("savefile").addEventListener("change",e=>{const f=e.target.files[0];e.target.value="";void importSave(f);});$("reset").addEventListener("click",()=>{if(!confirm("24案件の進行を消して最初から始めますか？"))return;state=G.initial();lastReport=null;unreadableRaw=null;recoveryBlocked=false;notebook=emptyNote();saveNote();conversations=Array(24).fill(null);saveVoices();notice="新しい夜を始めました。";persist();render();globalThis.OperationTabs?.open("case",{sound:true});});}
document.addEventListener("DOMContentLoaded",init);
})();