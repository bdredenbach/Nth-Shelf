# Test40 — framed inset triplet completion

## Target

Reader **page32 / 74** was supplied directly after page28 acceptance. Test39 publishes six page-wide owners: four correct upper panels, one correct lower-left panel, and one giant lower-right composite. The composite actually contains three intended frames: a left surrounding scene, a tall eye inset, and a right surrounding scene.

## Detector change

Test40 extends `js/panels-structural-grid.js` with a bounded framed-inset triplet route. It only considers a page whose surviving baseline already has 5–10 unproved orthogonal rectangles and exactly two large bottom-row owners: a smaller left sibling and a much wider right parent. Inside that parent it searches for long vertical luminance-edge runs, groups adjacent candidates, and accepts an inset only when exactly one rail pair also has independently strong top and bottom caps.

The validated closed inset partitions only that parent into three rectilinear owners. The existing lower-left owner and all upper owners remain unchanged. Runtime contains no comic title, filename, reader page number, image hash, tap coordinate or stored crop.

## Private fixture evidence

On the 585×900 analysis page, the bad parent is `[168,485,572,878]`. The inset is proved as `[299,522,368,818]`. Its left edge has 321/330 supporting samples (0.973), its right edge 302/307 (0.984), and both top and bottom caps have 65/65 support. Test39 page32 goes **6 → 8 page-wide owners**.

The complete 74-page applicability sweep invoked the new route against every Test39 baseline. **Only Reader page32 qualifies**; every other page returns no Test40 completion.

## Reader verification

The actual Reader geometry/ownership harness checked center/left/right/north/south points in each of the three replacement owners: **15/15** selected the intended role (left / inset / right), all proofs remained valid, all geometry routes held orthogonal authority, and there were zero page errors.

The Test40 contract accepts valid left/inset/right version-3 proofs and rejects a weakened cap, weakened vertical rail, altered rail separation, and a tampered outline. Test37, Test38 and Test39 retained contracts also pass unchanged.

Page13, page23, page27 and page28 are phone-accepted. Android build and page32 phone acceptance are separate gates.


## Phone acceptance update — page32

The user advanced from page32 to page33 after testing Test40. Reader page32 is accepted for the manual page-by-page queue.
