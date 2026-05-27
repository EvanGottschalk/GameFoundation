import Phaser from "phaser";
import globalConfig from "../../config/global";
import playerConfig from "../../config/player";
import displayConfig from "../../config/display";

export class MainScene extends Phaser.Scene {
  private playerRect!: Phaser.GameObjects.Rectangle;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private canDoubleJump = false;
  private hasDoubleJumped = false;

  constructor() {
    super({ key: "MainScene" });
  }

  create(): void {
    const W = displayConfig.window.width;
    const H = displayConfig.window.height;

    this.cameras.main.setBackgroundColor(globalConfig.colors.backgroundDefault);

    // --- Platforms ---
    this.platforms = this.physics.add.staticGroup();

    // Ground
    this.addPlatform(W / 2, H - 24, W, 48, 0x475569);

    // Mid platforms
    this.addPlatform(280, H - 180, 200, 20, 0x334155);
    this.addPlatform(700, H - 280, 260, 20, 0x334155);
    this.addPlatform(1050, H - 200, 180, 20, 0x334155);
    this.addPlatform(500, H - 380, 160, 20, 0x334155);

    // --- Player ---
    const playerColor = parseInt(playerConfig.colors.primary.replace("#", ""), 16);
    this.playerRect = this.add.rectangle(
      120,
      H - 80,
      playerConfig.sprites.frameWidth,
      playerConfig.sprites.frameHeight,
      playerColor
    );
    this.physics.add.existing(this.playerRect);

    const body = this.playerRect.body as Phaser.Physics.Arcade.Body;
    body.setMaxVelocityY(globalConfig.physics.terminalVelocity);
    body.setCollideWorldBounds(true);

    this.physics.add.collider(this.playerRect, this.platforms);

    // --- HUD text ---
    const textStyle = { fontSize: "13px", color: "#94a3b8", fontFamily: "monospace" };
    this.add.text(16, 16, "GameFoundation", { ...textStyle, color: "#e2e8f0", fontSize: "16px" });
    this.add.text(16, 40, "← → to move   ↑ to jump", textStyle);
    if (playerConfig.abilities.doubleJump) {
      this.add.text(16, 58, "↑↑ double jump enabled", textStyle);
    }

    // --- Input ---
    this.cursors = this.input.keyboard!.createCursorKeys();
  }

  update(): void {
    const body = this.playerRect.body as Phaser.Physics.Arcade.Body;
    const onGround = body.blocked.down;

    // Reset double-jump when landing
    if (onGround) {
      this.hasDoubleJumped = false;
      this.canDoubleJump = true;
    }

    // Horizontal movement
    if (this.cursors.left.isDown) {
      body.setVelocityX(-playerConfig.physics.speed);
    } else if (this.cursors.right.isDown) {
      body.setVelocityX(playerConfig.physics.speed);
    } else {
      body.setVelocityX(0);
    }

    // Jump (with Phaser.Input.Keyboard.JustDown to prevent hold-repeating)
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      if (onGround) {
        body.setVelocityY(playerConfig.physics.jumpVelocity);
      } else if (playerConfig.abilities.doubleJump && !this.hasDoubleJumped) {
        body.setVelocityY(playerConfig.physics.jumpVelocity * 0.85);
        this.hasDoubleJumped = true;
      }
    }
  }

  private addPlatform(x: number, y: number, w: number, h: number, color: number): void {
    const rect = this.add.rectangle(x, y, w, h, color);
    this.physics.add.existing(rect, true);
    this.platforms.add(rect);
  }
}
