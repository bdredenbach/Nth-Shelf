// panels.js — Border-Grid Panel Detection
// V64 COORDINATE TRUTH COMPATIBLE + V63 PERFORMANCE-SAFE GRADIENT LAB: tap-centered boundary experiment.
//
// Detects comic panel frames by finding black border lines and their
// intersections, then building a rectangle grid from corner points.
// Robust to colored/varied panel backgrounds and speech bubbles.

const PanelDetect = {
  detect(imgUrl, log) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        try {
          resolve(this._analyze(img, log));
        } catch (err) {
          console.warn("Panel detection failed:", err);
          if (log) log(`ERROR: ${err.message}`);
          resolve([]);
        }
      };
      img.onerror = () => resolve([]);
      img.src = imgUrl;
    });
  },

  // ================================================================
  // V64 uses this V63 boundary engine only after reader.js verifies the
  // exact visible image and tap-to-source coordinate. Parent/child/grandchild
  // panel selection remains intentionally excluded from the experiment.
  // V63 PERFORMANCE-SAFE GRADIENT LAB
  // ================================================================
  // A one-off, tap-centered frame finder. This deliberately ignores every
  // currentPanels rectangle, including parents, children, and grandchildren.
  // It asks the image itself where the visual boundary is.
  //
  // The lab uses several independent measurements and several search passes:
  //   1. luminance edge change
  //   2. RGB color-distance change
  //   3. dark/light line evidence
  //   4. persistence of the change along a parallel strip
  //   5. multiple strip lengths
  //   6. multiple pixel baselines
  //   7. four-side rectangle/corner consistency
  //   8. progressively relaxed thresholds
  //
  // The goal is not to find the biggest or smallest detected rectangle. The
  // goal is to find four boundaries that surround the exact tap and agree as
  // a geometric frame. It is intentionally allowed to be more expensive than
  // the normal detector.
  exhaustiveTapGradient(img, relX, relY, log) {
    const started = performance.now();
    // V65: nearest-first sustained-boundary experiment. This intentionally
    // ignores all detected panel/parent/child/grandchild rectangles.
    if (!img || !(img.naturalWidth || img.width) || !(img.naturalHeight || img.height)) return null;
    const srcW = img.naturalWidth || img.width, srcH = img.naturalHeight || img.height;
    const scale = Math.min(1, 1100 / Math.max(srcW, srcH));
    const w = Math.max(2, Math.round(srcW * scale)), h = Math.max(2, Math.round(srcH * scale));
    const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d', {willReadFrequently:true}); if (!ctx) return null;
    ctx.drawImage(img, 0, 0, w, h);
    let data; try { data = ctx.getImageData(0,0,w,h).data; } catch(e) { if(log) log(`[V65] IMAGE READ ERROR ${e?.message||e}`); return null; }
    const n=w*h, lum=new Float32Array(n), chr=new Float32Array(n), rr=new Uint8Array(n), gg=new Uint8Array(n), bb=new Uint8Array(n);
    for(let i=0,p=0;i<n;i++,p+=4){const r=data[p],g=data[p+1],b=data[p+2];rr[i]=r;gg[i]=g;bb[i]=b;lum[i]=.299*r+.587*g+.114*b;chr[i]=Math.max(r,g,b)-Math.min(r,g,b);}
    const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)), at=(x,y)=>y*w+x;
    const px=clamp(Math.round(relX*(w-1)),1,w-2), py=clamp(Math.round(relY*(h-1)),1,h-2);
    if(log){log(`[V65] TAP x=${relX.toFixed(4)} y=${relY.toFixed(4)} px=${px} py=${py}`);log('[V65] CHILD/PARENT/GRANDCHILD DETECTION DISABLED');log(`[V65] IMAGE ${w}x${h}`);}

    function evidence(axis, coord, span, relax){
      const half=Math.max(6,Math.round(span/2)), samples=19; let rgb=0,ld=0,cd=0,edge=0,stable=0;
      for(let i=0;i<samples;i++){
        const t=(i+.5)/samples;
        if(axis==='h'){
          const x=clamp(Math.round(px-half+t*2*half),2,w-3), y=clamp(coord,10,h-11);
          const c=at(x,y), a=at(x,y-4), b=at(x,y+4), aa=at(x,y-9), bbx=at(x,y+9);
          const dr=rr[a]-rr[b],dg=gg[a]-gg[b],db=bb[a]-bb[b]; rgb+=Math.sqrt(dr*dr+dg*dg+db*db)/441.673; ld+=Math.abs(lum[a]-lum[b])/255; cd+=Math.abs(chr[a]-chr[b])/255; edge+=Math.min(1,Math.abs(lum[c]-(lum[aa]+lum[bbx])/2)/80); stable+=Math.min(1,Math.abs(lum[aa]-lum[bbx])/255);
        } else {
          const y=clamp(Math.round(py-half+t*2*half),2,h-3), x=clamp(coord,10,w-11);
          const c=at(x,y), a=at(x-4,y), b=at(x+4,y), aa=at(x-9,y), bbx=at(x+9,y);
          const dr=rr[a]-rr[b],dg=gg[a]-gg[b],db=bb[a]-bb[b]; rgb+=Math.sqrt(dr*dr+dg*dg+db*db)/441.673; ld+=Math.abs(lum[a]-lum[b])/255; cd+=Math.abs(chr[a]-chr[b])/255; edge+=Math.min(1,Math.abs(lum[c]-(lum[aa]+lum[bbx])/2)/80); stable+=Math.min(1,Math.abs(lum[aa]-lum[bbx])/255);
        }
      }
      rgb/=samples;ld/=samples;cd/=samples;edge/=samples;stable/=samples;
      const score=.34*rgb+.25*ld+.11*cd+.16*edge+.14*stable;
      const support=(rgb>=.07? .30:0)+(ld>=.05?.22:0)+(cd>=.03?.10:0)+(edge>=.045?.16:0)+(stable>=.07?.22:0);
      const threshold=.115-relax*.018;
      return {score,support,rgb,lum:ld,chroma:cd,edge,stable,convincing:score>=threshold&&support>=(.62-relax*.08)};
    }

    const dirs=[
      {name:'TOP',axis:'h',sign:-1,limit:Math.round(h*.46)}, {name:'BOTTOM',axis:'h',sign:1,limit:Math.round(h*.46)},
      {name:'LEFT',axis:'v',sign:-1,limit:Math.round(w*.46)}, {name:'RIGHT',axis:'v',sign:1,limit:Math.round(w*.46)}
    ];
    function findNearest(d){
      const step=Math.max(3,Math.round(Math.min(w,h)/190));
      const spans=d.axis==='h'?[Math.max(28,Math.round(w*.14)),Math.max(42,Math.round(w*.30)),Math.max(56,Math.round(w*.54))]:[Math.max(28,Math.round(h*.14)),Math.max(42,Math.round(h*.30)),Math.max(56,Math.round(h*.54))];
      for(let relax=0;relax<3;relax++){
        let streak=0, first=null, best=null;
        for(let dist=step;dist<=d.limit;dist+=step){
          const coord=d.axis==='h'?py+d.sign*dist:px+d.sign*dist;
          if(d.axis==='h'?(coord<10||coord>h-11):(coord<10||coord>w-11)) break;
          let evBest=null;
          for(const span of spans){const ev=evidence(d.axis,coord,span,relax);if(!evBest||ev.score+ev.support*.12>evBest.score+evBest.support*.12)evBest=ev;}
          if(evBest&&evBest.convincing){if(!streak)first=dist;streak++;if(!best||evBest.score>best.score)best={...evBest,coord,distance:dist};}
          else {if(streak>=2&&best)return {...best,zoneStart:first,zoneEnd:dist-step,relax};streak=0;first=null;best=null;}
        }
        if(streak>=2&&best)return {...best,zoneStart:first,zoneEnd:d.limit,relax};
      }
      return null;
    }
    const found={};
    for(const d of dirs){found[d.name]=findNearest(d);if(log)log(`[V65] ${d.name} nearest=${found[d.name]?`${Math.round(found[d.name].coord)}:${found[d.name].score.toFixed(2)}:p${found[d.name].support.toFixed(2)}:r${found[d.name].relax}`:'NONE'}`);}
    if(!found.TOP||!found.BOTTOM||!found.LEFT||!found.RIGHT){if(log)log('[V65] INSUFFICIENT NEAREST BOUNDARIES -> no frame');return null;}

    function corner(x,y){let s=0,c=0;for(let dy=-6;dy<=6;dy+=2)for(let dx=-6;dx<=6;dx+=2){const xx=clamp(x+dx,1,w-2),yy=clamp(y+dy,1,h-2);const gx=Math.abs(lum[at(xx+1,yy)]-lum[at(xx-1,yy)])/255,gy=Math.abs(lum[at(xx,yy+1)]-lum[at(xx,yy-1)])/255;s+=Math.min(1,gx+gy);c++;}return c?s/c:0;}
    const t=found.TOP,b=found.BOTTOM,l=found.LEFT,r=found.RIGHT;
    if(!(l.coord<px&&r.coord>px&&t.coord<py&&b.coord>py)) {if(log)log('[V65] BOUNDARIES DO NOT ENCLOSE TAP');return null;}
    const width=r.coord-l.coord,height=b.coord-t.coord;
    if(width<Math.max(28,w*.045)||height<Math.max(28,h*.045)||width>w*.96||height>h*.96)return null;
    const side=(t.score+b.score+l.score+r.score)/4, support=(t.support+b.support+l.support+r.support)/4;
    const near=1-clamp(((t.distance+b.distance)/2/h+(l.distance+r.distance)/2/w)/.46,0,1);
    const corners=(corner(l.coord,t.coord)+corner(r.coord,t.coord)+corner(l.coord,b.coord)+corner(r.coord,b.coord))/4;
    const area=(width*height)/(w*h);
    const score=.48*near+.25*support+.17*side+.10*corners-.05*Math.sqrt(area);
    const panel={x:l.coord/w,y:t.coord/h,w:width/w,h:height/h,__v65Method:'first-sustained-boundary',__v65Score:score,__v65Evidence:{top:t,bottom:b,left:l,right:r,near,support,side,corners,area}};
    if(log){log(`[V65] CLOSED REGION T=${Math.round(t.coord)} B=${Math.round(b.coord)} L=${Math.round(l.coord)} R=${Math.round(r.coord)}`);log(`[V65] SCORE=${score.toFixed(3)} proximity=${near.toFixed(3)} persistence=${support.toFixed(3)} side=${side.toFixed(3)} corner=${corners.toFixed(3)}`);log(`[V65] FINAL x=${panel.x.toFixed(4)} y=${panel.y.toFixed(4)} w=${panel.w.toFixed(4)} h=${panel.h.toFixed(4)} method=${panel.__v65Method}`);log(`[V65] ELAPSED ${Math.round(performance.now()-started)}ms`);}
    return panel;
  },

  reconstructAt(img, relX, relY, log, seedPanels = null) {
    try {
      if (!img || !img.naturalWidth || !img.naturalHeight) return null;

      const maxDim = 1600;
      const scale = Math.min(
        1,
        maxDim / Math.max(img.naturalWidth, img.naturalHeight)
      );
      const w = Math.max(1, Math.round(img.naturalWidth * scale));
      const h = Math.max(1, Math.round(img.naturalHeight * scale));

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return null;
      ctx.drawImage(img, 0, 0, w, h);

      const imageData = ctx.getImageData(0, 0, w, h);
      const data = imageData.data;
      const lum = new Float32Array(w * h);

      for (let i = 0; i < data.length; i += 4) {
        lum[i / 4] =
          0.299 * data[i] +
          0.587 * data[i + 1] +
          0.114 * data[i + 2];
      }

      const px = Math.max(
        0,
        Math.min(w - 1, Math.round(relX * (w - 1)))
      );
      const py = Math.max(
        0,
        Math.min(h - 1, Math.round(relY * (h - 1)))
      );

      const seeds = Array.isArray(seedPanels)
        ? seedPanels
            .map((panel, index) => ({ panel, index }))
            .filter(({ panel }) =>
              relX >= panel.x &&
              relX <= panel.x + panel.w &&
              relY >= panel.y &&
              relY <= panel.y + panel.h
            )
            .sort((a, b) =>
              (b.panel.w * b.panel.h) - (a.panel.w * a.panel.h)
            )
        : [];

      if (log) {
        log(
          `[V59] IMAGE ${w}x${h} TAP ${px},${py} hits=${seeds.length}`
        );
        if (seeds.length) {
          log(
            `[V59] SEEDS ` +
            seeds.map(({ panel, index }) =>
              `#${index}(${Number(panel.x.toFixed(4))},${Number(panel.y.toFixed(4))},` +
              `${Number(panel.w.toFixed(4))},${Number(panel.h.toFixed(4))})`
            ).join(" | ")
          );
        }
      }

      // The largest containing candidate supplies the initial search envelope.
      // It is not itself the zoom target.
      const seed = seeds.length ? seeds[0].panel : null;
      if (!seed) {
        if (log) log(`[V59] NO SEED -> reconstruction unavailable`);
        return null;
      }

      const seedX0 = Math.max(0, Math.round(seed.x * w));
      const seedY0 = Math.max(0, Math.round(seed.y * h));
      const seedX1 = Math.min(w - 1, Math.round((seed.x + seed.w) * w));
      const seedY1 = Math.min(h - 1, Math.round((seed.y + seed.h) * h));

      // Search modestly beyond the seed so a seed that is a little too tight
      // does not prevent the local boundary from being found.
      const marginX = Math.max(12, Math.round(w * 0.045));
      const marginY = Math.max(12, Math.round(h * 0.045));
      const minX = Math.max(1, seedX0 - marginX);
      const maxX = Math.min(w - 2, seedX1 + marginX);
      const minY = Math.max(1, seedY0 - marginY);
      const maxY = Math.min(h - 2, seedY1 + marginY);

      // We sample a strip parallel to the suspected boundary. The strip is
      // centered on the tap rather than the entire seed, because a local tap
      // should tell us what boundary belongs to that point.
      const stripHalf = 0.30;
      const sampleCount = 41;
      const stepX = Math.max(1, Math.round(w / 500));
      const stepY = Math.max(1, Math.round(h / 500));

      function horizontalTransition(y) {
        const yy = Math.max(2, Math.min(h - 3, y));
        const span = Math.max(20, Math.round((seedX1 - seedX0) * stripHalf));
        const x0 = Math.max(2, px - Math.round(span / 2));
        const x1 = Math.min(w - 3, px + Math.round(span / 2));

        let total = 0;
        let strong = 0;
        let veryStrong = 0;
        let count = 0;

        for (let i = 0; i < sampleCount; i++) {
          const x = Math.round(
            x0 + ((x1 - x0) * (i + 0.5)) / sampleCount
          );

          const before = lum[(yy - 4) * w + x];
          const after = lum[(yy + 4) * w + x];
          const d = Math.abs(after - before);

          total += d;
          if (d >= 14) strong++;
          if (d >= 24) veryStrong++;
          count++;
        }

        return {
          score: count ? total / count : 0,
          support: count ? strong / count : 0,
          veryStrong: count ? veryStrong / count : 0
        };
      }

      function verticalTransition(x) {
        const xx = Math.max(2, Math.min(w - 3, x));
        const span = Math.max(20, Math.round((seedY1 - seedY0) * stripHalf));
        const y0 = Math.max(2, py - Math.round(span / 2));
        const y1 = Math.min(h - 3, py + Math.round(span / 2));

        let total = 0;
        let strong = 0;
        let veryStrong = 0;
        let count = 0;

        for (let i = 0; i < sampleCount; i++) {
          const y = Math.round(
            y0 + ((y1 - y0) * (i + 0.5)) / sampleCount
          );

          const before = lum[y * w + (xx - 4)];
          const after = lum[y * w + (xx + 4)];
          const d = Math.abs(after - before);

          total += d;
          if (d >= 14) strong++;
          if (d >= 24) veryStrong++;
          count++;
        }

        return {
          score: count ? total / count : 0,
          support: count ? strong / count : 0,
          veryStrong: count ? veryStrong / count : 0
        };
      }

      // V59's key rule:
      //
      // Do NOT search for the strongest transition. Search outward from the
      // tap and stop at the first transition that is strong enough AND is
      // supported across enough of the parallel strip.
      const MIN_SCORE = 12;
      const MIN_SUPPORT = 0.30;
      const MIN_VERY_STRONG = 0.10;

      function findHorizontal(direction) {
        const limit = direction < 0
          ? Math.max(0, py - minY)
          : Math.max(0, maxY - py);

        for (let d = 4; d <= limit; d += stepY) {
          const y = py + direction * d;
          const t = horizontalTransition(y);

          if (
            t.score >= MIN_SCORE &&
            t.support >= MIN_SUPPORT &&
            t.veryStrong >= MIN_VERY_STRONG
          ) {
            return {
              y,
              score: t.score,
              support: t.support,
              veryStrong: t.veryStrong,
              distance: d
            };
          }
        }

        return null;
      }

      function findVertical(direction) {
        const limit = direction < 0
          ? Math.max(0, px - minX)
          : Math.max(0, maxX - px);

        for (let d = 4; d <= limit; d += stepX) {
          const x = px + direction * d;
          const t = verticalTransition(x);

          if (
            t.score >= MIN_SCORE &&
            t.support >= MIN_SUPPORT &&
            t.veryStrong >= MIN_VERY_STRONG
          ) {
            return {
              x,
              score: t.score,
              support: t.support,
              veryStrong: t.veryStrong,
              distance: d
            };
          }
        }

        return null;
      }

      const top = findHorizontal(-1);
      const bottom = findHorizontal(1);
      const left = findVertical(-1);
      const right = findVertical(1);

      if (log) {
        const describe = (name, b, axis) =>
          log(
            `[V59] ${name} ${axis}=${b ? b[axis] : "-"} ` +
            `score=${b ? Number(b.score.toFixed(2)) : 0} ` +
            `support=${b ? Number(b.support.toFixed(2)) : 0} ` +
            `veryStrong=${b ? Number(b.veryStrong.toFixed(2)) : 0} ` +
            `distance=${b ? b.distance : 0}`
          );
        describe("TOP", top, "y");
        describe("BOTTOM", bottom, "y");
        describe("LEFT", left, "x");
        describe("RIGHT", right, "x");
      }

      const sides = [top, bottom, left, right].filter(Boolean).length;
      if (log) log(`[V59] SIDES FOUND=${sides}`);

      // V59 remains conservative about the first experiment: we only zoom a
      // reconstructed region if all four directions found a meaningful first
      // boundary. Otherwise the existing V57 selector gets the tap.
      if (!top || !bottom || !left || !right) {
        if (log) log(`[V59] NO 4-SIDED REGION -> fallback`);
        return null;
      }

      const x0 = Math.min(left.x, right.x);
      const x1 = Math.max(left.x, right.x);
      const y0 = Math.min(top.y, bottom.y);
      const y1 = Math.max(top.y, bottom.y);

      if (x1 <= x0 || y1 <= y0) {
        if (log) log(`[V59] INVALID RECONSTRUCTED GEOMETRY -> fallback`);
        return null;
      }

      const panel = {
        x: Math.max(0, Math.min(1, x0 / w)),
        y: Math.max(0, Math.min(1, y0 / h)),
        w: Math.max(0, Math.min(1, (x1 - x0) / w)),
        h: Math.max(0, Math.min(1, (y1 - y0) / h)),
        __v59Reconstructed: true,
        __v59Sides: sides
      };

      if (log) {
        log(
          `[V59] RECONSTRUCTED REGION ` +
          `x=${Number(panel.x.toFixed(4))} ` +
          `y=${Number(panel.y.toFixed(4))} ` +
          `w=${Number(panel.w.toFixed(4))} ` +
          `h=${Number(panel.h.toFixed(4))}`
        );
      }

      return panel;
    } catch (err) {
      if (log) log(`[V59] RECONSTRUCTION ERROR ${err?.message || err}`);
      return null;
    }
  },

  _analyze(img, log) {
    const maxDim = 1200;
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));
    if (log) log(`source=${img.width}x${img.height} downscaled=${w}x${h}`);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, w, h);
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;

    // Compute luminance
    const lum = new Float32Array(w * h);
    for (let i = 0; i < data.length; i += 4) {
      const idx = i / 4;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      lum[idx] = 0.299 * r + 0.587 * g + 0.114 * b;
    }

    // Run all detection strategies so we can compare their candidates.
    // Previously, a primary detector finding >1 panels prevented the other
    // strategies from contributing useful candidates.
    let panels = [];

    const borderPanels = detectByBorderGrid(w, h, lum, log);
    if (log) log(`border-grid found ${borderPanels.length} panel(s)`);
    panels.push(...borderPanels);

    // V26: region-first candidate generator. This does NOT replace the
    // existing detectors. It asks a different question: which areas of the
    // page are enclosed by persistent line-like barriers?
    const regionPanels = detectByRegions(w, h, lum, log);
    if (log) log(`region-first found ${regionPanels.length} panel(s)`);
    panels.push(...regionPanels);

    // V27: region hypotheses are cross-checked against perimeter evidence.
    // A region alone is not enough; a rectangle alone is not enough.
    const regionBorderPanels = detectRegionBorderVotes(
      regionPanels,
      w,
      h,
      lum,
      log
    );
    if (log) {
      log(
        `region-border voting found ${regionBorderPanels.length} panel(s)`
      );
    }
    panels.push(...regionBorderPanels);

    const shapePanels = detectByShapeAware(w, h, lum, log);
    if (log) log(`shape-aware found ${shapePanels.length} panel(s)`);
    panels.push(...shapePanels);

    const gutterPanels = detectByGutters(w, h, lum, log);
    if (log) log(`gutter-based found ${gutterPanels.length} panel(s)`);
    panels.push(...gutterPanels);

    // V31: recursively partition strong rectangular candidates using
    // persistent horizontal/vertical internal boundaries. This is deliberately
    // rectangular-only: no trapezoids or diagonal reconstruction.
    const partitionedPanels = recursiveRectangularPartition(
      panels,
      w,
      h,
      lum,
      log
    );
    if (log) {
      log(
        `V31 recursive partition added ${partitionedPanels.length} candidate(s)`
      );
    }
    panels.push(...partitionedPanels);

    // V30: discover sibling groups BEFORE the panelness tribunal can
    // discard or merge their evidence. Strong sibling candidates are marked
    // internally so a large parent/container cannot win simply because the
    // children were judged independently first.
    panels = protectEarlySiblingCandidates(
      panels,
      w,
      h,
      lum,
      log
    );

    // V28: every detector now reports candidates into one authoritative
    // "panelness tribunal". We no longer let each detector's candidate type
    // have a separate final standard. Geometry, interior coherence, and
    // composite-panel evidence are judged together here.
    panels = panelnessTribunal(
      panels,
      w,
      h,
      lum,
      log
    );

    // V29: use surviving candidates to infer panel hierarchy. When several
    // strong, spatially separated sibling panels live inside a larger
    // candidate footprint, treat the larger candidate as a container rather
    // than a panel. This attacks composite rectangles without simply
    // preferring every smaller rectangle.
    panels = applySiblingAwareHierarchy(
      panels,
      w,
      h,
      log
    );

    // V36: black-border rectangle recovery. V32 remains the primary detector;
    // this pass uses dark/black border evidence to recover rectangular frames
    // that V32 missed. It never builds a union from neighboring panels.
    panels = recoverBlackBorderRectangles(
      panels,
      w,
      h,
      lum,
      log
    );

    // ================================================================
    // V40 GLOBAL GUTTER GRID PASS — EXPLICITLY INSTRUMENTED
    // ================================================================
    if (log) {
      log(">>> V40 GLOBAL GUTTER PASS START <<<");
      log(`V40 input panels=${panels.length} image=${w}x${h}`);
    }

    const gutterRecovered = recoverGutterNegativeSpaceRectangles(
      panels,
      w,
      h,
      lum,
      log
    );

    if (log) {
      log(`V40 returned recovered=${gutterRecovered.length}`);
      log("<<< V40 GLOBAL GUTTER PASS END >>>");
    }

    panels.push(...gutterRecovered);

    // Preserve the known-good V32/V36 merge behavior. Near-duplicates are
    // deduplicated without ever unioning neighboring rectangles.
    panels = mergeOverlappingPanels(panels, 0.85);
    panels = sortPanelsByPosition(panels);

    // Remove the internal detector marker before exposing panel geometry to
    // the rest of the app.
    panels = panels.map(({ __localRectangle, __splitRectangle, __regionFirst, __regionBorderVote, __siblingProtected, __recursivePartition, __twoSidedProof, __partitionOrientation, __partitionStrength, __blackBorderRecovered, __blackBorderScore, __gutterNegativeSpace, ...panel }) => panel);

    if (log) log(`final panel count: ${panels.length}`);
    return panels;
  }
};

