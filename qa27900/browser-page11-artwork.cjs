const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{chromium}=require('playwright');
if(!process.argv.includes('--comic')){console.log('Use --comic with the local original comic.');process.exit(0);}
const root=path.resolve(__dirname,'..'),parent=path.dirname(root);
const output=process.env.NTH_QA_OUTPUT||'/tmp/nth-page11';fs.mkdirSync(output,{recursive:true});
const origin=process.env.NTH_QA_ORIGIN||'http://127.0.0.1:8765';
const files=fs.readdirSync(path.join(parent,'comic-wolverine-1000')).filter(n=>/\.jpe?g$/i.test(n)).sort();
const labels=require('./frame-accuracy/queue-artwork-27922.json').frames;
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined,args:['--no-sandbox']});
try{const page=await browser.newPage({viewport:{width:412,height:915},deviceScaleFactor:2.625,isMobile:true,hasTouch:true,serviceWorkers:'block'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(origin+'/'+path.basename(root)+'/');
const url=origin+'/comic-wolverine-1000/'+encodeURIComponent(files[10]);
if(process.env.NTH_BASELINE_URL){
 const old=await browser.newPage();await old.goto(process.env.NTH_BASELINE_URL);const sweep=[];
 for(let i=0;i<files.length;i++){
  const source=origin+'/comic-wolverine-1000/'+encodeURIComponent(files[i]);
  const before=await old.evaluate(url=>PanelDetect.detect(url),source),after=await page.evaluate(url=>PanelDetect.detect(url),source);
  assert(before.every(p=>after.some(n=>JSON.stringify(n)===JSON.stringify(p))),`page ${i+1}: every previous identity preserved`);
  const changed=JSON.stringify(before)!==JSON.stringify(after);sweep.push({page:i+1,changed,before,after});
  if((i+1)%10===0)console.log('Chromium comparison:',i+1,'pages');
 }
 assert.deepEqual(sweep.filter(p=>p.changed).map(p=>p.page),[11],'only targeted page changes');
 fs.writeFileSync(path.join(output,'browser-sweep.json'),JSON.stringify(sweep,null,2));await old.close();
 console.log('74-page comparison passed; only page 11 changes.');
}
const panels=await page.evaluate(async url=>{ShelfGuide.finish();ShelfGuide.seen.single=true;await LongboxDB.putPage('p11',0,await(await fetch(url)).blob());await LongboxDB.addComic({id:'p11',title:'Page 11',pageCount:1,lastPage:0,bookmarks:[],addedAt:Date.now(),readMode:'single',theme:'dark'});await LongboxApp.openReader('p11');await Reader._panelDetection?.promise;window.captures=[];const zoom=Reader.zoomToPanel;Reader.zoomToPanel=function(p,...args){captures.push(JSON.parse(JSON.stringify(p)));return zoom.call(this,p,...args);};return Reader.currentPanels;},url);
console.log('Identities',panels.map(p=>[p._identitySource,p.x,p.y,p.w,p.h]));assert.equal(panels.length,6);
const touches=[];
for(const label of labels)for(let round=0;round<2;round++)for(const[u,v]of[[.5,.5],[.16,.5],[.84,.5],[.5,.16],[.5,.84]]){
const q=label.quad,x=(1-v)*((1-u)*q[0][0]+u*q[1][0])+v*((1-u)*q[3][0]+u*q[2][0]),y=(1-v)*((1-u)*q[0][1]+u*q[1][1])+v*((1-u)*q[3][1]+u*q[2][1]);
await page.evaluate(()=>Reader.resetZoom({animate:false}));const pt=await page.evaluate(({x,y})=>{const r=Reader.getPanelImageContext().rect;return{x:r.left+x*r.width,y:r.top+y*r.height,n:captures.length};},{x,y});await page.touchscreen.tap(pt.x,pt.y);await page.waitForFunction(n=>captures.length>n,pt.n);await page.waitForFunction(()=>Reader.panelOverlayActive&&!!Reader.els.panelOverlay?.querySelector('canvas'));
const selected=await page.evaluate(()=>captures.at(-1));assert.equal(selected._identitySource,label.source,label.name);
const actual=selected._quad||[{x:selected.x,y:selected.y},{x:selected.x+selected.w,y:selected.y},{x:selected.x+selected.w,y:selected.y+selected.h},{x:selected.x,y:selected.y+selected.h}];assert(actual.every((p,i)=>Math.abs(p.x-q[i][0])<.01&&Math.abs(p.y-q[i][1])<.01),label.name+' whole-artwork label');
touches.push({name:label.name,round,u,v,selected});if(round===0&&u===.5&&v===.5){await page.waitForTimeout(400);await page.screenshot({path:path.join(output,label.name.replaceAll(' ','-')+'.png')});}await page.waitForTimeout(500);
}
assert.deepEqual(errors,[]);fs.writeFileSync(path.join(output,'page11-reader.json'),JSON.stringify({labels,panels,touches},null,2));console.log('50 real Chromium touch/rendered-overlay checks passed.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
