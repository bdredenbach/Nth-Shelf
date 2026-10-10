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
  const findings = [];
  for (const [name, mutate] of [
    ['append', panels => panels.push({ ...panels[0], appended: true })],
    ['replace', panels => { panels[0] = { ...panels[0], replaced: true }; }],
    ['reorder', panels => panels.reverse()],
    ['delete', panels => { delete panels[0]; }],
  ]) {
    const f = fixture('detection');
    const original = [f.panel, { ...f.panel, second: true }];
    f.reader.findPanelAt = () => f.reader.currentPanels.find(Boolean) || null;
    f.context.PanelGeometry.refine = async (url, seed) => ({ ...seed });
    let mutationObservedAfterPublication = false;
    f.reader._panelDetection.promise.then(panels => {
      assert.equal(f.reader.currentPanels, panels, 'real loader has already published');
      mutationObservedAfterPublication = true;
      mutate(panels);
    });
    const pending = f.tap(); await f.ready.promise;
    f.gate.resolve(original); await pending;
    assert.equal(mutationObservedAfterPublication, true);
    assert.equal(f.opens.length, 0, 'changed published owner map must reject');
    assert.equal(f.attempts.length, 0, 'no late zoom attempt');
    assert.equal(f.listeners(), 0);
    findings.push({name, mutationObservedAfterPublication, zoomAttempts:f.attempts.length, opens:f.opens.length});
  }
  const cleanup = [];
  for (const route of ['quick', 'canonical']) {
    const f = fixture(route), pending = f.tap(); await f.ready.promise;
    const beforeClose = f.listeners();
    f.reader.resetZoom({animate: false});
    const afterCloseBeforeSettlement = f.listeners();
    f.gate.resolve(f.value()); await pending;
    const afterSettlement = f.listeners();
    assert.equal(f.attempts.length, 0);
    assert.equal(afterSettlement, 0);
    cleanup.push({route, beforeClose, afterCloseBeforeSettlement, afterSettlement});
  }
  assert.equal(findings.length, 4); assert.equal(cleanup.length, 2);
  console.log(JSON.stringify({sourcePath, sourceSha256, loadedSources: installed.bindings(), casesPassed: findings.length, cleanupCases: cleanup.length, findings, cleanup, passed:true, note:'Acceptance rerun of the unchanged review scenario with zero-open/zero-attempt assertions. Every started request was explicitly settled.'}, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => clearTimeout(watchdog));
