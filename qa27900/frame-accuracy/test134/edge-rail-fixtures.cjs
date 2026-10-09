'use strict';

// Synthetic-only, independently specified fixtures for a page-edge rail-cell
// proposal. No image, coordinate, filename, or pixel is taken from a comic.
//
// Run: node research-cyan/edge-rail-fixtures.cjs
// Import: const { makeFixture, makeFixtures } = require('./edge-rail-fixtures.cjs');
// Each fixture exposes { rgba, w, h, caseName, bounds, expectedMasks, expected }.
// Masks are Uint8Array(w * h), with 1 for included pixels and 0 otherwise.
// Bounds are pixel coordinates with exclusive right/bottom, plus normalized
// equivalents. Ground truth comes from construction, never the detector.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function loadCanvas() {
  try {
    return require('@napi-rs/canvas');
  } catch (error) {
    if (error.code !== 'MODULE_NOT_FOUND' || !process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES) throw error;
    return require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, '@napi-rs/canvas'));
  }
}

const { createCanvas } = loadCanvas();
const DESIGN = Object.freeze({ w: 640, h: 900, ink: '#17191c', railWidth: 3.25 });
const CASES = Object.freeze([
  { caseName: 'positive-cyan' },
  { caseName: 'positive-shifted', dx: 48 },
  { caseName: 'positive-mirrored', mirror: true },
  { caseName: 'positive-violet', matte: '#a14bdd' },
  { caseName: 'positive-rescaled-small', scale: 4 / 3 },
  { caseName: 'positive-rescaled-large', scale: 2 },
  { caseName: 'positive-combined', mirror: true, dx: -27, scale: 1.7, matte: '#48b86c' },
  { caseName: 'negative-missing-rail', negative: 'missing-rail' },
  { caseName: 'negative-missing-closing-edge', negative: 'missing-closing-edge' },
  { caseName: 'negative-stacked-subframes', negative: 'stacked-subframes' },
  { caseName: 'negative-long-open-boundary', negative: 'long-open-boundary' },
  { caseName: 'negative-ambiguous-annotation', negative: 'ambiguous-annotation' },
  { caseName: 'negative-split-balloon', negative: 'split-balloon', balloonDx: 0 },
  { caseName: 'negative-split-sfx', negative: 'split-sfx', sfxDx: -15 },
  { caseName: 'negative-unsupported-tilted-rails', negative: 'unsupported-tilted-rails', driftScale: 1 },
  { caseName: 'negative-unsupported-wide-cell', negative: 'unsupported-wide-cell', shapeScaleX: 1 },
]);

// This is the regression proposal, kept beside the fixture rather than changing
// the runtime or making unproved assertions about an implementation.
const REGRESSION_PROPOSAL = Object.freeze({
  positives: [
    'Recover one page-edge rail cell despite identical interior and exterior matte colors.',
    'Recover both thin near-vertical rails and the rounded far-side closure from ink evidence.',
    'Retain the outlined colored figures, overlapping pale speech balloon, text, and connected pale-yellow SFX.',
    'Do not make a flood-fill seam or internal cyan exclusion through the owner.',
    'Translation, reflection, hue, and scale must not change the semantic ownership decision.',
  ],
  negatives: [
    'A missing side or missing far-side closure must not be inferred from artwork, a page rectangle, or color.',
    'Long open boundaries reaching the opposite page edge do not prove a bounded cell.',
    'Complete stacked subframes must not be merged into the enclosing rail pair.',
    'An annotation crossing two adjacent proven owners must not be assigned by color or proximity alone.',
    'This narrow-cell candidate may explicitly abstain on a valid but unsupported broad cell.',
    'The conservative first rule may abstain on tilted rails and on bright components with less than 70% interior ownership.',
  ],
  suggestedAssertions: {
    normalizedOwnerBoundsMaxError: 0.015,
    minimumOwnedMaskIoU: 0.97,
    minimumBalloonAndSfxRecall: 0.98,
    maximumExteriorLeakFraction: 0.002,
    exactRepeatability: true,
    preserveExistingIndependentIdentities: true,
  },
  integration: [
    'Run these construction labels against the standalone candidate before enabling runtime integration.',
    'Compare candidate masks, not merely bounding boxes; the annotations intentionally protrude beyond the rails.',
    'For stacked/ambiguous negatives, reject the forbidden union while preserving any separately proved frames.',
    'Keep existing closed-frame, exterior-gutter, open-region, and reader ownership suites unchanged and passing.',
    'Run real-image checks separately; synthetic success is necessary evidence, not proof of source accuracy.',
  ],
});

