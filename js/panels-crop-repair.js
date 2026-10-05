/* Reader-only mask repair. Detector proofs and saved descriptors stay intact.
 * Each outer contour is repaired separately: closing cannot bridge two scenes.
 * Never add pixels beyond that contour's convex envelope or across another owner.
 */
const PanelCropRepair = (() => {
  const area=q=>q.reduce((s,a,i)=>{const b=q[(i+1)%q.length];return s+a.x*b.y-b.x*a.y;},0)/2;
  function inside(q,x,y){let hit=false;for(let i=0,j=q.length-1;i<q.length;j=i++){const a=q[i],b=q[j];if((a.y>y)!==(b.y>y)&&x<(b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x)hit=!hit;}return hit;}
  function hull(q){const pts=[...q].sort((a,b)=>a.x-b.x||a.y-b.y),cross=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x),lo=[],hi=[];for(const p of pts){while(lo.length>1&&cross(lo.at(-2),lo.at(-1),p)<=0)lo.pop();lo.push(p);}for(const p of pts.reverse()){while(hi.length>1&&cross(hi.at(-2),hi.at(-1),p)<=0)hi.pop();hi.push(p);}return lo.slice(0,-1).concat(hi.slice(0,-1));}
  function raster(rings,w,h){const out=new Uint8Array(w*h);for(let y=0;y<h;y++){const v=(y+.5)/h,xs=[];for(const q of rings)for(let j=0;j<q.length;j++){const a=q[j],b=q[(j+1)%q.length];if((a.y>v)!==(b.y>v))xs.push((a.x+(v-a.y)*(b.x-a.x)/(b.y-a.y))*w);}xs.sort((a,b)=>a-b);for(let k=0;k+1<xs.length;k+=2)for(let x=Math.max(0,Math.ceil(xs[k]-.5));x<Math.min(w,xs[k+1]-.5);x++)out[y*w+x]=1;}return out;}
  // Square closing, using running window counts rather than radius-squared work.
  function morph(src,w,h,r,grow){const tmp=new Uint8Array(src.length),out=new Uint8Array(src.length),n=2*r+1;for(let y=0;y<h;y++){let sum=0;for(let x=-r;x<w+r;x++){const add=x+r,del=x-r-1;if(add>=0&&add<w)sum+=src[y*w+add];if(del>=0&&del<w)sum-=src[y*w+del];if(x>=0&&x<w)tmp[y*w+x]=grow?+(sum>0):+(sum===n);}}for(let x=0;x<w;x++){let sum=0;for(let y=-r;y<h+r;y++){const add=y+r,del=y-r-1;if(add>=0&&add<h)sum+=tmp[add*w+x];if(del>=0&&del<h)sum-=tmp[del*w+x];if(y>=0&&y<h)out[y*w+x]=grow?+(sum>0):+(sum===n);}}return out;}
  function components(mask,w,h){const seen=new Uint8Array(mask.length),out=[];for(let seed=0;seed<mask.length;seed++)if(mask[seed]&&!seen[seed]){const q=[seed];seen[seed]=1;for(let at=0;at<q.length;at++){const i=q[at],x=i%w,y=i/w|0;for(const j of [x?i-1:-1,x+1<w?i+1:-1,y?i-w:-1,y+1<h?i+w:-1])if(j>=0&&mask[j]&&!seen[j]){seen[j]=1;q.push(j);}}out.push(q);}return out;}
  function fillClosed(mask,w,h){const exterior=new Uint8Array(mask.length),q=[];const add=i=>{if(!mask[i]&&!exterior[i]){exterior[i]=1;q.push(i);}};for(let x=0;x<w;x++){add(x);add((h-1)*w+x);}for(let y=0;y<h;y++){add(y*w);add(y*w+w-1);}for(let at=0;at<q.length;at++){const i=q[at],x=i%w,y=i/w|0;if(x)add(i-1);if(x+1<w)add(i+1);if(y)add(i-w);if(y+1<h)add(i+w);}return Uint8Array.from(mask,(v,i)=>+(v||!exterior[i]));}
  function repair(rings,w,h,foreign=[],rgba=null){
    if(!Array.isArray(rings)||!rings.length||!Number.isInteger(w)||!Number.isInteger(h)||w<80||h<80||w>900||h>900||typeof PanelMatteCells==='undefined')return null;
    const original=raster(rings,w,h),result=original.slice(),blocked=new Uint8Array(w*h);
    for(const group of foreign){const m=raster(group,w,h);for(let i=0;i<m.length;i++)blocked[i]|=m[i];}
    // Traced rings use positive outer / negative inner winding. Mixed external
    // callers are accepted only if nesting confirms the same relationship.
    const outer=rings.filter(q=>area(q)>0&&q.length>=4),radius=Math.max(2,Math.round(Math.min(w,h)*.014));
    if(!outer.length)return null;let added=0,patches=0;const skipped=[];
    for(const ring of outer){
      const holes=rings.filter(q=>area(q)<0&&inside(ring,q[0].x,q[0].y));
      const base=raster([ring,...holes],w,h),envelope=raster([hull(ring)],w,h),basePixels=base.reduce((s,v)=>s+v,0);
      const closed=morph(morph(base,w,h,radius,true),w,h,radius,false),filled=fillClosed(closed,w,h),interior=fillClosed(base,w,h);
      // Lost balloons sometimes have a wider gate than geometric closing can
      // seal. Recover only nearby source ink that completes their enclosure;
      // distant ink and a neighboring owner cannot construct a new boundary.
      let sourceInterior=null;
      if(rgba?.length===w*h*4){
        const near=morph(base,w,h,radius*2,true),barrier=base.slice();
        for(let i=0;i<barrier.length;i++)if(near[i]&&envelope[i]&&rgba[i*4]*.299+rgba[i*4+1]*.587+rgba[i*4+2]*.114<170)barrier[i]=1;
        const grown=morph(barrier,w,h,2,true),sealed=fillClosed(grown,w,h);
        const cells=Uint8Array.from(grown,(v,i)=>+(!v&&sealed[i]));
        const restored=fillClosed(cells,w,h);
        for(const cell of components(cells,w,h)){
          if(cell.length<Math.max(48,w*h*.0001)||cell.length>w*h*.15)continue;
          const edge=cell.filter(i=>i%w===0||i%w===w-1||i<w||i>=w*(h-1)||!cells[i-1]||!cells[i+1]||!cells[i-w]||!cells[i+w]);
          const points=edge.map(i=>({x:(i%w+.5)/w,y:((i/w|0)+.5)/h}));
          const body=raster([hull(points)],w,h);
          for(let i=0;i<body.length;i++)restored[i]|=body[i];
        }
        sourceInterior=morph(restored,w,h,2,true);
      }
      const candidates=Uint8Array.from(base,(v,i)=>+(!v&&(filled[i]||interior[i]||sourceInterior?.[i])&&envelope[i]));
      // A broad white thought balloon may be open to the exterior all along one
      // flank. Its missing bay must be predominantly neutral paper, bounded by
      // this one contour's hull, small relative to the owner and free of another
      // owner's artwork. Colored/open landscape concavities do not use this route.
      if(rgba?.length===w*h*4){
        const bays=Uint8Array.from(base,(v,i)=>+(!v&&envelope[i]));
        for(const bay of components(bays,w,h)){
          if(bay.length>basePixels*.80||bay.length>w*h*.065)continue;
          const paper=bay.reduce((s,i)=>{const r=rgba[i*4],g=rgba[i*4+1],b=rgba[i*4+2];return s+ +(Math.min(r,g,b)>190&&Math.max(r,g,b)-Math.min(r,g,b)<30);},0)/bay.length;
          if(paper>.65)for(const i of bay)candidates[i]=1;
        }
      }
      for(const patch of components(candidates,w,h)){
        // Large voids can be undetected insets. Retain them until a stronger
        // physical frame boundary establishes ownership. Any foreign ownership
        // vetoes the entire patch, avoiding partially painted neighboring art.
        const enclosed=patch.every(i=>interior[i]||sourceInterior?.[i]);
        const foreignPixels=patch.reduce((s,i)=>s+ +(blocked[i]&&!original[i]),0);
        const pale=rgba?.length===w*h*4?patch.reduce((s,i)=>{const r=rgba[i*4],g=rgba[i*4+1],b=rgba[i*4+2];return s+ +(Math.min(r,g,b)>190&&Math.max(r,g,b)-Math.min(r,g,b)<30);},0)/patch.length:0;
        const speechBay=!enclosed&&pale>.65;
        if(patch.length>basePixels*(enclosed?.65:speechBay?.80:.12)||patch.length>w*h*(enclosed?.15:speechBay?.065:.035)||foreignPixels>Math.max(2,patch.length*.005)){skipped.push({pixels:patch.length,ratio:patch.length/basePixels,enclosed,foreignPixels});continue;}
        // A compact straight-sided inner contour can be a real inset even if it
        // has no accepted detector owner yet. Do not flatten that exclusion.
        if(holes.some(q=>Math.abs(area(q))*w*h>36&&(q.length<=8||pale<.65&&Math.abs(area(q))>w*h*.004&&Math.abs(area(q))/Math.abs(area(hull(q)))>.93)&&patch.some(i=>inside(q,(i%w+.5)/w,((i/w|0)+.5)/h))))continue;
        for(const i of patch)if(!result[i]&&!blocked[i]){result[i]=1;added++;}patches++;
      }
    }
    if(!added)return null;
    const traced=PanelMatteCells.tracePixelContours(result,w,h,1);if(!traced)return null;
    return {contours:traced.map(q=>q.map(([x,y])=>({x:x/w,y:y/h}))),addedPixels:added,patches,radius,analysisWidth:w,analysisHeight:h,skipped};
  }
  return {repair,raster,inside};
})();
