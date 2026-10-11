'use strict';
// Diagnostic adaptation of the pinned Test158 loader. No geometry or trust doubles.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const bindings=require('./fresh-reuse-bindings.json'),root=path.resolve(__dirname,'../../..');
const sha=a=>crypto.createHash('sha256').update(a).digest('hex');
function checked(file,expected){const bytes=fs.readFileSync(file);assert.equal(sha(bytes),expected,'Pinned input changed: '+file);return bytes;}
for(const key of Object.keys(process.env))assert(!/^NTH_/.test(key),'Repository-only public QA rejects source/case override: '+key);
let cv;try{cv=require('@napi-rs/canvas');}catch(e){if(!process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES)throw e;cv=require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'@napi-rs/canvas'));}
checked(path.join(root,bindings.fixture.path),bindings.fixture.sha256);
const {fixture}=require(path.join(root,bindings.fixture.path));
function once(text,marker,replacement){assert.equal(text.split(marker).length,2,'One exact instrumentation marker: '+marker);return text.replace(marker,replacement);}
function load(variant='candidate',options={}){
 assert.equal(variant,'candidate');
 const arm=options.arm||process.env.FRESH_REUSE_ARM||'candidate';assert(['baseline','candidate'].includes(arm));
 const calls={},reads={pixels:0,rgba:[]},sourceHashes={},instrumentedSourceHashes={},profile={rootValidationCalls:0,rootValidationMs:0};
 const control={images:{},imageRefs:{},matches:[],samples:[],retentions:[],copyFaults:[],analyzerFaults:[],holdImages:options.holdImages!==false,failCopy:options.failCopy||null,failAnalyzer:options.failAnalyzer||null,decodeHook:null,captureHook:null,lastImage:null,
  retained(version,img){this.imageRefs[version]=new globalThis.WeakRef(img);if(this.holdImages)this.images[version]=img;this.retentions.push(version);},
  snapshotFault(version){if(this.failCopy===version){this.failCopy=null;this.copyFaults.push(version);throw Error('Synthetic optional analysis snapshot allocation failure '+version);}},
  beforeAnalyze(version,args){if(this.failAnalyzer===version){this.failAnalyzer=null;this.analyzerFaults.push(version);throw Error('Synthetic genuine analyzer failure '+version);}if(args[0] instanceof Uint8ClampedArray)this.samples.push({version,w:args[1],h:args[2],sha256:sha(args[0])});},
 };
 const events=new WeakMap();
 function DiagnosticImage(...args){const img=new cv.Image(...args);const listeners=new Map();events.set(img,listeners);if(typeof img.addEventListener!=='function')Object.defineProperty(img,'addEventListener',{configurable:true,value(type,fn){if(!listeners.has(type))listeners.set(type,[]);listeners.get(type).push(fn);}});const decode=img.decode.bind(img);img.decode=async function(){await decode();if(control.decodeHook)await control.decodeHook(img);};if(control.holdImages)control.lastImage=img;return img;}
 control.emit=(img,type)=>{const listeners=events.get(img)?.get(type);assert(listeners?.length,'Synthetic event listener was registered');for(const fn of listeners)fn();};
 const index=checked(path.join(root,'index.html'),bindings.indexSha256),indexed=[...index.toString().matchAll(/src="(js\/[^\"]*\.js)"/g)].map(m=>m[1]),first=indexed.findIndex(n=>n.startsWith('js/panels')),last=indexed.indexOf('js/reader.js');assert(first>=0&&last>first);const files=indexed.slice(first,last);assert.deepEqual(files,bindings.indexedFiles);
 const versions={'panels-firm-enclosure-groups.js':66,'panels-articulated-rim-cell.js':96,'panels-articulated-upper-cell.js':100,'panels-articulated-exterior-cell.js':103};
 const source=files.map(file=>{const name=path.basename(file),version=versions[name],baseline=arm==='baseline'&&bindings.baselineHashes[file],bytes=checked(baseline?path.join(__dirname,'reference',name):path.join(root,file),baseline||bindings.sourceHashes[file]);sourceHashes[file]=sha(bytes);let text=bytes.toString();
  if(name==='panels-round-atomic-inset.js')text=once(text,'const PanelRasterWitness =','let PanelRasterWitness =');
  if(version){const method=arm==='candidate'&&[100,103].includes(version)?'analyzeCurrentRGBA':'analyzeRGBA';text=once(text,'function '+method+'(','function '+method+'(...args){__calls["'+version+'.analyzeRGBA"]=(__calls["'+version+'.analyzeRGBA"]||0)+1;__control.beforeAnalyze('+version+',args);return __observed_'+method+'(...args);} function __observed_'+method+'(');
   if(version!==66)text=once(text,'function sourceReplay(','function sourceReplay(...args){__calls["'+version+'.sourceReplay"]=(__calls["'+version+'.sourceReplay"]||0)+1;return __observed_sourceReplay(...args);} function __observed_sourceReplay(');
  }
  if(version===96)text=once(text,'function root(','function root(...args){const start=performance.now();try{return __observed_root(...args);}finally{__profile.rootValidationCalls++;__profile.rootValidationMs+=performance.now()-start;}} function __observed_root(');
  if(arm==='candidate'&&[96,100].includes(version)){
   text=once(text,'function matchesDetectedAnalysis(','function matchesDetectedAnalysis(...args){const result=__observed_matchesDetectedAnalysis(...args);__calls["'+version+'.match"]=(__calls["'+version+'.match"]||0)+1;if(result)__calls["'+version+'.hit"]=(__calls["'+version+'.hit"]||0)+1;__control.matches.push({version:'+version+',result});return result;} function __observed_matchesDetectedAnalysis(');
   const assignment=version===96?'items:[new WeakRef(out[0])]};':'items:[new WeakRef(prior[0]),new WeakRef(out[0])]};';text=once(text,assignment,assignment+'__control.retained('+version+',img);');
   text=once(text,'try{return new Uint8ClampedArray(a);}catch(_){return null;}','try{__control.snapshotFault('+version+');return new Uint8ClampedArray(a);}catch(_){return null;}');
  }
  instrumentedSourceHashes[file]=sha(text);return text;
 }).join('\n');
 const document={createElement(tag){assert.equal(tag,'canvas');const c=cv.createCanvas(1,1),get=c.getContext.bind(c);c.getContext=function(...args){const g=get(...args);if(!g.__counted){const read=g.getImageData.bind(g);g.getImageData=function(...a){reads.pixels++;const result=read(...a);reads.lastPixels=result.data;reads.rgba.push(sha(result.data));reads.captureHook?.();control.captureHook?.();return result;};g.__counted=true;}return g;};return c;}};
 const rt=new Function('document','Image','ImageData','window','console','setTimeout','clearTimeout','localStorage','requestAnimationFrame','WeakRef','__calls','__profile','__control',source+'\nreturn {P:PanelArticulatedRimCell,U:PanelArticulatedUpperCell,M:PanelArticulatedExteriorCell,F:PanelFirmEnclosureGroups,C:PanelCropRepair,provider:PanelRasterWitness,setWitness:value=>{PanelRasterWitness=value;},matte:PanelMatteCells};')(document,DiagnosticImage,cv.ImageData,{},console,setTimeout,clearTimeout,{getItem:()=>null},()=>{},options.weakRefMissing?undefined:globalThis.WeakRef,calls,profile,control);
 return {...rt,arm,calls,reads,sourceHashes,instrumentedSourceHashes,profile,control};
}
module.exports={load,cv,sha,fixture,bindings};
