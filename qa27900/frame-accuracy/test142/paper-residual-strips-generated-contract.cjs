'use strict';

// Public, generated-only geometry contract. Every pixel and mask below is drawn
// from this program; no publication image, crop, contour, identity, or checksum
// is needed. Run with NTH_SHELF_SOURCE pointing at the application's source root.
// Optional module overrides support testing a proposed change before install.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
let canvas;
try {
  canvas = require('@napi-rs/canvas');
} catch (error) {
  const modules = process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES;
  if (!modules) throw error;
  canvas = require(path.join(modules, '@napi-rs/canvas'));
}

const root = path.resolve(process.env.NTH_SHELF_SOURCE || path.join(__dirname, '../../..'));
const context = vm.createContext({ console });
for (const moduleFile of [
  path.join(root, 'js/panels-colored-rims.js'),
  path.join(root, 'js/panels-matte-cells.js'),
  process.env.NTH_UPPER_PAPER_MODULE || path.join(root, 'js/panels-upper-paper-separation.js'),
  process.env.NTH_PAPER_RESIDUAL_MODULE || path.join(root, 'js/panels-paper-residual-strips.js'),
]) vm.runInContext(fs.readFileSync(moduleFile, 'utf8'), context, { filename: moduleFile });
const strips = vm.runInContext('PanelPaperResidualStrips', context);
const separation = vm.runInContext('PanelUpperPaperSeparation', context);