function transform(ctx, options) {
  ctx.scale(options.scale, options.scale);
  ctx.translate(options.dx, 0);
  if (options.mirror) {
    ctx.translate(DESIGN.w, 0);
    ctx.scale(-1, 1);
  }
  ctx.translate(DESIGN.w / 2, 0);
  ctx.scale(options.shapeScaleX, 1);
  ctx.translate(-DESIGN.w / 2, 0);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
}

function framePath(ctx, options) {
  const left = 145 + 18 * options.driftScale;
  const right = 483 - 14 * options.driftScale;
  ctx.beginPath();
  ctx.moveTo(145, -12);
  ctx.lineTo(left, 504);
  ctx.quadraticCurveTo(left + 1, 530, left + 27, 534);
  ctx.lineTo(right - 27, 534);
  ctx.quadraticCurveTo(right - 1, 533, right, 507);
  ctx.lineTo(483, -12);
  ctx.closePath();
}

function drawRails(ctx, options, color) {
  const left = 145 + 18 * options.driftScale;
  const right = 483 - 14 * options.driftScale;
  ctx.strokeStyle = color;
  ctx.lineWidth = DESIGN.railWidth;
  ctx.beginPath();
  if (options.negative === 'long-open-boundary') {
    ctx.moveTo(145, -12);
    ctx.lineTo(173, 914);
    ctx.moveTo(483, -12);
    ctx.lineTo(459, 914);
  } else {
    if (options.negative !== 'missing-rail') {
      ctx.moveTo(145, -12);
      ctx.lineTo(left, 504);
    }
    ctx.moveTo(483, -12);
    ctx.lineTo(right, 507);
    if (options.negative !== 'missing-closing-edge') {
      ctx.moveTo(left, 504);
      ctx.quadraticCurveTo(left + 1, 530, left + 27, 534);
      ctx.lineTo(right - 27, 534);
      ctx.quadraticCurveTo(right - 1, 533, right, 507);
    }
  }
  ctx.stroke();
  if (options.negative === 'stacked-subframes') drawSubframeDividers(ctx, options, color);
  if (options.negative === 'ambiguous-annotation') {
    // A second complete owner touches the same annotation. Neither color nor
    // the shared component can establish which panel owns it.
    ctx.beginPath();
    ctx.roundRect(492, 252, 125, 242, 9);
    ctx.stroke();
  }
}

function drawSubframeDividers(ctx, options, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = DESIGN.railWidth;
  for (const y of [234, 416]) {
    ctx.beginPath();
    ctx.moveTo(145 + (y + 12) * 18 * options.driftScale / 516, y);
    ctx.lineTo(483 - (y + 12) * 14 * options.driftScale / 519, y);
    ctx.stroke();
  }
}

function polygon(ctx, points, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(...points[0]);
  for (const point of points.slice(1)) ctx.lineTo(...point);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 3.3;
  ctx.stroke();
}

