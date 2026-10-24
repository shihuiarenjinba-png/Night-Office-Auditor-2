/* CASE04: independent deductions, no premature answer reveal. */
(()=>{"use strict";
const G=globalThis.EvidencePairsCase04,KEY="night-office-case04-player-deductions:v3";
const $=id=>document.getElementById(id);
const make=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
let state=G.initial(),selected=[],message="",showHint=false,blocked=false,audio=null;
function sound(){
 try{
  const A=window.AudioContext||window.webkitAudioContext;if(!A)return;
  audio??=new A();if(audio.state==="suspended")void audio.resume();
  const t=audio.currentTime,o=audio.createOscillator(),g=audio.createGain();
  o.type="triangle";o.frequency.setValueAtTime(310,t);o.frequency.exponentialRampToValueAtTime(455,t+.055);
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.04,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+.08);
  o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+.085);
 }catch{/* Sound must never interrupt navigation. */}
}
function persist(){
 if(blocked)return;
 try{localStorage.setItem(KEY,JSON.stringify(state));}
 catch{message="このブラウザでは自動保存できません。操作は続けられます。";}
}
function run(action){
 try{state=G.apply(state,action);persist();return true;}
 catch(e){message=e.message;render();return false;}
}
function tab(id,withSound=true){
 if(!["board","notes","report"].includes(id))return;
 for(const screen of document.querySelectorAll("[data-screen]"))screen.hidden=screen.dataset.screen!==id;
 for(const t of document.querySelectorAll("[data-tab]"))t.setAttribute("aria-selected",String(t.dataset.tab===id));
 if(withSound)sound();
}
function cardClick(id){
 const v=G.view(state),c=v.cards.find(c=>c.id===id);
 if(blocked||v.submitted||!c)return;
 if(!c.revealed){
  if(v.remaining===0){message="開封上限は6枚です。確認済みの資料で推理するか、追加調査を報告してください。";render();return;}
  if(!run({type:"reveal",id}))return;
  message=c.title+"を開きました（残り"+G.view(state).remaining+"枚）。文書内容を自分で確認してください。";
 }
 if(selected.includes(id))selected=selected.filter(x=>x!==id);
 else if(selected.length<2)selected.push(id);
 else {selected=[id];message="選択を入れ替えました。もう1枚選んでください。";}
 render();
}
function assign(){
 if(selected.length!==2)return;
 const target=$("targetQuestion").value;
 if(run({type:"assign",question:target,a:selected[0],b:selected[1]})){
  selected=[];message="選んだ2枚を根拠として記録しました。正しいかは報告後まで判定しません。";
  render();tab("notes");
 }
}
function choose(q,answer){
 if(run({type:"choose",question:q,answer})){
  message="仮説を記録しました。提出するまで変更可能です。";
  render();
 }
}
function report(verdict){
 const name={clear:"問題なし",escalate:"問題あり",review:"追加調査"}[verdict];
 if(!confirm("「"+name+"」として監査報告を提出しますか？ 提出後に初めて根拠と正誤を照合します。"))return;
 if(run({type:"report",verdict})){selected=[];message="監査報告を提出しました。";render();tab("report");}
}
function render(){
 const v=G.view(state),ready=v.questions.filter(q=>!!q.assigned&&!!q.answer).length;
 $("budget").textContent=v.opened+" / "+v.cardLimit;
 $("openSlots").textContent="残り"+v.remaining+"枚";
 $("remaining").textContent="回答準備 "+ready+" / 3";
 $("selectedCount").textContent="選択中 "+selected.length+" / 2";
 $("instruction").textContent=v.submitted?"報告済みです。答え合わせは監査報告で確認できます。":
  selected.length===2?"2枚を選びました。下で『どの疑問の根拠か』を指定してください。":
  selected.length===1?"根拠になると思うもう1枚を選んでください。":
  v.remaining===0?"開封枠を使い切りました。既存の資料で推理するか追加調査を報告してください。":
  "資料名を手がかりに、関係がありそうなカードを開いてください。";
 $("connect").disabled=blocked||v.submitted||selected.length!==2;
 $("hint").disabled=blocked||v.submitted;
 $("clearSelection").disabled=selected.length===0;
 const questions=$("questions");questions.replaceChildren();
 for(const q of v.questions){
  const ready=!!q.assigned&&!!q.answer;
  const el=make("article",undefined,ready?"question done":"question");
  el.append(make("small",v.submitted?"報告済み":ready?"仮説を記録済み":q.assigned?"根拠2枚を登録済み":"未回答"),
    make("strong",q.question));
  if(q.assigned)el.append(make("p","根拠資料："+q.assigned.join(" / ")));
  if(q.answer)el.append(make("p","選んだ答え："+q.options.find(o=>o.id===q.answer).label));
  questions.append(el);
 }
 const deck=$("cards");deck.replaceChildren();
 for(const c of v.cards){
  const el=make("button",undefined,"evidence-card"+(c.revealed?" open":"")+(selected.includes(c.id)?" selected":""));
  el.type="button";el.disabled=blocked||v.submitted||(!c.revealed&&v.remaining===0);
  el.setAttribute("aria-pressed",String(selected.includes(c.id)));
  el.setAttribute("aria-label",(c.revealed?"公開済み":"未公開")+" "+c.title);
  el.append(make("small",c.documentId+" / "+c.category),make("strong",c.title),
   make("div",c.revealed?c.detail:"未開封。内容を調べるにはクリックします。","face"),
   make("span",selected.includes(c.id)?"● 選択中":c.revealed?"公開済み":v.remaining?"未開封":"調査枠の上限","card-status"));
  el.addEventListener("click",()=>cardClick(c.id));deck.append(el);
 }
 $("feedback").textContent=message;
 const hint=$("hintContent");hint.hidden=!showHint||v.submitted;hint.replaceChildren();
 if(!hint.hidden)hint.append(make("strong","調査助手からの助言"),
  make("p","『発注に承認記録があるか』『処理の前後』『承認した人の権限』という3つの疑問を、資料の種類と番号で比べてください。"),
  make("p","カードの中身や正解になる組み合わせは、ここでは教えません。"));
 const notes=$("findings");notes.replaceChildren();
 for(const [i,q] of v.questions.entries()){
  const item=make("article",undefined,"finding"+(q.assigned?"":" empty"));
  item.append(make("h3",(i+1)+". "+q.question));
  item.append(make("p",q.assigned?"あなたが指定した資料："+q.assigned.join(" / "):"根拠にする資料2枚を、カード画面で登録してください。"));
  if(q.assigned){
   const choices=make("div",undefined,"answer-choices");
   for(const op of q.options){
    const label=make("label",undefined,"answer-option"+(op.id===q.answer?" chosen":""));
    const radio=make("input");radio.type="radio";radio.name="answer-"+q.id;radio.value=op.id;
    radio.checked=q.answer===op.id;radio.disabled=blocked||v.submitted;
    radio.addEventListener("change",()=>choose(q.id,op.id));
    label.append(radio,make("span",op.label));choices.append(label);
   }
   item.append(make("h4","あなたの答えを選ぶ（3択）"),choices,
    make("p","まだ正誤は表示されません。根拠資料と回答は提出前に変更できます。","note"));
  }else item.append(make("p","この疑問の回答は、根拠資料を登録すると選べます。","note"));
  notes.append(item);
 }
 $("reportGuide").textContent=v.submitted?"報告が完了しました。以下に回答と根拠の照合結果を表示します。":
 ready===3?"3件すべての根拠資料と答えがそろいました。最終結論を提出してください。":
 "3件中"+ready+"件の回答を用意しました。結論の断定には3件すべて必要です。証拠不足の場合は『追加調査』を選択できます。";
 for(const el of document.querySelectorAll("[data-verdict]"))el.disabled=blocked||v.submitted||(el.dataset.verdict!=="review"&&!v.readyToConclude);
 const final=$("finalReport");final.hidden=!v.submitted;final.replaceChildren();
 if(v.submitted){
  final.append(make("h3","監査報告と答え合わせ"),
   make("p","あなたの報告："+({clear:"問題なし",review:"追加調査",escalate:"問題あり"}[v.report])),
   make("p",v.outcome));
  for(const e of v.evaluation){
   const item=make("section",undefined,"graded-question");
   item.append(make("h4",e.question),make("p","あなたの選択："+e.chosenLabel),
     make("p","正しい回答："+e.correctLabel),
     make("p","提出した資料："+(e.documents.join(" / ")||"なし")),
     make("p","照合に必要な資料："+e.requiredDocuments.join(" / ")),
     make("p","なぜそうなるか："+e.explanation),
     make("strong",e.substantiated?"証拠と回答が一致":"証拠または回答が不十分"));
   final.append(item);
  }
 }
}
function init(){
 try{const raw=localStorage.getItem(KEY);if(raw){const s=JSON.parse(raw);G.view(s);state=s;}}
 catch{blocked=true;message="以前の記録を読み込めません。元データは保持しています。初期化を選ぶと新しく始められます。";}
 const select=$("targetQuestion");for(const q of G.QUESTIONS){const o=make("option",q.question);o.value=q.id;select.append(o);}
 for(const t of document.querySelectorAll("[data-tab]"))t.addEventListener("click",()=>tab(t.dataset.tab));
 $("connect").addEventListener("click",assign);
 $("hint").addEventListener("click",()=>{showHint=!showHint;render();});
 $("clearSelection").addEventListener("click",()=>{selected=[];message="選択を解除しました。";render();});
 for(const b of document.querySelectorAll("[data-verdict]"))b.addEventListener("click",()=>report(b.dataset.verdict));
 $("reset").addEventListener("click",()=>{
  if(!confirm("この試作の調査記録を消して初めからやり直しますか？（本編のセーブには影響しません）"))return;
  try{localStorage.removeItem(KEY);}catch{}
  state=G.initial();blocked=false;selected=[];message="初期化しました。";showHint=false;tab("board");render();
 });
 tab("board",false);render();
}
document.addEventListener("DOMContentLoaded",init);
})();