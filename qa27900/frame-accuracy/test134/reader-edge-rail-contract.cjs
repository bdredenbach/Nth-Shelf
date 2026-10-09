'use strict';

// Public synthetic actual-Reader contract. No original artwork, private source
// proof, checkpoint, stored crop, page identity or review coordinates are read.
// Defaults support qa27900/frame-accuracy/test134 in an integrated checkout.
// For a private candidate, set NTH_SHELF_SOURCE and NTH_RAIL_CANDIDATE explicitly.

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const fixtures = require(path.resolve(process.env.NTH_RAIL_FIXTURES ||
  path.join(__dirname, 'edge-rail-fixtures.cjs')));

function loadCanvas() {
  try { return require('@napi-rs/canvas'); }
  catch (error) {
    if (error.code !== 'MODULE_NOT_FOUND' || !process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES) throw error;
    return require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, '@napi-rs/canvas'));
  }
}
const cv = loadCanvas();
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const serialized = value => JSON.stringify(value);

function element(tag = 'div') {
  const e = tag === 'canvas' ? cv.createCanvas(1, 1) : {};
  const names = new Set();
  Object.assign(e, {
    children: [], dataset: {}, attributes: {}, parentNode: null,
    style: { setProperty(key, value) { this[key] = value; } },
    classList: {
      add(...values) { values.forEach(value => names.add(value)); },
      remove(...values) { values.forEach(value => names.delete(value)); },
      contains(value) { return names.has(value); },
      toggle(value, enabled) {
        const on = enabled === undefined ? !names.has(value) : Boolean(enabled);
        if (on) names.add(value); else names.delete(value);
        return on;
      }
    },
    setAttribute(key, value) { this.attributes[key] = String(value); },
    appendChild(child) {
      if (child.parentNode) child.remove();
      this.children.push(child); child.parentNode = this; return child;
    },
    remove() {
      if (this.parentNode) this.parentNode.children = this.parentNode.children.filter(child => child !== this);
      this.parentNode = null;
    },
    animate(frames, options) {
      const animation = {
        frames, options, cancelled: false,
        cancel() { this.cancelled = true; this.oncancel?.(); },
        finish() { this.onfinish?.(); }
      };
      this.animations ||= []; this.animations.push(animation);
      return animation;
    },
    getBoundingClientRect() { return this.rect || { left:0, top:0, right:560, bottom:860, width:560, height:860 }; }
  });
  return e;
}

function resolveSource(options = {}) {
  const root = path.resolve(options.sourceRoot || process.env.NTH_SHELF_SOURCE || path.join(__dirname, '../../..'));
  const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const scripts = [...index.matchAll(/src="(js\/panels[^\"]*\.js)"/g)].map(match => path.resolve(root, match[1]));
  assert(scripts.length > 0, 'The selected source must provide real panel modules.');
  const requested = path.resolve(options.candidatePath || process.env.NTH_RAIL_CANDIDATE ||
    path.join(root, 'js/panels-page-edge-rail-cell.js'));
  const indexed = scripts.find(file => path.basename(file) === 'panels-page-edge-rail-cell.js');
  if (indexed && requested !== indexed) {
    assert.equal(hash(fs.readFileSync(requested)), hash(fs.readFileSync(indexed)),
      'An explicit candidate must match the already-indexed module; do not silently test another implementation.');
  }
  const candidate = indexed || requested;
  const paths = scripts.slice();
  if (!indexed && !paths.includes(candidate)) paths.push(candidate);
  assert.equal(paths.filter(file => path.basename(file) === 'panels-page-edge-rail-cell.js').length, 1,
    'Load the page-edge module exactly once, before Reader.');
  return {
    root, candidate, paths,
    moduleCode: paths.map(file => fs.readFileSync(file, 'utf8')).join('\n'),
    readerCode: fs.readFileSync(path.join(root, 'js/reader.js'), 'utf8'),
    candidateSha256: hash(fs.readFileSync(candidate))
  };
}

function setup(source) {
  const raf = [];
  const sandbox = vm.createContext({
    console, setTimeout, clearTimeout, window: {},
    Image: cv.Image, ImageData: cv.ImageData,
    localStorage: { getItem: () => null, setItem() {} },
    document: { createElement: element },
    requestAnimationFrame(fn) { raf.push(fn); return raf.length; }
  });
  vm.runInContext(source.moduleCode + '\n' + source.readerCode +
    '\nPanelPageEdgeRailCell.installReader(Reader);', sandbox);
  const api = vm.runInContext('({ Reader, PanelMatteCells, PanelHighContrastEnclosures, PanelPageEdgeRailCell })', sandbox);
  return { ...api, flushFrames() {
    let count = 0;
    while (raf.length) { assert(++count < 20, 'Animation work must stay bounded.'); raf.shift()(); }
  } };
}

