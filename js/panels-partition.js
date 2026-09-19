/* Whole-page partitions joined to a closed printed frame. Uncertain leaves
 * invalidate the map; the existing independent frame routes remain available.
 */
const PanelPartition = (() => {
  'use strict';
  function analyzeRGBA(rgba,w,h,log){
    if(!Number.isInteger(w)||!Number.isInteger(h)||w<100||h<160||w>900||h>900||!rgba||rgba.length!==w*h*4)return [];
    const g=new Float32Array(w*h);for(let i=0;i<g.length;i++)g[i]=.299*rgba[i*4]+.587*rgba[i*4+1]+.114*rgba[i*4+2];
    let lineOverflow=false;const at=(v,p,t)=>v?g[t*w+p]:g[p*w+t];
    function lines(vertical,minRatio){const length=vertical?h:w,count=vertical?w:h,min=Math.max(30,length*minRatio),out=[];
      for(let p=2;p<count-2;p++)for(let t=0;t<length;t++){if(Math.min(at(vertical,p-1,t),at(vertical,p,t),at(vertical,p+1,t))>=70)continue;const lo=t;while(++t<length&&Math.min(at(vertical,p-1,t),at(vertical,p,t),at(vertical,p+1,t))<70){}if(t-lo<min)continue;const c=[p,lo,t];if(!out.some(a=>Math.abs(a[0]-p)<3&&Math.abs(a[1]-lo)<8&&Math.abs(a[2]-t)<8))out.push(c);if(out.length>600){lineOverflow=true;return [];}}
      return out;
    }
    function metric(vertical,p,lo,hi){if(p<8||p+9>=(vertical?w:h)||hi-lo<10)return [0,0];let dark=0,ridge=0,n=0;const trim=Math.max(2,Math.floor((hi-lo)*.02));
      for(let t=Math.ceil(lo)+trim;t<Math.floor(hi)-trim;t++){let mid=255,before=0,after=0;for(let d=-2;d<=2;d++)mid=Math.min(mid,at(vertical,p+d,t));for(let d=4;d<=8;d++){before+=at(vertical,p-d,t);after+=at(vertical,p+d,t);}dark+=mid<70;ridge+=before/5-mid>25&&after/5-mid>25;n++;}return [dark/n,ridge/n];}
    const hs=lines(false,.75),vs=lines(true,.75),roots=[];if(lineOverflow||hs.length>40||vs.length>40)return [];
    for(const top of hs)for(const bottom of hs){const y1=top[0],y2=bottom[0];if(y2-y1<h*.75)continue;for(const left of vs)for(const right of vs){const x1=left[0],x2=right[0];if(x2-x1<w*.75||top[1]>x1+5||top[2]<x2-5||bottom[1]>x1+5||bottom[2]<x2-5||left[1]>y1+5||left[2]<y2-5||right[1]>y1+5||right[2]<y2-5)continue;
      const ms=[metric(false,y1,x1,x2),metric(false,y2,x1,x2),metric(true,x1,y1,y2),metric(true,x2,y1,y2)];if(ms.some(m=>m[0]<.96||m[1]<.45))continue;const b=[x1,y1,x2,y2];if(!roots.some(a=>b.every((v,i)=>Math.abs(v-a[i])<8)))roots.push(b);
    }}
    if(roots.length!==1)return [];
    function outerFit(box,side){const vertical=side%2===0,inward=side<2?1:-1,pos=box[side],lo=vertical?box[1]:box[0],hi=vertical?box[3]:box[2],count=vertical?w:h,samples=[];
      for(let t=lo+5;t<hi-4;t++){let best=null;for(let d=-6;d<=6;d++){const p=pos+d;if(p<8||p>=count-8||at(vertical,p,t)>=70)continue;let bright=0;for(let k=2;k<=4;k++)bright+=at(vertical,p-inward*k,t)>220;if(bright<3)continue;const center=p+inward*.5;if(best===null||Math.abs(center-pos)<Math.abs(best-pos))best=center;}if(best!==null)samples.push([t,best]);}
      if(samples.length/(hi-lo)<.9)return null;const f=regress(samples);if(!f||Math.abs(f.slope)>.02||f.residual>1.5)return null;return f;
    }
    function regress(samples){if(samples.length<20)return null;let mx=0,my=0;for(const p of samples){mx+=p[0];my+=p[1];}mx/=samples.length;my/=samples.length;let cov=0,variance=0;for(const p of samples){cov+=(p[0]-mx)*(p[1]-my);variance+=(p[0]-mx)**2;}const slope=cov/variance,offset=my-slope*mx;const errors=samples.map(p=>Math.abs(p[1]-offset-slope*p[0])).sort((a,b)=>a-b);return Number.isFinite(slope)?{slope,offset,residual:errors[Math.floor(errors.length*.9)]}:null;}
    const edges=[0,1,2,3].map(s=>outerFit(roots[0],s));if(edges.some(f=>!f))return [];
    const intersect=(horizontal,vertical)=>{const x=(vertical.offset+vertical.slope*horizontal.offset)/(1-vertical.slope*horizontal.slope);return [x,horizontal.offset+horizontal.slope*x];};
    const root=[intersect(edges[1],edges[0]),intersect(edges[1],edges[2]),intersect(edges[3],edges[2]),intersect(edges[3],edges[0])];
    function nearDark(x,y){x=Math.round(x);y=Math.round(y);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(x+dx>=0&&x+dx<w&&y+dy>=0&&y+dy<h&&g[(y+dy)*w+x+dx]<70)return true;return false;}
    function closed(q){if(q.some(p=>p.some(v=>!Number.isFinite(v))||p[0]<2||p[0]>w-3||p[1]<2||p[1]>h-3))return false;for(let i=0;i<4;i++){const a=q[i],b=q[(i+1)%4],c=q[(i+2)%4];if((b[0]-a[0])*(c[1]-b[1])-(b[1]-a[1])*(c[0]-b[0])<=1)return false;}for(let k=0;k<4;k++){const a=q[k],b=q[(k+1)%4],length=Math.hypot(b[0]-a[0],b[1]-a[1]);if(length<40)return false;let n=0;const count=Math.ceil(length);for(let t=0;t<=count;t++)n+=nearDark(a[0]+(b[0]-a[0])*t/count,a[1]+(b[1]-a[1])*t/count);if(n/(count+1)<.96||!nearDark(...a))return false;for(const c of [a,b]){const d=c===a?b:a;let support=0;for(let t=0;t<9;t++)support+=nearDark(c[0]+(d[0]-c[0])*t/length,c[1]+(d[1]-c[1])*t/length);if(support<8)return false;}}return true;}
    if(!closed(root))return [];
    function find(q,vertical){const qq=vertical?[q[0].slice().reverse(),q[3].slice().reverse(),q[2].slice().reverse(),q[1].slice().reverse()]:q,side=(a,b)=>{const slope=(b[0]-a[0])/(b[1]-a[1]);return [slope,a[0]-slope*a[1]];},[lm,lb]=side(qq[0],qq[3]),[rm,rb]=side(qq[1],qq[2]);
      const xmin=Math.min(...qq.map(p=>p[0])),xmax=Math.max(...qq.map(p=>p[0])),ymin=Math.min(...qq.map(p=>p[1])),ymax=Math.max(...qq.map(p=>p[1])),center=(xmin+xmax)/2,n=Math.ceil(xmax-xmin),bound=vertical?w:h;
      if(ymax-ymin<70||xmax-xmin<70)return {best:null,uncertain:true};let best=null,uncertain=false;
      function endpoints(slope,offset){const left=(lb+lm*offset)/(1-lm*slope),right=(rb+rm*offset)/(1-rm*slope);return [[left,slope*left+offset],[right,slope*right+offset]];}
      function evidence(slope,offset,ends,weak=false){const [a,b]=ends;let sum=0,square=0,dark=0,ridge=0,thick=0,first=0,last=0;const count=Math.max(20,Math.ceil(b[0]-a[0]));
        for(let t=0;t<=count;t++){const x=Math.round(a[0]+(b[0]-a[0])*t/count),y=Math.round(slope*x+offset);if(y<8||y>=bound-8||x<0||x>=(vertical?h:w))return null;const v=at(vertical,y,x);sum+=v;square+=v*v;dark+=v<70;if(t<12)first+=v<70;if(t>count-12)last+=v<70;thick+=at(vertical,y-1,x)<70&&at(vertical,y+1,x)<70;let before=0,after=0;for(let d=4;d<=8;d++){before+=at(vertical,y-d,x);after+=at(vertical,y+d,x);}ridge+=before/5-v>20&&after/5-v>20;}
        const total=count+1,mean=sum/total,std=Math.sqrt(Math.max(0,square/total-mean*mean));return {dark:dark/total,ridge:ridge/total,thick:thick/total,mean,std,attached:first>=11&&last>=11,oneAttached:first>=11||last>=11};
      }
      for(let si=-48;si<=48;si++){const slope=si*.0025;for(let pos=Math.ceil(ymin+8);pos<=Math.floor(ymax-8);pos++){const offset=pos-slope*center,ends=endpoints(slope,offset),[a,b]=ends;if(a[1]<=qq[0][1]+8||a[1]>=qq[3][1]-8||b[1]<=qq[1][1]+8||b[1]>=qq[2][1]-8)continue;const room=a[1]>qq[0][1]+(qq[3][1]-qq[0][1])*.1&&a[1]<qq[3][1]-(qq[3][1]-qq[0][1])*.1&&b[1]>qq[1][1]+(qq[2][1]-qq[1][1])*.1&&b[1]<qq[2][1]-(qq[2][1]-qq[1][1])*.1;
          let probes=0;for(let j=0;j<16;j++){const x=Math.round(a[0]+(b[0]-a[0])*j/15),y=Math.round(slope*x+offset);if(y>=8&&y<bound-8)probes+=at(vertical,y,x)<70;}if(probes<10)continue;
          const m=evidence(slope,offset,ends);if(!m)continue;if(m.ridge>=.40&&(m.dark>=.60&&m.attached||m.dark>=.80&&m.oneAttached))uncertain=true;
          if(!room||m.dark<.97||m.mean>=30||m.std>=25||m.ridge<.55||m.thick<.70)continue;const score=m.ridge+m.thick*.25+(1-m.mean/30)*.15+(1-m.std/25)*.1;if(!best||score>best.score)best={slope,offset,ends,score,evidence:m,vertical};
        }}
      if(!best)return {best:null,uncertain};const samples=[];
      for(let x=Math.ceil(best.ends[0][0])+3;x<Math.floor(best.ends[1][0])-2;x++){const y=Math.round(best.slope*x+best.offset);if(at(vertical,y,x)>=70)continue;let lo=y,hi=y;while(lo>y-8&&at(vertical,lo-1,x)<70)lo--;while(hi<y+8&&at(vertical,hi+1,x)<70)hi++;if(hi-lo>9||lo<=y-8||hi>=y+8||lo<3||hi+3>=bound||Math.min(at(vertical,lo-3,x),at(vertical,hi+3,x))-at(vertical,y,x)<20)continue;samples.push([x,(lo+hi)/2]);}
      if(samples.length/(best.ends[1][0]-best.ends[0][0])<.45)return {best:null,uncertain:true};const f=regress(samples);if(!f||f.residual>1.5||Math.abs(f.slope)>.13)return {best:null,uncertain:true};const ends=endpoints(f.slope,f.offset);if(ends.some((p,i)=>Math.hypot(p[0]-best.ends[i][0],p[1]-best.ends[i][1])>4)||ends[0][1]<=qq[0][1]+8||ends[0][1]>=qq[3][1]-8||ends[1][1]<=qq[1][1]+8||ends[1][1]>=qq[2][1]-8)return {best:null,uncertain:true};const m=evidence(f.slope,f.offset,ends);if(!m||m.dark<.97||m.mean>=30||m.std>=25||m.ridge<.55||m.thick<.70)return {best:null,uncertain:true};
      best={...best,...f,evidence:m,points:vertical?ends.map(p=>p.slice().reverse()):ends};return {best,uncertain};
    }
    const leaves=[],splits=[];let failed=false;
    function walk(q,depth){if(failed)return;if(depth>7||leaves.length+splits.length>24||!closed(q)){failed=true;return;}const hcut=find(q,false),vcut=find(q,true),choices=[hcut.best,vcut.best].filter(Boolean);if(!choices.length){if(hcut.uncertain||vcut.uncertain){failed=true;return;}leaves.push(q);return;}const c=choices.sort((a,b)=>b.score-a.score)[0],[a,b]=c.points;splits.push(c);if(c.vertical){walk([q[0],a,b,q[3]],depth+1);walk([a,q[1],q[2],b],depth+1);}else{walk([q[0],q[1],b,a],depth+1);walk([a,b,q[2],q[3]],depth+1);}}
    walk(root,0);if(failed||leaves.length<4||leaves.length>12||!splits.some(c=>c.vertical)||!splits.some(c=>!c.vertical))return [];
    // Closed or partly interrupted nested boxes only veto the map. They cannot
    // become output without independent semantic/visibility ownership.
    const weak=[lines(false,.05),lines(true,.05)];if(lineOverflow)return [];
    const inside=(p,q)=>{let sign=0;for(let i=0;i<4;i++){const a=q[i],b=q[(i+1)%4],cross=(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);if(Math.abs(cross)<2)continue;if(sign&&Math.sign(cross)!==sign)return false;sign=Math.sign(cross);}return true;};
    for(let axis=0;axis<2;axis++){const vertical=axis===1,ls=weak[axis],along=vertical?h:w,cross=vertical?w:h;for(let j=0;j<ls.length;j++)for(let k=j+1;k<ls.length;k++){const a=ls[j],b=ls[k];if(b[0]-a[0]<cross*.06||Math.abs(a[1]-b[1])>10||Math.abs(a[2]-b[2])>10)continue;const lo=Math.max(a[1],b[1]),hi=Math.min(a[2],b[2]);if(hi-lo<along*.1||(hi-lo)*(b[0]-a[0])<w*h*.019)continue;const rough=vertical?[[a[0],lo],[b[0],lo],[b[0],hi],[a[0],hi]]:[[lo,a[0]],[hi,a[0]],[hi,b[0]],[lo,b[0]]];if(!leaves.some(q=>rough.every(p=>inside(p,q))&&Math.abs((hi-lo)*(b[0]-a[0]))<.85*Math.abs(q.reduce((s,p,i)=>{const n=q[(i+1)%4];return s+p[0]*n[1]-n[0]*p[1];},0)/2)))continue;
        const ms=[metric(vertical,a[0],lo,hi),metric(vertical,b[0],lo,hi)];for(const guess of [lo,hi-1]){let best=[0,0],score=-1;for(let pos=guess-4;pos<=guess+4;pos++){const m=metric(!vertical,pos,a[0],b[0]),s=Math.min(...m)+.05*(m[0]+m[1]);if(s>score){score=s;best=m;}}ms.push(best);}const coverage=ms.map(m=>m[0]).sort((a,b)=>a-b);if(coverage[0]>=.6&&coverage[1]>=.96&&ms.every(m=>m[1]>=.4))return [];
      }}
    if(log)log(`page partition: ${leaves.length} closed leaves, ${splits.length} attached separators`);
    return leaves.map(q=>{const quad=q.map(p=>({x:p[0]/w,y:p[1]/h})),xs=quad.map(p=>p.x),ys=quad.map(p=>p.y);return {x:Math.min(...xs),y:Math.min(...ys),w:Math.max(...xs)-Math.min(...xs),h:Math.max(...ys)-Math.min(...ys),_quad:quad,_identitySource:'page-partition',_geometryOwner:'orthogonal-frame',_geometryType:'connected-page-partition',_partitionProof:{version:1,connected:true,analysisWidth:w,analysisHeight:h,leafCount:leaves.length,separatorCount:splits.length,outerFits:edges}};});
  }
  function analyzeImage(img,log){const scale=Math.min(1,900/Math.max(img.width,img.height)),w=Math.max(1,Math.round(img.width*scale)),h=Math.max(1,Math.round(img.height*scale)),c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,w,h);return analyzeRGBA(ctx.getImageData(0,0,w,h).data,w,h,log);}
  return {analyzeRGBA,analyzeImage};
})();
if(typeof window!=='undefined')window.PanelPartition=PanelPartition;
if(typeof module!=='undefined')module.exports=PanelPartition;
