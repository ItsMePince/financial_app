function uiLogin() {
  cy.visit('http://localhost:3000/login');

  // à¸à¸£à¸­à¸à¸Šà¸·à¹ˆà¸­à¸œà¸¹à¹‰à¹ƒà¸Šà¹‰ (à¹€à¸œà¸·à¹ˆà¸­à¸«à¸¥à¸²à¸¢ selector)
  cy.get(
    'input[placeholder*="user"], input[placeholder*="username"], input[autocomplete="username"], input[name="username"], input#username'
  )
    .first()
    .clear()
    .type('john');

  // à¸à¸£à¸­à¸à¸£à¸«à¸±à¸ªà¸œà¹ˆà¸²à¸™
  cy.get(
    'input[placeholder*="pass"], input[placeholder*="à¸£à¸«à¸±à¸ª"], input[autocomplete="current-password"], input[name="password"], input#password'
  )
    .first()
    .clear()
    .type('pass123');

  // à¸„à¸¥à¸´à¸à¸›à¸¸à¹ˆà¸¡ Login
  cy.contains('button, [type="submit"]', /login|à¹€à¸‚à¹‰à¸²à¸ªà¸¹à¹ˆà¸£à¸°à¸šà¸š/i)
    .first()
    .click();

  // à¸¡à¸²à¸–à¸¶à¸‡ /home à¹à¸¥à¹‰à¸§
  cy.location('pathname', { timeout: 10000 }).should('include', '/home');
}

