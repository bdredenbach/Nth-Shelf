'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process'),crypto=require('node:crypto');
assert.equal(process.argv.length,2);
const sha=a=>crypto.createHash('sha256').update(a).digest('hex'),closed=JSON.parse(fs.readFileSync(path.join(__dirname,'fresh-reuse-bindings.json')));for(const file of closed.qaFiles)assert.equal(sha(fs.readFileSync(path.join(__dirname,file.path))),file.sha256,'Public control changed: '+file.path);
const output=path.resolve(__dirname,'../../../dist/test159-fresh-reuse-'+new Date().toISOString().replace(/[:.]/g,'-'));fs.mkdirSync(output,{recursive:true});
const jobs=[['baseline-positive','fresh-reuse-source-chain-contract.cjs',[],{FRESH_REUSE_ARM:'baseline'}],['candidate-positive','fresh-reuse-source-chain-contract.cjs',[],{FRESH_REUSE_ARM:'candidate'}],...['maps','evidence','lifecycle','public','allocation96','allocation100'].map(name=>[name,'fresh-reuse-generated-controls.cjs',[name],{FRESH_REUSE_ARM:'candidate'}]),['baseline-analyzer100','fresh-reuse-generated-controls.cjs',['analyzer100'],{FRESH_REUSE_ARM:'baseline'}],...['analyzer100','weak-missing','weak-collected'].map(name=>[name,'fresh-reuse-generated-controls.cjs',[name],{FRESH_REUSE_ARM:'candidate'}])],receipts=[];let baseline,baselineAnalyzer;
for(const [name,file,args,env] of jobs){
 console.error(JSON.stringify({event:'start',name,utc:new Date().toISOString()}));
 const command=['--max-old-space-size=384','--max-semi-space-size=8','--expose-gc',path.join(__dirname,file),...args],started=Date.now(),result=spawnSync(process.execPath,command,{cwd:__dirname,env:{...process.env,...env},encoding:'utf8',timeout:180000,killSignal:'SIGTERM',maxBuffer:8*1024*1024});
 fs.writeFileSync(path.join(output,name+'.stdout.json'),result.stdout||'');fs.writeFileSync(path.join(output,name+'.stderr.log'),result.stderr||'');let report=null;try{report=JSON.parse(result.stdout);}catch(_){}
 const receipt={name,command:[process.execPath,...command],elapsedSeconds:(Date.now()-started)/1000,exitCode:result.status,signal:result.signal,error:result.error?.message||null,stdoutSha256:sha(result.stdout||''),stderrSha256:sha(result.stderr||''),passed:result.status===0&&report?.passed===true,reportedResourceUsage:report?.resourceUsage||null};
 if(receipt.passed)try{
  if(name==='baseline-positive')baseline=report;
  if(name==='candidate-positive'){assert.deepEqual(report.equivalence,baseline.equivalence,'Direct frozen/candidate graph, contours, masks and RGBA equivalence');assert.equal(report.firstFind96ReplayCalls,baseline.firstFind96ReplayCalls);}
  if(name==='baseline-analyzer100')baselineAnalyzer=report;
  if(name==='analyzer100')assert.deepEqual(report.finalEvidence,baselineAnalyzer.finalEvidence,'Genuine analyzer failure preserves frozen deferral and geometry');
 }catch(error){receipt.passed=false;receipt.comparisonError=error.message;}
 receipts.push(receipt);fs.writeFileSync(path.join(output,name+'.receipt.json'),JSON.stringify(receipt,null,2)+'\n');console.error(JSON.stringify({event:'complete',...receipt}));
 if(!receipt.passed){process.exitCode=1;break;}
}
const passed=receipts.length===jobs.length&&receipts.every(r=>r.passed);fs.writeFileSync(path.join(output,'SUMMARY.json'),JSON.stringify({passed,allJobsPlanned:jobs.length,receipts,browserTimingClaim:false},null,2)+'\n');console.log(JSON.stringify({passed,output,completed:receipts.length,planned:jobs.length,browserTimingClaim:false}));if(!passed)process.exitCode=1;
