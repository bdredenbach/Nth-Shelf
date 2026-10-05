# Nth Shelf

A local-first comic reader and personal comic library for Android and the web.

## Development checkpoint — Frame Test32

**Repository status: accepted Test32 web source recovered.** All 64 packaged
web assets were recovered from the checksum-verified APK. Detector JavaScript
remains byte-for-byte unchanged; the requested README and service-worker
maintenance is recorded separately.

**Page41 is accepted and protected.** Pages42–44 are still open. Start with page42;
reserve **2.79.33** for the iteration in which its frames work and pass acceptance.
This checkpoint is not a 2.79.33 release and does not introduce new frame geometry.

## Keep the proven work

Retain all existing `qa27900/` tests and reports. Treat accepted frame identities,
complete artwork, speech balloons, tails and projecting lettering as regression
requirements; do not trade them away for a higher detection count.

The earlier Test32 handoff reported 162 page41 touch/crop checks, 400 selected
Page Deck checks, and preservation of all 296 prior descriptors. Its 74-page
comparison reported 301 entries. Those figures are retained as **historical
reported results**, not described as newly rerun tests: the original Test32
patch/report archive was not supplied in this handoff.

A fresh capture of the uploaded APK's unmodified detector code in Chromium
144.0.7559.96 completed all 74 images and returned **298 entries**. Page41 returned
nine entries, including all five version-4 column panels. Nine entries are not
nine real scenes: the accepted layout has eight intended scenes plus a retained
legacy merged fallback. Pages42, 43 and 44 returned no page-level identities in
this capture; interactive fallback behavior is a separate test.

The 298-versus-301 total is **not a reproduced parity result**. Keep both records;
resolve the environment/fixture difference before asserting full historical
parity. No detector was changed to make this new total match an old report.
See [checkpoint evidence and queue](qa27900/frame-accuracy/test32/BASELINE.md).

## Recover the exact accepted source

The original input is `Nth-Shelf-Frame-Test32.apk` (64 packaged web assets), not a
full native-source project archive. Its SHA-256 is:

```text
cfdadc80042b1e57c462f239c13206c27c093abf52337d29e0c40c3811dbcff3
```

To import it in GitHub, upload that exact APK to the root of `Test_Branch` as
`Nth-Shelf-Frame-Test32.apk`. The one-time import workflow validates its checksum,
refuses conflicting/newer runtime files, extracts only the web assets, applies
the prepared README/service worker, runs syntax/cache checks, and commits the
result without a force push. A completion marker prevents a later workflow run
from overwriting page42 work. It never imports the comic ZIP or decompiles native
classes.

For a local checkout:

```sh
python3 scripts/import-test32-baseline.py /path/to/Nth-Shelf-Frame-Test32.apk --verify-only
python3 scripts/import-test32-baseline.py /path/to/Nth-Shelf-Frame-Test32.apk
node qa27900/frame-accuracy/test32/service-worker.test.cjs
```

The script's local invocation edits the checkout; it does not push automatically.
Review and commit those changes normally. A full source overlay is also supplied
with the handoff. No comic pages or recordings belong in the repository or APK.

## Reader and library

Import CBZ, ZIP, CBT, CB7, 7Z, CBR and RAR comics, including a ZIP containing
multiple supported archives. Organize collections, search the shelf, sort the
library, save bookmarks, and resume reading from the saved position.

Read in Page, Two Page, Scroll, Manga or Webcomic mode. Panel and bubble pop-outs
remain evidence-driven rather than page-specific stored crops. Auto Scroll is
available in the continuous reading modes with speed and playback controls.

Android full `.nthshelf` backups stream pages to the selected destination and
verify the written archive. Restore stages pages before publishing the library.
The browser/legacy route retains its existing limits. Keep a backup before major
device or browser changes.

## Offline/cache maintenance

The service worker now activates only after its shell precache succeeds. Cleanup
is restricted to Nth Shelf shell-cache names, current requests do not search
unrelated caches, and offline failures return a valid error response. These
changes do not delete IndexedDB, books, bookmarks or reading progress.

The repository checkpoint cache and the recovered-Test32 cache have separate
names so older source is not mislabeled as Test32. The post-import cache is
`nth-shelf-shell-2.79.24-frame32-baseline-r2`. The cache contract has 16 local checks.

## Native build and release discipline

This handoff does not rebuild or replace the Android Java source. The existing
Gradle metadata remains versionCode `27928`, versionName `2.79.24-test1`; no new
APK or store release is claimed. Synchronize native version fields, workflow
artifact labels, visible build labels and cache/proof identifiers when page42
qualifies for **2.79.33**, not before.

All pre-checkpoint README content is preserved in
[the historical README](docs/README-before-test32.md). Existing native source,
WASM source, older tests and release history remain in Git.
