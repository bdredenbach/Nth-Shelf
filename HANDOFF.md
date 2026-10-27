# Nth Shelf — consolidated handoff

<a id="current-state"></a>

## Start here · 27 October 2026

`Test_Branch` is the single ongoing development branch. `Android` remains unchanged as the historical accepted Android branch. Branch consolidation preserves Git history; it is **not** acceptance of every historical candidate or a new APK release.

The current runtime is the reviewed source at `9149b3a07beb30a81a6678f41ba2eb0a3e2b75cb`: recovered Test179 plus caption preservation, WASM reattachment invalidation, and retained-owner contour routing. Source173 remains the accepted detector baseline. Consolidation changes documentation and historical validation records, not runtime code.

### Verified state and limits

- Latest original-source native regression: 369 fixed taps across 93 entries / 92 sources; 365 opens and four inherited misses. Two page-20 pop-outs recover; 367 other outcomes remain unchanged. Opening is not complete-frame qualification.
- Known edge contamination, clipped artwork/captions and scene ownership remain unresolved. Four Apocalypse #3 page-4 missed taps correspond to three scenes.
- Public checks cover dispatch, kernel lifecycle and evidence validation. The full private-source regression was not repeated for this documentation consolidation.
- Browser/compositor, Worker/IndexedDB, Android rendering, memory and phone behavior require separate qualification. The preserved Test168 manual workflow has old identity/asset expectations and must be requalified before use with newer source.

### Latest research · 24–26 October 2026

These are isolated learned scene-ownership experiments, not integrated Reader improvements. Partial assistant-reviewed labels and selected visual diagnostics do not certify general comic accuracy.

1. Pilot 1 and data-expanded Pilot 2 improved some overlap/exclusion measurements but failed preservation requirements.
2. Pilot 3's stronger owned-pixel penalty recovered content but increased neighboring material; rejected at development checks.
3. A tap diagnostic found that taps affect selections, but different taps in one scene remain inconsistent.
4. Pilot 4's same-scene agreement/neighbor-separation objective was insufficient: stability 38.70% → 39.24%, with retention regressions; joint passes remained 0/12. No integration.
5. Training-fit inspection found only 3/33 training scenes passing the strict numerical screen (all Wuffle), versus 0/12 development scenes. This does not prove a model-capacity limit.
6. A single-page Doré sanity run improved original-tap precision 43.23% → 89.58% and agreement 45.35% → 80.72%, but new same-page taps remained unreliable; strict passes 0/8. Same-page performance is not unseen-page generalization.
7. The subsequent supervised click-coverage attempt used 12 training taps per scene and 24 separate source-fixed probes, with an unchanged 600-update budget. It hit the 1,800-second loop limit after **567 logged updates**. No final adapter, resumable checkpoint or evaluation exists. This is an incomplete attempt, not evidence against the approach. No retry has started.

### Next action and recovery

The proposed retry keeps the exact base model, loss, parameters, seed, clicks, schedule and 600 updates, but explicitly revises the wall-clock allowance and adds periodic model/optimizer/RNG/step checkpoints. It requires a new start from the original base because the aborted run has no checkpoint. Retry approval remains pending; branch cleanup does not authorize training.

Keep source/artwork, private original-comic coordinates, receipts and signing data outside public Git. Research reports, adapters and reproducibility packages are saved separately; they are not dependencies of this Reader checkout. Do not substitute old runtime counts for new test evidence or claim learned adapters fixed frames.

For runtime changes: freeze controls and intended differences, inspect native artwork/captions/exclusions, rerun appropriate original-source regression and then qualify platform behavior. Do not relax source guards to make a popup appear.

### Navigation

- [Current README](README.md)
- [Chronological release history](RELEASE-HISTORY.md)
- [Branch and handoff preservation manifest](docs/branch-consolidation-2026-10-27.json)
- [Public native evidence gate](qa27900/native-regression-gate/README.md)

## Historical handoff archive

The following 139 original handoff documents are consolidated below in filename/version order. **Everything below is historical.** Statements such as “current,” “next,” approval, pending tests, or branch names apply to that checkpoint, not today's state. The summary above takes precedence. Original text is preserved except redirected/rebased Markdown links and trailing-space cleanup; source hashes and Git blob identities are recorded in the manifest. Earlier alternative text remains available through Git history.

- [HANDOFF-2.79.33.md](#archive-handoff-2-79-33-md)
- [HANDOFF-2.79.34.md](#archive-handoff-2-79-34-md)
- [HANDOFF-2.79.35.md](#archive-handoff-2-79-35-md)
- [HANDOFF-2.79.36.md](#archive-handoff-2-79-36-md)
- [HANDOFF-2.79.37.md](#archive-handoff-2-79-37-md)
- [HANDOFF-2.79.38.md](#archive-handoff-2-79-38-md)
- [HANDOFF-2.79.39.md](#archive-handoff-2-79-39-md)
- [HANDOFF-2.79.40.md](#archive-handoff-2-79-40-md)
- [HANDOFF-2.79.41.md](#archive-handoff-2-79-41-md)
- [HANDOFF-2.79.42.md](#archive-handoff-2-79-42-md)
- [HANDOFF-2.79.43.md](#archive-handoff-2-79-43-md)
- [HANDOFF-2.79.44.md](#archive-handoff-2-79-44-md)
- [HANDOFF-2.79.45.md](#archive-handoff-2-79-45-md)
- [HANDOFF-2.79.46.md](#archive-handoff-2-79-46-md)
- [HANDOFF-2.79.47.md](#archive-handoff-2-79-47-md)
- [HANDOFF-2.79.48.md](#archive-handoff-2-79-48-md)
- [HANDOFF-2.79.49.md](#archive-handoff-2-79-49-md)
- [HANDOFF-2.79.50.md](#archive-handoff-2-79-50-md)
- [HANDOFF-2.79.51.md](#archive-handoff-2-79-51-md)
- [HANDOFF-2.79.52.md](#archive-handoff-2-79-52-md)
- [HANDOFF-2.79.53.md](#archive-handoff-2-79-53-md)
- [HANDOFF-2.79.54.md](#archive-handoff-2-79-54-md)
- [HANDOFF-2.79.55.md](#archive-handoff-2-79-55-md)
- [HANDOFF-2.79.56.md](#archive-handoff-2-79-56-md)
- [HANDOFF-2.79.57.md](#archive-handoff-2-79-57-md)
- [HANDOFF-2.79.58.md](#archive-handoff-2-79-58-md)
- [HANDOFF-2.79.59.md](#archive-handoff-2-79-59-md)
- [HANDOFF-2.79.60.md](#archive-handoff-2-79-60-md)
- [HANDOFF-2.79.61.md](#archive-handoff-2-79-61-md)
- [HANDOFF-2.79.62.md](#archive-handoff-2-79-62-md)
- [HANDOFF-2.79.63.md](#archive-handoff-2-79-63-md)
- [HANDOFF-2.79.64.md](#archive-handoff-2-79-64-md)
- [HANDOFF-2.79.65.md](#archive-handoff-2-79-65-md)
- [HANDOFF-2.79.66.md](#archive-handoff-2-79-66-md)
- [HANDOFF-2.79.67.md](#archive-handoff-2-79-67-md)
- [HANDOFF-2.79.68.md](#archive-handoff-2-79-68-md)
- [HANDOFF-2.79.69.md](#archive-handoff-2-79-69-md)
- [HANDOFF-2.79.70.md](#archive-handoff-2-79-70-md)
- [HANDOFF-2.79.71.md](#archive-handoff-2-79-71-md)
- [HANDOFF-2.79.73.md](#archive-handoff-2-79-73-md)
- [HANDOFF-2.79.74.md](#archive-handoff-2-79-74-md)
- [HANDOFF-2.79.75.md](#archive-handoff-2-79-75-md)
- [HANDOFF-2.79.76.md](#archive-handoff-2-79-76-md)
- [HANDOFF-2.79.77.md](#archive-handoff-2-79-77-md)
- [HANDOFF-2.79.78.md](#archive-handoff-2-79-78-md)
- [HANDOFF-2.79.79.md](#archive-handoff-2-79-79-md)
- [HANDOFF-2.79.80.md](#archive-handoff-2-79-80-md)
- [HANDOFF-2.79.82.md](#archive-handoff-2-79-82-md)
- [HANDOFF-2.79.83.md](#archive-handoff-2-79-83-md)
- [HANDOFF-2.79.84.md](#archive-handoff-2-79-84-md)
- [HANDOFF-2.79.88.md](#archive-handoff-2-79-88-md)
- [HANDOFF-2.79.89.md](#archive-handoff-2-79-89-md)
- [HANDOFF-2.79.90.md](#archive-handoff-2-79-90-md)
- [HANDOFF-2.79.91.md](#archive-handoff-2-79-91-md)
- [HANDOFF-2.79.92.md](#archive-handoff-2-79-92-md)
- [HANDOFF-2.79.93.md](#archive-handoff-2-79-93-md)
- [HANDOFF-2.79.94.md](#archive-handoff-2-79-94-md)
- [HANDOFF-2.79.95.md](#archive-handoff-2-79-95-md)
- [HANDOFF-2.79.96.md](#archive-handoff-2-79-96-md)
- [HANDOFF-2.79.97.md](#archive-handoff-2-79-97-md)
- [HANDOFF-2.79.98.md](#archive-handoff-2-79-98-md)
- [HANDOFF-2.79.99.md](#archive-handoff-2-79-99-md)
- [HANDOFF-2.79.100.md](#archive-handoff-2-79-100-md)
- [HANDOFF-2.79.101.md](#archive-handoff-2-79-101-md)
- [HANDOFF-2.79.102.md](#archive-handoff-2-79-102-md)
- [HANDOFF-2.79.103.md](#archive-handoff-2-79-103-md)
- [HANDOFF-2.79.104.md](#archive-handoff-2-79-104-md)
- [HANDOFF-2.79.105.md](#archive-handoff-2-79-105-md)
- [HANDOFF-2.79.106.md](#archive-handoff-2-79-106-md)
- [HANDOFF-2.79.107.md](#archive-handoff-2-79-107-md)
- [HANDOFF-2.79.108.md](#archive-handoff-2-79-108-md)
- [HANDOFF-2.79.109.md](#archive-handoff-2-79-109-md)
- [HANDOFF-2.79.110.md](#archive-handoff-2-79-110-md)
- [HANDOFF-2.79.111.md](#archive-handoff-2-79-111-md)
- [HANDOFF-2.79.112.md](#archive-handoff-2-79-112-md)
- [HANDOFF-2.79.113.md](#archive-handoff-2-79-113-md)
- [HANDOFF-2.79.114.md](#archive-handoff-2-79-114-md)
- [HANDOFF-2.79.115.md](#archive-handoff-2-79-115-md)
- [HANDOFF-2.79.116.md](#archive-handoff-2-79-116-md)
- [HANDOFF-2.79.117.md](#archive-handoff-2-79-117-md)
- [HANDOFF-2.79.118.md](#archive-handoff-2-79-118-md)
- [HANDOFF-2.79.119.md](#archive-handoff-2-79-119-md)
- [HANDOFF-2.79.120.md](#archive-handoff-2-79-120-md)
- [HANDOFF-2.79.121.md](#archive-handoff-2-79-121-md)
- [HANDOFF-2.79.122.md](#archive-handoff-2-79-122-md)
- [HANDOFF-2.79.123.md](#archive-handoff-2-79-123-md)
- [HANDOFF-2.79.124.md](#archive-handoff-2-79-124-md)
- [HANDOFF-2.79.125.md](#archive-handoff-2-79-125-md)
- [HANDOFF-2.79.126.md](#archive-handoff-2-79-126-md)
- [HANDOFF-2.79.127.md](#archive-handoff-2-79-127-md)
- [HANDOFF-2.79.128.md](#archive-handoff-2-79-128-md)
- [HANDOFF-2.79.129.md](#archive-handoff-2-79-129-md)
- [HANDOFF-2.79.130.md](#archive-handoff-2-79-130-md)
- [HANDOFF-2.79.131.md](#archive-handoff-2-79-131-md)
- [HANDOFF-2.79.132.md](#archive-handoff-2-79-132-md)
- [HANDOFF-2.79.133.md](#archive-handoff-2-79-133-md)
- [HANDOFF-2.79.134.md](#archive-handoff-2-79-134-md)
- [HANDOFF-2.79.135.md](#archive-handoff-2-79-135-md)
- [HANDOFF-2.79.136.md](#archive-handoff-2-79-136-md)
- [HANDOFF-2.79.137.md](#archive-handoff-2-79-137-md)
- [HANDOFF-2.79.138.md](#archive-handoff-2-79-138-md)
- [HANDOFF-2.79.139.md](#archive-handoff-2-79-139-md)
- [HANDOFF-2.79.140.md](#archive-handoff-2-79-140-md)
- [HANDOFF-2.79.141.md](#archive-handoff-2-79-141-md)
- [HANDOFF-2.79.142.md](#archive-handoff-2-79-142-md)
- [HANDOFF-2.79.143.md](#archive-handoff-2-79-143-md)
- [HANDOFF-2.79.144.md](#archive-handoff-2-79-144-md)
- [HANDOFF-2.79.145.md](#archive-handoff-2-79-145-md)
- [HANDOFF-2.79.146.md](#archive-handoff-2-79-146-md)
- [HANDOFF-2.79.147.md](#archive-handoff-2-79-147-md)
- [HANDOFF-2.79.148.md](#archive-handoff-2-79-148-md)
- [HANDOFF-2.79.149.md](#archive-handoff-2-79-149-md)
- [HANDOFF-2.79.150.md](#archive-handoff-2-79-150-md)
- [HANDOFF-2.79.151.md](#archive-handoff-2-79-151-md)
- [HANDOFF-2.79.152.md](#archive-handoff-2-79-152-md)
- [HANDOFF-2.79.153.md](#archive-handoff-2-79-153-md)
- [HANDOFF-2.79.154.md](#archive-handoff-2-79-154-md)
- [HANDOFF-2.79.155.md](#archive-handoff-2-79-155-md)
- [HANDOFF-2.79.156.md](#archive-handoff-2-79-156-md)
- [HANDOFF-2.79.157.md](#archive-handoff-2-79-157-md)
- [HANDOFF-2.79.158.md](#archive-handoff-2-79-158-md)
- [HANDOFF-2.79.159.md](#archive-handoff-2-79-159-md)
- [HANDOFF-2.79.160.md](#archive-handoff-2-79-160-md)
- [HANDOFF-2.79.161.md](#archive-handoff-2-79-161-md)
- [HANDOFF-2.79.162.md](#archive-handoff-2-79-162-md)
- [HANDOFF-2.79.163.md](#archive-handoff-2-79-163-md)
- [HANDOFF-2.79.164.md](#archive-handoff-2-79-164-md)
- [HANDOFF-2.79.165.md](#archive-handoff-2-79-165-md)
- [HANDOFF-2.79.166.md](#archive-handoff-2-79-166-md)
- [HANDOFF-2.79.167.md](#archive-handoff-2-79-167-md)
- [HANDOFF-2.79.168-DELIVERY.md](#archive-handoff-2-79-168-delivery-md)
- [HANDOFF-2.79.168.md](#archive-handoff-2-79-168-md)
- [HANDOFF-2.79.179.md](#archive-handoff-2-79-179-md)
- [HANDOFF-APOCALYPSE-AUDIT.md](#archive-handoff-apocalypse-audit-md)
- [HANDOFF-APOCALYPSE-SINGLE-DUAL.md](#archive-handoff-apocalypse-single-dual-md)
- [HANDOFF-APOCALYPSE-TEST95-REGRESSION.md](#archive-handoff-apocalypse-test95-regression-md)
- [HANDOFF-DETECTOR-SOURCE173.md](#archive-handoff-detector-source173-md)
- [HANDOFF-DETECTOR-SOURCE176.md](#archive-handoff-detector-source176-md)
- [HANDOFF-Test32.md](#archive-handoff-test32-md)

<a id="archive-handoff-2-79-33-md"></a>

<details>
<summary>HANDOFF-2.79.33.md — historical checkpoint</summary>

# Nth Shelf — 2.79.33 page42 candidate handoff

## Completed locally

Recovered Test32 web baseline retained, seven page42 curved panels implemented,
README/cache/proof/native metadata synchronized, regression evidence saved.
See `qa27900/frame-accuracy/test33/RESULTS.md` and machine-readable companion
reports. Keep every prior accepted descriptor, original test and historical
report. Keep page41's retained old fallback rather than deleting it to improve
a count. Do not retune old detectors.

## Pending, not to be confused with completed work

- Remote source push: GitHub branch last read at 015bacff2d4c8d051c7232c3e6b180deedcc67f8.
  Its previous checkpoint commit is real, but this source overlay has NOT been
  pushed. All 48 exposed GitHub actions here were reads; the permitted direct Git
  clone failed DNS. User has authorized uploading; do not ask them to re-upload
  already supplied files. Use an actual write-enabled connector/authorized CLI
  when available, re-read the target head, preserve newer work, and push only
  Test_Branch. Do not claim a push based on a local ZIP or patch.
- Android build/signature/install: not executed. Updated native metadata is
  2.79.33 / 27961. Existing base package remains io.github.bdredenbach.nthshelf.
  The input APK was separate frametest32 / 27960; never tell the user that a base
  package build automatically inherits the test app's library.
- Phone acceptance: ask for the seven page42 scenes, especially the crossing
  dialogue in scene 3, large lower-left scene 5, and projecting lettering in 7,
  once an actual installable build is delivered.
- Pages43–44: still open. Do not call this a fix for them.

## Important guardrails

The route is pixel-derived and empty-map-only. Seven is the observed count on
this fixture, not a runtime page-specific hardcode. The apparent eighth divider
was highlighted artwork, not a real border. The new proof must survive Reader
hit-testing, geometry ownership and focused canvas metadata. Missing proof
means abstain; never render a guessed rectangle around a curved panel.

The historical Test32 total301 versus fresh 298 remains unresolved. All 298
fresh old descriptors, not an invented reconstructed 301, are the exact
regression baseline for this change. Private screenshots/comic pages must stay
out of the repository.

The one-time baseline import completion marker already exists in this project;
do not rerun that importer over the page42 edits. Old `HANDOFF-Test32.md` and
old READMEs are historical records, superseded by this file for current status.


</details>

<a id="archive-handoff-2-79-34-md"></a>

<details>
<summary>HANDOFF-2.79.34.md — historical checkpoint</summary>

# Nth Shelf 2.79.34 / Test34 handoff

Test34 generalizes the page42 curved/pale-rim detector into a broader empty-map
visual family and adds five page43 identities without a page-specific runtime
map. Page42 remains byte-for-byte identical to its Test33 descriptor capture.
All established detector routes keep priority; the generalized route runs only
when the map would otherwise be empty.

Local recorded evidence is in `qa27900/frame-accuracy/test34/RESULTS.md`. Page44
remains pending. The debug Android package is intentionally separate:
`io.github.bdredenbach.nthshelf.frametest34`, version 2.79.34 / code 27962, label
`Nth Shelf Test34`. Keep Test32 and Test33 installed while testing.


</details>

<a id="archive-handoff-2-79-35-md"></a>

<details>
<summary>HANDOFF-2.79.35.md — historical checkpoint</summary>

# Nth Shelf 2.79.35 / Test35 handoff

Test35 adds an empty-map-only edge-connected matte/paper cell family. It fixes
reader page44 with seven contour panels and, during the remaining-zero-page sweep,
also produces four panels each on reader pages58, 70 and71. Pages42 and43 remain
byte-for-byte identical to the Test34 detector output.

The route contains no comic/page identity keys. It proves exterior matte/paper,
connected artwork, separators and final contours from pixels. It withholds maps
with poor coverage; reader page65 therefore stays on its existing interactive
fallback rather than receiving an incomplete two-panel background map.

Recorded browser evidence is in `qa27900/frame-accuracy/test35/RESULTS.md`.
Page44 has 35/35 ownership anchors, 7/7 actual Reader/PageDeck touch renders and
zero differing pixels across 6,480,484 compared positions. Phone acceptance is
pending.

Android debug identity: `io.github.bdredenbach.nthshelf.frametest35`, version
2.79.35 / code 27963, label `Nth Shelf Test35`. Keep earlier test APKs installed
while testing.


</details>

<a id="archive-handoff-2-79-36-md"></a>

<details>
<summary>HANDOFF-2.79.36.md — historical checkpoint</summary>

# Nth Shelf 2.79.36 / Test36

Test36 preserves bounded foreground lettering that visibly crosses a proven panel frame into a flat page-edge margin. The frame itself is not moved. The first target is Reader page13 from 180928_2.mp4: the bottom-right BADOOOM projection.

Local private-fixture checks: 2 owned bottom components on the target, 0 on the other three page13 panels, 9/9 small frame-position perturbations reproduce ownership, and surrounding matte remains transparent/dim in the render check. Comic artwork is not committed.

Android debug identity: io.github.bdredenbach.nthshelf.frametest36, version 2.79.36 / code 27964, label Nth Shelf Test36. After page13 phone acceptance, continue Video2 at Reader page14.


</details>

<a id="archive-handoff-2-79-37-md"></a>

<details>
<summary>HANDOFF-2.79.37.md — historical checkpoint</summary>

# Nth Shelf 2.79.37 / Test37 handoff

Test37 fixes the directly reported Reader page23 multi-panel merge. The page has six real panels but Test36 publishes only two page-wide identities, forcing four cells through tap-dependent V100 rescue.

The new tap-independent structural-grid route proves the dark-rail/gutter guillotine map once, rejects uniform exterior matte leaves, retains the existing upper-left rim contour and bottom bleed strip byte-for-byte, and adds four missing orthogonal cells in reading order. Runtime routing requires exactly one validated rim-frame plus one validated bleed-strip-frame; no comic/page identity keys are used.

Local Reader checks: 6 page identities, 30/30 center/left/right/north/south ownership points, 20/20 renders across the four new cells, zero page errors. Page13 Test36 is phone-accepted.

Android debug identity: io.github.bdredenbach.nthshelf.frametest37, version 2.79.37 / code 27965, label Nth Shelf Test37. Page23 phone acceptance is pending.


</details>

<a id="archive-handoff-2-79-38-md"></a>

<details>
<summary>HANDOFF-2.79.38.md — historical checkpoint</summary>

# Nth Shelf 2.79.38 / Test38 handoff

Test38 targets Reader page27 after page23 phone acceptance. Test37 leaves the lower three scenes to tap-dependent rescue, producing four different skewed pop-outs.

The structural-grid module now recognizes a bounded occluded-bottom-tier topology: one already separated left cell plus a merged middle/right region, corroborated by two local-island anchors and one matte-neighbor anchor. A partially occluded vertical seam and a terminal horizontal cap split the middle panel orthogonally while the remainder becomes one larger six-vertex right outline. The right owner includes the foreground region below the middle panel. No page/comic identity keys are used.

Local Reader checks: 8 page-wide identities total; bottom tier exactly 3 owners; 11/11 north/center/south/left/right taps across the lower tier correct; an additional foreground-under-middle tap selects the large right scene; zero page errors. Page23 descriptors remain exact.

Android debug identity: `io.github.bdredenbach.nthshelf.frametest38`, version 2.79.38 / code 27966, label `Nth Shelf Test38`. Page27 phone acceptance is pending.


</details>

<a id="archive-handoff-2-79-39-md"></a>

<details>
<summary>HANDOFF-2.79.39.md — historical checkpoint</summary>

# Nth Shelf 2.79.39 / Test39 handoff

Test39 targets Reader page28 after page27 phone acceptance. The old map stops at two coarse stacked slabs; the new nested structural completion requires six proven leaf panels: two on top, one full-width middle strip, and three bottom columns. A dark artwork rail inside the narrow bottom-middle cell is rejected as a real separator when its orphan branch is still textured artwork and the whole parent cell independently validates.

Local checks: page28 2→6 owners; 30/30 directional Reader taps correct; zero page errors; page23 and page27 exact; all other preserved two-entry pages exact in a targeted sweep.

Android debug identity: `io.github.bdredenbach.nthshelf.frametest39`, version 2.79.39 / code 27967, label `Nth Shelf Test39`. Page28 phone acceptance is pending.


</details>

<a id="archive-handoff-2-79-40-md"></a>

<details>
<summary>HANDOFF-2.79.40.md — historical checkpoint</summary>

# Nth Shelf 2.79.40 / Test40 handoff

Test40 targets Reader page32. Test39 has one correct lower-left panel but merges the remaining lower three frames. The new structural-grid route proves the tall eye inset using two long vertical edge rails plus independent top/bottom caps, then replaces only the merged parent with left scene / inset / right scene owners.

Local checks: page32 6→8 page-wide identities; 15/15 directional ownership points across the three new owners; zero page errors; full 74-page applicability sweep shows page32 is the only page eligible for the new route. Test37–39 contracts remain green.

Android debug identity: `io.github.bdredenbach.nthshelf.frametest40`, version 2.79.40 / code 27968, label `Nth Shelf Test40`. Page32 phone acceptance is pending.


</details>

<a id="archive-handoff-2-79-41-md"></a>

<details>
<summary>HANDOFF-2.79.41.md — historical checkpoint</summary>

# Nth Shelf 2.79.41 / Test41 handoff

Test41 targets Reader page33. Test40 stops at three coarse stacked owners; the lower one hides five vertical scenes above one full-width terminal panel.

The new structural completion proves four sustained dark vertical rails across the entire middle bank, then publishes five orthogonal bank owners plus the independent terminal owner. This bypasses the tap-dependent giant lower crop while preserving the already-correct top two wide panels. Reader focus metadata now carries structural proof data through zoom.

Local checks: page33 3→8 owners; 40/40 ownership points; 30/30 actual touchscreen pop-outs across the repaired lower six; zero page errors. A targeted sweep of every remaining eligible three-entry page found only page33 qualifies. Test37–40 contracts remain green.

Android debug identity: `io.github.bdredenbach.nthshelf.frametest41`, version 2.79.41 / code 27969, label `Nth Shelf Test41`. Page33 phone acceptance is pending.


</details>

<a id="archive-handoff-2-79-42-md"></a>

<details>
<summary>HANDOFF-2.79.42.md — historical checkpoint</summary>

# Nth Shelf 2.79.42 / Test42 handoff

Test42 targets Reader page35. Test41 collapses almost the entire page into one owner and falsely splits the final hotel panel into three pieces. Test42 reconstructs the seven-frame page from sustained frame rails and a measured curved shared seam.

Local checks: page35 4→7 page-wide owners; 35/35 directional ownership points; all seven proofs survive geometry routing. A targeted sweep of all eight preserved four-entry pages finds only page35 eligible. No page/comic identity keys are used.

Android debug identity: `io.github.bdredenbach.nthshelf.frametest42`, version 2.79.42 / code 27970, label `Nth Shelf Test42`. Page35 phone acceptance is pending.


</details>

<a id="archive-handoff-2-79-43-md"></a>

<details>
<summary>HANDOFF-2.79.43.md — historical checkpoint</summary>

# Nth Shelf 2.79.43 / Test43 handoff

Test43 responds to the supplied Page-mode video. Forward turns started from the upper-right or lower-right corner were still visually collapsing into a vertical center-like hinge when the finger traveled mostly horizontally.

`NthPageDeck.cornerFurlY()` now supplies a mirrored minimum inward vertical arc: bottom-right rises, top-right descends. The user's real Y motion is never reduced; the helper only adds the missing corner lift when the gesture would otherwise be nearly horizontal. Because the arc follows 4p(1-p), it starts and finishes flat and peaks near mid-turn.

The Page tutorial now describes those exact two motions and renders two live corner boxes over the comic: upper-right ↙ / TOP · CURL DOWN and lower-right ↖ / BOTTOM · CURL UP. Its old single lower-right spotlight is removed for this step.

The Test43 contract verifies mirrored geometry, diagonal crease normals, preservation of stronger finger pulls, and the tutorial copy/cues. Test42 frame behavior remains packaged unchanged; page35 phone acceptance remains a separate pending gate.

Android debug identity: `io.github.bdredenbach.nthshelf.frametest43`, version 2.79.43 / code 27971, label `Nth Shelf Test43`.


</details>

<a id="archive-handoff-2-79-44-md"></a>

<details>
<summary>HANDOFF-2.79.44.md — historical checkpoint</summary>

# Nth Shelf 2.79.44 / Test44 handoff

The follow-up phone video showed Test43's furl motion is available, but the touch start areas are vertically misplaced. The upper-right hot zone sits too high and the lower-right hot zone too low, forcing the user toward the mathematical page corners instead of the natural inside-paper grab points.

Test44 introduces one shared `PageMode.cornerZoneMetrics(width,height)` calculation. On the recorded portrait page it yields a 96 px grab box with roughly a 47 px vertical inset: the top box starts about 47 px below the paper top and the bottom box ends about 47 px above the paper bottom. Forward grabs are constrained to the visible paper width. The left-side reverse corner behavior is deliberately unchanged.

The Reader tutorial uses that same function to position its red upper/lower cues, so the boxes on screen are now the exact touch targets. Test43's mirrored furl geometry is retained unchanged.

The Test44 contract rejects the extreme top/bottom right corners, accepts the two inset forward zones, rejects touches outside the paper right edge, and verifies the legacy left reverse corner still works.

Android debug identity: `io.github.bdredenbach.nthshelf.frametest44`, version 2.79.44 / code 27972, label `Nth Shelf Test44`.


## Phone acceptance update

The user confirmed both the corner furl and the inset upper/lower live grab zones work on the phone. Test44 corner behavior is accepted.


</details>

<a id="archive-handoff-2-79-45-md"></a>

<details>
<summary>HANDOFF-2.79.45.md — historical checkpoint</summary>

# Nth Shelf 2.79.45 / Test45 handoff

Test45 targets Reader page36. The existing matte detector over-segments the page into seven owners by splitting one real middle scene into hallway and Logan fragments. Test45 reconstructs six visible owners around the independently proved sheriff inset and gives the middle/bottom tier one smooth shared seam.

Local checks: page36 7→6 owners; 30/30 directional ownership/geometry checks; only page36 qualifies among all five seven-cell matte pages in the 74-page fixture. Test44 corner-furl/hot-zone behavior and page35 are phone-accepted.

Android debug identity: `io.github.bdredenbach.nthshelf.frametest45`, version 2.79.45 / code 27973, label `Nth Shelf Test45`. Page36 phone acceptance is pending.


## Phone rejection

Test45 was rejected on-device. Owner count was correct, geometry was not. Use Test46 or later for page36.


</details>

<a id="archive-handoff-2-79-46-md"></a>

<details>
<summary>HANDOFF-2.79.46.md — historical checkpoint</summary>

# Nth Shelf 2.79.46 / Test46 handoff

Test45 got page36's owner count right but its reconstructed polygons were rejected on the phone. The user's marked screenshot confirms six owners and shows the exact semantic grouping.

Test46 preserves the existing proven frame envelopes where they are already good. It adds one measured vertical step rail beside the sheriff inset, then constructs the middle scene so its bottom edge is shared exactly with the proved top edges of the two bottom panels. That eliminates Test45's black cutouts and makes the sheriff/middle/bottom ownership boundaries agree.

Retained Test37–45 contracts plus the new Test46 proof contract pass locally. Test45 remains recorded as phone-rejected. Android debug identity: `io.github.bdredenbach.nthshelf.frametest46`, version 2.79.46 / code 27974, label `Nth Shelf Test46`. Page36 phone acceptance is pending.


</details>

<a id="archive-handoff-2-79-47-md"></a>

<details>
<summary>HANDOFF-2.79.47.md — historical checkpoint</summary>

# Nth Shelf Test47 — recovery checkpoint, 2026-09-26

Current task: Wolverine 1000 Reader page36, six user-marked frames. Earlier page queues are historical; do not resume page19 in place of this task. The prior chats were deleted. Recover state from this file and the Test47 reports.

Baseline Test46: f66a4311aa90829f8f206479c8bb57f06eef4d44, identical to the user's supplied ZIP. Actual Reader returned two proven frames, so the old seven-cell completion was inactive. The user's video showed the resulting fallback mistakes.

Test47 retains the exact shower and top-right descriptors and appends four independently bounded outlines. The middle scene owns the entire hallway plus Logan, including his head projecting into the sheriff inset. The sheriff remains separate with both balloons; bottom-right room excludes the shower. See qa27900/frame-accuracy/test47/RESULTS.md for evidence and reproduction.

Local results: 35 touch/ownership/crop checks pass, zero page errors, three erased-border negatives reject, and all 74 comic pages compared to baseline. Only page36 changes from two to six; all original descriptors remain exact. These are browser results, not phone acceptance.

Android identity: 2.79.47, code27975, io.github.bdredenbach.nthshelf.frametest47, label Nth Shelf Test47. Install separately and import the comic. The workflow verifies signature, package identity, and every packaged web asset against its source commit. Its BUILD.json records the exact delivered source and APK digest.

Next action after delivery: ask the user to test all six page36 frames, especially sheriff versus the whole middle scene, foreground head, and independent bottom pair. Do not mark this page phone-confirmed until the user confirms. Retain older page35/Test44 phone acceptance as recorded in Test46 handoff. Do not commit comic artwork or the user's video.


</details>

<a id="archive-handoff-2-79-48-md"></a>

<details>
<summary>HANDOFF-2.79.48.md — historical checkpoint</summary>

# Nth Shelf Test48 — recovery checkpoint, 2026-09-26

Current task: Wolverine 1000 Reader page43, highlighted lower-right area of the middle slanted K-KRASH scene. Center tap already produced the complete frame; the corner produced a partial crop. User attached 209611.png, 209613.png and 209618.jpg. Test47 baseline: b6d60c8b3754d86f5ec0444fdc3ef4c04b18282a.

Root cause: a one-analysis-pixel exterior-color connection through an interrupted pale rim removed dark artwork from the known middle frame mask. Corner taps fell into the legacy crop search. A bounded repair now restores unassigned interior pixels using the measured rim neck and opposing pale arms. It preserves all previously assigned pixels, all four neighboring descriptors and all other pages. No gesture or Reader change.

Verification: 32 real Reader touchscreen/crop checks pass, zero page errors; full 74-page comparison changes only page43's middle frame. Test47's six page36 frames remain exact. Wider rim opening and missing pale evidence both reject repair. See qa27900/frame-accuracy/test48/RESULTS.md and saved reports.

Android candidate: 2.79.48, versionCode27976, package io.github.bdredenbach.nthshelf.frametest48, label Nth Shelf Test48. Install separately and import the comic. Workflow BUILD.json records commit, APK digest and all packaged web files.

Next: user tests corner versus center of page43's slanted middle scene, then its four neighbors. Phone acceptance is pending. Do not mark page36 explicitly phone-confirmed solely because the user moved on to page43. Earlier handoffs/queue entries are historical, not new assignments.


</details>

<a id="archive-handoff-2-79-49-md"></a>

<details>
<summary>HANDOFF-2.79.49.md — historical checkpoint</summary>

# Nth Shelf Test49 — page44 nine-point recovery checkpoint

Date: 2026-09-26. User sent 209627.mp4 and specifically requested nine taps in every frame on Reader page44. Baseline Test48: 14faf79ae20d7ec654197ea461999db42333ec8c. Work only in bdredenbach/Nth-Shelf Test_Branch.

Page44 has eight visible scenes, not the prior detector's seven. Missing: narrow red-background profile between SHLIK and BLAM. Incomplete matte masks also made taps elsewhere fall into inconsistent legacy crops. Test49 measures whole cells from a pale rim network, uniquely reconciles every prior owner, and preserves existing owned pixels. SHLIK and the upper lower-strip descriptors remain exact. An independent closed pale envelope restores the claw strip's lower black border, caught during visual review after initial point checks.

QA: all eight frames receive nine real browser touchscreen taps (72 total), with ownership, focused contours and opaque sample checks. All eight crops visually reviewed. Full 74-page comparison against Test48: only page44 changes. Page36's six frames and page43's repair remain exact. Negative images and proof mutations reject. Results and reproduction: qa27900/frame-accuracy/test49/RESULTS.md.

Android candidate: 2.79.49, code27977, io.github.bdredenbach.nthshelf.frametest49, label Nth Shelf Test49. Install separately and import the comic. BUILD.json in the workflow artifact ties the APK digest and exact web assets to the source commit.

Update 2026-09-26: PHONE FAILED. User screenshots 209637–209643 show partial masks and crops spanning neighbors. See HANDOFF-2.79.50.md for the resampling reproduction and follow-up. The following next step is historical: await phone testing of page44, especially both narrow middle strips and the claw/bottom strips. Do not mark phone acceptance until explicit confirmation. Moving on from earlier pages is not explicit confirmation of those builds. Earlier handoffs remain historical.


</details>

<a id="archive-handoff-2-79-50-md"></a>

<details>
<summary>HANDOFF-2.79.50.md — historical checkpoint</summary>

# Test50 recovery checkpoint — page44 device mismatch

2026-09-26. User rejected Test49 with seven screenshots (209637–209643): partial BLAM/bottom artwork and tap-dependent crops spanning several scenes. Treat Test49 as phone-failed despite its 72 Chromium checks. Resume from this file if interrupted. Work remains on Test_Branch; base 4ab6b6c.

Reproduced: original Chromium scaled JPEG -> 7 matte cells -> 8 completed cells; @napi-rs/canvas low/medium/high and Sharp rasterizations -> 7 cells -> completion rejected. SHLIK's eroded core drops below the minimum; high also leaves a joined pair, Sharp has a mixed baseline region. No phone debug trace yet: these reproduce the failure mechanism, not a claim of exact device diagnosis.

Candidate: for multi-cell dark matte maps, read native-resolution pixels and explicitly bilinear sample once. Recompute and complete on that same raster. A narrow independently proved old cell may survive erosion as a retained rim witness only when its perimeter still matches the pale rim and it scarcely overlaps other cores. Existing per-cell proof checks stay active. Other detector routes unchanged. No filename/page-specific runtime input.

Validation complete: 216 real Reader touches (72 default, 72 with low scaled-raster injection, 72 with high injection); the two injected runs each pass 8,335 manually placed dense artwork-opacity samples. Four full detector resampling replays return byte-identical eight-frame maps; Test49 returns the incomplete seven under each. All eight rendered crops visually inspected. Full 74-page comparison changes only page44. Native and direct routes reject erased divider, transparency and flat matte. Explicit resampler and retained proof mutation tests pass.

Candidate identity: 2.79.50, code27978, io.github.bdredenbach.nthshelf.frametest50, Nth Shelf Test50. Source/test reports are in qa27900/frame-accuracy/test50. Remaining: commit/push to Test_Branch, let Android CI gates run, verify downloaded BUILD.json/APK digest and all web assets, save/deliver APK. Phone acceptance remains pending. The exact Android canvas output was not captured; do not describe simulated resampling as a phone test.

Checkpoint after implementation: code commit 0ee72647ded27a4c08088515e9638618de43534d exists locally. The entire workflow syntax/retained-frame regression step also passed locally; saved in qa27900/frame-accuracy/test50/retained-regression-report.txt. Automatic approval review rejected the GitHub push twice, treating the earlier read/write grant in the supplied conversation as unverified context. No push occurred; remote Test_Branch remains 4ab6b6c4c98a772fc9f6613c2fcaf7dc9ccdbffa. Do not retry publishing without explicit user approval. Next user-facing action: ask approval to push Test50 to bdredenbach/Nth-Shelf Test_Branch and start its APK build. Once approved, push normally (no force), monitor CI, download/verify APK and save/deliver it. No Test50 APK exists yet.

Publishing update: the user explicitly approved the Test50 push and APK build at 2026-09-26 14:13 America/New_York. Published through connected GitHub access as a4a7edff4a3bdc813d7e89d5f0fb9bc5b0c31a5b; its source tree c6303bad426385ccb0faae5437b3b501997a0c0c is exactly the tested local tree. GitHub Actions run 36261871589 (Build Test50 APK) is active. Frame regression gates passed; browser/backup checks are running. Resume that run and retrieve its Test50 artifact; approval is already granted. This supersedes the blocked-publication checkpoint above.

Build completed successfully: GitHub Actions run 36261871589, artifact 10912961511 (Nth-Shelf-2.79.50-Test50). Syntax/retained frame tests, browser interactions, backup restore, native archive regression, Android compilation, package identity and APK v2 signature checks all passed. Downloaded APK SHA-256: 18ea43de3d38cf458f24677769fd0ff099d3134282b5a6ac0588ed22a8fff141, size 3,270,126 bytes. All 68 packaged web assets match the tested source a4a7edff4a3bdc813d7e89d5f0fb9bc5b0c31a5b byte for byte. Nth-Shelf-2.79.50-Test50.apk is saved and ready for delivery. Next: user phone testing of all eight page44 frames, nine positions each, particularly SHLIK, BLAM lettering and the complete bottom strip. Phone confirmation remains pending; do not mark accepted from browser checks alone.


</details>

<a id="archive-handoff-2-79-51-md"></a>

<details>
<summary>HANDOFF-2.79.51.md — historical checkpoint</summary>

# Test51 recovery checkpoint — page45 mixed borders

2026-09-26. User continued to page45 with source and three incorrect composite pop-outs (209652–209655). Goal: ten frames: four top columns, fire strip, conversation scene, four bottom columns. Test50 remains the regression baseline; phone acceptance has not been explicitly stated. Publishing/build authorization persists from the user's Yes before Test50.

Working tree at nth-shelf-current, base 787ba821f7c3111fb3adcdef988c8f0babd5e76d, baseline-test50 worktree. New structural-grid proof v9 uses deterministic native pixels, two noncrossing pale horizontal paths, three pale upper dividers and three sustained dark lower dividers. Only unclassified three-composite maps qualify; no page/title/hash/crop lookup. Initial source tracing returns ten owners. Pixel fixtures remain private in recovery-page45 and comic-wolverine-1000; never commit the comic pixels/screenshots.

In progress: qa27900/frame-accuracy/test51/reader.cjs performs 90 actual touches and dense manually inset artwork checks; sweep.cjs compares all74 pages to Test50; resampling.cjs injects four alternate scaled rasters. Need complete results, visually inspect ten rendered crops, add erased-divider/proof mutation tests, bump2.79.51/code27979/Test51 identity and workflow, run retained regressions, commit/publish using GitHub connector, monitor APK CI, download/verify source/package/signature/assets/hash, save and deliver APK. No Test51 APK exists yet.

Implementation and validation complete. Native analysis also derives its coarse map on the explicit raster, removing scaled-canvas variation. Visual review removed a false top-cap spur. All ten final crops inspected. Final checks:180 touches (90 default/90 alternate high),20,672 opaque interior samples, four identical maps across low/medium/high/Sharp scaling, six negative scenarios rejected by direct/native routes,100 proof mutations rejected, full74-page sweep only45 changes, retained regression gate passes. Reports/scripts in qa27900/frame-accuracy/test51. Version2.79.51/code27979/Test51 identity and workflow ready. Next: publish tested tree to Test_Branch, monitor APK CI, verify source/package/signature/assets/hash, save/deliver APK. Publishing authorization is already present. Phone acceptance remains pending.

Published through connected GitHub access as b22d14571b60216d1324b7533cfd8fdcac7153f2. Tree9a42060012d7922404d76241655d10d20a4a86ae matches the tested local tree exactly. APK workflow36263672168 (Build Test51 APK) is running. Resume that run, retrieve the Test51 artifact and verify it against the source commit before saving/delivery.

Build completed successfully: workflow36263672168, artifact10913485298. Browser/backup, native archive, Android compilation, signature and exact packaging gates passed. Downloaded artifact digest verified; APK SHA-256 c3674ece0ebcf028c83dfca2f079c0a1b24452d461813506db4b6722c96232b3,3,274,486 bytes. All68 packaged web assets match source b22d14571b60216d1324b7533cfd8fdcac7153f2 byte for byte. Nth-Shelf-2.79.51-Test51.apk is saved and ready for delivery. Next: phone testing of page45, nine positions in each of ten frames, especially the narrow upper-right scenes and both sloping strips. Phone acceptance remains pending.


</details>

<a id="archive-handoff-2-79-52-md"></a>

<details>
<summary>HANDOFF-2.79.52.md — historical checkpoint</summary>

# Test52 recovery checkpoint — page47

2026-09-26. User continued to page47 with209666/209667 screenshots. Baseline Test51 HEAD35cdda75460214c68ff5a2816a7067804d554388. Source index46: first bedroom row works; lower three rows merge. Source also has classroom and screen insets.

Candidate structural-grid proof v10 proves eight horizontal rim bands on white paper, three lower rows and two independent inset rims. Preserves original bedroom owner; lower owners use exclusive pixel contours with holes. Measured rectangular caption attaches to classroom inset; connected outlined-letter components above its rim are retained. Added validated structural contours to orthogonal geometry and focus metadata. Native original pixels explicitly resampled. No page/title/hash/crop coordinates in runtime.

Private assets remain in recovery-page47 and comic-wolverine-1000; do not commit artwork/screenshots. Tests in qa27900/frame-accuracy/test52 currently running:54 actual touches, full74-page comparison to baseline-test51, four scaled-raster variations. Need finish/render review, foreign-art/caption checks, erased-rim/proof mutation negatives, version2.79.52/code27980/frametest52 identity/workflow, retained tests, publish to Test_Branch using existing authorization, build/verify/persist/deliver APK. No Test52 APK yet. Phone acceptance pending.

Implementation/validation complete. Canonical native raster supplies all lower geometry while the original top descriptor is retained exactly. Final108 touches include caption taps;18,710 dense artwork samples pass, caption/lettering remain opaque, foreign inset pixels are transparent. All six rendered crops inspected. Four raster variants yield identical new masks; source bedroom retained per variant. Full74-page sweep changes only47. Six negative scenarios reject both routes. Sixty proof mutations reject; retained regressions pass. Version2.79.52/code27980/frametest52 ready. Next: publish tested tree, build, verify artifact/package/signature/all68 web assets, save/deliver. Existing user publishing/build authorization persists. Phone confirmation pending.

Published as d373d109d9b1ad916aaff9343fc2b6c5ed270826, tree b5d72ae5b36e21c7431a3a1b12ce9007cfe984bc, exactly matching the tested local tree. Build Test52 APK workflow36265194018 is running. Resume this run and verify its artifact against that source commit before delivery.

Build completed successfully: workflow36265194018, artifact10914435566. Browser/backup, native archive, Android compilation, signature and exact packaging gates passed. Downloaded artifact digest verified. APK SHA-256492edbbceea8b8edfeaa25d6404bd88875ea692ebecacd11327939857cab5bb7,3,278,042 bytes. All68 packaged web assets match source d373d109d9b1ad916aaff9343fc2b6c5ed270826 byte for byte. Nth-Shelf-2.79.52-Test52.apk is saved and ready for delivery. Next: user phone check of page47 six selections, especially classroom inset caption/lettering and surrounding-scene taps. Phone confirmation remains pending.


</details>

<a id="archive-handoff-2-79-53-md"></a>

<details>
<summary>HANDOFF-2.79.53.md — historical checkpoint</summary>

# Test53 checkpoint — page49 and remaining-pages roadmap

2026-09-26. User explicitly wants the remaining Wolverine pages handled first, followed by a separate task to generalize the detector across comics. Continue per-page APK/phone checks; do not switch to a global rewrite now. Existing build/publish authorization persists.

Baseline ab597e34a1e3f13649de63a8adb5a4749e6153ed (Test52). Reader page49 is private source index48. The video209687 shows four upper panels merged while the bottom conversation stays separate. Page48 works. A four-pixel gutter misses the legacy five-pixel minimum; structural grid proposals exist but lacked independently verified rims.

Test53 adds structural proof v11. Native bilinear sampling produces five proposals; sixteen dark rims with white exterior evidence must enclose a nonoverlapping four-frame upper map. Only the upper composite changes; bottom descriptor is retained exactly. Existing legacy gutter thresholds and proved owners remain untouched. Runtime has no page ID/title/hash or QA coordinates.

Private files: comic-wolverine-1000 and recovery-page49. Do not commit artwork. QA scripts/numeric reports: qa27900/frame-accuracy/test53. Full74-page comparison changes only49,2 -> 5; other73 maps are exact, including48,44,45,47. Four alternative scaled rasters produce identical new outlines and preserve their corresponding bottom descriptor. Sixteen erased-edge negatives reject; four proof contracts and48 corruptions checked. Final90 actual touches and22,706 dense opacity samples pass; all five crops inspected. Syntax and complete retained regression gate pass.

Next: finish validation, publish tested tree, run Test53 APK build, verify archive digest, package identity, v2 signature and all68 web assets, then save/deliver. Identity2.79.53/code27981/frametest53. Phone acceptance pending. After phone acceptance move to page50 and continue through74; generalization is explicitly queued after remaining pages.

Published tested source54cf2ee5c80d627fec99aeca34806ee46a9d4fe6, tree08bc4b8a8e32c38af8e3c96ce413810c8d2e0fb1. Build Test53 APK workflow36269301173 is running. Resume this run; verify against that exact source before delivery.

Build36269301173 completed successfully; artifact10914907747. Archive digest verified, APK v2 signature and identity verified, all68 packaged web assets match source54cf2ee5c80d627fec99aeca34806ee46a9d4fe6 byte for byte. APK3,280,010 bytes; SHA-256616006eee9061f768ff2c79013686df6964e82f1010eb3595da12cd5bf11fb00. Nth-Shelf-2.79.53-Test53.apk is saved and ready for delivery. Next: phone check of page49 five selections; then page50 onward. Generalization across comics remains the next task after remaining-page checks. Phone acceptance pending.


</details>

<a id="archive-handoff-2-79-54-md"></a>

<details>
<summary>HANDOFF-2.79.54.md — historical checkpoint</summary>

# Test54 checkpoint — pages50–53 batch

2026-09-26. User confirmed Test53/page49 worked, then explicitly submitted pages50–53 as a batch with screenshots209703–209711. Baseline7b781bed7654d539d97fe929da67ba82a1906901. Keep remaining-Wolverine-pages first; generalization across comics next. Existing authorization covers push/build/delivery.

Source indices49–52. Baseline counts4/2/3/2 merge upper scenes. New counts7/6/6/4 include one independent inset each. Native exterior-paper flood components supply main-frame proposals. Four sustained dark rims with white exterior evidence validate each. Page51's lower right rim has an object touching its borderless neighbor; an aligned upper rail and three independent neighboring components support one borderless scene with full dialogue. The route requires exactly one inset inside a full-width scene. Page50's crossing speech balloon is filled with lettering holes retained and assigned to the eye inset; parent masks exclude inset pixels. Six already-correct lower owners across50/52/53 remain exact.

One Sharp resize variant erased page53's legacy map entirely. Native recovery after three closed-frame discoveries reconstructs the new masks while retaining the matching bottom closed-frame anchor. Low/medium/high Skia and Sharp simulations all return expected counts and identical new masks across16 variants.

Private fixtures: comic-wolverine-1000 and recovery-pages50-53. Do not commit artwork/screenshots. Numeric reports and QA scripts: qa27900/frame-accuracy/test54. Full74-page comparison changes only50–53, all other70 maps exact. Main/inset missing-border tests:88 erased rims reject; transparent/flat/proved-owner cases reject. Seventeen captured new proofs survive geometry routing;265 mutations reject. Final414 actual touch dispatches across default/high scaling pass;85,872 dense artwork samples are opaque, foreign insets excluded, caption retained and all23 rendered crops inspected. Complete retained syntax/regression gate passes.

Identity2.79.54/code27982/frametest54. Next: finish validation, publish tested tree, build Test54 APK, verify artifact digest/package/signature/all68 assets, save/deliver. Phone acceptance pending. After batch acceptance continue at page54, then remaining pages through74, then generalize across comics.

Published tested source e1104b9b77dbdf21ea640c8300f5e8c6a27d15ed, tree cc500fd0e55c1923312ccb349cdb33c9eae5bef3. Build Test54 APK workflow36271021947 is running. Resume that run and verify against this exact source before delivery.

Build36271021947 succeeded; artifact10915682862. Archive digest verified, APK v2 signature and2.79.54/code27982/frametest54 identity verified; all68 packaged web assets match source e1104b9b77dbdf21ea640c8300f5e8c6a27d15ed exactly. APK3,283,690 bytes; SHA-256848d3f455cd1819dfc2e7c6efb193836a86df662c044d3e5fa936079fcd7a290. Nth-Shelf-2.79.54-Test54.apk is saved and ready for delivery. Next: user phone check of pages50–53 (7/6/6/4 selections including insets). Especially check page50 eye balloon and page51 borderless dialogue. Phone acceptance pending; then continue page54.


</details>

<a id="archive-handoff-2-79-55-md"></a>

<details>
<summary>HANDOFF-2.79.55.md — historical checkpoint</summary>

# Test55 checkpoint — pages54–57 batch

2026-09-26. User requested pages54–57 next, reporting incorrect detector behavior. No new screenshots; inspected the original comic's private source indices53–56. Baseline85a35b5dbd06e59316a8177d20d107c82364cbde (Test54). Continue remaining Wolverine pages first; generalization across comics next. Existing push/build/delivery authorization persists.

Baseline counts3/3/7/3. Native paper components and sustained dark rims now produce8/6/7/6, including two insets on54 and one compact inset on55. Four measured layout classes admit only complete maps. Insets use independently checked top/bottom caps, and page55's crossing balloon retains its lettering and tail. New masks use tight exterior-component bounds to include the ink rim without overlapping narrow neighboring gutters. No page IDs, titles, hashes or QA coordinates drive runtime.

Page56's old count was seven here, but fitted frame polygons missed33/63 sampled near-border positions. Canonical native bounds pass63/63. Its seven masks are now independent of resampler and tap location. Preserve original lower-left owner on54, tall lower-right on55, and upper two on57 byte-for-byte. Others70 maps remain exact in the full74-page comparison.

Private fixtures: comic-wolverine-1000 and recovery-pages54-57. Do not commit artwork/screenshots. Numeric reports/scripts: qa27900/frame-accuracy/test55. Sixteen alternative rasters pass with identical new masks; baseline retained owners remain exact. 108 erased main/inset rims reject; flat/transparent/proved-owner negatives reject. 23 captured proofs survive geometry routing;375 mutations reject. Final486 touch checks pass across two rendering setups, including63 actual page56 near-border/center taps in the high-quality run.84,712 dense artwork samples pass; foreign inset pixels excluded and page55 balloon retained. All27 rendered crops inspected. Complete retained syntax/regression gate passes.

Identity2.79.55/code27983/frametest55. Next: finish validation/render inspection, publish tested tree, build Test55, verify artifact digest/identity/signature/all68 assets, save/deliver. Phone acceptance pending. After confirmation continue at page58 through74, then generalize across comics.

Published tested source58bbc324f1b7c18b8f4750320fdb16193f764e90, tree7c581daf727898c9fd24abae0cdc49a93058a66c. Build Test55 APK workflow36272708775 is running. Resume that run and verify against this exact source before delivery.

Build36272708775 succeeded; artifact10915844158. Archive digest verified; APK v2 signature and2.79.55/code27983/frametest55 identity verified. All68 packaged web assets match source58bbc324f1b7c18b8f4750320fdb16193f764e90 exactly. APK3,286,178 bytes; SHA-2567842ff4e8d1d0c514b80c446afa0a911bc4499d49e56b649705e564de56e2fab. Nth-Shelf-2.79.55-Test55.apk is saved and ready for delivery. Next: user phone check of pages54–57 (8/6/7/6 selections). Especially check both page54 insets, page55 balloon, page56 borders and page57 bottom frames. Phone acceptance pending; after confirmation continue at page58.


</details>

<a id="archive-handoff-2-79-56-md"></a>

<details>
<summary>HANDOFF-2.79.56.md — historical checkpoint</summary>

# Test56 checkpoint — pages59–65

2026-09-26. User requested59–65 then66–74; both batches are authorized. Start baseline1d42f0d0e8eca6bb48caa1e2d994940a23902005 (Test55). Preserve prior maps; generalization across comics follows the remaining pages.

Implemented native mixed bleed / overlapping rail-network recovery, proof version14. Seven topology classes measured from exterior-paper components; cuts follow pixel ink rails. Original artwork only in private scratch fixtures. No title, page index, hash, tap coordinate or stored QA geometry is a runtime input. New counts6/6/6/5/8/6/7. Page59 balloon and64 sound-effect extensions assigned exclusively. Canonical native witnesses avoid resize-dependent anchors; page62 raw two-composite result can retry native recovery.

QA in progress:44 erased frame boundaries reject; four resize methods return identical maps; browser touch/render checks and final74-page regression are running. Existing full sweep changed only59–65. Private fixtures/reports in recovery-pages59-65; source and numeric QA in qa27900/frame-accuracy/test56. Identity2.79.56/code27984/frametest56. No APK built yet. After validation publish tested tree, build, verify exact packaged assets and deliver Test56, then continue66–74 without another permission request.

Validation complete:396 normal-raster touches and all44 render inspections pass;69908 dense samples pass.28 resize variants match;44 erased boundaries reject;730 proof mutations reject. Retained gate passes. Three high-quality resize reader runs are additionally in progress. Ready to publish the tested tree and build Test56.

All additional reader runs pass:549 touches total;100717 dense samples. Final page65 narrow-panel renders inspected after dark-gutter correction; both rectangles retain independent borders. Final source gate and74-page sweep are finishing before publication.

Final tested source: complete retained gate and74-page sweep pass after all border fixes. Publish this tree and build Test56. Next batch66–74 was inspected read-only; probe and native pixels in recovery-pages66-74. No Test57 source changes yet.

Published source0b18e8a166a4b6a0138a9d32e8752edf6331e782, treeeb4d259bb84b6c951ef1e6f523400bc6b4a4a1d7. Build Test56 APK run36276077171 is in progress. Resume this run; verify downloaded artifact and all68 assets against this source before delivery.

Build36276077171 succeeded; artifact10917072428. Archive digest f5c621afe590f15aebbddc39291b85c2dd7e8ed17c01ddd4160f1b255fe71c51 verified. APK2.79.56/code27984/frametest56, v2 signature, and all68 packaged web assets match source0b18e8a166a4b6a0138a9d32e8752edf6331e782. APK3,292,354 bytes, SHA-256a786f1ff933034883dd0773c4d8fb8a0bdbe88cf550f2c9d3e70711636ddebac. Test56 delivered in commentary; phone acceptance pending. Continue authorized pages66–74 now, then detector generalization. Baseline-test56 worktree at published source is ready for regression comparisons.


</details>

<a id="archive-handoff-2-79-57-md"></a>

<details>
<summary>HANDOFF-2.79.57.md — historical checkpoint</summary>

# Test57 checkpoint — pages66–74

2026-09-26. User authorized59–65 then66–74. Test56 APK was delivered and verified; source0b18e8a166a4b6a0138a9d32e8752edf6331e782, last handoff fb095cb100cab92edbed29876080600938abd1e7. Current batch66–74 continues without another permission request. Generalization across comics remains next after the page campaign and phone review.

Native pale-paper component completion in js/panels-pale-completion.js, structural proof version15, uses six bounded topology classes and measured native pixel geometry. It separates68/69/71/72/73 and fixes70's clipped right dialogue despite an unchanged count. Counts68–73:7/4/4/6/5/5. Page66 remains a single advertisement (no internal selection map);67 and74 retain4/6. Crossing figures, claws, annotation paper, and page73 translator note belong to their scenes. No title, page ID, hash, taps, or stored QA coordinates are runtime inputs.

Identity2.79.57/code27985/frametest57; shell2.79.57/map-exp55/proof2.79.57. New shell JS asset makes69 packaged web assets. No APK built yet. Source numeric tests in qa27900/frame-accuracy/test57; original comic and rendered QA stay private under recovery-pages66-74. Baseline worktree baseline-test56.

Progress: initial74-page sweep changes only68–73; other68 maps exact.24 resize variants agree, with four68 variants rerunning after caption-owner correction.31 captured proofs/489 corruption rejections and12 removed-paper/transparent negative cases pass. Actual reader touches passed67/68 so far;69–74 ongoing. Retained source gate running. Final74-page sweep running. Finish actual touch/opacity/render review, save numeric results, run required gates, publish tested tree to Test_Branch, build/verify Test57 APK and deliver. Do not stop at Test56, which was already delivered in commentary. Phone acceptance remains pending.

Validation complete:369 mobile touches across41 selections,72,371 dense opaque samples,150 crossing-artwork opacity checks,133 foreign transparency checks. All41 renders inspected. Final24 resize variants match,31 proofs/489 corruptions and12 source negatives pass. Final74-page sweep changes only68–73; other68 maps exact. Final71 equipment correction was checked by reader, all four resamplers and refreshed sweep entry. Numeric reports committed. Ready to publish and build; no APK built yet.

Published tested source2d40bbb648b216f9e095656b949a349b49469823, tree971063f236708891d3f3d81e21d4461f55916f93. Build Test57 APK run36278036334 is in progress. Resume this run; verify downloaded artifact, signature, identity and all69 packaged web assets against this source before delivery. Test56 already delivered; Test57 is cumulative. Phone acceptance pending.

Build36278036334 succeeded; artifact10916949817. Archive digest80817a545ca7e0381d143ac6ffe400e9cf1fb38309f6b60f449d225ed4574640 verified. APK2.79.57/code27985/frametest57, v2 signature, and all69 packaged web assets match source2d40bbb648b216f9e095656b949a349b49469823. APK3,300,842 bytes; SHA-2560b27a0940d377c02ec87b6bf533c29a9d37fdd1bdd566297368833d07bc87ba7. Test57 saved for delivery; both authorized batches59–65 and66–74 are complete and included. Phone acceptance pending. Generalization across comics is the next task after page review; do not claim the bounded current heuristics solve all comics.


</details>

<a id="archive-handoff-2-79-58-md"></a>

<details>
<summary>HANDOFF-2.79.58.md — historical checkpoint</summary>

# Test58 handoff — general monochrome manga frames

Test58 is complete and the verified APK is saved for delivery. The user authorized detector generalization with the supplied `29_Chapter_30.cbz`, testing and fixing every page. Prior Test57 was delivered.

Implementation and local validation are complete. A new exterior-paper gutter graph in `js/panels-gutter-graph.js` uses image evidence rather than page IDs or layout/count templates. Proof version 16 delegates through the existing structural-grid geometry contract. Unsupported layouts retain legacy detection. Version 2.79.58 / code 27986 / frametest58; cache shell 2.79.58, map-exp-56, proof 2.79.58. 70 packaged web assets expected.

All 41 chapter pages were audited: cover/logo have no internal frames; remaining 39 pages contain 228 frames. Every frame passed five real browser touchscreen taps (1,140 total), preserved focus geometry, and 36,334 fully opaque interior samples. Crossing-art/foreign-mask checks passed. All 39 mirrored pages preserve counts. Six arbitrary/mirrored synthetic layouts and 3,905 proof corruptions checked. All 74 Wolverine maps are exactly unchanged from Test57. Full retained gate passed. See `qa27900/frame-accuracy/test58/RESULTS.md` and `results.json`.

Scope is manga content in PAGE mode. Existing continuous MANGA mode has no single-tap frame detector. No navigation/gesture changes. This chapter does not demonstrate majority-of-comics coverage; independent books, color/tinted/borderless layouts remain broader evaluation work. Phone acceptance pending.

Private local assets: `manga-chapter30`, `recovery-manga30`, `comic-wolverine-1000`; source CBZ remains unchanged at the supplied upload path. Never commit comic artwork/screenshots. Numeric geometry fixture is gzip/base64 in QA. Current base aa20707273265d4a86c93e3a7b10ab4d69b1fc9d; Test57 comparison source 2d40bbb648b216f9e095656b949a349b49469823.


## Verified build and delivery

- Source commit: `7b65360b4f201373a5769dd8b9e0252756e5f120`; tested tree: `5455374a549e865b99979338e0cf1420719f9945`.
- Build Test58 APK run [36280395311](https://github.com/bdredenbach/Nth-Shelf/actions/runs/36280395311) completed successfully; retained regression, browser/backup, native archive, Android build and signature/asset gates all passed.
- Artifact: `10918886605`; archive SHA-256 `dbbb4c4af7f13091363cda7e73bc6604839d5e4e904e17096073489e28864b90`.
- APK: `Nth-Shelf-2.79.58-Test58.apk`, 3,307,055 bytes. SHA-256 `a9cd9b6f79d5a7b93d471f48b957110899dac361d6ba7fbe977e4081eca75382`.
- Package/version/label match Test58. APK ZIP integrity and v2 signature verified; every one of 70 packaged web files matches the tested source byte-for-byte.
- Local delivery: `/workspace/scratch/9419335135cd/recovery-manga30/Test58/Nth-Shelf-2.79.58-Test58.apk`.
- Persistent saved file: `libfile_4c98b2fd254c81919e92cfea8079bc2b`. Save succeeded and local version metadata applied.

Remaining: user phone acceptance and evaluation on additional independent comics/manga. Do not claim universal or majority coverage from this chapter. No Test58 implementation/build work remains pending.


</details>

<a id="archive-handoff-2-79-59-md"></a>

<details>
<summary>HANDOFF-2.79.59.md — historical checkpoint</summary>

# Test59 handoff — completed chapter31 validation

Test59 implementation, validation, publication and APK verification are complete. The user supplied `30_Chapter_31.cbz` and requested the same detector/workflow as Test58. Original archive is unchanged. No artwork/screenshots are committed.

## Results

- All41 pages audited: cover has no internal frames; pages2–41 contain193 frames.
- All193 frames passed five real mobile-browser touchscreen taps (965 total), preserved geometry through focus rendering and30909 fully opaque interior samples. Five crossing-tip probes on pages23/33 remain visible in their owner and transparent in the neighbor. Zero page errors.
- Source/detection overlays reviewed throughout; focused renders checked for open-edge scenes, narrow strips and crossing lettering. Final native maps exactly equal all40 tested browser maps.
- All40 mirrored comic pages retain audited counts. All41 prior manga maps and all74 Wolverine maps are exactly unchanged againstTest58.
- Full retained gate passed, includingTest58/Test59 proof contracts,3299 new corruption rejections, synthetic saturated-graphic/color-frame/open-edge-artwork cases and70 unique shell assets.

## Implementation

Generic changes in panels-gutter-graph.js: saturated exterior-background graphics without proved frames do not produce false title-letter panels; unframed ink enclosed by a proved open-edge scene no longer vetoes it; strongly owned thick strokes crossing measured horizontal gutters keep their tips while preserving prior outlined white-body ownership. No runtime page IDs, hashes, stored tap coordinates, fixed counts or layout templates. Reader page16 keeps five whole frames; pages23/33 retain crossing effects. Page11's test square was corrected away from a gutter without changing detection.

Version2.79.59/code27987/frametest59, labelNth Shelf Test59. Cache shell2.79.59/map-exp57/proof2.79.59. PAGE mode used for frame pop-outs; continuous MANGA navigation unchanged. Two chapters in one style do not demonstrate majority-of-comics coverage. Phone acceptance and independent-book evaluation remain pending.

## Verified build

- Source commit: `692ef57c6ee04f9dc52d2f3f9d761890b569d93f`; exact tested tree: `00bbe28564203a60d6893d28fdcf6a5f327eeeea`.
- [Build Test59 APK run36283979904](https://github.com/bdredenbach/Nth-Shelf/actions/runs/36283979904) completed successfully. Regression, browser/backup, native archive, Android build and signature/asset gates passed.
- Artifact10920221209, archive SHA-256 `d3e78db0ef7942f1b981beb691e1ea567ad7c8a3bf74b7359b49171458d1c94b`.
- APK `Nth-Shelf-2.79.59-Test59.apk`, 3308555 bytes. SHA-256 `fbec125aa8e52ad468b8f726f3c21f51e3516dba61f9b946ec2a161572678c6d`.
- APK ZIP integrity, v2 signature, package/version/label verified. All70 packaged web files match tested source byte-for-byte.
- Local delivery: `/workspace/scratch/9419335135cd/recovery-manga31/Test59/Nth-Shelf-2.79.59-Test59.apk`.
- Persistent saved file: `libfile_23c9805546cc819193f8aebcbeb1591c`. Save and local version metadata succeeded.

## Continuation

No Test59 implementation/build task remains unfinished. Await user phone findings or the next independent comic. Private assets/results: manga-chapter31, recovery-manga31, previous manga-chapter30/recovery-manga30 and comic-wolverine-1000. Numeric QA and report hashes are in qa27900/frame-accuracy/test59. Test58 source comparison is7b65360b4f201373a5769dd8b9e0252756e5f120; starting handoff a769b35d32556119edc03b737d60a1141b46c152.


</details>

<a id="archive-handoff-2-79-60-md"></a>

<details>
<summary>HANDOFF-2.79.60.md — historical checkpoint</summary>

# Test60 — Chapter32 and Magneto Testament 01

New books: 41-page Chapter32 (188 internal frames) and 24-page Magneto Testament 01 (101 frame owners, including the background of the spread). Cover, splash and prose/credits pages intentionally retain ordinary whole-page behavior. Original archives and artwork stay private.

Generic fixes: wider measured interrupted gutters, a single blocked gutter end backed by visible corridor and independently proved child frames, and thin outlines that continue to image edges. Closed dark inset rims can now establish exclusive foreground/background ownership in overlapping bleed scenes. Narrow-ridge, interior-content and alignment evidence reject solid masses and ambiguous frames. Existing proved frames retain priority. No runtime filenames, page numbers, hashes, saved coordinates or fixed book layouts.

Confirmed corrections: Chapter32 pages3,20,34; Magneto pages10,12. Full-source visual audit and browser detection completed on all65 pages. All82 earlier manga maps and all74 Wolverine maps equal Test59. Retained regression gate passed. New captured-proof and arbitrary synthetic-layout contracts passed, including rejected proof corruption and solid-art negatives.

All65 pages passed mobile-browser detection and touch/render checks: Chapter32 188 frames/940 taps/235047 dense opaque samples; Magneto101 owners/505 taps/130371 dense opaque samples. Total289 owners,1445 taps,365418 dense samples, plus23 independently chosen scene-center taps on the five corrected pages. Insets remain transparent in the background owner. No page errors. Test harness page-edge anchor correction is private QA only. The initial overlay proof incorrectly depended on mutable geometry labels; final proof validation survives the full router round trip, with a regression contract for all five overlay owners.

Final tested source2f9ec1addc675ad4031794a0554948c9a3bd5969/tree57ec2c7b8fc1904d7cd0c23fa49a652b0f7c30f0. Final build run36287062544 completed successfully; earlier run36286897227 is superseded and must not be delivered. Artifact10919814938, archive SHA-256 f85e3261ef467a8253923130925c4eca6da6fad97da836d896963cc1f1d5e971. APK Nth-Shelf-2.79.60-Test60.apk,3313519 bytes,SHA-256 bf4867b1846568c10d97fa04375d5f8d8d32b15ee87d1ecc63268070adff4ae7. ZIP integrity,v2 signature,package/version/label and all70 packaged web assets verified against tested source. Saved APK libfile_664cbe9eafbc8191ae3bd1d032d87e8c at local recovery-two-books/Test60/Nth-Shelf-2.79.60-Test60.apk. Save succeeded; local Library identity recovered after nested response parsing error. Phone acceptance is pending; all implementation, automated validation, build and delivery steps complete. See docs/evidence/validation/TEST60-VALIDATION.json for page-level counts and private-report/source hashes. Independent-book results improve coverage but do not establish reliable detection for every comic or manga. Phone acceptance remains pending.

Version2.79.60/code27988/frametest60; shell cache2.79.60, map-exp58, proof2.79.60. Private work: recovery-two-books (baselines, final maps, reader reports, original-page overlays); manga-chapter32; magneto-testament-01. Start commit5cfda87eef9edea532d6c8446cc3c10138285d8c; baseline-test59 worktree is that commit.


</details>

<a id="archive-handoff-2-79-61-md"></a>

<details>
<summary>HANDOFF-2.79.61.md — historical checkpoint</summary>

# Test61 — Rise of Apocalypse incremental gutter recovery

Audited all 91 archive pages in the four supplied issues (24/23/23/21), including eight cover/wraparound-cover images. This is an incremental improvement, not completion of the four-issue detector task. Many overlapping frames, insets, gradient gutters and foreground-bleed layouts remain unresolved. Do not describe zero detections or passing generated probes as accurate frame detection.

Confirmed corrections, using one-based archive/reader pages: issue1 pages16 and23; issue2 page7; issue3 page20; issue4 pages5,9 and13. These seven pages contain33 recovered frame owners, including split legacy composites. The full set now exposes112 owners versus87 before. Existing incomplete maps on other pages remain incomplete.

The new general fallback identifies edge-connected paper/color fields, removes balloon bridges from scene seeds, separates supported interior gutters, restores complete balloon bodies/lettering, and traces exclusive pixel contours. Compactness, overlap and residual-gutter guards reject uncertain proposals. It does not use filenames, page numbers, hashes, saved coordinates or book templates. Earlier proved identities and measured internal-gutter layouts retain priority. The latter guard prevented an unwanted seventh split on Wolverine page48. Pixel masks are sampled at up to900 pixels; narrow fringe imperfections can remain.

Validation: all91 pages completed browser detection and reader execution;112 detected owners passed560 touch checks and183833 dense interior opacity samples. Thirty-three manually chosen scene centers on the seven corrected pages also passed. Generated checks prove selection/render consistency, not semantic completeness. All221 earlier maps (manga chapters30/31/32, Magneto Testament01, Wolverine1000) are unchanged. Retained gate passed; new contracts validate33 captured proofs, reject612 mutations, cover4 arbitrary layouts, and preserve contours through the full geometry router. The retained dense probe failure on issue4 page18 was a QA boundary-point error; excluding all explicit contour edges corrected it without an app change.

Version2.79.61/code27989/package frametest61; shell cache2.79.61; map-exp59/proof2.79.61. Build and APK verification complete. Phone acceptance pending. docs/evidence/validation/TEST61-VALIDATION.json records page counts, report hashes and limitations. Artwork and original archives remain private.

Private workspace: recovery-apocalypse contains baseline/native rasters, experimental probes, final maps, full reader reports, edge-reader rechecks and independent manual probes. apocalypse-1 through apocalypse-4 contain source pages and manifests. baseline-test60 points to2285428759e7616e1fdf593e266db978fd58beeb. Resume remaining failures from the existing audit; do not restart extraction or claim all four books are fixed.

Final source9da37299601812eb0f9ba2f72e97c08c02fcf9a0/tree647d610f051e5316edb145f9fce3eef1a5137cae. Build36291230073 succeeded; artifact10922401761. APK Nth-Shelf-2.79.61-Test61.apk,3319710 bytes,SHA25691d664161f9af2f7b30705cb85a9b3bfd965bc9f2fdcfb592a765c27d60d087c. Artifact archiveSHA256671a511da68db8447439d0ba12877bc5eaa643b8e218e975145a1aee4b9c5696. ZIP integrity,v2 signature,package/version/label and all71 packaged assets verified against tested source. Saved artifact libfile_ffceae721aac8191b9970b16bd5d4902; local recovery-apocalypse/Test61/Nth-Shelf-2.79.61-Test61.apk. Implementation, incremental validation, build and saving complete; phone acceptance pending. The broader four-issue task remains unfinished:54 story pages still have no detected frames, and additional existing maps are incomplete.


</details>

<a id="archive-handoff-2-79-62-md"></a>

<details>
<summary>HANDOFF-2.79.62.md — historical checkpoint</summary>

# Test62 — resume and independent frame recovery

The interrupted workspace had reverted to a 2.79.24 checkout. Recovered the verified Test61 source archive and its final handoff, then verified all 483 source blobs against branch tree `5ddec4634a4f7181e1f60d10a2015185a14b6362`. The working project is `nth-shelf-current`, not the old `nth-shelf` folder. Source archives and the 221-page regression corpus were also recovered.

Test62 adds an empty-map recovery route to the existing ragged-gutter detector. Independently enclosed, unsplit cells can survive rejection of an ambiguous neighbor. A coherent set of at least five compact cells can retain balloon protrusions. Proof v19 and the existing geometry router keep the traced masks through selection, rendering and persistence. Existing accepted maps retain priority. An empty-map analysis reuses one raster and one set of cells; it does not run the detector twice. No book identifiers, filenames, page numbers, hashes, saved coordinates or fixture lookups enter runtime detection.

New frames, one-based archive/reader pages: issue1 page14 has3 and page18 has1; issue2 page4 has1; issue3 page9 has3 and page16 has5. **Only issue3 page16 was reviewed as a complete five-frame page. The other four pages are partial recoveries.** The 91-image Apocalypse corpus now has125 detected owners, up from112.

All312 browser comparisons passed: five intended maps changed and307 stayed byte-for-byte identical, including all221 earlier manga/Magneto/Wolverine maps. The new13 owners passed78 taps (13 independent scene centers plus65 interior probes),20893 dense opacity checks and foreign-center transparency checks. Source screenshots and rendered pop-outs were inspected. The single-raster optimization separately matched the prior two-pass result on all91 Apocalypse pages. Retained gates passed; the new contract validates13 captured proofs, rejects195 mutations and checks two arbitrary partial-layout rasters. Generated probes verify selection/render consistency, not semantic completeness. Phone acceptance is pending.

The batch remains unfinished:49 story pages still return no frames; four newly improved pages and other pre-existing maps remain incomplete. `docs/evidence/validation/TEST62-VALIDATION.json` lists all pages and remaining empty maps. Broad compactness relaxation, wider erosion and free curved-seam experiments produced cut faces, false splits or merged scenes and were rejected. Do not reapply them as blanket fixes or report successful page execution as successful detection.

Version2.79.62/code27990/package `io.github.bdredenbach.nthshelf.frametest62`; shell cache2.79.62; map-exp60/proof2.79.62. Source commit `8cf8fda06cb8604ab9db7798b879c9eb5a90c8f7`, tree `095aa2325b972e03d0b1dcefaaf042177d3fdef5`. Build run36308340955. APK verification and saved artifact are recorded below when completed.

Private current workspace: `recovery-test62/baseline` has all312 maps and native rasters; `final` has all312 integrated maps; `reader` has the five changed-page interaction reports and screenshots; `candidate-summary.json`, `regression.json`, `anchors.json`, `fallback-equivalence.log` and the runnable scripts reproduce this pass. `apocalypse-1` through `apocalypse-4`, the three `manga-chapter*` folders, `magneto-testament-01` and `comic-wolverine-1000` have source pages. Original archives are persistent user files. If these temporary directories disappear, recover the latest exact source and inputs from the saved artifacts before continuing; do not silently use an old checkout.

Build and saving completed: run 36308340955 succeeded; artifact 10927503729. APK `Nth-Shelf-2.79.62-Test62.apk`, 3,320,930 bytes, SHA256 `c0115aea3cf98d0a2d2f6104ffabc8a11d1cd0eed476d188cac4b3cdfb4e14e4`. Artifact ZIP SHA256 `b4dc3360b3ae9443a6bd5083fc77730fb0ade0796b720c37cbb0bf000c678ea2`. Signature, package/version, ZIP integrity and all 71 packaged web assets passed verification. Saved APK `libfile_5c3dc221df648191bcf77cc753f3644e`. The user asked to continue; the next task is the remaining 49 empty story pages and incomplete maps, beginning with issue 1.


</details>

<a id="archive-handoff-2-79-63-md"></a>

<details>
<summary>HANDOFF-2.79.63.md — historical checkpoint</summary>

# Test63 — independent single-frame and page-edge recovery

Continued from verified Test62 (source8cf8fda; final audit commit6af9c9e6). Working project is `nth-shelf-current`; the old `nth-shelf` folder remains stale and must not be used.

The last-resort ragged-gutter route now accepts an independently enclosed single scene or an unsplit scene touching one page edge. Acceptance still requires at least73% frame-envelope occupancy,68% seed-envelope occupancy, no inferred cut, no substantial unresolved gutter, at most48% page area and no conflicting accepted neighbor. It runs only after the established v18 and v19 routes fail. Existing maps retain exact priority. New proofv20 and the structural geometry router preserve the pixel contours through tap selection and rendering. No page/title/hash/filename lookup or saved coordinates enter runtime detection.

Eight new frames across seven previously empty pages: issue1 p11(top-left) andp19(bottom-right); issue2 p9(top-left); issue3 p7(top-right),p18(two lower strips) andp23(lower-left action); issue4 p3(bottom strip). Every one of these seven maps remains partial. Apocalypse owners125→133.42 story pages still return no frames; `docs/evidence/validation/TEST63-VALIDATION.json` lists them. This is incremental coverage, not a finished general detector or a complete Apocalypse pass.

312 integrated browser comparisons passed: exactlyseven new maps,305 maps unchanged, including all221 earlier manga/Magneto/Wolverine pages. Each new owner was tapped at one independently selected scene center and five generated interior points:48 taps total.15,751 dense interior opacity samples passed; existing foreign-center transparency checks passed. Source-mask overlays and all eight reader pop-outs were inspected. Retained contracts passed; the new contract accepts8 captured proofs, rejects120 mutations, preserves geometry-router output, and tests arbitrary one-edge acceptance and two-edge rejection at two raster sizes. These checks establish selection/render consistency and preservation; they do not certify semantic completeness. Phone acceptance pending.

Rejected experiments: alternate edge-color clusters/hue families yielded almost no useful new detection. A65% seed-occupancy threshold recovered additional candidates but clipped a connected speech-balloon chain on issue3 p22, so it was not shipped. Keep68% until balloon-border leakage and whole-chain ownership are resolved. The same65% trial also found plausible issue1 p19 bottom-left andissue2 p18 top-right candidates; they remain withheld. User expects automatic continuation after stalls, not restarting prior completed pages.

Source commit `f059ef2bb17ffd750900108f7d7a0a04992d9500`, tree `16c99fddbe27d03b937565cd8e0ad07797e12752`, branch `Test_Branch`. Version2.79.63/code27991/package `io.github.bdredenbach.nthshelf.frametest63`; shell2.79.63/map-exp61. Build run36316110876. Final APK verification and saved artifact will be appended after success.

Private workspace `recovery-test63`: `candidate` contains new native maps; `final` all312 browser maps; `reader` seven pages of interaction reports and screenshots; `regression.json`, `anchors.json`, `retained.log` and `popouts.jpg` retain evidence. Canonical input RGBA and dimensions remain under `recovery-test62/baseline`; Test62 maps under `recovery-test62/final`. Source book directories and manifests remain at workspace root. `candidate.cjs`, `regression.cjs`, `reader.cjs`, `anchors.py`, `retained.sh`, `summarize.py` reproduce this pass. Do not rerun summarize.py after final APK fields are added without preserving build metadata.

Use the repaired Chrome at `recovery-test62/browser/chrome-headless-shell-linux64/chrome-headless-shell`; the old browser-runtime binary is truncated. HTTP server and browser must run in the same exec namespace. Regression saves per-page output and resumes existing pages. One Wolverine page was slow but completed; comparison workers finished all pages. No active local test sessions remain. Original source archives and APKs are persistent user files; recover them and exact Git source if temporary files disappear.

Next work: the42 empty story pages and the incomplete maps. Prioritize foreground/balloon connections and colored frame rails. Never count larger merged regions or clipped speech balloons as successful frame recovery. Preserve all133 currently accepted Apocalypse owners and221 earlier control pages. Broader generalization is still unfinished.

Build completed successfully. Artifact10930344668, ZIP7,596,457bytes/SHA256 `448040c5b5bc8861a4033ecdd60498531b445e07f9560e9e3e9acc536b250150`. APK `Nth-Shelf-2.79.63-Test63.apk`,3,321,266bytes/SHA256 `432dffdfe8da7a778632f3bab4511e66bf954aee0cf11704c63b3c03529ec667`. CI signaturev2, package/version, ZIP integrity and all71 packaged web assets verified. Saved APK `libfile_3d867d0071608191829588bc0052c8af`, local `recovery-test63/Test63/Nth-Shelf-2.79.63-Test63.apk`. This build is ready for the user; phone acceptance and remaining42 empty pages are outstanding.


</details>

<a id="archive-handoff-2-79-64-md"></a>

<details>
<summary>HANDOFF-2.79.64.md — historical checkpoint</summary>

# Test64 — stable splitting of merged matte cells

Continued from Test63 final commit 9495549ece55f9ff915b86c099c051c53469b666. Current project: nth-shelf-current, branch Test_Branch. Do not use the stale nth-shelf directory. User requests new detector ideas followed by cross-comic/manga regression checks; resume automatically after interruptions.

New idea: refine the topology of existing, validated version-1 matte component masks. Erode at radii 2 and 4 to propose substantial owners, then flood back inside the original mask by maximum path clearance. Both radii must agree at every pixel. Reject broad seams, small appendages, heavily overlapping bounds, incomplete coverage and uncertain ownership. The children form an exact disjoint union of their parent. No pixel is removed, added or assigned twice. Other identities remain unchanged. This corrects some old paper-island merges across jagged gutters that did not have a straight dark divider. It does not use page numbers, filenames, hashes or stored coordinates at runtime.

Implemented in panels-matte-cells.js and applied once at the final PanelDetect resolution. Version-3 matte proofs retain the original validated parent and are checked against a deterministic reconstructed partition. The geometry router holds the same contours. A bounded serialized cache prevents descriptor mutation from bypassing validation and avoids rerunning erosion on every tap. Shell 2.79.64 / map-exp62 invalidate older maps. Isolated Android package io.github.bdredenbach.nthshelf.frametest64, version 2.79.64/code27992.

Six expected changes, seven additional owners: Apocalypse issue2 p16 (3→4), issue3 p14 (4→5), issue3 p15 (3→4), issue4 p6 (4→5), issue4 p18 (2→4), issue4 p19 (2→3). Existing incomplete masks remain incomplete: issue2 p16 still joins the lower-right frame to the bottom strip; issue3 p14 retains a merged middle-right pair and missing balloon interiors; issue3 p15 still joins the middle pair; issue4 p18 and p19 retain missing balloon interiors. Issue4 p6 appears to show all five intended frames. Do not call all six pages fully repaired. The 42 empty story pages from Test63 remain empty. Current owners are expected to be 140, but owners are not a semantic accuracy score.

Local retained contracts passed. New contract: 13 child proofs, 221 rejected mutations, exact disjoint preservation of 1,242,451 source-mask pixels across six parents, geometry-router round trips, idempotence and retained-neighbor checks. Synthetic disconnected, one-pixel and broad connections tested at two sizes. Compressed geometry fixture contains no artwork. Full 312-page integrated comparison and 150 reader taps were running when this source checkpoint was prepared; final outcomes and APK verification will be recorded separately before delivery.

Rejected experiments in recovery-test64: white balloon-component barriers and general clearance watershed recovered some useful candidates but also clipped speech balloons / sound-effect lettering or split artwork. They were not shipped. Further work is still needed for connected foreground/balloons, colored rails, missing balloon interiors and empty maps. Do not relax thresholds merely to raise the count.

Reproduction: recovery-test64/candidate.cjs (uses Test63 saved maps; writes candidate outputs), regression.cjs (312 actual browser detections), anchors.py / reader.cjs (six changed pages, 25 owners), retained.sh, overlay.py. Current outputs under recovery-test64/candidate, final, reader, regression.log, reader.log and retained.log. Baseline maps recovery-test63/final; canonical RGBA recovery-test62/baseline. Sources and manifests in root book directories. Repaired Chrome: recovery-test62/browser/chrome-headless-shell-linux64/chrome-headless-shell. HTTP server and browser must share one exec namespace. Full regression checkpoints per page; Wolverine page18 takes about two minutes and is not stalled. This source checkpoint starts Test64 CI; record run/artifact/SHA after success. Phone acceptance remains pending.

Final local verification: all 312 integrated browser comparisons passed, exactly six expected map changes and 306 byte-for-byte unchanged maps, including all 221 earlier manga/Magneto/Wolverine pages. All 150 touch selections passed across 25 owners; 61222 dense interior opacity checks passed, together with foreign-owner transparency checks. All 25 rendered pop-outs were inspected. The six refined parents preserve an exact union of 1,242,451 original selected pixels. Existing missing balloon interiors are explicitly retained as failures; no general accuracy claim. Source commit 012a044696730d9e7d2cb1050ee9ea4faed30cf0, tree0fbebc5beb657fad8f50a71a7c4371f20eba56f9. APK run36317873477 in progress.

Build completed successfully. Run36317873477/artifact10931655411. Downloaded ZIP7,894,533bytes, SHA256 `9575278685bddfb759f1c81c818ae03c55c332e724e3480625092fbaf8375ef9`. APK `Nth-Shelf-2.79.64-Test64.apk`,3,323,638bytes, SHA256 `5d36aa6840e28756cef6d3b2ec7e78866a2e042d7cc4f720d9cf4c75385dfb5c`. Signature v2 and Android identity passed in CI; downloaded ZIP integrity, APK hash and all71 packaged web assets checked against local source. Saved APK `libfile_77eb7fc0412881919aaf8ffde838a58e` at `recovery-test64/Test64/Nth-Shelf-2.79.64-Test64.apk`. User phone acceptance remains pending. No active local test jobs remain. All requested comparison work for this iteration is complete; broader semantic recovery remains unfinished.


</details>

<a id="archive-handoff-2-79-65-md"></a>

<details>
<summary>HANDOFF-2.79.65.md — historical checkpoint</summary>

# Test65 — restore enclosed white bodies and recover a native-raster frame

Continued from Test64 final commit 93365ad81336a752cea18d02fb90e7fe0dfa327d. Current project nth-shelf-current; branch Test_Branch. User asks to keep working on Apocalypse frame pop-outs with cross-book regression protection. Resume automatically after interruptions.

The matte detector can leak through pale antialiased balloon outlines and classify enclosed white speech/caption interiors as exterior paper. Test65 detects enclosed white components with internal ink, fills their lettering holes, and assigns them only to a clearly surrounding accepted owner. At least60% of the four-pixel exterior band must support that owner and at least98% of nonempty ownership must agree. A body cannot contain pixels already owned by a different frame. No prior selected pixel is reassigned or removed. Extension is limited to one adjacent dark pixel. Ambiguous, blank, open, huge and conflicting regions are withheld. Version-4 matte proofs retain their parent and bounded repair evidence; validation reconstructs the exact additive union, while cached serialized results preserve mutation checks. This repairs full-frame crops; it does not implement the later standalone bubble pop-out task.

36 white speech/caption bodies restored across20 owners on nine Apocalypse pages: issue2 p13; issue3 p6,p11,p12,p13,p14; issue4 p18,p19,p20.161,879 omitted pixels restored. Some balloon chains remain missing when their ownership is ambiguous. Existing multi-scene composites remain merged. Do not claim these nine pages are fully correct.

The final empty-map fallback also checks native pixels using the existing matte detector and retains only unsplit compact cells occupying at most48% of the page, with at least85% envelope occupancy and no substantial unresolved internal gutter. This recovers the top frame of issue2 p14, previously an empty page. Its lower three scenes remain withheld as an unresolved composite. Issue4 p17's apparent two halves were rejected as oversized composites. No page/title/filename/hash lookup or fixed coordinates enter runtime detection. Expected totals:141 Apocalypse owners;41 story pages still empty. Owner count is not semantic accuracy.

New contract passed21 captured proofs (20 repairs and one native cell),389 rejected mutations, exact additive unions, original-pixel preservation, restored bodies including ink holes, geometry-router round trips, idempotence, ambiguous-owner rejection and blank-white rejection. Synthetic body repair and three-frame native recovery tested at two sizes. Geometry fixture is compressed, contains no comic artwork, and is decoded using Node core libraries. Full312-page browser comparison, retained contracts and198 reader taps were in progress at this source checkpoint; final outcomes will be recorded before delivery.

Version2.79.65/code27993; package io.github.bdredenbach.nthshelf.frametest65; shell2.79.65/map-exp63. Detection changes in panels-matte-cells.js and final resolution in panels.js. Other files are version/build metadata. The source checkpoint triggers Test65 APK CI, followed by signature, package and exact web-asset verification.

Private work: recovery-test65/candidate.cjs produces ten candidate maps from Test64 outputs; regression.cjs compares all312 actual browser detections; anchors.py/reader.cjs test21 affected owners, including72 taps on restored white interiors and lettering. Original overlays and balloon-trial.py established the repair scope. Native trial rejected the other merged candidates. Outputs in candidate, final, reader and logs. Baseline recovery-test64/final. Canonical RGBA recovery-test62/baseline. Repaired Chrome recovery-test62/browser/chrome-headless-shell-linux64/chrome-headless-shell; browser and HTTP server must share one exec namespace. Wolverine p18 is slow, not stalled. Do not rerun result summarization after APK metadata is appended.

Remaining work:41 empty story pages, disconnected or merged scenes, ambiguous balloon chains and missing art. Accuracy remains ahead of speed in the agreed roadmap. Keep the prior221 manga/Magneto/Wolverine maps unchanged unless a separately reviewed correction is authorized. Phone acceptance pending.

Final local verification: all312 integrated browser comparisons passed; exactly10 expected map changes,302 byte-for-byte unchanged maps, including all221 earlier manga/Magneto/Wolverine pages.198 touch selections passed across21 affected owners, including72 taps on restored white interiors and ink. 41142 dense interior opacity samples and foreign-owner transparency checks passed. All21 affected pop-outs inspected. Significant old white omissions still visible on issue3 p6,p11,p13 and issue4 p18,p19; these are retained failures, not regressions or completed pages. Source commit9361e57465ddd212e9dce3265525fa530b0687bc, treefa8f22579bbf7d9c597db7770a3d680c9e5d8656. Build run36319350524 succeeded. APK artifact verification and persistence follow.

Final artifact: successful run36319350524/artifact10932455328, ZIP8,246,102bytes/SHA256 `705dca14f80de61da971a49474fbe39f6e13802e11f1ec0495e3c44845334d85`. APK `Nth-Shelf-2.79.65-Test65.apk`,3,326,806bytes/SHA256 `cf14f22698da9d2b5912740a87845a0faeef9dbdcc802f3475b8edf0dbed0dde`. APK identity/signaturev2 passed in CI; downloaded archive integrity, APK digest and all71 packaged web assets matched source. Saved APK `libfile_6921928f9bcc81918dc76e4114654fe6`, local `recovery-test65/Test65/Nth-Shelf-2.79.65-Test65.apk`. All local jobs are complete. User asked whether the session timed out during the build; it had not, and verification continued to completion. Phone acceptance is still pending;41 empty story pages and incomplete crops remain.


</details>

<a id="archive-handoff-2-79-66-md"></a>

<details>
<summary>HANDOFF-2.79.66.md — historical checkpoint</summary>

# Test66 — independent Apocalypse recovery

Base: Test65 commit `9361e57465ddd212e9dce3265525fa530b0687bc`, branch
`Test_Branch`, repository `bdredenbach/Nth-Shelf`. The user requested continued
Apocalypse frame work with cross-comic and manga regression protection. Accuracy
remains ahead of speed; standalone bubble selection comes later.

Three image-derived additions:

1. Proof 21, continuous exterior gamut: adjacent saturated edge-palette samples
   form a continuous ramp. Independently enclosed, compact, unsplit cells may be
   appended only with zero overlap against existing owner pixels. This recovers
   issue 1/page 14's tall upper-left scene and complete dialogue chain. The
   previous discrete palette left false narrow strands reaching the page edge.
2. Proof 22, stable paper cells: radius-4 and radius-6 seed masks independently
   reconstruct the same cell. Tiny disagreement must be witnessed beside
   exterior paper or a measured narrow unlettered white corridor with a
   separately accepted neighbor on its opposite side. This recovers issue
   3/page 5's two lower-left tall scenes. The gap between them is a sealed paper
   island, so a page-edge-only witness correctly withheld the first prototype.
3. Proof 23, chromatic rims: equal hue-bin treatment, narrow colored strokes
   with dark collars, four measured sides, and an enclosed textured interior.
   Speech bodies are owned only with strong surrounding support; ambiguous
   ownership defers the cell. This recovers issue 1/page 9's center scene and
   top balloon, excluding the foreground balloon that occludes its lower-left
   corner. Multiple candidates must have no overlapping pixels.

All routes are late supplements; paper and chromatic-rim recovery require an
empty prior map. Existing detected owners keep their descriptors and order.
No runtime page, book, title, filename, hash, saved-coordinate, or tap lookup.
The fixture files contain geometry and evidence, not comic artwork.

Integration preserves the new proof types through the geometry router. Their
complete contour masks are authoritative during rendering: the old edge-spill
heuristic must not append unrelated margin artwork to these new owners. The
actual reader test exposed an unrelated red rail above issue 1/page 9; the
targeted guard leaves all previous proof versions unchanged.

Test identity: version `2.79.66`, code `27994`, package
`io.github.bdredenbach.nthshelf.frametest66`, label `Nth Shelf Test66`, shell
`nth-shelf-shell-2.79.66`, map `panel-map-exp-64`, proof `frame-proof-2.79.66`.
Build and final validation are recorded in `docs/evidence/validation/TEST66-VALIDATION.json`.

Private reproduction workspace: `/workspace/scratch/8938e7fc41fe`. Current
repository is `Nth-Shelf`; do not edit the old checkout. The original corpus
and Test65 baseline are under `/workspace/scratch/9419335135cd`.
`recovery-test66` contains immutable web-asset snapshots, the full native-browser
comparison, manually selected semantic taps and exclusion points, reader alpha
checks, resize checks, and APK verification. `audit/visual-audit.json` records
independent visual review. Individual trials are in `detector-review`,
`white-gutter-recovery`, and `colored-rim-trial`.

Known scope: four added owners on three partial pages. Other missed and merged
scenes, ambiguous balloon chains, decorative borders, and foreground overlaps
remain unresolved. Do not equate owner counts with semantic accuracy. Phone
acceptance remains pending. Continue from the final saved checkpoint after an
interruption instead of repeating completed corpus work.

Final local verification passed on frozen web assets
`f1178cf4da1c21be8ee77721eee79e8f08db7934c489a0ee991077b239ce12ad`.
The integrated native-browser comparison covers 312 pages: 309 unchanged;
only issue 1/pages 9 and 14 and issue 3/page 5 changed. Every prior owner was
preserved, including all 221 earlier Wolverine, manga, and Magneto maps.
Apocalypse owners increased from 141 to 145. The four new selections passed
46 actual reader taps, 26 manually chosen positive points, 14 exclusion points,
5,991 dense opaque samples, 530 positive and 220 exclusion alpha checks, and
independent inspection of all four final reader screenshots. Six resize page
variants at 0.67×/1.5× passed eight owner comparisons (minimum IoU 0.9866557)
and every semantic inclusion/exclusion check. The complete-contour rendering
contract verifies four new crops and preserves three legacy spill owners.
All retained gates and the three new detector contracts passed. No additional
runtime edits or optional regression repetitions are needed before delivery.

Source published as `186e9e9f29ed505e62746ff859219cf9fbeba7e7` (tree
`e9e5528efc9644d7731780cd82b098e92666aa9c`), identical to the local
verified tree. CI run `36321640630` passed all gates and produced artifact `10932623179`.
The isolated Test66 APK was downloaded and verified: 3,339,970 bytes,
SHA-256 `96cc53f1e6542981a97e10d9d9a201e5645f89d06aca179833c7e28b61807a07`.
All 73 packaged web assets match the tested checkout exactly. Package identity,
version, archive integrity, and the CI apksigner v2 result passed. The downloaded
artifact ZIP also matches GitHub digest
`067aaa115586041dc3d8d260379e9989dc2fffcbe891d43fc8f1485597885345`.
Phone acceptance remains pending; the four new frame targets are listed above.


</details>

<a id="archive-handoff-2-79-67-md"></a>

<details>
<summary>HANDOFF-2.79.67.md — historical checkpoint</summary>

# Test67 — paired chromatic Apocalypse inset recovery

Base: verified Test66 checkpoint `555d0c3f5a7c01a576864c1e29ffc1ec4706f003`, branch `Test_Branch`, repository `bdredenbach/Nth-Shelf`. Accuracy remains ahead of speed; standalone bubble selection comes later.

Test67 adds proof version 24, `paired-chromatic-perimeter-components`, as a late empty-map fallback inside `PanelColoredRims`. It addresses decorative colored inset borders whose four sides are split between one or two nearby connected color components. Candidate unions need four supported sides, at least two strongly supported sides, low chromatic fill, a textured interior, bounded page margins, and no competing high-overlap owner. The runtime scan is reduced to a maximum 480-pixel dimension after Test66 chromatic-rim recovery abstains.

On the supplied four-issue Rise of Apocalypse archive (91 page images), direct proof-24 scanning returned owners on exactly one page: issue 4/page 11. Test66 returned zero there; Test67 returns two complete rectangular owners corresponding to the tall upper-left blue-bordered inset and the wide lower-right blue-bordered portrait inset. The new route abstained on the other 90 Apocalypse pages.

The detector remains image-derived. Runtime code contains no book/title/filename/page/hash/tap lookup or saved target coordinates. Proof version 24 is routed as authoritative complete-contour geometry, and reader edge-spill expansion is disabled for that proof just as for Test66 proofs 21–23.

Retained Test66 contracts for continuous gamut, stable paper, colored rims, and reader contour behavior pass. Test67's synthetic contract passes at two sizes with four owners total, including split and single-component perimeters; open frames and flat interiors abstain; 14 proof-tamper mutations are rejected. The full historic 312-page artwork corpus is not present in this chat runtime, so do not claim a new 312-page pixel-for-pixel comparison for Test67. CI retains all repository contracts; phone acceptance is still required.

Identity: version `2.79.67`, code `27995`, package `io.github.bdredenbach.nthshelf.frametest67`, label `Nth Shelf Test67`, shell `nth-shelf-shell-2.79.67`, map `panel-map-exp-65`, proof `frame-proof-2.79.67`.

Source published as `d7989792a6514827d832d03b4427a6a3abe437a2` (tree
`3784a553bc925bfcce40c20cecc96d37fd1aa372`). CI run `36329590592`
passed every gate and produced artifact `10934663473`. The isolated Test67 APK
is 3,342,014 bytes with SHA-256
`acb78a0de035ff95d651ddca3f396e8f2a042173981f6107b36dc83a170af6e8`.
The downloaded artifact ZIP SHA-256 is
`33083b88d9399207d53abb4e1c20dbd41fa7d87be1bf63406de8452f5456a286`.
All 73 packaged web assets match the tested source exactly. Package identity,
version/label, archive integrity, and CI apksigner v2 verification passed.
Phone acceptance remains pending.


</details>

<a id="archive-handoff-2-79-68-md"></a>

<details>
<summary>HANDOFF-2.79.68.md — historical checkpoint</summary>

# Test68 — occluded dark overlay inset recovery

Base: verified Test67 branch checkpoint `e1ae37a0d76eb9a934f985c075cc2ae02480eb8d` on `Test_Branch`, repository
`bdredenbach/Nth-Shelf`. Accuracy remains ahead of speed; standalone bubble
selection comes later.

Test68 adds proof version 25,
`three-dark-rails-one-occluded-overlay-rail`, as a late empty-map fallback. It
addresses a framed inset placed over continuous artwork when foreground content
obscures one border. Three rails must be independently complete, the fourth must
remain the unique partially supported rail, exterior contrast must witness all
four sides, and the enclosed scene must remain strongly textured. Analysis is
capped at 480 pixels on the longest side and runs only after Test67's chromatic
rim recovery abstains.

On the supplied four-issue Rise of Apocalypse archive (91 page images), direct
proof-25 scanning returned exactly one owner: issue 4/page 15, the large upper
black-framed inset. It abstained on the other 90 pages. In the complete detector
pipeline, Test67 returned zero owners on that page and Test68 returns one proof-25
owner. A retained full-pipeline check on issue 4/page 11 still returns the same
two proof-24 blue-bordered insets from Test67.

The detector is image-derived. Runtime code contains no book/title/filename/page/
hash/tap lookup or saved target coordinates. Proof version 25 is routed as
authoritative complete-contour geometry, and reader edge-spill expansion is
disabled for proof 25 just as for proofs 21–24.

Local validation: Test68 synthetic positive/negative and proof-tamper contracts
passed; retained Test66 continuous-gamut, stable-paper, colored-rim contracts
passed; retained Test67 paired-chromatic contract passed after its contour-authority
assertion was advanced to include proof 25. The historical 312-page Wolverine,
manga, and Magneto artwork corpus is not present in this chat runtime, so do not
claim a fresh pixel-for-pixel 312-page comparison for Test68. CI retains all
repository regression contracts and browser/native gates; phone acceptance is
still required.

Identity: version `2.79.68`, code `27996`, package
`io.github.bdredenbach.nthshelf.frametest68`, label `Nth Shelf Test68`, shell
`nth-shelf-shell-2.79.68`, map `panel-map-exp-66`, proof
`frame-proof-2.79.68`.

Source published as `958a519d8f91b5244c739e67955bcf2be98db1f3` (tree
`97e7c837e61abbfe2376e6bcc0da5ec4a3aafae7`). CI run `36333687581`
passed every retained detector, browser, native, Android build, package-identity,
asset-integrity, and signature gate and produced artifact `10936447029`.

The isolated Test68 APK is 3,346,222 bytes with SHA-256
`3ba88ff9dd9ee370dd1927ee059e50e6c688c3d1041b104a66eb25a451690d49`.
The downloaded artifact ZIP SHA-256 is
`0d7d2e53fb56fc634c7d97c68dcd5190d837ed91398cea5ed3c44a41293ba4df`;
the source archive SHA-256 is
`2b56dc8d66ce2cee73b2d79f9845348d98cfffb537a2f1388948143436ceab73`.
All 74 packaged web assets match the tested source exactly. Package identity,
version/label, archive integrity, and CI apksigner v2 verification passed.
Phone acceptance remains pending.


</details>

<a id="archive-handoff-2-79-69-md"></a>

<details>
<summary>HANDOFF-2.79.69.md — historical checkpoint</summary>

# Test69 — explicit orthogonal white-gutter proof

Base: verified Test68 branch checkpoint `77e25a6a08c7b49673c446c0fcf9213e39f28a98`
on `Test_Branch`, repository `bdredenbach/Nth-Shelf`.

The user asked to make clean orthogonal white gutters an explicit detector
capability after the existing Test68 APK demonstrated that Rise of Apocalypse
issue 2/page 6 already popped all six cells correctly.

Test69 adds proof version 26, `orthogonal-white-gutter-grid`. It deliberately
reuses the existing proof-18 paper-cell ownership raster instead of running a
second image scan. A map is promoted only when all owners are existing valid
paper cells, no inferred split/recovery is involved, the page edge is fully
paper, owner/seed fill are strong, and the owner envelopes form coherent
near-orthogonal rows separated by narrow paper gutters. The source pixel
contours and x/y/w/h geometry are preserved exactly.

A direct scan of all 91 supplied Rise of Apocalypse images found exactly one
qualifying page: issue 2/page 6. Its six proof-18 owners become six proof-26
owners in two rows; the other 90 pages abstain. This is an explicit semantic
proof of the white-gutter layout, not new geometry.

Runtime code contains no title, filename, page number, hash, stored target
coordinate, or tap lookup. Proof 26 is routed as authoritative complete-contour
geometry and is excluded from unrelated edge-spill expansion.

Local synthetic validation passed a 2×2 white-gutter grid, rejected vertical
misalignment and a cross-row art bridge, rejected 12 proof tamper mutations,
and verified source geometry remains identical. Retained Test67/Test68 contour
contracts were advanced to recognize proof 26. The historical 312-page
Wolverine/manga/Magneto artwork corpus is not present in this chat runtime;
GitHub CI remains the retained regression/build gate before phone acceptance.

Identity: version `2.79.69`, code `27997`, package
`io.github.bdredenbach.nthshelf.frametest69`, label `Nth Shelf Test69`, shell
`nth-shelf-shell-2.79.69`, map `panel-map-exp-67`, proof
`frame-proof-2.79.69`.

Source published as `424580427c94e50973bf99baf2b682d8b47e290a` (tree
`5e0b548cb5e05486b8918b3cc79eb71b995366f9`). CI run `36342463997`
passed every retained detector, browser, native, Android build, package-identity,
asset-integrity, and signature gate and produced artifact `10939582568`.

The isolated Test69 APK is 3,349,007 bytes with SHA-256
`a84e1c6bd2320eaf1b7c097ed4c6367ef5f9598573aba20cdc167da66b720df7`.
The downloaded artifact ZIP SHA-256 is
`9db015ff5fb2afb98b553a411f260165dba48a4123ca2dbff7997280383b3fa8`;
the source archive SHA-256 is
`fc3bc5ad2d3c8e8484034dc8421242120470e0f437a8c032066824ff56625a7e`.
All 75 packaged web assets match the tested source exactly. Package identity,
version/label, archive integrity, and CI apksigner v2 verification passed.
Phone acceptance remains pending.


</details>

<a id="archive-handoff-2-79-70-md"></a>

<details>
<summary>HANDOFF-2.79.70.md — historical checkpoint</summary>

# Test70 — first stable interrupted-white-gutter recovery

## Starting point

Repository: `bdredenbach/Nth-Shelf`, branch `Test_Branch`. The branch was read at `864df8e05266c6d03422d0480fbe65c10f638871` (finalized Test69 documentation). Runtime sources came from the supplied Test69 build archive, commit `424580427c94e50973bf99baf2b682d8b47e290a`. The user confirmed Test69 worked. No GitHub writes occurred during this iteration.

## Change

`js/panels-interrupted-gutters.js` is an optional late wrapper around PanelDetect.detect. It reconnects short aligned white corridor gaps only with exposed endpoint runs and measured artwork/exterior-paper support. Seed separation uses a new opt-in repair mask in PanelRaggedGutters; the default path remains unchanged. Two gap limits must return identical contours. Candidates already detected by the default pass, competing envelopes, or any old-owner raster overlap are withheld. Accepted panels append without replacing or reordering old descriptors.

The new evidence lives inside validated proof 19/20 as `interrupted`; it is not proof 27. The existing structural-grid router delegates through PanelRaggedGutters.validPanel. PanelEdgeSpill abstains specifically for a valid repaired contour to avoid adding unrelated margin art. Both direct RGBA and image edge-spill entry points are guarded. New module load order is after panels.js, before reader/geometry use. Service worker and map identities are advanced.

## Actual result

**Rise of Apocalypse #3 — image index 6 (`006.jpg`), reader 7/23.** The wide pointing-guard/fire scene below the upper-right scene now pops as one complete visible contour, with both speech balloons. Test69 had one owner on that page; Test70 has two. The old upper-right owner remains byte-for-byte identical in the serialized descriptor.

All 91 final native-browser page maps were compared: 90 exact matches, only the target changed, all 148 previous owners preserved, 149 total afterward. Actual Reader touchscreen and canvas checks passed 12 taps, 144 positive alpha samples, 108 exclusion samples, and 7,877 dense interior samples. The two resizes (0.67× / 1.5×) and horizontal mirror passed the same 12 positive and nine exclusion positions. Independent visual review of the final crop and reader overlay found the intended scene and balloons preserved.

All 61 local Node contract commands in the prepared CI gate passed, including the retained prior fixtures, plus JS syntax and service-worker checks. Native Java archive tests passed. Do not claim a fresh 312-page Wolverine/manga/Magneto artwork run: those original files are not in this runtime. Do not claim general branding/backup browser CI passed; only the actual targeted offline reader harness and native archive tests ran here.

## Build and publishing status

Version `2.79.70`, code `27998`; shell `nth-shelf-shell-2.79.70`, map `panel-map-exp-68`, proof identity `frame-proof-2.79.70`. Intended Gradle/CI package: `io.github.bdredenbach.nthshelf.frametest70`.

GitHub connection currently exposes reads but no create/update/ref tools. No repository push and no GitHub CI run were performed. Source and workflow changes are prepared for publication when write access is available. Do not mistake earlier conversation write-tool names for currently invokable tools.

A separate local APK was made from the supplied, verified Test69 native shell, with all 76 web assets matching the final tested files. Only fixed-length package/label/version/user-agent fields change in native data; DEX checksums were recomputed. Its separate package ID is `io.github.bdredenbach.nthshelf.frameloc070`, label `Nth Shelf Test70`. This avoids replacing Test69 or colliding with a future CI Test70 install.

It is locally signed with APK Signature Scheme v2, verified using an AOSP-format parser and cryptography. The same verifier independently accepts the known Test69 CI APK; a tampered new APK is rejected. ZIP CRCs, native manifest identity, DEX checksums, stored-entry alignment, and exact packaged web assets passed. There was no fresh native compilation, SDK apksigner invocation, emulator, or physical installation test. Phone installation and behavior acceptance remain pending. No private signing key is distributed.

See docs/evidence/validation/TEST70-VALIDATION.json for exact APK hash, byte count, test records, and limitations. The first prototype's unrelated-neighbor cases were rejected, not shipped. The user-facing next test is the new pointing-guard/fire frame on 7/23, plus the previous upper-right frame for comparison. Broader interrupted gutters and speed remain future work.


</details>

<a id="archive-handoff-2-79-71-md"></a>

<details>
<summary>HANDOFF-2.79.71.md — historical checkpoint</summary>

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


</details>

<a id="archive-handoff-2-79-73-md"></a>

<details>
<summary>HANDOFF-2.79.73.md — historical checkpoint</summary>

# Test73 — rooted shared-boundary completion

Baseline: phone-confirmed Test71, repository `bdredenbach/Nth-Shelf`, branch
`Test_Branch`, commit `d64931b09daf2dc10b76098a657cc2d6a24300fd`.
The Test72 source-only prototype is not the regression baseline. Its replacement
of the Test71 validator and its proximity-only fallback are not published here.

## Results

The final local original-image comparison covers all 91 Apocalypse pages.
89 maps are identical; all 150 existing descriptors are preserved in order.
The total rises to 154. Exactly two pages change:

- Issue 3, image8, reader9/23: 3 -> 6. New left tall scene, lower-wide scene,
  and bottom-wide scene, including their speech balloons.
- Issue 1, image18, reader19/24: 1 -> 2. New lower-left scene, now recovered
  with measured gutter evidence rather than the Test72 proximity fallback.

All four crops were visually inspected. Native Chromium actual-reader testing
passed 33 new-frame taps, 30 prior-frame taps, 273 inclusion-alpha checks, and
198 exclusion-alpha checks. Dense checks passed 130,871 distinct interior samples
and 33,865 exterior samples across the four rendered crops. Six page variants
(0.67x, 1.25x, horizontal mirror for each target page) passed every semantic probe.
The old Test71 spread's two selections were also tapped independently.

The historical Wolverine/manga/Magneto original artwork was unavailable. Its
saved contracts were retained; do not claim a fresh 312-page artwork comparison.
The minimal offline Chromium reader harness is not physical Android acceptance.

## Implementation

`panels-ragged-gutters.js` now permits radius8 in the cooperative candidate API
and accepts its matching source evidence. Existing calls and their radius choices
are unchanged. `panels-neighbor-completion.js` remains byte-for-byte Test71.

The new `panels-shared-boundaries.js` supplement uses proof29. It compares source
candidates at radii4/6 or6/8, reconciles already-owned pixels without changing
old owners, and requires remaining differences to be small and boundary-local.
The final mask is the shared consensus, not a guessed rectangle. Reconstruction,
blocked pixels, complete contours, rooted neighbors, and measured shared rays
are checked by the validator. Earlier proof27 objects are never promoted or
rewritten. The new route preserves full contour geometry and suppresses the
unrelated edge-spill heuristic only for its own validated proof.

Multiple accepted neighbors can collectively witness one border. A recovered
node may support the next row, but evidence must trace back to an old accepted
root. Depth is bounded at3 and cyclic proofs fail. A white edge wedge is not
mistaken for a substantial internal divider; truly merged or unsupported cells
still abstain. No runtime title, filename, page number, image hash, saved target
coordinate or tap template is used.

## Validation and limitations

All 63 retained/new Node test commands, all JavaScript/service-worker syntax,
and native archive tests passed locally. The native test includes a600MiB stream
under a32MiB heap. The new contract rejects27 malformed/cyclic proofs.
One preliminary concurrent browser sweep stalled; it was resumed from saved
pages in a fresh browser, and all91 final comparisons completed. A preliminary
negative probe in the bottom panel was corrected after source-image inspection:
it lay inside that panel's protruding upper edge. No detector change was needed.

Build identity: 2.79.73 /28001, package
`io.github.bdredenbach.nthshelf.frametest73`, label `Nth Shelf Test73`.
Web cache `nth-shelf-shell-2.79.73`, map `panel-map-exp-71`, proof
`frame-proof-2.79.73`. The native engine itself is unchanged from Test71.

**Verified fresh GitHub Actions / Gradle build.** Source commit `05c50439999d802ec21e6a053fff67739ace49f9` (tree `82f25897a2c31f279444518aa7eb0a46dc4c39fc`) is published on `bdredenbach/Nth-Shelf`, branch `Test_Branch`. CI run **36359681762**, artifact **10945705579**, passed every retained detector, browser interaction, backup round-trip, native archive, Android compilation, package-identity, asset-integrity and signature gate.

The APK is version **2.79.73**, code **28001**, package `io.github.bdredenbach.nthshelf.frametest73`, label **Nth Shelf Test73**. It is a fresh build, not a modification of an older APK. It uses a CI debug signing key, not a Play Store production key.

After downloading, ZIP integrity, artifact digest, APK digest and identity were checked. All **78 packaged web files** match the frozen local source exactly; all **31 changed source/test/documentation files** in the source ZIP also match. CI verified APK Signature Scheme v2.

- APK: **3,365,085 bytes**.
- APK SHA-256: `a7363590a954cbad7f76f24de30d13e2384133dfd1a4dedeb25498772f135db9`.
- Artifact ZIP SHA-256: `cb00aded9c68cbd014ea21f6ea19685022db28f84287f2bce8cc4a783e91104b`.
- Source ZIP SHA-256: `ad782c9e57363465d96eca0ddea75eb7e4792d67d487b8d77ebc6a99135ef72b`.

The source ZIP captures the exact build checkpoint, so its pending build-status fields predate the completed run. This report and the repository's subsequent documentation checkpoint record final verification. No comic artwork, private signing key or font file is included in the source package. Physical Android acceptance is still pending.

Private source artwork and screenshots stay in `/mnt/data/test73_workspace`, not in the repository. A base64 fixture transfer typo was caught and corrected before publishing the source checkpoint. The 13-part numeric fixture matches the locally tested bytes.

</details>

<a id="archive-handoff-2-79-74-md"></a>

<details>
<summary>HANDOFF-2.79.74.md — historical checkpoint</summary>

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
and verified. This is not a local repackaging plan. Update docs/evidence/validation/TEST74-VALIDATION.json
and this handoff after verification. Phone acceptance remains pending.

Private working evidence: `/mnt/data/test74_workspace`, including original pages,
old/new full maps, failed trials, exact Reader crops, variant records and tests.
Do not commit source comic artwork or local diagnostic screenshots.


</details>

<a id="archive-handoff-2-79-75-md"></a>

<details>
<summary>HANDOFF-2.79.75.md — historical checkpoint</summary>

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
on this page. Test75 has two. See docs/evidence/validation/TEST75-VALIDATION.json and the per-page corpus
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


</details>

<a id="archive-handoff-2-79-76-md"></a>

<details>
<summary>HANDOFF-2.79.76.md — historical checkpoint</summary>

# Test76 — chromatic shared-border separation

## Baseline

Continue from verified Test75 source `eaae18fb4a259f372cc44a8506e8d77dc41b0fdb`.
Test75 records 161 Apocalypse selections and preserves all 159 earlier Test74
owners. This checkpoint adds only a new append-only image-derived detector.

## New recovery

Rise of Apocalypse #4, image index 13 / reader 14 of 21 contains two touching
red-rimmed inset scenes. A color-only closure sees one merged hole because the
shared side is completed by black ink. `panels-chromatic-shared-border.js` finds
an enclosed chromatic hole with exactly two stable eroded cores, then performs a
deterministic minimum-gradient-barrier split. The real shared edge must remain
strong in the source image. The two complete scenes, including their speech
balloons, are independent owners.

Saved Test75 baseline on this page: 0 owners. Test76: 2. Saved total: 163.
All 91 originals were scanned by the exact JavaScript supplement: 90 pages return
no proposal and issue 4 image 13 returns exactly two. The target also passes 0.67x,
1.25x and horizontal-mirror transforms. The synthetic contract rejects weak
contacts, open rims, flat scenes, broad bridges, prior-owner overlap and 20 proof
mutations.

## Invariants

- Test75 detector implementations and accepted descriptors are unchanged.
- Existing-owner pixels are a hard veto.
- No book/page/hash/tap identity lookup is present.
- General frame detection remains incomplete; this is one recovered frame family.
- Original comic artwork and private signing material are not committed.
- Physical Android acceptance is user-confirmed on the verified Test76 APK.

## Identity

Version 2.79.76, code 28004, debug package
`io.github.bdredenbach.nthshelf.frametest76`, label `Nth Shelf Test76`, cache
`nth-shelf-shell-2.79.76`, panel map `panel-map-exp-74`, proof identity
`frame-proof-2.79.76`.

## Acceptance

User-confirmed working on phone. GitHub Actions run `36631632763` completed successfully; verified artifact `11062780548`, APK SHA-256 `8447b7f591b4657c8c8530a440281deddb552e4056aedf6cb5f8a4adb9d2e07a`. This is the durable baseline for the next detector experiment.


</details>

<a id="archive-handoff-2-79-77-md"></a>

<details>
<summary>HANDOFF-2.79.77.md — historical checkpoint</summary>

# Test77 — narrow black inset rails

## Accepted baseline

Continue from the user-confirmed Test76 checkpoint on `Test_Branch`. Test76 has
163 accepted Apocalypse selections and its physical Android test was confirmed by
the user. Test77 is one append-only detector experiment; no Test76 detector logic
or accepted descriptor is rewritten.

## New recovery

Rise of Apocalypse #1, image index 11 / reader 12 of 24: the upper-left hand
scratching inset, including the full yellow `OR SO THEY HOPED.` caption and the
complete `SKRITCH` lettering. The existing lower owner on this page remains
unchanged. Saved page count: 1 -> 2. Saved corpus count: 163 -> 164.

`panels-narrow-ink-frames.js` requires four nearly continuous thin black rails,
two-sided contrast, textured/color interior evidence, no complete internal
composite authorization, and no overlap with a prior owner. Boundary tracing
follows the measured rail and then stays one analysis pixel inside the black rim.
Broad black fields, open borders, flat interiors, monochrome text-like boxes and
prior-owner overlap are rejected. No filename, page, hash, tap, or fixed-layout
lookup is used.

## Test76 compatibility fix

The abandoned pre-Test76 candidate used structural proof version32. Test76 now
owns proof32 for `two-core-stable-chromatic-shared-border`, so reusing 32 would
misroute accepted Test76 frames. The revalidated Test77 implementation uses
**proof version33**. Its synthetic routing contract explicitly proves that a
Test76 proof32 owner delegates unchanged through the new wrapper.

## Validation before publication

- Exact final JavaScript detector scan over all 91 supplied Apocalypse originals:
  raw candidates only on `1-011` and `2-003`.
- `1-011` is the new target. `2-003` already had one accepted owner in Test75 and
  is unchanged by Test76; the new route's prior-owner veto therefore rejects it.
- Test76 changed only `4-013`, so the accepted maps on `1-011` and `2-003` are
  inherited unchanged from the saved Test75 corpus comparison.
- Target crop review confirms the whole yellow caption and SKRITCH lettering are
  retained while the neighboring blue action panel is excluded.
- Target source transforms at 0.67x, 1.25x and horizontal mirror each return one
  valid narrow-ink owner.
- Synthetic contract: two owners; 19 malformed-proof rejections; open, broad,
  flat, monochrome and prior-owner negatives pass; Test76 proof32 delegation passes.
- Complete retained Test76 suite plus Test77 contracts finished locally with exit0.

Physical Android acceptance of Test77 is pending. Original comic artwork and
private signing material are not committed. Earlier Wolverine/manga/Magneto art
was not rerun for this checkpoint; their retained contracts remain the regression
safety net.

## Identity

Version 2.79.77, code 28005, debug package
`io.github.bdredenbach.nthshelf.frametest77`, label `Nth Shelf Test77`, cache
`nth-shelf-shell-2.79.77`, panel map `panel-map-exp-75`, proof identity
`frame-proof-2.79.77`. Narrow-ink serialized proof version:33.


</details>

<a id="archive-handoff-2-79-78-md"></a>

<details>
<summary>HANDOFF-2.79.78.md — historical checkpoint</summary>

# Test78 — empty-map isolated boundary recovery

## Baseline

Continue from the Test77 source checkpoint at 164 saved Apocalypse owners. Test76 remains the last explicitly phone-confirmed checkpoint. Test78 is append-only: it does not alter any accepted detector proof or descriptor.

## Scaled recovery

The experiment exposes an existing strict route rather than weakening a threshold. `panels-ragged-gutters.js` has carried proof version 20 (`independent-boundary-cell`, recovery mode `isolated-boundary`) since Test63. Test78 calls that recovery only after every established owner route has left `closed` empty. It publishes the result only when exactly one candidate is returned and `PanelRaggedGutters.validPanel` validates it again.

This means an existing owner has absolute priority. The new route cannot trim, replace, reorder, or supplement any of the 164 Test77 owners. A page with multiple isolated candidates also defers instead of guessing.

## Supplied Apocalypse corpus result

The exact recovery detector was scanned over the 39 maps still empty at Test77:

- Issue 2, image index 17 / reader 18 of 23: one complete isolated upper-right hand/scarab panel.
- Issue 4, image index 20 / reader 21 of 21: one complete isolated upper-right close-up/caption panel.
- Remaining 37 zero-owner maps: no recovered owner.

Saved corpus total: **164 -> 166**. Both target contours were visually reviewed against private overlays and stay inside their scene boundaries. Source transforms at 0.67x, 1.25x and horizontal mirror each return exactly one valid proof-version-20 owner on both targets. Original comic artwork is not committed.

## Rejected broader experiment

A color-tolerant whole-page gutter-graph trial was evaluated first because it produced candidates on nine pages. Its two candidates on the previously empty issue-1 image 12 were composite enclosures spanning multiple intended panels. That route is rejected and is not part of Test78.

## Regression boundary

Test78 keeps the Test63 v20 proof thresholds unchanged: unsplit connected seed, no more than one open page edge, compact occupancy, no substantial internal exterior gutter, and serialized contour validation. The retained Test77 suite plus the Test78 empty-map gate and service-worker identity contracts are the release gate. Earlier Wolverine/manga/Magneto artwork is not re-embedded or committed; retained contracts remain the regression safety net.

Physical Android acceptance of Test78 is pending.

## Identity

Version 2.79.78, code 28006, debug package `io.github.bdredenbach.nthshelf.frametest78`, label `Nth Shelf Test78`, cache `nth-shelf-shell-2.79.78`, panel map `panel-map-exp-75`, proof identity `frame-proof-2.79.78`. The recovered owner proof remains serialized version 20; Test78 changes only when that already-valid proof may be published.


</details>

<a id="archive-handoff-2-79-79-md"></a>

<details>
<summary>HANDOFF-2.79.79.md — historical checkpoint</summary>

# Test79 — stable top-row dual-barrier recovery

## Result

The supplied Rise of Apocalypse corpus advances from **166 to 169** saved owners. Test79 adds exactly three missing top-row panels on issue 3 reader 4. The two lower-page Test78 owners on that page remain unchanged and keep priority.

## Proof

The new route is generic and contains no book/page/tap lookup. It is gated behind 1–4 already-proven contour owners that all begin below y=0.45. A radius-8 cooperative ragged-gutter pass must independently expose one narrow, unsplit top anchor and one broad merged top region with aligned lower bounds. A second separator is then supplied by at least two pieces of interrupted-paper corridor evidence.

The two measured separators are injected only into seed separation. Final geometry is re-grown from original artwork by PanelRaggedGutters, and all three final contours must pass the existing validator at barrier half-widths 0, 1, and 2 with no more than two analysis pixels of envelope drift. New pixels must be disjoint from all established owners.

A 91-page proposal sweep found this exact proof on only issue 3 reader 4. The three final candidates are mutually pixel-disjoint and survive normal source, 1.25x scaling, horizontal mirroring, and JPEG quality 0.82 recompression. A 0.67x pre-resample removes the narrow-anchor evidence; the route safely withholds all three instead of weakening proof.

## Identity

Version 2.79.79, version code 28007, package `io.github.bdredenbach.nthshelf.frametest79`, label `Nth Shelf Test79`, cache `nth-shelf-shell-2.79.79`, panel map `panel-map-exp-75`, proof identity `frame-proof-2.79.79`. Physical Android acceptance is pending.


</details>

<a id="archive-handoff-2-79-80-md"></a>

<details>
<summary>HANDOFF-2.79.80.md — historical checkpoint</summary>

# Test80 — stable full-width torn-paper tiers

## Result

The supplied Rise of Apocalypse checkpoint advances from **169 to 174** saved owners. Test80 adds five owners on two portrait pages that were already carrying exactly one established owner:

- Issue 2, image index 14 / reader 15 of 23: **1 -> 4**. Three missing full-width torn-paper tiers are appended; the established top tier remains authoritative.
- Issue 4, image index 2 / reader 3 of 21: **1 -> 3**. Two missing full-width torn-paper tiers are appended; the established bottom tier remains authoritative.

No existing owner is replaced or reshaped.

## Proof

The route is generic and contains no book/page/tap identity lookup. It runs only when the established detector returns exactly one owner. On the 900-pixel analysis plane it measures per-row neutral-white support, smooths that support across five rows, and accepts only two or three strong internal paper separators.

Those measured separators are injected only as temporary seed barriers. Final geometry is re-grown from the original page pixels by the retained `PanelRaggedGutters` proof. The complete tier set must:

- contain exactly separator-count + 1 panels (three or four tiers),
- validate through `PanelRaggedGutters.validPanel`,
- remain within three analysis pixels at barrier half-widths 0, 1, and 2,
- span at least 90% of page width per tier,
- cover the page from the upper margin through the lower margin,
- place every measured separator at the seam between its adjacent pair,
- and contain exactly one tier that overlaps the already-established owner by more than 72% of the smaller envelope.

That matching owner is not republished. Only the remaining stable tiers are appended.

## Corpus screening

At the 169-owner checkpoint, eleven pages have exactly one owner. Only three of those also expose two or three qualifying paper-separator runs. One of the three (issue 2 reader 14) cannot produce a complete stable tier set and is withheld. The two pages above are the only accepted corpus hits.

The additions remain valid after 0.67x and 1.25x source scaling, horizontal mirroring, and JPEG quality-82 recompression. Original comic artwork is not committed.

## Identity

Version 2.79.80, version code 28008, package `io.github.bdredenbach.nthshelf.frametest80`, label `Nth Shelf Test80`, cache `nth-shelf-shell-2.79.80`, panel map `panel-map-exp-75`, proof identity `frame-proof-2.79.80`. Physical Android acceptance is pending.


</details>

<a id="archive-handoff-2-79-82-md"></a>

<details>
<summary>HANDOFF-2.79.82.md — historical checkpoint</summary>

# Nth Shelf Test82 handoff

Install the separate **Nth Shelf Test82** app (`io.github.bdredenbach.nthshelf.frametest82`, version **2.79.82**, code **28010**). The panel-map/cache identities are advanced to rebuild maps for the new detector.

On the supplied Rise of Apocalypse issues, check these new targets using reader page numbering, including the cover:

1. Issue 1, **7/24**: the large right-side lightning/child scene.
2. Issue 1, **17/24**: the full upper cavalry scene, without absorbing the lower scenes.
3. Issue 3, **10/23**: the middle-right energy attack scene, without absorbing the scene below it.
4. Issue 2, **18/23**: the upper-right hand/scarab scene should still work. This was already counted in the saved checkpoint and is a fallback check.

Also retain the Test79 top-row targets on issue 3 reader 4, and Test80 torn-paper targets on issue 2 reader 15 and issue 4 reader 3. Existing owner descriptors retain priority and are not trimmed, replaced, or reordered by Test82.

## Evidence and limits

The saved checkpoint is **174** frames. This environment's native-canvas baseline is **175**, and the new pass measures **179** across 91 pages while preserving all 175 local baseline descriptors. Eight saved/native per-page discrepancies are recorded in `qa27900/frame-accuracy/test82/corpus-comparison.json`. Four additions therefore do not mean four new frames over the saved 174: one was already accepted there.

The first three local additions are stable under all tested scale/mirror/JPEG variants. Issue 3 reader 10 survives original pixels, mirroring, and enlargement, but conservatively abstains after 0.67x pre-resampling or JPEG quality-82 recompression. Physical Android acceptance and its actual corpus total remain pending. Many pages still lack complete coverage; the 360+ request is unfinished.

The route requires independent seed consensus, supported boundaries, no unresolved internal divider, and no existing-owner pixel overlap. It uses artwork evidence rather than book/page fixtures. The reader preserves the full validated contour during cropping.

See `docs/evidence/validation/TEST82-VALIDATION.json` and `qa27900/frame-accuracy/test82/README.md` for test scope. CI's downloaded `BUILD.json` binds the APK hash and all packaged web hashes to the source commit; the debug signing key identifies a test build.


</details>

<a id="archive-handoff-2-79-83-md"></a>

<details>
<summary>HANDOFF-2.79.83.md — historical checkpoint</summary>

# Test83 / 2.79.83

Continue from accepted Test82 (`f887656a0b727937714e7f29c577798bedf3877e`). This checkpoint adds one original-page Apocalypse frame: issue 3 reader 23/23, lower-right scene. The local count moves 179→180; the saved 174 checkpoint from earlier builds is a different measurement. Do not present native-canvas totals as a confirmed phone count.

## Change

`js/panels-context-cells.js` appends proof 35 cells proven by two seed radii in a local window and its expansion, then checks the original page perimeter, content, dividers and zero owner overlap. The retained ragged-gutter API gains an explicitly selected single-cell candidate mode. Its existing policies and Test82 route stay unchanged. The reader skips the legacy spill adjustment for complete proof 35 contours. The service-worker shell and proof/map versions invalidate older cached maps; all 86 web files are frozen for CI packaging verification.

## Evidence and next test

The supplement comparison covers 230 original pages and preserves all 851 prior frame descriptors. Its only addition is the issue 3 final-page scene. The full integrated Apocalypse replay also passed all 91 pages: all 179 prior descriptor remains unchanged, with one new frame and 180 total. The new target survives original-source, 1.25x, mirror and JPEG quality82 replays; the 0.67x replay abstains. All74 retained suites passed locally and in CI. CI browser interaction/backup checks, native archive tests, Android build, signature and exact APK asset checks passed. The downloaded artifact hash, APK hash and all 86 packaged web files were independently verified. See `docs/evidence/validation/TEST83-VALIDATION.json` for the build source commit and results.

Install the isolated **Nth Shelf Test83** app and compare the lower-right frame on issue 3 reader 23/23 with Test82. Confirm the full speech balloons and scene remain inside the pop-out. Test83 phone acceptance is pending. Broad merged and overlapping scenes remain unresolved; the 360+ target is not complete. Keep existing ownership priority and original-pixel evidence while investigating the next general recovery family.


</details>

<a id="archive-handoff-2-79-84-md"></a>

<details>
<summary>HANDOFF-2.79.84.md — historical checkpoint</summary>

# Test84 / 2.79.84

Continue from Test83 source/checkpoint `dc88ab91832ac511d7198b8022f7cb93778930a7`. Test82 was explicitly accepted by the user; no updated phone count was supplied. Test83 physical acceptance remains unconfirmed. Test84 adds one original-page Apocalypse frame and one Wolverine frame in the local supplement comparison, preserving all 852 prior owners across 230 pages.

## Change

`js/panels-interior-strokes.js` adds proof36 scenes whose two global ragged-cell radii agree, whose original pixels prove the full perimeter, and whose old divider veto is caused by a short interior ink run. An explicitly selected policy in `PanelLocalBoundaryConsensus.pixelEvidence.internalDivider` requires both ink-run endpoints more than eight analysis pixels inside the mask and rejects runs spanning 60% or more. The default divider policy and all paper-corridor checks remain intact. A narrow-ink/chromatic-rim inset veto prevents publishing an outer merged scene when an independently enclosed inset is detected. Existing descriptors and reading order retain priority; additions have zero owned-pixel overlap. The reader preserves complete proof36 contours.

## Evidence and next test

The 230-page cached original-raster supplement check passes: Apocalypse180→181, Wolverine383→384, manga188 unchanged, Magneto101 unchanged. Both additions have been visually reviewed. The unsafe merged scene on Apocalypse issue 1 reader 17 stays rejected. The full Apocalypse detector replay also passes all 91 pages, preserving all 180 prior owners and producing 181. The Wolverine target passes the full detector 4→5 with all four old owners intact. All 76 retained suites pass locally and in CI. Browser interaction/backup, native archive, Android build, signature and exact 87-file source-to-APK verification pass. Downloaded artifact/APK hashes and the source archive commit are independently verified. Apocalypse 0.67x and Wolverine JPEG82 variants abstain; the other tested transforms recover the new complete contours. See `docs/evidence/validation/TEST84-VALIDATION.json` for the build source commit and results.

Identity: 2.79.84 / 28012, package `io.github.bdredenbach.nthshelf.frametest84`, isolated app **Nth Shelf Test84**. All87 web files are frozen for source-to-APK verification.

Phone targets: Apocalypse issue 2 reader 22/23 complete bottom panel, including every speech balloon; Wolverine 1000 source 018/reader 19 complete narrow upper-left syringe scene. Compare with Test83. Phone acceptance is pending. The 360+ Apocalypse goal is incomplete; broader merged, tilted, inset and overlapping scenes still need conservative recovery work.


</details>

<a id="archive-handoff-2-79-88-md"></a>

<details>
<summary>HANDOFF-2.79.88.md — historical checkpoint</summary>

# Test88 / 2.79.88

Builds on exact published Test84 source at d18cda03272d80d49fdab1620c3910625840c071. The subsequent Test87 source commit was never pushed and is unavailable; saved Test87 contours remain usable as a separate retention comparison. Do not label the shipped Test88 APK as containing the missing Test87 implementation.

The user's thin-border / gradient-gutter hypothesis yields one verified new frame: Rise of Apocalypse issue2 reader17/23, the complete upper-left tall scene, including all speech balloons. `js/panels-smooth-gutter-boundaries.js` discovers a quiet exterior through neighboring RGB differences, checks independent thresholds 12/14, verifies four-side source contrast, texture/color, retained divider and inset vetoes, and preserves exclusive ownership. Proof40/reader integration preserves the exact outer contour. Cache identities advance to Test88.

All 78 retained/new suites pass locally. The 312-page original-raster supplement comparison preserves 1,278 saved Test87 descriptors and adds one frame (Apocalypse184→185 in that saved-map comparison only). The actual published Test84 → Test88 full-detector target passes 0→1; the full 91-page Apocalypse replay passes 181→182 with every prior descriptor unchanged. Mirroring, 0.67x and 1.25x resampling and JPEG82 recompression preserve the addition. General frame detection and the 360+ Apocalypse goal remain incomplete.

Identity: version2.79.88 / code28016, isolated package `io.github.bdredenbach.nthshelf.frametest88`, label **Nth Shelf Test88**. The build workflow runs retained/browser/native archive checks and verifies all 88 packaged web files against the tested SHA256 manifest. Android CI, browser/backup/native archive checks, build, signature, identity and all 88 exact packaged web files pass. Downloaded artifact/APK hashes and the source archive bytes are independently verified. Build source commit: 37724a19234d5524f169a4e57a11d448dc49c70c; workflow run 37313676835. User confirmed Test88 works on phone on 2026-10-05. No updated full-corpus phone count was supplied. Install target: Apocalypse issue2 reader17/23 upper-left tall scene; compare with the last shipped Test84 APK. See docs/evidence/validation/TEST88-VALIDATION.json and qa27900/frame-accuracy/test88/README.md.


</details>

<a id="archive-handoff-2-79-89-md"></a>

<details>
<summary>HANDOFF-2.79.89.md — historical checkpoint</summary>

# Test89 / 2.79.89

Based on approved Test88 commit 85e982f70cc7e1d8aaef1d6e79a27c3351b8b9b8. Android stays at its accepted checkpoint; development continues on Test_Branch.

`js/panels-neighbor-edge-cells.js` adds proof 41: a tall paper-bordered scene clipped by one vertical and one horizontal physical page edge, witnessed by an accepted short neighbor. Independent seed radii 4/6 must agree, normal frontier samples keep the retained source-paper/ink thresholds, and only a tiny remainder on a 95%-physical-edge side may use complete mixed ink support. Dividers, enclosed insets and prior-owner overlap retain their vetoes. No book, page or tap identities occur in detection.

Phone target: **Rise of Apocalypse #1, reader 4/24**, complete tall far-right horse-and-rider scene, including the upper balloon and both yellow captions. Visual crop inspected. This restores a scene represented in cached unpublished Test87 geometry using newly implemented general source rules; no missing Test87 implementation or stored target crop is copied into runtime. The experimental page-13 route merged two scenes and was rejected, not integrated.

All 80 retained/new suites pass, including 28 proof-mutation negatives, a synthetic corner-edge scene with an independently accepted neighbor, divider/no-neighbor/monochrome/malformed-input rejection and actual Reader five-position/exact-crop checks in a DOM adapter. Full original-raster Test88 → Test89 replay: all 91 Apocalypse pages, 182 → 183 frames, every old descriptor unchanged. Separate new-supplement replay: 221 Wolverine/Magneto/manga pages, 1,094 cached descriptors unchanged, zero additions. This latter replay is not a new full historical-source comparison.

Mirroring, 1.25x enlargement and JPEG82 recompression preserve the target. 0.67x pre-resampling removes candidate proof and safely abstains. Coverage remains incomplete; performance optimization is deferred until frame accuracy.

Identity: 2.79.89 / code28017; debug package `io.github.bdredenbach.nthshelf.frametest89`; label **Nth Shelf Test89**. The workflow runs all retained/browser/native archive checks and checks all 89 exact packaged web files against the frozen manifest. Android CI passed, including browser/backup/native archive checks, build, signature, identity and all 89 exact packaged reader files. Downloaded artifact/APK hashes and source archive bytes verified against source commit cf0fdc89aa40eeb3e1d93f3f0bdc9e860f3e92ac; workflow run 37323210649. Physical phone acceptance is pending. See docs/evidence/validation/TEST89-VALIDATION.json.


</details>

<a id="archive-handoff-2-79-90-md"></a>

<details>
<summary>HANDOFF-2.79.90.md — historical checkpoint</summary>

# Nth Shelf Test90 — 2.79.90

This test explores two connected frames in one pop-out while continuing to recover individual frames.

**Superseded coverage estimates:** The subsequent complete [Apocalypse audit](HANDOFF.md#archive-handoff-apocalypse-audit-md) establishes 385 narrative frames, 133 complete singles and 10 complete connected pairs, covering 153 frames with 232 remaining. The historical raw-selection table below is not usable coverage. The SWAK selection still needs interior facial-mask repair. Brad has accepted complete adjacent two-frame scene continuations as the criterion going forward; see [project memory](PROJECT-MEMORY.md).

## Phone targets

1. Rise of Apocalypse issue 2, reader **18/23**: the narrow **SWAK** strip should pop as one complete frame, including its lettering and speech balloon.
2. Rise of Apocalypse issue 1, reader **13/24**: tap the narrow reaction portrait or the larger action scene at the lower right. Both should pop together, including foreground limbs and balloons. Count this as one accepted group covering two frames if it reads well on the phone.
3. Wolverine 1000: reader **27/74** (hat portrait), **34/74** (two tall conversation frames), **39/74** (complete bottom action strip). The same new individual-frame rule recovers these four scenes in current-source replays.

## Coverage

| Apocalypse comparison | Selections | Frames covered | Remaining against provisional 360 |
| --- | ---: | ---: | ---: |
| Test89 | 183 | 183 | 177 |
| New single only | 184 | 184 | 176 |
| Test90, pair accepted | 185 | 186 | 174 |

The exact comic-wide frame total has not been audited; the earlier goal was 360+. Remaining numbers are estimates against that goal. The pair contributes two extra covered frames beyond the individual-frame result. On the two reviewed Apocalypse target pages, ten missing frames become seven.

All 183 prior Apocalypse descriptors remain identical in the full 91-page replay. The separate 221-page cached comparison preserves 1,094 owners and gains four Wolverine singles. Fresh current-source replays of those three Wolverine pages confirm 6 → 10. All 82 behavioral suites pass. Source-transform abstentions and the pending phone/build state are recorded in docs/evidence/validation/TEST90-VALIDATION.json.

Continue on Test_Branch. Android remains the approved Test88 presentation branch. New rules use pixel evidence only; there are no book/page crop lookups. Comic artwork stays outside git and CI.


</details>

<a id="archive-handoff-2-79-91-md"></a>

<details>
<summary>HANDOFF-2.79.91.md — historical checkpoint</summary>

# Test91 / 2.79.91 — bounded display-mask repair

5 October 2026. Continue on `bdredenbach/Nth-Shelf`, `Test_Branch`.

## Recovery checkpoint

The prior chat successfully saved the accepted connected-scene rule and complete Test90 audit in `0d5b48b4c6104606c3593425b3dfee123d7cfd6d`. Its crop-repair work was not committed. This checkpoint implements a reproducible Reader repair and retains [PROJECT-MEMORY.md](PROJECT-MEMORY.md) and [HANDOFF-APOCALYPSE-AUDIT.md](HANDOFF.md#archive-handoff-apocalypse-audit-md) as the decision record and frozen baseline.

One complete frame, or exactly two complete adjacent frames continuing the same immediate scene, qualifies. Preserve artwork, captions and speech; three-frame composites and time/location jumps still fail. Geometry alone does not establish narrative continuity.

## Implementation

`js/panels-crop-repair.js` repairs display masks separately from detector proofs. Each outer ring gets its own bounded convex envelope; disjoint outer rings are never merged. Enclosed irregular matte holes, narrow exterior gates and source-supported neutral-paper speech bays can be restored. Nearby source ink helps close speech enclosures and their hulls retain interior lettering. Straight-sided inset holes and substantial nonpaper convex holes remain excluded. Other detected owners veto substantial conflicts; even tolerated subpixel boundary conflicts never add another owner's pixels. Unproven/corrupted contours abstain.

Reader tap selection, popup clipping and bubble hit boundaries use the same repaired contours. Original detector descriptors and popup proof metadata remain unchanged. Repairs and sampled source pixels are cached for the current page. No book, page, name or fingerprint lookup is used by runtime code.

## Reviewed gains

The fresh 91-page replay still has 185 selections and matches all stored audit boxes and owner identities. This checkpoint adds **zero detected frames**. Conservative actual-Reader crop review credits **12 repaired singles** and **zero repaired pairs**:

- Issue 2: reader 7, selection 6.
- Issue 3: reader 5 selection 4; reader 6 selections 1 and 3; reader 11 selections 3 and 4; reader 13 selections 1, 2 and 3; reader 15 selection 3.
- Issue 4: reader 19 selection 2; reader 20 selection 2.

Local coverage is **145 complete singles + 10 complete pairs = 165 covered frames** of 385, leaving **220**. There are still 199 frames without a qualifying selection and 21 damaged frames. The original Test90 baseline remains 153 covered / 232 remaining. Further improvements that still look partial are not credited; see [crop-review.json](qa27900/frame-accuracy/test91/crop-review.json). Phone confirmation remains pending.

## Validation and limitations

84 retained/new behavioral suites pass: the retained 82, plus crop-repair and actual-Reader adapter contracts. A fresh detector replay covers 312 source pages / 1,283 selections: Apocalypse 185, Wolverine 388, Magneto 101 and the three manga chapters 228/193/188. Display-mask checks retain every original owned pixel, preserve descriptors and add no pixels from another detected owner. These checks do not prove narrative acceptance or protection of every undetected inset. See [corpus summary](qa27900/frame-accuracy/test91/corpus-summary.json) and [validation](docs/evidence/validation/TEST91-VALIDATION.json).

Repairs can include a little paper/gutter fringe within the original contour hull. Wide boundary damage, balloons extending beyond the original bounding box, compact holes that may be real insets, and the two damaged pairs remain unresolved. Do not call every changed mask a successful frame. Local concurrent mask preparation had a 446 ms median, 608 ms p95 and a 6,069 ms maximum; these are not phone or detector latency measurements. Speed is not yet signed off.

Android identity: isolated `io.github.bdredenbach.nthshelf.frametest91`, label `Nth Shelf Test91`, version `2.79.91`, code `28019`. The [Android CI run](https://github.com/bdredenbach/Nth-Shelf/actions/runs/37352164001) passed all 84 retained/new suites, browser interaction, backup round trip, native archive regression, Android compilation, signature/identity and exact packaged web-file verification. The downloaded APK independently matches the frozen 92-file manifest and source commit `2478d491580bce648bc481e4f132d0bf251ba0fa`; SHA-256 `66bdc9350c90a1dc2f51b626f079af29bc4ad4576afa7ab12646c66e4b637881`, 3,440,366 bytes, signed with the CI Android debug key (v2). Build provenance is recorded in docs/evidence/validation/TEST91-VALIDATION.json. Phone acceptance remains pending. Stable app data is separate.

## Next bounded checkpoint

First test these repairs on the phone, especially issue 3 reader 11 and 13. Then recover speech beyond current boxes (issue 1 reader 16 selection 5), the remaining SWAK face/crop boundary, issue 3 reader 6 selection 2 and reader 13 selection 5, and issue 4 reader 14 selection 2. Continue splitting larger composites and recovering genuinely missing single frames or manually reviewed same-scene pairs. Preserve the retained Wolverine and manga behavior. Private source artwork and visual reports stay outside git/CI.


</details>

<a id="archive-handoff-2-79-92-md"></a>

<details>
<summary>HANDOFF-2.79.92.md — historical checkpoint</summary>

# Test92 / 2.79.92 — split source gutters, keep captions whole

5 October 2026. Continue on `bdredenbach/Nth-Shelf`, `Test_Branch`.

## Outcome

The Test90 audit identified a time-transition merge on Apocalypse issue 2 reader 12. Test92 splits its lower two scenes into independently tappable crops. Local original-page/Reader-canvas review credits **two newly covered frames**. Issue 2 reader 16's previously credited walking-legs/En conversation pair is also split into two complete singles; that changes presentation, not coverage.

Raw Apocalypse selections rise **185 → 187**. Complete local coverage rises **165 → 167 / 385**, leaving **218**: 197 without a qualifying selection plus the same 21 damaged frames. Complete outputs are now 149 singles and nine same-scene pairs. The frozen audit criterion still permits exactly two complete adjacent same-scene frames, while unrelated/time-transition merges do not qualify. Phone acceptance is pending.

## Implementation and evidence

`js/panels-gutter-split.js` runs after existing detection. A source-supported horizontal paper corridor partitions the actual parent contour into two children. It samples neutral paper at thresholds 220/210, admits only paper reachable from the page exterior with a two-pixel collar, prefers thick smooth paths, requires artwork on both flanks, and retains substantial textured content in both children. Ambiguous/obscured seams abstain.

Paper bodies crossing the cut are assigned atomically. Nearly rectangular captions require greater than 80% existing-body ownership by one leaf; other bodies require strong collar ownership. Caption borders use a four-pixel envelope. A foreign owner vetoes additions outside the original parent. The parent's original descriptor remains verbatim in both child proofs, which reconstruct the partition plus recorded caption contours. Original parent pixels survive in the union; siblings do not overlap. Reader taps, crop contours, popup proofs, page-map cache and edge-spill/refinement bindings accept the new version-44 proof.

No book/page/name/fingerprint lookup is used at runtime. The source artwork is not committed or sent to CI. `geometry.json.gz.b64` contains contour/proof fixtures only. Test91 crop repair is unchanged. The rejected wider nonpaper crop experiment was discarded.

312-page comparisons preserve every unchanged descriptor, retaining replaced parents verbatim in the children: Apocalypse 187 selections; Wolverine 388; Magneto 101; manga chapters 228/193/188. Only two Apocalypse parents change. Fresh Apocalypse mask checks cover 91 pages / 187 selections and retain all original owned pixels while adding no other detected owner's pixels. Unchanged comparison corpora retain the Test91 crop checks. The new contracts cover captured proofs and corruption rejection, parent-pixel retention, disjoint siblings, atomic captions, a synthetic positive gutter, caption/artwork negatives, obscured-seam abstention, actual Reader taps/popups/cache and corrupted proofs.

See [crop review](qa27900/frame-accuracy/test92/crop-review.json), [corpus summary](qa27900/frame-accuracy/test92/corpus-summary.json), and [validation](docs/evidence/validation/TEST92-VALIDATION.json). Run `bash qa27900/frame-accuracy/test92/run-retained.sh` for 86 retained/new suites.

## Phone targets and remaining work

- **Apocalypse issue 2 reader 12:** each lower scene should pop separately; inspect all four captions in the bottom scene, including the weeks-later caption.
- **Apocalypse issue 2 reader 16:** walking legs and En's answer should pop separately, with both balloons complete. The lower carrying/conversation pair remains accepted.

Small paper or neighboring caption-border fringe may remain. The source review follows the frozen convention that harmless neighboring speech fragments alone do not invalidate a complete owned frame. The rule currently handles horizontal neutral-paper seams; it does not recover colored gutters, open landscape scenes or every larger composite. Mask/selection checks do not establish semantic ownership of all undetected insets. Phone timing is not signed off.

Next: address source speech beyond original boxes and physically enclosed frame areas currently claimed by inaccurate neighboring candidates; then colored/sloping gutters and larger composites. Keep separate counts for raw selections, complete frames, split already-accepted pairs and repaired crops.

## Android build

Isolated identity: `io.github.bdredenbach.nthshelf.frametest92`, label `Nth Shelf Test92`, version `2.79.92`, code `28020`. Code/proofs/docs are committed locally in `9f274a4cbc4bf270ebfe155d4c207a2bc5fbf8b5`. Two push attempts were rejected by automatic approval review. The second followed authenticated owner/login/permission checks and recovery of the standing user push/APK instruction; review still requires direct user-authored authorization in this thread to publish to the branch. Remote remains `7d7d5f3`. No Test92 APK exists and CI has not started. A local Android build is unavailable (Gradle, javac and SDK absent). After direct approval, push, build, verify the downloaded APK against the frozen 93-file manifest and save/deliver it. Stable app data remains separate.

Visual review saved: `Nth-Shelf-Test92-Frame-Review.html`, Library identity `libfile_1cca6cce82e48191a8706e7fa71bdf04`. Phone targets and complete source comparisons are in that review. The scratch workspace retains fixtures and current build/review scripts; code-backed artifacts remain in git.


</details>

<a id="archive-handoff-2-79-93-md"></a>

<details>
<summary>HANDOFF-2.79.93.md — historical checkpoint</summary>

# Test93 / 2.79.93 — complete crossing speech ownership

5 October 2026. Repository `bdredenbach/Nth-Shelf`, branch `Test_Branch`.

## Recovery and measured outcome

The stalled session survived at `/workspace/scratch/5827b11a4a78/Nth-Shelf`, with local Test92 implementation commit `9f274a4` and blocked-publication checkpoint `b80ebbb`. Original artwork, replay maps and visual reports survived alongside it. Test93 tested implementation checkpoint is `ff024eedc5f6aab51b009a911a12e66976ff0036`. Brad explicitly authorized publication and building in the recovered chat on 5 October 2026. Test92/Test93 are published at `3a3c28720453e902cc7fcb823b8c2733d1b3c41c`; its tree `29c3b1cdfcfbf6b0a1adb99f2a2df1be8041812c` exactly matches the local tested checkpoint. The Test93 APK has been built and its downloaded bytes verified. Do not infer an APK exists from the Test92 review's installation text.

Test93 completes Apocalypse issue 1 reader **16/24**, selection **5** (walking away): its complete “We Sandstormers…” balloon now stays with the scene. Selection 4 loses the foreign balloon fragment while retaining its reclining figure and all artwork outside the body. Actual Reader canvases were reviewed against the original source.

Local complete coverage is **150 singles + nine connected pairs = 168 / 385**, leaving **217**: 197 without a qualifying selection and 20 damaged frames. Raw selections remain **187**. Relative to Test92 this is one repaired single and zero added selections. Relative to published Test91, the recovered pass retains Test92's two new complete scenes plus this one repair: **165 → 168** complete frames. Phone acceptance is pending.

## Source rule

`js/panels-speech-ownership.js` assigns an enclosed neutral-paper body across frame boundaries atomically. The body must be substantial, compact and source-ink bounded, with at least 55% collar support and a 25-point lead over the next owner. It must protrude beyond the winner's original box by more than six analysis pixels. Unproven owners, overlapping candidate bodies, weak/ambiguous evidence, transparent inputs and recursive wrappers abstain.

The version-46 proof retains the exact parent descriptors and the participating ownership evidence. Source speech, border and lettering stay together; all prior source pixels survive in the union and all artwork outside the transferred body remains unchanged. Normalized contour reconstruction, descriptor checks and immutable proof caching protect subsequent taps and pop-outs. The same contour reaches the Reader's tap selection and overlay; the existing Test91 display repair remains active. No book/page/name/fingerprint lookup is used by runtime code. Private artwork and visual reports remain outside git/CI.

## Verification

- **88 retained/new behavioral suites pass**, including synthetic source positives, artwork/transparency negatives, 20 rejected proof corruptions, exact source-union/non-speech retention and atomic ownership.
- Actual Reader checks verify both pop-outs, proof preservation, cached display masks and **2,273 transferred speech-pixel taps**.
- Fresh source-raster supplement comparisons over retained Test92 maps cover **312 pages / 1,285 selections**. Only the two Apocalypse owners above change. Wolverine 388, Magneto 101 and manga 228/193/188 retain identical descriptors. This is not a fresh full-pipeline replay of every page.
- A full existing detector rerun reproduces the changed target exactly (6 selections; local native-canvas 12,356 ms). This is not a phone latency result or speed acceptance.
- Local browser/backup checks initially could not start without Chromium; the subsequent successful CI run passes both browser/backup and native archive tests, including 600 MiB streaming under a 32 MiB heap. CI verifies the APK signature and identity; downloaded archive/APK hashes and all 94 packaged web files were independently checked. Phone acceptance and timing remain pending.

Run `bash qa27900/frame-accuracy/test93/run-retained.sh`. See `docs/evidence/validation/TEST93-VALIDATION.json`, `qa27900/frame-accuracy/test93/corpus-summary.json` and `crop-review.json`. Geometry-only fixtures contain no comic pixels.

## Broader attempts and continuation

Extended seed radii, alternate neutral-paper thresholds, smaller/vertical seams and narrower chromatic rims earned no further complete-frame credit. Some proposals were fragments, merged scenes, clipped captions or duplicate detections of already accepted rectangular outputs. Their runtime paths were excluded; do not add their proposal counts to coverage or ignore legacy rectangles when checking prior ownership.

Next source targets remain the SWAK face, issue 3 reader 6's damaged pair, reader 13's damaged lower pair and the narrow red-bordered En inset on issue 4 reader 14. Source-enclosed artwork incorrectly claimed by a neighboring candidate needs physical foreground-boundary evidence before reassignment. Keep all current gains, including Test92 issue 2 readers 12 and 16, and continue measuring usable coverage separately from raw selections.

## Publication/build gate

Isolated identity prepared: `io.github.bdredenbach.nthshelf.frametest93`, label `Nth Shelf Test93`, version `2.79.93`, code `28021`. Workflow and exact 94-file web manifest passed. `Nth-Shelf-2.79.93-Test93.apk` is built and verified (3,449,392 bytes).

Publication is now explicitly authorized and complete. Plain git pushing lacked shell credentials, so the connected GitHub API published the exact tested tree in one fast-forward commit on `Test_Branch`. Android CI run `37370172377` succeeded: https://github.com/bdredenbach/Nth-Shelf/actions/runs/37370172377 . The artifact ZIP and APK were downloaded, checked for ZIP integrity and verified by SHA-256. The isolated identity/signature record and all 94 packaged web files match the frozen tested source. APK SHA-256: `e75aa758d7f8c8d38b2c69e92c48f19675b79756311a44cfec82f8d4c1f544f0`. This is a CI debug-signed test APK; phone acceptance remains pending. Do not request the same publication/build permission again.

Visual report: `Nth-Shelf-Test93-Frame-Review.html`. Its new review includes the original page, before/after walking-away crop, preserved preceding scene and retained Test92 comparisons. Its saved identity is recorded in docs/evidence/validation/TEST93-VALIDATION.json after upload.

## Recovery-chat continuation

See `docs/test93-continuation.md`. Internal-balloon variants restore additional text on issue 3 reader 6, but artwork remains absent because false selection 5 owns part of the same street scene. No additional complete frames are credited and no prototype runtime changes were retained.

Saved APK identity: `libfile_77c16cebd15481918c5150b824a466c6`, filename `Nth-Shelf-2.79.93-Test93.apk`. The visual review retains `libfile_0f32dc0dd8a481919e0b7bb2a45920f3` and was updated in place to include successful build status and unaccepted continuation findings.


</details>

<a id="archive-handoff-2-79-94-md"></a>

<details>
<summary>HANDOFF-2.79.94.md — historical checkpoint</summary>

# Test94 / 2.79.94 — a complete physically enclosed street scene

5 October 2026. Repository `bdredenbach/Nth-Shelf`, branch `Test_Branch`.

## Bounded recovery and outcome

Recovered published Test93 checkpoint `2867ecc` and surviving private fixtures. The first continuation target is Apocalypse issue 3 reader **6**, selection **2**: circular En view plus the immediately continuous tall street scene. Source/actual Reader review now shows the complete wall, people, lightning, portrait, and both `HE IS A GIFT` and `QUICK--FETCH WATER` balloons. False selection **5** has no independent source frame and is retired. The neighboring right scene loses only **35 analysis pixels** of foreign speech; its other pixels are preserved.

Local complete coverage: **150 singles + ten connected pairs = 170 / 385**. Remaining: **215**, comprising 197 without a qualifying selection and 18 damaged frames. Raw selections: **187 → 186**. This is one repaired connected pair (two covered frames), zero newly detected frames, and one retired false selection. Phone acceptance remains pending.

## Source rule and protection

`js/panels-perimeter-consolidation.js` starts from edge-connected neutral paper. A two-pixel reachability bridge crosses thin balloon links for seed discovery; it never itself becomes the published crop. Exterior-only seeds at radii one and two reconstruct a full source cell by flood through the original artwork. Source-enclosed paper bodies follow a strongly witnessed collar. Both reconstructions must produce exactly the same final mask.

A candidate must contain both original split matte owners completely, have one source contour, and carry strong ink and connected-gutter support on all four frontiers. The fragment needs affirmative color continuity across multiple inward cut edges and weak independent perimeter ink. A source-ink enclosing rail search beyond the descriptor protects real insets whose border a damaged crop omitted. Size/nesting alone cannot retire an owner. Exactly two original split owners qualify; unproven owners and unrelated overlapping art veto the operation. Every foreign overlapping pixel must belong to a complete source-enclosed speech body with the retained body/collar/ink gates; final donors retain the 2.5% area floor. Test93's production speech gates are unchanged.

The version-47 proof keeps the original owners, exact matching source contours, frontier/continuity/rail evidence, and transferred body geometry. Serialized validation recomputes geometry, ownership containment, frontier sample counts, body/collar counts, exact donor masks and source-pixel retention from the evidence descriptors. Original source raster values are used during discovery and are not embedded in the proof. Immutable caching protects repeat pop-outs. The runtime has no book/page/name/fingerprint lookup. Private artwork stays outside git and CI.

## Verification and limits

- 90 retained/new behavioral suites, including a source-independent synthetic fragment positive, a real ink inset beyond a damaged descriptor, missing-boundary/transparency negatives and 38 corrupted proof rejections. Final versioned run status is in `docs/evidence/validation/TEST94-VALIDATION.json`.
- Reader checks cover **35,231 restored-pixel taps**, including **775 restored edge pixels**, serialized proofs, four repeated overlays and cached display masks. Real native-canvas Reader crops were inspected against the full source page.
- Fresh source-raster perimeter supplement comparisons over final Test93 descriptors cover **312 pages / 1,285 original selections**. Only this Apocalypse page changes, leaving 1,284 selections. Wolverine 388, Magneto 101 and manga 228/193/188 descriptors remain identical. This is not a fresh full detector replay of all pages.
- A full detector rerun on the changed target exactly reproduces four reviewed selections: **14,929 ms** locally with native canvas. This is not phone timing or a speed acceptance.

## Publication, build and next target

Publication/build authorization continues from the attached handoff. Isolated identity: `io.github.bdredenbach.nthshelf.frametest94`, label `Nth Shelf Test94`, version `2.79.94`, code `28022`. The exact tested source tree `ca43a4f3d361b1dc046d24c35654d385bc0ed4f9` is published at `f9a68b68b905d3783f40bea82bdd3273f8c53000`, matching local tested checkpoint `dbf202d`. All 90 suites pass. Android [run 37374620934](https://github.com/bdredenbach/Nth-Shelf/actions/runs/37374620934) succeeded: all 90 suites, browser/backup, native streaming archive, build, signature/identity and exact asset checks pass. The downloaded artifact ZIP passes integrity and SHA-256 verification. `Nth-Shelf-2.79.94-Test94.apk` is verified against all 95 frozen packaged web files, CI identity/signature record and checksum. APK bytes: **3,456,184**; SHA-256: `a11048f8c14d92106ecdc776770c62ca8836c4772f982908c169de5f2f0d9cee`. This is a CI debug-signed isolated test build; phone acceptance remains pending.

Next phone check: issue 3 reader 6, tap center/edges of the street, its upper circular view, both balloons, and the formerly false middle fragment. Check the right scene and retained Test93 issue 1 reader 16 / Test92 issue 2 reader 12 and 16. Further source targets stay SWAK on issue 2 reader 18, lower pair on issue 3 reader 13, and narrow red-rim En inset on issue 4 reader 14. Keep one bounded target per recoverable pass.

Private recovery paths for this pass: `/workspace/scratch/36070fbf99e6/Nth-Shelf`, `research/` alongside it, source fixtures symlinked to the surviving earlier workspace. These are recovery hints, not durable fixture guarantees.

## Saved deliverables

Verified APK: `libfile_34b788e846708191b2b14c8a8505abb0`. Frame review: `libfile_a09ba00897b48191aef8d33579c8bb2f` (updated in place, version 1). Recovery handoff: `libfile_fc41faad5434819187ed9649f5f14ada` (updated in place, version 1). Both describe the successful build and verification.


</details>

<a id="archive-handoff-2-79-95-md"></a>

<details>
<summary>HANDOFF-2.79.95.md — historical checkpoint</summary>

# Test95 / 2.79.95 — complete water-and-hand artwork

5 October 2026. Repository `bdredenbach/Nth-Shelf`, branch `Test_Branch`.

## Bounded target and outcome

Apocalypse issue 2 reader **18**, selection **1**, the upper-right water-and-hand frame now retains the complete wrist, palm, both balloons and background. The source enclosure repairs 4,266 analysis pixels. All original owner pixels survive; the SWAK selection 2 and every other retained descriptor are identical. Local complete coverage: **151 singles + ten connected pairs = 171 / 385**. Remaining: **214** (197 without qualifying selections, 17 damaged). Raw selections remain **186**. This is one repaired single, zero newly detected frames; Test95 hand/water repair was phone-confirmed by Brad on 5 October 2026; phone timing remains unmeasured.

The original SWAK probes were rejected: dark-ink erosion merged En or lower scenes, and quiet seed reconstruction did not isolate SWAK. No SWAK improvement is claimed. A closed dark-matte enclosure on the same page provided the bounded accepted gain.

## Runtime rule and safety

`js/panels-dark-matte-completion.js` only completes an already valid local matte owner whose source palette is dark. The local transition floods at thresholds 12 and 14 must enclose matching compact single-contour cells. The final source-cell union retains every old pixel and contains exactly one original owner. Every frontier has strong dark exterior and inward contrast support. Repair growth is bounded at 1–20% of the original area; open, ambiguous, overlapping, divided or independently framed inset scenes veto completion.

Version-48 geometry stores both threshold contours, original owners, frontier witnesses and content evidence. Serialized validation recomputes the contour consensus, frontier positions/counts, original-owner retention, restored area and zero foreign overlap. Immutable proof/display caches preserve repeats. The discovery runtime uses no book/page/name/fingerprint lookup. Private artwork stays outside git/CI. Test94 perimeter consolidation and Test93 speech gates remain unchanged.

## Verification

All 92 retained/new behavioral suites plus the cache/package check pass locally. The new tests cover a source-independent dark-ink positive, a real independently enclosed ink inset, an open-cell neighbor negative, transparency/malformed data, and 21 corrupted proof rejections. Actual Reader checks cover all **4,266** restored-pixel taps, **943** restored edge pixels, serialized proofs, cached display masks and repeated pop-outs. Full native Reader canvases were reviewed against the original source.

Fresh source-raster supplements over final Test94 descriptors cover **312 pages / 1,284 selections**. Only this Apocalypse owner changes. Wolverine 388, Magneto 101 and manga 228/193/188 descriptors remain identical. This is not a fresh full detector replay of every page. The changed target's full detector rerun matches the two reviewed selections, approximately **15 seconds** locally; phone timing is not accepted.

## Publication, build and phone check

User publication/build authorization persists. Isolated identity: `io.github.bdredenbach.nthshelf.frametest95`, label `Nth Shelf Test95`, version `2.79.95`, code `28023`. Published source `bb4ea14` exactly matches tested tree `4733898a7491680a3286338351281ec150372b62`. [Android run 37378324461](https://github.com/bdredenbach/Nth-Shelf/actions/runs/37378324461) succeeded. All 92 behavioral suites, cache/package checks, browser/backup, native archive, build, signature/identity and packaging checks pass. The downloaded APK is verified against its checksum, CI signature/identity record, and all 96 frozen web files. APK bytes: **3,460,506**; SHA-256: `7155f748e9187cca0bc390923baf140d89fe835e4c42707cb6346206b27d7f69`. Live publication/build and verification status is in `docs/evidence/validation/TEST95-VALIDATION.json`. Do not describe a build as successful until the downloaded APK is verified.

Phone-confirmed target (5 October 2026): issue 2 reader 18 upper-right hand/water frame, center/edges, wrist, fingers, both balloons and background. SWAK stays unchanged. Retained controls: Test94 issue 3 reader 6 street/portrait pair, Test93 issue 1 reader 16, and Test92 issue 2 readers 12/16.

Further work: SWAK issue 2 reader 18, issue 3 reader 13 lower pair, issue 4 reader 14 narrow red-rim En inset. One bounded target per pass.

Private recovery: repository `/workspace/scratch/36070fbf99e6/Nth-Shelf`; this pass's research `/workspace/scratch/dfc1ab24edfe/research`; fixtures symlink `/workspace/scratch/dfc1ab24edfe/fixtures` points to `/workspace/scratch/5827b11a4a78/fixtures`. Recovery hints, not durable guarantees.

## Saved deliverables

Verified APK: `libfile_98b6da7e1a688191923d922460a43b2c`. Frame review: `libfile_e4508563cbd08191b276eea160c9dd1f`. Recovery handoff: `libfile_622f19a1016081918b3cc365c0556dfa`. All saved at version 0 after successful APK verification. Brad phone-confirmed the Test95 hand/water repair on 5 October 2026; phone timing remains unmeasured.

## Count reporting

186 available pop-out selections is the same measure as the earlier Test90 count of 185; it includes incomplete crops. Complete narrative frames total 171/385: 151 singles + 10 pairs × 2 frames. These produce 161 complete pop-out groups. Keep available selections, complete frames and remaining frames distinct. Brad requested this distinction after recalling the earlier 185.

## Full phone sweep confirmed — 5 October 2026

Brad confirmed **189 complete original frames** in the full Apocalypse phone sweep. The fresh 91-page local regression and broader per-frame count supersede the historical 171/385 accounting above: **189/384**, **195 remaining**, **186 page-map selections**. A dual-frame pop-out counts two; larger groups count each complete original frame once. See HANDOFF-APOCALYPSE-TEST95-REGRESSION.md and docs/apocalypse-test95-regression.json. Phone timing remains unmeasured. Preserve this accepted baseline in subsequent tests.


</details>

<a id="archive-handoff-2-79-96-md"></a>

<details>
<summary>HANDOFF-2.79.96.md — historical checkpoint</summary>

# Test96 / 2.79.96 — complete dialogue across ragged rows

5 October 2026. Repository `bdredenbach/Nth-Shelf`, branch `Test_Branch`.

Brad confirmed the Test96 recovery and the count of **190 unique complete original frames** on phone on 5 October 2026. Current accepted coverage: **190 / 384**, with **194 remaining**. The earlier full Test95 phone sweep confirmed 189; Test96 adds one complete frame. Dual-frame crops count two, larger crops count each complete original frame once, clipped/duplicate frames count zero. There are **384 original frames**, after correcting the duplicated hand/wrist fragment on issue3 Reader13. Historical 171 used a stricter grouping rule; 185 was an earlier raw-selection count.

## Bounded gain

Apocalypse issue4 Reader **5**, selection **2** now retains the complete “I remember…” speech chain, including the underworld and “You were not strong enough” balloons. Selection3 loses only foreign speech and keeps its own dialogue and artwork. Native Reader composition preserves every pixel outside the transferred body; other four selections are identical. This adds **one complete frame**, repairs an existing selection and adds no detector selection. Confirmed **190/384**, **194 remaining**, **186 selections**, **167 credited groups**. Issue totals: **36/99**, **54/97**, **62/109**, **38/79**. Brad phone-confirmed the Test96 recovery and count of 190 on 5 October 2026; phone timing remains unmeasured.

## Source-driven rule

`js/panels-tail-speech.js` requires two proven adjacent ragged full-width rows, a compact source-enclosed white balloon with strong ink frontier, and a unique thin tail whose tips agree at two morphological opening scales. The entire connected body goes to the tail owner and leaves the donor. Version49 proof recomputes contour, parent, body, tip, collar and ownership evidence; invalid/ambiguous/open/colored/transparent cases defer. No book, page, text, image fingerprint or content lookup exists in the runtime.

Reader composition applies that atomic transfer to each parent's already repaired display mask. A first direct rerun changed 113 unrelated donor edge pixels; it was rejected and replaced with parent-mask composition. Final source-raster display comparison has zero changes outside the balloon for all six selections. Discovery restores 6,035 pixels and removes 6,027 foreign donor pixels; the Reader donor has 6,029 changed pixels because of two pre-existing crop-repair pixels within the body.

## Validation and continuation

94 retained behavioral suites plus cache/package and syntax checks. Fresh source-raster supplements across 312 saved Test95 maps change only the two target owners; Wolverine, Magneto and three manga chapters keep identical descriptors. Full changed-target detection matches the reviewed map. All six actual Reader crops are reachable. See docs/evidence/validation/TEST96-VALIDATION.json for final publication, Android build, packaged-byte verification and saved deliverables.

Private source artwork remains outside git/CI. User publication/build authorization persists for isolated tests. Continue one bounded primary recovery per pass, crosscheck the retained books and keep complete-frame credits separate from raw selections. The Test95 audit's remaining page observations and future ideas remain the recovery queue (`docs/apocalypse-test95-regression.json`). Next candidates include source-owned internal pale/lettering holes, incomplete issue3 Reader13 speech and missing ink-frame boundaries; require a complete source/Reader match before credit. SWAK remains incomplete and unchanged. Avoid accepting speculative threshold expansions that merge neighboring frames.

## Published checkpoint

Source `91e9dd0eaf13ff9f2c5d500703849b1c1aa45307` has exactly the tested local tree `3b714e3bf7b7deee434303d063d90e015446f0f9` (local commit b7827af). Android run 37385546862 is tracked in docs/evidence/validation/TEST96-VALIDATION.json. Frozen web manifest: 97 files. Per-frame delta and future notes: docs/apocalypse-test96-delta.json. The source archive for recovery is libfile_06c168de85c08191ba461ab9ef2cdba5; saved full baseline review is libfile_d4c4ca46cd08819192cd7f9617d6f115 and baseline notes are libfile_58fed3b235688191ac7e4fec84517824. Scratch fixtures at /workspace/scratch/5827b11a4a78/fixtures and this pass at /workspace/scratch/f515f9782ac9/test96 are hints, not durable recovery guarantees.

## Deferred probe observations

Issue3 Reader13: some clipped balloons have a stable tail, but the parents are outside the supported adjacent ragged-row family. A further chain has little overlap with either owner. Future work needs proven diagonal/irregular ownership and complete enclosure before extending this rule. Issue4 Reader19: lower speech bodies have little existing-owner overlap, and some tips change with opening scale. Independent enclosure/speaker evidence may justify restoration into matte; nearest-owner or global threshold loosening is insufficient. Neither probe changes the map or earns frame credit. Details: docs/apocalypse-test96-delta.json.

## Verified Android build

[Android run 37385546862](https://github.com/bdredenbach/Nth-Shelf/actions/runs/37385546862) succeeded. The downloaded APK matches CI checksum and identity/signature record; all **97** packaged web files match the frozen local tested source bytes. Identity: io.github.bdredenbach.nthshelf.frametest96, label Nth Shelf Test96, version2.79.96, code28024. APK **3,465,934 bytes**, SHA-256 **b6555c4c097b1e9055242571ab128509749f01f788319c007ff9dfbffbc90984**. APK v2 signed with one CI debug signer. Test96 phone acceptance and the count of 190 are confirmed by Brad on 5 October 2026; the earlier full Test95 sweep confirmed 189. Phone timing remains unmeasured.
## Saved deliverables

Nth-Shelf-2.79.96-Test96.apk: libfile_5b3a27cb14088191b9970f0cacbaa291
Nth-Shelf-Test96-Frame-Review.html: libfile_7d3eae8ce3a48191a0e98d0a8ffee953
Nth-Shelf-Test96-New-Chat-Handoff.txt: libfile_7e8793b5bd84819198d823246511f16e


</details>

<a id="archive-handoff-2-79-97-md"></a>

<details>
<summary>HANDOFF-2.79.97.md — historical checkpoint</summary>

# Test97 / 2.79.97 — source-enclosed caption repair

5 October 2026. Repository `bdredenbach/Nth-Shelf`, branch `Test_Branch`.

Brad phone-confirmed Test97 on 5 October 2026: **191/384 complete original frames**, **193 remaining**. This is the accepted baseline for the next pass. Test97 repairs one further complete frame from the Test96 baseline of 190/384. Retained local totals: **186 selections**, **168 credited groups**. Issue totals: **36/99**, **54/97**, **62/109**, **39/79**. Phone timing is unmeasured. Count each unique complete original frame once: dual crops count two, larger crops count all complete original frames, clipped/duplicate fragments count zero.

## Phone-confirmed repair

Apocalypse issue4 Reader **20**, selection **1**: the opening city scene beginning “Fifty years later…”. All three captions should remain intact, especially the left of “The sands encroach…” and the formerly erased diagonal lettering in the third caption. This page now has five complete frames locally. The other four actual Reader canvases are byte-identical to Test96; all five selections are reachable. This repairs a previously available incomplete selection; it creates no new detector selection.

## Generic source rule

`js/panels-crop-repair.js` reconstructs compact, source-enclosed yellow/gold caption bodies at two color thresholds. Their bounds must agree, their pixel difference must be at most 1%, their shape must be rectangular, and their interior must contain sufficient independently enclosed ink. A majority of the body must already belong to one established frame. Foreign ownership vetoes the repair. A narrow source-colored border collar can extend the mask only when it does not claim another owner's missing pixels; otherwise the independently enclosed core is considered alone. Opaque source pixels are required; empty, open, unstable, neutral and insufficiently owned bodies defer.

`js/reader.js` includes a recovered caption's display extent in its canvas only when this caption repair extends the old box. Discovery coordinates, proven frame geometry and saved descriptors are retained. Without that canvas correction, text could be restored in the mask yet remain physically clipped by the old drawing bounds. No page, title, text, image fingerprint or content lookup exists in runtime code. Artwork remains private and outside git/CI.

## Validation and continuation

Fresh native source-raster Reader-mask comparisons are recorded in qa27900/frame-accuracy/test97/corpus-comparison.json. The changed city frame restores 1,941 analysis pixels and removes zero; its four sibling canvases are unchanged. Retained behavioral suites plus new independent caption and Reader extent contracts, cache/package checks and JavaScript syntax run through qa27900/frame-accuracy/test97/run-retained.sh. The tests include foreign-owner, nonopaque source, missing ink, neutral interior, open body and minority-owner negatives. See docs/evidence/validation/TEST97-VALIDATION.json for actual validation/publication/build outcomes.

Continue one bounded primary recovery per pass. The Test95 audit remains the queue, excluding the repaired issue4 Reader5 S2 and Reader20 S1. Its hypotheses are not accepted gains. Next candidates include issue3 Reader13 irregular speech ownership, issue4 Reader18 lower artwork/balloon boundaries, and missing ink-frame scenes. SWAK remains incomplete. Require full source/actual Reader review before granting complete-frame credit. Keep local counts distinct from Brad's accepted phone count.

The private source archive is libfile_06c168de85c08191ba461ab9ef2cdba5. The saved full Test95 baseline review is libfile_d4c4ca46cd08819192cd7f9617d6f115 and its notes are libfile_58fed3b235688191ac7e4fec84517824. Previous source and build are recorded in docs/evidence/validation/TEST96-VALIDATION.json. Scratch hints for this pass: /workspace/scratch/87e22d99ff34/test97 and source fixtures /workspace/scratch/5827b11a4a78/fixtures; these are not durable recovery guarantees.

Final local validation: all **96 behavioral suites**, cache/package and syntax checks pass. Across **312 pages / 1,284 retained selections**, only the target Reader mask changes (1,941 additions, zero removals); Wolverine, Magneto and all three manga chapters are identical. All five target crops are reachable. Android/browser/native/signature/package checks will run in CI.

Published source `2f191f08b3fbb7ae5c890f67a6f08da3b06be2b0` exactly matches tested local tree `f9a86cec78a95855f73c8b2bb01b2275eb213439` (local commit59e4d3a). Android run37389515841: https://github.com/bdredenbach/Nth-Shelf/actions/runs/37389515841. Build/package verification status is tracked in docs/evidence/validation/TEST97-VALIDATION.json.

Verified Android build: run37389515841 succeeded. Downloaded APK matches its artifact digest, CI checksum, package/identity/signature record and all **97** frozen packaged web files. App io.github.bdredenbach.nthshelf.frametest97, label Nth Shelf Test97, version2.79.97, code28025. APK **3,467,670 bytes**, SHA-256 **79dcad97119722b48ed15c80b5f33045af0200118481eac0ed886d17e7748857**; APK v2 with one CI debug signer. Browser/backup, native archive, all96 behavioral suites and package checks passed. Brad has phone-confirmed Test97 at **191/384 complete original frames, 193 remaining**. Use 191 as the accepted baseline; future local gains still require phone confirmation.


</details>

<a id="archive-handoff-2-79-98-md"></a>

<details>
<summary>HANDOFF-2.79.98.md — historical checkpoint</summary>

# Test98 / 2.79.98 — enclosed long-tail speech recovery

5 October 2026. Repository bdredenbach/Nth-Shelf, branch Test_Branch.

Brad phone-confirmed Test97 at **191/384 complete original frames, 193 remaining**. Test98 locally completes one further original frame: **192/384, 192 remaining**, **186 selections**, **169 credited groups**. Issue totals: 36/99,54/97,62/109,40/79. Brad phone-confirmed Test98 at **192/384 complete original frames, 192 remaining** on 5 October 2026. This is the accepted baseline for the next pass; phone timing is unmeasured. Count each unique complete original frame once; dual crops count2; larger crops count all complete original frames; clipped/duplicate fragments count0.

## Phone target

Apocalypse issue4 Reader **18**, selection **4**, the bottom explosion scene. The entire opening “AN EXPLOSION! FROM INSIDE THE SPHINX! WHAT HAPPENED? REED?” balloon should be visible, including its long zigzag tail. The lower speech balloon, both gold captions and all bottom-scene artwork should remain intact. S1/S2 are byte-identical to Test97. S3 loses only its foreign fragment of this bottom balloon; its own lower foreground remains incomplete and receives no new credit. All four target selections are reachable. This is a repaired existing pop-out, not a new selection.

## Generic rule

js/panels-long-tail-speech.js supplies Reader-only source-enclosed balloon ownership. Opaque neutral paper must be independently enclosed by ink and contain sufficient separate lettering. Two morphological openings must identify the same long-tail terminal pixels, within a bounded body size and tail fraction. Two surrounding body collars must agree on a strong owner among exactly two neighboring, proven wide matte-cell rows. The tip alone is not an owner witness: original masks can misassign it. Ambiguous, open, unlettered, colored, nonopaque, invalid or non-row parents defer. Only independently enclosed balloon pixels are transferred; all artwork outside the body and discovery descriptors survive. There are no title/page/text/image/content lookup rules in runtime code. Source artwork stays private and outside git/CI.

Reader canvas bounds include newly restored display extent when needed. Source-mask repairs are cached per image/owners/analysis dimensions. Captured synthetic geometry and source-independent tests are in qa27900/frame-accuracy/test98. See docs/evidence/validation/TEST98-VALIDATION.json for actual check/publication/build outcomes.

## Continue

One bounded primary recovery per pass. The Test95 audit remains the queue, excluding repaired issue4 Reader5 S2, Reader20 S1 and Reader18 S4. Next candidates: issue3 Reader13 irregular speech ownership, issue4 Reader18 S3 foreground artwork, and missing ink-frame scenes. SWAK remains incomplete. Require full source and actual Reader review before credit; distinguish local gains from Brad's accepted phone count.

Private source archive: libfile_06c168de85c08191ba461ab9ef2cdba5. Full Test95 review: libfile_d4c4ca46cd08819192cd7f9617d6f115; notes: libfile_58fed3b235688191ac7e4fec84517824. Test97 saved APK: libfile_4ba55f2331048191a77d61e6a6ebafe0. Scratch hints: /workspace/scratch/6a758560259d/Nth-Shelf-Test98 and /workspace/scratch/6a758560259d/test98; source fixtures /workspace/scratch/5827b11a4a78/fixtures. These paths are not durable recovery guarantees.

Final local validation: all98 behavioral suites plus syntax/cache/package checks pass. Fresh native source-raster Reader checks cover312 pages/1,284 selections. Only issue4 Reader18 S3/S4 change: S4 adds4,319 pixels and removes0; S3 removes546 foreign balloon pixels and adds0. All artwork outside the enclosed balloon remains unchanged. Wolverine, Magneto and all three manga chapters are identical. S1/S2 actual target canvases are byte-identical; all4 selections are reachable. Test98 remains192/384 locally and is now Brad phone-confirmed at192/384,192 remaining.

Published source7bd0d1f2c247bce0a731b1b2b5bc5d6e6b3cff3f exactly matches tested local commitb076ab4df9122b0f0a6143a8c1961c35cb0534c8, tree1c4b3e38d334ed12800df1217be431154a0ccc49. Android run37393752703: https://github.com/bdredenbach/Nth-Shelf/actions/runs/37393752703. Build verification and saved outcomes are recorded in docs/evidence/validation/TEST98-VALIDATION.json.

Verified Android run37393752703 succeeded. Downloaded APK matches artifact digest, CI checksum, package identity, actual signer certificate/CI v2 signature record and all98 frozen packaged web files. App io.github.bdredenbach.nthshelf.frametest98; label Nth Shelf Test98; version2.79.98; code28026. APK3,471,163 bytes, SHA-25671bc3ee2d5af4be0e8da5299502d8fd35dae442de5c2ffb4cf2326c21194b7c4. Browser/backup, native archive, all98 suites and packaging checks passed. Test98 phone acceptance confirmed by Brad on5 October2026: accepted baseline192/384,192 remaining; local result192/384,192 remaining.


</details>

<a id="archive-handoff-2-79-99-md"></a>

<details>
<summary>HANDOFF-2.79.99.md — historical checkpoint</summary>

# Test99 / 2.79.99 — enclosed speech chain across adjacent columns

5 October 2026. Repository bdredenbach/Nth-Shelf, branch Test_Branch.

Brad phone-confirmed Test98 at **192/384 complete original frames, 192 remaining**. Test99 locally completes one more original frame: **193/384, 191 remaining**, **186 selections**, **170 credited groups**. Issue totals:36/99,54/97,63/109,40/79. Brad phone-confirmed Test99 on 5 October 2026 at **193/384, 191 remaining**. This is the accepted baseline for the next pass; phone timing is unmeasured. Count each unique complete original frame once; dual crops count2; larger crops count every complete original frame; clipped or duplicate fragments count0.

## Phone target

Apocalypse issue3 Reader **13**, selection **1**, upper-left bandaged En portrait. The full owned YOU ARE SO BEAUTIFUL, NEPHRI! / WHERE I COME FROM... / -- OSIRIS? balloon chain should be visible across its right gutter. All upper-left artwork and the original left balloon remain. S2 loses only its foreign fragment of this chain; its own jagged DO NOT GRASP balloon remains incomplete and receives no new credit. S3/S4/S5/S6 are byte-identical to Test98. This repairs an existing pop-out; no new selection is added.

## Generic rule

js/panels-column-speech.js is Reader-only source-enclosed ownership between two proven adjacent matte columns. The opaque neutral paper body must be independently enclosed by source ink and contain separate lettering. A short tail must produce exactly the same terminal pixels at two opening scales. Those terminals and their two surrounding collars must strongly and exclusively witness one valid owner. Both original columns must have significant body/collar contact and compatible boundaries. Ambiguous, open, colored, unlettered, invalid, nonopaque or non-column cases defer. Only enclosed speech pixels transfer; all source artwork outside that body and all discovery descriptors survive. There are no title, page, text, image or content lookup rules in runtime code; source artwork stays private and outside git/CI.

Reader canvas bounds expand to include restored display extent. Repairs cache per source image/owners/analysis dimensions. Source-independent geometry and synthetic source tests are in qa27900/frame-accuracy/test99. Read docs/evidence/validation/TEST99-VALIDATION.json for actual validation, publication and Android build status.

## Continue

One bounded primary recovery per pass. Test95's audit remains the queue, excluding repaired issue4 Reader5 S2, Reader20 S1, Reader18 S4 and issue3 Reader13 S1. Next candidates: issue3 Reader13 S2's jagged speech, its continuous hand/wrist action row and false S6 fragment, issue4 Reader18 S3 foreground, and missing ink-frame scenes. SWAK remains incomplete. Require full source and actual Reader review before credit; distinguish local gains from Brad's accepted phone count. The next planned bounded target is issue3 Reader13 S2's jagged speech. The continuation environment failed to connect before source/Reader testing, so no Test100 detector change, frame gain or APK is claimed.

Private source archive:libfile_06c168de85c08191ba461ab9ef2cdba5. Full Test95 review:libfile_d4c4ca46cd08819192cd7f9617d6f115; notes: libfile_58fed3b235688191ac7e4fec84517824. Test98 saved APK:libfile_be4550534e4481918133473ea02969de. Scratch hints: /workspace/scratch/c32b118d688a/Nth-Shelf-Test99 and /workspace/scratch/c32b118d688a/test99; private source fixtures:/workspace/scratch/5827b11a4a78/fixtures. Scratch paths are not durable recovery guarantees.

Final local checks:99 behavioral suites plus the cache/package contract and syntax pass. Fresh native source-raster Reader comparisons cover312 pages/1,284 saved selections. Only issue3 Reader13 S1/S2 change: S1 adds4,582 pixels and removes0; S2 removes917 foreign speech pixels and adds0. Artwork outside the enclosed body is identical. All ten actual target selections are reachable; the eight unaffected canvases are byte-identical. Wolverine, Magneto and three manga chapters match Test98. Test99 locally193/384,191 remaining; Brad phone-confirmed the same193/384,191 remaining on5 October2026.

Published source bf588874bd17f05a85c2e50303d8987538c85cdb exactly matches tested local commit661e644221bb7d832152b293e1486831d44b42dd, tree54607ae1993c908f7b7c60467d19023a8bb07e79. Android run37396911201 succeeded: https://github.com/bdredenbach/Nth-Shelf/actions/runs/37396911201. Downloaded artifact digest, APK checksum, compiled identity, actual v2 signer certificate/CI signature record and all99 packaged web files verified. APK Nth-Shelf-2.79.99-Test99.apk,3,474,649 bytes, SHA-256009bf4e02591b5b0813a2e500a418accacae2589d15def23c33b6881c1cd4b72. App io.github.bdredenbach.nthshelf.frametest99; label Nth Shelf Test99; version2.79.99; code28027. Browser/backup and native archive checks passed. Test99 phone acceptance confirmed by Brad on5 October2026; accepted baseline193/384,191 remaining; local result193/384,191 remaining. The APK and the private source/Reader review are saved alongside this handoff; use their exact filenames to recover them if scratch paths are gone.


</details>

<a id="archive-handoff-2-79-100-md"></a>

<details>
<summary>HANDOFF-2.79.100.md — historical checkpoint</summary>

# Test100 / 2.79.100 — enclosed substantial speech tail across columns

5 October 2026. Repository bdredenbach/Nth-Shelf, branch Test_Branch.

Accepted Test99 baseline: **193/384 complete original frames,191 remaining**, phone-confirmed by Brad. Test100 locally repairs one more existing single frame: **194/384,190 remaining,186 selections,171 credited groups**. Issue totals:36/99,54/97,64/109,40/79. Brad phone-confirmed Test100 at194/384 on6 October2026; phone timing is unmeasured. Count every unique complete original frame once; clipped/duplicate fragments count zero.

## Phone target

Apocalypse issue3 Reader **13**, selection **2**, the centre gold pharaoh panel. The complete opening **DO NOT GRASP AT WHAT YOU CAN NEVER HOLD!** balloon and entire zigzag tail must be visible, along with all pharaoh artwork and lower speech. S3 loses only the foreign opening balloon; its own dialogue and artwork remain intact. S1/S4/S5/S6 and all issue4 Reader18 canvases are byte-identical to Test99. No new selection is added.

## Generic rule

js/panels-column-speech.js retains the short-tail route and adds a separate substantial-tail route. The opaque neutral speech body must be source-enclosed by ink and independently lettered. Exactly one opened core at each of two scales must produce identical terminal pixels. A bounded substantial tail, exclusive original terminal ownership and two terminal collars strongly witness the same owner. Two surrounding body collars must support the same two compatible proven neighboring columns. Open, unlettered, chromatic, transparent, ambiguous, invalid, non-column, short or excessively large tails defer. Only enclosed speech pixels transfer. Discovery and all artwork outside the body are unchanged. There are no title/page/text/image/fingerprint lookup rules in runtime code. Source artwork stays private and outside git/CI.

## Continue

One bounded primary recovery per pass. Use Test95's audit queue, excluding repaired issue4 Reader5 S2, Reader20 S1, Reader18 S4 and issue3 Reader13 S1/S2. Next candidates: issue3 Reader13 continuous hand/wrist row and false S6 fragment, issue4 Reader18 S3 foreground, SWAK and missing ink-frame scenes. Require full source and actual Reader review before credit; distinguish local gains from phone acceptance.

Private source archive:libfile_06c168de85c08191ba461ab9ef2cdba5. Full Test95 review:libfile_d4c4ca46cd08819192cd7f9617d6f115; notes:libfile_58fed3b235688191ac7e4fec84517824. Scratch hints:/workspace/scratch/94949de4a9ed/Nth-Shelf-Test100,/workspace/scratch/94949de4a9ed/test100; fixtures:/workspace/scratch/94949de4a9ed/fixtures. Scratch paths are not durable recovery guarantees.

Local validation:101 behavioral suites plus cache/package and syntax pass. Fresh native source-raster Reader checks cover312 pages/1,284 selections. Only issue3 Reader13 S2/S3 change: S2 adds3,825 pixels and removes0; S3 removes3,870 foreign speech pixels and adds0. All artwork outside the enclosed body is unchanged. Eight unaffected native canvases are byte-identical, all ten target selections are reachable and the changed page freshly reproduces all six discovery descriptors. Wolverine, Magneto and three manga chapters match Test99.

Read docs/evidence/validation/TEST100-VALIDATION.json for actual check, publication, APK verification and saved-file outcomes. Brad phone-confirmed the194/384 checkpoint on6 October2026. Phone timing remains unmeasured.

Published source 177ed19bed8378de6c5f8d775110a27253368466 exactly matches tested local commitaa813af9aae133d8be56c445d4eead84462d6c65, tree90427bc460bf4d5f532dad3bb86acc90e27f5c91. Android run37403679715 succeeded: https://github.com/bdredenbach/Nth-Shelf/actions/runs/37403679715. Downloaded APK checksum, compiled isolated identity, actual v2 signer certificate/CI signature record and all99 frozen web files match. APK Nth-Shelf-2.79.100-Test100.apk,3475021 bytes,SHA-2562fba0be2ba4f5c74e0082f07e9a6c72a785e3cad7317541a724f65e6444291b7. Package io.github.bdredenbach.nthshelf.frametest100; label Nth Shelf Test100; version2.79.100; code28028. Browser/backup and native archive checks passed. Test100 locally194/384,190 remaining; accepted Test100 phone baseline194/384,190 remaining.


</details>

<a id="archive-handoff-2-79-101-md"></a>

<details>
<summary>HANDOFF-2.79.101.md — historical checkpoint</summary>

# Test101 / 2.79.101 — complete continuous hand/wrist row

6 October2026. Repository bdredenbach/Nth-Shelf, branch Test_Branch.

Brad phone-confirmed Test100 at **194/384,190 remaining**. Test101 locally adds one unique complete original frame: **195/384,189 remaining,186 selections,171 credited groups**. Issue totals:36/99,54/97,65/109,40/79. Brad phone-confirmed Test101 at195/384 on6 October2026. Phone timing is unmeasured.

## Phone target

Apocalypse issue3 Reader **13**, selection **5**. The entire hand/wrist/face action row must be visible, including the left forearm, blue gripping hand, sleeve and right face/NO speech. The complete lower chamber and all dialogue remain. This existing larger pop-out now contains two complete original frames. Selection6 remains a duplicate fragment and counts zero extra frames. S1/S2/S3/S4/S6 and all four issue4 Reader18 canvases remain unchanged.

## Generic rule

js/panels-split-cell-completion.js completes only a bounded Reader composite when two validated original paper split siblings have one large envelope containing exactly one small artwork-bearing sibling. The opaque source must enclose both in one edge-connected-paper complement at thresholds230 and235, with at most0.1% disagreement, no other owner, one traced contour, bounded added area and the same envelope. All current display pixels survive; outside-cell pixels and sibling selections are unchanged. Original sibling taps keep their prior ownership; newly recovered unowned pixels select the larger composite. Discovery is unchanged. No title/page/text/image/fingerprint lookup is used. Private source rasters remain outside git/CI.

## Continue

One bounded primary recovery per pass. Exclude repaired issue4 Reader5 S2, Reader20 S1, Reader18 S4 and issue3 Reader13 S1/S2/S5. Next candidates: issue4 Reader18 S3 foreground, SWAK and missing ink-frame scenes. S6 is still a duplicate fragment, not another original frame. Require full source and actual Reader review before credit; keep local and phone acceptance distinct.

Private source archive:libfile_06c168de85c08191ba461ab9ef2cdba5. Full Test95 review:libfile_d4c4ca46cd08819192cd7f9617d6f115; notes:libfile_58fed3b235688191ac7e4fec84517824. Scratch hints:/workspace/scratch/94949de4a9ed/Nth-Shelf-Test101,/workspace/scratch/94949de4a9ed/test101; fixtures:/workspace/scratch/94949de4a9ed/fixtures. These paths are not durable recovery guarantees.

Read docs/evidence/validation/TEST101-VALIDATION.json for actual checks, publication, APK verification and saved-file outcomes.

Final local validation:103 behavioral suites plus cache/package and syntax pass. Native source-raster Reader comparisons cover312 pages/1,284 selections against Test100. Only issue3 Reader13 S5 changes:42,803 added pixels,zero removed. All source-cell pixels are present; outside-cell pixels and every prior display pixel survive. Nine unaffected native canvases are byte-identical; all ten target selections remain reachable. The changed page freshly reproduces all six discovery descriptors. Wolverine, Magneto and all three manga chapters are unchanged. Phone timing is unmeasured.

Published source 58eff0d7779be6cfb7361279984c66f12877dbd1 exactly matches tested local commit9bdd6bb699736e8f8898d2781108ccea2827a301, tree1e882a3469115e5fdcf67c8d351172ab2e0cf3d1. Android run37407535020 succeeded: https://github.com/bdredenbach/Nth-Shelf/actions/runs/37407535020. Downloaded checksum, isolated compiled identity, actual v2 signer certificate/CI signature record and all100 frozen web files match. APK Nth-Shelf-2.79.101-Test101.apk,3478023 bytes,SHA-2563307b666cd8ff2cfc380eb93b7215adc07159f90d77f3352e40abfe5273c60ce. Package io.github.bdredenbach.nthshelf.frametest101;label Nth Shelf Test101;version2.79.101;code28029. Browser/backup and native archive checks passed. Test101 locally195/384,189 remaining;accepted phone baseline194/384,190 remaining;Test101 phone acceptance pending.


</details>

<a id="archive-handoff-2-79-102-md"></a>

<details>
<summary>HANDOFF-2.79.102.md — historical checkpoint</summary>

# Test102 /2.79.102 — complete SWAK reaction frame

6 October2026. Repository bdredenbach/Nth-Shelf, branch Test_Branch.

Brad phone-confirmed Test101 at195/384,189 remaining. Test102 locally completes one more unique original frame:196/384,188 remaining,186 selections,172 credited groups. Issue totals36/99,55/97,65/109,40/79. Test102 phone acceptance is pending; timing is unmeasured.

Phone target: Apocalypse issue2 Reader18 selection2, SWAK reaction. The full right background, head/neck edge and shoulder should survive. The lettering, speech and earlier artwork remain; selection1's complete water-and-hand scene stays intact. Earlier issue3 Reader13 S1/S2/S5 gains remain; S6 is still a duplicate fragment worth zero.

The generic Reader-only rule requires a validated narrow dark-matte lettering cell, two or three bounded lateral source compartments agreeing at thresholds60/65, no straight frame divider, bounded added area and protection of every other owner. It preserves current display pixels and concavities; only the lateral edge grows. Recovered artwork is tappable on the first tap and the native crop bounds expand. Discovery is unchanged. No title/page/text/image/fingerprint lookup is used; private source artwork remains outside git/CI.

Continue one bounded primary recovery per pass. SWAK is now locally repaired, pending phone confirmation. Missing ink-frame scenes remain queued. Issue4 Reader18 S3 needs clearer ownership review and receives no credit here. Count complete original frames once, including fully complete frames inside larger crops; fragments and duplicates add zero. User authorization persists for isolated publication and APK builds.

Read docs/evidence/validation/TEST102-VALIDATION.json for completed checks, exact source/build identities and saved files. Private Apocalypse archive:libfile_06c168de85c08191ba461ab9ef2cdba5. Controls:Wolverine libfile_df4e3f2e95488191a8684aac7b8ff80e; Magneto libfile_11da0f85d7148191b1bef1abe6fe482d; manga libfile_be583424a66c8191bc6a8be6c6978420,libfile_a1089428d0d4819193de79fc4bd7f8bb,libfile_c87d71d1abf48191b87e46bafaa84c7f. Full Test95 audit:libfile_d4c4ca46cd08819192cd7f9617d6f115; notes libfile_58fed3b235688191ac7e4fec84517824.

Final validation:105 behavioral suites plus cache/package and syntax passed locally and in CI. Fresh native comparisons cover312 pages/1284 selections against frozen Test101 baseline masks, computed from the same original sources. Only SWAK S2 changes:+7697 pixels,zero removed,zero new foreign-display overlap.11 native canvases are byte-identical,all12 targets reachable; the changed page reproduces both discovery descriptors. Source 5d00cc0268e723fd32d30f22a604da697f6a0ae7 exactly matches tested tree 2c417569b8b722f80087f71d2b2df1c400c80e66. Android run 37467779710 succeeded: https://github.com/bdredenbach/Nth-Shelf/actions/runs/37467779710. Downloaded APK identity,checksum,actual v2 certificate/CI signature record and all101 packaged web files match. APK bytes:3481423;SHA-256:a85f89bebaf76195a0f63997dc46aa72e365ad65651be1bd2f3a110d12355810. Test102 phone acceptance pending;timing unmeasured.

Saved deliverables:
- Nth-Shelf-2.79.102-Test102.apk:libfile_50425369c9288191a4b4c773aeb6bf24;file_00000000ee6882308bb892bf927e4aad
- Nth-Shelf-Test102-Frame-Review.html:libfile_4818e09512a881918334040ca03737e1;file_00000000e06c81f884e6aa8f024049bb
- Nth-Shelf-Test102-New-Chat-Handoff.txt:libfile_9ea8e5e289cc81918b9d39073fa689aa;file_00000000e5d481f8ac238377ca3e0f7d


</details>

<a id="archive-handoff-2-79-103-md"></a>

<details>
<summary>HANDOFF-2.79.103.md — historical checkpoint</summary>

# Test103 / 2.79.103 — two landscape-frame recoveries

6 October 2026. Repository bdredenbach/Nth-Shelf, branch Test_Branch.

Brad phone-confirmed Test102 at 196/384, 188 remaining. Test103 locally completes two more unique original frames: **198/384, 186 remaining**, 188 selections, 174 credited groups. Issue totals: 38/99, 55/97, 65/109, 40/79. Test103 phone acceptance is confirmed by Brad on 6 October 2026; timing is unmeasured.

Phone targets: **Apocalypse issue 1, Reader page 18** (landscape; Reader page numbers include the covers). Selection 3 is the full wide punch scene, sound-effect lettering and both captions. Selection 4 contains the complete standing-silhouette scene at left, including all three balloons: “Echoes of himself,” “Herein there lies an artifact,” and “An incredible object…”. Selection 4 also contains an incomplete En portrait: its forehead is clipped, earns zero credit, and remains queued. Selections 1 and 2 stay intact. Page coverage advances from 2/8 to 4/8. Install the separate **Nth Shelf Test103** app to review these two targets.

The generic append-only landscape supplement requires independently eroded source paper cells at radii 4/6, bounded mask agreement, four-sided paper/ink/page-edge evidence and exclusive prior ownership. A terminal composite retains its internal scene boundary. A bounded overlap fringe is assigned away from the upper crop to preserve the lower balloon. Proof version 50 is distinct from earlier speech version 49. No title/page/text/image/fingerprint lookup is used; private source artwork stays outside git/CI.

User now requests **two complete frames per pass**, superseding the old one-frame cadence. Count each unique complete original once; complete originals inside larger crops count individually, while fragments and duplicates add zero. Group usability is separate from coverage. Continue bounded recoveries and preserve existing owners. Issue 1 Reader 18's upper cavern, two narrow dialogue strips and clipped En portrait remain queued. Issue 4 Reader 18 selection 3 still needs ownership review. Publication and isolated APK authorization persist.

Local validation: 107 behavioral suites plus cache/package/syntax passed. Fresh before/after Reader display-mask comparisons use the same original image rasters and context for 312 retained discovery maps, with Test102 modules as baseline. All 1,284 earlier masks are unchanged; only issue 1 Reader 18 appends two descriptors, bringing the total to 1,286. This is not a full rerun of the older underlying detector on the entire corpus. Fresh full detection reproduces the changed page's four selections. Twenty original native Reader canvases are byte-identical; all 22 control/new selections are reachable. Wolverine, Magneto and all three manga chapters remain unchanged.

CI validation: 107 behavioral suites, cache/package/syntax, browser interaction/backup round trips and native streaming archive regression passed. Published source **83ca47163f8f029b3e81a43057227a47d5837237** exactly matches tested tree **86e2c1bc1b0a9e4766968cd9addff5c8d842bafb**. Android run **37474402314** succeeded: https://github.com/bdredenbach/Nth-Shelf/actions/runs/37474402314. Artifact ID: 11418143195.

APK: Nth-Shelf-2.79.103-Test103.apk, 3485147 bytes. SHA-256: 70cc80de9ea6daedd4a7a5b36977a483740b594f71378c82ad03bc52e47c8565. The downloaded APK's checksum, compiled isolated identity (io.github.bdredenbach.nthshelf.frametest103, version code 28031), actual v2 signer certificate/CI record and all 102 packaged web files match. Test103 phone acceptance was confirmed by Brad on 6 October 2026; timing is unmeasured.

Read docs/evidence/validation/TEST103-VALIDATION.json for exact source/build identities and saved-file IDs. Private Apocalypse archive: libfile_06c168de85c08191ba461ab9ef2cdba5. Controls: Wolverine libfile_df4e3f2e95488191a8684aac7b8ff80e; Magneto libfile_11da0f85d7148191b1bef1abe6fe482d; manga libfile_be583424a66c8191bc6a8be6c6978420, libfile_a1089428d0d4819193de79fc4bd7f8bb, libfile_c87d71d1abf48191b87e46bafaa84c7f. Full Test95 audit: libfile_d4c4ca46cd08819192cd7f9617d6f115; notes: libfile_58fed3b235688191ac7e4fec84517824.

Scratch hints: /workspace/scratch/154f87da09a8/Nth-Shelf-Test103; checks: /workspace/scratch/154f87da09a8/test103; fixtures: /workspace/scratch/94949de4a9ed/fixtures; retained discovery maps: /workspace/scratch/f515f9782ac9/test96/corpus. Scratch can disappear; recover from the archive IDs above and repository checkpoint.


</details>

<a id="archive-handoff-2-79-104-md"></a>

<details>
<summary>HANDOFF-2.79.104.md — historical checkpoint</summary>

# Test104 / 2.79.104 — two upper landscape originals

6 October 2026. Repository bdredenbach/Nth-Shelf, branch Test_Branch.

Brad phone-confirmed Test103 at **198/384, 186 remaining** on 6 October 2026. Test104 locally completes two more unique original frames: **200/384, 184 remaining**, 189 selections, 175 credited groups. Issue totals: 40/99, 55/97, 65/109, 40/79. Brad phone-confirmed Test104 on 6 October 2026; timing is unmeasured.

Phone targets: **Apocalypse issue 1, Reader page 18**, new **selection 5** on the landscape page (Reader page numbers include covers). One new group contains two complete originals: the broad upper cavern scene and the full left dialogue strip immediately beneath it. Check the left strip's four balloon bodies, Rama-Tut portrait, En portrait and entire sword, including its protruding tip. The right strip remains an incomplete fragment worth zero. The En portrait in S4 remains forehead-clipped, also worth zero. Existing S1–S4 are preserved. Page coverage advances from 4/8 to 6/8. Install the separate **Nth Shelf Test104** app.

The generic append-only upper-landscape route requires source paper cells from independent erosion radii 6/8 to agree within 0.2%, a measured broad upper contour, four-sided paper/ink/page-edge evidence and both lateral page edges. Internal scene boundaries are retained, not erased. A bounded lower overlap fringe yields to prior source owners. The Reader evaluates earlier masks with their original ownership context, preserving all their existing repaired pixels, then subtracts those displayed masks from the new group. Proof version 51 is distinct from landscape proof 50. No title/page/text/image/fingerprint lookup is used. Private original artwork remains outside git/CI.

Continue **two complete original frames per handoff**. Count each unique complete original once, including complete originals inside larger groups; fragments and duplicates add zero. Group usability is separate from coverage. Preserve all accepted owners. Issue 1 Reader 18's right dialogue strip and the clipped En portrait remain queued; issue 4 Reader 18 S3 foreground still needs ownership review. Publication and isolated APK authorization persist.

Local validation: 109 behavioral suites plus cache/package/syntax passed. All 312 retained discovery maps are compared against the same original rasters and Test103 modules: 1,286 earlier displayed masks remain unchanged; exactly one new group yields 1,287 selections. Following the ownership adjustment, all 91 Apocalypse pages receive a fresh final Reader comparison; the other 221 pages contain no new proof 51 and pass through to unchanged Test103 behavior. The native Reader preserves 22 earlier canvases byte-for-byte, keeps all 23 control/new selections reachable, and verifies zero new displayed-owner overlap. Fresh full detection reproduces the five-selection changed page. Wolverine, Magneto and all three manga chapters are unchanged. No complete-corpus rerun of the older underlying detector is claimed. CI: 109 behavioral suites, cache/package/syntax, browser interaction/backup round trips, native streaming archive regression and frozen web byte/signature/identity checks passed. Published source e47c26ab2f388c3c1f62a6b1e1d87a6ea8e04ac3 matches tested tree bf8a2a601f68f9544bd549eac8c0317ea869795a. Android run 37481696070 succeeded: https://github.com/bdredenbach/Nth-Shelf/actions/runs/37481696070. Artifact ID: 11421761808.

APK: Nth-Shelf-2.79.104-Test104.apk, 3489274 bytes. SHA-256: 50febed5eb884b67abcedeeb4126394fc553b197080c474293abd0a58916b4d8. Downloaded checksum, compiled isolated identity (io.github.bdredenbach.nthshelf.frametest104, version code 28032), actual v2 signer certificate/CI record and all 103 frozen web assets match tested source. Test104 phone-confirmed by Brad on 6 October 2026; phone timing is unmeasured.

Source archive IDs: Apocalypse libfile_06c168de85c08191ba461ab9ef2cdba5; Wolverine libfile_df4e3f2e95488191a8684aac7b8ff80e; Magneto libfile_11da0f85d7148191b1bef1abe6fe482d; manga libfile_be583424a66c8191bc6a8be6c6978420, libfile_a1089428d0d4819193de79fc4bd7f8bb, libfile_c87d71d1abf48191b87e46bafaa84c7f. Full Test95 audit: libfile_d4c4ca46cd08819192cd7f9617d6f115; notes: libfile_58fed3b235688191ac7e4fec84517824.

Scratch checkpoint: /workspace/scratch/35acfbe72dfc/Nth-Shelf-Test104; checks/corpus: /workspace/scratch/35acfbe72dfc/test104; fixtures: /workspace/scratch/35acfbe72dfc/fixtures. Scratch can disappear; restore from source archive IDs and the published repository checkpoint. Read docs/evidence/validation/TEST104-VALIDATION.json for exact source/build identities and saved-file IDs.


</details>

<a id="archive-handoff-2-79-105-md"></a>

<details>
<summary>HANDOFF-2.79.105.md — historical checkpoint</summary>

# Test105 / 2.79.105 — two fight originals

6 October 2026. Repository bdredenbach/Nth-Shelf, branch Test_Branch.

Brad phone-confirmed Test104 at **200/384, 184 remaining** on 6 October 2026. Test105 locally completes two more unique original frames: **202/384, 182 remaining**, 190 selections, 176 credited groups. Issue totals:42/99,55/97,65/109,40/79. Brad phone-confirmed Test105 on 6 October 2026; timing is unmeasured.

Phone target: **Apocalypse issue1, Reader page13**, new **selection2**. One new group contains two complete originals: central sword-fight and lower-left attack. Check the full central dialogue, fighters, crossing foreground shoulder and sword; the lower-left attack must keep both balloon bodies, fighters, weapons and SHAK lettering. Tap either scene to open this group. The upper-left attacker portrait is only a fragment and adds zero. The top horizontal attack remains missing. Original selection1 preserves the complete bottom-right pair. Page coverage advances2/6 to4/6. Install separate **Nth Shelf Test105**.

Generic append-only paper continuation route: independent erosion radii4/6 agree within0.2%; broad source contour has exterior paper/ink support on every side and no earlier source-owner overlap. Internal scene boundaries remain visible. Reader evaluates earlier masks in their original context and subtracts their displayed pixels from the appended group. Proof52 differs from prior proof51. No title/page/text/image/fingerprint lookup. Private source artwork stays outside git/CI.

Continue **two complete original frames per handoff**. Count each unique complete original once, including originals inside larger groups; fragments and duplicates add zero. Group usability is separate from coverage. Preserve accepted owners. Issue1 Reader13 top horizontal attack and complete upper-left portrait remain queued; issue1 Reader18 right dialogue strip and clipped En portrait remain queued; issue4 Reader18 S3 foreground needs ownership review. Publication and isolated APK authorization persist.

Local validation:111 behavioral suites plus cache/package/syntax passed. All312 retained Test104 discovery maps are compared against the same original rasters and Test104 modules:1,287 earlier displayed masks unchanged; exactly one new group yields1,288 selections. All91 Apocalypse and221 control pages receive final Reader comparisons. Twenty-four earlier native Reader canvases remain byte-identical; all25 control/new selections are reachable, and the new crop has zero earlier displayed-owner overlap. Fresh full detection reproduces the changed two-selection page. Wolverine, Magneto and all three manga chapters are unchanged. No complete-corpus rerun of the older underlying detector is claimed. CI: 111 behavioral suites, cache/package/syntax, browser interaction/backup round trips, native streaming archive and frozen web byte/signature/identity checks passed. Published source 98490a7b3b46674749e61ff7cadf1db9bf3cc2ee matches tested tree b7f558742b069533c79387f5ce6026886e8a0fcf. Android run 37487129419 succeeded: https://github.com/bdredenbach/Nth-Shelf/actions/runs/37487129419. Artifact ID: 11423294501.

Source archive IDs: Apocalypse libfile_06c168de85c08191ba461ab9ef2cdba5; Wolverine libfile_df4e3f2e95488191a8684aac7b8ff80e; Magneto libfile_11da0f85d7148191b1bef1abe6fe482d; manga libfile_be583424a66c8191bc6a8be6c6978420, libfile_a1089428d0d4819193de79fc4bd7f8bb, libfile_c87d71d1abf48191b87e46bafaa84c7f. Full Test95 audit:libfile_d4c4ca46cd08819192cd7f9617d6f115;notes:libfile_58fed3b235688191ac7e4fec84517824.

Scratch checkpoint:/workspace/scratch/9de482359b6f/Nth-Shelf-Test105;checks/corpus:/workspace/scratch/9de482359b6f/test105;fixtures:/workspace/scratch/35acfbe72dfc/fixtures. Scratch can disappear; restore source archives and published repository. Read docs/evidence/validation/TEST105-VALIDATION.json for identities and saved-file IDs.

APK: Nth-Shelf-2.79.105-Test105.apk,3493256 bytes. SHA-256: e88f7bedf1c32fca46f4521fa09d679124e90a06a87986e931e270182d705120. Downloaded checksum, compiled isolated identity(io.github.bdredenbach.nthshelf.frametest105,version code 28033), actual v2 signer certificate/CI record and all 104 frozen web assets match tested source. Test105 phone-confirmed by Brad on 6 October 2026; phone timing is unmeasured.


</details>

<a id="archive-handoff-2-79-106-md"></a>

<details>
<summary>HANDOFF-2.79.106.md — historical checkpoint</summary>

# Test106 / 2.79.106 — five complete original frames

6 October 2026. Repository bdredenbach/Nth-Shelf, branch Test_Branch.

Brad phone-confirmed Test105 at **202/384, 182 remaining**. Test106 completes five more originals locally: **207/384, 177 remaining**, 194 selections, 180 credited groups. Issue totals:43/99,59/97,65/109,40/79. Brad phone-confirmed Test106 on 6 October 2026; phone timing is unmeasured.

Phone targets (Reader page numbers include the covers):
- Apocalypse issue1, Reader13, new selection3: complete top horizontal attack, sword/arms, RAAEEE lettering and full dialogue. Original selections1/2 preserved. Partial narrow attacker portrait adds zero. Page now5/6 complete originals.
- Apocalypse issue2, Reader10, selection1: complete upper-right Pharaoh/Nephri conversation and middle-right Pharaoh smile, both including all balloons. Incomplete tall Nephri silhouette adds zero.
- Same page, selection2: complete Logos protest, all five balloons, figure/background and jagged scene edges.
- Same page, selection3: complete bottom Logos close-up, outstretched hand, staff and all three balloons. Page now4/5 complete originals.
Install separate **Nth Shelf Test106**.

Generic wide-paper-row supplement: independent erosion radii4/6 must agree within0.2%. The first map retains unique pixel ownership; the second verifies stability. Every non-edge frontier requires measured exterior paper and ink evidence; at most one side may touch a page edge. Earlier source and displayed owners retain every pixel. Internal scene boundaries remain visible. Reader evaluates earlier masks in their original context. Proof53 is separate from previous proofs50/51/52. No book/page/title/text/image/fingerprint lookup. Private artwork stays outside git/CI.

Brad requested **five complete original frames this round**, superseding the two-frame cadence. Count each unique complete original once, including originals inside larger groups; fragments and duplicates add zero. Group usability is separate from coverage. Preserve accepted owners. Remaining local queue includes issue1 Reader13 narrow attacker portrait, issue2 Reader10 tall Nephri silhouette, issue1 Reader18 right dialogue strip and clipped En portrait, and issue4 Reader18 S3 foreground ownership. Publication and isolated APK authorization persist.

Local validation:113 behavioral suites plus cache/package/syntax passed. Fresh final Reader comparisons cover312 retained Test105 discovery maps and the same original sources: all1,288 earlier displayed masks unchanged; only the two target pages append4 selections, yielding1,292. All91 Apocalypse and221 control pages receive final comparisons. Twenty-five earlier native canvases are byte-identical; all29 selections are reachable, and four new crops have zero displayed-owner overlap. Both changed pages reproduce final discovery through fresh full detector replay. Wolverine,Magneto and all three manga chapters remain unchanged. No full-corpus rerun of the older underlying detector is claimed. Published source 600583c8f329ab43bd71dfb13e4e86b1c854a600 matches tested tree 1a45c92717b3d98b436d6b9d0de2b3e2e19be703. Android run37492597346 succeeded: https://github.com/bdredenbach/Nth-Shelf/actions/runs/37492597346. CI:113 behavioral suites,cache/package/syntax,browser/backup,native streaming archive,and frozen web byte/signature/identity checks passed. Artifact ID:11426098337.

Source archives: Apocalypse libfile_06c168de85c08191ba461ab9ef2cdba5; Wolverine libfile_df4e3f2e95488191a8684aac7b8ff80e; Magneto libfile_11da0f85d7148191b1bef1abe6fe482d; manga libfile_be583424a66c8191bc6a8be6c6978420, libfile_a1089428d0d4819193de79fc4bd7f8bb, libfile_c87d71d1abf48191b87e46bafaa84c7f. Full Test95 audit:libfile_d4c4ca46cd08819192cd7f9617d6f115;notes:libfile_58fed3b235688191ac7e4fec84517824.

Scratch checkpoint:/workspace/scratch/7e6b6457ff98/Nth-Shelf-Test106;checks:/workspace/scratch/7e6b6457ff98/test106/final;fixtures:/workspace/scratch/35acfbe72dfc/fixtures. Scratch can disappear; restore source archives and published repository. Read docs/evidence/validation/TEST106-VALIDATION.json for exact checks, identities and saved-file IDs.

APK: Nth-Shelf-2.79.106-Test106.apk, 3497116 bytes. SHA-256:25211673e76e6363987c99e35754e269a78fee88eccc572bf8e864f80f4e92ff. Downloaded checksum, compiled isolated identity(io.github.bdredenbach.nthshelf.frametest106,version code28034), actual v2 signer certificate/CI record and all105 frozen web assets match tested source. Test106 phone-confirmed by Brad on 6 October 2026; phone timing unmeasured.


</details>

<a id="archive-handoff-2-79-107-md"></a>

<details>
<summary>HANDOFF-2.79.107.md — historical checkpoint</summary>

# Test107 / 2.79.107 — ten complete original frames

6 October 2026. Repository bdredenbach/Nth-Shelf, branch Test_Branch.

Brad phone-confirmed Test106 at **207/384, 177 remaining**. Test107 locally completes ten more originals: **217/384, 167 remaining**, 198 Apocalypse selections, 184 credited groups. Issue totals:53/99,59/97,65/109,40/79. Test107 phone acceptance is pending; phone timing unmeasured.

Phone targets (Reader numbers include the covers), all Apocalypse issue1:
- Reader3, selection1: campfire, narrow direction strip and bottom sandstorm (3 complete originals). Eye/cartouche fragment earns zero: its lower-right caption is missing.
- Reader4, new selection3: complete central mounted-warrior scene and all three captions (1). Printed credits add zero. Existing selections1/2 preserved.
- Reader11, new selection2: middle-left warrior, mocking-face inset, tall right Baal portrait and bottom attack (4). All dialogue remains intact. Existing selection1 preserved.
- Reader19, new selection3: upper face-cut attack and middle temple, with all speech and three captions (2). Existing selections1/2 preserved.
Install separate **Nth Shelf Test107**.

Generic stable exterior groups: independent eroded source maps at radii4/6 agree within0.2%; first-map ownership survives. Matching paper/color palette, measured exterior-matte support and contrasting ink witness each non-edge frontier. Broad paper groups may touch up to two page sides; nearly full-height chromatic groups up to three. Scene boundaries remain visible in larger groups; grouping quality remains separate from original-frame coverage. Proof54 is distinct from earlier proofs. Achromatic dark gutters remain with established detectors. Earlier source owners and repaired Reader display masks keep every pixel and are evaluated in their original context. No title/page/book/text/image/fingerprint lookup. Private artwork stays outside git/CI.

Cadence: Brad requested **ten complete frames this session**, superseding five. Count each complete original once, including originals in groups. Fragments and duplicates add zero. Accepted207 are retained; Test107 phone acceptance pending. Publication and isolated APK authorization persist.

Local validation:115 behavioral suites plus cache/package/syntax passed. Original-raster comparison of312 retained Test106 maps preserves all1,292 earlier display masks; final certified source subset appends4 Apocalypse selections, yielding1,296. A final rejection-only palette gate removes one achromatic Wolverine candidate; crop behavior is unchanged. Final source supplementation confirms its rejection. Wolverine,Magneto and all three manga chapters retain their selection maps. Five earlier native canvases are byte-identical; all9 targets are reachable, with zero new displayed overlap. All four changed pages reproduce final discovery through fresh complete detector replay. No full-corpus rerun of the older underlying detector is claimed. Published source b3c36ae3d2e8fdad292be81f535d9c2cdf5f93c4 matches tested tree d6409e6674784be7ea571e30c9674bb3e5c2c6d3. Android run37498880250 succeeded: https://github.com/bdredenbach/Nth-Shelf/actions/runs/37498880250. CI:115 behavioral suites,cache/package/syntax,browser/backup,native streaming archive,and frozen web byte/signature/identity checks passed. Artifact ID:11428798302.

Remaining queue: issue1 Reader3 eye/cartouche; issue1 Reader13 narrow attacker portrait; issue2 Reader10 tall Nephri silhouette; issue1 Reader18 right dialogue strip and clipped En portrait; issue4 Reader18 S3 foreground ownership. Next work should investigate one bounded reusable rule before extending the batch. The ten-frame session completed locally; Android chat-stall behavior is a user observation, not something the detector or local tests can measure.

Source archives: Apocalypse libfile_06c168de85c08191ba461ab9ef2cdba5; Wolverine libfile_df4e3f2e95488191a8684aac7b8ff80e; Magneto libfile_11da0f85d7148191b1bef1abe6fe482d; manga libfile_be583424a66c8191bc6a8be6c6978420, libfile_a1089428d0d4819193de79fc4bd7f8bb, libfile_c87d71d1abf48191b87e46bafaa84c7f. Full Test95 audit:libfile_d4c4ca46cd08819192cd7f9617d6f115;notes:libfile_58fed3b235688191ac7e4fec84517824.

Scratch checkpoint:/workspace/scratch/13f13694b21d/Nth-Shelf-Test107;checks:/workspace/scratch/13f13694b21d/test107/final;fixtures:/workspace/scratch/35acfbe72dfc/fixtures. Scratch can disappear; restore source archives and published repository. Read docs/evidence/validation/TEST107-VALIDATION.json for exact checks, identities and saved-file IDs.

APK: Nth-Shelf-2.79.107-Test107.apk, 3501170 bytes. SHA-256:940c0f62ae3b71e8e5e56388118564f0538851c2be344b160386b9dc443cb669. Downloaded checksum, compiled isolated identity(io.github.bdredenbach.nthshelf.frametest107,version code28035), actual v2 signer certificate/CI record and all106 frozen web assets match tested source. Test107 phone confirmation pending; phone timing unmeasured.


</details>

<a id="archive-handoff-2-79-108-md"></a>

<details>
<summary>HANDOFF-2.79.108.md — historical checkpoint</summary>

# Test108 / 2.79.108 — ten more complete original frames

6 October2026. Repository bdredenbach/Nth-Shelf, branch Test_Branch.

Brad phone-confirmed Test107 at **217/384,167 remaining**. Test108 locally completes ten more unique originals: **227/384,157 remaining**,202 Apocalypse selections,188 credited groups. Issue totals60/99,62/97,65/109,40/79. Test108 phone acceptance pending; timing unmeasured.

Install separate **Nth Shelf Test108**. Reader page numbers include covers:
- Apocalypse issue1 Reader14 selection5: lower En/fallen Baal and father-conversation inset(2 originals); selection6: tall Baal/totem scene(1). Existing S1–S4 preserved.
- Issue1 Reader17 selection2: middle cavalry strip and lower Baal/cave scene with cavern and clawing-stone insets(4). Existing S1 preserved; its partial speech fragment in S2 earns zero.
- Issue2 Reader4 selection2: dead-warriors strip, Ozymandias rising and underlying scene(3). Existing S1 preserved. Printed title,credits and copyright add zero.

Generic trailing-edge cells require independently eroded source maps at radii4/6 to agree within0.2%, matching paper/chromatic palette, broad compact connected cells closed by a measured trailing page edge, four-frontier exterior/ink evidence, and zero earlier source overlap. Ink is required on non-trailing frontiers; the page edge closes the remaining side. Dark/achromatic mattes stay with existing detectors. Proof55 is distinct from earlier proofs. Earlier Reader display owners retain their original evaluation context and every repaired pixel. No title/page/book/text/image/fingerprint lookup; no private original artwork in git/CI.

Count each complete original once, including originals in groups. Fragments/duplicates add zero. Group usability remains separate. Cadence is ten originals per session. Accepted217 retained. Publication and isolated APK authorization persist.

Local validation:117 behavioral suites plus cache/package/syntax passed. Original-raster comparison of312 certified Test107 maps preserves all1,296 earlier Reader displayed masks. Exactly4 new Apocalypse selections yield1,300 across the corpus; Wolverine,Magneto and three manga chapters retain their selection maps. One rejected-candidate residue in an intermediate Wolverine map was corrected against the certified baseline, and its final source/Reader row rechecked. Six earlier native canvases are byte-identical; all10 target selections reachable with zero new displayed overlap. All three changed pages reproduce final discovery through fresh full detector replay. Source-independent positive,missing-ink,missing-page-edge and achromatic-exterior negatives pass. No full-corpus rerun of the older underlying detector is claimed. Published source 26d5c7975aab146e9840759e0ceeddb2fdbdc6b6 matches tested tree f16965b0e81ee620c9679a908cc7d1ba692197c3. Android run37504895502 succeeded: https://github.com/bdredenbach/Nth-Shelf/actions/runs/37504895502. CI:117 behavioral suites,cache/package/syntax,browser/backup,native streaming archive,and frozen web byte/signature/identity checks passed. Artifact ID:11432245329.

Remaining queue: issue1 Reader3 eye/cartouche; issue1 Reader13 narrow attacker portrait; issue2 Reader10 tall Nephri silhouette; issue1 Reader18 right dialogue strip and clipped En portrait; issue4 Reader18 S3 foreground ownership. Investigate one bounded reusable rule before extending the batch. Phone timing and Android chat-stall duration are unmeasured locally.

Source archives: Apocalypse libfile_06c168de85c08191ba461ab9ef2cdba5; Wolverine libfile_df4e3f2e95488191a8684aac7b8ff80e; Magneto libfile_11da0f85d7148191b1bef1abe6fe482d; manga libfile_be583424a66c8191bc6a8be6c6978420,libfile_a1089428d0d4819193de79fc4bd7f8bb,libfile_c87d71d1abf48191b87e46bafaa84c7f. Full Test95 audit libfile_d4c4ca46cd08819192cd7f9617d6f115; notes libfile_58fed3b235688191ac7e4fec84517824.

Scratch checkpoint:/workspace/scratch/23ca29e5ae64/Nth-Shelf-Test108;checks:/workspace/scratch/23ca29e5ae64/test108;fixtures:/workspace/scratch/35acfbe72dfc/fixtures. Scratch can disappear; restore source archives and published repository. Read docs/evidence/validation/TEST108-VALIDATION.json for exact checks,identities and saved-file IDs.

APK: Nth-Shelf-2.79.108-Test108.apk, 3505231 bytes. SHA-256:a37f130e2a867459c30b99ab00c7f88d771a906ec8bddd59797abdad0e728c06. Downloaded checksum, compiled isolated identity(io.github.bdredenbach.nthshelf.frametest108,version code28036), actual v2 signer certificate/CI record and all107 frozen web assets match tested source. Test108 phone confirmation pending; phone timing unmeasured.


</details>

<a id="archive-handoff-2-79-109-md"></a>

<details>
<summary>HANDOFF-2.79.109.md — historical checkpoint</summary>

# Test109 / 2.79.109 — ten more complete original frames

6 October 2026. Repository bdredenbach/Nth-Shelf, branch Test_Branch.

Brad phone-confirmed Test108 at **227/384, 157 remaining**. Test109 locally completes ten more unique originals: **237/384, 147 remaining**, 206 Apocalypse selections, 192 credited groups. Issue totals61/99,62/97,74/109,40/79. Test109 phone acceptance pending; timing unmeasured.

Install separate **Nth Shelf Test109**. Reader page numbers include covers:
- Issue1 Reader7 selection2: the complete tall left slashing scene, including NOOO oval, three SHAK sound effects and blood spray (1 original). The upper eye/sword strip remains incomplete and earns zero.
- Issue3 Reader7 selection3: the tall left soldier/crowd view from STAND BACK to its lower figures, middle troop strip and lower En/Logos conversation (3 originals). Two independently stable touching cells reunite the tall view. Existing S1/S2 retain their accepted artwork.
- Issue3 Reader18 selection3: sunrise strip and upper Logos, Nephri and Ozymandias portraits (4 originals). The upper enclosed speech chain ends with the complete EXAMPLE line. Earlier S1 loses its foreign upper speech fragment; both lower frames retain their accepted artwork.
- Issue3 Reader22 selection1: top Pharaoh portrait and middle Ozymandias killing Logos scene (2 originals). Clipped speech from the lower conversation earns zero.

The reusable paper-cell rule requires independently eroded maps at radii4/6 to agree within0.2%, matching paper palette, exterior gutters/ink/page-edge witnesses, compact proven shapes and zero previous source overlap. A uniquely touching leading fragment may join a trailing group only with independently matching source maps, measured contact and an ink-supported frontier lacking an exterior gutter. Proof56 stays distinct. Earlier source descriptors and accepted originals remain intact. Reader repairs retain their previous evaluation context; foreign additions yield to newly proven source cells. Enclosed ink/lettered speech bodies at least97% inside a unique new cell move as whole bodies. No title/page/book/text/image/fingerprint lookup; no private source artwork in git/CI.

Count each complete original once, including originals inside groups. Fragments/duplicates earn zero. Group usability remains separate. Cadence is ten originals per session. Accepted227 retained. Isolated Test_Branch publication/APK authorization persists.

Local validation:120 behavioral suites plus cache/package/syntax passed. Final recovery and Reader comparison on312 original source rasters retain all1300 earlier source descriptors and1297 earlier displayed masks. Exactly3 earlier displays lose only foreign fragments,with all pixels outside the proven new source/enclosed speech preserved. Four new Apocalypse selections yield1304; Wolverine,Magneto and all three manga chapters retain their masks. Four changed pages reproduce discovery through fresh full detector replay. Nine native selections are reachable;two earlier canvases byte-identical,three foreign-fragment corrections,zero new displayed overlap. Source-independent frontier/speech positives and malformed/ambiguous/partial/unenclosed/unlettered negatives pass. No full-corpus rerun of the older underlying detector is claimed. Published source 16bdde1c5d537d5bd09c819e66cd5cb3593bbfb8 matches tested tree 3b7dd8cad5a4c29be6db799a6b05d8c73cf1e37a. Android run37510051452 succeeded: https://github.com/bdredenbach/Nth-Shelf/actions/runs/37510051452. CI120 suites,cache/package/syntax,browser/backup,native streaming archive and frozen web/signature/identity checks passed. Artifact ID:11435337539.

Remaining queue: issue1 Reader3 eye/cartouche and detached caption; issue1 Reader7 upper eye/sword strip; issue1 Reader13 narrow attacker portrait; issue2 Reader10 tall Nephri silhouette; issue1 Reader18 right dialogue strip and clipped En portrait; issue4 Reader18 S3 foreground ownership. Continue with one bounded reusable recovery rule and ten complete originals per session. Phone timing and Android chat-stall duration are unmeasured locally.

Source archives: Apocalypse libfile_06c168de85c08191ba461ab9ef2cdba5; Wolverine libfile_df4e3f2e95488191a8684aac7b8ff80e; Magneto libfile_11da0f85d7148191b1bef1abe6fe482d; manga libfile_be583424a66c8191bc6a8be6c6978420,libfile_a1089428d0d4819193de79fc4bd7f8bb,libfile_c87d71d1abf48191b87e46bafaa84c7f. Full Test95 audit libfile_d4c4ca46cd08819192cd7f9617d6f115; notes libfile_58fed3b235688191ac7e4fec84517824.

Scratch checkpoint:/workspace/scratch/1dea0fea137c/Nth-Shelf-Test109;checks:/workspace/scratch/1dea0fea137c/test109;fixtures:/workspace/scratch/35acfbe72dfc/fixtures. Scratch can disappear; restore source archives and published repository. Read docs/evidence/validation/TEST109-VALIDATION.json for actual checks,source identities and saved-file IDs.

APK: Nth-Shelf-2.79.109-Test109.apk, 3511065 bytes. SHA-256:c4e2bf04a6f9b4d17905e1a35aed41bc52aa6b7af3ac04ecafafd1476714ab6b. Downloaded checksum,compiled isolated identity(io.github.bdredenbach.nthshelf.frametest109,version code28037),actual v2 signer certificate/CI record and all108 frozen web assets match tested source. Test109 phone confirmation pending; phone timing unmeasured.


</details>

<a id="archive-handoff-2-79-110-md"></a>

<details>
<summary>HANDOFF-2.79.110.md — historical checkpoint</summary>

# Test110 / 2.79.110 — nine additional original-frame credits

6 October 2026. Repository bdredenbach/Nth-Shelf, branch Test_Branch.

Recovered Test109 from git after the prior chat timed out. Test109 local237/384 is retained, but its phone acceptance remains pending; the last explicit phone-confirmed baseline is Test108227/384. Test110 reaches **246/384 locally,138 remaining** through eight newly recovered originals and one audit correction.209 selections,196 credited groups; issue totals61/99,66/97,78/109,41/79. Test110 phone acceptance and phone timing pending.

Install separate **Nth Shelf Test110**. Reader page numbers include covers:
- Issue2 Reader22 S2: tall Logos, upper En anger, middle En threatening Logos, narrow metallic-profile conversation:four complete originals.
- Issue3 Reader10 S2: tall Pharaoh/weapon scene and upper-right Fantastic Four:two originals. Verify entire MANKIND balloon.
- Issue3 Reader10 S3: narrow weapon-blast/SFX strip and lower Pharaoh/Thing action:two originals.
- Issue4 Reader18 S3:one audit correction. Full source/native Reader comparison finds all owned lower foreground, clothing and text already present in Test109. It is byte-identical, not a new pixel repair. A foreign explosion fragment is worth zero. Phone confirmation is requested for this reassessment.

The new proof57 route requires a neutral colored edge palette, independently eroded4/6 maps agreeing within0.2%, a bounded broad source contour, four-sided measured exterior gutter/ink/page-edge closure, zero earlier source overlap and all earlier proof contexts preserved. Rejection-only quantized edge preflight avoids inappropriate palettes. Internal scene boundaries remain visible. Almost wholly enclosed lettered speech bodies use the retained whole-body policy. No title/page/text/book/fingerprint lookup or source artwork in git/CI. Earlier original artwork remains intact.

Brad now requests **nine complete originals per run**, superseding ten. Count each complete unique original once, including originals in groups; duplicates/fragments add zero. Group usability is separate. Publication and isolated Test_Branch APK authorization persist.

Local validation:122 behavioral suites plus cache/package/syntax passed. Final recovery and Reader comparisons on312 original rasters retain all1304 earlier source descriptors and displayed masks. Exactly3 new Apocalypse selections yield1307; Wolverine, Magneto and all three manga chapters retain their masks. Both changed pages reproduce discovery through fresh full detector replay. Nine native canvases are reachable; six earlier crops byte-identical,zero new displayed overlap. Issue4 Reader18 S3 audit credit has no runtime change. No full-corpus rerun of the older underlying detector is claimed. Published source643fe6b220d20629a2f19a8c81dd0a5ba5d2a088 matches tested tree3bc5a4bcbe3f76b6ca0755caa4647ce798367b49. Android run37517552313 succeeded: https://github.com/bdredenbach/Nth-Shelf/actions/runs/37517552313. CI122 suites,cache/package/syntax,browser/backup,native streaming archive and frozen web/signature/identity checks passed. Artifact11437523404. Downloaded isolated APK identity,v2 signer/CI certificate record,checksum and all109 frozen web files match tested source.

Remaining queue: issue1 Reader3 eye/cartouche and detached caption; issue1 Reader7 upper eye/sword strip; issue1 Reader13 narrow attacker portrait; issue2 Reader10 tall Nephri silhouette; issue1 Reader18 right dialogue strip and clipped En portrait. Issue4 Reader18 S3 is removed from the incomplete queue only as the explicit local audit correction above, subject to phone review.

Source archives:Apocalypse libfile_06c168de85c08191ba461ab9ef2cdba5;Wolverine libfile_df4e3f2e95488191a8684aac7b8ff80e;Magneto libfile_11da0f85d7148191b1bef1abe6fe482d;manga libfile_be583424a66c8191bc6a8be6c6978420,libfile_a1089428d0d4819193de79fc4bd7f8bb,libfile_c87d71d1abf48191b87e46bafaa84c7f. Test95 audit libfile_d4c4ca46cd08819192cd7f9617d6f115;notes libfile_58fed3b235688191ac7e4fec84517824.

Scratch:/workspace/scratch/e3d5bbf239b9/Nth-Shelf-Test110;checks:/workspace/scratch/e3d5bbf239b9/test110;fixtures:/workspace/scratch/35acfbe72dfc/fixtures. Scratch may disappear; restore source archives and published repository. Read docs/evidence/validation/TEST110-VALIDATION.json for actual checks and saved-file identifiers. Chat timeout is client-observed; phone timing remains unmeasured locally.


APK:Nth-Shelf-2.79.110-Test110.apk,3516326bytes. SHA-256:296f6d02dff59bb08e237fb16014943f5fbad0011e6f5fec786e12805c477ff5. Compiled io.github.bdredenbach.nthshelf.frametest110,versionCode28038; actual v2 signer matches the CI record. Test109/Test110 phone acceptance pending; phone timing and client chat timeout unmeasured locally.


</details>

<a id="archive-handoff-2-79-111-md"></a>

<details>
<summary>HANDOFF-2.79.111.md — historical checkpoint</summary>

# Test111 / 2.79.111 — nine complete original recoveries

6 October 2026. bdredenbach/Nth-Shelf, Test_Branch. Start from Brad's 246/384 continuation count. Test111 reaches **255/384 locally, 129 remaining**. Phone Test111 confirmation and phone timing pending.

Install the separate **Nth Shelf Test111**. Reader pages include covers:
- Issue1 Reader3 S2: eye/cartouche, curled lower ornament, all three captions (+1).
- Issue1 Reader24 S1: full Baal/Logos scene (+1).
- Issue2 Reader18 S3 and S4: cave silhouette dialogue and scarab/hand scene (+2).
- Issue2 Reader21 S1: full Logos portrait and dialogue (+1).
- Issue3 Reader5 S6: full horizontal Osiris/fallen scene and yellow captions (+1).
- Issue3 Reader5 S7: full narrow Nur portrait (+1). Adjacent goddess upper head/halo remains clipped and receives zero. Group remains partly incomplete.
- Issue4 Reader8 S1: full narrow Nur portrait (+1).
- Issue4 Reader12 S3: full transformation scene (+1).

New generic proof58 compact dark enclosures and proof59 short paper enclosures use independently eroded source maps, measured exterior/ink/page-edge closure, bounded shapes and zero earlier source overlap. A uniquely touching narrow ornament above a measured broad scene ledge is reassigned in Reader; independently enclosed, lettered gray caption bodies must agree at two thresholds and belong uniquely next to the source. Display bounds expand for the proven annex. This repairs the eye without counting a neighboring fragment. No title/page/text/book/fingerprint runtime lookup or comic artwork in git/CI.

220 Apocalypse selections: eleven added selections, but only nine complete original credits. Two incidental cover fragments add zero; the partly incomplete goddess group contributes only the separate intact Nur original. The generic route also adds one Wolverine selection outside the Apocalypse count. Denominator stays384. Issue totals63/99,69/97,80/109,43/79. Complete original counts and group usability remain separate.

Remaining queue: issue1 Reader7 eye/sword strip; Reader13 narrow attacker portrait; issue2 Reader10 tall Nephri silhouette; issue1 Reader18 right dialogue strip and clipped En; issue3 Reader5 goddess head/halo.

Source archives: Apocalypse libfile_06c168de85c08191ba461ab9ef2cdba5; Wolverine libfile_df4e3f2e95488191a8684aac7b8ff80e; Magneto libfile_11da0f85d7148191b1bef1abe6fe482d; manga libfile_be583424a66c8191bc6a8be6c6978420, libfile_a1089428d0d4819193de79fc4bd7f8bb, libfile_c87d71d1abf48191b87e46bafaa84c7f.

Scratch: /workspace/scratch/65750880f9b9/Nth-Shelf-Test111; checks /workspace/scratch/65750880f9b9/test111; original fixtures /workspace/scratch/35acfbe72dfc/fixtures. Restore from published repository and archives if scratch disappears. Read docs/evidence/validation/TEST111-VALIDATION.json for actual checks and build/source IDs. Nine-original cadence and isolated Test_Branch publication/APK authorization persist. Phone acceptance and timing remain device-only; client chat timeout is not locally measured.

Validation complete:124 behavioral suites and cache/package/syntax passed locally.312 final source/Reader comparisons pass; all1307 prior descriptors retained,1319 total selections (11 Apocalypse additions, one Wolverine addition).19 native canvases reachable;7/10 earlier canvases byte-identical,three remove only reviewed foreign pieces;zero new displayed overlap. Seven changed-page full detector replays pass. Published source30adc110e6efe4506fab7156f6fd1e332dc1bf6d matches runtime tree09e45c15877ecf800ee7b28a28baf3d527575445. Android run37522692617 succeeded: https://github.com/bdredenbach/Nth-Shelf/actions/runs/37522692617. Artifact11441144500. CI124 retained suites, browser interactions/backup round trip and native streaming archive checks passed. Downloaded APK checksum, compiled identity, actual v2 signer certificate against the CI signature record and all111 frozen web files verified. APK SHA-256 cecfe2389183a916716e4c397fb6279772d573f88a0261e23671d74f7f6c0284. Isolated applicationId io.github.bdredenbach.nthshelf.frametest111, version2.79.111, code28039, label Nth Shelf Test111. Use the illustrated frame review/current handoff for targets; the original CI artifact INSTALL.txt retained earlier Test110 instructions. Phone acceptance and timing pending.


</details>

<a id="archive-handoff-2-79-112-md"></a>

<details>
<summary>HANDOFF-2.79.112.md — historical checkpoint</summary>

# Test112 / 2.79.112 — nine complete original recoveries

6 October 2026. bdredenbach/Nth-Shelf, Test_Branch. Brad phone-confirmed Test111 at **255/384, 129 remaining**. Test112 locally reaches **264/384, 120 remaining**. Test112 phone confirmation and phone timing pending.

Install the separate **Nth Shelf Test112**. Reader page numbers include covers:
- Issue2 Reader17 S2: four originals — tall inscriptions/hand, right prophecy conversation, lower-left En profile and lower-right relic scene (+4). S1 upper-left cave stays separate.
- Issue3 Reader22 S2: three originals — lower-left Pharaoh/cavern offer including the full DO NOT MOURN chain, narrow lower-center mouth/boot action and underlying En attacking Pharaoh with NEVER (+3). Earlier S1 keeps all its own artwork and dialogue.
- Issue3 Reader23 S4: upper-right energy hit and middle-left weapon close-up, full sound effect and speech (+2). S1/S2/S3 keep their own originals. Decorative NEXT/title fragments add zero.

Three additional selections contain nine unique complete originals, not nine new selections. Larger groups retain visible original borders; group usability remains separate. 223 Apocalypse selections. Issue totals 63/99, 73/97, 85/109, 43/79. Denominator remains 384.

New generic proof 60 gradient residual groups require agreement between independently measured smooth exterior maps, bounded broad source enclosure, measured four-sided exterior/contrast, substantial novel area, retained-source subtraction and substantial residual components. Earlier source descriptors are unchanged. Reader repairs yield only reviewed foreign pieces to new proven source; one independently enclosed lettered speech chain is assigned by the same unique short-tail terminals at two openings and exclusive tip collars. Display bounds expand for the proven speech extension. No book/page/title/text/fingerprint runtime lookup or comic artwork in git/CI.

Remaining queue: issue1 Reader7 eye/sword strip; Reader13 narrow attacker portrait; issue2 Reader10 tall Nephri silhouette; issue1 Reader18 right dialogue strip and clipped En; issue3 Reader5 goddess head/halo.

Source archives: Apocalypse libfile_06c168de85c08191ba461ab9ef2cdba5; Wolverine libfile_df4e3f2e95488191a8684aac7b8ff80e; Magneto libfile_11da0f85d7148191b1bef1abe6fe482d; manga libfile_be583424a66c8191bc6a8be6c6978420, libfile_a1089428d0d4819193de79fc4bd7f8bb, libfile_c87d71d1abf48191b87e46bafaa84c7f.

Scratch: /workspace/scratch/a7a22cc4e704/Nth-Shelf-Test112; checks /workspace/scratch/a7a22cc4e704/test112; original fixtures /workspace/scratch/35acfbe72dfc/fixtures. Restore from published repository and archives if scratch disappears. Read docs/evidence/validation/TEST112-VALIDATION.json for actual completed checks and build/source IDs. Nine-original cadence and isolated Test_Branch publication/APK authorization persist. Phone acceptance and timing remain device-only.

Validation completed: all 127 retained behavioral suites, cache/package/syntax checks, all 312 original-raster source and Reader comparisons, three full changed-page detector replays and all eight native target crops pass. All 1,319 earlier source descriptors are unchanged. The five control books retain identical source selections and Reader displays. Exactly three Apocalypse groups add nine unique complete originals; three earlier crops lose only reviewed foreign pieces/speech, with their own artwork preserved outside these corrections. Zero new displayed overlap.

Published APK source: 246e7957618afee7203df292ef917e0383caf29a; tree 32e51ccd1704db802df9a9d37f609c90aef800d3 on Test_Branch. Android run 37528757317 passed retained, browser interaction/backup, native archive, signature and packaging checks. Downloaded APK verified: 3535304 bytes; SHA-256 eb33dacf108495dde6d6eb5f989be0effaa78040d666a2d0753a619912fa08b7; compiled identity Nth Shelf Test112 / 2.79.112 / versionCode 28040 / io.github.bdredenbach.nthshelf.frametest112. All 112 web files match the tested source byte for byte. CI APK v2 signer certificate matches the downloaded APK.

Count only the nine reviewed originals. Test112 phone acceptance, group usability and phone timing remain pending; do not claim 264/384 as phone-confirmed until Brad confirms. Test111 remains the phone-confirmed 255/384 baseline.

Update 6 October 2026: Brad confirmed Test112 at264/384,120 remaining in the Test113 continuation. Phone timing is still unmeasured. Continue with HANDOFF-2.79.113.md.


</details>

<a id="archive-handoff-2-79-113-md"></a>

<details>
<summary>HANDOFF-2.79.113.md — historical checkpoint</summary>

# Test113 / 2.79.113 — nine complete original recoveries

6 October 2026. bdredenbach/Nth-Shelf, Test_Branch. Brad phone-confirmed Test112 at **264/384, 120 remaining**. Test113 locally reaches **273/384, 111 remaining**. Test113 phone acceptance and timing pending.

Install the separate **Nth Shelf Test113**. Reader page numbers include covers:
- Issue3 Reader8 S1: five originals — three upper Pharaoh face/hands/throne scenes, the full Fantastic Four court arrival and the bottom Logos portrait (+5).
- Issue4 Reader11 S1: four originals — upper-left En among bodies, upper-right fallen Logos, tall lower-left En thoughts and the full lower attack scene (+4). Both lower speech balloons, blades, hands, motion marks, blood and protruding foreground skull survive.

Two new large selections contain nine unique complete originals. These are broad page-spanning groups retaining all original internal borders and white gutters. Individual segmentation and group usability remain separate. 225 Apocalypse selections. Issue totals 63/99, 73/97, 90/109, 47/79. Denominator remains 384. Decorative lettering and printed page numbers add zero.

Generic proof61 applies only with no earlier proven selections. Independently measured smooth exterior maps must agree on one dense broad source enclosure, with four-sided measured exterior and contrast. A bounded collar includes peripheral ink islands; a source-derived group envelope preserves internal white speech and protrusions. No book/page/title/text/fingerprint runtime lookup or comic artwork in git/CI. Earlier descriptors and Reader behavior are retained.

Remaining queue: issue1 Reader7 eye/sword strip; Reader13 narrow attacker portrait; issue2 Reader10 tall Nephri silhouette; issue1 Reader18 right dialogue strip and clipped En; issue3 Reader5 goddess head/halo.

Source archives: Apocalypse libfile_06c168de85c08191ba461ab9ef2cdba5; Wolverine libfile_df4e3f2e95488191a8684aac7b8ff80e; Magneto libfile_11da0f85d7148191b1bef1abe6fe482d; manga libfile_be583424a66c8191bc6a8be6c6978420, libfile_a1089428d0d4819193de79fc4bd7f8bb, libfile_c87d71d1abf48191b87e46bafaa84c7f.

Scratch: /workspace/scratch/bb3a92796614/Nth-Shelf-Test113; checks /workspace/scratch/bb3a92796614/test113; original fixtures /workspace/scratch/35acfbe72dfc/fixtures. Restore from published repository and archives if scratch disappears. Read docs/evidence/validation/TEST113-VALIDATION.json for actual completed checks and build/source IDs. Nine-original cadence and isolated Test_Branch publication/APK authorization persist. Phone acceptance and timing remain device-only.

Count only the nine reviewed originals. Do not claim Test113 as phone-confirmed until Brad confirms. Test112 remains the phone-confirmed 264/384 baseline.

Validation completed: all129 retained behavioral suites and cache/package/syntax checks pass. All312 original-raster supplementary source and Reader comparisons pass. All1,322 earlier source descriptors and Reader masks are unchanged. Five control books retain identical selections/displays. Exactly2 new Apocalypse groups contain nine reviewed originals; two full changed-page detector replays and both native crops pass. Both crops match their source envelope rendered at the Reader size;98 tap hits and repeated overlay construction pass. Zero new displayed overlap.

Published APK source: 7e56c9afe52f475d18a01444e3ae84087322b330; tree 34e2b14c5fad19afc3170d923041f9d57c91cca6 on Test_Branch. Android run 37533421774 passed retained, browser interaction/backup, native archive, signature and packaging checks. Downloaded APK verified: 3539199 bytes; SHA-256 99fdd2b3da73999c875970c45a904c7973108dc978aa7727bf8bfa776babd990; compiled identity Nth Shelf Test113 / 2.79.113 / versionCode28041 / io.github.bdredenbach.nthshelf.frametest113. All113 packaged web files match the tested source byte for byte. Actual APK v2 signer certificate matches the CI signature record. Test113 phone acceptance, group usability and timing remain pending.


</details>

<a id="archive-handoff-2-79-114-md"></a>

<details>
<summary>HANDOFF-2.79.114.md — historical checkpoint</summary>

# Test114 / 2.79.114 — nine complete original recoveries

6 October 2026. bdredenbach/Nth-Shelf, Test_Branch only. Working Test113 baseline273/384. Brad asked to continue another9 in the same chat; the last explicit numeric phone report was Test112 at264/384. Test114 locally reaches **282/384,102 remaining**. Test114 phone acceptance, group usability and timing remain pending.

Install the separate **Nth Shelf Test114**. Reader page numbers include covers:
- Issue2 Reader9 S2: +4 — upper-left arrival, upper-middle Pharaoh, upper-right confrontation and lower-right Nephri. The lower-left dialogue original was already complete and counts zero.
- Issue4 Reader7 S1: +4 — three upper serpent frames and full lower escape/attack scene.
- Issue4 Reader19 S3: +1 — existing bottom farewell frame now retains all left and linked right speech balloons.

Two new broad page-spanning groups contain eight new complete originals; the Reader-only speech completion contributes one more. Duplicate originals count zero. Groups retain internal borders and gutters. Individual segmentation and group usability remain separate. 227 Apocalypse selections. Issue totals63/99,77/97,90/109,52/79. Denominator384.

Generic proof62 requires independently stable gradient exterior maps, four measured color-channel boundaries, one dense dominant enclosure and at least70% unowned source content. It only supplements sparse maps of zero or one retained owner. A bounded source-island collar completes the group envelope. Existing selections inside a new group retain their earlier display and tap priority. Such overlap is intentional; do not claim exclusive source ownership. No book/page/title/text/fingerprint lookup. No comic artwork in git or CI.

Reader-only short-row speech requires two independent paper thresholds, two agreeing short-tail openings, unique proven split-row ownership, enclosing ink and lettering checks. Only the enclosed speech bodies move. Source descriptors and artwork remain intact. Recovered contour bounds expand the actual canvas so speech above the old box survives.

Remaining queue: issue1 Reader7 eye/sword strip; Reader13 narrow attacker portrait; issue2 Reader10 tall Nephri silhouette; issue1 Reader18 right dialogue strip and clipped En; issue3 Reader5 goddess head/halo.

Source archives: Apocalypse libfile_06c168de85c08191ba461ab9ef2cdba5; Wolverine libfile_df4e3f2e95488191a8684aac7b8ff80e; Magneto libfile_11da0f85d7148191b1bef1abe6fe482d; manga libfile_be583424a66c8191bc6a8be6c6978420, libfile_a1089428d0d4819193de79fc4bd7f8bb, libfile_c87d71d1abf48191b87e46bafaa84c7f.

Scratch repository /workspace/scratch/bb3a92796614/Nth-Shelf-Test114; checks /workspace/scratch/bb3a92796614/test114; original fixtures /workspace/scratch/35acfbe72dfc/fixtures. Restore from published repo and source archives if scratch disappears. Read docs/evidence/validation/TEST114-VALIDATION.json for completed validation and source/build IDs. Nine-original cadence and isolated Test_Branch publication/APK authorization persist. Do not infer numeric phone confirmation from an enthusiastic continuation alone.

Validation completed: all132 retained behavioral suites and cache/package/syntax checks pass. All312 original-raster supplementary source and old-versus-new Reader comparisons pass. All1,324 earlier source descriptors stay identical. Five control books retain identical selections and display masks. Only issue4 Reader19 S2/S3 display masks change, exclusively inside two independently enclosed bottom-row speech bodies (443 pixels removed from S2;9,735 restored to S3). Two new broad groups are intentionally nonexclusive; earlier tap priority remains. Three full changed-page detector runs and three native canvases pass; two group crops match the original source envelope byte-for-byte. New Reader contract verifies47 retained taps,93 new group taps and six repeated overlays.

Verified Android build: run37537670156, job112522699452, success. Source commit af2ea6b7089eb600a569a1662e3ab94c5b8d2ec5, source tree419e4db572956615513ad102dbd28e5d5f035655. Artifact11447102572; ZIP SHA2566f14f0e4942e89b58c6dac9bad0e18099d52cd5a9fcdbd39d10429699a862300 verified. APK3,546,651 bytes; SHA2561caec8db0500344cd0dcc622410fb5dc4bb134ac77e6b74d613e4f6f5d11067e. Actual compiled identity io.github.bdredenbach.nthshelf.frametest114 /2.79.114 /28042 /Nth Shelf Test114. Actual APK v2 signer certificate SHA2566b191af9ccf95a875860c23f6996d096ffa64286bbc7c121fdcd0d6bc76ec35b matches the CI signature record. All115 packaged web files match frozen tested bytes. CI132 retained checks, browser/backup round-trip, native archive, Android build and signature/package verification all pass. Phone acceptance, grouping usability and timing remain pending.

Saved deliverables: APK libfile_e8913bbdcf5881918279ff88a8e41d9d; review libfile_484c6f3cc56481918980cc404d6b7aab; handoff libfile_0ab58fa0ef008191aa8fd2fbb1cfced9. The final repository update is metadata-only; the verified APK source remains af2ea6b7089eb600a569a1662e3ab94c5b8d2ec5.


</details>

<a id="archive-handoff-2-79-115-md"></a>

<details>
<summary>HANDOFF-2.79.115.md — historical checkpoint</summary>

# Test115 / 2.79.115 — nine complete original recoveries

6 October 2026. bdredenbach/Nth-Shelf, Test_Branch only. Brad supplied the Test114 numeric baseline **282/384,102 remaining**. Test115 reaches **291/384 locally,93 remaining**. Test115 phone acceptance, group usability and timing remain pending.

Install the separate **Nth Shelf Test115**. Reader page numbers include covers:
- Issue2 Reader6 S1: +3 — main cave conversation, tall right En profile and lower cave departure, all balloons intact.
- Issue2 Reader11 S1: +4 — main descent/pointing scene, upper cave inset, throwing/KRAKK strip and lower machine chamber, all artwork and text intact.
- Issue3 Reader11 S6: +2 — upper court and middle-left Pharaoh/Sue conversation, with the complete shared opening balloon chain and QUEEN balloon. The neighboring two middle-row Logos originals are context and duplicates worth zero. Reach S6 by tapping the left opening speech balloon crossing the first two rows; a sampled successful tap is at normalized source (0.14551,0.27833). Earlier individual tap priority is retained.

Three new groups; all earlier selections keep their original source, display and tap priority. Groups retain original internal borders and gutters. Overlap is intentional; do not claim exclusive ownership. Individual segmentation and group usability remain separate from frame coverage. 230 Apocalypse selections. Issue totals63/99,84/97,92/109,52/79. Denominator384.

Generic proof63 supplements empty maps only: independently stable gradient exterior maps at12/14, a dense dominant enclosure, two independently measured color-channel boundaries at25/18 and aggregate perimeter evidence. A bounded source-island collar completes the group envelope. Proof64 requires a proven wide paper row over three proven columns, two stable independently enclosed lettered paper bodies at190/210, agreeing short tails at5/6, unique column terminals, shared row/column crossings and substantial missing speech. The measured rectangular group envelope keeps all source interiors and gutters opaque. Earlier individual displays stay unchanged. No book/page/title/text/fingerprint lookup; no comic artwork in git/CI.

Remaining queue: issue1 Reader7 eye/sword strip; Reader13 narrow attacker portrait; issue2 Reader10 tall Nephri silhouette; issue1 Reader18 right dialogue strip and clipped En; issue3 Reader5 goddess head/halo.

Source archives: Apocalypse libfile_06c168de85c08191ba461ab9ef2cdba5; Wolverine libfile_df4e3f2e95488191a8684aac7b8ff80e; Magneto libfile_11da0f85d7148191b1bef1abe6fe482d; manga libfile_be583424a66c8191bc6a8be6c6978420, libfile_a1089428d0d4819193de79fc4bd7f8bb, libfile_c87d71d1abf48191b87e46bafaa84c7f.

Scratch repository /workspace/scratch/37406b7d348a/Nth-Shelf-Test115; checks /workspace/scratch/37406b7d348a/test115; original fixtures /workspace/scratch/37406b7d348a/fixtures. Restore from published repo and source archives if scratch disappears. Read docs/evidence/validation/TEST115-VALIDATION.json for actual completed checks and source/build identities. Nine-original cadence and isolated Test_Branch publication/APK authorization persist. Numeric Test114 confirmation does not measure grouping usability or timing.

Local validation complete: all134 retained behavioral suites and cache/package/syntax checks pass. All312 original-raster source comparisons and old-versus-new Reader comparisons pass. All1,326 earlier source descriptors and every earlier Reader display mask stay identical. Five control books retain identical selections and displays. Exactly three new Apocalypse groups add nine unique complete originals. Three full changed-page detector replays and three native group canvases pass; all three group crops match their original source envelope byte-for-byte. All five earlier native canvases on the dialogue page are byte-identical. Reader contract retains243 earlier taps, proves3,153 new group taps and six repeated overlays. Android build and downloaded APK verification pass.

Verified Android build: run37553911213, job112575577361, success. Source commit109ce5fd3cefd23f2feb868400db16f0f152503b, source treeb98044e11baf2f4da42ca57d26fd1eca659139b7. Artifact11454367348; ZIP SHA2569abd572f1e079dc5f5386e6c1109de3455cfc11896706af3e73c201ef20501d7 verified. APK3,556,401 bytes; SHA25669ffbf1ceedf1f244f7a9218ec654eb4da08b00eb45c950f99ebcd28149df6f4. Actual compiled identity io.github.bdredenbach.nthshelf.frametest115 /2.79.115 /28043 /Nth Shelf Test115. Actual APK v2 signer certificate SHA256887758e0c9af733a8ec5673dc625376ce6d011d9072675af0e78deaa4c3e28f1 matches the CI signature record. All117 packaged web files match frozen tested bytes. CI134 retained checks, browser/backup round-trip, native archive, Android build and signature/package verification pass. Phone acceptance, grouping usability and timing remain pending.


</details>

<a id="archive-handoff-2-79-116-md"></a>

<details>
<summary>HANDOFF-2.79.116.md — historical checkpoint</summary>

# Test116 / 2.79.116 — nine complete original recoveries

7 October 2026. bdredenbach/Nth-Shelf, Test_Branch only. Continue from Test115's locally validated291/384; separate numeric Test115 phone confirmation was not supplied. Test116 reaches300/384 locally,84 remaining. Phone acceptance, group usability and timing remain pending.

Install separate Nth Shelf Test116. Reader page numbers include covers:
- Issue1 Reader12 S3: +3 — WHUFF impact, tall SHAKK strike and FIRST BLOOD strip. Two earlier complete originals are context and add zero.
- Issue2 Reader10 S4: +1 — tall Nephri figure, complete trailing dress and MY LORD balloon. Four earlier complete right-side originals are duplicates and add zero. Reach S4 by tapping the small MY LORD balloon at upper left; normalized source(0.10,0.066) was verified with the real Reader.
- Issue3 Reader19 S1: +5 — tall left conversation, eye strip, lower-left kneeling scene, lower-middle Logos conversation and tall right Pharaoh figure. Sphinx/halo decoration adds zero.

Three source-envelope groups retain all interior art, lettering and original gutters. All earlier source descriptors, display masks and tap priority must remain unchanged. Groups overlap earlier selections intentionally. Individual segmentation, grouping usability and timing are separate from original-frame coverage.233 Apocalypse selections. Issue totals66/99,85/97,97/109,52/79.384 denominator.

Generic proof65 uses independent gradient exterior maps at12/14, a stable broad dominant enclosure, measured color-channel boundaries at25/18 with side and aggregate evidence, bounded peripheral source islands and full opaque envelope interiors. Three geometry-based modes: a sparse empty map; a dense substantial unowned remainder with2–4 proven owners; or three proven wide paper rows spanning the page whose fragment crops need a complete shared continuation. Proof recomputation retains exclusions, overlap, mode, masks, boundary counts and source content evidence. Reader uses the original prior owner list for prior displays and gives the new group its full measured contour. No book/page/title/text/fingerprint lookup; no comic artwork in git/CI.

Remaining queue: issue1 Reader7 eye/sword strip; Reader13 narrow attacker portrait; Reader18 right dialogue strip and clipped En; issue3 Reader5 goddess head/halo. Do not double-count earlier originals.

Source archives: Apocalypse libfile_06c168de85c08191ba461ab9ef2cdba5; Wolverine libfile_df4e3f2e95488191a8684aac7b8ff80e; Magneto libfile_11da0f85d7148191b1bef1abe6fe482d; manga libfile_be583424a66c8191bc6a8be6c6978420, libfile_a1089428d0d4819193de79fc4bd7f8bb, libfile_c87d71d1abf48191b87e46bafaa84c7f.

Scratch repository /workspace/scratch/37406b7d348a/Nth-Shelf-Test116; checks /workspace/scratch/37406b7d348a/test116; original fixtures /workspace/scratch/37406b7d348a/fixtures. Restore from published repository and authorized archives if scratch disappears. Read docs/evidence/validation/TEST116-VALIDATION.json for actual completed checks and build identities. Nine-original cadence and isolated Test_Branch publication/APK authorization persist. Test115 had local291/384; do not claim numeric phone acceptance from a continuation request.

Local validation complete: all136 retained behavioral suites and cache/package/syntax checks pass. All312 source comparisons and complete old-versus-new Reader comparisons pass. All1,329 earlier source descriptors and every earlier Reader display mask remain unchanged. Five control books retain identical selections and displays. Exactly three new Apocalypse groups add nine unique complete originals. Three full changed-page detector replays pass. All three native group canvases match their exact original source envelopes byte-for-byte; all five earlier native canvases are byte-identical. Reader contract retains237 earlier taps, proves2,812 new group taps and six repeated overlays. Android build and downloaded APK verification pass.

Verified Android build: run37557025451, job112585497277, success. Source commit4c091e45c1e40f43a69805ddb4c5ae0bd6441efc, source treeac05b7902f522eae7001992fc5e005beff570b84. Artifact11455533890; ZIP SHA2565429c8648b61ed99c12a16fcf063748ef14a912334a66b6d04ab038decc78190 verified. APK3,561,635 bytes; SHA2563e6ef43e8fb344ad439689fade6caa1e4fbe4c89d360fa94d36422a48fd6d959. Actual compiled identity io.github.bdredenbach.nthshelf.frametest116 /2.79.116 /28044 /Nth Shelf Test116. Actual APK v2 signer certificate SHA2566f2cc6755663b6b74db6a7cf54ae59754caa2daeb43d3d5dc4deed4a6c53fb11 matches the CI signature record. All118 packaged web files match frozen tested bytes. CI136 retained checks, browser/backup round-trip, native archive, Android build and signature/package verification pass. Phone acceptance, grouping usability and timing remain pending.


</details>

<a id="archive-handoff-2-79-117-md"></a>

<details>
<summary>HANDOFF-2.79.117.md — historical checkpoint</summary>

# Test117 / 2.79.117 — nine complete original recoveries

7 October 2026. bdredenbach/Nth-Shelf, Test_Branch only. Continue from Test116’s locally validated 300/384; numeric phone acceptance was not supplied. Test117 reaches 309/384 locally, 75 remaining. Phone acceptance, group usability and timing remain pending.

Install separate Nth Shelf Test117. Reader page numbers include covers:
- Issue 1 Reader 15 S1: +3 — broad camp/Pharaoh conversation and two narrow right-side portraits/conversation views. Complete balloons, lower figures and source edges.
- Issue 2 Reader 5 S1: +6 — three upper cave/hand views, central cave scene, tall En silhouette, lower Baal/Son/No scene. Complete yellow caption chain, balloons and protruding fingers.

Two new empty-page source-envelope groups retain all interior art, lettering and original gutters. No prior source descriptor, display mask or tap priority changes are authorized. Every unique complete original counts once; clipped originals, duplicates, decorations, covers and credits add zero. Individual segmentation, grouping usability and timing remain separate from frame coverage. 235 Apocalypse selections. Issue totals 69/99, 91/97, 97/109, 52/79; denominator 384.

Generic proof66: independently recomputed 14/16 gradient exterior maps, one dense broad stable enclosure, measured color-channel boundaries at25/18 with per-side and aggregate support, bounded peripheral source islands and full opaque envelope interiors. Requires no prior selection; existing maps stay unchanged. Proof recomputation retains maps, masks, boundary sample counts, content evidence and novelty. Reader uses the full measured group contour; edge spill and geometry refinement recognize the proof. No book/page/title/text/fingerprint lookup; no comic artwork in git/CI.

Remaining queue: issue1 Reader7 eye/sword strip; Reader13 narrow attacker portrait; Reader18 right dialogue strip and clipped En; issue3 Reader5 goddess head/halo. Other remaining Test116 audit pages remain queued, excluding the two new Test117 pages. Do not double-count earlier originals.

Source archives: Apocalypse libfile_06c168de85c08191ba461ab9ef2cdba5; Wolverine libfile_df4e3f2e95488191a8684aac7b8ff80e; Magneto libfile_11da0f85d7148191b1bef1abe6fe482d; manga libfile_be583424a66c8191bc6a8be6c6978420, libfile_a1089428d0d4819193de79fc4bd7f8bb, libfile_c87d71d1abf48191b87e46bafaa84c7f.

Scratch repository /workspace/scratch/37406b7d348a/Nth-Shelf-Test117; checks /workspace/scratch/37406b7d348a/test117; fixtures /workspace/scratch/37406b7d348a/fixtures/images. Automated workspace maintenance removed prior scratch. Verified Test116 GitHub artifact 11455533890 restored the source; archive SHA256 5429c8648b61ed99c12a16fcf063748ef14a912334a66b6d04ab038decc78190. Baseline was freshly replayed on the restored original archives. If scratch disappears, restore from published repository/build and authorized archives. Read docs/evidence/validation/TEST117-VALIDATION.json for actual completed checks and build identities. Nine-original cadence, isolated Test_Branch publication and APK authorization persist. A continuation request does not imply numeric phone acceptance.

Local validation complete: all138 retained behavioral suites and cache/package/syntax checks pass. The restored Test116 baseline was fully replayed on312 original rasters, producing1,332 retained descriptors. All312 supplementary source comparisons and complete old-versus-new Reader display comparisons pass. Every earlier source descriptor and display remains unchanged; all five control books retain identical selections/displays. Exactly two new Apocalypse groups add nine unique complete originals. Full changed-page detector replays pass. Both native group canvases match equivalent original source-envelope renders byte-for-byte; four repeated overlays and3,042 new group taps pass. Android build and downloaded APK verification pass.

Verified Android build: run37627973794, job112814578665, success. Source commit1c58b18823435ff2e7661de7c99d26bfae8477e4, source tree7aecafabab42913e8c5826fa25a94d29b96b8641. Artifact11484519973; archive SHA25671d688e58126ea4170a17095b1c94df897ee9bdee6630a1cdff92ed4393df974 verified. APK3,566,509 bytes; SHA256aad7a97946f702db8a88faf391e46f1a50bc6af2f73d9d369c45be4fea2bc30c. Actual compiled identity io.github.bdredenbach.nthshelf.frametest117 /2.79.117 /28045 /Nth Shelf Test117. Actual APK v2 signer certificate SHA25657dcbba33fc37a50d14a3c1357b13216f07ed43da0c85507252374b19c758a87 matches the CI signature record. All119 packaged web files match frozen tested bytes. CI138 retained checks, browser/backup round-trip, native archive, Android build and signature/package verification pass. Phone acceptance, grouping usability and timing pending.

Continuation checkpoint: Nth-Shelf-Test117-Replay-Checkpoint.zip contains all six final Test117 descriptor maps (312 pages /1,334 selections), comparison summaries and the frozen119-file web manifest. It contains no comic artwork and is an offline regression baseline only, never a runtime page/identity lookup. Resolve this exact filename in Library, materialize and verify checkpoint.json hashes and tested source/asset identity before reuse. Restore source from Test117 artifact11484519973 and the six authorized original archives. Reuse these final descriptors as the baseline for Test118 source/Reader comparisons; a full rebaseline is unnecessary when every checkpoint and runtime hash matches. Independently replay all new changed pages and retained contracts.


</details>

<a id="archive-handoff-2-79-118-md"></a>

<details>
<summary>HANDOFF-2.79.118.md — historical checkpoint</summary>

# Test118 /2.79.118 — nine complete original recoveries

7 October2026. bdredenbach/Nth-Shelf, Test_Branch only. Continue from Test117 local309/384. Test118 local318/384,66 remaining. Numeric phone acceptance was not supplied; phone acceptance, group usability and timing remain pending.

Install separate Nth Shelf Test118. Reader page numbers include covers:
- Issue 1 Reader 20 S1: +5 — Upper slain-warrior reaction, narrow left standing figure, large central ambush, bottom-left En portrait and bottom-right Pharaoh carving. Complete captions, balloons and protruding figures remain. Tap any artwork on this page.
- Issue 3 Reader 6 S5: +1 — The tall left floating-En scene now retains its upper floating figure, thought balloons and complete lower dialogue chain. Four originals already counted elsewhere in this group add zero. Earlier S1–S4 keep their original displays and tap priority. Tap the pale floating figure below the upper transformation frame, in the upper part of the left column.
- Issue 3 Reader 17 S1: +3 — Tall upper-left wrapped En, upper-right distorted creature/vision and the large lower Pharaoh confrontation. Complete figures and conversation balloons remain. Tap any artwork on this page.

Three new broad source groups: two empty-page enclosures and a substantial continuation beyond four proven owners. Full source interiors retain white speech bodies and original gutters. Every unique complete original counts once; clipped originals, duplicate context, decoration, covers and credits add zero. Group usability and individual segmentation are separate from frame coverage.238 Apocalypse selections. Issue totals74/99,91/97,101/109,52/79. Denominator384.

Generic proof67 uses independent16/18 gradient exterior maps, one stable dense enclosure, measured25/18 color-channel boundaries on all four sides, bounded peripheral islands and complete opaque source-envelope interiors. Empty maps require98% novelty. A continuation requires2–4 independently proven prior owners and20–50% novel component pixels; source exclusions and overlap are measured. Serialized masks, mode, geometry, boundary sample counts, content and novelty are recomputed. Reader returns the complete new contour while earlier owners retain their prior display context and first tap priority. No book/page/title/text/hash/fingerprint lookup. No comic artwork in git/CI.

Remaining priority queue: issue1 Reader7 upper eye/sword strip; Reader13 narrow attacker portrait; Reader18 right dialogue strip and clipped En; issue3 Reader5 goddess head/halo. Other Test117 remaining pages remain queued except issue1 Reader20 and issue3 Reader6,17, now complete. Do not double-count older originals.

Source archives: Apocalypse libfile_06c168de85c08191ba461ab9ef2cdba5; Wolverine libfile_df4e3f2e95488191a8684aac7b8ff80e; Magneto libfile_11da0f85d7148191b1bef1abe6fe482d; manga libfile_be583424a66c8191bc6a8be6c6978420, libfile_a1089428d0d4819193de79fc4bd7f8bb, libfile_c87d71d1abf48191b87e46bafaa84c7f.

Scratch source /workspace/scratch/37406b7d348a/Nth-Shelf-Test118; checks /workspace/scratch/37406b7d348a/test118; originals /workspace/scratch/37406b7d348a/fixtures/images. Verified Test117 replay checkpoint hashes and all119 frozen runtime assets before reusing its312-page/1,334-selection baseline. Independently replay changed pages and retained contracts. If scratch disappears, restore source from the published Test118 artifact and originals from authorized archives; reuse the verified Test118 checkpoint. Isolated Test_Branch publication/APK authorization and nine-original cadence persist. A continuation request does not imply numeric phone acceptance. Read docs/evidence/validation/TEST118-VALIDATION.json for actual completed checks and build identity.

Local validation complete: all141 retained behavioral suites and cache/package/syntax checks pass. Verified Test117 checkpoint and119 frozen runtime files establish the312-page/1,334-descriptor golden baseline. All312 new supplementary source comparisons and native-source old-versus-new Reader display comparisons pass; all earlier descriptors and displays are unchanged, and all five control books retain identical selections/displays. Exactly three new Apocalypse groups add nine unique complete originals. Full changed-page detector replays pass. All three actual native group canvases match equivalent original source-envelope renders byte-for-byte. Six repeated overlays, 185 retained-owner taps and 3196 new group taps pass. All three illustrated review tap hints are checked with native-source Reader contexts. Android build and downloaded APK verification pass.

Verified Android build: run37635395646, job112840143051, success. Source commit925066e545201835b1354408f061f87e3d5341a3, source tree19d73841aece0f702345d48f741352db9586b0fa. Artifact11490266492; archive sha256:28961c118427d2d21c872611a0097f823f24e68d17702d18e742689d4cf1fb0c verified. APK3,571,468 bytes; SHA2561e04128706367893cf1f8d3e688d3e72470c7ab92e14922aaa0257648deee811. Actual compiled identity io.github.bdredenbach.nthshelf.frametest118 /2.79.118 /28046 /Nth Shelf Test118. Actual APK v2 signer certificate SHA25617335ab18e5b74c413b11bcf1fdb1bf68bef105858169db4e3a1649f26a7fcb5 matches CI signature record. All120 packaged web files match frozen tested bytes. CI141 retained behavioral checks, browser/backup round-trip, native archive, Android build and signature/package verification pass. Phone acceptance, grouping usability and timing pending.

Continuation checkpoint: Nth-Shelf-Test118-Replay-Checkpoint.zip contains all six final Test118 descriptor maps (312 pages /1,337 selections), comparison summaries and the frozen120-file web manifest. No comic artwork; offline regression baseline only, never a runtime page/identity lookup. Resolve this exact filename in Library, materialize and verify checkpoint.json hashes and source/asset identity before reuse. Restore source from Test118 artifact11490266492 and the six authorized archives. Reuse these final descriptors as the baseline for Test119 source/Reader comparisons; a full rebaseline is unnecessary when all checkpoint and runtime hashes match. Independently replay changed pages and retained contracts.


</details>

<a id="archive-handoff-2-79-119-md"></a>

<details>
<summary>HANDOFF-2.79.119.md — historical checkpoint</summary>

# Test119 / 2.79.119 — nine complete original recoveries

7 October 2026. bdredenbach/Nth-Shelf, Test_Branch only. Continue from Test118 local 318/384. Test119 local 327/384, 57 remaining. Numeric phone acceptance was not supplied; phone acceptance, group usability and timing remain pending.

Install separate Nth Shelf Test119. Reader page numbers include covers:
- Issue 1 Reader 6 S1: +7 — Upper-left narrow figure, upper-center baby discovery, upper-right baby-face close-up, middle crowd, middle-right Baal portrait inset, lower sacrifice discussion, and bottom Baal with baby. All balloons, protruding hands, figures and original gutters remain. Tap any artwork on this page.
- Issue 1 Reader 24 S2: +2 — Complete upper-right throne view and large lower throne conversation. The earlier upper-left Baal/Logos scene adds zero to the new count; S1 retains its original display and tap priority. The NEXT preview pillar is decorative lettering and adds zero. Tap the upper-right throne view or the large lower conversation to open S2.

Two new broad source groups retain all original interiors, speech bodies and gutters. Each unique complete original counts once; clipped originals, duplicate context, decoration, covers and credits add zero. Group usability and individual segmentation remain separate from frame coverage. 240 Apocalypse selections. Issue totals 83/99, 91/97, 101/109, 52/79. Denominator384.

Generic proof68 uses independent18/20 gradient exterior maps, a stable dense broad enclosure, paired25/18 measured color-channel boundaries on all four sides, bounded peripheral source islands and complete opaque source interiors. Accepts no owner or one sparse proven owner; at least70% of component pixels must be novel. Serialized masks, group mode, geometry, exclusions, source overlap, boundary sample counts, content and novelty are recomputed. Reader preserves earlier display context and first tap priority while returning the full new group contour. No book/page/title/text/hash/fingerprint lookup. No comic artwork in git/CI.

Remaining priority queue: issue1 Reader7 upper eye/sword strip; Reader13 narrow attacker portrait; Reader18 right dialogue strip and clipped En; issue3 Reader5 goddess head/halo. Other Test118 remaining pages stay queued except issue1 Reader6 and Reader24, now complete. Do not double-count older originals. Private next-candidate stats live in test119/explore.json if scratch survives; they are exploratory evidence, not counted recoveries.

Source archives: Apocalypse libfile_06c168de85c08191ba461ab9ef2cdba5; Wolverine libfile_df4e3f2e95488191a8684aac7b8ff80e; Magneto libfile_11da0f85d7148191b1bef1abe6fe482d; manga libfile_be583424a66c8191bc6a8be6c6978420, libfile_a1089428d0d4819193de79fc4bd7f8bb, libfile_c87d71d1abf48191b87e46bafaa84c7f.

Scratch source /workspace/scratch/37406b7d348a/Nth-Shelf-Test119; checks /workspace/scratch/37406b7d348a/test119; original rasters /workspace/scratch/37406b7d348a/fixtures/images. Verified Test118 replay checkpoint hashes and all120 frozen runtime assets before reusing its312-page/1,337-selection baseline. If scratch disappears, restore source from the published Test119 artifact and authorized archives; reuse the verified Test119 checkpoint. Independently replay changed pages and retained contracts. Isolated Test_Branch publication/APK authorization and nine-original cadence persist. A continuation request does not imply numeric phone acceptance. Read docs/evidence/validation/TEST119-VALIDATION.json for completed checks and build identity.

Local validation complete: all143 retained behavioral suites and cache/package/syntax checks pass. Verified Test118 checkpoint and120 frozen runtime files establish the312-page/1,337-descriptor golden baseline. All312 new supplementary source comparisons and native-source old-versus-new Reader display comparisons pass; all earlier descriptors and displays are unchanged, and all five control books retain identical selections/displays. Exactly two new Apocalypse groups add nine unique complete originals. Full changed-page detector replays pass. Both actual native group canvases match equivalent original source-envelope renders byte-for-byte. Four repeated overlays, 39 retained-owner taps and 2878 new group taps pass. Both illustrated review tap hints are checked with native-source Reader contexts. Android build and downloaded APK verification pass.

Verified Android build: run37647741445, job112882810093, success. Source commit78e6bdf38acd98e9165674943cc68d51672c6350, source tree975364f59adb9193e8e14d4a5c7119d3765ab151. Artifact11496240701; archive sha256:f3fc4971d1c31450a005257984ba031cacd8592046b6ebba8b80242120cc5146 verified. APK3,576,393 bytes; SHA2566e76f3f70fd213c37e386f4fd945e191102015f65919d08b7b9d5392b7d6fcec. Actual compiled identity io.github.bdredenbach.nthshelf.frametest119 /2.79.119 /28047 /Nth Shelf Test119. Actual APK v2 signer certificate SHA2568d452b9009133fb1cfe9ea8f5ec3e4ae2c16f045d04114195d1ec8280dc258fa matches CI signature record. All121 packaged web files match frozen tested bytes. CI143 retained behavioral checks, browser/backup round-trip, native archive, Android build and signature/package verification pass. Phone acceptance, grouping usability and timing pending.

Continuation checkpoint: Nth-Shelf-Test119-Replay-Checkpoint.zip contains all six final Test119 descriptor maps (312 pages /1,339 selections), comparison summaries and the frozen121-file web manifest. No comic artwork; offline regression baseline only, never a runtime page/identity lookup. Resolve this exact filename in Library, materialize and verify checkpoint.json hashes and source/asset identity before reuse. Restore source from Test119 artifact11496240701 and the six authorized archives. Reuse these final descriptors as the baseline for Test120 source/Reader comparisons; a full rebaseline is unnecessary when all checkpoint and runtime hashes match. Independently replay changed pages and retained contracts.

All four Test119 deliverables saved. Replay checkpoint Library identity: libfile_b32ae41c228881918a0cbc3a2a7a6c8d / file_00000000aacc820cabc488933a25ab5e; SHA256 f8c7887923ec850817d7a073c7c361e7efcbff6c1f19b1b68a9bd8408c304361.

Review correction: Test119 review v2 now runs the unchanged Reader overlay code with exact dark focus CSS, actual tap routing and explicit TRUE/FALSE/OFF states. Show original page/Show pop-out and Enlarge preview controls are included. Earlier review displayed extracted canvas artwork without the dimmed page or final overlay. Both additions span the full page: nine recovered originals are contained in two broad groups, not nine newly separate panel pop-outs. Local creation of an overlay is separate from phone/grouping acceptance, which remains pending. Four native DOM/canvas overlay replays across desktop and phone-size rectangles passed, including dim state, controls, no-hit failure, and original S1 priority; no browser screenshot verification claimed. APK and all121 frozen runtime assets unchanged. Saved HTML libfile_7a7d8c288c948191b8ae79e09eede222 / file_000000008fe881f8ac7bc2ac1b32946d /version2. The initial layout captures show the verified native Reader canvas at its emitted final transform above the darkened page, including when live controls cannot run; these are not browser or phone screenshots.


</details>

<a id="archive-handoff-2-79-120-md"></a>

<details>
<summary>HANDOFF-2.79.120.md — historical checkpoint</summary>

# Test120 — first single-frame recovery under the new rules

7 October 2026. bdredenbach/Nth-Shelf, Test_Branch only. Brad now requests ONE frame per checkpoint, or at most TWO when immediate continuity warrants it. Finish comic #1 before comic #2. This supersedes nine-original batches and broad page-level grouping success.

Rise of Apocalypse #1 baseline: Test119 strict audit28 singles +4 pairs =36/99 unique frames,63 remaining. Test120 locally:29 singles +4 pairs =37/99,62 remaining. One gain only: Reader3 S1, campfire P03-F2. All captions, speech, dog and sound-effect protrusions stay. The introduction P03-F1/S2 keeps its complete ornament and prior tap/display. The unresolved direction strip P03-F3 and sandstorm P03-F4 remain normal-page reading after removing this page's oversized group. Do not claim these two as recovered. A future two-frame pop-out needs immediate continuity and complete artwork/dialogue, not merely the same page/scene.

Generic proof69 refines a proven paper-edge group using one uniquely witnessed interrupted horizontal gutter. Two weighted source-paper paths and radius4/6 seed maps agree; only seeds see provisional barriers. Original-pixel growth preserves curved protrusions and complete speech. Whole scene boundaries, peer masks, measured contour/pixel counts, source boundary evidence and serialized proof geometry validate. Internal dividers veto ambiguous children. No book/page/title/text/hash/fingerprint lookup. Every unchanged page/owner remains untouched.

The new Reader wrapper restores the original broad-neighbor context while rendering accepted peers, so narrowing a group cannot lose a previously accepted annex. It then removes the peers' complete display masks from the new focused crop. The broad group is intentionally replaced on this bounded target; all other source descriptors and all50 other native issue1 crops remain unchanged. All32 previously qualifying focus steps remain.

Source corpus: new refinement on verified stored Test119 maps for312 pages/1339 descriptors. Only issue1 Reader3 S1 changes; five control books and the other90 Apocalypse pages retain their descriptors. All eligible source parents replayed on originals. Full changed-page detector independently reproduces exactly2 descriptors. This is not a fresh rerun of the old detector on all312 pages. All24 issue1 pages/51 real native Reader crops replayed; source/dim/tap/overlay evidence retained privately. Phone acceptance pending.

APK identity2.79.120 /28048 /io.github.bdredenbach.nthshelf.frametest120 /Nth Shelf Test120. Build status and actual source/artifact/checksum must be read from docs/evidence/validation/TEST120-VALIDATION.json; do not invent them. Verified build run 37669217951, artifact 11504817264, source 1632dc37e0082830c3c27cd0b8f9f32afd94929b, tree eab94cf3f347a22bd281f0edc46e4a7a363062c3. Downloaded APK SHA256 273a47f132cf2f7a8233e966db2037dfe3becfddf3b18f212f4bbfdd647140dc. Cryptographic v2 signature/content digest, compiled identity, all 122 frozen packaged web files and all 1,214 source-archive files verified. CI retained145, browser interaction/backup and native streaming archive checks passed. Phone acceptance remains pending.

First next target: Reader3 direction strip P03-F3. Consider P03-F3/F4 as a two-frame continuation only if source ownership and immediate dialogue/action pass review. Work one step at a time. Older83/99 and327/384 were broad artwork preservation and must not replace the new37/99 focused count. Other18 rejected selections are still queued; global automatic reading and its adjustable timer are not implemented. Start future reading pause after animation settles; unresolved segmentation should pause for manual reading.

New rules handoff libfile_b40550a56110819197ad1ffa78ce2e9c. Frozen illustrated baseline libfile_de9bbc20358881919fad40048250a904; JSON libfile_6e3a72b201188191b423f95684ae2b73; checkpoint libfile_748f678d26b08191bfb17bde57758930. Old full Test119 map checkpoint libfile_b32ae41c228881918a0cbc3a2a7a6c8d. Original Apocalypse archive libfile_06c168de85c08191ba461ab9ef2cdba5. Keep comic artwork out of git/CI. Recover current repository source before editing, verify all checkpoint/source/artwork hashes, then replay retained contracts and current qualifying native canvases. Update the same rules handoff after each checkpoint.

Verified Test120 deliverables saved:

- Nth-Shelf-Single-Dual-Frame-Rules-Handoff.txt / libfile_b40550a56110819197ad1ffa78ce2e9c / file_00000000a49881f5919536470f2af954 /version2 /SHA256 766e8b9d4616424c9f2b5978c0e5adb7dbd7acba7b72e2627870c51ee2181321
- Nth-Shelf-2.79.120-Test120.apk / libfile_201082146cd08191817ad78da441d21a / file_00000000283c81f597800a7d3ce85b8c /version0 /SHA256 273a47f132cf2f7a8233e966db2037dfe3becfddf3b18f212f4bbfdd647140dc
- Nth-Shelf-Test120-Frame-Review.html / libfile_7e90b31b012481918559b03eb679f6f5 / file_0000000029fc81f58b899f69f3a67fc8 /version0 /SHA256 c5115bf772d40ac170ddad2ad1a2c2644fb3ba8307ebfe07ad0717b99f916968
- Nth-Shelf-Test120-Single-Frame-Regression.json / libfile_bc067e8f51e08191a38e3d5ae9afe602 / file_000000007da081f5bb5d7fdacf486b69 /version0 /SHA256 42a2cf07d99b19c3d189d12d484257e80d5d0c51df40a96ffac8561b81cf796a
- Nth-Shelf-Test120-Replay-Checkpoint.zip / libfile_dc3896e6641c8191b2743ae8a30bcec5 / file_00000000ed0081f5a65df089280f0288 /version0 /SHA256 9ccd9b553a4bb577a71cb4bf352cb5e2db75ffe52cacb4ec5a603786b8e1a222


</details>

<a id="archive-handoff-2-79-121-md"></a>

<details>
<summary>HANDOFF-2.79.121.md — historical checkpoint</summary>

# Test121 — two originals in one justified continuity pair

7 October2026. bdredenbach/Nth-Shelf, Test_Branch only. Brad confirmed Test120 worked and requested two frames this time. Keep default one original, at most two consecutive originals with immediate continuity. Finish comic1 before comic2. The Test120 campfire is user-confirmed; the new Test121 pair is locally verified with phone acceptance pending.

Rise of Apocalypse #1: Test12029 singles+4 pairs=37/99 originals,62 remaining. Test12129 singles+5 pairs=39/99,60 remaining;34 qualifying steps/52 selections. Exactly two originals recovered: Reader3 P03-F3 direction strip and P03-F4 sandstorm, together as S3. The gesture/dialogue directs attention east immediately into the sandstorm reveal; the speech balloon bridges their boundary. This is a supported two-original continuation, not a whole multi-frame page. Reader3 now has separate campfire S1, introduction S2 and new lower pair S3. Source reading order is introduction S2, campfire S1, then lower pair S3; selection IDs are not reading-order IDs. Preserve existing tap priority and use actual original reading order for the future automatic mode. Full pointing arm/hand, all three speech balloons and sandstorm lettering stay; campfire dog/sound effects stay with S1. The other18 rejected selections remain queued.

Generic proof70 replays the paper paths from certified focused-cell proof69. Independently eroded seed maps prove one uniquely bounded lower remainder; measured0.4% maximum edge difference, original source-parent and prior-owner exclusions, full shape/pixel/boundary and serialized-proof checks validate. The mask grows on original pixels, not on a destructive straight crop. This structural proof establishes extraction; offline source review establishes exactly two originals and immediate continuity. No runtime book/page/title/text/hash/fingerprint lookup.

New Reader wrapper delegates all earlier owners with exactly their previous owner context. It excludes complete earlier display masks from the new crop. All51 prior native issue1 PNGs are byte-identical, preserving all33 qualifying steps and taps, including the Test120 campfire and introduction ornament. All24 source pages/52 pop-outs/dark overlay states replayed. Native canvas composites are not browser/phone screenshots.

New refinement compared on all312 verified stored Test120 maps/1339 prior descriptors. Only Reader3 appends one descriptor (1340 total); all other90 Apocalypse pages and five control books retain descriptors. All eligible source parents replayed on originals. Full changed-page detector status,147 retained/new behavioral gates, cache/package/syntax and real APK/CI facts must be read from docs/evidence/validation/TEST121-VALIDATION.json. Do not claim a fresh old-detector run on all312 originals.

APK identity2.79.121 /28049 /io.github.bdredenbach.nthshelf.frametest121 /Nth Shelf Test121. Verified build run 37678442458, artifact 11507884876, source 33bd53bf312a418ea6d8fa82b947941f47ef540f, tested tree 9cdf6424da5a8e5002ab714671f2a6f4f4fe1b12. Downloaded APK SHA256 872a0de1d3130a012e3b9744d0b1307d5f64c56e5802c486566015748d7239b7. Actual cryptographic v2 signature/content digest, compiled isolated identity, all123 frozen web files and all1225 source-archive files verified. CI147 retained suites, browser/backup and native archive checks passed. New pair phone acceptance remains pending. Read docs/evidence/validation/TEST121-VALIDATION.json for actual source/tree/run/artifact/checksum and completed gates.

Next: Reader5 night camp P05-F1. Reader3 is complete locally under the single/dual rules. Work on one original, or at most a justified consecutive pair, per checkpoint; this request authorized two originals in this checkpoint. Old83/99 and327/384 remain historical broad preservation. Future automatic playback/adjustable timing is not implemented; pause after animation settles and unresolved reading steps stay manual. Phone acceptance of the new pair remains pending.

Rules handoff identity libfile_b40550a56110819197ad1ffa78ce2e9c, current version3 after Test121 save; reread before future replacements. Current Test120 checkpoint libfile_dc3896e6641c8191b2743ae8a30bcec5; current Test120 audit libfile_bc067e8f51e08191a38e3d5ae9afe602; frozen Test119 strict audit libfile_6e3a72b201188191b423f95684ae2b73; full Test119 maps libfile_b32ae41c228881918a0cbc3a2a7a6c8d. Authorized Apocalypse originals libfile_06c168de85c08191ba461ab9ef2cdba5. Verify source/web/checkpoint/artwork hashes before replay. Keep artwork out of git/CI. Save the new audit/checkpoint and replace the same rules handoff after every checkpoint.

Verified Test121 deliverables saved:

- Nth-Shelf-Single-Dual-Frame-Rules-Handoff.txt / libfile_b40550a56110819197ad1ffa78ce2e9c / file_00000000adac82308a02600f7cdfcaeb /version3 /SHA256 351f9054504abd9f8b2ce2021530f516ff04bca3443038e02d97c1657508cd57
- Nth-Shelf-2.79.121-Test121.apk / libfile_1a48477c639c81918a66c6f40f9f5698 / file_000000000cc88210a5afde627131b8c6 /version0 /SHA256 872a0de1d3130a012e3b9744d0b1307d5f64c56e5802c486566015748d7239b7
- Nth-Shelf-Test121-Frame-Review.html / libfile_73f446672dec81918751f86806a2f669 / file_00000000b5848230831b6c5e2b5eef8d /version0 /SHA256 8cbf211f52a4eb90169f54231f57b78aec0e3c20691199348cfff3fa24d6587a
- Nth-Shelf-Test121-Two-Frame-Regression.json / libfile_fa931f09c1348191a3467b8728ae1c89 / file_000000005d8c81f592bfbc889591483f /version0 /SHA256 fb69f565b60696f955b6f10facf79775230546333aab243c0c2988240e60b227
- Nth-Shelf-Test121-Replay-Checkpoint.zip / libfile_8efe0d00ab688191bd4f58d1f8e1ef22 / file_0000000097948210929192e221685aba /version0 /SHA256 4258b6e82225268ce222c05a1fb9b778c1fd2b2812ef10ce8958baaf2287ee07


</details>

<a id="archive-handoff-2-79-122-md"></a>

<details>
<summary>HANDOFF-2.79.122.md — historical checkpoint</summary>

# Test122 — one complete night-camp original

Test122 recovers ONE original, Reader5 S1/P05-F1 night camp. Current focused count30 singles+5 pairs=40/99 originals;59 remain,35 qualifying steps/53 selections. Test121 direction/sandstorm pair user-confirmed: "Yes that worked 💪🏻 Let's continue". Test122 phone acceptance pending. Next Reader5 P05-F2 horsemen conversation, one original by default or at most a justified immediate pair. Finish comic1 before comic2. Automatic playback/timer remain planned.

Empty-map structural fallback uses a dominant saturated exterior hue derived from source edge pixels. Two independent eroded seeds agree on the upper cell. A finer1800-pixel analysis retains the thin moon outline; source-pixel enclosure completion keeps smoke, caption, moon and owned dialogue while excluding the lower conversation. The existing lower source owner blocks enclosure growth. No book/page/title/text/image identity, stored crop or review verdict chooses pixels. This proof establishes extraction; the private source review assigns exactly one original.

Preserve all34 earlier qualifying steps and52 earlier native issue1 canvases/taps. Source-map regression covers312 stored Test121 maps/1340 prior descriptors, with source replay for all25 eligible empty maps, including12 restored control images. Only Reader5 appends one descriptor,1341 total. Full changed-page detector must reproduce one exact descriptor. Actual native Reader replay covers all24 issue1 pages/53 selections and dark focus/tap/final geometry; native composites are not browser or phone screenshots. Read docs/evidence/validation/TEST122-VALIDATION.json for completed gates and evidence.

APK identity2.79.122 /versionCode28050 /io.github.bdredenbach.nthshelf.frametest122 /Nth Shelf Test122. Verified build run 37690609792, artifact 11514090922, source d26b9fd8a75f9de97740b4b4078139a50f3f8b5e, tested tree 58311bc8ab9f5ae15bef7f13cb0d2c7be781bc3e. APK SHA256 94a29b16d30d2829ead4aa875b9d0c4ed60853863910bafc5da1e07e218bf01f. Compiled isolated identity, actual cryptographic v2 signature/content digest, CI signer,124 packaged web files and all1236 source archive files verified. CI149 retained suites plus browser/backup/native archive/build passed. New night camp phone acceptance pending. Required gates149 retained/new behavioral suites, cache/package/syntax, CI browser/backup/native archive/build; actual APK identity/signature,124 frozen web files and exact Source ZIP must be verified before delivery.

Rules handoff identity libfile_b40550a56110819197ad1ffa78ce2e9c, prior version3; replace the same identity after final verification. Source baseline remote metadata eeae78c535997951722eb5893680e887dfdb4435 /tree287ef4c12e1bfd4f3e7ec66d675db3cea2f28d32. Previous Test121 checkpoint libfile_8efe0d00ab688191bd4f58d1f8e1ef22; previous audit libfile_fa931f09c1348191a3467b8728ae1c89. Authorized Apocalypse originals libfile_06c168de85c08191ba461ab9ef2cdba5. Verify frozen runtime/artwork/checkpoint hashes before replay; keep comic pixels out of git/CI.

The other18 rejected selections remain queued (9 oversized,6 mixed-neighbor,3 damaged). Old83/99 and327/384 were broad artwork preservation, not this single/dual criterion. Reader3 source reading order remains introduction S2→campfire S1→direction/sandstorm S3. Future automatic mode must follow original reading order, pause after animation settles and pause unresolved steps for manual reading. Phone usability of the new night-camp step is pending.

Verified Test122 deliverables saved:

- Nth-Shelf-Single-Dual-Frame-Rules-Handoff.txt / libfile_b40550a56110819197ad1ffa78ce2e9c / file_00000000beb081f594cace5edff6d4c5 /version4 /SHA256 8dc1167d0dea3c3aec80fa198fa31247102cad5cab8562ba4fe52a9746f87120
- Nth-Shelf-2.79.122-Test122.apk / libfile_1a41ccc8d6248191be6f376c680cc371 / file_00000000941481f59a22a761c1d0eb1f /version0 /SHA256 94a29b16d30d2829ead4aa875b9d0c4ed60853863910bafc5da1e07e218bf01f
- Nth-Shelf-Test122-Frame-Review.html / libfile_33d8281d055081919e8accf19b6ef456 / file_0000000096c0820d8d0ed6ff6b8490ad /version0 /SHA256 23004e9ab11507949784f1fc00330dba21ffa090df0cf2406e0c7ee90acee01c
- Nth-Shelf-Test122-Single-Frame-Regression.json / libfile_4b47a9f5fc5c8191a477f832e8cf0379 / file_00000000925081f883426833cedc3244 /version0 /SHA256 2924471c4a1f3a8440ab8045fef0b05d2b105463cb1cc68d456458b6c0238104
- Nth-Shelf-Test122-Replay-Checkpoint.zip / libfile_f384214e12708191918de6afa04a63ae / file_00000000520482308a47aef1612eb86c /version0 /SHA256 94fb54bd7d770ad5d8077072975c2f2821f640f9882c905c15387d20a3765b49


</details>

<a id="archive-handoff-2-79-123-md"></a>

<details>
<summary>HANDOFF-2.79.123.md — historical checkpoint</summary>

# Test123 — one complete horsemen conversation original

Test123 adds ONE original, Reader5 S2/P05-F2 horsemen conversation. Focus31 singles+5 pairs=41/99 originals,58 remaining;36 qualifying steps/54 selections. All53 earlier native issue1 canvases/taps/dim/final geometry and35 qualifying steps retained. New conversation includes all six owned speech balloons and complete source frame artwork. Night camp, lower Hold balloon, round Baal portrait and lower mounted scene excluded. Upper two originals continue dialogue but are independently readable; keep separate single steps.

Generic saturated-rail refinement applies only after one certified frontier owner. Replays the exact anchor on source pixels, derives chromatic rail witnesses from the source palette, reconstructs an interrupted boundary from robust flanks, and requires independent two/three-pixel frontiers to agree. Internal dividers reject. No book/page/title/text/image identity or stored crop selects geometry. Geometry proof establishes extraction; private original review assigns one original.

All312 stored Test122 maps/1341 previous descriptors compared;1342 current. All eligible parents (one source image) replayed; only Reader5 appends one selection. Full changed-page detector independently reproduces both exact selections. No full fresh old-detector replay312 originals claimed. All24 issue1 source hashes match inventory. Actual Reader replay24 pages/54 canvases verifies taps, dark backdrop and final centered transforms. Native composites are not browser or phone screenshots.

APK2.79.123 /versionCode28051 /io.github.bdredenbach.nthshelf.frametest123 /Nth Shelf Test123. 151 retained/new suites plus cache/package/syntax passed locally. Passed CI browser/backup/native archive/build and actual compiled identity/cryptographic v2 signature/content digest/signer,125 frozen packaged web files and exact tested Source ZIP. Verified source f9ba6fcf9eddb1712d5c2cfd3917e667438bc723, tested tree f6a4a70c4ca40d6806c2e00976a8fb0e0008b4a0, CI run37718507510, artifact11525067934. Actual APK SHA256 4c274a79b0c7b1d5b18020d9dcc1142e0a54ddc190fce4bc2c9edf957fd96749. Compiled identity, cryptographic v2 signature/content digest/CI signer,125 packaged runtime files and exact tested Source ZIP verified. CI151 retained suites, browser/backup/native archive/build passed.

Branch bdredenbach/Nth-Shelf Test_Branch only. Parent metadata30008b327f6379bf7be76e990f14952a4dd6184c, tree5e172fc3169dd85d2a7277886295772860e036ad. Test122 source/runtime/original/checkpoint hashes verified before resume. Same rules handoff libfile_b40550a56110819197ad1ffa78ce2e9c currentversion4; update same identity after successful checkpoint. Baseline checkpoint libfile_f384214e12708191918de6afa04a63ae; authorized Apocalypse originals libfile_06c168de85c08191ba461ab9ef2cdba5. Keep comic artwork out of git/CI.

Next Reader5 P05-F3 Round Baal portrait. Reader5 still two unresolved originals: round portrait and lower mounted group. Finish comic1 before comic2. Default one complete original or at most two adjacent consecutive originals with immediate action/dialogue/shared composition.18 rejected selections remain (9 oversized,6 mixed-neighbor,3 damaged); old83/99 and327/384 are broad artwork preservation. Reader3 source order S2→S1→S3. Preserve tap priority; selection IDs are not future playback order.

Test121 pair user-confirmed. Test122 night camp and Test123 conversation phone acceptance pending; the request to continue does not constitute an explicit phone verdict. Automatic reading/timing slider remain planned, not implemented. Future timing starts after animation settles; unresolved steps pause for manual reading.

Verified Test123 deliverables saved:

- Nth-Shelf-Test123-Single-Frame-Regression.json / libfile_ea1c53b44d3c8191bc7001748be91a8e / file_00000000612881f5bf20562fdf50c735 /version0 /SHA256 b021564b5db5f7d856481963aa09b4d3b5a51d0da4cb4a079fb79f39a82dd300
- Nth-Shelf-2.79.123-Test123.apk / libfile_f9aad502d0288191b39f38b2dd2ce30b / file_00000000e66081f58d19f6cc998c81e6 /version0 /SHA256 4c274a79b0c7b1d5b18020d9dcc1142e0a54ddc190fce4bc2c9edf957fd96749
- Nth-Shelf-Test123-Frame-Review.html / libfile_2d27c62cdcec8191acaab7a9b39884c4 / file_000000006f2081f5bbb205f1f302600e /version0 /SHA256 868766d47249e275127595509409debebac38d0dee2b44022df266f724712b33
- Nth-Shelf-Single-Dual-Frame-Rules-Handoff.txt / libfile_b40550a56110819197ad1ffa78ce2e9c / file_00000000bd5c81f5a376779ddde6ec6e /version5 /SHA256 c13e6d0dece679b76a82a0380176a93b4603c04db634c3b7e6acc738b992fe34
- Nth-Shelf-Test123-Replay-Checkpoint.zip / libfile_7c7d98beb4bc8191ab0b9e85f7889ef7 / file_00000000d19481f5a4be3ed2b4af63ff /version0 /SHA256 b23c9131343f7519aa407519bdd5313d7dd3da3ea3fea2a2e61a1b424126859f


</details>

<a id="archive-handoff-2-79-124-md"></a>

<details>
<summary>HANDOFF-2.79.124.md — historical checkpoint</summary>

# Test124: one complete round portrait

Rise of Apocalypse #1 Reader5 S3/P05-F3 is one complete original round Baal portrait, including the Hold balloon and tail. The lower mounted group is excluded. Independent source arc fits and source ink seams select the crop; the exact two earlier anchors are replayed. No identity, text or stored crop table selects pixels. Preserve original order S1 night camp → S2 conversation → S3 round portrait; the lower mounted original remains unresolved.

32 singles+5 continuity pairs=42/99 originals;57 remaining.37 qualifying reading steps/55 selections. All54 prior native canvases and tap/dim/final geometry identical,36 earlier qualifying steps retained.18 rejected selections remain:9 oversized,6 mixed-neighbor,3 damaged. Old83/99 and327/384 counts allowed broad groups and are not focused readiness.

312 stored Test123 maps/1342 previous descriptors compared;1343 current. All eligible parents(one original) replayed; only Reader5 appends one descriptor. Full fresh changed-page detector independently reproduces3 exact selections. No full fresh old-detector replay312 originals claimed. All24 issue1 source hashes match inventory. Actual native Reader24pages/55 canvases verifies taps, dark backdrop and final centered transforms. Native composites are not browser/phone screenshots.

153 retained/new suites including cache/package, plus syntax passed locally;126 runtime assets frozen. Separate Android2.79.124/versionCode28052/packageio.github.bdredenbach.nthshelf.frametest124/labelNth Shelf Test124. Verified runtime source 3727670427de00bce62813469aaa4031efb59c87, tested tree c4ac7b876ec29cf9825b71a1d0006292ab9286cb, CI run37837719604, artifact11577037644. APK SHA256 4a50cc73d228826c782ace800d8c9c93b74103032fbbfb3a74b537f6c8ac1209. Actual compiled identity/v2 cryptographic signature/content digest/CI signer,126 packaged runtime files and exact tested Source ZIP verified. CI153 suites(152 behavioral+1cache/package), syntax, browser/backup/native archive/build passed.

GitHub bdredenbach/Nth-Shelf Test_Branch only. Parent2232c9e933bed658cd5e2e3ba2eb88ba3a613b6b/tree7bcb5ad4043cf6556cd462b6d0d22b948f8841d3. Verify tested source/runtime/original/checkpoint hashes before resuming. Authorized originals libfile_06c168de85c08191ba461ab9ef2cdba5; Test123 replay checkpointlibfile_7c7d98beb4bc8191ab0b9e85f7889ef7. Rules handoffsameidentitylibfile_b40550a56110819197ad1ffa78ce2e9c/currentversion6; updated after successful checkpoint. Keep comic pixels out of git/CI.

Test123 conversation user-confirmed. Test122 night camp still lacks explicit phone confirmation. New Test124 round portrait phone acceptance pending. Automatic reading/timing slider remain planned, not implemented. Future timing begins after animation settles; unresolved steps pause for manual reading.

Next Reader5 P05-F4 lower mounted group. Default one complete original, at most two adjacent consecutive originals with immediate continuity. Finish comic1 first.

Verified Test124 deliverables saved:

- Nth-Shelf-Test124-Single-Frame-Regression.json / libfile_31f161fe74208191955190f2bb10cc5a / file_000000001b8081f89fc5a492d07785bb /version0 /SHA256 2679b261198c0961cb90d122209d87708b21218346cf310b5936ff2a2361f9b9
- Nth-Shelf-2.79.124-Test124.apk / libfile_2fe36541da7c81918c02576d7f02603f / file_00000000b75881f7929ee9cee5c6f80c /version0 /SHA256 4a50cc73d228826c782ace800d8c9c93b74103032fbbfb3a74b537f6c8ac1209
- Nth-Shelf-Test124-Frame-Review.html / libfile_caf9b3af2f7481919b4ed0927f734f43 / file_00000000e8948230abaf7e3e990f7571 /version0 /SHA256 8d54a73d4f24cd14f3851f761f71aec14c9ed7f10d52b177fad8ad6883119264
- Nth-Shelf-Single-Dual-Frame-Rules-Handoff.txt / libfile_b40550a56110819197ad1ffa78ce2e9c / file_0000000077008230be051d27864ad027 /version6 /SHA256 8f626b7d038ce17e372d9dc226f4b02d2b361b3491e6e82e03412a4faea6e52b
- Nth-Shelf-Test124-Replay-Checkpoint.zip / libfile_530c4c10c7fc8191bb0ed1ee3bc72c23 / file_00000000bc9c8230b2cdbab1f0196d54 /version0 /SHA256 84f1772cf154a4df7f76cf1ea1b154ee561cb3f86334da480a17f45609b58470


</details>

<a id="archive-handoff-2-79-125-md"></a>

<details>
<summary>HANDOFF-2.79.125.md — historical checkpoint</summary>

# Test125 — source-only lower mounted frame

User requested the same single-frame cadence without APK builds. Publish successful source to Test_Branch only. APK workflow is now manual-only; do not dispatch it until the user requests a build. Version/package entries are future configuration, not a compiled APK identity.

Rise of Apocalypse #1 Reader5 S4 / P05-F4 now extracts one complete lower mounted group with both owned balloons, horses, riders and foreground rocks. The certified upper rail and page edges define its boundary; the three earlier owners keep their pixels and tap priority. The round portrait and Hold balloon remain outside the new crop. Default single, no continuity merge merely for the same scene.

33 singles +5 justified continuity pairs =43/99 unique originals covered;56 remain.38 qualifying steps /56 actual selections. All55 prior native PNGs and tap/dim/final transforms identical;37 previous qualifying steps retained. Reader5 now locally complete: S1 night camp →S2 conversation →S3 portrait →S4 mounted group. Reader3 order remains S2→S1→S3. IDs are not automatic playback order.

155 retained suites (154 behavioral +1 current cache/package configuration suite), syntax and127 frozen web-source hashes passed.312 stored maps/1343→1344 descriptors compared; all eligible parents(one original) replayed. Only Reader5 appends one selection. Full changed-page detector reproduces4 exact selections.24 issue1 source hashes and56 native selections verified. No full fresh312-original old-detector replay claimed. Native composites are not browser/phone screenshots. Browser integration/backup suites could not launch locally because Chromium is absent; no Android APK workflow was triggered. The existing GitHub Pages deployment triggered automatically on source push; APK verification is not claimed.

Test123 user-confirmed. Test122 and Test124 explicit phone verdicts remain pending. Test125 has local native review only; no APK exists. Automatic playback/time slider remain planned. Next: Reader6 P06-F1 upper-left narrow figure, one original at a time. Finish comic1 before comic2. Keep comic artwork out of git/CI. See docs/evidence/validation/TEST125-VALIDATION.json for source checks and final publication/saved-file records.

Runtime source: c1782b7ad36f1dfefa742eeebd5e234b47bcbb37; tested tree0646464eba35c17d3977d3b83b72ed7c1be2faaa. Guarded Test_Branch publication verified. No Android APK workflow triggered. Saved rules handoff same identity nowversion7; audit, review and private replay checkpoint also saved. Exact IDs/versions/checksums in docs/evidence/validation/TEST125-VALIDATION.json. Later metadata changes only these records.


</details>

<a id="archive-handoff-2-79-126-md"></a>

<details>
<summary>HANDOFF-2.79.126.md — historical checkpoint</summary>

# Test126 — bulk56 checkpoint1, source only

The user authorized all56 remaining originals in Rise of Apocalypse #1 in one turn, with successful source changes published to `Test_Branch` and no APK builds. **The bulk task is in progress;54 originals still need fixes.**

Reader14 S5 now includes the detached desert caption. Both source palettes independently enclose the same lettered body. Its complete bounds lie inside exactly one proven trailing-edge owner, with no foreign-owner pixels. The Reader attaches that body from the original image; it uses no book/page/text/hash/stored-crop lookup. Discovery descriptors remain unchanged.

This selection contains P14-F5 and P14-F6, two consecutive originals sharing Baal's foreground across the drawn boundary. That shared composition justifies a continuity pair. The new caption repair establishes geometry, not scene continuity; continuity is a private review decision. Phone readability has not been accepted.

Local acceptance is33 singles +6 pairs =45/99 originals;54 remain.39 qualifying steps /56 current selections.17 selections remain rejected:9 oversized,6 mixed-neighbor,2 damaged. All38 earlier qualifying steps are preserved. Other55 native Reader crops are byte-identical, and every selection's tap/dim/final-overlay metadata is equivalent. All3219 restored source-caption pixels were individually tap-checked.

No APK, Gradle build or Android workflow was invoked. Version2.79.126 /future versionCode28054 /frametest126 are configuration only. The latest delivered APK remains Test124. Automatic playback and the timing slider remain planned.

Continue the same authorized bulk task on the remaining54 originals, preserving the39 qualifying steps. Complete singles are the default; at most two adjacent consecutive originals may form a step only for immediate continuity or shared composition. A multi-frame whole-page envelope adds no readiness coverage. Finish comic1 before comic2.

The canonical handoff keeps its existing identity `libfile_b40550a56110819197ad1ffa78ce2e9c`. Update it after each checkpoint. Private review/originals stay outside git; QA contains no comic pixels.


</details>

<a id="archive-handoff-2-79-127-md"></a>

<details>
<summary>HANDOFF-2.79.127.md — historical checkpoint</summary>

# Test127 — atomic speech ownership; no APK

The upper army frame previously contained a truncated command balloon belonging to the cavalry frame below. Independent source tails now agree on its lower owner; the full body, lettering, colored rim and edge move together. The lower canvas expands to keep the balloon complete. The upper frame becomes one complete pop-out. The lower four-frame group remains oversized and rejected.

Bulk56 task remains in progress:3 originals repaired,53 remain.34 singles+6 justified pairs cover46/99 originals in40 accepted pop-outs. Preserve all39 earlier accepted pop-outs. Runtime repair uses source enclosure and tail evidence; no comic identity, page, text, hash, stored crop or audit assignment selects pixels.

No APK, Gradle or Android workflow. Source publication targets Test_Branch only. Native local review is distinct from phone acceptance. Automatic playback and its timing slider remain planned.

Private replay checkpoint supplies current audit, source hashes, native replay records and validation receipts. Prior Test126 checkpoint:libfile_4a8ca90c2fb08191bc096c1ab3ed32e9. Canonical handoff:libfile_b40550a56110819197ad1ffa78ce2e9c. Read docs/evidence/validation/TEST127-VALIDATION.json for completed checks and publication.


</details>

<a id="archive-handoff-2-79-128-md"></a>

<details>
<summary>HANDOFF-2.79.128.md — historical checkpoint</summary>

# Test128 — ornate training inset; no APK

Reader10 now provides one complete gold-rimmed training inset. Four long chromatic rails identify the source enclosure. Two source ink/palette witnesses agree on the outward collar paths and complete local corner ornaments. All owned art, captions and dialogue remain within the native Reader crop. The underlying tribal challenge remains unresolved and adds no accepted coverage.

35 singles +6 justified pairs cover47/99 originals in41 accepted pop-outs;52 remain. Bulk56 task remains IN PROGRESS:4 repaired,52 remaining. All56 earlier native PNGs and metadata remain byte-identical; all40 earlier accepted pop-outs are preserved. Private native tap, final overlay and source evidence are checkpointed. No comic identity, page, title, text, hash, stored crop or review assignment selects runtime pixels.

Publish source to bdredenbach/Nth-Shelf Test_Branch only. No APK, Gradle or Android workflow. Test128/future28056/frametest128 are configuration only. Latest delivered APK Test124. Native acceptance is distinct from phone readability; automatic playback and timing slider remain planned.

Continue the same authorized task on52 remaining originals in comic1. Default one complete original; at most two adjacent consecutive originals only for immediate continuity or shared composition. Finish comic1 before comic2. Canonical rules handoff remains libfile_b40550a56110819197ad1ffa78ce2e9c. See docs/evidence/validation/TEST128-VALIDATION.json for checks/publication receipts.


</details>

<a id="archive-handoff-2-79-129-md"></a>

<details>
<summary>HANDOFF-2.79.129.md — historical checkpoint</summary>

# Test129 — source ownership checkpoint; no APK

Reader10 now has a complete ornate training inset and a separate surrounding tribal challenge scene. Paired source palette/ink collars recover the lower-left ornament tip and attached rim missed in Test128. The earlier Test128 corner claim is corrected explicitly; its crop changes deliberately. Reader24 retains its earlier inset and replaces its rejected whole-page enclosure with the adjacent throne/lower-conversation pair. A continuous foreground figure and immediate dialogue justify those two originals; the earlier inset footprint is excluded.

36 singles +7 justified pairs cover50/99 originals in43 accepted pop-outs;49 remain. Bulk56 task is IN PROGRESS:7 repaired,49 remaining.55 of57 earlier native crops and metadata are byte-identical. All40 earlier accepted displays outside the corrected ornate inset are untouched. Two old selections change: the inset boundary and a previously rejected enclosure. Native source/tap/final-overlay evidence is private. Runtime pixels come from source proofs; no comic identity, page, title, text, hash, stored crop or audit assignment selects them.

Publish to bdredenbach/Nth-Shelf Test_Branch only. No APK, Gradle or Android workflow. Test129/future28057/frametest129 are configuration only. Latest delivered APK remains Test124. Native acceptance is distinct from phone readability; automatic playback and timing slider remain planned.

Continue all49 remaining originals in comic1. Default one complete original; at most two adjacent consecutive originals only for immediate continuity or shared composition. Finish comic1 before comic2. Canonical handoff: libfile_b40550a56110819197ad1ffa78ce2e9c. See docs/evidence/validation/TEST129-VALIDATION.json for checks and publication receipts.

Published runtime source d94c57d7efc82b698f37c40152ff782aae174dd7; tested tree077157542d8878be03ec1a524518983f1f58e429.160 retained suites and syntax passed. Saved review libfile_2e1773bba9d881918eab2614dd892f5e, audit libfile_bf93e000e7808191963e9e7c89059413, replay libfile_773576ee886881918c955e64cc88c1a6; canonical handoff version11. Bulk task remains IN PROGRESS.


</details>

<a id="archive-handoff-2-79-130-md"></a>

<details>
<summary>HANDOFF-2.79.130.md — historical checkpoint</summary>

# Test130 — excluded speech and saved-map ownership; no APK

Reader9 now has a complete court-frame single. The existing chromatic source proof rejected the lower-frame balloon; exact source replay and two body/tail witnesses prevent Reader crop repair from restoring its fragment. Pixels outside the excluded body stay intact; no lettering or frame identity chooses ownership.

Saved-map serialization had duplicated the earlier inset anchor object on Reader24. Source geometry remained unchanged, but a Reader ownership wrapper lost the live earlier owner context. Test130 restores matching live owner references once per owner array and delegates unrelated owners. The earlier accepted inset now stays byte-identical with both live and serialized maps.

37 singles+7 justified pairs=51/99 originals;48 remain.44 qualifying pop-outs /58 selections. Bulk56 task IN PROGRESS:8 repaired,48 remaining. All43 earlier accepted crops and57 of58 earlier PNGs+metadata unchanged; only rejected Reader9 S1 changes.312 stored maps /1346 descriptors remain unchanged. Native acceptance differs from phone readability. Automatic playback/timing slider remain planned.

Publish source to bdredenbach/Nth-Shelf Test_Branch only. No APK, Gradle or Android workflow dispatch. Test130/future28058/frametest130 are configuration only; latest delivered APK Test124. Finish comic1 before comic2. Default complete single; max2 adjacent consecutive originals for immediate action/dialogue or shared composition. Canonical handoff libfile_b40550a56110819197ad1ffa78ce2e9c; see docs/evidence/validation/TEST130-VALIDATION.json for checks and saved receipts.

Published runtime f06ab403bfaf36b3d177eaafbf5f7c001d75ce27; tested treec636fcaac26c9750f0482576ea0875d73ed7ac09.163 retained suites+syntax passed. Saved review libfile_713a0e9c1ca081919f3b568c02386a11, audit libfile_19fc89360fac81918fe6a6bdf905e8c4, replay libfile_97adf787439881919a76b859f0fa669c; canonical handoff version12. Bulk task IN PROGRESS.


</details>

<a id="archive-handoff-2-79-131-md"></a>

<details>
<summary>HANDOFF-2.79.131.md — historical checkpoint</summary>

# Test131 source checkpoint — bulk task in progress

Reader23's upper battle pop-out previously contained a clipped balloon from a lower reaction inset. Exact raw paper-cell replay, stable lettered-body extraction and two exclusive source-tail witnesses now transfer the entire balloon to its lower owner. The middle group still contains three originals and is rejected. Discovery maps are unchanged; the same ownership controls display and taps.

38 singles +7 immediate-continuity pairs cover52 of99 originals in comic1.45 qualifying steps,47 unresolved originals. The authorized56-frame bulk task has repaired9 and remains in progress. Preserve the standing default of one complete original, with at most two adjacent consecutive originals only for immediate action/dialogue or continuous composition. Continue comic1 before comic2.

All164 retained suites and JavaScript syntax checks passed. The inherited cache checker invocation was corrected to Test131 and the remainder resumed on unchanged runtime. All24 verified source pages /58 actual native overlays replayed. All44 earlier accepted crops are byte-identical; only Reader23 S1/S2 change, and all58 geometry/tap/display metadata entries are unchanged.1,066 whole-body taps are exclusive;1,577,368 non-body ownership pixels are unchanged.312 maps /1346 descriptors unchanged. The other three eligible source pages are unchanged.

No APK, Gradle or Android workflow dispatch. Test131 version configuration only; latest delivered APK Test124. Phone acceptance of this source checkpoint and automatic playback/timing remain pending. No original comic pixels or private review coordinates are committed. Read docs/evidence/validation/TEST131-VALIDATION.json and the private replay checkpoint for evidence and the exact47-frame queue.


</details>

<a id="archive-handoff-2-79-132-md"></a>

<details>
<summary>HANDOFF-2.79.132.md — historical checkpoint</summary>

# Test132: complete foreground-cap ownership

Reader18 S4 now preserves the complete rounded forehead of the right En portrait and the adjacent standing-silhouettes dialogue. A source-witnessed paper-gutter opening, two independently closed ink arches, exact source-cell replay and exclusive lower continuity assign the entire cap to its lower owner. Reader canvas bounds include the validated extension; discovery descriptors stay unchanged. Reader18 S3 sheds the foreign cap but remains rejected for upper-strip contamination.

38 singles +8 immediate-continuity pairs cover54/99 originals.46 qualifying steps;45 originals remain. The authorized56-original bulk task has repaired11 and remains in progress. Default one complete original; at most two adjacent consecutive originals with immediate continuity. Finish comic1 before comic2.

All166 retained suites and111 JavaScript syntax checks passed on final source, including source-less/failed-canvas fallback controls. All24 verified originals/58 native overlays replayed. All45 earlier accepted crops and56/58 total PNGs are byte-identical. All1,592 cap taps select the lower owner;3,106,040 ownership pixels outside the cap remain unchanged. Saved-map rehydration, repeated cache, changed-source rejection and restored-source behavior pass. Across312 maps/1346 descriptors, only Reader18 is source-eligible. Its fresh full detector replay preserves all five descriptors. No fresh full312-page source replay is claimed.

No APK, Gradle or workflow dispatch. Version132 configuration only; latest delivered APK Test124. Phone readability and automatic playback/timing remain pending. Original comic pixels stay out of Git/CI. Read docs/evidence/validation/TEST132-VALIDATION.json and the private replay checkpoint.


</details>

<a id="archive-handoff-2-79-133-md"></a>

<details>
<summary>HANDOFF-2.79.133.md — historical checkpoint</summary>

# Test133: complete punch and caption-gutter ownership

Reader18 S3 now contains one complete wide-punch original and both complete captions. Two source-witnessed paper paths separate the upper-strip leak; a stable lettered rectangular caption retains its entire chromatic rim and long supported dark border. Transferred upper-neighbor pixels belong exclusively to their independently source-replayed upper owner. Discovery descriptors remain unchanged. The upper S5 group still contains three originals and is rejected.

39 singles +8 immediate-continuity pairs cover55/99 originals.47 qualifying steps;44 originals remain. The authorized56-original bulk task has repaired12 and remains in progress. Default one complete original; at most two adjacent consecutive originals with immediate continuity. Finish comic1 before comic2.

All168 retained suites and112 JavaScript syntax checks passed on final source. Generated tests include17 positive/negative/fallback cases and3 actual Reader canvas checks. All24 verified originals/58 native overlays replayed in isolated six-page batches. All46 previously accepted crops and56/58 total PNGs are byte-identical. All3,091 transferred-pixel taps select the upper owner;4,593 caption pixels and3,107,818 non-transfer ownership pixels remain unchanged. Source/proof mismatches, missing canvas and unavailable source fail closed. Across312 stored maps/1346 descriptors, only Reader18 is source-eligible; fresh full Reader18 detection retains all five descriptors. No fresh312-page detector sweep claimed.

No APK, Gradle or Android workflow dispatch. Version133 configuration only; latest delivered APK Test124. Phone readability and automatic playback remain pending. Original comic pixels stay out of Git/CI. See docs/evidence/validation/TEST133-VALIDATION.json and the private replay checkpoint.


</details>

<a id="archive-handoff-2-79-134-md"></a>

<details>
<summary>HANDOFF-2.79.134.md — historical checkpoint</summary>

# Test134: complete page-edge rail cell

Two independently thresholded source-ink rails start at the page edge and close against chromatic matte. The native source independently replays the original parent at 900 pixels and derives the new cell at 1800 pixels. Whole bright crossing components, their holes and bounded source-ink collars remain indivisible. Persisted binary witnesses reconstruct the rails, closing rim, annotations and contour; forged geometry or inconsistent witnesses fail closed. The rejected broad parent is not a competing crop or tap owner.

40 singles + 8 immediate-continuity pairs cover 56/99 originals. 48 qualifying steps; 43 originals remain. The authorized 56-original bulk task has repaired 13 and remains in progress. Default one complete original; at most two adjacent consecutive originals with immediate continuity. Finish comic1 before comic2.

All 170 retained suites and 113 JavaScript syntax checks pass. All 24 verified originals and 58 native overlays replayed in isolated six-page batches. All 47 earlier accepted crops and 57/58 total PNGs are byte-identical. Reader6 S1 now selects only the complete narrow upper-left original, including both balloons and projecting SFX. A thin incidental dark/teal collar around the final glyph remains where adjoining source ink touches; this was visually reviewed. All earlier accepted crops remain exact.

Across 312 stored maps and 1,346 descriptors, only Reader6 is source-eligible. Its rejected proof68 whole-page envelope is replaced by one proof79 narrow cell; the other 1,345 descriptor records are unchanged. Fresh full Reader6 detection matches the independently source-replayed proof exactly. No full 312-page fresh detector sweep is claimed.

No APK, Gradle or Android workflow dispatch. Version configuration only; latest delivered APK Test124. Phone readability and automatic playback remain pending. Original comic pixels stay out of Git/CI. See docs/evidence/validation/TEST134-VALIDATION.json and the private replay checkpoint.


</details>

<a id="archive-handoff-2-79-135-md"></a>

<details>
<summary>HANDOFF-2.79.135.md — historical checkpoint</summary>

# Test135: complete upper cavern paper cell

A nearly full-width source-paper seam must account for every interruption. Two independent white thresholds and two morphological openings must agree on enclosed, lettered speech bodies with downward tails. Small crossing foreground tips require independently closed dark rims and an enclosed non-dark interior. The repaired mask only subtracts from prior upper ownership, preserves all peer masks, and suppresses old forced taps in excluded regions. Canvas bounds shrink only for a source-replayed result bound to the exact current owner list and source image.

41 singles + 8 immediate-continuity pairs cover 57/99 originals. 49 qualifying steps; 42 originals remain. The authorized 56-original bulk task has repaired 14 and remains in progress. Default one complete original; at most two adjacent consecutive originals with immediate continuity. Finish comic1 before comic2.

All 172 retained suites and 114 JavaScript syntax checks pass. All 24 verified originals and 58 native overlays replayed in isolated six-page batches. All 48 earlier accepted crops and 57/58 total PNGs are byte-identical. Reader18 S5 now contains exactly the complete top cavern original, including its own three-balloon exchange. Whole crossing second-row speech and the small weapon tip are excluded without clipping the visible cavern artwork. The accepted punch, lower pair and all earlier accepted crops remain exact.

Across 312 stored maps and 1,346 descriptors, only Reader18 is source-eligible. All discovery descriptors remain unchanged, including the Test134 page-edge cell. Fresh full Reader18 detection matches all five saved descriptors. No fresh full 312-page detector sweep is claimed.

No APK, Gradle or Android workflow dispatch. Version configuration only; latest delivered APK Test124. Phone readability and automatic playback remain pending. Original comic pixels stay out of Git/CI. See docs/evidence/validation/TEST135-VALIDATION.json and the private replay checkpoint.


</details>

<a id="archive-handoff-2-79-136-md"></a>

<details>
<summary>HANDOFF-2.79.136.md — historical checkpoint</summary>

# Test136: complete round general reaction and atomic lettering

Native source-ink frontier tracing establishes a closed reaction rim. Stable whole foreground components preserve the speech body, protruding colored letters and detached punctuation as atomic ownership. Stored witnesses reconstruct the contour and must match a fresh current-source analysis plus the genuine prior-owner replay before display or taps. Invalid, unavailable-source and off-map children are quarantined. Pages without this child family delegate before requesting image context.

42 singles + 8 immediate-continuity pairs cover 58/99 originals. 50 qualifying steps; 41 originals remain. The authorized 56-original bulk task has repaired 15 and remains in progress. Default one complete original; at most two adjacent consecutive originals with immediate continuity. Finish comic1 before comic2.

All 173 retained suites and 115 JavaScript syntax checks pass. All 24 verified originals and 59 native overlays replayed in isolated six-page batches. All 49 earlier accepted crops and 58/59 total PNGs are byte-identical. Reader23 S4 isolates the complete round reaction original, including its full source-ink rim, the whole white speech body, all protruding colored lettering and disconnected punctuation. All 58 previous PNGs and all 49 accepted crops and metadata remain exact. The prior broad middle selection remains rejected; Reader23 F2 and F4 are still unresolved.

Across 312 stored maps and 1,346 descriptors, four maps are structurally source-eligible. All four available original images were tested: only comic1 Reader23 adds one child; the three later-issue images abstain. Fresh full Reader23 detection matches the four saved descriptors exactly, with its three original descriptors unchanged. No fresh full 312-page detector sweep is claimed.

No APK, Gradle or Android workflow dispatch. Version configuration only; latest delivered APK Test124. Phone readability and automatic playback remain pending. Original comic pixels stay out of Git/CI. See docs/evidence/validation/TEST136-VALIDATION.json and the private replay checkpoint.


</details>

<a id="archive-handoff-2-79-137-md"></a>

<details>
<summary>HANDOFF-2.79.137.md — historical checkpoint</summary>

# Test137: separate complete eye-sword inset and lightning scene

Two independent source-ink thresholds must agree on a chromatic closure bounded by exterior paper. The actual prior frontier owner is replayed from the current source, then persisted witnesses reconstruct the full upper inset. Reader uses that one certified mask both to expose the new single and remove it from the old broad donor, leaving all other display ownership exact. Malformed, off-map, unavailable-source and stale children are quarantined; current owner/source cache guards survive in-place mutation and interrupted navigation. The existing page-edge family receives the same quarantine hardening, with its valid geometry/proof unchanged and no additional coverage credit. Restored local-boundary proofs are fully reconstructed once, then their evidence and contours are frozen and safely cached exactly as newly discovered proofs; changed box or identity is still checked on every hit.

44 singles + 8 immediate-continuity pairs cover 60/99 originals. 52 qualifying steps; 39 originals remain. The authorized 56-original bulk task has repaired 17 and remains in progress. Default one complete original; at most two adjacent consecutive originals with immediate continuity. Finish comic1 before comic2.

All 178 retained suites and 116 JavaScript syntax checks pass. All 24 verified originals and 60 native overlays replayed in isolated six-page batches. All 50 earlier accepted crops and 58/60 total PNGs are byte-identical. One shared source-boundary repair produces two complete singles: Reader7 S3 upper eye/sword and S1 Baal/lightning/baby. The full upper speech and sound effect remain; the right foreground weapon head, hand and long diagonal shaft are complete. Every right-scene pixel below the upper inset is unchanged. All 50 earlier accepted crops and metadata remain exact, including the left slash portrait and Reader6 page-edge cell.

Across 312 stored maps and 1,347 descriptors, only Reader7 is eligible for the new inset rule. Fresh full Reader7 detection preserves both prior descriptors and appends exactly one source-replayed child. Fresh full Reader6 detection and its accepted proof remain unchanged. No fresh full 312-page detector sweep is claimed.

No APK, Gradle or Android workflow dispatch. Version configuration only; latest delivered APK Test124. Phone readability and automatic playback remain pending. Original comic pixels stay out of Git/CI. See docs/evidence/validation/TEST137-VALIDATION.json and the private replay checkpoint.


</details>

<a id="archive-handoff-2-79-138-md"></a>

<details>
<summary>HANDOFF-2.79.138.md — historical checkpoint</summary>

# Test138: complete right court portrait with projecting crown

Four chromatic rail flanks and a bounded interrupted top rail identify an independent tall source cell. A separately proven chromatic enclosure authenticates the source palette and earlier ownership. Two source thresholds must agree on the outward crown silhouette; source ink collars and whole paper-body ownership retain the complete portrait. Persisted witnesses reconstruct the geometry, and current source/owner replay gates actual Reader display, taps and zoom. The new child subtracts earlier displayed ownership at shared borders; malformed, missing-source and off-map children cannot fall back to rectangles.

45 singles + 8 immediate-continuity pairs cover 61/99 originals. 53 qualifying steps; 38 originals remain. The authorized 56-original bulk task has repaired 18 and remains in progress. Default one complete original; at most two adjacent consecutive originals with immediate continuity. Finish comic1 before comic2.

All 179 retained suites and 117 JavaScript syntax checks pass. All 24 verified originals and 61 native overlays replayed in isolated six-page batches. All 52 earlier accepted crops and 60/61 total PNGs are byte-identical. Reader9 S2 is the complete right portrait with its projecting crown and whole speech. Source-supported silhouette closure preserves the visible lower hand and rim while excluding neighboring speech. All 52 earlier accepted crops and metadata and all 60 previous PNGs remain byte-identical.

Across 312 stored maps and 1,348 descriptors, only Reader9 is eligible. Fresh full Reader9 detection preserves the earlier central descriptor exactly and appends the one source-replayed portrait. No fresh full 312-page detector sweep is claimed.

No APK, Gradle or Android workflow dispatch. Version configuration only; latest delivered APK Test124. Phone readability and automatic playback remain pending. Original comic pixels stay out of Git/CI. See docs/evidence/validation/TEST138-VALIDATION.json and the private replay checkpoint.


</details>

<a id="archive-handoff-2-79-139-md"></a>

<details>
<summary>HANDOFF-2.79.139.md — historical checkpoint</summary>

# Test139: complete left court portrait at its oblique foreground boundary

A source-replayed chromatic enclosure and complete occluded portrait authenticate earlier ownership. Independent source thresholds trace a continuous ink collar between two tall chromatic rails, with source palette support above the oblique edge. Whole paper bodies follow collar ownership; ambiguous bodies and neighboring owners are excluded. Persisted witnesses reconstruct geometry, and current source and owner replay gates display, taps and zoom. Earlier child zooms retain their original owner context across asynchronous work without overwriting newer navigation.

46 singles + 8 immediate-continuity pairs cover 62/99 originals. 54 qualifying steps; 37 originals remain. The authorized 56-original bulk task has repaired 19 and remains in progress. Default one complete original; at most two adjacent consecutive originals with immediate continuity. Finish comic1 before comic2.

All 180 retained suites and 118 JavaScript syntax checks pass. All 24 verified originals and 62 native overlays replayed in isolated six-page batches. All 53 earlier accepted crops and 61/62 total PNGs are byte-identical. Reader9 S3 retains the complete left portrait and whole speech, following the source ink collar where foreground artwork occludes its lower edge. All 53 earlier accepted crops and metadata and all 61 previous PNGs remain byte-identical.

Across 312 stored maps and 1,349 descriptors, only Reader9 is eligible. Fresh full Reader9 detection preserves the two earlier court descriptors exactly and appends one source-replayed left portrait. No fresh full 312-page detector sweep is claimed.

No APK, Gradle or Android workflow dispatch. Version configuration only; latest delivered APK Test124. Phone readability and automatic playback remain pending. Original comic pixels stay out of Git/CI. See docs/evidence/validation/TEST139-VALIDATION.json and the private replay checkpoint.


</details>

<a id="archive-handoff-2-79-140-md"></a>

<details>
<summary>HANDOFF-2.79.140.md — historical checkpoint</summary>

# Test140: complete lower court composition with whole crossing dialogue

Three source-authenticated upper enclosures establish the prior ownership. Opposite margins certify a smooth row-varying backdrop above a source-derived horizon. Independent background-relative thresholds recover bounded attached foreground and whole paper bodies; strong interior separators, disconnected caps and ambiguous ownership reject multi-scene results. Conservative integer margins preserve scaled border exclusion. Persisted witnesses reconstruct geometry, and current image/owner replay gates display, taps and zoom. Earlier owner contexts and asynchronous navigation remain intact.

47 singles + 8 immediate-continuity pairs cover 63/99 originals. 55 qualifying steps; 36 originals remain. The authorized 56-original bulk task has repaired 20 and remains in progress. Default one complete original; at most two adjacent consecutive originals with immediate continuity. Finish comic1 before comic2.

All 181 retained suites and 119 JavaScript syntax checks pass. All 24 verified originals and 63 native overlays replayed in isolated six-page batches. All 54 earlier accepted crops and 62/63 total PNGs are byte-identical. Reader9 S4 retains the complete lower court scene, whole owned dialogue above the source horizon, foreground figure and floor. All 54 earlier accepted crops and metadata and all 62 previous PNGs remain byte-identical. Reader9 now has four complete original singles.

Across 312 stored maps and 1,350 descriptors, only Reader9 is eligible. Fresh full Reader9 detection preserves the three earlier court descriptors exactly and appends one source-replayed lower composition. No fresh full 312-page detector sweep is claimed.

No APK, Gradle or Android workflow dispatch. Version configuration only; latest delivered APK Test124. Phone readability and automatic playback remain pending. Original comic pixels stay out of Git/CI. See docs/evidence/validation/TEST140-VALIDATION.json and the private replay checkpoint.


</details>

<a id="archive-handoff-2-79-141-md"></a>

<details>
<summary>HANDOFF-2.79.141.md — historical checkpoint</summary>

# Test141: shared upper warning pair and complete lower relic scene

Two adjacent closed upper rims and one whole pale component across their shared gap are independently certified under two source thresholds. Accounted-for rim interruptions and independently traced side boundaries retain the complete shared composition. One continuous lower foreground reaching three page edges forms a separate original after the upper pair is excluded. Additional closed insets and full-span lower dividers reject. Persisted source evidence reconstructs both masks and shared-body geometry, while current-image and exact-owner replay gates actual Reader display, taps and zoom. Invalid, incomplete, off-map or stale children have no rectangular fallback.

48 singles + 9 immediate-continuity pairs cover 66/99 originals. 57 qualifying steps; 33 originals remain. The authorized 56-original bulk task has repaired 23 and remains in progress. Default one complete original; at most two adjacent consecutive originals with immediate continuity. Finish comic1 before comic2.

All 183 retained suites and 120 JavaScript syntax checks pass. All 24 verified originals and 65 native overlays replayed in isolated six-page batches. All 55 earlier accepted crops and 63/65 total PNGs are byte-identical. One shared source-boundary repair yields Reader22 S1 as a complete immediate-continuity upper pair and S2 as one complete lower relic original. The round reflection stays part of the lower object. All 55 earlier accepted crops and metadata and all 63 previous PNGs remain byte-identical. Reader22 is fully covered.

Across 312 stored maps and 1,351 descriptors, 23 empty maps are eligible. All 11 available Apocalypse sources among those were checked in the private candidate audit; only Reader22 adds two children. Twelve other source originals are unavailable and explicitly untested. Fresh full Reader22 detection matches the expected two source-replayed selections. No full 312-source detector sweep is claimed.

No APK, Gradle or Android workflow dispatch. Version configuration only; latest delivered APK Test124. Phone readability and automatic playback remain pending. Original comic pixels stay out of Git/CI. See docs/evidence/validation/TEST141-VALIDATION.json and the private replay checkpoint.


</details>

<a id="archive-handoff-2-79-142-md"></a>

<details>
<summary>HANDOFF-2.79.142.md — historical checkpoint</summary>

# Test142: complete second-row dialogue singles

A source-derived paper seam separates two residual strips beneath an already certified upper composition. Complete speech enclosures and tails are assigned by their connected source geometry, with bounded inherited edge support and contracted speech-rim ownership. The coupled partition yields two complete singles. Existing accepted masks are excluded exactly. Persisted classified evidence is replayed, and live image, owner sequence, proof identity and contour bounds are checked before actual Reader display, taps or zoom. Scoped accepted-owner delegation preserves the cache while older wrappers narrow their own context; invalid or stale children have no rectangular fallback. The Reader cache observes both source URLs, intrinsic/render dimensions, readiness and load/error generation, including same-object reloads; any change requires fresh source replay.

50 singles + 9 immediate-continuity pairs cover 68/99 originals. 59 qualifying steps; 31 originals remain. The authorized 56-original bulk task has repaired 25 and remains in progress. Default one complete original; at most two adjacent consecutive originals with immediate continuity. Finish comic1 before comic2.

All 187 retained suites and 121 JavaScript syntax checks pass. All 24 verified originals and 67 native overlays replayed in isolated six-page batches. All 57 earlier accepted crops and 65/67 total PNGs are byte-identical. One coupled paper-seam and speech-ownership repair reconstructs two separate complete second-row originals. Both are independently selectable. All 57 earlier accepted crops and metadata and all 65 previous PNGs remain byte-identical. Reader18 is fully covered.

Across 312 stored maps and 1,353 descriptors, only Reader18 is source-eligible. Fresh full Reader18 detection matches the expected seven selections. All other stored maps are unchanged; no full 312-source detector sweep is claimed.

No APK, Gradle or Android workflow dispatch. Version configuration only; latest delivered APK Test124. Phone readability and automatic playback remain pending. Original comic pixels stay out of Git/CI. See docs/evidence/validation/TEST142-VALIDATION.json and the private replay checkpoint.


</details>

<a id="archive-handoff-2-79-143-md"></a>

<details>
<summary>HANDOFF-2.79.143.md — historical checkpoint</summary>

# Test143: complete reaction inset and collapse scene

Circle votes propose a source region; independent visible-ink frontier measurements certify its clipped round boundary. A separately enclosed lettered speech component must survive two intensity thresholds and point to the circle with a substantial downward tail. The complete body, lettering and tail remain indivisible. Exact source-replayed parent owners authenticate subtraction of both inset masks from one unique host, preserving the other accepted owners. Persisted local intensity witnesses reconstruct contours and source ownership. Actual Reader display, taps and zoom require the live image and exact owner family; malformed or off-map children have no rectangular fallback. The existing shared-rim Reader guard also gains source lifecycle invalidation without changing its discovery, proof geometry, descriptors or accepted pixels. The round-speech cache observes both source URLs, intrinsic/render dimensions, readiness and load/error generation; every source change replays the image and resets host-subtraction caches.

52 singles + 9 immediate-continuity pairs cover 70/99 originals. 61 qualifying steps; 29 originals remain. The authorized 56-original bulk task has repaired 27 and remains in progress. Default one complete original; at most two adjacent consecutive originals with immediate continuity. Finish comic1 before comic2.

All 193 retained suites and 122 JavaScript syntax checks pass. All 24 verified originals and 68 native overlays replayed in isolated six-page batches. All 59 earlier accepted crops and 66/68 total PNGs are byte-identical. One source boundary repair certifies the round reaction and subtracts both complete inset owners from the middle scene. This yields two newly qualifying singles. All 59 previously accepted crops and metadata remain exact; only the previously rejected middle crop changes and the new round selection appends. Reader23 is fully covered. The new inset has zero ownership overlap. Previously accepted owner overlaps remain unchanged, while 246,526 old host/general-inset overlap pixels are removed.

Across 312 stored maps and 1,355 descriptors, 23 maps are eligible. The candidate audit checked all 12 then-available Apocalypse sources, including a negative Reader22 reflection, and only Reader23 added one child. Reader22 is no longer eligible after Test141; the other 11 available source outcomes remain applicable. Twelve other source originals were unavailable and explicitly untested. Fresh full Reader23 detection matches the five-selection map; no full 312-source sweep is claimed.

No APK, Gradle or Android workflow dispatch. Version configuration only; latest delivered APK Test124. Phone readability and automatic playback remain pending. Original comic pixels stay out of Git/CI. See docs/evidence/validation/TEST143-VALIDATION.json and the private replay checkpoint.


</details>

<a id="archive-handoff-2-79-144-md"></a>

<details>
<summary>HANDOFF-2.79.144.md — historical checkpoint</summary>

# Test144: complete adjacent dialogue pair

Independent chromatic and ink rails establish the boundaries of two adjacent cells connected by one indivisible lettered speech chain. A separately closed lower foreground cap excludes the next original. All mostly owned companion speech bodies remain whole, including their tiny tails. Persisted classified-source witnesses reconstruct rails, bodies, cap and contours. Exact live-source replay authenticates replacement of the unique broad parent, retaining the accepted owner. Display, taps and zoom require the current owner sequence and live source. Both source URLs, dimensions, readiness and load/error generation invalidate caches; warm use does not reread pixels. Trusted accepted-owner delegation survives nested earlier wrappers. The old broad parent remains only as authenticated ancestry and cannot receive a tap.

52 singles + 10 immediate-continuity pairs cover 72/99 originals. 62 qualifying steps; 27 originals remain. The authorized 56-original bulk task has repaired 29 and remains in progress. Default one complete original; at most two adjacent consecutive originals with immediate continuity. Finish comic1 before comic2.

All 197 retained suites and 123 JavaScript syntax checks pass. All 24 verified originals and 68 native overlays replayed in isolated six-page batches. All 61 earlier accepted crops and 67/68 total PNGs are byte-identical. The previous rejected broad region is replaced in the same selection slot by one complete dialogue pair. Both originals share immediate dialogue and a connected speech chain. All 61 earlier accepted crops and metadata remain exact. The upper scene remains unchanged; the tall portrait and lower attack are still pending.

Across 312 stored maps and 1,356 descriptors, only Reader11 is eligible. Fresh complete Reader11 detection matches the replacement map. No full 312-source sweep is claimed.

No APK, Gradle or Android workflow dispatch. Version configuration only; latest delivered APK Test124. Phone readability and automatic playback remain pending. Original comic pixels stay out of Git/CI. See docs/evidence/validation/TEST144-VALIDATION.json and the private replay checkpoint.


</details>

<a id="archive-handoff-2-79-145-md"></a>

<details>
<summary>HANDOFF-2.79.145.md — historical checkpoint</summary>

# Test145: complete capped-rim baby-hand cell

Three exterior matte sides and an independently witnessed shared ink rim identify a complete cell. Source-profile discontinuities discover the cap endpoints; a continuous supported path joins them. Crossing bright bodies remain indivisible. Two source classifications and authenticated accepted-owner ancestry reconstruct every persisted contour. Current image and exact owner context authenticate display, taps and native zoom. Both image URLs, dimensions, readiness and load/error generation invalidate cache trust; warm taps do not reread pixels. Malformed source objects are quarantined before older-owner delegation. The new Reader guard remains outside its page-edge ancestor, and public loaders preserve indexed dependency order. The existing round atomic inset Reader guard now also tracks independent source URLs, intrinsic/render dimensions, readiness, load/error generation, exact owner sequence and descriptor signatures. Malformed version/method/type markers remain inside its rejecting guard. Its earlier-owner calls delegate to their existing guards; this change makes no claim about those guards' own lifecycle behavior. Discovery and proof geometry are byte-identical.

53 singles + 10 immediate-continuity pairs cover 73/99 originals. 63 qualifying steps; 26 originals remain. The authorized 56-original bulk task has repaired 30 and remains in progress. Default one complete original; at most two adjacent consecutive originals with immediate continuity. Finish comic1 before comic2.

All 208 retained suites and 124 JavaScript syntax checks pass. All 24 verified originals and 69 native overlays replayed in isolated six-page batches. All 62 earlier accepted crops and 68/69 total PNGs are byte-identical. One complete single appends after the unchanged upper-left owner. All 62 earlier accepted crops and metadata and all 68 previous PNGs remain exact. Reader6 still has five originals remaining. The earlier round atomic inset also receives Reader-only source lifecycle hardening; its discovery, geometry and all five Reader23 native crops remain unchanged.

Across 312 stored maps and 1,356 descriptors, only Reader6 is eligible for the new source-rim family. Fresh full Reader6 and Reader23 detection match their expected maps. The proof80 correction changes only its Reader guard; no full 312-source sweep is claimed.

No APK, Gradle or Android workflow dispatch. Version configuration only; latest delivered APK Test124. Phone readability and automatic playback remain pending. Original comic pixels stay out of Git/CI. See docs/evidence/validation/TEST145-VALIDATION.json and the private replay checkpoint.


</details>

<a id="archive-handoff-2-79-146-md"></a>

<details>
<summary>HANDOFF-2.79.146.md — historical checkpoint</summary>

# Test146: complete rounded crowd strip

Paper-backed lower ink runs, a parallel upper seam and independently supported side rims identify a complete rounded strip. Two source classifications must agree on the complete contour. Whole interiors retain artwork and lettering. Authenticated accepted-owner ancestry prevents overlap, while the earlier broad envelope supplies context without receiving new frame credit. Display, taps and zoom replay the exact child against its current source and owners. Both image URLs, intrinsic and rendered dimensions, readiness and load/error generation bind the cached source; warm interactions do not reread pixels.

54 singles + 10 immediate-continuity pairs cover 74/99 originals. 64 qualifying steps; 25 originals remain. The authorized 56-original bulk task has repaired 31 and remains in progress. Default one complete original; at most two adjacent consecutive originals with immediate continuity. Finish comic1 before comic2.

All 212 retained suites and 126 JavaScript syntax checks pass. All 24 verified originals and 70 native overlays replayed in isolated six-page batches. All 63 earlier accepted crops and 69/70 total PNGs are byte-identical. The full rounded crowd strip appends as one single. All 63 earlier accepted crops and metadata and all 69 previous PNGs remain exact. Reader 12 has two original attack frames remaining.

Across 312 stored maps and 1,357 descriptors, 25 maps meet ancestry eligibility. All 13 available original sources were checked; only Reader12 adds a new strip. The other 12 eligible source images are unavailable and explicitly untested. Reader22 is no longer eligible after its accepted warning/relic repair. Fresh full Reader12 detection matches the expected map; this is not a full 312-source sweep.

No APK, Gradle or Android workflow dispatch. Version configuration only; latest delivered APK Test124. Phone readability and automatic playback remain pending. Original comic pixels stay out of Git/CI. See docs/evidence/validation/TEST146-VALIDATION.json and the private replay checkpoint.


</details>

<a id="archive-handoff-2-79-147-md"></a>

<details>
<summary>HANDOFF-2.79.147.md — historical checkpoint</summary>

# Test147: complete shared-seam attack singles

A source-connected exterior and complete accepted inset establish the upper barrier. An independently measured ink seam joins it to the accepted rounded strip. Exactly two substantial source components become complete independent originals, with whole speech, page-edge artwork and source-connected foreground. Two source classifications reconstruct every persisted contour. Accepted masks remain disjoint. A measured source-coverage certificate is required before the rejected broad owner can be replaced. The Reader authenticates the current source, exact owner order and hidden ancestry before display, taps and native zoom. Both URLs, intrinsic/render dimensions, readiness and load/error generation bind cache trust. Invalidated scoped zoom trust remains rejected until its scope exits and the source is replayed. Pages without this geometry family or its rounded-strip ancestry delegate immediately, avoiding repeated serialization of unrelated saved source proofs.

51 singles + 14 immediate-continuity pairs cover 79/105 originals. 65 qualifying steps; 26 originals remain. The whole-comic task has repaired 36 further originals from the corrected 62-original worklist and remains in progress. Default one complete original; at most two adjacent consecutive originals with immediate continuity. Finish comic1 before comic2.

All 218 retained suites and 128 JavaScript syntax checks pass. All 24 verified originals and 71 native overlays replayed in isolated six-page batches. All 64 earlier accepted crops and 69/71 total PNGs are byte-identical. The shared source seam separates two complete attack originals. The left deflection replaces the rejected broad selection at S3; the tall right attack appends at S5. The earlier rounded crowd strip stays at S4. All 64 earlier accepted crops and metadata remain exact, as do 69 previous PNGs; only the rejected broad S3 changes. Reader 12 is complete. The completed whole-comic inventory review corrects99 to105 originals: seven missed insets minus one overcount. Four unchanged accepted crops are relabeled as immediate-continuity pairs; the unchanged Reader8 city/feline group is rejected for insufficient continuity and both originals require separation. All64 prior accepted crop bytes and actual native interaction metadata stay exact. These classification changes add a net three historical coverage credits, distinct from the two newly repaired Reader12 originals. Current coverage is79/105 with26 remaining.

The current 312-map corpus has 1,358 descriptors before this repair. Only the Reader 12 ancestry is eligible. Fresh full Reader 12 detection must match the expected five-selection map. Source-certified retirement removes the broad envelope from selectable owners and retains it only as authenticated ancestry.

No APK, Gradle or Android workflow dispatch. Version configuration only; latest delivered APK Test124. Phone readability and automatic playback remain pending. Original comic pixels stay out of Git/CI. See docs/evidence/validation/TEST147-VALIDATION.json and the private replay checkpoint.


</details>

<a id="archive-handoff-2-79-148-md"></a>

<details>
<summary>HANDOFF-2.79.148.md — historical checkpoint</summary>

# Test148: complete chromatic side portrait

Independent bottom and side ink rims separate a complete portrait from the open lower scene. Two exterior-color thresholds retain the ragged border and bright sky even where its hue matches the gutter. Source-ink support certifies the boundary, and complete lettered thought/speech bodies stay indivisible. Persisted classifications rebuild every contour, frontier and whole-body witness. Display, taps and zoom require live source regeneration and exact earlier-owner context. Both image URLs, dimensions, readiness and load/error generation bind cached trust. A source change inside a scoped zoom invalidates that pin until exit and requires fresh replay afterward. Earlier owners retain their own context and exact native canvases.

52 singles + 14 immediate-continuity pairs cover 80/105 originals. 66 qualifying steps; 25 originals remain. The whole-comic task has repaired 37 further originals from the corrected 62-original worklist and remains in progress. Default one complete original; at most two adjacent consecutive originals with immediate continuity. Finish comic1 before comic2.

All 222 retained suites and 129 JavaScript syntax checks pass. All 24 verified originals and 72 native overlays replayed in isolated six-page batches. All 65 earlier accepted crops and 71/72 total PNGs are byte-identical. The whole side portrait appends at S3. All 65 earlier accepted crops and metadata and all 71 previous PNGs remain exact. The complete thought body and dotted tail stay with the portrait. Reader 11 has only its lower attack original remaining.

Across 312 stored maps and 1,359 descriptors, only the Reader 11 accepted upper-cell/dialogue-pair ancestry is eligible. Fresh full Reader 11 detection matches the expected three-selection map.

No APK, Gradle or Android workflow dispatch. Version configuration only; latest delivered APK Test124. Phone readability and automatic playback remain pending. Original comic pixels stay out of Git/CI. See docs/evidence/validation/TEST148-VALIDATION.json and the private replay checkpoint.


</details>

<a id="archive-handoff-2-79-149-md"></a>

<details>
<summary>HANDOFF-2.79.149.md — historical checkpoint</summary>

# Test149: complete lower attack original

Source color frontiers and an independently witnessed upper boundary distinguish a complete open lower original from its accepted neighbors. Two threshold witnesses preserve whole speech and both foreground crossings, while unexplained foreground rejects admission. Persisted source observations rebuild the exact complete contour. Current image replay and complete earlier-owner context certify display, taps and zoom; lifecycle changes invalidate cached source trust and remain invalid inside a scoped zoom until it exits. All accepted owners retain their original context and native canvases.

53 singles + 14 immediate-continuity pairs cover 81/105 originals. 67 qualifying steps; 24 originals remain. The whole-comic task has repaired 38 further originals from the corrected 62-original worklist and remains in progress. Default one complete original; at most two adjacent consecutive originals with immediate continuity. Finish comic1 before comic2.

All 226 retained suites and 130 JavaScript syntax checks pass. All 24 verified originals and 73 native overlays replayed in isolated six-page batches. All 66 earlier accepted crops and 72/73 total PNGs are byte-identical. The complete lower attack appends at S4, completing all five Reader 11 originals. All 66 earlier accepted crops and metadata and all 72 previous PNGs remain exact. The speech, raised arm and right page-edge foreground stay with this single original.

Across 312 stored maps and 1,360 descriptors, only the complete accepted Reader 11 ancestry is eligible. Fresh full Reader 11 detection matches the expected four-selection map.

No APK, Gradle or Android workflow dispatch. Version configuration only; latest delivered APK Test124. Phone readability and automatic playback remain pending. Original comic pixels stay out of Git/CI. See docs/evidence/validation/TEST149-VALIDATION.json and the private replay checkpoint.


</details>

<a id="archive-handoff-2-79-150-md"></a>

<details>
<summary>HANDOFF-2.79.150.md — historical checkpoint</summary>

# Test150: complete corner portrait and linked action scenes

Independent source ink thresholds follow an internal corner seam and a lower collar to separate a complete narrow portrait, a horizontal attack, and two adjacent action originals. Edge-connected paper corridors bound the search; source contours retain foreground crossings and whole compact dialogue bodies. Both action branches require substantial art and reject an additional divider. Exact live source ancestry certifies the replacement family and retires the two old incomplete mixed slots. Accepted geometry delegates through its original context. Source identity, dimensions, readiness, load generation and owner identity bind display, taps and asynchronous zoom. Validated private canonical evidence and exact mutable-graph guards preserve accepted caller objects, reject nested stale claims, and avoid warm proof serialization. Newly introduced child immutability cannot cross into accepted ancestry.

55 singles + 15 immediate-continuity pairs cover 85/105 originals. 70 qualifying steps; 20 originals remain. The whole-comic task has repaired 42 further originals from the corrected 62-original worklist and remains in progress. Default one complete original; at most two adjacent consecutive originals with immediate continuity. Finish comic1 before comic2.

All 229 retained suites and 131 JavaScript syntax checks pass. All 24 verified originals and 74 native overlays replayed in isolated six-page batches. All 67 earlier accepted crops and 71/74 total PNGs are byte-identical. The corner portrait and horizontal attack are two complete singles. The adjacent central duel and lower-left strike form one immediate action pair connected by the shared foreground arm and sword. All 67 earlier accepted crops and metadata remain exact. All 71 earlier unaffected PNGs remain exact; only rejected Reader 13 S2/S3 change, with new S4 appended. All six Reader 13 originals are covered.

Across 312 stored maps and 1,361 descriptors, only Reader 13 qualifies for the complete43/52/53 ancestry. Fresh full Reader 13 detection matches the expected four selections.

No APK, Gradle or Android workflow dispatch. Version configuration only; latest delivered APK Test124. Phone readability and automatic playback remain pending. Original comic pixels stay out of Git/CI. See docs/evidence/validation/TEST150-VALIDATION.json and the private replay checkpoint.


</details>

<a id="archive-handoff-2-79-151-md"></a>

<details>
<summary>HANDOFF-2.79.151.md — historical checkpoint</summary>

# Test151: complete stone-rimmed departure original

Two independent source-color thresholds identify the same bounded enclosure. Four dark-collar paths reconstruct its full articulated rim. Interior separators, ambiguous speech ownership and inconsistent paths reject the candidate. Exact current-source replay and authenticated broad ancestry certify the replacement. The broad owner is retained only as hidden ancestry and cannot remain selectable. Current Reader display, tap and zoom bind exact owner identity/order, both source URLs, natural/render dimensions, readiness and same-image load/error generation. The absent-family path returns before viewport access. Prior owners retain their original context through nested delegation; stale asynchronous navigation cannot overwrite current state.

56 singles + 15 immediate-continuity pairs cover 86/105 originals. 71 qualifying steps; 19 originals remain. The whole-comic task has repaired 43 further originals from the corrected 62-original worklist and remains in progress. Default one complete original; at most two adjacent consecutive originals with immediate continuity. Finish comic1 before comic2.

All 230 retained suites and 132 JavaScript syntax checks pass. All 24 verified originals and 74 native overlays replayed in isolated six-page batches. All 70 earlier accepted crops and 73/74 total PNGs are byte-identical. Complete departure original inside its articulated stone rim, with all dialogue, departing figure and remaining mounted foreground. All 70 earlier accepted crops and interaction metadata stay exact. The rejected broad Reader 15 S1 changes; all 73 other previous PNGs remain exact.

All 312 stored maps and 1362 prior descriptors are screened. Two source envelopes are eligible: Reader 15 replaces its rejected broad group; the available second-issue source remains unchanged. Fresh Reader 15 detection must equal the expected map. Runtime source has no book/page/title/text/hash/private-audit lookup.

No APK, Gradle or Android workflow dispatch. Version configuration only; latest delivered APK Test124. Phone readability and automatic playback remain pending. Original comic pixels stay out of Git/CI. See docs/evidence/validation/TEST151-VALIDATION.json and the private replay checkpoint.


</details>

<a id="archive-handoff-2-79-152-md"></a>

<details>
<summary>HANDOFF-2.79.152.md — historical checkpoint</summary>

# Test152: preserve authenticated taps and complete lower inset action pair

Two independently supported dark closures identify the lower inset originals within an authenticated gradient field. Atomic speech cores and the continuous crossing graphic certify the complete pair. Source-derived caption color, connected body, fringe and corner evidence excludes the external caption from the inset mask at both analysis and native resolution. Native display, taps and asynchronous zoom bind the exact ordered owner family, live source identity and dimensions, readiness and image load/error generation. Exact caller-graph guards preserve accepted ancestry and newer overlays while source-replayed canonical child and native evidence stay private and immutable. The shared Reader now preserves an authenticated on-map owner through held geometry refinement and zoom dispatch, rejecting source, owner, navigation and pending-selection changes. The page-deck render also avoids starting a duplicate detector when its own turn callback has already started the matching current-page request. The matte empty-map route now samples decoded native pixels with the established explicit bilinear sampler inside its native allocation budget. This removes browser-dependent Image downsampling from contour detection. Eleven derived color-summary statistics are refreshed for three retained owners; their geometry, contours and native crops stay unchanged.

56 singles + 16 immediate-continuity pairs cover 88/105 originals. 72 qualifying steps; 17 originals remain. The whole-comic task has repaired 45 further originals from the corrected 62-original worklist and remains in progress. Default one complete original; at most two adjacent consecutive originals with immediate continuity. Finish comic1 before comic2.

All 240 retained suites and 134 JavaScript syntax checks pass. All 24 verified originals and 74 native overlays replayed in isolated six-page batches. All 71 earlier accepted crops and 73/74 total PNGs are byte-identical. The two complete lower inset originals form one immediate action pair through the continuous crossing sound-effect graphic. Both speech bodies and the crossing outline remain intact. The external caption and adjacent Baal artwork stay excluded, with the two reviewed dark antialiased boundary samples preserved exactly. Existing rejected Reader 17 S2 is replaced; accepted S1, every other unchanged PNG and their native interaction metadata must remain exact. This repair covers F5/F6, while accepted S1 continues covering F1/F2 and F3/F4 remain pending until the separate104 integration. All 71 earlier accepted crops and native metadata, and all 73 unaffected prior PNGs, must remain exact. The three retained matte crops also remain byte-identical after deterministic sampling. Their bounds, tap points, dimensions and focus transforms remain exact; eleven source-derived proof statistics are refreshed explicitly, so complete proof-metadata byte identity is not claimed.

All 72 accepted selections also passed actual fresh-page browser mouse input, overlay open/close/repeat and navigation against the final frozen source. Browser fixtures and source hashes are recorded privately; phone acceptance remains pending. All 312 stored maps and 1362 prior descriptors are screened. Screen every retained stored map and descriptor using the current parent inventory. Only the source-authenticated Reader 17 ancestry may qualify. Fresh whole-page detection must equal the expected map and replace the rejected broad proof 55 owner with proof 99 while preserving accepted proof 34. Runtime source contains no original artwork, private map coordinates, native hashes, or book/page/title/text lookup. Fresh detection of all24 original pages is required. The deterministic sampler preserves every contour and bound;23 full detector graphs remain exact and only11 derived statistics change in the remaining three-owner graph.

Opening speed is a separate readiness requirement. Normal cold page loading and first taps remain materially slow; warm or repeat timings do not establish first-use or phone readiness. Improve and measure these paths before automatic frame mode. See the exact workflow, timings and limitations in docs/evidence/validation/TEST152-VALIDATION.json.

No APK, Gradle or Android workflow dispatch. Version configuration only; latest delivered APK Test124. Phone readability and automatic playback remain pending. Original comic pixels stay out of Git/CI. See docs/evidence/validation/TEST152-VALIDATION.json and the private replay checkpoint.


</details>

<a id="archive-handoff-2-79-153-md"></a>

<details>
<summary>HANDOFF-2.79.153.md — historical checkpoint</summary>

# Test153: complete procession and Baal action pair

Authenticated upper and lower source boundaries, connected foreground paths and substantial artwork in each branch support exactly two adjacent originals. Whole command-body and tail evidence travels with the pair. The two independently authenticated inset masks are removed, and exact native caption evidence transfers the external caption to the complementary owner. The Reader preserves the original ordered accepted family through nested delegation and guards live source identity, image readiness and generations, caller-graph mutation, pending asynchronous work and newer overlays. Canonical source replay uses private copied ancestry so no new freezing reaches accepted caller graphs. Completed native circle/speech discovery is privately reused only after exact native bytes and dimensions match. Existing source-owner replay, constructors, validation and Reader admission remain active; failed or empty other sources preserve the last successful witness. Bounded private payload and detached reconstructed evidence avoid retaining prior-owner ancestry. Byte equality uses captured intrinsic typed-array lengths; changing public getters and coercion callbacks cannot skip compared pixels.

56 singles + 17 immediate-continuity pairs cover 90/105 originals. 73 qualifying steps; 15 originals remain. The whole-comic task has repaired 47 further originals from the corrected 62-original worklist and remains in progress. Default one complete original; at most two adjacent consecutive originals with immediate continuity. Finish comic1 before comic2.

All 249 retained suites and 136 JavaScript syntax checks pass. All 24 verified originals and 75 native overlays replayed in isolated six-page batches. All 72 earlier accepted crops and 74/75 total PNGs are byte-identical. The procession and lower Baal close-up form one immediate-continuity pair through the crossing foreground figure. The whole command balloon and tail, complete external caption and supported rock fragment are retained. Both inset holes remain transparent; accepted S1 and the complete99 inset S2 retain exact PNGs and native interaction metadata. All native caption pixels select104, with no missing caption pixels or opaque foreign caption in99; both documented partial-alpha boundary witnesses retain their exact RGBA values. Final Reader17 ownership is the ordered family34,99,104, covering F1/F2, F5/F6 and F3/F4 respectively.

All 73 accepted selections also passed actual fresh-page browser mouse input, overlay open/close/repeat and navigation against the final frozen source. Browser fixtures and source hashes are recorded privately; phone acceptance remains pending. Screen every retained stored map and descriptor using the current parent inventory. Only the source-authenticated Reader17 family with revised99 already installed may qualify. Fresh whole-page detection must equal the expected map, preserve accepted34 and99 in their current positions, and append104. Runtime source contains no original artwork, private map coordinates, native hashes, or book/page/title/text lookup.

Opening speed is a separate readiness requirement. Normal cold page loading and first taps remain materially slow; warm or repeat timings do not establish first-use or phone readiness. Improve and measure these paths before automatic frame mode. See the exact workflow, timings and limitations in docs/evidence/validation/TEST153-VALIDATION.json.

No APK, Gradle or Android workflow dispatch. Version configuration only; latest delivered APK Test124. Phone readability and automatic playback remain pending. Original comic pixels stay out of Git/CI. See docs/evidence/validation/TEST153-VALIDATION.json and the private replay checkpoint.


</details>

<a id="archive-handoff-2-79-154-md"></a>

<details>
<summary>HANDOFF-2.79.154.md — historical checkpoint</summary>

# Test154: complete tall stone-rimmed conversation

The accepted lower cell supplies an independently observed shared wall. Native source thresholds identify a unique roof and agreeing dark-collar paths; complete compact speech bodies belong atomically to the new upper owner. Private delegation retains verified prior context while binding exact ordered owners, source URLs, dimensions, readiness, lifecycle and pending asynchronous scope. Original callers are unchanged. Equivalent contiguous morphology and bounded exterior-fill loops preserve every mask and all caption/foreign-owner decisions while reducing measured kernel time. Privately source-issued80/86 identities reuse completed unchanged source analysis only for exact detector-issued owner/root/proof/contour identity records. Equal copies and restored owners retain full source replay; provider2f1a, all source/owner/lifecycle guards and geometry remain unchanged. Combined final154 source, native and actual-browser evidence preserves all earlier accepted ownership and crops. Cold loading and first-open delays remain material; measured workflow qualifications are recorded separately.

57 singles + 17 immediate-continuity pairs cover 91/105 originals. 74 qualifying steps; 14 originals remain. The whole-comic task has repaired 48 further originals from the corrected 62-original worklist and remains in progress. Default one complete original; at most two adjacent consecutive originals with immediate continuity. Finish comic1 before comic2.

All 253 retained suites and 137 JavaScript syntax checks pass. All 24 verified originals and 76 native overlays replayed in isolated six-page batches. All 73 earlier accepted crops and 75/76 total PNGs are byte-identical. Complete tall conversation inside its source-derived articulated rim, including all three connected speech groups and complete figures; accepted departure remains exact. All preceding accepted crop PNGs and native interaction metadata must remain exact.

All 74 accepted selections also passed actual fresh-page browser mouse input, overlay open/close/repeat and navigation against the final frozen source. Browser fixtures and source hashes are recorded privately; phone acceptance remains pending. Only the source-authenticated Reader15 predecessor family may qualify. Fresh whole-page detection must equal the expected ordered map; preserve all prior owners and all other pages.

Opening speed is a separate readiness requirement. Normal cold page loading and first taps remain materially slow; warm or repeat timings do not establish first-use or phone readiness. Improve and measure these paths before automatic frame mode. See the exact workflow, timings and limitations in docs/evidence/validation/TEST154-VALIDATION.json.

No APK, Gradle or Android workflow dispatch. Version configuration only; latest delivered APK Test124. Phone readability and automatic playback remain pending. Original comic pixels stay out of Git/CI. See docs/evidence/validation/TEST154-VALIDATION.json and the private replay checkpoint.


</details>

<a id="archive-handoff-2-79-155-md"></a>

<details>
<summary>HANDOFF-2.79.155.md — historical checkpoint</summary>

# Test155: complete exterior camp scene

The two authenticated stone cells bound one complete exterior camp scene. Complete speech bodies, connected residual geometry, independent enclosure scans and sloping-divider checks agree before the new owner is admitted. The two earlier insets retain their exact geometry and output. Ordered owners, source readiness and identity, navigation, and pending asynchronous scope remain bound during display and input.

58 singles and 17 immediate-continuity pairs cover 92 of 105 originals. There are 75 qualifying steps among 77 selections; 13 originals remain. The whole-comic task is in progress, with 49 further originals repaired from the corrected 62-original worklist. Default to one complete original; pair at most two adjacent consecutive originals only for immediate action/dialogue or a continuous composition.

All 254 retained contracts and 138 syntax checks passed against frozen source. The normal proof103 contract now includes the full 26-case shared guard matrix. All 24 fresh detector graphs match the complete ordered source-derived maps. All 77 native overlays replayed, preserving every 76 preceding PNG and metadata entry, including all 74 qualifying steps. All 526,500 analysis positions have exactly one of the three Reader15 owners; 404 outside points reject.

All 75 qualifying owners passed real cloud-browser first/repeat/source-return input, 225 trusted open/close cycles, exact contours and overlay evidence. The new camp owner was opened first on its fresh page before either predecessor. Native event fallbacks and established browser scalar-portability qualifications are retained in the private replay. Phone acceptance remains pending.

First-use performance remains a material limitation. The new camp first handler took 23.453s, its repeat 34.6ms and its source-return handler 13.396s in the current shared cloud environment. These are individual handler observations, not complete page-load or visual-settle benchmarks, and not phone timings. The 680ms animation starts after synchronous construction. Improve fresh loading and first opening before automatic mode. No responsive or phone-ready claim is made.

The recovered optional cooperative ragged optimization and private source-issued100 experiment are not installed. The final proof103 runtime matches the earlier unaccepted candidate hash; lost partial checks were not credited after workspace recovery. Current acceptance was rerun. No page/title/text/hash lookup selects pixels.

No APK, Gradle, Android workflow dispatch or automatic mode. Original comic pixels remain outside Git/CI. See docs/evidence/validation/TEST155-VALIDATION.json and the private replay checkpoint. Reporting files were finalized after the frozen executable checks; the runtime and test inputs remain exact.


</details>

<a id="archive-handoff-2-79-156-md"></a>

<details>
<summary>HANDOFF-2.79.156.md — historical checkpoint</summary>

# Test156: faster first opening for source-issued articulated frames

The Reader can reuse completed source validation for the exact immutable articulated owners produced by its current detector run. Reuse requires the same ordered parent identities, dimensions and retained native pixels. Missing or evicted associations, copied/restored owners, source changes and navigation retain full validation. Geometry and serialized proofs are unchanged; delegated ancestor ownership checks remain active.

Coverage stays at 92 of 105 originals: 58 singles and 17 immediate-continuity pairs, 75 qualifying steps among 77 selections. This speed-only checkpoint adds no frame credit. Thirteen originals remain in comic1. Default to one complete original; pair at most two adjacent consecutive originals only for immediate action/dialogue or a continuous composition.

All 255 retained contracts and 138 syntax checks pass against frozen executable source, including the full 26-case exterior guard matrix and the new two-family source-association contract. All 24 fresh detector graphs match accepted Test155. Every one of the 77 native PNGs and metadata entries remains exact. All 526,500 Reader15 analysis positions retain their owner, with no missing or overlapping pixels; 404 outside points reject. All 75 qualifying owners pass 225 real browser first/repeat/source-return opens and closes, with all previous browser pixels and contours preserved.

Four fresh-document foreground browser trials ran in A155/B156/B156/A155 order. On Reader15's camp, first-handler settlement was 48.584s and 13.213s in Test155, versus 1.854s and 1.542s in the candidate. Input through the animation-finish event took 49.462s and 13.941s versus 2.585s and 2.259s. Source-return handlers were 12.573s and 13.008s versus 1.675s and 1.490s. The first old handler is an unexplained outlier and remains in the evidence. The first candidate document loading/seeding also has an outlier, retained separately. Two observations per variant on a shared host do not establish statistical or phone performance.

Fresh page detection still takes roughly 23–27 seconds. The compared first taps occur after identities are ready; an earlier tap can also wait for detection. Repeats, navigation, document setup and first opening are recorded separately. Ordinary Reader reload deliberately bypasses persisted IndexedDB panel identities and detects fresh owners. Parsed-map injection tests establish fallback guard behavior; they are not normal app reload benchmarks. Native foreground observations accompany the comparison because this cloud browser's DOM focus state alone does not reliably describe its native window. Animation completion is not a compositor presentation timestamp.

A full-gate harness initially misclassified descendant-button blur as native foreground loss. The stopped attempt is retained. The corrected harness distinguishes event targets while preserving real window/visibility/native-focus rejection. Completed page boundaries were retained across controller and diagnostic stops. The final receipt combines these disjoint components: 19 owners/57 open-close cycles; 19 owners/57 open-close cycles; 37 owners/111 open-close cycles. Interrupted incomplete batches receive no credit. It is not one uninterrupted browser document. Exact controller protocols and close-observation qualifications remain in each component receipt.

The sweep exposed a genuine pre-existing close race. A native double-click over a source area with no owner can close the overlay, then reopen a stale asynchronous rescue result. Exact frozen Test155 reproduced reopening after 19.240 seconds and another zoom after 34.184 seconds; the 35-second observation ended with no pending handlers and the unwanted overlay still open. Reader.js is unchanged in 156. A 420-ms closed-state snapshot alone does not establish absence of delayed fallback work. The comparable continuation restores source-point closes and observes their handlers settling. Earlier component receipts retain their original observation scope. This arbitrary-center defect remains unresolved and must be fixed before APK testing.

Fresh loading and first opening still need further improvement before automatic mode. Phone regression acceptance is pending. No APK, Gradle, Android workflow dispatch or automatic-mode implementation. Original comic artwork and private maps remain outside Git/CI. No page, title, text, hash or audit lookup selects runtime pixels. See docs/evidence/validation/TEST156-VALIDATION.json and the private replay checkpoint. Reporting files were finalized after frozen executable checks; all executable and test inputs remain exact.


</details>

<a id="archive-handoff-2-79-157-md"></a>

<details>
<summary>HANDOFF-2.79.157.md — historical checkpoint</summary>

# Test157: two terminal originals and reliable settled closes

Reader20's bottom portrait and carving now open as two independent originals. Their source-derived contours retain the complete owned artwork, captions and borders. The rejected seven-original broad host is retired from selection; its exact historical descriptor and audit remain available. This adds two original frames: 94 of 105 are covered, with 11 remaining. There are 60 singles and 17 immediate-continuity pairs, 77 qualifying selections among 78 rendered outputs. At most two adjacent originals may share a selection, only for immediate action/dialogue or continuous composition.

Closing an overlay now invalidates pending fallback work so a stale asynchronous result cannot reopen it. The Reader14 baseline case uses the same trusted targets and event order as the reproduced old defect. All pending work settles with no reopen, including a 35.001-second closed observation and an observation 49.510 seconds beyond settlement. Actual inter-mouseup spacing differs: 111.2 ms in this run versus 12.7 ms in the baseline. Deferred completion controls provide complementary lifecycle coverage; timing identity is not claimed.

All 261 retained command positions are covered: 260 successful commands from the frozen original execution carry forward by verified unchanged dependencies, and the page-deck fixture runs separately after loading the real Reader helper omitted by its partial test loader. Its 12 assertions and fixtures are unchanged. The original setup failure stays preserved; this is not a clean 261-command rerun on successor bytes. The unchanged full 26-case source/owner guard matrix passes. All 24 fresh detector graphs and 24 native pages pass. All 75 prior qualifying selections and 76 previous native PNG/metadata entries remain exact. The new two originals pass 788,221 exclusive owned tap checks plus 54,907 outside samples with no overlap. Real Chromium input passes 77 owners and 231 first/repeat/navigation open-close cycles, including 225 exact accepted browser RGBA/metadata comparisons. A separate fresh ordinary Reader.open run selects the carving first and verifies three further cycles, so either new child can be the first displayed selection on its source.

The ordinary Reader20 portrait sample records fresh source readiness at 16.362 seconds and handler settlement of 119.1 ms first, 6.4 ms repeat and 85.7 ms after navigation. The configured 680 ms animation starts after synchronous handling. These are shared-host desktop Chromium observations, not phone or compositor timing and not statistical performance. Fresh loading remains materially slow. The usual page-loading path detects fresh owners rather than restoring persisted IndexedDB owner identities.

Native review retains 2,737 divider memberships; 2,736 are opaque and one outer mixed source pixel remains alpha192. The bounded antialiasing qualification is not tolerance for visible interior clipping or neighboring art. Cross-runtime color evidence is reported separately in docs/evidence/validation/TEST157-VALIDATION.json: geometry and alpha, source-pixel fidelity, native draw replay and spatial alignment must be distinguished from RGB byte identity. No unavailable hidden compositing layer is claimed to have been reconstructed exactly.

Terminal detector/native code is reconstructed source, with historical proof98 Reader provenance recorded separately. Source-issued private validation reuse is guarded by current source and exact owner generation. The 103 historical VM selectors were corrected to load the newly installed terminal family while retaining their assertions, fixtures and order; native/fresh evidence carries only through verified identical production bytes. Both executed source freezes remain preserved in the private replay.

Continue all 11 remaining originals and loading/opening improvements before automatic mode. Phone acceptance remains pending. No APK, Gradle invocation, Android workflow dispatch or automatic-mode implementation. Original comic artwork and private maps stay outside Git/CI. No runtime page, title, text, hash or audit lookup selects pixels. Publication includes the separately tested QA helper-loading correction and four finalized documentation files. Production source remains exact to the browser and source-image checks.


</details>

<a id="archive-handoff-2-79-158-md"></a>

<details>
<summary>HANDOFF-2.79.158.md — historical checkpoint</summary>

# Test158: faster source-issued96 verification, unchanged coverage

This speed-only checkpoint retains Test157 geometry and coverage:94 of105 originals,11 remaining,60 singles,17 immediate-continuity pairs,77 qualifying selections and78 rendered outputs. Zero new originals are credited. Reader20's rejected broad host remains retired. At most two adjacent originals may share a selection, only for immediate action/dialogue or continuous composition.

The installed96 detector retains a private exact-root, full-raster-witness certificate after genuine source analysis. Reader96 still captures and checks the current native raster. It avoids repeated96 source analysis only for the exact retained immutable child generation. Public analyzers, copied/restored owners, superseded issuance and missing/changed witness or sampler dependencies use full replay. Source, owner, order, navigation and pending-work guards remain in force. The mutable66 parent is observed through exact descriptors across capture and is neither frozen nor retained after issuance. No earlier seven-module speed bundle or geometry research candidate is included.

The bounded pre-integration matched cloud Chromium pair against published157 measured Reader15 owner103 first/returned ready-page handler settlement at1830.5/1674.7/1561.4ms versus391.4/374.3/337.7ms. Repeat was91.7 versus101.4ms, with no improvement. Fresh Reader.open readiness was25.460 versus25.564s, effectively unchanged. Each variant had four actual input cycles. Full graph/source/crop/metadata and close checks passed for that pair. This is not phone, compositor, statistical, full-corpus speed or cold-process evidence. The broader158 correctness audit is separate and is not pooled into that timing claim. Other audit first taps and fresh detection remain materially slow.

The full source-bound integration gates now pass:24 native pages with all78 PNGs exact;24 fresh detector graphs; fresh and parsed ownership with1,053,000 owned samples and808 off-map samples; all263 retained command indexes; and the full real-input browser audit of77 owners and231 first/repeat/navigation open-close cycles. Separate ordinary Reader20 initial-child, reverse-first and stale-close companions pass, with complete native metadata, source/served-byte checks and settled closes. The two generated source/chain contracts and146 source syntax checks are bound to the same frozen source.

Fresh coverage comprises two explicitly carried successful independent pages and22 new executions after raising the per-tree resource cap. The earlier Reader2 resource failure and adjustment receipt stay preserved; this is not a clean24-page rerun. Ownership results are warm ownership coverage; actual cold first input is covered separately by the browser evidence. Retained results credit one authenticated successful receipt per original command index. Retained acceptance combines97 fully validated prior commands, six authentic captured successful receipts, and160 fully validated recovery commands. Missing old scheduling history is not reconstructed. At least 3 incomplete attempts and 3 unknown outcomes remain recorded; these are lower bounds. Physical execution exactly once is not claimed.

Native review retains the existing source-fidelity and antialiasing qualifications. The inherited divider evidence has2,737 memberships:2,736 opaque and one outer mixed source pixel at alpha192. This bounded outer-pixel qualification does not permit visible interior clipping or neighboring art. Cross-runtime RGB byte identity is distinct from geometry/alpha, native draw replay, spatial alignment and source-pixel fidelity. No unavailable hidden compositing layer is claimed to have been reconstructed exactly.

The executed1681-file source freeze remains preserved. Only this handoff,docs/evidence/validation/TEST158-VALIDATION.json and the Test158 QA README are finalized in a separate publication successor; all production/test input bytes and modes remain exact to the executed freeze. Final gate identity: ac6179bf3daae3f749642471540f3c6a93723fd1a17b38fd3c80d90a460c9c2d. Git publication and durable replay restoration are checked separately after this source-acceptance report.

Continue the11 unfinished originals and loading/opening improvements before automatic mode. Phone acceptance remains pending. No APK, Gradle invocation, Android workflow dispatch or automatic-mode implementation. Original comic artwork, private maps, native previews/crops and browser evidence stay outside Git/CI. No runtime page, title, text, hash or audit lookup selects pixels.

A separate actual-browser check found a pre-existing navigation defect on both accepted Test157 and frozen Test158: after opening the Reader page8 court panel, Cover/goTo or the real page slider can change the page while leaving the old panel visibly open, including after held work settles. The 231-cycle audit used its recorded close/navigation protocol and does not prove this interrupted flow correct. A separate city successor is testing the cleanup; no navigation fix is included here. This remains a phone-readiness blocker. Baseline observation SHA256 values are 4dc930c731dfbacc6b1d7f9e59524d0dd2701e163e229ea528b6f8daf7bc4dd8 (157) and 3b3b87eb7533b589e81229603062fe2ef03545d0db69434b53cb8babec0f4349 (158).


</details>

<a id="archive-handoff-2-79-159-md"></a>

<details>
<summary>HANDOFF-2.79.159.md — historical checkpoint</summary>

Brad approved both city/palace S1 and feline inset S3 previews in the 11 October continuation. Accepted coverage is now96/105 originals, nine remaining (62 singles,17 pairs,79 qualifying selections and79 rendered outputs). The review-pending text below records the original checkpoint; its approval gate is now satisfied. Continue the nine-frame queue, showing each new pop-out before proceeding.

# Test159: city and rounded inset pop-outs — review pending

Resume from Test159 / 2.79.159 on `Test_Branch`. Base is published Test158 commit `7a2146ef8645022c3a22dc1fcf7bbd964bb00f1b`. This checkpoint recovers the unfinished city successor, validates it and moves first-use source admission into page preparation. Read `docs/evidence/validation/TEST159-VALIDATION.json` and the Test159 QA README.

## Current review gate

Stop here for Brad's positive visual review. Reader page 8 has two separate single-frame previews: S1 city/palace overview, and S3 rounded feline inset with its caption. S2 throne remains accepted and its native PNG is byte-for-byte identical to Test158. The two new children replace their common broad host atomically but are independently selectable; they are not a grouped pair. All visible city captions and contact paint stay with the city; the inset owns its visible rim and its caption. No runtime title, page number, text, hash or private-map lookup chooses pixels.

Accepted coverage remains **94/105 originals, 11 remaining**, 60 singles and 17 immediate-continuity pairs. If Brad approves both previews, credit two originals: **96/105, nine remaining**, 62 singles, 17 pairs, 79 qualifying selections and 79 rendered outputs. Approval of only one credits only that original; repair any rejected crop and show a fresh preview before continuing.

The remaining queue after both approvals is Reader6 F2 baby discovery, F4 continuous middle crowd/Baal foreground, F5 sacrifice discussion, F6 Baal with baby; Reader20 F1 upper corpse, F2 circular general reaction, F3 narrow standing figure, F4 red warrior/sword inset, F5 central ambush. Reader20's rejected broad host stays retired. Default is one original per selection; at most two adjacent originals may share a selection only for immediate action/dialogue or continuous composition.

## Changes and speed

Installed native pixel evidence now partitions the curved host into complete complementary singles while preserving its accepted retained owner. Restored/copied/changed evidence retains the strict replay path. The recovered 96/100/103 analysis reuse remains bounded and source checked. `goTo` clears frame focus before navigation, including slider navigation; ordinary same-page non-slider no-ops keep their behavior.

First-use city admission previously cost about 900ms in the native Reader harness; adding the unchanged 680ms animation produced a **1,585ms** estimate. Source admission and retained-display validation now finish during `loadPanelsForCurrentPage`, before preparation settles. This added about **700ms** to preparation. Ready-page estimates including the animation are **686ms city, 698ms throne, 681ms inset**. All three crops are byte-identical before/after this scheduling change. Source, owner, page, token and navigation checks remain active on taps.

These are native-canvas/minimal-DOM estimates, not browser compositor or phone measurements. Fresh page8 detection still took about **27.3 seconds**. Early taps, cold loading, other frames and phone timing remain performance work; do not claim that the full one-second requirement is globally satisfied.

## Executed checks

All 24 issue1 fresh detector graphs passed comparison with the preserved Test157/158 baseline: 23 exact and only the intended page8 split; the throne descriptor stayed exact. All three page8 crops were rendered through the installed Reader. The throne matches the authenticated Test158 PNG exactly. Passed: 25 shared-source controls, 55 navigation controls per arm, five actual-load preparation controls, twelve fresh-reuse jobs, 147 indexed-script syntax checks, shell/version contract and diff whitespace check. Current repository runtime bytes match the executed candidate.

This is a review checkpoint. The full 263-command retained rerun, all-owner actual-browser audit and phone acceptance have not been rerun here. Earlier receipts remain historical evidence, not new executions. Animated previews replay the actual Reader canvases and its transform; they are not browser or phone recordings.

## Recovery and next steps

The review deliverables are `Nth-Shelf-Test159-City-Pop.gif`, `Nth-Shelf-Test159-Feline-Pop.gif`, `Nth-Shelf-Test159.patch`, `Nth-Shelf-Test159-Handoff.md` and `Nth-Shelf-Test159-Review-Evidence.zip`. The private evidence bundle contains exact target detector proofs, native crops, validation reports and replay helpers. Keep comic artwork, maps, previews and private evidence outside Git/CI.

After positive review, continue the remaining originals using the same cadence: patch plus handoff for every working crop, show its pop-out preview, wait for approval, and fix slow taps. No APK, Gradle invocation, Android workflow dispatch or automatic mode was performed. Build an APK only after all issue1 originals work with the detector; Brad will run the regression and provide screenshots. Then broaden/tighten with another comic, then work on automatic frame crop mode.


</details>

<a id="archive-handoff-2-79-160-md"></a>

<details>
<summary>HANDOFF-2.79.160.md — historical checkpoint</summary>

Brad approved the Test160 baby-discovery animation on 11 October 2026 and requested continuation. Accepted coverage is now97/105 originals, eight remaining (63 singles,17 pairs,80 qualifying selections and80 rendered outputs). The visual gate below is satisfied. Continue Reader6 F4 with its own preview before another new frame.

# Test160: baby-discovery pop-out — visual review pending

Resume from Test160 / 2.79.160 on `Test_Branch`. Parent is the published Test159 approval commit `644d8d29b384259bf5a88304209810f1033e8cb5`. Brad approved both Test159 animations and requested continuation on 11 October 2026.

## Current review gate

Pause for Brad's positive review of **Reader6 S3 / F2, baby discovery**. The scene owns its three upper speech balloons and the baby's cry. The earlier narrow left inset S1/F1 and baby close-up S2/F3 remain independent and unchanged. This new scene is one original, not an adjacent pair. Its lower boundary follows the current source matte/ink separator; neighboring crowd dialogue stays excluded.

Accepted coverage is **96/105 originals, nine remaining**, with 62 singles, 17 justified adjacent pairs, 79 qualifying selections and 79 rendered outputs. Approving this preview would reach **97/105, eight remaining**, 63 singles, 17 pairs, 80 qualifying selections and 80 rendered outputs. Do not credit the new original before positive visual review.

After approval the queue is Reader6 F4 continuous middle crowd/Baal foreground, F5 sacrifice discussion, F6 Baal with baby; Reader20 F1 upper corpse, F2 circular general reaction, F3 narrow standing figure, F4 red warrior/sword inset, F5 central ambush. Reader20's rejected broad host stays retired. Default remains one original per selection, with at most two adjacent originals combined only for immediate dialogue/action or a continuous composition.

## Source and timing

The installed source supplement authenticates both upper inset owners and their exact ancestor relationship, traces a lower source separator independently at two thresholds, excludes both inset masks, and preserves whole bright speech bodies or defers. Runtime book/title/page/text/hash and private audit coordinates do not choose pixels. A private native raster witness permits bounded installed-detector admission. Serialized/copied proofs retain strict sampled-source and ancestor replay; this is not a claim of cryptographic full-native binding for serialized maps.

Source admission and retained display replay finish during actual `loadPanelsForCurrentPage` preparation. Previously the first accepted inset incurred about 10.9 seconds including animation. Prepared-page estimates in the final target run are **686ms discovery, 693ms left inset, 704ms baby inset**, including the unchanged 680ms animation. The discovery was opened first. Both accepted inset descriptors and PNGs are exact to the Test159 baseline.

Cold detection took **35.7 seconds**, followed by **9.6 seconds** preparation in the final solo harness. These remain unresolved performance work. The ready-page measurements use native canvas/minimal DOM and add the animation duration; neither compositor nor phone timing was measured. Early taps, cold loading and global one-second compliance are not complete. Do not call this a complete performance pass or build an APK on that basis.

## Executed validation

The 24-page issue1 fresh pipeline comparison observes the unchanged ancestor output before installing this source family: 23 complete outputs exact; only Reader6 gains the new child, with its first two descriptors exact. This is a same-pipeline before/after observation, not two separately executed 24-page historical detector runs. Three actual Reader crops are reachable; both earlier PNGs match the authenticated baseline bytes. A fresh Reader8 run also renders all three owners and confirms the just-approved city/feline PNGs byte-exact to Test159. The restored bundle did not contain the older throne PNG; no new byte-exact throne claim is made.

Passed: seven generated geometry controls, seven actual installed-source rejection controls, five actual-load preparation controls, 55 navigation controls per arm, 149 indexed-script syntax checks, shell/package/index-order contract and whitespace checks. Invalid parent order, missing/duplicate parents, a child in a foreign slot, unavailable source, substituted sampler and forged copied proof are rejected. Authentic prepared admission is restored between negative controls.

No full 263-command retained rerun, all-owner actual-browser audit, phone regression, APK build, Gradle invocation, Android workflow dispatch or automatic mode was performed. Historical receipts remain historical.

## Recovery and cadence

Deliverables: `Nth-Shelf-Test160-Baby-Discovery-Pop.gif`, `Nth-Shelf-Test160.patch`, `Nth-Shelf-Test160-Handoff.md`, and `Nth-Shelf-Test160-Review-Evidence.zip`. The private bundle preserves detector evidence with deduplicated source strings, a lossless restoration helper, native crops, timing/styles, receipts and replay scripts. Recover the comic from its existing private source file; never commit artwork, private maps or previews to Git/CI.

Continue only after positive visual review: patch and handoff for each working crop, show its animated pop-out, and repair slow taps. No APK until all issue1 originals work; then Brad performs phone regression and reports screenshots. After corrections, broaden/tighten with another comic, then implement automatic frame cropping. Publish source to `Test_Branch` only.


</details>

<a id="archive-handoff-2-79-161-md"></a>

<details>
<summary>HANDOFF-2.79.161.md — historical checkpoint</summary>

# Test161: middle crowd pop-out — approved

Brad positively reviewed the animated crop on 11 October 2026: “Looks really good. Let’s roll on.” The visual gate below is satisfied. Accepted coverage is now **98/105 originals, seven remaining**, 64 singles, 17 pairs, 81 qualifying selections and 81 rendered outputs. Next: Reader6 F5 sacrifice discussion. The original pending-review receipt follows for historical context.

# Test161: middle crowd pop-out — visual review pending

Resume from Test161 /2.79.161 on `Test_Branch`. Parent is published Test160 approval commit `5ac69a1a226507e7dd28466dbfac9d325fb6e93c`. Brad approved the baby-discovery animation and requested continuation on 11 October 2026.

## Current review gate

Pause for Brad's positive review of **Reader6 S4 / F4, continuous middle crowd/Baal foreground**. This is one original scene, not an adjacent pair. It retains the crowd's complete question balloon, figures and night backdrop. The following scene's lower answer balloons stay excluded. All three accepted upper owners retain their descriptors and native crops.

Accepted coverage is **97/105 originals, eight remaining**, with 63 singles, 17 justified pairs, 80 qualifying selections and 80 rendered outputs. Approval would reach **98/105, seven remaining**, 64 singles, 17 pairs, 81 qualifying selections and 81 rendered outputs. Do not credit this original or start another new frame before positive visual review.

After approval: Reader6 F5 sacrifice discussion, F6 Baal with baby; Reader20 F1 upper corpse, F2 circular general reaction, F3 narrow standing figure, F4 red warrior/sword inset, F5 central ambush. Reader20's rejected broad host stays retired. Default remains one original per selection; at most two adjacent originals may share a selection only for immediate dialogue/action or a continuous composition.

## Source and readiness

The generic source supplement uses the authenticated ordered upper rail, capped inset and open discovery scene. Exterior matte and two independently opened source cores determine a shared scene envelope. The envelope keeps backdrop and foreground together while rejecting narrow outside paint contacts. Whole bright source bodies use neighboring source-component evidence; ambiguous large bodies defer the scene, while uncertain small highlights stay wholly unclaimed. The two proposals have identical body assignments and differ by about 0.83 percent of their union. Earlier owner masks are excluded throughout.

A read-only predecessor query verifies the exact installed owner array and current native pixels against the existing private witness. It cannot issue a certificate; copied arrays, reordered roots and public analysis output cannot borrow that fast path. Serialized evidence requires predecessor and sampled-source replay. Native witnesses bind installed issuance; serialized maps are not claimed to have a cryptographic full-native binding. No runtime book/title/page/text/hash or private audit coordinates choose pixels.

Speech processing uses bounded local source boxes to avoid repeatedly scanning the whole page. The existing preparation hook authenticates the new child and warms retained display geometry under the exact installed predecessor array. Pages without the new family delegate to their earlier preparation hook.

The new crowd was opened first. Final target native/minimal-DOM estimates including the unchanged 680ms animation are **688ms crowd, 705ms left inset, 729ms baby inset, 740ms discovery**. All four are under one second once preparation has settled. Both accepted insets and the just-approved discovery PNG are byte-for-byte identical to Test160.

Cold detection took **38.4 seconds**, followed by **10.2 seconds** preparation in this harness. Cold loading, early taps, global one-second compliance and phone timing remain unfinished. The timing adds animation duration to handler timing; it does not measure a browser compositor or a phone. Do not call this a complete performance pass or build an APK on that basis.

## Executed checks

The fresh 24-page issue1 comparison observes ancestor output immediately before this family in the same pipeline: 23 complete outputs unchanged, only Reader6 appends the new child, and its first three descriptors remain exact. This is not two separately executed historical fresh detector runs. Four actual Reader page6 crops are reachable; three accepted native PNGs are exact. A retained page8 Reader run checks its three canvases against Test160.

Passed: eight generated geometry controls, twelve installed-source controls, five controlled actual-load preparation cases, 55 navigation controls per arm, 151 indexed-script syntax checks, shell/package/index-order contract and whitespace check. The private native controls reject reordered/missing/duplicate predecessors, foreign child slots, unavailable source, substituted sampler or predecessor query, and forged copied proof. Exact installed predecessors with current native pixels permit read-only reuse; copied/reordered arrays and nonimage sources do not. Authentic prepared state is restored between negative controls.

No full 263-command retained rerun, all-owner browser audit, phone regression, APK build, Gradle invocation, Android workflow dispatch or automatic mode was performed. Earlier receipts remain historical.

## Recovery and cadence

Deliverables are `Nth-Shelf-Test161-Crowd-Pop.gif`, `Nth-Shelf-Test161.patch`, `Nth-Shelf-Test161-Handoff.md` and `Nth-Shelf-Test161-Review-Evidence.zip`. The private bundle contains deduplicated detector evidence, lossless restoration helpers, native canvases, timings/styles, receipts and replay scripts. Original comic artwork stays in its existing private source file. Keep original artwork, private maps, crops and previews out of Git/CI.

The animated preview replays actual Reader crop/style output, including its CSS dim transition. It is not a browser/phone recording. The wide source frame fits the page width, so its existing Reader transform mostly recenters it rather than enlarging it. No Reader zoom policy was changed to exaggerate the preview.

After positive review, continue the seven-frame queue with an animated preview, Git patch and handoff per working crop, fixing slow taps. Publish source to `Test_Branch` only. No APK until all issue1 originals work; then Brad runs phone regression and supplies screenshots. After corrections, broaden/tighten on another comic, then implement automatic frame cropping.


</details>

<a id="archive-handoff-2-79-162-md"></a>

<details>
<summary>HANDOFF-2.79.162.md — historical checkpoint</summary>

# Test162: sacrifice discussion pop-out — approved

Brad positively reviewed the animated crop on 11 October 2026: “Yess looks great. We can continue.” The visual gate below is satisfied. Accepted coverage is now **99/105 originals, six remaining**, 65 singles, 17 pairs, 82 qualifying selections and 82 rendered outputs. Next: Reader6 F6 Baal with baby. The original pending-review receipt follows as historical context.

# Test162: sacrifice discussion pop-out — visual review pending

Resume from Test162 /2.79.162 on `Test_Branch`. Parent is published Test161 approval commit `bf2bb3afa8b84396f558b903720e7186146862d7`. Brad positively reviewed the middle crowd/Baal foreground and requested continuation on 11 October 2026.

## Current review gate

Pause for Brad's positive review of **Reader6 S5 / F5, sacrifice discussion**. This is one original scene. The crop keeps the wrapped baby, foreground hand, figures and both complete compound dialogue bodies. It follows the jagged source rim, excludes the sword/forearm on the left and the lower scene's rising head, and retains all four earlier page6 owners.

Accepted coverage stays **98/105 originals, seven remaining**, with 64 singles, 17 justified pairs, 81 qualifying selections and 81 rendered outputs. Approval would reach **99/105, six remaining**, 65 singles, 17 pairs, 82 qualifying selections and 82 rendered outputs. Do not credit this original or start another new frame before positive visual review.

After approval: Reader6 F6 Baal with baby; Reader20 F1 upper corpse, F2 circular general reaction, F3 narrow standing figure, F4 red warrior/sword inset, F5 central ambush. Reader20's rejected broad host stays retired. Default is one original per selection; at most two adjacent originals may share a selection for immediate dialogue/action or continuous composition.

## Source and readiness

A unique residual source core below the authenticated four-owner family discovers the candidate. Exterior matte discovers the side corridor. Two independently thresholded ink walks follow the side and lower rim, including steep orthogonal turns: each visited pixel contributes cost, so a jump cannot skip unsupported paint. Supported source contours separate touching paint and the lower foreground occlusion. The agreed masks differ by about 0.127 percent. Bright source bodies remain indivisible, including lettering holes, joined balloons and tails; large ambiguous bodies defer the scene. Earlier masks stay excluded. No runtime comic/title/page/text/hash or private audit coordinates choose pixels.

The predecessor adds only a read-only source query/export. Exact installed owners and current full native pixels can reuse its private witness; copies, reordered roots, substituted providers and unavailable images cannot borrow that path. Serialized predecessors replay their source and sampled proof. Installed issuance binds full native pixels; serialized maps are not claimed to have a cryptographic full-native binding. Frozen exact predecessor references avoid a redundant serialization during new Reader preparation.

The existing preparation hook authenticates the child and warms all retained display geometry under the exact predecessor array. The sacrifice frame was opened first. Native/minimal-DOM estimates including the unchanged 680ms animation: **686ms new sacrifice, 717ms left inset, 749ms baby inset, 811ms discovery, 794ms crowd**. All are below one second after preparation settles. All four accepted page6 PNGs and the three retained page8 PNGs are byte-for-byte exact to Test161.

Cold detection took **39.8 seconds**, then **9.7 seconds** preparation. Cold loading, early taps, global one-second compliance and phone timing remain unfinished. The estimate adds animation duration to handler timing; it does not measure a browser compositor or a phone. Do not call this a complete performance pass or build an APK on that basis.

## Executed checks

One actual fresh target detector/Reader run produces five reachable native canvases, with four exact earlier descriptors and twelve installed-source controls. A retained actual page8 run confirms its three native crops. The 24-page family comparison uses Test161's actual fresh graph cache: 23 ineligible arrays delegate unchanged by exact reference, and the sole eligible serialized graph replays against current native source and matches the current fresh target. Runtime checks confirm earlier geometry code is unchanged; the predecessor adds only its read-only query/export. **This is not a fresh rerun of all 24 ancestor pipelines.**

Passed: nine generated geometry controls, eight retained Test161 geometry controls, twelve installed-source controls, five controlled actual-load preparation cases, 55 navigation controls per arm, 153 indexed-script syntax checks, shell/package/index-order contract and whitespace check. Source controls reject malformed ancestor order/count, foreign child slots, unavailable source, replaced sampler/query and forged copied proof. Exact installed current-source predecessors permit read-only reuse; copied arrays and nonimages do not. Restore authentic prepared state between negative controls.

No full 263-command retained rerun, all-owner browser audit, phone regression, APK, Gradle invocation, Android workflow dispatch or automatic mode was performed. Older receipts remain historical.

## Recovery and cadence

Deliverables: `Nth-Shelf-Test162-Sacrifice-Pop.gif`, `Nth-Shelf-Test162.patch`, `Nth-Shelf-Test162-Handoff.md` and `Nth-Shelf-Test162-Review-Evidence.zip`. The private bundle preserves lossless detector evidence, the cached baseline and updated current graphs with explicit lineage, native canvases, captured Reader timings/styles, receipts and replay helpers. Original comic artwork remains in its existing private source file. Keep original artwork, private maps, crops and previews out of Git/CI.

The animated preview replays actual Reader crop/style output and the CSS dim transition. It is not a browser or phone recording. Existing Reader scale policy is unchanged.

After positive review, continue with one animated preview, Git patch and handoff per working crop and fix slow taps. Publish source to `Test_Branch` only. No APK until all issue1 originals work; then Brad runs phone regression and supplies screenshots. After corrections, broaden/tighten on another comic, then automatic frame cropping.


</details>

<a id="archive-handoff-2-79-163-md"></a>

<details>
<summary>HANDOFF-2.79.163.md — historical checkpoint</summary>

# Test163 approved; final batch authorized

Brad approved Baal with baby on11 October2026 and explicitly authorized the five remaining originals in one batch, then the APK build. Accepted100/105, five remaining;66 singles+17 pairs=83 selections/outputs. Per-frame pause superseded for this batch. Preserve patches, handoffs and animated previews. Original receipt below.

# Test163: Baal with baby pop-out — visual review pending

Resume from Test163 /2.79.163 on `Test_Branch`. Parent is published Test162 approval commit `2dd7be605cf81e62fec166dc592c6cd05b593dd6`. Brad approved the sacrifice-discussion crop on 11 October 2026: “Yess looks great. We can continue.”

## Current review gate

Pause for positive review of **Reader6 S6 / F6, Baal with baby**. The single original contains the large foreground Baal, wrapped baby, sword/arm, lower figures, moon and both complete dialogue balloons. The source-defined crop excludes all five earlier owners; their crops stay exact. Reader6 now has six candidate selections, corresponding to all six originals.

Accepted coverage remains **99/105 originals, six remaining**: 65 singles, 17 justified pairs, 82 qualifying selections and 82 rendered outputs. Positive review would reach **100/105, five remaining**: 66 singles, 17 pairs, 83 selections/outputs. Do not credit this original or start another new original before visual approval.

Next after approval: **Reader20 F1 upper corpse**, F2 circular general reaction, F3 narrow standing figure, F4 red warrior/sword inset, F5 central ambush. Its rejected broad host stays retired. Default remains one complete original per crop; at most two immediate adjacent originals may share a crop for continuous action/dialogue.

## Source and Reader

The exact ordered five-owner proof family scopes a generic terminal residual algorithm. A unique broad source-paint body touches the bottom and supplies the ceiling. Other substantial lower bodies defer recovery. Source row envelopes keep the backdrop and residual composition; predecessor pixels stay excluded. Two minimum-component thresholds agree exactly. Whole bright source bodies include their lettering holes; a bright body touching a predecessor remains wholly excluded. No runtime comic identity, title, page, dialogue text, image hash or private audit coordinates choose pixels. This is a source-supported lower composition, not reinstatement of a rejected page-sized host.

The predecessor's existing read-only query requires exact installed owners and current full native pixels. Copies, reordered roots, substituted providers and unavailable images cannot borrow admission. Serialized predecessors replay source and sampled evidence. Installed issuance binds full native pixels; serialized maps do not claim a cryptographic full-native binding. Earlier geometry modules are unchanged.

Existing preparation authenticates the new child and warms earlier display geometry under the exact predecessor array. Authenticated deeply immutable predecessors now avoid redundant proof copying in this new wrapper's scoped tap; mutable serialized evidence still receives a private sealed copy. Live source, owners, providers, navigation and scope checks remain in force. The retained sacrifice selection improved from about973ms in the first candidate run to **682ms** after this correction.

The new Baal selection was opened first. Final native/minimal-DOM estimates, including the unchanged 680ms Reader animation: **687ms Baal, 714ms left inset, 755ms baby inset, 809ms discovery, 818ms crowd, 682ms sacrifice discussion**. All are below one second after preparation. All five accepted page6 and three retained page8 PNGs remain byte-for-byte exact to Test162.

Cold detection took **38.0 seconds**, then **10.2 seconds** preparation. Cold loading, early taps, global one-second compliance and phone timing remain unfinished. These estimates add animation duration to native-canvas handler timing; they do not measure a browser compositor or phone. Do not call this a full performance pass.

## Executed checks

One fresh actual target detector/Reader run produces six reachable native canvases and five exact earlier descriptors. Twelve installed-source controls reject malformed ancestry, foreign child slots, missing images, replaced sampler/query and forged copied proofs; exact current-source predecessor arrays permit read-only reuse, copied arrays and nonimages do not. Restore authentic prepared state between negative controls.

An actual retained page8 run confirms its three crops. The 24-page family check uses the immediate Test162 graph cache: 23 Test161 fresh graphs plus Test162 fresh page6. Twenty-three ineligible arrays delegate unchanged by exact reference. The sole eligible serialized graph replays against current source and matches the fresh target. Runtime hashes confirm earlier geometry code is unchanged. **This is not a fresh rerun of all 24 ancestor pipelines.**

Passed: eleven generated geometry controls, nine retained Test162 geometry controls, twelve installed-source controls, five actual-load preparation cases, 55 navigation controls per arm, 155 indexed-script syntax checks, shell/package/bootstrap contract and whitespace check. No full263-command retained rerun, all-owner browser audit, phone regression, APK, Gradle invocation, Android workflow dispatch or automatic mode was performed. Earlier receipts remain historical.

## Recovery and cadence

Deliverables: `Nth-Shelf-Test163-Baal-Baby-Pop.gif`, `Nth-Shelf-Test163.patch`, `Nth-Shelf-Test163-Handoff.md`, `Nth-Shelf-Test163-Review-Evidence.zip`. The private bundle preserves lossless fresh evidence, the immediate baseline and updated current graph cache, native crops, Reader styles/timings, checks, runtime hashes and restore/replay helpers. Its README explains the original private comic source and recovery commands. Private artwork, maps, crops and previews stay outside Git/CI.

The animation replays actual Reader canvas/style output and the CSS dim transition; it is not a browser or phone recording. Existing scale policy is unchanged.

After positive review, continue with a patch, handoff and animated preview per working crop. Publish source to `Test_Branch` only. No APK until all issue1 originals work; then Brad runs phone regression and supplies screenshots for corrections. Afterwards broaden/tighten the detector with another comic, then work on automatic frame cropping.


</details>

<a id="archive-handoff-2-79-164-md"></a>

<details>
<summary>HANDOFF-2.79.164.md — historical checkpoint</summary>

# Test164: Upper corpse — final batch checkpoint

Brad approved Test163 and authorized completing all five remaining originals in one batch, followed by the APK. No per-frame approval pause applies to this batch. Accepted visual baseline:100/105. Local coverage at this checkpoint:101/105 originals, 4 still to add; 67 singles +17 pairs =84 qualifying selections and rendered outputs. Phone regression remains pending.

Reader20 now has3 selections. The new original is **Upper corpse**. The rejected broad host is replaced by a supported upper compartment; it is never reinstated as an output. Both previously approved terminal frames remain. Earlier recovered compartments are reserved in the composition even before their selection is exposed, preventing surrounding crops from consuming their art or dialogue.

The detector uses source sky components, a closed circular ink cell, a tall nonink anchor and a sword-cell anchor. Ink walks constrained by source matte and paint recover separating rims. Whole lettered light bodies follow their inset; source yellow captions follow the ambush. No comic title, page number, dialogue string, image hash or stored review coordinates select geometry. The installed detector privately binds full native pixels to frozen owners. Serialized maps must replay predecessor source and the current sampled pixels; public geometry cannot borrow installed admission. Navigation, providers, order and source state remain checked.

Fresh actual production detector and Reader produced3 reachable native canvases. Prepared tap-to-finish estimates (native canvas handler +680ms animation): 690ms S1, 683ms S2, 681ms S3. Detection took17.2s. These are minimal-DOM estimates, not a phone or compositor measurement. Cold detection and the overall one-second requirement remain unresolved.

This source-only checkpoint does not build an APK. Complete through Test168, verify all five plus retained crops, then build the isolated Test168 APK for Brad's phone regression. Next after phone corrections: another comic, then automatic crop mode.

Per-original deliverables: Nth-Shelf-Test164.patch, Nth-Shelf-Test164-Handoff.md, Nth-Shelf-Test164-Pop.gif. Private source/maps/crops remain outside Git and CI. docs/evidence/validation/TEST164-VALIDATION.json records executed evidence; historical receipts remain historical. Current recovery package will contain the whole five-frame batch and scripts.


</details>

<a id="archive-handoff-2-79-165-md"></a>

<details>
<summary>HANDOFF-2.79.165.md — historical checkpoint</summary>

# Test165: Circular general reaction — final batch checkpoint

Brad approved Test163 and authorized completing all five remaining originals in one batch, followed by the APK. No per-frame approval pause applies to this batch. Accepted visual baseline:100/105. Local coverage at this checkpoint:102/105 originals, 3 still to add; 68 singles +17 pairs =85 qualifying selections and rendered outputs. Phone regression remains pending.

Reader20 now has4 selections. The new original is **Circular general reaction**. The rejected broad host is replaced by a supported upper compartment; it is never reinstated as an output. Both previously approved terminal frames remain. Earlier recovered compartments are reserved in the composition even before their selection is exposed, preventing surrounding crops from consuming their art or dialogue.

The detector uses source sky components, a closed circular ink cell, a tall nonink anchor and a sword-cell anchor. Ink walks constrained by source matte and paint recover separating rims. Whole lettered light bodies follow their inset; source yellow captions follow the ambush. No comic title, page number, dialogue string, image hash or stored review coordinates select geometry. The installed detector privately binds full native pixels to frozen owners. Serialized maps must replay predecessor source and the current sampled pixels; public geometry cannot borrow installed admission. Navigation, providers, order and source state remain checked.

Fresh actual production detector and Reader produced4 reachable native canvases. Prepared tap-to-finish estimates (native canvas handler +680ms animation): 688ms S4, 681ms S1, 682ms S2, 681ms S3. Detection took16.5s. These are minimal-DOM estimates, not a phone or compositor measurement. Cold detection and the overall one-second requirement remain unresolved.

This source-only checkpoint does not build an APK. Complete through Test168, verify all five plus retained crops, then build the isolated Test168 APK for Brad's phone regression. Next after phone corrections: another comic, then automatic crop mode.

Per-original deliverables: Nth-Shelf-Test165.patch, Nth-Shelf-Test165-Handoff.md, Nth-Shelf-Test165-Pop.gif. Private source/maps/crops remain outside Git and CI. docs/evidence/validation/TEST165-VALIDATION.json records executed evidence; historical receipts remain historical. Current recovery package will contain the whole five-frame batch and scripts.


</details>

<a id="archive-handoff-2-79-166-md"></a>

<details>
<summary>HANDOFF-2.79.166.md — historical checkpoint</summary>

# Test166: Narrow standing figure — final batch checkpoint

Brad approved Test163 and authorized completing all five remaining originals in one batch, followed by the APK. No per-frame approval pause applies to this batch. Accepted visual baseline:100/105. Local coverage at this checkpoint:103/105 originals, 2 still to add; 69 singles +17 pairs =86 qualifying selections and rendered outputs. Phone regression remains pending.

Reader20 now has5 selections. The new original is **Narrow standing figure**. The rejected broad host is replaced by a supported upper compartment; it is never reinstated as an output. Both previously approved terminal frames remain. Earlier recovered compartments are reserved in the composition even before their selection is exposed, preventing surrounding crops from consuming their art or dialogue.

The detector uses source sky components, a closed circular ink cell, a tall nonink anchor and a sword-cell anchor. Ink walks constrained by source matte and paint recover separating rims. Whole lettered light bodies follow their inset; source yellow captions follow the ambush. No comic title, page number, dialogue string, image hash or stored review coordinates select geometry. The installed detector privately binds full native pixels to frozen owners. Serialized maps must replay predecessor source and the current sampled pixels; public geometry cannot borrow installed admission. Navigation, providers, order and source state remain checked.

Fresh actual production detector and Reader produced5 reachable native canvases. Prepared tap-to-finish estimates (native canvas handler +680ms animation): 687ms S5, 682ms S1, 683ms S2, 681ms S3, 681ms S4. Detection took16.3s. These are minimal-DOM estimates, not a phone or compositor measurement. Cold detection and the overall one-second requirement remain unresolved.

This source-only checkpoint does not build an APK. Complete through Test168, verify all five plus retained crops, then build the isolated Test168 APK for Brad's phone regression. Next after phone corrections: another comic, then automatic crop mode.

Per-original deliverables: Nth-Shelf-Test166.patch, Nth-Shelf-Test166-Handoff.md, Nth-Shelf-Test166-Pop.gif. Private source/maps/crops remain outside Git and CI. docs/evidence/validation/TEST166-VALIDATION.json records executed evidence; historical receipts remain historical. Current recovery package will contain the whole five-frame batch and scripts.


</details>

<a id="archive-handoff-2-79-167-md"></a>

<details>
<summary>HANDOFF-2.79.167.md — historical checkpoint</summary>

# Test167: Red warrior and sword inset — final batch checkpoint

Brad approved Test163 and authorized completing all five remaining originals in one batch, followed by the APK. No per-frame approval pause applies to this batch. Accepted visual baseline:100/105. Local coverage at this checkpoint:104/105 originals, 1 still to add; 70 singles +17 pairs =87 qualifying selections and rendered outputs. Phone regression remains pending.

Reader20 now has6 selections. The new original is **Red warrior and sword inset**. The rejected broad host is replaced by a supported upper compartment; it is never reinstated as an output. Both previously approved terminal frames remain. Earlier recovered compartments are reserved in the composition even before their selection is exposed, preventing surrounding crops from consuming their art or dialogue.

The detector uses source sky components, a closed circular ink cell, a tall nonink anchor and a sword-cell anchor. Ink walks constrained by source matte and paint recover separating rims. Whole lettered light bodies follow their inset; source yellow captions follow the ambush. No comic title, page number, dialogue string, image hash or stored review coordinates select geometry. The installed detector privately binds full native pixels to frozen owners. Serialized maps must replay predecessor source and the current sampled pixels; public geometry cannot borrow installed admission. Navigation, providers, order and source state remain checked.

Fresh actual production detector and Reader produced6 reachable native canvases. Prepared tap-to-finish estimates (native canvas handler +680ms animation): 689ms S6, 682ms S1, 683ms S2, 681ms S3, 681ms S4, 681ms S5. Detection took16.7s. These are minimal-DOM estimates, not a phone or compositor measurement. Cold detection and the overall one-second requirement remain unresolved.

This source-only checkpoint does not build an APK. Complete through Test168, verify all five plus retained crops, then build the isolated Test168 APK for Brad's phone regression. Next after phone corrections: another comic, then automatic crop mode.

Per-original deliverables: Nth-Shelf-Test167.patch, Nth-Shelf-Test167-Handoff.md, Nth-Shelf-Test167-Pop.gif. Private source/maps/crops remain outside Git and CI. docs/evidence/validation/TEST167-VALIDATION.json records executed evidence; historical receipts remain historical. Current recovery package will contain the whole five-frame batch and scripts.


</details>

<a id="archive-handoff-2-79-168-delivery-md"></a>

<details>
<summary>HANDOFF-2.79.168-DELIVERY.md — historical checkpoint</summary>

# Test168 final phone-regression handoff

All 105 of 105 Rise of Apocalypse issue #1 original frames are locally covered: 71 single-frame selections and 17 pairs, totaling 88 selections. Brad approved through Test163 (100 originals), then authorized the final five originals as one batch and the regression APK. The final five on Reader page 20 await phone visual acceptance: upper corpse, circular general reaction, narrow standing figure, red warrior/sword inset, central ambush. The two bottom originals remain retained.

The interrupted checkpoint was recovered from Test_Branch at 629a04fed05a9e93fb3bc26bc2803f66177e2fdf. A fresh actual-detector/Reader recheck rendered all seven page-20 native canvases byte-for-byte identically to the recovery evidence and passed all 13 source/replay/navigation controls. Prepared pop estimates were 680.9–691.6 ms, including the 680 ms animation. These are minimal-DOM estimates, not phone or compositor measurements. Cold detection/preparation remains tens of seconds; the overall one-second requirement is not resolved.

The first saved APK contained the earlier edf3f4b web files and missed two later source fixes. The final delivery replaces every packaged web asset with the frozen current source, retains all 44 native entries byte-for-byte, aligns the package, and signs it with a new local debug key. A full Gradle rebuild was attempted and blocked by dependency resolution. APK signature v2, alignment, ZIP integrity, exact 184 web assets and the isolated Test168 identity all pass. Native 600 MiB streaming archive tests pass with a 32 MiB heap. Focused frame/preparation/navigation/service-worker suites pass. Browser brand/backup tests remain unavailable locally due the recorded Chromium socket restriction.

Install the separate Nth Shelf Test168 app, import your original issue #1, and check the whole issue, especially Reader page 20's seven selections. Report reader page/frame, screenshots and unexpected delays. Keep phone acceptance pending until Brad reports the result. After regression corrections, expand the detector with another comic. Automatic frame crop mode comes afterward.

Each of Tests164–168 retains its original preview and patch; the combined GIF shows all five actual native crops using captured Reader animation styles. It is an animation replay, not a phone recording. Source art and private proofs remain outside Git/CI. The Test168 patch includes both later web fixes and this delivery handoff; apply the earlier numbered patches first when restoring from Test163, or use current Test_Branch.

Final APK SHA256: f3d590f0eab108ebd53435ea8893cdd2e4a559286eb6effaf1cc49c78e015e58

Resume check snapshot: all seven fresh and saved-map crops match the saved native canvases. Both runs pass 13 source/Reader controls. Saved-map prepared estimates are 680.7–693.7 ms. The sequential retained prefix passed 154 checks; 24 of 109 remaining checks have passed at this snapshot, with no failures observed. The full retained run is still in progress and must not be reported as passed. Chromium checks are unavailable in this resumed environment because the executable is missing and the browser download is unavailable; the earlier socket restriction remains historical. Phone acceptance and cold/overall one-second timing remain pending.


</details>

<a id="archive-handoff-2-79-168-md"></a>

<details>
<summary>HANDOFF-2.79.168.md — historical checkpoint</summary>

# Test168 / 2.79.168: issue1 completion and regression APK

Brad approved Test163 and authorized finishing the five remaining originals in one batch, followed by an APK. Accepted visual baseline remains100/105; local coverage is105/105 originals:71 singles plus17 pairs =88 qualifying selections and rendered outputs. Phone acceptance is pending.

The final five are upper corpse (Test164), circular general reaction (165), narrow standing figure (166), red warrior/sword inset (167), and central ambush (168). Reader20 has seven owners including both retained bottom frames. The rejected broad host is replaced, never restored as a whole-page output. The ambush keeps its three yellow captions and speech; neighboring inset and terminal contours are excluded using authenticated source geometry.

The generic detector follows source sky components, circular ink seams, tall and sword anchors, constrained ink rims, and whole lettered light/caption bodies. It does not use comic titles, page numbers, dialogue strings, hashes or review coordinates. Native pixel witnesses and exact ordered owners are privately bound. Persisted maps replay predecessor/source geometry; changed providers, source state, navigation, missing/reordered owners and copied forged proofs close admission.

Fresh production detection and actual Reader native canvases were exercised on all24 pages. The other23 descriptor graphs equal the Test163 baseline. Page20's first four new crops equal their preceding checkpoints; both retained bottom crops are byte exact. Thirteen actual-source/Reader controls pass, including legitimate serialized replay producing a canvas. Public synthetic scope controls and Reader navigation/preparation contracts are separate from private art evidence.

Reader now prepares crop/display and tap admission during load. Sparse/null owner slots cannot abort preparation. Saved maps replay source and geometry before authenticated descriptors are frozen and indexed; the ordered owner array remains mutable so replacement/reordering still invalidates admission. Final persisted-map replay preserves all7 crop bytes, passes13 source/Reader controls, and has681–693ms prepared estimates. Shared/rounded and nested chromatic Reader caches preserve authenticated contexts while keeping source/navigation/provider guards. Rechecked affected pages4,7,9,12 preserve native crop bytes. The seven prepared page20 tap-to-finish estimates are681–688ms (native handler plus680ms animation), including all five new originals. These are minimal-DOM estimates, not compositor or phone measurements. Fresh page20 detection took16.8s and preparation3.17s. Cold detection and the overall one-second requirement remain unresolved.

The separate Nth Shelf Test168 APK is built and verified: package io.github.bdredenbach.nthshelf.frametest168, version2.79.168, code28096. Signature and ZIP integrity pass; all184 packaged web assets match the frozen source byte for byte. APK SHA256:230264154a0a34e09ac7430cf2c271c12568c3af0bed8c9e9c933234fb9ce527. Native600MiB streaming-archive tests pass. Browser brand/backup tests could not run because Chromium cannot create its profile socket here; the manual CI workflow retains those checks. Phone performance/visual regression is next.

Install Test168 separately, import Rise of Apocalypse issue1, and review the whole issue, especially Reader20's seven selections. Brad will report page/frame numbers and screenshots for corrections. After phone regression/corrections, widen the detector with another comic; automatic frame crop mode comes afterward.

Each completed original has a git patch, handoff and GIF. GIFs replay the actual native crop with captured Reader animation styles; they are not browser recordings. The five-frame recovery ZIP includes private maps, original-page crop evidence, verification logs, scripts, and commit mapping. Original art and private proof maps stay outside Git/CI. Source publication is Test_Branch only. The original four-issue archive can be restored from the previously saved source archive; recovery metadata records that identity. Current execution receipt is docs/evidence/validation/TEST168-VALIDATION.json. Historical checkpoint receipts remain historical.


</details>

<a id="archive-handoff-2-79-179-md"></a>

<details>
<summary>HANDOFF-2.79.179.md — historical checkpoint</summary>

# Test179: exact repeat-search reuse and a new issue audit

Test179 is an isolated candidate. All171 known fixed taps retain exact Test178 displayed PNG bytes and popup styles. The new issue is **not fully qualified**: four targets do not open,12 crop outcomes are incomplete, and four contain unwanted neighboring content. Three more need a speech/foreground ownership decision. No new-issue geometry fixes were added in this speed candidate.

## Responsiveness

The slow Wolverine issue2 Reader page5 frame2 takes246 rail searches on its first tap. Exact completed-search replay now avoids repeating that work after matching every analysis luminance byte and the complete supported seed/tap input. It does not give one-seed evidence authority over nearby taps. Cache storage is bounded to two pages and eight exact inputs per page; issue changes and closing a comic clear it. Changed pixels, dimensions, seed bounds, probe positions, flags and execution mode force fresh search. Returned geometry is cloned so caller mutations cannot poison retained evidence.

| Native handler benchmark, three isolated runs | Test178 median | Test179 median |
| --- | ---: | ---: |
| First tap | 6.831s | 6.401s |
| Identical repeat tap | 6.583s | 0.324s |

The identical-repeat median is 20.3x faster. All benchmark crop bytes and styles match. The first search is unchanged; its timing difference is not claimed as a reliable cold-speed improvement. These are handler timings in native NAPI canvas, not phone timings or animation-to-finish measurements. An adjacent tap remains a fresh search, and mobile fingers may not repeat an identical coordinate. This is a narrow reuse improvement, not a claim that every reopening is faster.

## Fresh regression

| Audit | Fixed taps | Result |
| --- | ---: | --- |
| Wolverine supplied issues1–3,22 pages |62|All exact to178;52 previously qualified complete story singles preserved|
| Sub-Mariner,22 pages |97|All exact to178, including boat, lettering groups and inset|
| Apocalypse issue2 heldout pages4,8,13 |12|All exact to178|
| Untouched Apocalypse issue3,23 pages |110|106 open; see outcome table and defects below|

All281 fresh taps have zero Reader exceptions.71 immutable page/supplement aggregate receipts cover70 unique page sources. All loaded production-script hashes, source hashes, fixed centers, target/aggregate correspondence, PNG hashes/decodes and known popup styles are verified.

## New issue outcome

109 taps were frozen before running the detector. Full source review found one omitted separate panel on Reader page23; one additional source-chosen tap was audited and is explicitly marked supplemental. No center was moved and no output-based rescue tap was searched. Source review also corrected three targets that share an existing source frame (page9 f02, page12 f05, page16 f04). Counts below are **tap outcomes, not distinct panel counts**.

| Outcome | Taps |
| --- | ---: |
| nonstory control | 2 |
| incomplete | 12 |
| complete single | 45 |
| review needed | 3 |
| no popup | 4 |
| contaminated | 4 |
| complete group | 37 |
| same scene control | 3 |

Complete groups retain the sampled scene with other scene regions; they are not qualified as separate scene popouts. Some represent shared speech or foreground compositions and need source-ownership judgment. Whole-scene grades are visual source comparisons, not an exhaustive native-alpha oracle. Cover controls only qualify opening. The page23 NEXT title is footer paratext; its inclusion is unqualified.

Clear misses and crop defects, with Reader page numbers including both covers:

| Target | Finding |
| --- | --- |
| p03-f01 | Top-right yellow narration caption is cut off; the eye/sphinx artwork otherwise opens separately. |
| p05-f01 | Left dialogue bubble is clipped by the measured contour. |
| p05-f02 | Sword-attack crop cuts the SWAK effect and the right side of the struck figure, and includes a neighboring speech fragment. |
| p05-f07 | Lower composition cuts the top of Isis's head and halo where it protrudes above the nominal row. |
| p04-f01 | Fixed source-enumerated target produced no popup. |
| p04-f02 | Fixed source-enumerated target produced no popup. |
| p04-f03 | Fixed source-enumerated target produced no popup. |
| p04-f04 | Fixed source-enumerated target produced no popup. |
| p04-f05 | Geometry-rescue quadrilateral cuts the bandaged figure on the left and includes artwork from the landscape above. |
| p06-f01 | Ra scene is retained but the crop also includes a clipped fragment of the lower-left scene's speech. |
| p06-f02 | Upper floating and burning-sands speech bubbles are omitted. |
| p09-f04 | The YOU speech tail is clipped at the right edge of the center strip. |
| p11-f02 | Upper Reed dialogue is cut off above the narrow scene crop. |
| p11-f03 | All central Pharaoh thought text is retained but a clipped neighbor dialogue fragment remains at the left edge. |
| p12-f02 | Wheel scene is retained, with cropped fragments of the bedside dialogue at its right edge. |
| p12-f03 | Two dialogue bubbles along the left boundary are truncated. |
| p13-f05 | Refusal crop omits the right-hand face/body and NO/Get away from me speech. |
| p15-f02 | Most of the right-hand dialogue above the leaning man is omitted. |
| p15-f03 | Pharaoh scene is retained but contains a clipped neighboring speech fragment at the left edge. |
| p16-f01 | Upper moon/halo arc is cut by the crop's top notch. |

Ownership review remains for page5 f04 (Isis halo crossing the row) and page22 f01/f02 (speech crossing into the lower group). Grouped selections and all individual notes are retained in the private evidence.

## Controls and packaging

31 new exact-search controls pass: complete-byte invalidation, neighboring taps and seed/identity/flag changes, kernel mode, caller mutation isolation, storage bounds, issue lifecycle, unsupported inputs, null misses, and real cached/uncached arithmetic parity with both JavaScript and WASM.59 existing scene controls,110 navigation controls and22 Apocalypse issue1 entry gates also pass. The entry gates are not a new88-tap issue1 replay. The unchanged source-layout module retains SHA2560ec2c0fde0ba8ae9d168060eaef9c5299eea16921b463790273abc097562ffd3.

Production logic changes are confined to js/panels-frame-envelope.js and the issue-lifecycle hooks in js/panel-map.js. index.html and sw.js carry Test179 identity. No comic title, page number, filename, frozen target, saved audit envelope or artwork hash selects production geometry. Full analysis luminance comparison validates reuse; it is not a known-art lookup.

The signed APK uses io.github.bdredenbach.nthshelf.frametest179, label Nth Shelf Test179, version2.79.179 /28107. It is a verified Test178-shell repack, not a Gradle rebuild. All186 packaged web assets are exact, all42 native entries outside manifest/resources are unchanged, ZIP integrity/alignment and v2 signature pass, and package identity and launch activity are verified.163 JavaScript files parse.

APK SHA256: c396ba6955687787d7372af16eb3f925d20a04ab004b538edccd5937d658cf66
Frame-envelope module SHA256:42ec85329bd7125a24415c7a86a2b39a56959d94e60e4b254d91354e2eb70c79

Browser compositing, actual Worker/IndexedDB behavior, Android rendering, app-restart cache behavior and phone interactions remain unqualified. The native harness executes production detector/Reader/map mathematics and emitted CSS clipping in a minimal DOM. Source173 remains accepted; Test179 is neither promoted nor pushed.

Next detector work should target the landscape title-page misses, whole speech/foreground ownership in the new issue, and the unchanged costly first/nearby-tap fallback. Preserve the171 exact known outputs while doing so.


</details>

<a id="archive-handoff-apocalypse-audit-md"></a>

<details>
<summary>HANDOFF-APOCALYPSE-AUDIT.md — historical checkpoint</summary>

# Apocalypse audit and connected-scene handoff

Date: 5 October 2026. User approved retaining these findings and using connected two-frame scenes as an accepted output going forward. This is the authoritative audit checkpoint, replacing the earlier provisional 360+ count and raw-selection coverage estimate.

## Baseline and rules

Frozen detector: Test90 / 2.79.90 at `25fb96b5ee35a7d62ca9d5fd44fdf584995075b0`. All 91 image pages reproduce the same 185 descriptors. All actual `Reader.zoomToPanel` canvas crops were rendered with native canvas and visually reviewed alongside original artwork. The user has approved the acceptance rule; physical Android confirmation of individual results is still pending.

Exactly one complete frame, or exactly two complete adjacent frames continuing the same immediate scene, qualifies. All owned speech, captions and artwork must survive. Time/location jumps, unrelated scenes, composites of three or more frames and damaged crops fail. One pair contributes two covered frames but one accepted pop-out. Prefer existing complete singles; preserve accepted ownership and regression behavior. Pixel geometry proposes groups; manual content review determines narrative continuity.

| Issue | Image pages | Frames | Singles | Pairs | Covered | No qualifying selection | Damaged frames | Remaining |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 24 | 99 | 26 | 3 | 32 | 66 | 1 | 67 |
| 2 | 23 | 97 | 34 | 5 | 44 | 50 | 3 | 53 |
| 3 | 23 | 110 | 42 | 2 | 46 | 43 | 21 | 64 |
| 4 | 21 | 79 | 31 | 0 | 31 | 40 | 8 | 48 |
| Total | 91 | 385 | 133 | 10 | 153 | 199 | 33 | 232 |

Singles-only remainder: 252. Connected-scene remainder: 232. Pair benefit: 20 frames, 5.2 percentage points of inventory coverage, 7.9% of the singles-only remainder. There are 31 damaged selections covering 33 frames: 29 singles and two pairs. The 185 raw selections comprise 162 single candidates, 12 same-scene pair candidates and 11 rejected outputs; 133 singles and 10 pairs are complete.

## Counting conventions

Reader pages are 1-based and include two covers per issue; all eight covers are excluded. A distinct bordered panel or borderless repeated-character narrative vignette counts once. Multiple characters, architectural ornament, multiple captions or a scanning seam in one continuous illustration do not create extra frames. Decorative credits and preview lettering are not frames. Some freeform montages require judgment, especially issue 3 page 21, counted as five reaction/conversation vignettes plus one bottom frame. These are reviewable manual counts.

Important corrections: issue 2 page 13 upper recollection is one continuous frame; issue 4 page 4 skull chamber is one continuous landscape scene despite its scanning seam; issue 4 page 14 tall En/sphinx view is one frame. Issue 3 page 6 tiny selection 5 is a false fragment. Issue 3 page 16 bottom strip and page 20 selection 3 each contain one frame. See page notes for other decisions.

## Accepted connected pairs

Selection IDs match the stored Test90 output order.

| Issue | Reader page | Selection | Immediate scene |
| --- | ---: | ---: | --- |
| 1 | 13 | 1 | Reaction portrait and En over fallen opponent; same fight |
| 1 | 21 | 2 | Baal and En narrow views; same cave conversation |
| 1 | 21 | 3 | Middle and bottom battle views; same exterior fight |
| 2 | 15 | 4 | Logos and Ozy views; same pyramid argument |
| 2 | 16 | 2 | Walking legs and En answer; same cave walk |
| 2 | 16 | 3 | En carrying Baal and following conversation; same cave walk |
| 2 | 20 | 5 | Desert surface and hand breaking earth; same emergence |
| 2 | 23 | 1 | Tall palace view and En below receiving tears; same palace moment |
| 3 | 11 | 5 | En awakening and Nephri explaining; same chamber conversation |
| 3 | 14 | 4 | Ozy answer and Pharaoh shouting; same throne conversation |

Two further semantic pairs are damaged: issue 3 page 6 selection 2 (circle and street), and page 13 selection 5 (mouth and chamber). They remain in the recovery queue. Issue 2 page 12 selection 3 spans an explicit weeks-later transition and is rejected. Larger merges remain rejected even when all their scenes are related.

## Prioritized recovery queue

1. Interior/exterior ownership: page-matte colors inside faces, white clothing, balloons and captions become transparent. Closed interior holes require different handling from true inset holes or gaps between disjoint frame contours. Issue 2 page 16 selection 2 has two legitimate disjoint contours; preserve the gap. Boundary-connected damage also exists, so removing inner rings alone cannot fix all 33 frames.
2. Owned speech crossing gutters: issue 1 page 16 selection 5 loses the top of its speech balloon. Preserve ownership rather than adding every nearby fragment.
3. Larger composites: examples issue 1 page 23; issue 2 pages 8 and 14; issue 3 page 21; issue 4 pages 15 and 17. Recover physical internal borders and insets before grouping at most two.
4. Irregular, olive/grey or jagged gutters, curved reaction insets, page-edge rails and foreground crossings.
5. Landscape/open main scenes around valid accepted inset owners. Do not invent frame divisions at scanning seams.

Recovery notes and prospective pairs in the JSON are hypotheses, not verified improvements. Record repaired existing frames separately from newly detected frames; count only complete reviewed output as a coverage gain.

## Durable evidence and next steps

- [91-page decisions and source hashes](docs/apocalypse-test90-audit.json), with every missing-frame description, rejected selection, crop defect and possible recovery idea.
- Detailed visual report: `Nth-Shelf-Test90-Apocalypse-Audit.html`, Library identity `libfile_c555c384890881919c5dc9c806e89274`.
- Full machine-readable audit with detector contours: `Nth-Shelf-Test90-Apocalypse-Audit.json`, Library identity `libfile_b49577b441e88191a27c7d703bd079e2`.
- Source archive: `Rise of Apocalypse 001-004 (1996) (Digital) (Shadowcat-Empire)(3).zip`, Library identity `libfile_06c168de85c08191ba461ab9ef2cdba5`. Use the hash recorded in the audit when restoring private fixtures.
- Test90 APK identity/build evidence: [versioned handoff](HANDOFF.md#archive-handoff-2-79-90-md), [validation](docs/evidence/validation/TEST90-VALIDATION.json); 82 retained suites pass at that checkpoint.

Continue on `Test_Branch`. First implement a bounded pixel/contour ownership repair and review original targets. Preserve complete singles and pairs, avoid borrowing neighboring art or filling true inset holes, then rerun the broader comics/manga fixtures and retained tests. A later versioned handoff should add measured before/after counts and verified APK status while retaining this frozen baseline.


</details>

<a id="archive-handoff-apocalypse-single-dual-md"></a>

<details>
<summary>HANDOFF-APOCALYPSE-SINGLE-DUAL.md — historical checkpoint</summary>

Test122 recovers ONE original, Reader5 S1/P05-F1 night camp. Current focused count30 singles+5 pairs=40/99 originals;59 remain,35 qualifying steps/53 selections. Test121 direction/sandstorm pair user-confirmed: "Yes that worked 💪🏻 Let's continue". Test122 phone acceptance pending. Next Reader5 P05-F2 horsemen conversation, one original by default or at most a justified immediate pair. Finish comic1 before comic2. Automatic playback/timer remain planned.

Current checkpoint: HANDOFF-2.79.122.md and docs/evidence/validation/TEST122-VALIDATION.json.

Test121 update: user confirmed Test120 campfire worked and requested two originals this checkpoint. Reader3 F3/F4 is a justified consecutive direction/sandstorm continuation with bridging speech; one new pair covers two originals. Local29 singles+5 pairs=39/99,60 remaining; all51 earlier native crops and33 qualifying steps retained. Reader3 complete locally. New pair phone review pending. Next Reader5 P05-F1. Current facts in [HANDOFF-2.79.121.md](HANDOFF.md#archive-handoff-2-79-121-md) / [TEST121-VALIDATION.json](docs/evidence/validation/TEST121-VALIDATION.json).

# Current single/dual-frame rules —7 October2026

Brad requests ONE complete frame per checkpoint, or at most TWO when immediate continuity requires joint presentation. Finish comic #1 before #2. Older nine-original batches and page-level scene-group success are superseded.

Default to one original with all owned artwork, captions, balloons and sound effects. A pair needs adjacent consecutive originals and immediate action/dialogue or shared composition. Same page, location or recurring characters alone is insufficient. Meaningful time/location jumps fail. Phone readability needs user review.

A genuine one-panel splash counts once. Covers, credits, decorations and previews add zero originals. Three-or-more-frame groups, missing owned content, clipped lettering and substantial partial neighbors fail focused extraction. Incidental gutter traces/shared foreground are not additional frames.

Unresolved segmentation stays in normal-page reading. Future automatic reading should pause for manual reading there, with adjustable time starting after animation settles. Automatic reading is not implemented by this checkpoint.

Count reading steps separately from unique originals. One accepted pair =one step/two originals. Duplicate/rejected selections add zero. Keep old preservation counts distinct. Use only structural image evidence at runtime, never book/page/title/text/hash/fingerprint lookup crops. Offline labels are for regression/review only. Keep comic artwork out of git/CI.

Test119 strict baseline:24 images/22 story pages/99 originals/51 pop-outs.28 singles+4 pairs cover36 originals,63 remaining.19 rejected:10 oversized,6 mixed-neighbor,3 damaged. docs/apocalypse-single-dual-baseline.json and private review libfile_de9bbc20358881919fad40048250a904 record exact inventory. Historic83/99 and327/384 were broader preservation. Test90 tolerated foreign speech fragments that now fail. Do not rewrite history as measured runtime loss.

Test120: one new single, P03-F2/campfire Reader3 S1.29 singles+4 pairs=37/99,62 remaining. All32 earlier qualifying steps and50 other native issue1 canvases stay unchanged. Next P03-F3, or P03-F3/F4 only if immediate continuity and complete extraction pass review. Current build/phone state is in docs/evidence/validation/TEST120-VALIDATION.json/HANDOFF-2.79.120.md. Other18 failed selections remain queued; no universal extraction claim. Phone acceptance pending.

Persistent rules handoff libfile_b40550a56110819197ad1ffa78ce2e9c. Baseline JSON libfile_6e3a72b201188191b423f95684ae2b73, checkpoint libfile_748f678d26b08191bfb17bde57758930, full Test119 maps libfile_b32ae41c228881918a0cbc3a2a7a6c8d. Authorized originals libfile_06c168de85c08191ba461ab9ef2cdba5. Restore current source and verify all hashes before map reuse. Update the same rules handoff after every checkpoint. bdredenbach/Nth-Shelf Test_Branch only; publication/build authorization persists.


</details>

<a id="archive-handoff-apocalypse-test95-regression-md"></a>

<details>
<summary>HANDOFF-APOCALYPSE-TEST95-REGRESSION.md — historical checkpoint</summary>

# Test95 Apocalypse fresh regression — 5 October 2026

Brad requested a full Apocalypse regression, counting two complete original frames in one pop-out as two, larger groups by their frame totals, and recording recovery ideas for misses.

The fresh local replay covers 91 pages and 186 page-map selections. Every detector descriptor matches the saved Test95 checkpoint. Actual Reader.zoomToPanel crops were inspected against original source pages; all 186 selections have sampled findPanelAt reachability. Brad completed the phone sweep after the local review and confirmed all 189 complete frames on 5 October 2026. Phone timing was not measured. Tap-dependent fallback searches outside page-map selections are not exhaustively tested. Brad separately phone-confirmed the Test95 hand/water repair.

| Issue | Original frames | Complete frames popped | Remaining | Pop-out selections |
| --- | ---: | ---: | ---: | ---: |
| 1 | 99 | 36 | 63 | 31 |
| 2 | 97 | 54 | 43 | 47 |
| 3 | 109 | 62 | 47 | 64 |
| 4 | 79 | 37 | 42 | 44 |
| Total | 384 | 189 | 195 | 186 |

150 complete single-frame crops, ten complete two-frame crops, and six larger/mixed crops containing 19 complete frames produce 189 unique original-frame credits in 166 selections. No frame is credited twice. A mixed crop only receives credit for its complete original frames. Clipped art/dialogue, credits, banners and false fragments add zero.

The earlier 185 was Test90’s raw selection total. Test95’s raw total is 186. The earlier 171 complete-frame count used the stricter single/exact-pair grouping rule. The broader rule adds 18 frame credits overall; this is accounting, not a detector improvement.

Native review also corrects earlier manual judgments: issue 3 Reader 12 S2 is complete (+1); Reader 13 S1 and S2 clip their own dialogue (-2); Reader 13 S5 contains one complete lower chamber frame (+1). The net correction is zero. Reader 13 S6 is a false fragment of the continuous hand/wrist action, not another original frame: inventory 7 becomes 6, and total inventory 385 becomes 384. The clipped upper hand/wrist action remains incomplete.

## Recovery queue

Each page has fresh observations and specific hypotheses in [the descriptive ledger](docs/apocalypse-test95-regression.json). The saved visual HTML review contains every source page beside actual Reader crops, with expandable pages and crop enlargement; private artwork is excluded from git/CI.

Prioritize owned speech across gutters and enclosed-art opacity for damaged selections, then narrow strips/inset rims on zero-selection pages. Blue sky, brown stone/skin and light clothing can match exterior matte; clearing pixels needs physical boundary evidence. Landscape halves must be reunited when the scene and inset rims cross the scan seam. Split intact larger crops to improve navigation without claiming those already counted frames as new coverage.

Published detector: Test95 / 2.79.95, commit bb4ea1427f3feb2930002372cc7ffd2964134986. Source hashes match the prior private audit. No detector, package, APK or publication was changed for this regression. Earlier checkpoint validation remains historical; use this audit for the current count.


</details>

<a id="archive-handoff-detector-source173-md"></a>

<details>
<summary>HANDOFF-DETECTOR-SOURCE173.md — historical checkpoint</summary>

# Source173 accepted detector baseline

Reconstructed from exact Test168 web assets and the accepted combined detector patch. The original local commit was 282ac8f06ee99625b3db531a535c90e16a3e00e3; this reconstruction receives a new Git commit and does not reproduce that commit identity.

Source module SHA256: e6a1866ab33effad2123a328432c614e923f9357f3232eaad3e60f5aefeba1b7.

The accepted native audit has 97/97 fixed-center taps opening with zero Reader errors. Its 95 story targets comprise 73 usable singles, 19 groups and three partial/wrong targets, recovering 16/19 original failures. The 12 independent full-detector crops/styles match, and 22 approved entry gates and Reader bytes remain preserved. The entry-gate check is not a fresh 88-tap replay.

This baseline retains the general source-measured detector, Reader protections and synthetic controls from sources169–173. Audit centers and crop coordinates do not supply production geometry. Comic artwork, native audit images and private source receipts remain outside Git.

Browser/compositor, phone/Worker/cache lifecycle and cold/warm performance qualification remain pending. The phone build remains Test168 / 2.79.168. This source commit does not produce an APK or promote a candidate.


</details>

<a id="archive-handoff-detector-source176-md"></a>

<details>
<summary>HANDOFF-DETECTOR-SOURCE176.md — historical checkpoint</summary>

# Source176 shared-lettering candidate — UNACCEPTED

This candidate is based on accepted source173. A source-measured shared group preserves the complete participating lettering and scenes, while the participating inset also receives an independently selectable popup ordered before the group. Independent smaller inset ownership and ambiguous tokens defer. Serialized group proofs bind native pixels, including edits invisible to the coarse analysis. Comic names, saved tap centers and audit crop rectangles do not generate production geometry.

Source module SHA256: b26e8c06f7ce353c220aba634ae8535b3be5bae88dde63dbf5cbf51fe17e682f.
Accepted source173 SHA256: e6a1866ab33effad2123a328432c614e923f9357f3232eaad3e60f5aefeba1b7.

## Qualification recorded before publication

- 97/97 fixed-center Reader/native receipts open; zero Reader errors. The complete receipt verifier passed again before publication.
- 94 crops/styles match source173 exactly. The two page17 lettering targets become shared groups; the lower-right inset remains independently selectable.
- All 73 accepted singles remain usable: 72 byte exact and one inset freshly reviewed against its source and baseline.
- All 12 independent full-detector crops/styles match. All 22 approved entry gates and Reader bytes are preserved; this is not a fresh 88-tap replay.
- 54 existing source controls and 24 independent synthetic shared-lettering controls pass, alongside 110 navigation controls and 186 shell-file checks. The 24 shared-lettering controls were rerun before publication.

The provisional native story grade is 73 singles, 21 groups and one partial/wrong target, recovering 18/19 original failures. Shared groups are never graded as usable singles. Accepted counts remain source173's 73/19/3 and 16/19 until rendering qualification.

## Remaining work

1. Verify actual Reader/compositor rendering of the whole lettering group and independent inset in a permitted environment. The recorded rejection of local file browser navigation remains in force; do not bypass it using tunnels, encoded pages, alternate browser surfaces or hosted wrappers.
2. Separately reconstruct the lost source175 boat foreground improvement from source pixels and independent alpha controls. Source175's exact candidate bytes could not be recovered; its boat fix is absent here.
3. After combining any qualified fixes, repeat the 97-tap, 12 independent-crop and 22 entry-gate regressions. Qualify cold/warm phone behavior, Worker/cache lifecycle, memory and performance before rollout.

Comic artwork, source scans, native crops, frozen audit coordinates and private receipts remain outside this public branch. They are preserved in the separate candidate evidence archive. This Git publication does not accept source176, change the installed Test168 app or authorize an APK build.


</details>

<a id="archive-handoff-test32-md"></a>

<details>
<summary>HANDOFF-Test32.md — historical checkpoint</summary>

# Nth Shelf — Test32 recovery checkpoint

## What this ZIP contains

This is a full project snapshot based on GitHub Test_Branch commit
015bacff2d4c8d051c7232c3e6b180deedcc67f8, with the accepted Test32 APK's
64 web assets imported locally. All 40 JavaScript files are byte-identical to
the supplied APK. The only changed packaged web asset is the requested sw.js.
The repository's Android/native source, existing tests, and historical README
are retained. No new native APK was built.

## What is actually on GitHub

The README upgrade, safer service worker for the older repository runtime,
checkpoint records, and guarded one-time importer have been committed to
Test_Branch. The complete Test32 runtime has NOT yet been transferred there.
The README in this ZIP describes the imported LOCAL source, not proof that the
remote branch has completed its import.

To finish the remote import, open Test_Branch in GitHub, choose Add file > Upload
files, and upload the exact Nth-Shelf-Frame-Test32.apk to the repository root.
Keep that filename. The installed workflow checks the APK's SHA-256, refuses
conflicting/newer source, imports only web assets, tests the result and commits
without rewriting Git history. Do not upload Wolverine 1000.zip.

## Protected baseline and next version

Page41 is accepted. Preserve its five tall middle panels and earlier accepted
frames. Page42 remains the next target; pages43–44 follow. Version 2.79.33 is
reserved until page42 works and passes acceptance. This is NOT that release.

Historical Test32 results remain recorded separately: 162 targeted checks,
400 selected Page Deck checks, 296 prior descriptors, 301 total entries.
Their original raw reports were not supplied in this handoff. The fresh local
Chromium capture completed 74 images with 298 page-level entries; page41 has
nine, including the five new columns. The historical 301 total was not
reproduced. Do not treat this as full historical parity or a new phone test.

## Evidence included

qa27900/frame-accuracy/test32/fresh74-descriptors.json.gz is the complete fresh
capture, without comic image bytes. fresh74-hash-summary.json contains per-page
image/descriptor hashes. apk-assets.json records the original packaged assets.
The compact Git summary, cache tests and portable capture script are included.

No comic pages, comic archives, recordings, user library or signing keys are
included. Keep these QA records outside the Android web asset bundle.


</details>

## Historical Android branch README at f55efa2

<details>
<summary>Historical Android documentation — not current Test_Branch instructions</summary>

<p align="center">
  <img src="icons/icon-maskable-1024.png" alt="Nth Shelf app icon" width="120">
</p>

<h1 align="center">Nth Shelf</h1>
<p align="center"><strong>Your comics. Your library. One frame at a time.</strong></p>
<p align="center">Android · Version 2.79.88 · Latest approved upgrade</p>

---

## Bring the whole scene into focus

Nth Shelf is a local-first comic reader and personal comic library for Android and the web. Its panel pop-outs bring individual scenes closer while keeping the artwork and dialogue together.

The current upgrade improves recognition of thin-bordered panels surrounded by softly changing background colors. A gutter can fade from one shade to another, and the reader can still follow the frame around the complete scene.

## What’s new in 2.79.88

- **Complete scenes:** recover enclosed panels that were previously missed against gradient gutters.
- **Dialogue stays with the artwork:** the newly recovered tall scene includes all its speech balloons.
- **Earlier selections stay intact:** established frame boundaries and ownership remain unchanged in the verified comparison.
- **The same contour throughout:** the reader uses the validated outline when displaying the panel pop-out.

Panel coverage continues to grow. This upgrade adds a confirmed complete scene; detection across every layout remains a work in progress.


</details>

## Historical Android module README at f55efa2

<details>
<summary>Historical Android documentation — not current Test_Branch instructions</summary>

# Nth Shelf for Android

**Version 2.79.88 · Current approved panel upgrade**

The Android app includes the current reader with improved recovery of complete thin-bordered scenes against gradient gutters. The newly recovered tall scene on Rise of Apocalypse issue 2, reader page 17/23, includes its speech balloons and has been confirmed working by the user.

## Install the current build

Open the [Android build downloads](https://github.com/bdredenbach/Nth-Shelf/actions/workflows/android-apk.yml?query=branch%3AAndroid), select a successful run, and download its APK artifact.

The debug APK appears on your device as **Nth Shelf Test88** and installs separately from the stable Nth Shelf app. Import your own comic into that app to read and try its panel pop-outs.

| Build detail | Current value |
| --- | --- |
| Version | 2.79.88 |
| Android version code | 28016 |
| Debug app label | Nth Shelf Test88 |
| Debug application ID | `io.github.bdredenbach.nthshelf.frametest88` |
| Minimum Android version | Android 7.0 / API 24 |
| Build tools | Java 17, Gradle 8.9, Android SDK 35 |

## Build from source

The Android module copies the repository's current reader assets into its WebView shell on every build.

```bash
gradle --no-daemon -p android :app:assembleDebug
```

The APK is written to `android/app/build/outputs/apk/debug/app-debug.apk`.

GitHub Actions builds both the Android and test branches. It runs the retained frame checks, browser and backup checks, and native archive tests, then verifies the APK signature, identity and exact packaged reader files.

The downloadable APK uses a CI debug key. It is an installable test build; a store release needs production signing.

[Read about the current upgrade](README.md)


</details>
