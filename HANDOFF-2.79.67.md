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
