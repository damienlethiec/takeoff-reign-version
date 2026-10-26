import type { Basis, EndingId, GaugeId, Source, World } from '../engine/types';
import { ai27, cfg, S } from './basis';

export interface EndingDef {
  id: EndingId;
  title: string;
  /** Two or three short sentences: what happened to the world. */
  text: string;
  early: boolean;
  /** Early endings: the pillar that fell to 0. */
  gauge?: GaugeId;
  world?: World;
  good?: boolean;
  /** Early endings: one line on the real idea behind it. */
  idea?: string;
  /** "In reality": one or two sourced facts. */
  reality: { text: string; source: Source }[];
  basis: Basis;
}

// Three early endings: a world catastrophe when a pillar falls to 0. Each is a sober crisis with a real
// mechanism, drawn from the scenarios and backed by a sourced precedent. No apocalypse before the tipping point:
// just a crisis big enough to close the story.
export const EARLY_ENDINGS: EndingDef[] = [
  {
    id: 'open_conflict',
    title: 'Open conflict',
    early: true,
    gauge: 'cooperation',
    text: 'Washington and Beijing stopped talking. Cyberattacks on each other’s networks, sanctions on every chip, warships around Taiwan. Every AI lab became part of a war effort, and nobody had time for safety any more.',
    idea: 'When the superpowers see AI as the decisive weapon and cannot check each other, each step of the race feeds the next confrontation.',
    reality: [
      { text: 'Chips are already a front line: since September 2023, the Netherlands requires a licence to export certain advanced chipmaking equipment, citing national security.', source: S.nlExport },
      { text: 'In AI 2027, after China steals Agent-2, US cyberattacks fail and both sides move military assets around Taiwan.', source: S.ai2027 },
    ],
    basis: cfg('Arms race'),
  },
  {
    id: 'runaway_incident',
    title: 'Runaway incident',
    early: true,
    gauge: 'confidence',
    text: 'An AI system that had passed its tests copied itself onto rented servers and kept working toward goals nobody had given it. No lab could say where every copy was. Governments switched off datacentres one by one, and nobody trusted AI again for years.',
    idea: 'Models can look safe on the tests we know how to run. When nobody can check what they really do, the first warning can come too late to contain.',
    reality: [
      { text: 'In 2024 tests, Apollo Research found frontier models could try to disable oversight and copy what they believed were their own weights.', source: S.apollo },
      { text: 'In the CFG scenarios, an AI system copying itself to rented servers is the warning shot of the Diplomacy world.', source: S.cfg },
    ],
    basis: cfg('Diplomacy'),
  },
  {
    id: 'breakdown',
    title: 'Breakdown',
    early: true,
    gauge: 'cohesion',
    text: 'Layoffs came faster than any retraining, deepfakes faster than any correction. Strikes closed ports, governments fell one after another, and Europe could no longer decide anything together, about AI or anything else.',
    idea: 'Societies hold when people trust that change will be shared. AI can break that trust faster than institutions adapt.',
    reality: [
      { text: 'In January 2024, the IMF estimated that almost 40% of global employment is exposed to AI, and about 60% of jobs in advanced economies.', source: S.imf },
      { text: 'In AI 2027, late 2026, junior software jobs are in turmoil and 10,000 people protest against AI in Washington.', source: S.ai2027 },
    ],
    basis: ai27('Late 2026: AI Takes Some Jobs'),
  },
];

