// NTH SHELF V108 — V99 CONTROL / TAP-SEEDED PERSISTENT ENCLOSURE
// V73 remains authoritative whenever it contains the tap. V99 remains the
// exact fallback control. V108 is allowed to replace V99 only when V99 looks
// fragment-like and a tap-seeded enclosure persists across six or more
// boundary-evidence levels, contains the V99 fragment, and expands it.
// V99 misses and all other V99 results remain unchanged.

const PanelDetect = {
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

  // V108 wrapper around the unmodified V99 control. The new persistent-
  // enclosure path is deliberately gated so normal V99 hits do not pay its
  // cost and cannot be changed by it.
  detectTapLocalFallback(imgUrl, relX, relY, log) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        let baseline = null;
        try {
          baseline = this._analyzeBoundarySet(img, relX, relY, log);
          const fragmentLike = baseline && this._v108LooksFragmentLike(baseline);

          if (!baseline) {
            if (log) log("V108 repair-only control preserved: V99 miss remains a miss");
            resolve(null);
            return;
          }

          if (baseline && !fragmentLike) {
            if (log) log("V108 control preserved: V99 result is not fragment-like");
            resolve(baseline);
            return;
          }

          if (log) log("V108 experiment armed: V99 result is fragment-like");

          const enclosure = this._analyzePersistentEnclosure(img, relX, relY, log);
          resolve(this._v108SelectResult(baseline, enclosure, log));
        }
        catch (err) {
          console.warn("V108 fallback failed:", err);
          if (log) log(`V108 fallback ERROR: ${err.message}`);
          resolve(baseline || null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = imgUrl;
    });
  },

  _v108LooksFragmentLike(p) {
    if (!p) return false;
    const pw = Math.max(0, Number(p.w) || 0);
    const ph = Math.max(0, Number(p.h) || 0);
    const area = pw * ph;
    const shortSide = Math.min(pw, ph);
    const longSide = Math.max(pw, ph);
    const aspect = longSide / Math.max(0.0001, shortSide);

    // This is only an experiment gate, never panel evidence. The observed
    // failure is commonly produced by V99's one-way internal-gutter split, so
    // those results are eligible for an enclosure witness even when the bad
    // fragment is not numerically tiny. Small/very thin results are eligible
    // for the same reason. Nothing is replaced without the later containment,
    // expansion, and six-level persistence proof.
    return p._v88InternalSplit === true ||
      area <= 0.060 ||
      (shortSide <= 0.145 && aspect >= 4.0);
  },

  _v108SelectResult(baseline, enclosure, log) {
    if (!enclosure) {
      if (log) log("V108 persistent enclosure MISS -> preserve V99 control");
      return baseline || null;
    }

    if (!baseline) {
      if (log) log("V108 repair-only control preserved: no V99 fragment to repair");
      return null;
    }

    const bx0 = baseline.x, by0 = baseline.y;
    const bx1 = baseline.x + baseline.w, by1 = baseline.y + baseline.h;
    const ex0 = enclosure.x, ey0 = enclosure.y;
    const ex1 = enclosure.x + enclosure.w, ey1 = enclosure.y + enclosure.h;
    const iw = Math.max(0, Math.min(bx1, ex1) - Math.max(bx0, ex0));
    const ih = Math.max(0, Math.min(by1, ey1) - Math.max(by0, ey0));
    const baselineArea = Math.max(0.000001, baseline.w * baseline.h);
    const enclosureArea = Math.max(0.000001, enclosure.w * enclosure.h);
    const baselineInside = (iw * ih) / baselineArea;
    const expansion = enclosureArea / baselineArea;

    if (log) {
      log(`V108 control comparison: baselineInside=${baselineInside.toFixed(2)} expansion=${expansion.toFixed(2)} stability=${enclosure._v108Stability}`);
    }

    // Repair only the failure under test: a V99 fragment sitting inside a
    // substantially larger, repeatedly observed enclosing region.
    if (baselineInside >= 0.82 && expansion >= 1.45 && expansion <= 12) {
      if (log) log("V108 persistent enclosure REPLACES contained V99 fragment");
      return enclosure;
    }

    if (log) log("V108 evidence not decisive -> preserve exact V99 control");
    return baseline;
  },

  _analyzePersistentEnclosure(img, relX, relY, log) {
    const maxDim = 500;
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));
    const tx = clamp01(relX) * (w - 1);
    const ty = clamp01(relY) * (h - 1);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h).data;
    const lum = new Float32Array(w * h);
    for (let i = 0, p = 0; i < lum.length; i++, p += 4) {
      lum[i] = 0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2];
    }

    if (log) {
      log(`V108 persistent source=${img.width}x${img.height} downscaled=${w}x${h} tap=${Math.round(tx)},${Math.round(ty)}`);
    }
    return this._v108PersistentFromLuminance(lum, w, h, tx, ty, log);
  },

  // Topological persistence experiment. Strong, coherent edges and dark
  // ridges become traversal barriers. Starting at the tap, observe the free
  // component as the barrier threshold is lowered. A frame is accepted only
  // when essentially the same enclosure survives at least six consecutive
  // evidence levels. A one-threshold flood-fill result is never accepted.
  _v108PersistentFromLuminance(lum, w, h, tx, ty, log) {
    if (!lum || w < 24 || h < 24 || lum.length !== w * h) return null;

    const fine = this._v108GaussianBlur(lum, w, h, 1.0);
    const coarse = this._v108GaussianBlur(lum, w, h, 3.0);
    const gFine = new Float32Array(w * h);
    const gCoarse = new Float32Array(w * h);
    const darkRidge = new Float32Array(w * h);

    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const i = y * w + x;
        const fdx = (
          fine[i - w + 1] + 2 * fine[i + 1] + fine[i + w + 1] -
          fine[i - w - 1] - 2 * fine[i - 1] - fine[i + w - 1]
        ) / 8;
        const fdy = (
          fine[i + w - 1] + 2 * fine[i + w] + fine[i + w + 1] -
          fine[i - w - 1] - 2 * fine[i - w] - fine[i - w + 1]
        ) / 8;
        const cdx = (
          coarse[i - w + 1] + 2 * coarse[i + 1] + coarse[i + w + 1] -
          coarse[i - w - 1] - 2 * coarse[i - 1] - coarse[i + w - 1]
        ) / 8;
        const cdy = (
          coarse[i + w - 1] + 2 * coarse[i + w] + coarse[i + w + 1] -
          coarse[i - w - 1] - 2 * coarse[i - w] - coarse[i - w + 1]
        ) / 8;
        gFine[i] = Math.hypot(fdx, fdy);
        gCoarse[i] = Math.hypot(cdx, cdy);
        darkRidge[i] = Math.max(0, coarse[i] - fine[i]);
      }
    }

    const fine99 = Math.max(0.001, this._v108Percentile(gFine, 99));
    const coarse99 = Math.max(0.001, this._v108Percentile(gCoarse, 99));
    const ridge99 = Math.max(0.001, this._v108Percentile(darkRidge, 99));
    const strength = new Float32Array(w * h);

    for (let i = 0; i < strength.length; i++) {
      const a = Math.min(1.5, gFine[i] / fine99);
      const b = Math.min(1.5, gCoarse[i] / coarse99);
      const c = Math.min(1.5, darkRidge[i] / ridge99);
      strength[i] = 0.52 * a + 0.32 * b + 0.16 * c;
    }

    // A 3x3 maximum is a scale operation, not another threshold choice. It
    // lets the two sides of a thin frame line meet and bridges only one-pixel
    // interruptions caused by downscaling or ink damage.
    const closedStrength = new Float32Array(w * h);
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        let best = 0;
        for (let yy = y - 1; yy <= y + 1; yy++) {
          const row = yy * w;
          for (let xx = x - 1; xx <= x + 1; xx++) {
            if (strength[row + xx] > best) best = strength[row + xx];
          }
        }
        closedStrength[y * w + x] = best;
      }
    }

    const levels = [88, 86, 84, 82, 80, 78, 76, 74, 72, 70, 68];
    const thresholds = this._v108Percentiles(closedStrength, levels);
    const observations = [];
    for (let levelIndex = 0; levelIndex < levels.length; levelIndex++) {
      const level = levels[levelIndex];
      const threshold = thresholds[levelIndex];
      const component = this._v108FloodComponent(
        closedStrength, w, h, threshold, tx, ty
      );
      if (!component) {
        observations.push(null);
        continue;
      }

      const boxArea = component.w * component.h;
      const pageLike = component.area >= 0.75 || boxArea >= 0.82 ||
        (component.w >= 0.92 && component.h >= 0.92);
      const plausible = !pageLike && component.area >= 0.025 &&
        component.w >= 0.08 && component.h >= 0.08 &&
        component.fill >= 0.30 && boxArea <= 0.78;
      observations.push(plausible ? { ...component, level, threshold } : null);

      if (log && plausible) {
        log(`V108 level=${level} component x=${component.x.toFixed(3)} y=${component.y.toFixed(3)} w=${component.w.toFixed(3)} h=${component.h.toFixed(3)} area=${component.area.toFixed(3)} fill=${component.fill.toFixed(2)}`);
      }
    }

    const groups = [];
    let active = null;
    for (const candidate of observations) {
      if (!candidate) {
        if (active) groups.push(active);
        active = null;
        continue;
      }

      if (active) {
        const iou = this._v108BoxIoU(active.last, candidate);
        const areaRetention = Math.min(active.last.area, candidate.area) /
          Math.max(0.000001, Math.max(active.last.area, candidate.area));
        if (iou >= 0.93 && areaRetention >= 0.78) {
          active.items.push(candidate);
          active.last = candidate;
          continue;
        }
        groups.push(active);
      }

      active = { items: [candidate], first: candidate, last: candidate };
    }
    if (active) groups.push(active);

    const stable = groups.filter(group => {
      if (group.items.length < 6) return false;
      const endpointIoU = this._v108BoxIoU(group.first, group.last);
      const areaRetention = group.last.area / Math.max(0.000001, group.first.area);
      return endpointIoU >= 0.93 && areaRetention >= 0.72;
    });

    stable.sort((a, b) =>
      b.items.length - a.items.length ||
      b.first.level - a.first.level ||
      (b.first.w * b.first.h) - (a.first.w * a.first.h)
    );

    if (!stable.length) {
      if (log) log("V108 persistent REJECTED: no enclosure survived six evidence levels");
      return null;
    }

    const winner = stable[0];
    const p = winner.first;
    if (log) {
      log(`V108 persistent ACCEPTED levels=${winner.items.length} range=${winner.first.level}->${winner.last.level} endpointIoU=${this._v108BoxIoU(winner.first, winner.last).toFixed(2)}`);
    }
    return {
      x: p.x, y: p.y, w: p.w, h: p.h,
      _v108PersistentEnclosure: true,
      _v108Stability: winner.items.length,
      _v108LevelStart: winner.first.level,
      _v108LevelEnd: winner.last.level
    };
  },

  _v108GaussianBlur(src, w, h, sigma) {
    const radius = Math.max(1, Math.ceil(sigma * 3));
    const kernel = new Float32Array(radius * 2 + 1);
    let kernelSum = 0;
    for (let k = -radius; k <= radius; k++) {
      const value = Math.exp(-(k * k) / (2 * sigma * sigma));
      kernel[k + radius] = value;
      kernelSum += value;
    }
    for (let i = 0; i < kernel.length; i++) kernel[i] /= kernelSum;

    const tmp = new Float32Array(w * h);
    const out = new Float32Array(w * h);
    for (let y = 0; y < h; y++) {
      const row = y * w;
      for (let x = 0; x < w; x++) {
        let sum = 0;
        for (let k = -radius; k <= radius; k++) {
          const xx = Math.max(0, Math.min(w - 1, x + k));
          sum += src[row + xx] * kernel[k + radius];
        }
        tmp[row + x] = sum;
      }
    }
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let sum = 0;
        for (let k = -radius; k <= radius; k++) {
          const yy = Math.max(0, Math.min(h - 1, y + k));
          sum += tmp[yy * w + x] * kernel[k + radius];
        }
        out[y * w + x] = sum;
      }
    }
    return out;
  },

  _v108Percentile(values, percentile) {
    return this._v108Percentiles(values, [percentile])[0];
  },

  _v108Percentiles(values, percentiles) {
    const sample = [];
    const stride = Math.max(1, Math.floor(values.length / 45000));
    for (let i = 0; i < values.length; i += stride) {
      const value = values[i];
      if (Number.isFinite(value)) sample.push(value);
    }
    if (!sample.length) return percentiles.map(() => 0);
    sample.sort((a, b) => a - b);
    return percentiles.map(percentile => {
      const q = Math.max(0, Math.min(100, percentile)) / 100;
      return sample[Math.min(sample.length - 1, Math.floor(q * (sample.length - 1)))];
    });
  },

  _v108FloodComponent(strength, w, h, threshold, tx, ty) {
    const inset = 2;
    const isFree = (x, y) =>
      x >= inset && x < w - inset && y >= inset && y < h - inset &&
      strength[y * w + x] < threshold;

    let sx = Math.max(inset, Math.min(w - inset - 1, Math.round(tx)));
    let sy = Math.max(inset, Math.min(h - inset - 1, Math.round(ty)));
    if (!isFree(sx, sy)) {
      let found = null;
      for (let radius = 1; radius <= 8 && !found; radius++) {
        let bestDistance = Infinity;
        for (let y = Math.max(inset, sy - radius); y <= Math.min(h - inset - 1, sy + radius); y++) {
          for (let x = Math.max(inset, sx - radius); x <= Math.min(w - inset - 1, sx + radius); x++) {
            const distance = (x - sx) * (x - sx) + (y - sy) * (y - sy);
            if (distance > radius * radius || distance >= bestDistance || !isFree(x, y)) continue;
            bestDistance = distance;
            found = { x, y };
          }
        }
      }
      if (!found) return null;
      sx = found.x;
      sy = found.y;
    }

    const seen = new Uint8Array(w * h);
    const queue = new Int32Array(w * h);
    let head = 0, tail = 0;
    const seed = sy * w + sx;
    queue[tail++] = seed;
    seen[seed] = 1;
    let minX = sx, maxX = sx, minY = sy, maxY = sy, count = 0;

    const add = (index) => {
      if (seen[index] || strength[index] >= threshold) return;
      seen[index] = 1;
      queue[tail++] = index;
    };

    while (head < tail) {
      const index = queue[head++];
      const y = Math.floor(index / w);
      const x = index - y * w;
      count++;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;

      if (x > inset) add(index - 1);
      if (x < w - inset - 1) add(index + 1);
      if (y > inset) add(index - w);
      if (y < h - inset - 1) add(index + w);
    }

    if (!count) return null;
    const pad = 2;
    const x0 = Math.max(0, minX - pad);
    const y0 = Math.max(0, minY - pad);
    const x1 = Math.min(w, maxX + pad + 1);
    const y1 = Math.min(h, maxY + pad + 1);
    const boxPixels = Math.max(1, (x1 - x0) * (y1 - y0));
    return {
      x: x0 / w,
      y: y0 / h,
      w: (x1 - x0) / w,
      h: (y1 - y0) / h,
      area: count / (w * h),
      fill: count / boxPixels
    };
  },

  _v108BoxIoU(a, b) {
    if (!a || !b) return 0;
    const x0 = Math.max(a.x, b.x);
    const y0 = Math.max(a.y, b.y);
    const x1 = Math.min(a.x + a.w, b.x + b.w);
    const y1 = Math.min(a.y + a.h, b.y + b.h);
    const intersection = Math.max(0, x1 - x0) * Math.max(0, y1 - y0);
    const union = a.w * a.h + b.w * b.h - intersection;
    return intersection / Math.max(0.000001, union);
  },

  _analyzeBoundarySet(img, relX, relY, log) {
    const maxDim = 900;
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));
    const tx = clamp01(relX) * (w - 1);
    const ty = clamp01(relY) * (h - 1);

    if (log) log(`V92 boundary-set source=${img.width}x${img.height} downscaled=${w}x${h} tap=${Math.round(tx)},${Math.round(ty)}`);

    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h).data;
    const lum = new Float32Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      lum[y * w + x] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    }

    // Robust global scale. This is deliberately only used to normalize
    // boundary evidence; it does not choose a panel by itself.
    const sample = [];
    const step = Math.max(1, Math.floor(Math.max(w, h) / 180));
    for (let y = 1; y < h - 1; y += step) for (let x = 1; x < w - 1; x += step) {
      sample.push(
        Math.abs(lum[y*w+x] - lum[(y-1)*w+x]) +
        Math.abs(lum[(y+1)*w+x] - lum[y*w+x]) +
        Math.abs(lum[y*w+x] - lum[y*w+x-1]) +
        Math.abs(lum[y*w+x+1] - lum[y*w+x])
      );
    }
    sample.sort((a,b)=>a-b);
    const med = sample.length ? sample[Math.floor(sample.length * 0.5)] : 0;
    const edgeCut = Math.max(9, med * 2.5);
    const quietCut = Math.max(2.5, edgeCut * 0.44);

    // V97: reverse the evidence order for panel boundaries.
    // Black frame lines are primary candidates; grey gutter evidence confirms
    // them when present. This is deliberately separate from the V96
    // gutter-first approach.
    const blackH = this._findBlackFirstBoundaries(lum, w, h, tx, ty, "H");
    const blackV = this._findBlackFirstBoundaries(lum, w, h, tx, ty, "V");
    const greyH = this._findHorizontalBoundaries(lum, w, h, tx, ty, edgeCut, quietCut);
    const greyV = this._findVerticalBoundaries(lum, w, h, tx, ty, edgeCut, quietCut);

    this._confirmBlackWithGrey(blackH, greyH, "H", w, h);
    this._confirmBlackWithGrey(blackV, greyV, "V", w, h);

    const hCandidates = blackH.concat(greyH);
    const vCandidates = blackV.concat(greyV);

    if (log) {
      log(`V97 black-first H=${blackH.length} V=${blackV.length}`);
    }

    if (log) {
      log(`V99 boundary candidates H=${hCandidates.length} V=${vCandidates.length} edgeCut=${edgeCut.toFixed(1)} quietCut=${quietCut.toFixed(1)}`);
      log(`V99 H candidates=${JSON.stringify(hCandidates.slice(0,8))}`);
      log(`V99 V candidates=${JSON.stringify(vCandidates.slice(0,8))}`);
    }

    const top = hCandidates.filter(c => c.pos < ty).sort((a,b)=>Math.abs(ty-a.pos)-Math.abs(ty-b.pos)).slice(0,5);
    const bottom = hCandidates.filter(c => c.pos > ty).sort((a,b)=>Math.abs(ty-a.pos)-Math.abs(ty-b.pos)).slice(0,5);
    const left = vCandidates.filter(c => c.pos < tx).sort((a,b)=>Math.abs(tx-a.pos)-Math.abs(tx-b.pos)).slice(0,5);
    const right = vCandidates.filter(c => c.pos > tx).sort((a,b)=>Math.abs(tx-a.pos)-Math.abs(tx-b.pos)).slice(0,5);

    // Page edges are valid boundaries, but never count as gutter evidence.
    top.unshift({pos:0, edge:true, quality:0, span:[0,w-1]});
    bottom.unshift({pos:h-1, edge:true, quality:0, span:[0,w-1]});
    left.unshift({pos:0, edge:true, quality:0, span:[0,h-1]});
    right.unshift({pos:w-1, edge:true, quality:0, span:[0,h-1]});

    let best = null;
    for (const T of top) for (const B of bottom) for (const L of left) for (const R of right) {
      const pw = R.pos - L.pos, ph = B.pos - T.pos;
      if (pw <= w*0.04 || ph <= h*0.04) continue;
      if (!(tx >= L.pos && tx <= R.pos && ty >= T.pos && ty <= B.pos)) continue;

      const hs = [T,B].filter(c=>!c.edge);
      const vs = [L,R].filter(c=>!c.edge);
      const sides = hs.length + vs.length;
      if (sides < 2) continue;

      const hOverlap = boundarySpanOverlap(T, B, w);
      const vOverlap = boundarySpanOverlap(L, R, h);
      const hNeed = Math.max(w*0.14, pw*0.28);
      const vNeed = Math.max(h*0.14, ph*0.28);
      const hCoherent = (T.edge || B.edge || hOverlap >= hNeed);
      const vCoherent = (L.edge || R.edge || vOverlap >= vNeed);
      if (!hCoherent || !vCoherent) continue;

      // V91: opposing-boundary agreement. A candidate is only trustworthy when
      // the boundaries on the same axis actually support the same proposed
      // panel span. This is a consistency test, not a smallest/largest rule.
      // Each non-edge boundary must cover a meaningful portion of the candidate
      // span, and opposing supports must overlap strongly enough to describe
      // the same enclosure. Edge boundaries are valid but contribute no gutter
      // evidence. This specifically rejects large regions whose detected
      // boundaries only cover a small local slice of the proposed rectangle.
      const hTopCov = T.edge ? 1 : intervalCoverage(T.span, L.pos, R.pos) / Math.max(1, pw);
      const hBotCov = B.edge ? 1 : intervalCoverage(B.span, L.pos, R.pos) / Math.max(1, pw);
      const vLeftCov = L.edge ? 1 : intervalCoverage(L.span, T.pos, B.pos) / Math.max(1, ph);
      const vRightCov = R.edge ? 1 : intervalCoverage(R.span, T.pos, B.pos) / Math.max(1, ph);
      const hPair = (T.edge || B.edge) ? Math.min(hTopCov, hBotCov) : Math.min(hTopCov, hBotCov, hOverlap / Math.max(1, pw));
      const vPair = (L.edge || R.edge) ? Math.min(vLeftCov, vRightCov) : Math.min(vLeftCov, vRightCov, vOverlap / Math.max(1, ph));
      const pairNeed = 0.42;
      if (hPair < pairNeed || vPair < pairNeed) continue;

      // Score only evidence quality and mutual coherence. Region area is not
      // rewarded or penalized, so V87 does not reintroduce smallest/largest.
      let score = 0;
      score += T.edge ? 0.45 : T.quality;
      score += B.edge ? 0.45 : B.quality;
      score += L.edge ? 0.45 : L.quality;
      score += R.edge ? 0.45 : R.quality;
      if (!T.edge && !B.edge) score += Math.min(1.0, hOverlap / Math.max(1,hNeed));
      if (!L.edge && !R.edge) score += Math.min(1.0, vOverlap / Math.max(1,vNeed));
      score += sides * 0.35;

      // Prefer boundary sets with evidence on both axes, or two opposing
      // same-axis gutters for full-width/full-height comic panels.
      const axisBonus = (hs.length >= 2 ? 0.5 : 0) + (vs.length >= 2 ? 0.5 : 0);
      score += axisBonus;

      // V99: the V98 nearest-valid idea must act at the actual boundary-set
      // selection point. Keep evidence quality primary, but when two coherent
      // sets are close in score, prefer the set whose valid boundaries are
      // closer to the tap. This is a tie-breaker only.
      const tapBoundaryDistance =
        Math.max(0, ty - T.pos) +
        Math.max(0, B.pos - ty) +
        Math.max(0, tx - L.pos) +
        Math.max(0, R.pos - tx);

      if (!best) {
        best = {T,B,L,R,score,sides,hOverlap,vOverlap,hPair,vPair,pw,ph,tapBoundaryDistance};
      } else {
        const scoreGap = score - best.score;
        const tieBand = 0.45;
        const distanceImprovement = best.tapBoundaryDistance - tapBoundaryDistance;
        const meaningfulDistance = Math.max(6, Math.min(w,h) * 0.035);

        if (
          scoreGap > 0 ||
          (Math.abs(scoreGap) <= tieBand && distanceImprovement > meaningfulDistance)
        ) {
          best = {T,B,L,R,score,sides,hOverlap,vOverlap,hPair,vPair,pw,ph,tapBoundaryDistance};
        }
      }
    }

    if (!best) {
      if (log) log("V99 boundary-set REJECTED: no coherent boundary set around tap");
      return null;
    }

    let p = {
      x: best.L.pos / w,
      y: best.T.pos / h,
      w: best.pw / w,
      h: best.ph / h,
      _v87BoundarySet: true,
      _gutterSides: best.sides
    };

    // V89: A good outer boundary set can still contain multiple panels.
    // Iteratively inspect the selected region for strong internal gutters.
    // Each split is chosen by gutter continuity/evidence, while the tap
    // determines which side survives. We do NOT choose the smallest child.
    const refined = this._splitAtInternalGuttersIterative(lum, w, h, tx, ty, p, edgeCut, quietCut, log);
    if (refined) p = refined;

    // V92: panel interior validation. Even a coherent outer boundary set can
    // still contain multiple visual panels if an internal gutter survived the
    // V89 iterative refinement. Reject that result rather than accepting a
    // multi-panel pop-out. This is deliberately not a size rule: small and
    // large panels are both allowed when their interior is not divided by a
    // strong sustained gutter.
    const interior = this._validatePanelInterior(lum, w, h, tx, ty, p, edgeCut, quietCut, log);
    if (!interior.ok) {
      if (log) log(`V99 interior validation REJECTED: ${interior.reason}`);
      return null;
    }

    if (log) log(`V99 boundary-set ACCEPTED x=${p.x.toFixed(4)} y=${p.y.toFixed(4)} w=${p.w.toFixed(4)} h=${p.h.toFixed(4)} sides=${p._gutterSides} score=${best.score.toFixed(2)} hOverlap=${Math.round(best.hOverlap)} vOverlap=${Math.round(best.vOverlap)} hPair=${best.hPair.toFixed(2)} vPair=${best.vPair.toFixed(2)} interior=clean`);
    return p;
  },

  _splitAtInternalGuttersIterative(lum, w, h, tx, ty, p, edgeCut, quietCut, log) {
    let current = {...p};
    const maxSplits = 4;
    let changed = false;
    for (let i = 0; i < maxSplits; i++) {
      const next = this._splitAtInternalGuttersOnce(lum, w, h, tx, ty, current, edgeCut, quietCut, log);
      if (!next) break;
      current = next;
      changed = true;
      if (log) log(`V99 internal refinement pass ${i + 1}/${maxSplits}`);
    }
    return changed ? current : null;
  },

  _splitAtInternalGuttersOnce(lum, w, h, tx, ty, p, edgeCut, quietCut, log) {
    const x0 = Math.max(1, Math.round(p.x * w));
    const y0 = Math.max(1, Math.round(p.y * h));
    const x1 = Math.min(w - 2, Math.round((p.x + p.w) * w));
    const y1 = Math.min(h - 2, Math.round((p.y + p.h) * h));
    const pw = Math.max(1, x1 - x0);
    const ph = Math.max(1, y1 - y0);
    // Minimum continuity is a safety gate only; region size is never used
    // to prefer one resulting child over another.
    const minSpanH = 0.66;
    const minSpanV = 0.66;

    const findH = () => {
      let best = null;
      const xa = Math.max(x0 + 2, Math.round(x0 + pw * 0.08));
      const xb = Math.min(x1 - 2, Math.round(x1 - pw * 0.08));
      const span = Math.max(1, xb - xa + 1);
      for (let y = y0 + Math.max(3, Math.round(ph * 0.05)); y <= y1 - Math.max(3, Math.round(ph * 0.05)); y++) {
        if (Math.abs(y - ty) < Math.max(3, Math.round(ph * 0.025))) continue;
        let sum = 0, quiet = 0;
        for (let x = xa; x <= xb; x++) {
          const g = Math.abs(lum[y*w+x]-lum[(y-1)*w+x]) + Math.abs(lum[(y+1)*w+x]-lum[y*w+x]);
          sum += g;
          if (g <= quietCut) quiet++;
        }
        const avg = sum / span;
        const quietFrac = quiet / span;
        const before = this._axisEdgeSupportH(lum, w, h, y - 1, xa, xb);
        const after = this._axisEdgeSupportH(lum, w, h, y + 1, xa, xb);
        const support = (before + after) / 2;
        if (quietFrac < 0.62 || support < edgeCut * 0.90) continue;
        const quality = (support / Math.max(1, edgeCut)) * (0.55 + quietFrac * 0.45);
        if (!best || quality > best.quality) best = {pos:y, quality, quietFrac, spanFrac:span/pw};
      }
      return best && best.spanFrac >= minSpanH ? best : null;
    };

    const findV = () => {
      let best = null;
      const ya = Math.max(y0 + 2, Math.round(y0 + ph * 0.08));
      const yb = Math.min(y1 - 2, Math.round(y1 - ph * 0.08));
      const span = Math.max(1, yb - ya + 1);
      for (let x = x0 + Math.max(3, Math.round(pw * 0.05)); x <= x1 - Math.max(3, Math.round(pw * 0.05)); x++) {
        if (Math.abs(x - tx) < Math.max(3, Math.round(pw * 0.025))) continue;
        let sum = 0, quiet = 0;
        for (let y = ya; y <= yb; y++) {
          const g = Math.abs(lum[y*w+x]-lum[y*w+x-1]) + Math.abs(lum[y*w+x+1]-lum[y*w+x]);
          sum += g;
          if (g <= quietCut) quiet++;
        }
        const avg = sum / span;
        const quietFrac = quiet / span;
        const before = this._axisEdgeSupportV(lum, w, h, x - 1, ya, yb);
        const after = this._axisEdgeSupportV(lum, w, h, x + 1, ya, yb);
        const support = (before + after) / 2;
        if (quietFrac < 0.62 || support < edgeCut * 0.90) continue;
        const quality = (support / Math.max(1, edgeCut)) * (0.55 + quietFrac * 0.45);
        if (!best || quality > best.quality) best = {pos:x, quality, quietFrac, spanFrac:span/ph};
      }
      return best && best.spanFrac >= minSpanV ? best : null;
    };

    let refined = {...p};
    const hg = findH();
    const vg = findV();
    let did = false;
    if (hg) {
      if (ty < hg.pos) refined.h = (hg.pos / h) - refined.y;
      else refined.y = hg.pos / h, refined.h = (p.y + p.h) - refined.y;
      did = true;
      if (log) log(`V99 internal H gutter split at ${hg.pos} quality=${hg.quality.toFixed(2)} quiet=${hg.quietFrac.toFixed(2)}`);
    }
    if (vg) {
      if (tx < vg.pos) refined.w = (vg.pos / w) - refined.x;
      else refined.x = vg.pos / w, refined.w = (p.x + p.w) - refined.x;
      did = true;
      if (log) log(`V99 internal V gutter split at ${vg.pos} quality=${vg.quality.toFixed(2)} quiet=${vg.quietFrac.toFixed(2)}`);
    }
    if (!did) return null;
    refined.w = clamp01(refined.w);
    refined.h = clamp01(refined.h);
    refined._v88InternalSplit = true;
    return refined;
  },

  _validatePanelInterior(lum, w, h, tx, ty, p, edgeCut, quietCut, log) {
    const x0 = Math.max(1, Math.round(p.x * w));
    const y0 = Math.max(1, Math.round(p.y * h));
    const x1 = Math.min(w - 2, Math.round((p.x + p.w) * w));
    const y1 = Math.min(h - 2, Math.round((p.y + p.h) * h));
    const pw = Math.max(1, x1 - x0);
    const ph = Math.max(1, y1 - y0);

    // Validation is intentionally conservative. We only call something an
    // internal gutter when it forms a long, quiet corridor with strong edge
    // support on both sides. Short artwork strokes and speech-balloon edges
    // should not be enough to invalidate a panel.
    const marginX = Math.max(3, Math.round(pw * 0.08));
    const marginY = Math.max(3, Math.round(ph * 0.08));
    const xa = Math.min(x1 - 2, x0 + marginX);
    const xb = Math.max(x0 + 2, x1 - marginX);
    const ya = Math.min(y1 - 2, y0 + marginY);
    const yb = Math.max(y0 + 2, y1 - marginY);
    const spanNeed = 0.72;
    const quietNeed = 0.70;
    const supportNeed = edgeCut * 1.05;

    let strongestH = null;
    for (let y = ya + 2; y <= yb - 2; y++) {
      // Do not let a tap sitting immediately on a gutter invalidate the panel;
      // V89's split logic has already had the opportunity to use that gutter.
      if (Math.abs(y - ty) <= Math.max(3, Math.round(ph * 0.025))) continue;
      let quiet = 0;
      for (let x = xa; x <= xb; x++) {
        const g = Math.abs(lum[y*w+x] - lum[(y-1)*w+x]) +
                  Math.abs(lum[(y+1)*w+x] - lum[y*w+x]);
        if (g <= quietCut) quiet++;
      }
      const span = Math.max(1, xb - xa + 1);
      const quietFrac = quiet / span;
      if (quietFrac < quietNeed) continue;
      const support = this._axisEdgeSupportH(lum, w, h, y - 1, xa, xb) * 0.5 +
                      this._axisEdgeSupportH(lum, w, h, y + 1, xa, xb) * 0.5;
      const spanFrac = span / Math.max(1, pw);
      if (spanFrac < spanNeed || support < supportNeed) continue;
      const quality = (support / Math.max(1, edgeCut)) * (0.60 + quietFrac * 0.40) * spanFrac;
      if (!strongestH || quality > strongestH.quality) {
        strongestH = { pos: y, quality, quietFrac, support, spanFrac };
      }
    }

    let strongestV = null;
    for (let x = xa + 2; x <= xb - 2; x++) {
      if (Math.abs(x - tx) <= Math.max(3, Math.round(pw * 0.025))) continue;
      let quiet = 0;
      for (let y = ya; y <= yb; y++) {
        const g = Math.abs(lum[y*w+x] - lum[y*w+x-1]) +
                  Math.abs(lum[y*w+x+1] - lum[y*w+x]);
        if (g <= quietCut) quiet++;
      }
      const span = Math.max(1, yb - ya + 1);
      const quietFrac = quiet / span;
      if (quietFrac < quietNeed) continue;
      const support = this._axisEdgeSupportV(lum, w, h, x - 1, ya, yb) * 0.5 +
                      this._axisEdgeSupportV(lum, w, h, x + 1, ya, yb) * 0.5;
      const spanFrac = span / Math.max(1, ph);
      if (spanFrac < spanNeed || support < supportNeed) continue;
      const quality = (support / Math.max(1, edgeCut)) * (0.60 + quietFrac * 0.40) * spanFrac;
      if (!strongestV || quality > strongestV.quality) {
        strongestV = { pos: x, quality, quietFrac, support, spanFrac };
      }
    }

    if (log) {
      if (strongestH) log(`V92 interior H gutter candidate y=${strongestH.pos} quality=${strongestH.quality.toFixed(2)} span=${strongestH.spanFrac.toFixed(2)} quiet=${strongestH.quietFrac.toFixed(2)}`);
      if (strongestV) log(`V92 interior V gutter candidate x=${strongestV.pos} quality=${strongestV.quality.toFixed(2)} span=${strongestV.spanFrac.toFixed(2)} quiet=${strongestV.quietFrac.toFixed(2)}`);
    }

    if (strongestH && strongestV) return { ok: false, reason: "strong internal H+V gutters remain" };
    if (strongestH) return { ok: false, reason: `strong internal H gutter at ${strongestH.pos}` };
    if (strongestV) return { ok: false, reason: `strong internal V gutter at ${strongestV.pos}` };
    return { ok: true };
  },

  _axisEdgeSupportH(lum, w, h, y, xa, xb) {
    y = Math.max(1, Math.min(h-2, y));
    let sum = 0;
    for (let x = xa; x <= xb; x++) sum += Math.abs(lum[y*w+x]-lum[(y-1)*w+x]) + Math.abs(lum[(y+1)*w+x]-lum[y*w+x]);
    return sum / Math.max(1, xb-xa+1);
  },

  _axisEdgeSupportV(lum, w, h, x, ya, yb) {
    x = Math.max(1, Math.min(w-2, x));
    let sum = 0;
    for (let y = ya; y <= yb; y++) sum += Math.abs(lum[y*w+x]-lum[y*w+x-1]) + Math.abs(lum[y*w+x+1]-lum[y*w+x]);
    return sum / Math.max(1, yb-ya+1);
  },


  _v98RankBoundaryCandidates(candidates, tapPos, total) {
    const valid = (candidates || []).filter(c =>
      Number.isFinite(c.pos) && Number.isFinite(c.quality)
    );

    // Quality remains primary. Only candidates within a narrow evidence tier
    // can be reordered by distance to the tap.
    valid.sort((a,b) => {
      const qa = a.quality || 0;
      const qb = b.quality || 0;
      const gap = Math.abs(qa-qb);
      if (gap <= 0.55) {
        const da = Math.abs(a.pos-tapPos);
        const db = Math.abs(b.pos-tapPos);
        const distanceGap = Math.abs(da-db);
        if (distanceGap > Math.max(3,total*0.012)) return da-db;
      }
      return qb-qa;
    });
    return valid;
  },

  _findBlackFirstBoundaries(lum, w, h, tx, ty, axis) {
    const out = [];
    const darkCut = 55;
    const lightCut = 105;
    const minDarkFrac = 0.62;
    const minRunFrac = 0.45;
    const minSpanFrac = 0.34;
    const total = axis === "H" ? h : w;
    const spanLimit = axis === "H" ? w : h;

    const spans = [0.38, 0.52, 0.68, 0.84];

    for (const frac of spans) {
      if (axis === "H") {
        const half = Math.max(12, Math.round(w * frac / 2));
        const xa = Math.max(2, Math.round(tx) - half);
        const xb = Math.min(w - 3, Math.round(tx) + half);
        if (xb <= xa) continue;

        for (let y = 2; y < h - 2; y++) {
          if (Math.abs(y - ty) < Math.max(4, Math.round(h * 0.02))) continue;

          let dark = 0, bestRun = 0, run = 0;
          let sum = 0;
          for (let x = xa; x <= xb; x++) {
            const v = lum[y*w+x];
            sum += v;
            if (v <= darkCut) {
              dark++; run++;
              if (run > bestRun) bestRun = run;
            } else run = 0;
          }
          const span = xb-xa+1;
          const darkFrac = dark/span;
          const runFrac = bestRun/span;
          if (darkFrac < minDarkFrac || runFrac < minRunFrac) continue;

          let above=0, below=0;
          for (let x=xa; x<=xb; x++) {
            above += lum[(y-1)*w+x];
            below += lum[(y+1)*w+x];
          }
          above/=span; below/=span;
          const isolated = Math.min(above, below);
          if (isolated < lightCut) continue;

          let a=y, b=y;
          while (a>1 && b-a<5 && this._blackRowScore(lum,w,a-1,xa,xb,darkCut)>=minDarkFrac) a--;
          while (b<h-2 && b-a<5 && this._blackRowScore(lum,w,b+1,xa,xb,darkCut)>=minDarkFrac) b++;

          const quality =
            1.55 +
            Math.min(1, darkFrac)*0.85 +
            Math.min(1, runFrac)*0.90 +
            Math.min(1, (isolated-55)/150)*0.80;

          out.push({
            pos:(a+b)/2, width:b-a+1, quality,
            gutterQuality:0, thickness:b-a+1,
            span:[xa,xb], axis, blackFrame:true,
            darkFrac, runFrac, neighborLight:isolated
          });
        }
      } else {
        const half = Math.max(12, Math.round(h * frac / 2));
        const ya = Math.max(2, Math.round(ty) - half);
        const yb = Math.min(h - 3, Math.round(ty) + half);
        if (yb <= ya) continue;

        for (let x = 2; x < w - 2; x++) {
          if (Math.abs(x - tx) < Math.max(4, Math.round(w * 0.02))) continue;

          let dark=0, bestRun=0, run=0, sum=0;
          for (let y=ya; y<=yb; y++) {
            const v=lum[y*w+x]; sum+=v;
            if (v<=darkCut) { dark++; run++; if(run>bestRun) bestRun=run; }
            else run=0;
          }
          const span=yb-ya+1;
          const darkFrac=dark/span, runFrac=bestRun/span;
          if(darkFrac<minDarkFrac || runFrac<minRunFrac) continue;

          let left=0,right=0;
          for(let y=ya;y<=yb;y++){
            left+=lum[y*w+x-1]; right+=lum[y*w+x+1];
          }
          left/=span; right/=span;
          const isolated=Math.min(left,right);
          if(isolated<lightCut) continue;

          let a=x,b=x;
          while(a>1 && b-a<5 && this._blackColScore(lum,w,a-1,ya,yb,darkCut)>=minDarkFrac) a--;
          while(b<w-2 && b-a<5 && this._blackColScore(lum,w,b+1,ya,yb,darkCut)>=minDarkFrac) b++;

          const quality =
            1.55 +
            Math.min(1,darkFrac)*0.85 +
            Math.min(1,runFrac)*0.90 +
            Math.min(1,(isolated-55)/150)*0.80;

          out.push({
            pos:(a+b)/2, width:b-a+1, quality,
            gutterQuality:0, thickness:b-a+1,
            span:[ya,yb], axis, blackFrame:true,
            darkFrac, runFrac, neighborLight:isolated
          });
        }
      }
    }

    // Collapse repeated detections from overlapping scan spans.
    const ranked = this._v98RankBoundaryCandidates(
      out,
      axis === "H" ? tx : ty,
      total
    );
    ranked.sort((a,b)=>a.pos-b.pos || b.quality-a.quality);
    const merged=[];
    const mergeDist=Math.max(3,Math.round(total*0.012));
    for(const c of out){
      const last=merged[merged.length-1];
      if(last && Math.abs(last.pos-c.pos)<=mergeDist){
        if(c.quality>last.quality) merged[merged.length-1]=c;
      } else merged.push(c);
    }
    return merged.slice(0,24);
  },

  _blackRowScore(lum,w,y,xa,xb,cut){
    let n=0, span=Math.max(1,xb-xa+1);
    for(let x=xa;x<=xb;x++) if(lum[y*w+x]<=cut) n++;
    return n/span;
  },

  _blackColScore(lum,w,x,ya,yb,cut){
    let n=0, span=Math.max(1,yb-ya+1);
    for(let y=ya;y<=yb;y++) if(lum[y*w+x]<=cut) n++;
    return n/span;
  },

  _confirmBlackWithGrey(black, grey, axis, w, h) {
    if(!black.length || !grey.length) return;
    const tolerance=Math.max(5, Math.round((axis==="H"?h:w)*0.025));

    for(const b of black){
      let best=null;
      for(const g of grey){
        if(Math.abs(g.pos-b.pos)>tolerance) continue;

        // Prefer grey evidence whose span overlaps most of the black frame.
        const bs=b.span||[0,axis==="H"?w-1:h-1];
        const gs=g.span||[0,axis==="H"?w-1:h-1];
        const overlap=Math.max(0,Math.min(bs[1],gs[1])-Math.max(bs[0],gs[0])+1);
        const union=Math.max(bs[1],gs[1])-Math.min(bs[0],gs[0])+1;
        const overlapFrac=overlap/Math.max(1,union);

        const score=(g.quality||0)+overlapFrac;
        if(!best || score>best.score) best={g,score,overlapFrac};
      }

      if(best){
        b.greyConfirmed=true;
        b.greyConfirmationScore=Math.min(1,best.overlapFrac);
        // Confirmation is a meaningful bonus, but black remains primary.
        b.quality += 0.70 + 0.55*b.greyConfirmationScore;
      }
    }
  },

  _findHorizontalBoundaries(lum, w, h, tx, ty, edgeCut, quietCut) {
    const candidates = [];
    // Evaluate several horizontal support spans centered on the tap. A real
    // gutter can stop at a panel corner, so full-page coverage is not required.
    const spans = [0.22, 0.34, 0.48, 0.66];
    for (const frac of spans) {
      const half = Math.max(8, Math.round(w * frac / 2));
      const xa = Math.max(1, Math.round(tx) - half);
      const xb = Math.min(w - 2, Math.round(tx) + half);
      const width = Math.max(1, xb-xa+1);
      const prof = new Float32Array(h);
      for (let y=1;y<h-1;y++) {
        let sum=0, quiet=0;
        for (let x=xa;x<=xb;x++) {
          const g=Math.abs(lum[y*w+x]-lum[(y-1)*w+x]) + Math.abs(lum[(y+1)*w+x]-lum[y*w+x]);
          sum += g;
          if (g <= quietCut) quiet++;
        }
        prof[y] = sum / width;
        prof[y] += (1 - quiet/width) * edgeCut * 0.35;
      }
      this._collectBoundaryCandidates(prof, h, edgeCut, quietCut, xa, xb, candidates, "H");
    }
    return dedupeBoundaryCandidates(candidates, Math.max(2, Math.round(h*0.012)), 12);
  },

  _findVerticalBoundaries(lum, w, h, tx, ty, edgeCut, quietCut) {
    const candidates = [];
    const spans = [0.22, 0.34, 0.48, 0.66];
    for (const frac of spans) {
      const half = Math.max(8, Math.round(h * frac / 2));
      const ya = Math.max(1, Math.round(ty) - half);
      const yb = Math.min(h - 2, Math.round(ty) + half);
      const height = Math.max(1, yb-ya+1);
      const prof = new Float32Array(w);
      for (let x=1;x<w-1;x++) {
        let sum=0, quiet=0;
        for (let y=ya;y<=yb;y++) {
          const g=Math.abs(lum[y*w+x]-lum[y*w+x-1]) + Math.abs(lum[y*w+x+1]-lum[y*w+x]);
          sum += g;
          if (g <= quietCut) quiet++;
        }
        prof[x] = sum / height;
        prof[x] += (1 - quiet/height) * edgeCut * 0.35;
      }
      this._collectBoundaryCandidates(prof, w, edgeCut, quietCut, ya, yb, candidates, "V");
    }
    return dedupeBoundaryCandidates(candidates, Math.max(2, Math.round(w*0.012)), 12);
  },

  _collectBoundaryCandidates(profile, total, edgeCut, quietCut, spanA, spanB, out, axis) {
    for (let i=2;i<total-2;i++) {
      if (profile[i] > quietCut) continue;
      // A gutter is a quiet corridor with edge support immediately outside it.
      let a=i, b=i;
      const maxRun=Math.max(2,Math.round(total*0.014));
      while (a>1 && profile[a-1] <= quietCut && i-a < maxRun) a--;
      while (b<total-2 && profile[b+1] <= quietCut && b-i < maxRun) b++;
      const before=profile[Math.max(1,a-1)];
      const after=profile[Math.min(total-2,b+1)];
      const support=(Math.max(0,before)+Math.max(0,after))/2;
      const quietFrac=Math.max(0, Math.min(1, 1 - profile[i]/Math.max(1,quietCut)));
      if (support < edgeCut*0.78) continue;
      const pos=(a+b)/2;
      const quality=Math.min(3, support/Math.max(1,edgeCut)) * (0.65 + quietFrac*0.35);
      const span=[spanA,spanB];
      out.push({pos, width:b-a+1, quality, span, axis});
      i=b;
    }
  },

  _analyze(img, log) {
    const maxDim = 900;
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));
    if (log) log(`source=${img.width}x${img.height} downscaled=${w}x${h}`);
    const canvas=document.createElement("canvas"); canvas.width=w; canvas.height=h;
    const ctx=canvas.getContext("2d",{willReadFrequently:true}); ctx.drawImage(img,0,0,w,h);
    const data=ctx.getImageData(0,0,w,h).data;
    const lumAt=(x,y)=>{const i=(y*w+x)*4; return .299*data[i]+.587*data[i+1]+.114*data[i+2];};
    const rowStd=new Array(h);
    for(let y=0;y<h;y++){let sum=0,sumSq=0;for(let x=0;x<w;x++){const l=lumAt(x,y);sum+=l;sumSq+=l*l;}const mean=sum/w;rowStd[y]=Math.sqrt(Math.max(0,sumSq/w-mean*mean));}
    if(log){const min=Math.min(...rowStd),max=Math.max(...rowStd),flat=rowStd.filter(v=>v<10).length;log(`row-stddev min=${min.toFixed(1)} max=${max.toFixed(1)} flat-rows(<10)=${flat}/${h}`);}
    const thresh=10, minRow=Math.max(2,Math.round(h*.006)), minCol=Math.max(2,Math.round(w*.006));
    const strips=splitByGutter(rowStd,h,thresh,minRow); if(log)log(`row-split found ${strips.length} strip(s): ${JSON.stringify(strips)}`);
    const panels=[];
    for(const [sy,ey] of strips){const stripH=ey-sy;if(stripH<h*.05)continue;const colStd=new Array(w);for(let x=0;x<w;x++){let sum=0,sumSq=0;for(let y=sy;y<ey;y++){const l=lumAt(x,y);sum+=l;sumSq+=l*l;}const mean=sum/stripH;colStd[x]=Math.sqrt(Math.max(0,sumSq/stripH-mean*mean));}const cols=splitByGutter(colStd,w,thresh,minCol);for(const [sx,ex] of cols){const pw=ex-sx;if(pw<w*.05)continue;panels.push({x:sx/w,y:sy/h,w:pw/w,h:stripH/h});}}
    if(log)log(`raw panel count before collapse-check: ${panels.length}`);
    if(panels.length<=1){if(log)log("-> collapsed to 0 (<=1 panel found)");return [];}return panels;
  }
};

