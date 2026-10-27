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
    if body != normalize(original.decode()):
        raise SystemExit('Archive text differs beyond permitted normalization: ' + entry['original_path'])
    if hashlib.sha256(body.encode()).hexdigest() != entry['archive_body_sha256']:
        raise SystemExit('Archive hash mismatch: ' + entry['original_path'])
if sorted(p.name for p in ROOT.glob('HANDOFF*.md')) != ['HANDOFF.md']:
    raise SystemExit('Expected exactly one canonical handoff file')
print(f"PASS: {len(manifest['handoffs'])} original handoff bodies preserved in HANDOFF.md")
