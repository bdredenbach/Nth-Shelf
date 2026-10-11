#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../../.."
node qa27900/frame-accuracy/test161/residual-row-controls.cjs
node qa27900/frame-accuracy/test161/preparation-controls.cjs
node qa27900/frame-accuracy/test161/reader-navigation-contract.cjs
node qa27900/frame-accuracy/test161/service-worker.test.cjs
