import Phaser from "phaser";

// Renders a "shine" effect: one or more colored bands ("waves") laid out in a pattern that scrolls past
// the target asset (the asset is a literal-pixel window onto the pattern). The same pattern is rendered
// identically on any asset size — the asset just shows a different-sized window.
//
// Each wave sits at `start` px and is `width` px thick. The pattern scrolls at `speed` px/sec. The cycle
// length is `max(effect.width, speed * period)` px:
//   • `effect.width / speed` is the time it takes a wave to traverse the active region — the "animation
//     duration." `effect.width` sets the minimum cycle, so changing it stretches or shrinks the cycle.
//   • `speed * period` lets `period` extend the cycle beyond the animation duration, appending blank.
// Whichever is larger wins. Any span in the cycle not covered by a wave just scrolls past as blank —
// gaps between waves AND the leftover "empty time" are handled identically (no on/off snap).
//
// e.g. Rolling Rainbow's 7 waves (width 100 at 0,100,...,600, speed 100, period 7, effect.width 700) wrap
// every max(700, 700) = 700 px and fill 700 exactly, so the rainbow rolls with no gaps. Double `period`
// to 14 → cycle becomes max(700, 1400) = 1400 px = 7s of rainbow + 7s of blank. Double `effect.width` to
// 1400 instead → also a 14s cycle, but now driven by the active region rather than period.
// See docs/dev_notes/effects/shine.md.

type Orientation = "horizontal" | "vertical" | "radial";

interface ResolvedWave {
  color: number; // 0xRRGGBB
  opacity: number;
  start: number; // px — the wave's position within the pattern
  speed: number; // px / second the pattern scrolls
  width: number; // px — band thickness along the travel axis
  featherStart: number; // px — alpha ramp at the trailing edge
  featherEnd: number; // px — alpha ramp at the leading edge
  period: number; // seconds — cycle is at least this long (extends the cycle past the active region)
  orientation: Orientation;
  reverseDirection: boolean;
  angle: number; // degrees of skew (0 = perpendicular to travel)
}

interface ShineConfig {
  name: string;
  width: number; // px — active-region width; the cycle is at least this many pixels wide
  height: number; // px — 0 = cover the full asset across the band
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
      if (wave.orientation === "radial") {
        this.drawRadial(wave, elapsed, b);
      } else {
        this.drawLinear(wave, elapsed, b);
      }
    }
  }

  // Cycle length in literal px. `effect.width` is the floor (= animation duration × speed); `period` can
  // extend the cycle by adding blank time past the active region.
  private cycleLength(wave: ResolvedWave): number {
    return Math.max(this.config.width, wave.speed * wave.period);
  }

  // Position of the band's leading edge within the cycle [0, L), at `elapsed`.
  private scrollPosition(wave: ResolvedWave, elapsed: number, L: number): number {
    const dir = wave.reverseDirection ? -1 : 1;
    let pos = (wave.start + dir * wave.speed * elapsed) % L;
    if (pos < 0) pos += L;
    return pos;
  }

  // Horizontal / vertical bands. Work in an (a, c) frame: `a` = travel axis, `c` = cross axis (0..crossSize).
  private drawLinear(wave: ResolvedWave, elapsed: number, b: Phaser.Geom.Rectangle): void {
    const L = this.cycleLength(wave);
    if (L <= 0) return;

    const horizontal = wave.orientation === "horizontal";
    const axisExtent = horizontal ? b.width : b.height;
    const crossSize =
      horizontal && this.config.height > 0
        ? Math.min(this.config.height, b.height)
        : horizontal
          ? b.height
          : b.width;

    // All wave dimensions are literal pixels; the asset is a window onto the pattern.
    const shift = crossSize * Math.tan((wave.angle * Math.PI) / 180);
    const band = wave.width;
    const featherStartPx = wave.featherStart;
    const featherEndPx = wave.featherEnd;
    const pos = this.scrollPosition(wave, elapsed, L);

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

    const drawBand = (s: number): void => {
      if (featherStartPx <= 0 && featherEndPx <= 0) {
        drawStrip(s, s + band, wave.opacity);
        return;
      }
      const strips = Math.min(Math.max(Math.round(band), 4), 32);
      const step = band / strips;
      for (let i = 0; i < strips; i++) {
        const u = (i + 0.5) * step; // distance from trailing edge
        let f = 1;
        if (featherStartPx > 0) f = Math.min(f, u / featherStartPx);
        if (featherEndPx > 0) f = Math.min(f, (band - u) / featherEndPx);
        drawStrip(s + i * step, s + (i + 1) * step, wave.opacity * Math.max(f, 0));
      }
    };

    // Tile the band every `L` so it wraps and repeats seamlessly across the asset window [0, axisExtent].
    // The mask clips anything outside the asset; `margin` keeps skewed/feathered edges from being culled early.
    const margin = Math.abs(shift) + band;
    const kMin = Math.floor((-pos - margin) / L);
    const kMax = Math.ceil((axisExtent - pos + margin) / L);
    for (let k = kMin; k <= kMax; k++) {
      drawBand(pos + k * L);
    }
  }

  // Radial bands: concentric rings scrolling outward (or inward when reversed). Skew/angle do not apply.
  private drawRadial(wave: ResolvedWave, elapsed: number, b: Phaser.Geom.Rectangle): void {
    const L = this.cycleLength(wave);
    if (L <= 0) return;

    const cx = b.x + b.width / 2;
    const cy = b.y + b.height / 2;
    const maxRadius = 0.5 * Math.sqrt(b.width * b.width + b.height * b.height);
    const band = wave.width;
    const featherStartPx = wave.featherStart;
    const featherEndPx = wave.featherEnd;
    const pos = this.scrollPosition(wave, elapsed, L);

    const drawRing = (rInner: number, thickness: number, alpha: number): void => {
      const rCenter = rInner + thickness / 2;
      if (rCenter <= 0 || thickness <= 0 || alpha <= 0) return;
      this.overlay.lineStyle(thickness, wave.color, alpha);
      this.overlay.strokeCircle(cx, cy, rCenter);
    };

    const drawBand = (s: number): void => {
      if (featherStartPx <= 0 && featherEndPx <= 0) {
        drawRing(s, band, wave.opacity);
        return;
      }
      const strips = Math.min(Math.max(Math.round(band), 4), 32);
      const step = band / strips;
      for (let i = 0; i < strips; i++) {
        const u = (i + 0.5) * step;
        let f = 1;
        if (featherStartPx > 0) f = Math.min(f, u / featherStartPx);
        if (featherEndPx > 0) f = Math.min(f, (band - u) / featherEndPx);
        drawRing(s + i * step, step, wave.opacity * Math.max(f, 0));
      }
    };

    const kMax = Math.ceil((maxRadius + band - pos) / L);
    for (let k = 0; k <= kMax; k++) {
      drawBand(pos + k * L);
    }
  }

  destroy(): void {
    this.overlay.destroy();
    this.maskGraphics.destroy();
  }
}
