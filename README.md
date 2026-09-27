# Nth Shelf

A local-first comic reader and personal comic library for Android and the web.

## 2.79.67 — paired chromatic Apocalypse insets

Test67 adds a conservative fallback for colored decorative frames whose four sides are split across one or two nearby chromatic components. It requires four measured perimeter sides, a sparse rim, and a textured enclosed scene. The new path runs only when the earlier Test66 colored-rim route returns no owner; runtime logic contains no page IDs, filenames, hashes, saved coordinates, or tap templates.

Across all 91 supplied Rise of Apocalypse page images, the new proof abstains on 90 and adds exactly two selections on issue 4 page 11: the tall upper-left blue-bordered inset and the wide lower-right blue-bordered portrait inset. Test66 returned no owners on that page. Existing Test66 detector contracts remain in the CI gate, and Test67 adds synthetic connected/split-rim, open-frame, flat-interior, proof-tamper, geometry, and reader-authority checks.

Current identity: **2.79.67 / code 27995**, package `io.github.bdredenbach.nthshelf.frametest67`, label **Nth Shelf Test67**. Cache/proof identifiers: `nth-shelf-shell-2.79.67`, `panel-map-exp-65`, `frame-proof-2.79.67`. See [validation](TEST67-VALIDATION.json), [contracts](qa27900/frame-accuracy/test67/README.md), and [handoff](HANDOFF-2.79.67.md). Phone acceptance is pending.

## 2.79.66 — independent Apocalypse frame recovery

Test66 adds three general recovery paths: continuous colored gutters, stable paper cells at two seed scales, and enclosed colored rims with measured speech-balloon ownership. Accepted frame maps retain their existing selections. Runtime detection uses image evidence, with no page identities, filenames, saved frame coordinates, or tap-specific templates.

Test66 adds four complete visible frames on three Rise of Apocalypse pages (reader numbering, including covers):

| Issue | Page | New selections |
| --- | --- | --- |
| 1 | 9 | Upper-center red-bordered scene, including its top dialogue balloon; the overlapping foreground balloon remains excluded. |
| 1 | 14 | Tall upper-left corridor scene, including all three speech balloons. |
| 3 | 5 | Two tall lower-left scenes, including their EN and SABAH balloons. |

Validation passed across 312 page comparisons: only the three target pages changed, all prior owners were preserved, and all 221 earlier Wolverine, manga, and Magneto page maps stayed unchanged. The four additions passed 46 real reader taps, independent screenshot review, and 0.67×/1.5× resize checks.

These pages remain partial. This is an accuracy experiment, not a claim that Apocalypse is fully detected. See [validation](TEST66-VALIDATION.json), [contracts](qa27900/frame-accuracy/test66/README.md), and [handoff](HANDOFF-2.79.66.md).

Current identity: **2.79.66 / code 27994**, package `io.github.bdredenbach.nthshelf.frametest66`, label **Nth Shelf Test66**. Cache/proof identifiers: `nth-shelf-shell-2.79.66`, `panel-map-exp-64`, `frame-proof-2.79.66`. This installs as a separate test app; phone acceptance is pending.

## 2.79.59 — second manga chapter and crossing strokes

Test59 applies the same measured-gutter detector to `30_Chapter_31.cbz`. It removes false panel selections in the cover lettering, keeps the complete open-edge scene on page 16, and retains the crossing sound-effect tips on pages 23 and 33. These rules use background connectivity, frame containment and stroke ownership, without page-specific runtime templates.

The 41-page chapter has 193 audited frames on pages 2–41. All frames passed five mobile-browser touchscreen taps. The prior manga chapter and Wolverine remain regression controls. See [validation results](qa27900/frame-accuracy/test59/RESULTS.md) and [checkpoint](HANDOFF-2.79.59.md).

Previous identity: **2.79.59 / code 27987**, package `io.github.bdredenbach.nthshelf.frametest59`, label **Nth Shelf Test59**. Cache/proof identifiers: `nth-shelf-shell-2.79.59`, `panel-map-exp-57`, `frame-proof-2.79.59`. Phone acceptance is pending; frame pop-outs use PAGE mode. Additional independent books are still needed to measure broader coverage.

