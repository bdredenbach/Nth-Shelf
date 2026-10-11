/* Closed articulated rims are discovered from source pixels. A bounded hole
 * locates a candidate; two independent chromatic thresholds and four dark
 * collar paths establish its complete perimeter. No page identity is used. */
const PanelArticulatedRimCell=(()=>{
 'use strict';
 const VERSION=96,METHOD='source-articulated-rim-cell',TYPE='articulated-rim-cell',same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),cache=new WeakMap();
 const F=PanelFirmEnclosureGroups;
 const sourceEpochs=new WeakMap();
 function sourceState(img){if(!img||typeof img!=='object')return null;try{let record=sourceEpochs.get(img);if(!record){record={generation:0,failed:false};if(typeof img.addEventListener==='function'){img.addEventListener('load',()=>{record.generation++;record.failed=false;});img.addEventListener('error',()=>{record.generation++;record.failed=true;});}sourceEpochs.set(img,record);}return[img.src,img.currentSrc,img.naturalWidth,img.naturalHeight,img.width,img.height,img.complete,record.generation,record.failed];}catch(_){return null;}}
 function readyState(s){return !!s&&s[6]!==false&&!s[8]&&!(typeof s[2]==='number'&&(!s[2]||!s[3]));}
 function sourceReady(img){return readyState(sourceState(img));}
 // Every scoped child keeps its original immutable proof and ordered owners.
 // Older wrappers may temporarily narrow those owners, but may not renew source
 // trust after a fault until the entire child call has returned or settled.
 const readerScopes=new WeakMap(),readerStateKeys=['_articulatedRimState','_articulatedUpperState','_articulatedExteriorState'];
 // Caller evidence can be shallow-frozen or share an accepted ancestor. These
 // read-only tokens never freeze that graph; only private replay evidence is sealed.
 const immutableInputs=new WeakSet(),inputSnapshots=new WeakMap();
 function immutableInput(value,visiting=new Set()){if(!value||typeof value!=='object')return typeof value!=='function';if(immutableInputs.has(value))return true;if(!Object.isFrozen(value)||visiting.has(value))return false;visiting.add(value);for(const key of Reflect.ownKeys(value)){const d=Object.getOwnPropertyDescriptor(value,key);if(!d||!('value'in d)||!immutableInput(d.value,visiting))return false;}visiting.delete(value);immutableInputs.add(value);return true;}
 function inputSnapshot(value){const records=[],seen=new Set(),visiting=new Set();function visit(v){if(typeof v==='function')throw Error('Panel evidence must be data');if(!v||typeof v!=='object'||immutableInput(v))return;if(visiting.has(v))throw Error('Cyclic panel evidence');if(seen.has(v))return;seen.add(v);visiting.add(v);const keys=Reflect.ownKeys(v),values=[],enumerable=[];for(const key of keys){const d=Object.getOwnPropertyDescriptor(v,key);if(!d||!('value'in d))throw Error('Panel evidence cannot contain accessors');values.push(d.value);enumerable.push(d.enumerable);}records.push({value:v,prototype:Object.getPrototypeOf(v),keys,values,enumerable});values.forEach(visit);visiting.delete(v);}visit(value);return{records,immutable:records.length===0};}
 function matchesInput(hit){return hit.records.every(({value,prototype,keys,values,enumerable})=>Object.getPrototypeOf(value)===prototype&&equalItems(keys,Reflect.ownKeys(value))&&keys.every((key,i)=>{const d=Object.getOwnPropertyDescriptor(value,key);return d&&('value'in d)&&d.value===values[i]&&d.enumerable===enumerable[i];}));}
 function inputToken(value){if(!value||typeof value!=='object')return null;let hit=inputSnapshots.get(value);if(hit?.immutable)return hit;if(hit&&!matchesInput(hit))hit=null;if(!hit){hit=inputSnapshot(value);inputSnapshots.set(value,hit);}else if(hit.records.every(r=>Object.isFrozen(r.value))){hit.immutable=true;hit.records=null;immutableInputs.add(value);}return hit;}
 function inputIdentity(owners){try{return Array.isArray(owners)?owners.map(inputToken):null;}catch(_){return null;}}
 function sameInput(identity,owners){const current=inputIdentity(owners);return !!identity&&!!current&&equalItems(identity,current);}
 function privateEvidence(value){const copy=JSON.parse(JSON.stringify(value));function seal(v){if(!v||typeof v!=='object')return;Object.values(v).forEach(seal);Object.freeze(v);immutableInputs.add(v);}seal(copy);return copy;}
 function equalItems(a,b){if(!Array.isArray(a)||!Array.isArray(b)||a.length!==b.length)return false;for(let i=0;i<a.length;i++)if(a[i]!==b[i]||Object.prototype.hasOwnProperty.call(a,i)!==Object.prototype.hasOwnProperty.call(b,i))return false;return true;}
 function readerSource(reader){try{const img=reader.getPanelImageContext?.()?.img;return{img,source:sourceState(img)};}catch(_){return{img:null,source:null};}}
 function scopeRecord(reader){let q=readerScopes.get(reader);if(!q){q={pins:new Set(),contexts:new Set()};readerScopes.set(reader,q);}return q;}
 function invalidatePin(reader,pin){if(!pin.invalid){pin.invalid=true;for(const key of readerStateKeys)delete reader[key];}return false;}
 function checkPin(reader,pin){if(pin.invalid)return false;try{const owners=reader.currentPanels,q=scopeRecord(reader);const context=owners===pin.owners||[...q.contexts].some(s=>s.pins.has(pin)&&owners===s.owners&&equalItems(owners,s.items))||(pin.invoking&&Array.isArray(owners)&&(owners.length===0||(owners.length===1&&owners[0]===pin.child)));if(!context||!pin.lineage.every(s=>q.contexts.has(s)&&equalItems(s.before,s.beforeItems)&&sameInput(s.beforeInput,s.before))||!equalItems(pin.owners,pin.items)||reader.comic!==pin.comic||reader.index!==pin.index||pin.child._structuralGridProof!==pin.proof||pin.child._contours!==pin.contours||!sameInput(pin.input,pin.owners)||!immutableInput(pin.canonical)||!immutableInput(pin.display)||(!pin.invoking&&reader.panelOverlayToken!==pin.overlay))return invalidatePin(reader,pin);const live=readerSource(reader);if(live.img!==pin.img||!readyState(live.source)||!equalItems(pin.source,live.source))return invalidatePin(reader,pin);return true;}catch(_){return invalidatePin(reader,pin);}}
 const readerScopeGuard={
  identity:inputIdentity,unchanged:sameInput,canonical:privateEvidence,immutable:immutableInput,
  display(reader,key,p){const pin=[...scopeRecord(reader).pins].findLast(s=>s.key===key&&s.child===p);return pin?{display:checkPin(reader,pin)?pin.display:[]}:null;},
  blocked(reader,key){return [...scopeRecord(reader).pins].some(p=>p.key===key&&p.invalid);},
  check(reader){for(const pin of scopeRecord(reader).pins)checkPin(reader,pin);},
  under(reader,owners,fn){const q=scopeRecord(reader),before=reader.currentPanels,items=owners.slice(),comic=reader.comic,index=reader.index,s={owners,items,before,beforeItems:Array.isArray(before)?before.slice():[],beforeInput:inputIdentity(before),pins:new Set([...q.pins].filter(p=>checkPin(reader,p)))};q.contexts.add(s);reader.currentPanels=owners;let overlay,async=false;const restore=()=>{if(reader.currentPanels===owners&&equalItems(owners,items)&&reader.comic===comic&&reader.index===index&&(!async||reader.panelOverlayToken===overlay))reader.currentPanels=before;q.contexts.delete(s);};try{const result=fn();overlay=reader.panelOverlayToken;if(result&&typeof result.then==='function'){async=true;return Promise.resolve(result).finally(restore);}restore();return result;}catch(e){restore();throw e;}},
  run(reader,key,state,fn){const q=scopeRecord(reader);for(const p of q.pins)if(p.key===key)invalidatePin(reader,p);const lineage=[];let parent=state.owners;for(let s; (s=[...q.contexts].findLast(s=>s.owners===parent&&!lineage.includes(s)));parent=s.before)lineage.push(s);const pin={key,lineage,child:state.child,proof:state.child._structuralGridProof,display:state.display,contours:state.child._contours,canonical:state.canonical,input:state.input,owners:state.owners,items:state.items.slice(),img:state.img,source:state.source.slice(),comic:reader.comic,index:reader.index,invoking:true,invalid:false};q.pins.add(pin);const finish=()=>{checkPin(reader,pin);if(pin.held)q.contexts.delete(pin.held);q.pins.delete(pin);};try{if(!checkPin(reader,pin)){finish();return;}const result=fn();if(checkPin(reader,pin)){const owners=reader.currentPanels;if(owners!==pin.owners&&![...q.contexts].some(s=>s.pins.has(pin)&&s.owners===owners)){pin.held={owners,items:owners.slice(),before:pin.owners,beforeItems:pin.items,beforeInput:pin.input,pins:new Set([pin])};q.contexts.add(pin.held);}}pin.overlay=reader.panelOverlayToken;pin.invoking=false;if(result&&typeof result.then==='function')return Promise.resolve(result).finally(finish);finish();return result;}catch(e){pin.overlay=reader.panelOverlayToken;pin.invoking=false;finish();throw e;}}
 };
 function freeze(o){if(o&&typeof o==='object'&&!Object.isFrozen(o)){Object.values(o).forEach(freeze);Object.freeze(o);}return o;}
 function dims(w,h){return Number.isInteger(w)&&Number.isInteger(h)&&w>=250&&h>=350&&w<=900&&h<=900;}
 function eligible(prior){return Array.isArray(prior)&&prior.length===1&&F.validPanel(prior[0])&&prior[0].w>=.9&&prior[0].h>=.9;}
 function ancestry(prior){return eligible(prior);}
 function grow(m,w,h){const a=m.slice();for(let i=0;i<m.length;i++)if(m[i]){const x=i%w,y=i/w|0;if(x)a[i-1]=1;if(x+1<w)a[i+1]=1;if(y)a[i-w]=1;if(y+1<h)a[i+w]=1;}return a;}
 function erode(m,w,h){const a=new Uint8Array(m.length);for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){const i=y*w+x;a[i]=+(m[i]&&m[i-1]&&m[i+1]&&m[i-w]&&m[i+w]);}return a;}
 function outside(m,w,h){const seen=new Uint8Array(m.length),q=new Int32Array(m.length);let n=0;const add=i=>{if(!m[i]&&!seen[i]){seen[i]=1;q[n++]=i;}};for(let x=0;x<w;x++){add(x);add((h-1)*w+x);}for(let y=0;y<h;y++){add(y*w);add(y*w+w-1);}for(let k=0;k<n;k++){const i=q[k],x=i%w,y=i/w|0;if(x)add(i-1);if(x+1<w)add(i+1);if(y)add(i-w);if(y+1<h)add(i+w);}return seen;}
 function extent(m,w,h){let x=w,y=h,X=0,Y=0,pixels=0;for(let i=0;i<m.length;i++)if(m[i]){const u=i%w,v=i/w|0;x=Math.min(x,u);y=Math.min(y,v);X=Math.max(X,u+1);Y=Math.max(Y,v+1);pixels++;}return{box:[x,y,X,Y],pixels};}
 function fields(a,w,h){if(!dims(w,h)||a?.length!==w*h*4)return null;const hue=new Float32Array(w*h),sat=new Float32Array(w*h),max=new Uint8Array(w*h),mean=new Float32Array(w*h),white=new Uint8Array(w*h);for(let i=0;i<w*h;i++){if(a[4*i+3]!==255)return null;const r=a[4*i],g=a[4*i+1],b=a[4*i+2],M=Math.max(r,g,b),m=Math.min(r,g,b),d=M-m;hue[i]=!d?0:M===r?((g-b)/d+6)%6/6:M===g?((b-r)/d+2)/6:((r-g)/d+4)/6;sat[i]=M?d/M:0;max[i]=M;mean[i]=(r+g+b)/3;white[i]=+(m>195&&d<40);}return{hue,sat,max,mean,white};}
 function palette(f,bin,k,upper){const m=new Uint8Array(f.hue.length);for(let i=0;i<m.length;i++){const d=Math.abs(f.hue[i]-bin/6);m[i]=+(Math.min(d,1-d)<.1&&f.sat[i]>[.12,.15][k]&&f.sat[i]<upper&&f.max[i]>55&&f.max[i]<215);}return m;}
 function candidates(m,w,h){const wall=erode(grow(m,w,h),w,h),ex=outside(wall,w,h),holes=wall.map((v,i)=>+(!v&&!ex[i])),parts=F.components(holes,w,h);return parts.items.filter(c=>{const[x,y,X,Y]=c.box,A=(X-x)*(Y-y);return x>6&&y>6&&X<w-6&&Y<h-6&&X-x>w*.16&&X-x<w*.6&&Y-y>h*.16&&Y-y<h*.60&&A>w*h*.035&&A<w*h*.25&&c.pixels>A*.32&&c.pixels>A*.1;}).map(c=>({box:c.box,pixels:c.pixels,runs:F.encode(parts.ids.map(n=>+(n===c.id)))}));}
 function guide(hole,w,h,side){if(side>=2)return null;const m=F.decode(hole.runs,w,h);if(!m)return null;const pts=[];for(let x=hole.box[0];x<hole.box[2];x++){let edge=side?0:h;for(let y=hole.box[1];y<hole.box[3];y++)if(m[y*w+x])edge=side?Math.max(edge,y):Math.min(edge,y);if(edge>0&&edge<h)pts.push([x,edge]);}let best=null;for(let k=-16;k<=16;k++){const slope=k*.025,bins=new Map();for(const[x,y]of pts){const b=Math.round((y-slope*x)/2);bins.set(b,(bins.get(b)||0)+1);}for(const [b]of bins){let hits=0;for(let d=-2;d<=2;d++)hits+=bins.get(b+d)||0;if(!best||hits>best.hits)best={slope,intercept:b*2,hits};}}return best&&best.hits>=pts.length*.4?best:null;}

 function path(m,mean,w,h,hole,side){const box=hole.box,rail=guide(hole,w,h,side),vertical=side>=2,sign=side%2?-1:1,pad=Math.max(10,Math.round(Math.min(w,h)*.026)),radius=Math.max(20,Math.round(Math.min(w,h)*.051)),lo=Math.max(0,(vertical?box[1]:box[0])-pad),hi=Math.min(vertical?h:w,(vertical?box[3]:box[2])+pad),edge=box[[1,3,0,2][side]],start=Math.max(8,edge-radius),end=Math.min((vertical?w:h)-8,edge+radius),W=end-start,H=hi-lo;if(W<5||H<20||side<2&&!rail)return null;const scores=new Float32Array(W*H),evidence=new Array(W*H),parent=new Int16Array(W*H);let dp=new Float64Array(W);
  for(let t=0;t<H;t++)for(let j=0;j<W;j++){const x=start+j,at=u=>vertical?(lo+t)*w+u:u*w+lo+t;let color=0,ink=255,bright=0;for(let d=2;d<8;d++){color+=m[at(x+sign*d)];bright=Math.max(bright,mean[at(x+sign*d)]);}for(let d=0;d<4;d++)ink=Math.min(ink,mean[at(x-sign*d)]);const idx=t*W+j,cost=(1-color/6)*2+Math.max(0,ink-65)/50+Math.max(0,18-(bright-ink))/25+.025*(side%2?end-x:x-start);scores[idx]=rail&&(sign*(x-(rail.slope*(lo+t)+rail.intercept))< -Math.max(12,Math.round(w*.031))||sign*(x-(rail.slope*(lo+t)+rail.intercept))>4)?Infinity:cost;evidence[idx]=[color,ink,bright];if(!t)dp[j]=scores[idx];}
  for(let t=1;t<H;t++){const next=new Float64Array(W);next.fill(Infinity);for(let j=0;j<W;j++)for(let d=-2;d<=2;d++){const p=j+d;if(p<0||p>=W)continue;const value=dp[p]+Math.abs(d)*.13+scores[t*W+j];if(value<next[j]){next[j]=value;parent[t*W+j]=p;}}dp=next;}
  let j=0;for(let n=1;n<W;n++)if(dp[n]<dp[j])j=n;const score=dp[j],points=new Array(H),observations=new Array(H);for(let t=H-1;t>=0;t--){points[t]=start+j;observations[t]=evidence[t*W+j];j=parent[t*W+j];}return{side,lo,hi,start,end,rail,points,observations,score};
 }
 function support(v,w,h,hole,side){const box=hole.box;if(!v||v.side!==side||!Number.isInteger(v.lo)||!Number.isInteger(v.hi)||!Number.isInteger(v.start)||!Number.isInteger(v.end)||!Array.isArray(v.points)||v.points.length!==v.hi-v.lo||v.observations?.length!==v.points.length||!Number.isFinite(v.score)||v.score<0)return false;if(!same(v.rail,guide(hole,w,h,side)))return false;const vertical=side>=2,pad=Math.max(10,Math.round(Math.min(w,h)*.026)),radius=Math.max(20,Math.round(Math.min(w,h)*.051)),edge=box[[1,3,0,2][side]];if(!same([v.lo,v.hi,v.start,v.end],[Math.max(0,(vertical?box[1]:box[0])-pad),Math.min(vertical?h:w,(vertical?box[3]:box[2])+pad),Math.max(8,edge-radius),Math.min((vertical?w:h)-8,edge+radius)]))return false;let hits=0,gap=0,maxGap=0,score=0;for(let t=0;t<v.points.length;t++){const x=v.points[t],q=v.observations[t];if(!Number.isInteger(x)||x<v.start||x>=v.end||t&&Math.abs(x-v.points[t-1])>2||q?.length!==3||!Number.isInteger(q[0])||q[0]<0||q[0]>6||q.slice(1).some(n=>!Number.isFinite(n)||n<0||n>255))return false;const[color,ink,bright]=q,hit=color>=3&&ink<75&&bright-ink>18;if(t+v.lo>=(vertical?box[1]:box[0])&&t+v.lo<(vertical?box[3]:box[2])){hits+=hit;gap=hit?0:gap+1;maxGap=Math.max(maxGap,gap);}score+=(1-color/6)*2+Math.max(0,ink-65)/50+Math.max(0,18-(bright-ink))/25+.025*(side%2?v.end-x:x-v.start)+(t?Math.abs(x-v.points[t-1])*.13:0);}const span=vertical?box[3]-box[1]:box[2]-box[0];return hits>=span*.74&&maxGap<=Math.max(12,span*.08)&&Math.abs(score-v.score)<.001;}
 function pathMask(paths,w,h){const m=new Uint8Array(w*h),[top,bottom,left,right]=paths;for(let y=Math.max(left.lo,right.lo);y<Math.min(left.hi,right.hi);y++)for(let x=Math.max(top.lo,bottom.lo);x<Math.min(top.hi,bottom.hi);x++)if(x>=left.points[y-left.lo]&&x<=right.points[y-right.lo]&&y>=top.points[x-top.lo]&&y<=bottom.points[x-bottom.lo])m[y*w+x]=1;const parts=F.components(m,w,h),tiny=new Set(parts.items.filter(q=>q.pixels<=4).map(q=>q.id));for(let i=0;i<m.length;i++)if(tiny.has(parts.ids[i]))m[i]=0;return m;}
 function measure(witnesses,w,h){if(witnesses?.length!==2)return null;const masks=[];for(let k=0;k<2;k++){const q=witnesses[k],b=q?.hole?.box;if(q?.threshold!==[.12,.15][k]||!Array.isArray(b)||b.length!==4||b.some((n,i)=>!Number.isInteger(n)||n<0||n>(i%2?h:w))||!Number.isInteger(q.hole.pixels)||q.paths?.length!==4||q.paths.some((p,s)=>!support(p,w,h,q.hole,s)))return null;const hm=F.decode(q.hole.runs,w,h);if(!hm||!same(extent(hm,w,h),{box:b,pixels:q.hole.pixels})||F.components(hm,w,h).items.length!==1)return null;const A=(b[2]-b[0])*(b[3]-b[1]);if(b[0]<=6||b[1]<=6||b[2]>=w-6||b[3]>=h-6||b[2]-b[0]<=w*.16||b[2]-b[0]>=w*.6||b[3]-b[1]<=h*.16||b[3]-b[1]>=h*.6||A<=w*h*.035||A>=w*h*.25||q.hole.pixels<=A*.32||q.hole.pixels>A)return null;masks.push(pathMask(q.paths,w,h));}if(witnesses[0].hole.box.some((n,i)=>Math.abs(n-witnesses[1].hole.box[i])>3))return null;const mask=masks[0].map((n,i)=>+(n||masks[1][i])),g=extent(mask,w,h);let difference=0;for(let i=0;i<mask.length;i++)difference+=+(masks[0][i]!==masks[1][i]);if(g.pixels<w*h*.035||g.pixels>w*h*.28||g.pixels<(g.box[2]-g.box[0])*(g.box[3]-g.box[1])*.7||difference>g.pixels*.018||F.components(mask,w,h).items.length!==1)return null;const rings=PanelMatteCells.tracePixelContours(mask,w,h,1);return rings?.length===1?{mask,g,rings,difference}:null;}
 function interiorLines(mask,w,h){const b=extent(mask,w,h).box,margin=Math.max(14,Math.round(Math.min(w,h)*.035)),lines=[];for(let side=0;side<2;side++){const lo=b[side]+margin,hi=b[side+2]-margin;for(let t=lo;t<hi;t++){const ids=[];for(let u=b[1-side]+margin;u<b[3-side]-margin;u++){const j=side?t*w+u:u*w+t;if(mask[j])ids.push(j);}if(ids.length>=30)lines.push(ids);}}return lines;}
 function separators(mask,f,color,w,h){return interiorLines(mask,w,h).map(ids=>[ids.length,ids.reduce((n,i)=>n+ +(f.mean[i]<45),0),ids.reduce((n,i)=>n+ +(f.white[i]&&f.mean[i]>225),0),ids.reduce((n,i)=>n+color[i],0)]);}
 function separatorsValid(q,mask,w,h){const lengths=interiorLines(mask,w,h).map(a=>a.length);return Array.isArray(q)&&q.length===lengths.length&&q.every((v,i)=>v?.length===4&&v.every(Number.isInteger)&&v[0]===lengths[i]&&v.slice(1).every(n=>n>=0&&n<=v[0])&&v[1]<v[0]*.94&&v[2]<v[0]*.94&&v[3]<v[0]*.94);}
 function speech(mask,f,w,h){const bodies=PanelColoredRims.whiteBodies(f.white,w,h);if(!bodies)return null;const out=[];for(const body of bodies.items){let atom=new Uint8Array(w*h);for(const i of body.indices)atom[i]=1;atom=erode(erode(atom,w,h),w,h);let inside=0,outside=0;for(let i=0;i<atom.length;i++)if(atom[i]){inside+=mask[i];outside+=+!mask[i];}if(inside&&outside)return null;if(inside)out.push(F.encode(atom));}return out;}
 function speechValid(q,mask,w,h){if(!Array.isArray(q)||q.length>128)return false;return q.every(r=>{const m=F.decode(r,w,h);return m&&m.some(Boolean)&&!m.some((n,i)=>n&&!mask[i]);});}
 function create(v,c){const w=v.analysisWidth,h=v.analysisHeight,[x,y,X,Y]=c.g.box;return{x:x/w,y:y/h,w:(X-x)/w,h:(Y-y)/h,_identitySource:'structural-grid-frame',_geometryOwner:'structural-grid-contours',_geometryType:TYPE,_contours:c.rings.map(r=>r.map(([x,y])=>({x:x/w,y:y/h}))),_structuralGridProof:v};}
 function validPanel(p){try{const v=p?._structuralGridProof;if(v&&Object.isFrozen(p)&&cache.has(p))return true;const w=v?.analysisWidth,h=v?.analysisHeight;if(v?.version!==VERSION||v.method!==METHOD||!dims(w,h)||!ancestry(v.prior)||!Number.isInteger(v.hueBin)||v.hueBin<0||v.hueBin>5||!Number.isFinite(v.variance)||v.variance<500)return false;const c=measure(v.witnesses,w,h);if(!c||!separatorsValid(v.separators,c.mask,w,h)||!speechValid(v.speech,c.mask,w,h)||v.pixels!==c.g.pixels||v.difference!==c.difference||!same(v.box,c.g.box)||!same(v.pixelContours,c.rings)||!same(create(v,c),p))return false;freeze(p);cache.set(p,true);return true;}catch(_){return false;}}
 function analyzeRGBA(a,w,h,prior=[]){if(!ancestry(prior)||prior.length&&(w!==prior[0]._structuralGridProof.analysisWidth||h!==prior[0]._structuralGridProof.analysisHeight))return[];const f=fields(a,w,h);if(!f||prior.length&&!same(F.analyzeRGBA(a,w,h,[]),prior))return[];const out=[];for(let bin=0;bin<6;bin++){const palettes=[0,1].map(k=>palette(f,bin,k,.5)),all=palettes.map(m=>candidates(m,w,h));if(!all[0].length||!all[1].length)continue;const rim=[0,1].map(k=>palette(f,bin,k,.6));for(const hole of all[0]){const matches=all[1].filter(q=>hole.box.every((n,i)=>Math.abs(n-q.box[i])<=3));if(matches.length!==1)continue;const witnesses=[hole,matches[0]].map((q,k)=>({threshold:[.12,.15][k],hole:q,paths:[0,1,2,3].map(side=>path(rim[k],f.mean,w,h,q,side))})),c=measure(witnesses,w,h);if(!c)continue;const lines=separators(c.mask,f,palettes[0],w,h),voices=speech(c.mask,f,w,h);if(!separatorsValid(lines,c.mask,w,h)||!voices)continue;let sum=0,sq=0;for(let i=0;i<c.mask.length;i++)if(c.mask[i]){sum+=f.mean[i];sq+=f.mean[i]*f.mean[i];}const variance=sq/c.g.pixels-(sum/c.g.pixels)**2;if(variance<500)continue;const v={version:VERSION,method:METHOD,analysisWidth:w,analysisHeight:h,prior:JSON.parse(JSON.stringify(prior)),hueBin:bin,witnesses,separators:lines,speech:voices,variance,pixels:c.g.pixels,box:c.g.box,difference:c.difference,pixelContours:c.rings},p=create(v,c);if(validPanel(p))out.push(p);}}
  // A unique independent enclosure is required, including competing palettes.
  return out.length===1?out:[];
 }
 function sourceReplay(p,a,w,h,prior=p?._structuralGridProof?.prior){return validPanel(p)&&same(analyzeRGBA(a,w,h,prior),[p]);}
 function imageRaster(img,w,h){let c;try{if(!sourceReady(img))return null;const W=img?.naturalWidth||img?.width,H=img?.naturalHeight||img?.height;if(!W||!H||W*H>24000000)return null;c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d',{willReadFrequently:true});if(!g)return null;g.drawImage(img,0,0);return PanelMatteCells.sampleBilinearRGBA(g.getImageData(0,0,W,H).data,W,H,w,h);}catch(_){return null;}finally{if(c)c.width=c.height=1;}}
 // Only the installed detector can issue a96 root after full source analysis.
 // Deep immutable validation is necessary but not sufficient: replay also
 // requires this private exact-root record and the retained full-raster token.
 // At most one completed generation is retained, without copied proof graphs.
 const issuedSampler=PanelMatteCells.sampleBilinearRGBA;
 const issuedWitness=typeof PanelRasterWitness==='undefined'?null:PanelRasterWitness;
 function witnessReady(){return !!issuedWitness&&typeof PanelRasterWitness!=='undefined'&&PanelRasterWitness===issuedWitness;}
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
  function root(value,memo,budget,frozen=true){
   if(!value||typeof value!=='object'||frozen&&!Object.isFrozen(value)||Object.getPrototypeOf(value)!==Object.prototype)return null;
   const names=Reflect.ownKeys(value),values=[],attributes=[];
   if(names.length!==keys.length)return null;
   for(let i=0;i<keys.length;i++){const d=Object.getOwnPropertyDescriptor(value,keys[i]);if(names[i]!==keys[i]||!d||!('value'in d)||!d.enumerable||!immutable(d.value,memo,new WeakSet(),budget))return null;values.push(d.value);attributes.push([d.enumerable,d.configurable,d.writable]);}
   return{value,values,attributes,frozen};
  }
  function sameRoot(binding){
   if(!binding||binding.frozen&&!Object.isFrozen(binding.value)||Object.getPrototypeOf(binding.value)!==Object.prototype)return false;
   const names=Reflect.ownKeys(binding.value);if(names.length!==keys.length)return false;
   for(let i=0;i<keys.length;i++){const d=Object.getOwnPropertyDescriptor(binding.value,keys[i]);if(names[i]!==keys[i]||!d||!('value'in d)||!d.enumerable||!Object.is(d.value,binding.values[i])||d.enumerable!==binding.attributes[i][0]||d.configurable!==binding.attributes[i][1]||d.writable!==binding.attributes[i][2])return false;}
   return true;
  }
  function single(values){
   if(!Array.isArray(values)||Object.getPrototypeOf(values)!==Array.prototype)return null;
   const names=Reflect.ownKeys(values),n=Object.getOwnPropertyDescriptor(values,'length'),d=Object.getOwnPropertyDescriptor(values,'0');
   return names.length===2&&names[0]==='0'&&names[1]==='length'&&n?.value===1&&d&&('value'in d)&&d.enumerable?d.value:null;
  }
  function begin(prior){try{const parent=single(prior),memo=new WeakSet(),budget={nodes:0,slots:0,strings:0},binding=root(parent,memo,budget,false);return binding?{prior,binding,memo,budget}:null;}catch(_){return null;}}
  function finish(plan,pixels,W,H,token,children,stable){
   try{
    if(!plan||!token)return false;
    const child=single(children),binding=root(child,plan.memo,plan.budget);
    if(!binding||binding.values[8]?.version!==VERSION||plan.binding.values[8]?.version!==66)return false;
    const exact=()=>witnessReady()&&stable()&&single(plan.prior)===plan.binding.value&&single(children)===child&&sameRoot(plan.binding)&&sameRoot(binding);
    if(!exact()||!PanelRasterWitness.matches(pixels,W,H,token)||!exact()||!PanelRasterWitness.commit(token)||!PanelRasterWitness.matchesRetained(pixels,W,H,token)||!exact())return false;
    const next=new WeakMap();next.set(child,{child:binding,token,W,H});records=next;return true;
   }catch(_){return false;}
  }
  function replay(pixels,W,H,children){try{const child=single(children),record=child&&records.get(child);if(!record||record.child.value!==child||record.W!==W||record.H!==H)return false;const exact=()=>witnessReady()&&PanelMatteCells.sampleBilinearRGBA===issuedSampler&&single(children)===child&&sameRoot(record.child);return exact()&&PanelRasterWitness.matchesRetained(pixels,W,H,record.token)&&exact();}catch(_){return false;}}
  return{begin,finish,replay};
 })();
 function withNativeCapture(img,run){
  let canvas;
  try{
   const before=sourceState(img);if(!before||!sourceReady(img))return null;
   const W=img.naturalWidth||img.width,H=img.naturalHeight||img.height;if(!Number.isSafeInteger(W)||!Number.isSafeInteger(H)||W<=0||H<=0||W*H>24000000)return null;
   const stable=()=>{const after=sourceState(img);return !!after&&sourceReady(img)&&before.every((v,i)=>v===after[i]);};
   canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;
   const g=canvas.getContext('2d',{willReadFrequently:true});if(!g)return null;g.drawImage(img,0,0);
   const pixels=g.getImageData(0,0,W,H).data;if(!stable())return null;
   const result=run(pixels,W,H,stable);return stable()?result:null;
  }catch(_){return null;}
  finally{if(canvas)canvas.width=canvas.height=1;}
 }
 // Only install() invokes this. Public analyzers/replayers/replaceImage do
 // not register roots. The token precedes sampling and checks the very same
 // private native bytes again after complete96 ->66 source analysis.
 function issuedReplaceImage(img,prior){
  if(!eligible(prior))return[];
  const plan=witnessReady()&&PanelMatteCells.sampleBilinearRGBA===issuedSampler?issuedSource.begin(prior):null,v=prior[0]._structuralGridProof;
  return withNativeCapture(img,(pixels,W,H,stable)=>{
   let token=null;
   try{
    if(plan)try{token=PanelRasterWitness.token(pixels,W,H);}catch(_){token=null;}
    const a=PanelMatteCells.sampleBilinearRGBA(pixels,W,H,v.analysisWidth,v.analysisHeight),out=analyzeRGBA(a,v.analysisWidth,v.analysisHeight,prior);
    if(!stable())return[];
    if(out.length)issuedSource.finish(plan,pixels,W,H,token,out,()=>stable()&&PanelMatteCells.sampleBilinearRGBA===issuedSampler);
    return out;
   }finally{if(token)try{PanelRasterWitness.discard(token);}catch(_){}}
  })||[];
 }
 function readerSourceRaster(img,w,h,children){
  return withNativeCapture(img,(pixels,W,H,stable)=>{
   const issued=issuedSource.replay(pixels,W,H,children)&&stable();
   return{issued,analysis:issued?null:PanelMatteCells.sampleBilinearRGBA(pixels,W,H,w,h),stable};
  });
 }

 function replaceImage(img,prior){if(!eligible(prior))return null;const w=prior[0]._structuralGridProof.analysisWidth,h=prior[0]._structuralGridProof.analysisHeight,a=imageRaster(img,w,h),out=a?analyzeRGBA(a,w,h,prior):[];return out.length?out:null;}
 function marked(p){return p?._structuralGridProof?.version===VERSION||p?._structuralGridProof?.method===METHOD||p?._geometryType===TYPE;}
 function installReader(r){if(!r||r._articulatedRimReader)return;const old=r.displayPanelContours,find=r.findPanelAt,zoom=r.zoomToPanel;
  function snapshot(owners){try{return JSON.stringify(owners);}catch(_){return null;}}
  function equalContext(state,reader){try{const img=reader.getPanelImageContext?.()?.img,source=sourceState(img);return state.img===img&&state.items.length===state.owners.length&&state.items.every((p,i)=>p===state.owners[i])&&source&&state.source.every((v,i)=>v===source[i]);}catch(_){return false;}}
  function context(reader){readerScopeGuard.check(reader);const owners=reader.currentPanels;if(!Array.isArray(owners)||!owners.some(marked))return null;if(readerScopeGuard.blocked(reader,'_articulatedRimState'))return{owners,prior:owners.filter(p=>!marked(p)),previous:new Map(),valid:false};let img;try{img=reader.getPanelImageContext?.()?.img;}catch(_){img=null;}const source=sourceState(img);let state=reader._articulatedRimState;if(state&&state.owners===owners&&state.img===img&&state.items.length===owners.length&&state.items.every((p,i)=>p===owners[i])&&state.source&&source&&state.source.every((v,i)=>v===source[i])){if(state.valid&&sameInput(state.input,owners))return state;const key=snapshot(owners);if(!state.valid&&key!==null&&state.key===key&&sameInput(state.input,owners))return state;}state={owners,img,items:owners.slice(),source,input:inputIdentity(owners),key:snapshot(owners),prior:owners.filter(p=>!marked(p)),valid:false,child:null,display:null};reader._articulatedRimState=state;if(!state.input||owners.length!==1||!img||!source||!sourceReady(img)||!validPanel(owners[0]))return state;const child=owners[0],v=child._structuralGridProof,captured=readerSourceRaster(img,v.analysisWidth,v.analysisHeight,owners),a=captured?.analysis,issued=captured?.issued===true;state.input=inputIdentity(owners);if(!state.input||!captured)return state;state.canonical=privateEvidence(child);if(!issued&&(!a||!sourceReplay(state.canonical,a,v.analysisWidth,v.analysisHeight))||!sameInput(state.input,owners)||!captured.stable())return state;state.child=child;state.display=immutableInput(child)?child._contours:state.canonical._contours;if(reader.currentPanels!==owners||!equalContext(state,reader))return state;state.valid=true;return state;}
  r.displayPanelContours=function(p,c=this.panelContours(p)){const pinned=readerScopeGuard.display(this,'_articulatedRimState',p);if(pinned)return pinned.display;const state=context(this);if(marked(p))return state?.valid&&state.child===p?state.display:null;return state?readerScopeGuard.under(this,state.prior,()=>old.call(this,p,c)):old.call(this,p,c);};
  if(typeof find==='function')r.findPanelAt=function(x,y){const state=context(this);if(!state){const hit=find.call(this,x,y);return marked(hit)?null:hit;}if(!this.panelZoomEnabled)return null;if(state.valid)return this.pointInContours(state.display,x,y)?state.child:null;return readerScopeGuard.under(this,state.prior,()=>{const hit=find.call(this,x,y);return marked(hit)?null:hit;});};
  if(typeof zoom==='function')r.zoomToPanel=function(p,...args){const pinned=readerScopeGuard.display(this,'_articulatedRimState',p);if(pinned&&!pinned.display.length)return;const state=context(this);if(marked(p)){if(!state?.valid||state.child!==p)return;return readerScopeGuard.run(this,'_articulatedRimState',state,()=>zoom.call(this,p,...args));}if(!state)return zoom.call(this,p,...args);return readerScopeGuard.under(this,state.prior,()=>zoom.call(this,p,...args));};r._articulatedRimReader=true;
 }
 function install(d){if(!PanelStructuralGrid._articulatedRim){const old=PanelStructuralGrid.validPanel;PanelStructuralGrid.validPanel=p=>p?._structuralGridProof?.version===VERSION?validPanel(p):old(p);PanelStructuralGrid._articulatedRim=true;}if(typeof PanelGeometry!=='undefined'&&!PanelGeometry._articulatedRim){const old=PanelGeometry.refine;PanelGeometry.refine=async function(url,p,log){return validPanel(p)?{...p}:old.call(this,url,p,log);};PanelGeometry._articulatedRim=true;}if(typeof PanelEdgeSpill!=='undefined'&&!PanelEdgeSpill._articulatedRim){for(const name of ['analyzeImage','analyzeRGBA']){const old=PanelEdgeSpill[name];if(typeof old==='function')PanelEdgeSpill[name]=function(...args){return validPanel(args[name==='analyzeImage'?1:3])?null:old.apply(this,args);};}PanelEdgeSpill._articulatedRim=true;}if(!d||d._articulatedRim)return;const old=d.detect;d.detect=async function(url,log){const prior=await old.call(this,url,log);if(!eligible(prior))return prior;try{const img=new Image();img.src=url;await img.decode();const out=issuedReplaceImage(img,prior);return out.length?out:prior;}catch(e){log?.('articulated rim deferred: '+e.message);return prior;}};d._articulatedRim=true;}
 return{VERSION,eligible,validPanel,analyzeRGBA,sourceReplay,replaceImage,install,installReader,fields,palette,candidates,path,measure,pathMask,support,separators,separatorsValid,speech,guide,sourceState,sourceReady,readerScopeGuard};
})();
if(typeof PanelDetect!=='undefined')PanelArticulatedRimCell.install(PanelDetect);
if(typeof module!=='undefined')module.exports=PanelArticulatedRimCell;
