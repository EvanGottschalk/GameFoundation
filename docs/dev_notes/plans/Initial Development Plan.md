You are building a standalone React + Next.js platformer game component powered by Phaser. Your task is to generate the full set of configuration files for this game. These files are data only — no game logic, no functions, no classes. All values are exported as a single typed object per file.

Rules for every config file
Written in TypeScript
Exports one const as the default export — a plain object with all key-value pairs
All values must be JSON-serializable (strings, numbers, booleans, arrays, nested objects — no functions, no classes, no Phaser types)
Use as const on the export so values are narrowly typed and readonly
Every key must have an inline comment explaining what it controls
Group related keys under nested objects with a descriptive parent key (e.g. physics, sprites, audio, animations, abilities)
File paths use forward slashes and start with /assets/ (e.g. /assets/sprites/player.png)
Colors are hex strings (e.g. "#3b82f6")
Sizes and positions are numbers in pixels
Durations are numbers in milliseconds
Velocities and forces are numbers in pixels-per-second or pixels-per-second-squared

File structure to generate
Generate all of the following files. Place them inside src/components/PlatformerGame/config/.
config/
  player.ts
  global.ts
  display.ts
  dialogue.ts
  characters/
    npc_villager.ts
    npc_merchant.ts
    npc_guard.ts
  zones/
    zone_overworld.ts
    zone_dungeon.ts
    zone_village.ts
  items/
    item_coin.ts
    item_health_potion.ts
    item_sword.ts
  objects/
    object_chest.ts
    object_door.ts
    object_sign.ts


File specifications

config/player.ts
The player character config. Must include nested groups for each of the following:
sprites
Path to the sprite sheet image
Frame width and height
Scale factor
colors
Primary body color
Outline/border color
Hit flash color (shown briefly when player takes damage)
physics
Movement speed (horizontal, pixels/sec)
Jump velocity (negative number, applied upward)
Gravity multiplier (relative to global gravity — 1.0 = same as global)
Maximum fall speed (terminal velocity)
Ground friction (0–1 scale)
Air control factor (0–1 scale, how much horizontal control mid-air)
Bounce factor (0–1 scale)
Coyote time duration (ms — how long after walking off a ledge can the player still jump)
Jump buffer duration (ms — how early before landing a jump input is accepted)
animations
For each animation state (idle, run, jump, fall, land, hurt, die): frame start, frame end, frame rate, whether it loops
abilities
Double jump enabled (boolean)
Wall slide enabled (boolean)
Wall slide friction (pixels/sec downward while sliding)
Dash enabled (boolean)
Dash speed (pixels/sec)
Dash duration (ms)
Dash cooldown (ms)
stats
Max health points
Starting health points
Invincibility duration after being hit (ms)
Base attack damage
Base defense rating
Experience points to reach each level (array of numbers, one per level up to level 10)
inventory
Max item slots
Starting items (array of item name strings)
Starting currency amount
audio
Sound effect file paths for: jump, land, hurt, die, attack, pick up item, level up

config/global.ts
Global gameplay config. Must include nested groups for:
physics
World gravity (pixels/sec²)
Default bounce factor
Default friction
Terminal velocity (max fall speed for all entities)
camera
Follow lerp factor (0–1, how smoothly the camera tracks the player)
Deadzone width and height (pixels — region in which camera does not move)
Zoom level
rewards
Base experience points per enemy defeated
Experience multiplier per player level
Base coin drop min and max
Rare drop chance (0–1 scale)
timing
Game tick rate (ms)
Auto-save interval (ms)
Respawn delay after death (ms)
Scene transition duration (ms)
difficulty
Enemy health multiplier
Enemy damage multiplier
Player damage multiplier
Experience multiplier
audio
Master volume (0–1)
Music volume (0–1)
SFX volume (0–1)
colors
Background default color
UI primary color
UI secondary color
Damage number color
Heal number color
XP number color

config/display.ts
Game window and rendering config. Must include:
window
Canvas width and height (pixels)
Whether to scale to fit the browser window (boolean)
Scale mode string ("FIT", "ENVELOP", or "NONE")
Background color
Target frame rate (number)
Whether to show the FPS counter (boolean)
Whether to enable antialiasing (boolean)
ui
HUD padding from screen edges (top, right, bottom, left — all pixels)
Health bar width, height, colors (full, empty, border)
Minimap position and size
Font family (string)
Font sizes for: body, heading, tooltip, damage numbers
Icon size (pixels)
debug
Show physics bodies (boolean)
Show tile borders (boolean)
Show entity hitboxes (boolean)
Log scene transitions (boolean)

