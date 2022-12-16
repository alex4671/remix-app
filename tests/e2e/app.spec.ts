import { expect, test } from '@playwright/test';

test.describe('App', () => {
	test('Should redirect to "/login".', async ({ page }) => {
		await page.goto('/');
		await expect(page).toHaveURL('/login?redirectTo=%2F');
	});
});
