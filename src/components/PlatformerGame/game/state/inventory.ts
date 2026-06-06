// Player inventory store. One global namespace; each named list (e.g. "inventory_1")
// is an ordered array of item names. Item names match filenames in /config/items/ so
// any consumer can look up the rendered shape/color/etc. of an entry.
//
// Persistence policy (current default): localStorage mirror, wiped on every page load
// so the player starts blank on refresh. The localStorage hook stays in place so
// flipping CLEAR_ON_REFRESH to false makes the inventory survive across refreshes.

const STORAGE_KEY = "GameFoundation.inventories";
const CLEAR_ON_REFRESH = true;

type InventoryMap = Record<string, string[]>;
type Listener = (listName: string) => void;

const inventories: InventoryMap = {};
const listeners = new Set<Listener>();

if (typeof window !== "undefined") {
  try {
    if (CLEAR_ON_REFRESH) {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (parsed && typeof parsed === "object") {
          for (const [name, list] of Object.entries(parsed as InventoryMap)) {
            if (Array.isArray(list)) inventories[name] = list.filter((x) => typeof x === "string");
          }
        }
      }
    }
  } catch {
    // Quota / parse / private-mode errors are non-fatal; start blank.
  }
}

function persist(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(inventories));
  } catch {
    // Ignore — same rationale as above.
  }
}

export function getInventory(listName: string): readonly string[] {
  return inventories[listName] ?? [];
}

export function addToInventory(listName: string, itemName: string): void {
  const list = inventories[listName] ?? [];
  inventories[listName] = [...list, itemName];
  persist();
  for (const fn of listeners) fn(listName);
}

export function onInventoryChange(fn: Listener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
