// Controls registry — auto-discovers every control scheme in this folder and keys them by filename.
// Drop a new file in /config/controls/ (e.g. desktop.ts, mobile.ts, gamepad.ts) and it is picked up
// automatically; the active scheme is selected at runtime based on the player's platform.

type ControlsModule = { default: unknown };

// require.context is a Webpack/Turbopack runtime feature (Next.js supports both).
const ctx = (
  require as unknown as {
    context: (
      directory: string,
      useSubdirectories?: boolean,
      regExp?: RegExp,
    ) => { keys: () => string[]; (id: string): ControlsModule };
  }
).context("./", false, /^\.\/(?!index\.)[A-Za-z0-9_]+\.ts$/);

const controls: Record<string, unknown> = {};
for (const key of ctx.keys()) {
  const name = key.replace(/^\.\//, "").replace(/\.ts$/, "");
  controls[name] = ctx(key).default;
}

export type ControlsName = string;
export default controls;
