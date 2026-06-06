import Phaser from "phaser";
import globalConfig from "../../config/global";
import playerConfig from "../../config/player";
import zones from "../../config/zones";
import objects from "../../config/objects";
import { controls as controlsMapping, inputAssignments } from "../../config/controls";
import actions from "../../config/actions";
import shineEffects from "../../config/effects/shine";
import { ShineEffect } from "../effects/ShineEffect";

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

type ObjectConfig = {
  identity: { objectName: string; solid?: boolean };
  drawing_style: "draw_pixels" | "sprite_sheet";
  size: { width: number; height: number };
  colors: Record<string | number, string>;
  effects?: ReadonlyArray<EffectEntry>;
};

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

// Picks which `<platform>_input_assignment.ts` file should be active. Platform keys
// are the file prefixes registered in /config/controls/index.ts.
function detectPlatform(): string {
  if (typeof navigator === "undefined") return "desktop";
  return /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? "mobile" : "desktop";
}

// Resolves a real-input name (e.g. "z", "left", "enter") to a Phaser keyboard key
// code via case-insensitive lookup on Phaser.Input.Keyboard.KeyCodes. Returns null
// for inputs that aren't keyboard keys (e.g. "swipe_up", "press_left_of_player"),
// so the keyboard handler can skip them without warning — a future touch handler
// can consume them.
function resolveKeyboardKeyCode(realInput: string): number | null {
  const codes = Phaser.Input.Keyboard.KeyCodes as unknown as Record<string, number>;
  const code = codes[realInput.toUpperCase()];
  return typeof code === "number" ? code : null;
}

export class MainScene extends Phaser.Scene {
  private playerRect!: Phaser.GameObjects.Rectangle;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private hasDoubleJumped = false;
  private effects: ShineEffect[] = [];
  private bindings: ControlBinding[] = [];

  constructor() {
    super({ key: "MainScene" });
  }

  create(): void {
    // Resolve which zone to load. The starting zone is configured in global.ts.
    const zoneName = globalConfig.world.startingZone;
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

      if (obj.drawing_style === "draw_pixels") {
        const rect = this.add.rectangle(
          entry.x,
          entry.y,
          width,
          height,
          hexToNumber(color),
        );
        if (solid) {
          this.physics.add.existing(rect, true);
          this.platforms.add(rect);
        }
        this.applyEffects(
          rect,
          obj.effects ?? [],
          `objects/${entry.objectName}.ts`,
        );
      } else {
        // TODO: sprite_sheet drawing style
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

    // --- Input bindings (resolved from /config/controls + /config/actions) ---
    this.bindings = this.buildControlBindings();

    // --- HUD ---
    const textStyle = { fontSize: "13px", color: "#e2e8f0", fontFamily: "monospace" };
    this.add.text(16, 16, `Zone: ${zone.identity.zoneName}`, { ...textStyle, fontSize: "16px" });
    this.renderControlsHud(textStyle);
    if (playerConfig.abilities.doubleJump) {
      this.add.text(16, 58, "(double jump enabled)", textStyle);
    }
  }

  private applyEffects(
    target: Phaser.GameObjects.Rectangle,
    effects: ReadonlyArray<EffectEntry>,
    source: string,
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

    for (const effect of this.effects) {
      effect.update();
    }
  }
}
