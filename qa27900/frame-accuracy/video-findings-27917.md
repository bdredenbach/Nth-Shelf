# Phone findings after 2.79.17 Test 1

Recording: `179345.mp4` (227.206 seconds, 1080x2424, no audio).
Runtime is inferred from the build/feedback sequence; no version screen is
visible. Page numbers include the cover. Structured evidence and source hash:
[video-findings-27917.json](video-findings-27917.json).

## Successful openings to preserve

- **Page 12: all five panels open separately.** Upper-left at 120.4–120.8s,
  upper-right at 122.6–123.0s, middle strip at 124.8–125.2s, bottom-left
  Wolverine/planes at 126.8–127.2s, and bottom-right searchlights at
  129.2–129.8s. No bottom-pair union appears in this sequence. This is positive
  phone evidence for FQ-06, not a five-position sweep or exhaustive certification.
- Page 8: all five panels have individual openings around 49, 51.5, 54,
  57 and 59.5 seconds. Brief pop-outs can be missed by two-second overview
  samples; finer review confirms these openings.
- Page 9: the previously confirmed lower-right pair stays separate at
  84.0–84.6 and 86.6–87.4 seconds. The subsequent white cutout is a separate
  bubble-selection failure, not loss of the whole-frame identity.
- Page 13: the upper airplane frame, both right action frames and the complete
  star-and-bombs strip open separately around 133, 135, 141.5 and 139 seconds.
  Preserve those frame results while addressing the new bubble false positive.
- Page 16: all five whole strips open in sequence around 171, 173.5, 175.5,
  177.5 and 180 seconds. This preserves the established strip behavior.

The page-11 snow/fence cutout is not shown in this recording. The sampled
sequence does not establish a deliberate repeat of the earlier snow request,
so FQ-11 remains locally fixed with targeted phone confirmation pending.
Genuine second-level caption open/close on pages 4/5 is also not established.

## New queue entries

| ID | Page | Approximate video interval | Observed problem | Acceptance |
| --- | --- | --- | --- | --- |
| FQ-12 | 9 | 01:27.8–01:28.8 | After the correct lower-right frame opens, a horizontal snow/artwork patch becomes a white masked cutout with no caption. | Reject that non-text region through both bubble APIs and the enlarged-frame gesture; retain the whole frame and its real lower-right caption. |
| FQ-13 | 13 | 02:16.0–02:16.5 | After the upper-right action frame opens, a pale irregular background fragment beside Wolverine becomes a large cutout without text. | Reject the artwork at actual browser resampling, preserve captions and intentional whole action-frame/SFX content. |
| FQ-14 | 17 | 03:40.5–03:41.5 and 03:43.5–03:44.5 | A crop includes the tall SNIKT column and portions of both neighboring lower panels, with the right-hand artwork truncated. | Three independent complete printed-frame owners, stable at five positions; no partial composite. Preserve the successful top confrontation strip and knife-silhouette panel. |

These are newly recorded examples, not proof that 2.79.17 introduced them.
Do not promote a broad artwork region merely because it contains incidental
ink marks or nearby sound-effect lettering.

## Existing failures remain

- FQ-07, page 7: the red bomber strip still produces a bomber/left crop and a
  separate right red/narration slice around 28–32 seconds, with another bomber
  crop near 40 seconds. Keep the entire printed strip as the target.
- FQ-08, page 9: the three upper frames still open as a composite near
  64–67 seconds. Keep all already successful lower frames.
- FQ-09, page 10: the upper motorcycle and right-hand frames remain combined
  around 92 seconds. Their staggered/overlapping borders still require explicit
  ownership, rather than a fabricated straight divider.
- FQ-10, page 11: top forest and portrait/fortifications still open together
  at 108–108.5 and 110.5–111 seconds. The two lower strips open separately.
  The portrait is borderless; a simple closed rectangle is not established.
- FQ-05's two remaining page-6 identities are not retested here.

## Local reproduction and rendering sensitivity

The current 2.79.17 `BubbleDetect.detect` and `extract` both accept page-9 snow
near source coordinate (0.850, 0.805). Sharp and Skia rasterizations reproduce
it, with slightly different thresholds/bounds. The returned region is about
x=.739, y=.811, width=.234, height=.04–.047.

Page 13's artwork reproduces near (0.750, 0.410) with Skia low-quality canvas
resampling at the runtime's 716x1100 analysis size. Both public APIs accept it
at threshold 215, with bounds x=.7095, y=.3818, width=.1257, height=.1336.
The same region was not accepted in the sampled Sharp probe. This is concrete
evidence that source-artwork regressions must cover browser-like resampling;
passing one decoder does not establish that this false positive is fixed.
These independently chosen probe points are not inferred phone touch coordinates.

## Review limits and next work

Review used two-second samples throughout, 0.2-second detail on page 12 and
page 9's cutout transition, and 0.5-second detail on pages 8/11/13/16/17.
Source artwork was compared for pages 9/13/17. Timestamps locate visible
results; they are not latency measurements or exact gesture counts. Do not
classify missing pop-outs from sparse samples as failed taps.

Continue the page-7 whole-strip target and upper-group ownership work; add
page 17's lower group to that track. Treat FQ-12/FQ-13 as a separate bubble
track, with real-caption controls and both image-rasterization paths. Preserve
page 12's new successful phone sequence and all previous controls.

This update records evidence and queue changes only. Runtime and APK stay at
2.79.17 Test 1. The video and comic imagery are not included in the repository.
