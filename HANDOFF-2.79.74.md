# Test74 — independently enclosed paper frames

Baseline: repository `bdredenbach/Nth-Shelf`, branch `Test_Branch`, commit
`5116dab1825b1006d3cd87cdc536a8e2476fbfa3`. The published Test73 source already
contains154 selections across the91 supplied Apocalypse images; the older local
Test73 archive had153. Use the published checkpoint, not the old local APK.

## Result and targets

Five new selections on five pages, four of which previously had no detected
owner. The complete comparison retains all154 prior descriptors and their order,
leaves86 page maps identical, and increases the corpus to159 selections.

- Issue1, reader4/24, image3: top sandstorm scene on the opening spread.
- Issue1, reader12/24, image11: bottom-wide dialogue scene with three balloons.
- Issue2, reader15/23, image14: top-wide official/workers scene with two balloons.
- Issue3, reader4/23, image3: lower-middle wrapped worker and two thought balloons.
- Issue3, reader23/23, image22: upper-left sword/hand close-up and three balloons.

These are five complete panels, not five fully solved pages. Most remaining
misses are unresolved. The six-scene Test73 page, issue3 reader9/23, remains intact.

## Implementation

New module `js/panels-exterior-completion.js`, proof30,
`independent-paper-envelope-consensus`, runs after the existing shared-boundary
supplement. All older detector algorithms and validators delegate unchanged.
It reuses read-only radius4/6/8 source candidates and admits independently
validated two-source-cell maps as well as the existing larger sets.

Two seed scales must agree within0.2% of their union and0.035% of page pixels;
all disagreement stays in a three-pixel Manhattan boundary band. The output is
an intersection contour, not a bounding rectangle. At least95% of non-page-edge
boundary samples must be near white and80% near exterior-connected white, in a
three-pixel Chebyshev neighborhood. At most two physical page edges may be used.
Compactness, coverage, source evidence, potential internal white dividers and
long internal ink rails are checked. All prior owner pixels are reserved.
Accepted outputs append without trimming or replacing earlier selections.

A six-candidate prototype included a strip of neighboring sound-effect lettering
on issue2 image13. Final visual inspection rejected it. The strengthened80%
exterior-paper requirement withholds it generically; there is no page/name/hash/
tap lookup, saved target geometry, or manual crop in runtime code.

Proof snapshots and contour arrays are immutable. Validation, geometry authority
and edge-spill suppression are bound only for the new valid proof; old behavior
remains delegated. A trial chaining the new roots into more neighbors gained no
additional verified panels and is not part of this source.

## Evidence and limitations

- Original images:91 compared,86 maps identical,154/154 old descriptors preserved,
 159 total selections.
- Actual Reader path in native Chromium, mobile412x915, touchscreen:40 new-frame
 taps,18 old-frame taps across the six-scene Test73 control,320 inclusion and200
 exclusion alpha checks.293792 distinct interior and50473 exterior samples pass.
- Resized/mirrored targets:14/15 pass. Issue3 image3 at1.25x is withheld because
 source scales disagree; original,0.67x and mirror pass. Do not claim all variants.
- All64 local Node test commands and syntax checks pass; the new contract rejects
 34 proof mutations. Native Java archive tests pass, including600MiB streaming
 with a32MiB heap.
- The original Wolverine/manga/Magneto corpus was unavailable. Historical saved
 tests remain included; no fresh312-page original-artwork rerun was done.
- Reader tests use a minimal offline DOM, not physical Android. A first concurrent
 sweep timed out; the frozen run uses renewed pages and retained checkpoints.

## Identity and publication

Version2.79.74, code28002, package
`io.github.bdredenbach.nthshelf.frametest74`, label `Nth Shelf Test74`.
Cache `nth-shelf-shell-2.79.74`, map `panel-map-exp-72`, proof
`frame-proof-2.79.74`. All79 packaged web assets must match the tested bytes.
Build status is pending until a real GitHub Actions/Gradle artifact is downloaded
and verified. This is not a local repackaging plan. Update TEST74-VALIDATION.json
and this handoff after verification. Phone acceptance remains pending.

Private working evidence: `/mnt/data/test74_workspace`, including original pages,
old/new full maps, failed trials, exact Reader crops, variant records and tests.
Do not commit source comic artwork or local diagnostic screenshots.
