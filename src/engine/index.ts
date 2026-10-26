// The game engine: pure functions over GameState. No DOM, no Math.random (the seeded RNG lives in
// state.rng), inputs are never mutated: every function clones before changing anything.
//
// A run:  newGame() → [ view(s) → preview marks → answer(s, side) ]* → s.phase === 'over' → result(s)
//
// After each answer the engine, in order: applies the answer; advances time (unless the card is a tutorial,
// review or finale card); checks the gauges (0 or 100 ends the run); fires the milestones AI progress
// has crossed (in AI 2027's order); queues the Year in review at each new year; starts the finale when
// AI progress reaches 100; ends on a plateau after December 2030; otherwise draws the next card.

import { CARD_BY_ID, CARDS, FINALE_IDS, MILESTONE_CARD, REVIEW_IDS, TUTORIAL_IDS } from '../data/cards';
import { MILESTONE_ORDER } from '../data/milestones';
import { TUNING } from '../data/tuning';
import { random, seedToRng } from './rng';
import { EARLY_BY_GAUGE, fatalGauge, finalEnding, isEuropeOpen, steadiness, takeoffBand } from './rules';
import type {
  Answer,
  CardDef,
  CardView,
  Condition,
  Decisive,
  Effects,
  EndingResult,
  GameState,
  GaugeId,
  HiddenId,
  Mark,
  Side,
} from './types';
import { GAUGES, HIDDEN } from './types';

export interface NewGameOptions {
  seed: number;
  run?: number;
  unlocked?: string[];
  tutorial?: boolean;
}

const clamp = (v: number) => Math.max(0, Math.min(100, v));
const round1 = (v: number) => Math.round(v * 10) / 10;
const clone = (s: GameState): GameState => structuredClone(s);
const NO_TIME = new Set(['tutorial', 'review', 'tipping', 'final']);

function drawTakeoff(holder: { rng: number }): number {
  const bands = TUNING.progress.takeoff;
  const r = random(holder);
  const band = r < bands.slow.p ? bands.slow : r < bands.slow.p + bands.steady.p ? bands.steady : bands.fast;
  return Math.round((band.min + random(holder) * (band.max - band.min)) * 100) / 100;
}

export function newGame(opts: NewGameOptions): GameState {
  const holder = { rng: seedToRng(opts.seed) };
  const takeoff = drawTakeoff(holder);
  const S = TUNING.start;
  const s: GameState = {
    seed: opts.seed,
    rng: holder.rng,
    run: opts.run ?? 1,
    turn: 0,
    month: 0,
    gauges: { labs: S.gauge, citizens: S.gauge, allies: S.gauge, oversight: S.gauge },
    hidden: { coop: S.coop, safety: S.safety, europe: S.europe },
    progress: 0,
    takeoff,
    milestones: [],
    flags: [],
    seen: [],
    forced: opts.tutorial ? [...TUTORIAL_IDS] : [],
    followUps: [],
    current: '',
    phase: 'play',
    unlocked: [...(opts.unlocked ?? [])],
    history: [],
    learnRead: 0,
  };
  s.current = drawNext(s);
  return s;
}

/** Does a card's condition hold? */
export function eligible(s: GameState, c: Condition | undefined): boolean {
  if (!c) return true;
  if (c.minTurn !== undefined && s.turn < c.minTurn) return false;
  if (c.maxTurn !== undefined && s.turn > c.maxTurn) return false;
  if (c.after && !s.milestones.includes(c.after)) return false;
  if (c.before && s.milestones.includes(c.before)) return false;
  if (c.flags && !c.flags.every((f) => s.flags.includes(f))) return false;
  if (c.notFlags && c.notFlags.some((f) => s.flags.includes(f))) return false;
  if (c.goal && !s.unlocked.includes(c.goal)) return false;
  if (c.gauges) for (const [g, [lo, hi]] of Object.entries(c.gauges) as [GaugeId, [number, number]][]) if (s.gauges[g] < lo || s.gauges[g] > hi) return false;
  if (c.hidden) for (const [h, [lo, hi]] of Object.entries(c.hidden) as [HiddenId, [number, number]][]) if (s.hidden[h] < lo || s.hidden[h] > hi) return false;
  return true;
}

/** Cards that can be drawn from the deck (not forced ones). */
const DECK = CARDS.filter((c) => ['request', 'news', 'lea', 'ai'].includes(c.kind) && !c.milestone && !FINALE_IDS.includes(c.id));