function sourceImage(fixture) {
  const img = new cv.Image();
  img.src = fixture.canvas.toBuffer('image/png');
  return img;
}

function ownershipMask(detector, panel, w, h) {
  const witnesses = panel._structuralGridProof.witnesses;
  assert.equal(witnesses.length, 2);
  const [first, second] = witnesses.map(witness => detector.decode(witness.mask, w * h));
  assert(first && second);
  return first.map((value, i) => +(value || second[i]));
}

function configureReader(api, img, panels, fixture) {
  const reader = api.Reader;
  const stage = element(), viewport = element();
  const stageRect = { left:0, top:0, right:560, bottom:860, width:560, height:860 };
  const fit = Math.min(500 / fixture.w, 800 / fixture.h);
  const width = fixture.w * fit, height = fixture.h * fit;
  const imgRect = {
    left: (560-width)/2, top: (860-height)/2,
    right: (560+width)/2, bottom: (860+height)/2, width, height
  };
  stage.rect = stageRect;
  reader.mode = 'single'; reader.index = 0; reader.panelZoomEnabled = true;
  reader.currentPanels = panels; reader.els = { stage, viewport };
  reader.getPanelImageContext = () => ({ img, rect: imgRect });
  return { reader, stage, viewport, stageRect, imgRect };
}

function checkTaps(state, panel, mask, fixture) {
  const { reader } = state, { w, h, expectedMasks } = fixture;
  const [left, , right] = panel._structuralGridProof.witnesses[0].skel.railBox;
  let owned = 0, outside = 0, crossingSfx = 0, crossingBalloon = 0, secondary = 0;
  let firstOwned = null, unownedInsideBox = 0;
  for (let i = 0; i < mask.length; i++) {
    const x = i % w, y = Math.floor(i / w), X = (x+.5)/w, Y = (y+.5)/h;
    const withinBox = X >= panel.x && X <= panel.x+panel.w && Y >= panel.y && Y <= panel.y+panel.h;
    if (mask[i]) {
      assert.equal(reader.findPanelAt(X, Y), panel, 'Every retained analysis pixel must select only its complete owner.');
      owned++; firstOwned ||= [X,Y];
      if ((x < left || x > right) && expectedMasks.sfx[i]) crossingSfx++;
      if ((x < left || x > right) && expectedMasks.balloon[i]) crossingBalloon++;
    } else if (withinBox || i % 97 === 0 || (expectedMasks.secondaryArtwork[i] && i % 43 === 0)) {
      assert.equal(reader.findPanelAt(X, Y), null, 'Unowned pixels must not select the old broad parent or the new cell.');
      outside++; unownedInsideBox += withinBox;
    }
    secondary += +(mask[i] && expectedMasks.secondaryArtwork[i]);
  }
  assert(owned > 10000 && outside > 1000 && unownedInsideBox > 0);
  assert(crossingSfx > 0 && crossingBalloon > 0, 'The fixture must test real annotation pixels beyond the rail.');
  assert.equal(secondary, 0, 'Secondary-scene artwork has no tap ownership.');
  reader.panelZoomEnabled = false;
  assert.equal(reader.findPanelAt(...firstOwned), null, 'Zoom-disabled taps must remain disabled.');
  reader.panelZoomEnabled = true;
  return { ownedPixelTaps: owned, outsideSamples: outside, crossingSfxTaps: crossingSfx,
    crossingBalloonTaps: crossingBalloon, unownedInsideBoxSamples: unownedInsideBox, secondaryArtworkPixelsOwned: secondary };
}

