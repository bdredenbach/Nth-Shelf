/* Nth Shelf — broad-spectrum exterior-matte / paper-cell detector (2.79.35).
 * EMPTY MAP ONLY. No page number, filename, fingerprint or saved crop is used.
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
  function validPanel(panel){try{
    const p=panel?._matteCellProof,w=p?.analysisWidth,h=p?.analysisHeight,rings=p?.pixelContours;
    if(panel?._identitySource!=='matte-cell-frame'||p?.version!==1||p.method!==METHOD||!['dark','paper'].includes(p.mode)||!Number.isInteger(w)||!Number.isInteger(h)||!ok(w,250,900)||!ok(h,350,900))return false;
    if(panel._geometryOwner!=='matte-cell-contours'||panel._geometryType!=='edge-connected-matte-cell'||panel._quad||panel._outline)return false;
    if(!Array.isArray(p.edgeColor)||p.edgeColor.length!==3||p.edgeColor.some(v=>!Number.isInteger(v)||!ok(v,0,255))||!Number.isInteger(p.edgeSamples)||p.edgeSamples<500||!Number.isInteger(p.edgeMatched)||!ok(p.edgeMatched,0,p.edgeSamples)||!Number.isInteger(p.exteriorPixels)||!ok(p.exteriorPixels,w*h*.015,w*h))return false;
    if(!['component','split'].includes(p.source)||!Number.isInteger(p.pixels)||p.pixels<w*h*.012||!ok(p.mean,0,255)||!ok(p.variance,180,17000)||!Number.isInteger(p.dark)||!Number.isInteger(p.light))return false;
    if(!Array.isArray(rings)||!ok(rings.length,1,64)||rings.some(q=>!Array.isArray(q)||!ok(q.length,4,4096)||q.some((v,i)=>!Array.isArray(v)||v.length!==2||v.some(a=>!Number.isInteger(a))||!ok(v[0],0,w)||!ok(v[1],0,h)||(v[0]!==q[(i+1)%q.length][0]&&v[1]!==q[(i+1)%q.length][1]))))return false;
    if(Math.abs(rings.reduce((s,q)=>s+areaRing(q),0))!==p.pixels)return false;
    if(JSON.stringify(panel._contours)!==JSON.stringify(rings.map(q=>q.map(([x,y])=>({x:x/w,y:y/h})))))return false;
    const b=bounds(rings.flat());return ['x','y','w','h'].every(k=>Number.isFinite(panel[k]))&&Math.max(Math.abs(panel.x-b[0]/w),Math.abs(panel.y-b[1]/h),Math.abs(panel.w-(b[2]-b[0])/w),Math.abs(panel.h-(b[3]-b[1])/h))<1e-10;
    }catch(_){return false;}}
  function analyzeImage(img,log){
    if(!img||!Number.isFinite(img.width)||!Number.isFinite(img.height)||img.width<1||img.height<1)return [];
    try{const s=Math.min(1,900/Math.max(img.width,img.height)),w=Math.round(img.width*s),h=Math.round(img.height*s),c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d',{willReadFrequently:true});if(!ctx)return [];ctx.drawImage(img,0,0,w,h);return analyzeRGBA(ctx.getImageData(0,0,w,h).data,w,h,log);}catch(e){log?.('matte cell route deferred: '+e.message);return [];}
  }
  return {analyzeImage,analyzeRGBA,validPanel};
})();
if(typeof window!=='undefined')window.PanelMatteCells=PanelMatteCells;
if(typeof module!=='undefined')module.exports=PanelMatteCells;
