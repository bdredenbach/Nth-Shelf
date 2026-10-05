# Test38 — occluded bottom-tier structural completion

## Target

Reader **page27 / 74** was supplied directly after page23 was accepted. The lower tier contains three intended scenes: a left orthogonal panel, a middle orthogonal panel, and one larger bottom-right scene whose foreground artwork occludes the lower portion of the internal divider. Test37 leaves all three unmapped, so tap-dependent V100 geometry produces four different skewed pop-outs across the same lower tier.

## Detector change

`js/panels-structural-grid.js` now has a bounded second completion route for a very specific evidence topology: exactly two validated `local-island-frame` anchors plus one validated `matte-neighbor-frame`, corroborated by a seven-cell tap-independent structural grid. The bottom tier must contain one independently complete left cell and one larger merged cell sharing the same top rail. Inside the merged cell, Test38 proves an interrupted vertical seam and a terminating horizontal cap from dark-rail support plus independent contrast on both sides.

The left cell remains a normal Test37 orthogonal structural cell. The middle cell is emitted as a new orthogonal rectangle. The larger right scene is emitted as one six-vertex visible outline that keeps the foreground area below the middle panel attached to the right owner. Runtime contains no comic title, filename, reader page number, image hash, tap coordinate or stored crop.

## Private fixture results

- Test37 page-wide identities: **3**.
- Test38 page-wide identities: **8** total for the page.
- Lower tier: **3** owners — left orthogonal, middle orthogonal, one larger right outline.
- Structural grid before the occlusion repair: 7 textured cells from 7 proved splits, coverage **0.957**.
- Bottom structural cells: left `[0,621,123,846]`; merged `[131,621,584,899]` on the 585×900 analysis image.
- Interrupted seam cluster: x **241–256**; selected seam x **245**.
- Middle cap cluster: y **867–872**; selected cap y **869**.
- Corroborating candidate cluster: **41** candidates.
- Existing page23 Test37 descriptors are byte-for-byte unchanged in a direct local comparison.

## Reader verification

The actual Reader/NthPageDeck harness checked eleven taps across the page27 bottom tier: north/center/south in the left panel, north/center/south in the middle panel, and north/left/center/right/south in the large right scene. **11/11** selected the intended one of three owners with zero page errors. A separate tap in the foreground area below the middle panel also selected the large right owner.

The two small panels render as orthogonal rectangles. The larger right scene renders as one clipped L-shaped outline, retaining the foreground below the middle panel instead of splitting into multiple skewed quads. Local focus-entry times were about **0.58–0.60 s** in this harness, versus roughly 8–12 s for the prior V100 rescue samples. These are browser-harness timings, not Android guarantees.

## Regression / contract

`test38/occluded-tier-contract.cjs` validates synthetic middle/right version-2 structural proofs, rejects weak rail evidence, rejects a tampered right outline, rejects the wrong anchor-family combination, and verifies that private fixture keys are absent from runtime source. The Test37 structural-grid contract continues to pass unchanged.

Page13 and page23 are phone-accepted. Android build and page27 phone acceptance remain separate gates.


## Phone acceptance update — page27

The user confirmed Test38 worked on the phone and advanced directly to Reader page28. Page27 is accepted.
