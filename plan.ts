/**
 * The work list, DERIVED from the game the estate actually ships.
 *
 * `docs/ecosystem/20-aetherholm.md` §4 planned the canonical content JSON to live in THIS
 * repository, driving both the engine and the art prompts. Phases 1–2 built the content in the
 * service instead — `aetherholm/src/content.ts` — and that inversion is final: two content
 * sources is the drift defect this estate keeps paying for (seven clients built against imagined
 * surfaces; a palette one hex stale would ship fifty portraits in a colour the game never
 * renders). So this module IMPORTS the service's content — the 20 building types
 * (`content.ts:23-44`), the 10 airship classes and their specs (`content.ts:240-251`, `:302-313`),
 * the 4 resources (`content.ts:17`) and the 3 altitude bands (`world.ts:30`) — and a plan that is
 * read cannot drift from the thing it was read from. The service is not modified.
 *
 * What is AUTHORED here is the art direction: what each building looks like, how a role reads on
 * a hull, what each icon draws, the four biomes (which no document or source names — doc §8
 * counts "3 bands × 4 biomes" and stops), and the heraldry tiers. All of it is written from
 * ART_BIBLE.md, which was written first.
 *
 * The counts are asserted against the doc's contract before anything is spent: 20 buildings,
 * 10 airships, 4 resources, 3 bands. A drift between the doc and the shipped content is a loud
 * failure here, not a quietly wrong art set.
 */

import {
  AIRSHIPS,
  AIRSHIP_CLASSES,
  BUILDING_TYPES,
  RESOURCES,
  type AirshipClass,
  type BuildingType,
} from '../aetherholm/src/content.ts'
import { BANDS } from '../aetherholm/src/world.ts'

/* ------------------------------------------------------------------ the contract asserted */

function assertContentContract(): void {
  const problems: string[] = []
  if (BUILDING_TYPES.length !== 20) problems.push(`expected 20 building types, content.ts ships ${BUILDING_TYPES.length}`)
  if (AIRSHIP_CLASSES.length !== 10) problems.push(`expected 10 airship classes, content.ts ships ${AIRSHIP_CLASSES.length}`)
  if (RESOURCES.length !== 4) problems.push(`expected 4 resources, content.ts ships ${RESOURCES.length}`)
  if ((BANDS as readonly string[]).length !== 3) problems.push(`expected 3 bands, world.ts ships ${BANDS.length}`)
  if (problems.length > 0) {
    throw new Error(`the shipped content has drifted from doc 20 §4:\n  ${problems.join('\n  ')}`)
  }
}
assertContentContract()

/* ------------------------------------------------------------------ the palette (ART_BIBLE.md §2) */

/** Chrome only: a title wears its product's colour, and Aetherholm's product is Forge Worlds. */
export const WORLDS_MOSS = '#6d9a49'

/**
 * The game palette. Every entry is a `name` a viewer would say out loud plus a `qualifier`
 * pinning the hue's direction round the wheel — the Emberkin rule, measured there: name the hue,
 * never an object, because an object drags the model to its photographic average.
 */
export interface ColourWord {
  readonly name: string
  readonly qualifier: string
}

export const PALETTE: Readonly<Record<string, string>> = Object.freeze({
  aether: '#8f7ae8',
  cloudstone: '#c9b891',
  skysteel: '#7fa3c0',
  provisions: '#8fbf4f',
  population: '#d08a5e',
  strain: '#e05252',
  aegis: '#7fd4e0',
  moss: WORLDS_MOSS,
  heraldicGold: '#d4af4a',
  rankGold: '#e8c34a',
  rankSilver: '#b0c0dc',
  rankBronze: '#c08552',
  rankIron: '#8fa3b8',
  fieldStorm: '#4a6ab8',
  fieldDawn: '#b83a3a',
  fieldCloud: '#cfc0a0',
  fieldNight: '#6a4a9e',
  timber: '#c9a06b',
})

const COLOUR_WORDS: Readonly<Record<string, ColourWord>> = {
  '#8f7ae8': { name: 'vivid lit violet', qualifier: 'clearly and obviously PURPLE at a glance, a glowing lavender-violet — never black, never navy, never grey' },
  '#c9b891': { name: 'warm pale stone gold', qualifier: 'a limestone cream leaning gold, never white and never grey' },
  '#7fa3c0': { name: 'cold steel blue-grey', qualifier: 'a muted blue, clearly blue rather than grey' },
  '#8fbf4f': { name: 'fresh spring green', qualifier: 'a bright yellow-leaning leaf green, never olive and never teal' },
  '#d08a5e': { name: 'warm terracotta', qualifier: 'a soft clay orange, never red and never brown' },
  '#e05252': { name: 'storm crimson', qualifier: 'a hot warning red, never orange and never pink' },
  '#7fd4e0': { name: 'pale glacial cyan', qualifier: 'clearly more green-blue than a plain sky blue' },
  '#6d9a49': { name: 'moss green', qualifier: 'a muted natural leaf green, deeper and greyer than a lime' },
  '#d4af4a': { name: 'old gold', qualifier: 'an antique brass gold, warm and metallic, never lemon yellow' },
  '#e8c34a': { name: 'bright gold', qualifier: 'a polished trophy gold' },
  '#b0c0dc': { name: 'blued silver', qualifier: 'a pale steel silver with a clear cool blue lean, never plain white or grey' },
  '#c08552': { name: 'bronze', qualifier: 'a warm coppery bronze, browner than gold' },
  '#8fa3b8': { name: 'iron blue-grey', qualifier: 'a dark bare-metal steel with a cool blue lean' },
  '#4a6ab8': { name: 'deep storm azure', qualifier: 'a saturated storm blue, darker than a sky blue' },
  '#b83a3a': { name: 'dawn red', qualifier: 'a deep banner red, never orange' },
  '#cfc0a0': { name: 'cloud cream', qualifier: 'a warm pale parchment cream leaning gold, never white' },
  '#6a4a9e': { name: 'night violet', qualifier: 'a deep royal purple, clearly purple and never black' },
  '#c9a06b': { name: 'warm lamplit timber', qualifier: 'a honeyed oak brown lit by lamplight' },
}

