'use strict';

// Geometry-stage regression, independent of comic artwork and native canvas.
// The four-rail detector is represented by already-proven fixtures here; this
// verifies that routing, persistence and rendering do not distort its answer.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const created = [];
const document = {
  createElement(kind) {
    const node = {
      kind, style: { setProperty(name, value) { this[name] = value; } }, dataset: {},
      setAttribute() {}, appendChild(child) { child.parentNode = this; },
      getContext() { return { drawImage(...args) { node.drawArguments = args; } }; }
    };
    created.push(node);
    return node;
  }
};
const context = vm.createContext({
  console, document, localStorage: { getItem() { return null; } },
  requestAnimationFrame() {}, clamp01: value => Math.max(0, Math.min(1, value)),
  clamp: (value, low, high) => Math.max(low, Math.min(high, value))
});
for (const file of ['panels-geometry-orthogonal.js', 'panels-geometry-skewed.js',
  'panels-geometry.js', 'panel-map-core.js', 'reader.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', file), 'utf8'), context, { filename: file });
}
const { ortho, skew, router, map, reader } = vm.runInContext(
  '({ortho:PanelGeometryOrthogonal,skew:PanelGeometrySkewed,router:PanelGeometry,map:PanelMapCore,reader:Reader})', context);
const plain = value => JSON.parse(JSON.stringify(value));
const near = (actual, expected, message) => assert.ok(Math.abs(actual - expected) < 1e-8,
  `${message}: expected ${expected}, got ${actual}`);

function proof(width, height, degrees, edge = 'top') {
  const tangent = Math.tan(degrees * Math.PI / 180);
  const q = [{ x: .15, y: .2 }, { x: .75, y: .2 }, { x: .75, y: .8 }, { x: .15, y: .8 }];
  if (edge === 'top') q[1].y += .6 * (width - 1) / (height - 1) * tangent;
  else q[2].x += .6 * (height - 1) / (width - 1) * tangent;
  return {
    x: .15, y: .2, w: Math.max(...q.map(p => p.x)) - .15, h: .6, _quad: q,
    _frameEnvelope: {
      chainConnected: true, analysisWidth: width, analysisHeight: height,
      adjSides: [1, 1, 1, 1], thicknessSides: [1, 1, 1, 1],
      seedConsensus: 3, relativeAdjScore: 1, adjacencyScore: 1,
      minThickness: 1, confidence: 1
    }
  };
}

async function renderedQuad(frame) {
  const rect = { left: 0, top: 0, width: 600, height: 900, right: 600, bottom: 900 };
  const img = { naturalWidth: 600, naturalHeight: 900 };
  reader.focusMode = null;
  reader.getPanelImageContext = () => ({ img, rect });
  reader.setFocusDim = () => {};
  reader.els = { stage: { appendChild(node) { node.parentNode = this; } },
    viewport: { classList: { add() {} } } };
  await reader.zoomToPanel(frame, rect, rect);
  const overlay = reader.els.panelOverlay;
  assert.equal(overlay.dataset.geometry, 'quad', 'renderer must use the proven crop polygon');
  const values = overlay.style.clipPath.match(/-?[\d.]+/g).map(Number);
  const left = parseFloat(overlay.style.left) / rect.width;
  const top = parseFloat(overlay.style.top) / rect.height;
  const width = parseFloat(overlay.style.width) / rect.width;
  const height = parseFloat(overlay.style.height) / rect.height;
  return Array.from({ length: 4 }, (_, i) => ({
    x: left + values[i * 2] / 100 * width,
    y: top + values[i * 2 + 1] / 100 * height
  }));
}

