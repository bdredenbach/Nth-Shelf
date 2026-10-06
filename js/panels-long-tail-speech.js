/* Reader-only completion of an enclosed balloon with a long, thin tail.
 * Two openings must identify the same long tail. Independent body collars
 * must agree on one strongly witnessed proven row owner.
 * Only the independently enclosed speech body moves; discovery is unchanged. */
const PanelLongTailSpeech=(()=>{
 'use strict';
 const raster=(q,w,h)=>PanelCropRepair.raster(q,w,h);
 function morph(src,w,h,r,grow){const tmp=new Uint8Array(src.length),out=new Uint8Array(src.length),n=2*r+1;for(let y=0;y<h;y++){let sum=0;for(let x=-r;x<w+r;x++){const add=x+r,del=x-r-1;if(add>=0&&add<w)sum+=src[y*w+add];if(del>=0&&del<w)sum-=src[y*w+del];if(x>=0&&x<w)tmp[y*w+x]=grow?+(sum>0):+(sum===n);}}for(let x=0;x<w;x++){let sum=0;for(let y=-r;y<h+r;y++){const add=y+r,del=y-r-1;if(add>=0&&add<h)sum+=tmp[add*w+x];if(del>=0&&del<h)sum-=tmp[del*w+x];if(y>=0&&y<h)out[y*w+x]=grow?+(sum>0):+(sum===n);}}return out;}
 function components(m,w,h){const seen=new Uint8Array(m.length),out=[];for(let seed=0;seed<m.length;seed++)if(m[seed]&&!seen[seed]){const q=[seed];seen[seed]=1;for(let k=0;k<q.length;k++){const i=q[k],x=i%w,y=i/w|0;for(const j of[x?i-1:-1,x+1<w?i+1:-1,y?i-w:-1,y+1<h?i+w:-1])if(j>=0&&m[j]&&!seen[j]){seen[j]=1;q.push(j);}}out.push(q);}return out;}
 function tail(mask,w,h,box,r){const[x0,y0,x1,y1]=box,pad=r+3,W=x1-x0+2*pad,H=y1-y0+2*pad,local=new Uint8Array(W*H);for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)local[(y-y0+pad)*W+x-x0+pad]=mask[y*w+x];
  const opened=morph(morph(local,W,H,r,false),W,H,r,true),core=components(opened,W,H);if(core.length!==1)return null;
  const dist=Uint16Array.from(opened,v=>v?0:60000),diff=local.map((v,i)=>+(v&&!opened[i]));for(let i=0;i<dist.length;i++){const x=i%W,y=i/W|0;if(x)dist[i]=Math.min(dist[i],dist[i-1]+1);if(y)dist[i]=Math.min(dist[i],dist[i-W]+1);}for(let i=dist.length-1;i>=0;i--){const x=i%W,y=i/W|0;if(x+1<W)dist[i]=Math.min(dist[i],dist[i+1]+1);if(y+1<H)dist[i]=Math.min(dist[i],dist[i+W]+1);}
  const parts=components(diff,W,H).map(q=>{const length=q.reduce((n,i)=>Math.max(n,dist[i]),0),tips=q.filter(i=>dist[i]>=length-1).map(i=>((i/W|0)+y0-pad)*w+i%W+x0-pad).sort((a,b)=>a-b);return{radius:r,pixels:q.length,length,tips};}).filter(q=>q.length>=Math.min(w,h)*.07);
  if(parts.length!==1||parts[0].length>w*.30||parts[0].tips.length<3||parts[0].tips.length>20)return null;return parts[0];
 }
 function row(p,w,h){const v=p?._matteCellProof;return !!v&&v.analysisWidth===w&&v.analysisHeight===h&&p._geometryType==='edge-connected-matte-cell'&&p.w>=.80&&p.h<=.35&&!!PanelGeometryOrthogonal._provenContours(p);}
 function analyzeRGBA(rgba,w,h,parents=[]){
  if(!Number.isInteger(w)||!Number.isInteger(h)||w<250||h<350||w>900||h>900||rgba?.length!==w*h*4||!Array.isArray(parents)||parents.length<2||parents.length>24||!parents.some(p=>row(p,w,h)))return [];for(let i=3;i<rgba.length;i+=4)if(rgba[i]!==255)return [];
  const rings=parents.map(p=>PanelGeometryOrthogonal._provenContours(p));if(rings.some(q=>!q))return [];
  const masks=rings.map(q=>raster(q,w,h)),white=Uint8Array.from({length:w*h},(_,i)=>+(Math.min(rgba[i*4],rgba[i*4+1],rgba[i*4+2])>190&&Math.max(rgba[i*4],rgba[i*4+1],rgba[i*4+2])-Math.min(rgba[i*4],rgba[i*4+1],rgba[i*4+2])<40)),out=[],used=new Uint8Array(w*h);
  for(const source of PanelColoredRims.whiteBodies(white,w,h)?.items||[]){const n=source.indices.length;if(n<1000||n>w*h*.035||source.indices.some(i=>used[i]))continue;
   const mask=new Uint8Array(w*h);for(const i of source.indices)mask[i]=1;const box=PanelLocalBoundaryConsensus.pixelEvidence.extent(mask,w,h).box,[x0,y0,x1,y1]=box,bw=x1-x0,bh=y1-y0;if(x0<3||y0<3||x1>w-3||y1>h-3||n/(bw*bh)<.30||bw/bh<1.6||bw/bh>8)continue;
   const tails=[Math.max(4,Math.round(w*.014)),Math.max(6,Math.round(w*.017))].map(r=>tail(mask,w,h,box,r));if(tails.some(t=>!t||t.pixels>n*.25)||JSON.stringify(tails[0].tips)!==JSON.stringify(tails[1].tips))continue;
   const tips=tails[0].tips,tipHits=masks.map(m=>tips.reduce((s,i)=>s+m[i],0));
   const near=morph(mask,w,h,3,true),collar=near.map((v,i)=>+(v&&!mask[i])),samples=collar.reduce((s,v)=>s+v,0),hits=masks.map(m=>source.indices.reduce((s,i)=>s+m[i],0)),collarHits=masks.map(m=>m.reduce((s,v,i)=>s+ +(v&&collar[i]),0)),members=hits.map((v,k)=>k).filter(k=>hits[k]||collarHits[k]),owner=collarHits.indexOf(Math.max(...collarHits));
   if(members.length!==2||members.some(k=>!row(parents[k],w,h))||hits[owner]<n*.12||hits[owner]>n*.85||collarHits[owner]<samples*.55||collarHits[owner]-Math.max(...collarHits.filter((v,k)=>k!==owner))<samples*.25)continue;
   const secondNear=morph(mask,w,h,5,true),secondCollar=secondNear.map((v,i)=>+(v&&!mask[i])),secondSamples=secondCollar.reduce((s,v)=>s+v,0),secondHits=masks.map(m=>m.reduce((s,v,i)=>s+ +(v&&secondCollar[i]),0));if(secondHits[owner]<secondSamples*.55||secondHits[owner]-Math.max(...secondHits.filter((v,k)=>k!==owner))<secondSamples*.25)continue;
   const a=parents[members[0]],b=parents[members[1]];if(Math.abs(a.x-b.x)>.06||Math.abs(a.w-b.w)>.06||Math.min(Math.abs(a.y+a.h-b.y),Math.abs(b.y+b.h-a.y))>.10)continue;
   // Source ink must enclose the paper and contain independent lettering.
   const inkMask=new Uint8Array(w*h);let paper=0,dark=0,edges=0,supported=0;for(const i of source.indices){paper+=white[i];if(Math.max(rgba[4*i],rgba[4*i+1],rgba[4*i+2])<100){dark++;inkMask[i]=1;}const x=i%w,y=i/w|0;if(!mask[i-1]||!mask[i+1]||!mask[i-w]||!mask[i+w]){edges++;let lo=255;for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const j=4*((y+dy)*w+x+dx);lo=Math.min(lo,.299*rgba[j]+.587*rgba[j+1]+.114*rgba[j+2]);}supported+=+(lo<90);}}
   const letters=components(inkMask,w,h).filter(q=>q.length>=3&&q.length<n*.08).length;if(paper/n<.60||paper/n>.95||dark/n<.05||dark/n>.35||supported/edges<.90||letters<8)continue;
   out.push({secondCollarSamples:secondSamples,secondCollarHits:secondHits,collarSamples:samples,indices:source.indices,owner,members,tails,box,hits,collarHits,tipHits,pixels:n,paperRatio:paper/n,darkRatio:dark/n,inkRatio:supported/edges,letters});for(const i of source.indices)used[i]=1;
  }return out;
 }
 function installReader(reader){if(!reader||reader._longTailSpeechInstalled)return;const old=reader.displayPanelContours;reader.displayPanelContours=function(p,contours=this.panelContours(p)){
  const owners=this.currentPanels,img=this.getPanelImageContext()?.img,v=p?._matteCellProof,w=v?.analysisWidth,h=v?.analysisHeight;if(!img||!row(p,w,h))return old.call(this,p,contours);
  let entry=this._longTailSpeechDisplay;if(!entry||entry.owners!==owners||entry.img!==img||entry.w!==w||entry.h!==h){
   // Populate the retained repair's source raster once, then share it.
   old.call(this,p,contours);const cached=this._cropRepairRaster;entry=this._longTailSpeechDisplay={owners,img,w,h,cache:new WeakMap(),bodies:cached?.img===img&&cached.w===w&&cached.h===h?analyzeRGBA(cached.rgba,w,h,owners||[]):[]};
  }
  if(entry.cache.has(p))return entry.cache.get(p).contours;
  const before=old.call(this,p,contours),member=(owners||[]).indexOf(p),bodies=entry.bodies.filter(b=>b.members.includes(member));if(!bodies.length)return before;
  const mask=raster(before,w,h);let added=0,removed=0;for(const b of bodies)for(const i of b.indices){const take=+(b.owner===member);added+=+(!mask[i]&&take);removed+=+(mask[i]&&!take);mask[i]=take;}
  const traced=PanelMatteCells.tracePixelContours(mask,w,h,1),result=traced?.map(q=>q.map(([x,y])=>({x:x/w,y:y/h})))||before;
  entry.cache.set(p,{contours:result,extended:added>0,addedPixels:added,removedPixels:removed});return result;
 };reader._longTailSpeechInstalled=true;}
 return{analyzeRGBA,installReader};
})();
