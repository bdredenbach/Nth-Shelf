'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../../..');
const src=fs.readFileSync(path.join(root,'js/panels-horizontal-paper-strips.js'),'utf8');
for(const needle of [
 "METHOD='stable-horizontal-paper-strips'",
 'prior.length===1',
 "for(const half of[0,1,2])",
 'const expected=ys.length+1',
 'Math.abs(set[k][i]-bs[1][k][i])>3',
 'p.w<.90',
 'matched.length!==1',
 'v>.72',
 'return add.length?prior.concat(add):prior'
]) assert(src.includes(needle),`missing invariant: ${needle}`);
global.PanelMatteCells=require('../../../js/panels-matte-cells.js');
global.PanelRaggedGutters=require('../../../js/panels-ragged-gutters.js');
const H=require('../../../js/panels-horizontal-paper-strips.js');
const w=300,h=450,rgba=new Uint8ClampedArray(w*h*4);for(let i=0;i<w*h;i++){rgba[i*4]=rgba[i*4+1]=rgba[i*4+2]=255;rgba[i*4+3]=255;}
function panel(y0,y1,seed){for(let y=y0;y<y1;y++)for(let x=4;x<w-4;x++){const i=(y*w+x)*4,v=(x*7+y*11+seed)%170+25;rgba[i]=v;rgba[i+1]=(v+45)%230;rgba[i+2]=(v+90)%230;}}
panel(8,132,1);panel(148,292,2);panel(310,442,3);
assert.deepEqual(H.separators(rgba,w,h),[140,301]);
const prior={x:4/w,y:8/h,w:(w-8)/w,h:(132-8)/h},add=H.analyzeRGBA(rgba,w,h,[prior]);
assert.equal(add.length,2);assert(add.every(H.validPanel));assert(add.every(p=>p._structuralGridProof.horizontalPaperStrip.halfWidths.join(',')==='0,1,2'));
assert.equal(H.analyzeRGBA(rgba,w,h,[],null).length,0);assert.equal(H.analyzeRGBA(rgba,w,h,[prior,prior],null).length,0);
const idx=fs.readFileSync(path.join(root,'index.html'),'utf8'),sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
assert(idx.indexOf('js/panels-horizontal-paper-strips.js')>idx.indexOf('js/panels-top-row-barrier.js'));
assert(idx.indexOf('js/panels-horizontal-paper-strips.js')<idx.indexOf('js/panel-map-core.js'));
assert(sw.includes('./js/panels-horizontal-paper-strips.js'));
console.log(JSON.stringify({passed:true,appendOnly:true,oneOwnerGate:true,stableBarrierWidths:true,syntheticAdditions:add.length}));
