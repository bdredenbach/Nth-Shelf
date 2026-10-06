/* Reader-only completion of a large matte split whose small sibling lies
 * inside its crop envelope. The original opaque source must independently
 * enclose both siblings in the same cell at two paper thresholds. Complete
 * that bounded composite; preserve discovery and every existing display pixel.
 * No title, page, text, fingerprint or saved-image lookup participates. */
const PanelSplitCellCompletion=(()=>{
 'use strict';
 const raster=(q,w,h)=>PanelCropRepair.raster(q,w,h),E=()=>PanelLocalBoundaryConsensus.pixelEvidence;
 function split(p,w,h){
  if(p?._geometryType!=='edge-connected-matte-cell')return false;
  let v=p._matteCellProof;
  for(let k=0;k<8&&v?.version===4;k++)v=v.parent?._matteCellProof;
  return v?.version===1&&v.method==='edge-connected-matte-cells-v1'&&v.mode==='paper'&&v.source==='split'&&v.analysisWidth===w&&v.analysisHeight===h&&!!PanelGeometryOrthogonal._provenContours(p);
 }
 function pairs(parents,w,h){
  if(!Array.isArray(parents)||parents.length<2||parents.length>24)return[];
  const out=[];
  for(let a=0;a<parents.length;a++){const p=parents[a];if(!p||p.w*p.h<.25||p.w*p.h>.55||!split(p,w,h))continue;
   for(let b=0;b<parents.length;b++){const q=parents[b];if(a===b||!q||q.w*q.h<.025||q.w*q.h>.12||q.w*q.h>p.w*p.h*.30||!split(q,w,h))continue;
    if(q.x>=p.x+2/w&&q.y>=p.y+2/h&&q.x+q.w<=p.x+p.w-2/w&&q.y+q.h<=p.y+p.h-2/h)out.push({owner:a,fragment:b});
   }
  }return out;
 }
 function exterior(mask,w,h){const out=new Uint8Array(mask.length),queue=new Int32Array(mask.length);let n=0,k=0;const add=i=>{if(mask[i]&&!out[i]){out[i]=1;queue[n++]=i;}};for(let x=0;x<w;x++){add(x);add((h-1)*w+x);}for(let y=0;y<h;y++){add(y*w);add(y*w+w-1);}while(k<n){const i=queue[k++],x=i%w,y=i/w|0;if(x)add(i-1);if(x+1<w)add(i+1);if(y)add(i-w);if(y+1<h)add(i+w);}return out;}
 function components(mask,w,h){const ids=new Int32Array(mask.length),queue=new Int32Array(mask.length);let id=0;for(let s=0;s<mask.length;s++)if(mask[s]&&!ids[s]){let k=0,n=1;queue[0]=s;ids[s]=++id;while(k<n){const i=queue[k++],x=i%w,y=i/w|0;const add=j=>{if(mask[j]&&!ids[j]){ids[j]=id;queue[n++]=j;}};if(x)add(i-1);if(x+1<w)add(i+1);if(y)add(i-w);if(y+1<h)add(i+w);}}return ids;}
 function analyzeRGBA(rgba,w,h,parents=[]){
  if(!Number.isInteger(w)||!Number.isInteger(h)||w<250||h<350||w>900||h>900||rgba?.length!==w*h*4)return[];
  const candidates=pairs(parents,w,h);if(!candidates.length)return[];for(let i=3;i<rgba.length;i+=4)if(rgba[i]!==255)return[];
  const rings=parents.map(p=>PanelGeometryOrthogonal._provenContours(p));if(rings.some(q=>!q))return[];const masks=rings.map(q=>raster(q,w,h)),N=w*h;
  const labels=[230,235].map(t=>components(exterior(Uint8Array.from({length:N},(_,i)=>+(Math.min(rgba[4*i],rgba[4*i+1],rgba[4*i+2])>t&&Math.max(rgba[4*i],rgba[4*i+1],rgba[4*i+2])-Math.min(rgba[4*i],rgba[4*i+1],rgba[4*i+2])<=30)),w,h).map(v=>1-v),w,h)),out=[];
  for(const{owner,fragment}of candidates){if(candidates.filter(q=>q.owner===owner).length!==1)continue;
   const old=masks[owner],small=masks[fragment],oldN=old.reduce((s,v)=>s+v,0),smallN=small.reduce((s,v)=>s+v,0);if(oldN<N*.20||oldN>N*.45||smallN<oldN*.08||smallN>oldN*.30||old.some((v,i)=>v&&small[i]))continue;
   const cells=labels.map(ids=>{let id=0;for(let i=0;i<N;i++)if(old[i]||small[i]){if(!ids[i]||id&&id!==ids[i])return null;id=ids[i];}return Uint8Array.from(ids,v=>+(v===id));});if(cells.some(c=>!c))continue;
   const [A,B]=cells,difference=A.reduce((s,v,i)=>s+ +(v!==B[i]),0),mask=A.map((v,i)=>+(v||B[i])),g=E().extent(mask,w,h),added=g.pixels-oldN;
   if(difference>Math.max(8,g.pixels*.001)||added<oldN*.10||added>oldN*.45||g.pixels>N*.50||g.pixels/((g.box[2]-g.box[0])*(g.box[3]-g.box[1]))<.72||masks.some((m,k)=>k!==owner&&k!==fragment&&m.some((v,i)=>v&&mask[i])))continue;
   const p=parents[owner],box=[p.x*w,p.y*h,(p.x+p.w)*w,(p.y+p.h)*h];if(g.box.some((v,k)=>Math.abs(v-box[k])>2))continue;
   const traced=PanelMatteCells.tracePixelContours(mask,w,h,1);if(traced?.length!==1)continue;
   const content=PanelContextCells.contentEvidence.signature(small,rgba);if(!PanelContextCells.contentEvidence.signatureValid(content,smallN))continue;
   out.push({owner,fragment,mask,thresholds:[230,235],difference,pixels:g.pixels,addedPixels:added,box:g.box,content});
  }return out;
 }
 function installReader(reader){if(!reader||reader._splitCellInstalled)return;const old=reader.displayPanelContours;reader.displayPanelContours=function(p,contours=this.panelContours(p)){
  const owners=this.currentPanels,img=this.getPanelImageContext()?.img,v=p?._matteCellProof,w=v?.analysisWidth,h=v?.analysisHeight;if(!img||p.w*p.h<.25||p.w*p.h>.55||!Array.isArray(owners))return old.call(this,p,contours);
  let entry=this._splitCellDisplay;if(!entry||entry.owners!==owners||entry.img!==img||entry.w!==w||entry.h!==h){old.call(this,p,contours);const cached=this._cropRepairRaster;entry=this._splitCellDisplay={owners,img,w,h,cache:new WeakMap(),repairs:cached?.img===img&&cached.w===w&&cached.h===h?analyzeRGBA(cached.rgba,w,h,owners):[]};}
  if(entry.cache.has(p))return entry.cache.get(p).contours;const before=old.call(this,p,contours),repair=entry.repairs.find(q=>owners[q.owner]===p);if(!repair){entry.cache.set(p,{contours:before,before,addedPixels:0});return before;}
  const mask=raster(before,w,h);let added=0;for(let i=0;i<mask.length;i++)if(repair.mask[i]){added+=+!mask[i];mask[i]=1;}const traced=PanelMatteCells.tracePixelContours(mask,w,h,1),result=traced?.map(q=>q.map(([x,y])=>({x:x/w,y:y/h})))||before;entry.cache.set(p,{contours:result,before,addedPixels:added});return result;
 };
  // Display coverage can overlap the retained small sibling. Preserve its
  // original taps; only newly recovered, previously unowned pixels use the
  // larger composite. No discovery descriptor or selection order changes.
  const find=reader.findPanelAt;reader.findPanelAt=function(x,y){
   const hit=find.call(this,x,y),entry=this._splitCellDisplay,display=hit&&entry?.cache.get(hit);
   if(!hit||!entry||entry.owners!==this.currentPanels||entry.img!==this.getPanelImageContext()?.img||!display||this.pointInContours(display.before,x,y))return hit;
   const repair=entry.repairs.find(q=>entry.owners[q.owner]===hit),sibling=repair&&entry.owners[repair.fragment];
   if(sibling&&x>=sibling.x&&x<=sibling.x+sibling.w&&y>=sibling.y&&y<=sibling.y+sibling.h&&this.pointInContours(this.displayPanelContours(sibling),x,y))return sibling;
   return hit;
  };reader._splitCellInstalled=true;}
 return{analyzeRGBA,installReader};
})();
