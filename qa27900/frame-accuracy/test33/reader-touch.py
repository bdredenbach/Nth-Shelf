#!/usr/bin/env python3
import json,hashlib,base64,time,mimetypes,re,argparse,zipfile
from urllib.parse import urlparse,unquote
from pathlib import Path
from playwright.sync_api import sync_playwright
parser=argparse.ArgumentParser(description='Offline Reader/Page Deck touch harness. Real UI and detector; in-memory DB boundary, no persistence/import/network claims.')
parser.add_argument('--root',type=Path,default=Path(__file__).resolve().parents[3]);parser.add_argument('--comic',type=Path,required=True);parser.add_argument('--out',type=Path,required=True);parser.add_argument('--browser',default='/usr/bin/chromium')
args=parser.parse_args();root=args.root;out=args.out;out.mkdir(parents=True,exist_ok=True)
qa=json.loads((root/'qa27900/frame-accuracy/test33/page42-anchors.json').read_text());anchors=[p['points'] for p in qa['panels']]
with zipfile.ZipFile(args.comic) as z:
 names=sorted(n for n in z.namelist() if not n.startswith('__MACOSX/') and Path(n).suffix.lower() in {'.jpg','.jpeg','.png','.webp'});image_bytes=z.read(names[qa['archiveIndex']])
