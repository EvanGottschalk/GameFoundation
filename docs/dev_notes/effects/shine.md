# Shine Overview

A `shine effect` is an animated overlay that can be layered on any game asset (object, character, item, background, etc.). It appears as one or more colored bands — called `waves` — that travel across the asset in a periodic, looping pattern. A shine effect can be a single moving streak (e.g. a sword glint), a rolling rainbow, an expanding shockwave, or anything composed of those primitives.

Pre-made templates for `shine effects` live in `config/effects/shine/`. Any asset can reference one by name through its `effects` list (e.g. `{ shine: "Rolling Rainbow" }`). The registry that discovers these templates auto-imports every file in that folder, so dropping a new file in is enough — no manual wiring is required.

# Mental Model

The shine effect is best understood as a **fixed-width scrolling pattern** that the asset peeks at through a window:

- The pattern has a total length called the **cycle** (`L`). The pattern repeats every `L` pixels.
- Each wave is placed at a specific pixel position inside that pattern (`wave.start`).
- The pattern scrolls at `wave.speed` pixels per second. Every wave in a shine effect moves together because they share that scroll.
- The asset is just a window of arbitrary width that sees a slice of the pattern at any given time. Larger assets see more of the pattern at once; smaller assets see less. The animation runs at the same speed and frequency regardless.

This means asset width does **not** change the animation's timing — it only changes how much of the rolling pattern is visible at once. That is the core reason `effect.width` exists: it anchors the pattern's size independently of the asset.

# Cycle Length

The cycle length `L` (in pixels) is computed as:

```
L = max(effect.width, wave.speed * wave.period)
```

- `effect.width / wave.speed` is the **active animation duration** — the time it takes a wave to travel across the pattern's active region.
- `wave.speed * wave.period` lets `period` extend the cycle further, appending blank pixels past the active region.
- Whichever is larger wins. Any span in the cycle that is **not** covered by a wave just scrolls past as blank — there is no on/off snap, so gaps between waves and the leftover "empty time" at the cycle's end are rendered identically.

### Examples

- **Rolling Rainbow** (`effect.width: 700`, 7 waves at 0, 100, …, 600, each `width: 100`, `speed: 100`, `period: 7`):
  `L = max(700, 100 * 7) = 700`. The 7 waves tile the pattern exactly with no gaps, so the rainbow rolls seamlessly.
- **Rolling Rainbow with `period: 14`**: `L = max(700, 100 * 14) = 1400`. Same 7 waves of color (700 px), then 700 px of blank, then it repeats — a 14-second cycle.
- **Rolling Rainbow with `effect.width: 1400` instead**: `L = max(1400, 700) = 1400`. Same 14-second cycle, but now `effect.width` is driving the active region, not `period`.
- **Black Streak** (`effect.width: 500`, single wave `width: 20`, `speed: 300`, `period: 3`):
  `L = max(500, 900) = 900`. About 1.7 s of streak visible, then ~1.3 s of blank, every 3 s.

# Parameter Reference

Top-level fields on a shine config:

- **`name`** — string identifier used to look the effect up from an asset's `effects` list. Must be unique across `config/effects/shine/`.
- **`width`** — pixel width of the pattern's active region. Sets the minimum cycle length (see above) and keeps the animation visually comparable across assets of different sizes. **This value is never inert** — every shine references it when computing the cycle.
- **`height`** — height of the band along the cross axis, in pixels. If `0`, the band covers the full extent of the asset on the cross axis (i.e. full height for horizontal waves, full width for vertical waves). Use this when you want a shine that doesn't span the entire asset (e.g. a thin glint along the top).
- **`waveDefaults`** — defaults applied to every wave. A wave entry in `waves` may override any of these fields.
- **`waves`** — optional array of individual waves. If omitted, a single wave is rendered using `waveDefaults` alone.

## Per-Wave Fields (set on `waveDefaults` or any `waves` entry)

- **`color`** — hex string (e.g. `"#ff0000"`). The wave is filled with this color.
- **`opacity`** — 0..1. Alpha multiplier applied to the wave's color.
- **`start`** — the wave's position in the pattern, in **literal pixels**. Two waves with `start: 0` and `start: 100` are exactly 100 px apart inside the pattern. This is *not* a time delay — at `elapsed = 0`, a wave with `start: 100` is already at the 100 px mark, ready to scroll.
- **`speed`** — pixels per second that the pattern scrolls. All waves in a shine effect share this scroll (set on `waveDefaults` for consistency).
- **`width`** — band thickness along the travel axis, in **literal pixels** (not scaled by the asset). A `width: 20` wave is 20 px thick whether overlaying a 50 px asset or a 500 px asset.
- **`featherStart`** — pixels of alpha ramp at the trailing edge of the band. `0` = hard edge. A nonzero value fades the trailing edge in over that many pixels.
- **`featherEnd`** — same, at the leading edge.
- **`period`** — seconds. Combined with `speed`, sets `wave.speed * wave.period` as a lower bound for the cycle distance (see *Cycle Length*). Use this to add blank time between repetitions of the animation.
- **`orientation`** — one of:
  - `"horizontal"` — band travels left-to-right.
  - `"vertical"` — band travels top-to-bottom.
  - `"radial"` — band is a ring expanding outward from the asset's center. `angle` is ignored for radial.
