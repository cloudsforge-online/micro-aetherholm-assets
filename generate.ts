/**
 * The Aetherholm generation run. Drives `@cloudsforge/studio`'s own FLUX 2 Pro engine and records
 * the provenance the service's `generation_jobs` and `assets` tables record.
 *
 * ## What is reused, and what deliberately is not
 *
 * **Reused verbatim, by import:** `studio/src/backend.ts` (the endpoint contract — `model`
 * required in the body, the dotted spelling, `aspect_ratio` accepted and ignored, dimensions
 * floored to a multiple of 16, `output_format:png` required, C2PA read from the bytes),
 * `specs.ts` (the round-up arithmetic), `sizing.ts` (measure, never relabel) and the licence
 * constant from `assets.ts`. Every one of those facts cost a real request to learn and is under
 * test in the service; a second copy here would be a second place for it to rot. `studio/` is
 * not modified.
 *
 * **Not reused:** `studio/src/prompt.ts`. Its art direction is "flat geometric vector, one
 * accent, no gradients" — right for a software brand mark, right for this repository's icons,
 * and wrong for a painterly island or a hull. This is the same call `micro-emberkin-assets`
 * made and for the same reason; the parts of the brand voice that DO apply — the ground clause,
 * the dark tail, the lettering clause, the accent discipline on chrome — are carried across
 * explicitly below, each marked with the defect it answers.
 *
 * This run follows the **Emberkin arrangement** rather than the brand one because the shape of
 * the problem is Emberkin's: the specification is game content read from a sibling checkout
 * (there, four JSON files; here, `aetherholm/src/content.ts` itself), the set mixes painterly
 * sprites, flat icons and scenes under one art bible, and the work list is derived rather than
 * copied. What the brand run contributes is its measured conclusions, imported as rules: FLUX
 * misspells text on wide compositions and is reliable on wordmarks (`brand/README.md` §5), so
 * the only generated lettering in this whole set is the wordmark, and every wide lettered card
 * is composited by `derive.py`.
 *
 * ## Usage
 *
 *   cd ../studio && node --import tsx ../aetherholm-assets/generate.ts --plan   # PLAN.json only
 *   cd ../studio && node --import tsx ../aetherholm-assets/generate.ts         # everything missing
 *   cd ../studio && node --import tsx ../aetherholm-assets/generate.ts --only icons/resource-aether
 *   cd ../studio && node --import tsx ../aetherholm-assets/generate.ts --force --only title/wordmark
 *   cd ../studio && node --import tsx ../aetherholm-assets/generate.ts --limit 10
 *   cd ../studio && node --import tsx ../aetherholm-assets/generate.ts --derive-only
 *
 * It runs from `studio/` so `tsx` resolves out of that workspace. **The Foundry key is read from
 * `../studio/.env.local`, held in one variable, and never written, logged or echoed** — not on
 * success, not in an error, not in a summary line. It is a spend credential.
 */

import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join } from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

import { ImageBackendError, type Attempt } from '../studio/src/backend.ts'
import { requestSizeFor, specFor, type AssetKind, type AssetSpec } from '../studio/src/specs.ts'
import { reportSizing, type Dimensions } from '../studio/src/sizing.ts'
import { GENERATED_LICENCE } from '../studio/src/assets.ts'

import {
  backendFor,
  measureC2pa,
  UnimplementedBackendError,
  type GenerationRequest,
  type ProviderBackend,
} from './backends.ts'
import { REFERENCE, providerById, assetsDirOf, manifestPathOf, type Provider } from './providers.ts'
import { identityFor, promptForProvider } from './replay.ts'
import { plannedAssets, colourWordForHex, PALETTE, type PlannedAsset } from './plan.ts'

const run = promisify(execFile)

const HERE = import.meta.dirname
const PLAN_JSON = join(HERE, 'PLAN.json')
const ENV_FILE = join(HERE, '..', 'studio', '.env.local')

/* ------------------------------------------------------------------ configuration */

/** Read `studio/.env.local` without printing any of it. Copied from the sibling runs. */
async function loadEnvFile(path: string): Promise<void> {
  const text = await readFile(path, 'utf8')
  for (const line of text.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq <= 0) continue
    const key = trimmed.slice(0, eq).trim()
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
    if (!(key in process.env)) process.env[key] = value
  }
}

/* ------------------------------------------------------------------ the prompt */

/** The one ground colour the whole estate sits on. design-system.md §7, verbatim. */
const BRAND_GROUND = '#12100f'

/**
 * The painterly sprite style, for islands, buildings and airship profiles. ART_BIBLE.md §1
 * pillars 2 and 4 rendered as a prompt: warm-lit subject on the storm-dark ground, readable
 * flat sprite for play. Identical across all 42 sprites — that sameness is what makes them read
 * as one game's art.
 */
const SPRITE_STYLE =
  `Game sprite concept art ON A FLAT NEAR-BLACK BACKGROUND, hex ${BRAND_GROUND}, for a ` +
  'sky-island strategy game, drawn as one member of an existing family of sprite designs. ' +
  'Stylised painterly rendering: soft broad gradient ramps rather than photo-real grime, crisp ' +
  'readable edges, and a clean warm key light from the upper left so the subject glows warm ' +
  'against that dark ground. Appealing and readable at a glance. It is not photo-real, not a ' +
  'photograph, not a 3D render, not a miniature model, not a diorama and not a sticker.'

