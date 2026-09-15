'use strict';

const fs=require('fs');
const path=require('path');
const vm=require('vm');
const {webcrypto}=require('crypto');
const {api}=require('./harness');

const source=fs.readFileSync(path.resolve(__dirname,'..','js','panel-map.js'),'utf8');
const stored=new Map();
let workerCreations=0;

const fixture=api.PanelMapCore.serializeFrame({
  x:.10,y:.20,w:.30,h:.30,
  _quad:[{x:.10,y:.20},{x:.40,y:.20},{x:.40,y:.50},{x:.10,y:.50}],
  _geometryType:'tap-neighborhood-frame',_geometryOwner:'skewed-frame',
  _frameEnvelope:{chainConnected:true,confidence:.95,seedConsensus:3,seedSource:'qa',
    seedCoverage:.98,relativeAdjScore:.92,adjacencyScore:.4,weakestAdj:.2,minThickness:.9,
    adaptiveFastPath:true,localConsensusVerifier:true,localConfirmations:2,wasmRailKernel:true},
  _frameOwnership:{owns:true,owner:'skewed',reason:'qa',confidence:.9,
    trustedAxisDeparture:12,relativeRailProof:true}
});

function makeRuntime(){
  class FakeWorker{
    constructor(){workerCreations++;this.onmessage=null;this.onerror=null;this.stopped=false;}
    postMessage(message){
      setImmediate(()=>{
        if(this.stopped)return;
        this.onmessage?.({data:{type:'built',id:message.id,result:{
          mapVersion:api.PanelMapCore.MAP_VERSION,
          proofVersion:api.PanelMapCore.PROOF_VERSION,
          status:'partial',frames:[fixture],probeCount:6,acceptedCount:1,
          acceptedRows:['qa'],elapsedMs:12,attempts:[]
        }}});
      });
    }
    terminate(){this.stopped=true;}
  }
  const context={
    console,Map,Promise,Uint8Array,Blob,URL,Worker:FakeWorker,crypto:webcrypto,
    setTimeout,clearTimeout,setImmediate,
    location:{href:'https://nth.test/index.html'},
    document:{currentScript:{src:'https://nth.test/js/panel-map.js'}},
    PanelMapCore:api.PanelMapCore,
    LongboxDB:{
      async getPanelMap(comicId,pageIndex){return stored.get(`${comicId}:${pageIndex}`)||null;},
      async putPanelMap(comicId,pageIndex,record){stored.set(`${comicId}:${pageIndex}`,record);}
    }
  };
  vm.createContext(context);
  vm.runInContext(source,context,{filename:'panel-map.js'});
  return vm.runInContext('PanelMap',context);
}

(async()=>{
  stored.clear();workerCreations=0;
  const pageA=new Blob(['page-a'],{type:'image/jpeg'});
  const first=makeRuntime();first.beginIssue('comic');
  const built=await first.prepare('comic',3,pageA);
  await new Promise(resolve=>setImmediate(resolve));
  const firstHit=first.findAt('comic',3,.20,.30);
  const firstWorkers=workerCreations;

  workerCreations=0;
  const second=makeRuntime();second.beginIssue('comic');
  const restored=await second.prepare('comic',3,pageA);
  const secondHit=second.findAt('comic',3,.20,.30);
  const restoreWorkers=workerCreations;

  workerCreations=0;
  const changed=makeRuntime();changed.beginIssue('comic');
  const rebuilt=await changed.prepare('comic',3,new Blob(['page-b'],{type:'image/jpeg'}));
  const changedWorkers=workerCreations;

  const checks=[
    ['worker build persisted',!!built&&stored.has('comic:3')&&firstWorkers===1],
    ['synchronous lookup hit',firstHit?._panelMapHit===true],
    ['matching hash restored',!!restored&&!!secondHit&&restoreWorkers===0],
    ['changed bytes invalidated',!!rebuilt&&changedWorkers===1]
  ].map(([name,pass])=>({name,pass:!!pass}));
  const output={passed:checks.filter(check=>check.pass).length,total:checks.length,
    firstWorkers,restoreWorkers,changedWorkers,checks};
  process.stdout.write(`${JSON.stringify(output,null,2)}\n`);
  if(output.passed!==output.total)process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1;});
