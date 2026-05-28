import Phaser from "phaser";

// Renders a "shine" effect: one or more colored bands ("waves") that periodically sweep across a target
// game object and fade out. A wave always traverses the full asset; `effect.width / wave.speed` sets how
// long one sweep takes (so width/speed are a "functional" travel length), while a wave's `width`, `feather*`
// and `height` are literal pixels. See docs/dev_notes/effects/shine.md.

type Orientation = "horizontal" | "vertical" | "radial";

interface ResolvedWave {
  color: number; // 0xRRGGBB
  opacity: number;
  start: number; // seconds before the wave first appears
  speed: number; // design px / second
  width: number; // design px — band thickness along the travel axis
  featherStart: number; // design px — alpha ramp at the trailing edge
  featherEnd: number; // design px — alpha ramp at the leading edge
  period: number; // seconds between sweeps
  orientation: Orientation;
  reverseDirection: boolean;
  angle: number; // degrees of skew (0 = perpendicular to travel)
}

interface ShineConfig {
  name: string;
  width: number; // design px — travel length
  height: number; // design px — 0 = cover the full asset across the band
  waveDefaults: Record<string, unknown>;
  waves?: ReadonlyArray<Record<string, unknown>>;
}

type ShineTarget = Phaser.GameObjects.Rectangle;

const hexToNumber = (hex: string): number => {
  const n = parseInt(hex.replace("#", ""), 16);
  return Number.isNaN(n) ? 0xffffff : n;
};

const num = (value: unknown, fallback: number): number =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

export class ShineEffect {
  private readonly scene: Phaser.Scene;
  private readonly target: ShineTarget;
  private readonly config: ShineConfig;
  private readonly waves: ResolvedWave[];
  private readonly overlay: Phaser.GameObjects.Graphics;
  private readonly maskGraphics: Phaser.GameObjects.Graphics;
  private readonly startMs: number;

  constructor(scene: Phaser.Scene, target: ShineTarget, config: ShineConfig) {
    this.scene = scene;
    this.target = target;
    this.config = config;
    this.waves = this.resolveWaves(config);
    this.startMs = scene.time.now;

    // Overlay holds the drawn bands and sits above the target.
    this.overlay = scene.add.graphics();
    this.overlay.setDepth(1000);

    // A geometry mask clips the bands to the target's bounds. Redrawing maskGraphics each frame moves the clip.
    this.maskGraphics = scene.make.graphics({}, false);
    this.maskGraphics.fillStyle(0xffffff);
    this.overlay.setMask(this.maskGraphics.createGeometryMask());
  }

  private resolveWaves(config: ShineConfig): ResolvedWave[] {
    const sources =
      config.waves && config.waves.length > 0 ? config.waves : [config.waveDefaults];

    return sources.map((source) => {
      const merged = { ...config.waveDefaults, ...source };
      const orientation = (merged.orientation as Orientation) ?? "horizontal";
      return {
        color: hexToNumber(typeof merged.color === "string" ? merged.color : ""),
        opacity: num(merged.opacity, 1),
        start: num(merged.start, 0),
        speed: num(merged.speed, config.width),
        width: num(merged.width, 20),
        featherStart: num(merged.featherStart, 0),
        featherEnd: num(merged.featherEnd, 0),
        period: num(merged.period, 5),
        orientation,
        reverseDirection: merged.reverseDirection === true,
        angle: num(merged.angle, 0),
      };
    });
  }

  update(): void {
    const elapsed = (this.scene.time.now - this.startMs) / 1000;
    const b = this.target.getBounds();

    // Move the clip region to track the target.
    this.maskGraphics.clear();
    this.maskGraphics.fillStyle(0xffffff);
    this.maskGraphics.fillRect(b.x, b.y, b.width, b.height);

    this.overlay.clear();
    for (const wave of this.waves) {
      const progress = this.waveProgress(wave, elapsed);
      if (progress === null) continue;
      if (wave.orientation === "radial") {
        this.drawRadial(wave, progress, b);
      } else {
        this.drawLinear(wave, progress, b);
      }
    }
  }

  // Returns the wave's sweep progress in [0, 1), or null if it is idle/not yet started this cycle.
  private waveProgress(wave: ResolvedWave, elapsed: number): number | null {
    const te = elapsed - wave.start;
    if (te < 0 || wave.speed <= 0) return null;
    const duration = this.config.width / wave.speed;
    if (duration <= 0) return null;
    const phase = te % wave.period;
    if (phase >= duration) return null;
    return phase / duration;
  }

