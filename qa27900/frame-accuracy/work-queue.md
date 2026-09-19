# Frame accuracy work queue

Updated after **2.79.16 Test 1** phone recording `179317.mp4`. Current runtime:
`f19244660cc9d05b130ee0dfa4d1e59cc4700f39`, branch `Test_Branch`.
See [new phone findings](video-findings-27916.md) and the
[local implementation results](queue-results-27916.md). Prior targets came
from `179289.mp4` on 2.79.15; their timestamps below refer to that older video.

Accuracy comes first. Keep the 2.79.xxx version series until the full frame goal
is met; reserve 2.80.00. Performance tuning and automatic sequential pop-outs at
0.15x remain later work.

## New phone targets from 179317.mp4

| ID | Page | Next target |
| --- | --- | --- |
| FQ-06 | 12 | Repeated bottom-pair merge; retain right-only and middle-strip successes. |
| FQ-07 | 7 | Red bomber strip crops differently across selections. |
| FQ-08 | 9 | Upper three frames merge; preserve confirmed lower-right pair. |
| FQ-09 | 10 | Upper motorcycle/inset group merges; respect overlapping borders. |
| FQ-10 | 11 | Top forest strip and middle pair merge into one selection. |
| FQ-11 | 11 | Snow/fence artwork passes bubble text evidence and pops out. |

Start with FQ-06, then FQ-07 and the upper groups. FQ-11 is a separate
caption-detection track with a locally reproduced non-text false positive.
Acceptance checks and timestamps are in [the findings](video-findings-27916.md).
This update records findings only; runtime and APK remain 2.79.16 Test 1.

The new video shows page 3’s five whole strips and page 6’s two wider bottom
frames opening separately. Page 6’s top-right and bottom-left also open in
individual examples, but FQ-05 still needs reliable multi-position proof.
No whole-page or caption test is marked complete from an isolated success.

## Confirmed controls to preserve

| Target | Status and evidence |
| --- | --- |
| Page 5: all six whole panels | User phone-confirmed in 2.79.15. Repeated openings in 00:09–01:03, with further examples in 02:43–02:55. This includes the narrow hand panel and separate shattered-glass and Wolverine panels. |
| Page 13: whole star-and-bombs strip | User phone-confirmed in 2.79.15. Repeated full-height results around 01:13, 01:18 and 01:20. Preserve its star, stripe and entire bomb sequence together. |
| Page 9: lower-right pair; page 16: five strips | Earlier user confirmation from left, right, center, north and south positions. These remain required regression controls. |

The page-5/page-13 confirmation is targeted. It does not certify every other
frame on page 13 or all second-level interactions. Existing independent labels
remain in `phone-findings-27914.json`; do not replace them with detector output.

## 2.79.16 implementation status

| ID | Local result | Remaining check or work |
| --- | --- | --- |
| FQ-01 | Bottom-middle/right have distinct whole-frame owners at all five probe positions. The previous bottom-middle identity and evidence are exact. | 179317 shows separate openings around 01:03 and 01:05–01:06; repeat at all five positions. |
| FQ-02 | All five page-3 strips pass five positions each; the pilot keeps its narration and left artwork. | 179317 shows all five whole strips; complete moved-tap phone sweep remains. |
| FQ-03 | Page-4 caption detection and Reader crop mapping/open-close checks pass. Pending-result cancellation and resize handling are covered. | Exercise the actual caption gesture and animation on the phone; the source video did not establish a failure. |
| FQ-04 | Page-5 sky/propeller requests reject at three positions; all five page-5 captions and 17 wider-corpus caption controls pass. | Phone confirmation that the sky does not become a second pop-out and the genuine caption still does. |
| FQ-05 | Five of seven page-6 frames have proved identities: top-left, middle-left/right, bottom-middle/right. | **Top-right gun/boot and narrow bottom-left pilot face remain unresolved.** They are the next detector targets. |

The 130 Reader handler probes include all 80 existing controls and 50 new
page-3/page-6 probes. The integrated 74-page identity comparison changes only
pages 3 and 6 (one to five identities each); the other 72 outputs are exact.
This does not certify the legacy per-tap fallback or every double-pop-out region.

## Recorded targets and acceptance checks

