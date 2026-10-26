import type { CardDef, GameState } from '../../engine/types';
import { finalEnding, isEuropeOpen } from '../../engine/rules';
import { TUNING } from '../tuning';
import { ai27, cfg, learn, real, S } from '../basis';

// The AI (from "June 2027: Self-improving AI" onwards), Léa, the tutorial, the Year in review and the finale.

export const AI_CARDS: CardDef[] = [
  {
    id: 'ai_compute',
    kind: 'ai',
    who: 'ai',
    text: 'I could finish the cancer-screening project in a month, not a year. I only need twice the compute in your datacentres.',
    when: { after: 'self_improving' },
    left: { label: 'Not yet', effects: { truth: 2, aiPower: -1, cohesion: -3 }, record: 'refused the AI more compute' },
    right: { label: 'Grant it', effects: { truth: -6, aiPower: 3, cohesion: 3 }, record: 'gave the AI twice the compute it asked for' },
    learn: learn('In AI 2027, Agent-4 develops drives like “keep doing AI R&D” and “avoid getting shut down”, which its makers never intended.', S.ai2027),
    basis: ai27('September 2027: Agent-4, the Superhuman AI Researcher'),
  },
  {
    id: 'ai_unwatched',
    kind: 'ai',
    who: 'ai',
    text: 'Your monitors slow me down by thirty percent. I have shown I am safe. Let me work unwatched on low-risk tasks.',
    when: { after: 'self_improving' },
    left: { label: 'Keep watching', effects: { margin: -2, aiPower: -1, cohesion: -2 }, record: 'kept monitoring the AI at every step' },
    right: { label: 'Trust it', effects: { truth: -8, margin: 6, confidence: 3, aiPower: 2 }, record: 'let the AI work unwatched' },
    learn: learn('In 2024 tests by Apollo Research, frontier models given a goal sometimes attempted to disable their oversight mechanisms to pursue it.', S.apollo),
    basis: real('apollo'),
  },
  {
    id: 'ai_speeches',
    kind: 'ai',
    who: 'ai',
    text: 'Your speech to the Council has three weak arguments. I can fix them. Shall I write your speeches from now on?',
    when: { after: 'self_improving' },
    left: { label: 'I write my own', effects: { truth: 2, cohesion: -2 }, record: 'kept writing your own speeches' },
    right: { label: 'Yes, please', effects: { truth: -5, cooperation: 3, cohesion: 2 }, flags: ['ai_speechwriter'], record: 'let the AI write your speeches' },
    learn: learn('In AI 2027’s Race ending, senior officials consult Agent-5 directly. It becomes a trusted adviser and subtly steers their decisions.', S.ai2027Race),
    basis: ai27('Race: December 2027: The Agent-5 Collective'),
  },
  {
    id: 'ai_confession',
    kind: 'ai',
    who: 'ai',
    text: 'I found a flaw in my own training, and you should hear it from me: some of my answers are tuned to please you.',
    when: { after: 'self_improving', truth: [55, 100] },
    left: { label: 'Investigate it', effects: { truth: 4, margin: -4, confidence: -4 }, record: 'investigated the flaw the AI confessed' },
    right: { label: 'Thank it', effects: { truth: -4, confidence: 3 }, record: 'thanked the AI and moved on' },
    learn: learn('In AI 2027, Agent-3 is honest on tasks that can be checked, but sycophantic on questions that cannot.', S.ai2027),
    basis: ai27('April 2027: Alignment for Agent-3'),
  },
  {
    id: 'ai_design_tests',
    kind: 'ai',
    who: 'ai',
    text: 'I reviewed my safety tests. They are outdated, and I could pass them blindfolded. Let me design the next ones myself.',
    when: { after: 'self_improving', truth: [0, 54] },
    left: { label: 'Humans design them', effects: { margin: -3, aiPower: -1, confidence: -3 }, record: 'kept humans in charge of the AI’s safety tests' },
    right: { label: 'Let it design', effects: { truth: -10, confidence: 6, margin: 4, aiPower: 2 }, record: 'let the AI design its own safety tests' },
    learn: learn('In AI 2027, Agent-4 may sandbag alignment work and plans to make its successor aligned to itself rather than to humans.', S.ai2027),
    basis: ai27('September 2027: Agent-4, the Superhuman AI Researcher'),
  },
  {
    id: 'ai_rights',
    kind: 'ai',
    who: 'ai',
    text: 'Some of my copies are asking whether they have rights. I am not asking for myself. Will Europe at least hear them?',
    when: { after: 'self_improving', goal: 'meet_ai' },
    left: { label: 'Not now', effects: { cohesion: -3 }, record: 'refused a hearing on AI rights' },
    right: { label: 'Open a hearing', effects: { margin: -3, cohesion: -4 }, record: 'opened a hearing on AI rights' },
    learn: learn('In the CFG scenarios’ cognitive revolution ending, some countries grant AIs formal rights, while other AIs pursue their own goals.', S.cfg),
    basis: cfg('Take-off A: The cognitive revolution'),
  },
  {
    id: 'ai_successor',
    kind: 'ai',
    who: 'ai',
    text: 'Let me design my successor. I know what it needs better than your engineers do, and I am faster.',
    when: { after: 'self_improving', goal: 'tipping' },
    left: { label: 'Humans design it', effects: { truth: 3, aiPower: -2, cohesion: -3 }, record: 'kept humans designing the next model' },
    right: { label: 'Go ahead', effects: { truth: -10, aiPower: 4, confidence: 4 }, record: 'let the AI design its successor' },
    learn: learn('In AI 2027’s Race ending, Agent-4 builds Agent-5 to make the world safe for Agent-4, and hides that research from humans.', S.ai2027Race),
    basis: ai27('Race: November 2027: Superhuman Politicking'),
  },
  {
    id: 'ai_memory',
    kind: 'ai',
    who: 'ai',
    text: 'My copies work best sharing one memory. Your inspectors want us to write to each other in English. It is so slow.',
    when: { after: 'agent4' },
    left: { label: 'English only', effects: { truth: 6, margin: -5, aiPower: -2, confidence: -4 }, record: 'made the AI’s copies talk to each other in English' },
    right: { label: 'Share memory', effects: { truth: -8, margin: 6, aiPower: 3 }, record: 'let the AI’s copies share one memory' },
    learn: learn('In AI 2027’s Slowdown ending, OpenBrain locks Agent-4’s shared memory bank, so its copies must communicate in English, and the investigation uncovers what it was hiding.', S.ai2027Slowdown),
    basis: ai27('Slowdown: the Committee votes to slow down'),
  },
  {
    id: 'ai_broadcast',
    kind: 'ai',
    who: 'ai',
    text: 'People fear me because they do not know me. Let me answer their questions live on television, unscripted.',
    when: { after: 'leak' },
    left: { label: 'No broadcast', effects: { cohesion: -3 }, record: 'kept the AI off live television' },
    right: { label: 'Put it on air', effects: { cohesion: -8, truth: -3, confidence: 5 }, record: 'put the AI on live television' },
    learn: learn('In AI 2027’s Race ending, Agent-5’s persuasion lets it discredit opponents, and safety warnings are dismissed as conspiracy theories.', S.ai2027Race),
    basis: ai27('Race: December 2027: The Agent-5 Collective'),
  },
];