  // Horizontal / vertical bands. Work in an (a, c) frame: `a` = travel axis, `c` = cross axis (0..crossSize).
  private drawLinear(wave: ResolvedWave, progress: number, b: Phaser.Geom.Rectangle): void {
    const horizontal = wave.orientation === "horizontal";
    const axisExtent = horizontal ? b.width : b.height;
    const crossSize =
      horizontal && this.config.height > 0
        ? Math.min(this.config.height, b.height)
        : horizontal
          ? b.height
          : b.width;

    const bandPx = wave.width; // literal pixels
    const half = bandPx / 2;
    const reach = axisExtent + bandPx; // full enter-and-exit travel across the asset
    const center = wave.reverseDirection
      ? axisExtent + half - progress * reach
      : -half + progress * reach;

    const shift = crossSize * Math.tan((wave.angle * Math.PI) / 180);
    const featherStartPx = wave.featherStart;
    const featherEndPx = wave.featherEnd;

    const mapAC = (a: number, c: number): number[] =>
      horizontal ? [b.x + a, b.y + c] : [b.x + c, b.y + a];

    const drawStrip = (a0: number, a1: number, alpha: number): void => {
      if (alpha <= 0) return;
      const p0 = mapAC(a0, 0);
      const p1 = mapAC(a1, 0);
      const p2 = mapAC(a1 + shift, crossSize);
      const p3 = mapAC(a0 + shift, crossSize);
      this.overlay.fillStyle(wave.color, alpha);
      this.overlay.fillPoints(
        [
          new Phaser.Geom.Point(p0[0], p0[1]),
          new Phaser.Geom.Point(p1[0], p1[1]),
          new Phaser.Geom.Point(p2[0], p2[1]),
          new Phaser.Geom.Point(p3[0], p3[1]),
        ],
        true,
      );
    };

    const bandStart = center - half;

    if (featherStartPx <= 0 && featherEndPx <= 0) {
      drawStrip(bandStart, bandStart + bandPx, wave.opacity);
      return;
    }

    // Feathered: split the band along its thickness and ramp alpha at the edges.
    const strips = Math.min(Math.max(Math.round(bandPx), 4), 32);
    const step = bandPx / strips;
    for (let i = 0; i < strips; i++) {
      const u = (i + 0.5) * step; // distance from trailing edge
      let f = 1;
      if (featherStartPx > 0) f = Math.min(f, u / featherStartPx);
      if (featherEndPx > 0) f = Math.min(f, (bandPx - u) / featherEndPx);
      drawStrip(bandStart + i * step, bandStart + (i + 1) * step, wave.opacity * Math.max(f, 0));
    }
  }

  // Radial bands: concentric rings expanding outward (or inward when reversed). Skew/angle do not apply.
  private drawRadial(wave: ResolvedWave, progress: number, b: Phaser.Geom.Rectangle): void {
    const cx = b.x + b.width / 2;
    const cy = b.y + b.height / 2;
    const maxRadius = 0.5 * Math.sqrt(b.width * b.width + b.height * b.height);

    const bandPx = wave.width; // literal pixels
    const half = bandPx / 2;
    const reach = maxRadius + bandPx;
    const center = wave.reverseDirection
      ? maxRadius + half - progress * reach
      : -half + progress * reach;

    const featherStartPx = wave.featherStart;
    const featherEndPx = wave.featherEnd;

    const drawRing = (radius: number, lineWidth: number, alpha: number): void => {
      if (radius <= 0 || lineWidth <= 0 || alpha <= 0) return;
      this.overlay.lineStyle(lineWidth, wave.color, alpha);
      this.overlay.strokeCircle(cx, cy, radius);
    };

    if (featherStartPx <= 0 && featherEndPx <= 0) {
      drawRing(center, bandPx, wave.opacity);
      return;
    }

    const strips = Math.min(Math.max(Math.round(bandPx), 4), 32);
    const step = bandPx / strips;
    for (let i = 0; i < strips; i++) {
      const u = (i + 0.5) * step;
      let f = 1;
      if (featherStartPx > 0) f = Math.min(f, u / featherStartPx);
      if (featherEndPx > 0) f = Math.min(f, (bandPx - u) / featherEndPx);
      drawRing(center - half + u, step, wave.opacity * Math.max(f, 0));
    }
  }

  destroy(): void {
    this.overlay.destroy();
    this.maskGraphics.destroy();
  }
}
