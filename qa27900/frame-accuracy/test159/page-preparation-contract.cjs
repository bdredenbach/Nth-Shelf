'use strict';
const assert=require('node:assert/strict');
const {loadContract}=require('./city-real-load-entry.cjs');
async function check(change){
 let release,started;
 const entered=new Promise(resolve=>started=resolve),owners=[{generated:true}];
 const contract=loadContract(()=>{started();return new Promise(resolve=>release=resolve);});
 const events=[],r={comic:{id:'generated'},index:7,mode:'single',_panelLoadToken:0,
  currentPanels:[],preparePanelMaps(){},getPageUrl:async()=> 'generated',
  _prepareCurvedHostPanels(){assert.equal(this.currentPanels,owners);events.push('prepared');}};
 const pending=contract.load.call(r);await entered;
 if(change)change(r);release(owners);await pending;
 assert.equal(events.length,change?0:1,'Only a live page prepares its published owners');
 if(!change)assert.equal(r.currentPanels,owners);
}
(async()=>{
 await check();
 await check(r=>r.index++);
 await check(r=>r.comic={id:'replacement'});
 await check(r=>r._panelLoadToken++);
 await check(r=>r.mode='scroll');
 console.log(JSON.stringify({passed:true,cases:5,preparedBeforeLoadSettles:true}));
})().catch(e=>{console.error(e);process.exitCode=1;});
