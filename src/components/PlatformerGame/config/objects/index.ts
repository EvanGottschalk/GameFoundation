// Object registry — auto-discovers every object file in this folder and keys them by filename.
// Drop a new file in /config/objects/ and it is picked up automatically; no manual registration needed.

type ObjectModule = { default: unknown };

// require.context is a Webpack/Turbopack runtime feature (Next.js supports both).
const ctx = (
  require as unknown as {
    context: (
      directory: string,
      useSubdirectories?: boolean,
      regExp?: RegExp,
    ) => { keys: () => string[]; (id: string): ObjectModule };
  }
).context("./", false, /^\.\/(?!index\.)[A-Za-z0-9_]+\.ts$/);

const objects: Record<string, unknown> = {};
for (const key of ctx.keys()) {
  const name = key.replace(/^\.\//, "").replace(/\.ts$/, "");
  objects[name] = ctx(key).default;
}

export type ObjectName = string;
export default objects;
