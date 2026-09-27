# Test70 — interrupted white-gutter recovery

A late supplement reconnects short, aligned white-gutter interruptions. Three-pixel white corridors must have substantial exposed runs, nearby artwork flanks, and an exterior-paper witness. Two independent gap limits (8% and 10% of the scan axis) must reconstruct the exact same pixel contour. Virtual barriers separate seeds only; the original image and existing whole-balloon ownership pass remain unchanged.

Only eligible paper-cell maps are examined. An added panel must not overlap any prior owner's pixels, compete with another panel envelope, or already be detected by the unchanged source pass. All existing descriptors and ordering are retained. Existing proof 19/20 validation is extended with an `interrupted` evidence object; no new broad rectangle inference or page/tap lookup is introduced.

## Verified target and results

Rise of Apocalypse #3, original image `006.jpg` (index 6; reader **7/23**): the wide scene with the pointing guard and the fire, directly beneath the upper-right scene. The map grows from one owner to two. Both speech balloons belong to the recovered frame. The existing upper-right owner is unchanged.

The final native-browser comparison covers all 91 supplied Apocalypse images: 90 maps are exactly unchanged, the target adds one owner, and all 148 existing owners are preserved. The total becomes 149. Twelve actual touchscreen taps through Reader.handleSingleTap/zoomToPanel passed, with 144 positive alpha checks, 108 exclusion alpha checks, and 7,877 dense interior checks. The 0.67× and 1.5× resizes and the horizontally mirrored page passed the same semantic inclusion/exclusion points.

## Reproduction and evidence

Run `node qa27900/frame-accuracy/test70/interrupted-gutter-contract.cjs` and `node qa27900/frame-accuracy/test70/service-worker.test.cjs` from the repository root. The prepared Android workflow retains all earlier contracts and adds these checks. `repaired-geometry.json.gz.b64` is derived numeric geometry/evidence only, not comic artwork. Tests reconstruct the normalized descriptor from that evidence and reject 15 corrupted variants. Synthetic corridor tests include short-interruption recovery and oversized-gap, misalignment, and nonwhite-gutter negatives.

`corpus-comparison.json`, `reader-validation.json`, `resize-validation.json`, `retained-regressions.txt`, and `native-archive-regression.txt` record the final local runs. Counts describe the tested corpus, not universal semantic accuracy. Performance optimization remains deferred.

## Publishing / packaging status

Source is prepared locally; it has not been pushed because GitHub write actions are not available in the current connection. GitHub CI has not run. The downloadable local APK reuses the verified Test69 native shell, replaces all tested web assets, updates fixed-length identity/user-agent fields, and is locally v2-signed. Its package is `io.github.bdredenbach.nthshelf.frameloc070`, separate from both Test69 and the intended future CI package `io.github.bdredenbach.nthshelf.frametest70`. It is not a freshly compiled Gradle APK and still needs a physical-device installation test. No signing key or source comic artwork is included here.
