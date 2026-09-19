'use strict';
const assert = require('node:assert/strict');
const { analyzeRGBA } = require('../js/panels-page-layout.js');
function fixture({ width = 360, height = 600, count = 5, slope = 0, vertical = false, broken = false, brightEdge = false } = {}) {
  const data = new Uint8ClampedArray(width * height * 4), pad = 16, bottom = height - pad - 1;
  const dividers = Array.from({ length: count - 1 }, (_, i) => pad + (bottom - pad) * (i + 1) / count);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    let v = brightEdge ? 250 : 5;
    if (x >= pad && x < width - pad && y >= pad && y <= bottom) {
      v = 130 + 38 * Math.sin(x * .181 + y * .193) + 25 * Math.sin(x * .059 - y * .113);
      for (const [i, at] of dividers.entries()) if (Math.abs(y - at - slope * (x - width / 2)) < 2 && !(broken && i === 1 && x > width * .91)) v = 5;
      if (vertical && Math.abs(x - width * .51) < 2 && y > dividers[0] && y < dividers[1]) v = 5;
    }
    const i = (y * width + x) * 4; data[i] = data[i + 1] = data[i + 2] = Math.round(v); data[i + 3] = 255;
  }
  return { data, width, height };
}
const run = cfg => { const f = fixture(cfg); return analyzeRGBA(f.data, f.width, f.height); };
function assertExpectedQuads(panels, { width = 360, height = 600, count = 5, slope = 0 } = {}) {
  assert.equal(panels.length, count, 'independent synthetic strip count');
  const pad = 16, bottom = height - pad - 1;
  for (let i = 0; i < count; i++) {
    const p = panels[i];
    assert.equal(p._identitySource, 'page-layout'); assert.equal(p._pageLayoutProof.closed, true);
    assert.equal(p._quad.length, 4);
    for (let corner = 0; corner < 4; corner++) {
      const q = p._quad[corner]; assert(Number.isFinite(q.x) && Number.isFinite(q.y));
      const x = corner === 0 || corner === 3 ? pad - 1 : width - pad;
      const lower = corner >= 2;
      const boundary = lower ? i + 1 : i;
      // Ground truth is the independently drawn 4-pixel rail band. A corner
      // may lie anywhere in that band plus one raster pixel, not in artwork.
      const expectedY = boundary === 0 ? pad - 1 : boundary === count ? height - pad
        : pad + (bottom - pad) * boundary / count + slope * (x - width / 2);
      assert(Math.abs(q.x * width - x) <= 3, `panel ${i} corner ${corner} must retain outer border`);
      assert(Math.abs(q.y * height - expectedY) <= 3, `panel ${i} corner ${corner} must follow independently drawn divider; actual ${q.y * height}, expected ${expectedY}`);
    }
  }
}
assertExpectedQuads(run({}));
for (const slope of [.01, -.015, .025]) {
  const panels = run({ slope }); assertExpectedQuads(panels, { slope });
  if (Math.abs(slope) >= .02) assert(panels.some(p => Math.abs(p._quad[1].y - p._quad[0].y) > .003), 'fitted slope survives in output quad');
}
assertExpectedQuads(run({ width: 420, height: 700, count: 4, slope: -.02 }), { width: 420, height: 700, count: 4, slope: -.02 });
assert.equal(run({ vertical: true }).length, 0, 'vertical panel subdivision vetoes complete strip map');
assert.equal(run({ count: 1 }).length, 0, 'artwork without internal borders rejected');
assert.equal(run({ count: 3 }).length, 0, 'insufficient independent boundaries rejected');
assert.equal(run({ brightEdge: true }).length, 0, 'white-background layout outside this conservative detector');
assert.equal(analyzeRGBA(new Uint8Array(8), 360, 600).length, 0, 'malformed buffers rejected');
assert.equal(run({ broken: true }).length, 0, 'partially hidden divider must not merge panels');
console.log('page-layout: synthetic stacks, skewed rails, ownership vetoes, finite quads passed');
