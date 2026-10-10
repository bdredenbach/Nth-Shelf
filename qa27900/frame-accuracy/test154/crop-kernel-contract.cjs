'use strict';

const fs = require('node:fs'), path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(process.env.NTH_SHELF_SOURCE || path.join(__dirname, '../../..'));
const source = fs.readFileSync(path.join(root, 'js/panels-crop-repair.js'), 'utf8');
const exported = 'return {repair,raster,inside,captionBodies};';
assert(source.includes(exported));
// Observe the actual private kernels without substituting their implementation.
const api = new Function(source.replace(exported, 'return {morph,fillClosed};') +
  ';return PanelCropRepair;')();

function square(mask, w, h, radius, grow) {
  const result = new Uint8Array(mask.length);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let value = !grow;
    for (let dy = -radius; dy <= radius; dy++) for (let dx = -radius; dx <= radius; dx++) {
      const X = x + dx, Y = y + dy;
      const bit = X >= 0 && X < w && Y >= 0 && Y < h && !!mask[Y * w + X];
      value = grow ? value || bit : value && bit;
    }
    result[y * w + x] = +value;
  }
  return result;
}

function exteriorFill(mask, w, h) {
  const outside = new Set(), stack = [];
  for (let i = 0; i < mask.length; i++) if (!mask[i] &&
    (i < w || i >= (h - 1) * w || i % w === 0 || i % w === w - 1)) stack.push(i);
  while (stack.length) {
    const i = stack.pop();
    if (outside.has(i) || mask[i]) continue;
    outside.add(i);
    const x = i % w, y = Math.floor(i / w);
    for (const [X,Y] of [[x-1,y],[x+1,y],[x,y-1],[x,y+1]]) {
      if (X >= 0 && X < w && Y >= 0 && Y < h) stack.push(Y*w+X);
    }
  }
  return Uint8Array.from(mask, (value, i) => +(value || !outside.has(i)));
}

let cases = 0, morphologyChecks = 0, seed = 315947;
const random = () => ((seed = (Math.imul(seed,1664525)+1013904223) >>> 0) / 2**32);
function check(mask,w,h) {
  const original = mask.slice();
  for (const radius of [0,1,2,Math.max(w,h)+1]) for (const grow of [true,false]) {
    assert.deepEqual(api.morph(mask,w,h,radius,grow),square(mask,w,h,radius,grow));
    morphologyChecks++;
  }
  assert.deepEqual(api.fillClosed(mask,w,h),exteriorFill(mask,w,h));
  assert.deepEqual(mask,original,'input mask is unchanged');
  cases++;
}
for (const [w,h] of [[1,1],[1,4],[4,1],[2,2],[2,3],[3,2],[3,3]]) {
  for (let bits=0;bits<2**(w*h);bits++) {
    check(Uint8Array.from({length:w*h},(_,i)=>(bits>>>i)&1),w,h);
  }
}
for (let i=0;i<80;i++) {
  const w=1+Math.floor(random()*24),h=1+Math.floor(random()*24),density=random();
  check(Uint8Array.from({length:w*h},()=>+(random()<density)),w,h);
}
for (const [w,h] of [[585,900],[900,585],[900,900]]) {
  const empty = new Uint8Array(w*h), full = new Uint8Array(w*h).fill(1);
  assert.deepEqual(api.fillClosed(empty,w,h),empty,'maximum exterior traversal');
  assert.deepEqual(api.fillClosed(full,w,h),full,'no exterior seed');
  assert.deepEqual(api.morph(empty,w,h,13,true),empty);
  assert.deepEqual(api.morph(full,w,h,13,true),full);
  const eroded = api.morph(full,w,h,13,false);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++) {
    assert.equal(eroded[y*w+x],+(x>=13&&x<w-13&&y>=13&&y<h-13),
      'erosion keeps exact zero-padded boundary behavior');
  }
}
console.log(JSON.stringify({passed:true,generatedSourcesOnly:true,cases,morphologyChecks,
  independentSquareOracle:true,independentFloodFillOracle:true,maximumRepairDimensions:true,
  callerMasksUnchanged:true,resourceUsage:process.resourceUsage()},null,2));
