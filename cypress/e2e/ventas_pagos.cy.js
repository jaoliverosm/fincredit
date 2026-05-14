/**
 * E2E Tests: Flujos de Ventas y Pagos
 */

describe('E2E: Flujo de Ventas y Pagos', () => {
  const API = Cypress.env('apiUrl');

  describe('Flujo Completo de Venta a Crédito', () => {
    beforeEach(() => {
      cy.loginAsEmpleado();
    });

    it('should create a complete credit sale', () => {
      // Step 1: Verify articles are available
      cy.authRequest('GET', '/articulos').then((artResponse) => {
        expect(artResponse.status).to.eq(200);
        expect(artResponse.body.datos.length).to.be.greaterThan(0);

        const articuloId = artResponse.body.datos[0].id;

        // Step 2: Create sale
        cy.authRequest('POST', '/ventas', {
          clienteId: 1,
          articuloId,
          cantidad: 2,
          cuotas: 6,
          interes: 15
        }).then((ventaRes) => {
          expect(ventaRes.status).to.eq(201);
          expect(ventaRes.body.datos.precioTotal).to.be.greaterThan(0);
          expect(ventaRes.body.datos.cuotaMensual).to.be.greaterThan(0);
        });
      });
    });

    it('should create a payment for a sale', () => {
      cy.authRequest('GET', '/ventas/cliente/1').then((ventasRes) => {
        if (ventasRes.body.length > 0) {
          const ventaId = ventasRes.body[0].id;

          cy.authRequest('POST', '/pagos', {
            tipo: 'VENTA',
            referenciaId: ventaId,
            clienteId: 1,
            monto: 50000,
            metodo: 'EFECTIVO'
          }).then((pagoRes) => {
            expect(pagoRes.status).to.eq(201);
          });
        }
      });
    });
  });

  describe('Flujo de Pago de Préstamo', () => {
    it('should create loan payment and auto-complete when fully paid', () => {
      cy.loginAsSupervisor();

      cy.authRequest('POST', '/prestamos', {
        clienteId: 1,
        monto: 200000,
        interes: 0,
        cuotas: 1
      }).then((loanRes) => {
        const loanId = loanRes.body.data.id;

        // Login as employee to make payment
        cy.loginAsEmpleado();
        cy.authRequest('POST', '/pagos', {
          tipo: 'PRESTAMO',
          referenciaId: loanId,
          clienteId: 1,
          monto: 200000,
          metodo: 'EFECTIVO'
        }).then((pagoRes) => {
          expect(pagoRes.status).to.eq(201);

          // Verify loan is now paid
          cy.authRequest('GET', `/prestamos/${loanId}`).then((res) => {
            expect(res.body.data.estado).to.eq('PAGADO');
          });
        });
      });
    });
  });

  describe('Pagos: Reportes y Vistas', () => {
    it('should get payment reports by client', () => {
      cy.loginAsSupervisor();
      cy.authRequest('GET', `/pagos/cliente/1`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('resumen');
      });
    });
  });
});