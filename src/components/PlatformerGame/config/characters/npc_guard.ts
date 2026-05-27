// NPC guard configuration — an armed patrol who is hostile to unknown intruders

const npc_guard = {
  identity: {
    displayName: "Guard",
    description: "A stern soldier who patrols the area and attacks on sight.",
    role: "hostile", // "friendly" | "merchant" | "hostile" | "neutral"
  },

  sprites: {
    sheet: "/assets/sprites/npc_guard_sheet.png",
    frameWidth: 32,
    frameHeight: 48,
    scale: 2,
  },

  colors: {
    primary: "#6b7280",    // grey armor plating
    secondary: "#dc2626",  // red insignia/cape
    nameLabel: "#f87171",  // reddish name label to signal hostility
  },

  physics: {
    speed: 90,            // faster patrol speed than villagers
    gravityMultiplier: 1,
    canPatrol: true,
    patrolDistance: 120,  // wider patrol range
  },

  animations: {
    idle: { frameStart: 0, frameEnd: 3,   frameRate: 4,  loop: true  },
    walk: { frameStart: 8, frameEnd: 15,  frameRate: 12, loop: true  }, // marching walk
    hurt: { frameStart: 24, frameEnd: 27, frameRate: 12, loop: false },
    die:  { frameStart: 32, frameEnd: 39, frameRate: 10, loop: false },
  },

  stats: {
    maxHealth: 60,
    attackDamage: 14,      // deals moderate melee damage
    defense: 8,            // armored — takes less damage
    detectionRadius: 48,   // close-range interaction (challenges player)
    aggroRadius: 160,      // spots the player from this far and attacks
  },

  dialogue: {
    greetings: [
      "Halt! State your business.",
      "You there — show me your pass!",
      "I'm watching you, stranger.",
    ],
    farewells: [
      "Move along.",
      "Don't cause trouble.",
      "Stay out of restricted areas.",
    ],
    conversations: [
      { prompt: "I'm just passing through.",  response: "Fine. But stay on the road and keep moving." },
      { prompt: "What are you guarding?",     response: "That's none of your concern. Move along." },
      { prompt: "Can I get past?",            response: "Not without a permit from the captain. No exceptions." },
    ],
  },

  audio: {
    ambientIdle: "/assets/audio/sfx/npc_guard_footstep.wav", // steady patrol footstep loop
    hurt: "/assets/audio/sfx/npc_guard_hurt.wav",
    greeting: "/assets/audio/sfx/npc_guard_challenge.wav",   // "Halt!" bark sound
  },

  loot: {
    dropTable: [
      { itemName: "item_coin",  chance: 0.8 },
      { itemName: "item_sword", chance: 0.1 }, // rare chance to drop the guard's weapon
    ],
  },
} as const;

export default npc_guard;