function drawFigures(ctx, monochrome = false, figureScale = 1) {
  ctx.save();
  ctx.translate(310, 305);
  ctx.scale(figureScale, figureScale);
  ctx.translate(-310, -305);
  const ink = monochrome ? '#fff' : DESIGN.ink;
  const color = value => monochrome ? '#fff' : value;
  polygon(ctx, [[287,195],[324,190],[359,232],[346,335],[268,335],[254,248]], color('#9f4862'), ink);
  polygon(ctx, [[264,238],[286,254],[249,310],[203,316],[200,297],[237,279]], color('#c5824d'), ink);
  polygon(ctx, [[348,225],[372,237],[394,293],[430,312],[421,332],[375,316],[346,276]], color('#c5824d'), ink);
  polygon(ctx, [[275,329],[310,335],[292,447],[268,491],[229,491],[248,462]], color('#454d8a'), ink);
  polygon(ctx, [[311,334],[346,329],[370,418],[394,477],[362,491],[328,437]], color('#4a5c83'), ink);
  polygon(ctx, [[281,148],[309,130],[337,148],[335,180],[318,202],[293,194],[280,172]], color('#d3a06e'), ink);
  polygon(ctx, [[280,153],[275,129],[302,116],[332,124],[342,152],[320,138],[295,142]], color('#32333b'), ink);
  if (!monochrome) {
    ctx.strokeStyle = ink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(302,165); ctx.lineTo(307,164);
    ctx.moveTo(321,164); ctx.lineTo(326,165);
    ctx.moveTo(307,183); ctx.lineTo(322,183);
    ctx.stroke();
  }
  ctx.restore();
}

function balloonPath(ctx) {
  ctx.beginPath();
  ctx.moveTo(419,184);
  ctx.bezierCurveTo(390,181,393,129,420,117);
  ctx.bezierCurveTo(451,100,510,99,535,124);
  ctx.bezierCurveTo(559,149,540,184,515,192);
  ctx.bezierCurveTo(487,202,464,199,443,193);
  ctx.lineTo(414,226);
  ctx.lineTo(423,191);
  ctx.closePath();
}

function drawBalloon(ctx, monochrome = false, dx = 0) {
  ctx.save();
  ctx.translate(dx, 0);
  balloonPath(ctx);
  ctx.fillStyle = monochrome ? '#fff' : '#f7f2db';
  ctx.strokeStyle = monochrome ? '#fff' : DESIGN.ink;
  ctx.lineWidth = 3.25;
  ctx.fill();
  ctx.stroke();
  if (!monochrome) {
    // Synthetic text deliberately overlaps neither the exterior nor a rail.
    ctx.fillStyle = DESIGN.ink;
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('HOLD ON!', 471, 146);
    ctx.font = '13px sans-serif';
    ctx.fillText('WE CAN DO IT.', 471, 168);
  }
  ctx.restore();
}

function sfxPath(ctx) {
  ctx.beginPath();
  const points = [[112,354],[135,357],[139,338],[154,355],[178,337],
    [177,356],[200,348],[204,359],[230,354],[224,369],[251,376],
    [229,388],[235,405],[208,397],[199,413],[186,397],[164,407],
    [160,392],[138,402],[139,384],[112,389],[124,372],[105,367]];
  ctx.moveTo(...points[0]);
  for (const point of points.slice(1)) ctx.lineTo(...point);
  ctx.closePath();
}

function drawSfx(ctx, monochrome = false, dx = 0) {
  ctx.save();
  ctx.translate(dx, 0);
  sfxPath(ctx);
  ctx.fillStyle = monochrome ? '#fff' : '#f8e28a';
  ctx.strokeStyle = monochrome ? '#fff' : DESIGN.ink;
  ctx.lineWidth = 3.5;
  ctx.fill();
  ctx.stroke();
  if (!monochrome) {
    ctx.fillStyle = DESIGN.ink;
    ctx.font = 'italic bold 23px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('KRAK!', 177, 386);
  }
  ctx.restore();
}