// PRIMARY: Detect panel frames by finding black border lines and intersections
function detectByBorderGrid(w, h, lum, log) {
  /*
   * V17 LOCAL RECTANGLE DETECTOR
   *
   * The old detector treated dark pixels across an entire page row/column as
   * borders and then created rectangles from unrelated intersections.
   *
   * This detector instead finds LOCAL dark line segments and only creates a
   * rectangle when four segments overlap geometrically.
   *
   * The goal is ordinary square/rectangular comic frames first.
   */

  const maxSegments = 180;
  const minSegmentX = Math.max(10, Math.round(w * 0.06));
  const minSegmentY = Math.max(10, Math.round(h * 0.04));

  const darkThresh = 82;
  const lineTolerance = Math.max(2, Math.round(Math.min(w, h) * 0.004));

  function rowSegments(y) {
    const runs = [];
    let startX = -1;

    for (let x = 1; x < w - 1; x++) {
      const dark =
        lum[y * w + x] <= darkThresh ||
        lum[(y - 1) * w + x] <= darkThresh ||
        lum[(y + 1) * w + x] <= darkThresh;

      if (dark) {
        if (startX < 0) startX = x;
      } else if (startX >= 0) {
        if (x - startX >= minSegmentX) {
          runs.push({
            x0: startX,
            x1: x - 1,
            y
          });
        }
        startX = -1;
      }
    }

    if (startX >= 0 && w - startX >= minSegmentX) {
      runs.push({ x0: startX, x1: w - 2, y });
    }

    return runs;
  }

  function colSegments(x) {
    const runs = [];
    let startY = -1;

    for (let y = 1; y < h - 1; y++) {
      const dark =
        lum[y * w + x] <= darkThresh ||
        lum[y * w + x - 1] <= darkThresh ||
        lum[y * w + x + 1] <= darkThresh;

      if (dark) {
        if (startY < 0) startY = y;
      } else if (startY >= 0) {
        if (y - startY >= minSegmentY) {
          runs.push({
            y0: startY,
            y1: y - 1,
            x
          });
        }
        startY = -1;
      }
    }

    if (startY >= 0 && h - startY >= minSegmentY) {
      runs.push({ y0: startY, y1: h - 2, x });
    }

    return runs;
  }

  // Sample rows/columns instead of scanning every coordinate. We then merge
  // nearby detections of the same local segment.
  const horizontal = [];
  const vertical = [];

  // V19: evenly distribute a fixed number of scan lines across the
  // ENTIRE page. Unlike V18, we do not scan every 2 pixels and then stop
  // when the segment-count ceiling is reached. Every part of the page gets
  // a chance to contribute border evidence.
  const targetRows = 300;
  const targetCols = 220;

  for (let i = 0; i < targetRows; i++) {
    const y = 2 + Math.round(
      i * (h - 4) / Math.max(1, targetRows - 1)
    );

    horizontal.push(...rowSegments(y));
  }

  for (let i = 0; i < targetCols; i++) {
    const x = 2 + Math.round(
      i * (w - 4) / Math.max(1, targetCols - 1)
    );

    vertical.push(...colSegments(x));
  }

  function clusterHorizontal(items) {
    const groups = [];

    for (const s of items) {
      const last = groups[groups.length - 1];

      if (
        last &&
        Math.abs(last.y - s.y) <= lineTolerance &&
        Math.min(last.x1, s.x1) - Math.max(last.x0, s.x0) >
          -lineTolerance
      ) {
        last.y = Math.round((last.y + s.y) / 2);
        last.x0 = Math.min(last.x0, s.x0);
        last.x1 = Math.max(last.x1, s.x1);
      } else {
        groups.push({ ...s });
      }
    }

    return groups;
  }

  function clusterVertical(items) {
    const groups = [];

    for (const s of items) {
      const last = groups[groups.length - 1];

      if (
        last &&
        Math.abs(last.x - s.x) <= lineTolerance &&
        Math.min(last.y1, s.y1) - Math.max(last.y0, s.y0) >
          -lineTolerance
      ) {
        last.x = Math.round((last.x + s.x) / 2);
        last.y0 = Math.min(last.y0, s.y0);
        last.y1 = Math.max(last.y1, s.y1);
      } else {
        groups.push({ ...s });
      }
    }

    return groups;
  }

  horizontal.sort((a, b) => a.y - b.y || a.x0 - b.x0);
  vertical.sort((a, b) => a.x - b.x || a.y0 - b.y0);

  const hs = clusterHorizontal(horizontal);
  const vs = clusterVertical(vertical);

  if (log) {
    log(
      `local-rectangle segments: H=${hs.length} V=${vs.length}`
    );
  }

  function horizontalSupports(hs1, hs2, left, right) {
    const overlap1 = Math.max(
      0,
      Math.min(hs1.x1, right) - Math.max(hs1.x0, left)
    );
    const overlap2 = Math.max(
      0,
      Math.min(hs2.x1, right) - Math.max(hs2.x0, left)
    );

    const width = Math.max(1, right - left);
    return Math.min(overlap1, overlap2) / width;
  }

  function verticalSupports(vs1, vs2, top, bottom) {
    const overlap1 = Math.max(
      0,
      Math.min(vs1.y1, bottom) - Math.max(vs1.y0, top)
    );
    const overlap2 = Math.max(
      0,
      Math.min(vs2.y1, bottom) - Math.max(vs2.y0, top)
    );

    const height = Math.max(1, bottom - top);
    return Math.min(overlap1, overlap2) / height;
  }

  const panels = [];

  // Only pair lines whose endpoints actually support the same rectangle.
  // This replaces the old "every H/V intersection makes a panel" behavior.
  for (let hi = 0; hi < hs.length; hi++) {
    const top = hs[hi];

    for (let hj = hi + 1; hj < hs.length; hj++) {
      const bottom = hs[hj];

      const height = bottom.y - top.y;
      if (height < minSegmentY || height > h * 0.92) continue;

      const left = Math.max(top.x0, bottom.x0);
      const right = Math.min(top.x1, bottom.x1);

      if (right - left < minSegmentX) continue;

      const hSupport =
        horizontalSupports(top, bottom, left, right);

      if (hSupport < 0.72) continue;

      // Search for left/right vertical segments that span the same vertical
      // interval and sit near the horizontal segment endpoints.
      let bestLeft = null;
      let bestRight = null;

      for (const v of vs) {
        if (v.x < left - lineTolerance ||
            v.x > right + lineTolerance) continue;

        if (v.y0 > top.y + lineTolerance ||
            v.y1 < bottom.y - lineTolerance) continue;

        const support =
          Math.min(v.y1, bottom.y) -
          Math.max(v.y0, top.y);

        if (support / height < 0.72) continue;

        const leftDist = Math.abs(v.x - left);
        const rightDist = Math.abs(v.x - right);

        if (
          leftDist <= Math.max(lineTolerance * 3, w * 0.025) &&
          (!bestLeft || leftDist < bestLeft.dist)
        ) {
          bestLeft = { v, dist: leftDist };
        }

        if (
          rightDist <= Math.max(lineTolerance * 3, w * 0.025) &&
          (!bestRight || rightDist < bestRight.dist)
        ) {
          bestRight = { v, dist: rightDist };
        }
      }

      if (!bestLeft || !bestRight) continue;

      const x0 = Math.min(bestLeft.v.x, bestRight.v.x);
      const x1 = Math.max(bestLeft.v.x, bestRight.v.x);

      if (x1 - x0 < minSegmentX) continue;

      panels.push({
        x: x0 / w,
        y: top.y / h,
        w: (x1 - x0) / w,
        h: (bottom.y - top.y) / h,
        __localRectangle: true
      });

      if (panels.length >= maxSegments) break;
    }

    if (panels.length >= maxSegments) break;
  }

  if (log) {
    log(`local-rectangle found ${panels.length} raw candidate(s)`);
  }

  // V24: before ranking, try to repair an oversized rectangle by finding a
  // strong internal boundary and splitting it into two real candidates.
  // This is intentionally limited to ordinary rectangular geometry.
  const splitPanels = splitCompositeRectangles(
    panels,
    w,
    h,
    lum,
    log
  );

  return rankAndFilterRectangleCandidates(
    splitPanels,
    w,
    h,
    lum,
    log
  );
}

function splitCompositeRectangles(panels, w, h, lum, log) {
  if (!panels.length) return [];

  const result = [];

  for (const panel of panels) {
    const x0 = Math.max(1, Math.round(panel.x * w));
    const y0 = Math.max(1, Math.round(panel.y * h));
    const x1 = Math.min(w - 2, Math.round((panel.x + panel.w) * w));
    const y1 = Math.min(h - 2, Math.round((panel.y + panel.h) * h));

    const width = x1 - x0;
    const height = y1 - y0;

    if (width < 40 || height < 40) {
      result.push(panel);
      continue;
    }

    const split = findStrongInternalBoundary(
      x0, y0, x1, y1, w, h, lum
    );

    if (!split) {
      result.push(panel);
      continue;
    }

    if (split.orientation === "vertical") {
      const leftWidth = split.position - x0;
      const rightWidth = x1 - split.position;

      if (leftWidth < width * 0.22 || rightWidth < width * 0.22) {
        result.push(panel);
        continue;
      }

      result.push(
        {
          x: x0 / w,
          y: y0 / h,
          w: (split.position - x0) / w,
          h: (y1 - y0) / h,
          __localRectangle: true,
          __splitRectangle: true
        },
        {
          x: split.position / w,
          y: y0 / h,
          w: (x1 - split.position) / w,
          h: (y1 - y0) / h,
          __localRectangle: true,
          __splitRectangle: true
        }
      );

      if (log) {
        log(
          `V24 split vertical composite at ${split.position}: ` +
          `${width}x${height}`
        );
      }
    } else {
      const topHeight = split.position - y0;
      const bottomHeight = y1 - split.position;

      if (topHeight < height * 0.22 || bottomHeight < height * 0.22) {
        result.push(panel);
        continue;
      }

      result.push(
        {
          x: x0 / w,
          y: y0 / h,
          w: (x1 - x0) / w,
          h: (split.position - y0) / h,
          __localRectangle: true,
          __splitRectangle: true
        },
        {
          x: x0 / w,
          y: split.position / h,
          w: (x1 - x0) / w,
          h: (y1 - split.position) / h,
          __localRectangle: true,
          __splitRectangle: true
        }
      );

      if (log) {
        log(
          `V24 split horizontal composite at ${split.position}: ` +
          `${width}x${height}`
        );
      }
    }
  }

  return result;
}

