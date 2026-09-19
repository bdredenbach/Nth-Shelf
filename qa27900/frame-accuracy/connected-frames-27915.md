# 2.79.15 Test 1 — findings and scope

The supplied `179268.mp4` is approximately 2:23 long. Its source hash and
independently reviewed artwork labels are in `phone-findings-27914.json`.
The visible app version is not independently identified in the recording;
it was supplied as feedback following the 2.79.14 test.

## Video evidence

| Time | Reader page | Finding |
| --- | ---: | --- |
| 0:12–0:36 | 3 | No sustained panel pop-out visible during the attempts; latency and exact tap sequence are not quantified. |
| 0:51–0:54 | 5 | Whole top airplane panel appears correct. |
| 1:09 / 1:15 | 5 | A crop joins part of the top airplane scene to the middle-right hand frame. |
| 1:33 | 5 | The small shattered-glass/caption frame appears correctly alone. |
| 1:39–1:40 | 5 | A crop joins that caption frame to the lower-right Wolverine scene. |
| 2:03 / 2:12 | 13 | The whole top airplane panel appears correct twice. |
| 2:18 / 2:20 | 13 | Lower and upper taps produce different partial star-and-bombs crops. |

Page 13's middle-right explosion is not visibly tested in this recording.
The previous page-9 and page-16 phone confirmations remain regression controls.

## Reproduction and cause

Bounded 2.79.14 probes reproduce the lower star/bombs failure in the quick
rescue (`adaptive-local-bottom-left-3`). Its top begins near normalized y=.47
instead of the printed frame's y=.36. Page-5 quick probes reject, then V100
supplies an oversized composite seed spanning almost all content below the
top panel. Those probes intentionally stop before exhaustive legacy refinement;
the exact page-5 final crops are evidenced by the video, not those seed probes.

Page 5 has six frames connected by slightly tilted horizontal and vertical
dividers. Axis-only proposals miss them. The star strip shares its top with
the independently proved airplane border, but dark artwork obscures the local
two-sided contrast at that shared edge.

## Changes

`PanelPartition` first proves a closed page outline, including its quiet white
exterior. It recursively fits attached separators and retains measured corner
intersections. Every resulting leaf needs connected borders; uncertain or
interrupted dividers and possible insets invalidate the map. Resource limits
must cause abstention rather than silently skip veto evidence. This route runs
only when all existing page identity routes return empty.

`PanelClosedFrames` keeps its existing strict pass and appends only nonoverlapping
completions using an original accepted neighbor. There is no recursive borrowing,
tap-dependent boundary, or extrapolation beyond the donor's measured interval.
The other three rails, joins and interior/inset checks remain required. The
shared proof is explicitly retained as `sharedTopProof` in the frame evidence.

Partition geometry is classified in analysis-pixel space only after its whole
frame is established. Both ownership labels preserve the exact fitted polygon.

## Verification

The 74-page old/new closed-frame sweep preserves every previous output object
and ordering exactly and adds only the whole page-13 star strip. The partition
sweep accepts six leaves only on page 5. The new polygons were reviewed against
the source artwork, including the small caption panel as a distinct owner.

The actual reader tap handler is exercised at center, left, right, north and
south positions within each target frame:

| Page | Target frames | Tap checks |
| --- | ---: | ---: |
| 5 | All six printed panels | 30 |
| 9 | Previously confirmed lower-right pair | 10 |
| 13 | Airplane, middle-right explosion, whole star/bombs | 15 |
| 16 | Previously confirmed five strips | 25 |

`node qa27900/phone-frame-check.cjs --comic` runs these 80 local checks. Optional
`NTH_BASELINE_ROOT` points to an unchanged 2.79.14 checkout for exact preservation
checks. The new page-5 and page-13 corners are compared to independent approximate
artwork labels with .008 normalized tolerance; matching old detector output is
not used as evidence that a newly detected frame is correct.

Synthetic gates cover complete skewed partitions, missing/partial/one-ended
dividers, thin dividers, inset ownership, missing shared donors/edges, route
priority, physical-angle classification and rendered polygon preservation.
Resource-overflow rejection was also checked in code review. The normal browser
and native backup checks run in CI.

## Limits

Phone testing of these new corrections is still required. Page 3's earlier
attempts, unrecognized insets and stepped/overlapping visible masks remain open.
Abstention leaves the existing fallback available; it does not certify its crop.
No speed target or complete-comic accuracy claim is made for this build. No
comic imagery or recordings are included in source control or APK assets.
