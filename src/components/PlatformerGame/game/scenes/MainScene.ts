import Phaser from "phaser";
import globalConfig from "../../config/global";
import playerConfig from "../../config/player";
import zones from "../../config/zones";
import objects from "../../config/objects";
import items from "../../config/items";
import menus from "../../config/menus";
import { controls as controlsMapping, inputAssignments } from "../../config/controls";
import actions from "../../config/actions";
import shineEffects from "../../config/effects/shine";
import { ShineEffect } from "../effects/ShineEffect";
import {
  addToInventory,
  getInventory,
  onInventoryChange,
} from "../state/inventory";

const hexToNumber = (hex: string): number => parseInt(hex.replace("#", ""), 16);

type ZoneObjectEntry = {
  objectName: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  color?: string;
  solid?: boolean;
};

type ZoneConfig = {
  identity: { zoneName: string };
  appearance: { backgroundColor: string };
  playerSpawn: { x: number; y: number };
  geometry: {
    platforms?: ReadonlyArray<{
      x: number;
      y: number;
      width: number;
      height: number;
      color: string;
    }>;
  };
  objects?: ReadonlyArray<ZoneObjectEntry>;
};

type EffectEntry = { shine?: string };

type ShapeConfig = { name?: string };

type CollectItemConfig = {
  collectible?: boolean;
  removeFromScreen?: boolean;
  animation?: string;
  addToList?: string;
};

type OnPlayerContactConfig = {
  animation?: string;
  collect_item?: CollectItemConfig;
};

type ObjectConfig = {
  identity: { objectName: string; solid?: boolean };
  drawing_style: "draw_pixels" | "sprite_sheet";
  size: { width: number; height: number };
  colors: Record<string | number, string>;
  shape?: ShapeConfig;
  effects?: ReadonlyArray<EffectEntry>;
  on_player_contact?: OnPlayerContactConfig;
};

type ItemConfig = {
  identity: { itemName: string };
  drawing_style?: "draw_pixels" | "sprite_sheet";
  size: { width: number; height: number };
  colors: Record<string | number, string>;
  shape?: ShapeConfig;
  effects?: ReadonlyArray<EffectEntry>;
};

type MenuListConfig = {
  name: string;
  contents: ReadonlyArray<string>;
  position: {
    x_alignment?: string;
    x_offset?: number | string;
    y_alignment?: string;
    y_offset?: number | string;
  };
  spacing?: number;
  maxItemsDisplayed?: number;
  itemImages?: { display?: boolean; width?: number };
  itemNames?: { display?: boolean; fontSize?: number };
};

type MenuConfig = { lists: ReadonlyArray<MenuListConfig> };

type ActionConfig = {
  name?: string;
  action_types: ReadonlyArray<string>;
};

// One resolved binding. The runtime chain is:
//   realInput  →  shortName       →  actionName              →  action.action_types
//   (key/gesture) (controls.ts key)  (controls.ts value =       (action_types drives
//                                     filename in /actions/)     gameplay dispatch)
type ControlBinding = {
  realInput: string;
  shortName: string;
  actionName: string;
  action: ActionConfig;
  key: Phaser.Input.Keyboard.Key;
};

function detectPlatform(): string {
  if (typeof navigator === "undefined") return "desktop";
  return /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? "mobile" : "desktop";
}

function resolveKeyboardKeyCode(realInput: string): number | null {
  const codes = Phaser.Input.Keyboard.KeyCodes as unknown as Record<string, number>;
  const code = codes[realInput.toUpperCase()];
  return typeof code === "number" ? code : null;
}

// Anchors a HUD coordinate to one of the canvas edges/center, then applies the offset.
function resolveAlignment(
  alignment: string | undefined,
  offset: number,
  total: number,
): number {
  if (alignment === "centered" || alignment === "center") return total / 2 + offset;
  if (alignment === "right" || alignment === "bottom") return total - offset;
  return offset; // "left" | "top" | undefined
}

const toNumber = (value: unknown, fallback: number): number => {
  const n = typeof value === "number" ? value : parseFloat(value as string);
  return Number.isFinite(n) ? n : fallback;
};

export class MainScene extends Phaser.Scene {
  private playerRect!: Phaser.GameObjects.Rectangle;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private hasDoubleJumped = false;
  private effects: ShineEffect[] = [];
  private bindings: ControlBinding[] = [];

  // Per-menu container holding the rendered item-image sprites. Children are wiped
  // and rebuilt every time the underlying inventory list changes.
  private inventoryListContainers: Record<string, Phaser.GameObjects.Container> = {};
  private inventoryUnsubscribers: Array<() => void> = [];

