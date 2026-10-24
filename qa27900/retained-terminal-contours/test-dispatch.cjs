'use strict';
const fs=require('fs'),assert=require('node:assert/strict'),crypto=require('crypto'),path=require('path');
const source=path.resolve(__dirname,'../../js/panels-cloud-rim-composition.js'),text=fs.readFileSync(source,'utf8');
const start=text.indexOf(' r.panelContours=function(p){'),end=text.indexOf('\n r._prepareSharedTopPanels=',start);assert(start>=0&&end>start);
const wrapper=text.slice(start,end);const checks=[];
function test(name,f){f();checks.push({name,passed:true});}
function fixture(){
 const original1={terminal:true,id:1},original2={terminal:true,id:2},retained1={terminal:true,id:1},retained2={terminal:true,id:2},cloud={cloud:true},prior=[{},original1,original2];
 const r={currentPanels:[cloud,retained1,retained2]},outer=r.currentPanels;
 const state={valid:true,retained:[retained1,retained2],prior};let active=state,lookups=0;const calls=[];
 const contours=function(p){calls.push({p,owners:this.currentPanels});return this.currentPanels===prior&&prior.includes(p)?'native-admitted':p===cloud?'old-cloud':null;};
 const G={under(reader,owners,fn){const before=reader.currentPanels;reader.currentPanels=owners;try{return fn()}finally{reader.currentPanels=before}}};
 new Function('r','contours','context','G','PanelOccludedTerminalCells',wrapper)(r,contours,()=>{lookups++;return active},G,{claims:p=>p?.terminal===true});
 return {r,state,prior,outer,cloud,retained1,retained2,calls,setState:s=>active=s,lookups:()=>lookups};
}
test('exact retained owner maps to first authenticated prior owner',()=>{const x=fixture();assert.equal(x.r.panelContours(x.retained1),'native-admitted');assert.equal(x.calls[0].p,x.prior[1]);assert.equal(x.calls[0].owners,x.prior);assert.equal(x.r.currentPanels,x.outer)});
test('second retained owner maps by exact identity',()=>{const x=fixture();assert.equal(x.r.panelContours(x.retained2),'native-admitted');assert.equal(x.calls[0].p,x.prior[2])});
test('off-map terminal gets no prior scope',()=>{const x=fixture(),p={terminal:true,id:3};assert.equal(x.r.panelContours(p),null);assert.equal(x.calls[0].owners,x.outer);assert.equal(x.calls[0].p,p)});
test('copied equal terminal gets no prior scope',()=>{const x=fixture(),p={...x.retained1};assert.equal(x.r.panelContours(p),null);assert.equal(x.calls[0].owners,x.outer)});
test('invalid full state fails closed without calling old contours',()=>{const x=fixture();x.state.valid=false;assert.equal(x.r.panelContours(x.retained1),null);assert.equal(x.calls.length,0)});
test('blocked state fails closed',()=>{const x=fixture();x.setState({valid:false});assert.equal(x.r.panelContours(x.retained1),null);assert.equal(x.calls.length,0)});
test('cloud child bypasses composition context',()=>{const x=fixture();assert.equal(x.r.panelContours(x.cloud),'old-cloud');assert.equal(x.lookups(),0)});
test('narrowed cloud child preserves old contour path',()=>{const x=fixture();x.r.currentPanels=[x.cloud];x.setState({valid:false});assert.equal(x.r.panelContours(x.cloud),'old-cloud');assert.equal(x.lookups(),0)});
test('prior context uses old admission directly',()=>{const x=fixture();x.r.currentPanels=x.prior;x.setState(null);assert.equal(x.r.panelContours(x.prior[1]),'native-admitted');assert.equal(x.calls[0].owners,x.prior)});
test('no composition does not grant native authority',()=>{const x=fixture();x.setState(null);assert.equal(x.r.panelContours(x.retained1),null);assert.equal(x.calls[0].owners,x.outer)});
console.log(JSON.stringify({scope:'Extracted production dispatch only. Mock context/under/old admission; not source-proof or async guard validation.',sourceSha256:crypto.createHash('sha256').update(text).digest('hex'),passed:checks.length,checks},null,2));
