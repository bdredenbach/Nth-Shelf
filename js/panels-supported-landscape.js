/* Source-supported upper landscape parent, final-miss route ONLY.
 * Post-observation development rules; not semantic completeness proof.
 * An independently owned inset can remain grouped; edge contamination can remain.
 * Never append these overlapping parents to the normal detector/map owner list.
 */
const PanelSupportedLandscape = (() => {
  'use strict';
  const VERSION=172, METHOD='source-supported-upper-landscape';
  const RULES=Object.freeze({maxPixels:24000000,maxDimension:6000,maxRuns:200000,
    paperMin:242,paperSpread:14,darkMean:100,minRun:3,maxRunHeight:.045,
    voteRadius:.012,minSupport:.5,minDominance:1.5,minAnchorColumns:5,minSpan:.6,
    maxGapWidth:.08,gapBand:.035,leftBand:.12,minArea:.15,maxArea:.75,
    minEdgeSupport:.9,maxWeakRun:.02,minDividerSupport:.6,dividerMin:200,dividerSpread:32});
  const issued=new WeakMap(),states=new WeakMap(),lifecycle=new WeakMap();
  function freeze(o){if(o&&typeof o==='object'&&!Object.isFrozen(o)){Object.values(o).forEach(freeze);Object.freeze(o);}return o;}
  function signature(a,w,h){let x=2166136261,y=0x9e3779b9;for(let i=0;i<a.length;i++){x=Math.imul(x^a[i],16777619);y=Math.imul(y+a[i]+i,0x85ebca6b);}return[w,h,x>>>0,y>>>0].join(':');}
  // Reserved version claims fail closed even when method/type is malformed.
  const isClaim=p=>p?._structuralGridProof?.version===VERSION;
  const validPanel=p=>!!(isClaim(p)&&p._structuralGridProof.method===METHOD&&p._geometryType==='supported-landscape'&&issued.has(p)&&Object.isFrozen(p));
  function sourceProposal(a,w,h){
    const R=RULES;if(!Number.isInteger(w)||!Number.isInteger(h)||w<150||h<150||w>R.maxDimension||h>R.maxDimension||w*h>R.maxPixels||a?.length!==w*h*4)return null;
    for(let i=3;i<a.length;i+=4)if(a[i]!==255)return null;
    const paper=(x,y)=>{const j=4*(y*w+x),lo=Math.min(a[j],a[j+1],a[j+2]);return lo>=R.paperMin&&Math.max(a[j],a[j+1],a[j+2])-lo<=R.paperSpread;};
    const dark=(x,y)=>{const j=4*(y*w+x);return a[j]+a[j+1]+a[j+2]<=3*R.darkMean;};
    const edge=(x,y,axis=2)=>{let e=0;for(let d=1;d<=3;d++){if(axis!==0&&y>=d&&y+d<h){const j=4*((y-d)*w+x),k=4*((y+d)*w+x);for(let c=0;c<3;c++)e=Math.max(e,Math.abs(a[j+c]-a[k+c]));}if(axis!==1&&x>=d&&x+d<w){const j=4*(y*w+x-d),k=4*(y*w+x+d);for(let c=0;c<3;c++)e=Math.max(e,Math.abs(a[j+c]-a[k+c]));}}return e/255;};
    const rad=Math.round(h*R.voteRadius),diff=new Int32Array(h+1),top=new Int32Array(w),runs=[];top.fill(-1);
    for(let x=0;x<w;x++){
      let y=0,ia=-1,ib=-1;
      while(y<h){if(!paper(x,y)){if(top[x]<0)top[x]=y;y++;continue;}const y0=y;while(y<h&&paper(x,y))y++;const y1=y;
        if(y1-y0<R.minRun||y1-y0>h*R.maxRunHeight||y0<5||y1>h-5)continue;
        let up=false,down=false;for(let d=1;d<=5;d++){up||=dark(x,y0-d);down||=dark(x,y1+d-1);}if(!up||!down)continue;
        const cy=(y0+y1)>>1;runs.push([x,y0,y1]);if(runs.length>R.maxRuns)return null;
        const aa=Math.max(0,cy-rad),bb=Math.min(h,cy+rad+1);
        if(ia<0){ia=aa;ib=bb;}else if(aa<=ib)ib=Math.max(ib,bb);else{diff[ia]++;diff[ib]--;ia=aa;ib=bb;}
      }if(ia>=0){diff[ia]++;diff[ib]--;}
    }
    const support=new Int32Array(h);let peak=0,sum=0;for(let y=0;y<h;y++){sum+=diff[y];support[y]=sum;if(sum>support[peak])peak=y;}
    let second=0;for(let y=0;y<h;y++)if(Math.abs(y-peak)>2*rad)second=Math.max(second,support[y]);
    if(support[peak]<w*R.minSupport||support[peak]<R.minDominance*Math.max(1,second))return null;
    const anchor=new Int32Array(w),distance=new Float64Array(w);anchor.fill(-1);distance.fill(Infinity);
    for(const[x,y0,y1]of runs){if(Math.abs(((y0+y1)>>1)-peak)>rad)continue;const d=Math.abs((y0+y1)/2-peak);if(d<distance[x]){anchor[x]=y0;distance[x]=d;}}
    for(let x=0;x<w;){if(anchor[x]<0){x++;continue;}const start=x;while(x<w&&anchor[x]>=0)x++;if(x-start<R.minAnchorColumns)anchor.fill(-1,start,x);}
    let lo=0,hi=w-1;while(lo<w&&anchor[lo]<0)lo++;while(hi>=0&&anchor[hi]<0)hi--;if(hi-lo+1<w*R.minSpan)return null;
    const bottom=anchor.slice(),gaps=[];
    for(let x=lo;x<=hi;){if(anchor[x]>=0){x++;continue;}const start=x;while(x<=hi&&anchor[x]<0)x++;const end=x,left=start-1,right=end,ya=anchor[left],yb=anchor[right];if(end-start>w*R.maxGapWidth)return null;
      const ymin=Math.max(4,Math.min(ya,yb)-Math.round(h*R.gapBand)),ymax=Math.min(h-5,Math.max(ya,yb)+Math.round(h*R.gapBand)),M=ymax-ymin+1,N=right-left+1;
      let prev=new Float64Array(M);prev.fill(Infinity);prev[ya-ymin]=0;const back=new Int16Array(N*M),cost=new Float64Array(M),origin=new Int16Array(M);
      for(let j=1;j<N;j++){const curr=new Float64Array(M);for(let k=0;k<M;k++){cost[k]=1-edge(left+j,ymin+k,1);curr[k]=prev[k]+cost[k];origin[k]=k;}
        for(let k=1;k<M;k++){const alt=curr[k-1]+cost[k]+.025;if(alt<curr[k]){curr[k]=alt;origin[k]=origin[k-1];}}
        for(let k=M-2;k>=0;k--){const alt=curr[k+1]+cost[k]+.025;if(alt<curr[k]){curr[k]=alt;origin[k]=origin[k+1];}}
        back.set(origin,j*M);prev=curr;
      }
      let yy=yb-ymin;if(!Number.isFinite(prev[yy]))return null;bottom[right]=yb;for(let j=N-1;j>0;j--){yy=back[j*M+yy];bottom[left+j-1]=yy+ymin;}
      gaps.push({start,end,length:end-start});
    }
    const endY=bottom[lo],band=Math.round(w*R.leftBand),xmin=Math.max(1,lo-band),xmax=Math.min(w-2,lo+band),M=xmax-xmin+1,N=endY+1;
    if(M<1||N<1||M*N>10000000)return null;
    let prev=new Float64Array(M);prev.fill(Infinity);const back=new Int8Array(M*N);
    for(let y=0;y<N;y++){
      for(let k=0;k<M;k++)if(top[xmin+k]===y)prev[k]=0;
      if(y===0)continue;const next=new Float64Array(M);
      for(let k=0;k<M;k++){let best=Infinity,dxBest=0;for(let dx=-3;dx<=3;dx++){const q=k-dx;if(q<0||q>=M)continue;const v=prev[q]+.025*Math.abs(dx);if(v<best){best=v;dxBest=dx;}}
        next[k]=best+1-edge(xmin+k,y,0);back[y*M+k]=dxBest;if(top[xmin+k]===y)next[k]=0;
      }prev=next;
    }
    let xx=lo-xmin;if(!Number.isFinite(prev[xx]))return null;const left=[];
    for(let y=endY;y>=0;y--){left.push([xx+xmin,y]);if(top[xx+xmin]===y)break;xx-=back[y*M+xx];if(xx<0||xx>=M)return null;}
    left.reverse();const tx=left[0][0];if(top[hi]<0)return null;
    const lower=[],upper=[];for(let x=lo;x<=hi;x++)lower.push([x,bottom[x]]);for(let x=tx;x<=hi;x++){if(top[x]<0)return null;upper.push([x,top[x]]);}
    const polygon=left.concat(lower,[[hi,top[hi]]],upper.slice().reverse());
    let area=0,x0=w,y0=h,x1=0,y1=0;for(let i=0;i<polygon.length;i++){const[x,y]=polygon[i],[u,v]=polygon[(i+1)%polygon.length];area+=x*v-u*y;x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}
    area=Math.abs(area)/2;if(area<w*h*R.minArea||area>w*h*R.maxArea)return null;
    function contourEvidence(points){let count=0,strong=0,run=0,longest=0;for(let i=0;i<points.length-1;i++){const[x,y]=points[i],[u,v]=points[i+1],n=Math.max(Math.abs(u-x),Math.abs(v-y));for(let k=0;k<n;k++){const px=Math.round(x+(u-x)*k/n),py=Math.round(y+(v-y)*k/n);count++;if(edge(px,py)>=16/255){strong++;run=0;}else{run++;longest=Math.max(longest,run);}}}return{pixels:count,support:strong/Math.max(1,count),longestWeakRun:longest};}
    const sides={bottom:contourEvidence(lower),left:contourEvidence(left),top:contourEvidence(upper),right:contourEvidence([[hi,top[hi]],[hi,bottom[hi]]])};
    if(Object.values(sides).some(e=>e.support<R.minEdgeSupport||e.longestWeakRun>Math.max(8,Math.round(R.maxWeakRun*Math.min(w,h)))))return null;
    // White separators must reach both outer-boundary neighborhoods, not merely a floating inset side.
    const counts=new Int32Array(w),upperCounts=new Int32Array(w),lowerCounts=new Int32Array(w),heights=new Int32Array(w),uHeights=new Int32Array(w),lHeights=new Int32Array(w),leftAt=new Int32Array(h);leftAt.fill(w);for(const[x,y]of left)leftAt[y]=x;
    const vrad=Math.round(w*.012),rowDiff=new Int32Array(w+1);
    // Rejection-only: shaded/aged neutral paper also separates cells.
    const dividerPaper=(x,y)=>{const j=4*(y*w+x),lo=Math.min(a[j],a[j+1],a[j+2]);return lo>=R.dividerMin&&Math.max(a[j],a[j+1],a[j+2])-lo<=R.dividerSpread;};
    for(let y=y0;y<=y1;y++){
      rowDiff.fill(0);for(let x=0;x<w;){if(!dividerPaper(x,y)){x++;continue;}const a0=x;while(x<w&&dividerPaper(x,y))x++;const a1=x;
        if(a1-a0<3||a1-a0>w*.045||a0<5||a1>w-5)continue;let l=false,r=false;for(let d=1;d<=5;d++){l||=dark(a0-d,y);r||=dark(a1+d-1,y);}if(!l||!r)continue;const c=(a0+a1)>>1;rowDiff[Math.max(0,c-vrad)]++;rowDiff[Math.min(w,c+vrad+1)]--;}
      let votes=0;for(let x=0;x<w;x++){votes+=rowDiff[x];if(x<=x0+.1*(x1-x0)||x>=x1-.1*(x1-x0)||x<lo||x>hi||top[x]>y||bottom[x]<y||(y>=left[0][1]&&y<=endY&&x<leftAt[y]))continue;
        heights[x]++;const n=Math.max(1,Math.round((bottom[x]-top[x])*.1)),up=y<top[x]+n,down=y>bottom[x]-n;if(up)uHeights[x]++;if(down)lHeights[x]++;if(votes>0){counts[x]++;if(up)upperCounts[x]++;if(down)lowerCounts[x]++;}}
    }
    let verticalSupport=0;for(let x=0;x<w;x++)if(heights[x]>h*.2){verticalSupport=Math.max(verticalSupport,counts[x]/heights[x]);if(counts[x]>=R.minDividerSupport*heights[x]&&upperCounts[x]>=.5*uHeights[x]&&lowerCounts[x]>=.5*lHeights[x])return null;}
    return{polygon,box:[x0,y0,x1,y1],evidence:{paperSupport:support[peak]/w,secondSupport:second/w,span:(hi-lo+1)/w,areaFraction:area/(w*h),gaps,sides,verticalSupport}};
  }
  function stateRGBA(a,w,h){const q=sourceProposal(a,w,h);const sig=signature(a,w,h);if(!q)return{signature:sig,w,h,panel:null};
    const[x0,y0,x1,y1]=q.box,proof=freeze({version:VERSION,method:METHOD,nativeWidth:w,nativeHeight:h,nativeSignature:sig,evidence:q.evidence});
    const p=freeze({x:x0/w,y:y0/h,w:(x1-x0)/w,h:(y1-y0)/h,_identitySource:'structural-grid-frame',_geometryOwner:'structural-grid-contours',_geometryType:'supported-landscape',_contours:[q.polygon.map(([x,y])=>({x:x/w,y:y/h}))],_structuralGridProof:proof});issued.set(p,sig);return{signature:sig,w,h,panel:p};
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
  function installReader(reader){if(!reader||reader._supportedLandscape172)return;for(const name of['panelContours','displayPanelContours']){const old=reader[name];if(typeof old!=='function')continue;reader[name]=function(...args){return isClaim(args[0])?panelContours(args[0],this.getPanelImageContext()?.img):old.apply(this,args);};}reader._supportedLandscape172=true;}
  function installValidation(){if(typeof PanelStructuralGrid!=='undefined'&&!PanelStructuralGrid._supportedLandscape172){const old=PanelStructuralGrid.validPanel;PanelStructuralGrid.validPanel=function(...args){return isClaim(args[0])?validPanel(args[0]):old.apply(this,args);};PanelStructuralGrid._supportedLandscape172=true;}
    if(typeof PanelGeometry!=='undefined'&&!PanelGeometry._supportedLandscape172){const old=PanelGeometry.refine;PanelGeometry.refine=async function(...args){const[src,p]=args;if(!isClaim(p))return old.apply(this,args);try{const img=new Image();img.src=src;await img.decode();return validateImage(p,img)?p:null;}catch(_){return null;}};PanelGeometry._supportedLandscape172=true;}}
  return{VERSION,RULES,isClaim,claims:isClaim,validPanel,validateImage,validateRGBA,analyzeRGBA,contains,findMissCandidate,panelContours,installReader,installValidation};
})();
if(typeof Reader!=='undefined')PanelSupportedLandscape.installReader(Reader);
PanelSupportedLandscape.installValidation();
if(typeof module!=='undefined')module.exports=PanelSupportedLandscape;
