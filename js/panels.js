// NTH SHELF V84 — V79 BASELINE / FOUR-DIRECTION BOUNDARY WALK
// Freshly based on V78. V73 remains authoritative whenever it contains the tap.
// V84 is rebuilt from V79. V80-V83 detector experiments are not carried forward.

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

  // V84: four-direction boundary walk. This fallback starts at the exact tap
  // and walks outward independently in the four cardinal directions. It does
  // not rank a page-wide set of rectangles. Each direction seeks the nearest
  // sustained separator zone, using local edge support on both sides of the
  // zone. Page edges are valid boundaries when no interior gutter is found.
  detectTapLocalFallback(imgUrl, relX, relY, log) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        try { resolve(this._analyzeTapBoundaryWalk(img, relX, relY, log)); }
        catch (err) {
          console.warn("V84 boundary walk failed:", err);
          if (log) log(`V84 fallback ERROR: ${err.message}`);
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = imgUrl;
    });
  },

  _analyzeTapBoundaryWalk(img, relX, relY, log) {
    const maxDim = 900;
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));
    const tx = clamp01(relX) * (w - 1);
    const ty = clamp01(relY) * (h - 1);
    const x0 = Math.round(tx), y0 = Math.round(ty);
    if (log) log(`V84 walk source=${img.width}x${img.height} downscaled=${w}x${h} tap=${x0},${y0}`);

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

    // Estimate local boundary strength from a short perpendicular corridor.
    // A real gutter should produce a transition into a sustained zone and a
    // transition back out, not merely one strong artwork edge.
    const sampleHalfX = Math.max(8, Math.round(w*0.035));
    const sampleHalfY = Math.max(8, Math.round(h*0.035));
    const profiles = { top:new Float32Array(h), bottom:null, left:new Float32Array(w), right:null };
    profiles.bottom = profiles.top;
    profiles.right = profiles.left;

    for (let y=1; y<h-1; y++) {
      const xa=Math.max(1,x0-sampleHalfX), xb=Math.min(w-2,x0+sampleHalfX);
      let sum=0,n=0;
      for(let x=xa;x<=xb;x++) {
        const a=lum[y*w+x], b=lum[(y-1)*w+x], c=lum[(y+1)*w+x];
        sum += Math.abs(a-b)+Math.abs(c-a); n++;
      }
      profiles.top[y]=sum/(2*Math.max(1,n));
    }
    for (let x=1; x<w-1; x++) {
      const ya=Math.max(1,y0-sampleHalfY), yb=Math.min(h-2,y0+sampleHalfY);
      let sum=0,n=0;
      for(let y=ya;y<=yb;y++) {
        const a=lum[y*w+x], b=lum[y*w+x-1], c=lum[y*w+x+1];
        sum += Math.abs(a-b)+Math.abs(c-a); n++;
      }
      profiles.left[x]=sum/(2*Math.max(1,n));
    }

    const all=[];
    for(let i=1;i<h-1;i++) all.push(profiles.top[i]);
    for(let i=1;i<w-1;i++) all.push(profiles.left[i]);
    all.sort((a,b)=>a-b);
    const med=all.length?all[Math.floor(all.length*0.5)]:0;
    const edgeCut=Math.max(9, med*2.5);
    const zoneQuiet=Math.max(3, edgeCut*0.52);
    const minZone=Math.max(2, Math.round(Math.min(w,h)*0.006));
    const maxWalkY=Math.max(20, Math.round(h*0.49));
    const maxWalkX=Math.max(20, Math.round(w*0.49));

    function walk(profile, start, step, limit, size, axisName) {
      let x=start+step, travelled=0;
      while(x>=1 && x<size-1 && travelled<limit) {
        // Find a candidate quiet corridor, then require a strong transition
        // immediately before and after it.
        if(profile[x] <= zoneQuiet) {
          let rs=x, re=x;
          while(re>=1 && re<size-1 && profile[re] <= zoneQuiet &&
                Math.abs(re-rs) < Math.max(4,minZone*3)) re+=step;
          re-=step;
          const before=rs-step, after=re+step;
          const bg=(before>=1&&before<size-1)?profile[before]:0;
          const ag=(after>=1&&after<size-1)?profile[after]:0;
          const support=Math.min(bg,ag);
          const len=Math.abs(re-rs)+1;
          if(len>=minZone && support>=edgeCut) {
            return { pos:Math.round((rs+re)/2), width:len, support, score:support/Math.max(1,edgeCut), axis:axisName };
          }
          x=re+step; travelled+=len;
        } else { x+=step; travelled++; }
      }
      return null;
    }

    const top=walk(profiles.top,y0,-1,maxWalkY,h,'top');
    const bottom=walk(profiles.top,y0,1,maxWalkY,h,'bottom');
    const left=walk(profiles.left,x0,-1,maxWalkX,w,'left');
    const right=walk(profiles.left,x0,1,maxWalkX,w,'right');

    if(log) log(`V84 walk boundaries T=${top?top.pos:"EDGE"} B=${bottom?bottom.pos:"EDGE"} L=${left?left.pos:"EDGE"} R=${right?right.pos:"EDGE"} edgeCut=${edgeCut.toFixed(1)} zoneQuiet=${zoneQuiet.toFixed(1)}`);

    const sx=left?left.pos:0, ex=right?right.pos:w-1;
    const sy=top?top.pos:0, ey=bottom?bottom.pos:h-1;
    const pw=Math.max(0,ex-sx), ph=Math.max(0,ey-sy);
    const contains=tx>=Math.min(sx,ex)&&tx<=Math.max(sx,ex)&&ty>=Math.min(sy,ey)&&ty<=Math.max(sy,ey);
    const found=[top,bottom,left,right].filter(Boolean).length;

    // Require two independent directions for a normal panel. A single
    // detected side is accepted only when the other axis is effectively a
    // page edge; this prevents a lone interior artwork edge from becoming a
    // huge guessed rectangle while still permitting edge-touching panels.
    const edgeTouchX=!left || !right;
    const edgeTouchY=!top || !bottom;
    const credible = contains && pw>=Math.max(12,w*0.05) && ph>=Math.max(12,h*0.05) &&
      (found>=2 || (found===1 && ((edgeTouchX && pw>=w*0.45) || (edgeTouchY && ph>=h*0.45))));

    if(!credible){
      if(log) log(`V84 walk REJECTED region=${Math.round(pw)}x${Math.round(ph)} sides=${found} containsTap=${contains}`);
      return null;
    }

    const panel={x:Math.min(sx,ex)/w,y:Math.min(sy,ey)/h,w:pw/w,h:ph/h,_v84Fallback:true,_boundarySides:found};
    if(log) log(`V84 walk ACCEPTED x=${panel.x.toFixed(4)} y=${panel.y.toFixed(4)} w=${panel.w.toFixed(4)} h=${panel.h.toFixed(4)} sides=${found}`);
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
