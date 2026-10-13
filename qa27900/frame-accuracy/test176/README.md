# Source176 shared-lettering controls

Run from the repository root:

```sh
node qa27900/frame-accuracy/test176/source-shared-lettering-contract.cjs
```

Requires @napi-rs/canvas under CODEX_PRIMARY_RUNTIME_NODE_MODULES. Fixtures and native-alpha oracles are drawn independently of production contours; no comic artwork or saved audit coordinates are used.

The 24 controls cover complete native ink, outline and antialias retention; mirrored, fractional, green and thin-outline variants; independent inset selection order; serialized proof recomputation; ambiguous, detached and non-letter artwork deferral; smaller independent ownership; and native-pixel proof tampering invisible to the coarse signature.

Passing these controls does not qualify browser/compositor rendering or phone lifecycle/performance. Source176 remains an unaccepted candidate; see HANDOFF-DETECTOR-SOURCE176.md.
