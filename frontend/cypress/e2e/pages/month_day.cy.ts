// ---------------- Day sub-suite (flex) ----------------

// ล็อกอินแบบยืดหยุ่น (รองรับหลาย selector/ภาษา)
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
        'input[placeholder*="ชื่อผู้ใช้"]',
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
        'input[placeholder*="รหัสผ่าน"]',
      ].join(', ')
    )
      .filter(':visible')
      .first()
      .clear()
      .type('pass123');

    cy.contains('button, [type="submit"]', /login|เข้าสู่ระบบ/i)
      .filter(':visible')
      .first()
      .click();

    cy.location('pathname', { timeout: 10000 }).should('include', '/home');
  });
}

// ไป /month (ถ้ายังไม่อยู่) แล้วกดเข้า /day?date=YYYY-MM-DD
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

// เดินหน้าไปจน .date-chip มีวันที่เป้าหมายรูปแบบ "dd/mm/2568"
function goNextUntilDateChip(targetThaiDate: string, maxSteps = 40) {
  const step = (left: number) => {
    if (left <= 0) throw new Error(`ไม่พบวันที่ ${targetThaiDate} ภายใน ${maxSteps} ครั้ง`);
    cy.get('.date-chip').invoke('text').then((txt) => {
      const t = String(txt || '').replace(/\s+/g, ' ').trim();
      if (t.includes(targetThaiDate)) return;
      cy.get('button.nav-btn[aria-label="ถัดไป"]').click({ force: true });
      cy.wait(120);
      step(left - 1);
    });
  };
  step(maxSteps);
}

// อ่านเปอร์เซ็นต์จากกราฟวงกลม (ถ้า single-slice ไม่มี label → คืน '100%')
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

describe('หัวข้อย่อย: day', () => {
  it('กด 10/10 → ตรวจ category/percent/กราฟ → ไป 11/11 แล้วตรวจซ้ำและเทียบเปอร์เซ็นต์', () => {
    // เปิดหน้า login และล็อกอินแบบยืดหยุ่น
    cy.visit('http://localhost:3000/login');
    uiLoginIfNeeded();

    // ไปหน้าเดือนแล้วเปิดวันที่ 10/10/2025
    openDayFromMonth('2025-10-10');

    // เช็ค date chip
    cy.get('.date-chip').should('contain.text', '10/10/2568');

    // ตรวจรายการบนหน้า day (10/10)
    cy.get('.item').first().within(() => {
      cy.get('.name').should('contain.text', 'อาหาร');
      cy.get('.percent').invoke('text').then((t) => {
        expect(String(t).replace(/\s+/g, '')).to.match(/100%/);
      });
      cy.get('.amount').invoke('text').then((t) => {
        // เป็นตัวเลขตามด้วย "฿" (ไม่ล็อกจำนวนเพื่อกันเดต้าเก่า/ใหม่)
        expect(String(t).trim()).to.match(/^\d+\s*฿$/);
      });
    });

    // จำเปอร์เซ็นต์จากกราฟวงกลมไว้ (คาดว่า single-slice = 100%)
    readPiePercentToAlias('pct_1010');

    // ไปจนถึง 11/11/2568
    goNextUntilDateChip('11/11/2568');

    // ตรวจรายการบนหน้า day (11/11)
    cy.get('.item').first().within(() => {
      cy.get('.name').should('contain.text', 'อาหาร');
      cy.get('.percent').invoke('text').then((t) => {
        expect(String(t).replace(/\s+/g, '')).to.match(/100%/);
      });
      cy.get('.amount').invoke('text').then((t) => {
        expect(String(t).trim()).to.match(/^\d+\s*฿$/);
      });
    });

    // อ่านเปอร์เซ็นต์จากกราฟอีกครั้งและเทียบให้ตรงกับของเดิม
    readPiePercentToAlias('pct_1111');
    cy.get('@pct_1010').then((p1: any) => {
      cy.get('@pct_1111').then((p2: any) => {
        expect(String(p2).replace(/\s+/g, '')).to.eq(String(p1).replace(/\s+/g, ''));
      });
    });
  });
});