## 2.79.58 — general monochrome frame detection

Test58 adds a detector based on exterior paper, measured frame edges and separating gutters. It handles varying panel counts, slanted layouts, narrow strips, open page edges and outlined artwork crossing a gutter. Runtime decisions use image evidence; they do not use chapter IDs, page numbers, stored coordinates or fixed panel-count templates. Unsupported layouts continue through the existing detector.

The supplied 41-page manga chapter has 228 audited frames on pages 3–41. The cover and logo have no internal frames. All 74 Wolverine page maps are unchanged. See [validation results](qa27900/frame-accuracy/test58/RESULTS.md) and [checkpoint](HANDOFF-2.79.58.md). This is a broader monochrome path, not evidence of coverage across most comics: more independent books and borderless/color layouts remain to be evaluated.

Previous identity: **2.79.58 / code 27986**, package `io.github.bdredenbach.nthshelf.frametest58`, label **Nth Shelf Test58**. Cache/proof identifiers: `nth-shelf-shell-2.79.58`, `panel-map-exp-56`, `frame-proof-2.79.58`. Phone acceptance is pending.

## 2.79.57 — pages66–74: pale gutters and crossing figures

Test57 separates the remaining merged scenes and preserves artwork crossing panel boundaries. Reader pages68/69/70/71/72/73 have7/4/4/6/5/5 selections. Page68 retains its inset caption, page70 keeps the portrait dialogue and separates the standing figure, pages71–72 retain foreground figures and claws, and page73 separates five strips with its translator note. Page66 is a single advertisement; existing maps on67 and74 remain unchanged.

Previous identity: **2.79.57 / code27985**, package `io.github.bdredenbach.nthshelf.frametest57`, label **Nth Shelf Test57**. Cache/proof identifiers: `nth-shelf-shell-2.79.57`, `panel-map-exp-55`, `frame-proof-2.79.57`. See [results](qa27900/frame-accuracy/test57/RESULTS.md) and [checkpoint](HANDOFF-2.79.57.md). This cumulative build includes Test56's pages59–65 changes. Phone acceptance is pending; generalization across comics remains the next task after the page campaign.

## 2.79.56 — pages59–65: bleed and overlapping frames

Test56 recovers6/6/6/5/8/6/7 selections on reader pages59–65. Native exterior-paper topology admits a measured ink-rail network, including skewed panels, page-edge scenes and overlapping foreground frames. Masks assign overlapping artwork to one owner, retain page59's crossing speech balloon and page64's sound-effect lettering, and preserve light artwork at bleed edges. Border recovery also handles a page62 resize variant that otherwise returns two coarse composites.

Previous identity: **2.79.56 / code27984**, package `io.github.bdredenbach.nthshelf.frametest56`, label **Nth Shelf Test56**. Cache/proof identifiers: `nth-shelf-shell-2.79.56`, `panel-map-exp-54`, `frame-proof-2.79.56`. See [results](qa27900/frame-accuracy/test56/RESULTS.md) and [checkpoint](HANDOFF-2.79.56.md). Phone acceptance pending. The user queued pages66–74 next, then detector generalization across comics.

## 2.79.55 — pages54–57: nested insets and complete borders

Test55 addresses the user's next four-page batch. Reader pages54/55/56/57 have8/6/7/6 selections, including two insets on54 and one on55. The compact inset detector proves both caps independently and retains page55's crossing speech balloon. Native exterior-paper component bounds keep the entire frame rim and avoid overlap across narrow gutters.

Page56 already found seven frames in this browser, but the former fitted bounds missed33 of63 sampled positions near their borders. The new native bounds pass all63, with seven stable frame identities. Page54's lower-left, page55's tall lower-right and page57's upper two selections remain exact. The full74-page comparison changes only54–57; other70 maps are byte-identical.

