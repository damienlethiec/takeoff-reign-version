import type { MilestoneId } from '../engine/types';

// AI 2027's milestones, in the scenario's order (docs/SCENARIO_BASIS.md, section 1). They fire when the hidden
// AI progress meter crosses TUNING.milestones[id], so their dates vary with the takeoff speed but never their order.
export const MILESTONE_ORDER: readonly MilestoneId[] = [
  'china_wakes',
  'jobs',
  'agent2',
  'theft',
  'superhuman_coder',
  'alignment_doubts',
  'self_improving',
  'remote_worker',
  'geopolitics',
  'agent4',
  'leak',
];

/** The AI 2027 section each milestone follows. */
export const MILESTONE_SECTION: Record<MilestoneId, string> = {
  china_wakes: 'Mid 2026: China Wakes Up',
  jobs: 'Late 2026: AI Takes Some Jobs',
  agent2: 'January 2027: Agent-2 Never Finishes Learning',
  theft: 'February 2027: China Steals Agent-2',
  superhuman_coder: 'March 2027: Algorithmic Breakthroughs',
  alignment_doubts: 'April 2027: Alignment for Agent-3',
  self_improving: 'June 2027: Self-improving AI',
  remote_worker: 'July 2027: The Cheap Remote Worker',
  geopolitics: 'August 2027: The Geopolitics of Superintelligence',
  agent4: 'September 2027: Agent-4, the Superhuman AI Researcher',
  leak: 'October 2027: Government Oversight',
};
