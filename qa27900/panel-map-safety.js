'use strict';

const {loadPage,api}=require('./harness');

const cases=[
  {name:'cover artwork loop',pageIndex:0,expectedFrames:0},
  {name:'baseline-owned bottom union',pageIndex:10,expectedFrames:0},
  {name:'half-panel and two-panel unions',pageIndex:11,expectedFrames:0},
  {name:'valid paired skew top row',pageIndex:12,expectedFrames:2,expectedRows:'top'},
  {name:'baseline-owned skew union',pageIndex:30,expectedFrames:0},
  {name:'six-frame sepia stress',pageIndex:35,expectedFrames:4,expectedRows:'middle,bottom'},
  {name:'page-39 artwork loop',pageIndex:38,expectedFrames:0}
];

(async()=>{
  const results=[];
  for(const test of cases){
    const image=await loadPage(test.pageIndex);
    const map=api.PanelMapCore.build(image);
    const rows=(map.acceptedRows||[]).join(',');
    const pass=map.frames.length===test.expectedFrames&&
      (!test.expectedRows||rows===test.expectedRows)&&
      map.frames.every(frame=>frame._geometryOwner==='skewed-frame');
    results.push({...test,humanPage:test.pageIndex+1,actualFrames:map.frames.length,
      actualRows:rows,elapsedMs:map.elapsedMs,pass});
    process.stderr.write(`panel-map-safety page=${test.pageIndex+1} ${pass?'PASS':'FAIL'} frames=${map.frames.length}\n`);
  }
  const output={passed:results.filter(result=>result.pass).length,total:results.length,results};
  process.stdout.write(`${JSON.stringify(output,null,2)}\n`);
  if(output.passed!==output.total)process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1;});
