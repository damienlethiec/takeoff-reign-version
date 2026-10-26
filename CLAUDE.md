# Takeoff: Reign Version — notes for coding agents

A short, replayable Reigns-style swipe game about AI governance. The player is the EU's AI Envoy: one request at a time, left or right; four gauges die at 0 or 100; hidden tracks decide one of ten final endings at AI's tipping point or in December 2030. All game text is in English; the team discusses in French. Sister project (same team, same stack): `damienlethiec/takeoff-middle-power`.

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

- **Balance changes go through the simulation.** Run `npm run sim` before and after; record the change, the old value and the reason in the "Tuning changes" table of `docs/DEVELOPER_NOTES.md`. Targets: always-left / always-right die within 20 cards in > 90%; random survives < 20% with a median run of 20–30 cards; balancer survives > 60% with 25–45% good endings; thoughtful 55–80% good; every one of the 18 endings ≥ 1% for some strategy; both answers of every character appear in winning runs.
- **Refactors must not change behaviour**: the seeded `npm run sim` output must stay byte-identical.
- **Every answer costs something**: each side of a two-answer card lowers at least one gauge or hidden track. Right goes along with the request, left refuses (see the conventions in the developer notes).
- **Text limits**: card text ≤ 30 words, answer labels ≤ 4 words, Learn more ≤ 40 words, plain English. Tests enforce them.
- **Hidden tracks** (Cooperation, Safety, Europe's AI, Steadiness, takeoff speed) never appear as numbers before the end: not in previews, announcements or texts. Year in review and characters hint in words only.

## Realism (top priority for content)

- **Every card and ending has a `basis`** `{ kind: 'ai2027' | 'cfg' | 'real', ref }`: an AI 2027 section or a CFG section listed in `src/data/basis.ts`, or a key of `src/data/sources.ts`. A test fails otherwise.
- **Milestones come in AI 2027's order** (`src/data/milestones.ts`); their dates vary with the hidden takeoff speed. A card tied to a milestone uses `when.after` and appears only after it.
- **Effect directions follow the scenarios' cause and effect**; magnitudes are tuned by the simulation.
- **Every real-world fact shown has a primary source** in `sources.ts`, checked by reading it; if it cannot be verified, drop it. Fiction (OpenBrain, DeepCent, NimbusAI, every event after 2026) is always labelled: story news starts "In this story", scenario Learn more lines start "In AI 2027" or "In the CFG scenarios".
- **Early endings are plausible political outcomes** with a real mechanism and a sourced precedent. No overnight bans, no apocalypse before the tipping point.
- List every interpretation or stretch under "Realism notes" in `docs/BUILD_NOTES.md`, for Louis and the fact-check.
- Fonts stay on Google Fonts; the production CSP allows `fonts.googleapis.com` and `fonts.gstatic.com` only.

## Security

Content is static, but treat every string reaching `innerHTML` as untrusted: escape it with `esc()`, render only http(s) URLs as links (`extLink()`), keep `rel="noopener"` on `target="_blank"`. CI permissions stay least-privilege and third-party actions stay pinned to commit SHAs.

## Accessibility (required for every UI change)

- Two real answer buttons are always present: the first click previews (marks on the gauges, `aria-pressed`, an announcement), a second click confirms. Dragging the card is never the only way.
- Each answer's accessible name says what it moves: "Sign it. Will change: Labs a lot, Allies a little."
- Keys: ← → pick a side and preview, Enter confirms, Escape cancels. They never fire while focus is on another control, and they are listed on screen.
- After an answer, the `aria-live` region announces the changes once, in words with + / −, and the date; focus moves to the new card.
- Gauges carry their value as text; never colour alone. Contrast at least WCAG AA.
- `prefers-reduced-motion`: the card fades instead of flying, nothing pulses.
- Ending and archive screens move focus to their heading; dialogs trap focus, close with Escape and return focus to their trigger.
- Check with `npm run test:e2e` and `npm run a11y` before merging.

## Branches and previews

Every branch is built and published automatically: `main` at https://damienlethiec.github.io/takeoff-reign-version/, any other branch at `https://damienlethiec.github.io/takeoff-reign-version/preview/<branch>/` (needs Settings → Pages → Deploy from branch `gh-pages`). Deleting a branch removes its preview.
