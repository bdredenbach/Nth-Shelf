#!/usr/bin/env bash
# Generated controls only. Coordinate the 512 MiB complete-tree reservation first.
set -euo pipefail
cd "$(dirname "$0")/../../.."
node --max-old-space-size=384 --max-semi-space-size=8 qa27900/frame-accuracy/test158/source-issued-rim-contract.cjs
node --max-old-space-size=384 --max-semi-space-size=8 qa27900/frame-accuracy/test158/source-issued-chain-contract.cjs
node qa27900/frame-accuracy/test158/service-worker.test.cjs
