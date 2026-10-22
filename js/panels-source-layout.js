/* Source-measured dark frame cells. Geometry is decided before any tap.
 * Open rims and ambiguous inset ownership defer. Proved shared lettering groups retain every participating source scene.
 * No comic names, page indices, saved tap bounds or artwork signatures select a box. */
const PanelSourceLayout=(()=>{
 'use strict';
 const TYPE='source-layout-frame',VERSION=170,issued=new WeakMap(),states=new WeakMap(),observed=new WeakSet();
 const area=b=>(b[2]-b[0])*(b[3]-b[1]);
 const overlap=(a,b)=>Math.max(0,Math.min(a[2],b[2])-Math.max(a[0],b[0]))*Math.max(0,Math.min(a[3],b[3])-Math.max(a[1],b[1]));
 const claims=p=>p?._identitySource===TYPE;
 const canonical=p=>JSON.stringify([p.x,p.y,p.w,p.h,p._contours]);
 function signature(a,w,h){let x=2166136261,y=0x9e3779b9;for(let i=0;i<a.length;i++){x=Math.imul(x^a[i],16777619);y=Math.imul(y+a[i]+i,0x85ebca6b);}return [w,h,x>>>0,y>>>0].join(':');}
 function freeze(o){if(o&&typeof o==='object'&&!Object.isFrozen(o)){Object.values(o).forEach(freeze);Object.freeze(o);}return o;}
 function issue(mask,s,role,evidence){const rings=PanelMatteCells.tracePixelContours(mask,s.w,s.h,1);if(!rings?.length||rings.length>64)return null;const points=rings.flat(),box=[Math.min(...points.map(p=>p[0])),Math.min(...points.map(p=>p[1])),Math.max(...points.map(p=>p[0])),Math.max(...points.map(p=>p[1]))];const p={x:box[0]/s.w,y:box[1]/s.h,w:(box[2]-box[0])/s.w,h:(box[3]-box[1])/s.h,_identitySource:TYPE,_geometryOwner:'source-layout-contours',_geometryType:role,_contours:rings.map(r=>r.map(([x,y])=>({x:x/s.w,y:y/s.h}))),_sourceLayoutProof:freeze({version:VERSION,role,signature:s.signature,analysisWidth:s.w,analysisHeight:s.h,evidence})};issued.set(p._sourceLayoutProof,canonical(p));return p;}
 function validPanel(p){return !!(claims(p)&&!p._quad&&!p._outline&&p._sourceLayoutProof?.version===VERSION&&issued.get(p._sourceLayoutProof)===canonical(p));}
 function sourceState(img){if(!img)return null;if(!observed.has(img)&&img.addEventListener){const clear=()=>states.delete(img);img.addEventListener('load',clear);img.addEventListener('error',clear);observed.add(img);}if(states.has(img))return states.get(img);const W=img.naturalWidth||img.width,H=img.naturalHeight||img.height;if(!W||!H||W*H>24000000)return null;let c;try{c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d',{willReadFrequently:true});if(!g)return null;g.drawImage(img,0,0);const scale=Math.min(1,900/Math.max(W,H)),w=Math.round(W*scale),h=Math.round(H*scale),native=g.getImageData(0,0,W,H).data,rgba=PanelMatteCells.sampleBilinearRGBA(native,W,H,w,h),s=analyzeState(rgba,w,h);if(s){s.native={rgba:native,w:W,h:H};states.set(img,s);}return s;}catch(_){return null;}finally{if(c){c.width=1;c.height=1;}}}
 function validateImage(p,img){const s=sourceState(img);if(!s||p?._sourceLayoutProof?.signature!==s.signature)return false;if((['shared-scene-cell','shared-lettering-group'].includes(p?._sourceLayoutProof?.role)||p?._sourceLayoutProof?.evidence?.nativeSignature)&&p._sourceLayoutProof.evidence.nativeSignature!==nativeSignature(s))return false;if(validPanel(p))return true;
  // Serialized cells are admitted only after recomputing their source geometry.
  if(['matte-enclosed-scene','borderless-scene-corridor'].includes(p?._sourceLayoutProof?.role)){const qs=completeSceneCells(s,p._sourceLayoutProof.evidence.prior||[],null);for(const q of qs)if(canonical(q)===canonical(p)&&JSON.stringify(q._sourceLayoutProof)===JSON.stringify(p._sourceLayoutProof)){issued.set(p._sourceLayoutProof,canonical(p));return validPanel(p);}return false;}if(!['framed-cell','host-remainder','shared-scene-cell','shared-lettering-group'].includes(p?._sourceLayoutProof?.role))return false;const cells=makeCells(s),candidates=p._sourceLayoutProof.role==='framed-cell'?cells:makeHosts(s);for(const q of candidates)if(canonical(q)===canonical(p)&&JSON.stringify(q._sourceLayoutProof)===JSON.stringify(p._sourceLayoutProof)){issued.set(p._sourceLayoutProof,canonical(p));return validPanel(p);}return false;
 }
 function tracks(s,vertical,minRidge=.50){const {w,h,lum,paper}=s,T=vertical?h:w,P=vertical?w:h,out=[],at=(p,t)=>vertical?t*w+p:p*w+t,min=Math.max(36,Math.round(T*.10));
  for(let p=0;p<P;p++){let start=-1,last=-1,hits=0,ridges=0,bridge=0;
   const close=()=>{if(start<0)return;const len=last-start+1;if(len>=min&&hits/len>=.55&&(hits+bridge)/len>=.72&&ridges/len>=minRidge)out.push({p,lo:start,hi:last+1,hits,ridges});start=-1;last=-1;hits=0;ridges=0;bridge=0;};
   for(let t=0;t<T;t++){const i=at(p,t);let dark=false,ridge=false,body=false;for(let q=Math.max(0,p-2);q<=Math.min(P-1,p+2);q++){const j=at(q,t);body||=!!paper[j];if(lum[j]>=75)continue;dark=true;for(const d of [-4,-3,3,4]){const z=q+d;if(z>=0&&z<P&&lum[at(z,t)]-lum[j]>14){ridge=true;break;}}}
    if(dark){if(start<0)start=t;last=t;hits++;ridges+=ridge;}else if(start>=0&&body){bridge++;last=t;}else if(start>=0&&t-last>10)close();
   }close();
  }
  out.sort((a,b)=>a.p-b.p||a.lo-b.lo);const merged=[];for(const a of out){const b=merged.find(b=>Math.abs(a.p-b.p)<=4&&Math.min(a.hi,b.hi)-Math.max(a.lo,b.lo)>.8*Math.min(a.hi-a.lo,b.hi-b.lo));if(b){if(a.ridges>b.ridges)Object.assign(b,a);}else merged.push({...a});}return merged;
 }
 function side(s,vertical,p,lo,hi){const {w,h,lum,paper}=s,P=vertical?w:h,at=(q,t)=>vertical?t*w+q:q*w+t;let dark=0,ridge=0,bridge=0;for(let t=lo;t<hi;t++){let d=false,r=false,b=false;for(let q=Math.max(0,p-2);q<=Math.min(P-1,p+2);q++){const i=at(q,t);b||=!!paper[i];if(lum[i]<75){d=true;for(const delta of [-4,4])if(q+delta>=0&&q+delta<P&&lum[at(q+delta,t)]-lum[i]>14)r=true;}}dark+=d;ridge+=r;bridge+=d||b;}const n=hi-lo;return {dark:dark/n,ridge:ridge/n,closed:bridge/n};}
 const strong=e=>e.dark>=.85&&e.ridge>=.80||e.dark<.85&&e.dark>=.55&&e.closed>=.96&&e.ridge>=.55;
 function boxMask(b,w,h){const m=new Uint8Array(w*h);for(let y=b[1];y<b[3];y++)m.fill(1,y*w+b[0],y*w+b[2]);return m;}
 function analyzeState(rgba,w,h){if(!Number.isInteger(w)||!Number.isInteger(h)||w<150||h<150||w>900||h>900||rgba?.length!==w*h*4||typeof PanelColoredRims==='undefined')return null;const N=w*h,lum=new Float32Array(N),white=new Uint8Array(N);for(let i=0;i<N;i++){const j=i*4;if(rgba[j+3]!==255)return null;const a=[rgba[j],rgba[j+1],rgba[j+2]];lum[i]=a[0]*.299+a[1]*.587+a[2]*.114;white[i]=Math.min(...a)>195&&Math.max(...a)-Math.min(...a)<40;}const raw=PanelColoredRims.whiteBodies(white,w,h);if(!raw)return null;const bodies=raw.items.filter(b=>{if(b.box[0]===0||b.box[1]===0||b.box[2]===w||b.box[3]===h)return false;let dark=0,whiteN=0;for(const i of b.indices){dark+=lum[i]<100;whiteN+=white[i];}return dark/b.indices.length>=.012&&dark/b.indices.length<=.35&&whiteN/b.indices.length>=.55;});const paper=new Uint8Array(N);for(const b of bodies)for(const i of b.indices)paper[i]=1;const s={rgba,w,h,lum,white,bodies,paper,signature:signature(rgba,w,h)};s.horizontal=tracks(s,false);s.vertical=tracks(s,true);s.partialHorizontal=tracks(s,false,.20);s.partialVertical=tracks(s,true,.20);return s;}
 function rawCells(s){const {w,h,horizontal:hs,vertical:vs}=s,candidates=[];let trials=0;const H=hs.slice();if(vs.filter(v=>v.lo<4).length>=2)H.push({p:0,lo:0,hi:w,edge:true});if(vs.filter(v=>v.hi>h-4).length>=2)H.push({p:h-1,lo:0,hi:w,edge:true});
  for(let a=0;a<H.length;a++)for(let b=a+1;b<H.length;b++){const y0=Math.min(H[a].p,H[b].p),y1=Math.max(H[a].p,H[b].p)+1;if(y1-y0<h*.07)continue;let xs=vs.filter(v=>v.lo<=y0+7&&v.hi>=y1-7).map(v=>v.p);if(Math.max(H[a].lo,H[b].lo)<5&&!xs.some(x=>x<w*.06))xs.push(0);if(Math.min(H[a].hi,H[b].hi)>w-5&&!xs.some(x=>x>w*.94))xs.push(w-1);xs=[...new Set(xs)].sort((a,b)=>a-b);
   for(let c=0;c<xs.length;c++)for(let d=c+1;d<xs.length;d++){const x0=xs[c],x1=xs[d]+1,box=[x0,y0,x1,y1];if(x1-x0<w*.12||area(box)<w*h*.015||area(box)>w*h*.95||Math.max(H[a].lo,H[b].lo)>x0+7||Math.min(H[a].hi,H[b].hi)<x1-7)continue;if(++trials>4000)return [];
    const edges=[H[a].edge?{dark:1,ridge:1,closed:1}:side(s,false,H[a].p,x0,x1),H[b].edge?{dark:1,ridge:1,closed:1}:side(s,false,H[b].p,x0,x1),x0===0?{dark:1,ridge:1,closed:1}:side(s,true,x0,y0,y1),x1===w?{dark:1,ridge:1,closed:1}:side(s,true,x1-1,y0,y1)];if(edges.some(e=>!strong(e)))continue;if(xs.some(x=>x>x0+5&&x<x1-6&&strong(side(s,true,x,y0,y1)))||hs.some(t=>t.p>y0+5&&t.p<y1-6&&strong(side(s,false,t.p,x0,x1))))continue;let n=0,sum=0,sq=0,white=0;for(let y=y0+4;y<y1-4;y+=2)for(let x=x0+4;x<x1-4;x+=2){const i=y*w+x,v=s.lum[i];n++;sum+=v;sq+=v*v;white+=s.white[i];}if(!n||sq/n-(sum/n)**2<80||white/n>.85)continue;candidates.push({box,edges});if(candidates.length>96)return [];
   }
  }
  candidates.sort((a,b)=>area(a.box)-area(b.box));const unique=[];for(const c of candidates)if(!unique.some(q=>overlap(c.box,q.box)/Math.min(area(c.box),area(q.box))>.95&&c.box.every((v,k)=>Math.abs(v-q.box[k])<(k%2?h:w)*.025)))unique.push(c);
  // A grid envelope is not a cell; artwork objects inside a retained cell are not frames.
  const leaves=unique.filter(c=>{const inside=unique.filter(q=>q!==c&&area(q.box)<area(c.box)*.9&&overlap(q.box,c.box)/area(q.box)>.98);if(inside.length<2)return true;const mask=boxMask(c.box,w,h);let covered=0;for(const q of inside)for(let y=q.box[1];y<q.box[3];y++)for(let x=q.box[0];x<q.box[2];x++)if(mask[y*w+x]){mask[y*w+x]=0;covered++;}return covered/area(c.box)<.85;});return leaves.filter(c=>!leaves.some(q=>q!==c&&area(q.box)>area(c.box)*1.1&&overlap(q.box,c.box)/area(c.box)>.98));
 }
 function clippedInk(s,mask,box){if(!s.letters){s.whiteLabels=new Int32Array(s.w*s.h);components(s.white,s.w,s.h).forEach((c,k)=>{for(const i of c.indices)s.whiteLabels[i]=k+1;});const ink=new Uint8Array(s.w*s.h);for(let y=2;y<s.h-2;y++)for(let x=2;x<s.w-2;x++){const i=y*s.w+x;ink[i]=s.lum[i]<100&&(s.white[i-2]||s.white[i+2]||s.white[i-2*s.w]||s.white[i+2*s.w]);}s.letters=components(ink,s.w,s.h).filter(c=>c.indices.length>=2&&c.indices.length<200&&c.box[2]-c.box[0]<s.w*.12&&c.box[3]-c.box[1]<s.h*.025);}const suspects=[];for(const c of s.letters){if(c.indices.reduce((n,i)=>n+mask[i],0)>=c.indices.length*.5)continue;const x=(c.box[0]+c.box[2])/2|0,y=(c.box[1]+c.box[3])/2|0;const labels=new Set();for(const i of c.indices){const x=i%s.w,y=i/s.w|0;for(const [dx,dy]of [[-1,0],[1,0],[0,-1],[0,1],[-2,0],[2,0],[0,-2],[0,2]]){const X=x+dx,Y=y+dy;if(X>=0&&Y>=0&&X<s.w&&Y<s.h&&s.whiteLabels[Y*s.w+X])labels.add(s.whiteLabels[Y*s.w+X]);}}let near=false;for(let side=0;side<4;side++){const v=side>=2,p=[box[1],box[3]-1,box[0],box[2]-1][side],t=v?y:x,d=(v?x:y)-p;if(Math.abs(d)>14||t<(v?box[1]:box[0])-3||t>(v?box[3]:box[2])+3)continue;for(let q=Math.max(0,p-1);q<=Math.min((v?s.w:s.h)-1,p+1);q++)if(labels.has(s.whiteLabels[v?t*s.w+q:q*s.w+t]))near=true;}if(near&&c.box[3]-c.box[1]>=3)suspects.push(c.box);}for(const b of suspects){const y=(b[1]+b[3])/2,row=suspects.filter(q=>Math.abs((q[1]+q[3])/2-y)<=3).sort((a,b)=>a[0]-b[0]);let n=0,last=-100;for(const q of row){n=q[0]-last<=9?n+1:1;last=q[2];if(n>=4)return true;}}return false;}
 // A compact isolated caption may sit mostly outside its own frame. Require
 // one occluded rim, observed ink stubs on both ends and no competing cell.
 function rimPaperAttachment(s,c,body){const b=c.box,r=body.box;let attached=0;for(let k=0;k<4;k++){const v=k>=2,p=[b[1],b[3]-1,b[0],b[2]-1][k],a=v?1:0,z=v?0:1,lo=r[a],hi=r[a+2],start=b[a],end=b[a+2];if(!(r[z]<p&&r[z+2]>p)||lo<start+3||hi>end-3||hi-lo>(end-start)*.50||Math.max(0,b[z]-r[z],r[z+2]-b[z+2])>(v?s.w:s.h)*.06)continue;const before=side(s,v,p,Math.max(start,lo-12),lo),after=side(s,v,p,hi,Math.min(end,hi+12));if(before.dark>=.55&&before.ridge>=.50&&after.dark>=.55&&after.ridge>=.50)attached++;}return attached===1;}
 // A coarse contrast path only nominates an attachment. It cannot supply
 // foreground geometry; every nomination must be proved in native pixels.
function rimNominations(s,c){const {w,h,lum}=s,b=c.box,found=[];for(let rim=0;rim<4;rim++){const v=rim>=2,p=[b[1],b[3]-1,b[0],b[2]-1][rim],dir=rim===0||rim===2?-1:1,T=v?h:w,Q=v?w:h,lo=v?b[1]:b[0],hi=v?b[3]:b[2],depth=Math.min(Math.ceil(Q*.08),Math.floor((v?b[2]-b[0]:b[3]-b[1])*.3));if(p+dir*(depth+2)<0||p+dir*(depth+2)>=Q)continue;const at=(t,d)=>v?t*w+p+dir*d:(p+dir*d)*w+t;
 const baseline=new Float32Array(T);let sum=0,sq=0,n=0;for(let t=lo;t<hi;t++){const samples=[];for(let d=depth-12;d<=depth;d+=2)samples.push(lum[at(t,d)]);samples.sort((a,b)=>a-b);baseline[t]=samples[3];sum+=baseline[t];sq+=baseline[t]**2;n++;}const bg=sum/n,variance=sq/n-bg*bg;if(bg>45||variance>4)continue;
 const mask=new Uint8Array(w*h);for(let d=1;d<=depth;d++)for(let t=lo;t<hi;t++){const i=at(t,d);mask[i]=lum[i]>=baseline[t]+12&&!s.paper[i];}
 for(const comp of components(mask,w,h)){if(comp.indices.length<30)continue;let a=T,z=0,D=0,touch=false,contact=0;const profile=new Int16Array(T);for(const i of comp.indices){const t=v?Math.floor(i/w):i%w,q=v?i%w:Math.floor(i/w),d=(q-p)*dir;a=Math.min(a,t);z=Math.max(z,t+1);D=Math.max(D,d);profile[t]=Math.max(profile[t],d);if(d===1)contact++;if(t<=lo||t>=hi-1||d>=depth)touch=true;}if(touch||D<6||z-a>(hi-lo)*.25||a<lo+16||z>hi-16||contact<4)continue;
 const before=side(s,v,p,a-12,a),after=side(s,v,p,z,z+12);if(before.ridge<.75||after.ridge<.75)continue;
 const contacts=comp.indices.filter(i=>{const q=v?i%w:Math.floor(i/w);return (q-p)*dir===1;}).map(i=>v?Math.floor(i/w):i%w).sort((a,b)=>a-b),paired=[];for(let t=a;t<z;t++){const outside=at(t,4),inside=at(t,-4);if(lum[outside]<baseline[t]+12||lum[inside]<baseline[t]+12)continue;let distance=0;for(let k=0;k<3;k++)distance+=Math.abs(s.rgba[outside*4+k]-s.rgba[inside*4+k]);if(distance<90)paired.push(t);}const spread=points=>points[points.length-1]-points[0]>=(z-a)*.30;if(!(contacts.length>=4&&spread(contacts)||paired.length>=3&&spread(paired)))continue;const entry=Math.max(contacts.length,paired.length);let edge=0,white=0;for(const i of comp.indices){const x=i%w,y=i/w|0;if(x>0&&x+1<w&&y>0&&y+1<h&&mask[i-1]&&mask[i+1]&&mask[i-w]&&mask[i+w])continue;edge++;let near=false;for(let dy=-3;dy<=3&&!near;dy++)for(let dx=-3;dx<=3;dx++){const X=x+dx,Y=y+dy;if(X>=0&&Y>=0&&X<w&&Y<h&&s.white[Y*w+X]){near=true;break;}}white+=near;}if(edge&&white/edge>=.50)continue;
 const indices=[];for(let t=a;t<z;t++){if(!profile[t])continue;for(let d=1;d<=profile[t];d++)indices.push(at(t,d));}found.push({side:rim,gap:[a,z],p,bg,variance,before,after,box:comp.box,entry,outside:indices.length,depth:D,frontier:comp.indices,indices});
 }
}return found;}

 // Prove a ray-simple foreground crossing against a stable dark backing.
 // Strong connected source paths locate the boundary; only then do their
 // bounded rays own the dark interior. A native fringe preserves antialiasing.
 function nativeProtrusion(s,c,q){
  if(!s.native)return null;const n=s.native,v=q.side>=2,dir=q.side===0||q.side===2?-1:1,b=c.box,T=v?s.h:s.w,Q=v?s.w:s.h,NT=v?n.h:n.w,NQ=v?n.w:n.h,st=NT/T,sq=NQ/Q;
  const rim=dir<0?Math.ceil(q.p*sq):Math.floor(q.p*sq),A=Math.max(0,Math.floor((q.gap[0]-4)*st)),Z=Math.min(NT,Math.ceil((q.gap[1]+4)*st)),D=Math.ceil(Math.min(Math.ceil(Q*.08),Math.floor((v?b[2]-b[0]:b[3]-b[1])*.3))*sq),W=Z-A,H=D;
  if(!W||!H||W*H>2000000||rim+dir*D<0||rim+dir*D>=NQ)return null;
  const at=(t,d)=>v?t*n.w+rim+dir*d:(rim+dir*d)*n.w+t,rgba=n.rgba,baseline=new Float32Array(W*3),sigma=new Float32Array(W);
  const direction=[0,0,0];for(const i of q.frontier)for(let k=0;k<3;k++)direction[k]+=s.rgba[i*4+k]/q.frontier.length;
  for(let t=A;t<Z;t++){let sum=0,sqLum=0,count=0;for(let k=0;k<3;k++){const values=[];for(let d=Math.max(1,D-Math.ceil(8*sq));d<=D;d+=2)values.push(rgba[at(t,d)*4+k]);values.sort((a,b)=>a-b);baseline[(t-A)*3+k]=values[values.length>>1];}for(let d=Math.max(1,D-Math.ceil(8*sq));d<=D;d+=2){const i=at(t,d)*4,value=rgba[i]*.299+rgba[i+1]*.587+rgba[i+2]*.114;sum+=value;sqLum+=value*value;count++;}sigma[t-A]=Math.sqrt(Math.max(0,sqLum/count-(sum/count)**2));}
  for(let k=0;k<3;k++)direction[k]-=baseline.reduce((sum,value,j)=>sum+(j%3===k?value:0),0)/W;
  const length=Math.hypot(...direction);if(length<12)return null;for(let k=0;k<3;k++)direction[k]/=length;
  const seed=new Uint8Array(s.w*s.h);for(const i of q.frontier){const x=i%s.w,y=i/s.w|0;for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const X=x+dx,Y=y+dy;if(X>=0&&Y>=0&&X<s.w&&Y<s.h)seed[Y*s.w+X]=1;}}
  const sourceIndex=(t,d)=>{const p=rim+dir*d,x=v?p:t,y=v?t:p;return Math.min(s.h-1,Math.floor((y+.5)*s.h/n.h))*s.w+Math.min(s.w-1,Math.floor((x+.5)*s.w/n.w));};
  const mask=new Uint8Array(W*H);for(let d=1;d<=D;d++)for(let t=A;t<Z;t++){if(!seed[sourceIndex(t,d)])continue;const i=at(t,d)*4;let signal=0;for(let k=0;k<3;k++)signal+=(rgba[i+k]-baseline[(t-A)*3+k])*direction[k];mask[(d-1)*W+t-A]=signal>=Math.max(8,sigma[t-A]*3);}
  const parts=components(mask,W,H).map(part=>{let contact=0,nomination=0;for(const i of part.indices){const t=A+i%W,d=1+(i/W|0);contact+=d<=Math.ceil(2*sq);nomination+=seed[sourceIndex(t,d)];}return {...part,contact,nomination};}).filter(part=>part.contact>=Math.ceil(3*st)).sort((a,b)=>b.indices.length-a.indices.length),part=parts[0];
  if(!part||part.indices.length<q.frontier.length*st*sq*.4||part.box[0]===0||part.box[2]===W||part.box[3]===H)return null;
  const profile=new Int32Array(W);let edges=0,white=0;for(const i of part.indices){const x=i%W,y=i/W|0;profile[x]=Math.max(profile[x],y+1);if(x&&y&&x+1<W&&y+1<H&&mask[i-1]&&mask[i+1]&&mask[i-W]&&mask[i+W])continue;edges++;const j=at(A+x,y+1)*4;if(Math.min(rgba[j],rgba[j+1],rgba[j+2])>195&&Math.max(rgba[j],rgba[j+1],rgba[j+2])-Math.min(rgba[j],rgba[j+1],rgba[j+2])<40)white++;}if(!edges||white/edges>=.50)return null;
  const fringe=2,expanded=new Int32Array(W);for(let t=0;t<W;t++)if(profile[t])for(let u=Math.max(0,t-fringe);u<=Math.min(W-1,t+fringe);u++)expanded[u]=Math.max(expanded[u],profile[t]+fringe);
  if(expanded[0]||expanded[W-1]||expanded.some(d=>d>=D))return null;
  const projected=new Set();let nativePixels=0;for(let t=0;t<W;t++)for(let d=1;d<=expanded[t];d++){const p=rim+dir*d,x=v?p:A+t,y=v?A+t:p;nativePixels++;const x0=Math.floor(x*s.w/n.w),x1=Math.ceil((x+1)*s.w/n.w),y0=Math.floor(y*s.h/n.h),y1=Math.ceil((y+1)*s.h/n.h);for(let Y=y0;Y<y1;Y++)for(let X=x0;X<x1;X++)projected.add(Y*s.w+X);}
  if(!projected.size||part.box[2]-part.box[0]<(q.gap[1]-q.gap[0])*st*.70||part.box[3]<q.depth*sq*.80)return null;const indices=[...projected],xs=indices.map(i=>i%s.w),ys=indices.map(i=>i/s.w|0),box=[Math.min(...xs),Math.min(...ys),Math.max(...xs)+1,Math.max(...ys)+1];return {side:q.side,gap:q.gap,p:q.p,background:q.bg,variance:q.variance,entry:q.entry,box,nativeBox:part.box,nativePixels,indices};
 }
 function makeCells(s){if(s.cells)return s.cells;const candidates=rawCells(s),masks=candidates.map(c=>boxMask(c.box,s.w,s.h)),blocked=new Set();
  for(const body of s.bodies){const ranked=candidates.map((c,k)=>({k,ratio:body.indices.reduce((n,i)=>n+masks[k][i],0)/body.indices.length})).sort((a,b)=>b.ratio-a.ratio),shares=ranked.filter(v=>v.ratio>=.18);if(ranked[0]?.ratio>=.60&&(ranked[1]?.ratio||0)<.25||shares.length===1&&rimPaperAttachment(s,candidates[shares[0].k],body)){const owner=ranked[0].k;for(const i of body.indices)masks[owner][i]=1;}else if(shares.length>1)shares.forEach(v=>blocked.add(v.k));}
  const protrusions=candidates.map((c,k)=>blocked.has(k)||s.disableForeground?[]:rimNominations(s,c).map(q=>nativeProtrusion(s,c,q)).filter(q=>q&&!masks.some((m,j)=>j!==k&&q.indices.some(i=>m[i]))));
  s.foregroundProofs=[];for(let k=0;k<protrusions.length;k++)for(const q of protrusions[k]){const ids=new Set(q.indices);if(protrusions.some((row,j)=>j!==k&&row.some(r=>r.indices.reduce((sum,i)=>sum+ids.has(i),0)/Math.min(q.indices.length,r.indices.length)>.50)))continue;for(const i of q.indices)masks[k][i]=1;const proof=Object.fromEntries(Object.entries(q).filter(([key])=>key!=='indices'));(candidates[k].protrusions||=[]).push(proof);s.foregroundProofs.push(proof);}
  s.cellMasks=masks;s.cellBoxes=candidates.map(c=>c.box);s.blocked=blocked;s.cells=candidates.map((c,k)=>blocked.has(k)||clippedInk(s,masks[k],c.box)?null:issue(masks[k],s,'framed-cell',{box:c.box,sides:c.edges,...(c.protrusions?{protrusions:c.protrusions,nativeSignature:nativeSignature(s)}:{})})).filter(Boolean);return s.cells;
 }
 function establishedCoverage(prior){if(!Array.isArray(prior)||!prior.length)return false;const established=prior.filter(p=>p?._identitySource&&!['v73','v99','v100'].includes(p._identitySource));if(!established.length)return false;const mask=new Uint8Array(128*128);for(const p of established){const x0=Math.max(0,Math.floor(p.x*128)),y0=Math.max(0,Math.floor(p.y*128)),x1=Math.min(128,Math.ceil((p.x+p.w)*128)),y1=Math.min(128,Math.ceil((p.y+p.h)*128));for(let y=y0;y<y1;y++)mask.fill(1,y*128+x0,y*128+x1);}return mask.reduce((a,b)=>a+b,0)/mask.length>=.88;}
 function components(mask,w,h){const seen=new Uint8Array(mask.length),queue=new Int32Array(mask.length),out=[];for(let seed=0;seed<mask.length;seed++)if(mask[seed]&&!seen[seed]){let n=1,head=0;queue[0]=seed;seen[seed]=1;let x0=w,y0=h,x1=0,y1=0;while(head<n){const i=queue[head++],x=i%w,y=i/w|0;x0=Math.min(x0,x);x1=Math.max(x1,x+1);y0=Math.min(y0,y);y1=Math.max(y1,y+1);const add=j=>{if(mask[j]&&!seen[j]){seen[j]=1;queue[n++]=j;}};if(x)add(i-1);if(x+1<w)add(i+1);if(y)add(i-w);if(y+1<h)add(i+w);}out.push({indices:queue.slice(0,n),box:[x0,y0,x1,y1]});}return out;}
 // Divider evidence must belong to the proposed host, not the rest of a track
 // elsewhere on the page. A proved cell's rim already has an owner.
 function partitionEvidence(s,mask,box,line,v){const lo=Math.max(line.lo,v?box[1]:box[0]),hi=Math.min(line.hi,v?box[3]:box[2]),P=v?s.w:s.h;let free=0,ridge=0,paired=0;for(let t=lo;t<hi;t++){if(!mask[v?t*s.w+line.p:line.p*s.w+t]||(s.hostBankBoxes||s.cellBoxes).some(b=>t>=(v?b[1]:b[0])-7&&t<(v?b[3]:b[2])+7&&Math.min(Math.abs(line.p-(v?b[0]:b[1])),Math.abs(line.p-(v?b[2]-1:b[3]-1)))<=7))continue;free++;let r=false,both=false;const lum=q=>s.lum[v?t*s.w+q:q*s.w+t];for(let q=Math.max(0,line.p-2);q<=Math.min(P-1,line.p+2);q++)if(lum(q)<75){const left=q>=4&&lum(q-4)-lum(q)>14,right=q+4<P&&lum(q+4)-lum(q)>14;r||=left||right;both||=left&&right;}ridge+=r;paired+=both;}const n=hi-lo;return {lo,hi,free:n?free/n:0,ridge:n?ridge/n:0,paired:n?paired/n:0};}
 function exposedCorner(s,mask,box){const bw=box[2]-box[0],bh=box[3]-box[1],profiles=new Map(),profile=(line,v)=>{if(!profiles.has(line))profiles.set(line,partitionEvidence(s,mask,box,line,v));return profiles.get(line);},eligible=(line,v)=>{const e=profile(line,v);return e.hi-e.lo>=(v?bh:bw)*.18&&e.ridge>=.55&&e.paired>=.50&&e.free>.75;},crossbar=(line,v)=>{const e=profile(line,v);return e.hi-e.lo>=(v?bh:bw)*.8&&e.ridge>=.60&&line.p>(v?box[0]:box[1])+5&&line.p<(v?box[2]:box[3])-6&&e.free>.7;};if(s.partialHorizontal.some(t=>crossbar(t,false))||s.partialVertical.some(t=>crossbar(t,true)))return true;const hs=s.partialHorizontal.filter(t=>eligible(t,false)),vs=s.partialVertical.filter(t=>eligible(t,true));return hs.some(a=>vs.some(b=>b.p>box[0]+7&&b.p<box[2]-7&&a.p>box[1]+7&&a.p<box[3]-7&&Math.min(Math.abs(b.p-a.lo),Math.abs(b.p-a.hi))<=7&&Math.min(Math.abs(a.p-b.lo),Math.abs(a.p-b.hi))<=7));}
// Short sustained contrast rails stop at artwork instead of inheriting a
// long dark track. Every hidden segment must belong to a closed peer.
function occlusionTracks(s,v){const T=v?s.h:s.w,Q=v?s.w:s.h,at=(q,t)=>v?t*s.w+q:q*s.w+t,out=[];
 for(let p=0;p<Q;p++){let start=-1,last=-1,n=0;const end=()=>{if(start>=0&&last-start+1>=36&&n/(last-start+1)>=.80)out.push({p,lo:start,hi:last+1,n});start=-1;last=-1;n=0;};for(let t=0;t<T;t++){let hit=false;for(let q=Math.max(0,p-2);q<=Math.min(Q-1,p+2);q++)if(s.lum[at(q,t)]<75&&[-4,4].some(d=>q+d>=0&&q+d<Q&&s.lum[at(q+d,t)]-s.lum[at(q,t)]>14))hit=true;if(hit){if(start<0)start=t;last=t;n++;}else if(start>=0&&t-last>10)end();}end();}
 const merged=[];for(const a of out){const b=merged.find(b=>Math.abs(a.p-b.p)<=4&&Math.min(a.hi,b.hi)-Math.max(a.lo,b.lo)>.8*Math.min(a.hi-a.lo,b.hi-b.lo));if(b){if(a.n>b.n)Object.assign(b,a);}else merged.push(a);}return merged;
}
function occlusionBank(s){const {w,h}=s,H=occlusionTracks(s,false),V=occlusionTracks(s,true),cells=[],seen=new Set();let trials=0,steps=0;
 if(H.length>96||V.length>96)return [];
 function evidence(v,p,lo,hi){let n=0,dark=0,ridge=0,closed=0,hidden=0;for(let t=lo;t<hi;t++){const x=v?p:t,y=v?t:p;if(cells.some(b=>x>=b[0]-2&&x<b[2]+2&&y>=b[1]-2&&y<b[3]+2)){hidden++;continue;}const e=side(s,v,p,t,t+1);n++;dark+=e.dark;ridge+=e.ridge;closed+=e.closed;}return {n,hidden,dark:dark/n,ridge:ridge/n,closed:closed/n};}
 for(let pass=0;pass<8;pass++){const candidates=[];const cache=new Map();const observed=(v,p,lo,hi)=>{const key=[v,p,lo,hi].join(':');if(!cache.has(key))cache.set(key,evidence(v,p,lo,hi));return cache.get(key);};for(let a=0;a<H.length;a++)for(let z=a+1;z<H.length;z++){const y0=Math.min(H[a].p,H[z].p),y1=Math.max(H[a].p,H[z].p)+1;if(y1-y0<h*.07)continue;const vs=V.filter(v=>Math.min(v.hi,y1)-Math.max(v.lo,y0)>=36);for(let c=0;c<vs.length;c++)for(let d=c+1;d<vs.length;d++){
  if(++steps>4000000)return [];const x0=Math.min(vs[c].p,vs[d].p),x1=Math.max(vs[c].p,vs[d].p)+1,b=[x0,y0,x1,y1],key=b.join(':');if(seen.has(key)||(x1-x0)<w*.06||(x1-x0)*(y1-y0)<w*h*.015||(x1-x0)*(y1-y0)>w*h*.60||Math.max(H[a].lo,H[z].lo)>x1-36||Math.min(H[a].hi,H[z].hi)<x0+36)continue;
  if(++trials>300000)return [];const e=[observed(false,y0,x0,x1),observed(false,y1-1,x0,x1),observed(true,x0,y0,y1),observed(true,x1-1,y0,y1)];if(e.some(q=>q.n<36||q.n/(q.n+q.hidden)<.18||!strong(q)))continue;
  // An interior source rail not covered by a peer makes this an envelope.
  if(V.some(t=>t.p>x0+6&&t.p<x1-7&&(()=>{const q=observed(true,t.p,y0,y1);return q.n>=36&&q.n/(y1-y0)>.6&&strong(q);})())||H.some(t=>t.p>y0+6&&t.p<y1-7&&(()=>{const q=observed(false,t.p,x0,x1);return q.n>=36&&q.n/(x1-x0)>.6&&strong(q);})()))continue;
  let n=0,sum=0,sq=0,white=0;for(let y=y0+4;y<y1-4;y+=2)for(let x=x0+4;x<x1-4;x+=2){if(cells.some(q=>x>=q[0]&&x<q[2]&&y>=q[1]&&y<q[3]))continue;const i=y*w+x,value=s.lum[i];n++;sum+=value;sq+=value*value;white+=s.white[i];}if(!n||sq/n-(sum/n)**2<80||white/n>.85)continue;
  candidates.push({b,e});
 }}
 candidates.sort((a,b)=>((a.b[2]-a.b[0])*(a.b[3]-a.b[1]))-((b.b[2]-b.b[0])*(b.b[3]-b.b[1])));let added=0;for(const c of candidates){seen.add(c.b.join(':'));if(cells.some(b=>{const inter=Math.max(0,Math.min(b[2],c.b[2])-Math.max(b[0],c.b[0]))*Math.max(0,Math.min(b[3],c.b[3])-Math.max(b[1],c.b[1]));return inter/Math.min((b[2]-b[0])*(b[3]-b[1]),(c.b[2]-c.b[0])*(c.b[3]-c.b[1]))>.95;}))continue;cells.push(c.b);added++;}if(!added)break;
 }return cells;
}

 // A white-outlined colored foreground token crossing an inset cannot be
 // removed as an ordinary rectangular hole. Leave its ownership upstream.
 function crossingForeground(s,occupied){const {w,h,rgba}=s;for(let channel=0;channel<3;channel++){const mask=new Uint8Array(w*h);for(let i=0;i<mask.length;i++){const j=i*4,a=rgba[j],b=rgba[j+1],c=rgba[j+2],hi=Math.max(a,b,c),lo=Math.min(a,b,c),owner=a===hi?0:b===hi?1:2;mask[i]=hi>=75&&hi-lo>=45&&owner===channel;}for(const c of components(mask,w,h)){const n=c.indices.length;if(n<100||n>w*h*.10)continue;let inside=0;for(const i of c.indices)inside+=occupied[i];if(inside/n<.05||inside/n>.95)continue;let boundary=0,white=0;for(const i of c.indices){const x=i%w,y=i/w|0;if(x>0&&x+1<w&&y>0&&y+1<h&&mask[i-1]&&mask[i+1]&&mask[i-w]&&mask[i+w])continue;boundary++;let near=false;for(let dy=-3;dy<=3&&!near;dy++)for(let dx=-3;dx<=3;dx++){const X=x+dx,Y=y+dy;if(X>=0&&Y>=0&&X<w&&Y<h&&s.white[Y*w+X]){near=true;break;}}white+=near;}if(boundary&&white/boundary>=.60)return true;}}return false;}
 // Group geometry is a union of source-measured scene masks. A shared
 // inset stays independently selectable; its scene is also retained in the
 // group because removing that scene would bisect its foreground lettering.
 // Coarse color nominations never prove ownership: reconnect the native core,
 // measure its surrounding white outline and prove crossings in source pixels.
 function nativeSignature(s){return s.nativeSignature||(s.nativeSignature=s.native?signature(s.native.rgba,s.native.w,s.native.h):null);}
 function sharedLettering(s,boxes){
  if(!s.native)return null;const {w,h,rgba}=s,N=w*h,scale=s.native.w/w,proposals=[];
  const colored=(a,j,ch)=>{const hi=Math.max(a[j],a[j+1],a[j+2]),lo=Math.min(a[j],a[j+1],a[j+2]);return hi>=75&&hi-lo>=45&&(a[j]===hi?0:a[j+1]===hi?1:2)===ch;};
  for(let ch=0;ch<3;ch++){const m=new Uint8Array(N);for(let i=0;i<N;i++)m[i]=colored(rgba,i*4,ch);for(const c of components(m,w,h)){
   if(c.indices.length<100||c.indices.length>N*.10)continue;let boundary=0,white=0;for(const i of c.indices){const x=i%w,y=i/w|0;if(x&&y&&x+1<w&&y+1<h&&m[i-1]&&m[i+1]&&m[i-w]&&m[i+w])continue;boundary++;let near=false;for(let dy=-3;dy<=3&&!near;dy++)for(let dx=-3;dx<=3;dx++){const X=x+dx,Y=y+dy;if(X>=0&&Y>=0&&X<w&&Y<h&&s.white[Y*w+X]){near=true;break;}}white+=near;}if(white/boundary<.85)continue;
   const n=s.native,pad=Math.ceil(5*scale),b=[Math.max(0,Math.floor(c.box[0]*n.w/w)-pad),Math.max(0,Math.floor(c.box[1]*n.h/h)-pad),Math.min(n.w,Math.ceil(c.box[2]*n.w/w)+pad),Math.min(n.h,Math.ceil(c.box[3]*n.h/h)+pad)],W=b[2]-b[0],H=b[3]-b[1],mask=new Uint8Array(W*H);
   for(let y=0;y<H;y++)for(let x=0;x<W;x++)mask[y*W+x]=colored(n.rgba,((y+b[1])*n.w+x+b[0])*4,ch);
   const parts=components(mask,W,H).filter(q=>q.box[0]>0&&q.box[1]>0&&q.box[2]<W&&q.box[3]<H).sort((a,b)=>b.indices.length-a.indices.length),core=parts[0];if(!core||core.indices.length<c.indices.length*scale*scale*.7)continue;
   const radius=Math.ceil(3*scale),shares=boxes.map(()=>0);let edges=0,outlined=0;for(const i of core.indices){const x=i%W,y=i/W|0,X=x+b[0],Y=y+b[1];boxes.forEach((q,k)=>{if((X+.5)*w/n.w>=q[0]&&(X+.5)*w/n.w<q[2]&&(Y+.5)*h/n.h>=q[1]&&(Y+.5)*h/n.h<q[3])shares[k]++;});if(x&&y&&x+1<W&&y+1<H&&mask[i-1]&&mask[i+1]&&mask[i-W]&&mask[i+W])continue;edges++;let near=false;for(let dy=-radius;dy<=radius&&!near;dy++)for(let dx=-radius;dx<=radius;dx++){const A=X+dx,B=Y+dy;if(A<0||B<0||A>=n.w||B>=n.h)continue;const j=(B*n.w+A)*4,a=n.rgba;const hi=Math.max(a[j],a[j+1],a[j+2]),lo=Math.min(a[j],a[j+1],a[j+2]);if(lo>195&&hi-lo<40){near=true;break;}}outlined+=near;}
   if(!edges||outlined/edges<.85)continue;const coreMask=new Uint8Array(W*H);for(const i of core.indices)coreMask[i]=1;const holes=components(coreMask.map(v=>1-v),W,H).filter(q=>q.box[0]>0&&q.box[1]>0&&q.box[2]<W&&q.box[3]<H&&q.indices.length>core.indices.length*.02);
   proposals.push({ch,box:c.box,n:core.indices.length,outline:outlined/edges,holes:holes.length,shares:shares.map(v=>v/core.indices.length)});
  }}
  if(proposals.length>64)return null;const nested=proposals.filter(a=>proposals.some(b=>a!==b&&a.ch===b.ch&&area(a.box)<area(b.box)*.90&&overlap(a.box,b.box)/area(a.box)>.98));for(const a of nested)proposals.splice(proposals.indexOf(a),1);const visited=new Set();for(let seed=0;seed<proposals.length;seed++){if(visited.has(seed))continue;const ids=[seed];visited.add(seed);for(let k=0;k<ids.length;k++){const a=proposals[ids[k]],A=a.box;for(let j=0;j<proposals.length;j++){if(visited.has(j))continue;const b=proposals[j],B=b.box,dy=Math.min(A[3],B[3])-Math.max(A[1],B[1]),gap=Math.max(0,A[0]-B[2],B[0]-A[2]);if(a.ch===b.ch&&dy>=.20*Math.min(A[3]-A[1],B[3]-B[1])&&gap<=.30*Math.max(A[3]-A[1],B[3]-B[1])){visited.add(j);ids.push(j);}}}
   const token=ids.map(i=>proposals[i]);if(token.length<3||token.filter(q=>q.holes>0).length<2)continue;const shared=boxes.map((_,k)=>k).filter(k=>token.filter(q=>q.shares[k]>=.05&&q.shares[k]<=.95).length>=2);if(!shared.length)continue;
   // Another bank owns any substantial part of this token: do not resolve
   // only the convenient crossing and silently cut the remainder.
   if(boxes.some((_,k)=>!shared.includes(k)&&token.some(q=>q.shares[k]>=.05)))continue;
   return {shared,token,nativeSignature:nativeSignature(s)};
  }return null;
 }
 function sharedGroup(s,boxes,masks){const proof=sharedLettering(s,boxes);if(!proof)return [];const occupied=new Uint8Array(s.w*s.h);for(let k=0;k<masks.length;k++)if(!proof.shared.includes(k))for(let i=0;i<occupied.length;i++)occupied[i]|=masks[k][i];
  // Unrelated caption bodies remain with their nominal source owners.
  for(const body of s.bodies){if(body.indices.some(i=>occupied[i]))for(const i of body.indices)occupied[i]=1;}
  const free=occupied.map(v=>1-v),groups=[];for(const c of components(free,s.w,s.h)){if(c.indices.length<s.w*s.h*.10)continue;const mask=new Uint8Array(free.length);for(const i of c.indices)mask[i]=1;
   if(!proof.shared.every(k=>masks[k].reduce((n,v,i)=>n+(v&&mask[i]),0)/masks[k].reduce((n,v)=>n+v,0)>=.995))continue;
   if(!proof.token.every(q=>{const b=q.box;for(let y=Math.max(0,b[1]-4);y<Math.min(s.h,b[3]+4);y++)for(let x=Math.max(0,b[0]-4);x<Math.min(s.w,b[2]+4);x++)if(!mask[y*s.w+x])return false;return true;}))continue;
   const p=issue(mask,s,'shared-lettering-group',{bank:boxes,shared:proof.shared,token:proof.token,nativeSignature:proof.nativeSignature});if(p)groups.push(p);
  }if(!groups.length)return [];const peers=proof.shared.map(k=>issue(masks[k],s,'shared-scene-cell',{box:boxes[k],nativeSignature:proof.nativeSignature})).filter(Boolean);return [...peers,...groups];
 }
 function makeHosts(s){if(s.hosts)return s.hosts;makeCells(s);const {w,h}=s;let boxes=s.cellBoxes,masks=s.cellMasks,overlapping=false;if(!boxes.length)return s.hosts=[];const wide=bs=>bs.length&&(Math.max(...bs.map(b=>b[2]))-Math.min(...bs.map(b=>b[0])))/w>=.88&&Math.min(...bs.map(b=>b[0]))/w<=.06&&(w-Math.max(...bs.map(b=>b[2])))/w<=.06;if(!wide(boxes)){const measured=occlusionBank(s);if(!wide(measured))return s.hosts=[];overlapping=true;boxes=[...boxes,...measured];masks=[...masks,...measured.map(b=>boxMask(b,w,h))];}s.hostBankBoxes=boxes;const occupied=new Uint8Array(w*h);for(const mask of masks)for(let i=0;i<mask.length;i++)occupied[i]|=mask[i];
  if(crossingForeground(s,occupied)){const shared=sharedGroup(s,boxes,masks);if(shared.length)return s.hosts=shared;if(overlapping)return s.hosts=[];}
  // A measured bank reaching both margins divides the surrounding scene.
  // Whole ambiguous speech bodies remain excluded even when their cells defer.
  const paperOwned=new Set();for(const body of s.bodies){const ratios=masks.map(m=>body.indices.reduce((n,i)=>n+m[i],0)/body.indices.length).sort((a,b)=>b-a);if((ratios[0]>=.60&&(ratios[1]||0)<.25)||ratios.filter(v=>v>=.18).length>1){paperOwned.add(body);for(const i of body.indices)occupied[i]=1;}}
  const bankRows=new Uint8Array(h);for(let y=0;y<h;y++){let count=0;for(let x=0;x<w;x++)count+=occupied[y*w+x];if(count/w>=.85){bankRows[y]=1;occupied.fill(1,y*w,y*w+w);}}
  if(boxes.some(b=>area(b)<w*h*.08&&bankRows.slice(b[1],b[3]).reduce((a,b)=>a+b,0)/(b[3]-b[1])<.7))return s.hosts=[];const free=occupied.map(v=>1-v),hosts=[];for(const c of components(free,w,h)){const n=c.indices.length,b=c.box;if(n<w*h*.10||b[2]-b[0]<w*.20||b[3]-b[1]<h*.12)continue;const mask=new Uint8Array(w*h);let sum=0,sq=0,white=0;for(const i of c.indices){mask[i]=1;sum+=s.lum[i];sq+=s.lum[i]*s.lum[i];white+=s.white[i];}if(sq/n-(sum/n)**2<80||white/n>.80||exposedCorner(s,mask,b))continue;for(const body of s.bodies)if(!paperOwned.has(body)&&body.indices.reduce((n,i)=>n+mask[i],0)/body.indices.length>=.60)for(const i of body.indices)mask[i]=1;const p=issue(mask,s,'host-remainder',{bank:boxes,...(s.foregroundProofs?.length?{foreground:s.foregroundProofs,nativeSignature:nativeSignature(s)}:{})});if(p)hosts.push(p);}return s.hosts=hosts;
 }
 // A prior contour is comparison evidence only. It never supplies new geometry.
 // Rasterize with pixel-center, even-odd ownership so inset holes remain holes.
 function contourMask(p,s){const rings=p?._contours;if(!Array.isArray(rings)||!rings.length||rings.length>64||rings.some(r=>!Array.isArray(r)||r.length<3)||rings.flat().length>8192||rings.flat().some(q=>!q||!Number.isFinite(q.x)||!Number.isFinite(q.y)||q.x<0||q.x>1||q.y<0||q.y>1))return null;const mask=new Uint8Array(s.w*s.h);for(let y=0;y<s.h;y++){const row=(y+.5)/s.h,crossings=[];for(const ring of rings)for(let k=0;k<ring.length;k++){const a=ring[k],b=ring[(k+1)%ring.length];if((a.y>row)!==(b.y>row))crossings.push((a.x+(row-a.y)*(b.x-a.x)/(b.y-a.y))*s.w);}crossings.sort((a,b)=>a-b);for(let k=0;k+1<crossings.length;k+=2){const lo=Math.max(0,Math.ceil(crossings[k]-.5)),hi=Math.min(s.w,Math.ceil(crossings[k+1]-.5));if(hi>lo)mask.fill(1,y*s.w+lo,y*s.w+hi);}}return mask;}
 function completesPaper(candidate,owner,s){if(candidate._geometryType!=='framed-cell')return false;const a=[candidate.x,candidate.y,candidate.x+candidate.w,candidate.y+candidate.h],b=[owner.x,owner.y,owner.x+owner.w,owner.y+owner.h];if(b.some(v=>!Number.isFinite(v))||a.some((v,k)=>Math.abs(v-b[k])>Math.max(3/(k%2?s.h:s.w),(k%2?candidate.h:candidate.w)*.025)))return false;const old=contourMask(owner,s),next=contourMask(candidate,s);if(!old||!next)return false;let before=0,after=0,retained=0;for(let i=0;i<old.length;i++){before+=old[i];after+=next[i];retained+=old[i]&&next[i];}if(!before||retained/before<.995||after<before||after/before>1.10)return false;let recovered=0;for(const body of s.bodies){let owned=0,missing=0,ink=0;for(const i of body.indices){owned+=next[i];if(next[i]&&!old[i]){missing++;ink+=s.lum[i]<100;}}if(owned/body.indices.length>=.98&&missing/body.indices.length>=.01&&ink>=6)recovered++;}return recovered>=2;}
 // Reconcile weak legacy selections with complete, independently enclosed
 // exterior-matte cells. A rail alone is not a scene divider: it must have
 // page-connected matte on its outside. Artwork lines cannot split a frame.
 function sceneExterior(s){
  const {w,h,rgba}=s,hist=new Map(),samples=[];
  for(let x=0;x<w;x+=2)samples.push(x,(h-1)*w+x);
  for(let y=0;y<h;y+=2)samples.push(y*w,y*w+w-1);
  for(const i of samples){const key=[0,1,2].map(k=>Math.floor(rgba[i*4+k]/12)).join(',');hist.set(key,(hist.get(key)||0)+1);}
  const peak=[...hist].sort((a,b)=>b[1]-a[1])[0];if(!peak||peak[1]<samples.length*.25)return null;
  const color=peak[0].split(',').map(v=>Math.min(255,12*v+6));
  const match=new Uint8Array(w*h);for(let i=0;i<match.length;i++)match[i]=color.every((v,k)=>Math.abs(v-rgba[i*4+k])<=22);
  const mask=new Uint8Array(w*h),queue=new Int32Array(w*h);let n=0,head=0;
  const add=i=>{if(match[i]&&!mask[i]){mask[i]=1;queue[n++]=i;}};
  for(let x=0;x<w;x++){add(x);add((h-1)*w+x);}for(let y=0;y<h;y++){add(y*w);add(y*w+w-1);}
  while(head<n){const i=queue[head++],x=i%w,y=i/w|0;if(x)add(i-1);if(x+1<w)add(i+1);if(y)add(i-w);if(y+1<h)add(i+w);}
  return n>=w*h*.04&&n<=w*h*.60?{mask,color,pixels:n}:null;
 }
 function sceneHasDivider(s,field,b){
  const {w,h}=s,[x0,y0,x1,y1]=b;
  // A page-connected matte corridor can expose a separator whose dark rim
  // was fragmented or merged with artwork. Require viable art on both banks.
  for(const axis of [0,1]){
   const a=axis?x0:y0,z=axis?x1:y1,lo=axis?y0:x0,hi=axis?y1:x1,N=z-a,T=hi-lo,pad=Math.max(5,Math.round(N*.035)),margin=Math.max(8,Math.round(N*.08));
   for(let p=a+margin;p<z-margin;p++){
    let gutter=0,banks=0;for(let t=lo;t<hi;t++){const at=q=>axis?t*w+q:q*w+t;if(!field.mask[at(p)])continue;gutter++;banks+=!field.mask[at(p-pad)]&&!field.mask[at(p+pad)];}
    if(gutter/T>=.65&&banks/T>=.45)return true;
   }
  }return false;
 }

 function sceneRectangles(s,field){
  const {w,h}=s,out=[];let trials=0;const exposed=t=>{let n=0;for(let i=t.lo;i<t.hi;i++){let hit=false;for(const d of [-7,-5,5,7]){const q=t.p+d;if(q<0||q>=(t.vertical?w:h)){hit=true;continue;}hit||=!!field.mask[t.vertical?i*w+q:q*w+i];}n+=hit;}return n/(t.hi-t.lo)>=.08;};const hs=tracks(s,false,.80).filter(t=>exposed({...t,vertical:false})),vs=tracks(s,true,.80).filter(t=>exposed({...t,vertical:true}));
  // Border-reaching rails may use the image edge as their exposed cap.
  const H=hs.slice();if(vs.some(v=>v.lo<4))H.push({p:0,lo:0,hi:w,edge:true});if(vs.some(v=>v.hi>h-4))H.push({p:h-1,lo:0,hi:w,edge:true});
  const outside=(vertical,p,lo,hi,dir)=>{let hit=0;for(let t=lo;t<hi;t++){let yes=false;for(let d=3;d<=7;d++){const q=p+dir*d;if(q<0||q>=(vertical?w:h)){yes=true;break;}yes||=!!field.mask[vertical?t*w+q:q*w+t];}hit+=yes;}return hit/(hi-lo);};
  for(let a=0;a<H.length;a++)for(let z=a+1;z<H.length;z++){
   const top=H[a].p<H[z].p?H[a]:H[z],bottom=top===H[a]?H[z]:H[a],y0=top.p,y1=bottom.p+1;if(y1-y0<h*.08)continue;
   const xs=vs.filter(v=>v.lo<=y0+5&&v.hi>=y1-5).map(v=>v.p);if(Math.max(top.lo,bottom.lo)<5)xs.push(0);if(Math.min(top.hi,bottom.hi)>w-5)xs.push(w-1);
   const X=[...new Set(xs)].sort((a,b)=>a-b);
   for(let c=0;c<X.length;c++)for(let d=c+1;d<X.length;d++){
    const x0=X[c],x1=X[d]+1,b=[x0,y0,x1,y1];if(x1-x0<w*.12||area(b)<w*h*.025||area(b)>w*h*.80||Math.max(top.lo,bottom.lo)>x0+5||Math.min(top.hi,bottom.hi)<x1-5)continue;
    if(++trials>16000)return [];
    const edges=[top.edge?{dark:1,ridge:1,closed:1}:side(s,false,y0,x0,x1),bottom.edge?{dark:1,ridge:1,closed:1}:side(s,false,y1-1,x0,x1),x0===0?{dark:1,ridge:1,closed:1}:side(s,true,x0,y0,y1),x1===w?{dark:1,ridge:1,closed:1}:side(s,true,x1-1,y0,y1)];
    if(edges.some(e=>!strong(e)))continue;
    const matte=[outside(false,y0,x0,x1,-1),outside(false,y1-1,x0,x1,1),outside(true,x0,y0,y1,-1),outside(true,x1-1,y0,y1,1)];
    if(matte.filter(v=>v>=.75).length<2||matte.reduce((a,b)=>a+b,0)<2.65)continue;
    // A real internal separator has an exterior-connected gutter as well as
    // a rim. Dark texture or a gun barrel supplies neither complete ownership.
    if(vs.some(v=>v.p>x0+6&&v.p<x1-7&&v.lo<=y0+5&&v.hi>=y1-5&&strong(side(s,true,v.p,y0,y1))&&Math.max(outside(true,v.p,y0,y1,-1),outside(true,v.p,y0,y1,1))>=.75)||hs.some(v=>v.p>y0+6&&v.p<y1-7&&v.lo<=x0+5&&v.hi>=x1-5&&strong(side(s,false,v.p,x0,x1))&&Math.max(outside(false,v.p,x0,x1,-1),outside(false,v.p,x0,x1,1))>=.75))continue;
    let n=0,sum=0,sq=0;for(let y=y0+4;y<y1-4;y+=2)for(let x=x0+4;x<x1-4;x+=2){const v=s.lum[y*w+x];n++;sum+=v;sq+=v*v;}if(!n||sq/n-(sum/n)**2<500)continue;
    if(sceneHasDivider(s,field,b))continue;out.push({box:b,edges,matte,variance:sq/n-(sum/n)**2});
   }
  }
  out.sort((a,b)=>area(b.box)-area(a.box));const unique=[];for(const c of out)if(!unique.some(q=>overlap(c.box,q.box)/Math.min(area(c.box),area(q.box))>.95&&c.box.every((v,k)=>Math.abs(v-q.box[k])<=12)))unique.push(c);
  return unique.filter(c=>!unique.some(q=>q!==c&&area(q.box)>area(c.box)*1.12&&overlap(q.box,c.box)/area(c.box)>.98));
 }
 function nativeSceneBox(s,b,field){
  if(!s.native)return b.slice();const n=s.native,sc=[n.w/s.w,n.h/s.h],box=b.map((v,k)=>Math.round(v*sc[k%2]));
  for(let rim=0;rim<4;rim++){
   const vertical=rim>=2,index=[1,3,0,2][rim],dir=rim===0||rim===2?-1:1,P=vertical?n.w:n.h,T=vertical?n.h:n.w,expected=box[index]-(dir>0?1:0),scale=sc[vertical?0:1],lo=box[vertical?1:0],hi=box[vertical?3:2],at=(p,t)=>vertical?t*n.w+p:p*n.w+t;
   if(expected<Math.ceil(2*scale)&&dir<0){box[index]=0;continue;}if(expected>P-Math.ceil(2*scale)&&dir>0){box[index]=P;continue;}
   const scores=[];for(let p=Math.max(0,expected-Math.ceil(7*scale));p<=Math.min(P-1,expected+Math.ceil(7*scale));p++){
    let dark=0,total=0;const end=Math.min(T,hi-4),start=Math.max(0,lo+4);
    for(let t=start;t<end;t+=2){const i=at(p,t)*4,a=n.rgba,v=a[i]*.299+a[i+1]*.587+a[i+2]*.114;dark+=v<75;total++;}
    if(total)scores.push({p,score:dark/total});
   }
   const peak=Math.max(...scores.map(q=>q.score));if(peak<.85)return null;
   const good=scores.filter(q=>q.score>=Math.max(.85,peak-.015));
   // Use the nearest thin native ink band; an adjacent portrait or a broad
   // dark object cannot move the border to its outer silhouette.
   const runs=[];for(const q of good){const last=runs.at(-1);if(last&&q.p===last.at(-1)+1)last.push(q.p);else runs.push([q.p]);}
   const backed=r=>{if(r.length<=Math.ceil(6*scale))return true;const p=(dir<0?r[0]:r.at(-1))+dir*Math.ceil(2*scale);if(p<0||p>=P)return true;let matched=0,total=0;for(let t=Math.max(0,lo+4);t<Math.min(T,hi-4);t+=2){const j=at(p,t)*4;matched+=field.color.every((v,k)=>Math.abs(v-n.rgba[j+k])<=22);total++;}return total&&matched/total>=.85;};const band=runs.filter(backed).sort((a,b)=>Math.abs((a[0]+a.at(-1))/2-expected)-Math.abs((b[0]+b.at(-1))/2-expected))[0];if(!band)return null;
   box[index]=dir<0?band[0]:band.at(-1)+1;
  }
  return box[0]<box[2]&&box[1]<box[3]?box:null;
 }
 function issueScene(s,b,role,evidence){
  const native=!!s.native,t=native?{w:s.native.w,h:s.native.h,signature:s.signature}:s;
  return issue(boxMask(b,t.w,t.h),t,role,{...evidence,...(native?{nativeSignature:nativeSignature(s)}:{})});
 }

 function completeSceneCells(s,prior,log){
  if(!Array.isArray(prior)||!prior.length||typeof PanelRaggedGutters==='undefined')return prior;
  const weak=p=>!p._identitySource||['v73','v99','v100'].includes(p._identitySource),box=p=>[p.x*s.w,p.y*s.h,(p.x+p.w)*s.w,(p.y+p.h)*s.h];
  const field=sceneExterior(s);if(!field)return prior;
  const ragged=PanelRaggedGutters.analyzeRGBA(s.rgba,s.w,s.h,null),replaced=new Set(),added=[];
  // Correction requires an exclusive many-to-one or one-to-many enclosure,
  // not just a smaller box or a higher count from another detector.
  for(const p of ragged){
   const b=box(p),inside=prior.filter(q=>weak(q)&&overlap(box(q),b)/area(box(q))>=.95);
   if(inside.length>=2&&inside.reduce((n,q)=>n+area(box(q)),0)>=area(b)*.45&&!prior.some(q=>!weak(q)&&overlap(box(q),b)/Math.min(area(box(q)),area(b))>.10)){inside.forEach(q=>replaced.add(q));added.push(p);}
  }
  for(const owner of prior.filter(weak)){
   const a=box(owner),inside=ragged.filter(p=>overlap(box(p),a)/area(box(p))>=.95);
   if(inside.length<2||inside.reduce((n,p)=>n+area(box(p)),0)<area(a)*.90||prior.some(q=>q!==owner&&!weak(q)&&overlap(box(q),a)/Math.min(area(box(q)),area(a))>.10))continue;
   replaced.add(owner);for(const p of inside)if(!added.includes(p))added.push(p);
  }
  const rects=sceneRectangles(s,field).map(c=>({...c,nativeBox:nativeSceneBox(s,c.box,field)})).filter(c=>c.nativeBox),masks=rects.map(c=>boxMask(c.box,s.w,s.h));
  // A speech body belongs to its unique dominant scene, even when it crosses
  // a rim. Shared bodies veto this independent-cell interpretation.
  for(const body of s.bodies){const ranks=masks.map((m,k)=>({k,ratio:body.indices.reduce((n,i)=>n+m[i],0)/body.indices.length})).sort((a,b)=>b.ratio-a.ratio);if(ranks[0]?.ratio>=.60&&(ranks[1]?.ratio||0)<.18)for(const i of body.indices)masks[ranks[0].k][i]=1;else if(ranks.filter(r=>r.ratio>=.18).length>1)ranks.filter(r=>r.ratio>=.18).forEach(r=>rects[r.k].ambiguous=true);}
  const measured=rects.map((c,k)=>{const b=c.box;if(rimNominations(s,c).some(q=>nativeProtrusion(s,c,q))||crossingForeground(s,masks[k]))return null;const owners=prior.filter(q=>overlap(box(q),b)/Math.min(area(box(q)),area(b))>.10);const need=!owners.length||owners.every(weak)&&!added.some(q=>overlap(box(q),b)/Math.min(area(box(q)),area(b))>.75)||owners.some(q=>q._structuralGridProof?.version===18&&area(box(q))>area(b)*1.25&&overlap(box(q),b)/area(b)>.95);return c.ambiguous||!need?null:issueScene(s,c.nativeBox,'matte-enclosed-scene',{box:c.box,sides:c.edges,matte:c.matte,variance:c.variance,color:field.color,prior:prior.map(p=>({x:p.x,y:p.y,w:p.w,h:p.h,_identitySource:p._identitySource,...(p._structuralGridProof?{_structuralGridProof:{version:p._structuralGridProof.version}}:{})}))});});
  // Prove a borderless scene corridor from two independently closed peer
  // frames with aligned caps. This also retains disconnected effect glyphs;
  // foreground connectivity alone cannot distinguish adjoining portraits.
  for(const axis of [0,1])for(let i=0;i<rects.length;i++)for(let j=i+1;j<rects.length;j++){
   if(rects[i].ambiguous||rects[j].ambiguous)continue;const orient=b=>axis?[b[1],b[0],b[3],b[2]]:b,A=orient(rects[i].box),B=orient(rects[j].box),left=A[0]<B[0]?A:B,right=left===A?B:A,W=axis?s.h:s.w;
   if(Math.abs(left[1]-right[1])>5||Math.abs(left[3]-right[3])>5||right[0]-left[2]<W*.07||right[0]-left[2]>W*.30)continue;
   const b=orient([left[2],Math.min(left[1],right[1]),right[0],Math.max(left[3],right[3])]),mask=boxMask(b,s.w,s.h);let sum=0,sq=0,ink=0,n=0;
   for(let y=b[1];y<b[3];y++)for(let x=b[0];x<b[2];x++){const k=y*s.w+x,v=s.lum[k];sum+=v;sq+=v*v;ink+=!field.mask[k];n++;}
   if(!n||sq/n-(sum/n)**2<500||ink/n<.18||ink/n>.85)continue;
   const owners=prior.filter(q=>q._structuralGridProof?.version===18&&overlap(box(q),b)/area(b)>=.95&&[left,right].some(a=>overlap(box(q),orient(a))/area(a)>=.95));
   if(owners.length!==1||prior.some(q=>q!==owners[0]&&!weak(q)&&overlap(box(q),b)/Math.min(area(box(q)),area(b))>.20))continue;
   const owner=owners[0],peer=[measured[i],measured[j]].find(p=>p&&overlap(box(owner),box(p))/area(box(p))>=.95),L=orient(left===A?rects[i].nativeBox:rects[j].nativeBox),R=orient(left===A?rects[j].nativeBox:rects[i].nativeBox),corridor=issueScene(s,orient([L[2],Math.min(L[1],R[1]),R[0],Math.max(L[3],R[3])]),'borderless-scene-corridor',{axis,left:orient(left),right:orient(right),color:field.color,variance:sq/n-(sum/n)**2,ink:ink/n,prior:prior.map(p=>({x:p.x,y:p.y,w:p.w,h:p.h,_identitySource:p._identitySource,...(p._structuralGridProof?{_structuralGridProof:{version:p._structuralGridProof.version}}:{})}))});
   if(!corridor||!peer)continue;replaced.add(owner);added.push(peer,corridor);
  }
  for(let k=0;k<measured.length;k++){
   const p=measured[k];if(!p)continue;const b=box(p);
   if(prior.some(q=>!weak(q)&&!replaced.has(q)&&overlap(box(q),b)/Math.min(area(box(q)),area(b))>.10))continue;
   const old=prior.filter(q=>weak(q)&&overlap(box(q),b)/area(box(q))>.95);if(old.length>1)continue;if(old.length===1&&area(b)<area(box(old[0]))*1.25)continue;if(added.some(q=>overlap(box(q),b)/Math.min(area(box(q)),area(b))>.75))continue;
   // A rail rectangle cannot merge multiple old owners; only an independently
   // enclosed component map above may prove that their old split was false.
   // Only fill an uncovered scene or a weak composite whose complete source
   // border is proved. An established independent inset vetoes this path.
   if(!old.length&&prior.some(q=>overlap(box(q),b)/area(b)>.10))continue;
   old.forEach(q=>replaced.add(q));added.push(p);
  }
  if(!added.length)return prior;const unique=[...new Set(added)];log?.('complete scene ownership: '+unique.length+' measured cells; '+replaced.size+' old selections reconciled');return [...prior.filter(p=>!replaced.has(p)),...unique];
 }

 function refineImage(img,prior,log){if(!Array.isArray(prior)||establishedCoverage(prior)&&!prior.some(p=>p._structuralGridProof?.version===18&&p._structuralGridProof?.seed?.splits?.length))return prior;let s=sourceState(img);if(!s)return prior;prior=completeSceneCells(s,prior,log);if(establishedCoverage(prior))return prior;let cells=makeCells(s);if(s.foregroundProofs?.length&&prior.some(q=>q._identitySource&& !['v73','v99','v100'].includes(q._identitySource)&&s.foregroundProofs.some(f=>{const a=[q.x,q.y,q.x+q.w,q.y+q.h],b=f.box.map((v,k)=>v/(k%2?s.h:s.w));return area(a)<area(b)*.90&&overlap(a,b)/area(a)>.90;}))){s={...s,cells:null,hosts:null,disableForeground:true};cells=makeCells(s);}if(!cells.length)return prior;const protectedOwners=prior.filter(p=>p._identitySource&&!['v73','v99','v100'].includes(p._identitySource)),replaced=new Set();
  // Require a unique equivalent frame and unique prior owner. Shared or nested
  // ownership keeps its existing proof rather than replacing a smaller inset.
  for(const owner of protectedOwners){const matches=cells.filter(p=>completesPaper(p,owner,s));if(matches.length===1&&!prior.some(q=>q!==owner&&Number.isFinite(q.w*q.h)&&q.w*q.h>0&&q.w*q.h<matches[0].w*matches[0].h*.90&&overlap([matches[0].x,matches[0].y,matches[0].x+matches[0].w,matches[0].y+matches[0].h],[q.x,q.y,q.x+q.w,q.y+q.h])/(q.w*q.h)>.90)&&!protectedOwners.some(q=>q!==owner&&overlap([matches[0].x,matches[0].y,matches[0].x+matches[0].w,matches[0].y+matches[0].h],[q.x,q.y,q.x+q.w,q.y+q.h])/Math.min(matches[0].w*matches[0].h,q.w*q.h)>.75))replaced.add(owner);}
  const retainedOwners=protectedOwners.filter(p=>!replaced.has(p)),hosts=makeHosts(s).filter(p=>{const b=[p.x,p.y,p.x+p.w,p.y+p.h];if(p._geometryType==='shared-lettering-group'&&retainedOwners.some(q=>p._sourceLayoutProof.evidence.shared.some(k=>{const r=p._sourceLayoutProof.evidence.bank[k].map((v,j)=>v/(j%2?s.h:s.w)),a=[q.x,q.y,q.x+q.w,q.y+q.h];return area(a)<area(r)*.90&&overlap(a,r)/area(a)>.90;})))return false;return !prior.some(q=>{if(q._identitySource&&!['v73','v99','v100'].includes(q._identitySource))return false;const r=[q.x,q.y,q.x+q.w,q.y+q.h];if(!(area(r)>=.035&&area(r)<area(b)*.60&&overlap(r,b)/area(r)>.90))return false;const mask=contourMask(p,s),x0=Math.max(0,Math.floor(r[0]*s.w)),x1=Math.min(s.w,Math.ceil(r[2]*s.w)),y0=Math.max(0,Math.floor(r[1]*s.h)),y1=Math.min(s.h,Math.ceil(r[3]*s.h));let free=0,n=0;for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){n++;free+=mask[y*s.w+x];}return !n||free/n>.10;});});const added=[...cells,...hosts].filter(p=>!retainedOwners.some(q=>{const a=[p.x,p.y,p.x+p.w,p.y+p.h],b=[q.x,q.y,q.x+q.w,q.y+q.h];return p._geometryType!=='shared-lettering-group'&&overlap(a,b)/Math.min(area(a),area(b))>.75;}));if(!added.length)return prior;log?.('source layout: '+added.length+' complete owners, '+replaced.size+' source paper completions');return [...retainedOwners,...added,...prior.filter(p=>!protectedOwners.includes(p))];}
 function analyzeRGBA(rgba,w,h){const s=analyzeState(rgba,w,h);return s?makeCells(s):[];}
 function installDetector(detector){if(!detector?.detect||detector._sourceLayout170)return;const original=detector.detect;detector.detect=async function(src,log,...args){const prior=await original.call(this,src,log,...args);try{const img=new Image();img.src=src;if(img.decode)await img.decode();else if(!img.complete)await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;});return refineImage(img,prior,log);}catch(_){return prior;}};detector._sourceLayout170=true;}
 return {TYPE,VERSION,claims,validPanel,validateImage,refineImage,analyzeRGBA,installDetector,establishedCoverage};
})();
if(typeof module!=='undefined')module.exports=PanelSourceLayout;
