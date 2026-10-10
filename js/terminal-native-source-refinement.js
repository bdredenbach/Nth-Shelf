/* Isolated reconstructed native pipeline. Static local modules only.
 * No test-only authority seam, file lookup, saved map or image identity rules. */
const TerminalNativeSourceRefinement=(()=>{'use strict';const definitions=Object.create(null),cache=Object.create(null);
definitions["terminal-orthogonal-compose.js"]=function(module,exports,require){
/* Isolated reconstruction candidate. Pure geometry, no source authority.
 * Exact orthogonal analysis edges plus source-certified native pixel runs.
 * No canvas Path2D boolean extension or full native raster is required. */
const TerminalOrthogonalCompose=(()=>{
'use strict';
const LIMIT={points:16384,runs:32768,events:65536,work:12000000};
const finite=Number.isFinite, key=p=>p[0]+','+p[1];
function canonical(n){return Object.is(n,-0)?0:n;}
function merge(a){const out=[];for(const [l,r] of a.slice().sort((p,q)=>p[0]-q[0]||p[1]-q[1])){if(l>=r)continue;const last=out.at(-1);if(last&&l<=last[1])last[1]=Math.max(last[1],r);else out.push([l,r]);}return out;}
function subtract(a,b){const out=[];let j=0;for(const [l,r] of a){let at=l;while(j<b.length&&b[j][1]<=at)j++;for(let k=j;k<b.length&&b[k][0]<r;k++){if(b[k][0]>at)out.push([at,Math.min(r,b[k][0])]);at=Math.max(at,b[k][1]);if(at>=r)break;}if(at<r)out.push([at,r]);}return out;}
function compose({contours,width:w,height:h,runs}){
 if(!Number.isInteger(w)||!Number.isInteger(h)||w<1||h<1||w>12000||h>12000||w*h>24000000||!Array.isArray(contours)||!contours.length||!Array.isArray(runs)||runs.length>LIMIT.runs)throw Error('Unbounded orthogonal input');
 const events=new Map(),event=y=>{y=canonical(y);if(!events.has(y))events.set(y,{base:[],add:[],remove:[]});return events.get(y);};let count=0;
 for(const ring of contours){if(!Array.isArray(ring)||ring.length<3||(count+=ring.length)>LIMIT.points)throw Error('Invalid contour size');const p=ring.map(p=>{if(!p||Object.keys(p).sort().join(',')!=='x,y'||!finite(p.x)||!finite(p.y)||p.x<0||p.x>1||p.y<0||p.y>1)throw Error('Invalid contour point');return[canonical(p.x*w),canonical(p.y*h)];});for(let i=0,j=p.length-1;i<p.length;j=i++){const a=p[j],b=p[i];if(a[0]!==b[0]&&a[1]!==b[1])throw Error('Nonorthogonal analysis contour');if(a[0]===b[0]&&a[1]!==b[1]){event(Math.min(a[1],b[1])).base.push(a[0]);event(Math.max(a[1],b[1])).base.push(a[0]);}}}
 let prior=null;for(let i=0;i<runs.length;i++){const r=runs[i];if(!Array.isArray(r)||r.length!==4||!r.every(Number.isInteger)||r[0]<0||r[0]>=h||r[1]<0||r[2]>w||r[1]>=r[2]||![0,1].includes(r[3])||prior&&(r[0]<prior[0]||r[0]===prior[0]&&(r[1]<prior[2]||r[1]===prior[2]&&r[3]===prior[3])))throw Error('Noncanonical native runs');event(r[0]).add.push(i);event(r[0]+1).remove.push(i);prior=r;}
 if(events.size>LIMIT.events)throw Error('Too many contour events');const ys=[...events.keys()].sort((a,b)=>a-b),activeBase=new Set(),activeRuns=new Set(),edges=[],emit=(a,b)=>{if(a[0]!==b[0]||a[1]!==b[1])edges.push({a,b,dir:a[1]===b[1]?(b[0]>a[0]?0:2):(b[1]>a[1]?1:3)});};let previous=[],work=0;
 for(let k=0;k<ys.length;k++){const y=ys[k],e=events.get(y);for(const x of e.base){if(activeBase.has(x))activeBase.delete(x);else activeBase.add(x);}for(const i of e.remove)activeRuns.delete(i);for(const i of e.add)activeRuns.add(i);const xs=[...activeBase].sort((a,b)=>a-b);if(xs.length%2)throw Error('Unclosed orthogonal boundary');let current=[];for(let j=0;j<xs.length;j+=2)current.push([xs[j],xs[j+1]]);const patches=[...activeRuns].map(i=>runs[i]);work+=xs.length+patches.length+previous.length;if(work>LIMIT.work)throw Error('Contour work budget exceeded');current=merge(subtract(current,merge(patches.filter(r=>!r[3]).map(r=>r.slice(1,3)))).concat(patches.filter(r=>r[3]).map(r=>r.slice(1,3))));for(const[a,b]of subtract(current,previous))emit([a,y],[b,y]);for(const[a,b]of subtract(previous,current))emit([b,y],[a,y]);if(k+1<ys.length)for(const[a,b]of current){emit([a,ys[k+1]],[a,y]);emit([b,y],[b,ys[k+1]]);}previous=current;}
 if(previous.length)throw Error('Unclosed final slab');const outgoing=new Map();edges.forEach((e,i)=>{const k=key(e.a);if(!outgoing.has(k))outgoing.set(k,[]);outgoing.get(k).push(i);});const used=new Set(),out=[];for(let i=0;i<edges.length;i++){if(used.has(i))continue;let at=i,points=[];for(let step=0;step<=edges.length;step++){if(used.has(at))throw Error('Ambiguous boundary graph');const e=edges[at];used.add(at);points.push(e.a);if(key(e.b)===key(edges[i].a))break;const next=(outgoing.get(key(e.b))||[]).filter(n=>!used.has(n)).sort((a,b)=>{const rank=d=>[1,0,3,2].indexOf((d-e.dir+4)%4);return rank(edges[a].dir)-rank(edges[b].dir);});if(!next.length)throw Error('Open boundary graph');at=next[0];if(step===edges.length)throw Error('Boundary traversal budget');}let compact=points.filter((p,j)=>{const a=points[(j+points.length-1)%points.length],b=points[(j+1)%points.length];return !(a[0]===p[0]&&p[0]===b[0]||a[1]===p[1]&&p[1]===b[1]);});if(compact.length<4)throw Error('Degenerate output contour');out.push(compact.map(([x,y])=>({x:x/w,y:y/h})));}
 if(out.flat().length>LIMIT.points)throw Error('Output point budget');return{contours:out,work,edges:edges.length};
}
return{compose,LIMIT};})();
if(typeof module!=='undefined')module.exports=TerminalOrthogonalCompose;

};
definitions["native/terminal-native-edge-kernel.js"]=function(module,exports,require){
/* Isolated orientation-neutral source transition kernel. No page identity,
 * fixture truth, text, or prior map lookup occurs here. */
'use strict';
const TerminalNativeEdgeKernel=(()=>{
function classify(a,i){const r=a[i],g=a[i+1],b=a[i+2],mx=Math.max(r,g,b),mn=Math.min(r,g,b);return mx>=250&&mx-mn<=20?0:mx<110&&mx-mn<60?1:mx<250&&mx-mn<50?2:3;}
function mapping(w,h,axis,sign){if(![0,1].includes(axis)||![1,-1].includes(sign))throw Error('Invalid edge orientation');const U=axis?h:w,V=axis?w:h;return{U,V,xy:(u,v)=>{const n=sign===1?v:V-1-v;return axis?[n,u]:[u,n];},point:(u,v)=>{const n=sign===1?v:V-v;return axis?[n,u]:[u,n];}};}

function fitTransition({u,core,hi,maxAA,map,rgba,w,classes,lo,start}){
 const length=5;if(start+length-1>hi)return null;
 const rgb=v=>{const[x,y]=map.xy(u,v),i=(y*w+x)*4;return[rgba[i],rgba[i+1],rgba[i+2]];},sample=Array.from({length},(_,i)=>rgb(start+i));
 if(sample.some((_,i)=>classes[start+i-lo]===1))return null;
 const C=rgb(core),mean=[0,1,2].map(c=>sample.reduce((n,p)=>n+p[c],0)/length),slope=[0,1,2].map(c=>sample.reduce((n,p,i)=>n+(i-2)*p[c],0)/10),error=Math.max(...sample.flatMap((p,i)=>p.map((v,c)=>Math.abs(v-mean[c]-slope[c]*(i-2))))),contrast=Math.max(...mean.map((v,i)=>Math.abs(v-C[i]))),noise=Math.max(1,error+1);
 if(contrast<32||error>contrast*.1||Math.max(...slope.map(Math.abs))>contrast*.12)return null;
 let outer=core,lastAlpha=1,ended=false;
 for(let v=core+1;v<=Math.min(hi,core+maxAA+1);v++){
  const P=rgb(v),B=mean.map((a,c)=>Math.max(0,Math.min(255,a+slope[c]*(v-start-2)))),D=B.map((a,c)=>a-C[c]),delta=B.map((a,c)=>a-P[c]),norm=D.reduce((a,b)=>a+b*b,0),alpha=delta.reduce((a,b,c)=>a+b*D[c],0)/norm,residual=Math.max(...delta.map((d,c)=>Math.abs(d-alpha*D[c])));
  if(Math.max(...delta.map(Math.abs))<=noise||alpha<=0){ended=true;break;}
  if(alpha>1||alpha>lastAlpha+noise/contrast||residual>noise+1)return null;
  outer=v;lastAlpha=alpha;
 }
 if(!ended)return null;
 return{outer,values:[u,core,start,length,...mean,...slope,error,outer]};
}
function transitionProfile(options){
 const near=fitTransition({...options,start:options.core+2}),far=fitTransition({...options,start:options.core+options.maxAA+1});
 // Both local source windows must support exactly the same boundary. A distant
 // fitted color alone can mistake changing scene texture for faint rim ink.
 if(!near||!far||near.outer!==far.outer)return null;
 return{outer:near.outer,values:[...near.values,...far.values.slice(2)]};
}
function refine({rgba,width:w,height:h,axis,sign,bands,isOwned,maxAA,exterior='paper'}){if(!Number.isInteger(w)||!Number.isInteger(h)||w<1||h<1||w>12000||h>12000||w*h>24000000||!(rgba instanceof Uint8Array||rgba instanceof Uint8ClampedArray)||rgba.length!==w*h*4||typeof isOwned!=='function')throw Error('Invalid native source');const map=mapping(w,h,axis,sign),{U,V}=map;if(!Number.isInteger(maxAA)||maxAA<1||maxAA>64||!['paper','contrast'].includes(exterior)||!Array.isArray(bands)||bands.length>U)throw Error('Invalid source edge request');const kinds=new Map(),seeds=[],sourceBytes=[],out=[],unresolved=[];let prior=-1;
for(const band of bands){if(!Array.isArray(band)||![3,5].includes(band.length))throw Error('Invalid source band');const[u,lo,hi]=band;if(![u,lo,hi].every(Number.isInteger)||u<=prior||u<0||u>=U||lo<0||hi>=V||hi<lo||hi-lo>=64)throw Error('Unbounded source band');prior=u;const classes=[];for(let v=lo;v<=hi;v++){const[x,y]=map.xy(u,v),i=(y*w+x)*4;if(rgba[i+3]!==255)throw Error('Nonopaque source band');const kind=classify(rgba,i);classes.push(kind);sourceBytes.push(x&255,x>>8,y&255,y>>8,...rgba.subarray(i,i+4));if(kind===1||kind===2){const key=v*U+u;kinds.set(key,kind);if(kind===1&&isOwned(...map.point(u+.5,v+.5)))seeds.push(key);}}out.push({u,lo,hi,classes,seed:band[3],maxCore:band[4]});}
const connected=new Set(seeds),queue=[...connected];for(let at=0;at<queue.length;at++){const key=queue[at],u=key%U,v=Math.floor(key/U);for(let dv=-1;dv<=1;dv++)for(let du=-1;du<=1;du++){if(!du&&!dv||u+du<0||u+du>=U||v+dv<0||v+dv>=V)continue;const next=key+dv*U+du;if(kinds.has(next)&&!connected.has(next)){connected.add(next);queue.push(next);}}}
const records=[],modes=[],profiles=[];for(const{u,lo,hi,classes,seed,maxCore}of out){let first=-1,core=-1,outer=-1,mode='replace';
if(exterior==='contrast'){
 if(!Number.isInteger(seed)||!Number.isInteger(maxCore)||seed<lo||seed>hi||maxCore<1||maxCore>64||classes[seed-lo]!==1||!isOwned(...map.point(u+.5,seed+.5))){unresolved.push([u,'no-owned-inner-stroke']);continue;}
 first=core=seed;while(first>lo&&classes[first-lo-1]===1)first--;while(core<hi&&classes[core-lo+1]===1)core++;
 if(first===lo||core===hi||core-first+1>maxCore){unresolved.push([u,'merged-or-unbounded-core']);continue;}
 outer=core;mode='core-only';
 const profile=transitionProfile({u,core,hi,maxAA,map,rgba,w,classes,lo});
 if(profile){outer=profile.outer;mode='replace';profiles.push(profile.values);}
 const packed=new Array(Math.ceil(classes.length/4)).fill(0);classes.forEach((c,i)=>packed[i>>2]|=c<<((i&3)*2));records.push([u,lo,hi,first,core,outer,...packed]);if(mode==='core-only')unresolved.push([u,'ambiguous-colored-transition']);
 // Record the source-derived transition disposition separately. The caller
 // must retain existing geometry outside a core-only extension.
 modes.push([u,mode]);
 continue;
}
for(let v=lo;v<=hi;v++)if(connected.has(v*U+u)){if(first<0)first=v;outer=v;if(kinds.get(v*U+u)===1)core=v;}if(core<0||outer===hi||outer-core>maxAA){unresolved.push([u,'unbounded-or-disconnected']);continue;}const next=classes[outer-lo+1];if(next!==0){unresolved.push([u,'no-exposed-transition']);continue;}const profile=transitionProfile({u,core,hi,maxAA,map,rgba,w,classes,lo});if(profile&&profile.outer>=outer){outer=profile.outer;profiles.push(profile.values);}const packed=new Array(Math.ceil(classes.length/4)).fill(0);classes.forEach((c,i)=>packed[i>>2]|=c<<((i&3)*2));records.push([u,lo,hi,first,core,outer,...packed]);}
return{axis,sign,exterior,records,modes,profiles,unresolved,sourceBytes};}
return{classify,mapping,refine};})();
if(typeof module!=='undefined')module.exports=TerminalNativeEdgeKernel;

};
definitions["native/terminal-native-local-exterior.js"]=function(module,exports,require){
/* Bounded local exterior witness over a source-calibrated dark rim.
 * Produces exclusions only. It cannot add ink or authorize a source. */
'use strict';
const E=require('./terminal-native-edge-kernel.js');
const median=a=>a.slice().sort((a,b)=>a-b)[a.length>>1];
function observeLocalExterior({rgba,width:w,height:h,axis,sign,bands,maxAA,aaWitnesses=null,aaRadius=0}){
 if(!Number.isInteger(w)||!Number.isInteger(h)||w<1||h<1||w>12000||h>12000||w*h>24000000||!(rgba instanceof Uint8Array||rgba instanceof Uint8ClampedArray)||rgba.length!==w*h*4||!Array.isArray(bands)||!Number.isInteger(maxAA)||maxAA<1||maxAA>16)throw Error('Invalid local exterior witness');
 const map=E.mapping(w,h,axis,sign),{U,V}=map,records=[],unresolved=[];let prior=-1;if(aaWitnesses!==null&&(!Number.isFinite(aaRadius)||aaRadius<=0||aaRadius>256||!Array.isArray(aaWitnesses)||aaWitnesses.length>U||aaWitnesses.some((r,i)=>!Array.isArray(r)||r.length!==2||!r.every(Number.isInteger)||r[0]<0||r[0]>=U||r[1]<0||r[1]>maxAA||i&&r[0]<=aaWitnesses[i-1][0])))throw Error('Invalid local AA witnesses');
 const rgb=(u,v)=>{const[x,y]=map.xy(u,v),i=4*(y*w+x);if(rgba[i+3]!==255)throw Error('Nonopaque local rim');return[rgba[i],rgba[i+1],rgba[i+2]];};
 for(const band of bands){if(!Array.isArray(band)||band.length!==5||!band.every(Number.isInteger))throw Error('Invalid local rim band');const[u,lo,hi,seed,maxCore]=band;if(u<=prior||u<0||u>=U||lo<0||hi>=V||lo>seed-2||seed+2>hi||hi-lo>=64||maxCore<1||maxCore>64)throw Error('Unbounded local rim band');prior=u;
 const samples=[-2,-1,0,1,2].map(d=>rgb(u,seed+d)),C=[0,1,2].map(k=>median(samples.map(p=>p[k]))),inkNoise=Math.max(3,...samples.flatMap(p=>p.map((a,k)=>Math.abs(a-C[k]))));if(Math.max(...C)>=110||Math.max(...C)-Math.min(...C)>=60||inkNoise>16){unresolved.push([u,'unstable-seed-ink']);continue;}
 let localAA=null;if(aaWitnesses){const near=aaWitnesses.filter(r=>Math.abs(r[0]-u)<=aaRadius);localAA=near.length>=3?Math.max(...near.map(r=>r[1])):null;}let result=null;
 for(let b=seed+2;b+1<=Math.min(hi,seed+maxCore+maxAA);b++){
  const pair=[rgb(u,b),rgb(u,b+1)],B=C.map((_,k)=>(pair[0][k]+pair[1][k])/2),D=B.map((a,k)=>a-C[k]),contrast=Math.max(...D.map(Math.abs)),noise=Math.max(inkNoise,2,...pair[0].map((a,k)=>Math.abs(a-pair[1][k])/2+2));
  if(contrast<24||noise>contrast*.2)continue;
  // A weak collinear fluctuation may be ordinary textured paint. Measure
  // its channel envelope on this same observed exterior, without expanding
  // the rim. Constant exteriors retain even a one-unit faint AA difference.
  const paint=Array.from({length:Math.min(5,hi-b+1)},(_,i)=>rgb(u,b+i)),paintMin=C.map((_,k)=>Math.min(...paint.map(p=>p[k]))),paintMax=C.map((_,k)=>Math.max(...paint.map(p=>p[k]))),stablePaint=paint.length===5&&Math.max(...paintMax.map((v,k)=>v-paintMin[k]))<=Math.max(2,contrast*.15);
  const norm=D.reduce((n,a)=>n+a*a,0);if(pair[1].reduce((n,a,k)=>n+(a-pair[0][k])*D[k],0)/norm>1/contrast)continue;let last=0,outer=b-1,core=-1,valid=true,ended=false;
  for(let v=b-1;v>=Math.max(seed,b-maxAA-3);v--){const P=rgb(u,v),delta=B.map((a,k)=>a-P[k]),alpha=delta.reduce((n,a,k)=>n+a*D[k],0)/norm,residual=Math.max(...delta.map((a,k)=>Math.abs(a-alpha*D[k]))),nearInk=Math.max(...P.map((a,k)=>a-C[k]))<=Math.min(16,Math.max(noise,contrast*.15));
   if(nearInk){core=v;ended=true;break;}
   if(residual>Math.max(noise+1,contrast*.1)||alpha<-.05||alpha>1.05||alpha+noise/contrast<last){valid=false;break;}
   if(stablePaint&&P.every((a,k)=>a>=paintMin[k]&&a<=paintMax[k])||Math.max(...delta.map(Math.abs))<=.5||(alpha<=.15&&residual>1))outer=v-1;else last=alpha;
  }
  if(!valid||!ended||b-core>maxAA+2||outer<core)continue;
  if(core<=seed||Math.max(...rgb(u,core-1).map((a,k)=>a-C[k]))>Math.min(16,Math.max(noise,contrast*.15)))continue;
  result=[u,outer,hi,core,b,contrast,noise];break;
 }
 if(localAA!==null){if(!Number.isInteger(localAA)||localAA<0||localAA>maxAA)throw Error('Invalid measured antialias span');const span=Math.max(1,localAA);let core=seed;while(core<Math.min(hi-4,seed+maxCore)&&Math.max(...rgb(u,core+1).map((a,k)=>a-C[k]))<=Math.max(inkNoise,16))core++;if(core<Math.min(hi-4,seed+maxCore)&&core>=seed+2){const sample=Array.from({length:Math.min(maxAA+2,hi-core)},(_,i)=>rgb(u,core+1+i)),strong=sample.slice(0,span+3).reduce((a,p)=>Math.max(...p.map((v,k)=>v-C[k]))>Math.max(...a.map((v,k)=>v-C[k]))?p:a,C),D=strong.map((a,k)=>a-C[k]),contrast=Math.max(...D),norm=D.reduce((n,a)=>n+a*a,0);let mixed=0;if(contrast>=24){for(const P of sample){const alpha=1-P.reduce((n,a,k)=>n+(a-C[k])*D[k],0)/norm;if(alpha<=.2)break;if(alpha<.8)mixed++;}if(mixed<=span){const outer=core+span;if(!result||result[1]>outer)result=[u,outer,hi,core,outer+1,contrast,inkNoise,'measured-same-rim-aa-bound'];}}}}
 if(result)records.push(result);else unresolved.push([u,'no-local-exterior-transition']);
 }
 return{axis,sign,records,unresolved};
}
module.exports={observeLocalExterior};

};
definitions["native/terminal-native-core-band.js"]=function(module,exports,require){
/* Native dark core certification along one already source-established rim.
 * Both faces must be exposed and agree with adjacent observations. */
'use strict';
const E=require('./terminal-native-edge-kernel.js');
const median=a=>a.slice().sort((a,b)=>a-b)[a.length>>1];
function observeCoreBand({rgba,width:w,height:h,axis,sign,bands,strokeWidth}){
 if(!Number.isInteger(w)||!Number.isInteger(h)||w<1||h<1||w>12000||h>12000||w*h>24000000||!(rgba instanceof Uint8Array||rgba instanceof Uint8ClampedArray)||rgba.length!==w*h*4||!Number.isFinite(strokeWidth)||strokeWidth<2||strokeWidth>48||!Array.isArray(bands))throw Error('Invalid bounded core observation');
 const map=E.mapping(w,h,axis,sign),candidates=[],outerOnly=[],unresolved=[],rgb=(u,v)=>{const[x,y]=map.xy(u,v),i=4*(y*w+x);if(rgba[i+3]!==255)throw Error('Nonopaque rim core');return[rgba[i],rgba[i+1],rgba[i+2]];};
 let previous=-1;for(const band of bands){if(!Array.isArray(band)||band.length!==5||!band.every(Number.isInteger))throw Error('Invalid core band');const[u,lo,hi,seed]=band;if(u<=previous||u<0||u>=map.U||lo<0||hi>=map.V||hi-lo>=64||seed-2<lo||seed+2>hi)throw Error('Unbounded core band');previous=u;const C=[0,1,2].map(k=>median([-2,-1,0,1,2].map(d=>rgb(u,seed+d)[k]))),near=v=>Math.max(...rgb(u,v).map((a,k)=>a-C[k]))<=16;
  if(Math.max(...C)>=75||![-2,-1,0,1,2].every(d=>near(seed+d))){unresolved.push([u,'unstable-core-seed']);continue;}
  let a=seed,b=seed;while(a>lo&&near(a-1))a--;while(b<hi&&near(b+1))b++;
  const width=b-a+1;if(b<hi&&b-seed<=strokeWidth&&b>=seed+2)outerOnly.push({u,a:seed,b,width,seed});if(a===lo||b===hi||width<strokeWidth*.65||width>strokeWidth*1.5){unresolved.push([u,'unbounded-or-merged-core']);continue;}
  candidates.push({u,a,b,width});
 }
 if(candidates.length<7)return{records:[],unresolved};
 const typical=median(candidates.map(r=>r.width)),agreement=Math.max(1,strokeWidth*.16),radius=Math.ceil(strokeWidth*2),records=[];
 for(const q of candidates){if(Math.abs(q.width-typical)>agreement){unresolved.push([q.u,'atypical-same-rim-width']);continue;}
  const near=candidates.filter(a=>a!==q&&Math.abs(a.u-q.u)<=radius&&Math.abs(a.width-q.width)<=agreement),left=near.filter(a=>a.u<q.u).sort((a,b)=>b.u-a.u).slice(0,2),right=near.filter(a=>a.u>q.u).sort((a,b)=>a.u-b.u).slice(0,2);
  if(left.length<2||right.length<2){unresolved.push([q.u,'missing-core-neighbors']);continue;}
  const group=[...left,q,...right],mu=group.reduce((n,a)=>n+a.u,0)/5,mv=group.reduce((n,a)=>n+a.b,0)/5,den=group.reduce((n,a)=>n+(a.u-mu)**2,0),slope=group.reduce((n,a)=>n+(a.u-mu)*(a.b-mv),0)/den,error=Math.max(...group.map(a=>Math.abs(a.b-mv-slope*(a.u-mu))));
  if(Math.abs(slope)>.5||error>1){unresolved.push([q.u,'unstable-core-boundary']);continue;}
  records.push([q.u,q.a,q.b,q.width,error]);
 }
 const certified=records.slice(),used=new Set(records.map(r=>r[0]));for(const q of outerOnly){if(used.has(q.u))continue;const left=certified.filter(r=>r[0]<q.u&&q.u-r[0]<=radius).slice(-2),right=certified.filter(r=>r[0]>q.u&&r[0]-q.u<=radius).slice(0,2);if(left.length<2||right.length<2)continue;const l=left.at(-1),r=right[0],slope=(r[2]-l[2])/(r[0]-l[0]),pred=l[2]+slope*(q.u-l[0]);if(Math.abs(slope)>.5||Math.abs(q.b-pred)>1||Math.abs((left[1][2]-left[0][2])/(left[1][0]-left[0][0])-slope)>.5||Math.abs((right[1][2]-right[0][2])/(right[1][0]-right[0][0])-slope)>.5)continue;records.push([q.u,q.seed,q.b,q.b-q.seed+1,Math.abs(q.b-pred),'source-observed-outer-between-certified-faces']);}records.sort((a,b)=>a[0]-b[0]);return{records,unresolved,typicalWidth:typical};
}
module.exports={observeCoreBand};

};
definitions["native/terminal-native-frame-observations.js"]=function(module,exports,require){
/* Pure source-derived frame observations factored from the preserved isolated kernels.
 * Returns geometry evidence only; never issues a source/admission lease. */
'use strict';
const Edge=require('./terminal-native-edge-kernel.js'),Local=require('./terminal-native-local-exterior.js'),Core=require('./terminal-native-core-band.js');
  function insideBase(contours, x, y, w, h) {
    let inside = false;
    const X = x / w, Y = y / h;
    for (const ring of contours) for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const a = ring[i], b = ring[j];
      if ((a.y > Y) !== (b.y > Y) && X < (b.x - a.x) * (Y - a.y) / (b.y - a.y) + a.x) inside = !inside;
    }
    return inside;
  }
  function classify(a, i) {
    const r = a[i], g = a[i + 1], b = a[i + 2];
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    if (mx >= 250 && mx - mn <= 20) return 0;
    if (mx < 110 && mx - mn < 60) return 1;
    if (mx < 250 && mx - mn < 50) return 2;
    return 3;
  }
  function bottomOfBase(contours, x, w, h) {
    const X = x / w, values = [];
    for (const ring of contours) for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const a = ring[i], b = ring[j];
      if ((a.x > X) !== (b.x > X)) values.push((a.y + (X - a.x) * (b.y - a.y) / (b.x - a.x)) * h);
    }
    return values.length ? Math.max(...values) : null;
  }
  function pack(classes) {
    const bytes = new Array(Math.ceil(classes.length / 4)).fill(0);
    classes.forEach((v, i) => { bytes[i >> 2] |= v << ((i & 3) * 2); });
    return bytes;
  }

function inside(cs,x,y,w,h){let own=false;const X=x/w,Y=y/h;for(const r of cs)for(let i=0,j=r.length-1;i<r.length;j=i++){const a=r[i],b=r[j];if((a.y>Y)!==(b.y>Y)&&X<(b.x-a.x)*(Y-a.y)/(b.y-a.y)+a.x)own=!own;}return own;}
function ray(cs,u,w,h,axis,sign){const q=u/(axis?h:w),xs=[];for(const r of cs)for(let i=0,j=r.length-1;i<r.length;j=i++){const a=r[i],b=r[j],au=axis?a.y:a.x,bu=axis?b.y:b.x,av=axis?a.x:a.y,bv=axis?b.x:b.y;if((au>q)!==(bu>q))xs.push((av+(q-au)*(bv-av)/(bu-au))*(axis?w:h));}return xs.length?(sign===1?Math.max(...xs):Math.min(...xs)):null;}
function sourceBands(p,w,h,axis,sign){const proof=p._structuralGridProof,g=proof.geometry.first,sx=w/proof.analysisWidth,sy=h/proof.analysisHeight,U=axis?h:w,V=axis?w:h,footprint=Math.ceil(axis?sx:sy),bands=[],excluded=[];
const begin=axis?Math.floor(g.top*sy):Math.floor(g.runs[proof.index][0]*sx),end=axis?Math.ceil((g.bottomLevel+g.outerReach)*sy):Math.ceil(g.runs[proof.index][1]*sx);
for(let u=Math.max(0,begin);u<Math.min(U,end);u++){const values=[];for(const du of[-Math.ceil(axis?sy:sx),0,Math.ceil(axis?sy:sx)]){const b=ray(p._contours,u+.5+du,w,h,axis,sign);if(b!==null)values.push(sign===1?b:V-b);}if(!values.length)continue;const lo=Math.max(0,Math.floor(Math.min(...values))-footprint-1),hi=Math.min(V-1,Math.ceil(Math.max(...values))+footprint+1);if(hi-lo>=64){excluded.push([u,'corner-or-wide-band']);continue;}const phys0=sign===1?lo:V-1-hi,phys1=sign===1?hi:V-1-lo;const box=axis?[phys0,u,phys1+1,u+1]:[u,phys0,u+1,phys1+1];if(g.ownership.some(o=>box[0]<o.box[2]*sx&&box[2]>o.box[0]*sx&&box[1]<o.box[3]*sy&&box[3]>o.box[1]*sy)){excluded.push([u,'owned-dialogue']);continue;}bands.push([u,lo,hi]);}
return{bands,excluded,maxAA:footprint+1};}
function buildPatches(edges,w,h){const patch=new Map(),conflicted=new Set();for(const edge of edges){const map=Edge.mapping(w,h,edge.axis,edge.sign),modes=new Map(edge.modes);for(const r of edge.records){if(modes.get(r[0])==='core-only')continue;for(let v=r[3];v<=r[2];v++){const[x,y]=map.xy(r[0],v),key=y*w+x,owned=+(v<=r[5]);if(conflicted.has(key))continue;if(patch.has(key)&&patch.get(key)!==owned){conflicted.add(key);patch.delete(key);}else patch.set(key,owned);}}for(const r of edge.nativeCores||[])for(let v=r[1];v<=r[2];v++){const[x,y]=map.xy(r[0],v),key=y*w+x;if(conflicted.has(key))continue;if(patch.has(key)&&patch.get(key)!==1){conflicted.add(key);patch.delete(key);}else patch.set(key,1);}for(const r of edge.localExclusions||[])for(let v=r[1]+1;v<=r[2];v++){const[x,y]=map.xy(r[0],v),key=y*w+x;if(conflicted.has(key))continue;if(patch.has(key)&&patch.get(key)!==0){conflicted.add(key);patch.delete(key);}else patch.set(key,0);}}const sorted=[...patch].sort((a,b)=>a[0]-b[0]),runs=[];for(const[key,owned]of sorted){const y=Math.floor(key/w),x=key%w,last=runs[runs.length-1];if(last&&last[0]===y&&last[2]===x&&last[3]===owned)last[2]++;else runs.push([y,x,x+1,owned]);}return{runs,conflicts:[...conflicted].sort((a,b)=>a-b).map(key=>[key%w,Math.floor(key/w)])};}

function deriveFrame({rgba,width:w,height:h,panels}){
    const owners = [];
    for (let k = 0; k < panels.length; k++) {
      const p = panels[k], proof = p._structuralGridProof;
      const aw = proof.analysisWidth, ah = proof.analysisHeight, g = proof.geometry.first;
      const run = g.runs[proof.index], sx = w / aw, sy = h / ah;
      if (!(Number.isInteger(aw) && Number.isInteger(ah) && aw > 0 && ah > 0) || proof.index !== k || !g || !Array.isArray(g.runs) || g.runs.length !== 2) throw Error('Invalid analysis boundary interface');
      const footprintX = Math.ceil(sx), footprintY = Math.ceil(sy);
      if (footprintX > 64 || footprintY > 64) throw Error('Native sampling footprint exceeds bounded witness');
      const x0 = Math.max(0, Math.floor(run[0] * sx) - footprintX), x1 = Math.min(w, Math.ceil(run[1] * sx) + footprintX);
      const records = [], unresolved = [], bands = [], pixels = new Map(), seeds = [];
      // At a rounded corner a vertical contour ray may abruptly switch from
      // the lower rim to a side or speech contour. Search only within the
      // observed side stroke width plus one resampling footprint. This grows
      // the evidence band, never the accepted ownership mask.
      const rails = proof.index === 0 ? [g.leftRail, g.innerLeftRail] : [g.innerRightRail, g.rightRail];
      const widths = rails.flatMap(r => r.positions.map((v, i) => r.ends[i] - v)).filter(v => v > 0).sort((a,b) => a-b);
      if (!widths.length || !Number.isFinite(g.outerReach) || !Number.isFinite(g.bottomLevel)) throw Error('Missing same-rim sampling bounds');
      const lateralReach = footprintX + Math.ceil(widths[Math.floor(widths.length / 2)] * sx);
      if (lateralReach > 64) throw Error('Same-rim lateral evidence exceeds bounded witness');
      const minimumLowerBoundary = (g.bottomLevel - g.outerReach) * sy;
      const lowerBoundaries = new Map();
      for (let x = x0; x < x1; x++) {
        const value = bottomOfBase(p._contours, x + .5, w, h);
        if (value !== null && value >= minimumLowerBoundary) lowerBoundaries.set(x, value);
      }
      for (let x = x0; x < x1; x++) {
        const boundaries = [];
        for (let dx = -lateralReach; dx <= lateralReach; dx++) if (lowerBoundaries.has(x + dx)) boundaries.push(lowerBoundaries.get(x + dx));
        if (!boundaries.length) { unresolved.push([x, 'no-analysis-neighbor']); continue; }
        const top = Math.max(0, Math.floor(Math.min(...boundaries)) - footprintY - 1);
        const bottom = Math.min(h - 1, Math.ceil(Math.max(...boundaries)) + footprintY + 1);
        if (bottom - top + 1 > 64 || g.ownership.some(o => x >= o.box[0] * sx && x < o.box[2] * sx && top < o.box[3] * sy && bottom >= o.box[1] * sy)) {
          unresolved.push([x, 'owned-dialogue-or-wide-band']); continue;
        }
        const classes = [];
        for (let y = top; y <= bottom; y++) {
          const i = (y * w + x) * 4;
          if (rgba[i + 3] !== 255) throw Error('Transparent native source band');
          const kind = classify(rgba, i);
          classes.push(kind);
          if (kind === 1 || kind === 2) {
            pixels.set(y * w + x, kind);
            if (kind === 1 && insideBase(p._contours, x + .5, y + .5, w, h)) seeds.push(y * w + x);
          }

        }
        bands.push({ x, top, bottom, classes });
      }
      // Only source ink connected to the same analysis-owned rim can extend
      // its native edge. Detached compression specks or footer marks cannot.
      const connected = new Set(seeds), queue = [...connected];
      for (let at = 0; at < queue.length; at++) {
        const i = queue[at], x = i % w, y = Math.floor(i / w);
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          if (!dx && !dy || x + dx < 0 || x + dx >= w || y + dy < 0 || y + dy >= h) continue;
          const j = i + dy * w + dx;
          if (pixels.has(j) && !connected.has(j)) { connected.add(j); queue.push(j); }
        }
      }
      for (const { x, top, bottom, classes } of bands) {
        let outer = -1, core = -1, paintTop = -1;
        for (let y = top; y <= bottom; y++) if (connected.has(y * w + x)) {
          if (paintTop < 0) paintTop = y;
          outer = y;
          if (pixels.get(y * w + x) === 1) core = y;
        }
        if (core < 0 || outer === bottom || outer - core > footprintY + 1) {
          unresolved.push([x, 'no-bounded-connected-native-rim']); continue;
        }
        // A source-paper row just outside the connected edge witnesses the
        // local gutter. Disconnected gray compression specks stay outside.
        if (classes[outer - top + 1] !== 0) { unresolved.push([x, 'no-local-paper-transition']); continue; }
        records.push([x, top, bottom - top + 1, core, outer, paintTop, ...pack(classes)]);
      }
      owners.push({ ownerIndex: k, analysisWidth: aw, analysisHeight: ah,
        analysisContours: JSON.parse(JSON.stringify(p._contours)), analysisBox: [p.x, p.y, p.w, p.h],
        footprint: [footprintX, footprintY], records, unresolved: unresolved.sort((a,b) => a[0]-b[0]) });
    }

const lower={owners};const frames=[];
for(const owner of lower.owners){const p=panels[owner.ownerIndex],edges=[];for(const[axis,sign,exterior]of[[1,-1,'paper'],[1,1,'paper'],[0,-1,'contrast']]){const proposal=sourceBands(p,w,h,axis,sign);if(axis===1)proposal.bands=proposal.bands.map(r=>[r[0],r[1],Math.min(w-1,r[2]+proposal.maxAA+5)]).filter(r=>r[2]-r[1]<64);if(axis===0){const proof=p._structuralGridProof,sx=w/proof.analysisWidth,sy=h/proof.analysisHeight,calibrated=new Map((proof.geometry.first.sameTopRim?.calibration||[]).map(r=>[r[0],r]));proposal.localBands=proof.geometry.first.sameTopRim?proposal.bands.map(r=>{const at=Math.floor(r[0]/sx)-proof.geometry.first.topRail.start,top=proof.geometry.first.sameTopRim.positions[at],thickness=proof.geometry.first.sameTopRim.thickness,lo=Math.max(0,h-1-Math.ceil((top+thickness*2)*sy+Math.ceil(sy))),hi=Math.min(h-1,h-1-Math.floor((top-thickness)*sy-Math.ceil(sy))),seed=h-1-Math.round((top+thickness/2)*sy);return[r[0],lo,hi,seed,Math.ceil(thickness*2*sy)];}).filter(r=>r.every(Number.isInteger)&&r[2]-r[1]<64):[];proposal.bands=proposal.bands.filter(r=>calibrated.has(Math.floor(r[0]/sx))).map(r=>{const c=calibrated.get(Math.floor(r[0]/sx)),lo=Math.max(0,h-1-Math.ceil(c[2]*sy+Math.ceil(sy))),hi=Math.min(h-1,h-1-Math.floor(c[1]*sy-c[3]*sy-Math.ceil(sy))),seed=h-1-Math.round((c[1]+c[2])/2*sy),maxCore=Math.ceil((c[2]-c[1]+1)*sy);return[r[0],lo,hi,seed,maxCore];}).filter(r=>r[2]-r[1]<64);}const edge=Edge.refine({rgba,width:w,height:h,axis,sign,bands:proposal.bands,isOwned:(x,y)=>inside(p._contours,x,y,w,h),maxAA:proposal.maxAA,exterior}),map=Edge.mapping(w,h,axis,sign);delete edge.sourceBytes;if(axis===0&&proposal.localBands.length){const replaced=new Set(edge.modes.filter(r=>r[1]==='replace').map(r=>r[0])),certified=edge.records.filter(r=>replaced.has(r[0])),certifiedAA=certified.length>=3?Math.max(...certified.map(r=>r[5]-r[4])):null,local=Local.observeLocalExterior({rgba,width:w,height:h,axis,sign,bands:proposal.localBands.filter(r=>!replaced.has(r[0])&&r[3]-2>=r[1]&&r[3]+2<=r[2]),maxAA:proposal.maxAA,aaWitnesses:certified.map(r=>[r[0],r[5]-r[4]]),aaRadius:Math.min(256,p._structuralGridProof.geometry.first.sameTopRim.thickness*h/p._structuralGridProof.analysisHeight*8)});edge.certifiedAA=certifiedAA;const core=Core.observeCoreBand({rgba,width:w,height:h,axis,sign,bands:proposal.localBands,strokeWidth:p._structuralGridProof.geometry.first.sameTopRim.thickness*h/p._structuralGridProof.analysisHeight});const localByU=new Map(local.records.map(r=>[r[0],r]));edge.nativeCores=core.records.map(r=>{const l=localByU.get(r[0]);return l&&!l[7]&&Math.abs(l[3]-r[2])<=1&&l[1]>=r[2]&&l[1]-r[2]<=proposal.maxAA?[r[0],r[1],l[1],...r.slice(3)]:r;});edge.coreUnresolved=core.unresolved;edge.typicalCoreWidth=core.typicalWidth;edge.localExclusions=local.records;edge.localUnresolved=local.unresolved;}edge.excluded=proposal.excluded;edges.push(edge);}
const{runs,conflicts}=buildPatches(edges,w,h);frames.push({ownerIndex:owner.ownerIndex,edges,runs,conflicts});}

return{lower,owners:frames};}
module.exports={deriveFrame};

};
definitions["native/terminal-native-caption-component.js"]=function(module,exports,require){
'use strict';
// Pure bounded source-color component observation. It deliberately does not
// claim the mixed-color antialias collar or issue runtime ownership.
function observeCaptionComponent({color,pale,seedMask,width:w,height:h}){
 if(!Number.isInteger(w)||!Number.isInteger(h)||w<3||h<3||w*h>1000000||[color,pale,seedMask].some(a=>!a||a.length!==w*h||a.some(v=>v!==0&&v!==1)))throw Error('Invalid bounded caption evidence');
 const N=w*h,ids=new Int32Array(N),queue=new Int32Array(N),components=[];let next=0;
 for(let seed=0;seed<N;seed++)if((color[seed]||pale[seed])&&!ids[seed]){const id=++next;queue[0]=seed;ids[seed]=id;let n=1,k=0,overlap=0,touches=false,x0=w,y0=h,x1=0,y1=0;while(k<n){const i=queue[k++],x=i%w,y=i/w|0;overlap+=seedMask[i];touches ||= !x||!y||x===w-1||y===h-1;x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x+1);y1=Math.max(y1,y+1);for(const j of[x?i-1:-1,x+1<w?i+1:-1,y?i-w:-1,y+1<h?i+w:-1])if(j>=0&&(color[j]||pale[j])&&!ids[j]){ids[j]=id;queue[n++]=j;}}if(overlap>=Math.max(4,n*.5))components.push({id,pixels:n,seedOverlap:overlap,touchesPatch:touches,box:[x0,y0,x1,y1]});}
 if(!components.length||components.some(c=>c.touchesPatch))return{status:'unresolved',reason:components.length?'seeded-color-reaches-patch-edge':'no-source-color-component',components,mask:null};
 const kept=new Set(components.map(c=>c.id)),sourceColor=ids.map(id=>+kept.has(id)),outside=new Uint8Array(N);let n=0,k=0;const add=i=>{if(!sourceColor[i]&&!outside[i]){outside[i]=1;queue[n++]=i;}};for(let x=0;x<w;x++){add(x);add((h-1)*w+x);}for(let y=0;y<h;y++){add(y*w);add(y*w+w-1);}while(k<n){const i=queue[k++],x=i%w,y=i/w|0;if(x)add(i-1);if(x+1<w)add(i+1);if(y)add(i-w);if(y+1<h)add(i+w);}return{status:'source-color-body-observation',complete:false,components,sourceColor,mask:outside.map(v=>1-v)};
}
module.exports={observeCaptionComponent};

};
definitions["native/terminal-native-caption-transition.js"]=function(module,exports,require){
'use strict';
// Isolated caption collar observations. This does not issue source authority
// and cannot replace any Reader proof or contour.
const T=require('./terminal-native-color-transition.js');
function observeCaptionTransitions({rgba,width:w,height:h,body,maxAA}){
 if(!Number.isInteger(w)||!Number.isInteger(h)||w<3||h<3||w*h>1000000||rgba.length!==4*w*h||body.length!==w*h||body.some(v=>v!==0&&v!==1)||!Number.isInteger(maxAA)||maxAA<1||maxAA>16)throw Error('Invalid bounded caption collar');
 const observed=[],unresolved=[],votes=new Map(),conflicts=new Set(),mark=(i,v)=>{if(conflicts.has(i))return;if(votes.has(i)&&votes.get(i)!==v){votes.delete(i);conflicts.add(i);}else votes.set(i,v);};
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const at=y*w+x;if(!body[at])continue;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Y=y+dy;if(X<0||Y<0||X>=w||Y>=h||body[Y*w+X])continue;const samples=[],known=[],indices=[];for(let k=0;k<maxAA+6;k++){const xx=x+k*dx,yy=y+k*dy;if(xx<0||yy<0||xx>=w||yy>=h)break;const i=yy*w+xx;if(rgba[4*i+3]!==255)throw Error('Nonopaque native caption source');samples.push([...rgba.slice(4*i,4*i+3)]);known.push(body[i]);indices.push(i);}if(samples.length<maxAA+6){unresolved.push([x,y,dx,dy,'patch-edge']);continue;}const result=T.observeColorTransition({samples,known,maxAA});if(result.status!=='observed-transition'){unresolved.push([x,y,dx,dy,result.reason]);continue;}observed.push({x,y,dx,dy,...result});for(let k=1;k<=Math.min(maxAA+1,result.near.observations.length,result.far.observations.length);k++)mark(indices[k],+(k<=result.outer));}}
 const mask=Uint8Array.from(body);for(const[i,v]of votes)if(v)mask[i]=1;return{status:'caption-color-transition-observations',complete:false,mask,observed,unresolved,conflicts:[...conflicts].sort((a,b)=>a-b).map(i=>[i%w,Math.floor(i/w)])};
}
module.exports={observeCaptionTransitions};

};
definitions["native/terminal-native-color-transition.js"]=function(module,exports,require){
'use strict';
// Isolated polarity-neutral form of the existing two-window RGB transition
// diagnostic. Sample zero must be an independently source-established owner
// pixel. A successful fit is a source observation, never ownership authority.
function observeColorTransition({samples,known,maxAA}){
 if(!Array.isArray(samples)||samples.length<7||samples.length>64||samples.some(p=>!Array.isArray(p)||p.length!==3||p.some(v=>!Number.isInteger(v)||v<0||v>255))||!Array.isArray(known)||known.length!==samples.length||known.some(v=>v!==0&&v!==1)||known[0]!==1||!Number.isInteger(maxAA)||maxAA<1||maxAA>32)throw Error('Invalid bounded source transition');
 function fit(start){const length=5;if(start+length>samples.length||known.slice(start,start+length).some(Boolean))return null;const C=samples[0],s=samples.slice(start,start+length),mean=[0,1,2].map(c=>s.reduce((n,p)=>n+p[c],0)/length),slope=[0,1,2].map(c=>s.reduce((n,p,i)=>n+(i-2)*p[c],0)/10),error=Math.max(...s.flatMap((p,i)=>p.map((v,c)=>Math.abs(v-mean[c]-slope[c]*(i-2))))),contrast=Math.max(...mean.map((v,i)=>Math.abs(v-C[i]))),noise=Math.max(1,error+1);if(contrast<32||error>contrast*.1||Math.max(...slope.map(Math.abs))>contrast*.12)return null;let outer=0,lastAlpha=1,ended=false;const observations=[];
  for(let v=1;v<=Math.min(samples.length-1,maxAA+1);v++){if(known[v])return null;const P=samples[v],B=mean.map((a,c)=>Math.max(0,Math.min(255,a+slope[c]*(v-start-2)))),D=B.map((a,c)=>a-C[c]),delta=B.map((a,c)=>a-P[c]),norm=D.reduce((a,b)=>a+b*b,0);if(norm<1)return null;const alpha=delta.reduce((a,b,c)=>a+b*D[c],0)/norm,residual=Math.max(...delta.map((d,c)=>Math.abs(d-alpha*D[c])));observations.push({distance:v,alpha,residual,noise});if(Math.max(...delta.map(Math.abs))<=noise||alpha<=0){ended=true;break;}if(alpha>1||alpha>lastAlpha+noise/contrast||residual>noise+1)return null;outer=v;lastAlpha=alpha;}
  return ended?{start,length,foreground:C.slice(),mean,slope,error,outer,observations}:null;
 }
 const near=fit(2),far=fit(maxAA+1);if(!near||!far||near.outer!==far.outer)return{status:'unresolved',reason:'inconsistent-local-source-transition',near,far};return{status:'observed-transition',outer:near.outer,near,far};
}
module.exports={observeColorTransition};

};
definitions["native/terminal-native-direct-rim-core.js"]=function(module,exports,require){
'use strict';
// Isolated necessary-rim witness. It admits source-supported pixel centers
// inside directly measured, locally certified inner/outer stroke intervals.
// It neither extrapolates an absent edge nor claims the outer AA footprint.
function observeDirectRimCore({rgba,width:w,height:h,records}) {
 if(!Number.isInteger(w)||!Number.isInteger(h)||w<1||h<1||w*h>1000000||!rgba||rgba.length!==w*h*4||!Array.isArray(records)||records.length>w*h)throw Error('Invalid bounded native direct rim');
 const mask=new Uint8Array(w*h),evidence=[];
 for(const q of records){
  if(q===null)continue;
  if(!q||!Number.isInteger(q.x)||!Number.isInteger(q.y)||q.x<0||q.x>=w||q.y<0||q.y>=h||typeof q.good!=='boolean'||![q.nx,q.ny,q.p?.inner].every(Number.isFinite)||Math.abs(Math.hypot(q.nx,q.ny)-1)>1e-6)throw Error('Invalid native profile');
  if(!q.good)continue;
  const {inner,outer,width,dark,background}=q.p;
  if(![inner,outer,width,dark,background].every(Number.isFinite)||inner< -2||outer<=inner||outer>64||width<=0||Math.abs(outer-inner-width)>1e-6||dark<0||dark>=105||background>255||background-dark<35)throw Error('Invalid certified native stroke');
  const reach=Math.ceil(outer+1),halfTangent=(Math.abs(q.nx)+Math.abs(q.ny))*.5,cutoff=(dark+background)*.5,admitted=[];
  for(let y=Math.max(0,q.y-reach);y<=Math.min(h-1,q.y+reach);y++)for(let x=Math.max(0,q.x-reach);x<=Math.min(w-1,q.x+reach);x++){
   const dx=x-q.x,dy=y-q.y,d=dx*q.nx+dy*q.ny,t=-dx*q.ny+dy*q.nx,i=y*w+x;
   if(d<inner||d>outer||Math.abs(t)>halfTangent+1e-12||rgba[i*4+3]!==255||Math.max(rgba[i*4],rgba[i*4+1],rgba[i*4+2])>Math.min(105,cutoff))continue;
   mask[i]=1;admitted.push(i);
  }
  evidence.push({x:q.x,y:q.y,inner,outer,halfTangent,pixels:admitted});
 }
 return {mask,evidence,scope:'Direct certified source-rim core pixels only; complete contour and AA unresolved'};
}
module.exports={observeDirectRimCore};

};
definitions["native/terminal-native-direct-rim-raster.js"]=function(module,exports,require){
'use strict';
const K=require('./terminal-native-direct-rim-core.js'),C=require('./terminal-native-color-transition.js');
// Source-raster observations around directly exposed native rim arcs. Both
// ownership and exterior observations are evidence only, without authority.
function observeDirectRimRaster({rgba,width:w,height:h,body,records,maxAA}) {
 if(!body||body.length!==w*h||!Number.isInteger(maxAA)||maxAA<1||maxAA>16)throw Error('Invalid native body or bounded AA span');
 const core=K.observeDirectRimCore({rgba,width:w,height:h,records}),anchors=new Map(),owned=core.mask.slice(),outside=new Uint8Array(w*h),observed=[],unresolved=[];
 const byPoint=new Map(records.filter(Boolean).map(q=>[q.y*w+q.x,q]));
 for(const e of core.evidence){const q=byPoint.get(e.y*w+e.x),axis=Math.abs(q.nx)>=Math.abs(q.ny)?0:1,sign=Math.sign(axis?q.ny:q.nx),group=new Map();for(const i of e.pixels){const x=i%w,y=Math.floor(i/w),line=axis?x:y,old=group.get(line);if(old===undefined||sign*(axis?y:x)>sign*(axis?Math.floor(old/w):old%w))group.set(line,i);}for(const[line,i]of group){const key=axis+':'+sign+':'+line,old=anchors.get(key);if(!old||sign*(axis?Math.floor(i/w):i%w)>sign*(axis?Math.floor(old.i/w):old.i%w))anchors.set(key,{i,axis,sign});}}
 for(const a of anchors.values()){const x=a.i%w,y=Math.floor(a.i/w),dx=a.axis?0:a.sign,dy=a.axis?a.sign:0,samples=[],known=[],indices=[];let failed=false;for(let d=0;d<maxAA+6;d++){const xx=x+dx*d,yy=y+dy*d;if(xx<0||xx>=w||yy<0||yy>=h){failed=true;break;}const i=yy*w+xx;indices.push(i);samples.push([...rgba.slice(i*4,i*4+3)]);known.push(d===0?1:+!!(body[i]||core.mask[i]));}if(failed){unresolved.push([x,y,dx,dy,'patch-boundary']);continue;}const r=C.observeColorTransition({samples,known,maxAA});if(r.status!=='observed-transition'){unresolved.push([x,y,dx,dy,r.reason]);continue;}for(let d=1;d<=maxAA+1;d++){if(d<=r.outer)owned[indices[d]]=1;else outside[indices[d]]=1;}observed.push({point:[x,y],direction:[dx,dy],outer:r.outer,near:r.near,far:r.far});}
 const conflicts=[];for(let i=0;i<owned.length;i++){if(body[i])owned[i]=1;if(owned[i]&&outside[i]){outside[i]=0;conflicts.push(i);}}
 return {owned,outside,core:core.mask,observed,unresolved,conflicts,scope:'Direct measured native core and paired RGB transition observations; unobserved arcs and whole contour remain unresolved'};
}
module.exports={observeDirectRimRaster};

};
definitions["native/terminal-native-rim-exterior.js"]=function(module,exports,require){
'use strict';
// Independent exterior observations beyond an observed native midpoint edge
// and the complete projection of one native pixel footprint onto its normal.
// This does not extend ownership or continue an absent outer edge.
function observeRimExterior({rgba,width:w,height:h,body,records,maxDistance}) {
 if(!Number.isInteger(w)||!Number.isInteger(h)||w<1||h<1||w*h>1000000||rgba?.length!==w*h*4||body?.length!==w*h||!Array.isArray(records)||records.length>w*h||!Number.isInteger(maxDistance)||maxDistance<1||maxDistance>16)throw Error('Invalid bounded exterior observation');
 const outside=new Uint8Array(w*h),veto=new Uint8Array(w*h),support=new Uint16Array(w*h),rows=[];
 for(const q of records){if(!q||!q.good)continue;if(!Number.isInteger(q.x)||!Number.isInteger(q.y)||q.x<0||q.x>=w||q.y<0||q.y>=h||![q.nx,q.ny,q.p?.inner,q.p?.outer,q.p?.dark,q.p?.background].every(Number.isFinite)||Math.abs(Math.hypot(q.nx,q.ny)-1)>1e-6||q.p.outer<=q.p.inner||q.p.outer>64||q.p.dark<0||q.p.dark>=105||q.p.background-q.p.dark<35)throw Error('Invalid certified rim profile');
 const footprint=.5*(Math.abs(q.nx)+Math.abs(q.ny)),reach=Math.ceil(q.p.outer+maxDistance),backgroundFloor=q.p.dark+(q.p.background-q.p.dark)*.75,pixels=[];
 for(let y=Math.max(0,q.y-reach);y<=Math.min(h-1,q.y+reach);y++)for(let x=Math.max(0,q.x-reach);x<=Math.min(w-1,q.x+reach);x++){const dx=x-q.x,dy=y-q.y,d=dx*q.nx+dy*q.ny,t=-dx*q.ny+dy*q.nx,i=y*w+x;if(Math.abs(t)>footprint+1e-12||d<q.p.inner||d>q.p.outer+maxDistance)continue;if(d<=q.p.outer+footprint){veto[i]=1;continue;}if(body[i]||rgba[4*i+3]!==255||Math.max(rgba[4*i],rgba[4*i+1],rgba[4*i+2])<backgroundFloor)continue;support[i]++;pixels.push(i);}
 rows.push({point:[q.x,q.y],normalFootprint:footprint,outer:q.p.outer,backgroundFloor,pixels});
 }
 const conflicts=[];for(let i=0;i<outside.length;i++)if(support[i]){if(veto[i]||body[i])conflicts.push(i);else outside[i]=1;}
 return{outside,rows,conflicts,scope:'Direct exterior beyond observed outer midpoint plus native sampling footprint; no contour continuation or owner authority'};
}
module.exports={observeRimExterior};

};
definitions["native/shared-continuity-research/native-profiles.js"]=function(module,exports,require){
'use strict';
// Pure bounded native profile extraction for research. Parameters must come
// from the same source rim's prior analysis/native calibration. No authority,
// image identity, page coordinates, caller freezing or retained pixel cache.
function validate(rgba,w,h){if(!Number.isInteger(w)||!Number.isInteger(h)||w<1||h<1||w*h>1000000||rgba.length!==w*h*4)throw Error('Invalid bounded native patch');}
function sourceWhiteComponent({rgba,width:w,height:h,seedMask,paperFloor,paperChroma}){
 validate(rgba,w,h);if(seedMask.length!==w*h||!Number.isFinite(paperFloor)||paperFloor<0||paperFloor>255||!Number.isFinite(paperChroma)||paperChroma<0||paperChroma>255)throw Error('Invalid source body seed');
 const white=new Uint8Array(w*h),ids=new Int32Array(w*h),queue=new Int32Array(w*h),items=[];
 for(let i=0;i<white.length;i++){const rgb=[rgba[i*4],rgba[i*4+1],rgba[i*4+2]];white[i]=+(rgba[i*4+3]===255&&Math.min(...rgb)>=paperFloor&&Math.max(...rgb)-Math.min(...rgb)<=paperChroma);}
 for(let seed=0;seed<white.length;seed++)if(white[seed]&&!ids[seed]){const id=items.length+1;queue[0]=seed;ids[seed]=id;let n=1,k=0,overlap=0;while(k<n){const i=queue[k++],x=i%w,y=i/w|0;overlap+=+!!seedMask[i];for(const j of[x?i-1:-1,x+1<w?i+1:-1,y?i-w:-1,y+1<h?i+w:-1])if(j>=0&&white[j]&&!ids[j]){ids[j]=id;queue[n++]=j;}}items.push({id,pixels:n,seedOverlap:overlap});}
 items.sort((a,b)=>b.seedOverlap-a.seedOverlap);if(!items[0]?.seedOverlap||items[1]?.seedOverlap===items[0].seedOverlap)return null;return{body:fill(ids.map(i=>+(i===items[0].id)),w,h),selected:items[0],componentCount:items.length};
}
function measureNativeProfiles({rgba,width:w,height:h,body,limits}){
 validate(rgba,w,h);if(body.length!==w*h)throw Error('Invalid native body');
 const keys=['maxDistance','minimumSearchDistance','minWidth','maxWidth','normalRadius','tangentRadius','normalAllowance','widthAgreement'];if(!limits||keys.some(k=>!Number.isFinite(limits[k])||limits[k]<=0))throw Error('Explicit source-calibrated profile limits required');
 if(limits.maxDistance>64||limits.minimumSearchDistance>limits.maxDistance||limits.minWidth>=limits.maxWidth||limits.maxWidth>limits.maxDistance||!Number.isInteger(limits.normalRadius)||limits.normalRadius>16||limits.tangentRadius>128||limits.normalAllowance>64||limits.widthAgreement>16)throw Error('Unbounded profile request');
 const V=new Uint8Array(w*h);for(let i=0;i<V.length;i++)V[i]=Math.max(rgba[i*4],rgba[i*4+1],rgba[i*4+2]);return measureProfileRecords(body,w,h,V,limits);
}
 function fill(m,w,h){const q=new Int32Array(m.length),out=new Uint8Array(m.length);let n=0,k=0;const add=i=>{if(!m[i]&&!out[i]){out[i]=1;q[n++]=i;}};for(let x=0;x<w;x++){add(x);add((h-1)*w+x);}for(let y=0;y<h;y++){add(y*w);add(y*w+w-1);}while(k<n){const i=q[k++],x=i%w,y=i/w|0;if(x)add(i-1);if(x+1<w)add(i+1);if(y)add(i-w);if(y+1<h)add(i+w);}return out.map(n=>1-n);}
 function measureProfileRecords(m,w,h,V,limits){
  const {maxDistance,minimumSearchDistance,minWidth,maxWidth,normalRadius,tangentRadius,normalAllowance,widthAgreement}=limits;
  const records=[];
  function value(x,y){const X=Math.floor(x),Y=Math.floor(y),a=x-X,b=y-Y;if(X<0||Y<0||X+1>=w||Y+1>=h)return NaN;const A=V[Y*w+X],B=V[Y*w+X+1],C=V[(Y+1)*w+X],D=V[(Y+1)*w+X+1];if(A>255||B>255||C>255||D>255)return NaN;return A*(1-a)*(1-b)+B*a*(1-b)+C*(1-a)*b+D*a*b;}
  function profile(x,y,nx,ny){const sample=[];for(let d=-2;d<=maxDistance;d+=.25)sample.push({d,v:value(x+nx*d,y+ny*d)});if(sample.some(p=>!Number.isFinite(p.v)))return null;
   let minimum=0;for(let k=0;k<sample.length&&sample[k].d<=minimumSearchDistance;k++)if(sample[k].v<sample[minimum].v)minimum=k;const dark=sample[minimum].v,white=Math.max(...sample.filter(p=>p.d<=0).map(p=>p.v));if(dark>=105||white-dark<75)return null;
   const innerMid=(white+dark)/2;let inner=null;for(let k=0;k<minimum;k++)if(sample[k].v>innerMid&&sample[k+1].v<=innerMid){const a=sample[k],b=sample[k+1];inner=a.d+(b.d-a.d)*(innerMid-a.v)/(b.v-a.v);break;}if(inner===null)return null;
   let outer=null,background=null;
   for(let k=minimum+1;k+8<sample.length;k++){const a=[sample[k].v,sample[k+4].v,sample[k+8].v].sort((a,b)=>a-b),contrast=a[1]-dark;if(contrast<35||a[2]-a[0]>Math.max(4,contrast*.1))continue;const mid=(a[1]+dark)/2;let j=minimum;while(j+1<sample.length&&sample[j+1].v<=mid)j++;if(j>=k||j+1>=sample.length)continue;const left=sample[j],right=sample[j+1];outer=left.d+(right.d-left.d)*(mid-left.v)/(right.v-left.v);background=a[1];break;}
   if(outer!==null&&(outer-inner<minWidth||outer-inner>maxWidth))outer=null;return{inner,outer,width:outer===null?null:outer-inner,dark,background};
  }
  for(let i=0;i<m.length;i++)if(m[i]){const x=i%w,y=i/w|0;if(x&&x+1<w&&y&&y+1<h&&m[i-1]&&m[i+1]&&m[i-w]&&m[i+w])continue;let nx=0,ny=0;for(let dy=-normalRadius;dy<=normalRadius;dy++)for(let dx=-normalRadius;dx<=normalRadius;dx++){const xx=x+dx,yy=y+dy;if(xx>=0&&xx<w&&yy>=0&&yy<h&&!m[yy*w+xx]){nx+=dx;ny+=dy;}}const length=Math.hypot(nx,ny);if(!length)continue;nx/=length;ny/=length;const p=profile(x,y,nx,ny);if(!p)continue;const good=false;records.push({x,y,nx,ny,p,good});}
  // Certify width with actual neighboring contour samples on both sides.
  // Parallel offset rays alone can cross a source color junction and discard
  // an otherwise measured edge, so they are not the confidence criterion.
  for(const q of records){q.good=false;if(q.p.width===null)continue;const sides=[[],[]];for(const a of records){if(a===q||a.p.width===null||a.nx*q.nx+a.ny*q.ny<.85)continue;const dx=a.x-q.x,dy=a.y-q.y,t=-q.ny*dx+q.nx*dy,n=q.nx*dx+q.ny*dy;if(Math.abs(t)<.5||Math.abs(t)>tangentRadius||Math.abs(n)>normalAllowance)continue;sides[+(t>0)].push({a,d:Math.abs(t)});}if(sides.some(s=>s.length<2))continue;const widths=[q.p.width,...sides.flatMap(s=>s.sort((a,b)=>a.d-b.d).slice(0,2).map(a=>a.a.p.width))];q.good=Math.max(...widths)-Math.min(...widths)<=widthAgreement;}
  return records;
 }
module.exports={sourceWhiteComponent,measureNativeProfiles};

};
definitions["native/terminal-native-joint-speech.js"]=function(module,exports,require){
/* Pure bounded ownership bookkeeping. Claims must come from the existing
 * source-certified speech raster; this helper grants no source authority. */
'use strict';
function create(width,height){
 if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||width>12000||height>12000||width*height>24000000)throw Error('Invalid joint ownership dimensions');
 const claims=new Map(),counts=[0,0];
 function claim(owner,x,y){if(![0,1].includes(owner)||!Number.isInteger(x)||!Number.isInteger(y)||x<0||x>=width||y<0||y>=height)throw Error('Invalid source speech claim');const i=y*width+x,prior=claims.get(i);if(prior!==undefined&&prior!==owner)throw Error('Conflicting source speech owners');if(prior===undefined){if(claims.size>=1500000)throw Error('Joint speech work budget');claims.set(i,owner);counts[owner]++;}}
 function apply(patches){if(!Array.isArray(patches)||patches.length!==2||patches.some(p=>!(p instanceof Map)))throw Error('Invalid private patch maps');for(const[i,owner]of claims)if(patches[owner].get(i)!==1)throw Error('Certified speech claim lost before joint composition');const changed=[0,0];for(const[i,owner]of claims){const other=1-owner;if(patches[other].get(i)!==0)changed[other]++;patches[other].set(i,0);if(patches[other].size>1500000)throw Error('Joint native patch work budget');}return{method:'source-certified-speech-exclusive-neighbor-transfer',claims:counts.slice(),neighborPatchWrites:changed};}
 return{claim,apply};
}
module.exports={create};

};
definitions["native/terminal-native-refinement.js"]=function(module,exports,require){
/* Pure, bounded native reconstruction. Caller pixels and analysis stay unchanged.
 * Admission is exclusively owned by terminal-source-admission.js. */
'use strict';
const Frame=require('./terminal-native-frame-observations.js'),Caption=require('./terminal-native-caption-component.js'),Transition=require('./terminal-native-caption-transition.js'),Profiles=require('./shared-continuity-research/native-profiles.js'),Rim=require('./terminal-native-direct-rim-raster.js'),Exterior=require('./terminal-native-rim-exterior.js'),Compose=require('../terminal-orthogonal-compose.js'),JointSpeech=require('./terminal-native-joint-speech.js');
function refine({rgba,width:W,height:H,panels,geometry}){
 if(!Number.isInteger(W)||!Number.isInteger(H)||W<1||H<1||W>12000||H>12000||W*H>24000000||!(rgba instanceof Uint8Array||rgba instanceof Uint8ClampedArray)||rgba.length!==W*H*4||!Array.isArray(panels)||panels.length!==2||panels.some((p,k)=>p?._structuralGridProof?.index!==k))throw Error('Invalid bounded native source');
 const proof=panels[0]._structuralGridProof,g=proof.geometry.first,aw=proof.analysisWidth,ah=proof.analysisHeight,sx=W/aw,sy=H/ah,footprint=Math.max(sx,sy),reach=Math.ceil(footprint*g.outerReach),maxAA=Math.ceil(footprint)+1;
 if(!Number.isInteger(reach)||reach<1||reach>64||maxAA>16)throw Error('Native footprint beyond supported source bounds');
 const frame=Frame.deriveFrame({rgba,width:W,height:H,panels}),patches=[new Map(),new Map()],set=(owner,x,y,v)=>{if(x<0||y<0||x>=W||y>=H)throw Error('Native patch escapes source');patches[owner].set(y*W+x,v);if(patches[owner].size>1500000)throw Error('Native patch work budget');};
 for(let k=0;k<2;k++){for(const r of frame.lower.owners[k].records)for(let y=r[5];y<r[1]+r[2];y++)set(k,r[0],y,+(y<=r[4]));for(const[y,x0,x1,v]of frame.owners[k].runs)for(let x=x0;x<x1;x++)set(k,x,y,v);}
 const observations=frame.owners.map(o=>({kind:'frame-local-exterior',owner:o.ownerIndex,observed:o.edges.reduce((n,e)=>n+(e.localExclusions?.length||0),0),unresolved:o.edges.reduce((n,e)=>n+(e.localUnresolved?.length||0),0),certifiedCoreColumns:o.edges.reduce((n,e)=>n+(e.nativeCores?.length||0),0)})),joint=JointSpeech.create(W,H);
 for(const own of g.ownership.slice().sort((a,b)=>(a.kind==='caption'?0:1)-(b.kind==='caption'?0:1))){if(!['caption','speech'].includes(own.kind)||![0,1].includes(own.owner))throw Error('Unsupported owned object');const definition=proof.geometry[own.kind==='caption'?'captions':'speech'][own.index],crop=[Math.max(0,Math.floor(own.box[0]*sx)-reach),Math.max(0,Math.floor(own.box[1]*sy)-reach),Math.min(W,Math.ceil(own.box[2]*sx)+reach),Math.min(H,Math.ceil(own.box[3]*sy)+reach)],[x0,y0,x1,y1]=crop,w=x1-x0,h=y1-y0;if(w<3||h<3||w*h>1000000)throw Error('Unbounded owned native patch');const a=new Uint8ClampedArray(w*h*4),seedMask=new Uint8Array(w*h),analysis=new Uint8Array(aw*ah);if(!Array.isArray(definition?.mask)||definition.mask.length%2)throw Error('Invalid source seed');for(let k=0;k<definition.mask.length;k+=2)analysis.fill(1,definition.mask[k],definition.mask[k+1]);let seedPixels=0;for(let y=0;y<h;y++){a.set(rgba.subarray(4*((y+y0)*W+x0),4*((y+y0)*W+x1)),4*y*w);for(let x=0;x<w;x++){const i=y*w+x;seedPixels+=seedMask[i]=analysis[Math.floor((y+y0+.5)/sy)*aw+Math.floor((x+x0+.5)/sx)];if(a[4*i+3]!==255)throw Error('Nonopaque native object patch');}}
 if(own.kind==='caption'){const evidence=geometry.evidence(a,w,h,proof.source.bin),component=Caption.observeCaptionComponent({color:evidence.color[0],pale:evidence.pale,seedMask,width:w,height:h});if(!component.mask)throw Error('Caption source component unresolved');const t=Transition.observeCaptionTransitions({rgba:a,width:w,height:h,body:component.mask,maxAA});for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x,X=x+x0,Y=y+y0,at=Math.floor((X+.5)/sx)-g.topRail.start,roof=at>=0&&at<g.topRail.positions.length?g.topRail.positions[at]*sy:Infinity;if(t.mask[i])set(own.owner,X,Y,1);else if(Y+.5<roof)set(own.owner,X,Y,0);}observations.push({kind:'caption',owner:own.owner,index:own.index,crop,bodyPixels:component.mask.reduce((a,b)=>a+b,0),observed:t.observed.length,unresolved:t.unresolved.length,conflicts:t.conflicts.length});}
 else {const body=new Uint8Array(w*h),records=[],minimumOverlap=Math.max(8,Math.floor(seedPixels*.01)),limits={maxDistance:reach,minimumSearchDistance:Math.ceil(footprint*2),minWidth:.5,maxWidth:reach-.5,normalRadius:Math.ceil(footprint),tangentRadius:Math.ceil(footprint*3),normalAllowance:Math.ceil(footprint),widthAgreement:Math.max(.5,footprint/4)};let components=0;for(let pass=0;pass<8;pass++){const selected=Profiles.sourceWhiteComponent({rgba:a,width:w,height:h,seedMask,paperFloor:220,paperChroma:30});if(!selected||selected.selected.seedOverlap<minimumOverlap)break;components++;records.push(...Profiles.measureNativeProfiles({rgba:a,width:w,height:h,body:selected.body,limits}));for(let i=0;i<body.length;i++)if(selected.body[i]){seedMask[i]=0;body[i]=1;}}if(!components)throw Error('Native speech body unresolved');const r=Rim.observeDirectRimRaster({rgba:a,width:w,height:h,body,records,maxAA}),e=Exterior.observeRimExterior({rgba:a,width:w,height:h,body,records,maxDistance:maxAA}),run=g.runs[own.owner],guard=g.outerReach,envelope=[(run[0]-guard)*sx,(Math.min(...g.topRail.positions)-guard)*sy,(run[1]+guard)*sx,(Math.max(...g.terminalFrontier.filter(Number.isFinite))+guard)*sy];let conflicts=0;for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x,X=x+x0,Y=y+y0,protectedFrame=X+.5>=envelope[0]&&X+.5<envelope[2]&&Y+.5>=envelope[1]&&Y+.5<envelope[3];if(r.owned[i]&&e.outside[i])conflicts++;if(r.owned[i]){set(own.owner,X,Y,1);joint.claim(own.owner,X,Y);}else if((r.outside[i]||e.outside[i])&&!protectedFrame)set(own.owner,X,Y,0);}observations.push({kind:'speech',owner:own.owner,index:own.index,crop,components,bodyPixels:body.reduce((a,b)=>a+b,0),records:records.length,certified:records.filter(r=>r?.good).length,observed:r.observed.length,unresolved:r.unresolved.length,conflicts});}
 }
 const ownership=joint.apply(patches);observations.push({kind:'joint-speech',...ownership});
 const results=panels.map((p,k)=>{const runs=[];for(const [i,v]of [...patches[k]].sort((a,b)=>a[0]-b[0])){const y=Math.floor(i/W),x=i%W,last=runs.at(-1);if(last&&last[0]===y&&last[2]===x&&last[3]===v)last[2]++;else runs.push([y,x,x+1,v]);}const q=Compose.compose({contours:p._contours,width:W,height:H,runs}),points=q.contours.flat(),xs=points.map(p=>p.x*W),ys=points.map(p=>p.y*H);return{contours:q.contours,bounds:[Math.floor(Math.min(...xs)),Math.floor(Math.min(...ys)),Math.ceil(Math.max(...xs)),Math.ceil(Math.max(...ys))],runs,work:q.work};});
 return{schema:'terminal-native-source-reconstruction-3',reconstruction:true,width:W,height:H,owners:results,observations};
}
// Pure joint geometry is public; only source admission can authorize its output.
module.exports={refine,createJointSpeechClaims:JointSpeech.create,observeRimExterior:require('./terminal-native-local-exterior.js').observeLocalExterior,observeRimCore:require('./terminal-native-core-band.js').observeCoreBand};

};
function load(name){if(cache[name])return cache[name].exports;if(!definitions[name])throw Error('Unknown native module');const module={exports:{}};cache[name]=module;const require=relative=>{const parts=name.split('/');parts.pop();for(const p of relative.split('/')){if(p==='..')parts.pop();else if(p!=='.')parts.push(p);}return load(parts.join('/'));};definitions[name](module,module.exports,require);return module.exports;}return load('native/terminal-native-refinement.js');})();
