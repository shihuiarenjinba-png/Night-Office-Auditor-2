# 深夜監査室 有料版 — 実装・QA・販売工程の引継ぎ（2026-10-24）

## 確認済みの出典
- Repo: `shihuiarenjinba-png/Night-Office-Auditor-2`
- Branch: `work/three-case-release-polish-20261024` （main/release未変更）
- Windows QA source commit: `0357ed3602767a0776053697872f606f3bd3e0ba`
- Windows packager: `@electron/packager@20.3.0`, Electron `44.9.3`, Windows x64.
- ソース回帰: 58/58 PASS。例: https://github.com/shihuiarenjinba-png/Night-Office-Auditor-2/actions/runs/40096137780
- Chromium通しプレイ: PASS（CASE 01→05→04、解答・提出、セーブ再開、証拠不足の追加調査、1024px横スクロール無し）。https://github.com/shihuiarenjinba-png/Night-Office-Auditor-2/actions/runs/40095835045
- **Windows Electron runtime QA: PASS**。https://github.com/shihuiarenjinba-png/Night-Office-Auditor-2/actions/runs/40096137838
  - 実行したWindowsパッケージ内のEXEを起動、初期の3事件ファイル・8枚カード・2疑問の描画を確認。
  - 1280×720ピクセル画面キャプチャPASS。聞取りボタン操作後に全カードが操作可能になるのを確認。
  - 1024×768ピクセル画面キャプチャPASS。起動後の例外なし、QAプロセスexit 0。
- Windows用未署名ポータブルQA ZIP: https://github.com/shihuiarenjinba-png/Night-Office-Auditor-2/actions/runs/40096137838/artifacts/12561107007
- WindowsランタイムQA証跡・PNG・ハッシュ: https://github.com/shihuiarenjinba-png/Night-Office-Auditor-2/actions/runs/40096137838/artifacts/12559874951
- **QA_UNSIGNED ZIP SHA256**: `FFB65AC5E87705D35D47755281F86F5C9AD11CDAB854F7955D272377D1DB2011`
- ブラウザ操作版: `deduction-campaign.html`。独立セーブキー: `night-office-three-night-deduction:v1`。
- 最新の高品質3事件テスト以外の既存ファイル（`index.html`）には24事件の以前の枠組みがあるが、**新カードUIはそこへ全面反映していない**。

## このブランチで完了した仕事
1. 各事件8資料/開封6枠、**4枚で基本的な2問に答えられる**よう証拠ペアの別ルートを確保。必須6/6による理不尽な詰みを解消。
2. 「既知の事実」「未解明の疑問」「資料の表題」「自分が提出した根拠2点と3択」の順番を画面に提示。資料の裏に正解や犯人を書かない。
3. CASE01の報告後、CASE04とCASE05を任意の順でプレイ。証拠不足時は追加調査へ移行。
4. 監査室の人物と会話が続き、前の事件での聞取り方針が次の会話とチーム関係に影響。資料が示す客観的事実は選択で変えない。
5. 端末T-7など、開いていない証拠の固有情報を最終報告で先出ししない。
6. セーブ再開と不正な操作ログの拒否、全章報告後の横断総括を自動テスト。
7. Windows x64 QAプレビューのオフラインElectron実行、ソース固定、初期操作・実画面キャプチャ・SHA-256記録を実施。

## 重要：完了していないこと / 提出禁止
- **有料版24案件の新カード方式への完全統合は未実施**。3案件の縦切りだけで「24事件すべて完成」とは言わない。
- 役者の演出、全事件の人物分岐、分岐選択と長期の伏線回収、人気の見込みのユーザーテストは未実施。
- Windows QA用EXEは **UNSIGNED QA PREVIEW**。MSIXではない。販売用、Store認定用、署名済みとは表示しない。
- このQAはCI Windowsホストでのアプリ起動と1回の聞取り操作。**購入者のWindows実機で全事件が動作したとの保証ではない**。
- Partner Centerの**有料版独立Store Identity / PFN / Store Version**は未確定。低価格版の値を転用しない。
- MSIX生成、署名、WACK、インストール済みMSIX QA、Partner Center登録/認定/公開は**HOLD**。
- 残りの品質検証：全24事件の証拠台帳と別解のレビュー、初見プレイヤーでの理解・興味・所要時間、キャラクター展開、障害試験、実機1024×768/1280×720のWindows QA。
- `main`/`release`へ直接コミットしない。既存ファイルを変更する場合も専用作業ブランチとActionsで検証する。

## コード担当への具体的な次の作業
1. `work/three-case-release-polish-20261024` の実装を固定し、まず実際にユーザーに3事件を通しで遊んでもらう。提示するものはブラウザHTMLプレビューとWindows QA証跡。
2. 未完成の残り21事件を、同様の「現物記録→2つ以上の疑問→複数の立証経路→人物関係→横断の伏線」基準で拡張する。事件を水増ししない。
3. 紙・電子ログ・本人認証を分離し、犯人断定の証明責任を守る。推測で動機や共犯を創作しない。
4. Windows版への統合と全画面/各タブ/セーブ/クラッシュ復元/タブ効果音/日英の表示確認を実施する。
5. 有料版Store Identityと独立したMSIX Metadataが公式値として確定した後、署名可能なMSIX候補を生成。証明書の署名、WACK、MSIXインストールQAがPASSするまでStore提出しない。

## 実装リポジトリ上の参照
- `src/deduction-campaign.js`: 固定証拠・分岐・監査真相のエンジン
- `src/deduction-campaign-ui.js`: 画面・音・ブラウザ保存
- `deduction-campaign.html`, `deduction-campaign.css`: 操作画面
- `tests/deduction-campaign.test.cjs`, `tests/three-case-browser-smoke.cjs`
- `desktop-qa/main.cjs`: Windowsプレビュー専用の制限付きElectronメイン
- `.github/workflows/windows-paid-preview-qa.yml`: 未署名Windowsパッケージ生成・実起動・画面検証
- `docs/DEDUCTION_GAME_REFERENCE_JA.md`: 参考作品の設計思想
