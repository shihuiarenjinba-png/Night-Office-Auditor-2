/* Case-specific deduction prompts. The labels invite the player's decision; they are not solutions. */
(function(root,factory){const v=factory();if(typeof module==="object"&&module.exports)module.exports=v;else root.NightOfficeQuestions=v;})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const Q=[
 {
  "caseId": "N01",
  "question": "欠けた0418番の伝票は何を意味するのか？",
  "options": [
   {
    "id": "clear",
    "label": "正規の取消記録で説明できる"
   },
   {
    "id": "review",
    "label": "記録が足りず判断できない"
   },
   {
    "id": "escalate",
    "label": "意図的な隠蔽を示している"
   }
  ]
 },
 {
  "caseId": "N02",
  "question": "閉店後2:13の領収書から、何が言えるか？",
  "options": [
   {
    "id": "clear",
    "label": "接待が正規に実施されたと確定する"
   },
   {
    "id": "review",
    "label": "送信時刻だけでは接待の実施を証明できない"
   },
   {
    "id": "escalate",
    "label": "架空接待が確定する"
   }
  ]
 },
 {
  "caseId": "N03",
  "question": "在庫12箱の差は、何で説明できるか？",
  "options": [
   {
    "id": "clear",
    "label": "翌朝入庫のズレですべて説明できる"
   },
   {
    "id": "review",
    "label": "搬出の正当性について追加資料が必要"
   },
   {
    "id": "escalate",
    "label": "無承認搬出の重大な不一致がある"
   }
  ]
 },
 {
  "caseId": "N04",
  "question": "白紙の承認欄は、無断発注の根拠となるか？",
  "options": [
   {
    "id": "clear",
    "label": "電子代理承認で整合する"
   },
   {
    "id": "review",
    "label": "承認記録が不十分で保留すべき"
   },
   {
    "id": "escalate",
    "label": "無断発注と確定する"
   }
  ]
 },
 {
  "caseId": "N05",
  "question": "振込先の変更について、監査が出すべき判断は？",
  "options": [
   {
    "id": "clear",
    "label": "通常の口座変更と確認できる"
   },
   {
    "id": "review",
    "label": "追加照会するまで判断できない"
   },
   {
    "id": "escalate",
    "label": "取引先の否認と登録変更に重大な不一致"
   }
  ]
 },
 {
  "caseId": "N06",
  "question": "深夜のタクシー精算は正当だったのか？",
  "options": [
   {
    "id": "clear",
    "label": "勤務命令まで確認できる"
   },
   {
    "id": "review",
    "label": "利用は確認できるが会社負担の承認は未確認"
   },
   {
    "id": "escalate",
    "label": "架空乗車と断定できる"
   }
  ]
 },
 {
  "caseId": "N07",
  "question": "消えた温度記録の正体は？",
  "options": [
   {
    "id": "clear",
    "label": "通信断と再送の記録が整合する"
   },
   {
    "id": "review",
    "label": "ローカルの温度計記録が不明で保留"
   },
   {
    "id": "escalate",
    "label": "温度データの人為削除が確定する"
   }
  ]
 },
 {
  "caseId": "N08",
  "question": "工事員9人の請求をどう評価する？",
  "options": [
   {
    "id": "clear",
    "label": "9名全員の作業記録が残る"
   },
   {
    "id": "review",
    "label": "9人目の入場記録を追加確認する"
   },
   {
    "id": "escalate",
    "label": "承認のない1名分が請求されている"
   }
  ]
 },
 {
  "caseId": "N09",
  "question": "貨物便214の時刻差は改ざんか？",
  "options": [
   {
    "id": "clear",
    "label": "すべて時差変換で説明できる"
   },
   {
    "id": "review",
    "label": "手動訂正1件の承認が不明"
   },
   {
    "id": "escalate",
    "label": "故意の改ざんが確定する"
   }
  ]
 },
 {
  "caseId": "N10",
  "question": "停止したラインの生産記録は？",
  "options": [
   {
    "id": "clear",
    "label": "停止前データの再送が確認できる"
   },
   {
    "id": "review",
    "label": "生産時刻の独立証明が必要"
   },
   {
    "id": "escalate",
    "label": "架空生産が確定する"
   }
  ]
 },
 {
  "caseId": "N11",
  "question": "寄付金の差額をどう扱う？",
  "options": [
   {
    "id": "clear",
    "label": "入金と原票が整合する"
   },
   {
    "id": "review",
    "label": "封緘記録の確認を続ける"
   },
   {
    "id": "escalate",
    "label": "原票と入金が食い違い統制に重大な欠陥"
   }
  ]
 },
 {
  "caseId": "N12",
  "question": "燃料の差分22Lから判断できることは？",
  "options": [
   {
    "id": "clear",
    "label": "承認済み移送が実測で確認できる"
   },
   {
    "id": "review",
    "label": "移送票はあるが独立した裏付けが不足"
   },
   {
    "id": "escalate",
    "label": "燃料盗取が確定する"
   }
  ]
 },
 {
  "caseId": "N13",
  "question": "消えた外注先への支払いは正当か？",
  "options": [
   {
    "id": "clear",
    "label": "契約と支払先が一致している"
   },
   {
    "id": "review",
    "label": "法人番号の確認を要する"
   },
   {
    "id": "escalate",
    "label": "契約名義と支払先に重大な不一致"
   }
  ]
 },
 {
  "caseId": "N14",
  "question": "同じ車両番号が二台に見えた理由は？",
  "options": [
   {
    "id": "clear",
    "label": "管理番号の移行記録で説明できる"
   },
   {
    "id": "review",
    "label": "両車の独立ログが不明"
   },
   {
    "id": "escalate",
    "label": "不正な車両使用が確定する"
   }
  ]
 },
 {
  "caseId": "N15",
  "question": "返品されない商品をどう報告する？",
  "options": [
   {
    "id": "clear",
    "label": "返品と在庫の記録が整合する"
   },
   {
    "id": "review",
    "label": "検品承認をもう一度確認する"
   },
   {
    "id": "escalate",
    "label": "3点の無承認ルート変更が記録で追える"
   }
  ]
 },
 {
  "caseId": "N16",
  "question": "前売券と入金の差は何を意味する？",
  "options": [
   {
    "id": "clear",
    "label": "すべて招待券の承認記録がある"
   },
   {
    "id": "review",
    "label": "残り5枚の決済IDが未照合"
   },
   {
    "id": "escalate",
    "label": "売上金がすべて盗まれた"
   }
  ]
 },
 {
  "caseId": "N17",
  "question": "満室のホテルで消えた売上は？",
  "options": [
   {
    "id": "clear",
    "label": "翌日振替が全件承認済み"
   },
   {
    "id": "review",
    "label": "障害チケットの確認が必要"
   },
   {
    "id": "escalate",
    "label": "2室の無承認振替操作が記録されている"
   }
  ]
 },
 {
  "caseId": "N18",
  "question": "深夜診療の現金調整は不正か？",
  "options": [
   {
    "id": "clear",
    "label": "訂正と入金額が整合する"
   },
   {
    "id": "review",
    "label": "匿名集計の突合が未了"
   },
   {
    "id": "escalate",
    "label": "患者情報の改ざんと断定できる"
   }
  ]
 },
 {
  "caseId": "N19",
  "question": "出荷済の箱が倉庫に残る理由は？",
  "options": [
   {
    "id": "clear",
    "label": "輸送会社への引渡しがすべて確定"
   },
   {
    "id": "review",
    "label": "先行伝票は適法でも現物追跡は未了"
   },
   {
    "id": "escalate",
    "label": "商品の横流しが確定"
   }
  ]
 },
 {
  "caseId": "N20",
  "question": "返却機の番号が重なる理由は？",
  "options": [
   {
    "id": "clear",
    "label": "交換品の実機シリアルまで一致する"
   },
   {
    "id": "review",
    "label": "番号貼替と実機を照合できていない"
   },
   {
    "id": "escalate",
    "label": "機材盗取が立証された"
   }
  ]
 },
 {
  "caseId": "N21",
  "question": "13分の空白は誰かの隠し作業か？",
  "options": [
   {
    "id": "clear",
    "label": "全員共通の集計切替で整合する"
   },
   {
    "id": "review",
    "label": "集計ジョブの内容が未確認"
   },
   {
    "id": "escalate",
    "label": "特定担当者の不正が確定"
   }
  ]
 },
 {
  "caseId": "N22",
  "question": "発電量ゼロの日の保守費は正当か？",
  "options": [
   {
    "id": "clear",
    "label": "月額固定契約と巡回実績が整合する"
   },
   {
    "id": "review",
    "label": "契約改訂の確認が必要"
   },
   {
    "id": "escalate",
    "label": "実績ゼロのため不正請求"
   }
  ]
 },
 {
  "caseId": "N23",
  "question": "ツアー代の未返金1件は何を示す？",
  "options": [
   {
    "id": "clear",
    "label": "51件すべての返金が完了"
   },
   {
    "id": "review",
    "label": "返金失敗後の処理が未確認"
   },
   {
    "id": "escalate",
    "label": "担当者の横領が確定"
   }
  ]
 },
 {
  "caseId": "N24",
  "question": "午前2:13の編集者について証明できる範囲は？",
  "options": [
   {
    "id": "clear",
    "label": "すべて自動バッチの正規処理"
   },
   {
    "id": "review",
    "label": "端末の人物特定はできない"
   },
   {
    "id": "escalate",
    "label": "手動改訂と監査通知の除外指示が裏付けられる"
   }
  ]
 }
];
if(Q.length!==24||new Set(Q.map(x=>x.caseId)).size!==24)throw Error("Question ledger mismatch");
return Object.freeze(Q.map(q=>Object.freeze({...q,options:Object.freeze(q.options.map(o=>Object.freeze(o)))})));
});
