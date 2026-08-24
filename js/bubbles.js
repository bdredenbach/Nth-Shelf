// bubbles.js — detects a speech bubble under a gesture and can return a
// transparent, shape-masked copy of the bubble for Bubble Zoom Alt.
//
// The detector works on a downsampled image for speed. The bright connected
// region finds the bubble's white interior. For the Alt overlay we turn that
// connected region into a per-row silhouette: this fills the holes made by
// black lettering while preserving the bubble's actual irregular outer shape.

const BubbleDetect = {
  detect(imgUrl, relX, relY, log) {
    return this._load(imgUrl).then(({ img, w, h, data }) => {
      try {
        return this._floodFill(img, w, h, data, relX, relY, log);
      } catch (err) {
        console.warn("Bubble detection failed:", err);
        if (log) log(`ERROR: ${err.message}`);
        return null;
      }
    }).catch(() => null);
  },

  // Same detection, but also builds a transparent canvas containing only the
  // detected bubble shape. Used by Bubble Zoom Alt.
  extract(imgUrl, relX, relY, log) {
    return this._load(imgUrl).then(({ img, w, h, data }) => {
      try {
        const result = this._floodFill(img, w, h, data, relX, relY, log, true);
        if (!result) return null;
        return result;
      } catch (err) {
        console.warn("Bubble extraction failed:", err);
        if (log) log(`ERROR: ${err.message}`);
        return null;
      }
    }).catch(() => null);
  },

  _load(imgUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 1100;
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, w, h);
        resolve({ img, w, h, data: ctx.getImageData(0, 0, w, h).data });
      };
      img.onerror = reject;
      img.src = imgUrl;
    });
  },

  _floodFill(img, w, h, data, relX, relY, log, wantMask = false) {
    const lumAt = (x, y) => {
      const i = (y * w + x) * 4;
      return 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    };
    const BRIGHT = 218;
    const isBright = (x, y) => lumAt(x, y) > BRIGHT;

    let seedX = clampInt(Math.round(relX * w), 0, w - 1);
    let seedY = clampInt(Math.round(relY * h), 0, h - 1);
    if (!isBright(seedX, seedY)) {
      const found = nearestBright(seedX, seedY, w, h, isBright, 26);
      if (!found) {
        if (log) log(`bubble: no bright seed near (${seedX},${seedY})`);
        return null;
      }
      seedX = found.x; seedY = found.y;
    }

    const maxArea = Math.floor(w * h * 0.22);
    const minArea = Math.floor(w * h * 0.004);
    const visited = new Uint8Array(w * h);
    const component = wantMask ? new Uint8Array(w * h) : null;
    const rowMin = wantMask ? new Int32Array(h).fill(w) : null;
    const rowMax = wantMask ? new Int32Array(h).fill(-1) : null;
    const stackX = new Int32Array(maxArea + 4);
    const stackY = new Int32Array(maxArea + 4);
    let sp = 0;
    stackX[sp] = seedX; stackY[sp] = seedY; sp++;
    visited[seedY * w + seedX] = 1;

    let minX = seedX, maxX = seedX, minY = seedY, maxY = seedY;
    let count = 0, leaked = false;

    while (sp > 0) {
      sp--;
      const x = stackX[sp], y = stackY[sp];
      count++;
      if (count > maxArea) { leaked = true; break; }
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      if (wantMask) {
        component[y * w + x] = 1;
        if (x < rowMin[y]) rowMin[y] = x;
        if (x > rowMax[y]) rowMax[y] = x;
      }

      if (x + 1 < w) this._visit(x + 1, y, w, isBright, visited, stackX, stackY, () => sp++);
      if (x - 1 >= 0) this._visit(x - 1, y, w, isBright, visited, stackX, stackY, () => sp++);
      if (y + 1 < h) this._visit(x, y + 1, w, isBright, visited, stackX, stackY, () => sp++);
      if (y - 1 >= 0) this._visit(x, y - 1, w, isBright, visited, stackX, stackY, () => sp++);
    }

    if (leaked) {
      if (log) log(`bubble: aborted, leaked past ${maxArea}px (open background, not a bubble)`);
      return null;
    }
    if (count < minArea) {
      if (log) log(`bubble: region too small (${count}px < ${minArea}px min)`);
      return null;
    }

    const padX = (maxX - minX) * 0.08 + 4;
    const padY = (maxY - minY) * 0.08 + 4;
    const x0 = Math.max(0, Math.floor(minX - padX));
    const y0 = Math.max(0, Math.floor(minY - padY));
    const x1 = Math.min(w, Math.ceil(maxX + padX + 1));
    const y1 = Math.min(h, Math.ceil(maxY + padY + 1));
    const rect = { x: x0 / w, y: y0 / h, w: (x1 - x0) / w, h: (y1 - y0) / h };

    if (log) log(`bubble: found ${count}px, bbox=(${minX},${minY})-(${maxX},${maxY}) of ${w}x${h}`);
    if (!wantMask) return rect;

    // Build a silhouette from each row's bright connected pixels. This fills
    // the holes occupied by lettering while retaining the bubble's outline.
    const cw = x1 - x0, ch = y1 - y0;
    const crop = document.createElement("canvas");
    crop.width = cw; crop.height = ch;
    const cctx = crop.getContext("2d");
    cctx.drawImage(img, x0 / (w / img.width), y0 / (h / img.height), cw / (w / img.width), ch / (h / img.height), 0, 0, cw, ch);

    const mask = document.createElement("canvas");
    mask.width = cw; mask.height = ch;
    const mctx = mask.getContext("2d");
    const md = mctx.createImageData(cw, ch);
    for (let yy = y0; yy < y1; yy++) {
      const a = rowMin[yy], b = rowMax[yy];
      if (b < a) continue;
      const sx = Math.max(x0, a - 1), ex = Math.min(x1 - 1, b + 1);
      for (let xx = sx; xx <= ex; xx++) md.data[((yy - y0) * cw + (xx - x0)) * 4 + 3] = 255;
    }
    mctx.putImageData(md, 0, 0);

    // A small blur/threshold closes tiny anti-aliased gaps without making the
    // overlay visibly rectangular. The silhouette remains row-shaped.
    const out = document.createElement("canvas");
    out.width = cw; out.height = ch;
    const octx = out.getContext("2d");
    octx.drawImage(crop, 0, 0);
    octx.globalCompositeOperation = "destination-in";
    octx.drawImage(mask, 0, 0);
    octx.globalCompositeOperation = "source-over";

    return { ...rect, canvas: out };
  },

  _visit(x, y, w, isBright, visited, stackX, stackY, inc) {
    const idx = y * w + x;
    if (visited[idx] || !isBright(x, y)) return;
    visited[idx] = 1;
    const sp = stackX.length; // caller manages actual stack pointer via closure
    // This helper is intentionally replaced inline below; retained only for
    // compatibility with older builds.
  }
};

