import { describe, expect, it } from 'vitest';
import { CARD_BY_ID, FINALE_IDS, MILESTONE_CARD, TUTORIAL_IDS } from '../src/data/cards';
import { completedGoals, activeGoals, GOALS } from '../src/data/goals';
import { MILESTONE_ORDER } from '../src/data/milestones';
import { TUNING } from '../src/data/tuning';
import { answer, answerOf, cardOf, eligible, marks, newGame, readLearn, result, view } from '../src/engine';
import { dateLabel, finalEnding, steadiness, worldOf } from '../src/engine/rules';
import type { Side } from '../src/engine/types';
import { balancer, playRun, randomStrategy, thoughtful } from '../scripts/strategies';


describe('newGame', () => {
  it('starts at 50 on every gauge, January 2027, and is reproducible from its seed', () => {
    const a = newGame({ seed: 42 });
    const b = newGame({ seed: 42 });
    expect(a).toEqual(b);
    expect(a.gauges).toEqual({ labs: 50, citizens: 50, allies: 50, oversight: 50 });
    expect(dateLabel(a.month)).toBe('January 2027');
    expect(a.takeoff).toBeGreaterThan(0);
  });

  it('a first run starts with the three tutorial cards', () => {
    let s = newGame({ seed: 3, tutorial: true });
    const seen: string[] = [];
    for (let i = 0; i < 3; i++) {
      seen.push(s.current);
      s = answer(s, 'right');
    }
    expect(seen).toEqual(TUTORIAL_IDS);
    expect(s.turn).toBe(0); // the tutorial does not move time
  });
});

describe('answer', () => {
  it('never mutates its input', () => {
    const s = newGame({ seed: 7 });
    const copy = structuredClone(s);
    answer(s, 'left');
    answer(s, 'right');
    expect(s).toEqual(copy);
  });

  it('applies the answer, moves time three weeks and records it', () => {
    const s = newGame({ seed: 11 });
    const card = cardOf(s);
    const a = answerOf(card, 'right');
    const t = answer(s, 'right');
    for (const g of ['labs', 'citizens', 'allies', 'oversight'] as const) expect(t.gauges[g]).toBe(Math.max(0, Math.min(100, 50 + (a.effects[g] ?? 0))));
    expect(t.turn).toBe(1);
    expect(t.month).toBe(TUNING.time.monthsPerCard);
    expect(t.history[0]).toMatchObject({ cardId: card.id, side: 'right', label: a.label });
    expect(t.progress).toBeGreaterThan(0);
  });

  it('a gauge at 0 or 100 ends the run with that gauge’s early ending', () => {
    let s = newGame({ seed: 5 });
    s = { ...s, gauges: { ...s.gauges, labs: 1 } };
    // find a card whose some side lowers labs
    let guard = 0;
    while (s.phase !== 'over' && guard++ < 200) {
      const c = cardOf(s);
      const side: Side = (answerOf(c, 'left').effects.labs ?? 0) < 0 ? 'left' : c.right && (answerOf(c, 'right').effects.labs ?? 0) < 0 ? 'right' : 'left';
      s = answer(s, side);
      if (s.phase !== 'over') s = { ...s, gauges: { ...s.gauges, labs: Math.min(s.gauges.labs, 1), citizens: 50, allies: 50, oversight: 50 } };
    }
    expect(s.phase).toBe('over');
    expect(s.ending).toBe('exodus');
    expect(result(s).early).toBe(true);
  });

  it('fires milestones in AI 2027’s order, each announced by its news card', () => {
    for (let seed = 1; seed <= 30; seed++) {
      const r = playRun(balancer, seed);
      const ms = r.final.milestones;
      expect(ms).toEqual(MILESTONE_ORDER.slice(0, ms.length));
      const order = r.final.history.map((h) => h.cardId).filter((id) => Object.values(MILESTONE_CARD).includes(id));
      expect(order).toEqual(ms.map((m) => MILESTONE_CARD[m]));
    }
  });

  it('a card tied to a milestone only appears after it', () => {
    for (let seed = 1; seed <= 40; seed++) {
      const r = playRun(randomStrategy, seed);
      const reached: string[] = [];
      for (const h of r.final.history) {
        const c = CARD_BY_ID[h.cardId];
        if (c.milestone) reached.push(c.milestone);
        if (c.when?.after) expect(reached, `${c.id} before ${c.when.after}`).toContain(c.when.after);
      }
    }
  });

  it('the tipping point runs the finale in order, then ends', () => {
    let found = 0;
    for (let seed = 1; seed <= 60 && found < 5; seed++) {
      const r = playRun(balancer, seed);
      if (r.final.tippedAt === undefined || r.result.early) continue;
      found++;
      const ids = r.final.history.map((h) => h.cardId);
      const i = ids.indexOf('tipping');
      expect(ids.slice(i)).toEqual(FINALE_IDS);
      expect(r.result.world).toMatch(/pause|race|rupture/);
    }
    expect(found).toBeGreaterThan(0);
  });

  it('without a tipping point the run ends after December 2030 on a plateau', () => {
    let found = 0;
    for (let seed = 1; seed <= 80 && found < 3; seed++) {
      const r = playRun(thoughtful, seed);
      if (r.final.tippedAt !== undefined) continue;
      found++;
      expect(r.final.turn).toBe(TUNING.time.lastTurn);
      expect(dateLabel((r.final.turn - 1) * TUNING.time.monthsPerCard)).toBe('December 2030');
      expect(r.result.world).toMatch(/plateau/);
    }
    expect(found).toBeGreaterThan(0);
  });

  it('shows a Year in review at each new year, with one button and no numbers', () => {
    const r = playRun(balancer, 2);
    const reviews = r.final.history.filter((h) => h.cardId.startsWith('review_'));
    expect(reviews.length).toBeGreaterThanOrEqual(1);
    for (const h of reviews) expect(CARD_BY_ID[h.cardId].right).toBeUndefined();
    let s = newGame({ seed: 2 });
    while (s.phase !== 'over' && !s.current.startsWith('review_')) s = answer(s, balancer.choose(s, () => 0.5));
    if (s.current.startsWith('review_')) expect(view(s).text).not.toMatch(/\b\d{1,3}\b/);
  });

  it('follow-ups come back after the answer that caused them', () => {
    let hits = 0;
    for (let seed = 1; seed <= 200 && hits < 3; seed++) {
      const r = playRun(randomStrategy, seed);
      const ids = r.final.history.map((h) => h.cardId);
      const i = ids.indexOf('fu_audit_leak');
      if (i < 0) continue;
      hits++;
      const cause = r.final.history.findIndex((h) => h.cardId === 'ceo_skip_audit' && h.side === 'right');
      expect(cause).toBeGreaterThanOrEqual(0);
      expect(cause).toBeLessThan(i);
    }
    expect(hits).toBeGreaterThan(0);
  });

  it('goal-locked cards never appear before their goal is completed', () => {
    for (let seed = 1; seed <= 30; seed++) {
      const r = playRun(randomStrategy, seed);
      for (const h of r.final.history) expect(CARD_BY_ID[h.cardId].when?.goal, h.cardId).toBeUndefined();
    }
  });
});

