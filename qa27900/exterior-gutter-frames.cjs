'use strict';
// Synthetic artwork only: no comic pages are stored in this repository.
const assert = require('node:assert/strict');
const gutter = require('../js/panels-gutter-frames');
global.PanelGutterFrames = gutter;
const closed = require('../js/panels-closed-frames');
function fixture({gap=false, divider=false, interrupted=false, inset=false, pair=false, flat=false, gray=145}={}) {
  const w=400,h=500,data=new Uint8Array(w*h*4);
  function fill(x,y,r,b,color) {
    for(let yy=y;yy<=b;yy++)for(let xx=x;xx<=r;xx++) {
      const i=(yy*w+xx)*4;data[i]=data[i+1]=data[i+2]=color;data[i+3]=255;
    }
  }
  function frame(x,y,r,b) {
    fill(x,y,r,b,8);fill(x+3,y+3,r-3,b-3,190);
    // Attached dark artwork prevents a two-sided brightness ridge.
    fill(x+3,y+3,r-3,y+48,8);
  }
  fill(0,0,w-1,h-1,gray);
  if(!flat)frame(25,30,pair?190:370,310);
  if(pair)frame(210,30,375,310);
  if(gap)fill(360,130,379,165,gray);
  if(divider){fill(25,170,370,172,8);if(interrupted)fill(160,169,220,173,190);}
  if(inset)frame(240,130,325,230);
  return {data,w,h};
}
const run=o=>{const f=fixture(o);return closed.analyzeRGBA(f.data,f.w,f.h);};
const owns=(p,x,y)=>p.x<x&&p.y<y&&p.x+p.w>x&&p.y+p.h>y;
const positive=run({});
assert.equal(positive.length,1);
assert.ok(positive[0]._closedFrameProof.gutterProof,'externally connected gutters recover a dark attached border');
for(const [x,y] of [[.5,.34],[.1,.34],[.88,.34],[.5,.11],[.5,.58]])assert.ok(owns(positive[0],x,y));
assert.deepEqual(run({}),positive,'proposals are deterministic');
assert.equal(run({gap:true}).length,0,'a missing rail cannot be invented from the gutter');
assert.equal(run({flat:true}).length,0,'a quiet gray field is not a panel');
for(const interrupted of [false,true])assert.ok(!run({divider:true,interrupted}).some(p=>owns(p,.5,.2)&&owns(p,.5,.5)),'complete and interrupted dividers veto the enclosing crop');
assert.ok(!run({inset:true}).some(p=>p.w>.8),'an inset blocks ownership of its enclosing rectangle');
const pair=run({pair:true});
assert.equal(pair.length,2,'separated neighboring panels have independent owners');
assert.ok(!pair.some(p=>owns(p,.2,.3)&&owns(p,.8,.3)),'an exterior gutter prevents the neighboring union');
for(const gray of [0,255]){const f=fixture({gray});assert.equal(gutter.proposeRGBA(f.data,f.w,f.h).length,0,'black/white margins do not use the quiet colored-gutter proposal');}
assert.equal(gutter.proposeRGBA(new Uint8Array(3),400,500).length,0);
console.log('exterior gutters: connected dark frames, five-position ownership, neighbor separation, missing sides, dividers and inset vetoes passed');
// Existing controls must also hold while the optional proposer is loaded.
require('./closed-frames.cjs');
require('./neighbor-frames.cjs');
