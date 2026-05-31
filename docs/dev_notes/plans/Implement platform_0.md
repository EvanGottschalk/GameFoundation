# Implement `platform_0` — Plan

## Goal

Make zone files in `config/zones/` able to spawn object instances by name from `config/objects/`, where each object's own config supplies its **size, color, drawing style, and physical behavior**, and the zone entry supplies its **position** (and may override any object-level value).

The concrete success criterion is: with `NightDelay0.ts` listing `{ objectName: "platform_0", x: 500, y: 100 }` in its `objects` array, the game renders a single 100×20 white solid platform centered at (500, 100) in that zone, and the player can stand on it. No other behavior in the zone changes.

## Current state

- `config/objects/platform_0.ts` exists and defines:
  - `identity.solid: true`
  - `drawing_style: 'draw_pixels'`
  - `size: { width: 100, height: 20 }`
  - `colors: { 0: "#ffffff" }`
- `config/zones/NightDelay0.ts` has:
  - `objects: [ { objectName: "platform_0", x: 500, y: 100 } ]`
  - `geometry.platforms` commented out (empty)
- `game/scenes/MainScene.ts` only knows how to render `zone.geometry.platforms[]` and **does not yet read `zone.objects[]`** for rendering/physics. With `NightDelay0` selected as the starting zone, the current code will throw at `for (const plat of zone.geometry.platforms)` because `platforms` is `undefined`.
- `config/zones/index.ts` auto-discovers zone files via `require.context`. There is **no equivalent `config/objects/index.ts`** yet.

## Design decisions (please confirm)

1. **Coordinate anchoring** — Phaser's `add.rectangle(x, y, w, h)` treats `(x, y)` as the rectangle's **center**. Existing `zone_overworld.platforms` clearly use centered coordinates (e.g. `{ x: 640, y: 696, width: 1280, height: 48 }` to span the canvas). The plan adopts the same convention for `zone.objects[].{x, y}` — they are the **center** of the rendered object. (Easy to flip to top-left later if you prefer; just say the word.)
2. **Color key for `draw_pixels`** — `platform_0.ts` uses `colors: { 0: "#ffffff" }` (numeric key `0`), whereas existing `object_chest.ts` uses `colors: { primary: "#92400e" }`. The plan treats `colors[0]` as the "base" color for the `draw_pixels` drawing style, with `colors.primary` as a fallback so existing objects keep working. This leaves room for future indexed pixel-art palettes (`colors[1]`, `colors[2]`, …).
3. **Hierarchy rule** — Per `config/zones/CLAUDE.md`, zone-level fields outrank asset-level fields. The plan supports optional per-spawn overrides on a zone entry: `{ objectName, x, y, width?, height?, color?, solid? }`. If absent, the object's own values are used. `platform_0`'s entry uses none of these, so it draws at the object's defaults.

## Open question (need your answer before implementing)

- **`platform_0.ts` describes itself as a `type: "container"`** with leftover chest comments at the top. That looks like the file was cloned from `object_chest.ts` and the `type` field wasn't updated. Should I change `identity.type` to `"decoration"` (or introduce a new `"platform"` type) as part of this work, or leave the value alone? It does not affect rendering today, but it will matter once `type`-driven behavior (interaction prompts, loot, etc.) is wired up.

## Implementation steps

### 1. Create an objects registry — `config/objects/index.ts`

Mirror `config/zones/index.ts` exactly so new object files are auto-discovered:

```ts
// Object registry — auto-discovers every object file in this folder and keys them by filename.
type ObjectModule = { default: unknown };

const ctx = (
  require as unknown as {
    context: (
      directory: string,
      useSubdirectories?: boolean,
      regExp?: RegExp,
    ) => { keys: () => string[]; (id: string): ObjectModule };
  }
).context("./", false, /^\.\/(?!index\.)[A-Za-z0-9_]+\.ts$/);

const objects: Record<string, unknown> = {};
for (const key of ctx.keys()) {
  const name = key.replace(/^\.\//, "").replace(/\.ts$/, "");
  objects[name] = ctx(key).default;
}

export type ObjectName = string;
export default objects;
```

This keeps the "drop a file and it's picked up" contract that already exists for zones.

### 2. Define the object config shape in `MainScene.ts`

Add a `ObjectConfig` type alongside the existing `ZoneConfig`:

```ts
type ObjectConfig = {
  identity: { objectName: string; solid?: boolean };
  drawing_style: "draw_pixels" | "sprite_sheet";
  size: { width: number; height: number };
  colors: Record<string | number, string>;
};

type ZoneObjectEntry = {
  objectName: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  color?: string;
  solid?: boolean;
};
```

Loosen `ZoneConfig` so `geometry.platforms` is optional (`platforms?: ReadonlyArray<...>`) and add `objects?: ReadonlyArray<ZoneObjectEntry>`.

### 3. Make `geometry.platforms` rendering defensive

In `MainScene.create()`, change:

```ts
for (const plat of zone.geometry.platforms) { ... }
```

to:

```ts
for (const plat of zone.geometry.platforms ?? []) { ... }
```

This is the minimum fix needed for `NightDelay0` (which has no `platforms`) to stop throwing.

