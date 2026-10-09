'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { root, load } = require('./load.cjs');
const rt = load({ observeDiscovery: true });
const atomicFixtures = require(path.join(root, 'qa27900/frame-accuracy/test136/round-atomic-fixtures.cjs'));
const speechFixtures = require(path.join(root, 'qa27900/frame-accuracy/test143/round-speech-fixtures.cjs'));
const fixtures = { atomic: atomicFixtures.scene, speech: speechFixtures.fixture };
const results = [];

for (const family of ['atomic', 'speech']) {
  const api = rt[family];
  const source = fixtures[family]();
  const label = `js/panels-round-${family}-inset.js`;
  const analyze = (rgba = source.rgba) => api.analyzeRGBA(rgba, source.w, source.h, []);
  const count = () => rt.calls[label];
  const output = analyze();
  assert.equal(output.length, 1, 'generated positive fixture remains accepted');
  let before = count();
  const hit = analyze(source.rgba.slice());
  assert.deepEqual(hit, output, 'hit preserves complete graph, including undefined fields');
  assert.equal(count(), before, 'equal bytes skip only completed discovery');
  assert.notEqual(hit[0], output[0]);
  assert.notEqual(hit[0]._structuralGridProof, output[0]._structuralGridProof);
  hit[0].x += .1;
  assert.throws(() => { hit[0]._structuralGridProof.version = -1; }, TypeError,
    'returned validated proof stays immutable');
  assert.deepEqual(analyze(), output, 'caller cannot alias retained evidence');
  assert.equal(count(), before);

  const changed = source.rgba.slice();
  const proof = output[0]._structuralGridProof;
  const pixel = family === 'atomic' ? proof.atoms[0].runs[0][0]
    : proof.source.box[1] * source.w + proof.source.box[0];
  for (let channel = 0; channel < 3; channel++) {
    const offset = 4 * pixel + channel;
    changed[offset] = changed[offset] < 128 ? 255 : 0;
  }
  assert.equal(api.replayRGBA(changed, source.w, source.h, output, []), false,
    'same-size one-pixel RGB change rejects stale ownership');
  assert(count() > before, 'changed source goes through discovery');
  before = count();
  assert.deepEqual(analyze(), output, 'restored pixels reconstruct exact original graph');
  assert(count() > before, 'successful changed discovery evicted prior source');

  before = count();
  const alpha = source.rgba.slice();
  alpha[3] = 254;
  assert.equal(analyze(alpha).length, 0, 'incomplete source is rejected');
  assert.deepEqual(analyze(), output);
  assert.equal(count(), before, 'failed attempt preserves completed pure discovery');

  const empty = new Uint8ClampedArray(source.rgba.length).fill(255);
  assert.equal(analyze(empty).length, 0);
  before = count();
  assert.equal(analyze(empty).length, 0);
  assert.equal(count(), before + 1, 'empty discovery is never cached');
  before = count();
  assert.deepEqual(analyze(), output);
  assert.equal(count(), before, 'A to empty B to A retains successful discovery');

  const oversized = new Uint8ClampedArray(2048 * 4097 * 4);
  assert.equal(api.analyzeRGBA(oversized, 2048, 4097, []).length, 0);
  before = count();
  assert.deepEqual(analyze(), output);
  assert.equal(count(), before, 'oversize invalid source cannot evict bounded success');

  const other = fixtures[family]({ mirror: true });
  before = count();
  assert.equal(api.analyzeRGBA(other.rgba, other.w, other.h, []).length, 1);
  assert(count() > before, 'valid source C recomputes');
  before = count();
  assert.deepEqual(analyze(), output);
  assert(count() > before, 'A to valid C to A evicts then recomputes A');
  results.push({ family, passed: true, discoveryCalls: count() });
}

// Both families must use one native witness, while each independently validates
// its original prior and creates fresh output. No prior/owner result is cached.
const source = speechFixtures.anchoredFixture(atomicFixtures.scene());
const base = rt.ragged.analyzeRGBA(source.rgba, source.w, source.h);
const atomic = rt.atomic.analyzeRGBA(source.rgba, source.w, source.h, base);
const prior = base.concat(atomic);
const speech = rt.speech.analyzeRGBA(source.rgba, source.w, source.h, prior);
assert.equal(atomic.length, 1);
assert.equal(speech.length, 1);
function exactBoth() {
  assert.deepEqual(rt.atomic.analyzeRGBA(source.rgba, source.w, source.h, base), atomic);
  assert.deepEqual(rt.speech.analyzeRGBA(source.rgba, source.w, source.h, prior), speech);
}
let before = { ...rt.calls };
exactBoth();
assert.deepEqual(rt.calls, before, 'same native source shares one witness across families');
const empty = new Uint8ClampedArray(source.rgba.length).fill(255);
assert.equal(rt.atomic.analyzeRGBA(empty, source.w, source.h, []).length, 0);
assert.equal(rt.speech.analyzeRGBA(empty, source.w, source.h, []).length, 0);
before = { ...rt.calls };
exactBoth();
assert.deepEqual(rt.calls, before, 'empty unrelated source preserves both discoveries');
const validOther = atomicFixtures.scene({ mirror: true });
assert.equal(rt.atomic.analyzeRGBA(validOther.rgba, validOther.w, validOther.h, []).length, 1);
before = { ...rt.calls };
exactBoth();
for (const label of Object.keys(before)) {
  assert(rt.calls[label] > before[label], 'valid other source evicts shared token for both families');
}
results.push({ family: 'interaction', passed: true });
console.log(JSON.stringify({ passed: true, generatedSourcesOnly: true, results,
  controls: ['complete exact detached output', 'same-size RGB mutation rejects stale ownership',
    'A to failed/empty/oversize B to A', 'no failed/empty discovery retention',
    'A to valid C to A eviction', 'shared witness across proof families'],
  resourceUsage: process.resourceUsage() }, null, 2));