describe('E2E-HOME', () => {
  beforeEach(() => {
    uiLogin();
  });

  it('à¸”à¸¹à¸ªà¸£à¸¸à¸›à¸£à¸§à¸¡à¸‚à¸­à¸‡à¸§à¸±à¸™à¸­à¸·à¹ˆà¸™à¹†: 10/2025 -> (à¸à¸” Next) -> 11/2025', () => {
    // à¹€à¸¥à¹‡à¸‡à¸ªà¹ˆà¸§à¸™à¸—à¸µà¹ˆà¹‚à¸Šà¸§à¹Œà¹€à¸”à¸·à¸­à¸™/à¸›à¸µ à¹€à¸Šà¹ˆà¸™ <span>10/2025</span>
    cy.contains('span', /\b\d{1,2}\/\d{4}\b/)
      .should('contain.text', '10/2025');

    // à¸à¸”à¸›à¸¸à¹ˆà¸¡ Next month: <button aria-label="Next month">â†’</button>
    cy.get('button[aria-label="Next month"]').click();

    // à¸•à¸£à¸§à¸ˆà¸§à¹ˆà¸²à¹€à¸›à¸¥à¸µà¹ˆà¸¢à¸™à¹€à¸›à¹‡à¸™ 11/2025
    cy.contains('span', /\b\d{1,2}\/\d{4}\b/)
      .should('contain.text', '11/2025');
  });

  it('à¸”à¸¹à¸£à¸²à¸¢à¸à¸²à¸£à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸”: à¸„à¸¥à¸´à¸à¸¥à¸´à¸‡à¸à¹Œ "à¸”à¸¹à¸—à¸±à¹‰à¸‡à¸«à¸¡à¸”" à¹à¸¥à¹‰à¸§à¹„à¸› /summary', () => {
    cy.get('a.transaction-link[href="/summary"]')
      .should('be.visible')
      .click();

    cy.location('pathname', { timeout: 10000 }).should('include', '/summary');
  });

  it('à¹à¸à¹‰à¹„à¸‚à¸šà¸±à¸à¸Šà¸µà¸˜à¸™à¸²à¸„à¸²à¸£: à¹€à¸›à¸´à¸”à¹€à¸¡à¸™à¸¹à¸ˆà¸¸à¸”à¸ªà¸²à¸¡à¸ˆà¸¸à¸” à¹à¸¥à¹‰à¸§à¸à¸” "à¹à¸à¹‰à¹„à¸‚" à¹„à¸› /accountnew', () => {
    // à¹€à¸›à¸´à¸”à¹€à¸¡à¸™à¸¹à¸ˆà¸¸à¸”à¸ªà¸²à¸¡à¸ˆà¸¸à¸”à¸‚à¸­à¸‡à¸à¸²à¸£à¹Œà¸”à¸šà¸±à¸à¸Šà¸µà¸˜à¸™à¸²à¸„à¸²à¸£ (à¹€à¸¥à¸·à¸­à¸à¸•à¸±à¸§à¹à¸£à¸à¸—à¸µà¹ˆà¹€à¸«à¹‡à¸™)
    // à¸£à¸­à¸‡à¸£à¸±à¸šà¸—à¸±à¹‰à¸‡à¸›à¸¸à¹ˆà¸¡à¸—à¸µà¹ˆà¹€à¸›à¹‡à¸™ .more-btn à¸«à¸£à¸·à¸­ <button> à¸—à¸±à¹ˆà¸§à¹„à¸›à¸—à¸µà¹ˆà¸¡à¸µà¹„à¸­à¸„à¸­à¸™ ellipsis
    cy.get('.category-card')
      .first()
      .within(() => {
        cy.get('button, .more-btn')
          .filter(':visible')
          .first()
          .click({ force: true });
      });

    // à¸„à¸¥à¸´à¸à¸›à¸¸à¹ˆà¸¡à¹€à¸¡à¸™à¸¹à¸£à¸²à¸¢à¸à¸²à¸£ "à¹à¸à¹‰à¹„à¸‚"
    cy.get('button.more-item')
      .contains('span', 'à¹à¸à¹‰à¹„à¸‚')
      .closest('button.more-item')
      .click();

    // à¹„à¸›à¸«à¸™à¹‰à¸² accountnew
    cy.location('pathname', { timeout: 10000 }).should('include', '/accountnew');
  });

  it('à¸¥à¸šà¸šà¸±à¸à¸Šà¸µà¸˜à¸™à¸²à¸„à¸²à¸£: à¹€à¸›à¸´à¸”à¹€à¸¡à¸™à¸¹ -> à¸à¸” "à¸¥à¸š" -> à¸à¸”à¸¢à¸·à¸™à¸¢à¸±à¸™ OK à¹à¸¥à¹‰à¸§à¸à¸²à¸£à¹Œà¸”à¸–à¸¹à¸à¹à¸—à¸™à¸”à¹‰à¸§à¸¢à¸›à¸¸à¹ˆà¸¡ + (à¸¥à¸´à¸‡à¸à¹Œ /accountnew)', () => {
    // à¹€à¸›à¸´à¸”à¹€à¸¡à¸™à¸¹à¸ˆà¸¸à¸”à¸ªà¸²à¸¡à¸ˆà¸¸à¸”à¸‚à¸­à¸‡à¸à¸²à¸£à¹Œà¸”à¸šà¸±à¸à¸Šà¸µà¸˜à¸™à¸²à¸„à¸²à¸£ (à¸•à¸±à¸§à¹à¸£à¸)
    cy.get('.category-card')
      .first()
      .within(() => {
        cy.get('button, .more-btn')
          .filter(':visible')
          .first()
          .click({ force: true });
      });

    // à¸”à¸±à¸ confirm à¹à¸¥à¹‰à¸§à¸•à¸­à¸š OK
    cy.on('window:confirm', (txt) => {
      // à¸‚à¹‰à¸­à¸„à¸§à¸²à¸¡à¸›à¸£à¸°à¸¡à¸²à¸“: à¸¥à¸šà¸šà¸±à¸à¸Šà¸µ "à¸­à¸­à¸¡à¸ªà¸´à¸™" à¹ƒà¸Šà¹ˆà¹„à¸«à¸¡?
      expect(txt).to.match(/à¸¥à¸šà¸šà¸±à¸à¸Šà¸µ|à¸¥à¸š/);
      return true; // à¸à¸” OK
    });

    // à¸„à¸¥à¸´à¸à¸›à¸¸à¹ˆà¸¡à¹€à¸¡à¸™à¸¹à¸£à¸²à¸¢à¸à¸²à¸£ "à¸¥à¸š"
    cy.get('button.more-item.danger')
      .contains('span', 'à¸¥à¸š')
      .closest('button.more-item.danger')
      .click();

    // à¸«à¸¥à¸±à¸‡à¸¥à¸šà¸ªà¸³à¹€à¸£à¹‡à¸ˆ à¸ˆà¸°à¹€à¸«à¹‡à¸™à¸à¸²à¸£à¹Œà¸” + à¸—à¸µà¹ˆà¸¥à¸´à¸‡à¸à¹Œ /accountnew à¹à¸—à¸™à¸•à¸±à¸§à¹€à¸”à¸´à¸¡
    cy.get('a.category-card[href="/accountnew"]')
      .should('be.visible')
      .within(() => {
        // à¸¡à¸µà¸ªà¸±à¸à¸¥à¸±à¸à¸©à¸“à¹Œ +
        cy.contains('+').should('be.visible');
      });
  });
  it('à¹€à¸žà¸´à¹ˆà¸¡à¸šà¸±à¸à¸Šà¸µà¹ƒà¸«à¸¡à¹ˆ: à¸„à¸¥à¸´à¸à¸à¸²à¸£à¹Œà¸” + à¹„à¸› /accountnew (à¸–à¹‰à¸²à¹„à¸¡à¹ˆà¸¡à¸µà¸à¸²à¸£à¹Œà¸” + à¸ˆà¸°à¸¥à¸šà¸­à¸±à¸™à¹à¸£à¸à¸à¹ˆà¸­à¸™)', () => {
    // à¸–à¹‰à¸²à¸¡à¸µà¸à¸²à¸£à¹Œà¸” + à¸­à¸¢à¸¹à¹ˆà¹à¸¥à¹‰à¸§à¸à¸”à¹„à¸”à¹‰à¹€à¸¥à¸¢, à¸–à¹‰à¸²à¸¢à¸±à¸‡à¹„à¸¡à¹ˆà¸¡à¸µ à¹ƒà¸«à¹‰à¸¥à¸šà¸à¸²à¸£à¹Œà¸”à¸šà¸±à¸à¸Šà¸µà¸•à¸±à¸§à¹à¸£à¸à¸à¹ˆà¸­à¸™
    cy.get('a.category-card[href="/accountnew"]').then(($plus) => {
      if ($plus.length > 0) {
        cy.wrap($plus.first()).click();
      } else {
        // à¹€à¸›à¸´à¸”à¹€à¸¡à¸™à¸¹à¸ˆà¸¸à¸”à¸ªà¸²à¸¡à¸ˆà¸¸à¸”à¸‚à¸­à¸‡à¸à¸²à¸£à¹Œà¸”à¸šà¸±à¸à¸Šà¸µà¸˜à¸™à¸²à¸„à¸²à¸£à¸•à¸±à¸§à¹à¸£à¸à¹à¸¥à¹‰à¸§à¸à¸” "à¸¥à¸š"
        cy.get('.category-card')
          .first()
          .within(() => {
            cy.get('button, .more-btn')
              .filter(':visible')
              .first()
              .click({ force: true });
          });

        cy.on('window:confirm', () => true); // à¸•à¸­à¸š OK

        cy.get('button.more-item.danger')
          .contains('span', 'à¸¥à¸š')
          .closest('button.more-item.danger')
          .click();

        // à¸£à¸­à¹ƒà¸«à¹‰à¸à¸²à¸£à¹Œà¸” + à¹‚à¸œà¸¥à¹ˆ à¹à¸¥à¹‰à¸§à¸„à¸¥à¸´à¸
        cy.get('a.category-card[href="/accountnew"]', { timeout: 10000 })
          .should('be.visible')
          .click();
      }
    });

    // à¹„à¸›à¸«à¸™à¹‰à¸² accountnew
    cy.location('pathname', { timeout: 10000 }).should('include', '/accountnew');
  });

  it('à¸¥à¹‡à¸­à¸„à¹€à¸­à¹‰à¸²: à¸à¸”à¸›à¸¸à¹ˆà¸¡ Logout à¹à¸¥à¹‰à¸§à¸à¸¥à¸±à¸šà¹„à¸›à¸«à¸™à¹‰à¸² /login', () => {
    // à¹€à¸œà¸·à¹ˆà¸­à¸šà¸²à¸‡à¸˜à¸µà¸¡à¸›à¸¸à¹ˆà¸¡à¸­à¸¢à¸¹à¹ˆà¸”à¹‰à¸²à¸™à¸šà¸™à¹€à¸ªà¸¡à¸­ à¹ƒà¸«à¹‰à¸¡à¸±à¹ˆà¸™à¹ƒà¸ˆà¸§à¹ˆà¸²à¹€à¸«à¹‡à¸™à¸›à¸¸à¹ˆà¸¡
    cy.get('button.header__logout[title="Logout"], button.header__logout')
      .filter(':visible')
      .first()
      .click({ force: true });

    cy.location('pathname', { timeout: 10000 }).should('include', '/login');
  });
});