Previous identity: **2.79.55 / code27983**, package `io.github.bdredenbach.nthshelf.frametest55`, label **Nth Shelf Test55**. Cache/proof identifiers: `nth-shelf-shell-2.79.55`, `panel-map-exp-53`, `frame-proof-2.79.55`. See [results](qa27900/frame-accuracy/test55/RESULTS.md) and [checkpoint](HANDOFF-2.79.55.md). Phone acceptance pending.

Continue remaining Wolverine pages first; generalization across comics remains the next task after the page campaign.

## 2.79.54 — pages50–53: separated scenes and insets

Test54 addresses the user's four-page batch. Reader pages50/51/52/53 now have7/6/6/4 selections, counting one independent inset on each. White exterior paper identifies the main frames; sustained black rims independently validate them. Page51's borderless scene keeps all its dialogue. The eye inset on page50 retains its crossing speech balloon. Parent scenes exclude inset pixels from their masks.

The six already-separated lower selections across pages50/52/53 remain exact. A native-pixel retry handles a page53 resize variant that otherwise loses the legacy gutter map, retaining its bottom closed-frame anchor. The full74-page comparison changes only50–53; all other70 maps, including phone-confirmed page49, are byte-identical. No page IDs, hashes, titles or saved coordinates drive runtime detection.

Previous identity: **2.79.54 / code27982**, package `io.github.bdredenbach.nthshelf.frametest54`, label **Nth Shelf Test54**. Cache/proof identifiers: `nth-shelf-shell-2.79.54`, `panel-map-exp-52`, `frame-proof-2.79.54`. See [results](qa27900/frame-accuracy/test54/RESULTS.md) and [checkpoint](HANDOFF-2.79.54.md). Phone acceptance pending.

Page49 was confirmed on phone by the user. The user authorized pages50–53 together for this batch. Continue the remaining Wolverine pages first; generalization across comics remains the next task after that campaign.

## 2.79.53 — page49: thin gutters with independent frame rims

Test53 replaces the upper composite with four measured frames and preserves the bottom conversation. Page49 has five selections. The admission check requires white paper outside all sixteen dark rims; it does not relax the global gutter threshold. Geometry comes from explicit native-image resampling, with no page IDs, titles, hashes or saved coordinates in runtime.

Previous identity: **2.79.53 / code27981**, package `io.github.bdredenbach.nthshelf.frametest53`, label **Nth Shelf Test53**. Cache/proof identifiers: `nth-shelf-shell-2.79.53`, `panel-map-exp-51`, `frame-proof-2.79.53`. See [results](qa27900/frame-accuracy/test53/RESULTS.md) and [checkpoint](HANDOFF-2.79.53.md). Phone acceptance is pending.

User-approved sequence (2026-09-26): finish the remaining Wolverine pages with per-page phone checks first. Generalizing the detector across comics is the next task after that campaign. Preserve accepted page maps and collect failures as regression examples; defer a broad redesign until the remaining pages are reviewed.

## 2.79.52 — page47: separate rows and insets

Test52 preserves the bedroom selection and replaces the merged lower area with five independent selections: classroom, classroom inset, hallway, fallen-book scene and screen inset. Each surrounding scene excludes inset artwork. The classroom inset retains its caption and outlined lettering.

Validation:108 real browser touch dispatches,18,710 dense opacity samples, four alternate scaled-raster checks and a full74-page comparison. Only page47 changes; all other73 maps, including pages44 and45, remain exact. See [results](qa27900/frame-accuracy/test52/RESULTS.md) and [recovery checkpoint](HANDOFF-2.79.52.md). Phone confirmation is pending.

Previous identity: **2.79.52 / code27980**, package `io.github.bdredenbach.nthshelf.frametest52`, label **Nth Shelf Test52**. Cache/proof identifiers: `nth-shelf-shell-2.79.52`, `panel-map-exp-50`, `frame-proof-2.79.52`.

## 2.79.51 — page45: ten separate frames

