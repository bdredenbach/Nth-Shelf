# Test35 stopped-page review queue

Baseline: **Nth Shelf 2.79.35 / Test35**  
Baseline commit: `017aca78a842e85adcab3bb658ee18a5f3667f27`

## Evidence

The user supplied 12 phone recordings: `180928_1.mp4` through `180928_12.mp4`.

The recordings were reviewed using two independent signals:

1. The deliberate stop marker is the Reader chrome revealed by the user's inward navigation swipe. The marker is visible through the red **PAGE** and **BUBBLE ZOOM** controls.
2. Each marked frame is matched back to the original 74-page Wolverine source by artwork features, including panel-focus views, rather than by assuming sequential page order.

A stop interval is retained when Reader chrome remains visible for about one second or longer.

## Result

There are **36 marked stop intervals** and **34 unique flagged pages**.

Flagged pages, in source/Reader order:

**13, 18, 25, 27, 28, 29, 32, 33, 34, 35, 43, 44, 45, 47, 49, 50, 51, 52, 53, 54, 55, 57, 58, 60, 61, 62, 63, 64, 68, 69, 70, 71, 72, 73**

Repeated markers:
- page 13: two stop intervals in part 2
- page 73: marked at the end of part 11 and again in part 12

Parts with no deliberate navigation-stop marker:
- part 1
- part 4
- part 8

## Marker-to-page trace

| Video | Marked interval(s) | Matched page(s) |
| --- | --- | --- |
| 180928_2 | 61.0–63.0, 64.5–65.5 | 13, 13 |
| 180928_3 | 48.5–53.0 | 18 |
| 180928_5 | 15.0–19.5, 65.5–70.0, 83.0–87.5, 106.0–110.5 | 25, 27, 28, 29 |
| 180928_6 | 57.5–62.0, 82.5–87.0 | 32, 33 |
| 180928_7 | 20.5–25.0, 48.5–52.5 | 34, 35 |
| 180928_9 | 8.5–13.0, 43.5–48.0, 53.5–58.0, 76.0–80.5, 98.0–103.0, 108.0–112.5, 117.0–121.5 | 43, 44, 45, 47, 49, 50, 51 |
| 180928_10 | 2.5–7.0, 16.5–21.0, 25.5–30.5, 35.0–40.0, 64.0–68.5, 82.5–87.0, 101.0–105.5, 114.5–119.0, 129.0–133.5 | 52, 53, 54, 55, 57, 58, 60, 61, 62 |
| 180928_11 | 1.0–5.5, 14.0–19.0, 85.5–90.0, 94.5–99.5, 111.5–116.0, 123.0–127.5, 133.0–137.5, 145.5–150.0 | 63, 64, 68, 69, 70, 71, 72, 73 |
| 180928_12 | 11.5–14.0 | 73 |

## Implementation rule

Do **not** treat these as page-specific hard-coded runtime exceptions. They are the artwork corpus used to expose general detector failure modes.

Work in small related batches (normally 1–3 pages). For every batch:

1. inspect all visible frames on each flagged page;
2. require each intended frame to open independently from multiple interior taps;
3. preserve speech balloons/captions/artwork that cross a border when the visible frame owns them;
4. reject slivers, neighboring-panel unions and partial insets;
5. rerun the established locked-page regression controls;
6. compare the full 74-page descriptor set with the Test35 baseline;
7. commit the detector checkpoint before moving to the next batch;
8. build an APK only after the automated checks are clean.

## First Test36 batch

Start with **pages 13, 18 and 25**. Page 13 already has historically accepted frame behavior, so its new stop is treated first as a regression check rather than permission to replace the established identity. Pages 18 and 25 are reviewed beside it to identify the first generalizable failure mode.

Accuracy remains the priority. Keep the 2.79.xx series until frame behavior is consistently correct; 2.80.00 remains reserved for that milestone.
