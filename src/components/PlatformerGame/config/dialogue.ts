// Dialogue system configuration — box appearance, typewriter text, NPC portraits, and controls

const dialogue = {
  box: {
    width: 720,              // dialogue box width in pixels
    height: 160,             // dialogue box height in pixels
    anchor: "bottom",        // vertical placement: "bottom" | "top" | "center"
    padding: 20,             // inner padding between box edge and content in pixels
    backgroundColor: "#0f172a", // background fill color of the dialogue box
    borderColor: "#3b82f6",  // border stroke color
    borderWidth: 2,          // border thickness in pixels
    borderRadius: 8,         // corner rounding radius in pixels
    opacity: 0.92,           // box background opacity (0 = transparent, 1 = opaque)
  },

  text: {
    fontFamily: "'Press Start 2P', monospace", // font used for dialogue body text
    fontSize: 12,            // dialogue text size in pixels
    color: "#e2e8f0",        // text color
    lineHeight: 1.6,         // line-height multiplier
    revealSpeed: 30,         // ms per character for the typewriter reveal effect
    maxCharsPerLine: 60,     // maximum characters before wrapping to the next line
  },

  portrait: {
    show: true,              // whether to render an NPC portrait beside the dialogue text
    width: 96,               // portrait image display width in pixels
    height: 96,              // portrait image display height in pixels
    borderColor: "#3b82f6",  // color of the border drawn around the portrait
    offsetX: 16,             // horizontal offset from the left edge of the dialogue box
    offsetY: 0,              // vertical offset from the top edge of the dialogue box
  },

  controls: {
    advanceKey: "SPACE",       // keyboard key used to advance to the next line
    skipKey: "SHIFT",          // key that instantly completes the typewriter reveal
    autoAdvanceDelay: 0,       // ms to wait before auto-advancing (0 = never auto-advance)
  },

  options: {
    maxVisible: 4,             // maximum response options shown at once
    highlightColor: "#3b82f6", // background highlight on the focused option
    textColor: "#e2e8f0",      // color of option text when not highlighted
    selectedIndicator: "▶",    // character prepended to the currently selected option
  },

  audio: {
    typewriterTick: "/assets/audio/sfx/dialogue_tick.wav",  // sound played per character reveal
    openSound:      "/assets/audio/sfx/dialogue_open.wav",  // sound when dialogue box appears
    closeSound:     "/assets/audio/sfx/dialogue_close.wav", // sound when dialogue box closes
  },
} as const;

export default dialogue;
