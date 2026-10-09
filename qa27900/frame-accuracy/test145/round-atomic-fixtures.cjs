'use strict';

/* Public, procedural fixtures. Every pixel and expected ownership label below
 * is drawn from invented geometry. There are no input images, page identities,
 * review coordinates, image hashes, stored crops, or detector-selected masks.
 * The detector receives rgba/w/h only. Ground truth belongs to assertions.
 * No native canvas, fonts, randomness, or third-party package is required.
 */
const PALETTE = Object.freeze({
  background: [192, 134, 108], texture: [142, 95, 78],
  ink: [24, 25, 29], field: [56, 145, 186],
  face: [189, 116, 90], accent: [75, 67, 107],
  white: [250, 250, 250], glyph: [247, 224, 151],
  foreign: [216, 190, 246]
});

function insidePolygon(points, x, y) {
  let hit = false;
  for (let a = points.length - 1, b = 0; b < points.length; a = b++) {
    const p = points[a], q = points[b];
    if ((p[1] > y) !== (q[1] > y) &&
        x < (q[0] - p[0]) * (y - p[1]) / (q[1] - p[1]) + p[0]) hit = !hit;
  }
  return hit;
}
function distanceSegment(x, y, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(x - a[0] - t * dx, y - a[1] - t * dy);
}
function count(mask) { return mask.reduce((sum, value) => sum + value, 0); }
function union(masks, size) {
  const result = new Uint8Array(size);
  for (const mask of masks) for (let i = 0; i < size; i++) result[i] |= mask[i];
  return result;
}

