#!/usr/bin/env bash
set -euo pipefail
mkdir -p dist
# Reuse every Test77 detector/regression contract, replacing only its version-specific SW assertion.
sed '/node qa27900\/frame-accuracy\/test77\/service-worker.test.cjs/d' qa27900/frame-accuracy/test77/run-retained.sh | bash
node qa27900/frame-accuracy/test78/empty-map-boundary-contract.cjs 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test78/service-worker.test.cjs 2>&1 | tee -a dist/regression-checks.txt
