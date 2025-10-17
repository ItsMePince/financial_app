function uiLoginEnsure() {
  const doLogin = (user: string, pass: string) => {
    cy.visit('http://localhost:3000/login');

    cy.get(
      'input[placeholder*="user"], input[placeholder*="username"], input[autocomplete="username"], input[name="username"], input#username'
    )
      .first()
      .should('be.visible')
      .click()
      .type('{selectAll}{backspace}' + user, { delay: 0, force: true });

    cy.get(
      'input[placeholder*="pass"], input[placeholder*="à¸£à¸«à¸±à¸ª"], input[autocomplete="current-password"], input[name="password"], input#password'
    )
      .first()
      .should('be.visible')
      .click()
      .type('{selectAll}{backspace}' + pass, { delay: 0, force: true });

    cy.contains('button, [type="submit"]', /login|à¹€à¸‚à¹‰à¸²à¸ªà¸¹à¹ˆà¸£à¸°à¸šà¸š/i).first().click({ force: true });
  };

  cy.location('pathname', { timeout: 8000 }).then((p) => {
    if (p.includes('/login')) {
      // à¸„à¸£à¸±à¹‰à¸‡à¸—à¸µà¹ˆ 2: ad/123456
      doLogin('john', 'pass123');
    }
  });

  cy.location('pathname', { timeout: 12000 }).should((p) => {
    expect(['/home', '/'].some((ok) => p === ok || p.endsWith(ok))).to.eq(true);
  });
}

/** à¹„à¸›à¸«à¸™à¹‰à¸² summary à¹à¸¥à¸°à¸£à¸­à¹‚à¸«à¸¥à¸”à¸‚à¹‰à¸­à¸¡à¸¹à¸¥ */
function goSummaryAndWait() {
  cy.intercept('GET', '**/api/expenses**').as('expenses');
  cy.visit('http://localhost:3000/summary');
  cy.wait('@expenses', { timeout: 15000 });
}

/** à¹€à¸›à¸´à¸”à¸à¸²à¸£à¹Œà¸”à¸§à¸±à¸™à¹à¸£à¸ (à¹„à¸¡à¹ˆà¸­à¸´à¸‡à¸‚à¹‰à¸­à¸„à¸§à¸²à¸¡à¸§à¸±à¸™à¸—à¸µà¹ˆ) */
function openFirstDayCard() {
  cy.get('section.day-card[role="button"]').should('have.length.greaterThan', 0).first().click({ force: true });
}

/** à¹€à¸›à¸´à¸”à¸£à¸²à¸¢à¸à¸²à¸£à¹à¸£à¸à¹ƒà¸™à¸§à¸±à¸™à¸™à¸±à¹‰à¸™ */
function openFirstRow() {
  cy.get('.row.clickable').should('exist').first().scrollIntoView().click({ force: true });
  cy.contains('button', 'à¹à¸à¹‰à¹„à¸‚').should('be.visible');
}

/** à¸„à¸·à¸™ element input/select à¸•à¸±à¸§à¹à¸£à¸à¹ƒà¸•à¹‰à¸‰à¸¥à¸²à¸à¸—à¸µà¹ˆà¸£à¸°à¸šà¸¸ (à¹„à¸—à¸¢/à¸­à¸±à¸‡à¸à¸¤à¸©à¹„à¸”à¹‰) */
function field(labelText: string) {
  return cy.contains('label,div', new RegExp(labelText, 'i')).parent().find('input,select').first();
}

