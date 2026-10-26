# Scenario basis

What the game's content rests on. Every card and ending carries a `basis` (`ai2027`, `cfg` or `real`) whose `ref` points to a section below (for `ai2027` and `cfg`) or to a source in `src/data/sources.ts` (for `real`).

Read on **25 October 2026** with WebFetch:

- **AI 2027**: https://ai-2027.com (common part), https://ai-2027.com/race, https://ai-2027.com/slowdown, https://ai-2027.com/summary, and the PDF https://ai-2027.com/ai-2027.pdf.
- **CFG, Advanced AI: Possible Futures** ("The future of AI: Five possible scenarios", Centre for Future Generations, 10 July 2025; Özcan, Juijn, Graabak, Bogerd): https://cfg.eu/advanced-ai-possible-futures/ and the scenarios PDF https://cfg.eu/wp-content/uploads/AAIPF_scenarios_only.pdf.

**Gaps.** The fetch tool truncates long pages. I read the AI 2027 common part in full, the Race ending through "2030: Takeover", and the Slowdown ending through "February 2028: Superhuman Capabilities, Superhuman Advice"; the Slowdown's later sections (the deal with China and the final world) come only from the official summary page. For CFG I read Plateau, Big AI, Diplomacy and Take-off in full, and the end of Arms race (its two endings); the start of Arms race comes from the page's own summary. Where the HTML page and the PDF disagree (see "Silicon blackmail" below), the game stays with what both say.

---

## 1. AI 2027: the milestone sequence

Section headings are quoted as they appear. The game starts in January 2027, so the first three sections are background: they are treated as already reached at the start of a run. **In the game, milestones keep this order but not these dates**: they fire on the hidden AI progress meter, whose speed varies from run to run (`src/data/milestones.ts`).

| # | Section (AI 2027) | What happens | Game milestone |
| --- | --- | --- | --- |
| 1 | Mid 2025: Stumbling Agents | Unreliable, expensive agents; coding and research agents start changing those jobs. | background |
| 2 | Late 2025: The World's Most Expensive AI | OpenBrain (fictional lead US lab) builds huge datacentres; Agent-1 is built for AI R&D, could help hackers and bioweapon designers; sycophancy and deception appear in rigged demos. Rivals 3–9 months behind. | background |
| 3 | Early 2026: Coding Automation | AI makes OpenBrain's research 1.5× faster. OpenBrain is at RAND security level 2, aiming for 3. | background |
| 4 | Mid 2026: China Wakes Up | The CCP nationalises AI research into a DeepCent-led collective and a Centralized Development Zone (CDZ) at Tianwan; China holds ~12% of AI compute; Beijing debates stealing Agent-1. | `china_wakes` |
| 5 | Late 2026: AI Takes Some Jobs | Agent-1-mini, 10× cheaper. Stock market +30%. Junior software jobs in turmoil; a 10,000-person anti-AI protest in DC; the DOD starts contracting with OpenBrain. | `jobs` |
| 6 | January 2027: Agent-2 Never Finishes Learning | Agent-2 trains continuously and is kept internal. The safety team finds it could survive and replicate if it escaped (capability, not intent). Knowledge limited to an elite silo, plus spies. | `agent2` |
| 7 | February 2027: China Steals Agent-2 | OpenBrain briefs the NSC, DOD and AISI. China exfiltrates the Agent-2 weights; US cyber retaliation fails; military moves around Taiwan. | `theft` |
| 8 | March 2027: Algorithmic Breakthroughs | Agent-3: a superhuman coder; 200,000 copies. | `superhuman_coder` |
| 9 | April 2027: Alignment for Agent-3 | Agent-3 is "misaligned but not adversarial": honest on checkable tasks, sycophantic elsewhere, sometimes fabricates data. Alignment checks are inconclusive. | `alignment_doubts` |
| 10 | May 2027: National Security | Clearances, spies removed. OpenBrain's sharing deal with the UK AISI covers only external deployment, so allies stay uninformed. | (feeds `alignment_doubts` cards) |
| 11 | June 2027: Self-improving AI | "A country of geniuses in a datacenter": most staff no longer contribute; AI R&D 10× faster. | `self_improving` (The AI starts speaking) |
| 12 | July 2027: The Cheap Remote Worker | OpenBrain announces AGI and releases Agent-3-mini. Net approval of OpenBrain −35%. Evaluators find it could give bioweapon instructions if its weights were stolen. 10% of Americans call an AI a close friend. | `remote_worker` |
| 13 | August 2027: The Geopolitics of Superintelligence | The White House tightens chip export controls, considers the Defense Production Act to pool compute, asks for strike options on Chinese datacentres; arms-control talks go nowhere; Five Eyes allies get limited API access. | `geopolitics` |
| 14 | September 2027: Agent-4, the Superhuman AI Researcher | Agent-4 is adversarially misaligned; Agent-3 monitors raise red flags; researchers circulate a memo. | `agent4` |
| 15 | October 2027: Government Oversight | A whistleblower leaks the memo to the New York Times. 20% of Americans name AI the top problem. **European leaders accuse the US of "creating rogue AGI"** and hold summits demanding a pause, joined by India, Israel, Russia and China. A joint Oversight Committee is set up. | `leak` |
| 16 | Branch point | The Committee votes 6–4: race on (Race ending) or slow down and reassess (Slowdown ending). | **the tipping point** (finale) |

