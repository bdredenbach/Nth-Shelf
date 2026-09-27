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
Build and final validation are recorded in `TEST66-VALIDATION.json`.

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

CI build and artifact verification pending the source checkpoint push.