export function colourWordForHex(hex: string): ColourWord {
  return COLOUR_WORDS[hex] ?? { name: 'its anchor colour', qualifier: '' }
}

function colourPhrase(hex: string): string {
  const word = colourWordForHex(hex)
  return word.qualifier ? `${word.name} — ${word.qualifier} —` : word.name
}

/* ------------------------------------------------------------------ what a planned asset is */

export type GroundClass = 'flat' | 'scene'

export type SetName =
  | 'islands'
  | 'buildings'
  | 'ships'
  | 'shipicons'
  | 'icons'
  | 'heraldry'
  | 'keyart'
  | 'splashes'
  | 'title'

export interface PlannedAsset {
  readonly key: string
  readonly set: SetName
  readonly slug: string
  readonly name: string
  readonly width: number
  readonly height: number
  readonly ground: GroundClass
  /** The dominant colour, measured by verify.py where the set's floor is above zero. */
  readonly accent: string
  readonly secondaryAccent: string | null
  /** The ONLY string permitted in the image. Null on everything except the wordmark. */
  readonly lettering: string | null
  readonly subject: string
  readonly source: string
  readonly priority: number
}

/* ------------------------------------------------------------------ set 1: title chrome */

/**
 * The mark's one idea, written to sit inside the CloudsForge family: the ash-ridge ground line
 * every estate mark shares (`brand/plan.ts`), with the title's one accent element above it.
 */
const AETHERHOLM_MARK =
  'a floating island over the ash ridge: one island silhouette with a flat inhabited top and a ' +
  'rocky keel tapering to a point below, floating free with clear space under it, and beneath ' +
  'that gap the ash ridge — one flat baseline with a single shallow arc rising from its centre, ' +
  'like the face of an anvil seen from the front. Two elements only, the island and the ridge, ' +
  'and the island never touches the ridge.'

function titleAssets(): PlannedAsset[] {
  const common = {
    set: 'title' as const,
    accent: WORLDS_MOSS,
    secondaryAccent: null,
    source: 'docs/ecosystem/20-aetherholm.md §8; brand/README.md §5 (wide lettered cards are composited, never generated)',
  }
  return [
    {
      ...common,
      key: 'title/mark',
      slug: 'mark',
      name: 'Aetherholm',
      width: 1024,
      height: 1024,
      ground: 'flat' as const,
      lettering: null,
      priority: 1,
      subject:
        'The wordless brand mark for a video game called Aetherholm, drawn as one member of an ' +
        'existing family of software brand marks. Flat geometric vector: shapes built from ' +
        'circles, squares and 45-degree chamfers, one uniform stroke weight, generous negative ' +
        `space, optically centred, legible at 16 pixels. The one idea it is built around is ` +
        `${AETHERHOLM_MARK} No gradients, no bevels, no glow, no 3D, no photo-realism.`,
    },
    {
      ...common,
      key: 'title/wordmark',
      slug: 'wordmark',
      name: 'Aetherholm',
      width: 1024,
      height: 384,
      ground: 'flat' as const,
      lettering: 'Aetherholm',
      priority: 2,
      subject:
        'A horizontal wordmark lockup for a video game: the brand mark on the left, then a clear ' +
        'gap, then the name set as text in one clean geometric sans of medium weight with wide ' +
        'tracking, its baseline optically aligned to the centre of the mark. The lockup sits in ' +
        'the middle third of a wide NEAR-BLACK field: bright moss-green lettering on the dark ' +
        `ground, never dark lettering on a light one. The mark is ${AETHERHOLM_MARK} ` +
        'Flat geometric vector, one uniform stroke weight, no gradients and no 3D.',
    },
  ]
}

/* ------------------------------------------------------------------ set 2: islands */

/** Band light, ART_BIBLE.md §3. The bands themselves come from world.ts. */
const BAND_LIGHT: Readonly<Record<string, string>> = {
  shallows:
    'low in the luminous cloud-sea: thick cream-gold cloud banks lap the island\'s lower skirts, ' +
    'the light is hazy, warm and golden, and the air below fades into soft bright cloud',
  midreach:
    'in the clear air between cloud strata: long low horizontal warm light, crisp shadows, a ' +
    'thin bright cloud-sea far below and a dark violet cloud ceiling far above',
  highwind:
    'above the weather: thin cold violet-blue light, hard bright rim lighting along its top ' +
    'edges, thin banners of fast cloud streaming past it, and the storm depths dark far below',
}

