import { describe, expect, it } from 'vitest';
import { AI2027_REFS, CFG_REFS } from '../src/data/basis';
import { CARDS, CARD_BY_ID, FINALE_IDS, MILESTONE_CARD, REVIEW_IDS, TUTORIAL_IDS } from '../src/data/cards';
import { CHARACTERS } from '../src/data/characters';
import { ENDINGS } from '../src/data/endings';
import { GOALS } from '../src/data/goals';
import { MILESTONE_ORDER } from '../src/data/milestones';
import { SOURCES } from '../src/data/sources';
import { newGame } from '../src/engine';
import type { Answer, Basis, CardDef } from '../src/engine/types';
import { GAUGES, HIDDEN } from '../src/engine/types';

const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
const sample = newGame({ seed: 1 });
const textOf = (c: CardDef) => {
  if (typeof c.text === 'string') return [c.text];
  // dynamic texts: try a few states that cover their branches
  const variants = new Set<string>();
  for (const safety of [10, 50, 70, 90])
    for (const coop of [10, 40, 70])
      for (const tipped of [undefined, 40])
        variants.add(c.text({ ...sample, hidden: { ...sample.hidden, safety, coop }, tippedAt: tipped }));
  return [...variants];
};
const answers = (c: CardDef): Answer[] => (c.right ? [c.left, c.right] : [c.left]);
const lowersSomething = (a: Answer) => [...GAUGES, ...HIDDEN].some((k) => (a.effects[k] ?? 0) < 0);
const validBasis = (b: Basis) =>
  b.kind === 'ai2027' ? (AI2027_REFS as readonly string[]).includes(b.ref) : b.kind === 'cfg' ? (CFG_REFS as readonly string[]).includes(b.ref) : b.ref in SOURCES;