function findStrongInternalBoundary(x0, y0, x1, y1, w, h, lum) {
  const insetX = Math.max(6, Math.round((x1 - x0) * 0.10));
  const insetY = Math.max(6, Math.round((y1 - y0) * 0.10));

  const ix0 = x0 + insetX;
  const ix1 = x1 - insetX;
  const iy0 = y0 + insetY;
  const iy1 = y1 - insetY;

  if (ix1 <= ix0 || iy1 <= iy0) return null;

  const minWidth = Math.max(18, Math.round((x1 - x0) * 0.22));
  const minHeight = Math.max(18, Math.round((y1 - y0) * 0.22));

  function verticalEvidence(x) {
    const samples = 36;
    let boundaryHits = 0;
    let darkHits = 0;
    let contrastSum = 0;
    let persistence = 0;

    for (let i = 0; i < samples; i++) {
      const y = Math.round(
        iy0 + (iy1 - iy0) * (i + 0.5) / samples
      );

      const center = lum[y * w + x];
      const left = lum[y * w + Math.max(ix0, x - 4)];
      const right = lum[y * w + Math.min(ix1, x + 4)];

      const sideAverage = (left + right) / 2;
      const sideDifference =
        Math.abs(left - center) +
        Math.abs(right - center);

      // V25 accepts BOTH kinds of panel dividers:
      //   - a dark rule against lighter artwork
      //   - a bright gutter against darker artwork
      //
      // We also compare the center to BOTH sides. This catches the exact
      // black vertical divider visible in the V24 diagnostic.
      const darkRule =
        center <= 105 &&
        center + 28 < sideAverage;

      const lightGutter =
        center >= 175 &&
        center - 28 > sideAverage;

      if (darkRule || lightGutter || sideDifference >= 150) {
        boundaryHits++;
      }

      if (darkRule) darkHits++;

      contrastSum += Math.min(255, sideDifference);

      // A real divider tends to persist in approximately the same place.
      // Check a 3-pixel neighborhood so anti-aliased rules count as one line.
      let localBest = 0;
      for (let dx = -2; dx <= 2; dx++) {
        const v = lum[y * w + Math.max(ix0, Math.min(ix1, x + dx))];
        localBest = Math.max(
          localBest,
          Math.abs(left - v) + Math.abs(right - v)
        );
      }
      if (localBest >= 150) persistence++;
    }

    return {
      coverage: boundaryHits / samples,
      darkCoverage: darkHits / samples,
      persistence: persistence / samples,
      contrast: contrastSum / samples / 255
    };
  }

  function horizontalEvidence(y) {
    const samples = 36;
    let boundaryHits = 0;
    let darkHits = 0;
    let contrastSum = 0;
    let persistence = 0;

    for (let i = 0; i < samples; i++) {
      const x = Math.round(
        ix0 + (ix1 - ix0) * (i + 0.5) / samples
      );

      const center = lum[y * w + x];
      const top = lum[Math.max(iy0, y - 4) * w + x];
      const bottom = lum[Math.min(iy1, y + 4) * w + x];

      const sideAverage = (top + bottom) / 2;
      const sideDifference =
        Math.abs(top - center) +
        Math.abs(bottom - center);

      const darkRule =
        center <= 105 &&
        center + 28 < sideAverage;

      const lightGutter =
        center >= 175 &&
        center - 28 > sideAverage;

      if (darkRule || lightGutter || sideDifference >= 150) {
        boundaryHits++;
      }

      if (darkRule) darkHits++;

      contrastSum += Math.min(255, sideDifference);

      let localBest = 0;
      for (let dy = -2; dy <= 2; dy++) {
        const v = lum[
          Math.max(iy0, Math.min(iy1, y + dy)) * w + x
        ];
        localBest = Math.max(
          localBest,
          Math.abs(top - v) + Math.abs(bottom - v)
        );
      }
      if (localBest >= 150) persistence++;
    }

    return {
      coverage: boundaryHits / samples,
      darkCoverage: darkHits / samples,
      persistence: persistence / samples,
      contrast: contrastSum / samples / 255
    };
  }

  let bestVertical = null;
  let bestHorizontal = null;

  const verticalTests = 31;
  const horizontalTests = 31;

  for (let i = 1; i <= verticalTests; i++) {
    const x = Math.round(
      ix0 + (ix1 - ix0) * i / (verticalTests + 1)
    );

    const e = verticalEvidence(x);

    // Require a boundary to persist across a substantial portion of the
    // candidate. A single dark artwork line should not split a panel.
    const score =
      e.coverage * 0.48 +
      e.persistence * 0.30 +
      e.contrast * 0.17 +
      e.darkCoverage * 0.05;

    if (
      e.coverage >= 0.45 &&
      e.persistence >= 0.45 &&
      (!bestVertical || score > bestVertical.score)
    ) {
      bestVertical = {
        orientation: "vertical",
        position: x,
        score,
        coverage: e.coverage
      };
    }
  }

  for (let i = 1; i <= horizontalTests; i++) {
    const y = Math.round(
      iy0 + (iy1 - iy0) * i / (horizontalTests + 1)
    );

    const e = horizontalEvidence(y);
    const score =
      e.coverage * 0.48 +
      e.persistence * 0.30 +
      e.contrast * 0.17 +
      e.darkCoverage * 0.05;

    if (
      e.coverage >= 0.45 &&
      e.persistence >= 0.45 &&
      (!bestHorizontal || score > bestHorizontal.score)
    ) {
      bestHorizontal = {
        orientation: "horizontal",
        position: y,
        score,
        coverage: e.coverage
      };
    }
  }

  if (!bestVertical && !bestHorizontal) return null;

  if (!bestHorizontal) return bestVertical;
  if (!bestVertical) return bestHorizontal;

  return bestVertical.score >= bestHorizontal.score
    ? bestVertical
    : bestHorizontal;
}

function rankAndFilterRectangleCandidates(panels, w, h, lum, log) {
  if (!panels.length) return [];

  const scored = panels.map((p, index) => {
    const x0 = Math.max(1, Math.round(p.x * w));
    const y0 = Math.max(1, Math.round(p.y * h));
    const x1 = Math.min(w - 2, Math.round((p.x + p.w) * w));
    const y1 = Math.min(h - 2, Math.round((p.y + p.h) * h));

    const width = Math.max(1, x1 - x0);
    const height = Math.max(1, y1 - y0);

    const score = rectangleCandidateScore(
      x0, y0, x1, y1, width, height, w, h, lum
    );

    return {
      panel: p,
      index,
      x0, y0, x1, y1,
      area: width * height,
      score
    };
  });

  // V21: before candidates compete, recognize a strong smaller rectangle
  // sitting inside a substantially larger rectangle. This is the pattern we
  // want when a large composite candidate contains a real individual panel.
  //
  // We deliberately require BOTH:
  //   1) meaningful geometric containment, and
  //   2) strong independent evidence for the inner rectangle.
  //
  // This prevents the old "just favor smaller rectangles" mistake from
  // selecting arbitrary fragments.
  for (const inner of scored) {
    for (const outer of scored) {
      if (inner === outer) continue;

      const innerAreaRatio = inner.area / Math.max(1, outer.area);
      if (innerAreaRatio > 0.68) continue;
      if (innerAreaRatio < 0.08) continue;

      const contained =
        inner.x0 >= outer.x0 &&
        inner.y0 >= outer.y0 &&
        inner.x1 <= outer.x1 &&
        inner.y1 <= outer.y1;

      if (!contained) continue;

      // The inner candidate must already look like a real rectangle on its
      // own. A small fragment with weak geometry gets no bonus.
      if (inner.score < 0.62) continue;

      // Reward a clearly distinct inner rectangle. The bonus is capped so
      // containment can influence a close contest but cannot rescue a bad
      // candidate.
      const distinctness = Math.min(
        1,
        Math.max(0, 1 - innerAreaRatio) / 0.55
      );

      inner.score += 0.12 * distinctness;

      // A very large enclosing rectangle is slightly less competitive when
      // it contains a strong, much smaller rectangle. This is intentionally
      // mild because the outer rectangle may still be a legitimate panel.
      if (innerAreaRatio <= 0.45) {
        outer.score -= 0.045 * distinctness;
      }
    }
  }

  // Strong candidates first. This makes overlap suppression deterministic.
  scored.sort((a, b) => b.score - a.score);

  const kept = [];

  for (const candidate of scored) {
    let reject = false;

    for (const accepted of kept) {
      const overlap = rectangleIoU(candidate, accepted);

      if (overlap < 0.30) continue;

      // If two rectangles substantially overlap, don't keep both unless
      // they represent clearly different nested panel boundaries.
      const candidateInsideAccepted =
        candidate.x0 >= accepted.x0 &&
        candidate.y0 >= accepted.y0 &&
        candidate.x1 <= accepted.x1 &&
        candidate.y1 <= accepted.y1;

      const acceptedInsideCandidate =
        accepted.x0 >= candidate.x0 &&
        accepted.y0 >= candidate.y0 &&
        accepted.x1 <= candidate.x1 &&
        accepted.y1 <= candidate.y1;

      if (candidateInsideAccepted || acceptedInsideCandidate) {
        // Prefer the smaller rectangle when its own geometry is strong.
        const smaller = candidate.area <= accepted.area
          ? candidate
          : accepted;
        const larger = candidate.area <= accepted.area
          ? accepted
          : candidate;

        const smallerIsStrong =
          smaller.score >= 0.62;

        const areaRatio =
          smaller.area / Math.max(1, larger.area);

        // A strong, substantially smaller rectangle is preferred when it is
        // genuinely contained in the larger candidate. This is the specific
        // case V21 is designed to fix: one real panel hiding inside a
        // composite rectangle.
        if (
          smallerIsStrong &&
          areaRatio <= 0.68 &&
          smaller.score >= larger.score * 0.72
        ) {
          if (candidate === larger) {
            reject = true;
          } else {
            const pos = kept.indexOf(accepted);
            if (pos >= 0) kept.splice(pos, 1);
          }
        } else if (candidate.score <= accepted.score * 0.88) {
          reject = true;
        }
      } else {
        // Side-by-side or crossing candidates are allowed to coexist when
        // they are not simply nested duplicates.
        const overlapRatio = overlap /
          Math.max(
            0.0001,
            Math.min(candidate.area, accepted.area)
          );

        if (overlapRatio >= 0.72 && candidate.score < accepted.score * 0.90) {
          reject = true;
        }
      }

      if (reject) break;
    }

    if (!reject) kept.push(candidate);
  }

  // Do not let the competition stage erase everything. If a page produces
  // candidates but all are weak, retain the best few for the existing
  // downstream rectangle validation to make the final decision.
  if (!kept.length && scored.length) {
    kept.push(...scored.slice(0, Math.min(6, scored.length)));
  }

  kept.sort((a, b) => a.y0 - b.y0 || a.x0 - b.x0);

  if (log) {
    log(
      `rectangle competition: kept ${kept.length}/${scored.length}`
    );
  }

  return kept.map(item => item.panel);
}

function rectangleCandidateScore(
  x0, y0, x1, y1, width, height, w, h, lum
) {
  const darkThresh = 82;

  function horizontalContinuity(y, left, right) {
    const samples = 20;
    let hits = 0;

    for (let i = 0; i < samples; i++) {
      const x = Math.round(
        left + (right - left) * (i + 0.5) / samples
      );

      let dark = 0;
      for (let dy = -1; dy <= 1; dy++) {
        const yy = y + dy;
        if (yy >= 0 && yy < h && lum[yy * w + x] <= darkThresh) {
          dark++;
        }
      }

      if (dark >= 2) hits++;
    }

    return hits / samples;
  }

  function verticalContinuity(x, top, bottom) {
    const samples = 20;
    let hits = 0;

    for (let i = 0; i < samples; i++) {
      const y = Math.round(
        top + (bottom - top) * (i + 0.5) / samples
      );

      let dark = 0;
      for (let dx = -1; dx <= 1; dx++) {
        const xx = x + dx;
        if (xx >= 0 && xx < w && lum[y * w + xx] <= darkThresh) {
          dark++;
        }
      }

      if (dark >= 2) hits++;
    }

    return hits / samples;
  }

  function cornerEvidence(cx, cy) {
    const radius = Math.max(
      2,
      Math.min(8, Math.round(Math.min(width, height) * 0.018))
    );

    let dark = 0;
    let total = 0;

    for (let dy = -radius; dy <= radius; dy += 2) {
      for (let dx = -radius; dx <= radius; dx += 2) {
        const x = cx + dx;
        const y = cy + dy;
        if (x < 0 || x >= w || y < 0 || y >= h) continue;

        total++;
        if (lum[y * w + x] <= darkThresh) dark++;
      }
    }

    return total ? dark / total : 0;
  }

  const top = horizontalContinuity(y0, x0, x1);
  const bottom = horizontalContinuity(y1, x0, x1);
  const left = verticalContinuity(x0, y0, y1);
  const right = verticalContinuity(x1, y0, y1);

  const edges = [top, bottom, left, right];
  const sorted = edges.slice().sort((a, b) => b - a);

  const strongest = (
    sorted[0] + sorted[1] + sorted[2] + sorted[3]
  ) / 4;

  const weakest = sorted[3];

  const corners = [
    cornerEvidence(x0, y0),
    cornerEvidence(x1, y0),
    cornerEvidence(x0, y1),
    cornerEvidence(x1, y1)
  ];

  const cornerScore =
    corners.reduce((sum, value) => sum + Math.min(1, value / 0.28), 0) / 4;

  // Penalize candidates where one side is dramatically weaker than the
  // others. A real rectangle can have a soft side, but not three unrelated
  // weak boundaries.
  const balance = weakest / Math.max(0.05, strongest);

  // Mild preference for normal comic-panel proportions. This is deliberately
  // weak so unusual portrait/landscape panels are still eligible.
  const aspect = width / Math.max(1, height);
  const aspectPenalty =
    aspect > 8 || aspect < 0.125 ? 0.55 :
    aspect > 6 || aspect < 0.17 ? 0.78 :
    1.0;

  // V23: inspect the INTERIOR of the candidate. A rectangle that contains
  // a long, strong internal gutter is suspicious because it may actually be
  // several neighboring comic panels being mistaken for one.
  //
  // We deliberately check both orientations. A vertical internal gutter can
  // split side-by-side panels; a horizontal one can split stacked panels.
  function interiorSeparatorScore() {
    const insetX = Math.max(3, Math.round(width * 0.08));
    const insetY = Math.max(3, Math.round(height * 0.08));

    const ix0 = x0 + insetX;
    const ix1 = x1 - insetX;
    const iy0 = y0 + insetY;
    const iy1 = y1 - insetY;

    if (ix1 <= ix0 || iy1 <= iy0) return 0;

    function verticalSplitAt(x) {
      const samples = 24;
      let strong = 0;

      for (let i = 0; i < samples; i++) {
        const y = Math.round(
          iy0 + (iy1 - iy0) * (i + 0.5) / samples
        );

        // A gutter is more convincing when several adjacent pixels are
        // consistently light/dark-separated from the artwork on both sides.
        const center = lum[y * w + x];
        const left = lum[y * w + Math.max(ix0, x - 3)];
        const right = lum[y * w + Math.min(ix1, x + 3)];

        const centerLight = center >= 175;
        const neighborsDarker =
          left <= 135 &&
          right <= 135;

        if (centerLight && neighborsDarker) strong++;
      }

      return strong / samples;
    }

    function horizontalSplitAt(y) {
      const samples = 24;
      let strong = 0;

      for (let i = 0; i < samples; i++) {
        const x = Math.round(
          ix0 + (ix1 - ix0) * (i + 0.5) / samples
        );

        const center = lum[y * w + x];
        const top = lum[Math.max(iy0, y - 3) * w + x];
        const bottom = lum[Math.min(iy1, y + 3) * w + x];

        const centerLight = center >= 175;
        const neighborsDarker =
          top <= 135 &&
          bottom <= 135;

        if (centerLight && neighborsDarker) strong++;
      }

      return strong / samples;
    }

    let bestVertical = 0;
    let bestHorizontal = 0;

    // Avoid the outer edge zones; we only want separators well inside the
    // candidate. Test evenly spaced interior positions.
    const vTests = 15;
    const hTests = 15;

    for (let i = 1; i <= vTests; i++) {
      const x = Math.round(
        ix0 + (ix1 - ix0) * i / (vTests + 1)
      );
      bestVertical = Math.max(
        bestVertical,
        verticalSplitAt(x)
      );
    }

    for (let i = 1; i <= hTests; i++) {
      const y = Math.round(
        iy0 + (iy1 - iy0) * i / (hTests + 1)
      );
      bestHorizontal = Math.max(
        bestHorizontal,
        horizontalSplitAt(y)
      );
    }

    return Math.max(bestVertical, bestHorizontal);
  }

  const interiorSplit = interiorSeparatorScore();

  // Strong internal split = likely composite candidate.
  // This is intentionally a meaningful penalty, not a tiny adjustment.
  const compositePenalty =
    interiorSplit >= 0.72 ? 0.32 :
    interiorSplit >= 0.58 ? 0.20 :
    interiorSplit >= 0.45 ? 0.10 :
    0;

  return (
    strongest * 0.52 +
    balance * 0.20 +
    cornerScore * 0.23 +
    aspectPenalty * 0.05 -
    compositePenalty
  );
}

function rectangleIoU(a, b) {
  const left = Math.max(a.x0, b.x0);
  const top = Math.max(a.y0, b.y0);
  const right = Math.min(a.x1, b.x1);
  const bottom = Math.min(a.y1, b.y1);

  if (right <= left || bottom <= top) return 0;

  const intersection = (right - left) * (bottom - top);
  const union = a.area + b.area - intersection;

  return union > 0 ? intersection / union : 0;
}


