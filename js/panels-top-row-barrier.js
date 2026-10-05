/* Test79 — recover a missing three-cell top row from two independent measured
 * barriers. The route is late and append-only: existing owners keep absolute
 * priority, virtual barriers affect seed separation only, and final geometry is
 * still traced from source pixels by PanelRaggedGutters. No page/book identity. */
const PanelTopRowBarrier=(()=>{
 'use strict';
 const VERSION=1,METHOD='stable-top-row-dual-barrier',finite=Number.isFinite;
 const bbox=p=>[p.x,p.y,p.x+p.w,p.y+p.h];
 const basePanel=p=>{const v={...p._structuralGridProof};delete v.topRowBarrier;return{...p,_structuralGridProof:v};};
 function visit(p,w,h,fn){
  if(!Array.isArray(p?._contours)||!p._contours.length)return false;
  for(let y=0;y<h;y++){
   const xs=[];
   for(const q of p._contours)for(let k=0;k<q.length;k++){const a=q[k],b=q[(k+1)%q.length],Y=(y+.5)/h;if((a.y>Y)!==(b.y>Y))xs.push((a.x+(Y-a.y)*(b.x-a.x)/(b.y-a.y))*w);}
   xs.sort((a,b)=>a-b);
   for(let k=0;k+1<xs.length;k+=2)for(let x=Math.max(0,Math.ceil(xs[k]-.5));x<Math.min(w,Math.ceil(xs[k+1]-.5));x++)if(fn(y*w+x)===false)return false;
  }return true;
 }
 function eligible(prior){
  return Array.isArray(prior)&&prior.length>=1&&prior.length<=4&&typeof PanelStructuralGrid!=='undefined'&&
   prior.every(p=>p?.y>.45&&Array.isArray(p._contours)&&p._contours.length&&PanelStructuralGrid.validPanel(p));
 }
 function validCorridor(e,w,h,boundary){
  if(!e||e.axis!==0||!Number.isInteger(e.pos)||Math.abs(e.pos-boundary)>2||!Number.isInteger(e.offset)||e.offset<10||
   !Array.isArray(e.before)||e.before.length!==2||!Array.isArray(e.after)||e.after.length!==2||
   !e.before.concat(e.after).every(Number.isInteger)||e.before[0]<0||e.before[0]>=e.before[1]||e.before[1]>=e.after[0]||e.after[0]>=e.after[1]||e.after[1]>h||
   !finite(e.flank)||e.flank<.40||e.flank>1||!Array.isArray(e.endWitness)||e.endWitness.length!==2||e.endWitness.some(v=>!finite(v)||v<0||v>1)||
   !Array.isArray(e.exterior)||e.exterior.length!==2||e.exterior.some(v=>!finite(v)||v<0||v>1)||Math.max(...e.exterior)<.60)return false;
  return e.pos>e.offset+1&&e.pos<w-e.offset-2;
 }
 function validPanel(p){try{
  const v=p?._structuralGridProof,t=v?.topRowBarrier,w=v?.analysisWidth,h=v?.analysisHeight;
  if(!t||t.version!==VERSION||t.method!==METHOD||t.count!==3||!Number.isInteger(t.index)||t.index<0||t.index>2||
   !['left-anchor','right-anchor'].includes(t.orientation)||!Number.isInteger(w)||!Number.isInteger(h)||
   !Number.isInteger(t.rowBottom)||t.rowBottom<h*.20||t.rowBottom>h*.48||!Number.isInteger(t.anchorBoundary)||!Number.isInteger(t.corridorBoundary)||
   Math.abs(t.corridorBoundary-t.anchorBoundary)<w*.18||Math.max(t.anchorBoundary,t.corridorBoundary)>w*.92||Math.min(t.anchorBoundary,t.corridorBoundary)<w*.08||
   JSON.stringify(t.stableHalfWidths)!=='[0,1,2]'||t.maximumBoxDrift!==2||t.originalOwnerOverlap!==0||t.sourceAlreadyDetected!==false||
   !Array.isArray(t.anchorBox)||t.anchorBox.length!==4||!Array.isArray(t.mergedBox)||t.mergedBox.length!==4||
   t.anchorBox.some(n=>!Number.isInteger(n))||t.mergedBox.some(n=>!Number.isInteger(n))||
   !Array.isArray(t.stableBoxes)||t.stableBoxes.length!==3||t.stableBoxes.some(set=>!Array.isArray(set)||set.length!==3||set.some(b=>!Array.isArray(b)||b.length!==4||b.some(n=>!Number.isInteger(n))))||
   !Array.isArray(t.corridors)||t.corridors.length<2||t.corridors.length>12||t.corridors.some(e=>!validCorridor(e,w,h,t.corridorBoundary)))return false;
  const canonical=t.stableBoxes[1][t.index];for(const set of t.stableBoxes){const b=set[t.index];if(b.some((n,i)=>Math.abs(n-canonical[i])>2))return false;}
  if(Math.abs(p.x*w-canonical[0])>1e-9||Math.abs(p.y*h-canonical[1])>1e-9||Math.abs((p.x+p.w)*w-canonical[2])>1e-9||Math.abs((p.y+p.h)*h-canonical[3])>1e-9)return false;
  return typeof PanelRaggedGutters!=='undefined'&&PanelRaggedGutters.validPanel(basePanel(p));
 }catch(_){return false;}}
 function analyzeRGBA(rgba,w,h,prior,log){
  if(!eligible(prior)||typeof PanelMatteCells==='undefined'||typeof PanelRaggedGutters==='undefined'||typeof PanelInterruptedGutters==='undefined'||
   !Number.isInteger(w)||!Number.isInteger(h)||w<250||h<350||w>900||h>900||rgba?.length!==w*h*4)return[];
  const r8=PanelRaggedGutters.analyzeCooperativeRGBA(rgba,w,h,8),top=r8.filter(p=>p.y*h<5&&(p.y+p.h)*h<h*.48).sort((a,b)=>a.x-b.x);let anchor=null,merged=null,orientation=null;
  for(const a of top){const av=a._structuralGridProof;if(av.seed.splits.length||a.w<.12||a.w>.32)continue;
   for(const m of top){if(m===a||m.w<.55||Math.abs((a.y+a.h-m.y-m.h)*h)>12)continue;
    const left=a.x<m.x+m.w*.5&&m.x<a.x+a.w&&m.x+m.w>a.x+a.w+.45;
    const right=a.x>m.x+m.w*.5&&m.x+m.w>a.x&&m.x<a.x-.45;
    if(left){anchor=a;merged=m;orientation='left-anchor';break;}if(right){anchor=a;merged=m;orientation='right-anchor';break;}
   }if(anchor)break;
  }
  if(!anchor)return[];
  const rowBottom=Math.round(((anchor.y+anchor.h)+(merged.y+merged.h))*h/2),anchorBoundary=Math.round((orientation==='left-anchor'?anchor.x+anchor.w:anchor.x)*w);
  if(rowBottom<h*.20||rowBottom>h*.48||prior.some(p=>p.y<rowBottom/h+.035))return[];
  const lines=PanelInterruptedGutters.corridors(rgba,w,h).filter(e=>e.axis===0&&e.before[0]<rowBottom*.3&&e.after[1]<rowBottom+60&&
   (orientation==='left-anchor'?e.pos>anchorBoundary+w*.12&&e.pos<w*.9:e.pos<anchorBoundary-w*.12&&e.pos>w*.1)),groups=[];
  for(const e of lines){let q=groups.find(g=>Math.abs(g.pos-e.pos)<=2);if(!q){q={pos:e.pos,ev:[]};groups.push(q);}q.ev.push(e);q.pos=q.ev.reduce((s,x)=>s+x.pos,0)/q.ev.length;}
  for(const q of groups){let lo=1e9,hi=-1;for(const e of q.ev){lo=Math.min(lo,e.before[0],e.after[0]);hi=Math.max(hi,e.before[1],e.after[1]);}q.lo=lo;q.hi=hi;q.score=(hi-lo)/rowBottom+q.ev.reduce((s,e)=>s+e.flank+Math.max(...e.exterior),0)/q.ev.length;}
  groups.sort((a,b)=>b.score-a.score);const best=groups.find(q=>q.ev.length>=2&&q.lo<=rowBottom*.2&&q.hi>=rowBottom*.45);if(!best)return[];const corridorBoundary=Math.round(best.pos);
  if(Math.abs(corridorBoundary-anchorBoundary)<w*.18)return[];
  function recover(halfWidth){const mask=new Uint8Array(w*h);for(const x of[anchorBoundary,corridorBoundary])for(let y=0;y<rowBottom;y++)for(let dx=-halfWidth;dx<=halfWidth;dx++)if(x+dx>=0&&x+dx<w)mask[y*w+x+dx]=1;return PanelRaggedGutters.analyzeRGBA(rgba,w,h,null,'cooperative-candidates',false,2,mask).filter(p=>p.y*h<12&&(p.y+p.h)*h<=rowBottom+12).sort((a,b)=>a.x-b.x);}
  const sets=[recover(0),recover(1),recover(2)];if(sets.some(set=>set.length!==3||set.some(p=>!PanelRaggedGutters.validPanel(p))))return[];
  const boxes=sets.map(set=>set.map(p=>[Math.round(p.x*w),Math.round(p.y*h),Math.round((p.x+p.w)*w),Math.round((p.y+p.h)*h)]));
  for(let i=0;i<3;i++)for(const set of boxes)if(set[i].some((n,k)=>Math.abs(n-boxes[1][i][k])>2))return[];
  const out=sets[1];if(out[0].x*w>w*.08||(out[2].x+out[2].w)*w<w*.92||out.some(p=>Math.abs((p.y+p.h)*h-rowBottom)>12))return[];
  for(const p of out){const splits=p._structuralGridProof.seed.splits;if(splits.some(s=>s.axis!==0||s.pos<rowBottom-12))return[];}
  const occupied=new Uint8Array(w*h);for(const p of prior)if(!visit(p,w,h,i=>{occupied[i]=1;}))return[];for(const p of out)if(!visit(p,w,h,i=>!occupied[i]))return[];
  const anchorBox=[Math.round(anchor.x*w),Math.round(anchor.y*h),Math.round((anchor.x+anchor.w)*w),Math.round((anchor.y+anchor.h)*h)],mergedBox=[Math.round(merged.x*w),Math.round(merged.y*h),Math.round((merged.x+merged.w)*w),Math.round((merged.y+merged.h)*h)];
  const meta={version:VERSION,method:METHOD,count:3,orientation,rowBottom,anchorBoundary,corridorBoundary,anchorBox,mergedBox,stableHalfWidths:[0,1,2],maximumBoxDrift:2,originalOwnerOverlap:0,sourceAlreadyDetected:false,corridors:best.ev,stableBoxes:boxes};
  const added=out.map((p,index)=>({...p,_structuralGridProof:{...p._structuralGridProof,topRowBarrier:{...meta,index}}}));
  if(!added.every(validPanel))return[];log?.('top row dual barrier: 3 stable pixel-traced additions');return added;
 }
 function supplementImage(img,prior,log){if(!eligible(prior))return[];const W=img.naturalWidth||img.width,H=img.naturalHeight||img.height;if(!W||!H||W*H>24000000)return[];let c;try{c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d',{willReadFrequently:true});if(!g)return[];g.drawImage(img,0,0);const s=Math.min(1,900/Math.max(W,H)),w=Math.round(W*s),h=Math.round(H*s);return analyzeRGBA(PanelMatteCells.sampleBilinearRGBA(g.getImageData(0,0,W,H).data,W,H,w,h),w,h,prior,log);}finally{if(c)c.width=c.height=1;}}
 function install(detector){if(!detector||detector._topRowBarrierInstalled)return;const old=detector.detect;detector.detect=async function(url,log){const prior=await old.call(this,url,log);if(!eligible(prior))return prior;try{const img=new Image();img.src=url;await img.decode();const add=supplementImage(img,prior,log);return add.length?prior.concat(add):prior;}catch(e){log?.('top row barrier deferred: '+e.message);return prior;}};detector._topRowBarrierInstalled=true;}
 return{analyzeRGBA,supplementImage,eligible,validPanel,install};
})();
if(typeof PanelDetect!=='undefined')PanelTopRowBarrier.install(PanelDetect);
if(typeof module!=='undefined')module.exports=PanelTopRowBarrier;
