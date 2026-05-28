// Zone registry — auto-discovers every zone file in this folder and keys them by filename.
// Drop a new file in /config/zones/ and it is picked up automatically; no manual registration needed.

type ZoneModule = { default: unknown };

// require.context is a Webpack/Turbopack runtime feature (Next.js supports both).
const ctx = (
  require as unknown as {
    context: (
      directory: string,
      useSubdirectories?: boolean,
      regExp?: RegExp,
    ) => { keys: () => string[]; (id: string): ZoneModule };
  }
).context("./", false, /^\.\/(?!index\.)[A-Za-z0-9_]+\.ts$/);

const zones: Record<string, unknown> = {};
for (const key of ctx.keys()) {
  const name = key.replace(/^\.\//, "").replace(/\.ts$/, "");
  zones[name] = ctx(key).default;
}

export type ZoneName = string;
export default zones;
