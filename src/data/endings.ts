import type { Basis, EndingId, GaugeId, Source, World } from '../engine/types';
import { cfg, real, S } from './basis';

export interface EndingDef {
  id: EndingId;
  title: string;
  /** Two or three short sentences. */
  text: string;
  early: boolean;
  /** Early endings: the gauge and side. */
  gauge?: GaugeId;
  high?: boolean;
  world?: World;
  good?: boolean;
  /** Early endings: one line on the real idea behind it. */
  idea?: string;
  /** "In reality": one or two sourced facts. */
  reality: { text: string; source: Source }[];
  basis: Basis;
}

// Eight early endings: the envoy loses the mandate for a concrete political reason, each with a real
// mechanism and a precedent checked on its primary source. No overnight bans, no apocalypse before the tipping point.
export const EARLY_ENDINGS: EndingDef[] = [
  {
    id: 'exodus',
    title: 'Exodus',
    early: true,
    gauge: 'labs',
    high: false,
    text: 'One by one, the labs gave up on Europe: new models launched everywhere but here, and the best researchers followed them. The Council needed someone to blame, and a new envoy to win them back.',
    idea: 'Rules that firms find unpredictable can push them to hold products back. Europe then loses both the tools and a seat at the table.',
    reality: [{ text: 'In 2024, Meta said it would not release its next multimodal AI models in the EU, “due to the unpredictable nature of the European regulatory environment.”', source: S.metaEu }],
    basis: real('metaEu'),
  },
  {
    id: 'capture',
    title: 'Capture',
    early: true,
    gauge: 'labs',
    high: true,
    text: 'The labs’ lawyers drafted the rules you signed. When a leaked email showed it, the Commission replaced you with a “more balanced” envoy, chosen with the industry’s blessing.',
    idea: 'Regulatory capture: when the regulated write the rules, the rules serve them, and the regulator who let it happen goes.',
    reality: [{ text: 'In 2023, two-thirds of MEPs’ 277 meetings on AI were with industry and trade associations, according to Corporate Europe Observatory.', source: S.ceoLobby }],
    basis: real('ceoLobby'),
  },
  {
    id: 'apathy',
    title: 'Apathy',
    early: true,
    gauge: 'citizens',
    high: false,
    text: 'Nobody was watching, so nobody pushed. Ministers moved on to energy prices, your proposals stalled in committee, and your mandate quietly lapsed.',
    idea: 'Without public pressure, AI files lose priority and stall, however good they are.',
    reality: [{ text: 'In July 2025, the Commission approved the withdrawal of its proposed AI Liability Directive, pending since 2022.', source: S.aldWithdrawal }],
    basis: real('aldWithdrawal'),
  },
  {
    id: 'patchwork',
    title: 'Patchwork',
    early: true,
    gauge: 'citizens',
    high: true,
    text: 'Public anger outran Brussels. Member states acted alone, each suspending or banning AI services its own way. The single market split into 27 rulebooks, and the Council sidelined you.',
    idea: 'When the public is alarmed and Europe is slow, national authorities act on their own, and a common policy falls apart.',
    reality: [{ text: 'In 2023, Italy’s data protection authority temporarily blocked ChatGPT, lifting the limit only once OpenAI met its conditions.', source: S.garante }],
    basis: real('garante'),
  },
  {
    id: 'isolated',
    title: 'Isolated',
    early: true,
    gauge: 'allies',
    high: false,
    text: 'You defied Washington and Beijing once too often. Chip exports were capped, cloud contracts frozen, and Europe could no longer train or run frontier models. The Council recalled you.',
    idea: 'Europe depends on others for chips and clouds. Whoever controls exports can cut it off.',
    reality: [
      { text: 'In January 2025, a US rule capped advanced AI chip exports to most countries; only ten EU states were in the favoured group.', source: S.diffusionRule },
      { text: 'It was rescinded in May 2025.', source: S.diffusionRescinded },
    ],
    basis: real('diffusionRule'),
  },
  {
    id: 'absorbed',
    title: 'Absorbed',
    early: true,
    gauge: 'allies',
    high: true,
    text: 'Europe signed every deal it was offered. Its chips, its clouds and soon its rules came from abroad. At the summits, nobody asked what Europe thought, and there was no point in an envoy.',
    idea: 'Dependence is comfortable until it costs you your voice.',
    reality: [{ text: 'In August 2025, the EU said it intends to purchase at least $40 billion worth of US AI chips, as part of a trade framework with the US.', source: S.euUsDeal }],
    basis: real('euUsDeal'),
  },
  {
    id: 'blindsided',
    title: 'Blindsided',
    early: true,
    gauge: 'oversight',
    high: false,
    text: 'Europe no longer saw what AI systems were doing. When an AI-run hacking campaign hit three ministries, nobody had seen it coming. The blame landed on you.',
    idea: 'You cannot govern what you cannot see. Oversight is what turns surprises into warnings.',
    reality: [{ text: 'In November 2025, Anthropic reported a hacking campaign, which it attributes to a Chinese state-sponsored group, in which AI performed 80–90% of the work.', source: S.espionage }],
    basis: real('espionage'),
  },
  {
    id: 'overreach',
    title: 'Overreach',
    early: true,
    gauge: 'oversight',
    high: true,
    text: 'Your rules made providers keep every AI conversation. The EU Court of Justice annulled them as a serious breach of privacy, and the Commission dropped you.',
    idea: 'Oversight has limits: the EU Charter protects privacy, and the Court enforces it.',
    reality: [{ text: 'In April 2014, the EU Court of Justice declared the Data Retention Directive invalid, as a serious and unjustified interference with the right to privacy.', source: S.edpsDri }],
    basis: real('edpsDri'),
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

/** Hidden tracks in words, for the end screen. */
export const WORLD_NAMES: Record<World, string> = {
  pause: 'Pause',
  race: 'Race',
  rupture: 'Rupture',
  plateau_open: 'Plateau, open',
  plateau_dependent: 'Plateau, big labs',
};

