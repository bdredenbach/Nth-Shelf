# 2.79.22 Test 1 — forest and borderless portrait

FQ-10 continues from the positive fortifications phone result in 179382.mp4.
The remaining forest and Wolverine portrait now open separately in local tests,
including both captions in each region. The three earlier working page-11
panels retain their original identities. Phone acceptance remains pending.

## Changes

The forest's four outside rails already passed the existing proof. Interior
tree trunks were being treated as panel dividers because they form long dark
runs between the borders. On the exterior-gradient refinement route only,
a divider must also remain a separating ridge at both outside-border joins.
Trunks merging into broad ground/sky ink no longer veto the scene. The strict
closed-frame route is unchanged; full and interrupted divider, inset, missing
border, gutter continuity and corner checks remain covered.

The borderless portrait has its own `open-region` proof. It requires three
independently accepted exterior-gradient neighbors: full-width frames above
and below and a side frame occupying the row. The remainder must contain one
dominant artwork component; smaller caption components remain included. The
complete crop perimeter must sample exterior-connected quiet background.
Missing/unproved neighbors, empty space, two dominant scenes, known inset
frames and crossing artwork cause abstention in the synthetic controls.

A bounded 2–4 analysis-pixel search chooses the first quiet line below the
upper border, handling decoder ink fringes without relaxing the background
proof. The crop follows the neighboring rails, and true polygon overlap
checks prevent collision with sloping neighbors. It is not labeled as an
ink-bounded frame, and the geometry router preserves its measured polygon.
No page numbers, source coordinates or comic-specific overrides enter runtime.

The existing composite remains unchanged as fallback outside the new regions.
This is a bounded adjacent-frame layout rule, not a general solution for all
borderless artwork, nested frames or caption grouping.

## Verification

- 74-page real Chromium comparison against 2.79.21: only page 11 changes,
  from four identities to six (five individual regions plus the preserved
  original composite). Every earlier identity remains exact; other 73 pages
  are unchanged.
- 50 native Chromium touch/rendered-overlay checks through IndexedDB and the
  real Reader: all five page-11 panels, center/left/right/top/bottom, repeated
  twice without clearing cache. Whole forest and portrait screenshots were
  visually inspected; each retains both captions, with no neighboring panel.
- 451 local Reader-handler artwork checks pass. This includes 383 prior
  applicable checks and 68 new forest/portrait/control checks using Sharp and
  low/medium/high Skia resampling. The prior forest/portrait *composite* tap
  assertions are replaced by whole-region assertions; both lower legacy strip
  assertions and all earlier fortifications/artwork controls remain.
- The synthetic forest-like fixture reproduces the old rule's rejection and
  passes the candidate. True full/interrupted dividers still reject its union.
- New open-region synthetic checks cover mirrored layout, decoder fringe,
  captions/artwork, absent or weak neighbors, two-scene ambiguity, empty
  space, crossing artwork, known inset and conflicting identity rejection.
- Existing geometry, gutter, partition, pilot, bubble and cancellation gates
  pass. CI additionally gates browser/backup behavior, archive streaming,
  Android package metadata and signature before APK delivery.

Run the private-original browser check by serving the repository parent with
`comic-wolverine-1000/` beside it:

```sh
NTH_BASELINE_URL=http://127.0.0.1:8765/nth-shelf-baseline21/ \
  node qa27900/browser-page11-artwork.cjs --comic
node qa27900/open-region-artwork.cjs --comic --skia
```

Set `CHROME_BIN` if needed and `NTH_QA_OUTPUT` for screenshots/reports. The
source comic, recording, decoded pixels and screenshots stay out of the repo
and APK. Independent labels are in `queue-artwork-27922.json`.

## Phone check and remaining queue

On page 11, tap left, right, center, top and bottom inside the forest and
portrait. Each result must contain the whole scene and both captions, with
no fortifications or other neighboring artwork. Recheck fortifications, both
lower strips and page 19's middle scene. All prior phone controls remain.

FQ-10 stays open pending device acceptance. Pages 9–10, page-19 upper groups
and syringe, page-6 uncertainty and explicit second-level bubble tests remain
queued. Bubble algorithms and navigation gestures are unchanged. No device
latency or full-comic five-position certification is claimed.

Version: `2.79.22-test1`; Android code `27926`; shell/map/proof versions advance.
