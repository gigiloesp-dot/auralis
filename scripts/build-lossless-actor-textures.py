#!/usr/bin/env python3
"""Offline delivery encoding. Never edits source PNGs; Pillow is not a CI dependency."""
import argparse
import concurrent.futures
import hashlib
import io
import json
import os
from pathlib import Path
import re
import subprocess
import struct
import time
import PIL
from PIL import Image, ImageCms

ROOT = Path(__file__).resolve().parents[1]


# Explicit descriptor atlas allowlist: MONSTER_ART (+ ACTOR_ART.forestWolf),
# NPC_ART and BOSS_ART. Never broaden this to heroes, bodies or equipment.
LEGACY_ACTOR_NAMES = {'monsters': ['ancientGargoyle', 'ancientSentinel', 'arcaneWisp', 'bear', 'desertSnake', 'fallenKnight', 'forestBat', 'forestOrc', 'forestRaider', 'forestWolf', 'frostGolem', 'iceBat', 'iceElemental', 'iceWolf', 'scarab', 'skeleton', 'snowBear', 'snowRaider', 'spider', 'thornSnake', 'voidElemental', 'wildBoar', 'wraith'], 'npcs': ['ancient-residents', 'forest-residents', 'highpass', 'nyx', 'oak-north', 'river-residents'], 'bosses': ['ancient-mini-0', 'ancient-mini-1', 'ancient-mini-2', 'ancient-mini-3', 'ancient-world-4', 'ancient-world-5', 'dungeon1-boss-0', 'dungeon10-boss-0', 'dungeon10-boss-1', 'dungeon10-boss-2', 'dungeon11-boss-0', 'dungeon11-boss-1', 'dungeon11-boss-2', 'dungeon12-boss-0', 'dungeon12-boss-1', 'dungeon12-boss-2', 'dungeon2-boss-0', 'dungeon3-boss-0', 'dungeon4-boss-0', 'dungeon4-boss-1', 'dungeon5-boss-0', 'dungeon5-boss-1', 'dungeon6-boss-0', 'dungeon6-boss-1', 'dungeon7-boss-0', 'dungeon7-boss-1', 'dungeon8-boss-0', 'dungeon8-boss-1', 'dungeon8-boss-2', 'dungeon9-boss-0', 'dungeon9-boss-1', 'dungeon9-boss-2', 'forest-mini-0', 'forest-mini-1', 'forest-mini-2', 'forest-mini-3', 'forest-world-4', 'forest-world-5', 'north-mini-0', 'north-mini-1', 'north-mini-2', 'north-mini-3', 'north-world-4', 'north-world-5']}

def approved_source(source):
    return bool(re.fullmatch(r"assets/actors/task10-[a-z0-9-]+/[a-zA-Z0-9_-]+\.png", source)) or any(
        source == f"assets/actors/{role}/{name}.png"
        for role, names in LEGACY_ACTOR_NAMES.items() for name in names)

def source_paths(commit, roles=()):
    paths = git("ls-tree", "-rz", "--name-only", commit, "assets/actors").decode().split("\0")
    selected = {path for path in paths if re.fullmatch(r"assets/actors/task10-[a-z0-9-]+/[a-zA-Z0-9_-]+\.png", path)}
    for role in roles:
        selected.update(f"assets/actors/{role}/{name}.png" for name in LEGACY_ACTOR_NAMES[role]
                        if f"assets/actors/{role}/{name}.png" in paths)
    return sorted(selected)

def validate_color_metadata(original, image, source):
    # Match the independent Node RGB/RGBA decoder; never silently reduce 16-bit
    # channels, apply color transforms, or discard PNG-only color metadata.
    if original[:8] != b"\x89PNG\r\n\x1a\n" or original[24:29] not in (bytes([8, 2, 0, 0, 0]), bytes([8, 6, 0, 0, 0])):
        raise RuntimeError(f"Unsupported source PNG encoding: {source}")
    at = 8
    while at < len(original):
        size = struct.unpack_from(">I", original, at)[0]
        kind = original[at+4:at+8]
        if kind in (b"gAMA", b"cHRM", b"sRGB", b"cICP", b"mDCV", b"cLLI", b"tRNS", b"acTL"):
            raise RuntimeError(f"Unsupported PNG color/animation metadata {kind!r}: {source}")
        at += size + 12
    icc = image.info.get("icc_profile", b"")
    if icc:
        try:
            profile = ImageCms.ImageCmsProfile(io.BytesIO(icc))
            if profile.profile.xcolor_space.strip() != "RGB":
                raise ValueError("ICC profile is not RGB")
        except Exception as error:
            raise RuntimeError(f"Unsupported ICC profile: {source}") from error
    return icc

