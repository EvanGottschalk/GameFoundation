// Controls registry — exposes the central short-name → action mapping (controls.ts)
// alongside per-platform input assignments (desktop_input_assignment.ts, mobile_input_assignment.ts, ...).
//
// Chain at runtime:
//   real input (key/gesture)  →  short name           →  action name        →  action_types
//   ─────────────────────────    ──────────────────       ────────────────       ──────────────
//   <platform>_input_assignment   controls (this file)    /config/actions/<name>.ts
//
// Drop a new `<platform>_input_assignment.ts` file in this folder and the platform is picked up
// automatically (the platform key is the file's prefix).

import controls from "./controls";

type AssignmentModule = { default: Record<string, string> };

const ctx = (
  require as unknown as {
    context: (
      directory: string,
      useSubdirectories?: boolean,
      regExp?: RegExp,
    ) => { keys: () => string[]; (id: string): AssignmentModule };
  }
).context("./", false, /^\.\/[A-Za-z0-9_]+_input_assignment\.ts$/);

const inputAssignments: Record<string, Record<string, string>> = {};
for (const key of ctx.keys()) {
  const match = key.match(/^\.\/([A-Za-z0-9_]+)_input_assignment\.ts$/);
  if (!match) continue;
  inputAssignments[match[1]] = ctx(key).default;
}

export { controls, inputAssignments };
export default controls;
