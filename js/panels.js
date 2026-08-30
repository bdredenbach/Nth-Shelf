// NTH SHELF V86 — V79 BASELINE / GUTTER CONTINUITY
// Freshly based on V79. V73 remains authoritative whenever it contains the tap.
// V86 changes only the tap-local fallback by requiring gutter continuity; no V80-V85 detector code is included.

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

  // V86 fallback: inspect only the neighborhood of the exact tap. This is
  // not a page-wide panel detector. It looks for a gutter zone bracketed by
  // edge energy and uses the nearest credible zone on each side of the tap.
  detectTapLocalFallback(imgUrl, relX, relY, log) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        try { resolve(this._analyzeTapLocalFallback(img, relX, relY, log)); }
        catch (err) {
          console.warn("V86 tap-local fallback failed:", err);
          if (log) log(`V86 fallback ERROR: ${err.message}`);
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = imgUrl;
    });
  },

  _analyzeTapLocalFallback(img, relX, relY, log) {
    const maxDim = 900;
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));
    const tx = clamp01(relX) * (w - 1);
    const ty = clamp01(relY) * (h - 1);
    if (log) log(`V86 fallback source=${img.width}x${img.height} downscaled=${w}x${h} tap=${Math.round(tx)},${Math.round(ty)}`);

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

    const x0=Math.round(tx), y0=Math.round(ty);
    const xHalf=Math.max(10, Math.round(w*0.045));
    const yHalf=Math.max(10, Math.round(h*0.045));
    const gradH=new Float32Array(h);
    const gradV=new Float32Array(w);

    for(let y=1;y<h-1;y++){
      const xa=Math.max(1,x0-xHalf), xb=Math.min(w-2,x0+xHalf);
      let sum=0,n=0;
      for(let x=xa;x<=xb;x++){
        sum += Math.abs(lum[y*w+x]-lum[(y-1)*w+x]) +
               Math.abs(lum[(y+1)*w+x]-lum[y*w+x]);
        n++;
      }
      gradH[y]=sum/(2*Math.max(1,n));
    }

    for(let x=1;x<w-1;x++){
      const ya=Math.max(1,y0-yHalf), yb=Math.min(h-2,y0+yHalf);
      let sum=0,n=0;
      for(let y=ya;y<=yb;y++){
        sum += Math.abs(lum[y*w+x]-lum[y*w+(x-1)]) +
               Math.abs(lum[y*w+(x+1)]-lum[y*w+x]);
        n++;
      }
      gradV[x]=sum/(2*Math.max(1,n));
    }

    const samples=[];
    for(let i=1;i<h-1;i++) samples.push(gradH[i]);
    for(let i=1;i<w-1;i++) samples.push(gradV[i]);
    samples.sort((a,b)=>a-b);
    const med=samples.length?samples[Math.floor(samples.length*0.5)]:0;
    const edgeCut=Math.max(9,med*2.5);
    const quietCut=Math.max(2.5,edgeCut*0.44);

    // V86 continuity check: a real gutter should persist across multiple
    // neighboring samples perpendicular to its direction. A single quiet
    // pixel/short stroke can fool the 1D profile, but a true separator tends
    // to remain quiet across a meaningful span of the panel. We keep V79's
    // thresholds and edge tests unchanged; continuity is an additional gate.
    function horizontalContinuity(y, runStart, runEnd) {
      const span = Math.max(18, Math.round(w * 0.12));
      const xa = Math.max(1, x0 - span), xb = Math.min(w - 2, x0 + span);
      const segments = 5;
      let good = 0, total = 0;
      for (let s=0; s<segments; s++) {
        const a = Math.round(xa + (xb-xa) * s / segments);
        const b = Math.max(a, Math.round(xa + (xb-xa) * (s+1) / segments));
        let sum=0,n=0;
        for (let x=a; x<=b; x++) {
          const ya=Math.max(1, runStart), yb=Math.min(h-2, runEnd);
          for (let y=ya; y<=yb; y++) {
            sum += Math.abs(lum[y*w+x]-lum[(y-1)*w+x]);
            n++;
          }
        }
        const mean=n ? sum/n : Infinity;
        total++;
        if (mean <= quietCut) good++;
      }
      return total ? good/total : 0;
    }

    function verticalContinuity(x, runStart, runEnd) {
      const span = Math.max(18, Math.round(h * 0.12));
      const ya = Math.max(1, y0 - span), yb = Math.min(h - 2, y0 + span);
      const segments = 5;
      let good = 0, total = 0;
      for (let s=0; s<segments; s++) {
        const a = Math.round(ya + (yb-ya) * s / segments);
        const b = Math.max(a, Math.round(ya + (yb-ya) * (s+1) / segments));
        let sum=0,n=0;
        for (let y=a; y<=b; y++) {
          const xa=Math.max(1, runStart), xb=Math.min(w-2, runEnd);
          for (let x=xa; x<=xb; x++) {
            sum += Math.abs(lum[y*w+x]-lum[y*w+(x-1)]);
            n++;
          }
        }
        const mean=n ? sum/n : Infinity;
        total++;
        if (mean <= quietCut) good++;
      }
      return total ? good/total : 0;
    }

    function findSide(profile,start,step,limit,size,continuity){
      let x=start+step, travelled=0;
      const maxRun=Math.max(3,Math.round(size*0.012));
      while(x>=1 && x<size-1 && travelled<limit){
        if(profile[x] <= quietCut){
          const rs=x;
          let re=x;
          while(re>=1 && re<size-1 && profile[re] <= quietCut &&
                Math.abs(re-rs)<maxRun) re+=step;
          re-=step;
          const before=rs-step, after=re+step;
          const bg=(before>=1&&before<size-1)?profile[before]:0;
          const ag=(after>=1&&after<size-1)?profile[after]:0;
          const support=(Math.max(0,bg)+Math.max(0,ag))/2;
          const len=Math.abs(re-rs)+1;
          const continuityScore=continuity(Math.round((rs+re)/2), Math.min(rs,re), Math.max(rs,re));
          if(len>=2 && support>=edgeCut && continuityScore>=0.60) {
            return {pos:Math.round((rs+re)/2), width:len, score:support/Math.max(1,edgeCut), continuity:continuityScore};
          }
          x=re+step;
          travelled+=len;
        } else {
          x+=step;
          travelled++;
        }
      }
      return null;
    }

    const top=findSide(gradH,y0,-1,Math.max(12,Math.round(h*0.48)),h,horizontalContinuity);
    const bottom=findSide(gradH,y0,1,Math.max(12,Math.round(h*0.48)),h,horizontalContinuity);
    const left=findSide(gradV,x0,-1,Math.max(12,Math.round(w*0.48)),w,verticalContinuity);
    const right=findSide(gradV,x0,1,Math.max(12,Math.round(w*0.48)),w,verticalContinuity);

    if(log) log(`V86 fallback gutters T=${top?top.pos:"-"} B=${bottom?bottom.pos:"-"} L=${left?left.pos:"-"} R=${right?right.pos:"-"} edgeCut=${edgeCut.toFixed(1)} quietCut=${quietCut.toFixed(1)} continuity>=0.60`);

    const sx=left?left.pos:0, ex=right?right.pos:w-1;
    const sy=top?top.pos:0, ey=bottom?bottom.pos:h-1;
    const pw=Math.max(0,ex-sx), ph=Math.max(0,ey-sy);
    const contains=tx>=Math.min(sx,ex)&&tx<=Math.max(sx,ex)&&ty>=Math.min(sy,ey)&&ty<=Math.max(sy,ey);
    const found=[top,bottom,left,right].filter(Boolean).length;
    const credible=contains && pw>=Math.max(12,w*0.05) && ph>=Math.max(12,h*0.05) &&
      (found>=2 || (found>=1 && (pw>=w*0.84 || ph>=h*0.84)));

    if(!credible){
      if(log) log(`V86 fallback REJECTED region=${Math.round(pw)}x${Math.round(ph)} sides=${found} containsTap=${contains}`);
      return null;
    }

    const panel={x:Math.min(sx,ex)/w,y:Math.min(sy,ey)/h,w:pw/w,h:ph/h,_v86Fallback:true,_gutterSides:found};
    if(log) log(`V86 fallback ACCEPTED x=${panel.x.toFixed(4)} y=${panel.y.toFixed(4)} w=${panel.w.toFixed(4)} h=${panel.h.toFixed(4)} sides=${found}`);
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
