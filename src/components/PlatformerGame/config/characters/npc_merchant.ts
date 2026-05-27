// NPC merchant configuration — a traveling trader who sells items and buys loot

const npc_merchant = {
  identity: {
    displayName: "Merchant",
    description: "A shrewd trader who always has something valuable for sale.",
    role: "merchant", // "friendly" | "merchant" | "hostile" | "neutral"
  },

  sprites: {
    sheet: "/assets/sprites/npc_merchant_sheet.png",
    frameWidth: 32,
    frameHeight: 48,
    scale: 2,
  },

  colors: {
    primary: "#a855f7",    // rich purple robe
    secondary: "#fbbf24",  // gold trim and accessories
    nameLabel: "#e9d5ff",  // soft purple name label
  },

  physics: {
    speed: 0,              // merchants are stationary (speed 0 = no patrol movement)
    gravityMultiplier: 1,
    canPatrol: false,      // merchants stay at their fixed spawn location
    patrolDistance: 0,
  },

  animations: {
    idle: { frameStart: 0, frameEnd: 5,   frameRate: 4,  loop: true  }, // slow idle rocking
    walk: { frameStart: 8, frameEnd: 13,  frameRate: 8,  loop: true  }, // used if merchant moves
    hurt: { frameStart: 24, frameEnd: 27, frameRate: 10, loop: false },
    die:  { frameStart: 32, frameEnd: 37, frameRate: 8,  loop: false },
  },

  stats: {
    maxHealth: 50,
    attackDamage: 0,
    defense: 2,
    detectionRadius: 72,  // opens shop UI when player is this close
    aggroRadius: 0,
  },

  dialogue: {
    greetings: [
      "Welcome, welcome! Fine goods at fair prices!",
      "Ah, a customer! You look like you need supplies.",
      "Everything you see is for sale — if the price is right.",
    ],
    farewells: [
      "Come back soon — stock changes every day!",
      "Pleasure doing business!",
      "Safe travels, and spend wisely!",
    ],
    conversations: [
      { prompt: "What are you selling?",      response: "Potions, weapons, the occasional curiosity. Browse at your leisure." },
      { prompt: "Any rare items today?",      response: "Rarity costs extra. But yes, I may have something… special in the back." },
      { prompt: "Where do you get your wares?", response: "A merchant never reveals his sources. Let's just say I travel far." },
    ],
  },

  audio: {
    ambientIdle: "/assets/audio/sfx/npc_merchant_coins.wav", // quiet coin-jingle ambient
    hurt: "/assets/audio/sfx/npc_merchant_hurt.wav",
    greeting: "/assets/audio/sfx/npc_merchant_greeting.wav",
  },

  loot: {
    dropTable: [
      { itemName: "item_coin",          chance: 1.0 },  // always drops coins
      { itemName: "item_health_potion", chance: 0.3 },  // 30% chance of a potion
    ],
  },
} as const;

export default npc_merchant;
