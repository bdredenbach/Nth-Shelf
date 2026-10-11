#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../../.."
node qa27900/frame-accuracy/test162/matte-rim-controls.cjs
node qa27900/frame-accuracy/test162/preparation-controls.cjs
node qa27900/frame-accuracy/test162/reader-navigation-contract.cjs
node qa27900/frame-accuracy/test162/service-worker.test.cjs
