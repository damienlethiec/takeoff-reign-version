import { describe, expect, it } from 'vitest';
import { alwaysLeft, alwaysRight, balancer, playRun, randomStrategy, thoughtful, type Strategy } from '../scripts/strategies';

// Guardrails on the balance (the full check is `npm run sim`, 2000 runs per strategy). Looser bounds, 300 runs.
const N = 300;
const runs = (s: Strategy) => Array.from({ length: N }, (_, i) => playRun(s, i + 1));
const share = (rs: ReturnType<typeof runs>, f: (r: ReturnType<typeof playRun>) => boolean) => rs.filter(f).length / rs.length;

// TODO(rework): restore once the world model is rebalanced (phase 2), with the new targets of docs/SPEC.md.
describe.skip('balance guardrails', { timeout: 30_000 }, () => {
  it('one-sided play loses the mandate fast', () => {
    for (const s of [alwaysLeft, alwaysRight]) expect(share(runs(s), (r) => r.result.early && r.final.turn <= 20), s.name).toBeGreaterThan(0.85);
  });
  it('random play rarely survives', () => {
    expect(share(runs(randomStrategy), (r) => !r.result.early)).toBeLessThan(0.25);
  });
  it('balancing survives; caring about the hidden tracks ends better', () => {
    const b = runs(balancer);
    const t = runs(thoughtful);
    expect(share(b, (r) => !r.result.early)).toBeGreaterThan(0.6);
    expect(share(b, (r) => r.result.good === true)).toBeGreaterThan(0.2);
    expect(share(b, (r) => r.result.good === true)).toBeLessThan(0.5);
    expect(share(t, (r) => r.result.good === true)).toBeGreaterThan(0.5);
  });
});
