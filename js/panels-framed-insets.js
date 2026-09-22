/* Nth Shelf Frame Test 14 — a closed light rim crossing exterior gutters.
 * A framed inset can bridge several panel rows without joining their artwork.
 * Propose a connected light RING (not a bright box), prove its enclosed hole,
 * dark outer collar, and two independent exterior-matte corridors on BOTH sides.
 * The rim, never a tap/filename/page number, determines the retained outline.
 * Unknown/open/ambiguous rings and internal divider/inset evidence are misses.
 * This route runs only after previous stable identity routes return empty.
 */
const PanelFramedInsets = (() => {
  'use strict';
  const METHOD='closed-light-rim-crossing-two-matte-corridors';
  const finite=Number.isFinite,range=(n,a,b)=>finite(n)&&n>=a&&n<=b;
  const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
  const area=q=>q.reduce((s,p,i)=>{const a=q[(i+1)%q.length];return s+p[0]*a[1]-a[0]*p[1];},0)/2;
  const bounds=q=>[Math.min(...q.map(p=>p[0])),Math.min(...q.map(p=>p[1])),Math.max(...q.map(p=>p[0])),Math.max(...q.map(p=>p[1]))];
  function hull(points){
    const p=[...new Map(points.map(p=>[p.join(','),p])).values()].sort((a,b)=>a[0]-b[0]||a[1]-b[1]);if(p.length<4)return null;
    const half=ps=>{const out=[];for(const p of ps){while(out.length>1&&cross(out.at(-2),out.at(-1),p)<=0)out.pop();out.push(p);}out.pop();return out;};
    return half(p).concat(half(p.slice().reverse()));
  }
  const expand=(q,d)=>hull(q.flatMap(p=>[-d,d].flatMap(x=>[-d,d].map(y=>[p[0]+x,p[1]+y]))));
  function exterior(rgba,w,h){
    const edge=[];for(let x=0;x<w;x+=2){edge.push(x,(h-1)*w+x);}for(let y=0;y<h;y+=2){edge.push(y*w,y*w+w-1);}
    const color=[0,1,2].map(c=>{const a=edge.map(i=>rgba[i*4+c]).sort((a,b)=>a-b);return a[a.length>>1];});
    const matches=(i,d)=>[0,1,2].every(c=>Math.abs(rgba[i*4+c]-color[c])<=d);
    const edgeMatched=edge.filter(i=>matches(i,6)).length;
    if(color[0]*.299+color[1]*.587+color[2]*.114>25||edgeMatched/edge.length<.97)return null;
    const bg=new Uint8Array(w*h),queue=new Int32Array(w*h);let head=0,n=0;
    const offer=i=>{if(!bg[i]&&matches(i,5)){bg[i]=1;queue[n++]=i;}};
    for(let x=0;x<w;x++){offer(x);offer((h-1)*w+x);}for(let y=0;y<h;y++){offer(y*w);offer(y*w+w-1);}
    while(head<n){const i=queue[head++],x=i%w,y=i/w|0;if(x)offer(i-1);if(x+1<w)offer(i+1);if(y)offer(i-w);if(y+1<h)offer(i+w);}
    return n>=w*h*.025?{bg,color,edgeSamples:edge.length,edgeMatched,exteriorPixels:n}:null;
  }
  function lightComponents(gray,w,h,cutoff=130){
    const labels=new Int32Array(w*h),queue=new Int32Array(w*h),out=[];let id=0;
    for(let start=0;start<labels.length;start++)if(gray[start]>cutoff&&!labels[start]){
      if(++id>16000)return null;let head=0,n=1,x0=w,y0=h,x1=0,y1=0;queue[0]=start;labels[start]=id;
      const min=new Int32Array(h).fill(w),max=new Int32Array(h).fill(-1);
      while(head<n){const i=queue[head++],x=i%w,y=i/w|0;x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);min[y]=Math.min(min[y],x);max[y]=Math.max(max[y],x);
        for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
          if((!dx&&!dy)||x+dx<0||x+dx>=w||y+dy<0||y+dy>=h)continue;
          const j=i+dy*w+dx;if(!labels[j]&&gray[j]>cutoff){labels[j]=id;queue[n++]=j;}
        }
      }
      const A=(x1-x0+1)*(y1-y0+1);
      if(x1-x0<w*.13||y1-y0<h*.11||A<w*h*.035||A>w*h*.18||n/A<.012||n/A>.10)continue;
      const pts=[];for(let y=y0;y<=y1;y++)if(max[y]>=0)pts.push([min[y],y],[max[y],y]);
      const q=hull(pts);if(q)out.push({id,pixels:n,box:[x0,y0,x1,y1],rim:expand(q,.5)});
    }
    return {labels,out};
  }
  function enclosed(c,labels,gray,w,h){
    const [x0,y0,x1,y1]=c.box,W=x1-x0+1,H=y1-y0+1,seen=new Uint8Array(W*H),queue=new Int32Array(W*H);
    const isRim=(x,y)=>labels[(y+y0)*w+x+x0]===c.id;let head=0,n=0;
    const offer=(x,y)=>{const k=y*W+x;if(!seen[k]&&!isRim(x,y)){seen[k]=1;queue[n++]=k;}};
    for(let x=0;x<W;x++){offer(x,0);offer(x,H-1);}for(let y=0;y<H;y++){offer(0,y);offer(W-1,y);}
    const flood=()=>{while(head<n){const i=queue[head++],x=i%W,y=i/W|0;if(x)offer(x-1,y);if(x+1<W)offer(x+1,y);if(y)offer(x,y-1);if(y+1<H)offer(x,y+1);}};flood();
    const holes=[];
    for(let start=0;start<seen.length;start++)if(!seen[start]&&!isRim(start%W,start/W|0)){
      head=0;n=0;offer(start%W,start/W|0);flood();let sx0=W,sy0=H,sx1=0,sy1=0,sum=0,square=0,dark=0,light=0;
      for(let j=0;j<n;j++){const i=queue[j],x=i%W,y=i/W|0,g=gray[(y+y0)*w+x+x0];sx0=Math.min(sx0,x);sx1=Math.max(sx1,x);sy0=Math.min(sy0,y);sy1=Math.max(sy1,y);sum+=g;square+=g*g;dark+=g<70;light+=g>140;}
      if(n>Math.max(8,W*H*.005))holes.push({pixels:n,box:[x0+sx0,y0+sy0,x0+sx1,y0+sy1],mean:sum/n,variance:square/n-(sum/n)**2,dark,light});
    }
    return holes.length===1?holes[0]:null;
  }
  function collar(q,gray,w,h){
    const sides=Array.from({length:4},()=>({samples:0,matched:0,maxGap:0}));
    for(let i=0;i<q.length;i++){
      const a=q[i],b=q[(i+1)%q.length],dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy),nx=dy/L,ny=-dx/L;
      const side=Math.abs(nx)>Math.abs(ny)?(nx<0?2:3):(ny<0?0:1),s=sides[side];let gap=0;
      for(let t=1;t<L-1;t++){
        let yes=false;for(const d of [.5,1,1.5,2]){const x=Math.round(a[0]+dx*t/L+nx*d),y=Math.round(a[1]+dy*t/L+ny*d);
          if(x<0||x>=w||y<0||y>=h)return null;if(gray[y*w+x]<80)yes=true;}
        s.samples++;s.matched+=yes;gap=yes?0:gap+1;s.maxGap=Math.max(s.maxGap,gap);
      }
    }
    return sides.every(s=>s.samples>=45&&s.matched/s.samples>=.95&&s.maxGap<=Math.max(3,s.samples*.035))?sides:null;
  }
  function corridors(c,bg,w,h){
    const result=[],[x0,y0,x1,y1]=c.box;
    for(const v of [false,true]){
      const lo=v?x0:y0,hi=v?x1:y1,a=v?y0:x0,b=v?y1:x1,depth=Math.max(24,Math.round((v?h:w)*.055));
      if(a-depth-3<0||b+depth+3>=(v?h:w))continue;
      const good=[];
      for(let t=lo+6;t<=hi-6;t++){
        let left=0,right=0;
        for(let d=3;d<depth+3;d++){left+=bg[v?(a-d)*w+t:t*w+a-d];right+=bg[v?(b+d)*w+t:t*w+b+d];}
        if(left/depth>=.90&&right/depth>=.90)good.push({t,left,right});
      }
      const runs=[];let row=[];for(const item of good){if(row.length&&item.t!==row.at(-1).t+1){if(row.length>=2)runs.push(row);row=[];}row.push(item);}if(row.length>=2)runs.push(row);
      // Exactly two short, well-separated corridors. A giant patch of empty
      // matte around a floating decoration is not two independent panel rows.
      const eligible=runs.filter(r=>r.length<=Math.min(18,(hi-lo)*.10));
      if(eligible.length!==2||runs.length!==2||eligible[1][0].t-eligible[0].at(-1).t<(hi-lo)*.45)continue;
      const bands=eligible.map(r=>({lo:r[0].t,hi:r.at(-1).t,rows:r.length,left:r.reduce((n,p)=>n+p.left,0),right:r.reduce((n,p)=>n+p.right,0)}));
      result.push({vertical:v,depth,bands});
    }
    return result.length===1?result[0]:null;
  }
  // Veto only: a sustained neutral stroke inside the ring can split it into
  // multiple frames. A long dark *path* through hatching is insufficient.
  function uniformDivider(rgba,gray,w,h,box){
    for(const v of [false,true]){
      const [x0,y0,x1,y1]=box,lo=v?y0:x0,hi=v?y1:x1,a=v?x0:y0,b=v?x1:y1,margin=Math.max(10,(b-a)*.10),index=(t,p)=>v?t*w+p:p*w+t;
      for(let p=Math.ceil(a+margin);p<b-margin;p++){
        let n=0,neutral=0,narrow=0,sum=0,square=0;
        for(let t=lo+3;t<=hi-3;t++){
          const i=index(t,p),g=gray[i],r=rgba[i*4],gg=rgba[i*4+1],bb=rgba[i*4+2];n++;
          if(g>=80||Math.max(r,gg,bb)-Math.min(r,gg,bb)>10)continue;
          neutral++;sum+=g;square+=g*g;let l=p,rr=p;
          while(l>p-6&&Math.abs(gray[index(t,l-1)]-g)<=3)l--;while(rr<p+6&&Math.abs(gray[index(t,rr+1)]-g)<=3)rr++;
          if(l===p-6||rr===p+6||rr-l>7)continue;
          let before=0,after=0;for(let d=2;d<=4;d++){before+=gray[index(t,l-d)];after+=gray[index(t,rr+d)];}
          narrow+=Math.min(Math.abs(before/3-g),Math.abs(after/3-g))>8;
        }
        if(n>=40&&neutral/n>=.98&&narrow/n>=.72&&square/neutral-(sum/neutral)**2<=36)return true;
      }
    }return false;
  }

  // Independently fitted uniform-ink subrectangles veto a containing inset.
  // Unlike the page-wide collector, these stroke lengths scale to this rim.
  // This can withhold a photograph of a window/grid: conservative, never
  // permission to manufacture a new child panel from interior artwork.
  function uniformInset(rgba,gray,w,h,box,minFraction=.20,extendedRims=false){
    const lines=[[],[]];
    for(const v of [false,true]){
      const [x0,y0,x1,y1]=box,lo=v?y0:x0,hi=v?y1:x1,a=v?x0:y0,b=v?x1:y1,index=(t,p)=>v?t*w+p:p*w+t;
      const neutral=i=>gray[i]<80&&Math.max(rgba[i*4],rgba[i*4+1],rgba[i*4+2])-Math.min(rgba[i*4],rgba[i*4+1],rgba[i*4+2])<=10;
      for(let p=a+3;p<=b-3;p++){
        for(let t=lo+3;t<=hi-3;t++){
          const k=index(t,p);if(!neutral(k))continue;const first=t,ink=gray[k];
          while(t+1<=hi-3&&neutral(index(t+1,p))&&Math.abs(gray[index(t+1,p)]-ink)<=2.5)t++;
          if(t-first<Math.max(24,(hi-lo)*minFraction))continue;
          let n=0,thin=0;
          for(let u=first+2;u<=t-2;u++){
            const c=gray[index(u,p)];let l=p,r=p;n++;
            while(l>p-6&&Math.abs(gray[index(u,l-1)]-c)<=3)l--;while(r<p+6&&Math.abs(gray[index(u,r+1)]-c)<=3)r++;
            if(l===p-6||r===p+6||r-l>7)continue;
            let before=0,after=0;for(let d=2;d<=4;d++){before+=gray[index(u,l-d)];after+=gray[index(u,r+d)];}
            if(Math.max(Math.abs(before/3-c),Math.abs(after/3-c))>18)thin++;
          }
          if(n&&thin/n>=.88)lines[v?1:0].push({p,lo:first,hi:t});
        }
      }
    }
    const [hs,vs]=lines,local=(box[2]-box[0])*(box[3]-box[1]);
    // Wide insets: an interior drawing may touch a nested rim and extend an
    // otherwise uniform stroke. Require four actual intersecting rim spans;
    // do not insist that the connected ink ends at each intersection.
    if(extendedRims)for(let i=0;i<hs.length;i++)for(let j=i+1;j<hs.length;j++){
      const a=hs[i],b=hs[j];if(b.p-a.p<24)continue;
      const verticals=vs.filter(r=>r.lo<=a.p+4&&r.hi>=b.p-4&&r.p>=Math.max(a.lo,b.lo)-4&&r.p<=Math.min(a.hi,b.hi)+4);
      for(let k=0;k<verticals.length;k++)for(let l=k+1;l<verticals.length;l++){
        const left=verticals[k].p,right=verticals[l].p,A=(right-left)*(b.p-a.p);
        if(right-left>=24&&A>=local*.04&&A<=local*.82)return true;
      }
    }
    for(let i=0;i<hs.length;i++)for(let j=i+1;j<hs.length;j++){
      const a=hs[i],b=hs[j];if(b.p-a.p<24||Math.abs(a.lo-b.lo)>5||Math.abs(a.hi-b.hi)>5)continue;
      const left=(a.lo+b.lo)/2,right=(a.hi+b.hi)/2,A=(right-left)*(b.p-a.p);
      if(A<local*.04||A>local*.82||left<box[0]+3||right>box[2]-3)continue;
      const ends=[left,right].map(x=>vs.some(r=>Math.abs(r.p-x)<=5&&Math.abs(r.lo-a.p)<=5&&Math.abs(r.hi-b.p)<=5));
      if(ends.every(Boolean))return true;
    }
    return false;
  }
  function analyzeRGBA(rgba,w,h,log){
    if(!Number.isInteger(w)||!Number.isInteger(h)||!range(w,250,900)||!range(h,350,900)||!rgba||rgba.length!==w*h*4)return [];
    const gray=new Float32Array(w*h);for(let i=0;i<gray.length;i++){if(rgba[i*4+3]!==255)return [];gray[i]=.299*rgba[i*4]+.587*rgba[i*4+1]+.114*rgba[i*4+2];}
    const ex=exterior(rgba,w,h);if(!ex)return [];const cc=lightComponents(gray,w,h);if(!cc)return [];const out=[];
    for(const c of cc.out){
      const A=area(c.rim),B=(c.box[2]-c.box[0]+1)*(c.box[3]-c.box[1]+1);
      if(c.rim.length>48||A/B<.965)continue;
      const hole=enclosed(c,cc.labels,gray,w,h);if(!hole||hole.pixels/A<.88||hole.pixels/A>.98||hole.variance<1000||hole.dark/hole.pixels<.12||hole.light/hole.pixels<.12)continue;
      const dark=collar(c.rim,gray,w,h),crossings=corridors(c,ex.bg,w,h);
      if(!dark||!crossings){log?.('framed inset withheld: '+(!dark?'outer rim':'paired corridors'));continue;}
      // Include complete rim pixels and one independently witnessed dark rim
      // pixel, not neighbouring artwork or an arbitrary bounding rectangle.
      const q=expand(c.rim,1),box=[c.box[0]+7,c.box[1]+7,c.box[2]-7,c.box[3]-7];
      if(q.length>64||q.some(p=>p[0]<0||p[1]<0||p[0]>w||p[1]>h))continue;
      if(uniformDivider(rgba,gray,w,h,box)||uniformInset(rgba,gray,w,h,box)||typeof PanelClosedFrames==='undefined'||PanelClosedFrames.analyzeRGBA(rgba,w,h,null,{gradientOnly:true,localMatteInset:true,vetoCandidates:[{box}]}).length!==1){log?.('framed inset withheld: internal divider/inset');continue;}
      const proof={version:1,method:METHOD,analysisWidth:w,analysisHeight:h,color:ex.color,edgeSamples:ex.edgeSamples,edgeMatched:ex.edgeMatched,exteriorPixels:ex.exteriorPixels,
        rim:c.rim,componentBox:c.box,rimPixels:c.pixels,rimArea:A,hole,dark,crossings,padding:1,q,uniformInkVetoPassed:true,nestedRimVetoPassed:true,dividerVetoPassed:true,insetVetoPassed:true};
      const b=bounds(q),panel={x:b[0]/w,y:b[1]/h,w:(b[2]-b[0])/w,h:(b[3]-b[1])/h,_outline:q.map(p=>({x:p[0]/w,y:p[1]/h})),_identitySource:'bordered-inset-frame',_geometryOwner:'bordered-inset-outline',_geometryType:'closed-rim-over-gutters',_insetRimProof:proof};
      if(validPanel(panel))out.push(panel);else log?.('framed inset withheld: proof validation');
    }
    log?.('framed insets: '+out.length+' closed rings with independent gutter crossings');
    return out.length===1?out:[];
  }

  // Test19 opt-in supplement: a thin rim can contain short ink interruptions
  // and fail the connected-light-ring test. Two independent low-threshold
  // components PROPOSE a box; they never define its crop. Four narrow light
  // ridges, dark collars, a through-gutter, and a re-proved terminal anchor
  // must corroborate it. The old closed-ring detector is unchanged.
  const STEM_METHOD='four-light-ridges-on-terminal-anchored-through-gutter';
  const RIDGE_PADDING=2;
  const lineAt=(r,t)=>r.m*t+r.b;
  function ridgeQuad(rails,padding=RIDGE_PADDING){
    const shifted=rails.map(r=>({...r,b:r.b+(r.side?1:-1)*padding}));
    const meet=(a,b)=>{const x=(b.b+b.m*a.b)/(1-a.m*b.m);return [x,lineAt(a,x)];};
    return [meet(shifted[0],shifted[2]),meet(shifted[0],shifted[3]),meet(shifted[1],shifted[3]),meet(shifted[1],shifted[2])];
  }
  function ridgeEvidence(gray,w,h,r,base){
    let matched=0,quality=0,maxGap=0,gap=0,collarMatched=0,collarGap=0,collarMaxGap=0;
    const quarters=Array.from({length:4},()=>({samples:0,matched:0}));
    const value=(t,p)=>{const x=r.v?p:t,y=r.v?t:p;return x>=0&&x<w&&y>=0&&y<h?gray[y*w+x]:Infinity;};
    const total=r.hi-r.lo+1;
    for(let t=r.lo;t<=r.hi;t++){
      const p=Math.round(lineAt(r,t));let best=0;
      for(let delta=-1;delta<=1;delta++){
        const center=p+delta,bright=value(t,center);let a=Infinity,b=Infinity;
        for(let d=1;d<=3;d++){a=Math.min(a,value(t,center-d));b=Math.min(b,value(t,center+d));}
        const contrast=bright-Math.max(a,b);
        if(bright>base+30&&a<base+30&&b<base+30&&contrast>20)best=Math.max(best,Math.min(contrast,100));
      }
      const yes=best>0;matched+=yes;quality+=best;gap=yes?0:gap+1;maxGap=Math.max(maxGap,gap);
      const quarter=quarters[Math.min(3,Math.floor(4*(t-r.lo)/total))];quarter.samples++;quarter.matched+=yes;
      // Also witness a dark collar on the actual expanded crop boundary.
      const outward=Math.round(lineAt(r,t)+(r.side?1:-1)*RIDGE_PADDING);
      const dark=Math.min(value(t,outward),value(t,outward+(r.side?1:-1)))<base+30;
      collarMatched+=dark;collarGap=dark?0:collarGap+1;collarMaxGap=Math.max(collarMaxGap,collarGap);
    }
    return {total,matched,quality,quarters,maxGap,collarMatched,collarMaxGap};
  }
  function acceptableRidge(e){
    return e.total>=45&&e.matched/e.total>=.95&&e.maxGap<=3&&e.collarMatched/e.total>=.94&&e.collarMaxGap<=4&&e.quarters.every(q=>q.samples>0&&q.matched/q.samples>=.85);
  }
  function fitLightRidge(box,v,side,gray,w,h,base){
    const j=v?1:0,k=1-j,lo=box[j]+4,hi=box[j+2]-4,mid=(lo+hi)/2,p0=box[k+2*side];
    if(hi-lo<45)return null;let best=null;
    for(let slope=-20;slope<=20;slope++)for(let off=-10;off<=10;off++){
      const m=slope*.002,offset=off*.5,r={v,side,m,b:p0+offset-m*mid,lo,hi,offset};
      const e=ridgeEvidence(gray,w,h,r,base);if(!acceptableRidge(e))continue;
      const score=e.matched/e.total+.001*e.quality/e.total-.0005*Math.abs(offset)-.02*Math.abs(m);
      if(!best||score>best.score)best={...r,...e,score};
    }
    return best;
  }
  function darkExterior(gray,w,h,threshold){
    const bg=new Uint8Array(w*h),queue=new Int32Array(w*h);let head=0,n=0;
    const offer=i=>{if(!bg[i]&&gray[i]<=threshold){bg[i]=1;queue[n++]=i;}};
    for(let x=0;x<w;x++){offer(x);offer((h-1)*w+x);}for(let y=0;y<h;y++){offer(y*w);offer(y*w+w-1);}
    while(head<n){const i=queue[head++],x=i%w,y=i/w|0;if(x)offer(i-1);if(x+1<w)offer(i+1);if(y)offer(i-w);if(y+1<h)offer(i+w);}
    return {bg,pixels:n};
  }
  function throughStem(box,gray,bg,w,h,base,anchor){
    const [x0,y0,x1,y1]=box,depth=Math.max(28,Math.round(h*.05)),skip=4;
    if(y0-depth-skip<0||y1+depth+skip>=h)return null;
    if(anchor.y*h-y1<0||anchor.y*h-y1>h*.055)return null;
    // The inset must cross, rather than lie inside, the terminal side gutter.
    const sides=[anchor._terminalProof.rails[2],anchor._terminalProof.rails[3]];
    let best=null;
    for(let x=x0+7;x<x1-8;x++){
      const side=sides.findIndex(r=>Math.abs(lineAt(r,y1+skip+depth/2)-(x+.5))<=6);
      if(side<0)continue;
      let above=0,below=0,left=0,right=0;
      for(let d=skip;d<skip+depth;d++)for(let dx=0;dx<2;dx++){
        above+=bg[(y0-d)*w+x+dx];below+=bg[(y1+d)*w+x+dx];
        let a=0,b=0;for(let k=4;k<=16;k++){a=Math.max(a,gray[(y0-d)*w+x+dx-k]);b=Math.max(b,gray[(y0-d)*w+x+dx+k]);}
        left+=a>base+28;right+=b>base+28;
      }
      const n=2*depth;
      if(above/n<.95||below/n<.95||left/n<.40||right/n<.40)continue;
      const candidate={x,width:2,depth,skip,side,samples:n,above,below,left,right};
      if(!best||above+below+left+right>best.above+best.below+best.left+best.right)best=candidate;
    }
    return best;
  }
  function imageStats(gray,w,box){
    const [x0,y0,x1,y1]=box;let samples=0,sum=0,squares=0,dark=0,light=0;
    for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const g=gray[y*w+x];samples++;sum+=g;squares+=g*g;dark+=g<45;light+=g>100;}
    return {box,samples,mean:sum/samples,variance:squares/samples-(sum/samples)**2,dark,light};
  }
  // Reject a sustained divider even when a small caption/artwork gap
  // interrupts its middle. Both ends need thin, contrasting ink support;
  // broad hair shadows and one short internal stroke do not qualify.
  function interruptedRidgeDivider(rgba,gray,w,h,box){
    for(const vertical of [false,true]){
      const j=vertical?0:1,k=1-j,lo=Math.ceil(box[j]+(box[j+2]-box[j])*.12),hi=Math.floor(box[j+2]-(box[j+2]-box[j])*.12);
      const start=box[k]+3,end=box[k+2]-3,n=end-start+1;if(n<40)continue;
      const index=(t,p)=>vertical?t*w+p:p*w+t;
      for(let pos=lo;pos<=hi;pos++){
        let matched=0,first=0,last=0;
        for(let t=start;t<=end;t++){
          const i=index(t,pos),g=gray[i];if(g>65||Math.max(rgba[i*4],rgba[i*4+1],rgba[i*4+2])-Math.min(rgba[i*4],rgba[i*4+1],rgba[i*4+2])>12)continue;
          let a=pos,b=pos;while(a>pos-6&&Math.abs(gray[index(t,a-1)]-g)<=3)a--;while(b<pos+6&&Math.abs(gray[index(t,b+1)]-g)<=3)b++;
          if(a===pos-6||b===pos+6||b-a>7)continue;
          let before=0,after=0;for(let d=2;d<=4;d++){before+=gray[index(t,a-d)];after+=gray[index(t,b+d)];}
          if(Math.min(before/3-g,after/3-g)<=14)continue;
          matched++;if(t<start+(end-start)*.18)first++;if(t>end-(end-start)*.18)last++;
        }
        if(matched/n>=.60&&first/(n*.18)>=.45&&last/(n*.18)>=.45)return true;
      }
    }return false;
  }
  function validTerminalInset(p){try{
    const pr=p?._insetRimProof,w=pr?.analysisWidth,h=pr?.analysisHeight;
    if(p?._identitySource!=='bordered-inset-frame'||pr?.version!==2||pr.method!==STEM_METHOD||!Number.isInteger(w)||!Number.isInteger(h)||!range(w,250,900)||!range(h,350,900)||pr.padding!==RIDGE_PADDING)return false;
    if(typeof PanelTerminalFrames==='undefined'||!PanelTerminalFrames.validPanel(pr.anchor)||pr.anchor._terminalProof.analysisWidth!==w||pr.anchor._terminalProof.analysisHeight!==h)return false;
    if(!Array.isArray(pr.color)||pr.color.length!==3||pr.color.some(v=>!Number.isInteger(v)||!range(v,0,255))||JSON.stringify(pr.color)!==JSON.stringify(pr.anchor._terminalProof.color))return false;
    const base=.299*pr.color[0]+.587*pr.color[1]+.114*pr.color[2];if(!range(base,0,25)||pr.base!==base)return false;
    if(!Array.isArray(pr.proposals)||pr.proposals.length!==2)return false;
    for(let i=0;i<2;i++){
      const c=pr.proposals[i],b=c?.box;if(c?.cutoff!==[60,70][i]||!Array.isArray(b)||b.length!==4||b.some(n=>!Number.isInteger(n))||b[0]<18||b[1]<18||b[2]>=w-18||b[3]>=h-18||b[0]>=b[2]||b[1]>=b[3])return false;
      const bw=b[2]-b[0]+1,bh=b[3]-b[1]+1,A=bw*bh;
      if(!range(bw/w,.13,.35)||!range(bh/h,.13,.50)||!range(bw/bh,.20,.85)||!range(A/(w*h),.035,.18)||!Number.isInteger(c.pixels)||!range(c.pixels/A,.012,.10))return false;
    }
    const box=pr.proposals[0].box;if(pr.proposals[1].box.some((n,i)=>Math.abs(n-box[i])>2))return false;
    if(!Array.isArray(pr.ridges)||pr.ridges.length!==4)return false;
    for(let i=0;i<4;i++){
      const r=pr.ridges[i],v=i>=2,j=v?1:0,k=1-j,side=i%2;
      if(r?.v!==v||r.side!==side||r.lo!==box[j]+4||r.hi!==box[j+2]-4||r.total!==r.hi-r.lo+1||!range(r.m,-.04,.04)||Math.abs(r.m/.002-Math.round(r.m/.002))>1e-7||!range(r.offset,-5,5)||!Number.isInteger(r.offset*2)||!finite(r.b)||Math.abs(r.b-(box[k+2*side]+r.offset-r.m*(r.lo+r.hi)/2))>1e-9)return false;
      for(const key of ['total','matched','maxGap','collarMatched','collarMaxGap'])if(!Number.isInteger(r[key])||!range(r[key],0,r.total))return false;
      if(!range(r.quality,20*r.matched,100*r.matched)||!Array.isArray(r.quarters)||r.quarters.length!==4||r.quarters.some((q,j)=>q.samples!==Math.ceil((j+1)*r.total/4)-Math.ceil(j*r.total/4)||!Number.isInteger(q.matched)||!range(q.matched,0,q.samples))||r.quarters.reduce((a,q)=>a+q.matched,0)!==r.matched||!acceptableRidge(r))return false;
    }
    const q=ridgeQuad(pr.ridges),b=bounds(q),A=area(q);
    if(!range(A/(w*h),.035,.20)||q.some(p=>!range(p[0],1,w-1)||!range(p[1],1,h-1))||q.some((a,i)=>cross(a,q[(i+1)%4],q[(i+2)%4])<=0))return false;
    if(!Array.isArray(p._outline)||p._outline.length!==4||p._outline.some((a,i)=>!finite(a?.x)||!finite(a?.y)||Math.abs(a.x-q[i][0]/w)>1e-10||Math.abs(a.y-q[i][1]/h)>1e-10))return false;
    if(!['x','y','w','h'].every(k=>finite(p[k]))||Math.max(Math.abs(p.x-b[0]/w),Math.abs(p.y-b[1]/h),Math.abs(p.w-(b[2]-b[0])/w),Math.abs(p.h-(b[3]-b[1])/h))>1e-10)return false;
    const t=pr.stem,depth=Math.max(28,Math.round(h*.05));
    if(!t||t.width!==2||t.depth!==depth||t.skip!==4||t.samples!==2*depth||![0,1].includes(t.side)||!Number.isInteger(t.x)||t.x<box[0]+7||t.x>=box[2]-8||box[1]-depth-4<0||box[3]+depth+4>=h)return false;
    if(pr.anchor.y*h-box[3]<0||pr.anchor.y*h-box[3]>h*.055||Math.abs(lineAt(pr.anchor._terminalProof.rails[t.side+2],box[3]+4+depth/2)-(t.x+.5))>6)return false;
    for(const key of ['above','below','left','right'])if(!Number.isInteger(t[key])||!range(t[key]/t.samples,(key==='above'||key==='below')?.95:.40,1))return false;
    if(!Number.isInteger(pr.exteriorPixels)||!range(pr.exteriorPixels,w*h*.025,w*h))return false;
    const st=pr.stats,inside=[Math.ceil(Math.max(q[0][0],q[3][0]))+6,Math.ceil(Math.max(q[0][1],q[1][1]))+6,Math.floor(Math.min(q[1][0],q[2][0]))-6,Math.floor(Math.min(q[2][1],q[3][1]))-6];
    if(!st||JSON.stringify(st.box)!==JSON.stringify(inside)||st.samples!==(inside[2]-inside[0]+1)*(inside[3]-inside[1]+1)||!range(st.mean,25,185)||!range(st.variance,900,16257)||!Number.isInteger(st.dark)||!Number.isInteger(st.light)||!range(st.dark/st.samples,.15,.80)||!range(st.light/st.samples,.12,.80)||st.dark+st.light>st.samples)return false;
    if(pr.dividerVetoPassed!==true||pr.nestedRimVetoPassed!==true||pr.uniformInkVetoPassed!==true||pr.interruptedInkVetoPassed!==true)return false;
    const a=pr.anchor;if(Math.max(0,Math.min(p.x+p.w,a.x+a.w)-Math.max(p.x,a.x))*Math.max(0,Math.min(p.y+p.h,a.y+a.h)-Math.max(p.y,a.y))>1e-10)return false;
    return true;
  }catch(_){return false;}}
  function terminalInsetsRGBA(rgba,w,h,anchors,log){
    if(!Number.isInteger(w)||!Number.isInteger(h)||!range(w,250,900)||!range(h,350,900)||!(rgba instanceof Uint8Array||rgba instanceof Uint8ClampedArray)||rgba.length!==w*h*4||!Array.isArray(anchors)||anchors.length!==1||typeof PanelTerminalFrames==='undefined'||!PanelTerminalFrames.validPanel(anchors[0]))return [];
    const anchor=anchors[0];if(anchor._terminalProof.analysisWidth!==w||anchor._terminalProof.analysisHeight!==h)return [];
    // An inherited proof must agree with the current image, not merely look
    // well-formed. The returned anchor itself is never modified.
    const witnessed=PanelTerminalFrames.analyzeRGBA(rgba,w,h);if(witnessed.length!==1||JSON.stringify(witnessed[0])!==JSON.stringify(anchor))return [];
    const gray=new Float32Array(w*h);for(let i=0;i<gray.length;i++){if(rgba[i*4+3]!==255)return [];gray[i]=.299*rgba[i*4]+.587*rgba[i*4+1]+.114*rgba[i*4+2];}
    const base=anchor._terminalProof.base,ex=darkExterior(gray,w,h,base+8);
    const sets=[60,70].map(cutoff=>lightComponents(gray,w,h,cutoff));if(sets.some(s=>!s||s.out.length>24))return [];const out=[];
    for(const c of sets[0].out){
      const box=c.box,bw=box[2]-box[0]+1,bh=box[3]-box[1]+1;
      if(box[0]<18||box[1]<18||box[2]>=w-18||box[3]>=h-18||!range(bw/w,.13,.35)||!range(bh/h,.13,.50)||!range(bw/bh,.20,.85))continue;
      const matches=sets[1].out.filter(p=>p.box.every((v,i)=>Math.abs(v-box[i])<=2));if(matches.length!==1)continue;
      const stem=throughStem(box,gray,ex.bg,w,h,base,anchor);if(!stem)continue;
      const ridges=[];for(const v of [false,true])for(const side of [0,1]){const r=fitLightRidge(box,v,side,gray,w,h,base);if(r)ridges.push(r);}
      if(ridges.length!==4){log?.('terminal inset withheld: light-ridge evidence '+ridges.length+'/4');continue;}
      const q=ridgeQuad(ridges),b=bounds(q),inner=[Math.ceil(Math.max(q[0][0],q[3][0]))+6,Math.ceil(Math.max(q[0][1],q[1][1]))+6,Math.floor(Math.min(q[1][0],q[2][0]))-6,Math.floor(Math.min(q[2][1],q[3][1]))-6];
      if(q.some(p=>p[0]<1||p[1]<1||p[0]>w-1||p[1]>h-1)||inner[2]-inner[0]<35||inner[3]-inner[1]<50)continue;
      const stats=imageStats(gray,w,inner);
      if(interruptedRidgeDivider(rgba,gray,w,h,inner)||uniformDivider(rgba,gray,w,h,inner)||uniformInset(rgba,gray,w,h,inner)||typeof PanelClosedFrames==='undefined'||PanelClosedFrames.analyzeRGBA(rgba,w,h,null,{gradientOnly:true,localMatteInset:true,vetoCandidates:[{box:inner}]}).length!==1){log?.('terminal inset withheld: internal divider/inset');continue;}
      const pr={version:2,method:STEM_METHOD,analysisWidth:w,analysisHeight:h,anchor,color:anchor._terminalProof.color.slice(),base,proposals:[c,matches[0]].map((c,i)=>({cutoff:[60,70][i],box:c.box.slice(),pixels:c.pixels})),ridges,stem,stats,exteriorPixels:ex.pixels,padding:RIDGE_PADDING,dividerVetoPassed:true,nestedRimVetoPassed:true,uniformInkVetoPassed:true,interruptedInkVetoPassed:true};
      const panel={x:b[0]/w,y:b[1]/h,w:(b[2]-b[0])/w,h:(b[3]-b[1])/h,_outline:q.map(p=>({x:p[0]/w,y:p[1]/h})),_identitySource:'bordered-inset-frame',_geometryOwner:'bordered-inset-outline',_geometryType:'four-ridges-over-through-gutter',_insetRimProof:pr};
      if(validTerminalInset(panel))out.push(panel);else log?.('terminal inset withheld: proof validation');
    }
    log?.('terminal anchored insets: '+out.length+' separately witnessed light-rim portraits');return out.length===1?out:[];
  }
  function supplementTerminalImage(img,anchors,log){
    if(!img||!finite(img.width)||!finite(img.height)||img.width<1||img.height<1||!Array.isArray(anchors)||anchors.length!==1||anchors[0]?._identitySource!=='terminal-rim-frame')return [];
    const s=Math.min(1,900/Math.max(img.width,img.height)),w=Math.round(img.width*s),h=Math.round(img.height*s),c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,w,h);
    return terminalInsetsRGBA(ctx.getImageData(0,0,w,h).data,w,h,anchors,log);
  }


  // Test22: a wide framed inset across ONE exterior-matte row break.
  // Four observed light ridges propose/prove the frame. Fitted lines only
  // guide original-pixel rim tracing; the traced rim, not a box, defines it.
  // Existing closed-rim and terminal-anchored routes are not relaxed.
  const WIDE_METHOD='four-traced-light-rims-over-one-exterior-row-break';
  function wideRidgeMasks(gray,w,h,base){
    return [false,true].map(v=>{
      const mask=new Uint8Array(w*h),step=v?1:w;
      for(let y=4;y<h-4;y++)for(let x=4;x<w-4;x++){
        const i=y*w+x,g=gray[i];if(g<=base+40)continue;let a=Infinity,b=Infinity;
        for(let d=1;d<=3;d++){a=Math.min(a,gray[i-d*step]);b=Math.min(b,gray[i+d*step]);}
        if(a<base+35&&b<base+35&&g-Math.max(a,b)>25)mask[i]=1;
      }return mask;
    });
  }
  function wideHorizontalProposals(mask,w,h){
    const minLength=Math.ceil(w*.34),lines=[];
    for(let sm=-20;sm<=20;sm++){
      const m=sm*.002,mid=(w-1)/2;
      for(let row=8;row<h-8;row++){
        const b=row-m*mid;let start=-1,last=-1,matched=0,gap=0;
        const flush=()=>{if(start>=0&&last-start+1>=minLength&&matched/(last-start+1)>=.95)lines.push({m,b,lo:start,hi:last,matched});start=-1;matched=0;gap=0;};
        for(let x=5;x<w-5;x++){
          const y=Math.round(m*x+b),i=y*w+x,yes=y>=5&&y<h-5&&(mask[i]||mask[i-w]||mask[i+w]);
          if(yes){if(start<0)start=x;last=x;matched++;gap=0;}else if(start>=0&&++gap>3)flush();
        }flush();
      }
    }
    lines.sort((a,b)=>(b.hi-b.lo)-(a.hi-a.lo)||Math.abs(a.m)-Math.abs(b.m));const unique=[];
    for(const r of lines){const x=(r.lo+r.hi)/2;if(!unique.some(s=>Math.abs(lineAt(s,x)-lineAt(r,x))<5&&Math.min(s.hi,r.hi)-Math.max(s.lo,r.lo)>.8*Math.min(s.hi-s.lo,r.hi-r.lo)))unique.push(r);if(unique.length>48)return [];}
    return unique;
  }
  function wideFit(box,v,side,gray,w,h,base){
    const j=v?1:0,k=1-j,lo=box[j]+5,hi=box[j+2]-5,mid=(lo+hi)/2,p0=box[k+side*2];if(hi-lo<50)return null;let best=null;
    for(let sm=-20;sm<=20;sm++)for(let off=-16;off<=16;off++){
      const m=sm*.002,r={v,side,m,b:p0+off*.5-m*mid,lo,hi,offset:off*.5},e=ridgeEvidence(gray,w,h,r,base);
      if(e.matched/e.total<.96||e.maxGap>3||e.quarters.some(q=>q.matched/q.samples<.90))continue;
      // Collar acceptance is performed on the TRACED original-pixel rim below,
      // not by broadening the old terminal-inset collar check.
      const score=e.matched/e.total+.001*e.quality/e.total-.0005*Math.abs(r.offset)-.02*Math.abs(m);
      if(!best||score>best.score)best={...r,...e,score};
    }return best;
  }
  function wideOutline(paths,rails,padding){
    function simplify(ps,tolerance=1){
      if(ps.length<3)return ps;const a=ps[0],b=ps.at(-1),dx=b[0]-a[0],dy=b[1]-a[1],den=dx*dx+dy*dy;let best=tolerance,index=-1;
      for(let i=1;i<ps.length-1;i++){const p=ps[i],u=den?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/den)):0,d=Math.hypot(p[0]-a[0]-u*dx,p[1]-a[1]-u*dy);if(d>best){best=d;index=i;}}
      return index<0?[a,b]:simplify(ps.slice(0,index+1),tolerance).slice(0,-1).concat(simplify(ps.slice(index),tolerance));
    }
    const corners=ridgeQuad(rails,padding),out=[];
    for(const [i,ci] of [[0,0],[3,1],[1,2],[2,3]]){
      const r=rails[i],ps=paths[i].points;
      const pts=ps.map((p,j)=>{
        let pos=p?.p;if(pos===undefined){let a=j-1,b=j+1;while(a>=0&&!ps[a])a--;while(b<ps.length&&!ps[b])b++;if(a<0||b>=ps.length)return null;pos=ps[a].p+(ps[b].p-ps[a].p)*(j-a)/(b-a);}
        const t=r.lo+j,normal=pos+(r.side?1:-1)*padding;return r.v?[normal,t]:[t,normal];
      });
      if(pts.some(p=>!p))return null;if(i===1||i===2)pts.reverse();out.push(corners[ci],...simplify(pts));
    }
    return out;
  }
  function wideTrace(rails,gray,w,h,base){
    const paths=[],rimPixels=[];
    for(const r of rails){
      const value=(t,p)=>{const x=r.v?p:t,y=r.v?t:p;return x>=0&&x<w&&y>=0&&y<h?gray[y*w+x]:Infinity;},points=[];
      for(let t=r.lo;t<=r.hi;t++){
        const at=Math.round(lineAt(r,t));let best=null;
        for(let delta=-1;delta<=1;delta++){
          const p=at+delta,g=value(t,p);let before=Infinity,after=Infinity;
          for(let d=1;d<=3;d++){before=Math.min(before,value(t,p-d));after=Math.min(after,value(t,p+d));}
          const contrast=g-Math.max(before,after);if(g<=base+40||before>=base+35||after>=base+35||contrast<=25)continue;
          const score=contrast-.02*Math.abs(delta);if(!best||score>best.score)best={p,score,g,before,after};
        }
        points.push(best?{t,p:best.p,bright:best.g,before:best.before,after:best.after}:null);
      }
      const matched=points.filter(Boolean).length;let maxGap=0,gap=0;
      for(const p of points){gap=p?0:gap+1;maxGap=Math.max(maxGap,gap);}
      if(matched/points.length<.96||maxGap>3||!points[0]||!points.at(-1))return null;
      for(const p of points)if(p)rimPixels.push(r.v?[p.p,p.t]:[p.t,p.p]);
      paths.push({points,matched,maxGap});
    }
    // Trace the corners independently: the search is bounded by the four
    // fitted ridge intersections, and accepts only local bright ridge pixels.
    const corners=ridgeQuad(rails,0),cornerPixels=[];
    for(const [cx,cy] of corners){
      const ps=[];
      for(let y=Math.floor(cy)-5;y<=Math.ceil(cy)+5;y++)for(let x=Math.floor(cx)-5;x<=Math.ceil(cx)+5;x++){
        if(x<4||y<4||x>=w-4||y>=h-4)continue;
        if(rails.some(r=>(r.side?1:-1)*((r.v?x:y)-lineAt(r,r.v?y:x))>1.5))continue;
        if(Math.min(...rails.map(r=>Math.abs((r.v?x:y)-lineAt(r,r.v?y:x))))>1.5)continue;
        const g=gray[y*w+x];if(g<=base+40)continue;
        const tests=[1,w].map(step=>{let a=Infinity,b=Infinity;for(let d=1;d<=3;d++){a=Math.min(a,gray[y*w+x-d*step]);b=Math.min(b,gray[y*w+x+d*step]);}return a<base+35&&b<base+35&&g-Math.max(a,b)>25;});
        if(tests.some(Boolean))ps.push([x,y]);
      }
      if(ps.length<4)return null;cornerPixels.push(ps);rimPixels.push(...ps);
    }
    const rim=wideOutline(paths,rails,0),outline=wideOutline(paths,rails,1.5),dark=collar(rim,gray,w,h);
    if(!dark||!outline||outline.length>64)return null;
    return {paths,cornerPixels,rim,outline,dark};
  }
  function wideCrossing(box,bg,gray,w,h,base){
    const [x0,y0,x1,y1]=box,depth=Math.min(Math.round(w*.04),x0-5,w-6-x1),skip=4;
    if(depth<14)return null;const good=[];
    for(let y=y0+10;y<=y1-10;y++){
      let left=0,right=0;for(let d=skip;d<skip+depth;d++){left+=bg[y*w+x0-d];right+=bg[y*w+x1+d];}
      if(left/depth>=.96&&right/depth>=.96)good.push({y,left,right});
    }
    const runs=[];let run=[];for(const r of good){if(run.length&&r.y!==run.at(-1).y+1){if(run.length>=3)runs.push(run);run=[];}run.push(r);}if(run.length>=3)runs.push(run);
    if(runs.length!==1||runs[0].length>Math.min(30,(y1-y0)*.25))return null;
    const rows=runs[0],lo=rows[0].y,hi=rows.at(-1).y;
    // Witness a surrounding artwork row on BOTH sides of the frame. Either
    // the upper or lower row may be dark artwork, but an entirely floating
    // rectangle surrounded only by matte does not supply this evidence.
    const flanks=[];
    for(const side of [0,1])for(const bottom of [0,1]){
      let n=0,art=0;for(let d=skip;d<skip+depth;d++)for(let dy=6;dy<=26;dy++){
        const x=side?x1+d:x0-d,y=bottom?hi+dy:lo-dy;if(y<0||y>=h)return null;n++;art+=gray[y*w+x]>base+28;
      }flanks.push({samples:n,art});
    }
    if(![0,1].some(bottom=>[0,1].every(side=>flanks[side*2+bottom].art/flanks[side*2+bottom].samples>=.20)))return null;
    return {depth,skip,lo,hi,rows:rows.length,left:rows.reduce((s,r)=>s+r.left,0),right:rows.reduce((s,r)=>s+r.right,0),flanks};
  }
  function wideInsetsRGBA(rgba,w,h,log){
    if(!Number.isInteger(w)||!Number.isInteger(h)||!range(w,250,900)||!range(h,350,900)||!(rgba instanceof Uint8Array||rgba instanceof Uint8ClampedArray)||rgba.length!==w*h*4)return [];
    const gray=new Float32Array(w*h);for(let i=0;i<gray.length;i++){if(rgba[4*i+3]!==255)return [];gray[i]=.299*rgba[i*4]+.587*rgba[i*4+1]+.114*rgba[i*4+2];}
    const ex=exterior(rgba,w,h);if(!ex)return [];const base=.299*ex.color[0]+.587*ex.color[1]+.114*ex.color[2];
    const proposals=wideHorizontalProposals(wideRidgeMasks(gray,w,h,base)[0],w,h);log?.('wide inset horizontal proposals '+JSON.stringify(proposals));const out=[];
    for(const a of proposals)for(const b of proposals){
      const x=(Math.max(a.lo,b.lo)+Math.min(a.hi,b.hi))/2,ya=lineAt(a,x),yb=lineAt(b,x),bh=yb-ya,bw=Math.max(a.hi,b.hi)-Math.min(a.lo,b.lo);
      if(!range(bh/h,.08,.23)||!range(bw/w,.38,.80)||!range(bw/bh,2.1,5.5)||!range(bw*bh/(w*h),.035,.18)||Math.abs(a.lo-b.lo)>12||Math.abs(a.hi-b.hi)>12)continue;
      const box=[Math.round((a.lo+b.lo)/2),Math.round(ya),Math.round((a.hi+b.hi)/2),Math.round(yb)];
      if(box[0]<10||box[1]<10||box[2]>w-10||box[3]>h-10)continue;log?.('wide inset candidate '+JSON.stringify(box));
      const rails=[];for(const v of [false,true])for(const side of [0,1]){const r=wideFit(box,v,side,gray,w,h,base);if(r)rails.push(r);}
      if(rails.length!==4){log?.('wide inset reject ridge '+rails.length);continue;}
      const trace=wideTrace(rails,gray,w,h,base);if(!trace){log?.('wide inset reject trace/collar');continue;}
      const boundsRim=bounds(trace.rim).map((v,i)=>i<2?Math.ceil(v):Math.floor(v)),crossing=wideCrossing(boundsRim,ex.bg,gray,w,h,base);
      if(!crossing){log?.('wide inset reject crossing');continue;}
      const inner=[boundsRim[0]+8,boundsRim[1]+8,boundsRim[2]-8,boundsRim[3]-8],stats=imageStats(gray,w,inner);
      stats.contrast=0;for(let y=inner[1];y<=inner[3];y++)for(let x=inner[0];x<=inner[2];x++)stats.contrast+=gray[y*w+x]>base+35;
      if(stats.variance<400||stats.dark/stats.samples<.15||stats.contrast/stats.samples<.15){log?.('wide inset reject flat '+JSON.stringify(stats));continue;}
      if(uniformDivider(rgba,gray,w,h,inner)||interruptedRidgeDivider(rgba,gray,w,h,inner)||uniformInset(rgba,gray,w,h,inner,.12,true)||typeof PanelClosedFrames==='undefined'||PanelClosedFrames.analyzeRGBA(rgba,w,h,null,{gradientOnly:true,localMatteInset:true,vetoCandidates:[{box:inner}]}).length!==1){log?.('wide inset reject divider/inset');continue;}
      const pr={version:3,method:WIDE_METHOD,analysisWidth:w,analysisHeight:h,color:ex.color,base,edgeSamples:ex.edgeSamples,edgeMatched:ex.edgeMatched,exteriorPixels:ex.exteriorPixels,proposal:box,rails,...trace,crossing,stats,boundsRim,dividerVetoPassed:true,insetVetoPassed:true},q=trace.outline,B=bounds(q);
      const panel={x:B[0]/w,y:B[1]/h,w:(B[2]-B[0])/w,h:(B[3]-B[1])/h,_outline:q.map(([x,y])=>({x:x/w,y:y/h})),_identitySource:'bordered-inset-frame',_geometryOwner:'bordered-inset-outline',_geometryType:'closed-rim-over-gutters',_insetRimProof:pr};
      if(validWideInset(panel))out.push(panel);else log?.('wide inset reject validator');
    }
    log?.('wide traced insets: '+out.length);return out.length===1?out:[];
  }
  function wideContains(q,x,y){
    let yes=false;for(let i=0,j=q.length-1;i<q.length;j=i++){
      const a=q[j],b=q[i],c=cross(a,b,[x,y]);if(Math.abs(c)<1e-8&&x>=Math.min(a[0],b[0])-1e-8&&x<=Math.max(a[0],b[0])+1e-8&&y>=Math.min(a[1],b[1])-1e-8&&y<=Math.max(a[1],b[1])+1e-8)return true;
      if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])yes=!yes;
    }return yes;
  }
  function wideSimple(q,w,h){
    if(!Array.isArray(q)||q.length<4||q.length>64||q.some(p=>!Array.isArray(p)||p.length!==2||!range(p[0],1,w-1)||!range(p[1],1,h-1))||area(q)<=0)return false;
    for(let i=0;i<q.length;i++){
      const a=q[i],b=q[(i+1)%q.length];if(Math.hypot(a[0]-b[0],a[1]-b[1])<1e-7)return false;
      for(let j=i+2;j<q.length;j++){
        if(i===0&&j===q.length-1)continue;const c=q[j],d=q[(j+1)%q.length];
        if(Math.max(a[0],b[0])<Math.min(c[0],d[0])||Math.max(c[0],d[0])<Math.min(a[0],b[0])||Math.max(a[1],b[1])<Math.min(c[1],d[1])||Math.max(c[1],d[1])<Math.min(a[1],b[1]))continue;
        if(cross(a,b,c)*cross(a,b,d)<=0&&cross(c,d,a)*cross(c,d,b)<=0)return false;
      }
    }return true;
  }
  function validWideInset(p){try{
    const pr=p?._insetRimProof,w=pr?.analysisWidth,h=pr?.analysisHeight;
    if(p?._identitySource!=='bordered-inset-frame'||pr?.version!==3||pr.method!==WIDE_METHOD||!Number.isInteger(w)||!Number.isInteger(h)||!range(w,250,900)||!range(h,350,900)||pr.dividerVetoPassed!==true||pr.insetVetoPassed!==true)return false;
    if(p._geometryOwner!==undefined&&p._geometryOwner!=='bordered-inset-outline'||p._geometryType!==undefined&&p._geometryType!=='closed-rim-over-gutters')return false;
    if(!Array.isArray(pr.color)||pr.color.length!==3||pr.color.some(n=>!Number.isInteger(n)||!range(n,0,255)))return false;
    const base=.299*pr.color[0]+.587*pr.color[1]+.114*pr.color[2],edgeN=2*Math.ceil(w/2)+2*Math.ceil(h/2);
    if(pr.base!==base||!range(base,0,25)||pr.edgeSamples!==edgeN||!Number.isInteger(pr.edgeMatched)||!range(pr.edgeMatched/edgeN,.97,1)||!Number.isInteger(pr.exteriorPixels)||!range(pr.exteriorPixels,w*h*.025,w*h))return false;
    const box=pr.proposal;
    if(!Array.isArray(box)||box.length!==4||box.some(n=>!Number.isInteger(n))||box[0]<10||box[1]<10||box[2]>w-10||box[3]>h-10)return false;
    const bw=box[2]-box[0],bh=box[3]-box[1];if(!range(bw/w,.35,.82)||!range(bh/h,.075,.235)||!range(bw/bh,2,5.6)||!range(bw*bh/(w*h),.03,.19))return false;
    if(!Array.isArray(pr.rails)||pr.rails.length!==4||!Array.isArray(pr.paths)||pr.paths.length!==4)return false;
    const support=[];
    for(let i=0;i<4;i++){
      const r=pr.rails[i],v=i>=2,side=i%2,j=v?1:0,k=1-j;
      if(r?.v!==v||r.side!==side||r.lo!==box[j]+5||r.hi!==box[j+2]-5||r.total!==r.hi-r.lo+1||r.total<51||!range(r.m,-.04,.04)||Math.abs(r.m/.002-Math.round(r.m/.002))>1e-7||!range(r.offset,-8,8)||!Number.isInteger(r.offset*2)||!finite(r.b)||Math.abs(r.b-(box[k+side*2]+r.offset-r.m*(r.lo+r.hi)/2))>1e-8)return false;
      for(const key of ['matched','maxGap','collarMatched','collarMaxGap'])if(!Number.isInteger(r[key])||!range(r[key],0,r.total))return false;
      if(!range(r.matched/r.total,.96,1)||r.maxGap>3||r.maxGap>r.total-r.matched||!range(r.quality,20*r.matched,100*r.matched))return false;
      if(!Array.isArray(r.quarters)||r.quarters.length!==4||r.quarters.some((q,j)=>q?.samples!==Math.ceil((j+1)*r.total/4)-Math.ceil(j*r.total/4)||!Number.isInteger(q.matched)||!range(q.matched/q.samples,.9,1))||r.quarters.reduce((a,q)=>a+q.matched,0)!==r.matched)return false;
      const score=r.matched/r.total+.001*r.quality/r.total-.0005*Math.abs(r.offset)-.02*Math.abs(r.m);if(!finite(r.score)||Math.abs(r.score-score)>1e-9)return false;
      const path=pr.paths[i];if(!Array.isArray(path?.points)||path.points.length!==r.total||!path.points[0]||!path.points.at(-1))return false;let n=0,gap=0,maxGap=0;
      for(let j=0;j<path.points.length;j++){
        const a=path.points[j];if(a===null){gap++;maxGap=Math.max(maxGap,gap);continue;}gap=0;n++;
        if(a?.t!==r.lo+j||!Number.isInteger(a.p)||Math.abs(a.p-Math.round(lineAt(r,a.t)))>1||!range(a.bright,base+40,255)||!range(a.before,0,base+35)||!range(a.after,0,base+35)||a.bright-Math.max(a.before,a.after)<=25)return false;
        support.push(v?[a.p,a.t]:[a.t,a.p]);
      }
      if(path.matched!==n||path.maxGap!==maxGap||!range(n/r.total,.96,1)||maxGap>3)return false;
    }
    const corners=ridgeQuad(pr.rails,0);
    if(!Array.isArray(pr.cornerPixels)||pr.cornerPixels.length!==4)return false;
    for(let i=0;i<4;i++){
      const ps=pr.cornerPixels[i],[cx,cy]=corners[i];if(!Array.isArray(ps)||!range(ps.length,4,144))return false;
      for(const p of ps){if(!Array.isArray(p)||p.length!==2||p.some(n=>!Number.isInteger(n))||p[0]<Math.floor(cx)-5||p[0]>Math.ceil(cx)+5||p[1]<Math.floor(cy)-5||p[1]>Math.ceil(cy)+5||pr.rails.some(r=>(r.side?1:-1)*((r.v?p[0]:p[1])-lineAt(r,r.v?p[1]:p[0]))>1.5))return false;support.push(p);}
    }
    const rim=wideOutline(pr.paths,pr.rails,0),q=wideOutline(pr.paths,pr.rails,1.5);
    if(!wideSimple(rim,w,h)||!wideSimple(q,w,h)||JSON.stringify(rim)!==JSON.stringify(pr.rim)||JSON.stringify(q)!==JSON.stringify(pr.outline)||support.some(([x,y])=>!wideContains(q,x,y)))return false;
    const B=bounds(q),A=area(q);if(!range(A/(w*h),.03,.20))return false;
    if(!Array.isArray(p._outline)||p._outline.length!==q.length||p._outline.some((a,i)=>!range(a?.x,0,1)||!range(a?.y,0,1)||Math.abs(a.x-q[i][0]/w)>1e-10||Math.abs(a.y-q[i][1]/h)>1e-10)||!['x','y','w','h'].every(k=>finite(p[k]))||Math.max(Math.abs(p.x-B[0]/w),Math.abs(p.y-B[1]/h),Math.abs(p.w-(B[2]-B[0])/w),Math.abs(p.h-(B[3]-B[1])/h))>1e-10)return false;
    if(!Array.isArray(pr.dark)||pr.dark.length!==4||pr.dark.some(s=>!Number.isInteger(s?.samples)||s.samples<45||!Number.isInteger(s.matched)||!range(s.matched/s.samples,.95,1)||!Number.isInteger(s.maxGap)||!range(s.maxGap,0,Math.min(s.samples-s.matched,Math.max(3,s.samples*.035)))))return false;
    const rb=bounds(rim).map((v,i)=>i<2?Math.ceil(v):Math.floor(v));if(JSON.stringify(rb)!==JSON.stringify(pr.boundsRim))return false;
    const t=pr.crossing,depth=Math.min(Math.round(w*.04),rb[0]-5,w-6-rb[2]);
    if(depth<14||t?.depth!==depth||t.skip!==4||!Number.isInteger(t.lo)||!Number.isInteger(t.hi)||t.lo<rb[1]+10||t.hi>rb[3]-10||t.rows!==t.hi-t.lo+1||!range(t.rows,3,Math.min(30,(rb[3]-rb[1])*.25)))return false;
    for(const key of ['left','right'])if(!Number.isInteger(t[key])||!range(t[key]/(t.rows*depth),.96,1))return false;
    if(!Array.isArray(t.flanks)||t.flanks.length!==4||t.flanks.some(v=>v?.samples!==depth*21||!Number.isInteger(v.art)||!range(v.art,0,v.samples))||![0,1].some(bottom=>[0,1].every(side=>t.flanks[side*2+bottom].art/t.flanks[side*2+bottom].samples>=.20)))return false;
    const inner=[rb[0]+8,rb[1]+8,rb[2]-8,rb[3]-8],s=pr.stats,N=(inner[2]-inner[0]+1)*(inner[3]-inner[1]+1);
    if(JSON.stringify(s?.box)!==JSON.stringify(inner)||s.samples!==N||!range(s.mean,0,255)||!range(s.variance,400,16257)||!Number.isInteger(s.dark)||!Number.isInteger(s.light)||!Number.isInteger(s.contrast)||!range(s.dark/N,.15,1)||!range(s.light,0,N-s.dark)||!range(s.contrast/N,.15,1))return false;
    return true;
  }catch(_){return false;}}

  function wideInsetsImage(img,log){
    if(!img||!finite(img.width)||!finite(img.height)||img.width<1||img.height<1)return [];
    const s=Math.min(1,900/Math.max(img.width,img.height)),w=Math.round(img.width*s),h=Math.round(img.height*s),c=document.createElement('canvas');c.width=w;c.height=h;
    const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(img,0,0,w,h);return wideInsetsRGBA(g.getImageData(0,0,w,h).data,w,h,log);
  }

  function validPanel(p){try{return p?._insetRimProof?.version===3?validWideInset(p):p?._insetRimProof?.version===2?validTerminalInset(p):validate(p);}catch(_){return false;}}
  function validate(p){
    const pr=p?._insetRimProof,W=pr?.analysisWidth,H=pr?.analysisHeight;
    if(p?._identitySource!=='bordered-inset-frame'||pr?.version!==1||pr.method!==METHOD||!Number.isInteger(W)||!Number.isInteger(H)||!range(W,250,900)||!range(H,350,900)||pr.padding!==1||pr.uniformInkVetoPassed!==true||pr.nestedRimVetoPassed!==true||pr.dividerVetoPassed!==true||pr.insetVetoPassed!==true)return false;
    if(!Array.isArray(pr.color)||pr.color.length!==3||pr.color.some(c=>!Number.isInteger(c)||!range(c,0,255))||pr.color[0]*.299+pr.color[1]*.587+pr.color[2]*.114>25)return false;
    const edgeN=2*Math.ceil(W/2)+2*Math.ceil(H/2);
    if(pr.edgeSamples!==edgeN||!Number.isInteger(pr.edgeMatched)||!range(pr.edgeMatched/edgeN,.97,1)||!Number.isInteger(pr.exteriorPixels)||!range(pr.exteriorPixels,W*H*.025,W*H))return false;
    const b=pr.componentBox,q=pr.rim;
    if(!Array.isArray(b)||b.length!==4||b.some(n=>!Number.isInteger(n))||!range(b[0],0,b[2])||!range(b[1],0,b[3])||b[2]>=W||b[3]>=H||b[2]-b[0]<W*.13||b[3]-b[1]<H*.11)return false;
    const B=(b[2]-b[0]+1)*(b[3]-b[1]+1);
    if(!range(B,W*H*.035,W*H*.18)||!Number.isInteger(pr.rimPixels)||!range(pr.rimPixels/B,.012,.10)||!Array.isArray(q)||q.length<4||q.length>48||q.some(a=>!Array.isArray(a)||a.length!==2||a.some(n=>!finite(n)||Math.abs(n*2-Math.round(n*2))>1e-9))||q.some((a,i)=>cross(a,q[(i+1)%q.length],q[(i+2)%q.length])<=0))return false;
    if(JSON.stringify(bounds(q))!==JSON.stringify([b[0]-.5,b[1]-.5,b[2]+.5,b[3]+.5]))return false;
    const A=area(q),hole=pr.hole;
    if(!range(A/B,.965,1)||pr.rimArea!==A||!Number.isInteger(hole?.pixels)||!range(hole.pixels/A,.88,.98)||!range(hole.mean,0,255)||!range(hole.variance,1000,16257)||!Number.isInteger(hole.dark)||!Number.isInteger(hole.light)||!range(hole.dark/hole.pixels,.12,1)||!range(hole.light/hole.pixels,.12,1)||hole.dark+hole.light>hole.pixels||pr.rimPixels+hole.pixels>B)return false;
    if(!Array.isArray(hole.box)||hole.box.length!==4||hole.box.some(n=>!Number.isInteger(n))||hole.box[0]<=b[0]||hole.box[1]<=b[1]||hole.box[2]>=b[2]||hole.box[3]>=b[3]||hole.pixels>(hole.box[2]-hole.box[0]+1)*(hole.box[3]-hole.box[1]+1))return false;
    if(!Array.isArray(pr.dark)||pr.dark.length!==4||pr.dark.some(s=>!Number.isInteger(s?.samples)||s.samples<45||!Number.isInteger(s.matched)||!range(s.matched/s.samples,.95,1)||!Number.isInteger(s.maxGap)||!range(s.maxGap,0,Math.min(s.samples-s.matched,Math.max(3,s.samples*.035)))))return false;
    const c=pr.crossings,v=c?.vertical;if(typeof v!=='boolean')return false;
    const depth=Math.max(24,Math.round((v?H:W)*.055)),lo=v?b[0]:b[1],hi=v?b[2]:b[3],left=v?b[1]:b[0],right=v?b[3]:b[2];
    if(c.depth!==depth||left-depth-3<0||right+depth+3>=(v?H:W)||!Array.isArray(c.bands)||c.bands.length!==2)return false;
    if(c.bands.some(s=>!Number.isInteger(s.lo)||!Number.isInteger(s.hi)||s.lo<lo+6||s.hi>hi-6||s.rows!==s.hi-s.lo+1||!range(s.rows,2,Math.min(18,(hi-lo)*.10))||!Number.isInteger(s.left)||!Number.isInteger(s.right)||!range(s.left/(s.rows*depth),.90,1)||!range(s.right/(s.rows*depth),.90,1))||c.bands[1].lo-c.bands[0].hi<(hi-lo)*.45)return false;
    const outline=expand(q,1),box=bounds(outline);
    if(outline.length>64||outline.some(a=>!range(a[0],0,W)||!range(a[1],0,H))||JSON.stringify(outline)!==JSON.stringify(pr.q)||!Array.isArray(p._outline)||p._outline.length!==outline.length||p._outline.some((a,i)=>!range(a?.x,0,1)||!range(a?.y,0,1)||Math.abs(a.x-outline[i][0]/W)>1e-10||Math.abs(a.y-outline[i][1]/H)>1e-10))return false;
    return ['x','y','w','h'].every(k=>finite(p[k]))&&Math.max(Math.abs(p.x-box[0]/W),Math.abs(p.y-box[1]/H),Math.abs(p.w-(box[2]-box[0])/W),Math.abs(p.h-(box[3]-box[1])/H))<1e-10;
  }
  function analyzeImage(img,log){const s=Math.min(1,900/Math.max(img.width,img.height)),w=Math.round(img.width*s),h=Math.round(img.height*s),c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,w,h);return analyzeRGBA(ctx.getImageData(0,0,w,h).data,w,h,log);}
  return {wideInsetsImage,wideInsetsRGBA,analyzeRGBA,analyzeImage,validPanel,supplementTerminalImage,terminalInsetsRGBA};
})();
