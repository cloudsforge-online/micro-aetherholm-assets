#!/usr/bin/env python3
"""Check every asset against the numbers it claims, the plan, and the art bible.

Looking at an image tells you whether an island is appealing and whether the wordmark spells
Aetherholm. It does not reliably tell you that a ground is #2b2b2d rather than #12100f, that an
icon has drifted thirty degrees of hue off its anchor, or that a manifest entry still claims a
C2PA box the post-processing dropped — the eye adapts, and a hundred files adapt it a hundred
times. The measurable things are measured here; the rest is judged on `sheet.py`'s contact
sheets.

Seven checks:

  1. **Completeness.** Every asset in PLAN.json has a manifest entry and a file on disk.
  2. **Dimensions.** The bytes must measure exactly what the manifest declares.
  3. **Checksum.** The file on disk must be the file the manifest recorded. This repository
     rewrites its own files after generation (normalise, derive), so this is the check most
     likely to catch a step that forgot to write back.
  4. **C2PA disclosure.** The manifest's `c2pa` flag must be what the bytes actually say. This
     is micro-brand's hardest-won check: 54 entries there shipped claiming a box the
     ground-normalisation commit had dropped, and the verifier stayed green because nothing
     compared the claim to the bytes. The check is about truth, not presence — an asset is free
     to carry no box, and it may not say otherwise.
  5. **Ground, by class.** A `flat` asset must be EXACTLY #12100f in all four corners after
     normalisation — no tolerance, because the value is set numerically and any deviation means
     the step did not run. A `scene` asset is a picture and is held to a darkness ceiling on its
     edges instead. The two rules are reported separately.
  6. **Not degenerate.** A file that is 99.5% ground is a blank, and a blank passes every other
     check on this list.
  7. **Accent coverage**, where the set's floor is above zero: the flat-vector sets (icons, ship
     icons, heraldry, title chrome) must actually be drawn in their declared anchor. The
     painterly sets and scenes are multi-hued by design and carry a floor of zero — the accent
     is recorded on them, not gated.

    python3 verify.py                 # everything
    python3 verify.py icons heraldry  # only these sets
"""

from __future__ import annotations

import colorsys
import hashlib
import json
import sys
from pathlib import Path

from PIL import Image

HERE = Path(__file__).resolve().parent
MANIFEST = HERE / "MANIFEST.json"
PLAN = HERE / "PLAN.json"

GROUND = "#12100f"

# A scene is held to a darkness ceiling at its EDGES. 0.12 passes a near-black with room to
# spare and fails the mid-grey taupe field (about 0.23) the brand run's first live image wore.
MAX_SCENE_EDGE_LUMA = 0.12

# Degrees of hue. FLUX renders every colour lighter than the hex it is given, and lightening
# drags the hue; 30 is where the sibling runs settled.
MAX_HUE_DRIFT = 30.0
# Below this saturation a pixel is ground, ink or rim light, and its hue is noise.
MIN_SAT = 0.15

# The share of the image that must be drawn within tolerance of the asset's own accent.
# Painterly sets and scenes are multi-hued by design: floor zero, accent recorded not gated.
MIN_COVERAGE = {
    "icons": 0.010,
    "shipicons": 0.010,
    "heraldry": 0.005,
    "title": 0.005,
    "islands": 0.0,
    "buildings": 0.0,
    "ships": 0.0,
    "keyart": 0.0,
    "splashes": 0.0,
}
# The share of the image that must be something other than ground. Below this it is a blank.
MIN_INK = 0.02

C2PA_MARKER = b"c2pa"


def hex_to_rgb(value: str) -> tuple[int, int, int]:
    value = value.lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4))  # type: ignore[return-value]


def rgb_to_hex(rgb: tuple[int, int, int]) -> str:
    return "#%02x%02x%02x" % tuple(int(v) for v in rgb)


def _linear(value: int) -> float:
    c = value / 255
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def luma(rgb) -> float:
    """Relative luminance, sRGB-linearised — the same transfer function WCAG contrast uses."""
    r, g, b = (_linear(int(v)) for v in rgb[:3])
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def hue_degrees(rgb) -> float:
    h, _, _ = colorsys.rgb_to_hls(*(int(v) / 255 for v in rgb[:3]))
    return h * 360


def hue_gap(a: float, b: float) -> float:
    gap = abs(a - b) % 360
    return min(gap, 360 - gap)


