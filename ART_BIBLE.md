# The Aetherholm art bible

The direction for every image in this repository, written **before** anything was generated, and
the document `plan.ts` renders into prompts. `docs/ecosystem/20-aetherholm.md` §8 gives the four
pillars in eleven words — *luminous stratified cloud-sea, warm-lit isles against storm depths,
painterly key art, readable flat sprites for play* — and this file is those eleven words made
specific enough to draw a hundred images that read as one game.

What is **content** here comes from the game the estate actually ships: the 20 building types
(`aetherholm/src/content.ts:23-44`), the 10 airship classes and their roles
(`aetherholm/src/content.ts:240-251`, spec table `:302-313`), the 4 resources
(`content.ts:17`) and the 3 altitude bands (`aetherholm/src/world.ts:30`). What is **art
direction** is authored in this file and nowhere else — including the four biomes, which no
document or source file names (doc §8 says "3 bands × 4 biomes" and stops), so they are named
here and this file is their source of truth.

---

## 1. The four pillars

1. **A luminous stratified cloud-sea.** The world is layers: a bright cream-gold sea of cloud
   below, clear air in the middle, cold violet storm-dark above and beneath everything. Every
   scene shows at least two strata. Light comes from *between* the layers — low, warm, raking —
   never from a flat overhead sun.
2. **Warm-lit isles against storm depths.** An island is always the brightest thing in its frame:
   warm stone, lit terraces, lamplit rigging, against air that falls away into deep indigo-black.
   The contrast of inhabited warmth against uninhabitable depth *is* the game's premise (the
   resources genuinely run out; the sky does not care) and every composition restates it.
3. **Painterly key art.** Scenes are painted: visible brushwork, volumetric light, deep
   atmospheric perspective. Never photoreal, never lens artefacts, never 3D renders.
4. **Readable flat sprites for play.** Everything a player reads in the UI — islands, buildings,
   ships, icons, heraldry — is a single subject on the estate's one flat ground `#12100f`, with a
   clean silhouette that survives being shrunk. A sprite that needs a caption has failed.

## 2. The palette

The ground is the estate's warm ash near-black, `#12100f`, on every flat asset, exactly —
snapped numerically by `normalise_ground.py` and verified with zero tolerance, as the Emberkin
and brand runs settled.

**Chrome wears the product's colour; game art does not.** The title chrome (mark, wordmark,
favicons) is drawn in Forge Worlds' moss accent `#6d9a49`, because a title wears its product's
colour — the Emberkin precedent, `docs/ecosystem/20-aetherholm.md` §8. Everything the *player*
reads in play follows this table instead:

| Anchor | Hex | Named for prompts as | Carries |
| --- | --- | --- | --- |
| Aether | `#8f7ae8` | vivid lit violet — clearly purple, never black or navy | the aether icon, wells, spire glow, reef biome |
| Cloudstone | `#c9b891` | warm pale stone gold, a limestone cream | the cloudstone icon, quarry rock, island stone |
| Skysteel | `#7fa3c0` | cold steel blue-grey | the skysteel icon, hull armour, forge metal |
| Provisions | `#8fbf4f` | fresh spring green, yellow-leaning | the provisions icon, terraces, farmland |
| Population | `#d08a5e` | warm terracotta | the residences/population icon |
| Strain | `#e05252` | storm crimson | the strain icon, storm warnings |
| Aegis | `#7fd4e0` | pale glacial cyan | the aegis shield icon |
| UI moss | `#6d9a49` | moss green | the eight state/navigation icons, ship class icons, title chrome |
| Heraldic gold | `#d4af4a` | old gold, an antique brass gold | all eight heraldry charges, the rank-1 crest at `#e8c34a` |
| Timber & brass | `#c9a06b` | warm lamplit timber | the working material of buildings and hulls (recorded, not gated) |

The colour-word rule is Emberkin's, measured there at real cost: **name the hue and its direction
round the wheel, never an object** — an object drags the model to the object's photographic
average. The phrases above are written to survive being shouted, quoted and repeated by the
accent clause.

## 3. The three bands and the four biomes

Bands are content (`world.ts:30`); their light is direction:

- **Shallows** — low in the cloud-sea: thick cream-gold cloud banks lapping the island's skirts,
  hazy warm light, the safest and softest band.
- **Midreach** — clear air between strata: long horizontal light, crisp shadows, distant isles
  visible in rows, working weather.
- **Highwind** — above the weather: thin cold violet-blue light, hard rim lighting, streaming
  cloud banners, storm depths visibly far below. Richest Aether, harshest exposure.

The four biomes are **authored here** (no source names them; see the header):

