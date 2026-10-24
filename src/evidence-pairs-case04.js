/* CASE04: separate factual evidence from player-authored deductions.
   Opening a document never automatically resolves a question or reveals its answer.
   Exact source pairs, correct options and story conclusion are disclosed ONLY after a report. */
(function(root,factory){
 const game=factory();
 if(typeof module==="object"&&module.exports)module.exports=game;
 else root.EvidencePairsCase04=game;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
 "use strict";
 const VERSION=3,CASE_ID="CASE04-PLAYER-DEDUCTIONS",CARD_LIMIT=6;
 const CARDS=Object.freeze([
  {id:"A",title:"紙の発注書",category:"発注書類",documentId:"N04-PAPER",detail:"追加照明42万円。番号 PO-044。用紙の最終承認者署名欄は空白。"},
  {id:"E",title:"業務規程・第3条",category:"社内規程",documentId:"N04-RULE",detail:"緊急発注の場合、指定された代理者が所定の電子申請システムで承認できる。"},
  {id:"C",title:"発注処理の記録",category:"システム履歴",documentId:"N04-ORDER",detail:"発注番号 PO-044 の登録時刻 20:48。記録更新：なし。"},
  {id:"F",title:"電子署名の検証票",category:"認証記録",documentId:"N04-SIGN",detail:"署名者：金城玲子。申請ID EVT-044。登録権限コード：代理購買3。署名検証：一致。"},
  {id:"B",title:"購買台帳の登録行",category:"経理台帳",documentId:"N04-LEDGER",detail:"発注番号 PO-044。承認欄ID：EVT-044。申請方法：電子。"},
  {id:"D",title:"承認処理の記録",category:"システム履歴",documentId:"N04-AUDIT",detail:"申請ID EVT-044。承認タイムスタンプ 20:25。更新履歴：なし。"},
  {id:"G",title:"現場主任からのメール",category:"関係者の連絡",documentId:"N04-MAIL",detail:"『明朝の公演までに照明が必要。支払は遅らせないでほしい』と島袋主任から連絡。"},
  {id:"H",title:"機材の納品確認票",category:"納品記録",documentId:"N04-DELIVERY",detail:"会場への追加照明搬入時刻 21:10。数量と型番は納品書と一致。"}
 ]);
 const QUESTIONS=Object.freeze([
  {id:"approval",question:"紙の署名欄以外に、発注 PO-044 の承認記録はあるか？",
   options:[{id:"yes",label:"別の承認記録が存在する"},{id:"no",label:"承認記録は存在しない"},{id:"unknown",label:"この資料では判断できない"}],
   correctChoice:"yes",source:["A","B"],
   explanation:"紙の発注書 PO-044 に対して、購買台帳にも同じ PO-044 があり、電子承認 ID EVT-044 が記録されている。別の申請記録は存在する。ただし、この時点では有効な承認とは確定しない。"},
  {id:"timing",question:"承認記録は正式発注の前に作られたか？",
   options:[{id:"before",label:"発注前に承認されていた"},{id:"after",label:"発注後の事後承認だった"},{id:"unknown",label:"前後は確認できない"}],
   correctChoice:"before",source:["C","D"],
   explanation:"発注登録ログ PO-044 は20:48、承認ログ EVT-044 は20:25。双方に後付け更新がなく、承認が23分前であると照合できる。"},
  {id:"authority",question:"署名した人物に、この発注を承認する権限はあったか？",
   options:[{id:"authorized",label:"必要な代理承認権限があった"},{id:"unauthorized",label:"代理承認する権限がなかった"},{id:"unknown",label:"権限は確認できない"}],
   correctChoice:"authorized",source:["E","F"],
   explanation:"社内規程第3条が所定の電子代理承認を認め、署名検証票には金城玲子の署名と代理購買3の権限コードが残る。権限と手続が対応している。"}
 ]);
 const CARD_IDS=new Set(CARDS.map(c=>c.id)),Q_IDS=new Set(QUESTIONS.map(q=>q.id));
 const key=(a,b)=>[a,b].sort().join(":");
 const initial=()=>({version:VERSION,caseId:CASE_ID,actions:[]});
 function evaluate(raw){
  if(!raw||raw.version!==VERSION||raw.caseId!==CASE_ID||!Array.isArray(raw.actions)||raw.actions.length>128)throw Error("セーブ形式が不正です。");
  const opened=new Set(),assigned=new Map(),answers=new Map();
  let report=null;
  for(const action of raw.actions){
   if(!action||typeof action!=="object"||typeof action.type!=="string"||report)throw Error("操作履歴が不正です。");
   if(action.type==="reveal"){
    if(!CARD_IDS.has(action.id)||opened.has(action.id))throw Error("無効なカードです。");
    if(opened.size>=CARD_LIMIT)throw Error("めくれるカードは6枚までです。");
    opened.add(action.id);
   }else if(action.type==="assign"){
    if(!Q_IDS.has(action.question)||!CARD_IDS.has(action.a)||!CARD_IDS.has(action.b)||
       action.a===action.b||!opened.has(action.a)||!opened.has(action.b))throw Error("開いた2枚の資料と疑問を指定してください。");
    assigned.set(action.question,[action.a,action.b]);
   }else if(action.type==="choose"){
    const q=QUESTIONS.find(q=>q.id===action.question);
    if(!q||!q.options.some(x=>x.id===action.answer))throw Error("選択した回答が不正です。");
    if(!assigned.has(action.question))throw Error("先に、その疑問の根拠資料2枚を登録してください。");
    answers.set(action.question,action.answer);
   }else if(action.type==="report"){
    if(!["clear","escalate","review"].includes(action.verdict))throw Error("監査報告の種類が不正です。");
    if(action.verdict!=="review"&&QUESTIONS.some(q=>!assigned.has(q.id)||!answers.has(q.id)))
     throw Error("すべての疑問に根拠資料と回答を提出するか、追加調査を選択してください。");
    report=action.verdict;
   }else throw Error("未登録の操作です。");
  }
  const questions=QUESTIONS.map(q=>({
   id:q.id,question:q.question,options:q.options.map(x=>({...x})),
   assigned:assigned.has(q.id)?assigned.get(q.id).map(id=>CARDS.find(c=>c.id===id).documentId):null,
   assignedIds:assigned.has(q.id)?[...assigned.get(q.id)]:null,
   answer:answers.get(q.id)||null
  }));
  const submitted=report!==null;
  const evaluation=submitted?QUESTIONS.map(q=>{
   const pair=assigned.get(q.id),correctEvidence=!!pair&&key(...pair)===key(...q.source);
   const correctAnswer=answers.get(q.id)===q.correctChoice;
   return {id:q.id,question:q.question,chosenAnswer:answers.get(q.id)||null,
    chosenLabel:q.options.find(x=>x.id===answers.get(q.id))?.label||"未回答",
    correctLabel:q.options.find(x=>x.id===q.correctChoice).label,
    documents:pair?pair.map(id=>CARDS.find(c=>c.id===id).documentId):[],
    correctEvidence,correctAnswer,substantiated:correctEvidence&&correctAnswer,
    explanation:q.explanation,requiredDocuments:q.source.map(id=>CARDS.find(c=>c.id===id).documentId)};
  }):null;
  const substantiated=submitted&&evaluation.every(x=>x.substantiated);
  const outcome=!submitted?null:report==="review"?
   "証拠が不十分な点を明示し、追加資料の照会を依頼した。調査が終わったわけではない。":
   report==="clear"&&substantiated?
   "3点を実際に照合し、正式な代理承認であると立証できた。経理と現場に根拠を共有した。":
   report==="clear"?
   "結論は正しい可能性があるが、提出した資料と選択した回答では十分に立証できない。追加確認が必要。":
   "提出した根拠は無断発注を裏付けなかった。誤った疑義を伝えた場合は訂正が必要。";
  return {
   version:VERSION,cardCount:CARDS.length,cardLimit:CARD_LIMIT,opened:opened.size,remaining:CARD_LIMIT-opened.size,
   cards:CARDS.map(c=>({...c,revealed:opened.has(c.id)})),
   questions,readyToConclude:QUESTIONS.every(q=>assigned.has(q.id)&&answers.has(q.id)),
   submitted,report,evaluation,outcome,substantiated,attempts:raw.actions.length
  };
 }
 function apply(raw,action){
  evaluate(raw);
  if(!action||typeof action!=="object")throw Error("操作を指定してください。");
  const next={version:VERSION,caseId:CASE_ID,actions:[...raw.actions,{...action}]};
  evaluate(next);
  return next;
 }
 return Object.freeze({VERSION,CASE_ID,CARD_LIMIT,CARDS,QUESTIONS,initial,view:evaluate,apply});
});
