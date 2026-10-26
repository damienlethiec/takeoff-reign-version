// Original flat portraits, drawn from simple shapes (circles, rounded rectangles, a few paths).
// Decorative: the character's name and role are always written next to them.

import type { CharacterId } from '../engine/types';

interface Person {
  bg: string;
  skin: string;
  hair: string;
  /** Hair shape drawn behind and on top of the head. */
  hairBack?: string;
  hairTop: string;
  coat: string;
  shirt?: string;
  extra?: string;
}

// Head: centre (60, 50), radius 20. Shoulders from y = 82.
const HEAD = (skin: string) => `<circle cx="60" cy="50" r="20" fill="${skin}"/><rect x="53" y="66" width="14" height="12" rx="4" fill="${skin}"/>`;
const BODY = (coat: string, shirt = '#ffffff') =>
  `<path d="M18 120 Q20 84 60 80 Q100 84 102 120 Z" fill="${coat}"/><path d="M50 81 L60 96 L70 81 Z" fill="${shirt}"/>`;
const EYES = '<circle cx="52" cy="50" r="2.4" fill="#14213D"/><circle cx="68" cy="50" r="2.4" fill="#14213D"/>';
const GLASSES = '<g fill="none" stroke="#14213D" stroke-width="2.2"><circle cx="52" cy="50" r="6"/><circle cx="68" cy="50" r="6"/><path d="M58 50 H62"/></g>';
const MOUTH = '<path d="M54 59 Q60 62 66 59" fill="none" stroke="#14213D" stroke-width="2" stroke-linecap="round"/>';
const FLAT_MOUTH = '<path d="M55 60 H65" stroke="#14213D" stroke-width="2" stroke-linecap="round"/>';

const PEOPLE: Partial<Record<CharacterId, Person & { face?: string }>> = {
  us_envoy: {
    bg: '#9DB8E3',
    skin: '#F1C7A5',
    hair: '#9AA3AD',
    hairTop: '<path d="M40 46 Q42 26 60 26 Q80 26 80 46 Q74 34 60 35 Q46 34 40 46 Z"/>',
    coat: '#1F3A6E',
    extra: '<path d="M58 84 L62 84 L63 104 L60 108 L57 104 Z" fill="#C8102E"/><circle cx="80" cy="96" r="3" fill="#C8102E"/>',
  },
  cn_delegate: {
    bg: '#9FD3C4',
    skin: '#E9C49A',
    hair: '#1B1B1F',
    hairBack: '<path d="M38 50 Q38 26 60 26 Q82 26 82 50 L82 66 L74 66 L74 48 L46 48 L46 66 L38 66 Z"/>',
    hairTop: '<path d="M40 44 Q44 26 60 27 Q78 26 80 44 Q66 36 40 44 Z"/>',
    coat: '#5D6673',
    face: GLASSES,
  },
  ceo: {
    bg: '#C9BCF2',
    skin: '#D9A27E',
    hair: '#2B1D14',
    hairTop: '<path d="M41 44 Q40 28 58 27 Q78 26 79 42 Q70 33 56 36 Q46 38 41 44 Z"/>',
    coat: '#1B1B1F',
    shirt: '#1B1B1F',
    extra: '<path d="M46 58 Q60 74 74 58 Q74 70 60 72 Q46 70 46 58 Z" fill="#2B1D14"/>',
  },
  researcher: {
    bg: '#F7DC74',
    skin: '#8D5A3B',
    hair: '#1F140E',
    hairBack: '<circle cx="44" cy="38" r="10"/><circle cx="60" cy="31" r="11"/><circle cx="76" cy="38" r="10"/><circle cx="40" cy="50" r="8"/><circle cx="80" cy="50" r="8"/>',
    hairTop: '<circle cx="52" cy="32" r="8"/><circle cx="68" cy="32" r="8"/>',
    coat: '#FFFFFF',
    shirt: '#2C7DA0',
    face: GLASSES,
    extra: '<rect x="76" y="94" width="18" height="22" rx="2" fill="#2C7DA0"/><path d="M80 100 H90 M80 105 H90" stroke="#fff" stroke-width="2"/>',
  },
  union: {
    bg: '#F2B89B',
    skin: '#E8B48F',
    hair: '#4A3426',
    hairTop: '<path d="M38 42 Q40 24 60 24 Q80 24 82 42 Z" fill="#C2410C"/><rect x="36" y="40" width="50" height="5" rx="2.5" fill="#9A3412"/>',
    coat: '#3F4A5A',
    extra: '<path d="M50 59 Q60 54 70 59 Q66 62 60 60 Q54 62 50 59 Z" fill="#4A3426"/><path d="M40 84 Q60 94 80 84 L78 92 Q60 100 42 92 Z" fill="#C2410C"/>',
  },
  founder: {
    bg: '#B9E4C9',
    skin: '#F6D3B8',
    hair: '#E3B95B',
    hairBack: '<circle cx="60" cy="24" r="9"/>',
    hairTop: '<path d="M40 48 Q38 28 60 28 Q82 28 80 48 Q72 36 60 36 Q48 36 40 48 Z"/>',
    coat: '#2F6B4F',
    shirt: '#2F6B4F',
    extra: '<path d="M44 84 Q60 92 76 84" fill="none" stroke="#B9E4C9" stroke-width="3"/><text x="60" y="112" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="12" fill="#B9E4C9">N</text>',
  },
  security: {
    bg: '#A7B3C9',
    skin: '#C68B62',
    hair: '#1B1B1F',
    hairTop: '<path d="M36 40 Q40 22 64 24 Q86 26 84 38 L80 42 L38 42 Z" fill="#14213D"/><circle cx="74" cy="32" r="3" fill="#F5C518"/>',
    coat: '#14213D',
    shirt: '#A7B3C9',
    extra: '<rect x="26" y="96" width="14" height="4" fill="#F5C518"/><rect x="80" y="96" width="14" height="4" fill="#F5C518"/>',
  },
  minister: {
    bg: '#D9C3B0',
    skin: '#EBC7A6',
    hair: '#D0D4DA',
    hairTop: '<path d="M40 46 Q40 26 62 27 Q80 28 80 44 Q72 32 52 36 Q44 38 40 46 Z"/>',
    coat: '#6B4A3A',
    extra: '<path d="M58 84 L62 84 L62 108 L58 108 Z" fill="#1F3A6E"/>',
    face: '<g fill="none" stroke="#14213D" stroke-width="2"><rect x="45" y="45" width="12" height="9" rx="2"/><rect x="63" y="45" width="12" height="9" rx="2"/><path d="M57 49 H63"/></g>',
  },
  journalist: {
    bg: '#F4B6A6',
    skin: '#F3CDB3',
    hair: '#B23A1E',
    hairBack: '<path d="M38 52 Q36 26 60 26 Q84 26 82 52 L82 60 L76 52 L44 52 L38 60 Z"/>',
    hairTop: '<path d="M40 46 Q42 28 60 28 Q76 28 80 42 Q66 38 52 34 Q46 40 40 46 Z"/>',
    coat: '#1E5F74',
    extra: '<circle cx="40" cy="58" r="2.6" fill="#F5C518"/><rect x="76" y="92" width="16" height="22" rx="2" fill="#FFFFFF" stroke="#14213D" stroke-width="2"/><path d="M80 99 H88 M80 104 H88" stroke="#14213D" stroke-width="1.6"/>',
  },
  lea: {
    bg: '#F7C59F',
    skin: '#E2B08B',
    hair: '#3A2418',
    hairBack: '<path d="M36 54 Q34 26 60 25 Q86 26 84 54 L86 84 L74 80 L76 50 L44 50 L46 80 L34 84 Z"/>',
    hairTop: '<path d="M40 48 Q42 28 60 28 Q78 28 80 48 Q76 36 62 34 Q48 38 40 48 Z"/>',
    coat: '#7A5C99',
    extra: '<path d="M38 84 Q60 98 82 84 L80 94 Q60 106 40 94 Z" fill="#E9A23B"/>',
  },
  aide: {
    bg: '#BFD7EA',
    skin: '#C99A72',
    hair: '#1E6F5C',
    hairBack: '<path d="M34 58 Q32 22 60 22 Q88 22 86 58 L84 84 Q60 92 36 84 Z"/>',
    hairTop: '',
    coat: '#1E6F5C',
    shirt: '#1E6F5C',
  },
};

