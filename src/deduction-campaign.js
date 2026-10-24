/* Three-case narrative vertical slice. Fictional records. No randomized verdicts.
 * Documents contain observations only; answers and proof verdicts stay private until report. */
(function(root,factory){const v=factory();if(typeof module==="object"&&module.exports)module.exports=v;else root.NightDeductionCampaign=v;})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const VERSION=1,REVEAL_LIMIT=6;
const card=(id,name,category,record)=>Object.freeze({id,name,category,record});
const question=(id,text,choices,correct,proofs,explain)=>Object.freeze({id,text,choices:Object.freeze(choices),correct,proofs:Object.freeze(proofs.map(pair=>Object.freeze([...pair]))),explain});
const c=(id,label)=>({id,label});
const CASES=Object.freeze([
 Object.freeze({
 id:"01",title:"消えた伝票",chapter:"第一夜 / 最初の違和感",location:"架空物流センター・夜間事務室",
 opening:"物流センターの伝票台帳から0418番だけが抜けている。監査室の記録担当・仲村は『データが消されたのでは』と気にし、現場調整係の島袋は締め処理の可能性を指摘する。",
 people:Object.freeze({cooperate:{name:"仲村 澪",line:"何を消したかより、元の伝票と取消の記録が対応するか確認したいです。"},confront:{name:"島袋 颯",line:"いきなり不正と言われても困る。現場の処理番号と時刻を見てくれ。"}}),
 cards:Object.freeze([
 card("A","伝票番号の一覧","台帳","0416・0417・0419番の記録。0418番は通常の売上行に表示されない。"),
 card("B","伝票0418の控え","原票","PO-0418。品目『照明予備部品』。数量2、計上額28,000円。"),
 card("C","受付時の控え","受付記録","受付番号 IN-0418。同じ品目と数量2、受付担当印が残る。"),
 card("D","取消処理の記録","処理履歴","取消番号 CN-0418。参照元 PO-0418。時刻20:43。計上額 -28,000円。"),
 card("E","元伝票の起票ログ","操作履歴","PO-0418 の発行時刻20:41。金額28,000円。更新履歴：なし。"),
 card("F","夜間締めの照合票","帳票","20:45 締め処理。PO-0418 +28,000円、CN-0418 -28,000円。合計0円。"),
 card("G","倉庫担当のメモ","関係者記録","『2枚目を作り直した気がする。番号は覚えていない』と記載。署名なし。"),
 card("H","夜間処理の運用メモ","運用資料","自動締めジョブ名 NIGHT-CLOSE。起票番号と取消番号を別々の画面で表示する。")
 ]),
 questions:Object.freeze([
 question("record","0418番の取引記録は別に残っているか？",[c("yes","対応する原票が残っている"),c("no","原票そのものが存在しない"),c("unknown","資料では確認できない")],"yes",[["A","B"],["A","C"]],"通常の一覧では0418が欠けるが、別保管されたPO-0418原票または受付控えIN-0418が同じ取引を示す。"),
 question("cancel","28,000円の消失は説明できるか？",[c("offset","起票と取消の相殺で説明できる"),c("stolen","現金が抜き取られたと分かる"),c("unknown","不明のまま")],"offset",[["D","E"],["D","F"]],"PO-0418 と CN-0418 は同じ原票を参照し、+28,000円と-28,000円が相殺する。金銭持出しの資料はない。")
 ]),
 bonus:Object.freeze({id:"procedure",question:"番号が欠けて見えた原因を調べる",docs:["F","H"],note:"運用上、起票と取消が異なる表示欄に出ることが分かる。"}),
 result:"本件は起票の取消と整合しており、現資料では不正な削除と判断できない。物流センターと監査室が異なる画面で記録を確認していたことが誤解を生んだ。",
 continuity:"最初の事件は『記録が見えないこと』と『記録がないこと』の違いを教えてくれる。"
 }),
 Object.freeze({
 id:"04",title:"白紙の承認欄",chapter:"第二夜 / ふたつの言い分",location:"架空イベント会社・制作事務所",
 opening:"明朝の公演前、追加照明42万円の発注書だけ承認者の署名が空白。監査室の現場担当・島袋は公演への影響を懸念し、記録担当・仲村は承認履歴を探している。",
 people:Object.freeze({cooperate:{name:"仲村 澪",line:"紙に空欄があるのは事実です。でも、電子側に記録があるかもしれません。"},confront:{name:"島袋 颯",line:"正式な手続だったかを見てください。紙の空欄だけで無断発注と呼ばれるのは困ります。"}}),
 cards:Object.freeze([
 card("A","紙の発注書","原票","追加照明42万円。発注番号 PO-044。最終承認者の紙署名欄は空白。"),
 card("B","電子購買台帳","電子記録","発注番号 PO-044。申請方法：電子。承認ID EVT-044。"),
 card("C","申請受付メール","受付記録","件名：PO-044。申請番号 EVT-044。受付20:21。本文に承認可否はない。"),
 card("D","発注の登録ログ","操作履歴","PO-044 登録20:48。更新履歴：なし。"),
 card("E","電子承認のログ","操作履歴","EVT-044 承認20:25。署名検証：成功。権限コード「代理購買3」は処理当日有効。更新履歴：なし。"),
 card("F","承認署名の履歴","認証記録","金城玲子、EVT-044。承認処理20:25。署名ハッシュは承認ログと一致。権限「代理購買3」の確認結果：有効。"),
 card("G","代理承認規程","社内規程","第3条：緊急発注では『代理購買3』の権限保持者が電子承認できる。"),
 card("H","権限台帳","人事・権限","金城玲子に『代理購買3』を付与。対象期間は発注日を含む。")
 ]),
 questions:Object.freeze([
 question("other","紙の空欄とは別に電子申請があったか？",[c("yes","同じ発注の電子申請が存在する"),c("no","電子申請は存在しない"),c("unknown","不明")],"yes",[["A","B"],["A","C"]],"紙のPO-044に電子台帳または受付メールのEVT-044が対応する。申請があることと承認が有効なことは別。"),
 question("valid","電子承認は発注前で、正規の権限に結びつくか？",[c("yes","時刻と権限に整合がある"),c("no","事後または無権限だった"),c("unknown","確認できない")],"yes",[["D","E"],["D","F"]],"発注20:48に先立ち承認20:25。署名ログは整合する。ただし代理権限の最終確認にはG/Hが追加資料となる。")
 ]),
 bonus:Object.freeze({id:"proxy",question:"代理承認者の権限も独立に照合する",docs:["G","H"],note:"代理規程と金城の権限台帳を照合すると、承認有効性の裏付けが強くなる。"}),
 result:"PO-044に電子承認IDが存在し、承認は登録の23分前。代理権限の裏付けまで揃えば、空白の紙だけを理由に無断発注とは判断できない。",
 continuity:"監査室の仲村と島袋は、結論を急ぐべきか書類を優先すべきかで意見が割れた。二人の立場をどう扱うかはその後の協力に影響する。"
 }),
 Object.freeze({
 id:"05",title:"変わった振込先",chapter:"第三夜 / 共有端末の影",location:"架空リゾート運営会社・会計課",
 opening:"月末直前に、取引先の振込先が変更された。担当者は『先方からメールが来た』と説明するが、送信元に違和感がある。",
 people:Object.freeze({cooperate:{name:"仲村 澪",line:"取引先へメールに返信せず、登録済みの別の連絡先で確認しましょう。"},confront:{name:"保守窓口",line:"共有IDから操作があったとしても、それだけで保守担当個人の操作とは限りません。"}}),
 cards:Object.freeze([
 card("A","支払先マスタ（旧）","銀行情報","取引先の登録口座末尾：6721。変更申請欄：空白。"),
 card("B","支払先マスタ（新）","銀行情報","同じ取引先の口座末尾：3094。変更時刻23:58。"),
 card("C","変更履歴の差分票","台帳差分","取引先ID V-005。旧口座末尾6721、新口座末尾3094。更新トランザクションUP-058。"),
 card("D","取引先確認メール","照会記録","取引先の以前から登録済みの担当連絡先に照会。『振込先変更を依頼していない』と回答。"),
 card("E","変更依頼メール","受信記録","送信者表示名は取引先と同じだが、返信先ドメインは1文字異なる。送信日時23:41。"),
 card("F","申請チケット一覧","承認履歴","V-005の口座変更申請チケットは0件。既存の取引先照会履歴には変更依頼もない。"),
 card("G","共有IDの操作ログ","端末履歴","23:58に svc-night が端末 T-7 から取引先マスタを更新。処理コードEX-213。個人認証IDはこの記録にはない。"),
 card("H","保守作業の引継ぎ票","保守記録","T-7は複数人で利用する保守端末。担当者の個別入退室履歴・認証記録は、この票に添付されていない。")
 ]),
 questions:Object.freeze([
 question("changed","取引先の口座情報は実際に変更されたか？",[c("yes","登録口座が変更された"),c("no","登録口座は変わっていない"),c("unknown","現資料では不明")],"yes",[["A","B"],["A","C"]],"同じ取引先の旧口座6721と新口座3094を比較すると、振込先情報の変更は確定する。"),
 question("authorized","取引先の正規の変更依頼・承認は確認できたか？",[c("no","正規の変更依頼を確認できない"),c("yes","有効な変更依頼を確認した"),c("unknown","記録がなく判断できない")],"no",[["D","E"],["D","F"]],"別経路で確認した取引先は依頼を否定し、変更メールの返信先も不一致。申請チケットにも正規承認が見当たらない。")
 ]),
 bonus:Object.freeze({id:"operator",question:"共有端末の操作と個人の行為を区別する",docs:["G","H"],note:"T-7とsvc-nightは操作経路を示すだけで、人物本人の実行や受益を確定しない。"}),
 result:"口座変更は存在するのに取引先は正式依頼を否定し、申請記録もない。送金前の重大な不一致として調査・停止が必要。ただし共有IDだけで実行者を特定してはいけない。",
 continuity:"前の2件では表示や処理の違いが誤解の原因だった。今回は相手方の否認と変更履歴が一致し、本当に重大な不一致がある。"
 })
]);
const lookup=new Map(CASES.map(x=>[x.id,x])),cardLookup=(caseId,id)=>lookup.get(caseId)?.cards.find(c=>c.id===id);
const choices=Object.freeze([{id:"clear",label:"問題なし"},{id:"review",label:"追加調査"},{id:"escalate",label:"重大な不一致"}]);
const initial=()=>({version:VERSION,actions:[]});
function evaluate(save){
 if(!save||save.version!==VERSION||!Array.isArray(save.actions)||save.actions.length>300)throw Error("キャンペーンセーブの形式が不正です。");
 const runs=new Map(CASES.map(x=>[x.id,{opened:new Set(),assign:new Map(),answers:new Map(),approach:null,report:null}]));
 let finale=null;
 for(const a of save.actions){
  if(!a||typeof a!=="object"||typeof a.type!=="string"||finale)throw Error("セーブの操作履歴が不正です。");
  if(a.type==="final"){
   if([...runs.values()].some(x=>!x.report))throw Error("全事件の報告前に総括はできません。");
   if(!["limited","accuse_all","distinguish"].includes(a.choice))throw Error("総括の選択肢が不正です。");
   finale=a.choice;continue;
  }
  const cfg=lookup.get(a.caseId),s=runs.get(a.caseId);
  if(!cfg||!s)throw Error("不明な事件です。");
  if(a.caseId!=="01"&&!runs.get("01").report)throw Error("第1事件を終えてから調査してください。");
  if(s.report)throw Error("報告済みの事件は変更できません。");
  if(a.type==="approach"){
   if(s.approach||!["cooperate","confront"].includes(a.choice))throw Error("聞取りの選択が不正です。");
   s.approach=a.choice;
  }else if(a.type==="open"){
   if(!s.approach)throw Error("最初に聞取り方針を選んでください。");
   if(s.opened.has(a.cardId)||!cardLookup(a.caseId,a.cardId))throw Error("無効なカード開封です。");
   if(s.opened.size>=REVEAL_LIMIT)throw Error("開封枠は6枚までです。");
   s.opened.add(a.cardId);
  }else if(a.type==="assign"){
   if(!cfg.questions.some(q=>q.id===a.questionId)||a.first===a.second||
     !s.opened.has(a.first)||!s.opened.has(a.second))throw Error("公開済みの異なる2枚を指定してください。");
   s.assign.set(a.questionId,[a.first,a.second]);
  }else if(a.type==="answer"){
   const q=cfg.questions.find(q=>q.id===a.questionId);
   if(!q||!s.assign.has(a.questionId)||!q.choices.some(c=>c.id===a.choice))throw Error("根拠資料を登録してから回答してください。");
   s.answers.set(q.id,a.choice);
  }else if(a.type==="report"){
   if(!choices.some(c=>c.id===a.choice))throw Error("報告の選択肢が不正です。");
   if(a.choice!=="review"&&cfg.questions.some(q=>!s.assign.has(q.id)||!s.answers.has(q.id)))throw Error("断定には必須の2問へ資料と回答が必要です。");
   s.report=a.choice;
  }else throw Error("未対応の操作です。");
 }
 const cases=CASES.map(cfg=>{
  const s=runs.get(cfg.id),submitted=!!s.report;
  const questions=cfg.questions.map(q=>{
   const assigned=s.assign.get(q.id)||null,answer=s.answers.get(q.id)||null;
   const proof=assigned?assigned.map(id=>cardLookup(cfg.id,id).id):null;
   const correctPair=!!assigned&&q.proofs.some(p=>p.join("|")===assigned.join("|")||p.join("|")===assigned.slice().reverse().join("|"));
   return {id:q.id,text:q.text,choices:q.choices,assigned:proof,answer,
     ...(submitted?{correctChoice:q.correct,correctPair,correctAnswer:answer===q.correct,
       proved:correctPair&&answer===q.correct,explain:q.explain,
       allowedPairs:q.proofs.map(ids=>ids.map(id=>cardLookup(cfg.id,id).name))}:{})};
  });
  const extra=s.opened.has(cfg.bonus.docs[0])&&s.opened.has(cfg.bonus.docs[1]);
  const readiness=questions.filter(q=>q.assigned&&q.answer).length;
  const proved=submitted&&questions.every(q=>q.proved);
  const truthfulVerdict=cfg.id==="05"?"escalate":"clear";
  return {id:cfg.id,title:cfg.title,chapter:cfg.chapter,location:cfg.location,opening:cfg.opening,
   approach:s.approach,voice:s.approach?cfg.people[s.approach]:null,
   cards:cfg.cards.map(c=>({id:c.id,name:c.name,category:c.category,
    documentId:c.id===undefined?"":cfg.id+"-"+c.id,
    ...(s.opened.has(c.id)?{record:c.record}:{}),opened:s.opened.has(c.id)})),
   questions,bonus:{question:cfg.bonus.question,revealed:extra,...(submitted&&extra?{note:cfg.bonus.note}:{})},
   opened:s.opened.size,remaining:REVEAL_LIMIT-s.opened.size,readiness,report:s.report,complete:submitted,proved,
   ...(submitted?{correctVerdict:truthfulVerdict,caseExplanation:cfg.result,followUp:cfg.continuity,
     outcome:s.report==="review"?"根拠不足を認め、正式照会として記録した。"+cfg.continuity:
      s.report===truthfulVerdict&&proved?"資料と選択肢を揃え、根拠のある監査報告ができた。"+cfg.continuity:
      "提出した資料または判断には不足がある。何が証明できたかを確認する必要がある。"+cfg.continuity}:{})};
 });
 const completed=cases.filter(x=>x.complete).length;
 const previous01=cases[0].complete;
 const prior04=cases[1].complete;
 const continuityVoice={
  "01":{opening:"仲村「記録の欠番は、消去の証明ではありません。何が残っているか見てください」",
    proven:"仲村「取消番号を追ってくれて助かりました。次の相談が来ても、先入観なしで見られそうです」",
    weak:"島袋「断定しなかったのはいい。ただ今夜の処理を説明する資料は、もう一度確認してほしい」"},
  "04":{opening:previous01?
     (runs.get("01").approach==="cooperate"?"仲村「前回は落ち着いて記録を確認してくれました。今回は電子台帳も一緒に調べましょう」":"仲村「前回の強い追及を覚えています。今回は書類による照会を先にお願いします」"):
     "島袋「紙の空欄を見た時点で、まだ無断発注とは決められません」",
    proven:"島袋「止めるなとしか言えなかった。でも記録で説明できたなら、現場も納得できます」",
    weak:"仲村「紙の署名だけで決めつけたら、現場と経理はまた対立します。追加照会を」"},
  "05":{opening:prior04?
    (runs.get("04").approach==="cooperate"?"仲村「電子承認を一緒に調べたからこそ、今回は取引先の否認を見逃せません」":"島袋「前回は激しく問い詰められた。今回は担当者の証言とログを分けて確認してください」"):
    "島袋「今度は支払先の番号が変わった。前のように相殺や表示差だけで済むのでしょうか」",
    proven:"仲村「ここで送金を止める判断には根拠があります。でも端末名だけで人を責めないでください」",
    weak:"島袋「誰かのせいにする前に、本人確認と元の依頼票をもう一度調べましょう」"}
 };
 const stories=cases.map(c=>{
  const cfg=continuityVoice[c.id],observed=c.opened>0,follow=c.complete?(c.proved?cfg.proven:cfg.weak):
   c.approach&&observed?"机上の資料を一つずつ並べた。どの2枚なら、目の前の疑問について証明できるだろう。":
   c.approach?"聞取りを終えた。資料名と疑問を見比べて、最初に確認する記録を選ぼう。":cfg.opening;
  const tension=c.approach==="confront"?"強い追及で相手は警戒している。提出する結論には、より丁寧な説明が必要だ。":
   c.approach==="cooperate"?"慎重な聞取りで対話の余地が残っている。事実と推測を分けて報告しよう。":"";
  const callback=c.id==="05"&&runs.get("05").opened.has("G")?
   (runs.get("05").opened.has("H")?"T-7の記録と共有端末の引継ぎ票を両方閲覧済み。個人の特定には追加資料が必要。":"T-7という操作端末名を見つけた。誰が使ったかは、まだ分からない。"):"";
  return {caseId:c.id,voice:cfg.opening,follow,tension,callback};
 });
 const trust=cases.reduce((score,c)=>score+
  (c.approach==="cooperate"?1:c.approach==="confront"?-1:0)+
  (c.complete&&c.proved?1:0),0);
 const teamwork=trust>=4?"関係者と情報を共有できる監査室になった。":trust<=-1?
  "証拠は残ったが、調査への協力をためらう関係者もいる。": "監査室の協力関係には、まだ修復できる余地がある。";
 const teamRelations=cases.map(c=>({caseId:c.id,approach:c.approach||"undecided",
    cooperation:c.approach==="cooperate"?"対話を維持":c.approach==="confront"?"慎重な対応が必要":"未接触"}));

 const case5=runs.get("05");
 const attributionNotice=case5.opened.has("G")&&case5.opened.has("H")?
   "端末T-7は複数人で使われた記録があり、個人認証・入退室記録がなく操作した自然人は未特定。":
   case5.opened.has("G")?"操作ログにはT-7が出るが、個人を特定する独立資料はまだない。":
   "口座を変更した自然人について、現時点で資料を確保していない。";

 return {cases:cases.map((c,i)=>({...c,story:stories[i]})),teamRelations,trust,teamwork,completed,finale,unlocked:completed>0||cases[0].complete?["01","04","05"]:["01"],
  ...(finale?{finalReport:finale==="accuse_all"?
    "3事件すべてを同一犯の犯行と断定したが、そのような独立した証拠は存在しない。監査報告の信用を失った。":
    finale==="limited"?"結論を保留して追加照会を選んだ。誤告発を避けたが、今夜の調査は未完了となった。":
    "1件目は取消記録、4件目は電子承認、5件目は無承認の口座変更という重大な不一致。共通の『不明な記録』でも、それぞれ根拠と結論が異なる。" + attributionNotice + "この範囲だけを報告した。" + teamwork"}:{})};
}

function view(save){
 const s=evaluate(save);
 return {...s,version:VERSION,cardLimit:REVEAL_LIMIT,finalChoices:[
  {id:"distinguish",label:"3件それぞれの根拠と未確定点を区別して報告"},
  {id:"limited",label:"事件をまたぐ関連はまだ不明として継続調査"},
  {id:"accuse_all",label:"全事件の背後に同一犯がいると告発"}]};
}
function apply(save,action){
 evaluate(save);
 if(!action||typeof action!=="object")throw Error("操作を選んでください。");
 const next={version:VERSION,actions:[...save.actions,{...action}]};
 evaluate(next);
 return next;
}
return Object.freeze({VERSION,REVEAL_LIMIT,CASES,initial,view,apply});
});