// V26: REGION-FIRST DETECTOR
//
// Instead of constructing a panel from four independently selected edges,
// build a low-resolution barrier map and find the enclosed regions between
// persistent line-like boundaries. Strong isolated artwork strokes are less
// likely to become barriers because a barrier must have a short run in a
// consistent orientation.
//
// This is intentionally a candidate generator. The existing rectangle
// validation and competition stages still decide what reaches the reader.
function detectByRegions(w, h, lum, log) {
  const maxW = 260;
  const maxH = 360;
  const scale = Math.min(1, maxW / w, maxH / h);

  const rw = Math.max(24, Math.round(w * scale));
  const rh = Math.max(24, Math.round(h * scale));

  const barrier = new Uint8Array(rw * rh);

  function sampleLuma(x, y) {
    const sx = Math.min(
      w - 1,
      Math.max(0, Math.round((x + 0.5) * w / rw))
    );
    const sy = Math.min(
      h - 1,
      Math.max(0, Math.round((y + 0.5) * h / rh))
    );
    return lum[sy * w + sx];
  }

  const darkThreshold = 78;
  const runRadius = 3;

  // First build a dark-pixel map.
  const dark = new Uint8Array(rw * rh);
  for (let y = 0; y < rh; y++) {
    for (let x = 0; x < rw; x++) {
      if (sampleLuma(x, y) <= darkThreshold) {
        dark[y * rw + x] = 1;
      }
    }
  }

  // A pixel becomes a barrier only when darkness continues horizontally or
  // vertically. This filters out many isolated ink strokes inside artwork.
  for (let y = 1; y < rh - 1; y++) {
    for (let x = 1; x < rw - 1; x++) {
      if (!dark[y * rw + x]) continue;

      let horizontal = 0;
      let vertical = 0;

      for (let d = -runRadius; d <= runRadius; d++) {
        if (dark[y * rw + Math.max(0, Math.min(rw - 1, x + d))]) {
          horizontal++;
        }
        if (dark[
          Math.max(0, Math.min(rh - 1, y + d)) * rw + x
        ]) {
          vertical++;
        }
      }

      if (horizontal >= 5 || vertical >= 5) {
        barrier[y * rw + x] = 1;
      }
    }
  }

  // Close tiny gaps in otherwise continuous borders. Only a very small
  // one-dimensional gap is filled, so artwork is not broadly converted into
  // walls.
  for (let y = 1; y < rh - 1; y++) {
    for (let x = 1; x < rw - 1; x++) {
      if (barrier[y * rw + x]) continue;

      const horizontalGap =
        barrier[y * rw + x - 1] &&
        barrier[y * rw + x + 1];

      const verticalGap =
        barrier[(y - 1) * rw + x] &&
        barrier[(y + 1) * rw + x];

      if (horizontalGap || verticalGap) {
        barrier[y * rw + x] = 1;
      }
    }
  }

  const visited = new Uint8Array(rw * rh);
  const components = [];

  // Flood-fill open regions.
  for (let sy = 0; sy < rh; sy++) {
    for (let sx = 0; sx < rw; sx++) {
      const start = sy * rw + sx;

      if (visited[start] || barrier[start]) continue;

      const queue = [start];
      visited[start] = 1;

      let head = 0;
      let minX = sx, maxX = sx;
      let minY = sy, maxY = sy;
      let count = 0;
      let touchesEdge = false;

      while (head < queue.length) {
        const idx = queue[head++];
        const x = idx % rw;
        const y = Math.floor(idx / rw);

        count++;
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);

        if (
          x === 0 || y === 0 ||
          x === rw - 1 || y === rh - 1
        ) {
          touchesEdge = true;
        }

        const neighbors = [
          idx - 1,
          idx + 1,
          idx - rw,
          idx + rw
        ];

        if (x === 0) neighbors[0] = -1;
        if (x === rw - 1) neighbors[1] = -1;
        if (y === 0) neighbors[2] = -1;
        if (y === rh - 1) neighbors[3] = -1;

        for (const next of neighbors) {
          if (next < 0 || next >= visited.length) continue;
          if (visited[next] || barrier[next]) continue;

          visited[next] = 1;
          queue.push(next);
        }
      }

      const boxW = maxX - minX + 1;
      const boxH = maxY - minY + 1;
      const area = boxW * boxH;
      const fill = count / Math.max(1, area);

      // Tiny components are usually ink fragments. Huge page-spanning
      // components are usually the outside/background.
      if (boxW < rw * 0.10 || boxH < rh * 0.08) continue;
      if (boxW > rw * 0.92 && boxH > rh * 0.92) continue;
      if (count < rw * rh * 0.006) continue;

      components.push({
        minX, maxX, minY, maxY,
        boxW, boxH,
        area,
        fill,
        touchesEdge
      });
    }
  }

  if (log) {
    log(
      `region-first components=${components.length} grid=${rw}x${rh}`
    );
  }

  const candidates = [];

  for (const c of components) {
    // Regions touching the outside are useful only when they are still a
    // plausible panel-sized area. Strongly enclosed regions are preferred.
    if (
      c.touchesEdge &&
      (c.boxW > rw * 0.78 || c.boxH > rh * 0.88)
    ) {
      continue;
    }

    const aspect = c.boxW / Math.max(1, c.boxH);

    if (aspect > 7 || aspect < 0.14) continue;

    // Expand the region by one grid cell to put the candidate boundary just
    // outside the barrier. This gives the existing rectangle validator a
    // chance to recognize the actual frame instead of the interior itself.
    const padX = Math.max(1, Math.round(rw * 0.008));
    const padY = Math.max(1, Math.round(rh * 0.008));

    const x0 = Math.max(0, c.minX - padX);
    const y0 = Math.max(0, c.minY - padY);
    const x1 = Math.min(rw - 1, c.maxX + padX);
    const y1 = Math.min(rh - 1, c.maxY + padY);

    candidates.push({
      x: x0 / rw,
      y: y0 / rh,
      w: (x1 - x0 + 1) / rw,
      h: (y1 - y0 + 1) / rh,
      __regionFirst: true
    });
  }

  // Keep the most useful region candidates without overwhelming the other
  // detectors. Prefer larger, more filled regions first.
  candidates.sort((a, b) =>
    (b.w * b.h) - (a.w * a.h)
  );

  const result = candidates.slice(0, 80);

  if (log) {
    log(`region-first candidates=${result.length}`);
  }

  return result;
}


// V27: REGION + BORDER VOTING
//
// The region-first detector tells us where a plausible panel-sized area lives.
// This verifier asks whether the perimeter around that area behaves enough
// like a comic-panel boundary. Individual border points vote independently,
// so incomplete/soft borders can still pass.
function detectRegionBorderVotes(regionPanels, w, h, lum, log) {
  if (!regionPanels.length) return [];

  const results = [];

  for (const region of regionPanels) {
    const x0 = Math.max(2, Math.round(region.x * w));
    const y0 = Math.max(2, Math.round(region.y * h));
    const x1 = Math.min(w - 3, Math.round((region.x + region.w) * w));
    const y1 = Math.min(h - 3, Math.round((region.y + region.h) * h));

    const width = x1 - x0;
    const height = y1 - y0;

    if (width < 45 || height < 45) continue;

    const votes = perimeterVotes(
      x0, y0, x1, y1, width, height, w, h, lum
    );

    // Require agreement from the region AND enough independent perimeter
    // evidence. We deliberately allow incomplete borders.
    const perimeterScore =
      votes.top * 0.25 +
      votes.bottom * 0.25 +
      votes.left * 0.25 +
      votes.right * 0.25;

    const strongSides = [
      votes.top,
      votes.bottom,
      votes.left,
      votes.right
    ].filter(v => v >= 0.48).length;

    if (
      perimeterScore >= 0.38 &&
      strongSides >= 2
    ) {
      results.push({
        x: x0 / w,
        y: y0 / h,
        w: width / w,
        h: height / h,
        __regionBorderVote: true,
        __localRectangle: true
      });
    }
  }

  // Keep this candidate generator deliberately small. Region hypotheses are
  // supporting evidence, not another flood of rectangles.
  results.sort((a, b) =>
    (b.w * b.h) - (a.w * a.h)
  );

  const limited = results.slice(0, 36);

  if (log) {
    log(
      `region-border voting: ${results.length} passed, ` +
      `${limited.length} retained`
    );
  }

  return limited;
}

function perimeterVotes(x0, y0, x1, y1, width, height, w, h, lum) {
  const samples = 24;

  function horizontalVote(y) {
    let votes = 0;

    for (let i = 0; i < samples; i++) {
      const x = Math.round(
        x0 + width * (i + 0.5) / samples
      );

      const center = lum[y * w + x];
      const up = lum[Math.max(0, y - 3) * w + x];
      const down = lum[Math.min(h - 1, y + 3) * w + x];

      const darkLine =
        center <= 105 &&
        center + 22 < ((up + down) / 2);

      const brightGutter =
        center >= 175 &&
        center - 22 > ((up + down) / 2);

      const transition =
        Math.abs(up - center) +
        Math.abs(down - center) >= 125;

      if (darkLine || brightGutter || transition) {
        votes++;
      }
    }

    return votes / samples;
  }

  function verticalVote(x) {
    let votes = 0;

    for (let i = 0; i < samples; i++) {
      const y = Math.round(
        y0 + height * (i + 0.5) / samples
      );

      const center = lum[y * w + x];
      const left = lum[y * w + Math.max(0, x - 3)];
      const right = lum[y * w + Math.min(w - 1, x + 3)];

      const darkLine =
        center <= 105 &&
        center + 22 < ((left + right) / 2);

      const brightGutter =
        center >= 175 &&
        center - 22 > ((left + right) / 2);

      const transition =
        Math.abs(left - center) +
        Math.abs(right - center) >= 125;

      if (darkLine || brightGutter || transition) {
        votes++;
      }
    }

    return votes / samples;
  }

  return {
    top: horizontalVote(y0),
    bottom: horizontalVote(y1),
    left: verticalVote(x0),
    right: verticalVote(x1)
  };
}

function detectByShapeAware(w, h, lum, log) {
  // Simplified version focusing on strong edges only
  const edgeMap = new Uint8Array(w * h);
  const darkThresh = 80;

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = y * w + x;
      const center = lum[idx];

      // Check for dark pixel (frame border)
      if (center <= darkThresh) {
        edgeMap[idx] = 1;
      } else {
        // Check for luminance cliff
        const neighbors = [
          lum[(y - 1) * w + x],
          lum[(y + 1) * w + x],
          lum[y * w + (x - 1)],
          lum[y * w + (x + 1)]
        ];
        const maxDiff = Math.max(...neighbors.map(n => Math.abs(n - center)));
        if (maxDiff > 80) {
          edgeMap[idx] = 1;
        }
      }
    }
  }

  // Find contours
  const visited = new Uint8Array(w * h);
  const contours = [];

  for (let i = 0; i < edgeMap.length; i++) {
    if (edgeMap[i] && !visited[i]) {
      const contour = [];
      const queue = [i];
      visited[i] = 1;

      while (queue.length > 0) {
        const idx = queue.shift();
        contour.push(idx);

        const y = Math.floor(idx / w);
        const x = idx % w;

        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nx = x + dx, ny = y + dy;
            if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
              const nidx = ny * w + nx;
              if (edgeMap[nidx] && !visited[nidx]) {
                visited[nidx] = 1;
                queue.push(nidx);
              }
            }
          }
        }
      }

      if (contour.length > 20) {
        const panel = contourToPanel(contour, w, h);
        if (panel && isValidPanelSize(panel)) {
          contours.push(panel);
        }
      }
    }
  }

  // Remove nested panels
  const filtered = [];
  for (let i = 0; i < contours.length; i++) {
    let isNested = false;
    for (let j = 0; j < contours.length; j++) {
      if (i !== j && isPanelInside(contours[i], contours[j])) {
        isNested = true;
        break;
      }
    }
    if (!isNested) {
      filtered.push(contours[i]);
    }
  }

  return filtered;
}

function contourToPanel(contour, w, h) {
  if (contour.length < 8) return null;

  let minX = w, maxX = 0, minY = h, maxY = 0;
  for (const idx of contour) {
    const y = Math.floor(idx / w);
    const x = idx % w;
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }

  if (maxX - minX < 2 || maxY - minY < 2) return null;

  const margin = 1;
  minX = Math.max(0, minX - margin);
  maxX = Math.min(w - 1, maxX + margin);
  minY = Math.max(0, minY - margin);
  maxY = Math.min(h - 1, maxY + margin);

  return {
    x: minX / w,
    y: minY / h,
    w: (maxX - minX) / w,
    h: (maxY - minY) / h
  };
}

function isValidPanelSize(panel) {
  if (panel.w < 0.05 || panel.h < 0.05) return false;
  if (panel.w > 0.95 || panel.h > 0.95) return false;
  const aspectRatio = Math.max(panel.w / panel.h, panel.h / panel.w);
  if (aspectRatio > 8) return false;
  return true;
}

function isPanelInside(a, b) {
  const aLeft = a.x, aRight = a.x + a.w;
  const aTop = a.y, aBottom = a.y + a.h;
  const bLeft = b.x, bRight = b.x + b.w;
  const bTop = b.y, bBottom = b.y + b.h;
  return aLeft >= bLeft && aRight <= bRight && aTop >= bTop && aBottom <= bBottom;
}

// FALLBACK 2: Gutter-based detection
function detectByGutters(w, h, lum, log) {
  const panels = [];
  const rowStd = computeRowStddev(w, h, lum);
  const rowStats = getStats(rowStd);
  const gutterThresh = Math.max(5, rowStats.mean * 0.20);
  const minRowGutter = Math.max(1, Math.round(h * 0.002));

  const strips = splitByGutterAggressive(rowStd, h, gutterThresh, minRowGutter);

  if (strips.length < 2) return [];

  const minColGutter = Math.max(1, Math.round(w * 0.002));

  for (const [sy, ey] of strips) {
    const stripH = ey - sy;
    const colStd = new Float32Array(w);

    for (let x = 0; x < w; x++) {
      let sum = 0, sumSq = 0;
      for (let y = sy; y < ey; y++) {
        const l = lum[y * w + x];
        sum += l;
        sumSq += l * l;
      }
      const mean = sum / stripH;
      colStd[x] = Math.sqrt(Math.max(0, sumSq / stripH - mean * mean));
    }

    const colStats = getStats(colStd);
    const colThresh = Math.max(5, colStats.mean * 0.20);
    const cols = splitByGutterAggressive(colStd, w, colThresh, minColGutter);

    for (const [sx, ex] of cols) {
      const pw = ex - sx;
      if (pw < w * 0.08) continue;
      panels.push({
        x: sx / w,
        y: sy / h,
        w: pw / w,
        h: stripH / h
      });
    }
  }

  return panels;
}

function computeRowStddev(w, h, lum) {
  const rowStd = new Float32Array(h);
  for (let y = 0; y < h; y++) {
    let sum = 0, sumSq = 0;
    for (let x = 0; x < w; x++) {
      const l = lum[y * w + x];
      sum += l;
      sumSq += l * l;
    }
    const mean = sum / w;
    rowStd[y] = Math.sqrt(Math.max(0, sumSq / w - mean * mean));
  }
  return rowStd;
}

function splitByGutterAggressive(arr, total, thresh, minGutterRun) {
  const spans = [];
  let contentStart = 0;
  let inGutterRun = false;
  let gutterRunStart = 0;

  for (let i = 0; i <= total; i++) {
    const isGutterSample = i < total ? arr[i] < thresh : true;

    if (isGutterSample) {
      if (!inGutterRun) {
        inGutterRun = true;
        gutterRunStart = i;
      }
    } else if (inGutterRun) {
      const runLen = i - gutterRunStart;
      inGutterRun = false;

      if (runLen >= minGutterRun) {
        if (gutterRunStart - contentStart > 0) {
          spans.push([contentStart, gutterRunStart]);
        }
        contentStart = i;
      }
    }
  }

  if (total - contentStart > 0) {
    spans.push([contentStart, total]);
  }

  return spans;
}

function getStats(arr) {
  let min = Infinity, max = -Infinity, sum = 0;
  for (const v of arr) {
    if (v < min) min = v;
    if (v > max) max = v;
    sum += v;
  }
  return { min, max, mean: sum / arr.length };
}


// V28: AUTHORITATIVE PANELNESS TRIBUNAL
//
// All candidate generators are treated equally here. A candidate is judged
// by the same evidence regardless of whether it came from the local
// rectangle, region-first, gutter, shape-aware, or border-grid detector.
//
// The goal is not merely "is this a rectangle?" but:
//   1. Does it have convincing perimeter geometry?
//   2. Is the geometry balanced?
//   3. Does the interior look like one panel rather than a composite?
//   4. Is it an absurd sliver?
//   5. Is there a better candidate covering essentially the same space?
function panelnessTribunal(panels, w, h, lum, log) {
  if (!panels.length) return [];

  const judged = [];

  for (const panel of panels) {
    const x0 = Math.max(1, Math.round(panel.x * w));
    const y0 = Math.max(1, Math.round(panel.y * h));
    const x1 = Math.min(w - 2, Math.round((panel.x + panel.w) * w));
    const y1 = Math.min(h - 2, Math.round((panel.y + panel.h) * h));

    const width = Math.max(1, x1 - x0);
    const height = Math.max(1, y1 - y0);
    const area = width * height;

    const completion = rectangleCompletionScore(
      x0, y0, x1, y1, w, h, lum
    );

    const geometry = rectangleCandidateScore(
      x0, y0, x1, y1, width, height, w, h, lum
    );

    const aspect = width / Math.max(1, height);
    const sliverPenalty =
      aspect > 6.5 || aspect < 0.155 ? 0.30 :
      aspect > 5.5 || aspect < 0.18 ? 0.12 :
      0;

    // V28: independently look for a substantial internal boundary. This is
    // a hard composite warning when the candidate is large enough that both
    // resulting regions could plausibly be panels.
    const internal = findStrongInternalBoundary(
      x0, y0, x1, y1, w, h, lum
    );

    let compositePenalty = 0;

    if (internal) {
      const splitSize =
        internal.orientation === "vertical"
          ? Math.min(
              internal.position - x0,
              x1 - internal.position
            ) / Math.max(1, width)
          : Math.min(
              internal.position - y0,
              y1 - internal.position
            ) / Math.max(1, height);

      // A divider near the middle of a large candidate is much more
      // suspicious than a tiny divider close to an edge.
      if (splitSize >= 0.28) {
        compositePenalty = 0.24;
      } else if (splitSize >= 0.22) {
        compositePenalty = 0.15;
      } else if (splitSize >= 0.18) {
        compositePenalty = 0.08;
      }

      // A candidate created by V24's explicit split is allowed to survive
      // because it is already the result of repairing a composite.
      if (panel.__splitRectangle) {
        compositePenalty *= 0.20;
      }
    }

    // Combine independent signals. Completion is deliberately important,
    // but geometry gets enough weight to preserve soft/open rectangular
    // panels. Interior/composite evidence can then veto obvious Franken-
    // rectangles without requiring every border pixel to be perfect.
    let score =
      completion.score * 0.40 +
      geometry * 0.38 +
      completion.edgeBalance * 0.14 +
      Math.min(1, completion.corners / 4) * 0.08;

    score -= sliverPenalty;
    score -= compositePenalty;

    // Proven local rectangles and V24 split rectangles get a small
    // confidence boost because they were constructed from explicit
    // rectangular evidence. This is not enough to rescue weak geometry.
    if (panel.__localRectangle) score += 0.035;
    if (panel.__splitRectangle) score += 0.025;
    if (panel.__regionFirst) score += 0.010;

    // V30: a child identified before tribunal scoring as part of a credible
    // sibling group gets a modest confidence boost. The real protection is
    // the lower rejection floor below; this boost alone cannot manufacture
    // a panel.
    if (panel.__siblingProtected) score += 0.055;

    if (panel.__recursivePartition) {
      score += 0.040;

      // A strong partition is meaningful evidence that this candidate was
      // produced by an actual page-structure split.
      if (panel.__partitionStrength >= 0.58) {
        score += 0.015;
      }

      // V32 candidates passed the two-sided child proof before arriving here.
      // Keep the bonus modest so proof does not overpower ordinary geometry.
      if (panel.__partitionStrength >= 0.66) {
        score += 0.010;
      }
    }

    judged.push({
      panel,
      x0, y0, x1, y1,
      width, height,
      area,
      score,
      completion,
      geometry,
      internal,
      compositePenalty
    });
  }

  // First hard gate: eliminate obvious slivers and candidates that do not
  // have enough combined evidence to be a panel at all.
  let survivors = judged.filter(j => {
    const aspect = j.width / Math.max(1, j.height);

    if (aspect > 7 || aspect < 0.14) return false;
    if (j.width < w * 0.08 || j.height < h * 0.055) return false;

    // A proven local/split rectangle gets the V22-style relaxed floor.
    const floor = (
      j.panel.__siblingProtected
        ? 0.34
        : j.panel.__recursivePartition
          ? 0.35
          : j.panel.__localRectangle
            ? 0.40
            : 0.45
    );

    return j.score >= floor;
  });

  // Sort by actual panelness, not by detector/source.
  survivors.sort((a, b) => b.score - a.score);

  const kept = [];

  for (const candidate of survivors) {
    let reject = false;

    for (const accepted of kept) {
      const iou = rectangleIoU(candidate, accepted);

      if (iou < 0.30) continue;

      const candidateInsideAccepted =
        candidate.x0 >= accepted.x0 &&
        candidate.y0 >= accepted.y0 &&
        candidate.x1 <= accepted.x1 &&
        candidate.y1 <= accepted.y1;

      const acceptedInsideCandidate =
        accepted.x0 >= candidate.x0 &&
        accepted.y0 >= candidate.y0 &&
        accepted.x1 <= candidate.x1 &&
        accepted.y1 <= candidate.y1;

      // Nested candidates compete. Prefer the candidate with the stronger
      // panelness, but give a genuinely smaller strong panel a chance to
      // displace a large composite.
      if (candidateInsideAccepted || acceptedInsideCandidate) {
        const smaller =
          candidate.area <= accepted.area ? candidate : accepted;
        const larger =
          candidate.area <= accepted.area ? accepted : candidate;

        const ratio =
          smaller.area / Math.max(1, larger.area);

        if (
          ratio <= 0.68 &&
          smaller.score >= larger.score * 0.78
        ) {
          if (candidate === larger) {
            reject = true;
          } else {
            const pos = kept.indexOf(accepted);
            if (pos >= 0) kept.splice(pos, 1);
          }
        } else if (candidate.score < accepted.score * 0.86) {
          reject = true;
        }
      } else {
        // Side-by-side panels are allowed. Only suppress near-identical
        // footprints when one is clearly weaker.
        const smallerFootprint =
          iou / Math.max(
            0.0001,
            Math.min(candidate.area, accepted.area)
          );

        if (
          smallerFootprint >= 0.78 &&
          candidate.score < accepted.score * 0.88
        ) {
          reject = true;
        }
      }

      if (reject) break;
    }

    if (!reject) kept.push(candidate);
  }

  // Safety: retain a small number of best candidates if an unusually
  // difficult page caused every candidate to fall just below a threshold.
  if (!kept.length && judged.length) {
    kept.push(
      ...judged
        .sort((a, b) => b.score - a.score)
        .slice(0, Math.min(4, judged.length))
    );
  }

  kept.sort((a, b) =>
    a.y0 - b.y0 ||
    a.x0 - b.x0
  );

  if (log) {
    const composites = judged.filter(
      j => j.compositePenalty > 0
    ).length;

    log(
      `V28 panelness: ${kept.length}/${judged.length} kept; ` +
      `${composites} composite-suspect`
    );
  }

  return kept.map(j => j.panel);
}




