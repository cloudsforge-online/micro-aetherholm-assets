# How the models were judged — Aetherholm

> ## ONE EVALUATION CONCLUDED. A SECOND ONE IS OPEN.
>
> **This banner covers the Qwen-Image 2512 comparison only, and it is closed.** A second
> challenger — **gpt-image-2** — was generated against this set in full afterwards, is on disk at
> `candidates/gpt-image-2/`, and its evaluation is the last section of this file. Read that section
> before treating anything below as the current state of the repository: three of the sentences in
> this banner were true of a repository holding one set and are not true of one holding two, and
> they are corrected in place rather than left to be discovered.
>
> **FLUX 2 Pro ships.** The Qwen-Image 2512 challenger was generated against this set in full,
> measured against every criterion below, and lost. A second pilot in a `positive` prompt dialect
> was run to test whether the verdict was partly an artefact of this estate's own prompt style;
> it was not. **The owner has since withdrawn Qwen-Image 2512 from the estate, and this
> repository's `candidates/qwen-image-2512/` and `candidates/qwen-image-2512-positive/` trees,
> their manifests, their deployment records and their two registry entries have been deleted.**
>
> **Every Qwen figure below was measured off that challenger's bytes while those bytes existed, and
> is now history rather than something you can re-derive.** `compare.py` cannot reproduce those
> columns: it reads manifests, and Qwen's two are gone. So the numbers it last printed have been
> transcribed into the *"transcribed before the sets were deleted"* section, because deleting 741
> images across the estate must not delete the reason the estate chose what it chose. **That
> section, and only that section, is the transcribed one.** The gpt-image-2 section after it is
> live: both manifests are on disk and `python3 compare.py` reprints every figure in it on demand.
>
> **What survived the deletion and can still be checked today:** `review/compare/artefacts.json`,
> the by-eye defect tally with its scope stated; the recorded literal prompts in `MANIFEST.json`;
> `claims.py`, which still re-derives every figure in this file that has a live source; and the
> provider seam itself — `providers.json`, `backends.ts`, the dialect registry and `verify.py`'s
> `check_parity` — kept whole because the estate has a stated 3D and animation gap FLUX cannot
> fill and a next challenger is a question of when rather than if. **Keeping the seam is what made
> the second evaluation a day's work rather than a rewrite**, which is the strongest argument this
> file can offer for the decision it records.
>
> **One consequence was stated here because it is easy to miss, and the second challenger has since
> undone it.** `check_parity` compares sets to each other; with the Qwen trees deleted there was one
> set left, so it went DORMANT and returned clean because it had been handed one document.
> `verify.py` printed that word on every run instead of a zero, and `verify.py --self-test` proved
> on every CI run that it still failed when given something to fail on. **It is LIVE again today**
> — two sets on disk, and the last run reports `prompt parity across 2 sets: 0 disagreement(s)`.
> The distinction the paragraph was written to make still matters and is worth keeping in view: a
> zero from a comparison that happened and a zero from a comparison that did not are the same
> character, and only one of them is a result.


The criteria are estate-wide and are stated in full in **`micro-brand/COMPARISON.md`**. This file
records what is specific to this set, and the baseline numbers a challenger is measured against.

**Every count below is re-derived by `python3 claims.py`**, which reads the figure out of this file
and recomputes it from the manifests, the dialect registry and the scored artefacts. It is here
because two figures in the positive-dialect section were wrong and had been wrong in BOTH game
repositories at once: the paragraph was copied from one to the other and brought its numbers with
it. Idea drift was stated as 2 of 15 where the three repositories' own scored artefacts sum to 1,
and "74 of them here" was true of emberkin and not of aetherholm, where it is 92. A number a
document carries and nothing recomputes is a number waiting to be copied somewhere it is false.

The criteria were written **before** a challenger set existed, which is the only time criteria
can be written honestly. Once the images are on screen it is very easy to discover that the
thing the winner happens to be good at was the thing that mattered all along. They are left in
the tense they were written in, and the verdict is kept separate from them, because rewriting a
criterion after the result is the one thing this document exists to prevent.

## What is compared here

101 manifest entries: **96 generated** and **5 derived**. Only the 96 are compared. A
derivative is a deterministic Pillow operation on this provider's own output — running it against a
candidate set costs nothing and tells you nothing about the model, and asking a model for one
separately would break the relationship the `derivedFrom` column asserts.

Sets: `islands, buildings, ships, shipicons, icons, heraldry, keyart, splashes, title`.

## The set-specific coherence question

Coherence within the set is the criterion that matters most and the hardest thing for an image
model, and it matters *more* in a two-way comparison, not less: with a single challenger, "which is
better" collapses into a per-asset beauty contest unless the set-level judgement is doing real work.

Aetherholm's own question: it mixes painterly sprites (islands, buildings, airships, under ART_BIBLE.md) with flat vector icon and heraldry sets on the same ground. A model that holds one register and loses the other has failed the coherence criterion even if every individual image is good — and this is the set where that is most likely, because the two registers are deliberately far apart.

**Judged within this set only.** The estate's three asset sets are deliberately unalike — a flat
geometric brand system, Emberkin's species sheets, Aetherholm's painterly islands. A model that
makes any two of them look like each other has failed rather than succeeded, and there is no
cross-repository coherence number.

## The baseline, measured

`python3 compare.py` against the reference set today:

| | FLUX 2 Pro |
| --- | ---: |
| generated | 96 |
| cost | **289.5 provider image units** |
| assets needing at least one retry | 72 of 96 |
| C2PA carried, measured off the bytes | see `compare.py` §5 |

**A number that is not what it looks like.** Summing `providerCostUnits` across the whole manifest
double-counts, because a derivative inherits its parent's cost so a reader can see what the file
behind it cost. `compare.py` sums over generated entries only, which is why the figure above is
289.5 rather than the larger number a naive sum produces.

## Cost, and why the two figures are not comparable

FLUX bills **per image**. A Managed Compute deployment bills **per hour of existence**, whether or
not it generates anything — so `compare.py` prints each in its own unit and derives no per-image
figure for a per-hour provider. A per-image figure there would be a statement about how well the
run was organised, not about the model: run the same set twice, once starting the moment the
endpoint went healthy and once the next morning, and it differs by an order of magnitude with
byte-identical output.

This is already concrete. Cosmos 3 Super billed for its entire deployment lifetime and produced
**zero images**, because it never came up.

## Known asymmetries

1. **This set is not internally prompt-uniform.** Most recorded assets carry a prompt the current
   clauses no longer derive, because they were edited after the run. Parity is still exact, because
   it is *per asset*: a candidate replays the string that asset was actually generated from. But a
   challenger that beats the reference on an asset generated before a hardening clause has beaten a
   slightly easier opponent.

