/* Accuracy-first ownership for complete stacks of framed horizontal strips.
 * This is deliberately an abstaining detector: uncertain layouts return [].
 */
const PanelPageLayout = (() => {
  'use strict';
  const cache = new WeakMap();
  const percentile = (a, p) => a[Math.min(a.length - 1, Math.floor((a.length - 1) * p))];
  function envelope(g, w, h) {
    const edge = [];
    for (let x = 0; x < w; x++) edge.push(g[x], g[(h - 1) * w + x]);
    for (let y = 0; y < h; y++) edge.push(g[y * w], g[y * w + w - 1]);
    edge.sort((a, b) => a - b);
    if (percentile(edge, .98) > 30) return null;
    const bg = percentile(edge, .5), boxes = [];
    for (const delta of [15, 25, 35]) {
      let x0 = w, y0 = h, x1 = -1, y1 = -1;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (g[y * w + x] > bg + delta) {
        x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
      }
      if (x1 < x0 || x0 < 3 || y0 < 3 || x1 >= w - 3 || y1 >= h - 3) return null;
      boxes.push([x0, y0, x1, y1]);
    }
    for (let i = 0; i < 4; i++) if (Math.max(...boxes.map(b => b[i])) - Math.min(...boxes.map(b => b[i])) > 2) return null;
    const b = [Math.min(...boxes.map(b => b[0])), Math.min(...boxes.map(b => b[1])), Math.max(...boxes.map(b => b[2])), Math.max(...boxes.map(b => b[3]))];
    const rails = [];
    for (let side = 0; side < 4; side++) {
      const vertical = side === 0 || side === 2, inward = side < 2 ? 1 : -1;
      const lo = vertical ? b[1] : b[0], hi = vertical ? b[3] : b[2], eligible = [];
      for (let pos = b[side] - 4; pos <= b[side] + 4; pos++) {
        if (pos - 4 < 0 || pos + 4 >= (vertical ? w : h)) continue;
        let dark = 0, contrast = 0, outside = 0;
        for (let t = lo; t <= hi; t++) {
          const at = p => vertical ? g[t * w + p] : g[p * w + t];
          const v = at(pos);
          dark += v < 50; contrast += at(pos + inward * 4) - v > 12; outside += at(pos - inward * 4) <= 30;
        }
        const n = hi - lo + 1;
        if (dark / n >= .95 && contrast / n >= .55 && outside / n >= .98) eligible.push(pos);
      }
      if (!eligible.length) return null;
      rails.push(inward > 0 ? Math.max(...eligible) : Math.min(...eligible));
    }
    return rails;
  }
  function separators(g, w, h, box, vertical = false, keepAmbiguous = false) {
    const [x0, y0, x1, y1] = box;
    const n = vertical ? x1 - x0 : y1 - y0, span = vertical ? y1 - y0 : x1 - x0;
    if (n < 35 || span < 35) return [];
    const trim = Math.max(2, Math.round(span * .035)), count = span - 2 * trim, center = (span - 1) / 2;
    const z = new Float32Array(n * count), means = new Float32Array(n), stds = new Float32Array(n), quiet = new Uint8Array(n), out = [];
    for (let degree = -30; degree <= 30; degree++) {
      const slope = Math.tan(degree * Math.PI / 1800);
      for (let p = 0; p < n; p++) {
        let sum = 0, sq = 0, dark = 0, valid = true;
        for (let j = 0; j < count; j++) {
          const t = j + trim, q = Math.round(p + slope * (t - center));
          if (q < 0 || q >= n) { valid = false; break; }
          const v = vertical ? g[(y0 + t) * w + x0 + q] : g[(y0 + q) * w + x0 + t];
          z[p * count + j] = v; sum += v; sq += v * v; dark += v < 50;
        }
        const mean = sum / count, std = Math.sqrt(Math.max(0, sq / count - mean * mean));
        means[p] = mean; stds[p] = std;
        quiet[p] = valid && p > Math.max(12, n * .07) && p < Math.min(n - 12, n * .93) && (std < 10 || (std < 22 && mean < 30 && dark / count > .9));
      }
      for (let p = 0; p < n; p++) {
        if (!quiet[p]) continue;
        const lo = p; while (p < n && quiet[p]) p++; const hi = p;
        if (hi - lo > 18) continue;
        let before = 0, after = 0;
        for (let q = Math.max(0, lo - 8); q < lo; q++) before = Math.max(before, stds[q]);
        for (let q = hi; q < Math.min(n, hi + 8); q++) after = Math.max(after, stds[q]);
        if (Math.min(before, after) < 20) continue;
        const mid = Math.floor((lo + hi - 1) / 2), prior = Math.max(0, lo - 4), next = Math.min(n - 1, hi + 3);
        let support = 0;
        for (let j = 0; j < count; j++) {
          const v = z[mid * count + j], a = z[prior * count + j], b = z[next * count + j];
          const contrast = means[mid] < 65 ? Math.min(a - v, b - v) : means[mid] > 180 ? Math.min(v - a, v - b) : Math.min(Math.abs(a - v), Math.abs(b - v));
          support += contrast > 12;
        }
        support /= count;
        if (support < .55) continue;
        // Endpoint trimming proposes a line only. Its entire span must independently
        // satisfy the same quiet/rail and two-sided contrast tests before acceptance.
        let fullSum = 0, fullSq = 0, fullDark = 0, fullSupport = 0, fullValid = true;
        for (let t = 0; t < span; t++) {
          const shift = slope * (t - center), q = Math.round(mid + shift), qa = Math.round(prior + shift), qb = Math.round(next + shift);
          if (Math.min(q, qa, qb) < 0 || Math.max(q, qa, qb) >= n) { fullValid = false; break; }
          const at = p => vertical ? g[(y0 + t) * w + x0 + p] : g[(y0 + p) * w + x0 + t];
          const v = at(q), a = at(qa), b = at(qb);
          fullSum += v; fullSq += v * v; fullDark += v < 50;
          const contrast = means[mid] < 65 ? Math.min(a - v, b - v) : means[mid] > 180 ? Math.min(v - a, v - b) : Math.min(Math.abs(a - v), Math.abs(b - v));
          fullSupport += contrast > 12;
        }
        if (!fullValid) continue;
        const fullMean = fullSum / span, fullStd = Math.sqrt(Math.max(0, fullSq / span - fullMean * fullMean));
        const fullSpan = (fullStd < 10 || (fullStd < 22 && fullMean < 30 && fullDark / span > .9)) && fullSupport / span >= .55;
        if (!fullSpan && !keepAmbiguous) continue;
        out.push({ fullSpan, lo, hi, slope, center, support, score: (hi - lo) * Math.min(before, after) * (.5 + support) * (1 - Math.min(fullStd, 29) / 30) - Math.abs(slope) * 10 });
      }
    }
    return out.sort((a, b) => b.score - a.score);
  }
  function fitDarkBand(g, w, h, box, candidate) {
    const [x0, y0, x1, y1] = box, samples = [], mid = (candidate.lo + candidate.hi - 1) / 2;
    for (let x = x0; x <= x1; x++) {
      const guess = Math.round(y0 + mid + candidate.slope * (x - x0 - candidate.center));
      if (guess < y0 + 8 || guess >= y1 - 8 || g[guess * w + x] >= 50) continue;
      let lo = guess, hi = guess + 1;
      while (lo > guess - 6 && g[(lo - 1) * w + x] < 50) lo--;
      while (hi < guess + 7 && g[hi * w + x] < 50) hi++;
      if (hi - lo > 8 || lo <= guess - 6 || hi >= guess + 7) continue;
      const center = (lo + hi - 1) / 2, value = g[Math.round(center) * w + x];
      if (Math.min(g[(lo - 3) * w + x] - value, g[(hi + 2) * w + x] - value) <= 12) continue;
      samples.push({ x, center, lo, hi });
    }
    if (samples.length / (x1 - x0 + 1) < .45) return null;
    const average = key => samples.reduce((sum, p) => sum + p[key], 0) / samples.length;
    const mx = average('x'), my = average('center');
    let cov = 0, variance = 0;
    for (const p of samples) { cov += (p.x - mx) * (p.center - my); variance += (p.x - mx) ** 2; }
    const slope = cov / variance, offset = my - slope * mx;
    if (!Number.isFinite(slope) || Math.abs(slope) > Math.tan(Math.PI / 60)) return null;
    const residuals = samples.map(p => Math.abs(p.center - offset - slope * p.x)).sort((a, b) => a - b);
    if (percentile(residuals, .9) > 1.5) return null;
    const upper = { offset: average('lo') - slope * mx, slope }, lower = { offset: average('hi') - slope * mx, slope };
    let dark = 0, support = 0, sum = 0, square = 0;
    for (let x = x0; x <= x1; x++) {
      const y = Math.round(offset + slope * x), a = Math.round(upper.offset + slope * x) - 3, b = Math.round(lower.offset + slope * x) + 2;
      if (a < y0 || b >= y1 || y < 0 || y >= h) return null;
      const v = g[y * w + x]; dark += v < 50; sum += v; square += v * v;
      support += Math.min(g[a * w + x] - v, g[b * w + x] - v) > 12;
    }
    const count = x1 - x0 + 1, mean = sum / count, std = Math.sqrt(Math.max(0, square / count - mean * mean));
    if (dark / count <= .9 || support / count < .55 || mean >= 30 || std >= 22) return null;
    return { upper, lower };
  }
  function analyzeRGBA(rgba, w, h, log) {
    if (!Number.isInteger(w) || !Number.isInteger(h) || w < 80 || h < 160 || !rgba || rgba.length !== w * h * 4) return [];
    const g = new Float32Array(w * h);
    for (let i = 0; i < g.length; i++) g[i] = .299 * rgba[i * 4] + .587 * rgba[i * 4 + 1] + .114 * rgba[i * 4 + 2];
    const outer = envelope(g, w, h);
    if (!outer || outer[2] - outer[0] < w * .75 || outer[3] - outer[1] < h * .75) return [];
    const leaves = [], line = y => ({ offset: y, slope: 0 });
    function split(box, top, bottom, depth) {
      if (depth >= 8) { leaves.push({ box, top, bottom }); return; }
      for (const c of separators(g, w, h, box)) {
        const [x0, y0, x1, y1] = box, fit = fitDarkBand(g, w, h, box, c);
        if (!fit) continue;
        const { upper, lower } = fit, center = (x0 + x1) / 2;
        const a = Math.floor(upper.offset + upper.slope * center), b = Math.ceil(lower.offset + lower.slope * center);
        if (a - y0 < h * .08 || y1 - b < h * .08) continue;
        split([x0, y0, x1, a], top, upper, depth + 1);
        split([x0, b, x1, y1], lower, bottom, depth + 1); return;
      }
      leaves.push({ box, top, bottom });
    }
    split(outer, line(outer[1]), line(outer[3]), 0);
    if (leaves.length < 4 || leaves.length > 10) return [];
    const panels = [];
    for (const leaf of leaves) {
      const [x0, , x1] = leaf.box, y = (l, x) => l.offset + l.slope * x;
      const q = [{ x: x0, y: y(leaf.top, x0) }, { x: x1, y: y(leaf.top, x1) }, { x: x1, y: y(leaf.bottom, x1) }, { x: x0, y: y(leaf.bottom, x0) }];
      if (Math.min(q[3].y - q[0].y, q[2].y - q[1].y) < h * .08 || Math.max(q[3].y - q[0].y, q[2].y - q[1].y) > h * .45) return [];
      // A stack containing a strong vertical division is not a complete strip map.
      if (separators(g, w, h, leaf.box, true).length) return [];
      // A near-complete internal divider can be obscured by lettering/artwork.
      // Abstain rather than silently joining two panels when its ends fail proof.
      if (separators(g, w, h, leaf.box, false, true).length) return [];
      // Global inward contrast proves shared page edges; each leaf must still
      // retain those dark rails and the quiet exterior across its own height.
      for (const [edgeX, inward, corners] of [[x0, 1, [0, 3]], [x1, -1, [1, 2]]]) {
        let verified = false;
        // Scan irregularities can shift an outer rail by a pixel. Expansion is
        // outward only, at most two analysis pixels; never move into artwork.
        for (let expand = 0; expand <= 2; expand++) {
          const x = edgeX - inward * expand;
          const start = Math.ceil(y(leaf.top, x)), end = Math.floor(y(leaf.bottom, x));
          if (x - inward * 4 < 0 || x - inward * 4 >= w || start < 0 || end >= h) continue;
          let dark = 0, exterior = 0;
          for (let row = start; row <= end; row++) {
            dark += g[row * w + x] < 50;
            exterior += g[row * w + x - inward * 4] <= 30;
          }
          if (dark / (end - start + 1) >= .95 && exterior / (end - start + 1) >= .98) {
            q[corners[0]] = { x, y: y(leaf.top, x) };
            q[corners[1]] = { x, y: y(leaf.bottom, x) };
            verified = true; break;
          }
        }
        if (!verified) return [];
      }
      if (q.some(p => !Number.isFinite(p.x) || !Number.isFinite(p.y) || p.x < 0 || p.x >= w || p.y < 0 || p.y >= h)) return [];
      const quad = q.map(p => ({ x: p.x / w, y: p.y / h }));
      const xs = quad.map(p => p.x), ys = quad.map(p => p.y);
      panels.push({ x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys), _quad: quad,
        _identitySource: 'page-layout', _pageLayoutProof: { kind: 'stacked-strips', closed: true, analysisWidth: w, analysisHeight: h } });
    }
    if (log) log(`page-layout: ${panels.length} proven horizontal strips`);
    return panels;
  }
  function analyze(img, log) {
    const width = img.naturalWidth || img.width, height = img.naturalHeight || img.height;
    if (!width || !height) return [];
    const key = `${img.currentSrc || img.src || ''}:${width}:${height}`, known = cache.get(img);
    if (known && known.key === key) return known.panels;
    const scale = Math.min(1, 900 / Math.max(width, height)), w = Math.max(1, Math.round(width * scale)), h = Math.max(1, Math.round(height * scale));
    const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true }); ctx.drawImage(img, 0, 0, w, h);
    const panels = analyzeRGBA(ctx.getImageData(0, 0, w, h).data, w, h, log);
    cache.set(img, { key, panels }); return panels;
  }
  return { analyze, analyzeRGBA };
})();
if (typeof window !== 'undefined') window.PanelPageLayout = PanelPageLayout;
if (typeof module !== 'undefined' && module.exports) module.exports = PanelPageLayout;