// V31: RECURSIVE RECTANGULAR PARTITIONER
//
// This is intentionally not another page-wide detector. It takes strong
// existing rectangle candidates and asks:
//   "Does this rectangle contain a persistent horizontal or vertical panel
//    boundary that can partition it into two plausible rectangles?"
//
// If yes, each half is recursively inspected. This lets us recover A/B/C
// from a large composite candidate even when A/B/C were never independently
// generated by another detector.
//
// Rectangles only. Diagonal/trapezoidal geometry is intentionally excluded.
function recursiveRectangularPartition(panels, w, h, lum, log) {
  if (!panels.length) return [];

  const results = [];
  const seen = new Set();

  // Limit recursion so a noisy page cannot explode into thousands of
  // candidates. Depth 3 supports up to 8 rectangular leaves per seed.
  const MAX_DEPTH = 3;

  for (const seed of panels) {
    const start = {
      x0: Math.max(0, seed.x),
      y0: Math.max(0, seed.y),
      x1: Math.min(1, seed.x + seed.w),
      y1: Math.min(1, seed.y + seed.h),
      depth: 0
    };

    if (
      start.x1 - start.x0 < 0.14 ||
      start.y1 - start.y0 < 0.10
    ) {
      continue;
    }

    partitionRectangle(start, seed);
  }

  function partitionRectangle(rect, sourcePanel) {
    if (rect.depth >= MAX_DEPTH) return;

    const width = rect.x1 - rect.x0;
    const height = rect.y1 - rect.y0;

    if (width < 0.16 || height < 0.11) return;

    const split = findBestRectangularPartition(
      rect.x0,
      rect.y0,
      rect.x1,
      rect.y1,
      w,
      h,
      lum
    );

    if (!split) return;

    const gap = 0.012;

    let a;
    let b;

    if (split.orientation === "vertical") {
      const p = split.position;

      a = {
        x0: rect.x0,
        y0: rect.y0,
        x1: p - gap / 2,
        y1: rect.y1,
        depth: rect.depth + 1
      };

      b = {
        x0: p + gap / 2,
        y0: rect.y0,
        x1: rect.x1,
        y1: rect.y1,
        depth: rect.depth + 1
      };
    } else {
      const p = split.position;

      a = {
        x0: rect.x0,
        y0: rect.y0,
        x1: rect.x1,
        y1: p - gap / 2,
        depth: rect.depth + 1
      };

      b = {
        x0: rect.x0,
        y0: p + gap / 2,
        x1: rect.x1,
        y1: rect.y1,
        depth: rect.depth + 1
      };
    }

    if (
      a.x1 - a.x0 < 0.11 ||
      a.y1 - a.y0 < 0.075 ||
      b.x1 - b.x0 < 0.11 ||
      b.y1 - b.y0 < 0.075
    ) {
      return;
    }

    const aProof = partitionChildProof(
      a,
      b,
      split,
      w,
      h,
      lum
    );

    const bProof = partitionChildProof(
      b,
      a,
      split,
      w,
      h,
      lum
    );

    // V32: BOTH children must independently prove themselves. A strong
    // internal line is no longer sufficient. Each side needs perimeter
    // evidence, usable area, and evidence that the shared divider actually
    // behaves like that child's boundary.
    //
    // First-level splits may be moderately strong; deeper recursive splits
    // must be substantially stronger to avoid carving up artwork.
    const requiredProof =
      rect.depth <= 1 ? 0.43 : 0.56;

    const requiredDivider =
      rect.depth <= 1 ? 0.46 : 0.58;

    if (
      aProof.score < requiredProof ||
      bProof.score < requiredProof ||
      aProof.dividerSupport < requiredDivider ||
      bProof.dividerSupport < requiredDivider
    ) {
      return;
    }

    // The two sides also need to agree that this is a shared boundary.
    // This prevents a one-sided ink stroke from becoming a split.
    const mutualDivider =
      Math.min(
        aProof.dividerSupport,
        bProof.dividerSupport
      );

    if (mutualDivider < requiredDivider) return;

    addCandidate(a, split, sourcePanel);
    addCandidate(b, split, sourcePanel);

    // Recurse so a 3- or 4-panel composite can be broken down.
    partitionRectangle(a, sourcePanel);
    partitionRectangle(b, sourcePanel);
  }

  function addCandidate(rect, split, sourcePanel) {
    const key = [
      Math.round(rect.x0 * 10000),
      Math.round(rect.y0 * 10000),
      Math.round(rect.x1 * 10000),
      Math.round(rect.y1 * 10000)
    ].join(":");

    if (seen.has(key)) return;
    seen.add(key);

    results.push({
      x: rect.x0,
      y: rect.y0,
      w: rect.x1 - rect.x0,
      h: rect.y1 - rect.y0,
      __recursivePartition: true,
      __twoSidedProof: true,
      __partitionOrientation: split.orientation,
      __partitionStrength: split.score,
      __localRectangle: true
    });
  }

  return results;
}

function findBestRectangularPartition(x0, y0, x1, y1, w, h, lum) {
  const width = x1 - x0;
  const height = y1 - y0;

  const minFraction = 0.18;
  const maxFraction = 0.82;
  const samples = 30;

  let best = null;

  // Search vertical separators.
  for (let i = 0; i < samples; i++) {
    const fraction =
      minFraction +
      (maxFraction - minFraction) *
      (i + 0.5) / samples;

    const position = x0 + width * fraction;

    const evidence = internalVerticalBoundary(
      position,
      x0, y0, x1, y1,
      w, h, lum
    );

    if (!evidence) continue;

    const score =
      evidence.coverage * 0.48 +
      evidence.persistence * 0.32 +
      evidence.contrast * 0.20;

    if (!best || score > best.score) {
      best = {
        orientation: "vertical",
        position,
        score,
        coverage: evidence.coverage,
        persistence: evidence.persistence
      };
    }
  }

  // Search horizontal separators.
  for (let i = 0; i < samples; i++) {
    const fraction =
      minFraction +
      (maxFraction - minFraction) *
      (i + 0.5) / samples;

    const position = y0 + height * fraction;

    const evidence = internalHorizontalBoundary(
      position,
      x0, y0, x1, y1,
      w, h, lum
    );

    if (!evidence) continue;

    const score =
      evidence.coverage * 0.48 +
      evidence.persistence * 0.32 +
      evidence.contrast * 0.20;

    if (!best || score > best.score) {
      best = {
        orientation: "horizontal",
        position,
        score,
        coverage: evidence.coverage,
        persistence: evidence.persistence
      };
    }
  }

  // Stronger than V25/V27: a partition must be genuinely persistent.
  if (
    !best ||
    best.score < 0.43 ||
    best.coverage < 0.46 ||
    best.persistence < 0.46
  ) {
    return null;
  }

  return best;
}

function internalVerticalBoundary(position, x0, y0, x1, y1, w, h, lum) {
  const px = Math.max(
    3,
    Math.min(w - 4, Math.round(position * w))
  );

  const leftX = Math.max(0, px - 4);
  const rightX = Math.min(w - 1, px + 4);

  const samples = 34;
  let hits = 0;
  let persistence = 0;
  let contrastSum = 0;

  for (let i = 0; i < samples; i++) {
    const y = Math.max(
      0,
      Math.min(
        h - 1,
        Math.round(
          (y0 * h) +
          ((y1 - y0) * h) * (i + 0.5) / samples
        )
      )
    );

    const center = lum[y * w + px];
    const left = lum[y * w + leftX];
    const right = lum[y * w + rightX];

    const sideAverage = (left + right) / 2;

    const darkRule =
      center <= 112 &&
      center + 22 < sideAverage;

    const brightGutter =
      center >= 168 &&
      center - 22 > sideAverage;

    const transition =
      Math.abs(left - center) +
      Math.abs(right - center) >= 125;

    if (darkRule || brightGutter || transition) {
      hits++;
    }

    // Look for a small neighborhood of the boundary rather than one exact
    // pixel, which helps with anti-aliasing and 1–3 px line thickness.
    let localBest = 0;

    for (let dx = -2; dx <= 2; dx++) {
      const x = Math.max(
        0,
        Math.min(w - 1, px + dx)
      );

      const v = lum[y * w + x];

      localBest = Math.max(
        localBest,
        Math.abs(left - v) +
        Math.abs(right - v)
      );
    }

    if (localBest >= 125) {
      persistence++;
    }

    contrastSum += Math.min(
      255,
      Math.abs(left - center) +
      Math.abs(right - center)
    );
  }

  return {
    coverage: hits / samples,
    persistence: persistence / samples,
    contrast: contrastSum / samples / 255
  };
}

function internalHorizontalBoundary(position, x0, y0, x1, y1, w, h, lum) {
  const py = Math.max(
    3,
    Math.min(h - 4, Math.round(position * h))
  );

  const topY = Math.max(0, py - 4);
  const bottomY = Math.min(h - 1, py + 4);

  const samples = 34;
  let hits = 0;
  let persistence = 0;
  let contrastSum = 0;

  for (let i = 0; i < samples; i++) {
    const x = Math.max(
      0,
      Math.min(
        w - 1,
        Math.round(
          (x0 * w) +
          ((x1 - x0) * w) * (i + 0.5) / samples
        )
      )
    );

    const center = lum[py * w + x];
    const top = lum[topY * w + x];
    const bottom = lum[bottomY * w + x];

    const sideAverage = (top + bottom) / 2;

    const darkRule =
      center <= 112 &&
      center + 22 < sideAverage;

    const brightGutter =
      center >= 168 &&
      center - 22 > sideAverage;

    const transition =
      Math.abs(top - center) +
      Math.abs(bottom - center) >= 125;

    if (darkRule || brightGutter || transition) {
      hits++;
    }

    let localBest = 0;

    for (let dy = -2; dy <= 2; dy++) {
      const y = Math.max(
        0,
        Math.min(h - 1, py + dy)
      );

      const v = lum[y * w + x];

      localBest = Math.max(
        localBest,
        Math.abs(top - v) +
        Math.abs(bottom - v)
      );
    }

    if (localBest >= 125) {
      persistence++;
    }

    contrastSum += Math.min(
      255,
      Math.abs(top - center) +
      Math.abs(bottom - center)
    );
  }

  return {
    coverage: hits / samples,
    persistence: persistence / samples,
    contrast: contrastSum / samples / 255
  };
}


// V32: TWO-SIDED CHILD PROOF
//
// The old V31 test asked whether each child had enough perimeter evidence.
// V32 additionally asks whether the newly-created shared edge behaves like
// a real panel boundary for BOTH children.
//
// This is intentionally conservative: a dramatic line inside artwork can
// have huge local contrast while failing to produce two coherent panel sides.
function partitionChildProof(rect, otherRect, split, w, h, lum) {
  const baseScore = partitionChildScore(rect, w, h, lum);

  if (baseScore <= 0) {
    return {
      score: 0,
      dividerSupport: 0,
      interiorCoherence: 0
    };
  }

  const divider = childDividerSupport(
    rect,
    otherRect,
    split,
    w,
    h,
    lum
  );

  const interior = childInteriorCoherence(
    rect,
    w,
    h,
    lum
  );

  // Base geometry remains the strongest signal. The divider must agree with
  // it, while interior coherence helps reject a line that merely crosses a
  // dense artwork area.
  const score =
    baseScore * 0.48 +
    divider * 0.36 +
    interior * 0.16;

  return {
    score,
    dividerSupport: divider,
    interiorCoherence: interior
  };
}

function childDividerSupport(
  rect,
  otherRect,
  split,
  w,
  h,
  lum
) {
  const samples = 36;
  let hits = 0;
  let stable = 0;
  let contrastSum = 0;

  const isVertical = split.orientation === "vertical";

  for (let i = 0; i < samples; i++) {
    if (isVertical) {
      const y = Math.max(
        0,
        Math.min(
          h - 1,
          Math.round(
            (rect.y0 * h) +
            ((rect.y1 - rect.y0) * h) *
            (i + 0.5) / samples
          )
        )
      );

      const boundaryX = Math.max(
        2,
        Math.min(
          w - 3,
          Math.round(split.position * w)
        )
      );

      const childSide =
        rect.x1 <= split.position
          ? -1
          : 1;

      const nearX = boundaryX + childSide * 4;
      const farX = boundaryX + childSide * 13;
      const otherX = boundaryX - childSide * 4;

      const near = lum[
        y * w + Math.max(0, Math.min(w - 1, nearX))
      ];

      const far = lum[
        y * w + Math.max(0, Math.min(w - 1, farX))
      ];

      const other = lum[
        y * w + Math.max(0, Math.min(w - 1, otherX))
      ];

      const boundary = lum[y * w + boundaryX];

      const sideDifference =
        Math.abs(boundary - near) +
        Math.abs(boundary - other);

      const farDifference =
        Math.abs(boundary - far) +
        Math.abs(boundary - other);

      // A real boundary should remain distinguishable from the immediate
      // child interior while also separating it from the opposite side.
      const localBoundary =
        sideDifference >= 105;

      const separatorShape =
        farDifference >= 80;

      if (localBoundary || separatorShape) hits++;

      if (
        localBoundary &&
        Math.abs(far - near) >= 18
      ) {
        stable++;
      }

      contrastSum += Math.min(
        255,
        sideDifference
      );
    } else {
      const x = Math.max(
        0,
        Math.min(
          w - 1,
          Math.round(
            (rect.x0 * w) +
            ((rect.x1 - rect.x0) * w) *
            (i + 0.5) / samples
          )
        )
      );

      const boundaryY = Math.max(
        2,
        Math.min(
          h - 3,
          Math.round(split.position * h)
        )
      );

      const childSide =
        rect.y1 <= split.position
          ? -1
          : 1;

      const nearY = boundaryY + childSide * 4;
      const farY = boundaryY + childSide * 13;
      const otherY = boundaryY - childSide * 4;

      const near = lum[
        Math.max(0, Math.min(h - 1, nearY)) * w + x
      ];

      const far = lum[
        Math.max(0, Math.min(h - 1, farY)) * w + x
      ];

      const other = lum[
        Math.max(0, Math.min(h - 1, otherY)) * w + x
      ];

      const boundary = lum[
        boundaryY * w + x
      ];

      const sideDifference =
        Math.abs(boundary - near) +
        Math.abs(boundary - other);

      const farDifference =
        Math.abs(boundary - far) +
        Math.abs(boundary - other);

      const localBoundary =
        sideDifference >= 105;

      const separatorShape =
        farDifference >= 80;

      if (localBoundary || separatorShape) hits++;

      if (
        localBoundary &&
        Math.abs(far - near) >= 18
      ) {
        stable++;
      }

      contrastSum += Math.min(
        255,
        sideDifference
      );
    }
  }

  return (
    (hits / samples) * 0.55 +
    (stable / samples) * 0.25 +
    (contrastSum / samples / 255) * 0.20
  );
}

