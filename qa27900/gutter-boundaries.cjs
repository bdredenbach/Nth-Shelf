'use strict';

// Independent boundary fixtures: expected content extents are specified here,
// rather than copied from a previous detector's output. No comic is required.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const context={console,window:{},document:{createElement(){
  let drawn;
  return {getContext(){return {
    drawImage(image){drawn=image;},
    getImageData(){return {data:drawn.rgba};}
  };}};
}}};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/panels.js'),'utf8'),context);
const split=vm.runInContext('splitByGutter',context);
const detect=context.window.PanelDetect;
const plain=value=>JSON.parse(JSON.stringify(value));
const cases=[
  ['right/bottom gutter',[30,30,30,0,0],[[0,3]]],
  ['leading and trailing gutters',[0,0,30,30,30,0,0],[[2,5]]],
  ['all quiet',[0,0,0,0],[]],
  ['no gutter',[30,30,30],[[0,3]]],
  ['short trailing run',[30,30,30,0],[[0,4]]],
  ['short leading run',[0,30,30],[[0,3]]],
  ['short internal run',[30,30,0,30,30],[[0,5]]],
  ['two content spans',[0,0,30,30,30,0,0,0,30,30,0,0],[[2,5],[8,10]]],
  ['threshold is content',[10,10,10,0,0],[[0,3]]],
  ['empty profile',[],[]]
];
for(const [name,profile,expected] of cases){
  assert.deepEqual(plain(split(profile,profile.length,10,2)),expected,name);
}

const width=120,height=140;
const rectangles=[
  {x:8,y:10,w:40,h:50},{x:58,y:10,w:50,h:50},
  {x:8,y:70,w:40,h:56},{x:58,y:70,w:50,h:56}
];
const rgba=new Uint8ClampedArray(width*height*4);
for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const content=rectangles.some(r=>x>=r.x&&x<r.x+r.w&&y>=r.y&&y<r.y+r.h);
  const value=content?((x+y)%2?200:80):0;
  const i=(y*width+x)*4;
  rgba[i]=rgba[i+1]=rgba[i+2]=value;rgba[i+3]=255;
}
const found=plain(detect._analyze({width,height,rgba}));
assert.deepEqual(found,rectangles.map(r=>({
  x:r.x/width,y:r.y/height,w:r.w/width,h:r.h/height
})),'both axes end at artwork boundaries, excluding final page margins');
assert.equal(found.length,4,'all four real panels remain');
process.stdout.write(`Gutter boundaries: ${cases.length} profiles and a four-panel image passed.\n`);
