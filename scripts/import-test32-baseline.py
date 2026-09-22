#!/usr/bin/env python3
"""Recover the accepted web assets, without decompiling native code or pushing Git."""
import argparse
import datetime
import hashlib
import json
import re
from pathlib import Path, PurePosixPath
import zipfile

ROOT = Path(__file__).resolve().parents[1]
QA = ROOT / 'qa27900/frame-accuracy/test32'
APK_SHA256 = 'cfdadc80042b1e57c462f239c13206c27c093abf52337d29e0c40c3811dbcff3'
OLD = {
    'index.html': '72ca4867b629ea75cfffd83607d97385fa787d0b',
    'js/panel-map-core.js': 'c589918929a77e1c79b23dd5ea805e1d1deac9a3',
    'js/panels-closed-frames.js': 'd018ced70be4e5f678e6bf4cda0b09befce9eb05',
    'js/panels-geometry-orthogonal.js': '761f7bf3d1ca1ec209c427d40bedea5f62a59c80',
    'js/panels-geometry-skewed.js': '0010e484409f4849881e84a9d8198e4ebac3973c',
    'js/panels-geometry.js': 'a7de094497d29b98b67acc4ac33b7fa5baa1e259',
    'js/panels-gutter-frames.js': '06576d9ae2d2f5aab236e015426320c7fd5df60a',
    'js/panels-partition.js': 'db7e224eebf7031378dc9db2f61042f9c9676500',
    'js/panels.js': 'd88351c4575d4deaa226df6542fdc49a4a316f26',
    'js/reader.js': '4a837509d9aeb49b121078d027bbce7e15d48e42',
}
SW_ALLOWED = {
    'e06e8d75c7c57afdda4bfff3964d44b6986e2c53',
    '95872307d1bc21d0040f0a12d4eb351a587c7467',
    '8cac638526f001d63e869577c97644fa3320da86',
    'aba5083d588beab2a82000358bc3225e8008d823',
}
README_ALLOWED = {
    '1fa8f2eb9edaa18ba4957ec9ee7d0f28d0572e3e',
    '2cf1add60a602700833ea6c6fa09c279e505e659',
}

def blob_sha(data):
    return hashlib.sha1(b'blob ' + str(len(data)).encode() + b'\0' + data).hexdigest()

def target(name):
    path = PurePosixPath(name)
    if path.is_absolute() or '..' in path.parts or '\\' in name or ':' in name:
        raise ValueError('Unsafe archive path: ' + name)
    result = ROOT / name
    if result.is_symlink() or not result.resolve().is_relative_to(ROOT):
        raise ValueError('Unsafe destination: ' + name)
    return result

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('apk', nargs='?', default=str(ROOT / 'Nth-Shelf-Frame-Test32.apk'))
    parser.add_argument('--verify-only', action='store_true')
    args = parser.parse_args()
    apk = Path(args.apk)
    if hashlib.sha256(apk.read_bytes()).hexdigest() != APK_SHA256:
        raise ValueError('APK checksum does not match the accepted Test32 input. Nothing changed.')
    marker = QA / 'import-completed.json'
    if marker.exists() and not args.verify_only:
        raise ValueError('Test32 was already imported. Refusing to overwrite subsequent work.')
    assets = {}
    with zipfile.ZipFile(apk) as archive:
        for item in archive.infolist():
            if item.is_dir() or not item.filename.startswith('assets/public/'):
                continue
            name = item.filename[len('assets/public/'):]
            target(name)
            if name in assets:
                raise ValueError('Duplicate APK entry: ' + name)
            assets[name] = archive.read(item)
    if len(assets) != 64:
        raise ValueError('Expected exactly 64 packaged web assets.')
    records = [{'path': name, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest(),
                'gitBlobSha': blob_sha(data)} for name, data in sorted(assets.items())]
    if args.verify_only:
        print(json.dumps({'verified': True, 'sourceApkSha256': APK_SHA256, 'assetCount': 64, 'assets': records}, indent=2))
        return
    # Check every conflict before writing even one file. Newer frame work wins.
    for name, data in assets.items():
        existing = target(name)
        if not existing.exists():
            continue
        actual = blob_sha(existing.read_bytes())
        allowed = {blob_sha(data), OLD.get(name)}
        if name == 'sw.js':
            allowed.update(SW_ALLOWED)
        if actual not in allowed:
            raise ValueError('Conflicting/newer file; nothing changed: ' + name)
    if blob_sha((ROOT / 'README.md').read_bytes()) not in README_ALLOWED:
        raise ValueError('README changed after preparation; merge it before importing. Nothing changed.')
    source_sw = (ROOT / 'sw.js').read_text()
    source_sw = source_sw.replace('TEST32 IMPORT CHECKPOINT (OLDER RUNTIME SOURCE)', 'ACCEPTED FRAME TEST32 BASELINE')
    source_sw = source_sw.replace('nth-shelf-shell-2.79.24-checkpoint-r2', 'nth-shelf-shell-2.79.24-frame32-baseline-r2')
    shell = ['./'] + ['./' + name for name in assets if name != 'sw.js']
    source_sw = re.sub(r'const SHELL_FILES = \[.*?\];', 'const SHELL_FILES = ' + json.dumps(shell, indent=2) + ';', source_sw, flags=re.S)
    prepared_sw = source_sw.encode()
    readme = (ROOT / 'README.md').read_text()
    start = readme.index('**Repository status:')
    end = readme.index('\n\n**Page41', start)
    installed = ('**Repository status: accepted Test32 web source recovered.** All 64 packaged\n'
        'web assets were recovered from the checksum-verified APK. Detector JavaScript\n'
        'remains byte-for-byte unchanged; the requested README and service-worker\n'
        'maintenance is recorded separately.')
    prepared_readme = (readme[:start] + installed + readme[end:]).encode()
    if blob_sha(prepared_sw) != 'aba5083d588beab2a82000358bc3225e8008d823':
        raise ValueError('Prepared service-worker checksum mismatch.')
    if blob_sha(prepared_readme) != '2cf1add60a602700833ea6c6fa09c279e505e659':
        raise ValueError('Prepared README checksum mismatch.')
    for name, data in assets.items():
        destination = target(name)
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(data)
    (ROOT / 'sw.js').write_bytes(prepared_sw)
    (ROOT / 'README.md').write_bytes(prepared_readme)
    (QA / 'imported-assets.json').write_text(json.dumps({'sourceApkSha256': APK_SHA256, 'assets': records}, indent=2) + '\n')
    marker.write_text(json.dumps({'sourceApkSha256': APK_SHA256, 'assetCount': 64,
        'completedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'detectorsModified': False, 'nextVersionReserved': '2.79.33',
        'page42Complete': False}, indent=2) + '\n')
    print('Recovered 64 accepted Test32 web assets. Updated README/cache only; page42 remains open.')

if __name__ == '__main__':
    try:
        main()
    except (OSError, ValueError, zipfile.BadZipFile) as error:
        raise SystemExit(str(error))
