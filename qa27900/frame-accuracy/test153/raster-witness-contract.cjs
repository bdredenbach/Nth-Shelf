'use strict';

const assert = require('node:assert/strict');
const { load } = require('./load.cjs');
const provider = load().provider;
const a = new Uint8ClampedArray([1, 2, 3, 255]);
const b = new Uint8ClampedArray([9, 8, 7, 255]);

const first = provider.token(a, 1, 1);
assert(Object.isFrozen(first));
assert.equal(Object.keys(first).length, 0, 'opaque token exposes no pixels');
assert(!provider.matchesRetained(a, 1, 1, first), 'tentative evidence is not retained');
assert(provider.commit(first));
assert(provider.matchesRetained(a, 1, 1, first));
a[0] = 2;
assert(!provider.matchesRetained(a, 1, 1, first), 'one byte rejects stale witness');
a[0] = 1;
assert(provider.matchesRetained(a, 1, 1, first), 'caller cannot mutate the private copy');
assert(!provider.matchesRetained(a, 2, 1, first), 'dimensions are part of identity');

const tentative = provider.token(b, 1, 1);
assert(provider.matches(a, 1, 1, first));
assert(provider.matches(b, 1, 1, tentative));
assert(!provider.matchesRetained(b, 1, 1, tentative));
assert(provider.matchesRetained(a, 1, 1, first));
provider.discard(tentative);
assert(!provider.matches(b, 1, 1, tentative));
assert(!provider.commit(tentative), 'discarded attempt cannot later commit');
assert.equal(provider.token(a, 1, 1), first, 'failed attempt preserves completed witness');

const second = provider.token(b, 1, 1);
assert(provider.commit(second));
assert(!provider.matches(a, 1, 1, first), 'successful other source evicts prior witness');
assert(provider.matchesRetained(b, 1, 1, second));
const oversized = new Uint8ClampedArray(32 * 1024 * 1024 + 4);
assert.equal(provider.token(oversized, 1, oversized.length / 4), null);
assert.equal(provider.token(b, 1, 1), second, 'oversize fallback preserves bounded success');
assert.equal(provider.token(new Float32Array(4), 1, 1), null);
assert.equal(provider.token([9, 8, 7, 255], 1, 1), null);

const shared = new Uint8Array(new SharedArrayBuffer(4));
Object.defineProperty(shared, 'buffer', { value: new ArrayBuffer(4) });
assert.equal(provider.token(shared, 1, 1), null, 'intrinsic branding rejects disguised shared storage');
assert(!provider.matchesRetained(shared, 1, 1, second));
const iter = new Uint8Array([1, 2, 3, 255]);
iter[Symbol.iterator] = function* () { yield* [9, 9, 9, 9]; };
const iteratorToken = provider.token(iter, 1, 1);
assert(provider.matches(a, 1, 1, iteratorToken), 'copy uses indexed bytes analyzed by detector');
assert(!provider.matches(new Uint8Array([9, 9, 9, 9]), 1, 1, iteratorToken));
assert(provider.commit(iteratorToken));
assert(provider.matchesRetained(a, 1, 1, iteratorToken));

// Caller-defined length/buffer/tag accessors must never participate in byte
// identity. In particular, a length getter returning4,4,0 used to skip the loop.
for (const Type of [Uint8Array, Uint8ClampedArray]) {
  const original = new Type([1, 2, 3, 255]);
  const retained = provider.token(original, 1, 1);
  assert(provider.commit(retained));
  let reads = 0;
  const changed = new Type([9, 8, 7, 255]);
  Object.defineProperty(changed, 'length', { get() { return ++reads <= 2 ? 4 : 0; } });
  assert(!provider.matchesRetained(changed, 1, 1, retained), 'changing length cannot hide changed bytes');
  assert(!provider.matches(changed, 1, 1, retained), 'ordinary match uses the same intrinsic bound');
  assert.equal(reads, 0);

  const owners = [{}];
  const guarded = new Type([1, 2, 3, 255]);
  Object.defineProperties(guarded, {
    length: { get() {
      reads++; owners.length = 0; guarded[0] = 99;
      const other = provider.token(new Type([8, 8, 8, 255]), 1, 1);
      provider.commit(other);
      throw Error('caller-controlled getter must not run');
    } },
    buffer: { get() { reads++; throw Error('shadowed buffer getter'); } },
    [Symbol.toStringTag]: { get() { reads++; throw Error('shadowed tag getter'); } }
  });
  assert.equal(provider.token(guarded, 1, 1), retained, 'capture never invokes public getters');
  assert(provider.matchesRetained(guarded, 1, 1, retained));
  assert(provider.matches(guarded, 1, 1, retained));
  assert.equal(owners.length, 1, 'source comparison cannot reenter and alter owner bindings');
  assert.equal(guarded[0], 1);
  assert.equal(reads, 0);

  const fresh = new Type([6, 5, 4, 255]);
  Object.defineProperty(fresh, 'length', { get() { reads++; throw Error('copy length getter'); } });
  const pending = provider.token(fresh, 1, 1);
  assert(pending && pending !== retained);
  assert(provider.matches(fresh, 1, 1, pending), 'pending copy uses intrinsic source length');
  fresh[3] = 254;
  assert(!provider.matches(fresh, 1, 1, pending), 'last byte is always compared');
  assert(!provider.matchesRetained(fresh, 1, 1, pending));
  provider.discard(pending);
  assert.equal(reads, 0);
}
let dimensionReads = 0;
const dimension = { valueOf() { dimensionReads++; return 1; } };
assert.equal(provider.token(a, dimension, 1), null);
assert.equal(provider.token(a, 1, dimension), null);
assert.equal(dimensionReads, 0, 'dimension checks do not invoke caller coercion');
assert.equal(provider.token(a, .5, 2), null);
assert.equal(provider.token(new Uint8Array(0), 0, 1), null);
assert.equal(provider.token(new Proxy(a, {}), 1, 1), null);

console.log(JSON.stringify({ passed: true, generatedSourcesOnly: true,
  controls: ['tentative versus committed evidence', 'exact bytes and dimensions',
    'detached private copy', 'discard and successful eviction', '32 MiB bound',
    'intrinsic typed-array and shared-storage checks', 'overridden iterator',
    'changing public length cannot skip byte comparisons',
    'public getter mutation and reentrancy never execute',
    'pending copy and last-byte comparison', 'no dimension coercion'],
  resourceUsage: process.resourceUsage() }, null, 2));
