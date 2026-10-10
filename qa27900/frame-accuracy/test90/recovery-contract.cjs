'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const root=path.resolve(__dirname,'../../..'),scripts=[...fs.readFileSync(root+'/index.html','utf8').matchAll(/src="(js\/(?!terminal-native-bootstrap\.js)(?:panels|terminal)[^\"]*\.js)"/g)].map(m=>m[1]);
const api=new Function('document','Image','window',scripts.map(p=>fs.readFileSync(root+'/'+p,'utf8')).join('\n')+'\nreturn{PanelStructuralGrid,PanelLetteringCells,PanelConnectedPairs,PanelLocalBoundaryConsensus};')({},class{},{});
const fixtures=JSON.parse(zlib.gunzipSync(Buffer.from(fs.readFileSync(__dirname+'/geometry.json.gz.b64','utf8'),'base64'))),E=api.PanelLocalBoundaryConsensus.pixelEvidence,L=api.PanelLetteringCells,G=api.PanelConnectedPairs;
const clone=p=>JSON.parse(JSON.stringify(p));let mutations=0;
for(const p of fixtures){
 const D=p._structuralGridProof.version===42?L:G;assert(D.validPanel(p));assert(api.PanelStructuralGrid.validPanel(p));
 for(const mutate of [p=>p.x+=.001,p=>p._quad=[],p=>p._contours[0][0].x+=.002,p=>p._structuralGridProof.version=999,p=>p._structuralGridProof.originalOwnerOverlap=1,p=>p._structuralGridProof.content.colored=0,p=>p._structuralGridProof.enclosedInset=true,p=>p._geometryType='unknown',p=>p._structuralGridProof.internalDivider=!p._structuralGridProof.internalDivider]){
  const q=clone(p);mutate(q);assert(!D.validPanel(q));mutations++;
 }
 if(D===L)for(const mutate of [v=>v.weakGapRuns=[],v=>v.weakGapRuns[0].longestGap=v.weakGapRuns[0].span,v=>v.weakGapRuns[0].span++,v=>v.originalDivider=false,v=>v.first._structuralGridProof.seedRadius=8]){
  const q=clone(p);mutate(q._structuralGridProof);assert(!D.validPanel(q));mutations++;
 }
 else for(const mutate of [v=>v.frameGroup.count=3,v=>v.frameGroup.leafPixels[0]++,v=>v.frameGroup.leafDivider[0]=true,v=>v.frameGroup.leafContent[0].colored=0,v=>v.frameGroup.flanks=0,v=>v.frameGroup.first=v.frameGroup.span,v=>v.frameGroup.cluster=[0,900],v=>v.peerGroup.axis=1-v.frameGroup.axis,v=>v.peerBoundary.sides[0].samples++]){
  const q=clone(p);mutate(q._structuralGridProof);assert(!D.validPanel(q));mutations++;
 }
}
// Independent raster negatives: aggregate specks differ from a true paper
// corridor, while a full black divider continues to veto a cell.
const w=400,h=600,mask=new Uint8Array(w*h),rgba=new Uint8ClampedArray(w*h*4),blank=new Uint8Array(w*h);
for(let y=100;y<500;y++)for(let x=60;x<340;x++)mask[y*w+x]=1;
for(let i=0;i<w*h;i++)rgba.set([180,125,90,255],4*i);
function paperAt(ys){const P={white:blank.slice(),exterior:blank.slice(),near:blank.slice(),nearExterior:blank.slice()};for(const y of ys)P.white[y*w+200]=P.exterior[y*w+200]=1;return P;}
const specks=Array.from({length:100},(_,i)=>110+3*i),P=paperAt(specks),gaps=[];
assert(E.internalDivider(mask,rgba,P,w,h));assert(!L.coherentDivider(mask,rgba,P,w,h,null,gaps));assert(gaps.length);
const continuous=paperAt(Array.from({length:360},(_,i)=>120+i));assert(L.coherentDivider(mask,rgba,continuous,w,h));
for(let y=100;y<500;y++)for(let x=199;x<=201;x++)rgba.set([0,0,0,255],4*(y*w+x));assert(L.coherentDivider(mask,rgba,{white:blank,exterior:blank,near:blank,nearExterior:blank},w,h));
// A foreground bridge can join two intact colored frames. A second
// coherent gutter cluster is a three-frame arrangement and must abstain.
function pairRaster(third=false){
 const m=new Uint8Array(w*h),a=new Uint8ClampedArray(w*h*4),P={white:blank.slice(),exterior:blank.slice(),near:blank.slice(),nearExterior:blank.slice()};
 for(let y=100;y<500;y++)for(let x=40;x<360;x++){
  const i=y*w+x;m[i]=1;
  const bin=(x+17*y)%50;a.set([80+(bin%5)*25,70+(Math.floor(bin/5)%5)*29,110+(Math.floor(bin/25)%2)*90,255],4*i);
  if((Math.abs(x-150)<=2||third&&Math.abs(x-250)<=2)&&(y<265||y>330)){P.white[i]=P.exterior[i]=1;a.set([255,255,255,255],4*i);}
 }
 return{m,a,P};
}
let r=pairRaster(),pair=G.pairEvidence(r.m,r.a,r.P,w,h);assert(pair&&pair.count===2);
r=pairRaster(true);assert.equal(G.pairEvidence(r.m,r.a,r.P,w,h),null);
for(const D of [L,G]){
 assert.deepEqual(D.analyzeRGBA(new Uint8ClampedArray(10),w,h),[]);
 assert.deepEqual(D.analyzeRGBA(new Uint8ClampedArray(w*h*4),w,h),[]);
 assert.deepEqual(D.analyzeRGBA(rgba,w,h,[{x:NaN,y:0,w:1,h:1}]),[]);
}
console.log(JSON.stringify({passed:true,capturedProofs:fixtures.length,proofMutationsRejected:mutations,discontinuousGapNegative:true,continuousDividerNegative:true,syntheticPair:true,threeFrameGroupRejected:true}));
