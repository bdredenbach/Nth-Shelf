/* Restore an indivisible speech body across independently traced paper cells.
 * Exact source replay and two exclusive tail witnesses decide its owner.
 * No narrative labels, page identities or stored review coordinates are used. */
const PanelGutterTailSpeech=(()=>{
 'use strict';const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 function eligible(owners){return Array.isArray(owners)&&owners.length>=3&&owners.length<=24&&owners.every(p=>p?._structuralGridProof?.version===18&&p._structuralGridProof.palette?.paper===true&&!p._structuralGridProof.seedRadius&&PanelRaggedGutters.validPanel(p)&&p._structuralGridProof.count===owners.length);}
 function nearTips(a,b,w){return a.every(i=>b.some(j=>Math.abs(i%w-j%w)<=3&&Math.abs((i/w|0)-(j/w|0))<=3))&&b.every(i=>a.some(j=>Math.abs(i%w-j%w)<=3&&Math.abs((i/w|0)-(j/w|0))<=3));}
 function analyzeRGBA(a,w,h,owners){
  if(!eligible(owners)||a?.length!==w*h*4||owners.some(p=>p._structuralGridProof.analysisWidth!==w||p._structuralGridProof.analysisHeight!==h))return[];
  for(let i=3;i<a.length;i+=4)if(a[i]!==255)return[];
  if(!same(PanelRaggedGutters.analyzeRGBA(a,w,h),owners))return[];
  const white=t=>Uint8Array.from({length:w*h},(_,i)=>+(Math.min(a[4*i],a[4*i+1],a[4*i+2])>t&&Math.max(a[4*i],a[4*i+1],a[4*i+2])-Math.min(a[4*i],a[4*i+1],a[4*i+2])<40)),sets=[190,210].map(t=>PanelColoredRims.whiteBodies(white(t),w,h)?.items||[]),masks=owners.map(p=>PanelLocalBoundaryConsensus.raster(p,w,h)),out=[];
  for(const b of sets[0]){const n=b.indices.length,[x,y,X,Y]=b.box;if(n<500||n>w*h*.04||x<5||y<5||X>w-5||Y>h-5)continue;
   const mask=new Uint8Array(w*h);for(const i of b.indices)mask[i]=1;
   const twins=sets[1].filter(c=>c.box.every((v,k)=>Math.abs(v-b.box[k])<=1)&&Math.abs(c.indices.length-n)<=n*.01&&c.indices.reduce((s,i)=>s+mask[i],0)>=n*.99);if(twins.length!==1)continue;
   const tails=[4,6].map(r=>PanelGradientResidualGroups.speechTail(mask,w,h,b.box,r));if(tails.some(t=>!t||t.length>Math.min(w,h)*.12||t.pixels>n*.08)||!nearTips(tails[0].tips,tails[1].tips,w))continue;
   const choices=owners.map((p,k)=>k).filter(k=>tails.every(t=>t.tips.every(i=>masks[k][i]&&!masks.some((m,j)=>j!==k&&m[i]))));if(choices.length!==1)continue;
   const owner=choices[0],hits=masks.map(m=>b.indices.reduce((s,i)=>s+m[i],0)),foreign=hits.map((v,k)=>k).filter(k=>k!==owner&&hits[k]>n*.20);
   if(foreign.length!==1||hits[owner]<n*.20||hits[owner]>n*.80||hits[foreign[0]]>n*.80||hits.reduce((s,v)=>s+v,0)<n*.98)continue;
   const ink=new Uint8Array(w*h);let dark=0;for(const i of b.indices)if(Math.max(a[4*i],a[4*i+1],a[4*i+2])<100){dark++;ink[i]=1;}
   const letters=PanelEmptyEnclosureGroups.components(ink,w,h).items.filter(c=>c.pixels>=3&&c.pixels<n*.08).length;if(letters<8||dark<n*.05||dark>n*.35)continue;
   out.push({owner,foreign:foreign[0],indices:b.indices,box:b.box,tails,letters,hits});
  }return out;
 }
 function installReader(r){if(!r||r._gutterTailSpeechReader)return;const old=r.displayPanelContours;
  r.displayPanelContours=function(p,c=this.panelContours(p)){const owners=this.currentPanels,img=this.getPanelImageContext()?.img;if(!eligible(owners)||!img||!owners.includes(p))return old.call(this,p,c);
   let s=this._gutterTailSpeech;if(!s||s.owners!==owners||s.img!==img){const v=owners[0]._structuralGridProof,w=v.analysisWidth,h=v.analysisHeight;s=this._gutterTailSpeech={owners,img,w,h,bodies:[],cache:new WeakMap(),before:new WeakMap()};for(const q of owners)s.before.set(q,old.call(this,q,this.panelContours(q)));
    const canvas=document.createElement('canvas');try{const W=img.naturalWidth||img.width,H=img.naturalHeight||img.height;if(!W||!H||W*H>24000000)return old.call(this,p,c);canvas.width=W;canvas.height=H;const g=canvas.getContext('2d',{willReadFrequently:true});g.drawImage(img,0,0);s.bodies=analyzeRGBA(PanelMatteCells.sampleBilinearRGBA(g.getImageData(0,0,W,H).data,W,H,w,h),w,h,owners);}catch(_){/* Retain established ownership if source evidence is unavailable. */}finally{canvas.width=canvas.height=1;}}
   if(s.cache.has(p))return s.cache.get(p);const before=s.before.get(p)||old.call(this,p,c);if(!s.bodies.length)return before;
   const mask=PanelCropRepair.raster(before,s.w,s.h),k=owners.indexOf(p);for(const b of s.bodies)if(k===b.owner||k===b.foreign)for(const i of b.indices)mask[i]=+(k===b.owner);
   const rings=PanelMatteCells.tracePixelContours(mask,s.w,s.h,1),result=rings?.map(q=>q.map(([x,y])=>({x:x/s.w,y:y/s.h})))||before;s.cache.set(p,result);return result;
  };
  const find=r.findPanelAt;r.findPanelAt=function(x,y){const hit=find.call(this,x,y),s=this._gutterTailSpeech;if(!s||!this.panelZoomEnabled||s.owners!==this.currentPanels||s.img!==this.getPanelImageContext()?.img||x<0||x>=1||y<0||y>=1)return hit;
   const i=Math.floor(y*s.h)*s.w+Math.floor(x*s.w),b=s.bodies.find(b=>b.indices.includes(i));return b?s.owners[b.owner]:hit;};r._gutterTailSpeechReader=true;
 }
 return{eligible,analyzeRGBA,installReader};
})();
if(typeof module!=='undefined')module.exports=PanelGutterTailSpeech;
