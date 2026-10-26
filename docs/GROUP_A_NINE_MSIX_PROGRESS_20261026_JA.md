# グループA｜9ゲーム MSIX生成・GitHub完了状況（中間台帳）
更新：2026-10-26。全件GitHub公開後の検証。

**本台帳は中間報告であり、全9製品の最終引継ぎを許可する文書ではない。**
GitHub上でMSIX候補生成・マニフェスト検証・SHA-256を確認した製品は **7/9**。
すべて候補は署名なしの内部QA用であり、Windows実機インストール・署名・WACK・Store認定・提出が完了したという意味ではない。
ZIPダウンロード不要。GitHub Actions artifactで保存する。

## 1. 実際にGitHub Windows Runnerで候補を生成した7製品
以下の7製品は指定commitと同一runのログでManifest、Source SHA、MSIX/MSIXUPLOAD SHA-256を確認。
| 製品/Repo | ソースコミット | MSIX Run / Artifact |
| --- | --- | --- |
| Small Business Simulator / `SmallBusinessSimulator` | `855c7275597ce389846b4d742fd45784cfe1e1ef` | [Run 40257124500](https://github.com/shihuiarenjinba-png/SmallBusinessSimulator/actions/runs/40257124500) / [Artifact 12623042198](https://github.com/shihuiarenjinba-png/SmallBusinessSimulator/actions/runs/40257124500/artifacts/12623042198) |
| Finance Simulation / `finance-simulation` | `e9bdbd2002d2f83802fa56543cf7e32badf4fcea` | [Run 40257364397](https://github.com/shihuiarenjinba-png/finance-simulation/actions/runs/40257364397) / [Artifact 12623281871](https://github.com/shihuiarenjinba-png/finance-simulation/actions/runs/40257364397/artifacts/12623281871) |
| Night Office Auditor (12案件) / `NightOfficeAuditor` | `03c03d713c7d41242d26ae6de88796b320aa138f` | [Run 40257821361](https://github.com/shihuiarenjinba-png/NightOfficeAuditor/actions/runs/40257821361) / [Artifact 12623332598](https://github.com/shihuiarenjinba-png/NightOfficeAuditor/actions/runs/40257821361/artifacts/12623332598) |
| Used Item Shop Simulator / `UsedItemShopSimulator` | `1319fcc851f4fc89ebcdda4442c46aaee584cbb8` | [Run 40261350149](https://github.com/shihuiarenjinba-png/UsedItemShopSimulator/actions/runs/40261350149) / [Artifact 12626215911](https://github.com/shihuiarenjinba-png/UsedItemShopSimulator/actions/runs/40261350149/artifacts/12626215911) |
| Factory Inspection Simulator / `FactoryInspectionSimulator` | `ad2c7614e277f40c056a6d62b91a26ed4cf90b41` | [Run 40258725468](https://github.com/shihuiarenjinba-png/FactoryInspectionSimulator/actions/runs/40258725468) / [Artifact 12625539959](https://github.com/shihuiarenjinba-png/FactoryInspectionSimulator/actions/runs/40258725468/artifacts/12625539959) |
| Handover Room / `game-new` | `34fb47d12adf2de8735d02eb879e2602f4ee8f20` | [Run 40265828361](https://github.com/shihuiarenjinba-png/game-new/actions/runs/40265828361) / [Artifact 12626497068](https://github.com/shihuiarenjinba-png/game-new/actions/runs/40265828361/artifacts/12626497068) |
| EKIDEN MANAGER / `game-stadium` | `6f0dbb0528ebfb9cb562e570d53b0d82eea1303d` | [Run 40266118805](https://github.com/shihuiarenjinba-png/game-stadium/actions/runs/40266118805) / [Artifact 12626233305](https://github.com/shihuiarenjinba-png/game-stadium/actions/runs/40266118805/artifacts/12626233305) |

## 2. MSIXとMSIXUPLOADの正確なSHA-256（GitHub CI実行ログ）
| 製品 | MSIX SHA-256 | MSIXUPLOAD SHA-256 |
| --- | --- | --- |
| Small Business Simulator | `D082BF88A3FC7E7B337B50C56B716FD51AFF01FE8BEB1E57DCDE4946D510FD45` | `43DD5F97D9CF27BC8E132C900A5497AE9A7F8620C1C20A9AD7A24244FF1E048F` |
| Finance Simulation | `2B83E34F20A62FA38B6CD305D370460C52A7DD8BACD9F7C7C77B0805B218C900` | `A2FA9B79CD110D2170B0F035C656BED40B4F330E466EC9A646D37896D34E9CF2` |
| Night Office Auditor (12案件) | `4EC85084C8C590A10622B0485B99FDB5AF5026294DFD7939C7FC579B1933AB66` | `43194432EF0F1409A5FE318A079E34424D7F76DCFF49A89A19002767ACEE23C7` |
| Used Item Shop Simulator | `ABF09AD853B61742FAC0217F8DE1CC309EAB973A039A5A8C915807D2DD013E75` | `E26F9E42137D0C48A359B54AF51B323DC3EFAC9A20DC4A59EF36497F33AB1BB8` |
| Factory Inspection Simulator | `2A232480A1E307DFC56DB600A773D04370B5FC8B5F99331E2B949F44EBC18319` | `461C397EEE1838527813742DA3F4D578C30DD20BA93DA7CEDDA6E290C5D64E20` |
| Handover Room | `8A6B8EF1BA5180E391F266F3D053A3E660D5D297D110D4AE22DA356E53C6AB4B` | `8457056F76FF8873210DB53B0BA2FEAF55E90D0C11A0CCA2D294954063C6031D` |
| EKIDEN MANAGER | `9F39B9E8CBF004C3853CCC8DABF116EE233B6912B1C58E7FAC60204433F9FCFF` | `87D369487A9F14B52F57739D8C8B552BEBE07A6188DA278EF653EE1CE52A3249` |

## 3. 残り2製品の停止理由
### LUCK LAB (repo `game`)
- HEAD `e2d2c1a3fca30cbf510a2444fcd8e13eba6dc16f`。
- ソース・ブラウザQA [Run 40264981482](https://github.com/shihuiarenjinba-png/game/actions/runs/40264981482) SUCCESS。
- MSIX [Run 40264981441](https://github.com/shihuiarenjinba-png/game/actions/runs/40264981441) は、Store Identity変数が空欄のため **HOLD**（MSIX未生成）。
- 必要なGitHub Repository Actions Variables: `LUCK_STORE_IDENTITY_NAME`, `LUCK_STORE_PUBLISHER`, `LUCK_STORE_PUBLISHER_DISPLAY_NAME`。Partner Center実値・所有者確認に従う。古い資料上のStore ID候補は正式承認の代わりにしない。
- 保護対象の原本66ファイルは今回変更せず、`store-entry.html`の改行正規化検証を修復。現在ソースQA PASS。

### Night Office Auditor 24案件有料版 (repo `Night-Office-Auditor-2`)
- MSIX変換用production Electron entry / Manifest・SKU独立照合 / Hash ledger / Windows CI作成済。 [QA Run 40261196152](https://github.com/shihuiarenjinba-png/Night-Office-Auditor-2/actions/runs/40261196152) SUCCESS。
- 低価格版12案件のIdentity流用禁止。別商品としてのPartner Center実値と所有者確認が未了。
- 必須Actions Variables: `NIGHT_PAID_STORE_ID`, `NIGHT_PAID_IDENTITY_NAME`, `NIGHT_PAID_PUBLISHER`, `NIGHT_PAID_PUBLISHER_DISPLAY_NAME`, `NIGHT_PAID_STORE_DISPLAY_NAME`, `NIGHT_PAID_STORE_VERSION`, `NIGHT_PAID_IDENTITY_OWNER_CONFIRMED=YES`（正式値を所有者が確認した場合のみ）。
- [Run 40261196108](https://github.com/shihuiarenjinba-png/Night-Office-Auditor-2/actions/runs/40261196108): ソースPASS→Identity未登録→HOLD JSON artifact→MSIX build skip。MSIX未生成。
- 変数入力後、新HEADで `.github/workflows/paid-msix-candidate.yml` を再実行し、MSIX生成、Manifest一致、SHA・artifactを確認する。

## 4. 公開後に解消したGitHub基盤不具合
旧Private 5製品ではLinux・Windowsの両方でジョブ0ステップ失敗。Public変更後、5製品すべてでGitHub Actionsジョブ開始を実証。
- Used Item / Factory / Handover / EKIDEN はコード・テスト・MSIXの失敗を修正した後、候補生成とArtifactアップロード成功。
- LUCK LAB はソースQA通過。MSIXはIdentity不足でのみ停止。
- この先もmain/release直接変更や、ストア登録・署名・支払い設定変更は行わない。

## 5. 完全引継ぎ条件
1. 正式Identity確認後に残り2製品でMSIXとSHA・Manifest/正確なGit HEAD・Artifactを確保。
2. 9製品のP0/P1/初見UIの重要エラー未解決がないこと。変更でHEADが進む場合は最新HEADでMSIXを再生成し、古い成果物を最新版と扱わない。
3. 9製品一括の最終引継ぎ書に Run/Job/Artifact/Source SHA/MSIX SHA/Manifest/未実施の正式Store工程を集約。
4. コード担当に移すのは、Windows実機への導入と更新、Store署名/必要な検査、Partner Center照合と価格・画像・審査申請。
5. 現時点で **7/9 内部MSIX候補確認。最終引継ぎ HOLD。**

## 6. 所有者提供のPartner Center画面との照合（2026-10-26）
- **EKIDEN MANAGER**（`game-stadium`）: 提示画像のIdentity Name `OkinawaDesktopTools.EKIDENMANAGER`、Store ID `9NL1HLJRFQ39`、Publisher `CN=46263F21-A700-41DB-8C9B-114C22FB82FC`、Publisher Display Name `Okinawa Desktop Tools` は既存の `store/partner-center-identity.json` と一致。MSIX Run 40266118805 のIdentity Nameとも一致。**このIdentityはLUCK LAB用ではない。**
- **Night Office Auditor**（`NightOfficeAuditor`、12案件版）: 提示画像のIdentity Name `OkinawaDesktopTools.NightOfficeAuditor`、Store ID `9P6SQX67J3R9`、同じPublisherとDisplay Nameは既存の `store/partner-center-identity.json` と一致。MSIX Run 40257821361 と一致。**24案件有料版 `Night-Office-Auditor-2` のIdentityではない。**
- この画像で確認できた2製品はいずれも**7件の既存MSIX生成済み群**に含まれる。残るLUCK LABおよび24案件版の正式な独立Identityは未確認で、MSIX生成HOLDを維持。
- 成功済み7製品のソースHEAD/Artifact対応を壊さないため、生成済み製品のコードやIdentity JSONは変更せず、この中間台帳のみに照合結果を記載。
