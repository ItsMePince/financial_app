// cypress/e2e/accountselect.cy.ts

// ---------------- helpers ----------------
function uiLogin() {
  cy.visit('http://localhost:3000/login');

  cy.get(
    'input[placeholder*="user"], input[placeholder*="username"], input[autocomplete="username"], input[name="username"], input#username'
  )
    .first()
    .clear()
    .type('john');

  cy.get(
    'input[placeholder*="pass"], input[placeholder*="รหัส"], input[autocomplete="current-password"], input[name="password"], input#password'
  )
    .first()
    .clear()
    .type('pass123');

  cy.contains('button, [type="submit"]', /login|เข้าสู่ระบบ/i)
    .first()
    .click();

  cy.location('pathname', { timeout: 10000 }).should('include', '/home');
}

function goToAccountSelect() {
  cy.visit('http://localhost:3000/accountselect');
  cy.location('pathname', { timeout: 10000 }).should('include', '/accountselect');
}

/** กดฟิลเตอร์ "ทั้งหมด" แบบ optional จริง ๆ (ไม่เจอ = ข้าม) */
function clickFilterAllIfVisible() {
  cy.get('body').then(($body) => {
    // หาองค์ประกอบที่ "มีข้อความ ทั้งหมด" และ "มองเห็น" ไม่บังคับว่าเป็น <button.seg>
    const $cand = $body
      .find('*:contains("ทั้งหมด"):visible')
      .filter((_, el) => Cypress.$(el).text().trim() === 'ทั้งหมด')
      .first();

    if ($cand.length) {
      cy.wrap($cand).scrollIntoView().click({ force: true });
    }
  });
}

/** เคลียร์ดาวเหลืองทั้งหน้า (ถ้ามี) — ดูจาก path ที่มี fill="currentColor" */
function clearAllFavoritesIfAny() {
  cy.get('body').then(($body) => {
    const $filled = $body.find('svg path[fill="currentColor"]');
    if ($filled.length > 0) {
      cy.wrap($filled).each(($el) => {
        cy.wrap($el).scrollIntoView().click({ force: true });
      });
    }
  });
}

/** สลับดาวในแถวที่ระบุข้อความ */
function toggleStarInRowByText(rowText: string) {
  // ใช้ตัวเลือกกว้าง ๆ เพื่อครอบคลุมหลายโครงสร้าง DOM
  cy.contains('button, .card, li, [role="listitem"], .item, .row, div', rowText)
    .filter(':visible')
    .first()
    .as('row');

  cy.get('@row').within(() => {
    // เลือกไอคอนดาวตัวท้ายสุดในแถว (กรณีมีหลายตัว)
    cy.get('svg:has(path)').last().scrollIntoView().click({ force: true });
  });
}

/** ยืนยันว่าแถวมีดาว "ติด" (มี path ที่ fill="currentColor") */
function assertRowStarOn(rowText: string) {
  cy.contains('button, .card, li, [role="listitem"], .item, .row, div', rowText)
    .filter(':visible')
    .first()
    .as('row');

  cy.get('@row').within(() => {
    cy.get('svg path[fill="currentColor"]', { timeout: 4000 }).should('exist');
  });
}

/** ยืนยันว่า “ทั้งหน้า” มีดาวเหลืองติดอยู่แค่แถวเดียว และเป็นแถวที่เราระบุ */
function assertOnlyThisRowStarOn(rowText: string) {
  // นับจำนวนดาวเหลืองทั้งหน้า
  cy.get('svg path[fill="currentColor"]').then(($all) => {
    // ถ้าแอปดีไซน์ให้ติดได้หลายอัน ให้คอมเมนต์บรรทัดนี้ออก
    expect($all.length, 'ควรเหลือดาวเหลืองเพียง 1 ดวง').to.equal(1);
  });

  // ตรวจว่าอยู่ในแถวที่ระบุ
  cy.contains('button, .card, li, [role="listitem"], .item, .row, div', rowText)
    .filter(':visible')
    .first()
    .as('row');

  cy.get('@row').within(() => {
    cy.get('svg path[fill="currentColor"]').should('exist');
  });
}

// ---------------- main test ----------------
describe('E2E-ACCT-001 : ติดดาวบัญชีที่ใช้บ่อย (Account Select)', () => {
  it('ล็อกอิน → ไป accountselect → (ถ้ามี)กดฟิลเตอร์ทั้งหมด → เคลียร์ดาว → ติดดาว "บัตรKTC" → ตรวจสอบ', () => {
    uiLogin();
    goToAccountSelect();

    // ปุ่ม/ตัวกรอง "ทั้งหมด" เป็น optional (ถ้าโผล่ค่อยกด)
    clickFilterAllIfVisible();

    // เคลียร์ดาวเหลืองทั้งหมดก่อนเริ่ม (ถ้ามี)
    clearAllFavoritesIfAny();

    // ติดดาวให้ "บัตรKTC"
    toggleStarInRowByText('บัตรKTC');

    // แถว "บัตรKTC" ต้องมีดาวเหลืองแล้ว
    assertRowStarOn('บัตรKTC');

    // (ถ้าต้องการ strict) ยืนยันว่ามีแค่แถวนี้ที่ดาวเหลือง
    // ถ้าดีไซน์อนุญาตหลาย favorite ให้คอมเมนต์ทิ้ง
    assertOnlyThisRowStarOn('บัตรKTC');
  });
});