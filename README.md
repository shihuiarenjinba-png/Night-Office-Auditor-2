# Night Office Auditor — Expanded / Paid Edition

This repository is reserved for the expanded paid edition of **Night Office Auditor / 深夜監査室**.

## Product split

- **Low-price edition:** `shihuiarenjinba-png/NightOfficeAuditor`
  - keep the current core game and 12-case structure
  - prioritize bug fixes, clear controls, game-like UI, Windows QA, and Store packaging
  - do not expand story volume merely to justify a higher price
- **Expanded paid edition:** this repository
  - future story expansion
  - additional cases and longer campaign structure
  - recurring signature lines / character voice
  - stronger narrative progression and replay value

## Current status

The paid edition has a 24-case prototype and a separate, playable three-case deduction vertical slice. This remains a work in progress and is not Store-ready.

## Safety rule

Do not silently copy Store identity/version metadata from the low-price edition. The paid edition must receive its own confirmed Store packaging decision before submission.

## Expanded prototype implemented

Work branch: `work/paid-story-ui-20261024`

- 24 fictional cases across four chapters
- each case has a fictional Okinawa-area location, story hook, and auditor note
- chapter-specific signature lines / 決め台詞
- five real screens: Case / Evidence / Report / Result / Save
- synthesized local tab-switch sound (no downloaded audio asset)
- isolated save key and save schema v2; it does not overwrite the low-price edition save
- offline CSP: no network calls from the game renderer

This is a gameplay/UI prototype, not a Store submission package. Store identity, version and packaging remain intentionally unassigned for the expanded edition.


## 2026-10-24 — Current three-case deduction QA prototype (NOT Store-ready)

**Current work branch**: `work/three-case-release-polish-20261024`

- **Playable prototype**: [`deduction-campaign.html`](deduction-campaign.html). Three substantial proof-driven cases: 01, 04, and 05.
- **Earlier paid-edition core**: [`index.html`](index.html) retains the original 24 fictional case framework. The three-case interactive prototype has **not** yet been integrated into all 24.
- **Rules**: eight fixed evidence-card titles per case; six may be opened; four properly chosen documents suffice for basic proof through two alternate pairs per question. The player identifies the question, assigns evidence, and chooses an answer before a final report.
- **Spoilers**: source observations are exposed only when a card is opened. Correct answers, document pair solutions, and final conclusions are not shown by the browser UI until report submission.
- **Narrative**: character interviews produce persistent relationship consequences and return-dialogue callbacks; case 04 and case 05 can be played in either order after case 01.
- **Failure-safe progression**: incomplete investigations can report `追加調査`. Existing 24-case saves are untouched. This trial uses the dedicated `night-office-three-night-deduction:v1` storage key.
- **GitHub QA**: `.github/workflows/three-case-deduction-qa.yml` and `.github/workflows/three-case-browser.yml`.
- **Windows QA packaging attempt**: `.github/workflows/windows-paid-preview-qa.yml` stages an isolated Electron preview named `NightOfficePaid_QA_UNSIGNED`. It uses **no Store Identity, no MSIX manifest, no signature and no certificate**, and is not a saleable product. Its runtime test and ZIP artifact must pass independently before Windows operation is claimed.

### Release gating
This paid edition is **HOLD / NOT READY FOR STORE** until all the following are completed:
1. Introduce the player-controlled evidence/deduction interface into the remaining planned cases and complete coherent character arcs (not merely 24 prompts).
2. First-time user playtesting, accessibility, audio behavior, 1024×768 and 1280×720 checks on a real Windows PC.
3. Confirm distinct Partner Center Identity, PFN, Store version, display name, and appropriate signed x64 MSIX candidate. Do not copy metadata from the low-price `NightOfficeAuditor`.
4. Signed Windows install/run QA, WACK, screenshot sizing and Partner Center certification process.
5. Written explicit approval before submission and publication.

See `docs/THREE_CASE_DEDUCTION_PROGRESS_JA.md` and `docs/DEDUCTION_GAME_REFERENCE_JA.md` for context and design rationale.

**No changes were made directly to `main` or `release`.**