/** Flat chrome and icons: the estate's icon discipline, as `studio/src/prompt.ts` states it. */
const ICON_STYLE =
  'A single piece of user-interface artwork for a video game, drawn as one member of an ' +
  'existing family of icons. Flat geometric vector: every shape constructed from circles, ' +
  'squares and 45-degree chamfers on one grid, one uniform stroke weight throughout, sharp ' +
  'corners left sharp, generous negative space, optically centred, and legible when it is ' +
  'shrunk to 24 pixels. Flat fills only: no gradients, no photographic texture, no bevels, no ' +
  'drop shadows, no glow, no 3D, no photo-realism, no weathering.'

/**
 * The scene style, carrying the guard the Emberkin run had to learn: `title/social` there came
 * back as a rounded-cornered banner floating on a white page, so the last clause says the
 * painting IS the file.
 */
const SCENE_STYLE =
  'Key art for a sky-island strategy game: painted, cinematic, high contrast, saturated without ' +
  'being garish, with deep atmospheric perspective and volumetric light through stratified ' +
  'cloud. It is a painting, not a photograph: no lens flare, no chromatic aberration, no ' +
  'depth-of-field bokeh discs, no letterboxing, no user interface overlay, no watermark and no ' +
  'signature. The painting FILLS THE WHOLE IMAGE, edge to edge and corner to corner, and is ' +
  'dark at its edges: it is not a picture of a card, a banner, a poster, a screen, a mock-up or ' +
  'a device, it has no rounded corners, no border, no margin, no mount, no drop shadow and no ' +
  'page behind it, and there is no white, cream, grey or paper-coloured area anywhere in the ' +
  'frame.'

/**
 * The ground, restated LAST as its own paragraph — the brand run's most expensive lesson
 * (its first live image came back mid-grey taupe with construction guides), carried through
 * Emberkin unchanged in substance and unchanged again here.
 */
const FLAT_GROUND_CLAUSE =
  `The background is one flat, uniform, unbroken near-black warm ash field, hex ${BRAND_GROUND}, ` +
  'filling the entire frame from edge to edge behind the subject — not grey, not taupe, not ' +
  'beige, not cream, not ivory, not off-white, not paper, not parchment, not a gradient, not a ' +
  'vignette, not a radial glow, not a spotlight, not a studio backdrop, and not lighter at the ' +
  'corners or behind the subject. There is NO light beam, no light ray, no shaft of light, no ' +
  'sunbeam and no glow entering the frame from any edge or corner — this run\'s own output ' +
  'kept painting one in from the upper left, and it is the one thing the ground repair cannot ' +
  'remove. The subject is bright against a dark ground, never dark ' +
  'against a light one, and the image is never inverted. It is not standing on anything: no ' +
  'floor, no ground plane, no platform, no pedestal, no podium, no horizon line, no cast shadow ' +
  'and no contact shadow. Draw only the subject itself: no construction lines, no grid, no ' +
  'guides, no ruled margins, no border, no frame, no bounding box, no registration marks, no ' +
  'colour swatches and no drop shadow.'

/** One-sentence restatement in the final position. Position beats length — the Emberkin finding. */
const DARK_TAIL =
  `Overall this image is DARK. The background is ONE SINGLE FLAT COLOUR, near-black ${BRAND_GROUND}, ` +
  'with no shading, no lighting, no shadow, no floor and no texture of any kind on it anywhere. ' +
  'It is NOT white, NOT cream and NOT grey. The artwork floats free on it with nothing beneath ' +
  'it, and is the only bright thing in the frame.'

/** The scene equivalent: a picture cannot have a flat ground, but it can refuse to be pale. */
const SCENE_GROUND_CLAUSE =
  'The darkest values in this picture are a warm near-black ash, hex ' +
  `${BRAND_GROUND}, and the four outer edges of the frame fall away into that darkness rather ` +
  'than into grey, white or pale blue. It is a dusk, a night or a storm-lit interior of the ' +
  'sky, never a bright daylight scene, and never a light or white background. Draw only the ' +
  'picture: no border, no frame, no letterbox bars, no drawn vignette ring, no user interface, ' +
  'no logo and no signature.'

const NO_TEXT =
  'Nothing is written anywhere in this image: no text, no lettering, no numerals, no caption, ' +
  'no label, no title, no logo, no watermark and no signature. If any string would appear, ' +
  'leave that area empty instead.'

/**
 * The lettering clause, used by exactly ONE asset in this set: the wordmark. The brand run
 * measured that wordmarks spell reliably while wide cards invent text out of the prompt's own
 * vocabulary — so the blocklist below is THIS repository's vocabulary, and every wide card is
 * composited by `derive.py` instead of lettered by the model.
 */
function letteringClause(name: string): string {
  const spelled = name
    .split('')
    .map((character) => (character === ' ' ? 'space' : character))
    .join('-')
  return (
    `The ONLY text anywhere in this image is the title "${name}", set once. Spelled character ` +
    `by character it is: ${spelled}. Nothing else is written anywhere in the frame: no ` +
    'subtitle, no tagline, no strapline, no second line, no caption, no label, no annotation, ' +
    'no legend, no studio name, no platform badge, no age rating, no review quote, no release ' +
    'date, no word naming a part of the picture, no word taken from any description of the ' +
    'picture, no words such as "aether", "sky", "island", "airship", "season", "spire", ' +
    '"strategy", "game", "worlds", "forge", "cloud" or "keyart", no invented words, no ' +
    'misspelled or partial words, no repeated title, no URL, no dot-com and no registered ' +
    'mark. If any other string would appear, leave that area empty instead.'
  )
}

/**
 * The accent clause for flat vector work, carried from the brand run (Hub's grey ridge, Worlds'
 * white settlement) with Emberkin's amendment: the anchor's plain-language name is stated
 * beside the hex, because a bare hex reads as noise to an image model.
 */