2. **`c2pa` is measured off the bytes, never asserted.** Whether a challenger emits C2PA at all is
   unknown and will be recorded as measured. A candidate set with no C2PA is a legitimate finding;
   one *claiming* C2PA it does not carry is a defect this estate has already shipped once.

3. **Delivered dimensions may not floor the same way.** FLUX floors each dimension to a multiple of
   16. That arithmetic is FLUX's, measured, and must be re-measured per provider before reuse.

4. **A text encoder may silently truncate.** These prompts are long and their prohibitions are
   deliberately last. A model with a small token budget receives the opening and discards them —
   and the comparison would read that as a style failure rather than as truncation. Probe it before
   the run.

5. **Nothing here counts providers, and that is why the seam outlived the challenger.** The
   comparison was briefed three-way, ran two-way because Cosmos 3 Super failed to deploy, went
   one-way when the owner withdrew Qwen-Image 2512 — **and is two-way again**, because
   gpt-image-2 arrived and the seam was still there to receive it. The registry, the backend
   interface, the dialect seam and the parity check were all kept: the estate has a stated 3D
   and animation gap FLUX cannot fill (`docs/ecosystem/19-new-products.md`), so reinstating
   them for the next challenger would have been a rewrite rather than an edit. What was deleted
   with the model is only what could not outlive it — its OpenAI-images envelope, and the
   transposed-`size` compensation written for that one endpoint's bug. The transposition
   DETECTION is kept and is not specific to any model; it fired zero times on this run.

## The positive dialect: was the verdict partly our prompt style?

Everything above is one controlled experiment — every model replays the recorded prompt byte for
byte — and it answers **"which model is better on identical input"**. The truncation probe raised a
second question it cannot answer.

**Qwen does not truncate.** It receives the prohibitions in full and disregards them while honouring
the positives, so the prohibition-last technique this estate built against FLUX does not transfer.
These briefs are heavy with prohibitions, which would make them close to the worst possible shape of
brief for it — and the framing and bevelling above would then be partly OUR failure, not the model's.

**The hypothesis: restating the prohibitions as positive assertions fixes the defects.**

### How a second prompt style exists without weakening prompt parity

A **dialect** is a named, deterministic, total function from the prompt on record for an asset to
the prompt a set is actually sent. `literal` is the identity transform, has zero rules, and is what
every set above was generated in. `positive` is one ordered rule list in `dialects.json` — the same
file, byte for byte, in all three asset repositories — read by both `dialects.ts` and `dialects.py`,
which is the one-file-two-loaders arrangement `providers.json` already uses.

Parity is enforced **within** a dialect exactly as before, and **across** dialects by
**re-derivation**, which is *stronger* than the equality it replaces: a candidate's recorded prompt
must be exactly what its dialect's rules produce from the reference's own record, and `verify.py
--parity` fails on one differing byte. Equality could only say *"these two strings differ"*;
re-derivation says *"this string is not what this dialect produces from the record"*, which catches
a hand-edited prompt, a rule added after a run, and a set whose declared dialect is not the one it
was generated in.

A candidate still cannot invent an asset the reference has never generated — the transform's input
IS the reference record. `--reprompt` is refused outside the literal dialect. And "positive" is
measured rather than claimed: the dialect declares the vocabulary it forbids itself, the result is
scanned for it on word boundaries, and a prompt that still carries any **cannot be sent at all**.
Every prompt in this pilot passed at zero residuals.

`qwen-image-2512-positive` differs from `qwen-image-2512` in one field — same model, same
deployment, same route, same key, same concurrency, asserted by test — so a difference in output has
exactly one available explanation. The FLUX set and the existing Qwen set are byte-identical.

### The restatement

*"Flat fills only: no gradients, no bevels, no drop shadows, no glow, no 3D"* became *"Flat fills
only: this is a vector graphic of the kind an SVG file holds. Every shape is one single solid block
of colour, exactly the same value at its centre as at its rim, and every edge is a hard boundary
where one flat colour stops and the next flat colour begins."*

*"Draw only the subject itself: no construction lines, no grid, no guides, no ruled margins, no
border, no frame, no bounding box"* became *"Draw only the finished subject: the subject and the
flat field are the whole of the image, and the subject's own outline is the only edge anywhere in
the frame."*

*"It is not standing on anything: no floor, no platform, no pedestal, no cast shadow"* became *"The
subject floats free: the #12100f field continues unbroken beneath it and on all four sides of it,
right up to its outline, so the last pixel outside its edge is #12100f and the first pixel inside is
the accent."*

The subject sentence is carried through untouched wherever it holds no prohibition, which is what
keeps the two dialects two phrasings of one brief rather than two briefs.

### The result, and why phase 2 was not run

The full 15-asset pilot and its measurements are in `micro-brand/COMPARISON.md` §9. This
repository's share is scored into `review/compare/artefacts.json` beside the other two columns, on
the same taxonomy and the same assets.

**The hypothesis is rejected.** Across all 15 pilot assets, framing survived at 15 of 15 and
non-flat rendering at 15 of 15 — against a brief containing *not one prohibition word*. That is the
model's register. It is not truncation and it is not a misread brief: we asked in the negative and
it framed everything, we asked in the positive and it framed everything.

Positive phrasing did do two things. Construction guides went to zero, and both assets flagged as a
different class of failure came back on-subject — a recursive grid of picture frames became a single
framed shape, and a Hokusai pastiche became a plain wave curl. And it made one thing worse: idea
drift rose from 1 of 15 to 8 of 15, because restating a shape prohibition as a positive description
hands the model more shape vocabulary and it elaborates on it.

**What `verify.py` said about all three sets, on the last run that could see them.** Zero
failures in each: the shipped set, the complete literal-dialect challenger, and this
repository's 4 assets of the pilot. The positive-dialect set is a
15-asset pilot, not a whole set, spread across the three repositories, so the verifier
reported the rest of the plan as un-generated. That reads as "planned but never generated" and is the
check doing its job on a deliberately partial set, not a defect in the set. Prompt parity,
checksums, dimensions and C2PA passed at zero failures across all three.

**And that was the last run of its kind.** With the Qwen trees deleted the verifier read one
manifest, so `check_parity` had nothing to compare and printed DORMANT rather than a zero — see
`verify.py`'s header. The zero above was a comparison passing; the zero on the runs that followed
was a comparison not happening, and the two must not be spelled the same way. **A second set on
disk has since made it live again**, which changes nothing about the paragraph and everything about
the number: the distinction is a property of what the verifier was handed, not of the calendar, and
`verify.py --provider gpt-image-2` still prints DORMANT this afternoon because that selection hands
it one document.

Phase 2 — all 235 in this dialect — was **not** run. It would have spent a deployment lifetime to
confirm a negative already established at 15 of 15 with no variance. Stopping was the finding,
and the verdict is unchanged and now final: **FLUX, decisively.** The dialect machinery is left
in place — `dialects.json`, `dialects.ts`, `dialects.py` and the cross-dialect re-derivation in
`check_parity` are untouched — because it is estate code shared byte-for-byte with the sibling
repositories and the question it was built to ask is about prompting in general rather than
about one vendor. The recorded literal prompts remain the corpus, whenever there is a second
model to put them to.

