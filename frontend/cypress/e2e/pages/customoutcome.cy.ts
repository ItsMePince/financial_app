function uiLogin() {
  cy.visit('http://localhost:3000/login');

  cy.get(
    'input[placeholder*="user"], input[placeholder*="username"], input[autocomplete="username"]'
  )
    .first()
    .clear()
    .type('john');

  cy.get(
    'input[placeholder*="pass"], input[placeholder*="รหัส"], input[autocomplete="current-password"]'
  )
    .first()
    .clear()
    .type('pass123');

  cy.contains('button, [type="submit"]', /login/i).first().click();

  // ยืนยันว่าออกจากหน้า /login แล้ว (เช่นไป /home)
  cy.location('pathname', { timeout: 10000 }).should('include', '/home');
}

function goToExpense() {
  // 1) ถ้ามีลิงก์หลายตัว ให้เลือกเฉพาะตัวที่ "มองเห็นได้" เท่านั้น
  cy.get('a.nav-button[href="/expense"]', { timeout: 5000 }).then(($links) => {
    const $visible = $links.filter(':visible');

    if ($visible.length > 0) {
      // บางธีมอาจมีหลายปุ่ม (เช่น top nav + bottom nav) -> ใช้ตัวแรกที่มองเห็น
      cy.wrap($visible.first()).click({ force: true });
    } else {
      // 2) ถ้าไม่เห็นลิงก์ ให้พยายามหาไอคอนเครื่องคิดเลขแล้วไล่ขึ้นไปที่ <a>
      cy.get('a.nav-button[href="/expense"] svg.lucide-calculator')
        .first()
        .parents('a.nav-button')
        .first()
        .click({ force: true });
    }
  })
  .then(() => {
    // ตรวจว่ามาถึง /expense แล้ว
    cy.location('pathname', { timeout: 10000 }).should('include', '/expense');
  })
  .then(null, () => {
    // 3) แผนสำรองสุดท้าย: visit โดยตรง (กันทุกเคส)
    cy.visit('http://localhost:3000/expense');
    cy.location('pathname', { timeout: 10000 }).should('include', '/expense');
  });
}

describe('เพิ่มหมวดหมู่', () => {
  beforeEach(() => {
    uiLogin();
    goToExpense();
  });

  it('E2E-CUSTOMOUTCOME-001 : ผู้ใช้สามารถเพิ่มหมวดหมู่ใหม่ได้', () => {
    // กดหมวด “อื่นๆ”
    cy.get('button.cat span', { timeout: 10000 }).contains('อื่นๆ').click({ force: true });

    // ค้นหาไอคอน
    cy.get('input.cc-search-input', { timeout: 10000 })
      .should('have.attr', 'placeholder')
      .and('include', 'ค้นหาไอคอน');
    cy.get('input.cc-search-input').clear().type('เงิน');

    // พิมพ์ชื่อหมวดหมู่
    cy.get('input.cc-nameinput', { timeout: 10000 }).clear().type('เงินเดือน');

    // เลือกไอคอน “กระเป๋าเงิน”
    cy.get('button.cc-chip[title="กระเป๋าเงิน"]', { timeout: 10000 }).click({ force: true });

    // กดยืนยัน
    cy.get('button.cc-confirm[aria-label="ยืนยัน"]', { timeout: 10000 }).click({ force: true });

    // ตรวจสอบว่าหมวดใหม่ปรากฏจริง
    cy.contains(/เงินเดือน/, { timeout: 10000 }).should('exist');
  });
});