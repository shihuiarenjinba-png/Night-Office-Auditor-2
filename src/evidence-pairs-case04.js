/* CASE04 — permanent evidence reveals and causally linked pairs, no randomness. */
(function(root,factory){const g=factory();if(typeof module==="object"&&module.exports)module.exports=g;else root.EvidencePairsCase04=g;})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const VERSION=2,CASE_ID="CASE04-EVIDENCE-PAIRS-LIMITED",CARD_LIMIT=6;
const CARDS=Object.freeze([
 Object.freeze({id:"A",title:"紙の発注書",category:"発注関係",documentId:"N04-PAPER",detail:"追加照明42万円。発注番号は PO-044。紙の『最終承認者』欄は空白になっている。"}),
 Object.freeze({id:"E",title:"代理承認の規程",category:"承認関係",documentId:"N04-RULE",detail:"社内規程第3条では、緊急発注について権限を持つ代理者の電子承認を正式承認とみなす。"}),
 Object.freeze({id:"C",title:"発注登録ログ",category:"時刻関係",documentId:"N04-ORDER",detail:"発注番号 PO-044 の正式登録時刻は同日20:48。登録時刻の後付け変更記録はない。"}),
 Object.freeze({id:"F",title:"承認者の電子署名",category:"承認関係",documentId:"N04-SIGN",detail:"金城玲子の署名付き電子承認に、申請ID EVT-044 と代理承認権限の識別情報が記録されている。"}),
 Object.freeze({id:"B",title:"電子発注台帳",category:"発注関係",documentId:"N04-LEDGER",detail:"発注番号 PO-044 に電子承認ID EVT-044 が紐付いている。紙の署名欄とは別の承認ルートが存在する。"}),
 Object.freeze({id:"D",title:"電子承認ログ",category:"時刻関係",documentId:"N04-AUDIT",detail:"EVT-044 の署名付き承認記録は同日20:25。後から時刻を書き換えた記録も存在しない。"}),
 Object.freeze({id:"G",title:"現場主任のメール",category:"現場の事情",documentId:"N04-MAIL",detail:"島袋主任から『照明が届かないと明朝の公演が成立しない』という連絡。現場の焦りは分かるが、承認の有無を直接示すものではない。"}),
 Object.freeze({id:"H",title:"機材の納品チェック票",category:"納品状況",documentId:"N04-DELIVERY",detail:"照明機材は予定どおり会場に到着済み。納品の確認には使えるが、会社の正式な発注承認を証明するものではない。"})
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
 if(!raw||raw.version!==VERSION||raw.caseId!==CASE_ID||!Array.isArray(raw.actions)||raw.actions.length>100)throw Error("セーブデータが不正です。");
 const reveals=new Set(),matches=new Set();let wrong=0,verdict=null,latest=null;
 for(const a of raw.actions){
  if(!a||typeof a!=="object"||typeof a.type!=="string")throw Error("調査履歴が不正です。");
  if(verdict!==null)throw Error("報告後の調査操作はできません。");
  if(a.type==="reveal"){
   if(typeof a.id!=="string"||!ids.has(a.id)||reveals.has(a.id))throw Error("不正な証拠めくりです。");
   if(reveals.size>=CARD_LIMIT)throw Error("調査枠は使い切りました。開いた資料の関連付け、または再調査報告へ進んでください。");
   reveals.add(a.id);latest={kind:"reveal",id:a.id};
  }else if(a.type==="link"){
   if(typeof a.a!=="string"||typeof a.b!=="string"||a.a===a.b||!ids.has(a.a)||!ids.has(a.b)||!reveals.has(a.a)||!reveals.has(a.b))throw Error("未公開の証拠は結びつけられません。");
   const pair=MATCHES.get(pairKey(a.a,a.b));
   if(pair&&matches.has(pair.id))throw Error("この関係は解明済みです。");
   if(pair){matches.add(pair.id);latest={kind:"match",id:pair.id};}
   else{wrong++;latest={kind:"nonmatch",ids:[a.a,a.b]};}
  }else if(a.type==="report"){
   if(!["clear","review","escalate"].includes(a.choice))throw Error("報告内容が不正です。");
   if(a.choice!=="review"&&matches.size!==3)throw Error("証拠が足りない段階で断定はできません。『追加調査』を選ぶか、証拠をさらに結びつけてください。");
   verdict=a.choice;latest={kind:"report",choice:verdict};
  }else throw Error("不明な操作です。");
 }
 const resolved=PAIRS.map(p=>({id:p.id,question:p.question,answer:matches.has(p.id)?p.answer:null,completed:matches.has(p.id),documentIds:matches.has(p.id)?p.cards.map(id=>CARDS.find(x=>x.id===id).documentId):[]}));
 const completion=matches.size;
 let ending=null;
 if(verdict){
  ending=verdict==="clear"?"承認ID・時刻・代理権限の3点をつなぎ、正式な電子代理承認を立証した。現場と経理の対立は記録の照合によって解消した。":
   verdict==="review"&&matches.size===3?"証拠はすべてそろっていたが、確認を保留した。責任者に報告する時間が追加で必要になる。":
   verdict==="review"?"開けた資料からは必要な事実をすべて立証できなかった。推測で無断発注と断定せず、追加資料の正式照会を依頼した。":
   "正式な承認を証明する3点の資料がそろっていたのに無断発注と報告した。現場への訂正と説明が必要になった。";
 }
 const slotsRemaining=CARD_LIMIT-reveals.size;
 const suggestions=completion===3?"3つの疑問が解明しました。監査報告へ進んでください。":
  slotsRemaining===0?"これ以上カードは開けません。公開済みの資料を組み合わせるか、証拠不足として『追加調査』を報告してください。":
  reveals.size===0?"全8枚のうち開けるのは6枚まで。資料名と未解明の疑問を見比べ、必要そうな資料を選びましょう。":
  "残り"+slotsRemaining+"枚を開けます。カードの内容は消えません。解明したい疑問と資料名を見比べて選びましょう。";
 const hints=PAIRS.filter(p=>!matches.has(p.id)).map(p=>({
  question:p.question,unseen:p.cards.filter(id=>!reveals.has(id)).map(id=>CARDS.find(x=>x.id===id).title),
  known:p.cards.filter(id=>reveals.has(id)).map(id=>CARDS.find(x=>x.id===id).title)
 }));
 return {version:VERSION,caseId:CASE_ID,actions:raw.actions.map(a=>({...a})),cards:CARDS.map(c=>({...c,revealed:reveals.has(c.id),matched:PAIRS.some(p=>matches.has(p.id)&&p.cards.includes(c.id))})),
  questions:resolved,progress:completion,total:3,opened:reveals.size,cardLimit:CARD_LIMIT,slotsRemaining:CARD_LIMIT-reveals.size,canReveal:reveals.size<CARD_LIMIT,cardCount:CARDS.length,wrong,verdict,ending,latest,hints,suggestions,canConclude:completion===3,canReview:verdict===null,
  lastDialogue:latest?.kind==="match"?PAIRS.find(p=>p.id===latest.id):null,
  finalReason:"PO-044 と EVT-044 の対応、発注20:48の23分前にあたる承認20:25、規程第3条と金城玲子の電子署名を組み合わせることで、発注前の正式な代理承認を立証できる。"};
}
const view=raw=>evaluate(raw);
function apply(raw,action){
 const prev=evaluate(raw);
 if(!action||typeof action!=="object")throw Error("行動を選んでください。");
 if(action.type==="report"&&action.choice!=="review"&&prev.progress!==3)throw Error("断定にはすべての根拠が必要です。");
 const next={version:VERSION,caseId:CASE_ID,actions:[...raw.actions,{...action}]};
 evaluate(next);
 return next;
}
return Object.freeze({VERSION,CASE_ID,CARD_LIMIT,CARDS,PAIRS,initial,view,apply});
});
