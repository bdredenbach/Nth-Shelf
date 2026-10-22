'use strict';
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),cv=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/@napi-rs/canvas');
const root=path.resolve(__dirname,'../../..');
const api=new Function('document',['panels-matte-cells','panels-crop-repair'].map(n=>fs.readFileSync(root+'/js/'+n+'.js','utf8')).join('\n')+'\nconst PanelTrailingEdgeGroups={validPanel:()=>false};\n'+fs.readFileSync(root+'/js/panels-detached-captions.js','utf8')+';return{M:PanelMatteCells,C:PanelCropRepair,D:PanelDetachedCaptions};')({createElement:()=>cv.createCanvas(1,1)});
const w=600,h=900,checks=[];function check(name,fn){fn();checks.push({name,passed:true});}
function fixture({scale=1,mirror=false,ink=true,fractional=false,color='#ffe030'}={}){
 const c=cv.createCanvas(w*scale,h*scale),oracle=cv.createCanvas(w*scale,h*scale),g=c.getContext('2d'),o=oracle.getContext('2d');g.fillStyle='white';g.fillRect(0,0,c.width,c.height);for(const z of[g,o]){z.scale(scale,scale);if(mirror){z.translate(w,0);z.scale(-1,1);}if(fractional)z.translate(.3,.4);}
 g.fillStyle='#204878';g.beginPath();[[40,320],[250,310],[260,60],[320,60],[330,310],[540,320],[540,500],[40,500]].forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();g.fillStyle='black';for(let y=350;y<470;y+=25)g.fillRect(70,y,420,6);g.fillStyle='#908080';g.fillRect(10,520,580,365);g.fillStyle='black';for(let y=550;y<870;y+=25)g.fillRect(30,y,540,8);
 for(const z of[g,o]){z.fillStyle=color;z.fillRect(410,180,140,50);if(ink){z.fillStyle='#111';for(let n=0;n<12;n++)z.fillRect(417+n*10,190,4,26);}}
 const native=g.getImageData(0,0,c.width,c.height).data,rgba=api.M.sampleBilinearRGBA(native,c.width,c.height,w,h),owners=api.M.analyzeRGBA(rgba,w,h),p=owners.find(p=>p.w>.6&&p.h>.4);assert(p,'real matte owner');const mask=api.C.raster(api.C.repair(p._contours,w,h,[],rgba)?.contours||p._contours,w,h);return{rgba,owners:[p],masks:[mask],oracle,scale,c,native:{rgba:native,w:c.width,h:c.height}};
}
function run(f){return api.D.analyzeRGBA(f.rgba,w,h,f.owners,f.masks,f.native);}
for(const [name,opt] of [['native',{}],['mirrored',{mirror:true}],['double source',{scale:2}],['triple fractional',{scale:3,fractional:true}]]){
 const f=fixture(opt),out=run(f);check(name+': unique partial caption',()=>assert.equal(out.length,1,name));
 const mask=new Set(out[0].indices),a=f.oracle.getContext('2d').getImageData(0,0,f.oracle.width,f.oracle.height).data;let missing=0,total=0;for(let y=0;y<f.oracle.height;y++)for(let x=0;x<f.oracle.width;x++)if(a[(y*f.oracle.width+x)*4+3]){total++;missing+=!mask.has(Math.floor(y/f.scale)*w+Math.floor(x/f.scale));}
 check(name+': every independently drawn native caption pixel retained',()=>{assert(total>5000);assert.equal(missing,0,name);});
 const serialized=JSON.parse(JSON.stringify(f.owners));check(name+': serialized identity validates',()=>assert.deepEqual(api.D.analyzeRGBA(f.rgba,w,h,serialized,f.masks,f.native),out));
 const altered=JSON.parse(JSON.stringify(f.owners));altered[0]._contours[0][0].x+=.01;check(name+': altered geometry rejected',()=>assert.deepEqual(api.D.analyzeRGBA(f.rgba,w,h,altered,f.masks,f.native),[]));
}
for(const [name,opt] of [['solid colored artwork',{ink:false}],['white instead of chromatic',{color:'#ffffff'}]])check(name+' is not a caption',()=>assert.deepEqual(run(fixture(opt)),[]));
const f=fixture(),out=run(f),foreign=new Uint8Array(w*h);foreign[out[0].indices[0]]=1;
check('one foreign displayed pixel vetoes',()=>assert.deepEqual(api.D.analyzeRGBA(f.rgba,w,h,[...f.owners,{x:0,y:.8,w:.1,h:.1}],[...f.masks,foreign],f.native),[]));
check('competing bounds veto even without displayed pixels',()=>assert.deepEqual(api.D.analyzeRGBA(f.rgba,w,h,[...f.owners,{x:.6,y:.1,w:.4,h:.2}],[...f.masks,new Uint8Array(w*h)],f.native),[]));
check('no existing partial display does not attach nearby body',()=>assert.deepEqual(api.D.analyzeRGBA(f.rgba,w,h,f.owners,[new Uint8Array(w*h)],f.native),[]));
const full=f.masks[0].slice();for(const i of out[0].indices)full[i]=1;
check('already whole caption unchanged',()=>assert.deepEqual(api.D.analyzeRGBA(f.rgba,w,h,f.owners,[full],f.native),[]));
const nativeFixture=fixture({scale:3}),nativeOut=run(nativeFixture),n=nativeFixture.native,poisoned=n.rgba.slice();
const base=api.C.captionBodies(nativeFixture.rgba,w,h,true)[0],baseSet=new Set(base.indices),fringe=nativeOut[0].indices.find(i=>!baseSet.has(i));assert.notEqual(fringe,undefined);
const nx=Math.floor((fringe%w)*n.w/w),ny=Math.floor(Math.floor(fringe/w)*n.h/h);poisoned.set([0,0,0,255],(ny*n.w+nx)*4);
check('native thin foreign stroke invisible to coarse source vetoes fringe',()=>assert.deepEqual(api.D.analyzeRGBA(nativeFixture.rgba,w,h,nativeFixture.owners,nativeFixture.masks,{...n,rgba:poisoned}),[]));
const closed=poisoned.slice(),z=(ny*n.w+nx)*4;
// Connect the enclosing native palette to the actual caption, never across paper.
for(let y=ny;y<=181*3;y++)closed.set([255,224,48,255],(y*n.w+nx+1)*4);
for(let x=nx+1;x<=411*3;x++)closed.set([255,224,48,255],(181*3*n.w+x)*4);
for(const j of [z-4,z+4,z-n.w*4,z+n.w*4])closed.set([255,224,48,255],j);
check('native palette-enclosed one-pixel hole retained',()=>assert.equal(api.D.analyzeRGBA(nativeFixture.rgba,w,h,nativeFixture.owners,nativeFixture.masks,{...n,rgba:closed}).length,1));
const openHole=closed.slice();openHole.set([255,255,255,255],z+4);
check('native outlier open to exterior paper still vetoes',()=>assert.deepEqual(api.D.analyzeRGBA(nativeFixture.rgba,w,h,nativeFixture.owners,nativeFixture.masks,{...n,rgba:openHole}),[]));
const gold=n.rgba.slice();gold.set([255,224,48,255],(ny*n.w+nx)*4);
check('isolated neighboring native gold mark cannot be owned by palette',()=>assert.deepEqual(api.D.analyzeRGBA(nativeFixture.rgba,w,h,nativeFixture.owners,nativeFixture.masks,{...n,rgba:gold}),[]));
check('missing native evidence cannot admit new matte completion',()=>assert.deepEqual(api.D.analyzeRGBA(f.rgba,w,h,f.owners,f.masks),[]));
const cyclic={};cyclic.parent=cyclic;f.owners[0]._irrelevantLegacyProof=cyclic;
f.c.src=cyclic;f.c.currentSrc=cyclic;
const competitor=api.M.analyzeRGBA(f.rgba,w,h).find(p=>p.y>.5);assert(competitor);
const reader={currentPanels:[...f.owners,competitor],panelContours:p=>api.M.validPanel(p)?p._contours:null,getPanelImageContext:()=>({img:f.c}),displayPanelContours(p,c){return c&&(api.C.repair(c,w,h,[],f.rgba)?.contours||c);}};
api.D.installReader(reader);check('expansion absent before measured repair',()=>assert.equal(api.D.extendsDisplay(reader,f.owners[0],f.c),false));
reader.displayPanelContours(f.owners[0]);check('cyclic irrelevant proof graph does not enter bounded ownership snapshot',()=>assert.equal(api.D.extendsDisplay(reader,f.owners[0],f.c),true));
check('source-authenticated expansion admitted',()=>assert.equal(api.D.extendsDisplay(reader,f.owners[0],f.c),true));
check('forged public expansion state rejected',()=>assert.equal(api.D.extendsDisplay({...reader,_detachedCaptionsDisplay:{extended:new WeakSet(f.owners)}},f.owners[0],f.c),false));
check('different image rejects expansion',()=>assert.equal(api.D.extendsDisplay(reader,f.owners[0],cv.createCanvas(w,h)),false));
const competingX=competitor.x;competitor.x+=.01;
check('mutated competing owner rejects expansion',()=>assert.equal(api.D.extendsDisplay(reader,f.owners[0],f.c),false));
check('mutated competing owner rejects completion cache',()=>assert.deepEqual(reader.displayPanelContours(f.owners[0]),api.C.repair(f.owners[0]._contours,w,h,[],f.rgba)?.contours||f.owners[0]._contours));competitor.x=competingX;
const owners=reader.currentPanels;reader.currentPanels=[...owners];check('replaced owner generation rejects expansion',()=>assert.equal(api.D.extendsDisplay(reader,owners[0],f.c),false));reader.currentPanels=owners;
const old=owners[0].x;owners[0].x+=.01;check('mutated owner rejects expansion',()=>assert.equal(api.D.extendsDisplay(reader,owners[0],f.c),false));check('display cache rejects mutated owner geometry',()=>assert.equal(reader.displayPanelContours(owners[0]),null));owners[0].x=old;
owners.push({x:0,y:0,w:1,h:1});check('in-place owner-list mutation rejects expansion',()=>assert.equal(api.D.extendsDisplay(reader,owners[0],f.c),false));owners.pop();
f.c.src='different-source';check('same image object changed source rejects expansion',()=>assert.equal(api.D.extendsDisplay(reader,owners[0],f.c),false));f.c.src=cyclic;
check('stable cyclic source references authenticate without serialization',()=>assert.equal(api.D.extendsDisplay(reader,owners[0],f.c),true));
f.c.currentSrc={};check('replaced current source object rejects expansion',()=>assert.equal(api.D.extendsDisplay(reader,owners[0],f.c),false));f.c.currentSrc=cyclic;
f.c.src={};check('replaced source object rejects expansion',()=>assert.equal(api.D.extendsDisplay(reader,owners[0],f.c),false));f.c.src=cyclic;
const protectedResult=reader.displayPanelContours(owners[0]),originalPoint=protectedResult[0][0].x;
check('authenticated output point mutation is rejected',()=>assert.throws(()=>{protectedResult[0][0].x=-10;},TypeError));
check('authenticated output ring mutation is rejected',()=>assert.throws(()=>{protectedResult[0].push({x:-10,y:0});},TypeError));
check('authenticated output list mutation is rejected',()=>assert.throws(()=>{protectedResult.push([]);},TypeError));
check('cached authenticated result remains unchanged',()=>assert.equal(reader.displayPanelContours(owners[0])[0][0].x,originalPoint));
for(const [name,failure] of [['null',null],['empty',[]],['malformed',[[[-1,0],[1,0],[1,1],[0,1]]]]]){
 const prior=new Map(reader.currentPanels.map(p=>[p,api.C.repair(p._contours,w,h,[],f.rgba)?.contours||p._contours]));
 const failedReader={currentPanels:reader.currentPanels,panelContours:reader.panelContours,getPanelImageContext:reader.getPanelImageContext,displayPanelContours:p=>prior.get(p)};
 api.D.installReader(failedReader);const trace=api.M.tracePixelContours;api.M.tracePixelContours=()=>failure;
 try{check(name+' final tracing preserves prior contour',()=>assert.equal(failedReader.displayPanelContours(owners[0]),prior.get(owners[0])));check(name+' final tracing cannot authorize expansion',()=>assert.equal(api.D.extendsDisplay(failedReader,owners[0],f.c),false));}finally{api.M.tracePixelContours=trace;}
}
console.log(JSON.stringify({passed:true,controls:checks.length,checks},null,2));
