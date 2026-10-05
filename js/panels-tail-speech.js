/* Complete a source-enclosed balloon crossing two proven ragged rows when
 * its unique thin speech tail belongs to the same owner at two opening scales.
 * Only balloon pixels move. All other artwork and the prior union survive.
 * Ambiguous tails, open bodies and non-row owners are deliberately deferred. */
const PanelTailSpeech=(()=>{
 'use strict';
 const VERSION=49,METHOD='dual-scale-tail-speech-owner',cache=new WeakMap(),same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 const raster=(q,w,h)=>PanelCropRepair.raster(q,w,h);
 function freeze(v){if(v&&typeof v==='object'&&!Object.isFrozen(v)){for(const q of Object.values(v))freeze(q);Object.freeze(v);}return v;}
 function dimensions(w,h){return Number.isInteger(w)&&Number.isInteger(h)&&w>=250&&h>=350&&w<=900&&h<=900;}
 function source(p,w,h){const v=p?._structuralGridProof;return v?.version===18&&p._geometryType==='ragged-gutter-cells'&&v.analysisWidth===w&&v.analysisHeight===h&&p.w>=.80&&p.h<=.35&&PanelStructuralGrid.validPanel(p);}
 function geometry(m,w,h){const g=PanelLocalBoundaryConsensus.pixelEvidence.extent(m,w,h),rings=PanelMatteCells.tracePixelContours(m,w,h,1);return rings?.length&&rings.length<=16?{...g,rings,contours:rings.map(q=>q.map(([x,y])=>({x:x/w,y:y/h})))}:null;}
 function morph(src,w,h,r,grow){const tmp=new Uint8Array(src.length),out=new Uint8Array(src.length),n=2*r+1;for(let y=0;y<h;y++){let sum=0;for(let x=-r;x<w+r;x++){const add=x+r,del=x-r-1;if(add>=0&&add<w)sum+=src[y*w+add];if(del>=0&&del<w)sum-=src[y*w+del];if(x>=0&&x<w)tmp[y*w+x]=grow?+(sum>0):+(sum===n);}}for(let x=0;x<w;x++){let sum=0;for(let y=-r;y<h+r;y++){const add=y+r,del=y-r-1;if(add>=0&&add<h)sum+=tmp[add*w+x];if(del>=0&&del<h)sum-=tmp[del*w+x];if(y>=0&&y<h)out[y*w+x]=grow?+(sum>0):+(sum===n);}}return out;}
 function grow(m,w,h){const out=m.slice();for(let i=0;i<m.length;i++)if(m[i]){const x=i%w,y=i/w|0;if(x)out[i-1]=1;if(x+1<w)out[i+1]=1;if(y)out[i-w]=1;if(y+1<h)out[i+w]=1;}return out;}
 function frontier(m,w,h){const out=[];for(let i=0;i<m.length;i++)if(m[i]){const x=i%w,y=i/w|0;if(x&&x<w-1&&y&&y<h-1&&(!m[i-1]||!m[i+1]||!m[i-w]||!m[i+w]))out.push(i);}return out;}
 function tail(mask,w,h,box,radius){
  const [x0,y0,x1,y1]=box,pad=14,W=x1-x0+2*pad,H=y1-y0+2*pad,local=new Uint8Array(W*H);
  for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)local[(y-y0+pad)*W+x-x0+pad]=mask[y*w+x];
  const opened=morph(morph(local,W,H,radius,false),W,H,radius,true);if(!opened.some(Boolean))return null;
  const dist=Uint16Array.from(opened,v=>v?0:60000),diff=local.map((v,i)=>+(v&&!opened[i]));
  for(let i=0;i<dist.length;i++){const x=i%W,y=i/W|0;if(x)dist[i]=Math.min(dist[i],dist[i-1]+1);if(y)dist[i]=Math.min(dist[i],dist[i-W]+1);}
  for(let i=dist.length-1;i>=0;i--){const x=i%W,y=i/W|0;if(x+1<W)dist[i]=Math.min(dist[i],dist[i+1]+1);if(y+1<H)dist[i]=Math.min(dist[i],dist[i+W]+1);}
  const seen=new Uint8Array(diff.length),parts=[];
  for(let seed=0;seed<diff.length;seed++)if(diff[seed]&&!seen[seed]){const q=[seed];seen[seed]=1;let max=0;for(let at=0;at<q.length;at++){const i=q[at],x=i%W,y=i/W|0;max=Math.max(max,dist[i]);for(const j of[x?i-1:-1,x+1<W?i+1:-1,y?i-W:-1,y+1<H?i+W:-1])if(j>=0&&diff[j]&&!seen[j]){seen[j]=1;q.push(j);}}if(max>=12){const tips=q.filter(i=>dist[i]>=max-1).map(i=>((i/W|0)+y0-pad)*w+i%W+x0-pad).sort((a,b)=>a-b);parts.push({radius,pixels:q.length,length:max,tips});}}
  return parts.length===1&&parts[0].length<=60&&parts[0].tips.length>=3&&parts[0].tips.length<=20?parts[0]:null;
 }
 function evidence(mask,w,h,parents){
  const g=geometry(mask,w,h);if(!g||g.rings.length!==1||g.pixels<1000||g.pixels>w*h*.065||g.box[0]<3||g.box[1]<3||g.box[2]>w-3||g.box[3]>h-3)return null;
  const bw=g.box[2]-g.box[0],bh=g.box[3]-g.box[1];if(g.pixels/(bw*bh)<.48||bw/bh>8||bh/bw>8)return null;
  const ar=[4,6].map(r=>tail(mask,w,h,g.box,r));if(ar.some(t=>!t)||!same(ar[0].tips,ar[1].tips)||ar.some(t=>t.pixels>g.pixels*.08))return null;
  const near=grow(grow(grow(mask,w,h),w,h),w,h),collar=near.map((v,i)=>+(v&&!mask[i])),samples=collar.reduce((s,v)=>s+v,0),edges=frontier(mask,w,h),masks=parents.map(p=>raster(PanelGeometryOrthogonal._provenContours(p),w,h));
  const hits=masks.map(m=>m.reduce((s,v,i)=>s+ +(v&&mask[i]),0)),collarHits=masks.map(m=>m.reduce((s,v,i)=>s+ +(v&&collar[i]),0)),tipHits=masks.map(m=>ar[0].tips.reduce((s,i)=>s+m[i],0)),owner=tipHits.indexOf(ar[0].tips.length);
  if(owner<0||tipHits.some((n,k)=>k!==owner&&n)||hits[owner]<g.pixels*.35||hits[owner]>g.pixels*.85||collarHits[owner]<samples*.40||!source(parents[owner],w,h))return null;
  const members=hits.map((n,k)=>k).filter(k=>hits[k]||collarHits[k]);if(members.length!==2||members.some(k=>!source(parents[k],w,h)))return null;
  const a=parents[members[0]],b=parents[members[1]];if(Math.abs(a.x-b.x)>.06||Math.abs(a.w-b.w)>.06||Math.min(Math.abs(a.y+a.h-b.y),Math.abs(b.y+b.h-a.y))>.10)return null;
  return{g,ar,masks,hits,collarHits,tipHits,owner,samples,edges,members};
 }
 function assignment(body,w,h){
  if(!body||!Array.isArray(body.parents)||body.parents.length!==2||body.parents.some(p=>!source(p,w,h))||!Array.isArray(body.contours)||body.contours.length!==1)return null;
  const mask=raster(body.contours,w,h),e=evidence(mask,w,h,body.parents);if(!e||!same(body.contours,e.g.contours)||!same(body.box,e.g.box)||body.pixels!==e.g.pixels||body.owner!==e.owner||!same(body.tails,e.ar)||!same(body.hits,e.hits)||!same(body.collarHits,e.collarHits)||!same(body.tipHits,e.tipHits)||body.collarSamples!==e.samples||body.inkSamples!==e.edges.length||!Number.isInteger(body.ink)||body.ink<e.edges.length*.90||body.ink>e.edges.length||!Number.isFinite(body.paperRatio)||body.paperRatio<.60||body.paperRatio>.95||!Number.isFinite(body.darkRatio)||body.darkRatio<.05||body.darkRatio>.35)return null;
  return{mask,e};
 }
 function validPanel(p){const v=p?._structuralGridProof,entry=v&&cache.get(v);if(entry&&p._contours===entry.contours)return p._identitySource==='structural-grid-frame'&&p._geometryOwner==='structural-grid-contours'&&p._geometryType==='tail-speech-owner'&&!p._quad&&!p._outline&&same([p.x,p.y,p.w,p.h],entry.box);try{const w=v?.analysisWidth,h=v?.analysisHeight;if(v?.version!==VERSION||v.method!==METHOD||v.connected!==true||!dimensions(w,h)||!Array.isArray(v.bodies)||v.bodies.length!==1||!source(v.parent,w,h))return false;
  const a=assignment(v.bodies[0],w,h);if(!a)return false;const k=v.bodies[0].parents.findIndex(q=>same(q,v.parent));if(k<0)return false;const mask=raster(PanelGeometryOrthogonal._provenContours(v.parent),w,h);for(let i=0;i<mask.length;i++)if(a.mask[i])mask[i]=+(k===a.e.owner);const g=geometry(mask,w,h);if(!g||!same(g.box,v.box)||g.pixels!==v.pixels||!same(g.rings,v.pixelContours)||!same(p._contours,g.contours))return false;const[x0,y0,x1,y1]=g.box;if(p._identitySource!=='structural-grid-frame'||p._geometryOwner!=='structural-grid-contours'||p._geometryType!=='tail-speech-owner'||p._quad||p._outline||!same([p.x,p.y,p.w,p.h],[x0/w,y0/h,(x1-x0)/w,(y1-y0)/h]))return false;
  freeze(v);freeze(p._contours);cache.set(v,{contours:p._contours,box:[p.x,p.y,p.w,p.h]});return true;
 }catch(_){return false;}}
 function analyzeRGBA(rgba,w,h,prior=[],log){
  if(!dimensions(w,h)||rgba?.length!==w*h*4||!Array.isArray(prior)||prior.length<2||prior.length>24||prior.some(p=>p?._structuralGridProof?.version===VERSION)||!prior.some(p=>source(p,w,h)))return prior;for(let i=3;i<rgba.length;i+=4)if(rgba[i]!==255)return prior;
  const contours=prior.map(p=>PanelGeometryOrthogonal._provenContours(p));if(contours.some(q=>!q))return prior;
  const white=Uint8Array.from({length:w*h},(_,i)=>+(Math.min(rgba[i*4],rgba[i*4+1],rgba[i*4+2])>190&&Math.max(rgba[i*4],rgba[i*4+1],rgba[i*4+2])-Math.min(rgba[i*4],rgba[i*4+1],rgba[i*4+2])<40)),bodies=PanelColoredRims.whiteBodies(white,w,h);
  for(const b of bodies?.items||[]){if(b.pixels<1000||b.pixels>w*h*.065||b.pixels/((b.box[2]-b.box[0])*(b.box[3]-b.box[1]))<.48)continue;const mask=new Uint8Array(w*h);for(const i of b.indices)mask[i]=1;
   const e=evidence(mask,w,h,prior);if(!e)continue;let ink=0,paper=0,dark=0;for(const i of e.edges){let lo=255;const x=i%w,y=i/w|0;for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const X=x+dx,Y=y+dy;if(X<0||Y<0||X>=w||Y>=h)continue;const j=4*(Y*w+X);lo=Math.min(lo,.299*rgba[j]+.587*rgba[j+1]+.114*rgba[j+2]);}ink+=lo<90;}for(const i of b.indices){paper+=white[i];dark+=Math.max(rgba[4*i],rgba[4*i+1],rgba[4*i+2])<100;}
   const body={contours:e.g.contours,box:e.g.box,pixels:e.g.pixels,parents:e.members.map(k=>prior[k]),owner:e.members.indexOf(e.owner),tails:e.ar,hits:e.members.map(k=>e.hits[k]),collarHits:e.members.map(k=>e.collarHits[k]),tipHits:e.members.map(k=>e.tipHits[k]),collarSamples:e.samples,inkSamples:e.edges.length,ink,paperRatio:paper/e.g.pixels,darkRatio:dark/e.g.pixels};if(!assignment(body,w,h))continue;
   const out=prior.map((p,k)=>{const local=e.members.indexOf(k);if(local<0)return p;const m=e.masks[k].slice();for(let i=0;i<m.length;i++)if(mask[i])m[i]=+(k===e.owner);const g=geometry(m,w,h);if(!g)return null;const[x0,y0,x1,y1]=g.box;return{x:x0/w,y:y0/h,w:(x1-x0)/w,h:(y1-y0)/h,_identitySource:'structural-grid-frame',_geometryOwner:'structural-grid-contours',_geometryType:'tail-speech-owner',_contours:g.contours,_structuralGridProof:{version:VERSION,method:METHOD,connected:true,analysisWidth:w,analysisHeight:h,parent:p,bodies:[body],box:g.box,pixels:g.pixels,pixelContours:g.rings}};});
   if(out.some((p,k)=>e.members.includes(k)&&!validPanel(p)))continue;log?.('tail speech: one complete body assigned at two tail scales');return out;
  }return prior;
 }
 function supplementImage(img,prior,log){if(!prior?.some(p=>source(p,p._structuralGridProof?.analysisWidth,p._structuralGridProof?.analysisHeight)))return prior;const W=img.naturalWidth||img.width,H=img.naturalHeight||img.height;if(!W||!H||W*H>24000000)return prior;let c;try{c=document.createElement('canvas');c.width=W;c.height=H;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0);const s=Math.min(1,900/Math.max(W,H)),w=Math.round(W*s),h=Math.round(H*s);return analyzeRGBA(PanelMatteCells.sampleBilinearRGBA(ctx.getImageData(0,0,W,H).data,W,H,w,h),w,h,prior,log);}finally{if(c)c.width=c.height=1;}}
 function install(detector){if(typeof PanelStructuralGrid!=='undefined'&&!PanelStructuralGrid._tailSpeech){const old=PanelStructuralGrid.validPanel;PanelStructuralGrid.validPanel=p=>p?._structuralGridProof?.version===VERSION?validPanel(p):old(p);PanelStructuralGrid._tailSpeech=true;}if(typeof PanelGeometry!=='undefined'&&!PanelGeometry._tailSpeech){const old=PanelGeometry.refine;PanelGeometry.refine=async function(url,p,log){return validPanel(p)?{...p}:old.call(this,url,p,log);};PanelGeometry._tailSpeech=true;}if(typeof PanelEdgeSpill!=='undefined'&&!PanelEdgeSpill._tailSpeech){for(const name of['analyzeImage','analyzeRGBA']){const old=PanelEdgeSpill[name];if(typeof old==='function')PanelEdgeSpill[name]=function(...args){return validPanel(args[name==='analyzeImage'?1:3])?null:old.apply(this,args);};}PanelEdgeSpill._tailSpeech=true;}if(!detector||detector._tailSpeech)return;const old=detector.detect;detector.detect=async function(url,log){const prior=await old.call(this,url,log);try{const img=new Image();img.src=url;await img.decode();return supplementImage(img,prior,log);}catch(e){log?.('tail speech deferred: '+e.message);return prior;}};detector._tailSpeech=true;}
 // Compose the speech assignment over the parent's already repaired Reader
 // mask. Rerunning closing on the changed silhouette can otherwise change
 // unrelated edge pixels, even when discovery preserved them exactly.
 function installReader(reader){if(!reader||reader._tailSpeechInstalled)return;const old=reader.displayPanelContours;reader.displayPanelContours=function(p,contours=this.panelContours(p)){
  if(!validPanel(p))return old.call(this,p,contours);
  const owners=this.currentPanels,img=this.getPanelImageContext()?.img,entry=this._tailSpeechDisplay;
  if(!entry||entry.owners!==owners||entry.img!==img)this._tailSpeechDisplay={owners,img,cache:new WeakMap()};
  const cache=this._tailSpeechDisplay.cache;if(cache.has(p))return cache.get(p);
  const v=p._structuralGridProof,w=v.analysisWidth,h=v.analysisHeight,base=Object.create(this);
  base.currentPanels=(owners||[]).map(q=>validPanel(q)?q._structuralGridProof.parent:q);base._cropRepairCache=null;base._tailSpeechDisplay=null;
  const parent=old.call(base,v.parent,this.panelContours(v.parent)),mask=raster(parent,w,h);
  for(const b of v.bodies){const body=raster(b.contours,w,h),owner=same(b.parents[b.owner],v.parent);for(let i=0;i<mask.length;i++)if(body[i])mask[i]=+owner;}
  const g=geometry(mask,w,h),result=g?.contours||contours;freeze(result);cache.set(p,result);return result;
 };reader._tailSpeechInstalled=true;}
 return{analyzeRGBA,supplementImage,validPanel,install,installReader};
})();
if(typeof PanelDetect!=='undefined')PanelTailSpeech.install(PanelDetect);
if(typeof module!=='undefined')module.exports=PanelTailSpeech;
