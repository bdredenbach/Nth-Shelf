/* Generated from the exact staged source modules. Research admission remains pending. */
const PanelCurvedHostNative=(()=>{const factories={
"native-source-runtime-installed.js":function(module,exports,require){
'use strict';const Math=globalThis.Math;
'use strict';
module.exports={...require('./native-source-window-assembly-exterior.js'),proofRecords:require('./source-native-proof-record-installed.js')};

},
"native-source-window-assembly-exterior.js":function(module,exports,require){
'use strict';const Math=globalThis.Math;
'use strict';
// Research source replay. Every native window is derived from canonical image
// evidence. The readWindow callback supplies current decoded source pixels;
// saved image paths, titles, page numbers and expected masks are not inputs.
const Native=require('./native-source-partition.js');
const Envelope=require('./source-caption-envelope.js');
const Fringe=require('./source-caption-mixed-fringe.js');
const Join=require('./source-same-owner-caption-join.js');
const Bracketed=require('./source-bracketed-ink-components.js');
const ExteriorMatte=require('./source-exterior-component-matte.js');
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function scaledWindow(box,pad,canonicalSize,sourceSize){
 const[cw,ch]=canonicalSize,[W,H]=sourceSize;
 return[Math.max(0,Math.floor((box[0]-pad)*W/cw)),Math.max(0,Math.floor((box[1]-pad)*H/ch)),Math.min(W,Math.ceil((box[2]+pad)*W/cw)),Math.min(H,Math.ceil((box[3]+pad)*H/ch))];
}
function windows(candidate,captionSeeds,canonicalHost,canonicalSize,sourceSize){
 const[cw,ch]=canonicalSize,[W,H]=sourceSize;
 if(![cw,ch,W,H].every(v=>Number.isSafeInteger(v)&&v>0)||!candidate?.extent?.box||!candidate?.proposal?.circle)return null;
 const[cx,cy,r]=candidate.proposal.circle,body=scaledWindow(candidate.extent.box,Math.ceil(r*.12),canonicalSize,sourceSize),captions=captionSeeds.filter(s=>s.indices.reduce((n,i)=>n+canonicalHost[i],0)>s.pixels*.98).sort((a,b)=>a.box[1]-b.box[1]||a.box[0]-b.box[0]).map(s=>({box:scaledWindow(s.box,Math.max(4,Math.ceil((s.box[3]-s.box[1])*.16)),canonicalSize,sourceSize),canonicalBox:s.box,owner:candidate.captions.some(c=>same(c.box,s.box))?'inset':'city'}));
 return{body,circle:[cx*W/cw-body[0],cy*H/ch-body[1],r*W/cw],captions,canonicalSize,sourceSize};
}
function assemble({candidate,prior,canonicalHost,canonicalCaptionSeeds,canonicalSize,sourceSize,readWindow,raster,captionEvidence,captionSeeds,maxWindowPixels=1000000,maxSourcePixels=24000000}){
 const spec=windows(candidate,canonicalCaptionSeeds,canonicalHost,canonicalSize,sourceSize);
 if(!spec)return{eligible:false,reason:'invalid-source-window-evidence'};
 const[W,H]=sourceSize,[ox,oy,X,Y]=spec.body,w=X-ox,h=Y-oy;
 if(W*H>maxSourcePixels||w*h>maxWindowPixels||spec.captions.reduce((n,c)=>n+(c.box[2]-c.box[0])*(c.box[3]-c.box[1]),0)>maxWindowPixels)return{eligible:false,reason:'native-source-replay-resource-bound'};
 function read(box){const a=readWindow(box);if(!a||a.length!==(box[2]-box[0])*(box[3]-box[1])*4)throw Error('Current native source window is unavailable');return a;}
 function localRaster(panel,box){const[x,y,X,Y]=box;return raster(panel._contours.map(r=>r.map(p=>({x:(p.x*W-x)/(X-x),y:(p.y*H-y)/(Y-y)}))),X-x,Y-y);}
 const a=read(spec.body),localPrior=localRaster(prior[candidate.index],spec.body),native=Native.trace(a,w,h,spec.circle,localPrior,{sourceSize,canonicalSize,origin:[ox,oy]});
 if(!native?.mask)return{eligible:false,reason:native?.reason||'native-source-rim-deferred',native,spec};
 const host=raster(prior[candidate.index]._contours,W,H),body=Uint8Array.from(native.mask),inset=new Uint8Array(W*H),captionMask=new Uint8Array(w*h),captionReports=[];
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x,j=(y+oy)*W+x+ox;host[j]=native.host[i];inset[j]=body[i];}
 for(const c of spec.captions){const[x,y,X,Y]=c.box,cw=X-x,ch=Y-y,raw=read(c.box),e=captionEvidence(raw,cw,ch);if(!e?.e)return{eligible:false,reason:'native-caption-evidence-unavailable',spec};e.e.captionPageArea=W*H;const seeds=captionSeeds(e.e,cw,ch);if(seeds?.length!==1)return{eligible:false,reason:'native-caption-core-ambiguous',spec};const cap=Envelope.envelope(raw,cw,ch,seeds[0]);if(!cap)return{eligible:false,reason:'native-caption-enclosure-deferred',spec};const complete=Fringe.refine(raw,cw,ch,cap.mask);let addedHost=0,changedOwner=0;
  for(let j=0;j<ch;j++)for(let i=0;i<cw;i++)if(complete.mask[j*cw+i]){const index=(y+j)*W+x+i;addedHost+=!host[index];host[index]=1;const value=+(c.owner==='inset');changedOwner+=inset[index]!==value;inset[index]=value;const rx=x+i-ox,ry=y+j-oy;if(value&&rx>=0&&ry>=0&&rx<w&&ry<h)captionMask[ry*w+rx]=1;}
  captionReports.push({box:c.box,canonicalBox:c.canonicalBox,owner:c.owner,corePixels:seeds[0].pixels,addedHost,changedOwner,mixedFringe:complete.records});
 }
 const join=Join.close(a,w,h,body,captionMask);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x,j=(y+oy)*W+x+ox;if(join.mask[i])inset[j]=host[j]=1;}
 // Caption ownership is established before the final observed-ink completion.
 // This gives contact validation the real local owner, including its caption,
 // while complete connected branches still need two-sided source witnesses.
 const owned=Uint8Array.from({length:w*h},(_,i)=>inset[(Math.floor(i/w)+oy)*W+i%w+ox]);
 const bracketed=Bracketed.complete(a,w,h,owned,spec.circle,native.radii.length,{widthBound:native.paperClosed.widthBound});
 for(const i of bracketed.changed){const j=(Math.floor(i/w)+oy)*W+i%w+ox;if(!host[j])return{eligible:false,reason:'bracketed-ink-leaves-demonstrated-host'};inset[j]=1;}
 // Every exterior correction is reconstructed from the current native source.
 // Complete caption enclosures and ink anchors are established before this pass.
 const matteHost=Uint8Array.from({length:w*h},(_,i)=>host[(Math.floor(i/w)+oy)*W+i%w+ox]);
 const matteOwner=Uint8Array.from({length:w*h},(_,i)=>inset[(Math.floor(i/w)+oy)*W+i%w+ox]);
 const exterior=ExteriorMatte.inspect(a,w,h,matteHost,matteOwner,{rimWidthBound:native.paperClosed.widthBound});
 if(exterior.deferred.length)return{eligible:false,reason:'native-exterior-ownership-deferred',spec,exteriorDeferred:exterior.deferred};
 let insetLoss=0,cityAddition=0;for(let i=0;i<w*h;i++){insetLoss+=!!matteOwner[i]&&!exterior.owner[i];cityAddition+=!!exterior.complement[i]&&!(matteHost[i]&&!matteOwner[i]);}
 if(insetLoss||cityAddition)return{eligible:false,reason:'native-exterior-ownership-preservation-failed',spec,insetLoss,cityAddition};
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x,j=(y+oy)*W+x+ox;host[j]=exterior.host[i];inset[j]=exterior.owner[i];}
 const exteriorOwnership={sourceWindow:spec.body,rimWidthBound:native.paperClosed.widthBound,insetLoss,cityAddition,removedMatte:exterior.removedMatte,transferredFringe:exterior.transferredFringe,priorColorDeferred:exterior.priorColorDeferred,componentCertificates:exterior.exteriorCertificates,deferred:exterior.deferred};
 const city=host.map((v,i)=>+(v&&!inset[i]));let loss=0,overlap=0,extra=0;for(let i=0;i<host.length;i++){loss+=host[i]&&!city[i]&&!inset[i];overlap+=city[i]&&inset[i];extra+=!host[i]&&(city[i]||inset[i]);}if(loss||overlap||extra)return{eligible:false,reason:'native-source-partition-invariant-failed',preservation:{loss,overlap,extra}};
 // The partition invariant is not a visual ownership certificate. Retained
 // owner intersections must also stay identical, including any prior overlap.
 const retained=[];for(let k=0;k<prior.length;k++)if(k!==candidate.index){const mask=raster(prior[k]._contours,W,H),original=raster(prior[candidate.index]._contours,W,H);let differences=0;for(let i=0;i<host.length;i++)differences+=!!(mask[i]&&host[i])!==!!(mask[i]&&original[i]);retained.push({index:k,intersectionDifferences:differences});if(differences)return{eligible:false,reason:'retained-owner-intersection-changed',retained};}
 return{eligible:false,reason:'complete-source-and-reader-admission-pending',spec,host,inset,city,body,native,captionReports,captionJoin:join.changed,bracketedInk:{changed:bracketed.changed,sourceAnchorCountPerSide:bracketed.sourceAnchorCountPerSide,components:bracketed.components},preservation:{loss,overlap,extra,retained,exteriorOwnership},sourceWindows:[spec.body,...spec.captions.map(c=>c.box)]};
}
module.exports={scaledWindow,windows,assemble};

},
"native-source-partition.js":function(module,exports,require){
'use strict';const Math=globalThis.Math;
'use strict';
const Base=require('./native-ink-rim.js'),Arc=require('./native-source-arc-refinement.js'),Scope=require('./source-arc-scope.js'),Correct=require('./source-exterior-correction.js'),Closure=require('./source-exterior-closure.js'),Paper=require('./source-paper-rim-closure.js'),Extend=require('./source-connected-rim-extension.js'),Opaque=require('./source-continuous-opaque-rim.js'),Local=require('./native-local-layer-refinement.js'),HostColor=require('./source-host-color-continuation.js');
const wrap=(k,n)=>(k%n+n)%n;
const Closed=require('./source-paper-closed-rim-components.js'),Fringe=require('./source-paper-facing-mixed-fringe.js'),Surface=require('./source-continuous-host-surface.js'),Uncovered=require('./source-uncovered-opaque-edges.js');
function intervals(bits){const n=bits.length,start=bits.findIndex(v=>!v);if(start<0)return[{first:0,last:n-1}];const out=[];let active;for(let d=1;d<=n;d++){const k=start+d;if(bits[k%n]){if(!active)active={first:k,last:k};active.last=k;}else if(active){out.push(active);active=null;}}return out;}
function sourceProfiles(a,w,h,circle,indices,r0,r1,domain,host){const[cx,cy]=circle,N=indices.count;return indices.values.map(k=>{const rgb=[],known=[],samples=[],t=2*Math.PI*k/N;for(let radius=r0;radius<=r1;radius++){const x=Math.floor(cx+radius*Math.cos(t)),y=Math.floor(cy+radius*Math.sin(t)),inDomain=x>=domain[0]&&y>=domain[1]&&x<domain[2]&&y<domain[3],inside=x>=0&&y>=0&&x<w&&y<h,i=y*w+x,p=inside?Array.from(a.subarray(i*4,i*4+3)):[255,255,255];rgb.push(p);known.push(inside&&inDomain);samples.push(!inDomain?{radius,kind:'original-image-domain-edge'}:!inside?{radius,kind:'unknown-crop-exterior'}:{radius,kind:'source',index:i,rgb:p,host:host[i],paper:Math.min(...p)>=190&&Math.max(...p)-Math.min(...p)<=40});}return{k:wrap(k,N),rgb,known,samples};});}
function exteriorArcs(q,a,w,h,host,domain,tolerance){const N=q.radii.length,[cx,cy,r]=q.circle;
 const sample=(k,R)=>{const t=2*Math.PI*k/N,x=Math.floor(cx+R*Math.cos(t)),y=Math.floor(cy+R*Math.sin(t));if(x<domain[0]||y<domain[1]||x>=domain[2]||y>=domain[3])return{kind:'domain'};if(x<0||y<0||x>=w||y>=h)return{kind:'unknown'};const i=y*w+x,p=Array.from(a.subarray(i*4,i*4+3));return{kind:'source',host:host[i],paper:Math.min(...p)>=190&&Math.max(...p)-Math.min(...p)<=40,ink:Math.max(...p)<110};};
 const exits=Array.from({length:N},(_,k)=>{let inside=null;for(let R=Math.floor(r*.5);R<=Math.hypot(domain[2]-domain[0],domain[3]-domain[1]);R+=.5){const p=sample(k,R);if(p.kind==='unknown')return{};if(p.kind==='domain')return inside===null?{}:{radius:R};if(p.host){inside=R;continue;}if(inside===null)continue;return{radius:R,paper:[1,2,3].every(d=>sample(k,R+d).paper),ink:[0,1,2].some(d=>sample(k,inside-d).ink)};}return{};});
 const gaps=intervals(q.witnesses.map(p=>!p.length));return gaps.map(g=>{const L=wrap(g.first-1,N),R=wrap(g.last+1,N),left=q.thicknessRows[L],right=q.thicknessRows[R],leftDelta=left&&exits[L].radius!==undefined?Math.abs(left.boundary-exits[L].radius):null,rightDelta=right&&exits[R].radius!==undefined?Math.abs(right.boundary-exits[R].radius):null;return{first:wrap(g.first,N),last:wrap(g.last,N),leftDelta,rightDelta,endpointContact:leftDelta!==null&&rightDelta!==null&&leftDelta<=tolerance&&rightDelta<=tolerance,indices:Array.from({length:g.last-g.first+3},(_,i)=>wrap(g.first-1+i,N))};});
}
function refineTrace(base,a,w,h,host,{sourceSize=[w,h],canonicalSize=[w,h],origin=[0,0]}={}){
 if(a.length!==w*h*4||host.length!==w*h||base.mask.length!==host.length)return null;
 if(!(base.support>.3&&base.contentContrast>.3))return{eligible:false,reason:'insufficient-independent-rim-and-content-source-evidence'};
 const q=Arc.refine(base,a,w,h,host),N=q.radii.length,[cx,cy,r]=q.circle,band=Math.ceil(r*.16),r0=Math.floor(r-band),r1=Math.ceil(r+band),domain=[-origin[0],-origin[1],sourceSize[0]-origin[0],sourceSize[1]-origin[1]],tolerance=Math.hypot(sourceSize[0]/canonicalSize[0],sourceSize[1]/canonicalSize[1])+(q.boundaryResolution||0),allArcs=exteriorArcs(q,a,w,h,host,domain,tolerance),arcs=allArcs.filter(p=>p.endpointContact),scope=Scope.make(w,h,q.circle,N,arcs),correction=Correct.correct(a,w,h,host,scope,tolerance,{imageDomain:domain}),outer=correction.mask;
 let mask=Uint8Array.from(q.mask);for(let i=0;i<mask.length;i++)if(outer[i]&&!host[i])mask[i]=1;
 const exteriorProfiles=sourceProfiles(a,w,h,q.circle,{count:N,values:arcs.flatMap(p=>p.indices)},r0,r1,domain,outer).map(p=>({k:p.k,profile:p.samples})),closure=Closure.inspect(exteriorProfiles);
 if(arcs.length&&!closure.allSupported)return{eligible:false,reason:'source-exterior-closure-deferred',closure,arcs};
 for(let i=0;i<mask.length;i++)if(scope[i]&&outer[i])mask[i]=1;
 // Both ends of every observed exterior arc use the same source search.
 // An orientation reversal cannot change which endpoint is inspected.
 const margin=Math.ceil(N*.03),around=new Set(),anchors=arcs.flatMap(p=>[wrap(p.first-1,N),wrap(p.last+1,N)]);for(const anchor of anchors)for(let d=-margin;d<=margin;d++)around.add(wrap(anchor+d,N));
 const paperRecords=sourceProfiles(a,w,h,q.circle,{count:N,values:[...around].sort((x,y)=>x-y)},r0,r1,domain,outer).map(p=>({k:p.k,...Paper.inspect({...p,inner:q.innerR[p.k],currentBoundary:q.radii[p.k]},r0)})),extension=Extend.apply(mask,outer,a,w,h,q.circle,N,paperRecords,anchors);mask=extension.mask;
 const suspect=q.witnesses.map(p=>p.some(v=>v.offset>2)),layerMargin=Math.ceil(N*.015),near=new Uint8Array(N);for(let k=0;k<N;k++)if(suspect[k])for(let d=-layerMargin;d<=layerMargin;d++)near[wrap(k+d,N)]=1;const opaque=[];
 for(const range of intervals(near)){const ids=Array.from({length:range.last-range.first+1},(_,i)=>range.first+i),profiles=sourceProfiles(a,w,h,q.circle,{count:N,values:ids},r0,r1,domain,outer).map(p=>({...p,inner:q.innerR[p.k]})),model=Opaque.analyze(profiles,r0);if(model.records.length!==profiles.length||model.records.some(p=>!p.eligible))return{eligible:false,reason:'opaque-source-edge-chain-deferred',range,model};const observations=model.records.map(p=>({...p,k:profiles[p.index].k})),updated=Local.refine(mask,outer,w,h,q.circle,N,observations,{radiusBand:[r0,r1]});const outerObservations=profiles.flatMap(p=>q.witnesses[p.k].filter(v=>v.offset>2).map(v=>({...v,k:p.k}))),hostColor=HostColor.inspect(a,w,h,outer,updated.mask,q.circle,N,outerObservations,r1);if(!hostColor.eligible)return{eligible:false,reason:'outer-color-ownership-unresolved',range,hostColor};mask=updated.mask;opaque.push({range,hostColor,profiles:profiles.map(p=>({k:p.k,inner:p.inner})),model,changed:updated.changed});}
 const median=a=>a.slice().sort((x,y)=>x-y)[a.length>>1],widths=opaque.flatMap(o=>o.model.records.filter(p=>p.directAnchor).map(p=>p.blackWidth));if(widths.length<8)return{eligible:false,reason:'insufficient-measured-opaque-widths'};const widthMedian=median(widths),widthMad=median(widths.map(v=>Math.abs(v-widthMedian))),widthBound=widthMedian+3*widthMad+tolerance,paperProfiles=sourceProfiles(a,w,h,q.circle,{count:N,values:Array.from({length:N},(_,i)=>i)},Math.floor(r*.84),Math.ceil(r*1.16),domain,outer).map(p=>({k:p.k,samples:p.rgb.map((rgb,i)=>({rgb,known:p.known[i],R:Math.floor(r*.84)+i}))})),closedPaperRecords=paperProfiles.map(p=>({k:p.k,...Closed.paperTail(p.samples)})),paperScope=new Uint8Array(w*h);
 for(let i=0;i<paperScope.length;i++){const x=i%w+.5-cx,y=(i/w|0)+.5-cy,k=Math.floor(((Math.atan2(y,x)+2*Math.PI)%(2*Math.PI))*N/(2*Math.PI));paperScope[i]=+(closedPaperRecords[k].supported&&closedPaperRecords[(k+1)%N].supported);}
 const closedRim=Closed.complete(a,w,h,mask,paperScope,widthBound,{imageDomain:domain});mask=closedRim.mask;const mixedFringe=Fringe.refine(a,w,h,mask);mask=mixedFringe.mask;let closedHostAdded=0;for(const i of [...closedRim.changed,...mixedFringe.records.map(p=>p.index)])if(!outer[i]){outer[i]=1;closedHostAdded++;}
 const independentInk=opaque.flatMap(o=>o.model.records.filter(p=>p.directAnchor).map(p=>p.ink)),inkPalette=[0,1,2].map(k=>median(independentInk.map(p=>p[k]))),hostSurfaceRecords=paperProfiles.map(p=>({k:p.k,...Surface.inspect(p.samples.map(s=>{const t=p.k*2*Math.PI/N,x=Math.floor(cx+s.R*Math.cos(t)),y=Math.floor(cy+s.R*Math.sin(t));return{...s,owned:s.known?mask[y*w+x]:0};}),q.innerR[p.k],inkPalette,{protectedRadius:Math.max(q.innerR[p.k],...q.witnesses[p.k].map(p=>p.R))})})),hostSurface=Surface.transfer(a,w,h,mask,q.circle,N,hostSurfaceRecords);mask=hostSurface.mask;
 const coverage=new Uint8Array(N);for(let k=0;k<N;k++)coverage[k]=+!!q.witnesses[k].length;for(const arc of q.localArcRefinements)if(arc.eligible)for(let k=arc.leftEndpoint;;k=(k+1)%N){coverage[k]=1;if(k===arc.rightEndpoint)break;}for(const p of closure.records)if(p.supported)coverage[p.k]=1;for(const k of extension.selectedAngles)coverage[k]=1;for(const q of opaque)for(const p of q.model.records)if(p.eligible)coverage[q.profiles[p.index].k]=1;
 const paperCoverage=[];for(const p of paperProfiles){const record=closedPaperRecords[p.k];if(!record.supported)continue;const t=p.k*2*Math.PI/N;let last=-1;for(let j=0;j<record.knownEnd;j++){const R=p.samples[j].R,x=Math.floor(cx+R*Math.cos(t)),y=Math.floor(cy+R*Math.sin(t));if(mask[y*w+x])last=j;}if(last<0)continue;const unresolved=p.samples.slice(last+1,record.knownEnd).some(p=>Math.min(...p.rgb)<190||Math.max(...p.rgb)-Math.min(...p.rgb)>40);if(!unresolved){coverage[p.k]=1;paperCoverage.push(p.k);}}
 const uncoveredBeforeContinuation=intervals(coverage.map(v=>+!v)),continuedOpaque=Uncovered.refine(a,w,h,mask,outer,q.circle,N,q.innerR,uncoveredBeforeContinuation);mask=continuedOpaque.mask;for(const entry of continuedOpaque.results)if(entry.supported)for(let k=entry.arc.first;;k=(k+1)%N){coverage[k]=1;if(k===entry.arc.last)break;}
 return{eligible:false,reason:'native-art-proposal-needs-caption-and-complete-source-admission',mask,host:outer,circle:q.circle,radii:q.radii,innerR:q.innerR,continuedOpaque:{changed:continuedOpaque.changed,results:continuedOpaque.results},coverage,baseSupport:base.support,contentContrast:base.contentContrast,localArcs:q.localArcRefinements,sourceExterior:{arcs,restored:correction.restored,allSupported:closure.allSupported,records:closure.records},paperExtension:{selectedAngles:extension.selectedAngles,changed:extension.changed,unexplained:extension.unexplained},opaque,hostSurface:{changed:hostSurface.changed,records:hostSurfaceRecords,inkPalette,maximumSourceSamplingDistance:hostSurface.maximumSourceSamplingDistance},paperClosed:{widthMedian,widthMad,widthBound,changed:closedRim.changed,hostAdded:closedHostAdded,components:closedRim.components,coverage:paperCoverage,mixedFringe:mixedFringe.records},uncoveredArcs:intervals(coverage.map(v=>+!v)),sourceViolationsBeforeSemanticCorrection:base.sourceViolations};
}
function trace(a,w,h,circle,host,options){if(!Array.isArray(circle)||circle.length!==3||!circle.every(Number.isFinite)||circle[2]<=0||a.length!==w*h*4||host.length!==w*h)return null;return refineTrace(Base.trace(a,w,h,circle,host),a,w,h,host,options);}
module.exports={trace,refineTrace,intervals,sourceProfiles,exteriorArcs};

},
"native-ink-rim.js":function(module,exports,require){
'use strict';const Math=globalThis.Math;
/* Research only. A periodic contour energy; caption ownership is external. */
'use strict';
function periodicPath(energy, N, M, step=2, smooth=.85, guidance=null) {
  const BAD=-1e12, back=new Int16Array(N*M);let best=-Infinity,bestStart=-1;
  function run(start, record) {
    let prev=new Float64Array(M);prev.fill(BAD);prev[start]=energy[start];
    for(let n=1;n<N;n++) {const next=new Float64Array(M);next.fill(BAD);for(let j=0;j<M;j++) {let v=BAD,pick=0;for(let d=-step;d<=step;d++) {const p=j-(guidance?guidance[n]:0)+d;if(p<0||p>=M)continue;const s=prev[p]-smooth*Math.abs(d);if(s>v){v=s;pick=p;}}next[j]=v+energy[n*M+j];if(record)back[n*M+j]=pick;}prev=next;}
    let score=BAD,end=0;const closure=guidance?guidance[0]:0;for(let j=Math.max(0,start-closure-step);j<=Math.min(M-1,start-closure+step);j++){const s=prev[j]-smooth*Math.abs(start-j-closure);if(s>score){score=s;end=j;}}return {score,end};
  }
  for(let start=0;start<M;start++){const q=run(start,false);if(q.score>best){best=q.score;bestStart=start;}}
  const q=run(bestStart,true),path=new Int16Array(N);let j=q.end;for(let n=N-1;n>=0;n--){path[n]=j;j=back[n*M+j];}return {path,score:q.score,seamDelta:Math.abs(path[0]-path[N-1])};
}
function trace(a,w,h,circle,host) {
 const [cx,cy,r]=circle,N=Math.max(360,4*Math.ceil(2*Math.PI*r/4)),band=Math.ceil(r*.16),low=Math.floor(r-band),M=band*2+1;
 const max=new Float32Array(w*h),min=new Float32Array(w*h);for(let i=0;i<max.length;i++){max[i]=Math.max(a[i*4],a[i*4+1],a[i*4+2]);min[i]=Math.min(a[i*4],a[i*4+1],a[i*4+2]);}
 function at(field,x,y,fallback=255){x-=.5;y-=.5;const X=Math.floor(x),Y=Math.floor(y),fx=x-X,fy=y-Y;let v=0;for(let dy=0;dy<2;dy++)for(let dx=0;dx<2;dx++){const xx=X+dx,yy=Y+dy,value=xx>=0&&xx<w&&yy>=0&&yy<h?field[yy*w+xx]:fallback;v+=value*(dx?fx:1-fx)*(dy?fy:1-fy);}return v;}
 const sample=(field,R,t,fallback=255)=>at(field,cx+R*Math.cos(t),cy+R*Math.sin(t),fallback);
 const planes=[0,1,2].map(c=>Float32Array.from({length:w*h},(_,i)=>a[4*i+c]));
 const rgb=(R,t)=>planes.map(p=>sample(p,R,t));
 function similar(u,v) {const U=Math.max(...u),V=Math.max(...v),lo=Math.min(...u),lv=Math.min(...v);if(U<110||V<110||(U-lo)/U<.45||(V-lv)/V<.45)return false;let dot=0,uu=0,vv=0;for(let c=0;c<3;c++){const x=u[c]-lo,y=v[c]-lv;dot+=x*y;uu+=x*x;vv+=y*y;}return dot/Math.sqrt(uu*vv)>.94&&Math.min(U,V)/Math.max(U,V)>.55;}
 const collar=Math.max(3,Math.ceil(r*.035)),witnesses=new Array(N),exits=new Float32Array(N);exits.fill(NaN);
 const thin=new Array(N);for(let k=0;k<N;k++){const t=k*2*Math.PI/N,candidates=[];for(let j=0;j<M;j++){const R=low+j,V=sample(max,R,t),C=V-sample(min,R,t);if(V<110||C/V<.5)continue;let inner=false,outer=false;for(let d=1;d<=collar;d++){inner||=sample(max,R-d,t)<75;outer||=sample(max,R+d,t)<75;}if(inner&&outer)candidates.push({R,color:rgb(R,t)});}thin[k]=candidates;}

 // First track the bright inner separator as a closed source path. Layer
 // evidence follows that observed tangent, not a fixed circular radius.
 const innerEnergy=new Float32Array(N*M);for(let k=0;k<N;k++)for(let j=0;j<M;j++){const R=low+j;let near=0;for(const q of thin[k])if(Math.max(...q.color)>190)near=Math.max(near,Math.max(0,6-3*Math.abs(R-q.R)));innerEnergy[k*M+j]=near-.08*Math.abs(R-r);}
 const innerClosed=periodicPath(innerEnergy,N,M),innerR=Array.from(innerClosed.path,j=>low+j),blackWidths=[];for(let k=0;k<N;k++){const t=k*2*Math.PI/N;let start=null,end=null;for(let d=1;d<=collar*3;d++){if(sample(max,innerR[k]+d,t)<75){if(start===null)start=d;end=d;}else if(start!==null)break;}if(start!==null&&end<collar*3)blackWidths.push(end-start+1);}blackWidths.sort((a,b)=>a-b);const layerReach=Math.min(band,Math.max(collar*2,(blackWidths[blackWidths.length>>1]||collar)*3));
 for(let k=0;k<N;k++){const t=k*2*Math.PI/N,candidates=[];for(const candidate of thin[k]){const offset=candidate.R-innerR[k];if(offset< -2||offset>layerReach)continue;if(offset>2){let separator=0;for(let d=1;d<offset;d++)separator+=sample(max,innerR[k]+d,t)<75;if(separator<2)continue;}let tangent=0;for(const delta of[-.105,-.07,-.035,.035,.07,.105]){const j=(k+Math.round(delta*N/(2*Math.PI))+N)%N;let yes=false;for(const other of thin[j])if(Math.abs(other.R-(innerR[j]+offset))<=2&&similar(candidate.color,other.color))yes=true;tangent+=yes;}candidates.push({R:candidate.R,tangent,color:candidate.color,offset,core:tangent>=5});}witnesses[k]=candidates;
  for(let R=low;R<low+M;R++)if(sample(host,R,t,0)<.5&&sample(host,R+2,t,0)<.5){exits[k]=R;break;}
 }

 // A rim-colored stroke must persist as a curved source component. A short
 // colored wedge between the rim and a crossing hatch cannot create a layer.
 const nodes=[],rows=witnesses.map((row,k)=>row.map(v=>{const id=nodes.length;nodes.push({...v,k,id});return id;})),parent=[];for(let i=0;i<nodes.length;i++)parent[i]=i;const root=i=>{while(parent[i]!==i){parent[i]=parent[parent[i]];i=parent[i];}return i;};const join=(i,j)=>{i=root(i);j=root(j);if(i!==j)parent[j]=i;};
 for(let k=0;k<N;k++)for(const i of rows[k])for(let d=1;d<=2;d++)for(const j of rows[(k+d)%N])if(Math.abs(nodes[i].offset-nodes[j].offset)<=2&&similar(nodes[i].color,nodes[j].color))join(i,j);
 const angles=new Map(),coreAngles=new Map();for(const node of nodes){const key=root(node.id);if(!angles.has(key)){angles.set(key,new Set());coreAngles.set(key,new Set());}angles.get(key).add(node.k);if(node.core)coreAngles.get(key).add(node.k);}const componentEvidence=[...angles].map(([key,v])=>({key,sourceAngles:v.size,coreAngles:coreAngles.get(key).size,certified:v.size>=N*.025&&coreAngles.get(key).size>=N*.008}));for(let k=0;k<N;k++)witnesses[k]=rows[k].filter(i=>angles.get(root(i)).size>=N*.025&&coreAngles.get(root(i)).size>=N*.008).map(i=>nodes[i]);

 // Include at most the nearest distinct adjacent colored layer. Reaching a
 // more distant hatch family would cross an already observed outer layer.
 for(let k=0;k<N;k++){const row=witnesses[k],primary=row.filter(q=>q.offset<=2),outer=row.filter(q=>q.offset>2);if(outer.length){const run=[outer[0]];for(let i=1;i<outer.length;i++){if(outer[i].R-run[run.length-1].R>2)break;run.push(outer[i]);}witnesses[k]=primary.concat(run);}}

 // Bridge a short interruption only between matching observed outer-layer
 // endpoints, and only when a real thin colored source sample lies there.
 // Every bridge uses the same immutable seeds, so traversal order is immaterial.
 const layerSeeds=witnesses.map(row=>row.filter(q=>q.offset>2)),layerBridges=[];for(let k=0;k<N;k++)if(!layerSeeds[k].length){const cap=Math.ceil(N*.035);let L=null,R=null;for(let d=1;d<=cap;d++){const j=(k-d+N)%N;if(layerSeeds[j].length){L=[j,d];break;}}for(let d=1;d<=cap;d++){const j=(k+d)%N;if(layerSeeds[j].length){R=[j,d];break;}}if(!L||!R||L[1]+R[1]>cap)continue;const u=layerSeeds[L[0]][0],v=layerSeeds[R[0]][0];if(!similar(u.color,v.color))continue;const expected=(u.offset*R[1]+v.offset*L[1])/(L[1]+R[1]);let best=null;for(const q of thin[k]){const offset=q.R-innerR[k],error=Math.abs(offset-expected);if(offset<=2||error>2||!similar(u.color,q.color)||!similar(v.color,q.color))continue;if(!best||error<best.error)best={...q,offset,error,tangent:'bounded-source-layer-bridge'};}if(best){witnesses[k].push(best);witnesses[k].sort((a,b)=>a.R-b.R);layerBridges.push({angle:k,...best});}}
 const exposed=[];for(let k=0;k<N;k++)if(Number.isFinite(exits[k])){const t=k*2*Math.PI/N;for(let d=0;d<=collar;d++){const R=exits[k]-d;if(sample(max,R,t)<75){exposed.push(R);break;}}}exposed.sort((a,b)=>a-b);const outerModel=exposed.length>N*.1?exposed[exposed.length>>1]:r;

 // A crossing branch has a different edge normal from the tracked rim.
 // Measure this in source coordinates; no traversal direction or page axis owns it.
 function edgeAlignment(k,R){const t=k*2*Math.PI/N,s=Math.max(2,Math.round(N*.008)),L=innerR[(k-s+N)%N],Q=innerR[(k+s)%N],slope=(Q-L)/(2*s*2*Math.PI/N),nx=Math.cos(t)+slope/innerR[k]*Math.sin(t),ny=Math.sin(t)-slope/innerR[k]*Math.cos(t),x=cx+R*Math.cos(t),y=cy+R*Math.sin(t),gx=at(max,x+1,y)-at(max,x-1,y),gy=at(max,x,y+1)-at(max,x,y-1);return (gx*nx+gy*ny)/(Math.hypot(gx,gy)*Math.hypot(nx,ny)||1);}
 // Learn the outside stroke thickness from unoccluded source runs in the
 // same layer class. A decorated double rim and a single rim need not share
 // one fixed width, and the outside silhouette must not flatten a wavy rim.
 const thicknessRows=new Array(N),thicknessGroups=[[],[]];for(let k=0;k<N;k++){const row=witnesses[k],last=row.length?row[row.length-1]:null;if(!last)continue;const t=k*2*Math.PI/N;let first=null,end=null;for(let d=1;d<=band;d++){const R=last.R+d;if(sample(max,R,t)<75){if(first===null)first=R;end=R;}else if(first!==null)break;else if(d>collar)break;}if(first!==null&&end<last.R+band){const group=+(last.offset>2);let dark=255,light=0;for(let R=Math.max(first,end-2);R<=end;R+=.25)dark=Math.min(dark,sample(max,R,t));{const xx=cx+(end+1)*Math.cos(t),yy=cy+(end+1)*Math.sin(t),X=Math.floor(xx-.5),Y=Math.floor(yy-.5);let nearest=Infinity;for(let dy=-1;dy<=2;dy++)for(let dx=-1;dx<=2;dx++){const x=X+dx,y=Y+dy;if(x<0||x>=w||y<0||y>=h)continue;const v=max[y*w+x],distance=(x+.5-xx)**2+(y+.5-yy)**2;if(v>75&&(distance<nearest-1e-9||Math.abs(distance-nearest)<1e-9&&v<light)){nearest=distance;light=v;}}}const halfway=(dark+light)/2;let boundary=null;for(let R=end-1;R<=end+3;R+=.0625)if(sample(max,R,t)>=halfway){boundary=R;break;}if(boundary!==null&&light-dark>35&&edgeAlignment(k,boundary)>.8){const offset=boundary-innerR[k];thicknessRows[k]={group,offset,dark,light,boundary};thicknessGroups[group].push(offset);}}}
 for(const row of thicknessGroups)row.sort((a,b)=>a-b);const thicknessMedians=thicknessGroups.map(row=>row.length?row[row.length>>1]:collar),thicknessUncertainty=thicknessGroups.map((row,g)=>{const d=row.map(v=>Math.abs(v-thicknessMedians[g])).sort((a,b)=>a-b);return d.length?d[d.length>>1]:collar;});
 // Angular evidence is measured before optimizing; the contour cannot make
 // a field of diagonal hatching into a certified rim by choosing its path.
 const support=witnesses.filter(v=>v.length).length/N,energy=new Float32Array(N*M),bounds=[];
 for(let k=0;k<N;k++){const t=k*2*Math.PI/N,ws=witnesses[k],last=ws.length?ws[ws.length-1].R:null;let inkStart=null,inkEnd=null;if(last!==null)for(let d=1;d<=band;d++){const R=last+d;if(sample(max,R,t)<75){if(inkStart===null)inkStart=R;inkEnd=R;}else if(inkStart!==null)break;else if(d>collar)break;}bounds.push({last,inkStart,inkEnd});
 }
function sourceExitInk(k){const e=exits[k],t=k*2*Math.PI/N,b=bounds[k];return Number.isFinite(e)&&sample(max,e-1,t)<75&&sample(max,e-2,t)<75&&(!b||b.inkEnd===null||e<=b.inkEnd+2);}
function boundaryScore(k,R){const t=k*2*Math.PI/N,ws=witnesses[k],{last,inkStart,inkEnd}=bounds[k],V=sample(max,R-1,t),gradient=Math.max(0,sample(max,R+1,t)-sample(max,R-1,t)),outside=sample(host,R+2,t,0)<.5;
   const group=+(ws.length&&ws[ws.length-1].offset>2),measuredWidth=thicknessMedians[group],shared=!sourceExitInk(k);const localModel=gapModel[k]??thicknessRows[k]?.boundary??(last!==null?innerR[k]+measuredWidth:shared?innerR[k]+thicknessMedians[0]:outerModel+1);const widthWeight=last!==null?Math.max(.3,Math.min(1.5,1.8/(1+thicknessUncertainty[group]))):.35;let score=Math.min(4,gradient/40)*Math.max(0,edgeAlignment(k,R))-widthWeight*Math.abs(R-localModel);if(V>75)score-=8;if(last!==null&&R<last+1)score-=30+3*(last+1-R);if(inkStart!==null&&R<inkStart)score-=8;
   if(shared){let colored=0;const step=Math.max(1,Math.round(N*.004));for(const d of[-2*step,-step,step,2*step]){const kk=(k+d+N)%N,RR=innerR[kk]+R-innerR[k]-1;colored+=sample(max,RR,kk*2*Math.PI/N)>75?1:0;}score-=Math.max(0,colored-1)*2.5;}
   const observedBoundary=thicknessRows[k]?.boundary;if(observedBoundary!==undefined&&R>observedBoundary+.5)score-=32*(R-observedBoundary-.5);
   if(sourceExitInk(k))score+=Math.max(0,5-Math.abs(R-exits[k]));if(outside&&V<75&&sourceExitInk(k))score+=2;
 return score;
 }
 // Unsupported arcs inherit a bounded continuation between observed source
 // outer edges. The circle proposal limits the search band, but cannot pull
 // a missing-witness segment outward into a neighboring piece of artwork.
 const boundaryAnchors=Array.from({length:N},(_,k)=>thicknessRows[k]?.boundary??(sourceExitInk(k)?exits[k]:null)),gapModel=new Array(N).fill(null),gapEvidence=[];
 const cap=Math.max(2,Math.floor(N/(2*Math.PI)*Math.min(Math.PI/3,8*Math.max(...thicknessMedians)/r)));
 for(let k=0;k<N;k++)if(boundaryAnchors[k]===null&&!witnesses[k].length){let L=null,R=null;for(let d=1;d<=cap;d++){const j=(k-d+N)%N;if(boundaryAnchors[j]!==null){L=[j,d];break;}}for(let d=1;d<=cap;d++){const j=(k+d)%N;if(boundaryAnchors[j]!==null){R=[j,d];break;}}if(L&&R&&L[1]+R[1]<=cap){gapModel[k]=(boundaryAnchors[L[0]]*R[1]+boundaryAnchors[R[0]]*L[1])/(L[1]+R[1]);gapEvidence.push({angle:k,left:L,right:R,radius:gapModel[k]});}}
 for(let k=0;k<N;k++)for(let j=0;j<M;j++)energy[k*M+j]=boundaryScore(k,low+j);
 const insideHistogram=new Float64Array(512),outsideHistogram=new Float64Array(512);let paired=0;for(let k=0;k<N;k++){const t=k*2*Math.PI/N;if(sample(host,r*1.12,t,0)<.5)continue;const u=rgb(r*.76,t),v=rgb(r*1.12,t),bin=c=>(Math.min(7,c[0]>>5)*64+Math.min(7,c[1]>>5)*8+Math.min(7,c[2]>>5));insideHistogram[bin(u)]++;outsideHistogram[bin(v)]++;paired++;}let contentContrast=0;if(paired)for(let i=0;i<512;i++)contentContrast+=Math.abs(insideHistogram[i]-outsideHistogram[i])/(2*paired);
 const sharedAngles=Array.from(exits,(_,k)=>!sourceExitInk(k)),guidance=Int16Array.from(innerR,(v,k)=>sharedAngles[k]&&sharedAngles[(k-1+N)%N]?v-innerR[(k-1+N)%N]:0);const firstClosed=periodicPath(energy,N,M,2,.85,guidance),regularized=energy.slice(),localHalf=Math.max(2,Math.ceil(N*.008));for(let k=0;k<N;k++){const neighbors=[];for(let d=-localHalf;d<=localHalf;d++) {const kk=(k+d+N)%N;neighbors.push(firstClosed.path[kk]+(sharedAngles[k]&&sharedAngles[kk]?innerR[k]-innerR[kk]:0));}neighbors.sort((a,b)=>a-b);const expected=neighbors[neighbors.length>>1];for(let j=0;j<M;j++)regularized[k*M+j]-=.8*Math.abs(j-expected);}const closed=periodicPath(regularized,N,M,2,.85,guidance),coarseR=Array.from(closed.path,j=>low+j),fineM=33,fineStep=.0625,fineE=new Float32Array(N*fineM),fineGuide=Int16Array.from(coarseR,(v,k)=>(guidance[k]-(v-coarseR[(k-1+N)%N]))/fineStep);for(let k=0;k<N;k++)for(let j=0;j<fineM;j++){const R=coarseR[k]+(j-16)*fineStep;fineE[k*fineM+j]=boundaryScore(k,R)-.4*Math.abs(R-coarseR[k]);}const fine=periodicPath(fineE,N,fineM,32,.85*fineStep,fineGuide),radii=Array.from(fine.path,(j,k)=>coarseR[k]+(j-16)*fineStep),mask=new Uint8Array(w*h);let sourceViolations=0,quantizedInkPixels=0,sourceExteriorInkPixels=0;
 for(let k=0;k<N;k++){const b=bounds[k],R=radii[k];if(b.last!==null&&R<b.last+1)sourceViolations++;}
 for(let i=0;i<mask.length;i++)if(host[i]){const x=i%w+.5-cx,y=(i/w|0)+.5-cy,t=(Math.atan2(y,x)+2*Math.PI)%(2*Math.PI),q=t*N/(2*Math.PI),k=Math.floor(q),f=q-k;const distance=Math.hypot(x,y),boundary=radii[k]*(1-f)+radii[(k+1)%N]*f,inside=distance<=boundary,inkInterval=!inside&&distance-boundary<=fineStep/2&&max[i]<75,sourceExteriorInk=!inside&&max[i]<75&&sourceExitInk(k)&&sourceExitInk((k+1)%N)&&exits[k]<=outerModel+collar&&exits[(k+1)%N]<=outerModel+collar&&distance<=Math.max(exits[k],exits[(k+1)%N])+1;mask[i]=+(inside||inkInterval||sourceExteriorInk);quantizedInkPixels+=inkInterval?1:0;sourceExteriorInkPixels+=sourceExteriorInk?1:0;}
 return {mask,circle,path:Array.from(closed.path),radii,support,sharedArc:support>.3&&contentContrast>.3?{evidence:'periodic-source-rim',angles:N}:null,ambiguities:Array.from({length:sourceViolations},()=>({reason:'closed-path-crosses-colored-rim'})),sourceViolations,quantizedInkPixels,sourceExteriorInkPixels,boundaryResolution:fineStep,gapModel,gapEvidence,thicknessRows,thicknessMedians,thicknessUncertainty,componentEvidence,layerBridges,contentContrast,pairedContentSamples:paired,outerModel,layerReach,innerR,seamDelta:closed.seamDelta,energyScore:closed.score,bounds,witnesses};
}
module.exports={trace,periodicPath};

},
"native-source-arc-refinement.js":function(module,exports,require){
'use strict';const Math=globalThis.Math;
/* Research-only refinement of an existing source trace. A missing colored
 * witness arc may be replaced only by an exterior separator observed in the
 * native source between two certified outer-rim endpoints. Caption ownership
 * stays with the caller. No host boundary is accepted as a rim endpoint. */
'use strict';
const separator=require('./source-supported-arc.js');
function refine(q,a,w,h,host){
 const N=q.radii.length,[cx,cy,r]=q.circle,wrap=k=>(k%N+N)%N,radii=q.radii.slice(),changed=new Uint8Array(N),arcs=[],seed=q.witnesses.findIndex(row=>row.length);
 if(seed<0)return{...q,localArcRefinements:[],localArcStatus:'missing-colored-source-witness'};
 const gaps=[];let active=null;for(let d=1;d<=N;d++){const k=seed+d;if(!q.witnesses[wrap(k)].length){if(!active)active={first:k,last:k};active.last=k;}else if(active){gaps.push(active);active=null;}}
 for(const gap of gaps){
  const left=gap.first-1,right=gap.last+1,L=q.thicknessRows[wrap(left)],R=q.thicknessRows[wrap(right)],entry={first:wrap(gap.first),last:wrap(gap.last),angularCount:gap.last-gap.first+1,leftEndpoint:wrap(left),rightEndpoint:wrap(right)};
  if(!L||!R){arcs.push({...entry,eligible:false,reason:'missing-certified-outer-profile-endpoint'});continue;}
  // Use the same source search band that produced the colored rim proposal.
  // It is a resource/search bound; every accepted separator still needs pixels.
  const band=Math.ceil(r*.16),r0=Math.floor(r-band),r1=Math.ceil(r+band),margin=8,profiles=[];
  for(let k=left-margin;k<=right+margin;k++){
   const t=2*Math.PI*k/N,rgb=[],known=[];for(let radius=r0;radius<=r1;radius++){const x=Math.floor(cx+radius*Math.cos(t)),y=Math.floor(cy+radius*Math.sin(t));known.push(x>=0&&y>=0&&x<w&&y<h);rgb.push(known[known.length-1]?Array.from(a.subarray((y*w+x)*4,(y*w+x)*4+3)):[255,255,255]);}
   profiles.push({rgb,known,edgeProfile:q.thicknessRows[wrap(k)]});
  }
  // Unknown exterior pixels cannot masquerade as source paper. Conservatively
  // defer this arc; a larger source crop could resolve it in a later stage.
  const endpoints={leftIndex:margin,rightIndex:margin+right-left,leftRadius:L.boundary,rightRadius:R.boundary},result=separator.traceSeparator(profiles,r0,endpoints);
  if(result.radiusBand&&profiles.some(p=>p.known.slice(result.radiusBand[0]-r0,result.radiusBand[1]-r0+1).some(v=>!v))){arcs.push({...entry,eligible:false,reason:'source-profile-leaves-saved-crop'});continue;}
  arcs.push({...entry,...result,chosen:result.chosen,radii:result.radii});
  if(result.eligible)for(let i=0;i<result.radii.length;i++){const k=wrap(left+i);radii[k]=result.radii[i];changed[k]=1;}
 }
 const mask=q.mask.slice();let changedPixels=0;
 for(let i=0;i<mask.length;i++)if(host[i]){const dx=i%w+.5-cx,dy=(i/w|0)+.5-cy,angle=(Math.atan2(dy,dx)+2*Math.PI)%(2*Math.PI),p=angle*N/(2*Math.PI),k=Math.floor(p),f=p-k,j=(k+1)%N;if(!changed[k]||!changed[j])continue;const boundary=radii[k]*(1-f)+radii[j]*f,v=+(Math.hypot(dx,dy)<=boundary);if(mask[i]!==v)changedPixels++;mask[i]=v;}
 let sourceViolations=0;for(let k=0;k<N;k++)if(q.bounds[k].last!==null&&radii[k]<q.bounds[k].last+1)sourceViolations++;
 return{...q,mask,radii,sourceViolations,ambiguities:Array.from({length:sourceViolations},()=>({reason:'closed-path-crosses-colored-rim'})),localArcRefinements:arcs,localArcChangedPixels:changedPixels,localArcStatus:'partial source-backed research refinement; unresolved arcs and inherited geometry prevent admission'};
}
module.exports={refine};

},
"source-supported-arc.js":function(module,exports,require){
'use strict';const Math=globalThis.Math;
/* Research-only local continuation. The caller supplies two observed outer
 * rim endpoints and native radial source profiles. Every path state needs a
 * local ink-to-exterior transition; a host edge or interpolated shape alone
 * cannot fill a missing source witness. Caption assignment is external. */
'use strict';
const median = values => { const a=values.slice().sort((x,y)=>x-y); return a[a.length>>1]; };
const maximum = rgb => Math.max(...rgb);
function interpolate(profile, row) {
  const i=Math.floor(row), f=row-i;
  if(i<0||i+1>=profile.length)return null;
  return profile[i].map((v,c)=>v*(1-f)+profile[i+1][c]*f);
}
function inkRun(profile, radius, firstRadius) {
  let row=Math.floor(radius-firstRadius), end=null, count=0;
  for(let d=0;d<4&&row-d>=0;d++)if(maximum(profile[row-d])<75){end=row-d;break;}
  if(end===null)return null;
  for(let y=end;y>=0&&maximum(profile[y])<75;y--)count++;
  return count>0?count:null;
}
function trace(profiles, firstRadius, endpoints) {
  const {leftIndex,rightIndex,leftRadius,rightRadius}=endpoints;
  if(!(rightIndex>leftIndex)||!profiles[leftIndex]||!profiles[rightIndex])return{eligible:false,reason:'missing-observed-endpoints'};
  const widths=[];
  for(const [index,radius,sign] of [[leftIndex,leftRadius,-1],[rightIndex,rightRadius,1]]){
    for(let d=0;d<=8;d++){
      const p=profiles[index+sign*d];if(!p)continue;
      const edge=p.edgeProfile?.boundary??radius, width=inkRun(p.rgb,edge,firstRadius);
      if(width!==null)widths.push(width);
    }
  }
  if(widths.length<2)return{eligible:false,reason:'missing-outer-ink-width'};
  const width=median(widths), uncertainty=median(widths.map(v=>Math.abs(v-width))),corridor=Math.max(3,2*(width+uncertainty));
  const lo=Math.max(firstRadius+2,Math.floor(Math.min(leftRadius,rightRadius)-corridor)),hi=Math.min(firstRadius+profiles[0].rgb.length-3,Math.ceil(Math.max(leftRadius,rightRadius)+corridor));
  const count=rightIndex-leftIndex+1, states=hi-lo+1, evidence=Array.from({length:count},()=>new Array(states)),energy=Array.from({length:count},()=>new Float64Array(states).fill(-Infinity));
  for(let column=0;column<count;column++){
    const index=leftIndex+column,p=profiles[index].rgb, expected=leftRadius+(rightRadius-leftRadius)*column/(count-1);
    for(let j=0;j<states;j++){
      const radius=lo+j, row=radius-firstRadius, inside=interpolate(p,row-1),outside=interpolate(p,row+1);if(!inside||!outside)continue;
      const contrast=Math.max(...inside.map((v,c)=>Math.abs(v-outside[c]))),radial=maximum(outside)-maximum(inside),before=profiles[Math.max(0,index-1)].rgb,after=profiles[Math.min(profiles.length-1,index+1)].rgb,angular=(maximum(interpolate(after,row)||outside)-maximum(interpolate(before,row)||inside))/2,alignment=radial/(Math.hypot(radial,angular)||1),supported=maximum(inside)<75&&contrast>=18&&radial>0&&alignment>=.65;
      evidence[column][j]={radius,contrast,alignment,insideMaximum:maximum(inside),supported};
      if(!supported)continue;
      if(column===0&&Math.abs(radius-leftRadius)>1)continue;
      if(column===count-1&&Math.abs(radius-rightRadius)>1)continue;
      // Continuity chooses among source-supported edges. It never supplies
      // missing evidence and does not reward a brighter remote background.
      energy[column][j]=-.015*Math.abs(radius-expected);
    }
  }
  const back=Array.from({length:count},()=>new Int16Array(states).fill(-1)),forward=Array.from({length:count},()=>new Float64Array(states).fill(-Infinity));forward[0].set(energy[0]);
  for(let column=1;column<count;column++)for(let j=0;j<states;j++)if(Number.isFinite(energy[column][j])){
    let best=-Infinity,pick=-1;for(let prev=Math.max(0,j-2);prev<=Math.min(states-1,j+2);prev++){const score=forward[column-1][prev]-.5*Math.abs(j-prev);if(score>best){best=score;pick=prev;}}if(pick>=0){forward[column][j]=best+energy[column][j];back[column][j]=pick;}
  }
  let best=-Infinity,last=-1;for(let j=0;j<states;j++)if(forward[count-1][j]>best){best=forward[count-1][j];last=j;}
  const missingColumns=energy.flatMap((row,i)=>row.some(Number.isFinite)?[]:[i]);
  if(last<0)return{eligible:false,reason:'no-continuous-source-supported-edge',width,uncertainty,corridor,radiusBand:[lo,hi],missingColumns,reachability:forward.map((row,i)=>({column:i,reachable:[...row].flatMap((v,j)=>Number.isFinite(v)?[lo+j]:[]),supported:[...energy[i]].flatMap((v,j)=>Number.isFinite(v)?[lo+j]:[])})),evidence};
  const radii=new Array(count),chosen=new Array(count);let j=last;for(let column=count-1;column>=0;column--){radii[column]=lo+j;chosen[column]=evidence[column][j];j=back[column][j];}
  return{eligible:true,width,uncertainty,corridor,radiusBand:[lo,hi],radii,chosen,missingColumns,score:best,scope:'locally source-supported edge proposal; does not establish complete owner or Reader admission'};
}
module.exports={trace,inkRun};

// A source ink separator can turn through a raster corner. Follow the
// observed exterior color component to that turn, instead of allowing a
// larger unsupported radial jump. Both seeds come from certified endpoints.
function traceSeparator(profiles, firstRadius, endpoints) {
  const {leftIndex,rightIndex,leftRadius,rightRadius}=endpoints;
  const widths=[];
  for(const [index,radius,sign] of [[leftIndex,leftRadius,-1],[rightIndex,rightRadius,1]]){
    for(let d=0;d<=8;d++){
      const p=profiles[index+sign*d];if(!p)continue;
      const width=inkRun(p.rgb,p.edgeProfile?.boundary??radius,firstRadius);
      if(width!==null)widths.push(width);
    }
  }
  if(widths.length<2)return{eligible:false,reason:'missing-outer-ink-width'};
  const width=median(widths),uncertainty=median(widths.map(v=>Math.abs(v-width))),corridor=Math.max(3,2*(width+uncertainty)),lo=Math.max(firstRadius+1,Math.floor(Math.min(leftRadius,rightRadius)-corridor)),hi=Math.min(firstRadius+profiles[0].rgb.length-2,Math.ceil(Math.max(leftRadius,rightRadius)+corridor)),w=rightIndex-leftIndex+1,h=hi-lo+1;
  const ink=new Uint8Array(w*h),outside=new Uint8Array(w*h),queue=new Int32Array(w*h),parents=new Int32Array(w*h).fill(-1);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)ink[y*w+x]=+(maximum(profiles[leftIndex+x].rgb[lo+y-firstRadius])<75);
  const seeds=[];
  for(const [x,radius]of[[0,leftRadius],[w-1,rightRadius]]){
    let seed=-1;for(let y=Math.max(0,Math.ceil(radius-lo));y<Math.min(h,Math.ceil(radius-lo+width+uncertainty));y++)if(!ink[y*w+x]){seed=y*w+x;break;}
    if(seed<0)return{eligible:false,reason:'endpoint-exterior-color-not-observed',width,uncertainty,corridor};seeds.push(seed);
  }
  const palettes=seeds.map(seed=>{const x=seed%w,y=seed/w|0,colors=[];for(let d=0;d<Math.max(2,Math.ceil(width/2));d++)if(y+d<h&&!ink[(y+d)*w+x])colors.push(profiles[leftIndex+x].rgb[lo+y+d-firstRadius]);const center=[0,1,2].map(c=>median(colors.map(v=>v[c]))),tolerance=[0,1,2].map(c=>Math.max(18,3*median(colors.map(v=>Math.abs(v[c]-center[c])))));return{center,tolerance};});
  // Fixed observed exterior palettes prevent a color flood from walking
  // through a small ink interruption into differently colored inset art.
  const inkColor=[0,1,2].map(c=>median([[leftIndex,leftRadius],[rightIndex,rightRadius]].map(([i,r])=>profiles[i].rgb[Math.floor(r-firstRadius)-2][c]))),distance=(a,b)=>Math.hypot(...a.map((v,c)=>v-b[c]));
  function segmentDistance(rgb,a,b){const v=b.map((x,c)=>x-a[c]),d=rgb.map((x,c)=>x-a[c]),den=v.reduce((s,x)=>s+x*x,0),t=Math.max(0,Math.min(1,d.reduce((s,x,c)=>s+x*v[c],0)/(den||1)));return distance(rgb,a.map((x,c)=>x+t*v[c]));}
  function exteriorColor(rgb){if(maximum(rgb)<75)return false;let nearest=Infinity;const vertices=[inkColor,...palettes.map(p=>p.center)];for(let i=0;i<vertices.length;i++)for(let j=i+1;j<vertices.length;j++)nearest=Math.min(nearest,segmentDistance(rgb,vertices[i],vertices[j]));if(palettes.length===2){const a=inkColor,u=palettes[0].center.map((x,c)=>x-a[c]),v=palettes[1].center.map((x,c)=>x-a[c]),d=rgb.map((x,c)=>x-a[c]),dot=(x,y)=>x.reduce((s,t,c)=>s+t*y[c],0),uu=dot(u,u),vv=dot(v,v),uv=dot(u,v),ud=dot(u,d),vd=dot(v,d),den=uu*vv-uv*uv;if(den>1e-9){const U=(ud*vv-vd*uv)/den,V=(vd*uu-ud*uv)/den;if(U>=0&&V>=0&&U+V<=1)nearest=Math.min(nearest,distance(rgb,a.map((x,c)=>x+U*u[c]+V*v[c])));}}return nearest<=Math.max(...palettes.flatMap(p=>p.tolerance));}

  const exteriorAllowed=new Uint8Array(w*h);for(let y=0;y<h;y++)for(let x=0;x<w;x++)exteriorAllowed[y*w+x]=+exteriorColor(profiles[leftIndex+x].rgb[lo+y-firstRadius]);
  let head=0,tail=0;for(const i of seeds)if(!outside[i]){outside[i]=1;queue[tail++]=i;}
  while(head<tail){const i=queue[head++],x=i%w,y=i/w|0;const add=j=>{if(exteriorAllowed[j]&&!outside[j]){outside[j]=1;parents[j]=i;queue[tail++]=j;}};if(x)add(i-1);if(x+1<w)add(i+1);if(y)add(i-w);if(y+1<h)add(i+w);}
  if(outside.subarray(0,w).some(v=>v)){let i=outside.subarray(0,w).findIndex(v=>v);const leakPath=[];while(i>=0){leakPath.push([leftIndex+i%w,lo+(i/w|0)]);i=parents[i];}return{eligible:false,reason:'exterior-component-enters-interior-band',width,uncertainty,corridor,radiusBand:[lo,hi],leakPath};}
  const radii=[],chosen=[],unsupported=[];
  for(let x=0;x<w;x++){
    let first=-1;for(let y=1;y<h;y++)if(outside[y*w+x]){first=y;break;}
    if(first<0){unsupported.push(x);radii.push(null);continue;}
    const radius=lo+first-.5,inside=profiles[leftIndex+x].rgb[lo+first-1-firstRadius],exterior=profiles[leftIndex+x].rgb[lo+first-firstRadius];radii.push(radius);chosen.push({column:x,radius,inside,exterior,contrast:Math.max(...inside.map((v,c)=>Math.abs(v-exterior[c])))});
  }
  if(unsupported.length)return{eligible:false,reason:'no-exterior-source-boundary-in-column',width,uncertainty,corridor,radiusBand:[lo,hi],unsupported};
  if(chosen.some(q=>q.contrast<18))return{eligible:false,reason:'exterior-label-transition-lacks-visible-source-contrast',width,uncertainty,corridor,radiusBand:[lo,hi],radii,chosen};
  const maximumJump=Math.max(2,Math.ceil((width+uncertainty)/2)),jumps=radii.slice(1).map((r,i)=>Math.abs(r-radii[i]));if(jumps.some(v=>v>maximumJump))return{eligible:false,reason:'outside-component-boundary-exceeds-supported-stroke-continuity',width,uncertainty,corridor,radiusBand:[lo,hi],radii,maximumJump,jumps};
  return{eligible:true,width,uncertainty,corridor,radiusBand:[lo,hi],radii,chosen,seeds,palettes,inkColor,maximumJump,sourceExteriorPixels:tail,scope:'local observed ink separator between certified endpoints; no complete-owner or Reader admission'};
}
module.exports.traceSeparator=traceSeparator;

},
"source-arc-scope.js":function(module,exports,require){
'use strict';const Math=globalThis.Math;
'use strict';
// A pixel is covered only between two adjacent observed source angles. A
// single endpoint sample cannot authorize the extra angular column beyond it.
function make(w,h,circle,count,arcs){
 const edges=new Uint8Array(count),[cx,cy]=circle;
 for(const arc of arcs){const indices=arc.indices;if(!Array.isArray(indices)||indices.length<2)continue;for(let j=0;j<indices.length;j++){const k=indices[j];if(!Number.isInteger(k)||k<0||k>=count||j&&(indices[j-1]+1)%count!==k)throw Error('noncontiguous source arc');if(j)edges[indices[j-1]]=1;}}
 const mask=new Uint8Array(w*h);
 for(let i=0;i<mask.length;i++){const p=((Math.atan2((i/w|0)+.5-cy,i%w+.5-cx)+2*Math.PI)%(2*Math.PI))*count/(2*Math.PI),k=Math.floor(p);mask[i]=edges[k];}
 return mask;
}
module.exports={make};

},
"source-exterior-correction.js":function(module,exports,require){
'use strict';const Math=globalThis.Math;
'use strict';
// Restore a measured source exterior near a coarse rejected host contour.
// Distance bounds the inspection only. Growth requires a visible nonpaper
// component attached to existing source ink, closed by observed paper or the
// original image domain. Components running past the inspection band defer.
// The caller supplies a separately authenticated exterior-arc scope.
function correct(a,w,h,host,scope,maxDistance,{imageDomain=[0,0,w,h]}={}){
 if(a.length!==w*h*4||host.length!==w*h||scope.length!==w*h||!Number.isFinite(maxDistance)||maxDistance<=0)throw Error('invalid source exterior correction input');
 const limit=Math.ceil(maxDistance),distance=new Uint16Array(w*h);distance.fill(65535);const queue=new Int32Array(w*h);let head=0,tail=0;
 const neighbors=i=>{const x=i%w,y=i/w|0,out=[];if(x)out.push(i-1);if(x+1<w)out.push(i+1);if(y)out.push(i-w);if(y+1<h)out.push(i+w);return out;};
 const paper=i=>{const r=a[4*i],g=a[4*i+1],b=a[4*i+2];return Math.min(r,g,b)>=190&&Math.max(r,g,b)-Math.min(r,g,b)<=40;};
 for(let i=0;i<host.length;i++)if(host[i]){distance[i]=0;queue[tail++]=i;}
 while(head<tail){const i=queue[head++];if(distance[i]>=limit+1)continue;for(const j of neighbors(i))if(distance[j]>distance[i]+1){distance[j]=distance[i]+1;queue[tail++]=j;}}
 const seen=new Uint8Array(w*h),result=Uint8Array.from(host),components=[];let restored=0;
 for(let seed=0;seed<host.length;seed++){
  if(seen[seed]||host[seed]||!scope[seed]||distance[seed]>limit||paper(seed))continue;
  const pixels=[seed];seen[seed]=1;let attachedInk=false,observedPaper=false,leavesBand=false,unknownExterior=false;
  for(let n=0;n<pixels.length;n++){
   const i=pixels[n],x=i%w,y=i/w|0;
   if((x===0&&imageDomain[0]!==0)||(x===w-1&&imageDomain[2]!==w)||(y===0&&imageDomain[1]!==0)||(y===h-1&&imageDomain[3]!==h))unknownExterior=true;
   for(const j of neighbors(i)){
    if(host[j]){attachedInk||=!paper(j);continue;}
    if(paper(j)){observedPaper=true;continue;}
    if(!scope[j])continue;
    if(distance[j]>limit){leavesBand=true;continue;}
    if(!seen[j]){seen[j]=1;pixels.push(j);}
   }
  }
  const eligible=attachedInk&&observedPaper&&!leavesBand&&!unknownExterior;
  if(eligible)for(const i of pixels){result[i]=1;restored++;}
  components.push({pixels,eligible,attachedInk,observedPaper,leavesBand,unknownExterior});
 }
 return{eligible:false,scope:'source-supported local host additions only; no complete owner admission',mask:result,restored,components,maxDistance,searchDistance:limit};
}
module.exports={correct};

},
"source-exterior-closure.js":function(module,exports,require){
'use strict';const Math=globalThis.Math;
'use strict';
// Inspect actual source profiles through a previously proposed host exterior.
// Colored art and paper may share the brightest RGB channel, so contrast is
// measured in every channel. Missing source and unowned exterior marks defer.
function inspect(profiles){
 const records=profiles.map(({k,profile})=>{
  const domain=profile.findIndex(p=>p.kind==='original-image-domain-edge'),unknown=profile.findIndex(p=>p.kind==='unknown-crop-exterior'),last=domain>=0?domain-1:profile.length-1;
  let edge=last;while(edge>=0&&profile[edge].kind==='source'&&profile[edge].paper)edge--;
  const inside=profile[edge],outside=profile[edge+1];let supported=false,reason='missing-source-exterior',boundary=null,contrast=null;
  if(unknown>=0&&unknown<=last)reason='unknown-source-crop-edge';
  else if(domain>=0&&edge===last&&inside?.host){supported=true;reason='source-art-reaches-original-image-domain';boundary=inside.radius+.5;}
  else if(edge>=0&&inside?.kind==='source'&&outside?.kind==='source'&&outside.paper&&inside.host){contrast=Math.max(...outside.rgb.map((v,c)=>Math.abs(v-inside.rgb[c])));if(contrast>=18){supported=true;reason='visible-source-color-to-connected-paper-transition';boundary=inside.radius+.5;}else reason='insufficient-visible-source-color-contrast';}
  else if(inside?.kind==='source'&&!inside.host)reason='outer-source-mark-not-owned-by-corrected-host';
  return{k,supported,reason,boundary,contrast,inside,outside};
 });
 return{eligible:false,scope:'local exterior source evidence; caller must authenticate arc endpoints and full ownership',allSupported:records.length>0&&records.every(p=>p.supported),counts:records.reduce((m,p)=>(m[p.reason]=(m[p.reason]||0)+1,m),{}),records};
}
module.exports={inspect};

},
"source-paper-rim-closure.js":function(module,exports,require){
'use strict';const Math=globalThis.Math;
'use strict';
// A paper-facing silhouette can contain a second strip of the same observed
// rim color after an internal ink detail. Certify the entire measured sequence
// from a colored source witness to the connected paper tail. Every sample must
// be explained by the measured rim/ink palette, with a short neutral raster
// transition at the paper edge. Foreign color, unknown pixels and paper gaps
// prevent this local closure. This helper does not admit a complete owner.
const median=a=>{const b=a.slice().sort((x,y)=>x-y);return b[b.length>>1];};
const max=a=>Math.max(...a),min=a=>Math.min(...a),paper=a=>min(a)>=190&&max(a)-min(a)<=40;
function inspect(profile,firstRadius){
 const {rgb,known,inner,currentBoundary}=profile,fail=reason=>({supported:false,reason});
 if(!Number.isFinite(inner)||!Number.isFinite(currentBoundary))return fail('missing-source-rim-witness');
 const row=Math.round(inner-firstRadius);if(row<2||row+2>=rgb.length)return fail('source-witness-outside-profile');
 if(known&&known.some(v=>!v))return fail('unknown-source-profile');
 const colorSamples=rgb.slice(row-2,row+3).filter(c=>max(c)>=90&&(max(c)-min(c))/max(c)>=.35),inkSamples=rgb.slice(row).filter(c=>max(c)<75);
 if(colorSamples.length<3||inkSamples.length<3)return fail('missing-measured-color-or-ink');
 const color=[0,1,2].map(c=>median(colorSamples.map(p=>p[c]))),ink=[0,1,2].map(c=>median(inkSamples.map(p=>p[c]))),tolerance=[0,1,2].map(c=>Math.max(18,3*median(colorSamples.map(p=>Math.abs(p[c]-color[c]))))),axis=color.map((v,c)=>v-ink[c]),energy=axis.reduce((n,v)=>n+v*v,0);
 let end=rgb.length-1;while(end>=row&&paper(rgb[end]))end--;
 const tail=rgb.length-1-end;if(tail<3||end<=row)return fail('missing-connected-source-paper-tail');
 const boundary=firstRadius+end+.5;if(boundary<currentBoundary-1)return fail('paper-edge-precedes-existing-rim');
 const mismatch=[],matched=[];let edgeInk=0;
 for(let j=row;j<=end;j++){
  const c=rgb[j];if(paper(c)){mismatch.push({row:j,reason:'paper-gap-before-silhouette'});continue;}
  if(max(c)<75){matched.push({row:j,kind:'measured-source-ink'});if(j>=end-3)edgeInk++;continue;}
  const fraction=Math.max(0,Math.min(1,c.reduce((n,v,k)=>n+(v-ink[k])*axis[k],0)/energy)),distance=Math.hypot(...c.map((v,k)=>(v-(ink[k]+fraction*axis[k]))/tolerance[k]));
  if((max(c)-min(c))/max(c)>=.35&&distance<=2.5){matched.push({row:j,kind:'measured-rim-color-or-mixture',fraction,distance});continue;}
  const neutral=max(c)-min(c)<=40;if(j>=end-2&&neutral){matched.push({row:j,kind:'neutral-paper-edge-raster-mixture'});continue;}
  mismatch.push({row:j,reason:'foreign-source-color',rgb:c,distance});
 }
 if(!edgeInk)return fail('missing-outer-ink-before-paper');
 return{supported:mismatch.length===0,reason:mismatch.length?'source-sequence-has-unexplained-colors':'observed-rim-color-ink-to-connected-paper',boundary,color,ink,tolerance,tailSamples:tail,matched,mismatch,completeOwnerEligible:false};
}
module.exports={inspect};

},
"source-connected-rim-extension.js":function(module,exports,require){
'use strict';const Math=globalThis.Math;
'use strict';
// Extend only a connected chain of independently source-supported profiles
// attached to a previously witnessed exposed arc. A missing/foreign profile
// breaks the chain, regardless of the geometric shape of the proposed rim.
function select(records,anchors,count){
 const by=new Map(records.map(p=>[p.k,p])),selected=new Set(),wrap=k=>(k%count+count)%count;
 for(const anchor of anchors){const k=wrap(anchor);if(!by.get(k)?.supported)continue;selected.add(k);for(const direction of [-1,1])for(let d=1;d<count;d++){const j=wrap(k+d*direction);if(!by.get(j)?.supported)break;selected.add(j);}}
 return records.filter(p=>selected.has(p.k));
}
function pixelMatches(rgb,model,distanceToPaper){
 const hi=Math.max(...rgb),lo=Math.min(...rgb);if(hi<75)return true;if(lo>=190&&hi-lo<=40)return false;
 const axis=model.color.map((v,c)=>v-model.ink[c]),energy=axis.reduce((n,v)=>n+v*v,0),fraction=Math.max(0,Math.min(1,rgb.reduce((n,v,c)=>n+(v-model.ink[c])*axis[c],0)/energy)),error=Math.hypot(...rgb.map((v,c)=>(v-(model.ink[c]+fraction*axis[c]))/model.tolerance[c]));
 return (hi-lo)/hi>=.35&&error<=2.5||distanceToPaper<=2.5&&hi-lo<=40;
}
function apply(before,host,rgba,w,h,circle,count,records,anchors){
 const selected=select(records,anchors,count),by=new Map(selected.map(p=>[p.k,p])),mask=Uint8Array.from(before),[cx,cy]=circle,changed=[],unexplained=[];
 for(let i=0;i<mask.length;i++)if(host[i]&&!mask[i]){
  const dx=i%w+.5-cx,dy=(i/w|0)+.5-cy,t=((Math.atan2(dy,dx)+2*Math.PI)%(2*Math.PI))*count/(2*Math.PI),k=Math.floor(t),f=t-k,L=by.get(k),R=by.get((k+1)%count);if(!L||!R)continue;
  const boundary=L.boundary*(1-f)+R.boundary*f,radius=Math.hypot(dx,dy);if(radius>boundary)continue;const rgb=Array.from(rgba.subarray(i*4,i*4+3));
  if(!pixelMatches(rgb,L,boundary-radius)||!pixelMatches(rgb,R,boundary-radius)){unexplained.push({i,rgb,radius,boundary});continue;}mask[i]=1;changed.push(i);
 }
 return{mask,selectedAngles:selected.map(p=>p.k),changed,unexplained,completeOwnerEligible:false};
}
module.exports={select,pixelMatches,apply};

},
"source-continuous-opaque-rim.js":function(module,exports,require){
'use strict';const Math=globalThis.Math;
'use strict';
const Base=require('./source-opaque-rim-edge.js'),median=a=>a.slice().sort((x,y)=>x-y)[a.length>>1],max=c=>Math.max(...c),min=c=>Math.min(...c);
// Reliable colored-rim observations anchor one consecutive source edge chain.
// At a decorative-line interruption, select only measured ink-to-surface
// transitions. Interpolation ranks existing candidates; it creates no edge.
function analyze(profiles,firstRadius){
 const base=Base.analyze(profiles,firstRadius),colors=profiles.map(p=>p.rgb[Math.round(p.inner-firstRadius)]).filter(c=>c&&max(c)>=110&&(max(c)-min(c))/max(c)>=.35);if(colors.length<8)return{eligible:false,reason:'insufficient-colored-rim-source-observations',records:[]};
 const center=[0,1,2].map(c=>median(colors.map(p=>p[c]))),tolerance=[0,1,2].map(c=>Math.max(18,3*median(colors.map(p=>Math.abs(p[c]-center[c]))))),matches=c=>c&&Math.hypot(...c.map((v,k)=>(v-center[k])/tolerance[k]))<=2.5,rawAnchors=base.records.filter(p=>p.eligible&&matches(profiles[p.index].rgb[Math.round(profiles[p.index].inner-firstRadius)])),anchorRuns=[];for(const p of rawAnchors){const last=anchorRuns.at(-1);if(last&&last.at(-1).index+1===p.index&&last.at(-1).chain===p.chain)last.push(p);else anchorRuns.push([p]);}const anchors=anchorRuns.filter(p=>p.length>=8).flat();
 // At least eight source observations are still required. No source witness
 // gate is relaxed when a branch or false inner line removes observations.
 if(anchors.length<8)return{eligible:false,reason:'insufficient-palette-consistent-source-anchors',center,tolerance,anchors,records:[]};
 const byAnchor=new Map(anchors.map(p=>[p.index,p])),maxStep=base.maxStep,candidates=profiles.map((p,index)=>{const out=[];for(let j=0;j<p.rgb.length;){if(max(p.rgb[j])>=75){j++;continue;}const start=j;while(j<p.rgb.length&&max(p.rgb[j])<75)j++;if(j-start<3||j===p.rgb.length)continue;const ink=[0,1,2].map(c=>median(p.rgb.slice(start,j).map(v=>v[c]))),contrast=Math.max(...p.rgb[j].map((v,c)=>Math.abs(v-ink[c])));if(contrast<18)continue;const boundary=firstRadius+j-.5;if(byAnchor.has(index)&&byAnchor.get(index).boundary!==boundary)continue;out.push({index,boundary,inkStart:firstRadius+start,inkEnd:firstRadius+j-1,blackWidth:j-start,ink,outside:p.rgb[j],contrast});}return out;});
 if(candidates.some(p=>!p.length))return{eligible:false,reason:'source-edge-chain-has-empty-column',center,tolerance,anchors,candidates,records:[]};
 const expected=i=>{let L=anchors[0],R=anchors.at(-1);for(const p of anchors){if(p.index<=i)L=p;if(p.index>=i){R=p;break;}}if(i<=anchors[0].index)return anchors[0].boundary;if(i>=anchors.at(-1).index)return anchors.at(-1).boundary;return L.boundary+(R.boundary-L.boundary)*(i-L.index)/(R.index-L.index||1);},nodeCost=(p,i)=>Math.abs(p.boundary-expected(i))*.1,forward=[],backward=[];
 for(let i=0;i<candidates.length;i++)forward[i]=candidates[i].map(p=>{const own=nodeCost(p,i);if(!i)return own;let best=Infinity;for(let j=0;j<candidates[i-1].length;j++){const d=Math.abs(p.boundary-candidates[i-1][j].boundary);if(d<=maxStep)best=Math.min(best,forward[i-1][j]+d);}return own+best;});
 const optimum=Math.min(...forward.at(-1));if(!Number.isFinite(optimum))return{eligible:false,reason:'source-edge-chain-interrupted',center,tolerance,anchors,candidates,records:[]};
 for(let i=candidates.length-1;i>=0;i--)backward[i]=candidates[i].map(p=>{const own=nodeCost(p,i);if(i===candidates.length-1)return own;let best=Infinity;for(let j=0;j<candidates[i+1].length;j++){const d=Math.abs(p.boundary-candidates[i+1][j].boundary);if(d<=maxStep)best=Math.min(best,backward[i+1][j]+d);}return own+best;});
 const records=candidates.map((row,i)=>{const optimal=row.filter((p,j)=>Math.abs(forward[i][j]+backward[i][j]-nodeCost(p,i)-optimum)<1e-8),chosen=optimal.slice().sort((a,b)=>a.boundary-b.boundary)[0];return{...chosen,eligible:optimal.length===1,reason:optimal.length===1?'consecutive-observed-opaque-rim-edge':'multiple-source-supported-edge-paths',selectedBoundary:chosen.boundary,boundaryInterval:[Math.min(...optimal.map(p=>p.boundary))-.5,Math.max(...optimal.map(p=>p.boundary))+.5],optimalCandidates:optimal.map(p=>p.boundary),directAnchor:byAnchor.has(i)};});
 return{eligible:false,scope:'local observed exterior of continuous opaque rim; full owner remains unadmitted',center,tolerance,anchorCount:anchors.length,anchors:anchors.map(p=>({index:p.index,boundary:p.boundary})),maxStep,optimum,records};
}
module.exports={analyze};

},
"source-opaque-rim-edge.js":function(module,exports,require){
'use strict';const Math=globalThis.Math;
'use strict';
// Separate an observed colored foreground rim and its immediately adjacent
// dark band from the next source surface. The next surface's pigment may
// change across a host-art junction. Such a change does not add another rim
// layer. Interrupted first-exit chains remain explicit, unadmitted contacts.
const median=a=>a.slice().sort((x,y)=>x-y)[a.length>>1],max=c=>Math.max(...c),min=c=>Math.min(...c);
function analyze(profiles,firstRadius){
 const records=profiles.map((p,index)=>{const row=Math.round(p.inner-firstRadius),sample=p.rgb.slice(Math.max(0,row),row+2),colored=sample.filter(c=>max(c)>=110&&(max(c)-min(c))/max(c)>=.35);if(!Number.isFinite(p.inner)||!colored.length)return{index,eligible:false,reason:'missing-observed-inner-colored-rim'};
  let start=null,end=null;for(let j=Math.max(0,row);j<p.rgb.length;j++){if(max(p.rgb[j])>=75)continue;let k=j;while(k<p.rgb.length&&max(p.rgb[k])<75)k++;if(k-j>=3){start=j;end=k;break;}j=k;}
  if(start===null||end>=p.rgb.length)return{index,eligible:false,reason:'missing-exposed-first-dark-band-exit'};
  const outside=p.rgb[end],band=p.rgb.slice(start,end),ink=[0,1,2].map(c=>median(band.map(p=>p[c]))),contrast=Math.max(...outside.map((v,c)=>Math.abs(v-ink[c]))),boundary=firstRadius+end-.5;
  if(contrast<18)return{index,eligible:false,reason:'weak-first-dark-band-exit',boundary};
  return{index,eligible:false,reason:'candidate-first-dark-band-exit',inner:p.inner,inkStart:firstRadius+start,inkEnd:firstRadius+end-1,blackWidth:end-start,boundary,ink,outside,contrast,observedBoundaryInterval:[boundary-.5,boundary+.5]};
 });
 const widths=records.filter(p=>p.boundary!==undefined).map(p=>p.blackWidth);if(widths.length<8)return{eligible:false,reason:'insufficient-first-exit-source-observations',records};
 const medianWidth=median(widths),maxStep=Math.max(2,Math.ceil(medianWidth/2));let chain=0,previous=null;for(const p of records){if(p.boundary===undefined){previous=null;continue;}if(!previous||p.index!==previous.index+1||Math.abs(p.boundary-previous.boundary)>maxStep)chain++;p.chain=chain;previous=p;}
 const chainSizes=new Map();for(const p of records)if(p.chain!==undefined)chainSizes.set(p.chain,(chainSizes.get(p.chain)||0)+1);
 for(const p of records){if(p.chain===undefined)continue;if(chainSizes.get(p.chain)<8){p.reason='insufficient-consecutive-first-exit-chain';continue;}const L=records[p.index-1],R=records[p.index+1];if(!L||!R||L.chain!==p.chain||R.chain!==p.chain){p.reason='first-exit-chain-interrupted-or-window-edge';continue;}p.eligible=true;p.reason='observed-colored-rim-dark-band-to-next-source-surface';p.selectedBoundary=p.boundary;p.boundaryInterval=p.observedBoundaryInterval;}
 return{eligible:false,scope:'local first dark-band exterior edge; no whole-owner or source admission',medianWidth,maxStep,records};
}
module.exports={analyze};

},
"native-local-layer-refinement.js":function(module,exports,require){
'use strict';const Math=globalThis.Math;
'use strict';
// Apply only adjacent, source-certified local outer-layer observations.
// Pixels outside the measured source band and independently owned caption
// atoms are untouched. This never admits inherited unresolved geometry.
function refine(mask,host,w,h,circle,count,observations,{radiusBand,protectedMask}={}){
 if(mask.length!==w*h||host.length!==w*h||!Array.isArray(radiusBand)||radiusBand.length!==2)throw Error('invalid local layer refinement');
 const [cx,cy]=circle,byIndex=new Map(observations.filter(p=>p.eligible&&Number.isInteger(p.k)&&Number.isFinite(p.selectedBoundary)).map(p=>[p.k,p])),result=Uint8Array.from(mask);let changed=0,protectedPixels=0,locallyCovered=0;
 for(let i=0;i<result.length;i++){
  if(!host[i])continue;if(protectedMask?.[i]){protectedPixels++;continue;}
  const dx=i%w+.5-cx,dy=(i/w|0)+.5-cy,r=Math.hypot(dx,dy);if(r<radiusBand[0]||r>radiusBand[1])continue;
  const p=((Math.atan2(dy,dx)+2*Math.PI)%(2*Math.PI))*count/(2*Math.PI),k=Math.floor(p),left=byIndex.get(k),right=byIndex.get((k+1)%count);if(!left||!right)continue;
  const f=p-k,boundary=left.selectedBoundary*(1-f)+right.selectedBoundary*f,next=+(r<=boundary);locallyCovered++;if(next!==result[i]){result[i]=next;changed++;}
 }
 return{eligible:false,scope:'partial source-certified local layer refinement; inherited unresolved ownership remains rejected',mask:result,changed,protectedPixels,locallyCovered,supportedAngles:byIndex.size};
}
module.exports={refine};

},
"source-host-color-continuation.js":function(module,exports,require){
'use strict';const Math=globalThis.Math;
'use strict';
const median=a=>a.slice().sort((x,y)=>x-y)[a.length>>1];
// The surface outside an opaque rim may resemble another decorative layer.
// Require that actual color component to continue into a substantial exterior
// host field before reclassifying it. A bounded second rim is not such a field.
function inspect(a,w,h,host,proposedOwner,circle,count,observations,outerRadius){
 if(a.length!==w*h*4||host.length!==w*h||proposedOwner.length!==w*h||observations.length<8)return{eligible:false,reason:'insufficient-source-host-color-observations'};
 const center=[0,1,2].map(k=>median(observations.map(p=>p.color[k]))),tolerance=[0,1,2].map(k=>Math.max(18,3*median(observations.map(p=>Math.abs(p.color[k]-center[k]))))),[cx,cy]=circle,matches=i=>!proposedOwner[i]&&host[i]&&Math.hypot(...[0,1,2].map(k=>(a[4*i+k]-center[k])/tolerance[k]))<=2.5,ids=new Int32Array(w*h),items=[];
 for(let i=0;i<ids.length;i++)if(!ids[i]&&matches(i)){const id=items.length+1,pixels=[i];ids[i]=id;let exteriorPixels=0,maxRadius=0;for(let k=0;k<pixels.length;k++){const j=pixels[k],x=j%w,y=j/w|0,R=Math.hypot(x+.5-cx,y+.5-cy);maxRadius=Math.max(maxRadius,R);exteriorPixels+=R>outerRadius?1:0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const X=x+dx,Y=y+dy,z=Y*w+X;if(X>=0&&Y>=0&&X<w&&Y<h&&!ids[z]&&matches(z)){ids[z]=id;pixels.push(z);}}}items.push({id,pixels:pixels.length,exteriorPixels,maxRadius,angles:new Set()});}
 for(const p of observations){const t=2*Math.PI*p.k/count,x=Math.floor(cx+p.R*Math.cos(t)),y=Math.floor(cy+p.R*Math.sin(t));for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const X=x+dx,Y=y+dy;if(X>=0&&Y>=0&&X<w&&Y<h&&ids[Y*w+X])items[ids[Y*w+X]-1].angles.add(p.k);}}
 const observedAngles=new Set(observations.map(p=>p.k)).size,candidates=items.filter(p=>p.angles.size>=8&&p.exteriorPixels>=64&&p.exteriorPixels>=4*(p.pixels-p.exteriorPixels)),covered=new Set(candidates.flatMap(p=>[...p.angles])),escapeAngles=[];
 let exteriorConnections=0,connectionPaths=[];
 if(candidates.length===1){
  const id=candidates[0].id,local=new Int32Array(w*h);local.fill(-1);const pixels=[];
  // Only the local colored band and its first exterior samples need a graph.
  // Eight disjoint source-pixel paths exclude a single thin colored bridge.
  for(let i=0;i<ids.length;i++)if(ids[i]===id&&Math.hypot(i%w+.5-cx,(i/w|0)+.5-cy)<=outerRadius+2){local[i]=pixels.length;pixels.push(i);}
  const S=pixels.length*2,T=S+1,graph=Array.from({length:T+1},()=>[]),add=(u,v,cap)=>{const A={to:v,cap,rev:graph[v].length},B={to:u,cap:0,rev:graph[u].length};graph[u].push(A);graph[v].push(B);},seedPixels=new Set();
  for(const p of observations){const t=2*Math.PI*p.k/count,x=Math.floor(cx+p.R*Math.cos(t)),y=Math.floor(cy+p.R*Math.sin(t));for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const X=x+dx,Y=y+dy,i=Y*w+X;if(X>=0&&Y>=0&&X<w&&Y<h&&local[i]>=0)seedPixels.add(i);}}
  for(let j=0;j<pixels.length;j++){const i=pixels[j],x=i%w,y=i/w|0;add(j*2,j*2+1,1);if(seedPixels.has(i))add(S,j*2,1);if(Math.hypot(x+.5-cx,y+.5-cy)>outerRadius)add(j*2+1,T,1);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const X=x+dx,Y=y+dy,z=Y*w+X;if((dx||dy)&&X>=0&&Y>=0&&X<w&&Y<h&&local[z]>=0)add(j*2+1,local[z]*2,8);}}
  for(let flow=0;flow<8;flow++){const prev=new Int32Array(graph.length),edge=new Int32Array(graph.length);prev.fill(-1);prev[S]=S;const queue=[S];for(let k=0;k<queue.length&&prev[T]<0;k++){const u=queue[k];for(let j=0;j<graph[u].length;j++){const e=graph[u][j];if(e.cap>0&&prev[e.to]<0){prev[e.to]=u;edge[e.to]=j;queue.push(e.to);}}}if(prev[T]<0)break;const path=[];for(let v=T;v!==S;v=prev[v]){const u=prev[v],e=graph[u][edge[v]];e.cap--;graph[v][e.rev].cap++;if(v<S&&v%2===1)path.push(pixels[v>>1]);}connectionPaths.push(path.reverse());exteriorConnections++;}
 }

 const eligible=candidates.length===1&&covered.size>=observedAngles*.9&&exteriorConnections>=8;
 return{eligible,reason:eligible?'observed-color-continues-into-exterior-host-field':'no-unique-substantial-exterior-color-continuation',center,tolerance,observedAngles,coveredAngles:covered.size,exteriorConnections,connectionPaths,components:items.filter(p=>p.angles.size).map(p=>({...p,angles:[...p.angles]}))};
}
module.exports={inspect};

},
"source-paper-closed-rim-components.js":function(module,exports,require){
'use strict';const Math=globalThis.Math;
'use strict';
function paperTail(samples){
 const firstUnknown=samples.findIndex(p=>!p.known),knownEnd=firstUnknown<0?samples.length:firstUnknown;
 if(!knownEnd||samples.slice(knownEnd).some(p=>p.known))return{supported:false,reason:'unknown-source-within-observation'};
 let start=knownEnd;while(start>0){const p=samples[start-1].rgb;if(Math.min(...p)<190||Math.max(...p)-Math.min(...p)>40)break;start--;}
 return{supported:knownEnd-start>=3,reason:knownEnd-start>=3?'observed-paper-closure-before-window-edge':'no-observed-paper-closure',paperStart:samples[start]?.R??null,paperSamples:knownEnd-start,knownEnd,unknownSuffix:samples.length-knownEnd};
}
// The observation window is not an ownership boundary. Follow every connected
// nonpaper source position outside the proposed body, and reject the whole
// component if it leaves the independently paper-facing scope or width band.
function complete(a,w,h,before,scope,maxDistance,{imageDomain=[0,0,w,h],ownedClosureMask=null}={}){
 if(a.length!==w*h*4||before.length!==w*h||scope.length!==w*h||ownedClosureMask&&(ownedClosureMask.length!==w*h||ownedClosureMask.some((v,i)=>v&&!before[i]))||!(maxDistance>0))throw Error('invalid source component input');
 const ink=i=>Math.max(a[i*4],a[i*4+1],a[i*4+2])<75,paper=i=>{const p=[a[i*4],a[i*4+1],a[i*4+2]];return Math.min(...p)>=190&&Math.max(...p)-Math.min(...p)<=40;},adj=i=>{const x=i%w,y=i/w|0,out=[];for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if((dx||dy)&&x+dx>=0&&x+dx<w&&y+dy>=0&&y+dy<h)out.push(i+dy*w+dx);return out;},distance=new Uint16Array(w*h);distance.fill(65535);const queue=new Int32Array(w*h);let head=0,tail=0;for(let i=0;i<before.length;i++)if(before[i]){distance[i]=0;queue[tail++]=i;}const limit=Math.floor(maxDistance);
 while(head<tail){const i=queue[head++];if(distance[i]>limit)continue;for(const j of adj(i))if(distance[j]>distance[i]+1){distance[j]=distance[i]+1;queue[tail++]=j;}}
 const seen=new Uint8Array(w*h),mask=Uint8Array.from(before),components=[],changed=[];
 for(let seed=0;seed<before.length;seed++){if(seen[seed]||before[seed]||paper(seed)||!scope[seed]||distance[seed]>limit)continue;const pixels=[seed],ownedClosureWitnesses=new Set();seen[seed]=1;let attachedInk=false,observedPaper=false,leavesScope=false,leavesBand=false,unknownExterior=false,maxObservedDistance=0,solidInk=0;
  for(let n=0;n<pixels.length;n++){const i=pixels[n],x=i%w,y=i/w|0;solidInk+=ink(i)?1:0;maxObservedDistance=Math.max(maxObservedDistance,distance[i]);leavesScope||=!scope[i];leavesBand||=distance[i]>limit;unknownExterior||=(x===0&&imageDomain[0]!==0)||(x===w-1&&imageDomain[2]!==w)||(y===0&&imageDomain[1]!==0)||(y===h-1&&imageDomain[3]!==h);for(const j of adj(i)){if(before[j]){attachedInk||=ink(j);if(ownedClosureMask?.[j])ownedClosureWitnesses.add(j);continue;}if(paper(j)){observedPaper=true;continue;}if(!seen[j]){seen[j]=1;pixels.push(j);}}}
  const eligible=solidInk>0&&attachedInk&&(observedPaper||ownedClosureWitnesses.size>=3)&&!leavesScope&&!leavesBand&&!unknownExterior;if(eligible)for(const i of pixels){mask[i]=1;changed.push(i);}components.push({pixels,eligible,solidInk,attachedInk,observedPaper,ownedClosureWitnesses:[...ownedClosureWitnesses],leavesScope,leavesBand,unknownExterior,maxObservedDistance});
 }
 return{mask,components,changed,maxDistance,metric:'8-neighbor source lattice; complete nonpaper components only',scope:'source-connected opaque rim and its nonpaper edge; full admission unresolved'};
}
module.exports={complete,paperTail};

},
"source-paper-facing-mixed-fringe.js":function(module,exports,require){
'use strict';const Math=globalThis.Math;
'use strict';
const median=a=>a.slice().sort((x,y)=>x-y)[a.length>>1],paper=p=>Math.min(...p)>=190&&Math.max(...p)-Math.min(...p)<=40;
// One nonpropagating raster sample may contain the observed opaque rim mixed
// with measured exterior paper. Interior city paint cannot be the background.
function refine(a,w,h,before){
 if(a.length!==w*h*4||before.length!==w*h)return null;const mask=Uint8Array.from(before),records=[],rgb=i=>Array.from(a.subarray(i*4,i*4+3));
 for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){const i=y*w+x;if(before[i])continue;const near=[];let nx=0,ny=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(before[(y+dy)*w+x+dx]){near.push(rgb((y+dy)*w+x+dx));nx-=dx;ny-=dy;}if(near.filter(p=>Math.max(...p)<75).length<2||!nx&&!ny)continue;const n=Math.hypot(nx,ny);nx/=n;ny/=n;const exterior=[];for(let d=2;d<=4;d++){const X=Math.round(x+d*nx),Y=Math.round(y+d*ny);if(X<0||Y<0||X>=w||Y>=h||before[Y*w+X])continue;exterior.push(rgb(Y*w+X));}if(exterior.length!==3||exterior.some(p=>!paper(p)))continue;const F=[0,1,2].map(k=>median(near.map(p=>p[k]))),B=[0,1,2].map(k=>median(exterior.map(p=>p[k]))),P=rgb(i),v=F.map((n,k)=>n-B[k]),signal=Math.hypot(...v);if(Math.max(...F)>=100||signal<24||exterior.some(p=>Math.max(...p.map((n,k)=>Math.abs(n-B[k])))>24))continue;const alpha=P.reduce((s,n,k)=>s+(n-B[k])*v[k],0)/(signal*signal),residual=Math.max(...P.map((n,k)=>Math.abs(n-(B[k]+alpha*v[k]))));if(alpha<.15||alpha>.85||residual>12)continue;const uncertainty=Math.min(.5,12/signal);mask[i]=1;records.push({index:i,pixel:P,foreground:F,background:B,alpha,residual,alphaInterval:[Math.max(0,alpha-uncertainty),Math.min(1,alpha+uncertainty)],distanceBound:Math.SQRT2});}
 return{mask,records,maximumRasterDistance:Math.SQRT2,scope:'observed opaque ink mixed with independently measured exterior paper; binary raster assignment with explicit alpha uncertainty'};
}
module.exports={refine};

},
"source-continuous-host-surface.js":function(module,exports,require){
'use strict';const Math=globalThis.Math;
'use strict';
const median=a=>a.slice().sort((x,y)=>x-y)[a.length>>1],max=p=>Math.max(...p),min=p=>Math.min(...p),dot=(a,b)=>a.reduce((s,v,k)=>s+v*b[k],0);
function similarHue(A,B){const a=A.map(v=>v-min(A)),b=B.map(v=>v-min(B));return max(A)-min(A)>30&&max(B)-min(B)>30&&dot(a,b)/(Math.hypot(...a)*Math.hypot(...b)||1)>.94;}
// Remove a visible exterior color field accidentally included by a proposed
// contour. Black contacts are deliberately left unresolved. The independently
// observed rim decoration is a hard inner limit, and a matching-color rim
// cannot be distinguished by this rule and therefore defers.
function inspect(samples,innerRadius,inkPalette,{protectedRadius=innerRadius}={}){
 if(!Array.isArray(inkPalette)||inkPalette.length!==3||!Number.isFinite(innerRadius))return{supported:false,reason:'missing-independent-source-palettes'};
 const edge=samples.findIndex((p,i)=>i&&samples[i-1].owned&&!p.owned);if(edge<0)return{supported:false,reason:'no-proposed-edge'};const outer=samples.slice(edge+1,edge+9);if(outer.length!==8||outer.some(p=>!p.known||p.owned))return{supported:false,reason:'missing-exterior-source-field'};
 const family=[0,1,2].map(k=>median(outer.map(p=>p.rgb[k]))),stable=outer.filter(p=>Math.max(...p.rgb.map((v,k)=>Math.abs(v-family[k])))<=24);if(stable.length<5||max(family)<90||min(family)>=190&&max(family)-min(family)<=40||Math.max(...family.map((v,k)=>Math.abs(v-inkPalette[k])))<35)return{supported:false,reason:'exterior-field-not-distinct-and-stable'};
 const inner=samples.reduce((a,p)=>Math.abs(p.R-innerRadius)<Math.abs(a.R-innerRadius)?p:a),rim=inner.rgb;if(!inner.known||max(rim)<110||(max(rim)-min(rim))/max(rim)<.35||similarHue(rim,family))return{supported:false,reason:'rim-and-exterior-color-not-independently-distinct'};
 const v=family.map((n,k)=>n-inkPalette[k]),signal=dot(v,v),removed=[];for(let j=edge-1;j>=0&&samples[j].R>protectedRadius+.5;j--){const p=samples[j];if(!p.known||!p.owned)break;const alpha=dot(p.rgb.map((n,k)=>n-inkPalette[k]),v)/(signal||1),residual=Math.max(...p.rgb.map((n,k)=>Math.abs(n-(inkPalette[k]+Math.min(1,Math.max(0,alpha))*v[k])))),hue=similarHue(p.rgb,family)&&max(p.rgb)>=90;if(!(alpha>=.3&&alpha<=1.1&&residual<=18)&&!hue)break;removed.push({R:p.R,rgb:p.rgb,alpha,residual,evidence:hue?'continuous-source-color-family':'observed-host-ink-mixture'});}
 if(removed.length<2)return{supported:false,reason:'no-contiguous-visible-host-spill',family,rim};return{supported:true,reason:'continuous-observed-exterior-color-through-proposed-cut',previousBoundary:samples[edge].R-.5,boundary:removed.at(-1).R-.5,innerRadius,protectedRadius,family,inkPalette,rim,stableExterior:stable.length,removed,scope:'visible exterior-color reassignment only; connected black contacts remain unresolved'};
}
function matches(pixel,record){if(max(pixel)<75)return false;const v=record.family.map((n,k)=>n-record.inkPalette[k]),alpha=dot(pixel.map((n,k)=>n-record.inkPalette[k]),v)/(dot(v,v)||1),residual=Math.max(...pixel.map((n,k)=>Math.abs(n-(record.inkPalette[k]+Math.min(1,Math.max(0,alpha))*v[k]))));return similarHue(pixel,record.family)&&max(pixel)>=90||alpha>=.3&&alpha<=1.1&&residual<=18;}
function transfer(a,w,h,before,circle,count,records){
 const[cx,cy]=circle,candidates=new Map(),mask=Uint8Array.from(before),changed=[];
 for(const p of records)if(p.supported){const t=p.k*2*Math.PI/count;for(const s of p.removed){const x=Math.floor(cx+s.R*Math.cos(t)),y=Math.floor(cy+s.R*Math.sin(t));for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const X=x+dx,Y=y+dy,i=Y*w+X;if(X<0||Y<0||X>=w||Y>=h||!before[i]||Math.hypot(X+.5-cx,Y+.5-cy)<=p.protectedRadius+.5||!matches(Array.from(a.subarray(i*4,i*4+3)),p))continue;if(!candidates.has(i))candidates.set(i,[]);candidates.get(i).push(p);}}}
 // No propagation of the observation footprint. Connectivity only verifies
 // that candidate source pixels actually join the exterior source field.
 const seen=new Set();for(const seed of candidates.keys()){if(seen.has(seed))continue;const pixels=[seed];seen.add(seed);let attachedExterior=false;for(let n=0;n<pixels.length;n++){const i=pixels[n],x=i%w,y=i/w|0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const X=x+dx,Y=y+dy,j=Y*w+X;if(X<0||Y<0||X>=w||Y>=h)continue;if(!before[j]&&candidates.get(i).some(p=>matches(Array.from(a.subarray(j*4,j*4+3)),p)))attachedExterior=true;if(candidates.has(j)&&!seen.has(j)){seen.add(j);pixels.push(j);}}}if(attachedExterior)for(const i of pixels){mask[i]=0;changed.push(i);}}
 return{mask,changed,candidates:candidates.size,maximumSourceSamplingDistance:Math.SQRT2,scope:'only observed host-color samples connected to the exterior field; opaque contacts and rim colors retained'};
}
module.exports={inspect,similarHue,matches,transfer};

},
"source-uncovered-opaque-edges.js":function(module,exports,require){
'use strict';const Math=globalThis.Math;
'use strict';
const Edge=require('./source-continuous-opaque-rim.js'),Local=require('./native-local-layer-refinement.js'),wrap=(k,n)=>(k%n+n)%n;
// Revisit an uncertified arc using the already established consecutive source
// ink-to-surface model. Decorative-line motion cannot pull the outer cut into
// a visibly continuous dark band. Ambiguous/interrupted chains remain deferred.
function refine(a,w,h,before,host,circle,count,innerRadius,arcs,{protectedMask}={}){
 const[cx,cy,r]=circle,r0=Math.floor(r*.84),r1=Math.ceil(r*1.16),margin=Math.max(8,Math.ceil(count*.004)),results=[];let mask=Uint8Array.from(before);
 for(const arc of arcs){const span=wrap(arc.last-arc.first,count)+1,ids=Array.from({length:span+2*margin},(_,i)=>wrap(arc.first-margin+i,count)),profiles=ids.map(k=>{const t=k*2*Math.PI/count,rgb=[],known=[];for(let R=r0;R<=r1;R++){const x=Math.floor(cx+R*Math.cos(t)),y=Math.floor(cy+R*Math.sin(t)),ok=x>=0&&y>=0&&x<w&&y<h,i=y*w+x;rgb.push(ok?Array.from(a.subarray(i*4,i*4+3)):[255,255,255]);known.push(ok);}return{k,inner:innerRadius[k],rgb,known};});
  if(profiles.some(p=>p.known.some(v=>!v))){results.push({arc,supported:false,reason:'unknown-source-neighbor'});continue;}
  const model=Edge.analyze(profiles,r0);if(model.records.length!==profiles.length||model.records.some(p=>!p.eligible)){results.push({arc,supported:false,reason:model.reason||'source-edge-not-unique',model});continue;}
  const observations=model.records.filter(p=>p.index>=margin-1&&p.index<=margin+span).map(p=>({...p,k:ids[p.index]})),q=Local.refine(mask,host,w,h,circle,count,observations,{radiusBand:[r0,r1],protectedMask});mask=q.mask;results.push({arc,supported:true,model,observations,changed:q.changed});
 }
 const changed=[];for(let i=0;i<mask.length;i++)if(mask[i]!==before[i])changed.push(i);
 return{mask,changed,results,scope:'source-observed opaque boundary correction; deferred arcs are not admitted'};
}
module.exports={refine};

},
"source-caption-envelope.js":function(module,exports,require){
'use strict';const Math=globalThis.Math;
'use strict';
// Caption cores establish the chromatic family. The surrounding frame must
// form a closed, source-supported enclosure; a sampling window grants no art.
const median=a=>a.slice().sort((x,y)=>x-y)[a.length>>1];
function envelope(a,w,h,seed){
 if(a.length!==w*h*4||seed.mask.length!==w*h)return null;
 const colors=[];for(let i=0;i<w*h;i++)if(seed.mask[i]){const p=[a[4*i],a[4*i+1],a[4*i+2]],m=(p[0]+p[1]+p[2])/3,v=p.map(x=>x-m),n=Math.hypot(...v);if(Math.max(...p)>190&&n>30)colors.push(v.map(x=>x/n));}
 if(colors.length<64)return null;const v=[0,1,2].map(k=>median(colors.map(p=>p[k]))),norm=Math.hypot(...v),direction=v.map(x=>x/norm),cosines=colors.map(p=>p.reduce((n,x,k)=>n+x*direction[k],0)).sort((x,y)=>x-y),cosineFloor=Math.max(.96,cosines[Math.floor(cosines.length*.01)]-.005),[x,y,X,Y]=seed.box,pad=Math.max(4,Math.ceil(Math.min(X-x,Y-y)*.25)),box=[Math.max(0,x-pad),Math.max(0,y-pad),Math.min(w,X+pad),Math.min(h,Y+pad)],W=box[2]-box[0],H=box[3]-box[1],wall=new Uint8Array(W*H);
 for(let yy=0;yy<H;yy++)for(let xx=0;xx<W;xx++){const i=(yy+box[1])*w+xx+box[0],p=[a[4*i],a[4*i+1],a[4*i+2]],m=(p[0]+p[1]+p[2])/3,q=p.map(n=>n-m),n=Math.hypot(...q),cos=q.reduce((s,v,k)=>s+v*direction[k],0)/(n||1);wall[yy*W+xx]=+(n>=6&&cos>=cosineFloor&&Math.max(...p)>=140);}
 const outside=new Uint8Array(W*H),queue=[];const add=i=>{if(!wall[i]&&!outside[i]){outside[i]=1;queue.push(i);}};for(let xx=0;xx<W;xx++){add(xx);add((H-1)*W+xx);}for(let yy=0;yy<H;yy++){add(yy*W);add(yy*W+W-1);}for(let k=0;k<queue.length;k++){const i=queue[k],xx=i%W,yy=i/W|0;if(xx)add(i-1);if(xx+1<W)add(i+1);if(yy)add(i-W);if(yy+1<H)add(i+W);}
 // Extract the filled component containing the authenticated core. Distant
 // same-color marks remain outside unless their pixels physically join it.
 const filled=outside.map(v=>+!v),seen=new Uint8Array(W*H),items=[];for(let i=0;i<filled.length;i++)if(filled[i]&&!seen[i]){const ids=[i];seen[i]=1;let hits=0,edge=0;for(let k=0;k<ids.length;k++){const j=ids[k],xx=j%W,yy=j/W|0;hits+=seed.mask[(yy+box[1])*w+xx+box[0]];edge+=+(xx===0||yy===0||xx===W-1||yy===H-1);for(const n of[xx?j-1:-1,xx+1<W?j+1:-1,yy?j-W:-1,yy+1<H?j+W:-1])if(n>=0&&filled[n]&&!seen[n]){seen[n]=1;ids.push(n);}}items.push({ids,hits,edge});}
 const pixels=seed.mask.reduce((n,v)=>n+v,0),matches=items.filter(p=>p.hits>=pixels*.98);if(matches.length!==1)return null;const body=matches[0];if(body.edge||body.ids.length>pixels*1.5)return null;
 // A broken surrounding frame cannot be silently discarded in favor of the
 // smaller interior field. Its remaining source component still surrounds
 // the core's center and exposes a failed enclosure.
 for(const item of items)if(item!==body){let lx=W,ly=H,hx=0,hy=0;for(const i of item.ids){lx=Math.min(lx,i%W);hx=Math.max(hx,i%W+1);ly=Math.min(ly,i/W|0);hy=Math.max(hy,(i/W|0)+1);}if(hx-lx>=(X-x)*.8&&hy-ly>=(Y-y)*.8&&lx+box[0]<(x+X)/2&&hx+box[0]>(x+X)/2&&ly+box[1]<(y+Y)/2&&hy+box[1]>(y+Y)/2)return null;}
 const mask=new Uint8Array(w*h);let sourceBoundary=0,unsupportedBoundary=0;for(const i of body.ids)mask[(Math.floor(i/W)+box[1])*w+i%W+box[0]]=1;for(const i of body.ids){const xx=i%W,yy=i/W|0;if([i-1,i+1,i-W,i+W].some(j=>outside[j])){sourceBoundary+=wall[i];unsupportedBoundary+=!wall[i];}}
 if(unsupportedBoundary)return null;return{mask,box,direction,cosineFloor,corePixels:pixels,pixels:body.ids.length,sourceBoundary,unsupportedBoundary};
}
module.exports={envelope};

},
"source-caption-mixed-fringe.js":function(module,exports,require){
'use strict';const Math=globalThis.Math;
'use strict';
const median=a=>a.slice().sort((x,y)=>x-y)[a.length>>1];
// A single source raster sample may visibly mix the frame and its exterior.
// Infer that mixture from independent adjacent frame/exterior observations.
// Never propagate the added samples or extrapolate a solid colored branch.
function refine(a,w,h,mask){
 if(a.length!==w*h*4||mask.length!==w*h)return null;const result=Uint8Array.from(mask),records=[],deferred=[],rgb=i=>[a[4*i],a[4*i+1],a[4*i+2]];
 for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){const i=y*w+x;if(mask[i])continue;const near=[];let nx=0,ny=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(mask[(y+dy)*w+x+dx]){near.push(rgb((y+dy)*w+x+dx));nx-=dx;ny-=dy;}if(!near.length||!nx&&!ny)continue;const d=Math.hypot(nx,ny);nx/=d;ny/=d;const exterior=[];for(let t=2;t<=4;t++){const X=Math.round(x+t*nx),Y=Math.round(y+t*ny);if(X<0||Y<0||X>=w||Y>=h||mask[Y*w+X])continue;exterior.push(rgb(Y*w+X));}if(exterior.length<3)continue;const F=[0,1,2].map(k=>median(near.map(p=>p[k]))),B=[0,1,2].map(k=>median(exterior.map(p=>p[k]))),P=rgb(i),v=F.map((n,k)=>n-B[k]),signal=Math.hypot(...v);if(signal<24||exterior.some(p=>Math.max(...p.map((n,k)=>Math.abs(n-B[k])))>24))continue;const alpha=P.reduce((s,n,k)=>s+(n-B[k])*v[k],0)/(signal*signal),residual=Math.max(...P.map((n,k)=>Math.abs(n-(B[k]+alpha*v[k]))));if(alpha<.15||alpha>.85||residual>12)continue;const n=F.reduce((s,v)=>s+v,0)/3,chromatic=Math.hypot(...F.map(v=>v-n));if(Math.max(...F)<140||chromatic<6)continue;
  const uncertainty=Math.min(.5,12/signal),record={index:i,foreground:F,background:B,pixel:P,alpha,residual,alphaInterval:[Math.max(0,alpha-uncertainty),Math.min(1,alpha+uncertainty)],distanceBound:Math.SQRT2};result[i]=1;records.push(record);
 }
 return{mask:result,records,deferred,maximumRasterDistance:Math.SQRT2};
}
module.exports={refine};

},
"source-same-owner-caption-join.js":function(module,exports,require){
'use strict';const Math=globalThis.Math;
'use strict';
const max=p=>Math.max(...p),min=p=>Math.min(...p),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const chroma=p=>{const lo=min(p),range=max(p)-lo;return range>=30&&max(p)>=90?p.map(v=>(v-lo)/range):null;};
// Intensity is allowed to vary along the independently observed color family.
// Source pixels must remain inside its nonnegative color cone together with
// the independently observed caption family and neutral ink.
function colorError(pixel,art,caption){let best=Infinity;const neutral=[1,1,1];for(const A of art)for(const C of caption){const det=dot(neutral,cross(A,C));if(Math.abs(det)<1e-5)continue;const weights=[dot(pixel,cross(A,C))/det,dot(neutral,cross(pixel,C))/det,dot(neutral,cross(A,pixel))/det];if(weights.some(v=>v< -12))continue;const reconstructed=[0,1,2].map(k=>Math.max(0,weights[0])+Math.max(0,weights[1])*A[k]+Math.max(0,weights[2])*C[k]);best=Math.min(best,Math.max(...pixel.map((v,k)=>Math.abs(v-reconstructed[k]))));}return best;}
function mixtureError(pixel,ink,caption){let best=Infinity;for(const A of ink)for(const C of caption){const d=C.map((v,k)=>v-A[k]),q=pixel.map((v,k)=>v-A[k]),alpha=dot(q,d)/(dot(d,d)||1);if(alpha<0||alpha>1)continue;best=Math.min(best,Math.max(...pixel.map((v,k)=>Math.abs(v-(A[k]+alpha*d[k])))));}return best;}
function close(a,w,h,art,caption,{artRasterUncertainty=Math.SQRT2,captionRasterUncertainty=Math.SQRT2}={}){
 if(a.length!==w*h*4||art.length!==w*h||caption.length!==w*h)return null;const n=w*h,owner=Uint8Array.from(art,(v,i)=>+(v||caption[i])),seen=new Uint8Array(n),mask=Uint8Array.from(owner),components=[],changed=[],rgb=i=>Array.from(a.subarray(i*4,i*4+3));
 const distanceBound=artRasterUncertainty+captionRasterUncertainty,reach=Math.ceil(distanceBound),adjacent=i=>{const x=i%w,y=i/w|0,out=[];for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if((dx||dy)&&x+dx>=0&&x+dx<w&&y+dy>=0&&y+dy<h)out.push(i+dy*w+dx);return out;};
 for(let seed=0;seed<n;seed++){if(owner[seed]||seen[seed])continue;const pixels=[seed],boundary=new Set();seen[seed]=1;let open=false,paper=false,allAdjacent=true;for(let j=0;j<pixels.length;j++){const i=pixels[j],x=i%w,y=i/w|0,p=rgb(i);open||=x===0||y===0||x===w-1||y===h-1;paper||=min(p)>=190&&max(p)-min(p)<=40;let near=false;for(const k of adjacent(i)){if(owner[k]){near=true;boundary.add(k);}else if(!seen[k]){seen[k]=1;pixels.push(k);}}allAdjacent&&=near;}
  if(open||paper)continue;let maximumObservedDistance=0;for(const i of pixels){const x=i%w,y=i/w|0;let nearest=Infinity;for(let dy=-reach;dy<=reach;dy++)for(let dx=-reach;dx<=reach;dx++)if(x+dx>=0&&x+dx<w&&y+dy>=0&&y+dy<h&&owner[i+dy*w+dx])nearest=Math.min(nearest,Math.hypot(dx,dy));maximumObservedDistance=Math.max(maximumObservedDistance,nearest);}if(maximumObservedDistance>distanceBound)continue;
  const artWitness=[...boundary].filter(i=>art[i]&&!caption[i]),captionWitness=[...boundary].filter(i=>caption[i]&&!art[i]),A=artWitness.map(i=>chroma(rgb(i))).filter(Boolean),C=captionWitness.map(i=>chroma(rgb(i))).filter(Boolean),ink=artWitness.map(rgb).filter(p=>max(p)<75),captionColors=captionWitness.map(rgb).filter(p=>max(p)>=90),errors=pixels.map(i=>{const chromatic=A.length>=2&&C.length>=2?colorError(rgb(i),A,C):Infinity,mixture=ink.length>=3&&captionColors.length>=3?mixtureError(rgb(i),ink,captionColors):Infinity;return{index:i,rgb:rgb(i),error:Math.min(chromatic,mixture),model:chromatic<=mixture?'observed-color-families':'observed-ink-caption-mixture'};}),eligible=artWitness.length>=3&&captionWitness.length>=3&&errors.every(p=>p.error<=12);
  if(eligible)for(const i of pixels){mask[i]=1;changed.push(i);}components.push({pixels,eligible,artWitness,captionWitness,artColorWitnesses:A.length,captionColorWitnesses:C.length,errors,distanceBound,maximumObservedDistance,artRasterUncertainty,captionRasterUncertainty});
 }
 return{mask,changed,components,scope:'closed source join within the sum of two independently sampled raster-edge bounds; color evidence required; no paper or open component filling'};
}
module.exports={close,colorError,mixtureError};

},
"source-bracketed-ink-components.js":function(module,exports,require){
'use strict';const Math=globalThis.Math;
'use strict';
const max=p=>Math.max(...p),median=a=>a.slice().sort((x,y)=>x-y)[a.length>>1],wrap=(k,n)=>(k%n+n)%n;
function lineFit(points){const mx=points.reduce((n,p)=>n+p.x,0)/points.length,my=points.reduce((n,p)=>n+p.y,0)/points.length,den=points.reduce((n,p)=>n+(p.x-mx)**2,0),slope=points.reduce((n,p)=>n+(p.x-mx)*(p.y-my),0)/(den||1),intercept=my-slope*mx,residuals=points.map(p=>Math.abs(p.y-(intercept+slope*p.x))),uncertainty=3*median(residuals)+Math.SQRT2;return{slope,intercept,uncertainty,residuals};}
function mixture(pixel,ink,surface){const v=surface.map((x,k)=>x-ink[k]),d=pixel.map((x,k)=>x-ink[k]),alpha=d.reduce((s,x,k)=>s+x*v[k],0)/(v.reduce((s,x)=>s+x*x,0)||1),error=Math.max(...pixel.map((x,k)=>Math.abs(x-(ink[k]+Math.max(0,Math.min(1,alpha))*v[k]))));return alpha>=.15&&alpha<=1.15&&error<=18;}
// A source-ink component may complete a clipped rim only when actual exterior
// edges on both sides bracket it. The fitted continuation constrains which
// observed pixels can be owned; it never invents an edge or grows through a
// connected branch that leaves that source-supported corridor.
function complete(a,w,h,before,circle,count,{widthBound}={}){
 if(a.length!==w*h*4||before.length!==w*h||!(widthBound>0))throw Error('Invalid bracketed source input');
 const[cx,cy,r]=circle,r0=Math.floor(r*.84),r1=Math.ceil(r*1.16),n=w*h,rgb=i=>Array.from(a.subarray(i*4,i*4+3)),ink=i=>max(rgb(i))<75,adj=i=>{const x=i%w,y=i/w|0,out=[];for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if((dx||dy)&&x+dx>=0&&x+dx<w&&y+dy>=0&&y+dy<h)out.push(i+dy*w+dx);return out;},profiles=[];
 for(let k=0;k<count;k++){const t=k*2*Math.PI/count,s=[];for(let R=r0;R<=r1;R++){const x=Math.floor(cx+R*Math.cos(t)),y=Math.floor(cy+R*Math.sin(t)),known=x>=0&&y>=0&&x<w&&y<h,i=y*w+x;s.push({R,known,owned:known?before[i]:0,rgb:known?rgb(i):[255,255,255]});}const e=s.findIndex((p,i)=>i&&s[i-1].owned&&!p.owned);let q=null;if(e>=3&&e+2<s.length){const A=s.slice(e-3,e),B=s.slice(e,e+3),palette=[0,1,2].map(c=>median(A.map(p=>p.rgb[c]))),contrast=B.map(p=>Math.max(...p.rgb.map((v,c)=>Math.abs(v-palette[c]))));if([...A,...B].every(p=>p.known)&&A.every(p=>max(p.rgb)<75)&&max(B[0].rgb)>=75&&contrast[0]>=35&&contrast.filter(x=>x>=35).length>=2){const surface=B.slice().sort((a,b)=>max(b.rgb)-max(a.rgb))[0].rgb;q={k,R:s[e].R-.5,ink:palette,surface};}}profiles.push(q);}
 const distance=new Uint16Array(n);distance.fill(65535);const queue=new Int32Array(n);let head=0,tail=0;for(let i=0;i<n;i++)if(before[i]){distance[i]=0;queue[tail++]=i;}const limit=Math.floor(widthBound);while(head<tail){const i=queue[head++];if(distance[i]>limit)continue;for(const j of adj(i))if(distance[j]>distance[i]+1){distance[j]=distance[i]+1;queue[tail++]=j;}}
 const mask=Uint8Array.from(before),seen=new Uint8Array(n),changed=[],components=[],search=Math.ceil(count*.03);
 for(let seed=0;seed<n;seed++){if(before[seed]||seen[seed]||!ink(seed)||distance[seed]>limit)continue;const pixels=[seed],edge=new Set(),attached=new Set();seen[seed]=1;let open=false,far=false,band=false;for(let j=0;j<pixels.length;j++){const i=pixels[j],x=i%w,y=i/w|0,R=Math.hypot(x+.5-cx,y+.5-cy);open||=x===0||y===0||x===w-1||y===h-1;far||=distance[i]>limit;band||=R<r0||R>r1;for(const k of adj(i))if(before[k]){if(ink(k))attached.add(k);}else if(ink(k)){if(!seen[k]){seen[k]=1;pixels.push(k);}}else edge.add(k);}
  const record={pixels,edge:[...edge],attached:[...attached],open,far,band,eligible:false};components.push(record);if(open||far||band||attached.size<3||edge.size<3){record.reason='component-not-closed-within-source-rim-band';continue;}
  const angles=pixels.map(i=>wrap(Math.atan2((i/w|0)+.5-cy,i%w+.5-cx)*count/(2*Math.PI),count)).sort((a,b)=>a-b);let gap=-1,start=0;for(let i=0;i<angles.length;i++){const d=i+1<angles.length?angles[i+1]-angles[i]:angles[0]+count-angles[i];if(d>gap){gap=d;start=angles[(i+1)%angles.length];}}const span=count-gap;if(span>search){record.reason='component-angular-span-exceeds-local-source-corridor';continue;}const first=Math.floor(start),last=Math.ceil(start+span),L=[],R=[];for(let d=1;d<=search&&(L.length<8||R.length<8);d++){if(L.length<8&&profiles[wrap(first-d,count)])L.push({...profiles[wrap(first-d,count)],x:first-d});if(R.length<8&&profiles[wrap(last+d,count)])R.push({...profiles[wrap(last+d,count)],x:last+d});}record.anchorCounts=[L.length,R.length];if(L.length<8||R.length<8){record.reason='missing-eight-source-anchors-on-each-side';continue;}
  const anchors=[...L,...R],fit=lineFit(anchors.map(p=>({x:p.x,y:p.R})));record.fit=fit;record.anchors=anchors;let outsideCorridor=0,maximumDeviation=-Infinity;for(const i of pixels){let k=wrap(Math.atan2((i/w|0)+.5-cy,i%w+.5-cx)*count/(2*Math.PI),count);while(k<start)k+=count;const radius=Math.hypot(i%w+.5-cx,(i/w|0)+.5-cy),d=radius-(fit.intercept+fit.slope*k);maximumDeviation=Math.max(maximumDeviation,d);outsideCorridor+=d>fit.uncertainty?1:0;}record.maximumDeviation=maximumDeviation;record.outsideCorridor=outsideCorridor;if(outsideCorridor){record.reason='connected-ink-leaves-bracketed-source-edge';continue;}
  const badField=[...edge].filter(i=>!anchors.some(p=>mixture(rgb(i),p.ink,p.surface)));record.foreignExterior=badField;if(badField.length){record.reason='component-exterior-not-supported-by-neighboring-source-surfaces';continue;}record.eligible=true;record.reason='closed-source-ink-with-two-sided-observed-edge-support';for(const i of pixels){mask[i]=1;changed.push(i);}
 }
 return{mask,changed,components,profileAnchors:profiles.filter(Boolean),widthBound,sourceAnchorCountPerSide:8,scope:'complete observed opaque components only; branch contacts remain deferred'};
}
module.exports={complete,lineFit,mixture};

},
"source-exterior-component-matte.js":function(module,exports,require){
'use strict';const Math=globalThis.Math;
'use strict';
const Base=require('./source-protected-matte-ownership.js');
// Exterior ownership certificate after the strict per-pixel color witnesses.
// It resolves pale paper/JPEG residuals only inside an already detached, exposed
// component bounded by independently certified paper and the other owner's rim.
// No component size cutoff, page lookup, or relaxation of the color tests is used.
function inspect(a,w,h,host,owner,options){
 const q=Base.inspect(a,w,h,host,owner,options),removed=new Map(q.removedMatte.map(p=>[p.index,p])),rim=new Map(q.transferredFringe.map(p=>[p.index,p])),pending=new Map(q.deferred.map(p=>[p.index,p])),seen=new Set(),certificates=[],resolved=new Set(),nextHost=Uint8Array.from(q.host),nextRemoved=q.removedMatte.slice();
 const neighbors=i=>{const x=i%w,y=Math.floor(i/w),r=[];for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const X=x+dx,Y=y+dy;if((dx||dy)&&X>=0&&Y>=0&&X<w&&Y<h)r.push(Y*w+X);}return r;};
 for(const seed of pending.keys()){
  if(seen.has(seed))continue;const component=[seed];seen.add(seed);let fullyClassified=true,paperBoundary=false,clipped=false;
  for(let k=0;k<component.length;k++){const i=component[k],x=i%w,y=Math.floor(i/w);clipped||=!x||!y||x===w-1||y===h-1;fullyClassified&&=removed.has(i)||rim.has(i)||pending.has(i);for(const j of neighbors(i)){if(!host[j]&&!owner[j]&&a[4*j+3]===255&&Math.min(a[4*j],a[4*j+1],a[4*j+2])>=190&&Math.max(a[4*j],a[4*j+1],a[4*j+2])-Math.min(a[4*j],a[4*j+1],a[4*j+2])<=40)paperBoundary=true;if(host[j]&&!owner[j]&&!seen.has(j)){seen.add(j);component.push(j);}}}
  const matteWitnesses=component.filter(i=>removed.has(i)),rimWitnesses=component.filter(i=>rim.has(i));
  // Protected paint, caption cores and clipped components contain positions
  // that the earlier source classifier deliberately left outside these sets.
  if(!fullyClassified||clipped||!paperBoundary||!matteWitnesses.length||!rimWitnesses.length)continue;
  const allowed=new Set(component),bound=Math.ceil(q.rimWidthBound),paths=(start,targets)=>{let front=[start],visited=new Set(front);for(let distance=0;distance<=bound;distance++){const witnesses=front.filter(i=>targets.has(i));if(witnesses.length)return{distance,witnesses:witnesses.sort((a,b)=>a-b)};const next=[];for(const i of front)for(const j of neighbors(i))if(allowed.has(j)&&!visited.has(j)){visited.add(j);next.push(j);}front=next;if(!front.length)break;}return null;};
  const records=[];for(const i of component)if(pending.has(i)){const matte=paths(i,removed),border=paths(i,rim);if(!matte||!border)continue;records.push({index:i,pixel:pending.get(i).pixel,certificate:'detached-exposed-component-between-source-paper-and-owned-rim',priorColorRejection:pending.get(i).reason,componentPixels:component.length,matteWitness:matte,rimWitness:border,sourceMeasuredDistanceBound:q.rimWidthBound,coherentCityPaintAbsent:true});}
  for(const r of records){nextHost[r.index]=0;resolved.add(r.index);nextRemoved.push(r);}if(records.length)certificates.push({componentPixels:component.length,matteWitnessCount:matteWitnesses.length,rimWitnessCount:rimWitnesses.length,records});
 }
 return{...q,host:nextHost,complement:nextHost.map((v,i)=>+(v&&!q.owner[i])),removedMatte:nextRemoved,deferred:q.deferred.filter(p=>!resolved.has(p.index)),priorColorDeferred:q.deferred,exteriorCertificates:certificates,componentSummaryScope:'strict per-pixel stage before exterior ownership certificates'};
}
module.exports={inspect};

},
"source-protected-matte-ownership.js":function(module,exports,require){
'use strict';const Math=globalThis.Math;
'use strict';
const Variation=require('./source-matte-variation.js');
// Research-only local measured matte palette and two-color rim mixture correction of a rejected host's detached exterior-paper traces.
// Connectivity nominates a region; every changed pixel still needs independent
// exposed-matte or adjacent owned-rim mixture evidence. Paint-bearing regions,
// clipped-window regions, and unexplained pale colors remain untouched.
const median=a=>{const b=a.slice().sort((x,y)=>x-y);return b[b.length>>1];};
function inspect(a,w,h,host,owner,{rimWidthBound}={}){
 if(!Number.isFinite(rimWidthBound)||rimWidthBound<1||rimWidthBound>32)throw Error('Source-measured rim width is required');
 if(a.length!==w*h*4||host.length!==w*h||owner.length!==w*h)throw Error('Invalid source matte ownership input');
 const n=w*h,rgb=i=>[a[4*i],a[4*i+1],a[4*i+2]],paper=i=>{const p=rgb(i);return a[4*i+3]===255&&Math.min(...p)>=190&&Math.max(...p)-Math.min(...p)<=40;};
 const neighbors=(i,diagonal=false)=>{const x=i%w,y=Math.floor(i/w),out=[];for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy||!diagonal&&dx&&dy)continue;const X=x+dx,Y=y+dy;if(X>=0&&Y>=0&&X<w&&Y<h)out.push(Y*w+X);}return out;};
 const exposed=new Uint8Array(n),queue=new Int32Array(n);let count=0;
 for(let i=0;i<n;i++){const x=i%w,y=Math.floor(i/w);if((!x||!y||x===w-1||y===h-1)&&!owner[i]&&paper(i)){exposed[i]=1;queue[count++]=i;}}
 for(let head=0;head<count;head++)for(const j of neighbors(queue[head],true))if(!exposed[j]&&!owner[j]&&paper(j)){exposed[j]=1;queue[count++]=j;}
 const distance=new Uint8Array(n);distance.fill(255);let tail=0;for(let i=0;i<n;i++)if(owner[i]){distance[i]=0;queue[tail++]=i;}for(let head=0;head<tail;head++){const i=queue[head];if(distance[i]>=8)continue;for(const j of neighbors(i,true))if(distance[j]>distance[i]+1){distance[j]=distance[i]+1;queue[tail++]=j;}}
 const seen=new Uint8Array(n),nextHost=Uint8Array.from(host),nextOwner=Uint8Array.from(owner),components=[],removedMatte=[],transferredFringe=[],deferred=[];
 for(let seed=0;seed<n;seed++){
  if(seen[seed]||!host[seed]||owner[seed])continue;
  const pixels=[seed];seen[seed]=1;let clipped=false,paint=false,unexposed=false,adjacentOwner=false;
  for(let k=0;k<pixels.length;k++){const i=pixels[k],x=i%w,y=Math.floor(i/w);clipped||=!x||!y||x===w-1||y===h-1;paint||=!paper(i);unexposed||=!exposed[i];for(const j of neighbors(i,true)){adjacentOwner||=!!owner[j];if(!seen[j]&&host[j]&&!owner[j]){seen[j]=1;pixels.push(j);}}}
  const eligible=!clipped&&!paint&&!unexposed&&adjacentOwner,summary={pixels:pixels.length,eligible,clipped,paint,unexposed,adjacentOwner,removedMatte:0,transferredFringe:0,deferred:0};components.push(summary);if(!eligible)continue;
  const starts=[removedMatte.length,transferredFringe.length,deferred.length],nonMatte=new Set();
  for(const i of pixels){
   const x=i%w,y=Math.floor(i/w),P=rgb(i),outside=[];
   const sampled=new Set([i]);let frontier=[i],samplingDistance=0;
   // Collect complete geodesic distance fronts, so mirrors cannot choose a
   // different subset of tied samples. Only observed exterior paper participates.
   for(let depth=0;depth<=24&&frontier.length;depth++){
    for(const j of frontier)if(!host[j]&&exposed[j]&&distance[j]>=3)outside.push(rgb(j));
    samplingDistance=depth;if(outside.length>=32)break;const next=[];
    for(const j of frontier)for(const k of neighbors(j,true))if(exposed[k]&&!owner[k]&&!sampled.has(k)){sampled.add(k);next.push(k);}frontier=next;
   }
   const fail=reason=>{deferred.push({index:i,pixel:P,reason});summary.deferred++;};
   if(outside.length<8){fail('insufficient-independent-exterior-matte');continue;}
   const lightCore=median(outside.map(p=>Math.min(...p))),backgroundSamples=outside.filter(p=>Math.min(...p)>=lightCore),B=[0,1,2].map(k=>median(backgroundSamples.map(p=>p[k]))),noise=[0,1,2].map(k=>Math.max(4,3*median(backgroundSamples.map(p=>Math.abs(p[k]-B[k])))+2));
   const matteResidual=Math.min(...outside.map(p=>Math.max(...p.map((v,k)=>Math.abs(v-P[k])))));
   if(matteResidual<=4||P.every((v,k)=>Math.abs(v-B[k])<=noise[k]&&noise[k]<=12)){nextHost[i]=0;removedMatte.push({index:i,pixel:P,background:B,noise,matteResidual,independentMatteDistanceAtLeast:3,samplingDistance,matteSamples:outside.length});summary.removedMatte++;continue;}
   nonMatte.add(i);if(noise.some(v=>v>12)){fail('independent-exterior-matte-varies');continue;}
   const adjacent=neighbors(i,true).filter(j=>owner[j]),owned=[...new Set(adjacent.flatMap(j=>[j,...neighbors(j,true).filter(k=>owner[k])]))];
   // The measured stroke width bounds palette access. Every sampled color
   // remains connected inward through the already proven owner's source art.
   for(const j of adjacent){const dx=j%w-x,dy=Math.floor(j/w)-y,d=Math.hypot(dx,dy);for(let t=1;t<=rimWidthBound;t+=.5){const X=Math.round(x+dx/d*t),Y=Math.round(y+dy/d*t),k=Y*w+X;if(X<0||Y<0||X>=w||Y>=h||!owner[k])break;if(!owned.includes(k))owned.push(k);}}
   let best=null;
   for(const j of owned){const F=rgb(j),axis=F.map((v,k)=>v-B[k]),energy=axis.reduce((s,v)=>s+v*v,0);if(energy<80*80)continue;const alpha=P.reduce((s,v,k)=>s+(v-B[k])*axis[k],0)/energy,residual=Math.max(...P.map((v,k)=>Math.abs(v-B[k]-alpha*axis[k])));if(alpha<.02||alpha>.5||residual>12)continue;const q={index:i,sourceNeighbor:j,pixel:P,foreground:F,background:B,alpha,residual,distance:Math.hypot(j%w-x,Math.floor(j/w)-y)};if(!best||q.residual<best.residual)best=q;}
   for(let u=0;u<owned.length;u++)for(let v=u+1;v<owned.length;v++){
    const F=rgb(owned[u]),T=rgb(owned[v]),A=F.map((q,k)=>q-B[k]),C=T.map((q,k)=>q-B[k]),P0=P.map((q,k)=>q-B[k]),dot=(a,b)=>a.reduce((n,q,k)=>n+q*b[k],0),aa=dot(A,A),cc=dot(C,C),ac=dot(A,C),det=aa*cc-ac*ac;if(det<10000)continue;
    const alpha=(dot(P0,A)*cc-dot(P0,C)*ac)/det,beta=(dot(P0,C)*aa-dot(P0,A)*ac)/det,total=alpha+beta;if(alpha<0||beta<0||total<.02||total>.5)continue;const residual=Math.max(...P.map((q,k)=>Math.abs(q-B[k]-alpha*A[k]-beta*C[k])));if(residual>12)continue;
    const q={index:i,sourceNeighbors:[owned[u],owned[v]],pixel:P,foreground:[F,T],background:B,alpha,beta,residual,adjacentOwnedContact:adjacent.length};if(!best||q.residual<best.residual)best=q;
   }
   if(best){nextOwner[i]=1;transferredFringe.push(best);summary.transferredFringe++;}else{const variation=Variation.inspect(P,outside);if(variation.supported){nonMatte.delete(i);nextHost[i]=0;removedMatte.push({index:i,pixel:P,background:B,variation,priorStrictPaletteAndRimRejection:true});summary.removedMatte++;}else fail('pale-color-not-explained-by-adjacent-owned-rim-or-observed-paper-variation');}
  }
  // A coherent visible city stroke away from the other owner's immediate
  // raster edge protects its entire connected component, including edge pixels
  // that could individually fit a mixture with the neighboring black rim.
  const interior=new Set(deferred.slice(starts[2]).map(p=>p.index).filter(i=>distance[i]>1));let paintCore=null;
  for(const i of interior){const x=i%w,y=Math.floor(i/w),P=rgb(i);for(const [dx,dy]of[[1,0],[0,1],[1,1],[1,-1]]){const X0=x-dx,Y0=y-dy,X1=x+dx,Y1=y+dy,j=Y0*w+X0,k=Y1*w+X1;if(X0<0||Y0<0||X1<0||Y1<0||X0>=w||Y0>=h||X1>=w||Y1>=h||!interior.has(j)||!interior.has(k))continue;if([j,k].every(q=>rgb(q).every((v,c)=>Math.abs(v-P[c])<=4))){paintCore=[j,i,k];break;}}if(paintCore)break;}
  if(!paintCore)for(const i of nonMatte){const x=i%w,y=Math.floor(i/w);if(x+1>=w||y+1>=h)continue;const block=[i,i+1,i+w,i+w+1],P=rgb(i);if(block.every(j=>nonMatte.has(j)&&rgb(j).every((v,k)=>Math.abs(v-P[k])<=4))&&block.some(j=>distance[j]>1)){paintCore=block;break;}}
  if(paintCore){for(const i of pixels){nextHost[i]=host[i];nextOwner[i]=owner[i];}removedMatte.length=starts[0];transferredFringe.length=starts[1];deferred.length=starts[2];Object.assign(summary,{eligible:false,paint:true,reason:'coherent-nonmatte-city-interior',paintCore,removedMatte:0,transferredFringe:0,deferred:0});}
 }
 return{rimWidthBound,host:nextHost,owner:nextOwner,complement:nextHost.map((v,i)=>+(v&&!nextOwner[i])),removedMatte,transferredFringe,deferred,components,completeOwnerEligible:false};
}
module.exports={inspect};

},
"source-matte-variation.js":function(module,exports,require){
'use strict';const Math=globalThis.Math;
'use strict';
// A second independent background witness. It measures the color variation of
// observed exterior paper; a flat field cannot excuse a new colored mark.
function inspect(pixel,samples){
 if(!Array.isArray(samples)||samples.length<8)return{supported:false,reason:'insufficient-exterior-variation-samples'};
 const mean=[0,1,2].map(k=>samples.reduce((s,p)=>s+p[k],0)/samples.length),covariance=Array.from({length:3},(_,j)=>Array.from({length:3},(_,k)=>samples.reduce((s,p)=>s+(p[j]-mean[j])*(p[k]-mean[k]),0)/(samples.length-1)));
 // Four channel levels are the existing exact-palette comparison floor.
 // Regularization handles a flat or rank-deficient measured paper field.
 const C=covariance.map((r,j)=>r.map((v,k)=>v+(j===k?16:0))),[a,b,c]=C[0],[d,e,f]=C[1],[g,h,i]=C[2],det=a*(e*i-f*h)-b*(d*i-f*g)+c*(d*h-e*g);
 if(!(det>0))return{supported:false,reason:'singular-background-variation'};
 const inverse=[[e*i-f*h,c*h-b*i,b*f-c*e],[f*g-d*i,a*i-c*g,c*d-a*f],[d*h-e*g,b*g-a*h,a*e-b*d]].map(r=>r.map(v=>v/det)),delta=pixel.map((v,k)=>v-mean[k]),distanceSquared=delta.reduce((s,v,j)=>s+v*inverse[j].reduce((n,q,k)=>n+q*delta[k],0),0);
 return{supported:Number.isFinite(distanceSquared)&&distanceSquared<=9,mean,covariance,regularization:16,distanceSquared,limit:9,samples:samples.length,scope:'Observed connected exterior-paper color variation, not a foreground-layer inversion'};
}
module.exports={inspect};

},
"source-native-proof-record-installed.js":function(module,exports,require){
'use strict';const Math=globalThis.Math;
'use strict';
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),copy=x=>JSON.parse(JSON.stringify(x));
function encode(a){let text='';for(let i=0;i<a.length;i+=8192)text+=String.fromCharCode(...a.subarray(i,i+8192));return btoa(text);}
function decode(text,n){if(!Number.isSafeInteger(n)||n<0||typeof text!=='string'||text.length!==Math.ceil(n/3)*4)return null;try{const s=atob(text);if(s.length!==n)return null;const a=Uint8ClampedArray.from(s,c=>c.charCodeAt(0));return encode(a)===text?a:null;}catch(_){return null;}}
// Source-proof preparation and replay are separate from Reader admission.
// Only exact input bytes enter the one-entry replay cache. Geometry, part order
// and every caller-owned field are compared on every validation call.
function buildEngine({eligible,sourceOwners,discover,captionEvidence,captionSeeds,raster,assemble,extent,trace},receiveInstalled){
 const VERSION='research-native-curved-host-source-v1',METHOD='source-native-curved-host-ownership';let cached=null;
 function commonInput(v){return{version:v.version,method:v.method,analysisWidth:v.analysisWidth,analysisHeight:v.analysisHeight,sourceWidth:v.sourceWidth,sourceHeight:v.sourceHeight,anchors:v.anchors,sourceRGBA:v.sourceRGBA,sourceWindows:v.sourceWindows};}
 function geometry(q,candidate,W,H){const parts=[q.city,q.inset].map(mask=>({extent:extent(mask,W,H),rings:trace(mask,W,H,1)}));if(parts.some(p=>!p.rings))return null;return{retiredIndex:candidate.index,parts,sourcePreservation:q.preservation,nativeUncertainty:q.native.uncoveredArcs};}
 function reconstruct(input){try{const v=copy(input),cw=v.analysisWidth,ch=v.analysisHeight,W=v.sourceWidth,H=v.sourceHeight;if(v.version!==VERSION||v.method!==METHOD||![cw,ch,W,H].every(n=>Number.isSafeInteger(n)&&n>0)||cw>900||ch>900||W*H>24000000||!Array.isArray(v.sourceWindows)||v.sourceWindows.length<1||v.sourceWindows.length>129)return null;const key=JSON.stringify(commonInput(v));if(cached?.key===key)return copy(cached.geometry);if(!eligible(v.anchors))return null;const a=decode(v.sourceRGBA,cw*ch*4);if(!a||!sourceOwners(a,cw,ch,v.anchors))return null;const candidate=discover(a,cw,ch,v.anchors);if(!candidate)return null;const requested=[],sourceMap=new Map();let total=0;for(const p of v.sourceWindows){if(!Array.isArray(p.box)||p.box.length!==4||p.box.some((x,i)=>!Number.isSafeInteger(x)||x<0||x>(i%2?H:W))||p.box[2]<=p.box[0]||p.box[3]<=p.box[1])return null;const n=(p.box[2]-p.box[0])*(p.box[3]-p.box[1]);total+=n;if(n>1000000||total>2000000)return null;const raw=decode(p.rgba,n*4),name=JSON.stringify(p.box);if(!raw||sourceMap.has(name))return null;sourceMap.set(name,raw);}const q=assemble({candidate,prior:v.anchors,canonicalHost:raster(v.anchors[candidate.index]._contours,cw,ch),canonicalCaptionSeeds:captionEvidence(a,cw,ch).seeds,canonicalSize:[cw,ch],sourceSize:[W,H],readWindow:box=>{requested.push(copy(box));return sourceMap.get(JSON.stringify(box));},raster,captionEvidence,captionSeeds});if(!q?.city||!same(requested,v.sourceWindows.map(p=>p.box)))return null;const g=geometry(q,candidate,W,H);if(!g)return null;cached={key,geometry:copy(g)};return g;}catch(_){return null;}}
 function construct(v){const p=v.geometry.parts[v.part],[x,y,X,Y]=p.extent.box,W=v.sourceWidth,H=v.sourceHeight;return{x:x/W,y:y/H,w:(X-x)/W,h:(Y-y)/H,_identitySource:'structural-grid-frame',_geometryOwner:'structural-grid-contours',_geometryType:'native-curved-host-complementary-single',_contours:p.rings.map(r=>r.map(([x,y])=>({x:x/W,y:y/H}))),_structuralGridProof:v};}
 function prepareOwned(input,cw,ch,owners,W,H,readWindow,installed=false){try{if(![cw,ch,W,H].every(n=>Number.isSafeInteger(n)&&n>0)||cw>900||ch>900||W*H>24000000||input?.length!==cw*ch*4)return[];const a=Uint8ClampedArray.from(input),prior=copy(owners);if(!eligible(prior)||!sourceOwners(a,cw,ch,prior))return[];const candidate=discover(a,cw,ch,prior);if(!candidate)return[];const sourceWindows=[],seenWindows=new Set();let totalWindowPixels=0;const q=assemble({candidate,prior,canonicalHost:raster(prior[candidate.index]._contours,cw,ch),canonicalCaptionSeeds:captionEvidence(a,cw,ch).seeds,canonicalSize:[cw,ch],sourceSize:[W,H],readWindow:box=>{if(!Array.isArray(box)||box.length!==4||box.some((x,i)=>!Number.isSafeInteger(x)||x<0||x>(i%2?H:W))||box[2]<=box[0]||box[3]<=box[1])throw Error('Invalid source window');const n=(box[2]-box[0])*(box[3]-box[1]),name=JSON.stringify(box);totalWindowPixels+=n;if(n>1000000||totalWindowPixels>2000000||sourceWindows.length>=129||seenWindows.has(name))throw Error('Source window bounds exceeded');seenWindows.add(name);const current=readWindow(copy(box)),raw=current?Uint8ClampedArray.from(current):null;if(raw?.length!==n*4)throw Error('Invalid current source window');if(raw)sourceWindows.push({box:copy(box),rgba:encode(raw)});return raw;},raster,captionEvidence,captionSeeds});if(!q?.city)return[];const g=geometry(q,candidate,W,H);if(!g)return[];const common={version:VERSION,method:METHOD,analysisWidth:cw,analysisHeight:ch,sourceWidth:W,sourceHeight:H,anchors:installed?prior:copy(prior),sourceRGBA:encode(a),sourceWindows,geometry:installed?copy(g):g};if(!installed)cached={key:JSON.stringify(commonInput(common)),geometry:copy(g)};const children=[0,1].map(part=>construct({...common,part,originalFrames:1,publication:'atomic-complementary-singles'}));if(installed){for(const p of children){freezeOwned(p._structuralGridProof);freezeOwned(p._contours);}return Object.freeze({children:Object.freeze(children),retiredIndex:g.retiredIndex});}return children;}catch(_){return[];}}
 // Only a construction capability held by the installed wrapper reaches this
 // branch. The canonical pixels and anchors were copied before source checks;
 // all frozen evidence below was created here, never supplied by its caller.
 // The mutable top-level child still exposes replacement to the Reader guard.
 function freezeOwned(value){if(value&&typeof value==='object'&&!Object.isFrozen(value)){for(const v of Object.values(value))freezeOwned(v);Object.freeze(value);}return value;}
 function prepare(input,cw,ch,owners,W,H,readWindow){return prepareOwned(input,cw,ch,owners,W,H,readWindow,false);}
 if(receiveInstalled)receiveInstalled((input,cw,ch,owners,W,H,readWindow)=>{const result=prepareOwned(input,cw,ch,owners,W,H,readWindow,true);return result?.children?.length===2?result:null;});
 function validPreparedPanel(p){try{const v=copy(p?._structuralGridProof);if(!v||![0,1].includes(v.part)||v.originalFrames!==1||v.publication!=='atomic-complementary-singles')return false;const g=reconstruct(v);return!!g&&same(g,v.geometry)&&same(construct(v),p);}catch(_){return false;}}
 function validPreparedPair(children,prior){return Array.isArray(children)&&children.length===2&&children.every((p,k)=>validPreparedPanel(p)&&p._structuralGridProof.part===k&&same(p._structuralGridProof.anchors,prior))&&same(commonInput(children[0]._structuralGridProof),commonInput(children[1]._structuralGridProof))&&same(children[0]._structuralGridProof.geometry,children[1]._structuralGridProof.geometry);}
 function replayPrepared(a,cw,ch,W,H,readWindow,children,prior){const snapshot=JSON.stringify([children,prior]);if(!validPreparedPair(children,prior))return false;const v=copy(children[0]._structuralGridProof);if(!same([cw,ch,W,H],[v.analysisWidth,v.analysisHeight,v.sourceWidth,v.sourceHeight])||encode(a)!==v.sourceRGBA)return false;return v.sourceWindows.every(p=>{const current=readWindow(copy(p.box));return current?.length===(p.box[2]-p.box[0])*(p.box[3]-p.box[1])*4&&encode(current)===p.rgba;})&&snapshot===JSON.stringify([children,prior]);}
 return{VERSION,METHOD,prepare,validPreparedPanel,validPreparedPair,replayPrepared,construct,reconstruct,scope:'source-authenticated research proposals; independent ownership review and Reader admission remain separate'};
}
function createEngine(options){return buildEngine(options);}
// The ordinary engine object exposes no capability to mint installed evidence.
// Calling public helpers therefore cannot register an installed generation.
function createInstalledEngine(options){let prepareInstalled;const engine=buildEngine(options,fn=>{prepareInstalled=fn;});return Object.freeze({engine,prepareInstalled});}
module.exports={createEngine,createInstalledEngine,encode,decode};

}
},cache={};function require(id){id=id.replace(/^\.\//,'');if(cache[id])return cache[id].exports;if(!factories[id])throw Error('Unknown native source module: '+id);const module={exports:{}};cache[id]=module;factories[id](module,module.exports,require);return module.exports;}return require("native-source-runtime-installed.js");})();
