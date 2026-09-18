# Integration Testing ด้วย Playwright: ตัวอย่าง 6 ไฟล์ที่ตรงกับโค้ดปัจจุบัน

เอกสารฉบับนี้ปรับปรุงให้ **ตรงกับไฟล์ทดสอบจริง 01–06** ที่ใช้อยู่ในปัจจุบัน โดยใช้เว็บไซต์ SauceDemo เป็นกรณีศึกษาเพื่ออธิบาย Integration Testing แบบ

1. Top-Down Integration Testing  
2. Bottom-Up Integration Testing  
3. Sandwich / Hybrid Integration Testing

ในแต่ละ Strategy มีตัวอย่าง 2 แบบ คือ

- **REAL**: ใช้ Module จริงทั้งหมดเท่าที่ Black-box UI ของ SauceDemo อนุญาต  
- **Driver / Stub**: ใช้ Test Double เพื่อสาธิตหลักการ Classical Integration Testing

> **ข้อจำกัดสำคัญของตัวอย่าง:** SauceDemo เป็นระบบภายนอกแบบ Black-box และเป็น SPA (Single-Page Application) เนื้อหา Inventory ถูก render ด้วย client-side JavaScript หลัง Login ดังนั้นไฟล์ `02` และฝั่ง Top-Down ของไฟล์ `06` จึงใช้ `page.setContent()` เพื่อแทน DOM ของ Inventory ด้วย Stub HTML หลัง Login จริง แทนการใช้ `page.route('**/inventory.html*')` ซึ่งไม่ตรงกับพฤติกรรมของระบบปัจจุบัน

---

# 1\. เตรียม Project

mkdir playwright-integration-demo

cd playwright-integration-demo

npm init playwright@latest

เลือก TypeScript แล้วตั้งค่า `playwright.config.ts` ตัวอย่างดังนี้

import { defineConfig, devices } from '@playwright/test';

&nbsp;

export default defineConfig({

&nbsp;

&nbsp;&nbsp;testDir: './tests',

&nbsp;

&nbsp;&nbsp;timeout: 30\_000,

&nbsp;

&nbsp;&nbsp;expect: {

&nbsp;&nbsp;&nbsp;&nbsp;timeout: 5\_000,

&nbsp;&nbsp;},

&nbsp;

&nbsp;&nbsp;reporter: 'html',

&nbsp;

&nbsp;&nbsp;use: {

&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;baseURL: 'https://www.saucedemo.com',

&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;trace: 'on-first-retry',

&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;screenshot: 'only-on-failure',

&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;video: 'retain-on-failure',

&nbsp;&nbsp;},

&nbsp;

&nbsp;&nbsp;projects: \[

&nbsp;&nbsp;&nbsp;&nbsp;{

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;name: 'chromium',

&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;use: {

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;...devices\['Desktop Chrome'\]

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;},

&nbsp;&nbsp;&nbsp;&nbsp;},

&nbsp;&nbsp;\],

});

ค่าที่สำคัญใน Configuration นี้คือ

- `testDir: './tests'` กำหนดให้ Playwright ค้นหาไฟล์ทดสอบในโฟลเดอร์ `tests`  
- `timeout: 30_000` กำหนดเวลาสูงสุดของแต่ละ Test ไว้ที่ 30 วินาที  
- `expect.timeout: 5_000` กำหนดเวลารอสูงสุดของ Assertion แต่ละจุดไว้ที่ 5 วินาที  
- `reporter: 'html'` ให้ Playwright สร้าง HTML Report หลังการทดสอบ  
- `baseURL` ทำให้คำสั่งอย่าง `page.goto('/')` เปิด SauceDemo ได้โดยไม่ต้องเขียน URL เต็ม  
- `trace: 'on-first-retry'` เก็บ Trace เมื่อมีการ Retry ครั้งแรก  
- `screenshot: 'only-on-failure'` บันทึก Screenshot เฉพาะ Test ที่ล้มเหลว  
- `video: 'retain-on-failure'` เก็บ Video เฉพาะ Test ที่ล้มเหลว ช่วยวิเคราะห์ลำดับเหตุการณ์ก่อน Error  
- `projects` กำหนดให้ตัวอย่างในเอกสารนี้รันด้วย Chromium โดยใช้ค่าอุปกรณ์จำลอง `Desktop Chrome`

หลังรัน Test สามารถเปิด HTML Report ได้ด้วย

npx playwright show-report

ทดสอบ Environment

npx playwright test

---

# 2\. Layer ที่ใช้ในตัวอย่าง

Layer I

A \= Login

&nbsp;

Layer II

B \= Inventory / Product List

C \= Sort Products

