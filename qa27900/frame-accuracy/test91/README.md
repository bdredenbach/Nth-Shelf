# Test91 — crop repair, ownership and reader contracts

This checkpoint changes Reader presentation and hit masks, not frame detection. Actual original source pixels supply nearby ink and neutral-paper evidence. Repairs stay inside each outer contour's hull; separate contours, compact inset exclusions, detector proofs and neighboring owners are protected.

Run `bash qa27900/frame-accuracy/test91/run-retained.sh` for all 84 retained/new behavioral suites. New checks cover original-pixel retention, disjoint scene gaps, source-paper bays, actual inset and foreign-owner negatives, corrupted-proof rejection, cached Reader tap selection and overlay/proof consistency.

Optional local private-artwork verification:

```sh
node qa27900/frame-accuracy/test91/native-crop-corpus.cjs SOURCE_DIRECTORY REPLAYED_DESCRIPTORS_JSON OUTPUT_JSON
```

Keep source artwork outside git and CI. The helper checks every original owned pixel and every overlapping detected owner; it does not decide narrative acceptance. Resume only with the same source and code checkpoint, or choose a fresh output file.

`crop-review.json` credits only 12 complete repaired singles. The two damaged pairs and other partial crops stay in the queue. `corpus-summary.json` distinguishes 851 changed display masks from those 12 credited repairs. No new detector owners are claimed. Phone acceptance and latency remain pending. See HANDOFF-2.79.91.md.
