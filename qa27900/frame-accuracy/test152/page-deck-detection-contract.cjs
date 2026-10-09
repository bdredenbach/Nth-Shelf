'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const file=process.env.NTH_READER_SOURCE||path.resolve(__dirname,'../../../js/reader.js');
const code=fs.readFileSync(file,'utf8');
function method(name){const start=code.indexOf(` async ${name}(`);assert(start>=0);const end=code.indexOf('\n },',start);assert(end>start);return code.slice(start,end+4);}
const methods=method('renderPaged')+'\n'+method('loadPanelsForCurrentPage');
function deferred(){let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return{promise,resolve,reject};}
function setup(){
 const calls=[],tasks=[],wait=deferred(),elements=[];
 const Detector={detect:async(url)=>{calls.push(url);await wait.promise;return[{source:url}];}};
 const doc={createElement:tag=>({tag})};
 const r=new Function('PanelDetect','document',`return {${methods}}`)(Detector,doc);
 Object.assign(r,{mode:'single',useTurnJSPageMode:true,comic:{id:'alpha'},index:3,_panelLoadToken:0,currentPanels:[],els:{viewport:{style:{},appendChild:e=>elements.push(e)},stage:{}},source:'fresh-a',debugMode:false,getPageUrl:async function(){return this.source},preparePanelMaps(){},prefetch(){this.prefetches=(this.prefetches||0)+1},updateSliderLabel(){this.labels=(this.labels||0)+1},updateBookmarkFlag(){this.bookmarks=(this.bookmarks||0)+1},preflightPageImage:async function(){return this.source},debugLog(){}});
 r.turnPageMode={render:async()=>true};
 const start=()=>{const p=r.loadPanelsForCurrentPage();tasks.push(p);return p;};
 return{r,calls,tasks,wait,elements,start,finish:async()=>{wait.resolve();await Promise.all(tasks);await Promise.resolve();await Promise.resolve();}};
}
const results=[];
async function test(name,fn){await fn();results.push({name,passed:true});}
(async()=>{
 await test('page-deck turn starts one current detection',async()=>{const q=setup();q.r.turnPageMode.render=async()=>{q.start();return true};await q.r.renderPaged();await q.finish();assert.equal(q.calls.length,1);assert.equal(q.r._panelLoadToken,1);assert.deepEqual(q.r.currentPanels,[{source:'fresh-a'}]);assert.equal(q.r.prefetches,1);assert.equal(q.r.labels,1);assert.equal(q.r.bookmarks,1)});
 await test('page-deck with no turn event still starts detection',async()=>{const q=setup();await q.r.renderPaged();await q.finish();assert.equal(q.calls.length,1);assert.equal(q.r._panelLoadToken,1)});
 await test('pre-existing matching request does not suppress an explicit render',async()=>{const q=setup();q.start();await q.r.renderPaged();await q.finish();assert.equal(q.calls.length,2);assert.equal(q.r._panelLoadToken,2)});
 await test('different page request cannot suppress current detection',async()=>{const q=setup();q.r.turnPageMode.render=async()=>{q.r.index=4;q.start();q.r.index=3;return true};await q.r.renderPaged();await q.finish();assert.equal(q.calls.length,2);assert.equal(q.r._panelDetection.pageIndex,3)});
 await test('different comic request cannot suppress current detection',async()=>{const q=setup();q.r.turnPageMode.render=async()=>{q.r.comic={id:'beta'};q.start();q.r.comic={id:'alpha'};return true};await q.r.renderPaged();await q.finish();assert.equal(q.calls.length,2);assert.equal(q.r._panelDetection.comicId,'alpha')});
 await test('superseded generation cannot suppress current detection',async()=>{const q=setup();q.r.turnPageMode.render=async()=>{q.start();q.r._panelLoadToken++;return true};await q.r.renderPaged();await q.finish();assert.equal(q.calls.length,2);assert.equal(q.r._panelDetection.token,3)});
 await test('cleared pending request cannot suppress current detection',async()=>{const q=setup();q.r.turnPageMode.render=async()=>{q.start();q.r._panelDetection=null;return true};await q.r.renderPaged();await q.finish();assert.equal(q.calls.length,2)});
 await test('later render reloads changed source',async()=>{const q=setup();await q.r.renderPaged();await q.finish();q.r.source='fresh-b';await q.r.renderPaged();await q.finish();assert.deepEqual(q.calls,['fresh-a','fresh-b']);assert.deepEqual(q.r.currentPanels,[{source:'fresh-b'}])});
 await test('failed page-deck retains normal renderer detection',async()=>{const q=setup();q.r.turnPageMode.render=async()=>false;await q.r.renderPaged();await q.finish();assert.equal(q.calls.length,1);assert.equal(q.elements.length,1);assert.equal(q.elements[0].src,'fresh-a')});
 await test('navigation rejects stale detector completion',async()=>{const q=setup();q.r.turnPageMode.render=async()=>{q.start();return true};await q.r.renderPaged();q.r.index=4;const replacement=[];q.r.currentPanels=replacement;await q.finish();assert.equal(q.calls.length,1);assert.equal(q.r.currentPanels,replacement)});
 await test('comic replacement rejects stale detector completion',async()=>{const q=setup();q.r.turnPageMode.render=async()=>{q.start();return true};await q.r.renderPaged();q.r.comic={id:'beta'};const replacement=[];q.r.currentPanels=replacement;await q.finish();assert.equal(q.r.currentPanels,replacement)});
 await test('mode change rejects stale detector completion',async()=>{const q=setup();q.r.turnPageMode.render=async()=>{q.start();return true};await q.r.renderPaged();q.r.mode='continuous';const replacement=[];q.r.currentPanels=replacement;await q.finish();assert.equal(q.r.currentPanels,replacement)});
 const report={passed:true,actualReaderMethods:true,syntheticSourceOnly:true,controls:results.length,readerSha256:crypto.createHash('sha256').update(code).digest('hex'),results};
 if(process.env.NTH_CONTRACT_OUTPUT)fs.writeFileSync(process.env.NTH_CONTRACT_OUTPUT,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
})().catch(e=>{console.error(e);process.exitCode=1});
