import { expect, test } from '@playwright/test';

test('login page renders setup/login shell', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByText(/Dompet Pribadi/)).toBeVisible();
});
