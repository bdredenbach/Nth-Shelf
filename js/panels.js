// ================================================================
// NTH SHELF — V70
// EXPERIMENT: TRUE CLEAN GUTTER BOUNDARY
// BUILD: V70 — isolated gutter-boundary detector
// ================================================================
// IMPORTANT: This file intentionally contains NO legacy panel detector.
// There is no border-grid detector, region detector, hierarchy logic,
// recursive partitioner, black-border recovery, old gutter-grid recovery,
// candidate tribunal, or tap rectangle selector.
//
// V70 receives only the verified visible page image and exact tap coordinate.
// Its sole job is to identify the visual panel region enclosed by the gutter.

const PanelDetect = {
  findPanelByGutter(img, relX, relY, log) {
    // ================================================================
    // V70 — GUTTER BOUNDARY TEST
    // ================================================================
    // The target is the visual panel containing the exact tap. We do NOT
    // select a detector child/parent and we do NOT subdivide a previously
    // selected rectangle. Instead, we shoot many rays from the tap and look
    // for the nearest sustained transition into a gutter/boundary zone.
    // Candidate points are then connected into a closed contour. Isolated
    // artwork edges should lose because they generally do not persist across
    // neighboring ray angles or form a coherent closed enclosure.
    // ================================================================
    const started = performance.now();
    if (!img || !(img.naturalWidth || img.width) || !(img.naturalHeight || img.height)) return null;

    const srcW = img.naturalWidth || img.width;
    const srcH = img.naturalHeight || img.height;
    const scale = Math.min(1, 1400 / Math.max(srcW, srcH));
    const w = Math.max(32, Math.round(srcW * scale));
    const h = Math.max(32, Math.round(srcH * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, w, h);

    let data;
    try {
      data = ctx.getImageData(0, 0, w, h).data;
    } catch (e) {
      if (log) log(`[V70] IMAGE READ ERROR ${e?.message || e}`);
      return null;
    }

    const n = w * h;
    const lum = new Float32Array(n);
    const chr = new Float32Array(n);
    const rr = new Uint8Array(n);
    const gg = new Uint8Array(n);
    const bb = new Uint8Array(n);

    for (let i = 0, p = 0; i < n; i++, p += 4) {
      const r = data[p], g = data[p + 1], b = data[p + 2];
      rr[i] = r; gg[i] = g; bb[i] = b;
      lum[i] = 0.299 * r + 0.587 * g + 0.114 * b;
      chr[i] = Math.max(r, g, b) - Math.min(r, g, b);
    }

    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const at = (x, y) => y * w + x;
    const px = clamp(Math.round(relX * (w - 1)), 3, w - 4);
    const py = clamp(Math.round(relY * (h - 1)), 3, h - 4);

    if (log) {
      log(`[V70] TAP x=${relX.toFixed(4)} y=${relY.toFixed(4)} px=${px} py=${py}`);
      log(`[V70] GUTTER SEARCH — detector hierarchy disabled`);
      log(`[V70] IMAGE ${w}x${h}`);
    }

    function pixelTransition(x1, y1, x2, y2) {
      x1 = clamp(Math.round(x1), 0, w - 1); y1 = clamp(Math.round(y1), 0, h - 1);
      x2 = clamp(Math.round(x2), 0, w - 1); y2 = clamp(Math.round(y2), 0, h - 1);
      const a = at(x1, y1), b = at(x2, y2);
      const dr = rr[a] - rr[b], dg = gg[a] - gg[b], db = bb[a] - bb[b];
      const rgb = Math.sqrt(dr * dr + dg * dg + db * db) / 441.673;
      const ld = Math.abs(lum[a] - lum[b]) / 255;
      const cd = Math.abs(chr[a] - chr[b]) / 255;
      return 0.47 * rgb + 0.35 * ld + 0.18 * cd;
    }

    // Evidence that a radial transition is really a boundary/gutter rather
    // than one isolated artwork edge. The test samples a short tangent strip
    // on both sides of the ray and requires persistence across that strip.
    function radialBoundaryQuality(x, y, nx, ny, tx, ty, radius) {
      const tangentOffsets = [-18, -12, -7, 0, 7, 12, 18];
      const values = [];
      const innerGap = Math.max(3, Math.round(radius * 0.012));
      const outerGap = Math.max(5, Math.round(radius * 0.010));

      for (const off of tangentOffsets) {
        const cx = x + tx * off;
        const cy = y + ty * off;
        const insideX = cx - nx * innerGap;
        const insideY = cy - ny * innerGap;
        const outsideX = cx + nx * outerGap;
        const outsideY = cy + ny * outerGap;
        values.push(pixelTransition(insideX, insideY, outsideX, outsideY));
      }

      const sorted = values.slice().sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)];
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const coverage = values.filter(v => v >= 0.095).length / values.length;
      const strong = values.filter(v => v >= 0.17).length / values.length;

      // A gutter can be a zone, not a literal line. Check for evidence just
      // beyond the proposed transition as well, looking for a sustained
      // outside regime instead of a single-pixel spike.
      const zoneA = pixelTransition(x - nx * 2, y - ny * 2, x + nx * 10, y + ny * 10);
      const zoneB = pixelTransition(x - nx * 5, y - ny * 5, x + nx * 15, y + ny * 15);
      const zone = Math.max(zoneA, zoneB);
      const quality = 0.38 * median + 0.28 * mean + 0.22 * coverage + 0.12 * strong;

      return { quality, median, mean, coverage, strong, zone };
    }

    const maxRadius = Math.hypot(Math.max(px, w - 1 - px), Math.max(py, h - 1 - py));
    const step = Math.max(3, Math.round(Math.min(w, h) / 280));
    const rayCount = 72;
    const rayResults = [];

    // Nearest-to-farthest on every ray. We keep only the first convincing
    // sustained candidate, exactly to avoid the old "strongest farther edge"
    // behavior.
    for (let r = 0; r < rayCount; r++) {
      const angle = (Math.PI * 2 * r) / rayCount;
      const nx = Math.cos(angle), ny = Math.sin(angle);
      const tx = -ny, ty = nx;
      const maxD = Math.min(maxRadius, Math.hypot(
        nx < 0 ? px : (w - 1 - px),
        ny < 0 ? py : (h - 1 - py)
      ));

      let streak = 0;
      let best = null;
      for (let d = Math.max(10, step * 2); d <= maxD - 8; d += step) {
        const x = px + nx * d;
        const y = py + ny * d;
        const q = radialBoundaryQuality(x, y, nx, ny, tx, ty, d);
        const convincing = q.quality >= 0.155 && q.median >= 0.090 && q.coverage >= 0.57;

        if (convincing) {
          streak++;
          if (!best || q.quality > best.quality) {
            best = { d, x, y, angle, nx, ny, tx, ty, ...q };
          }
          if (streak >= 2) break;
        } else {
          streak = 0;
          best = null;
        }
      }
      rayResults.push(best);
    }

    const foundCount = rayResults.filter(Boolean).length;
    if (log) log(`[V70] RAYS ${rayCount} found=${foundCount}/${rayCount}`);

    if (foundCount < Math.round(rayCount * 0.52)) {
      if (log) log(`[V70] NO CLOSED GUTTER CONTOUR — insufficient boundary coverage`);
      return null;
    }

    // Fill small gaps only when neighboring angular rays agree. We never
    // invent a long missing section, which keeps the contour conservative.
    const filled = rayResults.slice();
    for (let i = 0; i < rayCount; i++) {
      if (filled[i]) continue;
      const prev = filled[(i - 1 + rayCount) % rayCount];
      const next = filled[(i + 1) % rayCount];
      if (prev && next) {
        const gap = Math.abs(prev.d - next.d) / Math.max(1, Math.min(prev.d, next.d));
        if (gap <= 0.28) {
          const d = (prev.d + next.d) / 2;
          const angle = (Math.PI * 2 * i) / rayCount;
          const nx = Math.cos(angle), ny = Math.sin(angle);
          const tx = -ny, ty = nx;
          const x = px + nx * d, y = py + ny * d;
          const q = radialBoundaryQuality(x, y, nx, ny, tx, ty, d);
          if (q.coverage >= 0.52 && q.quality >= 0.135) {
            filled[i] = { d, x, y, angle, nx, ny, tx, ty, ...q, filled: true };
          }
        }
      }
    }

    // Angular median smoothing removes isolated artwork edges. A real gutter
    // should occupy a coherent angular neighborhood, while a speech balloon
    // or character contour tends to be a short-lived angular spike.
    const smoothed = filled.slice();
    for (let i = 0; i < rayCount; i++) {
      if (!filled[i]) continue;
      const ds = [];
      for (let k = -2; k <= 2; k++) {
        const q = filled[(i + k + rayCount) % rayCount];
        if (q) ds.push(q.d);
      }
      if (ds.length >= 3) {
        ds.sort((a, b) => a - b);
        const med = ds[Math.floor(ds.length / 2)];
        if (Math.abs(filled[i].d - med) / Math.max(1, med) > 0.42) {
          smoothed[i] = null;
        } else {
          smoothed[i] = { ...filled[i], d: 0.72 * filled[i].d + 0.28 * med };
          smoothed[i].x = px + smoothed[i].nx * smoothed[i].d;
          smoothed[i].y = py + smoothed[i].ny * smoothed[i].d;
        }
      }
    }

    const points = smoothed.filter(Boolean);
    const coverage = points.length / rayCount;
    if (coverage < 0.58) {
      if (log) log(`[V70] CONTOUR REJECTED coverage=${coverage.toFixed(3)}`);
      return null;
    }

    const distances = points.map(p => p.d).sort((a, b) => a - b);
    const medianD = distances[Math.floor(distances.length / 2)];
    const mad = distances.map(d => Math.abs(d - medianD)).sort((a, b) => a - b);
    const medianAbsDev = mad[Math.floor(mad.length / 2)];
    const radialConsistency = 1 - Math.min(1, medianAbsDev / Math.max(12, medianD));

    // Validate that the contour really surrounds the tap. Every ray with a
    // point represents an outward crossing from the tap into the candidate
    // gutter. We additionally compare the candidate distance to the image
    // limits so an accidental giant enclosure is penalized.
    const minD = distances[0];
    const maxD = distances[distances.length - 1];
    const spread = maxD / Math.max(1, minD);
    const closure = Math.max(0, 1 - Math.min(1, Math.abs(spread - 1.8) / 2.8));
    const evidence = points.reduce((sum, p) => sum + p.quality, 0) / points.length;
    const tangentCoverage = points.reduce((sum, p) => sum + p.coverage, 0) / points.length;

    // A second, deliberately independent test: sample a narrow ring just
    // inside and just outside the contour and verify that the transition is
    // coherent. This is the closest thing here to "is this actually a
    // gutter?" rather than merely "did I find lots of edges?".
    let ringInside = 0, ringOutside = 0, ringCount = 0;
    for (let i = 0; i < rayCount; i++) {
      const p = smoothed[i];
      if (!p) continue;
      const d = p.d;
      const x = px + p.nx * d, y = py + p.ny * d;
      ringInside += pixelTransition(x - p.nx * 8, y - p.ny * 8, x - p.nx * 2, y - p.ny * 2);
      ringOutside += pixelTransition(x + p.nx * 2, y + p.ny * 2, x + p.nx * 10, y + p.ny * 10);
      ringCount++;
    }
    ringInside /= Math.max(1, ringCount);
    ringOutside /= Math.max(1, ringCount);
    const ringEvidence = Math.min(1, (ringInside + ringOutside) * 2.2);

    const contourScore =
      0.28 * evidence +
      0.18 * tangentCoverage +
      0.22 * coverage +
      0.18 * radialConsistency +
      0.14 * ringEvidence;

    if (log) {
      log(`[V70] CONTOUR coverage=${coverage.toFixed(3)} evidence=${evidence.toFixed(3)} tangent=${tangentCoverage.toFixed(3)}`);
      log(`[V70] CONTOUR consistency=${radialConsistency.toFixed(3)} ring=${ringEvidence.toFixed(3)} score=${contourScore.toFixed(3)}`);
      log(`[V70] RADIAL min=${minD.toFixed(1)} median=${medianD.toFixed(1)} max=${maxD.toFixed(1)}`);
    }

    if (contourScore < 0.49 || coverage < 0.60 || radialConsistency < 0.32) {
      if (log) log(`[V70] GUTTER CONTOUR REJECTED — not a convincing enclosure`);
      return null;
    }

    // Convert the discovered contour to the bounding rectangle expected by
    // the existing zoom system. The contour itself remains available in the
    // diagnostic metadata, so future experiments can move to a true polygon
    // mask without changing the detection concept.
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    const x0 = clamp(Math.floor(Math.min(...xs) - 3), 0, w - 1);
    const x1 = clamp(Math.ceil(Math.max(...xs) + 3), 1, w);
    const y0 = clamp(Math.floor(Math.min(...ys) - 3), 0, h - 1);
    const y1 = clamp(Math.ceil(Math.max(...ys) + 3), 1, h);

    if (x1 <= x0 || y1 <= y0 || (x1 - x0) < 20 || (y1 - y0) < 20) {
      if (log) log(`[V70] INVALID CONTOUR BOUNDS`);
      return null;
    }

    const contour = points.map(p => ({
      x: Number((p.x / w).toFixed(5)),
      y: Number((p.y / h).toFixed(5))
    }));

    const panel = {
      x: clamp(x0 / w, 0, 1),
      y: clamp(y0 / h, 0, 1),
      w: clamp((x1 - x0) / w, 0, 1),
      h: clamp((y1 - y0) / h, 0, 1),
      __v68Method: "clean-gutter-boundary-radial-contour",
      __v68Score: contourScore,
      __v68Evidence: {
        rayCount,
        raysFound: foundCount,
        contourCoverage: coverage,
        radialConsistency,
        tangentCoverage,
        ringEvidence,
        medianRadius: medianD,
        minRadius: minD,
        maxRadius: maxD,
        contour
      }
    };

    if (log) {
      log(`[V70] GUTTER CONTOUR ACCEPTED`);
      log(`[V70] FINAL x=${panel.x.toFixed(4)} y=${panel.y.toFixed(4)} w=${panel.w.toFixed(4)} h=${panel.h.toFixed(4)}`);
      log(`[V70] METHOD=${panel.__v70Method} elapsed=${Math.round(performance.now() - started)}ms`);
    }

    return panel;
  }
};

window.PanelDetect = PanelDetect;