function accentClause(accent: string, allowGroundLine: boolean): string {
  const { name, qualifier } = colourWordForHex(accent)
  const named =
    name === 'its anchor colour' ? '' : `That colour is ${name}${qualifier ? ` — ${qualifier}` : ''}. `
  // The bone ground-line exemption is the estate mark family's construction and belongs ONLY to
  // the title mark and wordmark. Offered to an icon it is taken: the trial aether icon arrived
  // with a full-width bone bar across its foot, which breaks both the icon and the flat-ground
  // check. Everything that is not title chrome floats free instead.
  const exception = allowGroundLine
    ? 'The only permitted exception is a ground line, which may instead be a muted bone #b7ae9b. '
    : 'There is no second colour anywhere: no ground line, no baseline bar, no shelf, no band ' +
      'and no stripe beneath or behind the subject. '
  return (
    `Every drawn element is filled or stroked in ${accent} — that exact colour, at full ` +
    `strength. ${named}${exception}` +
    `Nothing is drawn in plain white, plain grey or the ground colour, and ${accent} is the ` +
    'dominant colour of the artwork rather than a small detail on it.'
  )
}

/**
 * The palette clause for painterly sprites. Not a single-accent rule — a building is timber and
 * stone and brass — but it names the bible's material palette and the one hue that identifies
 * the subject, in plain words per the Emberkin colour-word rule.
 */
function spritePaletteClause(accent: string): string {
  const { name, qualifier } = colourWordForHex(accent)
  const phrase = qualifier ? `${name} — ${qualifier}` : name
  return (
    'Its palette is the game\'s: warm lamplit timber, pale limestone and soft brass on the ' +
    `subject, against the cold dark. The hue that identifies this subject is ${phrase}, ` +
    `${accent}, and it is clearly present on the subject. No rainbow, no unrelated accent ` +
    'colours, and nothing pastel.'
  )
}

const ONE_SUBJECT_GUARD =
  'Draw the subject exactly ONCE, filling the frame. Do not repeat it, do not inset a second ' +
  'smaller copy, do not add a thumbnail, a preview box, a framed panel, a tile, a mirror, a ' +
  'variant or a sheet of alternates beside or below it.'

/**
 * Per-set hardening. The sprite clause answers the defect Emberkin measured on its first live
 * portrait — given a named subject, the model draws a trading card with a nameplate — before it
 * can recur here, where every building and ship has a name.
 */
const SPRITE_HARDENING =
  'This is a single piece of game sprite art, not a trading card and not a page from a book. ' +
  'There is no nameplate, no name banner, no caption bar, no ribbon, no scroll, no stat block, ' +
  'no number, no border, no card frame, no artist signature and no watermark. Do not write the ' +
  'subject\'s name anywhere. Do not draw a card.'

const SPRITE_SETS = new Set(['islands', 'buildings', 'ships'])

/**
 * Assemble one prompt. Style first, subject second, colour third, prohibitions LAST — the order
 * `studio/src/prompt.ts` argues for; a prohibition placed before the subject is routinely
 * ignored.
 */
export function promptFor(planned: PlannedAsset): string {
  const sprite = SPRITE_SETS.has(planned.set)
  const style = sprite ? SPRITE_STYLE : planned.ground === 'scene' ? SCENE_STYLE : ICON_STYLE
  const colour = sprite
    ? spritePaletteClause(planned.accent)
    : planned.ground === 'flat'
      ? accentClause(planned.accent, planned.set === 'title')
      : ''

  const parts = [
    style,
    ONE_SUBJECT_GUARD,
    planned.subject,
    colour,
    planned.ground === 'flat' ? FLAT_GROUND_CLAUSE : SCENE_GROUND_CLAUSE,
    planned.lettering ? letteringClause(planned.lettering) : NO_TEXT,
    sprite ? SPRITE_HARDENING : '',
    planned.ground === 'flat' ? DARK_TAIL : '',
  ]
  return parts.filter((part) => part.trim().length > 0).join('\n\n')
}

/* ------------------------------------------------------------------ the manifest */

export interface ManifestEntry {
  /**
   * The provider id from providers.json. Added when the set stopped being the only set: without
   * it, two manifests describing two different models would be distinguishable only by which
   * directory they were found in, and compare.py would be reading a fact off a path.
   */
  readonly provider: string
  /** `icons/resource-aether`. Stable across runs; the manifest is keyed on it plus the size. */
  readonly asset: string
  readonly set: string
  readonly slug: string
  readonly name: string
  readonly path: string
  /** What verify.py measures coverage against, where the set's floor is above zero. */
  readonly accent: string
  readonly secondaryAccent: string | null
  /** `flat` (snapped to #12100f) or `scene` (held to a darkness ceiling, never snapped). */
  readonly groundClass: string
  readonly declaredSize: string
  /** What was asked of FLUX — rounded UP to the 16-pixel grid, never down. */
  readonly requestedSize: string
  /** What the bytes on disk actually measure. */
  readonly deliveredSize: string
  readonly sizing: string
  readonly cropped: boolean
  /** Set on a derivative; names the file it was cut, resampled or composited from. */
  readonly derivedFrom: string | null
  readonly backend: string
  readonly model: string | null
  readonly prompt: string
  /** Null on every asset: this deployment of FLUX 2 Pro accepts no seed parameter. */
  readonly seed: number | null
  readonly sha256: string
  readonly byteSize: number
  readonly generatedAt: string
  /** Read from the bytes on disk, never assumed from the vendor. verify.py re-checks it. */
  readonly c2pa: boolean
  /** Generations beyond the first that were needed before this file was accepted. */
  readonly retries: number
  readonly licence: string
  readonly providerCostUnits: number | null
  readonly providerOutputMegapixels: number | null
  /** Where in the game's own specification this asset's brief came from. */
  readonly sourceSpec: string
  /** Every post-processing step applied to the bytes since delivery, in order. */
  readonly postProcessing: readonly string[]
  /** The ground FLUX actually delivered, before normalisation. Written by normalise_ground.py. */
  readonly deliveredGround: string | null
  readonly attempts: readonly Attempt[]
  readonly note?: string

