'use strict';
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const text=fs.readFileSync(path.resolve(__dirname,'../../../js/reader.js'),'utf8'),sandbox={console,setTimeout,clearTimeout,localStorage:{getItem:()=>null}};vm.createContext(sandbox);vm.runInContext(text+';this.r=Reader;',sandbox);const r=sandbox.r;
(async()=>{let cases=0;for(const change of [null,r=>r.index++,r=>r.comic={id:'other'},r=>r._panelLoadToken++,r=>r.mode='scroll']){
 let release,entered;const started=new Promise(resolve=>entered=resolve),owners=[{}],events=[];
 sandbox.PanelDetect={detect(){entered();return new Promise(resolve=>release=resolve);}};
 Object.assign(r,{index:5,comic:{id:'generated'},mode:'single',_panelLoadToken:0,currentPanels:[],preparePanelMaps(){},getPageUrl:async()=> 'generated',_prepareCurvedHostPanels(){assert.equal(this.currentPanels,owners);events.push('curved');},_prepareSharedTopPanels(){assert.equal(this.currentPanels,owners);events.push('shared');}});
 const promise=r.loadPanelsForCurrentPage();await started;if(change)change(r);release(owners);await promise;assert.deepEqual(events,change?[]:['curved','shared']);cases++;
 }console.log(JSON.stringify({passed:true,cases,qualification:'Actual installed Reader load method with controlled detector and preparation boundaries.'}));})().catch(e=>{console.error(e);process.exitCode=1;});
