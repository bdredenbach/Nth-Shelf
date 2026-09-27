/* Recover independently enclosed paper-gutter cells at two seed scales.
 * The stronger erosion is only a seed: the existing ragged-cell flood restores
 * the original art and enclosed lettering. Both scales must recover the same
 * cell, apart from a tiny paper-adjacent antialiasing fringe. Narrow unlettered
 * paper corridors may be sealed from the page edge by small black bridges.
 * This route never
 * replaces an existing page map and never accepts inferred straight splits. */
const PanelPaperRecovery=(()=>{
 'use strict';
 const METHOD='stable-enclosed-paper-cell',cache=new Map(),validationCache=new Map();
 const inside=(v,a,b)=>Number.isFinite(v)&&v>=a&&v<=b;
 function raster(rings,w,h){
  const out=new Uint8Array(w*h);
  for(let y=0;y<h;y++){
   const xs=[];for(const q of rings)for(let k=0;k<q.length;k++){const a=q[k],b=q[(k+1)%q.length];if((a[1]>y+.5)!==(b[1]>y+.5))xs.push(a[0]);}
   xs.sort((a,b)=>a-b);for(let k=0;k+1<xs.length;k+=2)for(let x=xs[k];x<xs[k+1];x++)out[y*w+x]=1;
  }return out;
 }
 function independent(p,radius){
  const v=p?._structuralGridProof,w=v?.analysisWidth,h=v?.analysisHeight,b=v?.seed?.box;
  if(typeof PanelRaggedGutters==='undefined'||!PanelRaggedGutters.validPanel(p)||v.seedRadius!==radius||!v.palette.paper||!b||v.seed.splits.length||p.x*w<3||p.y*h<3||(p.x+p.w)*w>w-3||(p.y+p.h)*h>h-3||p.w*p.h>.48||v.pixels/(p.w*p.h*w*h)<.73||v.seed.pixels/((b[2]-b[0])*(b[3]-b[1]))<.68)return false;
  return true;
 }
 function geometry(first,second){
  if(!independent(first,4)||!independent(second,6))return null;
  const a=first._structuralGridProof,b=second._structuralGridProof,w=a.analysisWidth,h=a.analysisHeight;
  if(w!==b.analysisWidth||h!==b.analysisHeight)return null;
  const key=JSON.stringify([first,second]);if(cache.has(key))return JSON.parse(cache.get(key));
  const A=raster(a.pixelContours,w,h),B=raster(b.pixelContours,w,h),differencePixels=[];let intersection=0,union=0,difference=0;
  for(let i=0;i<A.length;i++){intersection+=A[i]&&B[i]?1:0;union+=A[i]||B[i]?1:0;if(A[i]!==B[i]){difference++;differencePixels.push(i);}}
  if(intersection/union<.999||difference>Math.max(12,Math.floor(w*h*.00004)))return null;
  // A stable whole scene cannot contain a substantial unresolved paper seam.
  const box=[Math.round(second.x*w),Math.round(second.y*h),Math.round((second.x+second.w)*w),Math.round((second.y+second.h)*h)];
  for(let axis=0;axis<2;axis++){
   const length=box[axis?2:3]-box[axis?0:1],span=box[axis?3:2]-box[axis?1:0],band=Math.max(8,Math.round(length*.055));
   for(let pos=Math.max(band*2,Math.round(length*.12));pos<length-Math.max(band*2,Math.round(length*.12));pos++){
    let gap=0,flank=0;for(let t=0;t<span;t++){
     const i=(axis?box[1]+t:box[1]+pos)*w+(axis?box[0]+pos:box[0]+t),step=axis?1:w;
     if(!B[i]){gap++;flank+=B[i-band*step]&&B[i+band*step]?1:0;}
    }if(gap/span>.20&&flank/span>.12)return null;
   }
  }
  const result={intersection,union,difference,differencePixels,pixels:b.pixels,pixelContours:b.pixelContours,x:second.x,y:second.y,w:second.w,h:second.h};
  cache.set(key,JSON.stringify(result));if(cache.size>8)cache.delete(cache.keys().next().value);return result;
 }
 function exteriorPaper(rgba,w,h){
  const white=new Uint8Array(w*h),out=new Uint8Array(w*h),queue=new Int32Array(w*h);let n=0,head=0;
  for(let i=0;i<white.length;i++){if(rgba[i*4+3]!==255)return null;white[i]=Math.min(rgba[i*4],rgba[i*4+1],rgba[i*4+2])>232?1:0;}
  const add=i=>{if(white[i]&&!out[i]){out[i]=1;queue[n++]=i;}};
  for(let x=0;x<w;x++){add(x);add((h-1)*w+x);}for(let y=0;y<h;y++){add(y*w);add(y*w+w-1);}
  while(head<n){const i=queue[head++],x=i%w,y=i/w|0;if(x)add(i-1);if(x+1<w)add(i+1);if(y)add(i-w);if(y+1<h)add(i+w);}
  const corridorIds=new Uint16Array(w*h),corridors=[],seen=out.slice();
  for(let seed=0;seed<white.length;seed++)if(white[seed]&&!seen[seed]){
   n=1;head=0;queue[0]=seed;seen[seed]=1;let x0=w,y0=h,x1=0,y1=0;const minColor=[255,255,255];
   while(head<n){const i=queue[head++],x=i%w,y=i/w|0;x0=Math.min(x0,x);x1=Math.max(x1,x+1);y0=Math.min(y0,y);y1=Math.max(y1,y+1);for(let k=0;k<3;k++)minColor[k]=Math.min(minColor[k],rgba[i*4+k]);for(const j of[x?i-1:-1,x+1<w?i+1:-1,y?i-w:-1,y+1<h?i+w:-1])if(j>=0&&white[j]&&!seen[j]){seen[j]=1;queue[n++]=j;}}
   const long=Math.max(x1-x0,y1-y0),short=Math.min(x1-x0,y1-y0);
   if(long<Math.max(w,h)*.15||short>Math.min(w,h)*.035||long<short*8||n<w*h*.0005||corridors.length>=32)continue;
   const mask=new Uint8Array(w*h);for(let k=0;k<n;k++)mask[queue[k]]=1;
   const pixelContours=PanelMatteCells.tracePixelContours(mask,w,h,1);if(pixelContours?.length!==1)continue;
   const id=corridors.length+1;corridors.push({pixelContours,pixels:n,minColor});for(let k=0;k<n;k++){const i=queue[k];out[i]=1;corridorIds[i]=id;}
  }
  let near=out;for(let k=0;k<2;k++){const next=near.slice();for(let i=0;i<near.length;i++)if(near[i]){const x=i%w,y=i/w|0;if(x)next[i-1]=1;if(x+1<w)next[i+1]=1;if(y)next[i-w]=1;if(y+1<h)next[i+w]=1;}near=next;}
  return {mask:out,near,corridors,corridorIds};
 }
 function corridorFlanks(c,own,neighbor,w,h){
  if(!independent(neighbor,6)||neighbor._structuralGridProof.analysisWidth!==w||neighbor._structuralGridProof.analysisHeight!==h)return null;
  const A=raster(own._structuralGridProof.pixelContours,w,h),B=raster(neighbor._structuralGridProof.pixelContours,w,h),q=c.pixelContours[0],xs=q.map(p=>p[0]),ys=q.map(p=>p[1]),box=[Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)],vertical=box[3]-box[1]>=box[2]-box[0],C=raster(c.pixelContours,w,h);
  if(A.some((v,i)=>v&&B[i]))return null;
  let samples=0,matched=0;
  for(let line=box[vertical?1:0];line<box[vertical?3:2];line++){
   let lo=w+h,hi=-1;for(let k=box[vertical?0:1];k<box[vertical?2:3];k++)if(C[vertical?line*w+k:k*w+line]){lo=Math.min(lo,k);hi=k;}
   if(hi<0)continue;samples++;let left=0,right=0;
   for(let d=1;d<=8;d++){
    const l=lo-d,r=hi+d,li=vertical?line*w+l:l*w+line,ri=vertical?line*w+r:r*w+line;
    if(!left&&l>=0)left=A[li]?1:B[li]?2:0;if(!right&&r<(vertical?w:h))right=A[ri]?1:B[ri]?2:0;
   }if(left&&right&&left!==right)matched++;
  }
  return samples>=Math.max(w,h)*.15&&matched/samples>=.75?{samples,matched}:null;
 }
 function analyzeRGBA(rgba,w,h,log){
  if(typeof PanelRaggedGutters==='undefined'||typeof PanelRaggedGutters.analyzePaperRecoveryRGBA!=='function'||!Number.isInteger(w)||!Number.isInteger(h)||w<250||h<350||w>900||h>900||rgba?.length!==w*h*4)return [];
  const first=PanelRaggedGutters.analyzePaperRecoveryRGBA(rgba,w,h,4).filter(p=>independent(p,4));if(!first.length)return [];
  const second=PanelRaggedGutters.analyzePaperRecoveryRGBA(rgba,w,h,6).filter(p=>independent(p,6));if(!second.length)return [];
  const paper=exteriorPaper(rgba,w,h);if(!paper)return [];
  const out=[],occupied=new Uint8Array(w*h);
  for(const b of second){
   const matches=first.map(a=>({a,g:geometry(a,b)})).filter(v=>v.g);if(matches.length!==1)continue;
   const {a,g}=matches[0],B=raster(b._structuralGridProof.pixelContours,w,h);
   const fringe=[];for(const i of g.differencePixels){
    if(!paper.near[i])break;const x=i%w,y=i/w|0;let found=-1;
    for(let dy=-2;dy<=2&&found<0;dy++)for(let dx=-2;dx<=2;dx++){const X=x+dx,Y=y+dy;if(Math.abs(dx)+Math.abs(dy)<=2&&X>=0&&Y>=0&&X<w&&Y<h&&paper.mask[Y*w+X]){found=Y*w+X;break;}}
    if(found<0)break;fringe.push([i,found,rgba[found*4],rgba[found*4+1],rgba[found*4+2],paper.corridorIds[found]]);
   }if(fringe.length!==g.difference)continue;
   const corridors=paper.corridors.map(c=>({...c}));let bounded=true;
   for(let k=0;k<corridors.length;k++)if(fringe.some(s=>s[5]===k+1)){
    const choices=second.filter(n=>n!==b).map(n=>({neighbor:n,flanks:corridorFlanks(corridors[k],b,n,w,h)})).filter(v=>v.flanks);
    if(choices.length!==1){bounded=false;break;}Object.assign(corridors[k],choices[0]);
   }if(!bounded)continue;
   const proof={version:22,method:METHOD,analysisWidth:w,analysisHeight:h,radii:[4,6],first:a,second:b,intersection:g.intersection,union:g.union,difference:g.difference,fringe,corridors,pixels:g.pixels,pixelContours:g.pixelContours};
   const panel={x:g.x,y:g.y,w:g.w,h:g.h,_identitySource:'structural-grid-frame',_geometryOwner:'structural-grid-contours',_geometryType:'stable-enclosed-paper-cell',_contours:g.pixelContours.map(q=>q.map(([x,y])=>({x:x/w,y:y/h}))),_structuralGridProof:proof};
   if(validPanel(panel)){if(B.some((v,i)=>v&&occupied[i]))return [];for(let i=0;i<B.length;i++)if(B[i])occupied[i]=1;out.push(panel);}
  }
  if(out.length)log?.('stable enclosed paper cells: '+out.length);return out;
 }
 function validPanel(panel){try{
  const key=JSON.stringify(panel);if(validationCache.has(key))return true;
  const p=panel?._structuralGridProof;if(p?.version!==22||p.method!==METHOD||panel._identitySource!=='structural-grid-frame'||panel._geometryOwner!=='structural-grid-contours'||panel._geometryType!=='stable-enclosed-paper-cell'||panel._quad||panel._outline||JSON.stringify(p.radii)!=='[4,6]')return false;
  const g=geometry(p.first,p.second),w=p.analysisWidth,h=p.analysisHeight;if(!g||w!==p.first._structuralGridProof.analysisWidth||h!==p.first._structuralGridProof.analysisHeight||p.intersection!==g.intersection||p.union!==g.union||p.difference!==g.difference||p.pixels!==g.pixels||JSON.stringify(p.pixelContours)!==JSON.stringify(g.pixelContours))return false;
  if(!Array.isArray(p.corridors)||p.corridors.length>32)return false;
  const corridorMasks=[];for(const c of p.corridors){
   const q=c?.pixelContours?.[0];if(c?.pixelContours?.length!==1||!Array.isArray(q)||q.length<4||q.length>4096||q.some((a,i)=>a?.length!==2||a.some(v=>!Number.isInteger(v))||a[0]<0||a[0]>w||a[1]<0||a[1]>h||a[0]!==q[(i+1)%q.length][0]&&a[1]!==q[(i+1)%q.length][1])||!Array.isArray(c.minColor)||c.minColor.length!==3||c.minColor.some(v=>!Number.isInteger(v)||v<=232||v>255))return false;
   const xs=q.map(a=>a[0]),ys=q.map(a=>a[1]),bw=Math.max(...xs)-Math.min(...xs),bh=Math.max(...ys)-Math.min(...ys),long=Math.max(bw,bh),short=Math.min(bw,bh),mask=raster(c.pixelContours,w,h),pixels=mask.reduce((s,v)=>s+v,0),area=Math.abs(q.reduce((s,a,i)=>{const b=q[(i+1)%q.length];return s+a[0]*b[1]-b[0]*a[1];},0)/2);
   if(long<Math.max(w,h)*.15||short>Math.min(w,h)*.035||long<short*8||pixels<w*h*.0005||pixels!==c.pixels||area!==pixels)return false;corridorMasks.push(mask);
  }
  if(!Array.isArray(p.fringe)||p.fringe.length!==g.difference||p.fringe.some((s,k)=>!Array.isArray(s)||s.length!==6||s.some(v=>!Number.isInteger(v))||s[0]!==g.differencePixels[k]||s[1]<0||s[1]>=w*h||Math.abs(s[0]%w-s[1]%w)+Math.abs((s[0]/w|0)-(s[1]/w|0))>2||s.slice(2,5).some(v=>v<=232||v>255)||s[5]<0||s[5]>p.corridors.length||s[5]>0&&!corridorMasks[s[5]-1][s[1]]||s[5]===0&&corridorMasks.some(m=>m[s[1]])))return false;
  for(let k=0;k<p.corridors.length;k++)if(p.fringe.some(s=>s[5]===k+1)){const c=p.corridors[k],flanks=corridorFlanks(c,p.second,c.neighbor,w,h);if(!flanks||JSON.stringify(flanks)!==JSON.stringify(c.flanks))return false;}
  const valid=['x','y','w','h'].every(k=>inside(panel[k],0,1)&&Math.abs(panel[k]-g[k])<1e-10)&&JSON.stringify(panel._contours)===JSON.stringify(g.pixelContours.map(q=>q.map(([x,y])=>({x:x/w,y:y/h}))));
  if(valid){validationCache.set(key,true);if(validationCache.size>16)validationCache.delete(validationCache.keys().next().value);}return valid;
 }catch(_){return false;}}
 function completeImage(img,panels,log){
  if(!Array.isArray(panels)||panels.length||typeof PanelMatteCells==='undefined')return [];
  const W=img.naturalWidth||img.width,H=img.naturalHeight||img.height;if(!W||!H||W*H>24000000)return [];
  let canvas;try{canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;const ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)return [];ctx.drawImage(img,0,0);const s=Math.min(1,900/Math.max(W,H)),w=Math.round(W*s),h=Math.round(H*s);return analyzeRGBA(PanelMatteCells.sampleBilinearRGBA(ctx.getImageData(0,0,W,H).data,W,H,w,h),w,h,log);}finally{if(canvas){canvas.width=1;canvas.height=1;}}
 }
 return {analyzeRGBA,completeImage,validPanel};
})();
if(typeof module!=='undefined')module.exports=PanelPaperRecovery;
