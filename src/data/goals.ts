import type { EndingId, EndingResult, GameState } from '../engine/types';

// Goals between games, Reigns-style, about the world and its gauges. Three are shown at a time (the first
// three not yet completed, in this order). Completing one unlocks cards (their `when.goal`), so later games
// show more of the story.

export interface GoalMeta {
  /** Games finished, including this one. */
  runs: number;
  /** Endings reached in any game, including this one. */
  endings: EndingId[];
}

export interface GoalDef {
  id: string;
  text: string;
  /** What completing it adds to the game. */
  unlocks: string;
  check: (s: GameState, r: EndingResult, m: GoalMeta) => boolean;
}

/** The year the game reached (an early collapse in January 2028 still counts as reaching 2028). */
const year = (s: GameState) => 2027 + Math.floor(s.month / 12);

export const GOALS: GoalDef[] = [
  { id: 'reach_2028', text: 'Hold the world together until 2028', unlocks: 'Clara’s file on the stolen weights', check: (s) => year(s) >= 2028 },
  { id: 'learn3', text: 'Read three Learn more facts in one game', unlocks: 'The international AI safety report', check: (s) => s.learnRead >= 3 },
  { id: 'open_europe', text: 'End a game with Europe’s AI open', unlocks: 'Open weights for public money', check: (_s, r) => r.europeOpen },
  { id: 'reach_2029', text: 'Hold the world together until 2029', unlocks: 'Europe’s chipmaking lever', check: (s) => year(s) >= 2029 },
  { id: 'meet_ai', text: 'Hear from The AI itself', unlocks: 'The AI asks about rights', check: (s) => s.milestones.includes('self_improving') },
  { id: 'cohesion50', text: 'Keep Cohesion above 50 until the tipping point', unlocks: 'The AI dividend', check: (s, r) => r.tipped && s.lowCohesion >= 50 },
  { id: 'see_breakdown', text: 'Watch European society break down', unlocks: 'A national ban on a chatbot', check: (_s, r) => r.id === 'breakdown' },
  { id: 'games5', text: 'Play five games', unlocks: 'The Five Eyes offer', check: (_s, _r, m) => m.runs >= 5 },
  { id: 'tipping', text: 'Reach the tipping point', unlocks: 'The AI designs its successor', check: (_s, r) => r.tipped },
  { id: 'plateau', text: 'Reach December 2030 with no tipping point', unlocks: 'OpenBrain bids for NimbusAI', check: (_s, r) => !r.early && !r.tipped },
  { id: 'pause_world', text: 'Reach a Pause world', unlocks: 'Europe’s inspectors for a pause', check: (_s, r) => r.world === 'pause' },
  { id: 'archive6', text: 'Unlock six endings in the Archive', unlocks: 'Talks on military AI', check: (_s, _r, m) => new Set(m.endings).size >= 6 },
  { id: 'good_ending', text: 'Reach a good ending', unlocks: 'Léa’s birthday', check: (_s, r) => r.good === true },
  { id: 'certain', text: 'End a game with Confidence certain to ±8 or better', unlocks: 'Lunch with the Commissioner', check: (_s, r) => r.margin <= 8 },
  { id: 'utopia', text: 'Reach Licensed utopia', unlocks: 'The extinction-risk statement', check: (_s, r) => r.id === 'licensed_utopia' },
];

/** Goals newly completed by this game. */
export function completedGoals(s: GameState, r: EndingResult, m: GoalMeta, done: string[]): string[] {
  return GOALS.filter((g) => !done.includes(g.id) && g.check(s, r, m)).map((g) => g.id);
}

/** The three goals on show: the first three not yet completed. */
export const activeGoals = (done: string[]): GoalDef[] => GOALS.filter((g) => !done.includes(g.id)).slice(0, 3);