  /* ---- the native columns. Absent on every entry whose endpoint could be asked for the declared
   * size directly, which is all 96 of the reference set's and 23 of a gpt-image-2 set's.
   *
   * ## Why they are columns here rather than seventy-three more manifest ENTRIES
   *
   * The obvious shape is to record the as-delivered native the way `keyart/og-source` is recorded:
   * its own entry, its own key, its own row. It cannot be, and the reason is worth writing down
   * because it looks like an oversight from every direction except the one it comes from.
   *
   * `verify.py`'s `check_parity` fails any key a candidate holds that the reference does not — "no
   * set can hold an asset the reference has never generated" — because every dialect is a pure
   * function of the reference record and an extra key means something generated a prompt of its
   * own. That check is the strongest guarantee in this repository and it is right. A
   * `heraldry/vaneholt-native@1024x1024` row would break it for a reason that has nothing to do
   * with prompts, and the only ways to keep both would be to special-case the parity check or to
   * widen it. Neither is acceptable: the whole point of it is that it cannot be talked round.
   *
   * So the native is not an asset. It is a PROPERTY of the asset that was cut from it, recorded on
   * that asset's row, stored outside `assets/` at `native/<set>/<file>` — which is also outside the
   * reach of `verify.py`'s orphan-PNG walk, which globs only under `assets/`. `verify.py`'s
   * `check_native` checks these four columns against the bytes they name, so the native is measured
   * rather than merely mentioned.
   *
   * THREE QUARTERS of a gpt-image-2 set carries them, which is why they are not an edge case here
   * the way they are in the sibling repositories. If a reader of this manifest wants to know which
   * files are the model's own bytes and which are Pillow's, `nativePath` being present IS that
   * question, and `c2pa` false beside `nativeC2pa` true is what a downscale looks like.
   */

  /** Provider-root-relative, e.g. `native/heraldry/vaneholt-1024x1024-asdelivered.png`. */
  readonly nativePath?: string
  /** What was actually asked for and delivered, before the downscale. */
  readonly nativeSize?: string
  readonly nativeSha256?: string
  /** Measured on the native's bytes. The derivative loses the chunk; the native is where it lives. */
  readonly nativeC2pa?: boolean
}

type Manifest = Record<string, ManifestEntry>

const keyOf = (asset: string, size: string): string => `${asset}@${size}`

async function readManifest(provider: Provider): Promise<Manifest> {
  const path = manifestPathOf(provider)
  if (!existsSync(path)) return {}
  const parsed = JSON.parse(await readFile(path, 'utf8')) as { assets?: ManifestEntry[] }
  const out: Manifest = {}
  for (const entry of parsed.assets ?? []) out[keyOf(entry.asset, entry.declaredSize)] = entry
  return out
}

async function writeManifest(provider: Provider, manifest: Manifest): Promise<void> {
  const assets = Object.values(manifest).sort(
    (a, b) => a.asset.localeCompare(b.asset) || a.path.localeCompare(b.path),
  )
  const document = {
    $comment:
      'Provenance for every image in this repository. One entry per file, carrying the columns ' +
      "studio's generation_jobs and assets tables carry. Generated by generate.ts and updated " +
      'in place by normalise_ground.py and derive.py; do not edit by hand.',
    provider: provider.id,
    providerLabel: provider.label,
    billing: provider.billing,
    generator: '@cloudsforge/studio via aetherholm-assets/generate.ts',
    endpoint: 'Azure AI Foundry, Black Forest Labs FLUX 2 Pro',
    specification:
      'aetherholm/src/content.ts and world.ts (the shipped game content), ' +
      'docs/ecosystem/20-aetherholm.md §8 (the set), ART_BIBLE.md (the direction). The doc ' +
      'planned the content JSON to live here; the service is the canon instead — see README §2.',
    disclosure:
      'Every image here is AI-generated. Each as-delivered file carries C2PA provenance and a ' +
      'Microsoft invisible watermark. Ground normalisation preserves the C2PA chunk by copying ' +
      'every ancillary chunk through; a derivative re-encoded by Pillow does not, and each ' +
      'derivative names the file it came from and reports the c2pa state actually measured.',
    licence: GENERATED_LICENCE,
    assetCount: assets.length,
    updatedAt: new Date().toISOString(),
    assets,
  }
  await mkdir(provider.root, { recursive: true })
  await writeFile(manifestPathOf(provider), `${JSON.stringify(document, null, 2)}\n`, 'utf8')
}

/* ------------------------------------------------------------------ generation */

const C2PA = Buffer.from('c2pa')

const sha256 = (bytes: Buffer): string => createHash('sha256').update(bytes).digest('hex')

/** Provenance and shape only; the FLUX backend sends width/height regardless. */
function assetKindFor(planned: PlannedAsset): AssetKind {
  if (planned.key === 'title/wordmark') return 'wordmark'
  if (planned.ground === 'scene') return 'banner'
  if (planned.width === planned.height) return planned.width <= 512 ? 'icon' : 'mark'
  return 'banner'
}

