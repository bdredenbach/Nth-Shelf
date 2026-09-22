#!/usr/bin/env python3
"""Capture page-level identities from a local comic; never publish image bytes.
Requires Playwright for Python and Chromium. This is not a phone/Reader test.
"""
import argparse
import base64
import gzip
import hashlib
import json
from pathlib import Path
import re
import zipfile
from playwright.sync_api import sync_playwright

def digest(data):
    return hashlib.sha256(data).hexdigest()

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--comic', required=True, type=Path)
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[3])
    parser.add_argument('--out', required=True, type=Path)
    parser.add_argument('--browser', help='Chromium executable; omit to use Playwright Chromium')
    parser.add_argument('--compare', type=Path, help='Previous per-page hash summary or full capture (not count-only summary)')
    args = parser.parse_args()
    scripts = re.findall(r'<script[^>]*src=["\']([^"\']+)', (args.root / 'index.html').read_text())
    scripts = [s for s in scripts if s.startswith('js/panels') or s in ['js/panel-map-core.js', 'js/nth-page-deck.js']]
    results, errors = [], []
    with zipfile.ZipFile(args.comic) as comic, sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True, **({'executable_path': args.browser} if args.browser else {}))
        version = browser.version
        page = browser.new_page(viewport={'width': 1080, 'height': 1920}, device_scale_factor=1)
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.set_content('<html><body></body></html>')
        for script in scripts:
            page.add_script_tag(content=(args.root / script).read_text())
        if errors:
            raise RuntimeError('Script-load errors: ' + repr(errors))
        names = sorted(n for n in comic.namelist() if not n.startswith('__MACOSX/') and Path(n).suffix.lower() in {'.jpg', '.jpeg', '.png', '.webp'})
        for index, name in enumerate(names):
            data = comic.read(name)
            ext = Path(name).suffix.lower()
            mime = {'.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp'}[ext]
            image = 'data:' + mime + ';base64,' + base64.b64encode(data).decode()
            entries = page.evaluate('async url => await PanelDetect.detect(url)', image)
            canonical = json.dumps(entries, sort_keys=True, separators=(',', ':'), ensure_ascii=False).encode()
            results.append({'archiveIndex': index, 'readerPage': index + 1, 'filename': name,
                'imageSha256': digest(data), 'count': len(entries), 'descriptorSha256': digest(canonical), 'entries': entries})
            print('Page', index + 1, ':', len(entries), 'entries', flush=True)
        browser.close()
    result = {'browser': version, 'pageCount': len(results), 'totalEntries': sum(p['count'] for p in results),
        'pageErrors': errors, 'scripts': {s: digest((args.root / s).read_bytes()) for s in scripts}, 'pages': results}
    args.out.parent.mkdir(parents=True, exist_ok=True)
    payload = (json.dumps(result, indent=2) + '\n').encode()
    args.out.write_bytes(gzip.compress(payload, mtime=0) if args.out.suffix == '.gz' else payload)
    if args.compare:
        prior_bytes = args.compare.read_bytes()
        if args.compare.suffix == '.gz':
            prior_bytes = gzip.decompress(prior_bytes)
        prior = json.loads(prior_bytes)
        if not isinstance(prior.get('pages'), list):
            raise SystemExit('Comparison needs a per-page hash summary or full capture, not the count-only summary.')
        differences = []
        if len(prior['pages']) != len(results):
            differences.append('page count')
        for old, new in zip(prior['pages'], results):
            if any(old[k] != new[k] for k in ['imageSha256', 'count', 'descriptorSha256']):
                differences.append('page ' + str(new['readerPage']))
        if differences:
            raise SystemExit('Baseline differs: ' + ', '.join(differences))
    if errors:
        raise SystemExit('Page script errors: ' + repr(errors))
    print('Captured', result['pageCount'], 'pages;', result['totalEntries'], 'entries.')

if __name__ == '__main__':
    main()
