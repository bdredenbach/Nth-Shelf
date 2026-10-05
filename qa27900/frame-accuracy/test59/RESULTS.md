# Test59 — chapter31 with the existing detector family

All 41 images in `30_Chapter_31.cbz` were reviewed. The cover has no internal frames; pages 2–41 contain 193 frames. The uploaded archive is unchanged and source artwork is not committed.

## General detector changes

- A saturated, near-uniform exterior background can divide cover typography into false rectangles. Suppression requires connected background covering 40–80% of the image, agreement along at least95% of boundary samples, multiple foreground regions and no independently proved frame. Genuine framed color layouts keep the legacy route.
- An open image edge can expose white inside a scene to the exterior flood. Unframed ink components almost entirely enclosed by an independently proved frame no longer veto that frame. This fixes the extra character-shaped selection on page16.
- Across a measured horizontal gutter, thick ink components with strong ownership can preserve crossing stroke tips. A connected parent ink component provides additional ownership evidence for ambiguous fragments. Existing outlined white-body ownership remains authoritative, and recovery is bounded to a short protrusion. This preserves the lettering on pages23 and33.

Runtime uses no page numbers, chapter identifiers, hashes, stored coordinates, fixed panel counts or page-layout templates.

## Final validation

- 193 manually audited frame centers map bijectively to193 frames.
- 965 actual mobile-browser touchscreen taps, five per frame, at412×915 and DPR2.625 in PAGE mode. Every tap selects its expected frame; original geometry is preserved in the focus renderer.
- 30,909 interior alpha samples are fully opaque. Five independently inspected crossing-tip points on pages23/33 remain opaque in the source frame and transparent in the neighboring frame.
- Source/detection overlays reviewed throughout; focused render checks include page16's open-edge scene, pages23/33 lettering and neighbors, and page11's thin strip. Zero browser page errors.
- Cover returns zero internal frames, versus10 false regions in Test58. Page16 returns the correct5 frames, versus6 with an extra character-sized selection. All other frame counts are retained.
- All40 horizontally mirrored comic pages retain their audited frame counts.
- All41 previous manga maps are exactly unchanged. All74 Wolverine maps are exactly unchanged againstTest58.
- Full retained syntax/regression gate passed. Both Test58 andTest59 proof contracts are retained. Test59 validates193 captured proofs,3299 corrupted-proof rejections, six arbitrary/mirrored layouts, flat/malformed/transparent negatives and specific synthetic cover, color-frame and open-edge-artwork cases.
- 70 unique service-worker shell assets.

One page11 test square was corrected after its lower samples landed in a gutter; runtime detection was unchanged by that correction. Final numeric counts and report hashes are in `results.json`.

Testing is for manga content in PAGE mode. Continuous MANGA mode's existing navigation is unchanged. Phone acceptance remains pending. Two chapters of this art style do not establish majority-of-comics coverage; more independent books, tinted/color paper and borderless layouts remain to be evaluated.

## Reproduction

Run `node qa27900/frame-accuracy/test59/gutter-graph-contract.cjs` and `service-worker.test.cjs` without private artwork. The gzip/base64 fixture contains numeric geometry only.

For private reader tests, extract the supplied archive in order as `manga-chapter31/page-01.png` through `page-41.png`, serve the workspace with HTTP, and set `CHROME_BIN`, `QA_ORIGIN`, `QA_PAGE` and `QA_OUTPUT` for `reader.cjs`. It checks five recorded tap positions and an independent interior square per frame. `frontmatter.cjs` checks the cover. `mirror.cjs` uses canonical616×900 RGBA files at `recovery-manga31/pageN.rgba`. Prior chapter comparison uses its saved native rasters; Wolverine uses the retained Test58 sweep harness with `QA_BASELINE_PATH=baseline-test58`.

Identity:2.79.59 / code27987, `io.github.bdredenbach.nthshelf.frametest59`, Nth Shelf Test59.
