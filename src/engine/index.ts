// The game engine: pure functions over GameState. No DOM, no Math.random (the seeded RNG lives in
// state.rng), inputs are never mutated: every function clones before changing anything.
//
// A game:  newGame() → [ view(s) → preview marks → answer(s, side) ]* → s.phase === 'over' → result(s)
//
// After each answer the engine, in order: applies the answer (then keeps the true Confidence inside the
// estimate ± margin); advances time unless the card is a tutorial, review or finale card (AI power rises at
// the hidden takeoff pace, the slow drifts apply); checks the pillars (Cooperation, Confidence or Cohesion at 0
// ends the game early: a world catastrophe); fires the milestones AI power has crossed (in AI 2027's order);
// queues the Year in review at each new year; starts the finale when AI power reaches the tipping point; ends
// on a plateau after December 2030; otherwise draws the next card.

import { CARD_BY_ID, CARDS, FINALE_IDS, MILESTONE_CARD, REVIEW_IDS, TUTORIAL_IDS } from '../data/cards';
import { MILESTONE_ORDER } from '../data/milestones';
import { TUNING } from '../data/tuning';
import { random, seedToRng } from './rng';
import { EARLY_BY_GAUGE, endValue, fatalGauge, finalEnding, isEuropeOpen, settleConfidence, takeoffBand, worldOf } from './rules';
import type { Answer, CardDef, CardView, Condition, Decisive, EffectKey, Effects, EndingResult, GameState, GaugeId, Mark, Side, WorldState } from './types';
import { EFFECT_KEYS, GAUGES } from './types';

export interface NewGameOptions {
  seed: number;
  run?: number;
  unlocked?: string[];
  tutorial?: boolean;
}

const clamp = (v: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));
const round1 = (v: number) => Math.round(v * 10) / 10;
const clone = (s: GameState): GameState => structuredClone(s);
const NO_TIME = new Set(['tutorial', 'review', 'tipping', 'final']);

function drawTakeoff(holder: { rng: number }): number {
  const bands = TUNING.aiPower.takeoff;
  const r = random(holder);
  const band = r < bands.slow.p ? bands.slow : r < bands.slow.p + bands.steady.p ? bands.steady : bands.fast;
  return Math.round((band.min + random(holder) * (band.max - band.min)) * 100) / 100;
}

