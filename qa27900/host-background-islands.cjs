'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..');
const matte=require(root+'/js/panels-matte-cells.js');
const context={module:{exports:{}},PanelMatteCells:matte,console};vm.createContext(context);
vm.runInContext(fs.readFileSync(root+'/js/panels-host-background-islands.js','utf8'),context);
const api=context.module.exports,W=400,H=300;
const palette=[[80,100,130],[120,60,30],[200,120,70],[70,140,60],[180,80,130],[60,120,180],[150,145,70],[90,60,155],[230,170,40],[180,180,100],[30,60,90],[100,140,160]];
function image(kind='scene'){
 const a=new Uint8ClampedArray(W*H*4);const pixel=(x,y,c)=>{const i=(y*W+x)*4;a[i]=c[0];a[i+1]=c[1];a[i+2]=c[2];a[i+3]=255;};
 for(let y=0;y<H;y++)for(let x=0;x<W;x++)pixel(x,y,[255,255,255]);
 for(let y=20;y<280;y++)for(let x=20;x<380;x++)pixel(x,y,x<24||x>=376||y<24||y>=276?[20,20,20]:[200,235,250]);
 if(kind==='exterior')for(let y=0;y<H;y++)for(let x=0;x<W;x++)pixel(x,y,[200,235,250]);
 if(kind==='neutral')for(let y=24;y<276;y++)for(let x=24;x<376;x++)pixel(x,y,[235,235,235]);
 const box=kind==='tiny'?[150,120,250,150]:[90,105,330,195];
 for(let y=box[1];y<box[3];y++)for(let x=box[0];x<box[2];x++){
  const X=(x-210)/120,Y=(y-150)/45;
  if(kind==='object'&&X*X+Y*Y>1)continue;
  const rim=kind==='object'?X*X+Y*Y>.83:x<box[0]+3||x>=box[2]-3||y<box[1]+3||y>=box[3]-3;
  let c=palette[(Math.floor((x-box[0])/20)+Math.floor((y-box[1])/15))%palette.length];
  if(kind==='caption'||kind==='credits')c=(Math.floor((x-box[0])/6)%3===0&&y>box[1]+15&&y<box[3]-15)?[20,20,20]:[250,230,90];
  if(rim&&kind!=='no-rim')c=[15,15,15];pixel(x,y,c);
 }
 return a;
}
const checks=[];function check(name,fn){fn();checks.push(name);}
let positive;
check('rich wide framed island admitted',()=>{positive=api.analyzeRGBA(image(),W,H);assert.equal(positive.length,1);assert(api.validPanel(positive[0]));});
for(const kind of ['tiny','exterior','neutral','caption','credits','object','no-rim'])check(kind+' abstains',()=>assert.equal(api.analyzeRGBA(image(kind),W,H).length,0));
check('serialized proof untrusted until exact-source replay',()=>{const p=JSON.parse(JSON.stringify(positive[0]));assert(!api.validPanel(p));assert(api.validateRGBA(p,image(),W,H));assert(api.validPanel(p));});
check('changed same-dimension source rejected',()=>{const p=JSON.parse(JSON.stringify(positive[0])),a=image();a[0]^=1;assert(!api.validateRGBA(p,a,W,H));});
check('forged signature and evidence rejected',()=>{const p=JSON.parse(JSON.stringify(positive[0]));p._structuralGridProof.evidence.pixels++;assert(!api.validateRGBA(p,image(),W,H));});
check('changed contour rejected',()=>{const p=JSON.parse(JSON.stringify(positive[0]));p._contours[0][0].x+=.001;assert(!api.validateRGBA(p,image(),W,H));});
check('proof and geometry are immutable',()=>{assert(Object.isFrozen(positive[0]._structuralGridProof));assert(Object.isFrozen(positive[0]._contours));});
check('transparent source rejected',()=>{const a=image();a[3]=254;assert.equal(api.analyzeRGBA(a,W,H).length,0);});
check('invalid dimensions and lengths rejected',()=>{assert.equal(api.analyzeRGBA(image(),W+.5,H).length,0);assert.equal(api.analyzeRGBA(new Uint8Array(12),W,H).length,0);});
context.document={createElement(){
 let img;
 return {width:1,height:1,getContext(){
  return {drawImage(x){img=x;},getImageData(){return {data:img.rgba};}};
 }};
}};
function sourceImage(){const events={};return {src:'same-source',complete:true,naturalWidth:W,naturalHeight:H,width:W,height:H,rgba:image(),addEventListener(k,fn){(events[k]||(events[k]=[])).push(fn);},fire(k){for(const fn of events[k]||[])fn();}};}
check('source loading cannot reuse issued geometry',()=>{const img=sourceImage(),p=JSON.parse(JSON.stringify(positive[0]));assert(api.validateImage(p,img));img.complete=false;assert(!api.validateImage(p,img));img.complete=true;img.fire('load');assert(api.validateImage(p,img));});
check('error cannot re-admit old same-URI bitmap',()=>{const img=sourceImage(),p=JSON.parse(JSON.stringify(positive[0]));assert(api.validateImage(p,img));img.fire('error');assert(!api.validateImage(p,img));img.fire('load');assert(api.validateImage(p,img));});
check('same-URI load rechecks changed source pixels',()=>{const img=sourceImage(),p=JSON.parse(JSON.stringify(positive[0]));assert(api.validateImage(p,img));img.rgba=image();img.rgba[0]^=1;img.fire('load');assert(!api.validateImage(p,img));});
check('zero native size never falls back to CSS size',()=>{const img=sourceImage(),p=JSON.parse(JSON.stringify(positive[0]));img.naturalWidth=0;assert(!api.validateImage(p,img));});
check('reassigned geometry invalidates previously issued proof',()=>{const p=JSON.parse(JSON.stringify(positive[0]));assert(api.validateRGBA(p,image(),W,H));p._contours=JSON.parse(JSON.stringify(p._contours));p._contours[0][0].x+=.01;assert(!api.validPanel(p));assert(!api.validateRGBA(p,image(),W,H));});
check('nonclaim Reader delegation preserves receiver and arguments',()=>{const calls=[],reader={getPanelImageContext(){return null;},panelContours(...args){calls.push(['contours',this,args]);return 11;},displayPanelContours(...args){calls.push(['display',this,args]);return 22;}};api.installReader(reader);const p={x:0};assert.equal(reader.panelContours(p,'extra'),11);assert.equal(reader.displayPanelContours(p),22);assert.equal(calls[0][1],reader);assert.equal(calls[0][2].length,2);assert.equal(calls[1][2].length,1);});
// Internal native correspondence checks use synthetic pixels only. The test-only
// export is injected in a separate VM, never exposed by the production module.
const nativeContext={module:{exports:{}},PanelMatteCells:matte,console};vm.createContext(nativeContext);
vm.runInContext(fs.readFileSync(root+'/js/panels-host-background-islands.js','utf8').replace('return {VERSION,RULES','return {_nativeIsland:nativeIsland,VERSION,RULES'),nativeContext);
const nativeIsland=nativeContext.module.exports._nativeIsland;
const box=[90,105,330,195],mask=new Uint8Array(W*H);for(let y=105;y<195;y++)for(let x=90;x<330;x++)mask[y*W+x]=1;
const nativeState=a=>({w:W,h:H,nativeWidth:W,nativeHeight:H,nativeRGBA:a});
check('native correspondence preserves exact enclosed source component',()=>{const q=nativeIsland(nativeState(image()),box,mask);assert(q);assert.equal(q.evidence.pixels,240*90);assert.equal(q.evidence.boxIoU,1);assert.equal(q.evidence.areaRatio,1);});
check('native component touching local crop boundary fails closed',()=>{const a=image();for(let x=86;x<95;x++){const i=(150*W+x)*4;a[i]=a[i+1]=a[i+2]=0;}assert.equal(nativeIsland(nativeState(a),box,mask),null);});
check('native area expansion cap rejects incompatible sparse analysis',()=>{const sparse=mask.slice();for(let y=110;y<190;y++)for(let x=100;x<320;x++)sparse[y*W+x]=0;assert.equal(nativeIsland(nativeState(image()),box,sparse),null);});
check('native bbox mismatch fails closed',()=>{assert.equal(nativeIsland(nativeState(image()),[100,105,340,195],mask),null);});
check('missing native source fails closed',()=>{assert.equal(nativeIsland(nativeState(null),box,mask),null);});
check('mutable canvas-like source is never reused from image cache',()=>{const img=sourceImage();delete img.naturalWidth;delete img.naturalHeight;const p=JSON.parse(JSON.stringify(positive[0]));assert(api.validateImage(p,img));img.rgba[0]^=1;assert(!api.validateImage(p,img));});
console.log(JSON.stringify({passed:checks.length,checks},null,2));
