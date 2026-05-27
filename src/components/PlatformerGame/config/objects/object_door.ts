// Object configuration for the door — interactive passage that transitions areas or unlocks paths

const object_door = {
  identity: {
    objectName: "object_door",
    displayName: "Wooden Door",
    description: "A hinged door that blocks passage until the player interacts with it.",
    type: "door",
    interactable: true,
    interactionPrompt: "Press E to open",
  },

  sprites: {
    sheet: "/assets/sprites/objects_sheet.png",
    frameWidth: 32,
    frameHeight: 64,   // doors are taller than wide
    scale: 2,
    closedFrameIndex: 8,  // frame shown when door is closed
    openFrameIndex: 12,   // frame shown when door is open
  },

  colors: {
    primary: "#713f12", // dark oak-brown
  },

  animations: {
    open: { frameStart: 8, frameEnd: 12, frameRate: 12, loop: false }, // door swinging open
    idle: { frameStart: 8, frameEnd: 8,  frameRate: 1,  loop: true  }, // static closed position
  },

  behavior: {
    oneTimeUse: false,     // doors can be opened and closed repeatedly
    respawnAfter: 0,       // doors don't despawn
    blocksMovement: true,  // closed door is a solid wall; open door is passable
    triggerRadius: 48,
  },

  loot: {
    dropTable: [],  // doors don't contain loot
    minItems: 0,
    maxItems: 0,
  },

  audio: {
    interactionSound: "/assets/audio/sfx/door_open.wav",   // wooden creak on interaction
    ambientSound:     "/assets/audio/sfx/door_ambient.wav", // faint draft or creak loop
  },
} as const;

export default object_door;
