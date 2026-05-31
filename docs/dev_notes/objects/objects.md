# Objects Overview

An `object` is any non-character, non-item entity that lives in the world: platforms, blocks, chests, doors, signs, decorations, hazards, NPC triggers, etc. Objects have a position in a `zone`, a visible representation, and (optionally) physical solidity, interactability, loot, animations, and sound.

Object **templates** live in `config/objects/` — one file per object kind. A template describes how the object looks and behaves wherever it appears. To place instances of an object in the world, a `zone` lists them under its `objects:` array with a position (see [`../zones/zones.md`](../zones/zones.md)). The zone entry may also override any template field for that specific instance (per the hierarchy rule in `config/zones/CLAUDE.md`).

# How Object Templates Are Discovered

`config/objects/index.ts` is an auto-discovery registry. It uses `require.context` to import every `*.ts` file in the folder (except `index.ts` itself) and keys each object by its **filename** (without `.ts`). For example, `config/objects/platform_0.ts` is registered under the key `platform_0`, which is what a zone entry's `objectName: "platform_0"` resolves against.

Adding a new object kind is just: create `config/objects/<your_name>.ts` exporting a `default` matching the template shape below. No manual registration is needed.

> Note: object lookup is by **filename**, not by `identity.objectName`. They should match by convention — `platform_0.ts` has `objectName: "platform_0"` — but the registry key is purely filename-derived.

# Object Template Shape

Every template exports a `default` object with the following sections. All sections are present in current templates as placeholders; only the fields actually consumed by `MainScene` today are described as live, and the rest are reserved for future systems (loot, interaction, animation, audio).

## `identity`

Who/what the object is. Used for resolution, debug labels, and behavior dispatch later.

- **`objectName`** — string. Conventional duplicate of the filename. Used for debug logs and as the canonical name when listing the object.
- **`displayName`** — string. Human-readable label intended for UI (e.g. interaction prompts, inventory). Not yet rendered.
- **`description`** — string. Short prose description of the object. Intended for tooltips/inspectors. Not yet rendered.
- **`type`** — one of `"container" | "door" | "decoration" | "hazard" | "npc_trigger" | "platform"`. Categorizes the object so a future dispatch can route behavior (e.g. only `container` triggers loot). Not yet branched on; today every type renders the same way.
- **`interactable`** — boolean. When `true`, the player can press the interact key while in range to trigger the object. Not yet wired up.
- **`solid`** — boolean. **Live.** When `true`, the object is added to the platforms static physics group and the player collides with it. When `false` or absent, the object is purely decorative and the player passes through.
- **`interactionPrompt`** — string. Hint text shown near the object when the player is in range (e.g. `"Press E to open"`). Not yet rendered.

## `drawing_style_options` / `drawing_style`

How the object's visible body is drawn.

- **`drawing_style_options`** — array of supported styles for this object. Acts as a menu of valid choices; not consumed by render today.
- **`drawing_style`** — **live.** One of `"draw_pixels" | "sprite_sheet"`. Selects the render path in `MainScene`:
  - `"draw_pixels"` — the object is drawn as a single colored rectangle of `size.width × size.height` filled with `colors[0]`. This is what `platform_0` and `block_square` use today.
  - `"sprite_sheet"` — reserved for animated sprite-based rendering using the `sprites` block below. **Not yet implemented in `MainScene`** — there is a TODO branch.

## `size`

Default size of the rendered body in pixels.

- **`width`** — pixel width. Used as the rectangle's width in `draw_pixels`, or as the scaled sprite width in `sprite_sheet`. Can be overridden by the zone entry's `width`.
- **`height`** — pixel height. Same as above.

Phaser anchors rectangles at their **center**, so a zone entry's `(x, y)` places the center of a `width × height` body. (See [`../zones/zones.md`](../zones/zones.md#coordinate-conventions).)

## `sprites`

Sprite-sheet asset references for the `sprite_sheet` drawing style. **None of these are consumed yet** — they are reserved for the sprite renderer.

- **`sheet`** — path to the spritesheet PNG.
- **`frameWidth`** / **`frameHeight`** — frame dimensions inside the sheet.
- **`scale`** — render scale applied to the sprite.
- **`closedFrameIndex`** / **`openFrameIndex`** — example state-frame indices used by container-style objects.

## `colors`

Palette for `draw_pixels` rendering. A record of color slots keyed by either an integer (planned for indexed pixel art) or a name (e.g. `primary`).

- **`colors[0]`** — **live.** Primary fill color for `draw_pixels`. `MainScene` resolves the final fill as `entry.color ?? obj.colors[0] ?? obj.colors.primary ?? "#ffffff"`, so:
  - Zone overrides win.
  - The numeric `0` slot is the preferred default for newer objects (`platform_0`, `block_square`).
  - The named `primary` slot is the fallback used by older chest-style templates.
  - White is the final fallback if nothing is specified.