---

## What the comparison measured, transcribed before the sets were deleted

`compare.py` produced these columns from the three manifests and the delivered pixels. Two of those
manifests no longer exist, so the tool cannot print this again and the last run it did print is
copied here verbatim. **Nothing in this section is re-derivable and `claims.py` does not pin it** —
that is stated rather than hidden, because a figure that outlives its source and keeps a confident
tone is exactly the defect `claims.json` was written after.

**The third column is a DIFFERENT PROMPT DIALECT** and is not a controlled comparison with the
first two. It answers "which is better when each is prompted the way it wants", which is a
different question from "which is better on identical input". It is scored on the same taxonomy
and the same assets, which is what makes it readable at all.

### 1. Prompt adherence

|  | FLUX 2 Pro | Qwen-Image 2512 | Qwen positive |
| --- | ---: | ---: | ---: |
| ground off-target (>0.12 luma) | 0 | 6 | 0 |
| median ground luma | 0.0053 | 0.0074 | 0.0344 |
| below the accent floor | 13 | 13 | 0 |
| nearly blank | 0 | 0 | 0 |
| delivered size != declared | 0 | 0 | 0 |

Set sizes at the time of the run: FLUX 101 entries (96 generated), the literal
challenger 101, the positive pilot 4.

### 2. Style coherence within the set — spread, not average; lower is one hand

|  | FLUX 2 Pro | Qwen-Image 2512 | Qwen positive |
| --- | ---: | ---: | ---: |
| accent lightness: bias | -0.103 | -0.263 | -0.073 |
| accent lightness: SPREAD | 0.187 | 0.175 | 0.129 |
| accent hue error: mean deg | 10.6 | 10.7 | 7.9 |
| accent hue error: SPREAD | 7.5 | 8.0 | 6.8 |
| ink coverage spread (in-kind) | 0.0689 | 0.1187 | 0.1236 |
| ground luma spread | 0.0063 | 0.0700 | 0.0139 |
| KB per megapixel (median) | 429 | 1168 | 1034 |

**The confound, restated so the table is not over-read.** The reference set has had
`normalise_ground.py` run over it and a candidate set as generated has not, so the ground-luma row
is NOT a like-for-like model comparison; the honest reading is each candidate's absolute figure on
its own. The accent, ink and KB/MP rows are unaffected — normalisation rewrites near-ground pixels
only. KB per megapixel is a proxy and not a verdict: flat geometric art compresses hard and
photographic texture does not, so a large gap means the two models answered one brief in different
REGISTERS, which is what criterion 2 cares about most.

### 3. Legibility at the size the asset is used at

|  | FLUX 2 Pro | Qwen-Image 2512 | Qwen positive |
| --- | ---: | ---: | ---: |
| median contrast retained at 32px | 83% | 84% | 86% |
| median contrast retained at 16px | 64% | 74% | 68% |
| marks under 50% at 16px | 8 | 6 | 1 |

### 4. Artefact rate, tallied by eye

Scored over the 4 `icons/resource-*` assets (aether, cloudstone, provisions, skysteel) visible in `review/compare/compare-icons.png` — a SAMPLE, stated so the counts are not read as out of 25.

|  | FLUX 2 Pro | Qwen-Image 2512 | Qwen positive |
| --- | ---: | ---: | ---: |
| frame / border / bounding box | 0 / 4 | 4 / 4 | 4 / 4 |
| ground not the flat ash field | 0 / 4 | 4 / 4 | 3 / 4 |
| idea not recognisable from the plan | 0 / 4 | 0 / 4 | 2 / 4 |
| non-flat rendering (3D, bevel, gradient, glow, texture) | 0 / 4 | 4 / 4 | 4 / 4 |

### 5. Retries and disclosure, free from the manifests

|  | FLUX 2 Pro | Qwen-Image 2512 | Qwen positive |
| --- | ---: | ---: | ---: |
| assets needing >= 1 retry | 72 / 96 | 0 / 96 | 0 / 4 |
| total retries | 107 | 0 | 0 |
| failed attempts logged | 90 | 0 | 0 |
| carries C2PA, measured off the bytes | 96 / 101 | 0 / 101 | 0 / 4 |

### 6. Cost, in the unit each model billed in

These are **not the same number** and were never added, averaged or divided into each other.

- **FLUX 2 Pro:** **289.5 provider image units** over 96 generations, 3.02 per image, 5 derivatives free.
- **Qwen-Image 2512:** deployment hours. **No per-image figure exists or was invented** — the
  endpoint returned `quality` and `usage` as null, so there was no per-image signal at all.

  The deployment record was deleted with the candidate tree, so what it measured is transcribed
  here rather than left as a dangling path. One `GlobalManagedCompute` deployment at capacity 1,
  named `qwen--qwen-image-2512`, served **all three asset repositories one after another**, so its
  hours are joint and cannot be attributed to this repository alone — there is no non-arbitrary way
  to split them and `compare.py` refused to try.

  **Creation time: never observed, and deliberately never guessed.** The deployment existed before
  the run began and ARM exposes no creation timestamp for a project-scoped managed-compute
  deployment, so its true billed lifetime is LONGER than any window recorded here. Writing a
  plausible timestamp would have turned an unknown into a figure somebody would later quote.

  | | literal-dialect run | positive-dialect pilot |
  | --- | --- | --- |
  | window, first to last generation | 07:43:31Z to 08:25:31Z | 10:57:49Z to 10:59:33Z |
  | observed working hours | 0.7 | 0.03, and MARGINAL |
  | generations in the window, all three repos | 233 | 15 |
  | this repository's share | 96 | 4 |
  | mean seconds per generation | 10.8 | 6.8 |

  All times 2026-08-03. The 0.7 hours **exclude provisioning and warming, which are billed**: the
  endpoint returned `500 Model service is unavailable` for at least 17 minutes of observed probing
  before it served anything. The pilot's 0.03 is marginal hours over a deployment that was already
  running and already billing — that cuts both ways and must not be quoted as "the experiment was
  free". It was free only because a deployment nobody could delete was already burning.

  **It was not torn down from here, and the record says so rather than showing a closed bill.** A
  `GlobalManagedCompute` deployment on an AIServices account is project-scoped and none of three
  routes reached it: the ARM account-level deployments collection listed only `claude-opus-5` at
  every api-version tried; the project-scoped ARM path answered `500 InternalServerError` on both
  GET and DELETE; the data-plane path was 200 on GET and 404 on DELETE. Deleting it required a
  human in the Azure AI Foundry portal, and it was confirmed still present at 08:30:17Z.