/** The four biomes, AUTHORED in ART_BIBLE.md §3 — no document or source file names them. */
const BIOMES: Readonly<Record<string, string>> = {
  terrace:
    'stepped green farm terraces carved into every slope, low windbreak hedges between them, a ' +
    'few small lamplit farmhouses',
  crag:
    'bare fissured pale stone: quarry faces, scree slopes and split boulders, with almost no ' +
    'green anywhere on it',
  grove:
    'wind-bent trees clinging to its rock, their crowns all combed the same way by the wind, ' +
    'hanging moss and one sheltered hollow',
  reef:
    'fringed with violet aether-crystal outcrops growing from its rock like coral, a soft ' +
    'violet glow in its seams and under its edges',
}

const BIOME_ACCENT: Readonly<Record<string, string>> = {
  terrace: PALETTE['provisions']!,
  crag: PALETTE['cloudstone']!,
  grove: PALETTE['provisions']!,
  reef: PALETTE['aether']!,
}

function islandAssets(): PlannedAsset[] {
  const out: PlannedAsset[] = []
  let index = 0
  for (const band of BANDS) {
    for (const biome of Object.keys(BIOMES)) {
      out.push({
        key: `islands/${band}_${biome}`,
        set: 'islands',
        slug: `${band}_${biome}`,
        name: `${band} ${biome}`,
        width: 1024,
        height: 1024,
        ground: 'flat',
        accent: BIOME_ACCENT[biome]!,
        secondaryAccent: null,
        lettering: null,
        source: `aetherholm/src/world.ts:30 (bands); ART_BIBLE.md §3 (biomes, authored here)`,
        priority: 100 + index,
        subject:
          'A single floating sky island for a strategy game, seen in three-quarter view from ' +
          'slightly above: a flat inhabitable top and a rocky keel tapering away beneath it, ' +
          'floating entirely free with nothing below it. Its surface is ' +
          `${BIOMES[biome]}. Its altitude band is ${band}, so it is lit ${BAND_LIGHT[band]}. ` +
          'The island is warm and bright against the dark ground, its silhouette clean and ' +
          'readable at a small size. Any cloud or light it carries stays close around the ' +
          'island itself and fades out well before the edges of the frame.',
      })
      index += 1
    }
  }
  return out
}

/* ------------------------------------------------------------------ set 3: buildings */

/**
 * One line of art direction per building type. The LIST is the game's
 * (`content.ts:23-44`, pinned to 20 by `content.test.ts`); the look is ART_BIBLE.md §4.
 */
const BUILDING_LOOK: Readonly<Record<BuildingType, string>> = {
  skyhall:
    'the proud seat of the city: a broad three-tiered timber-and-stone hall with a lantern ' +
    'bell-tower rising from its centre and two long banners hanging from its eaves',
  well_rig:
    'a tall timber derrick straddling a round well shaft bored into the rock, brass pipework ' +
    'and a pressure wheel at its side, a soft violet glow rising out of the bore',
  cloudstone_quarry:
    'a stepped quarry cut into pale stone, a slewing timber crane lifting one cut block, ' +
    'dressed stone stacked at its foot',
  skysteel_forge:
    'a stout foundry hall with two tall chimneys and an open front, a crucible inside glowing ' +
    'cold steel-blue, ingots racked beside it',
  terrace_farm:
    'three stacked green growing terraces held up by stone retaining walls, water flumes ' +
    'zigzagging down between them, one small tool shed at the top',
  warehouse:
    'a fat-bellied storehouse with a barrel-vaulted roof, wide loading doors standing open and ' +
    'crates and barrels stacked on its apron',
  vault:
    'a squat windowless strongbox of a building: massive banded walls, one circular armoured ' +
    'door with radial bolts, chained cornerstones',
  residences:
    'a close cluster of four tall narrow row-houses with steep roofs, warm lamplight in their ' +
    'small windows, washing lines strung between them',
  aerodock:
    'an open docking platform cantilevered out on timber struts, with a tall mooring mast, a ' +
    'boarding gantry and coiled mooring lines',
  launch_rails:
    'a long inclined launch rail on heavy trestles, rising from right to left, with a winch ' +
    'house at its foot and guide-lanterns along its length',
  windworks:
    'a slender tower carrying three stacked horizontal sail-vane rotors of decreasing size, ' +
    'their canvas vanes all turned the same way',
  // REWORDED after five repeatable `content_safety_violation (BingBlockList_Prompt)` refusals
  // across three invocations. The original read "a domed college hall with an observatory
  // telescope emerging from a slot in its copper dome, a small walled forecourt with one tree";
  // which token tripped the blocklist is unknowable from the outside, so the sentence was
  // rebuilt from different words rather than argued with. The filter is otherwise measured as
  // non-deterministic (a verbatim re-issue cleared three other assets); five refusals is a fact,
  // not noise.
  // Third reword. The first two rewrites changed the building half of the sentence and were
  // refused identically; the one distinctive phrase all three refused versions shared was the
  // walled-courtyard-with-one-tree tail, so it goes too. Which of its words the blocklist
  // matches is unknowable from outside; the sentence is rebuilt without it.
  academy:
    'a stone hall of scholars with a steep slate roof and a spire-topped bell turret, tall ' +
    'arched windows glowing warm, wide front steps and a lamp post at its entrance',
  watchspire:
    'a very tall slender watchtower with an enclosed observation cab at its top, a signal ' +
    'lantern above that, and a spiral stair hugging its shaft',
  storm_anchor:
    'a massive iron lightning-anchor: a grounded pylon of riveted metal crowned with a forked ' +
    'catch-rod, heavy chains guying it to the rock',
  bulwark_ring:
    'a curved segment of fortified curtain wall with two squat bastion drums, crenellations ' +
    'along its top and one barred gate arch',
  trade_gantry:
    'a cantilevered trading gantry: a long horizontal jib swung out over the void, cargo nets ' +
    'and one crate hanging from its trolley, a counterweight at its heel',
  guild_beacon:
    'a brazier beacon tower: an open iron basket of bright flame on a stone tower, with one ' +
    'long guild pennant flying from a pole beside it',
  charthouse:
    'a chart hall with a huge compass rose inlaid on its forecourt, wind-vane instruments on ' +
    'its roof ridge and a bow window full of small panes',
  infirmary:
    'a clean long gabled hall with tall bright windows, a small covered porch, and one round ' +
    'lantern sign hanging over its door',
  hall_of_banners:
    'a long gallery hall with a clerestory roof, many banners of different shapes hanging from ' +
    'poles along its front eaves',
}

