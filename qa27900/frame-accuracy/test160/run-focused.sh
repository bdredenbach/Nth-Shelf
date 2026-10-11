#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../../.."
node qa27900/frame-accuracy/test160/shared-top-controls.cjs
node qa27900/frame-accuracy/test160/preparation-controls.cjs
node qa27900/frame-accuracy/test160/reader-navigation-contract.cjs
node qa27900/frame-accuracy/test160/service-worker.test.cjs
