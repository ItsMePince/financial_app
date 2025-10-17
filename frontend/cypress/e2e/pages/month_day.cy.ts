// ---------------- Day sub-suite (flex) ----------------

// à¸¥à¹‡à¸­à¸à¸­à¸´à¸™à¹à¸šà¸šà¸¢à¸·à¸”à¸«à¸¢à¸¸à¹ˆà¸™ (à¸£à¸­à¸‡à¸£à¸±à¸šà¸«à¸¥à¸²à¸¢ selector/à¸ à¸²à¸©à¸²)
function uiLoginIfNeeded() {
  cy.location('pathname', { timeout: 10000 }).then((path) => {
    if (!path.includes('/login')) return;
    cy.get(
      [
        'input[type="text"]',
        'input[name="username"]',
        'input#username',
        'input[autocomplete="username"]',
        'input[placeholder*="user"]',
        'input[placeholder*="à¸Šà¸·à¹ˆà¸­à¸œà¸¹à¹‰à¹ƒà¸Šà¹‰"]',
        'input[type="email"]',
      ].join(', ')
    )
      .filter(':visible')
      .first()
      .clear()
      .type('john');

    cy.get(
      [
        'input[type="password"]',
        'input[name="password"]',
        'input#password',
        'input[autocomplete="current-password"]',
        'input[placeholder*="pass"]',
        'input[placeholder*="à¸£à¸«à¸±à¸ªà¸œà¹ˆà¸²à¸™"]',
      ].join(', ')
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
  });
}

// à¹„à¸› /month (à¸–à¹‰à¸²à¸¢à¸±à¸‡à¹„à¸¡à¹ˆà¸­à¸¢à¸¹à¹ˆ) à¹à¸¥à¹‰à¸§à¸à¸”à¹€à¸‚à¹‰à¸² /day?date=YYYY-MM-DD
function openDayFromMonth(dateISO: string) {
  cy.location('pathname').then((p) => {
    if (!/\/month$/.test(p)) {
      cy.get('a.nav-button[href="/month"]').filter(':visible').last().click({ force: true });
      cy.location('pathname').should('include', '/month');
    }
  });
  cy.get(`a.row[href="/day?date=${dateISO}"]`).should('exist').click({ force: true });
  cy.location('href', { timeout: 10000 }).should('include', `/day?date=${dateISO}`);
}

// à¹€à¸”à¸´à¸™à¸«à¸™à¹‰à¸²à¹„à¸›à¸ˆà¸™ .date-chip à¸¡à¸µà¸§à¸±à¸™à¸—à¸µà¹ˆà¹€à¸›à¹‰à¸²à¸«à¸¡à¸²à¸¢à¸£à¸¹à¸›à¹à¸šà¸š "dd/mm/2568"
function goNextUntilDateChip(targetThaiDate: string, maxSteps = 40) {
  const step = (left: number) => {
    if (left <= 0) throw new Error(`à¹„à¸¡à¹ˆà¸žà¸šà¸§à¸±à¸™à¸—à¸µà¹ˆ ${targetThaiDate} à¸ à¸²à¸¢à¹ƒà¸™ ${maxSteps} à¸„à¸£à¸±à¹‰à¸‡`);
    cy.get('.date-chip').invoke('text').then((txt) => {
      const t = String(txt || '').replace(/\s+/g, ' ').trim();
      if (t.includes(targetThaiDate)) return;
      cy.get('button.nav-btn[aria-label="à¸–à¸±à¸”à¹„à¸›"]').click({ force: true });
      cy.wait(120);
      step(left - 1);
    });
  };
  step(maxSteps);
}

// à¸­à¹ˆà¸²à¸™à¹€à¸›à¸­à¸£à¹Œà¹€à¸‹à¹‡à¸™à¸•à¹Œà¸ˆà¸²à¸à¸à¸£à¸²à¸Ÿà¸§à¸‡à¸à¸¥à¸¡ (à¸–à¹‰à¸² single-slice à¹„à¸¡à¹ˆà¸¡à¸µ label â†’ à¸„à¸·à¸™ '100%')
function readPiePercentToAlias(aliasName: string) {
  cy.get('svg.recharts-surface')
    .first()
    .within(() => {
      cy.get('.recharts-pie-labels text')
        .first()
        .then(($t) => {
          const v = ($t.text() || '').trim();
          cy.wrap(v || '100%').as(aliasName);
        });
    });
}

describe('à¸«à¸±à¸§à¸‚à¹‰à¸­à¸¢à¹ˆà¸­à¸¢: day', () => {
  it('à¸à¸” 10/10 â†’ à¸•à¸£à¸§à¸ˆ category/percent/à¸à¸£à¸²à¸Ÿ â†’ à¹„à¸› 11/11 à¹à¸¥à¹‰à¸§à¸•à¸£à¸§à¸ˆà¸‹à¹‰à¸³à¹à¸¥à¸°à¹€à¸—à¸µà¸¢à¸šà¹€à¸›à¸­à¸£à¹Œà¹€à¸‹à¹‡à¸™à¸•à¹Œ', () => {
    // à¹€à¸›à¸´à¸”à¸«à¸™à¹‰à¸² login à¹à¸¥à¸°à¸¥à¹‡à¸­à¸à¸­à¸´à¸™à¹à¸šà¸šà¸¢à¸·à¸”à¸«à¸¢à¸¸à¹ˆà¸™
    cy.visit('http://localhost:3000/login');
    uiLoginIfNeeded();

    // à¹„à¸›à¸«à¸™à¹‰à¸²à¹€à¸”à¸·à¸­à¸™à¹à¸¥à¹‰à¸§à¹€à¸›à¸´à¸”à¸§à¸±à¸™à¸—à¸µà¹ˆ 10/10/2025
    openDayFromMonth('2025-10-10');

    // à¹€à¸Šà¹‡à¸„ date chip
    cy.get('.date-chip').should('contain.text', '10/10/2568');

    // à¸•à¸£à¸§à¸ˆà¸£à¸²à¸¢à¸à¸²à¸£à¸šà¸™à¸«à¸™à¹‰à¸² day (10/10)
    cy.get('.item').first().within(() => {
      cy.get('.name').should('contain.text', 'à¸­à¸²à¸«à¸²à¸£');
      cy.get('.percent').invoke('text').then((t) => {
        expect(String(t).replace(/\s+/g, '')).to.match(/100%/);
      });
      cy.get('.amount').invoke('text').then((t) => {
        // à¹€à¸›à¹‡à¸™à¸•à¸±à¸§à¹€à¸¥à¸‚à¸•à¸²à¸¡à¸”à¹‰à¸§à¸¢ "à¸¿" (à¹„à¸¡à¹ˆà¸¥à¹‡à¸­à¸à¸ˆà¸³à¸™à¸§à¸™à¹€à¸žà¸·à¹ˆà¸­à¸à¸±à¸™à¹€à¸”à¸•à¹‰à¸²à¹€à¸à¹ˆà¸²/à¹ƒà¸«à¸¡à¹ˆ)
        expect(String(t).trim()).to.match(/^\d+\s*à¸¿$/);
      });
    });

    // à¸ˆà¸³à¹€à¸›à¸­à¸£à¹Œà¹€à¸‹à¹‡à¸™à¸•à¹Œà¸ˆà¸²à¸à¸à¸£à¸²à¸Ÿà¸§à¸‡à¸à¸¥à¸¡à¹„à¸§à¹‰ (à¸„à¸²à¸”à¸§à¹ˆà¸² single-slice = 100%)
    readPiePercentToAlias('pct_1010');

    // à¹„à¸›à¸ˆà¸™à¸–à¸¶à¸‡ 11/11/2568
    goNextUntilDateChip('11/11/2568');

    // à¸•à¸£à¸§à¸ˆà¸£à¸²à¸¢à¸à¸²à¸£à¸šà¸™à¸«à¸™à¹‰à¸² day (11/11)
    cy.get('.item').first().within(() => {
      cy.get('.name').should('contain.text', 'à¸­à¸²à¸«à¸²à¸£');
      cy.get('.percent').invoke('text').then((t) => {
        expect(String(t).replace(/\s+/g, '')).to.match(/100%/);
      });
      cy.get('.amount').invoke('text').then((t) => {
        expect(String(t).trim()).to.match(/^\d+\s*à¸¿$/);
      });
    });

    // à¸­à¹ˆà¸²à¸™à¹€à¸›à¸­à¸£à¹Œà¹€à¸‹à¹‡à¸™à¸•à¹Œà¸ˆà¸²à¸à¸à¸£à¸²à¸Ÿà¸­à¸µà¸à¸„à¸£à¸±à¹‰à¸‡à¹à¸¥à¸°à¹€à¸—à¸µà¸¢à¸šà¹ƒà¸«à¹‰à¸•à¸£à¸‡à¸à¸±à¸šà¸‚à¸­à¸‡à¹€à¸”à¸´à¸¡
    readPiePercentToAlias('pct_1111');
    cy.get('@pct_1010').then((p1: any) => {
      cy.get('@pct_1111').then((p2: any) => {
        expect(String(p2).replace(/\s+/g, '')).to.eq(String(p1).replace(/\s+/g, ''));
      });
    });
  });
});



