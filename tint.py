#!/usr/bin/env python3
"""Pull a named asset's ink toward its own accent hue, numerically, and re-record it.

The correction micro-brand wrote down for exact accent fidelity — "recolour rather than
reprompt" — applied to the one place this set needs it: the silver and iron rank crests. Both
came back as good drawings of their metal, and a near-neutral metal is invisible to a hue-based
coverage check by construction: silver at saturation 0.05 has no hue to measure. Re-prompting
"bluer silver" until the gate passes would trade the metal reading for the measurement, which is
backwards. So the hue is set and the saturation floored numerically, gently, on the ink alone —
the ground is untouched — and the step, the new checksum and the re-measured C2PA state are
written back to the manifest.

Chunk-preserving, pure standard library: the PNG codec is normalise_ground.py's, so the C2PA
box survives exactly as it does there.

    python3 tint.py heraldry/crest-rank2 heraldry/crest-rank4
"""

from __future__ import annotations

import colorsys
import hashlib
import json
import sys
from pathlib import Path

from normalise_ground import TARGET, _read, _write, C2PA_MARKER

HERE = Path(__file__).resolve().parent
MANIFEST = HERE / "MANIFEST.json"

# Ink is anything beyond this distance from the ground; nearer pixels are left alone.
INK_DIST_SQ = 40.0 * 40.0
# The floor the saturation is lifted to — just above verify.py's MIN_SAT, and low enough that
# the metal still reads as metal rather than as a coloured plastic.
SAT_FLOOR = 0.22
SAT_CEIL = 0.35


def tint(path: Path, accent: str) -> tuple[str, int, bool, int]:
    width, height, channels, rows, before, after = _read(path)
    hue = colorsys.rgb_to_hls(
        int(accent[1:3], 16) / 255, int(accent[3:5], 16) / 255, int(accent[5:7], 16) / 255
    )[0]
    tr, tg, tb = TARGET
    changed = 0
    for y in range(height):
        line = rows[y]
        for x in range(width):
            o = x * channels
            r, g, b = line[o], line[o + 1], line[o + 2]
            if (r - tr) ** 2 + (g - tg) ** 2 + (b - tb) ** 2 <= INK_DIST_SQ:
                continue
            _, lightness, saturation = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
            nr, ng, nb = colorsys.hls_to_rgb(
                hue, lightness, min(SAT_CEIL, max(SAT_FLOOR, saturation))
            )
            line[o] = int(round(nr * 255))
            line[o + 1] = int(round(ng * 255))
            line[o + 2] = int(round(nb * 255))
            changed += 1
    _write(path, rows, before, after)
    data = path.read_bytes()
    return hashlib.sha256(data).hexdigest(), len(data), C2PA_MARKER in data, changed


def main(argv: list[str]) -> int:
    if not argv:
        print("usage: tint.py <asset-key> [...]", file=sys.stderr)
        return 2
    document = json.loads(MANIFEST.read_text())
    by_key = {a["asset"]: a for a in document["assets"]}
    for key in argv:
        entry = by_key.get(key)
        if not entry:
            print(f"{key}: no manifest entry", file=sys.stderr)
            return 1
        path = HERE / entry["path"]
        sha, size, c2pa, changed = tint(path, entry["accent"])
        entry["sha256"] = sha
        entry["byteSize"] = size
        entry["c2pa"] = c2pa
        steps = list(entry.get("postProcessing", []))
        step = f'ink tinted toward {entry["accent"]} by tint.py'
        if step not in steps:
            steps.append(step)
        entry["postProcessing"] = steps
        print(f'{entry["path"]}  {changed} ink px toward {entry["accent"]}')
    # `ensure_ascii=False`, to match generate.ts's JSON.stringify — see normalise_ground.py.
    # Without it this tool re-escapes every non-ASCII character generate.ts wrote raw, and
    # MANIFEST.json oscillates between two byte-different encodings of identical data.
    MANIFEST.write_text(json.dumps(document, indent=2, ensure_ascii=False) + "\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
