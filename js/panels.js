// NTH SHELF V74 — STABLE GUTTER / LOCAL SEGMENTS
// V74 keeps the compact v2.76 stable-gutter philosophy, but replaces whole-row/
// whole-column uniformity with LOCAL, sustained gutter segments. A gutter does
// not need to span the entire page. We detect long continuous low-texture zones,
// validate them against neighboring content, then reconstruct tap-containing
// regions from compatible horizontal/vertical separators.
// No V1-V73 experimental panel detector is used here.

const PanelDetect = {
  detect(imgUrl, log) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        try { resolve(this._analyze(img, log)); }
        catch (err) {
          console.warn("V74 panel detection failed:", err);
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
    if (log) log(`V74 source=${img.width}x${img.height} downscaled=${w}x${h}`);

    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h).data;

    const lum = new Float32Array(w * h);
    for (let i = 0, p = 0; i < data.length; i += 4, p++) {
      lum[p] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    }
    const at = (x, y) => lum[y * w + x];

    // V74 idea: estimate how much of a local horizontal/vertical window is
    // behaving like a sustained, low-texture separator. This is deliberately
    // local: a gutter may stop at another panel boundary and therefore cannot
    // be expected to make an entire page row/column flat.
    const winX = Math.max(7, Math.round(w * 0.025));
    const winY = Math.max(7, Math.round(h * 0.025));
    const sampleStepX = Math.max(1, Math.round(w / 450));
    const sampleStepY = Math.max(1, Math.round(h / 450));

    const rowSignals = [];
    const rowThreshold = 18;
    const localRunMin = Math.max(6, Math.round(w * 0.035));

    for (let y = 0; y < h; y++) {
      const yy0 = Math.max(0, y - 2), yy1 = Math.min(h - 1, y + 2);
      const flags = [];
      let run = 0, bestRun = 0, bestStart = 0, runStart = 0;
      for (let x = 0; x < w; x += sampleStepX) {
        const x0 = Math.max(0, x - Math.floor(winX / 2));
        const x1 = Math.min(w - 1, x + Math.floor(winX / 2));
        let sum = 0, sumSq = 0, n = 0;
        for (let yy = yy0; yy <= yy1; yy++) {
          for (let xx = x0; xx <= x1; xx += Math.max(1, Math.floor(winX / 9))) {
            const v = at(xx, yy); sum += v; sumSq += v * v; n++;
          }
        }
        const sd = Math.sqrt(Math.max(0, sumSq / n - (sum / n) ** 2));
        const flat = sd < rowThreshold;
        if (flat) {
          if (!run) runStart = x;
          run++;
        } else {
          if (run > bestRun) { bestRun = run; bestStart = runStart; }
          run = 0;
        }
      }
      if (run > bestRun) { bestRun = run; bestStart = runStart; }
      const runPx = bestRun * sampleStepX;
      rowSignals.push({ y, runPx, start: bestStart, end: Math.min(w, bestStart + runPx) });
    }

    const colSignals = [];
    const colThreshold = 18;
    const localColRunMin = Math.max(6, Math.round(h * 0.035));
    for (let x = 0; x < w; x++) {
      const xx0 = Math.max(0, x - 2), xx1 = Math.min(w - 1, x + 2);
      let run = 0, bestRun = 0, bestStart = 0, runStart = 0;
      for (let y = 0; y < h; y += sampleStepY) {
        const y0 = Math.max(0, y - Math.floor(winY / 2));
        const y1 = Math.min(h - 1, y + Math.floor(winY / 2));
        let sum = 0, sumSq = 0, n = 0;
        for (let xx = xx0; xx <= xx1; xx++) {
          for (let yy = y0; yy <= y1; yy += Math.max(1, Math.floor(winY / 9))) {
            const v = at(xx, yy); sum += v; sumSq += v * v; n++;
          }
        }
        const sd = Math.sqrt(Math.max(0, sumSq / n - (sum / n) ** 2));
        if (sd < colThreshold) {
          if (!run) runStart = y;
          run++;
        } else {
          if (run > bestRun) { bestRun = run; bestStart = runStart; }
          run = 0;
        }
      }
      if (run > bestRun) { bestRun = run; bestStart = runStart; }
      const runPx = bestRun * sampleStepY;
      colSignals.push({ x, runPx, start: bestStart, end: Math.min(h, bestStart + runPx) });
    }

    // Merge neighboring rows/columns into gutter bands. A band is retained
    // when a meaningful local segment persists through multiple samples.
    const hSegs = mergeHorizontal(rowSignals, w, h);
    const vSegs = mergeVertical(colSignals, w, h);

    if (log) {
      log(`V74 local horizontal gutter segments=${hSegs.length}`);
      log(`V74 local vertical gutter segments=${vSegs.length}`);
      if (hSegs.length) log(`V74 H=${JSON.stringify(hSegs.slice(0, 12))}`);
      if (vSegs.length) log(`V74 V=${JSON.stringify(vSegs.slice(0, 12))}`);
    }

    // Reconstruct rectangular visual regions from compatible separator
    // segments. Page edges act as implicit separators. We intentionally do
    // not require every region to have both a horizontal and vertical gutter.
    const regions = buildRegions(hSegs, vSegs, w, h, log);
    if (log) log(`V74 reconstructed regions=${regions.length}`);

    if (regions.length <= 1) {
      if (log) log("V74 -> 0 panels (not enough distinct gutter-separated regions)");
      return [];
    }
    return regions;
  },
};

