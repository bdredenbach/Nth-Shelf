'use strict';
const fs=require('node:fs'),path=require('node:path');let cv;try{cv=require('@napi-rs/canvas')}catch(_){cv=require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'@napi-rs/canvas'))}
const root=path.resolve(process.env.NTH_SHELF_SOURCE||path.join(__dirname,'../../..')),candidate=path.resolve(process.env.NTH_SHELF_CANDIDATE||path.join(root,'js/panels-shared-rim-pair.js'));
const scripts=[...fs.readFileSync(root+'/index.html','utf8').matchAll(/src="(js\/panels[^\"]*\.js)"/g)].map(m=>m[1]).filter(p=>p!=='js/panels-shared-rim-pair.js');
function load(){return new Function('document','Image','window',scripts.map(p=>fs.readFileSync(root+'/'+p,'utf8')).join('\n')+'\n'+fs.readFileSync(candidate,'utf8')+';return {api:PanelSharedRimPair,matte:PanelMatteCells,grid:PanelStructuralGrid,detector:PanelDetect};')({createElement:()=>cv.createCanvas(1,1)},cv.Image,{});}
module.exports={fs,path,cv,root,scripts,candidate,load};
