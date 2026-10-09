'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(process.env.NTH_SHELF_SOURCE || path.join(__dirname, '../../..'));
let cv;
try { cv = require('@napi-rs/canvas'); }
catch (error) {
  if (!process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES) throw error;
  cv = require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, '@napi-rs/canvas'));
}

// Load the installed panel scripts in their actual index order. The observer
// counts calls to discovery and delegates every call to its unchanged body.
// It never replaces detector results, source checks, or owner validation.
function load({ observeDiscovery = false, observeBudget = false } = {}) {
  const calls = {};
  const budgets = {};
  const scripts = [...fs.readFileSync(path.join(root, 'index.html'), 'utf8')
    .matchAll(/src="(js\/panels[^\"]*\.js)"/g)].map(match => match[1]);
  const code = scripts.map(file => {
    let source = fs.readFileSync(path.join(root, file), 'utf8');
    if (observeDiscovery && /panels-round-(atomic|speech)-inset\.js$/.test(file)) {
      assert.equal(source.split('function discoverRGBA(').length, 2, 'one discovery implementation');
      source = source.replace('function discoverRGBA(', 'function observedDiscoveryBody(');
      const offset = source.indexOf('function observedDiscoveryBody(');
      const label = JSON.stringify(file);
      const observer = `function discoverRGBA(...args) {
        calls[${label}] = (calls[${label}] || 0) + 1;
        return observedDiscoveryBody(...args);
      }\n`;
      source = source.slice(0, offset) + observer + source.slice(offset);
    }
    if (observeBudget && /panels-round-(atomic|speech)-inset\.js$/.test(file)) {
      assert.equal(source.split('function boundedDiscoveryGraph(').length, 2);
      source = source.replace('function boundedDiscoveryGraph(',
        `budgets[${JSON.stringify(file)}] = boundedDiscoveryGraph;\nfunction boundedDiscoveryGraph(`);
    }
    return source;
  }).join('\n');
  return new Function('document', 'Image', 'window', 'calls', 'budgets', code + `;
    return { provider: PanelRasterWitness, atomic: PanelRoundAtomicInset,
      speech: PanelRoundSpeechInset, ragged: PanelRaggedGutters, calls, budgets };`
  )({ createElement: () => cv.createCanvas(1, 1) }, cv.Image, {}, calls, budgets);
}

module.exports = { root, load };
