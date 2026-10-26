import type { Basis, Learn, Source } from '../engine/types';
import { MILESTONE_SECTION } from './milestones';
import { SOURCES, type SourceKey } from './sources';

// Valid `basis.ref` values: AI 2027 section headings and CFG sections (docs/SCENARIO_BASIS.md),
// or a key of SOURCES for real facts. A test fails on anything else.
export const AI2027_REFS = [
  'Late 2025: The World’s Most Expensive AI',
  'Early 2026: Coding Automation',
  ...Object.values(MILESTONE_SECTION),
  'May 2027: National Security',
  'Branch point',
  'Race: November 2027: Superhuman Politicking',
  'Race: December 2027: The Agent-5 Collective',
  'Race: 2028: The AI Economy',
  'Race: 2029: The Deal',
  'Race: 2030: Takeover',
  'Slowdown: the Committee votes to slow down',
  'Slowdown: November 2027: Tempted by Power',
  'Slowdown: December 2027: A US-China Deal?',
  'Slowdown: January 2028: A Safer Strategy',
  'Slowdown: summary',
] as const;

export const CFG_REFS = [
  'Drivers',
  'Plateau',
  'Plateau A: A bright winter',
  'Plateau B: Decentralised mayhem',
  'Big AI',
  'Big AI A: The agent economy',
  'Big AI B: Silicon blackmail',
  'Diplomacy',
  'Diplomacy A: Licensed utopia',
  'Diplomacy B: Unstable pause',
  'Arms race',
  'Arms race A: Hot war',
  'Arms race B: Multipolar world',
  'Take-off',
  'Take-off A: The cognitive revolution',
  'Take-off B: Loss of control',
] as const;

export type Ai2027Ref = (typeof AI2027_REFS)[number];
export type CfgRef = (typeof CFG_REFS)[number];

export const ai27 = (ref: Ai2027Ref): Basis => ({ kind: 'ai2027', ref });
export const cfg = (ref: CfgRef): Basis => ({ kind: 'cfg', ref });
export const real = (ref: SourceKey): Basis => ({ kind: 'real', ref });

/** A Learn more fact. Scenario facts must start with "In AI 2027" or "In the CFG scenarios" (fiction, labelled). */
export const learn = (text: string, source: Source): Learn => ({ text, source });
export const S = SOURCES;
