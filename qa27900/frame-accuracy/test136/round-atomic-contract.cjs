'use strict';

/* Public contract scaffold for the portable proof80 reaction-inset module.
 * Run without original images or private harnesses:
 *   node round-atomic-contract.cjs --fixtures-only
 *   node round-atomic-contract.cjs --module ./panels-round-atomic-inset.js
 * The first command checks the generator only. It does not run a detector.
 * Missing modules are BLOCKED (exit 2), never a skipped or passing detector.
 * Ground truth is not passed into analyzeRGBA or replayRGBA.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const fixtures = require('./round-atomic-fixtures.cjs');
const plain = value => JSON.parse(JSON.stringify(value));

function loadSourceApi(sourceRoot, modulePath) {
  const index = fs.readFileSync(path.join(sourceRoot, 'index.html'), 'utf8');
  const scripts = [...index.matchAll(/src="(js\/panels[^"]*\.js)"/g)].map(match => path.resolve(sourceRoot, match[1]));
  assert.ok(scripts.length, 'source index contains real panel dependencies');
  const files=scripts.map(file=>path.basename(file)==='panels-round-atomic-inset.js'?path.resolve(modulePath):file);
  if(!scripts.some(file=>path.basename(file)==='panels-round-atomic-inset.js'))files.push(path.resolve(modulePath));
  const code=files.map(file=>fs.readFileSync(file,'utf8')).join('\n');
  // Real source helpers, isolated evaluation, no private image/checkpoint
  // harness and no runtime edits. These tests never need a source canvas.
  return new Function('document', 'Image', 'window', 'module', code +
    '\nreturn PanelRoundAtomicInset;')(
    {createElement() { throw new Error('Synthetic source contract does not provide a browser canvas'); }},
    function UnavailableImage() { throw new Error('Synthetic source contract does not decode external images'); },
    {}, undefined);
}

// Deliberately independent of the implementation's rasterizer. Pixel-center,
// even-odd scan conversion matches the public normalized contour convention.
function rasterPanel(panel, w, h) {
  assert.ok(Array.isArray(panel?._contours) && panel._contours.length, 'descriptor has normalized contours');
  const out = new Uint8Array(w * h);
  for (const ring of panel._contours) {
    assert.ok(Array.isArray(ring) && ring.length >= 3, 'each contour is a polygon');
    for (const point of ring) assert.ok(Number.isFinite(point.x) && Number.isFinite(point.y) &&
      point.x >= 0 && point.x <= 1 && point.y >= 0 && point.y <= 1, 'finite normalized vertices');
  }
  for (let y = 0; y < h; y++) {
    const v = (y + .5) / h, intersections = [];
    for (const ring of panel._contours) for (let j = 0; j < ring.length; j++) {
      const a = ring[j], b = ring[(j + 1) % ring.length];
      if ((a.y > v) !== (b.y > v)) intersections.push((a.x + (v - a.y) * (b.x - a.x) / (b.y - a.y)) * w);
    }
    intersections.sort((a, b) => a - b);
    assert.equal(intersections.length % 2, 0, 'closed contours have an even scan intersection count');
    for (let k = 0; k + 1 < intersections.length; k += 2) {
      const left = Math.max(0, Math.ceil(intersections[k] - .5)), right = Math.min(w, intersections[k + 1] - .5);
      for (let x = left; x < right; x++) out[y * w + x] = 1;
    }
  }
  return out;
}
function overlap(a, b) { let n = 0; for (let i = 0; i < a.length; i++) n += +(a[i] && b[i]); return n; }
function matchesColor(rgba, i, color) { return color.every((v, k) => rgba[4 * i + k] === v); }
function components(mask, w, h) {
  const visited = new Uint8Array(mask.length), queue = new Int32Array(mask.length), result = [];
  for (let i = 0; i < mask.length; i++) if (mask[i] && !visited[i]) {
    let head = 0, length = 1; queue[0] = i; visited[i] = 1;
    while (head < length) {
      const p = queue[head++], x = p % w, y = p / w | 0;
      for (const j of [x ? p - 1 : -1, x + 1 < w ? p + 1 : -1, y ? p - w : -1, y + 1 < h ? p + w : -1]) {
        if (j >= 0 && mask[j] && !visited[j]) { visited[j] = 1; queue[length++] = j; }
      }
    }
    result.push(Array.from(queue.subarray(0, length)));
  }
  return result;
}

function validateFixtures() {
  const list = fixtures.fixtures(), base = list.find(f => f.name === 'base');
  assert.equal(list.length, 15);
  assert.equal(list.filter(f => f.expectedCandidates === 1).length, 10);
  assert.deepEqual(fixtures.scene().rgba, fixtures.scene().rgba, 'procedural generation is deterministic');
  assert.deepEqual(base.owned, fixtures.scene().owned, 'ground truth is deterministic');
  for (const f of list) {
    assert.equal(f.rgba.length, f.w * f.h * 4);
    assert.equal(f.owned.length, f.w * f.h);
    for (let i = 3; i < f.rgba.length; i += 4) assert.equal(f.rgba[i], 255, 'fixtures are fully opaque');
    assert.equal(overlap(f.owned, f.forbidden), 0, `${f.name}: intended ownership and distractors are disjoint`);
    for (const [name, mask] of Object.entries(f.parts)) {
      assert.ok(fixtures.count(mask) > 0, `${f.name}: ${name} is nonempty`);
      assert.equal(overlap(f.owned, mask), fixtures.count(mask), `${f.name}: all requested atoms belong to ground truth`);
    }
    if (f.expectedCandidates) {
      for (const part of ['rimAndInterior', 'attachedGlyphs', 'letteredBalloon', 'punctuationStem', 'punctuationDot'])
        assert.ok(f.parts[part], `${f.name}: independent ${part} label`);
      assert.equal(overlap(f.parts.rimAndInterior, f.parts.punctuationStem), 0, `${f.name}: stem is detached from rim`);
      assert.equal(overlap(f.parts.rimAndInterior, f.parts.punctuationDot), 0, `${f.name}: dot is detached from rim`);
      assert.equal(overlap(f.parts.punctuationStem, f.parts.punctuationDot), 0, `${f.name}: punctuation pieces are distinct`);
    }
  }
  for (const name of ['shifted', 'mirrored', 'quarter_rotated', 'half_rotated']) {
    const f = list.find(q => q.name === name);
    assert.equal(fixtures.count(f.owned), fixtures.count(base.owned), `${name}: exact transform preserves every owned pixel`);
    for (const key of Object.keys(base.parts)) assert.equal(fixtures.count(f.parts[key]), fixtures.count(base.parts[key]));
  }
  const ambiguous = list.find(f => f.name === 'two_balloons_abstains');
  const white = Uint8Array.from(ambiguous.owned, (_, i) => +matchesColor(ambiguous.rgba, i, fixtures.PALETTE.white));
  const whiteComponents = components(white, ambiguous.w, ambiguous.h);
  const balloonComponents = ['letteredBalloon', 'secondLetteredBalloon'].map(key =>
    whiteComponents.filter(c => c.some(i => ambiguous.parts[key][i])));
  assert.equal(balloonComponents[0].length, 1, 'first balloon has one connected white fill');
  assert.equal(balloonComponents[1].length, 1, 'second balloon has one connected white fill');
  assert.notEqual(balloonComponents[0][0], balloonComponents[1][0], 'ambiguous fixture has two distinct white bodies');
  // Independent objective geometry: both fills are close enough to compete
  // for the same anchored lettering chain, rather than one remote balloon.
  const yellow = [];
  for (let i = 0; i < ambiguous.owned.length; i++) if (ambiguous.parts.attachedGlyphs[i] &&
    matchesColor(ambiguous.rgba, i, fixtures.PALETTE.glyph)) yellow.push([i % ambiguous.w, i / ambiguous.w | 0]);
  const balloonGaps = balloonComponents.map(([body]) => {
    let gap = Infinity;
    for (const i of body) for (const [x, y] of yellow)
      gap = Math.min(gap, Math.hypot(i % ambiguous.w - x, (i / ambiguous.w | 0) - y));
    assert.ok(gap <= 88 * .06, `ambiguous balloon lies within source-lettering reach (${gap})`);
    return gap;
  });
  return {state: 'fixtures_validated', detectorExecuted: false, detectorPass: null,
    sourceIndependent: true, positiveScenes: 10, abstentionScenes: 5,
    independentBalloonGaps: balloonGaps, cases: list.map(fixtures.summary)};
}

function ownershipMetrics(f, panel) {
  const mask = rasterPanel(panel, f.w, f.h), parts = {};
  for (const [name, truth] of Object.entries(f.parts)) {
    const wanted = fixtures.count(truth), retained = overlap(truth, mask);
    parts[name] = {wanted, retained, missing: wanted - retained};
  }
  const exclusions = {};
  for (const [name, truth] of Object.entries(f.forbiddenParts)) exclusions[name] = overlap(truth, mask);
  let extraPixels = 0, extraNonInkPixels = 0;
  for (let i = 0; i < mask.length; i++) if (mask[i] && !f.owned[i]) {
    extraPixels++;
    if (Math.max(f.rgba[4 * i], f.rgba[4 * i + 1], f.rgba[4 * i + 2]) >= 120) extraNonInkPixels++;
  }
  return {parts, exclusions, ownedPixels: fixtures.count(mask), expectedPixels: fixtures.count(f.owned),
    missingPixels: fixtures.count(f.owned) - overlap(f.owned, mask), extraPixels, extraNonInkPixels};
}
function assertOwnership(metrics, name) {
  for (const [part, counts] of Object.entries(metrics.parts))
    assert.equal(counts.missing, 0, `${name}: every source pixel in ${part} must survive as an indivisible atom`);
  for (const [part, stolen] of Object.entries(metrics.exclusions))
    assert.equal(stolen, 0, `${name}: ${part} must not be annexed`);
  assert.equal(metrics.extraNonInkPixels, 0, `${name}: no exterior color or background shards`);
  assert.ok(metrics.extraPixels <= Math.max(4, Math.ceil(metrics.expectedPixels * .001)),
    `${name}: source-ink collar is bounded (${metrics.extraPixels} extra pixels)`);
}

async function runContract(api, options = {}) {
  const report = {state: 'running', detectorExecuted: true, sourceIndependent: true, proofVersion: 80,
    cases: [], checks: [], failures: []};
  const check = async (name, fn) => {
    try { const detail = await fn(); report.checks.push({name, passed: true, ...(detail || {})}); }
    catch (error) { report.checks.push({name, passed: false, error: error.message}); report.failures.push({name, error: error.message}); }
    if (options.onCheck) options.onCheck(report.checks[report.checks.length - 1]);
  };
  for (const name of ['analyzeRGBA', 'validPanel', 'replayRGBA', 'supplementImage', 'installReader', 'install'])
    assert.equal(typeof api[name], 'function', `portable module exports ${name}`);
  const list = fixtures.fixtures().filter(f => !options.caseName || f.name === options.caseName);
  assert.ok(list.length, 'requested fixture exists');
  const accepted = [];
  for (const f of list) await check('scene:' + f.name, async () => {
    const before = f.rgba.slice(), prior = [], logs = [];
    const output = await api.analyzeRGBA(f.rgba, f.w, f.h, prior, message => logs.push(String(message)));
    assert.deepEqual(f.rgba, before, `${f.name}: source RGBA is read-only`);
    assert.deepEqual(prior, [], `${f.name}: prior owner array is read-only`);
    assert.ok(Array.isArray(output), `${f.name}: analyzeRGBA returns a descriptor array`);
    const row = {name: f.name, expectedCandidates: f.expectedCandidates, candidates: output.length};
    report.cases.push(row);
    assert.equal(output.length, f.expectedCandidates, `${f.name}: candidate count`);
    if (!output.length) return row;
    const panel = output[0];
    assert.equal(panel?._structuralGridProof?.version, 80, `${f.name}: proof80 reserved for this descriptor`);
    assert.equal(api.validPanel(panel), true, `${f.name}: generated descriptor validates`);
    assert.equal(panel._quad, undefined, `${f.name}: bounding quadrilateral cannot replace atomic contours`);
    assert.equal(panel._outline, undefined, `${f.name}: one outline cannot replace disconnected punctuation`);
    const metrics = ownershipMetrics(f, panel);
    row.ownership = metrics;
    accepted.push({f, panel});
    assertOwnership(metrics, f.name);
    const restored = plain(panel);
    assert.equal(api.validPanel(restored), true, `${f.name}: JSON-persisted descriptor validates without object identity`);
    assert.deepEqual(rasterPanel(restored, f.w, f.h), rasterPanel(panel, f.w, f.h), `${f.name}: persistence keeps all ownership pixels`);
    return {candidates: output.length, ownedPixels: metrics.ownedPixels};
  });

  // Report geometry failures above before proof and integration checks. A
  // partially working candidate may still exercise the proof safety contract.
  const first = accepted[0];
  if (first) {
    const {f, panel} = first;
    await check('deterministic_descriptor', async () => {
      const rerun = await api.analyzeRGBA(f.rgba.slice(), f.w, f.h, []);
      assert.deepEqual(plain(rerun), [plain(panel)], 'independent pixel replay is deterministic');
    });
    await check('source_replay_roundtrip', async () => {
      const replayed = await api.replayRGBA(f.rgba.slice(), f.w, f.h, [plain(panel)], []);
      assert.equal(replayed, true, 'replay reproduces persisted descriptor from pixels');
    });
    await check('source_replay_rejects_removed_balloon', async () => {
      const changed = f.rgba.slice();
      for (let i = 0; i < f.owned.length; i++) if (f.parts.letteredBalloon[i])
        changed.set([...fixtures.PALETTE.background, 255], 4 * i);
      const replayed = await api.replayRGBA(changed, f.w, f.h, [plain(panel)], []);
      assert.equal(replayed, false, 'stale descriptor receives no source authority after balloon deletion');
    });
    const mutations = [
      ['removed_proof', p => { delete p._structuralGridProof; }],
      ['wrong_proof_version', p => { p._structuralGridProof.version = 79; }],
      ['wrong_width', p => { p._structuralGridProof.analysisWidth = f.w + 1; }],
      ['wrong_height', p => { p._structuralGridProof.analysisHeight = f.h + 1; }],
      ['moved_bounds', p => { p.x += 1 / f.w; }],
      ['expanded_bounds', p => { p.w += 1 / f.w; }],
      ['moved_vertex', p => { p._contours[0][0].x += 1 / f.w; }],
      ['missing_contours', p => { p._contours = []; }],
      ['bounding_rectangle', p => { p._contours = [[{x:p.x,y:p.y},{x:p.x+p.w,y:p.y},{x:p.x+p.w,y:p.y+p.h},{x:p.x,y:p.y+p.h}]]; }],
      ['legacy_quad', p => { p._quad = plain(p._contours[0]); }],
      ['legacy_outline', p => { p._outline = plain(p._contours[0]); }]
    ];
    for (const [name, mutate] of mutations) await check('tamper:' + name, () => {
      const altered = plain(panel); mutate(altered);
      assert.equal(api.validPanel(altered), false, name + ' cannot retain proof authority');
    });
    // Evidence tampering must not be hidden by cached object identity. Each
    // edit starts with a fresh JSON descriptor and changes one independent
    // witness while retaining its output contours.
    const evidenceEdits = [
      ['frontier_offset', v => { v.frontier.offsets[0]++; }],
      ['frontier_offset_noninteger', v => { v.frontier.offsets[0] += .5; }],
      ['frontier_support', v => { v.frontier.support -= 1 / 720; }],
      ['frontier_cost_truncated', v => { v.frontier.evidence.costs.pop(); }],
      ['frontier_cost_out_of_range', v => { v.frontier.evidence.costs[0] = 1601; }],
      ['frontier_cost_nonfinite', v => { v.frontier.evidence.costs[0] = NaN; }],
      ['frontier_dark_runs_invalid', v => { v.frontier.evidence.darkRuns = [[0, 0]]; }],
      ['frontier_evidence_missing', v => { delete v.frontier.evidence; }],
      ['atom_histogram_missing', v => { delete v.atoms[0].histograms; }],
      ['atom_histogram_count', v => { v.atoms[0].histograms[0][0]++; }],
      ['atom_histogram_negative', v => { v.atoms[0].histograms[0][0] = -1; }],
      ['atom_histogram_nonfinite', v => { v.atoms[0].histograms[0][0] = Infinity; }],
      ['atom_histogram_median', v => { v.atoms[0].median[0]++; }],
      ['atom_pale_count', v => { v.atoms[0].palePixels--; }],
      ['atom_pale_ratio', v => { v.atoms[0].pale -= .01; }],
      ['rim_bit_flip', v => { v.rimEvidence[0] = 1 - v.rimEvidence[0]; }],
      ['rim_bit_nonbinary', v => { v.rimEvidence[0] = 2; }],
      ['rim_bit_nonfinite', v => { v.rimEvidence[0] = NaN; }],
      ['rim_bits_truncated', v => { v.rimEvidence.pop(); }],
      ['rim_bits_missing', v => { delete v.rimEvidence; }]
    ];
    for (const [name, mutate] of evidenceEdits) await check('evidence_tamper:' + name, () => {
      const altered = plain(panel); mutate(altered._structuralGridProof);
      assert.equal(api.validPanel(altered), false, name + ' cannot retain structural proof authority');
    });

    const whiteAt = panel._structuralGridProof.atoms.findIndex(a => a.id === panel._structuralGridProof.whiteAtom);
    const scalarPaths = [
      ['x'], ['y'], ['w'], ['h'],
      ...['version','analysisWidth','analysisHeight','rimSupport','basePixels','excludedExteriorColorPixels','pixels','whiteAtom','rootAtom']
        .map(key => ['_structuralGridProof', key]),
      ['_structuralGridProof','proposal','vote'],
      ['_structuralGridProof','frontier','support'],
      ['_structuralGridProof','frontier','evidence','lo'],
      ['_structuralGridProof','frontier','evidence','hi'],
      ...['id','size','pale','palePixels','inside','external']
        .map(key => ['_structuralGridProof','atoms',0,key]),
      ...['threshold','matched','size','id']
        .map(key => ['_structuralGridProof','atoms',0,'witness',key]),
      ['_structuralGridProof','atoms',whiteAt,'letterComponents']
    ];
    const parentAt = (object, keys) => keys.slice(0, -1).reduce((value, key) => value[key], object);
    for (const keys of scalarPaths) {
      const name = keys.join('.'), originalParent = parentAt(panel, keys), key = keys[keys.length - 1];
      assert.equal(typeof originalParent[key], 'number', name + ' is a produced numeric evidence field');
      for (const [mutation, value] of [['missing',undefined],['nan',NaN],['positive_infinity',Infinity],['negative_infinity',-Infinity]])
        await check('scalar:' + name + ':' + mutation, () => {
          const altered = plain(panel), target = parentAt(altered, keys);
          if (mutation === 'missing') delete target[key]; else target[key] = value;
          assert.equal(api.validPanel(altered), false, name + ' must be present and finite');
        });
    }

    // Internally coherent edits can satisfy shape/range consistency without
    // matching this source image. Only a fresh pixel replay grants source
    // authority. Static validation is recorded, not assumed to prove identity.
    const coherentEdits = [
      ['proposal_vote', v => { v.proposal.vote *= 1.01; }],
      ['uniform_frontier_cost_shift', v => {
        const direction = v.frontier.evidence.costs.some(n => n >= 1600) ? -1 : 1;
        v.frontier.evidence.costs = v.frontier.evidence.costs.map(n => n + direction);
      }],
      ['histogram_and_median', v => {
        const a = v.atoms.find(q => q.id === v.rootAtom), histogram = a.histograms[0];
        let from = histogram.findIndex(n => n === a.size);
        assert.ok(from >= 0, 'invented root has a single red-channel fill value');
        const to = from === 255 ? from - 1 : from + 1;
        histogram[to] = histogram[from]; histogram[from] = 0; a.median[0] = to;
      }],
      ['pale_count_and_ratio', v => {
        const a = v.atoms.find(q => q.id === v.rootAtom); a.palePixels--; a.pale = a.palePixels / a.size;
      }],
      ['rim_bits_and_support', v => {
        const at = v.rimEvidence.findIndex(n => n === 1); assert.ok(at >= 0);
        v.rimEvidence[at] = 0; v.rimSupport = v.rimEvidence.reduce((n, bit) => n + bit, 0) / 360;
      }],
      ['witness_component_identity', v => { v.atoms[0].witness.id += 100; }]
    ];
    for (const [name, mutate] of coherentEdits) await check('source_replay_tamper:' + name, async () => {
      const altered = plain(panel); mutate(altered._structuralGridProof);
      assert.notDeepEqual(altered, plain(panel), 'tamper changed serialized evidence');
      const structurallyValid = api.validPanel(altered);
      assert.equal(await api.replayRGBA(f.rgba.slice(), f.w, f.h, [altered], []), false,
        name + ' must be rejected by fresh source replay even if structurally consistent');
      return {structurallyValid, sourceReplayAccepted:false};
    });

    // Each persisted evidence field must matter. Removing one must not leave
    // a certificate that only trusts its output coordinates or pixel count.
    for (const key of Object.keys(panel._structuralGridProof).filter(k => !['version', 'analysisWidth', 'analysisHeight'].includes(k)))
      await check('missing_evidence:' + key, () => {
        const altered = plain(panel); delete altered._structuralGridProof[key];
        assert.equal(api.validPanel(altered), false, 'missing ' + key + ' invalidates the serialized certificate');
      });
  } else {
    report.checks.push({name: 'proof_contract', passed: false, error: 'No valid positive descriptor was available; proof checks did not run.'});
    report.failures.push({name: 'proof_contract', error: 'No valid positive descriptor was available; proof checks did not run.'});
  }

  const f = fixtures.scene();
  const invalidInputs = [
    ['null_pixels', null, f.w, f.h, []],
    ['truncated_pixels', f.rgba.subarray(0, f.rgba.length - 4), f.w, f.h, []],
    ['zero_width', f.rgba, 0, f.h, []],
    ['fractional_width', f.rgba, f.w + .5, f.h, []],
    ['infinite_height', f.rgba, f.w, Infinity, []],
    ['invalid_prior', f.rgba, f.w, f.h, null],
    ['forged_prior', f.rgba, f.w, f.h, [{x:0,y:0,w:1,h:1,_structuralGridProof:{version:80}}]]
  ];
  const translucent = f.rgba.slice(); translucent[3] = 0;
  invalidInputs.push(['transparent_pixel', translucent, f.w, f.h, []]);
  for (const [name, rgba, w, h, prior] of invalidInputs) await check('input:' + name, async () => {
    assert.deepEqual(plain(await api.analyzeRGBA(rgba, w, h, prior)), [], 'invalid or unproved inputs abstain safely');
  });
  for (const input of [null, undefined, {}, {_structuralGridProof:{version:80}}, {x:0,y:0,w:1,h:1,_contours:[]}])
    await check('invalid_panel:' + report.checks.length, () => assert.equal(api.validPanel(input), false));
  await check('no_source_image_abstains', async () => {
    assert.deepEqual(plain(await api.supplementImage({naturalWidth:0,naturalHeight:0}, [])), []);
  });
  for(const contextMode of ['null','absent','throws']) await check('reader_install_is_idempotent_and_delegates_unproved:'+contextMode, () => {
    const ordinary = {kind:'existing',_contours:[[{x:.1,y:.1},{x:.2,y:.1},{x:.2,y:.2},{x:.1,y:.2}]]};
    const panels = [ordinary], sentinel = {kind:'old-owner'};
    let displays = 0, taps = 0;
    const reader = {currentPanels:panels, panelZoomEnabled:true,
      panelContours:p => p._contours,
      displayPanelContours(p, c) { displays++; assert.equal(this.currentPanels, panels); return c; },
      findPanelAt() { taps++; assert.equal(this.currentPanels, panels); return sentinel; },
      getPanelImageContext() { if(contextMode==='throws')throw Error('No viewport');return null; }};
    if(contextMode==='absent')delete reader.getPanelImageContext;
    api.installReader(reader);
    const display = reader.displayPanelContours, find = reader.findPanelAt;
    api.installReader(reader);
    assert.equal(reader.displayPanelContours, display, 'display wrapper is installed once');
    assert.equal(reader.findPanelAt, find, 'tap wrapper is installed once');
    assert.equal(reader.displayPanelContours(ordinary, ordinary._contours), ordinary._contours);
    assert.equal(reader.findPanelAt(.15, .15), sentinel);
    assert.equal(displays, 1); assert.equal(taps, 1);
    assert.equal(reader.currentPanels, panels, 'existing descriptor identities and array survive delegation');
  });
  await check('off_map_child_cannot_display_or_zoom',async()=>{
    const prior={_contours:[]},child={_structuralGridProof:{version:80},_contours:[]};let calls=0;
    const reader={currentPanels:[prior],panelContours:p=>p._contours,displayPanelContours(){calls++;},findPanelAt(){return prior;},zoomToPanel(){calls++;},getPanelImageContext(){throw Error('No reaction child, no image needed');}};
    api.installReader(reader);assert.equal(reader.displayPanelContours(child),null);await reader.zoomToPanel(child);assert.equal(calls,0);
  });
  await check('malformed_reader_child_cannot_replace_prior_owners', async () => {
    const first = {kind:'first',_contours:[[{x:.1,y:.1},{x:.2,y:.1},{x:.2,y:.2}]]};
    const second = {kind:'second',_contours:[[{x:.3,y:.3},{x:.4,y:.3},{x:.4,y:.4}]]};
    const counterfeit = {kind:'counterfeit-anchor'};
    const child = {_structuralGridProof:{version:80,anchors:[counterfeit]},_contours:[[{x:0,y:0},{x:1,y:0},{x:1,y:1}]]};
    const owners = [first, second, child], expected = [first, second]; let childZooms = 0;
    const checkPrior = reader => {
      assert.equal(reader.currentPanels.length, 2);
      assert.equal(reader.currentPanels[0], expected[0]); assert.equal(reader.currentPanels[1], expected[1]);
    };
    const reader = {currentPanels:owners,panelZoomEnabled:true,panelContours:p=>p._contours,
      displayPanelContours(p,c) {checkPrior(this); return c;},
      findPanelAt() {checkPrior(this); return first;},
      zoomToPanel() {childZooms++;},
      getPanelImageContext() {return {img:{width:560,height:720,src:'procedural-unavailable'}};}};
    api.installReader(reader);
    assert.equal(reader.displayPanelContours(first, first._contours), first._contours);
    assert.equal(reader.displayPanelContours(child, child._contours), null, 'unverified child cannot display');
    assert.equal(reader.findPanelAt(.15,.15), first, 'existing owners keep ordinary taps');
    await reader.zoomToPanel(child);
    assert.equal(childZooms, 0, 'unverified child cannot initiate a crop');
    assert.equal(reader.currentPanels, owners, 'mixed owner array is restored after each legacy call');
  });
  for (const [name, context] of [['null',null],['undefined',undefined],['empty',{}],['null_img',{img:null}],['throws','throws'],['absent','absent']])
    await check('reader_missing_source:' + name, async () => {
      assert.ok(accepted[0], 'a real generated descriptor is available for missing-source testing');
      const child = plain(accepted[0].panel);
      assert.equal(api.validPanel(child), true, 'the child is structurally valid before source becomes unavailable');
      const prior = [{kind:'ordinary-first',_contours:[[{x:.1,y:.1},{x:.2,y:.1},{x:.2,y:.2}]]},
        {kind:'ordinary-second',_contours:[[{x:.3,y:.3},{x:.4,y:.3},{x:.4,y:.4}]]}];
      const owners = [...prior,child]; let displayCalls=0,tapCalls=0,zoomCalls=0;
      const baseline = reader => {
        assert.equal(reader.currentPanels.length, prior.length, 'unverified child is absent from legacy ownership');
        prior.forEach((p,k) => assert.equal(reader.currentPanels[k], p, 'original descriptor identities remain authoritative'));
      };
      const reader = {currentPanels:owners,panelZoomEnabled:true,panelContours:p=>p._contours,
        displayPanelContours(p,c) {baseline(this); displayCalls++; return c;},
        findPanelAt() {baseline(this); tapCalls++; return prior[0];},
        zoomToPanel(p) {assert.equal(p,prior[0]); zoomCalls++;},
        pointInContours() {throw new Error('No hit test may authorize a child without current source pixels');},
        getPanelImageContext() {if(context==='throws')throw Error('No viewport');return context;}};
      if(context==='absent')delete reader.getPanelImageContext;
      api.installReader(reader);
      // The image disappeared after an earlier verified display state. The
      // cached image object is different, so that old authority must expire.
      reader._roundAtomicDisplay={owners,img:{src:'previous-procedural-image'},key:'previous-procedural-image',
        previous:prior,children:[child],verified:true};
      assert.equal(reader.displayPanelContours(child,child._contours), null, 'missing source suppresses child contours');
      assert.equal(displayCalls,0,'unverified child is not delegated for drawing');
      assert.equal(reader.displayPanelContours(prior[0],prior[0]._contours),prior[0]._contours);
      assert.equal(reader.findPanelAt(.5,.5),prior[0], 'missing source cannot steal a baseline tap');
      await reader.zoomToPanel(child);
      assert.equal(zoomCalls,0, 'missing source cannot open a child crop');
      await reader.zoomToPanel(prior[0]);
      assert.equal(displayCalls,1); assert.equal(tapCalls,1); assert.equal(zoomCalls,1);
      assert.equal(reader.currentPanels,owners,'original mixed array is restored after safe delegation');
    });
  for (const mutation of ['changed_child_box','appended_child','replaced_child'])
    await check('reader_verified_cache_expires:' + mutation, async () => {
      assert.ok(accepted[0], 'a real generated child is available for cache-invalidation testing');
      const child = plain(accepted[0].panel);
      assert.equal(api.validPanel(child), true);
      const prior = [{kind:'original-a',_contours:[[{x:.1,y:.1},{x:.2,y:.1},{x:.2,y:.2}]]},
        {kind:'original-b',_contours:[[{x:.3,y:.3},{x:.4,y:.3},{x:.4,y:.4}]]}];
      const owners=[...prior,child],img={width:560,height:720,src:'procedural-cached-source'};
      let legacyDisplays=0,legacyTaps=0,legacyZooms=0,childHitTests=0;
      const baseline = reader => {
        assert.equal(reader.currentPanels.length,prior.length);
        prior.forEach((p,k)=>assert.equal(reader.currentPanels[k],p,'actual prior descriptor identity is preserved'));
      };
      const reader={currentPanels:owners,panelZoomEnabled:true,panelContours:p=>p._contours,
        displayPanelContours(p,c){baseline(this);legacyDisplays++;return c;},
        findPanelAt(){baseline(this);legacyTaps++;return prior[0];},
        zoomToPanel(){legacyZooms++;},
        pointInContours(){childHitTests++;return true;},
        getPanelImageContext(){return{img};}};
      api.installReader(reader);
      const cached={owners,img,source:[img,undefined,img.src,undefined,undefined,img.width,img.height,undefined,0,false],sourceReady:true,childSig:JSON.stringify([child]),priorSig:JSON.stringify(prior),items:owners.slice(),previous:prior,children:[child],verified:true};
      reader._roundAtomicDisplay=cached;
      assert.equal(reader.displayPanelContours(child,child._contours),child._contours,
        'unchanged seeded verified state starts usable');
      assert.equal(reader._roundAtomicDisplay,cached,'control actually exercises cache reuse');
      if(mutation==='changed_child_box')child.x+=1/accepted[0].f.w;
      else {
        const next=plain(accepted[0].panel);assert.equal(api.validPanel(next),true);
        if(mutation==='appended_child')owners.push(next);else owners[owners.length-1]=next;
      }
      const currentChildren=owners.filter(p=>p?._structuralGridProof?.version===80);
      for(const p of currentChildren){
        assert.equal(reader.displayPanelContours(p,p._contours),null,'changed ownership expires child display authority');
        await reader.zoomToPanel(p);
      }
      assert.notEqual(reader._roundAtomicDisplay,cached,'same-array mutation must rebuild cached state');
      assert.equal(reader._roundAtomicDisplay.verified,false,'rebuilt state requires a fresh source proof');
      assert.equal(reader.findPanelAt(.5,.5),prior[0],'stale child authority cannot steal a baseline tap');
      assert.equal(childHitTests,0,'unverified children do not enter hit testing');
      assert.equal(legacyZooms,0,'unverified children do not reach crop rendering');
      assert.equal(legacyDisplays,0,'unverified children are not delegated to legacy display hooks');
      assert.equal(reader.displayPanelContours(prior[0],prior[0]._contours),prior[0]._contours);
      assert.equal(legacyDisplays,1);assert.equal(legacyTaps,1);
      assert.equal(reader.currentPanels,owners,'the original mutable owner array remains installed');
    });
  report.state = report.failures.length ? 'failed' : 'passed';
  report.passed = !report.failures.length;
  report.checked = report.checks.length;
  return report;
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv.includes('--fixtures-only')) { console.log(JSON.stringify(validateFixtures(), null, 2)); return; }
  if (argv.includes('--list')) { console.log(fixtures.CASES.map(c => c.name).join('\n')); return; }
  const moduleAt = argv.indexOf('--module'), caseAt = argv.indexOf('--case');
  const modulePath = path.resolve(moduleAt >= 0 ? argv[moduleAt + 1] : path.join(__dirname, '../../../js/panels-round-atomic-inset.js'));
  if (!fs.existsSync(modulePath)) {
    console.error(JSON.stringify({state:'blocked', detectorExecuted:false, detectorPass:null,
      reason:'Portable module does not exist; no detector assertions have run.'}));
    process.exitCode = 2; return;
  }
  validateFixtures();
  const sourceAt = argv.indexOf('--source');
  const sourceRoot = path.resolve(sourceAt >= 0 ? argv[sourceAt + 1] : process.env.NTH_SHELF_SOURCE || path.join(__dirname, '../../..'));
  const api = loadSourceApi(sourceRoot, modulePath);
  const report = await runContract(api, {caseName:caseAt >= 0 ? argv[caseAt + 1] : undefined,
    onCheck: argv.includes('--progress') ? row => console.error(JSON.stringify(row)) : undefined});
  report.sourceSnapshot = path.basename(sourceRoot);
  console.log(JSON.stringify(report, null, 2));
  if (!report.passed) process.exitCode = 1;
}
module.exports = {validateFixtures, loadSourceApi, rasterPanel, ownershipMetrics, assertOwnership, runContract};
if (require.main === module) main().catch(error => {
  console.error(JSON.stringify({state:'failed', passed:false, error:error.stack || error.message}, null, 2));
  process.exitCode = 1;
});