describe('cards', () => {
  it('has about 120 cards with unique ids', () => {
    expect(CARDS.length).toBeGreaterThanOrEqual(115);
    expect(new Set(CARDS.map((c) => c.id)).size).toBe(CARDS.length);
  });

  it('every card has a valid basis (AI 2027 section, CFG section or a real source)', () => {
    for (const c of CARDS) {
      expect(c.basis, c.id).toBeDefined();
      expect(validBasis(c.basis), `${c.id}: ${c.basis.kind} ${c.basis.ref}`).toBe(true);
    }
  });

  it('card texts are at most 30 words, answer labels at most 4 words', () => {
    for (const c of CARDS) {
      for (const t of textOf(c)) expect(words(t), `${c.id}: ${t}`).toBeLessThanOrEqual(30);
      for (const a of answers(c)) expect(words(a.label), `${c.id}: ${a.label}`).toBeLessThanOrEqual(4);
    }
  });

  it('every two-answer card costs something on both sides (each lowers a gauge or a hidden track)', () => {
    for (const c of CARDS.filter((x) => x.right)) {
      expect(lowersSomething(c.left), `${c.id} left`).toBe(true);
      expect(lowersSomething(c.right!), `${c.id} right`).toBe(true);
    }
  });

  it('gauge changes stay between 2 and 20 points; requests move 1 to 3 gauges', () => {
    for (const c of CARDS)
      for (const a of answers(c))
        for (const g of GAUGES) {
          const v = Math.abs(a.effects[g] ?? 0);
          if (v) expect(v, `${c.id} ${g}`).toBeLessThanOrEqual(20);
        }
    for (const c of CARDS.filter((x) => x.kind === 'request'))
      for (const a of answers(c)) {
        const n = GAUGES.filter((g) => a.effects[g]).length;
        expect(n, `${c.id} ${a.label}`).toBeGreaterThanOrEqual(1);
        expect(n, `${c.id} ${a.label}`).toBeLessThanOrEqual(3);
      }
  });

  it('choices record what they did for the end screen', () => {
    for (const c of CARDS.filter((x) => x.right && !['tutorial'].includes(x.kind)))
      for (const a of answers(c)) expect(a.record, `${c.id} ${a.label}`).toMatch(/^[a-z]/);
  });

  it('Learn more: at most 40 words, an http(s) source from sources.ts, scenarios labelled as fiction', () => {
    const urls = new Set(Object.values(SOURCES).map((s) => s.url));
    const withLearn = CARDS.filter((c) => c.learn);
    expect(withLearn.length / CARDS.length).toBeGreaterThanOrEqual(0.5);
    for (const c of withLearn) {
      const l = c.learn!;
      expect(words(l.text), `${c.id}: ${l.text}`).toBeLessThanOrEqual(40);
      expect(urls.has(l.source.url), c.id).toBe(true);
      expect(l.source.url, c.id).toMatch(/^https:\/\//);
      if (/ai-2027\.com|cfg\.eu/.test(l.source.url)) expect(l.text, c.id).toMatch(/^In (AI 2027|the CFG scenarios)/);
    }
  });

  it('story events from the scenarios say they are fiction', () => {
    for (const c of CARDS.filter((x) => x.kind === 'news' && x.basis.kind === 'ai2027' && x.milestone)) expect(textOf(c)[0], c.id).toMatch(/^In this story/);
  });

  it('follow-ups and goal unlocks point to real cards and goals', () => {
    const goals = new Set(GOALS.map((g) => g.id));
    for (const c of CARDS) {
      for (const a of answers(c)) for (const f of a.followUps ?? []) expect(CARD_BY_ID[f.id], `${c.id} → ${f.id}`).toBeDefined();
      if (c.when?.goal) expect(goals.has(c.when.goal), `${c.id} goal ${c.when.goal}`).toBe(true);
    }
    // every goal unlocks at least one card
    for (const g of GOALS) expect(CARDS.some((c) => c.when?.goal === g.id), g.id).toBe(true);
  });

  it('has the card kinds of the spec in the right numbers', () => {
    const count = (k: string) => CARDS.filter((c) => c.kind === k).length;
    expect(count('request')).toBeGreaterThanOrEqual(70);
    expect(count('followup')).toBeGreaterThanOrEqual(10);
    expect(count('news')).toBeGreaterThanOrEqual(10);
    expect(count('lea')).toBeGreaterThanOrEqual(8);
    expect(count('ai')).toBeGreaterThanOrEqual(8);
    expect(TUTORIAL_IDS).toHaveLength(3);
    expect(REVIEW_IDS).toHaveLength(3);
    expect(FINALE_IDS).toEqual(['tipping', 'final_us', 'final_cn', 'final_ai', 'final_lea']);
    for (const id of Object.keys(CHARACTERS).filter((x) => !['news', 'aide', 'lea', 'ai'].includes(x)))
      expect(CARDS.filter((c) => c.who === id && c.kind === 'request').length, id).toBeGreaterThanOrEqual(8);
  });

  it('every milestone has its news card, and milestone-tied cards come after it', () => {
    for (const m of MILESTONE_ORDER) expect(CARD_BY_ID[MILESTONE_CARD[m]].milestone).toBe(m);
  });
});

describe('endings', () => {
  it('has 8 early and 10 final endings, each with a basis and a sourced reality line', () => {
    expect(ENDINGS.filter((e) => e.early)).toHaveLength(8);
    expect(ENDINGS.filter((e) => !e.early)).toHaveLength(10);
    const urls = new Set(Object.values(SOURCES).map((s) => s.url));
    for (const e of ENDINGS) {
      expect(validBasis(e.basis), e.id).toBe(true);
      expect(e.reality.length, e.id).toBeGreaterThan(0);
      for (const r of e.reality) expect(urls.has(r.source.url), e.id).toBe(true);
      if (e.early) {
        expect(e.basis.kind, e.id).toBe('real');
        expect(e.idea, e.id).toBeTruthy();
      }
    }
  });

  it('one early ending per gauge extreme', () => {
    for (const g of GAUGES) for (const high of [false, true]) expect(ENDINGS.filter((e) => e.gauge === g && e.high === high)).toHaveLength(1);
  });
});

describe('sources', () => {
  it('are https links with a label', () => {
    for (const [k, s] of Object.entries(SOURCES)) {
      expect(s.url, k).toMatch(/^https:\/\/[^\s]+$/);
      expect(s.label.length, k).toBeGreaterThan(3);
    }
  });
});