- **`reverseDirection`** — if `true`, flips the direction:
  - horizontal becomes right-to-left
  - vertical becomes bottom-to-top
  - radial becomes outer rings collapsing inward
- **`angle`** — degrees of skew for linear orientations. `0` means the band is perpendicular to the travel axis (a perfectly vertical rectangle for horizontal travel). Positive angles tilt the band; `90` would be parallel to travel (degenerate). Ignored for `radial`.

# How It Works in Code

The runtime split is intentionally thin: configs are pure data, and a single class handles rendering.

### `src/components/PlatformerGame/config/effects/shine/`

- **`index.ts`** — registry. Uses `require.context` to auto-import every `*.ts` file in the folder (except `index.ts` itself) and keys each effect by its `name`. This is what lets assets reference a shine effect by string name.
- Per-effect files (e.g. `rolling_rainbow.ts`, `black_streak.ts`) — each exports a `default` object matching the schema above.

### `src/components/PlatformerGame/game/effects/ShineEffect.ts`

A single class, `ShineEffect`, owns the rendering for one shine instance on one target.

- **Constructor** wires up:
  - `overlay` — a `Phaser.GameObjects.Graphics` at depth 1000, where the bands are drawn each frame.
  - `maskGraphics` — an off-screen `Graphics` used as a geometry mask, so the overlay is clipped to the target asset's bounds. The mask is redrawn each frame to follow the target.
  - `resolveWaves(config)` — merges `waveDefaults` with each entry in `waves`, parses hex colors, and fills in numeric defaults.
- **`update()`** is called from `MainScene.update()` every frame:
  1. Computes `elapsed` (seconds since the effect was constructed).
  2. Redraws the mask rect at the target's current bounds (so the clip moves with the asset).
  3. Clears the overlay and redraws each wave via `drawLinear` or `drawRadial`.
- **`cycleLength(wave)`** returns `max(this.config.width, wave.speed * wave.period)` — the `L` from the formula above.
- **`scrollPosition(wave, elapsed, L)`** returns where the wave's anchor sits within `[0, L)` at the current time: `(start + dir * speed * elapsed) mod L`, with `dir = -1` when `reverseDirection` is `true`.
- **`drawLinear`** draws horizontal/vertical bands:
  - Maps the band to an `(a, c)` coordinate frame where `a` is the travel axis and `c` is the cross axis.
  - Builds each band as a 4-point parallelogram. The skew `shift = crossSize * tan(angle)` is added to the top corners to tilt the band by `angle`.
  - Tiles the band across the asset window by stepping `k` from `kMin` to `kMax` and drawing at `pos + k * L`. The tile range is widened by a `margin` so skewed/feathered edges aren't culled at the asset's boundaries — the mask clips the overflow.
  - If `featherStart` or `featherEnd` is nonzero, the band is sliced into 4..32 sub-strips, each with its own alpha computed from the feather ramps.
- **`drawRadial`** draws expanding rings:
  - Centers at the asset's midpoint; `maxRadius` covers the asset's diagonal so corners are still hit.
  - Renders each ring with `strokeCircle(thickness, color, alpha)`; feathering is done by stacking thinner rings.
  - Tiles outward from `k = 0` to a `kMax` that covers `maxRadius + band`.

### `src/components/PlatformerGame/game/scenes/MainScene.ts`

The scene is the only place that knows about effect application:

- Imports `shineEffects` and the `ShineEffect` class.
- Holds an `effects: ShineEffect[]` list and ticks each one in `update()`.
- A private `applyEffects(target, effects, source)` helper walks an asset's `effects` array; for every `{ shine: "Some Name" }` entry, it looks up the config and instantiates a `ShineEffect` bound to that target. The helper is invoked for the player (from `player.ts`) and for each pixel-drawn object (from each object's config).
- Unknown shine names log a warning naming the referring file, so typos surface quickly.

### Adding a New Shine Effect

1. Create `config/effects/shine/<your_name>.ts` exporting a default object matching the schema.
2. Reference it from any asset's `effects` list with `{ shine: "Your Name" }` (matching the `name` field).
3. No imports or registrations are needed — `config/effects/shine/index.ts` picks it up at build time.
