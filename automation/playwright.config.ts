import { defineConfig } from '@playwright/test';
declare const process: any;

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  retries: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports', open: 'never' }],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'https://api.fintech-sandbox.com',
    extraHTTPHeaders: {
      'Authorization': `Bearer ${process.env.API_TOKEN || 'test-token-123'}`,
      'Content-Type': 'application/json',
    },
  },
});