function scene(options = {}) {
  const {
    kind = 'positive', shift = [0, 0], scale = 1,
    mirror = false, rotate = 0, ellipse = [1, 1],
    offAxisSpeck = false, unrelatedHue = false, seed = 11
  } = options;
  if (!(scale >= .6 && scale <= 1.3)) throw new RangeError('Fixture scale must be between .6 and 1.3');
  if (![0, 90, 180, 270].includes(rotate)) throw new RangeError('Only exact quarter-turn rotations are supported');
  const w = 560, h = 720, size = w * h, rgba = new Uint8ClampedArray(size * 4);
  for (let i = 0; i < size; i++) rgba.set([...PALETTE.background, 255], 4 * i);
  const masks = {}, forbiddenParts = {};
  const cx = 185 + shift[0], cy = 295 + shift[1];
  const point = (x, y) => [cx + scale * x, cy + scale * y];
  const makeMask = (collection, name) => collection[name] || (collection[name] = new Uint8Array(size));
  function paint(box, predicate, color, mask = null) {
    const x0 = Math.max(0, Math.floor(box[0])), y0 = Math.max(0, Math.floor(box[1]));
    const x1 = Math.min(w, Math.ceil(box[2])), y1 = Math.min(h, Math.ceil(box[3]));
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) if (predicate(x + .5, y + .5)) {
      const i = y * w + x;
      rgba.set(color, 4 * i);
      if (mask) mask[i] = 1;
    }
  }
  function oval(x, y, rx, ry, color, stroke = 0, mask = null) {
    const center = point(x, y), RX = rx * scale, RY = ry * scale, t = stroke * scale;
    const bounds = [center[0] - RX, center[1] - RY, center[0] + RX, center[1] + RY];
    const outer = (px, py) => ((px - center[0]) / RX) ** 2 + ((py - center[1]) / RY) ** 2 <= 1;
    paint(bounds, outer, stroke ? PALETTE.ink : color, mask);
    if (stroke) paint(bounds, (px, py) => ((px - center[0]) / (RX - t)) ** 2 + ((py - center[1]) / (RY - t)) ** 2 <= 1, color);
  }
  function polygon(points, color, stroke = 0, mask = null) {
    const q = points.map(p => point(...p)), t = stroke * scale / 2;
    const box = [Math.min(...q.map(p => p[0])) - t, Math.min(...q.map(p => p[1])) - t,
      Math.max(...q.map(p => p[0])) + t, Math.max(...q.map(p => p[1])) + t];
    paint(box, (x, y) => insidePolygon(q, x, y), color, mask);
    if (stroke) paint(box, (x, y) => q.some((a, k) => distanceSegment(x, y, a, q[(k + 1) % q.length]) <= t), PALETTE.ink, mask);
  }
  function line(a, b, color, thickness = 1, mask = null, local = true) {
    if (local) { a = point(...a); b = point(...b); }
    const t = thickness * (local ? scale : 1) / 2;
    paint([Math.min(a[0], b[0]) - t, Math.min(a[1], b[1]) - t,
      Math.max(a[0], b[0]) + t, Math.max(a[1], b[1]) + t],
    (x, y) => distanceSegment(x, y, a, b) <= t, color, mask);
  }
  function balloon(name, x, y, rx, ry) {
    const mask = makeMask(masks, name);
    oval(x, y, rx, ry, PALETTE.white, 3, mask);
    // Separate invented text-like bars form enclosed dark letter components.
    line([x - rx * .43, y - 5], [x + rx * .41, y - 5], PALETTE.ink, 2);
    line([x - rx * .56, y + 4], [x + rx * .54, y + 4], PALETTE.ink, 2);
    return mask;
  }

  // A deterministic background is deliberately independent of the target.
  let random = seed >>> 0;
  for (let k = 0; k < 80; k++) {
    random = (Math.imul(random, 1664525) + 1013904223) >>> 0; const x = random % w;
    random = (Math.imul(random, 1664525) + 1013904223) >>> 0; const y = random % h;
    line([x, y], [x + 15, y - 12], PALETTE.texture, 1, null, false);
  }

  const body = makeMask(masks, 'rimAndInterior');
  oval(0, 0, 88 * ellipse[0], 88 * ellipse[1], PALETTE.field, 8, body);
  // A made-up surprised creature with two eyes, a mouth, and colored marks.
  oval(-1, 9, 45, 67, PALETTE.face, 4);
  for (const y of [-35, -5, 25]) line([-42, y], [-51, y + 20], PALETTE.accent, 8);
  for (const x of [-20, 17]) oval(x, -10, 8, 12, [240, 244, 236], 3);
  oval(0, 44, 18, 16, PALETTE.ink);
  line([-12, 37], [11, 37], PALETTE.white, 4);

  if (kind === 'reflection') {
    // An ordinary shiny round object has a compelling dark rim and no text.
    oval(-24, -30, 13, 21, [210, 230, 239]);
  } else {
    const glyphs = makeMask(masks, 'attachedGlyphs');
    polygon([[57, -40], [67, -74], [77, -72], [76, -57], [90, -60],
      [105, -41], [115, -43], [131, -22], [143, -18], [143, -7],
      [124, -14], [109, -28], [94, -27], [78, -45], [77, -24]], PALETTE.glyph, 3, glyphs);
    for (const [x, y] of [[77, -58], [104, -37], [131, -14]]) oval(x, y, 2, 3, PALETTE.ink);
    if (kind !== 'missing_balloon') balloon('letteredBalloon', 78, -86, 26, 19);
    if (kind === 'two_balloons') balloon('secondLetteredBalloon', 120, -55, 22, 13);
    if (kind === 'unlettered_balloon') oval(78, -86, 26, 19, PALETTE.white, 3);
    polygon([[148, -4], [153, -1], [149, 7], [145, 4]], PALETTE.glyph, 1,
      makeMask(masks, 'punctuationStem'));
    polygon([[149, 13], [152, 16], [149, 19], [146, 16]], PALETTE.glyph, 1,
      makeMask(masks, 'punctuationDot'));
    // This unrelated shape exists in every annotated scene and must stay out.
    oval(145, -85, 5, 6, PALETTE.glyph, 2, makeMask(forbiddenParts, 'remoteSameHue'));
    if (offAxisSpeck) oval(153, -26, 4, 5, PALETTE.glyph, 1, makeMask(forbiddenParts, 'nearOffAxisSameHue'));
    if (unrelatedHue) oval(149, 29, 4, 5, PALETTE.foreign, 1, makeMask(forbiddenParts, 'nearUnrelatedHue'));
    if (kind === 'open_rim') {
      const a = point(-98, -27), b = point(-63, 31);
      paint([...a, ...b], () => true, PALETTE.background);
    }
  }
  const expectedCandidates = ['reflection', 'missing_balloon', 'open_rim', 'two_balloons', 'unlettered_balloon'].includes(kind) ? 0 : 1;
  const owned = union(Object.values(masks), size), forbidden = union(Object.values(forbiddenParts), size);
  const result = {name: options.name || kind, w, h, rgba, owned, parts: masks,
    forbidden, forbiddenParts, expectedCandidates, options: {...options},
    provenance: 'entirely procedural invented geometry; no external pixels'};

  // These transforms move RGBA and independent labels identically, without
  // interpolation, so reflected/rotated ground truth stays pixel-exact.
  if (!mirror && !rotate) return result;
  const W = rotate % 180 ? h : w, H = rotate % 180 ? w : h;
  const allMasks = {owned, forbidden, ...Object.fromEntries(Object.entries(masks).map(([k, v]) => ['part:' + k, v])),
    ...Object.fromEntries(Object.entries(forbiddenParts).map(([k, v]) => ['forbidden:' + k, v]))};
  const transformed = Object.fromEntries(Object.keys(allMasks).map(key => [key, new Uint8Array(size)]));
  const pixels = new Uint8ClampedArray(rgba.length);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const mx = mirror ? w - x - 1 : x; let X = mx, Y = y;
    if (rotate === 90) { X = h - y - 1; Y = mx; }
    if (rotate === 180) { X = w - mx - 1; Y = h - y - 1; }
    if (rotate === 270) { X = y; Y = w - mx - 1; }
    const from = y * w + x, to = Y * W + X;
    pixels.set(rgba.subarray(from * 4, from * 4 + 4), to * 4);
    for (const key of Object.keys(allMasks)) transformed[key][to] = allMasks[key][from];
  }
  return {...result, w: W, h: H, rgba: pixels, owned: transformed.owned, forbidden: transformed.forbidden,
    parts: Object.fromEntries(Object.keys(masks).map(key => [key, transformed['part:' + key]])),
    forbiddenParts: Object.fromEntries(Object.keys(forbiddenParts).map(key => [key, transformed['forbidden:' + key]]))};
}

