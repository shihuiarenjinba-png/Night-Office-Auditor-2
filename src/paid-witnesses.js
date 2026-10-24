/* Distinct fictional witness dialogue for 24 cases. No hidden verdicts in voice text. */
(function(root,factory){const v=factory();if(typeof module==="object"&&module.exports)module.exports=v;else root.NightOfficeWitnesses=v;})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const records=[
 {
  "caseId": "N01",
  "name": "仲村 澪",
  "careful": "台帳の欠番を見せてください。すぐに消去と決めつけたくない。",
  "press": "番号が飛んだ理由を説明してください。原票と変更履歴も必要です。"
 },
 {
  "caseId": "N02",
  "name": "仲村 澪",
  "careful": "2時13分が何を記録した時刻なのか、先に確かめましょう。",
  "press": "営業していない時間です。いつ誰が伝票を送ったのか説明を求めます。"
 },
 {
  "caseId": "N03",
  "name": "島袋 颯",
  "careful": "帳簿と現物の差が出た時点を一緒に確認しましょう。",
  "press": "不足分の箱を特定しましょう。車両の履歴も照会します。"
 },
 {
  "caseId": "N04",
  "name": "仲村 澪",
  "careful": "紙の承認欄は確かに空白です。ほかの承認手段があるか探します。",
  "press": "署名がありません。承認した人の権限を示す資料を出してください。"
 },
 {
  "caseId": "N05",
  "name": "島袋 颯",
  "careful": "送金前なら止められます。登録済みの連絡先へ確認しましょう。",
  "press": "この変更を誰が依頼しましたか。申請番号も提出してください。"
 },
 {
  "caseId": "N06",
  "name": "仲村 澪",
  "careful": "乗車の事実と、会社が負担すべきかは分けて考えたいです。",
  "press": "勤務記録と精算記録を全部見せてください。"
 },
 {
  "caseId": "N07",
  "name": "島袋 颯",
  "careful": "機械そのものの記録は残っているかもしれない。送信履歴と分けよう。",
  "press": "その15分の間の操作を、時刻の分かる記録で示してください。"
 },
 {
  "caseId": "N08",
  "name": "工事責任者",
  "careful": "作業人数の記録と請求人数を、一人ずつ確かめてください。",
  "press": "9人目の現場入場記録はどこですか。"
 },
 {
  "caseId": "N09",
  "name": "仲村 澪",
  "careful": "二つのシステムで時刻の定義が違う可能性があります。",
  "press": "一分ずれた分の手動訂正に承認が必要だったはずです。"
 },
 {
  "caseId": "N10",
  "name": "設備担当",
  "careful": "機械が止まった後でデータを再送したかもしれません。",
  "press": "登録時刻と製造時刻の両方を示してください。"
 },
 {
  "caseId": "N11",
  "name": "仲村 澪",
  "careful": "寄付された金額と銀行入金を一緒に数え直したいです。",
  "press": "紙の原票と電子控えの差を説明してください。"
 },
 {
  "caseId": "N12",
  "name": "マリーナ担当",
  "careful": "予備タンクへの移送票があるかを探します。",
  "press": "実測の裏付けと責任者の承認記録をお願いします。"
 },
 {
  "caseId": "N13",
  "name": "島袋 颯",
  "careful": "納品があっても契約先が正しいとは限らない。法人番号を調べましょう。",
  "press": "支払先の変更履歴と契約の名義を説明してください。"
 },
 {
  "caseId": "N14",
  "name": "配車係",
  "careful": "新旧コードが混在していないか、車両ごとの位置記録で見ましょう。",
  "press": "同時刻に二台と出た番号の割当履歴を提出してください。"
 },
 {
  "caseId": "N15",
  "name": "仲村 澪",
  "careful": "返品処理と現物の到着を別々に調べます。",
  "press": "返金された商品は今どこにありますか。番号で答えてください。"
 },
 {
  "caseId": "N16",
  "name": "主催者窓口",
  "careful": "招待と販売では計上が違います。承認された招待枚数を確認します。",
  "press": "無料招待分の承認票を提示してください。"
 },
 {
  "caseId": "N17",
  "name": "島袋 颯",
  "careful": "障害の記録と、人が行った振替を分けて確認したい。",
  "press": "翌日に振り替えた2室について正式な承認はありますか。"
 },
 {
  "caseId": "N18",
  "name": "仲村 澪",
  "careful": "個人の情報は扱わず、匿名の集計と入金だけ照合しましょう。",
  "press": "現金修正の理由と訂正承認を示してください。"
 },
 {
  "caseId": "N19",
  "name": "倉庫担当",
  "careful": "伝票が先でも、積込が終わっていないことはあります。",
  "press": "箱の現物と配送会社への引渡し記録を見せてください。"
 },
 {
  "caseId": "N20",
  "name": "島袋 颯",
  "careful": "管理番号だけでは現物が同じとは限らない。実機を調べよう。",
  "press": "貼り替えたバーコードと機器のシリアルを照合します。"
 },
 {
  "caseId": "N21",
  "name": "監査室の仲村",
  "careful": "全員同じ時間帯が空白なら、共通処理かもしれません。",
  "press": "毎日13分間、何を停止しているのか記録で示してください。"
 },
 {
  "caseId": "N22",
  "name": "保守担当",
  "careful": "発電量で変わる費用と、固定費を分けて契約を読みましょう。",
  "press": "発電していない日に請求できる根拠条項はどこですか。"
 },
 {
  "caseId": "N23",
  "name": "仲村 澪",
  "careful": "最後の一件の銀行控えが見つかれば説明できるかもしれません。",
  "press": "保留された返金の処理番号と送金先を確認します。"
 },
 {
  "caseId": "N24",
  "name": "監査室長",
  "careful": "これまでの事件を、一つの犯人像に押し込めないでください。",
  "press": "自動処理と人の修正を、認証と時刻で分けて報告してください。"
 }
];
if(records.length!==24)throw Error("Witness ledger mismatch");
function speaking(index,choice,earlier){
 const person=records[index];if(!person)return null;
 const prior=Array.isArray(earlier)?earlier.filter(x=>x==="careful"||x==="press"):[];
 const caution=prior.filter(x=>x==="press").length;
 const callback=index===0?"":index>=12?
   (caution>prior.length/2?"「以前の強い追及は覚えています。今夜は記録を先に見せてください」":
    "「前の監査では、事実と推測を分けてくれました。今回も確認に協力します」"):
   (prior.length&&caution>prior.length/2?"相手の返答は慎重だ。まず資料を示す必要がある。":
    prior.length?"監査室では以前の聞取り方針が引き継がれている。":"");
 return {name:person.name,callback,reply:choice?person[choice]:null,
   relationship:prior.length?Math.round(100*prior.filter(x=>x==="careful").length/prior.length):null};
}
return Object.freeze({records:Object.freeze(records.map(x=>Object.freeze(x))),speaking});
});
