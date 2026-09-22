/* Nth Shelf Frame Test 18 — terminal scene with four independently measured rims.
 * A wide, short scene on two exterior sides can lack any existing map anchor.
 * Two fixed luminance floods only propose an enclosed foreground component;
 * they never define a crop. Four original-pixel rails with inner contrast,
 * quiet outer edges and corroborated shared seams define the final outline.
 * Retain both proposal components, reject internal dividers/insets, and fail
 * closed on missing evidence. Original corner/edge detectors stay unchanged.
 * This last, bounded route runs only when every earlier stable route is empty.
 * No page index, filename, stored crop, fingerprint or tap supplies geometry.
 */
const PanelTerminalFrames = (() => {
  'use strict';
  const METHOD='dual-luminance-terminal-band-with-four-observed-rims';
  const finite=Number.isFinite,range=(x,a,b)=>finite(x)&&x>=a&&x<=b;
  const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
  const area=q=>q.reduce((s,a,i)=>{const b=q[(i+1)%q.length];return s+a[0]*b[1]-a[1]*b[0];},0)/2;
  const bounds=q=>[Math.min(...q.map(p=>p[0])),Math.min(...q.map(p=>p[1])),Math.max(...q.map(p=>p[0])),Math.max(...q.map(p=>p[1]))];
  const at=(r,t)=>r.m*t+r.b;
  const meet=(a,b)=>{if(a.v)[a,b]=[b,a];const x=(b.b+b.m*a.b)/(1-a.m*b.m);return [x,at(a,x)];};
  const quad=rs=>[meet(rs[0],rs[2]),meet(rs[0],rs[3]),meet(rs[1],rs[3]),meet(rs[1],rs[2])];
  const inside=(q,x,y)=>q.every((a,i)=>cross(a,q[(i+1)%q.length],[x,y])>=-1e-8);
  function matte(rgba,w,h){
    const sides=[[],[],[],[]];for(let x=0;x<w;x+=2){sides[0].push(x);sides[1].push((h-1)*w+x);}for(let y=0;y<h;y+=2){sides[2].push(y*w);sides[3].push(y*w+w-1);}
    const edge=sides.flat(),color=[0,1,2].map(c=>{const a=edge.map(i=>rgba[i*4+c]).sort((a,b)=>a-b);return a[a.length>>1];});
    const match=i=>[0,1,2].every(c=>Math.abs(rgba[i*4+c]-color[c])<=6),fractions=sides.map(s=>s.filter(match).length/s.length);
    const gray=new Float32Array(w*h);for(let i=0;i<gray.length;i++){if(rgba[i*4+3]!==255)return null;gray[i]=.299*rgba[i*4]+.587*rgba[i*4+1]+.114*rgba[i*4+2];}
    const base=.299*color[0]+.587*color[1]+.114*color[2];
    if(base>25||Math.min(...fractions)<.80||edge.filter(match).length/edge.length<.93)return null;
    return {gray,color,base,fractions};
  }
  function cells(gray,w,h,threshold,wide=false){
    const bg=new Uint8Array(w*h),queue=new Int32Array(w*h);let head=0,n=0;
    const offer=i=>{if(!bg[i]&&gray[i]<=threshold){bg[i]=1;queue[n++]=i;}};
    for(let x=0;x<w;x++){offer(x);offer((h-1)*w+x);}for(let y=0;y<h;y++){offer(y*w);offer(y*w+w-1);}
    while(head<n){const i=queue[head++],x=i%w,y=i/w|0;if(x)offer(i-1);if(x+1<w)offer(i+1);if(y)offer(i-w);if(y+1<h)offer(i+w);}
    const labels=new Int32Array(w*h),out=[];let id=0;
    for(let seed=0;seed<labels.length;seed++)if(!labels[seed]&&!bg[seed]){
      if(++id>16000)return [];head=0;n=1;labels[seed]=id;queue[0]=seed;let x0=w,y0=h,x1=0,y1=0;
      const add=i=>{if(!labels[i]&&!bg[i]){labels[i]=id;queue[n++]=i;}};
      while(head<n){const i=queue[head++],x=i%w,y=i/w|0;x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);if(x)add(i-1);if(x+1<w)add(i+1);if(y)add(i-w);if(y+1<h)add(i+w);}
      const bw=x1-x0+1,bh=y1-y0+1,A=bw*bh;
      if(wide){
        if(!range(A/(w*h),.065,.30)||!range(bw/w,.80,.995)||!range(bh/h,.08,.32)||bw/bh<2||n/A<.86||x0<1||x1>=w-1||y0<1||y1>=h-1||x0>w*.06||w-1-x1>w*.06||h-1-y1>h*.035)continue;
      }else if(!range(A/(w*h),.055,.20)||!range(bw/w,.40,.80)||!range(bh/h,.10,.27)||bw/bh<1.8||n/A<.77||Math.min(x0,w-1-x1)>w*.075||Math.min(y0,h-1-y1)>h*.04)continue;
      const rowMin=new Int32Array(h).fill(w),rowMax=new Int32Array(h).fill(-1),colMin=new Int32Array(w).fill(h),colMax=new Int32Array(w).fill(-1);
      for(let j=0;j<n;j++){const i=queue[j],x=i%w,y=i/w|0;rowMin[y]=Math.min(rowMin[y],x);rowMax[y]=Math.max(rowMax[y],x);colMin[x]=Math.min(colMin[x],y);colMax[x]=Math.max(colMax[x],y);}
      out.push({box:[x0,y0,x1,y1],pixels:n,threshold,id,labels,rowMin,rowMax,colMin,colMax});
    }return out.length<=6?out:[];
  }
  function observe(gray,w,h,r,lo,hi,base){
    const dir=r.side?1:-1;let total=0,matched=0,core=0,inward=0,outward=0,opposite=0,gap=0,maxGap=0;const quarters=Array.from({length:4},()=>({samples:0,matched:0}));
    const value=(t,p)=>{const x=r.v?p:t,y=r.v?t:p;return x>=0&&x<w&&y>=0&&y<h?gray[y*w+x]:Infinity;};
    for(let t=lo;t<=hi;t++){
      const p=Math.round(at(r,t));let quiet=Infinity,pre=0,post=0,other=0;
      for(let d=-1;d<=1;d++)quiet=Math.min(quiet,value(t,p+d));
      for(let d=3;d<=10;d++){pre=Math.max(pre,value(t,p-dir*d));other=Math.max(other,value(t,p+dir*d));if(d<=5)post+=value(t,p+dir*d)<=base+12;}
      const yes=quiet<=base+9;total++;matched+=yes;core+=value(t,p)<=base+12;inward+=pre>=base+28;outward+=post>0;opposite+=other>=base+28;
      gap=yes?0:gap+1;maxGap=Math.max(maxGap,gap);const q=quarters[Math.min(3,Math.floor(4*(t-lo)/(hi-lo+1)))];q.samples++;q.matched+=yes;
    }
    return {total,matched,core,inward,outward,opposite,maxGap,quarters};
  }
  function rail(c,v,side,gray,w,h,base,log){
    const b=c.box,j=v?1:0,k=1-j,lo=b[j]+5,hi=b[j+2]-5,mid=(lo+hi)/2,p0=b[k+(side?2:0)],dir=side?1:-1;
    if(hi-lo<60)return null;let best=null;
    // Search a small neighborhood of the independently flooded corner. A
    // fitted line must enclose its component, not cut back into its artwork.
    for(let sm=-20;sm<=20;sm++)for(let offset=-3;offset<=10;offset++){
      const r={v,side,m:sm*.002,b:p0+dir*offset-sm*.002*mid,lo,hi,offset,exterior:(side?(v?w:h)-1-p0:p0)<(v?w:h)*.075};
      let lost=0,extent=0;
      const min=v?c.rowMin:c.colMin,max=v?c.rowMax:c.colMax;
      for(let t=lo;t<=hi;t++)if(max[t]>=0){extent++;lost+=side?max[t]>at(r,t)+1:min[t]<at(r,t)-1;}
      if(!extent||lost/extent>.01)continue;
      const e=observe(gray,w,h,r,lo,hi,base);
      if(e.matched/e.total<.99||e.core/e.total<.90||e.maxGap>2||e.inward/e.total<.42||(r.exterior?e.outward/e.total<.78:e.opposite/e.total<.42||e.core/e.total<.95)||e.quarters.some(q=>q.matched/q.samples<.96))continue;
      const score=e.inward/e.total+.2*e.core/e.total-.018*Math.abs(offset)-.5*Math.abs(r.m);
      if(!best||score>best.score)best={...r,...e,score,lost,extent};
    }
    if(best){
      // Pixel centers alone must not shave off a narrow ink tip. Enclose the
      // complete proposed component plus its half-pixel support, then check
      // the shifted rim again rather than silently expanding a crop.
      const min=v?c.rowMin:c.colMin,max=v?c.rowMax:c.colMax;
      let shift=0;
      for(let t=b[j];t<=b[j+2];t++)if(max[t]>=0)shift=Math.max(shift,side?max[t]+.5-at(best,t):at(best,t)-(min[t]-.5));
      if(shift>1)return null;
      best.b+=dir*shift;best.enclosureShift=shift;
      const e=observe(gray,w,h,best,lo,hi,base);
      if(e.matched/e.total<.99||e.core/e.total<.90||e.maxGap>2||e.inward/e.total<.42||(best.exterior?e.outward/e.total<.78:e.opposite/e.total<.42||e.core/e.total<.95)||e.quarters.some(q=>q.matched/q.samples<.96))return null;
      Object.assign(best,e);
    }
    log?.('terminal rail '+(v?'v':'h')+side+' '+JSON.stringify(best));return best;
  }
  function section(q,t,vertical){
    const values=[];for(let i=0;i<q.length;i++){const a=q[i],b=q[(i+1)%q.length],j=vertical?0:1,k=1-j;if(t>=Math.min(a[j],b[j])&&t<Math.max(a[j],b[j]))values.push(a[k]+(t-a[j])*(b[k]-a[k])/(b[j]-a[j]));}
    return values.length===2?values.sort((a,b)=>a-b):null;
  }
  function inkDivider(rgba,w,h,q){
    const b=bounds(q),gray=i=>.299*rgba[i*4]+.587*rgba[i*4+1]+.114*rgba[i*4+2];
    for(const vertical of [false,true]){
      const j=vertical?0:1,lo=Math.ceil(b[j]+(b[j+2]-b[j])*.12),hi=Math.floor(b[j+2]-(b[j+2]-b[j])*.12);
      for(let pos=lo;pos<=hi;pos++){
        const sec=section(q,pos,vertical);if(!sec)continue;
        const start=Math.ceil(sec[0])+4,end=Math.floor(sec[1])-4;if(end-start<40)continue;
        const index=(t,p)=>vertical?t*w+p:p*w+t;let n=0,matched=0,first=0,last=0;
        for(let t=start;t<=end;t++){
          n++;const i=index(t,pos),g=gray(i);if(g>65||Math.max(rgba[i*4],rgba[i*4+1],rgba[i*4+2])-Math.min(rgba[i*4],rgba[i*4+1],rgba[i*4+2])>12)continue;
          let l=pos,r=pos;while(l>pos-6&&Math.abs(gray(index(t,l-1))-g)<=3)l--;while(r<pos+6&&Math.abs(gray(index(t,r+1))-g)<=3)r++;
          if(l===pos-6||r===pos+6||r-l>7)continue;
          let before=0,after=0;for(let d=2;d<=4;d++){before+=gray(index(t,l-d));after+=gray(index(t,r+d));}
          if(Math.min(before/3-g,after/3-g)<=14)continue;
          matched++;if(t<start+(end-start)*.18)first++;if(t>end-(end-start)*.18)last++;
        }
        if(matched/n>=.60&&first/(n*.18)>=.45&&last/(n*.18)>=.45)return true;
      }
    }return false;
  }
  function validPanel(p){try{return validate(p);}catch(_){return false;}}
  function validate(p){
    if(p?._terminalProof?.version===4)return validColumnPanel(p);
    if(p?._terminalProof?.version===3)return validAdjacentPanel(p);
    if(p?._terminalProof?.version===2)return validWidePanel(p);
    const pr=p?._terminalProof,w=pr?.analysisWidth,h=pr?.analysisHeight;
    if(p?._identitySource!=='terminal-rim-frame'||pr?.version!==1||pr.method!==METHOD||!Number.isInteger(w)||!Number.isInteger(h)||!range(w,250,900)||!range(h,350,900)||!Array.isArray(pr.rails)||pr.rails.length!==4||!Array.isArray(pr.cells)||pr.cells.length!==2)return false;
    if(pr.dividerVetoPassed!==true||pr.insetVetoPassed!==true||pr.uniformInkVetoPassed!==true)return false;
    if(!Array.isArray(pr.color)||pr.color.length!==3||pr.color.some(n=>!Number.isInteger(n)||!range(n,0,255)))return false;
    const base=.299*pr.color[0]+.587*pr.color[1]+.114*pr.color[2];if(!range(base,0,25)||pr.base!==base)return false;
    if(!Array.isArray(pr.fractions)||pr.fractions.length!==4||pr.fractions.some(n=>!range(n,.8,1)))return false;
    const lengths=[Math.ceil(w/2),Math.ceil(w/2),Math.ceil(h/2),Math.ceil(h/2)];
    if(pr.fractions.some((f,i)=>Math.abs(f*lengths[i]-Math.round(f*lengths[i]))>1e-8)||pr.fractions.reduce((sum,f,i)=>sum+f*lengths[i],0)/lengths.reduce((sum,n)=>sum+n,0)<.93)return false;
    for(let i=0;i<2;i++){const c=pr.cells[i];if(!Array.isArray(c?.box)||c.box.length!==4||c.box.some(n=>!Number.isInteger(n))||c.threshold!==base+[6,8][i]||!Number.isInteger(c.pixels))return false;const [x,y,X,Y]=c.box,A=(X-x+1)*(Y-y+1);if(x<1||y<1||X>=w-1||Y>=h-1||!range(A/(w*h),.055,.20)||!range((X-x+1)/w,.40,.80)||!range((Y-y+1)/h,.10,.27)||(X-x+1)/(Y-y+1)<1.8||!range(c.pixels/A,.77,1))return false;}
    const [a,b]=pr.cells;
    if(a.box.some((v,i)=>Math.abs(v-b.box[i])>2)||b.pixels>a.pixels||(a.pixels-b.pixels)/a.pixels>.04||!Array.isArray(pr.retained)||pr.retained.length!==2||pr.retained[0]!==a.pixels||pr.retained[1]!==b.pixels)return false;
    for(const c of pr.cells)if(Math.min(c.box[0],w-1-c.box[2])>w*.075||Math.min(c.box[1],h-1-c.box[3])>h*.04)return false;
    for(let i=0;i<4;i++){
      const r=pr.rails[i];if(!r||r.v!==(i>=2)||r.side!==i%2||!range(r.m,-.04,.04)||!finite(r.b)||!Number.isInteger(r.lo)||!Number.isInteger(r.hi)||r.hi-r.lo<60||r.total!==r.hi-r.lo+1)return false;
      const j=r.v?1:0,k=1-j,p0=a.box[k+(r.side?2:0)],dir=r.side?1:-1;
      if(r.lo!==a.box[j]+5||r.hi!==a.box[j+2]-5||!Number.isInteger(r.offset)||!range(r.offset,-3,10)||!range(r.enclosureShift,0,1)||Math.abs(r.m/.002-Math.round(r.m/.002))>1e-8||Math.abs(r.b-(p0+dir*r.offset-r.m*(r.lo+r.hi)/2+dir*r.enclosureShift))>1e-8||r.exterior!==((r.side?(r.v?w:h)-1-p0:p0)<(r.v?w:h)*.075))return false;
      for(const k of ['matched','core','inward','outward','opposite','lost','extent','maxGap'])if(!Number.isInteger(r[k]))return false;
      if(r.extent!==r.total||!range(r.outward,0,r.total)||!range(r.opposite,0,r.total)||!range(r.matched/r.total,.99,1)||!range(r.core/r.total,.90,1)||!range(r.inward/r.total,.42,1)||(r.exterior?!range(r.outward/r.total,.78,1):!range(r.opposite/r.total,.42,1)||!range(r.core/r.total,.95,1))||!range(r.maxGap,0,2)||!range(r.lost,0,r.extent*.01))return false;
      if(!Array.isArray(r.quarters)||r.quarters.length!==4||r.quarters.some((q,i)=>q.samples!==Math.ceil((i+1)*r.total/4)-Math.ceil(i*r.total/4)||!Number.isInteger(q.samples)||!Number.isInteger(q.matched)||q.samples<1||!range(q.matched/q.samples,.96,1))||r.quarters.reduce((s,q)=>s+q.samples,0)!==r.total||r.quarters.reduce((s,q)=>s+q.matched,0)!==r.matched)return false;
    }
    if(!pr.rails.slice(0,2).some(r=>r.exterior)||!pr.rails.slice(2).some(r=>r.exterior))return false;
    const q=quad(pr.rails),box=bounds(q),A=area(q);if(!range(A/(w*h),.055,.21)||q.some(a=>!range(a[0],1,w-1)||!range(a[1],1,h-1))||q.some((a,i)=>cross(a,q[(i+1)%4],q[(i+2)%4])<=0))return false;
    if(!Array.isArray(p._outline)||p._outline.length!==4||p._outline.some((v,i)=>!range(v?.x,0,1)||!range(v?.y,0,1)||Math.abs(v.x-q[i][0]/w)>1e-9||Math.abs(v.y-q[i][1]/h)>1e-9))return false;
    return ['x','y','w','h'].every(k=>finite(p[k]))&&Math.max(Math.abs(p.x-box[0]/w),Math.abs(p.y-box[1]/h),Math.abs(p.w-(box[2]-box[0])/w),Math.abs(p.h-(box[3]-box[1])/h))<1e-9;
  }
  function analyzeRGBA(rgba,w,h,log){
    if(!Number.isInteger(w)||!Number.isInteger(h)||!range(w,250,900)||!range(h,350,900)||!(rgba instanceof Uint8Array||rgba instanceof Uint8ClampedArray)||rgba.length!==w*h*4)return [];
    const m=matte(rgba,w,h);if(!m)return [];const sets=[6,8].map(d=>cells(m.gray,w,h,m.base+d));if(sets.some(s=>!s.length))return [];const out=[];
    for(const a of sets[0]){
      const pair=sets[1].filter(b=>a.box.every((v,i)=>Math.abs(v-b.box[i])<=2)&&Math.abs(a.pixels-b.pixels)/a.pixels<=.04);if(pair.length!==1)continue;const b=pair[0];log?.('terminal cell '+JSON.stringify(a.box));
      const rs=[];for(const v of [false,true])for(const side of [0,1]){const r=rail(a,v,side,m.gray,w,h,m.base,log);if(r)rs.push(r);}
      if(rs.length!==4)continue;const q=quad(rs),box=bounds(q),A=area(q);if(A<w*h*.055||A>w*h*.21||q.some(p=>p[0]<1||p[1]<1||p[0]>w-1||p[1]>h-1))continue;
      if(inkDivider(rgba,w,h,q)){log?.('terminal veto: interrupted uniform-ink divider');continue;}
      const check={box:[Math.ceil(Math.max(q[0][0],q[3][0]))+4,Math.ceil(Math.max(q[0][1],q[1][1]))+4,Math.floor(Math.min(q[1][0],q[2][0]))-4,Math.floor(Math.min(q[2][1],q[3][1]))-4]};
      if(typeof PanelClosedFrames==='undefined'||PanelClosedFrames.analyzeRGBA(rgba,w,h,null,{gradientOnly:true,localMatteInset:true,vetoCandidates:[check]}).length!==1){log?.('terminal veto: internal divider/inset');continue;}
      const retained=[a,b].map(c=>{let n=0;for(let y=c.box[1];y<=c.box[3];y++)for(let x=c.box[0];x<=c.box[2];x++)if(c.labels[y*w+x]===c.id&&inside(q,x,y))n++;return n;});
      if(retained[0]!==a.pixels||retained[1]!==b.pixels){log?.('terminal veto: component loss');continue;}
      const pr={version:1,method:METHOD,analysisWidth:w,analysisHeight:h,color:m.color,base:m.base,fractions:m.fractions,retained,cells:[a,b].map(c=>({box:c.box,pixels:c.pixels,threshold:c.threshold})),rails:rs,dividerVetoPassed:true,insetVetoPassed:true,uniformInkVetoPassed:true};
      const p={x:box[0]/w,y:box[1]/h,w:(box[2]-box[0])/w,h:(box[3]-box[1])/h,_outline:q.map(p=>({x:p[0]/w,y:p[1]/h})),_identitySource:'terminal-rim-frame',_geometryOwner:'terminal-rim-outline',_geometryType:'four-observed-dark-rims',_terminalProof:pr};
      if(validPanel(p))out.push(p);else log?.('terminal validation failed');
    }
    log?.('terminal rims: '+out.length+' separately enclosed terminal scenes');return out.length<=2?out:[];
  }
  function analyzeImage(img,log){
    if(!img||!finite(img.width)||!finite(img.height)||img.width<1||img.height<1)return [];
    const s=Math.min(1,900/Math.max(img.width,img.height)),w=Math.round(img.width*s),h=Math.round(img.height*s),c=document.createElement('canvas');
    c.width=w;c.height=h;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,w,h);
    return analyzeRGBA(ctx.getImageData(0,0,w,h).data,w,h,log);
  }

  // Frame Test 30: separately bordered full-width terminal panels inside an
  // unclassified legacy group. Unlike v1, this does not force a straight quad
  // through a hand-inked light rim. The hull encloses two independently flooded
  // components; each of its four sides must have a quiet outside collar and
  // witnessed light ink inside. Missing/ambiguous rims or interior frames veto.
  const WIDE_METHOD='dual-luminance-closed-wide-terminal-rim';

  // Veto-only exact/near-neutral internal strokes. This supplements the older
  // contrast veto when either side of an inserted boundary is itself dark.
  // The full line or all four closed inset sides must be independently seen;
  // a free path through hatching is never accepted as a border.
  function wideUniformVeto(rgba,gray,w,h,q){
    const b=bounds(q),local=area(q),lines=[[],[]];
    const neutral=i=>Math.max(rgba[i*4],rgba[i*4+1],rgba[i*4+2])-Math.min(rgba[i*4],rgba[i*4+1],rgba[i*4+2])<=10;
    for(const v of [false,true]){
      const j=v?0:1,k=1-j,lo=Math.ceil(b[j])+7,hi=Math.floor(b[j+2])-7,a=Math.ceil(b[k])+4,bb=Math.floor(b[k+2])-4;
      const idx=(t,p)=>v?t*w+p:p*w+t;
      for(let pos=lo;pos<=hi;pos++){
        const sec=section(q,pos,v);if(!sec)continue;
        const start=Math.ceil(sec[0])+4,end=Math.floor(sec[1])-4;
        for(let t=start;t<=end;t++){
          const first=t,c=gray[idx(t,pos)];if(!neutral(idx(t,pos)))continue;
          while(t+1<=end&&Math.abs(gray[idx(t+1,pos)]-c)<=2&&neutral(idx(t+1,pos)))t++;
          if(t-first<Math.max(28,(bb-a)*.16))continue;
          let total=0,thin=0,contrast=0;
          for(let u=first+2;u<=t-2;u++){
            total++;let l=pos,r=pos;
            while(l>pos-7&&Math.abs(gray[idx(u,l-1)]-c)<=3)l--;while(r<pos+7&&Math.abs(gray[idx(u,r+1)]-c)<=3)r++;
            if(l===pos-7||r===pos+7||r-l>9)continue;thin++;
            let before=0,after=0;for(let d=1;d<=3;d++){before+=gray[idx(u,l-d)];after+=gray[idx(u,r+d)];}
            contrast+=Math.max(Math.abs(before/3-c),Math.abs(after/3-c))>12;
          }
          if(!total||thin/total<.88||contrast/total<.35)continue;
          if((t-first+1)/(end-start+1)>=.90&&first-start<=Math.max(12,(end-start)*.06)&&end-t<=Math.max(12,(end-start)*.06))return true;
          // Coalesce the width of a thick printed stroke rather than treating
          // every identical centerline as another independent boundary.
          const bucket=lines[v?1:0];
          if(!bucket.some(r=>Math.abs(r.p-pos)<=3&&Math.abs(r.lo-first)<=3&&Math.abs(r.hi-t)<=3))bucket.push({p:pos,lo:first,hi:t});
          if(bucket.length>180)return true;
        }
      }
    }
    const [hs,vs]=lines;
    for(let i=0;i<hs.length;i++)for(let j=i+1;j<hs.length;j++){
      const a=hs[i],b=hs[j];if(b.p-a.p<25)continue;
      const choices=vs.filter(v=>v.lo<=a.p+3&&v.hi>=b.p-3&&v.p>=Math.max(a.lo,b.lo)-3&&v.p<=Math.min(a.hi,b.hi)+3);
      for(let k=0;k<choices.length;k++)for(let l=k+1;l<choices.length;l++){
        const ww=choices[l].p-choices[k].p;if(ww>=25&&ww*(b.p-a.p)>=local*.04&&ww*(b.p-a.p)<=local*.80)return true;
      }
    }
    return false;
  }

  function convex(ps){
    ps=[...new Map(ps.map(p=>[p.join(','),p])).values()].sort((a,b)=>a[0]-b[0]||a[1]-b[1]);if(ps.length<4)return null;
    const half=a=>{const out=[];for(const p of a){while(out.length>1&&cross(out.at(-2),out.at(-1),p)<=0)out.pop();out.push(p);}out.pop();return out;};
    return half(ps).concat(half(ps.slice().reverse()));
  }
  function cellOutline(c){
    const points=[];for(let y=c.box[1];y<=c.box[3];y++)if(c.rowMax[y]>=0)points.push([c.rowMin[y],y],[c.rowMax[y],y]);
    const q=convex(points);return q&&convex(q.flatMap(p=>[-.5,.5].flatMap(dx=>[-.5,.5].map(dy=>[p[0]+dx,p[1]+dy]))));
  }
  function wideShape(q,w,h){
    if(!Array.isArray(q)||q.length<4||q.length>48||q.some(p=>!Array.isArray(p)||p.length!==2||p.some(n=>!finite(n)||Math.abs(n*2-Math.round(n*2))>1e-9))||q.some((p,i)=>cross(p,q[(i+1)%q.length],q[(i+2)%q.length])<=0))return null;
    const b=bounds(q),ww=b[2]-b[0],hh=b[3]-b[1],A=area(q);
    if(b[0]<.5||b[1]<.5||b[2]>w-.5||b[3]>h-.5||b[0]>w*.06||w-b[2]>w*.06||h-b[3]>h*.036||!range(ww/w,.80,.995)||!range(hh/h,.08,.32)||ww/hh<2||!range(A/(w*h),.065,.30)||A/(ww*hh)<.92)return null;
    // Each vertex must stay close to one of the enclosing box sides. A large
    // pointed protrusion cannot become a fictitious straight-edged band.
    if(q.some(p=>Math.min(p[0]-b[0],b[2]-p[0])>ww*.04&&Math.min(p[1]-b[1],b[3]-p[1])>hh*.10))return null;
    return {box:b,area:A};
  }
  function wideRim(q,gray,w,h,base){
    const sides=Array.from({length:4},()=>({samples:0,quiet:0,light:0,maxGap:0}));
    for(let i=0;i<q.length;i++){
      const a=q[i],b=q[(i+1)%q.length],dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy),nx=dy/L,ny=-dx/L;
      const side=Math.abs(nx)>Math.abs(ny)?(nx<0?2:3):(ny<0?0:1),r=sides[side];let gap=0;
      for(let t=1;t<L-1;t++){
        const x=a[0]+dx*t/L,y=a[1]+dy*t/L;let quiet=false,light=false;
        for(const d of [.5,1,2,3]){const X=Math.round(x+nx*d),Y=Math.round(y+ny*d);if(X<0||X>=w||Y<0||Y>=h)return null;quiet||=gray[Y*w+X]<=base+10;}
        for(let d=0;d<=10;d++){const X=Math.round(x-nx*d),Y=Math.round(y-ny*d);if(X>=0&&X<w&&Y>=0&&Y<h)light||=gray[Y*w+X]>=base+60;}
        r.samples++;r.quiet+=quiet;r.light+=light;gap=quiet?0:gap+1;r.maxGap=Math.max(r.maxGap,gap);
      }
    }
    return sides.every(r=>r.samples>=45&&r.quiet/r.samples>=.985&&r.light/r.samples>=.88&&r.maxGap<=2)?sides:null;
  }
  function wideCellRecord(c,q){return {box:c.box,pixels:c.pixels,threshold:c.threshold,q};}
  function widePanelGeometry(p){
    const pr=p?._terminalProof,w=pr?.analysisWidth,h=pr?.analysisHeight;
    if(p?._identitySource!=='terminal-rim-frame'||!((p._geometryOwner===undefined&&p._geometryType===undefined)||(p._geometryOwner==='terminal-rim-outline'&&['enclosed-light-rim-hull','orthogonal','four-observed-dark-rims'].includes(p._geometryType)))||pr?.version!==2||pr.method!==WIDE_METHOD||!Number.isInteger(w)||!Number.isInteger(h)||!range(w,250,900)||!range(h,350,900))return null;
    const sh=wideShape(pr.q,w,h);if(!sh)return null;
    return {pr,w,h,sh};
  }
  function validWidePanel(p){try{
    const spec=widePanelGeometry(p);if(!spec)return false;const {pr,w,h,sh}=spec;
    if(!Array.isArray(pr.color)||pr.color.length!==3||pr.color.some(v=>!Number.isInteger(v)||!range(v,0,255)))return false;
    const base=.299*pr.color[0]+.587*pr.color[1]+.114*pr.color[2];if(pr.base!==base||!range(base,0,25))return false;
    const lengths=[Math.ceil(w/2),Math.ceil(w/2),Math.ceil(h/2),Math.ceil(h/2)];
    if(!Array.isArray(pr.fractions)||pr.fractions.length!==4||pr.fractions.some((f,i)=>!range(f,.8,1)||Math.abs(f*lengths[i]-Math.round(f*lengths[i]))>1e-8)||pr.fractions.reduce((s,f,i)=>s+f*lengths[i],0)/lengths.reduce((s,n)=>s+n,0)<.93)return false;
    if(!Array.isArray(pr.cells)||pr.cells.length!==2||!Array.isArray(pr.retained)||pr.retained.length!==2||pr.dividerVetoPassed!==true||pr.insetVetoPassed!==true||pr.uniformVetoPassed!==true)return false;
    for(let k=0;k<2;k++){
      const c=pr.cells[k];if(!Array.isArray(c?.box)||c.box.length!==4||c.box.some(v=>!Number.isInteger(v))||!Number.isInteger(c.pixels)||c.threshold!==base+[6,8][k]||pr.retained[k]!==c.pixels)return false;
      const [x,y,X,Y]=c.box,bw=X-x+1,bh=Y-y+1,A=bw*bh,qshape=wideShape(c.q,w,h);
      if(x<1||y<1||X>=w-1||Y>=h-1||x>w*.06||w-1-X>w*.06||h-1-Y>h*.035||!range(A/(w*h),.065,.30)||!range(bw/w,.8,.995)||!range(bh/h,.08,.32)||bw/bh<2||!range(c.pixels/A,.86,1)||!qshape||!range(c.pixels/qshape.area,.90,1.02))return false;
      if(qshape.box.some((v,i)=>Math.abs(v-([x-.5,y-.5,X+.5,Y+.5][i]))>1e-9))return false;
    }
    const [a,b]=pr.cells;if(a.box.some((v,i)=>Math.abs(v-b.box[i])>2)||b.pixels>a.pixels||(a.pixels-b.pixels)/a.pixels>.025||JSON.stringify(pr.q)!==JSON.stringify(a.q))return false;
    // Both independently measured component hulls must agree to within two
    // analysis pixels, not merely share a bounding box.
    for(const [u,v] of [[a.q,b.q],[b.q,a.q]])for(const pt of u)if(!inside(v,pt[0],pt[1])){
      let min=Infinity;for(let j=0;j<v.length;j++){const p0=v[j],p1=v[(j+1)%v.length],dx=p1[0]-p0[0],dy=p1[1]-p0[1],t=Math.max(0,Math.min(1,((pt[0]-p0[0])*dx+(pt[1]-p0[1])*dy)/(dx*dx+dy*dy)));min=Math.min(min,Math.hypot(pt[0]-p0[0]-t*dx,pt[1]-p0[1]-t*dy));}if(min>2)return false;
    }
    if(!Array.isArray(pr.rim)||pr.rim.length!==4)return false;
    const counts=[0,0,0,0];for(let i=0;i<pr.q.length;i++){const a=pr.q[i],b=pr.q[(i+1)%pr.q.length],dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy),side=Math.abs(dy)>Math.abs(dx)?(dy<0?2:3):(dx>0?0:1);for(let t=1;t<L-1;t++)counts[side]++;}
    for(let i=0;i<4;i++){const r=pr.rim[i];if(!r||r.samples!==counts[i]||r.samples<45||!Number.isInteger(r.quiet)||!Number.isInteger(r.light)||!Number.isInteger(r.maxGap)||!range(r.quiet/r.samples,.985,1)||!range(r.light/r.samples,.88,1)||!range(r.maxGap,0,2))return false;}
    const st=pr.content;if(!st||!Number.isInteger(st.pixels)||st.pixels<sh.area*.75||st.pixels>sh.area*1.03||!range(st.mean,20,210)||!range(st.variance,650,16257)||!Number.isInteger(st.dark)||!Number.isInteger(st.light)||!range(st.dark/st.pixels,.08,.92)||!range(st.light/st.pixels,.05,.85)||st.dark+st.light>st.pixels)return false;
    const outline=pr.q.map(([x,y])=>({x:x/w,y:y/h}));if(JSON.stringify(outline)!==JSON.stringify(p._outline))return false;
    return ['x','y','w','h'].every(k=>finite(p[k]))&&Math.max(Math.abs(p.x-sh.box[0]/w),Math.abs(p.y-sh.box[1]/h),Math.abs(p.w-(sh.box[2]-sh.box[0])/w),Math.abs(p.h-(sh.box[3]-sh.box[1])/h))<1e-10;
  }catch(_){return false;}}
  function wideRGBA(rgba,w,h,log){
    if(!Number.isInteger(w)||!Number.isInteger(h)||!range(w,250,900)||!range(h,350,900)||!(rgba instanceof Uint8Array||rgba instanceof Uint8ClampedArray)||rgba.length!==w*h*4)return [];
    const m=matte(rgba,w,h);if(!m)return [];const ss=[6,8].map(d=>cells(m.gray,w,h,m.base+d,true));if(ss.some(s=>!s.length))return [];
    const out=[];
    for(const a of ss[0]){
      const pair=ss[1].filter(b=>a.box.every((v,i)=>Math.abs(v-b.box[i])<=2)&&b.pixels<=a.pixels&&(a.pixels-b.pixels)/a.pixels<=.025);if(pair.length!==1)continue;const b=pair[0],q=cellOutline(a),q2=cellOutline(b),sh=wideShape(q,w,h);
      if(!sh||!q2||a.pixels/sh.area<.90)continue;const rim=wideRim(q,m.gray,w,h,m.base);if(!rim){log?.('wide rim withheld: collar/light evidence');continue;}
      if(inkDivider(rgba,w,h,q)||wideUniformVeto(rgba,m.gray,w,h,q)){log?.('wide rim withheld: interior uniform divider/inset');continue;}
      const box=[Math.ceil(sh.box[0])+6,Math.ceil(sh.box[1])+6,Math.floor(sh.box[2])-6,Math.floor(sh.box[3])-6];
      if(typeof PanelClosedFrames==='undefined'||PanelClosedFrames.analyzeRGBA(rgba,w,h,null,{gradientOnly:true,localMatteInset:true,vetoCandidates:[{box}]}).length!==1){log?.('wide rim withheld: interior divider/inset');continue;}
      const retained=[0,0],st={pixels:0,mean:0,variance:0,dark:0,light:0};let sum=0,square=0;
      for(let y=Math.ceil(sh.box[1]);y<=Math.floor(sh.box[3]);y++)for(let x=Math.ceil(sh.box[0]);x<=Math.floor(sh.box[2]);x++)if(inside(q,x,y)){
        const i=y*w+x,g=m.gray[i];retained[0]+=a.labels[i]===a.id;retained[1]+=b.labels[i]===b.id;st.pixels++;sum+=g;square+=g*g;st.dark+=g<65;st.light+=g>140;
      }
      st.mean=sum/st.pixels;st.variance=square/st.pixels-st.mean**2;
      const pr={version:2,method:WIDE_METHOD,analysisWidth:w,analysisHeight:h,color:m.color,base:m.base,fractions:m.fractions,cells:[wideCellRecord(a,q),wideCellRecord(b,q2)],q,rim,retained,content:st,dividerVetoPassed:true,insetVetoPassed:true,uniformVetoPassed:true};
      const p={x:sh.box[0]/w,y:sh.box[1]/h,w:(sh.box[2]-sh.box[0])/w,h:(sh.box[3]-sh.box[1])/h,_outline:q.map(([x,y])=>({x:x/w,y:y/h})),_identitySource:'terminal-rim-frame',_geometryOwner:'terminal-rim-outline',_geometryType:'enclosed-light-rim-hull',_terminalProof:pr};
      if(validPanel(p))out.push(p);else log?.('wide rim withheld: proof validator');
    }
    log?.('wide terminal rims: '+out.length+' separately bordered strips');return out.length===1?out:[];
  }
  function wideParent(p){return !!p&&!p._identitySource&&!p._quad&&['x','y','w','h'].every(k=>finite(p[k]))&&range(p.x,0,.10)&&range(p.y,0,.75)&&range(p.w,.8,1)&&range(p.h,.35,1)&&p.w*p.h>.30&&p.x+p.w<=1.01&&p.y+p.h<=1.01;}
  function refineWideImage(img,identities,baseline,log){
    if(!img||!finite(img.width)||!finite(img.height)||img.width<1||img.height<1||!Array.isArray(identities)||!Array.isArray(baseline))return [];
    const parents=baseline.filter(wideParent);if(parents.length!==1)return [];const parent=parents[0];
    const overlap=(a,b)=>Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y));
    if(identities.some(p=>p._identitySource&&overlap(p,parent)>.00001))return [];
    try{const s=Math.min(1,900/Math.max(img.width,img.height)),w=Math.round(img.width*s),h=Math.round(img.height*s),c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d',{willReadFrequently:true});if(!ctx)return [];ctx.drawImage(img,0,0,w,h);
      const found=wideRGBA(ctx.getImageData(0,0,w,h).data,w,h,log);
      return found.filter(p=>p.x>=parent.x-.02&&p.y>=parent.y&&p.x+p.w<=parent.x+parent.w+.02&&p.y+p.h<=parent.y+parent.h+.02&&p.w*p.h<parent.w*parent.h*.75&&!identities.some(q=>q!==parent&&overlap(q,p)>.00001));
    }catch(_){return [];}
  }


  // Frame Test 31: a second wide scene may have an interrupted pale rim where
  // a dark foreground silhouette touches it. A previously proved bottom scene
  // anchors the search, but does NOT supply a crop. Independently flood two
  // luminance thresholds, cluster only complete neighboring ink components,
  // trace a narrow external corridor, and prove all four enclosing sides.
  // Neither the accepted anchor nor the old fallback descriptors are changed.
  const ADJ_METHOD='dual-matte-cluster-with-observed-rims-above-wide-terminal';
  function adjacentComponents(gray,w,h,threshold){
    const bg=new Uint8Array(w*h),queue=new Int32Array(w*h);let head=0,n=0;
    const offer=i=>{if(!bg[i]&&gray[i]<=threshold){bg[i]=1;queue[n++]=i;}};
    for(let x=0;x<w;x++){offer(x);offer((h-1)*w+x);}for(let y=0;y<h;y++){offer(y*w);offer(y*w+w-1);}
    while(head<n){const i=queue[head++],x=i%w,y=i/w|0;if(x)offer(i-1);if(x+1<w)offer(i+1);if(y)offer(i-w);if(y+1<h)offer(i+w);}
    const labels=new Int32Array(w*h),all=[];let id=0;
    for(let seed=0;seed<labels.length;seed++)if(!bg[seed]&&!labels[seed]){
      if(++id>16000)return null;head=0;n=1;queue[0]=seed;labels[seed]=id;let x0=w,y0=h,x1=0,y1=0;
      const add=i=>{if(!bg[i]&&!labels[i]){labels[i]=id;queue[n++]=i;}};
      while(head<n){const i=queue[head++],x=i%w,y=i/w|0;x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);if(x)add(i-1);if(x+1<w)add(i+1);if(y)add(i-w);if(y+1<h)add(i+w);}
      all.push({id,box:[x0,y0,x1,y1],pixels:n});
    }return {labels,all,threshold};
  }
  function adjacentShape(q,w,h){
    if(!Array.isArray(q)||q.length<4||q.length>256||q.some(p=>!Array.isArray(p)||p.length!==2||p.some(v=>!finite(v)||Math.abs(v*2-Math.round(v*2))>1e-9)))return null;
    const b=bounds(q),ww=b[2]-b[0],hh=b[3]-b[1],A=area(q);
    if(b[0]<.5||b[1]<h*.30||b[2]>w-.5||b[3]>h-.5||b[0]>w*.05||w-b[2]>w*.065||!range(ww/w,.85,.995)||!range(hh/h,.08,.25)||ww/hh<2.5||!range(A/(ww*hh),.90,1)||!range(A/(w*h),.065,.25))return null;
    for(let i=0;i<q.length;i++){
      const a=q[i],b=q[(i+1)%q.length];if(a[0]===b[0]&&a[1]===b[1])return null;
      for(let j=i+2;j<q.length;j++){
        if(i===0&&j===q.length-1)continue;const c=q[j],d=q[(j+1)%q.length];
        if(Math.max(a[0],b[0])<Math.min(c[0],d[0])||Math.max(c[0],d[0])<Math.min(a[0],b[0])||Math.max(a[1],b[1])<Math.min(c[1],d[1])||Math.max(c[1],d[1])<Math.min(a[1],b[1]))continue;
        if(cross(a,b,c)*cross(a,b,d)<=0&&cross(c,d,a)*cross(c,d,b)<=0)return null;
      }
    }
    return {box:b,area:A};
  }
  function adjacentRim(q,gray,w,h,base){
    const b=bounds(q),sides=[];
    for(const vertical of [true,false]){
      const j=vertical?0:1,lo=Math.ceil(b[j])+4,hi=Math.floor(b[j+2])-4;
      for(const side of [0,1]){
        const r={samples:0,quiet:0,light:0,maxGap:0,ink:0,maxInkRun:0};let gap=0,run=0;
        for(let t=lo;t<=hi;t++){
          const sec=section(q,t,vertical);if(!sec)return null;const p=sec[side],dir=side?1:-1;
          const value=d=>{const u=Math.round(p+d),x=vertical?t:u,y=vertical?u:t;return x>=0&&x<w&&y>=0&&y<h?gray[y*w+x]:Infinity;};
          let quiet=false,light=false;for(const d of [.5,1,2,3])quiet||=value(dir*d)<=base+10;for(let d=0;d<=10;d++)light||=value(-dir*d)>=base+60;
          const edge=Math.max(...[0,1,2].map(d=>value(-dir*d))),inner=[5,6,7].reduce((s,d)=>s+value(-dir*d),0)/3,ink=edge>=base+70&&edge-inner>=20;run=ink?run+1:0;r.ink+=ink;r.maxInkRun=Math.max(r.maxInkRun,run);r.samples++;r.quiet+=quiet;r.light+=light;gap=quiet?0:gap+1;r.maxGap=Math.max(r.maxGap,gap);
        }sides.push(r);
      }
    }return sides;
  }
  function adjacentGap(q,anchor,w,h,gray,base){
    const b=bounds(q),a=bounds(anchor._terminalProof.q),lo=Math.ceil(Math.max(b[0],a[0]))+5,hi=Math.floor(Math.min(b[2],a[2]))-5;
    if(Math.abs(b[0]-a[0])>w*.04||Math.abs(b[2]-a[2])>w*.04||hi-lo<w*.80)return null;
    const r={samples:0,min:Infinity,max:-Infinity,quiet:0,maxGap:0};let missed=0;
    for(let x=lo;x<=hi;x++){
      const upper=section(q,x,true),lower=section(anchor._terminalProof.q,x,true);if(!upper||!lower)return null;
      const gap=lower[0]-upper[1];r.samples++;r.min=Math.min(r.min,gap);r.max=Math.max(r.max,gap);let quiet=false;
      if(gray)for(let y=Math.ceil(upper[1]+.5);y<=Math.floor(lower[0]-.5);y++)if(y>=0&&y<h&&gray[y*w+x]<=base+10)quiet=true;
      r.quiet+=quiet;missed=quiet?0:missed+1;r.maxGap=Math.max(r.maxGap,missed);
    }
    return range(r.min,1,h*.03)&&range(r.max,1,h*.03)?r:null;
  }
  function adjacentCluster(cc,seed,w,h,anchor,gray){
    const pad=Math.max(3,Math.ceil((seed.box[3]-seed.box[1]+1)*.035)),lo=seed.box[1]-pad,hi=Math.min(seed.box[3]+1,Math.floor(anchor.y*h)-1);
    const selected=cc.all.filter(c=>c.box[1]>=lo&&c.box[3]<=hi&&c.box[0]>=1&&c.box[2]<w-1),ids=new Set(selected.map(c=>c.id));
    if(selected.length<2||selected.length>1500)return null;
    const min=new Int32Array(w).fill(h),max=new Int32Array(w).fill(-1);let pixels=0,x0=w,x1=0;
    for(let y=lo;y<=hi;y++)for(let x=1;x<w-1;x++)if(ids.has(cc.labels[y*w+x])){pixels++;min[x]=Math.min(min[x],y);max[x]=Math.max(max[x],y);x0=Math.min(x0,x);x1=Math.max(x1,x);}
    if(x1-x0<w*.85)return null;
    const hull=convex(Array.from({length:x1-x0+1},(_,i)=>x0+i).filter(x=>max[x]>=0).flatMap(x=>[[x,min[x]],[x,max[x]]]));if(!hull)return null;
    const supports=convex(hull.flatMap(p=>[-.5,.5].flatMap(dx=>[-.5,.5].map(dy=>[p[0]+dx,p[1]+dy]))));
    const tops=[],bottoms=[],options=[],maxShift=Math.max(3,Math.ceil(h*.008));
    // The corridor may bend a few pixels around the adjacent row's printed
    // corners. It cannot cut any clustered foreground or include any other
    // foreground component, even if doing so would make the crop prettier.
    for(let x=x0;x<=x1;x++){
      const sec=section(supports,x,true);if(!sec)return null;
      let first=Math.ceil(sec[0]+.5),last=Math.min(min[x],first+maxShift),bottom=Math.floor(sec[1]-.5)+.5;
      for(let y=Math.max(0,first-1);y<last;y++){const id=cc.labels[y*w+x];if(id&&!ids.has(id))first=Math.max(first,y+1);}
      if(first>last)return null;
      const opts=[];for(let start=first;start<=last;start++){
        const outside=Math.min(...[1,2,3].map(d=>gray[(start-d)*w+x]));
        opts.push({y:start-.5,cost:Math.max(0,outside-cc.threshold)*5+(start-first)*.15});
      }options.push(opts);bottoms.push(bottom);
    }
    // Small-state dynamic programming; no unconstrained path through artwork.
    const states=[];
    for(let i=0;i<options.length;i++){
      const row=options[i].map(o=>({...o,total:Infinity,prev:-1}));
      if(!i)row.forEach(o=>o.total=o.cost);
      else for(const o of row)for(let k=0;k<states[i-1].length;k++){
        const old=states[i-1][k],move=Math.abs(o.y-old.y);if(move>2&&i>2&&i<options.length-3)continue;
        const cost=old.total+o.cost+move*.8;if(cost<o.total){o.total=cost;o.prev=k;}
      }
      if(row.every(o=>!finite(o.total)))return null;states.push(row);
    }
    let j=states.at(-1).reduce((best,o,i,a)=>o.total<a[best].total?i:best,0);
    for(let i=states.length-1;i>=0;i--){tops[i]=states[i][j].y;j=states[i][j].prev;}
    const top=[[x0-.5,tops[0]]],bottom=[[x1+.5,bottoms.at(-1)]];
    for(let i=1;i<tops.length;i++)if(tops[i]!==tops[i-1])top.push([x0+i-.5,tops[i-1]],[x0+i-.5,tops[i]]);
    top.push([x1+.5,tops.at(-1)]);
    for(let i=bottoms.length-2;i>=0;i--)if(bottoms[i]!==bottoms[i+1])bottom.push([x0+i+.5,bottoms[i+1]],[x0+i+.5,bottoms[i]]);
    bottom.push([x0-.5,bottoms[0]]);const q=top.concat(bottom),shape=adjacentShape(q,w,h);if(!shape)return null;
    let retained=0,foreign=0,covered=0,sum=0,square=0,dark=0,light=0;
    for(let x=x0;x<=x1;x++)for(let y=Math.ceil(tops[x-x0]);y<=Math.floor(bottoms[x-x0]);y++){
      const idx=y*w+x,id=cc.labels[idx],g=gray[idx];covered++;sum+=g;square+=g*g;dark+=g<65;light+=g>140;
      if(ids.has(id))retained++;else if(id)foreign++;
    }
    if(retained!==pixels||foreign)return null;
    const mean=sum/covered;
    return {q,box:shape.box,area:shape.area,pixels,retained,foreign,components:selected.length,threshold:cc.threshold,content:{pixels:covered,mean,variance:square/covered-mean*mean,dark,light}};
  }
  function adjacentRecordsAgree(a,b,w,h){
    if(a.box.some((v,i)=>Math.abs(v-b.box[i])>2)||b.pixels>a.pixels||a.pixels-b.pixels>a.pixels*.04)return false;
    const lo=Math.ceil(Math.max(a.box[0],b.box[0])),hi=Math.floor(Math.min(a.box[2],b.box[2]));
    for(let x=lo;x<=hi;x++){
      const u=section(a.q,x,true),v=section(b.q,x,true);if(!u||!v||u.some((n,k)=>Math.abs(n-v[k])>3))return false;
    }return true;
  }
  function validAdjacentPanel(p){try{
    const pr=p?._terminalProof,w=pr?.analysisWidth,h=pr?.analysisHeight;
    if(p?._identitySource!=='terminal-rim-frame'||pr?.version!==3||pr.method!==ADJ_METHOD||!Number.isInteger(w)||!Number.isInteger(h)||!range(w,250,900)||!range(h,350,900))return false;
    if(!((p._geometryOwner===undefined&&p._geometryType===undefined)||(p._geometryOwner==='terminal-rim-outline'&&['adjacent-light-rim-outline','orthogonal','four-observed-dark-rims'].includes(p._geometryType))))return false;
    const anchor=pr.anchor;if(anchor?._terminalProof?.version!==2||!validWidePanel(anchor)||anchor._terminalProof.analysisWidth!==w||anchor._terminalProof.analysisHeight!==h)return false;
    if(pr.base!==anchor._terminalProof.base||JSON.stringify(pr.color)!==JSON.stringify(anchor._terminalProof.color)||!Array.isArray(pr.records)||pr.records.length!==2||pr.dividerVetoPassed!==true||pr.insetVetoPassed!==true||pr.uniformVetoPassed!==true)return false;
    const sh=adjacentShape(pr.q,w,h);if(!sh||JSON.stringify(pr.q)!==JSON.stringify(pr.records[0].q))return false;
    for(let k=0;k<2;k++){
      const c=pr.records[k],s=adjacentShape(c.q,w,h);if(!s||JSON.stringify(s.box)!==JSON.stringify(c.box)||s.area!==c.area||c.threshold!==pr.base+[6,8][k]||!Number.isInteger(c.components)||!range(c.components,2,1500)||!Number.isInteger(c.pixels)||!range(c.pixels/c.area,.55,1.03)||c.retained!==c.pixels||c.foreign!==0)return false;
      const t=c.content;if(!t||!Number.isInteger(t.pixels)||!range(t.pixels/c.area,.98,1.02)||!range(t.mean,20,210)||!range(t.variance,650,16257)||!Number.isInteger(t.dark)||!Number.isInteger(t.light)||!range(t.dark/t.pixels,.08,.92)||!range(t.light/t.pixels,.05,.85)||t.dark+t.light>t.pixels)return false;
    }
    if(!adjacentRecordsAgree(...pr.records,w,h))return false;
    const gap=adjacentGap(pr.q,anchor,w,h);if(!gap||!pr.gap||['samples','min','max'].some(k=>gap[k]!==pr.gap[k])||!Number.isInteger(pr.gap.quiet)||!range(pr.gap.quiet/gap.samples,.985,1)||!Number.isInteger(pr.gap.maxGap)||!range(pr.gap.maxGap,0,3))return false;
    if(!Array.isArray(pr.rim)||pr.rim.length!==4)return false;
    const counts=[0,1,2,3].map(i=>Math.floor(sh.box[i<2?2:3])-Math.ceil(sh.box[i<2?0:1])-7);
    for(let i=0;i<4;i++){const r=pr.rim[i];if(!r||r.samples!==counts[i]||r.samples<45||!Number.isInteger(r.quiet)||!range(r.quiet/r.samples,.965,1)||!Number.isInteger(r.light)||!range(r.light/r.samples,i<2?.60:.88,1)||!Number.isInteger(r.maxGap)||!range(r.maxGap,0,4))return false;}
    if(pr.rim.reduce((s,r)=>s+r.light,0)/pr.rim.reduce((s,r)=>s+r.samples,0)<.70)return false;
    // Quiet matte beside bright scene color is not itself a printed frame.
    // Require a continuous light ridge on BOTH horizontal rims and one side.
    // Broken horizontal ink is allowed elsewhere, but not total missing rims.
    for(const r of pr.rim)if(!Number.isInteger(r.ink)||!range(r.ink,0,r.light)||!Number.isInteger(r.maxInkRun)||!range(r.maxInkRun,0,r.ink))return false;
    if(pr.rim.slice(0,2).some(r=>r.maxInkRun<Math.max(20,r.samples*.045))||!pr.rim.slice(2).some(r=>r.maxInkRun>=Math.max(12,r.samples*.08)))return false;

    const outline=pr.q.map(([x,y])=>({x:x/w,y:y/h}));if(JSON.stringify(outline)!==JSON.stringify(p._outline))return false;
    return ['x','y','w','h'].every(k=>finite(p[k]))&&Math.max(Math.abs(p.x-sh.box[0]/w),Math.abs(p.y-sh.box[1]/h),Math.abs(p.w-(sh.box[2]-sh.box[0])/w),Math.abs(p.h-(sh.box[3]-sh.box[1])/h))<1e-10;
  }catch(_){return false;}}
  function adjacentRGBA(rgba,w,h,anchor,log){
    if(!Number.isInteger(w)||!Number.isInteger(h)||!range(w,250,900)||!range(h,350,900)||!(rgba instanceof Uint8Array||rgba instanceof Uint8ClampedArray)||rgba.length!==w*h*4||anchor?._terminalProof?.version!==2||!validWidePanel(anchor)||anchor._terminalProof.analysisWidth!==w||anchor._terminalProof.analysisHeight!==h)return [];
    const m=matte(rgba,w,h);if(!m)return [];
    const reproved=wideRGBA(rgba,w,h);if(reproved.length!==1||JSON.stringify(reproved[0]._terminalProof)!==JSON.stringify(anchor._terminalProof))return [];
    const cc=[6,8].map(d=>adjacentComponents(m.gray,w,h,m.base+d));if(cc.some(c=>!c))return [];
    const sets=cc.map(c=>{
      const seeds=c.all.filter(a=>{const [x,y,X,Y]=a.box,bw=X-x+1,bh=Y-y+1;return range(bw/w,.45,.90)&&range(bh/h,.08,.25)&&bw/bh>2&&a.pixels/(bw*bh)>.55&&y>h*.30&&Y<anchor.y*h&&range(anchor.y*h-Y,1,h*.03);});
      if(seeds.length>4)return [];const out=[];
      for(const seed of seeds){const a=adjacentCluster(c,seed,w,h,anchor,m.gray);if(a&&!out.some(b=>JSON.stringify(a.q)===JSON.stringify(b.q)))out.push(a);}
      return out;
    });log?.('adjacent candidate clusters '+sets.map(a=>a.length).join('/'));
    if(sets.some(s=>s.length!==1))return [];const [a,b]=sets.map(s=>s[0]);if(!adjacentRecordsAgree(a,b,w,h))return [];
    const q=a.q,sh=adjacentShape(q,w,h),gap=adjacentGap(q,anchor,w,h,m.gray,m.base),rim=adjacentRim(q,m.gray,w,h,m.base);
    if(!gap||!rim)return [];log?.('adjacent gap '+JSON.stringify(gap)+' rims '+JSON.stringify(rim));
    const box=[Math.ceil(sh.box[0])+6,Math.ceil(sh.box[1])+6,Math.floor(sh.box[2])-6,Math.floor(sh.box[3])-6];
    if(inkDivider(rgba,w,h,q)||wideUniformVeto(rgba,m.gray,w,h,q)||typeof PanelClosedFrames==='undefined'||PanelClosedFrames.analyzeRGBA(rgba,w,h,null,{gradientOnly:true,localMatteInset:true,vetoCandidates:[{box}]}).length!==1){log?.('adjacent strip rejected: internal divider/inset');return [];}
    const pr={version:3,method:ADJ_METHOD,analysisWidth:w,analysisHeight:h,base:m.base,color:m.color,q,records:[a,b],anchor:JSON.parse(JSON.stringify(anchor)),gap,rim,dividerVetoPassed:true,insetVetoPassed:true,uniformVetoPassed:true};
    const p={x:sh.box[0]/w,y:sh.box[1]/h,w:(sh.box[2]-sh.box[0])/w,h:(sh.box[3]-sh.box[1])/h,_identitySource:'terminal-rim-frame',_geometryOwner:'terminal-rim-outline',_geometryType:'adjacent-light-rim-outline',_outline:q.map(([x,y])=>({x:x/w,y:y/h})),_terminalProof:pr};
    if(!validAdjacentPanel(p)){log?.('adjacent strip rejected: proof');return [];}return [p];
  }
  function refineAdjacentImage(img,identities,baseline,log){
    if(!img||!finite(img.width)||!finite(img.height)||img.width<1||img.height<1||!Array.isArray(identities)||!Array.isArray(baseline))return [];
    const anchors=identities.filter(p=>p?._terminalProof?.version===2&&validWidePanel(p)),parents=baseline.filter(wideParent);if(anchors.length!==1||parents.length!==1)return [];
    const overlap=(a,b)=>Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y));
    try{const s=Math.min(1,900/Math.max(img.width,img.height)),w=Math.round(img.width*s),h=Math.round(img.height*s),c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d',{willReadFrequently:true});if(!g)return [];g.drawImage(img,0,0,w,h);
      const found=adjacentRGBA(g.getImageData(0,0,w,h).data,w,h,anchors[0],log),parent=parents[0];
      return found.filter(p=>p.x>=parent.x-.02&&p.y>=parent.y&&p.x+p.w<=parent.x+parent.w+.02&&p.y+p.h<=parent.y+parent.h+.02&&!identities.some(q=>q!==parent&&overlap(q,p)>.00001));
    }catch(_){return [];}
  }


  // Frame Test 32: a complete bank of tall neighbors bounded by two separately
  // established rows. Do not infer cuts from a requested panel count. Search
  // for long, nearly straight shared matte seams; require independent agreement
  // at two thresholds and corroborating artwork on both sides. Only a narrow
  // observed corridor can bend around balloon rims. All columns are accepted
  // as a group, or none are. This is a bounded layout rule, not general OCR or
  // universal panel inference. No file identity or preassigned crop is used.
  // A column-specific veto includes slightly warm pale printed dividers.
  function columnInkVeto(rgba,gray,w,h,q){
    const b=bounds(q),local=area(q),lines=[[],[]];
    const neutral=i=>Math.max(rgba[i*4],rgba[i*4+1],rgba[i*4+2])-Math.min(rgba[i*4],rgba[i*4+1],rgba[i*4+2])<=24;
    for(const v of [false,true]){
      const j=v?0:1,k=1-j,lo=Math.ceil(b[j])+7,hi=Math.floor(b[j+2])-7,a=Math.ceil(b[k])+4,bb=Math.floor(b[k+2])-4;
      const idx=(t,p)=>v?t*w+p:p*w+t;
      for(let pos=lo;pos<=hi;pos++){
        const sec=section(q,pos,v);if(!sec)continue;
        const start=Math.ceil(sec[0])+4,end=Math.floor(sec[1])-4;
        for(let t=start;t<=end;t++){
          const first=t,c=gray[idx(t,pos)];if(!neutral(idx(t,pos)))continue;
          while(t+1<=end&&Math.abs(gray[idx(t+1,pos)]-c)<=2&&neutral(idx(t+1,pos)))t++;
          if(t-first<Math.max(28,(bb-a)*.16))continue;
          let total=0,thin=0,contrast=0;
          for(let u=first+2;u<=t-2;u++){
            total++;let l=pos,r=pos;
            while(l>pos-7&&Math.abs(gray[idx(u,l-1)]-c)<=3)l--;while(r<pos+7&&Math.abs(gray[idx(u,r+1)]-c)<=3)r++;
            if(l===pos-7||r===pos+7||r-l>9)continue;thin++;
            let before=0,after=0;for(let d=1;d<=3;d++){before+=gray[idx(u,l-d)];after+=gray[idx(u,r+d)];}
            contrast+=Math.max(Math.abs(before/3-c),Math.abs(after/3-c))>12;
          }
          if(!total||thin/total<.88||contrast/total<.35)continue;
          if((t-first+1)/(end-start+1)>=.82&&first-start<=Math.max(12,(end-start)*.06)&&end-t<=Math.max(12,(end-start)*.06))return true;
          // Coalesce the width of a thick printed stroke rather than treating
          // every identical centerline as another independent boundary.
          const bucket=lines[v?1:0];
          if(!bucket.some(r=>Math.abs(r.p-pos)<=3&&Math.abs(r.lo-first)<=3&&Math.abs(r.hi-t)<=3))bucket.push({p:pos,lo:first,hi:t});
          if(bucket.length>180)return true;
        }
      }
    }
    const [hs,vs]=lines;
    for(let i=0;i<hs.length;i++)for(let j=i+1;j<hs.length;j++){
      const a=hs[i],b=hs[j];if(b.p-a.p<25)continue;
      const choices=vs.filter(v=>v.lo<=a.p+3&&v.hi>=b.p-3&&v.p>=Math.max(a.lo,b.lo)-3&&v.p<=Math.min(a.hi,b.hi)+3);
      for(let k=0;k<choices.length;k++)for(let l=k+1;l<choices.length;l++){
        const ww=choices[l].p-choices[k].p;if(ww>=25&&ww*(b.p-a.p)>=local*.04&&ww*(b.p-a.p)<=local*.80)return true;
      }
    }
    return false;
  }

  const COLUMN_METHOD='dual-threshold-shared-seam-bank-above-proved-strip';
  function columnBand(gray,w,h,base,anchor,upper,log){
    const a=anchor._terminalProof.q,b=bounds(a),u=(upper.y+upper.h)*h;
    if(!range(upper.w,.8,1)||!range(upper.h,.10,.30)||!range(b[1]-u,h*.25,h*.56))return null;
    const x0=Math.max(1,Math.floor(Math.min(upper.x*w,b[0])+w*.007)),x1=Math.min(w-2,Math.ceil(Math.max((upper.x+upper.w)*w,b[2])));
    if(x0>w*.04||x1<w*.93)return null;
    const start=Math.max(1,Math.floor(u)-3),stop=Math.min(Math.floor(b[1]-h*.20),Math.ceil(u+h*.045));
    const runs=[];let lo=-1;
    for(let y=start;y<=stop;y++){
      let n=0;for(let x=x0+3;x<=x1-3;x++)n+=gray[y*w+x]<=base+14;
      const yes=n/(x1-x0-5)>=.998;
      if(yes&&lo<0)lo=y;if((!yes||y===stop)&&lo>=0){const hi=yes?y:y-1;if(hi-lo+1>=3)runs.push([lo,hi]);lo=-1;}
    }
    log?.('column band runs '+JSON.stringify({runs,x0,x1,u,b}));if(runs.length!==1)return null;const run=runs[0],top=Math.floor((run[0]+run[1])/2),ends=[];
    // The accepted strip's exact upper boundary is an exclusion constraint,
    // not a replacement rectangular crop. Extend only its exterior end level.
    for(let x=x0;x<=x1;x++){
      const atX=Math.max(b[0]+4,Math.min(b[2]-4,x)),s=section(a,atX,true);if(!s)return null;
      ends.push(Math.ceil(s[0]) - 1);
    }
    const bottom=Math.max(...ends),height=bottom-top;
    if(!range(height/h,.28,.52)||ends.some(y=>bottom-y>h*.025))return null;
    // Verify dark separating pixels just above the strip, per column, without
    // moving either accepted outline. Lack of a gutter aborts the whole bank.
    let quiet=0,missed=0,maxGap=0;
    for(let i=0;i<ends.length;i++){
      const x=x0+i,y=ends[i];let yes=false;for(let d=0;d<=4;d++)yes||=gray[(y-d)*w+x]<=base+14;
      quiet+=yes;missed=yes?0:missed+1;maxGap=Math.max(maxGap,missed);
    }
    log?.('column band gap '+JSON.stringify({top,bottom,quiet,total:ends.length,maxGap}));if(quiet/ends.length<.99||maxGap>3)return null;
    const outer=[];
    for(const side of [0,1]){let samples=0,quiet=0,contrast=0;const X=side?x1:x0,dir=side?-1:1;
      for(let y=top+6;y<=bottom-6;y++){samples++;quiet+=gray[y*w+X]<=base+16;let inward=0;for(let d=6;d<=20;d++)inward=Math.max(inward,gray[y*w+X+dir*d]);contrast+=inward>base+40;}
      if(quiet/samples<.995||contrast/samples<.55)return null;outer.push({samples,quiet,contrast});
    }
    return {x0,x1,top,bottom,ends,upperRun:run,lowerQuiet:quiet,lowerMaxGap:maxGap,outer,lo:Math.ceil(top+height*.065),hi:Math.floor(bottom-height*.065)};
  }
  function columnSeams(gray,w,h,base,band,delta){
    const {x0,x1,lo,hi}=band,mid=(lo+hi)/2,pad=Math.max(6,Math.floor(w*.016)),candidates=[];
    for(let x=x0+Math.ceil(w*.08);x<x1-Math.ceil(w*.08);x++){
      let best=null;
      for(let sm=-10;sm<=10;sm++){
        const m=sm*.002;let n=0,quiet=0,left=0,right=0,maxGap=0,gap=0;const qs=[0,0,0,0],ns=[0,0,0,0];
        for(let y=lo;y<=hi;y+=3){
          const X=Math.round(x+m*(y-mid));let v=Infinity,l=0,r=0;
          for(let d=-1;d<=1;d++)v=Math.min(v,gray[y*w+X+d]);
          for(let d=4;d<=pad+2;d++){l=Math.max(l,gray[y*w+X-d]);r=Math.max(r,gray[y*w+X+d]);}
          const yes=v<=base+delta,q=Math.min(3,Math.floor(4*(y-lo)/(hi-lo+1)));
          n++;quiet+=yes;left+=l>base+40;right+=r>base+40;ns[q]++;qs[q]+=yes;gap=yes?0:gap+1;maxGap=Math.max(maxGap,gap);
        }
        if(quiet/n<.97||maxGap>2||left/n<.48||right/n<.48||qs.some((q,i)=>q/ns[i]<.90))continue;
        const score=quiet/n+.12*left/n+.12*right/n-.1*Math.abs(m);
        if(!best||score>best.score)best={x,m,mid,lo,hi,n,quiet,left,right,maxGap,quarters:qs,counts:ns,delta,score};
      }if(best)candidates.push(best);
    }
    candidates.sort((a,b)=>b.score-a.score||a.x-b.x);const selected=[];
    for(const r of candidates)if(!selected.some(p=>Math.abs(p.x-r.x)<w*.04))selected.push(r);
    selected.sort((a,b)=>a.x-b.x);
    if(selected.length<1||selected.length>7)return null;
    const xx=[x0,...selected.map(r=>r.x),x1],widths=xx.slice(1).map((x,i)=>x-xx[i]);
    if(Math.min(...widths)<w*.095||Math.max(...widths)>w*.32||Math.max(...widths)/Math.min(...widths)>1.85)return null;
    return selected;
  }
  function columnPath(gray,w,h,base,band,r){
    const states=[],radius=3;
    for(let y=band.top;y<=band.bottom;y++){
      const center=r.x+r.m*(y-r.mid),first=Math.round(center)-radius,row=[];
      for(let x=first;x<=first+2*radius;x++){
        const val=gray[y*w+x],cost=Math.max(0,val-base-10)**2*.2+Math.abs(x-center)*.35;
        const q={x,cost,total:Infinity,prev:-1};
        if(!states.length)q.total=cost;
        else for(let k=0;k<states.at(-1).length;k++){
          const old=states.at(-1)[k],move=Math.abs(old.x-x);if(move>1)continue;
          const total=old.total+cost+move*2;if(total<q.total){q.total=total;q.prev=k;}
        }row.push(q);
      }states.push(row);
    }
    const path=[];let j=states.at(-1).reduce((best,o,i,a)=>o.total<a[best].total?i:best,0);
    for(let i=states.length-1;i>=0;i--){path[i]=states[i][j].x;j=states[i][j].prev;}
    let quiet=0,missed=0,maxGap=0,bright=0;
    for(let i=0;i<path.length;i++){const v=gray[(band.top+i)*w+path[i]],yes=v<=base+20;quiet+=yes;bright+=v>base+55;missed=yes?0:missed+1;maxGap=Math.max(maxGap,missed);}
    if(quiet/path.length<.98||maxGap>4||bright)return null;
    return {path,quiet,maxGap,bright};
  }
  function columnMaskContour(mask,w,h){
    // Trace actual pixel-support edges, coalescing collinear vertices. Reject
    // holes, disconnected parts or ambiguous self-touching contours.
    const edges=new Map(),key=(x,y)=>y*(w+1)+x;let count=0;
    const add=(x,y,X,Y)=>{const a=key(x,y),b=key(X,Y);if(edges.has(a))return false;edges.set(a,b);count++;return true;};
    for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++)if(mask[y*w+x]){
      if(!mask[(y-1)*w+x]&&!add(x,y,x+1,y))return null;
      if(!mask[y*w+x+1]&&!add(x+1,y,x+1,y+1))return null;
      if(!mask[(y+1)*w+x]&&!add(x+1,y+1,x,y+1))return null;
      if(!mask[y*w+x-1]&&!add(x,y+1,x,y))return null;
    }
    if(count<8||count>5000)return null;const start=edges.keys().next().value,pts=[];let at=start;
    do{pts.push([at%(w+1)-.5,Math.floor(at/(w+1))-.5]);const next=edges.get(at);if(next===undefined)return null;edges.delete(at);at=next;}while(at!==start&&pts.length<=count);
    if(at!==start||edges.size)return null;
    const q=pts.filter((p,i)=>cross(pts[(i+pts.length-1)%pts.length],p,pts[(i+1)%pts.length])!==0);
    return q.length>=4&&q.length<=512&&area(q)>0?q:null;
  }
  function columnShape(q,w,h){
    if(!Array.isArray(q)||q.length<4||q.length>512||q.some(p=>!Array.isArray(p)||p.length!==2||p.some(v=>!finite(v)||Math.abs(v*2-Math.round(v*2))>1e-9)))return null;
    const b=bounds(q),A=area(q),bw=b[2]-b[0],bh=b[3]-b[1];
    if(b[0]<.5||b[1]<.5||b[2]>w-.5||b[3]>h-.5||!range(bw/w,.09,.34)||!range(bh/h,.27,.53)||!range(A/(bw*bh),.92,1)||bh/bw<2.4)return null;
    // Every generated column must be one interval in each horizontal scanline.
    for(let y=Math.ceil(b[1])+6;y<=Math.floor(b[3])-6;y++){const s=section(q,y,false);if(!s||s[1]-s[0]<1)return null;}
    return {box:b,area:A};
  }
  function validColumnPanel(p){try{
    const pr=p?._terminalProof,w=pr?.analysisWidth,h=pr?.analysisHeight;
    if(p?._identitySource!=='terminal-rim-frame'||pr?.version!==4||pr.method!==COLUMN_METHOD||!Number.isInteger(w)||!Number.isInteger(h)||!range(w,250,900)||!range(h,350,900))return false;
    if(!((p._geometryOwner===undefined&&p._geometryType===undefined)||(p._geometryOwner==='terminal-rim-outline'&&['shared-matte-column-outline','orthogonal','four-observed-dark-rims'].includes(p._geometryType))))return false;
    if(!validAdjacentPanel(pr.anchor)||pr.anchor._terminalProof.analysisWidth!==w||pr.anchor._terminalProof.analysisHeight!==h||pr.base!==pr.anchor._terminalProof.base||JSON.stringify(pr.color)!==JSON.stringify(pr.anchor._terminalProof.color))return false;
    if(!Number.isInteger(pr.index)||!Number.isInteger(pr.count)||!range(pr.count,2,8)||!range(pr.index,0,pr.count-1)||pr.dividerVetoPassed!==true||pr.insetVetoPassed!==true||pr.uniformVetoPassed!==true||pr.whiteCrossingVetoPassed!==true)return false;
    const band=pr.band;if(!band||!Number.isInteger(band.x0)||!Number.isInteger(band.x1)||!Number.isInteger(band.top)||!Number.isInteger(band.bottom)||!range(band.x0,1,w*.04)||!range(band.x1,w*.93,w-2)||!range((band.bottom-band.top)/h,.28,.52)||!Array.isArray(band.ends)||band.ends.length!==band.x1-band.x0+1||band.ends.some(y=>!Number.isInteger(y)||y>band.bottom||band.bottom-y>h*.025)||band.bottom!==Math.max(...band.ends)||!Array.isArray(band.upperRun)||band.upperRun.length!==2||band.upperRun[1]-band.upperRun[0]<2||band.top!==Math.floor((band.upperRun[0]+band.upperRun[1])/2)||!Number.isInteger(band.lowerQuiet)||!range(band.lowerQuiet/band.ends.length,.99,1)||!Number.isInteger(band.lowerMaxGap)||!range(band.lowerMaxGap,0,3))return false;
    const anchorBox=bounds(pr.anchor._terminalProof.q),u=pr.upper;
    if(!u||!['x','y','w','h'].every(k=>finite(u[k]))||!range(u.w,.8,1)||!range(u.h,.1,.3)||u.x<0||u.y<0||u.x+u.w>1.01||u.y+u.h>=pr.anchor.y||!range(anchorBox[1]-(u.y+u.h)*h,h*.25,h*.56))return false;
    const left=Math.max(1,Math.floor(Math.min(u.x*w,anchorBox[0])+w*.007)),right=Math.min(w-2,Math.ceil(Math.max((u.x+u.w)*w,anchorBox[2]))),height=band.bottom-band.top;
    if(band.x0!==left||band.x1!==right||band.lo!==Math.ceil(band.top+height*.065)||band.hi!==Math.floor(band.bottom-height*.065)||band.upperRun.some(v=>!Number.isInteger(v))||band.upperRun[0]<Math.floor((u.y+u.h)*h)-3||band.upperRun[1]>Math.ceil((u.y+u.h)*h+h*.045))return false;
    for(let i=0;i<band.ends.length;i++){const x=Math.max(anchorBox[0]+4,Math.min(anchorBox[2]-4,left+i)),sec=section(pr.anchor._terminalProof.q,x,true);if(!sec||band.ends[i]!==Math.ceil(sec[0])-1)return false;}
    if(!Array.isArray(band.outer)||band.outer.length!==2||band.outer.some(r=>!r||r.samples!==band.bottom-band.top-11||!Number.isInteger(r.quiet)||!range(r.quiet/r.samples,.995,1)||!Number.isInteger(r.contrast)||!range(r.contrast/r.samples,.55,1)))return false;
    if(!Array.isArray(pr.seams)||pr.seams.length!==2||pr.seams.some(rs=>!Array.isArray(rs)||rs.length!==pr.count-1)||!Array.isArray(pr.paths)||pr.paths.length!==pr.count-1)return false;
    for(let k=0;k<2;k++)for(let i=0;i<pr.seams[k].length;i++){
      const r=pr.seams[k][i];if(!r||!Number.isInteger(r.x)||!range(r.m,-.02,.02)||r.delta!==[14,18][k]||r.lo!==band.lo||r.hi!==band.hi||r.mid!==(r.lo+r.hi)/2||r.n!==Math.floor((r.hi-r.lo)/3)+1||!Number.isInteger(r.quiet)||!range(r.quiet/r.n,.97,1)||!Number.isInteger(r.left)||!Number.isInteger(r.right)||!range(r.left/r.n,.48,1)||!range(r.right/r.n,.48,1)||!Number.isInteger(r.maxGap)||!range(r.maxGap,0,2)||!Array.isArray(r.quarters)||r.quarters.length!==4||!Array.isArray(r.counts)||r.counts.length!==4||r.counts.reduce((s,n)=>s+n,0)!==r.n||r.quarters.reduce((s,n)=>s+n,0)!==r.quiet||r.quarters.some((v,j)=>!Number.isInteger(v)||!Number.isInteger(r.counts[j])||!range(v/r.counts[j],.9,1)))return false;
      const other=pr.seams[1-k][i];if(Math.abs(r.x-other.x)>2||Math.abs(r.m-other.m)>.006000001||i&&r.x-pr.seams[k][i-1].x<w*.095)return false;
    }
    for(const rs of pr.seams){const xx=[band.x0,...rs.map(r=>r.x),band.x1],ww=xx.slice(1).map((x,i)=>x-xx[i]);if(Math.min(...ww)<w*.095||Math.max(...ww)>w*.32||Math.max(...ww)/Math.min(...ww)>1.85)return false;}
    for(let i=0;i<pr.paths.length;i++){
      const c=pr.paths[i],r=pr.seams[0][i];if(!c||!Array.isArray(c.path)||c.path.length!==band.bottom-band.top+1||!Number.isInteger(c.quiet)||!range(c.quiet/c.path.length,.98,1)||!Number.isInteger(c.maxGap)||!range(c.maxGap,0,4)||c.bright!==0)return false;
      if(c.path.some((x,j)=>!Number.isInteger(x)||Math.abs(x-(r.x+r.m*(band.top+j-r.mid)))>3.500001||j&&Math.abs(x-c.path[j-1])>1))return false;
    }
    const mask=new Uint8Array(w*h);let pixels=0;
    for(let y=band.top;y<=band.bottom;y++){
      const j=y-band.top,L=pr.index?pr.paths[pr.index-1].path[j]+1:band.x0,R=pr.index<pr.count-1?pr.paths[pr.index].path[j]:band.x1;
      for(let x=L;x<=R;x++)if(y<=band.ends[x-band.x0]){mask[y*w+x]=1;pixels++;}
    }
    const q=columnMaskContour(mask,w,h),sh=columnShape(q,w,h);if(!sh||JSON.stringify(q)!==JSON.stringify(pr.q)||pixels!==pr.content?.pixels||sh.area!==pixels)return false;
    const st=pr.content;if(!range(st.mean,20,215)||!range(st.variance,500,16257)||!Number.isInteger(st.dark)||!Number.isInteger(st.light)||!range(st.dark/pixels,.06,.94)||!range(st.light/pixels,.025,.90)||st.dark+st.light>pixels)return false;
    const b=sh.box;if(JSON.stringify(p._outline)!==JSON.stringify(q.map(([x,y])=>({x:x/w,y:y/h}))))return false;
    return ['x','y','w','h'].every(k=>finite(p[k]))&&Math.max(Math.abs(p.x-b[0]/w),Math.abs(p.y-b[1]/h),Math.abs(p.w-(b[2]-b[0])/w),Math.abs(p.h-(b[3]-b[1])/h))<1e-10;
  }catch(_){return false;}}
  function columnsRGBA(rgba,w,h,anchor,upper,log){
    if(!(rgba instanceof Uint8Array||rgba instanceof Uint8ClampedArray)||!Number.isInteger(w)||!Number.isInteger(h)||!range(w,250,900)||!range(h,350,900)||rgba.length!==w*h*4||!validAdjacentPanel(anchor)||!upper||!['x','y','w','h'].every(k=>finite(upper[k])))return [];
    const m=matte(rgba,w,h);if(!m||anchor._terminalProof.analysisWidth!==w||anchor._terminalProof.analysisHeight!==h)return [];
    const reproved=adjacentRGBA(rgba,w,h,anchor._terminalProof.anchor);
    if(reproved.length!==1||JSON.stringify(reproved[0]._terminalProof)!==JSON.stringify(anchor._terminalProof)){log?.('column bank: stale/mismatched lower anchor');return [];}
    const band=columnBand(m.gray,w,h,m.base,anchor,upper,log);if(!band){log?.('column bank: no enclosing corridors');return [];}
    const seams=[14,18].map(d=>columnSeams(m.gray,w,h,m.base,band,d));log?.('column seams '+JSON.stringify(seams));
    if(seams.some(rs=>!rs)||seams[0].length!==seams[1].length||seams[0].some((r,i)=>Math.abs(r.x-seams[1][i].x)>2||Math.abs(r.m-seams[1][i].m)>.006000001))return [];
    const paths=seams[0].map(r=>columnPath(m.gray,w,h,m.base,band,r));if(paths.some(p=>!p)){log?.('column bank: interrupted/bright corridor');return [];}
    const out=[],count=paths.length+1;
    for(let index=0;index<count;index++){
      const mask=new Uint8Array(w*h);let pixels=0,sum=0,square=0,dark=0,light=0;
      for(let y=band.top;y<=band.bottom;y++){
        const j=y-band.top,L=index?paths[index-1].path[j]+1:band.x0,R=index<count-1?paths[index].path[j]:band.x1;
        for(let x=L;x<=R;x++)if(y<=band.ends[x-band.x0]){const i=y*w+x,g=m.gray[i];mask[i]=1;pixels++;sum+=g;square+=g*g;dark+=g<65;light+=g>140;}
      }
      const q=columnMaskContour(mask,w,h),sh=columnShape(q,w,h);if(!sh){log?.('column bank: shape '+index);return [];}
      if(inkDivider(rgba,w,h,q)||wideUniformVeto(rgba,m.gray,w,h,q)||columnInkVeto(rgba,m.gray,w,h,q)){log?.('column bank: internal divider '+index);return [];}
      const b=sh.box,box=[Math.ceil(b[0])+7,Math.ceil(b[1])+7,Math.floor(b[2])-7,Math.floor(b[3])-7];
      if(typeof PanelClosedFrames==='undefined'||PanelClosedFrames.analyzeRGBA(rgba,w,h,null,{gradientOnly:true,localMatteInset:true,vetoCandidates:[{box}]}).length!==1){log?.('column bank: inset '+index);return [];}
      // No white foreground (speech or lettering) may cross the measured seam.
      // Bright path pixels were independently rejected by columnPath above.
      const mean=sum/pixels,pr={version:4,method:COLUMN_METHOD,analysisWidth:w,analysisHeight:h,base:m.base,color:m.color,anchor:JSON.parse(JSON.stringify(anchor)),upper:{...upper},band,seams,paths,index,count,q,content:{pixels,mean,variance:square/pixels-mean*mean,dark,light},dividerVetoPassed:true,insetVetoPassed:true,uniformVetoPassed:true,whiteCrossingVetoPassed:true};
      const p={x:b[0]/w,y:b[1]/h,w:(b[2]-b[0])/w,h:(b[3]-b[1])/h,_identitySource:'terminal-rim-frame',_geometryOwner:'terminal-rim-outline',_geometryType:'shared-matte-column-outline',_outline:q.map(([x,y])=>({x:x/w,y:y/h})),_terminalProof:pr};
      if(!validColumnPanel(p)){log?.('column bank: invalid proof '+index);return [];}out.push(p);
    }
    log?.('column bank: '+out.length+' separately proved neighbors');return out;
  }
  function refineColumnsImage(img,identities,baseline,log){
    if(!img||!finite(img.width)||!finite(img.height)||img.width<1||img.height<1||!Array.isArray(identities)||!Array.isArray(baseline))return [];
    const anchors=identities.filter(p=>p?._terminalProof?.version===3&&validAdjacentPanel(p)),parents=baseline.filter(wideParent);
    if(anchors.length!==1||parents.length!==1)return [];
    const parent=parents[0],anchor=anchors[0],uppers=baseline.filter(p=>p!==parent&&!p._identitySource&&['x','y','w','h'].every(k=>finite(p[k]))&&p.w>.8&&p.h>.1&&p.h<.30&&p.y+p.h<parent.y+.02);
    if(uppers.length!==1)return [];
    try{const s=Math.min(1,900/Math.max(img.width,img.height)),w=Math.round(img.width*s),h=Math.round(img.height*s),c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d',{willReadFrequently:true});if(!g)return [];g.drawImage(img,0,0,w,h);
      const found=columnsRGBA(g.getImageData(0,0,w,h).data,w,h,anchor,uppers[0],log);
      // All new geometry is above the accepted strip; accepted identities and
      // unclassified fallbacks retain exact values and relative priority.
      const overlap=(a,b)=>Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y));
      if(identities.some(p=>p._identitySource&&p!==anchor&&found.some(c=>overlap(c,p)>.00001)))return [];
      return found;
    }catch(e){log?.('column bank withheld: '+e.message);return [];}
  }

  return {analyzeImage,analyzeRGBA,validPanel,wideRGBA,refineWideImage,adjacentRGBA,refineAdjacentImage,columnsRGBA,refineColumnsImage};
})();
