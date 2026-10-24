# Native regression evidence gate

This dependency-free checker qualifies exact native regression evidence, not a detector release, browser compositor, Android build, full-frame repair, or phone experience. An unchanged inherited miss remains a miss. A passing regression is not evidence that an all-abstaining repair works.

## Files and integration

- `regression_gate.py`: strict manifest/receipt/artifact validator, exits 0 only on qualified native regression evidence; exits 2 on failed or missing evidence.
- `test_regression_gate.py`: synthetic corruption tests, no private art or dependencies.
- `audit_legacy_receipts.py`: read-only row-schema compatibility inspection. Never produces a qualification pass.

The tools live in this QA directory; no detector runtime imports them. Keep manifests referring to private source art and private receipts outside public Git. Historical archives are not modified.

Run:

    python3 -m unittest discover -s <gate-directory> -v
    python3 -O -m unittest discover -s <gate-directory> -v
    python3 <gate-directory>/regression_gate.py <private-evidence-root>/qualification.json --output <new-report.json>

The manifest and all evidence paths are relative to the manifest directory. Absolute paths, parent escapes, and symlinks escaping that root are rejected. Expected reference data must be frozen independently before evaluating a candidate. Never manufacture a baseline from the candidate to make the gate pass.

## Manifest contract

See `qualification.example.json` for structure only. Its placeholder hashes deliberately do not validate.

- `schema`: `native-regression-gate-v1`.
- `scope`: `native-regression-only`.
- `candidate`: exact mapping of every runtime asset key recorded in `receipts.codeHashes` to `{path, sha256}` for the intended current candidate. This is NOT the historical reference's code hash map. Use the complete script/kernel/index set recorded by the harness, not just the changed module.
- `runner`: `{path, sha256}` for the exact harness that writes `runnerSha256`.
- `support`: optional additional pinned helper/environment files. List relevant sandbox/monitor/support code and environment lock/version records; the receipt format itself does not attest those helpers. This is packaging integrity, not cryptographic proof of execution.
- `expected_taps`: exact complete suite count, not a hardcoded 281 requirement.
- `pages`: unique key; pinned `source`, `input`, and `reference` file records; relative `actual` receipt path. Input must contain `page.sha256`, a positive integer `page.readerPage`, and ordered `taps` with unique IDs and centers. Inputs containing `grid` or `includeDetectorCenters` are rejected, even when false: generated targets are outside this explicit-tap contract.
- `intentional_changes`: explicit ID to reason, exact field list, and pinned reference receipt. The approved receipt must match source, reader page, source dimensions and tap center; its selected row must satisfy the complete row schema with no error. Only listed outcome fields are replaced with frozen values. Unlisted output fields retain their baseline requirements. Unknown/unused entries fail. IDs and tap centers cannot be waived. Errors cannot be waived.

All actual receipt code hashes must exactly match the candidate map; source and input and runner hashes must match their pinned files. Both reference and actual receipts must be complete, contain positive integer `sourceDimensions` that match each other, and have an integer `readerPage` matching the input. Source dimensions are bound to the frozen reference, not independently decoded from the source image. All JSON parsing rejects NaN, Infinity, and finite-looking exponent literals that overflow; in-memory manifest/row validation also rejects non-finite numbers. Ordered IDs must match inputs exactly, with no duplicate suite IDs. Error must be explicitly null. An opened outcome requires raw/displayed PNG hashes, canvas size, owner/display boxes, identity/proof fields, and both initial/final overlay styles. The actual PNG files are rehashed and their IHDR dimensions checked against the receipt. Only file SHA-256, the PNG signature/IHDR header, and dimensions are checked. CRCs and the full image stream are not decoded; this is not a full PNG validator or independent pixel oracle.

An intentional geometry, rendering, or miss-recovery difference needs a separately reviewed frozen receipt with the same source identity and an explanatory manifest entry. Field-level allowance is NOT permission to accept arbitrary new values. A changed selected box does not authorize a changed final style. To recover a previously missing popup, list all newly established required opened-output fields explicitly along with `popped`.

## Cache behavior

This implementation intentionally never reuses prior pass/fail decisions. Every invocation rehashes evidence and validates all receipts/artifacts. Its report includes a fingerprint over the manifest, validator code, and actual receipts. Pinned file contents are rechecked before reporting. Do not use this report as a substitute for rerunning after source changes. A stale cached comparison file is irrelevant to this gate.

Integrate after the runner completes; do not retain the historical runner's `comparison exists -> continue` shortcut as qualification authority. A worker may reuse previously produced output only when this gate validates that output against the full current evidence manifest. Do not overwrite original receipts or silently regenerate historical hashes.

## Historical compatibility findings

Read-only audit of the locally recovered inputs found 71 historical expected receipts containing 281 rows. All 277 opened rows lack the raw-output/final-style evidence required by this stronger contract; the four inherited misses pass only the row-schema self-check. Historical expected receipts also lack runner and input fingerprints. This does not overturn their narrower recorded displayed-crop comparisons, and does not establish a fresh run.

The recovered frozen caption receipt's three rows and frozen speech receipt's seven rows satisfy the strict row schema. These are self-checks of existing records, NOT full artifact/provenance qualification or new passing regression results.

For older references, recover independent archived raw artifacts and final styles or produce a separately labeled, independently frozen baseline replay. Do not silently equate initial style with animation-end style, invent missing raw hashes, relax the gate, or claim a 281-outcome strong pass from the existing receipts. Private original artifacts and the full modern baseline are integration inputs still required for a real suite pass.

## What remains outside this gate

Full-rim/tail preservation, foreign-ink ownership, native uncertain contact regions, independent positive coverage, browser/Worker/IndexedDB behavior, and Android memory/latency require their own explicit qualification. The sparse rim score cannot satisfy those conditions. Existing prototype evaluators correctly record failed controls but do not signal aggregate failure via exit status; callers must inspect their per-case results or add a separate strict qualification command. This gate cannot turn those failures into a complete-frame repair.

## Integration verification · 24 October 2026

- 40 synthetic test methods pass with ordinary Python and with `python3 -O`, including corruption subcases.
- Two separate native executions of the unchanged qualified caption source used seven fixed taps on one private original page. The first receipt was frozen before the second replay. The final gate passes all seven outcomes: three opened crops and four inherited misses. It binds 149 runtime assets and checks raw/displayed artifacts and final styles. This is neither a full 281-outcome replay nor a semantic full-frame qualification.
- Six independent mutations of the real replay receipt (incomplete, wrong source, raw hash, final style, source dimensions and runtime asset map) are rejected for the intended reasons. Original receipts and PNGs remain unchanged.
- The existing native runner already emits the stronger fields for this smoke; no missing historical fields were synthesized. The public tests use generated PNG bytes and contain no comic art.
- No runtime source, APK, accepted baseline or release status changes. Repository APK automation remains manual and restricted to its existing branch; a candidate-branch push does not imply CI ran.
