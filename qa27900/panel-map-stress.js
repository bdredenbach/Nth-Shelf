// Historical output-parity check, NOT artwork-boundary ground truth.
// See frame-accuracy/README.md for the page-36 overlap failures.
'use strict';

const {loadPage,api}=require('./harness');

const cases=[
  ['top-left','canonical',.25,.15,'orthogonal',null],
  ['top-right','canonical',.75,.14,'orthogonal',null],
  ['middle-left','canonical',.20,.45,'skewed',[[.0362,.2787],[.4039,.2773],[.4049,.6226],[.0302,.5598]]],
  ['middle-right','canonical',.70,.46,'skewed',[[.3394,.2565],[.9778,.2573],[.9737,.6978],[.2890,.6044]]],
  ['bottom-left','canonical',.14,.78,'skewed',[[.0450,.5624],[.2795,.5992],[.2856,.9922],[.0305,.9932]]],
  ['bottom-wide','canonical',.66,.83,'skewed',[[.2767,.5988],[.9662,.6642],[.9592,.9898],[.2779,.9890]]],
  ['top-left','moved',.18,.22,'orthogonal',null],
  ['top-right','moved',.82,.18,'orthogonal',null],
  ['middle-left','moved',.12,.42,'skewed',[[.0362,.2787],[.4039,.2773],[.4049,.6226],[.0302,.5598]]],
  ['middle-right','moved',.78,.45,'skewed',[[.3394,.2565],[.9778,.2573],[.9737,.6978],[.2890,.6044]]],
  ['bottom-left','moved',.12,.85,'skewed',[[.0450,.5624],[.2795,.5992],[.2856,.9922],[.0305,.9932]]],
  ['bottom-wide','moved',.72,.82,'skewed',[[.2767,.5988],[.9662,.6642],[.9592,.9898],[.2779,.9890]]]
];

function quadDistance(a,b){
  if(!Array.isArray(a)||!Array.isArray(b)||a.length!==4||b.length!==4)return Infinity;
  return a.reduce((sum,p,i)=>sum+Math.hypot(p.x-b[i][0],p.y-b[i][1]),0)/4;
}

(async()=>{
  const image=await loadPage(35);
  const map=api.PanelMapCore.build(image);
  const results=cases.map(([panel,variant,x,y,expectedOwner,expectedQuad])=>{
    const found=api.PanelMapCore.findAt(map.frames,x,y);
    const shouldMap=expectedOwner==='skewed';
    const owner=String(found?._frameOwnership?.owner||found?._geometryOwner||'');
    const distance=expectedQuad?quadDistance(found?._quad,expectedQuad):null;
    const pass=shouldMap?!!found&&owner.startsWith(expectedOwner)&&distance<=.005:!found;
    return {panel,variant,tap:[x,y],shouldMap,pass,owner,geometryOwner:found?._geometryOwner||null,
      quadDistance:distance==null?null:+distance.toFixed(6)};
  });

  const iterations=2000;
  const started=process.hrtime.bigint();
  for(let n=0;n<iterations;n++)for(const [, ,x,y] of cases){
    api.PanelMapCore.findAt(map.frames,x,y);
  }
  const lookupMs=Number(process.hrtime.bigint()-started)/1e6;
  const output={
    passed:results.filter(row=>row.pass).length,
    total:results.length,
    map:{frames:map.frames.length,rows:map.acceptedRows,probes:map.probeCount,elapsedMs:map.elapsedMs,
      wasm:map.frames.every(frame=>frame._frameEnvelope?.wasmRailKernel===true)},
    lookup:{operations:iterations*cases.length,totalMs:+lookupMs.toFixed(3),
      averageMs:+(lookupMs/(iterations*cases.length)).toFixed(6)},
    results
  };
  process.stdout.write(`${JSON.stringify(output,null,2)}\n`);
  if(output.passed!==output.total||map.frames.length!==4||map.acceptedRows.length!==2)process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1;});
