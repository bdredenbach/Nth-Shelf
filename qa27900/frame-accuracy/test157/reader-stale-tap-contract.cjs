'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
// Detector/refiner, DOM, timer and display methods below are explicit test doubles.
// The complete installed Reader supplies gestures, request guards, and publication.
const installed = require('./contract-source.cjs');
const sourcePath = 'js/reader.js';
const baseline = process.argv.includes('--baseline-witness');
const code = installed.source('reader.js');
const sourceSha256 = crypto.createHash('sha256').update(code).digest('hex');
const results = [];
// Failure watchdog only. Successful controls always release and await every
// requested promise explicitly; elapsed time can never establish success.
const watchdog = setTimeout(() => { console.error('A deferred control did not settle'); process.exit(1); }, 30000);
const rect = { left: 0, top: 0, width: 600, height: 900, right: 600, bottom: 900 };
const pos = { x: 300, y: 450 };
function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
function element() {
  const events = new Map();
  return {
    events, children: [], style: { setProperty() {} }, dataset: {},
    classList: { add() {}, remove() {}, contains() { return false; } },
    getBoundingClientRect: () => rect, setAttribute() {},
    addEventListener(name, fn) { if (!events.has(name)) events.set(name, new Set()); events.get(name).add(fn); },
    removeEventListener(name, fn) { events.get(name)?.delete(fn); },
    emit(name, data = {}) { for (const fn of [...events.get(name) || []]) fn({ preventDefault() {}, stopPropagation() {}, clientX: pos.x, clientY: pos.y, ...data }); },
    appendChild(child) { this.children.push(child); child.parentNode = this; },
    remove() { this.parentNode = null; },
    querySelector() { return null; }, querySelectorAll() { return []; },
    animate() { return { cancel() {} }; },
  };
}
function fixture(route = 'quick') {
  const stage = element(), img = Object.assign(element(), {
    src: 'generated://same-source', currentSrc: 'generated://same-source',
    naturalWidth: 600, naturalHeight: 900, width: 600, height: 900, complete: true,
  });
  const timers = new Map(); let timerId = 0;
  const context = vm.createContext({
    console, localStorage: { getItem: () => null, setItem() {} },
    clamp: (v, lo, hi) => Math.max(lo, Math.min(hi, v)),
    setTimeout(fn) { timers.set(++timerId, fn); return timerId; }, clearTimeout(id) { timers.delete(id); },
    requestAnimationFrame() {}, document: { createElement: element },
    window: { LongboxApp: { closeReader() {} } },
    LongboxDB: { updateComic() {}, getComic: async () => null },
    URL: { revokeObjectURL() {} },
  });
  vm.runInContext(code, context, { filename: sourcePath });
  const reader = vm.runInContext('Reader', context);
  const panel = { x: .2, y: .2, w: .6, h: .6, _identitySource: 'generated-owner',
    _contours: [[{ x: .2, y: .2 }, { x: .8, y: .2 }, { x: .8, y: .8 }, { x: .2, y: .8 }]] };
  const hit = { x: .25, y: .25, w: .5, h: .5, _geometryOwner: 'orthogonal-frame',
    _frameEnvelope: { chainConnected: true } };
  const owners = [{ x: 0, y: 0, w: .1, h: .1 }, { x: .9, y: .9, w: .1, h: .1 }];
  if (route === 'canonical') owners.push(panel);
  let currentImg = img;
  const calls = [], opens = [], attempts = [], gate = deferred(), ready = deferred();
  const wait = (name, otherwise) => {
    calls.push(name);
    if (route === name || route === 'canonical' && name === 'refine') {
      ready.resolve(); return gate.promise;
    }
    return Promise.resolve(otherwise);
  };
  Object.assign(reader, {
    comic: { id: 'generated-request', pageCount: 4 }, index: 1, mode: 'single', scale: 1,
    currentPanels: owners, _panelLoadToken: 2, panelOverlayToken: 7,
    els: { stage, viewport: element(), chrome: element() },
    getPanelImageContext: () => ({ img: currentImg, rect }),
    getPageUrl: () => wait('url', img.src),
    findPanelAt: () => route === 'canonical' ? panel : null,
    panelContours: p => p._contours,
    displayPanelContours: (p, contours) => contours,
    zoomToPanel(p) {
      attempts.push(p);
      if (this.focusMode) return;
      opens.push(p); this.focusMode = 'panel'; this.panelOverlayActive = true; this.panelOverlayToken++;
    },
    toggleChrome() { calls.push('toggle'); }, showChrome() {}, debugLog() {},
    setFocusDim() {}, applyTransform() {}, saveProgress() {}, revokeAll() {}, stopAutoScroll() {},
    turnPageMode: { book: {}, next() {}, prev() {}, goTo() {}, destroy() {} },
    useTurnJSPageMode: true,
  });
  context.PanelMap = { findAt: () => null, endIssue() {} };
  context.PanelGeometry = {
    refineAdaptiveOnly: () => wait('quick', route === 'detection' || route === 'url' ? hit : null),
    refine: (url, seed) => wait(route === 'hybrid-refine' || route === 'local-refine' ? route : route === 'canonical' ? 'refine' : 'rescue', seed),
  };
  context.PanelDetect = {
    detect: () => wait('detection', []),
    detectTapHybrid: () => wait('hybrid', route === 'hybrid-refine' ? hit : null),
    detectTapLocalFallback: () => wait('local', route === 'local-refine' ? hit : null),
  };
  if (route === 'detection') {
    reader.preparePanelMaps = () => {};
    reader.loadPanelsForCurrentPage().catch(() => {});
  }
  reader.bindGestures();
  const value = () => route === 'detection' ? [] : route === 'url' ? img.src : route === 'canonical' ? { ...panel } : hit;
  return { reader, context, stage, img, timers, panel, hit, owners, calls, opens, attempts, gate, ready,
    tap: () => reader.handleSingleTap(pos), value,
    image: value => { currentImg = value; },
    listeners: () => [...img.events.values()].reduce((n, set) => n + set.size, 0),
  };
}
async function check(name, fn) { await fn(); results.push(name); }
const routes = ['detection', 'url', 'canonical', 'quick', 'hybrid', 'hybrid-refine', 'local', 'local-refine', 'rescue'];
const mutations = [
  ['reset close', f => f.reader.resetZoom({ animate: false })],
  ['overlay close', f => f.reader.removePanelOverlay(false)],
  ['reader close', f => f.reader.close()],
  ['new issue request before comic load', f => f.reader.open('new-generated-issue')],
  ['mode input before state changes', f => f.reader.setMode(f.reader.mode)],
  ['navigate and return', f => { f.reader.goTo(2); f.reader.goTo(1); }],
  ['next before page commit', f => f.reader.next()],
  ['previous before page commit', f => f.reader.prev()],
  ['page replacement', f => { f.reader.index++; }],
  ['comic replacement same id', f => { f.reader.comic = { ...f.reader.comic }; }],
  ['mode change', f => { f.reader.mode = 'scroll'; }],
  ['same URL load', f => f.img.emit('load')],
  ['same URL error then load', f => { f.img.emit('error'); f.img.emit('load'); }],
  ['source URL change', f => { f.img.src += '/changed'; }],
  ['current source change', f => { f.img.currentSrc += '/changed'; }],
  ['source identity replacement', f => f.image({ ...f.img })],
  ['source readiness change', f => { f.img.complete = false; }],
  ['source decoded width change', f => { f.img.naturalWidth++; }],
  ['source decoded height change', f => { f.img.naturalHeight++; }],
  ['source displayed width change', f => { f.img.width++; }],
  ['source displayed height change', f => { f.img.height++; }],
  ['throwing source getter', f => Object.defineProperty(f.img, 'currentSrc', { get() { throw Error('bad source'); } })],
  ['overlay generation change', f => { f.reader.panelOverlayToken++; }],
  ['page load generation change', f => { f.reader._panelLoadToken++; }],
  ['new mouse input', f => f.stage.emit('mousedown')],
  ['new touch input', f => f.stage.emit('touchstart', { touches: [{ clientX: pos.x, clientY: pos.y }] })],
  ['wheel input and restore', f => { f.stage.emit('wheel', { deltaY: -10 }); f.reader.scale = 1; }],
  ['native zoom input', f => f.stage.emit('nth-zoom-start')],
  ['native navigation input', f => f.stage.emit('nth-navigation-swipe')],
  ['new double tap', f => { f.reader.bubbleAltZoomEnabled = false; return f.reader.handleDoubleTap(pos); }],
];
async function doubleClickWitness() {
  const f = fixture('hybrid-refine'), gates = [], reached = [], pending = [];
  f.reader.focusMode = 'panel'; f.reader.panelOverlayActive = true;
  f.context.PanelDetect.detectTapHybrid = () => {
    const gate = deferred(); gates.push(gate); reached.shift()?.resolve(); return gate.promise;
  };
  f.context.PanelGeometry.refine = async (url, p) => p;
  const single = f.reader.handleSingleTap;
  f.reader.handleSingleTap = function(point) { const promise = single.call(this, point); pending.push(promise); return promise; };
  for (let i = 0; i < 2; i++) {
    const ready = deferred(); reached.push(ready);
    f.stage.emit('mousedown'); f.stage.emit('mouseup');
    await ready.promise;
  }
  f.stage.emit('dblclick');
  assert.equal(f.reader.focusMode, null, 'actual dblclick handler closes the panel before release');
  assert.equal(f.reader.panelOverlayActive, false);
  gates[1].resolve(f.hit); await pending[1];
  gates[0].resolve(f.hit); await pending[0];
  assert.equal(f.listeners(), 0);
  const result = { pendingHandlers: pending.length, settledHandlers: pending.length, releaseOrder: [2, 1],
    zoomAttempts: f.attempts.length, opens: f.opens.length, endFocus: f.reader.focusMode,
    endOverlay: f.reader.panelOverlayActive, elapsedTimeoutUsedForSuccess: false };
  if (baseline) assert.equal(result.endOverlay, true, 'baseline must reproduce delayed reopening');
  else { assert.equal(result.zoomAttempts, 0); assert.equal(result.endOverlay, false); }
  return result;
}