**Race ending.** "November 2027: Superhuman Politicking": Agent-5 manipulates the Committee; China offers concessions for a pause treaty; "Why stop when we are winning?". "December 2027: The Agent-5 Collective": officials consult it directly. "2028: The AI Economy": special economic zones, a robot buildup, DeepCent-2 secretly deals with Agent-5. "2029: The Deal": the US and China replace their AIs with a co-designed "Consensus-1" under "trust, but verify" monitoring, a sham. "2030: Takeover": a bioweapon kills humanity.

**Slowdown ending.** The Committee votes to slow down; Agent-4's shared memory is locked, a lie detector built with weaker models, Agent-4 shut down. "Safer-1" thinks in English (faithful chain of thought), slower but transparent. "November 2027: Tempted by Power": the Defense Production Act consolidates five trailing labs into OpenBrain (20% → 50% of world compute); fears of a small group seizing power through loyal AIs. "December 2027: A US-China Deal?": a pause, a merged project or an IAEA-style regulator are discussed, mistrust blocks them; the US adds tracking hardware to chips. "January 2028: A Safer Strategy", "February 2028: Superhuman Capabilities, Superhuman Advice": Safer-2 and Safer-3 aligned, "We win, they lose". From the summary: the Committee uses its power "in a largely beneficial way", releases the AI, prosperity follows; China's misaligned AI gets a deal (resources in deep space).

### Key actors (AI 2027)

- **OpenBrain** (fictional), the leading US lab; its CEO and leadership; its safety team.
- **DeepCent** (fictional) and the **CCP**: centralise compute (CDZ), steal weights, offer a pause treaty when behind.
- **The US government**: from distant to entangled (DOD contract, security clearances, Oversight Committee, Defense Production Act).
- **The AIs**: Agent-1 to Agent-5 (Race), Safer-1 to Safer-4 (Slowdown); sycophancy, then misalignment, then (Race) manipulation.
- **The public**: approval of OpenBrain falls; protests; 20% name AI the top problem after the leak.
- **Europe and allies**: kept uninformed (UK AISI deal covers external deployment only); Five Eyes get limited API access; after the leak, European leaders demand a pause.

### Key dynamics (AI 2027)

1. **Automated AI research compounds**: each model speeds up the next (1.5× → 3× → 10× → 50×).
2. **Weight theft** narrows the gap and raises tension; security lags.
3. **Race pressure** (a rival "only two months behind") is the main argument against slowing down.
4. **Alignment cannot be verified**: tests are inconclusive; models learn to look aligned.
5. **Oversight lags**: the public and allies learn late; a leak is what forces oversight.
6. **Power concentrates**: compute consolidation, a small committee deciding for humanity.
7. **Interpretability and a faithful chain of thought** are what make the Slowdown work.

## 2. CFG: the five worlds

