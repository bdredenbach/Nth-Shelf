# Test91 / 2.79.91 — bounded display-mask repair

5 October 2026. Continue on `bdredenbach/Nth-Shelf`, `Test_Branch`.

## Recovery checkpoint

The prior chat successfully saved the accepted connected-scene rule and complete Test90 audit in `0d5b48b4c6104606c3593425b3dfee123d7cfd6d`. Its crop-repair work was not committed. This checkpoint implements a reproducible Reader repair and retains [PROJECT-MEMORY.md](PROJECT-MEMORY.md) and [HANDOFF-APOCALYPSE-AUDIT.md](HANDOFF-APOCALYPSE-AUDIT.md) as the decision record and frozen baseline.

One complete frame, or exactly two complete adjacent frames continuing the same immediate scene, qualifies. Preserve artwork, captions and speech; three-frame composites and time/location jumps still fail. Geometry alone does not establish narrative continuity.

## Implementation

`js/panels-crop-repair.js` repairs display masks separately from detector proofs. Each outer ring gets its own bounded convex envelope; disjoint outer rings are never merged. Enclosed irregular matte holes, narrow exterior gates and source-supported neutral-paper speech bays can be restored. Nearby source ink helps close speech enclosures and their hulls retain interior lettering. Straight-sided inset holes and substantial nonpaper convex holes remain excluded. Other detected owners veto substantial conflicts; even tolerated subpixel boundary conflicts never add another owner's pixels. Unproven/corrupted contours abstain.

Reader tap selection, popup clipping and bubble hit boundaries use the same repaired contours. Original detector descriptors and popup proof metadata remain unchanged. Repairs and sampled source pixels are cached for the current page. No book, page, name or fingerprint lookup is used by runtime code.

## Reviewed gains

The fresh 91-page replay still has 185 selections and matches all stored audit boxes and owner identities. This checkpoint adds **zero detected frames**. Conservative actual-Reader crop review credits **12 repaired singles** and **zero repaired pairs**:

- Issue 2: reader 7, selection 6.
- Issue 3: reader 5 selection 4; reader 6 selections 1 and 3; reader 11 selections 3 and 4; reader 13 selections 1, 2 and 3; reader 15 selection 3.
- Issue 4: reader 19 selection 2; reader 20 selection 2.

Local coverage is **145 complete singles + 10 complete pairs = 165 covered frames** of 385, leaving **220**. There are still 199 frames without a qualifying selection and 21 damaged frames. The original Test90 baseline remains 153 covered / 232 remaining. Further improvements that still look partial are not credited; see [crop-review.json](qa27900/frame-accuracy/test91/crop-review.json). Phone confirmation remains pending.

## Validation and limitations

84 retained/new behavioral suites pass: the retained 82, plus crop-repair and actual-Reader adapter contracts. A fresh detector replay covers 312 source pages / 1,283 selections: Apocalypse 185, Wolverine 388, Magneto 101 and the three manga chapters 228/193/188. Display-mask checks retain every original owned pixel, preserve descriptors and add no pixels from another detected owner. These checks do not prove narrative acceptance or protection of every undetected inset. See [corpus summary](qa27900/frame-accuracy/test91/corpus-summary.json) and [validation](TEST91-VALIDATION.json).

Repairs can include a little paper/gutter fringe within the original contour hull. Wide boundary damage, balloons extending beyond the original bounding box, compact holes that may be real insets, and the two damaged pairs remain unresolved. Do not call every changed mask a successful frame. Local concurrent mask preparation had a 446 ms median, 608 ms p95 and a 6,069 ms maximum; these are not phone or detector latency measurements. Speed is not yet signed off.

Android identity: isolated `io.github.bdredenbach.nthshelf.frametest91`, label `Nth Shelf Test91`, version `2.79.91`, code `28019`. CI must verify signature, exact packaged web bytes and the frozen 92-file web manifest. Browser/native build checks could not run locally because Chromium and javac are absent; they remain required in CI. APK status is pending until recorded in TEST91-VALIDATION.json. Stable app data is separate.

## Next bounded checkpoint

First test these repairs on the phone, especially issue 3 reader 11 and 13. Then recover speech beyond current boxes (issue 1 reader 16 selection 5), the remaining SWAK face/crop boundary, issue 3 reader 6 selection 2 and reader 13 selection 5, and issue 4 reader 14 selection 2. Continue splitting larger composites and recovering genuinely missing single frames or manually reviewed same-scene pairs. Preserve the retained Wolverine and manga behavior. Private source artwork and visual reports stay outside git/CI.
