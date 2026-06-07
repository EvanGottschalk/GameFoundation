import Phaser from "phaser";
import { MainScene } from "./scenes/MainScene";
import displayConfig from "../config/display";
import globalConfig from "../config/global";

function detectPlatform(): "mobile" | "desktop" {
  return /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? "mobile" : "desktop";
}

function resolveDimension(value: string | number, axis: "width" | "height"): number {
  if (typeof value === "number") return value;
  if (value === "screen width") return window.innerWidth;
  if (value === "screen height") return window.innerHeight;
  throw new Error(`Unknown display ${axis} value: "${value}"`);
}

export function createGame(parent: HTMLElement): Phaser.Game {
  const platform = detectPlatform();
  const windowConfig =
    platform === "mobile" ? displayConfig.window.mobile : displayConfig.window.desktop;

  return new Phaser.Game({
    type: Phaser.AUTO,
    width: resolveDimension(windowConfig.width, "width"),
    height: resolveDimension(windowConfig.height, "height"),
    backgroundColor: globalConfig.colors.backgroundDefault,
    parent,
    antialias: displayConfig.window.antialiasing,
    physics: {
      default: "arcade",
      arcade: {
        gravity: { x: 0, y: globalConfig.physics.gravity },
        debug: displayConfig.debug.showPhysicsBodies,
      },
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    fps: {
      target: displayConfig.window.targetFrameRate,
    },
    scene: [MainScene],
  });
}
