# Test66 — independent frame recovery

This iteration extends three kinds of image evidence without replacing accepted
frame selections:

- Continuous, saturated exterior color ramps close gaps between sampled gutter
  colors. An addition still needs its own enclosed, compact, unsplit pixel mask
  and cannot take a pixel from an existing owner.
- Paper cells must agree at two erosion scales. A very small disagreement is
  accepted only beside measured exterior paper or an independently measured
  narrow, unlettered paper corridor. The selected mask keeps its original art
  and dialogue. This route only runs when the previous map is empty.
- Colored rims require long horizontal and vertical narrow strokes with dark
  collars, an enclosed textured scene, and four supported sides. Speech bodies
  are restored only when their surrounding evidence assigns them to that scene.
  This route also only runs when the previous map is empty.

Runtime decisions contain no book identities, filenames, page numbers, saved
frame coordinates, or tap-dependent templates. Captured geometry fixtures are
test-only and contain no comic artwork.

The new contracts cover proof integrity, geometry routing, arbitrary synthetic
pages, and abstention on uncertain boundaries. Full-corpus comparison and
actual reader checks are recorded in `TEST66-VALIDATION.json` at repository root.
A passing comparison preserves the baseline; it does not certify completeness
or correctness of every pre-existing frame. Phone acceptance remains separate.