def median(values: list[float]) -> float:
    ordered = sorted(values)
    return ordered[len(ordered) // 2] if ordered else 0.0


def sample_corners(image: Image.Image) -> tuple[int, int, int]:
    """Median of four corner patches. A corner is where no composition in the plan puts a subject."""
    width, height = image.size
    patch = max(8, min(width, height) // 24)
    pixels = []
    for left, top in ((0, 0), (width - patch, 0), (0, height - patch), (width - patch, height - patch)):
        for y in range(top, top + patch):
            for x in range(left, left + patch):
                pixels.append(image.getpixel((x, y)))
    return (
        int(median([p[0] for p in pixels])),
        int(median([p[1] for p in pixels])),
        int(median([p[2] for p in pixels])),
    )


def corner_extremes(image: Image.Image) -> list[tuple[int, int, int]]:
    """Every distinct colour found in the four corner patches. Used for the exact-ground check."""
    width, height = image.size
    patch = max(8, min(width, height) // 24)
    found = set()
    for left, top in ((0, 0), (width - patch, 0), (0, height - patch), (width - patch, height - patch)):
        for y in range(top, top + patch, 2):
            for x in range(left, left + patch, 2):
                found.add(image.getpixel((x, y))[:3])
    return sorted(found)


class Reading:
    def __init__(self, coverage, rendered, ink):
        #: Share of the sampled pixels within tolerance of the asset's own accent.
        self.coverage = coverage
        #: That accent AS RENDERED — the median of those pixels.
        self.rendered = rendered
        #: Share of sampled pixels that are not ground. Below MIN_INK the file is a blank.
        self.ink = ink


def read_image(image: Image.Image, accent: str, ground: tuple[int, int, int]) -> Reading:
    width, height = image.size
    step = max(1, min(width, height) // 200)
    accent_hue = hue_degrees(hex_to_rgb(accent))

    total = 0
    matched: list[tuple[int, int, int]] = []
    ink = 0
    for y in range(0, height, step):
        for x in range(0, width, step):
            total += 1
            pixel = image.getpixel((x, y))[:3]
            if sum((pixel[i] - ground[i]) ** 2 for i in range(3)) ** 0.5 > 24:
                ink += 1
            _, lightness, saturation = colorsys.rgb_to_hls(*(v / 255 for v in pixel))
            if saturation < MIN_SAT or not 0.12 < lightness < 0.92:
                continue
            if hue_gap(hue_degrees(pixel), accent_hue) <= MAX_HUE_DRIFT:
                matched.append(pixel)

    rendered = (
        (
            int(median([p[0] for p in matched])),
            int(median([p[1] for p in matched])),
            int(median([p[2] for p in matched])),
        )
        if matched
        else None
    )
    return Reading(len(matched) / total, rendered, ink / total)


def main(argv: list[str]) -> int:
    plan = json.loads(PLAN.read_text())
    document = json.loads(MANIFEST.read_text())
    wanted = {a for a in argv if not a.startswith("--")}
    ground_target = hex_to_rgb(GROUND)

    failures: list[str] = []
    rows: list[str] = []
    assets = {a["asset"]: a for a in document["assets"]}

    # ---- 1. completeness, against the plan rather than against itself.
    for planned in plan["assets"]:
        if wanted and planned["set"] not in wanted:
            continue
        if planned["key"] not in assets and f'{planned["key"]}-source' not in assets:
            failures.append(f'{planned["key"]}: planned but never generated')

    for asset in document["assets"]:
        if wanted and asset["set"] not in wanted:
            continue
        path = HERE / asset["path"]
        problems: list[str] = []

        if not path.exists():
            failures.append(f'{asset["path"]}: missing')
            continue

        data = path.read_bytes()
        if hashlib.sha256(data).hexdigest() != asset["sha256"]:
            problems.append("checksum does not match the manifest")

        # ---- 4. the disclosure must be what the bytes say. micro-brand's 54-entry lesson.
        carries_c2pa = C2PA_MARKER in data
        if carries_c2pa != asset["c2pa"]:
            problems.append(
                f'manifest says c2pa={asset["c2pa"]} and the bytes say {carries_c2pa} — '
                "the disclosure has drifted from the file"
            )

        with Image.open(path) as raw:
            image = raw.convert("RGB")
            declared = tuple(int(n) for n in asset["declaredSize"].split("x"))
            if image.size != declared:
                problems.append(
                    f'{image.size[0]}x{image.size[1]} against a declared {asset["declaredSize"]}'
                )

            corners = sample_corners(image)
            corner_luma = luma(corners)

            # ---- 5. ground, by class.
            if asset["groundClass"] == "flat":
                distinct = corner_extremes(image)
                off = [c for c in distinct if c != ground_target]
                if off:
                    problems.append(
                        f"{len(off)} of {len(distinct)} sampled corner colour(s) are not exactly "
                        f"{GROUND} — nearest stray {rgb_to_hex(off[0])}; normalisation did not "
                        "run or did not take"
                    )
            elif corner_luma > MAX_SCENE_EDGE_LUMA:
                problems.append(
                    f"scene edges at {rgb_to_hex(corners)} are too light (luma {corner_luma:.3f}, "
                    f"ceiling {MAX_SCENE_EDGE_LUMA})"
                )

            reading = read_image(image, asset["accent"], corners)

            # ---- 6. not degenerate.
            if reading.ink < MIN_INK:
                problems.append(
                    f"only {reading.ink * 100:.2f}% of the image differs from its ground — this "
                    "is a blank"
                )

            # ---- 7. accent coverage, where the set's floor is above zero.
            floor = MIN_COVERAGE.get(asset["set"], 0.005)
            if reading.coverage < floor:
                problems.append(
                    f'only {reading.coverage * 100:.2f}% of the image is drawn within '
                    f'{MAX_HUE_DRIFT:.0f} degrees of {asset["accent"]} (floor {floor * 100:.1f}%)'
                )

        mark = "FAIL" if problems else "ok  "
        rows.append(
            f'{mark} {asset["set"]:<10} {asset["slug"]:<24} {asset["declaredSize"]:>9} '
            f'{asset["groundClass"]:<5} corner {rgb_to_hex(corners)} '
            f"ink {reading.ink * 100:5.1f}%  "
            f'colour {rgb_to_hex(reading.rendered) if reading.rendered else "-":<8} '
            f"{reading.coverage * 100:5.2f}%  c2pa={str(asset['c2pa']).lower()}"
        )
        for problem in problems:
            rows.append(f"       -> {problem}")
            failures.append(f'{asset["path"]}: {problem}')

    print("\n".join(rows))
    print(
        f"\ntarget ground {GROUND} (exact on flat assets, luma ceiling {MAX_SCENE_EDGE_LUMA} on "
        f"scene edges); hue tolerance {MAX_HUE_DRIFT:.0f} degrees; c2pa measured off the bytes"
    )
    print(f"{len(failures)} failure(s)")
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