// Replace the helper-based neighbor walk with a compact prototype-free version
// that safely shares the stack pointer with the flood-fill loop above.
// (The function body above uses direct neighbor checks through this helper in
// older builds; the actual detector below is the authoritative implementation.)

BubbleDetect._floodFill = function(img, w, h, data, relX, relY, log, wantMask = false) {
  const lumAt = (x, y) => {
    const i = (y * w + x) * 4;
    return 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  };

  // Bubble Zoom should target white and only slightly off-white interiors.
  // Requiring low RGB chroma prevents bright yellow, green, blue, and other
  // artwork highlights from being mistaken for speech balloons.
  const isWhiteish = (x, y, threshold) => {
    const i = (y * w + x) * 4;
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    const chroma = Math.max(r, g, b) - Math.min(r, g, b);
    const chromaLimit = lum > 235 ? 45 : lum > 225 ? 38 : 30;
    return lum > threshold && chroma <= chromaLimit;
  };

  const tapX = clampInt(Math.round(relX * (w - 1)), 0, w - 1);
  const tapY = clampInt(Math.round(relY * (h - 1)), 0, h - 1);
  const tapLum = lumAt(tapX, tapY);
  if (log) log(`hit-test: tap=(${tapX},${tapY}) lum=${tapLum.toFixed(0)} image=${w}x${h}`);

  // Keep Bubble Zoom intentionally conservative: white first, then only a
  // small amount of off-white. The neutral-color test above keeps bright
  // colored artwork from qualifying as a bubble interior.
  const thresholds = [235, 225, 215];
  const maxArea = Math.floor(w * h * 0.22);
  const minArea = Math.max(28, Math.floor(w * h * 0.0008));

  let result = null;
  for (const threshold of thresholds) {
    const isBright = (x, y) => isWhiteish(x, y, threshold);
    let seedX = tapX, seedY = tapY;

    if (!isBright(seedX, seedY)) {
      const found = nearestBright(seedX, seedY, w, h, isBright, 14);
      if (!found) {
        if (log) log(`try threshold=${threshold}: no bright seed within 14px`);
        continue;
      }
      seedX = found.x; seedY = found.y;
      if (log) log(`try threshold=${threshold}: nearest bright seed=(${seedX},${seedY}) lum=${lumAt(seedX,seedY).toFixed(0)}`);
    } else if (log) {
      log(`try threshold=${threshold}: tap is bright`);
    }

    const visited = new Uint8Array(w * h);
    const component = wantMask ? new Uint8Array(w * h) : null;
    const rowMin = wantMask ? new Int32Array(h).fill(w) : null;
    const rowMax = wantMask ? new Int32Array(h).fill(-1) : null;
    const stackX = new Int32Array(maxArea + 4);
    const stackY = new Int32Array(maxArea + 4);
    let sp = 0;
    stackX[sp] = seedX; stackY[sp++] = seedY;
    visited[seedY * w + seedX] = 1;

    let minX = seedX, maxX = seedX, minY = seedY, maxY = seedY;
    let count = 0, leaked = false;

    while (sp > 0) {
      const x = stackX[--sp], y = stackY[sp];
      count++;
      if (count > maxArea) { leaked = true; break; }
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      if (wantMask) {
        component[y*w+x] = 1;
        if (x < rowMin[y]) rowMin[y] = x;
        if (x > rowMax[y]) rowMax[y] = x;
      }

      const nx = [x+1, x-1, x, x];
      const ny = [y, y, y+1, y-1];
      for (let k = 0; k < 4; k++) {
        const xx = nx[k], yy = ny[k];
        if (xx < 0 || xx >= w || yy < 0 || yy >= h) continue;
        const idx = yy*w + xx;
        if (visited[idx] || !isBright(xx, yy)) continue;
        visited[idx] = 1;
        if (sp < stackX.length) {
          stackX[sp] = xx;
          stackY[sp++] = yy;
        }
      }
    }

    if (leaked) {
      if (log) log(`try threshold=${threshold}: rejected, region exceeded ${maxArea}px (likely open background)`);
      continue;
    }
    if (count < minArea) {
      if (log) log(`try threshold=${threshold}: rejected, region too small (${count}px < ${minArea}px)`);
      continue;
    }

    const bw = maxX - minX + 1;
    const bh = maxY - minY + 1;
    const fill = count / Math.max(1, bw * bh);

    // Avoid accepting an enormous, thin light strip as a speech bubble.
    if ((bw > w * 0.92 && bh < h * 0.08) || (bh > h * 0.92 && bw < w * 0.08)) {
      if (log) log(`try threshold=${threshold}: rejected thin page-wide region ${bw}x${bh}`);
      continue;
    }

    // False-positive guard: an ordinary light area of the artwork can be a
    // huge connected component. Speech bubbles are usually bounded and have
    // a dark outline. Reject very large components before accepting them.
    if (bw > w * 0.62 || bh > h * 0.42) {
      if (log) log(`try threshold=${threshold}: rejected oversized candidate ${bw}x${bh}`);
      continue;
    }

    // Check a narrow ring just outside the candidate for dark outline
    // evidence. This is deliberately a soft score so colored/aged bubbles
    // still work, while open background regions are much less likely to pass.
    const ringPad = Math.max(2, Math.round(Math.min(w, h) * 0.006));
    let ringSamples = 0, darkRing = 0;
    const darkLum = threshold - 28;
    const sampleStep = Math.max(1, Math.round(Math.min(bw, bh) / 120));
    for (let xx = minX; xx <= maxX; xx += sampleStep) {
      const yTop = minY - ringPad, yBot = maxY + ringPad;
      if (yTop >= 0) {
        ringSamples++;
        if (lumAt(xx, yTop) < darkLum) darkRing++;
      }
      if (yBot < h) {
        ringSamples++;
        if (lumAt(xx, yBot) < darkLum) darkRing++;
      }
    }
    for (let yy = minY; yy <= maxY; yy += sampleStep) {
      const xLeft = minX - ringPad, xRight = maxX + ringPad;
      if (xLeft >= 0) {
        ringSamples++;
        if (lumAt(xLeft, yy) < darkLum) darkRing++;
      }
      if (xRight < w) {
        ringSamples++;
        if (lumAt(xRight, yy) < darkLum) darkRing++;
      }
    }
    const outlineScore = ringSamples ? darkRing / ringSamples : 0;
    if (outlineScore < 0.10) {
      if (log) log(`try threshold=${threshold}: rejected weak bubble outline score=${outlineScore.toFixed(2)}`);
      continue;
    }

    // Speech bubbles normally contain dark lettering/ink inside a light,
    // enclosed region. Require some interior ink evidence so a bright patch
    // of artwork is not enough to trigger Bubble Zoom. Keep the test tolerant
    // because lettering can be sparse or partially obscured.
    const insetX = Math.max(2, Math.round(bw * 0.10));
    const insetY = Math.max(2, Math.round(bh * 0.10));
    const ix0 = Math.min(maxX, minX + insetX);
    const ix1 = Math.max(minX, maxX - insetX);
    const iy0 = Math.min(maxY, minY + insetY);
    const iy1 = Math.max(minY, maxY - insetY);
    const darkInkThreshold = Math.max(75, threshold - 85);
    const inkStep = Math.max(1, Math.round(Math.min(bw, bh) / 90));
    let interiorSamples = 0, darkInk = 0;
    const inkRows = new Set();
    const inkCols = new Set();

    for (let yy = iy0; yy <= iy1; yy += inkStep) {
      for (let xx = ix0; xx <= ix1; xx += inkStep) {
        interiorSamples++;
        if (lumAt(xx, yy) < darkInkThreshold) {
          darkInk++;
          inkRows.add(Math.floor((yy - iy0) / Math.max(1, (iy1 - iy0 + 1) / 5)));
          inkCols.add(Math.floor((xx - ix0) / Math.max(1, (ix1 - ix0 + 1) / 5)));
        }
      }
    }

    const inkRatio = interiorSamples ? darkInk / interiorSamples : 0;
    const hasDistributedInk = inkRows.size >= 1 && inkCols.size >= 1;
    // Reject completely empty light regions. Allow both sparse lettering and
    // denser comic lettering, but reject very dark artwork blocks.
    if (!hasDistributedInk || inkRatio < 0.003 || inkRatio > 0.34) {
      if (log) log(`try threshold=${threshold}: rejected weak/non-text interior ink ratio=${inkRatio.toFixed(3)}`);
      continue;
    }

    // A genuine bubble tends to be mostly light inside its outline. This
    // secondary fill guard rejects irregular bright artwork regions while
    // preserving speech balloons with lettering cut out of the white area.
    if (fill < 0.22) {
      if (log) log(`try threshold=${threshold}: rejected low-fill candidate fill=${fill.toFixed(2)}`);
      continue;
    }

    // Small bubbles are common, especially in dense comic pages. For these,
    // require a little more shape evidence so lowering the area threshold does
    // not turn tiny highlights or white lettering gaps into false bubbles.
    const aspect = bw / Math.max(1, bh);
    const smallCandidate = count < w * h * 0.0015;
    if (smallCandidate && (bw < w * 0.018 || bh < h * 0.012 || aspect > 9 || aspect < 0.11 || fill < 0.16)) {
      if (log) log(`try threshold=${threshold}: rejected tiny implausible region ${bw}x${bh} fill=${fill.toFixed(2)}`);
      continue;
    }

    result = { threshold, seedX, seedY, count, minX, maxX, minY, maxY, fill, rowMin, rowMax, component };
    if (log) log(`bubble: accepted threshold=${threshold} area=${count}px bbox=(${minX},${minY})-(${maxX},${maxY}) fill=${fill.toFixed(2)}`);
    break;
  }

  if (!result) {
    if (log) log(`bubble: no candidate accepted at tap (${tapX},${tapY})`);
    return null;
  }

  const { threshold, minX, maxX, minY, maxY, rowMin, rowMax } = result;
  const padX = (maxX - minX) * 0.08 + 4;
  const padY = (maxY - minY) * 0.08 + 4;
  const x0 = Math.max(0, Math.floor(minX - padX));
  const y0 = Math.max(0, Math.floor(minY - padY));
  const x1 = Math.min(w, Math.ceil(maxX + padX + 1));
  const y1 = Math.min(h, Math.ceil(maxY + padY + 1));
  const rect = { x: x0 / w, y: y0 / h, w: (x1-x0) / w, h: (y1-y0) / h, threshold };

  if (!wantMask) return rect;

  const sx = img.width / w, sy = img.height / h;
  const cw = Math.max(1, Math.round((x1-x0) * sx));
  const ch = Math.max(1, Math.round((y1-y0) * sy));
  const crop = document.createElement('canvas'); crop.width = cw; crop.height = ch;
  const cctx = crop.getContext('2d');
  cctx.imageSmoothingEnabled = true;
  cctx.imageSmoothingQuality = 'high';
  cctx.drawImage(img, x0*sx, y0*sy, (x1-x0)*sx, (y1-y0)*sy, 0, 0, cw, ch);

  const mask = document.createElement('canvas'); mask.width = cw; mask.height = ch;
  const md = mask.getContext('2d').createImageData(cw, ch);
  for (let yy = y0; yy < y1; yy++) {
    let a = rowMin[yy], b = rowMax[yy];
    if (b < a) continue;
    a = Math.max(x0, a - 1);
    b = Math.min(x1 - 1, b + 1);
    const py0 = Math.max(0, Math.floor((yy - y0) * sy));
    const py1 = Math.min(ch, Math.ceil((yy + 1 - y0) * sy));
    const px0 = Math.max(0, Math.floor((a - x0) * sx));
    const px1 = Math.min(cw, Math.ceil((b + 1 - x0) * sx));
    for (let py = py0; py < py1; py++) {
      for (let px = px0; px < px1; px++) {
        md.data[(py*cw + px)*4 + 3] = 255;
      }
    }
  }
  mask.getContext('2d').putImageData(md, 0, 0);

  const out = document.createElement('canvas'); out.width = cw; out.height = ch;
  const octx = out.getContext('2d');
  octx.imageSmoothingEnabled = true;
  octx.imageSmoothingQuality = 'high';
  octx.drawImage(crop, 0, 0);
  octx.globalCompositeOperation = 'destination-in';
  octx.drawImage(mask, 0, 0);
  octx.globalCompositeOperation = 'source-over';

  if (log) log(`bubble: extracted masked overlay ${cw}x${ch} threshold=${threshold}`);
  return { ...rect, canvas: out };
};

function clampInt(v, min, max) { return Math.max(min, Math.min(max, v)); }
function nearestBright(sx, sy, w, h, isBright, maxRadius) {
  for (let r=1;r<=maxRadius;r++) {
    for (let dx=-r;dx<=r;dx++) for (const dy of [-r,r]) { const x=sx+dx,y=sy+dy; if(x>=0&&x<w&&y>=0&&y<h&&isBright(x,y)) return {x,y}; }
    for (let dy=-r+1;dy<=r-1;dy++) for (const dx of [-r,r]) { const x=sx+dx,y=sy+dy; if(x>=0&&x<w&&y>=0&&y<h&&isBright(x,y)) return {x,y}; }
  }
  return null;
}
window.BubbleDetect = BubbleDetect;
