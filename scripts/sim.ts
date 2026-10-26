// Seeded simulation: thousands of games per strategy, checked against the targets of docs/SPEC.md
// ("Simulation targets"). Output is deterministic for a given N.
// Run: npm run sim            (or: npm run sim -- 5000, and `-- 2000 all` to play with every goal unlocked)

import { CARD_BY_ID } from '../src/data/cards';
import { CHARACTERS } from '../src/data/characters';
import { MILESTONE_ORDER } from '../src/data/milestones';
import { ENDINGS } from '../src/data/endings';
import { GOALS } from '../src/data/goals';
import { TUNING } from '../src/data/tuning';
import type { CharacterId, EndingId } from '../src/engine/types';
import { STRATEGIES, playRun, type PlayedRun } from './strategies';

const N = Number(process.argv[2]) || 2000;
const ALL = process.argv[3] === 'all';
const unlocked = ALL ? GOALS.map((g) => g.id) : [];
const pct = (x: number, n = N) => `${((100 * x) / Math.max(1, n)).toFixed(1)}%`;
const median = (xs: number[]) => {
  const a = [...xs].sort((p, q) => p - q);
  return a.length ? a[Math.floor(a.length / 2)] : 0;
};

const best = new Map<EndingId, number>();
const runs = new Map<string, PlayedRun[]>();
const failures: string[] = [];
const check = (ok: boolean, msg: string) => {
  console.log(`  ${ok ? 'ok  ' : 'MISS'} ${msg}`);
  if (!ok) failures.push(msg);
};

console.log(`Takeoff: Reign Version — ${N} seeded games per strategy${ALL ? ' (every goal unlocked)' : ' (first-game deck)'}`);
for (const strat of STRATEGIES) {
  const rs: PlayedRun[] = [];
  for (let seed = 1; seed <= N; seed++) rs.push(playRun(strat, seed, unlocked));
  runs.set(strat.name, rs);
  const early = rs.filter((r) => r.result.early);
  const survived = rs.filter((r) => !r.result.early);
  const tipped = rs.filter((r) => r.result.tipped);
  const good = rs.filter((r) => r.result.good);
  console.log(`\n=== ${strat.name} ===`);
  console.log(
    `early collapse ${pct(early.length)} · median game ${median(rs.map((r) => r.final.turn))} cards · tipping point ${pct(tipped.length)} · good ending ${pct(good.length)}`,
  );
  if (survived.length) {
    const m = (f: (r: PlayedRun) => number) => median(survived.map(f));
    console.log(
      `  survivors (median): true Confidence ${m((r) => r.result.truth)} (seen ${m((r) => r.result.confidence)} ±${m((r) => r.result.margin)}), Cooperation ${m((r) => r.result.cooperation)}, Cohesion ${m((r) => r.result.cohesion)}, Europe open ${pct(survived.filter((r) => r.result.europeOpen).length, survived.length)}`,
    );
  }
  const line = (ids: EndingId[]) =>
    ids
      .map((id) => {
        const k = rs.filter((r) => r.result.id === id).length;
        best.set(id, Math.max(best.get(id) ?? 0, k / N));
        return `${ENDINGS.find((e) => e.id === id)!.title} ${pct(k)}`;
      })
      .join(' · ');
  console.log(`  early: ${line(ENDINGS.filter((e) => e.early).map((e) => e.id))}`);
  console.log(`  final: ${line(ENDINGS.filter((e) => !e.early).map((e) => e.id))}`);
}

console.log('\n=== Targets ===');
const g = (name: string) => runs.get(name)!;
const rate = (name: string, f: (r: PlayedRun) => boolean) => g(name).filter(f).length / N;
const good = (r: PlayedRun) => r.result.good === true;
const early = (r: PlayedRun) => r.result.early;
for (const s of ['always left', 'always right']) check(rate(s, good) < 0.1, `${s}: good endings < 10% (${pct(rate(s, good) * N)})`);
check(rate('random', good) >= 0.15 && rate('random', good) <= 0.3, `random: good endings 15–30% (${pct(rate('random', good) * N)})`);
check(rate('random', early) >= 0.3 && rate('random', early) <= 0.6, `random: early collapse 30–60% (${pct(rate('random', early) * N)})`);
for (const s of ['balancer', 'thoughtful']) check(rate(s, good) >= 0.55 && rate(s, good) <= 0.8, `${s}: good endings 55–80% (${pct(rate(s, good) * N)})`);
check(rate('thoughtful', early) < 0.15, `thoughtful: early collapse < 15% (${pct(rate('thoughtful', early) * N)})`);
const rare = ENDINGS.filter((e) => (best.get(e.id) ?? 0) < 0.01);
check(!rare.length, `every one of the ${ENDINGS.length} endings ≥ 1% for some strategy${rare.length ? ` (below: ${rare.map((e) => `${e.title} ${pct((best.get(e.id) ?? 0) * N)}`).join(', ')})` : ''}`);

// For every character, both of their usual answers appear in winning games.
const winning = [...runs.values()].flat().filter(good);
const sides = new Map<CharacterId, Set<string>>();
for (const r of winning)
  for (const h of r.final.history) {
    const c = CARD_BY_ID[h.cardId];
    if (!c.right || !['request', 'followup', 'ai'].includes(c.kind)) continue;
    if (!sides.has(h.who)) sides.set(h.who, new Set());
    sides.get(h.who)!.add(h.side);
  }
const speakers = (Object.keys(CHARACTERS) as CharacterId[]).filter((id) => !['news', 'aide', 'lea'].includes(id));
const oneSided = speakers.filter((id) => (sides.get(id)?.size ?? 0) < 2);
check(!oneSided.length, `every character’s left and right answers both appear in good-ending games${oneSided.length ? ` (not: ${oneSided.join(', ')})` : ''}`);

// The tipping point only comes after every AI 2027 milestone, in order
const all = [...runs.values()].flat();
const tips = all.filter((r) => r.final.tippedAt !== undefined);
check(
  tips.every((r) => r.final.milestones.join() === MILESTONE_ORDER.join()),
  'the tipping point never comes before AI 2027’s milestones, all in order',
);
const byYear = new Map<number, number>();
for (const r of tips) {
  const y = 2027 + Math.floor(((r.final.tippedAt! - 1) * TUNING.time.monthsPerCard) / 12);
  byYear.set(y, (byYear.get(y) ?? 0) + 1);
}
console.log(`\ntipping point year (all strategies): ${[...byYear].sort((a, b) => a[0] - b[0]).map(([y, k]) => `${y} ${pct(k, tips.length)}`).join(' · ')}`);
console.log(failures.length ? `\n${failures.length} target(s) missed.` : '\nAll targets met.');
