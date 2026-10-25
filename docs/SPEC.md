# Takeoff: Reign Version Spec

Oct 25, 2026 · @Damien

## What the game is

A short, replayable swipe game in the spirit of *Reigns*. You are the EU's AI Envoy. People bring you one request at a time, and you answer **left or right**. Each answer moves **four gauges**. If any gauge hits **0 or 100**, your term ends early. If you hold on until the AI reaches its tipping point (or until the end of 2030), the state of the world decides which of the **ten endings** you get.

**Why this version.** The full game asks players to learn a model before they can play. Here there is nothing to learn: read a card, pick a side, see what moved. A run takes 3 to 12 minutes. Dying early is part of the fun, and each death teaches one idea ("Leaving the labs alone let them write the rules"). Replays do the teaching that tutorials did in Middle Power.

**What it keeps from Middle Power:** the scenario (OpenBrain, DeepCent and the 2027 timeline, always labelled as fiction), the ten endings from the CFG scenario, the cast from the hybrid spec, Léa, and the house rules: every real fact has a primary source, card text is short and plain, and the game is fully accessible.

**What it drops:** the map, Influence, policy cards, the advisor, the round structure and the report screen.

It lives in its own repository, `damienlethiec/takeoff-reign-version`, published on GitHub Pages.

## The four gauges

Each gauge is a force that weighs on Europe's AI policy. All four start at 50. Too little is fatal, and so is too much: that is the lesson the format teaches for free.

| Gauge | What it measures | At 0 | At 100 |
| --- | --- | --- | --- |
| **Labs** | The weight of AI companies in Europe | **Exodus.** Labs and talent leave. Europe has no AI and no seat at the table. | **Capture.** Lobbyists write the rules. You are replaced by a friendlier envoy. |
| **Citizens** | How mobilised the public is on AI | **Apathy.** Nobody cares. The Council ignores you and your mandate is not renewed. | **Panic.** A blanket ban passes in a week. The race goes on without Europe. |
| **Allies** | How close Europe is to Washington and Beijing | **Isolated.** Sanctions and cut-off chips. Europe cannot train or run anything. | **Absorbed.** Europe signs whatever it is asked. Its voice disappears. |
| **Oversight** | Europe's capacity to see what AI systems do | **Blindsided.** A major incident nobody saw coming. You take the blame. | **Overreach.** Inspectors read everything. The Court strikes it down, and you go with it. |

**Before answering**, the player sees which gauges will move and roughly how much (a small or a large mark), but not in which direction, as in *Reigns*. The direction is shown after the answer, with + / − and words.

**Hidden tracks.** Three values the player never sees as numbers decide the final ending:

- **Cooperation** between the US and China (0–100). Sets the world: Pause, Race or Rupture.
- **Safety**: how aligned the leading AI truly is (0–100). Characters hint at it; the truth is revealed at the end.
- **Europe's AI**: Open or Dependent, flipped by a few specific answers.

A fourth value, **Steadiness**, comes from the gauges themselves: the closer all four are to the middle, the higher it is (100 when all are at 50). It plays the role of Cohesion in v3. So surviving well also means ending well.

Once a year, a **Year in review** card describes the hidden tracks in words only ("Washington and Beijing are drifting apart. Nobody is sure the new models do what they say.").

## Time and the tipping point

**Each card moves time forward about three weeks.** The date is shown under the gauges ("March 2027"). A run that survives to the end of 2030 sees about 64 cards.

**AI progress** is the only other visible meter: a thin bar labelled "AI progress". It rises a little with every card, faster when the race heats up (low Cooperation, compute deals, stolen models) and slower after pauses or inspections. When it reaches the top, the **tipping point** begins.

**The finale** replaces the normal deck:

1. A full-screen card: "The models now improve themselves." No gauges move.
2. Three final requests, one each from the US envoy, the Chinese delegate and The AI. Their answers move the hidden tracks strongly. The gauges still apply: a gauge at 0 or 100 here still ends the run.
3. A Léa card that reflects the state of the world.
4. The ending.

