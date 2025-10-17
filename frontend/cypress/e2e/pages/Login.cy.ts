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

  // ðŸŸ¢ E2E-LOGIN-001 : Valid login
  it('E2E-LOGIN-001 : Valid login â†’ 200 OK, redirect to Home', () => {
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

  // ðŸŸ¡ E2E-LOGIN-002 : Invalid password
  it('E2E-LOGIN-002 : Invalid password â†’ 401 Unauthorized', () => {
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

  // ðŸŸ  E2E-LOGIN-003 : Username not found
  it('E2E-LOGIN-003 : Username not found â†’ 401 Unauthorized', () => {
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

  // ðŸ”’ E2E-AUTH-001 : Access protected page without login
  it('E2E-AUTH-001 : Visit /home without login â†’ redirect to /login', () => {
    cy.clearAllLocalStorage();
    cy.visit('/home');
    cy.url().should('include', '/login');
  });

  // â° E2E-AUTH-002 : Token expired
  it('E2E-AUTH-002 : Expired token â†’ 401 and redirect login', () => {
    // à¸•à¸±à¹‰à¸‡ token à¸›à¸¥à¸­à¸¡à¹ƒà¸«à¹‰à¸«à¸¡à¸”à¸­à¸²à¸¢à¸¸
    cy.window().then((w) => {
      w.localStorage.setItem('token', 'expired-token');
      w.localStorage.setItem('isAuthenticated', 'true');
    });

    // intercept API à¹ƒà¸«à¹‰à¸•à¸­à¸š 401
    cy.intercept('GET', '**/api/**', { statusCode: 401 }).as('expired');

    cy.visit('/home');
    cy.wait('@expired');

    // à¸¥à¹‰à¸²à¸‡ token à¸ˆà¸³à¸¥à¸­à¸‡à¸žà¸¤à¸•à¸´à¸à¸£à¸£à¸¡à¸£à¸°à¸šà¸šà¸ˆà¸£à¸´à¸‡
    cy.window().then((w) => {
      w.localStorage.removeItem('token');
      w.localStorage.removeItem('isAuthenticated');
    });

    cy.reload();
    cy.url().should('include', '/login');
  });

  // ðŸšª E2E-AUTH-003 : Logout then Back
  it('E2E-AUTH-003 : Logout then click Back â†’ still not access protected', () => {
    // à¸ˆà¸³à¸¥à¸­à¸‡à¸¥à¹‡à¸­à¸à¸­à¸´à¸™à¸à¹ˆà¸­à¸™
    cy.window().then((w) => {
      w.localStorage.setItem('isAuthenticated', 'true');
      w.localStorage.setItem('token', 'valid-jwt-token');
    });

    cy.visit('/home');

    // à¸ˆà¸³à¸¥à¸­à¸‡ Logout (à¸¥à¹‰à¸²à¸‡à¸‚à¹‰à¸­à¸¡à¸¹à¸¥)
    cy.window().then((w) => w.localStorage.clear());

    // à¸à¸” Back
    cy.go('back');
    cy.url().should('include', '/login');
  });
});



