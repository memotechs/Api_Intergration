import 'dotenv/config';
import { defineConfig } from '@playwright/test';
import process from 'process';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'test-results/junit-results.xml' }],
  ],

  use: {
    baseURL: process.env.API_BASE_URL,
    extraHTTPHeaders: {
      Accept: 'application/json',
    },
  },
});