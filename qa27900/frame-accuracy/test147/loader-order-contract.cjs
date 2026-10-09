"use strict";
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict'),root=fs.mkdtempSync(path.join(os.tmpdir(),'shared-seam-loader-')),before={...process.env};
fs.mkdirSync(root+'/js');
const candidate=path.resolve(process.env.NTH_SHELF_CANDIDATE||path.join(__dirname,'../../../js/panels-shared-seam-children.js')),bridge=path.resolve(process.env.NTH_SHELF_BRIDGE||path.join(__dirname,'../../../js/panels-shared-seam-reader.js')),dependencies=path.resolve(process.env.NTH_SHELF_DEPENDENCIES||path.join(__dirname,'../../../js')),rounded=path.join(dependencies,'panels-rounded-crowd-strip.js'),roundedReader=path.join(dependencies,'panels-rounded-crowd-reader.js');
try{
 fs.writeFileSync(root+'/js/panels-pre.js','const ProbeBefore90=1;');
 fs.writeFileSync(root+'/js/panels-after90.js','const ProbeAfter90=PanelRoundedCrowdStrip.VERSION;');
 fs.writeFileSync(root+'/js/panels-after91.js','const ProbeAfter91=PanelSharedSeamChildren.VERSION;');
 process.env.NTH_SHELF_SOURCE=root;process.env.NTH_SHELF_CANDIDATE=candidate;process.env.NTH_SHELF_BRIDGE=bridge;process.env.NTH_SHELF_DEPENDENCIES=dependencies;
 const fresh=()=>{delete require.cache[require.resolve('./load.cjs')];return require('./load.cjs');};
 fs.writeFileSync(root+'/index.html',['js/panels-pre.js','js/panels-rounded-crowd-strip.js','js/panels-after90.js','js/panels-rounded-crowd-reader.js','js/panels-shared-seam-children.js','js/panels-after91.js','js/panels-shared-seam-reader.js'].map(p=>`<script src="${p}"></script>`).join('\n'));
 let h=fresh();assert.deepEqual(h.sourceFiles,[root+'/js/panels-pre.js',rounded,root+'/js/panels-after90.js',roundedReader,candidate,root+'/js/panels-after91.js',bridge]);
 assert.deepEqual(new Function(h.sourceFiles.map(p=>fs.readFileSync(p,'utf8')).join('\n')+';return [ProbeAfter90,ProbeAfter91];')(),[90,91]);
 fs.writeFileSync(root+'/index.html','<script src="js/panels-pre.js"></script>');h=fresh();assert.deepEqual(h.sourceFiles,[root+'/js/panels-pre.js',rounded,roundedReader,candidate,bridge]);
 assert.deepEqual(new Function(h.sourceFiles.map(p=>fs.readFileSync(p,'utf8')).join('\n')+';return [PanelRoundedCrowdStrip.VERSION,PanelSharedSeamChildren.VERSION];')(),[90,91]);
 console.log(JSON.stringify({passed:true,indexedOverridesPreservePositions:true,dependentRunsAfterAncestor:true,absentCandidatesAppendOnce:true}));
}finally{for(const k of ['NTH_SHELF_SOURCE','NTH_SHELF_CANDIDATE','NTH_SHELF_BRIDGE','NTH_SHELF_DEPENDENCIES'])if(before[k]===undefined)delete process.env[k];else process.env[k]=before[k];fs.rmSync(root,{recursive:true,force:true});}
