function uiLoginEnsure() {
  const doLogin = (user: string, pass: string) => {
    cy.visit('http://localhost:3000/login');

    cy.get(
      'input[placeholder*="user"], input[placeholder*="username"], input[autocomplete="username"], input[name="username"], input#username'
    )
      .first()
      .should('be.visible')
      .click()
      .type('{selectAll}{backspace}' + user, { delay: 0, force: true });

    cy.get(
      'input[placeholder*="pass"], input[placeholder*="รหัส"], input[autocomplete="current-password"], input[name="password"], input#password'
    )
      .first()
      .should('be.visible')
      .click()
      .type('{selectAll}{backspace}' + pass, { delay: 0, force: true });

    cy.contains('button, [type="submit"]', /login|เข้าสู่ระบบ/i).first().click({ force: true });
  };

  cy.location('pathname', { timeout: 8000 }).then((p) => {
    if (p.includes('/login')) {
      // ครั้งที่ 2: ad/123456
      doLogin('john', 'pass123');
    }
  });

  cy.location('pathname', { timeout: 12000 }).should((p) => {
    expect(['/home', '/'].some((ok) => p === ok || p.endsWith(ok))).to.eq(true);
  });
}

/** ไปหน้า summary และรอโหลดข้อมูล */
function goSummaryAndWait() {
  cy.intercept('GET', '**/api/expenses**').as('expenses');
  cy.visit('http://localhost:3000/summary');
  cy.wait('@expenses', { timeout: 15000 });
}

/** เปิดการ์ดวันแรก (ไม่อิงข้อความวันที่) */
function openFirstDayCard() {
  cy.get('section.day-card[role="button"]').should('have.length.greaterThan', 0).first().click({ force: true });
}

/** เปิดรายการแรกในวันนั้น */
function openFirstRow() {
  cy.get('.row.clickable').should('exist').first().scrollIntoView().click({ force: true });
  cy.contains('button', 'แก้ไข').should('be.visible');
}

/** คืน element input/select ตัวแรกใต้ฉลากที่ระบุ (ไทย/อังกฤษได้) */
function field(labelText: string) {
  return cy.contains('label,div', new RegExp(labelText, 'i')).parent().find('input,select').first();
}

/** สร้างรายการแบบเร็ว จากหน้า Expense แล้วกลับมาที่ Summary */
function seedExpenseAndGoSummary() {
  // ไปหน้า Expense
  cy.get('a.nav-button[href="/expense"]').then(($links) => {
    const $v = $links.filter(':visible');
    cy.wrap($v.length ? $v.first() : $links.first()).click();
  });

  cy.intercept('POST', '**/api/expenses**').as('saveExpense');

  // กรอกขั้นต่ำให้มีรายการ
  cy.get('input[placeholder="โน้ต"]').clear().type('seed');
  cy.get('input[placeholder="สถานที่"]').clear().type('seed');
  cy.contains('button.key', /^1$/).click();
  cy.get('button.ok-btn').click();

  cy.on('window:alert', () => true);
  cy.on('window:confirm', () => true);

  cy.wait('@saveExpense', { timeout: 15000 }).its('response.statusCode').should('be.oneOf', [200, 201, 204]);

  // กลับ Home
  cy.get('a.nav-button[href="/home"]').then(($links) => {
    const $v = $links.filter(':visible');
    cy.wrap($v.length ? $v.first() : $links.first()).click();
  });
  cy.location('pathname', { timeout: 10000 }).should((p) => {
    expect(['/home', '/'].some((ok) => p === ok || p.endsWith(ok))).to.eq(true);
  });

  // ไป Summary และเปิดการ์ดวันแรก
  goSummaryAndWait();
  openFirstDayCard();

  // ยืนยันว่ามีรายการ
  cy.get('.row.clickable').should('have.length.greaterThan', 0);
}

// ----------------- Tests -----------------

describe('Summary > แก้ไข / ลบ (selectors ทน แถม seed ข้อมูล)', () => {
  // ไม่ใช้ session cache — ให้เช็ค/ล็อกอินใหม่ทุกเคสเพื่อกันโดนเตะกลับ /login กลางทาง
  beforeEach(() => {
    // พยายามเริ่มจาก /home ถ้าโดนเด้งไป /login ให้ล็อกอินใหม่
    cy.visit('http://localhost:3000/home');
    cy.location('pathname', { timeout: 6000 }).then((p) => {
      if (p.includes('/login')) {
        uiLoginEnsure(); // ล็อกอินให้เข้าหน้า home
      }
    });

    // ถึงตรงนี้ต้องอยู่ /home แล้ว -> seed และไป summary
    seedExpenseAndGoSummary();
  });

  it('EDIT-TRANSACTION-001 : แก้ไขรายการตามที่กำหนด แล้วค่าบนการ์ดต้องอัปเดต', () => {
    openFirstRow();
    cy.contains('button.btn.primary', 'แก้ไข').click();

    field('ประเภท').select('ค่าใช้จ่าย');
    field('หมวดหมู่').clear().type('ค่าอาหาร');
    field('จำนวนเงิน').clear().type('50');
    field('วันที่').invoke('val', '').type('2025-12-12');
    field('บัญชี').clear().type('บัตรเครดิต');
    field('วิธีจ่าย').clear().type('ร้านอาหาร');

    field('โน้ต')
      .then(($el) => {
        if ($el.prop('readOnly')) cy.wrap($el).invoke('prop', 'readOnly', false);
      })
      .clear()
      .type('ป้าติ๋ม');

    field('Icon Key')
      .then(($el) => {
        if (($el.val() as string)?.length) cy.wrap($el).clear();
      })
      .type('gift{enter}');

    cy.contains('button.btn.primary.stretch', 'บันทึก').click();

    // โหลดใหม่แล้วตรวจผล
    goSummaryAndWait();
    openFirstDayCard();

    cy.get('svg.lucide-gift').should('exist');
    cy.contains('.row-title', 'ค่าอาหาร').should('be.visible');
    cy.contains('.row-tag', 'บัตรเครดิต').should('be.visible');
    cy.contains('.row-amt', '-50').should('be.visible');
  });

  it('DELETE-TRANSACTION-001 : ลบรายการหนึ่งรายการ และต้องหายจากหน้า UI', () => {
    cy.get('.row.clickable').then(($rowsBefore) => {
      const before = $rowsBefore.length;

      openFirstRow();
      cy.on('window:confirm', () => true);
      cy.contains('button.btn.danger', 'ลบ').click();

      // โหลดใหม่และเปิดการ์ดวันแรก แล้วเช็กว่าจำนวนลดลง
      goSummaryAndWait();
      openFirstDayCard();
      cy.get('.row.clickable').should('have.length.lt', before);
    });
  });
});