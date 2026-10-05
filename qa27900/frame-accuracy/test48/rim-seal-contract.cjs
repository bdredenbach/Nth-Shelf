'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx=vm.createContext({console});vm.runInContext(fs.readFileSync(path.resolve(__dirname,'../../../js/panels-curved-rims.js'),'utf8'),ctx);const D=vm.runInContext('PanelCurvedRims',ctx),good=require('./captured-geometry.json');assert(D.validPanel(good));
const mutations={
 'missing seal':p=>delete p._curvedRimProof.network.rimSeal,
 'wrong owner':p=>p._curvedRimProof.network.rimSeal.owner++,
 'wide neck':p=>p._curvedRimProof.network.rimSeal.neck=Array(5).fill([0,0]),
 'separated neck':p=>{p._curvedRimProof.network.rimSeal.neck.push([5,5]);p._curvedRimProof.network.rimSeal.arms.push([3,3]);},
 'weak pale arms':p=>p._curvedRimProof.network.rimSeal.arms[0][0]=0,
 'mixed owners':p=>p._curvedRimProof.network.rimSeal.ownerFraction=.8,
 'excessive fill':p=>p._curvedRimProof.network.rimSeal.addedPixels=999999,
 'altered dimensions':p=>p._curvedRimProof.analysisWidth++,
 'altered contours':p=>p._contours[0][0].x+=.01,
 'legacy mode':p=>delete p._curvedRimProof.network.rasterMode,
 'downgraded proof':p=>p._curvedRimProof.version=1,
 'unknown proof':p=>p._curvedRimProof.version=3
};
for(const [name,mutate] of Object.entries(mutations)){const p=structuredClone(good);mutate(p);assert(!D.validPanel(p),name);}
const seal=good._curvedRimProof.network.rimSeal;assert.equal(seal.beforePixels+seal.addedPixels,good._curvedRimProof.pixels);
console.log(JSON.stringify({capturedProofAccepted:true,tamperedProofsRejected:Object.keys(mutations).length}));