**The operational finding is worth more than either number.** The challenger ran on dedicated
hardware and was idle for most of its billed life, because a candidate may only be generated once
the reference set it replays is complete. That is a fact about how the comparison had to be
sequenced, not about the model, and it is the reason a per-hour provider must never be given a
per-image figure.

---

## The second challenger: gpt-image-2, on the same 96 assets

Written after everything above and scored against it unchanged. Nothing here reopens a criterion,
reweights one or adds one, because the entire value of fixing them before the images existed is
spent the first time a result is allowed to edit the rubric.

**The short version, and it is not a single winner.** gpt-image-2 wins this set's own sharpest
question — holding two registers at once — by a distance, wins colour fidelity outright, and wins
every painterly kind on sight. It loses `heraldry` and `shipicons` outright and the flat `icons`
narrowly, and it loses all three for one reason: **it draws outlines where this set's flat assets
are filled**, and every one of those assets is used small. Read the verdict before quoting a row out
of the tables.

### What was run, and what it cost to find out

| | |
| --- | --- |
| model | `gpt-image-2`, OpenAI, served by Azure AI Foundry |
| adapter | `openai-images` in `backends.ts`, shared byte-for-byte with the sibling repositories |
| dialect | `literal` — the identity transform, so every prompt is the reference record replayed byte for byte |
| concurrency | **1**, measured rather than chosen for caution: two back-to-back requests return `429 RateLimitReached, "Please retry after 32 seconds"` |
| set | `candidates/gpt-image-2/`, its own `MANIFEST.json`, its own `native/` |
| run | 2026-08-14, `13:37:05Z` to `16:19:42Z` — **2h 42m** of endpoint wall clock for 96 generations, a mean of **103 seconds each**, serialised end to end |
| retries | **0**, and no refusal, no transposed delivery and no failed attempt logged |

The candidate set holds the same **101 entries** as the reference: **96 generated** and the same
**5 derived** — three favicons, one `og` crop and two composited wordmark cards — cut by `derive.py`
from its own output rather than asked for separately.

`verify.py` reports **0 disagreements across 2 sets** on prompt parity, which is the precondition
for everything below: the two models answered the same question character for character, so any
difference in the output belongs to the model. Both sets are the `literal` dialect, so parity here
is exact string equality *and* re-derivation from the reference record, and either alone would have
been enough.

**Seventy-three of the 96 could not be requested at their declared size, and none of them were
upscaled.** This deployment enforces a minimum pixel budget no documentation states; it was bisected
to **(524288, 655360]**. This repository is the worst of the three in the estate for it — 52 assets
declare 512x512, 10 declare 256x256, 10 declare 1024x512 and the wordmark declares 1024x384, and
every one of those is under the floor:

| declared | factor | requested | assets |
| --- | ---: | --- | --- |
| 512x512 | x2 | 1024x1024 | 52 — `buildings`, `heraldry`, `icons` |
| 256x256 | x3.5 | 896x896 | 10 — `shipicons` |
| 1024x512 | x1.5 | 1536x768 | 10 — `ships` |
| 1024x384 | x1.5 | 1536x576 | 1 — `title/wordmark` |

Each is **Lanczos-downscaled** to the declared size through `derive.py`, and the as-delivered native
is kept at `candidates/gpt-image-2/native/` and recorded on the entry in four columns (`nativePath`,
`nativeSize`, `nativeSha256`, `nativeC2pa`). `verify.py`'s `check_native` fails any entry whose
native is *smaller* than its declared size, and runs as integrity rather than conformance, so the
one thing this arrangement could be used to hide — an upscale reported as a generation — is the one
thing it is checked for on every run. The 23 assets at or above the floor (all 12 `islands`, 6
`splashes`, 4 `keyart` and `title/mark`) were requested at their declared size and have no native.

**Billing is in a third unit.** `usage.output_tokens`, per image, varying with size and quality. It
is per-image accounting like FLUX's cost units, so `compare.py` takes the per-image path — but an
output image token and a provider image unit are not convertible without two price lists this
repository does not hold, and the rule above stands unchanged: report each in its own unit, never
add them, and take the money question to the invoices. `compare.py` now branches on `billing.basis`
rather than on `billing.unit`, because a third unit is exactly what a unit-string branch breaks on.

### The ground confound, which is REMOVABLE here and was removed

Every comparison above carries a caveat: the reference set has had `normalise_ground.py` run over it
and a candidate set as generated has not, so the ground rows are not like-for-like. **In this
repository that caveat does not have to be lived with.** The script here copies ancillary PNG chunks
through, so snapping a ground does not destroy a C2PA box — measured, not assumed: 13 candidate
entries were normalised and still carry their box. It was given a `--provider` flag on this branch,
the candidate was normalised exactly as the reference was, and both columns below are
post-normalisation.

**What the flag cost, and it is worth stating.** Before it, `normalise_ground.py` hardcoded the
reference tree behind a comment claiming it resolved per provider at run time. Running it for any
reason would have rewritten **the shipped set**. A candidate that cannot be normalised cannot pass a
check the shipped set only passes *because* it was normalised, and it would have failed for
something the model never did.

**What the models actually delivered, before either was touched** — the `deliveredGround` column,
recorded at generation time:

| | entries with the column | distinct grounds | range | modal |
| --- | ---: | ---: | --- | --- |
| target | | 1 | `#12100f` | |
| FLUX 2 Pro, as delivered | **6 of 96** | 6 | `#141414` to `#342c3c` | — |
| gpt-image-2, as delivered | **89 of 89** | **5** | `#040404` to `#140c0c` | `#0c0c0c`, 63 times |

**The asymmetry in the first column is the honest part of that table.** `deliveredGround` is
write-once and was added to this repository *after* most of the reference run, so it exists for six
of FLUX's 96 generations and the other 81 were lost before the guard existed. Six against 89 is not
a comparison and is not presented as one. What can be said is each column on its own: gpt-image-2
misses the target in one direction only, always too dark, 63 of 89 at the same hex — a **bias rather
than a spread**, and criterion 2 says in as many words which of those two matters. The six FLUX
readings that survive are all too light. The `#232324`-to-`#3f3a3b` range quoted in
`normalise_ground.py`'s own header is `micro-brand`'s measurement, carried into this file with the
script, and it is not this set's.

### What was looked at, by eye

The measurements are in the next section. This is the half of criterion 1 that no measurement speaks
for, scored off the sheets `compare.py` rebuilt for this run: all 16 `heraldry`, all 16 `icons`, all
20 `buildings`, all 12 `islands`, all 10 `ships`, all 10 `shipicons`, all 6 `splashes`, all 4
`keyart` and both `title` marks, each beside its counterpart.

