// Shine effect registry — auto-discovers every shine template in this folder and keys them by their `name`.
// Drop a new file in /config/effects/shine/ and it is picked up automatically; reference it from an asset's
// `effects` list by its `name` value (e.g. { shine: "Black Streak" }). No manual registration needed.

type ShineModule = { default: { name: string } };

// require.context is a Webpack/Turbopack runtime feature (Next.js supports both).
const ctx = (
  require as unknown as {
    context: (
      directory: string,
      useSubdirectories?: boolean,
      regExp?: RegExp,
    ) => { keys: () => string[]; (id: string): ShineModule };
  }
).context("./", false, /^\.\/(?!index\.)[A-Za-z0-9_]+\.ts$/);

const shineEffects: Record<string, unknown> = {};
for (const key of ctx.keys()) {
  const effect = ctx(key).default;
  shineEffects[effect.name] = effect;
}

export default shineEffects;
