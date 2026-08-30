// NTH SHELF V90 — V89 BASELINE / CONSENSUS RECOVERY
// V73 remains authoritative whenever it contains the tap.
// V90 keeps V89 successful detection intact, then adds recovery only after a
// fallback candidate for a strong internal gutter that would indicate that
// multiple comic panels were bundled together. No smallest/largest rule.

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

  // V89 fallback: V87 coherent boundary SET plus internal-gutter check. A boundary is
  // not selected because it is merely nearest, smallest, or largest. Each
  // side is scored for continuity and edge support, then opposite/adjacent
  // boundaries are paired only when their support spans are mutually
  // compatible and the resulting region contains the tap.
  detectTapLocalFallback(imgUrl, relX, relY, log) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        try { resolve(this._analyzeBoundarySet(img, relX, relY, log)); }
        catch (err) {
          console.warn("V89 fallback failed:", err);
          if (log) log(`V89 fallback ERROR: ${err.message}`);
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = imgUrl;
    });
  },

  _analyzeBoundarySet(img, relX, relY, log) {
    const maxDim = 900;
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));
    const tx = clamp01(relX) * (w - 1);
    const ty = clamp01(relY) * (h - 1);

    if (log) log(`V89 boundary-set source=${img.width}x${img.height} downscaled=${w}x${h} tap=${Math.round(tx)},${Math.round(ty)}`);

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

    const hCandidates = this._findHorizontalBoundaries(lum, w, h, tx, ty, edgeCut, quietCut);
    const vCandidates = this._findVerticalBoundaries(lum, w, h, tx, ty, edgeCut, quietCut);

    if (log) {
      log(`V89 boundary candidates H=${hCandidates.length} V=${vCandidates.length} edgeCut=${edgeCut.toFixed(1)} quietCut=${quietCut.toFixed(1)}`);
      log(`V89 H candidates=${JSON.stringify(hCandidates.slice(0,8))}`);
      log(`V89 V candidates=${JSON.stringify(vCandidates.slice(0,8))}`);
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

      if (!best || score > best.score) best = {T,B,L,R,score,sides,hOverlap,vOverlap,pw,ph};
    }

    if (!best) {
      if (log) log("V89 boundary-set REJECTED: no coherent boundary set around tap");
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

    if (log) log(`V89 boundary-set ACCEPTED x=${p.x.toFixed(4)} y=${p.y.toFixed(4)} w=${p.w.toFixed(4)} h=${p.h.toFixed(4)} sides=${p._gutterSides} score=${best.score.toFixed(2)} hOverlap=${Math.round(best.hOverlap)} vOverlap=${Math.round(best.vOverlap)}`);
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
      if (log) log(`V89 internal refinement pass ${i + 1}/${maxSplits}`);
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
      if (log) log(`V89 internal H gutter split at ${hg.pos} quality=${hg.quality.toFixed(2)} quiet=${hg.quietFrac.toFixed(2)}`);
    }
    if (vg) {
      if (tx < vg.pos) refined.w = (vg.pos / w) - refined.x;
      else refined.x = vg.pos / w, refined.w = (p.x + p.w) - refined.x;
      did = true;
      if (log) log(`V89 internal V gutter split at ${vg.pos} quality=${vg.quality.toFixed(2)} quiet=${vg.quietFrac.toFixed(2)}`);
    }
    if (!did) return null;
    refined.w = clamp01(refined.w);
    refined.h = clamp01(refined.h);
    refined._v88InternalSplit = true;
    return refined;
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

  // V90 recovery pass: only runs after the V89 boundary-set fallback fails.
  // It does not replace V73/V89 successes. Instead of selecting one profile,
  // it votes across several parallel local scan windows. A real gutter should
  // recur at approximately the same coordinate across nearby scan windows,
  // even when one particular window is contaminated by lettering/art.
  detectTapRecoveryFallback(imgUrl, relX, relY, log) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        try { resolve(this._analyzeRecovery(img, relX, relY, log)); }
        catch (err) {
          console.warn("V90 recovery failed:", err);
          if (log) log(`V90 recovery ERROR: ${err.message}`);
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = imgUrl;
    });
  },

  _analyzeRecovery(img, relX, relY, log) {
    const maxDim = 900;
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));
    const tx = clamp01(relX) * (w - 1);
    const ty = clamp01(relY) * (h - 1);
    if (log) log(`V90 recovery source=${img.width}x${img.height} downscaled=${w}x${h} tap=${Math.round(tx)},${Math.round(ty)}`);

    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h).data;
    const lum = new Float32Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      lum[y*w+x] = 0.299*data[i] + 0.587*data[i+1] + 0.114*data[i+2];
    }

    const samples = [];
    const step = Math.max(1, Math.floor(Math.max(w, h) / 180));
    for (let y = 1; y < h - 1; y += step) for (let x = 1; x < w - 1; x += step) {
      samples.push(
        Math.abs(lum[y*w+x]-lum[(y-1)*w+x]) +
        Math.abs(lum[(y+1)*w+x]-lum[y*w+x]) +
        Math.abs(lum[y*w+x]-lum[y*w+x-1]) +
        Math.abs(lum[y*w+x+1]-lum[y*w+x])
      );
    }
    samples.sort((a,b)=>a-b);
    const med = samples.length ? samples[Math.floor(samples.length*0.5)] : 0;
    const edgeCut = Math.max(9, med*2.5);
    const quietCut = Math.max(2.5, edgeCut*0.44);

    // Several overlapping windows are deliberately used. This is the only
    // new recovery mechanism in V90: boundary positions that recur across
    // multiple nearby windows get consensus; isolated lines do not.
    const hWindows = [
      [-0.14, 0.30], [0, 0.30], [0.14, 0.30],
      [-0.10, 0.48], [0, 0.48], [0.10, 0.48],
      [0, 0.68]
    ];
    const vWindows = [
      [-0.14, 0.30], [0, 0.30], [0.14, 0.30],
      [-0.10, 0.48], [0, 0.48], [0.10, 0.48],
      [0, 0.68]
    ];

    const horizontalHits = [];
    for (const [offset, frac] of hWindows) {
      const half = Math.max(8, Math.round(w*frac/2));
      const center = Math.round(tx + w*offset);
      const xa = Math.max(1, center-half), xb = Math.min(w-2, center+half);
      const width = Math.max(1, xb-xa+1);
      const profile = new Float32Array(h);
      for (let y=1; y<h-1; y++) {
        let sum=0, quiet=0;
        for (let x=xa; x<=xb; x++) {
          const g=Math.abs(lum[y*w+x]-lum[(y-1)*w+x]) + Math.abs(lum[(y+1)*w+x]-lum[y*w+x]);
          sum += g;
          if (g <= quietCut) quiet++;
        }
        const q = quiet/width;
        profile[y] = sum/width + (1-q)*edgeCut*0.35;
      }
      horizontalHits.push(...this._collectRecoverySideHits(profile, ty, h, edgeCut, quietCut, "H", w, offset, frac));
    }

    const verticalHits = [];
    for (const [offset, frac] of vWindows) {
      const half = Math.max(8, Math.round(h*frac/2));
      const center = Math.round(ty + h*offset);
      const ya = Math.max(1, center-half), yb = Math.min(h-2, center+half);
      const height = Math.max(1, yb-ya+1);
      const profile = new Float32Array(w);
      for (let x=1; x<w-1; x++) {
        let sum=0, quiet=0;
        for (let y=ya; y<=yb; y++) {
          const g=Math.abs(lum[y*w+x]-lum[y*w+x-1]) + Math.abs(lum[y*w+x+1]-lum[y*w+x]);
          sum += g;
          if (g <= quietCut) quiet++;
        }
        const q = quiet/height;
        profile[x] = sum/height + (1-q)*edgeCut*0.35;
      }
      verticalHits.push(...this._collectRecoverySideHits(profile, tx, w, edgeCut, quietCut, "V", h, offset, frac));
    }

    const top = this._consensusRecoveryBoundary(horizontalHits.filter(c=>c.pos<ty), ty, h, "TOP", log);
    const bottom = this._consensusRecoveryBoundary(horizontalHits.filter(c=>c.pos>ty), ty, h, "BOTTOM", log);
    const left = this._consensusRecoveryBoundary(verticalHits.filter(c=>c.pos<tx), tx, w, "LEFT", log);
    const right = this._consensusRecoveryBoundary(verticalHits.filter(c=>c.pos>tx), tx, w, "RIGHT", log);

    if (log) log(`V90 recovery consensus T=${top?top.pos:"-"} B=${bottom?bottom.pos:"-"} L=${left?left.pos:"-"} R=${right?right.pos:"-"} edgeCut=${edgeCut.toFixed(1)} quietCut=${quietCut.toFixed(1)}`);

    const sx = left ? left.pos : 0;
    const ex = right ? right.pos : w-1;
    const sy = top ? top.pos : 0;
    const ey = bottom ? bottom.pos : h-1;
    const pw = Math.max(0, ex-sx), ph = Math.max(0, ey-sy);
    const contains = tx>=sx && tx<=ex && ty>=sy && ty<=ey;
    const sides = [top,bottom,left,right].filter(Boolean).length;
    const axisMix = (top||bottom) && (left||right);
    const opposingH = top && bottom;
    const opposingV = left && right;

    // Conservative recovery gate. Unlike V79's broader fallback, V90 only
    // accepts a region when consensus exists on both axes, or on both opposing
    // boundaries of one axis. This prevents a weak single edge from becoming
    // a giant page-sized guess.
    const credible = contains && pw>=Math.max(14,w*0.05) && ph>=Math.max(14,h*0.05) &&
      (axisMix || opposingH || opposingV) && sides>=2;

    if (!credible) {
      if (log) log(`V90 recovery REJECTED region=${Math.round(pw)}x${Math.round(ph)} sides=${sides} axisMix=${!!axisMix} opposingH=${!!opposingH} opposingV=${!!opposingV}`);
      return null;
    }

    const panel = {
      x:sx/w, y:sy/h, w:pw/w, h:ph/h,
      _v90Recovery:true, _gutterSides:sides,
      _recoveryConsensus:true
    };
    if (log) log(`V90 recovery ACCEPTED x=${panel.x.toFixed(4)} y=${panel.y.toFixed(4)} w=${panel.w.toFixed(4)} h=${panel.h.toFixed(4)} sides=${sides}`);
    return panel;
  },

  _collectRecoverySideHits(profile, tapPos, total, edgeCut, quietCut, axis, spanSize, offset, frac) {
    const hits = [];
    const minDistance = Math.max(4, Math.round(total*0.018));
    const maxDistance = Math.max(16, Math.round(total*0.52));
    const maxRun = Math.max(3, Math.round(total*0.012));
    for (let dir of [-1, 1]) {
      let pos = Math.round(tapPos) + dir;
      let travelled = 0;
      while (pos>=1 && pos<total-1 && travelled<maxDistance) {
        if (Math.abs(pos-tapPos)<minDistance) { pos += dir; travelled++; continue; }
        if (profile[pos] <= quietCut) {
          const rs=pos;
          let re=pos;
          while (re>=1 && re<total-1 && profile[re] <= quietCut && Math.abs(re-rs)<maxRun) re += dir;
          re -= dir;
          const before=rs-dir, after=re+dir;
          const support=((before>=1&&before<total-1)?Math.max(0,profile[before]):0) +
                        ((after>=1&&after<total-1)?Math.max(0,profile[after]):0);
          const avgSupport=support/2;
          const len=Math.abs(re-rs)+1;
          const quietFrac=Math.max(0,Math.min(1,1-profile[Math.round((rs+re)/2)]/Math.max(1,quietCut)));
          if (len>=2 && avgSupport>=edgeCut*0.90) {
            hits.push({pos:(rs+re)/2, quality:(avgSupport/Math.max(1,edgeCut))*(0.65+quietFrac*0.35), axis, offset, frac, spanSize});
          }
          pos=re+dir;
          travelled += len;
        } else {
          pos += dir;
          travelled++;
        }
      }
    }
    return hits;
  },

  _consensusRecoveryBoundary(hits, tapPos, total, label, log) {
    if (!hits.length) return null;
    const tol=Math.max(5, Math.round(total*0.025));
    const clusters=[];
    for (const hit of hits.sort((a,b)=>a.pos-b.pos)) {
      let cluster=clusters.find(c=>Math.abs(c.center-hit.pos)<=tol);
      if (!cluster) { cluster={center:hit.pos,hits:[]}; clusters.push(cluster); }
      cluster.hits.push(hit);
      cluster.center=cluster.hits.reduce((s,h)=>s+h.pos,0)/cluster.hits.length;
    }
    for (const c of clusters) {
      c.count=new Set(c.hits.map(h=>`${h.offset}:${h.frac}`)).size;
      c.quality=c.hits.reduce((s,h)=>s+h.quality,0)/c.hits.length;
      c.distance=Math.abs(tapPos-c.center);
      c.score=c.count*1.35+c.quality*0.55;
    }
    clusters.sort((a,b)=>b.score-a.score || a.distance-b.distance);
    const best=clusters[0];
    // Require independent window agreement. One scan cannot create a recovery.
    if (!best || best.count<3) {
      if (log) log(`V90 ${label} consensus rejected: best=${best?best.count:0} independent windows`);
      return null;
    }
    if (log) log(`V90 ${label} consensus pos=${best.center.toFixed(1)} windows=${best.count} score=${best.score.toFixed(2)}`);
    return {pos:best.center, quality:best.quality, consensus:best.count};
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
