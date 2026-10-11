#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../../.."
node qa27900/frame-accuracy/test163/terminal-residual-controls.cjs
node qa27900/frame-accuracy/test163/preparation-controls.cjs
node qa27900/frame-accuracy/test163/reader-navigation-contract.cjs
node qa27900/frame-accuracy/test163/service-worker.test.cjs