function fixture(seed, mode = 'positive') {
  const width = [680, 790, 880][seed % 3];
  const height = [550, 620, 680][seed % 3];
  const surface = canvas.createCanvas(width, height);
  const g = surface.getContext('2d');
  const paper = ['#ffffff', '#faf7f3', '#f4f8f5'][seed % 3];
  const ink = ['#202026', '#29221f', '#222b25'][seed % 3];
  const top = 21 + (seed % 4) * 7;
  const left = 11 + (seed % 3) * 6;
  const right = width - 13 - (seed % 4) * 5;
  const bottom = top + Math.round(height * .39);
  const row = top + Math.round((bottom - top) * .70);
  const middle = Math.round((left + right) / 2) + (seed % 3 - 1) * 7;
  const gapWidth = Math.round(width * (.060 + (seed % 3) * .007));
  const gapLeft = middle - Math.floor(gapWidth / 2);
  const gapRight = gapLeft + gapWidth;
  g.fillStyle = paper;
  g.fillRect(0, 0, width, height);
  g.fillStyle = ['#456181', '#a66d62', '#486653'][seed % 3];
  g.fillRect(left, top, right - left, bottom - top);
  g.fillStyle = ['#8c7139', '#467f83', '#836a88'][seed % 3];
  g.fillRect(left, row + 4, right - left, bottom - row - 4);

  // Irregular original hatch marks make the upper scene non-uniform without
  // introducing other paper seams or enclosed speech shapes.
  for (let k = 0; k < 150; k++) {
    g.fillStyle = k % 2 ? ink : '#d8b779';
    g.fillRect(left + (k * 137 + seed * 23) % (right - left - 10),
      top + (k * 43) % (row - top - 12), 3 + k % 6, 2 + k % 3);
  }
  if (mode !== 'missing-seam') {
    g.fillStyle = ink;
    g.fillRect(left, row - 3, right - left, 3);
    g.fillStyle = paper;
    g.fillRect(left, row, right - left, 5);
  }
  if (mode === 'ambiguous-seam') {
    g.fillStyle = ink;
    g.fillRect(left, row - 21, right - left, 3);
    g.fillStyle = paper;
    g.fillRect(left, row - 18, right - left, 5);
  }

  const group = new Uint8Array(width * height);
  for (let y = top; y < bottom; y++) {
    for (let x = left; x < right; x++) group[y * width + x] = 1;
  }
  if (mode !== 'missing-gap') {
    g.fillStyle = mode === 'bad-gap-paper' ? '#b7b7b7' : paper;
    g.fillRect(gapLeft, row + 5, gapWidth, bottom - row - 5);
    for (let y = row; y < bottom; y++) {
      for (let x = gapLeft; x < gapRight; x++) group[y * width + x] = 0;
    }
  }
  if (mode === 'third-fragment') {
    const x = right - Math.round(width * .045);
    g.fillStyle = paper;
    g.fillRect(x, row, 7, bottom - row);
    for (let y = row; y < bottom; y++) {
      for (let dx = 0; dx < 7; dx++) group[y * width + x + dx] = 0;
    }
  }

  const bodies = [];
  for (const [bodyIndex, x] of [Math.round((left + gapLeft) / 2), Math.round((gapRight + right) / 2)].entries()) {
    if (mode === 'missing-speech' && bodyIndex === 0) continue;
    const y = row - 7;
    const rx = 43 + seed % 5;
    const ry = 27 + seed % 3;
    // The missing-tail control affects only one strip. Its unaccounted closed
    // oval may itself make the seam uncertain, which must also reject the cut.
    const hasTail = mode !== 'severed-tail' && !(mode === 'missing-tail' && bodyIndex === 0);
    const upward = mode === 'upward-tail';
    const tailAt = upward ? 48 : 16;
    g.fillStyle = paper;
    g.strokeStyle = ink;
    g.lineWidth = 2;
    g.beginPath();
    for (let z = 0; z <= 64; z++) {
      if (hasTail && z === tailAt - 2) {
        g.lineTo(x + 20, y + (upward ? -ry - 25 : ry + 25));
        z = tailAt + 2;
      }
      const angle = z * Math.PI / 32;
      const xx = x + rx * Math.cos(angle);
      const yy = y + ry * Math.sin(angle);
      if (z === 0) g.moveTo(xx, yy);
      else g.lineTo(xx, yy);
    }
    g.closePath();
    g.fill();
    g.stroke();
    if (mode === 'severed-tail') {
      g.beginPath();
      g.moveTo(x + 6, y + ry + 5);
      g.lineTo(x + 20, y + ry + 25);
      g.lineTo(x - 3, y + ry + 5);
      g.closePath();
      g.fill();
      g.stroke();
    }
    g.fillStyle = ink;
    for (let ty = -13; ty <= 11; ty += 8) {
      for (let tx = -24; tx <= 24; tx += 8) g.fillRect(x + tx, y + ty, 3, 4);
    }
    bodies.push({ x, y });
  }
  const rgba = g.getImageData(0, 0, width, height).data;
  if (mode === 'transparent') rgba[3] = 254;
  return { rgba, width, height, group, row, bodies, gapLeft, gapRight, bottom };
}

function mirror(f) {
  const rgba = new Uint8ClampedArray(f.rgba.length);
  const group = new Uint8Array(f.group.length);
  for (let y = 0; y < f.height; y++) {
    for (let x = 0; x < f.width; x++) {
      const i = y * f.width + x;
      const j = y * f.width + f.width - 1 - x;
      rgba.set(f.rgba.subarray(i * 4, i * 4 + 4), j * 4);
      group[j] = f.group[i];
    }
  }
  return { ...f, rgba, group,
    bodies: f.bodies.map(b => ({ x: f.width - 1 - b.x, y: b.y })),
    gapLeft: f.width - f.gapRight, gapRight: f.width - f.gapLeft };
}

const plain = value => JSON.parse(JSON.stringify(value));
const geometry = result => result && plain({
  row: result.row,
  gap: result.gap,
  paperSamples: result.paperSamples,
  paperMatches: result.paperMatches,
  caps: result.caps,
  bodies: result.bodies,
  parts: result.parts.map(p => ({ box: p.box, pixels: p.pixels,
    lowerPixels: p.lowerPixels, inheritedPixels: p.inheritedPixels,
    speechRimPixels: p.speechRimPixels,
    bodies: p.bodies, rings: p.rings })),
});

