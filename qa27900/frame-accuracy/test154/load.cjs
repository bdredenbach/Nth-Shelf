'use strict';
const fs=require('node:fs'),path=require('node:path');
let cv;try{cv=require('@napi-rs/canvas')}catch(error){if(!process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES)throw error;cv=require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'@napi-rs/canvas'))}
const root=path.resolve(process.env.NTH_SHELF_SOURCE||path.join(__dirname,'../../..'));
function load(dir,ImageOverride=cv.Image) {
 const calls={atomic:0,speech:0}, files=[...fs.readFileSync(path.join(dir,'index.html'),'utf8').matchAll(/src="(js\/panels[^\"]*\.js)"/g)].map(m=>m[1]);
 const source=files.map(file=>{let s=fs.readFileSync(path.join(dir,file),'utf8');for(const f of ['atomic','speech'])if(file===`js/panels-round-${f}-inset.js`){const name=s.includes('function analyzeSourceRGBA(')?'analyzeSourceRGBA':'analyzeRGBA';s=s.replace('function '+name+'(',`function observed${f}Analysis(`);s+=`\n`;// Insert the observer inside the same module closure.
 const at=s.indexOf(`function observed${f}Analysis(`);
 s=s.slice(0,at)+`function ${name}(...a){calls.${f}++;return observed${f}Analysis(...a)}\n`+s.slice(at);
 }return s;}).join('\n');
 return new Function('document','Image','window','calls',source+';return {atomic:PanelRoundAtomicInset,speech:PanelRoundSpeechInset,ragged:PanelRaggedGutters,provider:PanelRasterWitness,factory:PanelRoundSourceIdentity,calls};')({createElement:()=>cv.createCanvas(1,1)},ImageOverride,{},calls);
}
module.exports={root,cv,load};
