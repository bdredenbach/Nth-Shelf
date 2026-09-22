#!/usr/bin/env python3
"""Research-only pale-rim proposals. NOT loaded by the reader or service worker.

Combines exterior dark matte with observed thin pale strokes. Short joins need
opposing endpoint tangents. A bounded five-cell layout is returned only while
its unresolved terminal pair remains withheld. No title, filename, page number,
image fingerprint, OCR, or stored crop coordinates select geometry.

The CLI reads a browser-exported RGBA raster for deterministic comparison:
  python propose_pale_rims.py --rgba image.rgba --width 585 --height 900 --out out
Dependencies: numpy, scipy, scikit-image, Pillow. Input images stay local.
"""
from __future__ import annotations
import argparse
import json
from pathlib import Path
import numpy as np
from scipy import ndimage as ndi
from skimage.morphology import skeletonize
from PIL import Image


def _components(mask):
    labels, _ = ndi.label(mask)
    sizes = np.bincount(labels.ravel())
    boxes = ndi.find_objects(labels)
    return labels, sizes, boxes


def _box(s):
    return [s[1].start, s[0].start, s[1].stop, s[0].stop]


def _line(a, b):
    """Integer Bresenham pixels, including both measured endpoints."""
    x, y = a
    tx, ty = b
    dx, dy = abs(tx-x), -abs(ty-y)
    sx, sy = (1 if x < tx else -1), (1 if y < ty else -1)
    error = dx + dy
    while True:
        yield x, y
        if x == tx and y == ty:
            break
        twice = 2 * error
        if twice >= dy:
            error += dy
            x += sx
        if twice <= dx:
            error += dx
            y += sy


