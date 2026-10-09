/* Source-clipped round frames with independently enclosed pointing speech.
 * Circle votes propose search regions; the visible source-ink frontier owns
 * geometry. Unobserved arcs outside one natural page edge receive no ink
 * credit. Whole lettered bodies and downward tails remain indivisible.
 * Persisted local intensity witnesses replay the native geometry exactly.
 * A source-certified host may subtract two verified inset owners; unrelated
 * accepted owners retain their original image and ownership context.
 * No page, title, hash, text or review-coordinate lookup selects a frame. */
const PanelRoundSpeechInset=(()=>{
'use strict';const VERSION=86,METHOD='native-clipped-rim-pointing-speech',same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),N=720,cache=new WeakMap();
const sum=a=>a.reduce((s,v)=>s+v,0),clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function round(x){const f=Math.floor(x),d=x-f;return d===.5?(f%2?f+1:f):Math.round(x);}
function dims(w,h){return Number.isInteger(w)&&Number.isInteger(h)&&w>=120&&h>=120&&w*h<=24000000&&w<=8000&&h<=8000;}
function data(a,w,h){if(!dims(w,h)||a?.length!==w*h*4)return null;const max=new Uint8Array(w*h),min=new Uint8Array(w*h);for(let i=0;i<max.length;i++){if(a[4*i+3]!==255)return null;max[i]=Math.max(a[4*i],a[4*i+1],a[4*i+2]);min[i]=Math.min(a[4*i],a[4*i+1],a[4*i+2]);}return{a,w,h,max,min};}
function cc(max,w,h,t){const labels=new Int32Array(max.length),q=new Int32Array(max.length),items=[null];for(let s=0;s<max.length;s++)if(max[s]>t&&!labels[s]){const id=items.length;let n=1,k=0,x0=w,y0=h,x1=0,y1=0;q[0]=s;labels[s]=id;while(k<n){const i=q[k++],x=i%w,y=i/w|0;x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x+1);y1=Math.max(y1,y+1);const add=j=>{if(max[j]>t&&!labels[j]){labels[j]=id;q[n++]=j;}};if(x)add(i-1);if(x+1<w)add(i+1);if(y)add(i-w);if(y+1<h)add(i+w);}items.push({id,size:n,box:[x0,y0,x1,y1],indices:q.slice(0,n)});if(items.length>180000)return null;}return{labels,items};}
function fill(c,w,h){if(c.filled)return c.filled;const[x0,y0,x1,y1]=c.box,W=x1-x0+2,H=y1-y0+2,M=W*H,wall=new Uint8Array(M),seen=new Uint8Array(M),q=new Int32Array(M);for(const i of c.indices)wall[((i/w|0)-y0+1)*W+i%w-x0+1]=1;let n=0,k=0;const add=i=>{if(!wall[i]&&!seen[i]){seen[i]=1;q[n++]=i;}};for(let x=0;x<W;x++){add(x);add((H-1)*W+x);}for(let y=0;y<H;y++){add(y*W);add(y*W+W-1);}while(k<n){const i=q[k++],x=i%W,y=i/W|0;if(x)add(i-1);if(x+1<W)add(i+1);if(y)add(i-W);if(y+1<H)add(i+W);}const indices=[],holes=new Uint8Array(M);for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){const i=y*W+x;if(!seen[i]){indices.push((y+y0-1)*w+x+x0-1);holes[i]=+!wall[i];}}const letters=cc(holes,W,H,0)?.items.length-1||0;return c.filled={indices,letters};}
function runs(mask){const out=[];for(let i=0;i<mask.length;i++)if(mask[i]){const s=i;while(i+1<mask.length&&mask[i+1])i++;out.push([s,i-s+1]);}return out;}
function unruns(r,n){if(!Array.isArray(r)||r.length>n)return null;const m=new Uint8Array(n);let end=-1;for(const q of r){if(!Array.isArray(q)||q.length!==2||!Number.isInteger(q[0])||!Number.isInteger(q[1])||q[0]<=end||q[1]<1||q[0]+q[1]>n)return null;m.fill(1,q[0],q[0]+q[1]);end=q[0]+q[1]-1;}return m;}
function extent(mask,w,h){let x=w,y=h,X=0,Y=0,n=0;for(let i=0;i<mask.length;i++)if(mask[i]){const xx=i%w,yy=i/w|0;x=Math.min(x,xx);y=Math.min(y,yy);X=Math.max(X,xx+1);Y=Math.max(Y,yy+1);n++;}return{box:[x,y,X,Y],pixels:n};}
function polygonMask(points,w,h){const out=new Uint8Array(w*h),p=points.map(([x,y])=>[Math.trunc(x),Math.trunc(y)]);for(let y=Math.max(0,Math.min(...p.map(z=>z[1])));y<Math.min(h,Math.max(...p.map(z=>z[1]))+1);y++){const xs=[];for(let j=0;j<p.length;j++){const a=p[j],b=p[(j+1)%p.length];if((a[1]>y)!==(b[1]>y))xs.push(a[0]+(y-a[1])*(b[0]-a[0])/(b[1]-a[1]));}xs.sort((a,b)=>a-b);for(let k=0;k+1<xs.length;k+=2)for(let x=Math.max(0,Math.ceil(xs[k]));x<=Math.min(w-1,Math.floor(xs[k+1]));x++)out[y*w+x]=1;}for(let j=0;j<p.length;j++){let[x,y]=p[j];const[X,Y]=p[(j+1)%p.length],dx=Math.abs(X-x),sx=x<X?1:-1,dy=-Math.abs(Y-y),sy=y<Y?1:-1;let e=dx+dy;for(;;){if(x>=0&&x<w&&y>=0&&y<h)out[y*w+x]=1;if(x===X&&y===Y)break;const z=2*e;if(z>=dy){e+=dy;x+=sx;}if(z<=dx){e+=dx;y+=sy;}}}return out;}
function solveFrontier(e){const{lo,hi,costs,darkRuns}=e,M=hi-lo+1;if(!Number.isInteger(lo)||!Number.isInteger(hi)||lo>-4||hi<4||M>800||!Array.isArray(costs)||costs.length!==N*M||costs.some(n=>!Number.isInteger(n)||n< -100000||n>1600))return null;const dark=unruns(darkRuns,N*M);if(!dark)return null;let best=-Infinity,path=null;for(let start=Math.max(0,-lo-2);start<Math.min(M,-lo+4);start++){let dp=new Int32Array(M).fill(-400000000);dp[start]=costs[start];const back=new Int16Array(N*M);for(let i=1;i<N;i++){const ns=new Int32Array(M).fill(-400000000);for(const d of[-1,0,1])for(let k=Math.max(0,d);k<Math.min(M,M+d);k++){const val=dp[k-d]-240*Math.abs(d);if(val>ns[k]){ns[k]=val;back[i*M+k]=k-d;}}for(let k=0;k<M;k++)ns[k]+=costs[i*M+k];dp=ns;}let end=0;for(let k=1;k<M;k++)if(dp[k]-360*Math.abs(k-start)>dp[end]-360*Math.abs(end-start))end=k;const val=dp[end]-360*Math.abs(end-start);if(val>best){best=val;path=new Int16Array(N);path[N-1]=end;for(let i=N-1;i>0;i--)path[i-1]=back[i*M+path[i]];}}return{offsets:Array.from(path,k=>k+lo),support:sum(Array.from(path,(k,i)=>dark[i*M+k]))/N};}
function frontier(D,circle){const[x,y,r]=circle,lo=-Math.max(4,Math.floor(r*.09)),hi=Math.max(4,Math.floor(r*.22)),M=hi-lo+1,dark=new Uint8Array(N*M),costs=new Array(N*M);for(let i=0;i<N;i++){const t=i*2*Math.PI/N,c=Math.cos(t),s=Math.sin(t);for(let k=0;k<M;k++){const R=r+k+lo,xx=round(x+R*c),yy=round(y+R*s),X=round(x+(R+2)*c),Y=round(y+(R+2)*s),a=xx>=0&&xx<D.w&&yy>=0&&yy<D.h?D.max[yy*D.w+xx]:255,b=X>=0&&X<D.w&&Y>=0&&Y<D.h?D.max[Y*D.w+X]:255;dark[i*M+k]=+(a<100);costs[i*M+k]=round((xx<0||xx>=D.w||yy<0||yy>=D.h?3:dark[i*M+k]*2+clamp((b-a)/80,0,2)-Math.abs(k+lo)*.11)*400);}}const evidence={lo,hi,costs,darkRuns:runs(dark)},solution=solveFrontier(evidence),points=solution.offsets.map((v,i)=>{const t=i*2*Math.PI/N,R=r+v+1;return[x+R*Math.cos(t),y+R*Math.sin(t)];});return{mask:polygonMask(points,D.w,D.h),...solution,evidence};}
function sample(a,w,h,W,H){if(w===W&&h===H)return a;const out=new Uint8ClampedArray(W*H*4);for(let y=0;y<H;y++)for(let x=0;x<W;x++){const sx=(x+.5)*w/W-.5,sy=(y+.5)*h/H-.5,X=Math.max(0,Math.min(w-1,Math.floor(sx))),Y=Math.max(0,Math.min(h-1,Math.floor(sy))),xx=Math.min(w-1,X+1),yy=Math.min(h-1,Y+1),dx=clamp(sx-X,0,1),dy=clamp(sy-Y,0,1);for(let k=0;k<4;k++)out[(y*W+x)*4+k]=(a[(Y*w+X)*4+k]*(1-dx)+a[(Y*w+xx)*4+k]*dx)*(1-dy)+(a[(yy*w+X)*4+k]*(1-dx)+a[(yy*w+xx)*4+k]*dx)*dy;}return out;}
function proposals(a,W,H){const s=Math.min(1,900/Math.max(W,H)),w=Math.round(W*s),h=Math.round(H*s),rgba=sample(a,W,H,w,h),n=w*h,L=new Float64Array(n),max=new Uint8Array(n);for(let i=0;i<n;i++){L[i]=.299*rgba[4*i]+.587*rgba[4*i+1]+.114*rgba[4*i+2];max[i]=Math.max(rgba[4*i],rgba[4*i+1],rgba[4*i+2]);}const edges=[];let eid=0;const at=(x,y)=>L[clamp(y,0,h-1)*w+clamp(x,0,w-1)];for(let y=0;y<h;y++)for(let x=0;x<w;x++){const gx=at(x+1,y-1)+2*at(x+1,y)+at(x+1,y+1)-at(x-1,y-1)-2*at(x-1,y)-at(x-1,y+1),gy=at(x-1,y+1)+2*at(x,y+1)+at(x+1,y+1)-at(x-1,y-1)-2*at(x,y-1)-at(x+1,y-1),mag=Math.hypot(gx,gy);if(mag>120&&max[y*w+x]<180){if(!(eid++%2))edges.push([x,y,gx/mag,gy/mag]);}}
 const kernel=Array.from({length:17},(_,i)=>Math.exp(-(((i-8)/2)**2)/2)),ks=sum(kernel);for(let i=0;i<17;i++)kernel[i]/=ks;const reflect=(x,n)=>x<0?-x-1:x>=n?2*n-x-1:x;const out=[];for(let r=Math.max(20,round(w*.06));r<round(w*.28);r+=2){const votes=new Float64Array(n),tmp=new Float64Array(n),blur=new Float64Array(n);for(const[x,y,nx,ny]of edges)for(const d of[-1,1]){const xx=round(x+d*r*nx),yy=round(y+d*r*ny);if(xx>=0&&xx<w&&yy>=0&&yy<h)votes[yy*w+xx]++;}for(let y=0;y<h;y++)for(let x=0;x<w;x++){let v=0;for(let k=-8;k<=8;k++)v+=votes[y*w+reflect(x+k,w)]*kernel[k+8];tmp[y*w+x]=v;}for(let y=0;y<h;y++)for(let x=0;x<w;x++){let v=0;for(let k=-8;k<=8;k++)v+=tmp[reflect(y+k,h)*w+x]*kernel[k+8];blur[y*w+x]=v;}const best=[];for(let i=0;i<n;i++){const score=blur[i]/r;if(best.length<4||score>best[0][0]){best.push([score,i%w,i/w|0,r]);best.sort((a,b)=>a[0]-b[0]||a[2]-b[2]||a[1]-b[1]);if(best.length>4)best.shift();}}out.push(...best);}out.sort((a,b)=>b[0]-a[0]||b[1]-a[1]||b[2]-a[2]);const picked=[];for(const v of out){const[score,x,y,r]=v;if(picked.some(([,X,Y,R])=>Math.hypot(x-X,y-Y)<r*.4&&Math.abs(r-R)<r*.3))continue;picked.push(v);if(picked.length===30)break;}return picked.map(([vote,x,y,r])=>({vote,circle:[x*W/w,y*H/h,r*H/h],sampleSize:[w,h],sampleCircle:[x,y,r]}));}

