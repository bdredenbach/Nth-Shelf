'use strict';

const assert = require('node:assert/strict');
const { load } = require('./load.cjs');
const { budgets } = load({ observeBudget: true });
assert.equal(Object.keys(budgets).length, 2);
const encode = value => JSON.stringify(value,
  (key, item) => item === undefined ? { _nthAbsentValue: true } : item);

for (const bounded of Object.values(budgets)) {
  for (const value of [null, undefined, true, false, 0, 1e-300, 1e300,
    'normal', '"\\\n\t\u0001', '😀', '\ud800', '\udc00',
    [undefined, null, 'mixed', 9], { a: undefined, b: [1, 2, 'x'] }]) {
    assert(bounded(value), 'lossless bounded internal evidence is reusable');
    assert(encode(value).length * 2 <= 8 * 1024 * 1024);
  }
  for (const value of [NaN, Infinity, -Infinity, -0]) {
    assert(!bounded(value), 'lossy JSON numeric data must fall back');
  }
  assert(!bounded('a'.repeat(4 * 1024 * 1024)), 'quote bytes count toward serialized cap');
  assert(!bounded('\\'.repeat(2 * 1024 * 1024)), 'escaping counts toward serialized cap');
  assert(!bounded(new Array(4)), 'sparse array would lose field identity');
  assert(!bounded({ fn() {} }), 'unsupported data falls back');
  assert(!bounded(Array(4097).fill(undefined)), 'undefined restoration work is bounded');
  const cycle = {}; cycle.self = cycle;
  assert(!bounded(cycle));
  const graph = Array.from({ length: 4096 }, (_, i) =>
    ({ label: 'q' + i, values: [i, -i || 0, i / 17], missing: undefined }));
  assert(!bounded(graph), 'parsed container count is bounded');
  const permitted = graph.slice(0, 3000);
  assert(bounded(permitted));
  assert(encode(permitted).length * 2 <= 8 * 1024 * 1024);
}
console.log(JSON.stringify({ passed: true, generatedSourcesOnly: true,
  families: Object.keys(budgets), controls: ['UTF-16 serialized size before allocation',
    'escaped strings and surrogate pairs', 'lossy numeric fallback',
    'container and undefined bounds', 'unsupported graph fallback'],
  resourceUsage: process.resourceUsage() }, null, 2));
