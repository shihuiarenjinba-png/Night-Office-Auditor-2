/* Night Office Auditor Expanded — offline deterministic story/evidence engine. */
(function(root,factory){const game=factory();if(typeof module==="object"&&module.exports)module.exports=game;else root.NightOfficeGame=game;})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const VERSION=3,CASE_COUNT=24,BUDGET=10;
const PROOFBOOK=typeof module==="object"&&module.exports?require("./case-proofbook.js"):globalThis.NightOfficeProofBook;
if(!Array.isArray(PROOFBOOK)||PROOFBOOK.length!==CASE_COUNT)throw Error("案件ごとの証拠資料を読み込めませんでした。");
const SOURCES=Object.freeze([
 {id:"ledger",label:"領収書・台帳を照合",cost:3},
 {id:"timeline",label:"時刻・操作履歴を追う",cost:4},
 {id:"approval",label:"承認・社内連絡を読む",cost:5}
]);
const CHOICES=Object.freeze([
 {id:"clear",label:"問題なし と判断する"},
 {id:"review",label:"再調査 と判断する"},
 {id:"escalate",label:"問題あり と判断する"}
]);
const SIGNATURES=Object.freeze([
 "深夜、数字は嘘をつくことがある。",
 "疑うのは簡単だ。確かめるのが監査だ。",
 "証拠は静かだ。だからこそ、見落としは許されない。",
 "夜が明ける前に、数字の嘘を終わらせる。"
]);
const SCENARIOS=Object.freeze([
 {chapter:"CHAPTER I / 夜の違和感",title:"消えた伝票",location:"那覇港近くの架空物流センター",subject:"伝票",story:"締め後の伝票番号が一つだけ飛んでいる。新人担当者は『入力漏れです』と言うが、夜間の受付記録には別の番号が残っていた。",note:"最初の違和感を真相と決めつけない。"},
 {chapter:"CHAPTER I / 夜の違和感",title:"午前二時の領収書",location:"国際通り近くの架空飲食会社事務所",subject:"経費",story:"午前二時十三分、閉店後のはずの店舗で高額な領収書が切られている。担当者は接待費だと説明した。",note:"時刻と金額、どちらが本当に重要か。"},
 {chapter:"CHAPTER I / 夜の違和感",title:"倉庫の差額",location:"浦添の架空倉庫街",subject:"在庫",story:"棚卸し数と帳簿に差がある。現場は『翌朝入庫分です』と言うが、搬入口の記録は曖昧だ。",note:"帳簿だけでなく、物の移動も追う。"},
 {chapter:"CHAPTER I / 夜の違和感",title:"白紙の承認欄",location:"沖縄市の架空イベント会社",subject:"申請",story:"大型機材の追加発注に承認者の署名がない。口頭承認だったという説明だけが残っている。",note:"承認の不在は即座に不正を意味しない。"},
 {chapter:"CHAPTER I / 夜の違和感",title:"変わった振込先",location:"北谷の架空リゾート運営会社",subject:"支払",story:"月末直前に取引先の振込先が変更された。変更依頼メールは本物に見えるが、送信時刻が不自然だ。",note:"変更そのものより、誰が確かめたかを見る。"},
 {chapter:"CHAPTER I / 夜の違和感",title:"最後のタクシー",location:"那覇市内の架空支店",subject:"精算",story:"終電後のタクシー代が連日計上されている。繁忙期だったという説明と勤務記録は一致するだろうか。",note:"高額かどうかより、説明がつながるか。"},
 {chapter:"CHAPTER II / つながる記録",title:"冷凍庫の空白",location:"糸満の架空冷蔵倉庫",subject:"在庫",story:"温度ログだけが十五分間途切れ、その直後に廃棄処理が発生した。設備故障か、人為的操作か。",note:"一つのログ欠損に意味を持たせすぎない。"},
 {chapter:"CHAPTER II / つながる記録",title:"夜間工事の追加請求",location:"宜野湾の架空建設会社現場事務所",subject:"請求",story:"深夜工事の追加人件費が請求されている。しかし入退場記録の人数と合わない。",note:"人数、時刻、承認の三点を切り分ける。"},
 {chapter:"CHAPTER II / つながる記録",title:"貨物便214",location:"那覇空港近くの架空貨物事務所",subject:"貨物",story:"貨物便214の受取時刻が二つのシステムで異なる。どちらかが改ざんされたのか、単なる同期ずれか。",note:"同じ時刻でも、記録された瞬間は違う。"},
 {chapter:"CHAPTER II / つながる記録",title:"止まらないライン",location:"うるまの架空製造工場",subject:"生産",story:"設備停止が記録された時間にも生産実績が増えている。現場はバックアップ処理だと説明した。",note:"システム上の停止と実作業の停止は同じとは限らない。"},
 {chapter:"CHAPTER II / つながる記録",title:"寄付金の封筒",location:"南城の架空福祉施設",subject:"入金",story:"現金寄付の記録と銀行入金額に小さな差が続く。複数日の端数が同じ方向に偏っていた。",note:"一度の差より、繰り返し方を見る。"},
 {chapter:"CHAPTER II / つながる記録",title:"マリーナの燃料票",location:"本部の架空マリーナ事務所",subject:"燃料",story:"船舶燃料の使用量が航行記録より多い。予備タンクへの移送があったというが、承認票が見つからない。",note:"物の流れと書類の流れを一致させる。"},
 {chapter:"CHAPTER III / 誰が承認した",title:"消えた外注先",location:"那覇の架空デザイン会社",subject:"外注",story:"外注費の支払先が翌月には存在しない。制作物は納品されているが、契約履歴が極端に少ない。",note:"成果物があることと、契約が正しいことは別。"},
 {chapter:"CHAPTER III / 誰が承認した",title:"二重の車両番号",location:"豊見城の架空車両基地",subject:"車両",story:"同じ時間帯に同じ車両番号が二つの拠点で使われている。入力ミスか、別車両の付け替えか。",note:"あり得ない記録は、最初に入力経路を疑う。"},
 {chapter:"CHAPTER III / 誰が承認した",title:"返品されない商品",location:"浦添の架空配送センター",subject:"返品",story:"返品処理された商品が倉庫に戻っていない。顧客返金だけは正常に完了している。",note:"金銭と在庫は別の証拠として扱う。"},
 {chapter:"CHAPTER III / 誰が承認した",title:"ライブハウスの前売券",location:"沖縄市の架空ライブハウス",subject:"売上",story:"前売券の発行数と入金額が合わない。無料招待分が含まれるという説明は記録に残っているか。",note:"売れた数と入った金を混同しない。"},
 {chapter:"CHAPTER III / 誰が承認した",title:"消えた客室売上",location:"北谷の架空ホテル",subject:"売上",story:"満室だった夜に限って、一部客室の売上が翌日に移されている。システム障害という説明が出ている。",note:"障害なら、他の記録にも痕跡があるはずだ。"},
 {chapter:"CHAPTER III / 誰が承認した",title:"深夜診療の精算",location:"那覇の架空クリニック事務室",subject:"精算",story:"深夜診療分の現金精算だけ、担当者の手計算で修正されている。患者記録との整合を確かめる必要がある。",note:"個人情報ではなく、処理の整合だけを見る。"},
 {chapter:"CHAPTER IV / 夜明け前",title:"漁協倉庫の箱",location:"糸満の架空水産共同倉庫",subject:"在庫",story:"出荷済みとされた箱が翌朝も倉庫に残っていた。伝票だけが先に処理された可能性がある。",note:"現物が残っている理由を一つに決めない。"},
 {chapter:"CHAPTER IV / 夜明け前",title:"返却されない機材",location:"宜野湾の架空レンタル会社",subject:"機材",story:"返却済みの機材が別案件で使用された記録を持つ。バーコードの貼り替えか、台帳更新の遅れか。",note:"識別番号の履歴を追う。"},
 {chapter:"CHAPTER IV / 夜明け前",title:"通話記録の十三分",location:"那覇の架空コールセンター",subject:"勤務",story:"残業申請と通話ログに十三分の空白が毎日ある。休憩なのか、別作業なのか、説明は統一されていない。",note:"繰り返す空白には運用ルールが隠れる。"},
 {chapter:"CHAPTER IV / 夜明け前",title:"発電量ゼロの請求書",location:"うるまの架空太陽光設備事務所",subject:"請求",story:"発電量がゼロだった時間帯にも保守費が計上されている。契約上は正しい可能性もある。",note:"数字だけでなく契約条件を確かめる。"},
 {chapter:"CHAPTER IV / 夜明け前",title:"キャンセルされたツアー",location:"名護の架空観光会社",subject:"返金",story:"台風で中止されたツアーの返金件数が予約数より一件少ない。例外処理の理由が記録されていない。",note:"最後の一件ほど見落とされやすい。"},
 {chapter:"CHAPTER IV / 夜明け前",title:"午前二時十三分の編集者",location:"那覇本社・架空企業の最上階",subject:"監査記録",story:"過去23件のうち複数の記録が、同じ午前二時十三分に編集されていた。今夜の違和感は、最初から一つにつながっていたのかもしれない。",note:"最後に疑うべきは、数字ではなく数字を残した手順だ。"}
]);
const RATING=Object.freeze([[115,28,-110],[-35,95,-55],[-155,24,150]]);
const TRUST=Object.freeze([[3,0,-9],[-4,3,-6],[-15,-3,4]]);
const integer=(v,label,min,max)=>{if(!Number.isSafeInteger(v)||v<min||v>max)throw Error(label+"が不正です。");return v;};
const clone=x=>JSON.parse(JSON.stringify(x));
function random(seed,index,salt){let a=(seed^Math.imul(index+1,0x9e3779b1)^Math.imul(salt+1,0x85ebca6b))>>>0;a^=a>>>16;a=Math.imul(a,0x7feb352d);a^=a>>>15;a=Math.imul(a,0x846ca68b);a^=a>>>16;return(a>>>0)/4294967296;}
function spec(seed,index){
 integer(seed,"seed",1,2147483647);integer(index,"index",0,CASE_COUNT-1);
 const scenario=SCENARIOS[index];
 const proof=PROOFBOOK[index];
 const truth=proof.verdict,key=SOURCES.findIndex(x=>x.id===proof.primary);
 if(key<0)throw Error("証拠資料の調査先が不正です。");
 return {...scenario,index,truth,key,signature:SIGNATURES[Math.min(SIGNATURES.length-1,Math.floor(index/6))]};
}
function initial(seed=20261024){integer(seed,"seed",1,2147483647);return {version:VERSION,seed,index:0,score:0,trust:60,history:[],active:{checked:[],minutesLeft:BUDGET},complete:false};}
function checkedCost(list){if(!Array.isArray(list)||list.length>2)throw Error("調査記録が多すぎます。");if(new Set(list).size!==list.length)throw Error("調査記録に重複があります。");let sum=0;for(const id of list){const s=SOURCES.find(x=>x.id===id);if(!s)throw Error("調査記録の種類が不正です。");sum+=s.cost;}if(sum>BUDGET)throw Error("制限時間を超えた調査記録です。");return sum;}
function recordFor(seed,index,choice,checked){const c=spec(seed,index),ci=CHOICES.findIndex(x=>x.id===choice);if(ci<0)throw Error("報告の種類が不正です。");const effort=checkedCost(checked),supported=checked.length===2&&PROOFBOOK[index].required.every(id=>checked.includes(id));
 const unsupportedPenalty=choice!=="review"&&!supported?65:0;
 return {index,choice,checked:[...checked],truth:c.truth,scoreDelta:RATING[c.truth][ci]-2*effort-unsupportedPenalty,trustDelta:TRUST[c.truth][ci],effort,supported};}
