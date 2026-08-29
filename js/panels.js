// ================================================================
// NTH SHELF — V70
// EXPERIMENT: TRUE CLEAN GUTTER BOUNDARY
// BUILD: V70 — isolated gutter-boundary detector
// ================================================================
// IMPORTANT: This file intentionally contains NO legacy panel detector.
// There is no border-grid detector, region detector, hierarchy logic,
// recursive partitioner, black-border recovery, old gutter-grid recovery,
// candidate tribunal, or tap rectangle selector.
//
// V70 receives only the verified visible page image and exact tap coordinate.
// Its sole job is to identify the visual panel region enclosed by the gutter.

const PanelDetect = {
  findPanelByGutter(img, relX, relY, log) {
    // ================================================================
    // V71 — SUSTAINED GUTTER / REGION MEMBERSHIP
    // ================================================================
    // V71 deliberately does NOT trace arbitrary local edges.  It asks a
    // narrower question: where does the visual region containing the tap
    // encounter a sustained gutter zone?  Cardinal searches are retained,
    // but a candidate must persist laterally across a meaningful span and
    // must look like a separator zone rather than a single artwork edge.
    //
    // The detector hierarchy remains completely outside this decision.
    // The output is still a bounding rectangle because that is what the
    // existing zoom renderer consumes.
    // ================================================================
    const started = performance.now();
    if (!img || !(img.naturalWidth || img.width) || !(img.naturalHeight || img.height)) return null;

    const srcW = img.naturalWidth || img.width;
    const srcH = img.naturalHeight || img.height;
    const scale = Math.min(1, 1500 / Math.max(srcW, srcH));
    const w = Math.max(48, Math.round(srcW * scale));
    const h = Math.max(48, Math.round(srcH * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, w, h);

    let data;
    try { data = ctx.getImageData(0, 0, w, h).data; }
    catch (e) {
      if (log) log(`[V71] IMAGE READ ERROR ${e?.message || e}`);
      return null;
    }

    const n = w * h;
    const lum = new Float32Array(n);
    const chroma = new Float32Array(n);
    const rr = new Uint8Array(n), gg = new Uint8Array(n), bb = new Uint8Array(n);
    for (let i = 0, p = 0; i < n; i++, p += 4) {
      const r = data[p], g = data[p + 1], b = data[p + 2];
      rr[i] = r; gg[i] = g; bb[i] = b;
      lum[i] = 0.299 * r + 0.587 * g + 0.114 * b;
      chroma[i] = Math.max(r, g, b) - Math.min(r, g, b);
    }

    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const at = (x, y) => Math.round(y) * w + Math.round(x);
    const px = clamp(Math.round(relX * (w - 1)), 4, w - 5);
    const py = clamp(Math.round(relY * (h - 1)), 4, h - 5);

    if (log) {
      log(`[V71] TAP x=${relX.toFixed(4)} y=${relY.toFixed(4)} px=${px} py=${py}`);
      log(`[V71] SUSTAINED GUTTER / REGION MEMBERSHIP — legacy detector disabled`);
      log(`[V71] IMAGE ${w}x${h}`);
    }

    const diff = (a, b) => {
      const dr = rr[a] - rr[b], dg = gg[a] - gg[b], db = bb[a] - bb[b];
      const rgb = Math.sqrt(dr * dr + dg * dg + db * db) / 441.673;
      const ld = Math.abs(lum[a] - lum[b]) / 255;
      const cd = Math.abs(chroma[a] - chroma[b]) / 255;
      return 0.46 * rgb + 0.36 * ld + 0.18 * cd;
    };

    const sample = (x, y) => {
      x = clamp(Math.round(x), 0, w - 1); y = clamp(Math.round(y), 0, h - 1);
      return at(x, y);
    };

    // Local edge/texture estimate.  A gutter often has lower internal
    // structure than comic artwork, but V71 treats this only as supporting
    // evidence; it never assumes a particular gutter color.
    function localVariation(x, y, axis) {
      const values = [];
      const along = axis === 'h' ? [ -10,-7,-4,0,4,7,10 ] : [ -10,-7,-4,0,4,7,10 ];
      for (const o of along) {
        const a = axis === 'h' ? sample(x + o, y - 2) : sample(x - 2, y + o);
        const b = axis === 'h' ? sample(x + o, y + 2) : sample(x + 2, y + o);
        values.push(diff(a, b));
      }
      const mean = values.reduce((s,v) => s + v, 0) / values.length;
      const sorted = values.slice().sort((a,b) => a-b);
      return { mean, median: sorted[3], edgeCoverage: values.filter(v => v > 0.075).length / values.length };
    }

    // Evaluate a candidate crossing using a lateral run centered on the tap.
    // Two spans are tested. A real gutter gets rewarded for surviving a long
    // run; a short artwork contour generally cannot.
    function candidateQuality(axis, d, dir) {
      const nx = axis === 'h' ? 0 : dir;
      const ny = axis === 'h' ? dir : 0;
      const bx = px + nx * d, by = py + ny * d;
      const tangentSpan = clamp(Math.round(Math.max(18, Math.min(
        axis === 'h' ? w * 0.42 : h * 0.42,
        d * 1.15 + Math.min(w, h) * 0.10
      ))), 18, 520);

      const spans = [
        Math.round(tangentSpan * 0.55),
        tangentSpan,
        Math.round(tangentSpan * 1.35)
      ];
      const spanResults = [];

      for (const span of spans) {
        const samples = [];
        const count = 15;
        for (let i = 0; i < count; i++) {
          const t = (i / (count - 1)) * 2 - 1;
          const tx = axis === 'h' ? t * span : 0;
          const ty = axis === 'v' ? t * span : 0;
          const cx = bx + tx, cy = by + ty;
          const inside = sample(cx - nx * 4, cy - ny * 4);
          const outside = sample(cx + nx * 5, cy + ny * 5);
          const crossing = diff(inside, outside);
          const nearInside = diff(sample(cx - nx * 9, cy - ny * 9), inside);
          const nearOutside = diff(outside, sample(cx + nx * 9, cy + ny * 9));
          samples.push({ crossing, nearInside, nearOutside, x: cx, y: cy });
        }

        const cross = samples.map(s => s.crossing).sort((a,b) => a-b);
        const median = cross[7];
        const mean = cross.reduce((s,v) => s+v, 0) / cross.length;
        const coverage = samples.filter(s => s.crossing >= 0.085).length / samples.length;
        const strong = samples.filter(s => s.crossing >= 0.15).length / samples.length;

        // A gutter should not merely be a transition.  Look just outside the
        // crossing for a short sustained zone with lower internal edge density.
        const zone = [];
        for (let z = 4; z <= 24; z += 4) {
          let v = 0, e = 0;
          for (let i = 2; i < samples.length - 2; i++) {
            const s = samples[i];
            const vx = s.x + nx * z, vy = s.y + ny * z;
            const lv = localVariation(vx, vy, axis);
            v += lv.median;
            e += lv.edgeCoverage;
          }
          zone.push({ v: v / (samples.length - 4), e: e / (samples.length - 4) });
        }
        const bestZone = zone.reduce((best, z) => z.v < best.v ? z : best, zone[0]);
        const lowTexture = clamp((0.105 - bestZone.v) / 0.105, 0, 1);
        const lowEdges = clamp((0.46 - bestZone.e) / 0.46, 0, 1);
        const gutterZone = 0.62 * lowTexture + 0.38 * lowEdges;

        // Check whether the visual regime on the tap side remains stable over
        // the same lateral run. This protects against a strong local artwork
        // edge that only happens to cross the ray.
        const insideChanges = samples.map(s => s.nearInside);
        const insideMedian = insideChanges.slice().sort((a,b) => a-b)[7];
        const insideNoise = clamp(insideMedian / 0.18, 0, 1);
        const regionStability = 1 - insideNoise;

        const q =
          0.34 * median +
          0.16 * mean +
          0.20 * coverage +
          0.08 * strong +
          0.14 * gutterZone +
          0.08 * regionStability;

        spanResults.push({ span, q, median, mean, coverage, strong, gutterZone, regionStability });
      }

      // Prefer the longest span that remains convincing; if it fails, allow a
      // shorter span to rescue a genuinely narrow/irregular panel.
      spanResults.sort((a,b) => b.span - a.span);
      const longGood = spanResults.find(r => r.coverage >= 0.60 && r.median >= 0.075 && r.gutterZone >= 0.16);
      const best = longGood || spanResults.reduce((a,b) => a.q > b.q ? a : b);
      const convincing = best.q >= 0.145 && best.coverage >= 0.53 && best.median >= 0.065;
      return { ...best, convincing, x: bx, y: by, axis, dir, d };
    }

    function searchSide(axis, dir) {
      const maxD = axis === 'h'
        ? (dir < 0 ? py - 10 : h - 1 - py - 10)
        : (dir < 0 ? px - 10 : w - 1 - px - 10);
      const step = Math.max(3, Math.round(Math.min(w, h) / 300));
      let run = 0;
      let first = null;
      let relaxed = null;

      for (let d = Math.max(12, step * 3); d <= maxD; d += step) {
        const q = candidateQuality(axis, d, dir);
        if (q.convincing) {
          run++;
          if (!first) first = q;
          if (run >= 2) {
            // Nearest sustained gutter wins. Do not continue looking for a
            // stronger/farther boundary.
            return { ...first, sustainedD: d, run };
          }
        } else {
          run = 0;
          if (q.q >= 0.125 && q.coverage >= 0.45) relaxed = q;
        }
      }

      // A relaxed candidate is only used when the strict interpretation did
      // not find anything. It is still nearest-to-farthest.
      return relaxed ? { ...relaxed, relaxed: true, sustainedD: relaxed.d, run: 0 } : null;
    }

    const sides = {
      top: searchSide('h', -1),
      bottom: searchSide('h', 1),
      left: searchSide('v', -1),
      right: searchSide('v', 1)
    };

    for (const [name, q] of Object.entries(sides)) {
      if (log) {
        if (q) log(`[V71] ${name.toUpperCase()} d=${q.d.toFixed(1)} q=${q.q.toFixed(3)} median=${q.median.toFixed(3)} coverage=${q.coverage.toFixed(3)} gutter=${q.gutterZone.toFixed(3)}${q.relaxed ? ' RELAXED' : ''}`);
        else log(`[V71] ${name.toUpperCase()} no sustained gutter found`);
      }
    }

    if (!sides.top || !sides.bottom || !sides.left || !sides.right) {
      if (log) log('[V71] NO PANEL — all four gutter crossings were not established');
      return null;
    }

    // Build the tap-containing rectangle from the four gutter crossings.
    // Unlike V67, we do not recursively split this rectangle. Each side was
    // selected independently from the tap, nearest-to-farthest.
    const x0 = clamp(Math.floor(px + sides.left.nx * sides.left.d - 3), 0, w - 1);
    const x1 = clamp(Math.ceil(px + sides.right.nx * sides.right.d + 3), 1, w);
    const y0 = clamp(Math.floor(py + sides.top.ny * sides.top.d - 3), 0, h - 1);
    const y1 = clamp(Math.ceil(py + sides.bottom.ny * sides.bottom.d + 3), 1, h);
    if (x1 <= x0 || y1 <= y0 || x1 - x0 < 24 || y1 - y0 < 24) {
      if (log) log('[V71] INVALID PANEL BOUNDS');
      return null;
    }

    // Cross-check the four candidate gutters against the opposite dimension.
    // A false local artwork edge is less likely to agree with the full proposed
    // panel width/height than a real panel gutter.
    const width = x1 - x0, height = y1 - y0;
    const spanAgreement = (
      Math.min(1, sides.top.span / Math.max(24, width)) +
      Math.min(1, sides.bottom.span / Math.max(24, width)) +
      Math.min(1, sides.left.span / Math.max(24, height)) +
      Math.min(1, sides.right.span / Math.max(24, height))
    ) / 4;

    const sideScore = (sides.top.q + sides.bottom.q + sides.left.q + sides.right.q) / 4;
    const relaxedCount = [sides.top, sides.bottom, sides.left, sides.right].filter(s => s.relaxed).length;
    const finalScore = sideScore * 0.76 + spanAgreement * 0.24 - relaxedCount * 0.025;

    if (log) {
      log(`[V71] REGION width=${width.toFixed(1)} height=${height.toFixed(1)} spanAgreement=${spanAgreement.toFixed(3)}`);
      log(`[V71] GUTTER SIDE SCORE=${sideScore.toFixed(3)} FINAL=${finalScore.toFixed(3)}`);
    }

    if (finalScore < 0.135 || spanAgreement < 0.20) {
      if (log) log('[V71] GUTTER REGION REJECTED — insufficient sustained separation');
      return null;
    }

    const panel = {
      x: clamp(x0 / w, 0, 1),
      y: clamp(y0 / h, 0, 1),
      w: clamp((x1 - x0) / w, 0, 1),
      h: clamp((y1 - y0) / h, 0, 1),
      __v71Method: 'sustained-gutter-region-membership',
      __v71Score: finalScore,
      __v71Evidence: {
        tap: { x: px / w, y: py / h },
        sides,
        spanAgreement,
        sideScore,
        relaxedCount
      }
    };

    if (log) {
      log(`[V71] GUTTER REGION ACCEPTED`);
      log(`[V71] FINAL x=${panel.x.toFixed(4)} y=${panel.y.toFixed(4)} w=${panel.w.toFixed(4)} h=${panel.h.toFixed(4)}`);
      log(`[V71] METHOD=${panel.__v71Method} elapsed=${Math.round(performance.now() - started)}ms`);
    }
    return panel;
  }
};

window.PanelDetect = PanelDetect;
