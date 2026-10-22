/* Complete source-enclosed captions without establishing scene continuity.
 * Existing trailing-edge ownership is unchanged. A partially displayed matte
 * caption needs a unique authenticated owner, nearly enclosed extent, no
 * foreign owner, and a native-checked fringe for its small measured overhang. */
const PanelDetachedCaptions=(()=>{
 'use strict';
 const displayStates=new WeakMap();
 const imageKey=img=>[img.currentSrc,img.src,img.naturalWidth,img.naturalHeight,img.width,img.height];
 const sameImage=(key,img)=>key.every((v,k)=>v===imageKey(img)[k]);
 const sameOwners=(s,owners)=>s.owners===owners&&s.members.length===owners.length&&s.members.every((p,k)=>p===owners[k]);
 // Snapshot only the bounded geometry used by ownership, never recursive
 // legacy proof graphs. Current panelContours revalidates each owner's proof.
 function geometryKey(r,p){try{
  let remaining=262144;
  const rings=value=>{if(value==null)return null;if(!Array.isArray(value)||value.length>256)throw Error('unbounded rings');return value.map(q=>{if(!Array.isArray(q)||q.length>8192||(remaining-=q.length)<0)throw Error('unbounded points');return q.map(v=>{const x=Array.isArray(v)?v[0]:v?.x,y=Array.isArray(v)?v[1]:v?.y;if(!Number.isFinite(x)||!Number.isFinite(y))throw Error('invalid point');return[x,y];});});};
  const box=[p.x,p.y,p.w,p.h];if(!box.every(Number.isFinite))return null;
  const identity=[p._identitySource,p._geometryOwner,p._geometryType];if(identity.some(v=>v!=null&&(typeof v!=='string'||v.length>256)))return null;
  return JSON.stringify([box,identity,rings(p._contours),rings(p._quad?[p._quad]:null),rings(p._outline?[p._outline]:null),rings(r.panelContours(p))]);
 }catch(_){return null;}}
 const sameGeometry=(s,r)=>s.members.every((p,k)=>s.snapshots[k]!==null&&s.snapshots[k]===geometryKey(r,p));
 function matte(p){return p?._identitySource==='matte-cell-frame'&&typeof PanelMatteCells!=='undefined'&&PanelMatteCells.validPanel(p);}
 function eligible(p){return !!p?.some(q=>PanelTrailingEdgeGroups.validPanel(q)||matte(q));}
 function analyzeRGBA(rgba,w,h,owners,masks,native=null){
  if(!eligible(owners)||rgba?.length!==w*h*4||!Array.isArray(masks)||masks.length!==owners.length)return[];
  const out=[];
  for(const body of PanelCropRepair.captionBodies(rgba,w,h,true)){
   const indices=body.indices,n=indices.length;
   if(n<w*h*.001||n>w*h*.025)continue;
   const bounds=owners.map(p=>indices.every(i=>{const x=(i%w+.5)/w,y=((i/w|0)+.5)/h;return x>=p.x&&x<=p.x+p.w&&y>=p.y&&y<=p.y+p.h;}));
   const hits=masks.map(m=>indices.reduce((s,i)=>s+m[i],0));
   const choices=owners.map((p,k)=>k).filter(k=>bounds[k]&&PanelTrailingEdgeGroups.validPanel(owners[k]));
   if(choices.length===1&&bounds.filter(Boolean).length===1){
    const owner=choices[0];
    if(!hits.some((v,k)=>k!==owner&&v)&&hits[owner]<=n*.05)out.push({owner,indices,sourceThresholds:[45,65]});
    continue;
   }
   // A validated matte owner may already display only part of an isolated
   // lettered caption through its repaired envelope. Complete that body, not
   // the surrounding hull, only when its extent and current display agree on
   // one owner. Small caption overhangs are measured relative to the body;
   // another owner's bounds or a single foreign displayed pixel veto it.
   const extent=owners.map(p=>indices.reduce((count,i)=>{const x=(i%w+.5)/w,y=((i/w|0)+.5)/h;return count+ +(x>=p.x&&x<=p.x+p.w&&y>=p.y&&y<=p.y+p.h);},0));
   const partial=owners.map((p,k)=>k).filter(k=>matte(owners[k])&&extent[k]>=n*.90&&hits[k]>=n*.15&&hits[k]<=n*.85);
   if(partial.length!==1||!native||!Number.isInteger(native.w)||!Number.isInteger(native.h)||native.w<w||native.h<h||native.w*native.h>24000000||native.rgba?.length!==native.w*native.h*4)continue;const owner=partial[0];
   if(hits.some((v,k)=>k!==owner&&v)||extent.some((v,k)=>k!==owner&&v))continue;
   // A two-analysis-pixel fringe preserves source antialiasing. Admit it
   // only over the caption palette or neutral exterior paper, never art.
   const base=new Set(indices),complete=new Set(indices),nativeFringe=new Set();let safe=true;
   for(const i of indices){const x=i%w,y=i/w|0;for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){
    const X=x+dx,Y=y+dy;if(X<0||Y<0||X>=w||Y>=h){safe=false;continue;}const j=Y*w+X;
    if(complete.has(j))continue;const r=rgba[j*4],g=rgba[j*4+1],b=rgba[j*4+2],paper=Math.min(r,g,b)>220&&Math.max(r,g,b)-Math.min(r,g,b)<35,collar=r>100&&g>80&&r-b>8&&g-b>5&&Math.abs(r-g)<100;
    if((!paper&&!collar)||masks.some((m,k)=>k!==owner&&m[j]))safe=false;
    // Check every native pixel, not only a downsampled fringe value: a thin
    // foreign ink stroke must not disappear between analysis samples.
    for(let Y0=Math.floor(Y*native.h/h);Y0<Math.ceil((Y+1)*native.h/h);Y0++)for(let X0=Math.floor(X*native.w/w);X0<Math.ceil((X+1)*native.w/w);X0++){
     const z=(Y0*native.w+X0)*4,R=native.rgba[z],G=native.rgba[z+1],B=native.rgba[z+2];
     if(!(Math.min(R,G,B)>220&&Math.max(R,G,B)-Math.min(R,G,B)<35))nativeFringe.add(Y0*native.w+X0);
     const palette=j=>{const r=native.rgba[j],g=native.rgba[j+1],b=native.rgba[j+2];return native.rgba[j+3]===255&&r>100&&g>80&&r-b>8&&g-b>5&&Math.abs(r-g)<100;};
     // A non-palette pinhole is owned only when caption color encloses
     // all four native sides. Exterior paper does not establish enclosure.
     const enclosed=X0>0&&Y0>0&&X0+1<native.w&&Y0+1<native.h&&[z-4,z+4,z-native.w*4,z+native.w*4].every(palette);
     if(native.rgba[z+3]!==255||!(Math.min(R,G,B)>220&&Math.max(R,G,B)-Math.min(R,G,B)<35||palette(z)||enclosed))safe=false;
    }
    complete.add(j);
   }}
   // Palette alone cannot own a detached gold mark beside a caption.
   // Every non-paper native fringe component must connect to the measured
   // caption body through actual source foreground, not through blank paper.
   const foreground=i=>{const z=i*4,r=native.rgba[z],g=native.rgba[z+1],b=native.rgba[z+2];return !(Math.min(r,g,b)>220&&Math.max(r,g,b)-Math.min(r,g,b)<35);};
   const neighbours=i=>{const x=i%native.w,y=i/native.w|0;return [x?i-1:-1,x+1<native.w?i+1:-1,y?i-native.w:-1,y+1<native.h?i+native.w:-1].filter(j=>j>=0);};
   const attached=new Set(),queue=[];
   for(const i of nativeFringe)if(neighbours(i).some(j=>base.has(Math.floor((j/native.w|0)*h/native.h)*w+Math.floor((j%native.w)*w/native.w))&&foreground(j))){attached.add(i);queue.push(i);}
   for(let q=0;q<queue.length;q++)for(const j of neighbours(queue[q]))if(nativeFringe.has(j)&&!attached.has(j)){attached.add(j);queue.push(j);}
   if(!safe||attached.size!==nativeFringe.size)continue;
   out.push({owner,indices:[...complete],sourceThresholds:[45,65],kind:'partially-displayed-matte-caption'});
  }
  return out;
 }
 function installReader(r){
  if(!r||r._detachedCaptionsReader)return;
  const old=r.displayPanelContours;
  r.displayPanelContours=function(p,c=this.panelContours(p)){
   const owners=this.currentPanels,img=this.getPanelImageContext()?.img;
   if(!eligible(owners)||!img||typeof document?.createElement!=='function')return old.call(this,p,c);
   let s=displayStates.get(this);
   if(!s||!sameOwners(s,owners)||s.img!==img||!sameImage(s.imageKey,img)){
    const reference=owners.find(q=>PanelTrailingEdgeGroups.validPanel(q)||matte(q)),v=reference._structuralGridProof||reference._matteCellProof,w=v.analysisWidth,h=v.analysisHeight;
    s={owners,members:[...owners],snapshots:owners.map(p=>geometryKey(this,p)),img,imageKey:imageKey(img),w,h,before:new WeakMap(),cache:new WeakMap(),extended:new WeakMap(),bodies:[]};displayStates.set(this,s);
    const masks=owners.map(q=>{const rings=old.call(this,q,this.panelContours(q));s.before.set(q,rings);return PanelCropRepair.raster(rings||[],w,h);});
    const W=img.naturalWidth||img.width,H=img.naturalHeight||img.height;
    if(W*H<=24000000){const canvas=document.createElement('canvas');try{canvas.width=W;canvas.height=H;const g=canvas.getContext('2d',{willReadFrequently:true});g.drawImage(img,0,0);const native={rgba:g.getImageData(0,0,W,H).data,w:W,h:H};s.bodies=analyzeRGBA(PanelMatteCells.sampleBilinearRGBA(native.rgba,W,H,w,h),w,h,owners,masks,native);}catch(_){/* Preserve previous display without source evidence. */}finally{canvas.width=canvas.height=1;}}
   }
   if(s.bodies.some(b=>b.owner===owners.indexOf(p)&&b.kind==='partially-displayed-matte-caption')&&(!matte(p)||!sameGeometry(s,this)))return old.call(this,p,c);
   if(s.cache.has(p))return s.cache.get(p);
   const before=s.before.get(p)||old.call(this,p,c),k=owners.indexOf(p),bodies=s.bodies.filter(b=>b.owner===k);
   if(!bodies.length)return before;
   const mask=PanelCropRepair.raster(before,s.w,s.h);for(const b of bodies)for(const i of b.indices)mask[i]=1;
   const partial=bodies.some(b=>b.kind==='partially-displayed-matte-caption'),rings=PanelMatteCells.tracePixelContours(mask,s.w,s.h,1);
   if(partial&&(!Array.isArray(rings)||!rings.length||rings.some(q=>!Array.isArray(q)||q.length<4||q.some(v=>!Array.isArray(v)||v.length!==2||!Number.isInteger(v[0])||!Number.isInteger(v[1])||v[0]<0||v[0]>s.w||v[1]<0||v[1]>s.h)))){s.extended.delete(p);return before;}
   const result=rings?.map(q=>q.map(([x,y])=>({x:x/s.w,y:y/s.h})))||before;
   if(partial){for(const q of result){for(const point of q)Object.freeze(point);Object.freeze(q);}Object.freeze(result);s.extended.set(p,geometryKey(this,p));}
   s.cache.set(p,result);return result;
  };
  r._detachedCaptionsReader=true;
 }
 function extendsDisplay(r,p,img){const s=displayStates.get(r);return !!(s&&sameOwners(s,r.currentPanels)&&s.img===img&&sameImage(s.imageKey,img)&&sameGeometry(s,r)&&s.extended.get(p)===geometryKey(r,p)&&matte(p));}
 return{eligible,analyzeRGBA,installReader,extendsDisplay};
})();
if(typeof module!=='undefined')module.exports=PanelDetachedCaptions;
