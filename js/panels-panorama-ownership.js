/* Source-held panorama ownership refinement: independently supported inset exclusion.
 * Inert on load. No geometry-bank hooks, no source artwork synthesis.
 * Narrow seam-like-discontinuity bridge is computational topology, not observed ink;
 * novel bridge pixels are retained. Observed-paper-separated lower lobes may be removed; ambiguous hair remains.
 */
const PanelPanoramaOwnership=(()=>{
 'use strict';
 const VERSION=175,METHOD='source-supported-panorama-inset-exclusion';
 const RULES=Object.freeze({maxPixels:24000000,maxDimension:6000,maxBoundaryEdges:200000,
 seamResidual:8,seamBrightness:180,seamSupport:.08,seamDifferenceRadius:3,
 sideWindow:16,sideDistance:3,railFraction:.75,maxRailThickness:.04,maxOffset:.06,
 maxEndpointGap:5,maxEndpointDistance:8,maxEnclosedFraction:.15});
 const issued=new WeakMap(),states=new WeakMap(),lifecycle=new WeakMap(),renderPlans=new WeakMap();
 function freeze(o){if(o&&typeof o==='object'&&!Object.isFrozen(o)){Object.values(o).forEach(freeze);Object.freeze(o);}return o;}
 function signature(a,w,h){let x=2166136261,y=0x9e3779b9;for(let i=0;i<a.length;i++){x=Math.imul(x^a[i],16777619);y=Math.imul(y+a[i]+i,0x85ebca6b);}return[w,h,x>>>0,y>>>0].join(':');}
 const isClaim=p=>!!p&&(p._structuralGridProof?.version===VERSION||p._structuralGridProof?.method===METHOD||p._geometryType==='panorama-ownership');
 const validPanel=p=>!!(isClaim(p)&&p._structuralGridProof?.version===VERSION&&p._structuralGridProof.method===METHOD&&p._geometryType==='panorama-ownership'&&issued.has(p)&&Object.isFrozen(p));
  function maskFromPanel(p,w,h){const rows=Array.from({length:h},()=>[]);for(const r of p._contours){for(let i=0;i<r.length;i++){const q=r[i],z=r[(i+1)%r.length],x0=Math.round(q.x*w),y0=Math.round(q.y*h),x1=Math.round(z.x*w),y1=Math.round(z.y*h);if(y0===y1)continue;const lo=Math.max(0,Math.ceil(Math.min(y0,y1)-.5)),hi=Math.min(h-1,Math.floor(Math.max(y0,y1)-.5));for(let y=lo;y<=hi;y++)rows[y].push(x0+(x1-x0)*(y+.5-y0)/(y1-y0));}}
    const m=new Uint8Array(w*h);for(let y=0;y<h;y++){const xs=rows[y].sort((a,b)=>a-b);if(xs.length%2)return null;for(let k=0;k<xs.length;k+=2){const lo=Math.max(0,Math.ceil(xs[k]-.5)),hi=Math.min(w,Math.ceil(xs[k+1]-.5));m.fill(1,y*w+lo,y*w+hi);}}return m;}
  function traceMask(mask,w,h){const next=new Map();let x0=w,y0=h,x1=0,y1=0,area=0;function add(x,y,u,v){const k=y*(w+1)+x;if(next.has(k)||next.size>=RULES.maxBoundaryEdges)return false;next.set(k,v*(w+1)+u);return true;}
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x;if(!mask[i])continue;area++;x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x+1);y1=Math.max(y1,y+1);if((y===0||!mask[i-w])&&!add(x,y,x+1,y))return null;if((x===w-1||!mask[i+1])&&!add(x+1,y,x+1,y+1))return null;if((y===h-1||!mask[i+w])&&!add(x+1,y+1,x,y+1))return null;if((x===0||!mask[i-1])&&!add(x,y+1,x,y))return null;}
    if(!area||next.size>RULES.maxBoundaryEdges)return null;const unseen=new Set(next.keys()),polygons=[];while(unseen.size){if(polygons.length>=16)return null;const first=unseen.values().next().value,r=[];let k=first;do{if(!unseen.delete(k))return null;const y=Math.floor(k/(w+1));r.push([k-y*(w+1),y]);k=next.get(k);if(k===undefined)return null;}while(k!==first);polygons.push(r);}return{polygons,box:[x0,y0,x1,y1],area};}
 function enclosed(mask,w,h){const seen=new Uint8Array(mask.length),q=new Int32Array(mask.length);let head=0,tail=0;function add(i){if(!mask[i]&&!seen[i]){seen[i]=1;q[tail++]=i;}}for(let x=0;x<w;x++){add(x);add((h-1)*w+x);}for(let y=0;y<h;y++){add(y*w);add(y*w+w-1);}while(head<tail){const i=q[head++],x=i%w,y=i/w|0;if(x)add(i-1);if(x+1<w)add(i+1);if(y)add(i-w);if(y+1<h)add(i+w);}for(let i=0;i<seen.length;i++)seen[i]=+(!seen[i]&&!mask[i]);return seen;}
 function components(mask,w,h){const seen=new Uint8Array(mask.length),q=new Int32Array(mask.length);let count=0;for(let s=0;s<mask.length;s++)if(mask[s]&&!seen[s]){if(++count>1)return count;let head=0,tail=1;q[0]=s;seen[s]=1;while(head<tail){const i=q[head++],x=i%w,y=i/w|0;for(const j of[x?i-1:-1,x+1<w?i+1:-1,y?i-w:-1,y+1<h?i+w:-1])if(j>=0&&mask[j]&&!seen[j]){seen[j]=1;q[tail++]=j;}}}return count;}
 function refineMasks(a,w,h,m,parent){const R=RULES;let x0=w,x1=0,y0=h,y1=0,area=0;for(let i=0;i<m.length;i++)if(m[i]){const x=i%w,y=i/w|0;x0=Math.min(x0,x);x1=Math.max(x1,x+1);y0=Math.min(y0,y);y1=Math.max(y1,y+1);area++;}const height=y1-y0;if(!area||x1-x0<=44)return null;
  function mean(x,y){const j=4*(y*w+x);return(a[j]+a[j+1]+a[j+2])/3;}
  function ink(x,y){const j=4*(y*w+x),hi=Math.max(a[j],a[j+1],a[j+2]),lo=Math.min(a[j],a[j+1],a[j+2]);return hi<120&&hi-lo<=60;}
  let sx=-1,score=-1;for(let x=x0+22;x<x1-22;x++){let n=0;for(let y=0;y<h;y++){const v=mean(x,y);if(v>=R.seamBrightness&&v-(mean(x-3,y)+mean(x+3,y))*.5>=R.seamResidual)n++;}if(n>score){score=n;sx=x;}}
  if(score<h*R.seamSupport)return null;const rails=[];
  for(const[l,r]of[[sx-19,sx-3],[sx+4,sx+20]]){if(l<0||r>w)return null;let start=-1,end=-1;for(let y=y0;y<y1;y++){let n=0;for(let x=l;x<r;x++)n+=+ink(x,y);if(n/(r-l)>=R.railFraction){if(start<0)start=y;end=y+1;}else if(start>=0)break;}if(start<0||end-start>R.maxRailThickness*height)return null;let support=0;for(let y=start;y<end;y++)for(let x=l;x<r;x++)support+=m[y*w+x];if(support<.5*(end-start)*(r-l))return null;rails.push({start,end,l,r});}
  const roundEven=v=>{const f=Math.floor(v);return v-f===.5?(f%2?f+1:f):Math.round(v);};const ya=roundEven((rails[0].start+rails[0].end-1)/2),yb=roundEven((rails[1].start+rails[1].end-1)/2);if(Math.abs(ya-yb)>Math.max(4,R.maxOffset*height))return null;
  function endpoint(row,rail,left){let best=null,bestCount=0;for(let x=0;x<w;){if(!m[row*w+x]||!ink(x,row)){x++;continue;}const lo=x;while(x<w&&m[row*w+x]&&ink(x,row))x++;const hi=x,n=Math.max(0,Math.min(hi,rail.r)-Math.max(lo,rail.l));if(n>bestCount){bestCount=n;best={lo,hi};}}return best?(left?best.hi-1:best.lo):-1;}
  const xl=endpoint(ya,rails[0],true),xr=endpoint(yb,rails[1],false);if(!(xr>xl&&xr-xl<=R.maxEndpointGap&&Math.abs(xl-sx)<=R.maxEndpointDistance&&Math.abs(xr-sx)<=R.maxEndpointDistance))return null;
  const bridge=new Uint8Array(m.length),barrier=m.slice(),vx=xl+1;for(let x=xl;x<=vx;x++)bridge[ya*w+x]=1;for(let y=Math.min(ya,yb);y<=Math.max(ya,yb);y++)bridge[y*w+vx]=1;for(let x=vx;x<=xr;x++)bridge[yb*w+x]=1;let bridgePixels=0,novelBridge=0;for(let i=0;i<m.length;i++){if(bridge[i]){bridgePixels++;novelBridge+=+!m[i];barrier[i]=1;}}
  if(!m[ya*w+xl]||!m[yb*w+xr]||!bridge[ya*w+xl]||!bridge[yb*w+xr])return null;
  const extra=enclosed(barrier,w,h);let n=0;for(let i=0;i<m.length;i++){extra[i]&=+(!m[i]&&!bridge[i]);n+=extra[i];}if(!n||n>R.maxEnclosedFraction*area||components(extra,w,h)!==1)return null;
  const kept=parent.slice();for(let i=0;i<m.length;i++)if(m[i]||extra[i])kept[i]=0;
  return{mask:kept,evidence:{method:'independent-inset-plus-endpoint-connected-seam-like-discontinuity',seamX:sx,seamSupportRows:score,rails,endpoints:[[xl,ya],[xr,yb]],bridgePixels,novelBridgePixelsRetained:novelBridge,newEnclosedPixels:n,bridgeIsObservedInk:false,insetArea:area,fingerCleanup:false}};
 }

 function corridorCleanup({data,mask,width:w,height:h}) {
 if (!Number.isInteger(w)||!Number.isInteger(h)||mask.length!==w*h||![w*h*3,w*h*4].includes(data.length)) throw Error('Invalid native inputs');
 if(w>6000||h>6000||w*h>24000000)return {deletion:null,removed:0,records:[],peaks:[],status:'abstain_resource'};
 const stride=data.length/(w*h), paper=new Uint8Array(w*h), bottom=new Int32Array(w).fill(-1);
 const graySum=i=>{let j=i*stride;return data[j]+data[j+1]+data[j+2];};
 for(let i=0;i<paper.length;i++){let j=i*stride,r=data[j],g=data[j+1],b=data[j+2];paper[i]=Math.min(r,g,b)>=242&&Math.max(r,g,b)-Math.min(r,g,b)<=14;if(mask[i])bottom[i%w]=(i/w)|0;}
 const rad=Math.round(h*.012), delta=new Int32Array(h+1);
 for(let x=0;x<w;x++){let intervals=[];for(let y=0;y<h;){if(!paper[y*w+x]){y++;continue;}let a=y;while(y<h&&paper[y*w+x])y++;let b=y;if(b-a<3||b-a>h*.045||a<5||b>h-5)continue;let up=765,dn=765;for(let k=1;k<=5;k++){up=Math.min(up,graySum((a-k)*w+x));dn=Math.min(dn,graySum((b+k-1)*w+x));}if(up>300||dn>300)continue;let c=(a+b)>>1;intervals.push([Math.max(0,c-rad),Math.min(h-1,c+rad)]);}
 let end=-2,start=-1;for(const [a,b] of intervals){if(a>end+1){if(start>=0){delta[start]++;delta[end+1]--;}start=a;end=b;}else end=Math.max(end,b);}if(start>=0){delta[start]++;delta[end+1]--;}}
 const support=new Int32Array(h);let acc=0;for(let y=0;y<h;y++){acc+=delta[y];support[y]=acc;}
 const work=support.slice(),peaks=[];for(let k=0;k<8;k++){let y=0;for(let j=1;j<h;j++)if(work[j]>work[y])y=j;peaks.push([y,work[y]]);work.fill(0,Math.max(0,y-2*rad),Math.min(h,y+2*rad+1));}
 const deletion=new Uint8Array(w*h),records=[];if(peaks[0][1]<.5*w||peaks[0][1]<1.5*Math.max(1,peaks[1][1]))return {deletion,removed:0,records,peaks,status:'abstain_separator'};
 const y0=Math.max(0,peaks[0][0]-rad),y1=Math.min(h,peaks[0][0]+rad+1),bh=y1-y0,n=w*bh,q=new Int32Array(n),seen=new Uint8Array(n),components=[];
 function flood(seed,allowed,visited,diagonal,visit){let head=0,tail=1;q[0]=seed;visited[seed]=1;while(head<tail){let i=q[head++],x=i%w,y=(i/w)|0;visit(i,x,y);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy||!diagonal&&dx&&dy)continue;let xx=x+dx,yy=y+dy;if(xx<0||xx>=w||yy<0||yy>=bh)continue;let j=yy*w+xx;if(!visited[j]&&allowed(j)){visited[j]=1;q[tail++]=j;}}}return tail;}
 for(let i=0;i<n;i++)if(!seen[i]&&paper[i+y0*w]){let minx=w,maxx=-1,top=new Map();flood(i,j=>paper[j+y0*w],seen,false,(_,x,y)=>{minx=Math.min(minx,x);maxx=Math.max(maxx,x);if(!top.has(x)||top.get(x)>y)top.set(x,y);});if(maxx-minx+1>=w*.01)components.push({minx,maxx,top});}
 const barrier=new Uint8Array(n),visited=new Uint8Array(n);
 let eligibleIntervals=0,floodPasses=0,bandCellsScanned=0;
 const maxEligibleIntervals=32,maxBandCellsScanned=24000000;
 function paperSegment(x,a,b){if(a<y0||b>=y1)return false;for(let y=a;y<=b;y++)if(!paper[y*w+x])return false;return true;}
 for(const c of components){let start=c.minx;for(let end=start+1;end<=c.maxx+1;end++){if(end<=c.maxx&&c.top.has(end)&&c.top.has(end-1)&&Math.abs(c.top.get(end)-c.top.get(end-1))<=3)continue;let l=start,r=end-1;start=end;if(r-l+1<w*.01)continue;if(eligibleIntervals+1>maxEligibleIntervals)return {deletion:null,removed:0,records,peaks,status:'abstain_work',work:{eligibleIntervals,floodPasses,bandCellsScanned,maxEligibleIntervals,maxBandCellsScanned}};eligibleIntervals++;barrier.fill(0);let ok=true,rec={x:[l,r],width:r-l+1};records.push(rec);
 for(let x=l;x<=r;x++)barrier[c.top.get(x)*w+x]=1;
 for(let x=l;x<r;x++){let a=Math.min(c.top.get(x),c.top.get(x+1))+y0,b=Math.max(c.top.get(x),c.top.get(x+1))+y0,col=paperSegment(x,a,b)?x:x+1;if(!paperSegment(col,a,b)){ok=false;break;}for(let y=a;y<=b;y++)barrier[(y-y0)*w+col]=1;}
 if(!ok){rec.decision='reject_nonpaper_staircase';continue;}
 for(const x of [l,r]){let a=c.top.get(x)+y0,b=Math.max(a,bottom[x]+1);if(bottom[x]<0||a>bottom[x])continue;if(!paperSegment(x,a,b)){ok=false;break;}for(let y=a;y<=b;y++)barrier[(y-y0)*w+x]=1;}
 if(!ok){rec.decision='reject_nonpaper_endpoint';continue;}
 if(bandCellsScanned+n>maxBandCellsScanned)return {deletion:null,removed:0,records,peaks,status:'abstain_work',work:{eligibleIntervals,floodPasses,bandCellsScanned,maxEligibleIntervals,maxBandCellsScanned}};
 floodPasses++;bandCellsScanned+=n;
 visited.fill(0);rec.components=[];let count=0;
 for(let i=0;i<n;i++)if(!visited[i]&&mask[i+y0*w]&&!barrier[i]){let minx=w,maxx=-1,miny=bh,maxy=-1,nonpaper=0,contact=0;
 const size=flood(i,j=>mask[j+y0*w]&&!barrier[j],visited,true,(j,x,y)=>{minx=Math.min(minx,x);maxx=Math.max(maxx,x);miny=Math.min(miny,y);maxy=Math.max(maxy,y);let gi=j+y0*w;if(!paper[gi]){nonpaper++;for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1]]){let xx=x+dx,yy=y+y0+dy;if(xx>=0&&xx<w&&yy>=0&&yy<h){let z=yy*w+xx;if(!mask[z]&&!paper[z]&&yy>bottom[xx])contact++;}}}});
 if(minx<l||maxx>r||miny===0||maxy===bh-1)continue;
 const admit=nonpaper>=16&&contact>0;rec.components.push({pixels:size,nonpaper,exteriorInkContacts:contact,admit});if(admit){for(let k=0;k<size;k++)deletion[q[k]+y0*w]=1;count+=size;}
 }
 rec.removed=count;rec.decision=count?'candidate':'abstain_no_certified_lobe';}}
 let removed=0,nonpaperRemoved=0;for(let i=0;i<deletion.length;i++)if(deletion[i]){removed++;if(!paper[i])nonpaperRemoved++;}
 return {deletion,removed,nonpaperRemoved,records,peaks,work:{eligibleIntervals,floodPasses,bandCellsScanned,maxEligibleIntervals,maxBandCellsScanned},status:removed?'candidate':'abstain'};
}

 function stateRGBA(a,w,h,img){const sig=signature(a,w,h);const empty={signature:sig,w,h,panel:null};
  if(a?.length!==w*h*4)return empty;for(let i=3;i<a.length;i+=4)if(a[i]!==255)return empty;
  if(typeof PanelHostBackgroundIslands==='undefined'||typeof PanelSupportedLandscape==='undefined')return empty;
  const parents=PanelSupportedLandscape.analyzeRGBA(a,w,h);if(parents.length!==1||!PanelSupportedLandscape.validateRGBA(parents[0],a,w,h))return empty;
  const insets=PanelHostBackgroundIslands.supplementImage(img,[]).filter(p=>PanelHostBackgroundIslands.validateImage(p,img));if(insets.length!==1)return empty;
  const parent=maskFromPanel(parents[0],w,h),m=maskFromPanel(insets[0],w,h);if(!parent||!m)return empty;
  for(let i=0;i<m.length;i++)if(m[i]&&!parent[i])return empty;
  const q=refineMasks(a,w,h,m,parent);if(!q)return empty;
  // Preserve the issued parent's exact vectors and box: never staircase its outer rim.
  const exclusion=new Uint8Array(parent.length);for(let i=0;i<parent.length;i++)if(parent[i]&&!q.mask[i]){const x=i%w,y=i/w|0;if(!x||!y||x+1===w||y+1===h||!parent[i-1]||!parent[i+1]||!parent[i-w]||!parent[i+w])return empty;exclusion[i]=1;}
  const holes=traceMask(exclusion,w,h);if(!holes)return empty;const original=parents[0];q.evidence.originalParentContoursPreserved=true;
  // Source-certified exterior lobes only. Failed optional cleanup retains the exact inset-only owner.
  let exteriorHoles=[];
  try {
    const clean=corridorCleanup({data:a,mask:parent,width:w,height:h});
    if(clean.removed>0&&clean.deletion){
      let valid=true;for(let i=0;i<parent.length;i++)if(clean.deletion[i]&&(!parent[i]||exclusion[i])){valid=false;break;}
      const shape=valid?traceMask(clean.deletion,w,h):null;
      if(shape&&shape.area===clean.removed&&shape.polygons.length+holes.polygons.length<=16){
        exteriorHoles=shape.polygons;
        q.evidence.localExteriorFaceCleanup={version:176,method:'observed-paper-barrier-exterior-lobes',removedNativePixels:clean.removed,removedNonpaperPixels:clean.nonpaperRemoved,peakSupport:clean.peaks,intervals:clean.records,work:clean.work,connectivity:8,exteriorInkContactConnectivity:4,interpolatedInkPixels:0};
        q.evidence.fingerCleanup=true;q.evidence.hairCleanup=false;q.evidence.completeContaminationCleanup=false;
      }
    }
  } catch (_) { /* Optional boundary cleanup must never remove the valid Q2 owner. */ }

  const rings=original._contours.map(r=>r.map(v=>({x:v.x,y:v.y}))).concat(holes.polygons.concat(exteriorHoles).map(r=>r.map(([x,y])=>({x:x/w,y:y/h}))));
  const proof=freeze({version:VERSION,method:METHOD,nativeWidth:w,nativeHeight:h,nativeSignature:sig,evidence:q.evidence});const panel=freeze({x:original.x,y:original.y,w:original.w,h:original.h,_identitySource:'structural-grid-frame',_geometryOwner:'structural-grid-contours',_geometryType:'panorama-ownership',_contours:rings,_structuralGridProof:proof});issued.set(panel,sig);renderPlans.set(panel,freeze({parentContours:rings.slice(0,original._contours.length),exclusionContours:rings.slice(original._contours.length)}));return{signature:sig,w,h,panel};
 }
  function sourceState(img){if(!img)return null;let life=lifecycle.get(img);if(!life){life={failed:false,generation:0};lifecycle.set(img,life);if(img.addEventListener){img.addEventListener('load',()=>{life.failed=false;life.generation++;states.delete(img);});img.addEventListener('error',()=>{life.failed=true;life.generation++;states.delete(img);});}}
    if(img.complete===false||life.failed)return null;const w=('naturalWidth'in img)?img.naturalWidth:img.width,h=('naturalHeight'in img)?img.naturalHeight:img.height,src=img.currentSrc||img.src;
    if(!Number.isInteger(w)||!Number.isInteger(h)||w<150||h<150||w>RULES.maxDimension||h>RULES.maxDimension||w*h>RULES.maxPixels)return null;
    const old=states.get(img);if('naturalWidth'in img&&old&&old.src===src&&old.generation===life.generation&&old.w===w&&old.h===h)return old;
    let c;try{c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d',{willReadFrequently:true});if(!g)return null;g.drawImage(img,0,0);const s=stateRGBA(g.getImageData(0,0,w,h).data,w,h,img);s.src=src;s.generation=life.generation;states.set(img,s);return s;}catch(_){return null;}finally{if(c)c.width=c.height=1;}}
  function validateImage(p,img){if(!validPanel(p))return false;const s=sourceState(img);return!!(s&&issued.get(p)===s.signature&&p._structuralGridProof.nativeWidth===s.w&&p._structuralGridProof.nativeHeight===s.h);}
  function contains(p,x,y){if(!validPanel(p)||!Number.isFinite(x)||!Number.isFinite(y)||x<p.x||y<p.y||x>p.x+p.w||y>p.y+p.h)return false;let inside=false;for(const r of p._contours)for(let i=0,j=r.length-1;i<r.length;j=i++){const a=r[i],b=r[j];if((a.y>y)!==(b.y>y)&&x<(b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x)inside=!inside;}return inside;}
  function findMissCandidate(img,x,y){const s=sourceState(img);return s?.panel&&contains(s.panel,x,y)?s.panel:null;}
  function hasSourceCandidate(img){const s=sourceState(img);return!!(s?.panel&&validPanel(s.panel));}
  function panelContours(p,img){return validateImage(p,img)?p._contours:null;}
  function renderPlan(p,img){return validateImage(p,img)?renderPlans.get(p)||null:null;}
  function analyzeImage(img){const s=sourceState(img);return s?.panel?[s.panel]:[];}
 return{VERSION,RULES,isClaim,claims:isClaim,validPanel,validateImage,analyzeImage,contains,findMissCandidate,hasSourceCandidate,panelContours,renderPlan};
})();
// Inert on load: explicit final-miss Reader admission only.
if(typeof module!=='undefined')module.exports=PanelPanoramaOwnership;
