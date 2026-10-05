/* Test80 — stable full-width torn-paper horizontal tiers.
 * Runs only when one established owner exists. Pixel-derived paper separators
 * are used only as temporary barriers; final contours are re-grown by the
 * retained ragged-gutter proof at three barrier widths. No page/book identity. */
const PanelHorizontalPaperStrips=(()=>{
 'use strict';
 const VERSION=1,METHOD='stable-horizontal-paper-strips';
 const finite=Number.isFinite;
 const overlap=(a,b)=>{const x=Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x)),y=Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y));return x*y;};
 const area=p=>Math.max(0,p.w*p.h);
 const box=(p,w,h)=>[Math.round(p.x*w),Math.round(p.y*h),Math.round((p.x+p.w)*w),Math.round((p.y+p.h)*h)];
 function eligible(prior){return Array.isArray(prior)&&prior.length===1&&prior[0]&&finite(prior[0].x)&&finite(prior[0].y)&&finite(prior[0].w)&&finite(prior[0].h);}
 function separators(rgba,w,h){
  const f=new Float64Array(h),s=new Float64Array(h);
  for(let y=0;y<h;y++){let n=0;for(let x=0;x<w;x++){const i=(y*w+x)*4,r=rgba[i],g=rgba[i+1],b=rgba[i+2],mn=Math.min(r,g,b),mx=Math.max(r,g,b);if(mn>236&&mx-mn<32)n++;}f[y]=n/w;}
  for(let y=0;y<h;y++){let sum=0,n=0;for(let d=-2;d<=2;d++)if(y+d>=0&&y+d<h){sum+=f[y+d];n++;}s[y]=sum/n;}
  const runs=[];let start=null;
  for(let y=0;y<h;y++){const on=s[y]>.48;if(on&&start===null)start=y;if(!on&&start!==null){if(y-start>=2&&start>h*.04&&y<h*.96)runs.push([start,y]);start=null;}}
  if(start!==null&&h-start>=2&&start>h*.04&&start<h*.96)runs.push([start,h]);
  const merged=[];for(const r of runs){if(merged.length&&r[0]-merged[merged.length-1][1]<=8)merged[merged.length-1][1]=r[1];else merged.push(r.slice());}
  return merged.filter(([a,b])=>{let m=0;for(let y=a;y<b;y++)m=Math.max(m,s[y]);return m>.60;}).map(([a,b])=>Math.round((a+b)/2));
 }
 function stableSet(rgba,w,h,ys){
  if(ys.length<2||ys.length>3)return null;const sets=[];
  for(const half of[0,1,2]){const mask=new Uint8Array(w*h);for(const y of ys)for(let d=-half;d<=half;d++)if(y+d>=0&&y+d<h)for(let x=0;x<w;x++)mask[(y+d)*w+x]=1;const out=PanelRaggedGutters.analyzeWithBarriersRGBA(rgba,w,h,mask).sort((a,b)=>a.y-b.y||a.x-b.x);sets.push(out);}
  const expected=ys.length+1;if(sets.some(a=>a.length!==expected||a.some(p=>!PanelRaggedGutters.validPanel(p))))return null;
  const bs=sets.map(a=>a.map(p=>box(p,w,h)));for(let k=0;k<expected;k++)for(const set of bs)for(let i=0;i<4;i++)if(Math.abs(set[k][i]-bs[1][k][i])>3)return null;
  const out=sets[1];if(out.some(p=>p.x>.08||p.x+p.w<.92||p.w<.90||p.h<.10)||out[0].y>.06||out[out.length-1].y+out[out.length-1].h<.96)return null;
  for(let k=0;k<ys.length;k++){const a=bs[1][k],b=bs[1][k+1],lo=Math.min(a[3],b[1])-8,hi=Math.max(a[3],b[1])+8;if(ys[k]<lo||ys[k]>hi)return null;}
  return {out,boxes:bs};
 }
 function validPanel(p){try{const v=p?._structuralGridProof?.horizontalPaperStrip,w=v?.analysisWidth,h=v?.analysisHeight;if(!v||v.version!==VERSION||v.method!==METHOD||!Number.isInteger(v.index)||!Number.isInteger(v.count)||v.count<3||v.count>4||v.index<0||v.index>=v.count||!Array.isArray(v.separators)||v.separators.length!==v.count-1||v.separators.some(y=>!Number.isInteger(y)||y<=0||y>=h)||JSON.stringify(v.halfWidths)!=='[0,1,2]'||v.maxBoxDrift!==3||v.priorMatch!==true||!Array.isArray(v.stableBoxes)||v.stableBoxes.length!==3)return false;const base={...p,_structuralGridProof:{...p._structuralGridProof}};delete base._structuralGridProof.horizontalPaperStrip;return typeof PanelRaggedGutters!=='undefined'&&PanelRaggedGutters.validPanel(base);}catch(_){return false;}}
 function analyzeRGBA(rgba,w,h,prior,log){
  if(!eligible(prior)||typeof PanelRaggedGutters==='undefined'||typeof PanelMatteCells==='undefined'||rgba?.length!==w*h*4||w<250||h<350||w>900||h>900)return[];
  const ys=separators(rgba,w,h),stable=stableSet(rgba,w,h,ys);if(!stable)return[];const out=stable.out;
  const matches=out.map(p=>overlap(p,prior[0])/Math.max(1e-9,Math.min(area(p),area(prior[0]))));const matched=matches.map((v,i)=>[v,i]).filter(([v])=>v>.72);if(matched.length!==1)return[];const priorIndex=matched[0][1];
  const additions=[];for(let i=0;i<out.length;i++)if(i!==priorIndex){const p=out[i],meta={version:VERSION,method:METHOD,index:i,count:out.length,separators:ys.slice(),halfWidths:[0,1,2],maxBoxDrift:3,priorMatch:true,priorIndex,analysisWidth:w,analysisHeight:h,stableBoxes:stable.boxes};const q={...p,_structuralGridProof:{...p._structuralGridProof,horizontalPaperStrip:meta}};if(!validPanel(q))return[];additions.push(q);}
  if(additions.length!==out.length-1)return[];log?.('horizontal torn-paper tiers: '+additions.length+' stable additions');return additions;
 }
 function supplementImage(img,prior,log){if(!eligible(prior)||typeof PanelMatteCells==='undefined')return[];const W=img.naturalWidth||img.width,H=img.naturalHeight||img.height;if(!W||!H||W*H>24000000)return[];let c;try{c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d',{willReadFrequently:true});if(!g)return[];g.drawImage(img,0,0);const s=Math.min(1,900/Math.max(W,H)),w=Math.round(W*s),h=Math.round(H*s);return analyzeRGBA(PanelMatteCells.sampleBilinearRGBA(g.getImageData(0,0,W,H).data,W,H,w,h),w,h,prior,log);}finally{if(c)c.width=c.height=1;}}
 function install(detector){if(!detector||detector._horizontalPaperStrips)return;const old=detector.detect;detector.detect=async function(url,log){const prior=await old.call(this,url,log);if(!eligible(prior))return prior;try{const img=new Image();img.src=url;await img.decode();const add=supplementImage(img,prior,log);return add.length?prior.concat(add):prior;}catch(e){log?.('horizontal torn-paper tiers deferred: '+e.message);return prior;}};detector._horizontalPaperStrips=true;}
 return{separators,analyzeRGBA,supplementImage,eligible,validPanel,install};
})();
if(typeof PanelDetect!=='undefined')PanelHorizontalPaperStrips.install(PanelDetect);
if(typeof module!=='undefined')module.exports=PanelHorizontalPaperStrips;
