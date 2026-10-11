import { Walk, BucketItem } from "./types";

const WALKS_KEY = "sanpo_walks";
const BUCKET_KEY = "sanpo_bucket";

// ---- Walks ----
export function getWalks(): Walk[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(WALKS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveWalk(walk: Walk): void {
  const walks = getWalks();
  const idx = walks.findIndex((w) => w.id === walk.id);
  if (idx >= 0) walks[idx] = walk;
  else walks.unshift(walk);
  localStorage.setItem(WALKS_KEY, JSON.stringify(walks));
}

export function getWalk(id: string): Walk | null {
  return getWalks().find((w) => w.id === id) || null;
}

// ---- Bucket list ----
const DEFAULT_PLACES = [
  "RK Beach (Rama Krishna Beach), Vizag",
  "Araku Valley — coffee, waterfalls, tribal art",
  "Borra Caves — million-year-old stalactites",
  "Simhachalam Temple, Vizag",
  "Kailasagiri Hill Park, Vizag",
  "Lambasingi — 'Kashmir of Andhra'",
  "Yarada Beach (hidden gem near Vizag)",
  "Rishikonda Beach, Vizag",
  "Baga Beach, Goa",
  "Dudhsagar Falls, Goa",
  "Old Goa Basilica of Bom Jesus",
  "Victoria Memorial, Kolkata",
  "Sundarbans Mangrove Forest, West Bengal",
  "Darjeeling — tea gardens & toy train",
];

export function getBucketList(): BucketItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = JSON.parse(localStorage.getItem(BUCKET_KEY) || "null");
    if (stored) return stored;
  } catch {
    /* ignore */
  }
  // first visit — init defaults
  const defaults: BucketItem[] = DEFAULT_PLACES.map((name, i) => ({
    id: String(i),
    name,
    done: false,
  }));
  localStorage.setItem(BUCKET_KEY, JSON.stringify(defaults));
  return defaults;
}

export function saveBucketList(items: BucketItem[]): void {
  localStorage.setItem(BUCKET_KEY, JSON.stringify(items));
}
