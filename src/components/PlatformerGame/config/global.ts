// Global gameplay configuration — physics, camera, rewards, timing, difficulty, and UI colors

const global = {
  physics: {
    gravity: 980,          // world gravity in pixels/sec² applied to all entities
    bounceFactor: 0.05,    // default elasticity for objects that don't override it
    friction: 0.8,         // default ground friction for surfaces (0 = frictionless, 1 = full stop)
    terminalVelocity: 600, // maximum downward fall speed for all entities in pixels/sec
  },

  camera: {
    lerpFactor: 0.1,       // how smoothly the camera follows the player (0 = instant, 1 = no follow)
    deadzoneWidth: 80,     // horizontal pixels around player center where camera does not move
    deadzoneHeight: 60,    // vertical pixels around player center where camera does not move
    zoom: 1,               // camera zoom level (1 = no zoom, 2 = 2× magnification)
  },

  rewards: {
    baseXpPerEnemy: 20,       // base experience points awarded for defeating one enemy
    xpMultiplierPerLevel: 1.1, // XP multiplier applied per player level above 1
    coinDropMin: 1,            // minimum coins dropped by an enemy
    coinDropMax: 5,            // maximum coins dropped by an enemy
    rareDropChance: 0.05,      // probability (0–1) of a rare item being included in a drop
  },

  timing: {
    tickRate: 16,              // game logic update interval in ms (~60 Hz)
    autoSaveInterval: 60000,   // how often the game auto-saves in ms
    respawnDelay: 3000,        // ms between player death and respawn
    sceneTransitionDuration: 600, // fade/transition duration when changing zones in ms
  },

  difficulty: {
    enemyHealthMultiplier: 1,    // scales all enemy max health (1 = normal)
    enemyDamageMultiplier: 1,    // scales all enemy attack damage (1 = normal)
    playerDamageMultiplier: 1,   // scales all player attack damage (1 = normal)
    experienceMultiplier: 1,     // scales all XP rewards (1 = normal)
  },

  audio: {
    masterVolume: 0.9, // overall volume envelope (0 = muted, 1 = full)
    musicVolume: 0.6,  // background music volume relative to master
    sfxVolume: 0.8,    // sound effects volume relative to master
  },

  colors: {
    backgroundDefault: "#1a1a2e",  // default canvas background color
    uiPrimary: "#3b82f6",          // primary UI accent color (buttons, frames)
    uiSecondary: "#64748b",        // secondary UI color (inactive elements)
    damageNumber: "#ff4444",       // floating damage number text color
    healNumber: "#22c55e",         // floating heal number text color
    xpNumber: "#a78bfa",           // floating XP gain text color
  },
} as const;

export default global;
