/* Reader-only ownership of an enclosed balloon chain crossing two proven
 * adjacent columns. A short tail must agree at two opening scales and two
 * surrounding tip collars. A separate substantial-tail route additionally
 * requires one opened core and agreeing body collars. Only speech transfers. */
const PanelColumnSpeech=(()=>{
 'use strict';
 const raster=(q,w,h)=>PanelCropRepair.raster(q,w,h);
 function morph(src,w,h,r,grow){const tmp=new Uint8Array(src.length),out=new Uint8Array(src.length),n=2*r+1;for(let y=0;y<h;y++){let sum=0;for(let x=-r;x<w+r;x++){const add=x+r,del=x-r-1;if(add>=0&&add<w)sum+=src[y*w+add];if(del>=0&&del<w)sum-=src[y*w+del];if(x>=0&&x<w)tmp[y*w+x]=grow?+(sum>0):+(sum===n);}}for(let x=0;x<w;x++){let sum=0;for(let y=-r;y<h+r;y++){const add=y+r,del=y-r-1;if(add>=0&&add<h)sum+=tmp[add*w+x];if(del>=0&&del<h)sum-=tmp[del*w+x];if(y>=0&&y<h)out[y*w+x]=grow?+(sum>0):+(sum===n);}}return out;}
 function tail(mask,w,h,box,radius,strictCore=false){
  const [x0,y0,x1,y1]=box,pad=14,W=x1-x0+2*pad,H=y1-y0+2*pad,local=new Uint8Array(W*H);
  for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)local[(y-y0+pad)*W+x-x0+pad]=mask[y*w+x];
  const opened=morph(morph(local,W,H,radius,false),W,H,radius,true);if(!opened.some(Boolean)||strictCore&&components(opened,W,H).length!==1)return null;
  const dist=Uint16Array.from(opened,v=>v?0:60000),diff=local.map((v,i)=>+(v&&!opened[i]));
  for(let i=0;i<dist.length;i++){const x=i%W,y=i/W|0;if(x)dist[i]=Math.min(dist[i],dist[i-1]+1);if(y)dist[i]=Math.min(dist[i],dist[i-W]+1);}
  for(let i=dist.length-1;i>=0;i--){const x=i%W,y=i/W|0;if(x+1<W)dist[i]=Math.min(dist[i],dist[i+1]+1);if(y+1<H)dist[i]=Math.min(dist[i],dist[i+W]+1);}
  const seen=new Uint8Array(diff.length),parts=[];
  for(let seed=0;seed<diff.length;seed++)if(diff[seed]&&!seen[seed]){const q=[seed];seen[seed]=1;let max=0;for(let at=0;at<q.length;at++){const i=q[at],x=i%W,y=i/W|0;max=Math.max(max,dist[i]);for(const j of[x?i-1:-1,x+1<W?i+1:-1,y?i-W:-1,y+1<H?i+W:-1])if(j>=0&&diff[j]&&!seen[j]){seen[j]=1;q.push(j);}}if(max>=12){const tips=q.filter(i=>dist[i]>=max-1).map(i=>((i/W|0)+y0-pad)*w+i%W+x0-pad).sort((a,b)=>a-b);parts.push({radius,pixels:q.length,length:max,tips});}}
  return parts.length===1&&parts[0].length<=60&&parts[0].tips.length>=3&&parts[0].tips.length<=20?parts[0]:null;
 }

 function column(p,w,h){const v=p?._matteCellProof;return !!v&&v.analysisWidth===w&&v.analysisHeight===h&&p._geometryType==='edge-connected-matte-cell'&&p.w>=.15&&p.w<=.45&&p.h>=.28&&p.h<=.55&&!!PanelGeometryOrthogonal._provenContours(p);}
 function components(mask,w,h){const seen=new Uint8Array(mask.length),out=[];for(let seed=0;seed<mask.length;seed++)if(mask[seed]&&!seen[seed]){const q=[seed];seen[seed]=1;for(let k=0;k<q.length;k++){const i=q[k],x=i%w,y=i/w|0;for(const j of[x?i-1:-1,x+1<w?i+1:-1,y?i-w:-1,y+1<h?i+w:-1])if(j>=0&&mask[j]&&!seen[j]){seen[j]=1;q.push(j);}}out.push(q);}return out;}
 function analyze(rgba,w,h,parents=[],longTail=false){
  if(!Number.isInteger(w)||!Number.isInteger(h)||w<250||h<350||w>900||h>900||rgba?.length!==w*h*4||!Array.isArray(parents)||parents.length<2||parents.length>24||!parents.some(p=>column(p,w,h)))return [];for(let i=3;i<rgba.length;i+=4)if(rgba[i]!==255)return [];
  const rings=parents.map(p=>PanelGeometryOrthogonal._provenContours(p));if(rings.some(q=>!q))return [];
  const masks=rings.map(q=>raster(q,w,h)),white=Uint8Array.from({length:w*h},(_,i)=>+(Math.min(rgba[i*4],rgba[i*4+1],rgba[i*4+2])>190&&Math.max(rgba[i*4],rgba[i*4+1],rgba[i*4+2])-Math.min(rgba[i*4],rgba[i*4+1],rgba[i*4+2])<40)),out=[],used=new Uint8Array(w*h);
  for(const source of PanelColoredRims.whiteBodies(white,w,h)?.items||[]){const n=source.indices.length;if(n<1000||n>w*h*.04||source.indices.some(i=>used[i]))continue;
   const mask=new Uint8Array(w*h);for(const i of source.indices)mask[i]=1;const box=PanelLocalBoundaryConsensus.pixelEvidence.extent(mask,w,h).box,[x0,y0,x1,y1]=box,bw=x1-x0,bh=y1-y0;if(x0<3||y0<3||x1>w-3||y1>h-3||n/(bw*bh)<.48||bw/bh>4||bh/bw>4||PanelMatteCells.tracePixelContours(mask,w,h,1)?.length!==1)continue;
   const tails=[4,6].map(r=>tail(mask,w,h,box,r,longTail));if(tails.some(t=>!t||t.pixels>n*(longTail?.12:.05))||JSON.stringify(tails[0].tips)!==JSON.stringify(tails[1].tips))continue;
   // This separate route requires a substantial, bounded tail. The retained
   // short-tail route keeps its original limits and ownership witnesses.
   if(longTail&&(!tails.some(t=>t.pixels>n*.05)||tails.some(t=>t.length<w*.04||t.length>w*.12)))continue;
   const tips=tails[0].tips,tipHits=masks.map(m=>tips.reduce((s,i)=>s+m[i],0)),owner=tipHits.indexOf(tips.length);if(owner<0||tipHits.some((v,k)=>k!==owner&&v))continue;
   const near=morph(mask,w,h,3,true),collar=near.map((v,i)=>+(v&&!mask[i])),samples=collar.reduce((s,v)=>s+v,0),hits=masks.map(m=>source.indices.reduce((s,i)=>s+m[i],0)),collarHits=masks.map(m=>m.reduce((s,v,i)=>s+ +(v&&collar[i]),0)),members=hits.map((v,k)=>k).filter(k=>hits[k]||collarHits[k]);
   if(members.length!==2||members.some(k=>!column(parents[k],w,h)||hits[k]<n*.05||hits[k]>n*.85||collarHits[k]<samples*(longTail?.20:.30))||collarHits.reduce((s,v)=>s+v,0)<samples*(longTail?.75:.80))continue;
   let secondCollar=null;
   if(longTail){const c=morph(mask,w,h,5,true).map((v,i)=>+(v&&!mask[i]));secondCollar={samples:c.reduce((s,v)=>s+v,0),hits:masks.map(m=>m.reduce((s,v,i)=>s+ +(v&&c[i]),0))};if(members.some(k=>secondCollar.hits[k]<secondCollar.samples*.20)||secondCollar.hits.reduce((s,v)=>s+v,0)<secondCollar.samples*.75||secondCollar.hits.some((v,k)=>!members.includes(k)&&v))continue;}
   const a=parents[members[0]],b=parents[members[1]],p=parents[owner];if(Math.abs(a.y-b.y)>.05||Math.abs(a.y+a.h-b.y-b.h)>.08||Math.min(Math.abs(a.x+a.w-b.x),Math.abs(b.x+b.w-a.x))>.08||!(x0<p.x*w-6||x1>(p.x+p.w)*w+6))continue;
   const tipMask=new Uint8Array(w*h);for(const i of tips)tipMask[i]=1;const tipCollars=[3,5].map(r=>{const c=morph(tipMask,w,h,r,true).map((v,i)=>+(v&&!mask[i]));return{samples:c.reduce((s,v)=>s+v,0),hits:masks.map(m=>m.reduce((s,v,i)=>s+ +(v&&c[i]),0))};});if(tipCollars.some(c=>c.samples<20||c.hits[owner]<c.samples*.90||c.hits.some((v,k)=>k!==owner&&v>c.samples*.02)))continue;
   const inkMask=new Uint8Array(w*h);let paper=0,dark=0,edges=0,supported=0;for(const i of source.indices){paper+=white[i];if(Math.max(rgba[4*i],rgba[4*i+1],rgba[4*i+2])<100){dark++;inkMask[i]=1;}const x=i%w,y=i/w|0;if(!mask[i-1]||!mask[i+1]||!mask[i-w]||!mask[i+w]){edges++;let lo=255;for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const j=4*((y+dy)*w+x+dx);lo=Math.min(lo,.299*rgba[j]+.587*rgba[j+1]+.114*rgba[j+2]);}supported+=+(lo<90);}}
   const letters=components(inkMask,w,h).filter(q=>q.length>=3&&q.length<n*.08).length;if(paper/n<.60||paper/n>.95||dark/n<.05||dark/n>.35||supported/edges<.90||letters<8)continue;
   out.push({indices:source.indices,owner,members,tails,box,hits,collarHits,collarSamples:samples,tipHits,tipCollars,pixels:n,paperRatio:paper/n,darkRatio:dark/n,inkRatio:supported/edges,letters,...(longTail?{longTail:true,secondCollar}: {})});for(const i of source.indices)used[i]=1;
  }return out;
 }
 function installReader(reader){if(!reader||reader._columnSpeechInstalled)return;const old=reader.displayPanelContours;reader.displayPanelContours=function(p,contours=this.panelContours(p)){
  const owners=this.currentPanels,img=this.getPanelImageContext()?.img,v=p?._matteCellProof,w=v?.analysisWidth,h=v?.analysisHeight;if(!img||!column(p,w,h))return old.call(this,p,contours);
  let entry=this._columnSpeechDisplay;if(!entry||entry.owners!==owners||entry.img!==img||entry.w!==w||entry.h!==h){old.call(this,p,contours);const cached=this._cropRepairRaster;entry=this._columnSpeechDisplay={owners,img,w,h,cache:new WeakMap(),bodies:cached?.img===img&&cached.w===w&&cached.h===h?[...analyzeRGBA(cached.rgba,w,h,owners||[]),...analyzeTailRGBA(cached.rgba,w,h,owners||[])]:[]};}
  if(entry.cache.has(p))return entry.cache.get(p).contours;
  const before=old.call(this,p,contours),member=(owners||[]).indexOf(p),bodies=entry.bodies.filter(b=>b.members.includes(member));if(!bodies.length)return before;
  const mask=raster(before,w,h);let added=0,removed=0;for(const b of bodies)for(const i of b.indices){const take=+(b.owner===member);added+=+(!mask[i]&&take);removed+=+(mask[i]&&!take);mask[i]=take;}
  const traced=PanelMatteCells.tracePixelContours(mask,w,h,1),result=traced?.map(q=>q.map(([x,y])=>({x:x/w,y:y/h})))||before;entry.cache.set(p,{contours:result,extended:added>0,addedPixels:added,removedPixels:removed});return result;
 };reader._columnSpeechInstalled=true;}
 const analyzeRGBA=(rgba,w,h,parents=[])=>analyze(rgba,w,h,parents,false);
 const analyzeTailRGBA=(rgba,w,h,parents=[])=>analyze(rgba,w,h,parents,true);
 return{analyzeRGBA,analyzeTailRGBA,installReader};
})();
