'use strict';
// Portable exact repository source resolver. No application code runs until load() is called.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../../..'),parentRoot=root,sha=data=>crypto.createHash('sha256').update(data).digest('hex');
const manifestBytes=fs.readFileSync(path.join(__dirname,'source-bindings.json')),manifest=JSON.parse(manifestBytes);
const rows=new Map(manifest.files.map(row=>[row.path,{...row,resolved:path.join(root,row.path)}]));
for(const key of ['NTH_SHELF_SOURCE','NTH_ARTICULATED_UPPER_MODULE','NTH_ARTICULATED_EXTERIOR_MODULE'])assert(!Object.hasOwn(process.env,key),'Repository-only test rejects source override '+key);
function read(name){const row=rows.get(name);assert(row,'Unbound source '+name);const bytes=fs.readFileSync(row.resolved);assert.equal(bytes.length,row.bytes);assert.equal(sha(bytes),row.sha256,'Source changed '+name);return bytes.toString();}
function canvas(){try{return require('@napi-rs/canvas');}catch(e){if(!process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES)throw e;return require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'@napi-rs/canvas'));}}
function load({definitionOnly=false,cityGeometryStub=null,observe96=false}={}){
 const cv=canvas(),calls={},sources=[],index=read('index.html');
 const indexed=[...index.matchAll(/src="(js\/[^\"]+\.js)"/g)].map(m=>m[1]);
 assert.deepEqual(indexed,manifest.indexedScripts.map(row=>row.path));
 const selected=indexed.filter(name=>/^js\/(?:panels[^/]*|terminal[^/]*|reader)\.js$/.test(name));
 const bootstraps=selected.filter(name=>name.endsWith('-bootstrap.js'));
 assert(selected.indexOf('js/reader.js')<selected.indexOf('js/terminal-native-bootstrap.js'));
 assert.equal(selected.at(-1),'js/panels-curved-host-native-bootstrap.js');
 const delayed=definitionOnly?selected.filter(name=>name!=='js/reader.js'&&!bootstraps.includes(name)):selected;
 const chunks=delayed.map(name=>{
  let text=read(name);sources.push({path:name,sha256:rows.get(name).sha256});
  if(cityGeometryStub&&name==='js/panels-curved-host-partition.js')return cityGeometryStub;
  if(cityGeometryStub&&name==='js/panels-curved-host-native.js')return '';
  if(observe96&&name==='js/panels-articulated-rim-cell.js'){
   const marker='function sourceReplay(';assert.equal(text.split(marker).length,2);
   text=text.replace(marker,'function sourceReplay(...args){__calls.rimReplay=(__calls.rimReplay||0)+1;return __sourceReplay(...args);} function __sourceReplay(');
  }
  return text;
 });
 const document={createElement(tag){assert.equal(tag,'canvas');return cv.createCanvas(1,1);}};
 const code=chunks.join('\n')+'\nreturn {read: expression=>eval(expression), P:PanelArticulatedRimCell, M:PanelCurvedHostNativePartition, A:PanelCurvedHostReader, W:PanelRasterWitness, C:PanelCropRepair, F:PanelFirmEnclosureGroups};';
 const value=new Function('document','Image','ImageData','window','console','setTimeout','clearTimeout','localStorage','requestAnimationFrame','clamp','btoa','atob','__calls',code)(document,cv.Image,cv.ImageData,{},console,setTimeout,clearTimeout,{getItem:()=>null},()=>{},(v,a,b)=>Math.max(a,Math.min(b,v)),s=>Buffer.from(s,'binary').toString('base64'),s=>Buffer.from(s,'base64').toString('binary'),calls);
 return {...value,cv,calls,loadedSources:sources,bootstrapPolicy:definitionOnly?'Reader and bootstrap excluded; explicit minimal detector/Reader installation required':'exact indexed runtime order',manifestSha256:sha(manifestBytes)};
}
module.exports={root,parentRoot,manifest,rows,read,load,sha,canvas};
