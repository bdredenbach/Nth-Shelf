/* Nth Shelf — Frame Test 7: shared-ink-rail montages with foreground crossings.
 * This is an add-only, bounded recovery route, not a replacement detector.
 * Four exterior-matte edges must enclose a legacy composite. Independently
 * fitted, thin ink rails partition it before a balloon or protruding object
 * may change ownership. Unknown interruptions reject the entire candidate.
 * Pixel ownership is serialized as even-odd contours: a claw can surround a
 * visible island of its neighbour without taking that island into its crop.
 * No page index, title, filename, image hash, or saved crop dispatch is used.
 */
const PanelCompositeFrames = (() => {
  'use strict';
  const METHOD = 'matte-bounded-shared-rail-foreground';
  const finite = Number.isFinite;
  const area = q => Math.abs(q.reduce((s,p,i)=>{const b=q[(i+1)%q.length];return s+p[0]*b[1]-p[1]*b[0];},0))/2;
  const signedArea = q => q.reduce((s,p,i)=>{const b=q[(i+1)%q.length];return s+p[0]*b[1]-p[1]*b[0];},0)/2;
  const bounds = q => [Math.min(...q.map(p=>p[0])),Math.min(...q.map(p=>p[1])),Math.max(...q.map(p=>p[0])),Math.max(...q.map(p=>p[1]))];
  const within = (v,a,b) => finite(v)&&v>=a&&v<=b;
  const pointIn = (x,y,q) => {
    let hit=false;for(let i=0,j=q.length-1;i<q.length;j=i++){
      const a=q[i],b=q[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])hit=!hit;
    }return hit;
  };
  function regress(points) {
    if(points.length<20)return null;
    let x=0,y=0,xx=0,xy=0;for(const [a,b] of points){x+=a;y+=b;xx+=a*a;xy+=a*b;}
    const n=points.length,d=n*xx-x*x;if(d<=0)return null;
    const m=(n*xy-x*y)/d,b=(y-m*x)/n;
    const errors=points.map(p=>Math.abs(p[1]-m*p[0]-b)).sort((a,b)=>a-b);
    return finite(m)&&finite(b)?{m,b,residual:errors[Math.floor(errors.length*.9)],samples:n}:null;
  }
  function components(mask,w,h,min=1) {
    const seen=new Uint8Array(mask.length),queue=new Int32Array(mask.length),out=[];
    for(let seed=0;seed<mask.length;seed++){
      if(!mask[seed]||seen[seed])continue;
      let tail=1,head=0;queue[0]=seed;seen[seed]=1;
      let l=seed%w,r=l,t=seed/w|0,b=t;
      while(head<tail){const i=queue[head++],x=i%w,y=i/w|0;
        l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);
        const offer=j=>{if(!seen[j]&&mask[j]){seen[j]=1;queue[tail++]=j;}};
        if(x)offer(i-1);if(x+1<w)offer(i+1);if(y)offer(i-w);if(y+1<h)offer(i+w);
      }
      if(tail>=min)out.push({pixels:Array.from(queue.subarray(0,tail)),box:[l,t,r,b]});
      if(out.length>2000)return [];
    }return out;
  }
  // Fill ink/text holes, never a bounding rectangle or a convex hull.
  function filled(component,w,h) {
    const [l,t,r,b]=component.box,W=r-l+3,H=b-t+3;
    const mask=new Uint8Array(W*H),seen=new Uint8Array(W*H),q=new Int32Array(W*H);
    for(const i of component.pixels)mask[((i/w|0)-t+1)*W+i%w-l+1]=1;
    let head=0,tail=1;q[0]=0;seen[0]=1;
    while(head<tail){const i=q[head++],x=i%W,y=i/W|0;
      const offer=j=>{if(!seen[j]&&!mask[j]){seen[j]=1;q[tail++]=j;}};
      if(x)offer(i-1);if(x+1<W)offer(i+1);if(y)offer(i-W);if(y+1<H)offer(i+W);
    }
    const out=new Uint8Array(w*h);
    for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++)if(!seen[y*W+x])out[(t+y-1)*w+l+x-1]=1;
    return out;
  }
  function morph(mask,w,h,radius,dilate) {
    const out=new Uint8Array(mask.length),offsets=[];
    for(let y=-radius;y<=radius;y++)for(let x=-radius;x<=radius;x++)if(x*x+y*y<=radius*radius+radius*.5)offsets.push([x,y]);
    for(let y=radius;y<h-radius;y++)for(let x=radius;x<w-radius;x++){
      if(!dilate&&!mask[y*w+x])continue;
      let yes=!dilate;
      for(const [dx,dy]of offsets){const v=!!mask[(y+dy)*w+x+dx];if(dilate?v:!v){yes=dilate;break;}}
      out[y*w+x]=Number(yes);
    }return out;
  }
  function quietMatte(rgba,w,h) {
    const pixels=[];for(let x=0;x<w;x+=3)for(const y of [0,h-1])pixels.push([rgba[(y*w+x)*4],rgba[(y*w+x)*4+1],rgba[(y*w+x)*4+2]]);
    for(let y=0;y<h;y+=3)for(const x of [0,w-1])pixels.push([rgba[(y*w+x)*4],rgba[(y*w+x)*4+1],rgba[(y*w+x)*4+2]]);
    const rgb=[0,1,2].map(c=>pixels.map(p=>p[c]).sort((a,b)=>a-b)[pixels.length>>1]);
    if(rgb[0]*.299+rgb[1]*.587+rgb[2]*.114>25||pixels.filter(p=>p.every((v,c)=>Math.abs(v-rgb[c])<=6)).length/pixels.length<.97)return null;
    const bg=new Uint8Array(w*h),queue=new Int32Array(w*h);let head=0,tail=0;
    function offer(i){if(bg[i]||[0,1,2].some(c=>Math.abs(rgba[i*4+c]-rgb[c])>5))return;bg[i]=1;queue[tail++]=i;}
    for(let x=0;x<w;x++){offer(x);offer((h-1)*w+x);}for(let y=0;y<h;y++){offer(y*w);offer(y*w+w-1);}
    while(head<tail){const i=queue[head++],x=i%w,y=i/w|0;if(x)offer(i-1);if(x+1<w)offer(i+1);if(y)offer(i-w);if(y+1<h)offer(i+w);}
    return tail>=w*h*.025?{bg,rgb}:null;
  }
  function eligible(p) {
    return p&&!p._quad&&!p._outline&&!p._contours&&!p._identitySource&&
      ['x','y','w','h'].every(k=>finite(p[k]))&&p.x>=0&&p.y>=0&&p.x+p.w<=1&&p.y+p.h<=1&&
      p.w>.72&&p.h>.35&&p.h<.72&&p.w*p.h>.30&&p.w*p.h<.68;
  }
  function recover(rgba,w,h,parent,quiet,log) {
    const N=w*h,g=new Float32Array(N),sat=new Float32Array(N),mx=new Uint8Array(N),mn=new Uint8Array(N);
    for(let i=0;i<N;i++){const r=rgba[i*4],a=rgba[i*4+1],b=rgba[i*4+2];g[i]=.299*r+.587*a+.114*b;mx[i]=Math.max(r,a,b);mn[i]=Math.min(r,a,b);sat[i]=(mx[i]-mn[i])/Math.max(1,mx[i]);}
    const at=(v,p,t)=>p>=0&&p<(v?w:h)&&t>=0&&t<(v?h:w)?g[v?t*w+p:p*w+t]:255;
    const baseBox=[parent.x*w,parent.y*h,(parent.x+parent.w)*w,(parent.y+parent.h)*h];
    const bg=(x,y)=>x>=0&&x<w&&y>=0&&y<h?quiet.bg[(y|0)*w+(x|0)]:0;
    // Fit all four true exterior transitions near the existing bucket. The
    // legacy rectangle is a search window, never evidence of a printed edge.
    const outer=[];
    for(let side=0;side<4;side++){
      const v=side%2===0,dir=side<2?1:-1,pos=baseBox[side],lo=v?baseBox[1]:baseBox[0],hi=v?baseBox[3]:baseBox[2],samples=[];
      for(let t=Math.ceil(lo)+5;t<hi-4;t++){
        for(let d=-5;d<=5;d++){
          const p=Math.round(pos)+dir*d,x=v?p:t,y=v?t:p;
          if(!bg(x,y)&&bg(x-(v?dir:0),y-(v?0:dir))){samples.push([t,p-dir*.5]);break;}
        }
      }
      if(samples.length/(hi-lo)<.72){log?.('outer samples '+side);return [];}
      let best=[];
      for(let si=-4;si<=4;si++){const m=si*.005,bins=new Map();for(const [t,p]of samples){const b=Math.round(p-m*t);bins.set(b,(bins.get(b)||0)+1);}for(const [b,count]of bins){if(count<samples.length*.10)continue;const near=samples.filter(p=>Math.abs(p[1]-m*p[0]-b)<=1.4);if(near.length>best.length)best=near;}}
      const f=regress(best);if(!f||best.length/(hi-lo)<.70||Math.abs(f.m)>.02||f.residual>1.2){log?.('outer fit '+side);return [];}
      let support=0,total=0;
      for(let t=Math.ceil(lo)+5;t<hi-4;t++){const p=Math.round(f.m*t+f.b);let n=0;for(let d=2;d<=4;d++)n+=bg(v?p-dir*d:t,v?t:p-dir*d);support+=n>=2;total++;}
      if(support/total<.97){log?.('outer support '+side+' '+support/total);return [];}
      outer.push({...f,support:support/total});
    }
    const meet=(h,v)=>{const x=(v.b+v.m*h.b)/(1-v.m*h.m);return [x,h.m*x+h.b];};
    const root=[meet(outer[1],outer[0]),meet(outer[1],outer[2]),meet(outer[3],outer[2]),meet(outer[3],outer[0])];
    if(root.some(p=>p[0]<2||p[1]<2||p[0]>w-3||p[1]>h-3)||area(root)<w*h*.30)return [];
    const rails=[],leaves=[];let overflow=false;
    function find(q,vertical) {
      const [x1,y1,x2,y2]=bounds(q),lo=vertical?y1:x1,hi=vertical?y2:x2,a=vertical?x1:y1,b=vertical?x2:y2;
      if(b-a<65||hi-lo<75)return [];
      const start=Math.ceil(lo)+4,end=Math.floor(hi)-3,center=(lo+hi)/2,count=end-start,candidates=[];
      for(let si=-3;si<=3;si++)for(let pos=Math.ceil(a+25);pos<b-24;pos++){
        const m=si*.005,points=[],missing=[];let dark=0,ridge=0,first=0,last=0,rawError=0;
        for(let t=start;t<end;t++){
          const p=Math.round(pos+m*(t-center));let v=255,pick=p;
          for(let d=-1;d<=1;d++){const v0=at(vertical,p+d,t);if(v0<v){v=v0;pick=p+d;}}
          const good=v<45;dark+=good;if(t<start+16)first+=good;if(t>=end-16)last+=good;
          if(!good)missing.push(t);
          if(v<28){points.push([t,pick]);rawError+=Math.abs(pick-pos-m*(t-center));}
          // Most wrong lines can be rejected before expensive fitting.
          if(t===start+15&&first<15)break;
          let before=0,after=0;for(let d=3;d<=5;d++){before+=at(vertical,pick-d,t);after+=at(vertical,pick+d,t);}
          ridge+=before/3-v>15&&after/3-v>15;
        }
        if(dark/count<.84||first<15||last<15||ridge/count<.42||points.length/count<.75)continue;
        const f=regress(points);if(!f||Math.abs(f.m)>.02||f.residual>1.05)continue;
        const one=regress(points.filter(p=>p[0]<center)),two=regress(points.filter(p=>p[0]>=center));
        if(!one||!two||Math.abs(one.m-two.m)>.015||Math.abs(one.m*center+one.b-two.m*center-two.b)>1.6)continue;
        const score=dark/count+ridge/count*.35-rawError/points.length*.12;
        candidates.push({vertical,...f,coverage:dark/count,ridge:ridge/count,missing,score,pos,sourceBox:[x1,y1,x2,y2],independentFits:[one,two]});
      }
      candidates.sort((a,b)=>b.score-a.score);const out=[];
      for(const c of candidates)if(!out.some(p=>Math.abs(p.pos-c.pos)<5))out.push(c);
      return out;
    }
    function cut(q,r) {
      const out=[[],[]],value=p=>r.vertical?p[0]-r.m*p[1]-r.b:p[1]-r.m*p[0]-r.b;
      for(let s=0;s<2;s++)for(let i=0;i<q.length;i++){
        const a=q[i],b=q[(i+1)%q.length],u=value(a),v=value(b),inside=s?u>=0:u<=0;
        if(inside)out[s].push(a.slice());
        if((u>0)!==(v>0)){const t=u/(u-v);out[s].push([a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1])]);}
      }
      if(!out.every(a=>a.length===4&&area(a)>w*h*.020))return null;
      return out.map(q=>{let first=0;for(let i=1;i<4;i++)if(q[i][0]+q[i][1]<q[first][0]+q[first][1])first=i;return q.slice(first).concat(q.slice(0,first));});
    }
    function partition(q,depth=0) {
      if(depth>5||rails.length>8){overflow=true;return;}
      const cs=find(q,true).concat(find(q,false)).sort((a,b)=>b.score-a.score);
      if(!cs.length){leaves.push(q);return;}
      const r=cs[0],children=cut(q,r);if(!children){overflow=true;return;}
      rails.push(r);partition(children[0],depth+1);partition(children[1],depth+1);
    }
    partition(root);
    // Bounded initial rollout: nested shared-rail montages, not arbitrary
    // photographs or a new general page-partition acceptance threshold.
    if(overflow||leaves.length!==5||rails.length!==4||rails.filter(r=>r.missing.length>=4).length<2||
       rails.filter(r=>r.vertical).length<2||rails.filter(r=>!r.vertical).length<1){log?.('topology '+leaves.length+' leaves');return [];}
    // Test an inscribed interior rectangle, not the bounding box of a sloping
    // frame (which includes part of its own outer rail). Existing divider and
    // local inset rejection thresholds themselves are unchanged.
    const veto=typeof PanelClosedFrames!=='undefined'?PanelClosedFrames.analyzeRGBA(rgba,w,h,null,{gradientOnly:true,darkMatte:true,localMatteInset:true,vetoCandidates:leaves.map(q=>({box:[Math.ceil(Math.max(q[0][0],q[3][0]))+2,Math.ceil(Math.max(q[0][1],q[1][1]))+2,Math.floor(Math.min(q[1][0],q[2][0]))-2,Math.floor(Math.min(q[2][1],q[3][1]))-2]}))}):[];
    if(veto.length!==leaves.length){log?.('divider/inset veto: '+veto.length+'/'+leaves.length+' cells retained');return [];}
    const original=new Uint8Array(N),labels=new Uint8Array(N);
    for(let id=0;id<leaves.length;id++){const box=bounds(leaves[id]);for(let y=Math.max(0,Math.floor(box[1]));y<Math.min(h,Math.ceil(box[3]));y++)for(let x=Math.max(0,Math.floor(box[0]));x<Math.min(w,Math.ceil(box[2]));x++)if(pointIn(x+.5,y+.5,leaves[id]))original[y*w+x]=id+1;}
    labels.set(original);
    const explained=new Uint8Array(N),changes=[],white=new Uint8Array(N);
    for(let i=0;i<N;i++)white[i]=original[i]&&mn[i]>205&&mx[i]-mn[i]<35?1:0;
    function vote(pixels) {const votes=Array(6).fill(0);for(const i of pixels)votes[original[i]]++;let owner=1;for(let j=2;j<votes.length;j++)if(votes[j]>votes[owner])owner=j;return {owner,fraction:votes[owner]/pixels.length,votes};}
    function paint(owned) {
      const expanded=new Uint8Array(owned);
      // A one-grid-pixel fringe retains the dark outline around light art.
      // Multi-source expansion never overwrites another measured core.
      for(let i=0;i<N;i++)if(owned[i]){const x=i%w,y=i/w|0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
        if(x+dx<0||x+dx>=w||y+dy<0||y+dy>=h)continue;const j=i+dy*w+dx;
        if(original[j]&&!expanded[j])expanded[j]=owned[i];
      }}
      for(let i=0;i<N;i++)if(expanded[i]&&original[i]){labels[i]=expanded[i];explained[i]=1;}
    }
    function hasText(mask,box) {
      const [l,t,r,b]=box;let count=0,dark=0,rows=0;
      for(let y=t;y<=b;y++){let runs=0;for(let x=l;x<=r;x++){const i=y*w+x;if(!mask[i])continue;count++;dark+=g[i]<70;
        if(g[i]<70&&x>l&&mask[i-1]&&g[i-1]>=150){let k=x;while(k<=r&&mask[y*w+k]&&g[y*w+k]<70)k++;if(k-x<=12&&k<=r&&mask[y*w+k]&&g[y*w+k]>150)runs++;}
      }if(runs>=3)rows++;}
      return count>=140&&dark/count>=.03&&dark/count<=.38&&rows>=3;
    }
    // Split narrow connecting tails into text-bearing balloon lobes before
    // assigning ownership. A compound speech balloon is not a single panel.
    for(const component of components(white,w,h,120)) {
      const mask=filled(component,w,h),pixels=[];for(let i=0;i<N;i++)if(mask[i])pixels.push(i);
      const owners=new Set(pixels.map(i=>original[i]));owners.delete(0);
      if(owners.size<2||pixels.length>N*.12||!hasText(mask,component.box))continue;
      const opened=morph(morph(mask,w,h,5,false),w,h,5,true);
      const cores=components(opened,w,h,80);if(!cores.length||cores.length>4)continue;
      const votes=cores.map(c=>vote(c.pixels));if(votes.some(v=>v.fraction<.80))continue;
      const owned=new Uint8Array(N),queue=new Int32Array(N);let tail=0,head=0;
      for(let k=0;k<cores.length;k++)for(const i of cores[k].pixels){owned[i]=votes[k].owner;queue[tail++]=i;}
      while(head<tail){const i=queue[head++],x=i%w,y=i/w|0;const offer=j=>{if(mask[j]&&!owned[j]){owned[j]=owned[i];queue[tail++]=j;}};
        if(x)offer(i-1);if(x+1<w)offer(i+1);if(y)offer(i-w);if(y+1<h)offer(i+w);
      }
      if(pixels.some(i=>!owned[i]))continue;
      paint(owned);changes.push({kind:'text-bearing-lobes',box:component.box,lobes:votes.map((v,i)=>({owner:v.owner,corePixels:cores[i].pixels.length,ownerFraction:v.fraction})),pixels:pixels.length});
    }
    // An object may cross the same divider more than once. Work within the
    // adjacent leaf pair, and keep ALL its crossings as one object proof.
    const processed=new Set();
    for(const rail of rails)for(const t of rail.missing) {
      const p=Math.round(rail.m*t+rail.b),x=rail.vertical?p:t,y=rail.vertical?t:p,i=y*w+x;
      if(i<0||i>=N||explained[i]||!original[i])continue;
      const nx=rail.vertical?1:0,ny=rail.vertical?0:1;
      const a=original[(y-ny*4)*w+x-nx*4],b=original[(y+ny*4)*w+x+nx*4];
      if(!a||!b||a===b)continue;
      const key=[a,b].sort().join(':');if(processed.has(key))continue;processed.add(key);
      const boxA=bounds(leaves[a-1]),boxB=bounds(leaves[b-1]);
      const box=rail.vertical?[Math.min(boxA[0],boxB[0]),Math.max(boxA[1],boxB[1])+2,Math.max(boxA[2],boxB[2]),Math.min(boxA[3],boxB[3])-2]:
        [Math.max(boxA[0],boxB[0])+2,Math.min(boxA[1],boxB[1]),Math.min(boxA[2],boxB[2])-2,Math.max(boxA[3],boxB[3])];
      // This route is deliberately limited to a low-chroma foreground over
      // a strongly chromatic backdrop. A white or neutral backdrop rejects.
      if(sat[i]>.32||g[i]<=40)continue;
      let chromatic=0,bright=0;
      for(let yy=Math.ceil(box[1]);yy<box[3];yy++)for(let xx=Math.ceil(box[0]);xx<box[2];xx++){
        const k=yy*w+xx;if(g[k]>45){bright++;chromatic+=sat[k]>.45;}
      }
      if(!bright||chromatic/bright<.25)continue;
      let mask=new Uint8Array(N);
      for(let yy=Math.ceil(box[1]);yy<box[3];yy++)for(let xx=Math.ceil(box[0]);xx<box[2];xx++){
        const k=yy*w+xx;if((original[k]===a||original[k]===b)&&g[k]>40&&sat[k]<.32&&!explained[k])mask[k]=1;
      }
      mask=morph(morph(mask,w,h,1,true),w,h,1,false);
      const candidates=components(mask,w,h,200).filter(c=>c.pixels.includes(i));
      if(candidates.length!==1)continue;
      const comp=candidates[0],full=filled(comp,w,h),pixels=[];
      for(let k=0;k<N;k++)if(full[k]&&(original[k]===a||original[k]===b))pixels.push(k);
      const v=vote(pixels),other=v.owner===a?b:a;
      if(![a,b].includes(v.owner)||v.fraction<.80||v.votes[other]<60||pixels.length>N*.10)continue;
      const owned=new Uint8Array(N);for(const k of pixels)owned[k]=v.owner;
      paint(owned);changes.push({kind:'chromatic-backdrop-object',box:comp.box,owner:v.owner,ownerFraction:v.fraction,pixels:pixels.length,foreignSidePixels:v.votes[other],backdropFraction:chromatic/bright});
    }
    // Every light interruption must now have a measured owner. Do not infer
    // an invisible line through unclassified artwork or a missing frame edge.
    for(const r of rails){let covered=0;for(const t of r.missing){const p=Math.round(r.m*t+r.b),x=r.vertical?p:t,y=r.vertical?t:p;
      let good=false;for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)if(x+dx>=0&&x+dx<w&&y+dy>=0&&y+dy<h&&explained[(y+dy)*w+x+dx])good=true;covered+=good;
    }if(r.missing.length&&covered/r.missing.length<.98){log?.('unexplained interruption '+covered+'/'+r.missing.length);return [];}}
    if(changes.filter(c=>c.kind==='text-bearing-lobes').length<1||changes.filter(c=>c.kind==='chromatic-backdrop-object').length<1)return [];
    const out=[];
    for(let id=1;id<=leaves.length;id++){
      const contours=trace(labels,w,h,id);if(!contours||!contours.length)return [];
      const all=contours.flat(),box=bounds(all),pixels=labels.reduce((n,v)=>n+(v===id),0);
      if(pixels<N*.020||pixels>N*.35||Math.abs(contours.reduce((a,q)=>a+signedArea(q),0)-pixels)>1e-6)return [];
      const normalized=contours.map(q=>q.map(p=>({x:p[0]/w,y:p[1]/h})));
      const proof={version:1,connected:true,method:METHOD,analysisWidth:w,analysisHeight:h,index:id-1,leafCount:5,
        parent:{x:parent.x,y:parent.y,w:parent.w,h:parent.h},color:quiet.rgb,outer,
        rails:rails.map(r=>({vertical:r.vertical,m:r.m,b:r.b,residual:r.residual,coverage:r.coverage,ridge:r.ridge,samples:r.samples,missingSamples:r.missing.length,independentFits:r.independentFits})),
        changes,pixelCount:pixels,contourCount:contours.length,contourArea:pixels,ownershipRasterMismatches:0};
      const p={x:box[0]/w,y:box[1]/h,w:(box[2]-box[0])/w,h:(box[3]-box[1])/h,_contours:normalized,
        _identitySource:'composite-frame',_geometryOwner:'composite-outline',_geometryType:'shared-rail-foreground-contours',_compositeFrameProof:proof};
      if(!validPanel(p)||!rasterMatches(contours,labels,w,h,id))return [];
      out.push(p);
    }
    log?.('hybrid shared-rail montage: 5 complete visible owners; '+changes.length+' foreground components');
    return out;
  }
  // Directed pixel-edge tracing retains holes AND disconnected visible islands.
  // At a diagonal touch, follow the rightmost outgoing edge so that rings do
  // not splice unrelated components into a self-intersecting polygon.
  function trace(labels,w,h,id) {
    const stride=w+1,edges=[],next=new Map();
    const add=(x1,y1,x2,y2,dir)=>{const a=y1*stride+x1,b=y2*stride+x2,index=edges.length;edges.push({a,b,dir});if(!next.has(a))next.set(a,[]);next.get(a).push(index);};
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){const k=y*w+x;if(labels[k]!==id)continue;
      if(!y||labels[k-w]!==id)add(x,y,x+1,y,0);
      if(x+1===w||labels[k+1]!==id)add(x+1,y,x+1,y+1,1);
      if(y+1===h||labels[k+w]!==id)add(x+1,y+1,x,y+1,2);
      if(!x||labels[k-1]!==id)add(x,y+1,x,y,3);
    }
    if(edges.length>16000)return null;
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
      if(q.length<4||q.length>2048||!area(q))return null;rings.push(q);
      if(rings.length>12)return null;
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
  // Persisted/cached geometry may be incomplete or malformed. Validation
  // must fail closed without throwing in hit testing or the crop renderer.
  function validPanel(panel) {
    try { return validatePanel(panel); } catch (_) { return false; }
  }
  function validatePanel(panel) {
    const p=panel?._compositeFrameProof,rings=panel?._contours,W=p?.analysisWidth,H=p?.analysisHeight;
    if(panel?._identitySource!=='composite-frame'||p?.version!==1||p.connected!==true||p.method!==METHOD||
       !Number.isInteger(W)||!Number.isInteger(H)||W<100||H<160||W>900||H>900||
       p.leafCount!==5||!Number.isInteger(p.index)||p.index<0||p.index>=5||p.ownershipRasterMismatches!==0||
       !Array.isArray(rings)||!rings.length||rings.length>12||p.contourCount!==rings.length||
       rings.some(q=>!Array.isArray(q)||q.length<4||q.length>2048||q.some(v=>!within(v?.x,0,1)||!within(v?.y,0,1)))||
       !Array.isArray(p.color)||p.color.length!==3||p.color.some(v=>!Number.isInteger(v)||!within(v,0,255))||
       p.color[0]*.299+p.color[1]*.587+p.color[2]*.114>25||!eligible(p.parent)||
       !Array.isArray(p.outer)||p.outer.length!==4||p.outer.some(f=>!within(f?.m,-.02,.02)||!finite(f.b)||!within(f.residual,0,1.2)||!within(f.support,.97,1))||
       !Array.isArray(p.rails)||p.rails.length!==4||p.rails.some(f=>typeof f.vertical!=='boolean'||!within(f.m,-.02,.02)||!finite(f.b)||
        !within(f.coverage,.84,1)||!within(f.ridge,.42,1)||!within(f.residual,0,1.05)||!Number.isInteger(f.missingSamples)||f.missingSamples<0||
        !Array.isArray(f.independentFits)||f.independentFits.length!==2||f.independentFits.some(r=>!finite(r?.m)||!finite(r?.b))))return false;
    if(p.rails.some(f=>Math.abs(f.independentFits[0].m-f.independentFits[1].m)>.015||f.independentFits.some(r=>!within(r.residual,0,2)||!Number.isInteger(r.samples)||r.samples<20)))return false;
    if(!Array.isArray(p.changes)||p.changes.length<2||p.changes.length>16||
       !p.changes.some(c=>c.kind==='text-bearing-lobes')||!p.changes.some(c=>c.kind==='chromatic-backdrop-object')||
       p.changes.some(c=>!Number.isInteger(c.pixels)||c.pixels<=0||!Array.isArray(c.box)||c.box.length!==4||c.box.some(v=>!Number.isInteger(v))||
         (c.kind==='text-bearing-lobes'?(!Array.isArray(c.lobes)||!c.lobes.length||c.lobes.length>4||c.lobes.some(l=>!Number.isInteger(l.owner)||!within(l.owner,1,5)||!within(l.ownerFraction,.80,1)||!Number.isInteger(l.corePixels)||l.corePixels<80)):
          c.kind==='chromatic-backdrop-object'?(!Number.isInteger(c.owner)||!within(c.owner,1,5)||!within(c.ownerFraction,.80,1)||!within(c.backdropFraction,.25,1)||!Number.isInteger(c.foreignSidePixels)||c.foreignSidePixels<60):true)))return false;
    if(!Number.isInteger(p.pixelCount)||p.pixelCount<W*H*.020||p.pixelCount>W*H*.35||p.contourArea!==p.pixelCount)return false;
    const all=rings.flat(),xs=all.map(v=>v.x),ys=all.map(v=>v.y),box=[Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)];
    if(['x','y','w','h'].some(k=>!finite(panel[k]))||Math.max(Math.abs(panel.x-box[0]),Math.abs(panel.y-box[1]),Math.abs(panel.w-box[2]+box[0]),Math.abs(panel.h-box[3]+box[1]))>1e-8)return false;
    let sum=0;
    for(const q of rings){for(let i=0;i<q.length;i++){
      const a=q[i],b=q[(i+1)%q.length];if(Math.hypot(a.x-b.x,a.y-b.y)<1e-9||(Math.abs(a.x-b.x)>1e-10&&Math.abs(a.y-b.y)>1e-10))return false;
      // All serialized contour points come from the measured integer grid.
      if(Math.abs(a.x*W-Math.round(a.x*W))>1e-7||Math.abs(a.y*H-Math.round(a.y*H))>1e-7)return false;
      sum+=(a.x*b.y-a.y*b.x)*W*H/2;
    }}
    return Math.abs(sum-p.pixelCount)<1e-5&&box[0]>=p.parent.x-4/W&&box[1]>=p.parent.y-4/H&&box[2]<=p.parent.x+p.parent.w+4/W&&box[3]<=p.parent.y+p.parent.h+4/H;
  }
  function analyzeRGBA(rgba,w,h,parents,log) {
    if(!Number.isInteger(w)||!Number.isInteger(h)||w<100||h<160||w>900||h>900||!rgba||rgba.length!==w*h*4||
       !Array.isArray(parents)||parents.length>12)return [];
    for(let i=3;i<rgba.length;i+=4)if(rgba[i]!==255)return [];
    const candidates=parents.filter(eligible);if(!candidates.length)return [];
    if(candidates.some((a,i)=>candidates.some((b,j)=>i<j&&Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y))>1e-6)))return [];
    const quiet=quietMatte(rgba,w,h);if(!quiet)return [];
    const out=[];for(const parent of candidates){const result=recover(rgba,w,h,parent,quiet,log);if(result.length===5)out.push(...result);}
    return out;
  }
  function refineImage(img,identities,baseline,log) {
    if(!Array.isArray(identities)||!Array.isArray(baseline)||baseline.length<2||baseline.length>12)return identities;
    const overlap=(a,b)=>Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y));
    const parents=baseline.filter(p=>eligible(p)&&!identities.some(other=>other!==p&&overlap(p,other)>1e-5));
    if(!parents.length)return identities;
    const scale=Math.min(1,900/Math.max(img.width,img.height)),w=Math.round(img.width*scale),h=Math.round(img.height*scale),canvas=document.createElement('canvas');
    canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,w,h);
    const additions=analyzeRGBA(ctx.getImageData(0,0,w,h).data,w,h,parents,log);
    if(!additions.length)return identities;
    // An entire proved group is atomic. A partial/duplicated group cannot
    // acquire priority over a legacy parent or any accepted neighbour.
    for(let i=0;i<additions.length;i+=5){const group=additions.slice(i,i+5),parent=group[0]?._compositeFrameProof?.parent;
      if(group.length!==5||group.some((p,j)=>!validPanel(p)||p._compositeFrameProof.index!==j||JSON.stringify(p._compositeFrameProof.parent)!==JSON.stringify(parent)))return identities;
    }
    return additions.concat(identities);
  }
  return {analyzeRGBA,refineImage,validPanel};
})();
