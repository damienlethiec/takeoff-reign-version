// The contract between the data, the engine and the UI. See docs/DEVELOPER_NOTES.md for the rules.

/** The four visible gauges, 0–100. 0 or 100 ends the run early. */
export type GaugeId = 'labs' | 'citizens' | 'allies' | 'oversight';
export const GAUGES: readonly GaugeId[] = ['labs', 'citizens', 'allies', 'oversight'];

/** Hidden tracks, 0–100, never shown as numbers before the end. `europe` ≥ 50 means Europe's AI is Open. */
export type HiddenId = 'coop' | 'safety' | 'europe';
export const HIDDEN: readonly HiddenId[] = ['coop', 'safety', 'europe'];

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

export type EarlyEndingId = 'exodus' | 'capture' | 'apathy' | 'patchwork' | 'isolated' | 'absorbed' | 'blindsided' | 'overreach';
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

/** Changes made by an answer. Gauges and hidden tracks in points; progress in points of the 0–100 AI progress bar. */
export type Effects = Partial<Record<GaugeId | HiddenId | 'progress', number>>;

export interface Answer {
  /** ≤ 4 words. */
  label: string;
  effects: Effects;
  /** Flags set by this answer (read by later cards' conditions and by endings). */
  flags?: string[];
  /** Cards that come back a few cards later because of this answer. */
  followUps?: { id: string; after: number }[];
  /** Past-tense phrase for "What decided it": "let OpenBrain skip the audit". */
  record?: string;
}

/** When a card may be drawn. All present clauses must hold. */
export interface Condition {
  /** Run turn (time-advancing cards answered so far). */
  minTurn?: number;
  maxTurn?: number;
  /** Milestones that must have been reached (AI 2027 order). */
  after?: MilestoneId;
  /** A milestone that must not have been reached yet. */
  before?: MilestoneId;
  flags?: string[];
  notFlags?: string[];
  gauges?: Partial<Record<GaugeId, [number, number]>>;
  /** Hidden tracks: lets characters hint at what the player cannot see. */
  hidden?: Partial<Record<HiddenId, [number, number]>>;
  /** Only once this goal has been completed in an earlier run. */
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
  /** At most once per run (default true). */
  once?: boolean;
  /** The milestone this card announces (news cards forced when the milestone is reached). */
  milestone?: MilestoneId;
}

export type Side = 'left' | 'right';

export interface HistoryEntry {
  turn: number;
  month: number;
  cardId: string;
  who: CharacterId;
  side: Side;
  label: string;
  record?: string;
  /** Applied changes (after clamping), gauges and hidden tracks. */
  delta: Effects;
}

export type Phase = 'play' | 'finale' | 'over';

export interface GameState {
  seed: number;
  rng: number;
  run: number;
  /** Time-advancing cards answered. */
  turn: number;
  /** Months since January 2027 (fractional). */
  month: number;
  gauges: Record<GaugeId, number>;
  hidden: Record<HiddenId, number>;
  progress: number;
  /** Hidden multiplier on AI progress, drawn at the start (the takeoff speed). */
  takeoff: number;
  milestones: MilestoneId[];
  flags: string[];
  seen: string[];
  /** Cards to show next, in order (tutorial, milestones, finale). */
  forced: string[];
  followUps: { id: string; due: number }[];
  current: string;
  phase: Phase;
  /** Goals completed in earlier runs (unlocking cards). */
  unlocked: GoalId[];
  history: HistoryEntry[];
  /** Learn more facts opened during this run. */
  learnRead: number;
  /** The turn at which the tipping point began, if it did. */
  tippedAt?: number;
  ending?: EndingId;
}

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
  /** The two or three answers that moved things most. */
  decisive: Decisive[];
  coop: number;
  safety: number;
  europeOpen: boolean;
  europe: number;
  steadiness: number;
  takeoff: 'slow' | 'steady' | 'fast';
  tipped: boolean;
}
