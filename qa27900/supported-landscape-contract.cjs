'use strict';
// Public synthetic-only tests: no comic assets, source hashes, saved polygons or tap IDs.
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const file=path.join(__dirname,'../js/panels-supported-landscape.js'),code=fs.readFileSync(file,'utf8');
function fixture(kind,w=800,h=800){const a=new Uint8ClampedArray(w*h*4);a.fill(255);const rect=(x0,y0,x1,y1,rgb)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const j=(y*w+x)*4;a[j]=rgb[0];a[j+1]=rgb[1];a[j+2]=rgb[2];}};
 if(kind!=='blank'){for(const[y0,y1,color]of[[12,Math.floor(h*.485),[180,160,100]],[Math.floor(h*.51),h-13,[100,140,180]]]){rect(12,y0,w-13,y1,[0,0,0]);rect(19,y0+7,w-20,y1-7,color);}
 if(kind==='split'||kind==='dim-split'){const mid=w>>1;rect(mid-15,12,mid+14,Math.floor(h*.485),[0,0,0]);rect(mid-8,19,mid+7,Math.floor(h*.485)-7,kind==='dim-split'?[225,225,215]:[255,255,255]);}}
 return{a,w,h};}
const base=fixture('single');let delegated=0;const old=function(...args){delegated++;assert.equal(this.marker,7);return args;};
const reader={marker:7,panelContours:old,displayPanelContours:old,getPanelImageContext(){return{img:this.img};}},structural={validPanel:p=>p?.old===true},geometry={refine:async(_s,p)=>p};
const document={createElement(){let im;return{width:0,height:0,getContext(){return{drawImage(x){im=x;},getImageData(){return{data:im.data};}};}};}};
const mod=new Function('document','Reader','PanelStructuralGrid','PanelGeometry','module',code+';return PanelSupportedLandscape;')(document,reader,structural,geometry,{exports:{}});
let count=0;function check(name,fn){fn();count++;console.log('ok',name);}
let p;
check('observed single upper cell nominates',()=>{[p]=mod.analyzeRGBA(base.a,base.w,base.h);assert(p);assert.equal(mod.VERSION,172);assert(mod.validPanel(p));assert(mod.contains(p,.5,.25));assert(!mod.contains(p,.5,.9));});
check('deep immutable ownership',()=>{assert(Object.isFrozen(p));assert(Object.isFrozen(p._contours[0][0]));assert(Object.isFrozen(p._structuralGridProof.evidence));assert.throws(()=>{p.x=0;});assert.throws(()=>{p._contours[0][0].x=0;});});
check('serialized and copied ownership rejected',()=>{assert(!mod.validPanel(JSON.parse(JSON.stringify(p))));assert(!mod.validateRGBA({...p},base.a,800,800));assert(!mod.validPanel({...p,_structuralGridProof:{...p._structuralGridProof}}));});
check('source mutation rejected',()=>{assert(mod.validateRGBA(p,base.a,800,800));const a=base.a.slice();a[0]=0;assert(!mod.validateRGBA(p,a,800,800));});
check('blank and split upper row rejected',()=>{for(const kind of['blank','split','dim-split']){const f=fixture(kind);assert.equal(mod.analyzeRGBA(f.a,f.w,f.h).length,0,kind);}});
check('different native dimensions supported without saved coordinates',()=>{const f=fixture('single',640,640);assert.equal(mod.analyzeRGBA(f.a,f.w,f.h).length,1);});
check('malformed/oversized/translucent inputs rejected',()=>{for(const[w,h]of[[0,800],[800,0],[6001,800],[6000,6000],[800.5,800]])assert.deepEqual(mod.analyzeRGBA(new Uint8ClampedArray(0),w,h),[]);const a=base.a.slice();a[3]=0;assert.deepEqual(mod.analyzeRGBA(a,800,800),[]);});
check('reserved version malformed claims fail closed',()=>{const malformed={_geometryType:'supported-landscape',_structuralGridProof:{version:172,method:'unrelated'}};assert(mod.isClaim(malformed));assert(!mod.validPanel(malformed));assert(!structural.validPanel(malformed));assert.equal(reader.panelContours(malformed),null);const changedType={...p,_geometryType:'rectangle'};assert(mod.isClaim(changedType));assert(!mod.validPanel(changedType));assert.equal(reader.displayPanelContours(changedType),null);assert(!mod.isClaim({_geometryType:'supported-landscape',_structuralGridProof:{version:171,method:'source-supported-upper-landscape'}}));assert(structural.validPanel({old:true}));});
function image(data){const listeners={};return{src:'synthetic-source',currentSrc:'synthetic-source',naturalWidth:800,naturalHeight:800,width:800,height:800,complete:true,data,addEventListener(k,f){(listeners[k]??=[]).push(f);},emit(k){for(const f of listeners[k]||[])f();}};}
const img=image(base.a);reader.img=img;let q;
check('miss lookup uses complete source candidate and true containment',()=>{q=mod.findMissCandidate(img,.5,.25);assert(q);assert(mod.validateImage(q,img));assert.equal(mod.findMissCandidate(img,.5,.30),q);assert.equal(mod.findMissCandidate(img,.5,.9),null);assert.equal(mod.findMissCandidate(img,NaN,.2),null);});
check('reader hooks preserve exact held contours',()=>{assert.equal(reader.panelContours(q),q._contours);assert.equal(reader.displayPanelContours(q),q._contours);assert.deepEqual(reader.panelContours({old:true},123),[{old:true},123]);assert.equal(delegated,1);});
check('loading/error invalidates source authority',()=>{img.complete=false;assert(!mod.validateImage(q,img));assert.equal(mod.findMissCandidate(img,.5,.25),null);img.complete=true;img.emit('error');assert(!mod.validateImage(q,img));img.emit('load');assert(mod.validateImage(q,img));});
check('same URI reload re-reads changed pixels',()=>{img.data=fixture('blank').a;img.emit('load');assert(!mod.validateImage(q,img));assert.equal(mod.findMissCandidate(img,.5,.25),null);assert.equal(reader.panelContours(q),null);});
check('zero source dimension rejected even after cache',()=>{img.data=base.a;img.emit('load');assert(mod.findMissCandidate(img,.5,.25));img.naturalWidth=0;assert(!mod.validateImage(q,img));assert.equal(mod.findMissCandidate(img,.5,.25),null);});
check('forged proof never promoted by source validation',()=>{img.naturalWidth=800;assert(!mod.validateImage(JSON.parse(JSON.stringify(q)),img));});
console.log(JSON.stringify({passed:count,sourceOnly:true,readerAdmissionNotTested:true}));
