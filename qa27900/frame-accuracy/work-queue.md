# Frame accuracy work queue

Updated from the user's 2.79.15 Test 1 feedback and recording `179289.mp4`.
Runtime baseline: `a2d85bcf2aed3be1f6bf3642ff050036cd9beb26`, branch `Test_Branch`.
This update records evidence and next acceptance checks; it does not change the
detector or claim that the newly queued issues are fixed.

Accuracy comes first. Keep the 2.79.xxx version series until the full frame goal
is met; reserve 2.80.00. Performance tuning and automatic sequential pop-outs at
0.15x remain later work.

## Confirmed controls to preserve

| Target | Status and evidence |
| --- | --- |
| Page 5: all six whole panels | User phone-confirmed in 2.79.15. Repeated openings in 00:09–01:03, with further examples in 02:43–02:55. This includes the narrow hand panel and separate shattered-glass and Wolverine panels. |
| Page 13: whole star-and-bombs strip | User phone-confirmed in 2.79.15. Repeated full-height results around 01:13, 01:18 and 01:20. Preserve its star, stripe and entire bomb sequence together. |
| Page 9: lower-right pair; page 16: five strips | Earlier user confirmation from left, right, center, north and south positions. These remain required regression controls. |

The page-5/page-13 confirmation is targeted. It does not certify every other
frame on page 13 or all second-level interactions. Existing independent labels
remain in `phone-findings-27914.json`; do not replace them with detector output.

## Next work, in order

| ID | Target | Evidence | Required outcome |
| --- | --- | --- | --- |
| FQ-01 | Page 6: separate bottom-middle and bottom-right frames | Bottom-middle opens alone near 03:10.2; near 03:11.9–03:12.3 the selected crop contains both panels and their internal vertical divider. | Each panel owns its own complete frame. Moving a tap within either one must never select their union. Preserve the working middle-only result. |
| FQ-02 | Page 3: stable whole pilot strip | At 01:42.4–01:42.8 the pilot crop excludes the left narration and adjacent artwork. Around 01:48.5 and 02:00 the same strip includes them. | A first-level frame selection must retain the complete strip at all interior probe points. Replay single and double taps separately to identify the responsible route. |
| FQ-03 | Page 4: double-pop-out / caption test coverage | The upper damaged-bomber frame remains selected through roughly 02:08–02:36. Finer review finds no caption-touch sequence; a touch on smoke/art near 02:37 precedes closing. No failure is established. | Add an explicit double-tap-on-caption test inside the enlarged frame, verify the mapped source point, and check opening and closing. This is requested interaction coverage, not a confirmed defect or measured timeout. |
| FQ-04 | Page 5: reject non-text artwork during second-level selection | The correct middle-left propeller frame appears at 02:45.5–02:45.9, followed at 02:46.1–02:46.7 by a stable irregular sky/propeller patch containing no caption. | A bubble/caption request must not promote a patch of sky to a text bubble. Check both hit mapping and the bubble detector; retain the confirmed whole-frame identity. |
| FQ-05 | Page 6: complete coverage of all seven panels | Source artwork contains two upper, two middle and three lower panels. Other attempts appear in 02:57–03:09, but absence of a popup in sparse samples is not sufficient to certify individual misses. | Label all seven frames independently and test each at five interior positions. Log any misses or merges precisely; do not claim all seven are broken from this recording. |

FQ-01 is the first detector target. FQ-03/FQ-04 are a separate interaction track:
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

## Acceptance for the next implementation

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
5. Only after those checks, produce the next 2.79.xxx test APK for phone review.
   This queue update requires no APK or version bump.

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
