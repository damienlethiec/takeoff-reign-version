import type { CharacterId } from '../engine/types';

// The cast. All are fictional. Each voices positions that real actors or the scenarios hold
// (see the `basis` of their cards and docs/SCENARIO_BASIS.md).
export interface Character {
  id: CharacterId;
  name: string;
  /** Shown under the card: "US envoy". */
  role: string;
  /** One line on whose position they voice (for the build notes and the fact-check). */
  voices: string;
}

export const CHARACTERS: Record<CharacterId, Character> = {
  us_envoy: { id: 'us_envoy', name: 'Grant Holloway', role: 'US envoy', voices: 'Washington in AI 2027: win the race, tighten chip controls, keep allies close.' },
  cn_delegate: { id: 'cn_delegate', name: 'Wei Lan', role: 'Chinese delegate', voices: 'Beijing in AI 2027: close the gap, centralise compute, offer a pause when behind.' },
  ceo: { id: 'ceo', name: 'Marcus Reed', role: 'OpenBrain’s CEO', voices: 'OpenBrain leadership in AI 2027 and real lab lobbying on the AI Act.' },
  researcher: { id: 'researcher', name: 'Dr Amara Okafor', role: 'Safety researcher', voices: 'The safety team in AI 2027; real alignment and evaluation research.' },
  union: { id: 'union', name: 'Bruno Ferreira', role: 'Union leader', voices: 'Workers facing automation (AI 2027 "AI Takes Some Jobs"; real union deals on AI).' },
  founder: { id: 'founder', name: 'Sanna Lindqvist', role: 'NimbusAI founder', voices: 'Europe’s open-model camp (CFG Plateau and Big AI; real open-weight releases).' },
  security: { id: 'security', name: 'Col. Ines Marchetti', role: 'EU security chief', voices: 'Model-weight security and cyber defence (AI 2027 theft; RAND; real incidents).' },
  minister: { id: 'minister', name: 'Kenji Mori', role: 'Partner minister', voices: 'A middle-power coalition (Europe 2031) and CFG’s EU-led monitoring.' },
  journalist: { id: 'journalist', name: 'Clara Novak', role: 'Journalist', voices: 'The press and whistleblowers (AI 2027 October leak; real right-to-warn letter).' },
  lea: { id: 'lea', name: 'Léa', role: 'Your friend in Lyon', voices: 'One person living through the scenario: a translator, 34.' },
  ai: { id: 'ai', name: 'The AI', role: 'OpenBrain’s model', voices: 'The AIs of AI 2027, which speak for themselves once they improve themselves.' },
  news: { id: 'news', name: 'Breaking news', role: 'Headlines', voices: 'Events from the scenarios (fiction) or the real world (sourced).' },
  aide: { id: 'aide', name: 'Noor', role: 'Your chief of staff', voices: 'Your own team: the tutorial and the Year in review.' },
};
