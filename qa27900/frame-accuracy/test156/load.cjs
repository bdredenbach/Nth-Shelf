'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
let cv;try{cv=require('@napi-rs/canvas');}catch(error){if(!process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES)throw error;cv=require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'@napi-rs/canvas'));}
const root=path.resolve(process.env.NTH_SHELF_SOURCE||path.join(__dirname,'../../..'));
const filters=['NTH_SCOPED_GUARD_CASES','NTH_SCOPED_GUARD_ONLY','NTH_SCOPED_FULL_MATRIX','NTH_DELEGATION_CACHE_ONLY','NTH_PARTIAL_FREEZE_CASES','NTH_PARTIAL_FREEZE_ONLY','NTH_EXTERIOR_READER_ONLY','NTH_GENERATED_CASES'];
function load(dir=root){
 for(const key of filters)assert(!Object.hasOwn(process.env,key),'Focused source association contract rejects inherited filter '+key);
 const calls={},reads={pixels:0,serializations:0},sourceHashes={},sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
 const json=Object.create(Object.getPrototypeOf(JSON),Object.getOwnPropertyDescriptors(JSON));json.stringify=function(...args){reads.serializations++;return JSON.stringify(...args);};
 const replacements={'panels-articulated-upper-cell.js':process.env.NTH_ARTICULATED_UPPER_MODULE,'panels-articulated-exterior-cell.js':process.env.NTH_ARTICULATED_EXTERIOR_MODULE};
 const families={'panels-firm-enclosure-groups.js':66,'panels-articulated-rim-cell.js':96,'panels-articulated-upper-cell.js':100,'panels-articulated-exterior-cell.js':103};
 const files=[...fs.readFileSync(path.join(dir,'index.html'),'utf8').matchAll(/src="(js\/(?!terminal-native-bootstrap\.js)(?:panels|terminal)[^\"]*\.js)"/g)].map(m=>m[1]);
 const source=files.map(file=>{const name=path.basename(file),bytes=fs.readFileSync(replacements[name]||path.join(dir,file));sourceHashes[file]=sha(bytes);let text=bytes.toString('utf8');if(families[name])for(const method of ['analyzeRGBA',...(families[name]===66?[]:['sourceReplay'])]){const marker='function '+method+'(';assert.equal(text.split(marker).length,2,'Exactly one observation site '+name+' '+method);text=text.replace(marker,'function '+method+'(...args){__calls["'+families[name]+'.'+method+'"]=(__calls["'+families[name]+'.'+method+'"]||0)+1;return __observed_'+method+'(...args);} function __observed_'+method+'(');}return text;}).join('\n');
 const document={createElement(tag){assert.equal(tag,'canvas');const c=cv.createCanvas(1,1),get=c.getContext.bind(c);c.getContext=function(...args){const g=get(...args);if(!g.__sourceAssociationCounted){const read=g.getImageData.bind(g);g.getImageData=function(...a){reads.pixels++;return read(...a);};g.__sourceAssociationCounted=true;}return g;};return c;}};
 const runtime=new Function('document','Image','ImageData','window','console','setTimeout','clearTimeout','localStorage','requestAnimationFrame','__calls','JSON',source+'\nreturn {P:PanelArticulatedRimCell,U:PanelArticulatedUpperCell,M:PanelArticulatedExteriorCell,F:PanelFirmEnclosureGroups,C:PanelCropRepair,provider:PanelRasterWitness};')(document,cv.Image,cv.ImageData,{},console,setTimeout,clearTimeout,{getItem:()=>null},()=>{},calls,json);
 return {...runtime,calls,reads,sourceHashes};
}
module.exports={root,cv,load};
