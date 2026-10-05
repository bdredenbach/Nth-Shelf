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
