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
  const INSET_TRIPLET_METHOD='tap-independent-framed-inset-triplet-v1';
  const COLUMN_BANK_METHOD='tap-independent-five-column-bank-over-terminal-strip-v1';
  const BRANCHED_STACK_METHOD='tap-independent-branched-stack-curved-seam-v1';
  const STEPPED_SHARED_METHOD='tap-independent-stepped-inset-shared-seam-v1';
  const STEPPED_SHARED_V2_METHOD='tap-independent-stepped-inset-shared-seam-v2';
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
  function validInsetTripletPanel(p){try{
    const pr=p?._structuralGridProof,w=pr?.analysisWidth,h=pr?.analysisHeight;
    if(p?._identitySource!=='structural-grid-frame'||pr?.version!==3||pr.method!==INSET_TRIPLET_METHOD||pr.connected!==true||!Number.isInteger(w)||!Number.isInteger(h)||!range(w,120,900)||!range(h,160,900)||!['left','inset','right'].includes(pr.role)||!Number.isInteger(pr.baselineCount)||!range(pr.baselineCount,5,10)||!Number.isInteger(pr.upperCount)||pr.upperCount!==pr.baselineCount-2)return false;
    const pb=pr.parentBox,ib=pr.insetBox;if(!Array.isArray(pb)||pb.length!==4||!Array.isArray(ib)||ib.length!==4||pb.some(v=>!Number.isInteger(v))||ib.some(v=>!Number.isInteger(v)))return false;
    const [x0,y0,x1,y1]=pb,[xL,yT,xR,yB]=ib,pw=x1-x0,ph=y1-y0,iw=xR-xL,ih=yB-yT;
    if(x0<0||y0<0||x1>w||y1>h||x1<=x0||y1<=y0||xL<=x0||xR>=x1||yT<=y0||yB>=y1||!range(pw/w,.55,.80)||!range(ph/h,.30,.55)||!range(iw/pw,.10,.25)||!range(ih/ph,.55,.86)||!range((xL-x0)/pw,.20,.48)||!range((x1-xR)/pw,.28,.62)||!range((yT-y0)/ph,.025,.22)||!range((y1-yB)/ph,.025,.24))return false;
    if(!Array.isArray(pr.verticalEdges)||pr.verticalEdges.length!==2||pr.verticalEdges.some((e,i)=>!e||!Number.isInteger(e.x)||e.x!==[xL-1,xR-1][i]||!Number.isInteger(e.start)||!Number.isInteger(e.end)||e.start<y0||e.end>y1||e.end<=e.start||!Number.isInteger(e.hits)||!Number.isInteger(e.length)||e.length!==e.end-e.start+1||e.hits>e.length||!range(e.coverage,.90,1)||Math.abs(e.coverage-e.hits/e.length)>1e-10||e.length<ph*.50||!Number.isInteger(e.maxGap)||!range(e.maxGap,0,5)))return false;
    if(!Array.isArray(pr.caps)||pr.caps.length!==2||pr.caps.some((c,i)=>!c||!Number.isInteger(c.y)||c.y!==[yT-1,yB-1][i]||!range(c.support,.60,1)||!Number.isInteger(c.samples)||c.samples!==Math.max(1,xR-xL-4)||!Number.isInteger(c.matched)||Math.abs(c.support-c.matched/c.samples)>1e-10))return false;
    if(pr.edgeThreshold!==25||pr.maxGap!==5||!Number.isInteger(pr.edgeSeparation)||pr.edgeSeparation!==xR-xL||!pr.parent||!['x','y','w','h'].every(k=>finite(pr.parent[k])))return false;
    const expected={left:[[x0,y0],[xL,y0],[xL,yB],[xR,yB],[xR,y1],[x0,y1]],inset:[[xL,yT],[xR,yT],[xR,yB],[xL,yB]],right:[[xL,y0],[x1,y0],[x1,y1],[xR,y1],[xR,yT],[xL,yT]]}[pr.role];
    if(!Array.isArray(pr.pixelOutline)||JSON.stringify(pr.pixelOutline)!==JSON.stringify(expected)||!Array.isArray(p._outline)||JSON.stringify(p._outline)!==JSON.stringify(expected.map(([x,y])=>({x:x/w,y:y/h}))))return false;
    const area=q=>Math.abs(q.reduce((sum,a,i)=>{const b=q[(i+1)%q.length];return sum+a[0]*b[1]-a[1]*b[0];},0)/2),pixels=area(expected),st=pr.stats;
    if(!Number.isInteger(st?.pixels)||st.pixels!==pixels||!range(st.mean,15,235)||!range(st.variance,450,16257)||!Number.isInteger(st.dark)||!range(st.dark/pixels,.015,.97)||!Number.isInteger(st.light)||!range(st.light/pixels,.005,.97))return false;
    const xs=expected.map(q=>q[0]),ys=expected.map(q=>q[1]),bx0=Math.min(...xs),by0=Math.min(...ys),bx1=Math.max(...xs),by1=Math.max(...ys);
    return ['x','y','w','h'].every(k=>finite(p[k]))&&Math.max(Math.abs(p.x-bx0/w),Math.abs(p.y-by0/h),Math.abs(p.w-(bx1-bx0)/w),Math.abs(p.h-(by1-by0)/h))<1e-10;
  }catch(_){return false;}}
  function validColumnBankPanel(p){try{
    const pr=p?._structuralGridProof,w=pr?.analysisWidth,h=pr?.analysisHeight;if(p?._identitySource!=='structural-grid-frame'||pr?.version!==4||pr.method!==COLUMN_BANK_METHOD||pr.connected!==true||!Number.isInteger(w)||!Number.isInteger(h)||!range(w,120,900)||!range(h,160,900)||pr.baselineCount!==3||!Number.isInteger(pr.index)||!range(pr.index,0,5)||pr.count!==6||!Array.isArray(pr.bankBox)||pr.bankBox.length!==4||!Array.isArray(pr.terminalBox)||pr.terminalBox.length!==4||!Array.isArray(pr.box)||pr.box.length!==4||pr.bankBox.some(v=>!Number.isInteger(v))||pr.terminalBox.some(v=>!Number.isInteger(v))||pr.box.some(v=>!Number.isInteger(v))||!Array.isArray(pr.separators)||pr.separators.length!==4)return false;
    const [bx0,by0,bx1,by1]=pr.bankBox,[tx0,ty0,tx1,ty1]=pr.terminalBox;if(bx0<0||by0<0||bx1>=w||by1>=h||tx0<0||ty0<0||tx1>=w||ty1>=h||bx1<=bx0||by1<=by0||tx1<=tx0||ty1<=ty0||!range((bx1-bx0+1)/w,.88,1)||!range((by1-by0+1)/h,.22,.42)||!range((tx1-tx0+1)/w,.88,1)||!range((ty1-ty0+1)/h,.15,.32)||!range((ty0-by1)/h,.002,.04)||Math.abs(bx0-tx0)>w*.04||Math.abs(bx1-tx1)>w*.04)return false;
    let prev=bx0,widths=[];for(const r of pr.separators){if(!r||!Number.isInteger(r.lo)||!Number.isInteger(r.hi)||!Number.isInteger(r.x)||r.lo>r.x||r.x>r.hi||r.lo<=prev||r.hi>=bx1||!Number.isInteger(r.samples)||r.samples!==by1-by0+1||!Number.isInteger(r.dark)||!Number.isInteger(r.maxRun)||!Number.isInteger(r.left)||!Number.isInteger(r.right)||!Number.isInteger(r.both)||!range(r.dark/r.samples,.78,1)||!range(r.maxRun/r.samples,.55,1)||!range(r.left/r.samples,.55,1)||!range(r.right/r.samples,.70,1)||!range(r.both/r.samples,.50,1))return false;widths.push(r.lo-prev);prev=r.hi+1;}widths.push(bx1-prev+1);if(widths.some(v=>v<w*.08||v>w*.31)||Math.max(...widths)/Math.min(...widths)>2.15)return false;
    const [x0,y0,x1,y1]=pr.box,pixels=(x1-x0+1)*(y1-y0+1);if(x0<0||y0<0||x1>=w||y1>=h||x1<=x0||y1<=y0||!validStats(pr.stats,pixels))return false;let expected;if(pr.index<5){const L=pr.index?pr.separators[pr.index-1].hi+1:bx0,R=pr.index<4?pr.separators[pr.index].lo-1:bx1;expected=[L,by0,R,by1];}else expected=[tx0,ty0,tx1,ty1];if(JSON.stringify(pr.box)!==JSON.stringify(expected))return false;return Math.max(Math.abs(p.x-x0/w),Math.abs(p.y-y0/h),Math.abs(p.w-(x1-x0+1)/w),Math.abs(p.h-(y1-y0+1)/h))<1e-10;
  }catch(_){return false;}}
  function validBranchMetric(m,kind){if(!m||!Number.isInteger(m.lo)||!Number.isInteger(m.hi)||m.hi<m.lo||!Number.isInteger(m.center)||m.center<m.lo||m.center>m.hi||!Number.isInteger(m.samples)||m.samples<40||!Number.isFinite(m.meanDark)||!Number.isFinite(m.maxDark)||!range(m.meanDark,0,1)||!range(m.maxDark,0,1))return false;return kind==='major'?m.meanDark>=.84&&m.maxDark>=.90:m.meanDark>=.80&&m.maxDark>=.88;}
  function validBranchedStackPanel(p){try{
    const pr=p?._structuralGridProof,w=pr?.analysisWidth,h=pr?.analysisHeight;if(p?._identitySource!=='structural-grid-frame'||pr?.version!==5||pr.method!==BRANCHED_STACK_METHOD||pr.connected!==true||pr.baselineCount!==4||!Number.isInteger(w)||!Number.isInteger(h)||!range(w,120,900)||!range(h,160,900)||!Number.isInteger(pr.index)||!range(pr.index,0,6)||pr.count!==7)return false;
    const pb=pr.pageBox;if(!Array.isArray(pb)||pb.length!==4||pb.some(v=>!Number.isInteger(v)))return false;const [x0,y0,x1,y1]=pb;if(x0<0||y0<0||x1>=w||y1>=h||x1<=x0||y1<=y0||!range((x1-x0+1)/w,.88,1)||!range((y1-y0+1)/h,.90,1))return false;
    const rails=pr.rails;if(!rails||!validBranchMetric(rails.mainSpine,'major')||!validBranchMetric(rails.rightSplit,'major')||!validBranchMetric(rails.rightMid,'major')||!validBranchMetric(rails.topBottom,'major')||!validBranchMetric(rails.terminalTop,'major'))return false;
    const xa=rails.mainSpine,xb=rails.rightSplit,yb=rails.rightMid,ya=rails.topBottom,yd=rails.terminalTop;if(!range((xa.center-x0)/(x1-x0),.38,.62)||!range((xb.center-xa.center)/(x1-x0),.18,.40)||!range((yb.center-y0)/(ya.center-y0),.40,.72)||!range((ya.center-y0)/(y1-y0),.42,.62)||!range((yd.center-y0)/(y1-y0),.73,.88))return false;
    const seam=pr.seam;if(!Array.isArray(seam)||seam.length<6||seam.length>48||seam.some(q=>!Array.isArray(q)||q.length!==2||q.some(v=>!Number.isInteger(v))))return false;if(seam[0][0]!==x0||seam.at(-1)[0]!==x1||seam.some((q,i)=>i&&q[0]<=seam[i-1][0])||seam.some(q=>q[1]<=ya.hi||q[1]>=yd.lo))return false;if(!Number.isFinite(pr.seamMeanScore)||pr.seamMeanScore<90||!Number.isInteger(pr.seamStart)||!Number.isInteger(pr.seamEnd)||Math.abs(pr.seamStart-seam[0][1])>1||Math.abs(pr.seamEnd-seam.at(-1)[1])>1||!range((pr.seamStart-pr.seamEnd)/h,.03,.16))return false;
    const rect=(a,b,c,d)=>[[a,b],[c+1,b],[c+1,d+1],[a,d+1]],path=seam.map(q=>q.slice()),rev=[...path].reverse();const expected=[rect(x0,y0,xa.lo-1,ya.lo-1),rect(xa.hi+1,y0,xb.lo-1,yb.lo-1),rect(xb.hi+1,y0,x1,yb.lo-1),rect(xa.hi+1,yb.hi+1,x1,ya.lo-1),[[x0,ya.hi+1],[x1+1,ya.hi+1],...rev.map(([x,y])=>[x+1,y])],[...path,[x1+1,yd.lo],[x0,yd.lo]],rect(x0,yd.hi+1,x1,y1)];
    const q=expected[pr.index];if(!q||!Array.isArray(pr.pixelOutline)||JSON.stringify(pr.pixelOutline)!==JSON.stringify(q)||!Array.isArray(p._outline)||JSON.stringify(p._outline)!==JSON.stringify(q.map(([x,y])=>({x:x/w,y:y/h}))))return false;
    const st=pr.stats;if(!Number.isInteger(st?.pixels)||st.pixels<1||!range(st.mean,15,235)||!range(st.variance,450,16257)||!Number.isInteger(st.dark)||!Number.isInteger(st.light)||!range(st.dark/st.pixels,.01,.98)||!range(st.light/st.pixels,.005,.97))return false;const xs=q.map(v=>v[0]),ys=q.map(v=>v[1]),bx0=Math.min(...xs),by0=Math.min(...ys),bx1=Math.max(...xs),by1=Math.max(...ys);return Math.max(Math.abs(p.x-bx0/w),Math.abs(p.y-by0/h),Math.abs(p.w-(bx1-bx0)/w),Math.abs(p.h-(by1-by0)/h))<1e-10;
  }catch(_){return false;}}
  function validSteppedSharedV2Panel(p){try{
    const pr=p?._structuralGridProof,w=pr?.analysisWidth,h=pr?.analysisHeight;if(p?._identitySource!=='structural-grid-frame'||pr?.version!==7||pr.method!==STEPPED_SHARED_V2_METHOD||pr.connected!==true||pr.baselineCount!==7||pr.count!==6||!Number.isInteger(w)||!Number.isInteger(h)||!range(w,250,900)||!range(h,350,900)||!Number.isInteger(pr.index)||!range(pr.index,0,5))return false;
    if(!Array.isArray(pr.anchorBoxes)||pr.anchorBoxes.length!==7||pr.anchorBoxes.some(b=>!Array.isArray(b)||b.length!==4||b.some(v=>!Number.isInteger(v))))return false;
    if(!Array.isArray(pr.refinedQuads)||pr.refinedQuads.length!==5||pr.refinedQuads.some(q=>!Array.isArray(q)||q.length!==4||q.some(a=>!Array.isArray(a)||a.length!==2||a.some(v=>!Number.isInteger(v)))))return false;
    const rail=pr.stepRail;if(!rail||!Number.isInteger(rail.x)||!Number.isInteger(rail.lo)||!Number.isInteger(rail.hi)||rail.lo>rail.x||rail.x>rail.hi||!Number.isInteger(rail.samples)||rail.samples<40||!Number.isInteger(rail.dark)||!Number.isInteger(rail.maxRun)||!Number.isInteger(rail.both)||!range(rail.dark/rail.samples,.72,1)||!range(rail.maxRun/rail.samples,.55,1)||!range(rail.both/rail.samples,.18,1))return false;
    if(!Array.isArray(pr.outlines)||pr.outlines.length!==6||pr.outlines.some(q=>!Array.isArray(q)||q.length<4||q.length>16||q.some(a=>!Array.isArray(a)||a.length!==2||a.some(v=>!Number.isInteger(v)))))return false;
    const q=pr.outlines[pr.index];if(JSON.stringify(pr.pixelOutline)!==JSON.stringify(q)||!Array.isArray(p._outline)||JSON.stringify(p._outline)!==JSON.stringify(q.map(([x,y])=>({x:x/w,y:y/h}))))return false;
    const st=pr.stats;if(!Number.isInteger(st?.pixels)||st.pixels<1||!range(st.mean,15,235)||!range(st.variance,450,16257)||!Number.isInteger(st.dark)||!Number.isInteger(st.light)||!range(st.dark/st.pixels,.005,.99)||!range(st.light/st.pixels,.002,.98))return false;
    const b=pr.anchorBoxes,ww=x=>x[2]-x[0]+1,hh=x=>x[3]-x[1]+1;if(!range(ww(b[0])/w,.35,.58)||!range(ww(b[1])/w,.35,.58)||!range(ww(b[2])/w,.35,.60)||!range(hh(b[2])/h,.11,.23)||!range(ww(b[3])/w,.18,.38)||!range(ww(b[4])/w,.55,.78)||!range(ww(b[5])/w,.15,.34)||!range(ww(b[6])/w,.55,.78))return false;
    const xs=q.map(v=>v[0]),ys=q.map(v=>v[1]),x0=Math.min(...xs),y0=Math.min(...ys),x1=Math.max(...xs),y1=Math.max(...ys);return ['x','y','w','h'].every(k=>finite(p[k]))&&Math.max(Math.abs(p.x-x0/w),Math.abs(p.y-y0/h),Math.abs(p.w-(x1-x0)/w),Math.abs(p.h-(y1-y0)/h))<1e-10;
  }catch(_){return false;}}
  function validSteppedSharedPanel(p){try{
    const pr=p?._structuralGridProof,w=pr?.analysisWidth,h=pr?.analysisHeight;if(p?._identitySource!=='structural-grid-frame'||pr?.version!==6||pr.method!==STEPPED_SHARED_METHOD||pr.connected!==true||pr.baselineCount!==7||pr.count!==6||!Number.isInteger(w)||!Number.isInteger(h)||!range(w,250,900)||!range(h,350,900)||!Number.isInteger(pr.index)||!range(pr.index,0,5))return false;
    if(!Array.isArray(pr.anchorBoxes)||pr.anchorBoxes.length!==7||pr.anchorBoxes.some(b=>!Array.isArray(b)||b.length!==4||b.some(v=>!Number.isInteger(v))))return false;
    const b=pr.anchorBoxes,ww=x=>x[2]-x[0]+1,hh=x=>x[3]-x[1]+1;
    if(!range(ww(b[0])/w,.35,.58)||!range(ww(b[1])/w,.35,.58)||!range(ww(b[2])/w,.35,.60)||!range(hh(b[2])/h,.11,.23)||!range(ww(b[3])/w,.18,.38)||!range(ww(b[4])/w,.55,.78)||!range(ww(b[5])/w,.15,.34)||!range(ww(b[6])/w,.55,.78))return false;
    if(!(b[0][1]<h*.08&&b[1][1]<h*.08&&range(b[2][1]/h,.20,.32)&&range(b[3][1]/h,.31,.40)&&range(b[4][1]/h,.31,.40)&&b[5][1]>h*.52&&b[6][1]>h*.55))return false;
    if(!Array.isArray(pr.refinedQuads)||pr.refinedQuads.length!==5||pr.refinedQuads.some(q=>!Array.isArray(q)||q.length!==4||q.some(a=>!Array.isArray(a)||a.length!==2||a.some(v=>!Number.isInteger(v)))))return false;
    if(!Array.isArray(pr.seam)||pr.seam.length<2||pr.seam.length>64||pr.seam.some(q=>!Array.isArray(q)||q.length!==2||q.some(v=>!Number.isInteger(v)))||pr.seam.some((q,i)=>i&&q[0]<=pr.seam[i-1][0]))return false;
    if(!Number.isFinite(pr.seamMeanScore)||pr.seamMeanScore<65||!Number.isInteger(pr.seamStartGuess)||!Number.isInteger(pr.seamEndGuess)||Math.abs(pr.seam[0][1]-pr.seamStartGuess)>28||Math.abs(pr.seam.at(-1)[1]-pr.seamEndGuess)>28||!range((pr.seam.at(-1)[1]-pr.seam[0][1])/h,.08,.22)||!Number.isInteger(pr.splitX)||pr.splitX<=pr.seam[0][0]||pr.splitX>=pr.seam.at(-1)[0])return false;
    if(!Array.isArray(pr.outlines)||pr.outlines.length!==6||pr.outlines.some(q=>!Array.isArray(q)||q.length<4||q.length>72||q.some(a=>!Array.isArray(a)||a.length!==2||a.some(v=>!Number.isInteger(v)))))return false;
    const q=pr.outlines[pr.index];if(JSON.stringify(pr.pixelOutline)!==JSON.stringify(q)||!Array.isArray(p._outline)||JSON.stringify(p._outline)!==JSON.stringify(q.map(([x,y])=>({x:x/w,y:y/h}))))return false;
    const st=pr.stats;if(!Number.isInteger(st?.pixels)||st.pixels<1||!range(st.mean,15,235)||!range(st.variance,450,16257)||!Number.isInteger(st.dark)||!Number.isInteger(st.light)||!range(st.dark/st.pixels,.005,.99)||!range(st.light/st.pixels,.002,.98))return false;
    const xs=q.map(v=>v[0]),ys=q.map(v=>v[1]),x0=Math.min(...xs),y0=Math.min(...ys),x1=Math.max(...xs),y1=Math.max(...ys);return ['x','y','w','h'].every(k=>finite(p[k]))&&Math.max(Math.abs(p.x-x0/w),Math.abs(p.y-y0/h),Math.abs(p.w-(x1-x0)/w),Math.abs(p.h-(y1-y0)/h))<1e-10;
  }catch(_){return false;}}
  // Complete an inset/foreground page from two independent perimeter anchors.
  // Matte cells propose regions; their variable count never decides ownership.
  // Preserve both anchors. Visible silhouettes supply the shared inset seam,
  // and the lower cell's convex exposed rim fills dark interior art without
  // borrowing the neighboring shower panel.
  const WITNESSED_METHOD='two-anchor-stepped-foreground-completion';
  const polyArea=q=>Math.abs(q.reduce((s,p,i)=>{const b=q[(i+1)%q.length];return s+p[0]*b[1]-p[1]*b[0];},0))/2;
  function convexRim(points){
    const ps=[...new Map(points.map(p=>[p.join(','),p])).values()].sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
    const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]),half=ps=>{const out=[];for(const p of ps){while(out.length>1&&cross(out.at(-2),out.at(-1),p)<=0)out.pop();out.push(p);}return out;};
    return half(ps).slice(0,-1).concat(half([...ps].reverse()).slice(0,-1));
  }
  function rasterBottom(rings,w,h){
    const bottom=new Map();
    for(let y=0;y<h;y++){
      const xs=[];for(const q of rings)for(let i=0,j=q.length-1;i<q.length;j=i++){
        const a=q[i],b=q[j];if((a[1]>y+.5)!==(b[1]>y+.5))xs.push(a[0]+(y+.5-a[1])*(b[0]-a[0])/(b[1]-a[1]));
      }
      xs.sort((a,b)=>a-b);for(let k=0;k+1<xs.length;k+=2)for(let x=Math.max(0,Math.ceil(xs[k]-.5));x<Math.min(w,xs[k+1]-.5);x++)bottom.set(x,y+1);
    }return bottom;
  }
  function upperChain(q){
    const left=q.reduce((a,b)=>b[1]<a[1]||b[1]===a[1]&&b[0]<a[0]?b:a),maxX=Math.max(...q.map(p=>p[0]));
    const start=q.indexOf(left),out=[];for(let i=0;i<q.length;i++){const p=q[(start+i)%q.length],prev=out.at(-1);if(prev&&prev[0]-left[0]>(maxX-left[0])*.5&&p[1]-prev[1]>Math.max(8,(p[0]-prev[0])*1.25))break;out.push(p.slice());if(p[0]===maxX)break;}return out;
  }
  function rimEvidence(lum,w,h,q){
    let samples=0,dark=0;for(let k=0;k<q.length;k++){const a=q[k],b=q[(k+1)%q.length],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1]));for(let i=0;i<n;i++){
      const x=Math.round(a[0]+(b[0]-a[0])*i/n),y=Math.round(a[1]+(b[1]-a[1])*i/n);let v=255;
      for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)if(x+dx>=0&&x+dx<w&&y+dy>=0&&y+dy<h)v=Math.min(v,lum[(y+dy)*w+x+dx]);
      samples++;dark+=v<60;
    }}return {samples,dark};
  }
  function witnessedOutlines(pr){
    const {left,top,right,step,insetTop,middleTop,insetRight,lowerLeft,lowerRight,profile,bottomRim}=pr.geometry;
    const topLeft=[[left,top],[right,top],[right,insetTop],[step,insetTop],[step,middleTop],[left,middleTop]];
    const sheriff=[[step,insetTop],[insetRight,insetTop],...profile.slice().reverse()];
    const middle=[[left,middleTop],[step,middleTop],...profile,[pr.geometry.outerRight,profile.at(-1)[1]],[pr.geometry.outerRight,lowerRight.at(-1)[1]],...lowerRight.slice().reverse(),...lowerLeft.slice().reverse(),[left,lowerLeft[0][1]]];
    const clean=q=>q.filter((p,i)=>!i||p[0]!==q[i-1][0]||p[1]!==q[i-1][1]);
    return [topLeft,sheriff,middle,bottomRim].map(clean);
  }
  function validWitnessedPanel(panel){try{
    const pr=panel?._structuralGridProof,w=pr?.analysisWidth,h=pr?.analysisHeight,g=pr?.geometry;
    if(panel?._identitySource!=='structural-grid-frame'||pr?.version!==8||pr.method!==WITNESSED_METHOD||pr.connected!==true||!Number.isInteger(w)||!Number.isInteger(h)||!range(w,250,900)||!range(h,350,900)||!Number.isInteger(pr.index)||!range(pr.index,0,3)||!g)return false;
    if(typeof PanelEdgeCells==='undefined'||typeof PanelCornerFrames==='undefined'||!PanelEdgeCells.validPanel(pr.anchors?.[0])||!PanelCornerFrames.validPanel(pr.anchors?.[1]))return false;
    const a=pr.anchors;if(a[0]._identitySource!=='sloping-edge-frame'||a[1]._identitySource!=='corner-rim-frame'||a[0].x>.1||a[0].y<.45||a[1].x<.4||a[1].y>.1)return false;
    if(!['left','top','right','step','insetTop','middleTop','insetRight','outerRight'].every(k=>Number.isInteger(g[k])))return false;
    if(!(g.left>=0&&g.top>=0&&g.left<g.step&&g.step<g.right&&g.right<g.insetRight&&g.insetRight<=g.outerRight&&g.outerRight<w&&g.top<g.insetTop&&g.insetTop<g.middleTop))return false;
    for(const key of ['lowerLeft','lowerRight','profile','bottomRim'])if(!Array.isArray(g[key])||g[key].length<2||g[key].length>900||g[key].some(p=>!Array.isArray(p)||p.length!==2||p.some(v=>!finite(v))||p[0]<0||p[0]>w||p[1]<0||p[1]>h))return false;
    if(g.profile[0][0]!==g.step||g.profile.at(-1)[0]!==g.insetRight||g.profile.some((p,i)=>i&&p[0]<=g.profile[i-1][0])||g.profile.some(p=>p[1]<=g.insetTop||p[1]>=g.lowerLeft[0][1]))return false;
    if(!range(pr.stepEvidence?.dark/pr.stepEvidence?.samples,.98,1)||!range(pr.stepEvidence?.maxRun/pr.stepEvidence?.samples,.70,1)||!range(pr.stepEvidence?.both/pr.stepEvidence?.samples,.25,1))return false;
    if(!Array.isArray(pr.rims)||pr.rims.length!==4||pr.rims.some(e=>!Number.isInteger(e.samples)||e.samples<150||!Number.isInteger(e.dark)||!range(e.dark/e.samples,.90,1)))return false;
    if(!pr.band||pr.band.samples<100||!range(pr.band.dark/pr.band.samples,.97,1))return false;
    const qs=witnessedOutlines(pr),q=qs[pr.index];
    if(JSON.stringify(q)!==JSON.stringify(pr.pixelOutline)||JSON.stringify(panel._outline)!==JSON.stringify(q.map(([x,y])=>({x:x/w,y:y/h}))))return false;
    if(q.length<4||q.length>900||polyArea(q)<w*h*.025)return false;
    const st=pr.stats;if(!Number.isInteger(st?.pixels)||!range(st.mean,15,235)||!range(st.variance,450,16257))return false;
    const xs=q.map(p=>p[0]),ys=q.map(p=>p[1]),x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
    return ['x','y','w','h'].every(k=>finite(panel[k]))&&Math.max(Math.abs(panel.x-x0/w),Math.abs(panel.y-y0/h),Math.abs(panel.w-(x1-x0)/w),Math.abs(panel.h-(y1-y0)/h))<1e-10;
  }catch(_){return false;}}
  function completeWitnessedSteppedImage(img,baseline,log){
    if(!Array.isArray(baseline)||baseline.length!==2||typeof PanelEdgeCells==='undefined'||typeof PanelCornerFrames==='undefined'||typeof PanelMatteCells==='undefined')return[];
    const lower=baseline.find(p=>p._identitySource==='sloping-edge-frame'&&PanelEdgeCells.validPanel(p)),upper=baseline.find(p=>p._identitySource==='corner-rim-frame'&&PanelCornerFrames.validPanel(p));
    if(!lower||!upper||lower.x>.1||!range(lower.y,.45,.68)||!range(lower.w,.15,.32)||lower.y+lower.h<.95||!range(upper.x,.4,.65)||upper.y>.1||!range(upper.h,.15,.32)||upper.x+upper.w<.9)return[];
    const proposals=PanelMatteCells.analyzeImage(img);if(proposals.length<6||proposals.length>9||!proposals.every(PanelMatteCells.validPanel))return[];
    const one=f=>{const v=proposals.filter(f);return v.length===1?v[0]:null;};
    const tl=one(p=>p.x<.1&&p.y<.06&&range(p.w,.35,.58)),inset=one(p=>range(p.x,.35,.6)&&range(p.y,.20,.32)&&range(p.h,.10,.22)),hall=one(p=>p.x<.1&&range(p.y,.31,.42)&&range(p.w,.18,.4)),body=one(p=>range(p.x,.15,.4)&&range(p.y,.30,.42)&&range(p.w,.55,.8)),br=one(p=>p.x>.25&&p.y>.52&&p.w>.55&&p.y+p.h>.95);
    if(!tl||!inset||!hall||!body||!br)return[];
    const d=imageData(img);if(!d)return[];const{rgba,w,h}=d,lum=luminanceRGBA(rgba,w,h),box=p=>[Math.round(p.x*w),Math.round(p.y*h),Math.round((p.x+p.w)*w),Math.round((p.y+p.h)*h)],T=box(tl),I=box(inset),L=box(hall),B=box(body);
    const stepCandidates=[];
    for(let x=L[2]+2;x<I[0]-2;x++){const m=stepRailMetric(lum,w,x,I[1]+3,I[3]-3);if(m.dark/m.samples>=.98&&m.maxRun/m.samples>=.70&&m.both/m.samples>=.25)stepCandidates.push(m);}
    const stepGroups=[];for(const m of stepCandidates){if(!stepGroups.length||m.x>stepGroups.at(-1).at(-1).x+1)stepGroups.push([]);stepGroups.at(-1).push(m);}
    const group=stepGroups.length===1?stepGroups[0]:null,stepEvidence=group?{...group[Math.floor(group.length/2)],lo:group[0].x,hi:group.at(-1).x}:null;if(!stepEvidence)return[];
    // The outermost qualifying side of the dark run bounds the inset; the
    // strongest interior ink column may lie several pixels inside its art.
    const step=stepEvidence.lo,top=T[1],left=Math.min(T[0],L[0]),right=T[2],insetTop=I[1]-1,insetRight=I[2];
    if(!range((right-step)/w,.025,.15)||!range((L[1]-insetTop)/h,.03,.12)||!range((I[3]-L[1])/h,.03,.13))return[];
    let band=null;for(let y=T[3];y<=L[1];y++){let dark=0,samples=0;for(let x=left+3;x<step-3;x++){samples++;dark+=lum[y*w+x]<55;}if(dark/samples>=.97&&(!band||Math.abs(y-(T[3]+L[1])/2)<Math.abs(band.y-(T[3]+L[1])/2)))band={y,dark,samples};}if(!band)return[];
    const pixels=p=>p._contours.map(q=>q.map(v=>[Math.round(v.x*w),Math.round(v.y*h)]));
    const bottomRim=convexRim(pixels(br).flat()),lowerRight=upperChain(bottomRim),lowerLeft=upperChain(lower._outline.map(v=>[v.x*w,v.y*h]));
    if(lowerRight.length<2||lowerLeft.length<2||!range((lowerRight.at(-1)[1]-lowerRight[0][1])/h,.06,.18)||Math.abs(lowerRight[0][1]-lowerLeft.at(-1)[1])>h*.025||lowerRight[0][0]-lowerLeft.at(-1)[0]>w*.04)return[];
    const bottom=rasterBottom(pixels(inset),w,h),xs=[...bottom.keys()].sort((a,b)=>a-b);if(xs.length<I[2]-I[0]-8)return[];
    const plateau=Math.max(...bottom.values()),profile=[[step,plateau]];
    for(let x=xs[0];x<=xs.at(-1);x++){
      const near=[];for(let dx=-2;dx<=2;dx++)if(bottom.has(x+dx))near.push(bottom.get(x+dx));near.sort((a,b)=>a-b);if(!near.length)return[];
      let y=near[near.length>>1];
      // Continue the independently supported straight rim through the dark
      // left corner; once its silhouette rises, retain the actual occlusion.
      if(x<xs[0]+(I[2]-I[0])*.10)y=plateau;
      profile.push([x,y]);
    }
    profile.push([insetRight,profile.at(-1)[1]]);
    const dip=plateau-Math.min(...profile.map(p=>p[1]));if(!range(dip/h,.04,.14))return[];
    const geometry={left,top,right,step,insetTop,middleTop:band.y,insetRight,outerRight:B[2],lowerLeft,lowerRight,profile,bottomRim};
    const base={version:8,method:WITNESSED_METHOD,connected:true,analysisWidth:w,analysisHeight:h,anchors:[lower,upper],stepEvidence,band,geometry},outlines=witnessedOutlines(base),rims=outlines.map(q=>rimEvidence(lum,w,h,q));
    if(rims.some(m=>m.dark/m.samples<.90))return[];
    const added=outlines.map((q,index)=>{const xs=q.map(p=>p[0]),ys=q.map(p=>p[1]),x0=Math.min(...xs),y0=Math.min(...ys),x1=Math.max(...xs),y1=Math.max(...ys);return{x:x0/w,y:y0/h,w:(x1-x0)/w,h:(y1-y0)/h,_identitySource:'structural-grid-frame',_geometryOwner:'structural-grid-outline',_geometryType:'witnessed-stepped-outline',_outline:q.map(([x,y])=>({x:x/w,y:y/h})),_structuralGridProof:{...base,rims,index,pixelOutline:q,stats:regionStatsPolygon(lum,w,q.map(v=>v.map(Math.round)))}};});
    if(!added.every(validWitnessedPanel)){log?.('witnessed completion invalid proof');return[];}
    log?.('witnessed stepped completion: retained two perimeter anchors, added four whole visible scenes');return baseline.concat(added);
  }

  function validPanel(p){if(p?._structuralGridProof?.version===25)return typeof PanelDarkOverlayInsets!=='undefined'&&PanelDarkOverlayInsets.validPanel(p);if(p?._structuralGridProof?.version===24)return typeof PanelColoredRims!=='undefined'&&PanelColoredRims.validPanel(p);if(p?._structuralGridProof?.version===23)return typeof PanelColoredRims!=='undefined'&&PanelColoredRims.validPanel(p);if(p?._structuralGridProof?.version===22)return typeof PanelPaperRecovery!=='undefined'&&PanelPaperRecovery.validPanel(p);if([18,19,20,21].includes(p?._structuralGridProof?.version))return typeof PanelRaggedGutters!=='undefined'&&PanelRaggedGutters.validPanel(p);if(p?._structuralGridProof?.version===17)return typeof PanelFramedInsets!=='undefined'&&PanelFramedInsets.validOverlayPanel(p);if(p?._structuralGridProof?.version===16)return typeof PanelGutterGraph!=='undefined'&&PanelGutterGraph.validPanel(p);
    if(p?._structuralGridProof?.version===15)return typeof PanelPaleCompletion!=='undefined'&&PanelPaleCompletion.validPanel(p);if(p?._structuralGridProof?.version===14)return validBleedNetworkPanel(p);try{const pr=p?._structuralGridProof,w=pr?.analysisWidth,h=pr?.analysisHeight;if(pr?.version===13)return validNestedPaperPanel(p);if(pr?.version===12)return validPaperInsetsPanel(p);if(pr?.version===11)return validThinRimsPanel(p);if(pr?.version===10)return validWhiteStackPanel(p);if(pr?.version===9)return validMixedRimsPanel(p);if(pr?.version===8)return validWitnessedPanel(p);if(pr?.version===7)return validSteppedSharedV2Panel(p);if(pr?.version===6)return validSteppedSharedPanel(p);if(pr?.version===5)return validBranchedStackPanel(p);if(pr?.version===4)return validColumnBankPanel(p);if(pr?.version===3)return validInsetTripletPanel(p);if(pr?.version===2)return validOccludedPanel(p);if(p?._identitySource!=='structural-grid-frame'||pr?.version!==1||pr.method!==METHOD||pr.connected!==true||!Number.isInteger(w)||!Number.isInteger(h)||!range(w,120,900)||!range(h,160,900)||!Number.isInteger(pr.index)||!Number.isInteger(pr.count)||!range(pr.count,4,10)||!range(pr.index,0,pr.count-1)||!Array.isArray(pr.box)||pr.box.length!==4||pr.box.some(v=>!Number.isInteger(v))||!Array.isArray(pr.splits)||pr.splits.length<pr.count-1||pr.splits.length>pr.count+3||pr.splits.some(s=>!validSplit(s,w,h))||!range(pr.coverage,.62,.975))return false;const [x0,y0,x1,y1]=pr.box,pixels=(x1-x0+1)*(y1-y0+1);if(x0<0||y0<0||x1>=w||y1>=h||x1<=x0||y1<=y0||!validStats(pr.stats,pixels))return false;return ['x','y','w','h'].every(k=>finite(p[k]))&&Math.max(Math.abs(p.x-x0/w),Math.abs(p.y-y0/h),Math.abs(p.w-(x1-x0+1)/w),Math.abs(p.h-(y1-y0+1)/h))<1e-10;}catch(_){return false;}}
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
  function verticalEdgeRun(lum,w,box,x,threshold=25,maxGap=5){
    const [x0,y0,x1,y1]=box,lo=y0+5,hi=y1-6,flags=[];
    for(let y=lo;y<=hi;y++){let best=0;for(let q=Math.max(x0+1,x-1);q<=Math.min(x1-2,x+1);q++)best=Math.max(best,Math.abs(lum[y*w+q+1]-lum[y*w+q]));flags.push(best>=threshold);}
    let best=null,start=0,gap=0,hits=0;const finish=end=>{const len=end-start;if(len<=0)return;const r={x,start:lo+start,end:lo+end-1,hits,length:len,coverage:hits/len,maxGap};if(!best||r.hits>best.hits||r.hits===best.hits&&r.coverage>best.coverage)best=r;};
    for(let i=0;i<flags.length;i++){if(flags[i]){hits++;gap=0;}else if(++gap>maxGap){finish(i-gap+1);start=i+1;gap=0;hits=0;}}finish(flags.length);return best;
  }
  function horizontalEdgeSupport(lum,w,y,xL,xR,threshold=25){let matched=0,samples=0;for(let x=xL+2;x<xR-2;x++){let best=0;for(let q=Math.max(0,y-1);q<=Math.min((lum.length/w|0)-2,y+1);q++)best=Math.max(best,Math.abs(lum[(q+1)*w+x]-lum[q*w+x]));matched+=best>=threshold;samples++;}return {y,matched,samples,support:samples?matched/samples:0};}
  function regionStatsPolygon(lum,w,q){const xs=q.map(p=>p[0]),ys=q.map(p=>p[1]),x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);let n=0,sum=0,sq=0,dark=0,light=0;const inside=(x,y)=>{let hit=false;for(let i=0,j=q.length-1;i<q.length;j=i++){const a=q[i],b=q[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])hit=!hit;}return hit;};for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)if(inside(x+.5,y+.5)){const v=lum[y*w+x];n++;sum+=v;sq+=v*v;dark+=v<65;light+=v>140;}const mean=sum/Math.max(1,n);return {pixels:n,mean,variance:sq/Math.max(1,n)-mean*mean,dark,light};}
  function completeInsetTripletImage(img,identities,baseline,log){
    if(!Array.isArray(identities)||!Array.isArray(baseline)||baseline.length<5||baseline.length>10||identities.length!==baseline.length||identities.some(p=>!baseline.includes(p)||p?._identitySource||p?._quad||p?._outline||p?._contours||!['x','y','w','h'].every(k=>finite(p[k]))))return[];
    const bottom=baseline.filter(p=>p.y+p.h>.94&&range(p.h,.30,.55)).sort((a,b)=>a.x-b.x);if(bottom.length!==2)return[];const sibling=bottom[0],parent=bottom[1];if(!range(sibling.w,.15,.32)||!range(parent.w,.55,.80)||parent.x+parent.w<.94||Math.abs(sibling.y-parent.y)>.012||Math.abs(sibling.h-parent.h)>.015||!range(parent.x-(sibling.x+sibling.w),.01,.07))return[];
    const upper=baseline.filter(p=>!bottom.includes(p));if(upper.length<3||upper.some(p=>p.y>parent.y-.02))return[];
    const d=imageData(img);if(!d)return[];const {rgba,w,h}=d,lum=luminanceRGBA(rgba,w,h),x0=Math.round(parent.x*w),y0=Math.round(parent.y*h),x1=Math.round((parent.x+parent.w)*w),y1=Math.round((parent.y+parent.h)*h),pw=x1-x0,ph=y1-y0;
    if(!range(pw/w,.55,.80)||!range(ph/h,.30,.55)||x0<1||y0<1||x1>w-1||y1>h-1)return[];
    const raw=[];for(let x=Math.ceil(x0+pw*.16);x<=Math.floor(x1-pw*.16);x++){const r=verticalEdgeRun(lum,w,[x0,y0,x1,y1],x,25,5);if(r&&r.length>=ph*.50&&r.coverage>=.90)raw.push(r);}
    const groups=[];for(const r of raw){if(!groups.length||r.x>groups.at(-1).at(-1).x+1)groups.push([]);groups.at(-1).push(r);}const reps=groups.map(g=>g.reduce((a,b)=>b.length*b.coverage>a.length*a.coverage?b:a)).sort((a,b)=>a.x-b.x);if(reps.length<2)return[];
    const bestCap=g=>g.reduce((a,b)=>b.support>a.support?b:a),pairs=[];
    for(let i=0;i<reps.length;i++)for(let j=i+1;j<reps.length;j++){
      const a=reps[i],b=reps[j],xL=a.x+1,xR=b.x+1,sep=xR-xL;if(!range(sep/pw,.10,.25))continue;const overlapStart=Math.max(a.start,b.start),overlapEnd=Math.min(a.end,b.end);if(overlapEnd-overlapStart<ph*.50)continue;
      const caps=[];for(let y=overlapStart;y<=overlapEnd;y++){const c=horizontalEdgeSupport(lum,w,y,xL,xR,25);if(c.support>=.60)caps.push(c);}const capGroups=[];for(const c of caps){if(!capGroups.length||c.y>capGroups.at(-1).at(-1).y+1)capGroups.push([]);capGroups.at(-1).push(c);}if(capGroups.length<2)continue;
      const topGroup=capGroups.find(g=>g[0].y-overlapStart<=ph*.055),bottomGroup=[...capGroups].reverse().find(g=>overlapEnd-g.at(-1).y<=ph*.055);if(!topGroup||!bottomGroup||topGroup===bottomGroup)continue;const top=bestCap(topGroup),bottomCap=bestCap(bottomGroup),score=a.coverage+b.coverage+top.support+bottomCap.support+(overlapEnd-overlapStart)/ph;pairs.push({a,b,xL,xR,sep,overlapStart,overlapEnd,top,bottomCap,score});
    }
    if(pairs.length!==1)return[];const pair=pairs[0],left=pair.a,right=pair.b,xL=pair.xL,xR=pair.xR,sep=pair.sep,top=pair.top,bottomCap=pair.bottomCap,yT=top.y+1,yB=bottomCap.y+1;
    if(!range((yB-yT)/ph,.55,.86)||!range((xL-x0)/pw,.20,.48)||!range((x1-xR)/pw,.28,.62)||!range((yT-y0)/ph,.025,.22)||!range((y1-yB)/ph,.025,.24))return[];
    const qLeft=[[x0,y0],[xL,y0],[xL,yB],[xR,yB],[xR,y1],[x0,y1]],qInset=[[xL,yT],[xR,yT],[xR,yB],[xL,yB]],qRight=[[xL,y0],[x1,y0],[x1,y1],[xR,y1],[xR,yT],[xL,yT]],stats=[qLeft,qInset,qRight].map(q=>regionStatsPolygon(lum,w,q));
    const good=st=>st.pixels>=w*h*.018&&range(st.mean,15,235)&&range(st.variance,450,16257)&&range(st.dark/st.pixels,.015,.97)&&range(st.light/st.pixels,.005,.97);if(stats.some(st=>!good(st)))return[];
    const base={version:3,method:INSET_TRIPLET_METHOD,connected:true,analysisWidth:w,analysisHeight:h,baselineCount:baseline.length,upperCount:upper.length,parent:{x:parent.x,y:parent.y,w:parent.w,h:parent.h},parentBox:[x0,y0,x1,y1],insetBox:[xL,yT,xR,yB],verticalEdges:[left,right],caps:[top,bottomCap],edgeThreshold:25,maxGap:5,edgeSeparation:sep};
    const make=(role,q,st)=>{const xs=q.map(p=>p[0]),ys=q.map(p=>p[1]),bx0=Math.min(...xs),by0=Math.min(...ys),bx1=Math.max(...xs),by1=Math.max(...ys),p={x:bx0/w,y:by0/h,w:(bx1-bx0)/w,h:(by1-by0)/h,_identitySource:'structural-grid-frame',_geometryType:'orthogonal',_geometryOwner:'structural-grid-outline',_outline:q.map(([x,y])=>({x:x/w,y:y/h})),_structuralGridProof:{...base,role,pixelOutline:q,stats:st}};return validPanel(p)?p:null;};
    const triplet=[make('left',qLeft,stats[0]),make('inset',qInset,stats[1]),make('right',qRight,stats[2])];if(triplet.some(p=>!p))return[];
    const out=[];for(const p of baseline){if(p===parent)out.push(...triplet);else out.push(p);}if(log)log('framed inset triplet: parent '+JSON.stringify([x0,y0,x1,y1])+' -> left/inset/right at x='+xL+'/'+xR+' y='+yT+'/'+yB);return out;
  }
  function bankRailMetric(lum,w,x,top,bottom,cut=70){let samples=0,dark=0,run=0,maxRun=0,left=0,right=0,both=0;for(let y=top;y<=bottom;y++){const core=lum[y*w+x],yes=core<=cut;samples++;dark+=yes;run=yes?run+1:0;maxRun=Math.max(maxRun,run);let L=0,R=0;for(let d=4;d<=16;d++){L=Math.max(L,lum[y*w+Math.max(0,x-d)]);R=Math.max(R,lum[y*w+Math.min(w-1,x+d)]);}const a=L>=core+18,b=R>=core+18;left+=a;right+=b;both+=a&&b;}return {x,samples,dark,maxRun,left,right,both};}
  function completeColumnBankImage(img,baseline,log){
    if(!Array.isArray(baseline)||baseline.length!==3||baseline.some(p=>!p||p._identitySource||p._quad||p._outline||p._contours||!['x','y','w','h'].every(k=>finite(p[k]))))return[];const slabs=[...baseline].sort((a,b)=>a.y-b.y);
    if(slabs.some(p=>p.x>.06||p.x+p.w<.93||p.w<.88)||!range(slabs[0].h,.20,.40)||!range(slabs[1].h,.07,.18)||!range(slabs[2].h,.42,.60)||slabs[0].y>.05||slabs[2].y+slabs[2].h<.94||!range(slabs[1].y-(slabs[0].y+slabs[0].h),.002,.06)||!range(slabs[2].y-(slabs[1].y+slabs[1].h),.002,.06))return[];
    const d=imageData(img);if(!d)return[];const {rgba,w,h}=d,lum=luminanceRGBA(rgba,w,h),grid=analyzeRGBA(rgba,w,h,log);if(grid.length<7||grid.length>10||!grid.every(validPanel))return[];
    const terminals=grid.filter(p=>p.w>.90&&p.y>.68&&p.y+p.h>.98&&range(p.h,.15,.32));if(terminals.length!==1)return[];const t=terminals[0],tp=t._structuralGridProof.box,bankCells=grid.filter(p=>p!==t&&p.y+p.h<=t.y+.015&&p.y>=slabs[2].y-.03);if(bankCells.length<4)return[];const bp=bankCells.map(p=>p._structuralGridProof.box),bx0=Math.min(...bp.map(b=>b[0]),tp[0]),bx1=Math.max(...bp.map(b=>b[2]),tp[2]),by0=Math.min(...bp.map(b=>b[1])),by1=Math.max(...bp.map(b=>b[3]));if(!range((bx1-bx0+1)/w,.88,1)||!range((by1-by0+1)/h,.22,.42)||!range((tp[1]-by1)/h,.002,.04))return[];
    const raw=[];for(let x=bx0+Math.ceil(w*.06);x<=bx1-Math.ceil(w*.06);x++){const r=bankRailMetric(lum,w,x,by0,by1,70);if(r.dark/r.samples>=.78&&r.maxRun/r.samples>=.55&&r.left/r.samples>=.55&&r.right/r.samples>=.70&&r.both/r.samples>=.50)raw.push(r);}const groups=[];for(const r of raw){if(!groups.length||r.x>groups.at(-1).at(-1).x+1)groups.push([]);groups.at(-1).push(r);}if(groups.length!==4)return[];
    const separators=groups.map(g=>{const best=g.reduce((a,b)=>(b.dark+b.maxRun+b.both)>(a.dark+a.maxRun+a.both)?b:a);return {...best,lo:g[0].x,hi:g.at(-1).x};}).sort((a,b)=>a.x-b.x);let prev=bx0;const widths=[];for(const r of separators){widths.push(r.lo-prev);prev=r.hi+1;}widths.push(bx1-prev+1);if(widths.some(v=>v<w*.08||v>w*.31)||Math.max(...widths)/Math.min(...widths)>2.15)return[];
    const boxes=[];for(let i=0;i<5;i++){const L=i?separators[i-1].hi+1:bx0,R=i<4?separators[i].lo-1:bx1;if(R<=L)return[];boxes.push([L,by0,R,by1]);}boxes.push(tp.slice());const stats=boxes.map(b=>statsRect(lum,w,b));if(stats.some((st,i)=>!validStats(st,(boxes[i][2]-boxes[i][0]+1)*(boxes[i][3]-boxes[i][1]+1))))return[];
    const base={version:4,method:COLUMN_BANK_METHOD,connected:true,analysisWidth:w,analysisHeight:h,baselineCount:baseline.length,count:6,bankBox:[bx0,by0,bx1,by1],terminalBox:tp.slice(),separators};const out=boxes.map((box,index)=>{const p={x:box[0]/w,y:box[1]/h,w:(box[2]-box[0]+1)/w,h:(box[3]-box[1]+1)/h,_identitySource:'structural-grid-frame',_geometryType:'orthogonal',_structuralGridProof:{...base,index,box,stats:stats[index]}};return validPanel(p)?p:null;});if(out.some(p=>!p))return[];
    log?.(`five-column bank completion: 3 slabs -> 5 columns + terminal; rails=${separators.map(r=>r.lo+'-'+r.hi).join(',')}`);return [slabs[0],slabs[1],...out];
  }
  function branchBandRows(lum,w,x0,x1,y0,y1,cut=50,min=.80){const rows=[];for(let y=y0;y<=y1;y++){let n=0;for(let x=x0;x<=x1;x++)n+=lum[y*w+x]<=cut;const f=n/(x1-x0+1);if(f>=min)rows.push({p:y,f});}const gs=[];for(const r of rows){if(!gs.length||r.p>gs.at(-1).at(-1).p+1)gs.push([]);gs.at(-1).push(r);}return gs.map(g=>({lo:g[0].p,hi:g.at(-1).p,center:g.reduce((a,b)=>b.f>a.f?b:a).p,samples:x1-x0+1,meanDark:g.reduce((s,r)=>s+r.f,0)/g.length,maxDark:Math.max(...g.map(r=>r.f))}));}
  function branchBandCols(lum,w,x0,x1,y0,y1,cut=50,min=.80){const cols=[];for(let x=x0;x<=x1;x++){let n=0;for(let y=y0;y<=y1;y++)n+=lum[y*w+x]<=cut;const f=n/(y1-y0+1);if(f>=min)cols.push({p:x,f});}const gs=[];for(const r of cols){if(!gs.length||r.p>gs.at(-1).at(-1).p+1)gs.push([]);gs.at(-1).push(r);}return gs.map(g=>({lo:g[0].p,hi:g.at(-1).p,center:g.reduce((a,b)=>b.f>a.f?b:a).p,samples:y1-y0+1,meanDark:g.reduce((s,r)=>s+r.f,0)/g.length,maxDark:Math.max(...g.map(r=>r.f))}));}
  function seamScore(lum,w,h,x,y){const at=(Y)=>lum[Math.max(0,Math.min(h-1,Y))*w+x],v=at(y),grad=Math.abs(at(y+2)-at(y-2)),contrast=Math.abs(v-at(y-5))+Math.abs(v-at(y+5));return .8*grad+.35*v+.15*contrast;}
  function simplifyPath(points,eps=4){if(points.length<3)return points.map(p=>p.slice());const dist=(p,a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1];if(!dx&&!dy)return Math.hypot(p[0]-a[0],p[1]-a[1]);return Math.abs(dy*p[0]-dx*p[1]+b[0]*a[1]-b[1]*a[0])/Math.hypot(dx,dy);};let best=0,index=-1;for(let i=1;i<points.length-1;i++){const d=dist(points[i],points[0],points.at(-1));if(d>best){best=d;index=i;}}if(best<=eps)return [points[0].slice(),points.at(-1).slice()];const a=simplifyPath(points.slice(0,index+1),eps),b=simplifyPath(points.slice(index),eps);return a.slice(0,-1).concat(b);}
  function traceBranchSeam(lum,w,h,x0,x1,yMin,yMax){if(x1-x0<100||yMax-yMin<40)return null;const edgeBest=x=>{let best={y:yMin,s:-1};for(let y=yMin;y<=yMax;y++){const s=seamScore(lum,w,h,x,y);if(s>best.s)best={y,s};}return best;},start=edgeBest(Math.min(x1,x0+7)),end=edgeBest(Math.max(x0,x1-7)),nx=x1-x0+1,ny=yMax-yMin+1,neg=-1e15,dp=Array.from({length:nx},()=>new Float64Array(ny).fill(neg)),prev=Array.from({length:nx},()=>new Int16Array(ny).fill(-1));
    for(let j=0;j<ny;j++){const y=yMin+j;dp[0][j]=seamScore(lum,w,h,x0,y)-.10*(y-start.y)*(y-start.y);}for(let i=1;i<nx;i++){const t=i/(nx-1),guide=start.y*(1-t)+end.y*t,x=x0+i;for(let j=0;j<ny;j++){let best=neg,bj=-1;for(let k=Math.max(0,j-2);k<=Math.min(ny-1,j+2);k++){const v=dp[i-1][k]-2*Math.abs(j-k);if(v>best){best=v;bj=k;}}const y=yMin+j;dp[i][j]=best+seamScore(lum,w,h,x,y)-.035*(y-guide)*(y-guide);prev[i][j]=bj;}}
    let j=0,best=neg;for(let k=0;k<ny;k++){const y=yMin+k,v=dp[nx-1][k]-.10*(y-end.y)*(y-end.y);if(v>best){best=v;j=k;}}const raw=new Array(nx),scores=[];for(let i=nx-1;i>=0;i--){const y=yMin+j;raw[i]=[x0+i,y];scores.push(seamScore(lum,w,h,x0+i,y));if(i)j=prev[i][j];}const seam=simplifyPath(raw,4),mean=scores.reduce((a,b)=>a+b,0)/scores.length;if(seam.length<6||seam.length>48||mean<90||!range((seam[0][1]-seam.at(-1)[1])/h,.03,.16))return null;return {seam,mean,start:seam[0][1],end:seam.at(-1)[1]};}
  function completeBranchedStackImage(img,baseline,log){
    if(!Array.isArray(baseline)||baseline.length!==4||baseline.some(p=>!p||p._identitySource||p._quad||p._outline||p._contours||!['x','y','w','h'].every(k=>finite(p[k]))))return[];const sorted=[...baseline].sort((a,b)=>a.y-b.y||a.x-b.x),body=sorted[0],tails=sorted.slice(1).sort((a,b)=>a.x-b.x);if(body.x>.04||body.y>.05||body.w<.90||!range(body.h,.68,.86)||tails.some(p=>p.y<.78||!range(p.h,.14,.24))||Math.max(...tails.map(p=>p.y))-Math.min(...tails.map(p=>p.y))>.012||tails[0].w<.42||tails[1].w>.16||tails[2].w>.16)return[];
    const d=imageData(img);if(!d)return[];const {rgba,w,h}=d,lum=luminanceRGBA(rgba,w,h),x0=Math.max(0,Math.round(body.x*w)),y0=Math.max(0,Math.round(body.y*h)),x1=Math.min(w-1,Math.round((body.x+body.w)*w)-1),y1=h-1,tailY=Math.round(Math.min(...tails.map(p=>p.y))*h);
    const topBands=branchBandRows(lum,w,x0,x1,Math.round(h*.38),Math.round(h*.60),50,.82);if(topBands.length!==1)return[];const topBottom=topBands[0];const spineBands=branchBandCols(lum,w,Math.round(w*.35),Math.round(w*.65),y0,topBottom.lo-1,50,.84);if(spineBands.length!==1)return[];const mainSpine=spineBands[0];
    const rightRows=branchBandRows(lum,w,mainSpine.hi+1,x1,Math.round(h*.20),Math.min(topBottom.lo-20,Math.round(h*.40)),50,.84);if(rightRows.length!==1)return[];const rightMid=rightRows[0];const splitCols=branchBandCols(lum,w,mainSpine.hi+Math.round(w*.10),x1-Math.round(w*.04),y0,rightMid.lo-1,50,.84);if(splitCols.length!==1)return[];const rightSplit=splitCols[0];
    const terminalBands=branchBandRows(lum,w,x0,x1,Math.max(topBottom.hi+40,tailY-Math.round(h*.04)),Math.min(h-2,tailY+Math.round(h*.03)),50,.88);if(terminalBands.length!==1)return[];const terminalTop=terminalBands[0];if(!validBranchMetric(mainSpine,'major')||!validBranchMetric(rightSplit,'major')||!validBranchMetric(rightMid,'major')||!validBranchMetric(topBottom,'major')||!validBranchMetric(terminalTop,'major'))return[];
    const seamMin=topBottom.hi+Math.round(h*.05),seamMax=terminalTop.lo-Math.round(h*.03),tr=traceBranchSeam(lum,w,h,x0,x1,seamMin,seamMax);if(!tr)return[];const seam=tr.seam,rect=(a,b,c,d)=>[[a,b],[c+1,b],[c+1,d+1],[a,d+1]],rev=[...seam].reverse(),outlines=[rect(x0,y0,mainSpine.lo-1,topBottom.lo-1),rect(mainSpine.hi+1,y0,rightSplit.lo-1,rightMid.lo-1),rect(rightSplit.hi+1,y0,x1,rightMid.lo-1),rect(mainSpine.hi+1,rightMid.hi+1,x1,topBottom.lo-1),[[x0,topBottom.hi+1],[x1+1,topBottom.hi+1],...rev.map(([x,y])=>[x+1,y])],[...seam,[x1+1,terminalTop.lo],[x0,terminalTop.lo]],rect(x0,terminalTop.hi+1,x1,y1)];
    const stats=outlines.map(q=>regionStatsPolygon(lum,w,q)),good=st=>st.pixels>=w*h*.02&&range(st.mean,15,235)&&range(st.variance,450,16257)&&range(st.dark/st.pixels,.01,.98)&&range(st.light/st.pixels,.005,.97);if(stats.some(st=>!good(st)))return[];const base={version:5,method:BRANCHED_STACK_METHOD,connected:true,analysisWidth:w,analysisHeight:h,baselineCount:4,count:7,pageBox:[x0,y0,x1,y1],rails:{mainSpine,rightSplit,rightMid,topBottom,terminalTop},seam,seamMeanScore:tr.mean,seamStart:tr.start,seamEnd:tr.end};
    const out=outlines.map((q,index)=>{const xs=q.map(v=>v[0]),ys=q.map(v=>v[1]),bx0=Math.min(...xs),by0=Math.min(...ys),bx1=Math.max(...xs),by1=Math.max(...ys),p={x:bx0/w,y:by0/h,w:(bx1-bx0)/w,h:(by1-by0)/h,_identitySource:'structural-grid-frame',_geometryOwner:'structural-grid-outline',_geometryType:index===4||index===5?'curved-shared-seam':'orthogonal',_outline:q.map(([x,y])=>({x:x/w,y:y/h})),_structuralGridProof:{...base,index,pixelOutline:q,stats:stats[index]}};return validPanel(p)?p:null;});if(out.some(p=>!p))return[];log?.(`branched stack completion: 4 coarse owners -> 7 frames; seam ${tr.start}->${tr.end} score=${tr.mean.toFixed(1)}`);return out;
  }
  function stepRailMetric(lum,w,x,y0,y1,cut=55){let samples=0,dark=0,run=0,maxRun=0,both=0,left=0,right=0;for(let y=y0;y<=y1;y++){let core=255;for(let d=-1;d<=1;d++)core=Math.min(core,lum[y*w+Math.max(0,Math.min(w-1,x+d))]);const yes=core<=cut;samples++;dark+=yes;run=yes?run+1:0;maxRun=Math.max(maxRun,run);let L=0,R=0;for(let d=4;d<=16;d++){L=Math.max(L,lum[y*w+Math.max(0,x-d)]);R=Math.max(R,lum[y*w+Math.min(w-1,x+d)]);}const a=L>=core+18,b=R>=core+18;left+=a;right+=b;both+=a&&b;}return{x,samples,dark,maxRun,left,right,both,score:dark/Math.max(1,samples)+.5*maxRun/Math.max(1,samples)+.3*both/Math.max(1,samples)};}
  function findStepRail(lum,w,left,right,top,bottom){const raw=[];for(let x=left;x<=right;x++){const m=stepRailMetric(lum,w,x,top,bottom,55);if(m.dark/m.samples>=.72&&m.maxRun/m.samples>=.55&&m.both/m.samples>=.18)raw.push(m);}const groups=[];for(const m of raw){if(!groups.length||m.x>groups.at(-1).at(-1).x+1)groups.push([]);groups.at(-1).push(m);}if(!groups.length)return null;const ranked=groups.map(g=>{const best=g.reduce((a,b)=>b.score>a.score?b:a);return{...best,lo:g[0].x,hi:g.at(-1).x,groupScore:g.reduce((n,v)=>n+v.score,0)/g.length};}).sort((a,b)=>b.groupScore-a.groupScore);if(ranked.length>1&&ranked[1].groupScore>ranked[0].groupScore-.06)return null;return ranked[0];}
  function topEdgePair(q){if(!Array.isArray(q)||q.length!==4)return null;return [...q].sort((a,b)=>a[1]-b[1]).slice(0,2).sort((a,b)=>a[0]-b[0]);}
  function completeSteppedSharedSceneV2Image(img,baseline,log){
    if(!Array.isArray(baseline)||baseline.length!==7||typeof PanelMatteCells==='undefined'||baseline.some(p=>!PanelMatteCells.validPanel?.(p)))return[];const p=[...baseline].sort((a,b)=>{const dy=a.y-b.y;return Math.abs(dy)<.08?a.x-b.x:dy;}),area=a=>a.w*a.h,ov=(a,b)=>overlap(a,b)/Math.max(1e-9,Math.min(area(a),area(b)));
    if(!(p[0].y<.08&&p[1].y<.08&&range(p[0].w,.35,.58)&&range(p[1].w,.35,.58)&&range(p[2].y,.20,.32)&&range(p[2].w,.35,.60)&&range(p[2].h,.11,.23)&&range(p[3].y,.31,.40)&&range(p[3].w,.18,.38)&&range(p[4].y,.31,.40)&&range(p[4].w,.55,.78)&&p[5].y>.52&&range(p[5].w,.15,.34)&&p[6].y>.55&&range(p[6].w,.55,.78)))return[];
    if(!range(ov(p[2],p[4]),.30,.65)||!range(ov(p[3],p[4]),.06,.18)||!range(ov(p[3],p[5]),.04,.15)||!range(ov(p[4],p[6]),.18,.45))return[];
    const d=imageData(img);if(!d)return[];const {rgba,w,h}=d,lum=luminanceRGBA(rgba,w,h),boxes=p.map(a=>[Math.round(a.x*w),Math.round(a.y*h),Math.round((a.x+a.w)*w)-1,Math.round((a.y+a.h)*h)-1]);
    const q0=refineMatteQuad(img,p[0],w,h),q1=refineMatteQuad(img,p[1],w,h),q2=refineMatteQuad(img,p[2],w,h),q5=refineMatteQuad(img,p[5],w,h),q6=refineMatteQuad(img,p[6],w,h);if([q0,q1,q2,q5,q6].some(q=>!q))return[];
    const railLo=Math.max(boxes[3][2]+2,Math.round(w*.28)),railHi=Math.min(boxes[2][0]-2,Math.round(w*.50));if(railHi-railLo<18)return[];const stepRail=findStepRail(lum,w,railLo,railHi,boxes[2][1],boxes[2][3]);if(!stepRail)return[];const xStep=stepRail.x;
    const q5Top=topEdgePair(q5),q6Top=topEdgePair(q6);if(!q5Top||!q6Top)return[];const sheriffTop=Math.round((q2[0][1]+q2[1][1])/2),sheriffBottom=Math.round((q2[2][1]+q2[3][1])/2),sheriffRight=Math.round((q2[1][0]+q2[2][0])/2),spineX=Math.round((q0[1][0]+q0[2][0])/2),middleTop=boxes[3][1],leftX=Math.min(boxes[3][0],q0[0][0],q0[3][0]),rightX=Math.max(boxes[4][2],q6Top[1][0]);
    if(!(xStep>leftX+w*.18&&xStep<spineX-w*.04&&middleTop>sheriffTop+h*.03&&middleTop<sheriffBottom&&sheriffRight>xStep+w*.30&&rightX>sheriffRight))return[];
    const topLeft=[[q0[0][0],q0[0][1]],[q0[1][0],q0[1][1]],[spineX,sheriffTop],[xStep,sheriffTop],[xStep,middleTop],[leftX,middleTop]];
    const topRight=q1.map(v=>v.slice()),sheriff=[[xStep,sheriffTop],[sheriffRight,sheriffTop],[sheriffRight,sheriffBottom],[xStep,sheriffBottom]];
    const middle=[[leftX,middleTop],[xStep,middleTop],[xStep,sheriffBottom],[rightX,sheriffBottom],[q6Top[1][0],q6Top[1][1]],[q6Top[0][0],q6Top[0][1]],[q5Top[1][0],q5Top[1][1]],[q5Top[0][0],q5Top[0][1]]];
    const outlines=[topLeft,topRight,sheriff,middle,q5.map(v=>v.slice()),q6.map(v=>v.slice())],stats=outlines.map(q=>regionStatsPolygon(lum,w,q)),good=st=>st.pixels>=w*h*.012&&range(st.mean,15,235)&&range(st.variance,450,16257)&&range(st.dark/st.pixels,.005,.99)&&range(st.light/st.pixels,.002,.98);if(stats.some(st=>!good(st)))return[];
    const base={version:7,method:STEPPED_SHARED_V2_METHOD,connected:true,analysisWidth:w,analysisHeight:h,baselineCount:7,count:6,anchorBoxes:boxes,refinedQuads:[q0,q1,q2,q5,q6],stepRail,outlines};
    const out=outlines.map((q,index)=>{const xs=q.map(v=>v[0]),ys=q.map(v=>v[1]),bx0=Math.min(...xs),by0=Math.min(...ys),bx1=Math.max(...xs),by1=Math.max(...ys),panel={x:bx0/w,y:by0/h,w:(bx1-bx0)/w,h:(by1-by0)/h,_identitySource:'structural-grid-frame',_geometryOwner:'structural-grid-outline',_geometryType:index===0||index===3?'stepped-shared-outline':'orthogonal',_outline:q.map(([x,y])=>({x:x/w,y:y/h})),_structuralGridProof:{...base,index,pixelOutline:q,stats:stats[index]}};return validPanel(panel)?panel:null;});if(out.some(q=>!q))return[];log?.(`stepped shared-scene v2: 7 matte fragments -> 6 exact owners; inset rail x=${stepRail.lo}-${stepRail.hi}`);return out;
  }
  function guidedSharedSeam(lum,w,h,x0,x1,yMin,yMax,startGuess,endGuess){if(x1-x0<200||yMax-yMin<80)return null;const bestNear=(x,guess)=>{let best={y:guess,score:-1e15,raw:0};for(let y=Math.max(yMin,guess-28);y<=Math.min(yMax,guess+28);y++){const raw=seamScore(lum,w,h,x,y),score=raw-.45*(y-guess)*(y-guess);if(score>best.score)best={y,score,raw};}return best;},a=bestNear(x0,startGuess),b=bestNear(x1,endGuess),raw=[],scores=[];for(let x=x0;x<=x1;x++){const t=(x-x0)/Math.max(1,x1-x0),y=Math.round(a.y*(1-t)+b.y*t);raw.push([x,y]);scores.push(seamScore(lum,w,h,x,y));}const mean=scores.reduce((u,v)=>u+v,0)/scores.length,seam=[[x0,a.y],[x1,b.y]];if(mean<65||Math.abs(a.y-startGuess)>28||Math.abs(b.y-endGuess)>28||!range((b.y-a.y)/h,.08,.22))return null;return {raw,seam,mean};}
  function lineY(a,b,x){if(Math.abs(b[0]-a[0])<1e-6)return (a[1]+b[1])/2;const t=(x-a[0])/(b[0]-a[0]);return a[1]+t*(b[1]-a[1]);}
  function refineMatteQuad(img,p,w,h){if(typeof PanelFrameEnvelope==='undefined'||!PanelFrameEnvelope._detectSingle)return null;const tap={x:p.x+p.w/2,y:p.y+p.h/2},r=PanelFrameEnvelope._detectSingle(img,{x:p.x,y:p.y,w:p.w,h:p.h,_tap:tap,_geometryOnlyRescue:true,_multiscaleSeed:true}),f=r?._frameEnvelope;if(!Array.isArray(r?._quad)||r._quad.length!==4||!f?.connected||!f.chainConnected||!f.outermostLoop||!f.railBandThickness||f.confidence<.94)return null;return r._quad.map(q=>[Math.round(q.x*w),Math.round(q.y*h)]);}
  function completeSteppedSharedSceneImage(img,baseline,log){
    if(!Array.isArray(baseline)||baseline.length!==7||typeof PanelMatteCells==='undefined'||baseline.some(p=>!PanelMatteCells.validPanel?.(p)))return[];const p=[...baseline].sort((a,b)=>{const dy=a.y-b.y;return Math.abs(dy)<.08?a.x-b.x:dy;}),area=a=>a.w*a.h,ov=(a,b)=>overlap(a,b)/Math.max(1e-9,Math.min(area(a),area(b)));
    if(!(p[0].y<.08&&p[1].y<.08&&range(p[0].w,.35,.58)&&range(p[1].w,.35,.58)&&range(p[2].y,.20,.32)&&range(p[2].w,.35,.60)&&range(p[2].h,.11,.23)&&range(p[3].y,.31,.40)&&range(p[3].w,.18,.38)&&range(p[4].y,.31,.40)&&range(p[4].w,.55,.78)&&p[5].y>.52&&range(p[5].w,.15,.34)&&p[6].y>.55&&range(p[6].w,.55,.78)))return[];
    if(!range(ov(p[2],p[4]),.30,.65)||!range(ov(p[3],p[4]),.06,.18)||!range(ov(p[3],p[5]),.04,.15)||!range(ov(p[4],p[6]),.18,.45))return[];
    const d=imageData(img);if(!d)return[];const {rgba,w,h}=d,lum=luminanceRGBA(rgba,w,h),boxes=p.map(a=>[Math.round(a.x*w),Math.round(a.y*h),Math.round((a.x+a.w)*w)-1,Math.round((a.y+a.h)*h)-1]);
    const q0=refineMatteQuad(img,p[0],w,h),q1=refineMatteQuad(img,p[1],w,h),q2=refineMatteQuad(img,p[2],w,h),q5=refineMatteQuad(img,p[5],w,h),q6=refineMatteQuad(img,p[6],w,h);if([q0,q1,q2,q5,q6].some(q=>!q))return[];
    const xLeft=Math.max(0,Math.min(q0[3][0],boxes[3][0])),xRight=Math.min(w-1,Math.max(boxes[4][2],q6[1][0])),startGuess=boxes[5][1],endGuess=boxes[4][3],yMin=Math.max(q0[3][1]+30,startGuess-45),yMax=Math.min(q6[2][1]-60,endGuess+45),tr=guidedSharedSeam(lum,w,h,xLeft,xRight,yMin,yMax,startGuess,endGuess);if(!tr)return[];
    const splitX=Math.round((boxes[5][2]+boxes[6][0])/2);if(splitX<=xLeft+w*.15||splitX>=xRight-w*.45)return[];const splitIndex=splitX-xLeft;if(splitIndex<20||splitIndex>=tr.raw.length-20)return[];const leftSeam=simplifyPath(tr.raw.slice(0,splitIndex+1),4),rightSeam=simplifyPath(tr.raw.slice(splitIndex),4),seam=simplifyPath(tr.raw,4),leftTop=leftSeam[0],rightTop=rightSeam.at(-1);
    const insetLeft=Math.round((q2[0][0]+q2[3][0])/2),insetRight=Math.round((q2[1][0]+q2[2][0])/2),insetTop=Math.round((q2[0][1]+q2[1][1])/2),insetBottomLeft=q2[3][1],insetBottomRight=q2[2][1],topLeftY=Math.round(lineY(q0[3],q0[2],insetLeft)),topRightY=Math.round(lineY(q2[3],q2[2],xRight));
    const p0RightX=Math.round(q0[1][0]+(q0[2][0]-q0[1][0])*((insetTop-q0[1][1])/(q0[2][1]-q0[1][1]+1e-9)));
    const topLeftOutline=[q0[0],q0[1],[p0RightX,insetTop],[insetLeft,insetTop],[insetLeft,topLeftY],q0[3]];
    const middleOutline=[[xLeft,q0[3][1]],[insetLeft,topLeftY],[insetLeft,insetBottomLeft],[insetRight,insetBottomRight],[xRight,topRightY],rightTop,...[...seam].reverse().slice(1),leftTop];
    const blBottomRight=q5[2],blBottomLeft=q5[3],brBottomRight=q6[2],brBottomLeft=q6[3],bottomLeftOutline=[...leftSeam,[splitX,blBottomRight[1]],blBottomRight,blBottomLeft],bottomRightOutline=[...rightSeam,brBottomRight,brBottomLeft,[splitX,brBottomLeft[1]]];
    const outlines=[topLeftOutline,q1,q2,middleOutline,bottomLeftOutline,bottomRightOutline],stats=outlines.map(q=>regionStatsPolygon(lum,w,q)),good=st=>st.pixels>=w*h*.012&&range(st.mean,15,235)&&range(st.variance,450,16257)&&range(st.dark/st.pixels,.005,.99)&&range(st.light/st.pixels,.002,.98);if(stats.some(st=>!good(st)))return[];
    const base={version:6,method:STEPPED_SHARED_METHOD,connected:true,analysisWidth:w,analysisHeight:h,baselineCount:7,count:6,anchorBoxes:boxes,refinedQuads:[q0,q1,q2,q5,q6],seam,splitX,seamMeanScore:tr.mean,seamStartGuess:startGuess,seamEndGuess:endGuess,outlines};
    const out=outlines.map((q,index)=>{const xs=q.map(v=>v[0]),ys=q.map(v=>v[1]),bx0=Math.min(...xs),by0=Math.min(...ys),bx1=Math.max(...xs),by1=Math.max(...ys),panel={x:bx0/w,y:by0/h,w:(bx1-bx0)/w,h:(by1-by0)/h,_identitySource:'structural-grid-frame',_geometryOwner:'structural-grid-outline',_geometryType:index===3||index>=4?'shared-seam-outline':'orthogonal',_outline:q.map(([x,y])=>({x:x/w,y:y/h})),_structuralGridProof:{...base,index,pixelOutline:q,stats:stats[index]}};return validPanel(panel)?panel:null;});if(out.some(q=>!q))return[];log?.(`stepped shared-scene completion: 7 matte fragments -> 6 frames; seam ${seam[0][1]}->${seam.at(-1)[1]} score=${tr.mean.toFixed(1)}`);return out;
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
  // A raw upper composite over two bottom composites can mix pale, sloping
  // rims with dark vertical gutters. Complete only a fully witnessed network.
  const MIXED_RIMS_METHOD='native-raster-pale-tiers-dark-column-bank';
  function mixedScores(rgba,w,h,vertical){
    const lum=luminanceRGBA(rgba,w,h),out=new Float32Array(w*h),step=vertical?1:w;
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x,t=vertical?x:y,T=vertical?w:h;let dark=lum[i];for(let d=-6;d<=6;d++)if(t+d>=0&&t+d<T)dark=Math.min(dark,lum[i+d*step]);const pale=Math.min(rgba[i*4+2]+25,lum[i]);out[i]=Math.max(0,Math.min(1,(pale-100)/120))*Math.max(0,Math.min(1,(lum[i]-dark-45)/90));}return out;
  }
  function mixedBands(score,w,h,vertical,t0,lo,hi){const at=(t,p)=>score[vertical?t*w+p:p*w+t],groups=[];for(let p=lo;p<=hi;p++){let s=0;for(let d=0;d<8;d++)s=Math.max(s,at(t0+d,p));if(s<.70)continue;if(!groups.length||p>groups.at(-1).at(-1)+3)groups.push([]);groups.at(-1).push(p);}return groups.map(g=>[g[0],g.at(-1)]);}
  function mixedPath(score,w,h,vertical,t0,t1,lo,hi,start,end){
    const n=hi-lo+1,L=t1-t0+1,at=(t,p)=>score[vertical?t*w+p:p*w+t];let dp=new Float64Array(n).fill(1e6);for(let p=Math.max(lo,start[0]);p<=Math.min(hi,start[1]);p++)dp[p-lo]=0;const back=new Int16Array(n*L);
    for(let t=t0;t<=t1;t++){const next=new Float64Array(n).fill(1e6);for(let j=0;j<n;j++){for(let d=-3;d<=3;d++){const k=j-d;if(k<0||k>=n)continue;const v=dp[k]+Math.abs(d)*.035;if(v<next[j]){next[j]=v;back[(t-t0)*n+j]=k;}}next[j]+=1-at(t,lo+j);}dp=next;}
    let j=-1,best=1e6;for(let p=Math.max(lo,end?.[0]??lo);p<=Math.min(hi,end?.[1]??hi);p++)if(dp[p-lo]<best){best=dp[p-lo];j=p-lo;}if(j<0)return null;const pts=new Array(L);for(let t=t1;t>=t0;t--){pts[t-t0]=vertical?[lo+j,t]:[t,lo+j];j=back[(t-t0)*n+j];}
    let matched=0,gap=0,maxGap=0;for(const [x,y]of pts){const yes=score[y*w+x]>.35;matched+=yes;gap=yes?0:gap+1;maxGap=Math.max(maxGap,gap);}return {pts,cost:best/L,samples:L,matched,maxGap};
  }
  function mixedGood(p){return p&&p.samples>=100&&range(p.cost,0,.18)&&range(p.matched/p.samples,.88,1)&&range(p.maxGap,0,22);}
  function completeMixedRimsRGBA(rgba,w,h,baseline,log){
    if(!Array.isArray(baseline)||baseline.length!==3||baseline.some(p=>!p||p._identitySource||p._quad||p._outline||p._contours||!['x','y','w','h'].every(k=>finite(p[k])))||rgba?.length!==w*h*4||w<300||h<500||w>900||h>900)return[];
    const [body,...tails]=[...baseline].sort((a,b)=>a.y-b.y||a.x-b.x);if(body.x>.05||body.y>.03||body.w<.90||!range(body.h,.50,.70)||tails.some(p=>!range(p.w,.30,.60)||!range(p.h,.25,.45)||p.y<body.y+body.h||p.y+p.h<.94)||Math.abs(tails[0].y-tails[1].y)>.012||tails[0].x>.06||tails[1].x+tails[1].w<.94)return[];
    for(let i=3;i<rgba.length;i+=4)if(rgba[i]!==255)return[];
    const lum=luminanceRGBA(rgba,w,h),bank=[Math.round(tails[0].x*w),Math.round(Math.min(...tails.map(p=>p.y))*h),Math.round((tails[1].x+tails[1].w)*w)-1,Math.round(Math.min(...tails.map(p=>p.y+p.h))*h)-1];
    const [bx0,by0,bx1,by1]=bank,rails=branchBandCols(lum,w,bx0+Math.round(w*.08),bx1-Math.round(w*.08),by0+4,by1-4,50,.90);if(rails.length!==3||rails.some(r=>r.hi-r.lo>w*.025)){log?.('mixed rims: column rails '+rails.length);return[];}
    const widths=[rails[0].lo-bx0,rails[1].lo-rails[0].hi,rails[2].lo-rails[1].hi,bx1-rails[2].hi];if(widths.some(v=>!range(v/w,.10,.34)))return[];
    const cap=branchBandRows(lum,w,bx0,bx1,Math.max(0,by0-14),by0+4,50,.92);if(cap.length!==1)return[];
    const hs=mixedScores(rgba,w,h,false),vs=mixedScores(rgba,w,h,true),x0=Math.round(body.x*w)+Math.max(3,Math.round(w*.008)),x1=Math.round((body.x+body.w)*w)-Math.max(5,Math.round(w*.012));
    const ylo=Math.round(body.h*h*.28),yhi=cap[0].lo-Math.round(h*.025),starts=mixedBands(hs,w,h,false,x0,ylo,yhi),ends=mixedBands(hs,w,h,false,x1-7,ylo,yhi),candidates=[];
    for(const a of starts)for(const b of ends){if(Math.abs(a[0]-b[0])>h*.25)continue;const p=mixedPath(hs,w,h,false,x0,x1,ylo,yhi,a,b);if(mixedGood(p))candidates.push(p);}
    candidates.sort((a,b)=>a.cost-b.cost);const seams=[];for(const p of candidates){if(seams.some(q=>p.pts.some((v,i)=>Math.abs(v[1]-q.pts[i][1])<h*.022)))continue;seams.push(p);}seams.sort((a,b)=>a.pts[0][1]-b.pts[0][1]);if(seams.length!==2){log?.('mixed rims: horizontal seams '+seams.length+' candidates '+candidates.length);return[];}
    if(seams[0].pts.some((p,i)=>seams[1].pts[i][1]-p[1]<h*.045))return[];
    const upper=seams[0].pts,lower=seams[1].pts,top=Math.round(h*.05),bottom=Math.min(...upper.map(p=>p[1]))-10;
    const startsV=mixedBands(vs,w,h,true,top,x0+Math.round(w*.08),x1-Math.round(w*.06)),vertical=[];
    for(const a of startsV){const p=mixedPath(vs,w,h,true,top,bottom,x0+10,x1-10,a);if(!mixedGood(p)||vertical.some(q=>p.pts.some((v,i)=>Math.abs(v[0]-q.pts[i][0])<w*.04)))continue;vertical.push(p);}
    vertical.sort((a,b)=>a.pts[0][0]-b.pts[0][0]);if(vertical.length!==3){log?.('mixed rims: vertical seams '+vertical.length);return[];}
    const extend=(points,score,dir,limit)=>{let [x,y]=dir>0?points.at(-1):points[0];const out=[];while(dir>0?y<limit:y>limit){y+=dir;let best=-1,X=x;for(let dx=-3;dx<=3;dx++){const xx=x+dx;if(xx<=x0||xx>=x1)continue;const v=score[y*w+xx]-.025*Math.abs(dx);if(v>best){best=v;X=xx;}}x=X;out.push([x,y]);if(dir>0&&y>=upper[Math.max(0,Math.min(upper.length-1,x-x0))][1])break;}return dir>0?points.concat(out):out.reverse().concat(points);};
    const columns=vertical.map(p=>{const pts=extend(p.pts,vs,1,Math.max(...upper.map(q=>q[1]))),a=p.pts[0],b=p.pts[Math.min(16,p.pts.length-1)],slope=(b[0]-a[0])/(b[1]-a[1]),prefix=[];let x=a[0];for(let y=a[1]-1;y>=0;y--){const predicted=a[0]+slope*(y-a[1]);let best=-1,X=Math.round(predicted);for(let xx=Math.max(x0+1,x-3);xx<=Math.min(x1-1,x+3);xx++){if(Math.abs(xx-predicted)>10)continue;const v=vs[y*w+xx]-.04*Math.abs(xx-x)-.025*Math.abs(xx-predicted);if(v>best){best=v;X=xx;}}x=X;prefix.push([x,y]);}return prefix.reverse().concat(pts);});
    // Top caps use the local pale rim; an edge-bleed first frame may terminate
    // at the image edge. No line through lettering becomes an internal owner.
    const capPaths=[],topXs=[x0,...columns.map(q=>q[0][0]),x1];for(let i=0;i<4;i++){const L=topXs[i],R=topXs[i+1];if(R-L<w*.045)return[];if(i===0){capPaths.push([[L,0],[R,0]]);continue;}const p=mixedPath(hs,w,h,false,L,R,0,Math.round(h*.045),[0,Math.round(h*.025)]);if(!p||p.cost>.30)return[];capPaths.push(p.pts.filter(([x,y])=>(!i||x>=columns[i-1][Math.min(y,columns[i-1].length-1)][0])&&(i===3||x<=columns[i][Math.min(y,columns[i].length-1)][0])));}
    const outlines=[];
    for(let i=0;i<4;i++){const capPath=capPaths[i],L=i?columns[i-1]:[[x0,0],[x0,upper[0][1]]],R=i<3?columns[i]:[[x1,capPath.at(-1)[1]],[x1,upper.at(-1)[1]]];const ly=capPath[0][1],ry=capPath.at(-1)[1],lp=L.filter(p=>p[1]>=ly),rp=R.filter(p=>p[1]>=ry),a=lp.at(-1)[0],b=rp.at(-1)[0];if(b-a<w*.06)return[];const floor=upper.filter(p=>p[0]>=a&&p[0]<=b);outlines.push([...capPath,...rp,...floor.reverse(),...lp.reverse()]);}
    outlines.push([...upper,...lower.slice().reverse()]);outlines.push([...lower,[bx1+1,cap[0].lo],[bx0,cap[0].lo]]);
    for(let i=0;i<4;i++){const L=i?rails[i-1].hi+1:bx0,R=i<3?rails[i].lo:bx1+1;outlines.push([[L,by0],[R,by0],[R,by1+1],[L,by1+1]]);}
    const qs=outlines.map(q=>{const out=[];for(const p of q)if(!out.length||p[0]!==out.at(-1)[0]||p[1]!==out.at(-1)[1])out.push(p);return simplifyPath(out.concat([out[0]]),.6).slice(0,-1);});
    const stats=qs.map(q=>regionStatsPolygon(lum,w,q));if(stats.some(st=>st.pixels<w*h*.025||st.variance<450)){log?.('mixed rims: texture withheld');return[];}
    const proof={version:9,method:MIXED_RIMS_METHOD,connected:true,analysisWidth:w,analysisHeight:h,baselineCount:3,count:10,rails,cap:cap[0],seams:seams.map(({pts,...p})=>p),vertical:vertical.map(({pts,...p})=>p),outlines:qs};
    const out=qs.map((q,index)=>{const xs=q.map(p=>p[0]),ys=q.map(p=>p[1]),a=Math.min(...xs),b=Math.min(...ys),c=Math.max(...xs),d=Math.max(...ys);return {x:a/w,y:b/h,w:(c-a)/w,h:(d-b)/h,_identitySource:'structural-grid-frame',_geometryOwner:'structural-grid-outline',_geometryType:'mixed-rim-network',_outline:q.map(([x,y])=>({x:x/w,y:y/h})),_structuralGridProof:{...proof,index,pixelOutline:q,stats:stats[index]}};});
    if(!out.every(validPanel)){log?.('mixed rims: proof withheld');return[];}log?.('mixed rims: complete 10-frame network');return out;
  }
  function validMixedRimsPanel(p){try{const pr=p?._structuralGridProof,w=pr?.analysisWidth,h=pr?.analysisHeight;if(p?._identitySource!=='structural-grid-frame'||pr.version!==9||pr.method!==MIXED_RIMS_METHOD||pr.connected!==true||pr.baselineCount!==3||pr.count!==10||!Number.isInteger(pr.index)||!range(pr.index,0,9)||!Number.isInteger(w)||!Number.isInteger(h)||!range(w,300,900)||!range(h,500,900)||!Array.isArray(pr.rails)||pr.rails.length!==3||pr.rails.some(r=>!range(r.meanDark,.90,1)||!range(r.maxDark,.90,1))||!range(pr.cap?.meanDark,.92,1)||!Array.isArray(pr.seams)||pr.seams.length!==2||pr.seams.some(s=>!mixedGood(s))||!Array.isArray(pr.vertical)||pr.vertical.length!==3||pr.vertical.some(s=>!mixedGood(s))||!Array.isArray(pr.outlines)||pr.outlines.length!==10)return false;
    const q=pr.outlines[pr.index];if(q.length<4||q.length>1800||q.some(v=>!Array.isArray(v)||v.length!==2||!range(v[0],0,w)||!range(v[1],0,h))||JSON.stringify(q)!==JSON.stringify(pr.pixelOutline)||JSON.stringify(p._outline)!==JSON.stringify(q.map(([x,y])=>({x:x/w,y:y/h})))||polyArea(q)<w*h*.025||!range(pr.stats?.variance,450,16257)||!range(pr.stats?.pixels,w*h*.025,w*h*.40))return false;const xs=q.map(v=>v[0]),ys=q.map(v=>v[1]),a=Math.min(...xs),b=Math.min(...ys),c=Math.max(...xs),d=Math.max(...ys);return ['x','y','w','h'].every(k=>finite(p[k]))&&Math.max(Math.abs(p.x-a/w),Math.abs(p.y-b/h),Math.abs(p.w-(c-a)/w),Math.abs(p.h-(d-b)/h))<1e-10;
  }catch(_){return false;}}
  function completeMixedRimsImage(img,baseline,log){
    if(typeof PanelMatteCells==='undefined'||typeof PanelDetect==='undefined'||!Array.isArray(baseline)||baseline.length!==3||baseline.some(p=>!p||p._identitySource||p._outline||p._quad||p._contours))return[];const W=img.naturalWidth||img.width,H=img.naturalHeight||img.height;if(!W||!H||W*H>24000000)return[];const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d',{willReadFrequently:true});if(!g)return[];g.drawImage(img,0,0);const scale=Math.min(1,900/Math.max(W,H)),w=Math.round(W*scale),h=Math.round(H*scale),rgba=PanelMatteCells.sampleBilinearRGBA(g.getImageData(0,0,W,H).data,W,H,w,h);const sampled=document.createElement('canvas');sampled.width=w;sampled.height=h;sampled.getContext('2d').putImageData(new ImageData(rgba,w,h),0,0);const canonical=PanelDetect._analyze(sampled);return completeMixedRimsRGBA(rgba,w,h,canonical,log);
  }

  const WHITE_STACK_METHOD='native-white-stack-with-independent-inset-rims';
  function whiteComponents(lum,w,h){
    const ids=new Int32Array(w*h),queue=new Int32Array(w*h),items=[];let id=0;
    for(let seed=0;seed<ids.length;seed++)if(lum[seed]>220&&!ids[seed]){id++;let head=0,n=1,x0=w,y0=h,x1=0,y1=0;queue[0]=seed;ids[seed]=id;while(head<n){const i=queue[head++],x=i%w,y=i/w|0;x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);const add=j=>{if(!ids[j]&&lum[j]>220){ids[j]=id;queue[n++]=j;}};if(x)add(i-1);if(x<w-1)add(i+1);if(y)add(i-w);if(y<h-1)add(i+w);}if(n>=1)items.push({id,pixels:n,box:[x0,y0,x1+1,y1+1]});}return {ids,items};
  }
  function whiteInsetRims(lum,w,h,box,allowCaption=false){
    const [x0,y0,x1,y1]=box,raw=[],minimum=allowCaption?Math.max(h*.065,(y1-y0)*.12):Math.max(h*.07,(y1-y0)*.40);
    for(let x=x0+12;x<x1-12;x++){let start=-1;for(let y=y0+8;y<=y1-7;y++){const dark=y<y1-7&&Math.min(lum[y*w+x-1],lum[y*w+x],lum[y*w+x+1])<65;if(dark&&start<0)start=y;if(!dark&&start>=0){if(y-start>=minimum)raw.push({x,lo:start,hi:y});start=-1;}}}
    const groups=[];for(const r of raw){const g=groups.find(g=>r.x-g.at(-1).x<=1&&r.x>=g.at(-1).x&&Math.min(r.hi,g[0].hi)-Math.max(r.lo,g[0].lo)>=minimum*.8);if(g)g.push(r);else groups.push([r]);}
    const median=a=>a.sort((a,b)=>a-b)[a.length>>1],rails=groups.filter(g=>g.length>=2&&g.length<=12).map(g=>({x:median(g.map(r=>r.x)),lo:median(g.map(r=>r.lo)),hi:median(g.map(r=>r.hi)),left:g[0].x+1,right:g.at(-1).x})),out=[];
    const horizontal=(y,L,R)=>{let n=0,dark=0;for(let x=L+3;x<R-2;x++){n++;let v=255;for(let d=-2;d<=2;d++)v=Math.min(v,lum[(y+d)*w+x]);dark+=v<65;}return {samples:n,dark};};
    for(let i=0;i<rails.length;i++)for(let j=i+1;j<rails.length;j++){const a=rails[i],b=rails[j];if(!range((b.x-a.x)/w,.20,.50)||Math.abs(a.lo-b.lo)>5||Math.abs(a.hi-b.hi)>(allowCaption?100:5))continue;const top=Math.min(a.lo,b.lo)-1,bottom=Math.max(a.hi,b.hi),A=horizontal(top,a.x,b.x),B=horizontal(bottom-1,a.x,b.x);if(A.dark/A.samples<.68||B.dark/B.samples<.48)continue;out.push({box:[a.left,top,b.right,bottom],left:a,right:b,top:A,bottom:B});}return out;
  }
  function completeWhiteStackRGBA(rgba,w,h,baseline,log){
    if(typeof PanelMatteCells==='undefined'||!Array.isArray(baseline)||baseline.length!==2||baseline.some(p=>!p||p._identitySource||p._quad||p._outline||p._contours)||rgba?.length!==w*h*4||w<300||h<500||w>900||h>900)return[];
    const sorted=[...baseline].sort((a,b)=>a.y-b.y),anchor=sorted[0],parent=sorted[1];if(sorted.some(p=>!range(p.w,.85,.98)||p.x>.08)||anchor.y>.06||!range(anchor.h,.20,.42)||!range(parent.h,.50,.72)||parent.y<anchor.y+anchor.h||parent.y+parent.h<.94)return[];
    const lum=luminanceRGBA(rgba,w,h);let edge=0,white=0;for(let i=0;i<w*h;i++){if(rgba[i*4+3]!==255)return[];if(i<w||i>=(h-1)*w||i%w===0||i%w===w-1){edge++;white+=lum[i]>225;}}if(white/edge<.98)return[];
    const x0=Math.round(Math.max(...sorted.map(p=>p.x))*w)+3,x1=Math.round(Math.min(...sorted.map(p=>p.x+p.w))*w)-5,rows=branchBandRows(lum,w,x0,x1,Math.round(anchor.y*h)-5,Math.min(h-1,Math.round((parent.y+parent.h)*h)+4),75,.76);if(rows.length!==8){log?.('white stack: horizontal rims '+rows.length);return[];}
    const boxes=[];for(let i=0;i<4;i++){const top=rows[i*2].lo-1,bottom=rows[i*2+1].hi+1;if(bottom-top<h*.10||top<0||bottom>=h)return[];const left=branchBandCols(lum,w,Math.max(0,x0-12),x0+5,top+6,bottom-6,75,.94),right=branchBandCols(lum,w,x1-5,Math.min(w-1,x1+12),top+6,bottom-6,75,.94);if(left.length!==1||right.length!==1)return[];boxes.push([left[0].lo,top,right[0].hi+1,bottom+1]);}
    const insetRows=boxes.slice(1).map(b=>whiteInsetRims(lum,w,h,b));if(insetRows[0].length!==1||insetRows[1].length!==0||insetRows[2].length!==1){log?.('white stack: inset rims '+insetRows.map(r=>r.length));return[];}
    const insets=[insetRows[0][0],insetRows[2][0]],labels=new Uint16Array(w*h),fill=(b,id)=>{for(let y=b[1];y<b[3];y++)for(let x=b[0];x<b[2];x++)labels[y*w+x]=id;};boxes.slice(1).forEach((b,i)=>fill(b,i+1));insets.forEach((p,i)=>fill(p.box,4+i));
    const cc=whiteComponents(lum,w,h),attachments=[];
    for(let k=0;k<insets.length;k++){const [L,T,R,B]=insets[k].box,owner=k+4,caption=[];
      for(const c of cc.items){const [a,b,z,d]=c.box;if(a<L||z>R||b>B||d<=B||d-B>h*.045||z-a<w*.09||d-b<h*.02||c.pixels/((z-a)*(d-b))<.55)continue;let samples=0,dark=0;for(let x=a;x<z;x++)for(const y of [b-1,d]){samples++;let v=255;for(let dd=-2;dd<=2;dd++)if(y+dd>=0&&y+dd<h)v=Math.min(v,lum[(y+dd)*w+x]);dark+=v<100;}for(let y=b;y<d;y++)for(const x of [a-1,z]){samples++;let v=255;for(let dd=-2;dd<=2;dd++)if(x+dd>=0&&x+dd<w)v=Math.min(v,lum[y*w+x+dd]);dark+=v<100;}if(dark/samples<.80)continue;const box=[a-1,b-1,z+1,d+1];fill(box,owner);caption.push({box,samples,dark});}
      if(caption.length>1||(insets[k].bottom.dark/insets[k].bottom.samples<.85&&caption.length!==1))return[];
      // White outlined lettering may protrude across the top rim. Only a
      // compact component chain touching that rim can join the inset mask.
      const near=cc.items.filter(c=>c.pixels<1500&&c.box[1]<T+12&&c.box[3]>=T-25&&c.box[0]<R&&c.box[2]>L-40&&c.box[1]>=T-35&&c.box[3]-c.box[1]<40&&c.box[2]-c.box[0]<100),chosen=[];
      const gap=(a,b)=>Math.hypot(Math.max(0,a[0]-b[2],b[0]-a[2]),Math.max(0,a[1]-b[3],b[1]-a[3]));let added=true;while(added){added=false;for(const c of near)if(!chosen.includes(c)&&((c.box[3]>=T-2&&c.box[2]>=L&&c.box[0]<=R)||chosen.some(a=>gap(a.box,c.box)<=6))){chosen.push(c);added=true;}}
      if(insets[k].top.dark/insets[k].top.samples<.85&&!chosen.length)return[];const ids=new Set(chosen.map(c=>c.id));let effectPixels=0;for(let i=0;i<labels.length;i++)if(ids.has(cc.ids[i])){const x=i%w,y=i/w|0;for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const X=x+dx,Y=y+dy;if(X>=0&&X<w&&Y>=0&&Y<h){const j=Y*w+X;if(labels[j]!==owner)effectPixels++;labels[j]=owner;}}}attachments.push({caption,effectComponents:chosen.map(c=>({pixels:c.pixels,box:c.box})),effectPixels});
    }
    const proof={version:10,method:WHITE_STACK_METHOD,connected:true,analysisWidth:w,analysisHeight:h,baselineCount:2,count:5,rows,boxes,insets,attachments,edgeSamples:edge,edgeWhite:white},out=[];
    for(let id=1;id<=5;id++){const rings=PanelMatteCells.tracePixelContours(labels,w,h,id);if(!rings)return[];let pixels=0,sum=0,sq=0;for(let i=0;i<labels.length;i++)if(labels[i]===id){pixels++;sum+=lum[i];sq+=lum[i]*lum[i];}const pts=rings.flat(),xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]),a=Math.min(...xs),b=Math.min(...ys),c=Math.max(...xs),d=Math.max(...ys);const p={x:a/w,y:b/h,w:(c-a)/w,h:(d-b)/h,_identitySource:'structural-grid-frame',_geometryOwner:'structural-grid-contours',_geometryType:'white-stack-with-inset-ownership',_contours:rings.map(q=>q.map(([x,y])=>({x:x/w,y:y/h}))),_structuralGridProof:{...proof,index:id-1,pixelContours:rings,pixels,variance:sq/pixels-(sum/pixels)**2}};if(!validPanel(p)){log?.('white stack: proof withheld '+id);return[];}out.push(p);}
    log?.('white stack: preserved top owner + five exclusive lower owners');return [anchor,out[0],out[3],out[1],out[2],out[4]];
  }
  function validWhiteStackPanel(p){try{const pr=p?._structuralGridProof,w=pr?.analysisWidth,h=pr?.analysisHeight;if(p?._identitySource!=='structural-grid-frame'||pr?.version!==10||pr.method!==WHITE_STACK_METHOD||pr.connected!==true||pr.baselineCount!==2||pr.count!==5||!Number.isInteger(pr.index)||!range(pr.index,0,4)||!Number.isInteger(w)||!Number.isInteger(h)||!range(w,300,900)||!range(h,500,900)||!range(pr.edgeWhite/pr.edgeSamples,.98,1)||!Array.isArray(pr.rows)||pr.rows.length!==8||pr.rows.some(r=>!range(r.meanDark,.76,1))||!Array.isArray(pr.insets)||pr.insets.length!==2||pr.insets.some(i=>!range(i.top.dark/i.top.samples,.68,1)||!range(i.bottom.dark/i.bottom.samples,.48,1))||!Array.isArray(pr.attachments)||pr.attachments.length!==2||pr.attachments.some(a=>a.caption.some(c=>!range(c.dark/c.samples,.80,1)))||!range(pr.variance,200,16257))return false;
    if(pr.insets.some((r,i)=>(r.bottom.dark/r.bottom.samples<.85&&pr.attachments[i].caption.length!==1)||(r.top.dark/r.top.samples<.85&&!pr.attachments[i].effectComponents.length)))return false;const rings=pr.pixelContours;if(!Array.isArray(rings)||!range(rings.length,1,64)||rings.some(q=>!Array.isArray(q)||!range(q.length,4,4096)||q.some((v,i)=>!Array.isArray(v)||v.length!==2||!Number.isInteger(v[0])||!Number.isInteger(v[1])||!range(v[0],0,w)||!range(v[1],0,h)||(v[0]!==q[(i+1)%q.length][0]&&v[1]!==q[(i+1)%q.length][1]))))return false;
    const signed=q=>q.reduce((s,a,i)=>{const b=q[(i+1)%q.length];return s+a[0]*b[1]-b[0]*a[1];},0)/2;if(!Number.isInteger(pr.pixels)||pr.pixels!==rings.reduce((s,q)=>s+signed(q),0)||!range(pr.pixels/(w*h),.025,.30)||JSON.stringify(p._contours)!==JSON.stringify(rings.map(q=>q.map(([x,y])=>({x:x/w,y:y/h})))))return false;const pts=rings.flat(),xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]),a=Math.min(...xs),b=Math.min(...ys),c=Math.max(...xs),d=Math.max(...ys);return ['x','y','w','h'].every(k=>finite(p[k]))&&Math.max(Math.abs(p.x-a/w),Math.abs(p.y-b/h),Math.abs(p.w-(c-a)/w),Math.abs(p.h-(d-b)/h))<1e-10;
  }catch(_){return false;}}
  function completeWhiteStackImage(img,baseline,log){
    if(typeof PanelMatteCells==='undefined'||!Array.isArray(baseline)||baseline.length!==2||baseline.some(p=>!p||p._identitySource||p._quad||p._outline||p._contours))return[];const W=img.naturalWidth||img.width,H=img.naturalHeight||img.height;if(!W||!H||W*H>24000000)return[];const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d',{willReadFrequently:true});if(!g)return[];g.drawImage(img,0,0);const s=Math.min(1,900/Math.max(W,H)),w=Math.round(W*s),h=Math.round(H*s),rgba=PanelMatteCells.sampleBilinearRGBA(g.getImageData(0,0,W,H).data,W,H,w,h);const sampled=document.createElement('canvas');sampled.width=w;sampled.height=h;sampled.getContext('2d').putImageData(new ImageData(rgba,w,h),0,0);const canonical=PanelDetect._analyze(sampled),out=completeWhiteStackRGBA(rgba,w,h,canonical,log);if(out.length)out[0]=[...baseline].sort((a,b)=>a.y-b.y)[0];return out;
  }

  const THIN_RIM_METHOD='native-thin-gutter-independent-four-rims';
  // Grid leaves are proposals only: every edge must have a sustained dark rim
  // and white paper immediately outside it. Never lower the legacy gutter cut.
  function thinRim(lum,w,h,axis,guess,a,b,direction,radius=30,minimumWhite=.92){
    const limit=axis==='V'?w:h,other=axis==='V'?h:w;
    a=Math.max(10,a+10);b=Math.min(other-11,b-10);if(b-a<45)return null;
    const at=(q,t)=>axis==='V'?lum[t*w+q]:lum[q*w+t];let best=null;
    for(let q=Math.max(8,guess-radius);q<=Math.min(limit-9,guess+radius);q++){
      let dark=0,white=0,both=0;const samples=b-a+1;
      for(let t=a;t<=b;t++){const black=at(q,t)<65;let paper=0;for(let k=3;k<=7;k++)paper=Math.max(paper,at(q+direction*k,t));dark+=black;white+=paper>220;both+=black&&paper>220;}
      const score=dark/samples+white/samples+both/samples-.0001*Math.abs(q-guess);
      if(dark/samples>=.88&&white/samples>=minimumWhite&&both/samples>=Math.min(.85,minimumWhite-.02)&&(!best||score>best.score))best={axis,pos:q,a,b,direction,samples,dark,white,both,score};
    }return best;
  }
  function completeThinRimsRGBA(rgba,w,h,baseline,log){
    if(!(rgba instanceof Uint8ClampedArray||rgba instanceof Uint8Array)||rgba.length!==w*h*4||!range(w,300,900)||!range(h,500,900)||!Array.isArray(baseline)||baseline.length!==2||baseline.some(p=>!p||p._identitySource||p._quad||p._outline||p._contours))return[];
    const slabs=[...baseline].sort((a,b)=>a.y-b.y),upper=slabs[0],bottom=slabs[1];
    if(!range(upper.h,.63,.78)||!range(bottom.h,.18,.34)||slabs.some(p=>p.x>.06||p.w<.88)||upper.y>.04||bottom.y+bottom.h<.94)return[];
    for(let i=3;i<rgba.length;i+=4)if(rgba[i]!==255)return[];
    const grid=partitionRGBA(rgba,w,h,log);if(!grid||grid.cells.length!==5)return[];
    const cells=grid.cells.filter(c=>(c.box[1]+c.box[3])/2<(upper.y+upper.h)*h);
    if(cells.length!==4)return[];const lum=luminanceRGBA(rgba,w,h),boxes=[],rims=[];
    for(const cell of cells){const [a,b,c,d]=cell.box,edges=[thinRim(lum,w,h,'V',a,b,d,-1),thinRim(lum,w,h,'V',c,b,d,1),thinRim(lum,w,h,'H',b,a,c,-1),thinRim(lum,w,h,'H',d,a,c,1)];if(edges.some(e=>!e))return[];
      const box=[edges[0].pos-3,edges[2].pos-3,edges[1].pos+4,edges[3].pos+4];if(box[0]<0||box[1]<0||box[2]>w||box[3]>h||box[2]-box[0]<w*.12||box[3]-box[1]<h*.08)return[];boxes.push(box);rims.push(edges);
    }
    // Require a tall left frame, two right frames and one full-width strip.
    const [left,top,right,strip]=boxes;
    if(!(left[0]<top[0]&&Math.abs(left[1]-top[1])<=7&&Math.abs(left[3]-right[3])<=7&&Math.abs(top[0]-right[0])<=7&&strip[1]>=left[3]&&strip[2]-strip[0]>w*.88&&strip[3]<=bottom.y*h+3))return[];
    let area=0;for(let i=0;i<boxes.length;i++){const a=boxes[i];area+=(a[2]-a[0])*(a[3]-a[1]);for(let j=0;j<i;j++){const b=boxes[j];if(Math.min(a[2],b[2])>Math.max(a[0],b[0])&&Math.min(a[3],b[3])>Math.max(a[1],b[1]))return[];}}
    const coverage=area/(upper.w*upper.h*w*h);if(!range(coverage,.88,1.08))return[];
    const out=boxes.map((box,index)=>{const [a,b,c,d]=box,q=[[a,b],[c,b],[c,d],[a,d]];return{x:a/w,y:b/h,w:(c-a)/w,h:(d-b)/h,_identitySource:'structural-grid-frame',_geometryOwner:'structural-grid-outline',_geometryType:'orthogonal',_outline:q.map(([x,y])=>({x:x/w,y:y/h})),_structuralGridProof:{version:11,method:THIN_RIM_METHOD,connected:true,analysisWidth:w,analysisHeight:h,count:4,index,boxes,rims,coverage,box,stats:statsRect(lum,w,[a,b,c-1,d-1])}};});
    if(!out.every(validPanel))return[];log?.('thin-gutter completion: four independently framed upper scenes; bottom owner preserved');return out.concat(bottom);
  }
  function validThinRimsPanel(p){try{const pr=p?._structuralGridProof,w=pr?.analysisWidth,h=pr?.analysisHeight;
    if(p?._identitySource!=='structural-grid-frame'||pr?.version!==11||pr.method!==THIN_RIM_METHOD||pr.connected!==true||pr.count!==4||!Number.isInteger(pr.index)||!range(pr.index,0,3)||!Number.isInteger(w)||!Number.isInteger(h)||!range(w,300,900)||!range(h,500,900)||!range(pr.coverage,.88,1.08)||pr.boxes?.length!==4||pr.rims?.length!==4)return false;
    for(let i=0;i<4;i++){const box=pr.boxes[i],edges=pr.rims[i];if(!Array.isArray(box)||box.length!==4||box.some(v=>!Number.isInteger(v))||box[0]<0||box[1]<0||box[2]>w||box[3]>h||box[2]<=box[0]||box[3]<=box[1]||edges?.length!==4)return false;
      for(let j=0;j<4;j++){const e=edges[j];if(e.axis!==(j<2?'V':'H')||e.direction!==(j%2?1:-1)||!Number.isInteger(e.pos)||!Number.isInteger(e.a)||!Number.isInteger(e.b)||e.samples!==e.b-e.a+1||e.samples<46||!range(e.dark/e.samples,.88,1)||!range(e.white/e.samples,.92,1)||!range(e.both/e.samples,.85,1))return false;}
      if(JSON.stringify(box)!==JSON.stringify([edges[0].pos-3,edges[2].pos-3,edges[1].pos+4,edges[3].pos+4]))return false;
    }
    const box=pr.boxes[pr.index];if(JSON.stringify(box)!==JSON.stringify(pr.box))return false;const[a,b,c,d]=box;if(!validStats(pr.stats,(c-a)*(d-b)))return false;
    const q=[[a,b],[c,b],[c,d],[a,d]].map(([x,y])=>({x:x/w,y:y/h}));return JSON.stringify(q)===JSON.stringify(p._outline)&&['x','y','w','h'].every((k,i)=>Math.abs(p[k]-[a/w,b/h,(c-a)/w,(d-b)/h][i])<1e-10);
  }catch(_){return false;}}
  function completeThinRimsImage(img,baseline,log){
    if(typeof PanelMatteCells==='undefined'||!Array.isArray(baseline)||baseline.length!==2||baseline.some(p=>p._identitySource||p._outline||p._quad||p._contours))return[];
    const W=img.naturalWidth||img.width,H=img.naturalHeight||img.height;if(!W||!H||W*H>24000000)return[];
    const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d',{willReadFrequently:true});if(!g)return[];g.drawImage(img,0,0);const s=Math.min(1,900/Math.max(W,H)),w=Math.round(W*s),h=Math.round(H*s),rgba=PanelMatteCells.sampleBilinearRGBA(g.getImageData(0,0,W,H).data,W,H,w,h);
    const sampled=document.createElement('canvas');sampled.width=w;sampled.height=h;sampled.getContext('2d').putImageData(new ImageData(rgba,w,h),0,0);const out=completeThinRimsRGBA(rgba,w,h,PanelDetect._analyze(sampled),log);if(out.length)out[out.length-1]=[...baseline].sort((a,b)=>a.y-b.y)[1];return out;
  }

  const PAPER_INSET_METHOD='native-exterior-paper-frames-and-enclosed-inset';
  function paperComponents(lum,w,h){
    const outside=new Uint8Array(w*h),queue=new Int32Array(w*h);let n=0,head=0;
    const add=i=>{if(!outside[i]&&lum[i]>220){outside[i]=1;queue[n++]=i;}};
    for(let x=0;x<w;x++){add(x);add((h-1)*w+x);}for(let y=0;y<h;y++){add(y*w);add(y*w+w-1);}
    while(head<n){const i=queue[head++],x=i%w,y=i/w|0;if(x)add(i-1);if(x<w-1)add(i+1);if(y)add(i-w);if(y<h-1)add(i+w);}
    const seen=outside.slice(),items=[];for(let seed=0;seed<seen.length;seed++)if(!seen[seed]){head=0;n=1;queue[0]=seed;seen[seed]=1;let a=w,b=h,c=0,d=0;while(head<n){const i=queue[head++],x=i%w,y=i/w|0;a=Math.min(a,x);b=Math.min(b,y);c=Math.max(c,x+1);d=Math.max(d,y+1);const put=j=>{if(!seen[j]){seen[j]=1;queue[n++]=j;}};if(x)put(i-1);if(x<w-1)put(i+1);if(y)put(i-w);if(y<h-1)put(i+w);}if(n>=250)items.push({box:[a,b,c,d],pixels:n});}return items;
  }
  function completePaperInsetsRGBA(rgba,w,h,baseline,log){
    if(typeof PanelMatteCells==='undefined'||!(rgba instanceof Uint8Array||rgba instanceof Uint8ClampedArray)||!Number.isInteger(w)||!Number.isInteger(h)||!range(w,300,900)||!range(h,500,900)||rgba.length!==w*h*4||!Array.isArray(baseline)||!range(baseline.length,2,4)||baseline.some(p=>!p||p._identitySource||p._quad||p._outline||p._contours))return[];
    const lum=luminanceRGBA(rgba,w,h);let edge=0,white=0;for(let i=0;i<lum.length;i++){if(rgba[i*4+3]!==255)return[];if(i<w||i>=(h-1)*w||i%w===0||i%w===w-1){edge++;white+=lum[i]>225;}}if(white/edge<.98)return[];
    const components=paperComponents(lum,w,h),frames=[],unframed=[];
    for(const component of components){const [a,b,c,d]=component.box;
      if(component.pixels/((c-a)*(d-b))<.87||c-a<w*.17||d-b<h*.085){unframed.push(component);continue;}
      const rims=[thinRim(lum,w,h,'V',a,b,d,-1,40),thinRim(lum,w,h,'V',c,b,d,1,40),thinRim(lum,w,h,'H',b,a,c,-1,40),thinRim(lum,w,h,'H',d,a,c,1,40)];
      // A borderless neighbor's objects can touch one otherwise continuous rim.
      // Permit this only below a proved frame with the very same left rail.
      let shared=false;if(!rims[0]&&rims.slice(1).every(Boolean)){const e=thinRim(lum,w,h,'V',a,b,d,-1,40,.80);if(e&&e.dark/e.samples>=.98&&frames.some(f=>Math.abs(f.rims[0].pos-e.pos)<=3&&f.box[3]<=b&&b-f.box[3]<h*.03)){rims[0]=e;shared=true;}}
      if(rims.some(e=>!e))return[];
      const box=[rims[0].pos-3,rims[2].pos-3,rims[1].pos+4,rims[3].pos+4];if(box[0]<0||box[1]<0||box[2]>w||box[3]>h)return[];frames.push({box,rims,shared,component});
    }
    if(!range(frames.length,3,6))return[];
    let open=null;
    const shared=frames.filter(f=>f.shared);if(shared.length){if(shared.length!==1||frames.length!==4)return[];const lower=shared[0],upper=frames.find(f=>f!==lower&&Math.abs(f.box[0]-lower.box[0])<=3&&f.box[3]<=lower.box[1]&&lower.box[1]-f.box[3]<h*.03);if(!upper)return[];
      const left=Math.min(...frames.map(f=>f.box[0])),box=[left,upper.box[1],Math.min(upper.box[0],lower.box[0]),lower.box[3]],contained=unframed.filter(c=>c.box[0]>=box[0]&&c.box[2]<=box[2]&&c.box[1]>=box[1]&&c.box[3]<=box[3]);
      if(contained.length<3||box[2]-box[0]<w*.25||box[3]-box[1]<h*.40)return[];open={box,components:contained,neighborBoxes:[upper.box,lower.box]};
    }else if(unframed.some(c=>c.pixels>w*h*.015))return[];
    // This route requires exactly one separately enclosed inset. Main frames
    // come from exterior paper, so framed pictures inside scenes are not cells.
    const insetCandidates=[];for(const f of frames)for(const inset of whiteInsetRims(lum,w,h,f.box,true)){if(inset.top.dark/inset.top.samples>=.90&&inset.bottom.dark/inset.bottom.samples>=.90)insetCandidates.push({parent:f,...inset});}
    if(insetCandidates.length!==1)return[];const inset=insetCandidates[0],ib=inset.box;if(inset.parent.box[2]-inset.parent.box[0]<w*.85)return[];
    if(ib[0]-inset.parent.box[0]<8||ib[1]-inset.parent.box[1]<8||inset.parent.box[2]-ib[2]<8||inset.parent.box[3]-ib[3]<8)return[];
    const mains=frames.map(f=>({...f,kind:'frame'}));if(open)mains.push({...open,kind:'open'});
    // Group only near-equal top edges; preserve normal left-to-right reading.
    mains.sort((a,b)=>Math.abs(a.box[1]-b.box[1])<=h*.015?a.box[0]-b.box[0]:a.box[1]-b.box[1]);
    for(let i=0;i<mains.length;i++)for(let j=0;j<i;j++){const a=mains[i].box,b=mains[j].box;if(Math.min(a[2],b[2])>Math.max(a[0],b[0])&&Math.min(a[3],b[3])>Math.max(a[1],b[1]))return[];}
    const parentIndex=mains.findIndex(f=>f.box===inset.parent.box),owners=mains.flatMap((f,i)=>i===parentIndex?[f,{box:ib,kind:'inset'}]:[f]),labels=new Uint16Array(w*h);
    const fill=(b,id)=>{for(let y=b[1];y<b[3];y++)for(let x=b[0];x<b[2];x++)labels[y*w+x]=id;};owners.forEach((f,i)=>fill(f.box,i+1));const insetIndex=parentIndex+1,insetId=insetIndex+1;
    const cc=whiteComponents(lum,w,h),attachments=[];
    for(const c of cc.items){const[a,b,z,d]=c.box;if(c.pixels<50||c.pixels>w*h*.02||z-a>w*.20||d-b>h*.15||a>=ib[0]&&b>=ib[1]&&z<=ib[2]&&d<=ib[3]||z<=ib[0]||a>=ib[2]||d<=ib[1]||b>=ib[3])continue;let inside=0;for(let y=b;y<d;y++)for(let x=a;x<z;x++)if(cc.ids[y*w+x]===c.id&&x>=ib[0]&&x<ib[2]&&y>=ib[1]&&y<ib[3])inside++;
      if(!range(inside/c.pixels,.05,.90))continue;const parent=inset.parent.box;if(a-2<parent[0]||b-2<parent[1]||z+2>parent[2]||d+2>parent[3])return[];
      // Fill enclosed lettering holes row-wise, then retain the black outline.
      for(let y=b;y<d;y++){let lo=w,hi=-1;for(let x=a;x<z;x++)if(cc.ids[y*w+x]===c.id){lo=Math.min(lo,x);hi=Math.max(hi,x);}if(hi<lo)continue;for(let Y=y-2;Y<=y+2;Y++)for(let X=lo-2;X<=hi+2;X++)labels[Y*w+X]=insetId;}
      attachments.push({box:c.box,pixels:c.pixels,inside});
    }
    if(attachments.length>1)return[];
    const missing=Math.abs(inset.left.hi-inset.right.hi)>5;if(missing&&attachments.length!==1)return[];
    const evidence={version:12,method:PAPER_INSET_METHOD,connected:true,analysisWidth:w,analysisHeight:h,count:owners.length,frames:frames.map(f=>({box:f.box,rims:f.rims,shared:f.shared})),open,inset:{box:ib,left:inset.left,right:inset.right,top:inset.top,bottom:inset.bottom,parentBox:inset.parent.box},attachments,edge,white,ownerBoxes:owners.map(f=>f.box),parentIndex,insetIndex};
    const out=[];for(let id=1;id<=owners.length;id++){const f=owners[id-1],box=f.box,rect={x:box[0]/w,y:box[1]/h,w:(box[2]-box[0])/w,h:(box[3]-box[1])/h};
      const anchor=f.kind==='frame'&&id-1!==parentIndex?baseline.find(p=>overlap(p,rect)/Math.max(p.w*p.h,rect.w*rect.h)>.94):null;if(anchor){out.push(anchor);continue;}
      const rings=PanelMatteCells.tracePixelContours(labels,w,h,id);if(!rings)return[];let pixels=0,sum=0,sq=0;for(let i=0;i<labels.length;i++)if(labels[i]===id){pixels++;sum+=lum[i];sq+=lum[i]*lum[i];}const pts=rings.flat(),a=Math.min(...pts.map(p=>p[0])),b=Math.min(...pts.map(p=>p[1])),c=Math.max(...pts.map(p=>p[0])),d=Math.max(...pts.map(p=>p[1]));
      const p={x:a/w,y:b/h,w:(c-a)/w,h:(d-b)/h,_identitySource:'structural-grid-frame',_geometryOwner:'structural-grid-contours',_geometryType:'paper-frame-inset-ownership',_contours:rings.map(q=>q.map(([x,y])=>({x:x/w,y:y/h}))),_structuralGridProof:{...evidence,index:id-1,pixelContours:rings,pixels,variance:sq/pixels-(sum/pixels)**2}};if(!validPanel(p))return[];out.push(p);
    }
    log?.(`exterior-paper completion: ${frames.length} framed scenes, ${open?1:0} borderless scene, one exclusive inset`);return out;
  }
  function validPaperInsetsPanel(p){try{const pr=p?._structuralGridProof,w=pr?.analysisWidth,h=pr?.analysisHeight;if(p?._identitySource!=='structural-grid-frame'||pr?.version!==12||pr.method!==PAPER_INSET_METHOD||pr.connected!==true||!Number.isInteger(w)||!Number.isInteger(h)||!range(w,300,900)||!range(h,500,900)||!Number.isInteger(pr.count)||!range(pr.count,4,8)||!Number.isInteger(pr.index)||!range(pr.index,0,pr.count-1)||!range(pr.white/pr.edge,.98,1)||!range(pr.variance,200,16257)||!Array.isArray(pr.frames)||!range(pr.frames.length,3,6)||pr.ownerBoxes?.length!==pr.count)return false;
    const goodBox=b=>Array.isArray(b)&&b.length===4&&b.every(Number.isInteger)&&b[0]>=0&&b[1]>=0&&b[2]<=w&&b[3]<=h&&b[2]>b[0]&&b[3]>b[1];
    if(pr.ownerBoxes.some(b=>!goodBox(b)))return false;for(const f of pr.frames){if(!goodBox(f.box)||f.rims?.length!==4)return false;for(let j=0;j<4;j++){const e=f.rims[j],lo=f.shared&&j===0?.80:.92;if(e.axis!==(j<2?'V':'H')||e.direction!==(j%2?1:-1)||!Number.isInteger(e.pos)||e.samples!==e.b-e.a+1||e.samples<46||!range(e.dark/e.samples,f.shared&&j===0?.98:.88,1)||!range(e.white/e.samples,lo,1)||!range(e.both/e.samples,f.shared&&j===0?.78:.85,1))return false;}if(JSON.stringify(f.box)!==JSON.stringify([f.rims[0].pos-3,f.rims[2].pos-3,f.rims[1].pos+4,f.rims[3].pos+4]))return false;}
    if(pr.open&&(!goodBox(pr.open.box)||pr.open.components?.length<3||!pr.frames.some(f=>f.shared)))return false;
    if(pr.count!==pr.frames.length+1+(pr.open?1:0)||!Number.isInteger(pr.parentIndex)||!range(pr.parentIndex,0,pr.count-2)||pr.insetIndex!==pr.parentIndex+1||pr.edge!==2*w+2*h-4||!Array.isArray(pr.attachments))return false;
    const i=pr.inset;if(!goodBox(i?.box)||!goodBox(i.parentBox)||!range(i.top.dark/i.top.samples,.90,1)||!range(i.bottom.dark/i.bottom.samples,.90,1)||Math.abs(i.left.lo-i.right.lo)>5||Math.min(i.left.hi-i.left.lo,i.right.hi-i.right.lo)<h*.065||Math.abs(i.left.hi-i.right.hi)>100||pr.attachments?.length>1)return false;
    if(i.parentBox[2]-i.parentBox[0]<w*.85||JSON.stringify(pr.ownerBoxes[pr.parentIndex])!==JSON.stringify(i.parentBox)||JSON.stringify(pr.ownerBoxes[pr.insetIndex])!==JSON.stringify(i.box)||!pr.frames.some(f=>JSON.stringify(f.box)===JSON.stringify(i.parentBox)))return false;
    if(Math.abs(i.left.hi-i.right.hi)>5&&pr.attachments.length!==1)return false;if(pr.attachments.some(a=>!goodBox(a.box)||!range(a.inside/a.pixels,.05,.90)))return false;
    const rings=pr.pixelContours;if(!Array.isArray(rings)||!range(rings.length,1,12)||rings.some(q=>!Array.isArray(q)||!range(q.length,4,4096)||q.some((v,i)=>!Array.isArray(v)||v.length!==2||!Number.isInteger(v[0])||!Number.isInteger(v[1])||!range(v[0],0,w)||!range(v[1],0,h)||(v[0]!==q[(i+1)%q.length][0]&&v[1]!==q[(i+1)%q.length][1]))))return false;
    const area=Math.round(rings.reduce((s,q)=>s+q.reduce((t,a,i)=>{const b=q[(i+1)%q.length];return t+a[0]*b[1]-b[0]*a[1];},0)/2,0));if(Math.abs(area)!==pr.pixels||pr.pixels<w*h*.01||JSON.stringify(p._contours)!==JSON.stringify(rings.map(q=>q.map(([x,y])=>({x:x/w,y:y/h})))))return false;const pts=rings.flat(),a=Math.min(...pts.map(v=>v[0])),b=Math.min(...pts.map(v=>v[1])),c=Math.max(...pts.map(v=>v[0])),d=Math.max(...pts.map(v=>v[1]));return ['x','y','w','h'].every((k,j)=>Math.abs(p[k]-[a/w,b/h,(c-a)/w,(d-b)/h][j])<1e-10);
  }catch(_){return false;}}
  function completePaperInsetsImage(img,baseline,log,closedAnchors=[]){
    if(typeof PanelMatteCells==='undefined'||!Array.isArray(baseline)||!(range(baseline.length,2,4)||baseline.length===0&&closedAnchors.length===3)||baseline.some(p=>p._identitySource||p._quad||p._outline||p._contours))return[];const W=img.naturalWidth||img.width,H=img.naturalHeight||img.height;if(!W||!H||W*H>24000000)return[];const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d',{willReadFrequently:true});if(!g)return[];g.drawImage(img,0,0);const s=Math.min(1,900/Math.max(W,H)),w=Math.round(W*s),h=Math.round(H*s),rgba=PanelMatteCells.sampleBilinearRGBA(g.getImageData(0,0,W,H).data,W,H,w,h);let anchors=baseline;if(!anchors.length){const sampled=document.createElement('canvas');sampled.width=w;sampled.height=h;sampled.getContext('2d').putImageData(new ImageData(rgba,w,h),0,0);anchors=PanelDetect._analyze(sampled);}const out=completePaperInsetsRGBA(rgba,w,h,anchors,log);return out.map(p=>p._structuralGridProof?.version===12?p:(closedAnchors.find(a=>overlap(a,p)/Math.max(a.w*a.h,p.w*p.h)>.94)||p));
  }

  function compactInsetRims(lum,w,h,box,allowCaption=false){
    const [x0,y0,x1,y1]=box,raw=[],minimum=Math.max(h*.045,(y1-y0)*.12);
    for(let x=x0+12;x<x1-12;x++){let start=-1;for(let y=y0+8;y<=y1-7;y++){const dark=y<y1-7&&Math.min(lum[y*w+x-1],lum[y*w+x],lum[y*w+x+1])<65;if(dark&&start<0)start=y;if(!dark&&start>=0){if(y-start>=minimum)raw.push({x,lo:start,hi:y});start=-1;}}}
    const groups=[];for(const r of raw){const g=groups.find(g=>r.x-g.at(-1).x<=1&&r.x>=g.at(-1).x&&Math.min(r.hi,g[0].hi)-Math.max(r.lo,g[0].lo)>=minimum*.8);if(g)g.push(r);else groups.push([r]);}
    const median=a=>a.sort((a,b)=>a-b)[a.length>>1],rails=groups.filter(g=>g.length>=2&&g.length<=12).map(g=>({x:median(g.map(r=>r.x)),lo:median(g.map(r=>r.lo)),hi:median(g.map(r=>r.hi)),left:g[0].x+1,right:g.at(-1).x})),out=[];
    const horizontal=(y,L,R)=>{let n=0,dark=0;for(let x=L+3;x<R-2;x++){n++;let v=255;for(let d=-2;d<=2;d++)v=Math.min(v,lum[(y+d)*w+x]);dark+=v<65;}return {samples:n,dark};};
    for(let i=0;i<rails.length;i++)for(let j=i+1;j<rails.length;j++){const a=rails[i],b=rails[j];if(!range((b.x-a.x)/w,.20,.50)||Math.abs(a.lo-b.lo)>5||Math.abs(a.hi-b.hi)>100)continue;let top=Math.min(a.lo,b.lo)-1,bottom=Math.max(a.hi,b.hi);const best=guess=>{let v=null;for(let y=guess-3;y<=guess+3;y++){const m=horizontal(y,a.x,b.x),score=m.dark/m.samples-.0001*Math.abs(y-guess);if(!v||score>v.score)v={y,score,...m};}return v;},A=best(top),B=best(bottom-1);top=Math.min(top,A.y-1);bottom=Math.max(bottom,B.y+2);if(A.dark/A.samples<.68||B.dark/B.samples<.48)continue;out.push({box:[a.left,top,b.right,bottom],left:a,right:b,top:A,bottom:B});}return out;
  }
  const NESTED_PAPER_METHOD='native-paper-bank-with-multiple-or-compact-insets';
  function nestedPaperMode(frames,insets,w,h){
    const fs=[...frames].sort((a,b)=>Math.abs(a.box[1]-b.box[1])<=h*.015?a.box[0]-b.box[0]:a.box[1]-b.box[1]),wide=f=>f.box[2]-f.box[0]>w*.85;
    if(insets.length===2&&fs.length===6&&insets.every(i=>i.parent.box[2]-i.parent.box[0]<w*.65)&&insets.some(i=>(i.parent.box[3]-i.parent.box[1])/(i.parent.box[2]-i.parent.box[0])>2)&&insets.some(i=>i.parent.box[1]>h*.5))return 'two-column-insets';
    if(insets.length===1&&fs.length===5&&insets[0].parent===fs[0]&&wide(fs[0])&&fs[0].box[3]-fs[0].box[1]<h*.25&&wide(fs[1])&&fs[1].box[3]-fs[1].box[1]>h*.35)return 'compact-top-inset';
    if(insets.length||![6,7].includes(fs.length)||wide(fs[0])||wide(fs[1])||!wide(fs[2])||Math.abs(fs[0].box[1]-fs[1].box[1])>5||Math.abs(fs[0].box[3]-fs[1].box[3])>5||fs[2].box[1]<fs[0].box[3])return null;
    const lower=fs.slice(3);if(lower.some(f=>f.box[1]<fs[2].box[3]))return null;
    if(lower.length===3&&lower.every(f=>Math.abs(f.box[1]-lower[0].box[1])<=5&&Math.abs(f.box[3]-lower[0].box[3])<=5))return 'three-bottom-columns';
    if(lower.length===4&&lower[0].box[3]-lower[0].box[1]>h*.4&&lower.slice(1).every(f=>f.box[0]>=lower[0].box[2]&&Math.abs(f.box[0]-lower[1].box[0])<=5)&&Math.abs(lower[3].box[3]-lower[0].box[3])<=5)return 'three-right-rows';return null;
  }
  function attachPaperBalloon(lum,w,h,cc,labels,inset,id){
    const ib=inset.box,parent=inset.parent.box,attachments=[];
    for(const c of cc.items){const[a,b,z,d]=c.box;if(c.pixels<50||c.pixels>w*h*.02||z-a>w*.20||d-b>h*.15||a>=ib[0]&&b>=ib[1]&&z<=ib[2]&&d<=ib[3]||z<=ib[0]||a>=ib[2]||d<=ib[1]||b>=ib[3])continue;let inside=0;for(let y=b;y<d;y++)for(let x=a;x<z;x++)if(cc.ids[y*w+x]===c.id&&x>=ib[0]&&x<ib[2]&&y>=ib[1]&&y<ib[3])inside++;
      if(!range(inside/c.pixels,.05,.90))continue;if(a-2<parent[0]||b-2<parent[1]||z+2>parent[2]||d+2>parent[3])return null;
      for(let y=b;y<d;y++){let lo=w,hi=-1;for(let x=a;x<z;x++)if(cc.ids[y*w+x]===c.id){lo=Math.min(lo,x);hi=Math.max(hi,x);}if(hi>=lo)for(let Y=y-2;Y<=y+2;Y++)for(let X=lo-2;X<=hi+2;X++)labels[Y*w+X]=id;}attachments.push({box:c.box,pixels:c.pixels,inside});
    }return attachments.length<=1?attachments:null;
  }
  function completeNestedPaperRGBA(rgba,w,h,baseline,log){
    if(typeof PanelMatteCells==='undefined'||!(rgba instanceof Uint8Array||rgba instanceof Uint8ClampedArray)||!Number.isInteger(w)||!Number.isInteger(h)||!range(w,300,900)||!range(h,500,900)||rgba.length!==w*h*4||!Array.isArray(baseline)||baseline.length>7||baseline.some(p=>!p||p._identitySource||p._quad||p._outline||p._contours))return[];
    const lum=luminanceRGBA(rgba,w,h);let edge=0,white=0;for(let i=0;i<lum.length;i++){if(rgba[i*4+3]!==255)return[];if(i<w||i>=(h-1)*w||i%w===0||i%w===w-1){edge++;white+=lum[i]>225;}}if(white/edge<.98)return[];
    const components=paperComponents(lum,w,h),frames=[];
    for(const component of components){const[a,b,c,d]=component.box;if(component.pixels/((c-a)*(d-b))<.87||c-a<w*.17||d-b<h*.085){if(component.pixels>w*h*.015)return[];continue;}
      const rims=[thinRim(lum,w,h,'V',a,b,d,-1,40),thinRim(lum,w,h,'V',c,b,d,1,40),thinRim(lum,w,h,'H',b,a,c,-1,40),thinRim(lum,w,h,'H',d,a,c,1,40)];if(rims.some(e=>!e))return[];
      // The exterior component carries the entire ink rim, including drift.
      // Its tight bounds avoid overlap across one-pixel white gutters.
      if(rims.some((e,j)=>Math.abs(e.pos-[a,c,b,d][j])>8))return[];frames.push({box:component.box,rims,componentPixels:component.pixels});
    }
    if(!range(frames.length,5,7))return[];const insets=[];
    for(const parent of frames){const candidates=compactInsetRims(lum,w,h,parent.box);for(const i of candidates){const b=i.box;if(i.top.dark/i.top.samples<.90||i.bottom.dark/i.bottom.samples<.90)continue;if(b[0]-parent.box[0]<8||b[1]-parent.box[1]<8||parent.box[2]-b[2]<8||parent.box[3]-b[3]<8)return[];insets.push({parent,...i});}}
    const mode=nestedPaperMode(frames,insets,w,h);if(!mode)return[];
    frames.sort((a,b)=>Math.abs(a.box[1]-b.box[1])<=h*.015?a.box[0]-b.box[0]:a.box[1]-b.box[1]);if(mode==='compact-top-inset'){const bank=frames.splice(2).sort((a,b)=>Math.abs(a.box[0]-b.box[0])<=5?a.box[1]-b.box[1]:a.box[0]-b.box[0]);frames.push(...bank);}for(let i=0;i<frames.length;i++)for(let j=0;j<i;j++){const a=frames[i].box,b=frames[j].box;if(Math.min(a[2],b[2])>Math.max(a[0],b[0])&&Math.min(a[3],b[3])>Math.max(a[1],b[1]))return[];}
    const owners=frames.flatMap(f=>[{box:f.box,frame:f},...insets.filter(i=>i.parent===f).map(i=>({box:i.box,inset:i}))]),labels=new Uint16Array(w*h);
    owners.forEach((f,k)=>{const[a,b,c,d]=f.box;for(let y=b;y<d;y++)for(let x=a;x<c;x++)labels[y*w+x]=k+1;});const cc=whiteComponents(lum,w,h),insetProofs=[];
    for(let k=0;k<owners.length;k++)if(owners[k].inset){const i=owners[k].inset,attachments=attachPaperBalloon(lum,w,h,cc,labels,i,k+1);if(!attachments||Math.abs(i.left.hi-i.right.hi)>5&&attachments.length!==1)return[];insetProofs.push({index:k,parentIndex:owners.findIndex(o=>o.frame===i.parent),box:i.box,parentBox:i.parent.box,left:i.left,right:i.right,top:i.top,bottom:i.bottom,attachments});}
    const evidence={version:13,method:NESTED_PAPER_METHOD,connected:true,analysisWidth:w,analysisHeight:h,count:owners.length,mode,frames,insets:insetProofs,edge,white,ownerBoxes:owners.map(o=>o.box)},out=[];
    for(let k=0;k<owners.length;k++){const f=owners[k],b=f.box,rect={x:b[0]/w,y:b[1]/h,w:(b[2]-b[0])/w,h:(b[3]-b[1])/h};
      const anchor=mode!=='three-right-rows'&&f.frame&&!insets.some(i=>i.parent===f.frame)?baseline.find(p=>overlap(p,rect)/Math.max(p.w*p.h,rect.w*rect.h)>.94):null;if(anchor){out.push(anchor);continue;}
      const rings=PanelMatteCells.tracePixelContours(labels,w,h,k+1);if(!rings)return[];let pixels=0,sum=0,sq=0;for(let j=0;j<labels.length;j++)if(labels[j]===k+1){pixels++;sum+=lum[j];sq+=lum[j]*lum[j];}const pts=rings.flat(),a=Math.min(...pts.map(p=>p[0])),y=Math.min(...pts.map(p=>p[1])),c=Math.max(...pts.map(p=>p[0])),d=Math.max(...pts.map(p=>p[1]));
      const p={x:a/w,y:y/h,w:(c-a)/w,h:(d-y)/h,_identitySource:'structural-grid-frame',_geometryOwner:'structural-grid-contours',_geometryType:'nested-paper-frame-ownership',_contours:rings.map(q=>q.map(([x,y])=>({x:x/w,y:y/h}))),_structuralGridProof:{...evidence,index:k,pixelContours:rings,pixels,variance:sq/pixels-(sum/pixels)**2}};if(!validPanel(p))return[];out.push(p);
    }log?.(`nested paper completion: ${frames.length} scenes + ${insets.length} insets; ${mode}`);return out;
  }
  function validNestedPaperPanel(p){try{const pr=p?._structuralGridProof,w=pr?.analysisWidth,h=pr?.analysisHeight;
    if(p?._identitySource!=='structural-grid-frame'||pr?.version!==13||pr.method!==NESTED_PAPER_METHOD||pr.connected!==true||!Number.isInteger(w)||!Number.isInteger(h)||!range(w,300,900)||!range(h,500,900)||!Number.isInteger(pr.count)||!range(pr.count,6,8)||!Number.isInteger(pr.index)||!range(pr.index,0,pr.count-1)||pr.edge!==2*w+2*h-4||!range(pr.white/pr.edge,.98,1)||!range(pr.variance,200,16257)||!Array.isArray(pr.frames)||!range(pr.frames.length,5,7)||!Array.isArray(pr.insets)||pr.insets.length>2||pr.count!==pr.frames.length+pr.insets.length||pr.ownerBoxes?.length!==pr.count)return false;
    const goodBox=b=>Array.isArray(b)&&b.length===4&&b.every(Number.isInteger)&&b[0]>=0&&b[1]>=0&&b[2]<=w&&b[3]<=h&&b[2]>b[0]&&b[3]>b[1],same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
    if(pr.ownerBoxes.some(b=>!goodBox(b)))return false;for(const f of pr.frames){if(!goodBox(f.box)||!range(f.componentPixels/((f.box[2]-f.box[0])*(f.box[3]-f.box[1])),.87,1)||f.rims?.length!==4)return false;for(let j=0;j<4;j++){const e=f.rims[j];if(e.axis!==(j<2?'V':'H')||e.direction!==(j%2?1:-1)||!Number.isInteger(e.pos)||Math.abs(e.pos-f.box[[0,2,1,3][j]])>8||e.samples!==e.b-e.a+1||e.samples<46||!range(e.dark/e.samples,.88,1)||!range(e.white/e.samples,.92,1)||!range(e.both/e.samples,.85,1))return false;}}
    for(const i of pr.insets){if(!goodBox(i.box)||!goodBox(i.parentBox)||!Number.isInteger(i.index)||!Number.isInteger(i.parentIndex)||i.parentIndex<0||i.index!==i.parentIndex+1||i.index>=pr.count||!same(pr.ownerBoxes[i.index],i.box)||!same(pr.ownerBoxes[i.parentIndex],i.parentBox)||!pr.frames.some(f=>same(f.box,i.parentBox))||!range(i.top.dark/i.top.samples,.90,1)||!range(i.bottom.dark/i.bottom.samples,.90,1)||Math.abs(i.left.lo-i.right.lo)>5||Math.min(i.left.hi-i.left.lo,i.right.hi-i.right.lo)<h*.045||Math.abs(i.left.hi-i.right.hi)>100||!Array.isArray(i.attachments)||i.attachments.length>1||Math.abs(i.left.hi-i.right.hi)>5&&i.attachments.length!==1||i.attachments.some(a=>!goodBox(a.box)||!range(a.inside/a.pixels,.05,.90)))return false;}
    const ins=pr.insets.map(i=>({...i,parent:pr.frames.find(f=>same(f.box,i.parentBox))}));if(nestedPaperMode(pr.frames,ins,w,h)!==pr.mode)return false;
    const rings=pr.pixelContours;if(!Array.isArray(rings)||!range(rings.length,1,12)||rings.some(q=>!Array.isArray(q)||!range(q.length,4,4096)||q.some((v,i)=>!Array.isArray(v)||v.length!==2||!Number.isInteger(v[0])||!Number.isInteger(v[1])||!range(v[0],0,w)||!range(v[1],0,h)||(v[0]!==q[(i+1)%q.length][0]&&v[1]!==q[(i+1)%q.length][1]))))return false;
    const area=Math.round(rings.reduce((s,q)=>s+q.reduce((t,a,i)=>{const b=q[(i+1)%q.length];return t+a[0]*b[1]-b[0]*a[1];},0)/2,0));if(Math.abs(area)!==pr.pixels||pr.pixels<w*h*.01||!same(p._contours,rings.map(q=>q.map(([x,y])=>({x:x/w,y:y/h})))))return false;const pts=rings.flat(),a=Math.min(...pts.map(v=>v[0])),b=Math.min(...pts.map(v=>v[1])),c=Math.max(...pts.map(v=>v[0])),d=Math.max(...pts.map(v=>v[1]));return ['x','y','w','h'].every((key,j)=>Math.abs(p[key]-[a/w,b/h,(c-a)/w,(d-b)/h][j])<1e-10);
  }catch(_){return false;}}
  function completeNestedPaperImage(img,baseline,log){
    if(typeof PanelMatteCells==='undefined'||!Array.isArray(baseline)||baseline.length>7||baseline.some(p=>p._identitySource||p._quad||p._outline||p._contours))return[];const W=img.naturalWidth||img.width,H=img.naturalHeight||img.height;if(!W||!H||W*H>24000000)return[];const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d',{willReadFrequently:true});if(!g)return[];g.drawImage(img,0,0);const s=Math.min(1,900/Math.max(W,H)),w=Math.round(W*s),h=Math.round(H*s),rgba=PanelMatteCells.sampleBilinearRGBA(g.getImageData(0,0,W,H).data,W,H,w,h);return completeNestedPaperRGBA(rgba,w,h,baseline,log);
  }

  // Native border recovery for mixed bleed / overlapping frame networks.
  // Admission uses connected exterior-paper topology; all cuts are measured
  // from ink rails. No title, page index, tap or saved coordinates are inputs.
  const BLEED_NETWORK_METHOD='native-exterior-paper-overlap-rail-network';
  function bleedRail(lum,w,h,axis,lo,hi,a,b,direction=0,minimum=.9,minimumCore=0,cut=75){
    const N=axis==='H'?h:w,at=(t,p)=>p<0||p>=N?255:lum[axis==='H'?p*w+t:t*w+p];a=Math.ceil(a)+5;b=Math.floor(b)-5;lo=Math.max(1,Math.floor(lo));hi=Math.min(N-9,Math.ceil(hi));if(b-a<45)return null;let best=null;
    for(let step=-25;step<=25;step++){const slope=step*.004;for(let pos=lo;pos<=hi;pos++){let dark=0,white=0,ridge=0,core=0,samples=0;for(let t=a;t<=b;t+=3){const p=Math.round(pos+slope*(t-(a+b)/2));if(p<1||p>=N-7){samples++;continue;}const mid=Math.min(at(t,p-1),at(t,p),at(t,p+1));let before=0,after=0;for(let d=3;d<=7;d++){before=Math.max(before,at(t,p-d));after=Math.max(after,at(t,p+d));}dark+=mid<cut;core+=at(t,p)<cut;white+=(direction<0?before:direction>0?after:Math.max(before,after))>220;ridge+=Math.min(before,after)-mid>30;samples++;}if(dark/samples<minimum||core/samples<minimumCore)continue;const score=dark/samples+core/samples*.2+ridge/samples*.35+(direction?white/samples*.5:0)-Math.abs(slope)*.1;if(!best||score>best.score)best={axis,cut,slope,offset:pos-slope*(a+b)/2,a,b,direction,dark,white,ridge,core,samples,score};}}
    return best;
  }
  const railAt=(r,t)=>r.offset+r.slope*t;
  function bleedQuad(lum,w,h,box,radius=7,minimum=.9,cut=75){
    const[a,b,c,d]=box,rails=[bleedRail(lum,w,h,'H',b-radius,b+radius,a,c,-1,minimum,0,75),bleedRail(lum,w,h,'V',c-radius,c+radius,b,d,1,minimum,0,cut),bleedRail(lum,w,h,'H',d-radius,d+radius,a,c,1,minimum,0,75),bleedRail(lum,w,h,'V',a-radius,a+radius,b,d,-1,minimum,0,75)];if(rails.some(r=>!r))return null;
    const cross=(H,V)=>{const x=(V.offset+V.slope*H.offset)/(1-V.slope*H.slope);return[x,railAt(H,x)]},q=[cross(rails[0],rails[3]),cross(rails[0],rails[1]),cross(rails[2],rails[1]),cross(rails[2],rails[3])];if(q.some(p=>p[0]<-3||p[0]>w+3||p[1]<-3||p[1]>h+3)||polyArea(q)<w*h*.012)return null;return{q,rails};
  }
  function bleedNetworkMode(cc,w,h){
    const big=cc.filter(c=>c.pixels>w*h*.025).sort((a,b)=>a.box[1]-b.box[1]||a.box[0]-b.box[0]);const B=big.map(c=>c.box),wide=b=>(b[2]-b[0])/w>.86;
    if(big.length===4&&wide(B[0])&&B[0][3]/h>.72&&B[1][1]/h>.5&&B[1][1]/h<.65&&B[2][1]/h>.75&&B[3][1]/h>.75)return{mode:'overlap-above-four',big};
    if(big.length===4&&wide(B[0])&&B[0][3]/h<.54&&B.slice(1).every(b=>b[1]/h>.48&&b[1]/h<.56&&(b[2]-b[0])/w<.38&&(b[3]-b[1])/h>.40))return{mode:'portrait-over-pair-and-columns',big};
    if(big.length===4&&wide(B[0])&&B[0][3]/h<.55&&wide(B[1])&&B[1][1]/h>.45&&B[1][3]/h<.78&&B.slice(2).every(b=>b[1]/h>.72&&(b[2]-b[0])/w<.5))return{mode:'bleed-above-pair-strip-pair',big};
    if(big.length===4&&wide(B[0])&&range(B[0][3]/h,.54,.62)&&B.slice(1,3).every(b=>range(b[1]/h,.55,.64)&&(b[2]-b[0])/w<.49)&&wide(B[3])&&B[3][1]/h>.75)return{mode:'overlap-above-pair-strip',big};
    if(big.length===5&&wide(B[0])&&range(B[0][3]/h,.55,.65)&&wide(B[1])&&range(B[1][1]/h,.4,.48)&&B.slice(2).every(b=>b[1]/h>.75&&(b[2]-b[0])/w<.45))return{mode:'sloped-stack-pair-strip-columns',big};
    if(big.length===4&&wide(B[0])&&range(B[0][3]/h,.28,.35)&&B.slice(1,3).every(b=>range(b[1]/h,.3,.37)&&b[3]/h<.53&&(b[2]-b[0])/w<.5)&&wide(B[3])&&B[3][3]===h)return{mode:'bleed-pair-strip-over-punch',big};
    if(big.length===3&&B.slice(0,2).every(b=>wide(b)&&(b[3]-b[1])/h<.17)&&wide(B[2])&&range(B[2][1]/h,.28,.34)&&B[2][3]===h)return{mode:'two-strips-pair-over-portal',big};return null;
  }
  function completeBleedNetworkRGBA(rgba,w,h,anchors=[],log){
    if(rgba?.length!==w*h*4||w<300||h<500||w>900||h>900)return[];for(let i=3;i<rgba.length;i+=4)if(rgba[i]!==255)return[];const lum=luminanceRGBA(rgba,w,h),cc=paperComponents(lum,w,h),admit=bleedNetworkMode(cc,w,h);if(!admit)return[];const{mode,big}=admit,B=big.map(c=>c.box),frames=[],evidence=[];if(['portrait-over-pair-and-columns','bleed-above-pair-strip-pair'].includes(mode)&&typeof PanelClosedFrames!=='undefined')anchors=PanelClosedFrames.analyzeRGBA(rgba,w,h);log?.('bleed network admitted '+mode);
    const add=(box,r=7,min=.90,cut=75)=>{const f=bleedQuad(lum,w,h,box,r,min,cut);if(!f)throw Error('unproved frame '+box);frames.push(f);return f;},rect=b=>({q:[[b[0],b[1]],[b[2],b[1]],[b[2],b[3]],[b[0],b[3]]],component:true}),component=b=>{const f=rect(b);if(big.some(c=>JSON.stringify(c.box)===JSON.stringify(b))){const[a,y,c,d]=b,edges=[['H',y,a,c,-1],['V',c,y,d,1],['H',d,a,c,1],['V',a,y,d,-1]];f.rims=[];for(const[axis,pos,lo,hi,dir]of edges){if(pos<=1||pos>=(axis==='H'?h:w)-1)continue;const rail=bleedRail(lum,w,h,axis,pos-4,pos+4,lo+4,hi-4,dir,.88);if(!rail)throw Error('missing component rim '+b);f.rims.push(rail);}if(f.rims.length<2)throw Error('unbounded component');}frames.push(f);return f;},H=(lo,hi,a,b,dir=0)=>{const r=bleedRail(lum,w,h,'H',lo,hi,a,b,dir);if(!r)throw Error('missing horizontal rail '+[lo,hi,a,b]);evidence.push(r);return railAt(r,(a+b)/2);},V=(lo,hi,a,b,dir=0,core=0,cut=75)=>{const r=bleedRail(lum,w,h,'V',lo,hi,a,b,dir,.9,core,cut);if(!r)throw Error('missing vertical rail '+[lo,hi,a,b]);evidence.push(r);return railAt(r,(a+b)/2);};
    try{
      if(mode==='overlap-above-four'){
        const mid=B[1],tail=B.slice(2).sort((a,b)=>a[0]-b[0]),cap=H(h*.24,h*.47,w*.08,w*.90),bottom=mid[1]-3,L=V(w*.035,w*.10,cap+6,bottom-8,-1),R=V(w*.90,w*.96,cap+6,bottom-8,1);
        component([0,0,w,cap+h*.06]);add([L,cap,R,bottom],5,.80);add([tail[0][0],mid[1],tail[0][2],mid[3]],5,.78);component(mid);tail.forEach(component);
      }else if(mode==='portrait-over-pair-and-columns'){
        const upper=anchors.filter(a=>a.y<.05&&a.w<.4).sort((a,b)=>b.h-a.h)[0],wide=anchors.filter(a=>a.y<.05&&a.w>.5).sort((a,b)=>a.h-b.h)[0];if(!upper||!wide)throw Error('missing portrait witnesses');const ub=[upper.x*w,upper.y*h,(upper.x+upper.w)*w,(upper.y+upper.h)*h],wb=[wide.x*w,wide.y*h,(wide.x+wide.w)*w,(wide.y+wide.h)*h];
        const midTop=wb[3]+4,midLeft=V(w*.03,w*.10,ub[3]+8,B[0][3]-6,-1);const middle=rect([midLeft,midTop,B[0][2]-2,B[0][3]-2]);middle.rails=[bleedRail(lum,w,h,'H',midTop-5,midTop+8,ub[2]+5,B[0][2]-6,-1),bleedRail(lum,w,h,'H',B[0][3]-6,B[0][3]+2,midLeft+4,B[0][2]-6,1),bleedRail(lum,w,h,'V',B[0][2]-8,B[0][2]+2,midTop+4,B[0][3]-4,1)];if(middle.rails.some(r=>!r))throw Error('missing occluded rails');frames.push(middle);add(wb,5);add(ub,5);B.slice(1).sort((a,b)=>a[0]-b[0]).forEach(component);
      }else if(mode==='bleed-above-pair-strip-pair'){
        const pair=anchors.filter(a=>a.y>.2&&a.y<.4&&a.w<.5).sort((a,b)=>a.x-b.x);if(pair.length!==2)throw Error('missing pair witnesses');component([0,B[0][1],w,Math.min(...pair.map(p=>p.y*h))+h*.04]);for(const p of pair)add([p.x*w,p.y*h,(p.x+p.w)*w,(p.y+p.h)*h],5);B.slice(1).forEach(component);
      }else if(mode==='overlap-above-pair-strip'){
        const cap=H(h*.26,h*.48,w*.09,w*.91),bottom=B[0][3]-2,L=V(w*.025,w*.08,cap+8,bottom-8,-1),R=V(w*.91,w*.98,cap+8,bottom-8,1);component([0,B[0][1],w,cap+h*.06]);add([L,cap,R,bottom],6);B.slice(1).forEach(component);
      }else if(mode==='sloped-stack-pair-strip-columns'){
        const rowTop=B[1][1],rowBottom=B[0][3],seam=H(h*.18,h*.32,w*.09,w*.92,1),split=V(w*.4,w*.65,rowTop+12,rowBottom-12,1);
        add([B[0][0]+8,B[0][1]+3,B[0][2]-10,seam],18);add([B[0][0]+15,seam+4,B[0][2]-10,rowTop-4],16);add([B[0][0]+18,rowTop-3,split,rowBottom-3],8);add([split+4,rowTop+2,B[1][2]-2,rowBottom],8);add([B[1][0],rowBottom+3,B[1][2]-7,B[1][3]-2],8);B.slice(2).forEach(component);
      }else if(mode==='bleed-pair-strip-over-punch'){
        component(B[0]);B.slice(1,3).sort((a,b)=>a[0]-b[0]).forEach(component);const cap=B[3][1],stripBottom=H(cap+h*.08,cap+h*.18,w*.10,w*.90,1),L=V(w*.03,w*.09,cap+6,stripBottom-6,-1),R=V(w*.90,w*.97,cap+6,stripBottom-6,1),frontLeft=V(w*.66,w*.83,h*.75,h*.94,-1),frontTop=(()=>{const rail=evidence.at(-1);let y=Math.round(h*.75),gap=0;for(;y>stripBottom+12;y--){const x=Math.round(railAt(rail,y));let dark=false;for(let d=-2;d<=2;d++)if(x+d>=0&&x+d<w&&lum[y*w+x+d]<75)dark=true;gap=dark?0:gap+1;if(gap>5)return y+gap;}throw Error('missing inset junction');})();
        component([0,stripBottom-h*.05,w,h]);add([L,cap,R,stripBottom],5);const front=rect([frontLeft,frontTop,w,h]);front.component=false;front.rails=[evidence.at(-1)];front.q[0][0]=railAt(front.rails[0],frontTop);front.q[3][0]=railAt(front.rails[0],h);front.caption=true;frames.push(front);
      }else if(mode==='two-strips-pair-over-portal'){
        B.slice(0,2).forEach(component);const pairTop=B[2][1],pairBottom=H(pairTop+h*.10,pairTop+h*.24,w*.08,w*.92,1),split=V(w*.45,w*.72,pairTop+8,pairBottom-8),L=B[0][0],R=B[0][2];component([0,pairBottom-h*.025,w,h]);add([L,pairTop,split,pairBottom],5);add([split+4,pairTop,R,pairBottom],5);
        const x1=V(w*.5,w*.65,pairBottom+h*.12,h*.95,-1),x2=V(w*.7,w*.78,pairBottom+h*.12,h*.95,1,.9,40),x3=V(x2+5,x2+w*.08,pairBottom+h*.12,h*.95,-1,.9,40),x4=V(w*.94,w*.99,pairBottom+h*.12,h*.95,1,.9,30),y1=H(pairBottom+6,pairBottom+h*.08,x1+5,x2-5,-1),y2=H(y1+6,y1+h*.06,x3+5,x4-5,-1);const portraitBottom=H(h-20,h-2,x1+5,x2-5,1);add([x1,y1,x2,portraitBottom],2,.9,40);const front=rect([x3,y2,x4,h]);front.component=false;front.rails=evidence.slice(-6);frames.push(front);
      }
    }catch(error){log?.('bleed network rejected: '+error.message);return[];}
    // Rasterize back-to-front. Exterior paper is never assigned to a scene.
    // Interior white artwork stays opaque; only edge-connected paper is matte.
    const white=new Uint8Array(w*h),queue=new Int32Array(w*h);let head=0,n=0;const offer=i=>{if(!white[i]&&lum[i]>220){white[i]=1;queue[n++]=i;}};for(let x=0;x<w;x++){offer(x);offer((h-1)*w+x);}for(let y=0;y<h;y++){offer(y*w);offer(y*w+w-1);}while(head<n){const i=queue[head++],x=i%w,y=i/w|0;if(x)offer(i-1);if(x+1<w)offer(i+1);if(y)offer(i-w);if(y+1<h)offer(i+w);}
    const labels=new Uint16Array(w*h);for(let k=0;k<frames.length;k++){const q=frames[k].q;for(let y=Math.max(0,Math.floor(Math.min(...q.map(p=>p[1])))-2);y<Math.min(h,Math.ceil(Math.max(...q.map(p=>p[1])))+2);y++)for(let x=Math.max(0,Math.floor(Math.min(...q.map(p=>p[0])))-2);x<Math.min(w,Math.ceil(Math.max(...q.map(p=>p[0])))+2);x++){const inside=q.every((a,j)=>{const b=q[(j+1)%q.length];return(b[0]-a[0])*(y+.5-a[1])-(b[1]-a[1])*(x+.5-a[0])>=-2.5*Math.hypot(b[0]-a[0],b[1]-a[1]);});if(inside)labels[y*w+x]=k+1;}}
    // Trim exterior paper around page-edge silhouettes without punching holes
    // through light artwork that connects to the edge of a bleed scene.
    for(let k=0;k<frames.length;k++)if(frames[k].component){const pts=[];for(let y=0;y<h;y++){let lo=w,hi=-1;for(let x=0;x<w;x++)if(labels[y*w+x]===k+1&&!white[y*w+x]){lo=Math.min(lo,x);hi=Math.max(hi,x);}if(hi>=lo)pts.push([lo,y],[hi+1,y],[lo,y+1],[hi+1,y+1]);}const sorted=[...new Map(pts.map(p=>[p.join(','),p])).values()].sort((a,b)=>a[0]-b[0]||a[1]-b[1]),cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]),half=ps=>{const a=[];for(const p of ps){while(a.length>1&&cross(a.at(-2),a.at(-1),p)<=0)a.pop();a.push(p);}a.pop();return a;},hull=half(sorted).concat(half(sorted.slice().reverse()));if(hull.length<3)return[];for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(labels[y*w+x]===k+1&&!hull.every((a,j)=>cross(a,hull[(j+1)%hull.length],[x+.5,y+.5])>=0))labels[y*w+x]=0;frames[k].hull=hull;}
    for(let k=0;k<frames.length;k++)if(frames[k].caption){const f=frames[k],x0=Math.floor(f.q[0][0]),y0=Math.floor(f.q[0][1]),mask=new Uint8Array(w*h),queue=new Int32Array(w*h);let n=0,head=0;const color=i=>{const r=rgba[i*4],g=rgba[i*4+1],b=rgba[i*4+2];return r>130&&r>g*1.25&&r>b*1.4;},offer=i=>{if(!mask[i]&&color(i)){mask[i]=1;queue[n++]=i;}};for(let y=y0;y<Math.min(h,y0+12);y++)for(let x=x0;x<w;x++)offer(y*w+x);while(head<n){const i=queue[head++],x=i%w,y=i/w|0;if(x>x0)offer(i-1);if(x+1<w)offer(i+1);if(y>y0-h*.045)offer(i-w);if(y<y0+12)offer(i+w);}const runs=[];for(let y=Math.max(0,Math.floor(y0-h*.045));y<y0;y++){let lo=w,hi=-1;for(let x=x0;x<w;x++)if(mask[y*w+x]){lo=Math.min(lo,x);hi=Math.max(hi,x);}if(hi<lo)continue;runs.push([lo,y,hi]);for(let Y=Math.max(0,y-2);Y<=Math.min(h-1,y+2);Y++)for(let X=Math.max(0,lo-2);X<=Math.min(w-1,hi+2);X++)labels[Y*w+X]=k+1;}f.captionRuns=runs;}
    // Preserve speech balloons attached across a printed border, filling their
    // enclosed lettering and one-pixel antialiasing rim along with the paper.
    const balloons=whiteComponents(lum,w,h),attachments=[];for(const c of balloons.items){if(c.pixels<80||c.pixels>w*h*.02||c.box[2]-c.box[0]>w*.23||c.box[3]-c.box[1]>h*.14)continue;const counts=new Map();for(let y=c.box[1];y<c.box[3];y++)for(let x=c.box[0];x<c.box[2];x++)if(balloons.ids[y*w+x]===c.id){const id=labels[y*w+x];if(id)counts.set(id,(counts.get(id)||0)+1);}const sorted=[...counts].sort((a,b)=>b[1]-a[1]);if(sorted.length!==2||sorted[0][1]/c.pixels>.95||sorted[0][1]/c.pixels<.52)continue;const id=sorted[0][0];for(let y=c.box[1];y<c.box[3];y++){let lo=w,hi=-1;for(let x=c.box[0];x<c.box[2];x++)if(balloons.ids[y*w+x]===c.id){lo=Math.min(lo,x);hi=Math.max(hi,x);}for(let Y=Math.max(0,y-2);Y<=Math.min(h-1,y+2);Y++)for(let X=Math.max(0,lo-2);X<=Math.min(w-1,hi+2);X++)labels[Y*w+X]=id;}attachments.push({id,box:c.box});}
    const proof={version:14,method:BLEED_NETWORK_METHOD,connected:true,analysisWidth:w,analysisHeight:h,mode,count:frames.length,components:big.map(c=>({box:c.box,pixels:c.pixels})),frames,evidence,attachments},out=[];
    for(let k=0;k<frames.length;k++){const rings=PanelMatteCells.tracePixelContours(labels,w,h,k+1);if(!rings)return[];const pts=rings.flat(),x0=Math.min(...pts.map(p=>p[0])),y0=Math.min(...pts.map(p=>p[1])),x1=Math.max(...pts.map(p=>p[0])),y1=Math.max(...pts.map(p=>p[1]));let pixels=0,sum=0,sq=0;for(let j=0;j<labels.length;j++)if(labels[j]===k+1){pixels++;sum+=lum[j];sq+=lum[j]*lum[j];}const p={x:x0/w,y:y0/h,w:(x1-x0)/w,h:(y1-y0)/h,_identitySource:'structural-grid-frame',_geometryOwner:'structural-grid-contours',_geometryType:'bleed-network-ownership',_contours:rings.map(r=>r.map(([x,y])=>({x:x/w,y:y/h}))),_structuralGridProof:{...proof,index:k,pixelContours:rings,pixels,variance:sq/pixels-(sum/pixels)**2}};if(!validBleedNetworkPanel(p))return[];out.push(p);}
    out.sort((a,b)=>Math.abs(a.y-b.y)<.015?a.x-b.x:a.y-b.y);log?.('bleed network completed '+out.length);return out;
  }
  function validBleedNetworkPanel(p){try{const pr=p?._structuralGridProof,w=pr?.analysisWidth,h=pr?.analysisHeight;if(p?._identitySource!=='structural-grid-frame'||pr?.version!==14||pr.method!==BLEED_NETWORK_METHOD||!pr.connected||!Number.isInteger(w)||!Number.isInteger(h)||!range(w,300,900)||!range(h,500,900)||!range(pr.count,5,8)||!Number.isInteger(pr.index)||!range(pr.index,0,pr.count-1)||pr.frames?.length!==pr.count||bleedNetworkMode(pr.components,w,h)?.mode!==pr.mode||!range(pr.variance,200,16257)||pr.pixels<w*h*.012)return false;if(!Array.isArray(pr.components)||pr.components.some(c=>{const b=c.box;return !Array.isArray(b)||b.length!==4||b.some(v=>!Number.isInteger(v))||b[0]<0||b[1]<0||b[2]>w||b[3]>h||b[2]<=b[0]||b[3]<=b[1]||!Number.isInteger(c.pixels)||!range(c.pixels,1,(b[2]-b[0])*(b[3]-b[1]));}))return false;for(const f of pr.frames){if(f.q?.length!==4||f.q.some(p=>p.length!==2||p.some(n=>!finite(n))))return false;if(f.rims&&(f.rims.length<2||f.rims.some(r=>!range(r.dark/r.samples,.88,1))))return false;if(!f.component&&(!f.rails?.length||f.rails.some(r=>!range(r.dark/r.samples,.78,1)||r.samples<15||!range(Math.abs(r.slope),0,.1))))return false;}const rings=pr.pixelContours;if(!Array.isArray(rings)||!rings.length||rings.some(r=>!Array.isArray(r)||r.length<4||r.some(q=>q.length!==2||!Number.isInteger(q[0])||!Number.isInteger(q[1])||q[0]<0||q[0]>w||q[1]<0||q[1]>h)))return false;const area=Math.abs(rings.reduce((sum,r)=>sum+r.reduce((n,a,i)=>{const b=r[(i+1)%r.length];return n+a[0]*b[1]-b[0]*a[1];},0)/2,0));if(area!==pr.pixels)return false;if(JSON.stringify(p._contours)!==JSON.stringify(rings.map(r=>r.map(([x,y])=>({x:x/w,y:y/h})))))return false;const pts=rings.flat(),b=[Math.min(...pts.map(q=>q[0])),Math.min(...pts.map(q=>q[1])),Math.max(...pts.map(q=>q[0])),Math.max(...pts.map(q=>q[1]))];return ['x','y','w','h'].every((key,i)=>Math.abs(p[key]-[b[0]/w,b[1]/h,(b[2]-b[0])/w,(b[3]-b[1])/h][i])<1e-10);}catch(_){return false;}}
  function completeBleedNetworkImage(img,anchors,log){const W=img.naturalWidth||img.width,H=img.naturalHeight||img.height;if(!W||!H||W*H>24000000)return[];const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(img,0,0);const s=Math.min(1,900/Math.max(W,H)),w=Math.round(W*s),h=Math.round(H*s);return completeBleedNetworkRGBA(PanelMatteCells.sampleBilinearRGBA(g.getImageData(0,0,W,H).data,W,H,w,h),w,h,anchors,log);}

  return {completeBleedNetworkImage,completeBleedNetworkRGBA,completeNestedPaperImage,completeNestedPaperRGBA,completePaperInsetsImage,completePaperInsetsRGBA,completeThinRimsImage,completeThinRimsRGBA,completeWhiteStackImage,completeWhiteStackRGBA,completeMixedRimsImage,completeMixedRimsRGBA,completeWitnessedSteppedImage,analyzeRGBA,analyzeImage,completeImage,completeNestedImage,completeColumnBankImage,completeBranchedStackImage,completeSteppedSharedSceneV2Image,completeSteppedSharedSceneImage,completeOccludedTierImage,completeInsetTripletImage,validPanel};
})();
if(typeof window!=='undefined')window.PanelStructuralGrid=PanelStructuralGrid;
if(typeof module!=='undefined'&&module.exports)module.exports=PanelStructuralGrid;
