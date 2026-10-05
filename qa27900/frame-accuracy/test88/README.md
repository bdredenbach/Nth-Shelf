# Test88: closed frames in locally smooth gradient gutters

The exterior flood follows small neighboring RGB changes rather than a fixed blue or gray palette. Two independent smoothness thresholds, 12 and 14, must agree on a complete, inset, single contour. Original source pixels must prove every side; content, the retained internal-divider policy, independently enclosed inset checks and zero overlap with all prior owners must pass. Runtime detection uses no book/page identifiers or stored crop lookups.

Proof40 records exact contours, extent, side evidence, content evidence and threshold agreement. Live contours/proofs are frozen; serialized validation reconstructs geometry and checks evidence consistency, without re-reading artwork. The reader keeps the entire contour and skips legacy spill adjustment. New shell and panel-map versions invalidate old caches.

```sh
bash qa27900/frame-accuracy/test88/run-retained.sh
```

All 78 retained/new suites pass. New checks cover blue/neutral gradients in both directions, missing/open borders, internal dividers, enclosed insets, prior-owner preservation, malformed pixels, proof mutation and real Reader crop behavior. Private artwork is excluded from the repository and CI.

Optional full detector comparison on caller-supplied rasters (requires @napi-rs/canvas):

```sh
node qa27900/frame-accuracy/test88/native-corpus.cjs IMAGE_DIRECTORY baseline.json
node qa27900/frame-accuracy/test88/native-corpus.cjs IMAGE_DIRECTORY after.json baseline.json
```

The first command disables only Test88; the second asserts every prior descriptor unchanged and every addition valid. For an explicitly identified saved descriptor map in raster sort order:

```sh
node qa27900/frame-accuracy/test88/supplement-corpus.cjs IMAGE_DIRECTORY BASELINE.json OUTPUT.json
```

The 312-page saved-Test87 comparison preserves all 1,278 descriptors and adds one frame. This is a cached supplement comparison, not a full replay of Test87: that unpublished source commit is unavailable. The actual published Test84 → Test88 full detector target passes 0 → 1 on Apocalypse issue2 reader17/23. The full upper-left tall scene, including all speech balloons, was visually reviewed. Original, mirrored, 0.67x, 1.25x and JPEG82 sources all recover the frame. All 88 web assets are frozen for exact CI packaging checks. See TEST88-VALIDATION.json; phone acceptance and the broader 360+ goal remain pending.
