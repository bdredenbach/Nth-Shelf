'use strict';
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../../..'),files=[...fs.readFileSync(root+'/index.html','utf8').matchAll(/src="(js\/[^\"]+\.js)"/g)].map(m=>m[1]).filter(p=>/^js\/(?:panels[^/]*|terminal[^/]*)\.js$/.test(p)&&!p.endsWith('-bootstrap.js'));
const N=new Function('window','btoa','atob',files.map(p=>fs.readFileSync(root+'/'+p,'utf8')).join('\n')+';return PanelCloudRimComposition;')({},s=>Buffer.from(s,'binary').toString('base64'),s=>Buffer.from(s,'base64').toString('binary'));
const prior=[{_structuralGridProof:{version:67}},{_structuralGridProof:{version:98,index:0}},{_structuralGridProof:{version:98,index:1}}],rows=[];
function check(name,fn){fn();rows.push({name,passed:true});}
check('ordered root and terminal pair are required',()=>{assert(N.eligible(prior));assert(!N.eligible(prior.slice(1)));assert(!N.eligible([prior[0],prior[2],prior[1]]));assert(!N.eligible(prior.concat(prior[1])));});
check('shape-only claims cannot issue structural authority',()=>{assert(!N.validPanel({_geometryType:N.TYPE,_structuralGridProof:{version:N.VERSION,method:N.METHOD}}));assert(!N.validPanel(prior[0]));});
check('there is no public native source issuer',()=>{assert.equal(N.issue,undefined);assert.equal(N.supplementImage,undefined);});
check('invalid analysis dimensions defer before source work',()=>{assert.equal(N.geometry(new Uint8ClampedArray(400),10,10,prior),null);});
check('a nonopaque source cannot yield compartments',()=>{assert.equal(N.analyzeRGBA(new Uint8ClampedArray(780*1200*4),780,1200,prior),null);});
check('uniform paper cannot prove sky, circle, or cells',()=>{const a=new Uint8ClampedArray(780*1200*4).fill(255);assert.equal(N.analyzeRGBA(a,780,1200,prior),null);});
check('uniform ink cannot prove a compound layout',()=>{const a=new Uint8ClampedArray(780*1200*4);for(let i=3;i<a.length;i+=4)a[i]=255;assert.equal(N.analyzeRGBA(a,780,1200,prior),null);});
console.log(JSON.stringify({passed:true,cases:rows.length,rows,qualification:'Synthetic rejection and scope controls. Real geometry and native Reader tested privately.'},null,2));
