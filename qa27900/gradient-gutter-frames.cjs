'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
global.PanelGutterFrames=require('../js/panels-gutter-frames');
const closed=require('../js/panels-closed-frames');
function fixture({gap=false,edgeGap=0,divider=false,interrupted=false,inset=false,partialInset=false,flat=false,mixed=false}={}){
 const w=400,h=500,data=new Uint8Array(w*h*4);
 const background=(x,y)=>{const light=Math.round(25*Math.sin(y/h*Math.PI)+8*x/w);return [75+light,105+light,107+light];};
 function fill(x,y,r,b,color){for(let yy=y;yy<=b;yy++)for(let xx=x;xx<=r;xx++){const c=color||background(xx,yy),i=(yy*w+xx)*4;for(let k=0;k<3;k++)data[i+k]=c[k];data[i+3]=255;}}
 function frame(x,y,r,b){fill(x,y,r,b,[8,8,8]);fill(x+3,y+3,r-3,b-3,[190,170,140]);}
 fill(0,0,w-1,h-1);
 if(!flat){frame(25,30,370,310);fill(28,33,367,75,[8,8,8]);}
 if(gap)fill(360,130,379,165);
 // Interrupt only the exterior quiet-color evidence; keep the printed ink.
 // This models a browser-resampled fringe, not a missing border.
 if(edgeGap)fill(20,130,24,129+edgeGap,[160,100,100]);
 if(divider){fill(25,170,370,173,[8,8,8]);if(interrupted)fill(160,169,220,174,[190,170,140]);}
 if(inset){frame(235,130,325,235);if(partialInset)fill(233,165,239,195,[190,170,140]);}
 if(mixed)fill(0,0,12,h-1,[180,45,140]);
 return {data,w,h};
}
const run=o=>{const f=fixture(o);return closed.analyzeRGBA(f.data,f.w,f.h,null,{gradientOnly:true});};
const owns=(p,x,y)=>p.x<x&&p.y<y&&p.x+p.w>x&&p.y+p.h>y;
const positive=run({});assert.equal(positive.length,1);
assert.equal(run({edgeGap:4}).length,1,'short gutter interruption retains the complete ink-bounded frame');
assert.equal(run({edgeGap:9}).length,0,'long disconnected gutter segments do not join');
assert.equal(positive[0]._closedFrameProof.gutterProof.method,'exterior-gradient-gutter');
for(const [x,y]of [[.5,.34],[.1,.34],[.88,.34],[.5,.11],[.5,.58]])assert(owns(positive[0],x,y));
for(const opts of [{gap:true},{flat:true},{mixed:true}])assert.equal(run(opts).length,0,'broken/absent borders and incoherent exterior abstain');
for(const interrupted of [false,true])assert(!run({divider:true,interrupted}).some(p=>owns(p,.5,.2)&&owns(p,.5,.5)),'full or interrupted separator vetoes parent');
for(const partialInset of [false,true])assert(!run({inset:true,partialInset}).some(p=>p.w>.8),'full or partial inset never becomes part of the enclosing crop');
const scope={console,window:{}};vm.createContext(scope);vm.runInContext(fs.readFileSync(require.resolve('../js/panels.js'),'utf8'),scope);const detect=scope.window.PanelDetect;
const parent={x:0,y:0,w:1,h:.9},outside={x:0,y:.92,w:1,h:.07},baseline=[parent,outside];
const result=detect._refineComposites(baseline,positive);
assert.equal(result.length,3);assert.equal(result[1],parent);assert.equal(result[2],outside);
assert.equal(detect._refineComposites(baseline,[]),baseline);
const bad=JSON.parse(JSON.stringify(positive[0]));bad._closedFrameProof.gutterProof.exteriorSupport[1]=.7;
assert.equal(detect._refineComposites(baseline,[bad]),baseline,'three gutter sides cannot refine a legacy region');
assert.equal(detect._refineComposites([{...parent,_identitySource:'page-partition'}],positive).length,1,'proved identity is never refined');
assert.equal(detect._refineComposites([parent,{x:.5,y:.2,w:.2,h:.2}],positive).length,2,'candidate overlapping a different identity is rejected');
console.log('gradient gutter: five interior positions, missing sides, palette mismatch, full/partial dividers and insets; legacy priority and overlap gates passed');
