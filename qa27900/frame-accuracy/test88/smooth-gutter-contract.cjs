'use strict';
const assert=require('node:assert/strict');
global.PanelMatteCells=require('../../../js/panels-matte-cells');global.PanelLocalBoundaryConsensus=require('../../../js/panels-local-boundary-consensus');global.PanelContextCells=require('../../../js/panels-context-cells');global.PanelNarrowInkFrames=require('../../../js/panels-narrow-ink-frames');global.PanelColoredRims=require('../../../js/panels-colored-rims');const D=require('../../../js/panels-smooth-gutter-boundaries');
function fixture({gap=false,divider=false,inset=false,noBorder=false,neutral=false,reverse=false}={}){
 const w=400,h=600,a=new Uint8ClampedArray(w*h*4),bg=(x,y)=>{let t=y/(h-1);if(reverse)t=1-t;return neutral?[100+Math.round(t*50),95+Math.round(t*60),108+Math.round(t*35)]:[25+Math.round(t*55),65+Math.round(t*70),110+Math.round(t*100)];},put=(x,y,c)=>{const i=(y*w+x)*4;a.set([...c,255],i);};
 for(let y=0;y<h;y++)for(let x=0;x<w;x++)put(x,y,bg(x,y));
 function frame(x0,y0,x1,y1){for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)put(x,y,!noBorder&&(x===x0||x===x1||y===y0||y===y1)?[8,8,8]:[85+(x*17+y*3)%165,90+(x*11+y*13)%160,90+(x*23+y*7)%160]);}
 frame(40,70,340,360);
 if(gap)for(let y=200;y<250;y++)for(let x=37;x<44;x++)put(x,y,bg(x,y));
 if(divider)for(let x=40;x<=340;x++)put(x,230,[8,8,8]);
 if(inset)frame(200,140,300,280);
 return{a,w,h};
}
for(const neutral of[false,true])for(const reverse of[false,true]){const f=fixture({neutral,reverse}),out=D.analyzeRGBA(f.a,f.w,f.h);assert.equal(out.length,1,JSON.stringify({neutral,reverse}));assert(D.validPanel(out[0]));assert(D.validPanel(JSON.parse(JSON.stringify(out[0]))));const p=JSON.parse(JSON.stringify(out[0]));p._structuralGridProof.boundary.sides[0].contrast=0;assert(!D.validPanel(p),'unsupported side rejected');const q=JSON.parse(JSON.stringify(out[0]));q._contours[0][0].x+=.02;assert(!D.validPanel(q),'geometry mutation rejected');}
for(const flags of[{gap:true},{divider:true},{inset:true},{noBorder:true}]){const f=fixture(flags);assert.equal(D.analyzeRGBA(f.a,f.w,f.h).length,0,JSON.stringify(flags));}
const f=fixture(),old={x:.05,y:.05,w:.9,h:.9},before=JSON.stringify(old);assert.equal(D.analyzeRGBA(f.a,f.w,f.h,[old]).length,0);assert.equal(JSON.stringify(old),before);
assert.equal(D.analyzeRGBA(f.a.slice(1),f.w,f.h).length,0);assert.equal(D.analyzeRGBA(f.a,f.w,f.h,[{x:-.1,y:0,w:.1,h:.1}]).length,0);f.a[3]=0;assert.equal(D.analyzeRGBA(f.a,f.w,f.h).length,0);
console.log(JSON.stringify({passed:true,blueAndNeutralRamps:4,gapsDividersInsetsAndMissingBordersRejected:true,retainedOwnerUnchanged:true,proofMutationRejected:true}));
