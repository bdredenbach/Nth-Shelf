// Private pixel fixture: require every independent rim, reject blank/transparent input.
const fs=require('fs'),assert=require('assert/strict'),D=require('../../../js/panels-structural-grid.js');
const raw=new Uint8ClampedArray(fs.readFileSync(process.env.QA_CANONICAL||'recovery-page49/canonical.rgba'));
const baseline=[{x:15/585,y:15/900,w:555/585,h:607/900},{x:18/585,y:627/900,w:551/585,h:254/900}],log=[],positive=D.completeThinRimsRGBA(raw,585,900,baseline);
assert.equal(positive.length,5);assert.strictEqual(positive[4],baseline[1]);
for(let frame=0;frame<4;frame++)for(let edge=0;edge<4;edge++){const rgba=raw.slice(),e=positive[frame]._structuralGridProof.rims[frame][edge];for(let t=e.a;t<=e.b;t++)for(let d=-7;d<=7;d++){const x=e.axis==='V'?e.pos+d:t,y=e.axis==='V'?t:e.pos+d;if(x<0||x>=585||y<0||y>=900)continue;rgba.set([180,160,128,255],(y*585+x)*4);}const n=D.completeThinRimsRGBA(rgba,585,900,baseline).length;log.push({frame,edge,count:n});assert.equal(n,0,'erased rim '+frame+':'+edge);}
const transparent=raw.slice();for(let i=3;i<transparent.length;i+=4)transparent[i]=0;
assert.deepEqual(D.completeThinRimsRGBA(transparent,585,900,baseline),[]);assert.deepEqual(D.completeThinRimsRGBA(new Uint8ClampedArray(raw.length).fill(255),585,900,baseline),[]);assert.deepEqual(D.completeThinRimsRGBA(raw,585,900,[{...baseline[0],_identitySource:'proved'},baseline[1]]),[]);
fs.writeFileSync(process.env.QA_NEGATIVE_OUTPUT||'recovery-page49/negative-report.json',JSON.stringify(log));console.log('PASS 16 independently erased rims, transparent/flat/proved-owner rejection; positive five selections');