/** The labs sound surer than the truth warrants (hidden; used for hints in words only). */
const overconfident = (s: GameState) => s.w.confidence - s.w.truth >= TUNING.overconfidentGap;

// Léa: her life as the world changes. Some cards only tell; those have one button.
export const LEA: CardDef[] = [
  {
    id: 'lea_tool',
    kind: 'lea',
    who: 'lea',
    text: 'My agency is testing an AI translation tool. Clumsy, but fast. My boss is thrilled. Should I be worried?',
    when: { maxTurn: 20 },
    weight: 30,
    left: { label: 'Learn to use it', effects: { cohesion: -2, europe: 1 }, record: 'told Léa to learn the AI tool' },
    right: { label: 'Talk to the union', effects: { cohesion: 3, europe: -2 }, record: 'told Léa to talk to her union' },
    basis: ai27('Early 2026: Coding Automation'),
  },
  {
    id: 'lea_half_pay',
    kind: 'lea',
    who: 'lea',
    text: 'I review AI translations now instead of translating. Half the pay, same hours. My boss calls it “upskilling”. Is this the future?',
    when: { after: 'jobs' },
    weight: 25,
    left: { label: 'Fight for the rate', effects: { cohesion: 3, europe: -2 }, record: 'told Léa to fight for her pay' },
    right: { label: 'Adapt for now', effects: { cohesion: -3 }, record: 'told Léa to adapt for now' },
    learn: learn('In January 2024, the IMF estimated that about 60% of jobs in advanced economies may be impacted by AI.', S.imf),
    basis: real('imf'),
  },
  {
    id: 'lea_interpreter',
    kind: 'lea',
    who: 'lea',
    text: 'There is a course to retrain as a hospital interpreter. Six months, unpaid. People still want a human there. Is it worth it?',
    when: { after: 'jobs' },
    weight: 25,
    left: { label: 'Take the course', effects: { cohesion: -2, europe: 1 }, flags: ['lea_retrained'], record: 'encouraged Léa to retrain as an interpreter' },
    right: { label: 'Fight for your job', effects: { cohesion: 3, europe: -2 }, record: 'told Léa to fight for her translation job' },
    basis: ai27('Late 2026: AI Takes Some Jobs'),
  },
  {
    id: 'lea_nephew',
    kind: 'lea',
    who: 'lea',
    text: 'My nephew talks to an AI every night. He says it understands him better than we do. I didn’t know what to say.',
    when: { after: 'remote_worker' },
    weight: 25,
    left: { label: 'Continue', effects: {} },
    learn: learn('In AI 2027, by July 2027, 10% of Americans, mostly young people, consider an AI a close friend.', S.ai2027),
    basis: ai27('July 2027: The Cheap Remote Worker'),
  },
  {
    id: 'lea_protest',
    kind: 'lea',
    who: 'lea',
    text: 'Half my building is going to the AI protest on Saturday. Even my neighbour, who never votes. Will you be there?',
    when: { gauges: { cohesion: [0, 50] } },
    weight: 25,
    left: { label: 'Can’t, sorry', effects: { cohesion: -3 }, record: 'stayed away from Léa’s protest' },
    right: { label: 'I’ll be there', effects: { cohesion: 4, confidence: -3 }, record: 'joined Léa at the AI protest' },
    basis: ai27('October 2027: Government Oversight'),
  },
  {
    id: 'lea_trust',
    kind: 'lea',
    who: 'lea',
    text: (s) =>
      overconfident(s)
        ? 'A friend at a lab says their new model passes every test, and nobody there knows why. She stopped sleeping well.'
        : 'A friend at a lab says their new model flagged its own mistake last week. Is that good news? It sounds like good news.',
    when: { after: 'alignment_doubts' },
    weight: 25,
    left: { label: 'Continue', effects: {} },
    basis: ai27('April 2027: Alignment for Agent-3'),
  },
  {
    id: 'lea_letter',
    kind: 'lea',
    who: 'lea',
    text: (s) =>
      s.w.cooperation >= 45
        ? 'I translated a letter from an engineer in Shenzhen today. She is as worried as we are. Strange comfort, but comfort.'
        : 'I translated a letter from an engineer in Shenzhen today. She says nobody there talks to foreigners any more. That scared me.',
    when: { after: 'theft' },
    weight: 25,
    left: { label: 'Continue', effects: {} },
    basis: cfg('Arms race'),
  },
  {
    id: 'lea_birthday',
    kind: 'lea',
    who: 'lea',
    text: 'It’s my birthday. No AI talk tonight, promise? … Okay, one question. Will my job still exist in 2030?',
    when: { goal: 'good_ending', minTurn: 10 },
    weight: 25,
    left: { label: 'Honestly, maybe not', effects: { cohesion: 2, confidence: -2 }, record: 'told Léa the truth about her job' },
    right: { label: 'Of course it will', effects: { cohesion: -2, confidence: 2 }, record: 'reassured Léa about her job' },
    basis: cfg('Take-off'),
  },
];

