/* Campaign renderer: permanent facts, player-authored hypotheses, delayed grading. */
(()=>{"use strict";
const G=globalThis.NightDeductionCampaign,KEY="night-office-three-night-deduction:v1";
const $=id=>document.getElementById(id);
const dom=(tag,t,cls)=>{const x=document.createElement(tag);if(t!==undefined)x.textContent=t;if(cls)x.className=cls;return x;};
let save=G.initial(),current="01",selected=[],blocked=false,audio=null;
function sound(){
 try{const A=window.AudioContext||window.webkitAudioContext;if(!A)return;
 audio??=new A();if(audio.state==="suspended")void audio.resume();
 const t=audio.currentTime,o=audio.createOscillator(),g=audio.createGain();
 o.type="triangle";o.frequency.setValueAtTime(340,t);o.frequency.exponentialRampToValueAtTime(480,t+.05);
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.045,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+.07);
 o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+.08);}catch{}
}
function msg(v){$("notice").textContent=v||"";}
function write(){
 if(blocked)return;
 try{localStorage.setItem(KEY,JSON.stringify(save));}
 catch{msg("自動保存できません。この画面内の操作は続行できます。");}
}
function act(action,feedback){
 try{save=G.apply(save,action);write();msg(feedback||"");render();return true;}
 catch(e){msg(e.message);return false;}
}
function selectedCase(){return G.view(save).cases.find(x=>x.id===current);}
function switchCase(id){
 const v=G.view(save);if(!v.unlocked.includes(id))return;
 current=id;selected=[];render();sound();
}
function addCard(id){
 const v=selectedCase(),card=v.cards.find(x=>x.id===id);
 if(!card||blocked||v.complete)return;
 if(!card.opened){
  if(v.remaining===0){msg("この事件の開封枠を使い切りました。開いた資料で考えるか、追加調査を報告してください。");return;}
  if(!act({type:"open",caseId:current,cardId:id},"資料「"+card.name+"」を開きました。答えは自分で考えてください。"))return;
 }
 if(selected.includes(id))selected=selected.filter(x=>x!==id);
 else if(selected.length===2)selected=[id];else selected.push(id);
 render();
}
function setApproach(choice){
 act({type:"approach",caseId:current,choice},"聞取り方針を決めました。資料名を見て調査を始めましょう。");
}
function assign(){
 if(selected.length!==2)return;
 const q=$("whichQuestion").value;
 if(act({type:"assign",caseId:current,questionId:q,first:selected[0],second:selected[1]},
  "資料2枚をあなたの仮説として記録しました。合っているかは監査報告後に確認できます。")){selected=[];render();}
}
function answer(q,choice){
 act({type:"answer",caseId:current,questionId:q,choice},"回答を仮記録しました。提出までは変更できます。");
}
function report(choice){
 const names={clear:"問題なし",review:"追加調査",escalate:"重大な不一致"};
 if(!confirm("「"+names[choice]+"」として提出しますか？ 報告後に初めて正誤と資料の照合結果が表示されます。"))return;
 act({type:"report",caseId:current,choice},"報告を記録しました。次の事件を選んでください。");
}
function final(choice){
 if(!confirm("3つの事件の総括を確定しますか？"))return;
 act({type:"final",choice},"すべての事件の総括を記録しました。");
}
function render(){
 const v=G.view(save),c=v.cases.find(x=>x.id===current);
 $("campaignProgress").textContent=v.completed+" / 3";
 $("teamStatus").textContent="関係指数 "+v.trust+"｜"+v.teamwork;
 const nav=$("caseSelector");nav.replaceChildren();
 for(const item of v.cases){
  const allowed=v.unlocked.includes(item.id);
  const btn=dom("button",undefined,"case-item"+(item.id===current?" current":""));
  btn.type="button";btn.disabled=!allowed;btn.setAttribute("aria-current",item.id===current?"page":"false");
  btn.append(dom("small",item.chapter),dom("strong","CASE "+item.id+" — "+item.title),
   dom("span",!allowed?"第1事件の報告後に解放":item.complete?"✓ 報告済み":"調査可能"));
  btn.addEventListener("click",()=>switchCase(item.id));nav.append(btn);
 }
 $("chapter").textContent=c.chapter;$("caseTitle").textContent="CASE "+c.id+" — "+c.title;
 $("location").textContent=c.location;$("opening").textContent=c.opening;
 $("storyBeat").textContent=c.story.follow;
 $("teamConsequence").textContent=[c.story.tension,c.story.callback].filter(Boolean).join(" ");

 $("cardTotal").textContent=c.cards.length+"枚";$("revealCount").textContent=c.opened+" / 6";
 $("answerCount").textContent=c.readiness+" / 2";
 $("status").textContent=c.complete?"報告済み":c.approach?"調査中":"聞取り前";
 const people=$("people");people.replaceChildren();
 if(!c.approach){
  people.append(dom("p","まず、どの姿勢で関係者に聞き取るかを選んでください。資料の真相は変わりません。"));
  for(const [k,name] of [["cooperate","状況を聞いて協力を求める"],["confront","記録の不一致を厳しく追及する"]]){
   const btn=dom("button",name,"person-choice");btn.type="button";btn.disabled=blocked;
   btn.addEventListener("click",()=>setApproach(k));people.append(btn);
  }
 }else{
  const p=dom("div",undefined,"person-response");
  p.append(dom("strong",c.voice.name),dom("p","「"+c.voice.line+"」"));people.append(p);
 }
 const qs=$("questionSummary");qs.replaceChildren();
 for(const [i,q] of c.questions.entries()){
  const done=q.assigned&&q.answer;
  const div=dom("article",undefined,"question-status"+(done?" ready":""));
  div.append(dom("small",done?"仮説を記録済み":q.assigned?"資料は登録済み":"未確認"),dom("strong",(i+1)+". "+q.text));
  qs.append(div);
 }
 const deck=$("cards");deck.replaceChildren();
 for(const k of c.cards){
  const button=dom("button",undefined,"evidence-card"+(k.opened?" opened":"")+(selected.includes(k.id)?" selected":""));
  button.type="button";button.disabled=blocked||c.complete||!c.approach||(!k.opened&&c.remaining===0);
  button.setAttribute("aria-pressed",String(selected.includes(k.id)));
  button.setAttribute("aria-label",(k.opened?"開封済み":"未開封")+" "+k.name);
  button.append(dom("small",k.documentId+" / "+k.category),dom("strong",k.name),
   dom("p",k.opened?k.record:"開封すると事実を確認できます。"),
   dom("span",selected.includes(k.id)?"● 選択中":k.opened?"開封済み":c.remaining>0?"未開封":"枠の上限"));
  button.addEventListener("click",()=>addCard(k.id));deck.append(button);
 }
 $("selected").textContent="選択中 "+selected.length+" / 2";
 $("unselectButton").disabled=selected.length===0;
 $("assignButton").disabled=blocked||c.complete||selected.length!==2;
 const questionPicker=$("whichQuestion"),old=questionPicker.value;
 questionPicker.replaceChildren();
 for(const q of c.questions){const o=dom("option",q.text);o.value=q.id;questionPicker.append(o);}
 if(c.questions.some(q=>q.id===old))questionPicker.value=old;
 const area=$("deductionQuestions");area.replaceChildren();
 for(const [i,q] of c.questions.entries()){
  const box=dom("article",undefined,"deduction-question");
  box.append(dom("h4",(i+1)+". "+q.text),
   dom("p",q.assigned?"あなたが指定した資料："+q.assigned.map(id=>c.id+"-"+id).join(" / "):"まだ根拠資料を登録していません。"));
  if(q.assigned){
   const opts=dom("div",undefined,"answers");
   for(const x of q.choices){
    const label=dom("label",undefined,"choice"+(q.answer===x.id?" selected-choice":""));
    const radio=dom("input");radio.type="radio";radio.name="answer-"+c.id+"-"+q.id;radio.value=x.id;
    radio.checked=q.answer===x.id;radio.disabled=blocked||c.complete;
    radio.addEventListener("change",()=>answer(q.id,x.id));
    label.append(radio,dom("span",x.label));opts.append(label);
   }
   box.append(opts,dom("small","回答は報告を出すまで変更できます。正誤は表示しません。"));
  }else box.append(dom("small","上のカードから資料2枚を選び、疑問を指定してください。"));
  area.append(box);
 }
 $("reportPrompt").textContent=c.complete?"この事件の監査報告は完了しました。証拠と結論を再確認できます。":
 c.readiness===2?"2つの疑問に根拠資料と回答を記録しました。監査結果を提出できます。":
 "回答準備 "+c.readiness+" / 2。断定するには2問の根拠が必要です。証拠不足なら追加調査として先へ進めます。";
 const buttons=$("reportButtons");buttons.replaceChildren();
 for(const [id,name,sub] of [["clear","問題なし","不正を裏づける資料はない"],["review","追加調査","確証不足を記録して先に進む"],["escalate","重大な不一致","重大な問題があると報告"]]){
  const btn=dom("button",undefined,"verdict "+id);btn.type="button";
  btn.append(dom("strong",name),dom("span",sub));
  btn.disabled=blocked||c.complete||(id!=="review"&&c.readiness<2);
  btn.addEventListener("click",()=>report(id));buttons.append(btn);
 }
 const result=$("reportResult");result.hidden=!c.complete;result.replaceChildren();
 if(c.complete){
  result.append(dom("h4","報告後の資料照合"),dom("p",c.outcome),
    dom("p","証拠から導ける結論："+c.caseExplanation));
  for(const q of c.questions){
   const d=dom("div",undefined,"graded");
   d.append(dom("strong",q.text),
    dom("p","あなたの選択："+(q.choices.find(x=>x.id===q.answer)?.label||"未回答")),
    dom("p","照合した資料："+(q.assigned?.join(" + ")||"なし")),
    dom("p","正しい資料の組合せ例："+q.allowedPairs.map(p=>p.join(" ＋ ")).join(" ／ ")),
    dom("p","理由："+q.explain),
    dom("small",q.proved?"✓ 資料と結論が整合":"根拠または回答に不足"));
   result.append(d);
  }
  if(c.bonus.revealed)result.append(dom("p","補強調査："+c.bonus.note,"bonus-result"));
 }
 const finale=$("finale");finale.hidden=v.completed<3;
 $("finaleChoices").replaceChildren();
 if(v.completed===3&&!v.finale){
  for(const opt of v.finalChoices){
   const btn=dom("button",opt.label,"finale-option");btn.type="button";btn.disabled=blocked;btn.addEventListener("click",()=>final(opt.id));
   $("finaleChoices").append(btn);
  }
 }
 const end=$("finaleResult");end.hidden=!v.finale;end.replaceChildren();
 if(v.finalReport)end.append(dom("h4","最終監査報告"),dom("p",v.finalReport));
}
function init(){
 try{const saved=localStorage.getItem(KEY);if(saved){const s=JSON.parse(saved);G.view(s);save=s;}}
 catch{blocked=true;msg("過去のセーブを確認できません。元データは残しています。初期化を選ぶと新たに開始します。");}
 $("assignButton").addEventListener("click",assign);
 $("unselectButton").addEventListener("click",()=>{selected=[];render();});
 $("reset").addEventListener("click",()=>{
  if(!confirm("体験版3事件の記録を初期化しますか？ 他の有料版・低価格版には影響しません。"))return;
  try{localStorage.removeItem(KEY);}catch{}
  save=G.initial();blocked=false;current="01";selected=[];msg("新しい夜を始めました。");render();
 });
 render();
}
document.addEventListener("DOMContentLoaded",init);
})();