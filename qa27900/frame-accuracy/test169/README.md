# Missing contours on untouched split-cell display results

An ordinary rectangle with area 0.25–0.55 can be cached with `before=null`.
The previous split-cell hit-test wrapper passed that value to
`pointInContours` and threw after preparation warmed the cache. The wrapper
now arbitrates sibling ownership only when a repair adds pixels and the
original contours are an array. The delegated finder still performs its
existing proof and geometry checks. No detector geometry changes.

Run from the repository root:

```sh
node qa27900/frame-accuracy/test169/reader-null-contour-contract.cjs
node qa27900/frame-accuracy/test101/split-cell-contract.cjs
node qa27900/frame-accuracy/test101/reader-split-cell-contract.cjs
bash qa27900/frame-accuracy/test168/run-focused.sh
```

To reproduce the old error, pass the frozen Test168 split-cell module as the
test's first argument. It fails with `TypeError: rings is not iterable`.
The candidate passes warmed ordinary-rectangle selection, unowned-point and
foreign-cache controls. Five absent-proof identity cases still reject.
The existing split-cell tests retain recovered pixels, sibling taps,
repeated overlays and source-enclosure rejection controls.

Private comic audit records remain outside Git/CI. This source checkpoint
does not change the app version or package a new APK. Native/minimal-DOM
verification does not establish phone or compositor behavior.
