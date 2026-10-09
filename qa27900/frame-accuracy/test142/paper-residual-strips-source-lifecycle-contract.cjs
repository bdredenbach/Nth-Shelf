'use strict';
// Public generated cache-boundary unit contract. All source pixels and masks
// are drawn here. Ancestor certification is a controlled adapter: this tests
// the proof84 implementation, real seam/strip discovery, classified evidence
// replay, live image regeneration and Reader cache invalidation. The separate
// private source integration contract covers full historical ancestor proofs.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{fixture}=require('./paper-residual-strips-generated-fixture.cjs');
let cv;try{cv=require('@napi-rs/canvas');}catch(error){if(!process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES)throw error;cv=require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'@napi-rs/canvas'));}
const root=path.resolve(process.env.NTH_SHELF_SOURCE||path.join(__dirname,'../../..')),modulePath=process.env.NTH_PAPER_RESIDUAL_MODULE||path.join(root,'js/panels-paper-residual-strips.js'),ctx=vm.createContext({console,document:{createElement:()=>cv.createCanvas(1,1)}}),get=n=>vm.runInContext(n,ctx),clone=x=>JSON.parse(JSON.stringify(x));
for(const name of ['panels-colored-rims.js','panels-matte-cells.js','panels-upper-paper-separation.js'])vm.runInContext(fs.readFileSync(path.join(root,'js',name),'utf8'),ctx);
const U=get('PanelUpperPaperSeparation'),Matte=get('PanelMatteCells'),f=fixture(cv,0),w=f.width,h=f.height,surface=cv.createCanvas(w,h),g=surface.getContext('2d');g.putImageData(new cv.ImageData(f.rgba,w,h),0,0);
const maskContours=mask=>Matte.tracePixelContours(mask,w,h,1).map(r=>r.map(([x,y])=>({x:x/w,y:y/h}))),seam=U.discoverRGBA(f.rgba,w,h,f.group);assert(seam,'real generated seam discovery');
const prior=Array.from({length:5},(_,k)=>({_fixtureOwner:k,_contours:maskContours(k===4?f.group:Uint8Array.from({length:w*h},(_,i)=>+(i%w>=20+k*120&&i%w<85+k*120&&(i/w|0)>=h-80&&(i/w|0)<h-20))),_structuralGridProof:{analysisWidth:w,analysisHeight:h}}));
const masks=prior.map((p,k)=>k===4?seam.mask:Uint8Array.from({length:w*h},(_,i)=>+(i%w>=20+k*120&&i%w<85+k*120&&(i/w|0)>=h-80&&(i/w|0)<h-20))),curves=masks.map(maskContours),same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const raster=contours=>{const c=cv.createCanvas(w,h),q=c.getContext('2d');q.fillStyle='#fff';q.beginPath();for(const r of contours){r.forEach((p,k)=>k?q.lineTo(p.x*w,p.y*h):q.moveTo(p.x*w,p.y*h));q.closePath();}q.fill('evenodd');const a=q.getImageData(0,0,w,h).data;return Uint8Array.from({length:w*h},(_,i)=>+(a[4*i+3]>=128));};
ctx.PanelLandscapeUpperGroups={validPanel:p=>p?._fixtureOwner===4,analyzeRGBA:(a,W,H,owners)=>W===w&&H===h&&same(owners,prior.slice(0,4))&&same(Array.from(a),Array.from(f.rgba))?[prior[4]]:[]};
ctx.PanelGeometryOrthogonal={_provenContours:p=>Number.isInteger(p?._fixtureOwner)&&p._fixtureOwner>=0&&p._fixtureOwner<5};
ctx.PanelLocalBoundaryConsensus={raster:p=>p?._fixtureOwner===4?f.group.slice():raster(p._contours)};ctx.PanelCropRepair={raster};
vm.runInContext(fs.readFileSync(modulePath,'utf8'),ctx);const M=get('PanelPaperResidualStrips'),original=M.analyzeRGBA(f.rgba,w,h,prior);assert.equal(original.length,2);assert(original.every(M.validPanel),'real persisted child validation');const restored=clone(original);assert(restored.every(M.validPanel),'JSON-restored classified proofs replay');
require('./source-lifecycle-cases.cjs')({cv,M,ctx,prior,original,w,h,surface,curves,masks,raster,cacheKey:'_paperResidualStrips'}).then(result=>console.log(JSON.stringify({...result,ancestorCertificationAdapter:true,realSourceSeamStripProofReplay:true,pairInvalidationAtomic:true}))).catch(error=>{console.error(error);process.exitCode=1;});