function partition(f, rgba = f.rgba) {
  return strips.partition(rgba, f.width, f.height, f.group);
}

function canonical(f) {
  const classified = strips.classify(f.rgba, f.width, f.height);
  if (!classified) return null;
  const encoded = strips.encode(classified);
  const decoded = strips.decode(encoded, f.width * f.height);
  assert(decoded, 'canonical feature stream decodes');
  assert.deepEqual(Array.from(decoded), Array.from(classified), 'lossless feature stream');
  return strips.restore(decoded);
}

function assertPositive(f, label) {
  const result = partition(f);
  assert(result, label + ': generated residual strips accepted');
  assert.equal(result.parts.length, 2, label + ': exactly two residuals');
  assert(Math.abs(result.row - f.row) <= 4, label + ': witnessed seam');
  assert.equal(result.gap, f.gapRight - f.gapLeft, label + ': generated paper gap');
  const upper = separation.discoverRGBA(f.rgba, f.width, f.height, f.group);
  assert(upper, label + ': independent upper separation exists');
  assert.equal(separation.components(f.group, f.width, f.height).length, 1,
    label + ': original broad group is connected');
  const supplied = strips.partition(f.rgba, f.width, f.height, f.group, upper);
  assert.deepEqual(geometry(supplied), geometry(result), label + ': supplied separation parity');
  const completeSpeech = new Set(upper.bodies.flatMap(b => b.indices));
  for (let i = 0; i < f.group.length; i++) {
    const count = result.parts.reduce((n, p) => n + p.mask[i], 0);
    assert.equal(count, +((f.group[i] && !upper.mask[i]) || completeSpeech.has(i)),
      label + ': exact source residual and complete speech coverage');
  }
  for (const p of result.parts) {
    assert.equal(p.bodies.length, 1, label + ': one complete speech body per strip');
    assert.equal(p.rings.length, 1, label + ': one contour per strip');
    assert.equal(separation.components(p.mask, f.width, f.height).length, 1,
      label + ': connected strip');
  }
  for (const b of upper.bodies) {
    assert.equal(result.parts.filter(p => b.indices.every(i => p.mask[i])).length, 1,
      label + ': every speech body stays indivisible');
  }
  const replayed = partition(f, canonical(f));
  assert(replayed, label + ': classified source replay accepted');
  assert.deepEqual(geometry(replayed), geometry(result), label + ': source/replay geometry parity');
  for (let k = 0; k < result.parts.length; k++) {
    assert.deepEqual(Array.from(replayed.parts[k].mask), Array.from(result.parts[k].mask),
      label + ': source/replay mask parity');
  }
  return result;
}

let positives = 0;
let negatives = 0;
for (let seed = 0; seed < 6; seed++) {
  const f = fixture(seed);
  const result = assertPositive(f, 'seed ' + seed);
  const flipped = assertPositive(mirror(f), 'mirror ' + seed);
  for (let k = 0; k < result.parts.length; k++) {
    for (let y = 0; y < f.height; y++) {
      for (let x = 0; x < f.width; x++) {
        assert.equal(result.parts[k].mask[y * f.width + x],
          flipped.parts[1 - k].mask[y * f.width + f.width - 1 - x],
          'horizontal mirror preserves residual ownership');
      }
    }
  }
  positives += 2;
}

const modes = ['missing-seam', 'ambiguous-seam', 'missing-tail', 'missing-speech', 'severed-tail',
  'upward-tail', 'missing-gap', 'third-fragment', 'bad-gap-paper', 'transparent'];