function childInteriorCoherence(rect, w, h, lum) {
  const px0 = Math.max(1, Math.round(rect.x0 * w));
  const py0 = Math.max(1, Math.round(rect.y0 * h));
  const px1 = Math.min(w - 2, Math.round(rect.x1 * w));
  const py1 = Math.min(h - 2, Math.round(rect.y1 * h));

  if (px1 <= px0 || py1 <= py0) return 0;

  const grid = 5;
  let total = 0;
  let smooth = 0;

  // We are not looking for a visually uniform panel. We only want to know
  // whether the interior has at least some coherent neighborhoods instead
  // of being dominated by one giant high-contrast edge.
  for (let gy = 1; gy < grid; gy++) {
    for (let gx = 1; gx < grid; gx++) {
      const x = Math.round(
        px0 + (px1 - px0) * gx / grid
      );
      const y = Math.round(
        py0 + (py1 - py0) * gy / grid
      );

      const c = lum[y * w + x];
      const r = lum[y * w + Math.min(w - 1, x + 3)];
      const d = lum[Math.min(h - 1, y + 3) * w + x];

      const localDifference =
        Math.abs(c - r) +
        Math.abs(c - d);

      total++;

      if (localDifference <= 145) {
        smooth++;
      }
    }
  }

  return total ? smooth / total : 0;
}

function partitionChildScore(rect, w, h, lum) {
  const width = rect.x1 - rect.x0;
  const height = rect.y1 - rect.y0;

  if (width < 0.10 || height < 0.07) return 0;

  const px0 = Math.max(2, Math.round(rect.x0 * w));
  const py0 = Math.max(2, Math.round(rect.y0 * h));
  const px1 = Math.min(w - 3, Math.round(rect.x1 * w));
  const py1 = Math.min(h - 3, Math.round(rect.y1 * h));

  const samples = 18;
  let top = 0;
  let bottom = 0;
  let left = 0;
  let right = 0;

  function hVote(y) {
    let hit = 0;

    for (let i = 0; i < samples; i++) {
      const x = Math.round(
        px0 + (px1 - px0) * (i + 0.5) / samples
      );

      const center = lum[y * w + x];
      const a = lum[Math.max(0, y - 3) * w + x];
      const b = lum[Math.min(h - 1, y + 3) * w + x];

      if (
        (center <= 112 && center + 20 < (a + b) / 2) ||
        (center >= 168 && center - 20 > (a + b) / 2) ||
        Math.abs(a - center) + Math.abs(b - center) >= 120
      ) {
        hit++;
      }
    }

    return hit / samples;
  }

  function vVote(x) {
    let hit = 0;

    for (let i = 0; i < samples; i++) {
      const y = Math.round(
        py0 + (py1 - py0) * (i + 0.5) / samples
      );

      const center = lum[y * w + x];
      const a = lum[y * w + Math.max(0, x - 3)];
      const b = lum[y * w + Math.min(w - 1, x + 3)];

      if (
        (center <= 112 && center + 20 < (a + b) / 2) ||
        (center >= 168 && center - 20 > (a + b) / 2) ||
        Math.abs(a - center) + Math.abs(b - center) >= 120
      ) {
        hit++;
      }
    }

    return hit / samples;
  }

  top = hVote(py0);
  bottom = hVote(py1);
  left = vVote(px0);
  right = vVote(px1);

  const strongSides = [top, bottom, left, right]
    .filter(v => v >= 0.34)
    .length;

  const average =
    (top + bottom + left + right) / 4;

  return (
    average * 0.70 +
    (strongSides / 4) * 0.30
  );
}



// V38: GUTTER / NEGATIVE-SPACE RECTANGLE RECOVERY
//
// The previous approaches mostly asked whether a candidate looked like a
// rectangle. V38 asks a different question:
//
//     "Is there a stable strip of non-art between regions?"
//
// A comic gutter can be white, black, gray, or colored. What makes it useful
// is that it tends to be comparatively uniform across its span. We therefore
// measure LOCAL luminance variance inside large candidate regions, find
// sustained low-variance bands, and use those bands as partition boundaries.
//
// This is intentionally rectangle-only. It never creates trapezoids, never
// unions neighboring panels, and never replaces the existing V32/V36 list.
// It only adds locally supported child rectangles.

function recoverGutterNegativeSpaceRectangles(pagePanels, w, h, lum, log) {
  // V40: GLOBAL GUTTER GRID RECOVERY
  //
  // Unlike V38, this pass does not require an existing "seed" panel.
  // It scans the whole page for unusually uniform, low-ink horizontal and
  // vertical bands, turns those bands into candidate grid boundaries, and
  // validates the resulting rectangular cells against the existing panel set.
  //
  // The goal is to recover rectangular cells that the normal recursive/
  // border detector missed, without allowing arbitrary unions or diagonal
  // shapes to become panels.

  const MIN_CELL_W = Math.max(18, Math.round(w * 0.055));
  const MIN_CELL_H = Math.max(18, Math.round(h * 0.045));
  const MAX_CELL_AREA = w * h * 0.92;

  // Sample a compact luminance profile. "Ink" is a conservative darkness
  // measure; gutters tend to have low local ink density over a continuous run.
  const sx = Math.max(1, Math.round(w / 220));
  const sy = Math.max(1, Math.round(h / 320));

  function rowInk(y) {
    let dark = 0, count = 0;
    for (let x = 0; x < w; x += sx) {
      const v = lum[(y * w + x) | 0];
      if (v != null && v < 210) dark++;
      count++;
    }
    return count ? dark / count : 1;
  }

  function colInk(x) {
    let dark = 0, count = 0;
    for (let y = 0; y < h; y += sy) {
      const v = lum[(y * w + x) | 0];
      if (v != null && v < 210) dark++;
      count++;
    }
    return count ? dark / count : 1;
  }

  function runs(profile, threshold, minRun) {
    const out = [];
    let a = -1;
    for (let i = 0; i < profile.length; i++) {
      if (profile[i] <= threshold) {
        if (a < 0) a = i;
      } else if (a >= 0) {
        if (i - a >= minRun) out.push([a, i - 1]);
        a = -1;
      }
    }
    if (a >= 0 && profile.length - a >= minRun) {
      out.push([a, profile.length - 1]);
    }
    return out;
  }

  function mergeRuns(rs, gap) {
    if (!rs.length) return [];
    const out = [rs[0].slice()];
    for (let i = 1; i < rs.length; i++) {
      const cur = rs[i], last = out[out.length - 1];
      if (cur[0] - last[1] - 1 <= gap) {
        last[1] = cur[1];
      } else {
        out.push(cur.slice());
      }
    }
    return out;
  }

  // We use a range of thresholds because gutter colors vary dramatically
  // between pages. A candidate must persist across multiple thresholds.
  function stableGutters(profile, thresholds, minRun, mergeGap) {
    const votes = new Array(profile.length).fill(0);
    for (const t of thresholds) {
      for (const [a, b] of runs(profile, t, minRun)) {
        for (let i = a; i <= b; i++) votes[i]++;
      }
    }
    const need = Math.ceil(thresholds.length * 0.6);
    const stable = [];
    let a = -1;
    for (let i = 0; i < votes.length; i++) {
      if (votes[i] >= need) {
        if (a < 0) a = i;
      } else if (a >= 0) {
        if (i - a + 1 >= minRun) stable.push([a, i - 1]);
        a = -1;
      }
    }
    if (a >= 0 && votes.length - a >= minRun) {
      stable.push([a, votes.length - 1]);
    }
    return mergeRuns(stable, mergeGap);
  }

  const rowProfile = [];
  for (let y = 0; y < h; y += sy) rowProfile.push(rowInk(y));

  const colProfile = [];
  for (let x = 0; x < w; x += sx) colProfile.push(colInk(x));

  const rowRuns = stableGutters(
    rowProfile,
    [0.08, 0.12, 0.16, 0.20],
    Math.max(2, Math.round(10 / sy)),
    Math.max(1, Math.round(6 / sy))
  );

  const colRuns = stableGutters(
    colProfile,
    [0.08, 0.12, 0.16, 0.20],
    Math.max(2, Math.round(10 / sx)),
    Math.max(1, Math.round(6 / sx))
  );

  // Convert bands to boundary coordinates. Page edges are always boundaries.
  const ys = [0, h];
  for (const [a, b] of rowRuns) {
    ys.push(Math.max(0, Math.round(((a + b + 1) / 2) * sy)));
  }
  const xs = [0, w];
  for (const [a, b] of colRuns) {
    xs.push(Math.max(0, Math.round(((a + b + 1) / 2) * sx)));
  }

  function uniqueSorted(arr, max) {
    return [...new Set(arr.map(v => Math.max(0, Math.min(max, v))))]
      .sort((a, b) => a - b);
  }

  const X = uniqueSorted(xs, w);
  const Y = uniqueSorted(ys, h);

  function overlap(a0, a1, b0, b1) {
    return Math.max(0, Math.min(a1, b1) - Math.max(a0, b0));
  }

  function inkDensity(x0, y0, x1, y1) {
    const xStep = Math.max(1, Math.round((x1 - x0) / 28));
    const yStep = Math.max(1, Math.round((y1 - y0) / 28));
    let dark = 0, n = 0;
    for (let y = y0; y < y1; y += yStep) {
      for (let x = x0; x < x1; x += xStep) {
        const v = lum[(y * w + x) | 0];
        if (v != null) {
          if (v < 210) dark++;
          n++;
        }
      }
    }
    return n ? dark / n : 1;
  }

  const existing = Array.isArray(pagePanels) ? pagePanels : [];
  const recovered = [];

  // Only use adjacent gutter-derived cells. This prevents arbitrary
  // combinatorial rectangles and keeps the recovery strictly rectangular.
  for (let yi = 0; yi < Y.length - 1; yi++) {
    const y0 = Y[yi], y1 = Y[yi + 1];
    const ch = y1 - y0;
    if (ch < MIN_CELL_H) continue;

    for (let xi = 0; xi < X.length - 1; xi++) {
      const x0 = X[xi], x1 = X[xi + 1];
      const cw = x1 - x0;
      if (cw < MIN_CELL_W) continue;

      const area = cw * ch;
      if (area > MAX_CELL_AREA) continue;

      // Ignore cells that are overwhelmingly empty. Conversely, require
      // enough visual content to distinguish a panel from pure gutter.
      const ink = inkDensity(x0, y0, x1, y1);
      if (ink < 0.025 || ink > 0.985) continue;

      const nx = x0 / w, ny = y0 / h, nw = cw / w, nh = ch / h;

      let maxOverlap = 0;
      for (const p of existing) {
        const px0 = p.x * w, py0 = p.y * h;
        const px1 = px0 + p.w * w, py1 = py0 + p.h * h;
        const ov = overlap(x0, x1, px0, px1) *
                   overlap(y0, y1, py0, py1);
        if (ov > maxOverlap) maxOverlap = ov;
      }

      // Don't duplicate an existing panel. A recovered cell must add useful
      // geometry rather than merely re-state what the detector already found.
      if (maxOverlap >= area * 0.88) continue;

      recovered.push({
        x: nx, y: ny, w: nw, h: nh,
        _v40Recovered: true,
        _v40Ink: ink
      });
    }
  }

  // Remove near-duplicates produced by adjacent threshold bands.
  const deduped = [];
  for (const p of recovered) {
    let duplicate = false;
    for (const q of deduped) {
      const ix = Math.max(0, Math.min(p.x + p.w, q.x + q.w) - Math.max(p.x, q.x));
      const iy = Math.max(0, Math.min(p.y + p.h, q.y + q.h) - Math.max(p.y, q.y));
      const inter = ix * iy;
      const union = p.w * p.h + q.w * q.h - inter;
      if (union > 0 && inter / union > 0.88) {
        duplicate = true;
        break;
      }
    }
    if (!duplicate) deduped.push(p);
  }

  if (log) {
    log(
      `### V40 GLOBAL GUTTER RESULT ### ` +
      `rowRuns=${rowRuns.length}, colRuns=${colRuns.length}, ` +
      `grid=${X.length - 1}x${Y.length - 1}, ` +
      `candidateCells=${recovered.length}, accepted=${deduped.length}`
    );
  }

  return deduped;
}

function findLocalGutterCuts(
  orientation,
  x0,
  y0,
  x1,
  y1,
  w,
  h,
  lum
) {
  const cuts = [];

  const span =
    orientation === "vertical"
      ? y1 - y0
      : x1 - x0;

  // A gutter should occupy a meaningful fraction of the candidate, but
  // should not have to span the entire page.
  const minRun = Math.max(
    3,
    Math.round(span * 0.025)
  );

  const maxRun = Math.max(
    minRun + 1,
    Math.round(span * 0.32)
  );

  const threshold = 13.5;

  const samples =
    orientation === "vertical"
      ? Math.max(18, Math.min(80, Math.round(span / 9)))
      : Math.max(18, Math.min(80, Math.round(span / 9)));

  const positions =
    orientation === "vertical"
      ? rangeInclusive(
          x0 + Math.round((x1 - x0) * 0.10),
          x1 - Math.round((x1 - x0) * 0.10),
          Math.max(2, Math.round((x1 - x0) / 150))
        )
      : rangeInclusive(
          y0 + Math.round((y1 - y0) * 0.10),
          y1 - Math.round((y1 - y0) * 0.10),
          Math.max(2, Math.round((y1 - y0) / 150))
        );

  let runStart = -1;

  for (const pos of positions) {
    const std =
      orientation === "vertical"
        ? localColumnStd(
            pos,
            y0,
            y1,
            w,
            h,
            lum,
            samples
          )
        : localRowStd(
            pos,
            x0,
            x1,
            w,
            h,
            lum,
            samples
          );

    const isFlat = std <= threshold;

    if (isFlat) {
      if (runStart < 0) {
        runStart = pos;
      }
    } else if (runStart >= 0) {
      const runEnd = pos;
      const runLength = runEnd - runStart;

      if (
        runLength >= minRun &&
        runLength <= maxRun
      ) {
        const center =
          Math.round(
            (runStart + runEnd) / 2
          );

        if (
          gutterCutHasCrossSpanSupport(
            orientation,
            center,
            x0,
            y0,
            x1,
            y1,
            w,
            h,
            lum
          )
        ) {
          cuts.push(center);
        }
      }

      runStart = -1;
    }
  }

  if (runStart >= 0) {
    const runEnd =
      orientation === "vertical"
        ? x1
        : y1;

    const runLength =
      runEnd - runStart;

    if (
      runLength >= minRun &&
      runLength <= maxRun
    ) {
      const center =
        Math.round(
          (runStart + runEnd) / 2
        );

      if (
        gutterCutHasCrossSpanSupport(
          orientation,
          center,
          x0,
          y0,
          x1,
          y1,
          w,
          h,
          lum
        )
      ) {
        cuts.push(center);
      }
    }
  }

  // Collapse neighboring cut estimates into one gutter coordinate.
  cuts.sort((a, b) => a - b);

  const grouped = [];

  for (const cut of cuts) {
    const previous =
      grouped[grouped.length - 1];

    if (
      previous !== undefined &&
      Math.abs(cut - previous) <
        Math.max(
          5,
          Math.round(
            (orientation === "vertical"
              ? x1 - x0
              : y1 - y0) * 0.012
          )
        )
    ) {
      grouped[grouped.length - 1] =
        Math.round(
          (previous + cut) / 2
        );
    } else {
      grouped.push(cut);
    }
  }

  // Too many cuts means we are probably seeing artwork texture rather than
  // panel gutters. Keep only the strongest three.
  if (grouped.length <= 3) {
    return grouped;
  }

  return grouped
    .map(position => ({
      position,
      strength:
        gutterCutStrength(
          orientation,
          position,
          x0,
          y0,
          x1,
          y1,
          w,
          h,
          lum
        )
    }))
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 3)
    .map(item => item.position)
    .sort((a, b) => a - b);
}

function localRowStd(
  y,
  x0,
  x1,
  w,
  h,
  lum,
  samples
) {
  const values = [];

  for (let i = 0; i < samples; i++) {
    const x = Math.round(
      x0 +
      (x1 - x0) *
      (i + 0.5) /
      samples
    );

    values.push(
      lum[
        Math.max(
          0,
          Math.min(h - 1, y)
        ) * w +
        Math.max(
          0,
          Math.min(w - 1, x)
        )
      ]
    );
  }

  return standardDeviation(values);
}

function localColumnStd(
  x,
  y0,
  y1,
  w,
  h,
  lum,
  samples
) {
  const values = [];

  for (let i = 0; i < samples; i++) {
    const y = Math.round(
      y0 +
      (y1 - y0) *
      (i + 0.5) /
      samples
    );

    values.push(
      lum[
        Math.max(
          0,
          Math.min(h - 1, y)
        ) * w +
        Math.max(
          0,
          Math.min(w - 1, x)
        )
      ]
    );
  }

  return standardDeviation(values);
}

function standardDeviation(values) {
  if (!values.length) return 999;

  let sum = 0;
  let sumSq = 0;

  for (const value of values) {
    sum += value;
    sumSq += value * value;
  }

  const mean =
    sum / values.length;

  return Math.sqrt(
    Math.max(
      0,
      sumSq / values.length -
      mean * mean
    )
  );
}

function gutterCutHasCrossSpanSupport(
  orientation,
  position,
  x0,
  y0,
  x1,
  y1,
  w,
  h,
  lum
) {
  const samples = 16;
  let supported = 0;

  for (let i = 0; i < samples; i++) {
    const t =
      (i + 0.5) / samples;

    if (orientation === "vertical") {
      const y =
        Math.round(
          y0 + (y1 - y0) * t
        );

      const a =
        lum[y * w +
          Math.max(
            0,
            Math.min(w - 1, position - 2)
          )];

      const b =
        lum[y * w +
          Math.max(
            0,
            Math.min(w - 1, position)
          )];

      const c =
        lum[y * w +
          Math.max(
            0,
            Math.min(w - 1, position + 2)
          )];

      const local =
        Math.max(a, b, c) -
        Math.min(a, b, c);

      if (local <= 24) supported++;
    } else {
      const x =
        Math.round(
          x0 + (x1 - x0) * t
        );

      const a =
        lum[
          Math.max(
            0,
            Math.min(h - 1, position - 2)
          ) * w + x
        ];

      const b =
        lum[
          Math.max(
            0,
            Math.min(h - 1, position)
          ) * w + x
        ];

      const c =
        lum[
          Math.max(
            0,
            Math.min(h - 1, position + 2)
          ) * w + x
        ];

      const local =
        Math.max(a, b, c) -
        Math.min(a, b, c);

      if (local <= 24) supported++;
    }
  }

  return supported / samples >= 0.62;
}

