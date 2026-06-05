// Action registry — auto-discovers every action file in this folder and keys them by filename.
// Drop a new file in /config/actions/ and it is picked up automatically; no manual registration needed.

type ActionModule = { default: unknown };

// require.context is a Webpack/Turbopack runtime feature (Next.js supports both).
const ctx = (
  require as unknown as {
    context: (
      directory: string,
      useSubdirectories?: boolean,
      regExp?: RegExp,
    ) => { keys: () => string[]; (id: string): ActionModule };
  }
).context("./", false, /^\.\/(?!index\.)[A-Za-z0-9_]+\.ts$/);

const actions: Record<string, unknown> = {};
for (const key of ctx.keys()) {
  const name = key.replace(/^\.\//, "").replace(/\.ts$/, "");
  actions[name] = ctx(key).default;
}

export type ActionName = string;
export default actions;
