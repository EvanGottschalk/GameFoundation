// Display and rendering configuration — canvas, HUD layout, fonts, and debug flags

const display = {
  window: {
    // scaleToFit: true,       // whether to resize the canvas to fill the browser viewport
    // scaleMode: "FIT",       // scale strategy: "FIT" | "ENVELOP" | "NONE"
    backgroundColor: "#000000", // canvas background color shown behind all scenes
    targetFrameRate: 60,    // desired frames per second
    showFps: false,         // whether to render an FPS counter in the top-right corner
    antialiasing: false,    // whether to enable canvas antialiasing (disable for pixel art)
    desktop: {
      width: 1440,
      height: 720,
      scaleToFit: 'height'
    },
    mobile: {
      width: 720,
      height: 1440,
      scaleToFit: 'width'
    }
  },

  ui: {
    fontFamily: "'Press Start 2P', monospace", // default font stack for all UI text
    fontSize: {
      body: 12,         // normal in-game text size in pixels
      heading: 18,      // section headers and titles
      tooltip: 10,      // small tooltip / item description text
      damageNumbers: 14, // floating combat number size
    },
    iconSize: 24, // square size for item/ability icons in pixels
  },

  debug: {
    showPhysicsBodies: false,    // draw physics collision shapes over sprites
    showTileBorders: false,      // draw outlines around every tilemap tile
    showEntityHitboxes: false,   // draw hitbox rectangles on all entities
    logSceneTransitions: false,  // print scene change events to the browser console
  },
} as const;

export default display;