function specForPlanned(planned: PlannedAsset): AssetSpec {
  return specFor(assetKindFor(planned), { width: planned.width, height: planned.height })
}

function fileNameFor(planned: PlannedAsset, requested: { width: number; height: number }): string {
  const onGrid = requested.width === planned.width && requested.height === planned.height
  return onGrid
    ? `${planned.slug}-${planned.width}x${planned.height}.png`
    : `${planned.slug}-${requested.width}x${requested.height}-asdelivered.png`
}

/**
 * True when a refusal was the content filter rather than a malformed request.
 *
 * The first three markers are Azure's own vocabulary for FLUX. The last two are gpt-image-2's, and
 * they were added because this set's endpoint speaks a different dialect of failure: OpenAI's
 * images route answers a filtered generation with `moderation_blocked` and a badly shaped request
 * with `image_generation_user_error`, and neither string contains any of FLUX's three. Without them
 * a refusal on this endpoint reads as an ordinary bad request, the retry ladder never runs and a
 * set that is 95 of 96 has to be finished by hand.
 *
 * Matched on the vendor's stable machine-readable codes rather than on prose. `moderation_blocked`
 * is a documented error code; the sentence around it is marketing copy that can be reworded between
 * deployments without any notice.
 */
function isContentRefusal(err: unknown): boolean {
  if (!(err instanceof ImageBackendError) || err.code !== 'bad_request') return false
  const text = `${err.message} ${err.attempts.map((a) => a.detail).join(' ')}`.toLowerCase()
  return (
    text.includes('content_safety') ||
    text.includes('rai policy') ||
    text.includes('blocklist') ||
    text.includes('moderation_blocked') ||
    text.includes('image_generation_user_error')
  )
}

/**
 * A delivery that came back rotated. Thrown BEFORE the bytes are written, never retried.
 *
 * ## This class is here because the repository already claimed it was, and it was not
 *
 * `providers.json`'s header stated that "generate.ts still measures every delivered non-square
 * image against what it asked for, for every provider, and refuses to keep a transpose". That was
 * not true here. The class existed in exactly one of the estate's four asset repositories —
 * micro-tessera-assets — and this one measured the delivery with `reportSizing`, recorded
 * `sizing: "unsized"`, and KEPT the file. So the guarantee a document asserted was, in this
 * repository, a row in a manifest that nobody reads until a contact sheet looks wrong.
 *
 * It is ported rather than the claim deleted, because the claim is the right one. A transposed
 * delivery is not a transient fault and must not be written to disk and recorded as if it were the
 * asset: ten airship profiles, six splash cards, four keyart scenes and the wordmark are non-square
 * in this set — twenty-one assets, which is exactly the population one vendor's `size` bug silently
 * rotated while every log line looked correct.
 *
 * **Measured against what the BACKEND asked for, not against what the asset declares.** Those are
 * the same number for the reference provider and for 23 of a gpt-image-2 set's 96, and they differ
 * wherever an endpoint refuses the declared size and the backend had to ask for a larger native —
 * `GenerationResult.nativeRequest` is how it says so. Comparing bytes to the declared size instead
 * would make this fire on every one of the ten 1024x512 airship profiles of such a set until
 * somebody switched it off, which is the mechanism by which a real rotation gets through.
 *
 * **Do not post-rotate the bytes.** That is a second lossy pass on artwork the model composed for
 * the frame it thought it had. Correct it in that provider's own envelope in `backends.ts` and
 * leave this measurement in place to prove the correction works.
 */
export class TransposedDeliveryError extends Error {
  constructor(key: string, wanted: string, got: string) {
    super(
      `${key}: asked for ${wanted} and the bytes measure ${got}, which is its transpose. This ` +
        'provider is delivering rotated images and its response JSON will not say so. Do not ' +
        'post-rotate the bytes — that is a second lossy pass on artwork the model composed for ' +
        "the frame it thought it had. Correct it in that provider's own envelope in backends.ts, " +
        'and leave this measurement in place to prove the correction works.',
    )
    this.name = 'TransposedDeliveryError'
  }
}

/**
 * Lanczos-downscale one file to one size, in Pillow, and report what the result actually is.
 *
 * ## Why this shells out instead of resampling in TypeScript
 *
 * `studio/src/sizing.ts` MEASURES and deliberately does not resample: doing it in pure TypeScript
 * means a zlib-aware PNG decoder, a filter reconstructor, a resampler and an encoder, and doing it
 * with `sharp` means a native dependency in a repository that has none. That decision is unchanged
 * and correct. The pixels are moved by the same Pillow that already cuts the OG card and builds the
 * three favicons, invoked through the same `derive.py` — not macOS `sips`, which design-system.md
 * §7 item 3 names as the reason the estate's post-processing stage exists on exactly one laptop.
 *
 * ## Why this is not "silently upscaling and calling it generated"
 *
 * It is the opposite operation. The model generated a LARGER image than the asset declares, because
 * the endpoint refused the declared size, and this cuts it down — the same direction, and the same
 * argument, as the OG card being asked for at 1200x640 and cropped to 1200x630. No pixel is
 * invented. The as-delivered native is kept beside the set, its checksum and C2PA state are
 * recorded on the entry, and `verify.py --provider <id>` re-measures both.
 */
async function resample(source: string, target: string, size: Dimensions): Promise<{
  sha256: string
  byteSize: number
  c2pa: boolean
  size: string
}> {
  const { stdout } = await run(
    'python3',
    [join(HERE, 'derive.py'), '--resample', source, target, `${size.width}x${size.height}`],
    { maxBuffer: 8 * 1024 * 1024 },
  )
  return JSON.parse(stdout) as { sha256: string; byteSize: number; c2pa: boolean; size: string }
}

