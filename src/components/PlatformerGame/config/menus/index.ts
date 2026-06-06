// Menu registry — auto-discovers every menu file in this folder and keys them by filename.
// Drop a new file in /config/menus/ and it is picked up automatically; no manual registration needed.

type MenuModule = { default: unknown };

// require.context is a Webpack/Turbopack runtime feature (Next.js supports both).
const ctx = (
  require as unknown as {
    context: (
      directory: string,
      useSubdirectories?: boolean,
      regExp?: RegExp,
    ) => { keys: () => string[]; (id: string): MenuModule };
  }
).context("./", false, /^\.\/(?!index\.)[A-Za-z0-9_]+\.ts$/);

const menus: Record<string, unknown> = {};
for (const key of ctx.keys()) {
  const name = key.replace(/^\.\//, "").replace(/\.ts$/, "");
  menus[name] = ctx(key).default;
}

export type MenuName = string;
export default menus;
