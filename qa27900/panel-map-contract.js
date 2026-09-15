'use strict';

const {api}=require('./harness');

const base={
  mapVersion:api.PanelMapCore.MAP_VERSION,
  proofVersion:api.PanelMapCore.PROOF_VERSION,
  fingerprint:'sha256:page-a',
  status:'partial',
  frames:[]
};
const checks=[
  ['matching record',base,'sha256:page-a',true],
  ['changed page bytes',base,'sha256:page-b',false],
  ['changed map algorithm',{...base,mapVersion:'older-map'},'sha256:page-a',false],
  ['changed proof rules',{...base,proofVersion:'older-proof'},'sha256:page-a',false],
  ['unfinished record',{...base,status:'building'},'sha256:page-a',false],
  ['malformed frame list',{...base,frames:null},'sha256:page-a',false]
].map(([name,record,fingerprint,expected])=>{
  const actual=api.PanelMapCore.isCompatible(record,fingerprint);
  return {name,expected,actual,pass:actual===expected};
});

const output={passed:checks.filter(check=>check.pass).length,total:checks.length,checks};
process.stdout.write(`${JSON.stringify(output,null,2)}\n`);
if(output.passed!==output.total)process.exitCode=1;