async function generateOne(
  provider: Provider,
  backend: ProviderBackend,
  planned: PlannedAsset,
  previousRetries: number,
  reprompt: boolean,
): Promise<ManifestEntry> {
  const spec = specForPlanned(planned)
  const requested = requestSizeFor({ width: planned.width, height: planned.height })
  // Replayed from the reference manifest where there is a record, computed only where there is
  // not. See replay.ts for why that asymmetry is the whole parity guarantee.
  const prompt = promptForProvider(provider.id, planned, promptFor, { reprompt })

  const request: GenerationRequest = {
    prompt,
    spec,
    requestWidth: requested.width,
    requestHeight: requested.height,
    kitName: planned.name,
    accent: planned.accent,
  }

  // Transport faults and 429s are worth retrying; a refusal or credential problem is wrong the
  // same way on every retry and is rethrown at once.
  const MAX_TRANSIENT = 5
  let transient = 0
  let lastError: unknown = null
  const allAttempts: Attempt[] = []

  for (let go = 0; go <= MAX_TRANSIENT; go += 1) {
    try {
      const result = await backend.generate(request, AbortSignal.timeout(300_000))
      allAttempts.push(...result.attempts)
      const [directory] = planned.key.split('/')
      const dir = join(assetsDirOf(provider), directory!)
      await mkdir(dir, { recursive: true })
      const fileName = fileNameFor(planned, requested)
      const path = join(dir, fileName)

      // What the BACKEND asked for, which is what the bytes have to be measured against. Equal to
      // `requested` for every provider that can be asked for the declared size directly; larger
      // where an endpoint has a minimum this asset falls under. See `nativeRequest`.
      const asked = result.nativeRequest ?? requested
      const sizing = reportSizing(result.bytes, asked, 'png')
      const delivered = sizing.actual ? `${sizing.actual.width}x${sizing.actual.height}` : 'unknown'

      // MEASURED, BEFORE THE FILE IS KEPT. A transposed delivery is not a transient fault and must
      // not be written to disk and recorded as though it were the asset.
      if (
        sizing.actual &&
        asked.width !== asked.height &&
        sizing.actual.width === asked.height &&
        sizing.actual.height === asked.width
      ) {
        throw new TransposedDeliveryError(planned.key, `${asked.width}x${asked.height}`, delivered)
      }

      // ---- the native path: generated larger than declared because the endpoint refused the
      // declared size, then cut down. Nothing is upscaled and nothing is invented; the native is
      // kept, because it is the file that still carries the C2PA chunk — the same reason the
      // as-delivered OG card is kept beside its crop.
      let native: {
        nativePath: string
        nativeSize: string
        nativeSha256: string
        nativeC2pa: boolean
      } | null = null
      let bytesOnDisk = result.bytes

      if (result.nativeRequest) {
        const nativeDir = join(provider.root, 'native', directory!)
        await mkdir(nativeDir, { recursive: true })
        const nativeName =
          `${planned.slug}-${result.nativeRequest.width}x${result.nativeRequest.height}` +
          '-asdelivered.png'
        const nativeFile = join(nativeDir, nativeName)
        await writeFile(nativeFile, result.bytes)

        const cut = await resample(nativeFile, path, {
          width: requested.width,
          height: requested.height,
        })
        bytesOnDisk = await readFile(path)
        if (cut.size !== `${requested.width}x${requested.height}`) {
          throw new Error(
            `${planned.key}: the downscale produced ${cut.size} rather than the requested ` +
              `${requested.width}x${requested.height}. Pillow reported a size this run did not ` +
              'ask for, so the file is not the asset and must not be recorded.',
          )
        }
        native = {
          nativePath: `native/${directory}/${nativeName}`,
          nativeSize: delivered,
          nativeSha256: sha256(result.bytes),
          nativeC2pa: result.c2pa,
        }
      } else {
        await writeFile(path, result.bytes)
      }

      // The bytes on disk, always — the native delivery where there was no downscale, and the
      // cut-down file where there was. `nativeSize` is what the model actually returned.
      const onDisk = reportSizing(bytesOnDisk, requested, 'png')
      const deliveredOnDisk = onDisk.actual
        ? `${onDisk.actual.width}x${onDisk.actual.height}`
        : delivered
      const isSource = fileName.includes('asdelivered')

      return {
        asset: isSource ? `${planned.key}-source` : planned.key,
        set: planned.set,
        slug: planned.slug,
        name: planned.name,
        path: `assets/${directory}/${fileName}`,
        accent: planned.accent,
        secondaryAccent: planned.secondaryAccent,
        groundClass: planned.ground,
        declaredSize: isSource
          ? `${requested.width}x${requested.height}`
          : `${planned.width}x${planned.height}`,
        requestedSize: `${requested.width}x${requested.height}`,
        deliveredSize: deliveredOnDisk,
        sizing: onDisk.sizing,
        cropped: false,
        // Null even on the native path, deliberately. `derivedFrom` names another ASSET this file
        // was cut from, and compare.py counts the entries without one as this set's generations. A
        // native is not another asset — it is the raw delivery of THIS one, which is why it has no
        // manifest key of its own — so filling this in would report 23 generations for a set that
        // paid for 96, and would drop seventy-three assets out of compare.py's counts as well.
        derivedFrom: null,
        provider: provider.id,
        backend: result.backend,
        model: result.model,
        prompt,
        seed: result.seed,
        sha256: native ? sha256(bytesOnDisk) : sha256(result.bytes),
        byteSize: bytesOnDisk.length,
        generatedAt: new Date().toISOString(),
        // Measured on the bytes, never asserted from the vendor. The standing rule — and on the
        // native path it is measured on the bytes that were WRITTEN, which have been re-encoded and
        // have lost the C2PA chunk even though the delivery carried one. `nativeC2pa` records that
        // the delivery did, which is what makes the pair evidence rather than a claim.
        c2pa: native ? measureC2pa(bytesOnDisk) : result.c2pa,
        retries: previousRetries + transient,
        licence: GENERATED_LICENCE,
        providerCostUnits: result.providerCostUnits,
        providerOutputMegapixels: result.providerOutputMegapixels,
        sourceSpec: planned.source,
        postProcessing: [],
        deliveredGround: null,
        attempts: allAttempts,
        ...(native ?? {}),
        ...(native
          ? {
              note:
                `Generated at ${native.nativeSize} and Lanczos-downscaled to ` +
                `${requested.width}x${requested.height}. This endpoint refuses the declared size ` +
                "— it is below the deployment's minimum pixel budget — so the nearest exact " +
                'multiple of the SAME aspect ratio was asked for and cut DOWN. No pixel was ' +
                'invented and nothing was upscaled. The as-delivered native is kept at ' +
                `${native.nativePath}, outside assets/, because it is the file that still carries ` +
                'the C2PA chunk; re-encoding drops it and the invisible pixel watermark is ' +
                'unaffected.',
            }
          : {}),
      }
    } catch (err) {
      lastError = err
      // An unimplemented backend is wrong on every retry and for every asset. Fail the whole run
      // at once rather than N times per asset across the set.
      if (err instanceof UnimplementedBackendError) throw err
      // A rotation is a property of the provider, not of this call. Retrying it five times buys
      // five more rotated images at full price and then reports the same thing.
      if (err instanceof TransposedDeliveryError) throw err
      if (err instanceof ImageBackendError) {
        allAttempts.push(...err.attempts)
        if (err.code === 'bad_request' || err.code === 'unauthorised') throw err
      }
      transient += 1
      if (go === MAX_TRANSIENT) break
      // A 429 is a quota window, not a blip: the trial batch measured 2/4/8s losing the race
      // every time while the window was a minute wide. Waiting out most of a minute costs
      // nothing but wall-clock and saves the asset.
      const rateLimited =
        err instanceof ImageBackendError && err.attempts.some((a) => a.outcome === 'rate_limited')
      const backoffMs = rateLimited ? 20_000 * (go + 1) : 2_000 * 2 ** go
      process.stdout.write(`    ${planned.key}: transient failure, retrying in ${backoffMs / 1000}s\n`)
      await new Promise((resolve) => setTimeout(resolve, backoffMs))
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError))
}