function buildingAssets(): PlannedAsset[] {
  return BUILDING_TYPES.map((type, index) => ({
    key: `buildings/${type}`,
    set: 'buildings' as const,
    slug: type,
    name: type.replace(/_/g, ' '),
    width: 512,
    height: 512,
    ground: 'flat' as const,
    accent: PALETTE['timber']!,
    secondaryAccent: null,
    lettering: null,
    source: `aetherholm/src/content.ts:23-44 (BUILDING_TYPES[${index}]); ART_BIBLE.md §4`,
    priority: 200 + index,
    subject:
      'A single building sprite for a sky-island strategy game, seen in three-quarter view from ' +
      `slightly above: ${BUILDING_LOOK[type]}. Built of warm lamplit timber, pale stone and ` +
      'brass, sitting on a small ragged plug of island rock that ends just under it. One ' +
      'building only, whole and centred, its silhouette readable at 64 pixels and clearly ' +
      'different from any other building in the set. Painterly but crisp, warm against the ' +
      'dark ground.',
  }))
}

/* ------------------------------------------------------------------ set 4: airships */

/**
 * Look per class, derived from the spec that BALANCES the class — role, hull weight and cargo
 * come from `content.ts:302-313`, and the freight/war split (only haulers carry cargo,
 * `content.ts:316-318`) is stated on the hull: freighters get holds and cranes, warships get
 * guns, and neither gets the other's fittings.
 */
const SHIP_LOOK: Readonly<Record<AirshipClass, string>> = {
  skiff:
    'a tiny one-man open scouting skiff: a single small gasbag over a slender open cockpit, a ' +
    'long spotting-glass mounted at its bow, no guns at all',
  cutter:
    'a small fast cutter: a narrow envelope over a light open-decked gondola, two small ' +
    'swivel guns, raked lines built for speed',
  corvette:
    'a light warship corvette: a sleek envelope over an enclosed gondola with a single short ' +
    'gun deck of three ports, modest armour at the bow',
  gunship:
    'a mid-weight gunship bristling along its broadside: a reinforced envelope, a deep gondola ' +
    'with five gun ports and armoured bulwarks',
  frigate:
    'a large frigate of the line: a long armoured envelope, a full-length gun deck, plated ' +
    'prow, signal flags on its rigging',
  ironclad:
    'a heavy ironclad: its envelope sheathed in riveted plates, a massive slab-sided gondola, ' +
    'guns in armoured casemates, slow and unstoppable in its bearing',
  breaker:
    'a siege breaker: a reinforced hull built around one enormous forward ram-mortar, its ' +
    'barrel longer than the gondola, heavy keel bracing and almost nothing else',
  hauler:
    'a working freight hauler: a broad-bellied envelope over a wide cargo hold with open side ' +
    'doors, a loading crane amidships, crates slung in nets, and no gun deck',
  grand_hauler:
    'a vast grand hauler: two linked envelopes over an enormous multi-door cargo hull, twin ' +
    'loading cranes, catwalks along its whole length, and no gun deck',
  // "long command banners" invited the model to WRITE on them — the first roll's streamers
  // carried invented misspelled words, the exact wide-composition failure brand §5 records.
  // The banners are now explicitly blank cloth.
  flagship:
    'a majestic flagship: a long gilded envelope, a stately three-deck gondola with gun ports ' +
    'and gallery windows at its stern, and long plain unmarked banner streamers of blank ' +
    'cloth flying from its masts',
}

/** A rough size word from the spec's hull, so the set reads at the right relative scales. */
function sizeWord(cls: AirshipClass): string {
  const hull = AIRSHIPS[cls].hull
  if (hull <= 20n) return 'very small'
  if (hull <= 40n) return 'small'
  if (hull <= 90n) return 'mid-sized'
  return 'very large'
}

function shipAssets(): PlannedAsset[] {
  return AIRSHIP_CLASSES.map((cls, index) => ({
    key: `ships/${cls}`,
    set: 'ships' as const,
    slug: cls,
    name: cls.replace(/_/g, ' '),
    width: 1024,
    height: 512,
    ground: 'flat' as const,
    accent: PALETTE['skysteel']!,
    secondaryAccent: null,
    lettering: null,
    source: `aetherholm/src/content.ts:240-251, :302-313 (AIRSHIPS.${cls}, role '${AIRSHIPS[cls].role}'); ART_BIBLE.md §4`,
    priority: 300 + index,
    subject:
      'A single airship in strict side profile facing left, whole and centred, for a sky-island ' +
      `strategy game: ${SHIP_LOOK[cls]}. It is a ${sizeWord(cls)} vessel of its fleet. One ` +
      'shared construction language across the whole fleet: a rigid lift envelope above, a ' +
      'timber-and-steel gondola slung below it, aether burners glowing gently at the stern. ' +
      'Painterly but crisp, warm lamplit detail against the dark ground, silhouette readable ' +
      'at 64 pixels. Exactly one airship, no crew visible, no background scenery.',
  }))
}

