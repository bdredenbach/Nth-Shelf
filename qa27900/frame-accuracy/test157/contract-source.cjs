'use strict';
// Only complete, installed repository modules are loaded. No source rewriting,
// source override, fixture issuer, network access, or external asset is used.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '../../..');
const loaded = new Map();
function source(file) {
  if (!/^[a-z0-9-]+\.js$/.test(file)) throw Error('Expected a repository JavaScript module');
  const text = fs.readFileSync(path.join(root, 'js', file), 'utf8');
  const sha256 = crypto.createHash('sha256').update(text).digest('hex');
  const previous = loaded.get(file);
  if (previous && previous.sha256 !== sha256) throw Error('Source changed during contract: ' + file);
  loaded.set(file, { path: 'js/' + file, sha256, bytes: Buffer.byteLength(text) });
  return text;
}
module.exports = { root, source, bindings: () => [...loaded.values()] };