function drawAmbiguous(ctx, monochrome = false) {
  ctx.beginPath();
  ctx.ellipse(486, 316, 68, 36, -0.1, 0, Math.PI * 2);
  ctx.fillStyle = monochrome ? '#fff' : '#f9e9a2';
  ctx.strokeStyle = monochrome ? '#fff' : DESIGN.ink;
  ctx.lineWidth = 3.25;
  ctx.fill();
  ctx.stroke();
  if (!monochrome) {
    ctx.fillStyle = DESIGN.ink;
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('WHAM!', 486, 323);
  }
}

function secondaryPath(ctx) {
  ctx.beginPath();
  for (const [index, point] of [[12,12],[243,12],[243,570],[396,570],
    [396,12],[628,12],[628,888],[12,888]].entries()) {
    if (index === 0) ctx.moveTo(...point); else ctx.lineTo(...point);
  }
  ctx.closePath();
}

function drawSecondaryArtwork(ctx, monochrome = false) {
  ctx.save();
  secondaryPath(ctx);
  ctx.clip();
  for (let y = 12; y < 888; y += 12) for (let x = 12; x < 628; x += 12) {
    // A deterministic, varied, fully connected synthetic artwork field.
    ctx.fillStyle = monochrome ? '#fff' : `rgb(${35 + x % 140},${50 + y % 130},${70 + (x + y) % 120})`;
    ctx.fillRect(x, y, 12, 12);
  }
  ctx.restore();
  secondaryPath(ctx);
  ctx.strokeStyle = monochrome ? '#fff' : DESIGN.ink;
  ctx.lineWidth = 3;
  ctx.stroke();
}

function maskFromDraw(w, h, options, draw) {
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext('2d');
  transform(ctx, options);
  draw(ctx);
  const data = ctx.getImageData(0, 0, w, h).data;
  const mask = new Uint8Array(w * h);
  for (let p = 0; p < mask.length; p++) mask[p] = data[p * 4 + 3] >= 128 ? 1 : 0;
  return mask;
}

function unionMasks(...masks) {
  const union = new Uint8Array(masks[0].length);
  for (const mask of masks) for (let i = 0; i < union.length; i++) union[i] |= mask[i];
  return union;
}

function maskBounds(mask, w, h) {
  let left = w, top = h, right = -1, bottom = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (mask[y * w + x]) {
    left = Math.min(left, x); top = Math.min(top, y);
    right = Math.max(right, x); bottom = Math.max(bottom, y);
  }
  if (right < 0) return null;
  const pixels = { x: left, y: top, w: right - left + 1, h: bottom - top + 1 };
  return { pixels, normalized: { x: pixels.x / w, y: pixels.y / h, w: pixels.w / w, h: pixels.h / h } };
}

