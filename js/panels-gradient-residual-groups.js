/* Recover the unresolved remainder of a broad independently enclosed source
 * region. Two local-gradient exterior floods must agree. Earlier proven
 * source masks are subtracted exactly; small decorative residuals are rejected.
 * Group completeness is reviewed separately from original-frame credit. */
const PanelGradientResidualGroups=(()=>{
 'use strict';
 const VERSION=60,METHOD='independent-gradient-residual-group',E=()=>PanelLocalBoundaryConsensus.pixelEvidence,same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),cache=new WeakMap();
 const areaRing=q=>q.reduce((s,a,i)=>{const b=q[(i+1)%q.length];return s+a[0]*b[1]-b[0]*a[1];},0)/2;
  function trace(labels,w,h,id){
    const edges=[],next=new Map(),stride=w+1;
    const add=(x,y,X,Y,dir)=>{const a=y*stride+x,b=Y*stride+X,key=edges.length;edges.push({a,b,dir});if(!next.has(a))next.set(a,[]);next.get(a).push(key);};
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x;if(labels[i]!==id)continue;
      if(!y||labels[i-w]!==id)add(x,y,x+1,y,0);if(x+1===w||labels[i+1]!==id)add(x+1,y,x+1,y+1,1);
      if(y+1===h||labels[i+w]!==id)add(x+1,y+1,x,y+1,2);if(!x||labels[i-1]!==id)add(x,y+1,x,y,3);
    }
    if(!edges.length||edges.length>120000)return null;const used=new Uint8Array(edges.length),rings=[];
    for(let seed=0;seed<edges.length;seed++)if(!used[seed]){
      let at=seed;const pts=[];
      for(let steps=0;steps<=edges.length;steps++){
        if(used[at])return null;const e=edges[at];used[at]=1;pts.push([e.a%stride,e.a/stride|0]);if(e.b===edges[seed].a)break;
        const opts=(next.get(e.b)||[]).filter(k=>!used[k]);if(!opts.length)return null;
        const rank=k=>{const d=(edges[k].dir-e.dir+4)%4;return d===1?0:d===0?1:d===3?2:3;};opts.sort((a,b)=>rank(a)-rank(b));at=opts[0];
      }
      const q=pts.filter((p,i)=>{const a=pts[(i+pts.length-1)%pts.length],b=pts[(i+1)%pts.length];return (p[0]-a[0])*(b[1]-p[1])!==(p[1]-a[1])*(b[0]-p[0]);});
      if(q.length<4||q.length>20000||!areaRing(q))return null;rings.push(q);if(rings.length>128)return null;
    }return rings.sort((a,b)=>Math.abs(areaRing(b))-Math.abs(areaRing(a)));
  }

 function freeze(v){if(v&&typeof v==='object'&&!Object.isFrozen(v)){for(const q of Object.values(v))freeze(q);Object.freeze(v);}return v;}
 function dims(w,h){return Number.isInteger(w)&&Number.isInteger(h)&&w>=350&&h>=350&&w<=900&&h<=900&&h>=w*.7&&h<=w*1.8;}
 function encode(m){const out=[];for(let i=0;i<m.length;){if(!m[i]){i++;continue;}const a=i;while(i<m.length&&m[i])i++;out.push(a,i);}return out;}
 function decode(r,w,h){if(!Array.isArray(r)||r.length%2||r.length>100000)return null;const m=new Uint8Array(w*h);let last=-1;for(let k=0;k<r.length;k+=2){const a=r[k],b=r[k+1];if(!Number.isInteger(a)||!Number.isInteger(b)||a<0||a>=b||b>m.length||a<=last)return null;m.fill(1,a,b);last=b;}return m;}
 function components(mask,w,h){const ids=new Int32Array(w*h),q=new Int32Array(w*h),items=[];let id=0;for(let seed=0;seed<mask.length;seed++)if(mask[seed]&&!ids[seed]){let n=1,head=0,x0=w,y0=h,x1=0,y1=0;q[0]=seed;ids[seed]=++id;while(head<n){const i=q[head++],x=i%w,y=i/w|0;x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x+1);y1=Math.max(y1,y+1);for(const j of[x?i-1:-1,x+1<w?i+1:-1,i>=w?i-w:-1,i+w<mask.length?i+w:-1])if(j>=0&&mask[j]&&!ids[j]){ids[j]=id;q[n++]=j;}}items.push({id,pixels:n,box:[x0,y0,x1,y1]});}return{ids,items};}
 function broad(g,w,h){const[x0,y0,x1,y1]=g.box;return x1-x0>=w*.90&&y1-y0>=h*.65&&g.pixels>=w*h*.55&&g.pixels<=w*h*.80;}
 function boundaryOK(b){return b?.sides?.length===4&&b.sides.every(s=>Number.isInteger(s.samples)&&s.samples>=60&&Number.isInteger(s.exterior)&&s.exterior>=s.samples*.97&&s.exterior<=s.samples&&Number.isInteger(s.contrast)&&s.contrast>=s.samples*.70&&s.contrast<=s.exterior);}
 function remainder(A,B,w,h,prior){
  const g=E().extent(A,w,h),difference=A.reduce((s,v,i)=>s+ +(v!==B[i]),0);if(!broad(g,w,h)||difference>Math.max(8,g.pixels*.002))return null;const mask=A.map((v,i)=>+(v||B[i])),occupied=new Uint8Array(w*h);
  for(const p of prior){if(!PanelGeometryOrthogonal._provenContours(p))return null;const m=PanelLocalBoundaryConsensus.raster(p,w,h);for(let i=0;i<m.length;i++)occupied[i]|=m[i];}
  for(let i=0;i<mask.length;i++)if(occupied[i])mask[i]=0;
  const novelty=mask.reduce((s,v)=>s+v,0);if(novelty<g.pixels*.35)return null;
  const C=components(mask,w,h),kept=C.items.filter(q=>q.pixels>=w*h*.02&&q.box[2]-q.box[0]>=w*.10&&q.box[3]-q.box[1]>=h*.18);if(!kept.length||kept.length>8)return null;const accepted=new Set(kept.map(q=>q.id));for(let i=0;i<mask.length;i++)mask[i]=+(accepted.has(C.ids[i]));const final=E().extent(mask,w,h);if(final.pixels<w*h*.28||final.pixels>w*h*.70)return null;
  const rings=trace(mask,w,h,1);if(!rings||rings.length>32)return null;
  return{mask,g,final,difference,novelty,rings,components:kept.map(q=>({pixels:q.pixels,box:q.box})),contours:rings.map(q=>q.map(([x,y])=>({x:x/w,y:y/h})))};
 }
 function construct(v,c,w,h){const[x0,y0,x1,y1]=c.final.box;return{x:x0/w,y:y0/h,w:(x1-x0)/w,h:(y1-y0)/h,_identitySource:'structural-grid-frame',_geometryOwner:'structural-grid-contours',_geometryType:'gradient-residual-group',_contours:c.contours,_structuralGridProof:v};}
 function validPanel(p){const v=p?._structuralGridProof,hit=v&&cache.get(v);if(hit&&p._contours===hit.contours)return p._identitySource==='structural-grid-frame'&&p._geometryOwner==='structural-grid-contours'&&p._geometryType==='gradient-residual-group'&&!p._quad&&!p._outline&&same([p.x,p.y,p.w,p.h],hit.box);try{const w=v?.analysisWidth,h=v?.analysisHeight;if(!dims(w,h)||v.version!==VERSION||v.method!==METHOD||v.connected!==true||!same(v.thresholds,[12,14])||!Array.isArray(v.exclusions)||!v.exclusions.length||v.exclusions.length>24||v.originalOwnerOverlap!==0||!boundaryOK(v.boundary)||!PanelContextCells.contentEvidence.signatureValid(v.content,v.pixels))return false;
  const A=decode(v.first,w,h),B=decode(v.second,w,h);if(!A||!B)return false;const c=remainder(A,B,w,h,v.exclusions);if(!c||v.difference!==c.difference||v.novelty!==c.novelty||v.pixels!==c.final.pixels||!same(v.box,c.final.box)||!same(v.enclosureBox,c.g.box)||!same(v.components,c.components)||!same(v.pixelContours,c.rings))return false;
  const blank=new Uint8ClampedArray(w*h*4),front=PanelSmoothGutterBoundaries.boundary(A,blank,new Uint8Array(w*h),w,h);if(!same(front.sides.map(q=>q.samples),v.boundary.sides.map(q=>q.samples)))return false;
  const expected=construct(v,c,w,h);if(p._quad||p._outline||p._identitySource!==expected._identitySource||p._geometryOwner!==expected._geometryOwner||p._geometryType!==expected._geometryType||!same(p._contours,expected._contours)||!same([p.x,p.y,p.w,p.h],[expected.x,expected.y,expected.w,expected.h]))return false;freeze(v);freeze(p._contours);cache.set(v,{contours:p._contours,box:[p.x,p.y,p.w,p.h]});return true;}catch(_){return false;}}
 function analyzeRGBA(rgba,w,h,prior=[],log){
  if(!dims(w,h)||rgba?.length!==w*h*4||!Array.isArray(prior)||!prior.length||prior.length>24||prior.some(p=>!PanelGeometryOrthogonal._provenContours(p)))return[];for(let i=3;i<rgba.length;i+=4)if(rgba[i]!==255)return[];
  const G=PanelSmoothGutterBoundaries,sets=[12,14].map(t=>{const ext=G.exterior(rgba,w,h,t),C=components(ext.mask.map(v=>1-v),w,h);return{ext,C,items:C.items.filter(q=>broad(q,w,h))};});if(sets.some(s=>!s.items.length))return[];const out=[];
  for(const a of sets[0].items){const matches=sets[1].items.filter(b=>b.box.every((v,k)=>Math.abs(v-a.box[k])<=2));if(matches.length!==1)continue;const A=G.filled(sets[0].C.ids,a.id,w,h),B=G.filled(sets[1].C.ids,matches[0].id,w,h),c=remainder(A,B,w,h,prior);if(!c)continue;const boundary=G.boundary(A,rgba,sets[0].ext.mask,w,h);if(!boundaryOK(boundary))continue;const content=PanelContextCells.contentEvidence.signature(c.mask,rgba);if(!PanelContextCells.contentEvidence.signatureValid(content,c.final.pixels))continue;
   const v={version:VERSION,method:METHOD,connected:true,analysisWidth:w,analysisHeight:h,thresholds:[12,14],first:encode(A),second:encode(B),exclusions:prior.slice(),difference:c.difference,novelty:c.novelty,pixels:c.final.pixels,box:c.final.box,enclosureBox:c.g.box,components:c.components,pixelContours:c.rings,boundary,content,originalOwnerOverlap:0},p=construct(v,c,w,h);if(validPanel(p))out.push(p);
  }if(out.length>1)return[];if(out.length)log?.('gradient remainder: independent closed source region, earlier owners subtracted');return out;
 }
 function supplementImage(img,prior,log){const W=img.naturalWidth||img.width,H=img.naturalHeight||img.height;if(!W||!H||W*H>24000000||!prior?.length)return[];let c;try{c=document.createElement('canvas');c.width=W;c.height=H;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0);const s=Math.min(1,900/Math.max(W,H)),w=Math.round(W*s),h=Math.round(H*s);return analyzeRGBA(PanelMatteCells.sampleBilinearRGBA(ctx.getImageData(0,0,W,H).data,W,H,w,h),w,h,prior,log);}finally{if(c)c.width=c.height=1;}}
 function morph(src,w,h,r,grow){const tmp=new Uint8Array(src.length),out=new Uint8Array(src.length),n=2*r+1;for(let y=0;y<h;y++){let sum=0;for(let x=-r;x<w+r;x++){const add=x+r,del=x-r-1;if(add>=0&&add<w)sum+=src[y*w+add];if(del>=0&&del<w)sum-=src[y*w+del];if(x>=0&&x<w)tmp[y*w+x]=grow?+(sum>0):+(sum===n);}}for(let x=0;x<w;x++){let sum=0;for(let y=-r;y<h+r;y++){const add=y+r,del=y-r-1;if(add>=0&&add<h)sum+=tmp[add*w+x];if(del>=0&&del<h)sum-=tmp[del*w+x];if(y>=0&&y<h)out[y*w+x]=grow?+(sum>0):+(sum===n);}}return out;}
 function grow(m,w,h){const out=m.slice();for(let i=0;i<m.length;i++)if(m[i]){const x=i%w,y=i/w|0;if(x)out[i-1]=1;if(x+1<w)out[i+1]=1;if(y)out[i-w]=1;if(y+1<h)out[i+w]=1;}return out;}
 function frontier(m,w,h){const out=[];for(let i=0;i<m.length;i++)if(m[i]){const x=i%w,y=i/w|0;if(x&&x<w-1&&y&&y<h-1&&(!m[i-1]||!m[i+1]||!m[i-w]||!m[i+w]))out.push(i);}return out;}
 function speechTail(mask,w,h,box,radius){
  const [x0,y0,x1,y1]=box,pad=14,W=x1-x0+2*pad,H=y1-y0+2*pad,local=new Uint8Array(W*H);
  for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)local[(y-y0+pad)*W+x-x0+pad]=mask[y*w+x];
  const opened=morph(morph(local,W,H,radius,false),W,H,radius,true);if(!opened.some(Boolean))return null;
  const dist=Uint16Array.from(opened,v=>v?0:60000),diff=local.map((v,i)=>+(v&&!opened[i]));
  for(let i=0;i<dist.length;i++){const x=i%W,y=i/W|0;if(x)dist[i]=Math.min(dist[i],dist[i-1]+1);if(y)dist[i]=Math.min(dist[i],dist[i-W]+1);}
  for(let i=dist.length-1;i>=0;i--){const x=i%W,y=i/W|0;if(x+1<W)dist[i]=Math.min(dist[i],dist[i+1]+1);if(y+1<H)dist[i]=Math.min(dist[i],dist[i+W]+1);}
  const seen=new Uint8Array(diff.length),parts=[];
  for(let seed=0;seed<diff.length;seed++)if(diff[seed]&&!seen[seed]){const q=[seed];seen[seed]=1;let max=0;for(let at=0;at<q.length;at++){const i=q[at],x=i%W,y=i/W|0;max=Math.max(max,dist[i]);for(const j of[x?i-1:-1,x+1<W?i+1:-1,y?i-W:-1,y+1<H?i+W:-1])if(j>=0&&diff[j]&&!seen[j]){seen[j]=1;q.push(j);}}if(max>=6){const tips=q.filter(i=>dist[i]>=max-1).map(i=>((i/W|0)+y0-pad)*w+i%W+x0-pad).sort((a,b)=>a-b);parts.push({radius,pixels:q.length,length:max,tips});}}
  return parts.length===1&&parts[0].length<=60&&parts[0].tips.length>=3&&parts[0].tips.length<=20?parts[0]:null;
 }
 function displayBodies(rgba,w,h,owners){
  if(!dims(w,h)||rgba?.length!==w*h*4||!Array.isArray(owners)||!owners.some(validPanel))return[];for(let i=3;i<rgba.length;i+=4)if(rgba[i]!==255)return[];
  const masks=owners.map(p=>PanelLocalBoundaryConsensus.raster(p,w,h)),white=t=>Uint8Array.from({length:w*h},(_,i)=>+(Math.min(rgba[4*i],rgba[4*i+1],rgba[4*i+2])>t&&Math.max(rgba[4*i],rgba[4*i+1],rgba[4*i+2])-Math.min(rgba[4*i],rgba[4*i+1],rgba[4*i+2])<40)),sets=[190,210].map(t=>PanelColoredRims.whiteBodies(white(t),w,h)?.items||[]),paper=white(190),out=[];
  for(const body of sets[0]){const n=body.indices.length,[x0,y0,x1,y1]=body.box;if(n<1000||n>w*h*.035||x0<3||y0<3||x1>w-3||y1>h-3||n/((x1-x0)*(y1-y0))<.48)continue;const mask=new Uint8Array(w*h);for(const i of body.indices)mask[i]=1;
   const matches=sets[1].filter(b=>b.box.every((v,k)=>Math.abs(v-body.box[k])<=1)&&Math.abs(b.indices.length-n)<=n*.01&&b.indices.reduce((s,i)=>s+mask[i],0)>=n*.99);if(matches.length!==1)continue;
   const tails=[4,6].map(r=>speechTail(mask,w,h,body.box,r));if(tails.some(t=>!t||t.pixels>n*.08)||!same(tails[0].tips,tails[1].tips))continue;
   const hits=masks.map(m=>body.indices.reduce((s,i)=>s+m[i],0)),tips=masks.map(m=>tails[0].tips.reduce((s,i)=>s+m[i],0)),k=tips.indexOf(tails[0].tips.length);if(k<0||!validPanel(owners[k])||tips.some((v,j)=>j!==k&&v)||hits[k]<n*.35||hits[k]>n*.85)continue;
   const tipMask=new Uint8Array(w*h);for(const i of tails[0].tips)tipMask[i]=1;const collars=[3,5].map(r=>{const c=morph(tipMask,w,h,r,true).map((v,i)=>+(v&&!mask[i]));return{samples:c.reduce((s,v)=>s+v,0),hits:masks.map(m=>m.reduce((s,v,i)=>s+ +(v&&c[i]),0))};});if(collars.some(c=>c.samples<20||c.hits[k]<c.samples*.90||c.hits.some((v,j)=>j!==k&&v>c.samples*.02)))continue;
   const v=owners[k]._structuralGridProof,A=decode(v.first,w,h),B=decode(v.second,w,h);if([A,B].some(m=>body.indices.reduce((s,i)=>s+m[i],0)<n*.99))continue;
   let ink=0,edges=0,pap=0,dark=0;for(const i of body.indices){pap+=paper[i];dark+=+(Math.max(rgba[4*i],rgba[4*i+1],rgba[4*i+2])<100);if(!mask[i-1]||!mask[i+1]||!mask[i-w]||!mask[i+w]){edges++;const x=i%w,y=i/w|0;let lo=255;for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const j=4*((y+dy)*w+x+dx);lo=Math.min(lo,.299*rgba[j]+.587*rgba[j+1]+.114*rgba[j+2]);}ink+=+(lo<90);}}
   if(ink<edges*.90||pap<n*.60||pap>n*.95||dark<n*.05||dark>n*.35)continue;
   out.push({owner:k,indices:body.indices,box:body.box,tails,hits,collars,ink,edges,paperRatio:pap/n,darkRatio:dark/n});
  }return out;
 }
 function installReader(reader){if(!reader||reader._gradientResidualReader)return;const old=reader.displayPanelContours;reader.displayPanelContours=function(p,contours=this.panelContours(p)){
  const owners=this.currentPanels;if(!owners?.some(validPanel))return old.call(this,p,contours);const img=this.getPanelImageContext()?.img;let state=this._gradientResidualDisplay;if(!state||state.owners!==owners||state.img!==img){state=this._gradientResidualDisplay={owners,img,prior:owners.filter(q=>!validPanel(q)),added:owners.filter(validPanel),before:new WeakMap(),cache:new WeakMap(),extended:new WeakSet(),bodies:[]};const v=state.added[0]._structuralGridProof;state.w=v.analysisWidth;state.h=v.analysisHeight;state.masks=state.added.map(q=>PanelLocalBoundaryConsensus.raster(q,state.w,state.h));this.currentPanels=state.prior;try{for(const peer of state.prior)state.before.set(peer,old.call(this,peer,this.panelContours(peer)));}finally{this.currentPanels=owners;}
   if(img)try{const W=img.naturalWidth||img.width,H=img.naturalHeight||img.height,c=document.createElement('canvas');c.width=W;c.height=H;try{const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(img,0,0);const rgba=PanelMatteCells.sampleBilinearRGBA(g.getImageData(0,0,W,H).data,W,H,state.w,state.h);state.bodies=displayBodies(rgba,state.w,state.h,owners);}finally{c.width=c.height=1;}}catch(_){/* Keep source ownership if speech evidence is unavailable. */}
  }
  if(state.cache.has(p))return state.cache.get(p);const k=state.added.indexOf(p),before=k<0?state.before.get(p):contours;if(!before)return contours;const m=PanelCropRepair.raster(before,state.w,state.h);if(k<0)for(const owned of state.masks)for(let i=0;i<m.length;i++)if(owned[i])m[i]=0;for(const body of state.bodies){if(p===owners[body.owner])state.extended.add(p);for(const i of body.indices)m[i]=+(p===owners[body.owner]);}const raw=trace(m,state.w,state.h,1),result=raw?.map(q=>q.map(([x,y])=>({x:x/state.w,y:y/state.h})))||before;state.cache.set(p,result);return result;
 };reader._gradientResidualReader=true;}
 function install(detector){if(typeof PanelStructuralGrid!=='undefined'&&!PanelStructuralGrid._gradientResidual){const old=PanelStructuralGrid.validPanel;PanelStructuralGrid.validPanel=p=>p?._structuralGridProof?.version===VERSION?validPanel(p):old(p);PanelStructuralGrid._gradientResidual=true;}if(typeof PanelGeometry!=='undefined'&&!PanelGeometry._gradientResidual){const old=PanelGeometry.refine;PanelGeometry.refine=async function(url,p,log){return validPanel(p)?{...p}:old.call(this,url,p,log);};PanelGeometry._gradientResidual=true;}if(typeof PanelEdgeSpill!=='undefined'&&!PanelEdgeSpill._gradientResidual){for(const name of['analyzeImage','analyzeRGBA']){const old=PanelEdgeSpill[name];if(typeof old==='function')PanelEdgeSpill[name]=function(...args){return validPanel(args[name==='analyzeImage'?1:3])?null:old.apply(this,args);};}PanelEdgeSpill._gradientResidual=true;}if(!detector||detector._gradientResidual)return;const old=detector.detect;detector.detect=async function(url,log){const prior=await old.call(this,url,log);try{const img=new Image();img.src=url;await img.decode();const out=supplementImage(img,prior,log);return out.length?prior.concat(out):prior;}catch(e){log?.('gradient remainder deferred: '+e.message);return prior;}};detector._gradientResidual=true;}
 return{analyzeRGBA,supplementImage,validPanel,install,installReader,trace,encode,decode,components,remainder,displayBodies,speechTail};
})();
if(typeof PanelDetect!=='undefined')PanelGradientResidualGroups.install(PanelDetect);
if(typeof module!=='undefined')module.exports=PanelGradientResidualGroups;
