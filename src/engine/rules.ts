// Pure rules shared by the engine and the data (text functions read them): steadiness, worlds, endings.

import { TUNING } from '../data/tuning';
import type { EarlyEndingId, FinalEndingId, GameState, GaugeId, World } from './types';
import { GAUGES } from './types';

const E = TUNING.endings;

/** 100 when every gauge sits at 50, 0 when every gauge sits at 0 or 100. */
export function steadiness(gauges: Record<GaugeId, number>): number {
  const dev = GAUGES.reduce((a, g) => a + Math.abs(gauges[g] - 50), 0) / GAUGES.length;
  return Math.round(100 - 2 * dev);
}

export const isEuropeOpen = (s: Pick<GameState, 'hidden'>): boolean => s.hidden.europe >= E.openAt;

/** The gauge at an extreme, if any (checked in gauge order). */
export function fatalGauge(gauges: Record<GaugeId, number>): { gauge: GaugeId; high: boolean } | undefined {
  for (const g of GAUGES) {
    if (gauges[g] <= 0) return { gauge: g, high: false };
    if (gauges[g] >= 100) return { gauge: g, high: true };
  }
  return undefined;
}

export const EARLY_BY_GAUGE: Record<GaugeId, [EarlyEndingId, EarlyEndingId]> = {
  labs: ['exodus', 'capture'],
  citizens: ['apathy', 'patchwork'],
  allies: ['isolated', 'absorbed'],
  oversight: ['blindsided', 'overreach'],
};

export function worldOf(s: Pick<GameState, 'hidden' | 'tippedAt'>): World {
  if (s.tippedAt === undefined) return isEuropeOpen(s) ? 'plateau_open' : 'plateau_dependent';
  if (s.hidden.coop >= E.pauseCoop) return 'pause';
  if (s.hidden.coop >= E.raceCoop) return 'race';
  return 'rupture';
}

export const WORLD_ENDINGS: Record<World, { good: FinalEndingId; bad: FinalEndingId }> = {
  pause: { good: 'licensed_utopia', bad: 'unstable_pause' },
  race: { good: 'cognitive_revolution', bad: 'loss_of_control' },
  rupture: { good: 'multipolar_world', bad: 'hot_war' },
  plateau_open: { good: 'bright_winter', bad: 'decentralised_mayhem' },
  plateau_dependent: { good: 'agent_economy', bad: 'silicon_blackmail' },
};

/** The v3 tree: each world has a deciding value and a safety net; the good ending needs both. */
export function finalEnding(s: Pick<GameState, 'hidden' | 'tippedAt' | 'gauges'>): { id: FinalEndingId; world: World; good: boolean } {
  const world = worldOf(s);
  const safety = s.hidden.safety;
  const st = steadiness(s.gauges);
  let good: boolean;
  switch (world) {
    case 'pause':
      good = safety >= E.pause.safety && st >= E.pause.steadiness;
      break;
    case 'race':
      good = safety >= E.race.safety && st >= E.race.steadiness;
      break;
    case 'rupture':
      good = st >= E.rupture.steadiness && safety >= E.rupture.safety;
      break;
    default:
      good = st >= E.plateau.steadiness && safety >= E.plateau.safety;
  }
  return { id: good ? WORLD_ENDINGS[world].good : WORLD_ENDINGS[world].bad, world, good };
}

/** Takeoff speed band, in words, from the hidden multiplier. */
export function takeoffBand(takeoff: number): 'slow' | 'steady' | 'fast' {
  const t = TUNING.progress.takeoff;
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