- Higher-indexed slots (`colors[1]`, `colors[2]`, …) are reserved for future multi-color pixel rendering.

## `animations`

Reserved for sprite-sheet animation definitions (e.g. `open`, `idle`). Not yet consumed.

- **`open` / `idle` / …** — each defines `frameStart`, `frameEnd`, `frameRate`, `loop`. Used by Phaser's animation system when the sprite-sheet renderer is implemented.

## `effects`

**Live.** Array of decorative overlays to apply to every instance of this object. Each entry is a single-key object like `{ shine: "Rolling Rainbow" }`. See [`../effects/effects.md`](../effects/effects.md) for how the effects system works and which keys are supported.

In `MainScene`, `applyEffects(target, obj.effects, "objects/<file>.ts")` walks this array after the body is drawn, looks up each effect in its category registry, and instantiates the matching renderer (e.g. `ShineEffect`) bound to the rectangle. Unknown effect names log a warning naming the source file.

`platform_0` and `block_square` both use `{ shine: 'Rolling Rainbow' }` today, which is why their bodies cycle through the rainbow on screen.

## `behavior`

Reserved per-object behavior fields. **None are consumed yet** but they're shaped to drive future systems:

- **`oneTimeUse`** — boolean. Object only triggers once per session.
- **`respawnAfter`** — number. Seconds after being consumed/looted before the object reappears. `0` = never.
- **`blocksMovement`** — boolean. Future redundancy with `identity.solid`; intended for objects that block in some states but not others.
- **`triggerRadius`** — number. Pixel radius around the object's center within which the player must be to interact.

## `loot`

Reserved drop-table definition for container-style objects. **Not yet consumed.**

- **`dropTable`** — array of `{ itemName, chance }` entries. `chance` is 0–1.
- **`minItems`** / **`maxItems`** — clamp on how many entries are rolled.

## `audio`

Reserved sound hooks. **Not yet consumed.**

- **`interactionSound`** — path to a one-shot SFX played on interact.
- **`ambientSound`** — path to a looping ambient layer played while the object is in range.

# Currently Implemented Templates

- **`platform_0`** — 100 × 20 white `draw_pixels` platform, `solid: true`, decorated with `Rolling Rainbow`. Used as the basic ground tile in `NightDelay0` and `config_entrance`.
- **`block_square`** — 100 × 100 white `draw_pixels` block, `solid: true`, decorated with `Rolling Rainbow`. Used as a stackable cube in `NightDelay0`.

Both are pixel-drawn rectangles whose only difference is `size`. They demonstrate the minimum viable template: identity, drawing style, size, a color, and an effect.

# How Objects Are Rendered in Code

The rendering path lives in `src/components/PlatformerGame/game/scenes/MainScene.ts`. On `create()`:

1. The current zone is resolved from `global.world.startingZone` against the `zones` registry.
2. `zone.geometry.platforms ?? []` is rendered first as raw colored rectangles into a static physics group called `this.platforms`. This is the legacy "platforms defined directly on the zone" path.
3. `zone.objects ?? []` is then iterated. For each entry:
   - The template is looked up by `entry.objectName` against the `objects` registry. Missing templates log a warning and are skipped.
   - The effective values are computed with the hierarchy rule (zone entry wins over template defaults):
     - `width  = entry.width  ?? obj.size.width`
     - `height = entry.height ?? obj.size.height`
     - `color  = entry.color  ?? obj.colors[0] ?? obj.colors.primary ?? "#ffffff"`
     - `solid  = entry.solid  ?? obj.identity.solid ?? false`
   - Render branches on `obj.drawing_style`:
     - `"draw_pixels"` → `this.add.rectangle(entry.x, entry.y, width, height, hexToNumber(color))`.
     - `"sprite_sheet"` → TODO; nothing is rendered.
   - If `solid`, the rectangle is given a static physics body and added to `this.platforms`, which is already wired to the player's collider — so collision is automatic with no extra wiring per object.
   - `applyEffects(rect, obj.effects ?? [], "objects/<entry.objectName>.ts")` is called to instantiate any decorative overlays from the template's `effects` array.

All visible objects share the same physics group, so the player's existing collider covers any object marked `solid: true` regardless of which template defined it.

# Adding a New Object

1. Create `config/objects/<your_name>.ts` exporting a `default` matching the template shape above. The minimum fields needed for it to render are `identity`, `drawing_style`, `size`, `colors`. Add `effects: []` if you want overlays.
2. Reference it from any zone's `objects:` array as `{ objectName: "<your_name>", x: <px>, y: <px> }`. Optional overrides: `width`, `height`, `color`, `solid`.
3. No imports or registrations are needed — `config/objects/index.ts` picks the file up at build time.

If your object needs gameplay behavior beyond "solid body" (interaction, loot, animation, audio), those systems aren't wired up yet — the corresponding template fields are placeholders waiting for their renderers/dispatchers.