for (let seed = 0; seed < 3; seed++) {
  for (const mode of modes) {
    const f = fixture(seed, mode);
    if (['missing-speech', 'missing-gap', 'third-fragment', 'bad-gap-paper'].includes(mode)) {
      const upper = separation.discoverRGBA(f.rgba, f.width, f.height, f.group);
      assert(upper, mode + ': upper seam is independently valid, seed ' + seed);
      const residual = f.group.map((v, i) => +(v && !upper.mask[i]));
      const count = separation.components(residual, f.width, f.height).length;
      assert.equal(count, mode === 'missing-gap' ? 1 : mode === 'third-fragment' ? 3 : 2,
        mode + ': isolated residual topology control, seed ' + seed);
    }
    assert.equal(partition(f), null, mode + ': source rejected, seed ' + seed);
    const replay = canonical(f);
    if (mode === 'transparent') {
      assert.equal(replay, null, 'transparent source is not serializable');
    } else {
      assert(replay, mode + ': opaque feature stream exists');
      assert.equal(partition(f, replay), null, mode + ': classified replay rejected, seed ' + seed);
    }
    negatives++;
  }
}

// Reconcile an omitted lower artwork wedge using only independently supplied
// generated pixels. Speech bodies and all four original extent edges survive.
let supportedCases = 0;
for (const seed of [0, 2]) {
  const f = fixture(seed);
  const complete = partition(f);
  assert(complete, 'support baseline is accepted');
  const damaged = f.group.slice();
  const support = new Uint8Array(f.group.length);
  const [x, , , bottom] = complete.parts[0].box;
  const wedgeHeight = 22;
  let missing = 0;
  for (let y = bottom - wedgeHeight; y < bottom; y++) {
    const wedgeWidth = 2 + (y - bottom + wedgeHeight) * 3;
    for (let xx = x; xx < x + wedgeWidth; xx++) {
      const i = y * f.width + xx;
      assert(complete.parts[0].mask[i], 'small wedge is inside original residual');
      damaged[i] = 0;
      support[i] = 1;
      missing++;
    }
  }
  const before = strips.partition(f.rgba, f.width, f.height, damaged);
  assert(before, 'small omitted wedge is accepted before support reconciliation');
  const repaired = strips.partition(f.rgba, f.width, f.height, damaged, null, support);
  assert(repaired, 'small supplied wedge is restored');
  assert.equal(repaired.parts[0].inheritedPixels, missing, 'inherited pixel count is exact');
  assert.equal(repaired.parts[1].inheritedPixels, 0, 'unaffected strip inherits no pixels');
  for (let k = 0; k < complete.parts.length; k++) {
    assert.deepEqual(Array.from(repaired.parts[k].mask), Array.from(complete.parts[k].mask),
      'reconciled support exactly restores the original generated mask');
    assert.deepEqual(plain(repaired.parts[k].box), plain(complete.parts[k].box),
      'reconciliation preserves original extent');
    assert.deepEqual(plain(repaired.parts[k].rings), plain(complete.parts[k].rings),
      'reconciliation restores original contours');
    assert.equal(repaired.parts[k].pixels, complete.parts[k].pixels, 'derived pixel count is restored');
    assert.equal(repaired.parts[k].lowerPixels, complete.parts[k].lowerPixels,
      'derived lower pixel count is restored');
  }
  const replayed = strips.partition(canonical(f), f.width, f.height, damaged, null, support);
  assert.deepEqual(geometry(replayed), geometry(repaired), 'supported source/replay parity');

  // A connected frame and the complete speech body remain after carving a
  // larger interior omission. Its removal is over 30% of the remaining strip.
  const excessive = f.group.slice();
  const excessiveSupport = new Uint8Array(f.group.length);
  const upper = separation.discoverRGBA(f.rgba, f.width, f.height, f.group);
  const speech = new Set(upper.bodies.flatMap(b => b.indices));
  const [left, , right, lower] = complete.parts[0].box;
  const target = Math.ceil(complete.parts[0].pixels * .25);
  let removed = 0;
  for (let y = lower - 2; y > complete.row + 4 && removed < target; y--) {
    for (let xx = left + 1; xx < right - 1 && removed < target; xx++) {
      const i = y * f.width + xx;
      if (!complete.parts[0].mask[i] || speech.has(i)) continue;
      excessive[i] = 0;
      excessiveSupport[i] = 1;
      removed++;
    }
  }
  assert.equal(removed, target, 'generated lower region can supply excessive-support control');
  const unsupported = strips.partition(f.rgba, f.width, f.height, excessive);
  assert(unsupported, 'excessive-support control passes without inherited pixels');
  assert(removed > unsupported.parts[0].pixels * .30, 'addition exceeds 30% of existing residual');
  assert.equal(strips.partition(f.rgba, f.width, f.height, excessive, null, excessiveSupport), null,
    'over-30% inherited addition is rejected');
  assert.equal(strips.partition(canonical(f), f.width, f.height, excessive, null, excessiveSupport), null,
    'over-30% inherited addition is rejected on classified replay');
  supportedCases++;
}

