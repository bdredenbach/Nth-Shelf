# Test71 — accepted-neighbor paper-cell completion

Base detector: user-accepted Test70 source. Remote base was Test69 checkpoint
`864df8e05266c6d03422d0480fbe65c10f638871`. This publication includes both the
accepted Test70 interrupted-gutter work and Test71, on `Test_Branch` in
`bdredenbach/Nth-Shelf`. Accuracy remains ahead of speed.

## New frame

Rise of Apocalypse #1, image index 17, reader **18/24**: the lower-middle dialogue
frame on the double-page spread, immediately right of the preserved lower-left
frame. All five speech balloons are included. This page changes from one owner
to two; the previous descriptor and selection remain unchanged.

## Implementation

`js/panels-neighbor-completion.js` is a late supplement over the existing
PanelDetect pipeline. It runs on validated nonempty contour maps, including
proof26, and obtains read-only paper-cell candidates at seed radii4 and6. The
candidate contours must match exactly across both scales, be fully enclosed and
compact, and have no inferred seed split. For speech-heavy candidates, measured
enclosed white bodies must explain the fragmented seed at both scales.

Every addition needs an exterior-connected white corridor to an already accepted
neighbor, zero overlap with prior owner pixels, and no strong unresolved internal
gutter. The supplement appends only: old geometry, descriptor contents and order
are not changed. A common normalized raster is used for conflict checks.

Proof27 method: `stable-paper-cell-with-accepted-neighbor`. Its validated contours
are authoritative. Idempotent bindings route proof27 validation, preserve its
geometry, and suppress unrelated edge-spill expansion; other proofs use the old
functions. Default reader.js, panels-geometry.js and panels-structural-grid.js
remain unchanged from Test70. The ragged detector exposes an opt-in candidate
path; its default behavior is unchanged. New proof27 owners are not recursively
used as supporting neighbors in this iteration.

There are no runtime book/title/filename/page/hash/tap lookups or stored target
coordinates. Fixture files store geometry and evidence, not comic artwork.
This is the first conservative paper-neighbor completion, not a universal
black/white/diagonal mixed-boundary assembler.

## Validation

Fresh complete-pipeline native Chromium comparison on all91 Apocalypse originals:
90 maps identical; all149 previous descriptors preserved; total149 to150. Only
issue1/index17 gains an owner. Stored detailed results are under
`qa27900/frame-accuracy/test71/`.

Actual reader gesture/selection/geometry/canvas checks passed12 new-frame touches
and5 prior-owner touches,144 inclusion checks,84 exclusion checks and55,079
strictly interior opacity samples on each new-frame touch. Zero browser errors.
The offline mobile Chromium harness uses a minimal DOM; full branding/backup
browser tests passed separately in CI. Physical Android acceptance is pending.
The dense sampler excludes points within2.5 canvas pixels of any contour segment;
an initial axial-only boundary filter was corrected without runtime changes.

Full-pipeline variants0.67x,1.25x and horizontal mirror passed the independent
inclusion/exclusion points. All62 Node contract commands, JS/SW syntax and native
Java archive tests passed locally and in the relevant CI gates. Synthetic tests
cover adjacent versus diagonal candidates, proof26 eligibility, exact old
geometry, idempotent routing and19 proof-tamper rejections. The native archive
test includes600MiB streaming under32MiB heap.

Original Wolverine/manga/Magneto artwork is unavailable here. Do not claim a fresh
312-page original-image comparison; their saved contracts remain in the suite.
Most remaining Apocalypse misses are unresolved. Rejected exploration candidates
are not delivered.

## Verified source and APK

Version2.79.71, code27999, package
`io.github.bdredenbach.nthshelf.frametest71`, label `Nth Shelf Test71`.
Shell `nth-shelf-shell-2.79.71`, map `panel-map-exp-69`, proof identity
`frame-proof-2.79.71`.

Source commit: `e4eb075d109f8a758ad4166f91c6c0680db176d3`.
Source tree: `3826a9d628932a5fc6557ca7b1f8356e44fc1ae8`.
CI run: `36349568192`; verified artifact: `10940734838`.
All detector, browser, backup, native archive, Gradle compilation, package,
version/label, exact packaged web bytes and signature gates passed.

This is a **fresh Gradle/CI APK**, not the local shell repackaging used for Test70.
All77 packaged web files match the locally frozen source exactly. The source ZIP
also matches all36 cumulative changed files. No temporary transfer files or
signing keys are in the final source tree. The authorized GitHub connector
published the verified tree after the temporary transfer job's restricted
GITHUB_TOKEN could not update workflow files; no detector tests failed.

APK bytes:3358711.
APK SHA256:`a75be512e60f7b00be8fa4203289c09828e02a3bc1400e9ea95d88a8a4383431`.
Artifact ZIP SHA256:`f61ace99d53c09a815595a38f3edafc56a35f7a8ef4a4b6c514511b4bde3ff44`.
Source ZIP SHA256:`17caa556246ff36e6dff3b3c56a7aa0f99b33b05c0b658ee93696e65f7eb1351`.
Web manifest SHA256:`1283d1943406963c2b29696d7a6bf7c93bf6f35fe9c3b97f3119bae6156b2803`.
CI apksigner v2 verification passed; downloaded artifact and APK digests were
rechecked locally. Signing is the CI debug key, not a Play Store production key.

Phone acceptance remains pending. Test the new frame and its five balloons at
reader18/24, then confirm the prior lower-left frame remains independent.
Keep Test70 installed as a comparison.

Private reproduction workspace: `/mnt/data/test71_workspace` contains frozen
Test70 source,91 original images, final map sets, reader reports, variants,
rejected trials and downloaded CI verification. Continue from this checkpoint
rather than repeating finished corpus work after an interruption.