If AI progress never reaches the top by December 2030, the run ends on a **plateau** (the AI did not tip), and the ending comes from Europe's AI and Steadiness, as in v3.

The speed of AI progress has a hidden random part drawn at the start of each run (the takeoff speed), so the tipping point can come in 2028 or not at all. The seeded RNG makes every run reproducible.

## Characters and cards

**The cast** is the hybrid's: the US envoy, the Chinese delegate, OpenBrain's CEO, the safety researcher, the union leader, the open-source founder, the security chief, the partner minister, the journalist, Léa, and The AI (from the second half of the run). All are fictional. Each has a simple original portrait (flat shapes drawn in SVG, no imitation of *Reigns* art) and a recognisable voice.

**A card** is a request from one character, with two answers.

- **Text**: at most 30 words, in the character's voice.
- **Two answers**: a label of at most 4 words each ("Sign it", "Not now").
- **Effects** of each answer on the four gauges (usually 2 or 3 of them, between 5 and 20 points), on the hidden tracks, on AI progress, and flags it sets.
- **When** it can appear: date range, flags, gauge ranges.
- **Follow-ups**: card ids that come back a few cards later because of this answer ("You refused the audit" → eight cards later, "The leak you could have caught").
- **Learn more** (optional): the real-world fact behind the card, at most 40 words, with its source.
- **Weight**, and **once** for cards that appear at most once per run.

**Kinds of cards:**

| Kind | What it does |
| --- | --- |
| Request | The normal card: a character asks, you choose. |
| Follow-up | Comes back because of an earlier answer. This is how preparation pays off. |
| News | Something happens ("DeepCent stole OpenBrain's weights"). Two reactions to choose from. |
| Léa | Her life, as the world changes. Short, personal, sometimes no gauge moves. |
| The AI | From mid-run, the model speaks to you directly. Its requests touch Safety, which you cannot see. |
| Year in review | Once a year, words about the hidden tracks. One button: Continue. |
| Tutorial | The first three cards of a first run teach the swipe. |

**Every answer has a cost.** No card has a free right answer: each side must lower at least one gauge or one hidden track. A balance test enforces it.

## Endings

**Eight early endings**, one per gauge extreme (see the gauge table). Each is a short screen: a title, two sentences on what happened, and one line on the real idea behind it, with its source when it rests on a fact (for example, regulatory capture or the 2023 calls for a pause). Most first runs end this way, and that is intended.

**Ten final endings**, reached by surviving to the tipping point or to December 2030. They use the v3 tree, with Safety in the place of Confidence and Steadiness in the place of Cohesion:

| World | How you get there | Decides | Safety net | Good ending | Bad ending |
| --- | --- | --- | --- | --- | --- |
| Pause | Tipping point, Cooperation 60+ | Safety 65+ | Steadiness 45+ | Licensed utopia | Unstable pause |
| Race | Tipping point, Cooperation 30–59 | Safety 75+ | Steadiness 55+ | Cognitive revolution | Loss of control |
| Rupture | Tipping point, Cooperation below 30 | Steadiness 85+ | Safety 65+ | Multipolar world | Hot war |
| Plateau, open | No tipping point, Europe's AI open | Steadiness 60+ | Safety 40+ | A bright winter | Decentralised mayhem |
| Plateau, big labs | No tipping point, Europe's AI dependent | Steadiness 60+ | Safety 40+ | The agent economy | Silicon blackmail |

The good ending needs both the deciding value and the safety net. These thresholds are starting values; the simulation tunes them.

**Endings archive.** All 18 endings appear on an "Archive" screen, greyed out until reached once. This drives replay, as the deaths list does in *Reigns*.

## Learning and replay

**Learn more.** A small "i" button on a card shows the real fact behind it, with its source, without leaving the card. Fiction stays labelled as fiction ("In this story…"). The player can read it or skip it; the game never forces it.

**End screen**, after every ending:

