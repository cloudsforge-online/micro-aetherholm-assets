#!/usr/bin/env python3
"""Which pictures illustrate something the built game does not have, measured against the game.

    python3 gaps.py            # check that every such asset is recorded in README section 11
    python3 gaps.py --list     # what is watched, and what the game says about each

WHY THIS EXISTS. This repository's README describes what the pictures are OF, and a picture of a
mechanic is a claim about a service in another repository. `icons/` is listed as "Resources,
population, strain, aegis, spire, ..." in section 1 as though those were six things the game has;
`grep -rnw population` and `grep -rnw strain` over `micro-aetherholm/src` return nothing and have
returned nothing since the set was generated. The art was planned from `docs/ecosystem/
20-aetherholm.md` section 8 and the phases that shipped are a subset of that plan, so some of it
illustrates a game that was designed and not built. That is a fine thing for an art set to
contain — the pictures are permanent and good — and a bad thing for its README to describe
without saying so, because the next reader treats the set as a description of the product.

WHAT IT CHECKS. For each watched asset, a word the mechanic turns on is searched for in a sibling
`micro-aetherholm` checkout. If the game does NOT have it, section 11 must record that asset by
slug. If the game DOES have it, section 11 must NOT — a "known gap" that has been closed is worse
than no note, because it sends somebody to build a thing that exists.

The search excludes the service's own `*.test.ts`. A suite is not the game: micro-aetherholm's
tests name `skerry` dozens of times, and counting them would answer a question about the suite.

The word is the crudest available probe, deliberately. It goes red when somebody merely MENTIONS
the mechanic, and that is a prompt to say which side of the line the set is now on rather than a
false alarm.

WHAT IT DOES NOT DO. It does not delete, move or re-caption anything, and it must never be
answered by generating art. Nothing here is a rendering check: verify.py owns the bytes.

EXIT CODES, following claims.py. 0 every watched asset is recorded correctly. 1 the README and
the game disagree. 2 the check could not run — no sibling checkout, or a watched asset is not in
the manifest. A check that silently passes when it cannot run is worse than no check, and 0 and 2
are different states.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ESTATE = HERE.parent

# Where a micro-aetherholm checkout is, in the order CI and a developer's machine put it.
SERVICE_SRC = [ESTATE / "aetherholm" / "src", HERE / ".aetherholm" / "src"]

# The section that has to carry the note, and how its heading is spelled.
GAPS_HEADING = re.compile(r"^## 11\. Known gaps\s*$", re.MULTILINE)
NEXT_HEADING = re.compile(r"^(?:##|---)", re.MULTILINE)

# ═════════════════════════════════════════════════════════════════════════════════════════════════
# The assets whose subject is a MECHANIC, and the word that mechanic turns on in the service.
#
# Only assets that depict a rule of play are here. A building sprite is a picture of a building
# type that content.ts names, and verify.py already refuses a set whose sprites and content
# disagree; a splash of a season opening depicts a season, which exists. What these four have in
# common is that somebody has to look in another repository to find out whether they are true.
#
# `built` is not written down. It is measured, every run — writing it down is exactly the mistake
# this file exists to stop, and micro-aetherholm-web made it: it held `private-skerry` back under
# "the built game has no such thing" while provisioning.ts was raising skerries against paid
# entitlements. Corrected there 2026-08-10; not repeated here.
# ═════════════════════════════════════════════════════════════════════════════════════════════════
WATCHED: dict[str, str] = {
    "icons/status-population": "population",
    "icons/status-strain": "strain",
    "splashes/storm-surge": "strain",
    "splashes/private-skerry": "skerry",
}


def _service_source() -> str | None:
    """Every non-test `.ts` under the service's src, concatenated. None if it is not checked out."""
    root = next((p for p in SERVICE_SRC if p.is_dir()), None)
    if root is None:
        return None
    files = [p for p in sorted(root.rglob("*.ts")) if not p.name.endswith(".test.ts")]
    return "\n".join(p.read_text(encoding="utf-8") for p in files)


def _built(source: str, word: str) -> bool:
    return re.search(rf"\b{re.escape(word)}\b", source, re.IGNORECASE) is not None


def _known_gaps() -> str:
    """The text of README section 11, and nothing else — a slug elsewhere is not a record."""
    readme = (HERE / "README.md").read_text(encoding="utf-8")
    start = GAPS_HEADING.search(readme)
    if start is None:
        raise SystemExit("README.md has no '## 11. Known gaps' section to record anything in")
    rest = readme[start.end():]
    end = NEXT_HEADING.search(rest)
    return rest[: end.start()] if end else rest


def _manifest_slugs() -> set[str]:
    manifest = json.loads((HERE / "MANIFEST.json").read_text(encoding="utf-8"))
    return {f"{a['set']}/{a['slug']}" for a in manifest["assets"]}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--list", action="store_true", help="report what is watched, check nothing")
    args = parser.parse_args()

    known = _manifest_slugs()
    strays = sorted(k for k in WATCHED if k not in known)
    if strays:
        for slug in strays:
            print(f"UNCHECKABLE {slug}: watched here, absent from MANIFEST.json", file=sys.stderr)
        return 2

    source = _service_source()
    if source is None:
        print("UNCHECKED: no micro-aetherholm checkout beside this repository; nothing was measured")
        print("           CI checks one out and treats this line as a failure.")
        return 2
    # The operand check. A walk that quietly found nothing would report every mechanic absent and
    # every note correct, which is this estate's most-repeated defect wearing a green tick.
    if len(source) < 50_000 or not _built(source, "city"):
        print("UNCHECKED: the service source read short or named no city; the walk is not reading it",
              file=sys.stderr)
        return 2

    section = _known_gaps()
    failures: list[str] = []
    for slug, word in sorted(WATCHED.items()):
        built = _built(source, word)
        recorded = slug in section
        if args.list:
            state = "built" if built else "not built"
            note = "recorded" if recorded else "not recorded"
            print(f"{slug:32} {word:12} {state:10} section 11: {note}")
            continue
        if not built and not recorded:
            failures.append(
                f"{slug} illustrates '{word}', which micro-aetherholm does not have, and "
                "section 11 does not record it"
            )
        if built and recorded:
            failures.append(
                f"{slug} is recorded in section 11 as a gap, but micro-aetherholm names "
                f"'{word}' — the gap closed and the note did not"
            )

    if args.list:
        return 0
    for line in failures:
        print(f"FALSE       {line}")
    if failures:
        print(f"\n{len(failures)} of {len(WATCHED)} watched asset(s) are described wrongly. Correct "
              "README section 11. Do NOT delete art and do NOT commission a mechanic to match a "
              "picture.")
        return 1
    print(f"{len(WATCHED)} asset(s) depicting a mechanic, each described as the game actually is.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
