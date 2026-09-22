/* Nth Shelf — Frame Test 10: reconnect interrupted dark panel rims.
 * Add-only and deliberately bounded to an exterior-anchored tall cell above
 * an already proved side-bleed strip. Four measured matte transitions define
 * the printed frame before any foreground crossing is assigned. Local colour
 * opposition / chromatic-backdrop evidence owns protrusions, not the tap.
 * Unknown borders, divided cells, ambiguous owners and clipped searches defer.
 * No page number, filename, comic title, image hash or stored crop lookup.
 */
const PanelRimFrames = (() => {
  'use strict';
  const METHOD='interrupted-matte-rim-with-local-foreground';
  const finite=Number.isFinite, within=(x,a,b)=>finite(x)&&x>=a&&x<=b;
  const at=(r,t)=>r.m*t+r.b;
  const signedArea=q=>q.reduce((s,p,i)=>{const n=q[(i+1)%q.length];return s+p[0]*n[1]-n[0]*p[1];},0)/2;
  const area=q=>Math.abs(signedArea(q));
  const bounds=q=>[Math.min(...q.map(p=>p[0])),Math.min(...q.map(p=>p[1])),Math.max(...q.map(p=>p[0])),Math.max(...q.map(p=>p[1]))];
  const quant=(a,q)=>{if(!a.length)return NaN;const s=a.slice().sort((a,b)=>a-b);return s[Math.floor((s.length-1)*q)];};
  const meet=(a,b)=>{if(a.v)[a,b]=[b,a];const x=(b.b+b.m*a.b)/(1-a.m*b.m);return [x,a.m*x+a.b];};
  const polygon=(top,bottom,left,right)=>[meet(top,left),meet(top,right),meet(bottom,right),meet(bottom,left)];
  function inside(q,x,y){let yes=false;for(let i=0,j=q.length-1;i<q.length;j=i++)if((q[i][1]>y)!==(q[j][1]>y)&&x<(q[j][0]-q[i][0])*(y-q[i][1])/(q[j][1]-q[i][1])+q[i][0])yes=!yes;return yes;}
  function regress(p){
    if(p.length<18)return null;let sx=0,sy=0,sxx=0,sxy=0;
    for(const [x,y]of p){sx+=x;sy+=y;sxx+=x*x;sxy+=x*y;}const n=p.length,d=n*sxx-sx*sx;if(d<=0)return null;
    const m=(n*sxy-sx*sy)/d,b=(sy-m*sx)/n;
    return finite(m)&&finite(b)?{m,b,samples:n,residual:quant(p.map(v=>Math.abs(v[1]-m*v[0]-b)),.9)}:null;
  }
  function proposals(bg,w,h){
    const out=[];
    for(const v of [false,true])for(const side of [0,1]){
      const T=v?h:w,P=v?w:h,points=[],off=Math.ceil(T*.035)+6,B=P+off*2,acc=new Uint16Array(21*B);
      const ix=(t,p)=>v?t*w+p:p*w+t;
      for(let t=0;t<T;t++)for(let p=1;p<P;p++)if(side===0?bg[ix(t,p-1)]&&!bg[ix(t,p)]:!bg[ix(t,p-1)]&&bg[ix(t,p)])points.push([t,p-.5]);
      for(let s=0;s<21;s++){const m=(s-10)*.0025;for(const [t,p]of points){const k=Math.round(p-m*t+off);if(k>=0&&k<B)acc[s*B+k]++;}}
      const local=[];
      for(let tries=0;tries<30;tries++){
        let best=47,key=-1;for(let i=0;i<acc.length;i++)if(acc[i]>best){best=acc[i];key=i;}if(key<0)break;
        const si=key/B|0,bi=key%B,m=(si-10)*.0025,b=bi-off;
        for(let s=Math.max(0,si-4);s<=Math.min(20,si+4);s++)for(let k=Math.max(0,bi-4);k<=Math.min(B-1,bi+4);k++)acc[s*B+k]=0;
        let p=points.filter(p=>Math.abs(p[1]-m*p[0]-b)<1.6),f=regress(p);if(!f)continue;
        for(let i=0;i<3;i++){const clean=p.filter(p=>Math.abs(p[1]-at(f,p[0]))<1.4),next=regress(clean);if(!next)break;f=next;}
        if(Math.abs(f.m)>.028||local.some(r=>Math.abs(at(r,T/2)-at(f,T/2))<3))continue;
        local.push({...f,v,side,votes:best});
      }
      out.push(...local);
    }
    return out;
  }
  function localFit(bg,w,h,r,lo,hi,depth=2){
    const points=[],v=r.v,dir=r.side===0?1:-1;
    if(hi-lo<50)return null;
    for(let t=Math.ceil(lo)+3;t<Math.floor(hi)-2;t++){
      const e=at(r,t),q=Math.round(e);let best=null;
      for(let p=q-2;p<=q+2;p++){
        const x=v?p:t,y=v?t:p;if(x<6||y<6||x>=w-6||y>=h-6)continue;
        const get=p=>bg[v?t*w+p:p*w+t];let exterior=0,interior=0;
        for(let k=0;k<depth;k++)exterior+=get(dir>0?p-1-k:p+k);
        for(let k=0;k<3;k++)interior+=!get(dir>0?p+k:p-1-k);
        if(exterior===depth&&interior>=2&&(best===null||Math.abs(p-.5-e)<Math.abs(best-e)))best=p-.5;
      }
      if(best!==null)points.push([t,best]);
    }
    const f=regress(points);if(!f||f.residual>1.2||Math.abs(f.m)>.028)return null;
    const center=(lo+hi)/2,one=regress(points.filter(p=>p[0]<center)),two=regress(points.filter(p=>p[0]>=center));
    if(!one||!two||Math.abs(one.m-two.m)>.025||Math.abs(at(one,center)-at(two,center))>2.3)return null;
    return {...r,...f,lo,hi,depth,support:points.length/(Math.floor(hi)-Math.ceil(lo)-5),independentFits:[one,two]};
  }
  // Rejection-only second look for a sizeable enclosed matte-stroke box.
  // All four transitions must be fitted inside the parent; small caption
  // boxes do not meet the area gate. This does not construct new panels.
  function containsMatteInset(bg,w,h,ps,body){
    const b=bounds(body),A=area(body),insideLine=r=>{const lo=r.v?b[1]:b[0],hi=r.v?b[3]:b[2],a=r.v?b[0]:b[1],z=r.v?b[2]:b[3];return at(r,lo)>a+8&&at(r,hi)<z-8;};
    const lines=ps.filter(insideLine),hs=lines.filter(r=>!r.v),vs=lines.filter(r=>r.v);
    for(const t of hs.filter(r=>r.side===0))for(const bot of hs.filter(r=>r.side===1)){
      const dy=at(bot,w/2)-at(t,w/2);if(dy<55||dy>b[3]-b[1]-16)continue;
      for(const l of vs.filter(r=>r.side===0))for(const r of vs.filter(r=>r.side===1)){
        const q=polygon(t,bot,l,r),a=area(q);if(a<A*.05||a>A*.65||q.some(p=>p[0]<b[0]+8||p[0]>b[2]-8||p[1]<b[1]+8||p[1]>b[3]-8)||q[1][0]-q[0][0]<55)continue;
        const fits=[localFit(bg,w,h,t,q[0][0],q[1][0],1),localFit(bg,w,h,bot,q[3][0],q[2][0],1),localFit(bg,w,h,l,q[0][1],q[3][1],1),localFit(bg,w,h,r,q[1][1],q[2][1],1)];
        if(fits.every(f=>f&&f.support>.87))return true;
      }
    }return false;
  }
  function bandProof(bg,w,h,edge,mate,lo,hi){
    const dir=edge.side===0?-1:1,v=edge.v;let profiles=0,clean=0,total=0,yes=0;
    for(let t=Math.ceil(lo)+4;t<Math.floor(hi)-3;t++){
      const a=at(edge,t),b=at(mate,t),gap=dir*(b-a);if(gap<2||gap>(v?w:h)*.065)return null;
      let n=0,k=0;for(let p=Math.ceil(Math.min(a,b))+1;p<Math.floor(Math.max(a,b));p++){
        const i=v?t*w+p:p*w+t;if(i<0||i>=bg.length)continue;n++;k+=bg[i];}
      if(!n)continue;profiles++;clean+=k/n>=.9;total+=n;yes+=k;
    }
    if(profiles<40||clean/profiles<.55||yes/total<.70)return null;
    return {profiles,cleanProfiles:clean,cleanFraction:clean/profiles,matteSamples:yes,totalSamples:total,matteFraction:yes/total};
  }
  function components(mask,w,h){
    const labels=new Int32Array(mask.length),queue=new Int32Array(mask.length),out=[];let id=0;
    for(let seed=0;seed<mask.length;seed++)if(mask[seed]&&!labels[seed]){
      if(++id>4096)return null;let head=0,tail=1;queue[0]=seed;labels[seed]=id;
      while(head<tail){const i=queue[head++],x=i%w,y=i/w|0;
        for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if((dx||dy)&&x+dx>=0&&x+dx<w&&y+dy>=0&&y+dy<h){const j=i+dy*w+dx;if(mask[j]&&!labels[j]){labels[j]=id;queue[tail++]=j;}}
      }
      out.push({id,pixels:Array.from(queue.subarray(0,tail))});
    }
    return {labels,items:out};
  }
  function dilate(mask,w,h){const out=new Uint8Array(mask.length);for(let i=0;i<mask.length;i++)if(mask[i]){const x=i%w,y=i/w|0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(x+dx>=0&&x+dx<w&&y+dy>=0&&y+dy<h)out[i+dy*w+dx]=1;}return out;}
  function close(mask,w,h){const d=dilate(mask,w,h),out=new Uint8Array(mask.length);for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){let yes=true;for(let dy=-1;dy<=1&&yes;dy++)for(let dx=-1;dx<=1;dx++)if(!d[(y+dy)*w+x+dx]){yes=false;break;}out[y*w+x]=Number(yes);}return out;}
  function selectedComponents(mask,seeds,w,h){const cc=components(mask,w,h);if(!cc)return null;const ids=new Set();for(let i=0;i<mask.length;i++)if(seeds[i]&&cc.labels[i])ids.add(cc.labels[i]);const out=new Uint8Array(mask.length);for(const c of cc.items)if(ids.has(c.id))for(const i of c.pixels)out[i]=1;return out;}
  function foreground(rgba,w,h,bg,rails,mates,q,log){
    const N=w*h,g=new Float32Array(N),ch=new Float32Array(N*3),base=new Uint8Array(N),mask=new Uint8Array(N),changes=[];
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x,r=rgba[i*4],a=rgba[i*4+1],b=rgba[i*4+2],sum=Math.max(1,r+a+b);g[i]=.299*r+.587*a+.114*b;ch[i*3]=r/sum;ch[i*3+1]=a/sum;ch[i*3+2]=b/sum;base[i]=Number(inside(q,x+.5,y+.5));}
    mask.set(base);
    for(const side of [2,3,1]){
      const edge=rails[side],mate=mates[side]?.line,v=edge.v,sign=side===2?-1:1,T=v?h:w,P=v?w:h;
      const lo=v?Math.min(q[0][1],q[1][1]):Math.min(q[0][0],q[3][0])-3;
      const hi=v?Math.max(q[2][1],q[3][1]):Math.max(q[1][0],q[2][0])+2;
      const pos=i=>v?i%w:(i/w|0),along=i=>v?(i/w|0):i%w;
      const dist=i=>sign*(pos(i)-at(edge,along(i))),md=i=>mate?sign*(pos(i)-at(mate,along(i))):-100;
      const collar=new Uint8Array(N),core=new Uint8Array(N),seeds=new Uint8Array(N);
      for(let i=0;i<N;i++)if(dist(i)>=-2&&md(i)<-.5&&along(i)>=lo&&along(i)<=hi){collar[i]=1;core[i]=Number(!bg[i]&&g[i]>18);seeds[i]=base[i];}
      const owned=selectedComponents(core,seeds,w,h);if(!owned)return null;const fringe=dilate(owned,w,h);
      let bandPixels=0;for(let i=0;i<N;i++)if(fringe[i]&&collar[i]){bandPixels+=!mask[i];mask[i]=1;}
      changes.push({kind:'measured-matte-collar',side,pixels:bandPixels});
      if(!mate)continue;
      const crossing=new Uint8Array(N),hits=new Uint8Array(T);
      for(let i=0;i<N;i++)if(owned[i]&&md(i)>-3&&md(i)<-.2){crossing[i]=1;hits[along(i)]=1;}
      const groups=[];for(let t=0;t<T;t++)if(hits[t]){const last=groups[groups.length-1];if(last&&t-last[last.length-1]<=14)last.push(t);else groups.push([t]);}
      for(const ts of groups){
        if(ts.length<2)continue;const tlo=Math.max(1,ts[0]-7),thi=Math.min(T-2,ts[ts.length-1]+7),reach=Math.max(20,Math.floor(P*.045));
        const region=new Uint8Array(N),sample=[];
        for(let i=0;i<N;i++){
          const t=along(i),d=md(i);if(d>=-4&&d<reach&&t>=tlo&&t<=thi)region[i]=1;
          if(d>2&&d<Math.min(10,reach)&&t>=tlo-10&&t<=thi+10&&g[i]>45&&!bg[i])sample.push([ch[i*3],ch[i*3+1],ch[i*3+2]]);
        }
        const seedCount=crossing.reduce((n,v,i)=>n+(v&&region[i]&&g[i]>30),0);
        if(seedCount<8)continue;
        if(sample.length<30){log?.('rim insufficient backdrop sample');return null;}
        const saturated=sample.filter(c=>Math.max(...c)-Math.min(...c)>.12),pool=saturated.length/sample.length>.25?saturated:sample;
        const bins=new Map();for(const c of pool){const key=Math.floor(c[0]/.025)*100+Math.floor(c[2]/.025);if(!bins.has(key))bins.set(key,[]);bins.get(key).push(c);}
        const cluster=Array.from(bins.values()).sort((a,b)=>b.length-a.length)[0];if(!cluster||cluster.length<8){log?.('rim sparse colour cluster '+JSON.stringify({side,span:[tlo,thi],sample:sample.length,cluster:cluster?.length}));return null;}
        const color=[0,1,2].map(c=>quant(cluster.map(v=>v[c]),.5)),distance=c=>Math.max(...c.map((v,i)=>Math.abs(v-color[i]))),chromatic=Math.max(...color)-Math.min(...color)>.12;
        let threshold=Math.max(.012,quant(cluster.map(distance),.9)+.007);
        if(chromatic){const near=pool.filter(v=>distance(v)<.14);if(near.length<15){log?.('rim sparse chromatic backdrop');return null;}threshold=Math.max(.070,quant(near.map(distance),.95)+.015);if(threshold>.13){log?.('rim noisy chromatic backdrop');return null;}}
        // Opposite opponent-colour signs keep dark hatch strokes on a cool
        // neutral backdrop from becoming warm foreground. Derive the channel
        // pair/sign from the measured crossing cores, not a named character.
        let opponent=null;
        if(!chromatic){const fg=[];for(let i=0;i<N;i++)if(crossing[i]&&region[i]&&g[i]>35)fg.push([ch[i*3],ch[i*3+1],ch[i*3+2]]);
          if(fg.length>=5){let score=.008;for(let a=0;a<3;a++)for(let b=a+1;b<3;b++){
            const background=color[a]-color[b],front=quant(fg.map(c=>c[a]-c[b]),.5);
            if(background*front<0&&Math.abs(background)>.010&&Math.abs(background-front)>score){score=Math.abs(background-front);opponent={a,b,sign:Math.sign(front)};}
          }}
          if(!opponent){log?.('rim colour ambiguity '+JSON.stringify({side,span:[tlo,thi],seedCount,color}));return null;}
        }
        let selected=new Uint8Array(N),seed=new Uint8Array(N);
        for(let i=0;i<N;i++)if(region[i]){
          const c=[ch[i*3],ch[i*3+1],ch[i*3+2]];
          selected[i]=Number(!bg[i]&&g[i]>25&&(opponent?(c[opponent.a]-c[opponent.b])*opponent.sign>=0:distance(c)>threshold));seed[i]=crossing[i];
        }
        selected=close(selected,w,h);for(let i=0;i<N;i++)selected[i]&=region[i];
        let object=selectedComponents(selected,seed,w,h);if(!object)return null;
        const near=dilate(object,w,h);for(let i=0;i<N;i++)near[i]&=selected[i];object=selectedComponents(selected,near,w,h);if(!object)return null;
        let pixels=0,far=0;for(let i=0;i<N;i++)if(object[i]){pixels++;far+=md(i)>reach-2||(md(i)>1&&(along(i)<=tlo||along(i)>=thi));}
        if(!pixels)continue;if(far){log?.('rim foreground withheld: search touches boundary '+JSON.stringify({side,span:[tlo,thi],reach,far,pixels,color,threshold,opponent}));return null;}
        // A dark printed tip can be two raster pixels beyond its coloured
        // interior. Keep that tightly bounded ink fringe, not the cool hatch
        // strokes farther along the neighbouring background.
        const extra=dilate(object,w,h);
        if(opponent){const inkNear=dilate(extra,w,h);for(let i=0;i<N;i++)if(inkNear[i]&&region[i]&&g[i]<80&&Math.max(rgba[i*4],rgba[i*4+1],rgba[i*4+2])-Math.min(rgba[i*4],rgba[i*4+1],rgba[i*4+2])<=10)extra[i]=1;}
        let added=0;for(let i=0;i<N;i++)if(extra[i]&&region[i]){added+=!mask[i];mask[i]=1;}
        changes.push({kind:chromatic?'chromatic-backdrop':'opponent-colour',side,span:[tlo,thi],reach,color,threshold,opponent,corePixels:pixels,pixels:added,clippedPixels:0});
      }
    }
    if(!changes.some(c=>c.kind==='opponent-colour'&&c.pixels>15)||!changes.some(c=>c.kind==='chromatic-backdrop'&&c.pixels>15))return null;
    // The footprint may not swallow a sizeable neighbouring region.
    const added=mask.reduce((n,v,i)=>n+(v&&!base[i]),0);if(added<30||added>N*.008){log?.('rim footprint withheld '+added);return null;}
    return {mask,base,changes,added};
  }
  function trace(labels,w,h,id) {
    const stride=w+1,edges=[],next=new Map();
    const add=(x1,y1,x2,y2,dir)=>{const a=y1*stride+x1,b=y2*stride+x2,index=edges.length;edges.push({a,b,dir});if(!next.has(a))next.set(a,[]);next.get(a).push(index);};
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){const k=y*w+x;if(labels[k]!==id)continue;
      if(!y||labels[k-w]!==id)add(x,y,x+1,y,0);
      if(x+1===w||labels[k+1]!==id)add(x+1,y,x+1,y+1,1);
      if(y+1===h||labels[k+w]!==id)add(x+1,y+1,x,y+1,2);
      if(!x||labels[k-1]!==id)add(x,y+1,x,y,3);
    }
    if(edges.length>24000)return null;
    const used=new Uint8Array(edges.length),rings=[];
    for(let seed=0;seed<edges.length;seed++)if(!used[seed]){
      let at=seed;const points=[];
      for(let steps=0;steps<=edges.length;steps++){
        if(used[at])return null;const e=edges[at];used[at]=1;points.push([e.a%stride,e.a/stride|0]);
        if(e.b===edges[seed].a)break;
        const opts=(next.get(e.b)||[]).filter(k=>!used[k]);if(!opts.length)return null;
        opts.sort((a,b)=>{const rank=k=>{const d=(edges[k].dir-e.dir+4)%4;return d===1?0:d===0?1:d===3?2:3;};return rank(a)-rank(b);});at=opts[0];
      }
      // Exact collinear simplification does not move any contour edge.
      const q=points.filter((p,i)=>{const a=points[(i+points.length-1)%points.length],b=points[(i+1)%points.length];return (p[0]-a[0])*(b[1]-p[1])!==(p[1]-a[1])*(b[0]-p[0]);});
      if(q.length<4||q.length>4096||!area(q))return null;rings.push(q);
      if(rings.length>64)return null;
    }
    return rings.sort((a,b)=>Math.abs(signedArea(b))-Math.abs(signedArea(a)));
  }
  function rasterMatches(rings,labels,w,h,id) {
    const expected=new Uint8Array(w);
    for(let y=0;y<h;y++){
      expected.fill(0);const xs=[],py=y+.5;
      for(const q of rings)for(let j=0;j<q.length;j++){
        const a=q[j],b=q[(j+1)%q.length];if((a[1]>py)!==(b[1]>py))xs.push(a[0]+(py-a[1])*(b[0]-a[0])/(b[1]-a[1]));
      }
      xs.sort((a,b)=>a-b);if(xs.length%2)return false;
      for(let j=0;j<xs.length;j+=2)for(let x=Math.max(0,Math.ceil(xs[j]-.5));x<Math.min(w,Math.ceil(xs[j+1]-.5));x++)expected[x]=1;
      for(let x=0;x<w;x++)if(expected[x]!==Number(labels[y*w+x]===id))return false;
    }return true;
  }
  function analyzeRGBA(rgba,w,h,anchors,log){
    if(!Number.isInteger(w)||!Number.isInteger(h)||w<200||h<250||w>900||h>900||!rgba||rgba.length!==w*h*4||!Array.isArray(anchors)||anchors.length!==1||typeof PanelAbuttingFrames==='undefined'||!PanelAbuttingFrames.validBleedStrip(anchors[0])||anchors[0]._bleedStripProof.edge!==0)return [];
    for(let i=3;i<rgba.length;i+=4)if(rgba[i]!==255)return [];
    const anchor=anchors[0],ap=anchor._bleedStripProof;if(ap.analysisWidth!==w||ap.analysisHeight!==h)return [];
    const context=PanelAbuttingFrames.rimEvidenceRGBA?.(rgba,w,h);if(!context)return [];
    const {quiet,lines}=context;if(quiet.color.some((c,i)=>c!==ap.color[i]))return [];
    const bg=new Uint8Array(w*h);for(let i=0;i<bg.length;i++)bg[i]=Number([0,1,2].every(c=>Math.abs(rgba[i*4+c]-quiet.color[c])<=5));
    const ps=proposals(bg,w,h),top=quiet.outer[0],candidates=[];
    // This first rollout is an upper exterior-side cell with a wide bottom
    // matte band and a narrow neighbouring gutter. Either exterior side is searched.
    for(const outsideSide of [2,3]){
      const outside=quiet.outer[outsideSide],innerSide=outsideSide===2?3:2;
      for(const iv of ps.filter(r=>r.v&&r.side===innerSide%2))for(const bh of ps.filter(r=>!r.v&&r.side===1)){
        const mid=h*.28,width=Math.abs(at(iv,mid)-at(outside,mid)),height=at(bh,w/2)-at(top,w/2);
        if(!within(width,w*.32,w*.65)||!within(height,h*.32,h*.65)||at(bh,w/2)>anchor.y*h-30)continue;
        const left=outsideSide===2?outside:iv,right=outsideSide===3?outside:iv,q=polygon(top,bh,left,right);
        if(q.some(p=>p[0]<2||p[1]<2||p[0]>w-2||p[1]>h-2))continue;
        const ftop=localFit(bg,w,h,top,q[0][0],q[1][0],3),fbot=localFit(bg,w,h,bh,q[3][0],q[2][0],5),fl=localFit(bg,w,h,left,q[0][1],q[3][1],2),fr=localFit(bg,w,h,right,q[1][1],q[2][1],2);
        if(!ftop||!fbot||!fl||!fr||ftop.support<.92||fbot.support<.62||fl.support<(outsideSide===2?.70:.85)||fr.support<(outsideSide===3?.70:.85))continue;
        const rails=[ftop,fbot,fl,fr],quad=polygon(...rails),b=bounds(quad);
        if(signedArea(quad)<w*h*.15||signedArea(quad)>w*h*.36)continue;
        // An internal full-span matte division vetoes a merged containing cell.
        let divided=false;
        for(const r of ps){const alongLo=r.v?b[1]:b[0],alongHi=r.v?b[3]:b[2],low=r.v?b[0]:b[1],high=r.v?b[2]:b[3];if(at(r,(alongLo+alongHi)/2)<low+14||at(r,(alongLo+alongHi)/2)>high-14)continue;
          const f=localFit(bg,w,h,r,alongLo,alongHi,2);if(f&&f.support>.86){divided=true;break;}}
        if(divided||containsMatteInset(bg,w,h,ps,quad))continue;
        const inner=rails[innerSide],lo=b[1],hi=b[3],mateCandidates=[];
        for(const r of ps.filter(r=>r.v&&r.side!==inner.side)){
          const dir=inner.side===0?-1:1,gap=dir*(at(r,(lo+hi)/2)-at(inner,(lo+hi)/2));if(gap<2||gap>12)continue;
          const f=localFit(bg,w,h,r,lo,hi,2);if(!f||f.support<.74)continue;const band=bandProof(bg,w,h,inner,f,lo,hi);if(band)mateCandidates.push({line:f,band});
        }
        mateCandidates.sort((a,b)=>b.line.support-a.line.support);if(!mateCandidates.length)continue;
        const bm=[];for(const r of lines.filter(r=>!r.v&&!r.outer&&Math.abs(r.m)<.025)){
          const gap=at(r,(b[0]+b[2])/2)-at(fbot,(b[0]+b[2])/2);if(gap<h*.006||gap>h*.06)continue;
          const band=bandProof(bg,w,h,fbot,r,b[0],b[2]);if(band&&band.cleanFraction>.55)bm.push({line:r,band});
        }
        bm.sort((a,b)=>b.band.cleanFraction-a.band.cleanFraction||b.line.votes-a.line.votes);if(!bm.length)continue;
        if(bm.some(m=>m!==bm[0]&&m.band.cleanFraction>bm[0].band.cleanFraction-.04&&Math.abs(at(m.line,w/2)-at(bm[0].line,w/2))>3))continue;
        const mates={};mates[innerSide]=mateCandidates[0];mates[1]=bm[0];
        const veto={box:[Math.ceil(Math.max(quad[0][0],quad[3][0]))+3,Math.ceil(Math.max(quad[0][1],quad[1][1]))+3,Math.floor(Math.min(quad[1][0],quad[2][0]))-3,Math.floor(Math.min(quad[2][1],quad[3][1]))-3]};
        if(typeof PanelClosedFrames==='undefined'||PanelClosedFrames.analyzeRGBA(rgba,w,h,null,{gradientOnly:true,darkMatte:true,localMatteInset:true,vetoCandidates:[veto]}).length!==1)continue;
        const score=rails.reduce((s,r)=>s+r.support,0);candidates.push({rails,quad,mates,score,outsideSide,innerSide});
      }
    }
    candidates.sort((a,b)=>b.score-a.score);const unique=[];for(const c of candidates)if(!unique.some(o=>c.quad.every((p,i)=>Math.hypot(p[0]-o.quad[i][0],p[1]-o.quad[i][1])<3)))unique.push(c);
    log?.('interrupted rim candidates: '+unique.length);if(unique.length!==1)return [];
    const c=unique[0],fg=foreground(rgba,w,h,bg,c.rails,c.mates,c.quad,log);if(!fg){log?.('rim foreground proof withheld');return [];}
    const rings=trace(fg.mask,w,h,1);if(!rings||!rasterMatches(rings,fg.mask,w,h,1)){log?.('rim contour raster withheld');return [];}
    const b=bounds(rings.flat()),pixels=fg.mask.reduce((s,x)=>s+x,0);
    const proof={version:1,method:METHOD,analysisWidth:w,analysisHeight:h,color:quiet.color,anchor:{x:anchor.x,y:anchor.y,w:anchor.w,h:anchor.h},outsideSide:c.outsideSide,innerSide:c.innerSide,rails:c.rails,bodyQuad:c.quad,mates:c.mates,changes:fg.changes,bodyPixels:fg.base.reduce((s,x)=>s+x,0),addedPixels:fg.added,pixelCount:pixels,contourCount:rings.length,ownershipRasterMismatches:0,dividerVetoPassed:true,insetVetoPassed:true};
    const panel={x:b[0]/w,y:b[1]/h,w:(b[2]-b[0])/w,h:(b[3]-b[1])/h,_identitySource:'rim-frame',_geometryOwner:'rim-outline',_geometryType:'interrupted-matte-rim-contours',_contours:rings.map(q=>q.map(p=>({x:p[0]/w,y:p[1]/h}))),_rimFrameProof:proof};
    if(!validPanel(panel)){log?.('rim serialized proof withheld');return [];}
    log?.('interrupted matte rim: complete tall frame plus foreground on the adjoining edges');return [panel];
  }
  function validPanel(panel){try{return validatePanel(panel);}catch(_){return false;}}
  function validatePanel(panel){
    const p=panel?._rimFrameProof,W=p?.analysisWidth,H=p?.analysisHeight,rings=panel?._contours;
    if(panel?._identitySource!=='rim-frame'||panel._quad||panel._outline||p?.version!==1||p.method!==METHOD||!Number.isInteger(W)||!Number.isInteger(H)||W<200||H<250||W>900||H>900||p.ownershipRasterMismatches!==0||p.dividerVetoPassed!==true||p.insetVetoPassed!==true||![2,3].includes(p.outsideSide)||p.innerSide!==(p.outsideSide===2?3:2))return false;
    if(!Array.isArray(p.color)||p.color.length!==3||p.color.some(x=>!Number.isInteger(x)||!within(x,0,255))||p.color[0]*.299+p.color[1]*.587+p.color[2]*.114>25)return false;
    if(!p.anchor||['x','y','w','h'].some(k=>!within(p.anchor[k],0,1))||p.anchor.w<.8||p.anchor.y<.55||p.anchor.y+p.anchor.h>1)return false;
    if(!Array.isArray(p.rails)||p.rails.length!==4)return false;
    for(const [i,r]of p.rails.entries()){
      if(r.v!==(i>=2)||r.side!==i%2||!within(r.m,-.028,.028)||!finite(r.b)||!within(r.residual,0,1.2)||!within(r.support,i===0?.92:i===1?.62:i===p.outsideSide?.70:.85,1.01)||!within(r.lo,0,i<2?W:H)||!within(r.hi,0,i<2?W:H)||r.hi-r.lo<50||!Number.isInteger(r.samples)||r.samples<18||![2,3,5].includes(r.depth))return false;
      if(!Array.isArray(r.independentFits)||r.independentFits.length!==2||r.independentFits.some(f=>!finite(f?.m)||!finite(f.b)||!Number.isInteger(f.samples)||f.samples<18))return false;
      const [a,b]=r.independentFits,t=(r.lo+r.hi)/2;if(Math.abs(a.m-b.m)>.025||Math.abs(at(a,t)-at(b,t))>2.3||Math.abs(r.samples/(Math.floor(r.hi)-Math.ceil(r.lo)-5)-r.support)>1e-9)return false;
    }
    const q=polygon(...p.rails);if(!Array.isArray(p.bodyQuad)||p.bodyQuad.length!==4||p.bodyQuad.some((v,i)=>!Array.isArray(v)||v.length!==2||v.some(x=>!finite(x))||Math.hypot(v[0]-q[i][0],v[1]-q[i][1])>1e-7)||!within(signedArea(q),W*H*.15,W*H*.36))return false;
    for(const side of [1,p.innerSide]){const m=p.mates?.[side],b=m?.band;if(m?.line?.v!==(side>=2)||!within(m.line.m,-.028,.028)||!finite(m.line.b)||!b||!Number.isInteger(b.profiles)||b.profiles<40||!Number.isInteger(b.cleanProfiles)||!Number.isInteger(b.totalSamples)||!Number.isInteger(b.matteSamples)||b.totalSamples<=0||!within(b.cleanFraction,.55,1)||!within(b.matteFraction,.70,1)||Math.abs(b.cleanProfiles/b.profiles-b.cleanFraction)>1e-9||Math.abs(b.matteSamples/b.totalSamples-b.matteFraction)>1e-9)return false;}
    if(!Array.isArray(p.changes)||p.changes.length<5||p.changes.length>48||!p.changes.some(c=>c.kind==='opponent-colour'&&c.pixels>15)||!p.changes.some(c=>c.kind==='chromatic-backdrop'&&c.pixels>15))return false;
    for(const c of p.changes){if(!['measured-matte-collar','opponent-colour','chromatic-backdrop'].includes(c.kind)||![1,2,3].includes(c.side)||!Number.isInteger(c.pixels)||c.pixels<0)return false;
      if(c.kind!=='measured-matte-collar'&&(!Number.isInteger(c.corePixels)||c.corePixels<=0||c.clippedPixels!==0||!Array.isArray(c.color)||c.color.length!==3||c.color.some(v=>!within(v,0,1))||!within(c.threshold,.012,.13)||!Array.isArray(c.span)||c.span.length!==2||c.span.some(v=>!Number.isInteger(v)||v<0||v>Math.max(W,H))||c.span[0]>=c.span[1]||!within(c.reach,20,41)))return false;
      if(c.kind==='opponent-colour'&&(!c.opponent||!Number.isInteger(c.opponent.a)||!Number.isInteger(c.opponent.b)||!within(c.opponent.a,0,2)||!within(c.opponent.b,0,2)||c.opponent.a===c.opponent.b||![1,-1].includes(c.opponent.sign)))return false;
    }
    if(!Number.isInteger(p.pixelCount)||!Number.isInteger(p.bodyPixels)||!Number.isInteger(p.addedPixels)||p.bodyPixels+p.addedPixels!==p.pixelCount||!within(p.addedPixels,30,W*H*.008)||!Array.isArray(rings)||!rings.length||rings.length>64||rings.length!==p.contourCount)return false;
    let sum=0;const all=[];for(const r of rings){if(!Array.isArray(r)||r.length<4||r.length>4096)return false;for(let i=0;i<r.length;i++){const a=r[i],b=r[(i+1)%r.length];if(!within(a?.x,0,1)||!within(a?.y,0,1)||!within(b?.x,0,1)||!within(b?.y,0,1)||Math.abs(a.x*W-Math.round(a.x*W))>1e-7||Math.abs(a.y*H-Math.round(a.y*H))>1e-7||Math.hypot(a.x-b.x,a.y-b.y)<1e-10||(Math.abs(a.x-b.x)>1e-10&&Math.abs(a.y-b.y)>1e-10))return false;sum+=(a.x*b.y-a.y*b.x)*W*H/2;all.push([a.x,a.y]);}}
    if(Math.abs(sum-p.pixelCount)>1e-5)return false;const b=bounds(all),body=bounds(q);
    return ['x','y','w','h'].every(k=>finite(panel[k]))&&Math.max(Math.abs(panel.x-b[0]),Math.abs(panel.y-b[1]),Math.abs(panel.w-b[2]+b[0]),Math.abs(panel.h-b[3]+b[1]))<1e-9&&b[1]*H>=body[1]-2&&b[3]*H<=body[3]+H*.09&&b[3]<p.anchor.y&&b[0]*W>=body[0]-W*.065&&b[2]*W<=body[2]+W*.065;
  }
  function supplementImage(img,anchors,log){
    if(!Array.isArray(anchors)||anchors.length!==1||anchors[0]?._identitySource!=='bleed-strip-frame')return [];
    const scale=Math.min(1,900/Math.max(img.width,img.height)),w=Math.round(img.width*scale),h=Math.round(img.height*scale),c=document.createElement('canvas');c.width=w;c.height=h;
    const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,w,h);return analyzeRGBA(ctx.getImageData(0,0,w,h).data,w,h,anchors,log);
  }
  return {analyzeRGBA,supplementImage,validPanel};
})();
