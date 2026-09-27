/* Nth Shelf Test69 — explicit orthogonal white-gutter grid proof.
 *
 * This is deliberately a specialization of the already-proved ragged-gutter
 * raster ownership pass. It adds no second image scan. A completed paper-cell
 * map is promoted only when its owner envelopes form coherent near-orthogonal
 * rows separated by white exterior gutters. Geometry is unchanged.
 */
const PanelOrthogonalWhiteGutters=(()=>{
 'use strict';
 const METHOD='orthogonal-white-gutter-grid',SOURCE='exterior-color-field-ragged-cells';
 const finite=Number.isFinite;
 const clone=v=>JSON.parse(JSON.stringify(v));
 function sourcePanel(p,sourceProof){return {...p,_geometryType:'ragged-gutter-cells',_structuralGridProof:sourceProof};}
 function buildRows(entries,w,h){
  const tolY=Math.max(5,h*.035),rows=[];
  for(const e of entries.slice().sort((a,b)=>a.y0-b.y0||a.x0-b.x0)){
   let row=null,best=Infinity;
   for(const r of rows){const d=Math.abs(e.y0-r.y0)+Math.abs(e.y1-r.y1);if(Math.abs(e.y0-r.y0)<=tolY&&Math.abs(e.y1-r.y1)<=tolY&&d<best){row=r;best=d;}}
   if(!row){row={items:[],y0:e.y0,y1:e.y1};rows.push(row);}
   row.items.push(e);row.y0=row.items.reduce((s,a)=>s+a.y0,0)/row.items.length;row.y1=row.items.reduce((s,a)=>s+a.y1,0)/row.items.length;
  }
  rows.sort((a,b)=>a.y0-b.y0);
  if(rows.length<2||rows.length>6||rows.some(r=>r.items.length<2||r.items.length>6))return null;
  const rowProof=[];
  for(let ri=0;ri<rows.length;ri++){
   const r=rows[ri],items=r.items.slice().sort((a,b)=>a.x0-b.x0),tops=items.map(a=>a.y0),bottoms=items.map(a=>a.y1);
   if(Math.max(...tops)-Math.min(...tops)>h*.04||Math.max(...bottoms)-Math.min(...bottoms)>h*.04)return null;
   const gaps=[];
   for(let i=1;i<items.length;i++){
    const gap=items[i].x0-items[i-1].x1;
    if(gap<-w*.006||gap>w*.12)return null;
    gaps.push(gap/w);
   }
   rowProof.push({indices:items.map(a=>a.index),topSpread:(Math.max(...tops)-Math.min(...tops))/h,bottomSpread:(Math.max(...bottoms)-Math.min(...bottoms))/h,horizontalGaps:gaps});
   if(ri){const prev=rows[ri-1],gap=Math.min(...items.map(a=>a.y0))-Math.max(...prev.items.map(a=>a.y1));if(gap<h*.004||gap>h*.12)return null;rowProof[rowProof.length-1].verticalGapFromPrevious=gap/h;}
  }
  return {rows:rowProof,rowCount:rows.length,rowTolerance:tolY/h};
 }
 function classify(panels,log){
  if(!Array.isArray(panels)||panels.length<4||panels.length>12||typeof PanelRaggedGutters==='undefined')return[];
  const src=[];let w=0,h=0;
  for(let i=0;i<panels.length;i++){
   const p=panels[i],v=p?._structuralGridProof;
   if(v?.version!==18||v.method!==SOURCE||v.palette?.paper!==true||v.recovery||v.seed?.splits?.length||p?._geometryType!=='ragged-gutter-cells'||p?._geometryOwner!=='structural-grid-contours'||p?._identitySource!=='structural-grid-frame'||v.pixelContours?.length!==1)return[];
   if(!PanelRaggedGutters.validPanel(p))return[];
   if(!w){w=v.analysisWidth;h=v.analysisHeight;}else if(w!==v.analysisWidth||h!==v.analysisHeight)return[];
   if(v.palette.edgeMatched!==v.palette.edgeSamples)return[];
   const bboxPixels=p.w*p.h*w*h,fill=v.pixels/Math.max(1,bboxPixels),b=v.seed.box,seedFill=v.seed.pixels/Math.max(1,(b[2]-b[0])*(b[3]-b[1]));
   if(fill<.82||seedFill<.68)return[];
   src.push({index:i,x0:p.x*w,y0:p.y*h,x1:(p.x+p.w)*w,y1:(p.y+p.h)*h,fill,seedFill});
  }
  const grid=buildRows(src,w,h);if(!grid)return[];
  const out=panels.map((p,i)=>{
   const sourceProof=clone(p._structuralGridProof),e=src[i];
   const proof={version:26,method:METHOD,connected:true,analysisWidth:w,analysisHeight:h,count:panels.length,index:i,sourceProof,orthogonal:{rowCount:grid.rowCount,rowTolerance:grid.rowTolerance,rows:grid.rows,bboxFill:e.fill,seedFill:e.seedFill,edgePaperCoverage:sourceProof.palette.edgeMatched/sourceProof.palette.edgeSamples}};
   return {...p,_geometryType:'orthogonal-white-gutter-cell',_structuralGridProof:proof};
  });
  if(!out.every(validPanel))return[];
  log?.('orthogonal white gutter grid: '+out.length+' cells across '+grid.rowCount+' rows');
  return out;
 }
 function validPanel(p){try{
   const v=p?._structuralGridProof,o=v?.orthogonal,s=v?.sourceProof,w=v?.analysisWidth,h=v?.analysisHeight;
   if(p?._identitySource!=='structural-grid-frame'||p?._geometryOwner!=='structural-grid-contours'||p?._geometryType!=='orthogonal-white-gutter-cell'||p?._quad||p?._outline||v?.version!==26||v.method!==METHOD||v.connected!==true)return false;
   if(!Number.isInteger(w)||!Number.isInteger(h)||w<250||h<350||w>900||h>900||!Number.isInteger(v.count)||v.count<4||v.count>12||!Number.isInteger(v.index)||v.index<0||v.index>=v.count)return false;
   if(!s||s.version!==18||s.method!==SOURCE||s.palette?.paper!==true||s.recovery||s.seed?.splits?.length||s.analysisWidth!==w||s.analysisHeight!==h||s.index!==v.index||s.count!==v.count)return false;
   if(typeof PanelRaggedGutters==='undefined'||!PanelRaggedGutters.validPanel(sourcePanel(p,s)))return false;
   if(!o||!Number.isInteger(o.rowCount)||o.rowCount<2||o.rowCount>6||!finite(o.rowTolerance)||o.rowTolerance<=0||o.rowTolerance>.05||!finite(o.bboxFill)||o.bboxFill<.82||o.bboxFill>1||!finite(o.seedFill)||o.seedFill<.68||o.seedFill>1||o.edgePaperCoverage!==1)return false;
   if(!Array.isArray(o.rows)||o.rows.length!==o.rowCount)return false;
   const seen=[];
   for(let ri=0;ri<o.rows.length;ri++){
    const r=o.rows[ri];if(!Array.isArray(r.indices)||r.indices.length<2||r.indices.length>6||r.indices.some(x=>!Number.isInteger(x)||x<0||x>=v.count))return false;
    seen.push(...r.indices);
    if(!finite(r.topSpread)||r.topSpread<0||r.topSpread>.04||!finite(r.bottomSpread)||r.bottomSpread<0||r.bottomSpread>.04||!Array.isArray(r.horizontalGaps)||r.horizontalGaps.length!==r.indices.length-1||r.horizontalGaps.some(g=>!finite(g)||g<-.006||g>.12))return false;
    if(ri===0){if(r.verticalGapFromPrevious!==undefined)return false;}else if(!finite(r.verticalGapFromPrevious)||r.verticalGapFromPrevious<.004||r.verticalGapFromPrevious>.12)return false;
   }
   seen.sort((a,b)=>a-b);if(JSON.stringify(seen)!==JSON.stringify(Array.from({length:v.count},(_,i)=>i)))return false;
   return true;
  }catch(_){return false;}}
 function refinePanels(panels,log){return classify(panels,log);}
 return {refinePanels,validPanel};
})();
if(typeof module!=='undefined')module.exports=PanelOrthogonalWhiteGutters;