**The one finding that explains most of the others: gpt-image-2 draws OUTLINES where this set's flat
assets are filled.** Every heraldic crest, most charges, most icons and all ten ship icons come back
as uniform-weight strokes around an empty ash interior. The briefs say *"one uniform stroke weight
throughout"*, which is a line-weight instruction that gpt-image-2 reads as a *drawing style* and
FLUX reads as a constraint on filled shapes; neither reading is wrong on the words. Where the asset
is an outline by nature the register is exactly right, and where the asset is a silhouette used at
badge size it is fatal.

- **`heraldry` — the reference wins, and this is the challenger's worst kind.** README §5 states
  what this set is for: four rank tiers "distinguished on three channels at once so the tiers
  survive monochrome", with metal, silhouette complexity and coverage stepping down together.
  gpt-image-2 removes one of the three channels by drawing all four crests hollow. `crest-rank4` is
  the clearest case: the reference returns a solid pennon bar and the challenger returns an empty
  rectangle with a notch at each end, which at badge size is a rectangle. Measured, contrast
  retained at 16 pixels across the four crests is **60/88/71/79%** for the reference and
  **45/24/51/32%** for the challenger — three of four under the half-way line against none. Its
  full-size drawing is often the more elegant of the two (`crest-rank1`'s open laurel, `crest-rank2`'s
  curled storm-cloud wreath), which is exactly the trap: heraldry components are composed into a
  banner and read at rank-pip size, not admired at 512.
- **`shipicons` — the reference wins, and the size table above predicted it.** All ten are declared
  at 256x256, all ten were generated at 896x896 and downscaled by 3.5, and **all ten** keep under
  half their contrast at 16 pixels (26–46%) against **none** of the reference's. A 256-pixel pip
  drawn as an 896-pixel picture has 12.25 times the area to put detail in, and detail that survives
  at 896 and dies at 256 is precisely the failure mode of an icon. At full size the challenger's
  outlined hulls are cleaner and brighter than the reference's dark filled silhouettes; at the size
  they are used they are worse.
- **`icons` — the reference wins narrowly on legibility, and the challenger wins colour outright.**
  Nine of the 16 fall under 50% at 16px against two, for the same reason. Against that, the
  challenger renders the *specified* hue: mean ΔE 6.0 against 17.9 over the 16 icons, winning 14 of
  them, and the whole `ui` family — specified moss `#6d9a49` — comes back from the reference as a
  desaturated olive-grey (`#727a57`, `#78845c`, `#83926b`) and from the challenger within 3 to 5 ΔE.
  This estate's answer to a rendered hue that misses its specification is a numerical recolour after
  the fact — README §10's `tint.py`, which this run applied to two rank crests — and the icons were
  never put through it, so the reference ships those eight glyphs in the olive it drew. The verdict
  still goes to the reference, because a colour error has a deterministic repair available whether
  or not it was used, and a glyph that has stopped reading at 16 pixels does not. One clause breach worth naming: `resource-aether`
  asks for a teardrop with two short flame tips floating above a ring *"not touching it"*, and the
  challenger returns a single flame whose base overlaps the ring.
- **`buildings` — the challenger wins clearly, and it is the largest kind in the set.** The
  reference loses much of `skyhall`, `launch_rails` and `residences` into near-black; the
  challenger fills the frame at a consistent warm upper-left key light and draws the brief's
  prescribed "small ragged plug of island rock" under all 20, which the reference omits on several.
  Measured, ink coverage across the 20 doubles, 0.124 to 0.258, and it is material rather than
  noise. Two of the reference's 20 fall under 50% contrast at 16px (`launch_rails` at 30%,
  `residences` at 49%) and none of the challenger's do — the one kind where the register split runs
  the other way, because a building sprite is a filled silhouette in both sets.
- **`islands` — the challenger wins, with a variety caveat that is not small.** Its twelve are the
  most coherent group on the whole sheet: complete islands, clean keels, no stray material on the
  ground. The reference puts free-floating cloud banks on the ash field in five of the twelve —
  measured in the corner test below — and `midreach_terrace` is the worst of them, a bright cumulus
  occupying the bottom-right corner of an asset that exists to be composited over a background. What
  the challenger pays is variety: its twelve are near-identical isometric cubes with terraced tops,
  where the reference's differ in silhouette, altitude and framing. Coherence is criterion 2 and
  variety is not a criterion at all, so the row goes to the challenger and the caveat is recorded
  rather than scored.
- **`ships` — the challenger wins, and the measurement is unusually blunt.** **Nine of the reference's
  ten** ships fall below the accent floor: they are rendered in white, cream and grey rather than in
  the accent the registry specifies, and `gunship` is typical — a white envelope on a small hull in
  the middle of an empty frame. The challenger has one (`breaker`). Its ships fill the frame in warm
  timber and brass at twice the ink coverage. The reference's `flagship` also carries text-like
  scrawl along the hull against a prompt that prohibits lettering.
- **`keyart` — split, and the split is fitness for purpose.** The challenger paints the better
  pictures and the reference makes the better *backdrops*. `keyart/hero` and `keyart/og-source` are
  richer and more saturated from the challenger; `social-backdrop` and `wordmark-backdrop` are
  plates that a client typesets over, and the reference's darker, emptier bands do that job while
  the challenger puts a lit island city and a gold horizon band where the lettering goes. The
  measurement agrees from the other side: three of the challenger's four keyart entries fall below
  the accent floor against one of the reference's. **One prohibition the challenger simply keeps and
  the reference does not:** README §11 records that `keyart/hero` and `keyart/wordmark-backdrop` each
  carry a faint invented painter's-signature scrawl, generated despite the prohibition and shipped
  because a re-roll would discard the whole painting. The challenger's equivalents carry none.
- **`splashes` — the reference wins.** The challenger's six are darker and more contrasty and three
  of them collapse into a single dominant hue: `season-seal` becomes an orange smear, `storm-surge`
  a red one, and `private-skerry`'s islands lose their silhouettes into the dark. The reference's
  lighter, hazier plates read as scenes. Four of the challenger's six fall below the accent floor
  against three of the reference's, and this is a kind where the reference paid for it — it needed
  retries on five of the six, including five on `spire-war`, and the challenger needed none.
- **`title/mark` — the challenger wins the mark decisively and loses the favicons cut from it.** The
  brief asks for "one island silhouette with a flat inhabited top and a rocky keel tapering to a
  point below, floating free with clear space under it, and beneath that gap the ash ridge — one
  flat baseline with a single shallow arc rising from its centre". The challenger draws exactly
  that, in one uniform stroke weight, and it looks like a brand mark. The reference draws a lumpy
  green hill with arrow-shaped trees over a mottled, textured keel — against "flat fills only, no
  photographic texture" — on a bone bar the brief does permit. Then the register bites: the mark is
  the source of three favicons, and an outline mark hollows out. Both sets put both favicons under
  the 50% line at 16 pixels, which is a finding about the mark's design rather than about either
  model, but the challenger's 27% and 28% are materially worse than the reference's 41% and 42%.

### What `compare.py` measured, over all 101 entries

