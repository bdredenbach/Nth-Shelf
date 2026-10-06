'use strict';
const assert=require('node:assert/strict'),{api}=require('./frontier-contract.cjs'),D=api.PanelStableFrontierCells,w=585,h=900,R=new Uint8ClampedArray(w*h*4);for(let i=0;i<w*h;i++)R.set([110,130,155,255],4*i);
const body=new Uint8Array(w*h);for(let y=300;y<390;y++)for(let x=220;x<350;x++){const d=((x-285)/64)**2+((y-345)/44)**2;if(d<=1){body[y*w+x]=1;R.set(d>.88?[12,12,12,255]:[255,255,255,255],4*(y*w+x));}}
for(let y=323;y<368;y++)for(let x=244;x<326;x++)if(y%10<6&&x%9<3)R.set([12,12,12,255],4*(y*w+x));
const p={x:210/w,y:290/h,w:150/w,h:110/h,_contours:[[{x:210/w,y:290/h},{x:360/w,y:290/h},{x:360/w,y:400/h},{x:210/w,y:400/h}]]};
const full=D.displayBodies(R,w,h,[p]);assert.equal(full.length,1);assert.equal(full[0].owner,0);assert(full[0].indices.length>500);assert.equal(D.displayBodies(R,w,h,[p,p]).length,0,'Ambiguous source speech body accepted');
const partial={x:210/w,y:290/h,w:75/w,h:110/h};assert.equal(D.displayBodies(R,w,h,[partial]).length,0,'Partial source speech body accepted');
const noInk=R.slice();for(let i=0;i<w*h;i++)if(body[i])noInk.set([255,255,255,255],i*4);assert.equal(D.displayBodies(noInk,w,h,[p]).length,0,'Unenclosed bright region accepted');
const noLetters=R.slice();for(let y=310;y<380;y++)for(let x=235;x<335;x++)if(body[y*w+x])noLetters.set([255,255,255,255],4*(y*w+x));assert.equal(D.displayBodies(noLetters,w,h,[p]).length,0,'Unlettered bright body accepted');
console.log(JSON.stringify({passed:true,sourceIndependentSpeechBodyPositive:true,ambiguousAndPartialAndUnenclosedAndUnletteredNegatives:true}));