/** Mutates `s` (a draft): picks the next card id. */
function drawNext(s: GameState): string {
  if (s.forced.length) return s.forced.shift()!;
  // a follow-up that is due and still makes sense comes first
  const dueIdx = s.followUps.findIndex((f) => f.due <= s.turn && eligible(s, CARD_BY_ID[f.id].when));
  if (dueIdx >= 0) {
    const [f] = s.followUps.splice(dueIdx, 1);
    return f.id;
  }
  const last = s.history.length ? s.history[s.history.length - 1].who : undefined;
  const pool = (repeatWho: boolean) =>
    DECK.filter((c) => (c.once === false || !s.seen.includes(c.id)) && c.id !== s.current && eligible(s, c.when) && (repeatWho || c.who !== last || c.who === 'news'));
  let candidates = pool(false);
  if (!candidates.length) candidates = pool(true);
  if (!candidates.length) {
    // the deck ran dry: allow cards seen longest ago (never in practice with ~120 cards, but never stuck)
    candidates = DECK.filter((c) => c.kind === 'request' && c.id !== s.current && eligible(s, { ...c.when, goal: undefined }));
  }
  const total = candidates.reduce((a, c) => a + (c.weight ?? TUNING.draw.defaultWeight), 0);
  let r = random(s) * total;
  for (const c of candidates) {
    r -= c.weight ?? TUNING.draw.defaultWeight;
    if (r < 0) return c.id;
  }
  return candidates[candidates.length - 1].id;
}

export const cardOf = (s: GameState): CardDef => CARD_BY_ID[s.current];
export const answerOf = (card: CardDef, side: Side): Answer => (side === 'right' && card.right ? card.right : card.left);

/** The visible marks of an answer: which gauges move and roughly how much, not in which direction. */
export function marks(a: Answer): Mark[] {
  return GAUGES.filter((g) => (a.effects[g] ?? 0) !== 0).map((g) => ({ gauge: g, size: Math.abs(a.effects[g]!) >= TUNING.largeMark ? 'large' : 'small' }));
}

export function view(s: GameState): CardView {
  const c = cardOf(s);
  const text = typeof c.text === 'function' ? c.text(s) : c.text;
  return {
    id: c.id,
    kind: c.kind,
    who: c.who,
    text,
    left: { label: c.left.label, marks: marks(c.left) },
    right: c.right ? { label: c.right.label, marks: marks(c.right) } : undefined,
    learn: c.learn,
    basis: c.basis,
  };
}

function apply(s: GameState, e: Effects): Effects {
  const d: Effects = {};
  for (const g of GAUGES) {
    if (!e[g]) continue;
    const before = s.gauges[g];
    s.gauges[g] = clamp(before + e[g]!);
    d[g] = s.gauges[g] - before;
  }
  for (const h of HIDDEN) {
    if (!e[h]) continue;
    const before = s.hidden[h];
    s.hidden[h] = clamp(before + e[h]!);
    d[h] = round1(s.hidden[h] - before);
  }
  if (e.progress) {
    s.progress = Math.max(0, s.progress + e.progress);
    d.progress = e.progress;
  }
  return d;
}

/** AI progress gained by one card of time passing (before the answer's own effect). */
export function progressStep(s: Pick<GameState, 'takeoff' | 'hidden'>): number {
  const P = TUNING.progress;
  const race = Math.max(1 - P.raceBoost, 1 + (P.raceBoost * (50 - s.hidden.coop)) / 50);
  return P.perCard * s.takeoff * race;
}