/** à¸ªà¸£à¹‰à¸²à¸‡à¸£à¸²à¸¢à¸à¸²à¸£à¹à¸šà¸šà¹€à¸£à¹‡à¸§ à¸ˆà¸²à¸à¸«à¸™à¹‰à¸² Expense à¹à¸¥à¹‰à¸§à¸à¸¥à¸±à¸šà¸¡à¸²à¸—à¸µà¹ˆ Summary */
function seedExpenseAndGoSummary() {
  // à¹„à¸›à¸«à¸™à¹‰à¸² Expense
  cy.get('a.nav-button[href="/expense"]').then(($links) => {
    const $v = $links.filter(':visible');
    cy.wrap($v.length ? $v.first() : $links.first()).click();
  });

  cy.intercept('POST', '**/api/expenses**').as('saveExpense');

  // à¸à¸£à¸­à¸à¸‚à¸±à¹‰à¸™à¸•à¹ˆà¸³à¹ƒà¸«à¹‰à¸¡à¸µà¸£à¸²à¸¢à¸à¸²à¸£
  cy.get('input[placeholder="à¹‚à¸™à¹‰à¸•"]').clear().type('seed');
  cy.get('input[placeholder="à¸ªà¸–à¸²à¸™à¸—à¸µà¹ˆ"]').clear().type('seed');
  cy.contains('button.key', /^1$/).click();
  cy.get('button.ok-btn').click();

  cy.on('window:alert', () => true);
  cy.on('window:confirm', () => true);

  cy.wait('@saveExpense', { timeout: 15000 }).its('response.statusCode').should('be.oneOf', [200, 201, 204]);

  // à¸à¸¥à¸±à¸š Home
  cy.get('a.nav-button[href="/home"]').then(($links) => {
    const $v = $links.filter(':visible');
    cy.wrap($v.length ? $v.first() : $links.first()).click();
  });
  cy.location('pathname', { timeout: 10000 }).should((p) => {
    expect(['/home', '/'].some((ok) => p === ok || p.endsWith(ok))).to.eq(true);
  });

  // à¹„à¸› Summary à¹à¸¥à¸°à¹€à¸›à¸´à¸”à¸à¸²à¸£à¹Œà¸”à¸§à¸±à¸™à¹à¸£à¸
  goSummaryAndWait();
  openFirstDayCard();

  // à¸¢à¸·à¸™à¸¢à¸±à¸™à¸§à¹ˆà¸²à¸¡à¸µà¸£à¸²à¸¢à¸à¸²à¸£
  cy.get('.row.clickable').should('have.length.greaterThan', 0);
}

// ----------------- Tests -----------------