function gutterCutStrength(
  orientation,
  position,
  x0,
  y0,
  x1,
  y1,
  w,
  h,
  lum
) {
  const samples = 18;
  let flat = 0;

  for (let i = 0; i < samples; i++) {
    const t =
      (i + 0.5) / samples;

    if (orientation === "vertical") {
      const y =
        Math.round(
          y0 + (y1 - y0) * t
        );

      const values = [
        lum[y * w + Math.max(0, position - 2)],
        lum[y * w + Math.max(0, position)],
        lum[y * w + Math.min(w - 1, position + 2)]
      ];

      if (
        Math.max(...values) -
        Math.min(...values) <= 24
      ) {
        flat++;
      }
    } else {
      const x =
        Math.round(
          x0 + (x1 - x0) * t
        );

      const values = [
        lum[Math.max(0, position - 2) * w + x],
        lum[Math.max(0, position) * w + x],
        lum[Math.min(h - 1, position + 2) * w + x]
      ];

      if (
        Math.max(...values) -
        Math.min(...values) <= 24
      ) {
        flat++;
      }
    }
  }

  return flat / samples;
}

function gutterCellSupport(
  x0,
  y0,
  x1,
  y1,
  xCuts,
  yCuts,
  w,
  h,
  lum
) {
  let gutterSides = 0;
  let score = 0;

  const left =
    xCuts.some(c =>
      Math.abs(c - x0) <=
      Math.max(4, w * 0.012)
    );

  const right =
    xCuts.some(c =>
      Math.abs(c - x1) <=
      Math.max(4, w * 0.012)
    );

  const top =
    yCuts.some(c =>
      Math.abs(c - y0) <=
      Math.max(4, h * 0.012)
    );

  const bottom =
    yCuts.some(c =>
      Math.abs(c - y1) <=
      Math.max(4, h * 0.012)
    );

  if (left) gutterSides++;
  if (right) gutterSides++;
  if (top) gutterSides++;
  if (bottom) gutterSides++;

  score += gutterSides * 0.16;

  // Supplement gutter evidence with the existing rectangle perimeter test.
  const perimeter =
    rectangleCompletionScore(
      x0,
      y0,
      x1,
      y1,
      w,
      h,
      lum
    );

  score += perimeter.score * 0.42;

  // A useful cell should not be an extreme sliver.
  const rw = x1 - x0;
  const rh = y1 - y0;
  const aspect =
    Math.max(
      rw / Math.max(1, rh),
      rh / Math.max(1, rw)
    );

  if (aspect <= 4.8) {
    score += 0.12;
  } else if (aspect > 7) {
    score -= 0.20;
  }

  return {
    score,
    gutterSides
  };
}

function recoveryRectangleOverlaps(
  candidate,
  panels,
  threshold
) {
  for (const panel of panels) {
    const ix0 =
      Math.max(candidate.x, panel.x);
    const iy0 =
      Math.max(candidate.y, panel.y);
    const ix1 =
      Math.min(
        candidate.x + candidate.w,
        panel.x + panel.w
      );
    const iy1 =
      Math.min(
        candidate.y + candidate.h,
        panel.y + panel.h
      );

    if (
      ix1 <= ix0 ||
      iy1 <= iy0
    ) {
      continue;
    }

    const intersection =
      (ix1 - ix0) *
      (iy1 - iy0);

    const minArea =
      Math.min(
        candidate.w * candidate.h,
        panel.w * panel.h
      );

    if (
      intersection /
      Math.max(0.0001, minArea) >=
      threshold
    ) {
      return true;
    }
  }

  return false;
}

function rangeInclusive(
  start,
  end,
  step
) {
  const result = [];

  if (end < start) return result;

  for (
    let value = start;
    value <= end;
    value += Math.max(1, step)
  ) {
    result.push(value);
  }

  return result;
}

// V36: BLACK-BORDER RECTANGLE RECOVERY
//
// This pass deliberately does not use the V34 guessed-box strategy or the V35
// generic-edge pairing strategy. It looks for dark/black border runs and uses
// those runs to establish the four sides of a rectangular comic frame.
//
// Important rules:
//   - rectangular geometry only;
//   - no trapezoids or diagonal geometry;
//   - no bounding-box unions;
//   - existing V32 panels remain authoritative;
//   - strong internal rectangles beat enclosing composite regions.
//
// Comic borders can be interrupted by art, lettering, or anti-aliasing, so
// the border tests are continuity-based rather than requiring a perfectly
// black uninterrupted line.
function recoverBlackBorderRectangles(panels, w, h, lum, log) {
  const horizontal = collectDarkBorderRuns(
    "horizontal",
    w,
    h,
    lum
  );

  const vertical = collectDarkBorderRuns(
    "vertical",
    w,
    h,
    lum
  );

  const candidates = [];

  // Pair horizontal runs that could represent top/bottom edges.
  for (let i = 0; i < horizontal.length; i++) {
    for (let j = i + 1; j < horizontal.length; j++) {
      const top = horizontal[i];
      const bottom = horizontal[j];

      const height = bottom.position - top.position;

      if (height < 0.055 || height > 0.80) continue;

      const overlapStart =
        Math.max(top.start, bottom.start);
      const overlapEnd =
        Math.min(top.end, bottom.end);

      const overlap =
        overlapEnd - overlapStart;

      if (overlap < 0.30) continue;

      const topSpan = top.end - top.start;
      const bottomSpan = bottom.end - bottom.start;

      const spanSimilarity =
        Math.min(topSpan, bottomSpan) /
        Math.max(topSpan, bottomSpan);

      if (spanSimilarity < 0.42) continue;

      // Find vertical borders that cross the usable horizontal span.
      for (let k = 0; k < vertical.length; k++) {
        for (let m = k + 1; m < vertical.length; m++) {
          const left = vertical[k];
          const right = vertical[m];

          const width = right.position - left.position;

          if (width < 0.07 || width > 0.88) continue;

          const verticalOverlapStart =
            Math.max(left.start, right.start);
          const verticalOverlapEnd =
            Math.min(left.end, right.end);

          if (
            verticalOverlapEnd -
            verticalOverlapStart <
            0.30
          ) {
            continue;
          }

          const leftSpan = left.end - left.start;
          const rightSpan = right.end - right.start;

          const verticalSpanSimilarity =
            Math.min(leftSpan, rightSpan) /
            Math.max(leftSpan, rightSpan);

          if (verticalSpanSimilarity < 0.42) {
            continue;
          }

          const x = Math.max(
            overlapStart,
            verticalOverlapStart
          );

          const x2 = Math.min(
            overlapEnd,
            verticalOverlapEnd
          );

          const y = Math.max(
            top.position,
            verticalOverlapStart
          );

          const y2 = Math.min(
            bottom.position,
            verticalOverlapEnd
          );

          if (
            x2 <= x ||
            y2 <= y
          ) {
            continue;
          }

          const rect = {
            x: left.position,
            y: top.position,
            w: width,
            h: height
          };

          if (
            rect.w * w < 70 ||
            rect.h * h < 48
          ) {
            continue;
          }

          if (
            rect.w * rect.h > 0.76
          ) {
            continue;
          }

          // The four actual border runs must support the same footprint.
          const evidence =
            validateBlackBorderRectangle(
              rect,
              top,
              bottom,
              left,
              right,
              w,
              h,
              lum
            );

          if (
            evidence.score < 0.52 ||
            evidence.strongSides < 3
          ) {
            continue;
          }

          // A strong internal black border means this candidate is probably
          // an enclosing composite. Prefer the smaller interior rectangles.
          if (
            blackBorderHasStrongInternalDivider(
              rect,
              w,
              h,
              lum
            )
          ) {
            continue;
          }

          if (
            blackRecoveryOverlaps(
              rect,
              panels,
              0.74
            )
          ) {
            continue;
          }

          if (
            blackRecoveryOverlaps(
              rect,
              candidates,
              0.80
            )
          ) {
            continue;
          }

          candidates.push({
            ...rect,
            __blackBorderRecovered: true,
            __blackBorderScore: evidence.score,
            __localRectangle: true
          });
        }
      }
    }
  }

  candidates.sort(
    (a, b) =>
      (b.__blackBorderScore || 0) -
      (a.__blackBorderScore || 0)
  );

  const selected = [];

  for (const candidate of candidates) {
    if (
      blackRecoveryOverlaps(
        candidate,
        selected,
        0.80
      )
    ) {
      continue;
    }

    selected.push(candidate);

    // Recovery only; don't let it overwhelm the existing detector.
    if (selected.length >= 24) break;
  }

  if (log) {
    log(
      `V36 black-border recovery: ` +
      `H=${horizontal.length}, ` +
      `V=${vertical.length}, ` +
      `candidates=${candidates.length}, ` +
      `accepted=${selected.length}`
    );
  }

  return panels.concat(selected);
}

function collectDarkBorderRuns(
  orientation,
  w,
  h,
  lum
) {
  const edges = [];

  // Sample every 3 pixels. We are looking for long, dark structures rather
  // than individual black pixels.
  const step = 3;
  const minimumRunFraction = 0.16;

  if (orientation === "horizontal") {
    for (
      let y = 3;
      y < h - 3;
      y += step
    ) {
      const runs =
        scanDarkHorizontalRuns(
          y,
          w,
          h,
          lum
        );

      for (const run of runs) {
        if (
          (run.x1 - run.x0) / w <
          minimumRunFraction
        ) {
          continue;
        }

        edges.push({
          orientation,
          position: y / h,
          start: run.x0 / w,
          end: run.x1 / w,
          darkness: run.darkness,
          continuity: run.continuity
        });
      }
    }
  } else {
    for (
      let x = 3;
      x < w - 3;
      x += step
    ) {
      const runs =
        scanDarkVerticalRuns(
          x,
          w,
          h,
          lum
        );

      for (const run of runs) {
        if (
          (run.y1 - run.y0) / h <
          minimumRunFraction
        ) {
          continue;
        }

        edges.push({
          orientation,
          position: x / w,
          start: run.y0 / h,
          end: run.y1 / h,
          darkness: run.darkness,
          continuity: run.continuity
        });
      }
    }
  }

  // Keep the strongest dark run in each tiny coordinate neighborhood.
  edges.sort(
    (a, b) =>
      (b.darkness * b.continuity) -
      (a.darkness * a.continuity)
  );

  const selected = [];

  for (const edge of edges) {
    let nearDuplicate = false;

    for (const existing of selected) {
      if (
        Math.abs(
          edge.position -
          existing.position
        ) < 0.007 &&
        edge.start <= existing.end + 0.025 &&
        edge.end >= existing.start - 0.025
      ) {
        nearDuplicate = true;
        break;
      }
    }

    if (!nearDuplicate) {
      selected.push(edge);
    }

    if (selected.length >= 220) break;
  }

  return selected;
}

function scanDarkHorizontalRuns(
  y,
  w,
  h,
  lum
) {
  const runs = [];
  const minimumRun =
    Math.max(
      18,
      Math.round(w * 0.045)
    );

  let start = -1;
  let darkSum = 0;
  let hits = 0;

  for (
    let x = 3;
    x < w - 3;
    x += 2
  ) {
    const c = lum[y * w + x];
    const a = lum[(y - 3) * w + x];
    const b = lum[(y + 3) * w + x];

    // "Black border" is intentionally a little broader than absolute black.
    // This catches anti-aliased charcoal/ink borders without treating normal
    // colored comic art as a border.
    const dark =
      c <= 72 &&
      c <= a + 18 &&
      c <= b + 18;

    if (dark) {
      if (start < 0) start = x;

      darkSum +=
        Math.max(
          0,
          120 - c
        );

      hits++;
    } else if (start >= 0) {
      const end = x;

      if (
        end - start >= minimumRun
      ) {
        runs.push({
          x0: start,
          x1: end,
          darkness:
            darkSum /
            Math.max(1, hits) /
            120,
          continuity:
            hits /
            Math.max(
              1,
              (end - start) / 2
            )
        });
      }

      start = -1;
      darkSum = 0;
      hits = 0;
    }
  }

  if (start >= 0) {
    const end = w - 3;

    if (
      end - start >= minimumRun
    ) {
      runs.push({
        x0: start,
        x1: end,
        darkness:
          darkSum /
          Math.max(1, hits) /
          120,
        continuity:
          hits /
          Math.max(
            1,
            (end - start) / 2
          )
      });
    }
  }

  return runs;
}

function scanDarkVerticalRuns(
  x,
  w,
  h,
  lum
) {
  const runs = [];
  const minimumRun =
    Math.max(
      18,
      Math.round(h * 0.045)
    );

  let start = -1;
  let darkSum = 0;
  let hits = 0;

  for (
    let y = 3;
    y < h - 3;
    y += 2
  ) {
    const c = lum[y * w + x];
    const a = lum[y * w + x - 3];
    const b = lum[y * w + x + 3];

    const dark =
      c <= 72 &&
      c <= a + 18 &&
      c <= b + 18;

    if (dark) {
      if (start < 0) start = y;

      darkSum +=
        Math.max(
          0,
          120 - c
        );

      hits++;
    } else if (start >= 0) {
      const end = y;

      if (
        end - start >= minimumRun
      ) {
        runs.push({
          y0: start,
          y1: end,
          darkness:
            darkSum /
            Math.max(1, hits) /
            120,
          continuity:
            hits /
            Math.max(
              1,
              (end - start) / 2
            )
        });
      }

      start = -1;
      darkSum = 0;
      hits = 0;
    }
  }

  if (start >= 0) {
    const end = h - 3;

    if (
      end - start >= minimumRun
    ) {
      runs.push({
        y0: start,
        y1: end,
        darkness:
          darkSum /
          Math.max(1, hits) /
          120,
        continuity:
          hits /
          Math.max(
            1,
            (end - start) / 2
          )
      });
    }
  }

  return runs;
}

function validateBlackBorderRectangle(
  rect,
  top,
  bottom,
  left,
  right,
  w,
  h,
  lum
) {
  const sides = [
    top.darkness * top.continuity,
    bottom.darkness * bottom.continuity,
    left.darkness * left.continuity,
    right.darkness * right.continuity
  ];

  const strongSides =
    sides.filter(
      value => value >= 0.28
    ).length;

  const average =
    sides.reduce(
      (sum, value) => sum + value,
      0
    ) / 4;

  // Check the four corners directly against the luminance map. A real black
  // border should have dark support near each corner even when the middle of
  // a side is interrupted by art.
  const x0 = Math.max(
    2,
    Math.round(rect.x * w)
  );
  const y0 = Math.max(
    2,
    Math.round(rect.y * h)
  );
  const x1 = Math.min(
    w - 3,
    Math.round(
      (rect.x + rect.w) * w
    )
  );
  const y1 = Math.min(
    h - 3,
    Math.round(
      (rect.y + rect.h) * h
    )
  );

  function cornerDarkness(cx, cy) {
    let hits = 0;
    let total = 0;

    for (
      let dy = -7;
      dy <= 7;
      dy += 2
    ) {
      for (
        let dx = -7;
        dx <= 7;
        dx += 2
      ) {
        const px = cx + dx;
        const py = cy + dy;

        if (
          px < 0 || px >= w ||
          py < 0 || py >= h
        ) continue;

        total++;

        if (
          lum[py * w + px] <= 92
        ) {
          hits++;
        }
      }
    }

    return total ?
      hits / total :
      0;
  }

  const corners = [
    cornerDarkness(x0, y0),
    cornerDarkness(x1, y0),
    cornerDarkness(x0, y1),
    cornerDarkness(x1, y1)
  ];

  const cornerScore =
    corners.reduce(
      (sum, value) =>
        sum + Math.min(
          1,
          value / 0.34
        ),
      0
    ) / 4;

  return {
    score:
      average * 0.70 +
      (strongSides / 4) * 0.18 +
      cornerScore * 0.12,
    strongSides,
    cornerScore
  };
}

function blackBorderHasStrongInternalDivider(
  rect,
  w,
  h,
  lum
) {
  const fractions = [
    0.22, 0.30, 0.38, 0.46,
    0.54, 0.62, 0.70, 0.78
  ];

  for (const fraction of fractions) {
    const x =
      rect.x +
      rect.w * fraction;

    const y =
      rect.y +
      rect.h * fraction;

    if (
      blackInternalDividerStrength(
        "vertical",
        x,
        rect,
        w,
        h,
        lum
      ) >= 0.76
    ) {
      return true;
    }

    if (
      blackInternalDividerStrength(
        "horizontal",
        y,
        rect,
        w,
        h,
        lum
      ) >= 0.76
    ) {
      return true;
    }
  }

  return false;
}

function blackInternalDividerStrength(
  orientation,
  position,
  rect,
  w,
  h,
  lum
) {
  const samples = 32;
  let darkHits = 0;

  for (
    let i = 0;
    i < samples;
    i++
  ) {
    if (
      orientation ===
      "vertical"
    ) {
      const x = Math.max(
        2,
        Math.min(
          w - 3,
          Math.round(
            position * w
          )
        )
      );

      const y = Math.max(
        1,
        Math.min(
          h - 2,
          Math.round(
            (
              rect.y +
              rect.h *
              (i + 0.5) /
              samples
            ) * h
          )
        )
      );

      const c =
        lum[y * w + x];

      if (c <= 62) {
        darkHits++;
      }
    } else {
      const y = Math.max(
        2,
        Math.min(
          h - 3,
          Math.round(
            position * h
          )
        )
      );

      const x = Math.max(
        1,
        Math.min(
          w - 2,
          Math.round(
            (
              rect.x +
              rect.w *
              (i + 0.5) /
              samples
            ) * w
          )
        )
      );

      const c =
        lum[y * w + x];

      if (c <= 62) {
        darkHits++;
      }
    }
  }

  return darkHits / samples;
}

function blackRecoveryOverlaps(
  candidate,
  panels,
  threshold
) {
  for (const panel of panels) {
    const left = Math.max(
      candidate.x,
      panel.x
    );
    const top = Math.max(
      candidate.y,
      panel.y
    );
    const right = Math.min(
      candidate.x + candidate.w,
      panel.x + panel.w
    );
    const bottom = Math.min(
      candidate.y + candidate.h,
      panel.y + panel.h
    );

    if (
      right <= left ||
      bottom <= top
    ) {
      continue;
    }

    const intersection =
      (right - left) *
      (bottom - top);

    const candidateArea =
      candidate.w *
      candidate.h;

    const panelArea =
      panel.w *
      panel.h;

    const ratio =
      intersection /
      Math.max(
        0.0001,
        Math.min(
          candidateArea,
          panelArea
        )
      );

    if (ratio >= threshold) {
      return true;
    }
  }

  return false;
}