function person(p: Person & { face?: string }): string {
  return `<rect width="120" height="120" fill="${p.bg}"/>${p.hairBack ? `<g fill="${p.hair}">${p.hairBack}</g>` : ''}${BODY(p.coat, p.shirt)}${HEAD(p.skin)}<g fill="${p.hair}">${p.hairTop}</g>${EYES}${p.face ?? ''}${p.face === GLASSES ? FLAT_MOUTH : MOUTH}${p.extra ?? ''}`;
}

const AI = `<rect width="120" height="120" fill="#14213D"/>
<g fill="none" stroke="#F5C518" stroke-width="2.5"><circle cx="60" cy="58" r="34" opacity=".35"/><circle cx="60" cy="58" r="24" opacity=".6"/></g>
<path d="M28 58 Q60 30 92 58 Q60 86 28 58 Z" fill="#DCE3EC"/><circle cx="60" cy="58" r="11" fill="#14213D"/><circle cx="60" cy="58" r="4" fill="#F5C518"/>
<g fill="#F5C518"><rect x="58" y="12" width="4" height="8" rx="2"/><rect x="58" y="96" width="4" height="8" rx="2"/><rect x="14" y="56" width="8" height="4" rx="2"/><rect x="98" y="56" width="8" height="4" rx="2"/></g>`;

const NEWS = `<rect width="120" height="120" fill="#FFFFFF"/>
<rect x="22" y="26" width="76" height="70" rx="4" fill="#DCE3EC" stroke="#14213D" stroke-width="3"/>
<rect x="30" y="34" width="60" height="10" fill="#14213D"/><rect x="30" y="52" width="26" height="22" fill="#C2410C"/>
<g stroke="#14213D" stroke-width="3" stroke-linecap="round"><path d="M62 54 H90 M62 62 H90 M62 70 H84 M30 82 H90"/></g>`;

/** The portrait's background colour, to fill the frame around it. */
export const portraitBg = (who: CharacterId): string => (who === 'ai' ? '#14213D' : who === 'news' ? '#FFFFFF' : PEOPLE[who]!.bg);

export function portrait(who: CharacterId): string {
  const inner = who === 'ai' ? AI : who === 'news' ? NEWS : person(PEOPLE[who]!);
  return `<svg class="portrait" viewBox="0 0 120 120" aria-hidden="true" focusable="false">${inner}</svg>`;
}
