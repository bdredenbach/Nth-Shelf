# Test71 — accepted-neighbor paper-cell completion

## Baseline and result

Repository `bdredenbach/Nth-Shelf`, branch `Test_Branch`; last published checkpoint
`864df8e05266c6d03422d0480fbe65c10f638871` is Test69. This checkpoint includes
both the user-accepted Test70 source (previously local only) and Test71. Test70's
local APK was confirmed working by the user. This iteration's comparison baseline
is the complete supplied Test70 source, not the older repository checkout.

Test71 adds one complete frame: **Rise of Apocalypse #1, image index17, reader
18/24**, the lower-middle dialogue panel on the double-page spread, immediately
right of the previously working lower-left panel. All five speech balloons are
retained. The old lower-left frame remains an independent selection.

The final native-Chromium sweep compared every serialized descriptor on all91
supplied Apocalypse pages: 90 complete maps are identical, all149 previous owners
are preserved in their existing order, and the target page changes from1 to2.
The corpus now has150 detected owners. Counts do not establish semantic accuracy
for unresolved pages.

## Implementation

`panels-neighbor-completion.js` installs after the geometry router. It delegates
all older validation, geometry and spill behavior unchanged. It accepts existing
validated contour maps across prior proof families, including proof26. It does
not loosen or rewrite Test70's earlier supplement.

A read-only candidate interface in `panels-ragged-gutters.js` exposes independently
valid source cells before whole-map rejection. Two seed radii4/6 must agree exactly
on the complete pixel contour. Candidates must be fully enclosed, compact,
unsplit, contain measured enclosed white content, have no unresolved exterior-paper
internal divider, and overlap none of the existing owner pixels. A measured
exterior-connected white corridor must separate the candidate from an already
accepted neighbor. New owners append; originals are never trimmed or reassigned.

Proof27 is `stable-paper-cell-with-accepted-neighbor`. It retains both source
proofs, the independently accepted neighbor and measured separating rays.
Complete geometry and edge-spill suppression are bound only for valid proof27.
No title, filename, page, hash or saved-tap lookup participates in detection.
This is the first shared-neighbor paper-cell recovery, not general black/white/
diagonal boundary fusion. Ambiguous strip/sliver candidates from other pages
were rejected rather than shipped.

## Checks

- Final original-image corpus: 91/91, 90 exact unchanged maps, 149/149 descriptors
  preserved, one added owner.
- Actual Reader touchscreen path in native Chromium, mobile412x915:12 new-frame
  taps (including balloons),5 previous-frame taps;144 inclusion and84 exclusion
  alpha checks;55,079 strictly interior samples checked per new-frame tap with
  zero failures; no browser errors. Minimal offline DOM, not physical Android.
- Target variants:0.67x,1.25x and horizontal mirror each return the new owner and
  pass every independent inclusion/exclusion point. The1.25x limit keeps the
  original double-page spread within the existing24-million-pixel input cap.
- 62 local Node contract commands plus all-JS/service-worker syntax checks pass.
- Native Java streaming/cancellation/corruption tests pass, including600MiB
  archive processing with32MiB heap.
- Synthetic neighboring-cell test adds2 adjacent cells while rejecting the
  diagonal unwitnessed cell; proof26 eligibility, preserved descriptors,
  idempotent integration and19 proof-tamper rejections pass.

The historic Wolverine/manga/Magneto source artwork is unavailable in this
runtime. Do not claim a fresh312-page original-image comparison. Its saved
contract tests remain in the CI gate. The dense-reader harness excludes points
within2.5 canvas pixels of any contour segment; an initial axial-only boundary
filter was corrected without changing runtime geometry.

## Identity and publication

Version2.79.71, code27999, package
`io.github.bdredenbach.nthshelf.frametest71`, label `Nth Shelf Test71`.
Shell `nth-shelf-shell-2.79.71`, map `panel-map-exp-69`, proof identity
`frame-proof-2.79.71`. All77 packaged web files must match the frozen manifest
in `qa27900/frame-accuracy/test71/web-assets.json`.

GitHub source publication and fresh Gradle/CI build are pending. This is not the
local native-shell repackaging used for Test70. Update TEST71-VALIDATION.json
and this section only after the real build and downloaded artifact are verified.
Phone acceptance remains pending.

Private reproduction workspace: `/mnt/data/test71_workspace` contains frozen
Test70 source,91 original page images, both final map sets, target reader reports,
variants and rejected trials. Comic artwork and private signing keys are not in
the repository. Continue from this checkpoint after an interruption.
