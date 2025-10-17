// cypress/e2e/accountselect.cy.ts

// ---------------- helpers ----------------
function uiLogin() {
  cy.visit('http://localhost:3000/login');

  cy.get(
    'input[placeholder*="user"], input[placeholder*="username"], input[autocomplete="username"], input[name="username"], input#username'
  )
    .first()
    .clear()
    .type('john');

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

function goToAccountSelect() {
  cy.visit('http://localhost:3000/accountselect');
  cy.location('pathname', { timeout: 10000 }).should('include', '/accountselect');
}

/** à¸à¸”à¸Ÿà¸´à¸¥à¹€à¸•à¸­à¸£à¹Œ "à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸”" à¹à¸šà¸š optional à¸ˆà¸£à¸´à¸‡ à¹† (à¹„à¸¡à¹ˆà¹€à¸ˆà¸­ = à¸‚à¹‰à¸²à¸¡) */
function clickFilterAllIfVisible() {
  cy.get('body').then(($body) => {
    // à¸«à¸²à¸­à¸‡à¸„à¹Œà¸›à¸£à¸°à¸à¸­à¸šà¸—à¸µà¹ˆ "à¸¡à¸µà¸‚à¹‰à¸­à¸„à¸§à¸²à¸¡ à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸”" à¹à¸¥à¸° "à¸¡à¸­à¸‡à¹€à¸«à¹‡à¸™" à¹„à¸¡à¹ˆà¸šà¸±à¸‡à¸„à¸±à¸šà¸§à¹ˆà¸²à¹€à¸›à¹‡à¸™ <button.seg>
    const $cand = $body
      .find('*:contains("à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸”"):visible')
      .filter((_, el) => Cypress.$(el).text().trim() === 'à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸”')
      .first();

    if ($cand.length) {
      cy.wrap($cand).scrollIntoView().click({ force: true });
    }
  });
}

/** à¹€à¸„à¸¥à¸µà¸¢à¸£à¹Œà¸”à¸²à¸§à¹€à¸«à¸¥à¸·à¸­à¸‡à¸—à¸±à¹‰à¸‡à¸«à¸™à¹‰à¸² (à¸–à¹‰à¸²à¸¡à¸µ) â€” à¸”à¸¹à¸ˆà¸²à¸ path à¸—à¸µà¹ˆà¸¡à¸µ fill="currentColor" */
function clearAllFavoritesIfAny() {
  cy.get('body').then(($body) => {
    const $filled = $body.find('svg path[fill="currentColor"]');
    if ($filled.length > 0) {
      cy.wrap($filled).each(($el) => {
        cy.wrap($el).scrollIntoView().click({ force: true });
      });
    }
  });
}

/** à¸ªà¸¥à¸±à¸šà¸”à¸²à¸§à¹ƒà¸™à¹à¸–à¸§à¸—à¸µà¹ˆà¸£à¸°à¸šà¸¸à¸‚à¹‰à¸­à¸„à¸§à¸²à¸¡ */
function toggleStarInRowByText(rowText: string) {
  // à¹ƒà¸Šà¹‰à¸•à¸±à¸§à¹€à¸¥à¸·à¸­à¸à¸à¸§à¹‰à¸²à¸‡ à¹† à¹€à¸žà¸·à¹ˆà¸­à¸„à¸£à¸­à¸šà¸„à¸¥à¸¸à¸¡à¸«à¸¥à¸²à¸¢à¹‚à¸„à¸£à¸‡à¸ªà¸£à¹‰à¸²à¸‡ DOM
  cy.contains('button, .card, li, [role="listitem"], .item, .row, div', rowText)
    .filter(':visible')
    .first()
    .as('row');

  cy.get('@row').within(() => {
    // à¹€à¸¥à¸·à¸­à¸à¹„à¸­à¸„à¸­à¸™à¸”à¸²à¸§à¸•à¸±à¸§à¸—à¹‰à¸²à¸¢à¸ªà¸¸à¸”à¹ƒà¸™à¹à¸–à¸§ (à¸à¸£à¸“à¸µà¸¡à¸µà¸«à¸¥à¸²à¸¢à¸•à¸±à¸§)
    cy.get('svg:has(path)').last().scrollIntoView().click({ force: true });
  });
}

/** à¸¢à¸·à¸™à¸¢à¸±à¸™à¸§à¹ˆà¸²à¹à¸–à¸§à¸¡à¸µà¸”à¸²à¸§ "à¸•à¸´à¸”" (à¸¡à¸µ path à¸—à¸µà¹ˆ fill="currentColor") */
function assertRowStarOn(rowText: string) {
  cy.contains('button, .card, li, [role="listitem"], .item, .row, div', rowText)
    .filter(':visible')
    .first()
    .as('row');

  cy.get('@row').within(() => {
    cy.get('svg path[fill="currentColor"]', { timeout: 4000 }).should('exist');
  });
}

/** à¸¢à¸·à¸™à¸¢à¸±à¸™à¸§à¹ˆà¸² â€œà¸—à¸±à¹‰à¸‡à¸«à¸™à¹‰à¸²â€ à¸¡à¸µà¸”à¸²à¸§à¹€à¸«à¸¥à¸·à¸­à¸‡à¸•à¸´à¸”à¸­à¸¢à¸¹à¹ˆà¹à¸„à¹ˆà¹à¸–à¸§à¹€à¸”à¸µà¸¢à¸§ à¹à¸¥à¸°à¹€à¸›à¹‡à¸™à¹à¸–à¸§à¸—à¸µà¹ˆà¹€à¸£à¸²à¸£à¸°à¸šà¸¸ */
function assertOnlyThisRowStarOn(rowText: string) {
  // à¸™à¸±à¸šà¸ˆà¸³à¸™à¸§à¸™à¸”à¸²à¸§à¹€à¸«à¸¥à¸·à¸­à¸‡à¸—à¸±à¹‰à¸‡à¸«à¸™à¹‰à¸²
  cy.get('svg path[fill="currentColor"]').then(($all) => {
    // à¸–à¹‰à¸²à¹à¸­à¸›à¸”à¸µà¹„à¸‹à¸™à¹Œà¹ƒà¸«à¹‰à¸•à¸´à¸”à¹„à¸”à¹‰à¸«à¸¥à¸²à¸¢à¸­à¸±à¸™ à¹ƒà¸«à¹‰à¸„à¸­à¸¡à¹€à¸¡à¸™à¸•à¹Œà¸šà¸£à¸£à¸—à¸±à¸”à¸™à¸µà¹‰à¸­à¸­à¸
    expect($all.length, 'à¸„à¸§à¸£à¹€à¸«à¸¥à¸·à¸­à¸”à¸²à¸§à¹€à¸«à¸¥à¸·à¸­à¸‡à¹€à¸žà¸µà¸¢à¸‡ 1 à¸”à¸§à¸‡').to.equal(1);
  });

  // à¸•à¸£à¸§à¸ˆà¸§à¹ˆà¸²à¸­à¸¢à¸¹à¹ˆà¹ƒà¸™à¹à¸–à¸§à¸—à¸µà¹ˆà¸£à¸°à¸šà¸¸
  cy.contains('button, .card, li, [role="listitem"], .item, .row, div', rowText)
    .filter(':visible')
    .first()
    .as('row');

  cy.get('@row').within(() => {
    cy.get('svg path[fill="currentColor"]').should('exist');
  });
}

// ---------------- main test ----------------
describe('E2E-ACCT-001 : à¸•à¸´à¸”à¸”à¸²à¸§à¸šà¸±à¸à¸Šà¸µà¸—à¸µà¹ˆà¹ƒà¸Šà¹‰à¸šà¹ˆà¸­à¸¢ (Account Select)', () => {
  it('à¸¥à¹‡à¸­à¸à¸­à¸´à¸™ â†’ à¹„à¸› accountselect â†’ (à¸–à¹‰à¸²à¸¡à¸µ)à¸à¸”à¸Ÿà¸´à¸¥à¹€à¸•à¸­à¸£à¹Œà¸—à¸±à¹‰à¸‡à¸«à¸¡à¸” â†’ à¹€à¸„à¸¥à¸µà¸¢à¸£à¹Œà¸”à¸²à¸§ â†’ à¸•à¸´à¸”à¸”à¸²à¸§ "à¸šà¸±à¸•à¸£KTC" â†’ à¸•à¸£à¸§à¸ˆà¸ªà¸­à¸š', () => {
    uiLogin();
    goToAccountSelect();

    // à¸›à¸¸à¹ˆà¸¡/à¸•à¸±à¸§à¸à¸£à¸­à¸‡ "à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸”" à¹€à¸›à¹‡à¸™ optional (à¸–à¹‰à¸²à¹‚à¸œà¸¥à¹ˆà¸„à¹ˆà¸­à¸¢à¸à¸”)
    clickFilterAllIfVisible();

    // à¹€à¸„à¸¥à¸µà¸¢à¸£à¹Œà¸”à¸²à¸§à¹€à¸«à¸¥à¸·à¸­à¸‡à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸”à¸à¹ˆà¸­à¸™à¹€à¸£à¸´à¹ˆà¸¡ (à¸–à¹‰à¸²à¸¡à¸µ)
    clearAllFavoritesIfAny();

    // à¸•à¸´à¸”à¸”à¸²à¸§à¹ƒà¸«à¹‰ "à¸šà¸±à¸•à¸£KTC"
    toggleStarInRowByText('à¸šà¸±à¸•à¸£KTC');

    // à¹à¸–à¸§ "à¸šà¸±à¸•à¸£KTC" à¸•à¹‰à¸­à¸‡à¸¡à¸µà¸”à¸²à¸§à¹€à¸«à¸¥à¸·à¸­à¸‡à¹à¸¥à¹‰à¸§
    assertRowStarOn('à¸šà¸±à¸•à¸£KTC');

    // (à¸–à¹‰à¸²à¸•à¹‰à¸­à¸‡à¸à¸²à¸£ strict) à¸¢à¸·à¸™à¸¢à¸±à¸™à¸§à¹ˆà¸²à¸¡à¸µà¹à¸„à¹ˆà¹à¸–à¸§à¸™à¸µà¹‰à¸—à¸µà¹ˆà¸”à¸²à¸§à¹€à¸«à¸¥à¸·à¸­à¸‡
    // à¸–à¹‰à¸²à¸”à¸µà¹„à¸‹à¸™à¹Œà¸­à¸™à¸¸à¸à¸²à¸•à¸«à¸¥à¸²à¸¢ favorite à¹ƒà¸«à¹‰à¸„à¸­à¸¡à¹€à¸¡à¸™à¸•à¹Œà¸—à¸´à¹‰à¸‡
    assertOnlyThisRowStarOn('à¸šà¸±à¸•à¸£KTC');
  });
});



