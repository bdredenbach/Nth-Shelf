# Test97 / 2.79.97 — source-enclosed caption repair

5 October 2026. Repository `bdredenbach/Nth-Shelf`, branch `Test_Branch`.

Brad's phone-confirmed baseline is **190/384 complete original frames** in Test96. Test97 locally repairs **one further complete frame**, yielding **191/384**, **193 remaining**, **186 selections**, **168 credited groups**. Issue totals: **36/99**, **54/97**, **62/109**, **39/79**. Test97 phone acceptance is pending; phone timing is unmeasured. Count each unique complete original frame once: dual crops count two, larger crops count all complete original frames, clipped/duplicate fragments count zero.

## Target for phone testing

Apocalypse issue4 Reader **20**, selection **1**: the opening city scene beginning “Fifty years later…”. All three captions should remain intact, especially the left of “The sands encroach…” and the formerly erased diagonal lettering in the third caption. This page now has five complete frames locally. The other four actual Reader canvases are byte-identical to Test96; all five selections are reachable. This repairs a previously available incomplete selection; it creates no new detector selection.

## Generic source rule

`js/panels-crop-repair.js` reconstructs compact, source-enclosed yellow/gold caption bodies at two color thresholds. Their bounds must agree, their pixel difference must be at most 1%, their shape must be rectangular, and their interior must contain sufficient independently enclosed ink. A majority of the body must already belong to one established frame. Foreign ownership vetoes the repair. A narrow source-colored border collar can extend the mask only when it does not claim another owner's missing pixels; otherwise the independently enclosed core is considered alone. Opaque source pixels are required; empty, open, unstable, neutral and insufficiently owned bodies defer.

`js/reader.js` includes a recovered caption's display extent in its canvas only when this caption repair extends the old box. Discovery coordinates, proven frame geometry and saved descriptors are retained. Without that canvas correction, text could be restored in the mask yet remain physically clipped by the old drawing bounds. No page, title, text, image fingerprint or content lookup exists in runtime code. Artwork remains private and outside git/CI.

## Validation and continuation

Fresh native source-raster Reader-mask comparisons are recorded in qa27900/frame-accuracy/test97/corpus-comparison.json. The changed city frame restores 1,941 analysis pixels and removes zero; its four sibling canvases are unchanged. Retained behavioral suites plus new independent caption and Reader extent contracts, cache/package checks and JavaScript syntax run through qa27900/frame-accuracy/test97/run-retained.sh. The tests include foreign-owner, nonopaque source, missing ink, neutral interior, open body and minority-owner negatives. See TEST97-VALIDATION.json for actual validation/publication/build outcomes.

Continue one bounded primary recovery per pass. The Test95 audit remains the queue, excluding the repaired issue4 Reader5 S2 and Reader20 S1. Its hypotheses are not accepted gains. Next candidates include issue3 Reader13 irregular speech ownership, issue4 Reader18 lower artwork/balloon boundaries, and missing ink-frame scenes. SWAK remains incomplete. Require full source/actual Reader review before granting complete-frame credit. Keep local counts distinct from Brad's accepted phone count.

The private source archive is libfile_06c168de85c08191ba461ab9ef2cdba5. The saved full Test95 baseline review is libfile_d4c4ca46cd08819192cd7f9617d6f115 and its notes are libfile_58fed3b235688191ac7e4fec84517824. Previous source and build are recorded in TEST96-VALIDATION.json. Scratch hints for this pass: /workspace/scratch/87e22d99ff34/test97 and source fixtures /workspace/scratch/5827b11a4a78/fixtures; these are not durable recovery guarantees.

Final local validation: all **96 behavioral suites**, cache/package and syntax checks pass. Across **312 pages / 1,284 retained selections**, only the target Reader mask changes (1,941 additions, zero removals); Wolverine, Magneto and all three manga chapters are identical. All five target crops are reachable. Android/browser/native/signature/package checks will run in CI.
