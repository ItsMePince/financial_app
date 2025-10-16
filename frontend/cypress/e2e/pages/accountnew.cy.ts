// cypress/e2e/pages/accountnew.cy.ts

function uiLogin() {
  cy.visit('http://localhost:3000/login');

  // กรอก username
  cy.get(
    'input[placeholder*="user"], input[placeholder*="username"], input[autocomplete="username"], input[name="username"], input#username'
  )
    .first()
    .clear()
    .type('john');

  // กรอก password
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

describe('เพิ่มบัญชีใหม่', () => {
  it('สร้างบัญชีใหม่และตรวจสอบว่าปรากฏในหน้า Home', () => {
    uiLogin();

    // ไปที่หน้า /accountnew
    cy.visit('http://localhost:3000/accountnew');
    cy.location('pathname', { timeout: 10000 }).should('include', '/accountnew');

    // พิมพ์ชื่อบัญชี
    cy.get('input[placeholder="ชื่อบัญชี"]').should('be.visible').clear().type('กรุงเทพ');

    // เปิด dropdown "ประเภทบัญชี"
    cy.contains('ประเภทบัญชี')
      .parents()
      .find('button.select')
      .should('be.visible')
      .click();

    // เลือก "บัตรเครดิต"
    cy.contains('button.opt', 'บัตรเครดิต').should('be.visible').click();

    // คลิกเลือก icon "กระปุก"
    cy.get('button[title="กระปุก"]').should('be.visible').click();

    // พิมพ์จำนวนเงิน
    cy.get('input[aria-label="จำนวนเงิน"]').should('be.visible').type('54000');

    // กดปุ่ม ยืนยัน
    cy.contains('button.primary', 'ยืนยัน').should('be.visible').click();

    // ตรวจว่า redirect ไปหน้า home แล้วมีข้อมูลตรงกัน
    cy.location('pathname', { timeout: 10000 }).should('include', '/home');

    cy.get('.category-card.has-more').within(() => {
      cy.get('.category-name').should('contain.text', 'กรุงเทพ');
      cy.get('.category-amount').should('contain.text', '54,000 บาท');
    });
  });
});