export function answer(state: GameState, side: Side): GameState {
  if (state.phase === 'over') return state;
  const s = clone(state);
  const card = cardOf(s);
  const a = answerOf(card, side);
  const delta = apply(s, a.effects);
  for (const f of a.flags ?? []) if (!s.flags.includes(f)) s.flags.push(f);
  if (!s.seen.includes(card.id)) s.seen.push(card.id);
  const shownMonth = s.month;
  const advances = !NO_TIME.has(card.kind) && s.phase === 'play';
  if (advances) {
    s.turn += 1;
    s.month = s.turn * TUNING.time.monthsPerCard;
  }
  for (const f of a.followUps ?? []) s.followUps.push({ id: f.id, due: s.turn + f.after });
  s.history.push({ turn: s.turn, month: shownMonth, cardId: card.id, who: card.who, side: card.right ? side : 'left', label: a.label, record: a.record, delta });

  // time passes: hidden drift and AI progress
  const prevMonth = state.month;
  if (advances) {
    for (const [h, v] of Object.entries(TUNING.drift) as [HiddenId, number][]) s.hidden[h] = clamp(round1(s.hidden[h] + v));
    s.progress = round1(s.progress + progressStep(s));
  }

  // a gauge at 0 or 100 ends the term
  const fatal = fatalGauge(s.gauges);
  if (fatal) {
    s.ending = EARLY_BY_GAUGE[fatal.gauge][fatal.high ? 1 : 0];
    s.phase = 'over';
    s.current = '';
    return s;
  }

  if (s.phase === 'finale') {
    if (!s.forced.length) {
      s.ending = finalEnding(s).id;
      s.phase = 'over';
      s.current = '';
      return s;
    }
    s.current = s.forced.shift()!;
    return s;
  }

  // milestones crossed, in order; then the Year in review at each new year; then the tipping point
  const crossed = MILESTONE_ORDER.filter((m) => !s.milestones.includes(m) && s.progress >= TUNING.milestones[m]);
  for (const m of crossed) s.milestones.push(m);
  const queue = crossed.map((m) => MILESTONE_CARD[m]);
  const newYear = Math.floor(s.month / 12);
  if (advances && newYear > Math.floor(prevMonth / 12) && newYear <= REVIEW_IDS.length) queue.unshift(REVIEW_IDS[newYear - 1]);
  if (s.progress >= 100) {
    s.tippedAt = s.turn;
    s.phase = 'finale';
    s.forced = [...s.forced, ...queue, ...FINALE_IDS];
    s.current = s.forced.shift()!;
    return s;
  }
  s.forced.push(...queue);
  if (s.turn >= TUNING.time.lastTurn && !s.forced.length) {
    s.ending = finalEnding(s).id;
    s.phase = 'over';
    s.current = '';
    return s;
  }
  s.current = drawNext(s);
  return s;
}

/** The player opened a Learn more fact (counted for a goal). */
export function readLearn(state: GameState): GameState {
  return { ...state, learnRead: state.learnRead + 1 };
}

/** Score of an answer for "What decided it". */
function impact(s: GameState, d: Effects): number {
  // early ending: the answers that pushed the fatal gauge
  const fatal = fatalGauge(s.gauges);
  if (fatal) {
    const v = d[fatal.gauge] ?? 0;
    return (fatal.high ? v : -v) + 0.01 * GAUGES.reduce((a, g) => a + Math.abs(d[g] ?? 0), 0);
  }
  // on a plateau Cooperation decides nothing and Europe's AI picks the world; after the tipping point it is the reverse
  const plateau = s.tippedAt === undefined;
  return 2 * Math.abs(d.safety ?? 0) + (plateau ? 0 : 2) * Math.abs(d.coop ?? 0) + (plateau ? 2 : 0.5) * Math.abs(d.europe ?? 0) + 0.5 * GAUGES.reduce((a, g) => a + Math.abs(d[g] ?? 0), 0);
}

export function result(s: GameState): EndingResult {
  if (!s.ending) throw new Error('The run is not over');
  const early = !['licensed_utopia', 'unstable_pause', 'cognitive_revolution', 'loss_of_control', 'multipolar_world', 'hot_war', 'bright_winter', 'decentralised_mayhem', 'agent_economy', 'silicon_blackmail'].includes(s.ending);
  const fin = early ? undefined : finalEnding(s);
  // the answers that moved things most; at most one of the finale's, so earlier choices show too
  let finals = 0;
  const decisive: Decisive[] = s.history
    .filter((h) => h.record)
    .map((h) => ({ h, score: impact(s, h.delta) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .filter((x) => CARD_BY_ID[x.h.cardId].kind !== 'final' || finals++ < 1)
    .slice(0, TUNING.decisiveCount)
    .sort((a, b) => a.h.turn - b.h.turn || s.history.indexOf(a.h) - s.history.indexOf(b.h))
    .map(({ h }) => ({ month: h.month, text: h.record! }));
  return {
    id: s.ending,
    early,
    world: fin?.world,
    good: fin?.good,
    decisive,
    coop: Math.round(s.hidden.coop),
    safety: Math.round(s.hidden.safety),
    europe: Math.round(s.hidden.europe),
    europeOpen: isEuropeOpen(s),
    steadiness: steadiness(s.gauges),
    takeoff: takeoffBand(s.takeoff),
    tipped: s.tippedAt !== undefined,
  };
}

export { steadiness, finalEnding, takeoffBand };