### 4. Add the object loader in `MainScene.create()`

Immediately after the platforms loop, add a parallel loop over `zone.objects ?? []`. For each entry:

1. **Resolve the object config** by name from the new `objects` registry. If missing, `console.warn(...)` and skip — same pattern used for missing shine effects (`MainScene.ts:96-100`).
2. **Compute the effective values** using the hierarchy rule (zone entry wins over object defaults):
   - `width = entry.width  ?? object.size.width`
   - `height = entry.height ?? object.size.height`
   - `color = entry.color  ?? object.colors[0] ?? object.colors.primary ?? "#ffffff"`
   - `solid = entry.solid  ?? object.identity.solid ?? false`
3. **Branch on `object.drawing_style`**:
   - `"draw_pixels"` → `this.add.rectangle(entry.x, entry.y, width, height, hexToNumber(color))`. This matches exactly how `zone.geometry.platforms` are drawn today, so platform_0 looks identical to the existing platforms by construction.
   - `"sprite_sheet"` → leave a `// TODO` branch; not needed for this task and out of scope.
4. **Apply physics if solid**: `this.physics.add.existing(rect, true)` then `this.platforms.add(rect)`. Reusing the existing `this.platforms` static group means the existing `this.physics.add.collider(this.playerRect, this.platforms)` call (already on line 81) covers the new platform with zero extra wiring — the player can stand on it immediately.

Pseudocode for the new block (drop in after the existing platforms loop, before the player creation block):

```ts
const objectsRegistry = objects as Record<string, ObjectConfig | undefined>;
for (const entry of (zone.objects ?? []) as ReadonlyArray<ZoneObjectEntry>) {
  const obj = objectsRegistry[entry.objectName];
  if (!obj) {
    console.warn(
      `Object "${entry.objectName}" referenced in zone "${zone.identity.zoneName}" was not found in /config/objects/.`,
    );
    continue;
  }
  const width  = entry.width  ?? obj.size.width;
  const height = entry.height ?? obj.size.height;
  const color  = entry.color  ?? obj.colors[0] ?? (obj.colors as any).primary ?? "#ffffff";
  const solid  = entry.solid  ?? obj.identity.solid ?? false;

  if (obj.drawing_style === "draw_pixels") {
    const rect = this.add.rectangle(entry.x, entry.y, width, height, hexToNumber(color));
    if (solid) {
      this.physics.add.existing(rect, true);
      this.platforms.add(rect);
    }
  } else {
    // TODO: sprite_sheet drawing style — not needed for platform_0
  }
}
```

### 5. Import the registry at the top of `MainScene.ts`

```ts
import objects from "../../config/objects";
```

### 6. No changes required to

- `platform_0.ts` (modulo the open question about `identity.type`)
- `NightDelay0.ts`
- `config/zones/index.ts`
- `global.ts`
- `player.ts`

## Files touched (summary)

| File | Change |
| --- | --- |
| `src/components/PlatformerGame/config/objects/index.ts` | **New.** Auto-discovery registry mirroring `config/zones/index.ts`. |
| `src/components/PlatformerGame/game/scenes/MainScene.ts` | Add `objects` import, `ObjectConfig` + `ZoneObjectEntry` types, make `geometry.platforms` optional, add `zone.objects` loop with `draw_pixels` + solid-physics branch. |

That's it. The whole feature is one new index file and one localized addition to `MainScene.create()`.

## Test plan

After implementation, with `global.world.startingZone === "NightDelay0"`:

1. **Visible at correct position/size/color.** The black NightDelay0 background shows a single 100×20 white rectangle centered at (500, 100). No other platforms.
2. **Solid collision works.** Walk the player under it and jump (`↑`). The player's head hits the underside of the platform and they fall back down. Walk the player onto a position where they can land on top (may require approaching from above via spawn relocation or just observing from below first) — verify they stand on it instead of falling through.
3. **Other zones unaffected.** Temporarily switch `global.world.startingZone` to `zone_overworld` (or whatever you have running locally) — its `geometry.platforms` still render the same as before, because the new loop is purely additive.
4. **Missing-object safety.** Add a bogus entry like `{ objectName: "does_not_exist", x: 0, y: 0 }` to `NightDelay0.objects`, reload, confirm a console warning fires and the game still loads. Then remove the bogus entry.
5. **Override hierarchy.** Add `width: 300` to the `platform_0` entry in `NightDelay0`, reload, confirm the rendered platform is 300×20 (zone override wins). Then remove the override.
6. **`draw_pixels === draw_pixels`.** Pixel-diff a `platform_0` rendered via the new path against an equivalent `geometry.platforms` entry with the same x/y/w/h/color — they should be visually indistinguishable, since both go through `this.add.rectangle(...)` with the same arguments.

## Out of scope

- `sprite_sheet` drawing style (stubbed as TODO).
- Interaction prompts / loot / animations / audio fields on objects — `platform_0` doesn't use them and the existing `MainScene` doesn't process them for any object yet.
- A general "object type → behavior" dispatch (containers vs. doors vs. hazards). That's a larger feature and should land separately.
- Per-object solid-vs-passable distinction for sprite-sheet objects (will follow naturally from step 4's `solid` branch once sprite-sheet rendering exists).
