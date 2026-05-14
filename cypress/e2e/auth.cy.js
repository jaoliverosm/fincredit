/**
 * E2E Tests: Flujos de Autenticación
 */

describe('E2E: Autenticación y Navegación', () => {
  describe('Login', () => {
    it('should allow supervisor to login and access dashboard', () => {
      cy.loginAsSupervisor();
      cy.authRequest('GET', '/dashboard/supervisor').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('resumen');
      });
    });

    it('should allow employee to login and access dashboard', () => {
      cy.loginAsEmpleado();
      cy.authRequest('GET', '/dashboard/empleado').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('clientes');
      });
    });

    it('should allow client to login and access dashboard', () => {
      cy.loginAsCliente();
      cy.authRequest('GET', '/dashboard/cliente').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('prestamos');
      });
    });

    it('should reject invalid credentials', () => {
      cy.authRequest('POST', '/auth/login', {
        email: 'admin@fincredit.com',
        password: 'wrongpassword'
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });

    it('should reject access without token', () => {
      cy.request({
        method: 'GET',
        url: `${Cypress.env('apiUrl')}/dashboard/supervisor`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });
  });

  describe('Profile Access', () => {
    it('should return current user profile', () => {
      cy.loginAsSupervisor();
      cy.authRequest('GET', '/auth/me').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.usuario.email).to.eq('admin@fincredit.com');
        expect(response.body.usuario.rol).to.eq('supervisor');
      });
    });
  });
});