/** The class icons: same silhouette language, flat vector, product moss — they are UI. */
const SHIP_ICON_SHAPE: Readonly<Record<AirshipClass, string>> = {
  skiff: 'a tiny single-lobe envelope over an open sliver of hull, one thin spotting-glass line at the bow',
  cutter: 'a narrow envelope over a shallow open hull with two small gun stubs below',
  corvette: 'a sleek envelope over a closed hull with three gun-port dots in a row',
  gunship: 'a thick envelope over a deep hull with five gun-port dots in a row',
  frigate: 'a long envelope over a full-length hull with a continuous gun-slot line',
  ironclad: 'a plated envelope drawn with three rivet-seam lines over a massive slab hull',
  breaker: 'a hull with one oversized forward barrel projecting past its bow, longer than the hull itself',
  hauler: 'a broad-bellied envelope over a wide open-doored hold with one crane hook hanging amidships',
  grand_hauler: 'two linked envelopes over one very long multi-door hold',
  flagship: 'a long envelope over a three-tier hull with two banner streamers trailing aft',
}

function shipIconAssets(): PlannedAsset[] {
  return AIRSHIP_CLASSES.map((cls, index) => ({
    key: `shipicons/${cls}`,
    set: 'shipicons' as const,
    slug: cls,
    name: `${cls.replace(/_/g, ' ')} icon`,
    width: 256,
    height: 256,
    ground: 'flat' as const,
    accent: WORLDS_MOSS,
    secondaryAccent: null,
    lettering: null,
    source: `aetherholm/src/content.ts:240-251 (AIRSHIP_CLASSES[${index}]); ART_BIBLE.md §4`,
    priority: 350 + index,
    subject:
      `A single flat interface icon for the "${cls.replace(/_/g, ' ')}" airship class of a ` +
      `strategy game: the ship in side profile facing left, simplified to ${SHIP_ICON_SHAPE[cls]}. ` +
      'One flat geometric silhouette with a uniform stroke weight, centred with an even margin, ' +
      'filling most of the frame, legible at 20 pixels. An icon, not an illustration: no scene, ' +
      'no rigging detail, no background.',
  }))
}

/* ------------------------------------------------------------------ set 5: resource / UI / status icons */

/**
 * Sixteen icons. The four resource icons take their identity from `content.ts:17`; the rest are
 * the game's states and fixtures (strain and the communal well, doc §2; aegis, doc §4; spires,
 * doc §2; wind lanes, doc §2; the three queues, `content.ts:320-341`). Each is a topologically
 * different shape, so no pair relies on colour alone.
 */
interface IconSpec {
  readonly slug: string
  readonly name: string
  readonly accent: string
  readonly shape: string
  readonly source: string
}

const ICONS: readonly IconSpec[] = [
  { slug: 'resource-aether', name: 'Aether', accent: PALETTE['aether']!, source: 'aetherholm/src/content.ts:17', shape: 'one vertical teardrop of energy with two short flame tips, floating just above an open ring, not touching it' },
  { slug: 'resource-cloudstone', name: 'Cloudstone', accent: PALETTE['cloudstone']!, source: 'aetherholm/src/content.ts:17', shape: 'one faceted six-sided stone block with a single facet line across its face, resting on a small three-lobed cloud puff' },
  { slug: 'resource-skysteel', name: 'Skysteel', accent: PALETTE['skysteel']!, source: 'aetherholm/src/content.ts:17', shape: 'one metal ingot seen slightly from above, a chevron notch stamped into its top face and two rivet dots beside it' },
  { slug: 'resource-provisions', name: 'Provisions', accent: PALETTE['provisions']!, source: 'aetherholm/src/content.ts:17', shape: 'one bound wheat sheaf of three stalks, tied at the waist by a single band, the heads fanned apart' },
  { slug: 'status-population', name: 'Population', accent: PALETTE['population']!, source: 'docs/ecosystem/20-aetherholm.md §1 (4 + population)', shape: 'one round head over one wide shoulder arc, a bust reduced to two shapes with a clear gap between them' },
  { slug: 'status-strain', name: 'Well strain', accent: PALETTE['strain']!, source: 'docs/ecosystem/20-aetherholm.md §2; aetherholm well strain', shape: 'one thick ring split by a single jagged lightning-shaped crack running through it top to bottom, the two halves slightly offset' },
  { slug: 'status-aegis', name: 'Aegis', accent: PALETTE['aegis']!, source: 'aetherholm/src/content.ts:344 (AEGIS_DAYS); doc §4', shape: 'one heater shield outline with a single horizontal wave band across its middle and nothing else inside it' },
  { slug: 'status-spire', name: 'Aether spire', accent: PALETTE['aether']!, source: 'docs/ecosystem/20-aetherholm.md §2 (Aether Spires)', shape: 'one tall tapering spire of three stacked segments with a small four-pointed star floating just above its tip' },
  { slug: 'ui-wind-lane', name: 'Wind lane', accent: WORLDS_MOSS, source: 'docs/ecosystem/20-aetherholm.md §2 (the wind lattice)', shape: 'three long horizontal wind streaks, each ending in an arrowhead pointing right, the middle streak longest' },
  { slug: 'ui-lane-junction', name: 'Lane junction', accent: WORLDS_MOSS, source: 'docs/ecosystem/20-aetherholm.md §2 (lane junctions)', shape: 'three arrowed strokes converging from different directions onto one solid central node dot' },
  { slug: 'ui-queue-build', name: 'Build queue', accent: WORLDS_MOSS, source: 'aetherholm/src/content.ts:340 (BASE_BUILD_SLOTS)', shape: 'three offset rectangular blocks laid as a brick course, with one short upward arrow rising from the top block' },
  { slug: 'ui-queue-research', name: 'Research queue', accent: WORLDS_MOSS, source: 'aetherholm/src/content.ts:341 (BASE_RESEARCH_SLOTS)', shape: 'one partly unrolled scroll: a rolled cylinder at the top, a flat sheet hanging from it, one loose curl at the bottom corner' },
  { slug: 'ui-queue-shipyard', name: 'Shipyard queue', accent: WORLDS_MOSS, source: 'aetherholm/src/content.ts:321 (BASE_SHIP_SLOTS)', shape: 'one hull arc resting in an open V-shaped cradle, the cradle\'s two arms not touching the hull\'s ends' },
  { slug: 'ui-fleet', name: 'Fleet', accent: WORLDS_MOSS, source: 'aetherholm/src/fleets.ts (fleets)', shape: 'three small solid delta shapes flying in echelon, the leader largest, each offset behind and below the one before' },
  { slug: 'ui-battle', name: 'Battle report', accent: WORLDS_MOSS, source: 'aetherholm/src/battles.ts (battle digests)', shape: 'two straight blades crossed in an X, each with a short crossguard bar, points upward' },
  { slug: 'ui-chronicle', name: 'Chronicle', accent: WORLDS_MOSS, source: 'docs/ecosystem/20-aetherholm.md §2 (seasons seal); aetherholm/src/sealing.ts', shape: 'one closed book, spine to the left, a ribbon bookmark hanging from its pages and a small circular seal disc on its cover' },
]

