import Phaser from "phaser";
import { MainScene } from "./scenes/MainScene";
import displayConfig from "../config/display";
import globalConfig from "../config/global";

export function createGame(parent: HTMLElement): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    width: displayConfig.window.width,
    height: displayConfig.window.height,
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
