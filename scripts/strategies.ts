// Player strategies for the simulation (scripts/sim.ts) and the balance tests.
// A strategy sees the state and the card, and returns a side. The skilled strategies read the true effects of
// each answer: they stand for a player who has learned the game over many runs.

import { answer, answerOf, cardOf, newGame, result } from '../src/engine';
import { nextRandom, seedToRng } from '../src/engine/rng';
import type { EndingResult, GameState, GaugeId, Side } from '../src/engine/types';
import { GAUGES } from '../src/engine/types';

export interface Strategy {
  name: string;
  choose: (s: GameState, rnd: () => number) => Side;
}

/** Cost of a gauge position: grows steeply toward 0 and 100. */
const gaugeCost = (v: number) => {
  const d = Math.abs(v - 50);
  return d * d + (v <= 0 || v >= 100 ? 1e6 : 0) + (d > 35 ? (d - 35) ** 3 : 0);
};

function after(s: GameState, side: Side): Record<GaugeId, number> {
  const e = answerOf(cardOf(s), side).effects;
  return Object.fromEntries(GAUGES.map((g) => [g, Math.max(0, Math.min(100, s.gauges[g] + (e[g] ?? 0)))])) as Record<GaugeId, number>;
}
const cost = (g: Record<GaugeId, number>) => GAUGES.reduce((a, k) => a + gaugeCost(g[k]), 0);

export const alwaysLeft: Strategy = { name: 'always left', choose: () => 'left' };
export const alwaysRight: Strategy = { name: 'always right', choose: () => 'right' };
export const randomStrategy: Strategy = { name: 'random', choose: (_s, rnd) => (rnd() < 0.5 ? 'left' : 'right') };

/** Keeps the gauges near 50; ignores what it cannot see. */
export const balancer: Strategy = {
  name: 'balancer',
  choose: (s, rnd) => {
    const c = cardOf(s);
    if (!c.right) return 'left';
    const l = cost(after(s, 'left'));
    const r = cost(after(s, 'right'));
    return l === r ? (rnd() < 0.5 ? 'left' : 'right') : l < r ? 'left' : 'right';
  },
};

/** A balancer that also favours Safety and Cooperation (it has learned which answers help them). */
export const thoughtful: Strategy = {
  name: 'thoughtful',
  choose: (s, rnd) => {
    const c = cardOf(s);
    if (!c.right) return 'left';
    const score = (side: Side) => {
      const e = answerOf(c, side).effects;
      return cost(after(s, side)) - THOUGHT_WEIGHT * (2 * (e.safety ?? 0) + (e.coop ?? 0));
    };
    const l = score('left');
    const r = score('right');
    return l === r ? (rnd() < 0.5 ? 'left' : 'right') : l < r ? 'left' : 'right';
  },
};
export const THOUGHT_WEIGHT = 60;

export const STRATEGIES: Strategy[] = [alwaysLeft, alwaysRight, randomStrategy, balancer, thoughtful];

export interface PlayedRun {
  seed: number;
  final: GameState;
  result: EndingResult;
  cards: number;
}

export function playRun(strategy: Strategy, seed: number, unlocked: string[] = []): PlayedRun {
  let s = newGame({ seed, run: 1, unlocked, tutorial: false });
  let rng = seedToRng(seed * 7919 + 13);
  const rnd = () => {
    const [v, n] = nextRandom(rng);
    rng = n;
    return v;
  };
  let cards = 0;
  while (s.phase !== 'over' && cards < 500) {
    s = answer(s, strategy.choose(s, rnd));
    cards++;
  }
  return { seed, final: s, result: result(s), cards };
}
