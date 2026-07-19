import { projects } from "../content/projects";
import { music } from "../content/music";
import { careerPlanets } from "../content/career";

export const DWELL_MS = 5000;
const STORAGE_KEY = "rohsomeness-coins-v1";

export type CoinSpot = {
  id: string;
  label: string;
};

/** All collectible “things” you can stand on for 5s. */
export function allCoinSpots(): CoinSpot[] {
  const spots: CoinSpot[] = [
    { id: "career:launch-pad", label: "Launch pad" },
    ...careerPlanets.map((p) => ({
      id: `career:${p.id}`,
      label: p.name,
    })),
    ...projects.map((p) => ({
      id: `project:${p.id}`,
      label: p.title,
    })),
    ...music.map((m) => ({
      id: `music:${m.id}`,
      label: m.title,
    })),
    { id: "story:about", label: "My Story" },
    { id: "story:links", label: "Links & Resume" },
  ];
  return spots;
}

export function totalCoins(): number {
  return allCoinSpots().length;
}

type CoinState = {
  collected: string[];
  shades: boolean;
};

function loadState(): CoinState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { collected: [], shades: false };
    const parsed = JSON.parse(raw) as CoinState;
    return {
      collected: Array.isArray(parsed.collected) ? parsed.collected : [],
      shades: !!parsed.shades,
    };
  } catch {
    return { collected: [], shades: false };
  }
}

function saveState(state: CoinState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

let state = loadState();
const listeners = new Set<() => void>();

export function subscribeCoins(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notify(): void {
  for (const fn of listeners) fn();
  refreshCoinHud();
}

export function getCollectedCount(): number {
  return state.collected.length;
}

export function hasCoin(id: string): boolean {
  return state.collected.includes(id);
}

export function hasShades(): boolean {
  return state.shades || getCollectedCount() >= totalCoins();
}

export function collectCoin(id: string): boolean {
  if (state.collected.includes(id)) return false;
  const valid = allCoinSpots().some((s) => s.id === id);
  if (!valid) return false;
  state.collected.push(id);
  if (state.collected.length >= totalCoins()) {
    state.shades = true;
  }
  saveState(state);
  notify();
  return true;
}

export function markShadesUnlocked(): void {
  state.shades = true;
  saveState(state);
  notify();
}

/** Just collected the final coin this call? */
export function justCompletedAll(prevCount: number): boolean {
  return prevCount < totalCoins() && getCollectedCount() >= totalCoins();
}

export function refreshCoinHud(): void {
  const el = document.getElementById("coin-count");
  if (el) el.textContent = `${getCollectedCount()} / ${totalCoins()}`;
  const wrap = document.getElementById("coin-hud");
  if (wrap) {
    wrap.classList.toggle("complete", getCollectedCount() >= totalCoins());
  }
}

// —— Dwell timer (per active hotspot) ——

let dwellId: string | null = null;
let dwellAccum = 0;

/**
 * Call each frame with the current coin spot id under the player, or null.
 * Returns progress 0–1 for the ring UI, and whether a coin was just earned.
 */
export function tickDwell(
  spotId: string | null,
  deltaMs: number,
): { progress: number; earnedId: string | null; completeWin: boolean } {
  if (!spotId || hasCoin(spotId)) {
    dwellId = null;
    dwellAccum = 0;
    return { progress: 0, earnedId: null, completeWin: false };
  }

  if (dwellId !== spotId) {
    // Left before finish → full reset; new spot starts fresh
    dwellId = spotId;
    dwellAccum = 0;
  }

  dwellAccum += deltaMs;
  const progress = Math.min(1, dwellAccum / DWELL_MS);

  if (progress >= 1) {
    const prev = getCollectedCount();
    const earned = collectCoin(spotId);
    dwellId = null;
    dwellAccum = 0;
    return {
      progress: 0,
      earnedId: earned ? spotId : null,
      completeWin: earned && justCompletedAll(prev),
    };
  }

  return { progress, earnedId: null, completeWin: false };
}

export function resetDwell(): void {
  dwellId = null;
  dwellAccum = 0;
}

/** Update circular progress ring over the player / hotspot. */
export function setDwellRing(
  visible: boolean,
  progress: number,
  screenX?: number,
  screenY?: number,
): void {
  const ring = document.getElementById("dwell-ring");
  if (!ring) return;
  if (!visible || progress <= 0) {
    ring.classList.add("hidden");
    return;
  }
  ring.classList.remove("hidden");
  const circ = 2 * Math.PI * 18; // r=18
  const fill = ring.querySelector(".dwell-ring-fill") as SVGCircleElement | null;
  if (fill) {
    fill.style.strokeDasharray = `${circ}`;
    fill.style.strokeDashoffset = `${circ * (1 - progress)}`;
  }
  if (screenX != null && screenY != null) {
    ring.style.left = `${screenX}px`;
    ring.style.top = `${screenY}px`;
  }
}

export function flashCoinToast(label: string): void {
  const el = document.getElementById("coin-toast");
  if (!el) return;
  el.textContent = `+1 coin · ${label}`;
  el.classList.remove("hidden");
  el.classList.add("show");
  window.setTimeout(() => {
    el.classList.remove("show");
    window.setTimeout(() => el.classList.add("hidden"), 300);
  }, 1600);
}
