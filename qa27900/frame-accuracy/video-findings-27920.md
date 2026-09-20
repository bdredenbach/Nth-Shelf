# Phone findings after 2.79.20 Test 1

Recording: `179375.mp4`, 49.380911 seconds, 1080×2424, no audio.
Only page 11 is shown. Build is inferred from the delivery/feedback sequence;
there is no version screen. One-based page numbering includes the cover.
Structured evidence and the recording hash are in
[video-findings-27920.json](video-findings-27920.json).

## FQ-10: fortifications still fails on the phone

The independent fortifications crop is **not phone-confirmed**. Repeated touches
inside this right-hand frame open the same upper composite: forest strip,
borderless Wolverine portrait and fortifications together. No isolated
fortifications opening appears in the reviewed recording.

| Visible touch location | Touch, seconds | Merged crop visible, seconds |
| --- | --- | --- |
| Upper-left tree inside fortifications | 27.95–28.15 | 28.75–29.15 |
| Lower-left artwork inside fortifications | 30.05–30.25 | 30.95–31.35 |
| Lower artwork beside bottom caption | 32.35–32.55 | 33.15–33.55 |
| Central snow/fence | 34.55–34.75 | 35.45–35.85 |
| Right-side artwork near border | 36.85–37.05 | 37.85–38.15 |
| Upper-right snow | 39.05–39.25 | 39.95–40.35 |
| Upper-right near printed border | 41.35–41.55 | 42.15–42.50 |

The comfortably interior examples establish that the problem is not limited
to boundary touches. Touch indicators are visual evidence, not exact mapped
source coordinates or a log of which handler selected the crop. These are
approximate video times from full-stream 3 fps and 10 fps samples, not latency
measurements or proof of a particular gesture classification.

Earlier portrait and forest attempts also retain the upper composite, with
examples around 3.8, 6.8, 9.8, 12.8, 15.8, 18.2, 20.8, 23.5 and 25.8 seconds.
Another portrait opening appears around 44.8 seconds. Those regions were
already unresolved in .20; this recording does not establish a new regression.

## Local/device discrepancy is the next diagnostic target

The .20 local tests found an independent fortifications identity under Sharp
and three Skia qualities. This recording shows that those passing tests do not
yet explain the phone behavior. Keep the local results as a bounded test
record; do not treat them as device acceptance.

Before changing border tolerances, inspect the actual Android WebView path:

1. Establish the active runtime version, decoded page dimensions and detection
   logs for the original source image.
2. Determine whether the gradient frame is absent/rejected, lost before
   `currentPanels` assignment, or bypassed by hit mapping/selection.
3. Replay the visible interior positions through the actual decode/canvas and
   Reader path, retaining the independently reviewed border label.
4. Require a whole fortifications crop with both captions and no forest or
   portrait at moved interior taps; preserve all earlier controls.

No cache, installation, decoding or hit-order cause is proven by the video.
The forest and borderless portrait remain separate unfinished targets within
FQ-10. Page 11 remains ahead of the next queue item until this discrepancy is
understood.

## Scope and preserved status

This recording does not retest page 19 or the established page-5/9/13/16,
page-7/17 and other controls. Their previous confirmation remains recorded,
without adding a new pass. It also does not establish second-level caption or
non-text bubble tests. No stale-result or simultaneous-popout defect is proven;
an animated crop over a dim source page is normal overlay behavior.

This is a findings-only update. Runtime and APK remain 2.79.20 Test 1.