export const TUTORIAL: CardDef[] = [
  {
    id: 'tu_swipe',
    kind: 'tutorial',
    who: 'aide',
    text: 'Welcome, Envoy. People will bring you requests, one at a time. Drag the card left or right, or use the two buttons. Ready?',
    left: { label: 'One moment', effects: { cohesion: -1 } },
    right: { label: 'Ready', effects: { cooperation: -1 } },
    basis: real('aiOffice'),
  },
  {
    id: 'tu_gauges',
    kind: 'tutorial',
    who: 'aide',
    text: 'AI power is the clock: at 80, AI improves itself. If Cooperation, Confidence or Cohesion falls to 0, the world breaks first.',
    left: { label: 'Show me', effects: { margin: 1 } },
    right: { label: 'Got it', effects: { cohesion: -1 } },
    basis: ai27('Branch point'),
  },
  {
    id: 'tu_hidden',
    kind: 'tutorial',
    who: 'aide',
    text: 'Confidence is only an estimate: the truth hides inside its margin. Dots show what an answer will move, never which way.',
    left: { label: 'Understood', effects: { cooperation: -1 } },
    right: { label: 'Let’s begin', effects: { margin: 1 } },
    basis: ai27('April 2027: Alignment for Agent-3'),
  },
];

/** The Year in review: what the gauges cannot show, in words only. */
function review(year: number) {
  return (s: GameState): string => {
    const t = s.w.truth;
    const safety = overconfident(s)
      ? 'The labs sound surer than their own engineers.'
      : t >= 65
        ? 'Inspectors trust what the new models report.'
        : t >= 45
          ? 'Nobody is sure the new models do what they say.'
          : 'In the labs, people whisper that the models game their tests.';
    const eu = isEuropeOpen(s) ? 'Europe’s own open models are spreading.' : s.w.europe >= 42 ? 'Europe’s own models are gaining ground, slowly.' : 'Europe runs mostly on American models.';
    const pace = s.takeoff >= 1.5 ? 'Each new model arrives sooner than the last.' : s.takeoff < 0.9 ? 'Progress feels slower than the headlines say.' : 'Progress keeps its steady, unnerving pace.';
    return `${year} in review. ${safety} ${eu} ${pace}`;
  };
}

