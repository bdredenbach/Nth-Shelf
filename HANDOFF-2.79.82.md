# Nth Shelf Test82 handoff

Install the separate **Nth Shelf Test82** app (`io.github.bdredenbach.nthshelf.frametest82`, version **2.79.82**, code **28010**). The panel-map/cache identities are advanced to rebuild maps for the new detector.

On the supplied Rise of Apocalypse issues, check these new targets using reader page numbering, including the cover:

1. Issue 1, **7/24**: the large right-side lightning/child scene.
2. Issue 1, **17/24**: the full upper cavalry scene, without absorbing the lower scenes.
3. Issue 3, **10/23**: the middle-right energy attack scene, without absorbing the scene below it.
4. Issue 2, **18/23**: the upper-right hand/scarab scene should still work. This was already counted in the saved checkpoint and is a fallback check.

Also retain the Test79 top-row targets on issue 3 reader 4, and Test80 torn-paper targets on issue 2 reader 15 and issue 4 reader 3. Existing owner descriptors retain priority and are not trimmed, replaced, or reordered by Test82.

## Evidence and limits

The saved checkpoint is **174** frames. This environment's native-canvas baseline is **175**, and the new pass measures **179** across 91 pages while preserving all 175 local baseline descriptors. Eight saved/native per-page discrepancies are recorded in `qa27900/frame-accuracy/test82/corpus-comparison.json`. Four additions therefore do not mean four new frames over the saved 174: one was already accepted there.

The first three local additions are stable under all tested scale/mirror/JPEG variants. Issue 3 reader 10 survives original pixels, mirroring, and enlargement, but conservatively abstains after 0.67x pre-resampling or JPEG quality-82 recompression. Physical Android acceptance and its actual corpus total remain pending. Many pages still lack complete coverage; the 360+ request is unfinished.

The route requires independent seed consensus, supported boundaries, no unresolved internal divider, and no existing-owner pixel overlap. It uses artwork evidence rather than book/page fixtures. The reader preserves the full validated contour during cropping.

See `TEST82-VALIDATION.json` and `qa27900/frame-accuracy/test82/README.md` for test scope. CI's downloaded `BUILD.json` binds the APK hash and all packaged web hashes to the source commit; the debug signing key identifies a test build.