function tail(c,w,h){const body=fill(c,w,h),rows=[];for(let y=c.box[1];y<c.box[3];y++){const xs=body.indices.filter(i=>(i/w|0)===y).map(i=>i%w);rows.push({y,n:xs.length,x0:Math.min(...xs),x1:Math.max(...xs)});}const width=Math.max(...rows.map(q=>q.n)),last=rows.findLastIndex(q=>q.n>width*.42),tip=rows.at(-1);if(last<0||rows.length-last-1<width*.12||rows.length-last-1>width*.45||tip.n>width*.10)return null;const start=rows[last+1],end=[(tip.x0+tip.x1)/2,tip.y],begin=[(start.x0+start.x1)/2,start.y];if(Math.abs(end[0]-begin[0])>width*.32)return null;return{letters:body.letters,filled:body.indices,rows,width,begin,end,length:end[1]-begin[1]+1};}
function measure(D,proposal,originalWidth,originalHeight){const {w,h}=D;const sets=[cc(D.min,w,h,170),cc(D.min,w,h,200)],colors=cc(D.max,w,h,100);if(sets.some(q=>!q)||!colors)return null;const[x,y,r]=proposal.circle;if(r<originalWidth*.10||r>originalWidth*.23||y-r<2||y+r>h-2||x<0||x>w||x-r<0&&x+r>w||Math.max(0,r-x,x+r-w)>r*.22)return null;const bodies=[];for(const c of sets[0].items.slice(1)){const[X,Y,XX,YY]=c.box,W=XX-X,H=YY-Y;if(c.size<r*r*.035||c.size>r*r*.55||W<r*.35||W>r*1.3||H<r*.2||H>r*.8||YY<y-r*.1-r*1.55||YY>y-r*.90||Math.abs((X+XX)/2-x)>r*.6)continue;const t=tail(c,w,h);if(!t||t.letters<3||t.length<r*.08||Math.abs(t.end[0]-x)>r*.6||y-r-t.end[1]>r*.55)continue;const counts=new Map();for(const i of c.indices){const id=sets[1].labels[i];if(id)counts.set(id,(counts.get(id)||0)+1);}const matches=sets[1].items.slice(1).filter(b=>(counts.get(b.id)||0)>c.size*.80&&(counts.get(b.id)||0)>b.size*.94);if(matches.length!==1)continue;const second=tail(matches[0],w,h);if(!second||second.letters<3||Math.hypot(t.end[0]-second.end[0],t.end[1]-second.end[1])>Math.max(3,r*.025))continue;bodies.push({c,t,second,witness:{id:matches[0].id,size:matches[0].size,matched:counts.get(matches[0].id)}});}if(bodies.length!==1)return null;
 const f=frontier(D,proposal.circle);let visible=0,dark=0,clipped=0;const rim=[];for(let k=0;k<N;k++){const t=k*2*Math.PI/N,R=r+f.offsets[k],X=round(x+R*Math.cos(t)),Y=round(y+R*Math.sin(t)),inside=X>=0&&X<w&&Y>=0&&Y<h;visible+=inside;clipped+=!inside;const v=inside?+(D.max[Y*w+X]<100):0;dark+=v;rim.push({x:X,y:Y,visible:inside,dark:v});}if(visible<N*.76||dark/visible<.97)return null;const base=f.mask,g=extent(base,w,h),body=bodies[0],mask=base.slice(),protectedAtoms=new Uint8Array(w*h);for(const i of body.t.filled){mask[i]=protectedAtoms[i]=1;}const collar=Math.max(2,Math.ceil(Math.max(originalWidth,originalHeight)/900));for(const i of body.t.filled){const X=i%w,Y=i/w|0;for(let dy=-collar;dy<=collar;dy++)for(let dx=-collar;dx<=collar;dx++){const xx=X+dx,yy=Y+dy;if(xx>=0&&xx<w&&yy>=0&&yy<h&&dx*dx+dy*dy<=collar*collar&&D.max[yy*w+xx]<150)mask[yy*w+xx]=1;}}
 for(const c of colors.items.slice(1)){let hit=0,core=0;for(const i of c.indices){hit+=mask[i];core+=Math.hypot(i%w-x,(i/w|0)-y)<r;}if(core<c.size*.5&&hit<c.size*.9)for(const i of c.indices)if(!protectedAtoms[i])mask[i]=0;else{}else if(hit>c.size*.90&&c.size<g.pixels*.5)for(const i of fill(c,w,h).indices)mask[i]=1;}
 for(let pass=0;pass<2;pass++){const before=mask.slice();for(let yy=1;yy<h-1;yy++)for(let xx=1;xx<w-1;xx++){const i=yy*w+xx;if(before[i]||D.max[i]>=120)continue;let hit=false;for(let dy=-1;dy<=1&&!hit;dy++)for(let dx=-1;dx<=1&&!hit;dx++)hit=!!before[i+dy*w+dx];if(hit)mask[i]=1;}}
 const final=extent(mask,w,h),rings=PanelMatteCells.tracePixelContours(mask,w,h,1);if(!rings||rings.length>12||final.pixels>originalWidth*originalHeight*.23)return null;return{mask,proposal,frontier:f,visible,dark,clipped,rim,body,base:g,final,rings};}

