'use strict';
// Optional local replay; private artwork is supplied by the caller, never in CI.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../../..');
let cv;try{cv=require('@napi-rs/canvas');}catch(e){
 if(!process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES)throw e;
 cv=require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'@napi-rs/canvas'));
}
const [inputDir,outputFile,baselineFile]=process.argv.slice(2);
if(!inputDir||!outputFile){console.error('Usage: node native-corpus.cjs EXTRACTED_IMAGE_DIRECTORY OUTPUT.json [BASELINE.json]');process.exit(2);}
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const scripts=[...html.matchAll(/src="(js\/(?!terminal-native-bootstrap\.js)(?:panels|terminal)[^\"]*\.js)"/g)].map(m=>m[1]);
const source=scripts.filter(p=>baselineFile||!p.endsWith('/panels-context-cells.js')).map(p=>fs.readFileSync(path.join(root,p),'utf8')).join('\n');
const names=[...new Set([...source.matchAll(/(?:const|class) (Panel\w+)\s*[={]/g)].map(m=>m[1]))];
const modules=new Function('document','Image','ImageData','window',source+'\nreturn{'+names.join(',')+'};')({createElement:()=>cv.createCanvas(1,1)},cv.Image,cv.ImageData,{});
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):/\.(jpe?g|png|webp)$/i.test(e.name)?[path.join(dir,e.name)]:[]);}
const files=walk(path.resolve(inputDir)).sort(),baseline=baselineFile?JSON.parse(fs.readFileSync(baselineFile,'utf8')):null,results=[];
(async()=>{
 for(const file of files){
  const key=path.relative(path.resolve(inputDir),file),t=Date.now();
  const panels=await modules.PanelDetect.detect(fs.readFileSync(file));
  const old=baseline?.find(r=>r.key===key);
  if(baseline){assert(old,'Missing baseline: '+key);assert.deepEqual(JSON.parse(JSON.stringify(panels.slice(0,old.panels.length))),old.panels,'Prior geometry changed: '+key);assert(panels.slice(old.panels.length).every(modules.PanelContextCells.validPanel),'Invalid addition: '+key);}
  results.push({key,panels,ms:Date.now()-t});fs.writeFileSync(outputFile,JSON.stringify(results));
  console.log(key,(old?old.panels.length+' -> ':'')+panels.length);
 }
 if(baseline)assert.equal(baseline.length,results.length,'Corpus size changed');
 console.log(JSON.stringify({pages:results.length,owners:results.reduce((s,r)=>s+r.panels.length,0),environment:'@napi-rs/canvas',mode:baseline?'Test83 comparison':'baseline with new route disabled'}));
})().catch(e=>{console.error(e);process.exitCode=1;});
