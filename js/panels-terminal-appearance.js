/* Fixed source-context-seeded appearance separation of terminal173 groups.
 * Final-miss experimental refiner; no tap-dependent geometry or new source artwork.
 * Fail closed to the unchanged173 group when seeds, resources or topology fail.
 * Semantic ownership is not certified. Disconnected unseeded captions can be lost.
 */
const PanelTerminalAppearance = (() => {
  'use strict';
  const VERSION=174, METHOD='source-context-seeded-terminal-appearance';
  const RULES=Object.freeze({maxPixels:24000000,maxDimension:6000,maxRuns:200000,
    analysisMaxSide:900,maxGraphNodes:300000,maxFlowSteps:200000000,maxFlowMillis:5000,
    minArea:.025,maxArea:.35,disconnectedCaptionRisk:true});
  const issued=new WeakMap(),states=new WeakMap(),lifecycle=new WeakMap();
  function freeze(o){if(o&&typeof o==='object'&&!Object.isFrozen(o)){Object.values(o).forEach(freeze);Object.freeze(o);}return o;}
  function signature(a,w,h){let x=2166136261,y=0x9e3779b9;for(let i=0;i<a.length;i++){x=Math.imul(x^a[i],16777619);y=Math.imul(y+a[i]+i,0x85ebca6b);}return[w,h,x>>>0,y>>>0].join(':');}
  // Reserved version claims fail closed even when method/type is malformed.
  const isClaim=p=>!!p&&(p._structuralGridProof?.version===VERSION||p._structuralGridProof?.method===METHOD||p._geometryType==='terminal-appearance');
  const validPanel=p=>!!(isClaim(p)&&p._structuralGridProof?.version===VERSION&&p._structuralGridProof.method===METHOD&&p._geometryType==='terminal-appearance'&&issued.has(p)&&Object.isFrozen(p));
'use strict';
// Deterministic bounded graph-cut primitives. No image identities or seed coordinates.
function resizePillowRGB(a,W,H,w,h){
 function coeff(input,output){const scale=input/output,filter=Math.max(1,scale),all=[];for(let u=0;u<output;u++){const center=(u+.5)*scale;let lo=Math.max(0,Math.trunc(center-filter+.5)),hi=Math.min(input,Math.trunc(center+filter+.5)),sum=0,cs=[];for(let i=lo;i<hi;i++){const c=Math.max(0,1-Math.abs((i-center+.5)/filter));sum+=c;cs.push(c);}all.push({lo,cs:cs.map(c=>Math.trunc(c/sum*4194304+.5))});}return all;}
 const cx=coeff(W,w),cy=coeff(H,h),mid=new Uint8Array(w*H*3),out=new Uint8Array(w*h*3);
 for(let y=0;y<H;y++)for(let x=0;x<w;x++)for(let c=0;c<3;c++){let v=2097152;const q=cx[x];for(let k=0;k<q.cs.length;k++)v+=a[4*(y*W+q.lo+k)+c]*q.cs[k];mid[3*(y*w+x)+c]=Math.max(0,Math.min(255,Math.floor(v/4194304)));}
 for(let y=0;y<h;y++)for(let x=0;x<w;x++)for(let c=0;c<3;c++){let v=2097152;const q=cy[y];for(let k=0;k<q.cs.length;k++)v+=mid[3*((q.lo+k)*w+x)+c]*q.cs[k];out[3*(y*w+x)+c]=Math.max(0,Math.min(255,Math.floor(v/4194304)));}return out;
}
function nearest(mask,W,H,w,h){const out=new Uint8Array(w*h),sx=W/w,sy=H/h;let fy=sy*.5;for(let y=0;y<h;y++,fy+=sy){const yy=Math.min(H-1,Math.floor(fy));let fx=sx*.5;for(let x=0;x<w;x++,fx+=sx)out[y*w+x]=mask[yy*W+Math.min(W-1,Math.floor(fx))];}return out;}
class CutGraph{
 constructor(n,maxEdges){this.n=n;this.head=new Int32Array(n);this.head.fill(-1);this.to=new Int32Array(maxEdges);this.next=new Int32Array(maxEdges);this.cap=new Int32Array(maxEdges);this.edges=0;}
 add(u,v,c,reverse=0){if(this.edges+2>this.to.length||!Number.isInteger(c)||c<0||c>2147483647)throw Error('Graph capacity/budget');let e=this.edges;this.to[e]=v;this.cap[e]=c;this.next[e]=this.head[u];this.head[u]=e;this.to[e+1]=u;this.cap[e+1]=reverse;this.next[e+1]=this.head[v];this.head[v]=e+1;this.edges+=2;}
 flow(s,t){const n=this.n,level=new Int32Array(n),queue=new Int32Array(n),cur=new Int32Array(n),nodes=new Int32Array(n),path=new Int32Array(n),bottleneck=new Int32Array(n);let flow=0,rounds=0,steps=0;const started=Date.now();const tick=()=>{if(++steps>RULES.maxFlowSteps)throw Error('Flow operation budget');if((steps&65535)===0&&Date.now()-started>RULES.maxFlowMillis)throw Error('Flow kernel time budget');};
  for(;;){if(++rounds>n)throw Error('Flow round budget');level.fill(-1);level[s]=0;let qh=0,qt=1;queue[0]=s;while(qh<qt){const v=queue[qh++];tick();for(let e=this.head[v];e>=0;e=this.next[e]){tick();if(this.cap[e]>0&&level[this.to[e]]<0){level[this.to[e]]=level[v]+1;queue[qt++]=this.to[e];}}}if(level[t]<0)break;cur.set(this.head);let depth=0;nodes[0]=s;bottleneck[0]=2147483647;
   while(depth>=0){tick();const v=nodes[depth];if(v===t){const f=bottleneck[depth];flow+=f;let back=depth;for(let j=0;j<depth;j++){tick();const e=path[j];this.cap[e]-=f;this.cap[e^1]+=f;if(this.cap[e]===0)back=Math.min(back,j);}depth=back;bottleneck[0]=2147483647;for(let j=1;j<=depth;j++){tick();bottleneck[j]=Math.min(bottleneck[j-1],this.cap[path[j-1]]);}continue;}
    let e=cur[v];while(e>=0&&(this.cap[e]<=0||level[this.to[e]]!==level[v]+1)){tick();e=this.next[e];}cur[v]=e;if(e<0){level[v]=-1;depth--;if(depth>=0)cur[nodes[depth]]=this.next[path[depth]];continue;}path[depth]=e;nodes[depth+1]=this.to[e];bottleneck[depth+1]=Math.min(bottleneck[depth],this.cap[e]);depth++;
   }
  }
  const reach=new Uint8Array(n);let qh=0,qt=1;queue[0]=s;reach[s]=1;while(qh<qt){const v=queue[qh++];tick();for(let e=this.head[v];e>=0;e=this.next[e]){tick();if(this.cap[e]>0&&!reach[this.to[e]]){reach[this.to[e]]=1;queue[qt++]=this.to[e];}}}return{flow,reach,rounds,steps};
 }
}
function segment(rgb,mask,w,h,separatorY){
 const n=w*h,ps=new Uint8Array(n),ss=new Uint8Array(n),bins=new Uint16Array(n),ids=new Int32Array(n);ids.fill(-1);let N=0,pc=0,sc=0;const hp=new Float64Array(512),hs=new Float64Array(512);hp.fill(1);hs.fill(1);
 for(let y=0;y<h;y++){let lo=w,hi=-1;for(let x=0;x<w;x++)if(mask[y*w+x]&&y>separatorY){lo=Math.min(lo,x);hi=x;}
  for(let x=0;x<w;x++){const i=y*w+x,j=3*i;bins[i]=(rgb[j]>>5)*64+(rgb[j+1]>>5)*8+(rgb[j+2]>>5);if(!mask[i])continue;ids[i]=N++;const nonpaper=Math.min(rgb[j],rgb[j+1],rgb[j+2])<235;if(!nonpaper)continue;
   let eroded=y<separatorY,inside=true;for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++){const xx=x+dx,yy=y+dy,ok=xx>=0&&xx<w&&yy>=0&&yy<h&&mask[yy*w+xx];if(dx*dx+dy*dy<=9&&!ok)inside=false;if(Math.abs(dx)+Math.abs(dy)<=3&&(!ok||yy>=separatorY))eroded=false;}
   if(eroded){ps[i]=1;pc++;hp[bins[i]]++;}if(y>separatorY&&x>=lo+.65*(hi-lo)&&inside){ss[i]=1;sc++;hs[bins[i]]++;}
  }
 }
 if(N>RULES.maxGraphNodes||pc<100||sc<100)throw Error('Insufficient or excessive source seed domain');for(let k=0;k<512;k++){hp[k]/=pc+512;hs[k]/=sc+512;}
 let sum=0,pairs=0;for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x;if(!mask[i])continue;for(const k of[x+1<w?i+1:-1,y+1<h?i+w:-1])if(k>=0&&mask[k]){let d=0;for(let c=0;c<3;c++)d+=((rgb[3*i+c]-rgb[3*k+c])/255)**2;sum+=d;pairs++;}}
 const beta=1/Math.max(1e-8,2*sum/pairs),g=new CutGraph(N+2,4*N+2*pairs),S=N,T=N+1,bankers=x=>{const f=Math.floor(x),r=x-f;return r===.5?(f%2?f+1:f):Math.round(x);};
 for(let i=0;i<n;i++)if(mask[i]){g.add(S,ids[i],ps[i]?100000000:bankers(-Math.log(hs[bins[i]])*100));g.add(ids[i],T,ss[i]?100000000:bankers(-Math.log(hp[bins[i]])*100));}
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x;if(!mask[i])continue;for(const k of[x+1<w?i+1:-1,y+1<h?i+w:-1])if(k>=0&&mask[k]){let d=0;for(let c=0;c<3;c++)d+=((rgb[3*i+c]-rgb[3*k+c])/255)**2;const c=bankers(100*(20*Math.exp(-beta*d)+1));g.add(ids[i],ids[k],c,c);}}
 const result=g.flow(S,T),story=new Uint8Array(n);for(let i=0;i<n;i++)if(mask[i]&&!result.reach[ids[i]])story[i]=1;for(let i=0;i<n;i++)if((ps[i]&&story[i])||(ss[i]&&!story[i]))throw Error('Hard seed violation');return{story,storySeeds:ss,paratextSeeds:ps,evidence:{nodes:N,neighborPairs:pairs,edges:g.edges,paratextSeeds:pc,storySeeds:sc,beta,flow:result.flow,rounds:result.rounds,steps:result.steps}};
}
function seedConnected(story,seeds,W,H){const n=W*H,keep=new Uint8Array(n),queue=new Int32Array(n);let head=0,tail=0;for(let i=0;i<n;i++)if(story[i]&&seeds[i]){keep[i]=1;queue[tail++]=i;}while(head<tail){const i=queue[head++],x=i%W;for(const j of[x>0?i-1:-1,x+1<W?i+1:-1,i-W,i+W])if(j>=0&&j<n&&story[j]&&!keep[j]){keep[j]=1;queue[tail++]=j;}}return keep;}
  function maskFromPanel(p,w,h){const rows=Array.from({length:h},()=>[]);for(const r of p._contours){for(let i=0;i<r.length;i++){const q=r[i],z=r[(i+1)%r.length],x0=Math.round(q.x*w),y0=Math.round(q.y*h),x1=Math.round(z.x*w),y1=Math.round(z.y*h);if(y0===y1)continue;const lo=Math.max(0,Math.ceil(Math.min(y0,y1)-.5)),hi=Math.min(h-1,Math.floor(Math.max(y0,y1)-.5));for(let y=lo;y<=hi;y++)rows[y].push(x0+(x1-x0)*(y+.5-y0)/(y1-y0));}}
    const m=new Uint8Array(w*h);for(let y=0;y<h;y++){const xs=rows[y].sort((a,b)=>a-b);if(xs.length%2)return null;for(let k=0;k<xs.length;k+=2){const lo=Math.max(0,Math.ceil(xs[k]-.5)),hi=Math.min(w,Math.ceil(xs[k+1]-.5));m.fill(1,y*w+lo,y*w+hi);}}return m;}
  function traceMask(mask,w,h){const next=new Map();let x0=w,y0=h,x1=0,y1=0,area=0;function add(x,y,u,v){const k=y*(w+1)+x;if(next.has(k))return false;next.set(k,v*(w+1)+u);return true;}
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x;if(!mask[i])continue;area++;x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x+1);y1=Math.max(y1,y+1);if((y===0||!mask[i-w])&&!add(x,y,x+1,y))return null;if((x===w-1||!mask[i+1])&&!add(x+1,y,x+1,y+1))return null;if((y===h-1||!mask[i+w])&&!add(x+1,y+1,x,y+1))return null;if((x===0||!mask[i-1])&&!add(x,y+1,x,y))return null;}
    if(!area||next.size>200000)return null;const unseen=new Set(next.keys()),polygons=[];while(unseen.size){if(polygons.length>=16)return null;const first=unseen.values().next().value,r=[];let k=first;do{if(!unseen.delete(k))return null;const y=Math.floor(k/(w+1));r.push([k-y*(w+1),y]);k=next.get(k);if(k===undefined)return null;}while(k!==first);polygons.push(r);}return{polygons,box:[x0,y0,x1,y1],area};}
  function sourceProposal(a,W,H){
    const R=RULES;if(!Number.isInteger(W)||!Number.isInteger(H)||W<150||H<150||W>R.maxDimension||H>R.maxDimension||W*H>R.maxPixels||a?.length!==W*H*4)return null;for(let i=3;i<a.length;i+=4)if(a[i]!==255)return null;
    try{const terminal=typeof PanelTerminalContext!=='undefined'?PanelTerminalContext:(typeof require==='function'?require('./panels-terminal-context.js'):null),landscape=typeof PanelSupportedLandscape!=='undefined'?PanelSupportedLandscape:(typeof require==='function'?require('./panels-supported-landscape.js'):null);
      const parents=terminal?.analyzeRGBA(a,W,H);if(parents?.length!==1)return null;const uppers=landscape?.analyzeRGBA(a,W,H);if(uppers?.length!==1)return null;const p=parents[0],group=maskFromPanel(p,W,H);if(!group)return null;
      const pts=uppers[0]._contours[0].map(q=>[Math.round(q.x*W),Math.round(q.y*H)]);let j=1;while(j<pts.length&&(pts[j][0]!==pts[j-1][0]||pts[j][1]!==pts[j-1][1]))j++;if(j>=pts.length)return null;const bottoms=[pts[j][1]];while(j+1<pts.length&&pts[j+1][0]===pts[j][0]+1){j++;bottoms.push(pts[j][1]);}if(bottoms.length<W*.6)return null;bottoms.sort((a,b)=>a-b);const median=bottoms.length%2?bottoms[bottoms.length>>1]:(bottoms[bottoms.length/2-1]+bottoms[bottoms.length/2])/2;
      const scale=Math.min(1,R.analysisMaxSide/Math.max(W,H)),roundEven=x=>{const f=Math.floor(x),r=x-f;return r===.5?(f%2?f+1:f):Math.round(x);},w=roundEven(W*scale),h=roundEven(H*scale),rgb=resizePillowRGB(a,W,H,w,h),small=nearest(group,W,H,w,h),cut=segment(rgb,small,w,h,median*scale);
      const lifted=nearest(cut.story,w,h,W,H),seeds=nearest(cut.storySeeds,w,h,W,H);let rawArea=0,seedCount=0;for(let i=0;i<lifted.length;i++){lifted[i]&=group[i];rawArea+=lifted[i];seedCount+=seeds[i];}const kept=seedConnected(lifted,seeds,W,H);for(let i=0;i<kept.length;i++)if(seeds[i]&&!kept[i])return null;
      const q=traceMask(kept,W,H);if(!q||q.area<W*H*R.minArea||q.area>W*H*R.maxArea)return null;
      return{polygons:q.polygons,box:q.box,evidence:{method:'fixed-RGB8-source-seeded-graphcut',parentVersion:173,analysisWidth:w,analysisHeight:h,sampler:'Pillow-antialiased-bilinear-22bit-and-incremental-nearest',costs:'add-one RGB8 histogram;100*(20exp(-beta*d)+1);hard100000000',cut:cut.evidence,retainedPixels:q.area,rawPixels:rawArea,cleanupRemoved:rawArea-q.area,allStorySeedsRetained:true,seedPixelsNative:seedCount,semanticOwnershipCertified:false,hiddenArtworkRestored:false,disconnectedUnseededCaptionRisk:true}};
    }catch(_){return null;}
  }
  function stateRGBA(a,w,h){const q=sourceProposal(a,w,h);const sig=signature(a,w,h);if(!q)return{signature:sig,w,h,panel:null};
    const[x0,y0,x1,y1]=q.box,proof=freeze({version:VERSION,method:METHOD,nativeWidth:w,nativeHeight:h,nativeSignature:sig,evidence:q.evidence});
    const p=freeze({x:x0/w,y:y0/h,w:(x1-x0)/w,h:(y1-y0)/h,_identitySource:'structural-grid-frame',_geometryOwner:'structural-grid-contours',_geometryType:'terminal-appearance',_contours:q.polygons.map(r=>r.map(([x,y])=>({x:x/w,y:y/h}))),_structuralGridProof:proof});issued.set(p,sig);return{signature:sig,w,h,panel:p};
  }
  function sourceState(img){if(!img)return null;let life=lifecycle.get(img);if(!life){life={failed:false,generation:0};lifecycle.set(img,life);if(img.addEventListener){img.addEventListener('load',()=>{life.failed=false;life.generation++;states.delete(img);});img.addEventListener('error',()=>{life.failed=true;life.generation++;states.delete(img);});}}
    if(img.complete===false||life.failed)return null;const w=('naturalWidth'in img)?img.naturalWidth:img.width,h=('naturalHeight'in img)?img.naturalHeight:img.height,src=img.currentSrc||img.src;
    if(!Number.isInteger(w)||!Number.isInteger(h)||w<150||h<150||w>RULES.maxDimension||h>RULES.maxDimension||w*h>RULES.maxPixels)return null;
    const old=states.get(img);if('naturalWidth'in img&&old&&old.src===src&&old.generation===life.generation&&old.w===w&&old.h===h)return old;
    let c;try{c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d',{willReadFrequently:true});if(!g)return null;g.drawImage(img,0,0);const s=stateRGBA(g.getImageData(0,0,w,h).data,w,h);s.src=src;s.generation=life.generation;states.set(img,s);return s;}catch(_){return null;}finally{if(c)c.width=c.height=1;}}
  function validateImage(p,img){if(!validPanel(p))return false;const s=sourceState(img);return!!(s&&issued.get(p)===s.signature&&p._structuralGridProof.nativeWidth===s.w&&p._structuralGridProof.nativeHeight===s.h);}
  function contains(p,x,y){if(!validPanel(p)||!Number.isFinite(x)||!Number.isFinite(y)||x<p.x||y<p.y||x>p.x+p.w||y>p.y+p.h)return false;let inside=false;for(const r of p._contours)for(let i=0,j=r.length-1;i<r.length;j=i++){const a=r[i],b=r[j];if((a.y>y)!==(b.y>y)&&x<(b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x)inside=!inside;}return inside;}
  function findMissCandidate(img,x,y){const s=sourceState(img);return s?.panel&&contains(s.panel,x,y)?s.panel:null;}
  function hasSourceCandidate(img){const s=sourceState(img);return!!(s?.panel&&validPanel(s.panel));}
  function panelContours(p,img){return validateImage(p,img)?p._contours:null;}
  function analyzeRGBA(a,w,h){if(!Number.isInteger(w)||!Number.isInteger(h)||w<150||h<150||w>RULES.maxDimension||h>RULES.maxDimension||w*h>RULES.maxPixels||a?.length!==w*h*4)return[];const s=stateRGBA(a,w,h);return s.panel?[s.panel]:[];}
  function validateRGBA(p,a,w,h){return validPanel(p)&&a?.length===w*h*4&&p._structuralGridProof.nativeWidth===w&&p._structuralGridProof.nativeHeight===h&&issued.get(p)===signature(a,w,h);}
  return{VERSION,RULES,isClaim,claims:isClaim,validPanel,validateImage,validateRGBA,analyzeRGBA,contains,findMissCandidate,hasSourceCandidate,panelContours};
})();
// Inert on load: explicit Reader final-miss admission owns integration.
if(typeof module!=='undefined')module.exports=PanelTerminalAppearance;
