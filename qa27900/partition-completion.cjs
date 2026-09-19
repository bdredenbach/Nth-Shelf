'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const scope={console,window:{}};vm.createContext(scope);
vm.runInContext(fs.readFileSync(require.resolve('../js/panels.js'),'utf8'),scope);
const detector=scope.window.PanelDetect;
function cell(x,y,w,h){return {x,y,w,h,_quad:[{x,y},{x:x+w,y},{x:x+w,y:y+h},{x,y:y+h}],
  _identitySource:'page-partition',_partitionProof:{connected:true,analysisWidth:600,analysisHeight:900}};}
const map=[cell(.05,.05,.45,.45),cell(.5,.05,.45,.45),cell(.05,.5,.45,.45),cell(.5,.5,.45,.45)];
const old={...map[1],_identitySource:'closed-frame',_closedFrameProof:{connected:true},tag:'original evidence'};
delete old._partitionProof;
const before=JSON.stringify(old),single=[old];
const complete=detector._completePartition(single,map);
assert.equal(complete.length,4,'add all missing disjoint leaves');
assert.equal(complete[0],old,'retain original object and evidence');
assert.equal(JSON.stringify(old),before,'do not mutate proven geometry');
assert.equal(complete.filter(p=>p===map[1]).length,0,'do not duplicate equivalent identity');
const composite={...old,...cell(.05,.05,.9,.45),_closedFrameProof:{connected:true}};
const group=[composite];
assert.equal(detector._completePartition(group,map),group,'never silently split an established identity');
const uncertain={...old,_quad:old._quad.map(p=>({...p,x:p.x+.03}))};
const displaced=[uncertain];
assert.equal(detector._completePartition(displaced,map),displaced,'reject conflicting fitted borders');
const overlap={...old,_quad:old._quad.map((p,i)=>i===0||i===3?{...p,x:p.x-2/600}:p)};
const nearFit=[overlap];
assert.equal(detector._completePartition(nearFit,map),nearFit,'near-matching old rail cannot overlap an added leaf');
for(const offered of [
  [map[0],map[1],map[2],map[2]],
  [map[0],map[1],map[2],cell(.45,.45,.5,.5)],
  map.map((p,i)=>i===0?{...p,_partitionProof:{...p._partitionProof,connected:false}}:p),
  map.map((p,i)=>i===0?{...p,_quad:[{x:NaN,y:0},...p._quad.slice(1)]}:p)
]) assert.equal(detector._completePartition(single,offered),single,'ambiguous or malformed map cannot augment existing owners');
console.log('partition completion: exact old identity, disjoint additions, conflicting borders and composite veto passed');
