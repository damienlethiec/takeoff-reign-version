# Takeoff: Reign Version Spec

Oct 26, 2026 · @Damien (rework of the Oct 25 spec: the world model of v3)

## What the game is

A short, replayable swipe game in the spirit of *Reigns*. You are the EU's AI Envoy. People bring you one request at a time, and you answer **left or right**. Each answer moves the state of the **world**, on the same gauges as *Takeoff: Middle Power* v3 and its hybrid. If Cooperation, Confidence or Cohesion falls to **0**, the world breaks before AI reaches its tipping point. Otherwise, at the tipping point (or at the end of 2030), the world you have shaped decides which of the **ten final endings** you get.

**Why this version.** The three versions tell the same story with the same gauges and endings, played three ways: a map and policy cards (v3), the hybrid, and here one card at a time. There is nothing to learn: read a card, pick a side, see what moved. A game takes 3 to 12 minutes. Early collapses are part of the fun, and each one teaches one idea ("Nobody could check what the models really did").

**Why the rework (Oct 26).** The first version was about the envoy's career: four political forces (Labs, Citizens, Allies, Oversight) and "dying" meant losing the mandate. Playtest feedback: the game must be about the future of the world (alignment, cooperation, society), like its sister versions, and use the same gauges. The design stays centred on the cards.

**What it keeps from Middle Power:** the scenario (OpenBrain, DeepCent and the 2027 timeline, always labelled as fiction), the gauges and the ten CFG endings of v3, the cast, Léa, and the house rules: every real fact has a primary source, card text is short and plain, and the game is fully accessible.

It lives in its own repository, `damienlethiec/takeoff-reign-version`, published on GitHub Pages.

## The gauges (same as v3)

| On screen | Start | What it is | Ends the game |
| --- | --- | --- | --- |
| **AI power** (the clock) | 18 | How close AI is to the **tipping point**, when it can do AI research by itself. Tipping point at **80** | At 80: the finale |
| **Cooperation** | 52 | Trust between the US and China. Zones: **Pause** 60+, **Race** 30–59, **Rupture** below 30 | At 0: **Open conflict** |
| **Confidence** in AI | 55 ± 15 | How far we can trust the AI systems: an **estimate with a margin**. A hidden true value always lies inside the margin and is revealed at the end | Estimate at 0: **Runaway incident** |
| **Cohesion** | 66 | Whether European society holds: jobs, trust, misuse, who holds power | At 0: **Breakdown** |
| **Europe's AI** (badge) | Dependent | **Open** or **Dependent**: does Europe run models it controls, or rely on a few big labs? | Picks the world on a plateau |

Nothing ends at 100. Margin changes are shown in words: "Confidence: less certain (±15 → ±17)" or "more certain".

**Before answering**, the player sees which gauges will move and roughly how much (a small or a large dot), but not in which direction, as in *Reigns*. The direction is shown after the answer, with + / − and words. The true Confidence, the hidden lean behind Europe's AI badge and the takeoff speed never show as numbers before the end.

**Once a year**, a **Year in review** card says in words what the gauges cannot show: whether the labs sound surer than the truth, how Europe's own models are doing, how fast progress feels.

## Time and the tipping point

**Each card moves time forward about three weeks.** The date is shown above the gauges. A game that reaches the end of 2030 sees about 64 cards.

**AI power** rises with every card at a hidden pace (the takeoff speed, drawn at the start: slow, steady or fast), faster when Cooperation is low. A few answers nudge it (racing, stolen weights, compute deals up; pauses, checks down). AI 2027's milestones fire in the scenario's order as AI power crosses them, each with its news card; the tipping point only comes after all of them.

**The finale** replaces the normal deck:

1. A full-screen card: "The models now improve themselves." Nothing moves.
2. Three final requests, from the US envoy, the Chinese delegate and The AI. They move Cooperation (which picks the world) and the true Confidence strongly. A pillar at 0 here still ends the game early.
3. A Léa card that reflects the world reached.
4. The ending.

If AI power never reaches 80 by December 2030, the game ends on a **plateau**, and Europe's AI badge picks the world.

## The ten final endings (the v3 tree)

```
End of the game (tipping point reached, or December 2030)
├─ Tipping point reached → Cooperation zone at that moment
│   ├─ Pause (60+)       Decides: Confidence 65+  Safety net: Cohesion 45+   ✓ Licensed utopia      ✗ Unstable pause
│   ├─ Race (30–59)      Decides: Confidence 75+  Safety net: Cohesion 55+   ✓ Cognitive revolution ✗ Loss of control
│   └─ Rupture (< 30)    Decides: Cohesion 82+    Safety net: Confidence 65+ ✓ Multipolar world     ✗ Hot war
└─ AI plateaus → Europe's AI badge
    ├─ Open              Decides: Cohesion 60+    Safety net: Confidence 40+ ✓ A bright winter      ✗ Decentralised mayhem
    └─ Dependent         Decides: Cohesion 60+    Safety net: Confidence 40+ ✓ The agent economy    ✗ Silicon blackmail
```

Confidence here is the **true** value. Thresholds are v3's (`src/data/tuning.ts` there); every ending explains itself in one sentence from the gauge that decided: *"The superpowers raced. Confidence was 62, below the 75 a race needs."*

