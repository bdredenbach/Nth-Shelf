/* Test70 — bounded, witnessed reconnection of interrupted white gutters.
 * An optional late supplement. Original owners are never replaced or reordered.
 * Two independent gap limits must reconstruct exactly the same pixel contour.
 * Virtual barriers separate seeds only: source artwork and whole balloon bodies
 * remain governed by the existing raster ownership pass. No page/tap lookup.
 */
const PanelInterruptedGutters=(()=>{
 'use strict';
 const METHOD='stable-witnessed-paper-corridor',finite=Number.isFinite;
 const overlap=(a,b)=>Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y))/Math.min(a.w*a.h,b.w*b.h);
 const geometry=p=>JSON.stringify([p.x,p.y,p.w,p.h,p._contours]);
 function exterior(mask,w,h){
  const seen=new Uint8Array(w*h),queue=new Int32Array(w*h);let n=0,head=0;
  const add=i=>{if(mask[i]&&!seen[i]){seen[i]=1;queue[n++]=i;}};
  for(let x=0;x<w;x++){add(x);add((h-1)*w+x);}for(let y=0;y<h;y++){add(y*w);add(y*w+w-1);}
  while(head<n){const i=queue[head++],x=i%w,y=i/w|0;if(x)add(i-1);if(x+1<w)add(i+1);if(y)add(i-w);if(y+1<h)add(i+w);}return seen;
 }
 function corridors(rgba,w,h){
  const white=new Uint8Array(w*h);
  for(let i=0;i<white.length;i++){if(rgba[i*4+3]!==255)return[];white[i]=Math.min(rgba[i*4],rgba[i*4+1],rgba[i*4+2])>232;}
  const ext=exterior(white,w,h),unit=Math.min(w,h)/585,offset=Math.max(10,Math.round(18*unit)),runMin=Math.max(8,Math.round(12*unit)),endMin=Math.max(10,Math.round(16*unit)),witness=Math.max(12,Math.round(20*unit)),out=[];
  for(let axis=0;axis<2;axis++){
   const length=axis?w:h,cross=axis?h:w,at=(pos,t)=>axis?pos*w+t:t*w+pos;
   for(let pos=offset+2;pos<cross-offset-2;pos++){
    const runs=[];let start=-1;
    for(let t=0;t<=length;t++){
     const yes=t<length&&white[at(pos-1,t)]&&white[at(pos,t)]&&white[at(pos+1,t)];
     if(yes&&start<0)start=t;
     if(!yes&&start>=0){if(t-start>=runMin)runs.push([start,t]);start=-1;}
    }
    for(let k=1;k<runs.length;k++){
     const [a,b]=runs[k-1],[c,d]=runs[k],gap=c-b;
     if(gap<2||gap>Math.min(Math.round(120*unit),Math.floor(length*.10))||Math.min(b-a,d-c)<Math.max(endMin,gap*.5))continue;
     let flanked=0,leftWitness=0,rightWitness=0,extA=0,extB=0;
     for(let t=a;t<d;t++){
      const yes=!white[at(pos-offset,t)]&&!white[at(pos+offset,t)];flanked+=yes;
      if(t>=b-witness&&t<b)leftWitness+=yes;if(t>=c&&t<c+witness)rightWitness+=yes;
      if(t<b)extA+=ext[at(pos,t)];else if(t>=c)extB+=ext[at(pos,t)];
     }
     if(flanked/(d-a)<.40||leftWitness/witness<.25&&rightWitness/witness<.25||Math.max(extA/(b-a),extB/(d-c))<.60)continue;
     out.push({axis,pos,before:[a,b],after:[c,d],offset,flank:flanked/(d-a),endWitness:[leftWitness/witness,rightWitness/witness],exterior:[extA/(b-a),extB/(d-c)]});
    }
   }
  }
  return out;
 }
 function barrier(lines,w,h,fraction){
  const mask=new Uint8Array(w*h),unit=Math.min(w,h)/585;
  for(const e of lines){const limit=Math.min(Math.round((fraction===.08?90:120)*unit),Math.floor((e.axis?w:h)*fraction));if(e.after[0]-e.before[1]>limit)continue;for(let t=e.before[1];t<e.after[0];t++)mask[e.axis?e.pos*w+t:t*w+e.pos]=1;}
  return mask;
 }
 function validEvidence(e,w,h){
  if(!e||![0,1].includes(e.axis)||!Number.isInteger(e.pos)||!Number.isInteger(e.offset)||e.offset<10)return false;
  const length=e.axis?w:h,cross=e.axis?h:w,unit=Math.min(w,h)/585;
  if(e.offset!==Math.max(10,Math.round(18*unit))||e.pos<=e.offset+1||e.pos>=cross-e.offset-2||!Array.isArray(e.before)||!Array.isArray(e.after)||e.before.length!==2||e.after.length!==2)return false;
  const [a,b]=e.before,[c,d]=e.after,gap=c-b;
  return [a,b,c,d].every(Number.isInteger)&&a>=0&&a<b&&b<c&&c<d&&d<=length&&gap>=2&&gap<=Math.min(Math.round(120*unit),Math.floor(length*.10))&&Math.min(b-a,d-c)>=Math.max(Math.max(10,Math.round(16*unit)),gap*.5)&&finite(e.flank)&&e.flank>=.40&&e.flank<=1&&Array.isArray(e.endWitness)&&e.endWitness.length===2&&e.endWitness.every(v=>finite(v)&&v>=0&&v<=1)&&Math.max(...e.endWitness)>=.25&&Array.isArray(e.exterior)&&e.exterior.length===2&&e.exterior.every(v=>finite(v)&&v>=0&&v<=1)&&Math.max(...e.exterior)>=.60;
 }
 function nearBoundary(e,p,w,h){
  const [lo,hi]=[e.before[1],e.after[0]],a=e.axis?p.x*w:p.y*h,b=e.axis?(p.x+p.w)*w:(p.y+p.h)*h;
  const sides=e.axis?[p.y*h,(p.y+p.h)*h]:[p.x*w,(p.x+p.w)*w];
  return hi>a&&lo<b&&Math.min(...sides.map(s=>Math.abs(s-e.pos)))<=Math.max(10,Math.min(w,h)*.035);
 }
 function basePanel(p){const proof={...p._structuralGridProof};delete proof.interrupted;return {...p,_structuralGridProof:proof};}
 function validRepair(p){try{
  const v=p?._structuralGridProof,r=v?.interrupted,w=v?.analysisWidth,h=v?.analysisHeight;
  if(!r||r.version!==1||r.method!==METHOD||r.stableLimits?.length!==2||r.stableLimits[0]!==.08||r.stableLimits[1]!==.10||r.exactStableContours!==true||r.originalOwnerOverlap!==0||r.maximumEnvelopeOverlap!==.03||r.sourceAlreadyDetected!==false)return false;
  if(![19,20].includes(v.version)||v.palette?.paper!==true||v.seed?.splits?.length||p._contours?.length!==1||p.w*p.h<.025||p.w*p.h>.48||v.pixels/(p.w*p.h*w*h)<.78)return false;
  if(!Array.isArray(r.corridors)||!r.corridors.length||r.corridors.length>1000||r.corridors.some(e=>!validEvidence(e,w,h)||!nearBoundary(e,p,w,h)))return false;
  return typeof PanelRaggedGutters!=='undefined'&&PanelRaggedGutters.validPanel(basePanel(p));
 }catch(_){return false;}}
 function eligible(prior){return Array.isArray(prior)&&typeof PanelRaggedGutters!=='undefined'&&prior.every(p=>[18,19,20,21].includes(p?._structuralGridProof?.version)&&!p._structuralGridProof.interrupted&&PanelRaggedGutters.validPanel(p));}
 function visit(p,w,h,fn){
  for(let y=0;y<h;y++){
   const xs=[];
   for(const q of p._contours)for(let k=0;k<q.length;k++){const a=q[k],b=q[(k+1)%q.length],Y=(y+.5)/h;if((a.y>Y)!==(b.y>Y))xs.push((a.x+(Y-a.y)*(b.x-a.x)/(b.y-a.y))*w);}
   xs.sort((a,b)=>a-b);
   for(let k=0;k+1<xs.length;k+=2)for(let x=Math.max(0,Math.ceil(xs[k]-.5));x<Math.min(w,Math.ceil(xs[k+1]-.5));x++)if(fn(y*w+x)===false)return false;
  }return true;
 }
 function supplementRGBA(rgba,w,h,prior,log){
  if(!eligible(prior)||!Number.isInteger(w)||!Number.isInteger(h)||w<250||h<350||w>900||h>900||rgba?.length!==w*h*4||typeof PanelRaggedGutters==='undefined')return[];
  if(prior.some(p=>p._structuralGridProof.analysisWidth!==w||p._structuralGridProof.analysisHeight!==h))return[];
  const lines=corridors(rgba,w,h);if(!lines.length)return[];
  const original=PanelRaggedGutters.analyzeRGBA(rgba,w,h,null,'fallback');
  const low=PanelRaggedGutters.analyzeWithBarriersRGBA(rgba,w,h,barrier(lines,w,h,.08)),high=PanelRaggedGutters.analyzeWithBarriersRGBA(rgba,w,h,barrier(lines,w,h,.10));
  const highKeys=new Set(high.map(geometry)),occupied=new Uint8Array(w*h),out=[];
  for(const p of prior)visit(p,w,h,i=>{occupied[i]=1;});
  for(const p of low){
   if(!highKeys.has(geometry(p))||original.some(b=>overlap(p,b)>.95)||low.some(q=>q!==p&&overlap(p,q)>.03)||prior.some(q=>overlap(p,q)>.03))continue;
   const witnesses=lines.filter(e=>nearBoundary(e,p,w,h));
   const candidate={...p,_structuralGridProof:{...p._structuralGridProof,interrupted:{version:1,method:METHOD,stableLimits:[.08,.10],exactStableContours:true,originalOwnerOverlap:0,maximumEnvelopeOverlap:.03,sourceAlreadyDetected:false,corridors:witnesses}}};
   if(!validRepair(candidate)||!visit(candidate,w,h,i=>!occupied[i]))continue;
   out.push(candidate);visit(candidate,w,h,i=>{occupied[i]=1;});
  }
  if(out.length)log?.('interrupted white gutter: '+out.length+' stable, pixel-disjoint additions');return out;
 }
 function supplementImage(img,prior,log){
  if(!eligible(prior)||typeof PanelMatteCells==='undefined')return[];
  const W=img.naturalWidth||img.width,H=img.naturalHeight||img.height;if(!W||!H||W*H>24000000)return[];
  let c;try{c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d',{willReadFrequently:true});if(!g)return[];g.drawImage(img,0,0);const s=Math.min(1,900/Math.max(W,H)),w=Math.round(W*s),h=Math.round(H*s);return supplementRGBA(PanelMatteCells.sampleBilinearRGBA(g.getImageData(0,0,W,H).data,W,H,w,h),w,h,prior,log);}finally{if(c){c.width=1;c.height=1;}}
 }
 function install(detector){
  if(!detector||detector._interruptedGuttersInstalled)return;
  const previous=detector.detect;
  detector.detect=async function(url,log){
   const prior=await previous.call(this,url,log);if(!eligible(prior))return prior;
   try{const img=new Image();img.src=url;await img.decode();const added=supplementImage(img,prior,log);return added.length?prior.concat(added):prior;}catch(error){log?.('interrupted gutter deferred: '+error.message);return prior;}
  };
  detector._interruptedGuttersInstalled=true;
 }
 return{supplementRGBA,supplementImage,validRepair,eligible,install,corridors};
})();
if(typeof PanelDetect!=='undefined')PanelInterruptedGutters.install(PanelDetect);
if(typeof module!=='undefined')module.exports=PanelInterruptedGutters;
