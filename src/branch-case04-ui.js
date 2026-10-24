/* Offline CASE04 branching investigation renderer — no network, distinct save key. */
(()=>{"use strict";
 const G=globalThis.Case04Branch,KEY="night-office-expanded-case04-branch:v1";
 const $=id=>document.getElementById(id);
 const make=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
 let state=G.initial(),blocked=false,audio=null;
 function sound(){try{const A=window.AudioContext||window.webkitAudioContext;if(!A)return;audio??=new A();if(audio.state==="suspended")void audio.resume();const t=audio.currentTime,o=audio.createOscillator(),g=audio.createGain();o.type="triangle";o.frequency.setValueAtTime(330,t);o.frequency.exponentialRampToValueAtTime(475,t+.07);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.045,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+.09);o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+.1);}catch{/* navigation still works */}}
 function switchTab(id,play=true){
  const screens=[...document.querySelectorAll("[data-screen]")];
  if(!screens.some(e=>e.dataset.screen===id))return;
  for(const e of screens)e.hidden=e.dataset.screen!==id;
  for(const b of document.querySelectorAll("[data-tab]"))b.setAttribute("aria-selected",String(b.dataset.tab===id));
  if(play)sound();
 }
 function tone(n){return n>0?"協力的":n<0?"警戒":"様子見";}
 function persist(){try{localStorage.setItem(KEY,JSON.stringify(state));return true;}catch{$("error").textContent="ブラウザの自動保存が利用できません。この画面内の操作は継続できます。";return false;}}
 function renderGuidance(v){
  const g=v.guidance;
  $("mainQuestion").textContent=g.caseQuestion;
  $("guideHeading").textContent=g.heading;
  $("guideNext").textContent=g.next;
  const steps=$("proofSteps");steps.replaceChildren();
  for(const step of g.milestones){
   const e=make("span",step.label,step.ready?"proof-step ready":"proof-step");
   e.setAttribute("aria-label",step.label+(step.ready?"確認済み":"未確認"));
   steps.append(e);
  }
  const box=$("discovery");box.hidden=!g.latest;box.replaceChildren();
  if(g.latest){box.append(make("small","今回の調査で判明したこと"),make("h3",g.latest.title),
    make("p",g.latest.text),make("strong","次の手がかり → "+g.latest.next));}
 }
 function render(){
  const v=G.view(state);
  renderGuidance(v);
  $("minutes").textContent=v.minutes+"分";$("nakamura").textContent=tone(v.staff.nakamura);
  $("shimabukuro").textContent=tone(v.staff.shimabukuro);$("documentCount").textContent=v.documents.length+" / 3";
  $("phase").textContent=v.stage==="finished"?"CASE 04 / THE CONSEQUENCE":"CASE 04 / INVESTIGATION";
  $("speaker").textContent=v.speaker;$("line").textContent=v.line;
  const options=$("choices");options.replaceChildren();
  for(const a of v.actions){const b=make("button");b.type="button";b.disabled=blocked;
   if(["confrontation","rush_report","escalate","pressure","demand"].includes(a.id))b.classList.add("risky");
   b.append(make("strong",a.label),make("span",a.hint));b.addEventListener("click",()=>{
    try{state=G.choose(state,a.id);$("error").textContent="";persist();render();switchTab("interview",false);}
    catch(e){$("error").textContent=e.message;}
   });options.append(b);}
  const end=$("ending");end.hidden=!v.ending;end.replaceChildren();
  if(v.ending){
   const titles={substantiated:"証拠が結びついた結末",unsubstantiated:"正解でも、立証できなかった結末",pending:"調査が持ち越された結末",false_accusation:"誤告発の責任を問われる結末"};
   end.append(make("h3",titles[v.ending]),make("p",v.epilogue),make("p","報告の結論と、関係者の協力関係は別々に記録されます。"));
   const proof=make("div",undefined,"afterword");
   proof.append(make("strong","報告後の事実照合（ここから先は答え合わせ）"));
   proof.append(make("p","N04-L: 紙の署名は空欄だが、発注番号PO-044には電子承認ID EVT-044が紐づいていた。"));
   proof.append(make("p","N04-T: 承認は発注の23分前で、後付け変更の履歴はない。"));
   proof.append(make("p","N04-A: 社内規程第3条の代理権限と金城の電子署名が EVT-044 に一致。"));
   proof.append(make("p",v.proven?
    "あなたはこれら3つの資料を調べてから報告したため、結論を立証できた。":
    "事件の真相は正式な代理承認だった。しかし報告前に3つの証拠を揃えていないため、あなたの報告からはそこまで立証できなかった。"));
   end.append(proof);
  }
  const docs=$("documents");docs.replaceChildren();
  for(const [key,detail] of Object.entries(G.documents)){
   const has=v.documents.some(d=>d.id===detail.id);
   const card=make("article",undefined,has?"record":"record unseen");
   if(has)card.append(make("small",detail.id),make("h3",detail.label),make("p",detail.body));
   else card.append(make("small",detail.id+" / 未入手"),make("p","この資料は、まだ調べていません。"));
   docs.append(card);
  }
  const hist=$("history");hist.replaceChildren();
  if(!v.history.length)hist.append(make("p","まだ調査は始まっていません。","event"));
  for(const h of v.history){const row=make("div",undefined,"event");row.append(make("strong",h.speaker),make("span",h.text));hist.append(row);}
  const persons=$("people");persons.replaceChildren();
  for(const [id,p] of Object.entries(G.people)){
   const box=make("article",undefined,"person");const hidden=id==="kinjo"&&v.stage!=="policy"&&!v.history.some(h=>h.speaker==="金城");box.append(make("strong",hidden?"人物ファイル未開示 / 関係者の権限は未確認":p.name+" / "+p.role),make("p",hidden?"署名欄から、誰が承認権限を持つかはまだ判断できません。":p.trait));
   if(id!=="kinjo")box.append(make("p","関係："+tone(v.staff[id])));
   persons.append(box);
  }
 }
 function init(){
  try{const raw=localStorage.getItem(KEY);if(raw){const parsed=JSON.parse(raw);G.replay(parsed);state=parsed;}}
  catch(e){blocked=true;$("error").textContent="過去の試作セーブを読めません。元データは保持しました。やり直す場合のみリセットしてください。";}
  render();
  for(const b of document.querySelectorAll("[data-tab]"))b.addEventListener("click",()=>switchTab(b.dataset.tab));
  $("start").addEventListener("click",()=>switchTab("interview"));
  $("reset").addEventListener("click",()=>{
   if(!confirm("分岐試作の調査履歴を消して初めからやり直しますか？（本編24案件のセーブには影響しません）"))return;
   try{localStorage.removeItem(KEY);}catch{}
   blocked=false;state=G.initial();$("error").textContent="";render();switchTab("scene");
  });
 }
 document.addEventListener("DOMContentLoaded",init);
})();