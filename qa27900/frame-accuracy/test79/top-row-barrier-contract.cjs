'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../../..');
const src=fs.readFileSync(path.join(root,'js/panels-top-row-barrier.js'),'utf8');
for(const needle of [
 "METHOD='stable-top-row-dual-barrier'",
 "prior.length>=1&&prior.length<=4",
 "p?.y>.45",
 "PanelRaggedGutters.analyzeCooperativeRGBA(rgba,w,h,8)",
 "q.ev.length>=2",
 "stableHalfWidths:[0,1,2]",
 "maximumBoxDrift:2",
 "originalOwnerOverlap:0",
 "sourceAlreadyDetected:false",
 "if(!added.every(validPanel))return[]",
 "return add.length?prior.concat(add):prior"
]) assert(src.includes(needle),`missing invariant: ${needle}`);
const idx=fs.readFileSync(path.join(root,'index.html'),'utf8'),sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
assert(idx.indexOf('js/panels-top-row-barrier.js')>idx.indexOf('js/panels-narrow-ink-frames.js'));
assert(idx.indexOf('js/panels-top-row-barrier.js')<idx.indexOf('js/panel-map-core.js'));
assert(sw.includes('./js/panels-top-row-barrier.js'));
console.log(JSON.stringify({passed:true,appendOnly:true,lowerOwnerGate:true,dualEvidence:true,threeBarrierWidths:true}));
