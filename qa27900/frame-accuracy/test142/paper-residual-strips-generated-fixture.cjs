'use strict';
// Independently generated pixels shared by the public cache-boundary contract.
function fixture(canvas, seed, mode = 'positive') {
  const width = [680, 790, 880][seed % 3];
  const height = [550, 620, 680][seed % 3];
  const surface = canvas.createCanvas(width, height);
  const g = surface.getContext('2d');
  const paper = ['#ffffff', '#faf7f3', '#f4f8f5'][seed % 3];
  const ink = ['#202026', '#29221f', '#222b25'][seed % 3];
  const top = 21 + (seed % 4) * 7;
  const left = 11 + (seed % 3) * 6;
  const right = width - 13 - (seed % 4) * 5;
  const bottom = top + Math.round(height * .39);
  const row = top + Math.round((bottom - top) * .70);
  const middle = Math.round((left + right) / 2) + (seed % 3 - 1) * 7;
  const gapWidth = Math.round(width * (.060 + (seed % 3) * .007));
  const gapLeft = middle - Math.floor(gapWidth / 2);
  const gapRight = gapLeft + gapWidth;
  g.fillStyle = paper;
  g.fillRect(0, 0, width, height);
  g.fillStyle = ['#456181', '#a66d62', '#486653'][seed % 3];
  g.fillRect(left, top, right - left, bottom - top);
  g.fillStyle = ['#8c7139', '#467f83', '#836a88'][seed % 3];
  g.fillRect(left, row + 4, right - left, bottom - row - 4);

  // Irregular original hatch marks make the upper scene non-uniform without
  // introducing other paper seams or enclosed speech shapes.
  for (let k = 0; k < 150; k++) {
    g.fillStyle = k % 2 ? ink : '#d8b779';
    g.fillRect(left + (k * 137 + seed * 23) % (right - left - 10),
      top + (k * 43) % (row - top - 12), 3 + k % 6, 2 + k % 3);
  }
  if (mode !== 'missing-seam') {
    g.fillStyle = ink;
    g.fillRect(left, row - 3, right - left, 3);
    g.fillStyle = paper;
    g.fillRect(left, row, right - left, 5);
  }
  if (mode === 'ambiguous-seam') {
    g.fillStyle = ink;
    g.fillRect(left, row - 21, right - left, 3);
    g.fillStyle = paper;
    g.fillRect(left, row - 18, right - left, 5);
  }

  const group = new Uint8Array(width * height);
  for (let y = top; y < bottom; y++) {
    for (let x = left; x < right; x++) group[y * width + x] = 1;
  }
  if (mode !== 'missing-gap') {
    g.fillStyle = mode === 'bad-gap-paper' ? '#b7b7b7' : paper;
    g.fillRect(gapLeft, row + 5, gapWidth, bottom - row - 5);
    for (let y = row; y < bottom; y++) {
      for (let x = gapLeft; x < gapRight; x++) group[y * width + x] = 0;
    }
  }
  if (mode === 'third-fragment') {
    const x = right - Math.round(width * .045);
    g.fillStyle = paper;
    g.fillRect(x, row, 7, bottom - row);
    for (let y = row; y < bottom; y++) {
      for (let dx = 0; dx < 7; dx++) group[y * width + x + dx] = 0;
    }
  }

  const bodies = [];
  for (const [bodyIndex, x] of [Math.round((left + gapLeft) / 2), Math.round((gapRight + right) / 2)].entries()) {
    if (mode === 'missing-speech' && bodyIndex === 0) continue;
    const y = row - 7;
    const rx = 43 + seed % 5;
    const ry = 27 + seed % 3;
    // The missing-tail control affects only one strip. Its unaccounted closed
    // oval may itself make the seam uncertain, which must also reject the cut.
    const hasTail = mode !== 'severed-tail' && !(mode === 'missing-tail' && bodyIndex === 0);
    const upward = mode === 'upward-tail';
    const tailAt = upward ? 48 : 16;
    g.fillStyle = paper;
    g.strokeStyle = ink;
    g.lineWidth = 2;
    g.beginPath();
    for (let z = 0; z <= 64; z++) {
      if (hasTail && z === tailAt - 2) {
        g.lineTo(x + 20, y + (upward ? -ry - 25 : ry + 25));
        z = tailAt + 2;
      }
      const angle = z * Math.PI / 32;
      const xx = x + rx * Math.cos(angle);
      const yy = y + ry * Math.sin(angle);
      if (z === 0) g.moveTo(xx, yy);
      else g.lineTo(xx, yy);
    }
    g.closePath();
    g.fill();
    g.stroke();
    if (mode === 'severed-tail') {
      g.beginPath();
      g.moveTo(x + 6, y + ry + 5);
      g.lineTo(x + 20, y + ry + 25);
      g.lineTo(x - 3, y + ry + 5);
      g.closePath();
      g.fill();
      g.stroke();
    }
    g.fillStyle = ink;
    for (let ty = -13; ty <= 11; ty += 8) {
      for (let tx = -24; tx <= 24; tx += 8) g.fillRect(x + tx, y + ty, 3, 4);
    }
    bodies.push({ x, y });
  }
  const rgba = g.getImageData(0, 0, width, height).data;
  if (mode === 'transparent') rgba[3] = 254;
  return { rgba, width, height, group, row, bodies, gapLeft, gapRight, bottom };
}


module.exports={fixture};
