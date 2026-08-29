// NTH SHELF V75 — ADAPTIVE GUTTER BASELINE
//
// Fresh experiment built directly from the v2.76 Stable gutter detector.
// All V74 and other later experimental panel-selection logic is intentionally
// absent from this file.
//
// New idea: keep the stable whole-row/whole-column gutter model, but stop
// assuming that luminance stddev < 10 is universal. Instead, evaluate several
// conservative thresholds and choose the simplest plausible page partition.
// This is still gutter-first: no artwork-edge tracing, no parent/child
// hierarchy, no smallest-child selection, no recursive subdivision.

const PanelDetect = {
  detect(imgUrl, log) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        try {
          resolve(this._analyze(img, log));
        } catch (err) {
          console.warn("V75 panel detection failed:", err);
          if (log) log(`ERROR: ${err.message}`);
          resolve([]);
        }
      };
      img.onerror = () => resolve([]);
      img.src = imgUrl;
    });
  },

  _analyze(img, log) {
    const maxDim = 900;
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));
    if (log) log(`V75 source=${img.width}x${img.height} downscaled=${w}x${h}`);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h).data;

    const lum = new Float32Array(w * h);
    for (let i = 0, p = 0; i < data.length; i += 4, p++) {
      lum[p] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    }
    const lumAt = (x, y) => lum[y * w + x];

    const rowStd = new Array(h);
    for (let y = 0; y < h; y++) {
      let sum = 0, sumSq = 0;
      for (let x = 0; x < w; x++) {
        const v = lumAt(x, y);
        sum += v;
        sumSq += v * v;
      }
      const mean = sum / w;
      rowStd[y] = Math.sqrt(Math.max(0, sumSq / w - mean * mean));
    }

    const thresholds = [6, 8, 10, 12, 15, 18, 22, 26];
    const minRowGutter = Math.max(2, Math.round(h * 0.006));
    const minColGutter = Math.max(2, Math.round(w * 0.006));
    const candidates = [];

    for (const threshold of thresholds) {
      const strips = splitByGutter(rowStd, h, threshold, minRowGutter);
      const panels = [];

      for (const [sy, ey] of strips) {
        const stripH = ey - sy;
        if (stripH < h * 0.05) continue;

        const colStd = new Array(w);
        for (let x = 0; x < w; x++) {
          let sum = 0, sumSq = 0;
          for (let y = sy; y < ey; y++) {
            const v = lumAt(x, y);
            sum += v;
            sumSq += v * v;
          }
          const mean = sum / stripH;
          colStd[x] = Math.sqrt(Math.max(0, sumSq / stripH - mean * mean));
        }

        const cols = splitByGutter(colStd, w, threshold, minColGutter);
        for (const [sx, ex] of cols) {
          const pw = ex - sx;
          if (pw < w * 0.05) continue;
          panels.push({ x: sx / w, y: sy / h, w: pw / w, h: stripH / h });
        }
      }

      const score = scorePartition(panels, w, h, threshold);
      candidates.push({ threshold, panels, score });
      if (log) log(`V75 threshold=${threshold} strips=${strips.length} panels=${panels.length} score=${score.toFixed(3)}`);
    }

    // Prefer a plausible multi-panel partition, with a bias toward the
    // lowest threshold that reaches that quality. This preserves the stable
    // detector's conservative behavior while allowing pages whose gutters are
    // slightly noisier than the old fixed threshold of 10.
    const usable = candidates.filter((c) => c.panels.length >= 2 && c.panels.length <= 30);
    if (!usable.length) {
      if (log) log("V75 -> no plausible multi-panel partition");
      return [];
    }

    usable.sort((a, b) => b.score - a.score || a.threshold - b.threshold);
    const best = usable[0];

    if (log) {
      log(`V75 selected threshold=${best.threshold} panels=${best.panels.length} score=${best.score.toFixed(3)}`);
      log(`V75 selected panels=${JSON.stringify(best.panels.slice(0, 20))}`);
    }

    return best.panels;
  },
};

function scorePartition(panels, w, h, threshold) {
  if (panels.length <= 1) return -10;

  let area = 0;
  let tiny = 0;
  let huge = 0;
  for (const p of panels) {
    const a = p.w * p.h;
    area += a;
    if (a < 0.015) tiny++;
    if (a > 0.70) huge++;
  }

  const coverage = Math.min(1, area);
  const tinyPenalty = tiny / panels.length;
  const hugePenalty = huge / panels.length;

  // Mild complexity penalty: when two thresholds both make sensible panels,
  // favor the simpler partition. Threshold itself is only a tiny tie-breaker.
  const complexityPenalty = Math.max(0, panels.length - 12) * 0.025;
  const thresholdPenalty = Math.max(0, threshold - 12) * 0.002;

  return coverage
    - tinyPenalty * 0.55
    - hugePenalty * 0.25
    - complexityPenalty
    - thresholdPenalty;
}

function splitByGutter(arr, total, thresh, minGutterRun) {
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
        if (gutterRunStart - contentStart > 0) spans.push([contentStart, gutterRunStart]);
        contentStart = i;
      }
    }
  }

  if (total - contentStart > 0) spans.push([contentStart, total]);
  return spans;
}

window.PanelDetect = PanelDetect;
