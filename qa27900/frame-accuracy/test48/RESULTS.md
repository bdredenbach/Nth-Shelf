# Test48 — page43 corner/center consistency

Baseline: Test47, `b6d60c8b3754d86f5ec0444fdc3ef4c04b18282a`. User reported that the highlighted lower-right area of the middle slanted K-KRASH scene returned a partial crop, while a center tap returned the whole scene.

## Diagnosis and change

The existing five-frame pale-rim map has a fragmented middle mask. Exterior-color flooding passes through a single-pixel connection in an interrupted right rim and consumes dark interior artwork. A center tap hits the known frame; affected corner taps miss it and enter the legacy tap-dependent crop search. This was reproduced in the real Reader.

Test48 repairs only a measured, bounded exterior leak in the broad pale-rim route. A one-pixel morphological opening proposes a region. Acceptance requires one large interior region, over 99.9% agreement on a nonterminal tier owner, a connected neck of at most four pixels, and pale rim evidence on opposite sides of the neck. The original raster is rerun with that connection blocked; only previously unassigned pixels belonging to the affected frame are added. Every already-assigned pixel and neighboring descriptor is retained. Wide openings, mixed owners, missing rim evidence, and invalid proofs defer to existing behavior.

The new version-2 proof records the neck, arms, ownership fraction and restored pixel count. No page number, filename, hash, stored coordinates, or tap position is used in runtime detection. The four neighboring frames remain byte-identical; no Reader or gesture changes were needed. Cache versions advance to avoid reusing the incomplete mask.

## Verification

- Chromium 151, actual Reader, mobile 412 × 915 viewport, touch enabled, native page deck active.
- All five scene identities retained. 32 independent tap/ownership checks pass, including multiple middle-scene corner, center, left and right locations.
- All 32 touches render the intended descriptor and every independently sampled point in that scene is opaque. No page errors.
- Inspected the actual rendered middle-scene crop: complete slanted frame, caption and sound effect retained; no rectangular partial fallback.
- Full 74-page Test47/current pipeline comparison: only page43 middle identity changes. Its four neighbors and every descriptor on the other 73 pages remain exact, including all six page36 frames.
- Widening the interrupted rim or removing the opposing pale arms each leaves five baseline frames and rejects repair.
- Captured proof passes; 12 malformed-proof mutations reject. Prior Test34 legacy/broad contracts pass, and CI retains the full regression suite.

These are browser and automated results. Phone acceptance is pending. Test47 page36 was not explicitly confirmed by the user's page43 report.

## Reproduction

Serve a common parent of current checkout, Test47 checkout and the user's private comic fixture. With Playwright installed, run `reader.cjs`, `negative.cjs`, or `sweep.cjs`. Environment: `CHROME_BIN` for a custom browser; `QA_ORIGIN` defaults to http://127.0.0.1:8765; `QA_APP_PATH` defaults to nth-shelf-current; `QA_BASELINE_PATH` defaults to baseline-test47; `QA_COMIC_PATH` defaults to comic-wolverine-1000; `QA_COMIC_DIR` selects the sweep's local directory; `QA_OUTPUT` defaults to /tmp/nth-shelf-test48. Reader page43 is source index42. Sweep expects 74 sorted JPEGs.

Public CI runs the geometry contract and retained suites without private artwork. Saved reports contain geometry/metadata only. Do not commit source comic pixels, phone screenshots or videos.
