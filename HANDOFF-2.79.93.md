# Test93 / 2.79.93 — complete crossing speech ownership

5 October 2026. Repository `bdredenbach/Nth-Shelf`, branch `Test_Branch`.

## Recovery and measured outcome

The stalled session survived at `/workspace/scratch/5827b11a4a78/Nth-Shelf`, with local Test92 implementation commit `9f274a4` and blocked-publication checkpoint `b80ebbb`. Original artwork, replay maps and visual reports survived alongside it. Test93 tested implementation checkpoint is `ff024eedc5f6aab51b009a911a12e66976ff0036`. Latest remote checkpoint remains Test91 `7d7d5f3`; Test92 and Test93 have not been published or built. Do not infer an APK exists from the Test92 review's installation text.

Test93 completes Apocalypse issue 1 reader **16/24**, selection **5** (walking away): its complete “We Sandstormers…” balloon now stays with the scene. Selection 4 loses the foreign balloon fragment while retaining its reclining figure and all artwork outside the body. Actual Reader canvases were reviewed against the original source.

Local complete coverage is **150 singles + nine connected pairs = 168 / 385**, leaving **217**: 197 without a qualifying selection and 20 damaged frames. Raw selections remain **187**. Relative to Test92 this is one repaired single and zero added selections. Relative to published Test91, the recovered pass retains Test92's two new complete scenes plus this one repair: **165 → 168** complete frames. Phone acceptance is pending.

## Source rule

`js/panels-speech-ownership.js` assigns an enclosed neutral-paper body across frame boundaries atomically. The body must be substantial, compact and source-ink bounded, with at least 55% collar support and a 25-point lead over the next owner. It must protrude beyond the winner's original box by more than six analysis pixels. Unproven owners, overlapping candidate bodies, weak/ambiguous evidence, transparent inputs and recursive wrappers abstain.

The version-46 proof retains the exact parent descriptors and the participating ownership evidence. Source speech, border and lettering stay together; all prior source pixels survive in the union and all artwork outside the transferred body remains unchanged. Normalized contour reconstruction, descriptor checks and immutable proof caching protect subsequent taps and pop-outs. The same contour reaches the Reader's tap selection and overlay; the existing Test91 display repair remains active. No book/page/name/fingerprint lookup is used by runtime code. Private artwork and visual reports remain outside git/CI.

## Verification

- **88 retained/new behavioral suites pass**, including synthetic source positives, artwork/transparency negatives, 20 rejected proof corruptions, exact source-union/non-speech retention and atomic ownership.
- Actual Reader checks verify both pop-outs, proof preservation, cached display masks and **2,273 transferred speech-pixel taps**.
- Fresh source-raster supplement comparisons over retained Test92 maps cover **312 pages / 1,285 selections**. Only the two Apocalypse owners above change. Wolverine 388, Magneto 101 and manga 228/193/188 retain identical descriptors. This is not a fresh full-pipeline replay of every page.
- A full existing detector rerun reproduces the changed target exactly (6 selections; local native-canvas 12,356 ms). This is not a phone latency result or speed acceptance.
- Local browser/backup checks did not start: Playwright could not find Chromium. Android CI, native checks, packaged-file verification and phone acceptance remain pending.

Run `bash qa27900/frame-accuracy/test93/run-retained.sh`. See `TEST93-VALIDATION.json`, `qa27900/frame-accuracy/test93/corpus-summary.json` and `crop-review.json`. Geometry-only fixtures contain no comic pixels.

## Broader attempts and continuation

Extended seed radii, alternate neutral-paper thresholds, smaller/vertical seams and narrower chromatic rims earned no further complete-frame credit. Some proposals were fragments, merged scenes, clipped captions or duplicate detections of already accepted rectangular outputs. Their runtime paths were excluded; do not add their proposal counts to coverage or ignore legacy rectangles when checking prior ownership.

Next source targets remain the SWAK face, issue 3 reader 6's damaged pair, reader 13's damaged lower pair and the narrow red-bordered En inset on issue 4 reader 14. Source-enclosed artwork incorrectly claimed by a neighboring candidate needs physical foreground-boundary evidence before reassignment. Keep all current gains, including Test92 issue 2 readers 12 and 16, and continue measuring usable coverage separately from raw selections.

## Publication/build gate

Isolated identity prepared: `io.github.bdredenbach.nthshelf.frametest93`, label `Nth Shelf Test93`, version `2.79.93`, code `28021`. Workflow and exact 94-file web manifest are prepared. No Test93 APK exists.

The prior handoff records: “Two push attempts were rejected by automatic approval review… review still requires direct user-authored authorization in this thread to publish to the branch.” No repeat publication attempt was made in this pass. The concrete tested code, review and continuation notes are complete; request explicit permission to push this checkpoint and trigger Android CI. After permission, push the local Test_Branch commits, download the CI APK, verify isolated identity/signature and all packaged files against the frozen manifest, then save and deliver it. Do not stop at merely starting CI.

Visual report: `Nth-Shelf-Test93-Frame-Review.html`. Its new review includes the original page, before/after walking-away crop, preserved preceding scene and retained Test92 comparisons. Its saved identity is recorded in TEST93-VALIDATION.json after upload.
