# 深夜監査室 有料版 — 24案件統合・最終QA・Store販売引継ぎ

日付：2026-10-24
対象：`shihuiarenjinba-png/Night-Office-Auditor-2`
専用作業ブランチ：`work/paid-24case-integration-20261024`
コードQA基準SHA：`1eb79a0cf8813dc430fa63da8a517af5e6fa368f`
**低価格版・main・release・Partner Center未変更。**

## 1. 今回実装した24案件本編

- 本編エントリ `index.html`。24の架空案件、72点の固定原始資料、24個の事件固有の解明問い。
- 5タブ（案件／証拠・資料／監査報告／結果／記録・セーブ）。暗色と資料風のゲームUIを維持。
- 各事件で最大2種類の原始資料を調べ、資料IDを**自分で指定**して、固有の3択で報告する。報告を決定するまで当該事件の正答や資料照合結果を表示しない。
- 断定する報告は2資料の選択が必要。資料不足の場合は「再調査」を選べる。すべての案件で2資料以内に正当な根拠が確保できることを機械検証。
- 24人分の架空の聞取り台詞と、協力を求める／矛盾を厳しく尋ねるという二つの応対を実装。既往の聞取り方針で後半の証言対応・監査室の締めの台詞が変化。真相自体は選択で改変しない。
- セーブ：従来の24件本編スキーマv3を維持、推理メモと会話の選択は別キーに保存。旧セーブの破壊的変換なし。通常のセーブ出力にはメモ・会話の記録も含め、従来のv3単体ファイルの読込みにも対応。
- 結果の答え合わせは**報告後のみ**。次の事件に進むと前事件の結果画面はクリアされる。
- 本編HTMLに「GitHub Actions」「QA_UNSIGNED」「MSIX」「Store Identity」「WACK」「開発工程」「残工程」等を表示しない。ステータス表示はゲーム内の案件数・評価・信用・残り時間のみ。
- 前に作成した独立3事件試作 `deduction-campaign.html` は残すが、有料版本編の標準起動先は `index.html`。3案件試作は24件本編の完成を証明する代わりではない。

## 2. 実行済み検証

- GitHub Actions **全ソース/回帰 63/63 PASS**： https://github.com/shihuiarenjinba-png/Night-Office-Auditor-2/actions/runs/40102119262
- 同Runブラウザ自動操作：全24案件を最初から最後まで操作、毎件の聞取り選択、原始資料2点の開封、参照資料をチェック、3択で判定、正式報告、12件目でのセーブ再開、24件目の終了、1024pxの横はみ出しを確認。PASS。
- ブラウザ実操作画面・ログ： https://github.com/shihuiarenjinba-png/Night-Office-Auditor-2/actions/runs/40102119262/artifacts/12562848786
- **Windows x64 Electron 44.9.3 署名不要QA版**で、実際に生成した EXE をWindows CIホストで起動。5タブ、24案件起動画面、証拠開封1回、1280×720および1024×768ピクセル撮影 PASS。
- WindowsランタイムQA： https://github.com/shihuiarenjinba-png/Night-Office-Auditor-2/actions/runs/40102119214
- Windows QA証跡： https://github.com/shihuiarenjinba-png/Night-Office-Auditor-2/actions/runs/40102119214/artifacts/12563382009
- Windows x64未署名プレビューZIP： https://github.com/shihuiarenjinba-png/Night-Office-Auditor-2/actions/runs/40102119214/artifacts/12563710289
- そのZIPのSHA-256：`BC10152E6D181F44A0136ACE42538F7F86E1B01B9A05E8C2E042B9A851E05355`。
- Windows CI PASSは**ユーザー実機でのインストール・全24件操作の保証ではない**。ブラウザ全24件操作とWindows初期画面の操作は別々に確認。

## 3. 販売前に必須の未完了条件（HOLD）

本体の動作確認とMicrosoft Storeに公開できる状態は異なる。

1. **Partner Centerで有料版の独立したIdentity / Store ID / Package Family Name / Store Versionの正式値確認**。Repo READMEでは未割当。低価格版 `NightOfficeAuditor` と共用しない。推測・自動生成で確定しない。
2. **有料版Store用MSIX生成・署名・署名検証**。現状のQA ZIPはMSIXではなく、Identityも証明書も含まない。
3. WACK、署名済みMSIXのインストール・全機能・セーブ・通信/オフライン・アンインストール、1024×768と1280×720でのWindows購入者環境QA。必要なStore画像規格は認定前に確認。
4. 初めて遊ぶ購入者候補のユーザーテストによる「理由が分かるか」「推理が運ゲーでないか」「続きを遊びたいか」の評価。CI PASSだけで販売人気を保証しない。
5. Partner Centerパッケージ登録・認定提出・公開には別途明示的な確認が必要。**今回実施しない**。

## 4. コード担当の後続指示

- このブランチとQA基準SHAを入力として扱い、main/releaseに直接反映しない。
- `index.html` の証拠・3択・人物会話が動作することをWindows実機で確認する。ブラウザ内の見た目だけでなくアプリ単独起動とセーブを確認。
- 商品Identityは必ずPartner Centerの有料版の商品画面と照合し、未判明ならHOLD。
- Identity等の確認後、署名可能なMSIX候補（その場で版番号を確認）→Windows実機導入→WACK→提出前の最終合意という順序で進める。
- UIには技術的な進捗表・MSIX化・開発工程・内部QAを露出させない。プレイヤーには事件・人物・証拠・推理・報告だけを見せる。
