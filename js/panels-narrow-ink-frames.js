/* Test77: independently measured narrow black inset rails.
 * Append-only supplement. Four continuous thin rails must close a textured
 * cell. Broad dark fields, open borders, internal dividers and prior ownership
 * conflicts are rejected. No page identity or saved target coordinates.
 */
const PanelNarrowInkFrames=(()=>{
 'use strict';
 const VERSION=33,METHOD='four-narrow-ink-rails',same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 const range=(x,a,b)=>Number.isFinite(x)&&x>=a&&x<=b;
 function raster(p,w,h){const out=new Uint8Array(w*h),qs=p._contours||[p._outline||p._quad||[{x:p.x,y:p.y},{x:p.x+p.w,y:p.y},{x:p.x+p.w,y:p.y+p.h},{x:p.x,y:p.y+p.h}]];for(let y=0;y<h;y++){const Y=(y+.5)/h,xs=[];for(const q of qs)for(let j=0;j<q.length;j++){const a=q[j],b=q[(j+1)%q.length];if((a.y>Y)!==(b.y>Y))xs.push((a.x+(Y-a.y)*(b.x-a.x)/(b.y-a.y))*w);}xs.sort((a,b)=>a-b);for(let j=0;j+1<xs.length;j+=2)for(let x=Math.max(0,Math.ceil(xs[j]-.5));x<Math.min(w,Math.ceil(xs[j+1]-.5));x++)out[y*w+x]=1;}return out;}
 function rail(L,w,h,pos,lo,hi,vertical,keep=false){const at=(p,t)=>vertical?t*w+p:p*w+t,values=[];let dark=0,narrow=0;for(let t=lo+4;t<hi-4;t++){let ink=255,a=0,b=0;for(let d=-1;d<=1;d++)ink=Math.min(ink,L[at(pos+d,t)]);for(let d=4;d<=8;d++){a=Math.max(a,L[at(pos-d,t)]);b=Math.max(b,L[at(pos+d,t)]);}dark+=ink<65;narrow+=a>ink+18&&b>ink+18;if(keep)values.push([ink,a,b]);}const samples=Math.max(0,hi-lo-8);return{samples,dark,narrow,...(keep?{values}:{})};}
 function lines(L,w,h,vertical){const P=vertical?w:h,T=vertical?h:w,at=(p,t)=>vertical?t*w+p:p*w+t,minlen=Math.max(48,Math.round(T*(vertical?.10:.16))),runs=[],groups=[];
  for(let p=8;p<P-8;p++){let start=-1;for(let t=0;t<=T;t++){const yes=t<T&&Math.min(L[at(p-1,t)],L[at(p,t)],L[at(p+1,t)])<65;if(yes&&start<0)start=t;if(!yes&&start>=0){if(t-start>=minlen){const r=rail(L,w,h,p,start,t,vertical);if(r.narrow/r.samples>=.35)runs.push({pos:p,lo:start,hi:t,score:r.narrow/r.samples});}start=-1;}}}
  for(const r of runs){const g=groups.slice(-100).find(g=>r.pos-g.at(-1).pos<=2&&Math.abs(r.lo-g.at(-1).lo)<=8&&Math.abs(r.hi-g.at(-1).hi)<=8);if(g)g.push(r);else groups.push([r]);}
  return groups.filter(g=>g.at(-1).pos-g[0].pos<=12).map(g=>g.reduce((a,b)=>a.score>=b.score?a:b)).sort((a,b)=>a.pos-b.pos);
 }
 function dataOK(w,h,a){return Number.isInteger(w)&&Number.isInteger(h)&&w>=250&&h>=350&&w<=900&&h<=900&&a?.length===w*h*4;}
 function boundaries(L,w,h,b){
  const [xl,yt,xr,yb]=b,outer=[xl-5,yt-5,xr+6,yb+6],sides=[];
  for(let k=0;k<4;k++){
   const v=k>=2,pos=[yt,yb,xl,xr][k],dir=k%2?1:-1,lo=v?outer[1]:outer[0],hi=v?outer[3]:outer[2],at=(p,t)=>v?t*w+p:p*w+t;
   const runs=[];
   for(let t=lo;t<hi;t++){
    const found=[];let start=null;
    for(let y=pos-6;y<=pos+7;y++){
     const dark=y<=pos+6&&L[at(y,t)]<65;
     if(dark&&start===null)start=y;
     if(!dark&&start!==null){if(y-start>=1&&y-start<=8&&start>pos-6&&y<pos+7)found.push([start,y]);start=null;}
    }runs.push(found);
   }
   // A single fitted rail disambiguates a real border from a neighboring
   // parallel stroke. Only local image-measured dark bands can support it.
   let intercept=pos,slope=0,best=null;
   for(let offset=-5;offset<=5;offset+=.25)for(let tilt=-.04;tilt<=.04001;tilt+=.002){
    let hits=0,n=0;
    for(let j=6;j<runs.length-6;j++){n++;const y=Math.round(pos+offset+tilt*(j-(runs.length-1)/2)),t=lo+j;hits+=Math.min(L[at(y-1,t)],L[at(y,t)],L[at(y+1,t)])<65;}
    if(n&&hits/n>=.98){const inner=dir*(pos+offset);if(!best||inner<best.inner-1e-8||Math.abs(inner-best.inner)<1e-8&&Math.abs(tilt)<Math.abs(best.tilt))best={inner,offset,tilt};}
   }
   if(best){intercept=pos+best.offset;slope=best.tilt;}
   const vals=[];
   for(let j=0;j<runs.length;j++){
    const pred=intercept+slope*(j-(runs.length-1)/2),choices=runs[j].filter(r=>Math.abs((r[0]+r[1]-1)/2-pred)<=1.6);
    choices.sort((a,b)=>Math.abs((a[0]+a[1]-1)/2-pred)-Math.abs((b[0]+b[1]-1)/2-pred));
    let edge;
    if(choices.length)edge=choices[0][dir>0?1:0];else edge=Math.round(pred)+(dir>0?1:0);
    vals.push(Math.max(pos-5,Math.min(pos+5,edge)));
   }sides.push(vals);
  }return {outer,sides};
 }
 function boundaryMask(e,w,h,b){
  if(!e||!same(e.outer,[b[0]-5,b[1]-5,b[2]+6,b[3]+6])||!Array.isArray(e.sides)||e.sides.length!==4)return null;
  const [x0,y0,x1,y1]=e.outer;
  for(let k=0;k<4;k++){const ar=e.sides[k],pos=[b[1],b[3],b[0],b[2]][k];if(!Array.isArray(ar)||ar.length!==(k<2?x1-x0:y1-y0)||ar.some(v=>!Number.isInteger(v)||Math.abs(v-pos)>5))return null;}
  let m=new Uint8Array(w*h);
  for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)if(y>=e.sides[0][x-x0]&&y<e.sides[1][x-x0]&&x>=e.sides[2][y-y0]&&x<e.sides[3][y-y0])m[y*w+x]=1;
  // Stay one analysis pixel inside the measured black rim. This avoids
  // including neighboring colour through antialiased/downsampled edge pixels.
  // This route admits only nearly continuous ink rails, never balloon crossings.
  const interior=new Uint8Array(m.length);for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){const i=y*w+x;if(m[i]&&m[i-1]&&m[i+1]&&m[i-w]&&m[i+w])interior[i]=1;}m=interior;
  // Intersecting side traces can leave isolated corner specks. Keep one
  // connected rim/body only, rejecting any substantial detached region.
  const seen=new Uint8Array(m.length),queue=new Int32Array(m.length);let main=[],total=0;
  for(let seed=0;seed<m.length;seed++)if(m[seed]&&!seen[seed]){let n=1,head=0;queue[0]=seed;seen[seed]=1;while(head<n){const i=queue[head++],x=i%w,y=(i/w)|0;for(const j of[x?i-1:-1,x+1<w?i+1:-1,y?i-w:-1,y+1<h?i+w:-1])if(j>=0&&m[j]&&!seen[j]){seen[j]=1;queue[n++]=j;}}total+=n;if(n>main.length)main=queue.slice(0,n);}
  if(!main.length||total-main.length>16)return null;const clean=new Uint8Array(m.length);for(const i of main)clean[i]=1;return clean;
 }
 function description(m,w,h){const rings=PanelMatteCells.tracePixelContours(m,w,h,1);if(!rings||rings.length!==1)return null;const points=rings.flat(),box=[Math.min(...points.map(p=>p[0])),Math.min(...points.map(p=>p[1])),Math.max(...points.map(p=>p[0])),Math.max(...points.map(p=>p[1]))];return {rings,box,pixels:m.reduce((n,v)=>n+v,0)};}
 function validPanel(p){try{const v=p?._structuralGridProof,w=v?.analysisWidth,h=v?.analysisHeight,b=v?.railBox;
  if(p?._identitySource!=='structural-grid-frame'||p._geometryOwner!=='structural-grid-contours'||p._geometryType!=='narrow-ink-inset'||p._quad||p._outline||v?.version!==VERSION||v.method!==METHOD||v.connected!==true||v.originalOwnerOverlap!==0||v.safetyInset!==1||!dataOK(w,h,{length:w*h*4})||typeof PanelMatteCells==='undefined')return false;
  if(!Array.isArray(b)||b.length!==4||b.some((n,i)=>!Number.isInteger(n)||n<10||n>(i%2?h:w)-10)||b[0]>=b[2]||b[1]>=b[3]||!range((b[2]-b[0])*(b[3]-b[1])/(w*h),.025,.23)||(b[2]-b[0])<w*.12||(b[3]-b[1])<h*.08)return false;
  if(!Array.isArray(v.rails)||v.rails.length!==4||!range(v.variance,700,16257)||!range(v.colorFraction,.12,1))return false;
  let strong=0;
  for(let i=0;i<4;i++){const r=v.rails[i],samples=(i<2?b[2]-b[0]:b[3]-b[1])-8;if(r.samples!==samples||!Array.isArray(r.values)||r.values.length!==samples||r.values.some(a=>!Array.isArray(a)||a.length!==3||a.some(x=>!range(x,0,255))))return false;const dark=r.values.filter(([k])=>k<65).length,narrow=r.values.filter(([k,a,z])=>a>k+18&&z>k+18).length;if(r.dark!==dark||r.narrow!==narrow||dark/samples<.98||narrow/samples<.40)return false;strong+=narrow/samples>=.64;}
  if(strong<3)return false;
  const mask=boundaryMask(v.boundaries,w,h,b);if(!mask)return false;const d=description(mask,w,h);if(!d||d.pixels!==v.pixels||!same(d.box,v.box)||!same(d.rings,v.pixelContours)||!same(p._contours,d.rings.map(r=>r.map(([x,y])=>({x:x/w,y:y/h})))))return false;
  const box=d.box;return same([p.x,p.y,p.w,p.h],[box[0]/w,box[1]/h,(box[2]-box[0])/w,(box[3]-box[1])/h]);
 }catch(_){return false;}}
 function analyzeRGBA(rgba,w,h,prior=[],log){
  if(!dataOK(w,h,rgba)||!Array.isArray(prior)||prior.length>24)return[];
  const N=w*h,L=new Float32Array(N),occupied=new Uint8Array(N);for(let i=0;i<N;i++){if(rgba[4*i+3]!==255)return[];L[i]=rgba[4*i]*.299+rgba[4*i+1]*.587+rgba[4*i+2]*.114;}
  for(const p of prior){if(!p||!['x','y','w','h'].every(k=>Number.isFinite(p[k])))return[];const mask=raster(p,w,h);for(let i=0;i<N;i++)occupied[i]|=mask[i];}
  const H=lines(L,w,h,false),V=lines(L,w,h,true),proposals=[];if(H.length>256||V.length>256)return[];
  for(let i=0;i<H.length;i++)for(let j=i+1;j<H.length;j++){
   const t=H[i],b=H[j];if(b.pos-t.pos<h*.08||b.pos-t.pos>h*.5)continue;
   const lo=Math.max(t.lo,b.lo),hi=Math.min(t.hi,b.hi),vs=V.filter(v=>v.pos>=lo-5&&v.pos<=hi+5&&v.lo<=t.pos+5&&v.hi>=b.pos-5);
   for(let u=0;u<vs.length;u++)for(let z=u+1;z<vs.length;z++){
    const l=vs[u],r=vs[z],W=r.pos-l.pos,T=b.pos-t.pos,area=W*T/N;if(W<w*.12||!range(area,.025,.23)||l.pos<10||r.pos>w-10||t.pos<10||b.pos>h-10)continue;
    const box=[l.pos,t.pos,r.pos,b.pos],rr=[rail(L,w,h,t.pos,l.pos,r.pos,false,true),rail(L,w,h,b.pos,l.pos,r.pos,false,true),rail(L,w,h,l.pos,t.pos,b.pos,true,true),rail(L,w,h,r.pos,t.pos,b.pos,true,true)];
    if(rr.some(q=>q.dark/q.samples<.98||q.narrow/q.samples<.40)||rr.filter(q=>q.narrow/q.samples>=.64).length<3)continue;
    // A complete internal rail indicates a composite, not one frame.
    if(H.some(q=>q.pos>t.pos+12&&q.pos<b.pos-12&&q.lo<=l.pos+5&&q.hi>=r.pos-5&&q.score>=.64)||V.some(q=>q.pos>l.pos+12&&q.pos<r.pos-12&&q.lo<=t.pos+5&&q.hi>=b.pos-5&&q.score>=.64))continue;
    let n=0,s=0,sq=0,color=0,overlap=false;for(let y=t.pos-2;y<b.pos+3;y++)for(let x=l.pos-2;x<r.pos+3;x++)if(occupied[y*w+x])overlap=true;if(overlap)continue;
    for(let y=t.pos+7;y<b.pos-7;y++)for(let x=l.pos+7;x<r.pos-7;x++){const i=y*w+x,v=L[i];n++;s+=v;sq+=v*v;color+=Math.max(rgba[i*4],rgba[i*4+1],rgba[i*4+2])-Math.min(rgba[i*4],rgba[i*4+1],rgba[i*4+2])>16;}const variance=sq/n-(s/n)**2;if(variance<700||color/n<.12)continue;
    proposals.push({box,rr,variance,colorFraction:color/n,score:rr.reduce((n,q)=>n+q.narrow/q.samples,0)});
   }
  }
  const unique=[];for(const p of proposals.sort((a,b)=>b.score-a.score)){if(unique.some(q=>q.box.reduce((s,x,i)=>s+Math.abs(x-p.box[i]),0)<20))continue;unique.push(p);}if(unique.length>8)return[];
  const out=[];for(const q of unique){const b=q.box,bound=boundaries(L,w,h,b),m=boundaryMask(bound,w,h,b);if(!m||m.some((v,i)=>v&&occupied[i]))continue;const d=description(m,w,h);if(!d)continue;
   const box=d.box,v={version:VERSION,method:METHOD,connected:true,analysisWidth:w,analysisHeight:h,railBox:b,box,rails:q.rr,variance:q.variance,colorFraction:q.colorFraction,safetyInset:1,originalOwnerOverlap:0,pixelContours:d.rings,pixels:d.pixels,boundaries:bound};const p={x:box[0]/w,y:box[1]/h,w:(box[2]-box[0])/w,h:(box[3]-box[1])/h,_identitySource:'structural-grid-frame',_geometryOwner:'structural-grid-contours',_geometryType:'narrow-ink-inset',_contours:d.rings.map(r=>r.map(([x,y])=>({x:x/w,y:y/h}))),_structuralGridProof:v};if(validPanel(p)){out.push(p);for(let i=0;i<N;i++)occupied[i]|=m[i];}
  }if(out.length)log?.('narrow ink frames: '+out.length+' independently closed insets');return out;
 }

 function supplementImage(img,prior,log){if(typeof PanelMatteCells==='undefined')return[];const W=img.naturalWidth||img.width,H=img.naturalHeight||img.height;if(!W||!H||W*H>24000000)return[];let c;try{c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d',{willReadFrequently:true});if(!g)return[];g.drawImage(img,0,0);const s=Math.min(1,900/Math.max(W,H)),w=Math.round(W*s),h=Math.round(H*s);return analyzeRGBA(PanelMatteCells.sampleBilinearRGBA(g.getImageData(0,0,W,H).data,W,H,w,h),w,h,prior,log);}finally{if(c)c.width=c.height=1;}}
 function bind(){if(typeof PanelStructuralGrid!=='undefined'&&!PanelStructuralGrid._narrowInk){const old=PanelStructuralGrid.validPanel;PanelStructuralGrid.validPanel=p=>p?._structuralGridProof?.version===VERSION?validPanel(p):old(p);PanelStructuralGrid._narrowInk=true;}if(typeof PanelGeometry!=='undefined'&&!PanelGeometry._narrowInk){const old=PanelGeometry.refine;PanelGeometry.refine=async function(url,p,log){return validPanel(p)?{...p}:old.call(this,url,p,log);};PanelGeometry._narrowInk=true;}if(typeof PanelEdgeSpill!=='undefined'&&!PanelEdgeSpill._narrowInk){for(const name of ['analyzeImage','analyzeRGBA']){const old=PanelEdgeSpill[name];if(typeof old==='function')PanelEdgeSpill[name]=function(...args){return validPanel(args[name==='analyzeImage'?1:3])?null:old.apply(this,args);};}PanelEdgeSpill._narrowInk=true;}}
 function install(detector){bind();if(!detector||detector._narrowInk)return;const old=detector.detect;detector.detect=async function(url,log){const prior=await old.call(this,url,log);try{const img=new Image();img.src=url;await img.decode();const out=supplementImage(img,prior,log);return out.length?prior.concat(out):prior;}catch(e){log?.('narrow ink deferred: '+e.message);return prior;}};detector._narrowInk=true;}
 return{analyzeRGBA,supplementImage,validPanel,install,bind};
})();
if(typeof PanelDetect!=='undefined')PanelNarrowInkFrames.install(PanelDetect);
if(typeof module!=='undefined')module.exports=PanelNarrowInkFrames;
