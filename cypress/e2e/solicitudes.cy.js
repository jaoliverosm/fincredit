/**
 * E2E Tests: Flujo de Solicitudes con Aprobación
 */

describe('E2E: Flujo de Solicitudes', () => {
  const API = Cypress.env('apiUrl');

  describe('Cliente: Crear Solicitud', () => {
    beforeEach(() => {
      Cypress.env('token', null);
    });

    it('should create a message solicitud', () => {
      cy.loginAsCliente();

      cy.authRequest('POST', '/solicitudes', {
        tipo: 'MENSAJE',
        mensaje: 'Solicitud de prueba E2E'
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body.datos.tipo).to.eq('MENSAJE');
        expect(response.body.datos.estado).to.eq('PENDIENTE');
      });
    });

    it('should create a loan request solicitud', () => {
      cy.loginAsCliente();

      cy.authRequest('POST', '/solicitudes', {
        tipo: 'NUEVO_PRESTAMO',
        monto: 500000,
        cuotas: 12,
        mensaje: 'Necesito financiamiento'
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body.datos.tipo).to.eq('NUEVO_PRESTAMO');
      });
    });

    it('should create a purchase request solicitud', () => {
      cy.loginAsCliente();

      cy.authRequest('POST', '/solicitudes', {
        tipo: 'NUEVA_COMPRA',
        articuloId: 1,
        mensaje: 'Deseo comprar este artículo'
      }).then((response) => {
        expect(response.status).to.eq(201);
      });
    });
  });

  describe('Empleado: Procesar Solicitud', () => {
    beforeEach(() => {
      cy.loginAsEmpleado();
    });

    it('should approve a solicitud', () => {
      // First create a solicitud as client
      cy.loginAsCliente();
      cy.authRequest('POST', '/solicitudes', {
        tipo: 'MENSAJE',
        mensaje: 'Aprobar por favor'
      }).then((createRes) => {
        const solicitudId = createRes.body.datos.id;

        // Now approve as employee
        cy.loginAsEmpleado();
        cy.authRequest('PUT', `/solicitudes/${solicitudId}/responder`, {
          estado: 'APROBADO',
          respuesta: 'Solicitud aprobada'
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.datos.estado).to.eq('APROBADO');
        });
      });
    });

    it('should reject a solicitud', () => {
      cy.loginAsCliente();
      cy.authRequest('POST', '/solicitudes', {
        tipo: 'MENSAJE',
        mensaje: 'Rechazar'
      }).then((createRes) => {
        const solicitudId = createRes.body.datos.id;

        cy.loginAsEmpleado();
        cy.authRequest('PUT', `/solicitudes/${solicitudId}/responder`, {
          estado: 'RECHAZADO',
          respuesta: 'Solicitud rechazada'
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.datos.estado).to.eq('RECHAZADO');
        });
      });
    });

    it('should NOT respond twice to same solicitud', () => {
      cy.loginAsCliente();
      cy.authRequest('POST', '/solicitudes', {
        tipo: 'MENSAJE',
        mensaje: 'No responder dos veces'
      }).then((createRes) => {
        const solicitudId = createRes.body.datos.id;

        cy.loginAsEmpleado();
        cy.authRequest('PUT', `/solicitudes/${solicitudId}/responder`, {
          estado: 'APROBADO',
          respuesta: 'Primera respuesta'
        }).then(() => {
          cy.authRequest('PUT', `/solicitudes/${solicitudId}/responder`, {
            estado: 'RECHAZADO',
            respuesta: 'Intento duplicado'
          }).then((response) => {
            expect(response.status).to.eq(400);
          });
        });
      });
    });
  });

  describe('Listar Solicitudes', () => {
    it('should list pending solicitudes for employee', () => {
      cy.loginAsEmpleado();
      cy.authRequest('GET', '/solicitudes/pendientes').then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it('should list all solicitudes for supervisor', () => {
      cy.loginAsSupervisor();
      cy.authRequest('GET', '/solicitudes').then((response) => {
        expect(response.status).to.eq(200);
      });
    });
  });
});