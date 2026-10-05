# Test95 checks

Run `bash qa27900/frame-accuracy/test95/run-retained.sh` (92 suites).
The captured geometry contains no comic raster artwork. The new contract verifies original artwork retention, exact other-owner preservation, 21 rejected proof corruptions, a source-independent dark-ink positive, real ink inset protection, and rejection of an open cell leading into a neighbor. Reader checks cover all 4,266 restored-pixel taps, 943 restored edge pixels, serialized validation, cached masks and repeat pop-outs.

The 312-page corpus comparison uses fresh source-raster supplements over final Test94 descriptors. Only Apocalypse issue 2 reader 18 selection 1 changes. `crop-review.json` records the one complete single credited after source/Reader review; SWAK remains unchanged. The changed target also passes a full detector replay. Private source artwork stays outside git and CI; timing and phone acceptance remain separate.

Brad phone-confirmed the Test95 hand/water target on 5 October 2026; phone timing was not measured. Count reporting: 186 available selections (including incomplete crops), versus 171 complete narrative frames = 151 singles + ten pairs × two. The complete frames form 161 successful pop-out groups.

## Full phone sweep confirmed — 5 October 2026

Brad confirmed **189 complete original frames** in the full Apocalypse phone sweep. The fresh 91-page local regression and broader per-frame count supersede the historical 171/385 accounting above: **189/384**, **195 remaining**, **186 page-map selections**. A dual-frame pop-out counts two; larger groups count each complete original frame once. See HANDOFF-APOCALYPSE-TEST95-REGRESSION.md and docs/apocalypse-test95-regression.json. Phone timing remains unmeasured. Preserve this accepted baseline in subsequent tests.
