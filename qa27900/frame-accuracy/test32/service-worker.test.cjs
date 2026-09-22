'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '../../..');
const source = fs.readFileSync(process.argv[2] || path.join(root, 'sw.js'), 'utf8');
function worker(options = {}) {
  const listeners = {}, order = [], stores = new Map();
  const cache = {
    async addAll(files) { order.push('addAll'); if (options.installFails) throw Error('offline'); this.files = files; },
    async match(request) { order.push('match-current'); return options.cached; },
    async put(request, response) { order.push('put'); if (options.putFails) throw Error('quota'); stores.set(request.url, response); }
  };
  const context = vm.createContext({
    self: { location: { origin: 'https://example.test' },
      addEventListener(name, listener) { listeners[name] = listener; },
      async skipWaiting() { order.push('skipWaiting'); },
      clients: { async claim() { order.push('claim'); } } },
    caches: { async open(name) { order.push('open:' + name); return cache; },
      async keys() { return options.keys || []; },
      async delete(name) { order.push('delete:' + name); return true; },
      async match() { throw Error('Global cache lookup is forbidden'); } },
    async fetch(request) { order.push('fetch'); if (options.offline) throw Error('offline'); return options.response || new Response('ok'); },
    console: { warn() {} }, URL, Response
  });
  vm.runInContext(source, context);
  return {listeners, order, stores, cache, name: vm.runInContext('CACHE_NAME', context)};
}
async function lifecycle(w, name) { let promise; w.listeners[name]({waitUntil(p) { promise = p; }}); await promise; }
async function request(w, url = 'https://example.test/Nth-Shelf/js/app.js', method = 'GET') {
  let response; const pending = [];
  w.listeners.fetch({request: {url, method}, respondWith(p) { response = p; }, waitUntil(p) { pending.push(p); }});
  const result = await response; await Promise.all(pending); return result;
}
(async () => {
  let passed = 0;
  let w = worker(); await lifecycle(w, 'install');
  assert(w.order.indexOf('addAll') < w.order.indexOf('skipWaiting')); passed++;
  assert(new Set(w.cache.files).size === w.cache.files.length); passed++;
  assert(!w.name.includes('2.79.33')); passed++;
  w = worker({installFails: true}); await assert.rejects(lifecycle(w, 'install'));
  assert(!w.order.includes('skipWaiting')); passed++;
  const current = worker().name;
  w = worker({keys: [current, 'nth-shelf-shell-old', 'nth-reader-shell-old', 'another-app']});
  await lifecycle(w, 'activate');
  assert.deepEqual(w.order.filter(x => x.startsWith('delete:')), ['delete:nth-shelf-shell-old']); passed++;
  assert(w.order.indexOf('delete:nth-shelf-shell-old') < w.order.indexOf('claim')); passed++;
  const cached = new Response('cached'); w = worker({cached});
  assert.equal(await request(w), cached); assert(!w.order.includes('fetch')); passed++;
  w = worker(); assert.equal((await request(w)).status, 200); assert.equal(w.stores.size, 1); passed++;
  w = worker(); await request(w, 'https://cdnjs.cloudflare.com/ajax/libs/x.js'); assert.equal(w.stores.size, 1); passed++;
  for (const url of ['https://example.test.evil.invalid/x.js', 'https://evil.invalid/?cdnjs.cloudflare.com', 'https://elsewhere.invalid/x.js']) {
    w = worker(); await request(w, url); assert.equal(w.stores.size, 0); passed++;
  }
  w = worker({response: new Response('missing', {status: 404})});
  assert.equal((await request(w)).status, 404); assert.equal(w.stores.size, 0); passed++;
  w = worker({offline: true}); assert.equal((await request(w)).type, 'error'); passed++;
  w = worker({putFails: true}); assert.equal((await request(w)).status, 200); passed++;
  w = worker(); assert.equal(await request(w, undefined, 'POST'), undefined); assert.deepEqual(w.order, []); passed++;
  console.log(JSON.stringify({passed, serviceWorker: process.argv[2] || 'sw.js'}));
})().catch(error => {console.error(error); process.exitCode = 1;});
