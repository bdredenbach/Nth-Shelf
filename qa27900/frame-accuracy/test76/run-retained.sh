#!/usr/bin/env bash
set -euo pipefail
mkdir -p dist
# Retain the entire Test75 suite, replacing only its version-specific service-worker assertion.
sed '/node qa27900\/frame-accuracy\/test75\/service-worker.test.cjs/d' qa27900/frame-accuracy/test75/run-retained.sh | bash
node qa27900/frame-accuracy/test76/chromatic-shared-border-contract.cjs 2>&1 | tee -a dist/regression-checks.txt
node qa27900/frame-accuracy/test76/service-worker.test.cjs 2>&1 | tee -a dist/regression-checks.txt
