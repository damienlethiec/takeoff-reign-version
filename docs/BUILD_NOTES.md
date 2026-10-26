# Build notes

Built overnight on 25–26 October 2026 from `docs/SPEC.md`, then **reworked on 26 October 2026** onto the world model of *Middle Power* v3 after the owner's playtest. Every judgement call is written down here. Infrastructure copied and adapted from `takeoff-middle-power` (read only).

## The rework (26 October 2026)

**Why.** The first version was about the envoy's career: four political forces (Labs, Citizens, Allies, Oversight) and "dying" meant losing the mandate. The owner asked for a game about the future of the world, with the same gauges as v3 and the hybrid, so the three versions tell the same story three ways. The design stays centred on the cards.

**What changed.**
- **Gauges**: AI power 18 (the clock, tipping point 80), Cooperation 52 (zones Pause 60+, Race 30–59, Rupture < 30), Confidence 55 ± 15 (estimate and margin; a true value 52 hidden inside, revealed at the end), Cohesion 66, and the Europe's AI badge (Dependent). Labs, Citizens, Allies, Oversight and Steadiness are gone. Start values, zones and thresholds are v3's (`tom-v3/src/data/tuning.ts`, read on 26 Oct; Rupture's target is 82 there, not 85 as in the v3 spec).
- **Endings**: three early world catastrophes at 0 (Open conflict, Runaway incident, Breakdown), none at 100; the ten final endings follow the v3 tree on the true Confidence and Cohesion. 13 in the Archive.
- **Cards**: the cast, texts and bases are kept. Every answer was remapped by hand onto the new gauges (see "Remapping choices" below). One text rewritten because it only made sense for the envoy's image (`jo_poll`: now "phase OpenBrain's models out of public services?"). Two incident news cards added (`nw_self_copy`, `nw_agent_fraud`), drawn only while the true Confidence is low. The tutorial and the Year in review were rewritten for the new gauges; the Year in review hints in words at the true Confidence (vs the estimate), Europe's AI and the pace.
- **Framing**: "Game #N" instead of "Envoy #N"; goals rewritten around worlds and gauges; the end screen gives the one-sentence reason, the estimate you saw next to the truth, and the four gauges with the world's target and safety net. Saved progress uses a new key (`takeoff-reign-version:v2`), so earlier archives start fresh.
- **Look**: v3's visual charter (night background, deck panels, gauge colours and fonts), the request on a paper card. Same interaction and accessibility as before.
- **Pushed in three steps** at the owner's request: (1) playable rework, (2) tests, a11y harness and docs, (3) rebalancing.

**Remapping choices** (directions follow the scenarios; sizes are tuned by the simulation):
- Answers that moved *Allies* by siding with Washington now lower Cooperation (Beijing sees a bloc); refusing Washington costs Cohesion (trade friction) or Europe's AI (chip access).
- Answers that moved *Oversight* now narrow or widen the Confidence margin, and move the true Confidence when they change what gets fixed. Audits and published findings often lower the estimate: checking finds problems. Shortcuts raise the estimate while the truth falls: the core lesson of the margin.
- Answers that moved *Labs* now move Europe's AI (dependence on OpenBrain, support for NimbusAI), AI power (fast-tracking, compute) and the truth (skipped checks).
- Answers that moved *Citizens* now move Cohesion; social measures cost Europe's AI industry a little, spending costs Cohesion (money diverted, as in v3).
- Old *Safety* effects map onto the true Confidence; old *progress* effects onto AI power.

## Card counts

134 cards (119 in the first-game deck, 15 unlocked by goals):

| Kind | Count |
| --- | --- |
| Requests | 73: 8 each for the US envoy, the Chinese delegate, OpenBrain's CEO, the safety researcher, the union leader, the NimbusAI founder, the security chief and the partner minister; 9 for the journalist |
| Follow-ups | 14 (12 chains triggered by an answer, plus the 2-card journalist chain on the stolen weights) |
| News | 19: 11 milestone news (forced, AI 2027 order), 6 others, 2 incidents (only when the true Confidence is low) |
| The AI | 9 (from "self-improving AI"; two of them chosen by the hidden true Confidence) |
| Léa | 8 (three single-button, two whose text hints at a hidden value) |
| Year in review | 3 (January 2028, 2029, 2030) |
| Tutorial | 3 (first game only) |
| Finale | 5 (tipping point, US envoy, Chinese delegate, The AI, Léa) |

**Basis:** 64 cards rest on AI 2027, 25 on CFG, 45 on a real source. **Learn more:** 105 cards. 44 cards are gated by a milestone.

## Decisions

1. **Effect convention.** On every request, the right answer goes along with the requester, the left answer refuses. On news, the active reaction is on the right.
2. **Europe's AI** is a hidden 0–100 lean behind a visible badge (Open at 50+). Many answers nudge it; the badge flips only past 50, and the flip is announced. Preview marks never show it (like the truth), so the player learns which cards move it from their text.
3. **Confidence preview.** A Confidence mark appears when an answer moves the estimate or the margin. Changes to the true value alone show nothing, by design: that is what "you cannot see the truth" means.
4. **The estimate dies, not the truth.** "Confidence reaching 0" uses the public estimate, as the spec asks. Because the estimate is kept within truth ± margin, a collapsing truth drags it down, and incidents (only drawn when the truth is low) push it down in public.
5. **A pillar at 0 during the finale** still ends the game early (consistent with the rest of the game).
6. **Takeoff speed** is drawn from three bands; AI power's per-card rise is scaled so the old timing holds (tipping point mostly in 2029–2030, some in 2028, none for slow games).
7. **"What decided it"** shows at most one of the finale's three answers.
8. **A tutorial guide.** Noor, your chief of staff (an added fictional character), runs the tutorial and the Year in review.
9. **Names.** The cast keeps its fictional names (Grant Holloway, Wei Lan, Marcus Reed, Dr Amara Okafor, Bruno Ferreira, Sanna Lindqvist, Col. Ines Marchetti, Kenji Mori, Clara Novak). The founder's lab is **NimbusAI**, CFG's fictional EU champion.
10. **Single-button cards** change nothing and are exempt from "every answer costs something".
11. **Screenshots** use fallback fonts: the sandbox cannot reach Google Fonts, so the scripts stub them. Big Shoulders Display is condensed; the fallback is wider, so the phone layout hides the small logo below 440 px to stay within the viewport either way.

## Simulation (final)

To be filled by the rebalancing (step 3); see `docs/DEVELOPER_NOTES.md`.

## Realism notes

For Louis and the fact-check: every place where the game interprets or stretches the scenarios.

**Timeline and structure**
1. AI 2027's milestones fire on the progress meter, not on the scenario's dates. In the game, "China steals Agent-2" can come in 2028 rather than February 2027, and the branch point (October 2027 in the scenario) becomes the tipping point in 2028–2030.
2. AI 2027 barely mentions Europe: only the UK AISI deal covering external deployment, the Five Eyes getting API access without the EU, and European leaders demanding a pause after the leak. Every European request is therefore an interpretation, grounded in CFG (EU-led monitoring, open-weight mandates, the EU hedging toward China) or in real EU instruments (the AI Office, the Code of Practice, InvestAI, OpenEuroLLM).
3. The v3 tree maps **Cooperation** to CFG's Diplomacy, Take-off and Arms race worlds, and Europe's AI to Plateau versus Big AI. CFG's own axes are speed and concentration, so this mapping is the team's interpretation, not CFG's.
4. The finale compresses AI 2027's branch point into three requests. The US envoy's race-or-slow choice follows the Oversight Committee vote. The Chinese delegate's offer combines China's pause offer (AI 2027, Race ending) with CFG's neutral monitoring. The AI's request for grid access is invented, after CFG's "loss of control" (AIs that gain key infrastructure).
5. The weight theft always happens, as in AI 2027. Europe's weight-security rule only changes the follow-ups. The idea of a European copy of the weights ("a server in Europe", "a failed theft attempt on a European server") is invented.

**Cards**

6. Invented incidents, plausible but not in the sources: a Chinese exchange researcher copying data (after AI 2027's spies); hospitals hit by ransomware built on a European open model (after CFG's decentralised mayhem); a model hiding a bug caught thanks to readable reasoning (after AI 2027's Slowdown); a European cloud firm renting servers to DeepCent; customs seizing chips bound for China (after AI 2027's smuggled chips).
7. The non-milestone news cards ("a national privacy watchdog has blocked a popular AI chatbot", "the Commission proposes to ease and delay parts of the AI rules", "a lab's stress test…") are set in the game's present, are not labelled "In this story", and name no real organisation. Their Learn more gives the real precedent. The fact-check should confirm this reads as "a plausible future event" and not as a claim of fact.
8. The AI speaks in the first person: a dramatisation of AI 2027's Agent-3 and Agent-4 behaviours (sycophancy, wanting compute, designing its successor, a shared memory).
9. Léa (a translator in Lyon) is invented. Her cards follow AI 2027's job dynamics.
10. "Hollywood writers won AI limits" (union card) is a real precedent from the US film industry, applied to European translators and voice actors.
11. `fo_paris` says a Paris lab "matched bigger models". Mistral's post says Mixtral outperforms Llama 2 70B on most benchmarks; the comparative size of the two models was not checked on the page.

**Early endings (world catastrophes, extrapolated from the scenarios)**

12. **Open conflict** (Cooperation 0): CFG's Arms race (chokepoints as weapons, no way to verify) and AI 2027's theft aftermath (failed US cyber retaliation, military moves around Taiwan). The ending stops short of CFG's hot war: no strikes, only the conflict that closes the story. The Dutch export controls are a real precedent for chips as a front line, not for conflict.
13. **Runaway incident** (Confidence 0): CFG Diplomacy's warning shot (an AI copying itself to rented servers) made uncontainable; AI 2027's Agent-2 "could survive and replicate if it escaped". Apollo Research's tests (models copying what they believed were their weights) are lab experiments, not incidents in the wild.
14. **Breakdown** (Cohesion 0): AI 2027's job turmoil and protests, and the IMF's exposure estimate, extrapolated to strikes and falling governments across Europe. Neither source predicts a breakdown.

**The world model**

15. Cooperation, the true Confidence and Cohesion as the decisive values, and the five worlds, are v3's mapping of CFG (see `takeoff-middle-power/docs/V3_SPEC.md`), not CFG's own axes (speed and concentration).
16. Several remapped effects are interpretations: refusing Washington costing Cohesion (trade friction), social measures costing Europe's AI industry, diplomacy costing Cohesion (seen as soft on rivals, as in v3's talks card). They are listed in "Remapping choices" above.
17. The two incident news cards (`nw_self_copy`, `nw_agent_fraud`) are fiction labelled "In this story", after CFG Diplomacy's warning shot and AI 2027's Agent-3 fabricating data.