describe('Summary > à¹à¸à¹‰à¹„à¸‚ / à¸¥à¸š (selectors à¸—à¸™ à¹à¸–à¸¡ seed à¸‚à¹‰à¸­à¸¡à¸¹à¸¥)', () => {
  // à¹„à¸¡à¹ˆà¹ƒà¸Šà¹‰ session cache â€” à¹ƒà¸«à¹‰à¹€à¸Šà¹‡à¸„/à¸¥à¹‡à¸­à¸à¸­à¸´à¸™à¹ƒà¸«à¸¡à¹ˆà¸—à¸¸à¸à¹€à¸„à¸ªà¹€à¸žà¸·à¹ˆà¸­à¸à¸±à¸™à¹‚à¸”à¸™à¹€à¸•à¸°à¸à¸¥à¸±à¸š /login à¸à¸¥à¸²à¸‡à¸—à¸²à¸‡
  beforeEach(() => {
    // à¸žà¸¢à¸²à¸¢à¸²à¸¡à¹€à¸£à¸´à¹ˆà¸¡à¸ˆà¸²à¸ /home à¸–à¹‰à¸²à¹‚à¸”à¸™à¹€à¸”à¹‰à¸‡à¹„à¸› /login à¹ƒà¸«à¹‰à¸¥à¹‡à¸­à¸à¸­à¸´à¸™à¹ƒà¸«à¸¡à¹ˆ
    cy.visit('http://localhost:3000/home');
    cy.location('pathname', { timeout: 6000 }).then((p) => {
      if (p.includes('/login')) {
        uiLoginEnsure(); // à¸¥à¹‡à¸­à¸à¸­à¸´à¸™à¹ƒà¸«à¹‰à¹€à¸‚à¹‰à¸²à¸«à¸™à¹‰à¸² home
      }
    });

    // à¸–à¸¶à¸‡à¸•à¸£à¸‡à¸™à¸µà¹‰à¸•à¹‰à¸­à¸‡à¸­à¸¢à¸¹à¹ˆ /home à¹à¸¥à¹‰à¸§ -> seed à¹à¸¥à¸°à¹„à¸› summary
    seedExpenseAndGoSummary();
  });

  it('EDIT-TRANSACTION-001 : à¹à¸à¹‰à¹„à¸‚à¸£à¸²à¸¢à¸à¸²à¸£à¸•à¸²à¸¡à¸—à¸µà¹ˆà¸à¸³à¸«à¸™à¸” à¹à¸¥à¹‰à¸§à¸„à¹ˆà¸²à¸šà¸™à¸à¸²à¸£à¹Œà¸”à¸•à¹‰à¸­à¸‡à¸­à¸±à¸›à¹€à¸”à¸•', () => {
    openFirstRow();
    cy.contains('button.btn.primary', 'à¹à¸à¹‰à¹„à¸‚').click();

    field('à¸›à¸£à¸°à¹€à¸ à¸—').select('à¸„à¹ˆà¸²à¹ƒà¸Šà¹‰à¸ˆà¹ˆà¸²à¸¢');
    field('à¸«à¸¡à¸§à¸”à¸«à¸¡à¸¹à¹ˆ').clear().type('à¸„à¹ˆà¸²à¸­à¸²à¸«à¸²à¸£');
    field('à¸ˆà¸³à¸™à¸§à¸™à¹€à¸‡à¸´à¸™').clear().type('50');
    field('à¸§à¸±à¸™à¸—à¸µà¹ˆ').invoke('val', '').type('2025-12-12');
    field('à¸šà¸±à¸à¸Šà¸µ').clear().type('à¸šà¸±à¸•à¸£à¹€à¸„à¸£à¸”à¸´à¸•');
    field('à¸§à¸´à¸˜à¸µà¸ˆà¹ˆà¸²à¸¢').clear().type('à¸£à¹‰à¸²à¸™à¸­à¸²à¸«à¸²à¸£');

    field('à¹‚à¸™à¹‰à¸•')
      .then(($el) => {
        if ($el.prop('readOnly')) cy.wrap($el).invoke('prop', 'readOnly', false);
      })
      .clear()
      .type('à¸›à¹‰à¸²à¸•à¸´à¹‹à¸¡');

    field('Icon Key')
      .then(($el) => {
        if (($el.val() as string)?.length) cy.wrap($el).clear();
      })
      .type('gift{enter}');

    cy.contains('button.btn.primary.stretch', 'à¸šà¸±à¸™à¸—à¸¶à¸').click();

    // à¹‚à¸«à¸¥à¸”à¹ƒà¸«à¸¡à¹ˆà¹à¸¥à¹‰à¸§à¸•à¸£à¸§à¸ˆà¸œà¸¥
    goSummaryAndWait();
    openFirstDayCard();

    cy.get('svg.lucide-gift').should('exist');
    cy.contains('.row-title', 'à¸„à¹ˆà¸²à¸­à¸²à¸«à¸²à¸£').should('be.visible');
    cy.contains('.row-tag', 'à¸šà¸±à¸•à¸£à¹€à¸„à¸£à¸”à¸´à¸•').should('be.visible');
    cy.contains('.row-amt', '-50').should('be.visible');
  });

  it('DELETE-TRANSACTION-001 : à¸¥à¸šà¸£à¸²à¸¢à¸à¸²à¸£à¸«à¸™à¸¶à¹ˆà¸‡à¸£à¸²à¸¢à¸à¸²à¸£ à¹à¸¥à¸°à¸•à¹‰à¸­à¸‡à¸«à¸²à¸¢à¸ˆà¸²à¸à¸«à¸™à¹‰à¸² UI', () => {
    cy.get('.row.clickable').then(($rowsBefore) => {
      const before = $rowsBefore.length;

      openFirstRow();
      cy.on('window:confirm', () => true);
      cy.contains('button.btn.danger', 'à¸¥à¸š').click();

      // à¹‚à¸«à¸¥à¸”à¹ƒà¸«à¸¡à¹ˆà¹à¸¥à¸°à¹€à¸›à¸´à¸”à¸à¸²à¸£à¹Œà¸”à¸§à¸±à¸™à¹à¸£à¸ à¹à¸¥à¹‰à¸§à¹€à¸Šà¹‡à¸à¸§à¹ˆà¸²à¸ˆà¸³à¸™à¸§à¸™à¸¥à¸”à¸¥à¸‡
      goSummaryAndWait();
      openFirstDayCard();
      cy.get('.row.clickable').should('have.length.lt', before);
    });
  });
});