- **Terrace** — stepped green farmland carved into the island's slopes, windbreak hedges, lit
  farmhouses.
- **Crag** — bare fissured cloudstone rock, quarry faces, scree, almost no green.
- **Grove** — wind-bent trees clinging to the rock, hanging moss, sheltered hollows.
- **Reef** — aether-crystal outcrops fringing the island like coral, violet glow in the seams.

Twelve archetypes: every band × every biome, each a whole floating island in three-quarter view,
underside tapering to a rootless keel of rock, on the flat ground.

## 4. Sprites for play

- **One subject, whole, centred, even margin.** Nothing cropped by the frame.
- **Islands** (1024²): the island floats free — no sea, no land below, no pedestal. Its band is
  its light; its biome is its surface.
- **Buildings** (512²): one structure per sprite, consistent three-quarter view from slightly
  above, warm lamplit timber-brass-and-stone construction, silhouette first. The 20 types are
  the game's exact list and each sprite must be tellable from the other nineteen at 64 pixels.
- **Airship profiles** (1024×512): strict side profile facing left, full ship in frame. One
  shared construction language: rigid gasbag or lift-hull above, timber-and-skysteel gondola
  below, aether burners aft. Role is read at a glance: **scouts** are small and open, **war**
  hulls carry guns and armour plating scaled with their class, the **siege** Breaker carries one
  oversized ram-mortar, **freight** hulls are broad-bellied with cargo cranes and almost no
  guns — the freight/war split is the game's own rule (`content.ts:259-260`, only haulers carry
  cargo) and the art must state it.
- **Airship icons** (256²): flat geometric vector silhouette of the same profile, moss
  `#6d9a49`, legible at 20 pixels, topologically distinct per class.

## 5. Icons

Flat geometric vector, one accent from §2's table per icon, one uniform stroke weight, no
gradients, legible at 24 pixels — the estate's icon discipline. Sixteen: the four resources,
population, strain, aegis, spire, wind lane, lane junction, the three queue states (build,
research, shipyard), fleet, battle report, chronicle. Each is a topologically different shape,
so no pair relies on colour alone.

## 6. Heraldry

Sixteen components in three ranks of parts, drawn as flat heraldic vector on the ground:

- **4 fields** — the banner's background pattern (storm azure per-bend clouds, dawn gules rayed,
  cloud argent barry-wavy, night violet mullety of stars).
- **8 charges** — the central emblem, all in heraldic gold `#d4af4a`: spire, airship, well,
  storm anchor, thunderbolt, gale chevrons, aether star, watchtower.
- **4 rank crests** — the piece that says *where you placed*, because
  `worlds/src/heraldry.ts:24-26` mints one URN per rank
  (`cf:aetherholm:heraldry:<seasonId>:rank:<n>`) and states "first place and fifth place are
  different artwork, decided by the asset pipeline". The distinction is a metal-and-form tier,
  the way physical honours do it:
  - **rank 1** — a full laurel-and-spire crown in bright gold `#e8c34a`;
  - **rank 2** — a storm-cloud wreath, open at the top, in blued silver `#b0c0dc`;
  - **rank 3** — a single gale plume on a circlet, in bronze `#c08552`;
  - **rank 4 and below** — a plain iron pennon bar, in skysteel `#8fa3b8`.

  A season banner for rank *n* composes field + charge + the crest of its tier; metal, silhouette
  complexity and coverage all step down together, so the ranks read even in monochrome.

## 7. Scenes

Key art and splashes are `scene`, not `flat`: they are paintings, edge to edge, never snapped to
a hex, held instead to the dark-edge ceiling `verify.py` measures. Composition rules:

- at least two cloud strata visible; the light source sits low, between layers;
- islands warm, depths cold; nothing pale reaches the frame's edges;
- **no text is ever generated on a wide scene.** The brand run measured this: FLUX misspells
  text on wide compositions ("Sftware Company") while being reliable on wordmarks
  (`brand/README.md` §5). So the wordmark is generated as a wordmark, and every wide lettered
  card (og, social) is **composited** from the generated wordmark onto a generated textless
  backdrop by `derive.py`. No exceptions.

## 8. What is chrome and what is game

Chrome (moss, product-coloured): mark, wordmark, favicon 512/192/32, the composited og and
social cards. These are what `micro-aetherholm-web` adopts — its `public/` today ships the web
template's generic favicons and og and records that the real chrome lands with this repository
(`aetherholm-web/README.md` "Brand chrome, honestly"), so the favicon and og sizes here match
that directory exactly: 512, 192, 32, and 1200×630.

Game art (bible-coloured): everything else. A title's art is its own, as Emberkin's is.
