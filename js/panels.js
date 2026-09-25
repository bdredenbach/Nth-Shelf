// NTH SHELF V2.79.22 — PROVED FRAME REFINEMENT OVER LEGACY DETECTION
// Legacy regions remain authoritative outside independently proved refinements.
// V92 keeps the V91 boundary-set + iterative internal-gutter path, then adds
// a conservative interior validation gate. A fallback result is rejected if
// a strong, sustained internal gutter still cuts through its interior.
// No smallest/largest rule and no recovery pass.

const PanelDetect = {
  detect(imgUrl, log) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        try {
          const baseline = this._analyze(img, log);
          // The stacked-page route establishes every strip from page-wide
          // border evidence, independently of the finger or legacy seed bank.
          let layout = [];
          try {
            if (typeof PanelPageLayout !== 'undefined') layout = PanelPageLayout.analyze(img, log);
          } catch (error) {
            if (log) log(`page-layout deferred: ${error.message}`);
          }
          if (layout.length >= 4 || baseline.length) {
            let identities=layout.length >= 4 ? layout : baseline;
            if(layout.length<4 && baseline.some(p=>p.w*p.h>.30 && p.w>.7 && p.h>.35)){
              try {
                if(typeof PanelClosedFrames!=='undefined'&&PanelClosedFrames.gradientImage){
                  const frames=PanelClosedFrames.gradientImage(img,log);
                  identities=this._refineComposites(baseline,frames,log);
                  if(PanelClosedFrames.openRegionsImage){
                    const regions=PanelClosedFrames.openRegionsImage(img,frames);
                    const added=this._refineOpenRegions(baseline,identities,regions);
                    identities=added.concat(identities);
                  }
                }
              } catch(error) { if(log)log(`gradient frame refinement deferred: ${error.message}`); }
            }
            // The legacy strip detector can merge offset panels on a near-
            // black page matte. Refine only its unproved large composites,
            // using four exterior-connected boundaries, never the tap seed.
            // All existing identities, including previous supplements, remain.
            if(layout.length<4&&baseline.some(p=>!p._quad&&!p._identitySource&&p.w*p.h>.30&&p.w>.7&&p.h>.35)){
              try {
                if(typeof PanelClosedFrames!=='undefined'&&PanelClosedFrames.darkMatteImage){
                  const frames=PanelClosedFrames.darkMatteImage(img,log);
                  identities=this._refineComposites(identities,frames,log,'exterior-dark-matte');
                  // Only the new, narrow-column route opts into shorter
                  // component proposals. Existing component maps retain their
                  // old minimum. Both children must be proved as a pair.
                  if(baseline.length>=3&&baseline.length<=12&&baseline.some(p=>this._matteColumnParent(p))&&
                     frames.length&&PanelClosedFrames.shortDarkComponentsImage&&PanelClosedFrames.matteColumnRemainderImage){
                    const strips=PanelClosedFrames.shortDarkComponentsImage(img,log);
                    identities=this._refineMatteColumns(img,identities,baseline,frames,strips,log);
                  }
                }
              }catch(error){if(log)log(`dark matte refinement deferred: ${error.message}`);}
            }
            // Independently prove a complete shared-rail montage. Existing
            // identities and unclassified composites keep their old geometry.
            try {
              if(layout.length<4&&typeof PanelCompositeFrames!=='undefined')
                identities=PanelCompositeFrames.refineImage(img,identities,baseline,log);
            } catch(error) { if(log)log(`hybrid montage deferred: ${error.message}`); }
            try {
              if(layout.length<4&&typeof PanelOverlapFrames!=='undefined'){
                const additions=PanelOverlapFrames.analyzeImage(img,baseline,log);
                // Keep every prior identity. The complete three-outline group
                // may only refine its own legacy composite, not a neighbor.
                const accepted=[];
                for(let i=0;i<additions.length;i+=3){
                  const group=additions.slice(i,i+3);if(group.length!==3)continue;
                  const parent=baseline.find(p=>['x','y','w','h'].every(k=>p[k]===group[0]._overlapProof.parent[k]));
                  if(!parent||group.some(c=>identities.some(p=>p!==parent&&Math.max(0,Math.min(c.x+c.w,p.x+p.w)-Math.max(c.x,p.x))*Math.max(0,Math.min(c.y+c.h,p.y+p.h)-Math.max(c.y,p.y))>.00001)))continue;
                  accepted.push(...group);
                }
                identities=accepted.concat(identities);
              }
            }catch(error){if(log)log(`overlap outlines deferred: ${error.message}`);}
            try {
              if(layout.length<4&&typeof PanelInsetNeighbors!=='undefined'&&PanelInsetNeighbors.refineCompositePairImage){
                const additions=PanelInsetNeighbors.refineCompositePairImage(img,identities,baseline,log);
                if(additions.length===3)identities=additions.concat(identities);
              }
            }catch(error){if(log)log(`paired inset refinement deferred: ${error.message}`);}
            try {
              if(layout.length<4&&typeof PanelTerminalFrames!=='undefined'&&PanelTerminalFrames.refineWideImage){
                const additions=PanelTerminalFrames.refineWideImage(img,identities,baseline,log);
                if(additions.length===1)identities=additions.concat(identities);
              }
            }catch(error){if(log)log(`wide terminal refinement deferred: ${error.message}`);}
            // Keep the accepted bottom scene; add only its independently
            // enclosed neighbor ahead of the unclassified legacy fallback.
            try {
              if(layout.length<4&&typeof PanelTerminalFrames!=='undefined'&&PanelTerminalFrames.refineAdjacentImage){
                const additions=PanelTerminalFrames.refineAdjacentImage(img,identities,baseline,log);
                if(additions.length===1)identities=additions.concat(identities);
              }
            }catch(error){if(log)log(`adjacent terminal refinement deferred: ${error.message}`);}
            try {
              if(layout.length<4&&typeof PanelTerminalFrames!=='undefined'&&PanelTerminalFrames.refineColumnsImage){
                const additions=PanelTerminalFrames.refineColumnsImage(img,identities,baseline,log);
                if(additions.length>=2)identities=additions.concat(identities);
              }
            }catch(error){if(log)log(`column bank refinement deferred: ${error.message}`);}
            // Test39: if the only surviving map is still the original pair of
            // unproved full-width legacy slabs, require a complete nested
            // structural leaf map before publishing either slab as an owner.
            try {
              if(layout.length<4&&typeof PanelStructuralGrid!=='undefined'&&baseline.length===2&&identities.length===2&&PanelStructuralGrid.completeNestedImage&&identities.every(p=>baseline.includes(p)&&!p._identitySource&&!p._quad&&!p._outline&&!p._contours)){
                const completed=PanelStructuralGrid.completeNestedImage(img,baseline,log);
                if(completed.length>identities.length)identities=completed;
              }
            }catch(error){if(log)log(`nested structural baseline completion deferred: ${error.message}`);}
            resolve(identities);
            return;
          }
          // Only empty baseline pages may use the independent closed-border
          // route. Established identities retain their existing priority.
          let closed = [];
          try {
            if (typeof PanelClosedFrames !== 'undefined') closed = PanelClosedFrames.analyzeImage(img, log);
          } catch (error) {
            if (log) log(`closed frames deferred: ${error.message}`);
          }
          try {
            if (typeof PanelPartition !== 'undefined') {
              const partition = PanelPartition.analyzeImage(img, log, {
                allowPartial: closed.length > 0,
                anchors: closed
              });
              closed = this._completePartition(closed, partition, log);
            }
          } catch (error) {
            if (log) log(`page partition deferred: ${error.message}`);
          }
          try {
            if (typeof PanelClosedFrames !== 'undefined' && PanelClosedFrames.supplementImage) {
              const additions = PanelClosedFrames.supplementImage(img, closed, log);
              if (additions.length) closed = closed.concat(additions);
            }
          } catch (error) {
            if (log) log(`ink-core supplement deferred: ${error.message}`);
          }
          try {
            if(closed.length&&typeof PanelPartition!=='undefined'&&PanelPartition.supplementArtworkImage){
              const additions=PanelPartition.supplementArtworkImage(img,closed,log);
              if(additions.length)closed=closed.concat(additions);
            }
          }catch(error){if(log)log(`artwork junction supplement deferred: ${error.message}`);}
          if(!closed.length){
            try {
              if(typeof PanelPartition!=='undefined'&&PanelPartition.completeDarkImage)
                closed=PanelPartition.completeDarkImage(img,log);
            } catch(error) { if(log)log(`dark partition completion deferred: ${error.message}`); }
          }
          try {
            if(closed.length&&typeof PanelPartition!=='undefined'&&PanelPartition.supplementDarkImage){
              const additions=PanelPartition.supplementDarkImage(img,closed,log);
              if(additions.length)closed=closed.concat(additions);
            }
          }catch(error){if(log)log(`uniform ink-core supplement deferred: ${error.message}`);}
          try {
            if(closed.length&&typeof PanelOccludedFrames!=='undefined'){
              const additions=PanelOccludedFrames.supplementImage(img,closed,log);
              if(additions.length)closed=closed.concat(additions);
            }
          }catch(error){if(log)log(`balloon divider supplement deferred: ${error.message}`);}
          // Only an otherwise-empty identity map can use the component route.
          // Each cell has four independently fitted exterior-matte sides and
          // passes the same divider/inset vetoes. Existing maps are untouched.
          if(!closed.length){
            try {
              if(typeof PanelClosedFrames!=='undefined'&&PanelClosedFrames.darkComponentsImage){
                closed=this._admitDarkComponents(PanelClosedFrames.darkComponentsImage(img,log));
                if(closed.length&&PanelClosedFrames.pairedOutlinesImage){
                  const outlines=PanelClosedFrames.pairedOutlinesImage(img,closed,log);
                  if(outlines.length===2){
                    closed=closed.concat(outlines);
                    if(log)log('paired matte silhouettes: 2 independent edge-bleed frames');
                  }
                }
              }
            }catch(error){if(log)log(`dark component frames deferred: ${error.message}`);}
          }
          // Empty maps only: butt-joined panels may have no visible gutter.
          // A complete, independently proved six-face network is atomic.
          if(!closed.length){
            try {
              if(typeof PanelAbuttingFrames!=='undefined')
                closed=PanelAbuttingFrames.analyzeImage(img,log);
            } catch(error) { if(log)log(`abutting seam network deferred: ${error.message}`); }
          }
          if(!closed.length){
            try {
              if(typeof PanelAbuttingFrames!=='undefined'&&PanelAbuttingFrames.analyzeBleedStripsImage)
                closed=PanelAbuttingFrames.analyzeBleedStripsImage(img,log);
            } catch(error) { if(log)log(`side-bleed strip deferred: ${error.message}`); }
          }
          // A retained exterior-strip anchor can prove an interrupted tall rim.
          // New ownership is confined to its measured contour; anchors persist.
          try {
            if(typeof PanelRimFrames!=='undefined'){
              const additions=PanelRimFrames.supplementImage(img,closed,log);
              if(additions.length)closed=additions.concat(closed);
            }
          }catch(error){if(log)log(`interrupted rim deferred: ${error.message}`);}
          if(!closed.length){
            try { if(typeof PanelTerracedFrames!=='undefined')closed=PanelTerracedFrames.analyzeImage(img,log); }
            catch(error){if(log)log(`local matte stack deferred: ${error.message}`);}
          }
          // Paired local matte hulls: no global quiet margin is assumed.
          // This final route cannot replace or reorder an established map.
          if(!closed.length){
            try {if(typeof PanelLocalIslands!=='undefined')closed=PanelLocalIslands.analyzeImage(img,log);}
            catch(error){if(log)log(`paired local islands deferred: ${error.message}`);}
          }
          // Add one independently closed edge-bleed neighbour. Existing pair
          // identities, order, and fallback routes outside it are unchanged.
          try {
            if(typeof PanelLocalIslands!=='undefined'&&PanelLocalIslands.neighborImage){
              const additions=PanelLocalIslands.neighborImage(img,closed,log);
              if(additions.length)closed=closed.concat(additions);
            }
          }catch(error){if(log)log(`local matte neighbour deferred: ${error.message}`);}
          // A closed light-rim inset can bridge two independently witnessed
          // exterior gutters. No existing identity or priority is replaced.
          if(!closed.length){
            try {if(typeof PanelFramedInsets!=='undefined')closed=PanelFramedInsets.analyzeImage(img,log);}
            catch(error){if(log)log(`framed inset deferred: ${error.message}`);}
          }
          // A validated crossing inset can authorize its surrounding quiet
          // corridor cells. The inset keeps its original priority and identity.
          try {
            if(typeof PanelInsetNeighbors!=='undefined'){
              const additions=PanelInsetNeighbors.supplementImage(img,closed,log);
              if(additions.length)closed=closed.concat(additions);
            }
          }catch(error){if(log)log(`inset neighbours deferred: ${error.message}`);}
          // Empty maps only: two fixed exterior palettes must independently
          // enclose a complete tall cell with a measured sloping rail.
          if(!closed.length){
            try {if(typeof PanelEdgeCells!=='undefined')closed=PanelEdgeCells.analyzeImage(img,log);}
            catch(error){if(log)log(`sloping edge cells deferred: ${error.message}`);}
          }
          // A re-proved sloping edge cell permits a bounded search for a
          // separate corner with four observed dark rims. Existing identities
          // retain their exact order and geometry.
          try {
            if(typeof PanelCornerFrames!=='undefined'){
              const additions=PanelCornerFrames.supplementImage(img,closed,log);
              if(additions.length)closed=closed.concat(additions);
            }
          }catch(error){if(log)log(`corner rims deferred: ${error.message}`);}
          // A bounded terminal band can prove itself without a prior anchor.
          // This empty-map-only route cannot replace or reorder old identities.
          if(!closed.length){
            try {if(typeof PanelTerminalFrames!=='undefined')closed=PanelTerminalFrames.analyzeImage(img,log);}
            catch(error){if(log)log(`terminal rims deferred: ${error.message}`);}
          }
          // Test19: retain the terminal scene exactly, then independently
          // prove a light-rim inset crossing its side gutter. No old identity
          // is removed, reordered, or used as a rectangular fallback crop.
          try {
            if(typeof PanelFramedInsets!=='undefined'&&PanelFramedInsets.supplementTerminalImage){
              const additions=PanelFramedInsets.supplementTerminalImage(img,closed,log);
              if(additions.length)closed=closed.concat(additions);
            }
          }catch(error){if(log)log(`terminal inset deferred: ${error.message}`);}
          // Test20: retain the terminal/inset anchors, and add only a complete
          // pair of independently witnessed stepped/notched neighboring cells.
          try {
            if(typeof PanelInsetNeighbors!=='undefined'&&PanelInsetNeighbors.supplementTerminalBandImage){
              const additions=PanelInsetNeighbors.supplementTerminalBandImage(img,closed,log);
              if(additions.length)closed=closed.concat(additions);
            }
          }catch(error){if(log)log(`terminal inset neighbours deferred: ${error.message}`);}
          // Test21: append only a complete independently witnessed upper tier.
          // The accepted four-cell anchor group is never replaced or reordered.
          try {
            if(typeof PanelInsetNeighbors!=='undefined'&&PanelInsetNeighbors.supplementTierImage){
              const additions=PanelInsetNeighbors.supplementTierImage(img,closed,log);
              if(additions.length)closed=closed.concat(additions);
            }
          }catch(error){if(log)log(`staggered upper tier deferred: ${error.message}`);}
          // Test22: append a new route ONLY to an otherwise empty stable map.
          // Four traced rim sections and an exterior row-break crossing must
          // independently prove the wide inset. No prior identities change.
          if(!closed.length){
            try {if(typeof PanelFramedInsets!=='undefined'&&PanelFramedInsets.wideInsetsImage)closed=PanelFramedInsets.wideInsetsImage(img,log);}
            catch(error){if(log)log(`wide framed inset deferred: ${error.message}`);}
          }
          // Test23: preserve the wide inset, append only its independently
          // enclosed terminal neighbour. Never replace an earlier identity.
          try {
            if(typeof PanelInsetNeighbors!=='undefined'&&PanelInsetNeighbors.supplementWideTerminalImage){
              const additions=PanelInsetNeighbors.supplementWideTerminalImage(img,closed,log);
              if(additions.length)closed=closed.concat(additions);
            }
          }catch(error){if(log)log(`wide terminal neighbour deferred: ${error.message}`);}
          // Test24: append a separately enclosed flank above the wide inset.
          // A component cannot win without all four observed boundary paths.
          try {
            if(typeof PanelInsetNeighbors!=='undefined'&&PanelInsetNeighbors.supplementWideFlankImage){
              const additions=PanelInsetNeighbors.supplementWideFlankImage(img,closed,log);
              if(additions.length)closed=closed.concat(additions);
            }
          }catch(error){if(log)log(`wide inset flank deferred: ${error.message}`);}
          // Test25: a separately witnessed inner cell; append, never replace anchors.
          try{
            if(typeof PanelInsetNeighbors!=='undefined'&&PanelInsetNeighbors.supplementWideInnerImage){
              const additions=PanelInsetNeighbors.supplementWideInnerImage(img,closed,log);
              if(additions.length)closed=closed.concat(additions);
            }
          }catch(error){if(log)log(`wide inset inner deferred: ${error.message}`);}

          // Test26: preserve the four wide-inset cells, append a separately
          // observed pale-rim callout and its connected projecting effect.
          try {
            if(typeof PanelInsetNeighbors!=='undefined'&&PanelInsetNeighbors.supplementWideCalloutImage){
              const additions=PanelInsetNeighbors.supplementWideCalloutImage(img,closed,log);
              if(additions.length)closed=closed.concat(additions);
            }
          }catch(error){if(log)log(`pale-rim callout deferred: ${error.message}`);}

          // Test27: measure the upper neighbor's exposed rims and subtract
          // the independently proved callout; keep all earlier identities.
          try {
            if(typeof PanelInsetNeighbors!=='undefined'&&PanelInsetNeighbors.supplementWideActionImage){
              const additions=PanelInsetNeighbors.supplementWideActionImage(img,closed,log);
              if(additions.length)closed=closed.concat(additions);
            }
          }catch(error){if(log)log(`upper crossed-rim scene deferred: ${error.message}`);}
          // Test28: complete a separately witnessed residual cell; no old
          // descriptor or visible crop is rewritten to make room for it.
          try {
            if(typeof PanelInsetNeighbors!=='undefined'&&PanelInsetNeighbors.supplementWideResidualImage){
              const additions=PanelInsetNeighbors.supplementWideResidualImage(img,closed,log);
              if(additions.length)closed=closed.concat(additions);
            }
          }catch(error){if(log)log(`residual exterior scene deferred: ${error.message}`);}
          // Broad-spectrum pale-rim network: strictly empty-map-only. Earlier results
          // keep their exact descriptor bytes and order; alternate matte ownership
          // is used only when the legacy raster cannot prove a complete map.
          if(!closed.length){
            try{if(typeof PanelCurvedRims!=='undefined')closed=PanelCurvedRims.analyzeImage(img,log);}
            catch(error){if(log)log(`curved rim network deferred: ${error.message}`);}
          }
          // Final broad-spectrum empty-map route: derive cells only from
          // edge-connected page matte/paper and measured internal separators.
          if(!closed.length){
            try{if(typeof PanelMatteCells!=='undefined')closed=PanelMatteCells.analyzeImage(img,log);}
            catch(error){if(log)log(`matte cell network deferred: ${error.message}`);}
          }
          // A complete tap-independent guillotine grid may fill missing
          // cells only when two stronger perimeter anchors corroborate it.
          try {
            if(typeof PanelStructuralGrid!=='undefined'&&closed.length===2){
              const completed=PanelStructuralGrid.completeImage(img,closed,log);
              if(completed.length>closed.length)closed=completed;
            }
          }catch(error){if(log)log(`structural grid completion deferred: ${error.message}`);}
          // Test38: a three-anchor structural page may contain a terminal
          // bottom tier where foreground art occludes one internal seam. The
          // two straight cells remain orthogonal; the larger remainder keeps
          // an explicit visible L-outline instead of four tap-derived quads.
          try {
            if(typeof PanelStructuralGrid!=='undefined'&&closed.length===3&&PanelStructuralGrid.completeOccludedTierImage){
              const completed=PanelStructuralGrid.completeOccludedTierImage(img,closed,log);
              if(completed.length>closed.length)closed=completed;
            }
          }catch(error){if(log)log(`occluded structural tier deferred: ${error.message}`);}
          resolve(closed);
        }
        catch (err) {
          console.warn("Panel detection failed:", err);
          if (log) log(`ERROR: ${err.message}`);
          resolve([]);
        }
      };
      img.onerror = () => resolve([]);
      img.src = imgUrl;
    });
  },

  // A proved exterior-isolated frame can refine an unproved legacy bucket.
  // Retain the old bucket and all other identities verbatim. Only taps inside
  // the new frame gain priority; unresolved portions keep their prior route.
  // Validate the opt-in proof before letting it outrank a legacy composite.
  // Fitted rails and vertices must describe the same current analysis grid.
  _validDarkMatteFrame(c,component=false){
    const p=c?._closedFrameProof,g=p?.gutterProof,q=c?._quad;
    const w=p?.analysisWidth,h=p?.analysisHeight,f=p?.railFits;
    if(p?.version!==1||p.connected!==true||g?.method!==(component?'exterior-dark-component':'exterior-dark-matte')||
       !Number.isInteger(w)||!Number.isInteger(h)||w<80||h<80||w>900||h>900||
       !Array.isArray(g.color)||g.color.length!==3||g.color.some(v=>!Number.isFinite(v)||v<0||v>255)||
       g.color[0]*.299+g.color[1]*.587+g.color[2]*.114>25||
       !Array.isArray(p.coverage)||p.coverage.length!==4||p.coverage.some(v=>!Number.isFinite(v)||v<.97||v>1)||
       !Array.isArray(f)||f.length!==4||f.some(r=>!Number.isFinite(r?.slope)||!Number.isFinite(r?.offset)||Math.abs(r.slope)>(component ? .12 : .025))||
       !Array.isArray(q)||q.length!==4||q.some(v=>!Number.isFinite(v?.x)||!Number.isFinite(v?.y)||v.x<0||v.y<0||v.x>1||v.y>1))return false;
    const cross=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
    if(q.some((v,i)=>cross(v,q[(i+1)%4],q[(i+2)%4])<=1e-10))return false;
    const meet=(a,b)=>{const x=(b.offset+b.slope*a.offset)/(1-b.slope*a.slope);return {x:x/w,y:(a.offset+a.slope*x)/h};};
    const fitted=[meet(f[0],f[2]),meet(f[0],f[3]),meet(f[1],f[3]),meet(f[1],f[2])];
    if(fitted.some((v,i)=>Math.hypot((v.x-q[i].x)*w,(v.y-q[i].y)*h)>.05))return false;
    const xs=q.map(v=>v.x),ys=q.map(v=>v.y);
    return Math.abs(c.x-Math.min(...xs))<1e-9&&Math.abs(c.y-Math.min(...ys))<1e-9&&
      Math.abs(c.w-(Math.max(...xs)-Math.min(...xs)))<1e-9&&Math.abs(c.h-(Math.max(...ys)-Math.min(...ys)))<1e-9;
  },

  _validDarkComponentFrame(c){
    if(!this._validDarkMatteFrame(c,true)||c?._identitySource!=='closed-frame')return false;
    const proof=c._closedFrameProof,g=proof.gutterProof,p=g.componentProof;
    const w=proof.analysisWidth,h=proof.analysisHeight,q=c._quad;
    const area=Math.abs(q.reduce((sum,v,i)=>{const n=q[(i+1)%4];return sum+v.x*n.y-v.y*n.x;},0))/2;
    const ratios=(a,min)=>Array.isArray(a)&&a.length===4&&a.every(v=>Number.isFinite(v)&&v>=min&&v<=1);
    if(p?.method!=='four-observed-component-sides'||!ratios(g.exteriorSupport,.97)||
       !ratios(p.sideSupport,.88)||!ratios(p.inwardSupport,.90)||
       !Number.isInteger(p.pixelCount)||p.pixelCount<w*h*.02||p.pixelCount>w*h||
       !Number.isInteger(p.outsidePixels)||p.outsidePixels<0||p.outsidePixels>2||
       !Number.isInteger(p.foreignPixels)||p.foreignPixels<0||p.foreignPixels>2||
       !Number.isFinite(p.interiorMatteRatio)||p.interiorMatteRatio<0||p.interiorMatteRatio>.008||
       !Number.isFinite(p.componentAreaRatio)||p.componentAreaRatio<.93||p.componentAreaRatio>1.005||
       Math.abs(p.pixelCount/(area*w*h)-p.componentAreaRatio)>1e-8||area<.02||area>.65)return false;
    return true;
  },

  _admitDarkComponents(candidates){
    if(!Array.isArray(candidates)||candidates.length>12)return [];
    // Reject duplicate/conflicting offers rather than selecting a winner by
    // size. The component mask already supplies disjoint physical regions.
    const accepted=[];
    const cross=(a,b,p)=>(b.x-a.x)*(p.y-a.y)-(b.y-a.y)*(p.x-a.x);
    function overlap(a,b){
      let polygon=a._quad;
      for(let i=0;i<4&&polygon.length;i++){
        const c=b._quad[i],d=b._quad[(i+1)%4],input=polygon;polygon=[];
        for(let j=0;j<input.length;j++){
          const p=input[j],q=input[(j+1)%input.length],cp=cross(c,d,p),cq=cross(c,d,q);
          if(cp>=0)polygon.push(p);
          if((cp>=0)!==(cq>=0)){const t=cp/(cp-cq);polygon.push({x:p.x+t*(q.x-p.x),y:p.y+t*(q.y-p.y)});}
        }
      }
      return Math.abs(polygon.reduce((sum,p,i)=>{const q=polygon[(i+1)%polygon.length];return sum+p.x*q.y-p.y*q.x;},0))/2;
    }
    for(const c of candidates){
      if(!this._validDarkComponentFrame(c))return [];
      if(accepted.some(p=>overlap(p,c)>1e-10))return [];
      accepted.push(c);
    }
    return accepted;
  },
  _refineComposites(baseline,candidates,log,method='exterior-gradient-gutter'){
    if(!['exterior-gradient-gutter','exterior-dark-matte'].includes(method))return baseline;
    const eligible=p=>!p._quad&&!p._identitySource&&p.w*p.h>.30&&p.w>.7&&p.h>.35;
    const overlap=(a,b)=>Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x))*
      Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y));
    const accepted=[];
    for(const c of candidates){
      if(method==='exterior-dark-matte'&&!this._validDarkMatteFrame(c))continue;
      const proof=c?._closedFrameProof,gutter=proof?.gutterProof;
      if(c?._identitySource!=='closed-frame'||proof?.connected!==true||
         gutter?.method!==method||
         !Array.isArray(gutter.exteriorSupport)||gutter.exteriorSupport.length!==4||
         gutter.exteriorSupport.some(v=>!Number.isFinite(v)||v<.95)||
         !Array.isArray(c._quad)||c._quad.length!==4||c.w*c.h<.08)continue;
      const owners=baseline.filter(p=>eligible(p)&&c.x>=p.x-.004&&c.y>=p.y-.004&&
        c.x+c.w<=p.x+p.w+.004&&c.y+c.h<=p.y+p.h+.004&&c.w*c.h<p.w*p.h*.75);
      if(owners.length!==1)continue;
      if(baseline.some(p=>p!==owners[0]&&overlap(c,p)>.00001)||
         accepted.some(p=>overlap(c,p)>.00001))continue;
      accepted.push(c);
    }
    if(!accepted.length)return baseline;
    if(log)log(`${method} refinement: ${accepted.length} isolated frames; ${baseline.length} legacy identities preserved`);
    return accepted.concat(baseline);
  },


  _matteColumnParent(p){
    return !!p&&!p._quad&&!p._outline&&!p._identitySource&&
      ['x','y','w','h'].every(k=>Number.isFinite(p[k]))&&p.x>=0&&p.y>=0&&
      p.x+p.w<=1&&p.y+p.h<=1&&p.w>=.25&&p.w<=.60&&p.h>=.30&&p.h<=.75&&p.w*p.h>=.12;
  },

  _validMatteColumnRegion(r,parent,strip,anchor){
    const p=r?._openRegionProof,q=r?._quad;
    const W=p?.analysisWidth,H=p?.analysisHeight,within=(x,a,b)=>Number.isFinite(x)&&x>=a&&x<=b;
    const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
    if(!this._matteColumnParent(parent)||!this._validDarkComponentFrame(strip)||!this._validDarkMatteFrame(anchor)||
       r?._identitySource!=='open-region'||p?.version!==1||p.connected!==true||p.method!=='strip-separated-exterior-matte'||
       !Number.isInteger(W)||!Number.isInteger(H)||W<80||H<80||W>900||H>900||
       W!==strip._closedFrameProof.analysisWidth||H!==strip._closedFrameProof.analysisHeight||
       W!==anchor._closedFrameProof.analysisWidth||H!==anchor._closedFrameProof.analysisHeight||
       !same(p.stripQuad,strip._quad)||!same(p.anchorQuad,anchor._quad)||
       !same(p.parent,{x:parent.x,y:parent.y,w:parent.w,h:parent.h})||
       !Array.isArray(p.color)||p.color.length!==3||p.color.some(v=>!Number.isInteger(v)||!within(v,0,255))||
       !same(p.color,strip._closedFrameProof.gutterProof.color)||
       !Array.isArray(q)||q.length!==4||q.some(v=>!within(v?.x,0,1)||!within(v?.y,0,1))||
       !Array.isArray(p.foregroundBox)||p.foregroundBox.length!==4||p.foregroundBox.some(v=>!Number.isInteger(v))||
       !Array.isArray(p.searchBox)||p.searchBox.length!==4||p.searchBox.some(v=>!Number.isInteger(v))||
       p.cropPadding!==2||p.lostPixels!==0||p.retainedPixels!==p.foregroundPixels||
       !Number.isInteger(p.foregroundPixels)||p.foregroundPixels<W*H*.025||
       !Array.isArray(p.componentSizes)||!p.componentSizes.length||p.componentSizes.some(v=>!Number.isInteger(v)||v<=0)||
       p.componentSizes.reduce((a,b)=>a+b,0)!==p.foregroundPixels||p.componentSizes.some((v,i)=>i&&v>p.componentSizes[i-1])||
       p.componentSizes[0]/p.foregroundPixels<.80||(p.componentSizes[1]||0)/p.foregroundPixels>.08||
       !Array.isArray(p.exteriorSupport)||p.exteriorSupport.length!==4||p.exteriorSupport.some(v=>v!==1)||
       p.separatorSupport!==1||!Array.isArray(p.separatorRows)||p.separatorRows.length!==2||
       p.separatorRows.some(v=>!Number.isInteger(v))||!['top','bottom'].includes(p.stripSide))return false;
    const [l,t,rr,b]=p.foregroundBox,box=p.searchBox,crop=[l-2,t-2,rr+2,b+2];
    if(l>=rr||t>=b||box[0]<2||box[1]<2||box[2]>W-3||box[3]>H-3||
       crop[0]<box[0]||crop[1]<box[1]||crop[2]>box[2]||crop[3]>box[3])return false;
    const expected=[[crop[0],crop[1]],[crop[2],crop[1]],[crop[2],crop[3]],[crop[0],crop[3]]];
    if(q.some((v,i)=>Math.abs(v.x*W-expected[i][0])>1e-8||Math.abs(v.y*H-expected[i][1])>1e-8)||
       Math.abs(r.x*W-crop[0])>1e-8||Math.abs(r.y*H-crop[1])>1e-8||
       Math.abs(r.w*W-crop[2]+crop[0])>1e-8||Math.abs(r.h*H-crop[3]+crop[1])>1e-8)return false;
    const area=r.w*r.h*W*H,gap=p.separatorRows[1]-p.separatorRows[0]+1;
    if(!within(area/(W*H),.06,.35)||!within(p.foregroundFraction,.18,.80)||
       Math.abs(p.foregroundFraction-p.foregroundPixels/area)>1e-9||gap<4||gap>H*.08||
       p.separatorPixels!==gap*(box[2]-box[0]+1))return false;
    const sy=strip._quad.map(v=>v.y*H);
    if(p.stripSide==='top'?
      p.separatorRows[0]!==Math.ceil(Math.max(...sy))+1||p.separatorRows[1]!==t-1:
      p.separatorRows[0]!==b+1||p.separatorRows[1]!==Math.floor(Math.min(...sy))-1)return false;
    return true;
  },

  _refineMatteColumns(img,identities,baseline,anchors,strips,log){
    if(!Array.isArray(strips)||strips.length>12||!Array.isArray(anchors)||anchors.length>12)return identities;
    const overlap=(a,b)=>Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x))*
      Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y));
    const matches=(a,b,W,H)=>Math.max(Math.abs((a.x-b.x)*W),Math.abs((a.y-b.y)*H),
      Math.abs((a.x+a.w-b.x-b.w)*W),Math.abs((a.y+a.h-b.y-b.h)*H))<=3;
    const groups=[];
    for(const parent of baseline){
      if(!this._matteColumnParent(parent))continue;
      const proposals=[];
      for(const strip of strips){
        if(!this._validDarkComponentFrame(strip))continue;
        const W=strip._closedFrameProof.analysisWidth,H=strip._closedFrameProof.analysisHeight;
        if(strip.h>parent.h*.30||Math.abs((strip.x-parent.x)*W)>3||
           Math.abs((strip.x+strip.w-parent.x-parent.w)*W)>3||
           Math.min(Math.abs((strip.y-parent.y)*H),Math.abs((strip.y+strip.h-parent.y-parent.h)*H))>3)continue;
        const partners=anchors.filter(a=>{
          if(!this._validDarkMatteFrame(a)||a._closedFrameProof.analysisWidth!==W||a._closedFrameProof.analysisHeight!==H||
             Math.abs((a.y-parent.y)*H)>3||Math.abs((a.y+a.h-parent.y-parent.h)*H)>3)return false;
          const gap=Math.max((parent.x-a.x-a.w)*W,(a.x-parent.x-parent.w)*W);
          return gap>=3&&gap<=18&&baseline.filter(b=>b!==parent&&!b._identitySource&&!b._quad&&matches(a,b,W,H)).length===1;
        });
        if(partners.length!==1)continue;
        const anchor=partners[0],region=PanelClosedFrames.matteColumnRemainderImage(img,parent,strip,anchor,log);
        if(!this._validMatteColumnRegion(region,parent,strip,anchor)||overlap(strip,region)>1e-10)continue;
        const children=[strip,region];
        if(children.some(c=>identities.some(p=>p!==parent&&overlap(c,p)>1e-5)))continue;
        proposals.push(children);
      }
      // Multiple plausible splits are ambiguity, never a size-based winner.
      if(proposals.length===1)groups.push(proposals[0]);
    }
    const accepted=groups.filter((g,i)=>!groups.some((other,j)=>i!==j&&g.some(a=>other.some(b=>overlap(a,b)>1e-10)))).flat();
    if(accepted.length&&log)log(`matte column refinement: ${accepted.length} strip/artwork identities; all ${identities.length} previous identities preserved`);
    return accepted.length?accepted.concat(identities):identities;
  },

  _refineOpenRegions(baseline,identities,regions){
    const quad=p=>p._quad||[{x:p.x,y:p.y},{x:p.x+p.w,y:p.y},{x:p.x+p.w,y:p.y+p.h},{x:p.x,y:p.y+p.h}];
    const overlap=(a,b)=>{
      let points=quad(a);const clip=quad(b),cross=(a,b,p)=>(b.x-a.x)*(p.y-a.y)-(b.y-a.y)*(p.x-a.x);
      for(let i=0;i<4&&points.length;i++){
        const input=points;points=[];const c=clip[i],d=clip[(i+1)%4];
        for(let j=0;j<input.length;j++){
          const p=input[j],q=input[(j+1)%input.length],cp=cross(c,d,p),cq=cross(c,d,q);
          if(cp>=0)points.push(p);
          if((cp>=0)!==(cq>=0)){const t=cp/(cp-cq);points.push({x:p.x+(q.x-p.x)*t,y:p.y+(q.y-p.y)*t});}
        }
      }
      return Math.abs(points.reduce((area,p,i)=>{const q=points[(i+1)%points.length];return area+p.x*q.y-p.y*q.x;},0))/2;
    };
    const out=[];
    for(const r of regions){
      const p=r._openRegionProof;
      if(r._identitySource!=='open-region'||p?.method!=='three-neighbor-matte'||p.connected!==true||p.version!==1||
        p.exteriorSupport?.length!==4||p.exteriorSupport.some(v=>!Number.isFinite(v)||v<1)||
        p.neighborQuads?.length!==3||r._quad?.length!==4||r.w*r.h<.08)continue;
      const parents=baseline.filter(b=>!b._quad&&!b._identitySource&&b.w>.7&&b.h>.35&&overlap(r,b)/(r.w*r.h)>.95);
      if(parents.length!==1||[...identities,...out].some(b=>b!==parents[0]&&overlap(r,b)>.00001))continue;
      out.push(r);
    }return out;
  },

  // A connected partition can fill gaps in a partial closed-frame
  // list, but cannot replace, subdivide or enlarge any established identity.
  _completePartition(closed, partition, log) {
    if (!closed.length) return partition;
    if (partition.length < 4 || partition.length > 12 || partition.length <= closed.length) return closed;
    const proof = partition[0]?._partitionProof;
    const w = proof?.analysisWidth, h = proof?.analysisHeight;
    if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return closed;
    const pixels = p => Array.isArray(p?._quad) && p._quad.length === 4
      ? p._quad.map(v => [v.x * w, v.y * h]) : null;
    const cross = (a, b, c) => (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
    const valid = q => q && q.every((p, i) => p.every(Number.isFinite) &&
      p[0] >= 0 && p[0] <= w && p[1] >= 0 && p[1] <= h &&
      cross(p, q[(i+1)%4], q[(i+2)%4]) > 0);
    const leaves = partition.map(pixels);
    if (partition.some((p, i) => p._identitySource !== 'page-partition' ||
        !p._partitionProof?.connected || p._partitionProof.analysisWidth !== w ||
        p._partitionProof.analysisHeight !== h || !valid(leaves[i]))) return closed;
    const established = closed.map(pixels);
    if (closed.some((p, i) => !p._closedFrameProof?.connected || !valid(established[i]))) return closed;

    // Check the offered leaves themselves are disjoint. Shared ink borders
    // have zero area; duplicated or overlapping interiors are not a map.
    function intersectionArea(a, b) {
      let subject = a;
      for (let e = 0; e < 4 && subject.length; e++) {
        const start = b[e], end = b[(e+1)%4], clipped = [];
        for (let i = 0; i < subject.length; i++) {
          const p = subject[i], q = subject[(i+1)%subject.length];
          const cp = cross(start, end, p), cq = cross(start, end, q);
          if (cp >= 0) clipped.push(p);
          if ((cp >= 0) !== (cq >= 0)) {
            const t = cp / (cp-cq);
            clipped.push([p[0]+t*(q[0]-p[0]), p[1]+t*(q[1]-p[1])]);
          }
        }
        subject = clipped;
      }
      return Math.abs(subject.reduce((sum, p, i) => {
        const q = subject[(i+1)%subject.length]; return sum+p[0]*q[1]-p[1]*q[0];
      }, 0)) / 2;
    }
    for (let i = 0; i < leaves.length; i++) for (let j = i+1; j < leaves.length; j++) {
      if (intersectionArea(leaves[i], leaves[j]) > 1) return closed;
    }

    const matched = new Set();
    for (const q of established) {
      // Both independent detectors fit the same finite-width printed ink.
      // Three analysis pixels allow their different center fits, not a new
      // edge through artwork or a composite covering two partition leaves.
      const matches = leaves.map((leaf, i) => leaf.every((p, c) =>
        Math.hypot(p[0]-q[c][0], p[1]-q[c][1]) <= 3) ? i : -1).filter(i => i >= 0);
      if (matches.length !== 1 || matched.has(matches[0])) return closed;
      matched.add(matches[0]);
    }
    const additions = partition.filter((_, i) => !matched.has(i));
    for (const q of established) for (const p of additions) {
      if (intersectionArea(q, pixels(p)) > 1) return closed;
    }
    if (log) log(`page partition completion: preserved ${closed.length}, added ${additions.length}`);
    return closed.concat(additions);
  },

  // V100 HYBRID TEST: page-structure partitioner.
  // Builds a conservative guillotine partition from sustained black frame bands
  // and quiet gutter bands. It never invents missing sides from only two local
  // candidates. If it cannot prove a region, the existing V99/V92 fallback runs.
  detectTapHybrid(imgUrl, relX, relY, log) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        try { resolve(this._analyzeHybrid(img, relX, relY, log)); }
        catch (err) {
          console.warn("V100 hybrid failed:", err);
          if (log) log(`V100 hybrid ERROR: ${err.message}`);
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = imgUrl;
    });
  },

  _analyzeHybrid(img, relX, relY, log) {
    const maxDim = 900;
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));
    const tx = clamp01(relX) * (w - 1), ty = clamp01(relY) * (h - 1);
    const c = document.createElement("canvas"); c.width=w; c.height=h;
    const cx = c.getContext("2d", {willReadFrequently:true}); cx.drawImage(img,0,0,w,h);
    const d = cx.getImageData(0,0,w,h).data;
    const lum = new Uint8Array(w*h);
    for(let i=0,j=0;i<d.length;i+=4,j++) lum[j]=Math.round(.299*d[i]+.587*d[i+1]+.114*d[i+2]);

    // Find the comic's outer content rails from sustained dark runs near edges.
    // The structural pass deliberately uses a more inclusive threshold than
    // the legacy detector because antialiased/skewed printed rails are often
    // dark gray rather than pure black.
    const darkCut = 82;
    const rowRun = (y,x0,x1)=>{let best=0,run=0;for(let x=x0;x<=x1;x++){if(lum[y*w+x]<=darkCut){run++;best=Math.max(best,run)}else run=0}return best};
    const colRun = (x,y0,y1)=>{let best=0,run=0;for(let y=y0;y<=y1;y++){if(lum[y*w+x]<=darkCut){run++;best=Math.max(best,run)}else run=0}return best};
    let x0=0,x1=w-1,y0=0,y1=h-1;
    const minHR=Math.round(w*.55), minVR=Math.round(h*.55);
    for(let y=0;y<Math.round(h*.12);y++) if(rowRun(y,0,w-1)>=minHR){y0=y;break}
    for(let y=h-1;y>Math.round(h*.88);y--) if(rowRun(y,0,w-1)>=minHR){y1=y;break}
    for(let x=0;x<Math.round(w*.12);x++) if(colRun(x,0,h-1)>=minVR){x0=x;break}
    for(let x=w-1;x>Math.round(w*.88);x--) if(colRun(x,0,h-1)>=minVR){x1=x;break}

    const regions=[], splitTrace=[];
    const split=(a,b,c0,d0,depth)=>{
      const rw=b-a+1, rh=d0-c0+1;
      if(depth>7 || rw<w*.075 || rh<h*.055){regions.push([a,c0,b,d0]);return}
      let best=null;
      const sepBand=Math.max(2,Math.min(7,Math.round(Math.min(rw,rh)*.018)));
      // Candidate horizontal separator: sustained dark run OR narrow quiet gutter,
      // measured across the CURRENT region (so partial dividers become full after
      // their parent split).
      const my=Math.max(4,Math.round(rh*.05));
      for(let y=c0+my;y<=d0-my;y++){
        let dark=0,run=0,bestRun=0,rawDark=0,rawRun=0,rawBestRun=0,sum=0,sq=0;
        for(let x=a;x<=b;x++){
          let railV=255;
          for(let yy=Math.max(c0,y-sepBand);yy<=Math.min(d0,y+sepBand);yy++) railV=Math.min(railV,lum[yy*w+x]);
          const v=lum[y*w+x];
          if(railV<=darkCut){dark++;run++;bestRun=Math.max(bestRun,run)}else run=0;
          if(v<=darkCut){rawDark++;rawRun++;rawBestRun=Math.max(rawBestRun,rawRun)}else rawRun=0;
          sum+=v; sq+=v*v;
        }
        const n=rw, mean=sum/n, sd=Math.sqrt(Math.max(0,sq/n-mean*mean));
        const darkFrac=dark/n, runFrac=bestRun/n;
        const rawDarkFrac=rawDark/n, rawRunFrac=rawBestRun/n;
        const sideOffset=sepBand+3;
        let sideA=0,sideB=0;
        for(let x=a;x<=b;x++){
          sideA+=lum[Math.max(c0,y-sideOffset)*w+x];
          sideB+=lum[Math.min(d0,y+sideOffset)*w+x];
        }
        const railContrast=(sideA+sideB)/(2*n)-mean;
        const straightScore=(rawRunFrac>=.86&&rawDarkFrac>=.70)?rawRunFrac+rawDarkFrac:0;
        const driftingScore=(runFrac>=.86&&darkFrac>=.68&&rawDarkFrac>=.16)?(runFrac+darkFrac)*.90:0;
        const blackScore=Math.max(
          (railContrast>=18||mean<=35)?straightScore:0,
          (railContrast>=30||mean<=35)?driftingScore:0
        );
        const gutterScore=(sd<=10 && (mean>=165 || mean<=150))?(.95 + (10-sd)/20):0;
        const score=Math.max(blackScore,gutterScore);
        if(score>0 && (!best || score>best.score)) best={axis:'H',pos:y,score,
          mode:blackScore>=gutterScore?'rail':'gutter',rawDarkFrac,rawRunFrac,
          darkFrac,runFrac,mean,sd,railContrast};
      }
      const mx=Math.max(4,Math.round(rw*.05));
      for(let x=a+mx;x<=b-mx;x++){
        let dark=0,run=0,bestRun=0,rawDark=0,rawRun=0,rawBestRun=0,sum=0,sq=0;
        for(let y=c0;y<=d0;y++){
          let railV=255;
          for(let xx=Math.max(a,x-sepBand);xx<=Math.min(b,x+sepBand);xx++) railV=Math.min(railV,lum[y*w+xx]);
          const v=lum[y*w+x];
          if(railV<=darkCut){dark++;run++;bestRun=Math.max(bestRun,run)}else run=0;
          if(v<=darkCut){rawDark++;rawRun++;rawBestRun=Math.max(rawBestRun,rawRun)}else rawRun=0;
          sum+=v; sq+=v*v;
        }
        const n=rh, mean=sum/n, sd=Math.sqrt(Math.max(0,sq/n-mean*mean));
        const darkFrac=dark/n, runFrac=bestRun/n;
        const rawDarkFrac=rawDark/n, rawRunFrac=rawBestRun/n;
        const sideOffset=sepBand+3;
        let sideA=0,sideB=0;
        for(let y=c0;y<=d0;y++){
          sideA+=lum[y*w+Math.max(a,x-sideOffset)];
          sideB+=lum[y*w+Math.min(b,x+sideOffset)];
        }
        const railContrast=(sideA+sideB)/(2*n)-mean;
        const straightScore=(rawRunFrac>=.86&&rawDarkFrac>=.70)?rawRunFrac+rawDarkFrac:0;
        const driftingScore=(runFrac>=.86&&darkFrac>=.68&&rawDarkFrac>=.16)?(runFrac+darkFrac)*.90:0;
        const blackScore=Math.max(
          (railContrast>=18||mean<=35)?straightScore:0,
          (railContrast>=30||mean<=35)?driftingScore:0
        );
        const gutterScore=(sd<=10 && (mean>=165 || mean<=150))?(.95 + (10-sd)/20):0;
        const score=Math.max(blackScore,gutterScore);
        if(score>0 && (!best || score>best.score+.03)) best={axis:'V',pos:x,score,
          mode:blackScore>=gutterScore?'rail':'gutter',rawDarkFrac,rawRunFrac,
          darkFrac,runFrac,mean,sd,railContrast};
      }
      if(!best){regions.push([a,c0,b,d0]);return}
      splitTrace.push({region:[a,c0,b,d0],depth,...best});
      const pad=Math.max(2,Math.round((best.axis==='H'?rh:rw)*.006));
      if(best.axis==='H'){
        if(best.pos-c0 < rh*.09 || d0-best.pos < rh*.09){regions.push([a,c0,b,d0]);return}
        split(a,b,c0,Math.max(c0,best.pos-pad),depth+1);
        split(a,b,Math.min(d0,best.pos+pad),d0,depth+1);
      }else{
        if(best.pos-a < rw*.09 || b-best.pos < rw*.09){regions.push([a,c0,b,d0]);return}
        split(a,Math.max(a,best.pos-pad),c0,d0,depth+1);
        split(Math.min(b,best.pos+pad),b,c0,d0,depth+1);
      }
    };
    split(x0,x1,y0,y1,0);

    // Conservative cleanup and tap selection. Reject implausibly tiny fragments.
    const clean=regions.filter(r=>((r[2]-r[0]+1)*(r[3]-r[1]+1)) >= w*h*.018);
    if(log) log(`V100 hybrid partition rails=${x0},${y0}-${x1},${y1} regions=${clean.length}`);
    if(splitTrace.length>20){if(log)log(`V100 hybrid MISS: unstable over-partition splits=${splitTrace.length}`);return null}
    const hit=clean.find(r=>tx>=r[0]&&tx<=r[2]&&ty>=r[1]&&ty<=r[3]);
    if(!hit){if(log)log('V100 hybrid MISS: tap not in proven region');return null}
    const pw=hit[2]-hit[0]+1, ph=hit[3]-hit[1]+1;
    // If the result is nearly the whole page, hybrid learned nothing; defer.
    if(pw*ph > (x1-x0+1)*(y1-y0+1)*.86){if(log)log('V100 hybrid MISS: unpartitioned page');return null}
    const out={x:hit[0]/w,y:hit[1]/h,w:pw/w,h:ph/h,_v100Hybrid:true,
      _v100SplitTrace:splitTrace};

    // A page-edge structural fragment covering over half the image is usually
    // an unsplit composite, not a usable identity seed. Let V99 or the strict
    // closed-frame rescue decide instead.
    const outArea=out.w*out.h;
    const edgeComposite=outArea>.50&&
      (out.x<=.003||out.y<=.003||out.x+out.w>=.997||out.y+out.h>=.997);
    if(edgeComposite){if(log)log(`V100 hybrid MISS: edge composite area=${outArea.toFixed(3)}`);return null}

    if(log)log(`V100 hybrid HIT x=${out.x.toFixed(4)} y=${out.y.toFixed(4)} w=${out.w.toFixed(4)} h=${out.h.toFixed(4)}`);
    return out;
  },


  // Geometry refinement moved to js/panels-geometry-skewed.js in V2.78.05.
  // Stable panel identification intentionally stays rectangle-first here.

  // Geometry modules own all post-detection shape refinement.

  // V99 fallback: V91 coherent boundary SET plus internal-gutter refinement. A boundary is
  // not selected because it is merely nearest, smallest, or largest. Each
  // side is scored for continuity and edge support, then opposite/adjacent
  // boundaries are paired only when their support spans are mutually
  // compatible and the resulting region contains the tap.
  detectTapLocalFallback(imgUrl, relX, relY, log) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        try { resolve(this._analyzeBoundarySet(img, relX, relY, log)); }
        catch (err) {
          console.warn("V99 fallback failed:", err);
          if (log) log(`V99 fallback ERROR: ${err.message}`);
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = imgUrl;
    });
  },

  _analyzeBoundarySet(img, relX, relY, log) {
    const maxDim = 900;
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));
    const tx = clamp01(relX) * (w - 1);
    const ty = clamp01(relY) * (h - 1);

    if (log) log(`V92 boundary-set source=${img.width}x${img.height} downscaled=${w}x${h} tap=${Math.round(tx)},${Math.round(ty)}`);

    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h).data;
    const lum = new Float32Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      lum[y * w + x] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    }

    // Robust global scale. This is deliberately only used to normalize
    // boundary evidence; it does not choose a panel by itself.
    const sample = [];
    const step = Math.max(1, Math.floor(Math.max(w, h) / 180));
    for (let y = 1; y < h - 1; y += step) for (let x = 1; x < w - 1; x += step) {
      sample.push(
        Math.abs(lum[y*w+x] - lum[(y-1)*w+x]) +
        Math.abs(lum[(y+1)*w+x] - lum[y*w+x]) +
        Math.abs(lum[y*w+x] - lum[y*w+x-1]) +
        Math.abs(lum[y*w+x+1] - lum[y*w+x])
      );
    }
    sample.sort((a,b)=>a-b);
    const med = sample.length ? sample[Math.floor(sample.length * 0.5)] : 0;
    const edgeCut = Math.max(9, med * 2.5);
    const quietCut = Math.max(2.5, edgeCut * 0.44);

    // V97: reverse the evidence order for panel boundaries.
    // Black frame lines are primary candidates; grey gutter evidence confirms
    // them when present. This is deliberately separate from the V96
    // gutter-first approach.
    const blackH = this._findBlackFirstBoundaries(lum, w, h, tx, ty, "H");
    const blackV = this._findBlackFirstBoundaries(lum, w, h, tx, ty, "V");
    const greyH = this._findHorizontalBoundaries(lum, w, h, tx, ty, edgeCut, quietCut);
    const greyV = this._findVerticalBoundaries(lum, w, h, tx, ty, edgeCut, quietCut);

    this._confirmBlackWithGrey(blackH, greyH, "H", w, h);
    this._confirmBlackWithGrey(blackV, greyV, "V", w, h);

    const hCandidates = blackH.concat(greyH);
    const vCandidates = blackV.concat(greyV);

    if (log) {
      log(`V97 black-first H=${blackH.length} V=${blackV.length}`);
    }

    if (log) {
      log(`V99 boundary candidates H=${hCandidates.length} V=${vCandidates.length} edgeCut=${edgeCut.toFixed(1)} quietCut=${quietCut.toFixed(1)}`);
      log(`V99 H candidates=${JSON.stringify(hCandidates.slice(0,8))}`);
      log(`V99 V candidates=${JSON.stringify(vCandidates.slice(0,8))}`);
    }

    const top = hCandidates.filter(c => c.pos < ty).sort((a,b)=>Math.abs(ty-a.pos)-Math.abs(ty-b.pos)).slice(0,5);
    const bottom = hCandidates.filter(c => c.pos > ty).sort((a,b)=>Math.abs(ty-a.pos)-Math.abs(ty-b.pos)).slice(0,5);
    const left = vCandidates.filter(c => c.pos < tx).sort((a,b)=>Math.abs(tx-a.pos)-Math.abs(tx-b.pos)).slice(0,5);
    const right = vCandidates.filter(c => c.pos > tx).sort((a,b)=>Math.abs(tx-a.pos)-Math.abs(tx-b.pos)).slice(0,5);

    // Page edges are valid boundaries, but never count as gutter evidence.
    top.unshift({pos:0, edge:true, quality:0, span:[0,w-1]});
    bottom.unshift({pos:h-1, edge:true, quality:0, span:[0,w-1]});
    left.unshift({pos:0, edge:true, quality:0, span:[0,h-1]});
    right.unshift({pos:w-1, edge:true, quality:0, span:[0,h-1]});

    let best = null;
    for (const T of top) for (const B of bottom) for (const L of left) for (const R of right) {
      const pw = R.pos - L.pos, ph = B.pos - T.pos;
      if (pw <= w*0.04 || ph <= h*0.04) continue;
      if (!(tx >= L.pos && tx <= R.pos && ty >= T.pos && ty <= B.pos)) continue;

      const hs = [T,B].filter(c=>!c.edge);
      const vs = [L,R].filter(c=>!c.edge);
      const sides = hs.length + vs.length;
      if (sides < 2) continue;

      const hOverlap = boundarySpanOverlap(T, B, w);
      const vOverlap = boundarySpanOverlap(L, R, h);
      const hNeed = Math.max(w*0.14, pw*0.28);
      const vNeed = Math.max(h*0.14, ph*0.28);
      const hCoherent = (T.edge || B.edge || hOverlap >= hNeed);
      const vCoherent = (L.edge || R.edge || vOverlap >= vNeed);
      if (!hCoherent || !vCoherent) continue;

      // V91: opposing-boundary agreement. A candidate is only trustworthy when
      // the boundaries on the same axis actually support the same proposed
      // panel span. This is a consistency test, not a smallest/largest rule.
      // Each non-edge boundary must cover a meaningful portion of the candidate
      // span, and opposing supports must overlap strongly enough to describe
      // the same enclosure. Edge boundaries are valid but contribute no gutter
      // evidence. This specifically rejects large regions whose detected
      // boundaries only cover a small local slice of the proposed rectangle.
      const hTopCov = T.edge ? 1 : intervalCoverage(T.span, L.pos, R.pos) / Math.max(1, pw);
      const hBotCov = B.edge ? 1 : intervalCoverage(B.span, L.pos, R.pos) / Math.max(1, pw);
      const vLeftCov = L.edge ? 1 : intervalCoverage(L.span, T.pos, B.pos) / Math.max(1, ph);
      const vRightCov = R.edge ? 1 : intervalCoverage(R.span, T.pos, B.pos) / Math.max(1, ph);
      const hPair = (T.edge || B.edge) ? Math.min(hTopCov, hBotCov) : Math.min(hTopCov, hBotCov, hOverlap / Math.max(1, pw));
      const vPair = (L.edge || R.edge) ? Math.min(vLeftCov, vRightCov) : Math.min(vLeftCov, vRightCov, vOverlap / Math.max(1, ph));
      const pairNeed = 0.42;
      if (hPair < pairNeed || vPair < pairNeed) continue;

      // Score only evidence quality and mutual coherence. Region area is not
      // rewarded or penalized, so V87 does not reintroduce smallest/largest.
      let score = 0;
      score += T.edge ? 0.45 : T.quality;
      score += B.edge ? 0.45 : B.quality;
      score += L.edge ? 0.45 : L.quality;
      score += R.edge ? 0.45 : R.quality;
      if (!T.edge && !B.edge) score += Math.min(1.0, hOverlap / Math.max(1,hNeed));
      if (!L.edge && !R.edge) score += Math.min(1.0, vOverlap / Math.max(1,vNeed));
      score += sides * 0.35;

      // Prefer boundary sets with evidence on both axes, or two opposing
      // same-axis gutters for full-width/full-height comic panels.
      const axisBonus = (hs.length >= 2 ? 0.5 : 0) + (vs.length >= 2 ? 0.5 : 0);
      score += axisBonus;

      // V99: the V98 nearest-valid idea must act at the actual boundary-set
      // selection point. Keep evidence quality primary, but when two coherent
      // sets are close in score, prefer the set whose valid boundaries are
      // closer to the tap. This is a tie-breaker only.
      const tapBoundaryDistance =
        Math.max(0, ty - T.pos) +
        Math.max(0, B.pos - ty) +
        Math.max(0, tx - L.pos) +
        Math.max(0, R.pos - tx);

      if (!best) {
        best = {T,B,L,R,score,sides,hOverlap,vOverlap,hPair,vPair,pw,ph,tapBoundaryDistance};
      } else {
        const scoreGap = score - best.score;
        const tieBand = 0.45;
        const distanceImprovement = best.tapBoundaryDistance - tapBoundaryDistance;
        const meaningfulDistance = Math.max(6, Math.min(w,h) * 0.035);

        if (
          scoreGap > 0 ||
          (Math.abs(scoreGap) <= tieBand && distanceImprovement > meaningfulDistance)
        ) {
          best = {T,B,L,R,score,sides,hOverlap,vOverlap,hPair,vPair,pw,ph,tapBoundaryDistance};
        }
      }
    }

    if (!best) {
      if (log) log("V99 boundary-set REJECTED: no coherent boundary set around tap");
      return null;
    }

    let p = {
      x: best.L.pos / w,
      y: best.T.pos / h,
      w: best.pw / w,
      h: best.ph / h,
      _v87BoundarySet: true,
      _gutterSides: best.sides,
      // Reaching this return path means V92 found no sustained internal split.
      // The geometry router uses this explicit proof to preserve local
      // orthogonal panels instead of letting a later skew search replace them.
      _v99InteriorClean: true
    };

    // V89: A good outer boundary set can still contain multiple panels.
    // Iteratively inspect the selected region for strong internal gutters.
    // Each split is chosen by gutter continuity/evidence, while the tap
    // determines which side survives. We do NOT choose the smallest child.
    const refined = this._splitAtInternalGuttersIterative(lum, w, h, tx, ty, p, edgeCut, quietCut, log);
    if (refined) p = refined;

    // V92: panel interior validation. Even a coherent outer boundary set can
    // still contain multiple visual panels if an internal gutter survived the
    // V89 iterative refinement. Reject that result rather than accepting a
    // multi-panel pop-out. This is deliberately not a size rule: small and
    // large panels are both allowed when their interior is not divided by a
    // strong sustained gutter.
    const interior = this._validatePanelInterior(lum, w, h, tx, ty, p, edgeCut, quietCut, log);
    if (!interior.ok) {
      if (log) log(`V99 interior validation REJECTED: ${interior.reason}`);
      return null;
    }

    // V2.78.05: legacy fallback supplies panel identity only. Geometry is
    // routed separately after detection, so panels.js never invents a polygon.
    if (log) log(`V99 boundary-set ACCEPTED x=${p.x.toFixed(4)} y=${p.y.toFixed(4)} w=${p.w.toFixed(4)} h=${p.h.toFixed(4)} sides=${p._gutterSides} score=${best.score.toFixed(2)} hOverlap=${Math.round(best.hOverlap)} vOverlap=${Math.round(best.vOverlap)} hPair=${best.hPair.toFixed(2)} vPair=${best.vPair.toFixed(2)} interior=clean`);
    return p;
  },

  _splitAtInternalGuttersIterative(lum, w, h, tx, ty, p, edgeCut, quietCut, log) {
    let current = {...p};
    const maxSplits = 4;
    let changed = false;
    for (let i = 0; i < maxSplits; i++) {
      const next = this._splitAtInternalGuttersOnce(lum, w, h, tx, ty, current, edgeCut, quietCut, log);
      if (!next) break;
      current = next;
      changed = true;
      if (log) log(`V99 internal refinement pass ${i + 1}/${maxSplits}`);
    }
    return changed ? current : null;
  },

  _splitAtInternalGuttersOnce(lum, w, h, tx, ty, p, edgeCut, quietCut, log) {
    const x0 = Math.max(1, Math.round(p.x * w));
    const y0 = Math.max(1, Math.round(p.y * h));
    const x1 = Math.min(w - 2, Math.round((p.x + p.w) * w));
    const y1 = Math.min(h - 2, Math.round((p.y + p.h) * h));
    const pw = Math.max(1, x1 - x0);
    const ph = Math.max(1, y1 - y0);
    // Minimum continuity is a safety gate only; region size is never used
    // to prefer one resulting child over another.
    const minSpanH = 0.66;
    const minSpanV = 0.66;

    const findH = () => {
      let best = null;
      const xa = Math.max(x0 + 2, Math.round(x0 + pw * 0.08));
      const xb = Math.min(x1 - 2, Math.round(x1 - pw * 0.08));
      const span = Math.max(1, xb - xa + 1);
      for (let y = y0 + Math.max(3, Math.round(ph * 0.05)); y <= y1 - Math.max(3, Math.round(ph * 0.05)); y++) {
        if (Math.abs(y - ty) < Math.max(3, Math.round(ph * 0.025))) continue;
        let sum = 0, quiet = 0;
        for (let x = xa; x <= xb; x++) {
          const g = Math.abs(lum[y*w+x]-lum[(y-1)*w+x]) + Math.abs(lum[(y+1)*w+x]-lum[y*w+x]);
          sum += g;
          if (g <= quietCut) quiet++;
        }
        const avg = sum / span;
        const quietFrac = quiet / span;
        const before = this._axisEdgeSupportH(lum, w, h, y - 1, xa, xb);
        const after = this._axisEdgeSupportH(lum, w, h, y + 1, xa, xb);
        const support = (before + after) / 2;
        if (quietFrac < 0.62 || support < edgeCut * 0.90) continue;
        const quality = (support / Math.max(1, edgeCut)) * (0.55 + quietFrac * 0.45);
        if (!best || quality > best.quality) best = {pos:y, quality, quietFrac, spanFrac:span/pw};
      }
      return best && best.spanFrac >= minSpanH ? best : null;
    };

    const findV = () => {
      let best = null;
      const ya = Math.max(y0 + 2, Math.round(y0 + ph * 0.08));
      const yb = Math.min(y1 - 2, Math.round(y1 - ph * 0.08));
      const span = Math.max(1, yb - ya + 1);
      for (let x = x0 + Math.max(3, Math.round(pw * 0.05)); x <= x1 - Math.max(3, Math.round(pw * 0.05)); x++) {
        if (Math.abs(x - tx) < Math.max(3, Math.round(pw * 0.025))) continue;
        let sum = 0, quiet = 0;
        for (let y = ya; y <= yb; y++) {
          const g = Math.abs(lum[y*w+x]-lum[y*w+x-1]) + Math.abs(lum[y*w+x+1]-lum[y*w+x]);
          sum += g;
          if (g <= quietCut) quiet++;
        }
        const avg = sum / span;
        const quietFrac = quiet / span;
        const before = this._axisEdgeSupportV(lum, w, h, x - 1, ya, yb);
        const after = this._axisEdgeSupportV(lum, w, h, x + 1, ya, yb);
        const support = (before + after) / 2;
        if (quietFrac < 0.62 || support < edgeCut * 0.90) continue;
        const quality = (support / Math.max(1, edgeCut)) * (0.55 + quietFrac * 0.45);
        if (!best || quality > best.quality) best = {pos:x, quality, quietFrac, spanFrac:span/ph};
      }
      return best && best.spanFrac >= minSpanV ? best : null;
    };

    let refined = {...p};
    const hg = findH();
    const vg = findV();
    let did = false;
    if (hg) {
      if (ty < hg.pos) refined.h = (hg.pos / h) - refined.y;
      else refined.y = hg.pos / h, refined.h = (p.y + p.h) - refined.y;
      did = true;
      if (log) log(`V99 internal H gutter split at ${hg.pos} quality=${hg.quality.toFixed(2)} quiet=${hg.quietFrac.toFixed(2)}`);
    }
    if (vg) {
      if (tx < vg.pos) refined.w = (vg.pos / w) - refined.x;
      else refined.x = vg.pos / w, refined.w = (p.x + p.w) - refined.x;
      did = true;
      if (log) log(`V99 internal V gutter split at ${vg.pos} quality=${vg.quality.toFixed(2)} quiet=${vg.quietFrac.toFixed(2)}`);
    }
    if (!did) return null;
    refined.w = clamp01(refined.w);
    refined.h = clamp01(refined.h);
    refined._v88InternalSplit = true;
    return refined;
  },

  _validatePanelInterior(lum, w, h, tx, ty, p, edgeCut, quietCut, log) {
    const x0 = Math.max(1, Math.round(p.x * w));
    const y0 = Math.max(1, Math.round(p.y * h));
    const x1 = Math.min(w - 2, Math.round((p.x + p.w) * w));
    const y1 = Math.min(h - 2, Math.round((p.y + p.h) * h));
    const pw = Math.max(1, x1 - x0);
    const ph = Math.max(1, y1 - y0);

    // Validation is intentionally conservative. We only call something an
    // internal gutter when it forms a long, quiet corridor with strong edge
    // support on both sides. Short artwork strokes and speech-balloon edges
    // should not be enough to invalidate a panel.
    const marginX = Math.max(3, Math.round(pw * 0.08));
    const marginY = Math.max(3, Math.round(ph * 0.08));
    const xa = Math.min(x1 - 2, x0 + marginX);
    const xb = Math.max(x0 + 2, x1 - marginX);
    const ya = Math.min(y1 - 2, y0 + marginY);
    const yb = Math.max(y0 + 2, y1 - marginY);
    const spanNeed = 0.72;
    const quietNeed = 0.70;
    const supportNeed = edgeCut * 1.05;

    let strongestH = null;
    for (let y = ya + 2; y <= yb - 2; y++) {
      // Do not let a tap sitting immediately on a gutter invalidate the panel;
      // V89's split logic has already had the opportunity to use that gutter.
      if (Math.abs(y - ty) <= Math.max(3, Math.round(ph * 0.025))) continue;
      let quiet = 0;
      for (let x = xa; x <= xb; x++) {
        const g = Math.abs(lum[y*w+x] - lum[(y-1)*w+x]) +
                  Math.abs(lum[(y+1)*w+x] - lum[y*w+x]);
        if (g <= quietCut) quiet++;
      }
      const span = Math.max(1, xb - xa + 1);
      const quietFrac = quiet / span;
      if (quietFrac < quietNeed) continue;
      const support = this._axisEdgeSupportH(lum, w, h, y - 1, xa, xb) * 0.5 +
                      this._axisEdgeSupportH(lum, w, h, y + 1, xa, xb) * 0.5;
      const spanFrac = span / Math.max(1, pw);
      if (spanFrac < spanNeed || support < supportNeed) continue;
      const quality = (support / Math.max(1, edgeCut)) * (0.60 + quietFrac * 0.40) * spanFrac;
      if (!strongestH || quality > strongestH.quality) {
        strongestH = { pos: y, quality, quietFrac, support, spanFrac };
      }
    }

    let strongestV = null;
    for (let x = xa + 2; x <= xb - 2; x++) {
      if (Math.abs(x - tx) <= Math.max(3, Math.round(pw * 0.025))) continue;
      let quiet = 0;
      for (let y = ya; y <= yb; y++) {
        const g = Math.abs(lum[y*w+x] - lum[y*w+x-1]) +
                  Math.abs(lum[y*w+x+1] - lum[y*w+x]);
        if (g <= quietCut) quiet++;
      }
      const span = Math.max(1, yb - ya + 1);
      const quietFrac = quiet / span;
      if (quietFrac < quietNeed) continue;
      const support = this._axisEdgeSupportV(lum, w, h, x - 1, ya, yb) * 0.5 +
                      this._axisEdgeSupportV(lum, w, h, x + 1, ya, yb) * 0.5;
      const spanFrac = span / Math.max(1, ph);
      if (spanFrac < spanNeed || support < supportNeed) continue;
      const quality = (support / Math.max(1, edgeCut)) * (0.60 + quietFrac * 0.40) * spanFrac;
      if (!strongestV || quality > strongestV.quality) {
        strongestV = { pos: x, quality, quietFrac, support, spanFrac };
      }
    }

    if (log) {
      if (strongestH) log(`V92 interior H gutter candidate y=${strongestH.pos} quality=${strongestH.quality.toFixed(2)} span=${strongestH.spanFrac.toFixed(2)} quiet=${strongestH.quietFrac.toFixed(2)}`);
      if (strongestV) log(`V92 interior V gutter candidate x=${strongestV.pos} quality=${strongestV.quality.toFixed(2)} span=${strongestV.spanFrac.toFixed(2)} quiet=${strongestV.quietFrac.toFixed(2)}`);
    }

    if (strongestH && strongestV) return { ok: false, reason: "strong internal H+V gutters remain" };
    if (strongestH) return { ok: false, reason: `strong internal H gutter at ${strongestH.pos}` };
    if (strongestV) return { ok: false, reason: `strong internal V gutter at ${strongestV.pos}` };
    return { ok: true };
  },

  _axisEdgeSupportH(lum, w, h, y, xa, xb) {
    y = Math.max(1, Math.min(h-2, y));
    let sum = 0;
    for (let x = xa; x <= xb; x++) sum += Math.abs(lum[y*w+x]-lum[(y-1)*w+x]) + Math.abs(lum[(y+1)*w+x]-lum[y*w+x]);
    return sum / Math.max(1, xb-xa+1);
  },

  _axisEdgeSupportV(lum, w, h, x, ya, yb) {
    x = Math.max(1, Math.min(w-2, x));
    let sum = 0;
    for (let y = ya; y <= yb; y++) sum += Math.abs(lum[y*w+x]-lum[y*w+x-1]) + Math.abs(lum[y*w+x+1]-lum[y*w+x]);
    return sum / Math.max(1, yb-ya+1);
  },


  _v98RankBoundaryCandidates(candidates, tapPos, total) {
    const valid = (candidates || []).filter(c =>
      Number.isFinite(c.pos) && Number.isFinite(c.quality)
    );

    // Quality remains primary. Only candidates within a narrow evidence tier
    // can be reordered by distance to the tap.
    valid.sort((a,b) => {
      const qa = a.quality || 0;
      const qb = b.quality || 0;
      const gap = Math.abs(qa-qb);
      if (gap <= 0.55) {
        const da = Math.abs(a.pos-tapPos);
        const db = Math.abs(b.pos-tapPos);
        const distanceGap = Math.abs(da-db);
        if (distanceGap > Math.max(3,total*0.012)) return da-db;
      }
      return qb-qa;
    });
    return valid;
  },

  _findBlackFirstBoundaries(lum, w, h, tx, ty, axis) {
    const out = [];
    const darkCut = 55;
    const lightCut = 105;
    const minDarkFrac = 0.62;
    const minRunFrac = 0.45;
    const minSpanFrac = 0.34;
    const total = axis === "H" ? h : w;
    const spanLimit = axis === "H" ? w : h;

    const spans = [0.38, 0.52, 0.68, 0.84];

    for (const frac of spans) {
      if (axis === "H") {
        const half = Math.max(12, Math.round(w * frac / 2));
        const xa = Math.max(2, Math.round(tx) - half);
        const xb = Math.min(w - 3, Math.round(tx) + half);
        if (xb <= xa) continue;

        for (let y = 2; y < h - 2; y++) {
          if (Math.abs(y - ty) < Math.max(4, Math.round(h * 0.02))) continue;

          let dark = 0, bestRun = 0, run = 0;
          let sum = 0;
          for (let x = xa; x <= xb; x++) {
            const v = lum[y*w+x];
            sum += v;
            if (v <= darkCut) {
              dark++; run++;
              if (run > bestRun) bestRun = run;
            } else run = 0;
          }
          const span = xb-xa+1;
          const darkFrac = dark/span;
          const runFrac = bestRun/span;
          if (darkFrac < minDarkFrac || runFrac < minRunFrac) continue;

          let above=0, below=0;
          for (let x=xa; x<=xb; x++) {
            above += lum[(y-1)*w+x];
            below += lum[(y+1)*w+x];
          }
          above/=span; below/=span;
          const isolated = Math.min(above, below);
          if (isolated < lightCut) continue;

          let a=y, b=y;
          while (a>1 && b-a<5 && this._blackRowScore(lum,w,a-1,xa,xb,darkCut)>=minDarkFrac) a--;
          while (b<h-2 && b-a<5 && this._blackRowScore(lum,w,b+1,xa,xb,darkCut)>=minDarkFrac) b++;

          const quality =
            1.55 +
            Math.min(1, darkFrac)*0.85 +
            Math.min(1, runFrac)*0.90 +
            Math.min(1, (isolated-55)/150)*0.80;

          out.push({
            pos:(a+b)/2, width:b-a+1, quality,
            gutterQuality:0, thickness:b-a+1,
            span:[xa,xb], axis, blackFrame:true,
            darkFrac, runFrac, neighborLight:isolated
          });
        }
      } else {
        const half = Math.max(12, Math.round(h * frac / 2));
        const ya = Math.max(2, Math.round(ty) - half);
        const yb = Math.min(h - 3, Math.round(ty) + half);
        if (yb <= ya) continue;

        for (let x = 2; x < w - 2; x++) {
          if (Math.abs(x - tx) < Math.max(4, Math.round(w * 0.02))) continue;

          let dark=0, bestRun=0, run=0, sum=0;
          for (let y=ya; y<=yb; y++) {
            const v=lum[y*w+x]; sum+=v;
            if (v<=darkCut) { dark++; run++; if(run>bestRun) bestRun=run; }
            else run=0;
          }
          const span=yb-ya+1;
          const darkFrac=dark/span, runFrac=bestRun/span;
          if(darkFrac<minDarkFrac || runFrac<minRunFrac) continue;

          let left=0,right=0;
          for(let y=ya;y<=yb;y++){
            left+=lum[y*w+x-1]; right+=lum[y*w+x+1];
          }
          left/=span; right/=span;
          const isolated=Math.min(left,right);
          if(isolated<lightCut) continue;

          let a=x,b=x;
          while(a>1 && b-a<5 && this._blackColScore(lum,w,a-1,ya,yb,darkCut)>=minDarkFrac) a--;
          while(b<w-2 && b-a<5 && this._blackColScore(lum,w,b+1,ya,yb,darkCut)>=minDarkFrac) b++;

          const quality =
            1.55 +
            Math.min(1,darkFrac)*0.85 +
            Math.min(1,runFrac)*0.90 +
            Math.min(1,(isolated-55)/150)*0.80;

          out.push({
            pos:(a+b)/2, width:b-a+1, quality,
            gutterQuality:0, thickness:b-a+1,
            span:[ya,yb], axis, blackFrame:true,
            darkFrac, runFrac, neighborLight:isolated
          });
        }
      }
    }

    // Collapse repeated detections from overlapping scan spans.
    const ranked = this._v98RankBoundaryCandidates(
      out,
      axis === "H" ? tx : ty,
      total
    );
    ranked.sort((a,b)=>a.pos-b.pos || b.quality-a.quality);
    const merged=[];
    const mergeDist=Math.max(3,Math.round(total*0.012));
    for(const c of out){
      const last=merged[merged.length-1];
      if(last && Math.abs(last.pos-c.pos)<=mergeDist){
        if(c.quality>last.quality) merged[merged.length-1]=c;
      } else merged.push(c);
    }
    return merged.slice(0,24);
  },

  _blackRowScore(lum,w,y,xa,xb,cut){
    let n=0, span=Math.max(1,xb-xa+1);
    for(let x=xa;x<=xb;x++) if(lum[y*w+x]<=cut) n++;
    return n/span;
  },

  _blackColScore(lum,w,x,ya,yb,cut){
    let n=0, span=Math.max(1,yb-ya+1);
    for(let y=ya;y<=yb;y++) if(lum[y*w+x]<=cut) n++;
    return n/span;
  },

  _confirmBlackWithGrey(black, grey, axis, w, h) {
    if(!black.length || !grey.length) return;
    const tolerance=Math.max(5, Math.round((axis==="H"?h:w)*0.025));

    for(const b of black){
      let best=null;
      for(const g of grey){
        if(Math.abs(g.pos-b.pos)>tolerance) continue;

        // Prefer grey evidence whose span overlaps most of the black frame.
        const bs=b.span||[0,axis==="H"?w-1:h-1];
        const gs=g.span||[0,axis==="H"?w-1:h-1];
        const overlap=Math.max(0,Math.min(bs[1],gs[1])-Math.max(bs[0],gs[0])+1);
        const union=Math.max(bs[1],gs[1])-Math.min(bs[0],gs[0])+1;
        const overlapFrac=overlap/Math.max(1,union);

        const score=(g.quality||0)+overlapFrac;
        if(!best || score>best.score) best={g,score,overlapFrac};
      }

      if(best){
        b.greyConfirmed=true;
        b.greyConfirmationScore=Math.min(1,best.overlapFrac);
        // Confirmation is a meaningful bonus, but black remains primary.
        b.quality += 0.70 + 0.55*b.greyConfirmationScore;
      }
    }
  },

  _findHorizontalBoundaries(lum, w, h, tx, ty, edgeCut, quietCut) {
    const candidates = [];
    // Evaluate several horizontal support spans centered on the tap. A real
    // gutter can stop at a panel corner, so full-page coverage is not required.
    const spans = [0.22, 0.34, 0.48, 0.66];
    for (const frac of spans) {
      const half = Math.max(8, Math.round(w * frac / 2));
      const xa = Math.max(1, Math.round(tx) - half);
      const xb = Math.min(w - 2, Math.round(tx) + half);
      const width = Math.max(1, xb-xa+1);
      const prof = new Float32Array(h);
      for (let y=1;y<h-1;y++) {
        let sum=0, quiet=0;
        for (let x=xa;x<=xb;x++) {
          const g=Math.abs(lum[y*w+x]-lum[(y-1)*w+x]) + Math.abs(lum[(y+1)*w+x]-lum[y*w+x]);
          sum += g;
          if (g <= quietCut) quiet++;
        }
        prof[y] = sum / width;
        prof[y] += (1 - quiet/width) * edgeCut * 0.35;
      }
      this._collectBoundaryCandidates(prof, h, edgeCut, quietCut, xa, xb, candidates, "H");
    }
    return dedupeBoundaryCandidates(candidates, Math.max(2, Math.round(h*0.012)), 12);
  },

  _findVerticalBoundaries(lum, w, h, tx, ty, edgeCut, quietCut) {
    const candidates = [];
    const spans = [0.22, 0.34, 0.48, 0.66];
    for (const frac of spans) {
      const half = Math.max(8, Math.round(h * frac / 2));
      const ya = Math.max(1, Math.round(ty) - half);
      const yb = Math.min(h - 2, Math.round(ty) + half);
      const height = Math.max(1, yb-ya+1);
      const prof = new Float32Array(w);
      for (let x=1;x<w-1;x++) {
        let sum=0, quiet=0;
        for (let y=ya;y<=yb;y++) {
          const g=Math.abs(lum[y*w+x]-lum[y*w+x-1]) + Math.abs(lum[y*w+x+1]-lum[y*w+x]);
          sum += g;
          if (g <= quietCut) quiet++;
        }
        prof[x] = sum / height;
        prof[x] += (1 - quiet/height) * edgeCut * 0.35;
      }
      this._collectBoundaryCandidates(prof, w, edgeCut, quietCut, ya, yb, candidates, "V");
    }
    return dedupeBoundaryCandidates(candidates, Math.max(2, Math.round(w*0.012)), 12);
  },

  _collectBoundaryCandidates(profile, total, edgeCut, quietCut, spanA, spanB, out, axis) {
    for (let i=2;i<total-2;i++) {
      if (profile[i] > quietCut) continue;
      // A gutter is a quiet corridor with edge support immediately outside it.
      let a=i, b=i;
      const maxRun=Math.max(2,Math.round(total*0.014));
      while (a>1 && profile[a-1] <= quietCut && i-a < maxRun) a--;
      while (b<total-2 && profile[b+1] <= quietCut && b-i < maxRun) b++;
      const before=profile[Math.max(1,a-1)];
      const after=profile[Math.min(total-2,b+1)];
      const support=(Math.max(0,before)+Math.max(0,after))/2;
      const quietFrac=Math.max(0, Math.min(1, 1 - profile[i]/Math.max(1,quietCut)));
      if (support < edgeCut*0.78) continue;
      const pos=(a+b)/2;
      const quality=Math.min(3, support/Math.max(1,edgeCut)) * (0.65 + quietFrac*0.35);
      const span=[spanA,spanB];
      out.push({pos, width:b-a+1, quality, span, axis});
      i=b;
    }
  },

  // A row-then-column scan can leave a nested panel group intact: after a
  // vertical split, horizontal gutters may span that child but not its parent.
  // Refine only already-detected rectangles, requiring the same full-span
  // quiet corridor as the baseline plus textured artwork on both sides.
  _splitInternalGutters(data, w, h, panels, log) {
    const lum = new Float32Array(w * h);
    for (let p = 0; p < lum.length; p++) {
      const i = p * 4;
      lum[p] = .299 * data[i] + .587 * data[i + 1] + .114 * data[i + 2];
    }
    let splitCount = 0;
    const split = (rect, depth) => {
      if (depth > 5) return [rect];
      const [x0, y0, x1, y1] = rect;
      const width = x1 - x0, height = y1 - y0;
      let best = null;
      for (const axis of ['H', 'V']) {
        const total = axis === 'H' ? height : width;
        const span = axis === 'H' ? width : height;
        if (span < 30) continue;
        const profile = new Float32Array(total);
        for (let p = 0; p < total; p++) {
          let sum = 0, square = 0;
          // Do not trim the endpoints or tolerate holes: that can turn long
          // artwork strokes into false separators on a dark page.
          for (let v = 0; v < span; v++) {
            const value = axis === 'H'
              ? lum[(y0 + p) * w + x0 + v]
              : lum[(y0 + v) * w + x0 + p];
            sum += value;
            square += value * value;
          }
          profile[p] = Math.sqrt(Math.max(0, square / span - (sum / span) ** 2));
        }
        const minRun = Math.max(2, Math.round((axis === 'H' ? h : w) * .006));
        for (let p = 0; p < total; p++) {
          if (profile[p] >= 10) continue;
          const start = p;
          while (p < total && profile[p] < 10) p++;
          const end = p;
          if (end - start < minRun || start < total * .12 || total - end < total * .12) continue;
          let before = 0, after = 0;
          for (let i = Math.max(0, start - 5); i < start; i++) before = Math.max(before, profile[i]);
          for (let i = end; i < Math.min(total, end + 5); i++) after = Math.max(after, profile[i]);
          if (before < 20 || after < 20) continue;
          const first = axis === 'H' ? [x0, y0, x1, y0 + start] : [x0, y0, x0 + start, y1];
          const second = axis === 'H' ? [x0, y0 + end, x1, y1] : [x0 + end, y0, x1, y1];
          if ([first, second].some(child => {
            const cw = child[2] - child[0], ch = child[3] - child[1];
            return cw < w * .05 || ch < h * .05 || cw * ch < w * h * .012;
          })) continue;
          const score = (end - start) * Math.min(before, after);
          if (!best || score > best.score) best = { first, second, score };
        }
      }
      if (!best) return [rect];
      splitCount++;
      return [...split(best.first, depth + 1), ...split(best.second, depth + 1)];
    };
    const refined = panels.flatMap(panel => {
      const rect = [Math.round(panel.x * w), Math.round(panel.y * h),
        Math.round((panel.x + panel.w) * w), Math.round((panel.y + panel.h) * h)];
      const children = split(rect, 0);
      // Preserve the original object and exact coordinates when no internal
      // separation is proven; this pass cannot expand any baseline crop.
      if (children.length === 1) return [panel];
      return children.map(child => ({ ...panel, x: child[0] / w, y: child[1] / h,
        w: (child[2] - child[0]) / w, h: (child[3] - child[1]) / h }));
    });
    if (log && splitCount) log(`internal-gutter refinement: ${panels.length} -> ${refined.length} panels (${splitCount} proven splits)`);
    return refined;
  },

  _analyze(img, log) {
    const maxDim = 900;
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));
    if (log) log(`source=${img.width}x${img.height} downscaled=${w}x${h}`);
    const canvas=document.createElement("canvas"); canvas.width=w; canvas.height=h;
    const ctx=canvas.getContext("2d",{willReadFrequently:true}); ctx.drawImage(img,0,0,w,h);
    const data=ctx.getImageData(0,0,w,h).data;
    const lumAt=(x,y)=>{const i=(y*w+x)*4; return .299*data[i]+.587*data[i+1]+.114*data[i+2];};
    const rowStd=new Array(h);
    for(let y=0;y<h;y++){let sum=0,sumSq=0;for(let x=0;x<w;x++){const l=lumAt(x,y);sum+=l;sumSq+=l*l;}const mean=sum/w;rowStd[y]=Math.sqrt(Math.max(0,sumSq/w-mean*mean));}
    if(log){const min=Math.min(...rowStd),max=Math.max(...rowStd),flat=rowStd.filter(v=>v<10).length;log(`row-stddev min=${min.toFixed(1)} max=${max.toFixed(1)} flat-rows(<10)=${flat}/${h}`);}
    const thresh=10, minRow=Math.max(2,Math.round(h*.006)), minCol=Math.max(2,Math.round(w*.006));
    const strips=splitByGutter(rowStd,h,thresh,minRow); if(log)log(`row-split found ${strips.length} strip(s): ${JSON.stringify(strips)}`);
    const panels=[];
    for(const [sy,ey] of strips){const stripH=ey-sy;if(stripH<h*.05)continue;const colStd=new Array(w);for(let x=0;x<w;x++){let sum=0,sumSq=0;for(let y=sy;y<ey;y++){const l=lumAt(x,y);sum+=l;sumSq+=l*l;}const mean=sum/stripH;colStd[x]=Math.sqrt(Math.max(0,sumSq/stripH-mean*mean));}const cols=splitByGutter(colStd,w,thresh,minCol);for(const [sx,ex] of cols){const pw=ex-sx;if(pw<w*.05)continue;panels.push({x:sx/w,y:sy/h,w:pw/w,h:stripH/h});}}
    if(log)log(`raw panel count before collapse-check: ${panels.length}`);
    if(panels.length<=1){if(log)log("-> collapsed to 0 (<=1 panel found)");return [];}
    return this._splitInternalGutters(data,w,h,panels,log);
  }
};