function mergeHorizontal(signals, w, h) {
  const minRun = Math.max(6, Math.round(w * 0.035));
  const minBand = Math.max(2, Math.round(h * 0.004));
  const good = signals.map(s => s.runPx >= minRun);
  const out = [];
  let start = -1;
  for (let y = 0; y <= h; y++) {
    const on = y < h && good[y];
    if (on && start < 0) start = y;
    if ((!on || y === h) && start >= 0) {
      if (y - start >= minBand) {
        const mid = Math.floor((start + y - 1) / 2);
        const s = signals[mid];
        const coverage = Math.max(0, Math.min(w, s.runPx)) / w;
        if (coverage >= 0.035) out.push({ y0: start, y1: y, x0: s.start, x1: s.end, coverage });
      }
      start = -1;
    }
  }
  return dedupeHorizontal(out, w, h);
}

function mergeVertical(signals, w, h) {
  const minRun = Math.max(6, Math.round(h * 0.035));
  const minBand = Math.max(2, Math.round(w * 0.004));
  const good = signals.map(s => s.runPx >= minRun);
  const out = [];
  let start = -1;
  for (let x = 0; x <= w; x++) {
    const on = x < w && good[x];
    if (on && start < 0) start = x;
    if ((!on || x === w) && start >= 0) {
      if (x - start >= minBand) {
        const mid = Math.floor((start + x - 1) / 2);
        const s = signals[mid];
        const coverage = Math.max(0, Math.min(h, s.runPx)) / h;
        if (coverage >= 0.035) out.push({ x0: start, x1: x, y0: s.start, y1: s.end, coverage });
      }
      start = -1;
    }
  }
  return dedupeVertical(out, w, h);
}

function dedupeHorizontal(segs, w, h) {
  const out = [];
  for (const s of segs) {
    const last = out[out.length - 1];
    if (last && Math.abs(last.y1 - s.y0) <= 2 && overlap(last.x0, last.x1, s.x0, s.x1) > 0.45 * Math.min(last.x1-last.x0, s.x1-s.x0)) {
      last.y1 = s.y1;
      last.x0 = Math.min(last.x0, s.x0); last.x1 = Math.max(last.x1, s.x1);
      last.coverage = Math.max(last.coverage, s.coverage);
    } else out.push({ ...s });
  }
  return out;
}

function dedupeVertical(segs, w, h) {
  const out = [];
  for (const s of segs) {
    const last = out[out.length - 1];
    if (last && Math.abs(last.x1 - s.x0) <= 2 && overlap(last.y0, last.y1, s.y0, s.y1) > 0.45 * Math.min(last.y1-last.y0, s.y1-s.y0)) {
      last.x1 = s.x1;
      last.y0 = Math.min(last.y0, s.y0); last.y1 = Math.max(last.y1, s.y1);
      last.coverage = Math.max(last.coverage, s.coverage);
    } else out.push({ ...s });
  }
  return out;
}

