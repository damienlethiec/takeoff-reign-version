import { defineConfig, devices } from '@playwright/test';

// End-to-end test: builds the game, serves it on port 5185 and plays whole runs in Chromium.
const PORT = 5185;

export default defineConfig({
  testDir: 'e2e',
  timeout: 120_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['github']] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}/takeoff-reign-version/`,
    viewport: { width: 390, height: 844 },
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 } } }],
  webServer: {
    // the production build (with its Content-Security-Policy), served as GitHub Pages would
    command: `npx vite build --logLevel warn && npx vite preview --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/takeoff-reign-version/`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
