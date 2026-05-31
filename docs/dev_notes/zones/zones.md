# Zones Overview

A `zone` is a single "place" in the game — a self-contained setting that fills the screen behind any menu UI. Examples: an overworld plain, a dungeon room, the entrance to the `config` folder. When the player is in a zone, that zone's config controls everything they see and walk on: background color, parallax layers, ambient lighting, physics (gravity, water), the objects/NPCs/items present, the background music, and the doorways that move the player to other zones.

Zone **definitions** live in `config/zones/` — one file per zone. The zone the player loads into on game start is set by `global.world.startingZone` in `config/global.ts`.

# How Zones Are Discovered

`config/zones/index.ts` is an auto-discovery registry. It uses `require.context` to import every `*.ts` file in the folder (except `index.ts` itself) and keys each zone by its **filename** (without `.ts`). For example, `NightDelay0.ts` registers under the key `NightDelay0`. The starting zone string in `global.ts` is matched against these keys.

Adding a new zone is just: create `config/zones/<your_name>.ts` exporting a `default` matching the shape below. No manual registration is needed.

> Note: zone lookup is by **filename**, not by `identity.zoneName`. They should match by convention but the registry key is purely filename-derived. If `global.world.startingZone` does not match a filename, `MainScene` throws with the list of available zones.

# The Hierarchy Rule

Per `config/zones/CLAUDE.md`: **features defined in a zone have higher authority than features defined in any individual asset.** Zone-specific modifications always take priority over template defaults. In practice this means a zone may:

1. **List** which assets appear in it (`objects`, `items`, `npcs`).
2. **Override** any field on a given instance: position, size, color, solidity, dialogue, etc.

The asset's own config provides the defaults; the zone's entry overrides any of them on a per-placement basis. This is what lets a single `platform_0` template be reused as both a 100×20 floor tile and (with `width: 300`) a stretched ledge in the same zone.

# Zone Template Shape

Every zone exports a `default` object with the following sections. Some sections are fully wired through `MainScene` today; others are placeholders the schema reserves for future systems. Each field below is annotated with whether it is **live** (consumed at render time) or **reserved**.

## `identity`

What the zone is.

- **`zoneName`** — string. Conventional duplicate of the filename. Used as the on-screen HUD label (`Zone: ...`) and in error messages. **Live** for HUD display.
- **`displayName`** — string. Human-readable label for UI. Reserved.
- **`zoneType`** — one of `"outdoor" | "indoor" | "dungeon"`. Categorizes the zone for future logic (e.g. weather only outdoors). Reserved.
- **`description`** — short prose description for inspectors/tooltips. Reserved.

## `playerSpawn`

Where the player appears when this zone is loaded.

- **`x`** / **`y`** — **live.** Pixel coordinates of the player's spawn. The player rectangle is created at this position.
- **`facing`** — `"left" | "right"`. Reserved (player has no directional sprite yet, so facing is not used).

## `geometry`

Raw "platforms drawn directly by the zone" rectangles. This is the legacy path that predates the `objects` registry — useful for one-off level geometry that doesn't warrant an object template.

- **`platforms`** — **live (optional).** Array of `{ x, y, width, height, color }`. `(x, y)` is the **center** of each rectangle. Each one is drawn as a colored rectangle and added to the same physics group as zone-spawned objects, so the player collides with all of it uniformly. If omitted (as in `NightDelay0` and `config_entrance`), the zone simply renders no raw geometry — all level pieces come from `objects` instead.

## `appearance`

Visual backdrop of the zone.

- **`backgroundColor`** — **live.** Hex string set as the camera's background color (`this.cameras.main.setBackgroundColor`). It is the bottom layer behind everything else.
- **`parallaxLayers`** — reserved. Array of `{ imagePath, scrollFactor }`. Intended to render scrolling background images at different parallax speeds. Not yet rendered.
- **`ambientLightColor`** / **`ambientLightIntensity`** — reserved. Intended to tint and darken the zone for time-of-day/lighting effects. Not yet applied.

## `physics`

Per-zone physics overrides. Lets a single zone diverge from `global.physics` without changing the global default.

- **`gravityOverride`** — reserved. Number in px/s² (or `null` to use `global.physics.gravity`). Not yet read.
- **`hasWater`** — reserved. When `true`, the zone has water bodies with their own drag.
- **`waterDragFactor`** — reserved. Drag multiplier applied while submerged.

## `npcs`

NPC placements for the zone. Each entry resolves a character template (from `config/characters/`) by name and gives it a position and facing.

- **`{ characterName, x, y, facing }`** — reserved. The character templates exist (`npc_villager`, `npc_merchant`, `npc_guard`) but `MainScene` does not yet iterate this array, so NPCs are not rendered.

## `items`

Item placements for the zone. Same pattern as `npcs`, resolving an item template from `config/items/` by name.

- **`{ itemName, x, y }`** — reserved. Item templates (`item_coin`, `item_health_potion`, `item_sword`) exist but are not yet rendered or pick-uppable.

## `objects`