function overlap(a0, a1, b0, b1) { return Math.max(0, Math.min(a1,b1)-Math.max(a0,b0)); }

function buildRegions(hSegs, vSegs, w, h, log) {
  const ys = [0, h];
  const xs = [0, w];
  for (const s of hSegs) {
    const len = s.x1 - s.x0;
    if (len >= w * 0.08) ys.push(Math.round((s.y0+s.y1)/2));
  }
  for (const s of vSegs) {
    const len = s.y1 - s.y0;
    if (len >= h * 0.08) xs.push(Math.round((s.x0+s.x1)/2));
  }
  const Y = uniqSorted(ys), X = uniqSorted(xs);
  const candidates = [];
  for (let yi=0; yi<Y.length-1; yi++) {
    for (let xi=0; xi<X.length-1; xi++) {
      const x0=X[xi], x1=X[xi+1], y0=Y[yi], y1=Y[yi+1];
      if (x1-x0 < w*0.05 || y1-y0 < h*0.05) continue;
      const cx=(x0+x1)/2, cy=(y0+y1)/2;
      const hTop = yi===0 || hasSeparator(hSegs, y0, x0, x1, true);
      const hBottom = yi===Y.length-2 || hasSeparator(hSegs, y1, x0, x1, true);
      const vLeft = xi===0 || hasSeparator(vSegs, x0, y0, y1, false);
      const vRight = xi===X.length-2 || hasSeparator(vSegs, x1, y0, y1, false);
      const support = [hTop,hBottom,vLeft,vRight].filter(Boolean).length;
      if (support < 2) continue;
      candidates.push({ x:x0/w, y:y0/h, w:(x1-x0)/w, h:(y1-y0)/h, _support:support, _area:(x1-x0)*(y1-y0), _cx:cx, _cy:cy });
    }
  }

  // If a candidate grid is too sparse, fall back to the simple horizontal
  // bands. This keeps V73's strong stacked-panel behavior while adding local
  // segment support for more complex pages.
  if (!candidates.length) {
    const fallback = buildHorizontalFallback(hSegs, w, h);
    if (log) log(`V74 region grid empty; horizontal fallback=${fallback.length}`);
    return fallback;
  }

  // Remove candidates that are substantially contained by a larger candidate;
  // prefer the region with more separator support, then smaller area only when
  // the support is equal. This is NOT detector child selection: all candidates
  // come from the same fresh gutter segmentation pass.
  candidates.sort((a,b) => b._support-a._support || a._area-b._area);
  const kept=[];
  for (const c of candidates) {
    const contained = kept.some(k => c.x >= k.x-0.01 && c.y >= k.y-0.01 && c.x+c.w <= k.x+k.w+0.01 && c.y+c.h <= k.y+k.h+0.01 && k._support >= c._support);
    if (!contained) kept.push(c);
  }
  return kept.map(({_support,_area,_cx,_cy,...p}) => p);
}

function hasSeparator(segs, pos, a0, a1, horizontal) {
  return segs.some(s => {
    const center = horizontal ? (s.y0+s.y1)/2 : (s.x0+s.x1)/2;
    const overlapLen = horizontal ? overlap(s.x0,s.x1,a0,a1) : overlap(s.y0,s.y1,a0,a1);
    const targetLen = Math.max(1, a1-a0);
    return Math.abs(center-pos) <= 4 && overlapLen >= targetLen*0.18;
  });
}

function buildHorizontalFallback(hSegs,w,h) {
  const cuts=[0,h];
  for(const s of hSegs) if(s.coverage>=0.12) cuts.push(Math.round((s.y0+s.y1)/2));
  const Y=uniqSorted(cuts), out=[];
  for(let i=0;i<Y.length-1;i++){
    const y0=Y[i], y1=Y[i+1];
    if(y1-y0<h*0.05) continue;
    out.push({x:0,y:y0/h,w:1,h:(y1-y0)/h});
  }
  return out;
}
function uniqSorted(a){return [...new Set(a.map(v=>Math.max(0,Math.round(v))))].sort((a,b)=>a-b);}

window.PanelDetect = PanelDetect;
