// Seeded simulation: thousands of runs per strategy, checked against the targets of docs/SPEC.md
// ("Simulation targets"). Output is deterministic for a given N.
// Run: npm run sim            (or: npm run sim -- 5000, and `-- 2000 all` to play with every goal unlocked)

import { CARD_BY_ID } from '../src/data/cards';
import { CHARACTERS } from '../src/data/characters';
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

console.log(`Takeoff: Reign Version — ${N} seeded runs per strategy${ALL ? ' (every goal unlocked)' : ' (first-run deck)'}`);
for (const strat of STRATEGIES) {
  const rs: PlayedRun[] = [];
  for (let seed = 1; seed <= N; seed++) rs.push(playRun(strat, seed, unlocked));
  runs.set(strat.name, rs);
  const early = rs.filter((r) => r.result.early);
  const survived = rs.filter((r) => !r.result.early);
  const tipped = rs.filter((r) => r.result.tipped);
  const good = rs.filter((r) => r.result.good);
  const within20 = rs.filter((r) => r.result.early && r.final.turn <= 20);
  console.log(`\n=== ${strat.name} ===`);
  console.log(
    `died within 20 cards ${pct(within20.length)} · survived to the end ${pct(survived.length)} · median run ${median(rs.map((r) => r.final.turn))} cards · tipping point ${pct(tipped.length)} · good ending ${pct(good.length)}`,
  );
  if (survived.length) {
    const st = survived.map((r) => r.result.steadiness);
    const sf = survived.map((r) => r.result.safety);
    const co = survived.map((r) => r.result.coop);
    console.log(`  survivors: steadiness median ${median(st)}, safety median ${median(sf)}, cooperation median ${median(co)}, Europe open ${pct(survived.filter((r) => r.result.europeOpen).length, survived.length)}`);
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
  void early;
}

console.log('\n=== Targets ===');
const g = (name: string) => runs.get(name)!;
const rate = (name: string, f: (r: PlayedRun) => boolean) => g(name).filter(f).length / N;
check(rate('always left', (r) => r.result.early && r.final.turn <= 20) > 0.9, `always left dies within 20 cards in > 90% (${pct(rate('always left', (r) => r.result.early && r.final.turn <= 20) * N)})`);
check(rate('always right', (r) => r.result.early && r.final.turn <= 20) > 0.9, `always right dies within 20 cards in > 90% (${pct(rate('always right', (r) => r.result.early && r.final.turn <= 20) * N)})`);
const randSurv = rate('random', (r) => !r.result.early);
const randMed = median(g('random').map((r) => r.final.turn));
check(randSurv < 0.2, `random survives to the end in < 20% (${pct(randSurv * N)})`);
check(randMed >= 20 && randMed <= 30, `random median run 20–30 cards (${randMed})`);
const balSurv = rate('balancer', (r) => !r.result.early);
const balGood = rate('balancer', (r) => r.result.good === true);
check(balSurv > 0.6, `balancer survives in > 60% (${pct(balSurv * N)})`);
check(balGood >= 0.25 && balGood <= 0.45, `balancer good ending 25–45% (${pct(balGood * N)})`);
const thGood = rate('thoughtful', (r) => r.result.good === true);
check(thGood >= 0.55 && thGood <= 0.8, `thoughtful good ending 55–80% (${pct(thGood * N)})`);
const rare = ENDINGS.filter((e) => (best.get(e.id) ?? 0) < 0.01);
check(!rare.length, `every ending ≥ 1% for some strategy${rare.length ? ` (below: ${rare.map((e) => `${e.title} ${pct((best.get(e.id) ?? 0) * N)}`).join(', ')})` : ''}`);

// For every character, both of their usual answers appear in winning runs.
const winning = [...runs.values()].flat().filter((r) => r.result.good);
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
check(!oneSided.length, `every character’s left and right answers both appear in good-ending runs${oneSided.length ? ` (not: ${oneSided.join(', ')})` : ''}`);

// Tipping point timing
const tips = [...runs.values()].flat().filter((r) => r.final.tippedAt !== undefined);
const byYear = new Map<number, number>();
for (const r of tips) {
  const y = 2027 + Math.floor(((r.final.tippedAt! - 1) * TUNING.time.monthsPerCard) / 12);
  byYear.set(y, (byYear.get(y) ?? 0) + 1);
}
console.log(`\ntipping point year (all strategies): ${[...byYear].sort((a, b) => a[0] - b[0]).map(([y, k]) => `${y} ${pct(k, tips.length)}`).join(' · ')}`);
console.log(failures.length ? `\n${failures.length} target(s) missed.` : '\nAll targets met.');
