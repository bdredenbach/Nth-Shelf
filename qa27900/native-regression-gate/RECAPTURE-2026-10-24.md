# Retained native evidence recapture · 24 October 2026

This checkpoint improves regression evidence, not the detector's scene ownership. Runtime assets remain the published Test179-caption candidate at `f29b812e3c6012c3f15f6b85990dc27b4b219065`; Source173 remains the accepted baseline. No APK, merge, release or phone acceptance is included.

## Independent paired results

| Suite | Page entries / source images | Fixed tap outcomes | Opens / inherited misses | Independent native executions |
| --- | --- | --- | --- | --- |
| Retained 171 plus Apocalypse 3 | 71 / 70 | 281 | 277 / 4 | 142 |
| Recovered Apocalypse 1 | 22 / 22 | 88 | 86 / 2 | 44 |
| Total | 93 / 92 | 369 | 363 / 6 | 186 |

Every page has a separately executed baseline and replay. The baseline receipt was frozen before replay. All 93 strict per-page gates pass: runtime and harness hashes, original-source and fixed-input hashes, raw/displayed PNG bytes, selected/display boxes, identity fields, and initial/final styles are checked. No cached pass decision supplies qualification.

The 171 retained displayed outputs match historical Test179 bytes and the compared boxes/styles. Of 110 Apocalypse 3 outcomes, only the intended caption changes. The caption and its two neighboring controls also match the previously frozen qualified caption raw/displayed PNGs, selected boxes and final styles.

All 88 Apocalypse 1 outcomes match recovered fresh179 on every required row field, including raw PNGs and final styles. Compared with older Test168 native hashes, 85 match; the one different fallback and two no-popup outcomes are inherited, not new regressions or repaired taps.

Three historical tap-ID strings are reused across different titles, so case identity is **page key plus tap ID**. The per-page manifests preserve the original IDs and exact click coordinates. Counts are outcomes, not distinct complete frames. One issue 3 source page has a supplemental entry; issue 1's two covers are outside its 88 narrative-page taps.

## Historical evidence is not silently rewritten

The older 281-row reference set lacks raw-output/final-style evidence for its 277 opened rows. Its narrower original comparisons remain historical evidence. Those missing fields were not invented or copied from initial styles. The new paired capture supplies a separately labeled stronger baseline for subsequent work.

The gate's 40 synthetic test methods pass normally and with Python optimization. Six deliberately corrupted real-receipt copies are rejected. This does not establish source-scene completeness, full rim/tail ownership or contamination-free artwork.

## Harness correction and resource limits

During the initial issue 1 attempt, an audit-only export serialized entire recursive owner proof graphs and exceeded the 2 GiB RSS guard before a tap. The failed attempt is preserved. One statement was changed to export the existing compact geometry/proof-identity representation instead; runtime objects, Reader preparation, tap selection and rendering are unchanged.

The affected page then passed two fresh executions below the same 2 GiB cap. All ten previously completed taps were separately checked for old/new harness parity, with exact raw/displayed crops, boxes and final styles. The full 88-tap suite uses this newly frozen compact-export harness. This is an audit-harness memory correction, **not a Reader memory or speed improvement**.

The 281 suite used 59.2 minutes of summed native execution time; issue 1 used 26.0 minutes. Maximum sampled process-tree RSS was approximately 1.35 GiB and 1.36 GiB respectively. Six early executions in the 281 suite have unavailable RSS readings because the environment omitted a process-tree enumeration file; the sampler was corrected and checked before later runs. Unavailable readings are not zero memory. The completed issue 1 suite has no unavailable readings.

Later executions used a 2 GiB sampled process-tree guard, 300-second timeout and 3 GiB free-disk floor. Native processing used cleared environments, read-only runtime/source mounts and child-only network syscall denial. No external inference or new model was used. Shared-host scheduling and native Canvas differ from Android/WebView behavior.

## Remaining work

The working caption candidate is unchanged. The missing-scene and merged-ink ownership failures remain unresolved; a preserved miss is not a recovered frame. Keep experimental speech/protrusion/rim changes isolated.

The next bounded task is latency diagnosis on a retained slow case and a fast control with unchanged source. Distinguish cold detection/preparation from tap handling and profiling overhead. Optimize only a demonstrated avoidable computation with exact preservation and bounded resource tests; do not broaden caches or relax ownership guards merely to improve timing.

Private originals, fixed taps, raw artifacts and recovery indexes are retained in the user's Library, not public Git. The existing APK workflow remains manual and branch-restricted; these local checks do not imply a GitHub CI run or release qualification.
