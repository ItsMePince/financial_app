// cypress/e2e/pages/signup.cy.ts
// Flow: Login -> กด Sign Up -> สมัครด้วยข้อมูลสุ่ม -> (redirect ไป /login หรือถ้าซ้ำให้ข้าม) -> Login -> /home

// ---------------- helpers ----------------
function clickVisibleSignUp() {
  cy.contains('button.link', /sign\s*up/i, { timeout: 10000 })
    .filter(':visible')
    .first()
    .click();
}

function fillSignupForm({
  email,
  username,
  password,
}: {
  email: string;
  username: string;
  password: string;
}) {
  cy.get(
    [
      'input#email[name="email"]',
      'input[name="email"][type="email"]',
      'input.su-input[type="email"]',
      'input[autocomplete="email"]',
      'input[placeholder*="you@example.com"]',
    ].join(', '),
    { timeout: 10000 }
  )
    .filter(':visible')
    .first()
    .clear()
    .type(email);

  cy.get(
    [
      'input#username[name="username"]',
      'input[name="username"]',
      'input.su-input[autocomplete="username"]',
      'input[placeholder*="ชื่อผู้ใช้"]',
      'input[placeholder*="user"]',
    ].join(', ')
  )
    .filter(':visible')
    .first()
    .clear()
    .type(username);

  cy.get(
    [
      'input#password[name="password"][type="password"]',
      'input.su-input[type="password"][autocomplete="new-password"]',
      'input[placeholder*="รหัสผ่าน"]',
    ].join(', ')
  )
    .filter(':visible')
    .first()
    .clear()
    .type(password);

  cy.get('button.su-submit[type="submit"], button[type="submit"]')
    .filter(':visible')
    .first()
    .click();
}

function fillLoginForm({
  username,
  password,
}: {
  username: string;
  password: string;
}) {
  cy.get(
    [
      'input#username[name="username"]',
      'input[name="username"]',
      'input[autocomplete="username"]',
      'input.input[placeholder*="user"]',
    ].join(', '),
    { timeout: 10000 }
  )
    .filter(':visible')
    .first()
    .clear()
    .type(username);

  cy.get(
    [
      'input.input[type="password"][autocomplete="current-password"]',
      'input[type="password"][placeholder*="password"]',
      'input[type="password"][placeholder*="admin"]',
    ].join(', ')
  )
    .filter(':visible')
    .first()
    .clear()
    .type(password);

  cy.get('button.btn[type="submit"], button[type="submit"]')
    .filter(':visible')
    .first()
    .click();
}

// ---------------- test ----------------
describe('E2E-SIGNUP-LOGIN-001: Sign up (unique) -> Login -> Home', () => {
  it('สมัครผู้ใช้ใหม่ด้วยข้อมูลสุ่ม กันซ้ำ แล้วล็อกอินเข้าหน้า /home สำเร็จ', () => {
    // สร้างข้อมูลไม่ซ้ำทุกครั้ง
    const uniq = Date.now();
    const email = `a${uniq}@gmail.com`;
    const username = `aa${uniq}`;
    const password = '111111';

    // ไปหน้า /login
    cy.visit('http://localhost:3000/login');

    // ไปหน้า Sign Up
    clickVisibleSignUp();

    // ดัก response สมัคร (เผื่อ assert หรือ handle 400 ได้)
    cy.intercept('POST', '**/api/auth/signup').as('signup');

    // กรอกสมัคร
    fillSignupForm({ email, username, password });

    // รอผลสมัคร
    cy.wait('@signup', { timeout: 15000 }).then((interception) => {
      const status = interception?.response?.statusCode ?? 0;

      if (status >= 200 && status < 300) {
        // สำเร็จ → ควร redirect ไป /login
        cy.location('pathname', { timeout: 10000 }).should('include', '/login');
      } else {
        // ถ้า backend ตอบ 400 (เช่น ซ้ำ) หรืออย่างอื่น → ข้าม signup ไป login เลย
        cy.log(`Signup not OK (status ${status}), continue to login page`);
        cy.visit('http://localhost:3000/login');
      }
    });

    // ล็อกอินด้วย creds ที่เพิ่งสมัคร (หรือที่ตั้งไว้)
    fillLoginForm({ username, password });

    // ต้องไปหน้า /home
    cy.location('pathname', { timeout: 10000 }).should('include', '/home');
  });
});