/// <reference types="cypress" />

// ================= helpers =================
function uiLogin() {
  cy.visit('http://localhost:3000/login');

  cy.get(
    'input[placeholder*="user"], input[placeholder*="username"], input[autocomplete="username"], input[name="username"], input#username, input[type="email"]'
  )
    .filter(':visible')
    .first()
    .clear()
    .type('john');

  cy.get(
    'input[placeholder*="pass"], input[placeholder*="à¸£à¸«à¸±à¸ª"], input[autocomplete="current-password"], input[name="password"], input#password, input[type="password"]'
  )
    .filter(':visible')
    .first()
    .clear()
    .type('pass123');

  cy.contains('button, [type="submit"]', /login|à¹€à¸‚à¹‰à¸²à¸ªà¸¹à¹ˆà¸£à¸°à¸šà¸š/i)
    .filter(':visible')
    .first()
    .click();

  cy.location('pathname', { timeout: 10000 }).should('include', '/home');
}

function nav(href: string) {
  cy.get(`a.nav-button[href="${href}"]`).filter(':visible').first().click({ force: true });
}

function setHiddenDateISO(isoDate: string) {
  cy.get('.seg.date-seg input[type="date"]', { timeout: 5000 })
    .first()
    .then(($inp) => {
      const el = $inp[0] as HTMLInputElement;

      // à¹ƒà¸Šà¹‰ native setter à¹€à¸žà¸·à¹ˆà¸­à¹ƒà¸«à¹‰ React à¸ˆà¸±à¸šà¹„à¸”à¹‰
      const proto = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
      proto?.set?.call(el, isoDate);

      // à¸à¸£à¸°à¸•à¸¸à¹‰à¸™à¸—à¸±à¹‰à¸‡ input à¹à¸¥à¸° change (à¹ƒà¸«à¹‰ bubbles à¹€à¸žà¸·à¹ˆà¸­à¸§à¸´à¹ˆà¸‡à¹€à¸‚à¹‰à¸²à¸•à¸±à¸§ handler)
      el.dispatchEvent(new Event('input',  { bubbles: true, composed: true }));
      el.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    });

  // à¸¢à¸·à¸™à¸¢à¸±à¸™à¸§à¹ˆà¸²à¸„à¹ˆà¸²à¹ƒà¸™ input à¹€à¸›à¸¥à¸µà¹ˆà¸¢à¸™à¸ˆà¸£à¸´à¸‡
  cy.get('.seg.date-seg input[type="date"]').first().should('have.value', isoDate);
}

function keypadEnterNumber(n: string) {
  n.split('').forEach((ch) => {
    cy.contains('button.key', ch).filter(':visible').first().click({ force: true });
  });
}

function clickOkAndExpectAlert() {
  cy.window().then((w) => cy.stub(w, 'alert').as('alertStub'));
  cy.get('button.ok-btn').filter(':visible').first().click({ force: true });
  cy.get('@alertStub').should('have.been.called');
}

function goSummary() {
  nav('/home');
  cy.get('a.transaction-link[href="/summary"]').filter(':visible').first().click({ force: true });
  cy.location('pathname').should('include', '/summary');
}

function assertDayCard(ddmm: string, title: string, tag: string, amtText: string | RegExp) {
  cy.contains('.day-card .day-date', ddmm)
    .should('exist')
    .parents('.day-card')
    .within(() => {
      cy.contains('.row-title', title).should('exist');
      cy.contains('.row-tag', tag).should('exist');
      cy.get('.row-amt').should('contain.text', amtText as any);
    });
}

