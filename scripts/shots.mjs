// Screenshots of every screen at 390×844 (phone) and 1280×800 (desktop), from the dev server.
//   npm run shots                 → docs/screenshots/
//   SHOTS_DIR=/tmp/x npm run shots
// Plays through the real UI: clicks and keys only; the dev hook (window.__reign) is used to find a seed
// that reaches the tipping point and to read the current card, never to change the state.

import fs from 'node:fs';
import path from 'node:path';
import { loadPlaywright, startServer } from './a11y/lib.mjs';

const OUT = process.env.SHOTS_DIR ?? path.resolve('docs/screenshots');
const FONTS = /fonts\.(googleapis|gstatic)\.com/;
fs.mkdirSync(OUT, { recursive: true });
const { chromium } = loadPlaywright();
const server = await startServer(5187);
const browser = await chromium.launch();

async function shoot(viewport, tag) {
  const ctx = await browser.newContext({ viewport, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  // no network here: stub the web fonts (the deployed game loads them from Google Fonts)
  await page.route(FONTS, (r) => r.fulfill({ contentType: 'text/css', body: '' }));
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  const snap = async (name) => {
    await page.waitForTimeout(350);
    await page.screenshot({ path: path.join(OUT, `${tag}-${name}.png`) });
  };
  await page.goto(`${server.url}?seed=21&fresh`);
  await snap('01-title');
  await page.getByRole('button', { name: /Start your term/ }).click();
  await snap('02-tutorial');
  for (let i = 0; i < 3; i++) {
    await page.locator('.answer').last().click();
    await page.locator('.answer').last().click();
    await page.waitForTimeout(250);
  }
  await snap('03-card');
  await page.locator('.answer').first().click();
  await snap('04-preview');
  await page.keyboard.press('Escape');
  // play with a balancing policy until a Learn more button shows, then open it
  // a balancing player: picks the answer that keeps the four gauges nearest 50 (reads the engine in the page)
  const step = async () => {
    const side = await page.evaluate(async () => {
      const eng = await import('/takeoff-reign-version/src/engine/index.ts');
      const s = window.__reign.state;
      if (!s || s.phase === 'over') return 'none';
      const c = eng.cardOf(s);
      if (!c.right) return 'only';
      const cost = (side) => {
        const e = eng.answerOf(c, side).effects;
        return ['labs', 'citizens', 'allies', 'oversight'].reduce((a, g) => a + (Math.min(100, Math.max(0, s.gauges[g] + (e[g] ?? 0))) - 50) ** 2, 0) - 40 * ((e.safety ?? 0) + (e.coop ?? 0));
      };
      return cost('left') <= cost('right') ? 'left' : 'right';
    });
    if (side === 'none') return;
    const b = side === 'only' ? page.locator('.answer') : page.locator(`.answer[data-side="${side}"]`);
    await b.click();
    if (side !== 'only') await b.click();
    await page.waitForTimeout(260);
  };
  let learnShot = false;
  for (let i = 0; i < 6 && !learnShot; i++) {
    if (await page.locator('.learn-btn').count()) {
      await page.locator('.learn-btn').click();
      await snap('05-learn-more');
      await page.keyboard.press('Escape');
      learnShot = true;
    } else await step();
  }
  await page.getByRole('button', { name: 'Menu' }).click();
  await snap('06-menu');
  await page.keyboard.press('Escape');
  // play on; capture a delta right after an answer, a review, the tipping point and the ending
  const seen = new Set();
  for (let i = 0; i < 160; i++) {
    if ((await page.locator('#app').getAttribute('data-screen')) === 'ending') break;
    const kind = await page.evaluate(() => [...(document.querySelector('#card')?.classList ?? [])].find((c) => c.startsWith('kind-')));
    for (const k of ['kind-news', 'kind-review', 'kind-ai', 'kind-lea', 'kind-tipping', 'kind-final', 'kind-followup'])
      if (kind === k && !seen.has(k)) {
        seen.add(k);
        await snap(`07-${k.slice(5)}`);
      }
    await step();
    if (i === 2) await snap('08-after-answer');
  }
  await snap('09-ending');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await snap('10-ending-bottom');
  await page.getByRole('button', { name: 'Archive' }).click();
  await snap('11-archive');
  await ctx.close();
  return errors;
}

const errs = [];
try {
  errs.push(...(await shoot({ width: 390, height: 844 }, 'phone')), ...(await shoot({ width: 1280, height: 800 }, 'desktop')));
} finally {
  await browser.close();
  server.stop();
}
console.log(errs.length ? `errors:\n${errs.join('\n')}` : `screenshots saved in ${OUT}`);