def git(*args):
    return subprocess.check_output(['git', *args], cwd=ROOT)

def sha(data):
    return hashlib.sha256(data).hexdigest()

def atomic_write(path, data):
    temporary = path.with_name(path.name + '.delivery-tmp')
    temporary.write_bytes(data)
    os.replace(temporary, path)

def convert(task):
    commit, source = task
    if not approved_source(source):
        raise RuntimeError(f'Unapproved actor source: {source}')
    original = git('show', f'{commit}:{source}')
    if (ROOT / source).read_bytes() != original:
        raise RuntimeError(f'Working source differs from pinned commit: {source}')
    with Image.open(io.BytesIO(original)) as image:
        icc_profile = validate_color_metadata(original, image, source)
        rgba = image.convert('RGBA')
        pixels = rgba.tobytes()
        width, height = rgba.size
        output = io.BytesIO()
        rgba.save(output, format='WEBP', lossless=True, exact=True, method=6, icc_profile=icc_profile)
    encoded = output.getvalue()
    # Decode the delivered binary independently, including RGB at alpha zero.
    with Image.open(io.BytesIO(encoded)) as decoded:
        if decoded.info.get('icc_profile', b'') != icc_profile:
            raise RuntimeError(f'WebP changed ICC profile: {source}')
        if decoded.size != (width, height) or decoded.convert('RGBA').tobytes() != pixels:
            raise RuntimeError(f'WebP changed RGBA pixels: {source}')
    if len(encoded) >= len(original):
        return None
    destination = source[:-4] + '.webp'
    atomic_write(ROOT / destination, encoded)
    return dict(sourceURL=source, url=destination, sourceSHA256=sha(original),
                webpSHA256=sha(encoded), rgbaSHA256=sha(pixels), width=width,
                height=height, sourceBytes=len(original), webpBytes=len(encoded))

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--commit', default='HEAD')
    parser.add_argument('--jobs', type=int, default=2)
    parser.add_argument('--include-legacy-roles', nargs='+', choices=sorted(LEGACY_ACTOR_NAMES), default=[],
                        help='Opt in to explicit MONSTER_ART, NPC_ART and BOSS_ART atlas allowlists')
    parser.add_argument('--list-sources', action='store_true', help='Print pinned source paths without generating files')
    args = parser.parse_args()
    if args.jobs < 1:
        parser.error('--jobs must be positive')
    commit = git('rev-parse', args.commit).decode().strip()
    sources = source_paths(commit, args.include_legacy_roles)
    if args.list_sources:
        print(json.dumps(dict(sourceCommit=commit, sources=sources), indent=2))
        return
    if not sources:
        raise RuntimeError('No committed task10 actor PNGs found')
    started = time.monotonic()
    entries = []
    with concurrent.futures.ProcessPoolExecutor(max_workers=args.jobs) as pool:
        for index, result in enumerate(pool.map(convert, ((commit, path) for path in sources)), 1):
            if result:
                entries.append(result)
            if index % 10 == 0 or index == len(sources):
                print(json.dumps(dict(completed=index, total=len(sources), elapsedSeconds=round(time.monotonic()-started, 1))), flush=True)
    manifest = dict(version=1, sourceCommit=commit,
                    encoding=dict(format='WebP', lossless=True, exact=True, method=6, pillow=PIL.__version__), entries=entries)
    atomic_write(ROOT / 'assets/actors/lossless-delivery.json', (json.dumps(manifest, indent=2) + '\n').encode())
    urls = {entry['sourceURL']: entry['url'] for entry in entries}
    module = "import {resolveExternalActorTextureURL} from './externalActorDelivery.js';\n"
    module += '// Generated by scripts/build-lossless-actor-textures.py; source descriptors remain unchanged.\n'
    module += 'export const LOSSLESS_ACTOR_TEXTURE_URLS=Object.freeze(' + json.dumps(urls, indent=2) + ');\n'
    module += 'export function resolveActorTextureURL(url){return resolveExternalActorTextureURL(Object.hasOwn(LOSSLESS_ACTOR_TEXTURE_URLS,url)?LOSSLESS_ACTOR_TEXTURE_URLS[url]:url);}\n'
    atomic_write(ROOT / 'js/assets/losslessTextureDelivery.js', module.encode())
    source_bytes = sum(entry['sourceBytes'] for entry in entries)
    webp_bytes = sum(entry['webpBytes'] for entry in entries)
    print(json.dumps(dict(sourceCommit=commit, files=len(entries), sourceBytes=source_bytes,
                         webpBytes=webp_bytes, savedBytes=source_bytes-webp_bytes,
                         elapsedSeconds=round(time.monotonic()-started, 1))), flush=True)

if __name__ == '__main__':
    main()