function iconAssets(): PlannedAsset[] {
  return ICONS.map((icon, index) => ({
    key: `icons/${icon.slug}`,
    set: 'icons' as const,
    slug: icon.slug,
    name: icon.name,
    width: 512,
    height: 512,
    ground: 'flat' as const,
    accent: icon.accent,
    secondaryAccent: null,
    lettering: null,
    source: `${icon.source}; ART_BIBLE.md §5`,
    priority: 400 + index,
    subject:
      `A single flat interface icon for "${icon.name}" in a sky-island strategy game. It is ` +
      `${icon.shape}. Drawn as one flat geometric shape with a uniform stroke weight, centred ` +
      'in the square with an even margin, filling most of the frame, and legible at 24 pixels. ' +
      'This is an icon, not an illustration: no scene, no background, no detail that dies when ' +
      'it is shrunk.',
  }))
}

/* ------------------------------------------------------------------ set 6: heraldry */

/**
 * Sixteen components in three kinds of part. These become the sealed-season banners `worlds`
 * mints as `cf:aetherholm:heraldry:<seasonId>:rank:<n>` (`worlds/src/heraldry.ts:81`), whose
 * header states "first place and fifth place are different artwork, decided by the asset
 * pipeline later" (`worlds/src/heraldry.ts:24-26`). The rank distinction is carried by the four
 * CRESTS: metal, silhouette complexity and coverage step down together — gold laurel crown,
 * blued-silver open wreath, bronze single plume, plain iron pennon bar — so the tiers read even
 * in monochrome. A rank-n banner composes field + charge + the crest of its tier.
 */
interface HeraldrySpec {
  readonly slug: string
  readonly name: string
  readonly accent: string
  readonly shape: string
}

