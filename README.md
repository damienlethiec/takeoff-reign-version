# Takeoff: Reign Version

A short, replayable swipe game about AI governance. You are the EU's AI Envoy: people bring you requests one at a time, and you answer left or right. Every answer moves the world, on the same gauges as Takeoff: Middle Power v3: AI power (the clock), Cooperation between Washington and Beijing, Confidence in AI (an estimate whose true value is revealed at the end) and Cohesion, plus Europe's AI (Open or Dependent). If Cooperation, Confidence or Cohesion falls to 0, the world breaks early; otherwise the world you shaped decides which of ten endings you get at AI's tipping point, or at the end of 2030.

Play: https://damienlethiec.github.io/takeoff-reign-version/

- Design spec: [docs/SPEC.md](docs/SPEC.md)
- What the content rests on (AI 2027, CFG): [docs/SCENARIO_BASIS.md](docs/SCENARIO_BASIS.md)
- Exact rules, numbers and simulation results: [docs/DEVELOPER_NOTES.md](docs/DEVELOPER_NOTES.md)
- Build notes, realism notes, known issues: [docs/BUILD_NOTES.md](docs/BUILD_NOTES.md)

## Develop

```sh
npm install
npm run dev        # http://localhost:5173/takeoff-reign-version/  (?seed=N, ?notutorial, ?fresh)
npm test           # unit tests: content rules, engine, balance guardrails, UI helpers
npm run sim        # 2000 seeded games per strategy, checked against the spec's targets
npm run build      # production build in dist/, with a Content-Security-Policy meta tag
npm run lint
npm run test:e2e   # Playwright on the production build
npm run a11y       # axe on every screen + whole runs played with the keyboard alone
npm run shots      # screenshots of every screen into docs/screenshots/
```

Pushing to `main` deploys to GitHub Pages; every other branch gets a preview at `/takeoff-reign-version/preview/<branch>/` (Settings → Pages → Deploy from a branch, `gh-pages`, `/`). See `.github/workflows/deploy.yml`.

## Screens

| | | |
| --- | --- | --- |
| ![Title](docs/screenshots/phone-01-title.png) | ![A request](docs/screenshots/phone-03-card.png) | ![Preview of an answer](docs/screenshots/phone-04-preview.png) |
| ![The tipping point](docs/screenshots/phone-07-tipping.png) | ![An ending](docs/screenshots/phone-09-ending.png) | ![Archive](docs/screenshots/phone-11-archive.png) |
