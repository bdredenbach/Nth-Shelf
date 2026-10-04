# Test84: independently enclosed scenes with interior ink strokes

A short ink run inside a scene can falsely trigger the retained divider test. This append-only route requires two independent global ragged-cell seed radii (4 and 6), strict original-pixel perimeter evidence, textured color content, a single contour, and zero overlap with every existing owner. It applies only to modest portrait-page scenes occupying 5–35% of the page, whose original divider check rejected them.

The explicitly supplied ink policy ignores a suspicious 45–60% run only when both physical endpoints lie more than eight analysis pixels inside its owned mask. Runs at least 60% of the scene span, boundary-reaching runs, and all retained paper-corridor checks keep their veto. Independently enclosed narrow-ink and chromatic-rim insets also veto the outer candidate. Existing callers receive the exact retained divider behavior by default. Runtime detection uses no book or page lookups.

Proof36 records both source geometries, exact consensus and contours, per-side original-pixel boundary and color evidence, inset-check results, and the ink-run coordinates/counts/interior distances. Serialized validation checks recorded geometry and evidence consistency; it does not re-read original artwork. Live proofs and contours are frozen. Reader cropping preserves the complete contour and skips legacy spill adjustment for these owners.

## Reproduce checks

```sh
bash qa27900/frame-accuracy/test84/run-retained.sh
```

The runner retains older contracts, replaces the current build-identity test, and adds two captured contours with 82 mutation rejections, synthetic interior-vs-boundary/long-line/inset/white-corridor checks, owner preservation, and real reader contour cropping. Private artwork is excluded from the repository and CI.

Optional full detector comparison on caller-supplied extracted images:

```sh
node qa27900/frame-accuracy/test84/native-corpus.cjs IMAGE_DIRECTORY baseline.json
node qa27900/frame-accuracy/test84/native-corpus.cjs IMAGE_DIRECTORY after.json baseline.json
```

The first command disables only Test84; Test83 remains installed. The second asserts every prior descriptor is identical and every addition has a valid Test84 proof.

## Local evidence

The supplement comparison covers all230 cached original-page 900px analysis planes. All852 Test83 owners remain byte-for-byte intact; two new owners are pixel-disjoint. Apocalypse rises180→181 across91 pages, Wolverine383→384 across74, manga chapter32 stays188 across41, Magneto stays101 across24. New targets are Apocalypse issue2 reader22/23 (complete bottom panel) and Wolverine1000 source018/reader19 (complete narrow upper-left syringe scene). These are native-canvas measurements, separate from a phone count.

The rejected merged region on Apocalypse issue1 reader17 remains rejected. `web-assets.json` freezes all87 packaged web files for CI byte checks. The 360+ Apocalypse goal remains incomplete; phone acceptance is pending. See `TEST84-VALIDATION.json` for full-detector replay, transformed-source and build results.
