'use strict';
const fs=require('node:fs'),path=require('node:path');let cv;try{cv=require('@napi-rs/canvas')}catch(_){cv=require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'@napi-rs/canvas'))}
const root=path.resolve(process.env.NTH_SHELF_SOURCE||path.join(__dirname,'../../..')),candidate=path.resolve(process.env.NTH_SHELF_CANDIDATE||path.join(root,'js/panels-round-speech-inset.js'));
const scripts=[...fs.readFileSync(root+'/index.html','utf8').matchAll(/src="(js\/panels[^\"]*\.js)"/g)].map(m=>m[1]);
const sourceFiles=scripts.map(p=>p==='js/panels-round-speech-inset.js'?candidate:path.join(root,p));if(!scripts.includes('js/panels-round-speech-inset.js'))sourceFiles.push(candidate);
function load(){return new Function('document','Image','window',sourceFiles.map(p=>fs.readFileSync(p,'utf8')).join('\n')+';return {api:PanelRoundSpeechInset,matte:PanelMatteCells,ragged:PanelRaggedGutters,atomic:PanelRoundAtomicInset};')({createElement:()=>cv.createCanvas(1,1)},cv.Image,{});}
module.exports={fs,path,cv,root,scripts,sourceFiles,candidate,load};
