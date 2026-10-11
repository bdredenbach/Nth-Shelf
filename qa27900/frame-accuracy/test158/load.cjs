'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
let cv;try{cv=require('@napi-rs/canvas');}catch(e){if(!process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES)throw e;cv=require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'@napi-rs/canvas'));}
const root=path.resolve(__dirname,'../../..'),sha=a=>crypto.createHash('sha256').update(a).digest('hex');
// Generated source only. Internal counters preserve normal provider/method identity.
// The witness binding is mutable solely for explicit absent/replaced-provider controls.
function load(variant='candidate'){
 assert.equal(variant,'candidate');
 assert(!process.env.NTH_SHELF_SOURCE||path.resolve(process.env.NTH_SHELF_SOURCE)===root,'Repository-only source binding');
 for(const key of ['NTH_ARTICULATED_UPPER_MODULE','NTH_ARTICULATED_EXTERIOR_MODULE'])assert(!Object.hasOwn(process.env,key),'Repository-only test rejects source override '+key);
 const calls={},reads={pixels:0},sourceHashes={},profile={rootValidationCalls:0,rootValidationMs:0};
 const index=fs.readFileSync(root+'/index.html');const indexed=[...index.toString().matchAll(/src="(js\/[^\"]*\.js)"/g)].map(m=>m[1]),first=indexed.findIndex(n=>n.startsWith('js/panels')),last=indexed.indexOf('js/reader.js');assert(first>=0&&last>first);const files=indexed.slice(first,last);
 const source=files.map(file=>{const name=path.basename(file),local=name==='panels-articulated-rim-cell.js',bytes=fs.readFileSync(root+'/'+file),h=sha(bytes);sourceHashes[file]=h;let text=bytes.toString();if(name==='panels-round-atomic-inset.js'){assert.equal(text.split('const PanelRasterWitness =').length,2);text=text.replace('const PanelRasterWitness =','let PanelRasterWitness =');}if(name==='panels-articulated-rim-cell.js'){for(const method of ['analyzeRGBA','sourceReplay']){const marker='function '+method+'(';assert.equal(text.split(marker).length,2);text=text.replace(marker,'function '+method+'(...args){__calls["96.'+method+'"]=(__calls["96.'+method+'"]||0)+1;return __observed_'+method+'(...args);} function __observed_'+method+'(');}if(local){assert.equal(text.split('function root(').length,2);text=text.replace('function root(','function root(...args){const start=performance.now();try{return __observed_root(...args);}finally{__profile.rootValidationCalls++;__profile.rootValidationMs+=performance.now()-start;}} function __observed_root(');}}return text;}).join('\n');
 const document={createElement(tag){assert.equal(tag,'canvas');const c=cv.createCanvas(1,1),get=c.getContext.bind(c);c.getContext=function(...args){const g=get(...args);if(!g.__counted){const read=g.getImageData.bind(g);g.getImageData=function(...a){reads.pixels++;const result=read(...a);reads.lastPixels=result.data;reads.captureHook?.();return result;};g.__counted=true;}return g;};return c;}};
 const rt=new Function('document','Image','ImageData','window','console','setTimeout','clearTimeout','localStorage','requestAnimationFrame','__calls','__profile',source+'\nreturn {P:PanelArticulatedRimCell,U:PanelArticulatedUpperCell,M:PanelArticulatedExteriorCell,F:PanelFirmEnclosureGroups,C:PanelCropRepair,provider:PanelRasterWitness,setWitness:value=>{PanelRasterWitness=value;},matte:PanelMatteCells};')(document,cv.Image,cv.ImageData,{},console,setTimeout,clearTimeout,{getItem:()=>null},()=>{},calls,profile);
 return {...rt,calls,reads,sourceHashes,profile};
}
module.exports={load,cv,sha};
