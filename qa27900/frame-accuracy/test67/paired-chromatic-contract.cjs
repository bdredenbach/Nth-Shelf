'use strict';
const assert=require('node:assert/strict');
const D=require('../../../js/panels-colored-rims.js');
global.PanelColoredRims=D;
const S=require('../../../js/panels-structural-grid.js');

function rgba(w,h,{split=true,flat=false,open=false}={}){
  const a=new Uint8ClampedArray(w*h*4);
  const set=(x,y,r,g,b)=>{if(x<0||y<0||x>=w||y>=h)return;const i=(y*w+x)*4;a[i]=r;a[i+1]=g;a[i+2]=b;a[i+3]=255;};
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)set(x,y,90,48,48);
  const frame=(x0,y0,x1,y1,cut=false)=>{
    for(let y=y0+7;y<y1-7;y++)for(let x=x0+7;x<x1-7;x++){
      const v=flat?100:(((x>>4)+(y>>4))&1?42:184);set(x,y,v,v,v);
    }
    const c=[18,122,166],t=7;
    for(let k=0;k<t;k++){
      for(let x=x0+k;x<x1-k;x++){
        set(x,y0+k,...c);
        if(!open)set(x,y1-1-k,...c);
      }
      for(let y=y0+k;y<y1-k;y++){
        set(x0+k,y,...c);
        set(x1-1-k,y,...c);
      }
    }
    if(cut&&split){
      for(let y=y0;y<y0+14;y++)for(let x=x0;x<x0+14;x++)set(x,y,20,20,20);
      for(let y=y1-14;y<y1;y++)for(let x=x1-14;x<x1;x++)set(x,y,20,20,20);
    }
  };
  frame(Math.round(w*.07),Math.round(h*.08),Math.round(w*.35),Math.round(h*.48),true);
  frame(Math.round(w*.45),Math.round(h*.68),Math.round(w*.94),Math.round(h*.90),false);
  return a;
}
function clone(v){return JSON.parse(JSON.stringify(v));}
const sizes=[[500,700],[640,900]], proofs=[];
for(const [w,h] of sizes){
  const out=D.analyzePairedRGBA(rgba(w,h),w,h);
  assert.equal(out.length,2,`expected two synthetic insets at ${w}x${h}`);
  assert(out.every(p=>D.validPanel(p)&&S.validPanel(p)));
  assert(out.some(p=>p._structuralGridProof.components.length===2),'split perimeter pair missing');
  assert(out.some(p=>p._structuralGridProof.components.length===1),'single connected perimeter missing');
  proofs.push(...out);
  assert.equal(D.analyzePairedRGBA(rgba(w,h,{flat:true}),w,h).length,0,'flat interiors must be rejected');
  assert.equal(D.analyzePairedRGBA(rgba(w,h,{open:true}),w,h).length,0,'open frames must be rejected');
}
let mutations=0;
const base=proofs[0];
for(const mutate of [
  p=>p._structuralGridProof.version=25,
  p=>p._structuralGridProof.method='other',
  p=>p._structuralGridProof.connected=false,
  p=>p._structuralGridProof.hueBin=12,
  p=>p._structuralGridProof.band=2,
  p=>p._structuralGridProof.padding=8,
  p=>p._structuralGridProof.sides[0]=.2,
  p=>p._structuralGridProof.fill=.8,
  p=>p._structuralGridProof.insideVariance=1,
  p=>p._structuralGridProof.rawBox[0]+=1,
  p=>p._structuralGridProof.box[2]-=1,
  p=>p._structuralGridProof.components[0].pixels=1,
  p=>p._contours[0][0].x+=.01,
  p=>p.x+=.01,
]){
  const p=clone(base);mutate(p);assert.equal(D.validPanel(p),false);mutations++;
}
const reader=require('node:fs').readFileSync(require('node:path').resolve(__dirname,'../../../js/reader.js'),'utf8');
assert(reader.includes('[21,22,23,24,25,26].includes(panel._structuralGridProof?.version)'));
const geometry=require('node:fs').readFileSync(require('node:path').resolve(__dirname,'../../../js/panels-geometry.js'),'utf8');
assert(geometry.includes('[21,22,23,24,25,26].includes(panel._structuralGridProof?.version)'));
console.log(JSON.stringify({passed:true,syntheticSizes:sizes.length,owners:proofs.length,pairedOwners:proofs.filter(p=>p._structuralGridProof.components.length===2).length,mutations}));
