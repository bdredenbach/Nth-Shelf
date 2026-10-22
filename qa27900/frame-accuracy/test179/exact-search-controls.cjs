'use strict';
const fs=require('fs'),assert=require('node:assert/strict'),cv=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/@napi-rs/canvas');
const root=process.env.NTH_SHELF_SOURCE,checks=[];
const code=['panels-frame-wasm','panels-frame-envelope','panel-map'].map(n=>fs.readFileSync(root+'/js/'+n+'.js','utf8')).join('\n');
const {E,W,M}=new Function('document','Image','ImageData',code+';return {E:PanelFrameEnvelope,W:PanelFrameWasm,M:PanelMap};')({createElement:()=>cv.createCanvas(1,1)},cv.Image,cv.ImageData);
function check(n,f){f();checks.push({name:n,passed:true});}
async function image(canvas){const i=new cv.Image();i.src=canvas.toBuffer('image/png');await i.decode();return i;}
(async()=>{
 const canvas=cv.createCanvas(200,300),g=canvas.getContext('2d');g.fillStyle='#fafafa';g.fillRect(0,0,200,300);const im=await image(canvas),p={x:.1,y:.1,w:.4,h:.3,_tap:{x:.3,y:.25},_identitySeed:{x:.1,y:.1,w:.4,h:.3},_edgeClippedSeed:false};
 let calls=0;const original=E._detectUncached;E._detectUncached=(i,p)=>{calls++;return{...p,_quad:[{x:.1,y:.1},{x:.5,y:.1},{x:.5,y:.4},{x:.1,y:.4}],_frameEnvelope:{seedConsensus:1,confidence:.6,nested:{proof:true}}};};
 const one=E._detect(im,p),two=E._detect(await image(canvas),p);
 check('identical full luminance, new decoded object reuses exact input',()=>{assert.equal(calls,1);assert.deepEqual(one,two);});
 two._quad[0].x=.99;two._frameEnvelope.nested.proof=false;one._quad[1].x=.99;
 check('caller mutations cannot modify retained output',()=>{const v=E._detect(im,p);assert.equal(v._quad[0].x,.1);assert.equal(v._quad[1].x,.5);assert(v._frameEnvelope.nested.proof);});
 let modeCalls=calls;W.ready=true;E._detect(im,p);check('kernel availability change forces fresh search',()=>assert.equal(calls,modeCalls+1));W.ready=false;
 for(const [name,edit] of [
  ['nearby tap',q=>q._tap.x+=1e-9],['different seed',q=>q.x+=.001],['different identity bound',q=>q._identitySeed.w+=.001],['edge seed flag',q=>q._edgeClippedSeed=true],['composite flag',q=>q._structuralCompositeSeed=true],['additional input field',q=>q._ownershipProbe=true]]){
  const before=calls,q=structuredClone(p);edit(q);E._detect(im,q);check(name+' forces fresh search',()=>assert.equal(calls,before+1));
 }
 g.fillStyle='black';g.fillRect(199,299,1,1);let before=calls;E._detect(await image(canvas),p);
 check('one changed analysis luminance pixel forces fresh search',()=>assert.equal(calls,before+1));
 const larger=cv.createCanvas(201,300);larger.getContext('2d').drawImage(canvas,0,0);before=calls;E._detect(await image(larger),p);
 check('changed dimensions force fresh search',()=>assert.equal(calls,before+1));
 check('page storage bounded to two luminance arrays',()=>assert.equal(E._exactSearchPages.length,2));
 for(let i=0;i<12;i++)E._detect(im,{...p,_tap:{x:.2+i*.001,y:.25}});
 check('entry storage bounded to eight exact inputs per page',()=>assert(E._exactSearchPages.every(p=>p.entries.size<=8)));
 E.clearExactSearchCache();before=calls;E._detect(im,p);check('explicit clear forces fresh search',()=>assert.equal(calls,before+1));
 M.beginIssue('a');check('issue change clears exact search memory',()=>assert.equal(E._exactSearchPages.length,0));
 E._detect(im,p);M.beginIssue('a');check('same issue preserves bounded exact search memory',()=>assert.equal(E._exactSearchPages.length,1));
 M.endIssue('other');check('unrelated issue close preserves active memory',()=>assert.equal(E._exactSearchPages.length,1));
 M.endIssue('a');check('active issue close clears memory',()=>assert.equal(E._exactSearchPages.length,0));
 const cyclic={...p};cyclic.cycle=cyclic;
 for(const [name,q] of [['cycle',cyclic],['nonfinite',{...p,w:NaN}],['function',{...p,fn(){}}],['undefined',{...p,extra:undefined}],['negative zero',{...p,x:-0}],['toJSON',{...p,toJSON(){return p}}],['symbol',{...p,[Symbol('input')]:true}],['sparse array',{...p,extra:Array(1)}]]){
  E.clearExactSearchCache();before=calls;E._detect(im,q);E._detect(im,q);check(name+' stays uncached',()=>assert.equal(calls,before+2));
 }
 E.clearExactSearchCache();E._detectUncached=()=>{calls++;return null};before=calls;assert.equal(E._detect(im,p),null);assert.equal(E._detect(im,p),null);check('null misses replay without inventing geometry',()=>assert.equal(calls,before+1));
 E.clearExactSearchCache();E._detectUncached=original;
 // Real arithmetic parity on independently drawn closed rims and blank matte,
 // with and without the optional kernel. Results include all proof fields.
 for(const wasm of [false,true]){
  if(wasm)W.attach(await WebAssembly.instantiate(fs.readFileSync(root+'/js/panels-frame-kernel.wasm')));else W.ready=false;
  for(const ink of [false,true]){
   const c=cv.createCanvas(300,400),ctx=c.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,300,400);
   if(ink){ctx.fillStyle='#587b91';ctx.fillRect(30,40,120,120);ctx.lineWidth=6;ctx.strokeStyle='black';ctx.strokeRect(30,40,120,120);}
   const i=await image(c),seed={x:.10,y:.10,w:.40,h:.30,_tap:{x:.30,y:.25}};E.clearExactSearchCache();
   const direct=E._detectUncached(i,seed),cold=E._detect(i,seed),warm=E._detect(await image(c),seed);
   check(`full ${wasm?'WASM':'JavaScript'} ${ink?'rim':'blank'} result parity cold and repeat`,()=>{assert.deepEqual(cold,direct);assert.deepEqual(warm,direct);});
  }
 }
 console.log(JSON.stringify({passed:true,controls:checks.length,qualification:'Native canvas exact-search reuse, full-byte invalidation, bounded storage, lifecycle hooks and real cached/uncached math parity. No browser cache or Worker claim.',checks},null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
