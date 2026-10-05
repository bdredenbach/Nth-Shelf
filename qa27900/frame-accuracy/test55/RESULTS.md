# Test55 — pages54–57 nested paper frames

Baseline Test54 85a35b5dbd06e59316a8177d20d107c82364cbde. User reported pages54–57 failing. Private source indices53–56. No artwork is committed.

Selections: page54=8 (six scenes, two insets); page55=6 (five scenes, one inset); page56=7; page57=6. The native exterior-paper route proves four main-frame rims and recognizes four complete layout classes. Compact inset caps are measured independently near their side-rail endpoints. Page55's crossing speech balloon retains its lettering/tail. Parent masks exclude inset pixels. Tight exterior-component bounds include the whole ink rim while keeping neighboring masks exclusive across narrow gutters. No page IDs, titles, hashes or stored QA coordinates drive runtime.

Page56 already yielded seven closed frames in this browser, but its fitted polygons missed33 of63 sampled border/center ownership probes. The new native bounds pass all63. This is a reproduced boundary failure, not a claim to have observed the user's phone directly. Its new masks are independent of resampler and tap location. Other retained owners: page54 lower-left; page55 tall lower-right; page57 upper two.

Validation:

- 27 selections x9 actual touchscreen dispatches x2 rendering setups =486 successful touches. Default and high-quality alternate scaling. Page56's default run checks interior positions; high-quality run checks positions three analysis pixels from frame bounds plus centers. Both point sets are retained in batch-anchors.json. No page errors.
- 42,356 manually inset dense artwork samples per setup (84,712 total) remain opaque. Foreign inset samples are transparent in parent crops; page55's crossing balloon samples remain opaque. Captured and focus geometry stay exact across taps. All27 pop-outs visually inspected.
- Low/medium/high Skia and Sharp resized-canvas variants across all four pages (16 variants) yield identical new canonical masks. Existing retained owners remain exact for each variant. Page54 previously varied between3 and4 selections; now all variants return8. These simulations do not replace phone confirmation.
- Full74-page comparison: only54–57 change,3/3/7/3 ->8/6/7/6. Other70 descriptor arrays are byte-identical. Four already-correct owners in this batch remain exact.
- 108 independently erased main/inset rims reject. Transparent/flat/proved-owner cases reject, with four positive controls.
- 23 captured new proofs survive geometry routing;375 proof/geometry mutations reject. Syntax and the complete retained regression gate pass.

Private QA scripts require the comic, CHROME_BIN and workspace HTTP server. reader.cjs takes QA_PAGE=54..57 and optionally QA_RASTER=high. build-rasters.cjs prepares sixteen private variants. negative.cjs uses canonical RGBA fixtures. page56-boundary.cjs compares ownership against baseline-test54. Committed captures and reports contain numeric geometry, no artwork. nested-paper-contract.cjs and service-worker.test.cjs are artifact-free CI gates.

Identity2.79.55/code27983/io.github.bdredenbach.nthshelf.frametest55/Nth Shelf Test55. Phone acceptance pending. Check both page54 insets, page55's inset balloon, page56 borders and all six page57 frames.

Roadmap: complete the remaining Wolverine pages first, then generalize across comics. After this batch is confirmed, continue at page58.
