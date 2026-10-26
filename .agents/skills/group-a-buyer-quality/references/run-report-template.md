# Group A 購入者品質監査 — 1回分の実行記録テンプレート

> 報告日時: YYYY-MM-DD HH:mm JST ／ 検証担当: ___
> 監査の定期実行自体が成功したか: PASS / BLOCKED / NOT_TESTED
> GitHubアクセス: PASS / BLOCKED
> 注意: このテンプレートは起動スケジュールを設定しない。複数タスクで1時間未満の実効周期を実現しない。

## A. 全9製品の観測一覧

| 製品 | Work branch最新HEAD（40桁） | 最新Windows Run URL | テスト（実行/成功数） | MSIX Artifact・同一HEAD | UI/ゲーム検証 | 販売判定 |
| --- | --- | --- | --- | --- | --- | --- |
| Small Business Simulator | | | | | | NOT_TESTED |
| Finance Simulation | | | | | | NOT_TESTED |
| Night Office Auditor 12案件 | | | | | | NOT_TESTED |
| Used Item Shop Simulator | | | | | | NOT_TESTED |
| Factory Inspection Simulator | | | | | | NOT_TESTED |
| Handover Room | | | | | | NOT_TESTED |
| EKIDEN MANAGER | | | | | | NOT_TESTED |
| LUCK LAB | | | | | | NOT_TESTED |
| 深夜監査室 24案件有料版 | | | | | | NOT_TESTED |

## B. 購入者視点の具体的評価（証拠を書けないものは NOT_TESTED）
監査対象製品: `repo / branch / exact HEAD`

| 項目 | PASS / HOLD / BLOCKED / NOT_TESTED | 証拠 URL・スクリーンショット・再現手順 |
| --- | --- | --- |
| 最初の5分：開始・目的・次の手順 | NOT_TESTED | |
| 30分：典型操作・表示・失敗時復帰 | NOT_TESTED | |
| 完走：エンディング/達成、再プレイの動機 | NOT_TESTED | |
| セーブ：成功・拒否・破損・更新継続 | NOT_TESTED | |
| UI：1024×768・1280×720、DPI、キーボード | NOT_TESTED | |
| JP/EN・年齢区分・配布権・商品説明 | NOT_TESTED | |
| お金を払う価値：コア機能・奥行き・反復性 | NOT_TESTED | |
| MSIX：同一ソースHEADのWindows CI成果物 | NOT_TESTED | |
| MSIX Manifest、SHA256、Identity/Version | NOT_TESTED | |

**購入者だったら買うか：** 未判定 / 買わない（理由） / 試す価値あり（根拠） / 第三者も合格（テストと根拠）。
これだけでStore提出PASSにしない。第三者試遊未実施なら必ず明記。

## C. 未達・改善優先順位
- P0: 症状／再現条件／失われるデータ・進行／原因と修正方針／Issue URL
- P1: 機能・ゲーム性・初見操作の欠点／根拠／改善案
- P2: 視認性・演出・ローカライズ／根拠／改善案
- 今回選んだ最大3項目と選定理由:
  1.
  2.
  3.

## D. 今回のGitHub変更（変更した場合のみ）
- Repo / branch / 変更前SHA / 変更後SHA:
- 変更ファイル・差分の理由:
- main/release untouched: YES/NO
- テストRun URL（失敗ステップ含む）・PASS件数:
- 旧セーブ/Store Identityに与えた影響:
- Windows UIのスクリーンショット証跡と画面寸法:
- 新HEADからMSIX再生成実施: YES/NO/NOT_TESTED
- Artifact名/ID/有効期限/URL:
- Manifest Name / Publisher / Version / Architecture:
- MSIXとMSIXUPLOADのSHA256:
- 生成したMSIXを実機にインストールして検証したか: NO（事実に応じて記載）
- 署名/WACK/Store提出: 未実施（コード担当の別ゲート）

## E. 判定・次の監査
- 今回の検証で解消できた問題:
- 解消できなかった問題と理由:
- ユーザーに新たに必要な正式Identity/バージョン等: 不要 / 必要（具体的に、推測しない）
- **販売合格を宣言できる製品:** 証拠付きのみ列挙、なければ「なし」
- **HOLDの製品:** 理由と優先順位
- **最終引継ぎ:** 全9製品の実務ゲートを満たすまで HOLD

## 固定ルール
自動Store公開・無断マージをしない。ソースHEADとMSIX成果物が異なる場合は生成済みでも現在版の合格としない。
既存のGitHub Issue #1: https://github.com/shihuiarenjinba-png/Night-Office-Auditor-2/issues/1