function region(D,proposal){const[x,y,r]=proposal.circle,box=[Math.max(0,Math.floor(x-r*1.6)),Math.max(0,Math.floor(y-r*2.4)),Math.min(D.w,Math.ceil(x+r*1.6)),Math.min(D.h,Math.ceil(y+r*1.5))],w=box[2]-box[0],h=box[3]-box[1],max=new Uint8Array(w*h),min=new Uint8Array(w*h);for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){const src=(yy+box[1])*D.w+xx+box[0],i=yy*w+xx;max[i]=D.max[src];min[i]=D.min[src];}return{box,w,h,max,min};}
function discoverRGBA(a,w,h,log){const D=data(a,w,h);if(!D)return[];const out=[];for(const proposal of proposals(a,w,h)){const[x,y,r]=proposal.circle;if(r<w*.10||r>w*.23||y-r<2||y+r>h-2||Math.max(0,r-x,x+r-w)>r*.22)continue;const source=region(D,proposal),local={...proposal,circle:[x-source.box[0],y-source.box[1],r]},measured=measure(source,local,w,h);if(!measured)continue;out.push({...measured,source,globalProposal:proposal,originalSize:[w,h]});log?.('pointing speech inset: '+measured.dark+'/'+measured.visible+' visible source rim');}return out;}

