#!/usr/bin/env python3
"""Cut, resample and composite the derivative assets, and report their provenance as JSON.

Three derivations, each existing because of a measured fact rather than a preference:

  * **Favicons 512/192/32, resampled from the mark.** The brand run generated favicons and five
    of fourteen came back as the mark plus a smaller framed copy of itself ("draw it simpler" is
    read as "show both"); the Emberkin run then cut its favicons from the title mark with Lanczos
    and measured the grounds still exactly #12100f afterwards. A favicon is a downscale of the
    mark, so here it simply is one — three files, zero generations, no failure class.
  * **The OG card, composited then cut.** 1200x630 is a platform requirement and 630 is not a
    multiple of 16 (FLUX floors delivered dimensions to 16 — `studio/src/backend.ts` trap 4), so
    the backdrop is generated at 1200x640 and cut down by 5 pixels top and bottom. And the title
    on it is NOT generated: the brand run measured FLUX misspelling text on wide compositions
    ("Sftware Company") while spelling wordmarks reliably, and concluded "let the model draw the
    marks, and set the type yourself" (`brand/README.md` §5). So the generated wordmark's own
    lettering is composited into the backdrop's deliberately-dark right side, masked by its
    distance from the flat ground so no rectangle of not-quite-black arrives with it.
  * **The social card**, same composite at 1280x640 (on-grid, no cut).

Pillow, not macOS `sips` — design-system.md §7 item 3 names `sips` as the reason the estate's
resize stage once existed on exactly one laptop. This runs anywhere Python does, including CI.

**A derivative is re-encoded by Pillow, so it loses the PNG's C2PA chunk.** The invisible pixel
watermark survives; the signed box does not. Every source file is kept beside its derivative and
`c2pa` below is MEASURED on the bytes written rather than inherited.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image, ImageChops

import providers

HERE = Path(__file__).resolve().parent

# The provider root every emitted path is relative to. Set once by main(); a module-level name
# rather than another parameter threaded through builders whose signatures differ between the
# estate's asset repositories. Keeping `assets/...` identical in every manifest is what lets
# compare.py line the same asset up across models without parsing a directory name.
ROOT = HERE

GROUND = (0x12, 0x10, 0x0F)
C2PA_MARKER = b"c2pa"

OG_DECLARED = (1200, 630)
OG_SOURCE = (1200, 640)
SOCIAL = (1280, 640)


def load_parents(manifest: Path) -> dict[str, dict]:
    """Index the manifest by asset key, so a derivative inherits its source's record.

    The prompt, the model, the accent and the licence belong to the generation, not to the cut;
    only the facts the derivation CHANGES — size, checksum, byte count, C2PA state — are
    recomputed.
    """
    if not manifest.exists():
        return {}
    document = json.loads(manifest.read_text())
    return {a["asset"]: a for a in document.get("assets", [])}


def digest(path: Path) -> tuple[str, int, bool]:
    data = path.read_bytes()
    return hashlib.sha256(data).hexdigest(), len(data), C2PA_MARKER in data


def entry(parent: dict, *, asset: str, path: Path, declared: tuple[int, int], source: Path,
          cropped: bool, steps: list[str], note: str, ground_class: str | None = None) -> dict:
    sha, size, c2pa = digest(path)
    with Image.open(path) as image:
        delivered = image.size
    return {
        "provider": parent.get("provider", providers.reference().id),
        "asset": asset,
        "set": parent["set"],
        "slug": parent["slug"],
        "name": parent["name"],
        "path": str(path.relative_to(ROOT)),
        "accent": parent["accent"],
        "secondaryAccent": parent["secondaryAccent"],
        "groundClass": ground_class or parent["groundClass"],
        "declaredSize": f"{declared[0]}x{declared[1]}",
        "requestedSize": parent["requestedSize"],
        "deliveredSize": f"{delivered[0]}x{delivered[1]}",
        "sizing": "exact" if tuple(delivered) == declared else "unsized",
        "cropped": cropped,
        "derivedFrom": str(source.relative_to(ROOT)),
        "backend": parent["backend"],
        "model": parent["model"],
        "prompt": parent["prompt"],
        "seed": parent["seed"],
        "sha256": sha,
        "byteSize": size,
        "generatedAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "c2pa": c2pa,
        "retries": parent["retries"],
        "licence": parent["licence"],
        "providerCostUnits": parent["providerCostUnits"],
        "providerOutputMegapixels": parent["providerOutputMegapixels"],
        "sourceSpec": parent["sourceSpec"],
        "postProcessing": list(parent.get("postProcessing", [])) + steps,
        "deliveredGround": parent.get("deliveredGround"),
        "attempts": parent["attempts"],
        "note": note,
    }


def lettering_crop(wordmark: Image.Image) -> Image.Image:
    """The name alone, cut out of the wordmark's right side.

    The first composite pasted the whole lockup, and the mark's bone ash-ridge arrived as a pale
    bar floating over the painting — correct in the lockup's own flat world, an artefact in a
    scene. The card needs the model-drawn LETTERING (the thing brand §5 proved reliable), not
    the mark: the backdrop's own island city is the pictorial mark. The plan fixes the lockup's
    composition as mark left, gap, name right, so the name is the ink bounding box of the right
    two thirds, taken with a small margin.
    """
    rgb = wordmark.convert("RGB")
    width, height = rgb.size
    pixels = rgb.load()
    start_x = width // 3
    min_x, min_y, max_x, max_y = width, height, 0, 0
    for y in range(0, height, 2):
        for x in range(start_x, width, 2):
            r, g, b = pixels[x, y][:3]
            if (r - GROUND[0]) ** 2 + (g - GROUND[1]) ** 2 + (b - GROUND[2]) ** 2 > 40 * 40:
                min_x, min_y = min(min_x, x), min(min_y, y)
                max_x, max_y = max(max_x, x), max(max_y, y)
    if max_x <= min_x or max_y <= min_y:
        raise SystemExit("no lettering found in the wordmark's right two thirds")
    pad = 8
    return rgb.crop(
        (max(0, min_x - pad), max(0, min_y - pad), min(width, max_x + pad), min(height, max_y + pad))
    )


def wordmark_layer(wordmark: Image.Image, width: int) -> tuple[Image.Image, Image.Image]:
    """The lettering scaled to `width`, plus an alpha mask cut from its distance to the ground.

    The lettering sits on the flat #12100f ground. Pasting the rectangle whole onto a scene
    whose darks run darker than #12100f would print a faint lighter box around it, so each
    pixel's opacity is its largest channel distance from the ground, scaled hard — ground pixels
    vanish, artwork pixels arrive whole, anti-aliased edges keep a soft foot.
    """
    cropped = lettering_crop(wordmark)
    height = round(width * cropped.size[1] / cropped.size[0])
    scaled = cropped.resize((width, height), Image.LANCZOS)
    bands = [
        ImageChops.difference(channel, Image.new("L", scaled.size, level))
        for channel, level in zip(scaled.split(), GROUND)
    ]
    mask = ImageChops.lighter(ImageChops.lighter(bands[0], bands[1]), bands[2])
    mask = mask.point(lambda v: min(255, v * 6))
    return scaled, mask


def composite_card(backdrop: Path, wordmark: Path, out: Path, *, size: tuple[int, int],
                   wordmark_width: int, centre_x: int, crop_to: tuple[int, int] | None) -> None:
    with Image.open(backdrop) as raw:
        card = raw.convert("RGB")
        if card.size != size:
            raise SystemExit(f"{backdrop.name} is {card.size}, expected {size}")
        with Image.open(wordmark) as wm:
            layer, mask = wordmark_layer(wm, wordmark_width)
        x = centre_x - layer.size[0] // 2
        y = size[1] // 2 - layer.size[1] // 2
        card.paste(layer, (x, y), mask)
        if crop_to:
            top = (size[1] - crop_to[1]) // 2
            card = card.crop((0, top, crop_to[0], top + crop_to[1]))
        card.save(out, format="PNG", optimize=True)


def resample_one(source: Path, target: Path, size: tuple[int, int]) -> dict:
    """Lanczos one file down to one size and report what the result measures. Nothing else.

    ## Why this mode exists, and why it is here rather than in generate.ts

    Some endpoints refuse to generate at a size this set declares. gpt-image-2 has a minimum pixel
    budget — measured, by bisection, to sit in (524288, 655360] — and SEVENTY-THREE of this set's
    96 generations fall under it: fifty-two buildings, heraldry and icons at 512x512, ten ship pips
    at 256x256, ten airship profiles at 1024x512 and the 1024x384 wordmark. Each is generated at
    the smallest exact-aspect multiple on the 16-grid that clears the budget and cut DOWN to the
    declared size. That is three quarters of the set rather than a corner of it, which is why this
    mode is load-bearing here in a way it is not in the sibling repositories.

    The pixels have to move in Pillow, for the same reason every other resample in this file does:
    `studio/src/sizing.ts` measures and deliberately does not resample, because doing it in pure
    TypeScript is a PNG decoder, a filter reconstructor, a resampler and an encoder, and doing it
    with `sharp` is a native dependency in a repository that has none. And Pillow rather than macOS
    `sips` — design-system.md §7 item 3 names `sips` as the reason the estate's post-processing
    stage exists on exactly one laptop.

    It is in THIS file rather than in a new shared module because `derive.py` is already the
    per-repository Pillow tool and is already listed under `shared.perRepository` in providers.json.
    A new `resample.py` would have to go in `shared.acrossAllThree`, which claims.py validates in
    both directions and which requires every sibling's `shared` block to be byte-identical — a
    three-repository change to avoid a thirty-line function.

    **No ground snap and no edge matte here, unlike the favicons above**, and the difference is
    deliberate. Those two repairs exist because a favicon is cut to 32 pixels, where Lanczos ringing
    moves a corner off the exact ground and the verifier's corner patch is a quarter of the picture.
    This mode's smallest output is 256 and its typical one is 512, where neither applies — and more
    to the point, this file is the model's own delivery on its way to becoming the asset, not a
    derivative of an asset that already passed. Repairing it here would repair the very thing the
    comparison is trying to measure: whether THIS MODEL puts the ground where the brief says. The
    ground repair belongs where it already is, in normalise_ground.py, which runs afterwards, over
    every set alike, and RECORDS what it changed in `deliveredGround`.

    **This mode never touches the manifest**, on purpose. The caller has the prompt, the model, the
    attempts and the retry count; this has one source file, one target and one size, so it cannot
    corrupt a record it does not read.
    """
    with Image.open(source) as image:
        # RGBA before resizing: a palette image resampled in its own mode gives Lanczos nothing to
        # interpolate between and comes back with the same stair-stepping the downscale was for.
        resized = image.convert("RGBA").resize(size, Image.LANCZOS)
        target.parent.mkdir(parents=True, exist_ok=True)
        resized.save(target, format="PNG", optimize=True)
    sha, byte_size, c2pa = digest(target)
    with Image.open(target) as written:
        measured = written.size
    return {
        "sha256": sha,
        "byteSize": byte_size,
        # Measured on the bytes written, never inherited from the source. Re-encoding drops the
        # C2PA chunk, so this is expected to be False even where the native carried one — and it is
        # reported rather than assumed, because assuming it is the defect this estate shipped once.
        "c2pa": c2pa,
        # The caller REFUSES the file if this is not what it asked for. Reported from the file on
        # disk rather than echoed from the argument, so the check is on the bytes.
        "size": f"{measured[0]}x{measured[1]}",
    }


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description="Rebuild this set's derivatives.")
    parser.add_argument("--provider", default=None, help="provider id from providers.json")
    parser.add_argument(
        "--resample",
        nargs=3,
        metavar=("SOURCE", "TARGET", "WxH"),
        default=None,
        help="Lanczos SOURCE down to WxH at TARGET and print the result as JSON. Used by "
        "generate.ts for a provider that refuses to generate at a declared size.",
    )
    args = parser.parse_args(argv[1:])

    if args.resample:
        source, target, wanted = args.resample
        width, height = (int(n) for n in wanted.split("x"))
        json.dump(resample_one(Path(source), Path(target), (width, height)), sys.stdout)
        return 0

    provider = providers.by_id(args.provider) if args.provider else providers.reference()
    global ROOT
    ROOT, ASSETS = provider.root, provider.assets
    if not ASSETS.is_dir():
        # A candidate with nothing generated yet is not an error. It is the normal state of a
        # candidate set until its endpoint serves.
        json.dump([], sys.stdout)
        return 0
    parents = load_parents(provider.manifest)
    out: list[dict] = []

    # ---- favicons: 512, 192 and 32, Lanczos-cut from the 1024 mark.
    mark = ASSETS / "title" / "mark-1024x1024.png"
    parent = parents.get("title/mark")
    if mark.exists() and parent:
        with Image.open(mark) as image:
            source = image.convert("RGB")
            for edge in (512, 192, 32):
                target = ASSETS / "title" / f"favicon-{edge}x{edge}.png"
                cut = source.resize((edge, edge), Image.LANCZOS)
                # Two numerical repairs after the resample. Lanczos rings at hard edges, and at
                # 32 pixels the ringing moved this run's corners one value off the exact ground
                # the verifier demands — so anything within a small distance of the ground is
                # ground. And at 32 pixels the verifier's corner patch is a quarter of the
                # image, deep enough to catch the ends of the mark's full-width ash ridge — so
                # the favicon gets the same edge matte the flat sprites get, scaled to its own
                # corner-patch depth. The ridge shortens by a few pixels at 32 and is untouched
                # at 192 and 512.
                snapped = cut.load()
                # CORNER squares only, not a frame: at 32 pixels the verifier's corner patch is
                # a quarter of the tile in each corner, and a full frame matte at that depth is
                # the whole image — the first attempt at this repair blanked the favicon. The
                # ridge loses a few pixels at its tips at 32 and nothing anywhere else.
                band = max(8, edge // 24) + 1
                for y in range(edge):
                    for x in range(edge):
                        r, g, b = snapped[x, y][:3]
                        if (r - GROUND[0]) ** 2 + (g - GROUND[1]) ** 2 + (b - GROUND[2]) ** 2 <= 400:
                            snapped[x, y] = GROUND
                        elif min(x, edge - 1 - x) < band and min(y, edge - 1 - y) < band:
                            snapped[x, y] = GROUND
                cut.save(target, format="PNG", optimize=True)
                out.append(
                    entry(
                        parent,
                        asset=f"title/favicon-{edge}",
                        path=target,
                        declared=(edge, edge),
                        source=mark,
                        cropped=False,
                        steps=["resampled by derive.py"],
                        note=(
                            f"Lanczos downscale of the 1024 mark to {edge}, the chrome size "
                            "micro-aetherholm-web already serves. Derived rather than generated: "
                            "the brand run measured five of fourteen generated favicons arriving "
                            "as the mark plus a framed copy of itself. Re-encoding drops the C2PA "
                            "chunk; the invisible pixel watermark is unaffected and the mark is "
                            "kept beside this file."
                        ),
                    )
                )

    # ---- the OG card: wordmark composited into the 1200x640 backdrop, then cut to 1200x630.
    og_backdrop = ASSETS / "keyart" / "og-source-1200x640.png"
    wordmark = ASSETS / "title" / "wordmark-1024x384.png"
    og_parent = parents.get("keyart/og-source")
    if og_backdrop.exists() and wordmark.exists() and og_parent:
        target = ASSETS / "title" / f"og-{OG_DECLARED[0]}x{OG_DECLARED[1]}.png"
        composite_card(
            og_backdrop, wordmark, target,
            size=OG_SOURCE, wordmark_width=620, centre_x=790, crop_to=OG_DECLARED,
        )
        out.append(
            entry(
                og_parent,
                asset="title/og",
                path=target,
                declared=OG_DECLARED,
                source=og_backdrop,
                cropped=True,
                steps=["composited wordmark by derive.py", "cropped by derive.py"],
                note=(
                    "The generated wordmark's lettering composited into the backdrop's "
                    "deliberately-dark right side (masked by distance from the flat ground), "
                    "then centre-cropped from 1200x640 by 5 pixels top and bottom. The title is "
                    "composited, never generated on the wide card: brand/README.md §5's measured "
                    "finding is that FLUX misspells text on wide compositions and is reliable on "
                    "wordmarks. Re-encoding drops the C2PA chunk; both source files are kept."
                ),
            )
        )

    # ---- the social card: same composite at 1280x640, on-grid so no cut.
    social_backdrop = ASSETS / "keyart" / "social-backdrop-1280x640.png"
    social_parent = parents.get("keyart/social-backdrop")
    if social_backdrop.exists() and wordmark.exists() and social_parent:
        target = ASSETS / "title" / f"social-{SOCIAL[0]}x{SOCIAL[1]}.png"
        composite_card(
            social_backdrop, wordmark, target,
            size=SOCIAL, wordmark_width=640, centre_x=800, crop_to=None,
        )
        out.append(
            entry(
                social_parent,
                asset="title/social",
                path=target,
                declared=SOCIAL,
                source=social_backdrop,
                cropped=False,
                steps=["composited wordmark by derive.py"],
                note=(
                    "The generated wordmark's lettering composited into the backdrop's empty "
                    "dark space, masked by distance from the flat ground. Composited, never "
                    "generated on the wide card — brand/README.md §5. Re-encoding drops the "
                    "C2PA chunk; both source files are kept."
                ),
            )
        )

    json.dump(out, sys.stdout)
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
