# Takeoff: Reign Version — notes for coding agents

A short, replayable Reigns-style swipe game about AI governance. The player is the EU's AI Envoy: one request at a time, left or right. The gauges are the world's, the same as Middle Power v3: AI power (the clock, tipping point at 80), Cooperation (Pause / Race / Rupture zones), Confidence (an estimate ± margin hiding a true value), Cohesion, and the Europe's AI badge. Cooperation, Confidence or Cohesion at 0 ends the game early (a world catastrophe, 3 endings); otherwise the v3 tree picks one of ten final endings at the tipping point or in December 2030. All game text is in English; the team discusses in French. Sister project (same team, same stack): `damienlethiec/takeoff-middle-power`.

## Read first

- `docs/SPEC.md`: player-facing design. Source of truth for intent.
- `docs/SCENARIO_BASIS.md`: what the content rests on (AI 2027's milestones in order, CFG's five worlds).
- `docs/DEVELOPER_NOTES.md`: exact rules and numbers, simulation results, every tuning change and why.
- `docs/BUILD_NOTES.md`: decisions, realism notes, known issues.
- `src/engine/types.ts` and the comment at the top of `src/engine/index.ts`: the contract between engine and UI.

## Layout

- `src/engine/`: pure functions only. No DOM, no `Math.random` (the seeded RNG lives in `GameState.rng`), never mutate inputs.
- `src/data/`: declarative content: `cards/` (requests, news, follow-ups, The AI, Léa, tutorial, reviews, finale), `endings.ts`, `goals.ts`, `characters.ts`, `milestones.ts`, `basis.ts`, `sources.ts`. **All numbers live in `src/data/tuning.ts`.**
- `src/ui/`: string-template DOM rendering (`app.ts`), portraits (`portraits.ts`), escaping (`html.ts`), localStorage wrapped in try/catch (`storage.ts`).
- `scripts/sim.ts` + `scripts/strategies.ts`: seeded simulation. `scripts/a11y/`: keyboard-only runs + axe. `scripts/shots.mjs`: screenshots.
- `tests/`: Vitest (content rules, engine, balance guardrails, UI helpers). `e2e/`: Playwright on the production build.

## Commands

```sh
npm run dev       # local server at /takeoff-reign-version/  (?seed=N fixes the run, ?notutorial, ?fresh ignores saved progress)
npm test          # unit tests
npm run sim       # balance check against the spec's targets (npm run sim -- 2000 all: every goal unlocked)
npm run build     # typecheck + production build (with a CSP meta tag)
npm run lint
npm run test:e2e  # Playwright, production build (uses the Chromium already installed; never run playwright install here)
npm run a11y      # axe on every screen + whole runs played with the keyboard alone
npm run shots     # screenshots of every screen at 390×844 and 1280×800 into docs/screenshots/
```

## Rules of the house

- **Balance changes go through the simulation.** Run `npm run sim` before and after; record the change, the old value and the reason in the "Tuning changes" table of `docs/DEVELOPER_NOTES.md`. Targets: always-left / always-right < 10% good endings; random 15–30% good and 30–60% early collapses; balancer and thoughtful 55–80% good; thoughtful < 15% early collapses; every one of the 13 endings ≥ 1% for some strategy; both answers of every character appear in winning games; the tipping point never before AI 2027's milestones.
- **Refactors must not change behaviour**: the seeded `npm run sim` output must stay byte-identical.
- **Same model as v3**: gauge names, start values, zones and ending thresholds match `takeoff-middle-power` v3's `tuning.ts`. Do not reintroduce envoy-career gauges; endings, goals and the archive talk about the world.
- **Every answer costs something**: each side of a two-answer card lowers Cooperation, Confidence (estimate or truth), Cohesion or Europe's AI, widens the margin, or speeds AI up. Right goes along with the request, left refuses (see the conventions in the developer notes).
- **Text limits**: card text ≤ 30 words, answer labels ≤ 4 words, Learn more ≤ 40 words, plain English. Tests enforce them.
- **Hidden values** (the true Confidence, the lean behind Europe's AI badge, the takeoff speed) never appear as numbers before the end: not in previews, announcements or texts. The Confidence gauge shows only the estimate ± margin. Year in review and characters hint in words only.

## Realism (top priority for content)

- **Every card and ending has a `basis`** `{ kind: 'ai2027' | 'cfg' | 'real', ref }`: an AI 2027 section or a CFG section listed in `src/data/basis.ts`, or a key of `src/data/sources.ts`. A test fails otherwise.
- **Milestones come in AI 2027's order** (`src/data/milestones.ts`); their dates vary with the hidden takeoff speed. A card tied to a milestone uses `when.after` and appears only after it.
- **Effect directions follow the scenarios' cause and effect**; magnitudes are tuned by the simulation.
- **Every real-world fact shown has a primary source** in `sources.ts`, checked by reading it; if it cannot be verified, drop it. Fiction (OpenBrain, DeepCent, NimbusAI, every event after 2026) is always labelled: story news starts "In this story", scenario Learn more lines start "In AI 2027" or "In the CFG scenarios".
- **Early endings are world catastrophes told soberly** (open conflict, a runaway AI incident, society breaking down), each with a basis and a sourced precedent. No apocalypse before the tipping point: a crisis that closes the story.
- List every interpretation or stretch under "Realism notes" in `docs/BUILD_NOTES.md`, for Louis and the fact-check.
- Fonts are self-hosted via Fontsource npm packages (`src/ui/fonts.css`; v3's families: Big Shoulders Display, Public Sans, IBM Plex Mono, Newsreader; team decision of 26 Oct, for GDPR): the production CSP has `font-src 'self'` and the game makes no third-party request. Never load fonts or anything else from a CDN. The look follows v3's visual charter (colour tokens and gauge styling in `src/ui/styles.css`).

## Security

Content is static, but treat every string reaching `innerHTML` as untrusted: escape it with `esc()`, render only http(s) URLs as links (`extLink()`), keep `rel="noopener"` on `target="_blank"`. CI permissions stay least-privilege and third-party actions stay pinned to commit SHAs.

## Accessibility (required for every UI change)

- Two real answer buttons are always present: the first click previews (marks on the gauges, `aria-pressed`, an announcement), a second click confirms. Dragging the card is never the only way.
- Each answer's accessible name says what it moves: "Sign it. Will change: Cooperation a lot, Cohesion a little."
- Keys: ← → pick a side and preview, Enter confirms, Escape cancels. They never fire while focus is on another control, and they are listed on screen.
- After an answer, the `aria-live` region announces the changes once, in words with + / −, and the date; focus moves to the new card.
- Gauges carry their value as text; never colour alone. Contrast at least WCAG AA.
- `prefers-reduced-motion`: the card fades instead of flying, nothing pulses.
- Ending and archive screens move focus to their heading; dialogs trap focus, close with Escape and return focus to their trigger.
- Check with `npm run test:e2e` and `npm run a11y` before merging.

## Branches and previews

Every branch is built and published automatically: `main` at https://damienlethiec.github.io/takeoff-reign-version/, any other branch at `https://damienlethiec.github.io/takeoff-reign-version/preview/<branch>/` (needs Settings → Pages → Deploy from branch `gh-pages`). Deleting a branch removes its preview.
