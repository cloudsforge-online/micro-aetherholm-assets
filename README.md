# Aetherholm art set

[![ci](https://github.com/cloudsforge-online/micro-aetherholm-assets/actions/workflows/ci.yml/badge.svg)](https://github.com/cloudsforge-online/micro-aetherholm-assets/actions/workflows/ci.yml)
![code licence](https://img.shields.io/badge/code-MIT-97CA00)
![art licence](https://img.shields.io/badge/art%20licence-CC%20BY%204.0-EF9421?logo=creativecommons&logoColor=white)
![assets](https://img.shields.io/badge/assets-101%20PNG-FF4785)
![split](https://img.shields.io/badge/of%20which-96%20generated%20%C2%B7%205%20derived-C77DFF)
![art](https://img.shields.io/badge/art-FLUX%202%20Pro-0A7CFF)

The 2D art for **Aetherholm**, the estate's sky-island strategy MMO: 96 generated
images and 5 derivatives, every one of them made by **FLUX 2 Pro** on Azure AI
Foundry and recorded in [MANIFEST.json](MANIFEST.json) with the exact prompt that produced it,
the model, the delivered size, the checksum, the ground it arrived on, the post-processing
applied and the number of times it had to be regenerated.

**All of this artwork is AI-generated.** That is stated here, on every manifest entry, and in
the licence string carried by each asset.

> This repository holds no game logic, no content JSON and no credential. The game's content
> canon is `aetherholm/src/content.ts` — see §2, because the planning document said otherwise —
> and the FLUX key lives in `../studio/.env.local`, read at run time and never written, logged
> or echoed.

Design authority: [`ecosystem/20-aetherholm.md`](https://github.com/cloudsforge-online/micro-docs/blob/main/ecosystem/20-aetherholm.md)

---

## 1. What is here

```
assets/<set>/<slug>-<width>x<height>.png
```

| Set | Count | What |
| --- | --- | --- |
| `islands/` | 12 | Island archetypes: 3 altitude bands (`world.ts`) × 4 biomes (ART_BIBLE.md §3), 1024², flat sprites. |
| `buildings/` | 20 | One sprite per building type in `content.ts`, 512², three-quarter view. |
| `ships/` | 10 | One side profile per airship class in `content.ts`, 1024×512; role read off the spec table. |
| `shipicons/` | 10 | Flat vector class icons, 256², Worlds moss. |
| `icons/` | 16 | Resources, aegis, spire, lanes, queues, fleet, battle, chronicle, 512² — **plus population and strain, which the built game has neither of** (§11). |
| `heraldry/` | 16 | 4 fields, 8 charges, 4 rank crests, 512² — the components behind `worlds`' ranked banner URNs (§5). |
| `keyart/` | 4 | Hero 1920×768, og backdrop 1200×640, social backdrop 1280×640, wordmark backdrop 1536×512 — scenes, textless. |
| `splashes/` | 6 | Season/event splashes, 1536×640. One of the six paints a mechanic the built game does not have and one paints a Private Skerry, which it does have and no client can yet reach (§11). |
| `title/` | 2 + 5 | Generated mark 1024² and wordmark 1024×384; derived favicon 512/192/32, composited og 1200×630 and social 1280×640. |

101 files: 96 generated and 5 derived. The set is
`docs/ecosystem/20-aetherholm.md` §8's table, adjusted to the built game; the art direction is
[ART_BIBLE.md](ART_BIBLE.md), written first.

The chrome sizes are exactly the four files `micro-aetherholm-web/public/` serves today from the
web template — favicon 512/192/32 and og 1200×630 — because that README records that "the
title's real chrome lands with the assets repository, and swapping the four files is the whole
of that change".

## 2. The doc-20 inversion, recorded

`docs/ecosystem/20-aetherholm.md` §4 planned the full content trees as "seeded content JSON in
`micro-aetherholm-assets`. — content drives both the engine and the art prompts". **That plan
inverted.** Phases 1–2 built the content in the service instead — the 20 building types at
`aetherholm/src/content.ts`, the research trees, the 10 airship classes with their balance table — and the service is now the canon. This
repository carries **no content JSON at all**: `plan.ts` imports the service's own modules and
derives the work list from them, asserting the doc's counts (20 buildings, 10 airships, 4
resources, 3 bands) before anything is spent.

The reason the inversion is final rather than corrected back: two content sources is the drift
defect this estate keeps paying for. Seven clients here were built against a surface somebody
imagined; a palette one hex stale in a second copy would have shipped fifty portraits in a
colour the game never renders (the Emberkin run's measured lesson). The engine executes
`content.ts`; the art must derive from the same file or it will drift from the game.

Two consequences worth naming:

- `content.ts`'s own header still says the full trees "live in `micro-aetherholm-assets` when
  that repository exists" (`content.ts`) — stale as of this repository, reported to the
  service's owner rather than edited from here.
- The four **biomes** exist in no document and no source: doc §8 counts "3 bands × 4 biomes"
  and never names the four. They are authored in ART_BIBLE.md §3 (terrace, crag, grove, reef)
  and that file is their source of truth until the game grows a biome column.

## 3. How it was generated

`generate.ts` drives **`@cloudsforge/studio`'s own engine**, importing `backend.ts`, `specs.ts`,
`sizing.ts` and the licence constant from the sibling service verbatim. `studio/` is not
modified. Every verified fact about this endpoint — `model` required in the body, the dotted
spelling, `aspect_ratio` accepted and silently ignored, dimensions floored to a multiple of 16,
`output_format:"png"` or you get JPEG — lives in those modules under test, and a second copy
here would be a second place for it to rot.

It deliberately does **not** reuse `studio/src/prompt.ts`, and it follows the **Emberkin
arrangement** rather than the brand one, because the shape of the problem is Emberkin's: the
specification is game content read from a sibling checkout (there four JSON files, here
`content.ts` itself), and the set mixes painterly sprites, flat icons and scenes under one art
bible — `prompt.ts`'s "flat geometric vector, one accent" is right for this repository's icons
and wrong for an island or a hull. What the brand run contributes instead is its **measured
conclusions, imported as rules**: the ground clause restated last, the dark tail, the lettering
clause with this repository's own vocabulary blocklisted, and §6's compositing rule.

```bash
cd ../studio && node --import tsx ../aetherholm-assets/generate.ts --plan     # PLAN.json only, free
cd ../studio && node --import tsx ../aetherholm-assets/generate.ts            # everything missing
cd ../studio && node --import tsx ../aetherholm-assets/generate.ts --force --only title/wordmark
cd ../studio && node --import tsx ../aetherholm-assets/generate.ts --limit 5  # a ceiling on spend

python3 normalise_ground.py   # snap every flat ground to #12100f (chunk-preserving)
python3 verify.py             # measure everything measurable
python3 sheet.py              # contact sheets into review/ (gitignored)
```

Order of operations: **generate, normalise, derive, verify.** The favicons are cut from the
normalised mark and the cards composited from the normalised wordmark, so deriving first ships
chrome on the wrong ground.

It runs from `studio/` so `tsx` resolves out of that workspace. **The Foundry key is read from
`../studio/.env.local`, held in one variable, and never written, logged or echoed** — not on
success, not in an error, not in a summary line. This repository contains no credential and
never should; `.gitignore` covers `.env*`.

## 4. What was derived rather than generated, and why

- **Favicon 512/192/32 — Lanczos cuts of the mark.** The brand run generated favicons and five
  of fourteen came back as the mark plus a smaller framed copy of itself; the Emberkin run then
  cut its favicons from the mark and measured the grounds still exact. Three files, zero
  generations, an entire failure class removed.
- **The OG card 1200×630 — composited, then cut.** Two measured facts compose here. FLUX floors
  delivered dimensions to a multiple of 16, so 630 is unreachable directly: the backdrop is
  generated at 1200×640 and cut down 5 pixels top and bottom, never upscaled. And FLUX misspells
  text on wide compositions — "Sftware Company" is `brand/README.md` §5's exhibit — while
  spelling wordmarks reliably, so the title on the card is the generated wordmark's own
  lettering, composited by `derive.py` into the backdrop's deliberately-dark right side, masked
  by each pixel's distance from the flat ground so no faint rectangle arrives with it.
- **The social card 1280×640** — the same composite; 640 is on-grid so nothing is cut.

Every derivative names its source in `derivedFrom`, and re-encoding through Pillow drops the
PNG's C2PA chunk while keeping the invisible pixel watermark — so a derivative's `c2pa` reads
`false`, measured, and both source files are kept beside it.

## 5. Heraldry: how the ranks are distinguished

`worlds` mints sealed-season heraldry as one URN per rank —
`cf:aetherholm:heraldry:<seasonId>:rank:<n>` (`worlds/src/heraldry.ts`) — and its header
states "first place and fifth place are different artwork, decided by the asset pipeline later"
(`worlds/src/heraldry.ts`). This set is that decision. A banner composes **field + charge
+ crest**, and the rank lives in the crest tier, distinguished on three channels at once so the
tiers survive monochrome:

| Tier | Crest | Metal | Form |
| --- | --- | --- | --- |
| rank 1 | `crest-rank1` | bright gold `#e8c34a` | full closed laurel wreath crowned by a spire |
| rank 2 | `crest-rank2` | blued silver `#b0c0dc` | open storm-cloud wreath, ends not meeting |
| rank 3 | `crest-rank3` | bronze `#c08552` | one plume on a plain circlet |
| rank 4+ | `crest-rank4` | iron `#8fa3b8` | a bare pennon bar |

Metal steps down, silhouette complexity steps down, and coverage steps down together. The four
fields and eight charges are rank-neutral and combine freely, which is also what doc §7's
heraldry-studio SKU sells components into.

## 6. What is checked

`verify.py` runs seven checks over all 101 files and reports **0 failures**:
completeness against PLAN.json, dimensions, checksum, **the C2PA disclosure measured against
the bytes** (micro-brand's 54-entry lesson, now a gate here and in CI), ground by class (exact
`#12100f` on flat, a darkness ceiling on scene edges), non-degeneracy, and accent coverage on
the flat-vector sets. The painterly sets carry a coverage floor of zero — a building is timber
and stone and brass by design — so their accents are recorded, not gated.

CI runs the verifier on every push (micro-brand's arrangement: a verifier nobody runs is how 54
false `c2pa: true` flags shipped there), plus one check that runs in the direction verify.py
does not: **every PNG on disk must have a manifest entry**, because `micro-emberkin-assets`
currently has two favicons on disk with none — found while building this repository, reported,
not fixed here.

`gaps.py` checks the one claim in this README that is not about bytes at all: **a picture of a
mechanic is an assertion about another repository.** It searches a sibling `micro-aetherholm`
checkout for the word each such picture turns on and requires §11 to agree with what it finds, in
both directions, refusing to pass when the checkout is absent (exit 2, never 0). It excludes the
service's own tests — a suite is not the game — and asserts it read something before grading it,
because a check that lost its operand is this estate's most-repeated defect.

## 7. What the run cost

96 images shipped from **105 billed generations** — 9 discarded re-rolls (two inverted
wordmarks, one aether icon with a bone bar, four sprites with artwork in a corner patch, one
flagship whose banners carried invented lettering) — at the provider's flat 3 units an image
(4.5 for the one 1920×768 hero): **≈316.5 units billed for 289.5 units of kept artwork**. The
estimate in doc §8 was ~140 generations / ~420 provider units; the actuals came in under it,
mostly because favicons were derived rather than generated and the wide cards were composited
rather than re-rolled. Every kept asset's own spend and attempt log is on its manifest entry.

Separately from real failures, the run absorbed **107 quota windows**: this deployment answers
bursts with 429, which costs wall-clock and zero units. The run was restarted once,
deliberately, from three-then-two concurrent requests down to **serial** — paired requests were
colliding on the same quota window and burning retry budget in pairs — and the manifest-aware
resume regenerated nothing that had already landed. `attempts[]` on each entry separates
`rate_limited` waits from real faults.

Retries beyond the first generation, per set, as the manifest records them (the count includes
both unbilled 429 waits and billed re-rolls):

| Set | Kept | Recorded retries | Of which 429 waits |
| --- | --- | --- | --- |
| islands | 12 | 14 | 6 |
| buildings | 20 | 14 | 12 |
| ships | 10 | 19 | 8 |
| shipicons | 10 | 8 | 7 |
| icons | 16 | 23 | 15 |
| heraldry | 16 | 13 | 13 |
| keyart | 4 | 5 | 5 |
| splashes | 6 | 9 | 6 |
| title | 2 | 2 | 0 |

Azure's content filter (`BingBlockList_Prompt`) refused **`buildings/academy` eight times across
three different subject wordings** before the phrase "a small walled courtyard/forecourt with
one tree" — constant across all three — was removed, after which it generated first try. Which
of those words the blocklist matches is unknowable from outside; the same filter passed three
other refused assets on a verbatim re-issue (the Emberkin run's non-determinism finding,
reconfirmed), which is why rewording waited for a *repeatable* refusal. `ships/cutter` and
`icons/ui-battle` each returned a run of empty 200s and then succeeded verbatim and unchanged.

## 8. Provenance, C2PA and the watermark

Every image FLUX returns carries C2PA provenance and a Microsoft invisible watermark.
`normalise_ground.py` preserves every ancillary PNG chunk, so **all 96 generated files keep
their C2PA box through ground normalisation, matting and tinting** (measured: 96/96 read
`c2pa: true`); the 5 derivatives are re-encoded by Pillow and keep only the pixel watermark
(5/5 read `c2pa: false`). `c2pa` on every entry is measured off the bytes at each rewrite, and
`verify.py` fails any entry whose flag disagrees with its file — the check is about truth, not
presence.

**One provenance field was damaged during this run and is recorded honestly rather than
patched over.** `deliveredGround` — the ground FLUX actually delivered, before normalisation —
was overwritten on 81 entries by a forced re-normalisation pass that re-sampled
already-normalised files; the guard that now makes the field write-once
(`normalise_ground.py`, "Written once") was added after the damage, so those 81 read `null`.
What survives of the original measurement: the first pass reported delivered grounds ranging
**`#040404` to `#3c3434`, 19 distinct values across 86 flat files**, against the target
`#12100f` — the spread that is the whole argument for normalising numerically. Per-file values
survive only on the five sprites regenerated after that pass.

`seed` is `null` on every entry: this deployment of FLUX 2 Pro accepts no seed parameter, so no
image here is byte-reproducible. The prompt, model and checksum are recorded so a regeneration
can be compared with what shipped, which is what provenance is for.

Each entry records the licence as the constant imported from `studio/src/assets.ts`:

> `cloudsforge-generated: commercial use permitted; AI-generated, C2PA provenance retained`

The **artwork** is AI-generated and disclosed as such. The code in this repository is MIT.

## 9. Reproducing

`generate.ts` imports from the sibling `studio/` checkout and `plan.ts` imports from the
sibling `aetherholm/` checkout, so **this repository is not self-contained: a run needs those
checkouts beside it.** The artefacts are — the PNGs, `MANIFEST.json` and `PLAN.json` carry
everything needed to audit what was made and from what. Clone `cloudsforge-online` siblings
beside it, put a Foundry endpoint and key in `studio/.env.local`, and run.

## 10. Post-processing that is not in the sibling repositories

Two numerical steps this run added beyond the Emberkin pipeline, both measured into existence:

- **The edge matte** (`normalise_ground.py`): FLUX drifted soft cloud wisps and light beams
  into the outer margin of the island sprites on roll after roll, through a prompt that
  forbids it — re-rolling lost three times out of five. A flat sprite exists to be composited
  onto the game's ground, so its frame edge is matted to exactly that ground through the depth
  the verifier's corner patches sample, with a fade band twice as deep. Artwork beyond ~8% of
  the frame is untouched.
- **The metal tint** (`tint.py`): the silver and iron rank crests came back as good drawings
  of near-neutral metal, which a hue-coverage gate cannot see (silver at saturation 0.05 has
  no hue). Brand §5's conclusion — recolour rather than reprompt — applied gently to the ink
  alone, chunk-preserving, recorded in `postProcessing`. The gate stayed strict; the artwork
  moved a few points of saturation.

## 11. Known gaps

**Three pictures illustrate a game that was designed and not built** — `icons/status-population`,
`icons/status-strain` and `splashes/storm-surge`. The set was planned from
`docs/ecosystem/20-aetherholm.md` §8 and the phases `micro-aetherholm` shipped are a subset of
that plan, so a citizen count and a well-overdraw model were painted and never coded:
`grep -rnw population src/` and `grep -rnw strain src/` over the service return **nothing**, and
have since the run. Recorded rather than fixed, in either direction:

- **Nothing is deleted.** They are permanent FLUX 2 Pro output, they are good pictures, and the
  set is the record of what was made — not a description of what shipped.
- **No mechanic is commissioned to justify a picture.** A population model is design work, and
  "the art asked for it" is the worst possible argument for it. `micro-aetherholm-web` holds all
  three out of its bundle with a reason each, which is the right place for that decision: a
  resource icon hung off an unrelated number is a confident lie nobody reports.

`gaps.py` re-measures this paragraph against a sibling `micro-aetherholm` checkout on every CI
run, in **both** directions — it fails if a picture here illustrates something the service has
since built, because a gap that closed while the note stayed sends the next reader to build a
thing that already exists.

One splash looks like a fourth and is not; §12 says which, and why it is filed separately rather
than here.

- The wordmark backdrop ships textless by design; the client typesets over it. If the client
  ever wants a pre-lettered wide banner, it is a `derive.py` composite, not a generation.
- `keyart/hero` and `keyart/wordmark-backdrop` each carry a faint invented painter's-signature
  scrawl in a lower corner, generated despite the scene style's prohibition. Both are
  recorded here rather than re-rolled: the compositions are exceptional, the scrawls are
  illegible at any shipping size, and a re-roll discards the whole painting to remove them.
  If either is ever re-generated for other reasons, the prohibition stands in the prompt.
- `content.ts` still promises the trees to this repository (§2). The correction belongs to
  `micro-aetherholm`, not here.
- No registry row names an `aetherholm` surface accent; the title deliberately wears Worlds'
  moss (`docs/ecosystem/20-aetherholm.md` §6, the registry-row bullet), so nothing is missing —
  recorded so nobody "fixes" it into a new accent.

## 12. Not a gap: the Private Skerry

`splashes/private-skerry` was mistaken for one of §11's until 2026-08-10, and it is a different
thing entirely. The Private Skerry is **built and sold**: `provisioning.ts` raises one against a
paid entitlement, `world.ts` seeds its twelve islands from `skerrySeed(entitlementId)` so one
purchase yields one geography, the title contract's provision route serves it, and
`aetherholm.skerry.provisioned` goes out on the bus. The picture is TRUE.

What is missing is the way in. Provisioning is a service act the entitlement bridge drives — a
user token is refused — and no route lists the archipelagos a subject owns, so a client is never
handed an id and has nothing to draw the splash beside. That is a route in `micro-aetherholm`,
and a far smaller thing than the three above.

It is recorded here rather than in §11 because the difference is the whole point of that section,
and because `gaps.py` enforces it: a slug in §11 whose mechanic the service HAS is a failure.
A closed gap left standing as a note sends the next reader to build something that exists.

## 13. Two sets on disk, and how to switch between them

There is more than one complete set of this artwork. `providers.json` is the registry: one entry
per model, one of them named by the top-level `reference` field, and that one is the **shipped**
set whose files live at `assets/`. A challenger lives at `candidates/<id>/` in exactly the same
shape — `candidates/gpt-image-2/assets/title/mark-1024x1024.png` against
`assets/title/mark-1024x1024.png` — because **every `path` in every manifest is relative to its own
set's root and is the identical string in all of them.** That one property is what makes the switch
a move rather than a rewrite, and it is why nothing below edits a manifest.

```
python3 promote.py --list                    # which set is shipped, which are on trial
python3 materialise.py --list                # and how complete each one is
```

### Looking at both, without switching anything

```
python3 materialise.py --provider flux-2-pro  --into /tmp/flux
python3 materialise.py --provider gpt-image-2 --into /tmp/gpt
python3 sheet.py --provider gpt-image-2       # contact sheets into review/
python3 compare.py                            # the two sets, measured side by side
```

`materialise.py` writes a `SET.json` receipt into the destination naming the model, so a directory
of PNGs can always answer "whose artwork is this?" — the sets are deliberately the same subjects in
the same palette, and by eye that question has no reliable answer on a building sprite.
[COMPARISON.md](COMPARISON.md) is the written form of the same comparison.

### Switching

```
python3 promote.py --provider gpt-image-2 --dry-run   # what would move; moves nothing
python3 promote.py --provider gpt-image-2             # the switch
```

The winner's `assets/`, `MANIFEST.json` and `native/` move to the repository root and the OUTGOING
set moves to `candidates/<its id>/` first, so the previous reference is **demoted, not deleted** —
its bytes, its manifest and its provenance all survive, which is what keeps COMPARISON.md's numbers
pointing at something real. `providers.json` is then edited in exactly three places: `reference`,
and the two entries' `root` and `shipped`.

Before anything moves, the candidate must be **complete** — every one of the 101 keys the reference
defines, resolved through `materialise.py`. Ninety-six of those are generated and five are derived
(the three favicons off `title/mark`, the OG cut off `keyart/og-source`, the social card off
`keyart/social-backdrop`), so a set that was generated but never passed through
`generate.ts --derive-only` stands at 96 and stops here, by name. It must also pass
`verify.py --provider <id> --as-shipped`, which holds a candidate to the *shipped* rules rather
than the on-trial ones — this set's flat ground, accent coverage floor and scene darkness ceiling
are fatal for the shipped set and reported-not-fatal for a candidate, and the flat-ground rule
demands corner pixels of exactly `#12100f`, which no endpoint delivers. A candidate that was never
run through `normalise_ground.py --provider <id>` therefore passes its own verify and would turn
the repository red one second after the move; the gate is there so that it cannot.

After the move and before the registry is written, every checksum in **both** manifests is
re-derived from the bytes at their new locations, and every `nativePath` is checked to still be on
disk; if one disagrees the move is rolled back file by file and `providers.json` is never touched.
The native check earns its place here more than it does in the sibling repositories: three quarters
of a gpt-image-2 set in this repository is Lanczos'd down from a larger delivery, and `native/`
holds the only copies that still carry the C2PA box the resample drops.

### Switching back

```
python3 promote.py --provider flux-2-pro
```

The same command naming the other model. There is no undo flag and no second code path: once
gpt-image-2 is shipped, flux-2-pro is an ordinary candidate at `candidates/flux-2-pro/`, and
promoting it back is the identical operation with the two ids exchanged.

### The round trip, measured rather than asserted

"Reversible" is a claim about a program, and it was checked before it was written down here. One
sha256 was taken over everything a promotion moves — `assets/`, `candidates/`, `native/`,
`MANIFEST.json` and `providers.json` — by hashing each file's **path together with its bytes**, so
that a file moving from one tree to another changes the total even though nothing about the file
changed. That is 278 files on this branch. The switch was then run twice in each direction:

| | digest over the 278 files |
| --- | --- |
| before | `1611a746f47175b1…` |
| after `promote.py --provider gpt-image-2` | `611dc0a9dfa10152…` |
| after `promote.py --provider flux-2-pro` | `1611a746f47175b1…` |
| after the second promotion | `611dc0a9dfa10152…` |
| after the second switch back | `1611a746f47175b1…` |

**Two things are proved there rather than one.** The repository returns byte for byte to where it
started — `git status` on tracked files agrees, with `assets/` and `MANIFEST.json` unmodified — and
the *switched* state has a single digest too, so the promotion is **deterministic**: promoting the
same candidate twice produces the identical tree. A reversible operation that produced a slightly
different arrangement each time would still pass a "did it come back" test and would be a much worse
thing to own.

`verify.py` was run in the promoted state as well and reported **0 failures across 2 sets** with
prompt parity live, which is the other half of the claim: the switch is reversible *and* the
repository is green on both sides of it.

The digests are a measurement taken at one commit, not a constant. They move the instant any file in
either set changes, which is the point — re-take them around a promotion rather than comparing
against these.

### What a promotion does NOT do

It does not materialise anything. `aetherholm-web/public` holds 80 committed PNGs and every one of
them checksum-matches this manifest (measured: 80 match, 0 differ — 75 under `public/art/`
mirroring this layout and five flattened at the root), and nothing in the estate reads this
repository at run time — so after a switch, the consumers still hold the old bytes until they are
updated deliberately:

```
python3 materialise.py --provider <id> --into ../aetherholm-web/public/art
python3 materialise.py --provider <id> --into ../aetherholm-web/public --only title --flatten
```

The point of `promote.py` is not that those commands disappear. It is that the id in them stops
being a decision anybody has to remember: it is whatever `providers.json` says is shipped.

---

## Provenance

The code in this repository was written by **Claude Opus 5** and **Claude Fable 5**, assets
generated with **FLUX 2 Pro**, under human direction and review.