  constructor() {
    super({ key: "MainScene" });
  }

  create(): void {
    // Reset transient scene state in case the scene is restarted.
    this.effects = [];
    this.inventoryListContainers = {};
    for (const off of this.inventoryUnsubscribers) off();
    this.inventoryUnsubscribers = [];

    // Resolve which zone to load. The starting zone is configured in global.ts,
    // with a separate mobile override under world.mobile.startingZone.
    const platform = detectPlatform();
    const zoneName =
      platform === "mobile"
        ? globalConfig.world.mobile.startingZone
        : globalConfig.world.startingZone;
    const zone = zones[zoneName] as ZoneConfig | undefined;

    if (!zone) {
      const available = Object.keys(zones).join(", ") || "(none)";
      throw new Error(
        `Zone "${zoneName}" not found in /config/zones/. ` +
          `Make sure a file named "${zoneName}.ts" exists in /src/components/PlatformerGame/config/zones/. ` +
          `Available zones: ${available}.`,
      );
    }

    // --- Zone background ---
    this.cameras.main.setBackgroundColor(zone.appearance.backgroundColor);

    // --- Platforms (from zone.geometry.platforms) ---
    this.platforms = this.physics.add.staticGroup();
    for (const plat of zone.geometry.platforms ?? []) {
      const rect = this.add.rectangle(
        plat.x,
        plat.y,
        plat.width,
        plat.height,
        hexToNumber(plat.color)
      );
      this.physics.add.existing(rect, true);
      this.platforms.add(rect);
    }

    // --- Objects (from zone.objects, resolved against /config/objects/) ---
    // Collectibles need overlap detection against the player, but the player isn't
    // created until below. Stash them here and wire the overlaps once it exists.
    type PendingCollectible = {
      visual: Phaser.GameObjects.Shape;
      obj: ObjectConfig;
    };
    const pendingCollectibles: PendingCollectible[] = [];

    const objectsRegistry = objects as Record<string, ObjectConfig | undefined>;
    for (const entry of zone.objects ?? []) {
      const obj = objectsRegistry[entry.objectName];
      if (!obj) {
        console.warn(
          `Object "${entry.objectName}" referenced in zone "${zone.identity.zoneName}" was not found in /config/objects/.`,
        );
        continue;
      }

      // Zone entry overrides object defaults (per zones/CLAUDE.md hierarchy rule).
      const width = entry.width ?? obj.size.width;
      const height = entry.height ?? obj.size.height;
      const color =
        entry.color ?? obj.colors[0] ?? obj.colors.primary ?? "#ffffff";
      const solid = entry.solid ?? obj.identity.solid ?? false;

      if (obj.drawing_style !== "draw_pixels") {
        // TODO: sprite_sheet drawing style
        continue;
      }

      const visual = this.drawShape(
        entry.x,
        entry.y,
        width,
        height,
        color,
        obj.shape,
      );

      if (solid) {
        this.physics.add.existing(visual, true);
        this.platforms.add(visual);
      }

      this.applyEffects(
        visual,
        obj.effects ?? [],
        `objects/${entry.objectName}.ts`,
      );

      if (obj.on_player_contact?.collect_item?.collectible) {
        // Static physics body so we can detect overlap with the player.
        this.physics.add.existing(visual, true);
        pendingCollectibles.push({ visual, obj });
      }
    }

    // --- Player (appearance from player.ts, position from zone.playerSpawn) ---
    this.playerRect = this.add.rectangle(
      zone.playerSpawn.x,
      zone.playerSpawn.y,
      playerConfig.sprites.frameWidth,
      playerConfig.sprites.frameHeight,
      hexToNumber(playerConfig.colors.primary)
    );
    this.physics.add.existing(this.playerRect);

    const body = this.playerRect.body as Phaser.Physics.Arcade.Body;
    body.setMaxVelocityY(globalConfig.physics.terminalVelocity);
    body.setCollideWorldBounds(true);

    this.physics.add.collider(this.playerRect, this.platforms);

    // --- Effects (overlaid on the player, e.g. shine) ---
    this.applyEffects(this.playerRect, playerConfig.effects, "player.ts");

    // --- Collectibles: overlap → pickup ---
    for (const { visual, obj } of pendingCollectibles) {
      this.physics.add.overlap(this.playerRect, visual, () => {
        this.handleCollect(visual, obj);
      });
    }

    // --- Input bindings (resolved from /config/controls + /config/actions) ---
    this.bindings = this.buildControlBindings();

    // --- HUD ---
    const textStyle = { fontSize: "13px", color: "#e2e8f0", fontFamily: "monospace" };
    this.add.text(16, 16, `Zone: ${zone.identity.zoneName}`, { ...textStyle, fontSize: "16px" });
    this.renderControlsHud(textStyle);
    if (playerConfig.abilities.doubleJump) {
      this.add.text(16, 58, "(double jump enabled)", textStyle);
    }

    // --- Inventory HUD (always visible, redraws whenever the list changes) ---
    this.renderInventoryMenu("inventory_1");
  }

