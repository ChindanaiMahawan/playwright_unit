import { test, expect, Page } from '@playwright/test';

async function loginReal(page: Page) {
    await page.goto('https://www.saucedemo.com/');
    await page.locator('#user-name').fill('standard_user');
    await page.locator('#password').fill('secret_sauce');
    await page.locator('#login-button').click();
    await expect(page).toHaveURL(/inventory\.html/);
}

test('Sandwich REAL: Top branch + Bottom-focused branch', async ({ browser }) => {

    const topContext = await browser.newContext();
    const bottomContext = await browser.newContext();

    const topPage = await topContext.newPage();
    const bottomPage = await bottomContext.newPage();

    try {
        await Promise.all([

            // =================================================
            // TOP-DOWN BRANCH
            // A REAL -> B REAL
            // =================================================
            (async () => {
                await loginReal(topPage);

                await expect(topPage.locator('.inventory_list'))
                    .toBeVisible();

                await expect(topPage.locator('.inventory_item'))
                    .toHaveCount(6);
            })(),

            // =================================================
            // BOTTOM-FOCUSED BRANCH
            // ใช้ Module จริงทั้งหมด
            // Focus ที่ B -> E -> F
            // =================================================
            (async () => {
                // A จริงเป็น prerequisite เพราะ SauceDemo เป็น Black-box UI
                await loginReal(bottomPage);

                // B REAL -> E REAL
                await bottomPage
                    .locator('[data-test="add-to-cart-sauce-labs-backpack"]')
                    .click();

                await expect(bottomPage.locator('.shopping_cart_badge'))
                    .toHaveText('1');

                // E -> F REAL
                await bottomPage.locator('.shopping_cart_link').click();

                await expect(bottomPage.locator('.inventory_item_name'))
                    .toHaveText('Sauce Labs Backpack');
            })(),
        ]);

    } finally {
        await Promise.all([
            topContext.close(),
            bottomContext.close(),
        ]);
    }
});
