// Item configuration for the sword — one-handed melee weapon with good range

const item_sword = {
  identity: {
    itemName: "item_sword",
    displayName: "Iron Sword",
    description: "A reliable iron sword that deals solid damage with decent reach.",
    type: "weapon",
    rarity: "uncommon",
    stackable: false, // weapons occupy a single, non-stackable slot
    maxStackSize: 1,
  },

  sprites: {
    sheet: "/assets/sprites/items_sheet.png",
    frameIndex: 8,   // eighth frame on the items sprite sheet
    scale: 1.5,
    worldIconScale: 1.4, // larger in-world so the weapon is clearly visible on the ground
  },

  colors: {
    primary: "#94a3b8",     // silver-grey iron blade
    rarityGlow: "#34d399",  // uncommon items have a green shimmer
  },

  stats: {
    attackDamageBonus: 18, // added on top of player's baseAttackDamage
    attackSpeed: 380,      // ms between consecutive swings
    range: 64,             // hitbox reach in pixels from the player's center
    knockbackForce: 180,   // pixels/sec applied to the hit target
  },

  audio: {
    pickup: "/assets/audio/sfx/weapon_pickup.wav",  // metallic clank on collection
    use:    "/assets/audio/sfx/sword_swing.wav",    // whoosh on attack
    drop:   "/assets/audio/sfx/weapon_drop.wav",    // heavy thud when dropped
  },

  physics: {
    affectedByGravity: true,
    bounceFactor: 0.05, // heavy metal — barely bounces
    pickUpRadius: 36,
  },
} as const;

export default item_sword;
