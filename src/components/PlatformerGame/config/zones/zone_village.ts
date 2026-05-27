// Zone configuration for the village — safe indoor/outdoor town hub with merchants and NPCs

const zone_village = {
  identity: {
    zoneName: "Village",
    zoneType: "indoor", // "outdoor" | "indoor" | "dungeon"
    description: "A cozy settlement with a market, inn, and townsfolk going about their day.",
  },

  tilemap: {
    tilemapPath: "/assets/tilemaps/village.json",
    tilesetPath: "/assets/tilesets/village_tiles.png",
    tileWidth: 16,
    tileHeight: 16,
    mapWidth: 80,
    mapHeight: 20,
  },

  appearance: {
    backgroundColor: "#fef9c3",  // warm afternoon golden-hour sky
    parallaxLayers: [
      { imagePath: "/assets/backgrounds/village_sky.png",        scrollFactor: 0.05 },
      { imagePath: "/assets/backgrounds/village_distant.png",    scrollFactor: 0.25 },
      { imagePath: "/assets/backgrounds/village_buildings.png",  scrollFactor: 0.6  },
    ],
    ambientLightColor: "#fde68a",  // warm orange-yellow sunlight
    ambientLightIntensity: 0.9,    // slightly softer than the open overworld
  },

  physics: {
    gravityOverride: null,
    hasWater: false,
    waterDragFactor: 0.4,
  },

  npcs: [
    { characterName: "npc_villager", x: 160,  y: 256, facing: "right" },
    { characterName: "npc_villager", x: 400,  y: 256, facing: "left"  },
    { characterName: "npc_merchant", x: 640,  y: 256, facing: "right" },
    { characterName: "npc_guard",    x: 1000, y: 256, facing: "left"  },
  ],

  items: [
    { itemName: "item_coin", x: 320, y: 236 },
    { itemName: "item_coin", x: 336, y: 236 },
  ],

  objects: [
    { objectName: "object_chest", x: 200,  y: 256 },
    { objectName: "object_sign",  x: 80,   y: 256 },
    { objectName: "object_door",  x: 720,  y: 256 },
    { objectName: "object_sign",  x: 900,  y: 256 },
  ],

  audio: {
    backgroundMusic: "/assets/audio/music/village_theme.ogg",
    ambientSound:    "/assets/audio/ambient/village_ambiance.wav", // crowd chatter, market sounds
    musicLoopStart:  0,    // loop from the very beginning
    musicVolumeOverride: null,
  },

  transitions: [
    { toZone: "zone_overworld", triggerX: 1264, triggerY: 128, triggerWidth: 16, triggerHeight: 192 }, // right exit to overworld
  ],
} as const;

export default zone_village;