(async () => {
  let physicalCases = 0;
  for (const [width, height] of [[600, 900], [900, 600], [900, 900]]) {
    for (const edge of ['top', 'right']) {
      for (const degrees of [2, 6, 12]) {
        const panel = proof(width, height, degrees, edge);
        const ownership = skew.classifyQuad(panel);
        near(ownership.maxAxisDeparture, degrees, `${width}x${height} ${edge} physical rail angle`);
        assert.equal(ownership.angleSpace, 'analysis-pixels');
        assert.equal(ownership.owns, degrees >= 4.5, 'existing angle threshold is unchanged');
        const shaped = router._shapeAdaptiveEnvelope(panel);
        assert.deepEqual(plain(shaped._quad), panel._quad, 'classification must preserve every proven vertex');
        const persisted = map.serializeFrame(shaped);
        assert.deepEqual(plain(persisted._quad), panel._quad, 'persistence must preserve every proven vertex');
        assert.equal(persisted._frameEnvelope.analysisWidth, width);
        assert.equal(persisted._frameEnvelope.analysisHeight, height);
        physicalCases++;
      }
    }
  }

  // A shallow real rail remains below the skew ownership threshold; its exact
  // crop must survive through both the live route and persisted panel lookup.
  const shallow = proof(600, 900, 2);
  const shaped = router._shapeAdaptiveEnvelope(shallow);
  assert.equal(shaped._geometryOwner, 'orthogonal-frame');
  const persisted = map.serializeFrame(shaped);
  const aboveRail = { x: .65, y: .202 };
  assert.equal(map.findAt([persisted], aboveRail.x, aboveRail.y), null,
    'bounding-box corner outside the proven rail cannot steal another tap');
  assert.ok(map.findAt([persisted], .4, .5), 'the interior tap must still select its frame');
  for (const frame of [shaped, persisted]) {
    const rendered = await renderedQuad(frame);
    rendered.forEach((p, i) => {
      assert.ok(Math.hypot(p.x - shallow._quad[i].x, p.y - shallow._quad[i].y) < .00001,
        'canvas crop plus CSS clip must recover the proven page coordinates');
    });
  }

  const unproven = proof(600, 900, 6);
  delete unproven._frameEnvelope;
  assert.equal(ortho.refine(unproven)._quad, undefined, 'unproven legacy quads gain no new authority');
  for (const invalid of [
    [{ x: .1, y: .1 }, { x: .8, y: .8 }, { x: .8, y: .1 }, { x: .1, y: .8 }],
    [{ x: .1, y: .1 }, { x: .3, y: .3 }, { x: .5, y: .5 }, { x: .7, y: .7 }],
    [{ x: NaN, y: .1 }, { x: .8, y: .1 }, { x: .8, y: .8 }, { x: .1, y: .8 }]
  ]) {
    assert.equal(ortho.refine({ ...proof(600, 900, 6), _quad: invalid })._quad, undefined,
      'malformed or non-convex quads cannot reach orthogonal rendering');
  }
  assert.equal(router._shapeAdaptiveEnvelope({ ...proof(600, 900, 6),
    _frameEnvelope: { chainConnected: false } }), null, 'unconnected evidence is still rejected');

  const layout = { ...shallow, _identitySource: 'page-layout',
    _pageLayoutProof: { kind: 'stacked-strips', closed: true, analysisWidth: 600, analysisHeight: 900 } };
  delete layout._frameEnvelope;
  const heldLayout = await router.refine(null, layout);
  assert.deepEqual(plain(heldLayout._quad), layout._quad,
    'independently validated stacked borders survive the geometry router');
  const closed = { ...shallow, _identitySource: 'closed-frame',
    _closedFrameProof: { version: 1, connected: true, analysisWidth: 600, analysisHeight: 900 } };
  delete closed._frameEnvelope;
  const heldClosed = await router.refine(null, closed);
  assert.deepEqual(plain(heldClosed._quad), closed._quad,
    'independently fitted closed borders survive routing without a second seed search');
  const closedCrop = await renderedQuad(heldClosed);
  closedCrop.forEach((p, i) => assert.ok(Math.hypot(p.x - closed._quad[i].x, p.y - closed._quad[i].y) < .00001,
    'closed frame rendering preserves each fitted border corner'));
  assert.equal(ortho.refine({ ...closed, _closedFrameProof: { version: 1, connected: false } })._quad, undefined,
    'incomplete closed borders cannot gain polygon authority');
  for (const angle of [2, 6]) {
    const partition = { ...proof(600, 900, angle), _identitySource: 'page-partition',
      _partitionProof: { version: 1, connected: true, analysisWidth: 600, analysisHeight: 900 } };
    delete partition._frameEnvelope;
    const held = await router.refine(null, partition);
    assert.deepEqual(plain(held._quad), partition._quad, 'a partition keeps all measured corners');
    assert.equal(held._geometryOwner, angle === 6 ? 'skewed-frame' : 'orthogonal-frame',
      'partition ownership follows physical angles after the frame is established');
    assert.equal(held._frameOwnership.angleSpace, 'analysis-pixels');
    const rendered = await renderedQuad(held);
    rendered.forEach((p, i) => assert.ok(Math.hypot(p.x - partition._quad[i].x, p.y - partition._quad[i].y) < .00001,
      'partition crop retains its exact fitted polygon'));
  }
  reader.panelZoomEnabled = true;
  reader.currentPanels = [heldLayout];
  assert.equal(reader.findPanelAt(aboveRail.x, aboveRail.y), null,
    'live page lookup must test the sloped polygon, not just its bounding box');
  assert.equal(reader.findPanelAt(.4, .5), heldLayout);

  // A tap arriving before the page detector finishes must wait for that page's
  // identities. Leaving the page while waiting must not open a stale crop.
  const rect = { left: 0, top: 0, width: 600, height: 900 };
  reader.mode = 'single'; reader.scale = 1; reader.index = 15;
  reader.comic = { id: 'qa-comic' }; reader._panelLoadToken = 1;
  reader.getPanelImageContext = () => ({ img: {}, rect });
  reader.els.stage.getBoundingClientRect = () => rect;
  reader.getPageUrl = async () => 'qa-page';
  const crops = [];
  reader.zoomToPanel = frame => crops.push(frame);
  reader.currentPanels = [];
  let finish;
  reader._panelDetection = { comicId: 'qa-comic', pageIndex: 15, token: 1,
    promise: new Promise(resolve => { finish = resolve; }) };
  const waiting = reader.handleSingleTap({ x: 240, y: 450 });
  await Promise.resolve();
  assert.equal(crops.length, 0, 'no legacy crop while page identity is pending');
  reader.currentPanels = [layout]; finish(); await waiting;
  assert.equal(crops.length, 1, 'ready page uses its independent frame');
  assert.deepEqual(plain(crops[0]._quad), layout._quad);
  reader._panelDetection.promise = new Promise(resolve => { finish = resolve; });
  const stale = reader.handleSingleTap({ x: 240, y: 450 });
  reader.index = 16; finish(); await stale;
  assert.equal(crops.length, 1, 'a pending tap cannot focus a different page');
  console.log(`Frame geometry contract passed: ${physicalCases} physical-angle/crop cases, live and persisted rendering, tap containment and invalid-proof controls.`);
})().catch(error => { console.error(error); process.exitCode = 1; });
