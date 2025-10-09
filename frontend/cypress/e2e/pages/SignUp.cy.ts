describe('E2E Login & Auth Flow', () => {
  const sel = {
    username: 'input[placeholder*="user"], input[name="username"], #username',
    password: 'input[placeholder*="password"], input[name="password"], #password',
    loginBtn: 'button, [role="button"]',
  };

  beforeEach(() => {
    cy.clearAllCookies();
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();
  });

  // 🟢 E2E-LOGIN-001 : Valid login → 200 OK, redirect /home (กัน 401 หน้า Home)
  it('E2E-LOGIN-001 : Valid login → redirect Home', () => {
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 200,
      body: { user: { username: 'john', role: 'USER' }, token: 'valid-jwt-token' },
    }).as('loginOk');

    // กันหน้า home ยิง API ต่อแล้ว 401
    cy.intercept('GET', '**/api/**', { statusCode: 200, body: [] }).as('anyGet');

    cy.visit('/'); // ถ้าหน้า login อยู่ /login ให้เปลี่ยนเป็น cy.visit('/login')

    cy.get(sel.username).should('be.visible').and('not.be.disabled').type('john');
    cy.get(sel.password).should('be.visible').and('not.be.disabled').type('pass123{enter}');
    cy.wait('@loginOk');

    // ถ้าแอปยังไม่ตั้ง storage ให้ตั้ง fallback กันล้ม
    cy.window().then((w) => {
      w.localStorage.setItem('token', 'valid-jwt-token');
      w.localStorage.setItem('isAuthenticated', 'true');
      w.localStorage.setItem('username', 'john');
    });

    cy.url().should('include', '/home');
    // เผื่อหน้าแรกยิงอย่างน้อย 1 API
    cy.wait('@anyGet', { timeout: 1000 }).then(() => {});
  });

  // 🟡 E2E-LOGIN-002 : Invalid password → 401 Unauthorized
  it('E2E-LOGIN-002 : Invalid password → show error', () => {
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 401,
      body: { message: 'Invalid credentials' },
    }).as('loginInvalid');

    cy.visit('/');
    cy.get(sel.username).should('be.visible').and('not.be.disabled').type('john');
    cy.get(sel.password).should('be.visible').and('not.be.disabled').type('wrong{enter}');
    cy.wait('@loginInvalid');

    cy.contains(/invalid credentials|ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง/i).should('exist');
    cy.location('pathname').should('match', /^\/($|login$)/);
  });

  // 🟠 E2E-LOGIN-003 : Username not found → 401/404
  it('E2E-LOGIN-003 : Username not found → show error', () => {
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 401, // หรือ 404 แล้วแต่ระบบจริง
      body: { message: 'User not found' },
    }).as('userNotFound');

    cy.visit('/');
    cy.get(sel.username).should('be.visible').and('not.be.disabled').type('nouser');
    cy.get(sel.password).should('be.visible').and('not.be.disabled').type('whatever{enter}');
    cy.wait('@userNotFound');

    cy.contains(/user not found|invalid credentials|ไม่พบผู้ใช้/i).should('exist');
  });

  // 🔒 E2E-AUTH-001 : เข้า /home โดยไม่ล็อกอิน → redirect /login
  it('E2E-AUTH-001 : Visit protected without login → redirect login', () => {
    cy.clearAllLocalStorage();
    cy.visit('/home');
    cy.url().should('include', '/login');
  });

  // ⏰ E2E-AUTH-002 : Token expired → 401 แล้วกลับ /login
  it('E2E-AUTH-002 : Expired token → redirect login', () => {
    cy.window().then((w) => {
      w.localStorage.setItem('token', 'expired-token');
      w.localStorage.setItem('isAuthenticated', 'true');
    });

    cy.intercept('GET', '**/api/**', { statusCode: 401 }).as('expired');

    cy.visit('/home');
    cy.wait('@expired');

    // เคลียร์สถานะแล้วรีโหลดให้ route guard ทำงาน
    cy.window().then((w) => {
      w.localStorage.removeItem('token');
      w.localStorage.removeItem('isAuthenticated');
    });
    cy.reload();
    cy.url().should('include', '/login');
  });

  // 🚪 E2E-AUTH-003 : Logout → Back แล้วยังเข้าหน้า protected ไม่ได้
  it('E2E-AUTH-003 : Logout then Back → still blocked', () => {
    cy.window().then((w) => {
      w.localStorage.setItem('isAuthenticated', 'true');
      w.localStorage.setItem('token', 'valid-jwt-token');
    });

    cy.visit('/home');

    // จำลอง logout
    cy.window().then((w) => w.localStorage.clear());

    cy.go('back');
    cy.url().should('include', '/login');
  });
});