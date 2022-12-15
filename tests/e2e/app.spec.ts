import { expect, test } from '@playwright/test';

test.describe('App', () => {
	test('Should remain at "/".', async ({ page }) => {
		await page.goto('/');
		await expect(page).toHaveURL('/login?redirectTo=%2F');
	});
});