function makeFixture(input = {}) {
  const selected = typeof input === 'string' ? CASES.find(item => item.caseName === input) : input;
  if (!selected) throw new Error(`Unknown fixture: ${input}`);
  // Render scale varies resolution while leaving all normalized geometry fixed.
  const options = { caseName: 'custom-edge-rail', matte: '#36bacd', scale: 1.5,
    shapeScaleX: 0.64, figureScale: 1, driftScale: 0, balloonDx: -30, sfxDx: 18,
    dx: 0, mirror: false, ...selected };
  assert(options.scale > 0 && options.scale <= 4, 'Fixture scale must be in (0, 4].');
  const w = Math.round(DESIGN.w * options.scale), h = Math.round(DESIGN.h * options.scale);
  const canvas = createCanvas(w, h), ctx = canvas.getContext('2d');
  ctx.fillStyle = options.matte;
  ctx.fillRect(0, 0, w, h);
  if (options.secondaryArtwork) {
    ctx.save();
    transform(ctx, { ...options, shapeScaleX: 1 });
    drawSecondaryArtwork(ctx);
    ctx.restore();
  }
  transform(ctx, options);
  drawRails(ctx, options, DESIGN.ink);
  drawFigures(ctx, false, options.figureScale);
  drawBalloon(ctx, false, options.balloonDx);
  drawSfx(ctx, false, options.sfxDx);
  // These are deliberately complete separators, including over other artwork.
  if (options.negative === 'stacked-subframes') drawSubframeDividers(ctx, options, DESIGN.ink);
  if (options.negative === 'ambiguous-annotation') drawAmbiguous(ctx);

  const mask = draw => maskFromDraw(w, h, options, draw);
  const frame = mask(c => {
    framePath(c, options); c.fillStyle = '#fff'; c.strokeStyle = '#fff';
    c.lineWidth = DESIGN.railWidth; c.fill(); c.stroke();
  });
  const rails = mask(c => drawRails(c, options, '#fff'));
  const figures = mask(c => drawFigures(c, true, options.figureScale));
  const balloon = mask(c => drawBalloon(c, true, options.balloonDx));
  const sfx = mask(c => drawSfx(c, true, options.sfxDx));
  const ambiguousAnnotation = mask(c => {
    if (options.negative === 'ambiguous-annotation') drawAmbiguous(c, true);
  });
  const secondaryArtwork = maskFromDraw(w, h, { ...options, shapeScaleX: 1 }, c => {
    if (options.secondaryArtwork) drawSecondaryArtwork(c, true);
  });
  const owned = unionMasks(frame, balloon, sfx, figures);
  const exterior = Uint8Array.from(owned, (included, i) => included || ambiguousAnnotation[i] ? 0 : 1);
  const forbiddenUnion = options.negative ? unionMasks(owned, ambiguousAnnotation) : new Uint8Array(w * h);
  const stackedSubframes = [];
  if (options.negative === 'stacked-subframes') {
    for (const [from, to] of [[0,234],[234,416],[416,535]]) {
      stackedSubframes.push(mask(c => {
        c.beginPath(); c.rect(0, from, DESIGN.w, to - from); c.clip();
        framePath(c, options); c.fillStyle = '#fff'; c.fill();
      }));
    }
  }
  const uncertain = ['stacked-subframes', 'ambiguous-annotation'].includes(options.negative);
  const expected = {
    decision: options.negative ? (uncertain ? 'reject-enclosing-union' : 'abstain') : 'recover-single-owner',
    reason: options.negative || 'two page-edge rails, closed far side, and uniquely attached decorations',
    nominalFrameMaskIsNotAcceptedOwnership: Boolean(options.negative),
    preserveIndividualSubframes: options.negative === 'stacked-subframes',
    annotationOwnershipMustAbstain: options.negative === 'ambiguous-annotation',
  };
  return {
    rgba: new Uint8ClampedArray(ctx.getImageData(0, 0, w, h).data),
    w, h, caseName: options.caseName, options, canvas,
    bounds: { frame: maskBounds(frame,w,h), owned: maskBounds(owned,w,h), balloon: maskBounds(balloon,w,h), sfx: maskBounds(sfx,w,h) },
    expectedMasks: { frame, rails, figures, balloon, sfx, owned, exterior,
      ambiguousAnnotation, secondaryArtwork, forbiddenUnion, stackedSubframes },
    expected,
  };
}

function makeFixtures() { return CASES.map(makeFixture); }

// Separate production-eligibility construction: a dense connected U-shaped
// artwork region surrounds a narrow cyan slot, leaving the rail cell isolated.
// This must obtain any enclosing parent through the real source detector.
function makeProductionFixture(overrides = {}) {
  return makeFixture({ caseName: 'production-parent-enclosure', shapeScaleX: 0.33, figureScale: 0.55,
    secondaryArtwork: true, ...overrides });
}

