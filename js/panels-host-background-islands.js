/* Wide, richly illustrated islands supported by a pale chromatic host.
 * Neutral highlights may connect the host to exterior paper. Its substantial
 * chromatic cores must remain interior; no closed pale-host claim is made.
 * Scene nomination uses whole-source pixels, never taps, page IDs or saved boxes.
 * No gap closing or rectangle completion is performed. Open pale regions may
 * remain absent: this is conservative source extraction, not completeness proof.
 */
const PanelHostBackgroundIslands = (() => {
  'use strict';
  const VERSION = 171, METHOD = 'chromatic-host-supported-island';
  const RULES = Object.freeze({lightMin:170,spreadMax:90,minArea:.015,maxArea:.20,
    minWidth:.15,minHeight:.08,maxHeight:.60,minAspect:1.8,maxAspect:6,
    minFill:.40,maxFill:1,minHostArea:.08,maxHostArea:.80,minCoreArea:.01,minCoreUnion:.05,minCoreRing:.35,
    ringRadius:5,minHostRing:.95,minChromaticRing:.40,minDarkRim:.30,
    minPaletteBins:8,paletteBinFraction:.01,minUpperDark:.25,minLowerDark:.50,
    maxUpperSpread:.20,maxLowerSpread:.15,minRailSeparation:.50});
  const issued = new WeakMap(), states = new WeakMap(), lifecycle = new WeakMap();
  const claims = p => p?._structuralGridProof?.version === VERSION;
  const canonical = p => JSON.stringify([p.x,p.y,p.w,p.h,p._identitySource,p._geometryOwner,p._geometryType,p._contours]);
  const equal = (a,b) => JSON.stringify(a) === JSON.stringify(b);
  function freeze(x) { if(x && typeof x === 'object' && !Object.isFrozen(x)){Object.values(x).forEach(freeze);Object.freeze(x);} return x; }
  const darkInk=(a,j)=>Math.max(a[j],a[j+1],a[j+2])<120&&Math.max(a[j],a[j+1],a[j+2])-Math.min(a[j],a[j+1],a[j+2])<=60;
  function signature(a,w,h) { let x=2166136261,y=0x9e3779b9; for(let i=0;i<a.length;i++){x=Math.imul(x^a[i],16777619);y=Math.imul(y+a[i]+i,0x85ebca6b);} return [w,h,x>>>0,y>>>0].join(':'); }
  function components(mask,w,h) {
    const labels=new Int32Array(w*h),queue=new Int32Array(w*h),items=[null];let id=0;
    for(let seed=0;seed<mask.length;seed++)if(mask[seed]&&!labels[seed]){
      let n=1,head=0,x0=w,y0=h,x1=0,y1=0;queue[0]=seed;labels[seed]=++id;
      while(head<n){const i=queue[head++],x=i%w,y=i/w|0;x0=Math.min(x0,x);x1=Math.max(x1,x+1);y0=Math.min(y0,y);y1=Math.max(y1,y+1);
        for(const j of [x?i-1:-1,x+1<w?i+1:-1,y?i-w:-1,y+1<h?i+w:-1])if(j>=0&&mask[j]&&!labels[j]){labels[j]=id;queue[n++]=j;}}
      items.push({id,pixels:n,box:[x0,y0,x1,y1],edge:x0===0||y0===0||x1===w||y1===h});
    }return {labels,items};
  }
  function fillEnclosed(labels,id,box,w,h) {
    const [x0,y0,x1,y1]=box,W=x1-x0,H=y1-y0,outside=new Uint8Array(W*H),queue=new Int32Array(W*H);let n=0,head=0;
    const add=(x,y)=>{const i=y*W+x;if(!outside[i]&&labels[(y+y0)*w+x+x0]!==id){outside[i]=1;queue[n++]=i;}};
    for(let x=0;x<W;x++){add(x,0);add(x,H-1);}for(let y=0;y<H;y++){add(0,y);add(W-1,y);}
    while(head<n){const i=queue[head++],x=i%W,y=i/W|0;if(x)add(x-1,y);if(x+1<W)add(x+1,y);if(y)add(x,y-1);if(y+1<H)add(x,y+1);}
    const mask=new Uint8Array(w*h);for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(!outside[y*W+x])mask[(y+y0)*w+x+x0]=1;
    return mask;
  }
  const quantile=(a,q)=>a.length?a.slice().sort((x,y)=>x-y)[Math.floor((a.length-1)*q)]:NaN;
  function measure(mask,box,s) {
    const {w,h,rgba,bg}=s,N=w*h,palette=new Uint32Array(512),ring=new Uint8Array(N),front=mask.slice();let pixels=0,rim=0,darkRim=0;
    for(let step=0;step<RULES.ringRadius;step++){const next=front.slice();for(let i=0;i<N;i++)if(front[i]){const x=i%w,y=i/w|0;if(x)next[i-1]=1;if(x+1<w)next[i+1]=1;if(y)next[i-w]=1;if(y+1<h)next[i+w]=1;}front.set(next);}
    const hostCounts=new Uint32Array(bg.items.length);let ringCount=0,chromaticRing=0;const coreCounts=s.cores.map(c=>new Uint32Array(c.items.length));
    for(let i=0;i<N;i++){
      if(front[i]&&!mask[i]){ring[i]=1;ringCount++;hostCounts[bg.labels[i]]++;for(let family=0;family<s.cores.length;family++)coreCounts[family][s.cores[family].labels[i]]++;const j=i*4;if(Math.max(rgba[j],rgba[j+1],rgba[j+2])-Math.min(rgba[j],rgba[j+1],rgba[j+2])>=10)chromaticRing++;}
      if(!mask[i])continue;pixels++;const j=i*4;palette[(rgba[j]>>5)*64+(rgba[j+1]>>5)*8+(rgba[j+2]>>5)]++;
      const x=i%w,y=i/w|0;if(!x||x+1===w||!y||y+1===h||!mask[i-1]||!mask[i+1]||!mask[i-w]||!mask[i+w]){rim++;if(darkInk(rgba,j))darkRim++;}
    }
    let host=0;for(let k=1;k<hostCounts.length;k++)if(hostCounts[k]>hostCounts[host])host=k;
    const upper=[],lower=[];let columns=0;
    for(let x=box[0];x<box[2];x++){let y0=-1,y1=-1;for(let y=box[1];y<box[3];y++)if(mask[y*w+x]){if(y0<0)y0=y;y1=y;}if(y0<0)continue;columns++;
      let j=(y0*w+x)*4;if(darkInk(rgba,j))upper.push(y0);
      j=(y1*w+x)*4;if(darkInk(rgba,j))lower.push(y1);
    }
    let chromaticCoreRing=0,chromaticCorePixels=0,coreFamily=-1,coreCount=0;
    for(let family=0;family<s.cores.length;family++){let votes=0,pixels=0,count=0;for(let k=1;k<coreCounts[family].length;k++){const c=s.cores[family].items[k];if(coreCounts[family][k]&&!c.edge&&c.pixels>=N*RULES.minCoreArea){votes+=coreCounts[family][k];pixels+=c.pixels;count++;}}if(votes>chromaticCoreRing){chromaticCoreRing=votes;chromaticCorePixels=pixels;coreFamily=family;coreCount=count;}}
    const H=box[3]-box[1];return {pixels,rim,darkRim,ringCount,host,hostPixels:bg.items[host]?.pixels||0,hostEdge:bg.items[host]?.edge??true,
      hostRing:hostCounts[host]/Math.max(1,ringCount),chromaticRing:chromaticRing/Math.max(1,ringCount),
      chromaticCoreRing:chromaticCoreRing/Math.max(1,ringCount),chromaticCorePixels,coreFamily,coreCount,
      paletteBins:Array.from(palette).filter(n=>n>=pixels*RULES.paletteBinFraction).length,
      upperDark:upper.length/Math.max(1,columns),lowerDark:lower.length/Math.max(1,columns),
      upperSpread:(quantile(upper,.9)-quantile(upper,.1))/H,lowerSpread:(quantile(lower,.9)-quantile(lower,.1))/H,
      railSeparation:(quantile(lower,.5)-quantile(upper,.5))/H};
  }
  function supports(e,box,w,h) {
    const W=box[2]-box[0],H=box[3]-box[1],N=w*h,R=RULES;
    return e.pixels>=N*R.minArea&&e.pixels<=N*R.maxArea&&W>=w*R.minWidth&&H>=h*R.minHeight&&H<=h*R.maxHeight&&W/H>=R.minAspect&&W/H<=R.maxAspect&&
      e.pixels/(W*H)>=R.minFill&&e.pixels/(W*H)<=R.maxFill&&e.chromaticCoreRing>=R.minCoreRing&&e.chromaticCorePixels>=N*R.minCoreUnion&&e.hostPixels>=N*R.minHostArea&&e.hostPixels<=N*R.maxHostArea&&
      e.hostRing>=R.minHostRing&&e.chromaticRing>=R.minChromaticRing&&e.darkRim/Math.max(1,e.rim)>=R.minDarkRim&&e.paletteBins>=R.minPaletteBins&&
      e.upperDark>=R.minUpperDark&&e.lowerDark>=R.minLowerDark&&e.upperSpread<=R.maxUpperSpread&&e.lowerSpread<=R.maxLowerSpread&&e.railSeparation>=R.minRailSeparation;
  }
  function stateRGBA(rgba,w,h,nativeSignature=null,nativeWidth=w,nativeHeight=h) {
    if(!Number.isInteger(w)||!Number.isInteger(h)||w<150||h<150||w>900||h>900||rgba?.length!==w*h*4||typeof PanelMatteCells==='undefined')return null;
    const light=new Uint8Array(w*h);for(let i=0;i<light.length;i++){const j=i*4;if(rgba[j+3]!==255)return null;const lo=Math.min(rgba[j],rgba[j+1],rgba[j+2]),hi=Math.max(rgba[j],rgba[j+1],rgba[j+2]);light[i]=+(lo>=RULES.lightMin&&hi-lo<=RULES.spreadMax);}
    const cores=[];for(let family=0;family<3;family++){const mask=new Uint8Array(w*h);for(let i=0;i<mask.length;i++){const j=i*4,r=rgba[j],g=rgba[j+1],b=rgba[j+2],kind=r>g&&r>b?0:g>b?1:2;mask[i]=+(light[i]&&kind===family&&Math.max(r,g,b)-Math.min(r,g,b)>=10);}cores.push(components(mask,w,h));}const sig=signature(rgba,w,h);return {rgba,nativeRGBA:rgba,w,h,cores,signature:sig,nativeSignature:nativeSignature||sig,nativeWidth,nativeHeight,bg:components(light,w,h),fg:components(light.map(v=>1-v),w,h)};
  }
  // Analysis pixels nominate only. Recover the same source component locally at
  // native resolution; never bridge gaps or infer a rectangular hit region.
  function nativeIsland(s,analysisBox,analysisMask) {
    const W=s.nativeWidth,H=s.nativeHeight,a=s.nativeRGBA;if(!a)return null;
    const scaleX=W/s.w,scaleY=H/s.h,margin=Math.ceil(Math.max(scaleX,scaleY)*3);
    const x0=Math.max(0,Math.floor(analysisBox[0]*scaleX)-margin),y0=Math.max(0,Math.floor(analysisBox[1]*scaleY)-margin);
    const x1=Math.min(W,Math.ceil(analysisBox[2]*scaleX)+margin),y1=Math.min(H,Math.ceil(analysisBox[3]*scaleY)+margin),w=x1-x0,h=y1-y0;
    if(w*h>6000000)return null;
    const fg=new Uint8Array(w*h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const j=((y+y0)*W+x+x0)*4,lo=Math.min(a[j],a[j+1],a[j+2]),hi=Math.max(a[j],a[j+1],a[j+2]);fg[y*w+x]=+(lo<RULES.lightMin||hi-lo>RULES.spreadMax);}
    const cc=components(fg,w,h),matches=[];
    for(const c of cc.items){if(!c||c.edge||c.pixels<w*h*.15)continue;
      const b=[c.box[0]+x0,c.box[1]+y0,c.box[2]+x0,c.box[3]+y0],ab=[analysisBox[0]*scaleX,analysisBox[1]*scaleY,analysisBox[2]*scaleX,analysisBox[3]*scaleY];
      const area=(b[2]-b[0])*(b[3]-b[1]),aa=(ab[2]-ab[0])*(ab[3]-ab[1]),intersection=Math.max(0,Math.min(b[2],ab[2])-Math.max(b[0],ab[0]))*Math.max(0,Math.min(b[3],ab[3])-Math.max(b[1],ab[1])),boxIoU=intersection/(area+aa-intersection);
      if(boxIoU<.95)continue;
      const m=fillEnclosed(cc.labels,c.id,c.box,w,h),occupancy=new Uint8Array(s.w*s.h);let pixels=0,old=0,shared=0;
      for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(m[y*w+x]){pixels++;const X0=Math.floor((x+x0)/scaleX),X1=Math.ceil((x+x0+1)/scaleX),Y0=Math.floor((y+y0)/scaleY),Y1=Math.ceil((y+y0+1)/scaleY);for(let Y=Y0;Y<Y1;Y++)for(let X=X0;X<X1;X++)occupancy[Y*s.w+X]=1;}
      for(let i=0;i<analysisMask.length;i++)if(analysisMask[i]){old++;shared+=occupancy[i];}
      const areaRatio=pixels/(old*scaleX*scaleY),retained=shared/Math.max(1,old);
      if(areaRatio<.85||areaRatio>1.35||retained<.95)continue;
      const rings=PanelMatteCells.tracePixelContours(m,w,h,1);if(rings?.length!==1)continue;
      matches.push({box:b,rings:rings.map(r=>r.map(([x,y])=>[x+x0,y+y0])),mask:occupancy,evidence:{method:'exact-native-component-enclosed-fill',boxIoU,areaRatio,retained,pixels,localWidth:w,localHeight:h}});
    }
    return matches.length===1?matches[0]:null;
  }
  function makeCandidates(s) {
    if(s.candidates)return s.candidates;const out=[],N=s.w*s.h;
    for(const item of s.fg.items){if(!item||item.edge||item.pixels<N*RULES.minArea||item.pixels>N*RULES.maxArea)continue;
      const box=item.box,W=box[2]-box[0],H=box[3]-box[1];if(W<s.w*RULES.minWidth||H<s.h*RULES.minHeight||W/H<RULES.minAspect||W/H>RULES.maxAspect)continue;
      const mask=fillEnclosed(s.fg.labels,item.id,box,s.w,s.h),e=measure(mask,box,s);if(!supports(e,box,s.w,s.h))continue;
      const native=nativeIsland(s,box,mask);if(!native)continue;const rings=native.rings,nbox=native.box;
      const proof=freeze({version:VERSION,method:METHOD,analysisWidth:s.w,analysisHeight:s.h,nativeWidth:s.nativeWidth,nativeHeight:s.nativeHeight,
        signature:s.signature,nativeSignature:s.nativeSignature,box:box.slice(),nativeBox:nbox,contourCoordinates:'native-source-pixel-edges',pixelContours:rings,evidence:e,nativeEvidence:native.evidence});
      const p={x:nbox[0]/s.nativeWidth,y:nbox[1]/s.nativeHeight,w:(nbox[2]-nbox[0])/s.nativeWidth,h:(nbox[3]-nbox[1])/s.nativeHeight,_identitySource:'structural-grid-frame',_geometryOwner:'structural-grid-contours',_geometryType:'host-background-island',
        _contours:freeze(rings.map(r=>r.map(([x,y])=>({x:x/s.nativeWidth,y:y/s.nativeHeight})))),_structuralGridProof:proof};
      issued.set(proof,canonical(p));out.push({panel:p,mask:native.mask});if(out.length>16)return s.candidates=[];
    }return s.candidates=out;
  }
  function validPanel(p) {return !!(claims(p)&&p._identitySource==='structural-grid-frame'&&p._geometryOwner==='structural-grid-contours'&&p._geometryType==='host-background-island'&&!p._quad&&!p._outline&&issued.get(p._structuralGridProof)===canonical(p));}
  function sourceState(img) {
    if(!img)return null;const src=img.currentSrc||img.src;
    let life=lifecycle.get(img);
    if(!life){life={failed:false,generation:0};lifecycle.set(img,life);if(img.addEventListener){img.addEventListener('load',()=>{life.failed=false;life.generation++;states.delete(img);});img.addEventListener('error',()=>{life.failed=true;life.generation++;states.delete(img);});}}
    if(img.complete===false||life.failed)return null;
    const W=('naturalWidth' in img)?img.naturalWidth:img.width,H=('naturalHeight' in img)?img.naturalHeight:img.height;
    if(!Number.isInteger(W)||!Number.isInteger(H)||W<=0||H<=0||W*H>24000000)return null;
    const old=states.get(img);if(('naturalWidth' in img)&&old&&old.src===src&&old.generation===life.generation&&old.nativeWidth===W&&old.nativeHeight===H)return old;
    let c;
    try{c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d',{willReadFrequently:true});if(!g)return null;g.drawImage(img,0,0);
      const native=g.getImageData(0,0,W,H).data,scale=Math.min(1,900/Math.max(W,H)),w=Math.round(W*scale),h=Math.round(H*scale);
      const rgba=PanelMatteCells.sampleBilinearRGBA(native,W,H,w,h),s=stateRGBA(rgba,w,h,signature(native,W,H),W,H);if(s){s.nativeRGBA=native;makeCandidates(s);delete s.nativeRGBA;s.src=src;s.generation=life.generation;states.set(img,s);}return s;
    }catch(_){return null;}finally{if(c)c.width=c.height=1;}
  }
  function validateState(p,s) {
    const v=p?._structuralGridProof;if(!s||!claims(p)||v.signature!==s.signature||v.nativeSignature!==s.nativeSignature||v.nativeWidth!==s.nativeWidth||v.nativeHeight!==s.nativeHeight)return false;
    if(validPanel(p))return true;for(const {panel:q} of makeCandidates(s))if(canonical(q)===canonical(p)&&equal(q._structuralGridProof,v)){freeze(v);freeze(p._contours);issued.set(v,canonical(p));return validPanel(p);}return false;
  }
  function validateImage(p,img){return validateState(p,sourceState(img));}
  function analyzeRGBA(rgba,w,h){const s=stateRGBA(rgba,w,h);return s?makeCandidates(s).map(q=>q.panel):[];}
  function validateRGBA(p,rgba,w,h){return validateState(p,stateRGBA(rgba,w,h));}
  function supplementImage(img,prior=[],log) {
    if(!Array.isArray(prior)||prior.length>64||prior.some(p=>!PanelGeometryOrthogonal._provenContours(p)))return[];
    const s=sourceState(img);if(!s)return[];const occupied=new Uint8Array(s.w*s.h);
    for(const p of prior){const m=PanelLocalBoundaryConsensus.raster(p,s.w,s.h);for(let i=0;i<m.length;i++)occupied[i]|=m[i];}
    const out=makeCandidates(s).filter(q=>!q.mask.some((v,i)=>v&&occupied[i])).map(q=>q.panel);
    if(out.length)log?.('chromatic host islands: '+out.length+' source-bound wide inset(s), existing owners retained');return out;
  }
  function installDetector(detector) {
    if(typeof PanelStructuralGrid!=='undefined'&&!PanelStructuralGrid._hostBackgroundIslands171){const old=PanelStructuralGrid.validPanel;PanelStructuralGrid.validPanel=function(...args){return claims(args[0])?validPanel(args[0]):old.apply(this,args);};PanelStructuralGrid._hostBackgroundIslands171=true;}
    if(typeof PanelGeometry!=='undefined'&&!PanelGeometry._hostBackgroundIslands171){const old=PanelGeometry.refine;PanelGeometry.refine=async function(...args){const [src,p]=args;if(!claims(p))return old.apply(this,args);try{const img=new Image();img.src=src;await img.decode();return validateImage(p,img)?{...p}:null;}catch(_){return null;}};PanelGeometry._hostBackgroundIslands171=true;}
    if(!detector?.detect||detector._hostBackgroundIslands171)return;const old=detector.detect;
    detector.detect=async function(...args){const [src,log]=args;const prior=await old.apply(this,args);try{const img=new Image();img.src=src;await img.decode();const additions=supplementImage(img,prior,log);return additions.length?prior.concat(additions):prior;}catch(_){return prior;}};detector._hostBackgroundIslands171=true;
  }
  function installReader(reader) {
    if(!reader||reader._hostBackgroundIslands171)return;const contours=reader.panelContours,display=reader.displayPanelContours;
    reader.panelContours=function(...args){const p=args[0];return claims(p)?(validateImage(p,this.getPanelImageContext()?.img)?p._contours:null):contours.apply(this,args);};
    reader.displayPanelContours=function(...args){const p=args[0];return claims(p)?(validateImage(p,this.getPanelImageContext()?.img)?p._contours:null):display.apply(this,args);};
    reader._hostBackgroundIslands171=true;
  }
  return {VERSION,RULES,claims,validPanel,validateImage,validateRGBA,analyzeRGBA,supplementImage,installDetector,installReader};
})();
if(typeof PanelDetect!=='undefined')PanelHostBackgroundIslands.installDetector(PanelDetect);
if(typeof Reader!=='undefined')PanelHostBackgroundIslands.installReader(Reader);
if(typeof module!=='undefined')module.exports=PanelHostBackgroundIslands;
