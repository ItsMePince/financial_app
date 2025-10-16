/// <reference types="cypress" />

// ================= helpers =================
function uiLogin() {
  cy.visit('http://localhost:3000/login');

  cy.get(
    'input[placeholder*="user"], input[placeholder*="username"], input[autocomplete="username"], input[name="username"], input#username, input[type="email"]'
  )
    .filter(':visible')
    .first()
    .clear()
    .type('john');

  cy.get(
    'input[placeholder*="pass"], input[placeholder*="รหัส"], input[autocomplete="current-password"], input[name="password"], input#password, input[type="password"]'
  )
    .filter(':visible')
    .first()
    .clear()
    .type('pass123');

  cy.contains('button, [type="submit"]', /login|เข้าสู่ระบบ/i)
    .filter(':visible')
    .first()
    .click();

  cy.location('pathname', { timeout: 10000 }).should('include', '/home');
}

function nav(href: string) {
  cy.get(`a.nav-button[href="${href}"]`).filter(':visible').first().click({ force: true });
}

function setHiddenDateISO(isoDate: string) {
  cy.get('.seg.date-seg input[type="date"]', { timeout: 5000 })
    .first()
    .then(($inp) => {
      const el = $inp[0] as HTMLInputElement;

      // ใช้ native setter เพื่อให้ React จับได้
      const proto = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
      proto?.set?.call(el, isoDate);

      // กระตุ้นทั้ง input และ change (ให้ bubbles เพื่อวิ่งเข้าตัว handler)
      el.dispatchEvent(new Event('input',  { bubbles: true, composed: true }));
      el.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    });

  // ยืนยันว่าค่าใน input เปลี่ยนจริง
  cy.get('.seg.date-seg input[type="date"]').first().should('have.value', isoDate);
}

function keypadEnterNumber(n: string) {
  n.split('').forEach((ch) => {
    cy.contains('button.key', ch).filter(':visible').first().click({ force: true });
  });
}

function clickOkAndExpectAlert() {
  cy.window().then((w) => cy.stub(w, 'alert').as('alertStub'));
  cy.get('button.ok-btn').filter(':visible').first().click({ force: true });
  cy.get('@alertStub').should('have.been.called');
}

function goSummary() {
  nav('/home');
  cy.get('a.transaction-link[href="/summary"]').filter(':visible').first().click({ force: true });
  cy.location('pathname').should('include', '/summary');
}

function assertDayCard(ddmm: string, title: string, tag: string, amtText: string | RegExp) {
  cy.contains('.day-card .day-date', ddmm)
    .should('exist')
    .parents('.day-card')
    .within(() => {
      cy.contains('.row-title', title).should('exist');
      cy.contains('.row-tag', tag).should('exist');
      cy.get('.row-amt').should('contain.text', amtText as any);
    });
}

// ================= tests =================
describe('accountselect - เพิ่มค่าใช้จ่าย และรายได้', () => {
  it('เพิ่มค่าใช้จ่าย: กดประเภทการชำระเงินก่อน / ไทยพาณิชย์ / ค่าเดินทาง / วันที่ 09/10/2568 / 9 บาท', () => {
    uiLogin();
    nav('/expense');

    // 🔹 กดประเภทการชำระเงินก่อน
    cy.contains('button.seg', /ประเภท|ชำระ|ธ\./i).filter(':visible').first().click({ force: true });

    // 🔹 เลือกบัญชี ไทยพาณิชย์
    cy.contains('button.card .card__label, button.card', /ไทยพาณิชย์/)
      .filter(':visible')
      .first()
      .click({ force: true });

    // 🔹 เลือกหมวดหมู่ ค่าเดินทาง
    cy.contains('button.cat', 'ค่าเดินทาง').filter(':visible').first().click({ force: true });

    // 🔹 ตั้งวันที่ (09/10/2568 -> 2025-10-09)
    setHiddenDateISO('2025-10-09');

    // 🔹 กรอกโน้ต/สถานที่
    cy.get('input[placeholder="โน้ต"]').filter(':visible').first().clear().type('เทส');
    cy.get('input[placeholder="สถานที่"]').filter(':visible').first().clear().type('เทส');

    // 🔹 ใส่จำนวน 9 บาท
    keypadEnterNumber('9');
    clickOkAndExpectAlert();

    // 🔹 ตรวจใน Summary
    goSummary();
    assertDayCard('09/10', 'ค่าเดินทาง', 'ไทยพาณิชย์', '-9');
  });

  it('เพิ่มรายได้: กดประเภทการชำระเงินก่อน / ออมสิน / ลงทุน / วันที่ 06/10/2568 / 6 บาท', () => {
    uiLogin();
    nav('/expense');

    // 🔹 สลับเป็น "รายได้" ก่อน
    cy.get('button.pill').filter(':visible').first().click({ force: true });
    cy.contains('button, li, [role="option"]', /รายได้|income/i)
      .filter(':visible')
      .first()
      .click({ force: true })
      .then(() => cy.wait(200));

    // 🔹 กดประเภทการชำระเงินก่อน
    cy.contains('button.seg', /ประเภท|ชำระ|ธ\./i).filter(':visible').first().click({ force: true });

    // 🔹 เลือกบัญชี ออมสิน
    cy.contains('button.card .card__label, button.card', /ออมสิน/)
      .filter(':visible')
      .first()
      .click({ force: true });

    // 🔹 เลือกหมวดหมู่ ลงทุน
    cy.contains('button.cat', 'ลงทุน').filter(':visible').first().click({ force: true });

    // 🔹 ตั้งวันที่ (06/10/2568 -> 2025-10-06)
    setHiddenDateISO('2025-10-06');

    // 🔹 กรอกโน้ต/สถานที่
    cy.get('input[placeholder="โน้ต"]').filter(':visible').first().clear().type('เทส2');
    cy.get('input[placeholder="สถานที่"]').filter(':visible').first().clear().type('เทส2');

    // 🔹 ใส่จำนวน 6 บาท
    keypadEnterNumber('6');
    clickOkAndExpectAlert();

    // 🔹 ตรวจใน Summary
    goSummary();
    assertDayCard('06/10', 'ลงทุน', 'ออมสิน', '6');
  });
});