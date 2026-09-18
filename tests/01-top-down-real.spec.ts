import { test, expect } from '@playwright/test';

test('Top-Down REAL: Login -> Inventory -> Add Cart -> Check Cart', async ({ page }) => {

    // =====================================================
    // Layer I : A = Login จริง
    // =====================================================
    await test.step('Layer I - Login', async () => {
        await page.goto('/');

        await page.locator('#user-name').fill('standard_user');
        await page.locator('#password').fill('secret_sauce');
        await page.locator('#login-button').click();

        await expect(page).toHaveURL(/inventory\.html/);
    });

    // =====================================================
    // Layer II : B = Inventory จริง
    // =====================================================
    await test.step('Layer II - Inventory', async () => {
        await expect(page.locator('.inventory_list')).toBeVisible();
        await expect(page.locator('.inventory_item')).toHaveCount(6);
    });

    // =====================================================
    // Layer III : E = Add Product to Cart จริง
    // =====================================================
    await test.step('Layer III - Add Product to Cart', async () => {
        await page
            .locator('[data-test="add-to-cart-sauce-labs-backpack"]')
            .click();

        await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
    });

    // =====================================================
    // Layer III : F = Check Cart จริง
    // =====================================================
    await test.step('Layer III - Check Cart', async () => {
        await page.locator('.shopping_cart_link').click();

        await expect(page).toHaveURL(/cart\.html/);
        await expect(page.locator('.inventory_item_name'))
            .toHaveText('Sauce Labs Backpack');
    });
});
