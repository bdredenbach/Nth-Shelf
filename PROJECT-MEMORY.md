# Nth Shelf project memory

Updated 5 October 2026. This file records accepted project decisions for future chats; read it with the latest handoff and README before making detector changes.

Latest local implementation checkpoint: [Test93 / 2.79.93](HANDOFF-2.79.93.md). The previous scratch workspace survived with unpublished Test92 commits. Its two gutter-split gains are retained, and Test93 repairs one further single frame by assigning the entire source-enclosed “We Sandstormers…” balloon to Apocalypse issue 1 reader 16's walking-away scene. Complete local coverage is 168 / 385 (150 singles + nine pairs), 217 remaining; raw selections are 187. Only two owner contours change from Test92. 88 behavioral suites, 312-page fresh-source supplement comparisons and the changed target's complete detector replay pass. Browser/backup execution, Android CI and phone acceptance are pending. Latest remote is Test91 `7d7d5f3`; no Test92/Test93 APK exists. The prior automatic approval review rejected publication twice and requires explicit push permission in this thread. Finish the tested local checkpoint before requesting that permission; after permission, complete CI/APK verification and delivery. Do not treat clipped fragments, merged proposals or duplicate accepted rectangles as new gains.

The current pass's broader seed-radius, paper-threshold, vertical/smaller-seam and narrow-rim experiments produced no further qualifying frames and were excluded. The remaining queue is 197 frames without a qualifying selection plus 20 damaged frames. Source/Reader review credits the new balloon repair; original pixels outside its body and the complete source union are retained. Captured runtime geometry stays page/book independent, and private artwork stays outside git/CI. Keep the frozen Test90 audit below for comparisons.

## Accepted pop-out criterion

Brad explicitly accepted connected scenes as an ongoing use case after reviewing the Apocalypse audit. A successful output may be:

- One complete narrative frame.
- Exactly two complete adjacent frames that continue the same immediate action, conversation or spatial scene, together in one pop-out.

Count the second case as one accepted group and two covered frames. A repeated character alone does not prove continuity. A meaningful time/location jump, an unrelated scene, a composite of more than two frames, or missing owned artwork/dialogue fails. Prefer single frames where the detector already provides them and preserve all previously accepted regression behavior. Manual scene review is required; do not label geometric candidates as semantically accepted without review.

## Authoritative Test90 baseline

All 91 Apocalypse source images and 185 current selections were replayed and inspected. The manual inventory is 385 narrative frames, excluding eight covers: 133 complete singles plus 10 complete connected pairs cover 153 frames and leave 232. Singles alone leave 252. Of the 232 remaining, 199 have no qualifying selection and 33 occur in damaged crops. Prior 360+/186-covered estimates are superseded. Freeform montage counts are explicit manual judgments.

The broad frame-selection corpus and the usable-crop audit measure different things. Preserve accepted frame ownership; do not freeze known crop defects merely to retain identical geometry. Keep raw selections, single successes, pair successes, damaged frames and remaining frames separate in every future comparison.

## Working process

Use the findings to recover more complete frames and connected scenes. Start with interior/exterior mask ownership and speech crossings, then larger composites, irregular/colored gutters, and open/landscape scenes. Use reusable pixel evidence, never book/page/name/fingerprint crop lookups. Private comic artwork is kept outside git and CI. Re-run retained tests and Wolverine/Magneto/manga comparisons when changing shared detection or crop behavior. Build and verify an isolated APK for a concrete detector checkpoint; user phone confirmation remains distinct from local replay and CI.

Branch: `Test_Branch`, repository: `bdredenbach/Nth-Shelf`. Frozen audited detector: Test90 / 2.79.90, commit `25fb96b5ee35a7d62ca9d5fd44fdf584995075b0`.

See [audit handoff](HANDOFF-APOCALYPSE-AUDIT.md), [page findings](docs/apocalypse-test90-audit.json), and the latest versioned handoff for current implementation/build status.
