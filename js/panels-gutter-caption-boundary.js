/* Reconcile a broad paper-gutter boundary around indivisible rectangular
 * captions. Two independently witnessed paper paths separate foreign upper
 * artwork; stable source-enclosed, lettered captions keep their complete rims.
 * Discovery descriptors are replayed exactly and are never rewritten. */
const PanelGutterCaptionBoundary=(()=>{
 'use strict';const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 function extent(m,w,h){let x=w,y=h,X=0,Y=0,n=0;for(let i=0;i<m.length;i++)if(m[i]){const xx=i%w,yy=i/w|0;x=Math.min(x,xx);y=Math.min(y,yy);X=Math.max(X,xx+1);Y=Math.max(Y,yy+1);n++;}return{box:[x,y,X,Y],pixels:n};}
 function dilate(m,w,h){const out=m.slice();for(let i=0;i<m.length;i++)if(m[i]){const x=i%w,y=i/w|0;if(x)out[i-1]=1;if(x+1<w)out[i+1]=1;if(y)out[i-w]=1;if(y+1<h)out[i+w]=1;}return out;}
 function paper(a,t){return Uint8Array.from({length:a.length/4},(_,i)=>+(Math.min(a[4*i],a[4*i+1],a[4*i+2])>t&&Math.max(a[4*i],a[4*i+1],a[4*i+2])-Math.min(a[4*i],a[4*i+1],a[4*i+2])<35));}
 function captionBodies(a,w,h){
  const sets=[190,210].map(t=>PanelColoredRims.whiteBodies(paper(a,t),w,h)?.items||[]),out=[];
  for(const b of sets[0]){const [x,y,X,Y]=b.box,W=X-x,H=Y-y,A=W*H;if(W<20||H<12||W/H<1.2||W/H>5||A<w*h*.0006||A>w*h*.015||b.pixels<A*.98||x<8||y<8||X>w-8||Y>h-8)continue;
   const match=sets[1].filter(c=>same(c.box,b.box)&&c.pixels===b.pixels&&same(c.indices,b.indices));if(match.length!==1)continue;
   const ink=new Uint8Array(w*h);let dark=0;for(let yy=y;yy<Y;yy++)for(let xx=x;xx<X;xx++){const i=yy*w+xx;ink[i]=+(Math.max(a[4*i],a[4*i+1],a[4*i+2])<100);dark+=ink[i];}const letters=PanelEmptyEnclosureGroups.components(ink,w,h).items.filter(c=>c.pixels>=2&&c.pixels<A*.12).length;if(letters<8||dark<A*.04||dark>A*.35)continue;
   const radius=Math.max(4,Math.ceil(H*.25)),proposals=[];
   for(let bin=0;bin<24;bin++){const near=new Uint8Array(w*h);for(let yy=Math.max(0,y-radius);yy<Math.min(h,Y+radius);yy++)for(let xx=Math.max(0,x-radius);xx<Math.min(w,X+radius);xx++){if(xx>=x&&xx<X&&yy>=y&&yy<Y)continue;const i=yy*w+xx,r=a[4*i],g=a[4*i+1],B=a[4*i+2],mx=Math.max(r,g,B),mn=Math.min(r,g,B),d=mx-mn,hue=!d?0:(mx===r?((g-B)/d+6)%6:mx===g?(B-r)/d+2:(r-g)/d+4)/6,delta=Math.abs(hue-(bin+.5)/24);near[i]=+(mx>65&&d>45&&d/mx>.30&&Math.min(delta,1-delta)<.065);}
    const cc=PanelEmptyEnclosureGroups.components(near,w,h);for(const c of cc.items){const B=c.box;if(c.pixels<A*.05||c.pixels>A*.50||B[2]-B[0]<W*.8||B[3]-B[1]<H*.8||B.some((v,k)=>Math.abs(v-b.box[k])>radius))continue;const rim=new Uint8Array(w*h);for(let i=0;i<rim.length;i++)rim[i]=+(cc.ids[i]===c.id);proposals.push({mask:rim,pixels:c.pixels,bin});}}
   proposals.sort((a,b)=>b.pixels-a.pixels);const chosen=proposals[0];if(!chosen)continue;
   const mask=new Uint8Array(w*h);for(const i of b.indices)mask[i]=1;const collar=dilate(dilate(chosen.mask,w,h),w,h),rimBox=extent(chosen.mask,w,h).box,outer=rimBox.slice(),inkAt=i=>Math.max(a[4*i],a[4*i+1],a[4*i+2])<100;
   // A colored offset rim need not have an ink outline on every side. Grow
   // only long source-dark rails; isolated nearby lettering cannot become rim.
   for(let side=0;side<4;side++)for(let d=1;d<=2;d++){const vertical=side>=2,edge=[rimBox[1]-d,rimBox[3]+d-1,rimBox[0]-d,rimBox[2]+d-1][side],lo=vertical?rimBox[1]:rimBox[0],hi=vertical?rimBox[3]:rimBox[2];let hits=0;for(let t=lo;t<hi;t++)hits+=inkAt(vertical?t*w+edge:edge*w+t);if(hits<(hi-lo)*.80)break;outer[[1,3,0,2][side]]+=side%2?1:-1;}
   for(let i=0;i<mask.length;i++){const xx=i%w,yy=i/w|0;mask[i]|=+(chosen.mask[i]||collar[i]&&xx>=outer[0]&&xx<outer[2]&&yy>=outer[1]&&yy<outer[3]&&inkAt(i));}out.push({mask,box:b.box,letters,rimPixels:chosen.pixels,indices:Array.from(mask.keys()).filter(i=>mask[i])});
  }return out;
 }
 function path(white,protectedMask,w,h,x0,X,row,band){
  const y0=Math.max(1,row-band),Y=Math.min(h-1,row+band+1),H=Y-y0,W=X-x0,prior=new Float64Array(H),next=new Float64Array(H),backs=new Int16Array(W*H);prior.fill(Infinity);
  for(let y=y0;y<Y;y++){const i=y*w+x0;if(white[i]||protectedMask[i])prior[y-y0]=Math.abs(y-row);}
  for(let x=x0+1;x<X;x++){next.fill(Infinity);for(let y=y0;y<Y;y++){const i=y*w+x;if(!white[i]&&!protectedMask[i])continue;const k=y-y0;let best=Infinity,from=-1;for(let d=-2;d<=2;d++){const j=k+d;if(j<0||j>=H)continue;const cost=prior[j]+Math.abs(d)*.25;if(cost<best){best=cost;from=j;}}if(from>=0&&Number.isFinite(best)){next[k]=best+Math.abs(y-row);backs[(x-x0)*H+k]=from;}}prior.set(next);}
  let at=-1;for(let k=0;k<H;k++)if(at<0||prior[k]<prior[at])at=k;if(!Number.isFinite(prior[at]))return null;const ys=new Int16Array(W);for(let x=W-1;x>=0;x--){ys[x]=at+y0;at=backs[x*H+at];}return Array.from(ys);
 }
 function discoverRGBA(a,w,h,lower,upper,others=[]){
  if(!Number.isInteger(w)||!Number.isInteger(h)||w<80||h<80||w>900||h>900||a?.length!==w*h*4||lower?.length!==w*h||upper?.length!==w*h||others.some(m=>m?.length!==w*h))return[];for(let i=3;i<a.length;i+=4)if(a[i]!==255)return[];
  const L=extent(lower,w,h),U=extent(upper,w,h),[x0,y0,X,Y]=L.box,W=X-x0;if(W<w*.8||U.box[1]>=y0||U.box[3]<y0||L.pixels<W*(Y-y0)*.55)return[];
  const tops=[];for(let x=x0;x<X;x++){let y=y0;while(y<Y&&!lower[y*w+x])y++;if(y<Y)tops.push(y);}tops.sort((a,b)=>a-b);const med=tops[tops.length>>1],band=Math.max(6,Math.ceil(h*.03));if(tops.filter(y=>Math.abs(y-med)<band).length<W*.70||med-y0<band||med-y0>h*.15||Math.abs(U.box[3]-med)>band)return[];
  const whites=[190,210].map(t=>paper(a,t)),captions=captionBodies(a,w,h).filter(b=>b.box[1]<med&&b.box[3]>med&&b.indices.reduce((s,i)=>s+lower[i],0)>b.indices.length*.90),protectedMask=new Uint8Array(w*h);if(captions.length!==1)return[];for(const b of captions)for(const i of b.indices)protectedMask[i]=1;
  const paths=[];for(const white of whites){let row=-1,best=0;for(let y=Math.max(0,med-band);y<Math.min(h,med+band);y++){let n=0;for(let x=x0;x<X;x++)n+=white[y*w+x]||protectedMask[y*w+x];if(n>best){best=n;row=y;}}if(best<W*.90)return[];const ys=path(white,protectedMask,w,h,x0,X,row,band);if(!ys)return[];let blocked=0,paperHits=0;for(let x=x0;x<X;x++){const i=ys[x-x0]*w+x;blocked+=protectedMask[i];paperHits+=white[i];}if(blocked>W*.15||paperHits<W*.80)return[];paths.push({ys,row,paperHits});}
  if(paths[0].ys.some((y,k)=>Math.abs(y-paths[1].ys[k])>2))return[];
  const removed=new Uint8Array(w*h),indices=[];let unknown=0,foreign=0;for(let x=x0;x<X;x++){const stop=Math.min(paths[0].ys[x-x0],paths[1].ys[x-x0]);for(let y=y0;y<stop;y++){const i=y*w+x;if(lower[i]&&!protectedMask[i]){removed[i]=1;indices.push(i);unknown+=+(!upper[i]);foreign+=+(others.some(m=>m[i]));}}}
  const g=extent(removed,w,h);if(foreign||indices.length<100||indices.length>L.pixels*.08||g.box[2]-g.box[0]>W*.25)return[];
  // Removed artwork must meet the upper owner above the gutter, while the
  // protected caption straddles it and remains majority within the lower cell.
  let contacts=0,edge=0;for(const i of indices){const x=i%w,y=i/w|0;for(const j of[x?i-1:-1,x+1<w?i+1:-1,y?i-w:-1,y+1<h?i+w:-1])if(j>=0&&!removed[j]){edge++;contacts+=upper[j];}}if(contacts<8||contacts<edge*.08)return[];
  return[{indices,box:g.box,paths,captions:captions.map(b=>({box:b.box,indices:b.indices,letters:b.letters,rimPixels:b.rimPixels})),contacts,edge,unknown}];
 }
 function eligible(owners){return Array.isArray(owners)&&owners.length>=3&&owners.length<=24&&owners.filter(p=>PanelLandscapeCells.validPanel(p)&&!p._structuralGridProof.internalDivider&&p.w>.8).length===1&&owners.filter(p=>PanelLandscapeUpperGroups.validPanel(p)).length===1&&owners.every(p=>PanelGeometryOrthogonal._provenContours(p));}
 function analyzeRGBA(a,w,h,owners){
  if(!eligible(owners)||a?.length!==w*h*4)return[];const cells=owners.filter(p=>PanelLandscapeCells.validPanel(p)),cellIndexes=owners.map((p,k)=>PanelLandscapeCells.validPanel(p)?k:-1).filter(k=>k>=0),upper=owners.findIndex(p=>PanelLandscapeUpperGroups.validPanel(p)),lower=owners.findIndex(p=>PanelLandscapeCells.validPanel(p)&&!p._structuralGridProof.internalDivider&&p.w>.8);if(owners.some(p=>p._structuralGridProof?.analysisWidth!==w||p._structuralGridProof?.analysisHeight!==h))return[];
  if(!same(PanelLandscapeCells.analyzeRGBA(a,w,h,owners.slice(0,cellIndexes[0])),cells)||!same(PanelLandscapeUpperGroups.analyzeRGBA(a,w,h,owners.slice(0,upper)),[owners[upper]]))return[];
  const masks=owners.map(p=>PanelLocalBoundaryConsensus.raster(p,w,h));return discoverRGBA(a,w,h,masks[lower],masks[upper],masks.filter((m,k)=>k!==lower&&k!==upper)).map(q=>({...q,lower,upper}));
 }
 function installReader(r){if(!r||r._gutterCaptionBoundaryReader)return;const old=r.displayPanelContours;r.displayPanelContours=function(p,c=this.panelContours(p)){
  const owners=this.currentPanels,img=this.getPanelImageContext()?.img;if(!img||!owners?.includes(p)||!eligible(owners))return old.call(this,p,c);let s=this._gutterCaptionBoundary;if(!s||s.owners!==owners||s.img!==img){const v=owners.find(p=>PanelLandscapeCells.validPanel(p))._structuralGridProof,w=v.analysisWidth,h=v.analysisHeight;s=this._gutterCaptionBoundary={owners,img,w,h,repairs:[],before:new WeakMap(),cache:new WeakMap(),extended:new WeakSet()};for(const q of owners)s.before.set(q,old.call(this,q,this.panelContours(q)));let canvas;try{canvas=document.createElement('canvas');const W=img.naturalWidth||img.width,H=img.naturalHeight||img.height;if(!W||!H||W*H>24000000)return old.call(this,p,c);canvas.width=W;canvas.height=H;const g=canvas.getContext('2d',{willReadFrequently:true});g.drawImage(img,0,0);s.repairs=analyzeRGBA(PanelMatteCells.sampleBilinearRGBA(g.getImageData(0,0,W,H).data,W,H,w,h),w,h,owners);for(const q of s.repairs){const mask=PanelCropRepair.raster(s.before.get(owners[q.lower]),w,h),raw=PanelLocalBoundaryConsensus.raster(owners[q.lower],w,h),box=extent(raw,w,h).box,kept=new Uint8Array(w*h),indices=[];for(const b of q.captions)for(const i of b.indices)kept[i]=1;for(let x=box[0];x<box[2];x++)for(let y=0;y<Math.min(q.paths[0].ys[x-box[0]],q.paths[1].ys[x-box[0]]);y++){const i=y*w+x;if(mask[i]&&!kept[i])indices.push(i);}if(indices.length>mask.reduce((n,v)=>n+v,0)*.08){s.repairs=[];break;}q.rawIndices=q.indices;q.indices=indices;s.extended.add(owners[q.upper]);}}catch(_){/* Uncertain source retains existing ownership. */}finally{if(canvas)canvas.width=canvas.height=1;}}
  if(s.cache.has(p))return s.cache.get(p);const before=s.before.get(p)||old.call(this,p,c),k=owners.indexOf(p);if(!s.repairs.some(q=>k===q.lower||k===q.upper))return before;const mask=PanelCropRepair.raster(before,s.w,s.h);for(const q of s.repairs)if(k===q.lower||k===q.upper)for(const i of q.indices)mask[i]=+(k===q.upper);const rings=PanelMatteCells.tracePixelContours(mask,s.w,s.h,1),result=rings?.map(q=>q.map(([x,y])=>({x:x/s.w,y:y/s.h})))||before;s.cache.set(p,result);return result;
 };const find=r.findPanelAt;r.findPanelAt=function(x,y){const lookup=()=>{const s=this._gutterCaptionBoundary;if(!s||!this.panelZoomEnabled||s.owners!==this.currentPanels||s.img!==this.getPanelImageContext()?.img||x<0||x>=1||y<0||y>=1)return null;const i=Math.floor(y*s.h)*s.w+Math.floor(x*s.w),q=s.repairs.find(q=>q.indices.includes(i));return q?s.owners[q.upper]:null;};return lookup()||find.call(this,x,y)||lookup();};r._gutterCaptionBoundaryReader=true;}
 return{extent,captionBodies,path,discoverRGBA,eligible,analyzeRGBA,installReader};
})();
if(typeof module!=='undefined')module.exports=PanelGutterCaptionBoundary;
