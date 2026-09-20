// Conservative proposals from quiet gutters connected to the page exterior.
// PanelClosedFrames repeats its divider, inset, overlap and corner checks
// before any proposal can own a tap.
const PanelGutterFrames = (() => {
  'use strict';
  function proposeRGBA(rgba, w, h, options = {}) {
    if (!Number.isInteger(w) || !Number.isInteger(h) || w < 80 || h < 80 ||
        w > 900 || h > 900 || !rgba || rgba.length !== w * h * 4) return [];
    const pixel = (x, y, c) => rgba[(y * w + x) * 4 + c];
    const border = [];
    for (let x = 0; x < w; x += 3) for (const y of [0, h - 1])
      border.push([0, 1, 2].map(c => pixel(x, y, c)));
    for (let y = 0; y < h; y += 3) for (const x of [0, w - 1])
      border.push([0, 1, 2].map(c => pixel(x, y, c)));
    const rgb = [0, 1, 2].map(c => border.map(p => p[c]).sort((a, b) => a - b)[border.length >> 1]);
    const luminance = rgb[0] * .299 + rgb[1] * .587 + rgb[2] * .114;
    if (luminance < 35 || luminance > 205) return [];

    // Absolute color bounds prevent gradual drift from a gutter into artwork.
    const background = new Uint8Array(w * h), queue = new Int32Array(w * h);
    let size = 0, cursor = 0;
    let matches = i => [0, 1, 2].every(c => Math.abs(rgba[i * 4 + c] - rgb[c]) <= 14);
    if (options.gradient === true) {
      // A tinted background may change brightness across the page. Its palette
      // must come from the actual exterior, with almost uniform chroma. Never
      // grow the palette while flooding: artwork cannot cause color drift.
      const palette = border.filter(p =>
        Math.abs((p[1]-p[0])-(rgb[1]-rgb[0])) < 10 &&
        Math.abs((p[2]-p[0])-(rgb[2]-rgb[0])) < 10);
      if (palette.length / border.length < .97) return [];
      const colors = [...new Map(palette.map(p =>
        [p.map(c => Math.round(c/3)).join(','), p])).values()];
      if (colors.length > 150) return [];
      matches = i => colors.some(p => [0,1,2].every(c => Math.abs(rgba[i*4+c]-p[c]) <= 8));
    }
    function offer(i) {
      if (background[i] || !matches(i)) return;
      background[i] = 1;
      queue[size++] = i;
    }
    for (let x = 0; x < w; x++) { offer(x); offer((h - 1) * w + x); }
    for (let y = 0; y < h; y++) { offer(y * w); offer(y * w + w - 1); }
    while (cursor < size) {
      const i = queue[cursor++], x = i % w, y = i / w | 0;
      if (x) offer(i - 1);
      if (x < w - 1) offer(i + 1);
      if (y) offer(i - w);
      if (y < h - 1) offer(i + w);
    }
    if (size < w * h * .025) return [];
    function at(vertical, p, t) {
      const x = vertical ? p : t, y = vertical ? t : p;
      return x >= 0 && x < w && y >= 0 && y < h ? background[y * w + x] : 0;
    }
    function dark(vertical, p, t) {
      const x = vertical ? p : t, y = vertical ? t : p;
      if (x < 0 || x >= w || y < 0 || y >= h) return false;
      const i = (y * w + x) * 4;
      return rgba[i] * .299 + rgba[i + 1] * .587 + rgba[i + 2] * .114 < 70;
    }
    let overflow = false;
    function rails(vertical, direction) {
      const length = vertical ? h : w, width = vertical ? w : h, groups = [];
      // Browser downsampling can interrupt a quiet-gutter edge for a few
      // pixels even when its printed ink is continuous. Keep a nearby track
      // alive across that short interruption on the gradient route only.
      // The fitted rail, full-side ink/exterior support, corners and interior
      // vetoes below still have to prove the complete frame.
      const maxGap = options.gradient === true ? 6 : 3;
      let active = [];
      for (let t = 0; t < length; t++) {
        const positions = [], next = [];
        for (let p = 2; p < width - 2; p++) {
          if (!at(vertical, p - direction, t) || at(vertical, p, t)) continue;
          if (![0, 1, 2].some(d => dark(vertical, p + direction * d, t))) continue;
          positions.push(p);
        }
        for (const p of positions) {
          let best = null;
          for (const group of active) {
            if (t - group.lastT <= maxGap && Math.abs(group.lastP - p) <= 2 &&
                (!best || Math.abs(group.lastP - p) < Math.abs(best.lastP - p))) best = group;
          }
          if (!best) {
            if (groups.length > 4000) { overflow = true; return []; }
            best = {points: []}; groups.push(best);
          }
          best.points.push([t, p]); best.lastT = t; best.lastP = p; next.push(best);
        }
        active = [...new Set([...next, ...active.filter(group => t - group.lastT < maxGap)])];
      }
      const found = [];
      for (const group of groups) {
        const samples = group.points;
        if (samples.length < Math.max(35, length * .075)) continue;
        const mx = samples.reduce((a, p) => a + p[0], 0) / samples.length;
        const my = samples.reduce((a, p) => a + p[1], 0) / samples.length;
        const denominator = samples.reduce((a, p) => a + (p[0] - mx) ** 2, 0);
        const m = samples.reduce((a, p) => a + (p[0] - mx) * (p[1] - my), 0) / denominator;
        const b = my - m * mx;
        const errors = samples.map(p => Math.abs(p[1] - m * p[0] - b)).sort((a, b) => a - b);
        if (!Number.isFinite(m) || Math.abs(m) > .025 || errors[Math.floor(errors.length * .9)] > 1) continue;
        found.push({m, b, lo: samples[0][0], hi: samples.at(-1)[0]});
      }
      return found;
    }
    const left = rails(true, 1), right = rails(true, -1);
    const top = rails(false, 1), bottom = rails(false, -1);
    if (overflow || [left, right, top, bottom].some(rs => rs.length > 80)) return [];
    const intersect = (a, b) => {
      const x = (b.b + b.m * a.b) / (1 - b.m * a.m);
      return [x, a.m * x + a.b];
    };
    function metrics(quad) {
      const result = [];
      for (let side = 0; side < 4; side++) {
        const a = quad[side], b = quad[(side + 1) % 4];
        const dx = b[0] - a[0], dy = b[1] - a[1], length = Math.hypot(dx, dy);
        const nx = dy / length, ny = -dx / length;
        let ink = 0, outer = 0, total = 0;
        for (let t = 4; t < length - 4; t++) {
          const x = a[0] + dx * t / length, y = a[1] + dy * t / length;
          let darkHere = false;
          for (let d = -1; d <= 2; d++) {
            const xx = Math.round(x - nx * d), yy = Math.round(y - ny * d);
            if (xx < 0 || xx >= w || yy < 0 || yy >= h) continue;
            const i = (yy * w + xx) * 4;
            if (.299 * rgba[i] + .587 * rgba[i + 1] + .114 * rgba[i + 2] < 70) darkHere = true;
          }
          ink += darkHere;
          let back = 0;
          for (let d = 2; d <= 5; d++) {
            const xx = Math.round(x + nx * d), yy = Math.round(y + ny * d);
            if (xx >= 0 && xx < w && yy >= 0 && yy < h && background[yy * w + xx]) back++;
          }
          outer += back >= 2; total++;
        }
        result.push([ink / total, outer / total]);
      }
      return result;
    }
    const found = [];
    for (const l of left) for (const r of right) {
      const lo = Math.max(l.lo, r.lo), hi = Math.min(l.hi, r.hi);
      if (hi - lo < h * .08 || r.b - l.b < w * .12) continue;
      function choose(rs, position) {
        const mid = (l.b + r.b) / 2;
        return rs.filter(a => Math.abs(a.m * mid + a.b - position) <= 8 &&
          Math.min(a.hi, r.b) - Math.max(a.lo, l.b) > (r.b - l.b) * .35)
          .sort((a, b) => Math.abs(a.m * mid + a.b - position) - Math.abs(b.m * mid + b.b - position))[0] ||
          {m: 0, b: position, inferred: true};
      }
      function complete(rs, opposite, position) {
        const own = choose(rs, position);
        if (!own.inferred) return own;
        // A continuation must join an observed endpoint, be no longer than
        // its measured donor, and agree with both side-rail endpoints.
        const candidates = opposite.filter(a => a.hi - a.lo >= r.b - l.b &&
          Math.min(Math.abs(a.hi - l.b), Math.abs(a.lo - r.b)) <= 5 &&
          Math.max(Math.abs(a.m * l.b + a.b - position), Math.abs(a.m * r.b + a.b - position)) <= 5);
        return candidates[0] || own;
      }
      const t = complete(top, bottom, lo), b = complete(bottom, top, hi);
      const q = [intersect(t, l), intersect(t, r), intersect(b, r), intersect(b, l)];
      if (q.some(p => p[0] < 1 || p[0] > w - 2 || p[1] < 1 || p[1] > h - 2)) continue;
      const ms = metrics(q);
      if (ms.some(m => m[0] < .97) || ms.filter(m => m[1] > .6).length < 3) continue;
      // Refining an existing composite requires exterior-connected quiet
      // background on all four sides, not a merely enclosed artwork inset.
      if (options.gradient === true && ms.some(m => m[1] < .95)) continue;
      const area = (r.b - l.b) * (hi - lo) / (w * h);
      if (area < .02 || area > .65) continue;
      // Connected gutter inside a proposal indicates a likely neighbor union.
      let gaps = 0, inside = 0;
      for (let y = Math.ceil(Math.max(q[0][1], q[1][1]) + 3); y < Math.min(q[2][1], q[3][1]) - 3; y++)
        for (let x = Math.ceil(Math.max(q[0][0], q[3][0]) + 3); x < Math.min(q[1][0], q[2][0]) - 3; x++) {
          inside++; gaps += background[y * w + x];
        }
      if (gaps / inside > .008) continue;
      found.push({q, ms, area, fits: [t, b, l, r], color: rgb});
      if (found.length > 40) return [];
    }
    return found;
  }
  return {proposeRGBA};
})();
if (typeof module !== 'undefined') module.exports = PanelGutterFrames;