  // Draws a shape primitive (rectangle by default, circle for shape.name === "circle")
  // anchored at (x, y) with the given color. Both Rectangle and Arc subclass Shape, so
  // downstream code can apply effects/physics uniformly.
  private drawShape(
    x: number,
    y: number,
    width: number,
    height: number,
    color: string,
    shape: ShapeConfig | undefined,
  ): Phaser.GameObjects.Shape {
    const fill = hexToNumber(color);
    if (shape?.name === "circle") {
      const radius = Math.min(width, height) / 2;
      return this.add.circle(x, y, radius, fill);
    }
    return this.add.rectangle(x, y, width, height, fill);
  }

  private handleCollect(
    visual: Phaser.GameObjects.Shape,
    obj: ObjectConfig,
  ): void {
    const ci = obj.on_player_contact?.collect_item;
    if (!ci?.collectible) return;
    // Guard against the overlap callback firing again before destroy() takes effect.
    if (!visual.active) return;

    if (ci.addToList) {
      // By convention, the item name matches the source object's name. Look up the
      // item config (for the HUD render) once it lands in inventory.
      addToInventory(ci.addToList, obj.identity.objectName);
    }

    if (ci.removeFromScreen) {
      visual.destroy();
    }
  }

  private applyEffects(
    target: Phaser.GameObjects.Shape,
    effects: ReadonlyArray<EffectEntry>,
    source: string,
    options: { depth?: number } = {},
  ): void {
    const registry = shineEffects as Record<string, unknown>;
    for (const entry of effects) {
      if (typeof entry.shine === "string") {
        const shineConfig = registry[entry.shine];
        if (shineConfig) {
          this.effects.push(
            new ShineEffect(
              this,
              target,
              shineConfig as ConstructorParameters<typeof ShineEffect>[2],
              { depth: options.depth },
            ),
          );
        } else {
          console.warn(
            `Shine effect "${entry.shine}" referenced in ${source} was not found in /config/effects/shine/.`,
          );
        }
      }
    }
  }

  private buildControlBindings(): ControlBinding[] {
    const platform = detectPlatform();
    const assignment = inputAssignments[platform] ?? inputAssignments.desktop;
    if (!assignment) {
      console.warn(
        `No input assignment found for platform "${platform}" in /config/controls/. ` +
          `Add a file named "${platform}_input_assignment.ts" (or "desktop_input_assignment.ts" as a fallback).`,
      );
      return [];
    }

    const shortNameToAction = controlsMapping as unknown as Record<string, string>;
    const actionsRegistry = actions as Record<string, ActionConfig | undefined>;

    const bindings: ControlBinding[] = [];
    for (const [realInput, shortName] of Object.entries(assignment)) {
      if (!shortName) continue; // empty string in assignment = intentionally unbound

      const actionName = shortNameToAction[shortName];
      if (!actionName) {
        // Short name has no action wired up in controls.ts (empty string or missing). Silent skip.
        continue;
      }

      const action = actionsRegistry[actionName];
      if (!action) {
        console.warn(
          `Action "${actionName}" referenced in /config/controls/controls.ts ("${shortName}") was not found in /config/actions/.`,
        );
        continue;
      }

      const keyCode = resolveKeyboardKeyCode(realInput);
      if (keyCode === null) continue; // not a keyboard key (mobile gesture, etc.)

      const key = this.input.keyboard!.addKey(keyCode);
      bindings.push({ realInput, shortName, actionName, action, key });
    }
    return bindings;
  }

  private renderControlsHud(textStyle: Phaser.Types.GameObjects.Text.TextStyle): void {
    if (this.bindings.length === 0) return;
    const summary = this.bindings
      .map((b) => `${b.realInput}: ${b.action.name ?? b.actionName}`)
      .join("   ");
    this.add.text(16, 40, summary, textStyle);
  }

  // Looks up a menu config by filename key in /config/menus/ and renders each of its
  // lists. Each list's contents are sourced from the inventory namespace whose name
  // matches the menu file (e.g. /config/menus/inventory_1.ts → inventories["inventory_1"]).
  private renderInventoryMenu(menuName: string): void {
    const menu = (menus as Record<string, MenuConfig | undefined>)[menuName];
    if (!menu) return;

    for (const list of menu.lists) {
      const container = this.add.container(0, 0).setDepth(2000).setScrollFactor(0);
      this.inventoryListContainers[`${menuName}:${list.name}`] = container;

      const draw = () => this.drawInventoryList(menuName, list, container);
      draw();
      const off = onInventoryChange((changed) => {
        if (changed === menuName) draw();
      });
      this.inventoryUnsubscribers.push(off);
    }
  }

