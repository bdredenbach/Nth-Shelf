# WASM source-upload state after reattachment

A successful `PanelFrameWasm.attach` replaces the kernel memory. Previously it retained `_source`, width and height from the old memory. Calling `begin` with the identical `Float32Array` then skipped the upload, leaving the new memory empty instead of containing the source luminance.

The minimal correction clears source-specific upload state after validating the required exports. The next `begin` uploads again, even for the same source object. Normal repeated `begin` calls on the same attached memory retain their existing behavior. No rail-search policy, thresholds, pixel math or WASM binary changes. The current loader normally returns once ready; this fixes explicit successful reattachment, not an observed ordinary phone-startup failure.

Run from the repository root with installed Node:

```sh
node qa27900/wasm-reattach/test-reattach.cjs
```

The 12 synthetic controls instantiate the actual repository WASM binary and check exact uploaded pixels and rail-result parity across fresh-instance attachment, same-instance attachment, same-source reuse, changed sources and restoration. Missing-export rejection and invalid/oversized begin inputs are also checked.

Scope: successful attach/begin lifecycle correctness. The missing-export test does not establish atomic rollback for arbitrary malformed memory objects; that broader preexisting behavior is not changed. These tests do not establish complete comic frames, phone performance, an APK or release acceptance. The rejected local rail memo is not part of this fix.

## Native preservation qualification

One fresh candidate replay covers all 369 fixed taps across 93 page entries and 92 original sources against the independently frozen stronger baselines: 363 opens and six inherited misses, all 93 strict page gates passing. Raw/displayed PNG bytes, boxes, ownership, styles and all additional semantic row fields remain exact; timing and route logs are excluded. There are no intentional output changes. This preserves the caption repair and known defects rather than recovering another frame.

The candidate executions total 42.1 minutes on the native host, with peak sampled process-tree RSS 1.44 GiB, no missing RSS readings and no resource stops under the unchanged 2 GiB/300-second-per-run guards. This is not an Android latency or memory benchmark. Private originals, receipts and checkpoint archives are kept outside Git.

## Related latency investigation

Two exposed retained pages were profiled without changing runtime. The slow tap is dominated by the existing rail-enclosure evaluator, not a rendering fix. A separate bounded per-search memo was tested in four alternating pairs and was slower in every pair (median handler overhead 5.98%). It was rejected and is not included here. Profiling used an instrumented native harness, not pure production or phone timing. No speedup is claimed.
