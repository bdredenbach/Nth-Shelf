# Test57: remaining pages66–74

The detector now returns7/4/4/6/5/5 independent selections on68/69/70/71/72/73. It separates the inset and paired scenes on68, the overlapping scene on69, completes the dialogue region on70, retains the foreground figure over neighboring scenes on71, assigns the crossing arm and claws on72, and separates all five strips on73. Pale artwork stays opaque. The translator note on73 and inset caption on68 remain attached to their owners.

Page66 is one advertisement with no internal map. Existing4/6 selections on67/74 are unchanged and were checked through the reader. Only68–73 differ in the full74-page comparison; the other68 maps are byte-identical to Test56. All six changed maps use measured native pixels and conservative topology admission. This is a bounded extension for the current page campaign, not a general solution for all comics. No page IDs, titles, hashes or saved QA coordinates enter runtime detection.

## Validation

- 369 actual mobile-browser touch dispatches across 41 selections on67–74; geometry and focus remain identical after each tap.
- 72,371 dense interior opacity samples; 150 crossing-artwork opacity checks and 133 foreign-panel transparency checks pass.
- All 41 rendered selections inspected, including the slim fading leg on71 and border-crossing claws on72. Two initially chosen blade samples were corrected after source inspection showed they were in the paper between blades.
- Twenty-four raster variants (Skia low/medium/high and Sharp) produce identical canonical new maps. Native images are1988×3056; geometry analysis is585×900.
- 31 captured geometry proofs pass their router contract; 489 deliberate corruptions reject. Twelve removed-paper or transparent-image variants reject.
- All retained syntax/frame regression gates pass. The Android build additionally reruns retained tests, branding, backup round-trip and native archive checks.

During render QA, the page68 inset caption owner and page71 dangling equipment mask were corrected; the affected reader/resize/sweep checks were rerun. Numeric anchors, map digests and summary reports are committed. Original comic images and screenshots stay private and are not uploaded to CI. Device acceptance is pending.

Identity:2.79.57/code27985, package`io.github.bdredenbach.nthshelf.frametest57`, labelNth Shelf Test57. This cumulative build includes Test56 pages59–65. Generalization across comics remains the next task after page review.
