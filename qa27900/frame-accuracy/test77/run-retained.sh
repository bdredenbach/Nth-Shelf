#!/usr/bin/env bash
set -euo pipefail
mkdir -p dist
# Reuse every Test76 contract, replacing only Test76's version-specific SW assertion.
sed '/node qa27900\/frame-accuracy\/test76\/service-worker.test.cjs/d' qa27900/frame-accuracy/test76/run-retained.sh | bash
node qa27900/frame-accuracy/test77/narrow-ink-contract.cjs 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test77/service-worker.test.cjs 2>&1 | tee -a dist/regression-checks.txt
