// Object configuration for the sign — a readable notice board that displays dialogue text

const object_sign = {
  identity: {
    objectName: "object_sign",
    displayName: "Wooden Sign",
    description: "A roadside sign with carved text that the player can stop and read.",
    type: "decoration",    // signs are read-only — not doors or containers
    interactable: true,
    interactionPrompt: "Press E to read",
  },

  sprites: {
    sheet: "/assets/sprites/objects_sheet.png",
    frameWidth: 32,
    frameHeight: 32,
    scale: 2,
    closedFrameIndex: 16, // single static frame (signs don't open)
    openFrameIndex: 16,   // same frame — signs have no open state
  },

  colors: {
    primary: "#a16207", // aged wood yellow-brown
  },

  animations: {
    open: { frameStart: 16, frameEnd: 16, frameRate: 1, loop: false }, // no animation — static
    idle: { frameStart: 16, frameEnd: 16, frameRate: 1, loop: true  },
  },

  behavior: {
    oneTimeUse: false,      // signs can be read repeatedly
    respawnAfter: 0,
    blocksMovement: false,  // player can walk through a sign post
    triggerRadius: 48,
  },

  loot: {
    dropTable: [], // signs contain no loot
    minItems: 0,
    maxItems: 0,
  },

  audio: {
    interactionSound: "/assets/audio/sfx/sign_read.wav", // soft rustle/page sound on read
    ambientSound:     "",                                 // signs have no ambient sound
  },
} as const;

export default object_sign;
