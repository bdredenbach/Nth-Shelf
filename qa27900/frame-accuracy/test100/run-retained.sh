#!/usr/bin/env bash
set -euo pipefail
mkdir -p dist
find js -name '*.js' -print0 | xargs -0 -n1 node --check
node --check sw.js
for suite in auto-scroll frame-geometry-contract gutter-boundaries internal-gutters page-layout closed-frames exterior-gutter-frames gradient-gutter-frames open-regions overlap-frames neighbor-frames panels-partition pilot-strips partition-queue partition-completion uniform-core-partition bubble-selection double-popout; do
  node "qa27900/$suite.cjs" </dev/null 2>&1 | tee -a dist/regression-checks.txt
done
node qa27900/frame-accuracy/test33/curved-rim-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test34/broad-rim-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test35/matte-cell-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test36/edge-spill-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test37/structural-grid-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test38/occluded-tier-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test39/nested-grid-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test40/framed-inset-triplet-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test41/five-column-bank-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test42/branched-stack-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test43/corner-furl-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test44/corner-zone-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test45/stepped-shared-scene-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test46/stepped-shared-v2-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test47/witnessed-completion-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test48/rim-seal-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test49/rim-completion-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test50/native-raster-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test51/mixed-rims-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test52/white-stack-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test53/thin-rims-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test54/paper-insets-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test55/nested-paper-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test56/bleed-network-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test57/pale-network-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test58/gutter-graph-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test59/gutter-graph-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test60/gutter-graph-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test60/overlay-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test61/ragged-gutters-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test62/independent-cells-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test63/independent-boundary-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test64/stable-partition-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test65/white-body-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test66/continuous-gamut-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test66/paper-recovery-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test66/colored-rim-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test66/reader-contour-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test67/paired-chromatic-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test68/dark-overlay-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test69/orthogonal-white-gutter-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test70/interrupted-gutter-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test71/neighbor-completion-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test73/shared-boundary-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test74/exterior-completion-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test75/edge-guided-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test76/chromatic-shared-border-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test77/narrow-ink-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test78/empty-map-boundary-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test79/top-row-barrier-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test80/horizontal-paper-strips-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test82/local-boundary-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test82/reader-contour-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test83/context-cells-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test83/reader-contour-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test100/service-worker.test.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test84/interior-strokes-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test84/reader-contour-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test88/smooth-gutter-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test88/reader-contour-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test89/neighbor-edge-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test89/reader-contour-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test90/recovery-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test90/reader-contour-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test91/crop-repair-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test91/reader-crop-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test92/gutter-split-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test92/reader-split-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt

node qa27900/frame-accuracy/test93/speech-ownership-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test93/reader-speech-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt

node qa27900/frame-accuracy/test94/perimeter-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test94/reader-perimeter-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt

node qa27900/frame-accuracy/test95/dark-matte-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test95/reader-dark-matte-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt

node qa27900/frame-accuracy/test96/tail-speech-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test96/reader-tail-speech-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt

node qa27900/frame-accuracy/test97/caption-repair-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test97/reader-caption-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt

node qa27900/frame-accuracy/test98/long-tail-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test98/reader-long-tail-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt

node qa27900/frame-accuracy/test99/column-speech-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test99/reader-column-speech-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt

node qa27900/frame-accuracy/test100/column-tail-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test100/reader-column-tail-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
