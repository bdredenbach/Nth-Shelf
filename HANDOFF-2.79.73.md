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

Publication, fresh Gradle build and downloaded-artifact verification are pending.
Update TEST73-VALIDATION.json only with observed results. Phone acceptance is
pending. Source artwork and screenshots stay in the private reproduction
workspace `/mnt/data/test73_workspace`, not in the repository.
