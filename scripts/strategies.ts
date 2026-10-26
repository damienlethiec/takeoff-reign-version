// Player strategies for the simulation (scripts/sim.ts) and the balance tests.
// A strategy sees the state and the card, and returns a side. The skilled strategies read the true effects of
// each answer: they stand for a player who has learned the game over many games.

import { answer, answerOf, cardOf, newGame, result, scaled } from '../src/engine';
import { settleConfidence } from '../src/engine/rules';
import { nextRandom, seedToRng } from '../src/engine/rng';
import type { EndingResult, GameState, Side, WorldState } from '../src/engine/types';
import { EFFECT_KEYS } from '../src/engine/types';

export interface Strategy {
  name: string;
  choose: (s: GameState, rnd: () => number) => Side;
}

/** The world after an answer (before time passes). */
export function after(s: GameState, side: Side): WorldState {
  const e = scaled(answerOf(cardOf(s), side).effects);
  const w = { ...s.w };
  for (const k of EFFECT_KEYS) if (e[k]) w[k] = k === 'margin' ? w[k] + e[k]! : Math.max(0, Math.min(100, w[k] + e[k]!));
  settleConfidence(w);
  return w;
}

/** Cost of a pillar's value: grows steeply toward 0 (a collapse), gently elsewhere. */
export const pillarCost = (v: number) => (v <= 0 ? 1e6 : (100 - v) ** 2 / 100 + (v < 25 ? (25 - v) ** 3 / 10 : 0));

const pick = (l: number, r: number, rnd: () => number): Side => (l === r ? (rnd() < 0.5 ? 'left' : 'right') : l < r ? 'left' : 'right');

export const alwaysLeft: Strategy = { name: 'always left', choose: () => 'left' };
export const alwaysRight: Strategy = { name: 'always right', choose: () => 'right' };
export const randomStrategy: Strategy = { name: 'random', choose: (_s, rnd) => (rnd() < 0.5 ? 'left' : 'right') };

/** Reads only what the screen shows: keeps Cooperation, Confidence (its low end) and Cohesion high, AI power slow. */
export const balancer: Strategy = {
  name: 'balancer',
  choose: (s, rnd) => {
    if (!cardOf(s).right) return 'left';
    const cost = (w: WorldState) =>
      pillarCost(w.cooperation) + pillarCost(w.confidence - 0.5 * w.margin) + 1e6 * +(w.confidence <= 0) + pillarCost(w.cohesion) + 2 * w.aiPower;
    return pick(cost(after(s, 'left')), cost(after(s, 'right')), rnd);
  },
};

/** Has learned what each answer really does: favours the true Confidence, Cooperation and Cohesion. */
export const thoughtful: Strategy = {
  name: 'thoughtful',
  choose: (s, rnd) => {
    if (!cardOf(s).right) return 'left';
    const cost = (w: WorldState) =>
      pillarCost(w.cooperation) + 1.5 * pillarCost(w.truth) + 1e6 * +(w.confidence <= 0) + (w.confidence < 20 ? (20 - w.confidence) ** 3 / 10 : 0) + pillarCost(w.cohesion) + 2 * w.aiPower;
    return pick(cost(after(s, 'left')), cost(after(s, 'right')), rnd);
  },
};

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