// V30: EARLY SIBLING PROTECTION
//
// This runs on the complete candidate pool, before panelness/competition can
// remove one of the children. It marks strong, separated candidates that
// appear to form a sibling group inside a larger parent.
//
// The marker is intentionally internal and is removed before panels leave
// panels.js.
function protectEarlySiblingCandidates(panels, w, h, lum, log) {
  if (panels.length < 3) return panels;

  const items = panels.map((panel, index) => {
    const x0 = Math.max(0, panel.x);
    const y0 = Math.max(0, panel.y);
    const x1 = Math.min(1, panel.x + panel.w);
    const y1 = Math.min(1, panel.y + panel.h);

    const width = x1 - x0;
    const height = y1 - y0;

    // Lightweight pre-score. We intentionally do not call the full
    // panelness tribunal here because that is the stage we're protecting
    // against.
    const edge = quickRectangleEvidence(
      x0, y0, x1, y1, w, h, lum
    );

    return {
      panel,
      index,
      x0, y0, x1, y1,
      width,
      height,
      area: width * height,
      edge
    };
  });

  const protectedIndices = new Set();
  let groups = 0;

  for (const parent of items) {
    if (parent.area < 0.07) continue;

    const children = [];

    for (const child of items) {
      if (child === parent) continue;

      const inside =
        child.x0 >= parent.x0 &&
        child.y0 >= parent.y0 &&
        child.x1 <= parent.x1 &&
        child.y1 <= parent.y1;

      if (!inside) continue;

      const ratio =
        child.area / Math.max(0.0001, parent.area);

      if (ratio < 0.055 || ratio > 0.62) continue;

      // The child must have meaningful perimeter evidence already.
      if (child.edge < 0.30) continue;

      children.push(child);
    }

    if (children.length < 2) continue;

    // Build a sibling group from spatially separated children. Candidates
    // that substantially overlap are treated as duplicate detections, not
    // siblings.
    const siblings = [];

    children.sort((a, b) => b.edge - a.edge);

    for (const child of children) {
      let duplicate = false;

      for (const sibling of siblings) {
        if (normalizedOverlap(child, sibling) >= 0.35) {
          duplicate = true;
          break;
        }
      }

      if (!duplicate) siblings.push(child);
    }

    if (siblings.length < 2) continue;

    const chosen = siblings.slice(0, 5);

    const coverage = chosen.reduce(
      (sum, child) => sum + child.area,
      0
    ) / Math.max(0.0001, parent.area);

    const layout = siblingLayoutScore(chosen);

    // V30 is intentionally stronger than V29. We protect the children when
    // they explain at least 34% of the parent and have a clear row/column
    // arrangement. We still require two independently credible siblings.
    if (coverage < 0.34 || layout < 0.42) continue;

    for (const child of chosen) {
      protectedIndices.add(child.index);
      child.panel.__siblingProtected = true;
    }

    groups++;

    if (log) {
      log(
        `V30 sibling group: ${chosen.length} protected; ` +
        `coverage=${coverage.toFixed(2)} layout=${layout.toFixed(2)}`
      );
    }
  }

  if (log) {
    log(
      `V30 early sibling protection: ${protectedIndices.size} candidate(s), ` +
      `${groups} group(s)`
    );
  }

  return panels;
}

function quickRectangleEvidence(x0, y0, x1, y1, w, h, lum) {
  const width = Math.max(1, Math.round((x1 - x0) * w));
  const height = Math.max(1, Math.round((y1 - y0) * h));

  if (width < 20 || height < 20) return 0;

  const px0 = Math.max(1, Math.round(x0 * w));
  const py0 = Math.max(1, Math.round(y0 * h));
  const px1 = Math.min(w - 2, Math.round(x1 * w));
  const py1 = Math.min(h - 2, Math.round(y1 * h));

  const samples = 18;

  function horizontal(y) {
    let hits = 0;

    for (let i = 0; i < samples; i++) {
      const x = Math.round(
        px0 + (px1 - px0) * (i + 0.5) / samples
      );

      const center = lum[y * w + x];
      const up = lum[Math.max(0, y - 3) * w + x];
      const down = lum[Math.min(h - 1, y + 3) * w + x];

      if (
        (center <= 110 && center + 20 < (up + down) / 2) ||
        (center >= 170 && center - 20 > (up + down) / 2) ||
        Math.abs(up - center) + Math.abs(down - center) >= 120
      ) {
        hits++;
      }
    }

    return hits / samples;
  }

  function vertical(x) {
    let hits = 0;

    for (let i = 0; i < samples; i++) {
      const y = Math.round(
        py0 + (py1 - py0) * (i + 0.5) / samples
      );

      const center = lum[y * w + x];
      const left = lum[y * w + Math.max(0, x - 3)];
      const right = lum[y * w + Math.min(w - 1, x + 3)];

      if (
        (center <= 110 && center + 20 < (left + right) / 2) ||
        (center >= 170 && center - 20 > (left + right) / 2) ||
        Math.abs(left - center) + Math.abs(right - center) >= 120
      ) {
        hits++;
      }
    }

    return hits / samples;
  }

  return (
    horizontal(py0) +
    horizontal(py1) +
    vertical(px0) +
    vertical(px1)
  ) / 4;
}

// V29: SIBLING-AWARE PANEL HIERARCHY
//
// A large candidate can be a legitimate panel, but it can also be a container
// around multiple real panels. We only demote the parent when there are at
// least two strong sibling candidates that are spatially separated and
// together occupy a meaningful portion of its footprint.
//
// This deliberately avoids the dangerous rule "always keep the smallest".
function applySiblingAwareHierarchy(panels, w, h, log) {
  if (panels.length < 3) return panels;

  const items = panels.map((panel, index) => {
    const x0 = Math.max(0, panel.x);
    const y0 = Math.max(0, panel.y);
    const x1 = Math.min(1, panel.x + panel.w);
    const y1 = Math.min(1, panel.y + panel.h);

    return {
      panel,
      index,
      x0, y0, x1, y1,
      area: Math.max(0, x1 - x0) * Math.max(0, y1 - y0)
    };
  });

  const demote = new Set();
  let hierarchyEvents = 0;

  for (const parent of items) {
    // Parent must be meaningfully larger than the children we hope to find.
    if (parent.area < 0.06) continue;

    const children = [];

    for (const child of items) {
      if (child === parent) continue;

      const inside =
        child.x0 >= parent.x0 &&
        child.y0 >= parent.y0 &&
        child.x1 <= parent.x1 &&
        child.y1 <= parent.y1;

      if (!inside) continue;

      const ratio = child.area / Math.max(0.0001, parent.area);

      // Protected children are intentional panel hypotheses. They remain
      // eligible as siblings, but the hierarchy layer must not use the
      // parent/child relationship to discard the child itself.
      if (ratio < 0.045 || ratio > 0.62) continue;

      children.push(child);
    }

    if (children.length < 2) continue;

    // Keep only children that are sufficiently separated from each other.
    // This is the "sibling" requirement: two copies of the same rectangle
    // don't count as two panels.
    const siblings = [];

    for (const child of children) {
      let separated = true;

      for (const sibling of siblings) {
        const overlap = normalizedOverlap(child, sibling);

        if (overlap >= 0.35) {
          separated = false;
          break;
        }
      }

      if (separated) siblings.push(child);
    }

    if (siblings.length < 2) continue;

    // Prefer the strongest spatially separated children first.
    siblings.sort((a, b) => b.area - a.area);

    // Only use the best few to explain the parent. This prevents a page full
    // of tiny candidates from accidentally voting a legitimate large panel
    // out of existence.
    const chosen = siblings.slice(0, 5);

    const totalChildArea = chosen.reduce(
      (sum, child) => sum + child.area,
      0
    );

    const coverage =
      totalChildArea / Math.max(0.0001, parent.area);

    // At least two sibling candidates should explain a substantial part of
    // the parent. We use 42% rather than demanding a perfect tiling because
    // gutters, irregular art, and detection gaps are expected.
    if (coverage < 0.42) continue;

    // If the siblings are arranged mostly side-by-side or stacked, that is
    // particularly strong evidence that the parent is a composite.
    const layout = siblingLayoutScore(chosen);

    if (layout < 0.48) continue;

    demote.add(parent.index);
    hierarchyEvents++;

    if (log) {
      log(
        `V29 parent demoted: ${chosen.length} siblings, ` +
        `coverage=${coverage.toFixed(2)} layout=${layout.toFixed(2)}`
      );
    }
  }

  if (!demote.size) {
    if (log) log("V29 hierarchy: no composite parents demoted");
    return panels;
  }

  const result = items
    .filter(item => !demote.has(item.index))
    .map(item => item.panel);

  // Safety: never let hierarchy remove every candidate from a page.
  if (!result.length) {
    return panels;
  }

  if (log) {
    log(
      `V29 hierarchy: demoted ${demote.size} parent candidate(s)`
    );
  }

  return result;
}

function normalizedOverlap(a, b) {
  const left = Math.max(a.x0, b.x0);
  const top = Math.max(a.y0, b.y0);
  const right = Math.min(a.x1, b.x1);
  const bottom = Math.min(a.y1, b.y1);

  if (right <= left || bottom <= top) return 0;

  const intersection =
    (right - left) * (bottom - top);

  return intersection / Math.max(
    0.0001,
    Math.min(a.area, b.area)
  );
}

function siblingLayoutScore(children) {
  if (children.length < 2) return 0;

  let horizontalPairs = 0;
  let verticalPairs = 0;
  let pairCount = 0;

  for (let i = 0; i < children.length; i++) {
    for (let j = i + 1; j < children.length; j++) {
      const a = children[i];
      const b = children[j];

      pairCount++;

      const aCenterX = (a.x0 + a.x1) / 2;
      const aCenterY = (a.y0 + a.y1) / 2;
      const bCenterX = (b.x0 + b.x1) / 2;
      const bCenterY = (b.y0 + b.y1) / 2;

      const dx = Math.abs(aCenterX - bCenterX);
      const dy = Math.abs(aCenterY - bCenterY);

      // Similar y positions imply a horizontal row of siblings.
      if (
        dy <= Math.max(
          0.035,
          Math.min(a.y1 - a.y0, b.y1 - b.y0) * 0.55
        )
      ) {
        horizontalPairs++;
      }

      // Similar x positions imply a vertical stack of siblings.
      if (
        dx <= Math.max(
          0.035,
          Math.min(a.x1 - a.x0, b.x1 - b.x0) * 0.55
        )
      ) {
        verticalPairs++;
      }
    }
  }

  if (!pairCount) return 0;

  return Math.max(
    horizontalPairs / pairCount,
    verticalPairs / pairCount
  );
}

function validateRectangleCandidates(panels, w, h, lum, log) {
  if (panels.length === 0) return [];

  const scored = panels.map(panel => {
    const x0 = Math.max(1, Math.round(panel.x * w));
    const y0 = Math.max(1, Math.round(panel.y * h));
    const x1 = Math.min(w - 2, Math.round((panel.x + panel.w) * w));
    const y1 = Math.min(h - 2, Math.round((panel.y + panel.h) * h));

    const check = rectangleCompletionScore(x0, y0, x1, y1, w, h, lum);

    return {
      panel,
      score: check.score,
      corners: check.corners,
      edgeBalance: check.edgeBalance
    };
  });

  // A candidate passes when it has evidence at both corners of most sides,
  // plus reasonable balance between its four sides. This deliberately does
  // not require every side to be black: many comic panels use open/soft edges.
  const kept = scored.filter(s => {
    // V22: local rectangles are already constructed from four geometrically
    // matching line segments. Do not throw them away merely because a comic
    // panel has an open/soft corner. This is specifically for the rectangular
    // frames we are trying to recover.
    if (s.panel.__localRectangle) {
      return (
        s.edgeBalance >= 0.18 &&
        s.score >= 0.42
      );
    }

    // Keep the existing validation for shape/gutter candidates.
    return (
      s.corners >= 3 &&
      s.edgeBalance >= 0.28 &&
      s.score >= 0.48
    );
  });

  // Safety fallback: if the page has no candidates that satisfy the
  // completion test, preserve the original candidates rather than blanking
  // the detector.
  if (kept.length === 0) {
    if (log) log(
      "rectangle-completion: no confident complete rectangles; " +
      "keeping original candidates"
    );
    return panels;
  }

  if (log) log(
    `rectangle-completion: kept ${kept.length}/${panels.length}`
  );

  return kept.map(s => s.panel);
}

function rectangleCompletionScore(x0, y0, x1, y1, w, h, lum) {
  const darkThresh = 95;
  const cornerRadius = Math.max(
    3,
    Math.min(12, Math.round(Math.min(x1 - x0, y1 - y0) * 0.025))
  );

  function darkRatioAroundPoint(cx, cy) {
    let dark = 0;
    let total = 0;

    for (let dy = -cornerRadius; dy <= cornerRadius; dy += 2) {
      for (let dx = -cornerRadius; dx <= cornerRadius; dx += 2) {
        const x = cx + dx;
        const y = cy + dy;

        if (x < 0 || x >= w || y < 0 || y >= h) continue;

        if (lum[y * w + x] <= darkThresh) dark++;
        total++;
      }
    }

    return total ? dark / total : 0;
  }

  function horizontalContinuity(y, xa, xb) {
    const span = Math.max(1, xb - xa);
    const samples = 12;
    let darkSamples = 0;

    for (let i = 0; i < samples; i++) {
      const x = Math.round(xa + span * (i + 0.5) / samples);

      let localDark = 0;
      for (let dy = -1; dy <= 1; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= h) continue;

        if (lum[yy * w + x] <= darkThresh) {
          localDark++;
        }
      }

      if (localDark >= 2) darkSamples++;
    }

    return darkSamples / samples;
  }

  function verticalContinuity(x, ya, yb) {
    const span = Math.max(1, yb - ya);
    const samples = 12;
    let darkSamples = 0;

    for (let i = 0; i < samples; i++) {
      const y = Math.round(ya + span * (i + 0.5) / samples);

      let localDark = 0;
      for (let dx = -1; dx <= 1; dx++) {
        const xx = x + dx;
        if (xx < 0 || xx >= w) continue;

        if (lum[y * w + xx] <= darkThresh) {
          localDark++;
        }
      }

      if (localDark >= 2) darkSamples++;
    }

    return darkSamples / samples;
  }

  const cornerValues = [
    darkRatioAroundPoint(x0, y0),
    darkRatioAroundPoint(x1, y0),
    darkRatioAroundPoint(x0, y1),
    darkRatioAroundPoint(x1, y1)
  ];

  const corners = cornerValues.filter(v => v >= 0.12).length;

  const top = horizontalContinuity(y0, x0, x1);
  const bottom = horizontalContinuity(y1, x0, x1);
  const left = verticalContinuity(x0, y0, y1);
  const right = verticalContinuity(x1, y0, y1);

  const edges = [top, bottom, left, right];

  const sorted = edges.slice().sort((a, b) => b - a);
  const strongestThree =
    (sorted[0] + sorted[1] + sorted[2]) / 3;

  const weakest = sorted[3];

  // "Balance" prevents one very strong line plus three unrelated weak
  // boundaries from looking like a complete rectangle.
  const edgeBalance = weakest / Math.max(0.01, strongestThree);

  const score =
    strongestThree * 0.70 +
    (corners / 4) * 0.30;

  return {
    score,
    corners,
    edgeBalance
  };
}

function mergeOverlappingPanels(panels, threshold) {
  if (panels.length === 0) return [];

  panels = panels.filter(p => p.w > 0 && p.h > 0);
  const merged = [];
  const used = new Set();

  for (let i = 0; i < panels.length; i++) {
    if (used.has(i)) continue;

    let group = [panels[i]];
    used.add(i);

    for (let j = i + 1; j < panels.length; j++) {
      if (used.has(j)) continue;

      if (panelsAreNearDuplicates(panels[i], panels[j], threshold)) {
        group.push(panels[j]);
        used.add(j);
      }
    }

    // For near-duplicates, keep the first geometry rather than creating a
    // larger union rectangle. This prevents "Frankenstein" panels.
    merged.push(group[0]);
  }

  return merged;
}

function panelsAreNearDuplicates(p1, p2, threshold) {
  const overlap = panelOverlapRatio(p1, p2);
  if (overlap < threshold) return false;

  const widthSimilarity =
    Math.min(p1.w, p2.w) / Math.max(p1.w, p2.w);

  const heightSimilarity =
    Math.min(p1.h, p2.h) / Math.max(p1.h, p2.h);

  const cx1 = p1.x + p1.w / 2;
  const cy1 = p1.y + p1.h / 2;
  const cx2 = p2.x + p2.w / 2;
  const cy2 = p2.y + p2.h / 2;

  const centerDistance =
    Math.hypot(cx1 - cx2, cy1 - cy2);

  const centerTolerance =
    Math.max(p1.w, p2.w, p1.h, p2.h) * 0.10;

  return (
    widthSimilarity >= 0.90 &&
    heightSimilarity >= 0.90 &&
    centerDistance <= centerTolerance
  );
}

function panelOverlapRatio(p1, p2) {
  const ix0 = Math.max(p1.x, p2.x);
  const iy0 = Math.max(p1.y, p2.y);
  const ix1 = Math.min(p1.x + p1.w, p2.x + p2.w);
  const iy1 = Math.min(p1.y + p1.h, p2.y + p2.h);

  if (ix1 <= ix0 || iy1 <= iy0) return 0;

  const overlapArea = (ix1 - ix0) * (iy1 - iy0);
  const minArea = Math.min(p1.w * p1.h, p2.w * p2.h);

  return overlapArea / minArea;
}

function combinePanels(panels) {
  let minX = 1, maxX = 0, minY = 1, maxY = 0;
  for (const p of panels) {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x + p.w);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y + p.h);
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

function sortPanelsByPosition(panels) {
  return panels.sort((a, b) => {
    const rowDiff = a.y - b.y;
    if (Math.abs(rowDiff) > 0.01) return rowDiff;
    return a.x - b.x;
  });
}

window.PanelDetect = PanelDetect;
