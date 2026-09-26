# Test49 — nine-point audit of every page44 frame

Baseline: Test48 commit `14faf79ae20d7ec654197ea461999db42333ec8c`. User supplied video 209627.mp4 and requested nine touch positions in every frame of Wolverine 1000 Reader page44.

There are eight visible scenes. The prior seven-cell detector omitted the narrow red-background profile and cut dark portions out of several other masks. Its historical Test35 anchors were selected from accepted contours, so they did not establish complete visible-scene coverage. This audit places points independently in the visible artwork.

## Nine-point Reader results

Each set has three rows of three interior points, following the skewed frame shape rather than a bounding rectangle. Full coordinates and per-touch results are saved beside this file.

| Visible frame | Touch selections | Rendered crop checks |
| --- | ---: | ---: |
| Top fight scene | 9/9 | 9/9 |
| Tall left portrait | 9/9 | 9/9 |
| Narrow SHLIK strip | 9/9 | 9/9 |
| Narrow red-background profile | 9/9 | 9/9 |
| BLAM scene | 9/9 | 9/9 |
| Upper of the three lower strips | 9/9 | 9/9 |
| Claw strip | 9/9 | 9/9 |
| Bottom strip | 9/9 | 9/9 |

Chromium 151, mobile viewport 412 × 915, device scale 2.625, actual touchscreen dispatch, Reader and native page deck. All 72 selected/focused contour sets match their whole-page descriptors. Every frame's nine sampled artwork points remain opaque in each corresponding rendered canvas. No page errors. The eight rendered crops were visually inspected.

The first candidate passed the point checks but visual review found the claw strip still clipped its lower border. An independently closed pale rim now restores that region; all 72 checks were rerun with this correction. Point consistency alone is not treated as proof of complete artwork.

## Detector change

A page-wide completion runs only on an existing map of four or more valid dark-matte cells. Standalone matte proposals used by other detectors stay unchanged. A measured neutral rim network supplies separate scene interiors; bounded growth and enclosed-hole filling recover their borders and internal artwork. Every prior identity must match one unique proposed cell. Original owned pixels win at shared boundaries. Cells already substantially complete retain their descriptors exactly.

A pale-only closed envelope may additionally restore black border pixels when at least 98% of its interior agrees with one cell and its perimeter remains supported by the visible pale rim. It cannot transfer another frame's pixels. New version-2 proofs validate correspondence, retained pixel counts, coverage, rim support and optional enclosure evidence. Runtime uses no comic title, page index, filename, image hash, stored QA points or tap position.

Page44 now has eight identities: five repaired masks, the newly separate red profile, and two exact retained descriptors (SHLIK and the upper lower-strip). The rest of the 74-page comic compares byte-for-byte with Test48, including the page36 and page43 repairs.

## Rejection checks and limits

Erasing the red-profile separator, introducing transparency or replacing the page with flat matte each withholds completion. All eight captured proofs validate; 76 malformed-proof mutations reject. Existing matte, Test47 and Test48 contracts remain valid. The full retained CI suite is required for the APK.

These are browser and automated results. Android phone acceptance is pending. A nine-point pass is not an assertion about every possible tap or every other comic.

## Reproduce

Serve a common parent containing current checkout, a Test48 checkout and the user's private comic directory. Run `reader.cjs`, `negative.cjs` or `sweep.cjs` with Playwright installed. Environment: `CHROME_BIN`; `QA_ORIGIN` (default http://127.0.0.1:8765); `QA_APP_PATH` (nth-shelf-current); `QA_BASELINE_PATH` (baseline-test48); `QA_COMIC_PATH` (comic-wolverine-1000); `QA_COMIC_DIR` for the sweep filesystem directory; `QA_OUTPUT` (/tmp/nth-shelf-test49). Reader page44 is source index43. The sweep expects all 74 sorted JPEGs.

Private comic pixels and phone recordings are not committed. Public CI runs artifact-free proof and retained regression tests. Reports contain geometry and test metadata only.