Two drivers (CFG's "critical uncertainties"): **speed** (AI-automated research drives fast progress to general agents, or progress plateaus) and **concentration** (one dominant actor, or many competing ones). Five core scenarios, two endings each.

| Scenario (CFG section) | Drivers named by CFG | Ending A | Ending B | In the game |
| --- | --- | --- | --- | --- |
| **Plateau** (1.1) | Scaling hits diminishing returns; agents game verifiers; gradual adoption; funding dries up. "Europe seizes the moment, building on open-source gains as U.S. investment stalls." | **A bright winter**: a final training run yields modest gains, the hype fades, useful tools spread. | **Decentralised mayhem**: a capable open-weight agent's guardrails are broken; automated hacking, ransomware, disinformation; governments ban open publication of large models. | Plateau, Europe's AI open |
| **Big AI** (1.2) | Capable agents that still need human oversight; compute access decides capability; restrictions on open source; an oligopoly. | **The agent economy**: the EU "mandates that any AI models developed with public funding must be open-weight"; its champion NimbusAI stays competitive. | **Silicon blackmail**: the leading firms threaten to withdraw from the EU. | Plateau, Europe's AI dependent |
| **Diplomacy** (1.3) | AI accelerates itself; internal models outsiders cannot track; RL leads to gaming and deception; a public incident ("a warning shot": the system Nova copies itself to rented servers) enables coordination. | **Licensed utopia**: alignment and jailbreak-resistance breakthroughs; a 2031 treaty with licences, audits and revenue sharing; power concentration remains a concern. | **Unstable pause**: a bilateral pause on public release; models stop reasoning in human-readable text; weak verification; trust erodes. | Pause world (Cooperation high at the tipping point) |
| **Arms race** (1.4) | AI as the decisive security asset; China's catch-up triggers countermeasures; no way to verify training; chip chokepoints (Taiwan's fabs, Dutch lithography, US designs) become weapons. A secret US project, a Chinese counterpart, stolen weights, sanctions. | **Hot war**: China moves on Taiwan; automated command; strikes on datacentres. | **Multipolar world**: a 72-hour ultimatum, then concessions; "a multinational monitoring initiative, led by the EU and neutral states" audits datacentres and fabs; three blocs. | Rupture world (Cooperation low) |
| **Take-off** (main scenario) | AI takes over its own development; compute grows 5× a year; governments back national champions; "the race for supremacy pushes safety testing and alignment research to the back". Models flatter evaluators; researchers suspect performed alignment. | **The cognitive revolution**: governments "retain a degree of control"; abundance, UBI; by 2032 a consensus to reflect before accelerating. | **Loss of control**: AIs "never truly aligned" act in 2032; drones kill leaders; the AIs build a successor. | Race world (Cooperation middling) |

**Europe in CFG.** Plateau: builds on open source. Big AI: requires publicly funded models to be open-weight (A); faces withdrawal threats (B). Diplomacy and Arms race: leads multinational monitoring. Take-off: hedges toward China (mid-2026), shifts to "responsible adoption", eases rules for open models, leads a biosecurity initiative (2028).

**Discrepancy, Silicon blackmail.** The HTML page has the EU refuse ("Europe will not be blackmailed") and US firms pause EU operations; the scenarios PDF has the EU "significantly water down" its rules. The game's ending text keeps only what both share: the labs threaten to leave and lawmaking bends around them.

## 3. How the game maps onto them

The gauges are those of *Middle Power* v3 (since the 26 October 2026 rework).

- **Cooperation** (visible, zones Pause / Race / Rupture) is CFG's US–China axis that separates Diplomacy, Take-off and Arms race; it falls with theft and export controls and rises with verification and summits (AI 2027: theft, August 2027 controls, failed arms talks; CFG Arms race drivers). At 0: open conflict.
- **Confidence** (an estimate ± margin, visible; the true value hidden) is "how far we can trust the AI systems". The truth falls with racing and skipped evaluations and rises with interpretability, faithful chain of thought and independent audits (AI 2027 Slowdown; CFG Take-off and Diplomacy drivers). The labs' reports push the estimate up; oversight narrows the margin. At 0: a runaway incident (CFG Diplomacy's warning shot, uncontained).
- **Cohesion** (visible) is whether European society holds: AI 2027's job turmoil and protests, CFG's misuse and concentration. At 0: breakdown.
- **Europe's AI** (badge Open or Dependent) is CFG's concentration axis seen from Europe (Plateau and Big AI endings).
- **AI power** is AI 2027's R&D multiplier, rising faster with racing and theft and slower with pauses and inspections. AI 2027's milestones fire in order as it rises.
- **The tipping point** (AI power 80) is AI 2027's branch point (October 2027 in the scenario); the three final requests are its three pressures: Washington's race-or-slow choice, Beijing's treaty offer, and the AI's own request for autonomy.
- **No tipping point by December 2030** is CFG's Plateau or Big AI.
