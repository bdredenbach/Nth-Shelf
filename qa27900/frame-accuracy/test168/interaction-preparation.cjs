'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),path=require('path'),ctx={console,setTimeout,clearTimeout,localStorage:{getItem:()=>null}};
vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.resolve(__dirname,'../../../js/reader.js'),'utf8')+';this.r=Reader;',ctx);const r=ctx.r,rows=[];
for(const kind of ['normal','owner replacement','comic replacement','page navigation','load generation','mode change','rejected owner']){
 const owners=[{id:1},{id:2},{id:3}],seen=[];Object.assign(r,{currentPanels:owners,comic:{id:'fixture'},index:0,_panelLoadToken:1,mode:'single',panelContours:p=>[p.id],displayPanelContours(p){seen.push(p.id);if(seen.length===1){if(kind==='owner replacement')r.currentPanels=owners.slice();if(kind==='comic replacement')r.comic={id:'other'};if(kind==='page navigation')r.index++;if(kind==='load generation')r._panelLoadToken++;if(kind==='mode change')r.mode='scroll';if(kind==='rejected owner')throw Error('Unavailable');}return null;}});
 r._preparePanelInteractions();assert.deepEqual(seen,kind==='normal'||kind==='rejected owner'?[1,2,3]:[1]);rows.push({name:kind,passed:true});
}
r.mode='scroll';let called=false;r.displayPanelContours=()=>called=true;r._preparePanelInteractions();assert.equal(called,false);rows.push({name:'non-single mode does not warm frames',passed:true});
console.log(JSON.stringify({passed:true,cases:rows.length,rows,qualification:'Actual Reader preparation method; controlled source and navigation boundaries.'},null,2));