- The ending's title and text.
- **What decided it**: the two or three answers that moved things most, in words ("You let OpenBrain skip the audit in May 2028").
- **The hidden tracks revealed**: Cooperation, Safety and Europe's AI, in words and as a simple bar for each, now that the run is over.
- **In reality**: one or two sourced facts linked to this ending.
- Buttons: Play again, Archive.

**Each run is a new envoy** ("Envoy #4"), as each reign is a new king in *Reigns*. The run counter and the archive are saved in the browser (`localStorage`, wrapped in try/catch; the game works without it).

**Goals between runs.** Three goals are shown at a time, Reigns-style ("Survive until 2029", "Reach a Pause world", "Finish with every gauge between 30 and 70"). Completing one unlocks new cards (for example, the journalist's chain on the stolen weights) so later runs show more of the story. About 15 goals in the first version.

## Screen, interaction and accessibility

**Layout (mobile first, portrait):** the four gauge icons with their fill at the top; the date and the AI progress bar below them; the character's portrait and card in the middle; the character's name under the card; the Learn more button in a corner of the card. On a wide screen the same column sits centred, with the archive and goals at the side.

**Choosing:**

- **Touch or mouse**: drag the card left or right. While it leans, the answer's label appears and the marks on the gauges show what will move. Let go past the threshold to confirm; let go before it to cancel.
- **Buttons**: two real buttons under the card, with the answer labels, always present. Clicking one shows the preview; clicking again confirms. This is the path for keyboards, screen readers and anyone who dislikes dragging.
- **Keyboard**: ← and → pick a side and show its preview, Enter confirms, Escape cancels. Shortcuts are listed on screen and do not fire while focus is on another control.

**Accessibility** (required, as in the main repository):

- Each answer button's accessible name includes what it will move: "Sign it. Will change: Labs a lot, Allies a little."
- After an answer, an `aria-live` region announces the changes once, in words: "Labs up a lot. Allies down a little. March 2027."
- Gauges carry their value as text and a label, never colour alone; + / − and words go with every change.
- Contrast is at least WCAG AA.
- With `prefers-reduced-motion`, the card fades instead of flying and nothing pulses.
- Ending screens and the archive move focus to their heading; overlays trap focus and close with Escape.
- An axe audit and a whole run played with the keyboard alone run in CI.

## Tech, content and validation

**Stack**: the same as Middle Power. Vite and TypeScript with no framework; a pure engine with a seeded RNG and no DOM; declarative data in `src/data` with every number in `tuning.ts`; a string-template UI; Vitest, Playwright, axe and a seeded simulation (`npm run sim`). A `CLAUDE.md` copies the house rules. GitHub Pages publishes `main` at the root and every other branch under `/preview/<branch>/`, with actions pinned to commit SHAs and least-privilege permissions.

**Content for the first version:**

- About **120 cards**: around 8 per character, 10 follow-up chains, 10 news cards, 8 Léa cards, 8 cards for The AI, the yearly reviews and 3 tutorial cards.
- 8 early endings and 10 final endings, with their texts.
- 15 goals.
- A Learn more fact on at least half of the cards, each checked against its primary source and listed in `sources.ts`.

The build drafts the cards; Louis reviews the voices and the fact-check reviews every Learn more line.

**Simulation targets** (thousands of seeded runs per strategy):

| Strategy | Target |
| --- | --- |
| Always left, or always right | Dies within 20 cards in more than 90% of runs |
| Random | Survives to the end in under 20% of runs; median run around 20 to 30 cards |
| Balancer (keeps gauges near 50) | Survives to the end in more than 60% of runs, good ending in 25–45% |
| Thoughtful (balancer that also favours Safety and Cooperation) | Good ending in 55–80% of runs |
| All | Each of the 18 endings reached in at least 1% of runs of some strategy |

Two extra checks: no card has an answer that is never worse (each side lowers something), and for every character both of their usual answers lead to good endings in some runs.

**Playtest**: five people, three runs each, with the same four questions as the v3 and hybrid playtests, so the three versions can be compared.
