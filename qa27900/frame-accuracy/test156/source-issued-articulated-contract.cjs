'use strict';
const assert=require('node:assert/strict'),{root,cv,load}=require('./load.cjs'),{fixture}=require('./generated-articulated-fixture.cjs');
const clone=value=>JSON.parse(JSON.stringify(value));
const familyArg=process.argv[2];assert(process.argv.length<=3&&(!familyArg||['100','103'].includes(familyArg)),'Optional argument is exactly 100 or 103');
const families=familyArg?[Number(familyArg)]:[100,103];
async function run(family){
 const progress=(event,label)=>console.error(JSON.stringify({family,event,label}));progress('start','generated source setup');
 const rt=load(root),{P,U,M,F,C,calls,reads}=rt,modules=family===100?[P,U]:[P,U,M],q=fixture(cv),bytes=q.canvas.toBuffer('image/png'),records=[];
 const img=new cv.Image();img.src=bytes;await img.decode();assert.deepEqual([img.naturalWidth,img.naturalHeight],[q.w,q.h]);
 const ancestor=F.analyzeRGBA(q.a,q.w,q.h,[]),prior=P.analyzeRGBA(q.a,q.w,q.h,ancestor);assert.equal(prior.length,1);
 const unissued=prior.concat(U.analyzeRGBA(q.a,q.w,q.h,prior));if(family===103)unissued.push(...M.analyzeRGBA(q.a,q.w,q.h,unissued));
 assert(U.sourceReplay(unissued[1],q.a,q.w,q.h,unissued.slice(0,1)),'public100 helper accepts generated source');if(family===103)assert(M.sourceReplay(unissued[2],q.a,q.w,q.h,unissued.slice(0,2)),'public103 helper accepts generated source');
 const versions=family===100?[96,100]:[96,100,103];assert.deepEqual(unissued.map(p=>p._structuralGridProof.version),versions);const expected=JSON.stringify(unissued),expectedRings=JSON.stringify(unissued.at(-1)._contours);
 function reader(owners,image=img){const r={currentPanels:owners,panelZoomEnabled:true,panelOverlayToken:0,_panelLoadToken:1,index:0,comic:{id:'generated-source-association'},getPanelImageContext:()=>({img:image}),panelContours:p=>p?._contours,pointInContours:(rings,x,y)=>(rings||[]).reduce((n,ring)=>n^+C.inside(ring,x,y),0),displayPanelContours:(p,c)=>c,findPanelAt:()=>null,zoomToPanel(){}};modules.forEach(m=>m.installReader(r));return r;}
 function difference(before,key){return(calls[key]||0)-(before[key]||0);}
 function admission(label,owners,issued){
  progress('admission-start',label);
  const before={...calls},beforePixels=reads.pixels,r=reader(owners),child=owners.at(-1),saved=JSON.stringify(owners),roots=owners.slice(),rings=r.displayPanelContours(child);
  assert(rings?.length,label);assert.equal(JSON.stringify(rings),expectedRings,label+' exact contours');assert.equal(JSON.stringify(owners),expected,label+' complete ordered owner data');assert(reads.pixels>beforePixels,label+' native source is still read');assert(difference(before,'96.sourceReplay')>0,label+' predecessor source admission remains delegated');
  for(const version of versions.slice(1)){const count=difference(before,version+'.sourceReplay');assert(issued?count===0:count>0,label+' '+version+' own replay '+(issued?'skipped':'required'));}
  const mask=C.raster(rings,q.w,q.h),i=mask.findIndex(Boolean);assert(i>=0);const point=[(i%q.w+.5)/q.w,((i/q.w|0)+.5)/q.h],warm={...calls},warmReads={...reads};
  for(let k=0;k<10;k++){assert.equal(r.displayPanelContours(child),rings);assert.equal(r.findPanelAt(...point),child);}
  assert.deepEqual(calls,warm,label+' warm source analyzers stay idle');assert.deepEqual(reads,warmReads,label+' warm native/fingerprint work stays idle');assert.equal(JSON.stringify(owners),saved,label+' original graph preserved');roots.forEach((p,j)=>assert.equal(owners[j],p));
  records.push({label,issued,versions,ownReplayCounts:Object.fromEntries(versions.slice(1).map(v=>[v,difference(before,v+'.sourceReplay')]))});return r;
 }
 admission('public analyzer output does not issue',unissued,false);
 const detector={detect:async()=>prior};U.install(detector);if(family===103)M.install(detector);progress('start','installed detection');const owners=await detector.detect(bytes);progress('complete','installed detection');assert.deepEqual(owners.map(p=>p._structuralGridProof.version),versions);assert.equal(JSON.stringify(owners),expected);assert.equal(owners[0],prior[0]);
 const originalRoots=owners.slice();admission('fresh completed source association',owners,true);
 admission('parsed restored roots',clone(owners),false);
 const replaced=owners.slice();replaced[0]=clone(replaced[0]);admission('equal replacement parent',replaced,false);
 const token=rt.provider.token(new Uint8ClampedArray([1,2,3,255]),1,1);assert(token&&rt.provider.commit(token));admission('shared native witness eviction',owners,false);
 const changed=cv.createCanvas(q.w,q.h);changed.getContext('2d').fillStyle='#ffffff';changed.getContext('2d').fillRect(0,0,q.w,q.h);const other=new cv.Image();other.src=changed.toBuffer('image/png');await other.decode();
 const r=reader(owners,other),before={...calls};assert(!r.displayPanelContours(owners.at(-1))?.length,'same-size opaque changed source rejects old child');assert(difference(before,'96.sourceReplay')>0,'changed source is checked by predecessor');records.push({label:'same-size changed RGB source rejected',passed:true});
 r.getPanelImageContext=()=>({img});const restoredBefore={...calls};assert.equal(JSON.stringify(r.displayPanelContours(owners.at(-1))),expectedRings);for(const version of versions.slice(1))assert(difference(restoredBefore,version+'.sourceReplay')>0,'restored original source uses full fallback after eviction');records.push({label:'original source revalidated after replacement',passed:true});
 progress('complete','source replacement and restoration');assert.equal(records.length,7);assert.equal(JSON.stringify(owners),expected);originalRoots.forEach((p,i)=>assert.equal(owners[i],p));return {family,records,generatedDimensions:[q.w,q.h],sourceHashes:rt.sourceHashes};
}
(async()=>{const results=[];for(const family of families)results.push(await run(family));assert.equal(results.length,families.length);console.log(JSON.stringify({passed:true,selectedFamilies:families,fullFamilyCoverage:families.length===2,generatedSourcesOnly:true,sourceHarnessOnly:true,browserTimingClaim:false,results,resourceUsage:process.resourceUsage()},null,2));})().catch(error=>{console.error(error.stack);process.exitCode=1;});
