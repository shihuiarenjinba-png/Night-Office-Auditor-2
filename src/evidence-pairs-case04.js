/* CASE04 — permanent evidence reveals and causally linked pairs, no randomness. */
(function(root,factory){const g=factory();if(typeof module==="object"&&module.exports)module.exports=g;else root.EvidencePairsCase04=g;})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const VERSION=1,CASE_ID="CASE04-EVIDENCE-PAIRS";
const CARDS=Object.freeze([
 Object.freeze({id:"A",title:"紙の発注書",category:"発注関係",documentId:"N04-PAPER",detail:"追加照明42万円。発注番号は PO-044。紙の『最終承認者』欄は空白になっている。"}),
 Object.freeze({id:"E",title:"代理承認の規程",category:"承認関係",documentId:"N04-RULE",detail:"社内規程第3条では、緊急発注について権限を持つ代理者の電子承認を正式承認とみなす。"}),
 Object.freeze({id:"C",title:"発注登録ログ",category:"時刻関係",documentId:"N04-ORDER",detail:"発注番号 PO-044 の正式登録時刻は同日20:48。登録時刻の後付け変更記録はない。"}),
 Object.freeze({id:"F",title:"承認者の電子署名",category:"承認関係",documentId:"N04-SIGN",detail:"金城玲子の署名付き電子承認に、申請ID EVT-044 と代理承認権限の識別情報が記録されている。"}),
 Object.freeze({id:"B",title:"電子発注台帳",category:"発注関係",documentId:"N04-LEDGER",detail:"発注番号 PO-044 に電子承認ID EVT-044 が紐付いている。紙の署名欄とは別の承認ルートが存在する。"}),
 Object.freeze({id:"D",title:"電子承認ログ",category:"時刻関係",documentId:"N04-AUDIT",detail:"EVT-044 の署名付き承認記録は同日20:25。後から時刻を書き換えた記録も存在しない。"})
]);
const PAIRS=Object.freeze([
 Object.freeze({id:"approval-record",cards:Object.freeze(["A","B"]),question:"紙の署名欄以外に、承認の記録は存在するのか？",answer:"発注番号 PO-044 は、電子承認ID EVT-044 に紐付いていた。承認の有効性はまだ未確認。",character:"仲村 澪",line:"紙しか見ていませんでした。電子の台帳にも、たしかに同じ発注番号があります。"}),
 Object.freeze({id:"prior-time",cards:Object.freeze(["C","D"]),question:"承認は発注より前に行われ、後から変更されていないか？",answer:"発注は20:48、承認は20:25。発注23分前に処理され、後付け変更も確認されない。",character:"島袋 颯",line:"発注を急いだのは事実。でも、その前に承認の操作があったんですね。"}),
 Object.freeze({id:"authority",cards:Object.freeze(["E","F"]),question:"電子署名した人物には、正式な代理承認権限があるのか？",answer:"緊急代理承認を認める規程と、金城玲子の権限付き電子署名が一致する。",character:"金城 玲子",line:"口頭の説明だけでは足りません。規程と署名を照合して、初めて有効な承認と呼べます。"})
]);
const ids=new Set(CARDS.map(x=>x.id));
const pairKey=(a,b)=>[a,b].sort().join("-");
const MATCHES=new Map(PAIRS.map(x=>[pairKey(...x.cards),x]));
const initial=()=>({version:VERSION,caseId:CASE_ID,actions:[]});
function evaluate(raw){
 if(!raw||raw.version!==VERSION||raw.caseId!==CASE_ID||!Array.isArray(raw.actions)||raw.actions.length>150)throw Error("セーブデータが不正です。");
 const reveals=new Set(),matches=new Set();let wrong=0,verdict=null,latest=null;
 for(const a of raw.actions){
  if(!a||typeof a!=="object"||typeof a.type!=="string")throw Error("調査履歴が不正です。");
  if(verdict!==null)throw Error("報告後の調査操作はできません。");
  if(a.type==="reveal"){
   if(typeof a.id!=="string"||!ids.has(a.id)||reveals.has(a.id))throw Error("不正な証拠めくりです。");
   reveals.add(a.id);latest={kind:"reveal",id:a.id};
  }else if(a.type==="link"){
   if(typeof a.a!=="string"||typeof a.b!=="string"||a.a===a.b||!ids.has(a.a)||!ids.has(a.b)||!reveals.has(a.a)||!reveals.has(a.b))throw Error("未公開の証拠は結びつけられません。");
   const pair=MATCHES.get(pairKey(a.a,a.b));
   if(pair&&matches.has(pair.id))throw Error("この関係は解明済みです。");
   if(pair){matches.add(pair.id);latest={kind:"match",id:pair.id};}
   else{wrong++;latest={kind:"nonmatch",ids:[a.a,a.b]};}
  }else if(a.type==="report"){
   if(matches.size!==3)throw Error("未解明の疑問があります。証拠をすべて結びつけてから報告してください。");
   if(!["clear","review","escalate"].includes(a.choice))throw Error("報告内容が不正です。");
   verdict=a.choice;latest={kind:"report",choice:verdict};
  }else throw Error("不明な操作です。");
 }
 const resolved=PAIRS.map(p=>({id:p.id,question:p.question,answer:matches.has(p.id)?p.answer:null,completed:matches.has(p.id),documentIds:matches.has(p.id)?p.cards.map(id=>CARDS.find(x=>x.id===id).documentId):[]}));
 const completion=matches.size;
 let ending=null;
 if(verdict){ending=verdict==="clear"?"証拠から正式な電子代理承認が立証された。紙に署名がないことは無断発注の証明ではなかった。":verdict==="review"?"すべての裏づけはそろっていたが、結論を保留した。会場側への影響も記録する必要がある。":"権限と署名の一致を無視して無断発注と断定した。現場への訂正と説明が必要となる。";}
 const suggestions=completion===3?"3つの疑問が解けました。報告内容を選んでください。":
  reveals.size===0?"資料の名前を見て、気になるカードをめくってください。外れても戻らず、制限時間もありません。":
  reveals.size<6?"めくったカードは残ります。内容を読み、関係がありそうな2枚を選んで『関連付ける』を押してください。":
  "6枚の資料が公開されました。未解明の疑問と照らし合わせ、関連する2枚を選んでください。";
 const hints=PAIRS.filter(p=>!matches.has(p.id)).map(p=>({
  question:p.question,unseen:p.cards.filter(id=>!reveals.has(id)).map(id=>CARDS.find(x=>x.id===id).title),
  known:p.cards.filter(id=>reveals.has(id)).map(id=>CARDS.find(x=>x.id===id).title)
 }));
 return {version:VERSION,caseId:CASE_ID,actions:raw.actions.map(a=>({...a})),cards:CARDS.map(c=>({...c,revealed:reveals.has(c.id),matched:PAIRS.some(p=>matches.has(p.id)&&p.cards.includes(c.id))})),
  questions:resolved,progress:completion,total:3,opened:reveals.size,wrong,verdict,ending,latest,hints,suggestions,
  lastDialogue:latest?.kind==="match"?PAIRS.find(p=>p.id===latest.id):null,
  finalReason:"PO-044 と EVT-044 の対応、発注20:48の23分前にあたる承認20:25、規程第3条と金城玲子の電子署名を組み合わせることで、発注前の正式な代理承認を立証できる。"};
}
const view=raw=>evaluate(raw);
function apply(raw,action){
 const prev=evaluate(raw);
 if(!action||typeof action!=="object")throw Error("行動を選んでください。");
 if(action.type==="report"&&prev.progress!==3)throw Error("証拠の関連付けを終えてから報告してください。");
 const next={version:VERSION,caseId:CASE_ID,actions:[...raw.actions,{...action}]};
 evaluate(next);
 return next;
}
return Object.freeze({VERSION,CASE_ID,CARDS,PAIRS,initial,view,apply});
});
