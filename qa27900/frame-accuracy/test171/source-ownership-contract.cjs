'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const cv=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/@napi-rs/canvas'),root=path.resolve(__dirname,'../../..');
const code=['panels-matte-cells','panels-colored-rims','panels-source-layout'].map(n=>fs.readFileSync(root+'/js/'+n+'.js','utf8')).join('\n');
const P=new Function('document',code+';return PanelSourceLayout;')({createElement:()=>cv.createCanvas(1,1)}),rows=[];
const w=560,h=800,canvas=cv.createCanvas(w,h),g=canvas.getContext('2d');
g.fillStyle='#31577b';g.fillRect(0,0,w,h);const grad=g.createLinearGradient(30,50,350,450);grad.addColorStop(0,'#6796c2');grad.addColorStop(1,'#d9b78a');g.fillStyle=grad;g.fillRect(30,50,320,400);g.strokeStyle='black';g.lineWidth=5;g.strokeRect(30,50,320,400);
// Two independent caption bodies and small legible ink marks, away from rims.
for(const y of [110,260]){g.fillStyle='white';g.fillRect(60,y,130,36);g.fillStyle='black';for(let k=0;k<12;k++)g.fillRect(64+k*10,y+5,4,15);}
const rgba=canvas.getContext('2d').getImageData(0,0,w,h).data,cell=P.analyzeRGBA(rgba,w,h)[0];assert(cell);
const hole=y=>[{x:64/w,y:(y+5)/h},{x:88/w,y:(y+5)/h},{x:88/w,y:(y+20)/h},{x:64/w,y:(y+20)/h}];
function prior(holes=2){const base=JSON.parse(JSON.stringify(cell));return {...base,_identitySource:'independent-prior-source',_contours:[base._contours[0],...([110,260].slice(0,holes).map(hole))]};}
function check(name,fn){fn();rows.push({name,passed:true});}
(async()=>{const img=new cv.Image();img.src=canvas.toBuffer('image/png');await img.decode();
const old=prior(),original=JSON.stringify(old),upstream=[old],completed=P.refineImage(img,upstream);
check('two ink-bearing paper bodies justify complete measured frame',()=>{assert(!completed.includes(old));assert.equal(completed.length,1);assert(P.validPanel(completed[0]));assert.equal(JSON.stringify(old),original);assert.equal(upstream[0],old);});
check('completion is source geometry and survives serialized replay',()=>{assert.deepEqual(completed[0]._contours,cell._contours);assert(P.validateImage(JSON.parse(JSON.stringify(completed[0])),img));});
check('one clipped body keeps protected owner',()=>{const q=prior(1);assert.equal(P.refineImage(img,[q])[0],q);});
check('complete paper keeps existing proof',()=>{const q=prior(0);assert.equal(P.refineImage(img,[q])[0],q);});
check('larger ownership loss is not paper completion',()=>{const q=prior();q._contours.push([{x:.10,y:.25},{x:.50,y:.25},{x:.50,y:.40},{x:.10,y:.40}]);assert.equal(P.refineImage(img,[q])[0],q);});
check('non-equivalent bounds do not replace a smaller inset',()=>{const q=prior();q.w*=.5;assert.equal(P.refineImage(img,[q])[0],q);});
check('overlapping protected owner vetoes replacement',()=>{const q=prior(),other=prior(0),ps=P.refineImage(img,[q,other]);assert(ps.includes(q));assert(ps.includes(other));});
check('possible smaller legacy inset vetoes completion',()=>{const q=prior(),child={x:.15,y:.20,w:.1,h:.1,_identitySource:'v99'},ps=P.refineImage(img,[q,child]);assert(ps.includes(q));});
check('null comparison points keep prior owner',()=>{const q=prior();q._contours[0][0]=null;assert.equal(P.refineImage(img,[q])[0],q);});
check('malformed comparison contours keep prior owner',()=>{const q=prior();q._contours[0][0].x=NaN;assert.equal(P.refineImage(img,[q])[0],q);});
console.log(JSON.stringify({passed:true,controls:rows.length,rows},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
