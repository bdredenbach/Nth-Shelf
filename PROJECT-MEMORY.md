# Nth Shelf project memory

Updated 5 October 2026. This file records accepted project decisions for future chats; read it with the latest handoff and README before making detector changes.

Current detector checkpoint: [Test95 / 2.79.95](HANDOFF-2.79.95.md). One closed dark-matte owner is completed: Apocalypse issue 2 reader 18 selection1, upper-right water-and-hand frame. All wrist/palm artwork, both balloons and background survive; 4,266 analysis pixels restored. Local complete coverage 171/385 (151 singles + ten pairs), 214 remaining (197 without selections, 17 damaged); raw selections remain 186. SWAK is unchanged; its probes merged neighbors or failed to isolate its boundary and were rejected. Fresh source-raster supplements over Test94 descriptors cover 312 pages; only selection1 changes. Full target detector replay and real Reader review pass. All 92 behavioral suites plus cache/package checks pass locally; Android build status is in TEST95-VALIDATION.json. Publication/build authorization persists; phone acceptance pending.

Previous verified checkpoint: [Test94 / 2.79.94](HANDOFF-2.79.94.md). Physical exterior-gutter and ink evidence repairs Apocalypse issue 3 reader 6 selection2's complete connected pair, reunites street artwork held by false selection5, and retires that false selection. Complete local coverage is 170/385 (150 singles + ten pairs), 215 remaining (197 without qualifying selections, 18 damaged); raw selections 186. The neighboring scene only loses 35 foreign speech pixels. All other 312-page corpus descriptors remain identical, including retained Test93/Test92 gains and Wolverine/Magneto/manga. Reader taps/repeat crops and a full changed-target detector rerun pass; all 90 suites pass locally and in CI. Source is published at `f9a68b6`; Android run `37374620934` succeeded. The downloaded and saved isolated Test94 APK is verified against its checksum, signature/identity record and all 95 web files. Saved review/handoff are updated in place. Phone acceptance remains pending; details and saved file identities are in TEST94-VALIDATION.json. Publication/build authorization persists. No other source targets are expanded in this pass.

Previous checkpoint: [Test93 / 2.79.93](HANDOFF-2.79.93.md). The previous scratch workspace survived with unpublished Test92 commits. Its two gutter-split gains are retained, and Test93 repairs one further single frame by assigning the entire source-enclosed “We Sandstormers…” balloon to Apocalypse issue 1 reader 16's walking-away scene. Complete local coverage is 168 / 385 (150 singles + nine pairs), 217 remaining; raw selections are 187. Only two owner contours change from Test92. 88 behavioral suites, 312-page fresh-source supplement comparisons and the changed target's complete detector replay pass. Brad explicitly authorized publication and APK building in the recovery chat on 5 October 2026. Test92/Test93 are published at `3a3c287`, whose tree exactly matches local checkpoint `81e3a1b`. Android run `37370172377` passed all 88 suites, browser/backup, native, build and packaging checks. The downloaded Test93 APK is verified against the frozen 94-file manifest and CI identity/signature/checksum record; SHA-256 `e75aa758d7f8c8d38b2c69e92c48f19675b79756311a44cfec82f8d4c1f544f0`. Phone acceptance remains pending. User authorization persists for the accepted publication/build scope. See `docs/test93-continuation.md` for the subsequent unsuccessful internal-balloon probes. Do not treat clipped fragments, merged proposals or duplicate accepted rectangles as new gains.

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
