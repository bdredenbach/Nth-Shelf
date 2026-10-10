'use strict';

// Portable synthetic-only source/geometry/serialization regression driver.
// Does not load checkpoint files, original artwork, stored crops, or old proofs.
//
// NTH_SHELF_SOURCE=/path/to/source \
// NTH_RAIL_CANDIDATE=/path/to/panels-page-edge-rail-cell.js \
// node edge-rail-regression.cjs

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const fixtures = require('./edge-rail-fixtures.cjs');

function loadCanvas() {
  try { return require('@napi-rs/canvas'); }
  catch (error) {
    if (error.code !== 'MODULE_NOT_FOUND' || !process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES) throw error;
    return require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, '@napi-rs/canvas'));
  }
}

function loadSourceApi(sourceRoot, candidatePath) {
  const canvas = loadCanvas();
  const index = fs.readFileSync(path.join(sourceRoot, 'index.html'), 'utf8');
  const scripts = [...index.matchAll(/src="(js\/(?!terminal-native-bootstrap\.js)(?:panels|terminal)[^\"]*\.js)"/g)].map(match => match[1]);
  assert(scripts.length > 0, 'Source index must contain the panel modules.');
  const paths = scripts.map(script => path.resolve(sourceRoot, script));
  const candidateSource = fs.readFileSync(candidatePath, 'utf8');
  const code = paths.map(file => fs.readFileSync(file, 'utf8')).join('\n') +
    (paths.includes(path.resolve(candidatePath)) ? '' : '\n' + candidateSource);
  // The existing QA source-contract tests use the same isolated source-module
  // evaluation style. Dependencies and validators here are the real modules.
  const api = new Function('document', 'Image', 'window', code +
    '; return { PanelMatteCells, PanelHighContrastEnclosures, PanelPageEdgeRailCell };')(
    { createElement: () => canvas.createCanvas(1, 1) }, canvas.Image, {});
  return { api, candidateSha256: crypto.createHash('sha256').update(candidateSource).digest('hex') };
}

function copy(value) { return JSON.parse(JSON.stringify(value)); }

function checkHorizontalExtrema(detector) {
  assert.equal(typeof detector.horizontalExtrema, 'function');
  let checked = 0, state = 0x5f3759df;
  for (const [w, h] of [[1,1],[2,3],[5,3],[9,2],[31,7]]) {
    for (const pattern of ['constant', 'ascending', 'descending', 'alternating', 'seeded']) {
      const input = new Uint8Array(w * h);
      for (let i = 0; i < input.length; i++) {
        state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
        input[i] = pattern === 'constant' ? 84 : pattern === 'ascending' ? i % 256 :
          pattern === 'descending' ? 255 - i % 256 : pattern === 'alternating' ? (i % 2 ? 255 : 0) : state >>> 24;
      }
      for (const radius of [0,1,2,4,8]) for (const maximum of [false,true]) {
        const expected = new Uint8Array(input.length);
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
          let value = maximum ? 0 : 255;
          for (let offset = -radius; offset <= radius; offset++) {
            const next = input[y * w + Math.max(0, Math.min(w - 1, x + offset))];
            value = maximum ? Math.max(value, next) : Math.min(value, next);
          }
          expected[y * w + x] = value;
        }
        assert.deepEqual(detector.horizontalExtrema(input,w,h,radius,maximum), expected,
          `${pattern} ${w}x${h} radius ${radius} ${maximum ? 'maximum' : 'minimum'}`);
        checked++;
      }
    }
  }
  return { bruteForceEquivalentCases: checked };
}

function checkBrightNoiseOverflow(detector) {
  const w = 700, h = 1200;
  const rgba = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < w * h; i++) rgba.set([54,186,205,255], i * 4);
  assert(detector.evidence(rgba,w,h), 'The quiet saturated control must have usable palette evidence.');
  let isolatedBrightPixels = 0;
  for (let y = 10; y < h - 10; y += 4) for (let x = 10; x < w - 10; x += 4) {
    rgba.set([255,255,255,255], (y * w + x) * 4);
    isolatedBrightPixels++;
  }
  assert(isolatedBrightPixels > 16000);
  assert.equal(detector.evidence(rgba,w,h), null, 'Excessive disconnected bright islands must fail closed.');
  assert.equal(detector.evidence(rgba,w,h), null, 'Bright-noise abstention must repeat deterministically.');
  return { isolatedBrightPixels, fragmentedEvidenceRejected: true, deterministic: true };
}

