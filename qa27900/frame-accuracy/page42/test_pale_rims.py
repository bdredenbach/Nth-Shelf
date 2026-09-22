#!/usr/bin/env python3
"""Local research checks. These are NOT native/Reader/Page Deck acceptance tests.
Comic fixtures are supplied locally and are never copied to Git or app assets.
"""
import argparse
import base64
import hashlib
import json
from pathlib import Path
import zipfile
import numpy as np
from scipy import ndimage as ndi
from PIL import Image
from playwright.sync_api import sync_playwright
from propose_pale_rims import propose


def trace(mask):
    h, w = mask.shape
    edges = []
    successors = {}
    def add(a, b, direction):
        k = len(edges)
        edges.append((a, b, direction))
        successors.setdefault(a, []).append(k)
    for y, x in np.argwhere(mask):
        x, y = int(x), int(y)
        if not y or not mask[y-1, x]: add((x, y), (x+1, y), 0)
        if x+1 == w or not mask[y, x+1]: add((x+1, y), (x+1, y+1), 1)
        if y+1 == h or not mask[y+1, x]: add((x+1, y+1), (x, y+1), 2)
        if not x or not mask[y, x-1]: add((x, y+1), (x, y), 3)
    used = set()
    rings = []
    for seed in range(len(edges)):
        if seed in used: continue
        here = seed
        points = []
        while here not in used:
            a, b, direction = edges[here]
            used.add(here)
            points.append(a)
            if b == edges[seed][0]: break
            options = [k for k in successors.get(b, []) if k not in used]
            if not options: raise AssertionError('open contour')
            here = min(options, key=lambda k: {1: 0, 0: 1, 3: 2, 2: 3}[(edges[k][2]-direction) % 4])
        else: raise AssertionError('reused edge before closure')
        q = []
        for i, p in enumerate(points):
            a, b = points[i-1], points[(i+1) % len(points)]
            if (p[0]-a[0])*(b[1]-p[1]) != (p[1]-a[1])*(b[0]-p[0]): q.append(p)
        rings.append(q)
    return rings


def inside(rings, x, y):
    hit = False
    for ring in rings:
        for i, a in enumerate(ring):
            b = ring[i-1]
            if (a[1] > y) != (b[1] > y) and x < (b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]:
                hit = not hit
    return hit