function encodeBytes(a){let text='';for(let i=0;i<a.length;i+=8192)text+=String.fromCharCode(...a.subarray(i,i+8192));return btoa(text);}
function decodeBytes(text,n){if(typeof text!=='string'||text.length>Math.ceil(n/3)*4)return null;try{const str=atob(text);if(str.length!==n)return null;const a=Uint8Array.from(str,c=>c.charCodeAt(0));return encodeBytes(a)===text?a:null;}catch(_){return null;}}
function populations(D){return[D.min,D.max].map(a=>{const counts=new Array(256).fill(0);for(const v of a)counts[v]++;return counts;});}
function summary(c){return{base:c.base,final:c.final,visible:c.visible,dark:c.dark,clipped:c.clipped,frontier:{offsets:c.frontier.offsets,support:c.frontier.support},body:{id:c.body.c.id,box:c.body.c.box,size:c.body.c.size,tail:{rows:c.body.t.rows,letters:c.body.t.letters,begin:c.body.t.begin,end:c.body.t.end,length:c.body.t.length,width:c.body.t.width},second:{rows:c.body.second.rows,letters:c.body.second.letters,begin:c.body.second.begin,end:c.body.second.end},witness:c.body.witness},mask:runs(c.mask),rings:c.rings};}
function construct(v,c){const W=v.analysisWidth,H=v.analysisHeight,[ox,oy]=v.source.box,[x,y,X,Y]=c.final.box;return{x:(x+ox)/W,y:(y+oy)/H,w:(X-x)/W,h:(Y-y)/H,_identitySource:'structural-grid-frame',_geometryOwner:'structural-grid-contours',_geometryType:'native-round-pointing-speech',_contours:c.rings.map(r=>r.map(([x,y])=>({x:(x+ox)/W,y:(y+oy)/H}))),_structuralGridProof:v};}
function freeze(v){if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;}
function claims(p){return p?._structuralGridProof?.version===VERSION||p?._structuralGridProof?.method===METHOD||p?._geometryType==='native-round-pointing-speech';}
function eligible(prior){try{if(!Array.isArray(prior))return false;if(!prior.length)return true;const base=prior.filter(p=>p?._structuralGridProof?.version===18),atomic=prior.filter(p=>p?._structuralGridProof?.version===80);return base.length>=3&&base.length<=24&&atomic.length===1&&prior.length===base.length+1&&same(prior,base.concat(atomic))&&PanelRoundAtomicInset.eligible(base)&&atomic.every(PanelRoundAtomicInset.validPanel)&&same(atomic[0]._structuralGridProof.anchors,base);}catch(_){return false;}}
function sourceOwners(a,w,h,prior){if(!eligible(prior))return false;if(!prior.length)return true;const base=prior.filter(p=>p._structuralGridProof.version===18),atomic=prior.filter(p=>p._structuralGridProof.version===80),pw=base[0]._structuralGridProof.analysisWidth,ph=base[0]._structuralGridProof.analysisHeight;return same(PanelRaggedGutters.analyzeRGBA(PanelMatteCells.sampleBilinearRGBA(a,w,h,pw,ph),pw,ph),base)&&PanelRoundAtomicInset.replayRGBA(a,w,h,atomic,base);}
function validPanel(p){try{const v=p?._structuralGridProof,hit=v&&cache.get(v);if(hit&&hit.contours===p._contours)return same(hit.box,[p.x,p.y,p.w,p.h])&&p._identitySource==='structural-grid-frame'&&p._geometryOwner==='structural-grid-contours'&&p._geometryType==='native-round-pointing-speech'&&!p._outline&&!p._quad;const W=v?.analysisWidth,H=v?.analysisHeight;if(v?.version!==VERSION||v.method!==METHOD||!dims(W,H)||!eligible(v.anchors)||!Array.isArray(v.proposal?.circle)||v.proposal.circle.length!==3||v.proposal.circle.some(n=>!Number.isFinite(n))||!Number.isFinite(v.proposal.vote)||v.proposal.vote<=0)return false;const[x,y,r]=v.proposal.circle,ss=v.proposal.sampleSize,sc=v.proposal.sampleCircle;if(!Array.isArray(ss)||ss.length!==2||!dims(...ss)||ss.some(v=>v>900)||!Array.isArray(sc)||sc.length!==3||!same([x,y,r],[sc[0]*W/ss[0],sc[1]*H/ss[1],sc[2]*H/ss[1]]))return false;const box=[Math.max(0,Math.floor(x-r*1.6)),Math.max(0,Math.floor(y-r*2.4)),Math.min(W,Math.ceil(x+r*1.6)),Math.min(H,Math.ceil(y+r*1.5))];if(!same(v.source?.box,box))return false;const w=box[2]-box[0],h=box[3]-box[1];if(!dims(w,h))return false;const D={w,h,min:decodeBytes(v.source.min,w*h),max:decodeBytes(v.source.max,w*h)};if(!D.min||!D.max||D.min.some((n,i)=>n>D.max[i])||!same(populations(D),v.source.populations))return false;const c=measure(D,{...v.proposal,circle:[x-box[0],y-box[1],r]},W,H);if(!c||!same(summary(c),v.measurement)||!same(construct(v,c),p))return false;freeze(v);freeze(p._contours);cache.set(v,{contours:p._contours,box:[p.x,p.y,p.w,p.h]});return true;}catch(_){return false;}}

