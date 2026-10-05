# Test83: context-stable enclosed cells

The Test82 detector remains the owner of existing frames. A new supplement asks the retained ragged-gutter algorithm to find complete cells in generic page windows. A window and its four-pixel expansion must independently produce the same physical contour at seed radii 4 and 6. Both perimeters are then checked against the original page pixels. A temporary window edge is never sufficient evidence for a frame.

The opt-in `analyzeContextCandidatesRGBA` API permits a single local seed while leaving the retained detector's default and cooperative policies unchanged. Proof35 validates all four source geometries, integer seed counts and indices, matching palettes, mask consensus, exact pixel contours, per-side boundary samples, color evidence and global geometry. Serialized validation checks recorded geometry and evidence consistency; it does not re-read original artwork pixels. Live proofs and contours are frozen and checked by identity and bounds.

Existing frame descriptors and reading order keep priority. Every addition must have zero pixel overlap with existing owners and other additions. Internal paper corridors or dark rails reject merged scenes. Flat backgrounds, monochrome pages, low-variety colored captions, invalid alpha and malformed owner bounds abstain. Search is bounded to six windows ranked by unowned colored pixels; fewer than 0.3% such pixels skip the pass.

## Reproduce checks

```sh
bash qa27900/frame-accuracy/test83/run-retained.sh
```

The flat runner retains the older geometry, interaction and crop contracts. It adds a captured original-page proof, 32 corruption checks, synthetic append-only/disjoint ownership checks, single-cell opt-in and retained-policy checks, reader contour preservation, and Test83 cache/package identity. Artwork is not included in this repository or CI.

For an optional native-canvas corpus comparison using your own extracted images:

```sh
node qa27900/frame-accuracy/test83/native-corpus.cjs IMAGE_DIRECTORY baseline.json
node qa27900/frame-accuracy/test83/native-corpus.cjs IMAGE_DIRECTORY after.json baseline.json
```

The first command disables only Test83 and keeps Test82. The second runs the full detector and asserts exact preservation of all baseline descriptors and valid additions.

## Local corpus evidence

`corpus-comparison.json` records the supplement comparison on all 230 original-page analysis planes: Apocalypse 91 pages / 179 prior owners; Wolverine 74 / 383; manga chapter32 41 / 188; Magneto 24 / 101. All 851 prior descriptors are preserved. The only new original-page frame is Apocalypse issue3 reader23/23, the lower-right scene. No new frames are published in the other three corpora. These are native-canvas counts, separate from physical Android and the historical saved174 checkpoint.

The frozen `web-assets.json` records all 86 packaged web files. CI checks the complete APK asset set, exact source bytes, Android identity and signature. Physical Test83 acceptance is pending, and general panel detection remains incomplete.

The new target survives original-source, 1.25x, horizontal-mirror and JPEG quality82 replays with the corresponding Test82 owner maps. The 0.67x source replay abstains. The integrated detector also confirms the original target moves2→3 with both existing owners unchanged.