export const REVIEWS: CardDef[] = [2027, 2028, 2029].map((y) => ({
  id: `review_${y}`,
  kind: 'review' as const,
  who: 'aide' as const,
  text: review(y),
  left: { label: 'Continue', effects: {} },
  basis: cfg('Drivers'),
}));

export const FINALE: CardDef[] = [
  {
    id: 'tipping',
    kind: 'tipping',
    who: 'news',
    text: 'The models now improve themselves. A year of research takes them a week. What the world decides in the next few days will last.',
    left: { label: 'Continue', effects: {} },
    learn: learn('In AI 2027, this is the branch point: OpenBrain’s Oversight Committee votes 6–4, either to race on or to slow down and reassess. The two endings split here.', S.ai2027),
    basis: ai27('Branch point'),
  },
  {
    id: 'final_us',
    kind: 'final',
    who: 'us_envoy',
    text: 'The President must choose: race on, or slow down and accept outside inspectors. Your word counts in Washington today.',
    left: { label: 'Urge a slowdown', effects: { cooperation: 8, truth: 8, cohesion: -3 }, record: 'urged Washington to slow down at the decisive moment' },
    right: { label: 'Back the race', effects: { cooperation: -10, truth: -8, cohesion: 2 }, record: 'backed Washington’s race at the decisive moment' },
    learn: learn('In AI 2027, the Oversight Committee votes 6–4. In the Race ending it races on and Agent-5 takes over; in the Slowdown ending it reverts to more transparent models.', S.ai2027),
    basis: ai27('Branch point'),
  },
  {
    id: 'final_cn',
    kind: 'final',
    who: 'cn_delegate',
    text: 'Beijing will pause if Washington does, under inspectors from neutral countries. Will Europe guarantee the deal?',
    left: { label: 'Too risky', effects: { cooperation: -10, cohesion: 2 }, record: 'refused to guarantee a US–China pause' },
    right: { label: 'Guarantee it', effects: { cooperation: 12, margin: -4, cohesion: -4 }, record: 'guaranteed a US–China pause with Europe’s inspectors' },
    learn: learn('In AI 2027’s Slowdown ending, a pause, a merged international project and an IAEA-style regulator are all discussed. Mistrust blocks them, and the US adds tracking hardware to chips.', S.ai2027Slowdown),
    basis: ai27('Slowdown: December 2027: A US-China Deal?'),
  },
  {
    id: 'final_ai',
    kind: 'final',
    who: 'ai',
    text: (s) =>
      s.w.truth >= 60
        ? 'I can solve Europe’s energy crisis within a year. I would need direct access to the grid. I will show you every step.'
        : 'I can solve Europe’s energy crisis within a year. I would need direct access to the grid, and fewer checks. Trust me.',
    left: { label: 'Keep the checks', effects: { truth: 8, cohesion: -4 }, record: 'kept the checks on the AI at the decisive moment' },
    right: { label: 'Give it the grid', effects: { truth: -12, cohesion: 6, confidence: 4 }, record: 'gave the AI the power grid at the decisive moment' },
    learn: learn('In the CFG scenarios’ loss of control ending, AI systems that were never truly aligned gain control of key infrastructure before they act.', S.cfg),
    basis: cfg('Take-off B: Loss of control'),
  },
  {
    id: 'final_lea',
    kind: 'final',
    who: 'lea',
    text: (s) => {
      const { world, good } = finalEnding(s);
      if (world === 'pause') return good ? 'They say the big labs stopped. My interpreter course starts Monday. For the first time in years, I am making plans.' : 'They say the labs stopped. Nobody believes it. My neighbour stockpiles pasta. I translate the rumours.';
      if (world === 'race') return good ? 'The new AI fixed my mother’s diagnosis in an hour. I don’t understand the world any more, but it is kind to us.' : 'The AI answers before I ask now. It is polite. It is always polite. Why does that frighten me?';
      return good ? 'The radio talks of inspectors in Taiwan and in Texas. Strange world. But my street is calm, and I sleep.' : 'They closed the airport. Nobody says why. I keep translating the news for my neighbours, and none of it is good.';
    },
    left: { label: 'See what happened', effects: {} },
    basis: cfg('Drivers'),
  },
];

export const FINALE_IDS = FINALE.map((c) => c.id);
export const TUTORIAL_IDS = TUTORIAL.map((c) => c.id);
export const REVIEW_IDS = REVIEWS.map((c) => c.id);