  private drawInventoryList(
    inventoryName: string,
    list: MenuListConfig,
    container: Phaser.GameObjects.Container,
  ): void {
    container.removeAll(true);

    const inventory = getInventory(inventoryName);
    const max = list.maxItemsDisplayed ?? inventory.length;
    const slotWidth = list.itemImages?.width ?? 48;
    const spacing = list.spacing ?? 0;
    const itemsRegistry = items as Record<string, ItemConfig | undefined>;

    const canvasWidth = this.scale.width;
    const canvasHeight = this.scale.height;
    const baseX = resolveAlignment(
      list.position.x_alignment,
      toNumber(list.position.x_offset, 0),
      canvasWidth,
    );
    const baseY = resolveAlignment(
      list.position.y_alignment,
      toNumber(list.position.y_offset, 0),
      canvasHeight,
    );

    for (let i = 0; i < inventory.length && i < max; i++) {
      const itemName = inventory[i];
      const item = itemsRegistry[itemName];
      const x = baseX + i * (slotWidth + spacing);
      const y = baseY;

      if (item && list.itemImages?.display !== false) {
        const color =
          item.colors[0] ?? item.colors.primary ?? "#ffffff";
        // Scale the item's intrinsic size down to the slot width.
        const scale = item.size.width > 0 ? slotWidth / item.size.width : 1;
        const w = item.size.width * scale;
        const h = item.size.height * scale;
        const visual = this.drawShape(x, y, w, h, color, item.shape);
        container.add(visual);
        // The HUD container renders at depth 2000; lift the shine above it so it's
        // not occluded by the item visual or by other HUD layers.
        this.applyEffects(
          visual,
          item.effects ?? [],
          `items/${itemName}.ts`,
          { depth: 3000 },
        );
      }

      if (item && list.itemNames?.display) {
        const label = this.add.text(x, y + slotWidth / 2 + 4, itemName, {
          fontSize: `${list.itemNames.fontSize ?? 10}px`,
          color: "#e2e8f0",
          fontFamily: "monospace",
        }).setOrigin(0.5, 0);
        container.add(label);
      }
    }
  }

  private collectActiveActions(): {
    held: ControlBinding[];
    justPressed: ControlBinding[];
  } {
    const held: ControlBinding[] = [];
    const justPressed: ControlBinding[] = [];
    for (const b of this.bindings) {
      if (b.key.isDown) held.push(b);
      if (Phaser.Input.Keyboard.JustDown(b.key)) justPressed.push(b);
    }
    return { held, justPressed };
  }

  update(): void {
    const body = this.playerRect.body as Phaser.Physics.Arcade.Body;
    const onGround = body.blocked.down;

    if (onGround) {
      this.hasDoubleJumped = false;
    }

    const { held, justPressed } = this.collectActiveActions();

    // Horizontal movement: every held binding whose action is "movement" votes
    // on direction via its short name ("left" / "right"). Opposing inputs cancel.
    let moveDir = 0;
    for (const b of held) {
      if (!b.action.action_types.includes("movement")) continue;
      if (b.shortName === "left") moveDir -= 1;
      else if (b.shortName === "right") moveDir += 1;
    }
    if (moveDir < 0) {
      body.setVelocityX(-playerConfig.physics.speed);
    } else if (moveDir > 0) {
      body.setVelocityX(playerConfig.physics.speed);
    } else {
      body.setVelocityX(0);
    }

    const jumped = justPressed.some((b) => b.action.action_types.includes("jump"));
    if (jumped) {
      if (onGround) {
        body.setVelocityY(playerConfig.physics.jumpVelocity);
      } else if (playerConfig.abilities.doubleJump && !this.hasDoubleJumped) {
        body.setVelocityY(playerConfig.physics.jumpVelocity * 0.85);
        this.hasDoubleJumped = true;
      }
    }

    // Tick effects whose target is still alive; drop and destroy the rest. This
    // keeps Graphics from accumulating across inventory redraws (each pickup
    // tears down the previous HUD-item visuals and spawns fresh effects).
    const aliveEffects: ShineEffect[] = [];
    for (const effect of this.effects) {
      if (effect.isActive()) {
        effect.update();
        aliveEffects.push(effect);
      } else {
        effect.destroy();
      }
    }
    this.effects = aliveEffects;
  }
}
