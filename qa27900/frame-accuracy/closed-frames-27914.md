# 2.79.14 Test 1: independent closed borders

This test follows the user's phone confirmation of 2.79.13 on the trouble
frames on reader pages 9 and 16. Those page identities are regression controls.
The immediate new target is human page 13 (zero-based image 12), whose airplane
artwork misled the old tap-seeded rail search into diagonal partial crops.

## Runtime scope

`PanelClosedFrames` runs only after both established page routes return no
identities. A nonempty baseline or complete stacked-page layout bypasses it.
Its four outer rails need sustained dark coverage and two-sided ridge evidence.
Fitted intersections preserve small real slopes. Each corner must retain ink
where the two measured rails join. Full internal dividers, collinear interrupted
dividers joining opposite sides, and inset evidence veto larger merged crops.

Shorter inset segments use weaker evidence only to reject a parent. They never
promote an uncertain child. Accepted frames are deduplicated before tap lookup.
Taps use the fitted polygon, and the geometry router preserves its coordinates.
The old fallback still serves taps outside these independently accepted frames.
There are no comic identifiers, page numbers, or expected coordinates in the
runtime detector.

## Local checks against the supplied 74-page comic

The final JavaScript detector, using the harness's 900-pixel Sharp input,
returns 83 fitted quads on 28 pages when invoked independently on every page.
Only 36 quads on 16 pages are eligible for the new production route because
the other pages already have established identities:

| Reader page | New eligible quads |
| --- | ---: |
| 3 | 1 |
| 4 | 2 |
| 6 | 1 |
| 7 | 2 |
| 8 | 2 |
| 12 | 1 |
| 13 | 2 |
| 34 | 1 |
| 53 | 3 |
| 56 | 7 |
| 59 | 2 |
| 60 | 2 |
| 61 | 5 |
| 62 | 2 |
| 63 | 2 |
| 64 | 1 |

All 36 eligible polygon overlays were reviewed against the artwork. No merged
neighbors or artwork-following edges were observed in that accepted set.
Page 53's inset is accepted while its enclosing dinosaur scene is deferred.
The corner check rejects one additional uncertain candidate on page 65; all
remaining reviewed coordinates are unchanged. Rejected pages and uncovered
parts of accepted pages are not thereby certified correct.

The real `Reader.handleSingleTap` function was exercised at left, right, center,
north and south positions for each of nine target frames: page 9's lower-right
pair (10 taps), page 16's five strips (25 taps), and page 13's airplane and
middle-right explosion (10 taps). All 45 taps returned their intended owner,
and each group of five retained the same geometry. Full page identity arrays
for pages 9 and 16 exactly match the saved 2.79.13 implementation.

The two page-13 envelopes were also compared with independently reviewed,
approximate artwork labels with 0.008 normalized edge tolerance:

| Frame | Left | Top | Right | Bottom |
| --- | ---: | ---: | ---: | ---: |
| Airplanes | 0.0246 | 0.0270 | 0.9692 | 0.3624 |
| Middle-right explosion | 0.325 | 0.373 | 0.969 | 0.663 |

These labels are QA evidence, not runtime inputs or exact pixel truth. Phone
testing of the new page-13 crops is still required. No latency claim is made.

## Reproducible automated gates

`node qa27900/closed-frames.cjs` draws its own reference artwork and checks
known corner positions, slight tilt, missing edges, full and interrupted
internal dividers, whole and partly obscured insets, invalid input, preservation
of established route priority, and safe rejection on detector failure.

`node qa27900/frame-geometry-contract.cjs` additionally verifies that the new
closed-border proof retains its vertices through routing and rendered clipping,
and that incomplete proof cannot gain polygon authority. The existing gutter,
stacked-layout, early-tap, autoscroll, browser, and native transfer checks remain
in the APK workflow.

## Limits and next phone test

Start with five tap positions in page 13's top airplane frame, then its
middle-right explosion frame; repeat a few page-9 and page-16 control taps.
Other missed or merged scenes and stepped/overlapping masks remain unresolved.
Legacy fallback results can still be wrong. This is a targeted 2.79 test build,
not a complete-comic accuracy certificate or the planned 2.80.00 milestone.
The comic, its page images, and user recordings stay outside the repository.
