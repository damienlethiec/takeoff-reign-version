# Developer notes

The exact rules and numbers of *Takeoff: Reign Version*, and every tuning change with its reason. Intent lives in `docs/SPEC.md`; what the content rests on lives in `docs/SCENARIO_BASIS.md`. Every number below comes from `src/data/tuning.ts`.

Since 26 October 2026 the game uses the world model of *Middle Power* v3 (same gauges, start values, zones and ending thresholds). The first version (four career gauges Labs / Citizens / Allies / Oversight, eight early endings at 0 or 100, hidden Cooperation / Safety / Steadiness) is in git history before commit `3ed01b4`; its tuning table is kept at the end of this file.

## State

| Value | Range | Start | Visible? |
| --- | --- | --- | --- |
| AI power | 0–100, tipping point at 80 | 18 | Yes, a bar with a tick at 80 |
| Cooperation | 0–100; zones Pause 60+, Race 30–59, Rupture < 30 | 52 | Yes, a bar over the three zones |
| Confidence (estimate) | 0–100 | 55 | Yes, as "55 ±15" with a band |
| Margin | 3–30 | 15 | Yes (the ±) |
| True Confidence | 0–100, always within estimate ± margin | 52 | No (hinted in words; revealed at the end) |
| Cohesion | 0–100 | 66 | Yes |
| Europe's AI | 0–100 lean, Open at 50+ | 42 (Dependent) | The badge only (Open / Dependent) |
| Takeoff speed | multiplier drawn once | slow 30% (0.55–0.85), steady 40% (0.95–1.35), fast 30% (1.5–2.3) | No (hinted in words; revealed at the end) |

**Keeping Confidence consistent** (`settleConfidence`, after every change): the margin is clamped to 3–30, then the estimate is clamped into truth ± margin. So the truth never leaves the band: when the truth falls far, it drags the estimate down with it.

## A card

