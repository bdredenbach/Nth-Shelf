#!/usr/bin/env bash
set -euo pipefail
mkdir -p dist
# Keep every Test78 detector/regression contract except its version-specific SW identity assertion.
sed '/node qa27900\/frame-accuracy\/test78\/service-worker.test.cjs/d' qa27900/frame-accuracy/test78/run-retained.sh | bash
node qa27900/frame-accuracy/test79/top-row-barrier-contract.cjs 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test79/service-worker.test.cjs 2>&1 | tee -a dist/regression-checks.txt
