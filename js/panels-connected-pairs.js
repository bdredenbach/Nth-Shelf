/* Optional two-frame groups: stable exterior contour plus one supported
 * interior gutter cluster. Both analysis passes must agree. Each side needs
 * rich artwork and no further divider; complete prior owners are never merged.
 * The whole union contour is the popup, including foreground bridges. */
const PanelConnectedPairs=(()=>{
 'use strict';
 const VERSION=43,METHOD='stable-gutter-connected-pair',cache=new WeakMap();
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
   if(n>=w*h*.025&&n<=w*h*.40&&n/((x1-x0)*(y1-y0))>=.80)items.push({id,pixels:n,box:[x0,y0,x1,y1]});
  }return{ids,items};
 }
 function filled(ids,id,w,h){const m=ids.map(v=>v===id?1:0),outside=flood(m.map(v=>1-v),w,h);return outside.mask.map(v=>1-v);}
 function boundary(mask,rgba,ext,w,h){
 const lum=i=>.299*rgba[4*i]+.587*rgba[4*i+1]+.114*rgba[4*i+2],sides=Array.from({length:4},()=>({samples:0,edges:0,exterior:0,contrast:0}));
 const visit=(i,k,step,coord,limit)=>{const s=sides[k];s.samples++;if(coord===0||coord===limit-1){s.edges++;return;}let inside=255,outside=-1,quiet=false;for(let d=0;d<=Math.min(4,k%2?coord:limit-1-coord);d++)inside=Math.min(inside,lum(i-d*step));for(let d=1;d<=Math.min(6,k%2?limit-1-coord:coord);d++){const j=i+d*step;if(ext[j]){quiet=true;outside=Math.max(outside,lum(j));}}s.exterior+=quiet;s.contrast+=quiet&&outside-inside>18;};
 for(let x=0;x<w;x++){let lo=-1,hi=-1;for(let y=0;y<h;y++)if(mask[y*w+x]){if(lo<0)lo=y;hi=y;}if(lo>=0){visit(lo*w+x,0,-w,lo,h);visit(hi*w+x,1,w,hi,h);}}
 for(let y=0;y<h;y++){let lo=-1,hi=-1;for(let x=0;x<w;x++)if(mask[y*w+x]){if(lo<0)lo=x;hi=x;}if(lo>=0){visit(y*w+lo,2,-1,lo,w);visit(y*w+hi,3,1,hi,w);}}
 return{sides};
 }
 function boundaryValid(b){
  if(b?.sides?.length!==4)return false;
  if(b.sides.filter(s=>s.edges>0).length>1)return false;
  return b.sides.every(s=>Number.isInteger(s.samples)&&s.samples>=30&&Number.isInteger(s.edges)&&s.edges>=0&&s.edges<=s.samples*.15&&Number.isInteger(s.exterior)&&s.exterior>=(s.samples-s.edges)*.97&&s.exterior<=s.samples-s.edges&&Number.isInteger(s.contrast)&&s.contrast>=(s.samples-s.edges)*.90&&s.contrast<=s.exterior);
 }
 function split(mask,axis,k,box,w){
  const [x0,y0]=box,a=new Uint8Array(mask.length),b=new Uint8Array(mask.length);
  for(let i=0;i<mask.length;i++)if(mask[i])((axis?i%w-x0:Math.floor(i/w)-y0)<k?a:b)[i]=1;
  return[a,b];
 }
 function pairEvidence(mask,rgba,P,w,h){
  const box=E().extent(mask,w,h).box,[x0,y0,x1,y1]=box,corridors=[];
  for(let axis=0;axis<2;axis++){
   const len=axis?x1-x0:y1-y0,span=axis?y1-y0:x1-x0,band=Math.max(8,Math.round(len*.055)),step=axis?1:w;
   for(let k=Math.ceil(len*.15);k<len*.85;k++){
    let gaps=0,flanks=0,run=0,longest=0,first=-1,last=-1;
    for(let t=0;t<span;t++){
     const i=(axis?y0+t:y0+k)*w+(axis?x0+k:x0+t),ok=P.exterior[i]&&mask[i-band*step]&&mask[i+band*step];
     gaps+=P.exterior[i];if(ok){flanks++;run++;longest=Math.max(longest,run);if(first<0)first=t;last=t;}else run=0;
    }
    if(flanks>=span*.35&&longest>=span*.25&&first<=span*.10&&last>=span*.90)corridors.push({axis,k,span,gaps,flanks,longest,first,last});
   }
  }
  if(!corridors.length)return null;
  const clusters=[];for(const q of corridors){const last=clusters.at(-1);if(last&&last[0].axis===q.axis&&last.at(-1).k+1===q.k)last.push(q);else clusters.push([q]);}
  if(clusters.length!==1||clusters[0].length<3||clusters[0].length>Math.max(8,Math.round((clusters[0][0].axis?x1-x0:y1-y0)*.06)))return null;
  const all=clusters[0],best=all.slice().sort((a,b)=>b.flanks-a.flanks||b.longest-a.longest||a.k-b.k)[0],leaves=split(mask,best.axis,best.k,box,w),leafPixels=leaves.map(m=>E().extent(m,w,h).pixels),pixels=leafPixels[0]+leafPixels[1];
  if(leafPixels.some(n=>n<w*h*.025||n<pixels*.15)||leaves.some(m=>E().internalDivider(m,rgba,P,w,h)))return null;
  const leafContent=leaves.map(m=>PanelContextCells.contentEvidence.signature(m,rgba));if(leafContent.some((s,i)=>!PanelContextCells.contentEvidence.signatureValid(s,leafPixels[i])))return null;
  return{count:2,...best,cluster:[all[0].k,all.at(-1).k],leafPixels,leafContent,leafDivider:[false,false]};
 }
 function groupValid(group,mask,box,w,h){
  if(!group||group.count!==2||![0,1].includes(group.axis)||!Number.isInteger(group.k)||group.leafDivider?.length!==2||group.leafDivider.some(Boolean))return false;
  const len=group.axis?box[2]-box[0]:box[3]-box[1],span=group.axis?box[3]-box[1]:box[2]-box[0];
  if(group.span!==span||group.k<len*.15||group.k>=len*.85||!['gaps','flanks','longest','first','last'].every(k=>Number.isInteger(group[k])&&group[k]>=0)||group.gaps>span||group.flanks>group.gaps||group.flanks<span*.35||group.longest>group.flanks||group.longest<span*.25||group.first>span*.10||group.last<span*.90||group.last>=span||!Array.isArray(group.cluster)||group.cluster.length!==2||!group.cluster.every(Number.isInteger)||group.cluster[0]>group.k||group.cluster[1]<group.k||group.cluster[1]-group.cluster[0]+1<3||group.cluster[1]-group.cluster[0]+1>Math.max(8,Math.round(len*.06)))return false;
  const leaves=split(mask,group.axis,group.k,box,w),sizes=leaves.map(m=>E().extent(m,w,h).pixels),pixels=sizes[0]+sizes[1];
  return same(sizes,group.leafPixels)&&sizes.every(n=>n>=w*h*.025&&n>=pixels*.15)&&Array.isArray(group.leafContent)&&group.leafContent.length===2&&group.leafContent.every((s,i)=>PanelContextCells.contentEvidence.signatureValid(s,sizes[i]));
 }
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
   if(!E().internalDivider(m,rgba,paper,w,h)){report.divider++;continue;}
   const frameGroup=pairEvidence(m,rgba,paper,w,h),peerPaper=E().paper(rgba,w,h,{paper:true});peerPaper.exterior=B.mask;
   const peerGroup=pairEvidence(m,rgba,peerPaper,w,h),peerBoundary=boundary(m,rgba,B.mask,w,h);
   if(!frameGroup||!peerGroup||frameGroup.axis!==peerGroup.axis||Math.abs(frameGroup.k-peerGroup.k)>2||!boundaryValid(peerBoundary)){report.divider++;continue;}
   if(!insets)insets=[...PanelNarrowInkFrames.analyzeRGBA(rgba,w,h,[]),...PanelColoredRims.analyzeRGBA(rgba,w,h)].map(p=>PanelLocalBoundaryConsensus.raster(p,w,h));
   if(insets.some(p=>{const b=E().extent(p,w,h).box;if(b[0]<=g.box[0]+6||b[1]<=g.box[1]+6||b[2]>=g.box[2]-6||b[3]>=g.box[3]-6)return false;let n=0,hit=0;for(let i=0;i<p.length;i++)if(p[i]){n++;hit+=m[i];}return n&&hit/n>.95;})){report.inset++;continue;}
   const rings=PanelMatteCells.tracePixelContours(m,w,h,1);if(rings?.length!==1)continue;
   const contours=rings.map(q=>q.map(([x,y])=>({x:x/w,y:y/h}))),[x0,y0,x1,y1]=g.box,v={version:VERSION,method:METHOD,connected:true,analysisWidth:w,analysisHeight:h,thresholds:[12,14],exteriorPixels:[A.pixels,B.pixels],difference,pixels:g.pixels,box:g.box,pixelContours:rings,boundary:rim,content,originalOwnerOverlap:0,internalDivider:true,frameGroup,peerGroup,peerBoundary,enclosedInset:false,insetChecks:['narrow-ink','chromatic-rims']},p={x:x0/w,y:y0/h,w:(x1-x0)/w,h:(y1-y0)/h,_identitySource:'structural-grid-frame',_geometryOwner:'structural-grid-contours',_geometryType:'connected-pair-cell',_contours:contours,_structuralGridProof:v};
   if(!validPanel(p))continue;freeze(v);freeze(contours);cache.set(v,{contours,box:[p.x,p.y,p.w,p.h]});out.push(p);for(let i=0;i<m.length;i++)occupied[i]|=m[i];
  }report.accepted=out.length;if(out.length)log?.('connected pairs: '+out.length+' independently enclosed additions');return done(out);
 }
 function validPanel(p){const v=p?._structuralGridProof,c=v&&cache.get(v);if(c&&p._contours===c.contours)return p._identitySource==='structural-grid-frame'&&p._geometryOwner==='structural-grid-contours'&&p._geometryType==='connected-pair-cell'&&!p._quad&&!p._outline&&same([p.x,p.y,p.w,p.h],c.box);try{
  const w=v?.analysisWidth,h=v?.analysisHeight;if(v?.version!==VERSION||v.method!==METHOD||!dataOK(w,h)||v.connected!==true||!same(v.thresholds,[12,14])||v.originalOwnerOverlap!==0||v.internalDivider!==true||v.enclosedInset!==false||!same(v.insetChecks,['narrow-ink','chromatic-rims'])||!boundaryValid(v.boundary)||!boundaryValid(v.peerBoundary)||!Number.isInteger(v.difference)||v.difference<0||v.difference>Math.max(8,v.pixels*.0015)||!Array.isArray(v.exteriorPixels)||v.exteriorPixels.length!==2||v.exteriorPixels.some(n=>!Number.isInteger(n)||n<w*h*.04||n>w*h*.65)||p._identitySource!=='structural-grid-frame'||p._geometryOwner!=='structural-grid-contours'||p._geometryType!=='connected-pair-cell'||p._quad||p._outline||p._contours?.length!==1)return false;
  const m=PanelLocalBoundaryConsensus.raster(p,w,h),g=E().extent(m,w,h),rings=PanelMatteCells.tracePixelContours(m,w,h,1),[x0,y0,x1,y1]=g.box;
  const geometric=boundary(m,new Uint8ClampedArray(w*h*4),new Uint8Array(w*h),w,h);
  if([v.boundary,v.peerBoundary].some(b=>b.sides.some((s,k)=>s.samples!==geometric.sides[k].samples||s.edges!==geometric.sides[k].edges)))return false;
  if(!groupValid(v.frameGroup,m,g.box,w,h)||!groupValid(v.peerGroup,m,g.box,w,h)||v.frameGroup.axis!==v.peerGroup.axis||Math.abs(v.frameGroup.k-v.peerGroup.k)>2)return false;
  return g.pixels===v.pixels&&same(g.box,v.box)&&g.pixels>=w*h*.025&&g.pixels<=w*h*.40&&g.pixels/((x1-x0)*(y1-y0))>=.80&&same(rings,v.pixelContours)&&same(p._contours,rings.map(q=>q.map(([x,y])=>({x:x/w,y:y/h}))))&&same([p.x,p.y,p.w,p.h],[x0/w,y0/h,(x1-x0)/w,(y1-y0)/h])&&PanelContextCells.contentEvidence.signatureValid(v.content,g.pixels);
 }catch(_){return false;}}
 function supplementImage(img,prior,log){const W=img.naturalWidth||img.width,H=img.naturalHeight||img.height;if(!W||!H||W*H>24000000)return[];let c;try{c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d',{willReadFrequently:true});if(!g)return[];g.drawImage(img,0,0);const s=Math.min(1,900/Math.max(W,H)),w=Math.round(W*s),h=Math.round(H*s);return analyzeRGBA(PanelMatteCells.sampleBilinearRGBA(g.getImageData(0,0,W,H).data,W,H,w,h),w,h,prior,log);}finally{if(c)c.width=c.height=1;}}
 function bind(){if(typeof PanelStructuralGrid!=='undefined'&&!PanelStructuralGrid._connectedPairs){const old=PanelStructuralGrid.validPanel;PanelStructuralGrid.validPanel=p=>p?._structuralGridProof?.version===VERSION?validPanel(p):old(p);PanelStructuralGrid._connectedPairs=true;}if(typeof PanelGeometry!=='undefined'&&!PanelGeometry._connectedPairs){const old=PanelGeometry.refine;PanelGeometry.refine=async function(url,p,log){return validPanel(p)?{...p}:old.call(this,url,p,log);};PanelGeometry._connectedPairs=true;}if(typeof PanelEdgeSpill!=='undefined'&&!PanelEdgeSpill._connectedPairs){for(const name of['analyzeImage','analyzeRGBA']){const old=PanelEdgeSpill[name];if(typeof old==='function')PanelEdgeSpill[name]=function(...args){return validPanel(args[name==='analyzeImage'?1:3])?null:old.apply(this,args);};}PanelEdgeSpill._connectedPairs=true;}}
 function install(detector){bind();if(!detector||detector._connectedPairs)return;const old=detector.detect;detector.detect=async function(url,log){const prior=await old.call(this,url,log);try{const img=new Image();img.src=url;await img.decode();const add=supplementImage(img,prior,log);return add.length?prior.concat(add):prior;}catch(e){log?.('connected pairs deferred: '+e.message);return prior;}};detector._connectedPairs=true;}
 return{analyzeRGBA,supplementImage,validPanel,install,boundary,boundaryValid,pairEvidence};
})();
if(typeof PanelDetect!=='undefined')PanelConnectedPairs.install(PanelDetect);
if(typeof module!=='undefined')module.exports=PanelConnectedPairs;
