/* Nth Shelf — exterior-matte / paper-cell detector with stable refinement.
 * Base detection is empty-map only; refinement partitions existing masks.
 * No page number, filename, fingerprint or saved crop is used.
 * The page exterior is proved from edge-connected matte/paper pixels. Large
 * dark-matte unions may be split only by measured pale neutral rims; large
 * paper unions may be split only by measured paper separators. Ambiguous
 * whole-page regions are withheld rather than converted to rectangles.
 */
const PanelMatteCells = (() => {
  'use strict';
  const METHOD='edge-connected-matte-cells-v1';
  const ok=(v,a,b)=>Number.isFinite(v)&&v>=a&&v<=b;
  const areaRing=q=>q.reduce((s,a,i)=>{const b=q[(i+1)%q.length];return s+a[0]*b[1]-b[0]*a[1];},0)/2;
  const bounds=q=>[Math.min(...q.map(p=>p[0])),Math.min(...q.map(p=>p[1])),Math.max(...q.map(p=>p[0])),Math.max(...q.map(p=>p[1]))];
  function components(mask,w,h){
    const ids=new Int32Array(w*h),queue=new Int32Array(w*h),items=[];let id=0;
    for(let seed=0;seed<mask.length;seed++)if(mask[seed]&&!ids[seed]){
      if(++id>16000)return null;let head=0,n=1,x0=w,y0=h,x1=-1,y1=-1;queue[0]=seed;ids[seed]=id;
      while(head<n){const i=queue[head++],x=i%w,y=i/w|0;x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);
        const add=j=>{if(mask[j]&&!ids[j]){ids[j]=id;queue[n++]=j;}};
        if(x)add(i-1);if(x+1<w)add(i+1);if(y)add(i-w);if(y+1<h)add(i+w);
      }items.push({id,pixels:n,box:[x0,y0,x1+1,y1+1]});
    }return {ids,items};
  }
  function exterior(mask,w,h){
    const cc=components(mask,w,h);if(!cc)return null;const edge=new Set();
    for(let x=0;x<w;x++){const a=cc.ids[x],b=cc.ids[(h-1)*w+x];if(a)edge.add(a);if(b)edge.add(b);}
    for(let y=0;y<h;y++){const a=cc.ids[y*w],b=cc.ids[y*w+w-1];if(a)edge.add(a);if(b)edge.add(b);}
    const out=new Uint8Array(w*h);let pixels=0;
    for(let i=0;i<out.length;i++)if(edge.has(cc.ids[i])){out[i]=1;pixels++;}
    return {out,pixels,edgeCount:edge.size};
  }
  function dilate(mask,w,h){
    const out=new Uint8Array(mask.length);
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){let yes=0;for(let dy=-1;dy<=1&&!yes;dy++)for(let dx=-1;dx<=1;dx++){const xx=x+dx,yy=y+dy;if(xx>=0&&xx<w&&yy>=0&&yy<h&&mask[yy*w+xx]){yes=1;break;}}out[y*w+x]=yes;}
    return out;
  }
  function trace(labels,w,h,id){
    const edges=[],next=new Map(),stride=w+1;
    const add=(x,y,X,Y,dir)=>{const a=y*stride+x,b=Y*stride+X,key=edges.length;edges.push({a,b,dir});if(!next.has(a))next.set(a,[]);next.get(a).push(key);};
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x;if(labels[i]!==id)continue;
      if(!y||labels[i-w]!==id)add(x,y,x+1,y,0);if(x+1===w||labels[i+1]!==id)add(x+1,y,x+1,y+1,1);
      if(y+1===h||labels[i+w]!==id)add(x+1,y+1,x,y+1,2);if(!x||labels[i-1]!==id)add(x,y+1,x,y,3);
    }
    if(!edges.length||edges.length>30000)return null;const used=new Uint8Array(edges.length),rings=[];
    for(let seed=0;seed<edges.length;seed++)if(!used[seed]){
      let at=seed;const pts=[];
      for(let steps=0;steps<=edges.length;steps++){
        if(used[at])return null;const e=edges[at];used[at]=1;pts.push([e.a%stride,e.a/stride|0]);if(e.b===edges[seed].a)break;
        const opts=(next.get(e.b)||[]).filter(k=>!used[k]);if(!opts.length)return null;
        const rank=k=>{const d=(edges[k].dir-e.dir+4)%4;return d===1?0:d===0?1:d===3?2:3;};opts.sort((a,b)=>rank(a)-rank(b));at=opts[0];
      }
      const q=pts.filter((p,i)=>{const a=pts[(i+pts.length-1)%pts.length],b=pts[(i+1)%pts.length];return (p[0]-a[0])*(b[1]-p[1])!==(p[1]-a[1])*(b[0]-p[0]);});
      if(q.length<4||q.length>4096||!areaRing(q))return null;rings.push(q);if(rings.length>64)return null;
    }return rings.sort((a,b)=>Math.abs(areaRing(b))-Math.abs(areaRing(a)));
  }
  function assignGrow(labels,parent,w,h,passes=3){
    for(let pass=0;pass<passes;pass++){
      const add=[];
      for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x;if(!parent[i]||labels[i])continue;let owner=0,mixed=false;
        for(let dy=-1;dy<=1&&!mixed;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const xx=x+dx,yy=y+dy;if(xx<0||xx>=w||yy<0||yy>=h)continue;const v=labels[yy*w+xx];if(!v)continue;if(!owner)owner=v;else if(owner!==v){mixed=true;break;}}
        if(owner&&!mixed)add.push([i,owner]);
      }if(!add.length)break;for(const [i,o]of add)labels[i]=o;
    }
  }
  function candidateItems(mask,w,h,minArea=.015){
    const cc=components(mask,w,h);if(!cc)return null;const page=w*h;
    const items=cc.items.filter(c=>c.pixels>=page*minArea&&(c.box[2]-c.box[0])>=w*.08&&(c.box[3]-c.box[1])>=h*.05);
    return {cc,items};
  }
  function mergePaperIslands(labels,accepted,gray,w,h){
    const box=id=>{let x0=w,y0=h,x1=-1,y1=-1,pixels=0;for(let i=0;i<labels.length;i++)if(labels[i]===id){const x=i%w,y=i/w|0;x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);pixels++;}return pixels?{x0,y0,x1:x1+1,y1:y1+1,pixels}:null;};
    let changed=true,merges=0;
    while(changed){changed=false;outer:for(let i=0;i<accepted.length;i++)for(let j=i+1;j<accepted.length;j++){
      const a=box(accepted[i].id),b=box(accepted[j].id);if(!a||!b)continue;
      const top=a.y0<=b.y0?a:b,bottom=top===a?b:a,topIndex=top===a?i:j,bottomIndex=top===a?j:i;
      const tolX=Math.max(3,w*.012),gap=bottom.y0-top.y1;
      if(Math.abs(top.x0-bottom.x0)>tolX||Math.abs(top.x1-bottom.x1)>tolX||Math.min(top.x1-top.x0,bottom.x1-bottom.x0)<w*.12||gap>h*.035||gap<-h*.035)continue;
      const x0=Math.max(top.x0,bottom.x0),x1=Math.min(top.x1,bottom.x1),boundary=Math.round((top.y1+bottom.y0)/2);let strongDivider=false;
      for(let y=Math.max(0,boundary-15);y<=Math.min(h-1,boundary+15);y++){
        let dark=0;for(let x=x0;x<x1;x++)dark+=gray[y*w+x]<60;
        if(dark/Math.max(1,x1-x0)>=.65){strongDivider=true;break;}
      }
      if(strongDivider)continue;
      const keep=accepted[topIndex].id,drop=accepted[bottomIndex].id;for(let k=0;k<labels.length;k++)if(labels[k]===drop)labels[k]=keep;
      accepted[topIndex].source='component';accepted.splice(bottomIndex,1);merges++;changed=true;break outer;
    }}return merges;
  }
  function splitParent(parent,rgba,gray,w,h,mode,nextId,labels){
    const sep=new Uint8Array(w*h);
    for(let i=0;i<sep.length;i++)if(parent[i]){
      const r=rgba[i*4],g=rgba[i*4+1],b=rgba[i*4+2],spread=Math.max(r,g,b)-Math.min(r,g,b);
      sep[i]=mode==='dark'?(gray[i]>120&&spread<80):(gray[i]>220&&spread<90);
    }
    const wall=dilate(sep,w,h),art=new Uint8Array(w*h);for(let i=0;i<art.length;i++)art[i]=parent[i]&&!wall[i];
    const found=candidateItems(art,w,h,.012);if(!found)return null;
    const subs=found.items;if(mode==='dark'?(subs.length<3||subs.length>6):(subs.length<2||subs.length>6))return null;
    const parentPixels=parent.reduce((s,v)=>s+v,0),subPixels=subs.reduce((s,c)=>s+c.pixels,0);if(subPixels<parentPixels*.50)return null;
    const local=new Map();for(const c of subs){const id=nextId++;local.set(c.id,id);}
    for(let i=0;i<art.length;i++){const cid=found.cc.ids[i],id=local.get(cid);if(id)labels[i]=id;}
    assignGrow(labels,parent,w,h,3);
    return {nextId,ids:[...local.values()],subPixels,parentPixels};
  }
  function analyzeRGBA(rgba,w,h,log){
    if(!Number.isInteger(w)||!Number.isInteger(h)||w<250||h<350||w>900||h>900||!rgba||rgba.length!==w*h*4)return [];
    const page=w*h,gray=new Float64Array(page);for(let i=0;i<page;i++){if(rgba[i*4+3]!==255)return [];gray[i]=rgba[i*4]*.299+rgba[i*4+1]*.587+rgba[i*4+2]*.114;}
    const edge=[];for(let x=0;x<w;x+=2){edge.push(x,(h-1)*w+x);}for(let y=0;y<h;y+=2){edge.push(y*w,y*w+w-1);}
    const color=[0,1,2].map(c=>{const a=edge.map(i=>rgba[i*4+c]).sort((a,b)=>a-b);return a[a.length>>1];});
    const base=color[0]*.299+color[1]*.587+color[2]*.114,edgeMatched=edge.filter(i=>color.every((v,c)=>Math.abs(rgba[i*4+c]-v)<=6)).length;
    const modes=[];
    if(base<=30&&edgeMatched/edge.length>=.94)modes.push('dark');modes.push('paper');
    for(const mode of modes){
      const bg=new Uint8Array(page);
      for(let i=0;i<page;i++){
        const r=rgba[i*4],g=rgba[i*4+1],b=rgba[i*4+2];
        if(mode==='dark')bg[i]=Math.max(Math.abs(r-color[0]),Math.abs(g-color[1]),Math.abs(b-color[2]))<=45;
        else {const spread=Math.max(r,g,b)-Math.min(r,g,b);bg[i]=gray[i]>=230&&spread<=70;}
      }
      const ex=exterior(bg,w,h);if(!ex||ex.pixels<page*.015)continue;
      const region=new Uint8Array(page);for(let i=0;i<page;i++)region[i]=!ex.out[i];
      const baseFound=candidateItems(region,w,h,.015);if(!baseFound)continue;let items=baseFound.items;
      if(items.length<2||items.length>10)continue;
      // Whole-page art/cover regions are not a panel map.
      if(items.filter(c=>c.pixels>page*.75).length)continue;
      const labels=new Uint16Array(page);let nextId=1,accepted=[];
      for(const c of items){
        const ratio=c.pixels/page,parent=new Uint8Array(page);for(let i=0;i<page;i++)parent[i]=baseFound.cc.ids[i]===c.id;
        let split=null;
        if(mode==='dark'&&items.length>=3&&ratio>.25&&ratio<.55)split=splitParent(parent,rgba,gray,w,h,mode,nextId,labels);
        if(mode==='paper'&&ratio>.25&&ratio<.50)split=splitParent(parent,rgba,gray,w,h,mode,nextId,labels);
        if(split){nextId=split.nextId;accepted.push(...split.ids.map(id=>({id,source:'split'})));continue;}
        if(mode==='paper'&&ratio>.55)continue;
        if(mode==='dark'&&ratio>.45)continue;
        const id=nextId++;for(let i=0;i<page;i++)if(parent[i])labels[i]=id;accepted.push({id,source:'component'});
      }
      if(mode==='paper')mergePaperIslands(labels,accepted,gray,w,h);
      if(accepted.length<2||accepted.length>12)continue;
      const out=[];
      for(const a of accepted){let pixels=0,sum=0,sq=0,dark=0,light=0;for(let i=0;i<page;i++)if(labels[i]===a.id){const g=gray[i];pixels++;sum+=g;sq+=g*g;dark+=g<50;light+=g>170;}
        if(pixels<page*.012)continue;const rings=trace(labels,w,h,a.id);if(!rings)continue;const b=bounds(rings.flat()),mean=sum/pixels,variance=sq/pixels-mean*mean;
        if((b[2]-b[0])<w*.07||(b[3]-b[1])<h*.045||variance<180)continue;
        const proof={version:1,method:METHOD,analysisWidth:w,analysisHeight:h,mode,edgeColor:color,edgeBase:base,edgeSamples:edge.length,edgeMatched,exteriorPixels:ex.pixels,source:a.source,pixels,mean,variance,dark,light,pixelContours:rings};
        out.push({x:b[0]/w,y:b[1]/h,w:(b[2]-b[0])/w,h:(b[3]-b[1])/h,_contours:rings.map(q=>q.map(([x,y])=>({x:x/w,y:y/h}))),_identitySource:'matte-cell-frame',_geometryOwner:'matte-cell-contours',_geometryType:'edge-connected-matte-cell',_matteCellProof:proof});
      }
      if(out.length<2)continue;
      const covered=out.reduce((n,p)=>n+p._matteCellProof.pixels,0)/page;if(covered<.50)continue;
      out.sort((a,b)=>{const dy=a.y-b.y;if(Math.abs(dy)<.08)return a.x-b.x;return dy;});
      if(out.every(validPanel)){log?.(`matte cells: ${mode} ${out.length} proven cells`);return out;}
    }
    return [];
  }
  function rasterContours(rings,w,h){
    const mask=new Uint8Array(w*h);
    for(let y=0;y<h;y++){
      const xs=[];for(const q of rings)for(let j=0;j<q.length;j++){const a=q[j],b=q[(j+1)%q.length];if((a[1]>y+.5)!==(b[1]>y+.5))xs.push(a[0]+(y+.5-a[1])*(b[0]-a[0])/(b[1]-a[1]));}
      xs.sort((a,b)=>a-b);for(let k=0;k+1<xs.length;k+=2)for(let x=Math.max(0,Math.ceil(xs[k]-.5));x<Math.min(w,xs[k+1]-.5);x++)mask[y*w+x]=1;
    }return mask;
  }
  function rimMetric(labels,id,pale,w,h){
    let samples=0,matched=0;
    const near=dilate(dilate(dilate(pale,w,h),w,h),w,h);
    for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){
      const i=y*w+x;if(labels[i]===id&&[i-1,i+1,i-w,i+w].some(j=>labels[j]!==id)){samples++;matched+=near[i];}
    }return {samples,matched};
  }
  function validCompletion(p,w,h){
    const c=p.rimCompletion,e=c?.enclosure;
    if(e&&!(e.radius===5&&e.fringe===2&&Number.isInteger(e.corePixels)&&ok(e.corePixels/(w*h),.008,.40)&&Number.isInteger(e.matchedPixels)&&ok(e.matchedPixels/e.corePixels,.98,1)&&ok(e.otherFraction,0,.001)&&Number.isInteger(e.addedPixels)&&ok(e.addedPixels/(w*h),.003,.03)&&Number.isInteger(e.rim?.samples)&&e.rim.samples>100&&Number.isInteger(e.rim.matched)&&ok(e.rim.matched/e.rim.samples,.92,1)))return false;
    return c?.method==='pale-rim-core-completion'&&c.matteTolerance===18&&c.rimRadius===3&&c.growPasses===6&&
      Number.isInteger(c.baselineCount)&&ok(c.baselineCount,4,12)&&Number.isInteger(c.count)&&ok(c.count,c.baselineCount,c.baselineCount+2)&&
      Number.isInteger(c.index)&&ok(c.index,0,c.count-1)&&Number.isInteger(c.priorIndex)&&ok(c.priorIndex,-1,c.baselineCount-1)&&
      Number.isInteger(c.beforePixels)&&c.beforePixels>=0&&c.retainedPixels===c.beforePixels&&p.pixels>c.beforePixels&&
      Array.isArray(c.matches)&&c.matches.length===c.baselineCount&&new Set(c.matches.map(m=>m.index)).size===c.baselineCount&&
      c.matches.every(m=>Number.isInteger(m.index)&&ok(m.index,0,c.count-1)&&Number.isInteger(m.pixels)&&m.pixels>0&&Number.isInteger(m.matched)&&ok(m.matched/m.pixels,.80,1)&&ok(m.otherFraction,0,.03))&&
      (c.priorIndex<0?c.beforePixels===0&&c.matches.every(m=>m.index!==c.index):c.matches[c.priorIndex].index===c.index&&c.beforePixels===c.matches[c.priorIndex].pixels)&&
      Number.isInteger(c.rim?.samples)&&c.rim.samples>100&&Number.isInteger(c.rim.matched)&&ok(c.rim.matched/c.rim.samples,c.priorIndex<0?.96:.90,1)&&
      ok(c.coverage,.65,.95)&&p.mode==='dark'&&ok(p.edgeBase,0,30)&&p.edgeMatched/p.edgeSamples>=.94;
  }
  // Reconstruct whole cells from a neutral rim network only when it agrees
  // uniquely with every existing dark-matte identity. This operates before
  // taps; seed points, filenames and page coordinates are not inputs.
  function completeRimNetworkRGBA(rgba,w,h,baseline,log){
    if(!Array.isArray(baseline)||baseline.length<4||baseline.length>12||!baseline.every(p=>validPanel(p)&&p._matteCellProof.version===1&&p._matteCellProof.mode==='dark'&&p._matteCellProof.analysisWidth===w&&p._matteCellProof.analysisHeight===h))return [];
    if(!rgba||rgba.length!==w*h*4)return [];
    const page=w*h,color=baseline[0]._matteCellProof.edgeColor,gray=new Float64Array(page),bg=new Uint8Array(page),pale=new Uint8Array(page);
    for(let i=0;i<page;i++){
      if(rgba[i*4+3]!==255)return [];const r=rgba[i*4],g=rgba[i*4+1],b=rgba[i*4+2];gray[i]=r*.299+g*.587+b*.114;
      bg[i]=Math.max(Math.abs(r-color[0]),Math.abs(g-color[1]),Math.abs(b-color[2]))<=18;
      pale[i]=gray[i]>120&&Math.max(r,g,b)-Math.min(r,g,b)<80;
    }
    const ex=exterior(bg,w,h);if(!ex)return [];
    const parent=new Uint8Array(page),art=new Uint8Array(page),wall=dilate(dilate(dilate(pale,w,h),w,h),w,h);
    for(let i=0;i<page;i++){parent[i]=!ex.out[i];art[i]=parent[i]&&!wall[i];}
    const cc=components(art,w,h);if(!cc)return [];
    const cells=cc.items.filter(c=>c.pixels>=page*.008&&c.box[2]-c.box[0]>=w*.035&&c.box[3]-c.box[1]>=h*.05&&c.box[0]>0&&c.box[1]>0&&c.box[2]<w&&c.box[3]<h);
    if(cells.length<baseline.length-2||cells.length>baseline.length+2)return [];
    cells.sort((a,b)=>Math.abs(a.box[1]-b.box[1])<h*.08?a.box[0]-b.box[0]:a.box[1]-b.box[1]);
    const lookup=new Map(cells.map((c,i)=>[c.id,i+1])),labels=new Uint16Array(page);
    for(let i=0;i<page;i++)labels[i]=lookup.get(cc.ids[i])||0;
    // Rim expansion can consume a narrow, already proved cell (especially
    // one containing pale lettering). Keep that independent witness instead
    // of rejecting the whole map. It must be almost disjoint from the new
    // cores and its original perimeter must still follow the measured rim.
    for(const panel of baseline){
      const mask=rasterContours(panel._matteCellProof.pixelContours,w,h);
      let pixels=0,overlap=0;
      for(let i=0;i<page;i++)if(mask[i]){pixels++;overlap+=!!labels[i];}
      if(overlap/pixels>.05)continue;
      const witness=new Uint16Array(page);
      for(let i=0;i<page;i++)if(mask[i])witness[i]=1;
      const rim=rimMetric(witness,1,pale,w,h);
      if(rim.samples<=100||rim.matched/rim.samples<.90)return [];
      cells.push({retainedRimWitness:true});
      for(let i=0;i<page;i++)if(mask[i]&&!labels[i])labels[i]=cells.length;
    }
    if(cells.length<baseline.length||cells.length>baseline.length+2)return [];
    assignGrow(labels,parent,w,h,6);
    // White lettering and isolated ink inside a closed cell belong to it.
    for(let id=1;id<=cells.length;id++){
      const inverse=new Uint8Array(page);for(let i=0;i<page;i++)inverse[i]=labels[i]!==id;
      const outside=exterior(inverse,w,h);if(!outside)return [];
      for(let i=0;i<page;i++)if(!outside.out[i]){if(labels[i]&&labels[i]!==id)return [];labels[i]=id;}
    }
    // A white rim can enclose a black border that the matte flood removed.
    // A second, closed pale-only envelope may restore it, but only with
    // near-total agreement on one existing cell and no reassigned pixels.
    const enclosures=new Map(),wideWall=dilate(dilate(wall,w,h),w,h),inside=new Uint8Array(page);
    for(let i=0;i<page;i++)inside[i]=!wideWall[i];
    const enclosed=components(inside,w,h);if(!enclosed)return [];
    for(const cell of enclosed.items){
      if(cell.pixels<page*.008||cell.pixels>page*.40||cell.box[0]===0||cell.box[1]===0||cell.box[2]===w||cell.box[3]===h)continue;
      const votes=new Array(cells.length+1).fill(0),core=new Uint8Array(page);
      for(let i=0;i<page;i++)if(enclosed.ids[i]===cell.id){core[i]=1;votes[labels[i]]++;}
      let owner=1;for(let k=2;k<votes.length;k++)if(votes[k]>votes[owner])owner=k;
      const foreign=votes.reduce((n,v,k)=>n+(k&&k!==owner?v:0),0)/cell.pixels;
      if(votes[owner]/cell.pixels<.98||foreign>.001||enclosures.has(owner-1))continue;
      const priorRim=rimMetric(labels,owner,pale,w,h);if(priorRim.matched/priorRim.samples>=.85)continue;
      let expanded=core;for(let pass=0;pass<7;pass++)expanded=dilate(expanded,w,h);
      const proposed=labels.slice();let added=0;for(let i=0;i<page;i++)if(expanded[i]&&!labels[i]){proposed[i]=owner;added++;}
      if(!ok(added/page,.003,.03))continue;
      const rim=rimMetric(proposed,owner,pale,w,h);if(rim.matched/rim.samples<.92)continue;
      labels.set(proposed);enclosures.set(owner-1,{radius:5,fringe:2,corePixels:cell.pixels,matchedPixels:votes[owner],otherFraction:foreign,addedPixels:added,rim});
    }
    const priorMasks=baseline.map(p=>rasterContours(p._matteCellProof.pixelContours,w,h)),matches=[];
    for(const mask of priorMasks){
      const votes=new Array(cells.length+1).fill(0);let pixels=0;for(let i=0;i<page;i++)if(mask[i]){pixels++;votes[labels[i]]++;}
      let id=1;for(let k=2;k<votes.length;k++)if(votes[k]>votes[id])id=k;
      const other=votes.reduce((s,n,k)=>s+(k&&k!==id?n:0),0)/pixels;
      if(votes[id]/pixels<.80||other>.03||matches.some(m=>m.index===id-1))return [];
      matches.push({index:id-1,pixels,matched:votes[id],otherFraction:other});
    }
    const candidateSizes=cells.map((_,k)=>labels.reduce((n,v)=>n+(v===k+1),0)),keep=new Map();
    matches.forEach((m,i)=>{if(m.matched/candidateSizes[m.index]>=.95)keep.set(m.index,baseline[i]);});
    // Existing ownership wins at shared rims. No old selectable pixel is lost.
    for(let j=0;j<priorMasks.length;j++)for(let i=0;i<page;i++)if(priorMasks[j][i])labels[i]=matches[j].index+1;
    // For retained cells, discard new fringe so their descriptors remain exact.
    for(const [index]of keep){const prior=matches.findIndex(m=>m.index===index),mask=priorMasks[prior];for(let i=0;i<page;i++)if(labels[i]===index+1&&!mask[i])labels[i]=0;}
    const coverage=labels.reduce((n,v)=>n+(v>0),0)/page;if(!ok(coverage,.65,.95))return [];
    const out=[];
    for(let index=0;index<cells.length;index++){
      if(keep.has(index)){out.push(keep.get(index));continue;}
      let pixels=0,total=0,sq=0,dark=0,light=0;for(let i=0;i<page;i++)if(labels[i]===index+1){const g=gray[i];pixels++;total+=g;sq+=g*g;dark+=g<50;light+=g>170;}
      const rings=trace(labels,w,h,index+1);if(!rings)return [];
      const priorIndex=matches.findIndex(m=>m.index===index),beforePixels=priorIndex<0?0:matches[priorIndex].pixels,rim=rimMetric(labels,index+1,pale,w,h);
      const proof={...baseline[0]._matteCellProof,version:2,source:'component',pixels,mean:total/pixels,variance:sq/pixels-(total/pixels)**2,dark,light,pixelContours:rings,rimCompletion:{method:'pale-rim-core-completion',matteTolerance:18,rimRadius:3,growPasses:6,baselineCount:baseline.length,count:cells.length,index,priorIndex,beforePixels,retainedPixels:beforePixels,matches,rim,coverage,...(enclosures.has(index)?{enclosure:enclosures.get(index)}:{})}};
      const b=bounds(rings.flat()),panel={x:b[0]/w,y:b[1]/h,w:(b[2]-b[0])/w,h:(b[3]-b[1])/h,_contours:rings.map(q=>q.map(([x,y])=>({x:x/w,y:y/h}))),_identitySource:'matte-cell-frame',_geometryOwner:'matte-cell-contours',_geometryType:'edge-connected-matte-cell',_matteCellProof:proof};
      if(!validPanel(panel)){log?.('rim completion withheld: proof '+index+' rim '+rim.matched/rim.samples);return [];}out.push(panel);
    }
    if(out.every(p=>baseline.includes(p)))return [];
    log?.('pale rim network completed '+out.length+' whole cells; retained '+keep.size+' exact identities');return out;
  }
  function completeRimNetworkImage(img,baseline,log){
    try{const W=img.naturalWidth||img.width,H=img.naturalHeight||img.height,s=Math.min(1,900/Math.max(W,H)),w=Math.round(W*s),h=Math.round(H*s),c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d');ctx.drawImage(img,0,0,w,h);return completeRimNetworkRGBA(ctx.getImageData(0,0,w,h).data,w,h,baseline,log);}catch(e){log?.('rim completion deferred: '+e.message);return [];}
  }
  // Canvas scaling may select different JPEG decode sizes / filters across
  // Chromium and Android. Read native pixels first, then explicitly sample
  // them so both the initial cells and their completion see the same raster.
  // This path is only requested for an existing multi-cell dark-matte map.
  function sampleBilinearRGBA(src,W,H,w,h){
    if(![W,H,w,h].every(Number.isInteger)||Math.min(W,H,w,h)<1||!src||src.length!==W*H*4)return null;
    const out=new Uint8ClampedArray(w*h*4);
    for(let y=0;y<h;y++){
      const Y=Math.max(0,Math.min(H-1,(y+.5)*H/h-.5)),y0=Math.floor(Y),y1=Math.min(H-1,y0+1),ty=Y-y0;
      for(let x=0;x<w;x++){
        const X=Math.max(0,Math.min(W-1,(x+.5)*W/w-.5)),x0=Math.floor(X),x1=Math.min(W-1,x0+1),tx=X-x0;
        const a=(y0*W+x0)*4,b=(y0*W+x1)*4,c=(y1*W+x0)*4,d=(y1*W+x1)*4,j=(y*w+x)*4;
        for(let k=0;k<4;k++)out[j+k]=(src[a+k]*(1-tx)+src[b+k]*tx)*(1-ty)+(src[c+k]*(1-tx)+src[d+k]*tx)*ty;
      }
    }
    return out;
  }
  function completeNativeRimNetworkImage(img,baseline,log){
    if(!Array.isArray(baseline)||baseline.length<4||baseline.length>12||!baseline.every(p=>validPanel(p)&&p._matteCellProof.mode==='dark'))return [];
    let canvas;
    try{
      const W=img.naturalWidth||img.width,H=img.naturalHeight||img.height;
      // Bound the extra allocation on mobile; an oversized source defers to
      // the existing route rather than risking an out-of-memory failure.
      if(!Number.isInteger(W)||!Number.isInteger(H)||W*H>24000000)return [];
      const scale=Math.min(1,900/Math.max(W,H)),w=Math.round(W*scale),h=Math.round(H*scale);
      canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;
      const ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)return [];
      ctx.drawImage(img,0,0);
      const rgba=sampleBilinearRGBA(ctx.getImageData(0,0,W,H).data,W,H,w,h);
      const nativeBaseline=analyzeRGBA(rgba,w,h,log);
      const completed=completeRimNetworkRGBA(rgba,w,h,nativeBaseline,log);
      if(!completed.length||Math.abs(completed.length-baseline.length)>2)return [];
      // Preserve reading order even when a narrow retained witness was
      // inserted after the larger cores during reconstruction.
      completed.sort((a,b)=>Math.abs(a.y-b.y)<.08?a.x-b.x:a.y-b.y);
      log?.('native-pixel rim completion: '+completed.length+' cells');return completed;
    }catch(e){log?.('native-pixel rim completion deferred: '+e.message);return [];}
    finally{if(canvas){canvas.width=1;canvas.height=1;}}
  }
  // Test64: split only stable large lobes of an already proved matte cell.
  // Erosion proposes owners; it never becomes a crop. A widest-path flood
  // restores every original pixel, including thin tips, and cannot add pixels.
  // Two independent erosion radii must produce exactly the same ownership.
  const refinementCache=new Map();
  function rasterContours(rings,w,h){
    const mask=new Uint8Array(w*h);
    for(let y=0;y<h;y++){
      const xs=[];
      for(const ring of rings)for(let k=0;k<ring.length;k++){
        const a=ring[k],b=ring[(k+1)%ring.length];
        if((a[1]>y+.5)!==(b[1]>y+.5))xs.push(a[0]);
      }
      xs.sort((a,b)=>a-b);
      for(let k=0;k<xs.length;k+=2)for(let x=xs[k];x<xs[k+1];x++)mask[y*w+x]=1;
    }
    return mask;
  }
  function neckPartition(mask,w,h,radius){
    const size=w*h,distance=new Uint16Array(size).fill(w+h),queue=new Int32Array(size);
    let head=0,n=0;
    for(let i=0;i<size;i++)if(!mask[i]){distance[i]=0;queue[n++]=i;}
    const neighbors=i=>{const x=i%w,y=i/w|0;return [x?i-1:-1,x+1<w?i+1:-1,y?i-w:-1,y+1<h?i+w:-1];};
    while(head<n){const i=queue[head++];for(const j of neighbors(i))if(j>=0&&distance[j]>distance[i]+1){distance[j]=distance[i]+1;queue[n++]=j;}}
    const core=new Uint8Array(size);
    for(let i=0;i<size;i++)core[i]=mask[i]&&distance[i]>radius?1:0;
    const cc=components(core,w,h);if(!cc)return null;
    const seeds=cc.items.filter(c=>c.pixels>=size*.015&&c.box[2]-c.box[0]>=w*.08&&c.box[3]-c.box[1]>=h*.05);
    if(seeds.length<2||seeds.length>12)return null;
    const labels=new Uint16Array(size),owners=new Map(seeds.map((s,k)=>[s.id,k+1]));
    for(let i=0;i<size;i++)labels[i]=owners.get(cc.ids[i])||0;
    const queued=new Int16Array(size).fill(-1),buckets=Array.from({length:radius+1},()=>[]),offsets=new Uint32Array(radius+1);
    const offer=(i,level)=>{
      for(const j of neighbors(i))if(j>=0&&mask[j]&&!labels[j]){
        const clearance=Math.min(level,distance[j]);
        if(clearance>queued[j]){queued[j]=clearance;buckets[clearance].push([j,labels[i]]);}
      }
    };
    for(let i=0;i<size;i++)if(labels[i])offer(i,radius);
    for(let level=radius;level>=0;level--){
      const bucket=buckets[level];
      while(offsets[level]<bucket.length){
        const [i,owner]=bucket[offsets[level]++];
        if(labels[i]||queued[i]!==level)continue;
        labels[i]=owner;offer(i,level);
      }
    }
    const parts=seeds.map(s=>({pixels:0,contacts:0,thickness:0,seedPixels:s.pixels,box:[w,h,0,0]}));
    for(let i=0;i<size;i++)if(mask[i]){
      if(!labels[i])return null;
      const p=parts[labels[i]-1],x=i%w,y=i/w|0;p.pixels++;
      p.box[0]=Math.min(p.box[0],x);p.box[1]=Math.min(p.box[1],y);p.box[2]=Math.max(p.box[2],x+1);p.box[3]=Math.max(p.box[3],y+1);
      if(neighbors(i).some(j=>j>=0&&labels[j]&&labels[j]!==labels[i])){p.contacts++;p.thickness=Math.max(p.thickness,distance[i]);}
    }
    // A narrow appendage or a long cut through artwork is not another frame.
    if(parts.some(p=>p.contacts>4||p.thickness>2||p.seedPixels<p.pixels*.65||p.pixels<.55*(p.box[2]-p.box[0])*(p.box[3]-p.box[1])))return null;
    for(let i=0;i<parts.length;i++)for(let j=i+1;j<parts.length;j++){
      const a=parts[i].box,b=parts[j].box,overlap=Math.max(0,Math.min(a[2],b[2])-Math.max(a[0],b[0]))*Math.max(0,Math.min(a[3],b[3])-Math.max(a[1],b[1]));
      if(overlap>.15*Math.min(parts[i].pixels,parts[j].pixels))return null;
    }
    return {labels,parts};
  }
  function stableRefinement(parent){
    if(parent?._matteCellProof?.version!==1||parent._matteCellProof.source!=='component'||!validPanel(parent))return null;
    const key=JSON.stringify(parent);
    if(refinementCache.has(key))return refinementCache.get(key);
    const p=parent._matteCellProof,w=p.analysisWidth,h=p.analysisHeight,mask=rasterContours(p.pixelContours,w,h);
    const a=neckPartition(mask,w,h,2),b=a&&neckPartition(mask,w,h,4);
    let result=null;
    if(a&&b&&a.parts.length===b.parts.length&&a.labels.every((v,i)=>v===b.labels[i])){
      const children=[];
      for(let k=0;k<a.parts.length;k++){
        const rings=trace(a.labels,w,h,k+1);if(!rings){children.length=0;break;}
        const part=a.parts[k],box=part.box;
        children.push({x:box[0]/w,y:box[1]/h,w:(box[2]-box[0])/w,h:(box[3]-box[1])/h,
          _identitySource:'matte-cell-frame',_geometryOwner:'matte-cell-contours',_geometryType:'edge-connected-matte-cell',
          _contours:rings.map(q=>q.map(([x,y])=>({x:x/w,y:y/h}))),
          _matteCellProof:{version:3,method:'stable-matte-cell-partition',analysisWidth:w,analysisHeight:h,
            index:k,count:a.parts.length,radii:[2,4],pixels:part.pixels,contacts:part.contacts,thickness:part.thickness,
            pixelContours:rings,parent}});
      }
      if(children.length===a.parts.length&&children.reduce((s,c)=>s+c._matteCellProof.pixels,0)===p.pixels)
        result=children.map(c=>JSON.stringify(c));
    }
    // Serialized values make this cache safe against descriptor mutation and
    // keep tap-time validation cheap. A changed parent receives a fresh check.
    refinementCache.set(key,result);
    if(refinementCache.size>8)refinementCache.delete(refinementCache.keys().next().value);
    return result;
  }
  function validRefinement(panel){
    const p=panel?._matteCellProof;
    if(p?.version!==3||!Number.isInteger(p.index)||panel._quad||panel._outline)return false;
    const group=stableRefinement(p.parent),serialized=group?.[p.index];if(!serialized)return false;
    const expected=JSON.parse(serialized);
    return ['_identitySource','_geometryOwner','_geometryType'].every(k=>panel[k]===expected[k])&&
      ['x','y','w','h'].every(k=>Number.isFinite(panel[k])&&Math.abs(panel[k]-expected[k])<1e-10)&&
      JSON.stringify(p)===JSON.stringify(expected._matteCellProof)&&JSON.stringify(panel._contours)===JSON.stringify(expected._contours);
  }
  function refinePanels(panels,log){
    if(!Array.isArray(panels))return panels;
    const out=[];let refined=0;
    for(const parent of panels){
      const group=stableRefinement(parent);
      if(group){out.push(...group.map(s=>JSON.parse(s)));refined++;}else out.push(parent);
    }
    if(refined)log?.(`stable matte partition: ${refined} composites, ${out.length-panels.length} additional owners, exact pixel union`);
    return refined?out:panels;
  }

  // White bodies can leak into the paper gutter at antialiased outlines.
  // Recover only enclosed bodies with ink inside and an unambiguous adjacent
  // owner. The original labels are immutable: this pass only fills omissions.
  const repairCache=new Map(),REPAIR_METHOD='enclosed-white-body-repair';
  const repairable=p=>[1,3].includes(p?._matteCellProof?.version)&&validPanel(p);
  function crossDilate(a,w,h){
    const b=a.slice();for(let i=0;i<a.length;i++)if(a[i]){const x=i%w,y=i/w|0;if(x)b[i-1]=1;if(x+1<w)b[i+1]=1;if(y)b[i-w]=1;if(y+1<h)b[i+w]=1;}return b;
  }
  function whiteBodyShape(rings,w,h){
    if(!Array.isArray(rings)||rings.length!==1||rings[0].length<4||rings[0].length>4096)return null;
    const q=rings[0];
    if(q.some((a,i)=>!Array.isArray(a)||a.length!==2||a.some(v=>!Number.isInteger(v))||a[0]<2||a[1]<2||a[0]>w-2||a[1]>h-2||(a[0]!==q[(i+1)%q.length][0]&&a[1]!==q[(i+1)%q.length][1])))return null;
    const box=bounds(q),bw=box[2]-box[0],bh=box[3]-box[1],mask=rasterContours(rings,w,h),pixels=mask.reduce((s,v)=>s+v,0);
    if(pixels!==Math.abs(areaRing(q))||bw<20||bh<15||bw>w*.55||bh>h*.22||pixels>w*h*.10)return null;
    return {box,mask,pixels};
  }
  function repairedGeometry(parent,repairs){
    if(!repairable(parent)||!Array.isArray(repairs)||!repairs.length||repairs.length>32)return null;
    const key=JSON.stringify([parent,repairs]);if(repairCache.has(key))return repairCache.get(key);
    const p=parent._matteCellProof,w=p.analysisWidth,h=p.analysisHeight,mask=rasterContours(p.pixelContours,w,h),original=mask.slice();
    for(const r of repairs){
      const body=whiteBodyShape(r.bodyContours,w,h),a=r.attachment;if(!body)return null;
      const [x0,y0,x1,y1]=body.box,white=r.whitePixels,ink=body.pixels-white;
      if(!Number.isInteger(white)||white<400||white>w*h*.06||white/((x1-x0)*(y1-y0))<.30||ink!==r.inkPixels||ink<Math.max(15,.04*body.pixels)||ink>.5*body.pixels)return null;
      if(!a||![a.samples,a.matched,a.foreign].every(Number.isInteger)||a.samples<=0||a.matched<a.samples*.60||a.matched>a.samples||a.foreign<0||a.foreign>a.samples-a.matched||a.matched<(a.matched+a.foreign)*.98)return null;
      const expanded=r.expandedContours;
      if(!Array.isArray(expanded)||!expanded.length||expanded.length>64||expanded.some(q=>!Array.isArray(q)||q.length<4||q.length>4096||q.some((v,i)=>!Array.isArray(v)||v.length!==2||v.some(n=>!Number.isInteger(n))||v[0]<0||v[1]<0||v[0]>w||v[1]>h||(v[0]!==q[(i+1)%q.length][0]&&v[1]!==q[(i+1)%q.length][1]))))return null;
      const addition=rasterContours(expanded,w,h),limit=crossDilate(body.mask,w,h);let missing=0,added=0,extent=0;
      for(let i=0;i<mask.length;i++){
        if(body.mask[i]&&!addition[i]||addition[i]&&!limit[i])return null;
        missing+=!!body.mask[i]&&!original[i];extent+=addition[i];
        if(addition[i]&&!mask[i]){mask[i]=1;added++;}
      }
      if(missing<body.pixels*.20||added!==r.addedPixels||!added||extent!==Math.abs(expanded.reduce((s,q)=>s+areaRing(q),0)))return null;
    }
    const rings=trace(mask,w,h,1);if(!rings)return null;const box=bounds(rings.flat()),pixels=mask.reduce((s,v)=>s+v,0);
    const geometry={x:box[0]/w,y:box[1]/h,w:(box[2]-box[0])/w,h:(box[3]-box[1])/h,pixelContours:rings,pixels};
    repairCache.set(key,JSON.stringify(geometry));if(repairCache.size>8)repairCache.delete(repairCache.keys().next().value);
    return repairCache.get(key);
  }
  function validWhiteRepair(panel){
    const p=panel?._matteCellProof;
    if(p?.version!==4||p.method!==REPAIR_METHOD||panel._identitySource!=='matte-cell-frame'||panel._geometryOwner!=='matte-cell-contours'||panel._geometryType!=='edge-connected-matte-cell'||panel._quad||panel._outline||p.analysisWidth!==p.parent?._matteCellProof?.analysisWidth||p.analysisHeight!==p.parent?._matteCellProof?.analysisHeight)return false;
    const serialized=repairedGeometry(p.parent,p.repairs);if(!serialized)return false;const g=JSON.parse(serialized),w=p.analysisWidth,h=p.analysisHeight;
    return ['x','y','w','h'].every(k=>Number.isFinite(panel[k])&&Math.abs(panel[k]-g[k])<1e-10)&&p.pixels===g.pixels&&JSON.stringify(p.pixelContours)===JSON.stringify(g.pixelContours)&&JSON.stringify(panel._contours)===JSON.stringify(g.pixelContours.map(q=>q.map(([x,y])=>({x:x/w,y:y/h}))));
  }
  function repairWhiteBodiesRGBA(rgba,w,h,panels,log){
    if(!Array.isArray(panels)||!panels.length||panels.length>12||!panels.every(p=>repairable(p)&&p._matteCellProof.analysisWidth===w&&p._matteCellProof.analysisHeight===h)||rgba?.length!==w*h*4)return panels;
    const size=w*h,old=new Uint16Array(size),labels=new Uint16Array(size),white=new Uint8Array(size);
    for(let k=0;k<panels.length;k++){
      const mask=rasterContours(panels[k]._matteCellProof.pixelContours,w,h);
      for(let i=0;i<size;i++)if(mask[i]){if(old[i])return panels;old[i]=k+1;}
    }
    labels.set(old);for(let i=0;i<size;i++){if(rgba[i*4+3]!==255)return panels;white[i]=Math.min(rgba[i*4],rgba[i*4+1],rgba[i*4+2])>232?1:0;}
    const found=components(white,w,h);if(!found)return panels;
    const repairs=panels.map(()=>[]);
    for(const c of found.items){
      const [x0,y0,x1,y1]=c.box,bw=x1-x0,bh=y1-y0;
      if(c.pixels<400||c.pixels>size*.06||bw<20||bh<15||bw>w*.55||bh>h*.22||c.pixels/(bw*bh)<.30||x0<2||y0<2||x1>w-2||y1>h-2)continue;
      const lw=bw+12,lh=bh+12,local=new Uint8Array(lw*lh);
      for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)if(found.ids[y*w+x]===c.id)local[(y-y0+6)*lw+x-x0+6]=1;
      const outside=exterior(local.map(v=>1-v),lw,lh);if(!outside)continue;
      const body=outside.out.map(v=>1-v),filled=body.reduce((s,v)=>s+v,0),ink=filled-c.pixels;
      if(ink<Math.max(15,.04*filled)||ink>.5*filled)continue;
      let band=body;for(let k=0;k<4;k++)band=crossDilate(band,lw,lh);
      const counts=new Uint32Array(panels.length+1);let missing=0,samples=0;
      for(let i=0;i<body.length;i++)if(band[i]){
        const x=i%lw+x0-6,y=(i/lw|0)+y0-6,id=x>=0&&y>=0&&x<w&&y<h?old[y*w+x]:0;
        if(body[i])missing+=!id;else {counts[id]++;samples++;}
      }
      if(missing<filled*.20)continue;
      let owner=1;for(let k=2;k<counts.length;k++)if(counts[k]>counts[owner])owner=k;
      const contact=counts[owner],nonzero=counts.reduce((s,v,k)=>s+(k?v:0),0);
      if(contact<samples*.60||contact<nonzero*.98)continue;
      const bodyMask=new Uint8Array(size),addition=new Uint8Array(size);let conflict=false;
      for(let i=0;i<body.length;i++)if(body[i]){
        const x=i%lw+x0-6,y=(i/lw|0)+y0-6,j=y*w+x;
        if(labels[j]&&labels[j]!==owner){conflict=true;break;}bodyMask[j]=addition[j]=1;
      }
      if(conflict)continue;
      const expanded=crossDilate(body,lw,lh);
      for(let i=0;i<expanded.length;i++)if(expanded[i]&&!body[i]){
        const x=i%lw+x0-6,y=(i/lw|0)+y0-6,j=y*w+x;
        if(x>=0&&y>=0&&x<w&&y<h&&!labels[j]&&Math.max(rgba[j*4],rgba[j*4+1],rgba[j*4+2])<180)addition[j]=1;
      }
      const bodyContours=trace(bodyMask,w,h,1),expandedContours=trace(addition,w,h,1);if(!bodyContours||bodyContours.length!==1||!expandedContours)continue;
      let added=0;for(let i=0;i<size;i++)if(addition[i]&&!labels[i])added++;
      if(!added||repairs[owner-1].length>=32)continue;
      repairs[owner-1].push({bodyContours,expandedContours,whitePixels:c.pixels,inkPixels:ink,addedPixels:added,attachment:{samples,matched:contact,foreign:nonzero-contact}});
      for(let i=0;i<size;i++)if(addition[i]&&!labels[i])labels[i]=owner;
    }
    let count=0;const out=panels.map((parent,k)=>{
      if(!repairs[k].length)return parent;
      const serialized=repairedGeometry(parent,repairs[k]);if(!serialized)return parent;
      const g=JSON.parse(serialized),proof={version:4,method:REPAIR_METHOD,analysisWidth:w,analysisHeight:h,parent,repairs:repairs[k],pixelContours:g.pixelContours,pixels:g.pixels};
      const panel={x:g.x,y:g.y,w:g.w,h:g.h,_identitySource:'matte-cell-frame',_geometryOwner:'matte-cell-contours',_geometryType:'edge-connected-matte-cell',_contours:g.pixelContours.map(q=>q.map(([x,y])=>({x:x/w,y:y/h}))),_matteCellProof:proof};
      if(!validPanel(panel))return parent;count+=repairs[k].length;return panel;
    });
    if(count)log?.(`enclosed white-body repair: ${count} bodies, original ownership preserved`);
    return count?out:panels;
  }
  function recoverNativeCellsRGBA(rgba,w,h,log){
    const candidates=analyzeRGBA(rgba,w,h).filter(p=>{
      const v=p._matteCellProof;
      if(v.version!==1||v.source!=='component'||p.w*p.h>.48||v.pixels/(p.w*p.h*w*h)<.85)return false;
      const mask=rasterContours(v.pixelContours,w,h),box=bounds(v.pixelContours.flat());
      for(let axis=0;axis<2;axis++){
        const length=axis?box[2]-box[0]:box[3]-box[1],span=axis?box[3]-box[1]:box[2]-box[0],band=Math.max(8,Math.round(length*.04));
        for(let pos=Math.max(band*2,Math.round(length*.12));pos<length-Math.max(band*2,Math.round(length*.12));pos++){
          let gap=0,flank=0;
          for(let t=0;t<span;t++){
            const i=(axis?box[1]+t:box[1]+pos)*w+(axis?box[0]+pos:box[0]+t),step=axis?1:w;
            if(!mask[i]){gap++;flank+=!!mask[i-band*step]&&!!mask[i+band*step];}
          }
          if(gap/span>.28&&flank/span>.18)return false;
        }
      }
      return true;
    });
    if(candidates.length)log?.(`native compact matte recovery: ${candidates.length} independent cells`);
    return candidates;
  }
  function completeMatteImage(img,panels,log){
    if(!Array.isArray(panels)||panels.length&&!panels.every(repairable))return panels;
    const W=img.naturalWidth||img.width,H=img.naturalHeight||img.height;if(!W||!H||W*H>24000000)return panels;
    let canvas;try{
      canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;const ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)return panels;ctx.drawImage(img,0,0);
      const scale=Math.min(1,900/Math.max(W,H)),w=Math.round(W*scale),h=Math.round(H*scale);
      const rgba=sampleBilinearRGBA(ctx.getImageData(0,0,W,H).data,W,H,w,h);
      if(!panels.length)panels=recoverNativeCellsRGBA(rgba,w,h,log);
      return repairWhiteBodiesRGBA(rgba,w,h,panels,log);
    }finally{if(canvas){canvas.width=1;canvas.height=1;}}
  }

  function validPanel(panel){try{
    if(panel?._matteCellProof?.version===4)return validWhiteRepair(panel);
    if(panel?._matteCellProof?.version===3)return validRefinement(panel);
    const p=panel?._matteCellProof,w=p?.analysisWidth,h=p?.analysisHeight,rings=p?.pixelContours;
    if(panel?._identitySource!=='matte-cell-frame'||![1,2].includes(p?.version)||p.method!==METHOD||!['dark','paper'].includes(p.mode)||!Number.isInteger(w)||!Number.isInteger(h)||!ok(w,250,900)||!ok(h,350,900))return false;
    if(p.version===2?!validCompletion(p,w,h):p.rimCompletion!==undefined)return false;
    if(panel._geometryOwner!=='matte-cell-contours'||panel._geometryType!=='edge-connected-matte-cell'||panel._quad||panel._outline)return false;
    if(!Array.isArray(p.edgeColor)||p.edgeColor.length!==3||p.edgeColor.some(v=>!Number.isInteger(v)||!ok(v,0,255))||!Number.isInteger(p.edgeSamples)||p.edgeSamples<500||!Number.isInteger(p.edgeMatched)||!ok(p.edgeMatched,0,p.edgeSamples)||!Number.isInteger(p.exteriorPixels)||!ok(p.exteriorPixels,w*h*.015,w*h))return false;
    if(!['component','split'].includes(p.source)||!Number.isInteger(p.pixels)||p.pixels<w*h*.012||!ok(p.mean,0,255)||!ok(p.variance,180,17000)||!Number.isInteger(p.dark)||!Number.isInteger(p.light))return false;
    if(!Array.isArray(rings)||!ok(rings.length,1,64)||rings.some(q=>!Array.isArray(q)||!ok(q.length,4,4096)||q.some((v,i)=>!Array.isArray(v)||v.length!==2||v.some(a=>!Number.isInteger(a))||!ok(v[0],0,w)||!ok(v[1],0,h)||(v[0]!==q[(i+1)%q.length][0]&&v[1]!==q[(i+1)%q.length][1]))))return false;
    if(Math.abs(rings.reduce((s,q)=>s+areaRing(q),0))!==p.pixels)return false;
    if(JSON.stringify(panel._contours)!==JSON.stringify(rings.map(q=>q.map(([x,y])=>({x:x/w,y:y/h})))))return false;
    const b=bounds(rings.flat());return ['x','y','w','h'].every(k=>Number.isFinite(panel[k]))&&Math.max(Math.abs(panel.x-b[0]/w),Math.abs(panel.y-b[1]/h),Math.abs(panel.w-(b[2]-b[0])/w),Math.abs(panel.h-(b[3]-b[1])/h))<1e-10;
    }catch(_){return false;}}
  function analyzeImage(img,log){
    const W=img?.naturalWidth||img?.width,H=img?.naturalHeight||img?.height;
    if(!Number.isInteger(W)||!Number.isInteger(H)||W<1||H<1)return [];
    let canvas;
    try{
      const s=Math.min(1,900/Math.max(W,H)),w=Math.round(W*s),h=Math.round(H*s);
      canvas=document.createElement('canvas');
      // Browser Image downsampling may select a different filter from Canvas
      // downsampling. Decode at native size and use the established explicit
      // sampler so source-derived contours do not depend on that choice.
      // Keep the existing bounded route above the native allocation budget.
      const native=W*H<=24000000;
      canvas.width=native?W:w;canvas.height=native?H:h;
      const ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)return [];
      if(native)ctx.drawImage(img,0,0);else ctx.drawImage(img,0,0,w,h);
      const rgba=ctx.getImageData(0,0,canvas.width,canvas.height).data;
      return analyzeRGBA(native?sampleBilinearRGBA(rgba,W,H,w,h):rgba,w,h,log);
    }catch(e){log?.('matte cell route deferred: '+e.message);return [];}
    finally{if(canvas){canvas.width=1;canvas.height=1;}}
  }
  return {repairWhiteBodiesRGBA,completeMatteImage,recoverNativeCellsRGBA,refinePanels,tracePixelContours:trace,analyzeImage,analyzeRGBA,validPanel,completeRimNetworkImage,completeRimNetworkRGBA,completeNativeRimNetworkImage,sampleBilinearRGBA};
})();
if(typeof window!=='undefined')window.PanelMatteCells=PanelMatteCells;
if(typeof module!=='undefined')module.exports=PanelMatteCells;
