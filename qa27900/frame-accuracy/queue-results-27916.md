# 2.79.16 Test 1 queue results

Baseline: 2.79.15 Test 1, runtime commit
`a2d85bcf2aed3be1f6bf3642ff050036cd9beb26`. Findings and queue were recorded
in `424837ac7d1f8dececec28a07e3a415390aab08d` on `Test_Branch`.

## Changes

- Page 3: a conservative white-margin stack detector supplies five complete
  strips. The pilot strip includes its narration and left artwork regardless
  of the initial interior tap. The existing black-margin path is unchanged.
- Page 6: ink-core fitting can recover a rail obscured by touching dark art.
  Partial completion adds only independently proved leaves to an existing
  closed-frame result. Anchoring retains that original identity exactly;
  overlapping or conflicting proposals are rejected. Five frames are proved,
  including distinct bottom-middle and bottom-right frames.
- Bubble detection requires aligned letter-core evidence, rejecting the
  tested page-5 sky/propeller patch while retaining caption controls.
- Reader double taps use the rendered crop geometry, reject clipped corners,
  invalidate pending results on dismissal or focus changes, and use current
  layout geometry when a result arrives after a resize.
- Android, service-worker and cached panel-proof versions advance together.

## Evidence

The saved integrated comparison contains all 74 source pages. Only pages 3
and 6 change, from one identity to five each; all other 72 outputs are exactly
equal to the baseline. Page 6 retains its old identity and evidence verbatim.
Page 3 deliberately changes authority from one closed-frame result to the
complete five-strip page layout, including a new fit of the bottom strip;
its old object is therefore not byte-identical. This expected route change
must not be described as preservation of every old identity in the corpus.

Focused synthetic checks cover white-margin stacks, tilted borders, dark
artwork touching rails, interrupted dividers, inset vetoes, shared-edge
anchors, disjoint completion and malformed geometry. Bubble fixtures cover
text, short speech, low-contrast strokes and non-text fragments. Reader checks
cover crop mapping, opening/closing, stale requests, navigation and outside
taps. The tests live in `qa27900` and are included in the Android workflow.

Optional local artwork checks (comic files are not distributed):

```sh
node qa27900/queue-frame-check.cjs --comic
node qa27900/phone-frame-check.cjs --comic
node qa27900/bubble-selection.cjs --comic /path/to/comic
```

The first two scripts exercise 50 new and 80 established Reader handler taps
at center, left, right, north and south positions. Caption review retains the
five page-5 captions and 17 additional caption controls. Artwork, recordings,
overlays and local diagnostic paths are excluded from the app and repository.

## Remaining work and phone review

Page 6's top-right gun/boot frame and narrow bottom-left pilot face remain
unresolved. Their ambiguous internal boundaries still trigger conservative
abstention. Legacy fallback crops in unresolved regions are not certified.

Test separate repeated openings of page 6's two wider bottom frames, the full
page-3 pilot strip, caption open/close on pages 4 and 5, rejection of page-5
sky artwork, and all confirmed controls on pages 5, 9, 13 and 16. Local handler
checks do not establish Android gesture/animation behavior or device timing.
Keep these results pending phone confirmation; see `work-queue.md`.
