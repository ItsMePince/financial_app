// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'
if (Cypress.env('STUB')) {
  cy.intercept('GET', '**/api/expenses*', { fixture: 'expenses.json' }).as('getExpenses');
  cy.intercept('POST', '**/api/expenses', { statusCode: 200, body: { id: 999, message: 'created' } }).as('createExpense');
}