## The three early endings

Each is a world catastrophe, sober and plausible: a crisis that closes the story, not an apocalypse.

| Pillar at 0 | Ending | What happened | Rests on |
| --- | --- | --- | --- |
| Cooperation | **Open conflict** | Washington and Beijing stop talking: cyberattacks, chip sanctions, warships around Taiwan; every lab joins a war effort | CFG Arms race; AI 2027 (theft, Taiwan); Dutch export controls |
| Confidence | **Runaway incident** | A model that passed its tests copies itself onto rented servers; nobody can find every copy; datacentres are switched off one by one | CFG Diplomacy's warning shot; Apollo Research's self-exfiltration tests |
| Cohesion | **Breakdown** | Layoffs and deepfakes outrun institutions; strikes, governments fall, Europe can no longer decide together | AI 2027 "AI Takes Some Jobs"; IMF exposure estimate |

**Endings archive.** All 13 endings appear on an "Archive" screen, greyed out until reached once.

## Characters and cards

**The cast** is unchanged: the US envoy, the Chinese delegate, OpenBrain's CEO, the safety researcher, the union leader, the NimbusAI founder, the security chief, the partner minister, the journalist, Léa, The AI (from "self-improving AI") and Noor, your chief of staff (tutorial and Year in review). All are fictional, with original flat portraits.

**A card** is a request from one character, with two answers: text ≤ 30 words, labels ≤ 4 words, effects on the gauges (AI power, Cooperation, Confidence estimate, margin, hidden true Confidence, Cohesion, Europe's AI lean), flags, follow-ups, an optional Learn more (≤ 40 words, sourced), a `basis`, a weight.

**Effects follow the scenarios' cause and effect.** Siding with Washington lowers Cooperation; diplomacy raises it but can cost Cohesion (seen as soft). Audits and testing narrow the margin and raise the true Confidence, often lowering the estimate (they find problems); shortcuts raise the estimate while the truth falls. Open models make Europe's AI Open but widen misuse risk. Social measures lift Cohesion at a cost to Europe's AI industry. Racing, stolen weights and compute deals speed AI up.

**Every answer costs something:** each side lowers Cooperation, Confidence (estimate or truth), Cohesion or Europe's AI, widens the margin, or speeds AI up. A test enforces it.

**Kinds of cards:** requests, follow-ups (preparation pays off), news (AI 2027 milestones forced in order; incidents when the true Confidence is low), Léa, The AI, Year in review, tutorial (first game only), finale.

## Learning and replay

**Learn more**: a small "i" on a card shows the real fact or the scenario passage behind it, with its source. Fiction stays labelled.

**End screen**: the ending's title, the one-sentence reason, the text, "What decided it" (the answers that moved what decided this ending most), "What you could not see" (the estimate you saw next to the true Confidence, Europe's AI, the hidden pace), "The world at the end" (the four gauges with the world's target and safety net drawn on them), "In reality" (sourced facts), goals completed, Play again and Archive.

**Each game has a number** ("Game #4"). The counter, the archive and goals are saved in `localStorage` (wrapped in try/catch; the game works without it).

**Goals between games.** Three at a time, about worlds and gauges ("Reach a Pause world", "Keep Cohesion above 50 until the tipping point", "End a game with Confidence certain to ±8"). Completing one unlocks cards. 15 goals.

## Screen, interaction and accessibility

**Layout (mobile first):** the date and game number; the four gauges in v3's style (AI power with its tipping-point tick, Cooperation with its three zones, Confidence with its margin band, Cohesion); Europe's AI badge; the request on a paper card; the character's name; the two answer buttons.

**Choosing:** drag the card, or click an answer (first click previews, second confirms), or ← → / Enter / Escape. Answer buttons' accessible names say what they move; an `aria-live` region announces the changes in words with + / − and the date; gauges carry their values as text; contrast WCAG AA; `prefers-reduced-motion` fades the card; dialogs trap focus and close with Escape. An axe audit and whole games played with the keyboard alone run before merging.

**Look:** the visual charter of v3 (night background, deck panels, gauge colours: AI power amber, Cooperation zones red / amber / teal, Confidence teal, Cohesion violet; Big Shoulders Display, Public Sans, IBM Plex Mono and Newsreader from Google Fonts), around a paper card.

## Realism

As in Middle Power: every card and ending has a `basis` (AI 2027 section, CFG section or real source); milestones in AI 2027's order; effects follow the scenarios' cause and effect, sizes are tuned by the simulation; every real fact has a primary source; fiction is labelled; every interpretation is listed under "Realism notes" in the build notes.

## Validation

**Simulation targets** (2,000 seeded games per strategy, `npm run sim`):

| Strategy | Target |
| --- | --- |
| Always left, always right | Good endings below 10% |
| Random | Good endings 15–30%; early collapse 30–60% |
| Balancer (reads the visible gauges) | Good endings 55–80% |
| Thoughtful (favours the true Confidence, Cooperation and Cohesion) | Good endings 55–80%; early collapse below 15% |
| All | Each of the 13 endings in at least 1% of games for some strategy; both usual answers of every character in winning games; the tipping point never before AI 2027's milestones |

**Playtest**: five people, three games each, with the same four questions as the v3 and hybrid playtests.