assert hashlib.sha256(image_bytes).hexdigest()==qa['imageSha256'],'Wrong comic fixture'
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path=args.browser,headless=True,args=['--no-sandbox']);page=b.new_page(viewport={'width':412,'height':915},device_scale_factor=2.625,is_mobile=True,has_touch=True,service_workers='block');errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 # Offline inline Reader fixture: real UI/scripts; in-memory storage boundary.
 # No origin navigation or network. This is not a persistence/import test.
 html=(root/'index.html').read_text()
 scripts=re.findall(r'<script[^>]*src=["\']([^"\']+)',html)
 html=re.sub(r'<script\b[^>]*>.*?</script>','',html,flags=re.S)
 html=re.sub(r'<link\b[^>]*>','',html)
 html=html.replace('</head>','<style>'+(root/'css/style.css').read_text()+'</style></head>')
 page.route('**/*',lambda route:route.abort())
 page.set_content(html)
 page.evaluate("""()=>{const m=new Map();Object.defineProperty(window,'localStorage',{value:{getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)}});}""")
 for script in scripts:
  page.add_script_tag(content=(root/script).read_text())
 data=page.evaluate('''async src=>{
  const blob=await(await fetch(src)).blob(),comic={id:'page42-qa',title:'Page 42 QA',pageCount:1,lastPage:0,bookmarks:[],addedAt:Date.now(),readMode:'single',theme:'dark'};
  LongboxDB.getComic=async()=>comic;LongboxDB.getAllComics=async()=>[comic];LongboxDB.getPage=async()=>blob;
  LongboxDB.updateComic=async(_,v)=>Object.assign(comic,v);LongboxDB.getPanelMap=async()=>null;LongboxDB.putPanelMap=async()=>{};
  ShelfGuide.seen.single=true;Reader.init();
  await LongboxApp.openReader(comic.id);await Reader._panelDetection?.promise;
  window.captures=[];const zoom=Reader.zoomToPanel;Reader.zoomToPanel=function(p,...args){captures.push(JSON.parse(JSON.stringify(p)));return zoom.call(this,p,...args);};
  Reader.panelZoomEnabled=true;return {panels:Reader.currentPanels,pageDeck:Reader.turnPageMode?.book instanceof NthPageDeck};
 }''','data:image/jpeg;base64,'+base64.b64encode(image_bytes).decode())
 print('Reader count',len(data['panels']),'PageDeck',data['pageDeck'],flush=True)
 (out/'initial.json').write_text(json.dumps(data));assert len(data['panels'])==7;assert data['pageDeck']
 ownership=page.evaluate('''anchors=>anchors.flatMap((pts,index)=>pts.map(([x,y])=>({index,x,y,got:Reader.findPanelAt(x/585,y/900)?._curvedRimProof?.index??null})))''',anchors)
 (out/'ownership.json').write_text(json.dumps(ownership,indent=2));bad=[p for p in ownership if p['index']!=p['got']];print('Anchor checks',len(ownership),'bad',bad,flush=True)
 assert not bad,bad
 # Actual touch handlers, Page Deck image lookup and Reader overlay raster.
 results=[]
 for idx,points in enumerate(anchors):
  # Center and four more widely spread manually chosen points per panel.
  for j,(x,y) in enumerate(points[:5]):
   page.evaluate('Reader.resetZoom({animate:false})');page.wait_for_timeout(60)
   pos=page.evaluate('''([x,y])=>{const r=Reader.getPanelImageContext().rect;return{x:r.left+x/585*r.width,y:r.top+y/900*r.height,n:captures.length};}''',[x,y])
   page.touchscreen.tap(pos['x'],pos['y']);page.wait_for_function('n=>captures.length>n',arg=pos['n'],timeout=10000)
   page.wait_for_function('()=>Reader.panelOverlayActive&&!!Reader.els.panelOverlay?.querySelector("canvas")',timeout=10000)
   result=page.evaluate('''()=>{const p=captures.at(-1),f=Reader.panelFocusMeta.panel,canvas=Reader.els.panelOverlay.querySelector('canvas');return {index:p._curvedRimProof?.index,source:p._identitySource,focusValid:PanelCurvedRims.validPanel(f),contoursEqual:JSON.stringify(p._contours)===JSON.stringify(f._contours),geometry:Reader.els.panelOverlay.dataset.geometry,canvasSize:[canvas.width,canvas.height]};}''')
   assert result['index']==idx,(idx,result);assert result['focusValid'];assert result['contoursEqual'];assert result['geometry']=='contours',result
   # Independent reference assembly from the initially accepted descriptor and original image.
   pixels=page.evaluate('''expected=>{const src=Reader.getPanelImageContext().img,actual=Reader.els.panelOverlay.querySelector('canvas');
    const ref=document.createElement('canvas');ref.width=actual.width;ref.height=actual.height;const ctx=ref.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
    const path=new Path2D();for(const q of expected._contours){for(let i=0;i<q.length;i++){const p=q[i],x=(p.x-expected.x)/expected.w*ref.width,y=(p.y-expected.y)/expected.h*ref.height;if(i)path.lineTo(x,y);else path.moveTo(x,y);}path.closePath();}
    ctx.clip(path,'evenodd');ctx.drawImage(src,expected.x*src.naturalWidth,expected.y*src.naturalHeight,expected.w*src.naturalWidth,expected.h*src.naturalHeight,0,0,ref.width,ref.height);
    const a=actual.getContext('2d').getImageData(0,0,actual.width,actual.height).data,b=ctx.getImageData(0,0,ref.width,ref.height).data;let differences=0,transparent=0,opaque=0;
    for(let i=0;i<a.length;i+=4){if(a[i]!==b[i]||a[i+1]!==b[i+1]||a[i+2]!==b[i+2]||a[i+3]!==b[i+3])differences++;if(a[i+3]===0)transparent++;if(a[i+3]===255)opaque++;}
    return {differences,transparent,opaque,pixels:a.length/4};}''',data['panels'][idx])
   assert pixels['differences']==0,pixels;assert pixels['transparent']>0 and pixels['opaque']>0;result['pixelReference']=pixels
   results.append({'expected':idx,'x':x,'y':y,**result})
   if j==0:
    page.wait_for_timeout(350);page.screenshot(path=str(out/f'panel{idx+1}-reader.png'))
    image=page.evaluate("Reader.els.panelOverlay.querySelector('canvas').toDataURL('image/png')")
    (out/f'panel{idx+1}-crop.png').write_bytes(base64.b64decode(image.split(',')[1]))
   page.wait_for_timeout(480)
 print('Touch renders',len(results),'errors',errors,flush=True)
 report={'browser':b.version,'viewport':[412,915],'deviceScaleFactor':2.625,'pageDeck':data['pageDeck'],'ownership':ownership,'touches':results,'pageErrors':errors,'sourceSha256':{script:hashlib.sha256((root/script).read_bytes()).hexdigest() for script in scripts},'storageBoundary':'in-memory DB/localStorage fixture; not a persistence or import test','network':'no navigation; inline local scripts and data image; requests aborted'}
 (out/'reader-report.json').write_text(json.dumps(report,indent=2));assert not errors
 b.close()