D \= Product Detail

&nbsp;

Layer III

E \= Add Cart

F \= Check / Remove Cart

G \= Add Cart from Detail

ความสัมพันธ์ที่ใช้ในเอกสารนี้เน้นเส้นทาง

A \-\> B \-\> E \-\> F

และในการอธิบาย Sandwich จะมองเป็น 2 branch ที่มาพบกันบริเวณ `B` / กลุ่มกลาง

> Mapping A–G เป็นแบบจำลองเพื่อการเรียนการสอน ไม่ใช่ Architecture ภายในอย่างเป็นทางการของ SauceDemo

---

# 3\. Driver และ Stub

## 3.1 Stub

Stub คือของจำลองที่ใช้แทน Module ด้านล่าง เพื่อให้ Module จริงด้านบนสามารถทดสอบต่อได้

REAL MODULE

&nbsp;&nbsp;&nbsp;&nbsp;|

&nbsp;&nbsp;&nbsp;&nbsp;v

&nbsp;&nbsp;&nbsp;STUB

จำง่าย ๆ:

REAL \-\> FAKE

ในไฟล์ปัจจุบัน `02` และ Top branch ของ `06` ใช้ `page.setContent()` เพื่อสร้าง **Stub UI ของ Inventory** หลัง Login จริง

await page.setContent(\`

&nbsp;&nbsp;\<div class="inventory\_list" data-test="stub-inventory"\>

&nbsp;&nbsp;&nbsp;&nbsp;Fake Inventory from Stub B

&nbsp;&nbsp;\</div\>

\`);

นี่เป็นการจำลอง Stub ในระดับ Browser/UI สำหรับระบบ Black-box SPA ไม่ใช่การแทน Module ภายในของ Source Code โดยตรง

## 3.2 Driver

Driver คือ Test Code ด้านบนที่ทำหน้าที่แทน Module จริงด้านบน แล้วเรียก Module จริงด้านล่าง

DRIVER

&nbsp;&nbsp;&nbsp;|

&nbsp;&nbsp;&nbsp;v

REAL MODULE

จำง่าย ๆ:

FAKE \-\> REAL

ในไฟล์ `04` และ Bottom branch ของ `06` ฟังก์ชัน `driverOpenInventory()` ทำหน้าที่แทน Login UI โดยเตรียม cookie แล้วเปิด Inventory จริงโดยตรง

---

# 4\. Top-Down Integration Testing

Top-Down เริ่มจาก Layer บน แล้วค่อยรวมลงไปด้านล่าง

A Login

&nbsp;&nbsp;|

&nbsp;&nbsp;v

B Inventory

&nbsp;&nbsp;|

&nbsp;&nbsp;v

E Add Cart

&nbsp;&nbsp;|

&nbsp;&nbsp;v

F Cart

## 4.1 ไฟล์ 01 — Top-Down REAL

ไฟล์: `tests/01-top-down-real.spec.ts`

Flow:

A REAL \-\> B REAL \-\> E REAL \-\> F REAL

ใช้ `test.step()` แบ่ง Layer ชัดเจน และไม่มี Driver/Stub

import { test, expect } from '@playwright/test';

&nbsp;

test('Top-Down REAL: Login \-\> Inventory \-\> Add Cart \-\> Check Cart', async ({ page }) \=\> {

&nbsp;

&nbsp;&nbsp;// \=====================================================

&nbsp;&nbsp;// Layer I : A \= Login จริง

&nbsp;&nbsp;// \=====================================================

&nbsp;&nbsp;await test.step('Layer I \- Login', async () \=\> {

&nbsp;&nbsp;&nbsp;&nbsp;await page.goto('/');

&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;await page.locator('\#user-name').fill('standard\_user');

&nbsp;&nbsp;&nbsp;&nbsp;await page.locator('\#password').fill('secret\_sauce');

&nbsp;&nbsp;&nbsp;&nbsp;await page.locator('\#login-button').click();

&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;await expect(page).toHaveURL(/inventory\\.html/);

&nbsp;&nbsp;});

&nbsp;

&nbsp;&nbsp;// \=====================================================

&nbsp;&nbsp;// Layer II : B \= Inventory จริง

&nbsp;&nbsp;// \=====================================================

&nbsp;&nbsp;await test.step('Layer II \- Inventory', async () \=\> {

&nbsp;&nbsp;&nbsp;&nbsp;await expect(page.locator('.inventory\_list')).toBeVisible();

&nbsp;&nbsp;&nbsp;&nbsp;await expect(page.locator('.inventory\_item')).toHaveCount(6);

&nbsp;&nbsp;});

&nbsp;

&nbsp;&nbsp;// \=====================================================

&nbsp;&nbsp;// Layer III : E \= Add Product to Cart จริง

&nbsp;&nbsp;// \=====================================================

&nbsp;&nbsp;await test.step('Layer III \- Add Product to Cart', async () \=\> {

&nbsp;&nbsp;&nbsp;&nbsp;await page

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.locator('\[data-test="add-to-cart-sauce-labs-backpack"\]')

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.click();

&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;await expect(page.locator('.shopping\_cart\_badge')).toHaveText('1');

&nbsp;&nbsp;});

&nbsp;

&nbsp;&nbsp;// \=====================================================

&nbsp;&nbsp;// Layer III : F \= Check Cart จริง

&nbsp;&nbsp;// \=====================================================

&nbsp;&nbsp;await test.step('Layer III \- Check Cart', async () \=\> {

&nbsp;&nbsp;&nbsp;&nbsp;await page.locator('.shopping\_cart\_link').click();

&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;await expect(page).toHaveURL(/cart\\.html/);

&nbsp;&nbsp;&nbsp;&nbsp;await expect(page.locator('.inventory\_item\_name'))

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.toHaveText('Sauce Labs Backpack');

&nbsp;&nbsp;});

});

&nbsp;

&nbsp;

// npx playwright test tests/01-top-down-real.spec.ts \--headed

Run:

npx playwright test tests/01-top-down-real.spec.ts \--headed

## 4.2 ไฟล์ 02 — Top-Down STUB

ไฟล์: `tests/02-top-down-stub.spec.ts`

Flow เชิงแนวคิด:

A Login REAL

&nbsp;&nbsp;&nbsp;&nbsp;|

&nbsp;&nbsp;&nbsp;&nbsp;v

B Inventory STUB

ลำดับจริงของ Test คือ

1. เปิดหน้า Login จริง  
2. กรอก username/password จริง  
3. รอ URL `inventory.html`  
4. เนื่องจาก SauceDemo เป็น SPA จึงใช้ `page.setContent()` แทน DOM ที่ render แล้วด้วย Stub HTML  
5. Assert ว่า Stub Inventory ปรากฏ

> **จุดแก้จากเอกสารเดิม:** ไฟล์นี้ **ไม่ได้ใช้ `page.route()` หรือ `route.fulfill()`** แล้ว

import { test, expect } from '@playwright/test';

&nbsp;

test('Top-Down STUB: Login REAL \-\> Inventory STUB', async ({ page }) \=\> {

&nbsp;

&nbsp;&nbsp;// \=====================================================

&nbsp;&nbsp;// REAL A : Login จริง

&nbsp;&nbsp;// \=====================================================

&nbsp;&nbsp;await page.goto('/');

&nbsp;

&nbsp;&nbsp;await page.locator('\#user-name')

&nbsp;&nbsp;&nbsp;&nbsp;.fill('standard\_user');

&nbsp;

&nbsp;&nbsp;await page.locator('\#password')

&nbsp;&nbsp;&nbsp;&nbsp;.fill('secret\_sauce');

&nbsp;

&nbsp;&nbsp;// รอ navigation หลังจาก login

&nbsp;&nbsp;await Promise.all(\[

&nbsp;&nbsp;&nbsp;&nbsp;page.waitForURL(/inventory\\.html/),

&nbsp;&nbsp;&nbsp;&nbsp;page.locator('\#login-button').click(),

&nbsp;&nbsp;\]);

&nbsp;

&nbsp;&nbsp;console.log('Current URL:', page.url());

&nbsp;

&nbsp;&nbsp;// \=====================================================

&nbsp;&nbsp;// STUB B : Inventory

&nbsp;&nbsp;// saucedemo.com is an SPA — inventory content is rendered

&nbsp;&nbsp;// by client-side JS (no HTTP request to /inventory.html).

&nbsp;&nbsp;// Replace the SPA-rendered DOM with our stub HTML.

&nbsp;&nbsp;// \=====================================================

&nbsp;&nbsp;await page.setContent(\`

&nbsp;&nbsp;&nbsp;&nbsp;\<\!doctype html\>

&nbsp;&nbsp;&nbsp;&nbsp;\<html\>

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\<head\>

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\<meta charset="utf-8"\>

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\<title\>Stub Inventory\</title\>

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\</head\>

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\<body\>

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\<h1\>Stub Inventory\</h1\>

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\<div class="inventory\_list" data-test="stub-inventory"\>

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Fake Inventory from Stub B

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\</div\>

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\</body\>

&nbsp;&nbsp;&nbsp;&nbsp;\</html\>

&nbsp;&nbsp;\`);

&nbsp;

&nbsp;&nbsp;// \=====================================================

&nbsp;&nbsp;// Assert : REAL A \-\> STUB B

&nbsp;&nbsp;// \=====================================================

&nbsp;

&nbsp;&nbsp;await expect(

&nbsp;&nbsp;&nbsp;&nbsp;page.locator('\[data-test="stub-inventory"\]')

&nbsp;&nbsp;).toBeVisible();

&nbsp;

&nbsp;&nbsp;await expect(

&nbsp;&nbsp;&nbsp;&nbsp;page.locator('\[data-test="stub-inventory"\]')

&nbsp;&nbsp;).toContainText('Fake Inventory from Stub B');

&nbsp;

});

Run:

npx playwright test tests/02-top-down-stub.spec.ts \--headed

---

# 5\. Bottom-Up Integration Testing

Bottom-Up เน้นรวมกลุ่ม Module ด้านล่างก่อน แล้วค่อยเชื่อมขึ้นไปด้านบน

## 5.1 ไฟล์ 03 — Bottom-Up REAL

ไฟล์: `tests/03-bottom-up-real.spec.ts`

เนื่องจาก SauceDemo เป็น Black-box UI และ Inventory ต้องมี Login state ก่อน จึงใช้ Login จริงเป็น prerequisite แต่ **ไม่ใช่ Driver และไม่ใช่ Stub**

Phase ที่ Test สนใจ:

BU-01

A REAL (prerequisite)

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;v

B REAL \-\> E REAL \-\> F REAL

&nbsp;

BU-02

A REAL \-\> B REAL \-\> E REAL \-\> F REAL

import { test, expect, Page } from '@playwright/test';

&nbsp;

// Helper นี้เรียก Login จริงของ SauceDemo

// จึงไม่ใช่ Stub และไม่ได้แทน Login ด้วยข้อมูลจำลอง

async function loginThroughRealUI(page: Page) {

&nbsp;&nbsp;await page.goto('/');

&nbsp;&nbsp;await page.locator('\#user-name').fill('standard\_user');

&nbsp;&nbsp;await page.locator('\#password').fill('secret\_sauce');

&nbsp;&nbsp;await page.locator('\#login-button').click();

&nbsp;&nbsp;await expect(page).toHaveURL(/inventory\\.html/);

}

&nbsp;

test.describe('Bottom-Up REAL \- no Driver / no Stub', () \=\> {

&nbsp;

&nbsp;&nbsp;test('BU-01: Integrate B Inventory \-\> E Add Cart \-\> F Cart', async ({ page }) \=\> {

&nbsp;&nbsp;&nbsp;&nbsp;// Real prerequisite เพื่อให้เข้าถึงระบบด้านล่างได้

&nbsp;&nbsp;&nbsp;&nbsp;await loginThroughRealUI(page);

&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;// B REAL

&nbsp;&nbsp;&nbsp;&nbsp;await expect(page.locator('.inventory\_list')).toBeVisible();

&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;// E REAL

&nbsp;&nbsp;&nbsp;&nbsp;await page

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.locator('\[data-test="add-to-cart-sauce-labs-backpack"\]')

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.click();

&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;await expect(page.locator('.shopping\_cart\_badge')).toHaveText('1');

&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;// F REAL

&nbsp;&nbsp;&nbsp;&nbsp;await page.locator('.shopping\_cart\_link').click();

&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;await expect(page.locator('.inventory\_item\_name'))

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.toHaveText('Sauce Labs Backpack');

&nbsp;&nbsp;});

&nbsp;

&nbsp;&nbsp;test('BU-02: Add A Login to the already-tested B-E-F flow', async ({ page }) \=\> {

&nbsp;&nbsp;&nbsp;&nbsp;// A REAL

&nbsp;&nbsp;&nbsp;&nbsp;await page.goto('/');

&nbsp;&nbsp;&nbsp;&nbsp;await page.locator('\#user-name').fill('standard\_user');

&nbsp;&nbsp;&nbsp;&nbsp;await page.locator('\#password').fill('secret\_sauce');

&nbsp;&nbsp;&nbsp;&nbsp;await page.locator('\#login-button').click();

&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;// A \-\> B

&nbsp;&nbsp;&nbsp;&nbsp;await expect(page).toHaveURL(/inventory\\.html/);

&nbsp;&nbsp;&nbsp;&nbsp;await expect(page.locator('.inventory\_list')).toBeVisible();

&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;// B \-\> E

&nbsp;&nbsp;&nbsp;&nbsp;await page

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.locator('\[data-test="add-to-cart-sauce-labs-backpack"\]')

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.click();

&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;// E \-\> F

&nbsp;&nbsp;&nbsp;&nbsp;await page.locator('.shopping\_cart\_link').click();

&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;await expect(page.locator('.inventory\_item\_name'))

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.toHaveText('Sauce Labs Backpack');

&nbsp;&nbsp;});

});

&nbsp;

// npx playwright test tests/03-bottom-up-real.spec.ts \--headed

Run:

npx playwright test tests/03-bottom-up-real.spec.ts \--headed

## 5.2 ไฟล์ 04 — Bottom-Up DRIVER

ไฟล์: `tests/04-bottom-up-driver.spec.ts`

Flow:

Driver A

&nbsp;&nbsp;&nbsp;|

&nbsp;&nbsp;&nbsp;v

B Inventory REAL

&nbsp;&nbsp;&nbsp;|

&nbsp;&nbsp;&nbsp;v

E Add Cart REAL

`driverOpenInventory()` ไม่กรอก Login UI แต่ inject cookie `session-username` แล้วเปิด Inventory จริงโดยตรง

> `session-username` เป็น implementation detail ของ SauceDemo และอาจเปลี่ยนได้ ตัวอย่างนี้ใช้เพื่ออธิบายบทบาทของ Driver

import {

&nbsp;&nbsp;test,

&nbsp;&nbsp;expect,

&nbsp;&nbsp;BrowserContext,

&nbsp;&nbsp;Page,

} from '@playwright/test';

&nbsp;

// \=====================================================

// DRIVER A

// ทำหน้าที่แทน Login Layer ด้านบน

// ไม่กรอก username/password ผ่านหน้า Login

// \=====================================================

async function driverOpenInventory(

&nbsp;&nbsp;context: BrowserContext

): Promise\<Page\> {

&nbsp;

&nbsp;&nbsp;await context.addCookies(\[

&nbsp;&nbsp;&nbsp;&nbsp;{

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;name: 'session-username',

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;value: 'standard\_user',

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;domain: 'www.saucedemo.com',

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;path: '/',

&nbsp;&nbsp;&nbsp;&nbsp;},

&nbsp;&nbsp;\]);

&nbsp;

&nbsp;&nbsp;const page \= await context.newPage();

&nbsp;&nbsp;await page.goto('https://www.saucedemo.com/inventory.html');

&nbsp;

&nbsp;&nbsp;await expect(page.locator('.inventory\_list')).toBeVisible();

&nbsp;

&nbsp;&nbsp;return page;

}

&nbsp;

test('Bottom-Up DRIVER: Driver A \-\> B Inventory \-\> E Add Cart', async ({ browser }) \=\> {

&nbsp;

&nbsp;&nbsp;const context \= await browser.newContext();

&nbsp;

&nbsp;&nbsp;try {

&nbsp;&nbsp;&nbsp;&nbsp;// \===================================================

&nbsp;&nbsp;&nbsp;&nbsp;// Driver A เรียก Layer ด้านล่าง

&nbsp;&nbsp;&nbsp;&nbsp;// \===================================================

&nbsp;&nbsp;&nbsp;&nbsp;const page \= await driverOpenInventory(context);

&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;// \===================================================

&nbsp;&nbsp;&nbsp;&nbsp;// B \= Inventory จริง

&nbsp;&nbsp;&nbsp;&nbsp;// \===================================================

&nbsp;&nbsp;&nbsp;&nbsp;await expect(page.locator('.inventory\_item')).toHaveCount(6);

&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;// \===================================================

&nbsp;&nbsp;&nbsp;&nbsp;// E \= Add Cart จริง

&nbsp;&nbsp;&nbsp;&nbsp;// \===================================================

&nbsp;&nbsp;&nbsp;&nbsp;await page

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.locator('\[data-test="add-to-cart-sauce-labs-backpack"\]')

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.click();

&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;await expect(page.locator('.shopping\_cart\_badge'))

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.toHaveText('1');

&nbsp;

&nbsp;&nbsp;} finally {

&nbsp;&nbsp;&nbsp;&nbsp;await context.close();

&nbsp;&nbsp;}

});

&nbsp;

// npx playwright test tests/04-bottom-up-driver.spec.ts \--headed

Run:

npx playwright test tests/04-bottom-up-driver.spec.ts \--headed

---

# 6\. Sandwich / Hybrid Integration Testing

Sandwich รวมแนวคิด Top-Down และ Bottom-Up โดยมองการทดสอบเป็น 2 branch แล้วค่อยเชื่อมความเข้าใจที่ Layer กลาง

สิ่งสำคัญคือ **Stub กับ Driver ไม่ได้ต่อกันโดยตรง**

## 6.1 ไฟล์ 05 — Sandwich REAL

ไฟล์: `tests/05-sandwich-real.spec.ts`

ไฟล์นี้ใช้ Module จริงทั้งสอง branch และแยก `BrowserContext` เพื่อไม่ให้ state ปะปนกัน

Top branch

A REAL \-\> B REAL

&nbsp;

Bottom-focused branch

A REAL (prerequisite) \-\> B REAL \-\> E REAL \-\> F REAL

`Promise.all()` ใช้เพื่อให้สอง branch ทำงานพร้อมกัน แต่การทำงานพร้อมกัน **ไม่ใช่เหตุผลที่ Test นี้เป็น Sandwich**; แนวคิด Sandwich มาจากการทดสอบจากทั้งด้านบนและด้านล่าง/ด้านล่างที่สนใจในคนละ branch

import { test, expect, Page } from '@playwright/test';

&nbsp;

async function loginReal(page: Page) {

&nbsp;&nbsp;await page.goto('https://www.saucedemo.com/');

&nbsp;&nbsp;await page.locator('\#user-name').fill('standard\_user');

&nbsp;&nbsp;await page.locator('\#password').fill('secret\_sauce');

&nbsp;&nbsp;await page.locator('\#login-button').click();

&nbsp;&nbsp;await expect(page).toHaveURL(/inventory\\.html/);

}

&nbsp;

test('Sandwich REAL: Top branch \+ Bottom-focused branch', async ({ browser }) \=\> {

&nbsp;

&nbsp;&nbsp;const topContext \= await browser.newContext();

&nbsp;&nbsp;const bottomContext \= await browser.newContext();

&nbsp;

&nbsp;&nbsp;const topPage \= await topContext.newPage();

&nbsp;&nbsp;const bottomPage \= await bottomContext.newPage();

&nbsp;

&nbsp;&nbsp;try {

&nbsp;&nbsp;&nbsp;&nbsp;await Promise.all(\[

&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// \=================================================

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// TOP-DOWN BRANCH

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// A REAL \-\> B REAL

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// \=================================================

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(async () \=\> {

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;await loginReal(topPage);

&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;await expect(topPage.locator('.inventory\_list'))

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.toBeVisible();

&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;await expect(topPage.locator('.inventory\_item'))

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.toHaveCount(6);

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;})(),

&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// \=================================================

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// BOTTOM-FOCUSED BRANCH

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// ใช้ Module จริงทั้งหมด

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// Focus ที่ B \-\> E \-\> F

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// \=================================================

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(async () \=\> {

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// A จริงเป็น prerequisite เพราะ SauceDemo เป็น Black-box UI

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;await loginReal(bottomPage);

&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// B REAL \-\> E REAL

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;await bottomPage

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.locator('\[data-test="add-to-cart-sauce-labs-backpack"\]')

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.click();

&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;await expect(bottomPage.locator('.shopping\_cart\_badge'))

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.toHaveText('1');

&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// E \-\> F REAL

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;await bottomPage.locator('.shopping\_cart\_link').click();

&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;await expect(bottomPage.locator('.inventory\_item\_name'))

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.toHaveText('Sauce Labs Backpack');

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;})(),

&nbsp;&nbsp;&nbsp;&nbsp;\]);

&nbsp;

&nbsp;&nbsp;} finally {

&nbsp;&nbsp;&nbsp;&nbsp;await Promise.all(\[

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;topContext.close(),

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;bottomContext.close(),

&nbsp;&nbsp;&nbsp;&nbsp;\]);

&nbsp;&nbsp;}

});

&nbsp;

// npx playwright test tests/05-sandwich-real.spec.ts \--headed

Run:

npx playwright test tests/05-sandwich-real.spec.ts \--headed

## 6.2 ไฟล์ 06 — Sandwich DRIVER \+ STUB

ไฟล์: `tests/06-sandwich-driver-stub.spec.ts`

ไฟล์นี้แสดง Test Double ทั้งสองแบบใน Test เดียว แต่คนละ branch

BRANCH 1: TOP-DOWN

A Login REAL

&nbsp;&nbsp;&nbsp;&nbsp;|

&nbsp;&nbsp;&nbsp;&nbsp;v

B Inventory STUB

&nbsp;

BRANCH 2: BOTTOM-UP

Driver A

&nbsp;&nbsp;&nbsp;|

&nbsp;&nbsp;&nbsp;v

B Inventory REAL

&nbsp;&nbsp;&nbsp;|

&nbsp;&nbsp;&nbsp;v

E Add Cart REAL

Top branch ใช้ Login จริงก่อน แล้วใช้ `page.setContent()` แทน Inventory DOM ด้วย Stub HTML เพราะ SauceDemo เป็น SPA

Bottom branch ใช้ `driverOpenInventory()` เตรียม authentication state แล้วเรียก Inventory จริงโดยตรง

> **จุดแก้จากเอกสารเดิม:** Top branch ของไฟล์ `06` **ไม่ได้ใช้ `page.route()` / `route.fulfill()`** แล้ว แต่ใช้ `page.setContent()` หลัง `waitForURL(/inventory\.html/)`

import {

&nbsp;&nbsp;test,

&nbsp;&nbsp;expect,

&nbsp;&nbsp;BrowserContext,

&nbsp;&nbsp;Page,

} from '@playwright/test';

&nbsp;

// \=====================================================

// DRIVER A สำหรับ Bottom-Up branch

// แทนการ Login ผ่าน UI

// \=====================================================

async function driverOpenInventory(

&nbsp;&nbsp;context: BrowserContext

): Promise\<Page\> {

&nbsp;

&nbsp;&nbsp;await context.addCookies(\[

&nbsp;&nbsp;&nbsp;&nbsp;{

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;name: 'session-username',

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;value: 'standard\_user',

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;domain: 'www.saucedemo.com',

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;path: '/',

&nbsp;&nbsp;&nbsp;&nbsp;},

&nbsp;&nbsp;\]);

&nbsp;

&nbsp;&nbsp;const page \= await context.newPage();

&nbsp;&nbsp;await page.goto('https://www.saucedemo.com/inventory.html');

&nbsp;

&nbsp;&nbsp;await expect(page.locator('.inventory\_list')).toBeVisible();

&nbsp;

&nbsp;&nbsp;return page;

}

&nbsp;

test('Sandwich: Top-Down STUB \+ Bottom-Up DRIVER', async ({ browser }) \=\> {

&nbsp;

&nbsp;&nbsp;const topContext \= await browser.newContext();

&nbsp;&nbsp;const bottomContext \= await browser.newContext();

&nbsp;

&nbsp;&nbsp;const topPage \= await topContext.newPage();

&nbsp;

&nbsp;&nbsp;try {

&nbsp;&nbsp;&nbsp;&nbsp;await Promise.all(\[

&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// \=================================================

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// BRANCH 1 : TOP-DOWN

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// A REAL \-\> Stub B

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// saucedemo is an SPA — no HTTP request to /inventory.html

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// to intercept. Use page.setContent() after real login.

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// \=================================================

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(async () \=\> {

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;await topPage.goto('https://www.saucedemo.com/');

&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;await topPage.locator('\#user-name').fill('standard\_user');

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;await topPage.locator('\#password').fill('secret\_sauce');

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;await topPage.locator('\#login-button').click();

&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;await topPage.waitForURL(/inventory\\.html/);

&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// Replace SPA-rendered inventory with stub HTML

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;await topPage.setContent(\`

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\<\!doctype html\>

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\<html\>

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\<head\>

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\<meta charset="utf-8" /\>

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\<title\>Stub Inventory\</title\>

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\</head\>

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\<body\>

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\<h1\>Stub Inventory\</h1\>

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\<div class="inventory\_list" data-test="stub-inventory"\>

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Fake Inventory from Stub B

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\</div\>

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\</body\>

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\</html\>

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\`);

&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;await expect(topPage.locator('\[data-test="stub-inventory"\]'))

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.toContainText('Fake Inventory from Stub B');

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;})(),

&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// \=================================================

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// BRANCH 2 : BOTTOM-UP

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// Driver A \-\> B REAL \-\> E REAL

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// \=================================================

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(async () \=\> {

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;const bottomPage \= await driverOpenInventory(bottomContext);

&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// B REAL

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;await expect(bottomPage.locator('.inventory\_item'))

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.toHaveCount(6);

&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// E REAL

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;await bottomPage

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.locator('\[data-test="add-to-cart-sauce-labs-backpack"\]')

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.click();

&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;await expect(bottomPage.locator('.shopping\_cart\_badge'))

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;.toHaveText('1');

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;})(),

&nbsp;&nbsp;&nbsp;&nbsp;\]);

&nbsp;

&nbsp;&nbsp;} finally {

&nbsp;&nbsp;&nbsp;&nbsp;await Promise.all(\[

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;topContext.close(),

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;bottomContext.close(),

&nbsp;&nbsp;&nbsp;&nbsp;\]);

&nbsp;&nbsp;}

});

Run:

npx playwright test tests/06-sandwich-driver-stub.spec.ts \--headed

---

# 7\. ตารางสรุป 6 ไฟล์

| ไฟล์ | Strategy | Driver | Stub | Flow หลัก |
| :---- | :---- | ----: | ----: | :---- |
| `01-top-down-real.spec.ts` | Top-Down | ไม่มี | ไม่มี | `A REAL -> B REAL -> E REAL -> F REAL` |
| `02-top-down-stub.spec.ts` | Top-Down | ไม่มี | มี | `A REAL -> B STUB` โดย Stub ด้วย `page.setContent()` |
| `03-bottom-up-real.spec.ts` | Bottom-Up | ไม่มี | ไม่มี | เริ่มสนใจ `B -> E -> F` โดย A จริงเป็น prerequisite |
| `04-bottom-up-driver.spec.ts` | Bottom-Up | มี | ไม่มี | `Driver A -> B REAL -> E REAL` |
| `05-sandwich-real.spec.ts` | Sandwich | ไม่มี | ไม่มี | Top `A->B`; Bottom-focused `A->B->E->F` |
| `06-sandwich-driver-stub.spec.ts` | Sandwich | มี | มี | Top `A REAL -> B STUB`; Bottom `Driver A -> B REAL -> E REAL` |

---

# 8\. สิ่งที่ควรจำ

Top-Down

REAL \-\> STUB       (เมื่อ Module ด้านล่างยังไม่พร้อม)

&nbsp;

Bottom-Up

DRIVER \-\> REAL     (เมื่อ Module ด้านบนยังไม่พร้อม/ไม่ต้องการให้เป็น dependency)

&nbsp;

Sandwich

Top branch    : REAL \-\> STUB

Bottom branch : DRIVER \-\> REAL \-\> REAL

เมื่อ Module จริงทั้งหมดพร้อมแล้ว สามารถทำ Full Real Integration เพิ่มเติมได้ เช่น

A REAL \-\> B REAL \-\> E REAL \-\> F REAL

แต่ในไฟล์ `06` ปัจจุบันยังเป็นตัวอย่าง **Sandwich with Driver \+ Stub** ที่ทดสอบ 2 branch พร้อมกัน ไม่ใช่ Final Join test

---

# 9\. Run ทุกไฟล์

npx playwright test tests/01-top-down-real.spec.ts \--headed

npx playwright test tests/02-top-down-stub.spec.ts \--headed

npx playwright test tests/03-bottom-up-real.spec.ts \--headed

npx playwright test tests/04-bottom-up-driver.spec.ts \--headed

npx playwright test tests/05-sandwich-real.spec.ts \--headed

npx playwright test tests/06-sandwich-driver-stub.spec.ts \--headed

รันทั้งหมด

npx playwright test \--headed

ดู Report

npx playwright show-report

---

# 10\. คำถามสำหรับนักศึกษา

1. ไฟล์ `01` กับ `02` ต่างกันตรงไหนในแง่ Real Module และ Stub?  
2. เพราะเหตุใดไฟล์ `02` จึงใช้ `page.setContent()` แทน `page.route()`?  
3. `driverOpenInventory()` ในไฟล์ `04` ทำหน้าที่แทน Layer ใด?  
4. ทำไม `loginThroughRealUI()` ในไฟล์ `03` จึงไม่ถือว่าเป็น Driver?  
5. ในไฟล์ `05` ทำไม `Promise.all()` จึงไม่ใช่นิยามของ Sandwich?  
6. ในไฟล์ `06` Stub และ Driver อยู่ branch เดียวกันหรือคนละ branch?  
7. หากต้องการ Full Real Join ควรมี Flow แบบใด?

---

# 11\. สรุป

เอกสารและไฟล์ 01–06 ปัจจุบันสอดคล้องกันดังนี้

- `01` \= Top-Down แบบ Real  
- `02` \= Top-Down แบบ Stub โดยใช้ `page.setContent()`  
- `03` \= Bottom-Up แบบ Real โดยมี Login จริงเป็น prerequisite ของ Black-box UI  
- `04` \= Bottom-Up แบบ Driver  
- `05` \= Sandwich แบบ Real สอง branch  
- `06` \= Sandwich แบบ Top Stub \+ Bottom Driver

จุดสำคัญที่สุดคือให้แยกบทบาทของ Test Double ให้ถูกต้อง:

Stub   \= ของปลอมที่อยู่ด้านล่างและถูก Module จริงเรียก/แทนผลลัพธ์ด้านล่าง

Driver \= Test Code ด้านบนที่เป็นฝ่ายเรียก Module จริงด้านล่าง

และสำหรับ SauceDemo เวอร์ชันตัวอย่างนี้ Stub ของ Inventory ถูกจำลองในระดับ DOM หลัง Login จริง เพราะหน้า Inventory ถูก render แบบ SPA

&nbsp;