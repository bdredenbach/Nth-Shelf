# Bounded panorama fragment cleanup — 28 October 2026

## Qualification status

The prior published baseline is `76c514a7d829c1def7ce7b42e5c6eeb800718dc0`, which separated the upper inset from the panorama. This candidate adds a bounded, optional lower-boundary refinement.

The final bounded runtime's focused actual Reader replay passes **five opening taps**. The other four outputs and their non-timing/non-log receipt fields are exact. Independent review verifies that the changed panorama preserves all ten captions and the owned foreground. Raw/display comparison changes 4,223 pixels, all within the separately frozen undilated removal footprint, with zero changes outside it and no alpha increases. All 18 protected source-region witnesses remain exact. These witnesses supplement whole native review; they are not exhaustive scene ground truth or an OCR score.

<!-- FINAL-REGRESSION-STATUS -->
**Independent full regression passes: 369/369 opening taps across 93 entries / 92 sources.** The approved panorama is the sole changed output; the other **368 remain exact**. Execution is an audited disjoint union of 4 entries / 17 taps, 62 / 268, and 27 / 84, with identical runtime, original harness and caps and source-path-only input normalization. Two interrupted sessions became unavailable; host termination was not independently verified. Partial entries are retained but excluded. This is fixed-benchmark preservation, not perfect-frame or unseen-comic qualification.

## Source-derived change

A continuous observed-paper barrier can separate a small exterior lobe from the panorama even when ink connects elsewhere on the page. The new check uses actual paper paths to the existing contour's exterior, then conservative eight-connected mask topology and a four-connected nonpaper contact to the lower exterior. It does not substitute a straight line across ambiguous ink, use semantic color labels, or use saved masks, page identities, tap coordinates or invented artwork. The central hair contact has no supported paper separation and is retained.

The original parent contour vectors, source/lifecycle guards, issued-object identity and sequential subtractive renderer remain unchanged. Only source-certified removal contours are appended. The Reader's existing route priority and modules 171–174 are unchanged. The owner remains version 175; its optional local cleanup evidence uses version 176. That internal evidence field is not the historical Source176 checkpoint and does not change detector acceptance.

The fixed-source diagnostic removes 4,671 native occupancy pixels, of which 2,400 are nonpaper. These source-mask counts differ from the 4,223 changed rendered pixels because the Reader renders at its crop scale. No source coordinates or private masks are runtime inputs or public test fixtures.

## Work limits and fail-closed behavior

The cleanup retains the existing native size limits and adds a maximum of 32 width-qualified interval attempts plus a 24-million-band-cell scan budget. Interval attempts are counted before barrier construction, including rejected barriers. Exceeding either budget discards **all** provisional removal and preserves the unchanged inset-only owner; it never applies a partial result. Components too narrow to meet the existing width rule are not retained for later work.

Public controls cover 21 kernel cases, including owned islands, white highlights, interior cracks, attached protrusions, endpoint ink bridges, hair contacts, missing neighbors, diagonal-only contacts, repeated calls, resource caps and all-or-nothing overflow. Existing ownership controls pass 15 cases and actual Reader method/routing controls pass 147 cases. Synthetic controls do not qualify general comic accuracy.

```sh
node qa27900/panorama-exterior-corridor-contract.cjs
node qa27900/panorama-ownership-contract.cjs
node qa27900/panorama-ownership-routing.cjs
```

## Regression and recovery boundary

The final suite retains the original no-full-proof-capture harness, strict receipt/PNG/alpha gates and unchanged **2 GiB process-tree RSS / 300-second per-entry limits**. Only the bounded ownership module and the delivery-cache name differ from the published runtime. The cache-name change invalidates the prior shell cache; service-worker logic and shell inventory are unchanged.

Reference receipts are authenticated against the independently audited Q2 baseline. Some historical PNG bytes are retained only as authenticated hashes; new outputs are checked against those hashes, not described as fresh direct decoding of unavailable old images. The focused target's baseline PNGs are available for the strict direct pixel comparison above. Baseline alpha files remain available and verified.

A pre-work-cap trial is superseded and is not part of final-runtime coverage. Final coverage is audited as the exact disjoint 4 + 62 + 27 entry union above; incomplete entries are preserved but never counted. It is not one uninterrupted run.

## Remaining defects and non-claims

This is **partial lower-neighbor cleanup, not a perfectly clean frame**. Substantial finger/bandage fill is removed, but thin residual outlines and slivers remain, alongside the unchanged ambiguous hair contact and inset-caption gold halos. The standalone inset's missing pale interior, compact-scene flecks and older clipping/contamination are separate work. The owned pink/peach foreground is not a foreign hand and remains preserved. Hidden artwork is not reconstructed.

Fixed-suite opening/preservation results do not establish unseen-comic behavior, complete scene ownership, browser compositing, Worker/IndexedDB, Android or phone memory/speed. No APK, speed optimization or learned model is included. Source173 remains the accepted baseline and Android is unchanged. Private artwork, source coordinates, masks and receipts stay outside public Git.
