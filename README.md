# Nth Shelf

A local-first comic reader and personal comic library for Android and the web.

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
