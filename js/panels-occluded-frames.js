/* Nth Shelf — bubble-interrupted divider experiment, based on 2.79.24.
 * Add-only recovery inside an already proved partition's unresolved region.
 * A white object is NOT a separator: matching, independently fitted ink rails
 * must reach both side walls. Only one enclosed, text-bearing light component
 * may hide the middle of that rail. Existing frame objects are never changed.
 */
const PanelOccludedFrames = (() => {
  'use strict';
  const METHOD = 'text-balloon-collinear-divider';
  const cross = (a,b,c) => (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
  const area = q => Math.abs(q.reduce((s,p,i)=>{const n=q[(i+1)%q.length];return s+p[0]*n[1]-p[1]*n[0];},0)/2);
  const inside = (p,q,eps=1e-6) => q.every((a,i)=>cross(a,q[(i+1)%q.length],p)>=-eps);
  const valid = q => Array.isArray(q)&&q.length===4&&q.every((p,i)=>
    Array.isArray(p)&&p.length===2&&p.every(Number.isFinite)&&cross(p,q[(i+1)%4],q[(i+2)%4])>1e-6);
  function overlap(a,b){
    let out=a.map(p=>p.slice());
    for(let k=0;k<b.length&&out.length;k++){
      const input=out;out=[];const c=b[k],d=b[(k+1)%b.length];
      for(let i=0;i<input.length;i++){
        const p=input[i],q=input[(i+1)%input.length],u=cross(c,d,p),v=cross(c,d,q);
        if(u>=0)out.push(p);
        if((u>=0)!==(v>=0)){const t=u/(u-v);out.push([p[0]+t*(q[0]-p[0]),p[1]+t*(q[1]-p[1])]);}
      }
    }
    return out.length>=3?area(out):0;
  }
  function fit(points){
    if(points.length<20)return null;
    let sx=0,sy=0,sxx=0,sxy=0;
    for(const [x,y] of points){sx+=x;sy+=y;sxx+=x*x;sxy+=x*y;}
    const n=points.length,den=n*sxx-sx*sx;if(den<=0)return null;
    const slope=(n*sxy-sx*sy)/den,offset=(sy-slope*sx)/n;
    const errors=points.map(([x,y])=>Math.abs(y-slope*x-offset)).sort((a,b)=>a-b);
    return {slope,offset,residual:errors[Math.floor(n*.9)],samples:n};
  }
  function simplify(points,tolerance=.45){
    if(points.length<3)return points;
    const a=points[0],b=points[points.length-1],dx=b[0]-a[0],dy=b[1]-a[1],den=dx*dx+dy*dy;
    let best=-1,index=0;
    for(let i=1;i<points.length-1;i++){
      const p=points[i],t=den?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/den)):0;
      const d=Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy);
      if(d>best){best=d;index=i;}
    }
    return best<=tolerance?[a,b]:simplify(points.slice(0,index+1),tolerance).slice(0,-1).concat(simplify(points.slice(index),tolerance));
  }
  function visibleDivider(ranges,line,ends,ownerBefore) {
    // Trace the union of the true balloon silhouette and its owning half-plane.
    // A tail can run below the rail with a gap of neighboring art above it:
    // simply taking a column-wise maximum would wrongly swallow that gap.
    const xs=[...ranges.keys()],a=ends[0],b=ends[1];
    const left=Math.max(Math.ceil(a[0])+1,Math.min(...xs)-4),right=Math.min(Math.floor(b[0])-1,Math.max(...xs)+4);
    const yAt=x=>line.slope*x+line.offset;
    const low=Math.floor(Math.min(...[...ranges.values()].map(r=>r[0]-4),yAt(left)-4,yAt(right)-4));
    const high=Math.ceil(Math.max(...[...ranges.values()].map(r=>r[1]+4),yAt(left)+4,yAt(right)+4));
    const width=right-left+1,height=high-low+1;
    if(width<3||height<3||width*height>250000)return null;
    const before=new Uint8Array(width*height);
    for(let ix=0;ix<width;ix++)for(let iy=0;iy<height;iy++){
      const x=left+ix,y=low+iy;let balloon=false;
      for(let d=-2;d<=2;d++){const r=ranges.get(x+d);if(r&&y>=r[0]-2&&y<=r[1]+2){balloon=true;break;}}
      before[iy*width+ix]=balloon?Number(ownerBefore):Number(y<=yAt(x));
    }
    const graph=new Map(),stride=width+1;
    const link=(x1,y1,x2,y2)=>{const u=y1*stride+x1,v=y2*stride+x2;
      if(!graph.has(u))graph.set(u,[]);if(!graph.has(v))graph.set(v,[]);graph.get(u).push(v);graph.get(v).push(u);};
    for(let y=0;y<height;y++)for(let x=0;x<width;x++){
      const v=before[y*width+x];
      if(y+1<height&&v!==before[(y+1)*width+x])link(x,y+1,x+1,y+1);
      if(x+1<width&&v!==before[y*width+x+1])link(x+1,y,x+1,y+1);
    }
    const start=[...graph].filter(([k,v])=>k%stride===0&&v.length===1);
    const finish=[...graph].filter(([k,v])=>k%stride===width&&v.length===1);
    if(start.length!==1||finish.length!==1||[...graph.values()].some(v=>v.length>2))return null;
    const seen=new Set(),points=[];let at=start[0][0],previous=-1;
    for(let i=0;i<=graph.size;i++){
      if(seen.has(at))return null;seen.add(at);
      const x=left-.5+at%stride,y=low-.5+Math.floor(at/stride);
      points.push([x,Math.abs(y-yAt(x))<=.8?yAt(x):y]);
      if(at===finish[0][0])break;
      const next=graph.get(at).filter(k=>k!==previous);if(next.length!==1)return null;
      previous=at;at=next[0];
    }
    if(at!==finish[0][0]||seen.size!==graph.size)return null;
    const joined=[a,...points,b],clean=joined.filter((p,i)=>!i||Math.hypot(p[0]-joined[i-1][0],p[1]-joined[i-1][1])>1e-7);
    return simplify(clean);
  }
  function regionsFrom(anchors,w,h){
    if(!Array.isArray(anchors)||anchors.length<2||anchors.length>12)return [];
    if(anchors.some(p=>p?._identitySource!=='page-partition'||p._partitionProof?.version!==1||
      p._partitionProof.connected!==true||p._partitionProof.outerMethod!=='dark-margin-low-contrast'||
      p._partitionProof.analysisWidth!==w||p._partitionProof.analysisHeight!==h))return [];
    const quads=anchors.map(p=>p._quad?.map(v=>[v.x*w,v.y*h]));if(quads.some(q=>!valid(q)))return [];
    const regions=[];
    for(const anchor of anchors)for(const region of anchor._partitionProof.unresolvedRegions||[]){
      if(!Array.isArray(region))continue;
      const q=region.map(p=>[p.x*w,p.y*h]);
      if(!valid(q)||area(q)<w*h*.04||area(q)>w*h*.60||quads.some(a=>overlap(q,a)>.005))continue;
      if(q.some(p=>p[0]<3||p[0]>w-4||p[1]<3||p[1]>h-4))continue;
      if(regions.some(r=>q.every((p,i)=>Math.hypot(p[0]-r.q[i][0],p[1]-r.q[i][1])<.1)))continue;
      regions.push({q,proof:anchor._partitionProof});
    }
    // A partial map may carry older supersets. Never work across two current
    // unresolved interiors or guess which generation owns their intersection.
    return regions.length<=3&&!regions.some((a,i)=>regions.some((b,j)=>i<j&&overlap(a.q,b.q)>.005))?regions:[];
  }
  function components(rgba,g,w,h,q){
    const white=new Uint8Array(w*h),seen=new Uint8Array(w*h),queue=new Int32Array(w*h),out=[];
    const x0=Math.max(1,Math.floor(Math.min(...q.map(p=>p[0])))),x1=Math.min(w-2,Math.ceil(Math.max(...q.map(p=>p[0]))));
    const y0=Math.max(1,Math.floor(Math.min(...q.map(p=>p[1])))),y1=Math.min(h-2,Math.ceil(Math.max(...q.map(p=>p[1]))));
    for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
      const k=y*w+x,p=k*4,min=Math.min(rgba[p],rgba[p+1],rgba[p+2]),max=Math.max(rgba[p],rgba[p+1],rgba[p+2]);
      white[k]=min>205&&max-min<35?1:0;
    }
    for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
      const seed=y*w+x;if(!white[seed]||seen[seed])continue;
      let head=0,tail=0,l=x,r=x,t=y,b=y;queue[tail++]=seed;seen[seed]=1;
      while(head<tail){
        const k=queue[head++],cx=k%w,cy=Math.floor(k/w);l=Math.min(l,cx);r=Math.max(r,cx);t=Math.min(t,cy);b=Math.max(b,cy);
        for(const n of [k-1,k+1,k-w,k+w])if(n>=0&&n<w*h&&!seen[n]&&white[n]){seen[n]=1;queue[tail++]=n;}
      }
      if(tail<120||tail>w*h*.10||r-l<20||b-t<14||r-l> w*.65||b-t>h*.28)continue;
      const box=[[l-3,t-3],[r+3,t-3],[r+3,b+3],[l-3,b+3]];
      if(!box.every(p=>inside(p,q)))continue;
      const cols=new Map(),rows=new Map();
      for(let i=0;i<tail;i++){
        const k=queue[i],cx=k%w,cy=Math.floor(k/w),c=cols.get(cx),row=rows.get(cy);
        if(c){c[0]=Math.min(c[0],cy);c[1]=Math.max(c[1],cy);}else cols.set(cx,[cy,cy]);
        if(row){row[0]=Math.min(row[0],cx);row[1]=Math.max(row[1],cx);}else rows.set(cy,[cx,cx]);
      }
      let filled=0,dark=0,edge=0,nedge=0,textRows=0;
      for(const [cx,[lo,hi]] of cols){
        for(let cy=lo;cy<=hi;cy++){filled++;dark+=g[cy*w+cx]<70;}
        edge+=Math.min(g[(lo-1)*w+cx],g[(lo-2)*w+cx],g[(lo-3)*w+cx])<100;
        edge+=Math.min(g[(hi+1)*w+cx],g[(hi+2)*w+cx],g[(hi+3)*w+cx])<100;nedge+=2;
      }
      for(const [cy,[lo,hi]] of rows){
        let runs=0;
        for(let cx=lo+2;cx<hi-2;cx++){
          if(g[cy*w+cx]>=70)continue;
          const start=cx;while(cx<hi-2&&g[cy*w+cx]<70)cx++;
          if(cx-start<=12&&g[cy*w+start-1]>150&&g[cy*w+cx]>150)runs++;
        }
        if(runs>=3)textRows++;
      }
      if(tail/filled<.48||filled/((r-l+1)*(b-t+1))<.24||dark/filled<.035||dark/filled>.38||edge/nedge<.85||textRows<3)continue;
      out.push({l,r,t,b,cols,rows,area:filled,whitePixels:tail,darkFraction:dark/filled,edgeCoverage:edge/nedge,textRows});
      if(out.length>32)return [];
    }
    return out;
  }
  function recover(rgba,g,w,h,region,log){
    const balloons=components(rgba,g,w,h,region.q);if(!balloons.length)return [];
    const accepted=[];
    for(const vertical of [false,true]){
      const q=region.q,qq=vertical?[q[0],q[3],q[2],q[1]].map(p=>[p[1],p[0]]):q;
      const along=vertical?h:w,bound=vertical?w:h,at=(x,y)=>vertical?g[x*w+y]:g[y*w+x];
      const side=(a,b)=>{const m=(b[0]-a[0])/(b[1]-a[1]);return [m,a[0]-m*a[1]];};
      const [lm,lb]=side(qq[0],qq[3]),[rm,rb]=side(qq[1],qq[2]);
      const ends=(slope,offset)=>{const a=(lb+lm*offset)/(1-lm*slope),b=(rb+rm*offset)/(1-rm*slope);return [[a,slope*a+offset],[b,slope*b+offset]];};
      const ymin=Math.min(...qq.map(p=>p[1])),ymax=Math.max(...qq.map(p=>p[1])),xmin=Math.min(...qq.map(p=>p[0])),xmax=Math.max(...qq.map(p=>p[0])),center=(xmin+xmax)/2;
      if(ymax-ymin<90||xmax-xmin<100)continue;
      const mask=new Uint16Array(w*h);
      balloons.forEach((balloon,i)=>{
        const ranges=vertical?balloon.rows:balloon.cols;
        for(const [x,[lo,hi]] of ranges)for(let dx=-2;dx<=2;dx++)for(let y=lo-2;y<=hi+2;y++){
          if(x+dx>=0&&x+dx<along&&y>=0&&y<bound)mask[(x+dx)*bound+y]=i+1;
        }
      });
      const hidden=(x,y)=>mask[x*bound+y]||0;
      function measure(slope,offset,e,step=1){
        const [a,b]=e,lo=Math.ceil(a[0])+3,hi=Math.floor(b[0])-3;
        let n=0,dark=0,paired=0,thick=0,ridge=0,sum=0,square=0,id=0,hits=0,first=Infinity,last=-Infinity;
        for(let x=lo;x<=hi;x+=step){
          const y=Math.round(slope*x+offset);if(y<9||y>=bound-9)return null;
          const m=hidden(x,y);
          if(m){if(id&&id!==m)return null;id=m;hits++;first=Math.min(first,x);last=Math.max(last,x);continue;}
          const v=at(x,y);n++;sum+=v;square+=v*v;dark+=v<25;
          paired+=v<25&&(at(x,y-1)<25||at(x,y+1)<25);thick+=at(x,y-1)<25&&at(x,y+1)<25;
          let before=0,after=0;for(let d=4;d<=8;d++){before+=at(x,y-d);after+=at(x,y+d);}
          ridge+=before/5-v>20&&after/5-v>20;
          if((x<lo+10||x>hi-10)&&v>=25)return null;
          // A missed ink pixel outside the one masked balloon is not silently
          // folded into that occlusion, even in the coarse proposal scan.
          if(n>=20&&dark/n<.92)return null;
        }
        const width=hi-lo+1;if(!id||hits*step/width<.04||hits*step/width>.40||first-lo<width*.15||hi-last<width*.15)return null;
        // The mask must form a single uninterrupted crossing of that component.
        for(let x=first;x<=last;x++){const y=Math.round(slope*x+offset);if(hidden(x,y)!==id)return null;}
        const mean=sum/n,std=Math.sqrt(Math.max(0,square/n-mean*mean));
        if(dark/n<.985||paired/n<.92||mean>=15||std>=8||ridge/n<.45)return null;
        return {balloon:id-1,first,last,dark:dark/n,paired:paired/n,thick:thick/n,ridge:ridge/n,mean,std,visible:n,occluded:hits};
      }
      const proposals=[];
      for(let si=-40;si<=40;si++){
        const slope=si*.0025;
        for(let pos=Math.ceil(ymin+40);pos<ymax-40;pos++){
          const offset=pos-slope*center,e=ends(slope,offset);
          if(e[0][1]-qq[0][1]<40||qq[3][1]-e[0][1]<40||e[1][1]-qq[1][1]<40||qq[2][1]-e[1][1]<40)continue;
          const m=measure(slope,offset,e,3);if(!m)continue;
          const score=m.ridge+.25*m.thick-.03*m.std;
          const old=proposals.findIndex(p=>Math.abs(p.slope*center+p.offset-pos)<5);
          const item={slope,offset,e,score,m};if(old<0)proposals.push(item);else if(score>proposals[old].score)proposals[old]=item;
        }
      }
      if(proposals.length>6)continue;
      for(const proposal of proposals){
        const samples=[];
        for(let x=Math.ceil(proposal.e[0][0])+4;x<proposal.e[1][0]-4;x++){
          let y=Math.round(proposal.slope*x+proposal.offset);if(hidden(x,y))continue;
          let low=255,pick=y;for(let d=-2;d<=2;d++)if(at(x,y+d)<low){low=at(x,y+d);pick=y+d;}
          if(low>=15)continue;
          const threshold=low+8;let lo=pick,hi=pick;
          while(lo>pick-8&&at(x,lo-1)<threshold)lo--;while(hi<pick+8&&at(x,hi+1)<threshold)hi++;
          if(hi-lo<1||hi-lo>8||lo<=pick-8||hi>=pick+8||Math.min(at(x,lo-3),at(x,hi+3))-low<20)continue;
          samples.push([x,(lo+hi)/2]);
        }
        const f=fit(samples);if(!f||Math.abs(f.slope)>.105||f.residual>1)continue;
        const e=ends(f.slope,f.offset),m=measure(f.slope,f.offset,e);if(!m||m.thick<.75)continue;
        const left=fit(samples.filter(p=>p[0]<m.first-3)),right=fit(samples.filter(p=>p[0]>m.last+3));
        if(!left||!right||left.residual>1||right.residual>1||
          Math.max(...[e[0][0],m.first,m.last,e[1][0]].map(x=>Math.abs(left.slope*x+left.offset-right.slope*x-right.offset)))>2)continue;
        if(left.samples/(m.first-e[0][0])<.40||right.samples/(e[1][0]-m.last)<.40)continue;
        const balloon=balloons[m.balloon],ranges=vertical?balloon.rows:balloon.cols;
        let before=0,total=0;
        for(const [x,[lo,hi]] of ranges){total+=hi-lo+1;before+=Math.max(0,Math.min(hi+1,f.slope*x+f.offset)-lo);}
        const fraction=before/total;if(fraction>.45&&fraction<.55)continue;
        const ownerBefore=fraction>=.55,path=visibleDivider(ranges,f,e,ownerBefore);
        if(!path)continue;
        const outlines=[[qq[0],qq[1],...path.slice().reverse()],[...path,qq[2],qq[3]]];
        const quads=[[qq[0],qq[1],e[1],e[0]],[e[0],e[1],qq[2],qq[3]]];
        if(outlines.some(p=>p.length>128)||quads.some(p=>area(p)<w*h*.02))continue;
        const map=p=>vertical?[p[1],p[0]]:p;
        const actualOutlines=outlines.map(p=>vertical?p.map(map).reverse():p.map(map));
        const actualQuads=quads.map(p=>vertical?[p[0],p[3],p[2],p[1]].map(map):p.map(map));
        if(actualOutlines.some(p=>p.some(v=>!inside(v,q)))||actualQuads.some(p=>!valid(p)))continue;
        // Conservation: one shared visible outline partitions exactly the
        // original unresolved cell; a balloon never expands into a neighbor.
        if(Math.abs(area(actualOutlines[0])+area(actualOutlines[1])-area(q))>.01)continue;
        accepted.push({quads:actualQuads,outlines:actualOutlines,proof:{version:1,connected:true,method:METHOD,
          analysisWidth:w,analysisHeight:h,axis:vertical?'vertical':'horizontal',
          separator:{...f,ends:e.map(map),leftFit:left,rightFit:right,evidence:m},
          balloon:{bounds:[balloon.l/w,balloon.t/h,(balloon.r+1)/w,(balloon.b+1)/h],
            edgeCoverage:balloon.edgeCoverage,darkFraction:balloon.darkFraction,textRows:balloon.textRows,
            owner:ownerBefore?0:1,beforeFraction:fraction},region:q.map(p=>({x:p[0]/w,y:p[1]/h}))}});
      }
    }
    // Competing whole-region partitions remain unresolved. No tap-dependent
    // choice, smallest/largest heuristic, or page-specific coordinate map.
    if(accepted.length!==1)return [];
    const found=accepted[0];if(log)log(`occluded divider: two whole frames; one enclosed text balloon; ${found.proof.separator.leftFit.samples}/${found.proof.separator.rightFit.samples} fitted flank samples`);
    return found.quads.map((q,i)=>{
      const outline=found.outlines[i].map(p=>({x:p[0]/w,y:p[1]/h})),quad=q.map(p=>({x:p[0]/w,y:p[1]/h}));
      const xs=outline.map(p=>p.x),ys=outline.map(p=>p.y),x=Math.min(...xs),y=Math.min(...ys);
      return {x,y,w:Math.max(...xs)-x,h:Math.max(...ys)-y,_quad:quad,_outline:outline,
        _identitySource:'page-partition',_geometryOwner:'orthogonal-frame',_geometryType:'balloon-interrupted-partition',
        _partitionProof:{...region.proof,occlusionRefinement:true},_occlusionProof:{...found.proof,child:i}};
    });
  }
  function supplementRGBA(rgba,w,h,anchors,log){
    if(globalThis.NTH_OCCLUDED_FRAMES_DISABLED===true||!Number.isInteger(w)||!Number.isInteger(h)||w<100||h<160||w>900||h>900||!rgba||rgba.length!==w*h*4)return [];
    const regions=regionsFrom(anchors,w,h);if(!regions.length)return [];
    const g=new Float32Array(w*h);for(let i=0;i<g.length;i++)g[i]=.299*rgba[4*i]+.587*rgba[4*i+1]+.114*rgba[4*i+2];
    const out=[];for(const r of regions)out.push(...recover(rgba,g,w,h,r,log));return out;
  }
  function supplementImage(img,anchors,log){
    if(!img||!Array.isArray(anchors)||anchors.length<2)return [];
    const s=Math.min(1,900/Math.max(img.width,img.height)),w=Math.round(img.width*s),h=Math.round(img.height*s);
    if(!regionsFrom(anchors,w,h).length)return [];
    const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d',{willReadFrequently:true});
    ctx.drawImage(img,0,0,w,h);return supplementRGBA(ctx.getImageData(0,0,w,h).data,w,h,anchors,log);
  }
  return {supplementImage,supplementRGBA};
})();
