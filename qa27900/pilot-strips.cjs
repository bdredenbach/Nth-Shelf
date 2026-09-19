'use strict';
const assert = require('node:assert/strict');
const { analyzeRGBA } = require('../js/panels-page-layout');
// Independently drawn white-margin strip page. Strong hatching connects with
// each divider, so most cross-sections have no isolated thin ink band.
function fixture({ slope = 0, broken = false, vertical = false, partial = false, inset = false, insetPad = 15, insetGap = false, caption = false, missingSide = false, count = 5 } = {}) {
  const w = 400, h = 650, pad = 18, right = w - pad - 1, bottom = h - pad - 1;
  const data = new Uint8ClampedArray(w * h * 4);
  const lines = Array.from({length:count + 1}, (_, i) => pad + (bottom-pad)*i/count);
  const boundary = (i, x) => lines[i] + slope*(x-w/2);
  const pixel = (x,y,v) => { const i=(y*w+x)*4;data[i]=data[i+1]=data[i+2]=Math.round(v);data[i+3]=255; };
  for (let y=0;y<h;y++) for (let x=0;x<w;x++) {
    let v=250;
    if (x>=pad && x<=right && y>=boundary(0,x) && y<=boundary(count,x)) {
      v=145+45*Math.sin(x*.147+y*.213)+25*Math.sin(x*.073-y*.191);
      // Artwork ink repeatedly attaches to the separators. Its width and
      // attachment phase vary; it cannot itself span the complete page.
      if(x%11<4 && lines.some((_,i)=>i>0&&i<count&&Math.abs(y-boundary(i,x))<8)) v=5;
    }
    const ink = x>=pad-1&&x<=right+1 && lines.some((_,i)=>Math.abs(y-boundary(i,x))<=2 && !(broken&&i===2&&x>w*.87));
    if(ink)v=5;
    if(y>=boundary(0,x)-1&&y<=boundary(count,x)+1 && (Math.abs(x-pad)<=2&&!missingSide || Math.abs(x-right)<=2))v=5;
    if(vertical && Math.abs(x-w*.52)<=2 && y>boundary(1,x) && y<boundary(2,x) && !(partial&&y>boundary(1,x)+(lines[2]-lines[1])*.42&&y<boundary(1,x)+(lines[2]-lines[1])*.65))v=5;
    if(inset&&((Math.abs(x-90)<=2||Math.abs(x-270)<=2)&&y>=lines[2]+insetPad&&y<=lines[3]-insetPad||(Math.abs(y-(lines[2]+insetPad))<=2||Math.abs(y-(lines[3]-insetPad))<=2)&&x>=90&&x<=270)) {
      if(!(insetGap&&Math.abs(x-90)<=2&&y>lines[2]+(lines[3]-lines[2])*.44&&y<lines[2]+(lines[3]-lines[2])*.53))v=5;
    }
    if(caption&&((Math.abs(x-42)<=1||Math.abs(x-142)<=1)&&y>=lines[1]+12&&y<=lines[1]+37||(Math.abs(y-(lines[1]+12))<=1||Math.abs(y-(lines[1]+37))<=1)&&x>=42&&x<=142))v=5;
    pixel(x,y,v);
  }
  return {data,w,h,pad,right,bottom,lines,boundary};
}
function run(opts){const f=fixture(opts);return {f,panels:analyzeRGBA(f.data,f.w,f.h)};}
for(const slope of [0,.008,-.008]){
  const {f,panels}=run({slope});assert.equal(panels.length,5,'five complete white-margin strips');
  panels.forEach((p,i)=>{assert.equal(p._identitySource,'page-layout');assert.equal(p._pageLayoutProof.closed,true);p._quad.forEach((q,k)=>{const x=(k===0||k===3)?f.pad:f.right,y=f.boundary(i+(k>=2?1:0),x);assert(Math.abs(q.x*f.w-x)<=3,'outer rail is independent of artwork');assert(Math.abs(q.y*f.h-y)<=3,'divider follows drawn rail at both ends');});});
}
assert.equal(run({broken:true}).panels.length,0,'interrupted separator cannot become a merged strip');
assert.equal(run({vertical:true}).panels.length,0,'vertical subdivision forbids whole strip map');
assert.equal(run({vertical:true,partial:true}).panels.length,0,'partly hidden vertical subdivision is unresolved');
assert.equal(run({inset:true}).panels.length,0,'nested panel forbids an enclosing strip');
for(const insetPad of[35,40])for(const insetGap of[false,true])assert.equal(run({inset:true,insetPad,insetGap}).panels.length,0,'short full/interrupted nested frame forbids an enclosing strip');
assert.equal(run({caption:true}).panels.length,5,'small caption stays part of its whole first-level strip');
assert.equal(run({missingSide:true}).panels.length,0,'missing exterior side cannot anchor the map');
assert.equal(run({count:3}).panels.length,0,'insufficient independent strips rejected');
console.log('pilot-strips: complete white-margin stacks, attached dark artwork, tilted rails, missing/divided/inset negatives passed');
if(process.argv.includes('--comic')){
  // Optional copyrighted fixture is local only. These coordinates were read
  // from the printed borders, never generated from the detector being tested.
  const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),harness=require('./harness');
  const expected=[
    [[.030,.026],[.966,.024],[.966,.310],[.029,.310]],
    [[.029,.310],[.966,.310],[.966,.488],[.028,.488]],
    [[.028,.488],[.966,.488],[.966,.662],[.028,.662]],
    [[.028,.662],[.966,.662],[.966,.813],[.027,.812]],
    [[.027,.812],[.966,.813],[.966,.968],[.027,.968]]
  ];
  (async()=>{
    const panels=await harness.api.PanelDetect.detect(harness.pages[2]);
    assert.equal(panels.length,5,'five independently labelled printed frames');
    const ctx=vm.createContext({console,PanelGeometry:harness.api.PanelGeometry,localStorage:{getItem(){return null;}},requestAnimationFrame(){},clamp:(v,a,b)=>Math.max(a,Math.min(b,v))});
    vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/reader.js'),'utf8'),ctx);
    const reader=vm.runInContext('Reader',ctx),rect={left:0,top:0,width:600,height:900};
    reader.mode='single';reader.scale=1;reader.panelZoomEnabled=true;reader.comic={id:'pilot-strip-fixture'};reader.index=2;
    reader.els={stage:{getBoundingClientRect:()=>rect}};reader.getPanelImageContext=()=>({img:{},rect});reader.currentPanels=panels;reader.getPageUrl=async()=>harness.pages[2];
    let captures=[];reader.zoomToPanel=p=>captures.push(JSON.parse(JSON.stringify(p)));
    const positions=[[.5,.5],[.16,.5],[.84,.5],[.5,.16],[.5,.84]];
    for(const [i,q] of expected.entries()){
      captures=[];
      for(const[u,v]of positions){const[x,y]=[0,1].map(a=>(1-v)*((1-u)*q[0][a]+u*q[1][a])+v*((1-u)*q[3][a]+u*q[2][a]));await reader.handleSingleTap({x:x*600,y:y*900});}
      assert.equal(captures.length,5,'each interior point opens its frame');
      const shape=p=>[p.x,p.y,p.w,p.h,p._quad];
      captures.forEach(p=>{assert.equal(p._identitySource,'page-layout');assert.deepEqual(shape(p),shape(captures[0]),'all moved taps retain exactly one frame');p._quad.forEach((point,k)=>{assert(Math.abs(point.x-q[k][0])<.008&&Math.abs(point.y-q[k][1])<.008,`strip${i} corner${k} matches printed border`);});});
    }
    console.log('pilot-strips: 25 actual Reader.handleSingleTap checks passed across the five printed frames');
  })().catch(error=>{console.error(error);process.exitCode=1;});
}