function validate(raw){
 if(!raw||raw.version!==VERSION||!Array.isArray(raw.history)||!raw.active||!Array.isArray(raw.active.checked))throw Error("セーブ形式が不正です。");
 const seed=integer(raw.seed,"seed",1,2147483647),index=integer(raw.index,"index",0,CASE_COUNT);
 if(raw.history.length!==index||raw.complete!==(index===CASE_COUNT))throw Error("案件の進行状況が不正です。");
 let score=0,trust=60;
 for(let i=0;i<index;i++){const row=raw.history[i];if(!row||row.index!==i)throw Error("監査履歴の順序が不正です。");const expected=recordFor(seed,i,row.choice,row.checked);if(JSON.stringify(row)!==JSON.stringify(expected))throw Error("監査の得点・結果が一致しません。");score+=expected.scoreDelta;trust=Math.max(0,Math.min(100,trust+expected.trustDelta));}
 const used=checkedCost(raw.active.checked);if(raw.active.minutesLeft!==BUDGET-used)throw Error("調査時間の残量が一致しません。");if(index===CASE_COUNT&&raw.active.checked.length)throw Error("完了済み案件に調査記録があります。");if(raw.score!==score||raw.trust!==trust)throw Error("得点・信用度が履歴と一致しません。");return clone(raw);
}
function clue(seed,index,id){
 spec(seed,index);
 const i=SOURCES.findIndex(x=>x.id===id);
 if(i<0)throw Error("存在しない調査先です。");
 const proof=PROOFBOOK[index],document=proof.evidence[id];
 if(!document)throw Error("証拠文書が登録されていません。");
 return {id,documentId:document.id,title:SOURCES[i].label,detail:document.detail,reliability:"照合可能な記録"};
}
function current(raw){
 const s=validate(raw);
 if(s.complete)return {complete:true,processed:CASE_COUNT,rating:s.trust>=70&&s.score>=1900?"夜明けを迎えた主任監査官":s.trust>=40&&s.score>=950?"信頼を守る監査官":"まだ夜を歩く調査員",finalTrust:s.trust,finalScore:s.score};
 const c=spec(s.seed,s.index);
 return {complete:false,caseNumber:s.index+1,caseCount:CASE_COUNT,title:c.title,location:c.location,chapter:c.chapter,story:c.story,note:c.note,signature:c.signature,minutesLeft:s.active.minutesLeft,
  sources:SOURCES.map(v=>({...v,checked:s.active.checked.includes(v.id),available:!s.active.checked.includes(v.id)&&s.active.minutesLeft>=v.cost})),
  findings:s.active.checked.map(id=>clue(s.seed,s.index,id)),choices:CHOICES.map(x=>({...x})),score:s.score,trust:s.trust};
}
function inspect(raw,id){const s=validate(raw);if(s.complete)throw Error("すべての案件を終了しました。");const source=SOURCES.find(x=>x.id===id);if(!source)throw Error("存在しない調査先です。");if(s.active.checked.includes(id))throw Error("この証拠はすでに確認しています。");if(s.active.minutesLeft<source.cost)throw Error("この調査を行う時間が残っていません。");s.active.checked.push(id);s.active.minutesLeft-=source.cost;return {state:validate(s),finding:clue(s.seed,s.index,id)};}
function decide(raw,choice){
 const s=validate(raw);if(s.complete)throw Error("これ以上の案件はありません。");const c=spec(s.seed,s.index),record=recordFor(s.seed,s.index,choice,s.active.checked),oldScore=s.score;s.history.push(record);s.index++;s.score+=record.scoreDelta;s.trust=Math.max(0,Math.min(100,s.trust+record.trustDelta));s.complete=s.index===CASE_COUNT;s.active={checked:[],minutesLeft:BUDGET};
 const actual=CHOICES[c.truth],judgment=CHOICES.find(x=>x.id===choice),proof=PROOFBOOK[c.index];
 const message=actual.id===choice?
   (record.supported?"調査した主要資料と補強資料が結論に一致しました。":"判断結果は一致していますが、確認した資料では裏付けが不十分です。"):
   "判断と照合結果は異なりました。資料番号ごとに矛盾を検証してください。";
 const report={caseNumber:c.index+1,title:c.title,location:c.location,judgment:judgment.label,
  actual:actual.label,correct:actual.id===choice,supported:record.supported,
  scoreDelta:s.score-oldScore,trustDelta:record.trustDelta,
  keyFinding:clue(s.seed,c.index,SOURCES[c.key].id).detail,message,
  proofExplanation:proof.conclusion,alternative:proof.alternative,attributionLimits:proof.limits,
  primaryDocument:proof.evidence[proof.primary].id,
  reviewedDocumentIds:record.checked.map(id=>proof.evidence[id].id),
  postReviewDocuments:SOURCES.map(x=>({id:proof.evidence[x.id].id,title:x.label,detail:proof.evidence[x.id].detail,reviewed:record.checked.includes(x.id)}))};
 return {state:validate(s),report};
}
return Object.freeze({VERSION,CASE_COUNT,BUDGET,SOURCES,CHOICES,SIGNATURES,SCENARIOS,initial,validate,current,inspect,decide,spec,clue,random});
});