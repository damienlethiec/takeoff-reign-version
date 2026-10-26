// Every number the rules use. Changes go through `npm run sim` and the "Tuning changes" table
// of docs/DEVELOPER_NOTES.md.

export const TUNING = {
  start: {
    gauge: 50,
    coop: 45,
    safety: 60,
    /** Europe's AI: ≥ `endings.openAt` is Open, below is Dependent. Starts on the dependent side. */
    europe: 42,
  },
  time: {
    /** Months per time-advancing card (about three weeks). */
    monthsPerCard: 0.75,
    /** The run ends on a plateau after this many cards (December 2030). */
    lastTurn: 64,
    /** Cards in the first-run tutorial. */
    tutorialCards: 3,
  },
  /** AI progress, 0–100; the tipping point begins at 100. */
  progress: {
    perCard: 1.45,
    /** Extra speed when Cooperation is low: × (1 + raceBoost × (50 − coop) / 50), never below 1 − raceBoost. */
    raceBoost: 0.35,
    /** The hidden takeoff speed: a multiplier drawn once per run from one of three bands. */
    takeoff: {
      slow: { p: 0.3, min: 0.55, max: 0.85 },
      steady: { p: 0.4, min: 0.95, max: 1.35 },
      fast: { p: 0.3, min: 1.5, max: 2.3 },
    },
  },
  /** Progress at which each milestone fires, in AI 2027's order (src/data/milestones.ts). */
  milestones: {
    china_wakes: 4,
    jobs: 10,
    agent2: 18,
    theft: 27,
    superhuman_coder: 36,
    alignment_doubts: 45,
    self_improving: 54,
    remote_worker: 63,
    geopolitics: 72,
    agent4: 81,
    leak: 90,
  },
  /** Slow drift of the hidden tracks per time-advancing card: the race erodes both unless someone pushes back. */
  drift: { safety: -0.05, coop: -0.12 },
  /** A change of this size or more shows as a large mark ("a lot"); below, a small one ("a little"). */
  largeMark: 10,
  draw: {
    defaultWeight: 10,
    /** Follow-ups come back this many cards later unless the answer says otherwise. */
    followUpDelay: 6,
    /** A character does not speak twice in a row (except news). */
    noRepeatWho: true,
  },
  /** The final endings tree (v3), with Safety for Confidence and Steadiness for Cohesion. */
  endings: {
    pauseCoop: 60,
    raceCoop: 30,
    pause: { safety: 65, steadiness: 60 },
    race: { safety: 70, steadiness: 65 },
    rupture: { steadiness: 85, safety: 45 },
    plateau: { steadiness: 65, safety: 30 },
    openAt: 50,
  },
  /** The end screen lists this many decisive answers. */
  decisiveCount: 3,
} as const;

export type Tuning = typeof TUNING;
