'use strict';

// Raster fixtures exercise shared borders, filled artwork, interrupted dividers,
// and inset ownership without requiring a comic archive in CI.
const assert=require('node:assert/strict');
const detector=require('../js/panels-closed-frames');

function fixture({divider=false,broken=false,bottom=true,donor=true,inset=false}={}){
  const w=400,h=400,rgba=new Uint8Array(w*h*4);
  for(let i=0;i<w*h;i++){
    rgba[i*4]=rgba[i*4+1]=rgba[i*4+2]=210;
    rgba[i*4+3]=255;
  }
  function fill(x,y,r,b,color=0){
    for(let yy=y;yy<=b;yy++)for(let xx=x;xx<=r;xx++){
      const i=(yy*w+xx)*4;rgba[i]=rgba[i+1]=rgba[i+2]=color;
    }
  }
  function frame(x,y,r,b){
    fill(x,y,r,y+2);fill(x,b-2,r,b);fill(x,y,x+2,b);fill(r-2,y,r,b);
  }
  if(donor)frame(20,20,380,120);
  frame(20,120,150,380);
  // This dark artwork merges with the shared top rail, while the other three
  // frame sides remain independently distinguishable from the background.
  fill(20,120,150,179);
  if(!bottom)fill(20,375,150,382,210);
  if(divider){
    fill(20,250,150,252);
    if(broken)fill(65,247,90,255,210);
  }
  if(inset)frame(60,230,120,330);
  return detector.analyzeRGBA(rgba,w,h);
}
const shared=p=>!!p._closedFrameProof.sharedTopProof;
const contains=(p,x,y)=>x>p.x&&x<p.x+p.w&&y>p.y&&y<p.y+p.h;
const normal=fixture(),completed=normal.filter(shared);
assert.equal(normal.length,2);
assert.equal(completed.length,1,'filled artwork may use a proved adjacent border');
assert.deepEqual(normal[0]._quad,[
  {x:.0525,y:.0525},{x:.9475,y:.0525},
  {x:.9475,y:.2975},{x:.0525,y:.2975}
],'the independently proved neighbor keeps its exact geometry');
assert.deepEqual(completed[0]._closedFrameProof.sharedTopProof.neighborQuad,normal[0]._quad);
for(const [x,y]of [[.21,.6],[.08,.6],[.34,.6],[.21,.34],[.21,.91]]){
  assert.equal(normal.find(p=>contains(p,x,y)),completed[0],'all interior taps have one whole-frame owner');
}
assert.deepEqual(fixture(),normal,'page geometry is deterministic across repeated analysis');
assert.equal(fixture({donor:false}).filter(shared).length,0,'three sides cannot invent their missing neighbor');
assert.equal(fixture({bottom:false}).filter(shared).length,0,'sharing one border does not waive another missing side');
const divided=fixture({divider:true});
assert.ok(divided.some(p=>contains(p,.21,.5)));
assert.ok(divided.some(p=>contains(p,.21,.8)));
assert.ok(!divided.some(p=>contains(p,.21,.5)&&contains(p,.21,.8)),'a real divider prevents a merged crop');
assert.equal(fixture({divider:true,broken:true}).filter(shared).length,0,'an interrupted divider still vetoes a merged crop');
const inset=fixture({inset:true});
assert.ok(inset.some(p=>contains(p,.23,.7)),'the independently proved inset remains selectable');
assert.equal(inset.filter(shared).length,0,'a shared-border parent cannot claim an inset');
console.log('neighbor frames: positive five-position ownership and five rejection/partition scenarios passed');
