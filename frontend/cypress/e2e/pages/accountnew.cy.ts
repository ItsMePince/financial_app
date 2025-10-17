// cypress/e2e/pages/accountnew.cy.ts

function uiLogin() {
  cy.visit('http://localhost:3000/login');

  // à¸à¸£à¸­à¸ username
  cy.get(
    'input[placeholder*="user"], input[placeholder*="username"], input[autocomplete="username"], input[name="username"], input#username'
  )
    .first()
    .clear()
    .type('john');

  // à¸à¸£à¸­à¸ password
  cy.get(
    'input[placeholder*="pass"], input[placeholder*="à¸£à¸«à¸±à¸ª"], input[autocomplete="current-password"], input[name="password"], input#password'
  )
    .first()
    .clear()
    .type('pass123');

  cy.contains('button, [type="submit"]', /login|à¹€à¸‚à¹‰à¸²à¸ªà¸¹à¹ˆà¸£à¸°à¸šà¸š/i)
    .first()
    .click();

  cy.location('pathname', { timeout: 10000 }).should('include', '/home');
}

describe('à¹€à¸žà¸´à¹ˆà¸¡à¸šà¸±à¸à¸Šà¸µà¹ƒà¸«à¸¡à¹ˆ', () => {
  it('à¸ªà¸£à¹‰à¸²à¸‡à¸šà¸±à¸à¸Šà¸µà¹ƒà¸«à¸¡à¹ˆà¹à¸¥à¸°à¸•à¸£à¸§à¸ˆà¸ªà¸­à¸šà¸§à¹ˆà¸²à¸›à¸£à¸²à¸à¸à¹ƒà¸™à¸«à¸™à¹‰à¸² Home', () => {
    uiLogin();

    // à¹„à¸›à¸—à¸µà¹ˆà¸«à¸™à¹‰à¸² /accountnew
    cy.visit('http://localhost:3000/accountnew');
    cy.location('pathname', { timeout: 10000 }).should('include', '/accountnew');

    // à¸žà¸´à¸¡à¸žà¹Œà¸Šà¸·à¹ˆà¸­à¸šà¸±à¸à¸Šà¸µ
    cy.get('input[placeholder="à¸Šà¸·à¹ˆà¸­à¸šà¸±à¸à¸Šà¸µ"]').should('be.visible').clear().type('à¸à¸£à¸¸à¸‡à¹€à¸—à¸ž');

    // à¹€à¸›à¸´à¸” dropdown "à¸›à¸£à¸°à¹€à¸ à¸—à¸šà¸±à¸à¸Šà¸µ"
    cy.contains('à¸›à¸£à¸°à¹€à¸ à¸—à¸šà¸±à¸à¸Šà¸µ')
      .parents()
      .find('button.select')
      .should('be.visible')
      .click();

    // à¹€à¸¥à¸·à¸­à¸ "à¸šà¸±à¸•à¸£à¹€à¸„à¸£à¸”à¸´à¸•"
    cy.contains('button.opt', 'à¸šà¸±à¸•à¸£à¹€à¸„à¸£à¸”à¸´à¸•').should('be.visible').click();

    // à¸„à¸¥à¸´à¸à¹€à¸¥à¸·à¸­à¸ icon "à¸à¸£à¸°à¸›à¸¸à¸"
    cy.get('button[title="à¸à¸£à¸°à¸›à¸¸à¸"]').should('be.visible').click();

    // à¸žà¸´à¸¡à¸žà¹Œà¸ˆà¸³à¸™à¸§à¸™à¹€à¸‡à¸´à¸™
    cy.get('input[aria-label="à¸ˆà¸³à¸™à¸§à¸™à¹€à¸‡à¸´à¸™"]').should('be.visible').type('54000');

    // à¸à¸”à¸›à¸¸à¹ˆà¸¡ à¸¢à¸·à¸™à¸¢à¸±à¸™
    cy.contains('button.primary', 'à¸¢à¸·à¸™à¸¢à¸±à¸™').should('be.visible').click();

    // à¸•à¸£à¸§à¸ˆà¸§à¹ˆà¸² redirect à¹„à¸›à¸«à¸™à¹‰à¸² home à¹à¸¥à¹‰à¸§à¸¡à¸µà¸‚à¹‰à¸­à¸¡à¸¹à¸¥à¸•à¸£à¸‡à¸à¸±à¸™
    cy.location('pathname', { timeout: 10000 }).should('include', '/home');

    cy.get('.category-card.has-more').within(() => {
      cy.get('.category-name').should('contain.text', 'à¸à¸£à¸¸à¸‡à¹€à¸—à¸ž');
      cy.get('.category-amount').should('contain.text', '54,000 à¸šà¸²à¸—');
    });
  });
});



