// Item registry — auto-discovers every item file in this folder and keys them by filename.
// Drop a new file in /config/items/ and it is picked up automatically; no manual registration needed.

type ItemModule = { default: unknown };

// require.context is a Webpack/Turbopack runtime feature (Next.js supports both).
const ctx = (
  require as unknown as {
    context: (
      directory: string,
      useSubdirectories?: boolean,
      regExp?: RegExp,
    ) => { keys: () => string[]; (id: string): ItemModule };
  }
).context("./", false, /^\.\/(?!index\.)[A-Za-z0-9_]+\.ts$/);

const items: Record<string, unknown> = {};
for (const key of ctx.keys()) {
  const name = key.replace(/^\.\//, "").replace(/\.ts$/, "");
  items[name] = ctx(key).default;
}

export type ItemName = string;
export default items;