Unlike the transcribed section, **this table is live**. Both sets are on disk, both manifests are
complete, and `python3 compare.py` reprints every figure below on demand.

#### Prompt adherence

| | FLUX 2 Pro | gpt-image-2 |
| --- | ---: | ---: |
| ground off-target (>0.12 luma) | 0 | 0 |
| median ground luma | 0.0053 | 0.0053 |
| below the accent floor | 13 | **10** |
| nearly blank | 0 | 0 |
| delivered size != declared | 0 | 0 |

Both ground rows are post-normalisation in both columns, so they are equal by construction and say
nothing about either model; the delivered figures in the previous section are the ones that do. The
accent floor row is close and its *contents* are not: the reference's 13 are nine `ships`, three
`splashes` and one `keyart`, and the challenger's 10 are three `keyart`, four `splashes`, one `ship`
and two derived duplicates of the keyart entries. Each set loses the accent in a different place,
and each place is named in the by-eye section above.

#### Style coherence within the set — spread, not average; lower is one hand

| | FLUX 2 Pro | gpt-image-2 |
| --- | ---: | ---: |
| accent lightness: bias | -0.103 | -0.152 |
| accent lightness: SPREAD | 0.187 | **0.142** |
| accent hue error: mean deg | 10.6 | **6.3** |
| accent hue error: SPREAD | 7.5 | **6.8** |
| ink coverage spread (in-kind) | 0.0689 | **0.0632** |
| ground luma spread | 0.0063 | **0.0012** |
| KB per megapixel (median) | 429 | 686 |

The challenger is tighter on every spread row. The bias row goes the other way and that is the
distinction criterion 2 was written around: a model that is uniformly darker than specified is
coherent and correctable, and a model that scatters is neither.

#### The two-register question, which is this set's own criterion

The set-specific question stated at the top of this file is whether a model can hold **painterly
sprites and flat vector icons on the same ground** without collapsing one into the other. It is
answerable by measurement, and the measurement is unambiguous. PNG bytes per megapixel separates
"drew a flat mark" from "painted an object" across a whole set for free, and the sets divide cleanly
into 44 flat assets (`heraldry`, `icons`, `shipicons`, `title`) and 52 painterly ones (`buildings`,
`islands`, `ships`, `keyart`, `splashes`):

| | FLUX 2 Pro | gpt-image-2 |
| --- | ---: | ---: |
| KB/MP median, 44 flat assets | 293 | **223** |
| KB/MP median, 52 painterly assets | 518 | **895** |
| **separation between the registers** | **x1.77** | **x4.01** |
| ink coverage median, flat | 0.134 | 0.118 |
| ink coverage median, painterly | 0.161 | 0.288 |
| **ink separation** | **x1.19** | **x2.43** |
| within-register KB/MP spread, flat | 143 | **77** |
| within-register KB/MP spread, painterly | 341 | **235** |

**The challenger separates the two registers more than twice as hard and is more consistent inside
each of them.** Its flat assets are flatter than the reference's flat assets and its paintings are
denser than the reference's paintings, and the spread within each group is roughly half. On the
criterion this repository nominated as the one that matters most, it is not close.

**And it is the same fact as the legibility failure below, seen from the other side.** The way it
made the flat register flatter was to stop filling shapes. A number can say a set holds two registers
apart; only the next table can say whether the register it chose is the right one.

#### Legibility at the size the asset is used at

| | FLUX 2 Pro | gpt-image-2 |
| --- | ---: | ---: |
| median contrast retained at 32px | **83%** | 71% |
| median contrast retained at 16px | **64%** | 46% |
| marks under 50% at 16px | **8 of 65** | 35 of 65 |

**This is the challenger's worst table in the document and there is no reading of it that is kind.**
Over the 65 square assets of 512 pixels or less — the ones that are actually shrunk — the reference
puts eight under the half-way line and the challenger puts thirty-five. They are not the same
population and they are not the same kind of failure:

- FLUX 2 Pro, 8: `buildings/launch_rails` 30%, `title/favicon-32` 41%, `heraldry/charge-airship`
  42%, `title/favicon-192` 42%, `heraldry/field-cloud` 47%, `icons/resource-aether` 47%,
  `icons/resource-provisions` 48%, `buildings/residences` 49%. Two buildings, two heraldry, two
  icons, two favicons — scattered.
- gpt-image-2, 35: **14 of 16 `heraldry`**, **10 of 10 `shipicons`**, **9 of 16 `icons`**, both
  favicons. Systematic, and it is the outline register in every case.

#### Artefact rate, tallied by eye

Same four `icons/resource-*` assets as the transcribed section, scored off the rebuilt sheet. The
full reasoning, including one figure in the reference column this review believes is wrong and did
not change, is in `review/compare/artefacts.json`.

| | FLUX 2 Pro | gpt-image-2 |
| --- | ---: | ---: |
| frame / border / bounding box | 0 / 4 | 0 / 4 |
| ground not the flat ash field | 0 / 4 | 0 / 4 |
| idea not recognisable from the plan | 0 / 4 | 0 / 4 |
| non-flat rendering (3D, bevel, gradient, glow, texture) | 0 / 4 | **1 / 4** |

The one is `resource-provisions`, which carries a soft dark-green drop shadow offset down and right
of every stroke against a brief that prohibits drop shadows twice — invisible on the contact sheet,
obvious at 3x, and measurable as six lightness bands where the challenger's other three icons have
two or three.

**The taxonomy was fixed to catch what the previous challenger did** — Qwen scored 4, 4, 0 and 4
down these rows in order — and gpt-image-2 essentially does none of it. It fails somewhere the rows cannot see,
which is the outline register, and **a rubric that catches the last model's failures is not the same
thing as a rubric that catches this one's.** The rows are left exactly as they were rather than a
fifth being added after the result, and the gap is answered in the verdict instead.

**One thing the rows do not say and `artefacts.json` now does.** Scoring the challenger meant looking
at the reference column again, and `resource-skysteel` is an unambiguous 3D isometric ingot with
bevelled edges, gradient-shaded faces and a specular highlight, against a brief that prohibits all
three. The honest figure in the reference column is 1, not 0. It was **not** edited, because that
column is mirrored into the `$pilot` block, `$pilot` is summed across three repositories by
`claims.py`, and the sum is transcribed into `micro-brand/COMPARISON.md` §9.3 — so correcting it
here alone turns `claims.py` red in two repositories and makes a third repository's published table
wrong. It is recorded as owed, in the file that holds the figure, for whoever next touches §9.3.

#### Colour fidelity on the sixteen flat icons, measured

Not one of the six criteria, and included because the by-eye review kept returning to it. ΔE is
measured in CIELAB between the accent hex the registry specifies and the colour actually rendered,
using `verify.py`'s own reader so the numbers are the ones the verifier sees:

