/* Complete dark frames, independently proved before selecting a tap owner.
 * Acceptance requires four connected ridges; weaker interior evidence only vetoes.
 */
const PanelClosedFrames = (() => {
  'use strict';
  function lines(g,w,h,vertical=false,minimum=.14){
    const length=vertical?h:w, count=vertical?w:h, min=Math.max(30,Math.floor(length*minimum));
    const at=(p,t)=>vertical?g[t*w+p]:g[p*w+t];
    const groups=[];let active=[];
    for(let p=0;p<count;p++){
      const next=[];
      for(let t=0;t<length;t++){
        const dark=q=>at(q,t)<70;
        if(!dark(p)&&!(p&&dark(p-1))&&!(p+1<count&&dark(p+1)))continue;
        const lo=t;
        while(++t<length&&(at(p,t)<70||(p&&at(p-1,t)<70)||(p+1<count&&at(p+1,t)<70))){}
        const hi=t;if(hi-lo<min)continue;
        let best=-1,score=Infinity;
        for(const k of active){const last=groups[k][groups[k].length-1],a=Math.abs(last[1]-lo),b=Math.abs(last[2]-hi);if(a<12&&b<12&&a+b<score){best=k;score=a+b;}}
        if(best<0){best=groups.length;groups.push([]);}groups[best].push([p,lo,hi]);next.push(best);
      }active=next;
    }
    const found=[];
    for(const group of groups){if(group.length>30)continue;let best=null,score=0;
      for(const line of group){let n=0;for(let t=line[1];t<line[2];t++)n+=at(line[0],t)<70;n/=(line[2]-line[1]);if(n>score){best=line;score=n;}}
      if(score>=.6)found.push([...best,score,group.length]);
    }
    found.sort((a,b)=>(b[2]-b[1])-(a[2]-a[1]));const merged=[];
    for(const v of found){if(merged.some(q=>Math.abs(v[0]-q[0])<5&&Math.min(v[2],q[2])-Math.max(v[1],q[1])>.85*Math.min(v[2]-v[1],q[2]-q[1])))continue;merged.push(v);if(merged.length>=250)break;}
    return merged.sort((a,b)=>a[0]-b[0]);
  }
  function analyzeRGBA(rgba,w,h,log,options={}){
    if(!Number.isInteger(w)||!Number.isInteger(h)||w<80||h<80||w>900||h>900||!rgba||rgba.length!==w*h*4)return [];
    // Reject non-matte pages before paying for a second structural pass.
    const matteProposals=options.darkMatte===true&&!options.vetoCandidates&&typeof PanelGutterFrames!=='undefined'
      ? (options.componentMatte===true ? PanelGutterFrames.componentProposalsRGBA(rgba,w,h,{shortPanels:options.shortPanels===true}) : PanelGutterFrames.proposeRGBA(rgba,w,h,{gradient:true,darkMatte:true})):null;
    if(options.darkMatte===true&&!options.vetoCandidates&&(!matteProposals||!matteProposals.length))return [];
    const g=new Float32Array(w*h);for(let i=0;i<g.length;i++)g[i]=.299*rgba[i*4]+.587*rgba[i*4+1]+.114*rgba[i*4+2];
    const hs=lines(g,w,h),vs=lines(g,w,h,true),at=(vertical,p,t)=>vertical?g[t*w+p]:g[p*w+t];
    function cover(vertical,pos,lo,hi){let n=0;for(let t=lo;t<hi;t++){let yes=false;for(let d=-2;d<=2;d++)if(pos+d>=0&&pos+d<(vertical?w:h)&&at(vertical,pos+d,t)<70){yes=true;break;}n+=yes;}return n/Math.max(1,hi-lo);}
    function ridge(vertical,pos,lo,hi){const margin=Math.max(2,Math.floor((hi-lo)*.02));lo+=margin;hi-=margin;if(hi<=lo||pos<8||pos+9>=(vertical?w:h))return 0;let n=0;
      for(let t=lo;t<hi;t++){let mid=255,before=0,after=0;for(let d=-2;d<=2;d++)mid=Math.min(mid,at(vertical,pos+d,t));for(let d=-8;d<-3;d++)before+=at(vertical,pos+d,t);for(let d=3;d<9;d++)after+=at(vertical,pos+d,t);n+=before/5-mid>25&&after/6-mid>25;}return n/(hi-lo);}
    function fit(vertical,pos,lo,hi,allowCore=false,core=false){
      if(core){let sum=0,square=0,n=0;for(let t=lo;t<hi;t++){let ink=255;for(let d=-2;d<=2;d++)ink=Math.min(ink,at(vertical,pos+d,t));sum+=ink;square+=ink*ink;n++;}const mean=sum/n,std=Math.sqrt(Math.max(0,square/n-mean*mean));if(mean>=15||std>=8)return null;}
      const samples=[];const trim=Math.max(3,Math.round((hi-lo)*.02));
      for(let t=lo+trim;t<hi-trim;t++){
        let pick=-1,best=Infinity;for(let p=pos-2;p<=pos+2;p++)if(p>=8&&p+9<(vertical?w:h)){const v=at(vertical,p,t);if(v<best){best=v;pick=p;}}
        if(pick<0||best>=70)continue;const threshold=core?best+8:70;if(core&&threshold>=30)continue;let a=pick,b=pick;while(a>pick-7&&at(vertical,a-1,t)<threshold)a--;while(b<pick+7&&at(vertical,b+1,t)<threshold)b++;
        if(b-a>8||a<=pick-7||b>=pick+7||a<4||b+4>=(vertical?w:h))continue;
        let pre=0,post=0;for(let d=2;d<=4;d++){pre+=at(vertical,a-d,t);post+=at(vertical,b+d,t);}if(Math.min(pre/3-best,post/3-best)<=25)continue;
        samples.push([t,(a+b)/2]);
      }
      if(samples.length/(hi-lo)<.35){if(log)log(`closed fit sparse ${vertical} ${pos} ${lo}:${hi} ${samples.length/(hi-lo)}`);return !allowCore||core?null:fit(vertical,pos,lo,hi,true,true);}
      let sx=0,sy=0;for(const p of samples){sx+=p[0];sy+=p[1];}sx/=samples.length;sy/=samples.length;let cov=0,variance=0;for(const p of samples){cov+=(p[0]-sx)*(p[1]-sy);variance+=(p[0]-sx)**2;}const slope=cov/variance,offset=sy-slope*sx;
      if(!Number.isFinite(slope)||Math.abs(slope)>.015)return null;const errors=samples.map(p=>Math.abs(p[1]-offset-slope*p[0])).sort((a,b)=>a-b);if(errors[Math.floor(errors.length*.9)]>2){if(log)log(`closed fit residual ${vertical} ${pos} ${lo}:${hi} ${errors[Math.floor(errors.length*.9)]}`);return null;}
      if(Math.max(Math.abs(offset+slope*lo-pos),Math.abs(offset+slope*hi-pos))>3)return null;
      let darkness=0;for(let t=lo;t<hi;t++){const p=Math.round(offset+slope*t);darkness+=Math.min(at(vertical,p-1,t),at(vertical,p,t),at(vertical,p+1,t))<70;}if(darkness/(hi-lo)<.96){if(log)log(`closed fit dark ${vertical} ${pos} ${lo}:${hi} ${darkness/(hi-lo)} slope=${slope}`);return null;}
      return {slope,offset,support:samples.length/(hi-lo),...(core?{inkCore:true}:{})};
    }
    function dividerEnds(vertical,pos,lo,hi,slope=0){
      // A separating line must reach both frame edges as a ridge. A tree or
      // building that merges into a broad ink mass cannot split that scene.
      const center=(lo+hi)/2,span=Math.max(8,Math.min(18,(hi-lo)*.15));
      for(const start of [lo+3,hi-3-span]){let n=0,total=0;
        for(let t=Math.ceil(start);t<start+span;t++){
          const q=Math.round(pos+slope*(t-center));let mid=255,a=0,b=0;
          for(let d=-1;d<=1;d++)mid=Math.min(mid,at(vertical,q+d,t));
          for(let d=4;d<=7;d++){a+=at(vertical,q-d,t);b+=at(vertical,q+d,t);}
          n+=a/4-mid>15&&b/4-mid>15;total++;
        }
        if(n/total<.5)return false;
      }return true;
    }
    // A uniformly dark wall can satisfy a dark-pixel chord at many arbitrary
    // angles. On the opt-in matte route, a sloped-divider veto also needs an
    // observed thin ink rail following that angle, not merely a dark path.
    // This mirrors the existing four-rail fit, but samples around the slope
    // hypothesis rather than around a constant x/y. No established route uses it.
    function fittedMatteDivider(vertical,pos,lo,hi,slope,core=false){
      const center=(lo+hi)/2,trim=Math.max(3,Math.round((hi-lo)*.02)),samples=[];
      const limit=vertical?w:h;
      for(let t=lo+trim;t<hi-trim;t++){
        const expected=pos+slope*(t-center),q=Math.round(expected);
        let pick=-1,best=Infinity;
        for(let p=q-2;p<=q+2;p++)if(p>=12&&p+12<limit){
          const value=at(vertical,p,t);if(value<best){best=value;pick=p;}
        }
        if(pick<0||best>=70)continue;
        const threshold=core?best+8:70;
        if(core&&threshold>=30)continue;
        let a=pick,b=pick;
        while(a>pick-7&&at(vertical,a-1,t)<threshold)a--;
        while(b<pick+7&&at(vertical,b+1,t)<threshold)b++;
        if(b-a>8||a<=pick-7||b>=pick+7)continue;
        let pre=0,post=0;
        for(let d=2;d<=4;d++){pre+=at(vertical,a-d,t);post+=at(vertical,b+d,t);}
        if(Math.min(pre/3-best,post/3-best)<=25)continue;
        samples.push([t,(a+b)/2]);
      }
      const fail=()=>core?false:fittedMatteDivider(vertical,pos,lo,hi,slope,true);
      if(samples.length/(hi-lo)<.35)return fail();
      let sx=0,sy=0;
      for(const p of samples){sx+=p[0];sy+=p[1];}
      sx/=samples.length;sy/=samples.length;
      let cov=0,variance=0;
      for(const p of samples){cov+=(p[0]-sx)*(p[1]-sy);variance+=(p[0]-sx)**2;}
      const m=cov/variance,b=sy-m*sx;
      if(!Number.isFinite(m)||Math.abs(m-slope)>.012)return fail();
      const errors=samples.map(p=>Math.abs(p[1]-b-m*p[0])).sort((a,b)=>a-b);
      if(errors[Math.floor(errors.length*.9)]>2||
         Math.max(...[lo,hi].map(t=>Math.abs(b+m*t-(pos+slope*(t-center)))))>3)return fail();
      let darkness=0;
      for(let t=lo;t<hi;t++){
        const p=Math.round(b+m*t);
        if(p<1||p+1>=limit)return fail();
        darkness+=Math.min(at(vertical,p-1,t),at(vertical,p,t),at(vertical,p+1,t))<70;
      }
      if(darkness/(hi-lo)>=.96)return true;
      // Two separated, collinear ink fragments are enough to veto a union,
      // not enough to create either child. Require measured support near
      // both outside rails; a short interior mark is not a divider.
      const span=(hi-lo)*.18;
      const start=samples.filter(p=>p[0]<lo+span).length/span;
      const end=samples.filter(p=>p[0]>hi-span).length/span;
      if(darkness/(hi-lo)>=.60&&samples.length/(hi-lo)>=.42&&start>=.35&&end>=.35)return true;
      return fail();
    }
    function slopedDivider(box){const [x1,y1,x2,y2]=box;
      for(const vertical of [false,true]){const lo=vertical?y1:x1,hi=vertical?y2:x2,b1=vertical?x1:y1,b2=vertical?x2:y2,margin=Math.max(12,(b2-b1)*.085),center=(lo+hi)/2;
        for(let si=-20;si<=20;si++){if(Math.abs(si)<2&&!options.darkMatte)continue;const slope=si*.005;
          for(let p=Math.ceil(b1+margin);p<b2-margin;p+=2){if(p-Math.abs(slope*(hi-lo)/2)<=b1+margin||p+Math.abs(slope*(hi-lo)/2)>=b2-margin)continue;let dark=0,n=0;for(let t=lo+3;t<hi-2;t++){const q=Math.round(p+slope*(t-center));dark+=at(vertical,q,t)<70;n++;}if(dark/n<=(options.darkMatte?.60:.97))continue;let ridgeCount=0;
            for(let t=lo+3;t<hi-2;t++){const q=Math.round(p+slope*(t-center)),v=at(vertical,q,t);let a=0,b=0;for(let d=4;d<=7;d++){a+=at(vertical,q-d,t);b+=at(vertical,q+d,t);}ridgeCount+=a/4-v>15&&b/4-v>15;}if(ridgeCount/n>.20&&(options.darkMatte?fittedMatteDivider(vertical,p,lo,hi,slope):(!options.gradientOnly||dividerEnds(vertical,p,lo,hi,slope))))return true;
          }
        }
      }return false;
    }
    // A frame immediately below a proved neighbor may share its bottom rail.
    // The shared interval must stay inside that existing rail: no extrapolation,
    // recursive completion, or authority supplied by the tap position.
    function sharedTop(neighbors,x1,y1,x2,y2){
      for(const neighbor of neighbors){
        const q=neighbor.quad,rail=neighbor.fits[1];
        if(x1<Math.min(q[2].x,q[3].x)*w-2||x2>Math.max(q[2].x,q[3].x)*w+2)continue;
        if(y2<=Math.max(q[2].y,q[3].y)*h+10)continue;
        if(Math.max(Math.abs(rail.offset+rail.slope*x1-y1),Math.abs(rail.offset+rail.slope*x2-y1))>3)continue;
        return {rail,neighborQuad:q};
      }
      return null;
    }
    function collect(neighbors=[],allowCore=false){
    const candidates=[];
    for(let j=0;j<hs.length;j++){const top=hs[j];for(let k=j+1;k<hs.length;k++){const bottom=hs[k],y1=top[0],y2=bottom[0];if(y2-y1<h*.085)continue;
      const sides=vs.filter(v=>v[1]<=y1+5&&v[2]>=y2-5&&cover(true,v[0],y1,y2)>.96&&ridge(true,v[0],y1,y2)>.45);
      for(let a=0;a<sides.length;a++)for(let b=a+1;b<sides.length;b++){const x1=sides[a][0],x2=sides[b][0];if(x2-x1<w*.14||(x2-x1)*(y2-y1)<w*h*.019)continue;
        if(top[1]>x1+5||top[2]<x2-5||bottom[1]>x1+5||bottom[2]<x2-5)continue;
        const scores=[cover(false,y1,x1,x2),cover(false,y2,x1,x2),cover(true,x1,y1,y2),cover(true,x2,y1,y2)];if(Math.min(...scores)<.96)continue;
        const ridges=[ridge(false,y1,x1,x2),ridge(false,y2,x1,x2),ridge(true,x1,y1,y2),ridge(true,x2,y1,y2)];
        let shared=null;
        if(Math.min(...ridges)<.45){
          if(ridges[1]>.45&&ridges[2]>.45&&ridges[3]>.45)shared=sharedTop(neighbors,x1,y1,x2,y2);
          if(!shared)continue;
        }
        // Filled black artwork has full dark runs without a separating ridge.
        // Only the independently anchored completion can distinguish those
        // runs here; the original strict detector keeps its original veto.
        if(hs.some(v=>v[0]>y1+10&&v[0]<y2-10&&v[1]<=x1+5&&v[2]>=x2-5&&cover(false,v[0],x1,x2)>.90&&(!shared||ridge(false,v[0],x1,x2)>.05))||vs.some(v=>v[0]>x1+10&&v[0]<x2-10&&v[1]<=y1+5&&v[2]>=y2-5&&cover(true,v[0],y1,y2)>.90&&(!shared||ridge(true,v[0],y1,y2)>.05)))continue;
        const box=[x1,y1,x2,y2];if(slopedDivider(box))continue;
        const fits=[shared?shared.rail:fit(false,y1,x1,x2,allowCore),fit(false,y2,x1,x2,allowCore),fit(true,x1,y1,y2,allowCore),fit(true,x2,y1,y2,allowCore)];if(fits.some(f=>!f))continue;
        const intersect=(horizontal,vertical)=>{const x=(vertical.offset+vertical.slope*horizontal.offset)/(1-vertical.slope*horizontal.slope);return {x:x/w,y:(horizontal.offset+horizontal.slope*x)/h};};
        const quad=[intersect(fits[0],fits[2]),intersect(fits[0],fits[3]),intersect(fits[1],fits[3]),intersect(fits[1],fits[2])];
        if(quad.some(p=>!Number.isFinite(p.x)||!Number.isFinite(p.y)||p.x<0||p.y<0||p.x>1||p.y>1))continue;
        // Intersections must lie at the independently observed endpoints. Prove
        // the joining ink at every corner and both adjoining short rail runs.
        const corners=[[x1,y1],[x2,y1],[x2,y2],[x1,y2]];
        const darkNear=(x,y)=>{x=Math.round(x);y=Math.round(y);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(x+dx>=0&&y+dy>=0&&x+dx<w&&y+dy<h&&g[(y+dy)*w+x+dx]<70)return true;return false;};
        if(quad.some((p,i)=>Math.hypot(p.x*w-corners[i][0],p.y*h-corners[i][1])>4||!darkNear(p.x*w,p.y*h)))continue;
        let joins=true;for(let i=0;i<4&&joins;i++)for(const neighbor of [(i+1)%4,(i+3)%4]){const p=quad[i],q=quad[neighbor],dx=(q.x-p.x)*w,dy=(q.y-p.y)*h,length=Math.hypot(dx,dy);let joined=0;for(let t=0;t<9;t++)joined+=darkNear(p.x*w+dx*t/length,p.y*h+dy*t/length);if(joined<8){joins=false;break;}}
        if(!joins)continue;
        candidates.push({box,quad,scores,ridges,fits,shared});if(candidates.length>180)return [];
      }
    }}
    return candidates;
    }
    // Short or partly obscured interior frames are uncertainty, never new output.
    // Their weaker rejection-only evidence prevents a large scene claiming insets.
    const weakH=lines(g,w,h,false,.05),weakV=lines(g,w,h,true,.05);
    if(options.darkMatte){
      // Near-black inset strokes must not disappear into gray cross-hatching
      // merely because the legacy line collector groups every value below 70.
      // These extra proposals are veto-only and still need the original
      // connected-box metrics and three independent fitted rails.
      const core=new Float32Array(g.length);
      for(let i=0;i<g.length;i++)core[i]=g[i]<30?0:255;
      weakH.push(...lines(core,w,h,false,.05));
      weakV.push(...lines(core,w,h,true,.05));
      weakH.sort((a,b)=>a[0]-b[0]);weakV.sort((a,b)=>a[0]-b[0]);
    }
    const inside=(q,p)=>q[0]>=p[0]-3&&q[1]>=p[1]-3&&q[2]<=p[2]+3&&q[3]<=p[3]+3&&(q[2]-q[0])*(q[3]-q[1])<.85*(p[2]-p[0])*(p[3]-p[1]);
    function metric(vertical,pos,lo,hi){const m=Math.max(2,Math.floor((hi-lo)*.02));return [cover(vertical,pos,lo+m,hi-m),ridge(vertical,pos,lo,hi)];}
    function removeAmbiguous(candidates,attachedInsets=false){
    const threats=[];
    // The opt-in portrait remainder is much smaller than a full page. Its
    // inset rejection threshold is local to that proved crop; otherwise a
    // clear small inset can fall below the old page-wide area threshold.
    // Only vetoes are widened: this option cannot construct a new frame.
    const localArea=options.localMatteInset===true?Math.min(...candidates.map(p=>(p.box[2]-p.box[0])*(p.box[3]-p.box[1]))):null;
    for(const vertical of [false,true]){const ls=vertical?weakV:weakH,along=vertical?h:w,cross=vertical?w:h;
      for(let j=0;j<ls.length;j++)for(let k=j+1;k<ls.length;k++){const a=ls[j],b=ls[k];if(b[0]-a[0]<(localArea?20:cross*.06)||Math.abs(a[1]-b[1])>10||Math.abs(a[2]-b[2])>10)continue;
        const lo=Math.max(a[1],b[1]),hi=Math.min(a[2],b[2]);if(hi-lo<(localArea?24:along*.10)||(hi-lo)*(b[0]-a[0])<(localArea?Math.max(w*h*.0025,localArea*.035):w*h*.019))continue;
        const rough=vertical?[a[0],lo,b[0],hi]:[lo,a[0],hi,b[0]];if(!candidates.some(p=>inside(rough,p.box)))continue;
        const metrics=[metric(vertical,a[0],lo,hi),metric(vertical,b[0],lo,hi)],ends=[];
        for(const guess of [lo,hi-1]){let best=null,quality=-1,where=guess;for(let q=guess-4;q<=guess+4;q++){if(q<8||q+9>=(vertical?h:w))continue;const met=metric(!vertical,q,a[0],b[0]),score=Math.min(...met)+.05*(met[0]+met[1]);if(score>quality){quality=score;best=met;where=q;}}metrics.push(best||[0,0]);ends.push(where);}
        const cov=metrics.map(m=>m[0]).sort((a,b)=>a-b);if(cov[0]<.6||cov[1]<.96)continue;
        // Exterior gutters can reveal a parent whose inset has dark artwork
        // attached to one border. Three separating ridges and a complete dark
        // fourth side are sufficient to veto that parent, never to create it.
        if(Math.min(...metrics.map(m=>m[1]))<.4&&
           !(attachedInsets&&cov[0]>=.96&&metrics.filter(m=>m[1]>=.4).length>=3))continue;
        if(options.gradientOnly){
          // Tree trunks and buildings can form rough dark boxes. On this
          // exterior-connected route, a nested-frame veto needs three fitted
          // rails; the fourth may remain interrupted. Existing routes retain
          // their original weak-box veto unchanged.
          const endFit=pos=>{
            const direct=fit(!vertical,pos,a[0],b[0],true);if(direct||!localArea)return direct;
            // A coverage tie can pick the fringe two pixels outside a thick
            // small inset's ink center. Seek a measured fit in that same
            // bounded endpoint neighborhood; never extend a rail or relax its
            // residual, darkness, support, or straightness requirements.
            for(let d=1;d<=4;d++)for(const sign of [-1,1]){
              const at=pos+d*sign;if(at<8||at+9>=(vertical?h:w))continue;
              const f=fit(!vertical,at,a[0],b[0],true);if(f)return f;
            }
            return null;
          };
          const rails=[fit(vertical,a[0],lo,hi,true),fit(vertical,b[0],lo,hi,true),
            endFit(ends[0]),endFit(ends[1])];
          if(rails.filter(Boolean).length<3)continue;
        }
        threats.push(vertical?[a[0],ends[0],b[0],ends[1]]:[ends[0],a[0],ends[1],b[0]]);
      }
    }
    // A divider obscured in its middle can still join both outside rails. The
    // separated line ends veto the union; they do not establish either child.
    for(const p of candidates){const [x1,y1,x2,y2]=p.box;let ambiguous=false;
      for(const vertical of [false,true]){const ls=vertical?weakV:weakH,lo=vertical?y1:x1,hi=vertical?y2:x2,b1=vertical?x1:y1,b2=vertical?x2:y2;
        for(const a of ls){if(a[0]<=b1+10||a[0]>=b2-10||Math.abs(a[1]-lo)>5||a[2]-a[1]<(hi-lo)*.1)continue;
          for(const b of ls){if(a===b||Math.abs(b[0]-a[0])>3||Math.abs(b[2]-hi)>5||b[2]-b[1]<(hi-lo)*.1)continue;
            const pos=Math.round((a[0]+b[0])/2);if(cover(vertical,pos,lo,hi)>=.60&&ridge(vertical,pos,lo,hi)>=.40){
              if(options.gradientOnly){
                const start=fit(vertical,a[0],a[1],a[2],true);
                const end=fit(vertical,b[0],b[1],b[2],true);
                if(!start||!end||Math.abs(start.slope-end.slope)>.01||
                   Math.abs((start.offset+start.slope*(lo+hi)/2)-(end.offset+end.slope*(lo+hi)/2))>3)continue;
              }
              ambiguous=true;break;
            }
          }if(ambiguous)break;
        }if(ambiguous)break;
      }if(ambiguous)p.internalUncertainty=true;
    }
    // A proved inset is still foreign artwork inside its parent's rectangle.
    // Parent output is deferred until visible stepped masks are supported.
    let clean=candidates.filter(p=>!p.internalUncertainty).filter(p=>!threats.some(q=>inside(q,p.box))).filter(p=>!candidates.some(q=>q!==p&&q.box[0]>=p.box[0]-2&&q.box[1]>=p.box[1]-2&&q.box[2]<=p.box[2]+2&&q.box[3]<=p.box[3]+2&&(q.box[2]-q.box[0])*(q.box[3]-q.box[1])<.8*(p.box[2]-p.box[0])*(p.box[3]-p.box[1])));
    const unique=[];clean.sort((a,b)=>(a.box[2]-a.box[0])*(a.box[3]-a.box[1])-(b.box[2]-b.box[0])*(b.box[3]-b.box[1]));for(const c of clean)if(!unique.some(q=>c.box.every((v,i)=>Math.abs(v-q.box[i])<=8)))unique.push(c);
    return unique;
    }
    if(options.vetoCandidates){
      const clean=removeAmbiguous(options.vetoCandidates,true);
      return options.darkMatte?clean.filter(c=>!slopedDivider(c.box)):clean;
    }
    function overlapArea(subject,clip){
      let points=subject;
      const cross=(a,b,p)=>(b.x-a.x)*(p.y-a.y)-(b.y-a.y)*(p.x-a.x);
      for(let i=0;i<clip.length&&points.length;i++){
        const a=clip[i],b=clip[(i+1)%clip.length],input=points;points=[];
        for(let j=0;j<input.length;j++){
          const p=input[j],q=input[(j+1)%input.length],cp=cross(a,b,p),cq=cross(a,b,q),pin=cp>=-1e-12,qin=cq>=-1e-12;
          if(pin)points.push(p);
          if(pin!==qin){const t=cp/(cp-cq);points.push({x:p.x+t*(q.x-p.x),y:p.y+t*(q.y-p.y)});}
        }
      }
      let area=0;for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];area+=a.x*b.y-b.x*a.y;}return Math.abs(area)/2;
    }
    // Preserve strict outputs and their ordering. The second pass may only
    // append a non-overlapping frame using an original accepted neighbor.
    const strict=options.supplementOnly||options.gradientOnly?[]:removeAmbiguous(collect()),extra=[];
    if(strict.length){
      for(const candidate of removeAmbiguous(collect(strict))){
        if(!candidate.shared)continue;
        if([...strict,...extra].some(other=>overlapArea(candidate.quad,other.quad)>1/(w*h)))continue;
        extra.push(candidate);
      }
    }
    // New gutter proposals cannot alter an existing identity. They must pass
    // the same interior/inset vetoes as dark-frame candidates, and may only
    // append a disjoint, fully ink-bounded frame. Three externally connected
    // gutter sides allow dark artwork to touch the fourth printed border.
    const gutter=[];
    if(!options.supplementOnly&&typeof PanelGutterFrames!=='undefined'){
      const proposals=(matteProposals||PanelGutterFrames.proposeRGBA(rgba,w,h,{gradient:options.gradientOnly===true})).map(c=>({
        box:[Math.min(...c.q.map(p=>p[0])),Math.min(...c.q.map(p=>p[1])),
             Math.max(...c.q.map(p=>p[0])),Math.max(...c.q.map(p=>p[1]))].map(Math.round),
        quad:c.q.map(p=>({x:p[0]/w,y:p[1]/h})),scores:c.ms.map(m=>m[0]),
        ridges:c.ms.map(m=>m[1]),fits:c.fits.map(f=>({slope:f.m,offset:f.b})),
        gutterProof:{...(c.componentProof?{componentProof:c.componentProof}:{}),method:options.componentMatte?'exterior-dark-component':options.darkMatte?'exterior-dark-matte':options.gradientOnly?'exterior-gradient-gutter':'exterior-gutter',color:c.color,exteriorSupport:c.ms.map(m=>m[1])}
      }));
      for(const candidate of removeAmbiguous(proposals,true)){
        const [x1,y1,x2,y2]=candidate.box;
        if(hs.some(v=>v[0]>y1+10&&v[0]<y2-10&&v[1]<=x1+5&&v[2]>=x2-5&&cover(false,v[0],x1,x2)>.90&&ridge(false,v[0],x1,x2)>.05&&(!options.gradientOnly||dividerEnds(false,v[0],x1,x2)))||
           vs.some(v=>v[0]>x1+10&&v[0]<x2-10&&v[1]<=y1+5&&v[2]>=y2-5&&cover(true,v[0],y1,y2)>.90&&ridge(true,v[0],y1,y2)>.05&&(!options.gradientOnly||dividerEnds(true,v[0],y1,y2)))||slopedDivider(candidate.box))continue;
        // Each corner and its two short rail runs must be ink-connected.
        const near=(x,y)=>{x=Math.round(x);y=Math.round(y);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(x+dx>=0&&x+dx<w&&y+dy>=0&&y+dy<h&&g[(y+dy)*w+x+dx]<70)return true;return false;};
        const q=candidate.quad.map(p=>[p.x*w,p.y*h]);let joined=true;
        for(let i=0;i<4&&joined;i++)for(const j of [(i+1)%4,(i+3)%4]){
          const a=q[i],b=q[j],length=Math.hypot(b[0]-a[0],b[1]-a[1]);let n=0;
          for(let t=0;t<9;t++)n+=near(a[0]+(b[0]-a[0])*t/length,a[1]+(b[1]-a[1])*t/length);
          if(n<8||!near(...a)){joined=false;break;}
        }
        if(!joined||[...strict,...extra,...gutter].some(other=>overlapArea(candidate.quad,other.quad)>1/(w*h)))continue;
        gutter.push(candidate);
      }
    }
    const coreFrames=[];
    if(options.supplementOnly){
      // Run only after original closed-frame/partition reconciliation. Existing
      // identities are immutable anchors, including their border-center fits.
      const anchors=options.anchors||[];
      if(anchors.some(p=>!Array.isArray(p._quad)||p._quad.length!==4))return [];
      const accepted=anchors.map(p=>({quad:p._quad}));
      const disjoint=q=>accepted.every(p=>overlapArea(q,p.quad)<=1/(w*h));
      const intersect=(a,b)=>{const x=(b.offset+b.slope*a.offset)/(1-b.slope*a.slope);return {x:x/w,y:(a.offset+a.slope*x)/h};};
      const quadFor=f=>[intersect(f[0],f[2]),intersect(f[0],f[3]),intersect(f[1],f[3]),intersect(f[1],f[2])];
      for(let c of removeAmbiguous(collect([],true))){
        if(!c.fits.some(f=>f.inkCore))continue;
        if(!disjoint(c.quad)){
          // Independent fits can overlap within the width of shared ink. Move
          // only the new edge inward, at most two analysis pixels, and require
          // its entire new rail to remain on dark ink. Never move an anchor.
          let trimmed=null;
          for(let d=.5;d<=2&&!trimmed;d+=.5)for(let side=0;side<4;side++){
            const fits=c.fits.map(f=>({...f}));fits[side].offset+=(side===0||side===2?1:-1)*d;
            const q=quadFor(fits);if(!disjoint(q))continue;
            const ends=side===0?[q[0],q[1]]:side===1?[q[3],q[2]]:side===2?[q[0],q[3]]:[q[1],q[2]];
            const [a,b]=ends,n=Math.ceil(Math.hypot((b.x-a.x)*w,(b.y-a.y)*h));let dark=0,joined=true;
            for(let t=0;t<=n;t++){const x=Math.round((a.x+(b.x-a.x)*t/n)*w),y=Math.round((a.y+(b.y-a.y)*t/n)*h),ink=x>=0&&x<w&&y>=0&&y<h&&g[y*w+x]<70;dark+=ink;if((t<8||t>n-8)&&!ink)joined=false;}
            if(dark/(n+1)<.96||!joined||q.some((p,i)=>Math.hypot((p.x-c.quad[i].x)*w,(p.y-c.quad[i].y)*h)>2.1))continue;
            trimmed={...c,quad:q,fits,inkTrim:{side,inwardPixels:d}};break;
          }
          if(!trimmed)continue;c=trimmed;
        }
        coreFrames.push(c);accepted.push(c);
      }
    }
    const result=[...strict,...extra,...gutter,...coreFrames];
    if(log)log(`closed frames: ${strict.length} strict, ${extra.length} shared-boundary, ${gutter.length} exterior-gutter candidates`);
    return result.map(c=>{const xs=c.quad.map(p=>p.x),ys=c.quad.map(p=>p.y),proof={version:1,connected:true,analysisWidth:w,analysisHeight:h,coverage:c.scores,ridge:c.ridges,railFits:c.fits};
      if(c.fits.some(f=>f.inkCore))proof.inkCoreProof={method:'uniform-ink-core',...(c.inkTrim?{ownershipTrim:c.inkTrim}:{})};
      if(c.gutterProof)proof.gutterProof=c.gutterProof;
      if(c.shared)proof.sharedTopProof={method:'neighbor-completion',neighborQuad:c.shared.neighborQuad,rail:c.shared.rail};
      return {x:Math.min(...xs),y:Math.min(...ys),w:Math.max(...xs)-Math.min(...xs),h:Math.max(...ys)-Math.min(...ys),_quad:c.quad,_identitySource:'closed-frame',_geometryOwner:'orthogonal-frame',_geometryType:'closed-dark-frame',_closedFrameProof:proof};});
  }
  function analyzeImage(img,log,options){const scale=Math.min(1,900/Math.max(img.width,img.height)),w=Math.max(1,Math.round(img.width*scale)),h=Math.max(1,Math.round(img.height*scale)),c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,w,h);const rgba=ctx.getImageData(0,0,w,h).data;return options?.openRegions?
    PanelGutterFrames.openRegionsRGBA(rgba,w,h,options.anchors):analyzeRGBA(rgba,w,h,log,options);}

  function pairedOutlinesRGBA(rgba,w,h,anchors,log){
    if(typeof PanelGutterFrames==='undefined'||!PanelGutterFrames.pairedOutlinesRGBA)return [];
    const candidates=PanelGutterFrames.pairedOutlinesRGBA(rgba,w,h,anchors);
    if(candidates.length!==2)return [];
    // Existing near-black inset and measured-divider vetoes are rejection-only.
    // They cannot generate an outline or substitute a component's boundaries.
    const clean=analyzeRGBA(rgba,w,h,log,{gradientOnly:true,darkMatte:true,vetoCandidates:candidates});
    if(clean.length!==2)return [];
    return candidates.map(c=>{const xs=c.q.map(p=>p[0]/w),ys=c.q.map(p=>p[1]/h);return {
      x:Math.min(...xs),y:Math.min(...ys),w:Math.max(...xs)-Math.min(...xs),h:Math.max(...ys)-Math.min(...ys),
      _outline:c.q.map(p=>({x:p[0]/w,y:p[1]/h})),_identitySource:'matte-component-outline',
      _geometryType:'matte-silhouette-frame',_geometryOwner:'matte-outline',_matteOutlineProof:c.proof};});
  }
  function pairedOutlinesImage(img,anchors,log){
    const scale=Math.min(1,900/Math.max(img.width,img.height)),w=Math.round(img.width*scale),h=Math.round(img.height*scale);
    const c=document.createElement('canvas');c.width=w;c.height=h;
    const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,w,h);
    return pairedOutlinesRGBA(ctx.getImageData(0,0,w,h).data,w,h,anchors,log);
  }


  function matteColumnRemainderImage(img,parent,strip,anchor,log){
    const scale=Math.min(1,900/Math.max(img.width,img.height)),w=Math.round(img.width*scale),h=Math.round(img.height*scale);
    const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,w,h);
    const rgba=ctx.getImageData(0,0,w,h).data;
    const r=PanelGutterFrames.matteColumnRemainderRGBA(rgba,w,h,parent,strip,anchor);
    if(!r)return null;
    // Rejection-only guards also apply to a borderless scene. An inset or a
    // measured internal divider must not be swallowed merely because a crop
    // is surrounded by black matte.
    const candidate={box:[r.x*w,r.y*h,(r.x+r.w)*w,(r.y+r.h)*h].map(Math.round)};
    const clean=analyzeRGBA(rgba,w,h,log,{gradientOnly:true,darkMatte:true,vetoCandidates:[candidate],localMatteInset:true});
    return clean.length===1?r:null;
  }

  return {analyzeRGBA,analyzeImage,pairedOutlinesRGBA,pairedOutlinesImage,matteColumnRemainderImage,shortDarkComponentsImage:(img,log)=>analyzeImage(img,log,{gradientOnly:true,darkMatte:true,componentMatte:true,shortPanels:true}),vetoRegionsRGBA:(rgba,w,h,candidates)=>analyzeRGBA(rgba,w,h,null,{gradientOnly:true,vetoCandidates:candidates}),openRegionsImage:(img,anchors)=>analyzeImage(img,null,{openRegions:true,anchors}),gradientImage:(img,log)=>analyzeImage(img,log,{gradientOnly:true}),darkMatteImage:(img,log)=>analyzeImage(img,log,{gradientOnly:true,darkMatte:true}),darkComponentsImage:(img,log)=>analyzeImage(img,log,{gradientOnly:true,darkMatte:true,componentMatte:true}),supplementImage:(img,anchors,log)=>analyzeImage(img,log,{supplementOnly:true,anchors})};
})();
if(typeof window!=='undefined')window.PanelClosedFrames=PanelClosedFrames;
if(typeof module!=='undefined')module.exports=PanelClosedFrames;
