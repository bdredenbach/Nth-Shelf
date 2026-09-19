# 2.79.18 Test 1 — bomber/SNIKT frames and artwork cutouts

Based on `179345.mp4` feedback against 2.79.17 Test 1. One-based reader pages
include the cover. These are local source-artwork and Reader-handler results;
phone confirmation is pending. The original comic and video remain outside the
repository and APK. No comic-specific coordinates enter runtime detection.

## Changes

- **FQ-07, page 7:** a uniform dark-ink core can establish borders obscured by
  adjoining dark artwork. The full red bomber strip gets one identity. This
  supplement runs after the existing closed-frame and partition reconciliation;
  prior identities remain exact. A new edge may move inward by at most two
  analysis pixels to resolve overlap within shared ink, only when its entire
  fitted rail and corner joins remain dark. It cannot trim neighboring artwork.
- **FQ-14, page 17:** uniformly dark outer margins support a separate outer-edge
  proof. Thin separators require full-length, low-variance ink, attachment at
  both ends, bright contrast on both sides and neighboring dark support. The
  existing white-margin route retains its thresholds. The resulting six panels
  include the whole tall SNIKT column and separate upper/lower right neighbors.
- **FQ-12/FQ-13:** sparse marks in irregular pale regions must explain the region
  with a substantial text line, or have letter size appropriate for a compact
  short-speech balloon. The page-9 snow and page-13 pale-art requests reject
  through both `detect` and `extract`; real caption controls retain their crops.
- The same frame evidence adds page 8's machine-gun strip and page 58's bottom
  conversation strip. Both additions were inspected against source artwork and
  independently labeled before moved-tap acceptance checks.
- Version `2.79.18-test1`, Android code `27922`; panel-map/proof and shell-cache
  versions advance so saved old maps do not conceal the new detector result.

## Verification

- **205 Sharp-based Reader handler probes:** 80 established page-5/9/13/16
  controls, 50 page-3/page-6 controls, 25 page-12 controls, and 50 new probes on
  pages 7/8/17/58. Each labeled frame uses center/left/right/north/south positions.
- **105 Skia Reader handler probes:** page 7's bomber strip and all six page-17
  frames, five positions each, at low/medium/high resampling quality. Independent
  approximate labels check corners, separate owners and complete source bounds.
- **74-page identity comparison:** only pages 7 (2→4), 8 (2→3), 17 (0→6) and 58
  (0→1) change. All previously returned identities and their evidence remain
  exact; the other 70 page outputs are byte-for-byte equal after serialization.
  This compares `PanelDetect.detect`, not every per-tap fallback. The full
  comparison evaluated the same production modules with native Node globals;
  the first 11 pages agreed exactly with the existing VM harness, and targeted
  Reader controls used that existing harness.
- **10 synthetic bubble cases**, both public APIs, including moderate-fill wide
  art and tiny aligned flecks in a tall pale patch. The 17 wider-corpus caption
  regressions remain exact under Sharp; 17 reviewed artwork negatives reject.
- Under three Skia qualities, both new artwork negatives reject in all six
  checks. Of 51 caption-control requests, 48 previous accepted crops remain
  exact; three pre-existing page-27 misses remain misses. These are not claimed
  as successful caption detections.
- A broader 20-page, threshold-235 region replay preserves all 125 previously
  accepted selections. Lower-threshold negatives have their separate targeted
  checks; this is not exhaustive bubble coverage.
- Synthetic partition/closed-frame, internal-divider, inset, incomplete-border,
  priority, anchor reconciliation, geometry, gutter, pilot-strip and double
  pop-out cancellation gates pass locally. CI also runs the browser interaction
  and backup tests, native archive test, and APK metadata/signature verification.

Local commands (comic fixture is deliberately not in CI):

```sh
NTH_BASELINE_ROOT=/path/to/2.79.17 node qa27900/ink-frame-artwork.cjs --comic --skia
NTH_BASELINE_ROOT=/path/to/2.79.17 node qa27900/bubble-selection.cjs --comic /path/to/comic --skia
```

The optional image tests need Sharp and `@napi-rs/canvas`; the Reader harness
expects the `comic-wolverine-1000` fixture beside the repository.

## Limits and phone checks

Page 7's bottom Wolverine strip gains a Sharp identity but still abstains under
Skia; its existing fallback remains. The upper-right page-7 frame is unproved.
Page 12's prior middle-strip resampling limitation remains. Local Skia results
are not Android device or animation certification.

FQ-08/09/10 (upper groups on pages 9–11) remain open: overlapping/stepped borders
and page 11's borderless portrait need a different visibility-ownership proof.
FQ-05's page-6 top-right and narrow bottom-left identities remain unproved.
The first-level frame and second-level caption tracks remain separate.

On the phone: move taps around the complete page-7 bomber strip; open all six
page-17 panels, especially SNIKT and both right neighbors; then try page-9 snow
and page-13 pale artwork inside their enlarged frames. Those non-text patches
should not create a caption pop-out; genuine speech/captions should still open.
Recheck page 12 and the previously confirmed page-5/9/13/16 frames.
