# Test35 — broad-spectrum edge-connected matte / paper cells

## Goal

Use the difficult page44 layout to add another reusable visual-evidence family,
then sweep the remaining pages that still had no page-wide identities. The
runtime route contains no comic title, filename, reader page number, image hash,
QA point, or saved crop.

## Detector

`js/panels-matte-cells.js` proves the exterior from pixels connected to the page
edge. It can operate on a nearly uniform dark matte or on bright low-chroma paper.
Candidate cells must be substantial, textured connected regions and are emitted
as measured contours rather than bounding rectangles.

Large dark-matte unions may be subdivided only by measured pale neutral rims.
Paper cells may retain disconnected artwork islands when they share the same
frame column and there is no strong dark divider between them. This prevents a
snow field inside one panel from becoming a fake split. A candidate map is
withheld unless the accepted cells cover at least half of the analyzed page; this
is why an incomplete two-panel interpretation of reader page65 is rejected.

The route is strictly **empty-map-only**. Every established detector has priority,
so Test35 cannot replace or reorder a page that already has identities.

## Recorded fixture results

| Reader page | Test34 count | Test35 count | Result |
| --- | ---: | ---: | --- |
| 1 | 0 | 0 | withheld |
| 26 | 0 | 0 | withheld |
| 44 | 0 | **7** | dark-matte cells |
| 58 | 0 | **4** | paper cells |
| 65 | 0 | 0 | partial proof rejected by coverage gate |
| 66 | 0 | 0 | withheld |
| 70 | 0 | **4** | paper cells |
| 71 | 0 | **4** | paper cells; same-column snow islands reunited |

This adds **19** page-wide identities to the Test34 effective fixture total,
310 → **329**. It is not represented as a new monolithic 74-page capture. The
remaining zero-count pages were directly re-run; prior non-empty pages are
protected by the empty-map routing gate; reader pages42 and43 were separately
re-run against the exact Test34 source and their complete JSON descriptor bytes
were identical.

- Reader page42 exact comparison SHA-256:
  `ed434e5df715989d0ee5b7673bc9f56060a510b26b4aed5e2ef9ad53cf5dc52e`
- Reader page43 exact comparison SHA-256:
  `5ed96c4815496acf951f801c3d6d6d967dacfb198022506cfbebb4cd9713816e`

The historical Test32 301-versus-298 discrepancy remains historical and is not
claimed resolved.

## Page44 real Reader check

The page44 fixture produced seven matte-cell contours. Thirty-five QA-only safe
ownership anchors all selected the intended contour. Seven actual touchscreen
passes (one per panel) went through the real single-page handler, geometry hold,
Reader overlay and NthPageDeck. All seven focused proofs remained valid and the
rendered canvases matched independent contour-clipped reference canvases at all
**6,480,484** compared pixel positions with **zero differences**. No page errors
were reported.

The Reader harness uses inline local assets plus in-memory database/localStorage
boundaries. It is not an Android-device, persistence, import, network, or service
worker lifecycle test. Comic artwork and screenshots remain outside the
repository.

## Safety / future-comic rule

A new frame family is accepted from visual evidence, not page identity. Ambiguous
or incomplete maps are withheld instead of filling the page with speculative
rectangles. Existing proven identities remain regression requirements. Phone
acceptance is still pending.
