/**
 * Cypress Support - Funciones auxiliares y fixtures
 */

// Helper para esperar respuestas de API
Cypress.Commands.add('waitForApi', (alias) => {
  cy.wait(alias).then((interception) => {
    expect(interception.response.statusCode).to.be.oneOf([200, 201, 400, 401, 403, 404]);
  });
});

// Fixtures comunes
beforeEach(() => {
  cy.fixture('users').as('users');
  cy.fixture('config').as('config');
});

// Cleanup después de cada test
afterEach(() => {
  // Limpiar localStorage
  window.localStorage.clear();
});