Test51 replaces page45's three composite crops with ten measured outlines: four top frames, the fire strip, the conversation scene and four bottom frames. Pale sloping rims and dark vertical gutters must form a complete network before the old composites are replaced. Native-pixel sampling and a canonical coarse map keep the outlines consistent across image scaling variants.

All 73 other pages, including page44's eight Test50 frames, remain byte-for-byte identical in the full 74-page comparison. See [test results](qa27900/frame-accuracy/test51/RESULTS.md) and [recovery checkpoint](HANDOFF-2.79.51.md). Phone acceptance is pending.

Historical identity: **2.79.51 / code27979**, package `io.github.bdredenbach.nthshelf.frametest51`, label **Nth Shelf Test51**. Cache/proof identifiers: `nth-shelf-shell-2.79.51`, `panel-map-exp-49`, `frame-proof-2.79.51`.

## 2.79.50 — page44 device-resampling repair

**Test49 failed phone testing.** Its successful Chromium raster hid failures in four other scaled-image variants: completion disappeared and old partial masks/fallback crops returned.

Test50 reads native image pixels, explicitly resamples once and completes the matte map on that same raster. A thin, already proved rim cell survives the core-eroding step. All four previously failing variants now yield identical eight-frame maps. Reader checks pass **216 touches**, with **16,670 dense interior-opacity samples** across two failing-scaling replays. Every other page in the 74-page comparison is unchanged. All eight rendered crops were inspected.

**Phone acceptance remains pending.** See [results](qa27900/frame-accuracy/test50/RESULTS.md) and [recovery checkpoint](HANDOFF-2.79.50.md). Historical identity: **2.79.50 / code27978**, package `io.github.bdredenbach.nthshelf.frametest50`, label **Nth Shelf Test50**. Cache/proof identifiers: `nth-shelf-shell-2.79.50`, `panel-map-exp-48`, `frame-proof-2.79.50`.

## 2.79.49 — page44: eight frames, nine taps each

Test49 restores incomplete dark-art masks and detects the missing narrow red-background profile on page44. All eight visible frames pass nine real browser touch/crop checks each: **72/72**. Visual review also caught and corrected the claw strip's clipped lower border.

The full 74-page comparison changed only page44. **Subsequent phone test failed; superseded by Test50.** See [results](qa27900/frame-accuracy/test49/RESULTS.md) and [handoff](HANDOFF-2.79.49.md).

Historical identity: **2.79.49 / code27977**, package `io.github.bdredenbach.nthshelf.frametest49`, label **Nth Shelf Test49**. Cache/proof identifiers: `nth-shelf-shell-2.79.49`, `panel-map-exp-47`, `frame-proof-2.79.49`.

Earlier candidates and recorded results follow.

## 2.79.48 — page43 corner taps select the complete frame

A tiny break in page43's pale border let the exterior scan remove dark artwork from the middle slanted frame's mask. Test48 repairs that measured leak so the highlighted corner and center select the same whole K-KRASH scene.

All 32 browser touch/crop checks pass. A full 74-page comparison changes only this frame; its four neighbors and all other pages remain exact. **Phone acceptance is pending.** See [results](qa27900/frame-accuracy/test48/RESULTS.md) and [handoff](HANDOFF-2.79.48.md).

Test48 identity: **2.79.48 / code27976**, package `io.github.bdredenbach.nthshelf.frametest48`, label **Nth Shelf Test48**. Cache/proof identifiers: `nth-shelf-shell-2.79.48`, `panel-map-exp-46`, `frame-proof-2.79.48`.

Earlier candidates and their recorded results follow.

## 2.79.47 — page36 completion in the actual Reader

The recovered Test46 build returned only two proven page36 frames, so its seven-cell repair never ran. Test47 preserves those two frames and adds four outlines after checking the visible borders and foreground silhouette. The sheriff stays separate from the whole hallway/Logan scene, and the bottom-right room excludes the shower.

All 35 browser touch/crop checks pass. A complete 74-page comparison changes only page36 (2 → 6), preserving every old frame descriptor. **Phone acceptance is pending.** See [results](qa27900/frame-accuracy/test47/RESULTS.md) and [recovery handoff](HANDOFF-2.79.47.md).

