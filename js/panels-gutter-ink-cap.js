/* Restore an ink-closed foreground cap across a certified paper gutter.
 * A stable exterior-paper opening, two independent dark barriers, exact
 * source-cell replay and exclusive lower continuity establish ownership.
 * No image identity, narrative labels or stored review coordinates are used. */
const PanelGutterInkCap=(()=>{
 'use strict';const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 function extent(mask,w,h){let x=w,y=h,X=0,Y=0,n=0;for(let i=0;i<mask.length;i++)if(mask[i]){const xx=i%w,yy=i/w|0;x=Math.min(x,xx);y=Math.min(y,yy);X=Math.max(X,xx+1);Y=Math.max(Y,yy+1);n++;}return{box:[x,y,X,Y],pixels:n};}
 function eligible(owners){if(!Array.isArray(owners)||owners.length<2||owners.length>24)return false;const cells=owners.filter(p=>PanelLandscapeCells.validPanel(p));return cells.length===2&&cells.filter(p=>p._structuralGridProof.internalDivider).length===1&&owners.every(p=>PanelGeometryOrthogonal._provenContours(p));}
 function enclosed(a,w,h,row,left,right,threshold){
  const pad=Math.max(4,Math.round((right-left)*.12)),x0=Math.max(0,left-pad),X=Math.min(w,right+pad),y0=Math.max(0,row-Math.min(Math.ceil(h*.12),Math.round((right-left)*1.5))),W=X-x0,H=row-y0+1,N=W*H,wall=new Uint8Array(N),seen=new Uint8Array(N),queue=new Int32Array(N);let n=0,head=0;
  for(let yy=0;yy<H;yy++)for(let xx=0;xx<W;xx++){const i=(yy+y0)*w+xx+x0;wall[yy*W+xx]=+(Math.max(a[4*i],a[4*i+1],a[4*i+2])<threshold||yy===H-1&&xx+x0>=left&&xx+x0<right);}
  const add=i=>{if(!wall[i]&&!seen[i]){seen[i]=1;queue[n++]=i;}};
  for(let x=0;x<W;x++){add(x);add((H-1)*W+x);}for(let y=0;y<H;y++){add(y*W);add(y*W+W-1);}while(head<n){const i=queue[head++],x=i%W,y=i/W|0;if(x)add(i-1);if(x+1<W)add(i+1);if(y)add(i-W);if(y+1<H)add(i+W);}
  const connected=new Uint8Array(N);n=0;head=0;const join=i=>{const x=i%W;if(x+x0>=left&&x+x0<right&&!seen[i]&&!connected[i]){connected[i]=1;queue[n++]=i;}};for(let x=left;x<right;x++)join((H-1)*W+x-x0);while(head<n){const i=queue[head++],x=i%W,y=i/W|0;if(x)join(i-1);if(x+1<W)join(i+1);if(y)join(i-W);if(y+1<H)join(i+W);}
  const filled=new Uint8Array(w*h),front=[];for(let x=left;x<right;x++){let top=row;for(let y=y0;y<=row;y++)if(connected[(y-y0)*W+x-x0]){top=y;break;}front.push(top);for(let y=top;y<=row;y++)if(!connected[(y-y0)*W+x-x0]){if(x>=left+Math.ceil((right-left)*.12)&&x<right-Math.ceil((right-left)*.12))return null;}else filled[y*w+x]=1;}
  const depth=row-Math.min(...front),width=right-left,edge=Math.max(2,Math.ceil(width*.15)),middle=front.slice(Math.floor(width*.3),Math.ceil(width*.7)),shoulder=front.slice(0,edge).concat(front.slice(-edge)),med=v=>v.slice().sort((a,b)=>a-b)[v.length>>1];
  if(depth<Math.max(8,width*.18)||depth>width*1.2||med(shoulder)-med(middle)<width*.16||front.slice(edge,width-edge).some((v,i,ar)=>i&&Math.abs(v-ar[i-1])>3))return null;
  const g=extent(filled,w,h);if(g.pixels<width*depth*.55||g.pixels>width*depth*1.1||Math.min(...front)<=y0+2)return null;return{mask:filled,front,box:g.box,pixels:g.pixels};
 }
 function discoverRGBA(a,w,h,upper,lower,others=[]){
  if(a?.length!==w*h*4||upper?.length!==w*h||lower?.length!==w*h||others.some(m=>m?.length!==w*h))return[];for(let i=3;i<a.length;i+=4)if(a[i]!==255)return[];
  const U=extent(upper,w,h),L=extent(lower,w,h),margin=Math.ceil(h*.02),lo=Math.max(1,L.box[1]-margin),hi=Math.min(h-2,U.box[3]+margin);if(lo>=hi||U.box[1]>=L.box[1]||U.box[3]>L.box[1]+h*.08)return[];
  const white=new Uint8Array(w*h),rows=new Uint16Array(h);for(let i=0;i<white.length;i++){const r=a[4*i],g=a[4*i+1],b=a[4*i+2];white[i]=+(Math.min(r,g,b)>205&&Math.max(r,g,b)-Math.min(r,g,b)<35);rows[i/w|0]+=white[i];}
  let row=lo;for(let y=lo+1;y<hi;y++)if(rows[y]>rows[row])row=y;if(rows[row]<w*.70)return[];const out=[];
  for(let x=1;x<w-1;x++)if(!white[row*w+x]){const left=x;while(x<w&&!white[row*w+x])x++;const right=x,width=right-left;if(width<w*.02||width>w*.15||left<w*.025||right>w*.975)continue;
   const flank=Math.ceil(w*.025);if(Array.from({length:flank},(_,k)=>white[row*w+left-k-1]&&white[row*w+right+k]).some(v=>!v))continue;
   const step=Math.max(6,Math.ceil(h*.012)),up=Math.max(0,row-step),down=Math.min(h-1,row+step);let before=0,after=0;for(let xx=left;xx<right;xx++){before+=upper[up*w+xx];after+=lower[down*w+xx];}if(before<width*.90||after<width*.90)continue;
   const caps=[150,175].map(t=>enclosed(a,w,h,row,left,right,t));if(caps.some(q=>!q))continue;let difference=0;const mask=new Uint8Array(w*h);for(let i=0;i<mask.length;i++){difference+=+(caps[0].mask[i]!==caps[1].mask[i]);mask[i]=+(caps[0].mask[i]||caps[1].mask[i]);}if(difference>Math.min(caps[0].pixels,caps[1].pixels)*.01)continue;
   // A single pixel preserves the antialiased source rim. The band stops at
   // the witnessed gutter row and cannot consume another body below it.
   const grown=mask.slice();for(let i=0;i<mask.length;i++)if(mask[i]){const xx=i%w,yy=i/w|0;if(xx)grown[i-1]=1;if(xx+1<w)grown[i+1]=1;if(yy)grown[i-w]=1;if(yy<row)grown[i+w]=1;}
   let donor=0,recipient=0,unowned=0,foreign=0;for(let i=0;i<grown.length;i++)if(grown[i]){donor+=upper[i];recipient+=lower[i];unowned+=+(!upper[i]&&!lower[i]);foreign+=+(others.some(m=>m[i]));}const g=extent(grown,w,h);if(foreign||donor<g.pixels*.50||recipient<g.pixels*.03||recipient>g.pixels*.45||unowned>g.pixels*.01||g.pixels>w*h*.008)continue;
   out.push({indices:Array.from(grown.keys()).filter(i=>grown[i]),box:g.box,row,gap:[left,right],thresholds:[150,175],difference,firstPixels:caps[0].pixels,secondPixels:caps[1].pixels,donorPixels:donor,recipientPixels:recipient,unownedPixels:unowned});
  }return out.length===1?out:[];
 }
 function analyzeRGBA(a,w,h,owners){
  if(!eligible(owners))return[];const indexes=owners.map((p,k)=>PanelLandscapeCells.validPanel(p)?k:-1).filter(k=>k>=0),cells=indexes.map(k=>owners[k]);if(cells.some(p=>p._structuralGridProof.analysisWidth!==w||p._structuralGridProof.analysisHeight!==h))return[];
  const prefix=owners.slice(0,indexes[0]);if(!prefix.length||prefix.some(p=>PanelLandscapeCells.validPanel(p)))return[];
  const replay=PanelLandscapeCells.analyzeRGBA(a,w,h,prefix);if(!same(replay,cells))return[];
  const terminal=cells.findIndex(p=>p._structuralGridProof.internalDivider),owner=indexes[terminal],foreign=indexes[1-terminal],masks=owners.map(p=>PanelLocalBoundaryConsensus.raster(p,w,h));
  return discoverRGBA(a,w,h,masks[foreign],masks[owner],masks.filter((m,k)=>k!==owner&&k!==foreign)).map(c=>({...c,owner,foreign}));
 }
 function installReader(r){if(!r||r._gutterInkCapReader)return;const old=r.displayPanelContours;
  r.displayPanelContours=function(p,c=this.panelContours(p)){const owners=this.currentPanels,img=this.getPanelImageContext()?.img;let s=this._gutterInkCap;if(!img||!owners?.includes(p)||(!(s&&s.owners===owners&&s.img===img)&&!eligible(owners)))return old.call(this,p,c);
   if(!s||s.owners!==owners||s.img!==img){const v=owners.find(p=>PanelLandscapeCells.validPanel(p))._structuralGridProof,w=v.analysisWidth,h=v.analysisHeight;s=this._gutterInkCap={owners,img,w,h,caps:[],cache:new WeakMap(),before:new WeakMap(),extended:new WeakSet()};for(const q of owners)s.before.set(q,old.call(this,q,this.panelContours(q)));
    let canvas;try{const W=img.naturalWidth||img.width,H=img.naturalHeight||img.height;if(!W||!H||W*H>24000000)return old.call(this,p,c);canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;const g=canvas.getContext('2d',{willReadFrequently:true});g.drawImage(img,0,0);s.caps=analyzeRGBA(PanelMatteCells.sampleBilinearRGBA(g.getImageData(0,0,W,H).data,W,H,w,h),w,h,owners);for(const cap of s.caps)s.extended.add(owners[cap.owner]);}catch(_){/* Source uncertainty retains established ownership. */}finally{if(canvas)canvas.width=canvas.height=1;}}
   if(s.cache.has(p))return s.cache.get(p);const before=s.before.get(p)||old.call(this,p,c);if(!s.caps.length)return before;const k=owners.indexOf(p);if(!s.caps.some(q=>q.owner===k||q.foreign===k))return before;
   const mask=PanelCropRepair.raster(before,s.w,s.h);for(const q of s.caps)if(k===q.owner||k===q.foreign)for(const i of q.indices)mask[i]=+(k===q.owner);const rings=PanelMatteCells.tracePixelContours(mask,s.w,s.h,1),result=rings?.map(q=>q.map(([x,y])=>({x:x/s.w,y:y/s.h})))||before;s.cache.set(p,result);return result;
  };
  const find=r.findPanelAt;r.findPanelAt=function(x,y){const lookup=()=>{const s=this._gutterInkCap;if(!s||!this.panelZoomEnabled||s.owners!==this.currentPanels||s.img!==this.getPanelImageContext()?.img||x<0||x>=1||y<0||y>=1)return null;const i=Math.floor(y*s.h)*s.w+Math.floor(x*s.w),q=s.caps.find(q=>q.indices.includes(i));return q?s.owners[q.owner]:null;};const ready=lookup();if(ready)return ready;const hit=find.call(this,x,y);return lookup()||hit;};r._gutterInkCapReader=true;
 }
 return{eligible,enclosed,discoverRGBA,analyzeRGBA,installReader};
})();
if(typeof module!=='undefined')module.exports=PanelGutterInkCap;