**Live.** Object placements for the zone. Each entry resolves an object template by filename (against `config/objects/`) and places an instance at the given position. This is the primary way to build level geometry today; both `NightDelay0` and `config_entrance` use it.

Entry shape: `{ objectName, x, y, width?, height?, color?, solid? }`.

- **`objectName`** — required. Looked up against `config/objects/index.ts`. Unknown names log a warning and are skipped.
- **`x`** / **`y`** — required. Pixel coordinates of the **center** of the rendered body (Phaser's rectangle origin is center). See [Coordinate conventions](#coordinate-conventions) below.
- **`width`** / **`height`** / **`color`** / **`solid`** — optional **overrides** of the template's defaults. When present, they win per the hierarchy rule. Omitted fields fall back to the template (`obj.size.width`, `obj.colors[0] ?? obj.colors.primary ?? "#ffffff"`, `obj.identity.solid`, etc.).

See [`../objects/objects.md`](../objects/objects.md) for the full template shape and the rendering branches in `MainScene`.

## `audio`

Reserved. Per-zone music and ambient sound configuration.

- **`backgroundMusic`** — path to a BGM track.
- **`ambientSound`** — path to a looping ambient layer.
- **`musicLoopStart`** — seconds into the track where the loop point sits.
- **`musicVolumeOverride`** — per-zone music volume (`null` = use global).

None of these are played yet; no audio system has been wired up.

## `transitions`

Reserved. Trigger regions that move the player to another zone when they walk into them.

- **`{ toZone, triggerX, triggerY, triggerWidth, triggerHeight }`** — destination zone key plus a rectangular trigger area. Intended to drive `scene.start(...)` with a fade using `global.timing.sceneTransitionDuration`. Not yet implemented.

# Coordinate Conventions

All `(x, y)` coordinates in zone configs (player spawn, `geometry.platforms`, `objects`, future `npcs` / `items`) are in **pixels from the top-left of the zone**, and they specify the **center** of the rendered body, not its top-left corner. This matches Phaser's `add.rectangle(x, y, w, h)` origin behavior, and is consistent across legacy `geometry.platforms` and the newer `objects` path.

# Currently Implemented Zones

- **`NightDelay0`** — open "overworld"-style zone with a black background, a full row of `platform_0` tiles at y=710 forming a 1500-px-wide floor, a couple of mid-air `platform_0` ledges, and two `block_square` cubes at (300, 300) and (400, 300). NPCs and items are listed but not yet rendered. Parallax layers and ambient light are configured but not yet rendered.
- **`config_entrance`** — minimal "entrance to the config folder" indoor zone with the same row of floor tiles but no decorations, NPCs, items, or transitions. This is what `global.world.startingZone: "Config Entrance"` loads into on game start.

# How Zones Are Loaded in Code

The zone-loading path lives in `src/components/PlatformerGame/game/scenes/MainScene.ts`. On `create()`:

1. **Resolve the zone.** Read `globalConfig.world.startingZone` and look it up in the imported `zones` registry. If the key is missing, throw an error listing every available zone — this is what surfaces typos in the starting-zone string.
2. **Background.** Set the camera's background color from `zone.appearance.backgroundColor`.
3. **Legacy platforms.** Iterate `zone.geometry.platforms ?? []`. Each entry is drawn as a colored rectangle and added to a static physics group (`this.platforms`).
4. **Objects.** Iterate `zone.objects ?? []`. For each entry, resolve its template, compute effective values using the hierarchy rule, render via the template's `drawing_style`, add to the same `this.platforms` group if `solid`, and apply any decorative `effects`. (See [`../objects/objects.md`](../objects/objects.md#how-objects-are-rendered-in-code) for the full per-object render flow.)
5. **Player.** Create the player rectangle at `zone.playerSpawn.{x, y}` using sizes/colors from `playerConfig`. Cap its fall speed at `globalConfig.physics.terminalVelocity`. Add a collider against `this.platforms` so the player interacts with every solid surface — legacy or object — through a single collider call.
6. **Player effects.** Apply the player's own decorative effects from `playerConfig.effects`.
7. **HUD.** Render the zone name and the control hint as fixed text in the top-left.

`npcs`, `items`, `audio`, `transitions`, `appearance.parallaxLayers`, `appearance.ambientLight*`, and `physics.*` are all read off the zone object schematically but are **not yet iterated or applied** — they are the next set of systems to wire in.

# Adding a New Zone

1. Create `config/zones/<your_name>.ts` exporting a `default` matching the template shape above. The minimum fields needed for it to load are `identity`, `playerSpawn`, `appearance.backgroundColor`, and at least one solid surface (either a `geometry.platforms` entry or an `objects` entry referencing a `solid: true` template).
2. To make it the boot zone, set `global.world.startingZone` to your filename (without `.ts`).
3. No imports or registrations are needed — `config/zones/index.ts` picks the file up at build time.

If your zone needs NPCs, items, parallax, ambient lighting, water physics, music, or transitions, those systems aren't wired up yet — the corresponding zone fields are placeholders waiting for their renderers/dispatchers.
