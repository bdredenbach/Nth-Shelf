/* Nth Shelf — Frame Test 8: an exterior-anchored network of shared seams.
 * Bounded recovery for otherwise EMPTY identity maps. Unlike a gutter route,
 * this proves straight colour/ink discontinuities where panels touch. Five
 * independently closed exterior-touching cells establish a complete six-face
 * planar network, including one stepped (concave) neighbour. A dark path alone
 * is never sufficient. Unknown/ambiguous networks return no new identities.
 * No title, page index, filename, image hash, or saved crop coordinates.
 */
const PanelAbuttingFrames = (() => {
  'use strict';
  const METHOD='exterior-anchored-abutting-seam-network';
  const finite=Number.isFinite;
  const range=(x,a,b)=>finite(x)&&x>=a&&x<=b;
  const polygonArea=q=>q.reduce((s,p,i)=>{const n=q[(i+1)%q.length];return s+p[0]*n[1]-n[0]*p[1];},0)/2;
  const box=q=>[Math.min(...q.map(p=>p[0])),Math.min(...q.map(p=>p[1])),Math.max(...q.map(p=>p[0])),Math.max(...q.map(p=>p[1]))];
  const atLine=(r,t)=>r.m*t+r.b;
  function meet(a,b){if(a.v)[a,b]=[b,a];const x=(b.b+b.m*a.b)/(1-a.m*b.m);return [x,a.m*x+a.b];}
  function regress(points,weighted=false){
    if(points.length<12)return null;
    let sw=0,sx=0,sy=0,sxx=0,sxy=0;
    for(const p of points){const w=weighted?Math.min(p[2],100):1;sw+=w;sx+=p[0]*w;sy+=p[1]*w;sxx+=p[0]*p[0]*w;sxy+=p[0]*p[1]*w;}
    const d=sw*sxx-sx*sx;if(d<=0)return null;
    const m=(sw*sxy-sx*sy)/d,b=(sy-m*sx)/sw;
    const e=points.map(p=>Math.abs(p[1]-m*p[0]-b)).sort((a,b)=>a-b);
    return finite(m)&&finite(b)?{m,b,residual:e[Math.floor((e.length-1)*.9)],samples:points.length}:null;
  }
  function matte(rgba,w,h){
    const edge=[];for(let x=0;x<w;x+=3)for(const y of [0,h-1])edge.push([rgba[(y*w+x)*4],rgba[(y*w+x)*4+1],rgba[(y*w+x)*4+2]]);
    for(let y=0;y<h;y+=3)for(const x of [0,w-1])edge.push([rgba[(y*w+x)*4],rgba[(y*w+x)*4+1],rgba[(y*w+x)*4+2]]);
    const color=[0,1,2].map(c=>edge.map(p=>p[c]).sort((a,b)=>a-b)[edge.length>>1]);
    if(color[0]*.299+color[1]*.587+color[2]*.114>25||edge.filter(p=>p.every((x,c)=>Math.abs(x-color[c])<=6)).length/edge.length<.97)return null;
    const bg=new Uint8Array(w*h),q=new Int32Array(w*h);let head=0,tail=0;
    const offer=i=>{if(bg[i]||[0,1,2].some(c=>Math.abs(rgba[i*4+c]-color[c])>5))return;bg[i]=1;q[tail++]=i;};
    for(let x=0;x<w;x++){offer(x);offer((h-1)*w+x);}for(let y=0;y<h;y++){offer(y*w);offer(y*w+w-1);}
    while(head<tail){const i=q[head++],x=i%w,y=i/w|0;if(x)offer(i-1);if(x+1<w)offer(i+1);if(y)offer(i-w);if(y+1<h)offer(i+w);}
    if(tail<w*h*.025)return null;
    const outer=[];
    for(const v of [false,true]){
      const T=v?h:w,P=v?w:h,L=[],R=[];
      for(let t=Math.ceil(T*.05);t<T*.95;t++){
        let lo=0,hi=P-1;while(lo<P&&bg[v?t*w+lo:lo*w+t])lo++;while(hi>lo&&bg[v?t*w+hi:hi*w+t])hi--;
        if(hi-lo<P*.80)continue;L.push([t,lo-.5]);R.push([t,hi+.5]);
      }
      for(const [side,pts]of [L,R].entries()){
        let f=regress(pts),clean=pts;if(!f)return null;
        for(let i=0;i<3;i++){clean=pts.filter(p=>Math.abs(p[1]-atLine(f,p[0]))<1.5);f=regress(clean);if(!f)return null;}
        const support=clean.length/(T*.9);
        if(Math.abs(f.m)>.025||f.residual>1.25||support<.90)return null;
        outer.push({...f,v,outer:true,side,support,coverage:1,id:outer.length});
      }
    }
    const boundary=[meet(outer[0],outer[2]),meet(outer[0],outer[3]),meet(outer[1],outer[3]),meet(outer[1],outer[2])];
    if(boundary.some(p=>p[0]<1||p[1]<1||p[0]>w-1||p[1]>h-1)||polygonArea(boundary)<w*h*.75)return null;
    return {color,outer,boundary};
  }
  function features(rgba,w,h,outer){
    const g=new Float32Array(w*h);for(let i=0;i<g.length;i++)g[i]=rgba[i*4]*.299+rgba[i*4+1]*.587+rgba[i*4+2]*.114;
    const result=[];
    for(const v of [false,true]){
      const T=v?h:w,P=v?w:h,S=new Float32Array(T*P),vote=new Float32Array(T*P);
      const index=(t,p)=>v?t*w+p:p*w+t;
      for(let t=2;t<T-2;t++)for(let p=2;p<P-2;p++){
        let delta=0,tangent=0;
        for(let c=0;c<3;c++){
          const pre=(rgba[index(t,p-2)*4+c]+rgba[index(t,p-1)*4+c])/2;
          const post=(rgba[index(t,p+1)*4+c]+rgba[index(t,p+2)*4+c])/2;
          delta=Math.max(delta,Math.abs(post-pre));tangent=Math.max(tangent,Math.abs(rgba[index(t+1,p)*4+c]-rgba[index(t-1,p)*4+c]));
        }
        if(delta>1.3*tangent)S[t*P+p]=delta;
        if(delta>1.5*tangent)vote[t*P+p]=delta;
      }
      const points=[];
      for(let t=2;t<T-2;t++)for(let p=3;p<P-3;p++){
        const x=v?p:t,y=v?t:p;
        if(x<atLine(outer[2],y)+5||x>atLine(outer[3],y)-5||y<atLine(outer[0],x)+5||y>atLine(outer[1],x)-5)continue;
        const k=t*P+p,z=vote[k];if(z>32&&z>=vote[k-1]&&z>vote[k+1])points.push([t,p,Math.min(z,100)/100]);
      }
      result.push({v,T,P,S,vote,points,g,index});
    }return result;
  }
  // A Hough vote proposes a search line, never a panel edge. All fitted rail
  // acceptance below uses bounded image samples and separated fragment fits.
  function proposals(F){
    const {T,P,points,vote}=F,B=P+T,off=Math.floor(T/2),acc=new Float32Array(161*B),out=[];
    for(let si=0;si<=160;si++){const m=(si-80)*.002,base=si*B;for(const p of points){const k=Math.round(p[1]-m*p[0]+off);if(k>=0&&k<B)acc[base+k]+=p[2];}}
    for(let attempt=0;attempt<80&&out.length<22;attempt++){
      let best=25,chosen=-1;for(let k=0;k<acc.length;k++)if(acc[k]>best){best=acc[k];chosen=k;}
      if(chosen<0)break;const si=chosen/B|0,bi=chosen%B,initial={m:(si-80)*.002,b:bi-off};
      for(let s=Math.max(0,si-10);s<=Math.min(160,si+10);s++)for(let b=Math.max(0,bi-4);b<=Math.min(B-1,bi+4);b++)acc[s*B+b]=0;
      let pts=points.filter(p=>Math.abs(p[1]-atLine(initial,p[0]))<1.6),fit=regress(pts);if(!fit)continue;
      for(let it=0;it<3;it++){const keep=pts.filter(p=>Math.abs(p[1]-atLine(fit,p[0]))<1.2);if(keep.length<20)break;fit=regress(keep);}
      if(!fit||Math.abs(fit.m)>.17)continue;
      const pos=[];
      for(let t=0;t<T;t++){const p=Math.round(atLine(fit,t));if(p<2||p>=P-2)continue;if(Math.max(vote[t*P+p-1],vote[t*P+p],vote[t*P+p+1])>32)pos.push(t);}
      let run=[],supported=false;
      const accept=()=>{if(run.length>=50&&run[run.length-1]-run[0]>70&&run.length/(run[run.length-1]-run[0]+1)>=.48)supported=true;};
      for(const t of pos){if(run.length&&t-run[run.length-1]>18){accept();run=[];}run.push(t);}accept();if(!supported)continue;
      if(out.some(r=>Math.abs(r.m-fit.m)<.005&&Math.abs(r.b-fit.b)<3))continue;
      out.push({v:F.v,m:fit.m,b:fit.b,votes:best});
    }return out;
  }
  function railFitter(fields,w,h){
    const cache=new Map();
    return function fit(c,lo,hi,minimum=.74){
      const key=[c.id,Math.round(lo),Math.round(hi),minimum].join(':');if(cache.has(key))return cache.get(key);cache.set(key,null);
      if(c.outer){cache.set(key,c);return c;}
      if(hi-lo<(c.v?h:w)*.11)return null;
      const F=fields[c.v?1:0],{T,P,S,g,index}=F,t0=Math.ceil(lo)+3,t1=Math.floor(hi)-2,n=t1-t0;
      if(t0<2||t1>T-2||n<30)return null;
      let f={m:c.m,b:c.b},selected=[];
      for(let it=0;it<4;it++){
        const pts=[];
        for(let t=t0;t<t1;t++){
          const expected=atLine(f,t),q=Math.round(expected);if(q<=5||q>=P-6)return null;
          let best=-Infinity,pick=q,value=0;
          for(let p=q-3;p<=q+3;p++){const val=S[t*P+p],score=val-Math.abs(p-expected)*12;if(score>best){best=score;pick=p;value=val;}}
          if(value>32)pts.push([t,pick,value]);
        }
        if(pts.length/n<.58)return null;f=regress(pts,true);if(!f)return null;
        selected=pts.filter(p=>Math.abs(p[1]-atLine(f,p[0]))<1.3);
        if(selected.length/n<.50)return null;f=regress(selected,true);if(!f||Math.abs(f.m)>.17)return null;
        if(Math.max(Math.abs(atLine(f,t0)-atLine(c,t0)),Math.abs(atLine(f,t1)-atLine(c,t1)))>4.2)return null;
      }
      let covered=0,gap=0,maxGap=0;
      for(let t=t0;t<t1;t++){
        const q=Math.round(atLine(f,t));let edge=0,ink=255;
        for(let d=-2;d<=2;d++){edge=Math.max(edge,S[t*P+q+d]);ink=Math.min(ink,g[index(t,q+d)]);}
        const ok=edge>28||ink<75;covered+=ok;gap=ok?0:gap+1;maxGap=Math.max(gap,maxGap);
      }
      const support=selected.length/n,coverage=covered/n;
      if(support<minimum||coverage<.96||maxGap>Math.max(4,n*.035)||f.residual>1.05)return null;
      const independent=[];
      for(const [a,b] of [[t0,t0+n*.4],[t0+n*.6,t1]]){
        const pts=selected.filter(p=>p[0]>=a&&p[0]<b),r=regress(pts);
        if(!r||pts.length/(b-a)<.44)return null;independent.push(r);
      }
      if(Math.abs(independent[0].m-independent[1].m)>.02||Math.abs(atLine(independent[0],(t0+t1)/2)-atLine(independent[1],(t0+t1)/2))>2.2)return null;
      const result={...c,...f,lo,hi,support,coverage,maxGap,independentFits:independent};cache.set(key,result);return result;
    };
  }
  // Rejection-only inset proof. Four sustained thin ink sides can veto a
  // containing region even when they do not meet the colour-seam admission
  // rule. This function cannot create a panel or move an accepted boundary.
  function insetRailFitter(fields){
    const cache=new Map();
    return (r,lo,hi)=>{
      const key=[r.id,Math.round(lo),Math.round(hi)].join(':');if(cache.has(key))return cache.get(key);cache.set(key,null);
      const F=fields[r.v?1:0],{T,P,g,index}=F,begin=Math.ceil(lo)+5,end=Math.floor(hi)-5;
      if(begin<4||end>T-4||end-begin<80)return null;
      let covered=0,narrow=0;const points=[];
      for(let t=begin;t<end;t++){
        const q=Math.round(atLine(r,t));if(q<12||q>P-13)return null;
        let p=q,ink=255;for(let d=-3;d<=3;d++){const v=g[index(t,q+d)];if(v<ink){ink=v;p=q+d;}}
        if(ink<80)covered++;
        let a=p,b=p;while(a>p-8&&g[index(t,a-1)]<80)a--;while(b<p+8&&g[index(t,b+1)]<80)b++;
        let before=0,after=0;for(let d=2;d<=4;d++){before+=g[index(t,a-d)];after+=g[index(t,b+d)];}
        if(ink<80){
          const pre=before/3-ink,post=after/3-ink;
          if(b-a<=7&&Math.min(pre,post)>18){narrow++;points.push([t,(a+b)/2]);}
          else if(post>35&&b<p+8&&Math.abs(b-atLine(r,t))<4){narrow++;points.push([t,b]);}
          else if(pre>35&&a>p-8&&Math.abs(a-atLine(r,t))<4){narrow++;points.push([t,a]);}
        }
      }
      const f=regress(points);if(covered/(end-begin)<.97||narrow/(end-begin)<.42||!f||f.residual>2.0||Math.abs(f.m-r.m)>.02)return null;
      if(Math.max(Math.abs(atLine(f,begin)-atLine(r,begin)),Math.abs(atLine(f,end)-atLine(r,end)))>4)return null;
      const out={...r,...f};cache.set(key,out);return out;
    };
  }
  function inside(q,x,y){let yes=false;for(let i=0,j=q.length-1;i<q.length;j=i++)if((q[i][1]>y)!==(q[j][1]>y)&&x<(q[j][0]-q[i][0])*(y-q[i][1])/(q[j][1]-q[i][1])+q[i][0])yes=!yes;return yes;}
  function candidates(lines,fit,w,h,internalOnly=false){
    const hs=lines.filter(r=>!r.v),vs=lines.filter(r=>r.v),out=[];
    for(let ai=0;ai<hs.length;ai++)for(let bi=ai+1;bi<hs.length;bi++)for(let ci=0;ci<vs.length;ci++)for(let di=ci+1;di<vs.length;di++){
      const a=hs[ai],b=hs[bi],c=vs[ci],d=vs[di];
      const anchored=[a,b,c,d].some(x=>x.outer);
      if(internalOnly?anchored:!anchored)continue;
      const [top,bot]=atLine(a,w/2)<atLine(b,w/2)?[a,b]:[b,a], [left,right]=atLine(c,h/2)<atLine(d,h/2)?[c,d]:[d,c];
      const q=[meet(top,left),meet(top,right),meet(bot,right),meet(bot,left)];
      if(q.some(p=>p[0]<0||p[1]<0||p[0]>w||p[1]>h)||Math.min(q[1][0]-q[0][0],q[2][0]-q[3][0])<w*.13||Math.min(q[3][1]-q[0][1],q[2][1]-q[1][1])<h*.13)continue;
      const area=polygonArea(q);if(area<w*h*.035||area>w*h*.60)continue;
      const spans=[[top,q[0][0],q[1][0]],[bot,q[3][0],q[2][0]],[left,q[0][1],q[3][1]],[right,q[1][1],q[2][1]]],fits=new Map();
      for(const [r,lo,hi] of spans.sort((a,b)=>Number(!!a[0].outer)-Number(!!b[0].outer))){const f=fit(r,lo,hi);if(!f)break;fits.set(r.id,f);}
      if(fits.size!==4)continue;
      if(internalOnly)return [{interiorFrame:true}];
      const fs=[top,bot,left,right].map(r=>fits.get(r.id));
      let divided=false;
      for(const r of lines){
        if(fits.has(r.id))continue;let p1,p2;
        if(r.v){p1=meet(fs[0],r);p2=meet(fs[1],r);if(Math.min(p1[0]-q[0][0],q[1][0]-p1[0],p2[0]-q[3][0],q[2][0]-p2[0])<12)continue;}
        else{p1=meet(r,fs[2]);p2=meet(r,fs[3]);if(Math.min(p1[1]-q[0][1],q[3][1]-p1[1],p2[1]-q[1][1],q[2][1]-p2[1])<12)continue;}
        if(fit(r,p1[r.v?1:0],p2[r.v?1:0])){divided=true;break;}
      }
      if(divided)continue;
      const quad=[meet(fs[0],fs[2]),meet(fs[0],fs[3]),meet(fs[1],fs[3]),meet(fs[1],fs[2])];
      out.push({fits:fs,quad,score:fs.reduce((n,r)=>n+(r.outer?0:r.votes||0),0)});
    }
    // Near-identical Hough proposals describe the same visible cell. Prefer
    // the measured stronger hypothesis; different cells may never overlap.
    out.sort((a,b)=>b.score-a.score);const unique=[];
    for(const c of out){if(unique.some(q=>c.quad.every((p,i)=>Math.hypot(p[0]-q.quad[i][0],p[1]-q.quad[i][1])<4)))continue;unique.push(c);}
    return unique;
  }
  function makeNetwork(cells,quiet,fit,w,h,log){
    if(cells.length!==5)return null;
    const rails=quiet.outer.map(r=>({...r}));
    for(const cell of cells)for(const f of cell.fits){
      if(f.outer)continue;
      const same=rails.find(r=>!r.outer&&r.v===f.v&&Math.abs(r.m-f.m)<.015&&Math.max(Math.abs(atLine(r,f.lo)-atLine(f,f.lo)),Math.abs(atLine(r,f.hi)-atLine(f,f.hi)))<2.5);
      if(same){same.lo=Math.min(same.lo,f.lo);same.hi=Math.max(same.hi,f.hi);}
      else rails.push({...f});
    }
    if(rails.length!==10)return null;
    for(let i=4;i<rails.length;i++){const r=rails[i],f=fit(r,r.lo,r.hi);if(!f)return null;rails[i]=f;}
    const bounds=box(quiet.boundary);for(let i=0;i<4;i++){rails[i].lo=bounds[rails[i].v?1:0]-3;rails[i].hi=bounds[rails[i].v?3:2]+3;}
    const nodes=[],on=rails.map(()=>[]);
    for(let i=0;i<rails.length;i++)for(let j=i+1;j<rails.length;j++){
      const a=rails[i],b=rails[j];if(a.v===b.v)continue;const p=meet(a,b);
      if(p.some(x=>!finite(x))||p[0]<0||p[1]<0||p[0]>w||p[1]>h||p[a.v?1:0]<a.lo-4||p[a.v?1:0]>a.hi+4||p[b.v?1:0]<b.lo-4||p[b.v?1:0]>b.hi+4)continue;
      const id=nodes.length;nodes.push({x:p[0],y:p[1],rails:[i,j]});on[i].push(id);on[j].push(id);
    }
    const edges=[];
    for(let i=0;i<rails.length;i++){
      const r=rails[i],ns=on[i].sort((a,b)=>(r.v?nodes[a].y-nodes[b].y:nodes[a].x-nodes[b].x));
      if(ns.length<2)return null;
      // Every endpoint must be a measured junction, not an arbitrary line end.
      if(!r.outer&&(Math.abs((r.v?nodes[ns[0]].y:nodes[ns[0]].x)-r.lo)>5||Math.abs((r.v?nodes[ns[ns.length-1]].y:nodes[ns[ns.length-1]].x)-r.hi)>5))return null;
      for(let j=1;j<ns.length;j++)edges.push({a:ns[j-1],b:ns[j],rail:i});
    }
    const neighbors=nodes.map(()=>[]);for(const e of edges){neighbors[e.a].push(e.b);neighbors[e.b].push(e.a);}
    if(nodes.length!==15||edges.length!==20||neighbors.some(n=>n.length<2||n.length>3))return null;
    for(let i=0;i<nodes.length;i++)neighbors[i].sort((a,b)=>Math.atan2(nodes[a].y-nodes[i].y,nodes[a].x-nodes[i].x)-Math.atan2(nodes[b].y-nodes[i].y,nodes[b].x-nodes[i].x));
    const visited=new Set(),faces=[];
    for(const e of edges)for(const [start,next]of [[e.a,e.b],[e.b,e.a]]){
      if(visited.has(start+','+next))continue;let a=start,b=next;const ns=[];
      for(let n=0;n<=edges.length*2;n++){
        const key=a+','+b;if(visited.has(key))return null;visited.add(key);ns.push(a);
        const near=neighbors[b],at=near.indexOf(a),c=near[(at+near.length-1)%near.length];a=b;b=c;
        if(a===start&&b===next)break;
      }
      const q=ns.map(i=>[nodes[i].x,nodes[i].y]),area=polygonArea(q);if(area>1)faces.push({nodes:ns,area});
    }
    if(faces.length!==6||Math.abs(faces.reduce((n,f)=>n+f.area,0)-polygonArea(quiet.boundary))>1e-5)return null;
    const simplified=faces.map(f=>f.nodes.filter((n,i)=>{
      const a=f.nodes[(i+f.nodes.length-1)%f.nodes.length],b=f.nodes[(i+1)%f.nodes.length];
      return Math.abs((nodes[n].x-nodes[a].x)*(nodes[b].y-nodes[n].y)-(nodes[n].y-nodes[a].y)*(nodes[b].x-nodes[n].x))>1e-6;
    }));
    if(simplified.filter(q=>q.length===4).length!==5||simplified.filter(q=>q.length===6).length!==1)return null;
    for(let i=0;i<faces.length;i++)faces[i].corners=simplified[i];
    if(faces.some(f=>f.area<w*h*.035||f.area>w*h*.36))return null;
    faces.sort((a,b)=>{const ba=box(a.corners.map(i=>[nodes[i].x,nodes[i].y])),bb=box(b.corners.map(i=>[nodes[i].x,nodes[i].y]));return Math.abs(ba[1]-bb[1])>h*.06?ba[1]-bb[1]:ba[0]-bb[0];});
    log?.('abutting seam network: 5 closed cells establish 6 complete faces, including one stepped outline');
    return {rails,nodes,edges,faces};
  }
  function analyzeRGBA(rgba,w,h,log){
    if(!Number.isInteger(w)||!Number.isInteger(h)||w<200||h<250||w>900||h>900||!rgba||rgba.length!==w*h*4)return [];
    for(let i=3;i<rgba.length;i+=4)if(rgba[i]!==255)return [];
    const quiet=matte(rgba,w,h);if(!quiet)return [];
    const fields=features(rgba,w,h,quiet.outer),lines=[...quiet.outer,...proposals(fields[0]),...proposals(fields[1])];lines.forEach((r,i)=>r.id=i);
    const fit=railFitter(fields,w,h),cells=candidates(lines,fit,w,h);
    log?.(`abutting proposals: ${lines.length} lines, ${cells.length} independently closed cells`);
    const network=makeNetwork(cells,quiet,fit,w,h,log);if(!network)return [];
    // A substantial independently closed inset cannot be treated as artwork
    // inside one of these six owners. This first rollout withholds the group
    // rather than guessing its reading order or swallowing that inset.
    if(candidates(lines,insetRailFitter(fields),w,h,true).length){log?.('abutting network withheld: unexplained interior frame');return [];}
    const group={version:1,method:METHOD,connected:true,analysisWidth:w,analysisHeight:h,color:quiet.color,outer:quiet.boundary,...network};
    const out=network.faces.map((face,index)=>{
      const q=face.corners.map(i=>[network.nodes[i].x/w,network.nodes[i].y/h]),b=box(q);
      return {x:b[0],y:b[1],w:b[2]-b[0],h:b[3]-b[1],_outline:q.map(p=>({x:p[0],y:p[1]})),_identitySource:'abutment-frame',_geometryOwner:'shared-seam-outline',_geometryType:'abutting-seam-network',_abutmentProof:{...group,index}};
    });
    return out.every(validPanel)?out:[];
  }
  function validPanel(panel){try{return validatePanel(panel);}catch(_){return false;}}
  function validatePanel(panel){
    const p=panel?._abutmentProof,W=p?.analysisWidth,H=p?.analysisHeight;
    if(panel?._identitySource!=='abutment-frame'||p?.version!==1||p.method!==METHOD||p.connected!==true||!Number.isInteger(W)||!Number.isInteger(H)||W<200||H<250||W>900||H>900||!Number.isInteger(p.index)||p.index<0||p.index>=6)return false;
    if(!Array.isArray(p.color)||p.color.length!==3||p.color.some(v=>!Number.isInteger(v)||v<0||v>255)||p.color[0]*.299+p.color[1]*.587+p.color[2]*.114>25)return false;
    const {rails,nodes,edges,faces}=p;
    if(!Array.isArray(rails)||rails.length!==10||!Array.isArray(nodes)||nodes.length!==15||!Array.isArray(edges)||edges.length!==20||!Array.isArray(faces)||faces.length!==6||!Array.isArray(p.outer)||p.outer.length!==4)return false;
    for(const [i,r]of rails.entries()){
      if(typeof r.v!=='boolean'||!range(r.m,-.17,.17)||!finite(r.b)||!range(r.coverage,.96,1)||!range(r.residual,0,i<4?1.25:1.05)||!range(r.support,i<4?.90:.74,1.01)||!Number.isInteger(r.samples)||r.samples<12||!finite(r.lo)||!finite(r.hi)||r.hi<=r.lo)return false;
      if(i<4){if(r.outer!==true||Math.abs(r.m)>.025||r.v!==(i>=2)||r.side!==(i%2))return false;}
      else if(r.outer||!Array.isArray(r.independentFits)||r.independentFits.length!==2||r.independentFits.some(f=>!range(f?.m,-.2,.2)||!finite(f?.b)||!range(f?.residual,0,1.8)||!Number.isInteger(f.samples)||f.samples<12)||Math.abs(r.independentFits[0].m-r.independentFits[1].m)>.02||Math.abs(atLine(r.independentFits[0],(r.lo+r.hi)/2)-atLine(r.independentFits[1],(r.lo+r.hi)/2))>2.3)return false;
    }
    for(const r of rails.slice(4)){const n=Math.floor(r.hi)-Math.ceil(r.lo)-5;if(n<30||!Number.isInteger(r.maxGap)||r.maxGap<0||r.maxGap>Math.max(4,n*.035)||Math.abs(r.samples/n-r.support)>.000001)return false;}
    for(const n of nodes){if(!range(n.x,0,W)||!range(n.y,0,H)||!Array.isArray(n.rails)||n.rails.length!==2||n.rails.some(i=>!Number.isInteger(i)||i<0||i>=10)||rails[n.rails[0]].v===rails[n.rails[1]].v)return false;const m=meet(rails[n.rails[0]],rails[n.rails[1]]);if(Math.hypot(m[0]-n.x,m[1]-n.y)>1e-6)return false;}
    const keys=new Map();for(const e of edges){if(!Number.isInteger(e.a)||!Number.isInteger(e.b)||e.a<0||e.a>=15||e.b<0||e.b>=15||e.a===e.b||!Number.isInteger(e.rail)||e.rail<0||e.rail>=10||!nodes[e.a].rails.includes(e.rail)||!nodes[e.b].rails.includes(e.rail))return false;const k=[e.a,e.b].sort((a,b)=>a-b).join(':');if(keys.has(k))return false;keys.set(k,{uses:[],rail:e.rail});}
    let sum=0;for(const [fi,f]of faces.entries()){
      if(!Array.isArray(f.nodes)||f.nodes.length<4||f.nodes.length>8||new Set(f.nodes).size!==f.nodes.length||f.nodes.some(i=>!Number.isInteger(i)||i<0||i>=15)||!Array.isArray(f.corners)||![4,6].includes(f.corners.length)||f.corners.some(i=>!f.nodes.includes(i)))return false;
      const corners=f.nodes.filter((n,i)=>{const a=f.nodes[(i+f.nodes.length-1)%f.nodes.length],b=f.nodes[(i+1)%f.nodes.length];return Math.abs((nodes[n].x-nodes[a].x)*(nodes[b].y-nodes[n].y)-(nodes[n].y-nodes[a].y)*(nodes[b].x-nodes[n].x))>1e-6;});
      if(corners.length!==f.corners.length||corners.some((v,i)=>v!==f.corners[i]))return false;
      const q=f.nodes.map(i=>[nodes[i].x,nodes[i].y]),a=polygonArea(q);if(!range(a,W*H*.035,W*H*.36)||!finite(f.area)||Math.abs(a-f.area)>1e-5)return false;sum+=a;
      for(let i=0;i<f.nodes.length;i++){const a=f.nodes[i],b=f.nodes[(i+1)%f.nodes.length],e=keys.get([a,b].sort((a,b)=>a-b).join(':'));if(!e)return false;e.uses.push([a,b,fi]);}
    }
    for(const e of keys.values())if(e.rail<4?e.uses.length!==1:e.uses.length!==2||e.uses[0][0]!==e.uses[1][1]||e.uses[0][1]!==e.uses[1][0])return false;
    const outer=[meet(rails[0],rails[2]),meet(rails[0],rails[3]),meet(rails[1],rails[3]),meet(rails[1],rails[2])];
    if(p.outer.some((v,i)=>!Array.isArray(v)||v.length!==2||v.some(x=>!finite(x))||Math.hypot(v[0]-outer[i][0],v[1]-outer[i][1])>1e-6)||Math.abs(sum-polygonArea(outer))>1e-5)return false;
    if(faces.filter(f=>f.corners.length===4).length!==5||faces.filter(f=>f.corners.length===6).length!==1)return false;
    const expected=faces[p.index].corners.map(i=>({x:nodes[i].x/W,y:nodes[i].y/H}));if(!Array.isArray(panel._outline)||panel._outline.length!==expected.length||panel._outline.some((v,i)=>!finite(v?.x)||!finite(v?.y)||Math.abs(v.x-expected[i].x)>1e-9||Math.abs(v.y-expected[i].y)>1e-9))return false;
    const b=box(expected.map(p=>[p.x,p.y]));return ['x','y','w','h'].every(k=>finite(panel[k]))&&Math.max(Math.abs(panel.x-b[0]),Math.abs(panel.y-b[1]),Math.abs(panel.w-b[2]+b[0]),Math.abs(panel.h-b[3]+b[1]))<1e-9;
  }
  function analyzeImage(img,log){
    const scale=Math.min(1,900/Math.max(img.width,img.height)),w=Math.round(img.width*scale),h=Math.round(img.height*scale),c=document.createElement('canvas');c.width=w;c.height=h;
    const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,w,h);return analyzeRGBA(ctx.getImageData(0,0,w,h).data,w,h,log);
  }
  function bleedMatte(rgba,w,h){
    const edge=[];for(let x=0;x<w;x+=3)for(const y of [0,h-1])edge.push([rgba[(y*w+x)*4],rgba[(y*w+x)*4+1],rgba[(y*w+x)*4+2]]);
    for(let y=0;y<h;y+=3)for(const x of [0,w-1])edge.push([rgba[(y*w+x)*4],rgba[(y*w+x)*4+1],rgba[(y*w+x)*4+2]]);
    const color=[0,1,2].map(c=>edge.map(p=>p[c]).sort((a,b)=>a-b)[edge.length>>1]);
    if(color[0]*.299+color[1]*.587+color[2]*.114>25||edge.filter(p=>p.every((x,c)=>Math.abs(x-color[c])<=6)).length/edge.length<.80)return null;
    const bg=new Uint8Array(w*h),q=new Int32Array(w*h);let head=0,tail=0;
    const offer=i=>{if(bg[i]||[0,1,2].some(c=>Math.abs(rgba[i*4+c]-color[c])>5))return;bg[i]=1;q[tail++]=i;};
    for(let x=0;x<w;x++){offer(x);offer((h-1)*w+x);}for(let y=0;y<h;y++){offer(y*w);offer(y*w+w-1);}
    while(head<tail){const i=q[head++],x=i%w,y=i/w|0;if(x)offer(i-1);if(x+1<w)offer(i+1);if(y)offer(i-w);if(y+1<h)offer(i+w);}
    if(tail<w*h*.025)return null;
    const outer=[];
    for(const v of [false,true]){
      const T=v?h:w,P=v?w:h,L=[],R=[];
      for(let t=Math.ceil(T*.05);t<T*.95;t++){
        let lo=0,hi=P-1;while(lo<P&&bg[v?t*w+lo:lo*w+t])lo++;while(hi>lo&&bg[v?t*w+hi:hi*w+t])hi--;
        if(hi-lo<P*.80)continue;L.push([t,lo-.5]);R.push([t,hi+.5]);
      }
      for(const [side,pts]of [L,R].entries()){
        let f=regress(pts),clean=pts;if(!f)return null;
        for(let i=0;i<3;i++){clean=pts.filter(p=>Math.abs(p[1]-atLine(f,p[0]))<1.5);f=regress(clean);if(!f)return null;}
        const support=clean.length/(T*.9);
        if(Math.abs(f.m)>.025||f.residual>1.25||support<.60)return null;
        outer.push({...f,v,outer:true,side,support,coverage:1,id:outer.length});
      }
    }
    const boundary=[meet(outer[0],outer[2]),meet(outer[0],outer[3]),meet(outer[1],outer[3]),meet(outer[1],outer[2])];
    if(boundary.some(p=>p[0]<1||p[1]<1||p[0]>w-1||p[1]>h-1)||polygonArea(boundary)<w*h*.75)return null;
    return {color,outer,boundary,bg};
  }

  // Frame Test 9: a full-width edge strip immediately beyond a side bleed.
  // The old six-face network deliberately requires an almost entirely quiet
  // exterior. This is a DIFFERENT proof, not a lower threshold on that route.
  // Three outside margins + one measured shared seam must close the strip.
  // No other scene is inferred from its location or from the user's tap.
  const STRIP_METHOD='side-bleed-anchored-exterior-strip';
  function bleedInfo(rgba,w,h,color){
    const matches=(x,y)=>[0,1,2].every(c=>Math.abs(rgba[(y*w+x)*4+c]-color[c])<=6);
    const vectors=[Array.from({length:w},(_,x)=>matches(x,0)),Array.from({length:w},(_,x)=>matches(x,h-1)),
      Array.from({length:h},(_,y)=>matches(0,y)),Array.from({length:h},(_,y)=>matches(w-1,y))];
    const fractions=vectors.map(v=>v.filter(Boolean).length/v.length);
    const sides=[2,3].filter(i=>fractions[i]>=.55&&fractions[i]<.94);
    if(sides.length!==1||fractions.some((v,i)=>i!==sides[0]&&v<.98))return null;
    const side=sides[0],a=vectors[side].map(v=>!v);
    // JPEG noise may interrupt a page-edge run for at most three samples.
    for(let i=1;i<h-1;i++)if(!a[i]&&a[i-1]){let j=i;while(j<h&&!a[j])j++;if(j-i<=3&&j<h)for(let k=i;k<j;k++)a[k]=true;}
    const runs=[];for(let y=0;y<h;y++){if(!a[y])continue;const lo=y;while(y<h&&a[y])y++;runs.push([lo,y]);}
    const substantial=runs.filter(r=>r[1]-r[0]>=h*.10);
    if(substantial.length!==1||runs.filter(r=>r!==substantial[0]).reduce((s,r)=>s+r[1]-r[0],0)>h*.01)return null;
    const [lo,hi]=substantial[0];if(lo<h*.06||hi>h*.94||hi-lo>h*.40)return null;
    return {side,lo,hi,fractions};
  }
  function stripOutside(quiet,q,rails,w,h,edge){
    const result=[];
    for(const i of [edge===0?1:0,2,3]){
      const r=rails[i],v=r.v,dir=i<2?(i===0?-1:1):(i===2?-1:1);
      const ends=i<2?[q[i===0?0:3][0],q[i===0?1:2][0]]:i===2?[q[0][1],q[3][1]]:[q[1][1],q[2][1]];
      let n=0,yes=0;
      for(let t=Math.ceil(ends[0])+3;t<ends[1]-3;t++){
        const pos=atLine(r,t);let count=0;
        for(let d=2;d<=4;d++){const x=Math.round(v?pos+dir*d:t),y=Math.round(v?t:pos+dir*d);if(x>=0&&x<w&&y>=0&&y<h&&quiet.bg[y*w+x])count++;}
        n++;yes+=count>=2;
      }
      if(n<25||yes/n<.985)return null;result.push({rail:i,samples:n,support:yes/n});
    }return result;
  }
  function analyzeBleedStripsRGBA(rgba,w,h,log){
    if(!Number.isInteger(w)||!Number.isInteger(h)||w<200||h<250||w>900||h>900||!rgba||rgba.length!==w*h*4)return [];
    for(let i=3;i<rgba.length;i+=4)if(rgba[i]!==255)return [];
    const quiet=bleedMatte(rgba,w,h);if(!quiet)return [];
    const bleed=bleedInfo(rgba,w,h,quiet.color);if(!bleed)return [];
    if(quiet.outer.some((r,i)=>r.support<(i===bleed.side?.65:i<2?.94:.88)))return [];
    const fields=features(rgba,w,h,quiet.outer),lines=[...quiet.outer,...proposals(fields[0]),...proposals(fields[1])];lines.forEach((r,i)=>r.id=i);
    const fit=railFitter(fields,w,h),out=[];
    for(const edge of [0,1]){
      // edge=0: top of a bottom strip; edge=1: bottom of a top strip.
      const anchor=edge===0?bleed.hi:bleed.lo,sideX=atLine(quiet.outer[bleed.side],anchor),opposite=quiet.outer[1-edge];
      const height=Math.abs(atLine(opposite,w/2)-anchor);
      if(height<h*.055||height>h*.28)continue;
      const possibilities=[];
      for(const c of lines){
        if(c.outer||c.v||Math.abs(c.m)>.025||Math.abs(atLine(c,sideX)-anchor)>5)continue;
        const a=meet(c,quiet.outer[2]),b=meet(c,quiet.outer[3]),f=fit(c,a[0],b[0]);if(!f||Math.abs(f.m)>.025)continue;
        if(Math.abs(atLine(f,sideX)-anchor)>2.5)continue;
        const rails=quiet.outer.map(r=>({...r}));rails[edge]=f;
        const q=[meet(rails[0],rails[2]),meet(rails[0],rails[3]),meet(rails[1],rails[3]),meet(rails[1],rails[2])];
        if(q.some(p=>p[0]<1||p[1]<1||p[0]>w-1||p[1]>h-1)||polygonArea(q)<w*h*.04||polygonArea(q)>w*h*.28)continue;
        const exterior=stripOutside(quiet,q,rails,w,h,edge);if(!exterior)continue;
        // An independently supported through-divider vetoes a merged strip.
        let divided=false;
        for(const r of lines){
          if(r.outer||r.id===f.id)continue;
          let u,v;
          if(r.v){u=meet(rails[0],r);v=meet(rails[1],r);if(Math.min(u[0]-q[0][0],q[1][0]-u[0],v[0]-q[3][0],q[2][0]-v[0])<12)continue;}
          else {u=meet(r,rails[2]);v=meet(r,rails[3]);if(Math.min(u[1]-q[0][1],q[3][1]-u[1],v[1]-q[1][1],q[2][1]-v[1])<12)continue;}
          if(fit(r,u[r.v?1:0],v[r.v?1:0])){divided=true;break;}
        }
        if(divided)continue;
        // Reuse the established rejection-only inset/divider checks; the
        // inscribed box cannot accidentally include the strip's own seam.
        if(typeof PanelClosedFrames==='undefined')continue;
        const check={box:[Math.ceil(Math.max(q[0][0],q[3][0]))+3,Math.ceil(Math.max(q[0][1],q[1][1]))+3,
          Math.floor(Math.min(q[1][0],q[2][0]))-3,Math.floor(Math.min(q[3][1],q[2][1]))-3]};
        const clean=PanelClosedFrames.analyzeRGBA(rgba,w,h,null,{gradientOnly:true,darkMatte:true,localMatteInset:true,vetoCandidates:[check]});
        if(clean.length!==1)continue;
        const bq=box(q),proof={version:1,method:STRIP_METHOD,analysisWidth:w,analysisHeight:h,edge,bleed,color:quiet.color,
          rails,exterior,dividerVetoPassed:true,insetVetoPassed:true};
        const panel={x:bq[0]/w,y:bq[1]/h,w:(bq[2]-bq[0])/w,h:(bq[3]-bq[1])/h,
          _outline:q.map(p=>({x:p[0]/w,y:p[1]/h})),_identitySource:'bleed-strip-frame',_geometryOwner:'bleed-strip-outline',_geometryType:'exterior-anchored-strip',_bleedStripProof:proof};
        if(validBleedStrip(panel))possibilities.push(panel);
      }
      possibilities.sort((a,b)=>b._bleedStripProof.rails[edge].support-a._bleedStripProof.rails[edge].support);
      if(possibilities.length){const best=possibilities[0];
        // Different plausible borders are ambiguity, not a smallest-crop rule.
        if(possibilities.some(p=>p._outline.some((v,i)=>Math.hypot((v.x-best._outline[i].x)*w,(v.y-best._outline[i].y)*h)>2.5)))continue;
        out.push(best);
      }
    }
    if(out.length)log?.(`side-bleed exterior strips: ${out.length} complete strip; other regions remain unclassified`);
    return out;
  }
  function validBleedStrip(panel){try{return validateBleedStrip(panel);}catch(_){return false;}}
  function validateBleedStrip(panel){
    const p=panel?._bleedStripProof,W=p?.analysisWidth,H=p?.analysisHeight,e=p?.edge;
    if(panel?._identitySource!=='bleed-strip-frame'||p?.version!==1||p.method!==STRIP_METHOD||![0,1].includes(e)||
      !Number.isInteger(W)||!Number.isInteger(H)||W<200||H<250||W>900||H>900||p.dividerVetoPassed!==true||p.insetVetoPassed!==true)return false;
    if(!Array.isArray(p.color)||p.color.length!==3||p.color.some(v=>!Number.isInteger(v)||!range(v,0,255))||p.color[0]*.299+p.color[1]*.587+p.color[2]*.114>25)return false;
    const bleed=p.bleed;
    if(![2,3].includes(bleed?.side)||!Number.isInteger(bleed.lo)||!Number.isInteger(bleed.hi)||bleed.lo<H*.06||bleed.hi>H*.94||!range(bleed.hi-bleed.lo,H*.10,H*.40)||
       !Array.isArray(bleed.fractions)||bleed.fractions.length!==4||bleed.fractions.some((v,i)=>!range(v,i===bleed.side?.55:.98,i===bleed.side?.94:1)))return false;
    if(!Array.isArray(p.rails)||p.rails.length!==4)return false;
    for(const [i,r] of p.rails.entries()){
      if(typeof r.v!=='boolean'||r.v!==(i>=2)||!range(r.m,-.025,.025)||!finite(r.b)||!Number.isInteger(r.samples)||r.samples<12||!range(r.residual,0,i===e?1.05:1.25))return false;
      if(i!==e){if(r.outer!==true||r.side!==i%2||!range(r.support,i===bleed.side?.65:i<2?.94:.88,1))return false;}
      else{
        const n=Math.floor(r.hi)-Math.ceil(r.lo)-5;
        if(r.outer||!range(r.lo,0,W)||!range(r.hi,0,W)||n<30||!range(r.support,.74,1)||!range(r.coverage,.96,1)||
          !Number.isInteger(r.maxGap)||r.maxGap<0||r.maxGap>Math.max(4,n*.035)||Math.abs(r.samples/n-r.support)>1e-7||
          !Array.isArray(r.independentFits)||r.independentFits.length!==2||r.independentFits.some(f=>!range(f?.m,-.05,.05)||!finite(f.b)||!range(f.residual,0,1.8)||!Number.isInteger(f.samples)||f.samples<12))return false;
        const [a,b]=r.independentFits,t=(r.lo+r.hi)/2;
        if(Math.abs(a.m-b.m)>.02||Math.abs(atLine(a,t)-atLine(b,t))>2.2)return false;
      }
    }
    if(!Array.isArray(p.exterior)||p.exterior.length!==3||new Set(p.exterior.map(x=>x.rail)).size!==3||
       p.exterior.some(x=>![1-e,2,3].includes(x.rail)||!Number.isInteger(x.samples)||x.samples<25||!range(x.support,.985,1)))return false;
    const r=p.rails,q=[meet(r[0],r[2]),meet(r[0],r[3]),meet(r[1],r[3]),meet(r[1],r[2])],anchor=e===0?bleed.hi:bleed.lo;
    if(q.some(v=>v.some(x=>!finite(x))||v[0]<1||v[1]<1||v[0]>W-1||v[1]>H-1)||!range(polygonArea(q),W*H*.04,W*H*.28)||
       !range(Math.abs(atLine(r[1-e],W/2)-anchor),H*.055,H*.28)||Math.abs(atLine(r[e],atLine(r[bleed.side],anchor))-anchor)>2.5)return false;
    if(!Array.isArray(panel._outline)||panel._outline.length!==4||panel._outline.some((v,i)=>!finite(v?.x)||!finite(v?.y)||Math.abs(v.x-q[i][0]/W)>1e-9||Math.abs(v.y-q[i][1]/H)>1e-9))return false;
    const b=box(q);
    return ['x','y','w','h'].every(k=>finite(panel[k]))&&Math.max(Math.abs(panel.x-b[0]/W),Math.abs(panel.y-b[1]/H),Math.abs(panel.w-(b[2]-b[0])/W),Math.abs(panel.h-(b[3]-b[1])/H))<1e-9;
  }
  function analyzeBleedStripsImage(img,log){
    const scale=Math.min(1,900/Math.max(img.width,img.height)),w=Math.round(img.width*scale),h=Math.round(img.height*scale),c=document.createElement('canvas');c.width=w;c.height=h;
    const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,w,h);return analyzeBleedStripsRGBA(ctx.getImageData(0,0,w,h).data,w,h,log);
  }
  // Shared read-only evidence for the separate interrupted-rim route. This
  // export does not change admission rules for any existing detector.
  function rimEvidenceRGBA(rgba,w,h){
    const quiet=bleedMatte(rgba,w,h);if(!quiet)return null;
    const fields=features(rgba,w,h,quiet.outer),lines=[...quiet.outer,...proposals(fields[0]),...proposals(fields[1])];lines.forEach((r,i)=>r.id=i);
    return {quiet,lines};
  }
  // Frame Test 11 reuses measured colour-seam primitives without changing the
  // established six-face, exterior-strip or interrupted-rim admission gates.
  function localSeamEvidenceRGBA(rgba,w,h){
    if(!Number.isInteger(w)||!Number.isInteger(h)||w<250||h<350||w>900||h>900||!rgba||rgba.length!==w*h*4)return null;
    const outer=[{v:false,m:0,b:0},{v:false,m:0,b:h-1},{v:true,m:0,b:0},{v:true,m:0,b:w-1}];
    const fields=features(rgba,w,h,outer),lines=[...proposals(fields[0]),...proposals(fields[1])];lines.forEach((r,i)=>r.id=i);
    return {lines,fit:railFitter(fields,w,h)};
  }
  return {localSeamEvidenceRGBA,analyzeRGBA,analyzeImage,validPanel,analyzeBleedStripsRGBA,analyzeBleedStripsImage,validBleedStrip,rimEvidenceRGBA};
})();
