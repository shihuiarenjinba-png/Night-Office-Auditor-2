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

Planning shell only. No paid-edition story content has been added yet. Do not treat this repository as Store-ready until the low-price edition UI and error fixes are stabilized and a deliberate content plan is approved.

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
