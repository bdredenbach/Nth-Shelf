/* Disconnected exterior-color flecks in lettering do not form a continuous gutter.
 * This optional closed-cell supplement preserves all old divider rules; only
 * short discontinuous aggregate gaps abstain from claiming a separator.
 * Seed consensus, complete borders, inset checks and exclusive ownership remain. */
const PanelLetteringCells=(()=>{
 'use strict';
 const VERSION=42,METHOD='closed-cell-with-discontinuous-lettering-gaps',cache=new WeakMap();
 const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),E=()=>PanelLocalBoundaryConsensus.pixelEvidence,C=()=>PanelContextCells.contentEvidence;
 const raster=(p,w,h)=>PanelLocalBoundaryConsensus.raster(p,w,h);
 function freeze(v){if(v&&typeof v==='object'&&!Object.isFrozen(v)){for(const x of Object.values(v))freeze(x);Object.freeze(v);}return v;}
 function dataOK(w,h){return Number.isInteger(w)&&Number.isInteger(h)&&w>=250&&h>=350&&w<=900&&h<=900&&h>=w*1.15;}
 function sourceValid(p,r,w,h){
  const v=p?._structuralGridProof,b=v?.seed?.box;if(!v)return false;
  const copy={...p,_structuralGridProof:{...v,count:Math.max(3,v.count)}};delete copy._structuralGridProof.seedRadius;
  return PanelRaggedGutters.validPanel(copy)&&v.version===18&&v.method==='exterior-color-field-ragged-cells'&&v.palette.paper===(Math.min(...v.palette.colors[0])>220)&&v.seedRadius===r&&v.analysisWidth===w&&v.analysisHeight===h&&Number.isInteger(v.count)&&v.count>=2&&v.count<=24&&Number.isInteger(v.index)&&v.index>=0&&v.index<v.count&&!v.recovery&&p._contours?.length===1&&v.variance>=500&&v.seed.pixels/((b[2]-b[0])*(b[3]-b[1]))>=.40&&p.w*p.h>=.05&&p.w*p.h<=.35&&v.pixels/(p.w*p.h*w*h)>=.72;
 }
 function edgesOK(b){return b.edges.every(n=>n===0);}
 function gapsValid(runs,box){
  if(!Array.isArray(runs)||!runs.length||runs.length>512)return false;
  const [x0,y0,x1,y1]=box;
  return runs.every(r=>{
   const span=r.axis?y1-y0:x1-x0,len=r.axis?x1-x0:y1-y0;
   return [0,1].includes(r.axis)&&Number.isInteger(r.k)&&r.k>=0&&r.k<len&&r.span===span&&['gaps','flanks','longestGap'].every(k=>Number.isInteger(r[k])&&r[k]>=0)&&r.gaps>span*.20&&r.gaps<=span&&r.flanks>span*.12&&r.flanks<=r.gaps&&r.longestGap<=r.flanks&&r.longestGap<Math.max(30,.45*span);
  });
 }
 function coherentDivider(m,rgba,P,w,h,inkPolicy=null,weakGaps=[]){
  if(!inkPolicy||inkPolicy.distance?.length!==w*h||!Array.isArray(inkPolicy.ignored))inkPolicy=null;
  function suspicious(run,both,either,minRun,axis,k,slope,last,span,box){
   if(run<minRun||both/run<.20||either/run<.72)return false;
   if(!inkPolicy||run>=span*.60)return true;
   const [x0,y0]=box,point=t=>axis?[x0+Math.round(k+slope*(t-span/2)),y0+t]:[x0+t,y0+Math.round(k+slope*(t-span/2))];
   const first=point(last-run+1),end=point(last),distances=[first,end].map(([x,y])=>inkPolicy.distance[y*w+x]);
   if(distances.some(v=>!Number.isInteger(v)||v<=8))return true;
   inkPolicy.ignored.push({axis,offset:k,slope,first,last:end,run,both,either,span,distances});return false;
  }
  const{box:[x0,y0,x1,y1],pixels}=E().extent(m,w,h);
  for(let axis=0;axis<2;axis++){const len=axis?x1-x0:y1-y0,span=axis?y1-y0:x1-x0,band=Math.max(8,Math.round(len*.055)),margin=Math.max(band*2,Math.round(len*.12)),step=axis?1:w;let before=0;for(let k=0;k<len;k++){for(let t=0;t<span;t++)before+=m[(axis?y0+t:y0+k)*w+(axis?x0+k:x0+t)];if(k<margin||k>=len-margin||Math.min(before,pixels-before)<pixels*.15)continue;let gaps=0,flanks=0,ink=0,gapRun=0,longestGap=0;for(let t=0;t<span;t++){const i=(axis?y0+t:y0+k)*w+(axis?x0+k:x0+t);if(P.exterior[i]){gaps++;flanks+=!!(m[i-band*step]&&m[i+band*step]);if(m[i-band*step]&&m[i+band*step]){gapRun++;longestGap=Math.max(longestGap,gapRun);}else gapRun=0;}else gapRun=0;if(m[i-band*step]&&m[i+band*step]){const v=Math.min(rgba[4*i],rgba[4*i+1],rgba[4*i+2]);const a=i-band*step,b=i+band*step;ink+=v<50&&Math.max(rgba[4*a],rgba[4*a+1],rgba[4*a+2])-v>30&&Math.max(rgba[4*b],rgba[4*b+1],rgba[4*b+2])-v>30;}}if(ink/span>.85)return true;if(gaps/span>.20&&flanks/span>.12){if(longestGap>=Math.max(30,.45*span))return true;weakGaps.push({axis,k,span,gaps,flanks,longestGap});}}}
  const L=new Float32Array(w*h);for(let i=0;i<L.length;i++)L[i]=.299*rgba[4*i]+.587*rgba[4*i+1]+.114*rgba[4*i+2];
  for(let axis=0;axis<2;axis++){const len=axis?x1-x0:y1-y0,span=axis?y1-y0:x1-x0,step=axis?1:w,d=7,minRun=Math.max(80,Math.ceil(span*.45));let before=0;for(let k=0;k<len;k++){for(let t=0;t<span;t++)before+=m[(axis?y0+t:y0+k)*w+(axis?x0+k:x0+t)];if(k<d+1||k>=len-d-1||Math.min(before,pixels-before)<pixels*.12)continue;let run=0,both=0,either=0,last=0;const flagged=()=>suspicious(run,both,either,minRun,axis,k,0,last,span,[x0,y0]);for(let t=0;t<span;t++){const i=(axis?y0+t:y0+k)*w+(axis?x0+k:x0+t),rail=Math.min(L[i-step],L[i],L[i+step]);if(m[i-d*step]&&m[i+d*step]&&rail<65){const a=L[i-d*step]-rail>20,b=L[i+d*step]-rail>20;run++;last=t;both+=a&&b;either+=a||b;}else{if(flagged())return true;run=both=either=0;}}if(flagged())return true;}}
  for(let axis=0;axis<2;axis++){const len=axis?x1-x0:y1-y0,span=axis?y1-y0:x1-x0,step=axis?1:w,d=7,minRun=Math.max(80,Math.ceil(span*.45));for(const slope of[-.20,-.15,-.10,-.05,.05,.10,.15,.20])for(let k=Math.max(d+3,Math.round(len*.12));k<len-Math.max(d+3,Math.round(len*.12));k+=2){let run=0,both=0,either=0,last=0;const flagged=()=>suspicious(run,both,either,minRun,axis,k,slope,last,span,[x0,y0]);for(let t=0;t<span;t++){const pos=Math.round(k+slope*(t-span/2));if(pos<=d||pos>=len-d){if(flagged())return true;run=both=either=0;continue;}const i=(axis?y0+t:y0+pos)*w+(axis?x0+pos:x0+t),rail=Math.min(L[i-step],L[i],L[i+step]);if(m[i-d*step]&&m[i+d*step]&&rail<65){const a=L[i-d*step]-rail>20,b=L[i+d*step]-rail>20;run++;last=t;both+=a&&b;either+=a||b;}else{if(flagged())return true;run=both=either=0;}}if(flagged())return true;}}
  // A sealed or sloping paper corridor can divide scenes even when it no
  // longer reaches the page edge. Require art from this same owner on both
  // sides of a long, coherent white seam; balloon interiors do not qualify.
  for(let axis=0;axis<2;axis++){const len=axis?x1-x0:y1-y0,span=axis?y1-y0:x1-x0,d=Math.max(7,Math.round(len*.025)),margin=Math.max(d+3,Math.round(len*.10));for(const slope of[-.15,-.10,-.05,0,.05,.10,.15])for(let k=margin;k<len-margin;k+=2){let support=0,longest=0,run=0,gap=0;for(let t=0;t<span;t++){const pos=Math.round(k+slope*(t-span/2));if(pos<=d||pos>=len-d){longest=Math.max(longest,run);run=gap=0;continue;}const i=(axis?y0+t:y0+pos)*w+(axis?x0+pos:x0+t),step=axis?1:w,present=P.white[i-step]||P.white[i]||P.white[i+step],flanks=m[i-d*step]&&m[i+d*step]&&!P.white[i-d*step]&&!P.white[i+d*step];if(present&&flanks){support++;run++;gap=0;}else if(run&&++gap<=3){run++;}else{longest=Math.max(longest,run);run=gap=0;}}longest=Math.max(longest,run);if(support>=Math.max(60,.58*span)&&longest>=.40*span)return true;}}
  return false;
 }
 function validPanel(p){
  const v=p?._structuralGridProof,c=v&&cache.get(v);
  if(c&&p._contours===c.contours)return p._identitySource==='structural-grid-frame'&&p._geometryOwner==='structural-grid-contours'&&p._geometryType==='lettering-enclosed-cell'&&!p._quad&&!p._outline&&same([p.x,p.y,p.w,p.h],c.box);
  try{
   const w=v?.analysisWidth,h=v?.analysisHeight;
   if(v?.version!==VERSION||v.method!==METHOD||!dataOK(w,h)||v.connected!==true||v.originalOwnerOverlap!==0||v.originalDivider!==true||v.internalDivider!==false||v.enclosedInset!==false||!same(v.insetChecks,['narrow-ink','chromatic-rims'])||!same(v.radii,[4,6])||p._identitySource!=='structural-grid-frame'||p._geometryOwner!=='structural-grid-contours'||p._geometryType!=='lettering-enclosed-cell'||p._quad||p._outline||!sourceValid(v.first,4,w,h)||!sourceValid(v.second,6,w,h)||v.first._structuralGridProof.palette.paper!==v.second._structuralGridProof.palette.paper)return false;
   const c=E().consensus(v.first,v.second,w,h);if(!c||c.difference!==v.difference||c.union!==v.union)return false;
   const g=E().extent(c.mask,w,h),rings=PanelMatteCells.tracePixelContours(c.mask,w,h,1);
   if(rings?.length!==1||g.pixels!==v.pixels||!same(g.box,v.box)||!same(rings,v.pixelContours)||!C().signatureValid(v.content,g.pixels)||!gapsValid(v.weakGapRuns,g.box)||!E().boundaryValid(v.boundary)||!edgesOK(v.boundary,v.first._structuralGridProof.palette.paper))return false;
   const zero=new Uint8Array(w*h),front=E().boundary(c.mask,new Uint8ClampedArray(w*h*4),{near:zero,nearExterior:zero},w,h);
   if(!same(v.boundary.samples,front.samples)||!same(v.boundary.edges,front.edges))return false;
   const [x0,y0,x1,y1]=g.box;return same([p.x,p.y,p.w,p.h],[x0/w,y0/h,(x1-x0)/w,(y1-y0)/h])&&same(p._contours,rings.map(q=>q.map(([x,y])=>({x:x/w,y:y/h}))));
  }catch(_){return false;}
 }
 function analyzeRGBA(rgba,w,h,prior=[],log,audit){
  const report={sources:0,stable:0,lettering:0,insets:0,accepted:0},done=out=>{audit?.(report);return out;};
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
   const weakGaps=[];
   if(coherentDivider(mask,rgba,P,w,h,null,weakGaps)||!gapsValid(weakGaps,g.box))continue;report.lettering++;
   if(enclosedInset(mask)){report.insets++;continue;}
   const rings=PanelMatteCells.tracePixelContours(mask,w,h,1);if(rings?.length!==1)continue;
   const v={version:VERSION,method:METHOD,connected:true,analysisWidth:w,analysisHeight:h,radii:[4,6],first:a,second:b,difference:c.difference,union:c.union,pixels:g.pixels,box:g.box,pixelContours:rings,boundary,content,originalOwnerOverlap:0,originalDivider:true,internalDivider:false,enclosedInset:false,insetChecks:['narrow-ink','chromatic-rims'],weakGapRuns:weakGaps};
   const [x0,y0,x1,y1]=g.box,p={x:x0/w,y:y0/h,w:(x1-x0)/w,h:(y1-y0)/h,_identitySource:'structural-grid-frame',_geometryOwner:'structural-grid-contours',_geometryType:'lettering-enclosed-cell',_contours:rings.map(q=>q.map(([x,y])=>({x:x/w,y:y/h}))),_structuralGridProof:v};
   if(!validPanel(p))continue;freeze(v);freeze(p._contours);cache.set(v,{contours:p._contours,box:[p.x,p.y,p.w,p.h]});out.push(p);for(let i=0;i<mask.length;i++)occupied[i]|=mask[i];
  }
  report.accepted=out.length;if(out.length)log?.('lettering cells: '+out.length+' independently enclosed additions');return done(out);
 }
 function supplementImage(img,prior,log){
  const W=img.naturalWidth||img.width,H=img.naturalHeight||img.height;if(!W||!H||W*H>24000000)return[];let c;
  try{c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d',{willReadFrequently:true});if(!g)return[];g.drawImage(img,0,0);const scale=Math.min(1,900/Math.max(W,H)),w=Math.round(W*scale),h=Math.round(H*scale);return analyzeRGBA(PanelMatteCells.sampleBilinearRGBA(g.getImageData(0,0,W,H).data,W,H,w,h),w,h,prior,log);}finally{if(c)c.width=c.height=1;}
 }
 function bind(){
  if(typeof PanelStructuralGrid!=='undefined'&&!PanelStructuralGrid._letteringCells){const old=PanelStructuralGrid.validPanel;PanelStructuralGrid.validPanel=p=>p?._structuralGridProof?.version===VERSION?validPanel(p):old(p);PanelStructuralGrid._letteringCells=true;}
  if(typeof PanelGeometry!=='undefined'&&!PanelGeometry._letteringCells){const old=PanelGeometry.refine;PanelGeometry.refine=async function(url,p,log){return validPanel(p)?{...p}:old.call(this,url,p,log);};PanelGeometry._letteringCells=true;}
  if(typeof PanelEdgeSpill!=='undefined'&&!PanelEdgeSpill._letteringCells){for(const name of['analyzeImage','analyzeRGBA']){const old=PanelEdgeSpill[name];if(typeof old==='function')PanelEdgeSpill[name]=function(...args){return validPanel(args[name==='analyzeImage'?1:3])?null:old.apply(this,args);};}PanelEdgeSpill._letteringCells=true;}
 }
 function install(detector){bind();if(!detector||detector._letteringCells)return;const old=detector.detect;detector.detect=async function(url,log){const prior=await old.call(this,url,log);try{const img=new Image();img.src=url;await img.decode();const add=supplementImage(img,prior,log);return add.length?prior.concat(add):prior;}catch(e){log?.('lettering cells deferred: '+e.message);return prior;}};detector._letteringCells=true;}
 return{analyzeRGBA,supplementImage,validPanel,install,coherentDivider};
})();
if(typeof PanelDetect!=='undefined')PanelLetteringCells.install(PanelDetect);
if(typeof module!=='undefined')module.exports=PanelLetteringCells;
