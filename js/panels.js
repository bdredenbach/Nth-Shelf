// NTH SHELF V73 — STABLE GUTTER BASELINE / TAP SELECTION
// V73 intentionally restores the simple v2.76 gutter-scanning detector as the sole panel detector.
// The experiment is tap-aware only at selection time: detect the stable gutter-separated regions,
// then select the one containing the exact tap. No V1-V72 panel detector logic is used.

// panels.js — detects panel boundaries on a comic page so double-tap zoom
// can snap to the actual panel instead of a geometric quadrant.
//
// Approach: gutter-scanning by uniformity, not brightness. Comic pages are
// almost always laid out as rows of panels separated by a gutter, with
// panels within a row separated by further gutters — but a gutter isn't
// always white. Some comics use a black or colored divider instead (verified
// against a real scan: a solid black band between panels measured as HIGH
// "ink" density under a brightness-based test, indistinguishable from actual
// line art, so gutter detection silently failed on every page).
//
// The format-agnostic signal is uniformity: a gutter — white, black, or any
// flat color — is a row/column of nearly-identical pixels (near-zero
// luminance variance), while actual panel content (line art, text, color,
// gradients) varies a lot. We measure per-row and per-column luminance
// standard deviation and treat a sustained low-variance band as a gutter,
// regardless of what color it happens to be.

const PanelDetect = {
  // V76 — GUTTER GEOMETRY TEST
  // Starts from the known-good V73 stable baseline, but deliberately changes
  // the gutter signal. We do NOT ask whether the gutter has a particular
  // color or low pixel variance. Instead we look for the geometry of a gap:
  // two long, roughly parallel boundary edges with a sustained low-edge zone
  // between them. The resulting gutter lines are then used to partition the
  // page. This is a clean experiment; V74/V75 logic is not present here.
  detect(imgUrl, log) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        try { resolve(this._analyze(img, log)); }
        catch (err) {
          console.warn("Panel detection failed:", err);
          if (log) log(`ERROR: ${err.message}`);
          resolve([]);
        }
      };
      img.onerror = () => resolve([]);
      img.src = imgUrl;
    });
  },

  _analyze(img, log) {
    const maxDim = 900;
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));
    if (log) log(`source=${img.width}x${img.height} downscaled=${w}x${h}`);

    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h).data;

    const lum = new Float32Array(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        lum[y * w + x] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      }
    }

    // Gradient magnitude. The detector cares about boundary geometry, not
    // whether the boundary is black, white, colored, or textured.
    const grad = new Float32Array(w * h);
    let sum = 0, count = 0;
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const gx = Math.abs(lum[y * w + x + 1] - lum[y * w + x - 1]);
        const gy = Math.abs(lum[(y + 1) * w + x] - lum[(y - 1) * w + x]);
        const g = Math.sqrt(gx * gx + gy * gy);
        grad[y * w + x] = g;
        sum += g; count++;
      }
    }
    const meanGrad = sum / Math.max(1, count);
    const edgeThreshold = Math.max(12, meanGrad * 2.6);
    if (log) log(`V76 mean-gradient=${meanGrad.toFixed(1)} edge-threshold=${edgeThreshold.toFixed(1)}`);

    // Edge density for each row/column. A gutter is expected to have a
    // relatively quiet band, with boundary edges on either side.
    const rowDensity = new Float32Array(h);
    const colDensity = new Float32Array(w);
    for (let y = 1; y < h - 1; y++) {
      let n = 0;
      for (let x = 1; x < w - 1; x++) if (grad[y * w + x] >= edgeThreshold) n++;
      rowDensity[y] = n / Math.max(1, w - 2);
    }
    for (let x = 1; x < w - 1; x++) {
      let n = 0;
      for (let y = 1; y < h - 1; y++) if (grad[y * w + x] >= edgeThreshold) n++;
      colDensity[x] = n / Math.max(1, h - 2);
    }

    const hGutters = findGutterBands(rowDensity, h, true, log);
    const vGutters = findGutterBands(colDensity, w, false, log);
    if (log) {
      log(`V76 horizontal gutter bands=${hGutters.length}: ${JSON.stringify(hGutters.map(g => [g.a,g.b,Number(g.score.toFixed(2))]))}`);
      log(`V76 vertical gutter bands=${vGutters.length}: ${JSON.stringify(vGutters.map(g => [g.a,g.b,Number(g.score.toFixed(2))]))}`);
    }

    // Partition the page using the detected gutter bands. Unlike V73, a
    // gutter only needs to be geometrically sustained across a useful span;
    // it does not need to be uniform across the whole page.
    const rowCuts = [0, ...hGutters.map(g => Math.round((g.a + g.b) / 2)), h];
    const rows = uniqueSorted(rowCuts).filter((v, i, a) => i === 0 || v - a[i - 1] >= Math.max(2, Math.round(h * 0.01)));
    const panels = [];

    for (let r = 0; r < rows.length - 1; r++) {
      const sy = rows[r], ey = rows[r + 1];
      if (ey - sy < h * 0.05) continue;
      const rowLocalCols = detectLocalVerticalCuts(grad, w, h, sy, ey, edgeThreshold);
      const cuts = [0, ...rowLocalCols, w];
      const cols = uniqueSorted(cuts);
      for (let c = 0; c < cols.length - 1; c++) {
        const sx = cols[c], ex = cols[c + 1];
        if (ex - sx < w * 0.05) continue;
        panels.push({ x: sx / w, y: sy / h, w: (ex - sx) / w, h: (ey - sy) / h });
      }
    }

    const cleaned = collapseSingleOrNoise(panels, w, h);
    if (log) log(`V76 geometry reconstructed panels=${cleaned.length}`);
    return cleaned;
  },
};