| icon | specified | FLUX rendered | ΔE | gpt-image-2 rendered | ΔE |
| --- | --- | --- | ---: | --- | ---: |
| `ui-chronicle` | `#6d9a49` | `#727a57` | 29.5 | `#6f9543` | **3.2** |
| `resource-aether` | `#8f7ae8` | `#a15bef` | 25.8 | `#8e6ae3` | **9.3** |
| `ui-battle` | `#6d9a49` | `#78845c` | 25.6 | `#6b9044` | **5.0** |
| `resource-provisions` | `#8fbf4f` | `#b3e035` | 25.3 | `#91bd3b` | **7.8** |
| `ui-queue-research` | `#6d9a49` | `#83926b` | 25.3 | `#6c9345` | **3.5** |
| `status-aegis` | `#7fd4e0` | `#cefcf4` | 21.2 | `#7dd0de` | **1.8** |
| `ui-wind-lane` | `#6d9a49` | `#74895b` | 20.9 | `#6a9246` | **4.0** |
| `ui-queue-build` | `#6d9a49` | `#7e8f5e` | 20.1 | `#6d9444` | **3.0** |
| `ui-fleet` | `#6d9a49` | `#77915d` | 16.9 | `#698e44` | **5.9** |
| `status-spire` | `#8f7ae8` | `#bb92ef` | 15.6 | `#916fe1` | **5.7** |
| `resource-cloudstone` | `#c9b891` | `#f2dbad` | 13.5 | `#cfb582` | **7.7** |
| `ui-queue-shipyard` | `#6d9a49` | `#7f9451` | 11.9 | `#6b9243` | **3.6** |
| `ui-lane-junction` | `#6d9a49` | `#899f54` | 10.4 | `#6b9243` | **3.6** |
| `resource-skysteel` | `#7fa3c0` | `#93a3b1` | 10.1 | `#7e9dbe` | **3.5** |
| `status-strain` | `#e05252` | `#ce5348` | **7.9** | `#e53f3a` | 13.8 |
| `status-population` | `#d08a5e` | `#cd8363` | **6.3** | `#dd7b48` | 15.3 |
| **mean** | | | 17.9 | | **6.0** |

The challenger wins 14 of 16. The eight `ui` glyphs all specify the same moss `#6d9a49` and the
reference renders every one of them as a desaturated olive-grey — the same class of failure README
§10 records for the silver and iron rank crests, where it was corrected numerically by `tint.py`
rather than by re-prompting. **The icons were not tinted**, so this column is what FLUX drew, and
the row exists partly to say that the patch was never extended to the kind that needed it most. The
two rows the challenger loses are both a push toward saturation: `status-strain` and
`status-population` come back redder and more orange than specified.

#### Corner artefacts on the flat ground, measured

An artefact this comparison had no row for, found by eye on the islands sheet and then measured over
all 86 flat-ground generations: the 99.5th percentile luma inside each of the four corner squares at
12% of the frame, which is where a sprite meant to be composited should be empty ash.

| | assets with bright material in a corner |
| --- | ---: |
| FLUX 2 Pro | **5 of 86** — all `islands`: `midreach_terrace` 0.70, `midreach_reef` 0.65, `shallows_terrace` 0.42, `highwind_crag` 0.41, `highwind_reef` 0.33 |
| gpt-image-2 | **2 of 86** — `ships/gunship` 0.90, `icons/ui-battle` 0.48 |

**The challenger's two are not the same defect and the honest reading says so.** `ships/gunship` is
its own bowsprit and stern fins reaching into the corners because the subject fills the frame, which
is what the brief asks for; `icons/ui-battle` is a crossed-swords glyph whose blades do the same.
The reference's five are free-floating cloud banks painted onto the ash field beside the island,
which is material that has nothing to do with the subject and that a compositor has to mask out. The
measure counts brightness and cannot tell those apart, so the eye is doing the last step and it is
recorded here rather than buried in a total.

#### Retries, and provenance

| | FLUX 2 Pro | gpt-image-2 |
| --- | ---: | ---: |
| assets needing at least one retry | 72 / 96 | **0 / 96** |
| total retries | 107 | **0** |
| failed attempts logged | 90 | **0** |
| C2PA on the file at `assets/`, measured off the bytes | **96 / 101** | 23 / 101 |
| C2PA on the as-delivered native, measured off the bytes | n/a | **73 / 73** |

**The retry row measures the harness as much as the model.** The reference's 107 retries were
overwhelmingly `429`s on a shared serverless endpoint; this challenger ran against a rate limit
severe enough to force concurrency 1, and serialising with a sleep meant it was never throttled at
all. Zero refusals is worth naming separately, because the sibling repository logged a
`moderation_blocked` output-filter refusal on the same model — this set's briefs never tripped it.

**The C2PA rows are exact and the second one is why there are two.** 23 of the challenger's 96
generations keep their box; the 73 that do not are not a sample, they are exactly the 73 that had to
be Lanczos-downscaled from a larger native, and re-encoding a PNG through Pillow drops it. **All 73
of those natives carry C2PA**, so no provenance was lost — it moved to the as-delivered file, which
is where the manifest's `nativeC2pa` column says to look. The reference's 96 of 101 is a genuine win
on the file that ships. It is also the number that makes `native/` non-optional in this repository:
three quarters of a promoted gpt-image-2 set would carry its provenance only there, which is why
`promote.py` moves `native/` with the rest of the set.

#### Cost, in the unit each model billed in

These are **not the same number**, were never added, averaged or divided into each other, and
`compare.py` refuses to derive a ratio between them.

- **FLUX 2 Pro: 289.5 provider image units** over 96 generations, 3.02 per image, 5 derivatives free.
- **gpt-image-2: 589,393 output image tokens** over 96 generations, **6,139.51 per image**, 5
  derivatives free.

Both bill per image and they still do not compare. What *is* comparable is each provider against its
own runs, and the useful figure for the next one is the second: roughly 6,100 output image tokens
per image at `quality: "high"` — and note that the 73 assets generated at a larger native cost for
what was rendered rather than for what was kept, so a repository with fewer sub-floor sizes would
pay less per shipped asset than this one did.

### Verdict: by kind, because there is no single winner

**The recommendation is: do not promote gpt-image-2 to `assets/` today, and do not read that as a
loss for the challenger.** It wins the criterion this repository nominated as the one that matters
most, by the largest margin in the document, and it wins more than half the assets by count. What it
does not win is the set as a whole, and the reason is one register decision applied uniformly to
kinds that wanted opposite things.

