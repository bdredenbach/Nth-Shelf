# Test58 — general monochrome gutter graph

The uploaded `29_Chapter_30.cbz` contains 41 images. All pages were reviewed against source artwork. Pages 1–2 are a cover and logo; pages 3–41 contain 228 frames. No comic artwork is committed.

## What changed

A reusable detector follows white paper connected to the image exterior, fits independently supported frame edges, and splits connected artwork using measured paired gutters. It accepts varying frame counts and layouts without page IDs, chapter names, source hashes, stored coordinates or layout templates. Outlined effects, balloons and blades crossing gutters stay with their majority owner. Image-edge caps preserve open-edge panels. A tiny marginal footer is excluded from frame candidates.

The route is deliberately limited to opaque, predominantly monochrome framed pages with sufficient border evidence. Unsupported or incomplete maps fall through to the existing detectors. This chapter and synthetic layouts do not establish coverage for the majority of comics. Borderless layouts, tinted paper, color manga and independent books need further evaluation.

## Validation

- All 41 pages reviewed; 228 independently marked frame centers mapped bijectively to detected frames.
- 1,140 actual mobile-browser touchscreen taps, five per frame, in PAGE mode at 412×915 and DPR 2.625. Every tap selects the expected frame and preserves its geometry through the focus renderer.
- 36,334 interior alpha samples remain fully opaque. Explicit crossing-art probes on pages 5, 6 and 7 remain visible in their owner and transparent in the adjacent frame.
- No browser page errors. Source overlays reviewed across the chapter; rendered focus images checked for narrow strips, crossings, the internal computer screen, and all final-page frames.
- Both frontmatter pages return zero internal frames. Page 2 previously produced nine false regions.
- All 39 horizontally mirrored comic pages retain their audited frame counts. Six additional arbitrary/mirrored synthetic layouts pass, including image-edge panels.
- All 74 Wolverine maps are exactly equal to Test57, including contours and proof data.
- All retained syntax and regression gates pass. New contract validates 228 captured proofs, geometry-router preservation, 3,905 corruption rejections and flat/transparent/malformed/color negative inputs.
- Service worker contains 70 unique shell assets including the new detector.

Three manually selected probe areas were corrected after they overlapped gutters; the page 11 tap timeout was a marker on the top border, resolved with an interior point. These corrections did not change runtime detection. Final numeric results and report hashes are in `results.json`.

This tests manga content in PAGE mode. Existing continuous MANGA mode does not invoke the single-tap frame detector; its navigation/gesture behavior is unchanged. Phone acceptance remains pending.

## Reproduction

`node qa27900/frame-accuracy/test58/gutter-graph-contract.cjs` and `service-worker.test.cjs` require no artwork or extra dependencies. The compressed base64 fixture contains numeric geometry only, decoded with Node's built-in gzip support.

For private artwork checks, extract the supplied chapter in archive order as `manga-chapter30/page-01.png` through `page-41.png`, serve the workspace with HTTP, install Playwright, and set `CHROME_BIN`, `QA_ORIGIN`, `QA_PAGE` and `QA_OUTPUT` before running `reader.cjs`. The harness tests the five recorded points and an independent square of interior samples around each manually audited center. `frontmatter.cjs` checks pages 1–2. `wolverine-sweep.cjs` compares the 74 private originals against the Test57 checkout. `mirror.cjs` accepts canonical 616×900 RGBA files at `recovery-manga30/pageN.rgba` and checks counts without runtime page-specific assumptions.

Build identity: 2.79.58 / code 27986, `io.github.bdredenbach.nthshelf.frametest58`, Nth Shelf Test58.
