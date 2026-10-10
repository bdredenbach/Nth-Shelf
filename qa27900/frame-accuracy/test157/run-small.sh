#!/usr/bin/env bash
# Small source-only gate. No retained corpus, original artwork, browser or network.
set -euo pipefail
cd "$(dirname "$0")/../../.."
node qa27900/frame-accuracy/test157/reader-stale-tap-contract.cjs
node qa27900/frame-accuracy/test157/reader-publication-contract.cjs
node qa27900/frame-accuracy/test157/terminal-lifecycle-contract.cjs
node qa27900/frame-geometry-contract.cjs
