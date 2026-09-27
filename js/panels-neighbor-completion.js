/* Test71 — cooperative completion of compact paper cells.
 * Candidate generation is separate from page-map acceptance. Two seed scales
 * must agree exactly on a complete contour. A previously validated neighbor
 * must independently witness a separating exterior-paper corridor. Existing
 * owners keep all geometry, metadata and order; no pixels are reassigned.
 */
const PanelNeighborCompletion = (() => {
  'use strict';
  const METHOD = 'stable-paper-cell-with-accepted-neighbor';
  const finite = Number.isFinite;
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const geometry = p => [p.x, p.y, p.w, p.h, p._contours];
  const range = (v, lo, hi) => finite(v) && v >= lo && v <= hi;

  function priorValid(p) {
    if (!p || !Array.isArray(p._contours)) return false;
    if (p._identitySource === 'matte-cell-frame')
      return typeof PanelMatteCells !== 'undefined' && PanelMatteCells.validPanel(p);
    const v = p._structuralGridProof?.version;
    // Never use this supplement's own output as recursive proof evidence.
    return p._identitySource === 'structural-grid-frame' && v >= 18 && v <= 26 &&
      typeof PanelStructuralGrid !== 'undefined' && PanelStructuralGrid.validPanel(p);
  }
  function eligible(prior) {
    return Array.isArray(prior) && prior.length > 0 && prior.length <= 24 && prior.every(priorValid);
  }
  function raster(p, w, h) {
    const a = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) {
      const Y = (y + .5) / h, xs = [];
      for (const q of p._contours) for (let k = 0; k < q.length; k++) {
        const u = q[k], v = q[(k + 1) % q.length];
        if ((u.y > Y) !== (v.y > Y)) xs.push((u.x + (Y - u.y) * (v.x - u.x) / (v.y - u.y)) * w);
      }
      xs.sort((x, y) => x - y);
      for (let k = 0; k + 1 < xs.length; k += 2)
        for (let x = Math.max(0, Math.ceil(xs[k] - .5)); x < Math.min(w, Math.ceil(xs[k + 1] - .5)); x++) a[y * w + x] = 1;
    }
    return a;
  }
  function exteriorPaper(rgba, w, h) {
    const white = new Uint8Array(w * h), mask = new Uint8Array(w * h), queue = new Int32Array(w * h);
    let n = 0, head = 0;
    for (let i = 0; i < white.length; i++) {
      if (rgba[4 * i + 3] !== 255) return null;
      white[i] = Math.min(rgba[4 * i], rgba[4 * i + 1], rgba[4 * i + 2]) > 232 ? 1 : 0;
    }
    const add = i => { if (white[i] && !mask[i]) { mask[i] = 1; queue[n++] = i; } };
    for (let x = 0; x < w; x++) { add(x); add((h - 1) * w + x); }
    for (let y = 0; y < h; y++) { add(y * w); add(y * w + w - 1); }
    while (head < n) {
      const i = queue[head++], x = i % w, y = i / w | 0;
      if (x) add(i - 1); if (x + 1 < w) add(i + 1); if (y) add(i - w); if (y + 1 < h) add(i + w);
    }
    return { white, mask };
  }
  function sourceValid(p, radius) {
    const v = p?._structuralGridProof, w = v?.analysisWidth, h = v?.analysisHeight, b = v?.seed?.box;
    return typeof PanelRaggedGutters !== 'undefined' && PanelRaggedGutters.validPanel(p) &&
      p._geometryType === 'ragged-gutter-cells' && p._geometryOwner === 'structural-grid-contours' &&
      v.version === 18 && v.seedRadius === radius && v.palette.paper && !v.recovery && !v.seed.splits.length &&
      p._contours.length === 1 && p.x * w >= 3 && p.y * h >= 3 && (p.x + p.w) * w <= w - 3 && (p.y + p.h) * h <= h - 3 &&
      range(p.w * p.h, .025, .48) && v.pixels / (p.w * p.h * w * h) >= .90 &&
      v.seed.pixels / ((b[2] - b[0]) * (b[3] - b[1])) >= .40;
  }
  function internalSeam(A, paper, p, w, h) {
    const b = [Math.round(p.x * w), Math.round(p.y * h), Math.round((p.x + p.w) * w), Math.round((p.y + p.h) * h)];
    for (let axis = 0; axis < 2; axis++) {
      const length = b[axis ? 2 : 3] - b[axis ? 0 : 1], span = b[axis ? 3 : 2] - b[axis ? 1 : 0];
      const band = Math.max(8, Math.round(length * .055)), margin = Math.max(2 * band, Math.round(length * .12));
      for (let pos = margin; pos < length - margin; pos++) {
        let gap = 0, flank = 0;
        for (let t = 0; t < span; t++) {
          const i = (axis ? b[1] + t : b[1] + pos) * w + (axis ? b[0] + pos : b[0] + t), step = axis ? 1 : w;
          if (paper[i]) { gap++; if (A[i - band * step] && A[i + band * step]) flank++; }
        }
        if (gap / span > .20 && flank / span > .12) return true;
      }
    }
    return false;
  }
  function sharedCorridor(A, B, paper, w, h) {
    const limit = Math.max(8, Math.round(Math.min(w, h) * .06)), proposals = [];
    for (let side = 0; side < 4; side++) {
      const length = side < 2 ? w : h, cross = side < 2 ? h : w, step = side === 0 || side === 2 ? -1 : 1;
      const at = (t, z) => side < 2 ? z * w + t : t * w + z;
      const rays = []; let samples = 0;
      for (let t = 0; t < length; t++) {
        let edge = -1;
        for (let z = step < 0 ? 0 : cross - 1; z >= 0 && z < cross; z -= step) if (A[at(t, z)]) { edge = z; break; }
        if (edge < 0) continue; samples++;
        let whites = 0, other = 0;
        for (let d = 1; d <= limit; d++) {
          const z = edge + step * d; if (z < 0 || z >= cross) break;
          const i = at(t, z); if (A[i]) break;
          if (B[i]) { if (whites >= 2 && other <= 2) rays.push([t, edge, z, whites, other]); break; }
          if (paper[i]) whites++; else other++;
          if (other > 2) break;
        }
      }
      if (rays.length >= Math.max(24, Math.ceil(Math.min(w, h) * .10)) && rays.length >= samples * .60)
        proposals.push({ side, limit, samples, rays });
    }
    proposals.sort((a, b) => b.rays.length - a.rays.length || a.side - b.side);
    return proposals[0] || null;
  }
  function validPanel(p) { try {
    const v = p?._structuralGridProof, w = v?.analysisWidth, h = v?.analysisHeight;
    if (p?._identitySource !== 'structural-grid-frame' || p._geometryOwner !== 'structural-grid-contours' ||
        p._geometryType !== 'neighbor-completed-paper-cell' || p._quad || p._outline || v?.version !== 27 ||
        v.method !== METHOD || v.connected !== true || v.exactStableContours !== true || v.originalOwnerOverlap !== 0 ||
        !same(v.radii, [4, 6]) || !sourceValid(v.first, 4) || !sourceValid(v.second, 6) || !priorValid(v.neighbor)) return false;
    if (w !== v.first._structuralGridProof.analysisWidth || h !== v.first._structuralGridProof.analysisHeight ||
        w !== v.second._structuralGridProof.analysisWidth || h !== v.second._structuralGridProof.analysisHeight ||
        !same(geometry(v.first), geometry(v.second)) || !same(geometry(p), geometry(v.second))) return false;
    const A = raster(p, w, h), B = raster(v.neighbor, w, h), pixels = A.reduce((s, x) => s + x, 0);
    if (A.some((x, i) => x && B[i]) || pixels !== v.pixels || pixels !== v.second._structuralGridProof.pixels ||
        !Number.isInteger(v.enclosedWhitePixels) || !range(v.enclosedWhitePixels / pixels, .10, .65)) return false;
    // A lower seed fill is allowed only when enclosed white content accounts
    // for it, not when the scene is a sparse foreground silhouette.
    for (const q of [v.first, v.second]) {
      const s = q._structuralGridProof, b = s.seed.box;
      if ((s.seed.pixels + v.enclosedWhitePixels) / ((b[2] - b[0]) * (b[3] - b[1])) < .68) return false;
    }
    const e = v.shared;
    if (!e || !Number.isInteger(e.side) || !range(e.side, 0, 3) || e.limit !== Math.max(8, Math.round(Math.min(w, h) * .06)) ||
        !Number.isInteger(e.samples) || !Array.isArray(e.rays) || e.rays.length < Math.max(24, Math.ceil(Math.min(w, h) * .10)) ||
        e.rays.length < e.samples * .60 || e.rays.length > e.samples) return false;
    const length = e.side < 2 ? w : h, cross = e.side < 2 ? h : w, step = e.side === 0 || e.side === 2 ? -1 : 1;
    let previous = -1;
    const at = (t, z) => e.side < 2 ? z * w + t : t * w + z;
    for (const r of e.rays) {
      if (!Array.isArray(r) || r.length !== 5 || r.some(x => !Number.isInteger(x))) return false;
      const [t, a, b, whites, other] = r, distance = (b - a) * step;
      if (t <= previous || t < 0 || t >= length || a < 0 || b < 0 || a >= cross || b >= cross ||
          !range(distance, 3, e.limit) || whites < 2 || !range(other, 0, 2) || whites + other !== distance - 1 ||
          !A[at(t, a)] || !B[at(t, b)]) return false;
      for (let d = 1; d < distance; d++) if (A[at(t, a + step * d)] || B[at(t, a + step * d)]) return false;
      previous = t;
    }
    return true;
  } catch (_) { return false; } }
  function supplementRGBA(rgba, w, h, prior, log, audit) {
    const report = { eligible: eligible(prior), sourceCandidates: 0, compactCandidates: 0, stableCandidates: 0, overlapRejected: 0, seamRejected: 0, noNeighbor: 0, accepted: 0 };
    const finish = out => { if (typeof audit === 'function') audit(report); return out; };
    if (!report.eligible || !Number.isInteger(w) || !Number.isInteger(h) || w < 250 || h < 350 || w > 900 || h > 900 ||
        rgba?.length !== w * h * 4 || (typeof PanelRaggedGutters === 'undefined' || typeof PanelRaggedGutters.analyzeCooperativeRGBA !== 'function')) return finish([]);
    const paper = exteriorPaper(rgba, w, h); if (!paper) return finish([]);
    const low = PanelRaggedGutters.analyzeCooperativeRGBA(rgba, w, h, 4), high = PanelRaggedGutters.analyzeCooperativeRGBA(rgba, w, h, 6);
    report.sourceCandidates = high.length;
    const neighbors = prior.map(p => ({ p, mask: raster(p, w, h) })), occupied = new Uint8Array(w * h), out = [];
    for (const n of neighbors) for (let i = 0; i < occupied.length; i++) if (n.mask[i]) occupied[i] = 1;
    for (const p of high) {
      if (!sourceValid(p, 6)) continue; report.compactCandidates++;
      const matches = low.filter(q => sourceValid(q, 4) && same(geometry(p), geometry(q)));
      if (matches.length !== 1) continue; report.stableCandidates++;
      const A = raster(p, w, h); if (A.some((x, i) => x && occupied[i])) { report.overlapRejected++; continue; }
      if (internalSeam(A, paper.mask, p, w, h)) { report.seamRejected++; continue; }
      let whitePixels = 0; for (let i = 0; i < A.length; i++) if (A[i] && paper.white[i] && !paper.mask[i]) whitePixels++;
      const witnesses = neighbors.map(n => ({ neighbor: n.p, shared: sharedCorridor(A, n.mask, paper.mask, w, h) })).filter(x => x.shared);
      if (!witnesses.length) { report.noNeighbor++; continue; }
      witnesses.sort((a, b) => b.shared.rays.length - a.shared.rays.length);
      const v = { version: 27, method: METHOD, connected: true, analysisWidth: w, analysisHeight: h,
        radii: [4, 6], first: matches[0], second: p, neighbor: witnesses[0].neighbor, shared: witnesses[0].shared,
        exactStableContours: true, originalOwnerOverlap: 0, pixels: p._structuralGridProof.pixels, enclosedWhitePixels: whitePixels };
      const candidate = { ...p, _geometryType: 'neighbor-completed-paper-cell', _structuralGridProof: v };
      if (!validPanel(candidate)) continue;
      out.push(candidate); for (let i = 0; i < occupied.length; i++) if (A[i]) occupied[i] = 1;
    }
    report.accepted = out.length;
    if (out.length) log?.('shared-neighbor paper completion: ' + out.length + ' exact-stable, pixel-disjoint cells');
    return finish(out);
  }
  function supplementImage(img, prior, log, audit) {
    if (!eligible(prior) || typeof PanelMatteCells === 'undefined') return [];
    const W = img.naturalWidth || img.width, H = img.naturalHeight || img.height;
    if (!W || !H || W * H > 24000000) return [];
    let c;
    try {
      c = document.createElement('canvas'); c.width = W; c.height = H;
      const g = c.getContext('2d', { willReadFrequently: true }); if (!g) return [];
      g.drawImage(img, 0, 0);
      const s = Math.min(1, 900 / Math.max(W, H)), w = Math.round(W * s), h = Math.round(H * s);
      return supplementRGBA(PanelMatteCells.sampleBilinearRGBA(g.getImageData(0, 0, W, H).data, W, H, w, h), w, h, prior, log, audit);
    } finally { if (c) { c.width = 1; c.height = 1; } }
  }
  // Optional integration, like the interrupted-gutter extension. Legacy
  // validators, geometry and rendering entry points delegate unchanged.
  function bind() {
    if (typeof PanelStructuralGrid !== 'undefined' && !PanelStructuralGrid._neighborCompletionBound) {
      const previous = PanelStructuralGrid.validPanel;
      PanelStructuralGrid.validPanel = function (p) {
        return p?._structuralGridProof?.version === 27 ? validPanel(p) : previous.call(this, p);
      };
      PanelStructuralGrid._neighborCompletionBound = true;
    }
    if (typeof PanelGeometry !== 'undefined' && !PanelGeometry._neighborCompletionBound) {
      const previous = PanelGeometry.refine;
      PanelGeometry.refine = async function (url, p, log) {
        if (validPanel(p)) { log?.('shared-neighbor contour: preserve verified geometry'); return { ...p }; }
        return previous.call(this, url, p, log);
      };
      PanelGeometry._neighborCompletionBound = true;
    }
    if (typeof PanelEdgeSpill !== 'undefined' && !PanelEdgeSpill._neighborCompletionBound) {
      for (const name of ['analyzeImage', 'analyzeRGBA']) {
        const previous = PanelEdgeSpill[name];
        if (typeof previous !== 'function') continue;
        PanelEdgeSpill[name] = function (...args) {
          const panel = args[name === 'analyzeImage' ? 1 : 3];
          return validPanel(panel) ? null : previous.apply(this, args);
        };
      }
      PanelEdgeSpill._neighborCompletionBound = true;
    }
  }
  function install(detector) {
    bind();
    if (!detector || detector._neighborCompletionInstalled) return;
    const previous = detector.detect;
    detector.detect = async function (url, log) {
      const prior = await previous.call(this, url, log); if (!eligible(prior)) return prior;
      try {
        const img = new Image(); img.src = url; await img.decode();
        const added = supplementImage(img, prior, log); return added.length ? prior.concat(added) : prior;
      } catch (error) { log?.('shared-neighbor completion deferred: ' + error.message); return prior; }
    };
    detector._neighborCompletionInstalled = true;
  }
  return { supplementRGBA, supplementImage, validPanel, eligible, install, bind };
})();
if (typeof PanelDetect !== 'undefined') PanelNeighborCompletion.install(PanelDetect);
if (typeof module !== 'undefined') module.exports = PanelNeighborCompletion;
