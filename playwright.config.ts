import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    baseURL: 'http://52.28.100.129:3001',
  },
});
