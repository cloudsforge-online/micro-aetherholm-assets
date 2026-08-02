# Aetherholm art set

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

---

## 1. What is here

```
assets/<set>/<slug>-<width>x<height>.png
```

| Set | Count | What |
| --- | --- | --- |
| `islands/` | 12 | Island archetypes: 3 altitude bands (`world.ts:30`) × 4 biomes (ART_BIBLE.md §3), 1024², flat sprites. |
| `buildings/` | 20 | One sprite per building type in `content.ts:23-44`, 512², three-quarter view. |
| `ships/` | 10 | One side profile per airship class in `content.ts:240-251`, 1024×512; role read off the spec table. |
| `shipicons/` | 10 | Flat vector class icons, 256², Worlds moss. |
| `icons/` | 16 | Resources, population, strain, aegis, spire, lanes, queues, fleet, battle, chronicle, 512². |
| `heraldry/` | 16 | 4 fields, 8 charges, 4 rank crests, 512² — the components behind `worlds`' ranked banner URNs (§5). |
| `keyart/` | 4 | Hero 1920×768, og backdrop 1200×640, social backdrop 1280×640, wordmark backdrop 1536×512 — scenes, textless. |
| `splashes/` | 6 | Season/event splashes, 1536×640. |
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
`aetherholm/src/content.ts:23-44`, the research trees at `:55-96`, the 10 airship classes at
`:240-251` with their balance table at `:302-313` — and the service is now the canon. This
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
  that repository exists" (`content.ts:5-8`) — stale as of this repository, reported to the
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
`cf:aetherholm:heraldry:<seasonId>:rank:<n>` (`worlds/src/heraldry.ts:81`) — and its header
states "first place and fifth place are different artwork, decided by the asset pipeline later"
(`worlds/src/heraldry.ts:24-26`). This set is that decision. A banner composes **field + charge
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

- The wordmark backdrop ships textless by design; the client typesets over it. If the client
  ever wants a pre-lettered wide banner, it is a `derive.py` composite, not a generation.
- `keyart/hero` and `keyart/wordmark-backdrop` each carry a faint invented painter's-signature
  scrawl in a lower corner, generated despite the scene style's prohibition. Both are
  recorded here rather than re-rolled: the compositions are exceptional, the scrawls are
  illegible at any shipping size, and a re-roll discards the whole painting to remove them.
  If either is ever re-generated for other reasons, the prohibition stands in the prompt.
- `content.ts:5-8` still promises the trees to this repository (§2). The correction belongs to
  `micro-aetherholm`, not here.
- No registry row names an `aetherholm` surface accent; the title deliberately wears Worlds'
  moss (`docs/ecosystem/20-aetherholm.md` §6, the registry-row bullet), so nothing is missing —
  recorded so nobody "fixes" it into a new accent.
