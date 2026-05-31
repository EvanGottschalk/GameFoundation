# Effects Overview

An `effect` is an animated visual overlay that can be layered on top of any game asset — a `player`, `object`, `item`, `character`, etc. Effects do not change an asset's gameplay behavior; they are purely visual decoration that runs on top of the asset's existing rendering.

Effects live under `config/effects/` and are grouped into subfolders by **category** (one folder per effect family). The only category implemented today is `shine`. Each category has its own registry (`index.ts`) that auto-imports every effect template in the folder, so dropping a new file in is enough — no manual wiring is required.

This document covers the system as a whole. For the parameter-by-parameter reference of an individual category, see the per-category notes (e.g. [`shine.md`](./shine.md)).

# Applying an Effect to an Asset

Every asset config (objects, items, characters, the player) exposes an `effects: [...]` array. Each entry is a single-key object whose key is the effect category and whose value is the **name** of a template in that category's folder. For example:

```ts
// in config/objects/platform_0.ts
effects: [
  { shine: 'Rolling Rainbow' },
],
```

This says: "apply the shine template named `Rolling Rainbow` (defined in `config/effects/shine/rolling_rainbow.ts`) to every instance of this object." The same asset may list several effects, and the same template may be referenced by any number of assets.

Lookup is by the template's `name` field, **not** by filename. The filename `rolling_rainbow.ts` is only used by the registry's file discovery — the runtime key is the string in `name: 'Rolling Rainbow'`.

# Categories

## `shine`

Animated colored bands that travel across an asset in a periodic, looping pattern. Useful for sword glints, rolling rainbows, expanding shockwaves, and similar decorative passes. See [`shine.md`](./shine.md) for the full parameter reference, the cycle-length formula, and how each parameter affects the render.

Templates currently shipped:

- `Rolling Rainbow` — seven colored bands tiling a 700 px cycle, used by `platform_0` and `block_square` to make solid blocks visibly cycle through the rainbow.
- `Black Streak` — a single black band sweeping across, with blank time between repetitions.
- `White Streak` — same shape as Black Streak with a white band and a steeper skew.
- `Tiger Shnig` — orange-and-black bands at staggered speeds, producing a layered "tiger stripes" pass.

No other effect category exists yet. New categories (e.g. `particles`, `glow`, `distortion`) would each get their own subfolder, registry file, and renderer class following the shape established by `shine`.

# How Effects Work in Code

The runtime split mirrors the rest of the codebase: configs are pure data; a single class per category handles rendering.

### `src/components/PlatformerGame/config/effects/<category>/`

- **`index.ts`** — registry. Uses `require.context` to auto-import every `*.ts` file in the folder (except `index.ts` itself) and keys each effect by its `name`. This is what lets assets reference an effect by string name.
- Per-effect files (e.g. `rolling_rainbow.ts`, `black_streak.ts`) — each exports a `default` object matching that category's schema.

### `src/components/PlatformerGame/game/effects/<Category>Effect.ts`

Each category has one renderer class. Today that is `ShineEffect`, which owns the per-instance rendering for one shine on one target. The class:

1. Wires up a `Phaser.GameObjects.Graphics` overlay and a geometry mask, so the effect is clipped to the asset's bounds and follows the asset as it moves.
2. Resolves the config (merging defaults with per-wave overrides, parsing colors, filling in numeric defaults).
3. Is `update()`'d once per frame by `MainScene`.

See [`shine.md`](./shine.md#how-it-works-in-code) for the details specific to shine rendering.

### `src/components/PlatformerGame/game/scenes/MainScene.ts`

The scene is the only place that knows about effect application:

- Imports each category registry (currently `shineEffects`) and each renderer class (currently `ShineEffect`).
- Holds an `effects: ShineEffect[]` list and ticks each one in `update()`.
- A private `applyEffects(target, effects, source)` helper walks an asset's `effects` array; for every `{ shine: "Some Name" }` entry, it looks up the config in the matching registry and instantiates the matching renderer class bound to `target`. The helper is invoked for the player (from `player.ts`) and for each pixel-drawn object (from each object's config).
- Unknown effect names log a warning naming the referring file, so typos surface quickly.

When a new category is added, the same pattern repeats: import its registry, import its renderer class, and add another branch to `applyEffects` that recognizes the new key (e.g. `entry.particles`).

# Adding a New Effect

To add a new template inside an existing category:

1. Create `config/effects/<category>/<your_name>.ts` exporting a `default` object that matches the category's schema. Make sure the `name` field is unique within the folder.
2. Reference it from any asset's `effects` list with `{ <category>: "<Your Name>" }`, matching the `name` field exactly.
3. No imports or registrations are needed — the category's `index.ts` picks the file up at build time via `require.context`.

To add a whole new effect **category**:

1. Create `config/effects/<new_category>/` with an `index.ts` mirroring `config/effects/shine/index.ts` (auto-discovery by `name`).
2. Create `game/effects/<NewCategory>Effect.ts` with a renderer class exposing a constructor `(scene, target, config)` and an `update()` method.
3. Extend `MainScene.applyEffects` to recognize entries keyed by the new category name and instantiate the renderer.
4. Add per-category documentation alongside this file.
