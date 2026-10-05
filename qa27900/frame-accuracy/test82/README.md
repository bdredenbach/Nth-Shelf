# Test82: independently enclosed contour recovery

Identity: **2.79.82 / 28010**, package `io.github.bdredenbach.nthshelf.frametest82`, label **Nth Shelf Test82**.

The supplied source ZIP and the live Test_Branch both identify as Test80 / 2.79.80 at commit `5834f92487be7b23915b09983a5f98200c27fec9`. The user reports 2.79.81 and 174 frames. This checkpoint uses Test82 to avoid reusing that version number.

## Runtime route

`panels-local-boundary-consensus.js` runs after the established detector. Cooperative ragged-gutter seed radii 4 and 6 must independently produce nearly identical source-pixel masks. Each side needs dense paper/matte or contrasting ink support, with most matte support connected to the exterior. Unresolved internal white corridors or dark rails veto an addition. Adjacent page-edge corner shapes are withheld conservatively. New masks must be pixel-disjoint from every prior owner and each other.

Proof version 34 stores both source descriptors, their intersection, frontier evidence, and the final contour. Serialized validation reconstructs the intersection and checks geometry and frontier counts. As with earlier proof contracts, serialized evidence is a structural integrity check rather than a fresh re-analysis of source pixels. Geometry refinement and reader cropping preserve a validated complete contour without adding legacy edge spill. There are no book, filename, page, tap, or fixture lookups in runtime code.

## Measured original-artwork results

The 91-page baseline was rerun in `@napi-rs/canvas`, which returns **175** owners rather than the saved checkpoint's **174**. The eight per-page discrepancies are explicitly listed in `corpus-comparison.json`; the measurements must not be combined into a claimed phone total.

Applying the supplement to all 91 frozen baseline maps returns **179** owners, preserving all 175 prior descriptors and leaving 87 maps unchanged. Four accepted additions were also replayed through the integrated detector. Contour overlays were reviewed against the source pages.

| Issue | Reader page | Local before → after | Added scene |
| --- | --- | --- | --- |
| 1 | 7/24 | 0 → 1 | Large right-side lightning/child scene |
| 1 | 17/24 | 0 → 1 | Upper cavalry scene |
| 2 | 18/23 | 0 → 1 | Upper-right hand/scarab close-up |
| 3 | 10/23 | 0 → 1 | Middle-right energy attack scene |

Issue 2 reader 18 already belonged to the saved Test78–80 checkpoint, so it is a fallback restoration in this environment. The other three scenes are new targets relative to that saved checkpoint. No exact updated phone total is asserted.

All four additions survive horizontal mirroring and 1.25x scaling. The first three also survive 0.67x scaling and JPEG quality-82 recompression. Issue 3 reader 10 abstains on those two degraded variants. Foreground helmet shapes, divided lower-page scenes, a merged upper face/action area, and an intro landscape split were inspected and rejected during development. The 360+ goal remains incomplete.

## Reproducible checks

From the repository root:

```sh
bash qa27900/frame-accuracy/test82/run-retained.sh
```

This flat runner explicitly executes the retained synthetic/serialized contracts through Test80 and the new Test82 contracts. It fixes nested runners that can stop early when a child test consumes shell stdin. Historical Test67–69 reader assertions now require all original versions to remain present, while permitting later versions; their original proof and geometry checks remain intact.

- `local-boundary-contract.cjs`: four captured contour proofs, 76 rejected mutations, two independent synthetic owners, disjoint append-only additions, invalid/flat/transparent/landscape rejection.
- `reader-contour-contract.cjs`: the real reader crop method with a canvas/UI mock, four exact contour crops, unchanged bounds, and an adversarial spill provider that must never be called.
- `service-worker.test.cjs`: fresh cache/map identity, required scripts, and Android package/version/label.
- `web-assets.json`: frozen SHA-256 inventory for CI to compare every packaged web byte with this tested source.

`geometry.json.gz.b64` contains geometry and evidence only. Comic artwork is not published. CI runs the retained contracts, browser branding and backup interaction tests, low-memory native archive tests, APK signature/identity checks, and an exact packaged web-byte comparison. It does not rerun the private comic pages. Physical Android taps and pop-out animation remain pending.

For a local end-to-end replay, install `@napi-rs/canvas` and extract the supplied comic archive into a separate directory, then run:

```sh
node qa27900/frame-accuracy/test82/native-corpus.cjs /path/to/extracted baseline.json
node qa27900/frame-accuracy/test82/native-corpus.cjs /path/to/extracted after.json baseline.json
```

The first command disables only the new Test82 route; the second uses the real integrated detector, asserts every prior descriptor is unchanged, and validates all appended proofs. Both use the same native-canvas backend. Generated comparison files are local evidence and should not be committed indiscriminately.
