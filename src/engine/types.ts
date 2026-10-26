// The contract between the data, the engine and the UI. See docs/DEVELOPER_NOTES.md for the rules.
//
// The same model as Takeoff: Middle Power v3. Four gauges on screen: AI power (the clock, tipping point at
// 80), Cooperation (US–China, three zones), Confidence in AI (an estimate ± a margin, the true value hidden
// inside it) and Cohesion (whether European society holds), plus the Europe's AI badge (Open or Dependent).

/** The four visible gauges, 0–100. `confidence` is the public estimate; the true value is `truth`. */
export type GaugeId = 'aiPower' | 'cooperation' | 'confidence' | 'cohesion';
export const GAUGES: readonly GaugeId[] = ['aiPower', 'cooperation', 'confidence', 'cohesion'];
/** The gauges whose fall to 0 ends the game early (a world catastrophe). */
export const PILLARS: readonly GaugeId[] = ['cooperation', 'confidence', 'cohesion'];

/** Everything an answer can move. `margin`: the ± around the Confidence estimate. `truth`: the true Confidence
 *  (hidden until the end). `europe`: Europe's AI, a hidden lean 0–100 behind the visible badge (Open at 50+). */
export type EffectKey = GaugeId | 'margin' | 'truth' | 'europe';
export const EFFECT_KEYS: readonly EffectKey[] = ['aiPower', 'cooperation', 'confidence', 'margin', 'truth', 'cohesion', 'europe'];

export type CharacterId =
  | 'us_envoy'
  | 'cn_delegate'
  | 'ceo'
  | 'researcher'
  | 'union'
  | 'founder'
  | 'security'
  | 'minister'
  | 'journalist'
  | 'lea'
  | 'ai'
  | 'news'
  | 'aide';

export type CardKind = 'request' | 'followup' | 'news' | 'lea' | 'ai' | 'review' | 'tutorial' | 'tipping' | 'final';

export type MilestoneId =
  | 'china_wakes'
  | 'jobs'
  | 'agent2'
  | 'theft'
  | 'superhuman_coder'
  | 'alignment_doubts'
  | 'self_improving'
  | 'remote_worker'
  | 'geopolitics'
  | 'agent4'
  | 'leak';

/** Early endings: a world catastrophe when a pillar reaches 0. */
export type EarlyEndingId = 'open_conflict' | 'runaway_incident' | 'breakdown';
export type FinalEndingId =
  | 'licensed_utopia'
  | 'unstable_pause'
  | 'cognitive_revolution'
  | 'loss_of_control'
  | 'multipolar_world'
  | 'hot_war'
  | 'bright_winter'
  | 'decentralised_mayhem'
  | 'agent_economy'
  | 'silicon_blackmail';
export type EndingId = EarlyEndingId | FinalEndingId;
export type World = 'pause' | 'race' | 'rupture' | 'plateau_open' | 'plateau_dependent';

export type GoalId = string;

export interface Source {
  label: string;
  url: string;
}

/** What a card or ending rests on: AI 2027, the CFG scenarios, or a real fact (see docs/SCENARIO_BASIS.md). */
export interface Basis {
  kind: 'ai2027' | 'cfg' | 'real';
  ref: string;
}

/** The real fact (or, labelled, the scenario) behind a card. ≤ 40 words. */
export interface Learn {
  text: string;
  source: Source;
}

/** Changes made by an answer, in points. */
export type Effects = Partial<Record<EffectKey, number>>;

export interface Answer {
  /** ≤ 4 words. */
  label: string;
  effects: Effects;
  /** Flags set by this answer (read by later cards' conditions). */
  flags?: string[];
  /** Cards that come back a few cards later because of this answer. */
  followUps?: { id: string; after: number }[];
  /** Past-tense phrase for "What decided it": "let OpenBrain skip the audit". */
  record?: string;
}

