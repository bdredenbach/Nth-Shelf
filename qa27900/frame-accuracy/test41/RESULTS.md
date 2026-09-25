# Test41 — five-column bank over terminal strip

## Target

Reader **page33 / 74** was supplied directly after page32 acceptance. Test40 publishes only three coarse full-width owners: the top scene, the second horizontal strip, and one giant lower slab. The lower slab actually contains **five vertical panels plus one bottom full-width panel**.

## Detector change

Test41 extends `js/panels-structural-grid.js` with a bounded five-column-bank completion. It requires exactly three unproved stacked full-width legacy slabs, an independently proved structural terminal cell at the bottom, and exactly four sustained dark vertical rail groups across the entire bank above it. Each rail must satisfy minimum darkness, uninterrupted-run and two-sided contrast support. The five resulting column widths are also bounded for consistency.

The route ignores tap position and refuses artwork-driven horizontal subdivisions inside the column bank. Runtime contains no comic title, filename, reader page number, image hash, tap coordinate or stored crop.

## Private fixture evidence

Analysis size: **585×900**. Test40 page33 goes **3 → 8 page-wide owners**. The repaired bank is `[0,400,584,688]`; the terminal panel is `[0,694,584,899]`. The four proved divider groups are **115–123, 209–216, 317, and 474–477**. The resulting five bank cells and terminal panel all pass version-4 structural proof validation.

Reader ownership: **40/40** center/left/right/north/south points across all eight owners. Actual touchscreen replay: **30/30** pop-outs across the six repaired lower owners, zero page errors. Structural proof metadata is now preserved into Reader focus metadata so focused structural panels can revalidate after zoom.

## Applicability / regression

A targeted sweep covered every page that was a three-entry page in the preserved Test32 fixture and still remained eligible under Test40. Page27 is already repaired to eight entries; page13 and page60 are not plain three-slab maps. Eligible plain-three candidates were pages **33, 45, 52, 54, 55, 57 and69**. **Only page33 qualified** for Test41; every other candidate returned no completion.

Retained Test37, Test38, Test39 and Test40 contracts pass unchanged. Android build and page33 phone acceptance are separate gates.


## Phone acceptance update — page33

The user advanced from page33 to page35 after testing Test41. Reader page33 is accepted for the manual page-by-page queue.
