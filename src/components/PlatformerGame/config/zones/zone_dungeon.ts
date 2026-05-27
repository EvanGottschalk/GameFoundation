// Zone configuration for the dungeon — underground area with enemies and treasure

const zone_dungeon = {
  identity: {
    zoneName: "Dungeon",
    zoneType: "dungeon", // "outdoor" | "indoor" | "dungeon"
    description: "A dark underground labyrinth filled with traps, monsters, and ancient treasure.",
  },

  tilemap: {
    tilemapPath: "/assets/tilemaps/dungeon.json",
    tilesetPath: "/assets/tilesets/dungeon_tiles.png",
    tileWidth: 16,
    tileHeight: 16,
    mapWidth: 100,
    mapHeight: 50,
  },

  appearance: {
    backgroundColor: "#0d0d1a",  // near-black underground ambiance
    parallaxLayers: [
      { imagePath: "/assets/backgrounds/dungeon_bg_far.png",  scrollFactor: 0.05 }, // distant stone wall
      { imagePath: "/assets/backgrounds/dungeon_bg_near.png", scrollFactor: 0.2  }, // closer rock layer
    ],
    ambientLightColor: "#6366f1",  // faint purple torchlight tint
    ambientLightIntensity: 0.45,   // dim — most light comes from torches placed in the map
  },

  physics: {
    gravityOverride: null, // standard gravity underground
    hasWater: true,        // flooded lower chambers
    waterDragFactor: 0.35, // significant drag when swimming through dungeon water
  },

  npcs: [
    { characterName: "npc_guard", x: 400, y: 600, facing: "right" },
    { characterName: "npc_guard", x: 800, y: 600, facing: "left"  },
    { characterName: "npc_guard", x: 1200, y: 600, facing: "right" },
  ],

  items: [
    { itemName: "item_coin",          x: 240,  y: 580 },
    { itemName: "item_coin",          x: 256,  y: 580 },
    { itemName: "item_health_potion", x: 600,  y: 580 },
    { itemName: "item_sword",         x: 1000, y: 580 },
  ],

  objects: [
    { objectName: "object_chest", x: 300,  y: 600 },
    { objectName: "object_chest", x: 900,  y: 600 },
    { objectName: "object_door",  x: 1400, y: 600 },
  ],

  audio: {
    backgroundMusic: "/assets/audio/music/dungeon_theme.ogg",
    ambientSound:    "/assets/audio/ambient/dungeon_drips.wav", // dripping water and echo
    musicLoopStart:  2.8,
    musicVolumeOverride: 0.5, // slightly quieter than default to keep tension
  },

  transitions: [
    { toZone: "zone_overworld", triggerX: 0,    triggerY: 480, triggerWidth: 16, triggerHeight: 320 }, // entrance back to overworld
    { toZone: "zone_dungeon",   triggerX: 1584, triggerY: 480, triggerWidth: 16, triggerHeight: 320 }, // deeper dungeon level (self-reference for future expansion)
  ],
} as const;

export default zone_dungeon;