/** When a card may be drawn. All present clauses must hold. */
export interface Condition {
  /** Game turn (time-advancing cards answered so far). */
  minTurn?: number;
  maxTurn?: number;
  /** Milestones that must have been reached (AI 2027 order). */
  after?: MilestoneId;
  /** A milestone that must not have been reached yet. */
  before?: MilestoneId;
  flags?: string[];
  notFlags?: string[];
  /** Visible gauges in a range. */
  gauges?: Partial<Record<GaugeId, [number, number]>>;
  /** The hidden true Confidence in a range: lets characters hint at what the player cannot see. */
  truth?: [number, number];
  /** Only once this goal has been completed in an earlier game. */
  goal?: GoalId;
}

export type TextFn = (s: GameState) => string;

export interface CardDef {
  id: string;
  kind: CardKind;
  who: CharacterId;
  text: string | TextFn;
  left: Answer;
  /** Absent for single-button cards (Year in review, the tipping point, some Léa cards): `left` is the only answer. */
  right?: Answer;
  learn?: Learn;
  basis: Basis;
  when?: Condition;
  weight?: number;
  /** At most once per game (default true). */
  once?: boolean;
  /** The milestone this card announces (news cards forced when the milestone is reached). */
  milestone?: MilestoneId;
}

export type Side = 'left' | 'right';

export interface HistoryEntry {
  turn: number;
  /** The date shown on the card when it was answered. */
  month: number;
  cardId: string;
  who: CharacterId;
  side: Side;
  label: string;
  record?: string;
  /** Applied changes (after clamping), visible and hidden. */
  delta: Effects;
}

export type Phase = 'play' | 'finale' | 'over';

/** The whole world: the visible gauges plus the margin, the hidden truth and Europe's AI lean. */
export interface WorldState {
  aiPower: number;
  cooperation: number;
  /** The public estimate of Confidence in AI. */
  confidence: number;
  margin: number;
  /** The true Confidence: always within confidence ± margin; revealed at the end. */
  truth: number;
  cohesion: number;
  /** Europe's AI: Open at `TUNING.europe.openAt` or more. */
  europe: number;
}

export interface GameState {
  seed: number;
  rng: number;
  /** The game counter ("Game #N"). */
  run: number;
  /** Time-advancing cards answered. */
  turn: number;
  /** Months since January 2027 (fractional). */
  month: number;
  w: WorldState;
  /** Hidden multiplier on the rise of AI power, drawn at the start (the takeoff speed). */
  takeoff: number;
  /** Lowest Cohesion seen before the tipping point (for a goal). */
  lowCohesion: number;
  milestones: MilestoneId[];
  flags: string[];
  seen: string[];
  /** Cards to show next, in order (tutorial, milestones, finale). */
  forced: string[];
  followUps: { id: string; due: number }[];
  current: string;
  phase: Phase;
  /** Goals completed in earlier games (unlocking cards). */
  unlocked: GoalId[];
  history: HistoryEntry[];
  /** Learn more facts opened during this game. */
  learnRead: number;
  /** The turn at which the tipping point began, if it did. */
  tippedAt?: number;
  ending?: EndingId;
}

/** A preview mark: which visible gauge moves, and roughly how much (never the direction). */
export interface Mark {
  gauge: GaugeId;
  size: 'small' | 'large';
}

/** What the UI shows for the current card. */
export interface CardView {
  id: string;
  kind: CardKind;
  who: CharacterId;
  text: string;
  left: { label: string; marks: Mark[] };
  right?: { label: string; marks: Mark[] };
  learn?: Learn;
  basis: Basis;
}

export interface Decisive {
  month: number;
  text: string;
}

export interface EndingResult {
  id: EndingId;
  early: boolean;
  world?: World;
  good?: boolean;
  /** The gauge that ended the game early, or that decided / held as safety net in a final world. */
  why: string;
  /** The two or three answers that moved things most. */
  decisive: Decisive[];
  /** Final values (Confidence: the estimate seen; truth: the true value). */
  aiPower: number;
  cooperation: number;
  confidence: number;
  margin: number;
  truth: number;
  cohesion: number;
  europe: number;
  europeOpen: boolean;
  takeoff: 'slow' | 'steady' | 'fast';
  tipped: boolean;
}
