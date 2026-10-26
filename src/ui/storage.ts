// What survives between runs: the envoy counter, the endings reached, the goals completed.
// Saved in localStorage when it works; the game plays the same without it (every access is wrapped).

import type { EndingId } from '../engine/types';

export interface Meta {
  /** Runs started (the next envoy is runs + 1). */
  runs: number;
  /** Runs finished. */
  finished: number;
  endings: EndingId[];
  goals: string[];
  /** The tutorial has been seen. */
  tutorialDone: boolean;
}

const KEY = 'takeoff-reign-version:v1';
export const emptyMeta = (): Meta => ({ runs: 0, finished: 0, endings: [], goals: [], tutorialDone: false });

export function loadMeta(): Meta {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return emptyMeta();
    const m = JSON.parse(raw) as Partial<Meta>;
    return {
      runs: Number.isFinite(m.runs) ? Number(m.runs) : 0,
      finished: Number.isFinite(m.finished) ? Number(m.finished) : 0,
      endings: Array.isArray(m.endings) ? m.endings.filter((x) => typeof x === 'string') : [],
      goals: Array.isArray(m.goals) ? m.goals.filter((x) => typeof x === 'string') : [],
      tutorialDone: m.tutorialDone === true,
    };
  } catch {
    return emptyMeta();
  }
}

export function saveMeta(m: Meta): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(m));
  } catch {
    /* private mode or storage blocked: the run counter simply restarts next time */
  }
}
