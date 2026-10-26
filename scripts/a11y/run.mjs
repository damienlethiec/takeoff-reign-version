// Accessibility check: plays whole runs with the keyboard alone (no mouse) and runs axe on every screen.
//   npm run a11y                                   starts vite on port 5186 and stops it at the end
//   A11Y_URL=http://localhost:5173/takeoff-reign-version/ npm run a11y   reuses a running server
//   A11Y_SHOTS=/some/dir npm run a11y              also saves a screenshot of each screen
// Runs: seed 5 at 1280×800, and seed 8 with prefers-reduced-motion at 390×844 (a phone), each until an
// ending, then Play again. Fails on any serious or critical axe violation, console error, focus escaping a
// dialog, a shortcut firing from another control, a missing announcement, or horizontal scrolling.

import fs from 'node:fs';
import path from 'node:path';
import { axe, focused, loadPlaywright, newPage, screenOf, settle, startServer, tabTo } from './lib.mjs';

const PORT = Number(process.env.A11Y_PORT ?? 5186);
const SHOTS = process.env.A11Y_SHOTS;
const RUNS = [
  { name: 'keyboard-desktop', seed: 5, viewport: { width: 1280, height: 800 }, reducedMotion: 'no-preference' },
  { name: 'keyboard-phone-reduced-motion', seed: 8, viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' },
];

async function playRun(browser, base, run) {
  const { page, errors, context } = await newPage(browser, run);
  const problems = [];
  const audits = {};
  const log = [];
  const done = new Set();
  const fail = (m) => problems.push(m);
  const once = (k) => (done.has(k) ? false : (done.add(k), true));
  const press = async (k) => {
    await page.keyboard.press(k);
  };
  const wait = (ms = 300) => page.waitForTimeout(ms);
  const is = (sel) => page.evaluate((s) => !!document.activeElement?.matches(s), sel);
  const said = () => page.evaluate(() => document.querySelector('#said')?.textContent ?? '');

  async function audit(name) {
    if (audits[name]) return;
    await settle(page, 400);
    audits[name] = await axe(page);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (overflow > 1) fail(`${name}: page is ${overflow}px wider than the viewport`);
    if (SHOTS) await page.screenshot({ path: path.join(SHOTS, `${run.name}-${name}.png`) });
  }

  async function checkTrap(name) {
    const n = await page.evaluate(() => document.querySelector('.dialog')?.querySelectorAll('button, a[href]').length ?? 0);
    for (let i = 0; i < n + 2; i++) {
      await press(i % 3 === 2 ? 'Shift+Tab' : 'Tab');
      const st = await page.evaluate(() => {
        const a = document.activeElement;
        const d = document.querySelector('.dialog');
        const cs = a ? getComputedStyle(a) : null;
        return { inside: !!d && d.contains(a), visible: cs ? cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2 : false };
      });
      if (!st.inside) fail(`${name}: Tab moved focus out of the dialog (${await focused(page)})`);
      else if (!st.visible) fail(`${name}: no visible focus style on ${await focused(page)}`);
    }
  }

  /** Opens a dialog from a control reached with Tab, checks it, closes it with Escape, checks focus came back. */
  async function dialogFrom(sel, name) {
    if (!(await tabTo(page, sel))) return fail(`could not Tab to ${sel}`);
    await press('Enter');
    await wait(250);
    const scr = await screenOf(page);
    if (!scr.startsWith('dialog')) return fail(`${name}: Enter on ${sel} did not open a dialog (${scr})`);
    const ok = await page.evaluate(() => {
      const d = document.querySelector('.dialog');
      const id = d?.getAttribute('aria-labelledby');
      return d?.getAttribute('role') === 'dialog' && d.getAttribute('aria-modal') === 'true' && !!id && !!document.getElementById(id) && d.contains(document.activeElement);
    });
    if (!ok) fail(`${name}: not a labelled modal dialog with focus inside (${await focused(page)})`);
    await audit(name);
    await checkTrap(name);
    await press('Escape');
    await wait(200);
    if ((await screenOf(page)).startsWith('dialog')) fail(`${name}: Escape did not close the dialog`);
    if (!(await is(sel))) fail(`${name}: focus did not return to ${sel} (${await focused(page)})`);
  }

  /** The side a balancing player picks (reads the engine in the page; the choice is then made with keys). */
  const choose = () =>
    page.evaluate(async () => {
      const eng = await import('/takeoff-reign-version/src/engine/index.ts');
      const s = window.__reign.state;
      const c = eng.cardOf(s);
      if (!c.right) return 'only';
      const cost = (side) => {
        const e = eng.answerOf(c, side).effects;
        // a careful player: keeps the three pillars high (reads the true effects, like the simulation's thoughtful player)
        const v = (k) => Math.min(100, Math.max(0, s.w[k] + (e[k] ?? 0)));
        return ['cooperation', 'truth', 'cohesion'].reduce((a, k) => a + (100 - v(k)) ** 2, 0) + (v('confidence') <= 5 ? 1e6 : 0);
      };
      return cost('left') <= cost('right') ? 'left' : 'right';
    });

  await page.goto(`${base}?seed=${run.seed}&fresh`);
  await wait(300);
  await audit('title');
  if (!(await is('#title-h'))) fail(`title: focus is not on the title heading (${await focused(page)})`);
  await dialogFrom('[data-act="help"]', 'help-dialog');
  if (!(await tabTo(page, '[data-act="start"]', { back: true }))) fail('could not Tab to Start');
  await press('Enter');
  await wait(300);
  if ((await screenOf(page)) !== 'game') fail('Enter on Start did not start the game');

  let cards = 0;
  for (let step = 0; step < 220; step++) {
    const scr = await screenOf(page);
    if (scr !== 'game') break;
    cards++;
    const kind = await page.evaluate(() => [...(document.querySelector('#card')?.classList ?? [])].find((c) => c.startsWith('kind-'))?.slice(5));
    if (!(await is('#card'))) fail(`card ${cards}: focus is not on the new card (${await focused(page)})`);
    if (once(`kind-${kind}`)) {
      log.push(`  first ${kind} card: ${(await page.evaluate(() => document.querySelector('#card-text')?.textContent ?? '')).slice(0, 70)}`);
      await audit(`game-${kind}`);
    }
    const side = await choose();
    if (side === 'only') {
      await press(step % 2 ? 'Enter' : 'ArrowRight');
      if (!(step % 2)) {
        if (!(await is('.answer'))) fail('→ on a one-button card did not focus its button');
        await press('Enter');
      }
    } else {
      // names say what will move
      const names = await page.evaluate(() => [...document.querySelectorAll('.answer')].map((b) => b.getAttribute('aria-label') ?? ''));
      if (!names.every((n) => /Will change|Changes nothing/.test(n))) fail(`answer names do not say what moves: ${names.join(' | ')}`);
      if (once('shortcut-guard')) {
        // shortcuts must not fire while focus is on another control (the Menu button)
        if (await tabTo(page, '[data-act="menu"]', { back: true })) {
          await press('ArrowRight');
          await wait(100);
          if (await page.evaluate(() => !!document.querySelector('.answer[aria-pressed="true"]'))) fail('→ fired while focus was on the Menu button');
          await dialogFrom('[data-act="menu"]', 'menu-dialog');
        } else fail('could not Tab to the Menu button');
        await page.evaluate(() => document.querySelector('#card')?.focus());
      }
      if (!done.has('learn') && (await page.evaluate(() => !!document.querySelector('.learn-btn'))) && once('learn')) {
        await dialogFrom('.learn-btn', 'learn-dialog');
        await page.evaluate(() => document.querySelector('#card')?.focus());
      }
      await press(side === 'left' ? 'ArrowLeft' : 'ArrowRight');
      await wait(80);
      if (!(await is(`.answer[data-side="${side}"][aria-pressed="true"]`))) fail(`arrow did not select and focus the ${side} answer (${await focused(page)})`);
      if (once('preview')) {
        await wait(100);
        if (!/Selected: .* Will change|Selected: .* Changes nothing/.test(await said())) fail(`the preview was not announced ("${await said()}")`);
        if (!(await page.evaluate(() => document.querySelectorAll('.g-mark.on').length))) fail('no gauge marks during the preview');
        await audit('game-preview');
        await press('Escape');
        await wait(80);
        if (await page.evaluate(() => !!document.querySelector('.answer[aria-pressed="true"]'))) fail('Escape did not cancel the preview');
        await press(side === 'left' ? 'ArrowLeft' : 'ArrowRight');
      }
      await press('Enter');
    }
    await wait(run.reducedMotion === 'reduce' ? 260 : 340);
    if ((await screenOf(page)) === 'game' && step > 0) {
      const t = await said();
      if (!/up|down|certain|now (Open|Dependent)|Nothing you can see/.test(t)) fail(`no announcement after an answer ("${t}")`);
      if (/truth|true value|safety|takeoff|\b(slow|fast) pace/i.test(t)) fail(`an announcement leaked a hidden value ("${t}")`);
    }
  }

  if (!done.has('learn')) fail('never opened a Learn more dialog');
  if ((await screenOf(page)) !== 'ending') fail(`did not reach the ending (screen ${await screenOf(page)})`);
  else {
    log.push(`ENDING after ${cards} cards: ${await page.evaluate(() => document.querySelector('#end-h')?.textContent)}`);
    if (!(await is('#end-h'))) fail(`ending: focus is not on its heading (${await focused(page)})`);
    await audit('ending');
    if (!(await tabTo(page, '[data-act="archive"]'))) fail('ending: could not Tab to Archive');
    await press('Enter');
    await wait(250);
    if (!(await is('#arc-h'))) fail(`archive: focus is not on its heading (${await focused(page)})`);
    await audit('archive');
    if (!(await tabTo(page, '[data-act="back-ending"]'))) fail('archive: could not Tab back to the ending');
    await press('Enter');
    await wait(250);
    if (!(await tabTo(page, '[data-act="again"]'))) fail('ending: could not Tab to Play again');
    await press('Enter');
    await wait(300);
    if ((await screenOf(page)) !== 'game' || !/Game #2/.test(await page.evaluate(() => document.querySelector('.game-n')?.textContent ?? ''))) fail('Play again did not start game #2');
  }
  await context.close();
  return { problems, errors, audits, log };
}

const { chromium } = loadPlaywright();
const server = await startServer(PORT);
const browser = await chromium.launch();
let bad = 0;
try {
  if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
  for (const run of RUNS) {
    const r = await playRun(browser, server.url, run);
    console.log(`\n=== ${run.name}: seed ${run.seed}, ${run.viewport.width}×${run.viewport.height}, reduced motion: ${run.reducedMotion}`);
    console.log(r.log.join('\n'));
    console.log('axe, per screen (serious+critical / all):');
    for (const [name, v] of Object.entries(r.audits)) {
      const sc = v.filter((x) => x.impact === 'serious' || x.impact === 'critical');
      bad += sc.length;
      console.log(`  ${name.padEnd(20)} ${sc.length} / ${v.length}${v.length ? `  ${v.map((x) => `${x.id}(${x.impact},${x.count})`).join(' ')}` : ''}`);
      for (const x of sc) for (const n of x.nodes) console.log(`      ${x.id}: ${n}`);
    }
    for (const p of r.problems) console.log(`  PROBLEM ${p}`);
    for (const e of r.errors) console.log(`  ERROR ${e}`);
    bad += r.problems.length + r.errors.length;
  }
} finally {
  await browser.close();
  server.stop();
}
console.log(bad ? `\nFAILED: ${bad} issue(s)` : '\nOK: no serious or critical axe violation, keyboard-only runs completed');
process.exit(bad ? 1 : 0);
