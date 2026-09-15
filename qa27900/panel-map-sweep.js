'use strict';

const {pages,loadPage,api,contains}=require('./harness');

async function mapLimit(items,limit,fn){
  const out=new Array(items.length);
  let cursor=0;
  async function worker(){
    while(true){
      const index=cursor++;
      if(index>=items.length)return;
      out[index]=await fn(items[index]);
    }
  }
  await Promise.all(Array.from({length:Math.min(limit,items.length)},worker));
  return out;
}

(async()=>{
  const indexes=pages.map((_,index)=>index);
  let completed=0;
  const results=await mapLimit(indexes,3,async pageIndex=>{
    const image=await loadPage(pageIndex);
    const baseline=api.PanelDetect._analyze(image)||[];
    const map=api.PanelMapCore.build(image);
    const probes=api.PanelMapCore.DEFAULT_PROBES.map(probe=>({
      name:probe.name,x:probe.x,y:probe.y,
      baselineCovered:baseline.some(panel=>contains(panel,probe.x,probe.y)),
      mapHit:!!api.PanelMapCore.findAt(map.frames,probe.x,probe.y)
    }));
    const row={pageIndex,humanPage:pageIndex+1,baselineCount:baseline.length,
      elapsedMs:map.elapsedMs,frameCount:map.frames.length,probes,
      frames:map.frames.map(frame=>({
        owner:frame._geometryOwner,
        area:+api.PanelMapCore._area(frame).toFixed(5),
        quad:frame._quad.map(point=>[+point.x.toFixed(5),+point.y.toFixed(5)]),
        source:frame._frameEnvelope?.seedSource||null,
        confidence:+Number(frame._frameEnvelope?.confidence||0).toFixed(3),
        consensus:frame._frameEnvelope?.seedConsensus||0
      }))};
    completed++;
    process.stderr.write(`panel-map ${completed}/${indexes.length} page=${pageIndex+1} baseline=${baseline.length} frames=${map.frames.length} ms=${map.elapsedMs}\n`);
    return row;
  });
  const output={pages:results.length,mappedPages:results.filter(row=>row.frameCount).length,
    totalFrames:results.reduce((sum,row)=>sum+row.frameCount,0),results};
  process.stdout.write(`${JSON.stringify(output,null,2)}\n`);
})().catch(error=>{console.error(error);process.exitCode=1;});
