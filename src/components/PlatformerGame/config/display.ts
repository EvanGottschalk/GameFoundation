// Display and rendering configuration — canvas, HUD layout, fonts, and debug flags

const display = {
  window: {
    width: 1280,            // canvas width in pixels
    height: 720,            // canvas height in pixels
    scaleToFit: true,       // whether to resize the canvas to fill the browser viewport
    scaleMode: "FIT",       // scale strategy: "FIT" | "ENVELOP" | "NONE"
    backgroundColor: "#1a1a2e", // canvas background color shown behind all scenes
    targetFrameRate: 60,    // desired frames per second
    showFps: false,         // whether to render an FPS counter in the top-right corner
    antialiasing: false,    // whether to enable canvas antialiasing (disable for pixel art)
  },

  ui: {
    padding: {
      top: 16,    // HUD distance from the top edge in pixels
      right: 16,  // HUD distance from the right edge in pixels
      bottom: 16, // HUD distance from the bottom edge in pixels
      left: 16,   // HUD distance from the left edge in pixels
    },
    healthBar: {
      width: 180,           // health bar total width in pixels
      height: 14,           // health bar height in pixels
      colorFull: "#22c55e", // fill color when health is full
      colorEmpty: "#3f3f46", // background bar color when health is depleted
      colorBorder: "#1e293b", // border stroke color
    },
    minimap: {
      x: 16,      // minimap left position from screen edge in pixels
      y: 16,      // minimap top position from screen edge in pixels
      width: 160, // minimap display width in pixels
      height: 90, // minimap display height in pixels
    },
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
