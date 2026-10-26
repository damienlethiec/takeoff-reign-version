// Every number the rules use. Changes go through `npm run sim` and the "Tuning changes" table
// of docs/DEVELOPER_NOTES.md. Start values, zones and ending thresholds are the same as Takeoff: Middle Power v3.

export const TUNING = {
  start: {
    aiPower: 18,
    cooperation: 52,
    /** Confidence in AI: the public estimate, its margin, and the hidden true value (always inside the margin). */
    confidence: 55,
    margin: 15,
    truth: 52,
    cohesion: 66,
    /** Europe's AI: ≥ `europe.openAt` is Open, below is Dependent. Starts Dependent. */
    europe: 42,
  },
  europe: { openAt: 50 },
  confidence: { minMargin: 3, maxMargin: 30 },
  time: {
    /** Months per time-advancing card (about three weeks). */
    monthsPerCard: 0.75,
    /** The game ends on a plateau after this many cards (December 2030). */
    lastTurn: 64,
    /** Cards in the first-game tutorial. */
    tutorialCards: 3,
  },
  /** AI power, 0–100; the tipping point begins at `tippingAt`. */
  aiPower: {
    tippingAt: 80,
    perCard: 0.9,
    /** Extra speed when Cooperation is low: × (1 + raceBoost × (50 − cooperation) / 50), never below 1 − raceBoost. */
    raceBoost: 0.35,
    /** The hidden takeoff speed: a multiplier drawn once per game from one of three bands. */
    takeoff: {
      slow: { p: 0.3, min: 0.55, max: 0.85 },
      steady: { p: 0.4, min: 0.95, max: 1.35 },
      fast: { p: 0.3, min: 1.5, max: 2.3 },
    },
  },
  /** AI power at which each milestone fires, in AI 2027's order (src/data/milestones.ts). */
  milestones: {
    china_wakes: 21,
    jobs: 24,
    agent2: 29,
    theft: 35,
    superhuman_coder: 40,
    alignment_doubts: 46,
    self_improving: 51,
    remote_worker: 57,
    geopolitics: 63,
    agent4: 68,
    leak: 74,
  },
  /** Slow drift per time-advancing card. */
  drift: {
    /** The race heats up: Cooperation lost each card, more once AI power passes `highPower`. */
    cooperation: -0.2,
    cooperationHigh: -0.15,
    /** AI disrupts work once it does whole jobs: Cohesion lost each card past `highPower`. */
    cohesionHigh: -0.15,
    /** In the Rupture zone the arms race hits Europe too (sanctions, energy, cyberattacks). */
    cohesionRupture: -0.15,
    /** Harder to align as AI grows: true Confidence lost each card past `highPower`. */
    truthHigh: -0.15,
    /** The labs' reports push the estimate up each card. */
    labReports: 0.3,
    highPower: 60,
  },
  /** Cooperation zones (v3): Pause 60+, Race 30–59, Rupture below. */
  zones: { pause: 60, race: 30 },
  /** A change of this size or more shows as a large mark ("a lot"); below, a small one ("a little"). */
  largeMark: 8,
  draw: {
    defaultWeight: 10,
    /** Follow-ups come back this many cards later unless the answer says otherwise. */
    followUpDelay: 6,
  },
  /** Deciding gauge and safety net of each world (v3, src/data/tuning.ts there). Confidence means the true value. */
  worlds: {
    pause: { decides: 'confidence', target: 65, net: 'cohesion', floor: 45 },
    race: { decides: 'confidence', target: 75, net: 'cohesion', floor: 55 },
    rupture: { decides: 'cohesion', target: 82, net: 'confidence', floor: 65 },
    plateau_open: { decides: 'cohesion', target: 60, net: 'confidence', floor: 40 },
    plateau_dependent: { decides: 'cohesion', target: 60, net: 'confidence', floor: 40 },
  },
  /** Gap (estimate − truth) above which the Year in review and Léa hint that the labs are too optimistic. */
  overconfidentGap: 6,
  /** The end screen lists this many decisive answers. */
  decisiveCount: 3,
} as const;

export type Tuning = typeof TUNING;
