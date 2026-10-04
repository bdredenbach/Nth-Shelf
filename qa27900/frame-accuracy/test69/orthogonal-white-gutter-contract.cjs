'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
global.PanelMatteCells=require('../../../js/panels-matte-cells.js');
global.PanelRaggedGutters=require('../../../js/panels-ragged-gutters.js');
global.PanelOrthogonalWhiteGutters=require('../../../js/panels-orthogonal-white-gutters.js');
const S=require('../../../js/panels-structural-grid.js');

function page({misalign=false,bridge=false}={}){
 const w=400,h=600,a=new Uint8ClampedArray(w*h*4);
 for(let i=0;i<w*h;i++){a[i*4]=a[i*4+1]=a[i*4+2]=250;a[i*4+3]=255;}
 const set=(x,y,r,g,b)=>{if(x<0||y<0||x>=w||y>=h)return;const i=(y*w+x)*4;a[i]=r;a[i+1]=g;a[i+2]=b;};
 const rects=[[20,20,190,280],[210,20,380,280],[20,310,190,580],[210,misalign?360:310,380,580]];
 for(let k=0;k<rects.length;k++){const [x0,y0,x1,y1]=rects[k];for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const v=40+((x*7+y*11+k*31)%170);set(x,y,v,Math.min(230,v+20),Math.max(10,v-10));}}
 if(bridge)for(let y=290;y<300;y++)for(let x=0;x<w;x++)set(x,y,80,80,80);
 return {a,w,h};
}
const good=page(),source=PanelRaggedGutters.analyzeRGBA(good.a,good.w,good.h);
assert.equal(source.length,4);assert(source.every(p=>p._structuralGridProof.version===18&&PanelRaggedGutters.validPanel(p)));
const out=PanelOrthogonalWhiteGutters.refinePanels(source);
assert.equal(out.length,4);assert(out.every(p=>p._structuralGridProof.version===26&&p._structuralGridProof.method==='orthogonal-white-gutter-grid'&&PanelOrthogonalWhiteGutters.validPanel(p)&&S.validPanel(p)));
for(let i=0;i<out.length;i++){for(const k of ['x','y','w','h'])assert.equal(out[i][k],source[i][k]);assert.deepEqual(out[i]._contours,source[i]._contours);assert.deepEqual(out[i]._structuralGridProof.sourceProof,source[i]._structuralGridProof);}
assert.equal(PanelOrthogonalWhiteGutters.refinePanels(PanelRaggedGutters.analyzeRGBA(page({misalign:true}).a,400,600)).length,0);
assert.equal(PanelOrthogonalWhiteGutters.refinePanels(PanelRaggedGutters.analyzeRGBA(page({bridge:true}).a,400,600)).length,0);

const clone=v=>JSON.parse(JSON.stringify(v)),base=out[0];let tampered=0;
for(const mutate of [
 p=>p._structuralGridProof.version=27,
 p=>p._structuralGridProof.method='other',
 p=>p._structuralGridProof.connected=false,
 p=>p._geometryType='ragged-gutter-cells',
 p=>p._structuralGridProof.sourceProof.version=19,
 p=>p._structuralGridProof.sourceProof.palette.paper=false,
 p=>p._structuralGridProof.orthogonal.rowCount=1,
 p=>p._structuralGridProof.orthogonal.bboxFill=.2,
 p=>p._structuralGridProof.orthogonal.seedFill=.2,
 p=>p._structuralGridProof.orthogonal.rows[0].indices[0]=99,
 p=>p._structuralGridProof.orthogonal.rows[1].verticalGapFromPrevious=.5,
 p=>p.x+=.01
]){const p=clone(base);mutate(p);assert.equal(PanelOrthogonalWhiteGutters.validPanel(p),false);tampered++;}

const reader=fs.readFileSync(path.resolve(__dirname,'../../../js/reader.js'),'utf8'),geometry=fs.readFileSync(path.resolve(__dirname,'../../../js/panels-geometry.js'),'utf8'),panels=fs.readFileSync(path.resolve(__dirname,'../../../js/panels.js'),'utf8');
assert([21,22,23,24,25,26].every(v=>JSON.parse(reader.match(/(\[[\d,]+\])\.includes\(panel\._structuralGridProof\?\.version\)/)[1]).includes(v)));
assert(geometry.includes('[21,22,23,24,25,26].includes(panel._structuralGridProof?.version)'));
assert(panels.includes('PanelOrthogonalWhiteGutters.refinePanels(panels,log)'));
console.log(JSON.stringify({passed:true,sourceOwners:source.length,proof26Owners:out.length,rows:out[0]._structuralGridProof.orthogonal.rowCount,tampered}));
