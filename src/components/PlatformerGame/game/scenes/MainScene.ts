import Phaser from "phaser";
import globalConfig from "../../config/global";
import playerConfig from "../../config/player";
import zones from "../../config/zones";
import objects from "../../config/objects";
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

export class MainScene extends Phaser.Scene {
  private playerRect!: Phaser.GameObjects.Rectangle;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private hasDoubleJumped = false;
  private effects: ShineEffect[] = [];

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

    // --- HUD ---
    const textStyle = { fontSize: "13px", color: "#e2e8f0", fontFamily: "monospace" };
    this.add.text(16, 16, `Zone: ${zone.identity.zoneName}`, { ...textStyle, fontSize: "16px" });
    this.add.text(16, 40, "← → to move   ↑ to jump", textStyle);
    if (playerConfig.abilities.doubleJump) {
      this.add.text(16, 58, "↑↑ double jump enabled", textStyle);
    }

    // --- Input ---
    this.cursors = this.input.keyboard!.createCursorKeys();
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

  update(): void {
    const body = this.playerRect.body as Phaser.Physics.Arcade.Body;
    const onGround = body.blocked.down;

    if (onGround) {
      this.hasDoubleJumped = false;
    }

    if (this.cursors.left.isDown) {
      body.setVelocityX(-playerConfig.physics.speed);
    } else if (this.cursors.right.isDown) {
      body.setVelocityX(playerConfig.physics.speed);
    } else {
      body.setVelocityX(0);
    }

    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
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