export function newGame(opts: NewGameOptions): GameState {
  const holder = { rng: seedToRng(opts.seed) };
  const takeoff = drawTakeoff(holder);
  const S = TUNING.start;
  const truth = Math.round(S.truth + (random(holder) * 2 - 1) * S.truthSpread);
  const s: GameState = {
    seed: opts.seed,
    rng: holder.rng,
    run: opts.run ?? 1,
    turn: 0,
    month: 0,
    w: { aiPower: S.aiPower, cooperation: S.cooperation, confidence: S.confidence, margin: S.margin, truth, cohesion: S.cohesion, europe: S.europe },
    takeoff,
    lowCohesion: S.cohesion,
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
  if (c.gauges) for (const [g, [lo, hi]] of Object.entries(c.gauges) as [GaugeId, [number, number]][]) if (s.w[g] < lo || s.w[g] > hi) return false;
  if (c.truth && (s.w.truth < c.truth[0] || s.w.truth > c.truth[1])) return false;
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
    // the deck ran dry: allow cards seen before (never in practice with ~120 cards, but never stuck)
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

/** The visible marks of an answer: which gauges move and roughly how much, not in which direction.
 *  Confidence shows a mark when its estimate or its margin moves; the hidden truth and Europe's AI lean never do. */
export function marks(a: Answer): Mark[] {
  const e = scaled(a.effects);
  const size = (g: GaugeId) => (g === 'confidence' ? Math.max(Math.abs(e.confidence ?? 0), Math.abs(e.margin ?? 0)) : Math.abs(e[g] ?? 0));
  return GAUGES.filter((g) => size(g) > 0).map((g) => ({ gauge: g, size: size(g) >= TUNING.largeMark ? 'large' : 'small' }));
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

const snapshot = (w: WorldState): WorldState => ({ ...w });
function diff(a: WorldState, b: WorldState): Effects {
  const d: Effects = {};
  for (const k of EFFECT_KEYS) {
    const v = round1(b[k] - a[k]);
    if (v) d[k] = v;
  }
  return d;
}

/** Does this change help the world? (pillars, truth, Europe's AI up; margin narrower; AI slower) */
const helps = (k: EffectKey, v: number) => (k === 'margin' || k === 'aiPower' ? v < 0 : v > 0);

/** An answer's effects after the deck-wide gain and cost scales (TUNING.effects). */
export function scaled(e: Effects): Effects {
  const out: Effects = {};
  for (const k of EFFECT_KEYS) {
    const v = e[k];
    if (v) out[k] = v * (helps(k, v) ? TUNING.effects.gain : TUNING.effects.cost);
  }
  return out;
}

/** Applies effects to a world (mutates it) and keeps Confidence consistent. */
function apply(w: WorldState, e: Effects): void {
  for (const k of EFFECT_KEYS) {
    const v = e[k];
    if (!v) continue;
    w[k] = k === 'margin' ? w[k] + v : clamp(w[k] + v);
  }
  settleConfidence(w);
}

/** AI power gained by one card of time passing (before the answer's own effect). */
export function powerStep(s: Pick<GameState, 'takeoff' | 'w'>): number {
  const P = TUNING.aiPower;
  const race = Math.max(P.raceFloor, 1 + (P.raceBoost * (50 - s.w.cooperation)) / 50);
  return P.perCard * s.takeoff * race;
}

/** The slow drifts of one card of time (mutates `w`). */
function drift(s: GameState): void {
  const D = TUNING.drift;
  const w = s.w;
  const high = w.aiPower >= D.highPower;
  w.cooperation = clamp(round1(w.cooperation + D.cooperation + (high ? D.cooperationHigh : 0)));
  w.cohesion = clamp(round1(w.cohesion + (high ? D.cohesionHigh : 0) + (w.cooperation < TUNING.zones.race ? D.cohesionRupture : 0)));
  if (high) {
    w.truth = clamp(round1(w.truth + D.truthHigh));
    w.margin = round1(w.margin + D.marginHigh);
  }
  w.confidence = clamp(round1(w.confidence + D.labReports));
  w.aiPower = round1(w.aiPower + powerStep(s));
  settleConfidence(w);
}

export function answer(state: GameState, side: Side): GameState {
  if (state.phase === 'over') return state;
  const s = clone(state);
  const card = cardOf(s);
  const a = answerOf(card, side);
  const before = snapshot(s.w);
  apply(s.w, scaled(a.effects));
  const delta = diff(before, s.w);
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

  // time passes: AI power rises, the slow drifts apply
  const prevMonth = state.month;
  if (advances) drift(s);
  if (s.phase === 'play') s.lowCohesion = Math.min(s.lowCohesion, s.w.cohesion);

  // a pillar at 0 ends the game: a world catastrophe
  const fatal = fatalGauge(s.w);
  if (fatal) {
    s.ending = EARLY_BY_GAUGE[fatal];
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
  const crossed = MILESTONE_ORDER.filter((m) => !s.milestones.includes(m) && s.w.aiPower >= TUNING.milestones[m]);
  for (const m of crossed) s.milestones.push(m);
  const queue = crossed.map((m) => MILESTONE_CARD[m]);
  const newYear = Math.floor(s.month / 12);
  if (advances && newYear > Math.floor(prevMonth / 12) && newYear <= REVIEW_IDS.length) queue.unshift(REVIEW_IDS[newYear - 1]);
  if (s.w.aiPower >= TUNING.aiPower.tippingAt && s.milestones.length === MILESTONE_ORDER.length) {
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

/** Score of an answer for "What decided it": how much it moved what decided this ending. */
function impact(s: GameState, d: Effects): number {
  const fatal = fatalGauge(s.w);
  if (fatal) {
    // the answers that pushed the fallen pillar down (for Confidence, also those that hid the truth falling)
    const v = -(d[fatal] ?? 0) + (fatal === 'confidence' ? -0.5 * (d.truth ?? 0) : 0);
    return v + 0.01 * EFFECT_KEYS.reduce((a, k) => a + Math.abs(d[k] ?? 0), 0);
  }
  const world = worldOf(s);
  const rule = TUNING.worlds[world];
  const key = (k: 'confidence' | 'cohesion'): EffectKey => (k === 'confidence' ? 'truth' : 'cohesion');
  const plateau = s.tippedAt === undefined;
  return (
    2 * Math.abs(d[key(rule.decides)] ?? 0) +
    1.5 * Math.abs(d[key(rule.net)] ?? 0) +
    (plateau ? 0 : 1.5) * Math.abs(d.cooperation ?? 0) +
    (plateau ? 2 : 0) * Math.abs(d.europe ?? 0)
  );
}

const GAUGE_WORD: Record<'confidence' | 'cohesion', string> = { confidence: 'Confidence', cohesion: 'Cohesion' };
const WORLD_HOW: Record<string, string> = {
  pause: 'The superpowers paused',
  race: 'The superpowers raced',
  rupture: 'The superpowers broke apart',
  plateau_open: 'AI plateaued, with Europe running its own open models',
  plateau_dependent: 'AI plateaued, with Europe relying on a few big labs',
};

/** One sentence, from the gauge that decided: "The superpowers raced. Confidence was 62, below the 75 a race needs." */
export function whySentence(s: GameState): string {
  const fatal = fatalGauge(s.w);
  if (fatal) return { cooperation: 'Cooperation between Washington and Beijing fell to 0.', confidence: 'Confidence in AI fell to 0.', cohesion: 'Cohesion fell to 0.' }[fatal as 'cooperation'] ?? '';
  const f = finalEnding(s);
  const r = TUNING.worlds[f.world];
  const how = WORLD_HOW[f.world];
  const dv = endValue(s.w, r.decides);
  const nv = endValue(s.w, r.net);
  const dn = GAUGE_WORD[r.decides];
  const nn = GAUGE_WORD[r.net];
  const worldWord = f.world.startsWith('plateau') ? 'this world' : `a ${f.world === 'pause' ? 'pause' : f.world === 'race' ? 'race' : 'rupture'}`;
  if (f.good) return `${how}. ${dn} was ${dv}, above the ${r.target} ${worldWord} needs, and ${nn} held at ${nv}.`;
  if (!f.decidesMet) return `${how}. ${dn} was ${dv}, below the ${r.target} ${worldWord} needs.`;
  return `${how}. ${dn} reached ${dv}, but ${nn} was ${nv}, below the safety net of ${r.floor}.`;
}

export function result(s: GameState): EndingResult {
  if (!s.ending) throw new Error('The game is not over');
  const early = s.ending === 'open_conflict' || s.ending === 'runaway_incident' || s.ending === 'breakdown';
  const fin = early ? undefined : finalEnding(s);
  // the answers that moved things most; at most one of the finale's, so earlier choices show too
  let finals = 0;
  const decisive: Decisive[] = s.history
    .filter((h) => h.record)
    .map((h) => ({ h, score: impact(s, h.delta) }))
    .filter((x) => x.score > 0.05)
    .sort((a, b) => b.score - a.score)
    .filter((x) => CARD_BY_ID[x.h.cardId].kind !== 'final' || finals++ < 1)
    .slice(0, TUNING.decisiveCount)
    .sort((a, b) => a.h.turn - b.h.turn || s.history.indexOf(a.h) - s.history.indexOf(b.h))
    .map(({ h }) => ({ month: h.month, text: h.record! }));
  const w = s.w;
  return {
    id: s.ending,
    early,
    world: fin?.world,
    good: fin?.good,
    why: whySentence(s),
    decisive,
    aiPower: Math.round(w.aiPower),
    cooperation: Math.round(w.cooperation),
    confidence: Math.round(w.confidence),
    margin: Math.round(w.margin),
    truth: Math.round(w.truth),
    cohesion: Math.round(w.cohesion),
    europe: Math.round(w.europe),
    europeOpen: isEuropeOpen(s),
    takeoff: takeoffBand(s.takeoff),
    tipped: s.tippedAt !== undefined,
  };
}

export { finalEnding, takeoffBand };
