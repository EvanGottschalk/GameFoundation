// Item configuration for the coin — basic currency collectible dropped by enemies

const item_coin = {
  identity: {
    itemName: "item_coin",                          // internal identifier
    displayName: "Gold Coin",                        // shown in UI
    description: "A small gold coin used as currency throughout the realm.", // one sentence
    type: "currency",                               // "currency" | "consumable" | "weapon" | "armor" | "key" | "misc"
    rarity: "common",                               // "common" | "uncommon" | "rare" | "legendary"
    stackable: true,                                // coins stack in a single inventory slot
    maxStackSize: 9999,                             // maximum coins per stack
  },

  sprites: {
    sheet: "/assets/sprites/items_sheet.png", // shared items sprite sheet
    frameIndex: 0,                            // frame index within the sprite sheet
    scale: 1.5,                               // inventory icon scale
    worldIconScale: 1,                        // scale when lying on the ground in-world
  },

  colors: {
    primary: "#fbbf24",     // gold fallback color
    rarityGlow: "#78716c",  // common items have no significant glow (muted grey-brown)
  },

  stats: {
    coinValue: 1,  // each coin is worth 1 unit of currency
  },

  audio: {
    pickup: "/assets/audio/sfx/coin_pickup.wav",  // played when player collects the coin
    use:    "",                                    // coins aren't actively used
    drop:   "/assets/audio/sfx/coin_drop.wav",    // played when coin is dropped or spawned
  },

  physics: {
    affectedByGravity: true,   // coin falls when dropped in-world
    bounceFactor: 0.4,         // coins bounce noticeably when dropped
    pickUpRadius: 40,          // pixels from coin center the player must be to auto-collect
  },
} as const;

export default item_coin;
