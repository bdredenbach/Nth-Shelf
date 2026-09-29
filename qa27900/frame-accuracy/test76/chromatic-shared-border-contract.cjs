'use strict';
const assert=require('node:assert/strict');
global.PanelMatteCells=require('../../../js/panels-matte-cells.js');
const D=require('../../../js/panels-chromatic-shared-border.js');

function synthetic({weakContact=false,flat=false,open=false,wideBridge=false}={}){
  const w=700,h=900,a=new Uint8ClampedArray(w*h*4);
  for(let i=0;i<w*h;i++){a[i*4]=140;a[i*4+1]=145;a[i*4+2]=135;a[i*4+3]=255;}
  const inside=(x,y)=>
    (x>=100&&x<180&&y>=150&&y<390)||
    (x>=230&&x<325&&y>=170&&y<440)||
    (x>=175&&x<235&&y>=(wideBridge?225:245)&&y<(wideBridge?300:280));
  const ring=(x,y)=>{
    if(inside(x,y))return false;
    for(let dy=-4;dy<=4;dy++)for(let dx=-4;dx<=4;dx++)if(inside(x+dx,y+dy))return true;
    return false;
  };
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const i=(y*w+x)*4;
    if(inside(x,y)){
      if(flat){a[i]=a[i+1]=a[i+2]=150;continue;}
      const n=((x*17+y*23)%101)-50;
      if(x<205){const b=150+n;a[i]=Math.max(0,Math.min(255,b+35));a[i+1]=Math.max(0,Math.min(255,b));a[i+2]=Math.max(0,Math.min(255,b-30));}
      else{const b=120+n;a[i]=Math.max(0,Math.min(255,b-25));a[i+1]=Math.max(0,Math.min(255,b+10));a[i+2]=Math.max(0,Math.min(255,b+35));}
    } else if(ring(x,y)) {a[i]=190;a[i+1]=20;a[i+2]=30;}
  }
  const y0=wideBridge?225:245,y1=wideBridge?300:280;
  for(let y=y0;y<y1;y++)for(let x=200;x<206;x++){
    const i=(y*w+x)*4;
    const white=!weakContact&&x<203;
    const v=weakContact?145:(white?245:5);
    a[i]=a[i+1]=a[i+2]=v;
  }
  if(open){
    for(let y=230;y<310;y++)for(let x=94;x<106;x++){const i=(y*w+x)*4;a[i]=140;a[i+1]=145;a[i+2]=135;}
  }
  return {a,w,h};
}

const good=synthetic(),audit=[];
const panels=D.supplementRGBA(good.a,good.w,good.h,[],null,x=>audit.push({...x}));
assert.equal(panels.length,2);
assert(panels.every(D.validPanel));
assert.equal(audit.length,1);
assert.equal(audit[0].accepted,2);
assert.equal(audit[0].overlap,0);
assert.equal(panels[0]._structuralGridProof.stabilityDifference,0);
assert(panels.every(p=>p._structuralGridProof.contactMedianGradient>.6));

assert.equal(D.supplementRGBA(synthetic({weakContact:true}).a,700,900,[]).length,0,'weak shared edge must not authorize a split');
assert.equal(D.supplementRGBA(synthetic({flat:true}).a,700,900,[]).length,0,'flat interiors are not comic scenes');
assert.equal(D.supplementRGBA(synthetic({open:true}).a,700,900,[]).length,0,'open chromatic rim is not an enclosed pair');
assert.equal(D.supplementRGBA(synthetic({wideBridge:true}).a,700,900,[]).length,0,'a broad connected interior must not be forced into two owners');

const prior=JSON.parse(JSON.stringify([panels[0]])),snapshot=JSON.stringify(prior),overlapAudit=[];
assert.equal(D.supplementRGBA(good.a,good.w,good.h,prior,null,x=>overlapAudit.push({...x})).length,0);
assert.equal(JSON.stringify(prior),snapshot,'prior owners must be immutable');
assert.equal(overlapAudit[0].overlap,1);

const mutations=[
 p=>p._structuralGridProof.version=31,
 p=>p._structuralGridProof.method='wrong',
 p=>p._structuralGridProof.connected=false,
 p=>p._structuralGridProof.originalOwnerOverlap=1,
 p=>p._structuralGridProof.selectedIndex=2,
 p=>p._structuralGridProof.hueBin=12,
 p=>p._structuralGridProof.thresholds[0]++,
 p=>p._structuralGridProof.stabilityDifference=999,
 p=>p._structuralGridProof.hole.pixels--,
 p=>p._structuralGridProof.regionPixels[0]--,
 p=>p._structuralGridProof.regionBoxes[0][0]++,
 p=>p._structuralGridProof.regionFills[0]=.1,
 p=>p._structuralGridProof.regionVariances[0]=0,
 p=>p._structuralGridProof.contactEdges=1,
 p=>p._structuralGridProof.contactMedianGradient=.1,
 p=>p._structuralGridProof.contactQ75Gradient=.1,
 p=>p._structuralGridProof.pixelContours[0][0][0]++,
 p=>p._contours[0][0].x+=.01,
 p=>p.x+=.01,
 p=>p._geometryOwner='unproved'
];
for(const mutate of mutations){const p=JSON.parse(JSON.stringify(panels[0]));mutate(p);assert.equal(D.validPanel(p),false);}

global.PanelStructuralGrid={validPanel:p=>p?.sentinel===true};
global.PanelGeometry={refine:async(u,p)=>({...p,delegated:true})};
global.PanelEdgeSpill={analyzeImage:()=>({delegate:true}),analyzeRGBA:()=>({delegate:true})};
D.bind();
assert(PanelStructuralGrid.validPanel({sentinel:true}));
assert(PanelStructuralGrid.validPanel(panels[0]));
assert.equal(PanelEdgeSpill.analyzeImage({},panels[0]),null);
assert.deepEqual(PanelEdgeSpill.analyzeImage({},{}),{delegate:true});
(async()=>{
  assert.deepEqual(await PanelGeometry.refine('',panels[0]),panels[0]);
  assert((await PanelGeometry.refine('',{})).delegated);
  console.log(JSON.stringify({passed:true,syntheticOwners:2,tamperRejections:mutations.length,weakContactRejected:true,flatRejected:true,openRimRejected:true,wideBridgeRejected:true,priorOwnerVeto:true}));
})().catch(e=>{console.error(e);process.exit(1)});
