/* Attach a detached, source-enclosed caption to a trailing-edge owner.
 * Both source palettes must enclose the same lettered body. The complete
 * body must lie inside exactly one owner's bounds and touch no other owner.
 * This repairs display ownership; it never establishes scene continuity. */
const PanelDetachedCaptions=(()=>{
 'use strict';
 function eligible(p){return !!p?.some(q=>PanelTrailingEdgeGroups.validPanel(q));}
 function analyzeRGBA(rgba,w,h,owners,masks){
  if(!eligible(owners)||rgba?.length!==w*h*4||!Array.isArray(masks)||masks.length!==owners.length)return[];
  const out=[];
  for(const body of PanelCropRepair.captionBodies(rgba,w,h,true)){
   const indices=body.indices,n=indices.length;
   if(n<w*h*.001||n>w*h*.025)continue;
   const bounds=owners.map(p=>indices.every(i=>{const x=(i%w+.5)/w,y=((i/w|0)+.5)/h;return x>=p.x&&x<=p.x+p.w&&y>=p.y&&y<=p.y+p.h;}));
   const choices=owners.map((p,k)=>k).filter(k=>bounds[k]&&PanelTrailingEdgeGroups.validPanel(owners[k]));
   if(choices.length!==1||bounds.filter(Boolean).length!==1)continue;
   const owner=choices[0],hits=masks.map(m=>indices.reduce((s,i)=>s+m[i],0));
   if(hits.some((v,k)=>k!==owner&&v)||hits[owner]>n*.05)continue;
   out.push({owner,indices,sourceThresholds:[45,65]});
  }
  return out;
 }
 function installReader(r){
  if(!r||r._detachedCaptionsReader)return;
  const old=r.displayPanelContours;
  r.displayPanelContours=function(p,c=this.panelContours(p)){
   const owners=this.currentPanels,img=this.getPanelImageContext()?.img;
   if(!eligible(owners)||!img||typeof document?.createElement!=='function')return old.call(this,p,c);
   let s=this._detachedCaptionsDisplay;
   if(!s||s.owners!==owners||s.img!==img){
    const v=owners.find(q=>PanelTrailingEdgeGroups.validPanel(q))._structuralGridProof,w=v.analysisWidth,h=v.analysisHeight;
    s=this._detachedCaptionsDisplay={owners,img,w,h,before:new WeakMap(),cache:new WeakMap(),bodies:[]};
    const masks=owners.map(q=>{const rings=old.call(this,q,this.panelContours(q));s.before.set(q,rings);return PanelCropRepair.raster(rings,w,h);});
    const W=img.naturalWidth||img.width,H=img.naturalHeight||img.height;
    if(W*H<=24000000){const canvas=document.createElement('canvas');try{canvas.width=W;canvas.height=H;const g=canvas.getContext('2d',{willReadFrequently:true});g.drawImage(img,0,0);s.bodies=analyzeRGBA(PanelMatteCells.sampleBilinearRGBA(g.getImageData(0,0,W,H).data,W,H,w,h),w,h,owners,masks);}catch(_){/* Preserve previous display without source evidence. */}finally{canvas.width=canvas.height=1;}}
   }
   if(s.cache.has(p))return s.cache.get(p);
   const before=s.before.get(p)||old.call(this,p,c),k=owners.indexOf(p),bodies=s.bodies.filter(b=>b.owner===k);
   if(!bodies.length)return before;
   const mask=PanelCropRepair.raster(before,s.w,s.h);for(const b of bodies)for(const i of b.indices)mask[i]=1;
   const rings=PanelMatteCells.tracePixelContours(mask,s.w,s.h,1),result=rings?.map(q=>q.map(([x,y])=>({x:x/s.w,y:y/s.h})))||before;s.cache.set(p,result);return result;
  };
  r._detachedCaptionsReader=true;
 }
 return{eligible,analyzeRGBA,installReader};
})();
if(typeof module!=='undefined')module.exports=PanelDetachedCaptions;
