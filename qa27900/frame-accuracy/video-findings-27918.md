# Phone findings after 2.79.18 Test 1

Recording: `179355.mp4`, 306.658922 seconds, 1080×2424, no audio track.
Build is inferred from the delivery/feedback sequence; no version screen was
shown. One-based pages include the cover. Times below are approximate video
seconds, not measured tap-to-result latency. Structured findings and source
hash are in [video-findings-27918.json](video-findings-27918.json).

## Successful openings to preserve

**Page 17: all six panels open individually.** Top confrontation at 233.1–233.6s,
middle-right attacker at 235.6–236.1s, middle-left blade at 237.9–238.4s, tall
SNIKT column at 240.4–240.9s, lower-right embrace at 242.9–243.4s, and bottom
knife closeup at 245.1–245.6s. The previous truncated union of SNIKT and its two
right neighbors is absent from this sequence. FQ-14 has positive phone evidence.

**Page 7: all five panels have individual openings.** Upper-left falling figure
at 74.6–75.4s, upper-right hand/weapon at 77.6–78.1s, mountain at 80.4–81.1s,
complete red bomber strip at 88.4–88.9s, and bottom Wolverine strip at
91.1–91.9s. FQ-07 now has positive phone evidence. The last build's local
resampling sensitivity and lack of a proved upper-right page identity remain
technical limits; this video demonstrates successful openings, not which
identity or fallback produced them.

Other preserved examples:

- Page 5: all six whole panels open separately around 34, 37, 39.5, 42, 44.5
  and 47.5s, including the narrow hand panel and separate glass/Wolverine frames.
- Page 6: all seven panels have individual openings around 52.8, 55.5, 58,
  60.5, 63.5, 65.8 and 68.3s. This includes the upper-right gun/boot and narrow
  lower-left pilot face, which still lack reliable local multi-position proof.
  Do not mark FQ-05 fully solved from these isolated successes.
- Page 8: all five panels open around 101.5, 104.8, 107.5, 110 and 112.3s.
  The newly identified machine-gun strip is separate from the explosion frame.
- Page 12: all five panels open around 165.8, 168.5, 171.3, 173.7 and 176.3s.
  The middle strip remains whole and both bottom panels remain separate.
- Page 9: the lower-right pair opens separately around 133.3 and 135.7s.
- Page 13: airplane, complete star/bombs strip, upper action and lower action
  frames open around 181.3, 184, 186.5 and 190.7s.

These are individual openings, not five-position device certification. A
correct frame appearing during dismissal is not a second simultaneous owner.
No new regression of the previously confirmed frame controls is established.

## Remaining failures and renewed page-19 target

| Queue | Page | Video evidence | Required outcome |
| --- | --- | --- | --- |
| FQ-08 | 9 | Upper three frames still form one composite near 120–122s. | Separate visible owners; retain the lower-right pair and other successful frames. |
| FQ-09 | 10 | Upper motorcycle/right-hand group remains combined near 139–140s. | Respect the stepped/overlapping borders rather than inventing a straight split. |
| FQ-10 | 11 | Top forest and middle portrait/fortifications remain combined near 154–155s. | Separate visible regions; the portrait has no complete rectangular printed border. |
| FQ-15a | 19 | Syringe panel opens without its upper speech balloon around 269.2–269.8s; a later opening around 274.8–275.5s includes the balloon and full tall region. | One stable whole-panel crop across interior tap positions, retaining its speech. |
| FQ-15b | 19 | Upper-right ritual room and eye/injection strip open as one composite around 281.2–281.8s and 283.5–284.2s. | Separate frame owners, with explicit handling for the balloon crossing their boundary. |
| FQ-15c | 19 | Narrow vertical selection around 289.8–290.3s combines a cropped syringe panel with the left portion of the next horizontal scene. | Never cross the horizontal scene boundary to form a left-column composite. |
| FQ-15d | 19 | Selection around 296.8–297.4s shows only the right part of the middle room scene, leaving out Wolverine at the left. | Inspect the actual printed boundary and preserve the complete middle scene; a doorway/art edge must not become a panel border. |

Page 19 was already in the older unresolved backlog. FQ-15 consolidates newly
recorded examples; it does not assert that 2.79.18 introduced them. The complete
local 2.79.17→2.79.18 identity comparison returned zero `PanelDetect.detect`
identities on page 19 for both builds. That points to the unresolved fallback
track, but the video alone cannot identify a particular runtime selection route.
The bottom full-width page-19 strip opens separately around 302.8–303.5s and
should remain a control while the upper/middle ownership is repaired.

## Bubble track remains separately verified

The earlier page-9 snow and page-13 pale-art cutouts do not recur in the reviewed
openings. However, a deliberate repeat of the corresponding second-level
bubble request is not clearly established here. Keep FQ-12/FQ-13 locally fixed
with targeted phone confirmation pending. Do not turn absence of a cutout into
proof of a successful negative gesture test. The same caution applies to the
older page-11 snow request and real-caption double-pop-out coverage.

## Next priorities

Preserve pages 7/17 and the established controls. Work through the upper groups
on pages 9–11 and FQ-15's page-19 ownership failures. Independently label the
visible frame boundaries and crossing balloons before changing detector logic;
then exercise center/left/right/north/south points and the actual Reader path.
Keep page 6's two unproved identities and the local resampling limits on the
queue despite successful individual phone examples.

This is a findings-only update. Runtime and APK remain 2.79.18 Test 1.
