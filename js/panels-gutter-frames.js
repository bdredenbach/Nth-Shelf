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
    if (luminance < 35 || luminance > 205) return null;

    // Absolute color bounds prevent gradual drift from a gutter into artwork.
    const background = new Uint8Array(w * h), queue = new Int32Array(w * h);
    let size = 0, cursor = 0;
    let matches = i => [0, 1, 2].every(c => Math.abs(rgba[i * 4 + c] - rgb[c]) <= 14);
    if (options.gradient === true) {
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
          if (![0, 1, 2].some(d => dark(vertical, p + direction * d, t))) continue;
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
        if (!Number.isFinite(m) || Math.abs(m) > .025 || errors[Math.floor(errors.length * .9)] > 1) continue;
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
  return {proposeRGBA,openRegionsRGBA};
})();
if (typeof module !== 'undefined') module.exports = PanelGutterFrames;