const CASES = Object.freeze([
  {name: 'base'},
  {name: 'shifted', shift: [80, 110]},
  {name: 'scaled_down', scale: .75},
  {name: 'scaled_up', scale: 1.2},
  {name: 'mirrored', mirror: true},
  {name: 'quarter_rotated', rotate: 90},
  {name: 'half_rotated', rotate: 180},
  {name: 'mild_ellipse', ellipse: [1.03, .98]},
  {name: 'unrelated_hue_excluded', unrelatedHue: true},
  {name: 'off_axis_speck_excluded', offAxisSpeck: true},
  {name: 'open_rim_abstains', kind: 'open_rim'},
  {name: 'plain_reflection_abstains', kind: 'reflection'},
  {name: 'missing_balloon_abstains', kind: 'missing_balloon'},
  {name: 'two_balloons_abstains', kind: 'two_balloons'},
  {name: 'unlettered_balloon_abstains', kind: 'unlettered_balloon'}
]);
function fixtures() { return CASES.map(options => scene(options)); }
function summary(f) {
  return {name: f.name, width: f.w, height: f.h, expectedCandidates: f.expectedCandidates,
    ownedPixels: count(f.owned), parts: Object.fromEntries(Object.entries(f.parts).map(([key, value]) => [key, count(value)])),
    forbiddenParts: Object.fromEntries(Object.entries(f.forbiddenParts).map(([key, value]) => [key, count(value)]))};
}
module.exports = {PALETTE, CASES, scene, fixtures, summary, count};
if (require.main === module) console.log(JSON.stringify({sourceIndependent: true, cases: fixtures().map(summary)}, null, 2));
