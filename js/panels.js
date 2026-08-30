// NTH SHELF V85 — V79 BASELINE / GUTTER-INTERSECTION FALLBACK
// Freshly based on V78. V73 remains authoritative whenever it contains the tap.
// V85 replaces only the fallback with gutter-intersection analysis; no V80-V84 detector code is included.

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
  // Returns a Promise<Array<{x,y,w,h}>> with fractional (0..1) page coordinates.
  // Resolves to [] if detection fails or the page doesn't look panelized.
  // `log`, if provided, receives diagnostic strings — used by the reader's
  // on-device debug overlay so real-device runs can be inspected directly
  // instead of guessed at from screenshots.
  detect(imgUrl, log) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        try {
          resolve(this._analyze(img, log));
        } catch (err) {
          console.warn("Panel detection failed:", err);
          if (log) log(`ERROR: ${err.message}`);
          resolve([]);
        }
      };
      img.onerror = () => resolve([]);
      img.src = imgUrl;
    });
  },

  // V85 fallback: gutter-intersection test. Instead of walking outward
  // from one pixel, build horizontal and vertical gutter candidates from
  // short rectangular strips centered on the exact tap. The four selected
  // gutter bands then form the panel cell containing that tap.
  detectTapLocalFallback(imgUrl, relX, relY, log) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        try { resolve(this._analyzeGutterIntersection(img, relX, relY, log)); }
        catch (err) {
          console.warn("V85 gutter-intersection fallback failed:", err);
          if (log) log(`V85 intersection ERROR: ${err.message}`);
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = imgUrl;
    });
  },

  _analyzeGutterIntersection(img, relX, relY, log) {
    const maxDim = 900;
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));
    const tx = clamp01(relX) * (w - 1);
    const ty = clamp01(relY) * (h - 1);
    if (log) log(`V85 intersection source=${img.width}x${img.height} downscaled=${w}x${h} tap=${Math.round(tx)},${Math.round(ty)}`);

    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h).data;
    const lum = new Float32Array(w * h);
    for (let y=0; y<h; y++) for (let x=0; x<w; x++) {
      const i=(y*w+x)*4;
      lum[y*w+x]=0.299*data[i]+0.587*data[i+1]+0.114*data[i+2];
    }

    const median = (arr) => {
      if (!arr.length) return 0;
      const a = arr.slice().sort((x,y)=>x-y);
      return a[Math.floor(a.length*0.5)];
    };

    // Evaluate several local window sizes. A real gutter can be short in
    // one dimension, so requiring the whole page row/column would miss it.
    const hFractions=[0.14,0.22,0.34,0.50,0.70];
    const vFractions=[0.14,0.22,0.34,0.50,0.70];
    const statsH=[], statsV=[];

    function rowStats(y, half) {
      const xa=Math.max(0,Math.floor(tx-half)), xb=Math.min(w-1,Math.ceil(tx+half));
      const n=xb-xa+1;
      let sum=0,sumSq=0;
      for(let x=xa;x<=xb;x++){const v=lum[y*w+x];sum+=v;sumSq+=v*v;}
      const mean=sum/n;
      const sd=Math.sqrt(Math.max(0,sumSq/n-mean*mean));
      let above=0,below=0,na=0,nb=0;
      const depth=Math.max(1,Math.round(Math.min(half*0.35, h*0.018)));
      for(let d=1;d<=depth;d++){
        const ya=y-d,yb=y+d;
        if(ya>=0){for(let x=xa;x<=xb;x++) above+=lum[ya*w+x];na+=n;}
        if(yb<h){for(let x=xa;x<=xb;x++) below+=lum[yb*w+x];nb+=n;}
      }
      const am=na?above/na:mean, bm=nb?below/nb:mean;
      const sideContrast=(Math.abs(mean-am)+Math.abs(mean-bm))/2;
      return {sd,contrast:sideContrast};
    }

    function colStats(x, half) {
      const ya=Math.max(0,Math.floor(ty-half)), yb=Math.min(h-1,Math.ceil(ty+half));
      const n=yb-ya+1;
      let sum=0,sumSq=0;
      for(let y=ya;y<=yb;y++){const v=lum[y*w+x];sum+=v;sumSq+=v*v;}
      const mean=sum/n;
      const sd=Math.sqrt(Math.max(0,sumSq/n-mean*mean));
      let left=0,right=0,nl=0,nr=0;
      const depth=Math.max(1,Math.round(Math.min(half*0.35, w*0.018)));
      for(let d=1;d<=depth;d++){
        const xl=x-d,xr=x+d;
        if(xl>=0){for(let y=ya;y<=yb;y++) left+=lum[y*w+xl];nl+=n;}
        if(xr<w){for(let y=ya;y<=yb;y++) right+=lum[y*w+xr];nr+=n;}
      }
      const lm=nl?left/nl:mean, rm=nr?right/nr:mean;
      const sideContrast=(Math.abs(mean-lm)+Math.abs(mean-rm))/2;
      return {sd,contrast:sideContrast};
    }

    function buildHorizontalProfile(fraction){
      const half=Math.max(5, Math.round(w*fraction/2));
      const p=new Float32Array(h);
      for(let y=0;y<h;y++){
        const st=rowStats(y,half);
        // Lower is more gutter-like. Contrast around the strip is positive
        // evidence that the quiet row is actually separating content.
        p[y]=st.sd/(st.contrast+6);
      }
      return {p,half};
    }
    function buildVerticalProfile(fraction){
      const half=Math.max(5, Math.round(h*fraction/2));
      const p=new Float32Array(w);
      for(let x=0;x<w;x++){
        const st=colStats(x,half);
        p[x]=st.sd/(st.contrast+6);
      }
      return {p,half};
    }

    function robustCut(profile){
      const vals=Array.from(profile).filter(Number.isFinite);
      const med=median(vals);
      const dev=median(vals.map(v=>Math.abs(v-med)));
      return Math.max(1.5, med-dev*0.9);
    }

    function findCandidates(profile, axisSize, tap, cut){
      const minRun=Math.max(2,Math.round(axisSize*0.004));
      const candidates=[];
      let i=0;
      while(i<axisSize){
        if(profile[i]>cut){i++;continue;}
        const a=i;
        while(i<axisSize && profile[i]<=cut)i++;
        const b=i-1;
        if(b-a+1<minRun)continue;
        const pos=(a+b)/2;
        const dist=Math.abs(pos-tap);
        const run=b-a+1;
        const nearBonus=1/(1+dist/Math.max(1,axisSize*0.20));
        const runBonus=Math.min(1,run/Math.max(2,axisSize*0.012));
        candidates.push({pos,width:run,dist,score:nearBonus*0.65+runBonus*0.35});
      }
      return candidates;
    }

    // Choose the nearest credible gutter on each side of the tap. A gutter
    // must be sustained and score better than the page's own profile noise.
    function chooseSide(cands,tap,axisSize,dir){
      const side=cands.filter(c=>dir<0?c.pos<tap:c.pos>tap);
      if(!side.length)return null;
      side.sort((a,b)=>{
        const ad=Math.abs(a.pos-tap),bd=Math.abs(b.pos-tap);
        return (ad/axisSize)-(bd/axisSize) || b.score-a.score;
      });
      // Don't accept a distant accidental quiet line when a page edge is a
      // more plausible boundary. The fallback is deliberately conservative.
      const c=side[0];
      if(c.dist>axisSize*0.48)return null;
      return c;
    }

    function solveAxis(axis, fractions, axisSize, tap){
      const all=[];
      for(const f of fractions){
        const built=axis==='h'?buildHorizontalProfile(f):buildVerticalProfile(f);
        const cut=robustCut(built.p);
        const cands=findCandidates(built.p,axisSize,tap,cut);
        for(const c of cands) all.push({...c,fraction:f,cut});
      }
      // Deduplicate candidates that describe the same gutter band across
      // window scales, then select independently on each side.
      all.sort((a,b)=>a.pos-b.pos);
      const merged=[];
      for(const c of all){
        const last=merged[merged.length-1];
        if(last && Math.abs(last.pos-c.pos)<=Math.max(2,axisSize*0.008)){
          if(c.score>last.score)Object.assign(last,c);
          last.samples=(last.samples||1)+1;
        } else merged.push({...c,samples:1});
      }
      for(const c of merged)c.score += Math.min(0.25,(c.samples-1)*0.06);
      const left=chooseSide(merged,tap,axisSize,-1);
      const right=chooseSide(merged,tap,axisSize,1);
      return {left,right,candidates:merged};
    }

    const H=solveAxis('h',hFractions,h,ty);
    const V=solveAxis('v',vFractions,w,tx);
    const top=H.left,bottom=H.right,left=V.left,right=V.right;
    if(log) log(`V85 intersection gutters T=${top?Math.round(top.pos):"EDGE"} B=${bottom?Math.round(bottom.pos):"EDGE"} L=${left?Math.round(left.pos):"EDGE"} R=${right?Math.round(right.pos):"EDGE"} candidatesH=${H.candidates.length} candidatesV=${V.candidates.length}`);

    const sx=left?left.pos:0, ex=right?right.pos:w-1;
    const sy=top?top.pos:0, ey=bottom?bottom.pos:h-1;
    const pw=Math.max(0,ex-sx), ph=Math.max(0,ey-sy);
    const found=[top,bottom,left,right].filter(Boolean).length;
    const contains=tx>=Math.min(sx,ex)&&tx<=Math.max(sx,ex)&&ty>=Math.min(sy,ey)&&ty<=Math.max(sy,ey);
    // Require at least two detected sides. One-sided guesses were the source
    // of the oversized regions in V81-V83, so V85 never invents a large panel
    // merely because a page edge is available.
    const bounded=found>=2 && pw>=Math.max(14,w*0.05) && ph>=Math.max(14,h*0.05);
    const notOversized=pw<=w*0.94 && ph<=h*0.94;
    if(!contains || !bounded || !notOversized){
      if(log) log(`V85 intersection REJECTED region=${Math.round(pw)}x${Math.round(ph)} sides=${found} containsTap=${contains} oversized=${!notOversized}`);
      return null;
    }

    const panel={x:Math.min(sx,ex)/w,y:Math.min(sy,ey)/h,w:pw/w,h:ph/h,_v85Intersection:true,_gutterSides:found};
    if(log) log(`V85 intersection ACCEPTED x=${panel.x.toFixed(4)} y=${panel.y.toFixed(4)} w=${panel.w.toFixed(4)} h=${panel.h.toFixed(4)} sides=${found}`);
    return panel;
  },

  _analyze(img, log) {
    const maxDim = 900;
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));
    if (log) log(`source=${img.width}x${img.height} downscaled=${w}x${h}`);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h).data;

    const lumAt = (x, y) => {
      const i = (y * w + x) * 4;
      return 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    };

    // Per-row luminance standard deviation. Flat/uniform rows (any color)
    // score near 0; rows crossing actual art score much higher (empirically
    // 50-90 on real pages vs 0-2 on real gutters — a wide, safe margin).
    const rowStd = new Array(h);
    for (let y = 0; y < h; y++) {
      let sum = 0, sumSq = 0;
      for (let x = 0; x < w; x++) {
        const l = lumAt(x, y);
        sum += l; sumSq += l * l;
      }
      const mean = sum / w;
      rowStd[y] = Math.sqrt(Math.max(0, sumSq / w - mean * mean));
    }

    if (log) {
      const min = Math.min(...rowStd), max = Math.max(...rowStd);
      const flat = rowStd.filter((v) => v < 10).length;
      log(`row-stddev min=${min.toFixed(1)} max=${max.toFixed(1)} flat-rows(<10)=${flat}/${h}`);
    }

    const gutterStdThresh = 10; // luminance stddev below this = "flat" band
    const minRowGutter = Math.max(2, Math.round(h * 0.006));
    const minColGutter = Math.max(2, Math.round(w * 0.006));

    const strips = splitByGutter(rowStd, h, gutterStdThresh, minRowGutter);
    if (log) log(`row-split found ${strips.length} strip(s): ${JSON.stringify(strips)}`);

    const panels = [];

    for (const [sy, ey] of strips) {
      const stripH = ey - sy;
      if (stripH < h * 0.05) continue; // sliver, likely noise

      const colStd = new Array(w);
      for (let x = 0; x < w; x++) {
        let sum = 0, sumSq = 0;
        for (let y = sy; y < ey; y++) {
          const l = lumAt(x, y);
          sum += l; sumSq += l * l;
        }
        const mean = sum / stripH;
        colStd[x] = Math.sqrt(Math.max(0, sumSq / stripH - mean * mean));
      }

      const cols = splitByGutter(colStd, w, gutterStdThresh, minColGutter);
      for (const [sx, ex] of cols) {
        const pw = ex - sx;
        if (pw < w * 0.05) continue;
        panels.push({ x: sx / w, y: sy / h, w: pw / w, h: stripH / h });
      }
    }

    if (log) log(`raw panel count before collapse-check: ${panels.length}`);

    // A single panel spanning basically the whole page isn't a useful
    // detection — treat it the same as "nothing found" so callers fall back.
    if (panels.length <= 1) {
      if (log) log("-> collapsed to 0 (<=1 panel found)");
      return [];
    }
    return panels;
  },
};

// Splits a 1D uniformity-score array into content spans, treating any
// sustained run of low-variance ("flat") samples as a separating gutter.
// Short flat runs (anti-aliasing, a single flat-colored panel background)
// are absorbed into whichever content span they sit inside, rather than
// causing a false split.
function splitByGutter(arr, total, thresh, minGutterRun) {
  const spans = [];
  let contentStart = 0;
  let inGutterRun = false;
  let gutterRunStart = 0;

  for (let i = 0; i <= total; i++) {
    const isGutterSample = i < total ? arr[i] < thresh : true; // sentinel closes final run
    if (isGutterSample) {
      if (!inGutterRun) {
        inGutterRun = true;
        gutterRunStart = i;
      }
    } else if (inGutterRun) {
      const runLen = i - gutterRunStart;
      inGutterRun = false;
      if (runLen >= minGutterRun) {
        if (gutterRunStart - contentStart > 0) spans.push([contentStart, gutterRunStart]);
        contentStart = i;
      }
      // short run: not a real gutter, keep accumulating the current span
    }
  }
  if (total - contentStart > 0) spans.push([contentStart, total]);
  return spans;
}

function clamp01(v) { return Math.min(1, Math.max(0, Number(v) || 0)); }

window.PanelDetect = PanelDetect;
