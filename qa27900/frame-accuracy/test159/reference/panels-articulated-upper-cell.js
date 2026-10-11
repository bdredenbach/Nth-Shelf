/* A source-authenticated articulated wall can bound the next enclosure above
 * it. Independent roof and side observations must agree; complete crossing
 * paper bodies are assigned atomically and the previous cell remains exact. */
const PanelArticulatedUpperCell=(()=>{
 'use strict';
 const VERSION=100,METHOD='source-articulated-upper-cell',TYPE='articulated-upper-cell',P=PanelArticulatedRimCell,F=PanelFirmEnclosureGroups,same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),cache=new WeakMap();
 function freeze(o){if(o&&typeof o==='object'&&!Object.isFrozen(o)){Object.values(o).forEach(freeze);Object.freeze(o);}return o;}
 function eligible(prior){return Array.isArray(prior)&&prior.length===1&&P.validPanel(prior[0]);}
 function extent(m,w,h){let x=w,y=h,X=0,Y=0,pixels=0;for(let i=0;i<m.length;i++)if(m[i]){const u=i%w,v=i/w|0;x=Math.min(x,u);y=Math.min(y,v);X=Math.max(X,u+1);Y=Math.max(Y,v+1);pixels++;}return{box:[x,y,X,Y],pixels};}
 function erode(m,w,h){const out=new Uint8Array(m.length);for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){const i=y*w+x;out[i]=+(m[i]&&m[i-1]&&m[i+1]&&m[i-w]&&m[i+w]);}return out;}
 function anchor(prior,w,h){if(!eligible(prior))return null;const p=prior[0],v=p._structuralGridProof;if(v.analysisWidth!==w||v.analysisHeight!==h)return null;const paths=v.witnesses.map(q=>q.paths[0]),lo=Math.max(...paths.map(q=>q.lo)),hi=Math.min(...paths.map(q=>q.hi)),floor=[];for(let x=lo;x<hi;x++)floor.push(Math.min(...paths.map(q=>q.points[x-q.lo])));const occupied=PanelLocalBoundaryConsensus.raster(p,w,h),upper=occupied.slice(),band=v.box[1]+Math.ceil((v.box[3]-v.box[1])*.1);for(let i=band*w;i<upper.length;i++)upper[i]=0;const bounds=extent(upper,w,h);if(!bounds.pixels||floor.length<w*.16)return null;return{lo,hi,floor,bottom:Math.max(...floor),top:v.box[1],left:bounds.box[0],right:bounds.box[2]-1,occupied};}
 function compact(mask,w,h){const core=erode(erode(mask,w,h),w,h),g=extent(core,w,h),[x,y,X,Y]=g.box,A=(X-x)*(Y-y);if(Math.min(X-x,Y-y)<12||Math.max(X-x,Y-y)>Math.min(X-x,Y-y)*6||g.pixels<A*.35||g.pixels>A*.9||F.components(core,w,h).items.length!==1)return null;return{atom:F.encode(mask),core:F.encode(core),box:g.box,pixels:g.pixels};}
 function bodiesFrom(f,w,h){const raw=PanelColoredRims.whiteBodies(f.white,w,h);if(!raw)return null;const out=[];for(const q of raw.items){const m=new Uint8Array(w*h);for(const i of q.indices)m[i]=1;const body=compact(m,w,h);if(body)out.push(body);}return out;}
 function validateBodies(bodies,w,h){if(!Array.isArray(bodies)||bodies.length>128)return false;return bodies.every(q=>{const m=F.decode(q.atom,w,h);return m&&same(compact(m,w,h),q);});}
 function bodyWall(bodies,w,h){const out=new Uint8Array(w*h);for(const q of bodies){const m=F.decode(q.atom,w,h);if(!m)return null;for(let i=0;i<m.length;i++)out[i]|=m[i];}return out;}
 function roofs(m,mean,wall,w,h,A){const rows=[],width=A.right-A.left+1;for(let y=8;y<Math.floor(A.top-h*.4);y++){const runs=[];for(let x=0;x<w;x++){if(!m[y*w+x]&&!wall[y*w+x])continue;const lo=x;while(x+1<w&&(m[y*w+x+1]||wall[y*w+x+1]))x++;if(runs.length&&lo-runs.at(-1)[1]<=10)runs.at(-1)[1]=x+1;else runs.push([lo,x+1]);}for(const[l,r]of runs){const span=r-l;if(span<width*.6||span>width*1.35||Math.min(r,A.right+1)-Math.max(l,A.left)<Math.min(width,span)*.75)continue;let color=0,ink=0;for(let x=l;x<r;x++){color+=m[y*w+x];let v=255;for(let d=0;d<=3;d++)v=Math.min(v,mean[(y-d)*w+x]);ink+=+(v<75);}if(color>span*.3)rows.push([y,l,r,color,ink]);}}
  const groups=[];for(const row of rows){const last=groups.at(-1),previous=last?.at(-1);if(previous&&row[0]-previous[0]<=2&&Math.min(row[2],previous[2])-Math.max(row[1],previous[1])>=Math.min(row[2]-row[1],previous[2]-previous[1])*.7)last.push(row);else groups.push([row]);}return groups.map(rows=>roofSummary(rows,w,h,A)).filter(Boolean);
 }
 function roofSummary(rows,w,h,A){if(!Array.isArray(rows)||rows.length<3||rows.length>Math.ceil(h*.025))return null;let last=-1;const width=A.right-A.left+1;for(const q of rows){if(q?.length!==5||q.some(n=>!Number.isInteger(n))||q[0]<8||q[0]>=A.top-h*.4||q[0]<=last||last>=0&&q[0]>last+2||q[1]<0||q[2]>w||q[1]>=q[2]||q[2]-q[1]<width*.6||q[2]-q[1]>width*1.35||q[3]<=(q[2]-q[1])*.3||q[3]>q[2]-q[1]||q[4]<0||q[4]>q[2]-q[1])return null;last=q[0];}const widest=rows.reduce((a,b)=>b[2]-b[1]>a[2]-a[1]?b:a),box=[Math.min(...rows.map(q=>q[1])),rows[0][0],Math.max(...rows.map(q=>q[2])),rows.at(-1)[0]+1],pad=Math.max(6,Math.round(w*.017));if(box[0]-pad<A.lo||box[2]+pad>A.hi)return null;return{rows,box,level:widest[0]};}
 function ownership(bodies,R,A,w,h){const entries=[],wall=new Uint8Array(w*h);for(let j=0;j<bodies.length;j++){const body=bodies[j],core=F.decode(body.core,w,h);let matched=0;for(let i=0;i<core.length;i++)if(core[i]){const y=i/w|0,x=i%w,t=(y-R.level)/(A.bottom-R.level),left=R.box[0]+(A.left-R.box[0])*t,right=R.box[2]+(A.right-R.box[2])*t;matched+=+(y>=R.level&&y<A.bottom&&x>=left&&x<=right);}const ratio=matched/body.pixels;if(ratio>.35&&ratio<.65)return null;const retained=ratio>=.65;entries.push({matched,retained});if(retained){const atom=F.decode(body.atom,w,h);for(let i=0;i<wall.length;i++){if(core[i]&&A.occupied[i])return null;wall[i]|=atom[i];}}}return{entries,wall};}
 function expected(R,A,t,side){return side===2?R.box[0]+(A.left-R.box[0])*(t-R.level)/(A.bottom-R.level):side===3?R.box[2]+(A.right-R.box[2])*(t-R.level)/(A.bottom-R.level):R.level;}
 function parameters(R,A,w,h,side){const vertical=side>=2,pad=Math.max(6,Math.round(w*.017)),inner=Math.round(w*.06),outer=Math.ceil(w*.0205),lo=vertical?Math.max(8,R.box[1]-8):R.box[0]-pad,hi=vertical?A.bottom+1:R.box[2]+pad,start=vertical?Math.max(8,Math.min(side===2?R.box[0]:R.box[2],side===2?A.left:A.right)-inner):Math.max(8,R.box[1]-20),end=vertical?Math.min(w-8,Math.max(side===2?R.box[0]:R.box[2],side===2?A.left:A.right)+inner):R.box[3]+20;return{side,lo,hi,start,end,inner,outer};}
 function cost(q,x,t,v,R,A){const[color,ink,bright,paper]=q,sign=v.side%2?-1:1,ex=expected(R,A,t,v.side);if(v.side>=2&&(sign*(x-ex)<-v.outer||sign*(x-ex)>v.inner||((t<R.box[1]+4||t>A.bottom-6)&&Math.abs(x-ex)>10)))return Infinity;const raw=(1-color/6)*2+Math.max(0,ink-65)/50+Math.max(0,18-(bright-ink))/25+.025*(v.side%2?v.end-x:x-v.start);return paper?Math.min(raw,.9+Math.abs(x-ex)*.012):raw;}
 function trace(m,mean,wall,w,h,R,A,side){const v=parameters(R,A,w,h,side),W=v.end-v.start,H=v.hi-v.lo;if(W<5||H<20)return null;const scores=new Float64Array(W*H),evidence=new Array(W*H),parent=new Int16Array(W*H);let dp=new Float64Array(W);for(let t=0;t<H;t++)for(let j=0;j<W;j++){const x=v.start+j,sign=side%2?-1:1,at=u=>side>=2?(t+v.lo)*w+u:u*w+t+v.lo;let color=0,ink=255,bright=0;for(let d=2;d<8;d++){color+=m[at(x+sign*d)];bright=Math.max(bright,mean[at(x+sign*d)]);}for(let d=0;d<4;d++)ink=Math.min(ink,mean[at(x-sign*d)]);const q=[color,ink,bright,wall[at(x)]],idx=t*W+j;evidence[idx]=q;scores[idx]=cost(q,x,t+v.lo,v,R,A);if(!t)dp[j]=scores[idx];}for(let t=1;t<H;t++){const next=new Float64Array(W);next.fill(Infinity);for(let j=0;j<W;j++)for(let d=-2;d<=2;d++){const p=j+d;if(p<0||p>=W)continue;const value=dp[p]+Math.abs(d)*.13+scores[t*W+j];if(value<next[j]){next[j]=value;parent[t*W+j]=p;}}dp=next;}let j=0;for(let n=1;n<W;n++)if(dp[n]<dp[j])j=n;if(!Number.isFinite(dp[j]))return null;const score=dp[j],points=new Array(H),observations=new Array(H);for(let t=H-1;t>=0;t--){points[t]=v.start+j;observations[t]=evidence[t*W+j];j=parent[t*W+j];}return{...v,points,observations,score};}
 function validTrace(v,wall,w,h,R,A,side){if(!v||!same(parameters(R,A,w,h,side),Object.fromEntries(['side','lo','hi','start','end','inner','outer'].map(k=>[k,v[k]])))||!Array.isArray(v.points)||v.points.length!==v.hi-v.lo||v.observations?.length!==v.points.length||!Number.isFinite(v.score))return false;let score=0,colors=0,hits=0,samples=0,gap=0,maxGap=0;for(let t=0;t<v.points.length;t++){const x=v.points[t],q=v.observations[t],T=t+v.lo;if(!Number.isInteger(x)||x<v.start||x>=v.end||t&&Math.abs(x-v.points[t-1])>2||q?.length!==4||!Number.isInteger(q[0])||q[0]<0||q[0]>6||q.slice(1,3).some(n=>!Number.isFinite(n)||n<0||n>255)||![0,1].includes(q[3])||q[3]!==wall[side>=2?T*w+x:x*w+T])return false;const c=cost(q,x,T,v,R,A);if(!Number.isFinite(c))return false;score+=c+(t?Math.abs(x-v.points[t-1])*.13:0);if(side===0&&(T<R.box[0]||T>=R.box[2])||side>=2&&(T<R.level||T>A.bottom-5))continue;const color=q[0]>=3&&q[1]<75&&q[2]-q[1]>18,hit=color||q[3];samples++;colors+=color;hits+=hit;gap=hit?0:gap+1;maxGap=Math.max(maxGap,gap);}return samples>50&&colors>=samples*(side===0?.28:.35)&&hits>=samples*.82&&maxGap<=Math.max(12,h*.027)&&Math.abs(score-v.score)<.001;}
 function pathMask(paths,R,A,bodies,owned,w,h){const[top,left,right]=paths,mask=new Uint8Array(w*h),x0=Math.max(0,Math.min(...left.points)),x1=Math.min(w,Math.max(...right.points)+1);if(x0<A.lo-Math.ceil(w*.0205)||x1>A.hi+Math.ceil(w*.0205))return null;for(let y=Math.max(left.lo,right.lo);y<Math.min(left.hi,right.hi);y++)for(let x=x0;x<x1;x++)if(x>=left.points[y-left.lo]&&x<=right.points[y-right.lo]&&y>=top.points[Math.max(0,Math.min(top.points.length-1,x-top.lo))]&&y<A.floor[Math.max(0,Math.min(A.floor.length-1,x-A.lo))])mask[y*w+x]=1;for(let j=0;j<bodies.length;j++){const atom=F.decode(bodies[j].atom,w,h),core=F.decode(bodies[j].core,w,h);if(owned.entries[j].retained)for(let i=0;i<mask.length;i++)mask[i]|=atom[i];else if(core.some((n,i)=>n&&mask[i]))return null;}for(let i=0;i<mask.length;i++)if(A.occupied[i])mask[i]=0;const parts=F.components(mask,w,h),tiny=new Set(parts.items.filter(q=>q.pixels<=Math.max(4,Math.round(Math.min(w,h)*.05))).map(q=>q.id));for(let i=0;i<mask.length;i++)if(tiny.has(parts.ids[i]))mask[i]=0;return mask;}
 function measure(witnesses,bodies,prior,w,h){const A=anchor(prior,w,h);if(!A||!validateBodies(bodies,w,h)||witnesses?.length!==2)return null;const masks=[];for(let k=0;k<2;k++){const q=witnesses[k];if(q?.threshold!==[.12,.15][k]||!same(q.roof,roofSummary(q.roof?.rows,w,h,A)))return null;const owned=ownership(bodies,q.roof,A,w,h);if(!owned||!same(owned.entries,q.ownership)||q.paths?.length!==3||q.paths.some((p,j)=>!validTrace(p,owned.wall,w,h,q.roof,A,[0,2,3][j])))return null;const m=pathMask(q.paths,q.roof,A,bodies,owned,w,h);if(!m)return null;masks.push(m);}if(witnesses[0].roof.box.some((n,i)=>Math.abs(n-witnesses[1].roof.box[i])>3))return null;const mask=masks[0].map((n,i)=>+(n||masks[1][i])),g=extent(mask,w,h);let difference=0;for(let i=0;i<mask.length;i++)difference+=+(masks[0][i]!==masks[1][i]);if(g.pixels<w*h*.08||g.pixels>w*h*.4||g.box[3]-g.box[1]<h*.4||difference>g.pixels*.012||F.components(mask,w,h).items.length!==1)return null;for(let j=0;j<bodies.length;j++)if(witnesses[0].ownership[j].retained){const m=F.decode(bodies[j].core,w,h);if(m.some((n,i)=>n&&!mask[i]))return null;}const rings=PanelMatteCells.tracePixelContours(mask,w,h,1);return rings?.length===1?{mask,g,rings,difference,A}:null;}
 function interiorLines(mask,w,h){const box=extent(mask,w,h).box,lines=[],margin=Math.max(14,Math.round(w*.035));for(let side=0;side<2;side++){const length=side?h:w,span=side?w:h;for(let t=box[side]+margin;t<box[side+2]-margin;t++){let lo=span,hi=0;for(let u=0;u<span;u++){const i=side?t*w+u:u*w+t;if(mask[i]){lo=Math.min(lo,u);hi=Math.max(hi,u+1);}}if(hi-lo<=margin*2+30)continue;const ids=[];for(let u=lo+margin;u<hi-margin;u++){const i=side?t*w+u:u*w+t;if(mask[i])ids.push(i);}if(ids.length>=30)lines.push(ids);}}return lines;}
 function separators(mask,f,color,paper,w,h){return interiorLines(mask,w,h).map(ids=>[ids.length,ids.reduce((n,i)=>n+paper[i],0),ids.reduce((n,i)=>n+ +(f.mean[i]<45),0),ids.reduce((n,i)=>n+ +(f.white[i]&&f.mean[i]>225),0),ids.reduce((n,i)=>n+color[i],0)]);}
 function separatorsValid(q,mask,w,h){const lengths=interiorLines(mask,w,h).map(a=>a.length);return Array.isArray(q)&&q.length===lengths.length&&q.every((v,i)=>v?.length===5&&v.every(Number.isInteger)&&v[0]===lengths[i]&&v.slice(1).every(n=>n>=0&&n<=v[0])&&(v[1]>v[0]*.2||v.slice(2).every(n=>n<v[0]*.94)));}
 function create(v,c){const w=v.analysisWidth,h=v.analysisHeight,[x,y,X,Y]=c.g.box;return{x:x/w,y:y/h,w:(X-x)/w,h:(Y-y)/h,_identitySource:'structural-grid-frame',_geometryOwner:'structural-grid-contours',_geometryType:TYPE,_contours:c.rings.map(r=>r.map(([x,y])=>({x:x/w,y:y/h}))),_structuralGridProof:v};}
 function validPanel(p){try{if(p&&Object.isFrozen(p)&&cache.has(p))return true;const v=p?._structuralGridProof,w=v?.analysisWidth,h=v?.analysisHeight;if(v?.version!==VERSION||v.method!==METHOD||!eligible(v.prior)||w!==v.prior[0]._structuralGridProof.analysisWidth||h!==v.prior[0]._structuralGridProof.analysisHeight||!Number.isFinite(v.variance)||v.variance<500)return false;const c=measure(v.witnesses,v.bodies,v.prior,w,h);if(!c||!separatorsValid(v.separators,c.mask,w,h)||v.pixels!==c.g.pixels||v.difference!==c.difference||!same(v.box,c.g.box)||!same(v.pixelContours,c.rings)||!same(create(v,c),p))return false;freeze(p);cache.set(p,true);return true;}catch(_){return false;}}
 function analyzeRGBA(a,w,h,prior){if(!eligible(prior))return[];const A=anchor(prior,w,h),f=P.fields(a,w,h);if(!A||!f||!P.sourceReplay(prior[0],a,w,h))return[];const bodies=bodiesFrom(f,w,h);if(!bodies)return[];const wall=bodyWall(bodies,w,h),bin=prior[0]._structuralGridProof.hueBin,rims=[0,1].map(k=>P.palette(f,bin,k,.6)),all=rims.map(m=>roofs(m,f.mean,wall,w,h,A));if(all.some(q=>q.length!==1))return[];const witnesses=[];for(let k=0;k<2;k++){const roof=all[k][0],owned=ownership(bodies,roof,A,w,h);if(!owned)return[];const paths=[0,2,3].map(side=>trace(rims[k],f.mean,owned.wall,w,h,roof,A,side));witnesses.push({threshold:[.12,.15][k],roof,ownership:owned.entries,paths});}const c=measure(witnesses,bodies,prior,w,h);if(!c)return[];const owned=ownership(bodies,witnesses[0].roof,A,w,h),lines=separators(c.mask,f,rims[0],owned.wall,w,h);if(!separatorsValid(lines,c.mask,w,h))return[];let sum=0,sq=0;for(let i=0;i<c.mask.length;i++)if(c.mask[i]){sum+=f.mean[i];sq+=f.mean[i]*f.mean[i];}const variance=sq/c.g.pixels-(sum/c.g.pixels)**2;if(variance<500)return[];const v={version:VERSION,method:METHOD,analysisWidth:w,analysisHeight:h,prior:JSON.parse(JSON.stringify(prior)),bodies,witnesses,separators:lines,variance,pixels:c.g.pixels,box:c.g.box,difference:c.difference,pixelContours:c.rings},p=create(v,c);return validPanel(p)?[p]:[];}
 function sourceReplay(p,a,w,h,prior=p?._structuralGridProof?.prior){return validPanel(p)&&same(analyzeRGBA(a,w,h,prior),[p]);}
 function imageRaster(img,w,h){let c;try{if(!P.sourceReady(img))return null;const W=img?.naturalWidth||img?.width,H=img?.naturalHeight||img?.height;if(!W||!H||W*H>24000000)return null;c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d',{willReadFrequently:true});if(!g)return null;g.drawImage(img,0,0);return PanelMatteCells.sampleBilinearRGBA(g.getImageData(0,0,W,H).data,W,H,w,h);}catch(_){return null;}finally{if(c)c.width=c.height=1;}}
 // This family admits only its exact immutable detector child and visible96
 // parent. Validation walks are temporary; retained records contain two root
 // bindings and one opaque token from the existing shared native provider.
 const issuedSource=(()=>{
  const keys=['x','y','w','h','_identitySource','_geometryOwner','_geometryType','_contours','_structuralGridProof'];
  let records=new WeakMap();
  function immutable(value,memo,active,budget,depth=0){
   if(value===null||value===undefined||typeof value==='boolean')return true;
   if(typeof value==='number')return Number.isFinite(value);
   if(typeof value==='string')return(budget.strings+=value.length*2)<=8*1024*1024;
   if(typeof value!=='object'||depth>64||active.has(value))return false;
   if(memo.has(value))return true;
   if(!Object.isFrozen(value))return false;
   const array=Array.isArray(value),proto=Object.getPrototypeOf(value);
   if(array?proto!==Array.prototype:proto!==Object.prototype&&proto!==null)return false;
   const names=Reflect.ownKeys(value);
   if(++budget.nodes>65536||(budget.slots+=names.length)>524288)return false;
   if(array){const length=Object.getOwnPropertyDescriptor(value,'length');if(!length||!('value'in length)||names.length!==length.value+1||names.at(-1)!=='length')return false;for(let i=0;i<length.value;i++)if(names[i]!==String(i))return false;}
   active.add(value);
   for(const key of names){const d=Object.getOwnPropertyDescriptor(value,key);if(typeof key!=='string'||(budget.strings+=key.length*2)>8*1024*1024||!d||!('value'in d)||!immutable(d.value,memo,active,budget,depth+1))return false;}
   active.delete(value);memo.add(value);return true;
  }
  function root(value,memo,budget){
   if(!value||typeof value!=='object'||!Object.isFrozen(value)||Object.getPrototypeOf(value)!==Object.prototype)return null;
   const names=Reflect.ownKeys(value),values=[];
   if(names.length!==keys.length)return null;
   for(let i=0;i<keys.length;i++){const d=Object.getOwnPropertyDescriptor(value,keys[i]);if(names[i]!==keys[i]||!d||!('value'in d)||!d.enumerable||!immutable(d.value,memo,new WeakSet(),budget))return null;values.push(d.value);}
   return{value,values};
  }
  function sameRoot(binding){
   if(!binding||!Object.isFrozen(binding.value)||Object.getPrototypeOf(binding.value)!==Object.prototype)return false;
   const names=Reflect.ownKeys(binding.value);if(names.length!==keys.length)return false;
   for(let i=0;i<keys.length;i++){const d=Object.getOwnPropertyDescriptor(binding.value,keys[i]);if(names[i]!==keys[i]||!d||!('value'in d)||!d.enumerable||!Object.is(d.value,binding.values[i]))return false;}
   return true;
  }
  function single(values){
   if(!Array.isArray(values)||Object.getPrototypeOf(values)!==Array.prototype)return null;
   const names=Reflect.ownKeys(values),n=Object.getOwnPropertyDescriptor(values,'length'),d=Object.getOwnPropertyDescriptor(values,'0');
   return names.length===2&&names[0]==='0'&&names[1]==='length'&&n?.value===1&&d&&('value'in d)&&d.enumerable?d.value:null;
  }
  function begin(prior){try{const parent=single(prior),memo=new WeakSet(),budget={nodes:0,slots:0,strings:0},binding=root(parent,memo,budget);return binding?{prior,binding,memo,budget}:null;}catch(_){return null;}}
  function finish(plan,pixels,W,H,token,children,stable){
   try{
    if(!plan||!token)return false;
    const child=single(children),binding=root(child,plan.memo,plan.budget);
    if(!binding||binding.values[8]?.version!==VERSION||plan.binding.values[8]?.version!==P.VERSION)return false;
    const exact=()=>stable()&&single(plan.prior)===plan.binding.value&&single(children)===child&&sameRoot(plan.binding)&&sameRoot(binding);
    if(!exact()||!PanelRasterWitness.matches(pixels,W,H,token)||!exact()||!PanelRasterWitness.commit(token)||!PanelRasterWitness.matchesRetained(pixels,W,H,token)||!exact())return false;
    const next=new WeakMap();next.set(child,{child:binding,parent:plan.binding,token,W,H});records=next;return true;
   }catch(_){return false;}
  }
  function replay(pixels,W,H,children,prior){try{const child=single(children),parent=single(prior),record=child&&records.get(child);if(!record||record.child.value!==child||record.parent.value!==parent||record.W!==W||record.H!==H)return false;const exact=()=>single(children)===child&&single(prior)===parent&&sameRoot(record.child)&&sameRoot(record.parent);return exact()&&PanelRasterWitness.matchesRetained(pixels,W,H,record.token)&&exact();}catch(_){return false;}}
  return{begin,finish,replay};
 })();
 function withNativeCapture(img,run){
  let canvas;
  try{
   const before=P.sourceState(img);if(!before||!P.sourceReady(img))return null;
   const W=img.naturalWidth||img.width,H=img.naturalHeight||img.height;if(!Number.isSafeInteger(W)||!Number.isSafeInteger(H)||W<=0||H<=0||W*H>24000000)return null;
   const stable=()=>{const after=P.sourceState(img);return !!after&&P.sourceReady(img)&&before.every((v,i)=>v===after[i]);};
   canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;
   const g=canvas.getContext('2d',{willReadFrequently:true});if(!g)return null;g.drawImage(img,0,0);
   const pixels=g.getImageData(0,0,W,H).data;if(!stable())return null;
   const result=run(pixels,W,H,stable);return stable()?result:null;
  }catch(_){return null;}
  finally{if(canvas)canvas.width=canvas.height=1;}
 }
 // Only install() invokes this. Public analyzers/replayers/supplementImage do
 // not register roots. The token precedes sampling and checks the very same
 // private native bytes again after complete100 ->96 ->66 source analysis.
 function issuedSupplementImage(img,prior){
  if(!eligible(prior))return[];
  const plan=issuedSource.begin(prior),v=prior[0]._structuralGridProof;
  return withNativeCapture(img,(pixels,W,H,stable)=>{
   let token=null;
   try{
    if(plan)try{token=PanelRasterWitness.token(pixels,W,H);}catch(_){token=null;}
    const a=PanelMatteCells.sampleBilinearRGBA(pixels,W,H,v.analysisWidth,v.analysisHeight),out=analyzeRGBA(a,v.analysisWidth,v.analysisHeight,prior);
    if(!stable())return[];
    if(out.length)issuedSource.finish(plan,pixels,W,H,token,out,stable);
    return out;
   }finally{if(token)try{PanelRasterWitness.discard(token);}catch(_){}}
  })||[];
 }
 function readerSourceRaster(img,w,h,children,prior){
  return withNativeCapture(img,(pixels,W,H,stable)=>{
   const issued=issuedSource.replay(pixels,W,H,children,prior)&&stable();
   return{issued,analysis:issued?null:PanelMatteCells.sampleBilinearRGBA(pixels,W,H,w,h),stable};
  });
 }

 function supplementImage(img,prior){if(!eligible(prior))return[];const v=prior[0]._structuralGridProof,a=imageRaster(img,v.analysisWidth,v.analysisHeight);return a?analyzeRGBA(a,v.analysisWidth,v.analysisHeight,prior):[];}
 function marked(p){return p?._structuralGridProof?.version===VERSION||p?._structuralGridProof?.method===METHOD||p?._geometryType===TYPE;}
 function installReader(r){if(!r||r._articulatedUpperReader)return;const old=r.displayPanelContours,find=r.findPanelAt,zoom=r.zoomToPanel;function snapshot(v){try{return JSON.stringify(v);}catch(_){return null;}}
  function equalContext(state,reader){try{const img=reader.getPanelImageContext?.()?.img,source=P.sourceState(img);return state.img===img&&state.items.length===state.owners.length&&state.items.every((p,i)=>p===state.owners[i])&&source&&state.source.every((v,i)=>v===source[i]);}catch(_){return false;}}
  function context(reader){P.readerScopeGuard.check(reader);const owners=reader.currentPanels;if(!Array.isArray(owners)||!owners.some(marked))return null;if(P.readerScopeGuard.blocked(reader,'_articulatedUpperState'))return{owners,prior:owners.filter(p=>!marked(p)),previous:new Map(),valid:false};let img;try{img=reader.getPanelImageContext?.()?.img;}catch(_){img=null;}const source=P.sourceState(img);let state=reader._articulatedUpperState;if(state&&state.owners===owners&&state.img===img&&state.items.length===owners.length&&state.items.every((p,i)=>p===owners[i])&&state.source&&source&&state.source.every((n,i)=>n===source[i])){if(state.valid&&P.readerScopeGuard.unchanged(state.input,owners))return state;const key=snapshot(owners);if(!state.valid&&key!==null&&key===state.key&&P.readerScopeGuard.unchanged(state.input,owners))return state;}const prior=owners.filter(p=>!marked(p)),children=owners.filter(marked);state={owners,img,items:owners.slice(),source,input:P.readerScopeGuard.identity(owners),key:snapshot(owners),prior,previous:new Map(),valid:false,child:null,display:null};reader._articulatedUpperState=state;if(!state.input||!img||!source||!P.sourceReady(img)||!eligible(prior))return state;const v=prior[0]._structuralGridProof,captured=readerSourceRaster(img,v.analysisWidth,v.analysisHeight,children,prior),a=captured?.analysis,issued=captured?.issued===true;if(!captured||!issued&&(!a||!P.sourceReplay(prior[0],a,v.analysisWidth,v.analysisHeight)))return state;P.readerScopeGuard.under(reader,prior,()=>{state.previous.set(prior[0],old.call(reader,prior[0],reader.panelContours(prior[0])));});if(owners.length!==2||children.length!==1||owners[0]!==prior[0]||owners[1]!==children[0]||!validPanel(children[0])||!same(children[0]._structuralGridProof.prior,prior)||!same(state.previous.get(prior[0]),prior[0]._contours))return state;state.input=P.readerScopeGuard.identity(owners);if(!state.input)return state;state.canonical=P.readerScopeGuard.canonical(children[0]);if(!issued&&!sourceReplay(state.canonical,a,v.analysisWidth,v.analysisHeight,prior)||!P.readerScopeGuard.unchanged(state.input,owners)||!captured.stable())return state;if(reader.currentPanels!==owners||!equalContext(state,reader))return state;state.valid=true;state.child=children[0];state.display=P.readerScopeGuard.immutable(children[0])?children[0]._contours:state.canonical._contours;return state;}
  r.displayPanelContours=function(p,c=this.panelContours(p)){const pinned=P.readerScopeGuard.display(this,'_articulatedUpperState',p);if(pinned)return pinned.display;const state=context(this);if(marked(p))return state?.valid&&state.child===p?state.display:null;if(state?.previous.has(p))return state.previous.get(p);return state?P.readerScopeGuard.under(this,state.prior,()=>old.call(this,p,c)):old.call(this,p,c);};
  if(typeof find==='function')r.findPanelAt=function(x,y){const state=context(this);if(!state){const hit=find.call(this,x,y);return marked(hit)?null:hit;}const hit=P.readerScopeGuard.under(this,state.prior,()=>find.call(this,x,y));if(hit&&!marked(hit))return hit;return this.panelZoomEnabled&&state.valid&&this.pointInContours(state.display,x,y)?state.child:null;};
  if(typeof zoom==='function')r.zoomToPanel=function(p,...args){const pinned=P.readerScopeGuard.display(this,'_articulatedUpperState',p);if(pinned&&!pinned.display.length)return;const state=context(this);if(marked(p)){if(!state?.valid||state.child!==p)return;return P.readerScopeGuard.run(this,'_articulatedUpperState',state,()=>keepPriorContexts(this,'_articulatedUpperState',state,['_articulatedRimState'],()=>zoom.call(this,p,...args)));}if(!state?.prior.includes(p))return zoom.call(this,p,...args);return P.readerScopeGuard.under(this,state.prior,()=>zoom.call(this,p,...args));};r._articulatedUpperReader=true;
 }
 // A verified predecessor can see a temporary broader owner set during a
 // child zoom. Preserve it only while that exact authenticated scope survives.
 function keepPriorContexts(reader,key,state,keys,fn){
  const G=P.readerScopeGuard,equal=(a,b)=>{if(!Array.isArray(a)||!Array.isArray(b)||a.length!==b.length)return false;for(let i=0;i<a.length;i++)if(!Object.prototype.hasOwnProperty.call(a,i)||!Object.prototype.hasOwnProperty.call(b,i)||a[i]!==b[i])return false;return true;};
  function supported(q){if(!q||q.img!==state.img||!equal(q.source,state.source)||!equal(q.items,q.owners)||!G.unchanged(q.input,q.owners))return false;let index=-1;for(const p of q.items){index=state.items.indexOf(p,index+1);if(index<0)return false;}return true;}
  const saved=[];for(const name of keys){const q=reader[name];if(q?.valid===true&&q.canonical&&q.display?.length&&q.items?.includes(q.child)&&supported(q)&&G.immutable(q.canonical)&&G.immutable(q.display))saved.push([name,q]);}
  const comic=reader.comic,page=reader.index,loadToken=reader._panelLoadToken;
  const restore=()=>{try{const pin=G.display(reader,key,state.child);if(!pin?.display.length||pin.display!==state.display||reader.comic!==comic||reader.index!==page||reader._panelLoadToken!==loadToken||!G.unchanged(state.input,state.owners))return;for(const[name,previous]of saved){const current=reader[name];if(current!==previous&&current?.valid===false&&current.owners!==previous.owners&&previous.valid===true&&supported(previous)&&supported(current)&&current.items.length>previous.items.length&&current.items.includes(state.child)&&previous.items.every(p=>current.items.includes(p))&&G.immutable(previous.canonical)&&G.immutable(previous.display))reader[name]=previous;}}catch(_){}};
  try{const result=fn();if(result&&typeof result.then==='function')return Promise.resolve(result).finally(restore);restore();return result;}catch(error){restore();throw error;}
 }
 function install(d){if(!PanelStructuralGrid._articulatedUpper){const old=PanelStructuralGrid.validPanel;PanelStructuralGrid.validPanel=p=>p?._structuralGridProof?.version===VERSION?validPanel(p):old(p);PanelStructuralGrid._articulatedUpper=true;}if(typeof PanelGeometry!=='undefined'&&!PanelGeometry._articulatedUpper){const old=PanelGeometry.refine;PanelGeometry.refine=async function(url,p,log){return validPanel(p)?{...p}:old.call(this,url,p,log);};PanelGeometry._articulatedUpper=true;}if(typeof PanelEdgeSpill!=='undefined'&&!PanelEdgeSpill._articulatedUpper){for(const name of ['analyzeImage','analyzeRGBA']){const old=PanelEdgeSpill[name];if(typeof old==='function')PanelEdgeSpill[name]=function(...args){return validPanel(args[name==='analyzeImage'?1:3])?null:old.apply(this,args);};}PanelEdgeSpill._articulatedUpper=true;}if(!d||d._articulatedUpper)return;const old=d.detect;d.detect=async function(url,log){const prior=await old.call(this,url,log);if(!eligible(prior))return prior;try{const img=new Image();img.src=url;await img.decode();return prior.concat(issuedSupplementImage(img,prior));}catch(e){log?.('articulated upper cell deferred: '+e.message);return prior;}};d._articulatedUpper=true;}
 return{VERSION,eligible,validPanel,analyzeRGBA,sourceReplay,supplementImage,install,installReader,anchor,bodiesFrom,validateBodies,bodyWall,roofs,roofSummary,ownership,trace,validTrace,pathMask,measure,separators,separatorsValid};
})();
if(typeof PanelDetect!=='undefined')PanelArticulatedUpperCell.install(PanelDetect);
if(typeof module!=='undefined')module.exports=PanelArticulatedUpperCell;
