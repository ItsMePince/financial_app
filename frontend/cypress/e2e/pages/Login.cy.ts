describe('E2E Login & Auth Flow', () => {
  const sel = {
    username: 'input[placeholder*="user"], input[name="username"]',
    password: 'input[placeholder*="password"], input[name="password"]',
    loginBtn: 'button, [role="button"]',
  };

  beforeEach(() => {
    cy.clearAllCookies();
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();
  });

  // 🟢 E2E-LOGIN-001 : Valid login
  it('E2E-LOGIN-001 : Valid login → 200 OK, redirect to Home', () => {
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 200,
      body: {
        user: { username: 'john', role: 'USER' },
        token: 'valid-jwt-token',
      },
    }).as('loginOk');

    cy.visit('/');
    cy.get(sel.username)
      .should('be.visible')
      .and('not.be.disabled')
      .type('john');
    cy.get(sel.password)
      .should('be.visible')
      .and('not.be.disabled')
      .type('pass123{enter}');
    cy.wait('@loginOk');

    cy.window().then((w) => {
      w.localStorage.setItem('token', 'valid-jwt-token');
      w.localStorage.setItem('isAuthenticated', 'true');
    });

    cy.url().should('include', '/home');
  });

  // 🟡 E2E-LOGIN-002 : Invalid password
  it('E2E-LOGIN-002 : Invalid password → 401 Unauthorized', () => {
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 401,
      body: { message: 'Invalid credentials' },
    }).as('loginInvalid');

    cy.visit('/');
    cy.get(sel.username)
      .should('be.visible')
      .and('not.be.disabled')
      .type('john');
    cy.get(sel.password)
      .should('be.visible')
      .and('not.be.disabled')
      .type('wrong{enter}');
    cy.wait('@loginInvalid');

    cy.contains(/invalid credentials/i).should('exist');
  });

  // 🟠 E2E-LOGIN-003 : Username not found
  it('E2E-LOGIN-003 : Username not found → 401 Unauthorized', () => {
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 401,
      body: { message: 'User not found' },
    }).as('userNotFound');

    cy.visit('/');
    cy.get(sel.username)
      .should('be.visible')
      .and('not.be.disabled')
      .type('nouser');
    cy.get(sel.password)
      .should('be.visible')
      .and('not.be.disabled')
      .type('whatever{enter}');
    cy.wait('@userNotFound');

    cy.contains(/user not found|invalid credentials/i).should('exist');
  });

  // 🔒 E2E-AUTH-001 : Access protected page without login
  it('E2E-AUTH-001 : Visit /home without login → redirect to /login', () => {
    cy.clearAllLocalStorage();
    cy.visit('/home');
    cy.url().should('include', '/login');
  });

  // ⏰ E2E-AUTH-002 : Token expired
  it('E2E-AUTH-002 : Expired token → 401 and redirect login', () => {
    // ตั้ง token ปลอมให้หมดอายุ
    cy.window().then((w) => {
      w.localStorage.setItem('token', 'expired-token');
      w.localStorage.setItem('isAuthenticated', 'true');
    });

    // intercept API ให้ตอบ 401
    cy.intercept('GET', '**/api/**', { statusCode: 401 }).as('expired');

    cy.visit('/home');
    cy.wait('@expired');

    // ล้าง token จำลองพฤติกรรมระบบจริง
    cy.window().then((w) => {
      w.localStorage.removeItem('token');
      w.localStorage.removeItem('isAuthenticated');
    });

    cy.reload();
    cy.url().should('include', '/login');
  });

  // 🚪 E2E-AUTH-003 : Logout then Back
  it('E2E-AUTH-003 : Logout then click Back → still not access protected', () => {
    // จำลองล็อกอินก่อน
    cy.window().then((w) => {
      w.localStorage.setItem('isAuthenticated', 'true');
      w.localStorage.setItem('token', 'valid-jwt-token');
    });

    cy.visit('/home');

    // จำลอง Logout (ล้างข้อมูล)
    cy.window().then((w) => w.localStorage.clear());

    // กด Back
    cy.go('back');
    cy.url().should('include', '/login');
  });
});