TAPS = [
 [(25,60),(90,75),(215,80),(365,80),(551,80),(210,40),(260,123),(488,132),(548,130)],
 [(23,195),(109,200),(213,209),(307,220),(460,203),(525,193),(335,252),(421,214),(550,187)],
 [(28,310),(73,300),(168,311),(268,307),(359,323),(464,315),(550,286),(210,353),(270,357)],
 [(25,391),(123,417),(208,455),(310,447),(417,438),(536,454),(326,552),(231,576),(310,655)],
 [(24,512),(80,636),(102,699),(79,815),(242,696),(295,734),(247,852),(166,860),(316,864)]
]


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--comic', type=Path, required=True)
    ap.add_argument('--out', type=Path, required=True)
    ap.add_argument('--browser', default='/usr/bin/chromium')
    args = ap.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(args.comic) as archive:
        names = sorted(n for n in archive.namelist() if Path(n).suffix.lower() in {'.jpg', '.jpeg', '.png'})
        data = archive.read(names[41]) # Explicit QA fixture index, never a detector lookup.
    url = 'data:image/jpeg;base64,'+base64.b64encode(data).decode()
    with sync_playwright() as pw:
        browser = pw.chromium.launch(executable_path=args.browser, headless=True)
        page = browser.new_page()
        page.set_content('<html><body></body></html>')
        raw = page.evaluate('''async url => {
          const image = new Image(); image.src = url; await image.decode();
          const c = document.createElement('canvas'); c.height = 900;
          c.width = Math.round(image.width * c.height / image.height);
          const ctx = c.getContext('2d'); ctx.drawImage(image,0,0,c.width,c.height);
          return {w:c.width,h:c.height,rgba:Array.from(ctx.getImageData(0,0,c.width,c.height).data)};
        }''', url)
        w, h = raw['w'], raw['h']
        rgba = np.asarray(raw['rgba'], np.uint8).reshape(h,w,4)
        rgb = rgba[:,:,:3].copy()
        labels, report = propose(rgb)
        assert report.get('proposalContextMatched') and report['emittedCount'] == 5, report
        assert not report['terminalPairEmitted']
        rings = [trace(labels == i) for i in range(1,6)]
        # Cell-edge contours include small interior holes; they are not detached
        # panels. Preserve every ring and test its actual raster below. Report
        # connectivity separately instead of mistaking holes for extra panels.
        connectivity = []
        for i, contours in enumerate(rings, 1):
            cc, _ = ndi.label(labels == i)
            sizes = sorted(np.bincount(cc.ravel())[1:].tolist(), reverse=True)
            connectivity.append({'panel': i, 'componentPixels': sizes,
                                 'ringCount': len(contours)})
        tests = []
        for number, points in enumerate(TAPS,1):
            for x,y in points:
                selected = [i for i,r in enumerate(rings,1) if inside(r,x+.5,y+.5)]
                ok = selected == [number]
                tests.append({'kind':'proposal-hit','pixel':[x,y],'expected':number,'actual':selected,'pass':ok})
        for number, point in [(3,(35,220)),(4,(20,640)),(5,(300,520))]:
            ok = not inside(rings[number-1],point[0]+.5,point[1]+.5)
            tests.append({'kind':'bounding-box-exclusion','panel':number,'pixel':point,'pass':ok})
        for x,y in [(0,0),(375,720),(525,620)]:
            tests.append({'kind':'unresolved-or-outside-withheld','pixel':[x,y],
                          'pass':not any(inside(r,x+.5,y+.5) for r in rings)})
        # Independent browser canvas rasterization of exact cell-edge contours.
        canvas_checks = []
        for i,r in enumerate(rings,1):
            rendered = page.evaluate('''({w,h,r}) => {
              const c=document.createElement('canvas');c.width=w;c.height=h;
              const ctx=c.getContext('2d');ctx.beginPath();
              for(const q of r){q.forEach((p,j)=>j?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();}
              ctx.fillStyle='#fff';ctx.fill('evenodd');
              return Array.from(ctx.getImageData(0,0,w,h).data).filter((_,k)=>k%4===3);
            }''', {'w':w,'h':h,'r':r})
            expected = (labels == i).astype(np.uint8)*255
            actual = np.asarray(rendered,np.uint8).reshape(h,w)
            mismatches = int(np.count_nonzero(actual != expected))
            canvas_checks.append({'panel':i,'differentAlphaPixels':mismatches,'pass':mismatches == 0})
            mask = labels == i
            ys,xs = np.where(mask)
            box = (int(xs.min()),int(ys.min()),int(xs.max()+1),int(ys.max()+1))
            crop = Image.fromarray(np.dstack([rgb,mask.astype(np.uint8)*255])).crop(box)
            crop.save(args.out/f'proposal-{i}.png')
        # Fail-closed changes: no known image bytes or fixture coordinates in propose().
        mutations = {}
        mutations['blank-black'] = np.zeros_like(rgb)
        mutations['blank-white'] = np.full_like(rgb,255)
        mutations['mirrored-unproved-layout'] = rgb[:,::-1].copy()
        broken = rgb.copy();broken[241:279,170:235] = 12
        mutations['removed-long-divider-section'] = broken
        inset = rgb.copy();inset[428:548,250:365] = 248;inset[433:543,255:360] = [110,55,30]
        mutations['new-large-closed-inset'] = inset
        negative = []
        for name,image in mutations.items():
            found, proof = propose(image)
            negative.append({'case':name,'emittedCount':int(found.max()),'pass':not np.any(found),
                             'reason':proof.get('reason')})
        summary = {'status':'research-only, not a release or phone result',
          'browser':browser.version,'sourceImageSha256':hashlib.sha256(data).hexdigest(),
          'readerPage':42,'archiveIndex':41,'analysisWidth':w,'analysisHeight':h,
          'emittedProposals':5,'terminalPairEmitted':False,'hitTests':tests,
          'connectivity':connectivity,'canvasMaskChecks':canvas_checks,'failClosedTests':negative,
          'allPassed':all(t['pass'] for t in tests+canvas_checks+negative),
          'balloonOwnership':report['balloons'],
          'contours':[{'panel':i,'pixelCount':int((labels==i).sum()),'rings':r}
                      for i,r in enumerate(rings,1)]}
        (args.out/'test-results.json').write_text(json.dumps(summary,indent=2)+'\n')
        (args.out/'proposal-report.json').write_text(json.dumps(report,indent=2)+'\n')
        browser.close()
        print(json.dumps({k:v for k,v in summary.items() if k not in {'contours','balloonOwnership','hitTests'}},indent=2))
        if not summary['allPassed']: raise SystemExit('Research checks failed; do not promote.')


if __name__ == '__main__':
    main()
