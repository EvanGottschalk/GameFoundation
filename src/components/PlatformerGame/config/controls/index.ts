// Controls registry — exposes the central short-name → action mapping (controls.ts)
// alongside per-platform input assignments (desktop/input_assignment.ts, mobile/input_assignment.ts, ...).
//
// Chain at runtime:
//   real input (key/gesture)  →  short name           →  action name        →  action_types
//   ─────────────────────────    ──────────────────       ────────────────       ──────────────
//   <platform>/input_assignment   controls (this file)    /config/actions/<name>.ts
//
// Drop a new `<platform>/input_assignment.ts` file (e.g. gamepad/input_assignment.ts) and the
// platform is picked up automatically (the platform key is the parent folder's name).

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
).context("./", true, /^\.\/[A-Za-z0-9_]+\/input_assignment\.ts$/);

const inputAssignments: Record<string, Record<string, string>> = {};
for (const key of ctx.keys()) {
  const match = key.match(/^\.\/([A-Za-z0-9_]+)\/input_assignment\.ts$/);
  if (!match) continue;
  inputAssignments[match[1]] = ctx(key).default;
}

export { controls, inputAssignments };
export default controls;
