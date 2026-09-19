'use strict';

// Synthetic layouts run without comic files or image libraries. --comic also
// checks independently reviewed tap ownership against the local Wolverine
// fixture, then inventories every page against the unchanged baseline stage.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const context = vm.createContext({ console, window: {}, document: {
  createElement() {
    let image;
    return { getContext() { return {
      drawImage(value) { image = value; },
      getImageData() { return { data: image.rgba }; }
    }; } };
  }
} });
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', 'panels.js'), 'utf8'), context);
const detector = vm.runInContext('PanelDetect', context);
const plain = value => JSON.parse(JSON.stringify(value));
const contains = (p, x, y) => x >= p.x && x < p.x + p.w && y >= p.y && y < p.y + p.h;
const at = (panels, x, y) => panels.findIndex(p => contains(p, x, y));

function image(width = 600, height = 900) {
  const rgba = new Uint8ClampedArray(width * height * 4);
  for (let p = 0; p < width * height; p++) {
    rgba[p * 4] = rgba[p * 4 + 1] = rgba[p * 4 + 2] = 120;
    rgba[p * 4 + 3] = 255;
  }
  return { width, height, rgba };
}
function fill(img, x0, y0, x1, y1, textured = true) {
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
    const p = (y * img.width + x) * 4;
    const value = textured ? (((x + y) % 2) ? 220 : 20) : 120;
    img.rgba[p] = img.rgba[p + 1] = img.rgba[p + 2] = value;
  }
}

function syntheticChecks() {
  const nested = image();
  for (const rect of [[20, 20, 200, 860], [210, 20, 580, 270],
    [210, 280, 380, 860], [390, 280, 580, 860]]) fill(nested, ...rect);
  assert.deepEqual(plain(detector._analyze(nested)), [
    { x: 20 / 600, y: 20 / 900, w: 180 / 600, h: 840 / 900 },
    { x: 210 / 600, y: 20 / 900, w: 370 / 600, h: 250 / 900 },
    { x: 210 / 600, y: 280 / 900, w: 170 / 600, h: 580 / 900 },
    { x: 390 / 600, y: 280 / 900, w: 190 / 600, h: 580 / 900 }
  ], 'a nested H/V layout must resolve to the four drawn interiors, without gutters');

  const parent = { x: 20 / 600, y: 20 / 900, w: 560 / 600, h: 840 / 900,
    marker: 'preserve-this-object' };
  const refine = img => detector._splitInternalGutters(img.rgba, 600, 900, [parent]);
  const negatives = [
    ['textured artwork without a gutter', () => {}],
    ['interrupted artwork band', img => fill(img, 100, 430, 580, 440, false)],
    ['one-pixel artwork stroke', img => fill(img, 20, 430, 580, 431, false)],
    ['quiet background reaching the outer edge', img => fill(img, 20, 20, 580, 400, false)],
    ['near-edge artwork band', img => fill(img, 20, 40, 580, 50, false)]
  ];
  for (const [name, mutate] of negatives) {
    const img = image();
    fill(img, 20, 20, 580, 860);
    mutate(img);
    const result = refine(img);
    assert.equal(result.length, 1, name);
    assert.equal(result[0], parent, `${name}: preserve exact original geometry and metadata`);
  }
  console.log('Internal gutter synthetic checks passed: nested H/V/H geometry and five artwork/fragment controls.');
}

async function comicChecks() {
  const { api, pages, loadPage } = require('./harness');
  // Tap locations are independent visual labels within distinct drawn panels,
  // not detector-generated expected polygons. Page numbers below are human,
  // one-based numbers in the 74-image fixture, matching the reader recordings.
  const expected = [
    { page: 9, taps: [[.7, .65], [.7, .85]], bounds: [[.45, .56, .96, .74], [.45, .73, .96, .98]] },
    { page: 15, taps: [[.7, .15], [.7, .39], [.7, .55]], bounds: [[.25, 0, .98, .31], [.25, .31, .98, .47], [.25, .47, .98, .67]] },
    { page: 20, taps: [[.75, .56], [.75, .8]], bounds: [[.55, .52, .98, .62], [.55, .64, .98, .98]] },
    { page: 31, taps: [[.6, .32], [.5, .57], [.88, .57]], bounds: [[.27, .27, .98, .38], [.27, .38, .77, .74], [.76, .38, .98, .74]] },
    { page: 48, taps: [[.66, .33], [.48, .59], [.8, .6]], bounds: [[.35, .22, .98, .43], [.35, .42, .60, .79], [.59, .42, .98, .79]] },
    { page: 50, taps: [[.7, .69], [.7, .86]], bounds: [[.35, .63, .98, .80], [.35, .79, .98, .99]] }
  ];
  const refine = api.PanelDetect._splitInternalGutters;
  const inventory = [];
  for (let page = 0; page < pages.length; page++) {
    const img = await loadPage(page);
    let before;
    try {
      api.PanelDetect._splitInternalGutters = (data, w, h, panels) => panels;
      before = api.PanelDetect._analyze(img);
    } finally { api.PanelDetect._splitInternalGutters = refine; }
    const after = api.PanelDetect._analyze(img);
    const changed = JSON.stringify(before) !== JSON.stringify(after);
    inventory.push({ page: page + 1, beforeCount: before.length, afterCount: after.length, changed });
    const reference = expected.find(entry => entry.page === page + 1);
    if (!reference) {
      assert.deepEqual(plain(after), plain(before), `human page ${page + 1}: unchanged control`);
      continue;
    }
    const oldOwners = reference.taps.map(([x, y]) => at(before, x, y));
    assert.ok(oldOwners.every(owner => owner >= 0 && owner === oldOwners[0]),
      `human page ${page + 1}: reproduce the merged baseline owner`);
    const newOwners = reference.taps.map(([x, y]) => at(after, x, y));
    assert.ok(newOwners.every(owner => owner >= 0), `human page ${page + 1}: every interior tap has a frame`);
    assert.equal(new Set(newOwners).size, reference.taps.length,
      `human page ${page + 1}: independently drawn panels must have distinct owners`);
    newOwners.forEach((owner, index) => {
      const frame = after[owner], expectedBounds = reference.bounds[index];
      const actual = [frame.x, frame.y, frame.x + frame.w, frame.y + frame.h];
      actual.forEach((value, edge) => assert.ok(Math.abs(value - expectedBounds[edge]) <= .015,
        `human page ${page + 1}, panel ${index}: match the manually reviewed extent`));
    });
  }
  const changed = inventory.filter(entry => entry.changed);
  assert.equal(changed.length, 6, 'only the six visually reviewed pages may change');
  console.log(JSON.stringify({ pages: inventory.length, changed,
    unchanged: inventory.length - changed.length,
    additionalPanels: changed.reduce((sum, entry) => sum + entry.afterCount - entry.beforeCount, 0) }, null, 2));
  const output = process.env.NTH_GUTTER_INVENTORY;
  if (output) fs.writeFileSync(output, JSON.stringify(inventory, null, 2));
}

(async () => {
  syntheticChecks();
  if (process.argv.includes('--comic')) await comicChecks();
})().catch(error => { console.error(error); process.exitCode = 1; });