describe('preview and view', () => {
  it('marks say which gauges move and roughly how much, never the direction', () => {
    const m = marks({ label: 'x', effects: { labs: 12, citizens: -4, safety: -20 } });
    expect(m).toEqual([
      { gauge: 'labs', size: 'large' },
      { gauge: 'citizens', size: 'small' },
    ]);
    expect(JSON.stringify(m)).not.toMatch(/-|\d/);
  });

  it('the view never exposes hidden effects', () => {
    const v = view(newGame({ seed: 9 }));
    expect(JSON.stringify([v.left, v.right])).not.toMatch(/safety|coop|europe|progress/);
    expect(Object.keys(v.left)).toEqual(['label', 'marks']);
  });
});

describe('rules', () => {
  it('steadiness is 100 at the centre and falls toward the edges', () => {
    expect(steadiness({ labs: 50, citizens: 50, allies: 50, oversight: 50 })).toBe(100);
    expect(steadiness({ labs: 0, citizens: 100, allies: 0, oversight: 100 })).toBe(0);
    expect(steadiness({ labs: 60, citizens: 40, allies: 50, oversight: 50 })).toBe(90);
  });

  it('the world comes from Cooperation at the tipping point, or Europe’s AI on a plateau', () => {
    const base = newGame({ seed: 1 });
    const at = (coop: number, europe: number, tipped?: number) => worldOf({ hidden: { ...base.hidden, coop, europe }, tippedAt: tipped });
    expect(at(70, 0, 30)).toBe('pause');
    expect(at(45, 0, 30)).toBe('race');
    expect(at(10, 0, 30)).toBe('rupture');
    expect(at(10, 60)).toBe('plateau_open');
    expect(at(90, 10)).toBe('plateau_dependent');
  });

  it('the good ending needs both the deciding value and the safety net', () => {
    const base = newGame({ seed: 1 });
    const g = { labs: 50, citizens: 50, allies: 50, oversight: 50 };
    const E = TUNING.endings;
    expect(finalEnding({ hidden: { coop: 80, safety: E.pause.safety, europe: 0 }, tippedAt: 20, gauges: g }).id).toBe('licensed_utopia');
    expect(finalEnding({ hidden: { coop: 80, safety: E.pause.safety - 1, europe: 0 }, tippedAt: 20, gauges: g }).id).toBe('unstable_pause');
    expect(finalEnding({ hidden: { coop: 80, safety: 99, europe: 0 }, tippedAt: 20, gauges: { ...g, labs: 95, citizens: 5 } }).id).toBe('unstable_pause');
    void base;
  });
});

describe('result and goals', () => {
  it('lists the two or three answers that decided it, in order, with dates', () => {
    const r = playRun(balancer, 4);
    expect(r.result.decisive.length).toBeGreaterThanOrEqual(2);
    expect(r.result.decisive.length).toBeLessThanOrEqual(3);
    const months = r.result.decisive.map((d) => d.month);
    expect([...months].sort((a, b) => a - b)).toEqual(months);
  });

  it('completes goals and shows the next three', () => {
    const r = playRun(balancer, 4);
    const s = readLearn(readLearn(readLearn(r.final)));
    const done = completedGoals(s, r.result, { runs: 1, endings: [r.result.id] }, []);
    expect(done).toContain('survive_2028');
    expect(done).toContain('learn3');
    expect(activeGoals([])).toHaveLength(3);
    expect(activeGoals(GOALS.map((g) => g.id))).toHaveLength(0);
  });

  it('goal-locked cards become eligible once unlocked', () => {
    const s = newGame({ seed: 1, unlocked: ['archive6'] });
    expect(eligible(s, CARD_BY_ID.cn_nuclear.when)).toBe(true);
    expect(eligible(newGame({ seed: 1 }), CARD_BY_ID.cn_nuclear.when)).toBe(false);
  });
});
