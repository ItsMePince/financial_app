function uiLogin() {
  cy.visit('http://localhost:3000/login');

  cy.get(
    'input[placeholder*="user"], input[placeholder*="username"], input[autocomplete="username"]'
  )
    .first()
    .clear()
    .type('john');

  cy.get(
    'input[placeholder*="pass"], input[placeholder*="à¸£à¸«à¸±à¸ª"], input[autocomplete="current-password"]'
  )
    .first()
    .clear()
    .type('pass123');

  cy.contains('button, [type="submit"]', /login/i).first().click();

  // à¸¢à¸·à¸™à¸¢à¸±à¸™à¸§à¹ˆà¸²à¸­à¸­à¸à¸ˆà¸²à¸à¸«à¸™à¹‰à¸² /login à¹à¸¥à¹‰à¸§ (à¹€à¸Šà¹ˆà¸™à¹„à¸› /home)
  cy.location('pathname', { timeout: 10000 }).should('include', '/home');
}

function goToExpense() {
  // 1) à¸–à¹‰à¸²à¸¡à¸µà¸¥à¸´à¸‡à¸à¹Œà¸«à¸¥à¸²à¸¢à¸•à¸±à¸§ à¹ƒà¸«à¹‰à¹€à¸¥à¸·à¸­à¸à¹€à¸‰à¸žà¸²à¸°à¸•à¸±à¸§à¸—à¸µà¹ˆ "à¸¡à¸­à¸‡à¹€à¸«à¹‡à¸™à¹„à¸”à¹‰" à¹€à¸—à¹ˆà¸²à¸™à¸±à¹‰à¸™
  cy.get('a.nav-button[href="/expense"]', { timeout: 5000 }).then(($links) => {
    const $visible = $links.filter(':visible');

    if ($visible.length > 0) {
      // à¸šà¸²à¸‡à¸˜à¸µà¸¡à¸­à¸²à¸ˆà¸¡à¸µà¸«à¸¥à¸²à¸¢à¸›à¸¸à¹ˆà¸¡ (à¹€à¸Šà¹ˆà¸™ top nav + bottom nav) -> à¹ƒà¸Šà¹‰à¸•à¸±à¸§à¹à¸£à¸à¸—à¸µà¹ˆà¸¡à¸­à¸‡à¹€à¸«à¹‡à¸™
      cy.wrap($visible.first()).click({ force: true });
    } else {
      // 2) à¸–à¹‰à¸²à¹„à¸¡à¹ˆà¹€à¸«à¹‡à¸™à¸¥à¸´à¸‡à¸à¹Œ à¹ƒà¸«à¹‰à¸žà¸¢à¸²à¸¢à¸²à¸¡à¸«à¸²à¹„à¸­à¸„à¸­à¸™à¹€à¸„à¸£à¸·à¹ˆà¸­à¸‡à¸„à¸´à¸”à¹€à¸¥à¸‚à¹à¸¥à¹‰à¸§à¹„à¸¥à¹ˆà¸‚à¸¶à¹‰à¸™à¹„à¸›à¸—à¸µà¹ˆ <a>
      cy.get('a.nav-button[href="/expense"] svg.lucide-calculator')
        .first()
        .parents('a.nav-button')
        .first()
        .click({ force: true });
    }
  })
  .then(() => {
    // à¸•à¸£à¸§à¸ˆà¸§à¹ˆà¸²à¸¡à¸²à¸–à¸¶à¸‡ /expense à¹à¸¥à¹‰à¸§
    cy.location('pathname', { timeout: 10000 }).should('include', '/expense');
  })
  .then(null, () => {
    // 3) à¹à¸œà¸™à¸ªà¸³à¸£à¸­à¸‡à¸ªà¸¸à¸”à¸—à¹‰à¸²à¸¢: visit à¹‚à¸”à¸¢à¸•à¸£à¸‡ (à¸à¸±à¸™à¸—à¸¸à¸à¹€à¸„à¸ª)
    cy.visit('http://localhost:3000/expense');
    cy.location('pathname', { timeout: 10000 }).should('include', '/expense');
  });
}

describe('à¹€à¸žà¸´à¹ˆà¸¡à¸«à¸¡à¸§à¸”à¸«à¸¡à¸¹à¹ˆ', () => {
  beforeEach(() => {
    uiLogin();
    goToExpense();
  });

  it('E2E-CUSTOMOUTCOME-001 : à¸œà¸¹à¹‰à¹ƒà¸Šà¹‰à¸ªà¸²à¸¡à¸²à¸£à¸–à¹€à¸žà¸´à¹ˆà¸¡à¸«à¸¡à¸§à¸”à¸«à¸¡à¸¹à¹ˆà¹ƒà¸«à¸¡à¹ˆà¹„à¸”à¹‰', () => {
    // à¸à¸”à¸«à¸¡à¸§à¸” â€œà¸­à¸·à¹ˆà¸™à¹†â€
    cy.get('button.cat span', { timeout: 10000 }).contains('à¸­à¸·à¹ˆà¸™à¹†').click({ force: true });

    // à¸„à¹‰à¸™à¸«à¸²à¹„à¸­à¸„à¸­à¸™
    cy.get('input.cc-search-input', { timeout: 10000 })
      .should('have.attr', 'placeholder')
      .and('include', 'à¸„à¹‰à¸™à¸«à¸²à¹„à¸­à¸„à¸­à¸™');
    cy.get('input.cc-search-input').clear().type('à¹€à¸‡à¸´à¸™');

    // à¸žà¸´à¸¡à¸žà¹Œà¸Šà¸·à¹ˆà¸­à¸«à¸¡à¸§à¸”à¸«à¸¡à¸¹à¹ˆ
    cy.get('input.cc-nameinput', { timeout: 10000 }).clear().type('à¹€à¸‡à¸´à¸™à¹€à¸”à¸·à¸­à¸™');

    // à¹€à¸¥à¸·à¸­à¸à¹„à¸­à¸„à¸­à¸™ â€œà¸à¸£à¸°à¹€à¸›à¹‹à¸²à¹€à¸‡à¸´à¸™â€
    cy.get('button.cc-chip[title="à¸à¸£à¸°à¹€à¸›à¹‹à¸²à¹€à¸‡à¸´à¸™"]', { timeout: 10000 }).click({ force: true });

    // à¸à¸”à¸¢à¸·à¸™à¸¢à¸±à¸™
    cy.get('button.cc-confirm[aria-label="à¸¢à¸·à¸™à¸¢à¸±à¸™"]', { timeout: 10000 }).click({ force: true });

    // à¸•à¸£à¸§à¸ˆà¸ªà¸­à¸šà¸§à¹ˆà¸²à¸«à¸¡à¸§à¸”à¹ƒà¸«à¸¡à¹ˆà¸›à¸£à¸²à¸à¸à¸ˆà¸£à¸´à¸‡
    cy.contains(/à¹€à¸‡à¸´à¸™à¹€à¸”à¸·à¸­à¸™/, { timeout: 10000 }).should('exist');
  });
});