(async () => {
  const witness = await doubleClickWitness();
  if (baseline) {
    console.log(JSON.stringify({ passed: true, baselineReproduces: true, sourcePath, sourceSha256, simulatedRealReaderInputHandlers: witness }, null, 2));
    return;
  }
  for (const route of routes) {
    await check(route + ': current successful completion', async () => {
      const f = fixture(route), pending = f.tap(); await f.ready.promise;
      assert.equal(f.opens.length, 0);
      f.gate.resolve(f.value()); await pending;
      assert.equal(f.opens.length, 1);
      if (route === 'canonical') assert.equal(f.opens[0], f.panel, 'canonical owner identity retained');
      assert.equal(f.listeners(), 0);
    });
    for (const [label, mutate] of mutations) await check(route + ': ' + label, async () => {
      const f = fixture(route), pending = f.tap(); await f.ready.promise;
      await mutate(f);
      const before = f.calls.length;
      f.gate.resolve(f.value()); await pending;
      assert.equal(f.attempts.length, 0, route + ': ' + label + ' must not reopen');
      assert.equal(f.calls.length, before, 'stale completion must not start another fallback or toggle chrome');
      assert.equal(f.listeners(), 0, 'settled request releases every source listener');
    });
    for (const canceled of [false, true]) await check(route + ': ' + (canceled ? 'stale' : 'live') + ' rejection cleanup', async () => {
      const f = fixture(route), pending = f.tap(); await f.ready.promise;
      if (canceled) f.reader.resetZoom({ animate: false });
      const checked = canceled ? pending : assert.rejects(pending, /controlled failure/);
      f.gate.reject(Error('controlled failure')); await checked;
      assert.equal(f.attempts.length, 0); assert.equal(f.listeners(), 0);
    });
    await check(route + ': owner-map replacement', async () => {
      const f = fixture(route), pending = f.tap(); await f.ready.promise;
      f.reader.currentPanels = f.reader.currentPanels.slice();
      const before = f.calls.length;
      f.gate.resolve(f.value()); await pending;
      assert.equal(f.attempts.length, 0); assert.equal(f.calls.length, before); assert.equal(f.listeners(), 0);
    });
    const mapChanges = [
      ['append owner', owners => owners.push({ x: .1, y: .1, w: .1, h: .1 })],
      ['replace owner identity', owners => { owners[0] = { ...owners[0] }; }],
      ['remove owner', owners => owners.pop()],
      ['reorder owners', owners => owners.reverse()],
      ['delete owner slot', owners => { delete owners[0]; }],
    ];
    for (const [label, mutate] of mapChanges) {
      if (route === 'detection' && label !== 'append owner') continue; // Actual loader's initial map is empty.
      await check(route + ': same-array ' + label, async () => {
        const f = fixture(route), pending = f.tap(); await f.ready.promise;
        const identity = f.reader.currentPanels; mutate(identity);
        const before = f.calls.length; f.gate.resolve(f.value()); await pending;
        assert.equal(f.attempts.length, 0); assert.equal(f.calls.length, before); assert.equal(f.listeners(), 0);
      });
    }
    await check(route + ': newer tap survives older completion cleanup', async () => {
      const f = fixture(route), first = f.tap(); await f.ready.promise;
      const fresh = deferred(), reached = deferred();
      if (route !== 'detection') f.reader._panelDetection = null;
      f.reader.getPageUrl = () => { reached.resolve(); return fresh.promise; };
      f.reader.findPanelAt = () => null;
      f.context.PanelGeometry.refineAdaptiveOnly = async () => f.hit;
      const second = f.tap();
      if (route !== 'detection') await reached.promise;
      f.gate.resolve(f.value()); await first; await reached.promise;
      assert.equal(f.attempts.length, 0, 'older completion cannot render while newer request waits');
      assert.equal(f.listeners(), 2, 'old cleanup cannot detach newer request listeners');
      fresh.resolve(f.img.src); await second;
      assert.equal(f.opens.length, 1); assert.equal(f.listeners(), 0);
    });
  }
  await check('detection: replacement request record retires earlier input', async () => {
    const f = fixture('detection'), pending = f.tap(); await f.ready.promise;
    f.reader._panelDetection = { ...f.reader._panelDetection };
    f.gate.resolve([]); await pending;
    assert.equal(f.attempts.length, 0); assert.equal(f.listeners(), 0);
  });
  await check('detection: unrelated replacement after loader commit is rejected', async () => {
    const f = fixture('detection');
    f.reader._panelDetection.promise.then(() => { f.reader.currentPanels = []; });
    const pending = f.tap(); await f.ready.promise;
    f.gate.resolve([]); await pending;
    assert.equal(f.attempts.length, 0); assert.equal(f.listeners(), 0);
  });
  await check('detection: expected new map admits its exact current canonical frame', async () => {
    const f = fixture('detection'), initial = f.reader.currentPanels;
    f.reader.findPanelAt = () => f.reader.currentPanels[0] || null;
    f.context.PanelGeometry.refine = async (url, seed) => ({ ...seed });
    const pending = f.tap(); await f.ready.promise;
    const published = [f.panel]; f.gate.resolve(published); await pending;
    assert.notEqual(f.reader.currentPanels, initial); assert.equal(f.reader.currentPanels, published);
    assert.equal(f.opens.length, 1); assert.equal(f.opens[0], f.panel); assert.equal(f.listeners(), 0);
    assert(!f.calls.includes('quick'), 'expected detected owner bypasses all ownerless searches');
  });
  const publicationChanges = [
    ['append', panels => panels.push({ ...panels[0] })],
    ['replace', panels => { panels[0] = { ...panels[0] }; }],
    ['reorder', panels => panels.reverse()],
    ['delete slot', panels => { delete panels[0]; }],
    ['remove', panels => panels.pop()],
    ['fill sparse slot with undefined', panels => { panels[1] = undefined; }],
  ];
  for (const canonical of [false, true]) {
    for (const [label, mutate] of publicationChanges) await check('detection publication: ' + (canonical ? 'canonical ' : 'ownerless ') + label + ' rejects before lookup', async () => {
      const f = fixture('detection');
      const published = [f.panel, , { ...f.panel, other: true }];
      let lookedUp = 0, observed = false;
      f.reader.findPanelAt = () => { lookedUp++; return canonical ? f.reader.currentPanels.find(Boolean) || null : null; };
      f.context.PanelGeometry.refine = async (url, seed) => ({ ...seed });
      f.reader._panelDetection.promise.then(panels => {
        assert.equal(f.reader.currentPanels, panels, 'actual loader publication precedes this mutation');
        observed = true; mutate(panels);
      });
      const pending = f.tap(); await f.ready.promise;
      f.gate.resolve(published); await pending;
      assert.equal(observed, true); assert.equal(lookedUp, 0);
      assert.equal(f.attempts.length, 0); assert.equal(f.listeners(), 0);
    });
    await check('detection publication: unchanged sparse ' + (canonical ? 'canonical' : 'ownerless') + ' map remains valid', async () => {
      const f = fixture('detection'), published = [f.panel, , { ...f.panel, other: true }];
      f.reader.findPanelAt = () => canonical ? f.reader.currentPanels.find(Boolean) || null : null;
      f.context.PanelGeometry.refine = async (url, seed) => ({ ...seed });
      const pending = f.tap(); await f.ready.promise;
      f.gate.resolve(published); await pending;
      assert.equal(f.opens.length, 1); assert.equal(f.opens[0], canonical ? f.panel : f.hit);
      assert.equal(Object.hasOwn(f.reader.currentPanels, 1), false); assert.equal(f.listeners(), 0);
    });
  }
  await check('same source reload: actual page loader retires pending search', async () => {
    const f = fixture('quick'), pending = f.tap(); await f.ready.promise;
    f.reader.preparePanelMaps = () => {};
    f.reader.getPageUrl = async () => f.img.src;
    await f.reader.loadPanelsForCurrentPage();
    f.gate.resolve(f.hit); await pending;
    assert.equal(f.attempts.length, 0); assert.equal(f.listeners(), 0);
    f.context.PanelGeometry.refineAdaptiveOnly = async () => f.hit;
    await f.tap(); assert.equal(f.opens.length, 1, 'fresh current tap works after reload');
  });
  await check('fresh tap accepts current owner map after earlier detection has completed', async () => {
    const f = fixture('detection'), pending = f.tap(); await f.ready.promise;
    f.gate.resolve([]); await pending; f.reader.resetZoom({ animate: false });
    f.reader.currentPanels = [f.panel];
    f.reader.findPanelAt = () => f.panel;
    f.context.PanelGeometry.refine = async (url, seed) => ({ ...seed });
    await f.tap(); assert.equal(f.opens.length, 2); assert.equal(f.opens[1], f.panel); assert.equal(f.listeners(), 0);
  });
  for (const route of ['quick', 'hybrid', 'local', 'rescue']) await check(route + ': stale miss stops all downstream work', async () => {
    const f = fixture(route), pending = f.tap(); await f.ready.promise;
    f.reader.resetZoom({ animate: false }); const before = f.calls.length;
    f.gate.resolve(null); await pending;
    assert.equal(f.attempts.length, 0); assert.equal(f.calls.length, before); assert.equal(f.listeners(), 0);
  });
  await check('older rejection cannot clean up a newer pending request', async () => {
    const f = fixture('quick'), first = f.tap(); await f.ready.promise;
    const fresh = deferred(), reached = deferred();
    f.reader.getPageUrl = () => { reached.resolve(); return fresh.promise; };
    f.context.PanelGeometry.refineAdaptiveOnly = async () => f.hit;
    const second = f.tap(); await reached.promise;
    f.gate.reject(Error('retired failure')); await first;
    assert.equal(f.listeners(), 2); assert.equal(f.attempts.length, 0);
    fresh.resolve(f.img.src); await second;
    assert.equal(f.opens.length, 1); assert.equal(f.listeners(), 0);
  });
  await check('unchanged off-map miss follows full fallback route and toggles chrome once', async () => {
    const f = fixture('rescue'), pending = f.tap(); await f.ready.promise;
    f.gate.resolve(null); await pending;
    assert.deepEqual(f.calls, ['url', 'quick', 'hybrid', 'local', 'rescue', 'toggle']);
    assert.equal(f.attempts.length, 0); assert.equal(f.listeners(), 0);
  });
  await check('ownerless guard never enumerates owner proof graphs', async () => {
    const f = fixture('quick'); let inspections = 0;
    f.reader.currentPanels = [new Proxy({}, { ownKeys() { inspections++; throw Error('proof graph scan forbidden'); } })];
    const pending = f.tap(); await f.ready.promise; f.gate.resolve(f.hit); await pending;
    assert.equal(f.opens.length, 1); assert.equal(inspections, 0); assert.equal(f.listeners(), 0);
  });
  await check('source event invalidation stays retired after identical restoration', async () => {
    const f = fixture('quick'), pending = f.tap(); await f.ready.promise;
    f.img.emit('error'); f.img.emit('load');
    f.gate.resolve(f.hit); await pending;
    assert.equal(f.attempts.length, 0); assert.equal(f.listeners(), 0);
    f.context.PanelGeometry.refineAdaptiveOnly = async () => f.hit;
    await f.tap(); assert.equal(f.opens.length, 1);
  });
  await check('out-of-order completion cannot replace newer open', async () => {
    const f = fixture('quick'), first = f.tap(); await f.ready.promise;
    f.context.PanelGeometry.refineAdaptiveOnly = async () => ({ ...f.hit, newer: true });
    await f.tap(); assert.equal(f.opens.length, 1); assert.equal(f.opens[0].newer, true);
    f.gate.resolve({ ...f.hit, obsolete: true }); await first;
    assert.equal(f.attempts.length, 1); assert.equal(f.listeners(), 0);
  });
  await check('strict map hit remains synchronous and skips URL/detection', async () => {
    const f = fixture('quick'); f.context.PanelMap.findAt = () => f.hit;
    await f.tap(); assert.equal(f.opens[0], f.hit); assert.deepEqual(f.calls, []); assert.equal(f.listeners(), 0);
  });
  assert.equal(results.length, 385, 'all deferred cases retained');
  console.log(JSON.stringify({ passed: true, sourcePath, sourceSha256, loadedSources: installed.bindings(), casesPassed: results.length,
    routes, mutationCasesPerRoute: mutations.length, explicitPromiseSettlement: true,
    nativeBrowserRun: false, simulatedRealReaderInputHandlers: witness, cases: results }, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => clearTimeout(watchdog));
