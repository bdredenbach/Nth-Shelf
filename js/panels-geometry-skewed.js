// NTH SHELF V2.78.05 — SKEWED PANEL GEOMETRY
// Geometry-only engine for trapezoids/slanted quadrilaterals. Panel identity
// comes from panels.js. This module may refine the four rails, but may not pick
// a different panel. It returns null unless the fitted shape is convincingly
// non-orthogonal and remains close to the seed.

const PanelGeometrySkewed = {
  refine(imgUrl, panel, log) {
    if (!imgUrl || !panel) return Promise.resolve(null);
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        try { resolve(this._analyze(img, panel, log)); }
        catch (err) {
          console.warn('Skewed geometry failed:', err);
          if (log) log(`SKEWED ERROR: ${err.message}`);
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = imgUrl;
    });
  },

  _analyze(img, panel, log) {
    const maxDim = 900;
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const cx = c.getContext('2d', { willReadFrequently: true });
    cx.drawImage(img, 0, 0, w, h);
    const d = cx.getImageData(0, 0, w, h).data;
    const lum = new Uint8Array(w * h);
    for (let i=0,j=0;i<d.length;i+=4,j++) lum[j]=Math.round(.299*d[i]+.587*d[i+1]+.114*d[i+2]);

    const x0 = Math.max(1, Math.round(panel.x * w));
    const y0 = Math.max(1, Math.round(panel.y * h));
    const x1 = Math.min(w-2, Math.round((panel.x + panel.w) * w)-1);
    const y1 = Math.min(h-2, Math.round((panel.y + panel.h) * h)-1);
    const rw=x1-x0+1, rh=y1-y0+1;
    if (rw < 24 || rh < 24) return null;

    const fitSide = (axis, guess, a0, a1) => {
      const span=Math.max(1,a1-a0);
      const cross=axis==='H'?h:w;
      const radius=Math.min(55,Math.max(10,Math.round(cross*.055)));
      const step=Math.max(1,Math.round(span/190));
      const samples=[];
      const aStart=Math.round(a0+span*.02), aEnd=Math.round(a1-span*.02);
      for(let a=aStart;a<=aEnd;a+=step){
        let best=null;
        const lo=Math.max(1,Math.round(guess-radius)), hi=Math.min(cross-2,Math.round(guess+radius));
        for(let pos=lo;pos<=hi;pos++){
          let v;
          if(axis==='H') v=(lum[(pos-1)*w+a]+lum[pos*w+a]+lum[(pos+1)*w+a])/3;
          else v=(lum[(a-1)*w+pos]+lum[a*w+pos]+lum[(a+1)*w+pos])/3;
          // dark-thick ink wins, but remaining near the seed still matters
          const score=v + Math.abs(pos-guess)*0.82;
          if(!best || score<best.score) best={a,pos,v,score};
        }
        if(best && best.v<=158) samples.push(best);
      }
      if(samples.length<12) return null;
      const totalSlots=Math.max(1,Math.floor((aEnd-aStart)/step)+1);
      if(samples.length/totalSlots<.38) return null;

      let keep=samples.slice(), model=null, residualMed=99;
      for(let iter=0;iter<4;iter++){
        if(keep.length<10) return null;
        let sa=0,sp=0,saa=0,sap=0,n=keep.length;
        for(const q of keep){sa+=q.a;sp+=q.pos;saa+=q.a*q.a;sap+=q.a*q.pos;}
        const den=n*saa-sa*sa;
        const m=Math.abs(den)>1e-7?(n*sap-sa*sp)/den:0, b=(sp-m*sa)/n;
        model={axis,m,b};
        const rs=keep.map(q=>Math.abs(q.pos-(m*q.a+b))).sort((a,b)=>a-b);
        residualMed=rs[Math.floor(rs.length/2)]||0;
        const tol=Math.max(2.0,Math.min(5.2,residualMed*2.5+1.2));
        keep=keep.filter(q=>Math.abs(q.pos-(m*q.a+b))<=tol);
      }
      if(!model || keep.length<10) return null;
      const bins=new Set();
      for(const q of keep){
        const t=(q.a-aStart)/Math.max(1,aEnd-aStart);
        bins.add(Math.max(0,Math.min(7,Math.floor(t*8))));
      }
      const coverage=bins.size/8, support=keep.length/totalSlots;
      if(coverage<.50 || support<.30 || residualMed>4.6 || Math.abs(model.m)>.42) return null;
      model.support=support; model.coverage=coverage; model.residual=residualMed;
      return model;
    };

    const top=fitSide('H',y0,x0,x1), bottom=fitSide('H',y1,x0,x1);
    const left=fitSide('V',x0,y0,y1), right=fitSide('V',x1,y0,y1);
    const sides=[top,bottom,left,right].filter(Boolean).length;
    if(sides<4){ if(log) log(`SKEWED MISS rails=${sides}/4`); return null; }

    const intersect=(hl,vl)=>{
      const den=1-hl.m*vl.m;
      if(Math.abs(den)<.08) return null;
      const x=(vl.m*hl.b+vl.b)/den, y=hl.m*x+hl.b;
      return {x,y};
    };
    const q=[intersect(top,left),intersect(top,right),intersect(bottom,right),intersect(bottom,left)];
    if(q.some(p=>!p||!Number.isFinite(p.x)||!Number.isFinite(p.y))) return null;

    // Keep corners close enough to the stable detector's seed to prevent the
    // skewed engine from changing panel identity.
    const refs=[{x:x0,y:y0},{x:x1,y:y0},{x:x1,y:y1},{x:x0,y:y1}];
    const maxDx=Math.max(18,rw*.20), maxDy=Math.max(18,rh*.20);
    for(let i=0;i<4;i++) if(Math.abs(q[i].x-refs[i].x)>maxDx || Math.abs(q[i].y-refs[i].y)>maxDy){
      if(log) log('SKEWED MISS corner escaped seed'); return null;
    }

    const cross=(a,b,c)=>(b.x-a.x)*(c.y-b.y)-(b.y-a.y)*(c.x-b.x);
    const cs=[cross(q[0],q[1],q[2]),cross(q[1],q[2],q[3]),cross(q[2],q[3],q[0]),cross(q[3],q[0],q[1])];
    if(!(cs.every(v=>v>0)||cs.every(v=>v<0))){ if(log) log('SKEWED MISS non-convex'); return null; }
    const area=Math.abs(q.reduce((s,p,i)=>{const n=q[(i+1)%4];return s+p.x*n.y-n.x*p.y},0)/2);
    if(area<rw*rh*.60 || area>rw*rh*1.35){ if(log) log('SKEWED MISS area'); return null; }

    // Router only uses this engine if the result is materially non-orthogonal.
    const cornerShift=Math.max(...q.map((p,i)=>Math.hypot(p.x-refs[i].x,p.y-refs[i].y)));
    const slopeSignal=Math.max(Math.abs(top.m),Math.abs(bottom.m),Math.abs(left.m),Math.abs(right.m));
    const skewed = slopeSignal >= .028 || cornerShift >= Math.max(6,Math.min(rw,rh)*.035);
    if(!skewed){ if(log) log(`SKEWED DECLINE slope=${slopeSignal.toFixed(3)} shift=${cornerShift.toFixed(1)}`); return null; }

    const nq=q.map(p=>({x:clamp01(p.x/(w-1)),y:clamp01(p.y/(h-1))}));
    const out={...panel,_quad:nq,_geometryType:'skewed'};
    if(log) log(`SKEWED HIT slope=${slopeSignal.toFixed(3)} shift=${cornerShift.toFixed(1)} support=${[top,bottom,left,right].map(s=>s.support.toFixed(2)).join('/')}`);
    return out;
  }
};
