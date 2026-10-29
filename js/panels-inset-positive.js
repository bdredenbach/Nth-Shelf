/* Isolated source179 positive inset display addition. Inert on load.
 * Original171 issuer, owner, contours and hit routing remain unchanged.
 * No source175 exclusion authority is used. Novel computational bridge pixels
 * never become owned source pixels. Optional failures preserve original171.
 */
const PanelInsetPositive179=(()=>{
 'use strict';
 const VERSION=179,METHOD='independent-source-inset-positive-addition';
 const RULES=Object.freeze({maxPixels:24000000,maxDimension:6000,maxBoundaryEdges:200000,
 seamResidual:8,seamBrightness:180,seamSupport:.08,seamDifferenceRadius:3,
 sideWindow:16,sideDistance:3,railFraction:.75,maxRailThickness:.04,maxOffset:.06,
 maxEndpointGap:5,maxEndpointDistance:8,maxEnclosedFraction:.15});
 const states=new WeakMap(),lifecycle=new WeakMap(),issuedPlans=new WeakMap();
 function freeze(o){if(o&&typeof o==='object'&&!Object.isFrozen(o)){Object.values(o).forEach(freeze);Object.freeze(o);}return o;}
 function signature(a,w,h){let x=2166136261,y=0x9e3779b9;for(let i=0;i<a.length;i++){x=Math.imul(x^a[i],16777619);y=Math.imul(y+a[i]+i,0x85ebca6b);}return[w,h,x>>>0,y>>>0].join(':');}
 const canonical=p=>JSON.stringify([p.x,p.y,p.w,p.h,p._identitySource,p._geometryOwner,p._geometryType,p._contours,p._structuralGridProof]);
  function maskFromPanel(p,w,h){const rows=Array.from({length:h},()=>[]);for(const r of p._contours){for(let i=0;i<r.length;i++){const q=r[i],z=r[(i+1)%r.length],x0=Math.round(q.x*w),y0=Math.round(q.y*h),x1=Math.round(z.x*w),y1=Math.round(z.y*h);if(y0===y1)continue;const lo=Math.max(0,Math.ceil(Math.min(y0,y1)-.5)),hi=Math.min(h-1,Math.floor(Math.max(y0,y1)-.5));for(let y=lo;y<=hi;y++)rows[y].push(x0+(x1-x0)*(y+.5-y0)/(y1-y0));}}
    const m=new Uint8Array(w*h);for(let y=0;y<h;y++){const xs=rows[y].sort((a,b)=>a-b);if(xs.length%2)return null;for(let k=0;k<xs.length;k+=2){const lo=Math.max(0,Math.ceil(xs[k]-.5)),hi=Math.min(w,Math.ceil(xs[k+1]-.5));m.fill(1,y*w+lo,y*w+hi);}}return m;}
  function traceMask(mask,w,h){const next=new Map();let x0=w,y0=h,x1=0,y1=0,area=0;function add(x,y,u,v){const k=y*(w+1)+x;if(next.has(k)||next.size>=RULES.maxBoundaryEdges)return false;next.set(k,v*(w+1)+u);return true;}
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x;if(!mask[i])continue;area++;x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x+1);y1=Math.max(y1,y+1);if((y===0||!mask[i-w])&&!add(x,y,x+1,y))return null;if((x===w-1||!mask[i+1])&&!add(x+1,y,x+1,y+1))return null;if((y===h-1||!mask[i+w])&&!add(x+1,y+1,x,y+1))return null;if((x===0||!mask[i-1])&&!add(x,y+1,x,y))return null;}
    if(!area||next.size>RULES.maxBoundaryEdges)return null;const unseen=new Set(next.keys()),polygons=[];while(unseen.size){if(polygons.length>=16)return null;const first=unseen.values().next().value,r=[];let k=first;do{if(!unseen.delete(k))return null;const y=Math.floor(k/(w+1));r.push([k-y*(w+1),y]);k=next.get(k);if(k===undefined)return null;}while(k!==first);polygons.push(r);}return{polygons,box:[x0,y0,x1,y1],area};}
 function enclosed(mask,w,h,q){const seen=new Uint8Array(mask.length);let head=0,tail=0;function add(i){if(!mask[i]&&!seen[i]){seen[i]=1;q[tail++]=i;}}for(let x=0;x<w;x++){add(x);add((h-1)*w+x);}for(let y=0;y<h;y++){add(y*w);add(y*w+w-1);}while(head<tail){const i=q[head++],x=i%w,y=i/w|0;if(x)add(i-1);if(x+1<w)add(i+1);if(y)add(i-w);if(y+1<h)add(i+w);}for(let i=0;i<seen.length;i++)seen[i]=+(!seen[i]&&!mask[i]);return seen;}
 function components(mask,w,h,q){const seen=new Uint8Array(mask.length);let count=0;for(let s=0;s<mask.length;s++)if(mask[s]&&!seen[s]){if(++count>1)return count;let head=0,tail=1;q[0]=s;seen[s]=1;while(head<tail){const i=q[head++],x=i%w,y=i/w|0;for(const j of[x?i-1:-1,x+1<w?i+1:-1,y?i-w:-1,y+1<h?i+w:-1])if(j>=0&&mask[j]&&!seen[j]){seen[j]=1;q[tail++]=j;}}}return count;}
 function derivePositiveAddition(a,w,h,m,parent){const R=RULES;let x0=w,x1=0,y0=h,y1=0,area=0;for(let i=0;i<m.length;i++)if(m[i]){const x=i%w,y=i/w|0;x0=Math.min(x0,x);x1=Math.max(x1,x+1);y0=Math.min(y0,y);y1=Math.max(y1,y+1);area++;}const height=y1-y0;if(!area||x1-x0<=44)return null;
  function mean(x,y){const j=4*(y*w+x);return(a[j]+a[j+1]+a[j+2])/3;}
  function ink(x,y){const j=4*(y*w+x),hi=Math.max(a[j],a[j+1],a[j+2]),lo=Math.min(a[j],a[j+1],a[j+2]);return hi<120&&hi-lo<=60;}
  let sx=-1,score=-1,seamTies=0;for(let x=x0+22;x<x1-22;x++){let n=0;for(let y=0;y<h;y++){const v=mean(x,y);if(v>=R.seamBrightness&&v-(mean(x-3,y)+mean(x+3,y))*.5>=R.seamResidual)n++;}if(n>score){score=n;sx=x;seamTies=1;}else if(n===score)seamTies++;}
  if(score<h*R.seamSupport||seamTies!==1)return null;const rails=[];
  for(const[l,r]of[[sx-19,sx-3],[sx+4,sx+20]]){if(l<0||r>w)return null;let start=-1,end=-1;for(let y=y0;y<y1;y++){let n=0;for(let x=l;x<r;x++)n+=+ink(x,y);if(n/(r-l)>=R.railFraction){if(start<0)start=y;end=y+1;}else if(start>=0)break;}if(start<0||end-start>R.maxRailThickness*height)return null;let support=0;for(let y=start;y<end;y++)for(let x=l;x<r;x++)support+=m[y*w+x];if(support<.5*(end-start)*(r-l))return null;rails.push({start,end,l,r});}
  const roundEven=v=>{const f=Math.floor(v);return v-f===.5?(f%2?f+1:f):Math.round(v);};const ya=roundEven((rails[0].start+rails[0].end-1)/2),yb=roundEven((rails[1].start+rails[1].end-1)/2);if(Math.abs(ya-yb)>Math.max(4,R.maxOffset*height))return null;
  function endpoint(row,rail,left){let best=null,bestCount=0,tied=false;for(let x=0;x<w;){if(!m[row*w+x]||!ink(x,row)){x++;continue;}const lo=x;while(x<w&&m[row*w+x]&&ink(x,row))x++;const hi=x,n=Math.max(0,Math.min(hi,rail.r)-Math.max(lo,rail.l));if(n>bestCount){bestCount=n;best={lo,hi};tied=false;}else if(n&&n===bestCount)tied=true;}return best&&!tied?(left?best.hi-1:best.lo):-1;}
  const xl=endpoint(ya,rails[0],true),xr=endpoint(yb,rails[1],false);if(!(xr>xl&&xr-xl<=R.maxEndpointGap&&Math.abs(xl-sx)<=R.maxEndpointDistance&&Math.abs(xr-sx)<=R.maxEndpointDistance))return null;
  const bridge=new Uint8Array(m.length),barrier=m.slice(),vx=xl+1;for(let x=xl;x<=vx;x++)bridge[ya*w+x]=1;for(let y=Math.min(ya,yb);y<=Math.max(ya,yb);y++)bridge[y*w+vx]=1;for(let x=vx;x<=xr;x++)bridge[yb*w+x]=1;let bridgePixels=0,novelBridge=0;for(let i=0;i<m.length;i++){if(bridge[i]){bridgePixels++;novelBridge+=+!m[i];barrier[i]=1;}}
  if(!m[ya*w+xl]||!m[yb*w+xr]||!bridge[ya*w+xl]||!bridge[yb*w+xr])return null;
  const queue=new Int32Array(m.length),before=enclosed(m,w,h,queue),extra=enclosed(barrier,w,h,queue);let n=0;
  for(let i=0;i<m.length;i++){extra[i]&=+(!m[i]&&!bridge[i]);if(extra[i]){const x=i%w,y=i/w|0;if(before[i]||!parent[i]||x<x0||x>=x1||y<y0||y>=y1)return null;n++;}}
  if(!n||n>R.maxEnclosedFraction*area||components(extra,w,h,queue)!==1)return null;
  return{addition:extra,bridge,evidence:{method:'independent-positive-inset-endpoint-enclosure',seamX:sx,seamSupportRows:score,rails,endpoints:[[xl,ya],[xr,yb]],bridgePixels,novelBridgePixelsExcluded:novelBridge,newEnclosedPixels:n,bridgeIsObservedInk:false,insetArea:area,source175AuthorityUsed:false}};
 }

 function computeState(a,w,h,img){const empty={w,h,panel:null};if(a?.length!==w*h*4)return empty;for(let i=3;i<a.length;i+=4)if(a[i]!==255)return empty;
  if(typeof PanelHostBackgroundIslands==='undefined'||typeof PanelSupportedLandscape==='undefined')return empty;
  const parents=PanelSupportedLandscape.analyzeRGBA(a,w,h);if(parents.length!==1||!PanelSupportedLandscape.validateRGBA(parents[0],a,w,h))return empty;
  const insets=PanelHostBackgroundIslands.supplementImage(img,[]).filter(p=>PanelHostBackgroundIslands.validateImage(p,img));if(insets.length!==1)return empty;
  const parent=maskFromPanel(parents[0],w,h),m=maskFromPanel(insets[0],w,h);if(!parent||!m)return empty;
  for(let i=0;i<m.length;i++)if(m[i]&&!parent[i])return empty;
  const q=derivePositiveAddition(a,w,h,m,parent);if(!q)return empty;
  const shape=traceMask(q.addition,w,h);if(!shape||shape.area!==q.evidence.newEnclosedPixels)return empty;
  const contours=shape.polygons.map(r=>r.map(([x,y])=>({x:x/w,y:y/h}))),roundtrip=maskFromPanel({_contours:contours},w,h);if(!roundtrip)return empty;
  for(let i=0;i<m.length;i++)if(roundtrip[i]!==q.addition[i]||(roundtrip[i]&&(m[i]||q.bridge[i])))return empty;
  return{w,h,panel:insets[0],canonical:canonical(insets[0]),signature:signature(a,w,h),additionContours:freeze(contours),additionBox:shape.box.map((v,i)=>v/(i%2?h:w)),evidence:freeze(q.evidence),plans:new WeakMap()};
 }
 function sourceState(img){if(!img)return null;let life=lifecycle.get(img);if(!life){life={failed:false,generation:0};lifecycle.set(img,life);if(img.addEventListener){img.addEventListener('load',()=>{life.failed=false;life.generation++;states.delete(img);});img.addEventListener('error',()=>{life.failed=true;life.generation++;states.delete(img);});}}
  if(img.complete===false||life.failed)return null;const w=('naturalWidth'in img)?img.naturalWidth:img.width,h=('naturalHeight'in img)?img.naturalHeight:img.height,src=img.currentSrc||img.src;
  if(!Number.isInteger(w)||!Number.isInteger(h)||w<150||h<150||w>RULES.maxDimension||h>RULES.maxDimension||w*h>RULES.maxPixels)return null;
  const old=states.get(img);if(('naturalWidth'in img)&&old&&old.src===src&&old.generation===life.generation&&old.w===w&&old.h===h)return old;
  let c;try{c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d',{willReadFrequently:true});if(!g)return null;g.drawImage(img,0,0);const s=computeState(g.getImageData(0,0,w,h).data,w,h,img);s.src=src;s.generation=life.generation;states.set(img,s);return s;}catch(_){return null;}finally{if(c)c.width=c.height=1;}
 }
 function sourceOwnerValid(p,img){return!!(p&&typeof PanelHostBackgroundIslands!=='undefined'&&PanelHostBackgroundIslands.claims(p)&&PanelHostBackgroundIslands.validateImage(p,img));}
 function bankStamp(bank,p,img,s){if(!Array.isArray(bank)||!bank.length||bank.length>64)return null;let selected=0,vertices=0;const out=[];
  for(const q of bank){if(!q||typeof q!=='object')return null;const box=[q.x,q.y,q.w,q.h];if(!box.every(Number.isFinite)||q.x<0||q.y<0||q.w<=0||q.h<=0||q.x+q.w>1||q.y+q.h>1)return null;
   const same=q===p&&sourceOwnerValid(q,img)&&canonical(q)===s.canonical;
   if(same)selected++;else{const b=s.additionBox;if(Math.min(q.x+q.w,b[2])>Math.max(q.x,b[0])&&Math.min(q.y+q.h,b[3])>Math.max(q.y,b[1]))return null;}
   const geometry=[q._contours||null,q._quad||null,q._outline||null];
   for(let gi=0;gi<geometry.length;gi++){const g=geometry[gi];if(g===null)continue;if(!Array.isArray(g))return null;const rings=gi===0?g:[g];if(rings.length>64)return null;for(const r of rings){if(!Array.isArray(r)||r.length<3)return null;vertices+=r.length;if(vertices>200000)return null;for(const v of r){const x=Array.isArray(v)?v[0]:v?.x,y=Array.isArray(v)?v[1]:v?.y;if(!Number.isFinite(x)||!Number.isFinite(y)||x<0||x>1||y<0||y>1)return null;}}}
   out.push([box,q._identitySource||null,q._geometryOwner||null,q._geometryType||null,...geometry]);
  }
  if(selected!==1)return null;const stamp=JSON.stringify(out);return stamp.length<=8000000?stamp:null;
 }
 function renderPlan(p,img,bank){try{if(!Array.isArray(bank)||!bank.length||bank.length>64||!sourceOwnerValid(p,img))return null;const s=sourceState(img);if(!s?.panel||canonical(p)!==s.canonical)return null;const stamp=bankStamp(bank,p,img,s);if(stamp===null)return null;let plan=s.plans.get(p),held=plan&&issuedPlans.get(plan);if(held&&held.bank===bank&&held.bankStamp===stamp&&bank.every((q,i)=>held.bankOwners[i]===q))return plan;
  plan=freeze({version:VERSION,method:METHOD,nativeWidth:s.w,nativeHeight:s.h,nativeSignature:s.signature,baseContours:p._contours.map(r=>r.map(v=>({...v}))),additionContours:s.additionContours,evidence:s.evidence});issuedPlans.set(plan,{p,img,state:s,bank,bankStamp:stamp,bankOwners:bank.slice()});s.plans.set(p,plan);return plan;
 }catch(_){return null;}}
 function validatePlan(plan,p,img,bank){try{const held=issuedPlans.get(plan);return!!(held&&held.p===p&&held.img===img&&held.bank===bank&&Array.isArray(bank)&&bank.length===held.bankOwners.length&&bank.every((q,i)=>held.bankOwners[i]===q)&&sourceOwnerValid(p,img)&&sourceState(img)===held.state&&canonical(p)===held.state.canonical&&bankStamp(bank,p,img,held.state)===held.bankStamp);}catch(_){return false;}}

 function opaqueEmptyRuns(baseRGBA, additionRGBA, w, h) {
 try {
  if (!Number.isSafeInteger(w) || !Number.isSafeInteger(h) || w <= 0 || h <= 0 || w * h > 9000000) return null;
  const bytes = w * h * 4;
  const valid = a => (a instanceof Uint8Array || a instanceof Uint8ClampedArray) && a.length === bytes;
  if (!valid(baseRGBA) || !valid(additionRGBA)) return null;
  const runs = []; let pixels = 0;
  for (let y = 0; y < h; y++) {
   for (let x = 0; x < w;) {
    let i = (y * w + x) * 4 + 3;
    if (baseRGBA[i] !== 0 || additionRGBA[i] !== 255) { x++; continue; }
    const start = x;
    do { x++; i += 4; } while (x < w && baseRGBA[i] === 0 && additionRGBA[i] === 255);
    if (runs.length === 8192) return null;
    runs.push(Object.freeze([start, y, x - start])); pixels += x - start;
   }
  }
  return Object.freeze({runs: Object.freeze(runs), pixels});
 } catch (_) { return null; }
}
 return{VERSION,RULES,renderPlan,validatePlan,opaqueEmptyRuns};
})();
if(typeof module!=='undefined')module.exports=PanelInsetPositive179;
