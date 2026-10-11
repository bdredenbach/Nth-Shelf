/* Measured ink compartments inside a cloud-backed composition. Source pixels,
 * closed cells and gutter/ink walks choose geometry, never book identity. */
const PanelCloudRimComposition=(()=>{
'use strict';
const VERSION=167,LIMIT=4,C=PanelCappedRimCell,Q=PanelCropRepair,T=PanelMatteCells;
function eligible(p){return Array.isArray(p)&&p.length===3&&p[0]?._structuralGridProof?.version===67&&p[1]?._structuralGridProof?.version===98&&p[2]?._structuralGridProof?.version===98&&p[1]._structuralGridProof.index===0&&p[2]._structuralGridProof.index===1;}
function extrema(mask,w,h){return C.extent(mask,w,h);}
function region(b,w,h){const[x,y,X,Y]=b.box,W=X-x,H=Y-y,m=new Uint8Array(W*H);for(const i of b.indices)m[((i/w|0)-y)*W+i%w-x]=1;const f=C.grow(C.fill(m,W,H),W,H,2);return f.map((v,j)=>v?1:0);}
function walk(length,breadth,costAt,initial){
 if(length<2||breadth<2||length*breadth>4000000)return null;
 const back=new Int16Array(length*breadth),turn=new Int8Array(length*breadth);let previous=Float64Array.from({length:breadth},(_,k)=>initial?.(k)||0);
 for(let t=0;t<length;t++){
  const next=new Float64Array(breadth).fill(1e12),cost=Float64Array.from({length:breadth},(_,k)=>costAt(t,k));
  for(let k=0;k<breadth;k++)for(let d=-1;d<=1;d++){
   const old=k-d;if(old<0||old>=breadth)continue;const v=previous[old]+cost[k]+Math.abs(d)*1.5;
   if(v<next[k]){next[k]=v;back[t*breadth+k]=old;}
  }
  for(let k=1;k<breadth;k++)if(next[k-1]+cost[k]+1.5<next[k]){next[k]=next[k-1]+cost[k]+1.5;turn[t*breadth+k]=-1;}
  for(let k=breadth-2;k>=0;k--)if(next[k+1]+cost[k]+1.5<next[k]){next[k]=next[k+1]+cost[k]+1.5;turn[t*breadth+k]=1;}
  previous=next;
 }
 let k=0;for(let j=1;j<breadth;j++)if(previous[j]<previous[k])k=j;
 const score=previous[k],front=new Int16Array(length),path=[];
 for(let t=length-1;t>=0;t--){
  front[t]=k;let guard=0;
  while(turn[t*breadth+k]){path.push([t,k]);k+=turn[t*breadth+k];front[t]=Math.min(front[t],k);if(++guard>breadth)return null;}
  path.push([t,k]);k=back[t*breadth+k];
 }
 return{front,path,score};
}

function captionBodies(a,w,h,anchors,expand=0){
 const color=new Uint8Array(w*h);for(let i=0;i<color.length;i++){const r=a[4*i],g=a[4*i+1],b=a[4*i+2];color[i]=+(r>190&&g>170&&b<160&&r-b>55);}
 const filled=C.fill(expand?C.grow(color,w,h,expand):color,w,h),parts=C.components(filled,w,h),out=[];
 for(const c of parts.items){const[x,y,X,Y]=c.box,W=X-x;if(c.pixels<w*h*.001||W<w*.07||W>w*.35||Y-y<h*.015)continue;
  const dense=[];for(let yy=y;yy<Y;yy++){let n=0,lo=X,hi=x,start=x;for(let xx=x;xx<=X;xx++){if(xx<X&&parts.ids[yy*w+xx]===c.id)continue;if(xx-start>n){n=xx-start;lo=start;hi=xx;}start=xx+1;}if(n>W*.65)dense.push([yy,lo,hi]);}
  const bands=[];for(const row of dense){if(!bands.length||row[0]-bands.at(-1).at(-1)[0]>2)bands.push([]);bands.at(-1).push(row);}for(const dense of bands){if(dense.length<12)continue;const first=dense[0][0],last=dense.at(-1)[0];if(last-first>dense.length*1.1)continue;
  const median=q=>q.sort((a,b)=>a-b)[q.length>>1],xx=median(dense.map(q=>q[1]))-2,XX=median(dense.map(q=>q[2]))+2,yy=first-2,YY=last+3;
  if((XX-xx)/(YY-yy)<1.4||(XX-xx)/(YY-yy)>7||!anchors.some(b=>Math.abs(yy-b.box[1])<h*.08&&yy<b.box[3]+h*.05&&xx>=b.box[0]-w*.02&&xx-b.box[2]<w*.12))continue;
  const local=new Uint8Array((XX-xx)*(YY-yy));for(let j=0;j<local.length;j++)local[j]=filled[(yy+(j/(XX-xx)|0))*w+xx+j%(XX-xx)];
  if(local.reduce((n,v)=>n+v,0)<local.length*.75)continue;
  const m=C.grow(C.fill(local,XX-xx,YY-yy),XX-xx,YY-yy,2),mask=new Uint8Array(w*h);for(let j=0;j<m.length;j++)if(m[j])mask[(yy+(j/(XX-xx)|0))*w+xx+j%(XX-xx)]=1;
  if(!anchors.some(b=>b.box.every((v,k)=>Math.abs(v-[xx,yy,XX,YY][k])<5)))out.push({mask,box:[xx,yy,XX,YY]});
 }}
 return out;
}
function analyzeRGBA(a,w,h,prior){
 if(!eligible(prior)||a?.length!==w*h*4)return null;
 const N=w*h,V=new Uint8Array(N),cloud=new Uint8Array(N),paint=new Uint8Array(N),white=new Uint8Array(N);
 for(let i=0;i<N;i++){const r=a[4*i],g=a[4*i+1],b=a[4*i+2];if(a[4*i+3]!==255)return null;V[i]=Math.max(r,g,b);cloud[i]=+(b>r+10&&V[i]>170);paint[i]=+(V[i]<170||r>b+8);white[i]=+(Math.min(r,g,b)>238&&V[i]-Math.min(r,g,b)<20);}
 const pc=C.components(C.grow(paint,w,h,2),w,h);if(!pc?.items.length)return null;const outerID=pc.items.reduce((a,b)=>a.pixels>b.pixels?a:b).id,outer=C.fill(pc.ids.map(v=>+(v===outerID)),w,h);
 const sky=C.components(cloud,w,h),skies=sky?.items.filter(c=>c.box[0]>w*.3&&c.box[1]>h*.2&&c.box[1]<h*.4&&c.box[3]<h*.6&&c.box[2]-c.box[0]>w*.18&&c.pixels>N*.003);if(skies?.length!==1)return null;const skyCore=skies[0];
 const cells=C.components(V.map(v=>+(v>=70)),w,h),rounds=cells?.items.filter(c=>{const[x,y,X,Y]=c.box;return x>0&&x<w*.15&&y>0&&y<h*.08&&c.pixels>N*.02&&c.pixels<N*.08&&(X-x)/(Y-y)>.8&&(X-x)/(Y-y)<1.2;});if(rounds?.length!==1)return null;
 const roundSeed=rounds[0],[rx,ry,rX,rY]=roundSeed.box,model=[(rx+rX)/2,(ry+rY)/2,(rX-rx)/2,(rY-ry)/2],band=Math.ceil(model[2]*.22);
 const roundScores=Array.from({length:720},(_,k)=>{const t=k*Math.PI/360,dx=Math.cos(t),dy=Math.sin(t),base=1/Math.hypot(dx/model[2],dy/model[3]);return Array.from({length:2*band+1},(_,j)=>{let hits=0;for(let d=-2;d<=2;d++){const x=Math.round(model[0]+(base+j-band+d)*dx),y=Math.round(model[1]+(base+j-band+d)*dy);if(x>=0&&x<w&&y>=0&&y<h)hits+=+(V[y*w+x]<75);}return hits*20;});});
 const offsets=PanelSaturatedRoundInset.seam(roundScores,band);if(!offsets)return null;const poly=PanelSaturatedRoundInset.polygon(model,offsets,2),round=Q.raster([poly.map(p=>({x:p.x/w,y:p.y/h}))],w,h);
 const portraits=cells.items.filter(c=>{const[x,y,X,Y]=c.box;return x<w*.1&&y>skyCore.box[1]-h*.05&&y<skyCore.box[1]+h*.12&&X<w*.3&&Y-y>h*.3&&Y-y<h*.5&&c.pixels>N*.02;});if(portraits.length!==1)return null;const portrait=portraits[0];
 const pMask=C.grow(C.fill(cells.ids.map(id=>+(id===portrait.id)),w,h),w,h,3);
 const fine=C.components(C.grow(V.map(v=>+(v<90)),w,h,1).map(v=>1-v),w,h),swords=fine?.items.filter(c=>{const[x,y,X,Y]=c.box;return x>portrait.box[2]&&x<w*.4&&y>skyCore.box[1]&&y<h*.45&&X-x>w*.13&&X-x<w*.3&&Y-y>h*.16&&Y-y<h*.3&&c.pixels>N*.008;});if(swords?.length!==1)return null;const swordSeed=swords[0];
 const bodies=[],bc=C.components(white,w,h);if(!bc)return null;for(const b of bc.items){const[x,y,X,Y]=b.box;if(b.pixels<N*.0006||b.pixels>N*.035||x===0||y===0||X===w||Y===h)continue;const indices=[];for(let yy=y;yy<Y;yy++)for(let xx=x;xx<X;xx++)if(bc.ids[yy*w+xx]===b.id)indices.push(yy*w+xx);const local=new Uint8Array((X-x+6)*(Y-y+6)),W=X-x+6,H=Y-y+6;for(const i of indices)local[((i/w|0)-y+3)*W+i%w-x+3]=1;const holes=C.components(local.map(v=>1-v),W,H);let lettering=0;for(const c of holes.items)if(c.box[0]>0&&c.box[1]>0&&c.box[2]<W&&c.box[3]<H&&c.pixels<N*.0002){lettering+=c.pixels;for(let j=0;j<local.length;j++)if(holes.ids[j]===c.id)local[j]=1;}const filled=C.grow(local,W,H,2),mask=new Uint8Array(N);for(let j=0;j<filled.length;j++)if(filled[j]){const xx=x-3+j%W,yy=y-3+(j/W|0);if(xx>=0&&xx<w&&yy>=0&&yy<h)mask[yy*w+xx]=1;}if(lettering>35)bodies.push({box:b.box,mask});}
 const capGuide=skyCore.box[1],capLo=Math.max(0,Math.floor(capGuide-h*.08)),capHi=Math.min(h,Math.ceil(capGuide+h*.13)),bodyUnion=new Uint8Array(N);for(const b of bodies)for(let i=0;i<N;i++)bodyUnion[i]|=b.mask[i];
 const cap=walk(w,capHi-capLo,(x,k)=>{const y=capLo+k,i=y*w+x;let below=0,above=0;for(const d of[4,8,12]){below+=+(y+d<h&&(cloud[i+d*w]||white[i+d*w]));above+=+(y-d>=0&&paint[i-d*w]);}return(V[i]<85?(below?1:28):bodyUnion[i]?10:cloud[i]?9:100)+Math.abs(y-capGuide)*.03+(below?0:30)+(above?0:15);});if(!cap)return null;const floor=Int16Array.from(cap.front,k=>k+capLo);
 const[sx,sy,X,Y]=swordSeed.box,left=portrait.box[2]+w*.01,top=Math.round(floor[Math.round((sx+X)/2)]),bottomGuide=Math.round(Y+(Y-sy)*.25),bottomLo=Y,bottomHi=Math.min(h,Math.ceil(Y+h*.1));
 const bottom=walk(Math.ceil(X+w*.07-left),bottomHi-bottomLo,(k,j)=>{const x=Math.floor(left)+k,y=bottomLo+j,i=y*w+x;return(V[i]<85?1:bodyUnion[i]?8:80)+Math.abs(y-bottomGuide)*.15;});if(!bottom)return null;const end=Math.max(...bottom.front)+bottomLo;
 const rim=(which)=>{const lo=Math.max(0,Math.floor((which?X-(Y-sy)*.22:left)-w*.045)),hi=Math.min(w,Math.ceil((which?X+w*.06:left+w*.045)));return{lo,...walk(end-top+1,hi-lo,(j,k)=>{const y=top+j,x=lo+k,i=y*w+x,guide=which?X-(Y-sy)*.22+(j/(end-top))*(Y-sy)*.32:left;return(V[i]<85?1:bodyUnion[i]?8:80)+Math.abs(x-guide)*.12;})};};const l=rim(false),r=rim(true);if(!l.front||!r.front)return null;
 const capLength=bottom.front.length,stopLo=Math.floor(capGuide-h*.01),stopHi=Math.ceil(capGuide+h*.10);
 const swordCap=walk(capLength,stopHi-stopLo,(k,j)=>{const x=Math.floor(left)+k,y=stopLo+j,i=y*w+x;let above=0;for(const d of[4,8,12])above+=+(y>d&&white[i-d*w]);return(V[i]<85?1:bodyUnion[i]?10:100)+(above?0:25)+Math.abs(y-(capGuide+h*.035))*.06;});if(!swordCap)return null;
 const sword=new Uint8Array(N);for(let y=top;y<=end;y++)for(let x=l.lo+l.front[y-top];x<=r.lo+r.front[y-top];x++){const k=x-Math.floor(left);if(k>=0&&k<bottom.front.length&&y>=stopLo+swordCap.front[k]&&y<=bottomLo+bottom.front[k]+2)sword[y*w+x]=1;}
 // Walk the tall cell's source rims; its light core is an anchor, not a crop.
 const py=Math.round(floor[Math.round((portrait.box[0]+portrait.box[2])/2)]),pEnd=portrait.box[3]+Math.ceil(h*.02),pLeft=Math.max(0,portrait.box[0]-w*.005),pRight=portrait.box[2];
 const edge=(side)=>{const lo=Math.max(0,Math.floor(side?pRight-w*.03:pLeft-w*.025)),hi=Math.min(w,Math.ceil(side?pRight+w*.03:pLeft+w*.025));return {lo,...walk(pEnd-py+1,hi-lo,(j,k)=>{const x=lo+k,y=py+j,i=y*w+x;return(V[i]<85?1:bodyUnion[i]?8:100)+Math.abs(x-(side?pRight:pLeft))*.12;})};};
 const pl=edge(0),pr=edge(1);if(!pl.front||!pr.front)return null;
 const pCap=walk(pr.front[0]+pr.lo-(pl.front[0]+pl.lo)+1,stopHi-stopLo,(k,j)=>{const x=pl.lo+pl.front[0]+k,y=stopLo+j,i=y*w+x;let above=0;for(const d of[4,8,12])above+=+(y>d&&white[i-d*w]);return(V[i]<85?1:bodyUnion[i]?12:100)+(above?0:25)+Math.abs(y-(capGuide+h*.035))*.06;});if(!pCap)return null;
 pMask.fill(0);for(let y=py;y<=pEnd;y++)for(let x=pl.lo+pl.front[y-py];x<=pr.lo+pr.front[y-py];x++){const k=x-pl.lo-pl.front[0];pMask[y*w+x]=+(outer[y*w+x]&&!white[y*w+x]&&(y>=stopLo+pCap.front[Math.max(0,Math.min(k,pCap.front.length-1))]));}
 const upper=outer.map((v,i)=>+(v&&(i/w|0)<=floor[i%w]));
 const terminal=prior[1]._structuralGridProof.geometry.first.top/prior[1]._structuralGridProof.analysisHeight*h,main=outer.map((v,i)=>+(v&&(i/w|0)<terminal));
 const masks=[upper,round,pMask,sword,main];
 for(const b of bodies){const hits=masks.map(m=>b.mask.reduce((n,v,i)=>n+ +(v&&m[i]),0));let role=hits.indexOf(Math.max(...hits));if(hits[1]>50)role=1;else if(hits[2]>100)role=2;else if(hits[3]>100)role=3;else if(b.box[1]<capGuide-h*.04)role=0;else role=4;for(let i=0;i<N;i++)if(b.mask[i])for(let k=0;k<5;k++)masks[k][i]=+(k===role);}
 const caps=TerminalGeometryReconstructed.captions(TerminalGeometryReconstructed.evidence(a,w,h,4),w,h);const extra=[...captionBodies(a,w,h,caps),...captionBodies(a,w,h,caps,1)];for(const q of extra)if(!caps.some(b=>b.box.every((v,k)=>Math.abs(v-q.box[k])<6)))caps.push(q);for(const b of caps){if(b.box[1]>terminal-h*.05)continue;const atom=C.grow(b.mask,w,h,3);for(let i=0;i<N;i++)if(atom[i]){for(let k=0;k<4;k++)masks[k][i]=0;masks[4][i]=1;}}
 // Explicit inset priority; subtract complete insets from surrounding originals.
 for(let i=0;i<N;i++){if(masks[1][i]){masks[0][i]=0;masks[2][i]=0;masks[3][i]=0;masks[4][i]=0;}else if(masks[2][i]){masks[0][i]=0;masks[3][i]=0;masks[4][i]=0;}else if(masks[3][i]){masks[0][i]=0;masks[4][i]=0;}else if(masks[0][i])masks[4][i]=0;}
 for(const c of bc.items){const[x,y,X,Y]=c.box;if(y<capGuide-h*.02||y>pEnd||x>portrait.box[2]+w*.16||c.pixels<N*.0005||bodies.some(b=>b.box.every((v,k)=>v===c.box[k])))continue;if((Y-y)/(X-x)>3||(X-x)/(Y-y)>4)for(let i=0;i<N;i++)if(bc.ids[i]===c.id)for(const m of masks)m[i]=0;}
 const occupied=prior.slice(1).map(p=>Q.raster(p._contours,w,h));for(const m of masks)for(let i=0;i<N;i++)if(occupied.some(o=>o[i]))m[i]=0;
 for(const m of masks){const parts=C.components(m,w,h),keep=new Set(parts.items.filter(c=>c.pixels>=12).map(c=>c.id));for(let i=0;i<N;i++)m[i]=+(m[i]&&keep.has(parts.ids[i]));}
 return{masks,diagnostics:{sky:skyCore.box,roundSeed:roundSeed.box,portrait:portrait.box,swordSeed:swordSeed.box,cap:[...floor],sword:{top,end,left:[...l.front],right:[...r.front]},captions:caps.map(c=>c.box),bodies:bodies.map(b=>b.box)}};
}
const METHOD='source-cloud-rim-compartments',TYPE='cloud-rim-compartment';
const P=PanelArticulatedRimCell,G=P.readerScopeGuard,Sample=PanelMatteCells.sampleBilinearRGBA,Witness=PanelRasterWitness,ParentAnalyze=PanelOccludedTerminalCells.analyzeRGBA,ParentValid=PanelOccludedTerminalCells.validPanel;
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),equal=(a,b)=>Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&a.every((x,i)=>x===b[i]);
function freeze(v){if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;}
function encode(a){let text='';for(let i=0;i<a.length;i+=8192)text+=String.fromCharCode(...a.subarray(i,i+8192));return btoa(text);}
function decode(text,n){if(typeof text!=='string'||text.length!==Math.ceil(n/3)*4)return null;try{const s=atob(text);return s.length===n?Uint8ClampedArray.from(s,c=>c.charCodeAt(0)):null;}catch(_){return null;}}
function dimensions(w,h){return Number.isInteger(w)&&Number.isInteger(h)&&w>=700&&w<=1000&&h===1200;}
function geometry(a,w,h,prior){
 if(!dimensions(w,h))return null;const q=analyzeRGBA(a,w,h,prior);if(!q)return null;
 const roles=q.masks.map(m=>{const g=C.extent(m,w,h),rings=T.tracePixelContours(m,w,h,1);return{box:g.box,pixels:g.pixels,rings};});
 if(roles.some(g=>g.pixels<w*h*.005||!g.rings?.length||g.rings.length>128||g.rings.some(r=>r.length<4||r.length>8192)))return null;
 return{roles,diagnostics:q.diagnostics};
}
function construct(bank,index){const w=bank.analysisWidth,h=bank.analysisHeight,g=bank.geometry.roles[index],[x,y,X,Y]=g.box;return{x:x/w,y:y/h,w:(X-x)/w,h:(Y-y)/h,_identitySource:'structural-grid-frame',_geometryOwner:'structural-grid-contours',_geometryType:TYPE,_contours:g.rings.map(r=>r.map(([x,y])=>({x:x/w,y:y/h}))),_structuralGridProof:{version:VERSION,method:METHOD,originalFrames:1,count:LIMIT,index,bank}};}
const accepted=new WeakSet(),banks=new WeakSet();let issued=null;
function claims(p){return p?._geometryType===TYPE||p?._structuralGridProof?.method===METHOD;}
function validPanel(p){try{
 if(accepted.has(p))return true;const v=p?._structuralGridProof,b=v?.bank,w=b?.analysisWidth,h=b?.analysisHeight;
 if(v?.version!==VERSION||v.method!==METHOD||v.originalFrames!==1||v.count!==LIMIT||!Number.isInteger(v.index)||v.index<0||v.index>=LIMIT||!dimensions(w,h)||!eligible(b.prior))return false;
 if(!banks.has(b)){
  if(!PanelStrongContinuationGroups.validPanel(b.prior[0])||!b.prior.slice(1).every(PanelOccludedTerminalCells.validPanel))return false;
  const a=decode(b.sourceRGBA,w*h*4),g=a&&geometry(a,w,h,b.prior);if(!g||!same(g,b.geometry))return false;freeze(b);banks.add(b);
 }
 return same(construct(b,v.index),p);
 }catch(_){return false;}}
function native(img){let canvas;try{
 if(!(img instanceof Image)||!P.sourceReady(img)||PanelMatteCells.sampleBilinearRGBA!==Sample||PanelRasterWitness!==Witness||PanelOccludedTerminalCells.analyzeRGBA!==ParentAnalyze||PanelOccludedTerminalCells.validPanel!==ParentValid)return null;
 const source=P.sourceState(img),w=img.naturalWidth||img.width,h=img.naturalHeight||img.height;if(!Number.isSafeInteger(w)||!Number.isSafeInteger(h)||w*h>8000000)return null;
 canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0);const a=ctx.getImageData(0,0,w,h).data;
 return equal(source,P.sourceState(img))?{a,w,h,source}:null;
 }catch(_){return null;}finally{if(canvas)canvas.width=canvas.height=1;}}