function checkCanvas(canvas, panel, mask, fixture, img) {
  const { w, h, rgba, expectedMasks } = fixture;
  const [x0, y0, x1, y1] = panel._structuralGridProof.box;
  assert.deepEqual([canvas.width, canvas.height], [x1-x0, y1-y0], 'Reader must use the exact contour extent at this source resolution.');
  const output = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
  // A separate, unclipped source draw is the color oracle. It includes the
  // canvas implementation's normal image decoding and high-quality sampling,
  // without invoking Reader or using its crop canvas as a reference.
  const reference = cv.createCanvas(canvas.width,canvas.height), referenceContext = reference.getContext('2d');
  referenceContext.imageSmoothingEnabled = true; referenceContext.imageSmoothingQuality = 'high';
  referenceContext.drawImage(img,panel.x*w,panel.y*h,panel.w*w,panel.h*h,0,0,canvas.width,canvas.height);
  const expectedRgba = referenceContext.getImageData(0,0,canvas.width,canvas.height).data;
  let rawSourceMaxRgbDelta = 0;
  let opaque = 0, transparent = 0, maxRgbError = 0, sfx = 0, balloon = 0, crossingSfx = 0;
  const [left, , right] = panel._structuralGridProof.witnesses[0].skel.railBox;
  for (let y = 0; y < canvas.height; y++) for (let x = 0; x < canvas.width; x++) {
    const source = (y+y0)*w+x+x0, target = y*canvas.width+x, alpha = output[target*4+3];
    assert.equal(alpha >= 128, Boolean(mask[source]), 'The actual Reader canvas and source ownership mask must agree pixel-for-pixel.');
    if (mask[source]) {
      assert(alpha >= 254, 'An owned source pixel must not be made translucent by a second crop heuristic.');
      opaque++;
      for (let c = 0; c < 3; c++) { maxRgbError = Math.max(maxRgbError, Math.abs(output[target*4+c]-expectedRgba[target*4+c])); rawSourceMaxRgbDelta = Math.max(rawSourceMaxRgbDelta,Math.abs(expectedRgba[target*4+c]-rgba[source*4+c])); }
    } else { assert(alpha <= 1); transparent++; }
    if (expectedMasks.sfx[source]) {
      assert(mask[source] && alpha >= 254, 'The entire SFX, including its crossing ink outline, must appear in the actual canvas.');
      sfx++;
      if (x+x0 < left || x+x0 > right) crossingSfx++;
    }
    if (expectedMasks.balloon[source]) {
      assert(mask[source] && alpha >= 254, 'The whole balloon must appear in the actual canvas.');
      balloon++;
    }
  }
  assert(maxRgbError <= 1, `Source colors must remain intact; maximum channel difference was ${maxRgbError}.`);
  assert(sfx > 0 && balloon > 0 && crossingSfx > 0 && transparent > 0);
  return { width:canvas.width, height:canvas.height, ownedCanvasPixels:opaque, transparentCanvasPixels:transparent,
    wholeSfxPixels:sfx, wholeBalloonPixels:balloon, crossingSfxCanvasPixels:crossingSfx, maxRgbError, rawSourceMaxRgbDelta,
    rgbaSha256:hash(Buffer.from(output)), pngSha256:hash(canvas.toBuffer('image/png')) };
}

async function zoomAndVerify(api, state, panel, mask, fixture) {
  const { reader, stage, viewport, stageRect, imgRect } = state;
  await reader.zoomToPanel(panel, stageRect, imgRect);
  assert.equal(reader.focusMode, 'panel'); assert.equal(reader.panelOverlayActive, true);
  const overlay = reader.els.panelOverlay;
  assert(overlay && overlay.parentNode === stage);
  assert.equal(overlay.dataset.geometry, 'contours');
  assert(reader.els.focusDim?.classList.contains('active'), 'The actual Reader dim layer must be active.');
  assert.equal(reader.els.focusDim.parentNode, stage);
  assert(viewport.classList.contains('panel-focus-page-dimmed'));
  assert.equal(serialized(reader.panelFocusMeta.cropContours), serialized(panel._contours));
  assert.equal(serialized(reader.displayPanelContours(panel)), serialized(panel._contours));
  assert.equal(reader.panelFocusMeta.panel._structuralGridProof, panel._structuralGridProof);
  assert.equal(overlay.children.length, 1);
  const canvas = overlay.children[0], result = checkCanvas(canvas, panel, mask, fixture, reader.getPanelImageContext().img);
  assert.equal(overlay.style.transform, 'translate3d(0,0,0) scale(1)');
  api.flushFrames();
  assert(overlay._panelZoomInAnimation, 'Reader must schedule the real zoom animation.');
  overlay._panelZoomInAnimation.finish();
  assert.equal(overlay._panelZoomInAnimation, null);
  const scale = Number.parseFloat(overlay.style['--panel-scale']);
  assert(Number.isFinite(scale) && scale > 1);
  assert.equal(overlay.style.transform,
    `translate3d(${Number.parseFloat(overlay.style['--panel-dx'])}px, ${Number.parseFloat(overlay.style['--panel-dy'])}px, 0) scale(${scale})`);
  const childCount = stage.children.length;
  await reader.zoomToPanel(panel, stageRect, imgRect);
  assert.equal(reader.els.panelOverlay, overlay, 'Repeated focus while already open must not duplicate the overlay.');
  assert.equal(stage.children.length, childCount);
  reader.resetZoom({ animate:false });
  assert.equal(reader.focusMode, null); assert.equal(reader.panelOverlayActive, false);
  assert.equal(reader.els.panelOverlay, null); assert.equal(reader.panelFocusMeta, null);
  assert.equal(overlay.parentNode, null);
  assert.equal(reader.els.focusDim.classList.contains('active'), false);
  assert.equal(viewport.style.transform, 'translate(0px, 0px) scale(1)');
  return result;
}

