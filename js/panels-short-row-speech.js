/* Complete enclosed speech clipped by a proven paper-row split. Independent
 * paper thresholds and short-tail openings must agree on the same row owner.
 * Only speech pixels change; discovery descriptors and artwork stay intact. */
const PanelShortRowSpeech=(()=>{
 'use strict';
 function row(p,w,h){const v=p?._matteCellProof;return p?._geometryType==='edge-connected-matte-cell'&&v?.version===1&&v.mode==='paper'&&v.source==='split'&&v.analysisWidth===w&&v.analysisHeight===h&&p.w>=.8&&p.h<=.30&&!!PanelGeometryOrthogonal._provenContours(p);}
 function close(a,b,w){return a.every(i=>b.some(j=>Math.abs(i%w-j%w)<=2&&Math.abs((i/w|0)-(j/w|0))<=2))&&b.every(i=>a.some(j=>Math.abs(i%w-j%w)<=2&&Math.abs((i/w|0)-(j/w|0))<=2));}
 function analyzeRGBA(rgba,w,h,owners=[]){
  if(!Number.isInteger(w)||!Number.isInteger(h)||w<250||h<350||w>900||h>900||rgba?.length!==w*h*4||!Array.isArray(owners)||owners.length<2||owners.length>24||owners.filter(p=>row(p,w,h)).length<2||owners.some(p=>!PanelGeometryOrthogonal._provenContours(p)))return[];
  for(let i=3;i<rgba.length;i+=4)if(rgba[i]!==255)return[];
  const masks=owners.map(p=>PanelLocalBoundaryConsensus.raster(p,w,h)),white=t=>Uint8Array.from({length:w*h},(_,i)=>+(Math.min(rgba[4*i],rgba[4*i+1],rgba[4*i+2])>t&&Math.max(rgba[4*i],rgba[4*i+1],rgba[4*i+2])-Math.min(rgba[4*i],rgba[4*i+1],rgba[4*i+2])<40)),sets=[190,210].map(t=>PanelColoredRims.whiteBodies(white(t),w,h)?.items||[]),paper=white(190),out=[];
  for(const b of sets[0]){const n=b.indices.length,[x0,y0,x1,y1]=b.box;if(n<1000||n>w*h*.04||x0<3||y0<3||x1>w-3||y1>h-3||n/((x1-x0)*(y1-y0))<.48)continue;
   const mask=new Uint8Array(w*h);for(const i of b.indices)mask[i]=1;const matches=sets[1].filter(q=>q.box.every((v,k)=>Math.abs(v-b.box[k])<=1)&&Math.abs(q.indices.length-n)<=n*.01&&q.indices.reduce((s,i)=>s+mask[i],0)>=n*.99);if(matches.length!==1)continue;
   const tails=[4,6].map(r=>PanelGradientResidualGroups.speechTail(mask,w,h,b.box,r));if(tails.some(t=>!t||t.length>Math.min(w,h)*.06||t.pixels>n*.05)||!close(tails[0].tips,tails[1].tips,w))continue;
   const tipHits=tails.map(t=>masks.map(m=>t.tips.reduce((s,i)=>s+m[i],0))),eligible=owners.map((p,k)=>k).filter(k=>row(owners[k],w,h)&&tails.every((t,r)=>tipHits[r][k]>=t.tips.length*.8)&&tipHits.every(hits=>hits.every((v,j)=>j===k||!v)));if(eligible.length!==1)continue;const owner=eligible[0],hits=masks.map(m=>b.indices.reduce((s,i)=>s+m[i],0));if(hits[owner]<n*.05||hits[owner]>n*.20||hits.reduce((s,v)=>s+v,0)>n*.35)continue;
   let edges=0,ink=0,pap=0,dark=0;const letters=new Uint8Array(w*h);for(const i of b.indices){pap+=paper[i];if(Math.max(rgba[4*i],rgba[4*i+1],rgba[4*i+2])<100){dark++;letters[i]=1;}if(!mask[i-1]||!mask[i+1]||!mask[i-w]||!mask[i+w]){edges++;const x=i%w,y=i/w|0;let lo=255;for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const j=4*((y+dy)*w+x+dx);lo=Math.min(lo,.299*rgba[j]+.587*rgba[j+1]+.114*rgba[j+2]);}ink+=+(lo<90);}}
   const count=PanelEmptyEnclosureGroups.components(letters,w,h).items.filter(q=>q.pixels>=3&&q.pixels<n*.08).length;if(ink<edges*.90||pap<n*.60||pap>n*.95||dark<n*.05||dark>n*.35||count<8)continue;
   out.push({owner,indices:b.indices,box:b.box,tails,tipHits,hits,ink,edges,letters:count,pixels:n});
  }return out;
 }
 function installReader(reader){if(!reader||reader._shortRowSpeech)return;const old=reader.displayPanelContours;reader.displayPanelContours=function(p,contours=this.panelContours(p)){
  const owners=this.currentPanels;if(!owners?.some(q=>{const v=q?._matteCellProof;return row(q,v?.analysisWidth,v?.analysisHeight);} ))return old.call(this,p,contours);
  const img=this.getPanelImageContext()?.img;if(!img)return old.call(this,p,contours);let state=this._shortRowSpeechDisplay;
  if(!state||state.owners!==owners||state.img!==img){const v=owners.find(q=>{const v=q?._matteCellProof;return row(q,v?.analysisWidth,v?.analysisHeight);})._matteCellProof,w=v.analysisWidth,h=v.analysisHeight;state=this._shortRowSpeechDisplay={owners,img,w,h,cache:new WeakMap(),extended:new WeakSet(),bodies:[]};
   try{const W=img.naturalWidth||img.width,H=img.naturalHeight||img.height;if(W*H<=24000000){const c=document.createElement('canvas');c.width=W;c.height=H;try{const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(img,0,0);state.bodies=analyzeRGBA(PanelMatteCells.sampleBilinearRGBA(g.getImageData(0,0,W,H).data,W,H,w,h),w,h,owners);}finally{c.width=c.height=1;}}}catch(_){/* Preserve prior display when source evidence is unavailable. */}}
  if(state.cache.has(p))return state.cache.get(p);const before=old.call(this,p,contours);if(!state.bodies.length)return before;const mask=PanelCropRepair.raster(before,state.w,state.h),k=owners.indexOf(p);for(const b of state.bodies){if(b.owner===k)state.extended.add(p);for(const i of b.indices)mask[i]=+(b.owner===k);}const traced=PanelGradientResidualGroups.trace(mask,state.w,state.h,1),result=traced?.map(q=>q.map(([x,y])=>({x:x/state.w,y:y/state.h})))||before;state.cache.set(p,result);return result;
 };const find=reader.findPanelAt;reader.findPanelAt=function(x,y){const hit=find.call(this,x,y);if(hit||!this.panelZoomEnabled)return hit;const s=this._shortRowSpeechDisplay;if(s?.owners!==this.currentPanels||s?.img!==this.getPanelImageContext()?.img)return hit;const i=Math.floor(y*s.h)*s.w+Math.floor(x*s.w);if(x<0||x>=1||y<0||y>=1)return hit;const b=s.bodies.find(b=>b.indices.includes(i));return b?s.owners[b.owner]:hit;};reader._shortRowSpeech=true;}
 return{analyzeRGBA,installReader,row};
})();
