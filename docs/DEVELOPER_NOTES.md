# Developer notes

The exact rules and numbers of *Takeoff: Reign Version*, and every tuning change with its reason. Intent lives in `docs/SPEC.md`; what the content rests on lives in `docs/SCENARIO_BASIS.md`. Every number below comes from `src/data/tuning.ts`.

## State

| Value | Range | Start | Visible? |
| --- | --- | --- | --- |
| Labs, Citizens, Allies, Oversight | 0–100 | 50 | Yes, as a fill and a number |
| Cooperation (US–China) | 0–100 | 45 | No (Year in review in words; revealed at the end) |
| Safety (true alignment of the leading AI) | 0–100 | 60 | No (hinted by characters; revealed at the end) |
| Europe's AI | 0–100, Open at 50+ | 42 (Dependent) | No (Year in review in words; revealed at the end) |
| Steadiness | 100 − 2 × mean distance of the four gauges from 50 | 100 | No (revealed at the end) |
| AI progress | 0–100 | 0 | Yes, as a bar |
| Takeoff speed | multiplier drawn once | slow 30% (0.55–0.85), steady 40% (0.95–1.35), fast 30% (1.5–2.3) | No (revealed at the end, in words) |

## A card

1. The card is drawn: forced cards first (tutorial, milestone news, Year in review, finale), then a due follow-up, then a weighted draw (weight 10 by default, Léa 25–30) among the eligible deck cards not yet seen this run, never the same speaker twice in a row (news excepted).
2. The answer's effects apply; gauges and hidden tracks clamp to 0–100.
3. Unless the card is a tutorial, Year in review or finale card, time moves: **0.75 month per card** (about three weeks), Safety drifts **−0.05**, Cooperation **−0.12**, and AI progress gains `1.45 × takeoff × max(0.65, 1 + 0.35 × (50 − Cooperation) / 50)`.
4. A gauge at 0 or 100 ends the term (first gauge in the order Labs, Citizens, Allies, Oversight).
5. Milestones whose threshold AI progress has crossed fire, in AI 2027's order, each forcing its news card. At each new year a Year in review comes first.
6. At AI progress 100 the finale starts: the tipping-point card, then the US envoy, the Chinese delegate and The AI (each moves hidden tracks by 10–15), then Léa, then the ending. A gauge at 0 or 100 during the finale still ends the term early.
7. After card 64 (December 2030) without a tipping point, the run ends on a plateau.

**Milestone thresholds (AI progress):** China wakes 4 · AI takes jobs 10 · Agent-2 18 · theft 27 · superhuman coder 36 · alignment doubts 45 · self-improving AI 54 (The AI starts speaking) · cheap remote worker 63 · geopolitics 72 · Agent-4 81 · the leak 90 · tipping point 100.

**Preview marks:** a change of 10 or more shows as a large dot ("a lot"), below 10 as a small dot ("a little"). Hidden tracks never show.

## Endings

**Early:** Labs 0 Exodus, 100 Capture · Citizens 0 Apathy, 100 Patchwork · Allies 0 Isolated, 100 Absorbed · Oversight 0 Blindsided, 100 Overreach.

**Final:** the world comes from Cooperation after the finale (Pause 60+, Race 30–59, Rupture below 30) or, with no tipping point, from Europe's AI (Plateau open or Plateau big labs). The good ending needs both thresholds:

| World | Deciding value | Safety net | Good | Bad |
| --- | --- | --- | --- | --- |
| Pause | Safety 65+ | Steadiness 60+ | Licensed utopia | Unstable pause |
| Race | Safety 70+ | Steadiness 65+ | The cognitive revolution | Loss of control |
| Rupture | Steadiness 85+ | Safety 45+ | Multipolar world | Hot war |
| Plateau, open | Steadiness 65+ | Safety 30+ | A bright winter | Decentralised mayhem |
| Plateau, big labs | Steadiness 65+ | Safety 30+ | The agent economy | Silicon blackmail |

**What decided it:** the three answers with the highest impact. Early endings: the answers that pushed the fatal gauge toward its edge. Final endings: 2 × |Safety| + 2 × |Cooperation| + 1.5 × |Europe| + 0.5 × the gauge changes.

## Content conventions

