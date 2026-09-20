'use strict';
const assert=require('assert/strict'),det=require('../js/panels-partition');
// Independently drawn three-row page. Dark adjacent art masks roughly half
// the upper divider's contrast, while its own ink remains continuous.
function fixture(change){
 const w=420,h=700,data=new Uint8Array(w*h*4);
 function fill(x0,y0,x1,y1,v){for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const i=(y*w+x)*4;data[i]=data[i+1]=data[i+2]=typeof v==='function'?v(x,y):v;data[i+3]=255;}}
 fill(0,0,w-1,h-1,5);fill(20,20,400,680,(x,y)=>145+25*Math.sin(x*.04+y*.03));
 for(const y of [20,350,500,680])fill(18,y-2,402,y+2,5);
 fill(18,20,22,680,5);fill(398,20,402,680,5);
 for(let y=25;y<345;y+=40)fill(135,y,145,Math.min(347,y+21),5);fill(143,20,147,350,5);
 if(change==='broken')fill(140,100,150,140,150);
 if(change==='one-ended')fill(140,20,150,45,150);
 if(change==='variable')fill(143,22,147,347,(x,y)=>5+(y%20<10?20:0));
 if(change==='thin'){fill(143,22,147,347,140);fill(145,22,145,347,5);}
 if(change==='inset'){fill(45,70,125,72,5);fill(45,178,125,180,5);fill(45,70,47,180,5);fill(123,70,125,180,5);}
 if(change==='interrupted-inset'){fill(45,70,125,72,5);fill(45,178,125,180,5);fill(45,70,47,180,5);fill(123,70,125,100,5);fill(123,120,125,180,5);}
 if(change==='white-margin'){fill(0,0,419,17,245);}
 return{w,h,data};
}
function run(change,uniformCore){const f=fixture(change);return det.analyzeRGBA(f.data,f.w,f.h,null,{inkCompletion:true,allowPartial:true,uniformCore});}
const old=run(null,false),fresh=run(null,true);
console.log('synthetic old/new',old.length,fresh.length,fresh.map(p=>[p.x,p.y,p.w,p.h]));
assert(old.length>=2);assert(fresh.length>old.length,'separate the wholly bounded upper scenes');
const added=det.mergeDarkSupplement(old,fresh);assert(added.length>0);
assert(old.every(p=>fresh.some(n=>JSON.stringify(n._quad)===JSON.stringify(p._quad))),'old corners retain their exact fits');
for(const p of added){assert(p._partitionProof.uniformCoreFits.length);assert(p.y<.1&&p.y+p.h<.51,'new owner is entirely in the old unresolved top row');}
for(const kind of ['broken','one-ended','variable','thin','inset','interrupted-inset','white-margin']){
 const before=run(kind,false),after=run(kind,true),extra=det.mergeDarkSupplement(before,after);
 assert.equal(extra.length,0,kind+' cannot gain new authority');
}
assert.equal(det.mergeDarkSupplement(old,fresh.map(p=>({...p,_quad:p._quad.map(v=>({x:v.x+.01,y:v.y}))}))).length,0,'changed existing boundaries invalidate supplement');
assert.equal(det.mergeDarkSupplement([],fresh).length,0,'no unanchored recovery');
console.log('Uniform ink-core supplement: independent layout, exact old boundaries, seven negative images and invalid-anchor gates passed.');