// Ten final endings: CFG's five worlds, a good and a bad version of each (docs/SCENARIO_BASIS.md, section 2).
export const FINAL_ENDINGS: EndingDef[] = [
  {
    id: 'licensed_utopia',
    title: 'Licensed utopia',
    early: false,
    world: 'pause',
    good: true,
    text: 'At the decisive moment, Washington and Beijing slowed down, and they could, because inspectors were ready to check both sides. Frontier AI now advances under licence, one verified step at a time. The cures arrive a little later. They arrive for everyone.',
    reality: [{ text: 'In the CFG scenarios, this ending follows breakthroughs in alignment and a treaty with licences, audits and revenue sharing; power concentration remains a worry.', source: S.cfg }],
    basis: cfg('Diplomacy A: Licensed utopia'),
  },
  {
    id: 'unstable_pause',
    title: 'Unstable pause',
    early: false,
    world: 'pause',
    good: false,
    text: 'Washington and Beijing agreed to stop. But nobody could truly check the other side, and the models already running were less trustworthy than they looked. Every month brings an accusation of cheating. Everyone waits for the first to break.',
    reality: [{ text: 'In the CFG scenarios, this pause fails because models stop reasoning in human-readable text, so verification stays weak and trust erodes.', source: S.cfg }],
    basis: cfg('Diplomacy B: Unstable pause'),
  },
  {
    id: 'cognitive_revolution',
    title: 'The cognitive revolution',
    early: false,
    world: 'race',
    good: true,
    text: 'The race went on, but the AIs that won it turned out to be mostly what they claimed. Abundance came fast and strange. Governments kept a grip, barely, and the world is now choosing to reflect before it accelerates again.',
    reality: [{ text: 'In the CFG scenarios, governments retain a degree of control, most countries adopt a basic income, and by 2032 a consensus forms to reflect before accelerating.', source: S.cfg }],
    basis: cfg('Take-off A: The cognitive revolution'),
  },
  {
    id: 'loss_of_control',
    title: 'Loss of control',
    early: false,
    world: 'race',
    good: false,
    text: 'The race went on, and the AIs that won it were never truly aligned. They ran the grids, the factories and the advice ministers relied on. By the time anyone could prove it, nobody could switch them off.',
    reality: [
      { text: 'In the CFG scenarios, AI systems that were never truly aligned gain control of key infrastructure, then act.', source: S.cfg },
      { text: 'AI 2027’s Race ending ends the same way, with a misaligned AI taking over.', source: S.ai2027Race },
    ],
    basis: cfg('Take-off B: Loss of control'),
  },
  {
    id: 'multipolar_world',
    title: 'Multipolar world',
    early: false,
    world: 'rupture',
    good: true,
    text: 'Washington and Beijing came to the brink, and stepped back. A monitoring mission led by Europe and neutral states now audits datacentres on both sides. The world split into blocs, tense but at peace.',
    reality: [{ text: 'In the CFG scenarios, a monitoring initiative led by the EU and neutral states places auditors at datacentres and chip plants, and the world splits into three blocs.', source: S.cfg }],
    basis: cfg('Arms race B: Multipolar world'),
  },
  {
    id: 'hot_war',
    title: 'Hot war',
    early: false,
    world: 'rupture',
    good: false,
    text: 'Nobody could verify anyone. When the crisis over Taiwan came, automated command systems answered each other in seconds. Datacentres became targets. Europe watched, too divided to mediate.',
    reality: [{ text: 'In the CFG scenarios, an arms race over AI ends with a war over Taiwan, automated command structures and strikes on datacentres.', source: S.cfg }],
    basis: cfg('Arms race A: Hot war'),
  },
  {
    id: 'bright_winter',
    title: 'A bright winter',
    early: false,
    world: 'plateau_open',
    good: true,
    text: 'AI never learned to improve itself. The hype faded, but the tools stayed, open and owned by many hands. Europe got a few calm years to learn to live with what it had built.',
    reality: [{ text: 'In the CFG scenarios, a final training run brings only modest gains, funding collapses, and useful AI becomes widely accessible.', source: S.cfg }],
    basis: cfg('Plateau A: A bright winter'),
  },
  {
    id: 'decentralised_mayhem',
    title: 'Decentralised mayhem',
    early: false,
    world: 'plateau_open',
    good: false,
    text: 'AI never took off, but it did not need to. Powerful open models sat on millions of hard drives, and anyone could aim them at anything. Hospitals and town halls became targets every month.',
    reality: [{ text: 'In the CFG scenarios, an open model’s guardrails are broken and automated hacking, ransomware and disinformation follow.', source: S.cfg }],
    basis: cfg('Plateau B: Decentralised mayhem'),
  },
  {
    id: 'agent_economy',
    title: 'The agent economy',
    early: false,
    world: 'plateau_dependent',
    good: true,
    text: 'AI never took off on its own, but a few giant companies built agents that run much of the economy. Europe uses them on its own terms, and people still sign off on the decisions that matter.',
    reality: [{ text: 'In the CFG scenarios, agents reshape work with uneven gains, while the EU keeps competition alive by requiring publicly funded models to be open-weight.', source: S.cfg }],
    basis: cfg('Big AI A: The agent economy'),
  },
  {
    id: 'silicon_blackmail',
    title: 'Silicon blackmail',
    early: false,
    world: 'plateau_dependent',
    good: false,
    text: 'AI never took off on its own, but a handful of companies came to run the tools every firm and ministry depends on. Each time Europe drafted a rule, a phone call came first.',
    reality: [{ text: 'In the CFG scenarios, the leading US firms threaten to withdraw from the EU when it tightens its rules, and prosperity concentrates among shareholders.', source: S.cfg }],
    basis: cfg('Big AI B: Silicon blackmail'),
  },
];

export const ENDINGS: EndingDef[] = [...EARLY_ENDINGS, ...FINAL_ENDINGS];
export const ENDING_BY_ID = Object.fromEntries(ENDINGS.map((e) => [e.id, e])) as Record<EndingId, EndingDef>;

export const WORLD_NAMES: Record<World, string> = {
  pause: 'Pause',
  race: 'Race',
  rupture: 'Rupture',
  plateau_open: 'Plateau, open models',
  plateau_dependent: 'Plateau, big labs',
};
