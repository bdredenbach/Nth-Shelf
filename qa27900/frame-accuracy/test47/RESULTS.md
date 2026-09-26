# Test47: actual Reader page36 completion

Baseline: Test46 commit `f66a4311aa90829f8f206479c8bb57f06eef4d44`. The user-supplied ZIP matched all 273 tracked files. The marked screenshot defines six visible scenes. The phone video shows wrong sheriff/middle crops and a bottom-right crop containing the shower.

The real Chromium pipeline returned only two proven frames, shower and top-right. Test46's seven-cell completion never ran. Direct matte analysis returned eight components in this browser. A handcrafted proof contract could not detect that activation failure.

Test47 starts from the actual two retained perimeter anchors. Unique relative component topology, a sustained vertical step, a horizontal band, the foreground silhouette, shared lower rims, and continuous dark edge support must all agree before four scenes are added. It uses no page number, filename, image hash, tap position, or saved coordinates in production. It preserves the original two descriptors exactly. This is a deliberately bounded completion, not a claim that arbitrary overlapping layouts are solved.

## Verification on the supplied private comic

- Actual Chromium 151 Reader, mobile viewport 412 × 915, touch enabled, device scale 2.625, native page deck active.
- Six page identities; 35 independently selected interior/edge-near ownership checks pass.
- 35 real touchscreen interactions pass: selected and rendered geometry matches the page identity, and all sampled scene points remain opaque. Zero page errors.
- The four added rendered crops were inspected: stepped top-left with both captions; sheriff inset with both balloons and the foreground-head notch; complete hallway/Logan middle scene including the projecting head; bottom-right room excluding the shower.
- Full 74-page current-versus-Test46 pipeline comparison: only page36 changes (2 → 6). Every prior descriptor remains exact, including both original page36 frames.
- Erasing the measured vertical step, upper horizontal band, or bottom rim independently prevents completion.
- Missing/invalid anchors, tampered outline, weak border proof and nonfinite profile reject. Low, medium and high canvas resampling each return six frames.
- Geometry contract also checks all four captured descriptors against eleven independent mutations. Existing Test33–46 contracts remain required.

Reports contain coordinates and metadata, not comic pixels. Browser tests require the user's private comic fixture and are not run in public CI. Phone acceptance remains pending.

## Reproduce

Serve a common parent folder over HTTP. Install Playwright locally and set `CHROME_BIN` if using a custom Chromium. Run `reader.cjs`, `negative.cjs`, or `sweep.cjs` from this directory with Node.

Environment: `QA_ORIGIN` (default http://127.0.0.1:8765), `QA_APP_PATH` (default nth-shelf-current), `QA_COMIC_PATH` (default comic-wolverine-1000, URL path beneath origin), `QA_COMIC_DIR` (filesystem directory for the sweep), `QA_BASELINE_PATH` (default recovered-sep26/Nth-Shelf-Test_Branch), and `QA_OUTPUT` (default /tmp/nth-shelf-test47). The fixture page is source index35, Reader page36. The sweep expects the original sorted 74 JPEGs.

For artifact-free CI: `node qa27900/frame-accuracy/test47/witnessed-completion-contract.cjs` and `node qa27900/frame-accuracy/test47/service-worker.test.cjs`.