// Reuse only a completed discovery and retain at most 8 MiB of evidence.
// The shared witness retains at most 32 MiB of pixels across both families.
// Oversize/unsupported inputs follow the original uncached computation.
let nativeDiscovery = null;
// Bound the additional parsed graph as well as its serialized backing.
// These are storage/cardinality limits, not a claim about V8 object overhead.
function boundedDiscoveryGraph(value) {
 let nodes=0,slots=0,stringBytes=0,undefinedValues=0,units=0;
 const seen=new Set(),stack=[value],MAX_UNITS=4*1024*1024;
 function stringUnits(text) {
  let n=2;
  for(let i=0;i<text.length;i++) {
   const c=text.charCodeAt(i);
   if(c===34||c===92||c===8||c===9||c===10||c===12||c===13)n+=2;
   else if(c<32)n+=6;
   else if(c>=0xd800&&c<=0xdbff){const d=text.charCodeAt(i+1);if(d>=0xdc00&&d<=0xdfff){n+=2;i++;}else n+=6;}
   else if(c>=0xdc00&&c<=0xdfff)n+=6;
   else n++;
  }
  return n;
 }
 while(stack.length) {
  const item=stack.pop();
  if(item===undefined){if(++undefinedValues>4096)return false;units+='{"_nthAbsentValue":true}'.length;}
  else if(item===null)units+=4;
  else if(typeof item==='number'){if(!Number.isFinite(item)||Object.is(item,-0))return false;units+=String(item).length;}
  else if(typeof item==='boolean')units+=item?4:5;
  else if(typeof item==='string'){stringBytes+=item.length*2;if(stringBytes>8*1024*1024)return false;units+=stringUnits(item);}
  else if(typeof item==='object') {
   if(seen.has(item)||++nodes>8192)return false;
   seen.add(item);const keys=Object.keys(item),array=Array.isArray(item);slots+=keys.length;
   if(slots>262144)return false;
   if(array&&(keys.length!==item.length||keys.some((key,i)=>key!==String(i))))return false;
   units+=2+Math.max(0,keys.length-1)+(array?0:keys.length);
   for(const key of keys){stack.push(item[key]);if(!array)stack.push(key);}
  } else return false;
  if(units>MAX_UNITS)return false;
 }
 return true;
}
// Discovery creates this data internally; preserve present-but-undefined
// fields when copying its private JSON representation back into fresh data.
function restoreDiscoveryEvidence(value) {
 if (value && typeof value === 'object') {
  if (!Array.isArray(value) && Object.keys(value).length === 1 && value._nthAbsentValue === true) return undefined;
  for (const key of Object.keys(value)) value[key] = restoreDiscoveryEvidence(value[key]);
 }
 return value;
}
function discoveryEvidence(a, w, h, log) {
 const witness = typeof PanelRasterWitness === 'undefined' ? null : PanelRasterWitness;
 const token = witness?.token(a, w, h), old = nativeDiscovery;
 try {
  if (token && old?.token === token)
    return { evidence: restoreDiscoveryEvidence(JSON.parse(old.evidence)), pending: old, witness, token };
  const evidence = discoverRGBA(a, w, h, log).map(c => ({proposal:c.globalProposal,source:{box:c.source.box,min:encodeBytes(c.source.min),max:encodeBytes(c.source.max),populations:populations(c.source)},measurement:summary(c)}));
  let pending = null;
  if (token && evidence.length && witness.matches(a, w, h, token) && boundedDiscoveryGraph(evidence)) {
   const text = JSON.stringify(evidence, (key, value) => value === undefined ? { _nthAbsentValue: true } : value);
   if (text.length * 2 <= 8 * 1024 * 1024) pending = { token, evidence: text };
  }
  return { evidence, pending, witness, token };
 } catch (error) { witness?.discard(token); throw error; }
}
function finishDiscovery(discovered, accepted) {
 if (accepted && discovered.pending && discovered.witness.commit(discovered.token))
  nativeDiscovery = discovered.pending;
 else discovered.witness?.discard(discovered.token);
}
function analyzeRGBA(a,w,h,prior=[],log) {
 if (!data(a,w,h)||!sourceOwners(a,w,h,prior)) return [];
 const discovered=discoveryEvidence(a,w,h,log),q=discovered.evidence;
 try {
  if (q.length!==1) return [];
  const e=q[0],v={version:VERSION,method:METHOD,analysisWidth:w,analysisHeight:h,anchors:JSON.parse(JSON.stringify(prior)),...e},c={final:e.measurement.final,rings:e.measurement.rings},p=construct(v,c);
  if (!validPanel(p)) return [];
  finishDiscovery(discovered,true);
  return [p];
 } finally { discovered.witness?.discard(discovered.token); }
}
function replayRGBA(a,w,h,panels,prior=[]){return Array.isArray(panels)&&panels.length===1&&panels.every(validPanel)&&same(analyzeRGBA(a,w,h,prior),panels);}
function supplementImage(img,prior,log){if(!img||!eligible(prior))return[];const W=img.naturalWidth||img.width,H=img.naturalHeight||img.height;if(!dims(W,H))return[];let c;try{c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d',{willReadFrequently:true});if(!g)return[];g.drawImage(img,0,0);return analyzeRGBA(g.getImageData(0,0,W,H).data,W,H,prior,log);}catch(_){return[];}finally{if(c)c.width=c.height=1;}}
const areaRing=q=>q.reduce((s,a,i)=>{const b=q[(i+1)%q.length];return s+a[0]*b[1]-b[0]*a[1];},0)/2;
  function traceNative(labels,w,h,id){
    const edges=[],next=new Map(),stride=w+1;
    const add=(x,y,X,Y,dir)=>{const a=y*stride+x,b=Y*stride+X,key=edges.length;edges.push({a,b,dir});if(!next.has(a))next.set(a,[]);next.get(a).push(key);};
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x;if(labels[i]!==id)continue;
      if(!y||labels[i-w]!==id)add(x,y,x+1,y,0);if(x+1===w||labels[i+1]!==id)add(x+1,y,x+1,y+1,1);
      if(y+1===h||labels[i+w]!==id)add(x+1,y+1,x,y+1,2);if(!x||labels[i-1]!==id)add(x,y+1,x,y,3);
    }
    if(!edges.length||edges.length>120000)return null;const used=new Uint8Array(edges.length),rings=[];
    for(let seed=0;seed<edges.length;seed++)if(!used[seed]){
      let at=seed;const pts=[];
      for(let steps=0;steps<=edges.length;steps++){
        if(used[at])return null;const e=edges[at];used[at]=1;pts.push([e.a%stride,e.a/stride|0]);if(e.b===edges[seed].a)break;
        const opts=(next.get(e.b)||[]).filter(k=>!used[k]);if(!opts.length)return null;
        const rank=k=>{const d=(edges[k].dir-e.dir+4)%4;return d===1?0:d===0?1:d===3?2:3;};opts.sort((a,b)=>rank(a)-rank(b));at=opts[0];
      }
      const q=pts.filter((p,i)=>{const a=pts[(i+pts.length-1)%pts.length],b=pts[(i+1)%pts.length];return (p[0]-a[0])*(b[1]-p[1])!==(p[1]-a[1])*(b[0]-p[0]);});
      if(q.length<4||q.length>32768||!areaRing(q))return null;rings.push(q);if(rings.length>256)return null;
    }return rings.sort((a,b)=>Math.abs(areaRing(b))-Math.abs(areaRing(a)));
  }

function installReader(r){if(!r||r._roundSpeechReader)return;const display=r.displayPanelContours,find=r.findPanelAt,zoom=r.zoomToPanel,loads=new WeakMap();
 const sourceState=img=>{if(!img)return{stamp:[null],ready:false};try{let load=loads.get(img);if(!load){load={generation:0,failed:false};loads.set(img,load);if(typeof img.addEventListener==='function'){img.addEventListener('load',()=>{load.generation++;load.failed=false;});img.addEventListener('error',()=>{load.generation++;load.failed=true;});}}const stamp=[img,img.currentSrc,img.src,img.naturalWidth,img.naturalHeight,img.width,img.height,img.complete,load.generation,load.failed],W=typeof img.naturalWidth==='number'?img.naturalWidth:img.width,H=typeof img.naturalHeight==='number'?img.naturalHeight:img.height;return{stamp,ready:img.complete!==false&&!load.failed&&W>0&&H>0&&W*H<=24000000};}catch(_){return{stamp:[img,null],ready:false};}};
 function state(reader){const owners=reader.currentPanels,children=Array.isArray(owners)?owners.filter(claims):[];if(!children.length)return null;let img;try{img=reader.getPanelImageContext?.()?.img}catch(_){}const previous=owners.filter(p=>!claims(p));const source=sourceState(img);let childSig=null,priorSig=null;try{childSig=JSON.stringify(children);priorSig=JSON.stringify(previous);}catch(_){}let s=reader._roundSpeechDisplay;if(s&&s.owners===owners&&s.img===img&&s.source.length===source.stamp.length&&s.source.every((v,i)=>v===source.stamp[i])&&s.items.length===owners.length&&s.items.every((p,i)=>p===owners[i])&&childSig!==null&&priorSig!==null&&s.childSig===childSig&&s.priorSig===priorSig)return s;s=reader._roundSpeechDisplay={owners,img,source:source.stamp,sourceReady:source.ready,childSig,priorSig,items:owners.slice(),previous,children,verified:false,host:null,hostCache:null};if(!source.ready||children.length!==1||!children.every(validPanel)||!eligible(previous)||!children.every(p=>same(p._structuralGridProof.anchors,previous)))return s;try{s.verified=same(supplementImage(img,previous),children);}catch(_){}if(!s.verified)return s;const atomic=previous.filter(p=>p?._structuralGridProof?.version===80);s.atomic=atomic[0]||null;if(atomic.length!==1)return s;
 const w=children[0]._structuralGridProof.analysisWidth,h=children[0]._structuralGridProof.analysisHeight,cut=[children[0],atomic[0]].map(p=>PanelCropRepair.raster(p._contours,w,h)),sizes=cut.map(m=>sum(m)),hosts=[];for(const p of previous){if(p?._structuralGridProof?.version!==18)continue;const rings=PanelGeometryOrthogonal._provenContours(p);if(!rings)continue;const m=PanelCropRepair.raster(rings,w,h),hits=cut.map(q=>q.reduce((n,v,i)=>n+(v&&m[i]),0));if(hits[0]>sizes[0]*.90&&hits[1]>sizes[1]*.85)hosts.push(p);}if(hosts.length===1){s.host=hosts[0];s.cut=cut[0].map((v,i)=>+(v||cut[1][i]));s.w=w;s.h=h;}return s;
 }
 function previousDisplay(reader,s,p,c){const owners=reader.currentPanels;reader.currentPanels=s.previous;try{return display.call(reader,p,c);}finally{reader.currentPanels=owners;}}
 r.displayPanelContours=function(p,c=this.panelContours(p)){const s=state(this);if(!s)return claims(p)?null:display.call(this,p,c);if(claims(p))return s.verified&&s.children.includes(p)?p._contours:null;const base=previousDisplay(this,s,p,c);if(!s.verified||p!==s.host||!base)return base;if(s.hostCache)return s.hostCache;const mask=PanelCropRepair.raster(base,s.w,s.h);for(let i=0;i<mask.length;i++)if(s.cut[i])mask[i]=0;const rings=traceNative(mask,s.w,s.h,1);if(!rings)return base;s.hostCache=rings.map(q=>q.map(([x,y])=>({x:x/s.w,y:y/s.h})));return s.hostCache;};
 r.findPanelAt=function(x,y){const s=state(this);if(!s)return find.call(this,x,y);if(s.verified&&this.panelZoomEnabled)for(const p of s.children)if(this.pointInContours(p._contours,x,y))return p;const owners=this.currentPanels;this.currentPanels=s.previous;let p;try{p=find.call(this,x,y);}finally{this.currentPanels=owners;}if(p&&s.verified&&p===s.host&&!this.pointInContours(this.displayPanelContours(p),x,y))return null;return p;};
 r.zoomToPanel=async function(p,...args){const s=state(this);if(claims(p)&&(!s?.verified||!s.children.includes(p)))return;if(s&&!claims(p)&&(!s.verified||p===s.atomic)){const owners=this.currentPanels;this.currentPanels=s.previous;try{return await zoom.call(this,p,...args);}finally{if(this.currentPanels===s.previous)this.currentPanels=owners;}}return zoom.call(this,p,...args);};r._roundSpeechReader=true;
}

function install(d){if(typeof PanelStructuralGrid!=='undefined'&&!PanelStructuralGrid._roundSpeech){const old=PanelStructuralGrid.validPanel;PanelStructuralGrid.validPanel=p=>p?._structuralGridProof?.version===VERSION?validPanel(p):old(p);PanelStructuralGrid._roundSpeech=true;}if(typeof PanelEdgeSpill!=='undefined'&&!PanelEdgeSpill._roundSpeech){for(const name of['analyzeImage','analyzeRGBA']){const old=PanelEdgeSpill[name];PanelEdgeSpill[name]=function(...a){return validPanel(a[name==='analyzeImage'?1:3])?null:old.apply(this,a);};}PanelEdgeSpill._roundSpeech=true;}if(typeof PanelGeometry!=='undefined'&&!PanelGeometry._roundSpeech){const old=PanelGeometry.refine;PanelGeometry.refine=async function(url,p,log){return validPanel(p)?{...p}:old.call(this,url,p,log)};PanelGeometry._roundSpeech=true;}if(!d||d._roundSpeech)return;const old=d.detect;d.detect=async function(url,log){const prior=await old.call(this,url,log);if(!eligible(prior))return prior;try{const img=new Image();img.src=url;await img.decode();return prior.concat(supplementImage(img,prior,log));}catch(_){return prior;}};d._roundSpeech=true;}
return{VERSION,METHOD,claims,eligible,sourceOwners,discoverRGBA,analyzeRGBA,replayRGBA,supplementImage,validPanel,installReader,install,_debug:{proposals,frontier,solveFrontier,data,cc,fill,polygonMask,sample,extent,runs,unruns,tail,measure,region,encodeBytes,decodeBytes,summary,construct}};
})();
if(typeof PanelDetect!=='undefined')PanelRoundSpeechInset.install(PanelDetect);
if(typeof module!=='undefined')module.exports=PanelRoundSpeechInset;