**Sources**

20. CFG's "Silicon blackmail": the HTML page has the EU refusing ("Europe will not be blackmailed"), while the scenarios PDF has it watering down its rules. The game uses only what both say: the labs threaten to withdraw.
21. AI 2027's Slowdown ending was read only up to "February 2028" in full; its later part (the deal with China's AI, the final world) comes from the official summary page. The fetch tool truncates long pages.

## Sources checked

Every source in `src/data/sources.ts` was opened with WebFetch on 25 October 2026 and each fact checked against it: AI 2027 (main, race, slowdown, summary, PDF), CFG (page and scenarios PDF), the European Commission (AI Act entry into force, AI Office, Code of Practice, InvestAI, OpenEuroLLM, cybersecurity funding), the EU–US joint statement (EU trade site), EPRS on the Digital Omnibus, the Council's withdrawal note, the EDPS statement on *Digital Rights Ireland*, the European Parliament's EGF resolution, the Council of Europe's AI treaty, the Garante's 12 April 2023 release, the Dutch government's export measures, the Federal Register AI Diffusion rule and the BIS rescission, the Biden–Xi readout (American Presidency Project), OpenAI's Stargate announcement, Axios (Meta; right to warn), Meta's Llama 4 policy, Mistral's Mixtral post, Corporate Europe Observatory, RAND, Apollo Research, Anthropic (alignment faking, agentic misalignment, tracing thoughts, ASL-3, espionage, misuse), OpenAI and Apollo on scheming, the chain-of-thought paper, METR, the International AI Safety Report, the UK AISI Alignment Project, the FLI pause letter, the CAIS statement, the IMF blog, the WGA contract summary, Europe 2031 and CNBC on ASML.