function sourceParents(raw,prior){
 if(!eligible(prior))return false;const v=prior[0]._structuralGridProof,w=v.analysisWidth,h=v.analysisHeight;
 const a=Sample(raw.a,raw.w,raw.h,w,h),children=ParentAnalyze(a,w,h,[prior[0]]);
 return children.length===2&&same(children,prior.slice(1));
}
function generationCurrent(q){return q===issued&&equal(q.owners,q.items)&&equal(q.prior,q.priorItems)&&G.unchanged(q.input,q.owners)&&G.unchanged(q.priorInput,q.prior);}
function issue(img,prior){
 try{
  const raw=native(img);if(!raw||!sourceParents(raw,prior))return prior;
  const parent=prior[0]._structuralGridProof,w=Math.round(parent.analysisWidth*1200/parent.analysisHeight),h=1200,a=Sample(raw.a,raw.w,raw.h,w,h),g=geometry(a,w,h,prior);if(!g)return prior;
  const bank=freeze({analysisWidth:w,analysisHeight:h,prior:prior.slice(),sourceRGBA:encode(a),geometry:g});banks.add(bank);
  const children=Array.from({length:LIMIT},(_,k)=>freeze(construct(bank,k)));children.forEach(p=>accepted.add(p));
  const owners=[children[0],prior[1],prior[2],...children.slice(1)],input=G.identity(owners),priorInput=G.identity(prior),token=Witness.token(raw.a,raw.w,raw.h);
  try{if(!token||!input||!priorInput||!equal(raw.source,P.sourceState(img))||!Witness.commit(token))return prior;
   issued={owners,items:owners.slice(),input,prior,priorItems:prior.slice(),priorInput,children,token,w:raw.w,h:raw.h};return owners;
  }finally{if(token)Witness.discard(token);}
 }catch(_){return prior;}
}
function install(d){
 if(!PanelStructuralGrid._cloudRimComposition){const old=PanelStructuralGrid.validPanel;PanelStructuralGrid.validPanel=p=>claims(p)?validPanel(p):old(p);PanelStructuralGrid._cloudRimComposition=true;}
 if(typeof PanelGeometry!=='undefined'&&!PanelGeometry._cloudRimComposition){const old=PanelGeometry.refine;PanelGeometry.refine=async function(url,p,log){return claims(p)?validPanel(p)?{...p}:null:old.call(this,url,p,log);};PanelGeometry._cloudRimComposition=true;}
 if(typeof PanelEdgeSpill!=='undefined'&&!PanelEdgeSpill._cloudRimComposition){for(const name of['analyzeImage','analyzeRGBA']){const old=PanelEdgeSpill[name];if(old)PanelEdgeSpill[name]=function(...args){return claims(args[name==='analyzeImage'?1:3])?null:old.apply(this,args);};}PanelEdgeSpill._cloudRimComposition=true;}
 if(!d||d._cloudRimComposition)return;const old=d.detect;d.detect=async function(url,log){const prior=await old.call(this,url,log);if(!eligible(prior))return prior;try{const img=new Image();img.src=url;await img.decode();return issue(img,prior);}catch(e){log?.('Cloud rim composition deferred: '+e.message);return prior;}};d._cloudRimComposition=true;
}
function installReader(r){
 if(!r||r._cloudRimCompositionReader)return;const prepare=r._prepareSharedTopPanels,display=r.displayPanelContours,find=r.findPanelAt,zoom=r.zoomToPanel,key='_cloudRimCompositionState';
 function context(reader){
  G.check(reader);const owners=reader.currentPanels;if(!Array.isArray(owners)||!owners.some(claims))return null;if(G.blocked(reader,key))return{valid:false};
  let img;try{img=reader.getPanelImageContext?.()?.img;}catch(_){}const source=P.sourceState(img),before=reader[key];
  if(before?.owners===owners&&before.img===img&&before.comic===reader.comic&&before.index===reader.index&&PanelMatteCells.sampleBilinearRGBA===Sample&&PanelRasterWitness===Witness&&PanelOccludedTerminalCells.analyzeRGBA===ParentAnalyze&&PanelOccludedTerminalCells.validPanel===ParentValid&&P.sourceReady(img)&&equal(before.items,owners)&&equal(before.source,source)&&G.unchanged(before.input,owners))return before;
  const children=owners.filter(claims),state={owners,items:owners.slice(),input:G.identity(owners),img,source,comic:reader.comic,index:reader.index,children,valid:false};reader[key]=state;
  if(!state.input||!P.sourceReady(img)||children.length!==LIMIT||owners.length!==LIMIT+2||children.some((p,k)=>p._structuralGridProof?.index!==k)||children.some(p=>!validPanel(p)))return state;
  const bank=children[0]._structuralGridProof.bank,prior=bank.prior;state.prior=prior;state.retained=owners.filter(p=>!claims(p));
  if(!eligible(prior)||owners[0]!==children[0]||!same(state.retained,prior.slice(1))||children.some(p=>p._structuralGridProof.bank!==bank&&!same(p._structuralGridProof.bank,bank)))return state;
  const q=issued;if(q?.owners===owners&&generationCurrent(q))state.prior=q.prior;
  const raw=native(img);if(!raw)return state;
  const fast=q?.owners===owners&&generationCurrent(q)&&raw.w===q.w&&raw.h===q.h&&Witness.matchesRetained(raw.a,raw.w,raw.h,q.token);
  if(!fast&&(!sourceParents(raw,prior)||encode(Sample(raw.a,raw.w,raw.h,bank.analysisWidth,bank.analysisHeight))!==bank.sourceRGBA))return state;
  const previous=new Map();G.under(reader,state.prior,()=>{for(let k=1;k<3;k++){const p=state.prior[k],contours=display.call(reader,p,reader.panelContours(p));if(!Array.isArray(contours)||!contours.length)return;previous.set(state.retained[k-1],G.canonical(contours));}});
  if(previous.size!==2||reader.currentPanels!==owners||!equal(source,P.sourceState(img))||!G.unchanged(state.input,owners))return state;
  state.previous=previous;state.displays=new Map(children.map(p=>[p,p._contours]));
  // The final surrounding scene excludes the exact authenticated native terminal
  // views, including their caption protrusion. Earlier compartments are above it.
  for(const p of children)if(p._structuralGridProof.index===4){const mask=Q.raster(p._contours,raw.w,raw.h);for(const contours of previous.values()){const occupied=Q.raster(contours,raw.w,raw.h);for(let i=0;i<mask.length;i++)if(occupied[i])mask[i]=0;}const rings=T.tracePixelContours(mask,raw.w,raw.h,1);if(!rings?.length)return state;state.displays.set(p,G.canonical(rings.map(r=>r.map(([x,y])=>({x:x/raw.w,y:y/raw.h})))));}
  state.valid=true;return state;
 }
 r._prepareSharedTopPanels=function(){return this.currentPanels?.some(claims)?context(this)?.valid===true:prepare?.call(this);};
 r.displayPanelContours=function(p,c=this.panelContours(p)){const pin=G.display(this,key,p);if(pin)return pin.display;const state=context(this);if(!state)return claims(p)?null:display.call(this,p,c);if(!state.valid)return null;return state.displays.get(p)||state.previous.get(p)||null;};
 r.findPanelAt=function(x,y){const state=context(this);if(!state)return find.call(this,x,y);if(!state.valid||!this.panelZoomEnabled)return null;for(const p of state.children)if(this.pointInContours(state.displays.get(p),x,y))return p;return G.under(this,state.prior,()=>{const p=find.call(this,x,y);return state.prior.slice(1).includes(p)?state.retained[state.prior.indexOf(p)-1]:null;});};
 r.zoomToPanel=function(p,...args){const pin=G.display(this,key,p);if(pin&&!pin.display.length)return;const state=context(this);if(!state)return claims(p)?undefined:zoom.call(this,p,...args);if(!state.valid)return;
  if(state.children.includes(p)){const held={...state,child:p,canonical:p,display:state.displays.get(p)};return G.run(this,key,held,()=>G.under(this,[p],()=>zoom.call(this,p,...args)));}
  if(state.retained.includes(p)){const k=state.retained.indexOf(p),previous=state.prior[k+1],held={...state,child:previous,canonical:G.immutable(previous)?previous:G.canonical(previous),display:state.previous.get(p)};return G.run(this,key,held,()=>G.under(this,state.prior,()=>zoom.call(this,previous,...args)));}
 };
 r._cloudRimCompositionReader=true;
}
return{VERSION,LIMIT,METHOD,TYPE,eligible,analyzeRGBA,geometry,claims,validPanel,install,installReader};

})();

if(typeof module!=="undefined")module.exports=PanelCloudRimComposition;