function checkProductionSource(api) {
  const fixture = fixtures.makeProductionFixture();
  const { rgba, w, h } = fixture;
  const scale = 900 / Math.max(w, h);
  const parentWidth = Math.round(w * scale), parentHeight = Math.round(h * scale);
  const reduced = api.PanelMatteCells.sampleBilinearRGBA(rgba, w, h, parentWidth, parentHeight);
  const parents = api.PanelHighContrastEnclosures.analyzeRGBA(reduced, parentWidth, parentHeight, []);
  assert.equal(parents.length, 1, 'Synthetic pixels must generate one genuine enclosing source parent.');
  assert.equal(parents[0]._structuralGridProof.mode, 'empty-enclosure');
  assert(api.PanelHighContrastEnclosures.validPanel(copy(parents[0])));
  const parentSnapshot = JSON.stringify(parents);
  const detector = api.PanelPageEdgeRailCell;
  assert(detector.eligible(parents), 'Eligibility must be obtained from the real source proof.');
  const panels = detector.analyzeRGBA(rgba, w, h, parents);
  assert.equal(panels.length, 1, 'Production entry point must accept the independently generated fixture.');
  const panel = panels[0];
  assert(detector.validPanel(panel));
  assert(detector.validPanel(copy(panel)), 'Serialized descriptor must replay without cache identity.');
  assert.equal(JSON.stringify(parents), parentSnapshot, 'Source parent must remain unchanged.');
  assert.equal(panel._geometryType, 'page-edge-rail-cell');
  assert.deepEqual(detector.analyzeRGBA(rgba, w, h, parents), panels, 'Production output must repeat exactly.');
  assert.deepEqual(detector.analyzeRGBA(rgba, w, h, []), [], 'Missing source parent must abstain.');
  assert.deepEqual(detector.analyzeRGBA(reduced, parentWidth, parentHeight, parents), [], '900px production input must abstain.');
  assert.deepEqual(detector.analyzeRGBA(rgba, w, h, [{x:0,y:0,w:1,h:1}]), [], 'An unproved parent is not eligibility.');

  const edits = [
    ['geometry box', q => { q.x += 0.01; }],
    ['output contour', q => { q._contours[0][0].x += 0.01; }],
    ['proof version', q => { q._structuralGridProof.version++; }],
    ['prior proof', q => { q._structuralGridProof.prior = []; }],
    ['witness threshold', q => { q._structuralGridProof.witnesses[0].threshold++; }],
    ['source ink run', q => { q._structuralGridProof.witnesses[0].ink[0]++; }],
    ['closing matte support', q => {
      const witness = q._structuralGridProof.witnesses[0];
      const matte = detector.decode(witness.matte, w * h);
      const [left, , right, bottom] = witness.skel.railBox;
      for (let y = bottom + 1; y < Math.min(h, bottom + 30); y++) {
        matte.fill(0, y * w + left, y * w + right);
      }
      witness.matte = detector.encode(matte);
    }],
    ['source window', q => { q._structuralGridProof.witnesses[0].roi[0]++; }],
    ['annotation body', q => { q._structuralGridProof.witnesses[0].bodies[0].indices.pop(); }],
    ['recovered mask', q => { q._structuralGridProof.witnesses[0].mask[0]++; }],
    ['reported area', q => { q._structuralGridProof.pixels++; }],
    ['threshold agreement', q => { q._structuralGridProof.difference++; }],
  ];
  for (const [name, edit] of edits) {
    const changed = copy(panel);
    edit(changed);
    assert.equal(detector.validPanel(changed), false, `Tampered ${name} must not validate.`);
  }

  // Changing source artwork invalidates its exact parent replay even when a
  // caller supplies the formerly genuine, still independently valid parent.
  const changedSource = rgba.slice();
  const changedPixel = (Math.floor(h * 0.75) * w + Math.floor(w * 0.10)) * 4;
  changedSource.set([255, 0, 255, 255], changedPixel);
  assert.deepEqual(detector.analyzeRGBA(changedSource, w, h, parents), [], 'Mismatched source/parent replay must abstain.');
  const geometry = fixtures.probeCandidateGeometry(detector, fixture);
  assert(geometry.passed, 'Production fixture must meet independent mask labels.');
  assert.equal(geometry.metrics.secondaryArtworkPixelsOwned, 0, 'No secondary artwork may leak into the rail-cell owner.');
  return { genuineParent: true, acceptedDescriptor: true, serializedReplay: true,
    deterministic: true, sourceReplayMismatchRejected: true, corruptionsRejected: edits.length, geometry };
}

function run(options = {}) {
  const sourceRoot = path.resolve(options.sourceRoot || process.env.NTH_SHELF_SOURCE || path.join(__dirname, '../../..'));
  const candidatePath = path.resolve(options.candidatePath || process.env.NTH_RAIL_CANDIDATE || path.join(sourceRoot, 'js/panels-page-edge-rail-cell.js'));
  const { api, candidateSha256 } = loadSourceApi(sourceRoot, candidatePath);
  const extrema = checkHorizontalExtrema(api.PanelPageEdgeRailCell);
  const noiseOverflow = checkBrightNoiseOverflow(api.PanelPageEdgeRailCell);
  const all = fixtures.makeFixtures();
  const construction = fixtures.validateFixtures(all);
  const cases = all.map(fixture => {
    const result = fixtures.probeCandidateGeometry(api.PanelPageEdgeRailCell, fixture);
    assert(result.passed, `${fixture.caseName}: independent ownership geometry failed: ${JSON.stringify(result)}`);
    if (!fixture.options.negative) {
      assert.equal(result.metrics.sfxMissingExactInk, 0, `${fixture.caseName}: opaque SFX outline tip clipped.`);
      assert.equal(result.metrics.sfxMissingBrightPixels, 0, `${fixture.caseName}: bright SFX content clipped.`);
    }
    return result;
  });
  const production = checkProductionSource(api);
  return { passed: true, candidateSha256, extrema, noiseOverflow, construction, cases, production,
    syntheticOnly: true, productionRuntimeIntegrationTested: false };
}

module.exports = { loadSourceApi, checkHorizontalExtrema, checkBrightNoiseOverflow, checkProductionSource, run };
if (require.main === module) {
  try { console.log(JSON.stringify(run(), null, 2)); }
  catch (error) { console.error(error.stack); process.exitCode = 1; }
}
