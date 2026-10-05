# Test75 — gradient-guided contact separation

## Resume without restarting

Base: user-confirmed Test74, repository `bdredenbach/Nth-Shelf`, branch
`Test_Branch`, commit `b17aa3a0526a8130311d363c814c2e5eb0ac115f`.
The user authorized ongoing expansion, new methods when existing detectors stall,
and a source/verified-APK/Git checkpoint for every accepted gain. Continue after
checkpoints; never count a detector output as a correct panel without crop review.

Test75 recovers the two full scenes on **Rise of Apocalypse #1, reader8/24,
image index7**. The top is the pyramid/lion/captions scene; the lower is the
throne-room scene. Crucially, the entire protruding statue head belongs to the
lower scene, not a fragment in the upper scene. Baseline Test74 has zero owners
on this page. Test75 has two. See TEST75-VALIDATION.json and the per-page corpus
comparison for the completed local results and build status.

## Algorithm

A new optional `panels-edge-guided-paper.js` pass runs after Test74. Older modules,
proofs, owner order and geometry are unchanged. It uses the existing cooperative
paper-cell raster at seed radii4/6/8. Around direct contacts between labels only,
it removes a bounded band and refloods it with a deterministic minimum-gradient-
barrier watershed. RGB Sobel edge magnitude gives the cost, not the tap location.
Only the uncertain contact band is relabeled.

A candidate must match exactly across two independent seed radii AND two window
widths (3.6% and4.1% of the shorter analysis dimension). It must have one contour,
real paper or gradient-contact evidence on its boundaries, and no strong internal
white/ink separator. Existing owner pixels are reserved and never reassigned.
Two opposing page edges are allowed; adjacent corner edges are not admitted by
this route. Serialized proof31 replays the four watershed reconstructions from
the retained numeric seed fields and sparse gradient evidence. Immutable proofs
are cached for live tap validation. It contains no book/page/hash/tap lookups.

## Reproduction / tests

Run `bash qa27900/frame-accuracy/test75/run-retained.sh`. This retains all prior
contracts and adds the new synthetic foreground-contact, prior-ownership,
internal-divider, proof-tamper and service-worker checks. The actual original
artwork, private keys and caches are not committed. The fresh full-corpus
comparison and reader results are saved in the Test75 QA directory.

The working sandbox `/mnt/data/expansion` contains `baseline74/`, `work75/`, all91
original page images, `corpus.json`, native-Chromium900-dimension raster files,
full source candidate sets, and both per-page map directories. `harness.py` runs
the exact application's detector script order and creates a new browser context
per page. It resumes at missing JSON results. `reader75.py`, `dense75.py`,
`controls75.py`, and `variants75.py` reproduce touch/crop/resize tests. A runtime
reset may require re-extracting the user archive, but the repo checkpoint and
saved contract tests do not depend on these sandbox paths.

## Rejected experiments / next work

1. A looser watershed consensus generated strips of neighboring artwork on
   issue2 image9/13, merged three upper scenes on issue3 image4, and attached a
   foreign halo fragment to its lower scene. These are NOT shipped or counted.
   Evidence: private `watershed-v3/` and `trials/ws3-*.png`.
2. Simple colored-rim hole closure merges the first two red insets on issue4
   image13. A colored/black shared-border graph is needed; do not publish the
   merged hole as a panel.
3. Candidate source radii10/12/16/20 are being explored ONLY in a private VM copy
   (`trials/large_sources.cjs`, `sources-large/`). They do not change Test75.
4. Larger adaptive contact windows and independently witnessed ink/color rails
   remain possible expansion routes. Every accepted Test75 descriptor must be
   retained exactly in the next checkpoint.

The earlier Wolverine/manga/Magneto original artwork remains unavailable. Do not
claim a fresh312-page image rerun. Counts do not establish coverage of every
actual comic panel; the inventory of remaining semantic misses is still open.

## Identity and publication

Version2.79.75, code28003, package `io.github.bdredenbach.nthshelf.frametest75`,
label `Nth Shelf Test75`, cache `nth-shelf-shell-2.79.75`, map `panel-map-exp-73`,
proof identity `frame-proof-2.79.75`. Exactly80 web assets are frozen in the QA
manifest. Build verification is pending until the real GitHub/Gradle run and
downloaded APK are checked. Do not relabel an older native shell as this build.
Physical Android acceptance is pending.
