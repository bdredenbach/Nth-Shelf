/* Closed contours witnessed by locally smooth exterior gutters. The exterior
 * can change hue, saturation and luminance; strong pixel transitions stop the
 * flood. Two independent smoothness thresholds must retain the same frame.
 * Original masks, whole-side contrast and retained-owner exclusion authorize
 * additions. No page identities, tap coordinates or saved crop tables. */
const PanelSmoothGutterBoundaries=(()=>{
 'use strict';
 const VERSION=40,METHOD='closed-local-gradient-gutter-boundary',cache=new WeakMap();
 const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),E=()=>PanelLocalBoundaryConsensus.pixelEvidence;
 function dataOK(w,h){return Number.isInteger(w)&&Number.isInteger(h)&&w>=250&&h>=350&&w<=900&&h<=900&&h>=w*1.15;}
 function freeze(v){if(v&&typeof v==='object'&&!Object.isFrozen(v)){for(const x of Object.values(v))freeze(x);Object.freeze(v);}return v;}
 function flood(mask,w,h){const ext=new Uint8Array(w*h),q=new Int32Array(w*h);let n=0,head=0;const add=i=>{if(mask[i]&&!ext[i]){ext[i]=1;q[n++]=i;}};for(let x=0;x<w;x++){add(x);add((h-1)*w+x);}for(let y=0;y<h;y++){add(y*w);add(y*w+w-1);}while(head<n){const i=q[head++],x=i%w,y=i/w|0;if(x)add(i-1);if(x+1<w)add(i+1);if(y)add(i-w);if(y+1<h)add(i+w);}return{mask:ext,pixels:n};}
 function exterior(rgba,w,h,tolerance){
  const quiet=new Uint8Array(w*h);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   const i=y*w+x;let good=true;for(const j of[x?i-1:-1,x+1<w?i+1:-1,y?i-w:-1,y+1<h?i+w:-1])if(j>=0&&[0,1,2].some(k=>Math.abs(rgba[4*i+k]-rgba[4*j+k])>tolerance)){good=false;break;}quiet[i]=good;
  }return flood(quiet,w,h);
 }
 function components(mask,w,h){
  const ids=new Int32Array(w*h),q=new Int32Array(w*h),items=[];let id=0;
  for(let seed=0;seed<mask.length;seed++)if(mask[seed]&&!ids[seed]){let n=1,head=0,x0=w,y0=h,x1=0,y1=0;q[0]=seed;ids[seed]=++id;
   while(head<n){const i=q[head++],x=i%w,y=i/w|0;x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x+1);y1=Math.max(y1,y+1);for(const j of[x?i-1:-1,x+1<w?i+1:-1,y?i-w:-1,y+1<h?i+w:-1])if(j>=0&&mask[j]&&!ids[j]){ids[j]=id;q[n++]=j;}}
   if(n>=w*h*.025&&n<=w*h*.40&&x0>=4&&y0>=4&&x1<=w-4&&y1<=h-4&&n/((x1-x0)*(y1-y0))>=.80)items.push({id,pixels:n,box:[x0,y0,x1,y1]});
  }return{ids,items};
 }
 function filled(ids,id,w,h){const m=ids.map(v=>v===id?1:0),outside=flood(m.map(v=>1-v),w,h);return outside.mask.map(v=>1-v);}
 function boundary(mask,rgba,ext,w,h){
  const lum=i=>.299*rgba[4*i]+.587*rgba[4*i+1]+.114*rgba[4*i+2],sides=Array.from({length:4},()=>({samples:0,exterior:0,contrast:0}));
  const visit=(i,k,step)=>{const s=sides[k];s.samples++;let inside=255,outside=-1,quiet=false;for(let d=0;d<=4;d++)inside=Math.min(inside,lum(i-d*step));for(let d=1;d<=6;d++){const j=i+d*step;if(ext[j]){quiet=true;outside=Math.max(outside,lum(j));}}s.exterior+=quiet;s.contrast+=quiet&&outside-inside>18;};
  for(let x=0;x<w;x++){let lo=-1,hi=-1;for(let y=0;y<h;y++)if(mask[y*w+x]){if(lo<0)lo=y;hi=y;}if(lo>=6&&hi<h-6){visit(lo*w+x,0,-w);visit(hi*w+x,1,w);}}
  for(let y=0;y<h;y++){let lo=-1,hi=-1;for(let x=0;x<w;x++)if(mask[y*w+x]){if(lo<0)lo=x;hi=x;}if(lo>=6&&hi<w-6){visit(y*w+lo,2,-1);visit(y*w+hi,3,1);}}
  return{sides};
 }
 function boundaryValid(b){return b?.sides?.length===4&&b.sides.every(s=>Number.isInteger(s.samples)&&s.samples>=30&&Number.isInteger(s.exterior)&&s.exterior>=s.samples*.97&&s.exterior<=s.samples&&Number.isInteger(s.contrast)&&s.contrast>=s.samples*.90&&s.contrast<=s.exterior);}
 function analyzeRGBA(rgba,w,h,prior=[],log,audit){
  const report={candidates:0,stable:0,overlap:0,boundary:0,content:0,divider:0,inset:0,accepted:0},done=a=>{audit?.(report);return a;};
  if(!dataOK(w,h)||rgba?.length!==w*h*4||!Array.isArray(prior)||prior.length>24||prior.some(p=>!p||!['x','y','w','h'].every(k=>Number.isFinite(p[k]))||p.x<0||p.y<0||p.w<=0||p.h<=0||p.x+p.w>1.000001||p.y+p.h>1.000001)||typeof PanelLocalBoundaryConsensus==='undefined'||typeof PanelMatteCells==='undefined'||typeof PanelContextCells==='undefined'||typeof PanelNarrowInkFrames==='undefined'||typeof PanelColoredRims==='undefined')return done([]);
  let colored=0;for(let i=0;i<w*h;i++){if(rgba[4*i+3]!==255)return done([]);colored+=Math.max(rgba[4*i],rgba[4*i+1],rgba[4*i+2])-Math.min(rgba[4*i],rgba[4*i+1],rgba[4*i+2])>24;}if(colored<w*h*.03)return done([]);
  const A=exterior(rgba,w,h,12),B=exterior(rgba,w,h,14);if(A.pixels<w*h*.04||A.pixels>w*h*.65||B.pixels<w*h*.04||B.pixels>w*h*.65)return done([]);
  const first=components(A.mask.map(v=>1-v),w,h),second=components(B.mask.map(v=>1-v),w,h),occupied=new Uint8Array(w*h);for(const p of prior){const m=PanelLocalBoundaryConsensus.raster(p,w,h);for(let i=0;i<m.length;i++)occupied[i]|=m[i];}
  const out=[];let insets;
  for(const a of first.items){
   report.candidates++;const matches=second.items.filter(b=>b.box.every((v,k)=>Math.abs(v-a.box[k])<=2));if(matches.length!==1)continue;
   const one=filled(first.ids,a.id,w,h),two=filled(second.ids,matches[0].id,w,h),m=one.map((v,i)=>v||two[i]?1:0);let difference=0,overlap=0;for(let i=0;i<m.length;i++){difference+=one[i]!==two[i];overlap+=m[i]&&occupied[i];}
   const g=E().extent(m,w,h);if(difference>Math.max(8,g.pixels*.0015))continue;report.stable++;if(overlap){report.overlap++;continue;}
   const rim=boundary(m,rgba,A.mask,w,h);if(!boundaryValid(rim)){report.boundary++;continue;}
   const content=PanelContextCells.contentEvidence.signature(m,rgba);if(!PanelContextCells.contentEvidence.signatureValid(content,g.pixels)){report.content++;continue;}
   const paper=E().paper(rgba,w,h,{paper:true});paper.exterior=A.mask;
   if(E().internalDivider(m,rgba,paper,w,h)){report.divider++;continue;}
   if(!insets)insets=[...PanelNarrowInkFrames.analyzeRGBA(rgba,w,h,[]),...PanelColoredRims.analyzeRGBA(rgba,w,h)].map(p=>PanelLocalBoundaryConsensus.raster(p,w,h));
   if(insets.some(p=>{const b=E().extent(p,w,h).box;if(b[0]<=g.box[0]+6||b[1]<=g.box[1]+6||b[2]>=g.box[2]-6||b[3]>=g.box[3]-6)return false;let n=0,hit=0;for(let i=0;i<p.length;i++)if(p[i]){n++;hit+=m[i];}return n&&hit/n>.95;})){report.inset++;continue;}
   const rings=PanelMatteCells.tracePixelContours(m,w,h,1);if(rings?.length!==1)continue;
   const contours=rings.map(q=>q.map(([x,y])=>({x:x/w,y:y/h}))),[x0,y0,x1,y1]=g.box,v={version:VERSION,method:METHOD,connected:true,analysisWidth:w,analysisHeight:h,thresholds:[12,14],exteriorPixels:[A.pixels,B.pixels],difference,pixels:g.pixels,box:g.box,pixelContours:rings,boundary:rim,content,originalOwnerOverlap:0,internalDivider:false,enclosedInset:false,insetChecks:['narrow-ink','chromatic-rims']},p={x:x0/w,y:y0/h,w:(x1-x0)/w,h:(y1-y0)/h,_identitySource:'structural-grid-frame',_geometryOwner:'structural-grid-contours',_geometryType:'smooth-gradient-enclosed-cell',_contours:contours,_structuralGridProof:v};
   if(!validPanel(p))continue;freeze(v);freeze(contours);cache.set(v,{contours,box:[p.x,p.y,p.w,p.h]});out.push(p);for(let i=0;i<m.length;i++)occupied[i]|=m[i];
  }report.accepted=out.length;if(out.length)log?.('smooth gutter boundaries: '+out.length+' independently enclosed additions');return done(out);
 }
 function validPanel(p){const v=p?._structuralGridProof,c=v&&cache.get(v);if(c&&p._contours===c.contours)return p._identitySource==='structural-grid-frame'&&p._geometryOwner==='structural-grid-contours'&&p._geometryType==='smooth-gradient-enclosed-cell'&&!p._quad&&!p._outline&&same([p.x,p.y,p.w,p.h],c.box);try{
  const w=v?.analysisWidth,h=v?.analysisHeight;if(v?.version!==VERSION||v.method!==METHOD||!dataOK(w,h)||v.connected!==true||!same(v.thresholds,[12,14])||v.originalOwnerOverlap!==0||v.internalDivider!==false||v.enclosedInset!==false||!same(v.insetChecks,['narrow-ink','chromatic-rims'])||!boundaryValid(v.boundary)||!Number.isInteger(v.difference)||v.difference<0||v.difference>Math.max(8,v.pixels*.0015)||!Array.isArray(v.exteriorPixels)||v.exteriorPixels.length!==2||v.exteriorPixels.some(n=>!Number.isInteger(n)||n<w*h*.04||n>w*h*.65)||p._identitySource!=='structural-grid-frame'||p._geometryOwner!=='structural-grid-contours'||p._geometryType!=='smooth-gradient-enclosed-cell'||p._quad||p._outline||p._contours?.length!==1)return false;
  const m=PanelLocalBoundaryConsensus.raster(p,w,h),g=E().extent(m,w,h),rings=PanelMatteCells.tracePixelContours(m,w,h,1),[x0,y0,x1,y1]=g.box;
  return g.pixels===v.pixels&&same(g.box,v.box)&&g.pixels>=w*h*.025&&g.pixels<=w*h*.40&&g.pixels/((x1-x0)*(y1-y0))>=.80&&x0>=4&&y0>=4&&x1<=w-4&&y1<=h-4&&same(rings,v.pixelContours)&&same(p._contours,rings.map(q=>q.map(([x,y])=>({x:x/w,y:y/h}))))&&same([p.x,p.y,p.w,p.h],[x0/w,y0/h,(x1-x0)/w,(y1-y0)/h])&&PanelContextCells.contentEvidence.signatureValid(v.content,g.pixels);
 }catch(_){return false;}}
 function supplementImage(img,prior,log){const W=img.naturalWidth||img.width,H=img.naturalHeight||img.height;if(!W||!H||W*H>24000000)return[];let c;try{c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d',{willReadFrequently:true});if(!g)return[];g.drawImage(img,0,0);const s=Math.min(1,900/Math.max(W,H)),w=Math.round(W*s),h=Math.round(H*s);return analyzeRGBA(PanelMatteCells.sampleBilinearRGBA(g.getImageData(0,0,W,H).data,W,H,w,h),w,h,prior,log);}finally{if(c)c.width=c.height=1;}}
 function bind(){if(typeof PanelStructuralGrid!=='undefined'&&!PanelStructuralGrid._smoothGutter){const old=PanelStructuralGrid.validPanel;PanelStructuralGrid.validPanel=p=>p?._structuralGridProof?.version===VERSION?validPanel(p):old(p);PanelStructuralGrid._smoothGutter=true;}if(typeof PanelGeometry!=='undefined'&&!PanelGeometry._smoothGutter){const old=PanelGeometry.refine;PanelGeometry.refine=async function(url,p,log){return validPanel(p)?{...p}:old.call(this,url,p,log);};PanelGeometry._smoothGutter=true;}if(typeof PanelEdgeSpill!=='undefined'&&!PanelEdgeSpill._smoothGutter){for(const name of['analyzeImage','analyzeRGBA']){const old=PanelEdgeSpill[name];if(typeof old==='function')PanelEdgeSpill[name]=function(...args){return validPanel(args[name==='analyzeImage'?1:3])?null:old.apply(this,args);};}PanelEdgeSpill._smoothGutter=true;}}
 function install(detector){bind();if(!detector||detector._smoothGutter)return;const old=detector.detect;detector.detect=async function(url,log){const prior=await old.call(this,url,log);try{const img=new Image();img.src=url;await img.decode();const add=supplementImage(img,prior,log);return add.length?prior.concat(add):prior;}catch(e){log?.('smooth gutter boundaries deferred: '+e.message);return prior;}};detector._smoothGutter=true;}
 return{analyzeRGBA,supplementImage,validPanel,install,exterior,boundary,boundaryValid,components,filled};
})();
if(typeof PanelDetect!=='undefined')PanelSmoothGutterBoundaries.install(PanelDetect);
if(typeof module!=='undefined')module.exports=PanelSmoothGutterBoundaries;