- **Right goes along, left refuses.** On requests the right answer usually raises the requester's gauge (US envoy and Chinese delegate: Allies; OpenBrain's CEO and the NimbusAI founder: Labs; the researcher, security chief and partner minister: Oversight; the union leader and journalist: Citizens) and the left answer lowers it. On news, the right answer is the active reaction (speak up, demand, fund). This is what makes one-sided play fail fast.
- **Every answer costs something:** each side of a two-answer card lowers at least one gauge or hidden track (`tests/content.test.ts`). Requests move 1 to 3 gauges, by 2 to 20 points.
- **Single-button cards** (Year in review, tipping point, some Léa cards) change nothing and are exempt.
- **Goals unlock cards** through `when.goal`; the first-run deck has 117 cards, the full deck 132.

## Simulation

`npm run sim` plays 2000 seeded runs per strategy (seeds 1–2000, no tutorial, first-run deck; `npm run sim -- 2000 all` with every goal unlocked). Strategies (`scripts/strategies.ts`): always left, always right, random, **balancer** (minimises the squared distance of the four gauges from 50, steeply penalising the edges; ignores hidden tracks) and **thoughtful** (the balancer, minus 60 × (2 × ΔSafety + ΔCooperation)). The skilled strategies read true effects: they stand for a player who has learned the game over many runs.

### Results (2000 runs per strategy, first-run deck)

| Strategy | Dies within 20 cards | Survives to the end | Median run | Tipping point | Good ending |
| --- | --- | --- | --- | --- | --- |
| Always left | 99.0% | 0% | 13 | 0% | 0% |
| Always right | 93.2% | 0% | 13 | 0% | 0% |
| Random | 36.1% | 11.3% | 25 | 12.9% | 0.4% |
| Balancer | 0% | 100% | 52 | 69.2% | 36.0% |
| Thoughtful | 0% | 100% | 62 | 54.0% | 70.2% |

Every ending reaches at least 1% for some strategy (rarest: Licensed utopia 27.4% for thoughtful; The cognitive revolution 1.7% thoughtful; Multipolar world 8.9% balancer; Absorbed 2.0% always right; Capture 1.3% always right and random). For every character, both answers appear in good-ending runs. Tipping point year: 2028 23%, 2029 36%, 2030 40%. With every goal unlocked: always left 97.8%, always right 91.0%, random 10.8% / median 25, balancer 100% / 35.9% good, thoughtful 74.7% good.

## Tuning changes

| # | Change | Old → new | Why | Effect (2000 runs unless noted) |
| --- | --- | --- | --- | --- |
| 1 | First balance pass on request effects: right raises the requester's gauge, left lowers it; costs on other gauges kept at 3–6 | mixed directions, costs up to 8 | Always-left and always-right survived far too long (59.7% and 19% died within 20 cards, 1000 runs) | Always left 87%, always right 34% |
| 2 | Requester's gauge scaled ×1.25 on the right answer and ×1.15 on the left (cap 20) | e.g. 10–12 → 12–15 | One-sided play still drifted too slowly | Always left 96%, always right 62%; random median 28 → 25 |
| 3 | News reactions ordered like requests: the active reaction (speak up, demand, fund) on the right | 15 news and follow-up cards swapped sides | News cards diluted the yes-drift | Always right 94%; random unchanged |
| 4 | Refusing a risky shortcut protects Safety (+2 to +3 on 12 left answers); finale swings on Safety 12 / 15 → 10 / 12 | — | Safety collapsed for anyone not chasing it (balancer median 8) | Balancer Safety median 8 → 25 |
| 5 | Safety start 50 → 60; Safety drift −0.3 → −0.05 per card; Cooperation drift −0.15 → −0.12 | see left | Balancer good ending was 0–5%, thoughtful 30% | Balancer 36%, thoughtful 70% |
| 6 | Ending thresholds (offline grid search over the final states, which do not change play) | Pause 60/55 → 65/60; Race 70/60 → 70/65; Rupture 75/60 → 85/45; Plateau 60/40 → 65/30 | Put balancer near 35% and thoughtful near 67% with every ending ≥ 1% | All targets met |
| 7 | Small content fixes (one label shortened, one cost added) | — | Content tests | No measurable change |
