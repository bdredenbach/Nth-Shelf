#!/usr/bin/env python3
"""Verify preserved handoff text against Git blobs; no network or private input."""
from pathlib import Path
import hashlib
import json
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1]
manifest = json.loads((ROOT / 'docs/branch-consolidation-2026-10-27.json').read_text())
archive = (ROOT / 'HANDOFF.md').read_text()
redirects = {entry['original_path']: 'HANDOFF.md#' + entry['anchor'] for entry in manifest['handoffs']}
receipts = manifest['validation_relocations']['records']
receipt_redirects = {entry['original_path']: entry['path'] for entry in receipts}
receipt_pattern = re.compile(
    r'(?<![\w/.-])(?:\.\.?/)*(?P<name>' +
    '|'.join(re.escape(name) for name in sorted(receipt_redirects, key=len, reverse=True)) +
    r')(?![\w-]|\.[A-Za-z0-9])')

def relocate_receipts(text):
    # Historical handoff documents originated at the repository root. Only the
    # exact recorded receipt filenames may be redirected; no prose is changed.
    text = receipt_pattern.sub(lambda match: receipt_redirects[match['name']], text)
    # Three historical slash-separated pairs denote two documents, not a path.
    # Make those explicit links using a finite recorded substitution list.
    for source, target in manifest['validation_relocations']['paired_reference_redirects'].items():
        text = text.replace(source, target)
    return text

def normalize(text):
    for path, target in redirects.items():
        text = re.sub(r'(\]\((?:\./)?|\]\(<(?:\./)?)' + re.escape(path) + r'(?:#[^)>\s]*)?(?=[)>\s])',
                      lambda match: match.group(1).replace('./', '') + target, text)
    # Preserve all text and line structure except insignificant trailing spaces.
    return '\n'.join(line.rstrip() for line in text.split('\n'))

for entry in manifest['handoffs']:
    original = subprocess.check_output(['git', '-C', str(ROOT), 'cat-file', 'blob', entry['git_blob_sha']])
    if hashlib.sha256(original).hexdigest() != entry['sha256']:
        raise SystemExit('Original hash mismatch: ' + entry['original_path'])
    prefix = f'<a id="{entry["anchor"]}"></a>\n\n<details>\n<summary>{entry["original_path"]} — historical checkpoint</summary>\n\n'
    if archive.count(prefix) != 1:
        raise SystemExit('Missing/duplicate archive section: ' + entry['original_path'])
    body = archive.split(prefix, 1)[1].split('\n\n</details>', 1)[0]
    normalized = normalize(original.decode())
    if hashlib.sha256(normalized.encode()).hexdigest() != entry['archive_body_sha256']:
        raise SystemExit('Original consolidated hash mismatch: ' + entry['original_path'])
    if body != relocate_receipts(normalized):
        raise SystemExit('Archive text differs beyond permitted normalization: ' + entry['original_path'])
    if hashlib.sha256(body.encode()).hexdigest() != entry['relocated_archive_body_sha256']:
        raise SystemExit('Archive hash mismatch: ' + entry['original_path'])
if sorted(p.name for p in ROOT.glob('HANDOFF*.md')) != ['HANDOFF.md']:
    raise SystemExit('Expected exactly one canonical handoff file')
print(f"PASS: {len(manifest['handoffs'])} original handoff bodies preserved in HANDOFF.md")
if len(receipts) != 106 or len(receipt_redirects) != 106:
    raise SystemExit('Expected 106 unique historical receipt relocations')
for entry in receipts:
    current = (ROOT / entry['path']).read_bytes()
    original = subprocess.check_output(['git', '-C', str(ROOT), 'cat-file', 'blob', entry['git_blob_sha']])
    if current != original or len(current) != entry['bytes'] or hashlib.sha256(current).hexdigest() != entry['sha256']:
        raise SystemExit('Moved receipt differs: ' + entry['path'])
    if (ROOT / entry['original_path']).exists():
        raise SystemExit('Unexpected duplicate root receipt: ' + entry['original_path'])
if sorted(path.name for path in ROOT.glob('*.json')) != ['manifest.json']:
    raise SystemExit('Expected only manifest.json at the repository root')
print('PASS: 106 historical JSON receipts relocated without byte changes')
