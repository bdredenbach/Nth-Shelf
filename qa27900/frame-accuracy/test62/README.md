# Test62: independent frame recovery

The Test61 source was recovered from its verified build artifact and matched all 483 blobs of the saved branch tree before editing. Earlier temporary work directories were unavailable. Do not return to the old `nth-shelf` 2.79.24 checkout.

The new empty-map fallback recovers 13 frames on five Rise of Apocalypse pages. **These are not five fully corrected pages.**

| Issue | Reader/archive page | New frames | Review |
|---|---:|---:|---|
| 1 | 14 | 3 | Partial: upper/right enclosed scenes only |
| 1 | 18 | 1 | Partial: lower-left frame only |
| 2 | 4 | 1 | Partial: upper-right eagle scene only |
| 3 | 9 | 3 | Partial: top strip and two middle columns |
| 3 | 16 | 5 | All five visible frames recovered |

No filenames, hashes, page indices or saved coordinates participate in runtime detection. Numeric contours here are QA fixtures. Existing accepted maps retain priority. Recovery proof v19 distinguishes isolated cells from a coherent set; unsplit isolated cells must satisfy enclosure, density and residual-gutter checks. Partial recovery does not certify the remaining artwork.

The controls are manga chapters 30/31/32 (41 pages each), Magneto Testament 01 (24), and Wolverine 1000 (74). There are 91 Apocalypse source images including eight covers. Do not count a cover or a story page with an empty map as a successful frame-detection test.

`independent-cells-contract.cjs` checks captured proofs, mutation rejection, arbitrary partial-layout rasters and geometry routing. `service-worker.test.cjs` checks the current offline assets. Earlier contracts remain in the APK build workflow.

When resuming, read `HANDOFF-2.79.62.md` and `TEST62-VALIDATION.json`, recover the exact current source before changing it, and use the supplied original archives. Keep numeric audit/checkpoint results separate from private artwork. A successful generated tap test verifies selection and clipping consistency, not the number of real frames on the page. Many overlapping/inset/gradient layouts remain unresolved.
