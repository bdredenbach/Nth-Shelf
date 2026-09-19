// Exercise the actual reader loop with controlled frame times and rounded DOM offsets.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(require('node:path').join(__dirname, '../js/reader.js'), 'utf8');
function fixture(mode, hz, quantum = 1) {
  let callback, clock = 1000, x = 0, y = 0;
  const sandbox = { localStorage: {getItem: () => null},
    requestAnimationFrame: fn => {callback = fn; return 1;},
    cancelAnimationFrame: () => {callback = null;} };
  vm.createContext(sandbox);
  const reader = vm.runInContext(source + '\nReader;', sandbox);
  const round = v => Math.round(v / quantum) * quantum;
  const stage = {scrollWidth: 100000, clientWidth: 400, scrollHeight: 100000, clientHeight: 800,
    get scrollLeft() {return x;}, set scrollLeft(v) {x = round(v);},
    get scrollTop() {return y;}, set scrollTop(v) {y = round(v);} };
  reader.mode = mode; reader.els = {stage};
  reader.updateAutoScrollControl = reader.revealAutoScrollControls = () => {};
  const axis = mode === 'webcomic' ? 'scrollTop' : 'scrollLeft';
  function frame() {const fn = callback; callback = null; if (fn) fn(clock);}
  return {reader, stage, axis,
    start(speed) {reader.setAutoScrollSpeed(speed); reader.startAutoScroll(); frame();},
    run(seconds) {for (let i = 0; i < seconds * hz; i++) {clock += 1000 / hz; frame();}},
    position() {return stage[axis];},
    resume() {reader.resumeAutoScroll(); frame();}
  };
}
let checks = 0;
for (const mode of ['scroll', 'manga', 'webcomic']) {
  const sign = mode === 'manga' ? -1 : 1;
  for (const hz of [30, 60, 90, 120]) for (const quantum of [1, 1/3]) {
    let previous = -1;
    for (const speed of [.01, .33, .34, .40, .41, .49, .50, 1, 2]) {
      const f = fixture(mode, hz, quantum); f.start(speed); f.run(10);
      const distance = sign * f.position();
      assert.ok(Math.abs(distance - speed * 38 * 10) <= quantum, `${mode} ${hz} Hz ${speed}: ${distance}`);
      assert.ok(distance > previous, 'Increasing speed must increase distance'); previous = distance; checks++;
    }
  }
  const f = fixture(mode, 120); f.start(.33); f.run(2);
  const before = f.position(); f.reader.setAutoScrollSpeed(.5); f.run(2);
  assert.ok(Math.abs(f.position() - before - sign * 38) <= 1);
  f.reader.setAutoScrollSpeed(0); const stopped = f.position(); f.run(2); assert.equal(f.position(), stopped);
  f.stage[f.axis] = sign * 500; f.reader.setAutoScrollSpeed(.4); f.run(1);
  assert.ok(Math.abs(f.position() - sign * 515.2) <= 1, 'Manual scroll must become the new origin');
  f.reader.pauseAutoScroll(); const paused = f.position(); f.run(1); assert.equal(f.position(), paused);
  f.stage[f.axis] = sign * 800; f.resume(); f.run(1);
  assert.ok(Math.abs(f.position() - sign * 815.2) <= 1, 'Resume must start at the current position');
  const end = mode === 'webcomic' ? 99200 : 99600;
  f.stage[f.axis] = sign * (end - 1); f.run(1);
  assert.equal(f.position(), sign * end); assert.equal(f.reader._autoScrollEnabled, false);
  f.reader.setAutoScrollSpeed(-1); assert.equal(f.reader._autoScrollSpeed, 0);
  f.reader.setAutoScrollSpeed(5); assert.equal(f.reader._autoScrollSpeed, 76);
  f.reader.setAutoScrollSpeed(NaN); assert.equal(f.reader._autoScrollSpeed, 76);
  checks += 8;
}
console.log(`Auto Scroll: ${checks} timing, monotonicity and lifecycle checks passed.`);
