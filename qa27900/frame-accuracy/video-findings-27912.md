# Artwork regression observations from 2.79.12 Test 1

`video-findings-27912.json` records user test footage from `179232.mp4` through `179237.mp4`, matched visually to the supplied Wolverine #1000 source pages. It contains 45 observations, 10 provisional artwork reference rectangles and hashes for the 22 referenced source images. It documents failures and controls; it does **not** certify that a later build has fixed them.

The original comic and recordings are deliberately outside the repository. Run comparisons using the user's supplied files, matching each image's SHA-256 to `sourcePages` first. Do not publish comic pages as test artifacts.

## Numbering and evidence

- `pageNumber` is one-based, with the cover as page 1.
- `pageIndex` and the JPG filename suffix are zero-based. Page 16 is index 15, `Wolverine (2010-2012) 1000-015.jpg`.
- Timestamps are seconds relative to the named clip, not its on-screen recorder counter. They identify visible result frames, not exact tap-to-result latency.
- `visibleTouch` is used only when an initiating touch indicator was seen. Coordinates remain approximate. Other `suggestedProbePoints` are test inputs chosen from the source art, not reconstructed touch events.
- `successful-looking-control` means a single intended panel appeared without obvious neighboring artwork at video resolution. It does not mean its boundary is pixel-perfect.
- Some popups last under a second. Four-second contact sheets cannot establish a missing popup. Caption-only/bubble interactions and an ambiguous pale transition mask were excluded from confirmed frame defects.
- Clip `179238.mp4` is outside this manifest's scope.

## Confirmed patterns

| Source page | Clip and sample | Observed defect |
| --- | --- | --- |
| 5 | 179232, 67.25 s / 88 s | Middle-right scene includes part of top frame; bottom-right pair merges. |
| 9 | 179233, 53.25 s / 77 s | Three upper scenes merge; two lower-right scenes merge. |
| 11 | 179234, 5.75 s | Tapping the bounded top strip selects all three upper scenes, including a borderless head. |
| 13 | 179234, 45.75 s / 58 s | Rectangular top frame gets false diagonal border; tall left strip is truncated. |
| 16 | 179235, 10 s / 14.75 s | Simple full-width strips merge and acquire invented vertical boundaries. |
| 17 | 179235, 54.75 s / 69.5 s | Separate second-row frames merge; lower-right frame gets false diagonal left edge. |
| 19 | 179235, 105 s | Ritual scene merges with eye/syringe frame below. |
| 21 | 179236, 40.25 s / 58 s | Upper pair and lower three-frame group merge. |
| 22 | 179236, 65.25 s / 94 s | Multi-panel merges with borders cutting through neighboring artwork. |
| 27 | 179237, 14 s / 36.75 s | Upper-right pair merges; middle/lower scenes merge. |
| 59 | 179237, 69.5 s | One crop crosses three rows despite visible internal white gutters. |

Failures occur alongside successful-looking results on the same pages. Preserve page 9's three small middle panels and tall lower-left panel, page 11's bottom two strips, page 13's lower-right panel, page 16's bottom two strips, and page 27's narrow right strip when changing ownership rules. The JSON also records further controls.

## Draft artwork rectangles

These bounds were estimated manually by inspecting the original images independently of detector output. `boundsNormalized` is `[left, top, right, bottom]` in source-image coordinates; it is an approximate outer ink border/envelope. The starting **per-edge tolerance of 0.008 is provisional** (about 16 horizontal / 24 vertical pixels on these 1988×3056 images). It accommodates manual annotation and border thickness, not a neighboring panel.

| Reference | Left | Top | Right | Bottom |
| --- | ---: | ---: | ---: | ---: |
| Page 13 top airplane frame | 0.0246 | 0.0270 | 0.9692 | 0.3624 |
| Page 16 strip 1 | 0.0294 | 0.0268 | 0.9682 | 0.2028 |
| Page 16 strip 2 | 0.0294 | 0.2051 | 0.9682 | 0.3887 |
| Page 16 strip 3 | 0.0294 | 0.3917 | 0.9682 | 0.5815 |
| Page 16 strip 4 | 0.0294 | 0.5845 | 0.9682 | 0.7774 |
| Page 16 strip 5 | 0.0294 | 0.7804 | 0.9682 | 0.9725 |
| Page 9 lower-right upper frame | 0.4554 | 0.5686 | 0.9554 | 0.7297 |
| Page 9 lower-right lower frame | 0.4554 | 0.7407 | 0.9554 | 0.9770 |
| Page 59 lower-right upper frame | 0.5035 | 0.5754 | 0.9600 | 0.7789 |
| Page 59 lower-right lower frame | 0.5035 | 0.7842 | 0.9600 | 0.9824 |

Inspect source overlays before tightening tolerances or promoting these drafts into hard acceptance labels. For page 16, test all three left/center/right points per strip; one returned rectangle must not contain two strips. For each stacked right pair, points in the upper and lower frame must select distinct owners, and points within a frame must keep the same owner. Test page 13 at both sides of the top frame to expose artwork-following false skew.

Bounds agreement alone is insufficient: inspect polygon vertices and the rendered crop, because a false diagonal polygon can share the correct bounding box. Also inspect narration/lettering that crosses a genuine border separately from leakage of unrelated neighboring artwork.

These annotations are **QA data only**. Never import them into runtime detection, hard-code coordinates for this comic, or count matching an old detector result as artwork correctness. Automatic sequential panel scrolling and performance tuning remain later work.