// ================= tests =================
describe('accountselect - à¹€à¸žà¸´à¹ˆà¸¡à¸„à¹ˆà¸²à¹ƒà¸Šà¹‰à¸ˆà¹ˆà¸²à¸¢ à¹à¸¥à¸°à¸£à¸²à¸¢à¹„à¸”à¹‰', () => {
  it('à¹€à¸žà¸´à¹ˆà¸¡à¸„à¹ˆà¸²à¹ƒà¸Šà¹‰à¸ˆà¹ˆà¸²à¸¢: à¸à¸”à¸›à¸£à¸°à¹€à¸ à¸—à¸à¸²à¸£à¸Šà¸³à¸£à¸°à¹€à¸‡à¸´à¸™à¸à¹ˆà¸­à¸™ / à¹„à¸—à¸¢à¸žà¸²à¸“à¸´à¸Šà¸¢à¹Œ / à¸„à¹ˆà¸²à¹€à¸”à¸´à¸™à¸—à¸²à¸‡ / à¸§à¸±à¸™à¸—à¸µà¹ˆ 09/10/2568 / 9 à¸šà¸²à¸—', () => {
    uiLogin();
    nav('/expense');

    // ðŸ”¹ à¸à¸”à¸›à¸£à¸°à¹€à¸ à¸—à¸à¸²à¸£à¸Šà¸³à¸£à¸°à¹€à¸‡à¸´à¸™à¸à¹ˆà¸­à¸™
    cy.contains('button.seg', /à¸›à¸£à¸°à¹€à¸ à¸—|à¸Šà¸³à¸£à¸°|à¸˜\./i).filter(':visible').first().click({ force: true });

    // ðŸ”¹ à¹€à¸¥à¸·à¸­à¸à¸šà¸±à¸à¸Šà¸µ à¹„à¸—à¸¢à¸žà¸²à¸“à¸´à¸Šà¸¢à¹Œ
    cy.contains('button.card .card__label, button.card', /à¹„à¸—à¸¢à¸žà¸²à¸“à¸´à¸Šà¸¢à¹Œ/)
      .filter(':visible')
      .first()
      .click({ force: true });

    // ðŸ”¹ à¹€à¸¥à¸·à¸­à¸à¸«à¸¡à¸§à¸”à¸«à¸¡à¸¹à¹ˆ à¸„à¹ˆà¸²à¹€à¸”à¸´à¸™à¸—à¸²à¸‡
    cy.contains('button.cat', 'à¸„à¹ˆà¸²à¹€à¸”à¸´à¸™à¸—à¸²à¸‡').filter(':visible').first().click({ force: true });

    // ðŸ”¹ à¸•à¸±à¹‰à¸‡à¸§à¸±à¸™à¸—à¸µà¹ˆ (09/10/2568 -> 2025-10-09)
    setHiddenDateISO('2025-10-09');

    // ðŸ”¹ à¸à¸£à¸­à¸à¹‚à¸™à¹‰à¸•/à¸ªà¸–à¸²à¸™à¸—à¸µà¹ˆ
    cy.get('input[placeholder="à¹‚à¸™à¹‰à¸•"]').filter(':visible').first().clear().type('à¹€à¸—à¸ª');
    cy.get('input[placeholder="à¸ªà¸–à¸²à¸™à¸—à¸µà¹ˆ"]').filter(':visible').first().clear().type('à¹€à¸—à¸ª');

    // ðŸ”¹ à¹ƒà¸ªà¹ˆà¸ˆà¸³à¸™à¸§à¸™ 9 à¸šà¸²à¸—
    keypadEnterNumber('9');
    clickOkAndExpectAlert();

    // ðŸ”¹ à¸•à¸£à¸§à¸ˆà¹ƒà¸™ Summary
    goSummary();
    assertDayCard('09/10', 'à¸„à¹ˆà¸²à¹€à¸”à¸´à¸™à¸—à¸²à¸‡', 'à¹„à¸—à¸¢à¸žà¸²à¸“à¸´à¸Šà¸¢à¹Œ', '-9');
  });

  it('à¹€à¸žà¸´à¹ˆà¸¡à¸£à¸²à¸¢à¹„à¸”à¹‰: à¸à¸”à¸›à¸£à¸°à¹€à¸ à¸—à¸à¸²à¸£à¸Šà¸³à¸£à¸°à¹€à¸‡à¸´à¸™à¸à¹ˆà¸­à¸™ / à¸­à¸­à¸¡à¸ªà¸´à¸™ / à¸¥à¸‡à¸—à¸¸à¸™ / à¸§à¸±à¸™à¸—à¸µà¹ˆ 06/10/2568 / 6 à¸šà¸²à¸—', () => {
    uiLogin();
    nav('/expense');

    // ðŸ”¹ à¸ªà¸¥à¸±à¸šà¹€à¸›à¹‡à¸™ "à¸£à¸²à¸¢à¹„à¸”à¹‰" à¸à¹ˆà¸­à¸™
    cy.get('button.pill').filter(':visible').first().click({ force: true });
    cy.contains('button, li, [role="option"]', /à¸£à¸²à¸¢à¹„à¸”à¹‰|income/i)
      .filter(':visible')
      .first()
      .click({ force: true })
      .then(() => cy.wait(200));

    // ðŸ”¹ à¸à¸”à¸›à¸£à¸°à¹€à¸ à¸—à¸à¸²à¸£à¸Šà¸³à¸£à¸°à¹€à¸‡à¸´à¸™à¸à¹ˆà¸­à¸™
    cy.contains('button.seg', /à¸›à¸£à¸°à¹€à¸ à¸—|à¸Šà¸³à¸£à¸°|à¸˜\./i).filter(':visible').first().click({ force: true });

    // ðŸ”¹ à¹€à¸¥à¸·à¸­à¸à¸šà¸±à¸à¸Šà¸µ à¸­à¸­à¸¡à¸ªà¸´à¸™
    cy.contains('button.card .card__label, button.card', /à¸­à¸­à¸¡à¸ªà¸´à¸™/)
      .filter(':visible')
      .first()
      .click({ force: true });

    // ðŸ”¹ à¹€à¸¥à¸·à¸­à¸à¸«à¸¡à¸§à¸”à¸«à¸¡à¸¹à¹ˆ à¸¥à¸‡à¸—à¸¸à¸™
    cy.contains('button.cat', 'à¸¥à¸‡à¸—à¸¸à¸™').filter(':visible').first().click({ force: true });

    // ðŸ”¹ à¸•à¸±à¹‰à¸‡à¸§à¸±à¸™à¸—à¸µà¹ˆ (06/10/2568 -> 2025-10-06)
    setHiddenDateISO('2025-10-06');

    // ðŸ”¹ à¸à¸£à¸­à¸à¹‚à¸™à¹‰à¸•/à¸ªà¸–à¸²à¸™à¸—à¸µà¹ˆ
    cy.get('input[placeholder="à¹‚à¸™à¹‰à¸•"]').filter(':visible').first().clear().type('à¹€à¸—à¸ª2');
    cy.get('input[placeholder="à¸ªà¸–à¸²à¸™à¸—à¸µà¹ˆ"]').filter(':visible').first().clear().type('à¹€à¸—à¸ª2');

    // ðŸ”¹ à¹ƒà¸ªà¹ˆà¸ˆà¸³à¸™à¸§à¸™ 6 à¸šà¸²à¸—
    keypadEnterNumber('6');
    clickOkAndExpectAlert();

    // ðŸ”¹ à¸•à¸£à¸§à¸ˆà¹ƒà¸™ Summary
    goSummary();
    assertDayCard('06/10', 'à¸¥à¸‡à¸—à¸¸à¸™', 'à¸­à¸­à¸¡à¸ªà¸´à¸™', '6');
  });
});



