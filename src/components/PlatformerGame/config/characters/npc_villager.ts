// NPC villager configuration — a friendly townsfolk who gives hints and light conversation

const npc_villager = {
  identity: {
    displayName: "Villager",                           // name shown above the character and in dialogue
    description: "A cheerful resident who knows the local area well.", // one-sentence description
    role: "friendly",                                  // "friendly" | "merchant" | "hostile" | "neutral"
  },

  sprites: {
    sheet: "/assets/sprites/npc_villager_sheet.png", // sprite sheet image path
    frameWidth: 32,   // width of one animation frame in pixels
    frameHeight: 48,  // height of one animation frame in pixels
    scale: 2,         // render scale multiplier
  },

  colors: {
    primary: "#f59e0b",    // main clothing/body color
    secondary: "#78350f",  // accent color (hat, belt, etc.)
    nameLabel: "#fde68a",  // color of the floating name label above the NPC
  },

  physics: {
    speed: 60,              // patrol movement speed in pixels/sec
    gravityMultiplier: 1,   // gravity scale relative to global gravity
    canPatrol: true,        // whether the NPC wanders back and forth
    patrolDistance: 80,     // pixels each direction the NPC will walk from its spawn point
  },

  animations: {
    idle: { frameStart: 0, frameEnd: 3,   frameRate: 5,  loop: true  }, // standing still
    walk: { frameStart: 8, frameEnd: 15,  frameRate: 10, loop: true  }, // walking patrol
    hurt: { frameStart: 24, frameEnd: 27, frameRate: 10, loop: false }, // hit reaction
    die:  { frameStart: 32, frameEnd: 37, frameRate: 8,  loop: false }, // death sequence
  },

  stats: {
    maxHealth: 30,          // hit points (villagers can be hurt but are non-hostile)
    attackDamage: 0,        // damage dealt (0 = passive)
    defense: 0,             // flat damage reduction
    detectionRadius: 80,    // pixels from NPC center that triggers interaction prompt
    aggroRadius: 0,         // pixels at which NPC becomes hostile (0 = never hostile)
  },

  dialogue: {
    greetings: [
      "Hello, traveler! Safe roads to you.",
      "Glad to see a friendly face around here.",
      "Have you heard? Strange things in the dungeon lately...",
    ], // randomly selected greeting line
    farewells: [
      "Take care out there!",
      "May your path be clear.",
      "Come back anytime!",
    ], // randomly selected farewell line
    conversations: [
      { prompt: "What's happening in the village?",       response: "The harvest was good this year, but the nights have grown restless." },
      { prompt: "Do you know the way to the dungeon?",    response: "Head east past the old mill. You can't miss it — just follow the screaming." },
      { prompt: "Any advice for a new adventurer?",       response: "Stock up on potions before you head underground. Trust me on that one." },
    ], // branching conversation entries
  },

  audio: {
    ambientIdle: "/assets/audio/sfx/npc_villager_hum.wav", // looping ambient sound when idle
    hurt: "/assets/audio/sfx/npc_villager_hurt.wav",       // sound on damage taken
    greeting: "/assets/audio/sfx/npc_greeting.wav",        // sound when greeting the player
  },

  loot: {
    dropTable: [
      { itemName: "item_coin", chance: 0.5 }, // 50% chance to drop a coin
    ],
  },
} as const;

export default npc_villager;
