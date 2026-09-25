/* Nth Shelf Test37 — tap-independent structural guillotine grid.
 *
 * Reuses the conservative visual evidence class behind V100, but proves the
 * complete page partition once instead of asking a tap which leaf it wants.
 * Existing stronger identities are retained byte-for-byte when they corroborate
 * one and only one grid cell. Uniform exterior-matte leaves are discarded.
 * No page number, title, filename, hash, tap coordinate or stored crop is used.
 */
const PanelStructuralGrid = (() => {
  'use strict';
  const METHOD='tap-independent-structural-guillotine-grid-v1';
  const OCCLUDED_METHOD='tap-independent-bottom-tier-occluded-seam-v1';
  const finite=Number.isFinite, range=(v,a,b)=>finite(v)&&v>=a&&v<=b;
  const overlap=(a,b)=>Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y));
  function partitionRGBA(rgba,w,h,log){
    if(!(rgba instanceof Uint8Array||rgba instanceof Uint8ClampedArray)||!Number.isInteger(w)||!Number.isInteger(h)||w<120||h<160||w>900||h>900||rgba.length!==w*h*4)return null;
    const lum=new Uint8Array(w*h);for(let i=0;i<lum.length;i++)lum[i]=Math.round(.299*rgba[i*4]+.587*rgba[i*4+1]+.114*rgba[i*4+2]);
    const darkCut=82,rowRun=(y,a,b)=>{let best=0,run=0;for(let x=a;x<=b;x++){if(lum[y*w+x]<=darkCut){run++;best=Math.max(best,run)}else run=0;}return best;},colRun=(x,a,b)=>{let best=0,run=0;for(let y=a;y<=b;y++){if(lum[y*w+x]<=darkCut){run++;best=Math.max(best,run)}else run=0;}return best;};
    let x0=0,x1=w-1,y0=0,y1=h-1;const minHR=Math.round(w*.55),minVR=Math.round(h*.55);
    for(let y=0;y<Math.round(h*.12);y++)if(rowRun(y,0,w-1)>=minHR){y0=y;break;}
    for(let y=h-1;y>Math.round(h*.88);y--)if(rowRun(y,0,w-1)>=minHR){y1=y;break;}
    for(let x=0;x<Math.round(w*.12);x++)if(colRun(x,0,h-1)>=minVR){x0=x;break;}
    for(let x=w-1;x>Math.round(w*.88);x--)if(colRun(x,0,h-1)>=minVR){x1=x;break;}
    const leaves=[],splits=[];
    const split=(a,b,c,d,depth)=>{
      const rw=b-a+1,rh=d-c+1;if(depth>7||rw<w*.075||rh<h*.055){leaves.push([a,c,b,d]);return;}
      let best=null;const sepBand=Math.max(2,Math.min(7,Math.round(Math.min(rw,rh)*.018))),my=Math.max(4,Math.round(rh*.05));
      for(let y=c+my;y<=d-my;y++){
        let dark=0,run=0,bestRun=0,rawDark=0,rawRun=0,rawBestRun=0,sum=0,sq=0;
        for(let x=a;x<=b;x++){let rail=255;for(let yy=Math.max(c,y-sepBand);yy<=Math.min(d,y+sepBand);yy++)rail=Math.min(rail,lum[yy*w+x]);const v=lum[y*w+x];if(rail<=darkCut){dark++;run++;bestRun=Math.max(bestRun,run)}else run=0;if(v<=darkCut){rawDark++;rawRun++;rawBestRun=Math.max(rawBestRun,rawRun)}else rawRun=0;sum+=v;sq+=v*v;}
        const n=rw,mean=sum/n,sd=Math.sqrt(Math.max(0,sq/n-mean*mean)),darkFrac=dark/n,runFrac=bestRun/n,rawDarkFrac=rawDark/n,rawRunFrac=rawBestRun/n,side=sepBand+3;let sa=0,sb=0;for(let x=a;x<=b;x++){sa+=lum[Math.max(c,y-side)*w+x];sb+=lum[Math.min(d,y+side)*w+x];}const contrast=(sa+sb)/(2*n)-mean,straight=rawRunFrac>=.86&&rawDarkFrac>=.70?rawRunFrac+rawDarkFrac:0,drift=runFrac>=.86&&darkFrac>=.68&&rawDarkFrac>=.16?(runFrac+darkFrac)*.90:0,black=Math.max((contrast>=18||mean<=35)?straight:0,(contrast>=30||mean<=35)?drift:0),gutter=sd<=10&&(mean>=165||mean<=150)?(.95+(10-sd)/20):0,score=Math.max(black,gutter);
        if(score>0&&(!best||score>best.score))best={axis:'H',pos:y,score,mode:black>=gutter?'rail':'gutter',rawDarkFrac,rawRunFrac,darkFrac,runFrac,mean,sd,railContrast:contrast};
      }
      const mx=Math.max(4,Math.round(rw*.05));
      for(let x=a+mx;x<=b-mx;x++){
        let dark=0,run=0,bestRun=0,rawDark=0,rawRun=0,rawBestRun=0,sum=0,sq=0;
        for(let y=c;y<=d;y++){let rail=255;for(let xx=Math.max(a,x-sepBand);xx<=Math.min(b,x+sepBand);xx++)rail=Math.min(rail,lum[y*w+xx]);const v=lum[y*w+x];if(rail<=darkCut){dark++;run++;bestRun=Math.max(bestRun,run)}else run=0;if(v<=darkCut){rawDark++;rawRun++;rawBestRun=Math.max(rawBestRun,rawRun)}else rawRun=0;sum+=v;sq+=v*v;}
        const n=rh,mean=sum/n,sd=Math.sqrt(Math.max(0,sq/n-mean*mean)),darkFrac=dark/n,runFrac=bestRun/n,rawDarkFrac=rawDark/n,rawRunFrac=rawBestRun/n,side=sepBand+3;let sa=0,sb=0;for(let y=c;y<=d;y++){sa+=lum[y*w+Math.max(a,x-side)];sb+=lum[y*w+Math.min(b,x+side)];}const contrast=(sa+sb)/(2*n)-mean,straight=rawRunFrac>=.86&&rawDarkFrac>=.70?rawRunFrac+rawDarkFrac:0,drift=runFrac>=.86&&darkFrac>=.68&&rawDarkFrac>=.16?(runFrac+darkFrac)*.90:0,black=Math.max((contrast>=18||mean<=35)?straight:0,(contrast>=30||mean<=35)?drift:0),gutter=sd<=10&&(mean>=165||mean<=150)?(.95+(10-sd)/20):0,score=Math.max(black,gutter);
        if(score>0&&(!best||score>best.score+.03))best={axis:'V',pos:x,score,mode:black>=gutter?'rail':'gutter',rawDarkFrac,rawRunFrac,darkFrac,runFrac,mean,sd,railContrast:contrast};
      }
      if(!best){leaves.push([a,c,b,d]);return;}
      const pad=Math.max(2,Math.round((best.axis==='H'?rh:rw)*.006));
      if(best.axis==='H'){
        if(best.pos-c<rh*.09||d-best.pos<rh*.09){leaves.push([a,c,b,d]);return;}
        splits.push({region:[a,c,b,d],depth,pad,...best});split(a,b,c,Math.max(c,best.pos-pad),depth+1);split(a,b,Math.min(d,best.pos+pad),d,depth+1);
      }else{
        if(best.pos-a<rw*.09||b-best.pos<rw*.09){leaves.push([a,c,b,d]);return;}
        splits.push({region:[a,c,b,d],depth,pad,...best});split(a,Math.max(a,best.pos-pad),c,d,depth+1);split(Math.min(b,best.pos+pad),b,c,d,depth+1);
      }
    };
    split(x0,x1,y0,y1,0);if(splits.length<3||splits.length>18||leaves.length<4||leaves.length>12)return null;
    const statsFor=box=>{const [a,c,b,d]=box,pixels=(b-a+1)*(d-c+1);let sum=0,sq=0,dark=0,light=0;for(let y=c;y<=d;y++)for(let x=a;x<=b;x++){const v=lum[y*w+x];sum+=v;sq+=v*v;dark+=v<65;light+=v>140;}const mean=sum/pixels;return {pixels,mean,variance:sq/pixels-mean*mean,dark,light};};
    const strictScene=st=>st.pixels>=w*h*.018&&range(st.mean,20,235)&&st.variance>=500&&range(st.dark/st.pixels,.02,.94)&&range(st.light/st.pixels,.015,.95);
    const cells=[];for(const box of leaves){const st=statsFor(box);if(strictScene(st))cells.push({box,stats:st});}
    // A narrow vertical panel can contain a nearly full-width dark artwork rail
    // that looks like a horizontal separator. If that split leaves one strict
    // scene child and one substantial dark-but-textured child, while the unsplit
    // parent is itself a strict scene, retract only that orphan split. A real
    // panel boundary must leave two independently viable scene branches.
    const sameBox=(a,b)=>a&&b&&a.length===4&&b.length===4&&a.every((v,i)=>v===b[i]);
    const leafSet=new Set(leaves.map(b=>b.join(',')));
    for(const s of [...splits].sort((a,b)=>b.depth-a.depth)){
      const [a,c,b,d]=s.region,rw=b-a+1,rh=d-c+1;if(s.axis!=='H'||!range(rw/w,.10,.32)||!range(rh/h,.25,.50))continue;
      const A=[a,c,b,Math.max(c,s.pos-s.pad)],B=[a,Math.min(d,s.pos+s.pad),b,d];
      if(!leafSet.has(A.join(','))||!leafSet.has(B.join(',')))continue;
      const ia=cells.findIndex(x=>sameBox(x.box,A)),ib=cells.findIndex(x=>sameBox(x.box,B));if((ia>=0)===(ib>=0))continue;
      const kept=ia>=0?ia:ib,rejected=ia>=0?B:A,rs=statsFor(rejected),ps=statsFor(s.region);
      const darkArtwork=rs.pixels>=w*h*.018&&range(rs.mean,15,235)&&rs.variance>=500&&range(rs.dark/rs.pixels,.02,.98)&&rs.light/rs.pixels<.015;
      if(!darkArtwork||!strictScene(ps))continue;
      cells[kept]={box:s.region.slice(),stats:ps};const at=splits.indexOf(s);if(at>=0)splits.splice(at,1);
      log?.(`structural grid: retracted orphan ${s.axis} split at ${s.pos} inside narrow scene`);
    }
    if(cells.length<4||cells.length>10)return null;const area=cells.reduce((s,c)=>s+c.stats.pixels,0)/(w*h);if(!range(area,.62,.975))return null;
    if(splits.length<cells.length-1||splits.length>cells.length+3)return null;
    log?.(`structural grid: ${cells.length} textured cells from ${splits.length} proved splits; coverage=${area.toFixed(3)}`);
    return {w,h,outer:[x0,y0,x1,y1],cells,splits,coverage:area};
  }
  function validSplit(s,w,h){return s&&['H','V'].includes(s.axis)&&Number.isInteger(s.pos)&&Array.isArray(s.region)&&s.region.length===4&&s.region.every(Number.isInteger)&&Number.isInteger(s.depth)&&range(s.depth,0,7)&&Number.isInteger(s.pad)&&range(s.pad,2,12)&&range(s.score,.95,2.01)&&['rail','gutter'].includes(s.mode)&&range(s.rawDarkFrac,0,1)&&range(s.rawRunFrac,0,1)&&range(s.darkFrac,0,1)&&range(s.runFrac,0,1)&&range(s.mean,0,255)&&range(s.sd,0,128)&&range(s.railContrast,-255,255)&&s.pos>=0&&(s.axis==='H'?s.pos<h:s.pos<w);}
  function validStats(st,pixels){return st&&st.pixels===pixels&&range(st.mean,20,235)&&range(st.variance,500,16257)&&Number.isInteger(st.dark)&&range(st.dark/pixels,.02,.94)&&Number.isInteger(st.light)&&range(st.light/pixels,.015,.95);}
  function validRailMetric(m,kind){if(!m||!Number.isInteger(m.samples)||m.samples<20||!Number.isInteger(m.quiet)||!Number.isInteger(m.both)||!Number.isInteger(m.a)||!Number.isInteger(m.b)||!Number.isInteger(m.maxGap)||!range(m.quiet,0,m.samples)||!range(m.both,0,m.samples)||!range(m.a,0,m.samples)||!range(m.b,0,m.samples)||!range(m.maxGap,0,24))return false;return kind==='v'?m.quiet/m.samples>=.84&&m.both/m.samples>=.54&&m.a/m.samples>=.66&&m.b/m.samples>=.70:m.quiet/m.samples>=.90&&m.both/m.samples>=.64&&m.a/m.samples>=.84&&m.b/m.samples>=.64;}
  function validOccludedPanel(p){try{const pr=p?._structuralGridProof,w=pr?.analysisWidth,h=pr?.analysisHeight;if(p?._identitySource!=='structural-grid-frame'||pr?.version!==2||pr.method!==OCCLUDED_METHOD||pr.connected!==true||!Number.isInteger(w)||!Number.isInteger(h)||!range(w,120,900)||!range(h,160,900)||!['middle','right'].includes(pr.role)||!Array.isArray(pr.anchorSources)||pr.anchorSources.join(',')!=='local-island-frame,local-island-frame,matte-neighbor-frame'||!Number.isInteger(pr.gridCount)||!range(pr.gridCount,6,9)||!range(pr.gridCoverage,.62,.98)||!Array.isArray(pr.leftBox)||pr.leftBox.length!==4||!Array.isArray(pr.mergedBox)||pr.mergedBox.length!==4||pr.leftBox.some(v=>!Number.isInteger(v))||pr.mergedBox.some(v=>!Number.isInteger(v))||!Number.isInteger(pr.seam)||!Number.isInteger(pr.cap)||!Array.isArray(pr.seamBand)||pr.seamBand.length!==2||!Array.isArray(pr.capBand)||pr.capBand.length!==2||pr.seamBand.some(v=>!Number.isInteger(v))||pr.capBand.some(v=>!Number.isInteger(v))||!validRailMetric(pr.vertical,'v')||!validRailMetric(pr.horizontal,'h')||!Number.isInteger(pr.clusterCount)||pr.clusterCount<8)return false;const [lx0,ly0,lx1,ly1]=pr.leftBox,[mx0,my0,mx1,my1]=pr.mergedBox;if(lx0<0||ly0<0||lx1>=w||ly1>=h||mx0<0||my0<0||mx1>=w||my1>=h||Math.abs(ly0-my0)>2||mx0-lx1<2||mx0-lx1>w*.05||lx1-lx0+1<w*.10||lx1-lx0+1>w*.32||mx1-mx0+1<w*.55||mx1<w-2||my1<h-2||!range((pr.seam-mx0)/(lx1-lx0+1),.68,1.38)||!range((pr.cap-my0)/(ly1-ly0+1),.82,1.30)||pr.seamBand[0]>pr.seam||pr.seamBand[1]<pr.seam||pr.capBand[0]>pr.cap||pr.capBand[1]<pr.cap||pr.seamBand[1]-pr.seamBand[0]>24||pr.capBand[1]-pr.capBand[0]>12)return false;
      if(pr.role==='middle'){const box=[mx0,my0,pr.seam,pr.cap],pixels=(box[2]-box[0]+1)*(box[3]-box[1]+1);if(!validStats(pr.stats,pixels)||JSON.stringify(pr.box)!==JSON.stringify(box)||Array.isArray(p._outline))return false;return Math.max(Math.abs(p.x-box[0]/w),Math.abs(p.y-box[1]/h),Math.abs(p.w-(box[2]-box[0]+1)/w),Math.abs(p.h-(box[3]-box[1]+1)/h))<1e-10;}
      const q=[[pr.seam+1,my0],[mx1+1,my0],[mx1+1,my1+1],[mx0,my1+1],[mx0,pr.cap+1],[pr.seam+1,pr.cap+1]],outline=q.map(([x,y])=>({x:x/w,y:y/h}));if(!Array.isArray(p._outline)||JSON.stringify(p._outline)!==JSON.stringify(outline)||JSON.stringify(pr.outline)!==JSON.stringify(q))return false;const x0=mx0,y0=my0,x1=mx1+1,y1=my1+1;if(Math.max(Math.abs(p.x-x0/w),Math.abs(p.y-y0/h),Math.abs(p.w-(x1-x0)/w),Math.abs(p.h-(y1-y0)/h))>1e-10)return false;const mainPixels=(mx1-pr.seam)*(my1-my0+1);return validStats(pr.stats,mainPixels);
    }catch(_){return false;}}
  function validPanel(p){try{const pr=p?._structuralGridProof,w=pr?.analysisWidth,h=pr?.analysisHeight;if(pr?.version===2)return validOccludedPanel(p);if(p?._identitySource!=='structural-grid-frame'||pr?.version!==1||pr.method!==METHOD||pr.connected!==true||!Number.isInteger(w)||!Number.isInteger(h)||!range(w,120,900)||!range(h,160,900)||!Number.isInteger(pr.index)||!Number.isInteger(pr.count)||!range(pr.count,4,10)||!range(pr.index,0,pr.count-1)||!Array.isArray(pr.box)||pr.box.length!==4||pr.box.some(v=>!Number.isInteger(v))||!Array.isArray(pr.splits)||pr.splits.length<pr.count-1||pr.splits.length>pr.count+3||pr.splits.some(s=>!validSplit(s,w,h))||!range(pr.coverage,.62,.975))return false;const [x0,y0,x1,y1]=pr.box,pixels=(x1-x0+1)*(y1-y0+1);if(x0<0||y0<0||x1>=w||y1>=h||x1<=x0||y1<=y0||!validStats(pr.stats,pixels))return false;return ['x','y','w','h'].every(k=>finite(p[k]))&&Math.max(Math.abs(p.x-x0/w),Math.abs(p.y-y0/h),Math.abs(p.w-(x1-x0+1)/w),Math.abs(p.h-(y1-y0+1)/h))<1e-10;}catch(_){return false;}}
  function analyzeRGBA(rgba,w,h,log){const m=partitionRGBA(rgba,w,h,log);if(!m)return[];const proofBase={version:1,method:METHOD,connected:true,analysisWidth:w,analysisHeight:h,count:m.cells.length,outer:m.outer,coverage:m.coverage,splits:m.splits};const out=m.cells.map((c,index)=>({x:c.box[0]/w,y:c.box[1]/h,w:(c.box[2]-c.box[0]+1)/w,h:(c.box[3]-c.box[1]+1)/h,_identitySource:'structural-grid-frame',_geometryType:'orthogonal',_structuralGridProof:{...proofBase,index,box:c.box,stats:c.stats}}));return out.every(validPanel)?out:[];}
  function imageData(img){const W=img.naturalWidth||img.width,H=img.naturalHeight||img.height;if(!W||!H)return null;const s=Math.min(1,900/Math.max(W,H)),w=Math.round(W*s),h=Math.round(H*s),c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d',{willReadFrequently:true});if(!g)return null;g.drawImage(img,0,0,w,h);return {rgba:g.getImageData(0,0,w,h).data,w,h};}
  function analyzeImage(img,log){const d=imageData(img);return d?analyzeRGBA(d.rgba,d.w,d.h,log):[];}

  function luminanceRGBA(rgba,w,h){const out=new Uint8Array(w*h);for(let i=0;i<out.length;i++)out[i]=Math.round(.299*rgba[i*4]+.587*rgba[i*4+1]+.114*rgba[i*4+2]);return out;}
  function railMetricV(lum,w,x,top,cap,left,right,cut){let samples=0,quiet=0,both=0,a=0,b=0,gap=0,maxGap=0;for(let y=top+6;y<=cap-5;y++){let core=255;for(let d=-2;d<=2;d++)core=Math.min(core,lum[y*w+x+d]);let A=0,B=0;for(let d=4;d<=18;d++){A=Math.max(A,lum[y*w+Math.max(left,x-d)]);B=Math.max(B,lum[y*w+Math.min(right,x+d)]);}const yes=core<=cut,aa=A>=core+18,bb=B>=core+18;samples++;quiet+=yes;a+=aa;b+=bb;both+=aa&&bb;gap=yes?0:gap+1;maxGap=Math.max(maxGap,gap);}return {samples,quiet,both,a,b,maxGap};}
  function railMetricH(lum,w,y,left,seam,top,bottom,cut){let samples=0,quiet=0,both=0,a=0,b=0,gap=0,maxGap=0;for(let x=left+6;x<=seam-5;x++){let core=255;for(let d=-2;d<=2;d++)core=Math.min(core,lum[(y+d)*w+x]);let A=0,B=0;for(let d=4;d<=18;d++){A=Math.max(A,lum[Math.max(top,y-d)*w+x]);B=Math.max(B,lum[Math.min(bottom,y+d)*w+x]);}const yes=core<=cut,aa=A>=core+18,bb=B>=core+18;samples++;quiet+=yes;a+=aa;b+=bb;both+=aa&&bb;gap=yes?0:gap+1;maxGap=Math.max(maxGap,gap);}return {samples,quiet,both,a,b,maxGap};}
  function statsRect(lum,w,box){const [x0,y0,x1,y1]=box,pixels=(x1-x0+1)*(y1-y0+1);let sum=0,sq=0,dark=0,light=0;for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const v=lum[y*w+x];sum+=v;sq+=v*v;dark+=v<65;light+=v>140;}const mean=sum/pixels;return {pixels,mean,variance:sq/pixels-mean*mean,dark,light};}
  function occludedTierEvidence(rgba,w,h,grid,anchors,log){
    if(!Array.isArray(grid)||grid.length<6||grid.length>9||!Array.isArray(anchors)||anchors.length!==3)return null;
    const sources=anchors.map(a=>a?._identitySource).sort();if(sources.join(',')!=='local-island-frame,local-island-frame,matte-neighbor-frame')return null;
    const islands=anchors.filter(a=>a._identitySource==='local-island-frame');const neighbour=anchors.find(a=>a._identitySource==='matte-neighbor-frame');
    if(islands.length!==2||typeof PanelLocalIslands==='undefined'||!islands.every(a=>PanelLocalIslands.validPanel?.(a))||!PanelLocalIslands.validNeighbor?.(neighbour))return null;
    const colors=islands.map(a=>a._islandProof?.color);if(colors.some(c=>!Array.isArray(c)||c.length!==3)||JSON.stringify(colors[0])!==JSON.stringify(colors[1]))return null;const base=.299*colors[0][0]+.587*colors[0][1]+.114*colors[0][2];if(base>25)return null;
    const cells=grid.map((p,index)=>({p,index,box:p._structuralGridProof?.box})).filter(c=>Array.isArray(c.box)&&c.box.length===4);if(cells.length!==grid.length)return null;
    let pair=null;for(const leftCell of cells)for(const mergedCell of cells){if(leftCell===mergedCell)continue;const a=leftCell.box,b=mergedCell.box,lw=a[2]-a[0]+1,lh=a[3]-a[1]+1,mw=b[2]-b[0]+1,mh=b[3]-b[1]+1;if(a[0]>w*.04||!range(lw/w,.10,.32)||!range(lh/h,.16,.34)||b[2]<w-2||b[3]<h-2||!range(mw/w,.55,.88)||!range(mh/h,.24,.38)||Math.abs(a[1]-b[1])>2||b[0]-a[2]<2||b[0]-a[2]>w*.05||a[1]<h*.55)continue;const score=a[1]+b[1]+mw;if(!pair||score>pair.score)pair={left:leftCell,merged:mergedCell,score};}if(!pair)return null;
    const owner=new Array(grid.length).fill(null);for(const a of anchors){const matches=[];for(let i=0;i<grid.length;i++){const c=grid[i],ov=overlap(a,c);if(ov/(c.w*c.h)>=.80)matches.push(i);}if(matches.length!==1||owner[matches[0]])return null;owner[matches[0]]=a;}if(owner[pair.left.index]||owner[pair.merged.index])return null;
    const [lx0,ly0,lx1,ly1]=pair.left.box,[mx0,my0,mx1,my1]=pair.merged.box,lw=lx1-lx0+1,lh=ly1-ly0+1,mh=my1-my0+1,lum=luminanceRGBA(rgba,w,h),cut=Math.min(82,Math.max(48,Math.round(base+50)));
    const xLo=Math.max(mx0+12,Math.round(mx0+lw*.68)),xHi=Math.min(mx1-12,Math.round(mx0+lw*1.38)),yLo=Math.max(my0+20,Math.round(my0+lh*.82)),yHi=Math.min(my1-12,Math.round(my0+lh*1.30)),candidates=[];
    for(let x=xLo;x<=xHi;x++)for(let y=yLo;y<=yHi;y++){const v=railMetricV(lum,w,x,my0,y,mx0,mx1,cut),q=railMetricH(lum,w,y,mx0,x,my0,my1,cut);if(!validRailMetric(v,'v')||!validRailMetric(q,'h'))continue;const score=v.quiet/v.samples+.38*v.both/v.samples+q.quiet/q.samples+.38*q.both/q.samples+.08*q.a/q.samples+.05*v.b/v.samples-.004*(v.maxGap+q.maxGap);candidates.push({x,y,score,vertical:v,horizontal:q});}
    if(!candidates.length)return null;candidates.sort((a,b)=>b.score-a.score);const best=candidates[0],cluster=candidates.filter(c=>Math.abs(c.x-best.x)<=12&&Math.abs(c.y-best.y)<=8&&c.score>=best.score-.17);if(cluster.length<8)return null;const other=candidates.find(c=>Math.abs(c.x-best.x)>18||Math.abs(c.y-best.y)>14);if(other&&other.score>best.score-.08)return null;const seamBand=[Math.min(...cluster.map(c=>c.x)),Math.max(...cluster.map(c=>c.x))],capBand=[Math.min(...cluster.map(c=>c.y)),Math.max(...cluster.map(c=>c.y))],seam=best.x,cap=best.y,vertical=railMetricV(lum,w,seam,my0,cap,mx0,mx1,cut),horizontal=railMetricH(lum,w,cap,mx0,seam,my0,my1,cut);if(!validRailMetric(vertical,'v')||!validRailMetric(horizontal,'h')||!range((seam-mx0)/lw,.68,1.38)||!range((cap-my0)/lh,.82,1.30))return null;
    const middleBox=[mx0,my0,seam,cap],middleStats=statsRect(lum,w,middleBox),rightMain=[seam+1,my0,mx1,my1],rightStats=statsRect(lum,w,rightMain);if(!validStats(middleStats,middleStats.pixels)||!validStats(rightStats,rightStats.pixels))return null;
    log?.(`occluded bottom tier: left=${JSON.stringify(pair.left.box)} merged=${JSON.stringify(pair.merged.box)} seam=${seamBand.join('-')} cap=${capBand.join('-')} cluster=${cluster.length}`);
    return {owner,pair,seam,cap,seamBand,capBand,vertical,horizontal,clusterCount:cluster.length,cut,middleStats,rightStats,gridCoverage:grid[0]._structuralGridProof?.coverage};
  }
  function completeOccludedTierImage(img,anchors,log){const d=imageData(img);if(!d)return[];const grid=analyzeRGBA(d.rgba,d.w,d.h,log),ev=occludedTierEvidence(d.rgba,d.w,d.h,grid,anchors,log);if(!ev)return[];const {w,h}=d,[mx0,my0,mx1,my1]=ev.pair.merged.box,proof={version:2,method:OCCLUDED_METHOD,connected:true,analysisWidth:w,analysisHeight:h,anchorSources:anchors.map(a=>a._identitySource).sort(),gridCount:grid.length,gridCoverage:ev.gridCoverage,leftBox:ev.pair.left.box,mergedBox:ev.pair.merged.box,seam:ev.seam,cap:ev.cap,seamBand:ev.seamBand,capBand:ev.capBand,vertical:ev.vertical,horizontal:ev.horizontal,clusterCount:ev.clusterCount,cut:ev.cut};
    const middle={x:mx0/w,y:my0/h,w:(ev.seam-mx0+1)/w,h:(ev.cap-my0+1)/h,_identitySource:'structural-grid-frame',_geometryType:'orthogonal',_structuralGridProof:{...proof,role:'middle',box:[mx0,my0,ev.seam,ev.cap],stats:ev.middleStats}};
    const q=[[ev.seam+1,my0],[mx1+1,my0],[mx1+1,my1+1],[mx0,my1+1],[mx0,ev.cap+1],[ev.seam+1,ev.cap+1]],outline=q.map(([x,y])=>({x:x/w,y:y/h}));const right={x:mx0/w,y:my0/h,w:(mx1+1-mx0)/w,h:(my1+1-my0)/h,_identitySource:'structural-grid-frame',_geometryType:'occluded-tier-outline',_geometryOwner:'structural-grid-outline',_outline:outline,_structuralGridProof:{...proof,role:'right',outline:q,stats:ev.rightStats}};if(!validPanel(middle)||!validPanel(right))return[];
    const out=[];for(let i=0;i<grid.length;i++){if(ev.owner[i])out.push(ev.owner[i]);else if(i===ev.pair.merged.index)out.push(middle,right);else out.push(grid[i]);}log?.(`occluded structural completion: 3 anchors + ${out.length-3} proved cells = ${out.length}`);return out;
  }
  function completeNestedImage(img,baseline,log){
    if(!Array.isArray(baseline)||baseline.length!==2||baseline.some(p=>!p||p._identitySource||p._quad||p._outline||p._contours||!['x','y','w','h'].every(k=>finite(p[k]))))return[];
    const slabs=[...baseline].sort((a,b)=>a.y-b.y);
    if(slabs.some(p=>p.x>.04||p.x+p.w<.94||!range(p.w,.88,1)||!range(p.h,.20,.62))||slabs[0].y>.03||slabs[1].y+slabs[1].h<.94||!range(slabs[1].y-(slabs[0].y+slabs[0].h),.008,.08))return[];
    const grid=analyzeImage(img,log);if(grid.length!==6||!grid.every(validPanel))return[];
    const groups=slabs.map(()=>[]);
    for(const cell of grid){const cy=cell.y+cell.h/2,matches=slabs.map((s,i)=>cy>=s.y-.02&&cy<=s.y+s.h+.02?i:-1).filter(i=>i>=0);if(matches.length!==1)return[];groups[matches[0]].push(cell);}
    if(groups[0].length!==2||groups[1].length!==4)return[];
    const top=[...groups[0]].sort((a,b)=>a.x-b.x);if(top.some(c=>c.y>.025||c.y+c.h<slabs[0].y+slabs[0].h-.035)||top[0].x>.04||top[1].x+top[1].w<.96||top[1].x-(top[0].x+top[0].w)>.035)return[];
    const lower=[...groups[1]].sort((a,b)=>a.y-b.y||a.x-b.x),strip=lower[0],bottom=lower.slice(1).sort((a,b)=>a.x-b.x);
    if(strip.w<.88||!range(strip.h,.07,.24)||strip.y>slabs[1].y+.04||bottom.length!==3||bottom.some(c=>c.y<strip.y+strip.h-.025||c.y+c.h<slabs[1].y+slabs[1].h-.035)||bottom[0].x>.04||bottom[2].x+bottom[2].w<.96)return[];
    for(let i=1;i<bottom.length;i++)if(bottom[i].x-(bottom[i-1].x+bottom[i-1].w)>.035)return[];
    const bandCoverage=(slab,cells)=>cells.reduce((sum,c)=>sum+overlap(slab,c),0)/(slab.w*slab.h);if(bandCoverage(slabs[0],top)<.84||bandCoverage(slabs[1],[strip,...bottom])<.82)return[];
    log?.('nested structural completion: two coarse slabs -> 2 top + 1 strip + 3 bottom cells');return grid;
  }
  function completeImage(img,anchors,log){
    if(!Array.isArray(anchors)||anchors.length!==2||anchors.some(a=>!a||!a._identitySource||!['x','y','w','h'].every(k=>finite(a[k]))))return[];
    const rims=anchors.filter(a=>a._identitySource==='rim-frame'&&typeof PanelRimFrames!=='undefined'&&PanelRimFrames.validPanel?.(a));
    const bleeds=anchors.filter(a=>a._identitySource==='bleed-strip-frame'&&typeof PanelAbuttingFrames!=='undefined'&&PanelAbuttingFrames.validBleedStrip?.(a));
    if(rims.length!==1||bleeds.length!==1)return[];
    const grid=analyzeImage(img,log);if(grid.length<4)return[];const owner=new Array(grid.length).fill(null);
    for(const a of anchors){const matches=[];for(let i=0;i<grid.length;i++){const c=grid[i],ov=overlap(a,c);if(ov/(c.w*c.h)>=.80)matches.push(i);}if(matches.length!==1||owner[matches[0]])return[];owner[matches[0]]=a;}
    const additions=owner.filter(x=>!x).length;if(additions<2)return[];const merged=grid.map((c,i)=>owner[i]||c);
    log?.(`structural grid completion: 2 perimeter anchors + ${additions} proved cells = ${merged.length}`);return merged;
  }
  return {analyzeRGBA,analyzeImage,completeImage,completeNestedImage,completeOccludedTierImage,validPanel};
})();
if(typeof window!=='undefined')window.PanelStructuralGrid=PanelStructuralGrid;
if(typeof module!=='undefined'&&module.exports)module.exports=PanelStructuralGrid;