/* ------------------------------------------------------------------ derivatives */

/** Favicons, the OG cut and the composited cards, in Pillow. See derive.py's own header. */
async function derive(provider: Provider): Promise<ManifestEntry[]> {
  const { stdout } = await run('python3', [join(HERE, 'derive.py'), '--provider', provider.id], {
    maxBuffer: 32 * 1024 * 1024,
  })
  return JSON.parse(stdout) as ManifestEntry[]
}

/* ------------------------------------------------------------------ the reviewable plan */

/** Write PLAN.json: the whole derived set, with every prompt, before anything is spent. */
async function writePlanJson(): Promise<number> {
  const planned = plannedAssets()
  const requested = (asset: PlannedAsset) =>
    requestSizeFor({ width: asset.width, height: asset.height })
  const document = {
    $comment:
      'The generation plan, derived by plan.ts from aetherholm/src/content.ts and world.ts and ' +
      'written by `generate.ts --plan`. Reviewable before a single generation is paid for. Do ' +
      'not edit by hand: it is regenerated from the content, which is the point of it.',
    generatedAt: new Date().toISOString(),
    palette: PALETTE,
    counts: planned.reduce<Record<string, number>>((acc, asset) => {
      acc[asset.set] = (acc[asset.set] ?? 0) + 1
      return acc
    }, {}),
    total: planned.length,
    assets: planned.map((asset) => ({
      key: asset.key,
      set: asset.set,
      name: asset.name,
      declaredSize: `${asset.width}x${asset.height}`,
      requestedSize: `${requested(asset).width}x${requested(asset).height}`,
      groundClass: asset.ground,
      accent: asset.accent,
      secondaryAccent: asset.secondaryAccent,
      lettering: asset.lettering,
      sourceSpec: asset.source,
      prompt: promptFor(asset),
    })),
  }
  await writeFile(PLAN_JSON, `${JSON.stringify(document, null, 2)}\n`, 'utf8')
  return planned.length
}

/* ------------------------------------------------------------------ main */

interface Selection {
  readonly provider: Provider
  readonly force: boolean
  readonly only: ReadonlySet<string> | null
  readonly deriveOnly: boolean
  readonly planOnly: boolean
  readonly limit: number | null
  readonly concurrency: number
  /**
   * Deliberately change the question an already-generated asset is asked. Reference-only, and it
   * makes every candidate's copy of that asset stale — verify.py will say so until they are
   * regenerated. Without it, a regeneration replays the prompt on record, which is what keeps the
   * sets comparable across time.
   */
  readonly reprompt: boolean
}

