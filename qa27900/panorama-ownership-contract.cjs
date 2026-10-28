'use strict';
// Synthetic upstream owners isolate175. Real171/172 qualification uses separate source replay.
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const code=fs.readFileSync(path.join(__dirname,'../js/panels-panorama-ownership.js'),'utf8');
const kernel=new Function('RULES',code.slice(code.indexOf('  function maskFromPanel'),code.indexOf(' function stateRGBA'))+';return{maskFromPanel,traceMask,enclosed,refineMasks};')({maxBoundaryEdges:200000,seamBrightness:180,seamResidual:8,seamSupport:.08,railFraction:.75,maxRailThickness:.04,maxOffset:.06,maxEndpointGap:5,maxEndpointDistance:8,maxEnclosedFraction:.15});
const w=400,h=300;function fixture(){const a=new Uint8ClampedArray(w*h*4),m=new Uint8Array(w*h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const j=4*(y*w+x);a.set([210,230,240,255],j);if(x>=80&&x<320&&y>=(x<202?88:82)&&y<200){m[y*w+x]=1;a.set([180,140,100,255],j);}}
 for(let y=84;y<130;y++)for(let x=(y<92?199:150);x<202;x++){m[y*w+x]=0;a.set([255,250,200,255],4*(y*w+x));}
 for(let y=88;y<92;y++)for(let x=80;x<199;x++)a.set([20,20,20,255],4*(y*w+x));
 for(let y=82;y<86;y++)for(let x=202;x<320;x++)a.set([20,20,20,255],4*(y*w+x));
 for(let y=0;y<h;y++)a.set([255,255,255,255],4*(y*w+201));
 const shape=kernel.traceMask(m,w,h);assert(shape);const inset={_contours:shape.polygons.map(r=>r.map(([x,y])=>({x:x/w,y:y/h})))};
 const parent={x:10/w,y:10/h,w:380/w,h:280/h,_contours:[[[10,10],[390,10],[390,290],[10,290]].map(([x,y])=>({x:x/w,y:y/h}))]};return{a,m,inset,parent};}
