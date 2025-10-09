describe('Accounts E2E', () => {
  // ใช้ data-test ถ้ามี; ถ้าไม่มีใช้ fallback ตามข้อความ/attribute
  const sel = {
    // ปุ่มไปหน้าบัญชี/เพิ่มบัญชี
    navAccounts: '[data-test="nav-accounts"], a[href*="/accounts"], a:contains("Accounts")',
    addBtn: '[data-test="acct-add"], [data-testid="acct-add"], button:contains("Add")',
    // ฟอร์ม
    name: '[data-test="acct-name"], input[name="name"], input#name, input[placeholder*="ชื่อ"]',
    opening: '[data-test="acct-opening"], input[name="opening"], input#opening, input[type="number"]',
    save: '[data-test="acct-save"], button[type="submit"], button:contains("Save")',
    // แถวบัญชีและเมนูแก้ไข/ลบ
    row: (text: string) => `tr:contains("${text}"), li:contains("${text}")`,
    edit: '[data-test="acct-edit"], button:contains("Edit"), [aria-label*="edit"]',
    del: '[data-test="acct-delete"], button:contains("Delete"), [aria-label*="delete"]',
    confirm: '[data-test="confirm"], button:contains("Confirm"), button:contains("OK")',
  };

  const goAccountsPage = () => {
    cy.visit('/accounts');                     // ถ้าระบบคุณอยู่ที่ route อื่นให้แก้ตรงนี้
    // หรือถ้าต้องผ่านเมนู:
    // cy.get(sel.navAccounts).first().click({force:true})
  };

  beforeEach(() => {
    cy.clearAllCookies();
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();
    // mock login สั้น ๆ
    cy.window().then(w => {
      w.localStorage.setItem('isAuthenticated', 'true');
      w.localStorage.setItem('token', 'valid-token');
    });
    goAccountsPage();
  });

  // ACCT-001 เพิ่มบัญชีใหม่
  it('E2E-ACCT-001 : เพิ่มบัญชีใหม่ → 201 Created และแสดงในรายการ', () => {
    cy.intercept('POST', '**/api/accounts', {
      statusCode: 201,
      body: { id: 'acct-a', name: 'ธนาคาร A', opening: 20000 }
    }).as('createAccount');

    cy.get(sel.addBtn).first().click({force:true});
    cy.get(sel.name).should('be.visible').type('ธนาคาร A');
    cy.get(sel.opening).clear().type('20000');
    cy.get(sel.save).first().click({force:true});

    cy.wait('@createAccount');
    // โหลดรายการใหม่ (เผื่อแอปยิง GET)
    cy.intercept('GET', '**/api/accounts', {
      statusCode: 200,
      body: [{ id: 'acct-a', name: 'ธนาคาร A', opening: 20000 }]
    }).as('list');
    cy.wait('@list');

    cy.contains(/ธนาคาร A/i).should('exist');   // บัญชีใหม่แสดงในรายการ
  });

  // ACCT-002 แก้ไขชื่อบัญชี
  it('E2E-ACCT-002 : แก้ไขบัญชี → 200 OK และชื่ออัปเดต', () => {
    // priming รายการเริ่มต้น
    cy.intercept('GET', '**/api/accounts', {
      statusCode: 200,
      body: [{ id: 'acct-a', name: 'ธนาคาร A', opening: 20000 }]
    }).as('listA');
    cy.reload();
    cy.wait('@listA');

    cy.intercept('PUT', '**/api/accounts/acct-a', {
      statusCode: 200,
      body: { id: 'acct-a', name: 'ธนาคาร A (แก้ไข)', opening: 20000 }
    }).as('updateAccount');

    cy.contains(sel.row('ธนาคาร A'), 'ธนาคาร A').within(() => {
      cy.get(sel.edit).first().click({force:true});
    });
    cy.get(sel.name).clear().type('ธนาคาร A (แก้ไข)');
    cy.get(sel.save).first().click({force:true});
    cy.wait('@updateAccount');

    // refresh list
    cy.intercept('GET', '**/api/accounts', {
      statusCode: 200,
      body: [{ id: 'acct-a', name: 'ธนาคาร A (แก้ไข)', opening: 20000 }]
    }).as('listAfterEdit');
    cy.wait('@listAfterEdit');

    cy.contains(/ธนาคาร A \(แก้ไข\)/).should('exist');
  });

  // ACCT-003 ลบบัญชีที่ไม่มีรายการผูก
  it('E2E-ACCT-003 : ลบบัญชีที่ไม่มีรายการผูก → 204 No Content และหายจากรายการ', () => {
    cy.intercept('GET', '**/api/accounts', {
      statusCode: 200,
      body: [{ id: 'acct-b', name: 'บัญชีเปล่า', opening: 0 }]
    }).as('listB');
    cy.reload();
    cy.wait('@listB');

    cy.intercept('DELETE', '**/api/accounts/acct-b', {
      statusCode: 204, body: ''
    }).as('deleteOk');

    cy.contains(sel.row('บัญชีเปล่า'), 'บัญชีเปล่า').within(() => {
      cy.get(sel.del).first().click({force:true});
    });
    cy.get(sel.confirm).first().click({force:true});
    cy.wait('@deleteOk');

    // รายการใหม่หลังลบ
    cy.intercept('GET', '**/api/accounts', { statusCode: 200, body: [] }).as('listAfterDel');
    cy.wait('@listAfterDel');

    cy.contains(/บัญชีเปล่า/).should('not.exist');
  });

  // ACCT-004 ลบบัญชีที่มีรายการผูก → 409/400 พร้อมข้อความเตือน
  it('E2E-ACCT-004 : ลบบัญชีที่มีรายการผูก → 409/400 และแจ้งเตือนให้ย้ายรายการก่อน', () => {
    cy.intercept('GET', '**/api/accounts', {
      statusCode: 200,
      body: [{ id: 'acct-c', name: 'บัญชีมีรายการ', opening: 500 }]
    }).as('listC');
    cy.reload();
    cy.wait('@listC');

    cy.intercept('DELETE', '**/api/accounts/acct-c', {
      statusCode: 409,
      body: { message: 'มีรายการผูก ต้องย้ายรายการก่อน' }
    }).as('deleteConflict');

    cy.contains(sel.row('บัญชีมีรายการ'), 'บัญชีมีรายการ').within(() => {
      cy.get(sel.del).first().click({force:true});
    });
    cy.get(sel.confirm).first().click({force:true});
    cy.wait('@deleteConflict');

    cy.contains(/ต้องย้ายรายการก่อน|มีรายการผูก|cannot delete/i).should('exist');
    cy.contains(/บัญชีมีรายการ/).should('exist'); // ยังไม่ถูกลบ
  });
});