async function run(options = {}) {
  const source = resolveSource(options), api = setup(source);
  const fixture = fixtures.makeProductionFixture();
  const { rgba, w, h } = fixture;
  const inputHash = hash(Buffer.from(rgba));
  const scale = 900/Math.max(w,h), pw = Math.round(w*scale), ph = Math.round(h*scale);
  const smaller = api.PanelMatteCells.sampleBilinearRGBA(rgba,w,h,pw,ph);
  const parents = api.PanelHighContrastEnclosures.analyzeRGBA(smaller,pw,ph,[]);
  assert.equal(parents.length, 1, 'The synthetic source must produce a genuine broad source parent.');
  assert.equal(parents[0]._structuralGridProof.mode, 'empty-enclosure');
  const parentSnapshot = serialized(parents);
  const detector = api.PanelPageEdgeRailCell;
  assert(detector.eligible(parents));
  const panels = detector.analyzeRGBA(rgba,w,h,parents);
  assert.equal(panels.length, 1); assert(detector.validPanel(panels[0]));
  assert.equal(panels[0]._structuralGridProof.version, 79);
  const snapshot = serialized(panels), mask = ownershipMask(detector,panels[0],w,h);
  const img = sourceImage(fixture);
  await img.decode();
  assert.deepEqual([img.naturalWidth,img.naturalHeight],[w,h]);
  const first = configureReader(api,img,panels,fixture);
  const taps = checkTaps(first,panels[0],mask,fixture);
  const initialCanvas = await zoomAndVerify(api,first,panels[0],mask,fixture);

  // A pending animation callback must not resurrect a dismissed panel.
  await first.reader.zoomToPanel(panels[0],first.stageRect,first.imgRect);
  const dismissed = first.reader.els.panelOverlay;
  first.reader.resetZoom({animate:false}); api.flushFrames();
  assert.equal(dismissed.parentNode,null); assert.equal(dismissed.animations?.length || 0,0);
  assert.equal(first.reader.panelOverlayActive,false);
  assert.equal(first.reader.els.focusDim.classList.contains('active'),false);
  const repeatedCanvas = await zoomAndVerify(api,first,panels[0],mask,fixture);
  assert.deepEqual(repeatedCanvas,initialCanvas,'Close/reopen must retain identical source pixels and ownership.');
  assert.equal(first.reader.currentPanels,panels);
  assert.equal(serialized(panels),snapshot,'Reader must not modify discovery geometry or proof data.');

  // Use a fresh source context to ensure neither the descriptor nor Reader
  // relies on the first instance's WeakMaps or mutable display state.
  const fresh = setup(source), rehydrated = JSON.parse(snapshot);
  assert(fresh.PanelPageEdgeRailCell.validPanel(rehydrated[0]));
  const restoredMask = ownershipMask(fresh.PanelPageEdgeRailCell,rehydrated[0],w,h);
  assert.deepEqual(Buffer.from(restoredMask),Buffer.from(mask));
  const restored = configureReader(fresh,img,rehydrated,fixture);
  assert.deepEqual(checkTaps(restored,rehydrated[0],restoredMask,fixture),taps);
  const restoredCanvas = await zoomAndVerify(fresh,restored,rehydrated[0],restoredMask,fixture);
  assert.deepEqual(restoredCanvas,initialCanvas,'JSON-rehydrated ownership must produce the exact same actual Reader canvas.');
  assert.equal(serialized(rehydrated),snapshot);
  assert.equal(serialized(parents),parentSnapshot);
  assert.equal(hash(Buffer.from(rgba)),inputHash,'Input artwork is read-only.');
  return {passed:true,syntheticOnly:true,actualReaderZoomToPanel:true,candidateSha256:source.candidateSha256,
    genuineParent:true,proofVersion:79,sourceSize:[w,h],taps,canvas:initialCanvas,
    dimLayerActive:true,zoomAnimationFinished:true,duplicateFocusSuppressed:true,dismissBeforeAnimationSafe:true,
    closeReopenByteIdentical:true,serializedFreshContextByteIdentical:true,displayAndTapOwnershipIdentical:true,
    discoveryAndSourceUnmodified:true,noBroadEnvelopeOwner:true,browserOrPhoneTest:false};
}

module.exports = { run };
if (require.main === module) {
  const alive = setInterval(() => {},1000);
  run().then(result => console.log(JSON.stringify(result,null,2))).catch(error => {
    console.error(error.stack || error); process.exitCode = 1;
  }).finally(() => clearInterval(alive));
}
