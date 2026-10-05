'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),zlib=require('node:zlib');
const root=path.resolve(__dirname,'../../..');
const capture=JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(__dirname,'../test33/fresh74-descriptors.json.gz'))));
const saved=capture.pages.find(p=>p.readerPage===42),page42=saved.entries;
assert.equal(page42.length,7);
assert.equal(saved.descriptorSha256,'2d53afd93eec812094eb52a3ba810cdcfea8b390981d140e77191e06127c9d0a');
const context=vm.createContext({console,setTimeout,clearTimeout,localStorage:{getItem:()=>null}});
vm.runInContext(fs.readFileSync(path.join(root,'js/panels-curved-rims.js'),'utf8'),context);
const det=vm.runInContext('PanelCurvedRims',context),copy=x=>JSON.parse(JSON.stringify(x));
for(const p of page42){assert(det.validPanel(p));assert.equal(p._curvedRimProof.network.rasterMode,undefined);}
// The saved exact descriptor comparison is a pixel-fixture test. This source
// contract protects legacy proof acceptance and bounds the new fallback mode.
let p=copy(page42[0]);p._curvedRimProof.network.rasterMode='edge-color';p._curvedRimProof.network.cleanup.mode='broad';assert(det.validPanel(p));
p=copy(page42[0]);p._curvedRimProof.network.rasterMode='anything-else';assert(!det.validPanel(p));
p=copy(page42[0]);p._curvedRimProof.network.rasterMode='edge-color';delete p._curvedRimProof.network.cleanup.mode;assert(!det.validPanel(p));
p=copy(page42[0]);p._curvedRimProof.network.model.evidence[0].matched=0;assert(!det.validPanel(p));
const source=fs.readFileSync(path.join(root,'js/panels-curved-rims.js'),'utf8');
for(const forbidden of ['Wolverine (2010-2012) 1000-042.jpg','b155ad69833884a89a172dd070a1c3b26195fa613249dfa5e02260c2fb572faa','readerPage:43'])assert(!source.includes(forbidden));
console.log(JSON.stringify({page42ProofsAccepted:page42.length,page42SavedDescriptorSha256:saved.descriptorSha256,broadModeAccepted:true,unknownModeRejected:true,broadModeRequiresBroadCleanup:true,tamperedEvidenceRejected:true,runtimeFixtureKeysAbsent:true}));