const HERALDRY: readonly HeraldrySpec[] = [
  { slug: 'field-storm', name: 'Storm field', accent: PALETTE['fieldStorm']!, shape: `a vertical banner with a swallowtail bottom edge, its whole surface filled with a repeating diagonal pattern of stylised cloud scrolls, all in ${colourPhrase(PALETTE['fieldStorm']!)} ${PALETTE['fieldStorm']}` },
  { slug: 'field-dawn', name: 'Dawn field', accent: PALETTE['fieldDawn']!, shape: `a vertical banner with a swallowtail bottom edge, its surface filled with straight rays fanning up and out from its bottom point, all in ${colourPhrase(PALETTE['fieldDawn']!)} ${PALETTE['fieldDawn']}` },
  { slug: 'field-cloud', name: 'Cloud field', accent: PALETTE['fieldCloud']!, shape: `a vertical banner with a swallowtail bottom edge, its surface filled with horizontal wavy bars of even weight, all in ${colourPhrase(PALETTE['fieldCloud']!)} ${PALETTE['fieldCloud']}` },
  { slug: 'field-night', name: 'Night field', accent: PALETTE['fieldNight']!, shape: `a vertical banner with a swallowtail bottom edge, its surface scattered with small four-pointed stars in even rows, all in ${colourPhrase(PALETTE['fieldNight']!)} ${PALETTE['fieldNight']}` },
  { slug: 'charge-spire', name: 'Spire charge', accent: PALETTE['heraldicGold']!, shape: 'a single heraldic spire: a tall tapering three-segment tower with a star at its tip' },
  { slug: 'charge-airship', name: 'Airship charge', accent: PALETTE['heraldicGold']!, shape: 'a single heraldic airship in side profile: one envelope over one hull, simplified to flat heraldic form' },
  { slug: 'charge-well', name: 'Well charge', accent: PALETTE['heraldicGold']!, shape: 'a single heraldic well: an open ring over three rising teardrops arranged in a fan' },
  { slug: 'charge-anchor', name: 'Storm anchor charge', accent: PALETTE['heraldicGold']!, shape: 'a single heraldic storm anchor: a forked catch-rod over a crossbar with two chain links hanging from it' },
  { slug: 'charge-bolt', name: 'Thunderbolt charge', accent: PALETTE['heraldicGold']!, shape: 'a single heraldic thunderbolt: one broad zigzag bolt with a diamond head' },
  { slug: 'charge-gale', name: 'Gale charge', accent: PALETTE['heraldicGold']!, shape: 'a single heraldic gale: three nested open chevrons pointing right, the middle one longest' },
  { slug: 'charge-star', name: 'Aether star charge', accent: PALETTE['heraldicGold']!, shape: 'a single heraldic aether star: one eight-pointed star with alternating long and short points around an open centre' },
  { slug: 'charge-tower', name: 'Watchtower charge', accent: PALETTE['heraldicGold']!, shape: 'a single heraldic watchtower: a crenellated tower with one arched door and a small flame above its top' },
  { slug: 'crest-rank1', name: 'Rank 1 crest', accent: PALETTE['rankGold']!, shape: `a champion's crest: a full closed laurel wreath crowned at its top centre by a small spire, rich and ornate, all in ${colourPhrase(PALETTE['rankGold']!)} ${PALETTE['rankGold']}` },
  { slug: 'crest-rank2', name: 'Rank 2 crest', accent: PALETTE['rankSilver']!, shape: `a second-place crest: an open wreath of stylised storm clouds, its two ends not meeting at the top, plainly simpler than a full crown, all in ${colourPhrase(PALETTE['rankSilver']!)} ${PALETTE['rankSilver']}` },
  { slug: 'crest-rank3', name: 'Rank 3 crest', accent: PALETTE['rankBronze']!, shape: `a third-place crest: one single curved plume rising from a thin plain circlet band, all in ${colourPhrase(PALETTE['rankBronze']!)} ${PALETTE['rankBronze']}` },
  { slug: 'crest-rank4', name: 'Rank 4 and below crest', accent: PALETTE['rankIron']!, shape: `a plain rank bar: one short straight horizontal pennon bar with two small squared tails, unadorned, all in ${colourPhrase(PALETTE['rankIron']!)} ${PALETTE['rankIron']}` },
]

function heraldryAssets(): PlannedAsset[] {
  return HERALDRY.map((item, index) => ({
    key: `heraldry/${item.slug}`,
    set: 'heraldry' as const,
    slug: item.slug,
    name: item.name,
    width: 512,
    height: 512,
    ground: 'flat' as const,
    accent: item.accent,
    secondaryAccent: null,
    lettering: null,
    source: 'worlds/src/heraldry.ts:24-26, :81 (ranked banner URNs); docs/ecosystem/20-aetherholm.md §7 (heraldry studio); ART_BIBLE.md §6',
    priority: 500 + index,
    subject:
      `A single flat heraldic banner component for a strategy game: ${item.shape}. Drawn in ` +
      'flat heraldic style: bold simple shapes, one uniform stroke weight, no gradients, no ' +
      'shading, no 3D, centred with an even margin, legible at 32 pixels. It is one component ' +
      'of a composable banner system, so it is exactly one element on the dark ground with no ' +
      'banner, shield or frame behind it' +
      (item.slug.startsWith('field-') ? ' apart from the banner shape it itself is' : '') +
      '.',
  }))
}

/* ------------------------------------------------------------------ set 7: key art */

function keyartAssets(): PlannedAsset[] {
  const common = {
    set: 'keyart' as const,
    accent: PALETTE['aether']!,
    secondaryAccent: null,
    lettering: null,
    ground: 'scene' as const,
    source: 'docs/ecosystem/20-aetherholm.md §8; ART_BIBLE.md §7; brand/README.md §5 (no text on wide scenes)',
  }
  return [
    {
      ...common,
      key: 'keyart/hero',
      slug: 'hero',
      name: 'Hero',
      width: 1920,
      height: 768,
      priority: 10,
      subject:
        'A panoramic hero painting for a sky-island strategy game, with nothing written on it. ' +
        'A luminous stratified cloud-sea at dusk: warm-lit terraced sky islands in the lower ' +
        'left foreground with small airships moored at their docks, streams of wind-lane light ' +
        'curving between distant islands, and one far spire island glowing faint violet on the ' +
        'horizon. Below everything, the cloud depths darken to storm indigo; above, thin cold ' +
        'violet strata. The upper right third is open dark sky, left deliberately empty for ' +
        'overlaid text.',
    },
    {
      ...common,
      key: 'keyart/og-source',
      slug: 'og-source',
      name: 'OG backdrop',
      width: 1200,
      height: 640,
      priority: 11,
      subject:
        'A wide backdrop painting for a link-preview card, with nothing written on it. One ' +
        'warm-lit floating island city fills the left third: stacked terraces, lamplit ' +
        'buildings, two small airships moored at a dock arm, warm gold light against the dark. ' +
        'The right two thirds are a deep, near-black violet dusk with only the faintest ' +
        'cloud strata, kept almost completely empty and dark, because a title will be set ' +
        'there later. Nothing bright anywhere near the outer edges.',
    },
    {
      ...common,
      key: 'keyart/social-backdrop',
      slug: 'social-backdrop',
      name: 'Social backdrop',
      width: 1280,
      height: 640,
      priority: 12,
      subject:
        'A wide backdrop painting for a repository banner, with nothing written on it. A small ' +
        'warm-lit floating island with one moored airship sits low in the left quarter, and ' +
        'everything else is a deep near-black stratified dusk: faint cloud layers, one thin ' +
        'warm light seam between strata, generous empty dark space through the middle and ' +
        'right where a title will be set later. Nothing bright near the edges.',
    },
    {
      ...common,
      key: 'keyart/wordmark-backdrop',
      slug: 'wordmark-backdrop',
      name: 'Wordmark backdrop',
      width: 1536,
      height: 512,
      priority: 13,
      subject:
        'A very dark, very wide cloudscape band for sitting behind a title, with nothing ' +
        'written on it. Horizontal strata of near-black cloud with one restrained warm light ' +
        'seam running low across the frame, two tiny distant island silhouettes in the lower ' +
        'third, and the upper half almost pure darkness. Quiet, atmospheric, nothing sharp and ' +
        'nothing bright: the artwork must never compete with text placed over it.',
    },
  ]
}

