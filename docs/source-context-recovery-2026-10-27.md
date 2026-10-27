# Source-context frame recovery — 2026-10-27

## Status
Two previously missing target scenes now open through the actual Reader/native-source test path. Full 369-tap regression across 93 entries / 92 sources **passes**: 367 opens, two misses; all 365 previously open raw/display outputs and non-timing/non-log receipt fields remain exact. This is not a phone/device or APK validation claim.

## Changes

### 171: chromatic-host inset
A source-only detector nominates a wide illustrated island surrounded by a substantial pale, chromatic context. Fixed area, context, palette, dark-rim and upper/lower edge checks reject simple captions, credit boxes, unframed patches and tested floating-object controls. Existing accepted owners remain unchanged; additions require non-overlap.

Analysis-resolution sampling can disconnect a thin boundary present in the original image. For nominated islands only, the implementation therefore recovers the corresponding native-source connected component and fills completely enclosed holes. It does not close gaps or invent a rectangle. Recovery requires a unique match, no component touching the local crop boundary, bounding-box agreement, bounded area change and retention of the original analysis mask. Exact native pixel-edge contours drive both hit testing and rendering.

### 172: source-supported landscape
A separate source-only proposer uses pale gutter evidence and supported boundary paths to identify a broad landscape scene. Internal-divider and boundary-support checks constrain grouping. It runs **only after existing routes miss**: candidates never enter normal detector/map owner banks and cannot displace a previously accepted route.

Both approaches are deterministic geometric/image-context methods, not learned semantic scene segmentation. Development pages have been inspected; these results do not establish unseen-page generalization.

## Proof and lifecycle
Source-bound proofs reject stale or altered geometry. Recognized claims fail closed if source validation or contours are unavailable; there is no rectangular fallback for these claims. Loading, failed image loads, same-URI reloads and mutable canvas sources are guarded.

Reader holds the authenticated extraction contour rather than applying unrelated margin/spill enlargement. Focus metadata retains the issued owner. Focus interactions revalidate these source claims before using cached contours and after asynchronous work. This preserves the extraction mask, not a claim that every artwork pixel is complete.

## Public checks
From the repository root:

```sh
node qa27900/host-background-islands.cjs
node qa27900/supported-landscape-contract.cjs
node qa27900/supported-landscape-routing.cjs
```

These use public synthetic fixtures and contract/routing tests, not private comic artwork. They cover positive nomination, negative objects/text boxes, source/proof mutation, native correspondence and lifecycle/routing constraints.

## Known limitations
- The inset still omits an open pale interior region; some fine edge/artwork loss remains.
- The broad landscape can retain an independently framed inset as part of its parent scene.
- A small neighboring fingertip/edge fragment can remain in the broad extraction.
- Newly opened targets are useful but not quality-perfect. Broad regression and native review passed for this bounded candidate, not phone/device qualification; no speed improvement is claimed.
