// Pure rules shared by the engine and the data (text functions read them): zones, worlds, endings, dates.

import { TUNING } from '../data/tuning';
import type { EarlyEndingId, FinalEndingId, GameState, GaugeId, World, WorldState } from './types';
import { PILLARS } from './types';

const clamp = (v: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));

export const isEuropeOpen = (s: Pick<GameState, 'w'>): boolean => s.w.europe >= TUNING.europe.openAt;

/** Keeps Confidence consistent: margin within bounds, the truth always inside estimate ± margin. Mutates `w`. */
export function settleConfidence(w: WorldState): void {
  w.margin = clamp(Math.round(w.margin * 10) / 10, TUNING.confidence.minMargin, TUNING.confidence.maxMargin);
  w.truth = clamp(w.truth);
  w.confidence = clamp(clamp(w.confidence, w.truth - w.margin, w.truth + w.margin));
}

export type Zone = 'pause' | 'race' | 'rupture';
export const zoneOf = (cooperation: number): Zone => (cooperation >= TUNING.zones.pause ? 'pause' : cooperation >= TUNING.zones.race ? 'race' : 'rupture');

/** The pillar at 0, if any (checked in the order Cooperation, Confidence, Cohesion). */
export function fatalGauge(w: WorldState): GaugeId | undefined {
  return PILLARS.find((g) => w[g] <= 0);
}

export const EARLY_BY_GAUGE: Partial<Record<GaugeId, EarlyEndingId>> = {
  cooperation: 'open_conflict',
  confidence: 'runaway_incident',
  cohesion: 'breakdown',
};

export function worldOf(s: Pick<GameState, 'w' | 'tippedAt'>): World {
  if (s.tippedAt === undefined) return isEuropeOpen(s) ? 'plateau_open' : 'plateau_dependent';
  return zoneOf(s.w.cooperation);
}

export const WORLD_ENDINGS: Record<World, { good: FinalEndingId; bad: FinalEndingId }> = {
  pause: { good: 'licensed_utopia', bad: 'unstable_pause' },
  race: { good: 'cognitive_revolution', bad: 'loss_of_control' },
  rupture: { good: 'multipolar_world', bad: 'hot_war' },
  plateau_open: { good: 'bright_winter', bad: 'decentralised_mayhem' },
  plateau_dependent: { good: 'agent_economy', bad: 'silicon_blackmail' },
};

/** The value a world reads for a gauge: Confidence is the true value, revealed at the end. */
export const endValue = (w: WorldState, k: 'confidence' | 'cohesion'): number => Math.round(k === 'confidence' ? w.truth : w.cohesion);

/** The v3 tree: each world has a deciding gauge and a safety net; the good ending needs both. */
export function finalEnding(s: Pick<GameState, 'w' | 'tippedAt'>): { id: FinalEndingId; world: World; good: boolean; decidesMet: boolean; netMet: boolean } {
  const world = worldOf(s);
  const r = TUNING.worlds[world];
  const decidesMet = endValue(s.w, r.decides) >= r.target;
  const netMet = endValue(s.w, r.net) >= r.floor;
  const good = decidesMet && netMet;
  return { id: good ? WORLD_ENDINGS[world].good : WORLD_ENDINGS[world].bad, world, good, decidesMet, netMet };
}

/** Takeoff speed band, in words, from the hidden multiplier. */
export function takeoffBand(takeoff: number): 'slow' | 'steady' | 'fast' {
  const t = TUNING.aiPower.takeoff;
  if (takeoff < (t.slow.max + t.steady.min) / 2) return 'slow';
  if (takeoff < (t.steady.max + t.fast.min) / 2) return 'steady';
  return 'fast';
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
/** "March 2027" for a month count since January 2027. */
export function dateLabel(month: number): string {
  const m = Math.floor(month + 1e-9);
  return `${MONTHS[m % 12]} ${2027 + Math.floor(m / 12)}`;
}