const f=fixture(),reader={panelContours(){},displayPanelContours(){}},grid={validPanel(){}},geometry={refine(){}};const initial=[reader.panelContours,reader.displayPanelContours,grid.validPanel,geometry.refine];let sourceAllowed=true,multiple=false;
const upstream={supplementImage(){return sourceAllowed?(multiple?[f.inset,f.inset]:[f.inset]):[];},validateImage(p){return sourceAllowed&&p===f.inset;}};
const parent={analyzeRGBA(){return sourceAllowed?[f.parent]:[];},validateRGBA(p){return sourceAllowed&&p===f.parent;}};
const document={createElement(){let im;return{getContext(){return{drawImage(x){im=x;},getImageData(){return{data:im.data};}};}};}};
const api=new Function('document','PanelHostBackgroundIslands','PanelSupportedLandscape','Reader','PanelStructuralGrid','PanelGeometry',code+';return PanelPanoramaOwnership;')(document,upstream,parent,reader,grid,geometry);
function image(){const listeners={};return{src:'synthetic',currentSrc:'synthetic',naturalWidth:w,naturalHeight:h,complete:true,data:f.a,addEventListener(n,fn){(listeners[n]??=[]).push(fn);},emit(n){for(const fn of listeners[n]||[])fn();}};}
let count=0;function check(name,fn){fn();count++;console.log('ok',name);}const img=image();let p;
check('inert module preserves every legacy function identity',()=>assert.deepEqual([reader.panelContours,reader.displayPanelContours,grid.validPanel,geometry.refine],initial));
check('source-derived narrow endpoint closure admitted',()=>{[p]=api.analyzeImage(img);assert(p);assert.equal(p._structuralGridProof.version,175);assert(p._structuralGridProof.evidence.newEnclosedPixels>0);});
check('parent original contours and box preserved exactly',()=>{assert.deepEqual(p._contours.slice(0,f.parent._contours.length),f.parent._contours);for(const k of['x','y','w','h'])assert.equal(p[k],f.parent[k]);});
check('issued object deeply frozen and source validated',()=>{assert(Object.isFrozen(p));assert(Object.isFrozen(p._contours[0][0]));assert(api.validateImage(p,img));assert.equal(api.panelContours(p,img),p._contours);});
check('private render plan preserves parent prefix and exact issued exclusion rings',()=>{const plan=api.renderPlan(p,img);assert(plan);assert(Object.isFrozen(plan));assert(Object.isFrozen(plan.parentContours));assert(Object.isFrozen(plan.exclusionContours));assert.deepEqual(plan.parentContours,f.parent._contours);assert.deepEqual(plan.parentContours.concat(plan.exclusionContours),p._contours);assert.equal(api.renderPlan(p,img),plan);assert.equal(api.renderPlan(plan,img),null);});
check('forged copied or sourceless render plans rejected',()=>{assert.equal(api.renderPlan({...p},img),null);assert.equal(api.renderPlan(JSON.parse(JSON.stringify(p)),img),null);assert.equal(api.renderPlan(p,null),null);});
check('copies and serialized proofs rejected',()=>{assert(!api.validPanel({...p}));assert(!api.validateImage(JSON.parse(JSON.stringify(p)),img));});
check('all reserved claim forms fail closed',()=>{for(const q of[{_structuralGridProof:{version:175}},{_structuralGridProof:{method:'source-supported-panorama-inset-exclusion'}},{_geometryType:'panorama-ownership'},{_structuralGridProof:{version:103},_geometryType:'panorama-ownership'}]){assert(api.isClaim(q));assert(!api.validPanel(q));assert.equal(api.panelContours(q,img),null);}assert(!api.isClaim({old:true}));});
check('hole miss cannot restore broad source parent',()=>{assert(api.hasSourceCandidate(img));assert.equal(api.findMissCandidate(img,.45,.35),null);assert(api.hasSourceCandidate(img));assert.equal(api.findMissCandidate(img,.85,.8),p);});
check('novel synthetic bridge path pixels are retained outside original inset',()=>{const mask=kernel.maskFromPanel(p,w,h);const proof=p._structuralGridProof.evidence;assert(proof.novelBridgePixelsRetained>0);for(let y=85;y<90;y++)if(!f.m[y*w+199])assert(mask[y*w+199]);});
check('loading/error and changed sameURI source invalidate',()=>{img.complete=false;assert(!api.validateImage(p,img));img.complete=true;img.emit('error');assert(!api.validateImage(p,img));img.emit('load');assert(api.validateImage(p,img));img.data=f.a.slice();img.data[0]^=1;img.emit('load');assert(!api.validateImage(p,img));assert.equal(api.renderPlan(p,img),null);});
check('missing or ambiguous independently owned inset abstains',()=>{sourceAllowed=false;assert.deepEqual(api.analyzeImage(image()),[]);sourceAllowed=true;multiple=true;assert.deepEqual(api.analyzeImage(image()),[]);multiple=false;});
check('transparent and oversized source rejected',()=>{const im=image();im.data=f.a.slice();im.data[3]=0;assert.deepEqual(api.analyzeImage(im),[]);const huge=image();huge.naturalWidth=6001;assert.deepEqual(api.analyzeImage(huge),[]);});
check('no observed seam or missing rim refuses closure',()=>{for(const kind of['seam','rail']){const a=f.a.slice();if(kind==='seam'){for(let i=0;i<a.length;i+=4)if(a[i]>=120)a.set([210,230,240,255],i);}else{for(let y=82;y<86;y++)for(let x=202;x<320;x++)a.set([180,140,100,255],4*(y*w+x));}const im=image();im.data=a;assert.equal(api.analyzeImage(im).length,0,kind);}});
check('early contour allocation cap fails closed',()=>{const tiny=new Function('RULES',code.slice(code.indexOf('  function maskFromPanel'),code.indexOf(' function enclosed'))+';return traceMask;')({maxBoundaryEdges:3});assert.equal(tiny(Uint8Array.from([1,1,1,1]),2,2),null);});
console.log(JSON.stringify({passed:count,syntheticUpstreamMocks:true,actualReaderNotTested:true}));