Test47 identity: **2.79.47 / code27975**, package `io.github.bdredenbach.nthshelf.frametest47`, label **Nth Shelf Test47**. Test47 cache/proof identifiers: `nth-shelf-shell-2.79.47`, `panel-map-exp-45`, `frame-proof-2.79.47`.

The following sections record earlier candidates; their expectations are superseded by the current results above.

## 2.79.46 — page36 stepped shared-scene v2

Test45 got the **six-frame count** right on Reader page36 but the phone video showed the reconstructed polygons were wrong: the middle scene had black cutouts / missing artwork and the shared lower edges did not match the actual frame rails. The user supplied a marked screenshot confirming the intended six visible owners.

Test46 stops inventing a replacement seam. It keeps the independently proved top-right and two bottom frame envelopes, detects the missing vertical step beside the sheriff inset from its sustained dark rail, and builds the middle scene using the **same proven top edges of the two bottom panels**. The top-left becomes the correct stepped polygon, the sheriff inset remains separate, hallway + Logan remain one middle scene, and the bottom pair stay independent.

The Test46 proof is versioned separately from Test45 so the older contract remains a regression fixture. The same seven-cell eligibility gate is retained, and the added step-rail proof further narrows activation. Page36 phone acceptance is pending.

## 2.79.45 — stepped shared-scene candidate

Test45 fixes Reader page36's matte-cell over-segmentation. Test44 publishes seven page-wide matte identities, but independent artwork review and phone evidence show **six real frames**: top-left, top-right, sheriff inset, one complete middle scene, bottom-left, and bottom-right. The left hallway and right Logan portions of the middle scene are one owner.

The new bounded route starts only from a seven-cell matte map with a specific overlapping/inset/bottom-pair topology. It independently re-fits the top/inset/bottom anchors, reunites the two middle fragments, and gives the middle scene plus the two bottom panels one smooth shared sloped boundary. Local verification passes **30/30** center/left/right/north/south ownership checks across the six frames. A full matte-cell applicability sweep found five seven-cell pages (17, 32, 36, 44, 56); **only page36 qualifies** for Test45.

Page35 and the Test44 furl/hot-zone behavior are phone-accepted. Page36 phone acceptance is pending. See [Test45 results](qa27900/frame-accuracy/test45/RESULTS.md) and [handoff](HANDOFF-2.79.45.md).

## 2.79.44 — inset live corner zones

Test44 calibrates the forward Page-mode grab zones from the follow-up phone video. Test43's furl geometry works once caught, but its upper-right zone begins too close to the page top and its lower-right zone too close to the page bottom.

The upper live zone is now moved **down into the comic** and the lower live zone **up into the comic** by the same responsive inset (about 4.5% of page height, capped at half the grab-zone size). Forward touches outside the visible paper no longer start a corner turn. The tutorial uses the exact same `PageMode.cornerZoneMetrics()` function, so its two red boxes are the actual live hit areas rather than approximations.

Test43's mirrored top-down / bottom-up furl path is retained unchanged. Test42 frame behavior remains packaged. See [Test44 handoff](HANDOFF-2.79.44.md).

## 2.79.43 — corner-furl page turn + precision tutorial

Test43 targets the Page-mode corner-turn behavior shown in the supplied phone video. The deck already knew whether the upper or lower corner had been grabbed, but an almost-horizontal drag kept that corner at the same Y coordinate; the resulting perpendicular-bisector crease was vertical and looked like the page was rotating from its middle.

The new corner path guarantees a minimum vertical arc while preserving any stronger finger motion: **lower-right lifts/furls upward** and **upper-right folds downward**. The arc is zero when the page is flat, peaks around mid-turn, and returns smoothly to zero as the sheet lands. The tutorial now marks both actual right-corner grab zones with matching ↖ / ↙ direction cues and explains the same geometry in words.

