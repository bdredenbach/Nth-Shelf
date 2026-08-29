// ================================================================
// NTH SHELF — V72
// EXPERIMENT: SUSTAINED GUTTER / REGION MEMBERSHIP
// BUILD: V72 — evidence-weighted gutter enclosure
// ================================================================
// TRUE CLEAN EXPERIMENT: this file contains only the active V72 gutter test.
// No legacy panel detector, hierarchy, child/parent selection, recursive
// partitioning, black-border recovery, old gutter-grid detector, or fallback.
//
// V72 change from V70/V71:
//   - A gutter is treated as a sustained separator zone, not a particular
//     pixel appearance.
//   - Four-sided closure is NOT required.
//   - Opposing strong gutter zones can establish a panel band.
//   - Other sides are added only when their evidence is credible.
//   - Candidate evidence is kept nearest-first; strong distant artwork edges
//     do not automatically win.
// ================================================================

const PanelDetect = {
  findPanelByGutter(img, relX, relY, log) {
    const started = performance.now();
    if (!img || !(img.naturalWidth || img.width) || !(img.naturalHeight || img.height)) return null;

    const srcW = img.naturalWidth || img.width;
    const srcH = img.naturalHeight || img.height;
    const scale = Math.min(1, 1400 / Math.max(srcW, srcH));
    const w = Math.max(48, Math.round(srcW * scale));
    const h = Math.max(48, Math.round(srcH * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, w, h);

    let data;
    try {
      data = ctx.getImageData(0, 0, w, h).data;
    } catch (e) {
      if (log) log(`[V72] IMAGE READ ERROR ${e?.message || e}`);
      return null;
    }

    const n = w * h;
    const lum = new Float32Array(n);
    const chr = new Float32Array(n);
    const rr = new Uint8Array(n);
    const gg = new Uint8Array(n);
    const bb = new Uint8Array(n);

    for (let i = 0, p = 0; i < n; i++, p += 4) {
      const r = data[p], g = data[p + 1], b = data[p + 2];
      rr[i] = r; gg[i] = g; bb[i] = b;
      lum[i] = 0.299 * r + 0.587 * g + 0.114 * b;
      chr[i] = Math.max(r, g, b) - Math.min(r, g, b);
    }

    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const at = (x, y) => y * w + x;
    const px = clamp(Math.round(relX * (w - 1)), 3, w - 4);
    const py = clamp(Math.round(relY * (h - 1)), 3, h - 4);

    if (log) {
      log(`[V72] TAP x=${relX.toFixed(4)} y=${relY.toFixed(4)} px=${px} py=${py}`);
      log(`[V72] SUSTAINED GUTTER PATH — clean image/tap only`);
      log(`[V72] IMAGE ${w}x${h}`);
    }

    function transition(x1, y1, x2, y2) {
      x1 = clamp(Math.round(x1), 0, w - 1); y1 = clamp(Math.round(y1), 0, h - 1);
      x2 = clamp(Math.round(x2), 0, w - 1); y2 = clamp(Math.round(y2), 0, h - 1);
      const a = at(x1, y1), b = at(x2, y2);
      const dr = rr[a] - rr[b], dg = gg[a] - gg[b], db = bb[a] - bb[b];
      const rgb = Math.sqrt(dr * dr + dg * dg + db * db) / 441.673;
      const ld = Math.abs(lum[a] - lum[b]) / 255;
      const cd = Math.abs(chr[a] - chr[b]) / 255;
      return 0.48 * rgb + 0.34 * ld + 0.18 * cd;
    }

    function localContrastAlongNormal(x, y, nx, ny, tangentRadius) {
      // Sample a long tangent span. A true gutter tends to keep separating
      // the two regions over distance; an isolated artwork edge usually does not.
      const samples = [];
      const count =  nineCount(tangentRadius);
      for (let i = 0; i < count; i++) {
        const t = count === 1 ? 0 : -tangentRadius + (2 * tangentRadius * i) / (count - 1);
        const cx = x - ny * t;
        const cy = y + nx * t;
        const inner = Math.max(3, Math.round(tangentRadius * 0.025));
        const outer = Math.max(6, Math.round(tangentRadius * 0.045));
        samples.push(transition(cx - nx * inner, cy - ny * inner, cx + nx * outer, cy + ny * outer));
      }
      const sorted = samples.slice().sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)];
      const coverage = samples.filter(v => v >= 0.055).length / samples.length;
      const strongCoverage = samples.filter(v => v >= 0.11).length / samples.length;
      const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
      return { median, mean, coverage, strongCoverage, samples };
    }

    function nineCount(r) {
      if (r <= 18) return 7;
      if (r <= 40) return 9;
      if (r <= 80) return 13;
      return 17;
    }

    function gutterCandidate(direction, d) {
      let nx = 0, ny = 0;
      if (direction === "TOP") ny = -1;
      if (direction === "BOTTOM") ny = 1;
      if (direction === "LEFT") nx = -1;
      if (direction === "RIGHT") nx = 1;
      const tx = -ny, ty = nx;
      const x = px + nx * d;
      const y = py + ny * d;
      const tangentRadius = clamp(Math.round(Math.min(w, h) * 0.075), 18, 105);
      const q = localContrastAlongNormal(x, y, nx, ny, tangentRadius);

      // Also test a broader gutter zone: the transition is sampled at several
      // normal offsets rather than assuming the gutter is a one-pixel line.
      const zoneOffsets = [0, 4, 8, 14];
      const zoneValues = [];
      for (const off of zoneOffsets) {
        const xx = x + nx * off;
        const yy = y + ny * off;
        zoneValues.push(transition(xx - nx * 5, yy - ny * 5, xx + nx * 12, yy + ny * 12));
      }
      zoneValues.sort((a, b) => a - b);
      const zoneMedian = zoneValues[Math.floor(zoneValues.length / 2)];

      // V72 deliberately has a lower acceptance floor than V71. Continuity
      // is the primary evidence; no "four sides or nothing" gate exists.
      const continuity = 0.52 * q.coverage + 0.28 * q.strongCoverage + 0.20 * Math.min(1, q.median / 0.18);
      const score = 0.50 * continuity + 0.25 * Math.min(1, q.mean / 0.20) + 0.25 * Math.min(1, zoneMedian / 0.20);
      return { direction, d, x, y, nx, ny, tx, ty, tangentRadius, ...q, zoneMedian, continuity, score };
    }

    const directions = [
      ["TOP", -1, py],
      ["BOTTOM", 1, h - 1 - py],
      ["LEFT", -1, px],
      ["RIGHT", 1, w - 1 - px]
    ];

    function findCandidates(direction, maxD) {
      const step = Math.max(3, Math.round(Math.min(w, h) / 300));
      const candidates = [];
      let run = 0;
      let runBest = null;
      const relaxed = [];

      for (let d = Math.max(8, step * 2); d <= maxD - 5; d += step) {
        const c = gutterCandidate(direction, d);
        const convincing = c.coverage >= 0.46 && c.score >= 0.22 && c.median >= 0.045;
        const veryGood = c.coverage >= 0.60 && c.score >= 0.30 && c.median >= 0.065;
        if (convincing) {
          run++;
          if (!runBest || c.score > runBest.score) runBest = c;
          if (veryGood || run >= 2) {
            candidates.push(runBest);
            // Keep searching, but only collect a few separated zones. This
            // preserves nearest-first evidence without globally selecting the
            // strongest far-away edge.
            run = 0;
            runBest = null;
          }
        } else {
          if (runBest && run >= 2) candidates.push(runBest);
          run = 0;
          runBest = null;
          if (c.coverage >= 0.38 && c.score >= 0.18) relaxed.push(c);
        }
        if (candidates.length >= 5) break;
      }

      // If strict sustained evidence found nothing, keep the best relaxed
      // candidate near the tap. This is a targeted relaxation, not a fallback
      // to any legacy detector.
      if (!candidates.length && relaxed.length) {
        relaxed.sort((a, b) => a.d - b.d || b.score - a.score);
        candidates.push(relaxed[0]);
      }

      candidates.sort((a, b) => a.d - b.d);
      return candidates.slice(0, 5);
    }

    const sideCandidates = {};
    for (const [direction, , maxD] of directions) {
      sideCandidates[direction] = findCandidates(direction, maxD);
      if (log) {
        const text = sideCandidates[direction].map(c => `${c.d.toFixed(0)}:${c.score.toFixed(2)}`).join(",") || "none";
        log(`[V72] ${direction} candidates=${text}`);
      }
    }

    const top = sideCandidates.TOP;
    const bottom = sideCandidates.BOTTOM;
    const left = sideCandidates.LEFT;
    const right = sideCandidates.RIGHT;

    // Opposing gutters are the primary evidence. We score pairs by separation
    // consistency and proximity. We do not require all four sides.
    function pairScore(a, b) {
      if (!a || !b) return -Infinity;
      const separation = a.d + b.d;
      if (separation < 18) return -Infinity;
      const balance = 1 - Math.min(1, Math.abs(a.d - b.d) / Math.max(20, separation));
      const evidence = 0.5 * a.score + 0.5 * b.score;
      return 0.68 * evidence + 0.20 * balance + 0.12 * Math.max(0, 1 - separation / Math.max(w, h));
    }

    function bestPair(aList, bList) {
      let best = null;
      for (const a of aList) for (const b of bList) {
        const score = pairScore(a, b);
        if (!best || score > best.score) best = { a, b, score };
      }
      return best;
    }

    const verticalPair = bestPair(top, bottom);
    const horizontalPair = bestPair(left, right);

    if (log) {
      log(`[V72] VERTICAL GUTTER PAIR ${verticalPair ? `score=${verticalPair.score.toFixed(3)} T=${verticalPair.a.d.toFixed(0)} B=${verticalPair.b.d.toFixed(0)}` : "none"}`);
      log(`[V72] HORIZONTAL GUTTER PAIR ${horizontalPair ? `score=${horizontalPair.score.toFixed(3)} L=${horizontalPair.a.d.toFixed(0)} R=${horizontalPair.b.d.toFixed(0)}` : "none"}`);
    }

    if (!verticalPair && !horizontalPair) {
      if (log) log(`[V72] NO SUSTAINED GUTTER ENCLOSURE — no opposing gutter evidence`);
      return null;
    }

    // Start with the strongest opposing pair. If both axes have credible pairs,
    // use both. If only one axis exists, infer the other extent from the nearest
    // credible side candidates rather than requiring a perfect four-sided frame.
    let x0, x1, y0, y1;
    let evidenceMode;

    const vGood = verticalPair && verticalPair.score >= 0.235;
    const hGood = horizontalPair && horizontalPair.score >= 0.235;

    if (hGood) {
      x0 = px - horizontalPair.a.d;
      x1 = px + horizontalPair.b.d;
    } else {
      const l = left[0], r = right[0];
      x0 = l ? px - l.d : 0;
      x1 = r ? px + r.d : w - 1;
    }

    if (vGood) {
      y0 = py - verticalPair.a.d;
      y1 = py + verticalPair.b.d;
    } else {
      const t = top[0], b = bottom[0];
      y0 = t ? py - t.d : 0;
      y1 = b ? py + b.d : h - 1;
    }

    // If only one axis is strongly established, avoid returning a tiny region
    // created by a lone artwork candidate on the other axis. The weak axis is
    // expanded conservatively to the page edge only when no opposing evidence
    // exists. This keeps the panel band useful for the test rather than failing.
    if (!hGood && !left.length && !right.length) {
      x0 = 0; x1 = w - 1;
      evidenceMode = "vertical-gutter-band";
    }
    if (!vGood && !top.length && !bottom.length) {
      y0 = 0; y1 = h - 1;
      evidenceMode = "horizontal-gutter-band";
    }
    if (hGood && vGood) evidenceMode = "two-axis-gutter-enclosure";
    else if (!evidenceMode) evidenceMode = "one-axis-gutter-enclosure";

    x0 = clamp(Math.floor(x0 - 2), 0, w - 1);
    x1 = clamp(Math.ceil(x1 + 2), 1, w);
    y0 = clamp(Math.floor(y0 - 2), 0, h - 1);
    y1 = clamp(Math.ceil(y1 + 2), 1, h);

    if (x1 <= x0 || y1 <= y0 || x1 - x0 < 20 || y1 - y0 < 20) {
      if (log) log(`[V72] INVALID REGION ${x1 - x0}x${y1 - y0}`);
      return null;
    }

    // Reject an implausibly tiny sliver unless both axes have strong evidence.
    const area = ((x1 - x0) / w) * ((y1 - y0) / h);
    const combined = (vGood ? verticalPair.score : 0) + (hGood ? horizontalPair.score : 0);
    if (area < 0.008 && combined < 0.58) {
      if (log) log(`[V72] REGION REJECTED — implausibly small area=${area.toFixed(4)}`);
      return null;
    }

    const panel = {
      x: clamp(x0 / w, 0, 1),
      y: clamp(y0 / h, 0, 1),
      w: clamp((x1 - x0) / w, 0, 1),
      h: clamp((y1 - y0) / h, 0, 1),
      __v72Method: evidenceMode,
      __v72Score: Math.max(vGood ? verticalPair.score : 0, hGood ? horizontalPair.score : 0),
      __v72Evidence: {
        verticalPair: verticalPair ? { top: verticalPair.a.d, bottom: verticalPair.b.d, score: verticalPair.score } : null,
        horizontalPair: horizontalPair ? { left: horizontalPair.a.d, right: horizontalPair.b.d, score: horizontalPair.score } : null,
        candidates: Object.fromEntries(Object.entries(sideCandidates).map(([k, list]) => [k, list.map(c => ({ d: c.d, score: c.score, coverage: c.coverage, median: c.median }))]))
      }
    };

    if (log) {
      log(`[V72] GUTTER REGION ACCEPTED mode=${evidenceMode}`);
      log(`[V72] FINAL x=${panel.x.toFixed(4)} y=${panel.y.toFixed(4)} w=${panel.w.toFixed(4)} h=${panel.h.toFixed(4)}`);
      log(`[V72] ELAPSED ${Math.round(performance.now() - started)}ms`);
    }

    return panel;
  }
};

window.PanelDetect = PanelDetect;
