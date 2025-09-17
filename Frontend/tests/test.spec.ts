import { test, expect } from '@playwright/test';
import config from '../playwright.config';

test('test', async ({ page }) => {
  await page.goto(config.baseURL);
});
