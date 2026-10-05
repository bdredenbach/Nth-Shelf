# Test53 — page49 thin white gutters

Baseline Test52 ab597e34a1e3f13649de63a8adb5a4749e6153ed. Private source index48 is Reader page49. No artwork is committed.

The legacy detector sees two owners because a four-pixel gutter fails its five-pixel minimum. Structural grid proposals alone are insufficient: page48 includes an extra artwork split. The new route requires sixteen independently sustained dark rims with white exterior paper, four nonoverlapping textured scenes, and complete upper-composite coverage. The existing bottom owner remains byte-identical. Canonical native sampling determines new geometry; global gutter thresholds stay unchanged.

Validation:

- Five selections x nine actual touchscreen dispatches x two browser rendering setups =90 successful touches. Default and high-quality alternate scaling. No page errors.
- 11,353 dense artwork samples per setup,22,706 total, remain opaque. Captured and focus geometry stay exact for all taps. All five rendered crops inspected.
- Low/medium/high Skia and Sharp scaling variants yield identical four new outlines. Each original bottom owner is preserved exactly for that variant. Simulated scaling checks do not substitute for phone acceptance.
- Full74-page comparison: only49 changes,2 -> 5. All other73 descriptor arrays are byte-identical, including48's six selections and previously corrected44/45/47.
- Sixteen independently erased rims reject. Transparent/flat input and already-proved owners reject. Positive control returns five selections.
- Four captured proofs survive geometry refinement;48 proof/geometry mutations reject. Complete syntax and retained regression gate passes.

Private scripts need the comic, CHROME_BIN and workspace HTTP server. build-rasters.cjs prepares alternate pixel fixtures. negative.cjs uses a privately captured canonical RGBA raster. Captured geometry and summaries contain numbers only. thin-rims-contract.cjs and service-worker.test.cjs run without artwork and are CI gates.

Identity2.79.53/code27981/io.github.bdredenbach.nthshelf.frametest53/Nth Shelf Test53. Phone acceptance remains pending. Check corners and centers of the tall left panel, two right panels, narrow strip and bottom conversation.

Roadmap: finish remaining Wolverine pages with per-page phone checks; next task is generalization across comics. No broad rewrite in this iteration.