// The research adapter intentionally exercises geometry internals. It does not
// bypass production ownership eligibility or produce an accepted descriptor.
function probeCandidateGeometry(candidate, fixture) {
  const { rgba, w, h, expectedMasks: masks } = fixture;
  const evidence = candidate.evidence(rgba, w, h);
  const witnesses = evidence ? [85, 105].map(threshold => candidate.makeWitness(evidence, w, h, threshold)) : [null, null];
  const measured = witnesses.every(Boolean) ? candidate.measure(
    candidate.decode(witnesses[0].mask, w * h),
    candidate.decode(witnesses[1].mask, w * h), w, h) : null;
  const report = {
    caseName: fixture.caseName, w, h, expected: fixture.expected.decision,
    paletteFound: Boolean(evidence), witnessesFound: witnesses.map(Boolean),
    geometryFound: Boolean(measured), productionOwnershipTested: false,
  };
  if (measured) {
    const count = mask => mask.reduce((sum, included) => sum + included, 0);
    const intersection = mask => mask.reduce((sum, included, i) => sum + +(included && measured.mask[i]), 0);
    const ownedIntersection = intersection(masks.owned);
    const predictedPixels = count(measured.mask);
    const expectedBox = fixture.bounds.owned.pixels;
    const expectedEdges = [expectedBox.x, expectedBox.y, expectedBox.x + expectedBox.w, expectedBox.y + expectedBox.h];
    report.metrics = {
      normalizedOwnerBoundsMaxError: Math.max(...measured.g.box.map((value, index) =>
        Math.abs(value - expectedEdges[index]) / (index % 2 ? h : w))),
      ownedIoU: ownedIntersection / (count(masks.owned) + predictedPixels - ownedIntersection),
      balloonRecall: intersection(masks.balloon) / count(masks.balloon),
      sfxRecall: intersection(masks.sfx) / count(masks.sfx),
      exteriorLeakFraction: intersection(masks.exterior) / count(masks.exterior),
      forbiddenUnionRecall: fixture.options.negative ? intersection(masks.forbiddenUnion) / count(masks.forbiddenUnion) : 0,
      predictedPixels,
      sfxMissingExactInk: 0,
      sfxMissingDarkPixels: 0,
      sfxMissingBrightPixels: 0,
      sfxMissingAntialiasPixels: 0,
      secondaryArtworkPixelsOwned: intersection(masks.secondaryArtwork),
    };
    for (let i = 0; i < measured.mask.length; i++) if (masks.sfx[i] && !measured.mask[i]) {
      const r = rgba[i * 4], g = rgba[i * 4 + 1], b = rgba[i * 4 + 2];
      if (r === 23 && g === 25 && b === 28) report.metrics.sfxMissingExactInk++;
      if (Math.max(r,g,b) < 105) report.metrics.sfxMissingDarkPixels++;
      else if (Math.min(r,g,b) > 130 && Math.max(r,g,b) > 205) report.metrics.sfxMissingBrightPixels++;
      else report.metrics.sfxMissingAntialiasPixels++;
    }
  }
  if (!fixture.options.negative) {
    const m = report.metrics, limits = REGRESSION_PROPOSAL.suggestedAssertions;
    report.passed = Boolean(m && m.ownedIoU >= limits.minimumOwnedMaskIoU &&
      m.normalizedOwnerBoundsMaxError <= limits.normalizedOwnerBoundsMaxError &&
      Math.min(m.balloonRecall, m.sfxRecall) >= limits.minimumBalloonAndSfxRecall &&
      m.exteriorLeakFraction <= limits.maximumExteriorLeakFraction);
  } else if (fixture.options.negative === 'stacked-subframes') {
    report.passed = !measured || report.metrics.forbiddenUnionRecall < 0.8;
  } else {
    report.passed = !measured;
  }
  return report;
}

