// Conservative proposals from quiet gutters connected to the page exterior.
// PanelClosedFrames repeats its divider, inset, overlap and corner checks
// before any proposal can own a tap.
const PanelGutterFrames = (() => {
  'use strict';
  function quietBackground(rgba, w, h, options = {}) {
    if (!Number.isInteger(w) || !Number.isInteger(h) || w < 80 || h < 80 ||
        w > 900 || h > 900 || !rgba || rgba.length !== w * h * 4) return null;
    const pixel = (x, y, c) => rgba[(y * w + x) * 4 + c];
    const border = [];
    for (let x = 0; x < w; x += 3) for (const y of [0, h - 1])
      border.push([0, 1, 2].map(c => pixel(x, y, c)));
    for (let y = 0; y < h; y += 3) for (const x of [0, w - 1])
      border.push([0, 1, 2].map(c => pixel(x, y, c)));
    const rgb = [0, 1, 2].map(c => border.map(p => p[c]).sort((a, b) => a - b)[border.length >> 1]);
    const luminance = rgb[0] * .299 + rgb[1] * .587 + rgb[2] * .114;
    // Black matte is opt-in: retain the established gray/tinted-gutter
    // route exactly. Its narrow, fixed exterior palette cannot drift into
    // progressively darker artwork as the flood advances.
    if (options.darkMatte === true) {
      if (luminance > 25 || border.filter(p =>
          p.every((v, c) => Math.abs(v - rgb[c]) <= 6)).length / border.length < .97) return null;
    } else if (luminance < 35 || luminance > 205) return null;

    // Absolute color bounds prevent gradual drift from a gutter into artwork.
    const background = new Uint8Array(w * h), queue = new Int32Array(w * h);
    let size = 0, cursor = 0;
    let matches = i => [0, 1, 2].every(c => Math.abs(rgba[i * 4 + c] - rgb[c]) <= (options.darkMatte === true ? 5 : 14));
    if (options.gradient === true && options.darkMatte !== true) {
      // A tinted background may change brightness across the page. Its palette
      // must come from the actual exterior, with almost uniform chroma. Never
      // grow the palette while flooding: artwork cannot cause color drift.
      const palette = border.filter(p =>
        Math.abs((p[1]-p[0])-(rgb[1]-rgb[0])) < 10 &&
        Math.abs((p[2]-p[0])-(rgb[2]-rgb[0])) < 10);
      if (palette.length / border.length < .97) return null;
      const colors = [...new Map(palette.map(p =>
        [p.map(c => Math.round(c/3)).join(','), p])).values()];
      if (colors.length > 150) return null;
      matches = i => colors.some(p => [0,1,2].every(c => Math.abs(rgba[i*4+c]-p[c]) <= 8));
    }
    function offer(i) {
      if (background[i] || !matches(i)) return;
      background[i] = 1;
      queue[size++] = i;
    }
    for (let x = 0; x < w; x++) { offer(x); offer((h - 1) * w + x); }
    for (let y = 0; y < h; y++) { offer(y * w); offer(y * w + w - 1); }
    while (cursor < size) {
      const i = queue[cursor++], x = i % w, y = i / w | 0;
      if (x) offer(i - 1);
      if (x < w - 1) offer(i + 1);
      if (y) offer(i - w);
      if (y < h - 1) offer(i + w);
    }
    return size < w * h * .025 ? null : {background, rgb};
  }
  function proposeRGBA(rgba, w, h, options = {}) {
    const quiet=quietBackground(rgba,w,h,options);if(!quiet)return [];
    const {background,rgb}=quiet;
    function at(vertical, p, t) {
      const x = vertical ? p : t, y = vertical ? t : p;
      return x >= 0 && x < w && y >= 0 && y < h ? background[y * w + x] : 0;
    }
    function dark(vertical, p, t) {
      const x = vertical ? p : t, y = vertical ? t : p;
      if (x < 0 || x >= w || y < 0 || y >= h) return false;
      const i = (y * w + x) * 4;
      return rgba[i] * .299 + rgba[i + 1] * .587 + rgba[i + 2] * .114 < 70;
    }
    let overflow = false;
    function rails(vertical, direction) {
      const length = vertical ? h : w, width = vertical ? w : h, groups = [];
      // Browser downsampling can interrupt a quiet-gutter edge for a few
      // pixels even when its printed ink is continuous. Keep a nearby track
      // alive across that short interruption on the gradient route only.
      // The fitted rail, full-side ink/exterior support, corners and interior
      // vetoes below still have to prove the complete frame.
      const maxGap = options.gradient === true ? 6 : 3;
      let active = [];
      for (let t = 0; t < length; t++) {
        const positions = [], next = [];
        for (let p = 2; p < width - 2; p++) {
          if (!at(vertical, p - direction, t) || at(vertical, p, t)) continue;
          // Matte boundaries may meet bright artwork directly; do not require
          // every proposal sample to be a black printed line. The complete
          // candidate still needs four ink-connected sides, exterior support,
          // corner joins, and all divider/inset vetoes in PanelClosedFrames.
          if (options.darkMatte !== true &&
              ![0, 1, 2].some(d => dark(vertical, p + direction * d, t))) continue;
          positions.push(p);
        }
        for (const p of positions) {
          let best = null;
          for (const group of active) {
            if (t - group.lastT <= maxGap && Math.abs(group.lastP - p) <= 2 &&
                (!best || Math.abs(group.lastP - p) < Math.abs(best.lastP - p))) best = group;
          }
          if (!best) {
            if (groups.length > 4000) { overflow = true; return []; }
            best = {points: []}; groups.push(best);
          }
          best.points.push([t, p]); best.lastT = t; best.lastP = p; next.push(best);
        }
        active = [...new Set([...next, ...active.filter(group => t - group.lastT < maxGap)])];
      }
      const found = [];
      for (const group of groups) {
        const samples = group.points;
        if (samples.length < Math.max(35, length * .075)) continue;
        const mx = samples.reduce((a, p) => a + p[0], 0) / samples.length;
        const my = samples.reduce((a, p) => a + p[1], 0) / samples.length;
        const denominator = samples.reduce((a, p) => a + (p[0] - mx) ** 2, 0);
        const m = samples.reduce((a, p) => a + (p[0] - mx) * (p[1] - my), 0) / denominator;
        const b = my - m * mx;
        const errors = samples.map(p => Math.abs(p[1] - m * p[0] - b)).sort((a, b) => a - b);
        if (!Number.isFinite(m) || Math.abs(m) > .025 || errors[Math.floor(errors.length * .9)] > (options.darkMatte === true ? 1.25 : 1)) continue;
        found.push({m, b, lo: samples[0][0], hi: samples.at(-1)[0]});
      }
      return found;
    }
    const left = rails(true, 1), right = rails(true, -1);
    const top = rails(false, 1), bottom = rails(false, -1);
    if (overflow || [left, right, top, bottom].some(rs => rs.length > 80)) return [];
    const intersect = (a, b) => {
      const x = (b.b + b.m * a.b) / (1 - b.m * a.m);
      return [x, a.m * x + a.b];
    };
    function metrics(quad) {
      const result = [];
      for (let side = 0; side < 4; side++) {
        const a = quad[side], b = quad[(side + 1) % 4];
        const dx = b[0] - a[0], dy = b[1] - a[1], length = Math.hypot(dx, dy);
        const nx = dy / length, ny = -dx / length;
        let ink = 0, outer = 0, total = 0;
        for (let t = 4; t < length - 4; t++) {
          const x = a[0] + dx * t / length, y = a[1] + dy * t / length;
          let darkHere = false;
          for (let d = -1; d <= 2; d++) {
            const xx = Math.round(x - nx * d), yy = Math.round(y - ny * d);
            if (xx < 0 || xx >= w || yy < 0 || yy >= h) continue;
            const i = (yy * w + xx) * 4;
            if (.299 * rgba[i] + .587 * rgba[i + 1] + .114 * rgba[i + 2] < 70) darkHere = true;
          }
          ink += darkHere;
          let back = 0;
          for (let d = 2; d <= 5; d++) {
            const xx = Math.round(x + nx * d), yy = Math.round(y + ny * d);
            if (xx >= 0 && xx < w && yy >= 0 && yy < h && background[yy * w + xx]) back++;
          }
          outer += back >= 2; total++;
        }
        result.push([ink / total, outer / total]);
      }
      return result;
    }
    const found = [];
    for (const l of left) for (const r of right) {
      const lo = Math.max(l.lo, r.lo), hi = Math.min(l.hi, r.hi);
      if (hi - lo < h * .08 || r.b - l.b < w * .12) continue;
      function choose(rs, position) {
        const mid = (l.b + r.b) / 2;
        return rs.filter(a => Math.abs(a.m * mid + a.b - position) <= 8 &&
          Math.min(a.hi, r.b) - Math.max(a.lo, l.b) > (r.b - l.b) * .35)
          .sort((a, b) => Math.abs(a.m * mid + a.b - position) - Math.abs(b.m * mid + b.b - position))[0] ||
          {m: 0, b: position, inferred: true};
      }
      function complete(rs, opposite, position) {
        const own = choose(rs, position);
        if (!own.inferred) return own;
        // A continuation must join an observed endpoint, be no longer than
        // its measured donor, and agree with both side-rail endpoints.
        const candidates = opposite.filter(a => a.hi - a.lo >= r.b - l.b &&
          Math.min(Math.abs(a.hi - l.b), Math.abs(a.lo - r.b)) <= 5 &&
          Math.max(Math.abs(a.m * l.b + a.b - position), Math.abs(a.m * r.b + a.b - position)) <= 5);
        return candidates[0] || own;
      }
      const t = complete(top, bottom, lo), b = complete(bottom, top, hi);
      const q = [intersect(t, l), intersect(t, r), intersect(b, r), intersect(b, l)];
      if (q.some(p => p[0] < 1 || p[0] > w - 2 || p[1] < 1 || p[1] > h - 2)) continue;
      const ms = metrics(q);
      if (ms.some(m => m[0] < .97) || ms.filter(m => m[1] > .6).length < 3) continue;
      // Refining an existing composite requires exterior-connected quiet
      // background on all four sides, not a merely enclosed artwork inset.
      if (options.gradient === true && ms.some(m => m[1] < .95)) continue;
      const area = (r.b - l.b) * (hi - lo) / (w * h);
      if (area < .02 || area > .65) continue;
      // Connected gutter inside a proposal indicates a likely neighbor union.
      let gaps = 0, inside = 0;
      for (let y = Math.ceil(Math.max(q[0][1], q[1][1]) + 3); y < Math.min(q[2][1], q[3][1]) - 3; y++)
        for (let x = Math.ceil(Math.max(q[0][0], q[3][0]) + 3); x < Math.min(q[1][0], q[2][0]) - 3; x++) {
          inside++; gaps += background[y * w + x];
        }
      if (gaps / inside > .008) continue;
      found.push({q, ms, area, fits: [t, b, l, r], color: rgb});
      if (found.length > 40) return [];
    }
    return found;
  }
  // A borderless region is a different proof from an ink-bounded frame.
  // Three independently accepted neighbors must enclose one side of a row;
  // exterior-connected matte must separate its complete artwork from them.
  function openRegionsRGBA(rgba,w,h,anchors){
    if(!Array.isArray(anchors)||anchors.length<3||anchors.length>12)return [];
    const quiet=quietBackground(rgba,w,h,{gradient:true});if(!quiet)return [];
    const mask=quiet.background,at=(x,y)=>{
      x=Math.round(x);y=Math.round(y);
      return x>=0&&x<w&&y>=0&&y<h?mask[y*w+x]:0;
    };
    const valid=anchors.filter(p=>p?._closedFrameProof?.gutterProof?.method==='exterior-gradient-gutter'&&
      p._closedFrameProof.version===1&&p._closedFrameProof.connected&&p._quad?.length===4&&
      p._closedFrameProof.analysisWidth===w&&p._closedFrameProof.analysisHeight===h&&
      p._closedFrameProof.gutterProof.exteriorSupport?.length===4&&p._closedFrameProof.gutterProof.exteriorSupport.every(v=>Number.isFinite(v)&&v>=.95)&&
      p._closedFrameProof.railFits?.length===4&&p._closedFrameProof.railFits.every(r=>Number.isFinite(r.slope)&&Number.isFinite(r.offset)&&Math.abs(r.slope)<=.025));
    const strips=valid.filter(p=>p.w>.8&&p.x<.1&&p.x+p.w>.9),out=[];
    const rail=(p,i)=>p._closedFrameProof.railFits[i];
    const value=(r,t)=>r.offset+r.slope*t;
    const meet=(a,b)=>{const x=(b.offset+b.slope*a.offset)/(1-b.slope*a.slope);return [x,value(a,x)];};
    for(const upper of strips)for(const lower of strips){
      const top=rail(upper,1),bottom=rail(lower,0);
      const y1=Math.max(...upper._quad.slice(2).map(p=>p.y*h)),y2=Math.min(...lower._quad.slice(0,2).map(p=>p.y*h));
      if(y2-y1<h*.18||y2-y1>h*.65||Math.abs(upper.x-lower.x)>.02||Math.abs(upper.x+upper.w-lower.x-lower.w)>.02)continue;
      for(const side of valid){
        if(side===upper||side===lower||side.w<.25||side.w>.7||
          Math.abs(side.y*h-y1)>h*.035||Math.abs((side.y+side.h)*h-y2)>h*.035)continue;
        for(const leftVoid of [true,false]){
          const edge=leftVoid?side.x+side.w:side.x,outer=leftVoid?upper.x+upper.w:upper.x;
          if(Math.abs(edge-outer)>.02)continue;
          const bound=rail(side,leftVoid?2:3),sign=leftVoid?-1:1;
          const inner={...bound,offset:bound.offset+sign*2};
          const b={...bottom,offset:bottom.offset-2};
          let t=null;
          // Select the first completely quiet line just beyond the upper
          // printed border. Different decoders leave a 1–3 pixel ink fringe.
          for(const gap of [2,3,4]){
            const trial={...top,offset:top.offset+gap},join=meet(trial,inner);
            const lo=leftVoid?1:join[0],hi=leftVoid?join[0]:w-2;let clear=true;
            for(let x=Math.ceil(lo);x<=Math.floor(hi);x++)if(!at(x,value(trial,x))){clear=false;break;}
            if(clear){t=trial;break;}
          }
          if(!t)continue;
          // First inspect the entire unframed remainder, including the page
          // margin. The tap never supplies a seed, side, size, or crop edge.
          const rough=[meet(t,leftVoid?{slope:0,offset:1}:inner),meet(t,leftVoid?inner:{slope:0,offset:w-2}),
            meet(b,leftVoid?inner:{slope:0,offset:w-2}),meet(b,leftVoid?{slope:0,offset:1}:inner)];
          const contains=(x,y)=>rough.every((a,i)=>{const c=rough[(i+1)%4];return (c[0]-a[0])*(y-a[1])-(c[1]-a[1])*(x-a[0])>=0;});
          if(valid.some(p=>p!==upper&&p!==lower&&p!==side&&p._quad.some(v=>contains(v.x*w,v.y*h))))continue;
          const seen=new Uint8Array(w*h),components=[];let total=0,area=0;
          for(let y=Math.max(1,Math.floor(y1));y<Math.min(h-1,Math.ceil(y2));y++)for(let x=1;x<w-1;x++){
            if(!contains(x,y))continue;area++;
            const start=y*w+x;if(mask[start]||seen[start])continue;
            const todo=[start],box=[x,y,x,y];seen[start]=1;
            for(let cursor=0;cursor<todo.length;cursor++){
              const i=todo[cursor],xx=i%w,yy=i/w|0;
              box[0]=Math.min(box[0],xx);box[1]=Math.min(box[1],yy);box[2]=Math.max(box[2],xx);box[3]=Math.max(box[3],yy);
              for(const j of [i-1,i+1,i-w,i+w]){
                const nx=j%w,ny=j/w|0;
                if(j<0||j>=w*h||Math.abs(nx-xx)>1||seen[j]||mask[j]||!contains(nx,ny))continue;
                seen[j]=1;todo.push(j);
              }
            }
            if(todo.length>=w*h*.00005){components.push({size:todo.length,box});total+=todo.length;}
          }
          components.sort((a,b)=>b.size-a.size);
          if(!components.length||total/area<.18||total/area>.75||components[0].size/total<.65||components.slice(1).some(c=>c.size/total>.2))continue;
          const box=[Math.min(...components.map(c=>c.box[0])),Math.min(...components.map(c=>c.box[1])),
            Math.max(...components.map(c=>c.box[2])),Math.max(...components.map(c=>c.box[3]))];
          const dominant=components[0].box;
          if(dominant[3]-dominant[1]<(y2-y1)*.5||dominant[2]-dominant[0]<(box[2]-box[0])*.65)continue;
          const margin={slope:0,offset:leftVoid?Math.max(1,box[0]-2):Math.min(w-2,box[2]+2)};
          const q=[meet(t,leftVoid?margin:inner),meet(t,leftVoid?inner:margin),meet(b,leftVoid?inner:margin),meet(b,leftVoid?margin:inner)];
          const supports=q.map((a,i)=>{const c=q[(i+1)%4],n=Math.ceil(Math.hypot(c[0]-a[0],c[1]-a[1]));let count=0;
            for(let k=0;k<=n;k++)count+=at(a[0]+(c[0]-a[0])*k/n,a[1]+(c[1]-a[1])*k/n);return count/(n+1);});
          if(supports.some(v=>v<1))continue;
          const xs=q.map(v=>v[0]/w),ys=q.map(v=>v[1]/h);
          out.push({x:Math.min(...xs),y:Math.min(...ys),w:Math.max(...xs)-Math.min(...xs),h:Math.max(...ys)-Math.min(...ys),
            _quad:q.map(v=>({x:v[0]/w,y:v[1]/h})),_identitySource:'open-region',_geometryType:'matte-bounded-region',
            _openRegionProof:{version:1,connected:true,method:'three-neighbor-matte',analysisWidth:w,analysisHeight:h,
              exteriorSupport:supports,foregroundBox:box,componentSizes:components.map(c=>c.size),neighborQuads:[upper._quad,side._quad,lower._quad]}});
        }
      }
    }
    return out.filter((p,i)=>out.findIndex(q=>Math.abs(p.x-q.x)<.01&&Math.abs(p.y-q.y)<.01&&Math.abs(p.w-q.w)<.01&&Math.abs(p.h-q.h)<.01)===i);
  }
  // Independently bounded cells in a uniformly near-black, exterior-connected
  // matte. Unlike the rail-pair proposer, component boundaries end at their own
  // T junctions, so offset/sloping neighboring rows cannot lengthen a side.
  // This is an opt-in source of proposals only; divider and inset vetoes still
  // run in PanelClosedFrames. The finger never supplies a seed or crop edge.
  function componentProposalsRGBA(rgba, w, h, options = {}) {
    const quiet = quietBackground(rgba, w, h, {darkMatte: true});
    if (!quiet) return [];
    const {background, rgb} = quiet, count = w * h;
    const labels = new Int32Array(count), queue = new Int32Array(count);
    const components = [];
    let id = 0;
    for (let start = 0; start < count; start++) {
      if (background[start] || labels[start]) continue;
      id++;
      let head = 0, size = 1;
      queue[0] = start; labels[start] = id;
      let x1 = w, y1 = h, x2 = -1, y2 = -1;
      while (head < size) {
        const index = queue[head++], x = index % w, y = (index / w) | 0;
        x1 = Math.min(x1, x); x2 = Math.max(x2, x);
        y1 = Math.min(y1, y); y2 = Math.max(y2, y);
        for (const next of [x ? index - 1 : -1, x + 1 < w ? index + 1 : -1,
                            y ? index - w : -1, y + 1 < h ? index + w : -1]) {
          if (next < 0 || background[next] || labels[next]) continue;
          labels[next] = id; queue[size++] = next;
        }
      }
      if (size >= count * .02 && x2 - x1 >= w * .12 && y2 - y1 >= (options.shortPanels === true ? Math.max(48, h * .05) : h * .085))
        components.push({id, size, box: [x1, y1, x2, y2]});
    }
    // A single foreground blob is not proof of a multi-panel layout.
    if (components.length < 2 || components.length > 12) return [];
    function regress(points) {
      if (points.length < 30) return null;
      const tx = points.reduce((a, p) => a + p[0], 0) / points.length;
      const py = points.reduce((a, p) => a + p[1], 0) / points.length;
      let cov = 0, variance = 0;
      for (const [t, p] of points) {cov += (t-tx)*(p-py); variance += (t-tx)**2;}
      const m = cov / variance, b = py - m * tx;
      if (!Number.isFinite(m) || Math.abs(m) > .12) return null;
      return {m, b};
    }
    function fitSide(component, vertical, low) {
      const [x1,y1,x2,y2] = component.box;
      const lo = vertical ? y1 : x1, hi = vertical ? y2 : x2;
      const trim = Math.max(4, Math.ceil((hi-lo)*.04)), points = [];
      for (let t = lo+trim; t <= hi-trim; t++) {
        const a = vertical ? x1 : y1, b = vertical ? x2 : y2;
        for (let p = low ? a : b; low ? p <= b : p >= a; p += low ? 1 : -1) {
          const index = vertical ? t*w+p : p*w+t;
          if (labels[index] === component.id) { points.push([t,p]); break; }
        }
      }
      if (points.length < 35) return null;
      // Deterministic consensus over measured boundary samples, not a dark
      // path through the scene. Refine once by least squares, then check the
      // complete boundary and foreground containment below.
      let best = [];
      for (let si = -24; si <= 24; si++) {
        const m = si * .005, bins = new Map();
        for (const [t,p] of points) {
          const b = Math.round(p-m*t);
          bins.set(b, (bins.get(b)||0)+1);
        }
        let center = null, score = 0;
        for (const b of bins.keys()) {
          const n = (bins.get(b-1)||0)+(bins.get(b)||0)+(bins.get(b+1)||0);
          if (n > score) {score=n; center=b;}
        }
        if (center === null || score < best.length) continue;
        const near = points.filter(([t,p]) => Math.abs(p-m*t-center) <= 1.5);
        if (near.length > best.length) best = near;
      }
      let fit = regress(best);
      if (!fit) return null;
      const near = points.filter(([t,p]) => Math.abs(p-fit.m*t-fit.b) <= 1.5);
      fit = regress(near);
      if (!fit || near.length / points.length < .88) return null;
      const errors = near.map(([t,p]) => Math.abs(p-fit.m*t-fit.b)).sort((a,b)=>a-b);
      if (errors[Math.floor(errors.length*.9)] > 1.15) return null;
      // Fit the transition into the artwork, then include the adjacent ink
      // fringe. This bounded outward offset is independent of any tap.
      return {...fit, b: fit.b + (low ? -.5 : .5),
        lo, hi, observed: near.length/points.length, residual: errors[Math.floor(errors.length*.9)]};
    }
    const intersect = (a,b) => {
      const x = (b.b+b.m*a.b)/(1-b.m*a.m);
      return [x,a.m*x+a.b];
    };
    const results = [];
    for (const component of components) {
      const fits = [fitSide(component,false,true),fitSide(component,false,false),
                    fitSide(component,true,true),fitSide(component,true,false)];
      if (fits.some(f=>!f)) continue;
      const [t,b,l,r] = fits;
      const q = [intersect(t,l),intersect(t,r),intersect(b,r),intersect(b,l)];
      if (q.some(p=>!p.every(Number.isFinite)||p[0]<2||p[1]<2||p[0]>w-3||p[1]>h-3)) continue;
      const cross=(a,b,p)=>(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);
      if (q.some((p,i)=>cross(p,q[(i+1)%4],q[(i+2)%4])<=1)) continue;
      const area = Math.abs(q.reduce((s,p,i)=>s+p[0]*q[(i+1)%4][1]-p[1]*q[(i+1)%4][0],0))/2;
      if (area/count < .02 || area/count > .65 || component.size/area < .93 || component.size/area > 1.005) continue;
      const ms = [], inwardSupport = [];
      for (let side=0;side<4;side++) {
        const a=q[side],b=q[(side+1)%4],dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy);
        const nx=dy/length,ny=-dx/length;
        let ink=0,outer=0,inner=0,total=0;
        for (let s=4;s<length-4;s++) {
          const x=a[0]+dx*s/length,y=a[1]+dy*s/length;
          let black=false,outside=0,own=false;
          for (let d=-1;d<=1;d++) {
            const xx=Math.round(x+nx*d),yy=Math.round(y+ny*d),i=(yy*w+xx)*4;
            if(xx>=0&&yy>=0&&xx<w&&yy<h&&.299*rgba[i]+.587*rgba[i+1]+.114*rgba[i+2]<70)black=true;
          }
          for(let d=.5;d<=1.5;d+=.5) {
            const xx=Math.round(x+nx*d),yy=Math.round(y+ny*d);
            if(xx>=0&&yy>=0&&xx<w&&yy<h&&background[yy*w+xx])outside++;
            const ix=Math.round(x-nx*(d+2)),iy=Math.round(y-ny*(d+2));
            if(ix>=0&&iy>=0&&ix<w&&iy<h&&labels[iy*w+ix]===component.id)own=true;
          }
          ink+=black;outer+=outside>=2;inner+=own;total++;
        }
        ms.push([ink/total,outer/total]);inwardSupport.push(inner/total);
      }
      if(ms.some(m=>m[0]<.97||m[1]<.97)||inwardSupport.some(v=>v<.90))continue;
      // Reject any meaningful artwork crossing an inferred straight side;
      // do not trim protruding hair/balloons to force a rectangle to pass.
      let outside=0,foreign=0,matte=0,inside=0;
      const [x1,y1,x2,y2]=component.box;
      for(let y=y1;y<=y2;y++)for(let x=x1;x<=x2;x++) {
        const distances=q.map((a,i)=>cross(a,q[(i+1)%4],[x,y])/
          Math.hypot(q[(i+1)%4][0]-a[0],q[(i+1)%4][1]-a[1]));
        const index=y*w+x;
        if(labels[index]===component.id&&Math.min(...distances)<-1.5)outside++;
        if(Math.min(...distances)>3){inside++;matte+=background[index];
          foreign+=!background[index]&&labels[index]!==component.id;}
      }
      if(outside>2||!inside||matte/inside>.008||foreign>2)continue;
      results.push({q,ms,area:area/count,fits,color:rgb,
        componentProof:{method:'four-observed-component-sides',pixelCount:component.size,
          componentAreaRatio:component.size/area,sideSupport:fits.map(f=>f.observed),
          inwardSupport,outsidePixels:outside,foreignPixels:foreign,interiorMatteRatio:matte/inside}});
    }
    return results;
  }


  // Edge-bleed pairs cannot be forced through the four-straight-side gate:
  // hair may cross a printed border, and a panel may reach the source edge.
  // This separate, opt-in route requires an independently proved neighboring
  // row, two exterior-separated foreground components, and a measured shared
  // gutter. Its convex silhouette envelopes may contain quiet matte, but may
  // never cut the connected artwork or include another substantial component.
  // Existing quadrilateral candidates and their thresholds are unchanged.
  function pairedOutlinesRGBA(rgba, w, h, anchors) {
    if (!Array.isArray(anchors) || anchors.length < 2 || anchors.length > 10 ||
        anchors.some(a => a?._closedFrameProof?.gutterProof?.method !== 'exterior-dark-component' ||
          a._closedFrameProof.version !== 1 || a._closedFrameProof.connected !== true ||
          a._closedFrameProof.analysisWidth !== w || a._closedFrameProof.analysisHeight !== h ||
          !Array.isArray(a._quad) || a._quad.length !== 4 ||
          a._quad.some(p => !Number.isFinite(p?.x) || !Number.isFinite(p?.y) || p.x<0 || p.x>1 || p.y<0 || p.y>1))) return [];
    const quiet = quietBackground(rgba, w, h, {darkMatte: true});
    if (!quiet) return [];
    const {background, rgb} = quiet, count = w*h;
    const labels = new Int32Array(count), queue = new Int32Array(count), all = [];
    let id = 0;
    for (let start=0; start<count; start++) {
      if (background[start] || labels[start]) continue;
      id++; let head=0, size=1, x1=w, y1=h, x2=-1, y2=-1;
      queue[0]=start; labels[start]=id;
      while (head<size) {
        const index=queue[head++], x=index%w, y=(index/w)|0;
        x1=Math.min(x1,x); x2=Math.max(x2,x); y1=Math.min(y1,y); y2=Math.max(y2,y);
        for (const next of [x?index-1:-1, x+1<w?index+1:-1,
                            y?index-w:-1, y+1<h?index+w:-1]) {
          if (next<0 || background[next] || labels[next]) continue;
          labels[next]=id; queue[size++]=next;
        }
      }
      all.push({id,size,box:[x1,y1,x2,y2]});
    }
    const large=all.filter(c=>c.size>=count*.02 && c.box[2]-c.box[0]>=w*.12 && c.box[3]-c.box[1]>=h*.085);
    if (large.length<4 || large.length>12) return [];
    const cross=(a,b,p)=>(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);
    const area=q=>Math.abs(q.reduce((s,p,i)=>s+p[0]*q[(i+1)%q.length][1]-p[1]*q[(i+1)%q.length][0],0))/2;
    const inside=(q,x,y,tolerance=0)=>q.every((a,i)=>cross(a,q[(i+1)%q.length],[x,y])>=
      -tolerance*Math.hypot(q[(i+1)%q.length][0]-a[0],q[(i+1)%q.length][1]-a[1]));
    const anchorQuads=anchors.map(a=>a._quad.map(p=>[p.x*w,p.y*h]));
    const assigned=new Set();
    for (const q of anchorQuads) {
      const center=q.reduce((s,p)=>[s[0]+p[0]/4,s[1]+p[1]/4],[0,0]);
      const owned=large.filter(c=>center[0]>=c.box[0]&&center[0]<=c.box[2]&&center[1]>=c.box[1]&&center[1]<=c.box[3]);
      if (owned.length!==1 || assigned.has(owned[0].id)) return [];
      assigned.add(owned[0].id);
    }
    const remaining=large.filter(c=>!assigned.has(c.id)).sort((a,b)=>a.box[0]-b.box[0]);
    // An unexplained third region or a split component is ambiguity, not a
    // reason to join components or ignore an inserted divider.
    if (remaining.length!==2) return [];
    const [left,right]=remaining;
    if (left.box[0]>2 || right.box[2]<w-2 || left.box[2]>=right.box[2] || left.box[0]>=right.box[0]) return [];
    const low=Math.max(left.box[1],right.box[1]), high=Math.min(left.box[3],right.box[3]);
    const minHeight=Math.min(left.box[3]-left.box[1],right.box[3]-right.box[1]);
    if (high-low<minHeight*.90 || minHeight<h*.085 ||
        Math.abs(left.box[1]-right.box[1])>minHeight*.065 ||
        Math.abs(left.box[3]-right.box[3])>minHeight*.065) return [];

    function regress(points) {
      if (points.length<30) return null;
      const tx=points.reduce((s,p)=>s+p[0],0)/points.length, py=points.reduce((s,p)=>s+p[1],0)/points.length;
      let cov=0, variance=0;
      for(const [t,p] of points){cov+=(t-tx)*(p-py);variance+=(t-tx)**2;}
      const m=cov/variance,b=py-m*tx;
      return Number.isFinite(m)&&Math.abs(m)<=.12?{m,b}:null;
    }
    function boundary(component,vertical,lowSide) {
      const [x1,y1,x2,y2]=component.box, lo=vertical?y1:x1, hi=vertical?y2:x2;
      const trim=Math.max(4,Math.ceil((hi-lo)*.04)),points=[];
      for(let t=lo+trim;t<=hi-trim;t++){
        const a=vertical?x1:y1,b=vertical?x2:y2;
        for(let p=lowSide?a:b;lowSide?p<=b:p>=a;p+=lowSide?1:-1){
          if(labels[vertical?t*w+p:p*w+t]===component.id){points.push([t,p]);break;}
        }
      }
      let best=[];
      for(let si=-24;si<=24;si++){
        const m=si*.005,bins=new Map();
        for(const [t,p] of points){const b=Math.round(p-m*t);bins.set(b,(bins.get(b)||0)+1);}
        let center=null,score=0;
        for(const b of bins.keys()){
          const n=(bins.get(b-1)||0)+(bins.get(b)||0)+(bins.get(b+1)||0);
          if(n>score){score=n;center=b;}
        }
        if(center===null||score<best.length)continue;
        const near=points.filter(([t,p])=>Math.abs(p-m*t-center)<=1.5);
        if(near.length>best.length)best=near;
      }
      let fit=regress(best);if(!fit)return null;
      const near=points.filter(([t,p])=>Math.abs(p-fit.m*t-fit.b)<=1.5);
      fit=regress(near);if(!fit)return null;
      const residuals=near.map(([t,p])=>Math.abs(p-fit.m*t-fit.b)).sort((a,b)=>a-b);
      return {...fit,support:near.length/points.length,residual:residuals[Math.floor(residuals.length*.9)]};
    }
    const lf=boundary(left,true,false),rf=boundary(right,true,true);
    const horizontal=remaining.map(c=>[boundary(c,false,true),boundary(c,false,false)]);
    if(!lf||!rf||lf.support<.60||rf.support<.60||Math.abs(lf.m-rf.m)>.012||
       Math.max(lf.residual,rf.residual)>1.15||horizontal.some(pair=>pair.some(f=>!f||f.support<.72||f.residual>1.15)))return [];
    const evaluate=(line,t)=>line.b+line.m*t;
    const gaps=[low,high].map(y=>evaluate(rf,y)-evaluate(lf,y));
    if(Math.min(...gaps)<3||Math.max(...gaps)>12)return [];
    const middle={m:(lf.m+rf.m)/2,b:(lf.b+rf.b)/2};
    let gutter=0,total=0;
    for(let y=Math.ceil(low+3);y<high-3;y++){
      let yes=true;
      for(const d of [-.6,0,.6]){
        const x=Math.round(evaluate(middle,y)+d);
        if(x<0||x>=w||!background[y*w+x])yes=false;
      }
      gutter+=yes;total++;
    }
    if(!total||gutter/total<.98)return [];
    // Both whole components must stay on their own side of this divider.
    for(let i=0;i<2;i++){
      const c=remaining[i],[x1,y1,x2,y2]=c.box;
      for(let y=y1;y<=y2;y++)for(let x=x1;x<=x2;x++)
        if(labels[y*w+x]===c.id&&(i===0?x>evaluate(middle,y)-.5:x<evaluate(middle,y)+.5))return [];
    }
    // Independently observed top/bottom sides must attach to a common proved
    // neighboring row. A large isolated artwork blob alone is never enough.
    let attachment=null;
    for(let ai=0;ai<anchorQuads.length&&!attachment;ai++){
      const aq=anchorQuads[ai];
      for(const side of ['bottom','top']){
        const a=side==='bottom'?aq[0]:aq[3],b=side==='bottom'?aq[1]:aq[2];
        if(b[0]-a[0]<w*.65)continue;
        const rail={m:(b[1]-a[1])/(b[0]-a[0]),b:a[1]-(b[1]-a[1])/(b[0]-a[0])*a[0]};
        const coverages=[],supports=[],separations=[];
        let valid=true;
        for(let ci=0;ci<2;ci++){
          const c=remaining[ci],fit=horizontal[ci][side==='bottom'?1:0];
          const lo=Math.max(c.box[0]+3,a[0]+3),hi=Math.min(c.box[2]-3,b[0]-3);
          const coverage=(hi-lo)/(c.box[2]-c.box[0]);
          const gap=[lo,hi].map(x=>(evaluate(rail,x)-evaluate(fit,x))*(side==='bottom'?1:-1));
          if(coverage<.75||Math.min(...gap)<2||Math.max(...gap)>14||Math.abs(rail.m-fit.m)>.04){valid=false;break;}
          let yes=0,n=0;
          for(let x=Math.ceil(lo);x<=hi;x++){
            const y=Math.round((evaluate(rail,x)+evaluate(fit,x))/2);
            yes+=y>=0&&y<h&&background[y*w+x];n++;
          }
          if(!n||yes/n<.975){valid=false;break;}
          coverages.push(coverage);supports.push(yes/n);separations.push(gap);
        }
        if(valid){attachment={side,anchorQuad:anchors[ai]._quad.map(p=>({...p})),coverages,supports,separations};break;}
      }
    }
    if(!attachment)return [];

    function hull(points){
      points=points.sort((a,b)=>a[0]-b[0]||a[1]-b[1]).filter((p,i,a)=>!i||p[0]!==a[i-1][0]||p[1]!==a[i-1][1]);
      if(points.length<3)return [];
      const lo=[],hi=[];
      for(const p of points){while(lo.length>=2&&cross(lo[lo.length-2],lo[lo.length-1],p)<=0)lo.pop();lo.push(p);}
      for(let i=points.length-1;i>=0;i--){const p=points[i];while(hi.length>=2&&cross(hi[hi.length-2],hi[hi.length-1],p)<=0)hi.pop();hi.push(p);}
      lo.pop();hi.pop();return lo.concat(hi);
    }
    const largeIds=new Set(large.map(c=>c.id)),out=[];
    for(let ci=0;ci<2;ci++){
      const c=remaining[ci],[x1,y1,x2,y2]=c.box,points=[];
      for(let y=y1;y<=y2;y++){
        let min=w,max=-1;
        for(let x=x1;x<=x2;x++)if(labels[y*w+x]===c.id){min=Math.min(min,x);max=Math.max(max,x);}
        if(max>=min)points.push([min,y],[max,y]);
      }
      // Include a bounded subpixel ink fringe and the source-edge clipping.
      // A convex envelope adds only matte between protrusions; it cannot
      // remove a connected hair tip or create a finger-dependent crop.
      const q=hull(hull(points).flatMap(([x,y])=>[-.65,.65].flatMap(dx=>[-.65,.65].map(dy=>
        [Math.max(0,Math.min(w,x+dx)),Math.max(0,Math.min(h,y+dy))]))));
      const a=area(q),ratio=c.size/a;
      if(q.length<4||q.length>64||a/count<.02||a/count>.50||ratio<.72||ratio>1.001)return [];
      let lost=0,foreign=0,insideCount=0,matte=0;
      for(let y=Math.max(0,y1-1);y<=Math.min(h-1,y2+1);y++)for(let x=Math.max(0,x1-1);x<=Math.min(w-1,x2+1);x++){
        const label=labels[y*w+x],hit=inside(q,x,y);
        if(label===c.id&&!hit)lost++;
        if(hit){insideCount++;matte+=background[y*w+x];if(label!==c.id&&largeIds.has(label))foreign++;}
      }
      if(lost||foreign||!insideCount||matte/insideCount>.28)return [];
      const bounds=[Math.min(...q.map(p=>p[0])),Math.min(...q.map(p=>p[1])),Math.max(...q.map(p=>p[0])),Math.max(...q.map(p=>p[1]))];
      out.push({q,box:bounds.map(Math.round),proof:{version:1,connected:true,
        method:'paired-exterior-matte-components',analysisWidth:w,analysisHeight:h,
        color:rgb,pairIndex:ci,componentPixels:c.size,envelopeArea:a,
        componentAreaRatio:ratio,interiorMatteRatio:matte/insideCount,
        lostPixels:lost,foreignLargePixels:foreign,sourceEdge:ci===0?'left':'right',
        sharedDivider:{axis:'vertical',left:lf,right:rf,gap:gaps,exteriorSupport:gutter/total,span:[low,high]},
        horizontalSides:horizontal[ci],attachment}});
    }
    function overlap(a,b){
      let points=a;
      for(let i=0;i<b.length&&points.length;i++){
        const c=b[i],d=b[(i+1)%b.length],input=points;points=[];
        for(let j=0;j<input.length;j++){
          const p=input[j],q=input[(j+1)%input.length],cp=cross(c,d,p),cq=cross(c,d,q);
          if(cp>=0)points.push(p);
          if((cp>=0)!==(cq>=0)){const t=cp/(cp-cq);points.push([p[0]+t*(q[0]-p[0]),p[1]+t*(q[1]-p[1])]);}
        }
      }
      return points.length?area(points):0;
    }
    if(overlap(out[0].q,out[1].q)>1||out.some(c=>anchorQuads.some(q=>overlap(c.q,q)>1)))return [];
    return out;
  }


  // A narrow printed strip can sit above/below an unbordered portrait in an
  // otherwise isolated legacy column. Its four observed sides establish the
  // split; exterior-connected matte, not a guessed rectangle through artwork,
  // must surround every remaining foreground pixel, including tiny hair marks.
  // This helper proposes only the remainder. The caller verifies the strip,
  // independent full-height side anchor and absence of other identity owners.
  function matteColumnRemainderRGBA(rgba,w,h,parent,strip,anchor) {
    const quiet=quietBackground(rgba,w,h,{darkMatte:true});
    if(!quiet||!parent||!strip||!anchor||!Array.isArray(strip._quad)||strip._quad.length!==4)return null;
    const finiteBox=p=>['x','y','w','h'].every(k=>Number.isFinite(p?.[k]))&&
      p.x>=0&&p.y>=0&&p.w>0&&p.h>0&&p.x+p.w<=1&&p.y+p.h<=1;
    if(![parent,strip,anchor].every(finiteBox)||strip._quad.some(p=>!Number.isFinite(p?.x)||!Number.isFinite(p?.y)))return null;
    const mask=quiet.background,pb=[parent.x*w,parent.y*h,(parent.x+parent.w)*w,(parent.y+parent.h)*h];
    const xs=strip._quad.map(p=>p.x*w),ys=strip._quad.map(p=>p.y*h);
    const sb=[Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)];
    const top=Math.abs(sb[1]-pb[1])<=3,bottom=Math.abs(sb[3]-pb[3])<=3;
    if(top===bottom||Math.abs(sb[0]-pb[0])>3||Math.abs(sb[2]-pb[2])>3||
       sb[3]-sb[1]>(pb[3]-pb[1])*.30)return null;
    const box=[Math.floor(pb[0])-2,top?Math.ceil(sb[3])+2:Math.floor(pb[1])-2,
      Math.ceil(pb[2])+2,top?Math.ceil(pb[3])+2:Math.floor(sb[1])-2];
    if(box[0]<2||box[1]<2||box[2]>w-3||box[3]>h-3||box[2]-box[0]<60||box[3]-box[1]<60)return null;
    // No foreground may enter/leave the search window: otherwise the legacy
    // seed could be cutting a protruding object or another neighboring panel.
    for(let x=box[0];x<=box[2];x++)if(!mask[box[1]*w+x]||!mask[box[3]*w+x])return null;
    for(let y=box[1];y<=box[3];y++)if(!mask[y*w+box[0]]||!mask[y*w+box[2]])return null;
    const seen=new Uint8Array(w*h),queue=new Int32Array((box[2]-box[0]+1)*(box[3]-box[1]+1));
    const sizes=[],bounds=[w,h,-1,-1];let pixels=0;
    for(let y=box[1]+1;y<box[3];y++)for(let x=box[0]+1;x<box[2];x++){
      const start=y*w+x;if(mask[start]||seen[start])continue;
      let head=0,size=1;queue[0]=start;seen[start]=1;
      while(head<size){
        const k=queue[head++],xx=k%w,yy=(k/w)|0;
        pixels++;bounds[0]=Math.min(bounds[0],xx);bounds[1]=Math.min(bounds[1],yy);
        bounds[2]=Math.max(bounds[2],xx);bounds[3]=Math.max(bounds[3],yy);
        for(const next of [k-1,k+1,k-w,k+w]){
          const nx=next%w,ny=(next/w)|0;
          if(nx<=box[0]||nx>=box[2]||ny<=box[1]||ny>=box[3]||mask[next]||seen[next])continue;
          seen[next]=1;queue[size++]=next;
        }
      }
      sizes.push(size);
    }
    sizes.sort((a,b)=>b-a);
    if(pixels<w*h*.025||!sizes.length||sizes[0]/pixels<.80||(sizes[1]||0)/pixels>.08)return null;
    const crop=[bounds[0]-2,bounds[1]-2,bounds[2]+2,bounds[3]+2];
    if(crop[0]<box[0]||crop[1]<box[1]||crop[2]>box[2]||crop[3]>box[3])return null;
    const area=(crop[2]-crop[0])*(crop[3]-crop[1]);
    if(area/(w*h)<.06||area/(w*h)>.35||pixels/area<.18||pixels/area>.80)return null;
    const gap=top?[Math.ceil(sb[3])+1,bounds[1]-1]:[bounds[3]+1,Math.floor(sb[1])-1];
    if(gap[1]-gap[0]+1<4||gap[1]-gap[0]+1>h*.08)return null;
    let gapPixels=0;
    for(let y=gap[0];y<=gap[1];y++)for(let x=box[0];x<=box[2];x++){
      if(!mask[y*w+x])return null;gapPixels++;
    }
    // The final crop also has a quiet, exterior-connected perimeter. The
    // complete foreground bounds were measured before adding its two-pixel
    // black fringe; no significant or tiny component was discarded.
    const supports=[];
    for(let side=0;side<4;side++){
      let n=0,quietCount=0;
      const vertical=side>=2,pos=crop[side===0?1:side===1?3:side===2?0:2];
      for(let t=vertical?crop[1]:crop[0];t<=(vertical?crop[3]:crop[2]);t++){
        n++;quietCount+=mask[vertical?t*w+pos:pos*w+t];
      }
      supports.push(quietCount/n);
    }
    if(supports.some(v=>v!==1))return null;
    const q=[[crop[0],crop[1]],[crop[2],crop[1]],[crop[2],crop[3]],[crop[0],crop[3]]];
    return {x:crop[0]/w,y:crop[1]/h,w:(crop[2]-crop[0])/w,h:(crop[3]-crop[1])/h,
      _quad:q.map(p=>({x:p[0]/w,y:p[1]/h})),_identitySource:'open-region',
      _geometryOwner:'orthogonal-frame',_geometryType:'matte-isolated-artwork',
      _openRegionProof:{version:1,connected:true,method:'strip-separated-exterior-matte',
        analysisWidth:w,analysisHeight:h,color:quiet.rgb,stripSide:top?'top':'bottom',
        parent:{x:parent.x,y:parent.y,w:parent.w,h:parent.h},stripQuad:strip._quad,
        anchorQuad:anchor._quad,searchBox:box,foregroundBox:bounds,foregroundPixels:pixels,
        componentSizes:sizes,foregroundFraction:pixels/area,retainedPixels:pixels,lostPixels:0,
        cropPadding:2,exteriorSupport:supports,separatorRows:gap,separatorPixels:gapPixels,
        separatorSupport:1}};
  }

  return {proposeRGBA,openRegionsRGBA,componentProposalsRGBA,pairedOutlinesRGBA,matteColumnRemainderRGBA};
})();
if (typeof module !== 'undefined') module.exports = PanelGutterFrames;
