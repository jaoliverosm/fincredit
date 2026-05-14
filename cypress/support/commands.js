/**
 * Cypress Support - Comandos personalizados
 */

Cypress.Commands.add('login', (email, password) => {
  cy.request('POST', `${Cypress.env('apiUrl')}/auth/login`, { email, password }).then((response) => {
    expect(response.status).to.eq(200);
    const token = response.body.token;
    Cypress.env('token', token);
    window.localStorage.setItem('token', token);
    return cy.wrap(response.body);
  });
});

Cypress.Commands.add('authRequest', (method, url, body = {}) => {
  const token = Cypress.env('token');
  return cy.request({
    method,
    url: `${Cypress.env('apiUrl')}${url}`,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body,
    failOnStatusCode: false
  });
});

Cypress.Commands.add('checkHealth', () => {
  cy.request('GET', `${Cypress.env('apiUrl')}/health`);
});

Cypress.Commands.add('loginAsSupervisor', () => {
  const creds = Cypress.env('credentials').supervisor;
  cy.login(creds.email, creds.password);
});

Cypress.Commands.add('loginAsEmpleado', () => {
  const creds = Cypress.env('credentials').empleado;
  cy.login(creds.email, creds.password);
});

Cypress.Commands.add('loginAsCliente', () => {
  const creds = Cypress.env('credentials').cliente;
  cy.login(creds.email, creds.password);
});
