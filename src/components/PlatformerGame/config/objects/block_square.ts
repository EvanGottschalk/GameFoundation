// Object configuration for platform_0 — a basic solid platform the player can stand on

const object = {
  identity: {
    objectName: "block_square",
    displayName: "block_square",
    description: "Square Block",
    type: "platform",      // "container" | "door" | "decoration" | "hazard" | "npc_trigger" | "platform"
    // interactable: true,     // player can press interact to open
    solid: true, // player cannot overlap this object; it is a solid object
    // interactionPrompt: "Press E to open", // text shown near the object when in range
  },

  drawing_style_options: ['draw_pixels', 'sprite_sheet'],
  drawing_style: 'draw_pixels',

  size: {
    width: 100,
    height: 100,
  },

  sprites: {
    // sheet: "/assets/sprites/objects_sheet.png",
    // frameWidth: 32,
    // frameHeight: 32,
    // scale: 2,
    // closedFrameIndex: 0,  // frame displayed when the chest is closed
    // openFrameIndex: 4,    // frame displayed after the chest has been opened
  },

  colors: {
    0: "#ffffff", // brown wood color for programmatic fallback
  },

  animations: {
    // open: { frameStart: 0, frameEnd: 4, frameRate: 10, loop: false }, // opening sequence
    // idle: { frameStart: 0, frameEnd: 0, frameRate: 1,  loop: true  }, // static closed state
  },

  effects: [
    {shine: 'Rolling Rainbow'},
  ],

  behavior: {
    // oneTimeUse: true,      // chest can only be opened once per session
    // respawnAfter: 0,       // 0 = never respawns after being looted
    // blocksMovement: true,  // the chest is a solid obstacle
    // triggerRadius: 40,     // pixels from chest center the player must be to see the prompt
  },

  loot: {
    // dropTable: [
    //   { itemName: "item_coin",          chance: 1.0 },  // always drops coins
    //   { itemName: "item_health_potion", chance: 0.6 },  // 60% chance of a potion
    //   { itemName: "item_sword",         chance: 0.15 }, // 15% chance of a weapon
    // ],
    // minItems: 1, // minimum number of items selected from the drop table
    // maxItems: 3, // maximum number of items selected from the drop table
  },

  audio: {
    // interactionSound: "/assets/audio/sfx/chest_open.wav",  // creaking lid sound on open
    // ambientSound:     "",                                   // chests have no ambient loop
  },
} as const;

export default object;
