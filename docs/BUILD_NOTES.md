# Build notes

Built overnight on 25–26 October 2026 from `docs/SPEC.md`, alone, with no one to ask: every judgement call is written down here. Infrastructure copied and adapted from `takeoff-middle-power` (read only).

## What was built

- **The game**: a mobile-first swipe game. Four gauges (Labs, Citizens, Allies, Oversight) start at 50 and end the term at 0 or 100 (8 early endings). Hidden Cooperation, Safety and Europe's AI, plus Steadiness from the gauges. About three weeks per card, an AI progress bar with a hidden takeoff speed, AI 2027's eleven milestones in order, a Year in review each January, the tipping-point finale (full-screen card, three final requests, Léa, the ending) or a plateau after December 2030 (10 final endings, the v3 tree).
- **Interaction**: drag the card, or use the two real answer buttons (first click previews with marks on the gauges, second click confirms), or the keyboard (← → / Enter / Escape). Announcements in words through `aria-live`, focus management on every screen, reduced motion (fade, no fly, no pulse).
- **Replay**: "Envoy #N", an Archive of all 18 endings, 15 goals (three shown at a time) that unlock 15 cards. All saved in localStorage behind try/catch; the game works without it.
- **End screen**: title, text, the idea behind it (early endings), "What decided it" (three answers with dates), "What you could not see" (Cooperation, Safety, Europe's AI and Steadiness in words, with a bar and the number, plus the takeoff speed), "In reality" with sourced facts, goals completed, Play again and Archive.
- **Engineering**: pure engine with the seeded RNG in state, declarative data with every number in `tuning.ts`, string-template UI with escaping, Vitest (43 tests), Playwright e2e (9 tests on the production build with its CSP), the axe and keyboard-only harness (`npm run a11y`), ESLint, seeded `npm run sim`, a screenshot script, GitHub Actions deploy with SHA-pinned actions and least-privilege permissions.

## Card counts

132 cards (117 in the first-run deck, 15 unlocked by goals):

| Kind | Count |
| --- | --- |
| Requests | 73: 8 each for the US envoy, the Chinese delegate, OpenBrain's CEO, the safety researcher, the union leader, the NimbusAI founder, the security chief and the partner minister; 9 for the journalist |
| Follow-ups | 14 (12 chains triggered by an answer, plus the 2-card journalist chain on the stolen weights) |
| News | 17: 11 milestone news (forced, AI 2027 order) and 6 others |
| The AI | 9 (from "self-improving AI"; two of them chosen by the hidden Safety value) |
| Léa | 8 (three single-button, two whose text hints at a hidden track) |
| Year in review | 3 (January 2028, 2029, 2030) |
| Tutorial | 3 (first run only) |
| Finale | 5 (tipping point, US envoy, Chinese delegate, The AI, Léa) |

**Basis:** 62 cards rest on AI 2027, 24 on CFG, 46 on a real source. **Learn more:** 103 cards (78%): 46 real facts and 57 scenario facts, the latter always labelled "In AI 2027…" or "In the CFG scenarios…". 42 cards are gated by a milestone.

## Decisions

1. **Effect convention.** On every request, the right answer goes along with the requester and raises their gauge, and the left answer refuses and lowers it. On news, the active reaction is on the right. Without this, one-sided play did not die fast enough (see the tuning table). Exceptions where the request itself asks to stand down (the union's "quiet deal", the founder's "open weights mandate") are kept for realism.
2. **Allies is one gauge for both superpowers**, as the spec says: going along with Washington or with Beijing raises it, and the partner minister's middle-power moves lower it.
3. **Hidden tracks.** Cooperation starts at 45 and Safety at 60, and both erode slowly every card ("the race pushes safety testing to the back", CFG Take-off). Europe's AI is a 0–100 value: Open at 50+, starting at 42 (dependent), moved by about 15 specific answers.
4. **Takeoff speed** is drawn from three bands (slow, steady, fast). The tipping point comes in 2028 (23%), 2029 (36%) or 2030 (40%), or not at all (31% of balancer runs).
5. **Ending thresholds** were set by an offline grid search over the final states of 800 runs per strategy. This works because the thresholds do not change how any strategy plays. The final values are close to the spec's (Pause 65/60, Race 70/65, Rupture 85/45, Plateau 65/30); see `DEVELOPER_NOTES.md`.
6. **"What decided it"** shows at most one of the finale's three answers. Otherwise the large finale swings would always fill the list.
7. **A tutorial guide.** The spec's cast has no narrator, so the tutorial and the Year in review come from **Noor, your chief of staff**, an added fictional character.
8. **Names.** The cast got fictional names (Grant Holloway, Wei Lan, Marcus Reed, Dr Amara Okafor, Bruno Ferreira, Sanna Lindqvist, Col. Ines Marchetti, Kenji Mori, Clara Novak). The founder's lab is **NimbusAI**, CFG's fictional EU champion. OpenBrain, DeepCent and Agent-2/3/4 come from AI 2027.
9. **Single-button cards** (Year in review, the tipping point, three Léa cards, the final Léa card) change nothing and are exempt from "every answer costs something". The test applies to every two-answer card.
10. **The game starts in January 2027**, but its milestones follow AI 2027 from "China wakes up" (mid-2026 in the scenario). The scenario's calendar is replaced by the AI progress meter, as the spec asks.
11. **Visual design**: a cool official-stationery blue (#DCE3EC), navy ink, white playing cards with a solid offset shadow, and one signal yellow (#F5C518) for the chosen answer. Bricolage Grotesque for display and Atkinson Hyperlegible for body text, both from Google Fonts. Portraits are original flat shapes (circles and paths).
12. **Screenshots** use fallback fonts: the sandbox cannot reach Google Fonts, so the scripts stub them.

## Simulation (final)

2000 seeded runs per strategy, first-run deck (`npm run sim`):

| Strategy | Target | Result |
| --- | --- | --- |
| Always left | dies within 20 cards > 90% | **99.0%** (median 13 cards; Blindsided 70%, Apathy 13%, Isolated 11%, Exodus 7%) |
| Always right | dies within 20 cards > 90% | **93.2%** (median 13; Patchwork 51%, Overreach 46%) |
| Random | survives < 20%; median 20–30 | **11.3%** survive; median **25** cards |
| Balancer | survives > 60%; good 25–45% | **100%** survive; **36.0%** good |
| Thoughtful | good 55–80% | **70.2%** good |
| All | each of 18 endings ≥ 1% for some strategy | **met** (rarest: Capture 1.3%, The cognitive revolution 1.7%, Absorbed 2.0%) |
| Extra | both answers of every character in winning runs | **met** |
| Extra | each answer lowers something | **met** (content test) |

With every goal unlocked (`npm run sim -- 2000 all`) all targets still hold (always right 91.0%, balancer 35.9% good, thoughtful 74.7% good).

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

**Early endings: real mechanism, sourced precedent, extrapolated**

12. **Exodus**: Meta withholding a multimodal model from the EU (2024) concerns one company and one product; the ending extrapolates to the labs and researchers leaving.
13. **Capture**: Corporate Europe Observatory documents lobbying intensity (2023), not capture as such; the replaced envoy is invented.
14. **Apathy**: the Commission's withdrawal of the AI Liability Directive (approved 16 July 2025, Council document ST-13873-2025) is the precedent. Its stated reason ("no foreseeable agreement") comes only from a secondary source (IAPP), so the game states the withdrawal without a reason.
15. **Patchwork**: the Italian Garante's 2023 temporary limitation of ChatGPT was a single authority acting on privacy. The ending extrapolates to many member states and to AI services in general.
16. **Isolated**: the US AI Diffusion Rule (January 2025) put 17 EU states under caps, but it was rescinded in May 2025 before its compliance dates. The ending imagines a harsher version, plus a cloud freeze.
17. **Absorbed**: the EU's intent to buy at least $40 billion of US AI chips is a trade-framework commitment; the ending extrapolates to Europe losing its voice.
18. **Blindsided**: Anthropic's November 2025 case targeted tech firms, financial institutions, chemical makers and government agencies, not specifically EU ministries.
19. **Overreach**: *Digital Rights Ireland* (2014) concerned telecom data retention; the ending applies the same Charter reasoning to AI conversation logs.

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

1. **GitHub Pages is not enabled yet.** The workflow has created `gh-pages`; the owner must turn it on in Settings → Pages → Deploy from a branch → `gh-pages` / root. Until then the URL returns 404.
2. **No human playtest yet.** The balance rests on simulated strategies that read the true effects of each answer. The balancer survives 100% of runs, which may make the game feel easy for a practised player; a real player only sees marks without directions. The spec's playtest (five people, three runs each) is still to do.
3. **Voices and Learn more lines await Louis's review and the fact-check** (see the realism notes). 57 of the 103 Learn more lines describe the scenarios rather than real facts.
4. The web fonts could not be seen in this sandbox (no network for the browser). Screenshots use fallback fonts, so typography should be checked once on the live site.
5. Under reduced motion, the "+12" delta badges on the gauges stay visible until the next answer, on purpose, so state changes stay visible. With full motion they fade after about 1.8 s.
6. "What decided it" scores answers by how much they moved the values that decide that kind of ending (for example, Europe's AI and Safety on a plateau). It does not trace causality, so it is a good summary rather than a proof.
