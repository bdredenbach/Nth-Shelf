// NTH SHELF V2.79.05 — DETERMINISTIC STRICT PANEL MAP
//
// A panel map is a collection of frames that V2.79.04 has already proven.
// The map never predicts geometry and never weakens a proof threshold. Its
// fixed page probes merely run the existing bounded detector before a tap,
// after which interaction is a smallest-containing-polygon lookup.

const PanelMapCore = {
  MAP_VERSION: 'panel-map-exp-44',
  PROOF_VERSION: 'frame-proof-2.79.35',

  // Two conservative columns cover the common left/right comic layout while
  // the three row anchors select the same stable adaptive seed families used
  // by the live detector. Missing panels remain ordinary V2.79.04 fallbacks.
  DEFAULT_PROBES: [
    {name:'top-left',x:.22,y:.16},
    {name:'top-right',x:.72,y:.16},
    {name:'middle-left',x:.22,y:.48},
    {name:'middle-right',x:.72,y:.48},
    {name:'bottom-left',x:.22,y:.82},
    {name:'bottom-right',x:.72,y:.82}
  ],

  _area(frame){
    const q=frame?._quad;
    if(!Array.isArray(q)||q.length!==4)return Math.max(0,(Number(frame?.w)||0)*(Number(frame?.h)||0));
    return Math.abs(q.reduce((sum,p,i)=>{
      const next=q[(i+1)%q.length];
      return sum+p.x*next.y-next.x*p.y;
    },0)/2);
  },

  _inside(frame,x,y){
    const q=frame?._quad;
    if(Array.isArray(q)&&q.length===4){
      let hit=false;
      for(let i=0,j=q.length-1;i<q.length;j=i++){
        const a=q[i],b=q[j];
        if(((a.y>y)!==(b.y>y))&&
          x<(b.x-a.x)*(y-a.y)/(b.y-a.y+1e-9)+a.x)hit=!hit;
      }
      return hit;
    }
    return !!frame&&x>=frame.x&&x<=frame.x+frame.w&&y>=frame.y&&y<=frame.y+frame.h;
  },

  _quadDistance(a,b){
    if(!Array.isArray(a)||!Array.isArray(b)||a.length!==4||b.length!==4)return Infinity;
    return a.reduce((sum,p,i)=>sum+Math.hypot(p.x-b[i].x,p.y-b[i].y),0)/4;
  },

  _finite(value,fallback=0){
    const n=Number(value);
    return Number.isFinite(n)?n:fallback;
  },

  isStrictFrame(result){
    const e=result?._frameEnvelope||{};
    const area=this._area(result);
    const owner=String(result?._geometryOwner||'');
    const hasQuad=Array.isArray(result?._quad)&&result._quad.length===4;
    const provenRect=owner==='orthogonal-frame'&&this._finite(result?.w)>0&&this._finite(result?.h)>0;
    return (hasQuad||provenRect)&&
      e.chainConnected===true&&(owner==='skewed-frame'||owner==='orthogonal-frame')&&
      area>=.020&&area<=.50&&(e.confidence||0)>=.70&&(e.seedConsensus||0)>=2;
  },

  serializeFrame(result){
    if(!this.isStrictFrame(result))return null;
    const q=Array.isArray(result._quad)?result._quad.map(p=>({x:this._finite(p.x),y:this._finite(p.y)})):[
      {x:this._finite(result.x),y:this._finite(result.y)},
      {x:this._finite(result.x)+this._finite(result.w),y:this._finite(result.y)},
      {x:this._finite(result.x)+this._finite(result.w),y:this._finite(result.y)+this._finite(result.h)},
      {x:this._finite(result.x),y:this._finite(result.y)+this._finite(result.h)}
    ];
    const xs=q.map(p=>p.x),ys=q.map(p=>p.y);
    const x=Math.max(0,Math.min(...xs)),y=Math.max(0,Math.min(...ys));
    const x1=Math.min(1,Math.max(...xs)),y1=Math.min(1,Math.max(...ys));
    const e=result._frameEnvelope||{};
    const ownership=result._frameOwnership||{};
    return {
      x,y,w:Math.max(.001,x1-x),h:Math.max(.001,y1-y),
      _quad:q,
      _geometryType:result._geometryType||'tap-neighborhood-frame',
      _geometryOwner:result._geometryOwner,
      _frameEnvelope:{
        chainConnected:true,
        analysisWidth:this._finite(e.analysisWidth),
        analysisHeight:this._finite(e.analysisHeight),
        confidence:this._finite(e.confidence),
        seedConsensus:this._finite(e.seedConsensus),
        seedSource:String(e.seedSource||''),
        seedCoverage:this._finite(e.seedCoverage),
        relativeAdjScore:this._finite(e.relativeAdjScore),
        adjacencyScore:this._finite(e.adjacencyScore),
        weakestAdj:this._finite(e.weakestAdj),
        minThickness:this._finite(e.minThickness),
        adaptiveFastPath:e.adaptiveFastPath===true,
        localConsensusVerifier:e.localConsensusVerifier===true,
        localConfirmations:this._finite(e.localConfirmations),
        wasmRailKernel:e.wasmRailKernel===true
      },
      _frameOwnership:{
        owns:ownership.owns===true,
        owner:String(ownership.owner||''),
        reason:String(ownership.reason||''),
        confidence:this._finite(ownership.confidence),
        trustedAxisDeparture:this._finite(ownership.trustedAxisDeparture),
        angleSpace:String(ownership.angleSpace||''),
        relativeRailProof:ownership.relativeRailProof===true
      },
      _panelMapArea:this._area(result)
    };
  },

  cloneFrame(frame){
    if(!frame)return null;
    return {
      ...frame,
      _quad:frame._quad?.map(p=>({...p})),
      _frameEnvelope:{...(frame._frameEnvelope||{})},
      _frameOwnership:{...(frame._frameOwnership||{})}
    };
  },

  mergeFrames(existing,incoming){
    const out=[];
    for(const source of [...(existing||[]),...(incoming||[])]){
      const frame=this.serializeFrame(source)||(
        this.isStrictFrame(source)?this.cloneFrame(source):null
      );
      if(!frame)continue;
      const oldIndex=out.findIndex(old=>this._quadDistance(old._quad,frame._quad)<=.025);
      if(oldIndex<0){
        out.push(frame);
      }else{
        const old=out[oldIndex];
        const oldProof=(old._frameEnvelope?.seedConsensus||0)+(old._frameEnvelope?.confidence||0);
        const newProof=(frame._frameEnvelope?.seedConsensus||0)+(frame._frameEnvelope?.confidence||0);
        if(newProof>oldProof)out[oldIndex]=frame;
      }
    }
    return out.sort((a,b)=>this._area(a)-this._area(b));
  },

  findAt(frames,x,y){
    const matches=(frames||[]).filter(frame=>this._inside(frame,x,y))
      .sort((a,b)=>this._area(a)-this._area(b));
    return matches.length?this.cloneFrame(matches[0]):null;
  },

  isCompatible(record,fingerprint){
    return !!record&&record.mapVersion===this.MAP_VERSION&&
      record.proofVersion===this.PROOF_VERSION&&record.fingerprint===fingerprint&&
      (record.status==='partial'||record.status==='complete')&&Array.isArray(record.frames);
  },

  _pairedSkewRows(candidates){
    const pairs=[['top-left','top-right'],['middle-left','middle-right'],['bottom-left','bottom-right']];
    let frames=[];
    const acceptedRows=[];
    for(const [leftName,rightName] of pairs){
      const left=candidates.get(leftName),right=candidates.get(rightName);
      if(!left||!right||left._geometryOwner!=='skewed-frame'||right._geometryOwner!=='skewed-frame')continue;
      if(this._quadDistance(left._quad,right._quad)<=.060)continue;
      const lx0=Math.min(...left._quad.map(p=>p.x)),lx1=Math.max(...left._quad.map(p=>p.x));
      const rx0=Math.min(...right._quad.map(p=>p.x)),rx1=Math.max(...right._quad.map(p=>p.x));
      const ly0=Math.min(...left._quad.map(p=>p.y)),ly1=Math.max(...left._quad.map(p=>p.y));
      const ry0=Math.min(...right._quad.map(p=>p.y)),ry1=Math.max(...right._quad.map(p=>p.y));
      const seam=rx0-lx1;
      const leftCenter=(lx0+lx1)/2,rightCenter=(rx0+rx1)/2;
      const leftHeight=ly1-ly0,rightHeight=ry1-ry0;
      const verticalDrift=Math.abs((ly0+ly1)/2-(ry0+ry1)/2);
      // Background authority requires a complete independently proven row:
      // distinct left/right skewed cells, page-wide coverage and compatible
      // vertical placement. A singleton or a two-panel union is never stored.
      if(lx0>.12||rx1<.88||leftCenter>=rightCenter||seam<-.18||seam>.12||
        verticalDrift>.15||Math.min(leftHeight,rightHeight)/Math.max(leftHeight,rightHeight)<.55)continue;
      frames=this.mergeFrames(frames,[left,right]);
      acceptedRows.push(leftName.replace('-left','').replace('-right',''));
    }
    return {frames,acceptedRows};
  },

  build(img,{probes,log}={}){
    if(!img||typeof PanelGeometry==='undefined'||!PanelGeometry.refineAdaptiveImage){
      throw new Error('decoded proven-frame route unavailable');
    }
    const started=Date.now();
    const selected=Array.isArray(probes)&&probes.length?probes:this.DEFAULT_PROBES;
    const candidates=new Map();
    const attempts=[];
    for(const probe of selected){
      const seed={
        x:.011,y:.013,w:.954,h:.957,
        _tap:{x:this._finite(probe.x,.5),y:this._finite(probe.y,.5)},
        _identitySource:'geometry-rescue',
        _baselinePanelCount:0,
        _geometryOnlyRescue:true,
        _panelMapProbe:true
      };
      const before=Date.now();
      const result=PanelGeometry.refineAdaptiveImage(img,seed,log);
      const frame=this.serializeFrame(result);
      if(frame)candidates.set(String(probe.name||''),frame);
      attempts.push({name:String(probe.name||''),x:seed._tap.x,y:seed._tap.y,
        proven:!!frame,owner:frame?._geometryOwner||null,accepted:false,elapsedMs:Date.now()-before});
    }
    const paired=this._pairedSkewRows(candidates);
    const frames=paired.frames;
    for(const attempt of attempts){
      const frame=candidates.get(attempt.name);
      attempt.accepted=!!frame&&frames.some(stored=>this._quadDistance(stored._quad,frame._quad)<=.025);
    }
    return {
      mapVersion:this.MAP_VERSION,
      proofVersion:this.PROOF_VERSION,
      status:'partial',
      frames,
      probeCount:selected.length,
      acceptedCount:frames.length,
      acceptedRows:paired.acceptedRows,
      elapsedMs:Date.now()-started,
      attempts
    };
  }
};
