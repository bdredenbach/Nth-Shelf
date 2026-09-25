# Nth Shelf

A local-first comic reader and personal comic library for Android and the web.

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
