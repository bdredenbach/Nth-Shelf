/* Exterior color fields and interrupted paper gutters. Geometry is traced from
 * pixels after speech-balloon bridges are removed from the seed mask. No book,
 * page, fixed layout or tap coordinates participate in detection. */
const PanelRaggedGutters=(()=>{
 'use strict';
 const METHOD='exterior-color-field-ragged-cells',RECOVERY='independent-exterior-cells',finite=Number.isFinite;
 const area=q=>q.reduce((s,a,i)=>{const b=q[(i+1)%q.length];return s+a[0]*b[1]-b[0]*a[1]},0)/2;
 function cc(mask,w,h){const ids=new Int32Array(w*h),queue=new Int32Array(w*h),items=[];let id=0;for(let seed=0;seed<mask.length;seed++)if(mask[seed]&&!ids[seed]){let n=1,head=0,x0=w,y0=h,x1=0,y1=0;queue[0]=seed;ids[seed]=++id;while(head<n){const i=queue[head++],x=i%w,y=i/w|0;x0=Math.min(x0,x);x1=Math.max(x1,x+1);y0=Math.min(y0,y);y1=Math.max(y1,y+1);for(const j of[x?i-1:-1,x+1<w?i+1:-1,y?i-w:-1,y+1<h?i+w:-1])if(j>=0&&mask[j]&&!ids[j]){ids[j]=id;queue[n++]=j;}}items.push({id,pixels:n,box:[x0,y0,x1,y1],indices:queue.slice(0,n)});}return{ids,items};}
 function exterior(mask,w,h){const out=new Uint8Array(w*h),queue=new Int32Array(w*h);let n=0,head=0;const add=i=>{if(mask[i]&&!out[i]){out[i]=1;queue[n++]=i;}};for(let x=0;x<w;x++){add(x);add((h-1)*w+x);}for(let y=0;y<h;y++){add(y*w);add(y*w+w-1);}while(head<n){const i=queue[head++],x=i%w,y=i/w|0;if(x)add(i-1);if(x+1<w)add(i+1);if(y)add(i-w);if(y+1<h)add(i+w);}return{mask:out,pixels:n};}
 function dilate(a,w,h){const b=a.slice();for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x;if(!a[i]&&((x&&a[i-1])||(x+1<w&&a[i+1])||(y&&a[i-w])||(y+1<h&&a[i+w])))b[i]=1;}return b;}
 function hsv(c){const max=Math.max(...c),min=Math.min(...c),d=max-min;let h=0;if(d)h=max===c[0]?((c[1]-c[2])/d+6)%6:max===c[1]?(c[2]-c[0])/d+2:(c[0]-c[1])/d+4;return[h/6,max?d/max:0,max/255];}
 function palette(rgba,w,h){const hist=new Map(),edge=[];for(let x=0;x<w;x+=2){edge.push(x,(h-1)*w+x);}for(let y=0;y<h;y+=2){edge.push(y*w,y*w+w-1);}for(const i of edge){const key=[0,1,2].map(c=>Math.floor(rgba[i*4+c]/12)).join(',');hist.set(key,(hist.get(key)||0)+1);}const ranked=[...hist].sort((a,b)=>b[1]-a[1]),primary=ranked[0][0].split(',').map(v=>Math.min(255,12*v+6)),[ph,ps]=hsv(primary),colors=[];for(const[key,n]of ranked.slice(0,30)){if(n<edge.length*.01)continue;const c=key.split(',').map(v=>Math.min(255,12*v+6)),[ch,cs]=hsv(c);if(ps<.15&&Math.max(...c.map((v,k)=>Math.abs(v-primary[k])))>20)continue;if(ps>=.15&&(Math.min(Math.abs(ch-ph),1-Math.abs(ch-ph))>.06||cs<ps*.65))continue;if(colors.some(q=>Math.max(...q.map((v,k)=>Math.abs(v-c[k])))<16))continue;colors.push(c);}const paper=Math.min(...primary)>220;return{colors,paper,edgeSamples:edge.length,edgeMatched:edge.filter(i=>paper?Math.min(rgba[i*4],rgba[i*4+1],rgba[i*4+2])>232:colors.some(c=>c.every((v,k)=>Math.abs(v-rgba[i*4+k])<=16))).length};}
 function splitSeeds(items,ext,w,h){
  const result=[],size=w*h;
  function divide(c,depth){
   const [x0,y0,x1,y1]=c.box,bw=x1-x0,bh=y1-y0;let best=null;
   if(depth<6)for(let axis=0;axis<2;axis++){
    const N=axis?bw:bh,span=axis?bh:bw;if(N<60||span<65)continue;
    const profile=new Float64Array(N),counts=new Uint32Array(N);
    for(const i of c.indices)counts[axis?i%w-x0:(i/w|0)-y0]++;
    for(let k=0;k<N;k++){for(let t=0;t<span;t++)profile[k]+=ext[(axis?y0+t:y0+k)*w+(axis?x0+k:x0+t)];profile[k]/=span;}
    let left=0;for(let k=0;k<N;k++){
     left+=counts[k];if(k<Math.max(22,N*.10)||k>N-Math.max(22,N*.10)||Math.min(left,c.pixels-left)<size*.018)continue;
     const support=(profile[k-1]+profile[k]+profile[k+1])/3;if(support<.62)continue;
     const band=Math.max(6,Math.floor(N*.025));let flanked=0;
     for(let t=0;t<span;t++){let a=0,b=0,na=0,nb=0;for(let u=Math.max(0,k-band*3);u<Math.max(1,k-band);u++){a+=!ext[(axis?y0+t:y0+u)*w+(axis?x0+u:x0+t)];na++;}for(let u=Math.min(N-1,k+band);u<Math.min(N,k+band*3);u++){b+=!ext[(axis?y0+t:y0+u)*w+(axis?x0+u:x0+t)];nb++;}if(a/na>.5&&b/nb>.5)flanked++;}
     const flank=flanked/span,score=support+.1*flank;if(flank<.40)continue;
     if(!best||score>best.score)best={axis,pos:k+(axis?x0:y0),score,support,flank};
    }
   }
   if(!best){result.push(c);return;}
   const groups=[[],[]];for(const i of c.indices)groups[(best.axis?i%w:(i/w|0))<best.pos?0:1].push(i);
   for(const indices of groups){if(!indices.length)continue;let a=w,b=h,d=0,e=0;for(const i of indices){const x=i%w,y=i/w|0;a=Math.min(a,x);b=Math.min(b,y);d=Math.max(d,x+1);e=Math.max(e,y+1);}divide({indices,pixels:indices.length,box:[a,b,d,e],splits:[...(c.splits||[]),best]},depth+1);}
  }
  for(const item of items)divide(item,0);
  // A straight cut may leave a thin detached border fragment on the wrong
  // side. Seed from its main connected body; geodesic growth assigns the
  // detached fringe from the neighboring scene instead of preserving it.
  return result.map(c=>{if(!c.splits?.length)return c;const mask=new Uint8Array(size);for(const i of c.indices)mask[i]=1;const main=cc(mask,w,h).items.sort((a,b)=>b.pixels-a.pixels)[0];return {...main,splits:c.splits};});
 }
 function analyzeRGBA(rgba,w,h,log,recover=false){
  if(!Number.isInteger(w)||!Number.isInteger(h)||w<250||h<350||w>900||h>900||rgba?.length!==w*h*4||typeof PanelMatteCells==='undefined')return[];
  const size=w*h,p=palette(rgba,w,h),bg=new Uint8Array(size),white=new Uint8Array(size),lum=new Float64Array(size);if(p.edgeMatched<p.edgeSamples*.25)return[];
  for(let i=0;i<size;i++){const r=rgba[i*4],g=rgba[i*4+1],b=rgba[i*4+2];if(rgba[i*4+3]!==255)return[];white[i]=Math.min(r,g,b)>232;lum[i]=.299*r+.587*g+.114*b;bg[i]=p.paper?white[i]:p.colors.some(c=>Math.abs(c[0]-r)<=16&&Math.abs(c[1]-g)<=16&&Math.abs(c[2]-b)<=16);}
  const ext=exterior(bg,w,h);if(ext.pixels<size*.04||ext.pixels>size*.60)return[];const art=ext.mask.map(v=>1-v);let separators=p.paper?bg:ext.mask;
  if(!p.paper){let near=ext.mask;for(let k=0;k<12;k++)near=dilate(near,w,h);separators=ext.mask.map((v,i)=>v||near[i]&&white[i]?1:0);}
  const wall=dilate(dilate(separators,w,h),w,h),core=cc(wall.map(v=>1-v),w,h),seeds=splitSeeds(core.items.filter(c=>c.pixels>=size*.012&&(c.box[2]-c.box[0])>=w*.06&&(c.box[3]-c.box[1])>=h*.04),ext.mask,w,h);
  if(seeds.length<(recover?2:3)||seeds.length>24)return[];
  const labels=new Uint16Array(size),queue=new Int32Array(size);let n=0,head=0;seeds.sort((a,b)=>a.box[1]-b.box[1]||a.box[0]-b.box[0]);for(let start=0;start<seeds.length;){let end=start+1;const top=seeds[start].box[1],tolerance=Math.min(h*.06,(seeds[start].box[3]-top)*.20);while(end<seeds.length&&seeds[end].box[1]-top<tolerance)end++;const row=seeds.slice(start,end).sort((a,b)=>a.box[0]-b.box[0]);seeds.splice(start,end-start,...row);start=end;}for(let k=0;k<seeds.length;k++)for(const i of seeds[k].indices){labels[i]=k+1;queue[n++]=i;}
  while(head<n){const i=queue[head++],x=i%w,y=i/w|0;for(const j of[x?i-1:-1,x+1<w?i+1:-1,y?i-w:-1,y+1<h?i+w:-1])if(j>=0&&art[j]&&!labels[j]){labels[j]=labels[i];queue[n++]=j;}}
  // Restore complete enclosed balloon bodies to their dominant scene.
  const bodies=cc(white.map((v,i)=>v&&!ext.mask[i]?1:0),w,h);
  for(const body of bodies.items){if(body.pixels<40||body.pixels>size*.08)continue;const counts=new Uint32Array(seeds.length+1);for(const i of body.indices)counts[labels[i]]++;let owner=1;for(let k=2;k<counts.length;k++)if(counts[k]>counts[owner])owner=k;if(counts[owner]<body.pixels*.60)continue;for(const i of body.indices){labels[i]=owner;const x=i%w,y=i/w|0;for(const j of[x?i-1:-1,x+1<w?i+1:-1,y?i-w:-1,y+1<h?i+w:-1])if(j>=0&&art[j])labels[j]=owner;}}
  // Balloon lettering must follow the enclosing body, including black glyphs.
  for(let k=1;k<=seeds.length;k++){
   const gaps=cc(labels.map(v=>v!==k?1:0),w,h);
   for(const gap of gaps.items)if(gap.pixels<120&&gap.box[0]>0&&gap.box[1]>0&&gap.box[2]<w&&gap.box[3]<h)for(const i of gap.indices)labels[i]=k;
  }
  // Discard detached antialiasing specks; retain every substantial island.
  for(let k=1;k<=seeds.length;k++){
   const parts=cc(labels.map(v=>v===k?1:0),w,h);
   for(const part of parts.items)if(part.pixels<24)for(const i of part.indices)labels[i]=0;
  }
  const covered=labels.reduce((s,v)=>s+!!v,0);if(covered<size*.50)return[];const out=[];
  for(let k=0;k<seeds.length;k++){const rings=PanelMatteCells.tracePixelContours(labels,w,h,k+1);if(!rings){if(recover)continue;return[];}const pts=rings.flat(),xs=pts.map(a=>a[0]),ys=pts.map(a=>a[1]),box=[Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)];let pixels=0,sum=0,sq=0;for(let i=0;i<size;i++)if(labels[i]===k+1){pixels++;sum+=lum[i];sq+=lum[i]*lum[i];}const variance=sq/pixels-(sum/pixels)**2;if(variance<180){if(recover)continue;return[];}const proof={version:18,method:METHOD,connected:true,analysisWidth:w,analysisHeight:h,count:seeds.length,index:k,palette:p,exteriorPixels:ext.pixels,coverage:covered/size,seed:{box:seeds[k].box,pixels:seeds[k].pixels,splits:seeds[k].splits||[]},pixelContours:rings,pixels,variance};const panel={x:box[0]/w,y:box[1]/h,w:(box[2]-box[0])/w,h:(box[3]-box[1])/h,_identitySource:'structural-grid-frame',_geometryOwner:'structural-grid-contours',_geometryType:'ragged-gutter-cells',_contours:rings.map(q=>q.map(([x,y])=>({x:x/w,y:y/h}))),_structuralGridProof:proof};if(!recover&&!validPanel(panel))return[];out.push(panel);}
  if(recover){
   const overlap=(a,b)=>Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y))/Math.min(a.w*a.h,b.w*b.h);
   const fill=a=>a._structuralGridProof.pixels/(a.w*a.h*size);
   const clearGutter=(a,gapLimit,flankLimit)=>{
    const k=a._structuralGridProof.index,box=seeds[k].box;
    for(let axis=0;axis<2;axis++){
     const N=axis?box[2]-box[0]:box[3]-box[1],span=axis?box[3]-box[1]:box[2]-box[0],band=Math.max(8,Math.round(N*.055));
     for(let pos=Math.max(band*2,Math.round(N*.12));pos<N-Math.max(band*2,Math.round(N*.12));pos++){
      let gap=0,flank=0;
      for(let t=0;t<span;t++){const i=(axis?box[1]+t:box[1]+pos)*w+(axis?box[0]+pos:box[0]+t),step=axis?1:w;gap+=ext.mask[i];flank+=!!ext.mask[i]&&labels[i-band*step]===k+1&&labels[i+band*step]===k+1;}
      if(gap/span>gapLimit&&flank/span>flankLimit)return false;
     }
    }return true;
   };
   // Reuse this raster and its cells when the established route is empty.
   // Successful v18 maps keep their exact geometry and evidence unchanged.
   const legacyFill=seeds.some(s=>s.splits?.length)?.80:.50;
   if(recover==='fallback'&&out.length===seeds.length&&out.every(a=>validPanel(a)&&fill(a)>=legacyFill&&a.w*a.h<=.65&&clearGutter(a,.42,.28)&&!out.some(b=>a!==b&&overlap(a,b)>.65)))return out;
   // A large set of compact, exclusive cells can contain balloon protrusions.
   // Apply this only after the established detector returned an empty map.
   let mode='coherent-set',kept=out;
   if(out.length<5||out.length!==seeds.length||out.some(a=>fill(a)<.75||a.w*a.h>.65||!clearGutter(a,.42,.28)||out.some(b=>a!==b&&overlap(a,b)>.65))){
    mode='isolated';
    // Ambiguous neighbors do not invalidate an independently enclosed cell.
    // No inferred straight cut is allowed in this partial recovery route.
    kept=out.filter(a=>{
     const v=a._structuralGridProof,b=v.seed.box,seedFill=v.seed.pixels/((b[2]-b[0])*(b[3]-b[1]));
     return !v.seed.splits.length&&a.x*w>=3&&a.y*h>=3&&(a.x+a.w)*w<=w-3&&(a.y+a.h)*h<=h-3&&a.w*a.h<=.48&&fill(a)>=.73&&seedFill>=.68&&clearGutter(a,.20,.12);
    });
    kept=kept.filter(a=>!kept.some(b=>a!==b&&overlap(a,b)>.20));
    if(!kept.length||kept.length===1&&fill(kept[0])<.88)return[];
   }
   for(let k=0;k<kept.length;k++){
    const a=kept[k],v=a._structuralGridProof;v.version=19;v.method=RECOVERY;v.recovery={mode,sourceCount:seeds.length};v.count=kept.length;v.index=k;a._geometryType='independent-exterior-cell';
    if(!validPanel(a))return[];
   }
   log?.('independent exterior cells: '+kept.length+' ('+mode+')');return kept;
  }
  // A component map is publishable only when every owner has a compact frame
  // envelope. Sparse foreground silhouettes and competing overlapping regions
  // are ambiguous and must keep the existing reader fallback.
  for(const a of out){const v=a._structuralGridProof;if(v.pixels/(a.w*a.h*size)<(seeds.some(s=>s.splits?.length)?.80:.50)||a.w*a.h>.65)return[];for(const b of out)if(a!==b){const overlap=Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y));if(overlap/Math.min(a.w*a.h,b.w*b.h)>.65)return[];}}
  for(let k=0;k<out.length;k++){
   const box=seeds[k].box;
   for(let axis=0;axis<2;axis++){
    const N=axis?box[2]-box[0]:box[3]-box[1],span=axis?box[3]-box[1]:box[2]-box[0],band=Math.max(8,Math.round(N*.055));
    for(let pos=Math.max(band*2,Math.round(N*.12));pos<N-Math.max(band*2,Math.round(N*.12));pos++){
     let gap=0,flank=0;
     for(let t=0;t<span;t++){
      const i=(axis?box[1]+t:box[1]+pos)*w+(axis?box[0]+pos:box[0]+t),step=axis?1:w;
      gap+=ext.mask[i];flank+=!!ext.mask[i]&&labels[i-band*step]===k+1&&labels[i+band*step]===k+1;
     }
     if(gap/span>.42&&flank/span>.28){log?.('unresolved interior gutter '+k);return[];}
    }
   }
  }
  log?.('ragged gutter cells: '+out.length);return out;
 }
 function validPanel(p){try{const v=p?._structuralGridProof,w=v?.analysisWidth,h=v?.analysisHeight,recovered=v?.version===19;if(p?._identitySource!=='structural-grid-frame'||(!recovered&&v?.version!==18)||v.method!==(recovered?RECOVERY:METHOD)||v.connected!==true||!Number.isInteger(w)||!Number.isInteger(h)||w<250||h<350||w>900||h>900||!Number.isInteger(v.count)||v.count<(recovered?1:3)||v.count>24||!Number.isInteger(v.index)||v.index<0||v.index>=v.count||!finite(v.coverage)||v.coverage<.5||v.coverage>1||!Number.isInteger(v.exteriorPixels)||v.exteriorPixels<w*h*.04||v.exteriorPixels>w*h*.60||!finite(v.variance)||v.variance<180||v.variance>16257||!Number.isInteger(v.seed?.pixels)||v.seed.pixels<w*h*.012||v.seed.box?.length!==4||v.seed.box.some((a,i)=>!Number.isInteger(a)||a<0||a>(i%2?h:w))||!v.palette?.colors?.length||v.palette.colors.some(c=>c.length!==3||c.some(a=>!finite(a)||a<0||a>255))||v.palette.edgeMatched<v.palette.edgeSamples*.25)return false;if(v.seed.box[2]<=v.seed.box[0]||v.seed.box[3]<=v.seed.box[1]||v.seed.pixels>(v.seed.box[2]-v.seed.box[0])*(v.seed.box[3]-v.seed.box[1])||!Array.isArray(v.seed.splits)||v.seed.splits.length>6||v.seed.splits.some(s=>![0,1].includes(s.axis)||!Number.isInteger(s.pos)||s.pos<0||s.pos>=(s.axis?w:h)||!finite(s.support)||s.support<.62||s.support>1||!finite(s.flank)||s.flank<.40||s.flank>1||!finite(s.score)||Math.abs(s.score-s.support-.1*s.flank)>1e-9)||typeof v.palette.paper!=='boolean'||!Number.isInteger(v.palette.edgeSamples)||v.palette.edgeSamples!==2*Math.ceil(w/2)+2*Math.ceil(h/2)||!Number.isInteger(v.palette.edgeMatched)||v.palette.edgeMatched>v.palette.edgeSamples||v.palette.colors.length>30||!Number.isInteger(v.pixels)||v.pixels>w*h)return false;if(recovered){
   const r=v.recovery,b=v.seed.box,fill=v.pixels/(p.w*p.h*w*h),seedFill=v.seed.pixels/((b[2]-b[0])*(b[3]-b[1]));
   if(!r||!Number.isInteger(r.sourceCount)||r.sourceCount<Math.max(2,v.count)||r.sourceCount>24)return false;
   if(r.mode==='coherent-set'){if(v.count<5||v.count!==r.sourceCount||fill<.75||p.w*p.h>.65)return false;}
   else if(r.mode==='isolated'){if(v.seed.splits.length||p.x*w<3||p.y*h<3||(p.x+p.w)*w>w-3||(p.y+p.h)*h>h-3||p.w*p.h>.48||fill<(v.count===1?.88:.73)||seedFill<.68)return false;}
   else return false;
  }else if(v.recovery)return false;
  const rings=v.pixelContours;if(!Array.isArray(rings)||!rings.length||rings.length>64||rings.some(q=>q.length>4096||q.length<4||q.some(a=>a.length!==2||!Number.isInteger(a[0])||!Number.isInteger(a[1])||a[0]<0||a[1]<0||a[0]>w||a[1]>h))||Math.abs(rings.reduce((s,q)=>s+area(q),0))!==v.pixels||v.pixels<v.seed.pixels||JSON.stringify(p._contours)!==JSON.stringify(rings.map(q=>q.map(([x,y])=>({x:x/w,y:y/h})))))return false;const pts=rings.flat(),xs=pts.map(a=>a[0]),ys=pts.map(a=>a[1]),b=[Math.min(...xs)/w,Math.min(...ys)/h,(Math.max(...xs)-Math.min(...xs))/w,(Math.max(...ys)-Math.min(...ys))/h];return['x','y','w','h'].every((key,i)=>finite(p[key])&&Math.abs(p[key]-b[i])<1e-10);}catch(_){return false;}}
 function analyzeImage(img,log,recover=false){const W=img.naturalWidth||img.width,H=img.naturalHeight||img.height;if(!W||!H||W*H>24000000)return[];const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(img,0,0);const s=Math.min(1,900/Math.max(W,H)),w=Math.round(W*s),h=Math.round(H*s);return analyzeRGBA(PanelMatteCells.sampleBilinearRGBA(g.getImageData(0,0,W,H).data,W,H,w,h),w,h,log,recover);}
 function eligible(baseline){return Array.isArray(baseline)&&baseline.every(p=>p&&!p._identitySource&&!p._quad&&!p._outline&&!p._contours);}
 function completeImage(img,baseline,log){if(!eligible(baseline))return[];const out=analyzeImage(img,log,baseline.length?false:'fallback');return out.length>baseline.length?out:[];}
 return{analyzeRGBA,analyzeRecoveryRGBA:(rgba,w,h,log)=>analyzeRGBA(rgba,w,h,log,true),analyzeImage,completeImage,eligible,validPanel};
})();
if(typeof module!=='undefined')module.exports=PanelRaggedGutters;
