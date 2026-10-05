# Test92 / 2.79.92 — split source gutters, keep captions whole

5 October 2026. Continue on `bdredenbach/Nth-Shelf`, `Test_Branch`.

## Outcome

The Test90 audit identified a time-transition merge on Apocalypse issue 2 reader 12. Test92 splits its lower two scenes into independently tappable crops. Local original-page/Reader-canvas review credits **two newly covered frames**. Issue 2 reader 16's previously credited walking-legs/En conversation pair is also split into two complete singles; that changes presentation, not coverage.

Raw Apocalypse selections rise **185 → 187**. Complete local coverage rises **165 → 167 / 385**, leaving **218**: 197 without a qualifying selection plus the same 21 damaged frames. Complete outputs are now 149 singles and nine same-scene pairs. The frozen audit criterion still permits exactly two complete adjacent same-scene frames, while unrelated/time-transition merges do not qualify. Phone acceptance is pending.

## Implementation and evidence

`js/panels-gutter-split.js` runs after existing detection. A source-supported horizontal paper corridor partitions the actual parent contour into two children. It samples neutral paper at thresholds 220/210, admits only paper reachable from the page exterior with a two-pixel collar, prefers thick smooth paths, requires artwork on both flanks, and retains substantial textured content in both children. Ambiguous/obscured seams abstain.

Paper bodies crossing the cut are assigned atomically. Nearly rectangular captions require greater than 80% existing-body ownership by one leaf; other bodies require strong collar ownership. Caption borders use a four-pixel envelope. A foreign owner vetoes additions outside the original parent. The parent's original descriptor remains verbatim in both child proofs, which reconstruct the partition plus recorded caption contours. Original parent pixels survive in the union; siblings do not overlap. Reader taps, crop contours, popup proofs, page-map cache and edge-spill/refinement bindings accept the new version-44 proof.

No book/page/name/fingerprint lookup is used at runtime. The source artwork is not committed or sent to CI. `geometry.json.gz.b64` contains contour/proof fixtures only. Test91 crop repair is unchanged. The rejected wider nonpaper crop experiment was discarded.

312-page comparisons preserve every unchanged descriptor, retaining replaced parents verbatim in the children: Apocalypse 187 selections; Wolverine 388; Magneto 101; manga chapters 228/193/188. Only two Apocalypse parents change. Fresh Apocalypse mask checks cover 91 pages / 187 selections and retain all original owned pixels while adding no other detected owner's pixels. Unchanged comparison corpora retain the Test91 crop checks. The new contracts cover captured proofs and corruption rejection, parent-pixel retention, disjoint siblings, atomic captions, a synthetic positive gutter, caption/artwork negatives, obscured-seam abstention, actual Reader taps/popups/cache and corrupted proofs.

See [crop review](qa27900/frame-accuracy/test92/crop-review.json), [corpus summary](qa27900/frame-accuracy/test92/corpus-summary.json), and [validation](TEST92-VALIDATION.json). Run `bash qa27900/frame-accuracy/test92/run-retained.sh` for 86 retained/new suites.

## Phone targets and remaining work

- **Apocalypse issue 2 reader 12:** each lower scene should pop separately; inspect all four captions in the bottom scene, including the weeks-later caption.
- **Apocalypse issue 2 reader 16:** walking legs and En's answer should pop separately, with both balloons complete. The lower carrying/conversation pair remains accepted.

Small paper or neighboring caption-border fringe may remain. The source review follows the frozen convention that harmless neighboring speech fragments alone do not invalidate a complete owned frame. The rule currently handles horizontal neutral-paper seams; it does not recover colored gutters, open landscape scenes or every larger composite. Mask/selection checks do not establish semantic ownership of all undetected insets. Phone timing is not signed off.

Next: address source speech beyond original boxes and physically enclosed frame areas currently claimed by inaccurate neighboring candidates; then colored/sloping gutters and larger composites. Keep separate counts for raw selections, complete frames, split already-accepted pairs and repaired crops.

## Android build

Isolated identity: `io.github.bdredenbach.nthshelf.frametest92`, label `Nth Shelf Test92`, version `2.79.92`, code `28020`. Code/proofs/docs are committed locally in `9f274a4cbc4bf270ebfe155d4c207a2bc5fbf8b5`. Two push attempts were rejected by automatic approval review. The second followed authenticated owner/login/permission checks and recovery of the standing user push/APK instruction; review still requires direct user-authored authorization in this thread to publish to the branch. Remote remains `7d7d5f3`. No Test92 APK exists and CI has not started. A local Android build is unavailable (Gradle, javac and SDK absent). After direct approval, push, build, verify the downloaded APK against the frozen 93-file manifest and save/deliver it. Stable app data remains separate.

Visual review saved: `Nth-Shelf-Test92-Frame-Review.html`, Library identity `libfile_1cca6cce82e48191a8706e7fa71bdf04`. Phone targets and complete source comparisons are in that review. The scratch workspace retains fixtures and current build/review scripts; code-backed artifacts remain in git.
