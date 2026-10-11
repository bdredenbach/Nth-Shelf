# Test159: city and rounded inset pop-outs — review pending

Resume from Test159 / 2.79.159 on `Test_Branch`. Base is published Test158 commit `7a2146ef8645022c3a22dc1fcf7bbd964bb00f1b`. This checkpoint recovers the unfinished city successor, validates it and moves first-use source admission into page preparation. Read `TEST159-VALIDATION.json` and the Test159 QA README.

## Current review gate

Stop here for Brad's positive visual review. Reader page 8 has two separate single-frame previews: S1 city/palace overview, and S3 rounded feline inset with its caption. S2 throne remains accepted and its native PNG is byte-for-byte identical to Test158. The two new children replace their common broad host atomically but are independently selectable; they are not a grouped pair. All visible city captions and contact paint stay with the city; the inset owns its visible rim and its caption. No runtime title, page number, text, hash or private-map lookup chooses pixels.

Accepted coverage remains **94/105 originals, 11 remaining**, 60 singles and 17 immediate-continuity pairs. If Brad approves both previews, credit two originals: **96/105, nine remaining**, 62 singles, 17 pairs, 79 qualifying selections and 79 rendered outputs. Approval of only one credits only that original; repair any rejected crop and show a fresh preview before continuing.

The remaining queue after both approvals is Reader6 F2 baby discovery, F4 continuous middle crowd/Baal foreground, F5 sacrifice discussion, F6 Baal with baby; Reader20 F1 upper corpse, F2 circular general reaction, F3 narrow standing figure, F4 red warrior/sword inset, F5 central ambush. Reader20's rejected broad host stays retired. Default is one original per selection; at most two adjacent originals may share a selection only for immediate action/dialogue or continuous composition.

## Changes and speed

Installed native pixel evidence now partitions the curved host into complete complementary singles while preserving its accepted retained owner. Restored/copied/changed evidence retains the strict replay path. The recovered 96/100/103 analysis reuse remains bounded and source checked. `goTo` clears frame focus before navigation, including slider navigation; ordinary same-page non-slider no-ops keep their behavior.

First-use city admission previously cost about 900ms in the native Reader harness; adding the unchanged 680ms animation produced a **1,585ms** estimate. Source admission and retained-display validation now finish during `loadPanelsForCurrentPage`, before preparation settles. This added about **700ms** to preparation. Ready-page estimates including the animation are **686ms city, 698ms throne, 681ms inset**. All three crops are byte-identical before/after this scheduling change. Source, owner, page, token and navigation checks remain active on taps.

These are native-canvas/minimal-DOM estimates, not browser compositor or phone measurements. Fresh page8 detection still took about **27.3 seconds**. Early taps, cold loading, other frames and phone timing remain performance work; do not claim that the full one-second requirement is globally satisfied.

## Executed checks

All 24 issue1 fresh detector graphs passed comparison with the preserved Test157/158 baseline: 23 exact and only the intended page8 split; the throne descriptor stayed exact. All three page8 crops were rendered through the installed Reader. The throne matches the authenticated Test158 PNG exactly. Passed: 25 shared-source controls, 55 navigation controls per arm, five actual-load preparation controls, twelve fresh-reuse jobs, 147 indexed-script syntax checks, shell/version contract and diff whitespace check. Current repository runtime bytes match the executed candidate.

This is a review checkpoint. The full 263-command retained rerun, all-owner actual-browser audit and phone acceptance have not been rerun here. Earlier receipts remain historical evidence, not new executions. Animated previews replay the actual Reader canvases and its transform; they are not browser or phone recordings.

## Recovery and next steps

The review deliverables are `Nth-Shelf-Test159-City-Pop.gif`, `Nth-Shelf-Test159-Feline-Pop.gif`, `Nth-Shelf-Test159.patch`, `Nth-Shelf-Test159-Handoff.md` and `Nth-Shelf-Test159-Review-Evidence.zip`. The private evidence bundle contains exact target detector proofs, native crops, validation reports and replay helpers. Keep comic artwork, maps, previews and private evidence outside Git/CI.

After positive review, continue the remaining originals using the same cadence: patch plus handoff for every working crop, show its pop-out preview, wait for approval, and fix slow taps. No APK, Gradle invocation, Android workflow dispatch or automatic mode was performed. Build an APK only after all issue1 originals work with the detector; Brad will run the regression and provide screenshots. Then broaden/tighten with another comic, then work on automatic frame crop mode.
