/* Nth Shelf — curved pale-rim network (2.79.33 candidate).
 * EMPTY MAP ONLY. Pixel-derived transverse paths plus a terminal fan; no
 * filenames, page indices, fingerprints, supplied points, or saved crop table.
 * Path search proposes separators, not rectangles. A complete noncrossing
 * network, measured two-sided support, textured cells, exterior matte, and
 * compact connected-white ownership are required before contours are emitted.
 * Existing detectors and their accepted descriptors are never edited here.
 */
const PanelCurvedRims = (() => {
  'use strict';
  const METHOD='pale-rim-noncrossing-tiers-and-terminal-fan';
  const ok=(v,a,b)=>Number.isFinite(v)&&v>=a&&v<=b;
  const sum=a=>a.reduce((s,x)=>s+x,0),mean=a=>sum(a)/a.length;
  const area=q=>q.reduce((s,a,i)=>{const b=q[(i+1)%q.length];return s+a[0]*b[1]-b[0]*a[1];},0)/2;
  const bounds=q=>[Math.min(...q.map(p=>p[0])),Math.min(...q.map(p=>p[1])),Math.max(...q.map(p=>p[0])),Math.max(...q.map(p=>p[1]))];
  function input(rgba,w,h){
    if(!Number.isInteger(w)||!Number.isInteger(h)||w<300||h<500||w>900||h>900||!ok(w/h,.50,.85)||rgba?.length!==w*h*4)return null;
    const edge=[];for(let x=0;x<w;x+=2){edge.push(x,(h-1)*w+x);}for(let y=0;y<h;y+=2){edge.push(y*w,y*w+w-1);}
    const color=[0,1,2].map(c=>{const vs=edge.map(i=>rgba[i*4+c]).sort((a,b)=>a-b);return vs[vs.length>>1];});
    const base=color[0]*.299+color[1]*.587+color[2]*.114;
    const matched=edge.filter(i=>color.every((v,c)=>Math.abs(rgba[i*4+c]-v)<=6)).length;
    if(base>25||matched/edge.length<.96)return null;
    const gray=new Float64Array(w*h),pale=new Float64Array(w*h);
    for(let i=0;i<gray.length;i++){if(rgba[i*4+3]!==255)return null;gray[i]=rgba[i*4]*.299+rgba[i*4+1]*.587+rgba[i*4+2]*.114;pale[i]=Math.min(rgba[i*4+2]+25,gray[i]);}
    return {gray,pale,matte:{color,base,samples:edge.length,matched}};
  }
  function evidenceImage(gray,pale,w,h,vertical){
    const scores=new Float32Array(w*h),T=vertical?w:h,step=vertical?1:w,reach=vertical?12:24;
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){
      const i=y*w+x,t=vertical?x:y,g=gray[i];let up=0,dn=0,a=0,b=0;
      for(let d=1;d<=reach;d++){
        if(t>=d)up=Math.max(up,pale[i-d*step]);if(t+d<T)dn=Math.max(dn,pale[i+d*step]);
        if(d<=6){if(t>=d)a=Math.max(a,g-gray[i-d*step]);if(t+d<T)b=Math.max(b,g-gray[i+d*step]);}
      }
      const trough=Math.min(up,dn)-g,ridge=Math.min(a,b);
      scores[i]=Math.max(0,Math.min(1,Math.max((trough-80)/80,(ridge-100)/80)))*(!vertical&&!(g<=25&&trough>100)?.97:1);
    }return scores;
  }
  function bands(values,threshold,lo,hi,gap=7){
    const out=[];let start=-1;
    for(let t=lo;t<hi;t++){
      if(values[t]>threshold&&start<0)start=t;
      if(start>=0&&(values[t]<=threshold||t===hi-1)){
        if(out.length&&start-out[out.length-1][1]<gap)out[out.length-1][1]=t;else out.push([start,t]);start=-1;
      }
    }return out;
  }
  function pathEvidence(score,pts,w){
    let cost=0,matched=0,gap=0,maxGap=0;const quarters=Array.from({length:4},()=>({samples:0,matched:0}));
    for(let i=0;i<pts.length;i++){
      const [x,y]=pts[i],s=score[y*w+x],yes=s>.2;cost+=1-s;matched+=yes;gap=yes?0:gap+1;maxGap=Math.max(maxGap,gap);
      const q=quarters[Math.min(3,Math.floor(4*i/pts.length))];q.samples++;q.matched+=yes;
    }
    return {samples:pts.length,matched,maxGap,cost:cost/pts.length,quarters};
  }
  function horizontal(score,w,h,log){
    const x0=Math.round(w*.045),x1=w-1-x0,L=x1-x0+1,left=new Float64Array(h),right=new Float64Array(h);
    for(let y=0;y<h;y++)for(let dx=0;dx<12;dx++){left[y]+=score[y*w+x0+dx]/12;right[y]+=score[y*w+x1-dx]/12;}
    const starts=bands(left,.65,0,h),ends=bands(right,.65,0,h),candidates=[];
    if(starts.length<5||starts.length>24||ends.length<5||ends.length>24)return null;
    for(const [lo,hi] of starts){
      let dp=new Float64Array(h).fill(1e6);for(let y=lo;y<=hi;y++)dp[y]=0;
      const back=new Int16Array(L*h);
      for(let xx=0;xx<L;xx++){
        const next=new Float64Array(h).fill(1e6);
        // Match the deterministic increasing-displacement tie order.
        for(let d=-3;d<=3;d++)for(let y=Math.max(0,d);y<Math.min(h,h+d);y++){
          const v=dp[y-d]+Math.abs(d)*.065;
          if(v<next[y]){next[y]=v;back[xx*h+y]=y-d;}
        }
        for(let y=0;y<h;y++)next[y]+=1-score[y*w+x0+xx];dp=next;
      }
      for(const [a,b] of ends){
        if(Math.abs((lo+hi-a-b)/2)>h*.25)continue;
        let end=a;for(let y=a+1;y<=b;y++)if(dp[y]<dp[end])end=y;
        const cost=dp[end]/L;if(cost>=.16)continue;
        const ys=new Array(L);ys[L-1]=end;for(let xx=L-1;xx>0;xx--)ys[xx-1]=back[xx*h+ys[xx]];
        candidates.push({ys,cost,average:mean(ys)});
      }
    }
    if(candidates.length>200)return null;
    candidates.sort((a,b)=>a.average-b.average);
    const best=candidates.map(c=>c.average<h*.06?{ids:[c],cost:c.cost}:{ids:[],cost:1e6});
    for(let i=0;i<candidates.length;i++)for(let j=0;j<i;j++){
      if(!best[j].ids.length)continue;
      const d=candidates[i].ys.map((y,k)=>y-candidates[j].ys[k]),sorted=d.slice().sort((a,b)=>a-b),A=sum(d);
      const q=.01*(L-1),k=Math.floor(q),p01=sorted[k]+(sorted[Math.min(L-1,k+1)]-sorted[k])*(q-k);
      if(p01<8||A/L<h*.045||A>w*h*.45)continue;
      const ids=best[j].ids.concat(candidates[i]),cost=best[j].cost+candidates[i].cost;
      if(ids.length>best[i].ids.length||ids.length===best[i].ids.length&&cost<best[i].cost)best[i]={ids,cost};
    }
    let chosen=null;
    for(let i=0;i<candidates.length;i++)if(candidates[i].average>h*.94&&(!chosen||best[i].ids.length>chosen.ids.length||best[i].ids.length===chosen.ids.length&&best[i].cost<chosen.cost))chosen=best[i];
    // Several transverse scenes and a separate terminal fan are compulsory.
    if(!chosen||chosen.ids.length<6||chosen.ids.length>10)return null;
    const paths=chosen.ids.map(c=>c.ys),evidence=paths.map(p=>pathEvidence(score,p.map((y,i)=>[x0+i,y]),w));
    if(evidence.some((e,i)=>e.matched/e.samples<(i===paths.length-1?.94:.96)||e.maxGap>(i===paths.length-1?20:10)))return null;
    const terminal=paths[paths.length-2],drop=Math.max(...terminal)-(terminal[0]+terminal[L-1])/2;
    if(drop<h*.12||mean(paths[paths.length-1])-mean(terminal)<h*.18)return null;
    log?.('curved rims: transverse paths '+paths.length);
    return {x0,x1,paths,evidence};
  }
  function extended(path,x0,w){return Array.from({length:w},(_,x)=>path[Math.max(0,Math.min(path.length-1,x-x0))]);}
  function terminalFan(score,w,h,model,log){
    const upper=extended(model.paths[model.paths.length-2],model.x0,w),bottom=extended(model.paths[model.paths.length-1],model.x0,w),profile=new Float64Array(w);
    for(let x=0;x<w;x++)for(let d=6;d<27;d++)profile[x]+=score[(bottom[x]-d)*w+x]/21;
    const starts=bands(profile,.57,Math.round(w*.08),Math.round(w*.92),6),paths=[],evidence=[],rejected=[];
    if(starts.length>16)return null;
    for(const [lo,hi] of starts){
      const y0=Math.min(...bottom.slice(lo,hi+1)),y1=Math.min(...upper),xmin=Math.max(1,lo-Math.floor(w*.15)),xmax=Math.min(w-1,hi+Math.floor(w*.15));
      let dp=new Float64Array(w).fill(1e6);for(let x=lo;x<=hi;x++)dp[x]=0;
      const back=new Int16Array(w*h);let best=1e6,bx=0,by=0;
      for(let y=y0;y>=y1;y--){
        const next=new Float64Array(w).fill(1e6);
        for(let x=xmin;x<xmax;x++){
          if(y<upper[x]-2)continue;
          for(let dx=-3;dx<=3;dx++){
            const j=x+dx;if(j<0||j>=w)continue;
            const v=dp[j]+Math.abs(dx)*.065+1-score[y*w+x];
            if(v<next[x]){next[x]=v;back[y*w+x]=j;}
          }
          if(Math.abs(y-upper[x])<=2&&y0-y>h*.15){const c=next[x]/(y0-y+1);if(c<best){best=c;bx=x;by=y;}}
        }dp=next;
      }
      if(best>=.14){rejected.push({bottom:[lo,hi],cost:best});continue;}
      let x=bx;const path=[];for(let y=by;y<=y0;y++){path.push([x,y]);x=back[y*w+x];}
      const ev=pathEvidence(score,path,w);
      if(ev.matched/ev.samples<.96||ev.maxGap>10){rejected.push({bottom:[lo,hi],...ev});continue;}
      if(paths.some(p=>Math.abs(p[p.length-1][0]-path[path.length-1][0])<w*.08))return null;
      paths.push(path);evidence.push(ev);
    }
    const items=paths.map((p,i)=>({p,e:evidence[i]})).sort((a,b)=>a.p[a.p.length-1][0]-b.p[b.p.length-1][0]);
    if(items.length<2||items.length>5)return null;
    for(let i=1;i<items.length;i++){
      const a=items[i-1].p,b=items[i].p,lo=Math.max(a[0][1],b[0][1]),hi=Math.min(a[a.length-1][1],b[b.length-1][1]);
      for(let y=lo;y<=hi;y++)if(b[y-b[0][1]][0]-a[y-a[0][1]][0]<w*.065)return null;
    }
    log?.('curved rims: terminal separators '+items.length+'; rejected '+rejected.length);
    return {paths:items.map(i=>i.p),evidence:items.map(i=>i.e),rejected};
  }
  function flood(mask,w,h){
    const seen=new Uint8Array(w*h),queue=new Int32Array(w*h);let n=0,head=0;
    const offer=i=>{if(mask[i]&&!seen[i]){seen[i]=1;queue[n++]=i;}};
    for(let x=0;x<w;x++){offer(x);offer((h-1)*w+x);}for(let y=0;y<h;y++){offer(y*w);offer(y*w+w-1);}
    while(head<n){const i=queue[head++],x=i%w,y=i/w|0;if(x)offer(i-1);if(x+1<w)offer(i+1);if(y)offer(i-w);if(y+1<h)offer(i+w);}
    return seen;
  }
  function components(mask,w,h){
    const ids=new Int32Array(w*h),queue=new Int32Array(w*h),out=[];let id=0;
    for(let seed=0;seed<ids.length;seed++)if(mask[seed]&&!ids[seed]){
      if(++id>16000)return null;let n=1,head=0,x0=w,y0=h,x1=-1,y1=-1;queue[0]=seed;ids[seed]=id;
      while(head<n){const i=queue[head++],x=i%w,y=i/w|0;x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);
        const add=j=>{if(mask[j]&&!ids[j]){ids[j]=id;queue[n++]=j;}};
        if(x)add(i-1);if(x+1<w)add(i+1);if(y)add(i-w);if(y+1<h)add(i+w);
      }out.push({id,pixels:n,box:[x0,y0,x1+1,y1+1]});
    }return {ids,items:out};
  }
  function whiteOwnership(rgba,gray,labels,w,h,count){
    const white=new Uint8Array(w*h);for(let i=0;i<white.length;i++)white[i]=gray[i]>=215&&rgba[i*4+2]>=180;
    const cc=components(white,w,h);if(!cc)return null;const records=[];
    for(const c of cc.items){
      if(c.pixels<250)continue;
      const [a,b,A,B]=c.box,x0=Math.max(0,a-2),y0=Math.max(0,b-2),x1=Math.min(w,A+2),y1=Math.min(h,B+2),W=x1-x0,H=y1-y0;
      if(c.pixels>w*h*.08)continue;
      const inverse=new Uint8Array(W*H).fill(1);for(let y=b;y<B;y++)for(let x=a;x<A;x++)if(cc.ids[y*w+x]===c.id)inverse[(y-y0)*W+x-x0]=0;
      const outside=flood(inverse,W,H),fill=new Uint8Array(W*H),votes=new Array(count+1).fill(0);let pixels=0;
      for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x;if(!outside[i]){fill[i]=1;pixels++;votes[labels[(y+y0)*w+x+x0]]++;}}
      if(!pixels||pixels/((A-a)*(B-b))<.40||c.pixels/pixels<.50)continue;
      let owner=1;for(let k=2;k<=count;k++)if(votes[k]>votes[owner])owner=k;
      if(votes[owner]/pixels<.55)return null;
      // One measured-pixel fringe preserves the anti-aliased balloon outline.
      let changed=0,retained=0;
      for(let y=0;y<H;y++)for(let x=0;x<W;x++){
        let yes=false;for(let dy=-1;dy<=1&&!yes;dy++)for(let dx=-1;dx<=1;dx++){const xx=x+dx,yy=y+dy;if(xx>=0&&xx<W&&yy>=0&&yy<H&&fill[yy*W+xx]){yes=true;break;}}
        if(yes){const i=(y+y0)*w+x+x0;changed+=labels[i]!==owner;labels[i]=owner;retained++;}
      }
      records.push({box:c.box,pixels:c.pixels,filled:pixels,retained,owner,votes,changed});
    }return records;
  }
  function reconcileComponents(labels,gray,w,h,count){
    const core=new Uint8Array(w*h),small=[];let discarded=0,reassigned=0;
    for(let k=1;k<=count;k++){
      const mask=new Uint8Array(w*h);for(let i=0;i<mask.length;i++)mask[i]=labels[i]===k;
      const cc=components(mask,w,h);if(!cc||!cc.items.length)return null;
      const sorted=cc.items.slice().sort((a,b)=>b.pixels-a.pixels),main=sorted[0];
      if(main.pixels<w*h*.035)return null;
      const ids=new Set(sorted.slice(1).map(c=>c.id));
      if(sorted.slice(1).some(c=>c.pixels>w*h*.001))return null;
      const pixels=new Map(sorted.slice(1).map(c=>[c.id,[]]));
      for(let i=0;i<labels.length;i++)if(cc.ids[i]===main.id)core[i]=k;else if(ids.has(cc.ids[i]))pixels.get(cc.ids[i]).push(i);
      for(const a of pixels.values())small.push({owner:k,pixels:a});
    }
    for(const s of small){
      const owners=new Set();
      for(const i of s.pixels){const x=i%w,y=i/w|0;for(const j of [x?i-1:-1,x+1<w?i+1:-1,y?i-w:-1,y+1<h?i+w:-1])if(j>=0&&core[j])owners.add(core[j]);}
      const owner=owners.size===1?[...owners][0]:0;
      for(const i of s.pixels){labels[i]=owner;if(owner)reassigned++;else discarded++;}
    }
    if(discarded>w*h*.002)return null;
    return {reassigned,discarded};
  }
  function raster(rgba,gray,w,h,model,fan,base){
    const paths=model.paths.map(p=>extended(p,model.x0,w)),upper=paths[paths.length-2],labels=new Uint8Array(w*h),terminal=paths.length-1,count=terminal+fan.paths.length;
    const fanX=fan.paths.map(ps=>Array.from({length:h},(_,y)=>ps[Math.max(0,Math.min(ps.length-1,y-ps[0][1]))][0]));
    const mask=new Uint8Array(w*h);for(let i=0;i<mask.length;i++)mask[i]=gray[i]<=base+15;const outside=flood(mask,w,h);
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){
      let k=1;for(let j=1;j<paths.length-1;j++)if(y>=paths[j][x])k++;
      if(k>=terminal)for(const xs of fanX)if(x>xs[y])k++;
      labels[y*w+x]=outside[y*w+x]?0:k;
    }
    const balloons=whiteOwnership(rgba,gray,labels,w,h,count);if(!balloons)return null;
    const cleanup=reconcileComponents(labels,gray,w,h,count);if(!cleanup)return null;
    const stats=Array.from({length:count},()=>({pixels:0,total:0,total2:0,dark:0,light:0}));
    for(let i=0;i<labels.length;i++)if(labels[i]){const s=stats[labels[i]-1],g=gray[i];s.pixels++;s.total+=g;s.total2+=g*g;s.dark+=g<45;s.light+=g>170;}
    for(const s of stats){s.mean=s.total/s.pixels;s.variance=s.total2/s.pixels-s.mean*s.mean;delete s.total;delete s.total2;}
    if(stats.some(s=>!ok(s.pixels/(w*h),.035,.40)||!ok(s.mean,20,210)||s.variance<500||s.dark/s.pixels<.04||s.light/s.pixels<.015))return null;
    return {labels,balloons,cleanup,stats,count};
  }
  function trace(labels,w,h,id){
    const edges=[],next=new Map(),stride=w+1;
    const add=(x,y,X,Y,dir)=>{const a=y*stride+x,b=Y*stride+X,key=edges.length;edges.push({a,b,dir});if(!next.has(a))next.set(a,[]);next.get(a).push(key);};
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x;if(labels[i]!==id)continue;
      if(!y||labels[i-w]!==id)add(x,y,x+1,y,0);if(x+1===w||labels[i+1]!==id)add(x+1,y,x+1,y+1,1);
      if(y+1===h||labels[i+w]!==id)add(x+1,y+1,x,y+1,2);if(!x||labels[i-1]!==id)add(x,y+1,x,y,3);
    }
    if(edges.length>20000)return null;const used=new Uint8Array(edges.length),rings=[];
    for(let seed=0;seed<edges.length;seed++)if(!used[seed]){
      let at=seed;const pts=[];
      for(let steps=0;steps<=edges.length;steps++){
        if(used[at])return null;const e=edges[at];used[at]=1;pts.push([e.a%stride,e.a/stride|0]);if(e.b===edges[seed].a)break;
        const opts=(next.get(e.b)||[]).filter(k=>!used[k]);if(!opts.length)return null;
        const rank=k=>{const d=(edges[k].dir-e.dir+4)%4;return d===1?0:d===0?1:d===3?2:3;};opts.sort((a,b)=>rank(a)-rank(b));at=opts[0];
      }
      const q=pts.filter((p,i)=>{const a=pts[(i+pts.length-1)%pts.length],b=pts[(i+1)%pts.length];return (p[0]-a[0])*(b[1]-p[1])!==(p[1]-a[1])*(b[0]-p[0]);});
      if(q.length<4||q.length>4096||!area(q))return null;rings.push(q);if(rings.length>64)return null;
    }return rings.sort((a,b)=>Math.abs(area(b))-Math.abs(area(a)));
  }
  function rasterMatches(rings,labels,w,h,id){
    for(let y=0;y<h;y++){
      const xs=[],py=y+.5;for(const q of rings)for(let j=0;j<q.length;j++){const a=q[j],b=q[(j+1)%q.length];if((a[1]>py)!==(b[1]>py))xs.push(a[0]+(py-a[1])*(b[0]-a[0])/(b[1]-a[1]));}
      xs.sort((a,b)=>a-b);if(xs.length%2)return false;let j=0;
      for(let x=0;x<w;x++){while(j<xs.length&&x+.5>=xs[j])j++;if(Boolean(j%2)!==(labels[y*w+x]===id))return false;}
    }return true;
  }
  function analyzeRGBA(rgba,w,h,log){
    const image=input(rgba,w,h);if(!image)return [];
    const hs=evidenceImage(image.gray,image.pale,w,h,false),model=horizontal(hs,w,h,log);if(!model)return [];
    const vs=evidenceImage(image.gray,image.pale,w,h,true),fan=terminalFan(vs,w,h,model,log);if(!fan)return [];
    const r=raster(rgba,image.gray,w,h,model,fan,image.matte.base);if(!r){log?.('curved rims: raster/ownership withheld');return [];}
    const network={model,fan,matte:image.matte,balloons:r.balloons,cleanup:r.cleanup,stats:r.stats};
    const out=[];
    for(let k=1;k<=r.count;k++){
      const rings=trace(r.labels,w,h,k);if(!rings||!rasterMatches(rings,r.labels,w,h,k))return [];
      const b=bounds(rings.flat()),proof={version:1,method:METHOD,analysisWidth:w,analysisHeight:h,index:k-1,network,pixels:r.stats[k-1].pixels,pixelContours:rings};
      out.push({x:b[0]/w,y:b[1]/h,w:(b[2]-b[0])/w,h:(b[3]-b[1])/h,_contours:rings.map(q=>q.map(([x,y])=>({x:x/w,y:y/h}))),_identitySource:'curved-rim-frame',_geometryOwner:'curved-rim-contours',_geometryType:'noncrossing-pale-rim-network',_curvedRimProof:proof});
    }
    log?.('curved rims: '+out.length+' candidates, valid='+out.map(validPanel).join(','));
    return out.every(validPanel)?out:[];
  }
  function validPanel(panel){try{
    const p=panel?._curvedRimProof,w=p?.analysisWidth,h=p?.analysisHeight,n=p?.network,m=n?.model,f=n?.fan,rings=p?.pixelContours;
    if(panel?._identitySource!=='curved-rim-frame'||p.version!==1||p.method!==METHOD||!Number.isInteger(w)||!Number.isInteger(h)||!ok(w,300,900)||!ok(h,500,900)||!ok(w/h,.50,.85)||!m||!f)return false;
    if(panel._geometryOwner!==undefined&&panel._geometryOwner!=='curved-rim-contours'||panel._geometryType!==undefined&&panel._geometryType!=='noncrossing-pale-rim-network')return false;
    if(m.x0!==Math.round(w*.045)||m.x1!==w-1-m.x0||!Array.isArray(m.paths)||!ok(m.paths.length,6,10)||!Array.isArray(f.paths)||!ok(f.paths.length,2,5))return false;
    const L=m.x1-m.x0+1,count=m.paths.length-1+f.paths.length;
    if(!Number.isInteger(p.index)||!ok(p.index,0,count-1)||m.paths.some(ps=>!Array.isArray(ps)||ps.length!==L||ps.some((y,i)=>!Number.isInteger(y)||y<0||y>=h||i&&Math.abs(y-ps[i-1])>3)))return false;
    if(mean(m.paths[0])>=h*.06||mean(m.paths[m.paths.length-1])<=h*.94)return false;
    for(let k=1;k<m.paths.length;k++)if(m.paths[k].some((y,i)=>y<=m.paths[k-1][i]))return false;
    const ev=(e,min,gap)=>e&&Number.isInteger(e.samples)&&e.samples>100&&Number.isInteger(e.matched)&&ok(e.matched/e.samples,min,1)&&Number.isInteger(e.maxGap)&&ok(e.maxGap,0,gap)&&ok(e.cost,0,.20)&&Array.isArray(e.quarters)&&e.quarters.length===4&&e.quarters.every(q=>Number.isInteger(q.samples)&&Number.isInteger(q.matched)&&ok(q.matched,0,q.samples))&&sum(e.quarters.map(q=>q.samples))===e.samples&&sum(e.quarters.map(q=>q.matched))===e.matched;
    if(!Array.isArray(m.evidence)||m.evidence.length!==m.paths.length||m.evidence.some((e,i)=>e.samples!==L||!ev(e,i===m.paths.length-1?.94:.96,i===m.paths.length-1?20:10)))return false;
    if(!Array.isArray(f.evidence)||f.evidence.length!==f.paths.length||f.evidence.some(e=>!ev(e,.96,10)))return false;
    if(f.paths.some((ps,k)=>!Array.isArray(ps)||ps.length!==f.evidence[k].samples||ps.some((p,i)=>!Array.isArray(p)||p.length!==2||p.some(v=>!Number.isInteger(v))||!ok(p[0],0,w-1)||!ok(p[1],0,h-1)||i&&(p[1]!==ps[i-1][1]+1||Math.abs(p[0]-ps[i-1][0])>3))))return false;
    // The proof's terminal seams must still join the measured upper/lower rims,
    // stay in the terminal region, and remain disjoint in left-to-right order.
    if(panel._quad||panel._outline)return false;
    const top=m.paths[m.paths.length-2],bottom=m.paths[m.paths.length-1];
    const yy=(ps,x)=>ps[Math.max(0,Math.min(L-1,x-m.x0))];
    if(Math.max(...top)-(top[0]+top[L-1])/2<h*.12||mean(bottom)-mean(top)<h*.18)return false;
    for(let k=0;k<f.paths.length;k++){
      const ps=f.paths[k],a=ps[0],b=ps[ps.length-1];
      if(Math.abs(a[1]-yy(top,a[0]))>4||Math.abs(b[1]-yy(bottom,b[0]))>16||ps.some(([x,y])=>y<yy(top,x)-4||y>yy(bottom,x)+4))return false;
      if(k){const prior=f.paths[k-1];for(const [x,y] of ps){const i=y-prior[0][1];if(i>=0&&i<prior.length&&x<=prior[i][0])return false;}}
    }
    const matte=n.matte;if(!matte||!Array.isArray(matte.color)||matte.color.length!==3||matte.color.some(v=>!Number.isInteger(v)||!ok(v,0,255))||matte.base!==matte.color[0]*.299+matte.color[1]*.587+matte.color[2]*.114||!ok(matte.base,0,25)||!Number.isInteger(matte.samples)||matte.samples!==2*(Math.ceil(w/2)+Math.ceil(h/2))||!Number.isInteger(matte.matched)||!ok(matte.matched/matte.samples,.96,1))return false;
    if(!Array.isArray(n.stats)||n.stats.length!==count||n.stats.some(s=>!Number.isInteger(s.pixels)||!ok(s.pixels/(w*h),.035,.4)||!ok(s.mean,20,210)||!ok(s.variance,500,16257)||!Number.isInteger(s.dark)||!ok(s.dark/s.pixels,.04,1)||!Number.isInteger(s.light)||!ok(s.light/s.pixels,.015,1)))return false;
    if(!Number.isInteger(p.pixels)||p.pixels!==n.stats[p.index].pixels||!Array.isArray(rings)||!ok(rings.length,1,64)||rings.some(q=>!Array.isArray(q)||!ok(q.length,4,4096)||q.some((v,i)=>!Array.isArray(v)||v.length!==2||v.some(a=>!Number.isInteger(a))||!ok(v[0],0,w)||!ok(v[1],0,h)||(v[0]!==q[(i+1)%q.length][0]&&v[1]!==q[(i+1)%q.length][1]))))return false;
    if(sum(rings.map(area))!==p.pixels||JSON.stringify(panel._contours)!==JSON.stringify(rings.map(q=>q.map(([x,y])=>({x:x/w,y:y/h})))))return false;
    if(!n.cleanup||!Number.isInteger(n.cleanup.discarded)||!ok(n.cleanup.discarded,0,w*h*.002)||!Number.isInteger(n.cleanup.reassigned)||n.cleanup.reassigned<0||!Array.isArray(n.balloons))return false;
    if(n.balloons.some(b=>!Number.isInteger(b.owner)||!ok(b.owner,1,count)||!Number.isInteger(b.filled)||b.filled<250||!Array.isArray(b.votes)||b.votes.length!==count+1||sum(b.votes)!==b.filled||b.votes[b.owner]/b.filled<.55||b.pixels/b.filled<.5))return false;
    const b=bounds(rings.flat());return ['x','y','w','h'].every(k=>Number.isFinite(panel[k]))&&Math.max(Math.abs(panel.x-b[0]/w),Math.abs(panel.y-b[1]/h),Math.abs(panel.w-(b[2]-b[0])/w),Math.abs(panel.h-(b[3]-b[1])/h))<1e-10;
  }catch(_){return false;}}
  function analyzeImage(img,log){
    if(!img||!Number.isFinite(img.width)||!Number.isFinite(img.height)||img.width<1||img.height<1)return [];
    try{const s=Math.min(1,900/Math.max(img.width,img.height)),w=Math.round(img.width*s),h=Math.round(img.height*s),c=document.createElement('canvas');c.width=w;c.height=h;
      const ctx=c.getContext('2d',{willReadFrequently:true});if(!ctx)return [];ctx.drawImage(img,0,0,w,h);return analyzeRGBA(ctx.getImageData(0,0,w,h).data,w,h,log);
    }catch(e){log?.('curved rim route deferred: '+e.message);return [];}
  }
  return {analyzeImage,analyzeRGBA,validPanel};
})();