Test42's page35 frame candidate remains included; page35 phone acceptance is not implied by this animation build. See [Test43 handoff](HANDOFF-2.79.43.md).

## 2.79.42 — branched stack with curved shared seam

Test42 fixes Reader page35. Test41 publishes one giant upper owner plus three false fragments cut from the final hotel panel. Test42 proves the actual seven-frame topology from a sustained main spine, a second upper-right divider, two horizontal rails, the terminal rail, and a traced curved shared seam between the sheriff and forest panels.

Reader verification passed **35/35** center/left/right/north/south ownership points across all seven owners. A targeted applicability sweep of every preserved four-entry page found **only page35** eligible for this route. Page33 is phone-accepted; page35 phone acceptance is pending. See [Test42 results](qa27900/frame-accuracy/test42/RESULTS.md) and [handoff](HANDOFF-2.79.42.md).

## 2.79.41 — five-column bank candidate

Test41 fixes Reader page33's lower slab. Test40 leaves the page as three coarse wide owners; the bottom owner actually contains five vertical panels over one terminal full-width panel. Test41 re-proves that tier from four sustained dark vertical rails spanning the whole bank, so large lettering and artwork cannot create tap-dependent horizontal splits.

Reader verification passed **40/40** ownership points across all eight page owners and **30/30 actual touchscreen pop-outs** across the six repaired lower owners, with zero page errors. A targeted applicability sweep of every preserved three-entry candidate found **only page33** eligible. Page32 is phone-accepted; page33 phone acceptance is pending. See [Test41 results](qa27900/frame-accuracy/test41/RESULTS.md) and [handoff](HANDOFF-2.79.41.md).

## 2.79.40 — framed inset triplet candidate

Test40 fixes Reader page32's lower composite. Test39 publishes the already-correct lower-left scene plus one giant lower-right owner. Test40 proves the tall eye inset from two long vertical edge rails and independent top/bottom caps, then replaces only that giant parent with three owners: left surrounding scene, inset, and right surrounding scene.

The full 74-page applicability sweep found **page32 as the only page** that qualifies for this route. Reader verification passed **15/15** center/left/right/north/south taps across the three new owners with zero page errors. Page28 is phone-accepted; page32 phone acceptance is pending. See [Test40 results](qa27900/frame-accuracy/test40/RESULTS.md) and [handoff](HANDOFF-2.79.40.md).

## 2.79.39 — nested structural leaf candidate

Test39 fixes Reader page28 by refusing to publish two coarse stacked slabs when their interiors still contain a complete six-cell structural hierarchy. The accepted map is **2 top + 1 middle strip + 3 bottom columns**. A dark artwork rail inside the narrow bottom-middle panel is reunited with its parent unless both sides independently validate as scenes.

Reader verification passed **30/30** directional ownership taps with zero page errors. Pages23 and27 and every other preserved two-entry page checked remain exact; only page28 changes. Page27 is phone-accepted; page28 phone acceptance is pending. See [Test39 results](qa27900/frame-accuracy/test39/RESULTS.md) and [handoff](HANDOFF-2.79.39.md).

## 2.79.38 — occluded bottom-tier structural candidate

Test38 fixes Reader page27's lower tier without tap-dependent geometry rescue. Two straight lower panels are now orthogonal page-wide owners, while the foreground-occluded middle/right boundary produces one larger outlined right scene. The new route is a bounded extension of `js/panels-structural-grid.js`; it requires two validated local-island anchors, one validated matte-neighbor anchor, a complete structural grid, an interrupted dark seam and a terminal cap. No comic/page identity keys are used.

Page27 browser verification passed 11/11 lower-tier directional taps plus an extra foreground-under-middle tap with zero page errors. Page23's Test37 descriptors remain exact. Page13 and page23 are phone-accepted; page27 phone acceptance is pending. See [Test38 results](qa27900/frame-accuracy/test38/RESULTS.md) and [handoff](HANDOFF-2.79.38.md).

## 2.79.37 — tap-independent structural grid candidate

