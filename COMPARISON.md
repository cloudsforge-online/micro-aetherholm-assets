# How the models are judged — Aetherholm

The criteria are estate-wide and are stated in full in **`micro-brand/COMPARISON.md`**. This file
records what is specific to this set, and the baseline numbers a challenger is measured against.

Written **before** a challenger set exists, which is the only time criteria can be written
honestly. Once the images are on screen it is very easy to discover that the thing the winner
happens to be good at was the thing that mattered all along.

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

5. **Nothing here counts providers.** The comparison was briefed three-way, is two-way because
   Cosmos 3 Super failed to deploy, and will be three-way again — the estate has a stated 3D and
   animation gap FLUX cannot fill (`docs/ecosystem/19-new-products.md:97`).
