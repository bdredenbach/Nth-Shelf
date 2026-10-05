/* Nth Shelf Frame Test 17 — independent corner rims beside a proved edge cell.
 * Dark JPEG ink can be chromatically different from the exterior matte. Use
 * two fixed luminance offsets to PROPOSE a corner cell, then require four
 * independently observed straight rims in the original pixels. The luminance
 * flood is not a crop: outlines come from witnessed enclosing rims. No tap,
 * page index, image fingerprint or saved crop supplies geometry. The existing
 * sloping-edge anchor is re-proved and is never replaced or reordered.
 */
const PanelCornerFrames = (() => {
  'use strict';
  const METHOD='dual-luminance-corner-with-four-observed-rims';
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
  function cells(gray,w,h,threshold){
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
      if(!range(A/(w*h),.055,.23)||!range(bw/w,.22,.62)||!range(bh/h,.13,.40)||n/A<.77||Math.min(x0,w-1-x1)>w*.075||Math.min(y0,h-1-y1)>h*.075)continue;
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
    log?.('corner rail '+(v?'v':'h')+side+' '+JSON.stringify(best));return best;
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
    const pr=p?._cornerProof,w=pr?.analysisWidth,h=pr?.analysisHeight;
    if(p?._identitySource!=='corner-rim-frame'||pr?.version!==1||pr.method!==METHOD||!Number.isInteger(w)||!Number.isInteger(h)||!range(w,250,900)||!range(h,350,900)||!Array.isArray(pr.rails)||pr.rails.length!==4||!Array.isArray(pr.cells)||pr.cells.length!==2)return false;
    if(typeof PanelEdgeCells==='undefined'||!PanelEdgeCells.validPanel(pr.anchor)||pr.anchor._edgeCellProof.analysisWidth!==w||pr.anchor._edgeCellProof.analysisHeight!==h||pr.dividerVetoPassed!==true||pr.insetVetoPassed!==true||pr.uniformInkVetoPassed!==true)return false;
    if(!Array.isArray(pr.color)||pr.color.length!==3||pr.color.some(n=>!Number.isInteger(n)||!range(n,0,255)))return false;
    const base=.299*pr.color[0]+.587*pr.color[1]+.114*pr.color[2];if(!range(base,0,25)||pr.base!==base)return false;
    if(!Array.isArray(pr.fractions)||pr.fractions.length!==4||pr.fractions.some(n=>!range(n,.8,1)))return false;
    for(let i=0;i<2;i++){const c=pr.cells[i];if(!Array.isArray(c?.box)||c.box.length!==4||c.box.some(n=>!Number.isInteger(n))||c.threshold!==base+[6,8][i]||!Number.isInteger(c.pixels))return false;const [x,y,X,Y]=c.box,A=(X-x+1)*(Y-y+1);if(x<1||y<1||X>=w-1||Y>=h-1||!range(A/(w*h),.055,.23)||!range((X-x+1)/w,.22,.62)||!range((Y-y+1)/h,.13,.40)||!range(c.pixels/A,.77,1))return false;}
    const [a,b]=pr.cells;
    if(a.box.some((v,i)=>Math.abs(v-b.box[i])>2)||b.pixels>a.pixels||(a.pixels-b.pixels)/a.pixels>.04||!Array.isArray(pr.retained)||pr.retained.length!==2||pr.retained[0]!==a.pixels||pr.retained[1]!==b.pixels)return false;
    for(const c of pr.cells)if(Math.min(c.box[0],w-1-c.box[2])>w*.075||Math.min(c.box[1],h-1-c.box[3])>h*.075)return false;
    for(let i=0;i<4;i++){
      const r=pr.rails[i];if(!r||r.v!==(i>=2)||r.side!==i%2||!range(r.m,-.04,.04)||!finite(r.b)||!Number.isInteger(r.lo)||!Number.isInteger(r.hi)||r.hi-r.lo<60||r.total!==r.hi-r.lo+1)return false;
      const j=r.v?1:0,k=1-j,p0=a.box[k+(r.side?2:0)],dir=r.side?1:-1;
      if(r.lo!==a.box[j]+5||r.hi!==a.box[j+2]-5||!Number.isInteger(r.offset)||!range(r.offset,-3,10)||!range(r.enclosureShift,0,1)||Math.abs(r.m/.002-Math.round(r.m/.002))>1e-8||Math.abs(r.b-(p0+dir*r.offset-r.m*(r.lo+r.hi)/2+dir*r.enclosureShift))>1e-8||r.exterior!==((r.side?(r.v?w:h)-1-p0:p0)<(r.v?w:h)*.075))return false;
      for(const k of ['matched','core','inward','outward','opposite','lost','extent','maxGap'])if(!Number.isInteger(r[k]))return false;
      if(r.extent!==r.total||!range(r.outward,0,r.total)||!range(r.opposite,0,r.total)||!range(r.matched/r.total,.99,1)||!range(r.core/r.total,.90,1)||!range(r.inward/r.total,.42,1)||(r.exterior?!range(r.outward/r.total,.78,1):!range(r.opposite/r.total,.42,1)||!range(r.core/r.total,.95,1))||!range(r.maxGap,0,2)||!range(r.lost,0,r.extent*.01))return false;
      if(!Array.isArray(r.quarters)||r.quarters.length!==4||r.quarters.some((q,i)=>q.samples!==Math.ceil((i+1)*r.total/4)-Math.ceil(i*r.total/4)||!Number.isInteger(q.samples)||!Number.isInteger(q.matched)||q.samples<1||!range(q.matched/q.samples,.96,1))||r.quarters.reduce((s,q)=>s+q.samples,0)!==r.total||r.quarters.reduce((s,q)=>s+q.matched,0)!==r.matched)return false;
    }
    const q=quad(pr.rails),box=bounds(q),A=area(q);if(!range(A/(w*h),.055,.24)||q.some(a=>!range(a[0],1,w-1)||!range(a[1],1,h-1))||q.some((a,i)=>cross(a,q[(i+1)%4],q[(i+2)%4])<=0))return false;
    const anchor=pr.anchor;if(Math.max(0,Math.min(box[2]/w,anchor.x+anchor.w)-Math.max(box[0]/w,anchor.x))*Math.max(0,Math.min(box[3]/h,anchor.y+anchor.h)-Math.max(box[1]/h,anchor.y))>1e-8)return false;
    if(!Array.isArray(p._outline)||p._outline.length!==4||p._outline.some((v,i)=>!range(v?.x,0,1)||!range(v?.y,0,1)||Math.abs(v.x-q[i][0]/w)>1e-9||Math.abs(v.y-q[i][1]/h)>1e-9))return false;
    return ['x','y','w','h'].every(k=>finite(p[k]))&&Math.max(Math.abs(p.x-box[0]/w),Math.abs(p.y-box[1]/h),Math.abs(p.w-(box[2]-box[0])/w),Math.abs(p.h-(box[3]-box[1])/h))<1e-9;
  }
  function supplementRGBA(rgba,w,h,anchors,log){
    if(!Number.isInteger(w)||!Number.isInteger(h)||!range(w,250,900)||!range(h,350,900)||!(rgba instanceof Uint8Array||rgba instanceof Uint8ClampedArray)||rgba.length!==w*h*4||!Array.isArray(anchors)||anchors.length!==1||typeof PanelEdgeCells==='undefined'||!PanelEdgeCells.validPanel(anchors[0]))return [];
    const fresh=PanelEdgeCells.analyzeRGBA(rgba,w,h);if(fresh.length!==1||JSON.stringify(fresh[0])!==JSON.stringify(anchors[0]))return [];
    const m=matte(rgba,w,h);if(!m)return [];const sets=[6,8].map(d=>cells(m.gray,w,h,m.base+d));if(sets.some(s=>!s.length))return [];const out=[];
    for(const a of sets[0]){
      const pair=sets[1].filter(b=>a.box.every((v,i)=>Math.abs(v-b.box[i])<=2)&&Math.abs(a.pixels-b.pixels)/a.pixels<=.04);if(pair.length!==1)continue;const b=pair[0];log?.('corner cell '+JSON.stringify(a.box));
      const rs=[];for(const v of [false,true])for(const side of [0,1]){const r=rail(a,v,side,m.gray,w,h,m.base,log);if(r)rs.push(r);}
      if(rs.length!==4)continue;const q=quad(rs),box=bounds(q),A=area(q);if(A<w*h*.055||A>w*h*.24||q.some(p=>p[0]<1||p[1]<1||p[0]>w-1||p[1]>h-1))continue;
      const anchor=anchors[0];if(Math.max(0,Math.min(box[2]/w,anchor.x+anchor.w)-Math.max(box[0]/w,anchor.x))*Math.max(0,Math.min(box[3]/h,anchor.y+anchor.h)-Math.max(box[1]/h,anchor.y))>1e-8)continue;
      if(inkDivider(rgba,w,h,q)){log?.('corner veto: interrupted uniform-ink divider');continue;}
      const check={box:[Math.ceil(Math.max(q[0][0],q[3][0]))+4,Math.ceil(Math.max(q[0][1],q[1][1]))+4,Math.floor(Math.min(q[1][0],q[2][0]))-4,Math.floor(Math.min(q[2][1],q[3][1]))-4]};
      if(typeof PanelClosedFrames==='undefined'||PanelClosedFrames.analyzeRGBA(rgba,w,h,null,{gradientOnly:true,localMatteInset:true,vetoCandidates:[check]}).length!==1){log?.('corner veto: internal divider/inset');continue;}
      const retained=[a,b].map(c=>{let n=0;for(let y=c.box[1];y<=c.box[3];y++)for(let x=c.box[0];x<=c.box[2];x++)if(c.labels[y*w+x]===c.id&&inside(q,x,y))n++;return n;});
      if(retained[0]!==a.pixels||retained[1]!==b.pixels){log?.('corner veto: component loss');continue;}
      const pr={version:1,method:METHOD,analysisWidth:w,analysisHeight:h,anchor,color:m.color,base:m.base,fractions:m.fractions,retained,cells:[a,b].map(c=>({box:c.box,pixels:c.pixels,threshold:c.threshold})),rails:rs,dividerVetoPassed:true,insetVetoPassed:true,uniformInkVetoPassed:true};
      const p={x:box[0]/w,y:box[1]/h,w:(box[2]-box[0])/w,h:(box[3]-box[1])/h,_outline:q.map(p=>({x:p[0]/w,y:p[1]/h})),_identitySource:'corner-rim-frame',_geometryOwner:'corner-rim-outline',_geometryType:'four-observed-dark-rims',_cornerProof:pr};
      if(validPanel(p))out.push(p);else log?.('corner validation failed');
    }
    log?.('corner rims: '+out.length+' separately enclosed corner scenes');return out.length<=2?out:[];
  }
  function supplementImage(img,anchors,log){if(!Array.isArray(anchors)||anchors.length!==1||typeof PanelEdgeCells==='undefined'||!PanelEdgeCells.validPanel(anchors[0]))return [];if(!img||!finite(img.width)||!finite(img.height)||img.width<1||img.height<1)return [];const s=Math.min(1,900/Math.max(img.width,img.height)),w=Math.round(img.width*s),h=Math.round(img.height*s),c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(img,0,0,w,h);return supplementRGBA(x.getImageData(0,0,w,h).data,w,h,anchors,log);}
  return {supplementImage,supplementRGBA,validPanel};
})();
