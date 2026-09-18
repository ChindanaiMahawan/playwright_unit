import {
    test,
    expect,
    BrowserContext,
    Page,
} from '@playwright/test';

// =====================================================
// DRIVER A
// ทำหน้าที่แทน Login Layer ด้านบน
// ไม่กรอก username/password ผ่านหน้า Login
// =====================================================
async function driverOpenCart(
    context: BrowserContext
): Promise<Page> {

    await context.addCookies([
        {
            name: 'session-username',
            value: 'standard_user',
            domain: 'www.saucedemo.com',
            path: '/',
        },
    ]);

    const page = await context.newPage();
    await page.goto('https://www.saucedemo.com/cart.html');

    await expect(page.locator('.cart_contents_container')).toBeVisible();

    return page;
}

test('Bottom-Up DRIVER: Driver A -> B Cart -> E Checkout', async ({ browser }) => {

    const context = await browser.newContext();

    try {
        // ===================================================
        // Driver A เรียก Layer ด้านล่าง
        // ===================================================
        const page = await driverOpenCart(context);

        // ===================================================
        // B = Cart จริง (ตอนนี้ยังไม่มีสินค้า ควรว่าง)
        // ===================================================
        await expect(page.locator('.cart_item')).toHaveCount(0);

        // ===================================================
        // E = Checkout จริง
        // ===================================================
        await page.locator('[data-test="checkout"]').click();

        await expect(page).toHaveURL(/checkout-step-one\.html/);

    } finally {
        await context.close();
    }
});