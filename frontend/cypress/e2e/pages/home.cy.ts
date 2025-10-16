function uiLogin() {
  cy.visit('http://localhost:3000/login');

  // กรอกชื่อผู้ใช้ (เผื่อหลาย selector)
  cy.get(
    'input[placeholder*="user"], input[placeholder*="username"], input[autocomplete="username"], input[name="username"], input#username'
  )
    .first()
    .clear()
    .type('john');

  // กรอกรหัสผ่าน
  cy.get(
    'input[placeholder*="pass"], input[placeholder*="รหัส"], input[autocomplete="current-password"], input[name="password"], input#password'
  )
    .first()
    .clear()
    .type('pass123');

  // คลิกปุ่ม Login
  cy.contains('button, [type="submit"]', /login|เข้าสู่ระบบ/i)
    .first()
    .click();

  // มาถึง /home แล้ว
  cy.location('pathname', { timeout: 10000 }).should('include', '/home');
}

describe('E2E-HOME', () => {
  beforeEach(() => {
    uiLogin();
  });

  it('ดูสรุปรวมของวันอื่นๆ: 10/2025 -> (กด Next) -> 11/2025', () => {
    // เล็งส่วนที่โชว์เดือน/ปี เช่น <span>10/2025</span>
    cy.contains('span', /\b\d{1,2}\/\d{4}\b/)
      .should('contain.text', '10/2025');

    // กดปุ่ม Next month: <button aria-label="Next month">→</button>
    cy.get('button[aria-label="Next month"]').click();

    // ตรวจว่าเปลี่ยนเป็น 11/2025
    cy.contains('span', /\b\d{1,2}\/\d{4}\b/)
      .should('contain.text', '11/2025');
  });

  it('ดูรายการทั้งหมด: คลิกลิงก์ "ดูทั้งหมด" แล้วไป /summary', () => {
    cy.get('a.transaction-link[href="/summary"]')
      .should('be.visible')
      .click();

    cy.location('pathname', { timeout: 10000 }).should('include', '/summary');
  });

  it('แก้ไขบัญชีธนาคาร: เปิดเมนูจุดสามจุด แล้วกด "แก้ไข" ไป /accountnew', () => {
    // เปิดเมนูจุดสามจุดของการ์ดบัญชีธนาคาร (เลือกตัวแรกที่เห็น)
    // รองรับทั้งปุ่มที่เป็น .more-btn หรือ <button> ทั่วไปที่มีไอคอน ellipsis
    cy.get('.category-card')
      .first()
      .within(() => {
        cy.get('button, .more-btn')
          .filter(':visible')
          .first()
          .click({ force: true });
      });

    // คลิกปุ่มเมนูรายการ "แก้ไข"
    cy.get('button.more-item')
      .contains('span', 'แก้ไข')
      .closest('button.more-item')
      .click();

    // ไปหน้า accountnew
    cy.location('pathname', { timeout: 10000 }).should('include', '/accountnew');
  });

  it('ลบบัญชีธนาคาร: เปิดเมนู -> กด "ลบ" -> กดยืนยัน OK แล้วการ์ดถูกแทนด้วยปุ่ม + (ลิงก์ /accountnew)', () => {
    // เปิดเมนูจุดสามจุดของการ์ดบัญชีธนาคาร (ตัวแรก)
    cy.get('.category-card')
      .first()
      .within(() => {
        cy.get('button, .more-btn')
          .filter(':visible')
          .first()
          .click({ force: true });
      });

    // ดัก confirm แล้วตอบ OK
    cy.on('window:confirm', (txt) => {
      // ข้อความประมาณ: ลบบัญชี "ออมสิน" ใช่ไหม?
      expect(txt).to.match(/ลบบัญชี|ลบ/);
      return true; // กด OK
    });

    // คลิกปุ่มเมนูรายการ "ลบ"
    cy.get('button.more-item.danger')
      .contains('span', 'ลบ')
      .closest('button.more-item.danger')
      .click();

    // หลังลบสำเร็จ จะเห็นการ์ด + ที่ลิงก์ /accountnew แทนตัวเดิม
    cy.get('a.category-card[href="/accountnew"]')
      .should('be.visible')
      .within(() => {
        // มีสัญลักษณ์ +
        cy.contains('+').should('be.visible');
      });
  });
  it('เพิ่มบัญชีใหม่: คลิกการ์ด + ไป /accountnew (ถ้าไม่มีการ์ด + จะลบอันแรกก่อน)', () => {
    // ถ้ามีการ์ด + อยู่แล้วกดได้เลย, ถ้ายังไม่มี ให้ลบการ์ดบัญชีตัวแรกก่อน
    cy.get('a.category-card[href="/accountnew"]').then(($plus) => {
      if ($plus.length > 0) {
        cy.wrap($plus.first()).click();
      } else {
        // เปิดเมนูจุดสามจุดของการ์ดบัญชีธนาคารตัวแรกแล้วกด "ลบ"
        cy.get('.category-card')
          .first()
          .within(() => {
            cy.get('button, .more-btn')
              .filter(':visible')
              .first()
              .click({ force: true });
          });

        cy.on('window:confirm', () => true); // ตอบ OK

        cy.get('button.more-item.danger')
          .contains('span', 'ลบ')
          .closest('button.more-item.danger')
          .click();

        // รอให้การ์ด + โผล่ แล้วคลิก
        cy.get('a.category-card[href="/accountnew"]', { timeout: 10000 })
          .should('be.visible')
          .click();
      }
    });

    // ไปหน้า accountnew
    cy.location('pathname', { timeout: 10000 }).should('include', '/accountnew');
  });

  it('ล็อคเอ้า: กดปุ่ม Logout แล้วกลับไปหน้า /login', () => {
    // เผื่อบางธีมปุ่มอยู่ด้านบนเสมอ ให้มั่นใจว่าเห็นปุ่ม
    cy.get('button.header__logout[title="Logout"], button.header__logout')
      .filter(':visible')
      .first()
      .click({ force: true });

    cy.location('pathname', { timeout: 10000 }).should('include', '/login');
  });
});