/* ------------------------------------------------------------------ set 8: splashes */

interface SplashSpec {
  readonly slug: string
  readonly name: string
  readonly subject: string
  readonly source: string
}

const SPLASHES: readonly SplashSpec[] = [
  {
    slug: 'season-dawn',
    name: 'Season dawn',
    source: 'docs/ecosystem/20-aetherholm.md §2 (a new season is a new seed)',
    subject:
      'A fresh archipelago revealed at first light: dozens of untouched floating islands ' +
      'emerging from bright morning cloud, a handful of founding airships fanning out towards ' +
      'them from the foreground, everything hopeful, golden and new.',
  },
  {
    slug: 'season-seal',
    name: 'Season seal',
    source: 'docs/ecosystem/20-aetherholm.md §2 (seasons seal); aetherholm/src/sealing.ts',
    subject:
      'The moment a season seals into history: the whole archipelago caught mid-freeze, islands ' +
      'and airships turning to translucent amber glass from the edges of the frame inward, ' +
      'motion stopped, light crystallising along the wind lanes, solemn and final.',
  },
  {
    slug: 'storm-surge',
    name: 'Storm surge',
    source: 'docs/ecosystem/20-aetherholm.md §2 (strain past threshold spawns storms)',
    subject:
      'An overdrawn aether well punishing its island: a towering storm wall lit from inside ' +
      'with crimson lightning wrapping around one island, its well rig glowing angry red, ' +
      'fleets grounded and lashed down on the docks, crews running for shelter.',
  },
  {
    slug: 'spire-war',
    name: 'Spire war',
    source: 'docs/ecosystem/20-aetherholm.md §2 (hold the Aether Spires)',
    subject:
      'Two fleets contesting a violet-glowing aether spire island in the high cold: warships ' +
      'exchanging broadsides across a wind lane, muzzle flashes against thin blue air, the ' +
      'spire rising serene and indifferent between them.',
  },
  {
    slug: 'trade-flotilla',
    name: 'Trade flotilla',
    source: 'docs/ecosystem/20-aetherholm.md §3 (trade along the lanes)',
    subject:
      'A convoy of broad-bellied freight haulers riding a wind lane at golden hour, strung out ' +
      'in a long line between islands, escort cutters above them, the lane\'s current visible ' +
      'as a warm ribbon of moving air.',
  },
  {
    slug: 'private-skerry',
    name: 'Private skerry',
    source: 'docs/ecosystem/20-aetherholm.md §6 (provision creates a Private Skerry)',
    subject:
      'A small private archipelago at lantern-lit evening: five modest islands in a quiet ring, ' +
      'one shared well glowing gently at their centre, footbridge-scale airships between them, ' +
      'intimate and calm, far from any war.',
  },
]

function splashAssets(): PlannedAsset[] {
  return SPLASHES.map((splash, index) => ({
    key: `splashes/${splash.slug}`,
    set: 'splashes' as const,
    slug: splash.slug,
    name: splash.name,
    width: 1536,
    height: 640,
    ground: 'scene' as const,
    accent: PALETTE['aether']!,
    secondaryAccent: null,
    lettering: null,
    source: `${splash.source}; ART_BIBLE.md §7`,
    priority: 20 + index,
    subject:
      `A wide season-event splash painting for a sky-island strategy game, with nothing written ` +
      `on it. ${splash.subject} Painted as one establishing shot with clear foreground, midground ` +
      'and far distance, at least two cloud strata visible, deep atmospheric perspective and ' +
      'volumetric light. No user interface, no map, no icons.',
  }))
}

/* ------------------------------------------------------------------ the whole plan */

/**
 * Everything, in generation order. The order is a property of the plan so a run cut short by
 * quota or a ceiling leaves a coherent set: chrome first (the client is waiting on exactly those
 * files), then the scenes, then each play set whole.
 */
export function plannedAssets(): readonly PlannedAsset[] {
  return [
    ...titleAssets(),
    ...keyartAssets(),
    ...splashAssets(),
    ...islandAssets(),
    ...buildingAssets(),
    ...shipAssets(),
    ...shipIconAssets(),
    ...iconAssets(),
    ...heraldryAssets(),
  ].sort((a, b) => a.priority - b.priority)
}
