/* Local windows discover cells; only original-page evidence can publish them.
 * Two seed radii and two independently sized windows must agree. Temporary
 * window edges are never accepted as frame boundaries. Prior owners keep
 * their descriptors and pixel ownership. No book, page, or tap lookup. */
const PanelContextCells=(()=>{
 'use strict';
 const VERSION=35,METHOD='context-stable-enclosed-cell',cache=new WeakMap();
 const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 const E=()=>PanelLocalBoundaryConsensus.pixelEvidence;
 const raster=(p,w,h)=>PanelLocalBoundaryConsensus.raster(p,w,h);
 function freeze(v){if(v&&typeof v==='object'&&!Object.isFrozen(v)){for(const x of Object.values(v))freeze(x);Object.freeze(v);}return v;}
 function dataOK(w,h){return Number.isInteger(w)&&Number.isInteger(h)&&w>=250&&h>=350&&w<=900&&h<=900;}
 function sourceValid(p,r,w,h){
  const v=p?._structuralGridProof,b=v?.seed?.box;if(!v)return false;
  // The retained validator checks the source geometry and evidence. The new
  // route owns its single-cell policy instead of changing the old map policy.
  const base={...p,_structuralGridProof:{...v,count:Math.max(3,v.count)}};delete base._structuralGridProof.seedRadius;
  return PanelRaggedGutters.validPanel(base)&&v.version===18&&v.method==='exterior-color-field-ragged-cells'&&v.palette.paper===(Math.min(...v.palette.colors[0])>220)&&v.seedRadius===r&&v.analysisWidth===w&&v.analysisHeight===h&&Number.isInteger(v.count)&&v.count>=1&&v.count<=24&&Number.isInteger(v.index)&&v.index>=0&&v.index<v.count&&!v.recovery&&p._contours?.length===1&&v.variance>=500&&v.seed.pixels/((b[2]-b[0])*(b[3]-b[1]))>=.40&&p.w*p.h>=.025&&p.w*p.h<=.95&&v.pixels/(p.w*p.h*w*h)>=.72;
 }
 function windows(w,h){
  const out=[[0,0,w,h]];
  for(const y of[0,.25,.5])out.push([0,Math.round(y*h),w,Math.round((y+.5)*h)]);
  for(const x of[0,.25,.5])out.push([Math.round(x*w),0,Math.round((x+.5)*w),h]);
  for(const x of[0,1/3])for(const y of[0,1/3])out.push([Math.round(x*w),Math.round(y*h),Math.round((x+2/3)*w),Math.round((y+2/3)*h)]);
  for(const y of[0,1/6,1/3])out.push([0,Math.round(y*h),w,Math.round((y+2/3)*h)]);
  for(const x of[0,1/6,1/3])out.push([Math.round(x*w),0,Math.round((x+2/3)*w),h]);
  return out.filter(([a,b,c,d])=>dataOK(c-a,d-b));
 }
 function expand(roi,w,h){return[Math.max(0,roi[0]-4),Math.max(0,roi[1]-4),Math.min(w,roi[2]+4),Math.min(h,roi[3]+4)];}
 function roiOK(roi,w,h){return Array.isArray(roi)&&roi.length===4&&roi.every(Number.isInteger)&&roi[0]>=0&&roi[1]>=0&&roi[2]<=w&&roi[3]<=h&&dataOK(roi[2]-roi[0],roi[3]-roi[1]);}
 function pageMask(local,roi,w,h){
  const out=new Uint8Array(w*h),[x0,y0,x1,y1]=roi,W=x1-x0;
  for(let y=y0;y<y1;y++)out.set(local.subarray((y-y0)*W,(y-y0+1)*W),y*w+x0);return out;
 }
 function stableMask(a,b){
  let difference=0,union=0;const mask=new Uint8Array(a.length);
  for(let i=0;i<a.length;i++){difference+=a[i]!==b[i];union+=!!(a[i]||b[i]);mask[i]=a[i]&&b[i];}
  if(!union||difference>Math.ceil(a.length*.00035)||difference/union>.002)return null;
  return{mask,difference,union};
 }
 function pair(first,second,roi,w,h){
  if(!roiOK(roi,w,h))return null;const W=roi[2]-roi[0],H=roi[3]-roi[1];
  if(!sourceValid(first,4,W,H)||!sourceValid(second,6,W,H)||first._structuralGridProof.palette.paper!==second._structuralGridProof.palette.paper)return null;
  const c=E().consensus(first,second,W,H);return c?{...c,mask:pageMask(c.mask,roi,w,h)}:null;
 }
 function signature(mask,rgba){
  let pixels=0,colored=0;const bins=new Map();
  for(let i=0;i<mask.length;i++)if(mask[i]){
   pixels++;const r=rgba[4*i],g=rgba[4*i+1],b=rgba[4*i+2];
   if(Math.max(r,g,b)-Math.min(r,g,b)>24){colored++;const key=(r>>5)*64+(g>>5)*8+(b>>5);bins.set(key,(bins.get(key)||0)+1);}
  }
  return{pixels,colored,bins:[...bins].sort((a,b)=>a[0]-b[0])};
 }
 function signatureValid(s,pixels){
  if(!s||s.pixels!==pixels||!Number.isInteger(s.colored)||s.colored<pixels*.12||s.colored>pixels||!Array.isArray(s.bins)||!s.bins.length||s.bins.length>512)return false;
  let total=0,largest=0,rich=0,last=-1;
  for(const b of s.bins){if(!Array.isArray(b)||b.length!==2||!Number.isInteger(b[0])||b[0]<=last||b[0]>511||!Number.isInteger(b[1])||b[1]<1)return false;last=b[0];total+=b[1];largest=Math.max(largest,b[1]);rich+=b[1]>=Math.max(8,pixels*.00005);}
  return total===s.colored&&rich>=12&&largest/s.colored<=.75;
 }
 function edgesOK(b,paper){return !(b.edges.filter(Boolean).length===2&&b.edges.slice(0,2).some(Boolean)&&b.edges.slice(2).some(Boolean))&&!(!paper&&b.edges.slice(0,2).some(Boolean)&&b.edges.slice(2).some(Boolean));}
 function geometry(mask,w,h){
  const d=E().extent(mask,w,h),[x0,y0,x1,y1]=d.box,area=(x1-x0)*(y1-y0)/(w*h);
  if(area<.025||area>.65)return null;const rings=PanelMatteCells.tracePixelContours(mask,w,h,1);
  return rings?.length===1?{...d,rings,normalized:[x0/w,y0/h,(x1-x0)/w,(y1-y0)/h]}:null;
 }
 function validPanel(p){
  const v=p?._structuralGridProof,c=v&&cache.get(v);
  if(c&&p._contours===c.contours)return p._identitySource==='structural-grid-frame'&&p._geometryOwner==='structural-grid-contours'&&p._geometryType==='context-enclosed-cell'&&!p._quad&&!p._outline&&same([p.x,p.y,p.w,p.h],c.box);
  try{
   const w=v?.analysisWidth,h=v?.analysisHeight;
   if(v?.version!==VERSION||v.method!==METHOD||!dataOK(w,h)||h<w*1.15||v.connected!==true||v.originalOwnerOverlap!==0||v.internalDivider!==false||!same(v.radii,[4,6])||v.contextPadding!==4||!same(v.expandedWindow,expand(v.window,w,h))||!Array.isArray(v.sources)||v.sources.length!==4||!windows(w,h).some(r=>same(r,v.window))||same(v.window,v.expandedWindow)||p._identitySource!=='structural-grid-frame'||p._geometryOwner!=='structural-grid-contours'||p._geometryType!=='context-enclosed-cell'||p._quad||p._outline)return false;
   const a=pair(v.sources[0],v.sources[1],v.window,w,h),b=pair(v.sources[2],v.sources[3],v.expandedWindow,w,h);if(!a||!b)return false;
   const paper=v.sources[0]._structuralGridProof.palette.paper;if(v.sources.some(s=>s._structuralGridProof.palette.paper!==paper))return false;
   const c=stableMask(a.mask,b.mask);if(!c||!same(v.seedDifferences,[a.difference,b.difference])||!same(v.seedUnions,[a.union,b.union])||v.contextDifference!==c.difference||v.contextUnion!==c.union)return false;
   const g=geometry(c.mask,w,h);if(!g||g.pixels!==v.pixels||!same(v.box,g.box)||!same(v.pixelContours,g.rings)||!signatureValid(v.content,g.pixels)||!paper&&g.pixels/((g.box[2]-g.box[0])*(g.box[3]-g.box[1]))<.90||!Array.isArray(v.boundaries)||v.boundaries.length!==2||v.boundaries.some(e=>!E().boundaryValid(e)||!edgesOK(e,paper)))return false;
   const zero=new Uint8Array(w*h),front=E().boundary(c.mask,new Uint8ClampedArray(w*h*4),{near:zero,nearExterior:zero},w,h);
   if(v.boundaries.some(e=>!same(e.samples,front.samples)||!same(e.edges,front.edges)))return false;
   return same([p.x,p.y,p.w,p.h],g.normalized)&&same(p._contours,g.rings.map(q=>q.map(([x,y])=>({x:x/w,y:y/h}))));
  }catch(_){return false;}
 }
 function analyzeRGBA(rgba,w,h,prior=[],log,audit){
  const report={windows:0,stable:0,context:0,accepted:0};const done=out=>{audit?.(report);return out;};
  if(!dataOK(w,h)||h<w*1.15||rgba?.length!==w*h*4||!Array.isArray(prior)||prior.length>24||prior.some(p=>!p||!['x','y','w','h'].every(k=>Number.isFinite(p[k]))||p.x<0||p.y<0||p.w<=0||p.h<=0||p.x+p.w>1.000001||p.y+p.h>1.000001))return done([]);
  const occupied=new Uint8Array(w*h);for(const p of prior){const m=raster(p,w,h);for(let i=0;i<m.length;i++)occupied[i]|=m[i];}
  const unowned=new Uint32Array((w+1)*(h+1));let colorPixels=0;
  for(let y=0;y<h;y++){let row=0;for(let x=0;x<w;x++){const i=y*w+x;if(rgba[4*i+3]!==255)return done([]);const r=rgba[4*i],g=rgba[4*i+1],b=rgba[4*i+2],yes=!occupied[i]&&Math.max(r,g,b)-Math.min(r,g,b)>24;row+=yes;colorPixels+=yes;unowned[(y+1)*(w+1)+x+1]=unowned[y*(w+1)+x+1]+row;}}
  if(colorPixels<w*h*.003)return done([]);
  const amount=([a,b,c,d])=>unowned[d*(w+1)+c]-unowned[b*(w+1)+c]-unowned[d*(w+1)+a]+unowned[b*(w+1)+a];
  const fields=new Map(),mattes=new Map(),out=[];
  function field(roi){
   const key=roi.join(',');if(fields.has(key))return fields.get(key);
   const [x0,y0,x1,y1]=roi,W=x1-x0,H=y1-y0,data=new Uint8ClampedArray(W*H*4);
   for(let y=0;y<H;y++)data.set(rgba.subarray(((y+y0)*w+x0)*4,((y+y0)*w+x1)*4),y*W*4);
   const sets=[4,6].map(r=>PanelRaggedGutters.analyzeContextCandidatesRGBA(data,W,H,r));fields.set(key,sets);return sets;
  }
  function matte(palette){const k=JSON.stringify(palette);if(!mattes.has(k))mattes.set(k,E().paper(rgba,w,h,palette));return mattes.get(k);}
  function matches(sets,roi,reference){
   const [x0,y0,x1,y1]=roi,W=x1-x0,H=y1-y0,result=[];
   for(const second of sets[1])if(sourceValid(second,6,W,H))for(const first of sets[0]){
    if(!sourceValid(first,4,W,H)||Math.max(Math.abs(first.x-second.x),Math.abs(first.y-second.y),Math.abs(first.w-second.w),Math.abs(first.h-second.h))>=.01)continue;
    const p=pair(first,second,roi,w,h);if(p&&(!reference||stableMask(reference,p.mask)))result.push({first,second,...p});
   }return result;
  }
  // Spend the bounded search budget where existing owners leave the most
  // colored artwork. Ranking uses pixels, never a stored page identity.
  const ranked=windows(w,h).filter(r=>!same(r,expand(r,w,h))&&amount(r)>=w*h*.003)
   .map((r,index)=>({r,index,score:amount(r)/((r[2]-r[0])*(r[3]-r[1]))}))
   .sort((a,b)=>b.score-a.score||a.index-b.index).slice(0,6);
  for(const {r:roi} of ranked){
   const expanded=expand(roi,w,h);if(same(roi,expanded)||amount(roi)<w*h*.003)continue;report.windows++;
   for(const a of matches(field(roi),roi)){
    if(a.mask.some((v,i)=>v&&occupied[i]))continue;report.stable++;
    const g0=geometry(a.mask,w,h);if(!g0||!signatureValid(signature(a.mask,rgba),g0.pixels))continue;
    const bset=matches(field(expanded),expanded,a.mask);if(bset.length!==1)continue;
    const b=bset[0],paper=a.first._structuralGridProof.palette.paper;if(b.first._structuralGridProof.palette.paper!==paper)continue;
    const c=stableMask(a.mask,b.mask);if(!c||c.mask.some((v,i)=>v&&occupied[i]))continue;report.context++;
    const g=geometry(c.mask,w,h),content=signature(c.mask,rgba);if(!g||!signatureValid(content,g.pixels)||!paper&&g.pixels/((g.box[2]-g.box[0])*(g.box[3]-g.box[1]))<.90)continue;
    const pa=matte(a.first._structuralGridProof.palette),pb=matte(b.first._structuralGridProof.palette),boundaries=[E().boundary(c.mask,rgba,pa,w,h),E().boundary(c.mask,rgba,pb,w,h)];
    if(boundaries.some(e=>!E().boundaryValid(e)||!edgesOK(e,paper))||E().internalDivider(c.mask,rgba,pa,w,h))continue;
    const proof={version:VERSION,method:METHOD,connected:true,analysisWidth:w,analysisHeight:h,radii:[4,6],contextPadding:4,window:roi,expandedWindow:expanded,sources:[a.first,a.second,b.first,b.second],seedDifferences:[a.difference,b.difference],seedUnions:[a.union,b.union],contextDifference:c.difference,contextUnion:c.union,pixels:g.pixels,box:g.box,pixelContours:g.rings,boundaries,content,originalOwnerOverlap:0,internalDivider:false};
    const [x,y,W,H]=g.normalized,p={x,y,w:W,h:H,_identitySource:'structural-grid-frame',_geometryOwner:'structural-grid-contours',_geometryType:'context-enclosed-cell',_contours:g.rings.map(q=>q.map(([x,y])=>({x:x/w,y:y/h}))),_structuralGridProof:proof};
    if(!validPanel(p))continue;freeze(proof);freeze(p._contours);cache.set(proof,{contours:p._contours,box:g.normalized});out.push(p);for(let i=0;i<occupied.length;i++)occupied[i]|=c.mask[i];
   }
  }
  report.accepted=out.length;if(out.length)log?.('context cells: '+out.length+' independently bounded additions');return done(out);
 }
 function supplementImage(img,prior,log){
  const W=img.naturalWidth||img.width,H=img.naturalHeight||img.height;if(!W||!H||W*H>24000000)return[];let c;
  try{c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d',{willReadFrequently:true});if(!g)return[];g.drawImage(img,0,0);const scale=Math.min(1,900/Math.max(W,H)),w=Math.round(W*scale),h=Math.round(H*scale);return analyzeRGBA(PanelMatteCells.sampleBilinearRGBA(g.getImageData(0,0,W,H).data,W,H,w,h),w,h,prior,log);}finally{if(c)c.width=c.height=1;}
 }
 function bind(){
  if(typeof PanelStructuralGrid!=='undefined'&&!PanelStructuralGrid._contextCells){const old=PanelStructuralGrid.validPanel;PanelStructuralGrid.validPanel=p=>p?._structuralGridProof?.version===VERSION?validPanel(p):old(p);PanelStructuralGrid._contextCells=true;}
  if(typeof PanelGeometry!=='undefined'&&!PanelGeometry._contextCells){const old=PanelGeometry.refine;PanelGeometry.refine=async function(url,p,log){return validPanel(p)?{...p}:old.call(this,url,p,log);};PanelGeometry._contextCells=true;}
  if(typeof PanelEdgeSpill!=='undefined'&&!PanelEdgeSpill._contextCells){for(const name of['analyzeImage','analyzeRGBA']){const old=PanelEdgeSpill[name];if(typeof old==='function')PanelEdgeSpill[name]=function(...args){return validPanel(args[name==='analyzeImage'?1:3])?null:old.apply(this,args);};}PanelEdgeSpill._contextCells=true;}
 }
 function install(detector){bind();if(!detector||detector._contextCells)return;const old=detector.detect;detector.detect=async function(url,log){const prior=await old.call(this,url,log);try{const img=new Image();img.src=url;await img.decode();const add=supplementImage(img,prior,log);return add.length?prior.concat(add):prior;}catch(e){log?.('context cells deferred: '+e.message);return prior;}};detector._contextCells=true;}
 return{analyzeRGBA,supplementImage,validPanel,install};
})();
if(typeof PanelDetect!=='undefined')PanelContextCells.install(PanelDetect);
if(typeof module!=='undefined')module.exports=PanelContextCells;
