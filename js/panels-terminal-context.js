/* Source-supported terminal scene + attached title/credit ornament, final-miss ONLY.
 * Development-derived contextual grouping, NOT exact semantic contour proof.
 * Full paratext may remain attached; bounded weak closures must lie in source paper.
 * Never append these overlapping contextual groups to the normal detector bank.
 * Eligibility inherits independently validated upper context from version172;
 * version173 owns the terminal source mask, boundary gates and image authority.
 */
const PanelTerminalContext = (() => {
  'use strict';
  const VERSION=173, METHOD='source-supported-terminal-context';
  const RULES=Object.freeze({maxPixels:24000000,maxDimension:6000,maxRuns:200000,
    minSourceSpan:.6,minRowFraction:.15,maxRowFraction:.6,
    minArea:.04,maxArea:.35,minAttachedContextArea:.02,minDominantComponent:.999,
    maxWeakBoundaryFraction:.1,maxWeakNonpaperFraction:.05,
    maxWeakSpanFraction:.05,maxWeakCellsFraction:.08,
    maxDPWeakRunFraction:.025,maxDPWeakNonpaperFraction:.04});
  const issued=new WeakMap(),states=new WeakMap(),lifecycle=new WeakMap();
  function freeze(o){if(o&&typeof o==='object'&&!Object.isFrozen(o)){Object.values(o).forEach(freeze);Object.freeze(o);}return o;}
  function signature(a,w,h){let x=2166136261,y=0x9e3779b9;for(let i=0;i<a.length;i++){x=Math.imul(x^a[i],16777619);y=Math.imul(y+a[i]+i,0x85ebca6b);}return[w,h,x>>>0,y>>>0].join(':');}
  // Reserved version claims fail closed even when method/type is malformed.
  const isClaim=p=>!!p&&(p._structuralGridProof?.version===VERSION||p._structuralGridProof?.method===METHOD||p._geometryType==='terminal-context');
  const validPanel=p=>!!(isClaim(p)&&p._structuralGridProof?.version===VERSION&&p._structuralGridProof.method===METHOD&&p._geometryType==='terminal-context'&&issued.has(p)&&Object.isFrozen(p));
  function sourceProposal(a,w,h){
    const R=RULES;if(!Number.isInteger(w)||!Number.isInteger(h)||w<150||h<150||w>R.maxDimension||h>R.maxDimension||w*h>R.maxPixels||a?.length!==w*h*4)return null;
    for(let i=3;i<a.length;i+=4)if(a[i]!==255)return null;
    const upstream=typeof PanelSupportedLandscape!=='undefined'?PanelSupportedLandscape:(typeof require==='function'?require('./panels-supported-landscape.js'):null);
    const owners=upstream?.analyzeRGBA(a,w,h);if(owners?.length!==1)return null;
    const pts=owners[0]._contours[0].map(p=>[Math.round(p.x*w),Math.round(p.y*h)]);let junction=-1;
    for(let i=1;i<pts.length;i++)if(pts[i][0]===pts[i-1][0]&&pts[i][1]===pts[i-1][1]){junction=i;break;}
    if(junction<2)return null;const left=pts.slice(0,junction),sep=new Int32Array(w);sep.fill(-1);let j=junction;
    sep[pts[j][0]]=pts[j][1];while(j+1<pts.length&&pts[j+1][0]===pts[j][0]+1){j++;sep[pts[j][0]]=pts[j][1];}
    const lo=pts[junction][0],hi=pts[j][0];if(hi-lo+1<w*R.minSourceSpan)return null;
    const vals=Array.from(sep).filter(y=>y>=0).sort((x,y)=>x-y),sy=vals[vals.length>>1],rh=h-sy;if(rh<h*R.minRowFraction||rh>h*R.maxRowFraction)return null;
    const paper=(x,y,min=242,spread=14)=>{const i=4*(y*w+x),v=Math.min(a[i],a[i+1],a[i+2]);return v>=min&&Math.max(a[i],a[i+1],a[i+2])-v<=spread;};
    const dark=(x,y)=>{const i=4*(y*w+x);return a[i]+a[i+1]+a[i+2]<=300;};
    const edge=(x,y)=>{let e=0;for(let d=1;d<=3;d++)if(x>=d&&x+d<w){const i=4*(y*w+x-d),k=4*(y*w+x+d);for(let c=0;c<3;c++)e=Math.max(e,Math.abs(a[i+c]-a[k+c]));}return e/255;};
    const rad=Math.round(w*.012),support=new Int32Array(w),runs=[],diff=new Int32Array(w+1),first=new Int32Array(w),last=new Int32Array(w);first.fill(-1);last.fill(-1);
    for(let y=sy;y<h;y++){
      diff.fill(0);for(let x=0;x<w;){if(!paper(x,y)){x++;continue;}const b=x;while(x<w&&paper(x,y))x++;const e=x;if(e-b<3||e-b>w*.025||b<5||e>w-5)continue;
        let l=false,r=false;for(let d=1;d<=5;d++){l||=dark(b-d,y);r||=dark(e+d-1,y);}if(!l||!r)continue;const c=(b+e)>>1;runs.push([y,b,e]);if(runs.length>R.maxRuns)return null;diff[Math.max(0,c-rad)]++;diff[Math.min(w,c+rad+1)]--;}
      let v=0;for(let x=0;x<w;x++){v+=diff[x];if(v>0){support[x]++;if(first[x]<0)first[x]=y;last[x]=y;}}
    }
    const groups=[];for(let x=0;x<w;){if(x<=w*.08||x>=w*.92||support[x]<rh*.6){x++;continue;}let best=x;while(x<w&&x>w*.08&&x<w*.92&&support[x]>=rh*.6){if(support[x]>support[best])best=x;x++;}if(last[best]>=h-rh*.12&&first[best]<=sy+rh*.3)groups.push(best);}
    if(!groups.length)return null;const cx=groups[0],anchor=new Int32Array(h),distance=new Float64Array(h);anchor.fill(-1);distance.fill(Infinity);
    for(const[y,b,e]of runs){if(Math.abs(((b+e)>>1)-cx)>rad)continue;const d=Math.abs((b+e)/2-cx);if(d<distance[y]){anchor[y]=b;distance[y]=d;}}
    for(let y=0;y<h;){if(anchor[y]<0){y++;continue;}const b=y;while(y<h&&anchor[y]>=0)y++;if(y-b<rh*.08)anchor.fill(-1,b,y);}
    let start=0,end=h-1;while(start<h&&anchor[start]<0)start++;while(end>=0&&anchor[end]<0)end--;if(start>=end||sep[cx]<0)return null;
    const path=anchor.slice(),xmin=Math.max(3,cx-Math.round(w*.055)),xmax=Math.min(w-4,cx+Math.round(w*.055)),M=xmax-xmin+1,segments=[];
    function complete(y0,y1,x0,x1,freeStart=false,freeEnd=false){
      const N=y1-y0+1;if(N<1||M*N>10000000||x0<xmin||x0>xmax||x1<xmin||x1>xmax)return false;
      let prev=new Float64Array(M);prev.fill(Infinity);if(freeStart)for(let k=0;k<M;k++)prev[k]=1-edge(xmin+k,y0);else prev[x0-xmin]=0;
      const back=new Int16Array(N*M),cost=new Float64Array(M),origin=new Int16Array(M);
      for(let y=1;y<N;y++){const curr=new Float64Array(M);for(let k=0;k<M;k++){cost[k]=1-edge(xmin+k,y0+y);curr[k]=prev[k]+cost[k];origin[k]=k;}
        for(let k=1;k<M;k++){const v=curr[k-1]+cost[k]+.025;if(v<curr[k]){curr[k]=v;origin[k]=origin[k-1];}}
        for(let k=M-2;k>=0;k--){const v=curr[k+1]+cost[k]+.025;if(v<curr[k]){curr[k]=v;origin[k]=origin[k+1];}}back.set(origin,y*M);prev=curr;}
      let x=x1-xmin;if(freeEnd)for(let k=0;k<M;k++)if(prev[k]<prev[x])x=k;if(!Number.isFinite(prev[x]))return false;
      path[y1]=x+xmin;for(let y=N-1;y>0;y--){x=back[y*M+x];path[y0+y-1]=x+xmin;}
      let strong=0,weak=0,longest=0,weakNonpaper=0;for(let y=y0;y<=y1;y++){if(edge(path[y],y)>=16/255){strong++;weak=0;}else{weak++;longest=Math.max(longest,weak);if(!paper(path[y],y,235,20))weakNonpaper++;}}
      if(longest>Math.max(8,h*R.maxDPWeakRunFraction)||weakNonpaper>Math.max(4,N*R.maxDPWeakNonpaperFraction))return false;segments.push({rows:N,strongFraction:strong/N,longestWeakRun:longest,weakNonpaper});return true;
    }
    const topY=sep[cx];if(topY>start||!complete(topY,start,cx,anchor[start],true))return null;
    for(let y=start;y<=end;){if(anchor[y]>=0){y++;continue;}const b=y;while(y<=end&&anchor[y]<0)y++;if(y-b>rh*.18||!complete(b-1,y,anchor[b-1],anchor[y]))return null;}
    const rowLeft=new Int32Array(h),colBottom=new Int32Array(w);rowLeft.fill(w);colBottom.fill(-1);let bottom=-1;
    for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(!paper(x,y)){if(rowLeft[y]===w)rowLeft[y]=x;colBottom[x]=y;if(x>=xmin&&x<=xmax)bottom=y;}
    if(bottom<end||!complete(end,bottom,anchor[end],cx,false,true))return null;
    const mask=new Uint8Array(w*h);for(let y=topY;y<=bottom;y++)if(path[y]>=0)mask.fill(1,y*w+rowLeft[y],y*w+path[y]+1);
    const leftAt=new Int32Array(h);leftAt.fill(-1);for(const[x,y]of left)leftAt[y]=x;const[firstX,firstY]=left[0],[lastX,lastY]=left[left.length-1];
    for(let y=0;y<firstY;y++)for(let x=0;x<=firstX;x++)if(!paper(x,y))leftAt[y]=x;
    for(let y=lastY+1;y<topY;y++)leftAt[y]=lastX;
    for(let y=0;y<topY;y++)if(leftAt[y]>=rowLeft[y])mask.fill(1,y*w+rowLeft[y],y*w+leftAt[y]+1);
    for(let x=0;x<w;x++){for(let y=colBottom[x]+1;y<h;y++)mask[y*w+x]=0;if(sep[x]>=0)for(let y=0;y<=sep[x];y++)if(y>=topY||x>leftAt[y])mask[y*w+x]=0;}
    // Above-row decoration keeps source silhouette and enclosed holes only.
    const outer=new Uint8Array(w*topY),queue=new Int32Array(w*h);let head=0,tail=0;
    function seed(i){if(i<0||i>=outer.length||outer[i])return;const y=(i/w)|0,x=i-y*w;if(mask[i]&&!paper(x,y))return;outer[i]=1;queue[tail++]=i;}
    for(let x=0;x<w;x++){seed(x);seed((topY-1)*w+x);}for(let y=0;y<topY;y++){seed(y*w);seed(y*w+w-1);}
    while(head<tail){const i=queue[head++],x=i%w;if(x>0)seed(i-1);if(x+1<w)seed(i+1);seed(i-w);seed(i+w);}
    let upperArea=0;for(let i=0;i<outer.length;i++){mask[i]=mask[i]&&!outer[i]?1:0;upperArea+=mask[i];}
    // A one-pixel upstream rim is not an attached contextual ornament.
    if(upperArea<w*h*R.minAttachedContextArea)mask.fill(0,0,outer.length);
    // Keep one dominant connected scene; never bridge fragments.
    const labels=new Int32Array(w*h);let count=0,best=0,bestSize=0,total=0;
    for(let i=0;i<mask.length;i++)if(mask[i]&&!labels[i]){count++;head=0;tail=1;queue[0]=i;labels[i]=count;while(head<tail){const q=queue[head++],x=q%w;for(const n of[x>0?q-1:-1,x+1<w?q+1:-1,q-w,q+w])if(n>=0&&n<mask.length&&mask[n]&&!labels[n]){labels[n]=count;queue[tail++]=n;}}total+=tail;if(tail>bestSize){bestSize=tail;best=count;}}
    if(bestSize<total*R.minDominantComponent||bestSize<w*h*R.minArea||bestSize>w*h*R.maxArea)return null;for(let i=0;i<mask.length;i++)mask[i]=labels[i]===best?1:0;
    // Exact raster-cell boundary. Gaps may cross paper but not unsupported artwork.
    const next=new Map(),weakCells=[],weakMark=new Uint8Array(mask.length);let boundary=0,weakEdges=0,weakNonpaper=0,x0=w,y0=h,x1=0,y1=0;
    function add(x,y,u,v,px,py,dx,dy){const key=y*(w+1)+x;if(next.has(key))return false;next.set(key,v*(w+1)+u);boundary++;let strength=0;for(let d=1;d<=3;d++){const ix=Math.max(0,Math.min(w-1,px-(d-1)*dx)),iy=Math.max(0,Math.min(h-1,py-(d-1)*dy)),ox=Math.max(0,Math.min(w-1,px+d*dx)),oy=Math.max(0,Math.min(h-1,py+d*dy)),ii=4*(iy*w+ix),oo=4*(oy*w+ox);for(let c=0;c<3;c++)strength=Math.max(strength,Math.abs(a[ii+c]-a[oo+c]));}
      if(strength<16){weakEdges++;if(!paper(px,py,235,20)||!paper(Math.max(0,Math.min(w-1,px+dx)),Math.max(0,Math.min(h-1,py+dy)),235,20))weakNonpaper++;const i=py*w+px;if(!weakMark[i]){weakMark[i]=1;weakCells.push(i);}}return true;}
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x;if(!mask[i])continue;x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x+1);y1=Math.max(y1,y+1);
      if((y===0||!mask[i-w])&&!add(x,y,x+1,y,x,y,0,-1))return null;if((x===w-1||!mask[i+1])&&!add(x+1,y,x+1,y+1,x,y,1,0))return null;if((y===h-1||!mask[i+w])&&!add(x+1,y+1,x,y+1,x,y,0,1))return null;if((x===0||!mask[i-1])&&!add(x,y+1,x,y,x,y,-1,0))return null;}
    if(weakEdges>boundary*R.maxWeakBoundaryFraction||weakNonpaper>Math.max(8,weakEdges*R.maxWeakNonpaperFraction))return null;
    let maxWeakSpan=0,maxWeakCells=0;for(const i of weakCells)if(weakMark[i]){head=0;tail=1;queue[0]=i;weakMark[i]=0;let ax=w,bx=0,ay=h,by=0;while(head<tail){const q=queue[head++],x=q%w,y=(q/w)|0;ax=Math.min(ax,x);bx=Math.max(bx,x);ay=Math.min(ay,y);by=Math.max(by,y);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const xx=x+dx,yy=y+dy,n=yy*w+xx;if(xx>=0&&xx<w&&yy>=0&&yy<h&&weakMark[n]){weakMark[n]=0;queue[tail++]=n;}}}maxWeakSpan=Math.max(maxWeakSpan,bx-ax+1,by-ay+1);maxWeakCells=Math.max(maxWeakCells,tail);}
    if(maxWeakSpan>Math.max(w,h)*R.maxWeakSpanFraction||maxWeakCells>Math.max(w,h)*R.maxWeakCellsFraction)return null;
    const polygon=[],firstKey=next.keys().next().value;let key=firstKey;do{const y=Math.floor(key/(w+1));polygon.push([key-y*(w+1),y]);key=next.get(key);if(key===undefined||polygon.length>next.size)return null;}while(key!==firstKey);
    if(polygon.length!==next.size)return null;
    return{polygon,box:[x0,y0,x1,y1],evidence:{groupedParatext:true,exactSemanticContour:false,upperContextVersion:172,verticalSupport:support[cx]/rh,terminalAreaFraction:bestSize/(w*h),segments,boundaryEdges:boundary,weakEdges,weakNonpaper,maxWeakSpan,maxWeakCells}};
  }
  function stateRGBA(a,w,h){const q=sourceProposal(a,w,h);const sig=signature(a,w,h);if(!q)return{signature:sig,w,h,panel:null};
    const[x0,y0,x1,y1]=q.box,proof=freeze({version:VERSION,method:METHOD,nativeWidth:w,nativeHeight:h,nativeSignature:sig,evidence:q.evidence});
    const p=freeze({x:x0/w,y:y0/h,w:(x1-x0)/w,h:(y1-y0)/h,_identitySource:'structural-grid-frame',_geometryOwner:'structural-grid-contours',_geometryType:'terminal-context',_contours:[q.polygon.map(([x,y])=>({x:x/w,y:y/h}))],_structuralGridProof:proof});issued.set(p,sig);return{signature:sig,w,h,panel:p};
  }
  function sourceState(img){if(!img)return null;let life=lifecycle.get(img);if(!life){life={failed:false,generation:0};lifecycle.set(img,life);if(img.addEventListener){img.addEventListener('load',()=>{life.failed=false;life.generation++;states.delete(img);});img.addEventListener('error',()=>{life.failed=true;life.generation++;states.delete(img);});}}
    if(img.complete===false||life.failed)return null;const w=('naturalWidth'in img)?img.naturalWidth:img.width,h=('naturalHeight'in img)?img.naturalHeight:img.height,src=img.currentSrc||img.src;
    if(!Number.isInteger(w)||!Number.isInteger(h)||w<150||h<150||w>RULES.maxDimension||h>RULES.maxDimension||w*h>RULES.maxPixels)return null;
    const old=states.get(img);if('naturalWidth'in img&&old&&old.src===src&&old.generation===life.generation&&old.w===w&&old.h===h)return old;
    let c;try{c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d',{willReadFrequently:true});if(!g)return null;g.drawImage(img,0,0);const s=stateRGBA(g.getImageData(0,0,w,h).data,w,h);s.src=src;s.generation=life.generation;states.set(img,s);return s;}catch(_){return null;}finally{if(c)c.width=c.height=1;}}
  function validateImage(p,img){if(!validPanel(p))return false;const s=sourceState(img);return!!(s&&issued.get(p)===s.signature&&p._structuralGridProof.nativeWidth===s.w&&p._structuralGridProof.nativeHeight===s.h);}
  function contains(p,x,y){if(!validPanel(p)||!Number.isFinite(x)||!Number.isFinite(y)||x<p.x||y<p.y||x>p.x+p.w||y>p.y+p.h)return false;let inside=false;const r=p._contours[0];for(let i=0,j=r.length-1;i<r.length;j=i++){const a=r[i],b=r[j];if((a.y>y)!==(b.y>y)&&x<(b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x)inside=!inside;}return inside;}
  function findMissCandidate(img,x,y){const s=sourceState(img);return s?.panel&&contains(s.panel,x,y)?s.panel:null;}
  function panelContours(p,img){return validateImage(p,img)?p._contours:null;}
  function analyzeRGBA(a,w,h){if(!Number.isInteger(w)||!Number.isInteger(h)||w<150||h<150||w>RULES.maxDimension||h>RULES.maxDimension||w*h>RULES.maxPixels||a?.length!==w*h*4)return[];const s=stateRGBA(a,w,h);return s.panel?[s.panel]:[];}
  function validateRGBA(p,a,w,h){return validPanel(p)&&a?.length===w*h*4&&p._structuralGridProof.nativeWidth===w&&p._structuralGridProof.nativeHeight===h&&issued.get(p)===signature(a,w,h);}
  return{VERSION,RULES,isClaim,claims:isClaim,validPanel,validateImage,validateRGBA,analyzeRGBA,contains,findMissCandidate,panelContours};
})();
// Inert on load: explicit Reader final-miss admission owns integration.
if(typeof module!=='undefined')module.exports=PanelTerminalContext;
