'use strict';
// Only this generated prerequisite uses geometry doubles. Both installed
// adapters, the96 geometry engine and the common witness/guards remain real.
module.exports=`
const CityFixture={replays:0,prepared:0,fail:false};
const PanelCurvedHostPartition={eligible:p=>Array.isArray(p)&&p.length===2&&p.every(q=>q.kind==='generated-city-prior'),sourceOwners:()=>true,discover:()=>({index:0}),captionEvidence:()=>({seeds:[]})};
const PanelCurvedHostNative={assemble:()=>null,proofRecords:{createInstalledEngine(){
 const VERSION='generated-city-witness-control',METHOD='generated-city-witness-control';
 const snapshots=new Map();let original=null;
 const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 const freeze=v=>{if(v&&typeof v==='object'){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
 function make(a,w,h,prior,W,H,installed){
  CityFixture.prepared++;if(CityFixture.fail)return null;
  const anchors=JSON.parse(JSON.stringify(prior)),ring=(x,y,w,h)=>[[{x,y},{x:x+w,y},{x:x+w,y:y+h},{x,y:y+h}]],
   children=[0,1].map(part=>({x:part*.5,y:0,w:.5,h:.4,_identitySource:'structural-grid-frame',_geometryOwner:'structural-grid-contours',_geometryType:'native-curved-host-complementary-single',_contours:ring(part*.5,0,.5,.4),_structuralGridProof:{version:VERSION,method:METHOD,analysisWidth:w,analysisHeight:h,sourceWidth:W,sourceHeight:H,part,anchors,geometry:{retiredIndex:0}}}));
  if(installed)for(const child of children){freeze(child._contours);freeze(child._structuralGridProof);}
  original=new Uint8ClampedArray(a);snapshots.clear();children.forEach(p=>snapshots.set(JSON.stringify(p),true));return children;
 }
 function validPreparedPanel(p){return snapshots.has(JSON.stringify(p));}
 function validPreparedPair(children,prior){return children.length===2&&children.every((p,i)=>validPreparedPanel(p)&&p._structuralGridProof.part===i&&same(p._structuralGridProof.anchors,prior));}
 const engine={VERSION,METHOD,prepare:(a,w,h,prior,W,H)=>make(a,w,h,prior,W,H,false)||[],validPreparedPanel,validPreparedPair,
  replayPrepared(a,w,h,W,H,readWindow,children,prior){CityFixture.replays++;return validPreparedPair(children,prior)&&original?.length===a.length&&a.every((v,i)=>v===original[i]);}};
 return{engine,prepareInstalled(a,w,h,prior,W,H){const children=make(a,w,h,prior,W,H,true);return children?{children,retiredIndex:0}:null;}};
}}};
`;