function intervalCoverage(span, lo, hi){
  if (!span || span.length < 2) return 0;
  const a = Math.min(span[0], span[1]);
  const b = Math.max(span[0], span[1]);
  const overlap = Math.max(0, Math.min(b, hi) - Math.max(a, lo) + 1);
  return overlap;
}
function boundarySpanOverlap(a,b,total){
  if(a.edge || b.edge) return Math.max(0,total-1);
  const lo=Math.max(a.span[0],b.span[0]), hi=Math.min(a.span[1],b.span[1]);
  return Math.max(0,hi-lo+1);
}
function dedupeBoundaryCandidates(list,posTol,maxKeep){
  list.sort((a,b)=>b.quality-a.quality);
  const out=[];
  for(const c of list){
    if(out.some(o=>Math.abs(o.pos-c.pos)<=posTol)) continue;
    out.push(c); if(out.length>=maxKeep) break;
  }
  return out.sort((a,b)=>a.pos-b.pos);
}
function splitByGutter(arr,total,thresh,minGutterRun){
  const spans=[];
  let contentStart=0,inG=false,gStart=0;
  for(let i=0;i<total;i++){
    if(arr[i]<thresh){
      if(!inG){inG=true;gStart=i;}
    }else if(inG){
      const run=i-gStart;
      inG=false;
      if(run>=minGutterRun){
        if(gStart>contentStart)spans.push([contentStart,gStart]);
        contentStart=i;
      }
    }
  }
  // A trailing gutter has no following content sample to close its run.
  // Apply the same minimum-run rule as an interior gutter instead of adding
  // the quiet right/bottom page margin to the final panel. Short quiet runs
  // remain content, and an entirely quiet profile has no content span.
  const contentEnd=inG&&total-gStart>=minGutterRun?gStart:total;
  if(contentEnd>contentStart)spans.push([contentStart,contentEnd]);
  return spans;
}
function clamp01(v){return Math.min(1,Math.max(0,Number(v)||0));}
window.PanelDetect=PanelDetect;
