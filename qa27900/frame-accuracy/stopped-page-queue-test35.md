# Test35 stopped-page review queue

Baseline: **Nth Shelf 2.79.35 / Test35**  
Baseline commit: `017aca78a842e85adcab3bb658ee18a5f3667f27`

## Evidence

The user supplied 12 phone recordings: `180928_1.mp4` through `180928_12.mp4`.

The recordings were reviewed using two independent signals:

1. The deliberate stop marker is the Reader chrome revealed by the user's inward navigation swipe. The marker is visible through the red **PAGE** and **BUBBLE ZOOM** controls.
2. Each marked interval is matched back to the original 74-page Wolverine source using an exact ffmpeg timestamp frame and artwork features. Page numbers below are the **Reader page numbers shown on the phone**.

A stop interval is retained when Reader chrome remains visible for about one second or longer.

### Numbering rule

The source archive image suffix is zero-based while the Reader label is one-based:

`Reader page = archive image suffix + 1`

Example: archive image `...-012.jpg` is Reader **13 / 74**.

The first draft of this file used approximate OpenCV timestamp seeking and therefore collapsed or shifted several markers. The exact ffmpeg timestamp pass below supersedes that draft.

## Corrected result

There are **36 marked stop intervals** and **36 unique flagged Reader pages**.

Flagged Reader pages, in order:

**13, 14, 18, 25, 27, 28, 29, 32, 33, 35, 36, 43, 44, 45, 47, 49, 50, 51, 52, 53, 54, 55, 57, 59, 60, 61, 62, 63, 64, 68, 69, 70, 71, 72, 73, 74**

Parts with no deliberate navigation-stop marker:
- part 1
- part 4
- part 8

## Exact marker-to-page trace

| Video | Marked interval | Archive suffix | Reader page |
| --- | --- | ---: | ---: |
| 180928_2 | 61.0–63.0 | 012 | 13 |
| 180928_2 | 64.5–65.5 | 013 | 14 |
| 180928_3 | 48.5–53.0 | 017 | 18 |
| 180928_5 | 15.0–19.5 | 024 | 25 |
| 180928_5 | 65.5–70.0 | 026 | 27 |
| 180928_5 | 83.0–87.5 | 027 | 28 |
| 180928_5 | 106.0–110.5 | 028 | 29 |
| 180928_6 | 57.5–62.0 | 031 | 32 |
| 180928_6 | 82.5–87.0 | 032 | 33 |
| 180928_7 | 20.5–25.0 | 034 | 35 |
| 180928_7 | 48.5–52.5 | 035 | 36 |
| 180928_9 | 8.5–13.0 | 042 | 43 |
| 180928_9 | 43.5–48.0 | 043 | 44 |
| 180928_9 | 53.5–58.0 | 044 | 45 |
| 180928_9 | 76.0–80.5 | 046 | 47 |
| 180928_9 | 98.0–103.0 | 048 | 49 |
| 180928_9 | 108.0–112.5 | 049 | 50 |
| 180928_9 | 117.0–121.5 | 050 | 51 |
| 180928_10 | 2.5–7.0 | 051 | 52 |
| 180928_10 | 16.5–21.0 | 052 | 53 |
| 180928_10 | 25.5–30.5 | 053 | 54 |
| 180928_10 | 35.0–40.0 | 054 | 55 |
| 180928_10 | 64.0–68.5 | 056 | 57 |
| 180928_10 | 82.5–87.0 | 058 | 59 |
| 180928_10 | 101.0–105.5 | 059 | 60 |
| 180928_10 | 114.5–119.0 | 060 | 61 |
| 180928_10 | 129.0–133.5 | 061 | 62 |
| 180928_11 | 1.0–5.5 | 062 | 63 |
| 180928_11 | 14.0–19.0 | 063 | 64 |
| 180928_11 | 85.5–90.0 | 067 | 68 |
| 180928_11 | 94.5–99.5 | 068 | 69 |
| 180928_11 | 111.5–116.0 | 069 | 70 |
| 180928_11 | 123.0–127.5 | 070 | 71 |
| 180928_11 | 133.0–137.5 | 071 | 72 |
| 180928_11 | 145.5–150.0 | 072 | 73 |
| 180928_12 | 11.5–14.0 | 073 | 74 |

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

Start with **Reader pages 13, 14 and 18**. Pages 13–14 are consecutive stop markers and should be reviewed together. Page 13 already contains historically accepted frame behavior, so its marker is first treated as a regression/coverage check rather than permission to replace established identities. Page 18 is the third exact stop and provides the next independent layout.

Accuracy remains the priority. Keep the 2.79.xx series until frame behavior is consistently correct; 2.80.00 remains reserved for that milestone.