| kind | entries | better set | why |
| --- | ---: | --- | --- |
| `buildings` | 20 | **gpt-image-2** | Fills the frame at a consistent key light where the reference loses `skyhall`, `launch_rails` and `residences` into near-black; draws the prescribed island-rock plug on all 20; doubles ink coverage; and puts none under 50% at 16px against the reference's two. |
| `islands` | 12 | **gpt-image-2** | The most coherent group on the sheet, and the reference paints free-floating cloud banks onto the ash field of five of its twelve — measured, and a compositing defect rather than a taste one. The cost is variety: the challenger's twelve are near-identical isometric cubes. |
| `ships` | 10 | **gpt-image-2** | Nine of the reference's ten fall below the accent floor — white and grey hulls where the registry specifies an accent — against one of the challenger's, and its `flagship` carries text-like scrawl against a lettering prohibition. |
| `heraldry` | 16 | **reference** | The challenger draws all four rank crests hollow, which deletes one of the three channels README §5 says the tiers are distinguished on. Contrast at 16px across the crests: 60/88/71/79% against 45/24/51/32%. Fourteen of the sixteen fall under the line. |
| `shipicons` | 10 | **reference** | All ten declared at 256x256, all ten generated at 896x896 and downscaled 3.5x, and all ten under 50% at 16px against none. The commit that added the native path warned this kind was the one to look at hardest; it was right. |
| `icons` | 16 | **reference, narrowly** | Nine of sixteen under 50% at 16px against two. The challenger wins colour fidelity 14 of 16 and by a mean ΔE of 6.0 against 17.9 — but a hue error has a deterministic repair in this repository already (`tint.py`, README §10) and a glyph that has stopped reading does not. |
| `keyart` | 4 | **split** | The challenger paints the better pictures (`hero`, `og-source`) and carries none of the invented painter's signature README §11 records on two of the reference's. The reference makes the better *backdrops*: its emptier plates leave room for the type that gets set over them, and three of the challenger's four fall below the accent floor. |
| `splashes` | 6 | **reference** | Three of the challenger's six collapse into a single dominant hue and lose their subjects into the dark. The reference needed five retries on `spire-war` and one each on four others to get there, and the challenger needed none — the price is recorded, and it does not change which plate reads. |
| `title` | 2 + 3 derived | **split, and the derived half decides it** | The challenger's `mark` is the brief drawn correctly and the reference's is a textured hill on a bone bar. But the mark is the source of the favicons, an outline mark hollows out, and the challenger's favicons keep 27% and 28% at 16px against 41% and 42%. Both sets fail that line, which is a finding about the mark's design. |

**What would change the verdict, and it is cheap — which is precisely why it was not done.** The
challenger logged zero retries in 96 generations. Regenerating the 16 `heraldry`, the 10
`shipicons` and `title/mark` with the word "filled" or "solid" emphasised is 27 images and about
forty-five minutes at this endpoint's serialised rate. That was deliberately not done: **re-rolling
the assets that failed, and only those, until they pass is how a comparison stops measuring a model
and starts measuring the patience of the person running it.** The reference's 107 retries were
`429`s rather than re-rolls for taste, and the challenger is entitled to the same rule. It is also
the most promising single experiment this document can hand to whoever comes next, because the
kinds it loses are the cheap ones and the kinds it wins are the expensive ones.

**The verdict and the tooling agree, and they agree for different reasons.** This candidate passes
the promotion gate cleanly: `verify.py --provider gpt-image-2 --as-shipped` reports **0 failures**,
with conformance and completeness held fatal, and `python3 promote.py --provider gpt-image-2
--dry-run` plans the switch without complaint. Nothing mechanical stands in the way. The
recommendation not to promote is a judgement about `heraldry`, `shipicons` and the favicons, it is
recorded as a judgement rather than dressed up as a gate, and `promote.py --provider gpt-image-2`
will carry it out in one command the day somebody disagrees — reversibly, with the same command and
the other id.

**And one honest limit on all of the above.** This is one run of 96 images at one setting
(`quality: "high"`), on one brief, judged by one pair of eyes, against a reference set whose prompts
were in several cases edited after it was generated — so the challenger replayed the recorded string
and in places beat a slightly easier opponent, and §"Known asymmetries" 1 says so. Seventy-three of
its 96 assets are a Lanczos downscale of something larger, which is a resampling choice this
repository made and not something the model did. The measurements are reproducible on demand and the
by-eye scoring is not. Where the two disagree, the tables are what can be checked and the prose is
what has to be argued with.

## Addendum: the experiment this document proposed could not be run, so the control was run instead

The section above ends by naming what would change the verdict — a regeneration of the losing
categories with the brief pushed towards **filled shapes** rather than the outline register
gpt-image-2 chose for the crests and the ship icons. That was attempted on 2026-08-16. **It is not
possible in this repository**, and the reason is a property of the tooling rather than of the models.

`reprompt` — the field that would carry a changed instruction — is **reference-only**. A candidate
set replays the prompt string recorded in its own manifest; there is no supported path that hands a
candidate provider a new brief without first making it the reference, which is the promotion this
document recommends against. The only thing that could be run was a plain re-roll: same literal
prompt, same setting, new draws.

That is the control for the proposed experiment, and it separates two explanations the section above
could not distinguish: *the model answered this brief that way* versus *the model draws that way when
asked this*.

**Forty-nine assets were re-rolled** — all 16 `heraldry` crests, all 16 `icons`, all 10 `shipicons`,
6 `splashes` and the title mark: every category the verdict turned on, and then some. The result:

| | flux-2-pro | gpt-image-2 before | gpt-image-2 after |
| --- | ---: | ---: | ---: |
| marks under 50% at 16px | 8 | 35 | **37** |

**Forty-nine new draws moved the headline row backwards.** The crests came back hollow again —
24–47% contrast retained at 16px, the same band as before — and all ten ship icons are still under
the line. This is not variance to be re-rolled past. It is what the model does with this brief at
this setting, and 49 fresh draws is a large enough sample to stop calling it luck.

The set was re-normalised and re-derived after the re-rolls, in the order this repository's tools
require — `normalise_ground.py --provider gpt-image-2` over the delivered sources first, then
`--derive-only`, because a derivative must be cut from an already-normalised parent.
`verify.py --provider gpt-image-2 --as-shipped` reports **0 failures** with conformance and
completeness held fatal.

Three things follow, and only the first is about this repository.

1. **The verdict stands: do not promote.** Unchanged, for the reasons already given, now with the
   re-roll defence closed rather than left open.
2. **The candidate remains switchable and is committed.** The set passes its own gate as shipped and
   `promote.py --provider gpt-image-2` carries it out in one command, reversibly, the day somebody
   disagrees.
3. **The same model won the sibling brand repository on this exact criterion the same day** — 7
   marks under 50% at 16px against the reference's 11. Same model, same setting, same literal
   dialect, opposite result. What separates them is the brief: `micro-brand` asks for solid emblems;
   this repository asks for heraldry and vessels, where the model reaches for line work and a crest
   drawn in line work disappears at 16px. **That is a fact about our prompts, not about the model.**
   The filled-shape experiment remains the right one to run, and running it needs a `reprompt` path
   for candidates, which does not exist today.