config/dialogue.ts
In-game dialogue and NPC conversation config. Must include:
box
Width and height of the dialogue box (pixels)
Position anchor ("bottom", "top", "center")
Padding inside the box
Background color
Border color and width
Border radius
Opacity (0–1)
text
Font family
Font size
Text color
Line height
Character reveal speed (ms per character — for typewriter effect)
Max characters per line
portrait
Whether to show NPC portrait image (boolean)
Portrait width and height
Portrait border color
Portrait offset x and y from box edge
controls
Key to advance dialogue ("SPACE", "ENTER", etc.)
Key to skip/fast-forward typewriter effect
Auto-advance delay (ms — 0 means never auto-advance)
options
Max number of response options to show
Option highlight color
Option text color
Option selected indicator character (e.g. "▶")
audio
Typewriter tick sound file path
Dialogue open sound file path
Dialogue close sound file path

config/characters/npc_villager.ts (and npc_merchant.ts, npc_guard.ts)
Each NPC config file must follow this structure:
identity
Display name (string)
Description (string, one sentence)
Role ("friendly", "merchant", "hostile", "neutral")
sprites
Sprite sheet path
Frame width and height
Scale
colors
Primary color
Secondary color
Name label color
physics
Movement speed
Gravity multiplier
Can patrol (boolean)
Patrol distance (pixels each direction)
animations
Same structure as player animations: idle, walk, hurt, die
stats
Max health
Attack damage
Defense
Detection radius (pixels — how close the player must be to trigger interaction)
Aggro radius (for hostile NPCs — 0 for friendly)
dialogue
Greeting lines (array of strings — one is chosen at random)
Farewell lines (array of strings)
Conversation trees (array of objects, each with a prompt string and response string)
audio
Ambient idle sound path (or empty string)
Hurt sound path
Greeting sound path (or empty string)
loot
Drop table: array of objects, each with itemName (string) and chance (0–1)

config/zones/zone_overworld.ts (and zone_dungeon.ts, zone_village.ts)
Each zone config must include:
identity
Zone name (string)
Zone type ("outdoor", "indoor", "dungeon")
Description
tilemap
Tilemap JSON file path
Tileset image file path
Tile width and height
Map width and height in tiles
appearance
Sky/background color
Parallax background layers: array of objects with imagePath and scrollFactor (0–1)
Ambient light color
Ambient light intensity (0–1)
physics
Gravity override (or null to use global)
Whether the zone has water (boolean)
Water drag factor
npcs
Array of NPC spawn entries, each with: characterName (string), x, y, facing ("left" or "right")
items
Array of item spawn entries, each with: itemName (string), x, y
objects
Array of object spawn entries, each with: objectName (string), x, y
audio
Background music file path
Ambient sound file path (wind, birds, etc. — or empty string)
Music loop start time (seconds)
Music volume override (or null to use global)
transitions
Array of zone exit triggers, each with: toZone (string), triggerX, triggerY, triggerWidth, triggerHeight

config/items/item_coin.ts (and item_health_potion.ts, item_sword.ts)
Each item config must include:
identity
Item name (string)
Display name (string)
Description (one sentence)
Type ("currency", "consumable", "weapon", "armor", "key", "misc")
Rarity ("common", "uncommon", "rare", "legendary")
Stackable (boolean)
Max stack size (number — 1 if not stackable)
sprites
Sprite sheet or image path
Frame index (if sprite sheet)
Scale
World icon scale (when the item is lying on the ground)
colors
Primary color (used for programmatic rendering fallback)
Rarity glow color
stats
For weapons: attack damage bonus, attack speed, range (pixels), knockback force
For consumables: health restore, mana restore, duration of any effect (ms)
For currency: coin value
audio
Pickup sound path
Use/equip sound path (or empty string)
Drop sound path
physics
Whether the item is affected by gravity when dropped (boolean)
Bounce factor when dropped
Pick-up radius (pixels — how close player must be)

config/objects/object_chest.ts (and object_door.ts, object_sign.ts)
Each object config must include:
identity
Object name (string)
Display name (string)
Description
Type ("container", "door", "decoration", "hazard", "npc_trigger")
Interactable (boolean)
Interaction prompt text (string — e.g. "Press E to open")
sprites
Sprite sheet path
Frame width and height
Scale
Open/closed frame indices (where applicable)
colors
Primary color
animations
Open animation: frame start, frame end, frame rate, loop
Idle animation: frame start, frame end, frame rate, loop
behavior
One-time use (boolean — e.g. chest can only be opened once)
Respawn after (ms — 0 means never respawns)
Blocks player movement (boolean)
Trigger radius (pixels — how close player must be to interact)
loot (for containers)
Loot table: array of objects with itemName and chance (0–1)
Min and max number of items to drop
audio
Interaction sound path
Ambient sound path (or empty string)

Final instructions for Claude Code
Generate every file listed above. Do not skip any.
Populate every file with realistic, sensible placeholder values — do not use zeroes or empty strings unless that is genuinely the correct default. Values should be internally consistent (e.g. jump velocity should be strong enough to overcome gravity given the gravity value in global.ts).
For file paths, use the pattern /assets/[category]/[name].[ext] with realistic filenames (e.g. /assets/sprites/player_sheet.png, /assets/audio/sfx/jump.wav).
Use as const at the end of every exported object.
Every file should have a brief single-line comment at the top explaining what the file configures.
After generating all config files, output a brief index showing every file path and its purpose in a single summary block.
