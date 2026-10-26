// End-to-end: plays the production build (with its Content-Security-Policy) in Chromium through the real UI.
// Selectors use roles and accessible names wherever the markup offers them.

import { expect, test, type Page } from '@playwright/test';

const BAD_TEXT = /undefined|NaN|\[object Object\]/;

async function boot(page: Page, query: string) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console.error: ${m.text()}`);
  });
  // hermetic: no web fonts from the network
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ contentType: 'text/css', body: '' }));
  await page.goto(query);
  return errors;
}

const cardText = (page: Page) => page.locator('#card-text').textContent();
const screen = (page: Page) => page.locator('#app').getAttribute('data-screen');

/** Answers the current card with the mouse: first click previews, second confirms. */
async function answerWithMouse(page: Page, side: 'left' | 'right') {
  const buttons = page.locator('.answer');
  if ((await buttons.count()) === 1) {
    await buttons.click();
  } else {
    const b = page.locator(`.answer[data-side="${side}"]`);
    await b.click();
    await expect(b).toHaveAttribute('aria-pressed', 'true');
    await b.click();
  }
  await page.waitForTimeout(260);
}

test('the production build carries a CSP with no third-party origin (fonts are self-hosted)', async ({ page }) => {
  await boot(page, './');
  const csp = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content');
  expect(csp).toContain("script-src 'self'");
  expect(csp).toContain("font-src 'self';");
  expect(csp).not.toMatch(/https?:/);
});

test('a whole run with the mouse, to an ending, then Play again', async ({ page }) => {
  const errors = await boot(page, './?seed=3&fresh');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Takeoff');
  await page.getByRole('button', { name: /Start game #1/ }).click();
  expect(await screen(page)).toBe('game');
  let n = 0;
  while ((await screen(page)) === 'game' && n < 200) {
    await answerWithMouse(page, n % 2 ? 'left' : 'right');
    const body = await page.evaluate(() => document.body.innerText);
    expect(body).not.toMatch(BAD_TEXT);
    if ((await screen(page)) === 'game') expect(await cardText(page)).not.toBe(null);
    n++;
  }
  expect(await screen(page)).toBe('ending');
  await expect(page.locator('#end-h')).toBeFocused();
  await expect(page.getByRole('heading', { name: 'What decided it' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'What you could not see' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'The world at the end' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'In reality' })).toBeVisible();
  await expect(page.locator('.reveal')).toContainText('The truth was');
  // every link in the ending opens safely
  for (const a of await page.locator('main a').all()) {
    expect(await a.getAttribute('href')).toMatch(/^https:\/\//);
    expect(await a.getAttribute('rel')).toContain('noopener');
  }
  await page.getByRole('button', { name: /Play game #2/ }).click();
  await expect(page.locator('.game-n')).toHaveText('Game #2');
  expect(errors).toEqual([]);
});

test('click previews, a second click confirms; the preview shows marks and is announced', async ({ page }) => {
  await boot(page, './?seed=12&fresh&notutorial');
  await page.getByRole('button', { name: /Start game/ }).click();
  const first = await cardText(page);
  const right = page.locator('.answer[data-side="right"]');
  await expect(right).toHaveAccessibleName(/Will change: /);
  await right.click();
  await expect(right).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.g-mark.on').first()).toBeVisible();
  await expect(page.locator('#said')).toContainText('Selected:');
  expect(await cardText(page)).toBe(first);
  await right.click();
  await page.waitForTimeout(300);
  expect(await cardText(page)).not.toBe(first);
  await expect(page.locator('#said')).toContainText(/up|down|Nothing/);
  await expect(page.locator('#date')).toHaveText(/2027/);
});

test('keyboard: arrows pick, Enter confirms, Escape cancels; shortcuts ignore other controls', async ({ page }) => {
  await boot(page, './?seed=4&fresh&notutorial');
  await page.getByRole('button', { name: /Start game/ }).click();
  await expect(page.locator('#card')).toBeFocused();
  const first = await cardText(page);
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('.answer[data-side="left"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.answer[data-side="left"]')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('.answer[aria-pressed="true"]')).toHaveCount(0);
  // focus on the Menu button: arrows do nothing
  await page.getByRole('button', { name: 'Menu' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.answer[aria-pressed="true"]')).toHaveCount(0);
  await page.locator('#card').focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
  expect(await cardText(page)).not.toBe(first);
  await expect(page.locator('#card')).toBeFocused();
});

test('dragging the card past the threshold answers it; a short drag cancels', async ({ page }) => {
  await boot(page, './?seed=9&fresh&notutorial');
  await page.getByRole('button', { name: /Start game/ }).click();
  const first = await cardText(page);
  const box = (await page.locator('#card').boundingBox())!;
  const y = box.y + box.height / 2;
  const x = box.x + box.width / 2;
  // short drag: snaps back
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + 40, y, { steps: 4 });
  await expect(page.locator('#card')).toHaveClass(/lean-r/);
  await page.mouse.up();
  await page.waitForTimeout(250);
  expect(await cardText(page)).toBe(first);
  // long drag: answers
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x - 180, y, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(350);
  expect(await cardText(page)).not.toBe(first);
});

test('Learn more opens a dialog with its source, closes with Escape and returns focus', async ({ page }) => {
  await boot(page, './?seed=2&fresh&notutorial');
  await page.getByRole('button', { name: /Start game/ }).click();
  for (let i = 0; i < 12 && !(await page.locator('.learn-btn').count()); i++) await answerWithMouse(page, i % 2 ? 'left' : 'right');
  const learn = page.getByRole('button', { name: /Learn more/ });
  await learn.click();
  const dlg = page.getByRole('dialog', { name: 'Learn more' });
  await expect(dlg).toBeVisible();
  await expect(dlg.getByRole('link')).toHaveAttribute('target', '_blank');
  await expect(dlg.getByRole('link')).toHaveAttribute('rel', /noopener/);
  await page.keyboard.press('Escape');
  await expect(dlg).toHaveCount(0);
  await expect(learn).toBeFocused();
});

test('the archive lists all 13 endings, reached ones first-class', async ({ page }) => {
  await boot(page, './?fresh');
  await page.getByRole('button', { name: /Archive/ }).click();
  await expect(page.locator('#arc-h')).toBeFocused();
  await expect(page.locator('.tile')).toHaveCount(13);
  await expect(page.locator('.tile.locked')).toHaveCount(13);
});

test('works when localStorage is blocked', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new Error('blocked');
      },
    });
  });
  const errors = await boot(page, './?seed=6');
  await page.getByRole('button', { name: /Start game #1/ }).click();
  for (let i = 0; i < 5; i++) await answerWithMouse(page, i % 2 ? 'left' : 'right');
  expect(await screen(page)).toBe('game');
  expect(errors).toEqual([]);
});

test('the game counter and the archive persist between visits', async ({ page }) => {
  await boot(page, './?seed=7&notutorial');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole('button', { name: /Start game #1/ }).click();
  await page.getByRole('button', { name: 'Menu' }).click();
  await page.getByRole('button', { name: 'Give up this game' }).click();
  await expect(page.getByRole('button', { name: /Start game #2/ })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: /Start game #2/ })).toBeVisible();
});
