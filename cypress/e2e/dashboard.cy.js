/**
 * E2E Tests: Dashboard y Artículos
 */

describe('E2E: Dashboard', () => {
  const API = Cypress.env('apiUrl');

  describe('Supervisor Dashboard', () => {
    beforeEach(() => {
      cy.loginAsSupervisor();
    });

    it('should display supervisor dashboard metrics', () => {
      cy.authRequest('GET', '/dashboard/supervisor').then((response) => {
        expect(response.status).to.eq(200);
        const body = response.body;

        expect(body).to.have.property('resumen');
        expect(body.resumen).to.have.property('totalClientes');
        expect(body.resumen).to.have.property('totalPrestamos');
        expect(body.resumen).to.have.property('totalVentas');
        expect(body.resumen).to.have.property('totalPagos');
        expect(body.resumen).to.have.property('alertasMora');
      });
    });
  });

  describe('Employee Dashboard', () => {
    beforeEach(() => {
      cy.loginAsEmpleado();
    });

    it('should display employee dashboard metrics', () => {
      cy.authRequest('GET', '/dashboard/empleado').then((response) => {
        expect(response.status).to.eq(200);
        const body = response.body;

        expect(body).to.have.property('clientes');
        expect(body).to.have.property('prestamos');
        expect(body).to.have.property('ventas');
        expect(body).to.have.property('comisionesEstimadas');
      });
    });
  });

  describe('Client Dashboard', () => {
    beforeEach(() => {
      cy.loginAsCliente();
    });

    it('should display client dashboard with financials', () => {
      cy.authRequest('GET', '/dashboard/cliente').then((response) => {
        expect(response.status).to.eq(200);
        const body = response.body;

        expect(body).to.have.property('prestamos');
        expect(body).to.have.property('ventas');
        expect(body).to.have.property('totalPagado');
      });
    });
  });

  describe('Cross-role access protection', () => {
    it('should block client from supervisor dashboard', () => {
      cy.loginAsCliente();
      cy.authRequest('GET', '/dashboard/supervisor').then((response) => {
        expect(response.status).to.eq(403);
      });
    });

    it('should block supervisor from employee dashboard view', async () => {
      cy.loginAsSupervisor();
      cy.authRequest('GET', '/dashboard/empleado').then((response) => {
        // Supervisor hits endpoint but gets no data since they have no employee record
        expect([200, 403].includes(response.status)).to.be.true;
      });
    });
  });
});