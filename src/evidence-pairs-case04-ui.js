/* CASE04 evidence cards UI: a card never flips back once opened. */
(()=>{"use strict";
const G=globalThis.EvidencePairsCase04,KEY="night-office-case04-card-budget:v2";
const $=id=>document.getElementById(id);
const make=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
let state=G.initial(),selected=[],feedback="",hintVisible=false,blocked=false,tab="board",lastDialogue=null,audio=null;
function sound(){
 try{const A=window.AudioContext||window.webkitAudioContext;if(!A)return;
 audio??=new A();if(audio.state==="suspended")void audio.resume();
 const t=audio.currentTime,o=audio.createOscillator(),g=audio.createGain();
 o.type="triangle";o.frequency.setValueAtTime(360,t);o.frequency.exponentialRampToValueAtTime(515,t+.055);
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.045,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+.07);
 o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+.08);
 }catch{/* Sound must not stop any game action. */}
}
function save(){
 if(blocked)return;
 try{localStorage.setItem(KEY,JSON.stringify(state));}catch{feedback="この環境では自動保存できません。操作は続けられます。";}
}
function showTab(id,play=true){
 if(!["board","notes","report"].includes(id))return;
 tab=id;
 for(const screen of document.querySelectorAll("[data-screen]"))screen.hidden=screen.dataset.screen!==id;
 for(const button of document.querySelectorAll("[data-tab]"))button.setAttribute("aria-selected",String(button.dataset.tab===id));
 if(play)sound();
}
function run(action){
 try{state=G.apply(state,action);save();return true;}
 catch(err){feedback=err.message;return false;}
}
function pick(id){
 const v=G.view(state),card=v.cards.find(c=>c.id===id);
 if(blocked||v.verdict||!card||card.matched)return;
 if(!card.revealed){
  if(!v.canReveal){feedback="調査枠は6枚までです。開封済みのカードで関連付けるか、追加調査の報告に進んでください。";render();return;}
  if(!run({type:"reveal",id}))return;
  feedback="資料「"+card.title+"」を公開しました。残り"+G.view(state).slotsRemaining+"枚。内容は手帳に残ります。";
 }
 if(selected.includes(id))selected=selected.filter(x=>x!==id);
 else if(selected.length<2)selected.push(id);
 else feedback="いまは2枚選択中です。「関連付ける」を押すか、選択を解除してください。";
 render();
}
function connect(){
 if(selected.length!==2)return;
 const v=G.view(state),previous=v.progress,ids=[...selected];
 if(run({type:"link",a:ids[0],b:ids[1]})){
  const next=G.view(state);
  if(next.progress>previous){
   const p=G.PAIRS.find(x=>x.cards.includes(ids[0])&&x.cards.includes(ids[1]));
   lastDialogue=p;
   feedback="つながりました！「"+p.question+"」が解明されました。"+(next.progress===3?" 3件すべて解明。監査報告タブへ進めます。":"");
   sound();
  }else{lastDialogue=null;feedback="この2枚だけでは疑問を説明できません。同じ発注番号・時刻・承認権限のどれを照合するか考えましょう。失敗しても減点はありません。";}
 }
 selected=[];render();
}
function report(choice){
 if(!confirm("現在の証拠から「"+({clear:"問題なし",review:"追加調査",escalate:"問題あり"}[choice]||"")+"」と報告しますか？ この案件の調査は終了します。"))return;
 if(run({type:"report",choice})){selected=[];feedback="監査報告を記録しました。";showTab("report");}
 render();
}
function render(){
 const v=G.view(state);
 $("progress").textContent=v.progress+" / "+v.total;
 $("budget").textContent=v.opened+" / "+v.cardLimit;
 $("budgetHint").textContent=v.slotsRemaining===0?"調査枠を使い切りました":"残り"+v.slotsRemaining+"枚／全"+v.cardCount+"枚";
 $("cardCount").textContent=String(v.cardCount);
 $("cardLimit").textContent=String(v.cardLimit);
 $("remaining").textContent=v.verdict?"報告済み":v.progress===3?"全項目解明":"未解明 "+(v.total-v.progress)+"件";
 $("selectedCount").textContent="選択中 "+selected.length+" / 2";
 $("instruction").textContent=v.progress===3?"証拠がつながりました。『監査報告』タブから結論を選んでください。":
  selected.length===2?"2枚を選択しました。「証拠を関連付ける」を押してください。":
  selected.length===1?"もう1枚、関係がありそうな資料を選択してください。":v.suggestions;
 $("connect").disabled=blocked||!!v.verdict||selected.length!==2;
 $("hint").disabled=blocked||!!v.verdict||v.progress===3;
 $("clearSelection").disabled=!selected.length;
 const qs=$("questions");qs.replaceChildren();
 for(const q of v.questions){
  const panel=make("div",undefined,q.completed?"question done":"question");
  panel.append(make("small",q.completed?"✓ 解明済み":"? まだ分からない"),make("strong",q.question));
  if(q.completed)panel.append(make("p",q.answer));
  qs.append(panel);
 }
 const deck=$("cards");deck.replaceChildren();
 for(const c of v.cards){
  const card=make("button",undefined,"evidence-card"+(c.revealed?" open":"")+(selected.includes(c.id)?" selected":"")+(c.matched?" matched":""));
  card.type="button";card.disabled=blocked||!!v.verdict||c.matched||(!c.revealed&&!v.canReveal);
  card.setAttribute("aria-pressed",String(selected.includes(c.id)));
  card.setAttribute("aria-label",(c.revealed?"公開済み":"未公開")+" "+c.title);
  card.append(make("small",c.documentId+" / "+c.category),make("strong",c.title),
   make("div",c.revealed?c.detail:"クリックして資料を読む。内容はそのまま残ります。","face"),
   make("span",c.matched?"✓ 関連付け済み":selected.includes(c.id)?"● 選択中":c.revealed?"公開済み・選択できます":v.canReveal?"未開封（残り枠あり）":"調査枠の上限","card-status"));
  card.addEventListener("click",()=>pick(c.id));deck.append(card);
 }
 const hint=$("hintContent");hint.hidden=!hintVisible||v.progress===3;hint.replaceChildren();
 if(!hint.hidden){
  const x=v.hints[0],pair=G.PAIRS.find(p=>p.question===x.question);
  const types=pair.cards.map(id=>G.CARDS.find(c=>c.id===id).category);
  hint.append(make("strong","調査助手のヒント（枠の消費なし）"),
    make("p","未解明の疑問：「"+x.question+"」"),
    make("p","資料名の種類に注目しましょう。「"+types.join("」と「")+"」の資料を比べると手がかりがあります。"),
    make("p","資料の中身は、実際にカードを開くまで表示されません。"));
 }
 $("feedback").textContent=feedback||"";
 const speech=$("characterLine");speech.hidden=!lastDialogue;speech.replaceChildren();
 if(lastDialogue)speech.append(make("strong",lastDialogue.character),make("p",lastDialogue.line));
 const notes=$("findings");notes.replaceChildren();
 for(const q of v.questions){
  const item=make("article",undefined,q.completed?"finding":"finding empty");
  item.append(make("h3",q.question));
  if(q.completed)item.append(make("p",q.answer),make("p","照合した資料："+q.documentIds.join(" / ")));
  else item.append(make("p","未解明。関係する2枚の証拠を見つけてください。"));
  notes.append(item);
 }
 const canConclude=v.progress===3&&!v.verdict&&!blocked;
 $("reportGuide").textContent=v.verdict?"報告済み。実際に確認した証拠と、報告後に分かった事実を区別して表示します。":
 canConclude?"3つの疑問を証拠で解明しました。結論を選んでください。":
 "未解明 "+(3-v.progress)+"件。調査枠の残りは"+v.slotsRemaining+"枚。断定せず『追加調査』と報告することもできます。";
 for(const btn of document.querySelectorAll("[data-verdict]"))
  btn.disabled=blocked||!!v.verdict||(btn.dataset.verdict!=="review"&&!canConclude);
 const final=$("finalReport");final.hidden=!v.verdict;final.replaceChildren();
 if(v.verdict){
  final.append(make("h3",v.verdict==="clear"?"CASE CLOSED — 正当な承認を立証":"監査報告の結果"),
   make("p","あなたが解明した項目："+v.progress+" / 3。公開資料："+v.opened+" / "+v.cardLimit+"枚。"),
   make("p",v.ending));
  if(v.verdict==="review"){
   final.append(make("h4","報告時点で不足していた根拠"));
   for(const q of v.questions.filter(q=>!q.completed))final.append(make("p","未確認："+q.question));
   final.append(make("h4","報告後の正式照会で判明した事実"));
  }else final.append(make("h4","今回の証拠のつながり"));
  final.append(make("p",v.finalReason),
   make("p","仲村は紙の空欄で迷い、島袋は公演を心配していました。記録と署名を確認することで、人物の発言ではなく根拠に基づいた判断ができます。"));
 }
 for(const x of document.querySelectorAll('[data-tab="report"]'))x.textContent=v.verdict?"監査報告 ✓":"監査報告";
}
function init(){
 try{const raw=localStorage.getItem(KEY);if(raw){const candidate=JSON.parse(raw);G.view(candidate);state=candidate;}}
 catch{blocked=true;feedback="以前の記録を読み込めません。元のデータは保持しています。『最初から』で新たに始められます。";}
 for(const b of document.querySelectorAll("[data-tab]"))b.addEventListener("click",()=>showTab(b.dataset.tab));
 $("connect").addEventListener("click",connect);
 $("hint").addEventListener("click",()=>{hintVisible=!hintVisible;render();});
 $("clearSelection").addEventListener("click",()=>{selected=[];feedback="選択を解除しました。";render();});
 for(const b of document.querySelectorAll("[data-verdict]"))b.addEventListener("click",()=>report(b.dataset.verdict));
 $("reset").addEventListener("click",()=>{if(!confirm("この試作の証拠と報告をすべて初期化しますか？ 本編のセーブには影響しません。"))return;
   try{localStorage.removeItem(KEY);}catch{}
   state=G.initial();blocked=false;feedback="事件を初期化しました。";selected=[];hintVisible=false;lastDialogue=null;showTab("board");render();
 });
 showTab("board",false);render();
}
document.addEventListener("DOMContentLoaded",init);
})();
