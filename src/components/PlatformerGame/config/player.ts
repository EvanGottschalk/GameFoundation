// Player character configuration — stats, physics, sprites, abilities, and audio

const player = {
  sprites: {
    sheet: "/assets/sprites/player_sheet.png", // sprite sheet image path
    frameWidth: 48,   // width of a single frame in pixels
    frameHeight: 48,  // height of a single frame in pixels
    scale: 2,         // render scale multiplier applied to the sprite
  },

  colors: {
    primary: "#ffffff",   // main body color used for programmatic fallback
    outline: "#1e3a5f",   // border/outline drawn around the character
    hitFlash: "#ff4444",  // tint color briefly shown when the player takes damage
  },

  physics: {
    speed: 220,           // horizontal movement speed in pixels/sec
    jumpVelocity: -560,   // upward velocity applied on jump (negative = up)
    gravityMultiplier: 1, // scale factor relative to global gravity (1.0 = full gravity)
    terminalVelocity: 600, // maximum downward speed in pixels/sec
    groundFriction: 0.85, // drag applied while on the ground (0 = slippery, 1 = instant stop)
    airControl: 0.65,     // fraction of full horizontal control available while airborne
    bounceFactor: 0.05,   // elasticity on landing (0 = no bounce, 1 = full bounce)
    coyoteTime: 120,      // ms the player can still jump after walking off a ledge
    jumpBuffer: 100,      // ms before landing that an early jump input is accepted
  },

  effects: [
    {shine: 'Black Streak'},
  ],

  animations: {
    idle: {
      frameStart: 0,  // first frame index in the sprite sheet
      frameEnd: 3,    // last frame index
      frameRate: 6,   // frames per second
      loop: true,     // whether the animation repeats
    },
    run: {
      frameStart: 8,
      frameEnd: 15,
      frameRate: 14,
      loop: true,
    },
    jump: {
      frameStart: 16,
      frameEnd: 19,
      frameRate: 10,
      loop: false,
    },
    fall: {
      frameStart: 20,
      frameEnd: 23,
      frameRate: 8,
      loop: true,
    },
    land: {
      frameStart: 24,
      frameEnd: 27,
      frameRate: 12,
      loop: false,
    },
    hurt: {
      frameStart: 32,
      frameEnd: 35,
      frameRate: 10,
      loop: false,
    },
    die: {
      frameStart: 40,
      frameEnd: 47,
      frameRate: 10,
      loop: false,
    },
  },

  abilities: {
    doubleJump: true,          // whether the player can jump a second time mid-air
    wallSlide: true,           // whether the player can slow descent against a wall
    wallSlideFriction: 80,     // downward speed in pixels/sec while wall-sliding
    dash: true,                // whether the dash ability is enabled
    dashSpeed: 500,            // horizontal speed in pixels/sec during a dash
    dashDuration: 150,         // how long the dash lasts in ms
    dashCooldown: 800,         // time between dashes in ms
  },

  stats: {
    maxHealth: 100,                          // maximum hit points
    startingHealth: 100,                     // hit points at game start
    invincibilityDuration: 1200,             // ms of i-frames after taking damage
    baseAttackDamage: 12,                    // damage dealt per basic attack
    baseDefense: 4,                          // flat damage reduction from incoming hits
    xpToLevel: [100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200, 4000], // XP required for each level 1–10
  },

  inventory: {
    maxSlots: 24,                            // total number of item slots in the inventory
    startingItems: ["item_coin", "item_health_potion"], // items the player begins with
    startingCurrency: 10,                    // starting coin count
  },

  audio: {
    jump:     "/assets/audio/sfx/player_jump.wav",     // played when the player jumps
    land:     "/assets/audio/sfx/player_land.wav",     // played when the player lands
    hurt:     "/assets/audio/sfx/player_hurt.wav",     // played when the player takes damage
    die:      "/assets/audio/sfx/player_die.wav",      // played on player death
    attack:   "/assets/audio/sfx/player_attack.wav",   // played on basic attack swing
    pickup:   "/assets/audio/sfx/item_pickup.wav",     // played when picking up an item
    levelUp:  "/assets/audio/sfx/level_up.wav",        // played on level-up
  },
} as const;

export default player;
