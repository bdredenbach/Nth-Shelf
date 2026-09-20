'use strict';
// Optional original-artwork check using a real Chromium decoder/canvas and
// the app's IndexedDB -> Reader load -> touch -> rendered overlay path.
// Serve the repository's parent at NTH_QA_ORIGIN; source images stay private.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
if(!process.argv.includes('--comic')){console.log('Use --comic with the local original comic.');process.exit(0);}
const root=path.resolve(__dirname,'..'),parent=path.dirname(root);
const files=fs.readdirSync(path.join(parent,'comic-wolverine-1000')).filter(n=>/\.jpe?g$/i.test(n)).sort();
const origin=process.env.NTH_QA_ORIGIN||'http://127.0.0.1:8765';
const source=i=>origin+'/comic-wolverine-1000/'+encodeURIComponent(files[i]);
const app=origin+'/'+path.basename(root)+'/';
const label=require('./frame-accuracy/queue-artwork-27920.json').frames[0];
const output=process.env.NTH_QA_OUTPUT||'/tmp/nth-browser-frames';fs.mkdirSync(output,{recursive:true});
function matches(p){return p?._quad?.length===4&&p._quad.every((v,i)=>Math.abs(v.x-label.quad[i][0])<=label.tolerance&&Math.abs(v.y-label.quad[i][1])<=label.tolerance);}
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined,args:['--no-sandbox']});
 try{
 const context=await browser.newContext({viewport:{width:412,height:915},deviceScaleFactor:2.625,hasTouch:true,isMobile:true,serviceWorkers:'block'});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(app);
 const report={browser:browser.version(),runtime:await page.evaluate(()=>navigator.userAgent),source:files[10],sweep:[],touches:[]};
 if(process.env.NTH_BASELINE_URL){
  const old=await context.newPage();await old.goto(process.env.NTH_BASELINE_URL);
  for(let i=0;i<files.length;i++){
   const before=await old.evaluate(url=>PanelDetect.detect(url),source(i));
   const after=await page.evaluate(url=>PanelDetect.detect(url),source(i));
   const changed=JSON.stringify(before)!==JSON.stringify(after);
   assert(before.every(p=>after.some(n=>JSON.stringify(n)===JSON.stringify(p))),`page ${i+1}: preserve every prior browser identity`);
   if(i===10){assert(!before.some(matches),'baseline reproduces missing fortifications');assert(after.some(matches),'fixed browser proves fortifications');}
   report.sweep.push({page:i+1,before:before.length,after:after.length,changed,beforePanels:before,afterPanels:after});
   if((i+1)%10===0)console.log('Chromium comparison:',i+1,'pages');
  }
  await old.close();
  fs.writeFileSync(path.join(output,'browser-sweep.json'),JSON.stringify(report,null,2));
  console.log('Changed pages:',report.sweep.filter(p=>p.changed).map(p=>p.page));
 }
 await page.evaluate(async url=>{
  ShelfGuide.finish();ShelfGuide.seen.single=true;
  const blob=await(await fetch(url)).blob();
  await LongboxDB.putPage('real-frame-fixture',0,blob);
  await LongboxDB.addComic({id:'real-frame-fixture',title:'Frame fixture',pageCount:1,lastPage:0,bookmarks:[],addedAt:Date.now(),readMode:'single',theme:'dark'});
  await LongboxApp.openReader('real-frame-fixture');
  if(ShelfGuide.active)ShelfGuide.finish();
  await Reader._panelDetection?.promise;
  window.frameCaptures=[];const zoom=Reader.zoomToPanel;
  Reader.zoomToPanel=function(p,...args){frameCaptures.push(JSON.parse(JSON.stringify(p)));return zoom.call(this,p,...args);};
 },source(10));
 await page.waitForFunction(()=>Reader.currentPanels.length>=4);
 const positions=[[.5,.5],[.16,.5],[.84,.5],[.5,.16],[.5,.84]];
 // Two runs without clearing cache exercise open/close and repeat ownership.
 for(let round=0;round<2;round++)for(const [u,v]of positions){
  const q=label.quad,x=(1-v)*((1-u)*q[0][0]+u*q[1][0])+v*((1-u)*q[3][0]+u*q[2][0]);
  const y=(1-v)*((1-u)*q[0][1]+u*q[1][1])+v*((1-u)*q[3][1]+u*q[2][1]);
  await page.evaluate(()=>Reader.resetZoom({animate:false}));
  const pt=await page.evaluate(({x,y})=>{const r=Reader.getPanelImageContext().rect;return{x:r.left+x*r.width,y:r.top+y*r.height,n:frameCaptures.length};},{x,y});
  await page.touchscreen.tap(pt.x,pt.y);
  await page.waitForFunction(n=>frameCaptures.length>n,pt.n);
  await page.waitForFunction(()=>Reader.panelOverlayActive&&!!Reader.els.panelOverlay?.querySelector('canvas'));
  const selected=await page.evaluate(()=>frameCaptures.at(-1));assert(matches(selected),'actual touch selects full independently labeled frame');
  report.touches.push({round,u,v,sourcePoint:[x,y],selected});
  if(round===0&&u===.5&&v===.5){await page.waitForTimeout(400);await page.screenshot({path:path.join(output,'fortifications.png')});}
  await page.waitForTimeout(500);
 }
 assert.equal(report.touches.length,10);assert.deepEqual(errors,[]);
 fs.writeFileSync(path.join(output,'browser-reader.json'),JSON.stringify(report,null,2));
 console.log('10 real Chromium touch/overlay checks passed through IndexedDB and Reader.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
