# Phone findings — 179382.mp4

Recording: 32.203578 seconds, 1080 × 2424, no audio. Reviewed throughout at
3 fps, with a larger still inspection of the open fortifications crop.
Times below are approximate visible-result intervals, not latency measurements.
Build 2.79.21 Test 1 is inferred from delivery and feedback order; the recording
has no version screen. Runtime commit: `2185aa577ca5229a5eb953c590c81f448e585f89`.

## Page 11 results

| Region | Visible result | Approximate seconds |
| --- | --- | --- |
| Fortifications | Independent whole panel, including both captions and Wolverine in the lower-left foreground. Forest and portrait are excluded. | 7.5–15.5; 21.2–21.5 |
| Wolverine crawling strip | Complete separate full-width strip with right caption. | 23.5–23.8 |
| Bottom boot/soldiers strip | Complete separate full-width strip with caption. | 25.8–26.5 |
| Borderless Wolverine portrait | Still opens forest + portrait + fortifications together. | 3.5–5.2 |
| Top forest strip | Still opens the same upper composite in repeated attempts. | 18.2–18.8; 28.8–29.5 |

The fortifications result is new positive phone evidence after the .20 failure.
Preserve it and both lower strips. FQ-10 remains open for the forest and portrait;
these are the next page-11 frame targets. Preserve all their artwork and captions.

## Evidence limits

- Several touches occur while the fortifications overlay stays open. They do
  not establish five separate first-level openings from the original page.
- No isolated caption or non-text cutout appears. Gesture intent is not clear
  enough to certify second-level caption or artwork-negative tests.
- The dim source behind the selected panel is ordinary overlay presentation;
  it does not establish a second pop-out defect.
- Page 19 and other pages are not shown. Prior confirmations remain recorded,
  with no new pass or regression inferred from this page-11 recording.
- This review updates findings and the queue only; runtime and APK are unchanged.

Source SHA-256:
`ab9903397b6e2b819a3babe1fcb211127770a864753c452260ad89ec76eee7c5`.
