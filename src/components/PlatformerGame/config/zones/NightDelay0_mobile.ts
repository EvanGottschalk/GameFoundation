// Zone configuration for the overworld — open outdoor area connecting all major locations

const zone_overworld = {

  identity: {
    zoneName: "NightDelay0_mobile",
    zoneType: "outdoor", // "outdoor" | "indoor" | "dungeon"
    description: "A wide sunlit landscape connecting the village, dungeon entrance, and forest.",
  },

  width: 1080, // width of the area within the game
  height: 6000, // height of the area within the game

  playerSpawn: {
    x: 120,           // player spawn X in pixels from the left of the zone
    y: 640,           // player spawn Y in pixels from the top of the zone
    facing: "right",  // direction the player faces on spawn ("left" or "right")
  },

  geometry: {
    // // Simple solid rectangles that act as platforms — used when no tilemap is loaded.
    // // Each entry: { x, y } is the center; width/height in pixels; color is a hex string.
    // platforms: [
    //   { x: 640,  y: 696, width: 1280, height: 48, color: "#ffffff" }, // grassy ground spanning the canvas
    //   { x: 280,  y: 540, width: 200,  height: 20, color: "#ffffff" }, // low-left platform
    // ],
  },

  appearance: {
    backgroundColor: "#000000",  // sky blue daytime background
    parallaxLayers: [
      { imagePath: "/assets/backgrounds/clouds_far.png",   scrollFactor: 0.1 }, // distant clouds
      { imagePath: "/assets/backgrounds/mountains.png",    scrollFactor: 0.3 }, // far mountains
      { imagePath: "/assets/backgrounds/trees_far.png",    scrollFactor: 0.6 }, // distant tree line
      { imagePath: "/assets/backgrounds/trees_near.png",   scrollFactor: 0.85 }, // near foliage
    ],
    ambientLightColor: "#fffde7",  // warm daylight tint
    ambientLightIntensity: 1,      // full brightness (1 = no darkening)
  },

  physics: {
    gravityOverride: null, // null = use global gravity setting
    hasWater: false,       // no water physics in the overworld by default
    waterDragFactor: 0.4,  // drag multiplier while submerged (unused if hasWater is false)
  },

  npcs: [
    // { characterName: "npc_villager", x: 320,  y: 400, facing: "right" },
    // { characterName: "npc_merchant", x: 640,  y: 400, facing: "left"  },
    // { characterName: "npc_guard",    x: 960,  y: 400, facing: "right" },
    // { characterName: "npc_guard",    x: 1280, y: 400, facing: "left"  },
  ],

  items: [
    {'name': 'collectible_circle_1'},
    // { itemName: "item_coin",          x: 480,  y: 380 },
    // { itemName: "item_coin",          x: 496,  y: 380 },
    // { itemName: "item_health_potion", x: 800,  y: 380 },
  ],

  objects: [
    { objectName: "platform_0", x: 500,  y: 500 },
    { objectName: "platform_0", x: 0,  y: 710 },
    { objectName: "platform_0", x: 100,  y: 710 },
    { objectName: "platform_0", x: 200,  y: 710 },
    { objectName: "platform_0", x: 300,  y: 710 },
    { objectName: "platform_0", x: 400,  y: 710 },
    { objectName: "platform_0", x: 500,  y: 710 },
    { objectName: "platform_0", x: 600,  y: 710 },
    { objectName: "platform_0", x: 700,  y: 710 },
    { objectName: "platform_0", x: 800,  y: 710 },
    { objectName: "platform_0", x: 900,  y: 710 },
    { objectName: "platform_0", x: 1000,  y: 710 },
    { objectName: "platform_0", x: 1100,  y: 710 },
    { objectName: "platform_0", x: 1200,  y: 710 },
    { objectName: "platform_0", x: 1300,  y: 710 },
    
    { objectName: "platform_0", x: 700,  y: 500 },
    { objectName: "platform_0", x: 900,  y: 300 },

    { objectName: "block_square", x: 300,  y: 300 },
    { objectName: "block_square", x: 400,  y: 300 },
    
    { objectName: "circle_collectible_1", x: 400,  y: 200 },
    { objectName: "circle_collectible_1", x: 700,  y: 500 },
    { objectName: "circle_collectible_1", x: 850,  y: 450 },
  ],

  audio: {
    backgroundMusic: "/assets/audio/music/overworld_theme.ogg", // BGM track
    ambientSound:    "/assets/audio/ambient/birds_wind.wav",    // looping ambient layer
    musicLoopStart:  4.2,     // seconds into the track where the loop begins
    musicVolumeOverride: null, // null = use global music volume
  },

  transitions: [
    { toZone: "zone_village",  triggerX: 0,    triggerY: 288, triggerWidth: 16, triggerHeight: 192 }, // left edge → village
    { toZone: "zone_dungeon",  triggerX: 3168, triggerY: 288, triggerWidth: 16, triggerHeight: 192 }, // right edge → dungeon
  ],
} as const;

export default zone_overworld;
