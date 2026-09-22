# Nth Shelf

A local-first comic reader and personal comic library for Android and the web.

## 2.79.33 — page42 curved-frame candidate

**Local source and browser-tested candidate, not a confirmed phone release.**
The seven irregular panels on reader page42 now receive separate pixel-derived
contours. The crossing dialogue balloon stays complete, the large lower-left
scene stays together, and the projecting “SNIKT!” lettering belongs to the final
panel. No page number, filename, image hash, annotation points, or stored crop
table is consulted by the detector.

The new `js/panels-curved-rims.js` route handles a bounded layout family: dark
exterior matte, strongly supported pale irregular rims, noncrossing transverse
scenes, and a lower fan of panels. It is **not a claim that all irregular comics
are solved**. It runs only when the established page-level routes return no
identities. Missing or ambiguous evidence returns no new candidate; accepted
older identities are not replaced, reordered, or enlarged.

### Verification recorded for this iteration

| Check | Recorded result |
| --- | --- |
| Fresh 74-page descriptor comparison | Only page42 changes, 0 → 7; total 298 → 305 |
| Prior identities | All 298 descriptors exact, in original per-page order |
| Previously accepted page41 | All nine entries unchanged: eight intended scenes plus retained legacy merged fallback |
| Manual page42 ownership anchors | 54/54 |
| Actual Reader + NthPageDeck | 35 touchscreen-driven contour renders in mobile-emulated Chromium |
| Existing regression suites rerun | 17 passed; original tests remain unchanged |
| Malformed/tampered proofs | 161 rejections, plus four malformed raw inputs |
| Raw-pixel negatives | Seven rejected, including erased transverse and terminal seams |
| Android APK / on-device acceptance | Not executed in this handoff |

The Reader harness uses the real UI, detector, geometry routing, Page Deck and
canvas renderer, with an in-memory storage fixture and inline local assets. It
is not a database persistence, import, network, service-worker browser lifecycle,
or Android-device test. Service-worker behavior has its own isolated contract
suite. Read the [iteration report](qa27900/frame-accuracy/test33/RESULTS.md) for
exact scope, evidence, rerun commands and limitations.

## Preserve the established work

All existing `qa27900/` tests and Test32 records remain. Page41 stays protected.
Pages43 and44 are still queued; neither is claimed fixed by this iteration.

The earlier Test32 handoff reported 301 total entries, 162 page41 touch/crop
checks, 400 selected Page Deck checks and preservation of 296 prior descriptors.
Those remain **historical reported results**, not newly reproduced facts. The
original Test32 patch/report archive was not supplied. The fresh unmodified-APK
capture had 298 entries. This iteration compares against that exact fresh
298-entry capture and does not erase or explain away the 301-versus-298 gap.

Historical documentation is preserved in [the pre-Test32 README](docs/README-before-test32.md),
[the Test32 checkpoint README](docs/README-test32-checkpoint.md), and
[the Test32 handoff](HANDOFF-Test32.md). Their status statements describe those
earlier checkpoints, not this candidate.

## Repository and source status

The latest remote branch read in this session was `Test_Branch` at
`015bacff2d4c8d051c7232c3e6b180deedcc67f8`. That commit contains checkpoint
maintenance, not this completed source overlay. The GitHub actions exposed in
this session were read-only; direct Git transport failed to connect.
**No new remote commit, push, Actions run, APK upload or release is claimed.**
The supplied full project archive contains the recovered Test32 web baseline
plus the complete 2.79.33 candidate, documentation and tests. `main` and `android`
were not changed remotely.

The Test32 web assets were recovered from the supplied APK, SHA-256:

```text
cfdadc80042b1e57c462f239c13206c27c093abf52337d29e0c40c3811dbcff3
```

Do not rerun the one-time Test32 import over this candidate. Its completion
marker and conflict checks remain in place to refuse that overwrite. No comic
pages, recordings, private signing keys or generated reading screenshots belong
in the repository or packaged app.

## Reader and library

Import CBZ, ZIP, CBT, CB7, 7Z, CBR and RAR comics, including a ZIP containing
multiple supported archives. Organize collections, search the shelf, sort the
library, save bookmarks, and resume reading from the saved position.

Read in Page, Two Page, Scroll, Manga or Webcomic mode. Panel and bubble pop-outs
remain evidence-driven. Auto Scroll is available in continuous reading modes
with speed and playback controls. The existing tap and bubble controls are
retained; this change extends shape ownership rather than replacing gestures.

Android full `.nthshelf` backups stream pages to the selected destination and
verify the written archive. Restore stages pages before publishing the library.
The browser/legacy route retains its existing limits. Keep a backup before major
device or browser changes. These features were not all re-tested in this frame
iteration.

## Offline/cache and versioning

The shell cache is now `nth-shelf-shell-2.79.33`, and it includes the new detector.
Activation waits for a successful complete precache; obsolete-cache removal
remains restricted to Nth Shelf shell names. Unrelated caches and the existing
`longbox` IndexedDB library are not deleted.

Geometry proof/cache identifiers advance to `frame-proof-2.79.33` and
`panel-map-exp-42`. This invalidates stale geometry certificates, not books,
bookmarks or reading progress. The document title and application-version meta
label identify 2.79.33.

Gradle and the existing Android workflow now agree on versionName **2.79.33** and
versionCode **27961**. The uploaded Test32 APK had code 27960 and a separate
`.frametest32` application ID. The repository keeps its existing
`io.github.bdredenbach.nthshelf` ID; a build from it is not an automatic update of
the separate Test32 app. Native Java source remains unchanged, and no newly
built or signed APK is included in this handoff.

## Run the local checks

From the repository root:

```sh
node qa27900/frame-accuracy/test33/curved-rim-contract.cjs
node qa27900/frame-accuracy/test33/service-worker.test.cjs
node qa27900/frame-accuracy/test32/service-worker.test.cjs \
  qa27900/frame-accuracy/test32/sw-baseline.js
python3 qa27900/frame-accuracy/test33/reader-touch.py \
  --comic /private/path/to/comic.zip --out /tmp/nth-reader42 \
  --browser /path/to/chromium
python3 qa27900/frame-accuracy/test33/pixel-negatives.py \
  --comic /private/path/to/comic.zip --out /tmp/nth-rim-negatives.json \
  --browser /path/to/chromium
```

The Python browser tests require Playwright and Chromium. Comic input is local
and private. Screenshots produced by the Reader harness must stay outside the
repository. The Android build workflow retains its existing app-wide gates; it
was updated, not executed here.
