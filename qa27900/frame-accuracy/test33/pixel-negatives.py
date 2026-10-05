#!/usr/bin/env python3
"""Private-fixture pale-rim raw-pixel checks. Never emits or uploads comic pixels."""
import argparse,base64,json,zipfile,hashlib
from pathlib import Path
from playwright.sync_api import sync_playwright
p=argparse.ArgumentParser(description=__doc__)
p.add_argument('--comic',required=True,type=Path);p.add_argument('--root',type=Path,default=Path(__file__).resolve().parents[3]);p.add_argument('--browser',default='/usr/bin/chromium');p.add_argument('--out',required=True,type=Path)
a=p.parse_args()
with zipfile.ZipFile(a.comic) as z:
 names=sorted(n for n in z.namelist() if not n.startswith('__MACOSX/') and Path(n).suffix.lower() in {'.jpg','.jpeg','.png','.webp'})
 raw=z.read(names[41])
expected=json.loads((a.root/'qa27900/frame-accuracy/test33/page42-anchors.json').read_text())['imageSha256']
assert hashlib.sha256(raw).hexdigest()==expected,'Wrong comic fixture'
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path=a.browser,headless=True,args=['--no-sandbox']);page=b.new_page();page.set_content('<html></html>');page.add_script_tag(content=(a.root/'js/panels-curved-rims.js').read_text())
 r=page.evaluate('''async url=>{
 const im=new Image();im.src=url;await im.decode();const w=585,h=900,c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(im,0,0,w,h);const original=ctx.getImageData(0,0,w,h).data;
 let start=performance.now();const good=PanelCurvedRims.analyzeRGBA(original,w,h);const elapsedMs=performance.now()-start;
 if(good.length!==7)throw Error('Expected seven original frame identities');const model=good[0]._curvedRimProof.network.model,fan=good[0]._curvedRimProof.network.fan;
 const cases=[];
 function run(name,edit){const pixels=new Uint8ClampedArray(original);edit(pixels);const result=PanelCurvedRims.analyzeRGBA(pixels,w,h);cases.push({name,count:result.length});if(result.length)throw Error(name+' unexpectedly accepted');}
 const paint=(p,x0,y0,x1,y1,v)=>{for(let y=Math.max(0,y0);y<Math.min(h,y1);y++)for(let x=Math.max(0,x0);x<Math.min(w,x1);x++){let i=(y*w+x)*4;p[i]=p[i+1]=p[i+2]=v;p[i+3]=255;}};
 run('blank-black',p=>paint(p,0,0,w,h,0));
 run('blank-white',p=>paint(p,0,0,w,h,255));
 run('one-transparent-pixel',p=>p[(450*w+290)*4+3]=0);
 run('wrong-exterior-matte',p=>{paint(p,0,0,w,2,220);paint(p,0,h-2,w,h,220);paint(p,0,0,2,h,220);paint(p,w-2,0,w,h,220);});
 run('transverse-rim-erased',p=>{for(let x=180;x<285;x++){let y=model.paths[2][x-model.x0];paint(p,x,y-32,x+1,y+33,90);}});
 run('terminal-seam-erased',p=>{for(const [x,y] of fan.paths[0])if(y>=735&&y<805)paint(p,x-28,y,x+29,y+1,90);});
 run('unstructured-noise',p=>{let r=47;for(let y=3;y<h-3;y++)for(let x=3;x<w-3;x++){r=(1664525*r+1013904223)>>>0;const v=r>>>24,i=(y*w+x)*4;p[i]=p[i+1]=p[i+2]=v;}});
 return {positivePanels:good.length,valid:good.every(PanelCurvedRims.validPanel),desktopRouteMs:elapsedMs,negatives:cases};
 }''','data:image/jpeg;base64,'+base64.b64encode(raw).decode())
 r['browser']=b.version;b.close()
a.out.parent.mkdir(parents=True,exist_ok=True);a.out.write_text(json.dumps(r,indent=2)+'\n');print(json.dumps(r))
