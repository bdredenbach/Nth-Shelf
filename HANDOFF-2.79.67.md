# Test67 — paired chromatic Apocalypse inset recovery

Base: verified Test66 checkpoint `555d0c3f5a7c01a576864c1e29ffc1ec4706f003`, branch `Test_Branch`, repository `bdredenbach/Nth-Shelf`. Accuracy remains ahead of speed; standalone bubble selection comes later.

Test67 adds proof version 24, `paired-chromatic-perimeter-components`, as a late empty-map fallback inside `PanelColoredRims`. It addresses decorative colored inset borders whose four sides are split between one or two nearby connected color components. Candidate unions need four supported sides, at least two strongly supported sides, low chromatic fill, a textured interior, bounded page margins, and no competing high-overlap owner. The runtime scan is reduced to a maximum 480-pixel dimension after Test66 chromatic-rim recovery abstains.

On the supplied four-issue Rise of Apocalypse archive (91 page images), direct proof-24 scanning returned owners on exactly one page: issue 4/page 11. Test66 returned zero there; Test67 returns two complete rectangular owners corresponding to the tall upper-left blue-bordered inset and the wide lower-right blue-bordered portrait inset. The new route abstained on the other 90 Apocalypse pages.

The detector remains image-derived. Runtime code contains no book/title/filename/page/hash/tap lookup or saved target coordinates. Proof version 24 is routed as authoritative complete-contour geometry, and reader edge-spill expansion is disabled for that proof just as for Test66 proofs 21–23.

Retained Test66 contracts for continuous gamut, stable paper, colored rims, and reader contour behavior pass. Test67's synthetic contract passes at two sizes with four owners total, including split and single-component perimeters; open frames and flat interiors abstain; 14 proof-tamper mutations are rejected. The full historic 312-page artwork corpus is not present in this chat runtime, so do not claim a new 312-page pixel-for-pixel comparison for Test67. CI retains all repository contracts; phone acceptance is still required.

Identity: version `2.79.67`, code `27995`, package `io.github.bdredenbach.nthshelf.frametest67`, label `Nth Shelf Test67`, shell `nth-shelf-shell-2.79.67`, map `panel-map-exp-65`, proof `frame-proof-2.79.67`.

Build/source publication fields are pending until the Test67 checkpoint is pushed and CI artifact verification completes.