function parseArgs(argv: readonly string[]): Selection {
  const valueOf = (flag: string): string | null => {
    const index = argv.indexOf(flag)
    return index >= 0 && argv[index + 1] ? argv[index + 1]! : null
  }
  const only = valueOf('--only')
  const limit = valueOf('--limit')
  const concurrency = valueOf('--concurrency')
  const provider = providerById(valueOf('--provider') ?? REFERENCE.id)
  return {
    provider,
    reprompt: argv.includes('--reprompt'),
    // Per provider, from providers.json: a shared serverless endpoint and a dedicated A100 have
    // completely different reasons to be narrow, and the right width for one is wrong for the
    // other. Overridable because the honest value is measured, not predicted.
    concurrency: concurrency && Number(concurrency) > 0 ? Number(concurrency) : provider.concurrency,
    force: argv.includes('--force'),
    deriveOnly: argv.includes('--derive-only'),
    planOnly: argv.includes('--plan'),
    only: only ? new Set(only.split(',').map((s) => s.trim()).filter(Boolean)) : null,
    // The only real budget control is arithmetic on the number of calls.
    limit: limit && Number.isInteger(Number(limit)) ? Number(limit) : null,
  }
}

async function main(): Promise<void> {
  const selection = parseArgs(process.argv.slice(2))

  const planned = await writePlanJson()
  process.stdout.write(`PLAN.json: ${planned} asset(s) planned\n`)
  if (selection.planOnly) return

  await loadEnvFile(ENV_FILE)
  const provider = selection.provider
  const manifest = await readManifest(provider)
  const startedAt = Date.now()
  process.stdout.write(
    `provider ${provider.id} (${provider.label}) — ` +
      `${provider.shipped ? 'the shipped reference set' : 'a candidate set'}, ` +
      `billed per ${provider.billing.unit}\n`,
  )

  if (!selection.deriveOnly) {
    const backend = backendFor(provider)
    let work = plannedAssets().filter((asset) => {
      if (selection.only && !selection.only.has(asset.key)) return false
      if (selection.force) return true
      // The resume rule: anything already recorded in THIS provider's manifest is done. The
      // manifest is written after every single asset, so an interrupted run — or a redeployed
      // endpoint — costs only the assets that were in flight.
      return manifest[identityFor(asset).key] === undefined
    })
    if (selection.limit !== null) work = work.slice(0, selection.limit)

    process.stdout.write(`${work.length} asset(s) to generate\n`)

    // One at a time. The brand run settled on three; this deployment's quota answered three
    // in flight with a wall of 429s and answered two with colliding retry pairs, so the width
    // is turned all the way down rather than the retry budget spent on capacity. Throughput is
    // provider-capped either way; what serial buys is that no asset burns its retry budget
    // against a window another request just consumed.
    const CONCURRENCY = selection.concurrency
    let cursor = 0
    let failures = 0
    const failed: string[] = []
    const worker = async (): Promise<void> => {
      for (;;) {
        const index = cursor
        cursor += 1
        const asset = work[index]
        if (!asset) return
        const previous = manifest[identityFor(asset).key]
        // A forced regeneration counts as a retry of the asset, whatever the reason.
        const previousRetries = previous ? previous.retries + 1 : 0
        try {
          let entry: ManifestEntry
          try {
            entry = await generateOne(provider, backend, asset, previousRetries, selection.reprompt)
          } catch (err) {
            if (!isContentRefusal(err)) throw err
            // The Emberkin run measured this deployment's content filter to be NON-DETERMINISTIC:
            // six refused prompts, re-issued verbatim, all succeeded on the next attempt. So the
            // one honest cheap retry is the same prompt again; a second refusal is treated as
            // real and surfaces as a failure rather than being argued with.
            process.stdout.write(`    ${asset.key}: content filter refused, repeating verbatim\n`)
            entry = await generateOne(provider, backend, asset, previousRetries + 1, selection.reprompt)
          }
          manifest[keyOf(entry.asset, entry.declaredSize)] = entry
          process.stdout.write(
            `  ok  ${asset.key} ${entry.deliveredSize} ` +
              `${(entry.byteSize / 1024).toFixed(0)}KB c2pa=${entry.c2pa} retries=${entry.retries}\n`,
          )
          await writeManifest(provider, manifest)
        } catch (err) {
          failures += 1
          failed.push(asset.key)
          const message = err instanceof Error ? err.message : String(err)
          process.stdout.write(`  FAIL ${asset.key}: ${message}\n`)
        }
      }
    }
    await Promise.all(Array.from({ length: CONCURRENCY }, worker))
    if (failures > 0) {
      process.stdout.write(`\n${failures} asset(s) failed:\n  ${failed.join('\n  ')}\n`)
    }
  }

  // Derivatives are rebuilt from whatever is on disk every run, so a regenerated source can
  // never leave a stale crop, favicon or composite behind it.
  for (const entry of await derive(provider)) manifest[keyOf(entry.asset, entry.declaredSize)] = entry
  await writeManifest(provider, manifest)
  process.stdout.write(`\nmanifest: ${Object.keys(manifest).length} entries\n`)
}


/**
 * Only when this file is the program, never on import.
 *
 * `parity.test.ts` imports `promptFor` from here, and a bare `await main()` at module scope meant
 * that importing it started a real generation run — against a live, billed endpoint, from a test.
 * A module that spends money when it is read is a hazard whatever else is true of it.
 */
const invokedDirectly = process.argv[1] !== undefined && process.argv[1].endsWith('generate.ts')

if (invokedDirectly) {
  // The checklist is the entire value of an unimplemented backend, so it is printed in full rather
  // than flattened into a stack trace.
  await main().catch((err: unknown) => {
    if (err instanceof UnimplementedBackendError) {
      process.stderr.write(`\n${err.message}\n`)
      process.exitCode = 2
      return
    }
    throw err
  })
}
