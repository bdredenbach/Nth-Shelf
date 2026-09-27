# Test69 — explicit orthogonal white-gutter proof

Test69 formalizes a layout that the existing paper-cell raster already handled
correctly: comic panels separated by straight white gutters with no black frame
requirement. The new proof does **not** run a second image scan. It specializes
an already-valid proof-18 paper-cell map only when the complete map forms a
coherent near-orthogonal multi-row layout.

Promotion requirements:

- 4–12 existing proof-18 owners from the same analysis raster;
- page-edge palette is paper and every sampled page edge matches that paper;
- no inferred seed splits or recovery mode;
- one contour per owner, with at least 82% owner fill and 68% seed fill;
- 2–6 aligned rows, each containing 2–6 cells;
- top/bottom row-edge spread stays within 4% of page height;
- horizontal neighbor gaps may only touch by antialiasing tolerance (0.6% of
  page width) or separate by at most 12%;
- row-to-row white gutter separation is 0.4–12% of page height.

The geometry is copied verbatim from the already-proved source owners. Proof 26
changes ownership semantics only; it does not redraw a rectangle around the
panel.

Across all 91 supplied Rise of Apocalypse page images, exactly one page
qualified: issue 2 page 6. Its six existing paper-cell owners are promoted to
six proof-26 `orthogonal-white-gutter-cell` owners across two rows. All x/y/w/h
values and pixel contours are byte-for-byte equivalent to the source proof-18
geometry. The other 90 pages abstain.

Synthetic contracts cover a 2×2 white-gutter page, a vertically misaligned
false grid, a cross-row art bridge, proof tampering, structural-grid routing,
and complete-contour reader authority.
