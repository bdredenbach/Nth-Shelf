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
node qa27900/frame-accuracy/test153/service-worker.test.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
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

node qa27900/frame-accuracy/test101/split-cell-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test101/reader-split-cell-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt

node qa27900/frame-accuracy/test102/lateral-cell-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test102/reader-lateral-cell-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt

node qa27900/frame-accuracy/test103/landscape-cell-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test103/reader-landscape-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt

node qa27900/frame-accuracy/test104/upper-group-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test104/reader-upper-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt

node qa27900/frame-accuracy/test105/continuation-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test105/reader-continuation-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt

node qa27900/frame-accuracy/test106/wide-row-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test106/reader-wide-row-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt

node qa27900/frame-accuracy/test107/edge-group-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test107/reader-edge-group-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt

node qa27900/frame-accuracy/test108/trailing-group-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test108/reader-trailing-group-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt

node qa27900/frame-accuracy/test109/frontier-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test109/reader-frontier-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt

node qa27900/frame-accuracy/test109/speech-body-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt

node qa27900/frame-accuracy/test110/neutral-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test110/reader-neutral-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt



node qa27900/frame-accuracy/test111/source-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test111/reader-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt

node qa27900/frame-accuracy/test112/source-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test112/reader-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt

node qa27900/frame-accuracy/test112/speech-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt

node qa27900/frame-accuracy/test113/source-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test113/reader-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt

node qa27900/frame-accuracy/test114/source-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test114/speech-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test114/reader-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt

node qa27900/frame-accuracy/test115/source-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test115/reader-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt

node qa27900/frame-accuracy/test116/source-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test116/reader-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt

node qa27900/frame-accuracy/test117/source-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test117/reader-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt

node qa27900/frame-accuracy/test118/source-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test118/reader-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt

node qa27900/frame-accuracy/test119/source-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test119/reader-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt

node qa27900/frame-accuracy/test120/source-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test120/reader-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt

node qa27900/frame-accuracy/test121/source-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test121/reader-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt



node qa27900/frame-accuracy/test122/source-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test122/reader-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt

node qa27900/frame-accuracy/test123/source-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test123/reader-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt

node qa27900/frame-accuracy/test124/source-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test124/reader-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt

node qa27900/frame-accuracy/test125/source-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test125/reader-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt


node qa27900/frame-accuracy/test126/detached-caption-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt

node qa27900/frame-accuracy/test127/atomic-speech-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt


node qa27900/frame-accuracy/test128/source-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt

node --expose-gc qa27900/frame-accuracy/test129/source-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt

node --expose-gc qa27900/frame-accuracy/test129/remainder-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt

node qa27900/frame-accuracy/test130/source-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test130/reader-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test130/remainder-reader-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt

node qa27900/frame-accuracy/test131/speech-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt

node qa27900/frame-accuracy/test132/ink-cap-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test132/reader-cap-bounds-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt

node qa27900/frame-accuracy/test133/caption-boundary-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test133/reader-caption-bounds-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt

node qa27900/frame-accuracy/test134/edge-rail-regression.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test134/reader-edge-rail-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt

node qa27900/frame-accuracy/test135/upper-paper-separation-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test135/reader-upper-bounds-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt

node qa27900/frame-accuracy/test136/round-atomic-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt

node qa27900/frame-accuracy/test137/chromatic-inset-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test137/chromatic-inset-reader-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test137/reader-edge-rail-safety-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test137/chromatic-inset-reader-safety-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt

node qa27900/frame-accuracy/test137/restored-boundary-cache-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt

node qa27900/frame-accuracy/test138/chromatic-occlusion-cell-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt

node qa27900/frame-accuracy/test139/chromatic-taper-cell-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt

node qa27900/frame-accuracy/test140/chromatic-composition-remainder-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt

node qa27900/frame-accuracy/test141/shared-rim-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test141/reader-shared-rim-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt

node qa27900/frame-accuracy/test142/paper-residual-strips-generated-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test142/paper-residual-strips-reader-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test142/paper-residual-strips-cache-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt

node qa27900/frame-accuracy/test142/paper-residual-strips-source-lifecycle-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt

node qa27900/frame-accuracy/test143/round-speech-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test143/reader-round-speech-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test143/source-lifecycle-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test143/ordered-loader-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test143/shared-rim-source-lifecycle-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test143/shared-rim-ordered-loader-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt

node qa27900/frame-accuracy/test144/chromatic-dialogue-pair-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test144/chromatic-dialogue-reader-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test144/chromatic-dialogue-cache-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test144/chromatic-dialogue-source-lifecycle-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt

node qa27900/frame-accuracy/test145/capped-rim-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test145/capped-rim-reader-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test145/capped-rim-quarantine-control.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test145/capped-rim-loader-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test145/reader-edge-rail-loader-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test145/capped-rim-lifecycle-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test145/capped-rim-malformed-source-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test145/round-speech-host-union-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test145/reader-atomic-lifecycle-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test145/source-lifecycle-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test145/ordered-loader-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt

node qa27900/frame-accuracy/test146/rounded-crowd-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test146/reader-rounded-crowd-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test146/source-lifecycle-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test146/loader-order-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt

node qa27900/frame-accuracy/test147/shared-seam-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test147/shared-seam-retirement-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test147/reader-shared-seam-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test147/source-lifecycle-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test147/loader-order-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt

node qa27900/frame-accuracy/test147/absent-family-cost-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt

node qa27900/frame-accuracy/test148/chromatic-side-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test148/chromatic-side-reader-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test148/chromatic-side-cache-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test148/chromatic-side-source-lifecycle-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt

node qa27900/frame-accuracy/test149/chromatic-open-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test149/chromatic-open-reader-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test149/chromatic-open-cache-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test149/chromatic-open-source-lifecycle-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt

node qa27900/frame-accuracy/test150/ink-corner-partition-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test150/reader-lifecycle-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test150/reader-ownership-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt

node qa27900/frame-accuracy/test151/articulated-rim-cell-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt

node qa27900/frame-accuracy/test152/gradient-inset-pair-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test152/reader-gradient-inset-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test152/gradient-inset-loader-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test152/gradient-inset-crossing-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test152/gradient-inset-caption-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test152/reader-gradient-inset-lifecycle-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test152/reader-gradient-inset-provenance-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt

node qa27900/frame-accuracy/test152/authenticated-tap-router-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test152/page-deck-detection-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt

node qa27900/frame-accuracy/test152/matte-source-sampling-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt

node qa27900/frame-accuracy/test153/connected-boundary-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test153/reader-connected-boundary-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test153/connected-boundary-loader-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test153/connected-caption-native-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test153/reader-connected-boundary-lifecycle-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test153/reader-connected-boundary-provenance-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node --max-old-space-size=512 qa27900/frame-accuracy/test153/raster-witness-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node --max-old-space-size=512 qa27900/frame-accuracy/test153/evidence-budget-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt
node --max-old-space-size=512 qa27900/frame-accuracy/test153/discovery-retention-contract.cjs </dev/null 2>&1 | tee -a dist/regression-checks.txt

python3 - <<'CHECK'
import json
from pathlib import Path
Path("dist/retained-completion.json").write_text(json.dumps({"passed":True,"behavioralSuites":248,"retainedSuites":249,"cachePackageSuites":1,"cachePackageAndSyntax":"passed"})+"\n")
CHECK
