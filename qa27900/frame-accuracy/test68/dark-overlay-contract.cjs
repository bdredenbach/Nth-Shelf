'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const D=require('../../../js/panels-dark-overlay-insets.js');global.PanelDarkOverlayInsets=D;
const S=require('../../../js/panels-structural-grid.js');
function image({weak=true,open=false,flat=false,outsideDark=false}={}){
  const w=312,h=480,a=new Uint8ClampedArray(w*h*4),set=(x,y,c)=>{if(x<0||y<0||x>=w||y>=h)return;const i=(y*w+x)*4;a[i]=c[0];a[i+1]=c[1];a[i+2]=c[2];a[i+3]=255;};
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const v=outsideDark?18:95+((x*7+y*11)%55);set(x,y,[v,Math.min(220,v+18),Math.max(30,v-15)]);}
  const box=[29,10,282,283],t=5;
  for(let y=box[1]+t;y<box[3]-t;y++)for(let x=box[0]+t;x<box[2]-t;x++){const v=flat?125:45+((x*13+y*17)%150);set(x,y,[v,Math.max(20,v-25),Math.min(235,v+15)]);}
  const black=[0,0,0];
  for(let k=0;k<t;k++){
    for(let x=box[0];x<=box[2];x++){set(x,box[1]+k,black);set(x,box[3]-k,black);}
    for(let y=box[1];y<=box[3];y++){set(box[0]+k,y,black);if(!open)set(box[2]-k,y,black);}
  }
  if(weak&&!open){const y0=105,y1=165;for(let y=y0;y<=y1;y++)for(let x=box[2]-t-2;x<=box[2]+t+2;x++){const v=115+((x+y)%40);set(x,y,[v,Math.min(220,v+15),Math.max(30,v-10)]);}}
  return {a,w,h,box};
}
const f=image(),out=D.analyzeRGBA(f.a,f.w,f.h);assert.equal(out.length,1);assert(D.validPanel(out[0]));assert(S.validPanel(out[0]));assert.equal(out[0]._structuralGridProof.version,25);assert.equal(out[0]._structuralGridProof.weakSide,3);assert(out[0]._structuralGridProof.supports.filter(v=>v>=.94).length===3);
assert.equal(D.analyzeRGBA(image({weak:false}).a,312,480).length,0,'four complete rails belong to earlier frame routes, not this fallback');
assert.equal(D.analyzeRGBA(image({open:true}).a,312,480).length,0,'an open fourth side is not an occluded rail');
assert.equal(D.analyzeRGBA(image({flat:true}).a,312,480).length,0,'flat interior is not a comic scene');
assert.equal(D.analyzeRGBA(image({outsideDark:true}).a,312,480).length,0,'dark exterior without border contrast is not an overlay frame');
assert.deepEqual(D.completeImage(null,[]),[]);assert.deepEqual(D.completeImage({},[{}]),[]);
const clone=v=>JSON.parse(JSON.stringify(v)),base=out[0];let tampered=0;
for(const mutate of [
 p=>p._structuralGridProof.version=26,
 p=>p._structuralGridProof.method='other',
 p=>p._structuralGridProof.connected=false,
 p=>p._structuralGridProof.threshold=61,
 p=>p._structuralGridProof.band=8,
 p=>p._structuralGridProof.contrastDistance=2,
 p=>p._structuralGridProof.supports[0]=.5,
 p=>p._structuralGridProof.weakSide=0,
 p=>p._structuralGridProof.sideMetrics[3].outside=.2,
 p=>p._structuralGridProof.interiorVariance=1,
 p=>p._structuralGridProof.box[0]+=1,
 p=>p._contours[0][0].x+=.01,
 p=>p.x+=.01
]){const p=clone(base);mutate(p);assert.equal(D.validPanel(p),false);tampered++;}
const reader=fs.readFileSync(path.resolve(__dirname,'../../../js/reader.js'),'utf8'),geometry=fs.readFileSync(path.resolve(__dirname,'../../../js/panels-geometry.js'),'utf8');assert(reader.includes('[21,22,23,24,25,26].includes(panel._structuralGridProof?.version)'));assert(geometry.includes('[21,22,23,24,25,26].includes(panel._structuralGridProof?.version)'));
console.log(JSON.stringify({passed:true,owner:out.length,weakSide:out[0]._structuralGridProof.weakSide,tampered}));