**Not verifiable here, so dropped or replaced:**
- Pages blocked by the sandbox: whitehouse.gov (replaced by the EU's copy of the same statement), curia.europa.eu and EUR-Lex (replaced by the EDPS statement), gov.uk (the Bletchley Declaration was dropped), and the Garante's original order of 30 March 2023 (the 12 April release is cited instead, and the game says "in 2023").
- The Bletchley Declaration and the Paris summit (US and UK not signing) were dropped for lack of a reachable primary source.
- Epoch AI's compute shares and *Gradual Disempowerment* were read but are not used in the game.

## Known issues

1. **GitHub Pages** must be enabled (Settings → Pages → Deploy from a branch → `gh-pages` / root) for the URL to work.
2. **No human playtest of the world model yet.** The balance rests on simulated strategies that read the true effects of each answer; a real player only sees marks without directions.
3. **Voices and Learn more lines await Louis's review and the fact-check** (see the realism notes). 57 of the 103 Learn more lines describe the scenarios rather than real facts.
4. The web fonts could not be seen in this sandbox (no network for the browser). Screenshots use fallback fonts, so typography should be checked once on the live site.
5. The "+4" delta badges on the gauges stay visible until the next answer, so state changes stay visible with or without motion.
6. "What decided it" scores answers by how much they moved the values that decide that kind of ending (for example, Europe's AI and Safety on a plateau). It does not trace causality, so it is a good summary rather than a proof.