function validateFixtures(fixtures) {
  assert.equal(new Set(fixtures.map(f => f.caseName)).size, fixtures.length);
  for (const fixture of fixtures) {
    const { rgba, w, h, expectedMasks: masks } = fixture;
    assert.equal(rgba.length, w * h * 4);
    for (let i = 3; i < rgba.length; i += 4) assert.equal(rgba[i], 255, 'All fixture pixels are opaque.');
    for (const [name, value] of Object.entries(masks)) {
      for (const candidate of Array.isArray(value) ? value : [value]) {
        assert.equal(candidate.length, w * h, `${fixture.caseName}: ${name} dimensions`);
        assert(candidate.every(v => v === 0 || v === 1), `${fixture.caseName}: ${name} binary`);
      }
    }
    assert(masks.frame.some(Boolean) && masks.figures.some(Boolean));
    assert(masks.balloon.some((v,i) => v && !masks.frame[i]), 'Balloon crosses a rail.');
    assert(masks.sfx.some((v,i) => v && !masks.frame[i]), 'Connected SFX crosses a rail.');
    assert(masks.balloon.some((v,i) => v && masks.frame[i]), 'Balloon has interior attachment.');
    assert(masks.sfx.some((v,i) => v && masks.frame[i]), 'SFX has interior attachment.');
    assert(masks.owned.every((v,i) => !(v && masks.exterior[i])), 'Ownership/exterior labels do not overlap.');
    if (!fixture.options.negative) {
      for (const body of [masks.balloon, masks.sfx]) {
        const area = body.reduce((sum, included) => sum + included, 0);
        const inside = body.reduce((sum, included, i) => sum + +(included && masks.frame[i]), 0);
        assert(inside / area >= 0.7, 'Positive annotations have predominant interior ownership.');
      }
    }
    const sample = (x, y) => {
      const options = fixture.options;
      x = DESIGN.w / 2 + (x - DESIGN.w / 2) * options.shapeScaleX;
      if (options.mirror) x = DESIGN.w - x;
      const i = (Math.round(y * options.scale) * w + Math.round((x + options.dx) * options.scale)) * 4;
      return [...rgba.slice(i, i + 4)];
    };
    assert.deepEqual(sample(300, 60), sample(100, 60), 'Interior and exterior matte are exactly the same color.');
  }
  return { fixtures: fixtures.length, positive: fixtures.filter(f => !f.options.negative).length,
    negative: fixtures.filter(f => f.options.negative).length };
}

function writePngs(fixtures, outputDirectory = __dirname) {
  fs.mkdirSync(outputDirectory, { recursive: true });
  for (const fixture of fixtures) fs.writeFileSync(path.join(outputDirectory, `edge-rail-${fixture.caseName}.png`), fixture.canvas.toBuffer('image/png'));
  const columns = 4, tileW = 320, tileH = 484;
  const gallery = createCanvas(columns * tileW, Math.ceil(fixtures.length / columns) * tileH);
  const ctx = gallery.getContext('2d');
  ctx.fillStyle = '#20242a'; ctx.fillRect(0,0,gallery.width,gallery.height);
  fixtures.forEach((fixture, index) => {
    const x = (index % columns) * tileW, y = Math.floor(index / columns) * tileH;
    ctx.drawImage(fixture.canvas, x + 8, y + 27, 304, 427.5);
    ctx.fillStyle = '#fff'; ctx.font = '14px sans-serif';
    ctx.fillText(fixture.caseName, x + 9, y + 19);
    ctx.fillStyle = fixture.options.negative ? '#ffc777' : '#a8edaf';
    ctx.font = '12px sans-serif'; ctx.fillText(fixture.expected.decision, x + 9, y + 474);
  });
  fs.writeFileSync(path.join(outputDirectory, 'edge-rail-fixture-gallery.png'), gallery.toBuffer('image/png'));
}

module.exports = { CASES, DESIGN, REGRESSION_PROPOSAL, makeFixture, makeFixtures, makeProductionFixture,
  validateFixtures, writePngs, maskBounds, probeCandidateGeometry };

if (require.main === module) {
  const fixtures = makeFixtures();
  const report = validateFixtures(fixtures);
  writePngs(fixtures);
  console.log(JSON.stringify({ ...report, outputDirectory: __dirname, runtimeEdited: false }, null, 2));
}
