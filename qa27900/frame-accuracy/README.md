# Frame accuracy reference set

## Phone-confirmed 2.79.13 regression controls

The user tested the corrected trouble frames on reader pages 9 and 16 in
2.79.13 Test 1 and confirmed correct pop-outs from left, right, center, north
and south positions. Preserve these whole-frame identities in later builds.
This is targeted device feedback, not certification of other pages or every
pixel along the borders. Page 9's lower-right pair and page 16's five horizontal
strips remain explicit acceptance controls.

Version 2.79.12 begins an artwork-based accuracy investigation. The supplied 74-page Wolverine #1000 comic stays outside the repository. Draft coordinates here are independently reviewed annotations, not detector-generated answers. They remain approximate until reviewed against the original artwork and user feedback.

## Page numbering

Reader page 36 is zero-based index 35, image `Wolverine (2010-2012) 1000-035.jpg`. Older logs sometimes called it page 35.

## Confirmed failure in previous test design

The old middle-left tap (0.20, 0.45) and middle-right tap (0.70, 0.46) are in the same large middle scene. Its prior two stored quadrilaterals should not be treated as correct frame boundaries. The sheriff inset should be probed near (0.70, 0.33). The inset overlaps other frames, creating stepped visible boundaries that require more than four vertices or an occlusion mask. Artwork also interrupts its lower border.

`panel-map-stress.js` is a historical output-parity check; `panel-map-safety.js` checks limited historical routes. Neither establishes full-page correctness. The new `frame-geometry-contract.cjs` verifies that proven coordinates survive routing and rendering, not that the detector found the right frame.

## Next acceptance requirements

- Each intended frame has a distinct identity and a crop following its visible border.
- Multiple taps within one frame return that same frame; an inset selects its own frame.
- Compare annotations with rendered crops and inspect included neighboring artwork and clipped intended artwork separately. Do not accept matching old output as ground truth.
- Include white gutters, dark gutters, near-orthogonal rails, skewed rails, stepped overlap, and non-frame artwork controls.
- Check cold taps and repeated taps. Defer performance tuning and automatic sequential scrolling until accuracy is established.

## 2.79.12 findings

The geometry contract passes 18 physical-angle cases and live/persisted crop checks. A before/after sweep across all 74 pages gives the same six background-map polygons on two pages; this confirms scope, not their visual correctness. Exploratory long-dark-separator segmentation finds five large regions on page 36, merging the inset and middle scene. A looser threshold falsely divides artwork into nine regions. That experiment is not shipped.
