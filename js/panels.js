// NTH SHELF V102 — RESEARCH-ONLY PANEL DETECTOR
//
// This is a clean-room one-off experiment.
// It intentionally discards the V1-V99 panel-detection/selection logic.
//
// It keeps ONLY the five newest research ideas:
//
// 1) Region / barrier reasoning
// 2) Panel-outline + corner/T-junction evidence
// 3) Recursive region splitting
// 4) Contour / shape recovery
// 5) Neighbor / contextual reasoning
//
// Black and grey evidence are both allowed to create barriers, but no legacy
// "black-first", V99 boundary scorer, nearest-valid tie-break, or V100 size
// penalty is used.
//
// The existing reader interface is preserved:
//   PanelDetect.detect(url, log)
//   PanelDetect.detectTapLocalFallback(url, relX, relY, log)

const PanelDetect = {
  detect(imgUrl, log) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        try {
          resolve(this._detectResearchRegions(img, log));
        } catch (err) {
          console.warn("V102 research detection failed:", err);
          if (log) log(`V102 research ERROR: ${err.message}`);
          resolve([]);
        }
      };
      img.onerror = () => resolve([]);
      img.src = imgUrl;
    });
  },

  detectTapLocalFallback(imgUrl, relX, relY, log) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        try {
          resolve(this._analyzeResearchTap(img, relX, relY, log));
        } catch (err) {
          console.warn("V102 research tap detection failed:", err);
          if (log) log(`V102 research tap ERROR: ${err.message}`);
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = imgUrl;
    });
  },

  _prepare(img) {
    const maxDim = 900;
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h).data;
    const lum = new Float32Array(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        lum[y * w + x] = .299 * data[i] + .587 * data[i + 1] + .114 * data[i + 2];
      }
    }

    const samples = [];
    const step = Math.max(1, Math.floor(Math.max(w, h) / 180));
    for (let y = 1; y < h - 1; y += step) {
      for (let x = 1; x < w - 1; x += step) {
        samples.push(this._gradient(lum, w, h, x, y));
      }
    }
    samples.sort((a, b) => a - b);
    const median = samples.length ? samples[Math.floor(samples.length * .5)] : 0;
    const edgeCut = Math.max(8, median * 2.25);
    const quietCut = Math.max(2.25, edgeCut * .42);

    return { lum, w, h, edgeCut, quietCut };
  },

  _gradient(lum, w, h, x, y) {
    const xm = Math.max(0, x - 1), xp = Math.min(w - 1, x + 1);
    const ym = Math.max(0, y - 1), yp = Math.min(h - 1, y + 1);
    return Math.abs(lum[y * w + x] - lum[y * w + xm]) +
           Math.abs(lum[y * w + xp] - lum[y * w + x]) +
           Math.abs(lum[y * w + x] - lum[ym * w + x]) +
           Math.abs(lum[yp * w + x] - lum[y * w + x]);
  },

  // IDEA 1: Region / barrier reasoning.
  //
  // Build a barrier field rather than selecting four winning boundaries.
  // Strong dark lines and quiet-gutter corridors become barriers. The flood
  // from the tap defines the initial panel region.
  _buildBarriers(lum, w, h, edgeCut, quietCut) {
    const hBarrier = new Uint8Array(w * h);
    const vBarrier = new Uint8Array(w * h);

    const dark = 72;
    const run = Math.max(2, Math.round(Math.min(w, h) * .012));

    // Horizontal separators.
    for (let y = 1; y < h - 1; y++) {
      let runStart = -1;
      for (let x = 1; x < w - 1; x++) {
        const g = Math.abs(lum[y * w + x] - lum[(y - 1) * w + x]) +
                  Math.abs(lum[(y + 1) * w + x] - lum[y * w + x]);
        const darkPixel = lum[y * w + x] <= dark;
        const quiet = g <= quietCut;
        const candidate = darkPixel || quiet && g <= edgeCut * .62;
        if (candidate) {
          if (runStart < 0) runStart = x;
        } else if (runStart >= 0) {
          if (x - runStart >= run) {
            for (let xx = runStart; xx < x; xx++) hBarrier[y * w + xx] = 1;
          }
          runStart = -1;
        }
      }
      if (runStart >= 0 && w - 1 - runStart >= run) {
        for (let xx = runStart; xx < w - 1; xx++) hBarrier[y * w + xx] = 1;
      }
    }

    // Vertical separators.
    for (let x = 1; x < w - 1; x++) {
      let runStart = -1;
      for (let y = 1; y < h - 1; y++) {
        const g = Math.abs(lum[y * w + x] - lum[y * w + x - 1]) +
                  Math.abs(lum[y * w + x + 1] - lum[y * w + x]);
        const darkPixel = lum[y * w + x] <= dark;
        const quiet = g <= quietCut;
        const candidate = darkPixel || quiet && g <= edgeCut * .62;
        if (candidate) {
          if (runStart < 0) runStart = y;
        } else if (runStart >= 0) {
          if (y - runStart >= run) {
            for (let yy = runStart; yy < y; yy++) vBarrier[yy * w + x] = 1;
          }
          runStart = -1;
        }
      }
      if (runStart >= 0 && h - 1 - runStart >= run) {
        for (let yy = runStart; yy < h - 1; yy++) vBarrier[yy * w + x] = 1;
      }
    }

    // Slightly thicken barriers to tolerate tiny line breaks.
    this._thickenHorizontal(hBarrier, w, h, 1);
    this._thickenVertical(vBarrier, w, h, 1);

    return { hBarrier, vBarrier };
  },

  _thickenHorizontal(mask, w, h, radius) {
    const copy = mask.slice();
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (!copy[y * w + x]) continue;
        for (let d = 1; d <= radius; d++) {
          if (x - d >= 0) mask[y * w + x - d] = 1;
          if (x + d < w) mask[y * w + x + d] = 1;
        }
      }
    }
  },

  _thickenVertical(mask, w, h, radius) {
    const copy = mask.slice();
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (!copy[y * w + x]) continue;
        for (let d = 1; d <= radius; d++) {
          if (y - d >= 0) mask[(y - d) * w + x] = 1;
          if (y + d < h) mask[(y + d) * w + x] = 1;
        }
      }
    }
  },

  _floodRegion(lum, w, h, tx, ty, barriers) {
    const sx = Math.max(1, Math.min(w - 2, Math.round(tx)));
    const sy = Math.max(1, Math.min(h - 2, Math.round(ty)));
    const total = w * h;
    const seen = new Uint8Array(total);
    const qx = new Int32Array(total);
    const qy = new Int32Array(total);
    let head = 0, tail = 0, count = 0;
    let minX = sx, maxX = sx, minY = sy, maxY = sy;
    qx[tail] = sx; qy[tail] = sy; tail++;
    seen[sy * w + sx] = 1;

    const crosses = (x, y, nx, ny) => {
      if (nx !== x) {
        const xx = Math.min(x, nx);
        return !!barriers.vBarrier[y * w + xx];
      }
      const yy = Math.min(y, ny);
      return !!barriers.hBarrier[yy * w + x];
    };

    while (head < tail && count < Math.min(total, 500000)) {
      const x = qx[head], y = qy[head];
      head++; count++;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;

      const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
      for (const [dx, dy] of dirs) {
        const nx = x + dx, ny = y + dy;
        if (nx < 1 || nx >= w - 1 || ny < 1 || ny >= h - 1) continue;
        if (crosses(x, y, nx, ny)) continue;
        const ni = ny * w + nx;
        if (seen[ni]) continue;
        seen[ni] = 1;
        qx[tail] = nx; qy[tail] = ny; tail++;
      }
    }

    const bw = maxX - minX + 1, bh = maxY - minY + 1;
    const area = count / Math.max(1, total);
    const fill = count / Math.max(1, bw * bh);
    if (area < .006 || area > .96 || fill < .12) return null;

    return {
      x: minX / w,
      y: minY / h,
      w: bw / w,
      h: bh / h,
      _researchRegion: true,
      _regionArea: area,
      _regionFill: fill,
      _regionCount: count
    };
  },

  // IDEA 2: Panel-outline / corner evidence.
  //
  // A candidate becomes stronger when its four sides have sustained edge
  // support and the horizontal/vertical evidence meets near its corners.
  _outlineEvidence(lum, w, h, p, edgeCut) {
    const x0 = Math.max(1, Math.round(p.x * w));
    const y0 = Math.max(1, Math.round(p.y * h));
    const x1 = Math.min(w - 2, Math.round((p.x + p.w) * w));
    const y1 = Math.min(h - 2, Math.round((p.y + p.h) * h));
    if (x1 <= x0 || y1 <= y0) return { score: 0, corners: 0, sides: 0 };

    const sideSupport = (horizontal, pos, a, b) => {
      let hit = 0, n = 0;
      const step = Math.max(1, Math.round((b - a) / 100));
      for (let q = a; q <= b; q += step) {
        const g = horizontal
          ? Math.abs(lum[pos * w + q] - lum[(pos - 1) * w + q]) +
            Math.abs(lum[(pos + 1) * w + q] - lum[pos * w + q])
          : Math.abs(lum[q * w + pos] - lum[q * w + pos - 1]) +
            Math.abs(lum[q * w + pos + 1] - lum[q * w + pos]);
        if (g > edgeCut) hit++;
        n++;
      }
      return hit / Math.max(1, n);
    };

    const top = sideSupport(true, y0, x0, x1);
    const bottom = sideSupport(true, y1, x0, x1);
    const left = sideSupport(false, x0, y0, y1);
    const right = sideSupport(false, x1, y0, y1);
    const sides = [top, bottom, left, right].filter(v => v > .18).length;

    const tol = Math.max(5, Math.round(Math.min(w, h) * .02));
    const corner = (cx, cy) => {
      let hHit = 0, vHit = 0;
      for (let d = -tol; d <= tol; d++) {
        const x = Math.max(1, Math.min(w - 2, cx + d));
        const y = Math.max(1, Math.min(h - 2, cy + d));
        if (this._gradient(lum, w, h, x, cy) > edgeCut) hHit++;
        if (this._gradient(lum, w, h, cx, y) > edgeCut) vHit++;
      }
      return Math.min(1, (hHit + vHit) / Math.max(1, 4 * tol));
    };

    const corners = [corner(x0,y0),corner(x1,y0),corner(x0,y1),corner(x1,y1)];
    const cornerScore = corners.reduce((a,b)=>a+b,0)/4;
    const score = (sides / 4) * .68 + cornerScore * .32;
    return { score, corners: cornerScore, sides, sideValues: [top,bottom,left,right] };
  },

  // IDEA 3: Recursive splitting.
  //
  // If a candidate contains a strong separator crossing most of its width or
  // height, split it and keep the child containing the tap.
  _recursiveSplit(lum, w, h, tx, ty, p, edgeCut, quietCut, log) {
    let cur = {...p};
    let changed = false;
    for (let pass = 0; pass < 3; pass++) {
      const next = this._splitOnce(lum, w, h, tx, ty, cur, edgeCut, quietCut);
      if (!next) break;
      cur = next;
      changed = true;
    }
    if (!changed) return null;
    cur._recursiveResearch = true;
    if (log) log(`V102 recursive split -> ${cur.x.toFixed(3)},${cur.y.toFixed(3)},${cur.w.toFixed(3)},${cur.h.toFixed(3)}`);
    return cur;
  },

  _splitOnce(lum, w, h, tx, ty, p, edgeCut, quietCut) {
    const x0 = Math.max(1, Math.round(p.x*w));
    const y0 = Math.max(1, Math.round(p.y*h));
    const x1 = Math.min(w-2, Math.round((p.x+p.w)*w));
    const y1 = Math.min(h-2, Math.round((p.y+p.h)*h));
    const pw = x1-x0, ph = y1-y0;
    if (pw < w*.08 || ph < h*.08) return null;

    let bestH = null, bestV = null;
    for (let y = y0 + Math.round(ph*.12); y < y1 - Math.round(ph*.12); y++) {
      let quiet = 0, total = 0, strong = 0;
      for (let x = x0 + Math.round(pw*.08); x < x1 - Math.round(pw*.08); x += 2) {
        const g = Math.abs(lum[y*w+x]-lum[(y-1)*w+x]) +
                  Math.abs(lum[(y+1)*w+x]-lum[y*w+x]);
        if (g <= quietCut) quiet++;
        if (g > edgeCut) strong++;
        total++;
      }
      if (total && quiet/total > .78 && strong < total*.22) {
        const score = quiet/total;
        if (!bestH || score > bestH.score) bestH = {pos:y,score};
      }
    }

    for (let x = x0 + Math.round(pw*.12); x < x1 - Math.round(pw*.12); x++) {
      let quiet = 0, total = 0, strong = 0;
      for (let y = y0 + Math.round(ph*.08); y < y1 - Math.round(ph*.08); y += 2) {
        const g = Math.abs(lum[y*w+x]-lum[y*w+x-1]) +
                  Math.abs(lum[y*w+x+1]-lum[y*w+x]);
        if (g <= quietCut) quiet++;
        if (g > edgeCut) strong++;
        total++;
      }
      if (total && quiet/total > .78 && strong < total*.22) {
        const score = quiet/total;
        if (!bestV || score > bestV.score) bestV = {pos:x,score};
      }
    }

    const px = tx*w, py = ty*h;
    if (bestH && py > bestH.pos) {
      return {...p, y: bestH.pos/h, h: ((y1-bestH.pos)/h)};
    }
    if (bestH && py < bestH.pos) {
      return {...p, h: ((bestH.pos-y0)/h)};
    }
    if (bestV && px > bestV.pos) {
      return {...p, x: bestV.pos/w, w: ((x1-bestV.pos)/w)};
    }
    if (bestV && px < bestV.pos) {
      return {...p, w: ((bestV.pos-x0)/w)};
    }
    return null;
  },

  // IDEA 4: Contour / shape recovery.
  //
  // Expand a fragmented region only when nearby boundaries support the same
  // rectangle. This recovers shape; it is not a generic "make it bigger" rule.
  _recoverContour(lum, w, h, p, edgeCut) {
    const x0 = Math.max(1, Math.round(p.x*w));
    const y0 = Math.max(1, Math.round(p.y*h));
    const x1 = Math.min(w-2, Math.round((p.x+p.w)*w));
    const y1 = Math.min(h-2, Math.round((p.y+p.h)*h));
    const padX = Math.max(4, Math.round(w*.018));
    const padY = Math.max(4, Math.round(h*.018));

    const supportH = (y, xa, xb) => {
      let hit=0,n=0;
      for(let x=xa;x<=xb;x+=2){
        if(this._gradient(lum,w,h,x,Math.max(1,Math.min(h-2,y)))>edgeCut) hit++;
        n++;
      }
      return hit/Math.max(1,n);
    };
    const supportV = (x, ya, yb) => {
      let hit=0,n=0;
      for(let y=ya;y<=yb;y+=2){
        if(this._gradient(lum,w,h,Math.max(1,Math.min(w-2,x)),y)>edgeCut) hit++;
        n++;
      }
      return hit/Math.max(1,n);
    };

    let nx0=x0,ny0=y0,nx1=x1,ny1=y1;
    if (supportH(y0-padY,x0,x1) > .30) ny0=Math.max(1,y0-padY);
    if (supportH(y1+padY,x0,x1) > .30) ny1=Math.min(h-2,y1+padY);
    if (supportV(x0-padX,y0,y1) > .30) nx0=Math.max(1,x0-padX);
    if (supportV(x1+padX,y0,y1) > .30) nx1=Math.min(w-2,x1+padX);

    if(nx1<=nx0||ny1<=ny0) return null;
    const changed=Math.abs(nx0-x0)+Math.abs(ny0-y0)+Math.abs(nx1-x1)+Math.abs(ny1-y1);
    if(changed<4) return null;

    return {
      x:nx0/w,y:ny0/h,w:(nx1-nx0)/w,h:(ny1-ny0)/h,
      _contourRecovered:true
    };
  },

  // IDEA 5: Neighbor/context reasoning.
  //
  // Look for a strong separator inside the candidate. A strong internal
  // separator suggests the region may actually contain neighboring panels.
  _neighborContext(lum, w, h, p, edgeCut, quietCut) {
    const x0=Math.max(1,Math.round(p.x*w)), y0=Math.max(1,Math.round(p.y*h));
    const x1=Math.min(w-2,Math.round((p.x+p.w)*w)), y1=Math.min(h-2,Math.round((p.y+p.h)*h));
    const pw=x1-x0, ph=y1-y0;
    let bestH=0,bestV=0;

    for(let y=y0+Math.round(ph*.16);y<y1-Math.round(ph*.16);y+=Math.max(2,Math.round(ph*.025))){
      let quiet=0,total=0;
      for(let x=x0+Math.round(pw*.12);x<x1-Math.round(pw*.12);x+=2){
        const g=Math.abs(lum[y*w+x]-lum[(y-1)*w+x])+Math.abs(lum[(y+1)*w+x]-lum[y*w+x]);
        if(g<=quietCut) quiet++;
        total++;
      }
      if(total) bestH=Math.max(bestH,quiet/total);
    }

    for(let x=x0+Math.round(pw*.16);x<x1-Math.round(pw*.16);x+=Math.max(2,Math.round(pw*.025))){
      let quiet=0,total=0;
      for(let y=y0+Math.round(ph*.12);y<y1-Math.round(ph*.12);y+=2){
        const g=Math.abs(lum[y*w+x]-lum[y*w+x-1])+Math.abs(lum[y*w+x+1]-lum[y*w+x]);
        if(g<=quietCut) quiet++;
        total++;
      }
      if(total) bestV=Math.max(bestV,quiet/total);
    }

    const internal=Math.max(bestH,bestV);
    const isolated=internal < .72 ? 1 : Math.max(0,1-(internal-.72)/.20);
    return {internal, isolated, splitSignal: internal};
  },

  _scoreCandidate(lum, w, h, p, tx, ty, edgeCut, quietCut) {
    const outline=this._outlineEvidence(lum,w,h,p,edgeCut);
    const context=this._neighborContext(lum,w,h,p,edgeCut,quietCut);

    // Region geometry is primary, then outline, then context.
    // No legacy boundary score is imported.
    const area=Math.max(.001,Math.min(.80,p.w*p.h));
    const reasonableArea=area < .70 ? 1 : .45;
    const tapInside =
      tx >= p.x && tx <= p.x+p.w && ty >= p.y && ty <= p.y+p.h ? 1 : 0;

    const score =
      tapInside * 2.0 +
      outline.score * 2.2 +
      context.isolated * 1.8 +
      reasonableArea * .35;

    return {score,outline,context};
  },

  _analyzeResearchTap(img, relX, relY, log) {
    const d=this._prepare(img);
    const {lum,w,h,edgeCut,quietCut}=d;
    const tx=clamp01(relX)*(w-1);
    const ty=clamp01(relY)*(h-1);
    const barriers=this._buildBarriers(lum,w,h,edgeCut,quietCut);

    const candidates=[];
    const region=this._floodRegion(lum,w,h,tx,ty,barriers);
    if(region){
      candidates.push({...region,_source:"region"});
      const split=this._recursiveSplit(lum,w,h,tx,ty,region,edgeCut,quietCut,log);
      if(split) candidates.push({...split,_source:"recursive-region"});
      const rec=this._recoverContour(lum,w,h,region,edgeCut);
      if(rec) candidates.push({...rec,_source:"contour-region"});
      if(split){
        const recSplit=this._recoverContour(lum,w,h,split,edgeCut);
        if(recSplit) candidates.push({...recSplit,_source:"recursive-contour"});
      }
    }

    // Generate several local seeds around the tap. This lets the region model
    // recover when a barrier has a small gap at the exact tap.
    const offsets=[
      [0,0],[.012,0],[-.012,0],[0,.012],[0,-.012],
      [.024,0],[-.024,0],[0,.024],[0,-.024]
    ];
    for(const [ox,oy] of offsets){
      const r=this._floodRegion(lum,w,h,
        Math.max(1,Math.min(w-2,tx+ox*w)),
        Math.max(1,Math.min(h-2,ty+oy*h)),barriers);
      if(r) candidates.push({...r,_source:"near-tap-region"});
    }

    const unique=[];
    for(const c of candidates){
      if(!c) continue;
      if(unique.some(u=>Math.abs(u.x-c.x)<.012&&Math.abs(u.y-c.y)<.012&&Math.abs(u.w-c.w)<.025&&Math.abs(u.h-c.h)<.025)) continue;
      unique.push(c);
    }

    const scored=unique
      .filter(c=>tx>=c.x&&tx<=c.x+c.w&&ty>=c.y&&ty<=c.y+c.h)
      .map(c=>({c,...this._scoreCandidate(lum,w,h,c,tx/w,ty/h,edgeCut,quietCut)}))
      .sort((a,b)=>b.score-a.score);

    if(!scored.length) return null;
    const best=scored[0];

    if(log){
      log(`V102 research candidates=${scored.length} winner=${best.c._source} score=${best.score.toFixed(2)} outline=${best.outline.score.toFixed(2)} isolated=${best.context.isolated.toFixed(2)}`);
      if(scored[1]) log(`V102 research runnerUp=${scored[1].c._source} score=${scored[1].score.toFixed(2)}`);
    }

    return {
      x:best.c.x,y:best.c.y,w:best.c.w,h:best.c.h,
      _v102ResearchOnly:true,
      _v102Source:best.c._source,
      _v102Score:best.score,
      _v102Outline:best.outline.score,
      _v102Context:best.context.isolated
    };
  },

  // Research-only full-page detection. Seeds are distributed across the page,
  // each seed produces an enclosed region, and overlapping results are merged.
  _detectResearchRegions(img, log) {
    const d=this._prepare(img);
    const {lum,w,h,edgeCut,quietCut}=d;
    const barriers=this._buildBarriers(lum,w,h,edgeCut,quietCut);
    const candidates=[];
    const gx=Math.max(4,Math.round(w/180));
    const gy=Math.max(4,Math.round(h/180));

    for(let y=gy;y<h-gy;y+=Math.max(gy,Math.round(h/8))){
      for(let x=gx;x<w-gx;x+=Math.max(gx,Math.round(w/8))){
        const r=this._floodRegion(lum,w,h,x,y,barriers);
        if(r) candidates.push(r);
      }
    }

    const unique=[];
    for(const c of candidates){
      if(unique.some(u=>this._iou(u,c)>.72)) continue;
      unique.push(c);
    }

    const scored=unique
      .map(c=>({c,...this._scoreCandidate(lum,w,h,c,c.x+c.w/2,c.y+c.h/2,edgeCut,quietCut)}))
      .filter(s=>s.outline.sides>=2 && s.context.isolated>.25)
      .sort((a,b)=>b.score-a.score);

    const panels=[];
    for(const s of scored){
      let p=s.c;
      const split=this._recursiveSplit(lum,w,h,(p.x+p.w/2)*w,(p.y+p.h/2)*h,p,edgeCut,quietCut,null);
      if(split) p=split;
      const recovered=this._recoverContour(lum,w,h,p,edgeCut);
      if(recovered) p=recovered;
      if(!panels.some(q=>this._iou(q,p)>.72)) panels.push(p);
    }

    if(log) log(`V102 research-only full-page regions=${panels.length}`);
    return panels.map(p=>({
      x:p.x,y:p.y,w:p.w,h:p.h,
      _v102ResearchOnly:true
    }));
  },

  _iou(a,b){
    const ax1=a.x, ay1=a.y, ax2=a.x+a.w, ay2=a.y+a.h;
    const bx1=b.x, by1=b.y, bx2=b.x+b.w, by2=b.y+b.h;
    const ix=Math.max(0,Math.min(ax2,bx2)-Math.max(ax1,bx1));
    const iy=Math.max(0,Math.min(ay2,by2)-Math.max(ay1,by1));
    const inter=ix*iy;
    const ua=a.w*a.h+b.w*b.h-inter;
    return inter/Math.max(.000001,ua);
  }
};

function clamp01(v){
  return Math.min(1,Math.max(0,Number(v)||0));
}

window.PanelDetect=PanelDetect;