function findGutterBands(density, total, horizontal, log) {
  const candidates = [];
  const minBand = Math.max(2, Math.round(total * 0.004));
  const maxBand = Math.max(minBand + 1, Math.round(total * 0.045));
  // A candidate band is a low-edge corridor bracketed by stronger edge rows.
  // This is intentionally geometry-first: no RGB/brightness/variance test.
  const low = 0.055;
  const flank = 0.11;
  for (let center = 2; center < total - 2; center++) {
    for (let len = minBand; len <= maxBand; len++) {
      const a = Math.max(1, center - Math.floor(len / 2));
      const b = Math.min(total - 2, a + len);
      let quiet = 0, qn = 0;
      for (let i = a; i < b; i++) { quiet += density[i]; qn++; }
      const q = quiet / Math.max(1, qn);
      const left = density[Math.max(0, a - Math.max(2, Math.round(total * 0.006)))];
      const right = density[Math.min(total - 1, b + Math.max(2, Math.round(total * 0.006)))];
      const flankScore = Math.min(left, right);
      if (q <= low && flankScore >= flank) {
        candidates.push({ a, b, score: flankScore / Math.max(0.001, q + 0.01) });
        break;
      }
    }
  }
  candidates.sort((x,y) => y.score - x.score);
  const chosen = [];
  for (const c of candidates) {
    if (chosen.some(g => Math.abs(((g.a+g.b)/2)-((c.a+c.b)/2)) < Math.max(3, (c.b-c.a)))) continue;
    chosen.push(c);
  }
  chosen.sort((a,b) => a.a - b.a);
  return chosen.slice(0, 12);
}

function detectLocalVerticalCuts(grad, w, h, sy, ey, threshold) {
  const density = new Float32Array(w);
  for (let x = 1; x < w - 1; x++) {
    let n = 0;
    for (let y = sy + 1; y < ey - 1; y++) if (grad[y * w + x] >= threshold) n++;
    density[x] = n / Math.max(1, ey - sy - 2);
  }
  const cuts = [];
  const minRun = Math.max(2, Math.round(w * 0.004));
  const maxRun = Math.max(minRun + 1, Math.round(w * 0.045));
  for (let x = 2; x < w - 2; x++) {
    for (let len = minRun; len <= maxRun; len++) {
      const a = Math.max(1, x - Math.floor(len / 2));
      const b = Math.min(w - 2, a + len);
      let quiet = 0, n = 0;
      for (let i = a; i < b; i++) { quiet += density[i]; n++; }
      const q = quiet / Math.max(1,n);
      const flank = Math.min(density[Math.max(0,a-2)], density[Math.min(w-1,b+2)]);
      if (q <= 0.055 && flank >= 0.11) { cuts.push(Math.round((a+b)/2)); break; }
    }
  }
  return uniqueSorted(cuts);
}

function uniqueSorted(values) {
  return [...new Set(values.map(v => Math.round(v)))].sort((a,b) => a-b);
}

function collapseSingleOrNoise(panels, w, h) {
  if (panels.length <= 1) return [];
  // Remove obvious slivers, but otherwise preserve the geometry found by the
  // gutter test. Do not invoke any historical panel hierarchy logic.
  return panels.filter(p => p.w >= 0.05 && p.h >= 0.05);
}

window.PanelDetect = PanelDetect;
