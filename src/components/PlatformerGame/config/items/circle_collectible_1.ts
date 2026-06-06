// Item configuration for the coin — basic currency collectible dropped by enemies

const item = {
  identity: {
    itemName: "circle_collectible_1",                          // internal identifier
    displayName: "circle_collectible_1 Coin",                        // shown in UI
    description: "Collectible Circle", // one sentence
    type: "trophy",                               // "currency" | "consumable" | "weapon" | "armor" | "key" | "misc"
    rarity: "common",                               // "common" | "uncommon" | "rare" | "legendary"
    stackable: false,                                // coins stack in a single inventory slot
    maxStackSize: 0,                             // maximum coins per stack
  },

  sprites: {
    // sheet: "/assets/sprites/items_sheet.png", // shared items sprite sheet
    // frameIndex: 0,                            // frame index within the sprite sheet
    // scale: 1.5,                               // inventory icon scale
    // worldIconScale: 1,                        // scale when lying on the ground in-world
  },

  drawing_style_options: ['draw_pixels', 'sprite_sheet'],
  drawing_style: 'draw_pixels',

  size: {
    width: 80,
    height: 80,
  },

  shape: {
    name: 'circle',
  },
  
  colors: {
    0: "#ffffff", // brown wood color for programmatic fallback
  },

  effects: [
    // {shine: 'Black Streak'},
  ],

  stats: {
    // coinValue: 1,  // each coin is worth 1 unit of currency
  },

  audio: {
    // pickup: "/assets/audio/sfx/coin_pickup.wav",  // played when player collects the coin
    // use:    "",                                    // coins aren't actively used
    // drop:   "/assets/audio/sfx/coin_drop.wav",    // played when coin is dropped or spawned
  },

  physics: {
    affectedByGravity: false,   // coin falls when dropped in-world
    // bounceFactor: 0.4,         // coins bounce noticeably when dropped
    // pickUpRadius: 40,          // pixels from coin center the player must be to auto-collect
  },
} as const;

export default item;
