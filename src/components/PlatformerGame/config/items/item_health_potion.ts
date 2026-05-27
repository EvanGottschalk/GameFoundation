// Item configuration for the health potion — consumable that restores player hit points

const item_health_potion = {
  identity: {
    itemName: "item_health_potion",
    displayName: "Health Potion",
    description: "A ruby-red vial that restores a moderate amount of health when consumed.",
    type: "consumable",
    rarity: "common",
    stackable: true,
    maxStackSize: 20, // can carry up to 20 in one slot
  },

  sprites: {
    sheet: "/assets/sprites/items_sheet.png",
    frameIndex: 4,    // fourth frame on the shared items sheet
    scale: 1.5,
    worldIconScale: 1.2, // slightly larger in-world so players can spot it easily
  },

  colors: {
    primary: "#ef4444",     // deep red potion liquid
    rarityGlow: "#78716c",  // common rarity — no special glow
  },

  stats: {
    healthRestore: 40,   // hit points restored on use
    manaRestore: 0,      // no mana effect
    effectDuration: 0,   // instant effect — no lingering buff
  },

  audio: {
    pickup: "/assets/audio/sfx/potion_pickup.wav",  // glass clink on collection
    use:    "/assets/audio/sfx/potion_drink.wav",   // gulping sound on use
    drop:   "/assets/audio/sfx/potion_drop.wav",
  },

  physics: {
    affectedByGravity: true,
    bounceFactor: 0.1,  // glass bottle — doesn't bounce much
    pickUpRadius: 32,
  },
} as const;

export default item_health_potion;