function intervalCoverage(span, lo, hi){
  if (!span || span.length < 2) return 0;
  const a = Math.min(span[0], span[1]);
  const b = Math.max(span[0], span[1]);
  const overlap = Math.max(0, Math.min(b, hi) - Math.max(a, lo) + 1);
  return overlap;
}
function boundarySpanOverlap(a,b,total){
  if(a.edge || b.edge) return Math.max(0,total-1);
  const lo=Math.max(a.span[0],b.span[0]), hi=Math.min(a.span[1],b.span[1]);
  return Math.max(0,hi-lo+1);
}
function dedupeBoundaryCandidates(list,posTol,maxKeep){
  list.sort((a,b)=>b.quality-a.quality);
  const out=[];
  for(const c of list){
    if(out.some(o=>Math.abs(o.pos-c.pos)<=posTol)) continue;
    out.push(c); if(out.length>=maxKeep) break;
  }
  return out.sort((a,b)=>a.pos-b.pos);
}
function splitByGutter(arr,total,thresh,minGutterRun){const spans=[];let contentStart=0,inG=false,gStart=0;for(let i=0;i<=total;i++){const isG=i<total?arr[i]<thresh:true;if(isG){if(!inG){inG=true;gStart=i;}}else if(inG){const run=i-gStart;inG=false;if(run>=minGutterRun){if(gStart-contentStart>0)spans.push([contentStart,gStart]);contentStart=i;}}}if(total-contentStart>0)spans.push([contentStart,total]);return spans;}
function clamp01(v){return Math.min(1,Math.max(0,Number(v)||0));}
window.PanelDetect=PanelDetect;
