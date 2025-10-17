// cypress/e2e/pages/signup.cy.ts
// Flow: Login -> à¸à¸” Sign Up -> à¸ªà¸¡à¸±à¸„à¸£à¸”à¹‰à¸§à¸¢à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸ªà¸¸à¹ˆà¸¡ -> (redirect à¹„à¸› /login à¸«à¸£à¸·à¸­à¸–à¹‰à¸²à¸‹à¹‰à¸³à¹ƒà¸«à¹‰à¸‚à¹‰à¸²à¸¡) -> Login -> /home

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
      'input[placeholder*="à¸Šà¸·à¹ˆà¸­à¸œà¸¹à¹‰à¹ƒà¸Šà¹‰"]',
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
      'input[placeholder*="à¸£à¸«à¸±à¸ªà¸œà¹ˆà¸²à¸™"]',
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
  it('à¸ªà¸¡à¸±à¸„à¸£à¸œà¸¹à¹‰à¹ƒà¸Šà¹‰à¹ƒà¸«à¸¡à¹ˆà¸”à¹‰à¸§à¸¢à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸ªà¸¸à¹ˆà¸¡ à¸à¸±à¸™à¸‹à¹‰à¸³ à¹à¸¥à¹‰à¸§à¸¥à¹‡à¸­à¸à¸­à¸´à¸™à¹€à¸‚à¹‰à¸²à¸«à¸™à¹‰à¸² /home à¸ªà¸³à¹€à¸£à¹‡à¸ˆ', () => {
    // à¸ªà¸£à¹‰à¸²à¸‡à¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¹„à¸¡à¹ˆà¸‹à¹‰à¸³à¸—à¸¸à¸à¸„à¸£à¸±à¹‰à¸‡
    const uniq = Date.now();
    const email = `a${uniq}@gmail.com`;
    const username = `aa${uniq}`;
    const password = '111111';

    // à¹„à¸›à¸«à¸™à¹‰à¸² /login
    cy.visit('http://localhost:3000/login');

    // à¹„à¸›à¸«à¸™à¹‰à¸² Sign Up
    clickVisibleSignUp();

    // à¸”à¸±à¸ response à¸ªà¸¡à¸±à¸„à¸£ (à¹€à¸œà¸·à¹ˆà¸­ assert à¸«à¸£à¸·à¸­ handle 400 à¹„à¸”à¹‰)
    cy.intercept('POST', '**/api/auth/signup').as('signup');

    // à¸à¸£à¸­à¸à¸ªà¸¡à¸±à¸„à¸£
    fillSignupForm({ email, username, password });

    // à¸£à¸­à¸œà¸¥à¸ªà¸¡à¸±à¸„à¸£
    cy.wait('@signup', { timeout: 15000 }).then((interception) => {
      const status = interception?.response?.statusCode ?? 0;

      if (status >= 200 && status < 300) {
        // à¸ªà¸³à¹€à¸£à¹‡à¸ˆ â†’ à¸„à¸§à¸£ redirect à¹„à¸› /login
        cy.location('pathname', { timeout: 10000 }).should('include', '/login');
      } else {
        // à¸–à¹‰à¸² backend à¸•à¸­à¸š 400 (à¹€à¸Šà¹ˆà¸™ à¸‹à¹‰à¸³) à¸«à¸£à¸·à¸­à¸­à¸¢à¹ˆà¸²à¸‡à¸­à¸·à¹ˆà¸™ â†’ à¸‚à¹‰à¸²à¸¡ signup à¹„à¸› login à¹€à¸¥à¸¢
        cy.log(`Signup not OK (status ${status}), continue to login page`);
        cy.visit('http://localhost:3000/login');
      }
    });

    // à¸¥à¹‡à¸­à¸à¸­à¸´à¸™à¸”à¹‰à¸§à¸¢ creds à¸—à¸µà¹ˆà¹€à¸žà¸´à¹ˆà¸‡à¸ªà¸¡à¸±à¸„à¸£ (à¸«à¸£à¸·à¸­à¸—à¸µà¹ˆà¸•à¸±à¹‰à¸‡à¹„à¸§à¹‰)
    fillLoginForm({ username, password });

    // à¸•à¹‰à¸­à¸‡à¹„à¸›à¸«à¸™à¹‰à¸² /home
    cy.location('pathname', { timeout: 10000 }).should('include', '/home');
  });
});



