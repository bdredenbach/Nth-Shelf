'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const ctx=vm.createContext({console,window:{},localStorage:{getItem(){return null;}},requestAnimationFrame(){},clamp01:v=>Math.max(0,Math.min(1,v))});
for(const f of ['panels-closed-frames.js','bubbles.js','panels-overlap-frames.js','panels-geometry-orthogonal.js','panels-geometry.js','reader.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../js',f),'utf8'),ctx);
const {overlap,ortho,geometry,reader}=vm.runInContext('({overlap:PanelOverlapFrames,ortho:PanelGeometryOrthogonal,geometry:PanelGeometry,reader:Reader})',ctx);
const w=600,h=900,matte=[100,110,90],art=[160,150,140],black=[20,20,20],parent={x:20/w,y:20/h,w:580/w,h:380/h};
function fill(a,x0,y0,x1,y1,color){for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)a.set([...color,255],(y*w+x)*4);}
function box(a,x0,y0,x1,y1){fill(a,x0,y0,x1,y1,black);fill(a,x0+2,y0+2,x1-2,y1-2,art);}
function fixture(){const a=new Uint8ClampedArray(w*h*4);fill(a,0,0,w-1,h-1,matte);box(a,20,20,330,400);box(a,310,40,599,180);box(a,310,196,599,380);return a;}
const detect=a=>overlap.analyzeRGBA(a,w,h,[parent]);
(async()=>{
 const a=fixture(),frames=detect(a);assert.equal(frames.length,3,'complete synthetic T-junction layout');
 reader.panelZoomEnabled=true;reader.currentPanels=frames;
 assert.equal(reader.findPanelAt(.3,.2)._overlapProof.index,0,'rear interior');
 assert.equal(reader.findPanelAt(320/w,100/h)._overlapProof.index,1,'covered rear area selects upper foreground');
 assert.equal(reader.findPanelAt(320/w,250/h)._overlapProof.index,2,'covered rear area selects lower foreground');
 assert.equal(reader.findPanelAt(320/w,188/h)._overlapProof.index,0,'gap between front panels belongs to rear');
 for(const p of frames){const held=await geometry.refine(null,p);assert.deepEqual(JSON.parse(JSON.stringify(held._outline)),JSON.parse(JSON.stringify(p._outline)));}
 const negatives=[
  ['missing upper exposed rear rail',a=>fill(a,326,22,335,37,matte)],
  ['missing middle exposed rear rail',a=>fill(a,326,183,335,193,matte)],
  ['missing lower exposed rear rail',a=>fill(a,326,383,335,397,matte)],
  ['missing left border',a=>fill(a,16,30,25,390,matte)],
  ['missing rear bottom',a=>fill(a,22,396,327,404,matte)],
  ['broken lower foreground side',a=>fill(a,306,230,315,300,art)],
  ['broken foreground horizontal border',a=>fill(a,370,176,450,184,art)],
  ['unproved blank caption crossing the rail',a=>{fill(a,270,65,355,120,black);fill(a,272,67,353,118,[245,245,245]);}],
  ['extra foreground inset',a=>box(a,410,250,540,330)]
 ];
 for(const[name,mutate]of negatives){const copy=fixture();mutate(copy);assert.equal(detect(copy).length,0,name);}
 const proof=frames[0]._overlapProof;
 for(const q of [
  [{x:.1,y:.1},{x:.8,y:.8},{x:.8,y:.1},{x:.1,y:.8}],
  [{x:.1,y:.1},{x:.2,y:.2},{x:.3,y:.3},{x:.4,y:.4}],
  [{x:NaN,y:.1},{x:.8,y:.1},{x:.8,y:.8},{x:.1,y:.8}],
  [{x:.1,y:.1},{x:.8,y:.1},{x:.8,y:.1},{x:.1,y:.8}]
 ])assert.equal(ortho._provenOutline({_outline:q,_overlapProof:proof}),null,'invalid polygon');
 assert.equal(ortho._provenOutline({...frames[0],_overlapProof:{...proof,connected:false}}),null);
 assert.equal(overlap.analyzeRGBA(a,w,h,[{...parent,w:NaN}]).length,0);
 console.log('Overlap frames passed: three synthetic visible outlines, four ownership probes, geometry preservation, nine missing-border/inset/caption negatives, invalid-polygon and proof guards.');
})().catch(e=>{console.error(e);process.exitCode=1;});
