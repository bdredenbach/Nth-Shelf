#!/usr/bin/env bash
# Portable source, navigation, preparation and reuse guards.
set -euo pipefail
cd "$(dirname "$0")/../../.."
node --max-old-space-size=384 --max-semi-space-size=8 qa27900/frame-accuracy/test159/city-shared-source-contract.cjs
node qa27900/frame-accuracy/test159/reader-navigation-contract.cjs
node qa27900/frame-accuracy/test159/page-preparation-contract.cjs
node --max-old-space-size=384 --max-semi-space-size=8 qa27900/frame-accuracy/test159/fresh-reuse-contract.cjs
node qa27900/frame-accuracy/test159/service-worker.test.cjs
