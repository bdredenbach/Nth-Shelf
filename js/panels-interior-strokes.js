/* A short ink stroke wholly inside an independently enclosed scene cannot
 * establish a boundary across that scene. Keep all retained paper/divider
 * checks, boundary-reaching ink runs, and independently enclosed inset vetoes.
 * Existing owners always retain their descriptors and pixel ownership. */
const PanelInteriorStrokes=(()=>{
 'use strict';
 const VERSION=36,METHOD='boundary-proven-cell-with-interior-strokes',cache=new WeakMap();
 const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),E=()=>PanelLocalBoundaryConsensus.pixelEvidence,C=()=>PanelContextCells.contentEvidence;
 const raster=(p,w,h)=>PanelLocalBoundaryConsensus.raster(p,w,h);
 function freeze(v){if(v&&typeof v==='object'&&!Object.isFrozen(v)){for(const x of Object.values(v))freeze(x);Object.freeze(v);}return v;}
 function dataOK(w,h){return Number.isInteger(w)&&Number.isInteger(h)&&w>=250&&h>=350&&w<=900&&h<=900&&h>=w*1.15;}
 function sourceValid(p,r,w,h){
  const v=p?._structuralGridProof,b=v?.seed?.box;if(!v)return false;
  const copy={...p,_structuralGridProof:{...v,count:Math.max(3,v.count)}};delete copy._structuralGridProof.seedRadius;
  return PanelRaggedGutters.validPanel(copy)&&v.version===18&&v.method==='exterior-color-field-ragged-cells'&&v.palette.paper===(Math.min(...v.palette.colors[0])>220)&&v.seedRadius===r&&v.analysisWidth===w&&v.analysisHeight===h&&Number.isInteger(v.count)&&v.count>=2&&v.count<=24&&Number.isInteger(v.index)&&v.index>=0&&v.index<v.count&&!v.recovery&&p._contours?.length===1&&v.variance>=500&&v.seed.pixels/((b[2]-b[0])*(b[3]-b[1]))>=.40&&p.w*p.h>=.05&&p.w*p.h<=.35&&v.pixels/(p.w*p.h*w*h)>=.72;
 }
 function distanceToOutside(mask,w,h){
  const out=new Uint16Array(mask.length),INF=65535;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x;out[i]=mask[i]?(x===0||y===0||x===w-1||y===h-1?1:INF):0;}
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x;if(x)out[i]=Math.min(out[i],out[i-1]+1);if(y)out[i]=Math.min(out[i],out[i-w]+1);}
  for(let y=h-1;y>=0;y--)for(let x=w-1;x>=0;x--){const i=y*w+x;if(x+1<w)out[i]=Math.min(out[i],out[i+1]+1);if(y+1<h)out[i]=Math.min(out[i],out[i+w]+1);}
  return out;
 }
 function edgesOK(b,paper){return !(b.edges.filter(Boolean).length===2&&b.edges.slice(0,2).some(Boolean)&&b.edges.slice(2).some(Boolean))&&!(!paper&&b.edges.slice(0,2).some(Boolean)&&b.edges.slice(2).some(Boolean));}
 function runsValid(runs,mask,box,w,h){
  if(!Array.isArray(runs)||!runs.length||runs.length>512)return false;
  const distance=distanceToOutside(mask,w,h),[x0,y0,x1,y1]=box;
  return runs.every(r=>{
   if(!r||![0,1].includes(r.axis)||!Number.isInteger(r.offset)||![-.20,-.15,-.10,-.05,0,.05,.10,.15,.20].includes(r.slope))return false;
   const span=r.axis?y1-y0:x1-x0,len=r.axis?x1-x0:y1-y0;
   if(r.span!==span||r.offset<8||r.offset>len-8||!Number.isInteger(r.run)||r.run<Math.max(80,Math.ceil(span*.45))||r.run>=span*.60||!Number.isInteger(r.both)||!Number.isInteger(r.either)||r.both<r.run*.20||r.both>r.either||r.either<r.run*.72||r.either>r.run)return false;
   if(!Array.isArray(r.first)||!Array.isArray(r.last)||r.first.length!==2||r.last.length!==2||[...r.first,...r.last].some(v=>!Number.isInteger(v)))return false;
   const start=r.axis?r.first[1]-y0:r.first[0]-x0,end=r.axis?r.last[1]-y0:r.last[0]-x0,point=t=>r.axis?[x0+Math.round(r.offset+r.slope*(t-span/2)),y0+t]:[x0+t,y0+Math.round(r.offset+r.slope*(t-span/2))];
   if(start<0||end>=span||end-start+1!==r.run||!same(point(start),r.first)||!same(point(end),r.last))return false;
   const ds=[r.first,r.last].map(([x,y])=>x>=0&&x<w&&y>=0&&y<h&&mask[y*w+x]?distance[y*w+x]:0);
   return ds.every(v=>v>8)&&same(r.distances,ds);
  });
 }
 function validPanel(p){
  const v=p?._structuralGridProof,c=v&&cache.get(v);
  if(c&&p._contours===c.contours)return p._identitySource==='structural-grid-frame'&&p._geometryOwner==='structural-grid-contours'&&p._geometryType==='interior-stroke-enclosed-cell'&&!p._quad&&!p._outline&&same([p.x,p.y,p.w,p.h],c.box);
  try{
   const w=v?.analysisWidth,h=v?.analysisHeight;
   if(v?.version!==VERSION||v.method!==METHOD||!dataOK(w,h)||v.connected!==true||v.originalOwnerOverlap!==0||v.originalDivider!==true||v.internalDivider!==false||v.enclosedInset!==false||!same(v.insetChecks,['narrow-ink','chromatic-rims'])||!same(v.radii,[4,6])||p._identitySource!=='structural-grid-frame'||p._geometryOwner!=='structural-grid-contours'||p._geometryType!=='interior-stroke-enclosed-cell'||p._quad||p._outline||!sourceValid(v.first,4,w,h)||!sourceValid(v.second,6,w,h)||v.first._structuralGridProof.palette.paper!==v.second._structuralGridProof.palette.paper)return false;
   const c=E().consensus(v.first,v.second,w,h);if(!c||c.difference!==v.difference||c.union!==v.union)return false;
   const g=E().extent(c.mask,w,h),rings=PanelMatteCells.tracePixelContours(c.mask,w,h,1);
   if(rings?.length!==1||g.pixels!==v.pixels||!same(g.box,v.box)||!same(rings,v.pixelContours)||!C().signatureValid(v.content,g.pixels)||!runsValid(v.interiorInkRuns,c.mask,g.box,w,h)||!E().boundaryValid(v.boundary)||!edgesOK(v.boundary,v.first._structuralGridProof.palette.paper))return false;
   const zero=new Uint8Array(w*h),front=E().boundary(c.mask,new Uint8ClampedArray(w*h*4),{near:zero,nearExterior:zero},w,h);
   if(!same(v.boundary.samples,front.samples)||!same(v.boundary.edges,front.edges))return false;
   const [x0,y0,x1,y1]=g.box;return same([p.x,p.y,p.w,p.h],[x0/w,y0/h,(x1-x0)/w,(y1-y0)/h])&&same(p._contours,rings.map(q=>q.map(([x,y])=>({x:x/w,y:y/h}))));
  }catch(_){return false;}
 }
 function analyzeRGBA(rgba,w,h,prior=[],log,audit){
  const report={sources:0,stable:0,interiorStrokes:0,insets:0,accepted:0},done=out=>{audit?.(report);return out;};
  if(!dataOK(w,h)||rgba?.length!==w*h*4||!Array.isArray(prior)||prior.length>24||prior.some(p=>!p||!['x','y','w','h'].every(k=>Number.isFinite(p[k]))||p.x<0||p.y<0||p.w<=0||p.h<=0||p.x+p.w>1.000001||p.y+p.h>1.000001))return done([]);
  const occupied=new Uint8Array(w*h);for(const p of prior){const m=raster(p,w,h);for(let i=0;i<m.length;i++)occupied[i]|=m[i];}
  let colored=0;for(let i=0;i<occupied.length;i++){if(rgba[4*i+3]!==255)return done([]);colored+=!occupied[i]&&Math.max(rgba[4*i],rgba[4*i+1],rgba[4*i+2])-Math.min(rgba[4*i],rgba[4*i+1],rgba[4*i+2])>24;}
  if(colored<w*h*.003)return done([]);
  const first=PanelRaggedGutters.analyzeCooperativeRGBA(rgba,w,h,4);if(!first.length)return done([]);
  const second=PanelRaggedGutters.analyzeCooperativeRGBA(rgba,w,h,6),out=[];let insetMasks;
  function enclosedInset(mask){
   if(!insetMasks){
    const candidates=[...PanelNarrowInkFrames.analyzeRGBA(rgba,w,h,[]),...PanelColoredRims.analyzeRGBA(rgba,w,h)];
    insetMasks=candidates.map(p=>raster(p,w,h));
   }
   return insetMasks.some(m=>{let n=0,hit=0;for(let i=0;i<m.length;i++)if(m[i]){n++;hit+=mask[i];}return n&&hit/n>.95;});
  }
  for(const b of second){
   if(!sourceValid(b,6,w,h))continue;report.sources++;
   const matches=first.filter(a=>sourceValid(a,4,w,h)&&Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y),Math.abs(a.w-b.w),Math.abs(a.h-b.h))<.01).map(a=>({a,c:E().consensus(a,b,w,h)})).filter(x=>x.c);if(matches.length!==1)continue;
   const {a,c}=matches[0],mask=c.mask;if(mask.some((v,i)=>v&&occupied[i]))continue;report.stable++;
   const g=E().extent(mask,w,h),content=C().signature(mask,rgba);if(!C().signatureValid(content,g.pixels))continue;
   const P=E().paper(rgba,w,h,a._structuralGridProof.palette),boundary=E().boundary(mask,rgba,P,w,h);
   if(!E().boundaryValid(boundary)||!edgesOK(boundary,a._structuralGridProof.palette.paper)||!E().internalDivider(mask,rgba,P,w,h))continue;
   const policy={distance:distanceToOutside(mask,w,h),ignored:[]};
   if(E().internalDivider(mask,rgba,P,w,h,policy)||!policy.ignored.length||policy.ignored.length>512)continue;report.interiorStrokes++;
   if(enclosedInset(mask)){report.insets++;continue;}
   const rings=PanelMatteCells.tracePixelContours(mask,w,h,1);if(rings?.length!==1)continue;
   const v={version:VERSION,method:METHOD,connected:true,analysisWidth:w,analysisHeight:h,radii:[4,6],first:a,second:b,difference:c.difference,union:c.union,pixels:g.pixels,box:g.box,pixelContours:rings,boundary,content,originalOwnerOverlap:0,originalDivider:true,internalDivider:false,enclosedInset:false,insetChecks:['narrow-ink','chromatic-rims'],interiorInkRuns:policy.ignored};
   const [x0,y0,x1,y1]=g.box,p={x:x0/w,y:y0/h,w:(x1-x0)/w,h:(y1-y0)/h,_identitySource:'structural-grid-frame',_geometryOwner:'structural-grid-contours',_geometryType:'interior-stroke-enclosed-cell',_contours:rings.map(q=>q.map(([x,y])=>({x:x/w,y:y/h}))),_structuralGridProof:v};
   if(!validPanel(p))continue;freeze(v);freeze(p._contours);cache.set(v,{contours:p._contours,box:[p.x,p.y,p.w,p.h]});out.push(p);for(let i=0;i<mask.length;i++)occupied[i]|=mask[i];
  }
  report.accepted=out.length;if(out.length)log?.('interior strokes: '+out.length+' independently enclosed additions');return done(out);
 }
 function supplementImage(img,prior,log){
  const W=img.naturalWidth||img.width,H=img.naturalHeight||img.height;if(!W||!H||W*H>24000000)return[];let c;
  try{c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d',{willReadFrequently:true});if(!g)return[];g.drawImage(img,0,0);const scale=Math.min(1,900/Math.max(W,H)),w=Math.round(W*scale),h=Math.round(H*scale);return analyzeRGBA(PanelMatteCells.sampleBilinearRGBA(g.getImageData(0,0,W,H).data,W,H,w,h),w,h,prior,log);}finally{if(c)c.width=c.height=1;}
 }
 function bind(){
  if(typeof PanelStructuralGrid!=='undefined'&&!PanelStructuralGrid._interiorStrokes){const old=PanelStructuralGrid.validPanel;PanelStructuralGrid.validPanel=p=>p?._structuralGridProof?.version===VERSION?validPanel(p):old(p);PanelStructuralGrid._interiorStrokes=true;}
  if(typeof PanelGeometry!=='undefined'&&!PanelGeometry._interiorStrokes){const old=PanelGeometry.refine;PanelGeometry.refine=async function(url,p,log){return validPanel(p)?{...p}:old.call(this,url,p,log);};PanelGeometry._interiorStrokes=true;}
  if(typeof PanelEdgeSpill!=='undefined'&&!PanelEdgeSpill._interiorStrokes){for(const name of['analyzeImage','analyzeRGBA']){const old=PanelEdgeSpill[name];if(typeof old==='function')PanelEdgeSpill[name]=function(...args){return validPanel(args[name==='analyzeImage'?1:3])?null:old.apply(this,args);};}PanelEdgeSpill._interiorStrokes=true;}
 }
 function install(detector){bind();if(!detector||detector._interiorStrokes)return;const old=detector.detect;detector.detect=async function(url,log){const prior=await old.call(this,url,log);try{const img=new Image();img.src=url;await img.decode();const add=supplementImage(img,prior,log);return add.length?prior.concat(add):prior;}catch(e){log?.('interior strokes deferred: '+e.message);return prior;}};detector._interiorStrokes=true;}
 return{analyzeRGBA,supplementImage,validPanel,install,distanceToOutside};
})();
if(typeof PanelDetect!=='undefined')PanelInteriorStrokes.install(PanelDetect);
if(typeof module!=='undefined')module.exports=PanelInteriorStrokes;