Test37 promotes conservative V100 guillotine evidence into a page-wide map only when two stronger perimeter anchors (`rim-frame` + `bleed-strip-frame`) independently corroborate the grid. Reader page23 now has six page-wide owners instead of two, so four panels no longer depend on tap-position rescue. The existing irregular upper-left rim and bottom bleed strip are preserved exactly.

Page23 browser verification: 30/30 center/left/right/north/south ownership checks and 20/20 focus renders across the four new structural cells, with no page errors. Page13 Test36 is phone-accepted; page23 phone acceptance is pending. See [Test37 results](qa27900/frame-accuracy/test37/RESULTS.md) and [handoff](HANDOFF-2.79.37.md).

## 2.79.35 — broad-spectrum matte-cell candidate

Test35 extends the general frame system rather than adding a page44 exception.
The new `js/panels-matte-cells.js` route derives frames from **edge-connected
exterior matte or paper, measured separators, artwork connectivity and final
pixel contours**. It contains no comic title, filename, page number, image hash,
QA coordinate or stored crop.

The new family is strictly **empty-map-only**: all established panel detectors run
first. If a page already has proven identities, Test35 never replaces or reorders
them. Ambiguous or incomplete new maps are withheld instead of being turned into
speculative rectangles.

### What this iteration proves

- **Reader page44:** 0 → **7** complete contour panels.
- **Reader page58:** 0 → **4** complete paper-cell panels.
- **Reader page70:** 0 → **4** complete paper-cell panels.
- **Reader page71:** 0 → **4** complete paper-cell panels; two disconnected snow
  islands in the same framed column are correctly reunited.
- **Reader page65:** a partial two-panel interpretation is deliberately rejected
  because it fails the map coverage requirement. Its established interactive
  fallback remains available instead of being displaced by an incomplete map.
- Reader pages42 and43 are **byte-for-byte identical** to Test34 when re-run from
  the same comic fixture.

The directly re-run remaining-zero-page set is 1, 26, 44, 58, 65, 66, 70 and71.
Only 44, 58, 70 and71 gain identities. Combined with the Test34 effective fixture
count, this moves 310 → **329** page-wide descriptors. This is not described as a
new monolithic 74-page capture: earlier non-empty pages are protected by the
empty-map routing invariant, while pages42 and43 were separately compared exactly.

### Page44 Reader verification

The real Reader/NthPageDeck browser harness checked **35/35 ownership anchors**
and **7/7 touchscreen pop-outs** (one for every new page44 panel). The focused
contour canvases matched independent reference crops at all **6,480,484** tested
pixel positions with **zero differences** and no page errors.

These are browser/source tests using an in-memory storage fixture, not Android
phone acceptance. See [Test35 results](qa27900/frame-accuracy/test35/RESULTS.md)
and the [2.79.35 handoff](HANDOFF-2.79.35.md). Comic artwork and generated
screenshots are not committed.

## Why this work transfers to future comics

Nth Shelf now has several independent evidence families: orthogonal and skewed
rails, gutters/partitions, occluded and overlapping frames, local/inset/rim
families, curved pale-rim networks, and edge-connected matte/paper cells. Each
family must prove its own geometry. A new comic is matched by the pixels it
contains, not by where it came from.

The preferred development rule is to broaden shared evidence/assembly logic
before creating another detector. Every previously accepted page remains a
regression requirement.

## Reader and library

Import CBZ, ZIP, CBT, CB7, 7Z, CBR and RAR comics, including a ZIP containing
multiple supported archives. Organize collections, search the shelf, sort the
library, save bookmarks, and resume reading from the saved position.

Read in Page, Two Page, Scroll, Manga or Webcomic mode. Panel and bubble pop-outs
remain evidence-driven. Auto Scroll is available in continuous reading modes
with speed and playback controls. Existing tap, bubble, page-turn, shelf and
backup behavior is retained by this frame iteration.

Android full `.nthshelf` backups stream pages to the selected destination and
verify the written archive. Restore stages pages before publishing the library.
Keep a backup before major device or browser changes.

