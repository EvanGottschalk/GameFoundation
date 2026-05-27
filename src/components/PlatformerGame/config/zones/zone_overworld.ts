// Zone configuration for the overworld — open outdoor area connecting all major locations

const zone_overworld = {
  identity: {
    zoneName: "Overworld",
    zoneType: "outdoor", // "outdoor" | "indoor" | "dungeon"
    description: "A wide sunlit landscape connecting the village, dungeon entrance, and forest.",
  },

  tilemap: {
    tilemapPath: "/assets/tilemaps/overworld.json",    // Tiled JSON export
    tilesetPath: "/assets/tilesets/overworld_tiles.png", // tileset image
    tileWidth: 16,    // width of one tile in pixels
    tileHeight: 16,   // height of one tile in pixels
    mapWidth: 200,    // map width in tiles
    mapHeight: 30,    // map height in tiles
  },

  appearance: {
    backgroundColor: "#87ceeb",  // sky blue daytime background
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
    { characterName: "npc_villager", x: 320,  y: 400, facing: "right" },
    { characterName: "npc_merchant", x: 640,  y: 400, facing: "left"  },
    { characterName: "npc_guard",    x: 960,  y: 400, facing: "right" },
    { characterName: "npc_guard",    x: 1280, y: 400, facing: "left"  },
  ],

  items: [
    { itemName: "item_coin",          x: 480,  y: 380 },
    { itemName: "item_coin",          x: 496,  y: 380 },
    { itemName: "item_health_potion", x: 800,  y: 380 },
  ],

  objects: [
    { objectName: "object_chest", x: 560,  y: 400 },
    { objectName: "object_sign",  x: 240,  y: 400 },
    { objectName: "object_sign",  x: 1100, y: 400 },
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
