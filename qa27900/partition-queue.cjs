'use strict';
const assert=require('node:assert/strict');
const det=require('../js/panels-partition');

// Independently drawn seven-panel page. The dark band adjoining the upper
// separator represents artwork touching ink, not a new separator or inset.
function fixture({artworkBand=false,partialDivider=false,thinGray=false,inset=false}={}){
  const w=420,h=700,data=new Uint8Array(w*h*4);
  const put=(x,y,v)=>{const i=(y*w+x)*4;data[i]=data[i+1]=data[i+2]=Math.round(v);data[i+3]=255;};
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)put(x,y,x<20||x>400||y<20||y>680?250:155);
  const line=(x1,y1,x2,y2,width=5,value=5)=>{
    for(let y=Math.max(0,y1-Math.floor(width/2));y<=Math.min(h-1,y2+Math.floor(width/2));y++)
      for(let x=Math.max(0,x1-Math.floor(width/2));x<=Math.min(w-1,x2+Math.floor(width/2));x++)put(x,y,value);
  };
  if(artworkBand)for(let y=204;y<218;y++)for(let x=23;x<398;x++)put(x,y,45);
  for(const s of [[20,20,400,20],[20,680,400,680],[20,20,20,680],[400,20,400,680],
    [20,220,400,220],[20,460,400,460],[250,20,250,220],[270,220,270,460],
    [140,460,140,680],[290,460,290,680]])line(...s);
  if(partialDivider){
    // A real interrupted divider with varying printed ink must keep this leaf
    // unresolved even though a uniform-darkness classifier would ignore it.
    for(let x=20;x<=250;x++)if(x<95||x>145)put(x,105,Math.floor(x/6)%2?40:5);
  }
  if(thinGray)for(let x=20;x<=250;x++)if(x<95||x>145)put(x,105,40+18*Math.sin(x*.6));
  if(inset)for(const s of [[45,45,165,45],[45,145,165,145],[45,45,45,145],[165,45,165,145]])line(...s);
  return {data,w,h};
}
const contains=(p,x,y)=>x>p.x&&x<p.x+p.w&&y>p.y&&y<p.y+p.h;
function run(f,partial=false){return det.analyzeRGBA(f.data,f.w,f.h,null,{allowPartial:partial});}
for(const artworkBand of [false,true]){
  const f=fixture({artworkBand}),ps=run(f);
  assert.equal(ps.length,7,'seven independent panels survive adjacent dark artwork');
  const targets=[[.32,.17],[.77,.17],[.34,.49],[.8,.49],[.19,.81],[.51,.81],[.83,.81]];
  for(const [x,y]of targets)assert.equal(ps.filter(p=>contains(p,x,y)).length,1,'each drawn frame has exactly one owner');
  assert.equal(new Set(targets.map(([x,y])=>ps.findIndex(p=>contains(p,x,y)))).size,7,'no neighboring frames share a merged owner');
}
for(const option of ['partialDivider','thinGray']){
  const f=fixture({[option]:true});
  assert.equal(run(f).length,0,'default mode abstains on an uncertain printed divider');
  const ps=run(f,true);
  assert(ps.length>0,'safe siblings remain available only when completion is requested');
  assert.equal(ps.filter(p=>contains(p,.3,.17)).length,0,'uncertain parent cannot silently become a merged frame');
  assert(ps.every(p=>p._partitionProof.complete===false&&p._partitionProof.unresolvedLeafCount>=1));
  assert(ps.every(p=>p._partitionProof.unresolvedRegions.length===p._partitionProof.unresolvedLeafCount));
}
for(const partial of [false,true])assert.equal(run(fixture({inset:true}),partial).length,0,'nested frame veto remains global in both modes');
console.log('partition queue: dark-adjacent ink fits, distinct leaves, noisy thin interrupted dividers and partial-map abstention passed');

// An existing identity may choose a different centerline through the same
// printed ink. Only its full shared edge can anchor a neighboring leaf.
{
  const f=fixture(),original=run(f),middle=original.find(p=>contains(p,.51,.81)),right=original.find(p=>contains(p,.83,.81));
  const anchor=JSON.parse(JSON.stringify(middle));anchor._quad[1].x+=.8/f.w;anchor._quad[2].x+=.8/f.w;
  const ps=det.analyzeRGBA(f.data,f.w,f.h,null,{allowPartial:true,anchors:[anchor]});
  assert.equal(ps.length,7,'shared printed rail is reconciled without losing valid siblings');
  const kept=ps.find(p=>contains(p,.51,.81)),neighbor=ps.find(p=>contains(p,.83,.81));
  kept._quad.forEach((p,k)=>assert(Math.hypot((p.x-anchor._quad[k].x)*f.w,(p.y-anchor._quad[k].y)*f.h)<1e-8,'matched leaf uses existing anchor corners'));
  for(const [a,b]of [[neighbor._quad[0],anchor._quad[1]],[neighbor._quad[3],anchor._quad[2]]])assert(Math.hypot((a.x-b.x)*f.w,(a.y-b.y)*f.h)<1e-8,'full shared edge uses one common centerline');
  assert.equal(neighbor._quad[1].x,right._quad[1].x,'unshared outer edge stays on its original rail');
  const far=JSON.parse(JSON.stringify(anchor));far._quad[1].x+=4/f.w;far._quad[2].x+=4/f.w;
  assert.equal(det.analyzeRGBA(f.data,f.w,f.h,null,{allowPartial:true,anchors:[far]}).length,0,'unmatched anchor cannot authorize edge movement');
  assert.equal(det.analyzeRGBA(f.data,f.w,f.h,null,{allowPartial:true,anchors:[anchor,anchor]}).length,0,'multiple anchors cannot claim the same leaf');
  const thin=fixture();for(let y=463;y<678;y++)for(let x=287;x<=294;x++){const i=(y*thin.w+x)*4,v=x>=289&&x<=291?5:155;thin.data[i]=thin.data[i+1]=thin.data[i+2]=v;}
  const narrow=run(thin),narrowMiddle=narrow.find(p=>contains(p,.51,.81));assert(narrowMiddle,'narrow printed separator is initially proved');
  const offInk=JSON.parse(JSON.stringify(narrowMiddle));offInk._quad[1].x+=2.8/thin.w;offInk._quad[2].x+=2.8/thin.w;
  assert.equal(det.analyzeRGBA(thin.data,thin.w,thin.h,null,{allowPartial:true,anchors:[offInk]}).length,0,'nearby anchor still requires complete dark-rail and corner proof');
}
console.log('partition queue: full shared-edge anchors, unchanged unrelated rails, distance bounds, duplicate anchors and off-ink rejection passed');