1. The card is drawn: forced cards first (tutorial, milestone news, Year in review, finale), then a due follow-up, then a weighted draw (weight 10 by default, Léa 25–30) among the eligible deck cards not yet seen this game, never the same speaker twice in a row (news excepted).
2. The answer's effects apply (`aiPower`, `cooperation`, `confidence` = the estimate, `margin`, `truth`, `cohesion`, `europe`), values clamp to 0–100, Confidence settles.
3. Unless the card is a tutorial, Year in review or finale card, time moves **0.75 month** (about three weeks) and the drifts apply: Cooperation **−0.2** per card (**−0.15** more once AI power ≥ 60); Cohesion **−0.15** once AI power ≥ 60 and **−0.15** in the Rupture zone; the true Confidence **−0.15** once AI power ≥ 60; the estimate **+0.3** (the labs' reports); AI power gains `0.9 × takeoff × max(0.65, 1 + 0.35 × (50 − Cooperation) / 50)`.
4. Cooperation, Confidence (estimate) or Cohesion at 0 ends the game early (checked in that order): Open conflict, Runaway incident, Breakdown.
5. Milestones whose threshold AI power has crossed fire, in AI 2027's order, each forcing its news card. At each new year a Year in review comes first.
6. At AI power 80 (all milestones fired) the finale starts: the tipping-point card, then the US envoy, the Chinese delegate and The AI, then Léa, then the ending. A pillar at 0 during the finale still ends the game early.
7. After card 64 (December 2030) without a tipping point, the game ends on a plateau.

**Milestone thresholds (AI power):** China wakes 21 · AI takes jobs 24 · Agent-2 29 · theft 35 · superhuman coder 40 · alignment doubts 46 · self-improving AI 51 (The AI starts speaking) · cheap remote worker 57 · geopolitics 63 · Agent-4 68 · the leak 74 · tipping point 80.

**Preview marks:** a visible gauge moved by 8 or more shows a large dot ("a lot"), below 8 a small one ("a little"). Confidence gets a mark when its estimate or its margin moves. The true Confidence and Europe's AI lean never show.

**Two incident news cards** enter the deck only while the true Confidence is low (`nw_self_copy` ≤ 42 after Agent-2, `nw_agent_fraud` ≤ 38 after the cheap remote worker): a careless world sees its AI misbehave in public, and the estimate falls.

## Endings

**Early:** Cooperation 0 → Open conflict · Confidence estimate 0 → Runaway incident · Cohesion 0 → Breakdown. Nothing ends at 100.

**Final (v3 tree, v3 thresholds):** the world comes from the Cooperation zone at the end of the finale, or, with no tipping point, from Europe's AI. Confidence means the **true** value.

| World | Deciding gauge | Safety net | Good | Bad |
| --- | --- | --- | --- | --- |
| Pause (60+) | Confidence 65+ | Cohesion 45+ | Licensed utopia | Unstable pause |
| Race (30–59) | Confidence 75+ | Cohesion 55+ | The cognitive revolution | Loss of control |
| Rupture (< 30) | Cohesion 82+ | Confidence 65+ | Multipolar world | Hot war |
| Plateau, Open | Cohesion 60+ | Confidence 40+ | A bright winter | Decentralised mayhem |
| Plateau, Dependent | Cohesion 60+ | Confidence 40+ | The agent economy | Silicon blackmail |

**Why it ended** (`whySentence`): one sentence from the deciding gauge or the safety net, as in v3.

**What decided it:** the three answers with the highest impact. Early endings: the answers that pushed the fallen pillar down (for Confidence, also those that lowered the truth). Final endings: 2 × the deciding gauge + 1.5 × the safety net + 1.5 × Cooperation after a tipping point, or + 2 × Europe's AI on a plateau. At most one finale answer.

## Content conventions

- **Right goes along, left refuses.** On news, the active reaction is on the right.
- **Directions** (realism): siding with Washington or pressure on Beijing lowers Cooperation; talks, hotlines and summits raise it, often at a small Cohesion cost (seen as soft) or trade friction. Audits, testing, readable reasoning and interpretability narrow the margin and raise the truth, and often lower the estimate (they find problems). Shortcuts (waived audits, unwatched AI, dropped safety chapters) raise the estimate, widen the margin and lower the truth. Open models move Europe's AI toward Open and cost truth or misuse. Social measures raise Cohesion at a cost to Europe's AI industry; spending costs Cohesion (money diverted), as in v3. Racing, theft and compute deals raise AI power; pauses and checks slow it.
- **Every answer costs something:** each side of a two-answer card lowers Cooperation, the estimate, the truth, Cohesion or Europe's AI, widens the margin, or raises AI power (`tests/content.test.ts`). Answers move 1 to 4 values by at most 15.
- **Single-button cards** (Year in review, tipping point, some Léa cards, the final Léa card) change nothing and are exempt.
- **Goals unlock cards** through `when.goal`.

## Simulation

`npm run sim` plays 2000 seeded games per strategy (seeds 1–2000, no tutorial, first-game deck; `npm run sim -- 2000 all` with every goal unlocked). Strategies (`scripts/strategies.ts`): always left, always right, random, **balancer** (reads only the visible gauges: keeps Cooperation, the low end of Confidence and Cohesion high, AI power slow) and **thoughtful** (reads the true effects: favours the true Confidence, Cooperation and Cohesion, never lets the estimate reach 0). The skilled strategies stand for a player who has learned the game over many games.

### Results

To be filled by the rebalancing (step 3).

## Tuning changes

| # | Change | Old → new | Why | Effect (2000 games unless noted) |
| --- | --- | --- | --- | --- |
| R0 | Rework onto the v3 world model; every card remapped by hand; first-guess sizes (main effect 5–10, costs 2–6) | Envoy model (table below) | Playtest: the game must be about the world, with v3's gauges | 500 games, before any tuning: always left 0% good, always right 25%, random 1% good / 15% early, balancer 92%, thoughtful 100%; Runaway incident 0% |

### Envoy model (retired 26 October 2026)

| # | Change | Old → new | Why | Effect |
| --- | --- | --- | --- | --- |
| 1 | Right raises the requester's gauge, left lowers it | mixed directions | One-sided play survived too long | Always left 87%, always right 34% dead within 20 cards |
| 2 | Requester's gauge ×1.25 right, ×1.15 left | e.g. 10–12 → 12–15 | Still too slow | 96% / 62% |
| 3 | News: active reaction on the right | — | Diluted drift | Always right 94% |
| 4 | Refusing shortcuts protects Safety; finale swings 10 / 12 | — | Safety collapsed | Balancer Safety median 8 → 25 |
| 5 | Safety start 60, drifts −0.05 / −0.12 | 50, −0.3 / −0.15 | Too few good endings | Balancer 36%, thoughtful 70% |
| 6 | Ending thresholds (grid search) | see the old spec | Targets | All met |
| 7 | Small content fixes | — | Content tests | — |