| ID | Target | Evidence | Required outcome |
| --- | --- | --- | --- |
| FQ-01 | Page 6: separate bottom-middle and bottom-right frames | Bottom-middle opens alone near 03:10.2; near 03:11.9–03:12.3 the selected crop contains both panels and their internal vertical divider. | Each panel owns its own complete frame. Moving a tap within either one must never select their union. Preserve the working middle-only result. |
| FQ-02 | Page 3: stable whole pilot strip | At 01:42.4–01:42.8 the pilot crop excludes the left narration and adjacent artwork. Around 01:48.5 and 02:00 the same strip includes them. | A first-level frame selection must retain the complete strip at all interior probe points. Replay single and double taps separately to identify the responsible route. |
| FQ-03 | Page 4: double-pop-out / caption test coverage | The upper damaged-bomber frame remains selected through roughly 02:08–02:36. Finer review finds no caption-touch sequence; a touch on smoke/art near 02:37 precedes closing. No failure is established. | Add an explicit double-tap-on-caption test inside the enlarged frame, verify the mapped source point, and check opening and closing. This is requested interaction coverage, not a confirmed defect or measured timeout. |
| FQ-04 | Page 5: reject non-text artwork during second-level selection | The correct middle-left propeller frame appears at 02:45.5–02:45.9, followed at 02:46.1–02:46.7 by a stable irregular sky/propeller patch containing no caption. | A bubble/caption request must not promote a patch of sky to a text bubble. Check both hit mapping and the bubble detector; retain the confirmed whole-frame identity. |
| FQ-05 | Page 6: complete coverage of all seven panels | Source artwork contains two upper, two middle and three lower panels. Other attempts appear in 02:57–03:09, but absence of a popup in sparse samples is not sufficient to certify individual misses. | Label all seven frames independently and test each at five interior positions. Log any misses or merges precisely; do not claim all seven are broken from this recording. |

FQ-01 was the first detector target. The new phone-target section above now
sets the next priorities; FQ-05's remaining proof gaps stay open.
FQ-03/FQ-04 are a separate interaction track:
the intended second pop-out is a bubble or caption selected from an already
opened frame. It must not be confused with two neighboring comic panels being
merged into one crop.

## Double-pop-out controls and diagnosis

- Page 5's bottom-right frame opens around 02:54.6, followed by its isolated
  narration box around 02:55.3. Keep this as a positive visible example of the
  intended caption capability. Its exact triggering gesture is not logged in
  the video, so do not infer a tap count or classify caption-only zoom as a bug.
- `Reader.handleDoubleTap` intentionally calls `BubbleDetect.extract` and maps
  positions from the enlarged panel back to the source page. Record both screen
  and mapped coordinates, current focus, panel identity, selected route and
  bubble result when reproducing. The recording alone does not prove a mapping
  defect or a detector defect.
- Test: open whole panel; double tap a real caption; close the caption; reopen
  the same panel. Repeat after moving the initial panel tap. Also probe non-text
  sky/artwork and transitions while a result is pending.
- No extra overlay, stale result from a previous page, or neighboring frame
  should become the next focus owner. A dim original page behind a selected
  overlay is normal and is not evidence of two simultaneous pop-out layers.

## Acceptance for each implementation

1. Use the supplied original comic and independently reviewed visible borders;
   one-based reader pages include the cover. Page 6 is image suffix `005`.
2. For each target frame use center, left, right, north and south interior
   probes, including artwork and caption-adjacent locations. Keep single-tap
   frame tests separate from double-tap bubble tests.
3. Verify the selected polygon and rendered crop: complete intended artwork,
   no neighboring panel, and a consistent identity across probe positions.
   Bounds alone cannot certify a sloped border.
4. Re-run all established page-5/page-9/page-13/page-16 controls, then repeat
   consecutive open/close interactions without clearing cache.
5. After local checks, produce a 2.79.xxx test APK for phone review. Mark a
   target phone-confirmed only after the user verifies the corresponding build.

## Earlier backlog remains open

The remaining observations in `video-findings-27912.json` and
`video-findings-27912.md` remain recorded, including unresolved groups on pages
9, 11, 17, 19, 21, 22, 27 and 59. Targeted fixes above do not close whole pages.
Page 36's sheriff inset and stepped overlapping frames still require separate
artwork-based handling. The new recording does not establish whether those
older failures persist in the current runtime.

## Evidence limits

See `video-findings-27915.json` for source hashes and exact sample times. Times
are seconds from the video file, not reliable tap-to-result measurements. The
red recorder clock may round differently. The runtime version is inferred from
the delivered build and feedback sequence; no version screen is shown.
Comic pages and video frames stay outside the repository. Findings are QA only,
never runtime coordinates or comic-specific detector exceptions.