def propose(rgb: np.ndarray):
    if rgb.ndim != 3 or rgb.shape[2] != 3 or rgb.dtype != np.uint8:
        raise ValueError('Expected H x W x 3 uint8 raster')
    h, w = rgb.shape[:2]
    empty = np.zeros((h, w), np.uint8)
    if not (250 <= w <= 900 and 350 <= h <= 900):
        return empty, {'proposalContextMatched': False, 'reason': 'unsupported analysis size'}
    # A measured near-black perimeter, not a guessed universal page background.
    dark = rgb.max(2) < 25
    perimeter = np.r_[dark[0], dark[-1], dark[:, 0], dark[:, -1]]
    if perimeter.mean() < .94:
        return empty, {'proposalContextMatched': False, 'reason': 'no near-black perimeter'}
    dl, _, _ = _components(dark)
    ids = np.unique(np.r_[dl[0], dl[-1], dl[:, 0], dl[:, -1]])
    outside = np.isin(dl, ids[ids != 0])
    pale = rgb.min(2) > 90
    # One-pixel sampling closure; never a large shape-completion kernel.
    rim = ndi.binary_closing(pale, structure=np.ones((3, 3)))
    skeleton = skeletonize(rim)

    def neighbours(p, previous=None):
        x, y = p
        return [(x+dx, y+dy) for dy in (-1, 0, 1) for dx in (-1, 0, 1)
                if (dx or dy) and 0 <= x+dx < w and 0 <= y+dy < h
                and skeleton[y+dy, x+dx] and (x+dx, y+dy) != previous]

    ends = []
    for y, x in np.argwhere(skeleton):
        start = (int(x), int(y))
        if len(neighbours(start)) != 1:
            continue
        path = [start]
        for _ in range(12):
            ns = neighbours(path[-1], path[-2] if len(path) > 1 else None)
            if len(ns) != 1:
                break
            path.append(ns[0])
        if len(path) < 6:
            continue
        direction = np.asarray(start)-np.asarray(path[-1])
        norm = float(np.linalg.norm(direction))
        if norm:
            ends.append((start, direction/norm, path))
    # Hard resource bounds: unknown busy line networks defer, not partial scans.
    if len(ends) > 1800:
        return empty, {'proposalContextMatched': False, 'reason': 'endpoint budget exceeded'}
    joined = rim.copy()
    joins = []
    for i, (a, va, pa) in enumerate(ends):
        for b, vb, pb in ends[i+1:]:
            delta = np.asarray(b)-np.asarray(a)
            length = float(np.linalg.norm(delta))
            if not 2 <= length <= 22:
                continue
            direction = delta/length
            if np.dot(direction, va) < .55 or np.dot(-direction, vb) < .55:
                continue
            for x, y in _line(a, b):
                joined[y, x] = True
            joins.append({'a': list(a), 'b': list(b), 'length': length,
                          'leftWitness': pa, 'rightWitness': pb})
    labels, sizes, boxes = _components(~(joined | outside))
    large = [k for k in range(1, len(sizes)) if sizes[k] > w*h*.018]
    group = [(k, _box(boxes[k-1])) for k in large]
    group.sort(key=lambda v: (v[1][1], v[1][0]))
    # This is a deliberately bounded partial stack, not a general acceptance rule.
    # The terminal composite is needed as context but MUST NOT become a panel.
    report = {'proposalContextMatched': False, 'researchOnly': True, 'analysisWidth': w,
              'analysisHeight': h, 'endpointCount': len(ends), 'joins': joins,
              'largeCores': [{'id': k, 'box': b, 'pixels': int(sizes[k])}
                             for k, b in group]}
    if len(group) != 6:
        report['reason'] = 'not a complete bounded partial-stack context'
        return empty, report
    b = [v[1] for v in group]
    wide = lambda q: q[0] < w*.08 and q[2] > w*.92
    good = all(wide(q) and h*.05 < q[3]-q[1] < h*.30 for q in b[:3])
    good &= wide(b[3]) and h*.20 < b[3][3]-b[3][1] < h*.50
    good &= b[4][0] < w*.08 and w*.35 < b[4][2]-b[4][0] < w*.65
    good &= b[4][3] > h*.92 and b[4][3]-b[4][1] > h*.25
    good &= b[5][0] > w*.40 and b[5][2] > w*.92 and b[5][3] > h*.92
    if not good:
        report['reason'] = 'partial-stack witnesses do not agree'
        return empty, report
    owner = np.zeros((h, w), np.uint8)
    for number, (k, _) in enumerate(group, 1):
        owner[ndi.binary_fill_holes(labels == k)] = number
    # An observed, bounded pale rim collar; do not grow through exterior matte.
    distance, indices = ndi.distance_transform_edt(owner == 0, return_indices=True)
    nearest = owner[tuple(indices)]
    collar = (distance <= 3) & ~outside
    owner[collar] = nearest[collar]
    spread = rgb.max(2).astype(np.int16)-rgb.min(2)
    neutral = (rgb.min(2) > 230) & (spread < 28)
    nl, ns, nb = _components(neutral)
    balloons = []
    for k in range(1, len(ns)):
        if ns[k] < 160 or nb[k-1] is None:
            continue
        box = _box(nb[k-1])
        if ns[k]/((box[2]-box[0])*(box[3]-box[1])) < .34:
            continue
        core = ndi.binary_fill_holes(nl == k)
        ring = ndi.binary_dilation(core, iterations=4) & ~core
        votes = np.bincount(owner[ring], minlength=7)
        votes[0] = 0
        chosen = int(votes.argmax())
        total = int(votes.sum())
        if not total or votes[chosen]/total < .78:
            report['reason'] = 'ambiguous crossing balloon owner'
            return empty, report
        shape = ndi.binary_dilation(core, iterations=2)
        owner[shape] = chosen
        balloons.append({'box': box, 'owner': chosen, 'votes': votes.tolist(),
                         'whitePixels': int(ns[k]), 'footprintPixels': int(shape.sum())})
    report.update(proposalContextMatched=True, emittedCount=5, unresolvedTerminalCompositeCount=1,
                  terminalPairEmitted=False, balloons=balloons,
                  coreOrder=[v[0] for v in group])
    owner[owner == 6] = 0
    return owner, report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--rgba', type=Path, required=True)
    parser.add_argument('--width', type=int, required=True)
    parser.add_argument('--height', type=int, required=True)
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    data = np.frombuffer(args.rgba.read_bytes(), dtype=np.uint8)
    if data.size != args.width*args.height*4:
        raise SystemExit('RGBA size does not match width and height')
    rgb = data.reshape(args.height, args.width, 4)[:, :, :3].copy()
    labels, report = propose(rgb)
    args.out.mkdir(parents=True, exist_ok=True)
    (args.out/'proposal-report.json').write_text(json.dumps(report, indent=2)+'\n')
    Image.fromarray(labels).save(args.out/'proposal-labels.png')
    for number in range(1, 6):
        mask = labels == number
        ys, xs = np.where(mask)
        if not len(xs):
            continue
        box = (int(xs.min()), int(ys.min()), int(xs.max()+1), int(ys.max()+1))
        rgba = np.dstack([rgb, mask.astype(np.uint8)*255])
        Image.fromarray(rgba).crop(box).save(args.out/f'proposal-{number}.png')
    print(json.dumps({k: v for k, v in report.items() if k not in {'joins', 'balloons'}}, indent=2))


if __name__ == '__main__':
    main()
