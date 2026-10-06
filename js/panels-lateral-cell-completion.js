/* Reader-only lateral completion of a validated narrow lettering cell on a
 * dark matte. Independent source thresholds must enclose the same small
 * lateral compartments. A straight ink divider or another owner vetoes them.
 * Discovery descriptors and every existing display pixel remain unchanged. */
const PanelLateralCellCompletion=(()=>{
 'use strict';
 const E=()=>PanelLocalBoundaryConsensus.pixelEvidence,raster=(q,w,h)=>PanelCropRepair.raster(q,w,h);
 function cells(rgba,w,h,t){const dark=Uint8Array.from({length:w*h},(_,i)=>+(Math.max(rgba[4*i],rgba[4*i+1],rgba[4*i+2])<t)),seen=new Uint8Array(w*h),out=[],queue=[];const add=i=>{if(dark[i]&&!seen[i]){seen[i]=1;queue.push(i);}};for(let x=0;x<w;x++){add(x);add((h-1)*w+x);}for(let y=0;y<h;y++){add(y*w);add(y*w+w-1);}for(let at=0;at<queue.length;at++){const i=queue[at],x=i%w,y=i/w|0;if(x)add(i-1);if(x+1<w)add(i+1);if(y)add(i-w);if(y+1<h)add(i+w);}
  for(let s=0;s<seen.length;s++)if(!seen[s]){const q=[s];seen[s]=1;let edge=false;for(let at=0;at<q.length;at++){const i=q[at],x=i%w,y=i/w|0;edge ||= !x||x===w-1||!y||y===h-1;for(const j of[x?i-1:-1,x+1<w?i+1:-1,y?i-w:-1,y+1<h?i+w:-1])if(j>=0&&!seen[j]){seen[j]=1;q.push(j);}}if(edge||q.length<150)continue;const mask=new Uint8Array(w*h);for(const i of q)mask[i]=1;out.push({mask,indices:q,...E().extent(mask,w,h)});}return out;
 }
 function hull(points){const p=points.sort((a,b)=>a.x-b.x||a.y-b.y),cross=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x),lo=[],hi=[];for(const a of p){while(lo.length>1&&cross(lo.at(-2),lo.at(-1),a)<=0)lo.pop();lo.push(a);}for(const a of p.reverse()){while(hi.length>1&&cross(hi.at(-2),hi.at(-1),a)<=0)hi.pop();hi.push(a);}return lo.slice(0,-1).concat(hi.slice(0,-1));}
 function candidate(p,w,h){const v=p?._structuralGridProof;return v?.version===42&&v.first?._structuralGridProof?.palette?.paper===false&&v.analysisWidth===w&&v.analysisHeight===h&&p.w/p.h*w/h>2.4&&p.w*p.h>=.05&&p.w*p.h<=.18&&PanelLetteringCells.validPanel(p);}
 function analyzeRGBA(rgba,w,h,parents=[]){
  if(!Number.isInteger(w)||!Number.isInteger(h)||w<250||h<350||w>900||h>900||rgba?.length!==w*h*4||!Array.isArray(parents))return[];
  const owners=parents.map((p,k)=>candidate(p,w,h)?k:-1).filter(k=>k>=0);if(!owners.length)return[];for(let i=3;i<rgba.length;i+=4)if(rgba[i]!==255)return[];
  const masks=parents.map(p=>PanelGeometryOrthogonal._provenContours(p)).map(q=>q?raster(q,w,h):null);if(masks.some(m=>!m))return[];
  const sources=[60,65].map(t=>cells(rgba,w,h,t)),out=[];
  for(const owner of owners){const old=masks[owner],g=E().extent(old,w,h),[x0,y0,x1,y1]=g.box,W=x1-x0,H=y1-y0;
   const possible=sources[1].filter(c=>c.pixels<g.pixels*.18&&c.box[1]>=y0-2&&c.box[3]<=y1+2&&c.box[0]>=x0-W*.025&&c.box[2]<=x1+W*.20&&!c.indices.some(i=>old[i])&&c.box[2]>x1+8&&c.box[0]<x1+8);
   if(possible.length<2||possible.length>3)continue;
   const core=new Uint8Array(w*h);let stable=true;
   for(const c of possible){for(const list of[sources[0]]){const matches=list.filter(b=>b.indices.reduce((n,i)=>n+c.mask[i],0)>c.pixels*.97);if(matches.length!==1||matches[0].pixels<c.pixels*.97||matches[0].pixels>c.pixels*1.03){stable=false;break;}}if(!stable)break;for(const i of c.indices)core[i]=1;}
   if(!stable)continue;const n=core.reduce((s,v)=>s+v,0);if(n<g.pixels*.05||n>g.pixels*.25)continue;
   // Reject a continuous straight frame rail between this owner and extension.
   let divider=false;for(let x=Math.max(x0+2,x1-20);x<x1+8;x++){let count=0,run=0,longest=0;for(let y=y0+2;y<y1-2;y++){const i=4*(y*w+x),dark=Math.max(rgba[i],rgba[i+1],rgba[i+2])<70;count+=+dark;run=dark?run+1:0;longest=Math.max(longest,run);}if(count>H*.80&&longest>H*.60)divider=true;}if(divider)continue;
   const points=parents[owner]._contours.flat().map(q=>({...q}));for(let i=0;i<core.length;i++)if(core[i]){const x=i%w,y=i/w|0;if(!core[i-1]||!core[i+1]||!core[i-w]||!core[i+w])points.push({x:(x+.5)/w,y:(y+.5)/h});}
   const envelope=raster([hull(points)],w,h),mask=old.slice();for(let y=y0;y<y1;y++){let last=-1;for(let x=x0;x<x1;x++)if(old[y*w+x])last=x;if(last<0)continue;for(let x=last+1;x<w;x++)if(envelope[y*w+x])mask[y*w+x]=1;}for(let i=0;i<mask.length;i++)mask[i]|=core[i];
   const added=mask.reduce((s,v,i)=>s+ +(v&&!old[i]),0);if(added<g.pixels*.05||added>g.pixels*.30)continue;
   const foreign=new Uint8Array(w*h);for(let k=0;k<masks.length;k++)if(k!==owner)for(let i=0;i<foreign.length;i++)foreign[i]|=masks[k][i];const overlaps=mask.reduce((s,v,i)=>s+ +(v&&foreign[i]&&!old[i]),0);if(overlaps>Math.max(2,added*.005))continue;for(let i=0;i<mask.length;i++)if(foreign[i]&&!old[i])mask[i]=0;
   // An excluded substantial source compartment inside the new envelope can
   // be a separate scene. Do not swallow it merely because a hull contains it.
   if(sources[1].some(c=>c.pixels>g.pixels*.06&&c.indices.reduce((s,i)=>s+ +(mask[i]&&!old[i]&&!core[i]),0)>c.pixels*.15))continue;
   out.push({owner,mask,addedPixels:mask.reduce((s,v,i)=>s+ +(v&&!old[i]),0),thresholds:[60,65],sourcePixels:n,box:E().extent(mask,w,h).box});
  }return out;
 }
 function installReader(reader){if(!reader||reader._lateralCellInstalled)return;const old=reader.displayPanelContours;reader.displayPanelContours=function(p,contours=this.panelContours(p)){
  const owners=this.currentPanels,img=this.getPanelImageContext()?.img,v=p?._structuralGridProof,w=v?.analysisWidth,h=v?.analysisHeight;if(!img||!candidate(p,w,h))return old.call(this,p,contours);
  let entry=this._lateralCellDisplay;if(!entry||entry.owners!==owners||entry.img!==img||entry.w!==w||entry.h!==h){old.call(this,p,contours);const src=this._cropRepairRaster;entry=this._lateralCellDisplay={owners,img,w,h,cache:new WeakMap(),repairs:src?.img===img&&src.w===w&&src.h===h?analyzeRGBA(src.rgba,w,h,owners):[]};}
  if(entry.cache.has(p))return entry.cache.get(p).contours;const before=old.call(this,p,contours),repair=entry.repairs.find(q=>owners[q.owner]===p);if(!repair){entry.cache.set(p,{contours:before,addedPixels:0});return before;}
  const mask=raster(before,w,h),blocked=new Uint8Array(w*h);for(const other of owners)if(other!==p){const q=old.call(this,other,this.panelContours(other));if(q){const m=raster(q,w,h);for(let i=0;i<m.length;i++)blocked[i]|=m[i];}}let added=0;for(let i=0;i<mask.length;i++)if(repair.mask[i]&&!blocked[i]){added+=+!mask[i];mask[i]=1;}const rings=PanelMatteCells.tracePixelContours(mask,w,h,1),result=rings?.map(q=>q.map(([x,y])=>({x:x/w,y:y/h})))||before;entry.cache.set(p,{contours:result,addedPixels:added,extended:true});return result;
 };const find=reader.findPanelAt;reader.findPanelAt=function(x,y){const hit=find.call(this,x,y);if(hit)return hit;for(const p of this.currentPanels||[]){const v=p?._structuralGridProof,w=v?.analysisWidth,h=v?.analysisHeight;if(candidate(p,w,h)&&x>=p.x&&x<=p.x+p.w*1.20&&y>=p.y-2/h&&y<=p.y+p.h+2/h)this.displayPanelContours(p);}const entry=this._lateralCellDisplay;if(!entry||entry.owners!==this.currentPanels||entry.img!==this.getPanelImageContext()?.img)return null;for(const p of this.currentPanels){const result=entry.cache.get(p);if(result?.extended&&this.pointInContours(result.contours,x,y))return p;}return null;};reader._lateralCellInstalled=true;}
 return{analyzeRGBA,installReader};
})();
