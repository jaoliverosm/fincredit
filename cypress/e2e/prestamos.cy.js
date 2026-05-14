/**
 * E2E Tests: Flujos de Préstamos
 */

describe('E2E: Flujo de Préstamos', () => {
  const API = Cypress.env('apiUrl');

  describe('Supervisor: Gestión de Préstamos', () => {
    beforeEach(() => {
      cy.loginAsSupervisor();
    });

    it('should view all loans', () => {
      cy.authRequest('GET', '/prestamos').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
      });
    });

    it('should create a new loan', () => {
      cy.authRequest('GET', '/clientes').then((clientesRes) => {
        const clienteId = clientesRes.body[0]?.id;
        expect(clienteId).to.exist;

        cy.authRequest('POST', '/prestamos', {
          clienteId,
          monto: 5000000,
          interes: 15,
          cuotas: 12,
          observacion: 'Préstamo E2E'
        }).then((response) => {
          expect(response.status).to.eq(201);
          expect(response.body.data.monto).to.eq(5000000);
          expect(response.body.data.cuotas).to.eq(12);
          expect(response.body.data).to.have.property('cuotaMensual');
          expect(response.body.data).to.have.property('fechaVencimiento');
        });
      });
    });

    it('should update loan status', () => {
      // Create loan first
      cy.authRequest('POST', '/prestamos', {
        clienteId: 1,
        monto: 1000000,
        interes: 12,
        cuotas: 6
      }).then((createRes) => {
        const loanId = createRes.body.data.id;

        // Update status
        cy.authRequest('PUT', `/prestamos/${loanId}`, {
          estado: 'MORA',
          observacion: 'En mora'
        }).then((updateRes) => {
          expect(updateRes.status).to.eq(200);
          expect(updateRes.body.data.estado).to.eq('MORA');
        });
      });
    });

    it('should view loan statistics', () => {
      cy.authRequest('GET', '/prestamos/estadisticas').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('total');
        expect(response.body).to.have.property('activos');
        expect(response.body).to.have.property('enMora');
      });
    });
  });

  describe('Employee: Loan Operations', () => {
    beforeEach(() => {
      cy.loginAsEmpleado();
    });

    it('should create a loan for assigned client', () => {
      cy.authRequest('POST', '/prestamos', {
        clienteId: 1,
        monto: 200000,
        interes: 12,
        cuotas: 12
      }).then((response) => {
        expect(response.status).to.eq(201);
      });
    });

    it('should NOT create a loan for unassigned client', () => {
      cy.authRequest('POST', '/prestamos', {
        clienteId: 99,
        monto: 200000,
        interes: 12,
        cuotas: 12
      }).then((response) => {
        expect(response.status).to.eq(404);
      });
    });

    it('should NOT be able to change loan status', () => {
      cy.authRequest('PUT', '/prestamos/1', {
        estado: 'MORA'
      }).then((response) => {
        expect(response.status).to.eq(403);
      });
    });
  });

  describe('Client: View Loans', () => {
    beforeEach(() => {
      cy.loginAsCliente();
    });

    it('should view own loans', () => {
      cy.authRequest('GET', '/prestamos/cliente/1').then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it('should NOT view other clients loans', () => {
      cy.authRequest('GET', '/prestamos/cliente/99').then((response) => {
        expect(response.status).to.eq(403);
      });
    });
  });
});