## Offline/cache and Test35 identity

The shell cache is `nth-shelf-shell-2.79.35`. Activation waits for a successful
complete precache; cleanup is restricted to Nth Shelf shell cache names and does
not delete IndexedDB books, bookmarks or reading progress.

Geometry proof/cache identifiers are `frame-proof-2.79.35` and
`panel-map-exp-44`. The Android candidate is versionName **2.79.35**, versionCode
**27963**. Debug APKs use `io.github.bdredenbach.nthshelf.frametest35` and label
**Nth Shelf Test35**, so earlier test builds can remain installed independently.

GitHub's APK workflow verifies regression contracts, browser/backup checks, the
native archive test, Android package identity, signature and exact packaged web
files before publishing the artifact.

## Source checks

```sh
node qa27900/frame-accuracy/test33/curved-rim-contract.cjs
node qa27900/frame-accuracy/test34/broad-rim-contract.cjs
node qa27900/frame-accuracy/test35/matte-cell-contract.cjs
node qa27900/frame-accuracy/test35/service-worker.test.cjs
```

The private comic can additionally be used with
`qa27900/frame-accuracy/test35/reader-touch.py` for the recorded page44 Reader
check. The comic itself is not stored in Git.


## Test37 identity

The current shell cache is `nth-shelf-shell-2.79.37`. Android debug builds use versionName **2.79.37**, versionCode **27965**, package `io.github.bdredenbach.nthshelf.frametest37`, and label **Nth Shelf Test37**. Test37 adds `js/panels-structural-grid.js`; Test36 edge-spill behavior remains included.


## Current Test38 identity

The current shell cache is `nth-shelf-shell-2.79.38`. Android debug builds use versionName **2.79.38**, versionCode **27966**, package `io.github.bdredenbach.nthshelf.frametest38`, and label **Nth Shelf Test38**. Test36 edge-spill and Test37 structural-grid behavior remain included.


## Current Test39 identity

The current shell cache is `nth-shelf-shell-2.79.39`. Android debug builds use versionName **2.79.39**, versionCode **27967**, package `io.github.bdredenbach.nthshelf.frametest39`, and label **Nth Shelf Test39**.


## Current Test40 identity

The current shell cache is `nth-shelf-shell-2.79.40`. Android debug builds use versionName **2.79.40**, versionCode **27968**, package `io.github.bdredenbach.nthshelf.frametest40`, and label **Nth Shelf Test40**.


## Current Test41 identity

The current shell cache is `nth-shelf-shell-2.79.41`. Android debug builds use versionName **2.79.41**, versionCode **27969**, package `io.github.bdredenbach.nthshelf.frametest41`, and label **Nth Shelf Test41**.


## Current Test42 identity

The current shell cache is `nth-shelf-shell-2.79.42`. Android debug builds use versionName **2.79.42**, versionCode **27970**, package `io.github.bdredenbach.nthshelf.frametest42`, and label **Nth Shelf Test42**.


## Current Test43 identity

The current shell cache is `nth-shelf-shell-2.79.43`. Android debug builds use versionName **2.79.43**, versionCode **27971**, package `io.github.bdredenbach.nthshelf.frametest43`, and label **Nth Shelf Test43**.


## Current Test44 identity

The current shell cache is `nth-shelf-shell-2.79.44`. Android debug builds use versionName **2.79.44**, versionCode **27972**, package `io.github.bdredenbach.nthshelf.frametest44`, and label **Nth Shelf Test44**.


## Current Test45 identity

The current shell cache is `nth-shelf-shell-2.79.45`. Android debug builds use versionName **2.79.45**, versionCode **27973**, package `io.github.bdredenbach.nthshelf.frametest45`, and label **Nth Shelf Test45**.


## Historical Test46 identity

The Test46 shell cache was `nth-shelf-shell-2.79.46`. Android debug builds use versionName **2.79.46**, versionCode **27974**, package `io.github.bdredenbach.nthshelf.frametest46`, and label **Nth Shelf Test46**.
