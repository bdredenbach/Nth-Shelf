'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{fixture}=require('./chromatic-inset-fixtures.cjs');
let cv;try{cv=require('@napi-rs/canvas');}catch(_){cv=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/@napi-rs/canvas');}
const root=path.resolve(process.env.NTH_SHELF_SOURCE||path.resolve(__dirname,'../../..')),candidate=fs.existsSync(__dirname+'/panels-chromatic-inset-closure.js')?__dirname+'/panels-chromatic-inset-closure.js':root+'/js/panels-chromatic-inset-closure.js',code=fs.readFileSync(candidate,'utf8'),scripts=[...fs.readFileSync(root+'/index.html','utf8').matchAll(/src="(js\/panels[^\"]*\.js)"/g)].map(m=>m[1]).filter(p=>p!=='js/panels-chromatic-inset-closure.js');
const ctx=vm.createContext({console,window:{},document:{createElement:()=>cv.createCanvas(1,1)},Image:cv.Image,ImageData:cv.ImageData,setTimeout,clearTimeout});vm.runInContext(scripts.map(p=>fs.readFileSync(root+'/'+p,'utf8')).join('\n')+'\n'+code,ctx);const M=vm.runInContext('PanelChromaticInsetClosure',ctx),out=[];
for(const o of [{name:'base'},{name:'shifted',shift:true},{name:'mirrored',mirror:true},{name:'violet',palette:'violet'},{name:'combined',shift:true,mirror:true,palette:'violet'},{name:'larger',w:680,h:900},...['open-side','open-bottom','stacked','no-matte','edge-touch','no-rim','too-wide'].map(negative=>({name:negative,negative}))]){const f=fixture(o),e=M.evidence(f.rgba,f.w,f.h),c=e&&M.discover(e,f.w,f.h);assert.equal(!!c,!o.negative,o.name);if(c){assert.equal(c.rings.length,1);assert(c.difference<=c.g.pixels*.012);let red=0,kept=0;for(let i=0;i<c.mask.length;i++)if(f.rgba[4*i]>150&&f.rgba[4*i+1]<65&&f.rgba[4*i+2]<90){red++;kept+=c.mask[i];}assert(red>500);assert.equal(kept,red,o.name+' retains complete protruding sound-effect body');}out.push({name:o.name,accepted:!!c});}
const transparent=fixture();transparent.rgba[3]=0;assert.equal(M.evidence(transparent.rgba,transparent.w,transparent.h),null);assert.equal(M.eligible([]),false);assert.deepEqual(Array.from(M.analyzeRGBA(new Uint8ClampedArray(1),1,1,[])),[]);
// The proof unit test isolates certified-owner interfaces with public geometric
// doubles. It tests replay of generated source witnesses, never a comic image.
// Production full-detector and genuine-owner replay are separate integration gates.
const rectangle=(role,x,y,w,h)=>({role,x,y,w,h,_contours:[[{x,y},{x:x+w,y},{x:x+w,y:y+h},{x,y:y+h}]]}),prior=[rectangle('donor',.40,0,.60,1),rectangle('exclusion',.04,.26,.34,.74)],matte=vm.runInContext('PanelMatteCells',ctx),raster=vm.runInContext('PanelLocalBoundaryConsensus.raster',ctx);
function unit(){const c=vm.createContext({console,document:{createElement:()=>cv.createCanvas(1,1)},PanelMatteCells:matte,PanelCropRepair:{raster:(c,w,h)=>raster({_contours:c},w,h)},PanelLocalBoundaryConsensus:{validPanel:p=>p?.role==='donor',raster},PanelStableFrontierCells:{validPanel:p=>p?.role==='exclusion'},module:{exports:{}}});vm.runInContext(code,c);return c.module.exports;}
const U=unit(),f=fixture(),generated=U.fromSource(f.rgba,f.w,f.h,prior);assert.equal(generated.length,1,'generated source produces a proof');const saved=JSON.stringify(generated[0]);assert(unit().validPanel(JSON.parse(saved)),'fresh-context serialized proof replay');let rejected=0;
for(const [name,change] of [
 ['palette witness',p=>p._structuralGridProof.palette.hue=.123],
 ['missing source',p=>delete p._structuralGridProof.source],
 ['ink witness',p=>p._structuralGridProof.source.ink[0]=[]],
 ['paper witness',p=>p._structuralGridProof.source.paper=[]],
 ['matte witness',p=>p._structuralGridProof.source.chroma=[]],
 ['closure frontier',p=>p._structuralGridProof.geometry.thresholds[0].front[10][0]++],
 ['seed geometry',p=>p._structuralGridProof.geometry.thresholds[0].seed.box[0]++],
 ['pixel contours',p=>p._structuralGridProof.geometry.pixelContours[0][0][0]++],
 ['display contours',p=>p._contours[0][0].x+=.01],
 ['joint contour forgery',p=>{p._contours[0][0].x+=1/f.w;p._structuralGridProof.geometry.pixelContours[0][0][0]++;}],
 ['ownership',p=>p._structuralGridProof.ownership.donor=1],
 ['owners',p=>p._structuralGridProof.prior=[]],
 ['crop box',p=>p.w+=.01],
 ['alternate quad',p=>p._quad=[]]
]){const p=JSON.parse(saved);change(p);assert.equal(U.validPanel(p),false,name);rejected++;}
const img=f.c,owners=prior.concat(generated),reader={currentPanels:owners,panelContours:p=>p._contours,getPanelImageContext:()=>({img}),displayPanelContours:(p,c)=>c};U.installReader(reader);U.installReader(reader);const accepted=reader.displayPanelContours(prior[1]);assert.equal(accepted,prior[1]._contours,'accepted prior display stays identical');const isolated=reader.displayPanelContours(prior[0]),inset=reader.displayPanelContours(generated[0]),dm=raster({_contours:isolated},f.w,f.h),im=raster({_contours:inset},f.w,f.h),em=raster({_contours:accepted},f.w,f.h);for(let i=0;i<dm.length;i++){assert(!(dm[i]&&im[i]),'new source and donor are exclusive');assert(!(em[i]&&im[i]),'accepted owner is excluded');}assert.equal(reader.displayPanelContours(prior[0]),isolated,'repeat display is stable');assert.equal(reader.currentPanels,owners,'Reader context restored');reader.currentPanels=prior;assert.equal(reader.displayPanelContours(prior[0]),prior[0]._contours,'leaving recovered context retains prior display');reader.currentPanels=owners;assert.equal(reader.displayPanelContours(prior[1]),prior[1]._contours,'returning retains accepted display');
console.log(JSON.stringify({passed:true,generatedScenes:out,positiveScenes:6,rejections:7,sourceWitnessRoundTrip:true,proofTamperRejections:rejected,completeSoundEffects:true,readerIsolation:true,acceptedReaderOwnerIdentical:true,readerReentry:true,originalPixels:false}));
