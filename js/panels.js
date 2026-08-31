// NTH SHELF V103 — V99 + V102B REGION/BARRIER HYBRID
// V99 remains the candidate-generation baseline. V102B is added as a second-stage
// region/barrier interpretation layer inside the V99 candidate. If V102B cannot
// produce a substantial enclosed region, V99 is left untouched.

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

  // V99 fallback: V91 coherent boundary SET plus internal-gutter refinement. A boundary is
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
          console.warn("V99 fallback failed:", err);
          if (log) log(`V99 fallback ERROR: ${err.message}`);
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = imgUrl;
    });
  },


  // V103 / V102B integration: use V99's boundary candidate as the structural
  // hypothesis, then test that hypothesis as a region enclosed by black/grey
  // barriers. V99 remains the source of candidate boundaries; region reasoning
  // is a second-stage interpretation layer, not a replacement detector.
  _researchRegionFromV99(lum, w, h, tx, ty, p, edgeCut, quietCut, log) {
    const barriers = this._buildResearchBarriers(lum, w, h, edgeCut, quietCut);
    const bounds = {
      x0: Math.max(1, Math.round(p.x * w)),
      y0: Math.max(1, Math.round(p.y * h)),
      x1: Math.min(w - 2, Math.round((p.x + p.w) * w)),
      y1: Math.min(h - 2, Math.round((p.y + p.h) * h))
    };
    const sx = Math.max(bounds.x0, Math.min(bounds.x1, Math.round(tx)));
    const sy = Math.max(bounds.y0, Math.min(bounds.y1, Math.round(ty)));
    const total = Math.max(1, (bounds.x1 - bounds.x0 + 1) * (bounds.y1 - bounds.y0 + 1));
    const seen = new Uint8Array(total);
    const rw = bounds.x1 - bounds.x0 + 1;
    const rh = bounds.y1 - bounds.y0 + 1;
    const qx = new Int32Array(total);
    const qy = new Int32Array(total);
    let head = 0, tail = 0, count = 0;
    let minX = sx, maxX = sx, minY = sy, maxY = sy;
    const idx = (x, y) => (y - bounds.y0) * rw + (x - bounds.x0);
    const inside = (x, y) => x >= bounds.x0 && x <= bounds.x1 && y >= bounds.y0 && y <= bounds.y1;
    const crosses = (x, y, nx, ny) => {
      if (nx !== x) return !!barriers.vBarrier[y * w + Math.min(x, nx)];
      return !!barriers.hBarrier[Math.min(y, ny) * w + x];
    };

    qx[tail] = sx; qy[tail] = sy; tail++;
    seen[idx(sx, sy)] = 1;
    while (head < tail && count < total) {
      const x = qx[head], y = qy[head]; head++; count++;
      minX = Math.min(minX, x); maxX = Math.max(maxX, x);
      minY = Math.min(minY, y); maxY = Math.max(maxY, y);
      const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
      for (const [dx,dy] of dirs) {
        const nx=x+dx, ny=y+dy;
        if (!inside(nx,ny) || crosses(x,y,nx,ny)) continue;
        const ni=idx(nx,ny);
        if (seen[ni]) continue;
        seen[ni]=1; qx[tail]=nx; qy[tail]=ny; tail++;
      }
    }

    const bw=maxX-minX+1, bh=maxY-minY+1;
    const regionArea=count/total;
    const fill=count/Math.max(1,bw*bh);
    const candArea=Math.max(.0001,p.w*p.h);
    const regionRelArea=(bw/w)*(bh/h);
    const containment =
      minX >= bounds.x0 && maxX <= bounds.x1 && minY >= bounds.y0 && maxY <= bounds.y1;

    // A region that is almost the whole V99 candidate is not useful evidence;
    // a tiny fragment is not useful either. The useful case is a substantial,
    // enclosed subregion that remains plausibly the tapped panel.
    const substantial = regionArea >= .18 && fill >= .28 && regionRelArea >= candArea * .28;
    if (!containment || !substantial) {
      if (log) log(`V103 V102B region rejected area=${regionArea.toFixed(3)} fill=${fill.toFixed(3)} relArea=${regionRelArea.toFixed(4)}`);
      return null;
    }

    const r={
      x:minX/w, y:minY/h, w:bw/w, h:bh/h,
      _v102ARegion:true,
      _regionArea:regionArea,
      _regionFill:fill,
      _regionRelArea:regionRelArea
    };
    if (log) log(`V103 V102B region accepted area=${regionArea.toFixed(3)} fill=${fill.toFixed(3)} box=${r.x.toFixed(4)},${r.y.toFixed(4)},${r.w.toFixed(4)},${r.h.toFixed(4)}`);
    return r;
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

    // V106 / V102D: contour/boundary-run reconstruction over the V99 result.
    const contourRefinement = this._v102DContourRefine(lum,w,h,p,edgeCut,log);
    if (contourRefinement && contourRefinement.edges === 4 && contourRefinement.score >= 0.48) {
      const ratio=(contourRefinement.w*contourRefinement.h)/Math.max(0.0001,p.w*p.h);
      if (ratio >= 0.55 && ratio <= 1.45) {
        p={...p,x:contourRefinement.x,y:contourRefinement.y,w:contourRefinement.w,h:contourRefinement.h,_v102D:true,_v102DScore:contourRefinement.score};
        if(log) log(`V106 V99+V102D accepted edges=4/4 score=${contourRefinement.score.toFixed(2)} areaRatio=${ratio.toFixed(3)}`);
      }
    }

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

  _v102DContourRefine(lum,w,h,p,edgeCut,log) {
    const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
    const g=(x,y)=>{
      x=clamp(Math.round(x),1,w-2); y=clamp(Math.round(y),1,h-2);
      return Math.abs(lum[y*w+x]-lum[y*w+x-1])+
             Math.abs(lum[y*w+x+1]-lum[y*w+x])+
             Math.abs(lum[y*w+x]-lum[(y-1)*w+x])+
             Math.abs(lum[(y+1)*w+x]-lum[y*w+x]);
    };
    const r={x:clamp(p.x*w,2,w-3),y:clamp(p.y*h,2,h-3),
             x2:clamp((p.x+p.w)*w,3,w-2),y2:clamp((p.y+p.h)*h,3,h-2)};
    if(r.x2-r.x<16 || r.y2-r.y<16) return null;

    // Search a narrow band around each V99 side. Score continuity, not peak
    // strength: a real frame should persist across much of the candidate.
    const continuity=(hor,pos,a,b)=>{
      const bins=40; let good=0,run=0,bestRun=0;
      for(let k=0;k<bins;k++){
        const aa=Math.round(a+(b-a)*k/bins), bb=Math.round(a+(b-a)*(k+1)/bins);
        let hit=0,n=0;
        for(let q=aa;q<=bb;q+=Math.max(1,Math.round((bb-aa)/4))){
          if((hor?g(q,pos):g(pos,q))>edgeCut*.72) hit++;
          n++;
        }
        const ok=hit/Math.max(1,n)>=.32;
        if(ok){good++;run++;bestRun=Math.max(bestRun,run);}else run=0;
      }
      return {occ:good/bins,long:bestRun/bins,score:good/bins*.6+bestRun/bins*.4};
    };
    const seek=(hor,base,a,b)=>{
      const maxOff=Math.max(10,Math.round(Math.min(w,h)*.025));
      let best={pos:base,score:0,occ:0,long:0};
      for(let off=-maxOff;off<=maxOff;off+=2){
        const pos=base+off;
        if(hor ? (pos<2||pos>h-3):(pos<2||pos>w-3)) continue;
        const c=continuity(hor,pos,a,b);
        if(c.score>best.score) best={pos,...c};
      }
      return best;
    };
    const top=seek(true,r.y,r.x,r.x2),bottom=seek(true,r.y2,r.x,r.x2);
    const left=seek(false,r.x,r.y,r.y2),right=seek(false,r.x2,r.y,r.y2);
    const edges=[top,bottom,left,right];
    const strong=edges.filter(e=>e.score>=.40).length;
    if(strong<4) {
      if(log) log(`V102D contour rejected edges=${strong}/4`);
      return null;
    }
    const x=Math.min(left.pos,right.pos), y=Math.min(top.pos,bottom.pos);
    const x2=Math.max(left.pos,right.pos), y2=Math.max(top.pos,bottom.pos);
    const rw=x2-x,rh=y2-y;
    if(rw<20||rh<20) return null;
    const score=edges.reduce((a,e)=>a+e.score,0)/4;
    if(log) log(`V102D contour edges=4/4 score=${score.toFixed(2)}`);
    return {x:x/w,y:y/h,w:rw/w,h:rh/h,edges:4,score};
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
