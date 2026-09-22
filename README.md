# Nth Shelf

A local-first comic reader and personal comic library for Android and the web.

## 2.79.34 — broad-spectrum irregular-frame candidate

This iteration turns the page42 pale-rim work into a broader, reusable visual
evidence family. The runtime does **not** key this route by comic title, filename,
page number, image hash, stored crop, or QA coordinates. It measures the image
itself: exterior matte, supported pale/dark rim paths, non-crossing topology,
artwork texture, connected visible regions, balloon ownership and final contours.

The established detector stack still has priority. The broad pale-rim route runs
only when all earlier page-level routes leave the map empty, so it cannot replace
or reorder already-proven identities. It first attempts the exact Test33 legacy
raster. Only if that complete proof fails may it retry ownership using the sampled
exterior matte color and the broader component reconciliation.

### Current evidence

| Check | Result |
| --- | --- |
| Reader page42 | 7 panels; complete Test33 descriptor list remains byte-for-byte identical |
| Page42 descriptor SHA-256 | `2d53afd93eec812094eb52a3ba810cdcfea8b390981d140e77191e06127c9d0a` |
| Reader page43 | 5 pixel-derived contour panels |
| Page43 QA ownership points | 20/20 |
| Reader + NthPageDeck page43 touches | 5/5 |
| Page43 rendered contour pixels | 0 differences from independent reference crops |
| Previously-empty Test33 page sweep | Only page43 changes; pages 1, 26, 44, 58, 65, 66, 70, 71 remain empty |
| Prior non-empty pages | Protected by the empty-map-only routing gate |
| Reader page44 | Still pending |
| Phone acceptance | Pending |

The previous Test33 74-page fixture contained 305 entries after page42. The new
page43 route adds five, giving an effective fixture total of 310 under the routing
checks above. This was not a single monolithic fresh 74-page capture: all formerly
empty pages were directly re-run, prior non-empty pages bypass this route by
design, and page42 was separately compared exactly. The historical Test32
301-versus-298 capture discrepancy remains historical and is not claimed resolved.

See [Test34 evidence](qa27900/frame-accuracy/test34/RESULTS.md),
[Test33 page42 evidence](qa27900/frame-accuracy/test33/RESULTS.md), and the
[2.79.34 handoff](HANDOFF-2.79.34.md). Comic artwork and generated reading
screenshots are not committed.

## Why this should transfer to future comics

The detector is organized around reusable visual proof rather than named pages.
A page may qualify even when the precise page42 terminal shape is absent: four or
more strongly supported transverse rims can establish the tier network, bounded
interruptions may be bridged when the remaining evidence is strong, and substantial
disconnected artwork islands can remain inside one proven cell when dark ink or
projecting lettering touches the surrounding matte. Complete contours and proof
validation are still mandatory. Ambiguous evidence returns no new panel.

This is deliberately **broad-spectrum, not universal**. New comic layouts should
first generalize shared evidence/assembly rules; page-specific runtime patches are
not the preferred path. Every accepted historical page remains a regression
requirement.

## Reader and library

Import CBZ, ZIP, CBT, CB7, 7Z, CBR and RAR comics, including a ZIP containing
multiple supported archives. Organize collections, search the shelf, sort the
library, save bookmarks, and resume reading from the saved position.

Read in Page, Two Page, Scroll, Manga or Webcomic mode. Panel and bubble pop-outs
remain evidence-driven. Auto Scroll is available in continuous reading modes
with speed and playback controls. Existing tap, bubble, page-turn and shelf
behaviors are retained by this frame iteration.

Android full `.nthshelf` backups stream pages to the selected destination and
verify the written archive. Restore stages pages before publishing the library.
Keep a backup before major device or browser changes.

## Offline/cache and Test34 identity

The shell cache is `nth-shelf-shell-2.79.34`. Activation waits for a successful
complete precache; cleanup is restricted to Nth Shelf shell cache names and does
not delete IndexedDB books, bookmarks or reading progress.

Geometry proof/cache identifiers are `frame-proof-2.79.34` and `panel-map-exp-43`.
The Android candidate is versionName **2.79.34**, versionCode **27962**. Debug APKs
use `io.github.bdredenbach.nthshelf.frametest34` and label **Nth Shelf Test34**, so
Test32 and Test33 can remain installed with their own data. GitHub's APK workflow
verifies package identity, version, signature and exact packaged web files before
publishing the artifact.

## Run the source checks

From the repository root:

```sh
node qa27900/frame-accuracy/test33/curved-rim-contract.cjs
node qa27900/frame-accuracy/test34/broad-rim-contract.cjs
node qa27900/frame-accuracy/test34/service-worker.test.cjs
```

The saved Test34 Reader result records a mobile-emulated Chromium test with the
real Reader, NthPageDeck and canvas overlay, but an in-memory storage fixture. It
is not Android-device acceptance or an import/persistence test.