// Contracting an inherited broad group cannot trim a source-certified speech
// rim. Remove several boundary pixels, keeping the seam and both cells joined.
let speechRimCases = 0;
{
  const f = fixture(1);
  const complete = partition(f);
  const upper = separation.discoverRGBA(f.rgba, f.width, f.height, f.group);
  assert(complete && upper, 'speech-rim baseline is accepted');
  const body = upper.bodies.find(b => b.indices.some(i => complete.parts[0].mask[i]));
  assert(body, 'left strip has a source-certified speech body');
  const bodySet = new Set(body.indices);
  const candidates = body.indices.filter(i => {
    const adjacent = [i - 1, i + 1, i - f.width, i + f.width];
    return f.group[i] && Math.floor(i / f.width) < upper.row - 8 &&
      adjacent.some(j => !bodySet.has(j)) && adjacent.filter(j => bodySet.has(j)).length >= 2;
  });
  const removed = candidates.filter((_, i) => i % 4 === 0).slice(0, 6);
  assert.equal(removed.length, 6, 'generated speech has enough separated outer rim pixels');
  const contracted = { ...f, group: f.group.slice() };
  for (const i of removed) contracted.group[i] = 0;
  assert.equal(separation.components(contracted.group, f.width, f.height).length, 1,
    'contracted broad group remains connected');
  const witnessed = separation.discoverRGBA(f.rgba, f.width, f.height, contracted.group);
  assert(witnessed, 'contracted group preserves independently witnessed seam');
  const residual = contracted.group.map((v, i) => +(v && !witnessed.mask[i]));
  assert.equal(separation.components(residual, f.width, f.height).length, 2,
    'contracted group preserves exactly two connected residuals');
  const repaired = assertPositive(contracted, 'contracted speech rim');
  assert.equal(repaired.parts[0].speechRimPixels, removed.length,
    'all missing certified rim pixels are counted');
  assert.equal(repaired.parts[1].speechRimPixels, 0, 'other speech rim is unchanged');
  for (const p of repaired.parts) assert.equal(p.inheritedPixels, 0,
    'source speech restoration does not depend on inherited support');
  for (const i of removed) assert.equal(repaired.parts[0].mask[i], 1,
    'source-certified speech rim is restored beyond inherited group');
  for (let k = 0; k < complete.parts.length; k++) {
    assert.deepEqual(Array.from(repaired.parts[k].mask), Array.from(complete.parts[k].mask),
      'contracted group restores the complete original generated mask');
    assert.deepEqual(plain(repaired.parts[k].rings), plain(complete.parts[k].rings),
      'contracted group restores complete original contours');
    assert.equal(repaired.parts[k].pixels, complete.parts[k].pixels,
      'speech restoration has exact pixel count');
    assert.equal(repaired.parts[k].lowerPixels, complete.parts[k].lowerPixels,
      'speech restoration has exact lower pixel count');
  }
  speechRimCases++;
}

console.log('PASS ' + positives + ' generated geometry/palette/translation and mirror positives; ' +
  negatives + ' malformed-source negatives; exact coverage, indivisible speech, contours, ' +
  'and classified source replay parity; ' + supportedCases + ' bounded support-reconciliation controls; ' +
  speechRimCases + ' contracted-group speech-rim control.');
