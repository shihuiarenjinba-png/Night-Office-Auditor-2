/* Case 04 branching narrative: fictional characters, auditable proof, persistent player choices. */
(function(root,factory){
 const game=factory();
 if(typeof module==="object"&&module.exports)module.exports=game;
 else root.Case04Branch=game;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
 "use strict";
 const VERSION=1,ID="CASE04-INTERACTIVE";
 const people=Object.freeze({
  nakamura:{name:"仲村 澪",role:"経理担当",trait:"丁寧だが、間違いを自分の責任にされることを恐れている。"},
  shimabukuro:{name:"島袋 颯",role:"現場主任",trait:"イベントを必ず成功させたい。経理の確認で設営が止まることに苛立っている。"},
  kinjo:{name:"金城 玲子",role:"代理承認者",trait:"規則に厳格。口頭証言だけでは正当な承認と認めない。"}
 });
 const documents=Object.freeze({
  sheet:{id:"N04-L",label:"発注台帳",body:"追加照明42万円、発注番号 PO-044。紙の署名欄は空欄。電子承認ID EVT-044 が台帳に付いている。"},
  system:{id:"N04-T",label:"署名付き操作ログ",body:"EVT-044 は発注登録の23分前に処理。承認記録の時刻変更はなく、後付け承認の痕跡はない。"},
  policy:{id:"N04-A",label:"代理承認規程",body:"社内規程第3条は緊急発注時の代理承認を認める。金城玲子の署名付き承認IDは EVT-044 に一致。"}
 });
 const lines=Object.freeze({
  intro:{speaker:"仲村 澪",line:"照明機材の請求が42万円。でも署名欄が空白なんです。明日の公演前に処理するよう言われていて……。"},
  site:{speaker:"島袋 颯",line:"機材が止まったら何千人が困る。紙一枚で現場を止めるつもりですか。"},
  accounts:{speaker:"仲村 澪",line:"承認を疑うのはいい。でも、発注を止めた責任まで私一人に負わせないでください。"},
  confrontation:{speaker:"島袋 颯",line:"承認前に『無断発注』と言いふらしたんですか？ それなら法務を通してください。"},
  trace:{speaker:"情報管理室",line:"承認IDと発注番号を紐づけるには、変更前の台帳か正式な資料請求が必要です。"},
  policy:{speaker:"金城 玲子",line:"私の名前を挙げるなら、代理権限がどこに定められているかも調べてください。"},
  verdict:{speaker:"監査室",line:"報告の時間です。事実、根拠、不明点を区別して判断してください。"},
  finished:{speaker:"監査記録",line:"監査結果が記録されました。"}
 });
 const options=Object.freeze({
  intro:[
   {id:"site",label:"現場主任・島袋に話を聞く",hint:"切迫した現場事情を先に聞く"},
   {id:"accounts",label:"経理担当・仲村を保護して聞く",hint:"書類と担当者の状況を先に確かめる"},
   {id:"confrontation",label:"承認前に無断発注を告発する",hint:"緊急対応だが、人間関係を損なう危険"}
  ],
  site:[
   {id:"respect",label:"現場の事情を聞いて発注番号を確認",hint:"相手を責めず、調査可能な情報を集める"},
   {id:"pressure",label:"『隠しているのでは』と責める",hint:"現場からの協力が失われるかもしれない"}
  ],
  accounts:[
   {id:"protect",label:"責任追及を急がないと約束して原本を照合",hint:"仲村との信頼を優先"},
   {id:"demand",label:"関係者の名前を出すよう要求",hint:"圧迫すれば口を閉ざす可能性"}
  ],
  confrontation:[
   {id:"withdraw",label:"告発を撤回し、正式調査に切り替える",hint:"関係修復には時間がかかる"},
   {id:"rush_report",label:"証拠を確認せずそのまま報告する",hint:"即時報告だが根拠は不足"}
  ],
  trace:[
   {id:"trace_id",label:"電子承認ID EVT-044の署名ログを照合",hint:"原票を持っている場合のみ利用可"},
   {id:"formal_copy",label:"正式な台帳とログを文書請求",hint:"時間がかかり関係者の協力が弱まる"},
   {id:"skip_trace",label:"時刻照合を省いて結論へ進む",hint:"客観的な時系列が不足する"}
  ],
  policy:[
   {id:"verify_rule",label:"金城の代理権限と電子署名を検証",hint:"規程と承認IDを照合"},
   {id:"trust_word",label:"金城の口頭説明だけで済ませる",hint:"証言だけでは権限の証拠にならない"}
  ],
  verdict:[
   {id:"clear",label:"問題なしと報告する",hint:"正当な承認が確認できたと判断"},
   {id:"review",label:"再調査に付す",hint:"不十分な証拠なら結論を保留する"},
   {id:"escalate",label:"無断発注として告発する",hint:"重大処分につながるため裏付けが必要"}
  ],
  finished:[]
 });
 const initial=()=>({version:VERSION,caseId:ID,actions:[]});
 const effects=(prev,action)=>{
  const s={stage:prev.stage,documents:[...prev.documents],staff:{...prev.staff},pressure:prev.pressure,minutes:prev.minutes,events:[...prev.events],ending:prev.ending};
  const get=id=>{if(!s.documents.includes(id))s.documents.push(id)};
  const event=(speaker,text)=>s.events.push({speaker,text});
  switch(action){
   case"site":s.stage="site";event("島袋","今日の設営を止めれば公演が危うい。紙だけ見て判断しないでくれ。");break;
   case"accounts":s.stage="accounts";event("仲村","書類はここにあります。でも私が承認したわけではありません。");break;
   case"confrontation":s.stage="confrontation";s.pressure+=2;s.staff.shimabukuro-=2;s.staff.nakamura-=1;event("島袋","証拠もなく無断発注と決めつけたんですか？ 今後は正式窓口へ。");break;
   case"respect":s.stage="accounts";s.staff.shimabukuro+=1;get("sheet");event("島袋","発注番号はPO-044だ。口頭承認の話をしたのは私だが、電子申請もあったはず。");break;
   case"pressure":s.stage="accounts";s.staff.shimabukuro-=2;s.pressure+=1;event("島袋","あなたにはもう話さない。経理か法務に聞いてくれ。");break;
   case"protect":s.stage="trace";s.staff.nakamura+=2;get("sheet");event("仲村","原本の発注番号PO-044を確認しました。台帳にEVT-044が紐づいています。");break;
   case"demand":s.stage="trace";s.staff.nakamura-=2;s.pressure+=1;event("仲村","名前だけ出して責任を押し付けるなら、資料は正式な請求でお願いします。");break;
   case"withdraw":s.stage="trace";s.staff.nakamura-=1;s.minutes-=1;event("監査室","告発を取り下げました。閲覧制限があるため、正式な申請が必要です。");break;
   case"rush_report":s.stage="verdict";s.minutes-=1;event("監査室","原票と承認権限の確認がないまま報告書を開きました。");break;
   case"trace_id":if(!s.documents.includes("sheet"))throw Error("原票の発注番号が必要です。");get("system");s.stage="policy";s.minutes-=2;event("情報管理室","EVT-044は正式発注の23分前。署名済みログに後付け変更はありません。");break;
   case"formal_copy":get("sheet");get("system");s.stage="policy";s.minutes-=4;s.pressure+=1;event("情報管理室","正式な文書請求に応じて台帳と署名ログを開示します。ただし現場との調整が必要でした。");break;
   case"skip_trace":s.stage="verdict";event("監査室","承認の存在はうわさの段階です。時系列は検証していません。");break;
   case"verify_rule":get("policy");s.stage="verdict";s.minutes-=1;event("金城","私は社内規程3条に基づき、EVT-044を発注前に電子署名しました。規程も残っています。");break;
   case"trust_word":s.stage="verdict";event("金城","そうです、承認しました。ただし私の話だけで報告するのは監査ではありません。");break;
   case"clear":{
    s.stage="finished";const proven=["sheet","system","policy"].every(id=>s.documents.includes(id));
    if(proven){s.ending="substantiated";event("監査官","紙は空白。しかし発注番号・23分前の署名・代理権限が一致する。正規承認を確認した。");}
    else{s.ending="unsubstantiated";event("金城","結論はたまたま正しくても、根拠がなければ監査報告とは言えません。");}
    break;
   }
   case"review":s.stage="finished";s.ending="pending";event("仲村","確認を続けるんですね。明日の設営の影響も記録しておいてください。");break;
   case"escalate":s.stage="finished";s.ending="false_accusation";s.staff.shimabukuro-=2;s.pressure+=2;event("島袋","電子承認があるのに、無断発注だと断定したんですね。記録を訂正してください。");break;
   default:throw Error("未登録の選択肢です。");
  }
  if(s.minutes<0)throw Error("残り時間が不足しています。");
  return s;
 };
 function replay(raw){
  if(!raw||raw.version!==VERSION||raw.caseId!==ID||!Array.isArray(raw.actions)||raw.actions.length>8)throw Error("分岐セーブ形式が不正です。");
  let s={stage:"intro",documents:[],staff:{nakamura:0,shimabukuro:0},pressure:0,minutes:10,events:[],ending:null};
  for(const a of raw.actions){
   if(typeof a!=="string"||!available(s).some(o=>o.id===a))throw Error("進行順序と選択肢が一致しません。");
   s=effects(s,a);
  }
  return s;
 }
 function available(s){return options[s.stage].filter(o=>{
   if(o.id==="trace_id"&&!s.documents.includes("sheet"))return false;
   if(o.id==="formal_copy"&&s.minutes<4)return false;
   return true;
 });}
 function view(raw){
  const p=replay(raw),optionsHere=available(p);
  const access=p.documents.map(id=>documents[id]);
  const ending=p.ending;
  const next=ending===null?"未確定":
    ending==="substantiated"?(p.staff.nakamura>0?"経理から次の案件につながる資料提供の申し出が届く。":"承認は解決したが、経理担当の協力はまだ戻らない。"):
    ending==="pending"?"発注は一時保留。翌朝の設営判断と追加調査が必要になる。":
    ending==="false_accusation"?"現場から訂正要請。監査室の権限と信用が問われる。":
    "判断は偶然正しかったが、監査品質への疑義が残る。";
  return {stage:p.stage,speaker:lines[p.stage].speaker,line:lines[p.stage].line,actions:optionsHere,people,
   documents:access,history:p.events,minutes:p.minutes,staff:p.staff,pressure:p.pressure,ending,
   epilogue:next,proven:["sheet","system","policy"].every(id=>p.documents.includes(id))};
 }
 function choose(raw,id){const p=replay(raw);if(!available(p).some(o=>o.id===id))throw Error("現在は選べない行動です。");const next={version:VERSION,caseId:ID,actions:[...raw.actions,id]};replay(next);return next;}
 return Object.freeze({VERSION,ID,people,documents,initial,replay,view,choose});
});
