# Test63: independent single-frame and page-edge recovery

Eight new contours on seven previously empty Rise of Apocalypse pages. All seven maps remain partial. This extends the pixel-derived ragged-gutter fallback only after both v18 and v19 acceptance fail. The v20 owner must have an unsplit connected seed, no more than one open page edge, at least 73% envelope occupancy, at least 68% seed occupancy, no substantial internal exterior gutter, and no conflicting accepted neighbor. Existing accepted output has priority.

The contract checks eight captured geometry descriptors, rejects 120 invalid variants, preserves contours through the geometry router, and draws arbitrary one-edge / two-edge rasters at two sizes. No artwork, page lookup, filename, image fingerprint, supplied tap, or saved frame coordinates participate in runtime detection. The geometry fixture is test-only.

The private full-corpus browser comparison covers 312 pages: 91 Apocalypse images plus 221 earlier manga, Magneto and Wolverine images. `TEST63-VALIDATION.json` records the finished comparison, new-frame reader checks and known missing pages. A passing map comparison preserves the baseline; it does not certify that every frame in that baseline is correct. Phone acceptance remains pending.

A broader 65% seed threshold was rejected after visual inspection exposed a clipped speech-balloon chain. Alternative edge-palette trials were not shipped. Further work is needed for connected insets, overlapping foregrounds, missing balloon outlines and colored frame rails.
