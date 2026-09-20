'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{chromium}=require('playwright');
if(!process.argv.includes('--comic')){console.log('Use --comic with the local original comic.');process.exit(0);}
const root=path.resolve(__dirname,'..'),parent=path.dirname(root),output=process.env.NTH_QA_OUTPUT||'/tmp/nth-overlap';fs.mkdirSync(output,{recursive:true});
const origin=process.env.NTH_QA_ORIGIN||'http://127.0.0.1:8765',files=fs.readdirSync(path.join(parent,'comic-wolverine-1000')).filter(n=>/\.jpe?g$/i.test(n)).sort();
const labels=require('./frame-accuracy/queue-artwork-27923.json').frames;
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined,args:['--no-sandbox']});try{
const page=await browser.newPage({viewport:{width:412,height:915},deviceScaleFactor:2.625,isMobile:true,hasTouch:true,serviceWorkers:'block'}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(origin+'/'+path.basename(root)+'/');
if(process.env.NTH_BASELINE_URL){const old=await browser.newPage();await old.goto(process.env.NTH_BASELINE_URL);const sweep=[];
for(let i=0;i<files.length;i++){
 const url=origin+'/comic-wolverine-1000/'+encodeURIComponent(files[i]);
 const before=await old.evaluate(url=>PanelDetect.detect(url),url),after=await page.evaluate(url=>PanelDetect.detect(url),url);
 assert(before.every(p=>after.some(n=>JSON.stringify(n)===JSON.stringify(p))),`page${i+1}: previous identity and proof preserved`);
 sweep.push({page:i+1,changed:JSON.stringify(before)!==JSON.stringify(after),before,after});if((i+1)%10===0)console.log('Chromium comparison',i+1);
}fs.writeFileSync(path.join(output,'browser-sweep.json'),JSON.stringify(sweep,null,2));assert.deepEqual(sweep.filter(p=>p.changed).map(p=>p.page),[9,10]);await old.close();console.log('74-page comparison passed; only pages 9 and 10 change.');}
const report=[];
for(const num of [9,10]){
 const url=origin+'/comic-wolverine-1000/'+encodeURIComponent(files[num-1]);
 const panels=await page.evaluate(async({url,num})=>{
 ShelfGuide.finish();ShelfGuide.seen.single=true;
 if(Reader.comic)await LongboxApp.closeReader();
 const id='p'+num;await LongboxDB.putPage(id,0,await(await fetch(url)).blob());await LongboxDB.addComic({id,title:'Page '+num,pageCount:1,lastPage:0,bookmarks:[],addedAt:Date.now(),readMode:'single',theme:'dark'});await LongboxApp.openReader(id);await Reader._panelDetection?.promise;
 if(!window.captures){window.captures=[];const zoom=Reader.zoomToPanel;Reader.zoomToPanel=function(p,...args){captures.push(JSON.parse(JSON.stringify(p)));return zoom.call(this,p,...args);};}
 return Reader.currentPanels;
 },{url,num});assert.equal(panels.length,num===9?10:6);
 for(const label of labels.filter(l=>l.page===num))for(let round=0;round<2;round++)for(const[x,y]of label.points){
  await page.evaluate(()=>Reader.resetZoom({animate:false}));
  const pt=await page.evaluate(({x,y})=>{const r=Reader.getPanelImageContext().rect;return{x:r.left+x*r.width,y:r.top+y*r.height,n:captures.length};},{x,y});
  await page.touchscreen.tap(pt.x,pt.y);await page.waitForFunction(n=>captures.length>n,pt.n);await page.waitForFunction(()=>Reader.panelOverlayActive&&!!Reader.els.panelOverlay?.querySelector('canvas'));
  const result=await page.evaluate(()=>({selected:captures.at(-1),clip:Reader.els.panelOverlay.style.clipPath,geometry:Reader.els.panelOverlay.dataset.geometry,focus:Reader.panelFocusMeta}));
  assert.equal(result.selected._identitySource,'overlap-frame',label.name);assert.equal(result.selected._overlapProof.index,label.index,label.name+' tap owner');assert.equal(result.geometry,'outline');
  assert.equal(result.selected._outline.length,label.outline.length,label.name+' vertices');
  result.selected._outline.forEach((p,i)=>assert(Math.hypot(p.x-label.outline[i][0],p.y-label.outline[i][1])<.009,label.name+' visible border '+i));
  assert.deepEqual(result.focus.panel._outline,result.selected._outline,'second-level lookup keeps visible outline');
  report.push({page:num,label:label.name,round,x,y,...result});
  if(round===0&&x===label.points[0][0]&&y===label.points[0][1]){await page.waitForTimeout(400);await page.screenshot({path:path.join(output,`page${num}-${label.index}.png`)});}
  await page.waitForTimeout(400);
 }
}
assert.deepEqual(errors,[]);fs.writeFileSync(path.join(output,'overlap-reader.json'),JSON.stringify(report,null,2));console.log(report.length+' real touch / rendered outline checks passed.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
