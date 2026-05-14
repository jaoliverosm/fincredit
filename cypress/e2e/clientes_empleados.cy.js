/**
 * E2E Tests: Gestión de Clientes y Empleados
 */

describe('E2E: Clientes y Empleados', () => {
  const API = Cypress.env('apiUrl');

  describe('Empleado: CRUD de Clientes', () => {
    beforeEach(() => {
      cy.loginAsEmpleado();
    });

    it('should list clients', () => {
      cy.authRequest('GET', '/clientes').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('clientes');
      });
    });

    it('should create a new client', () => {
      cy.authRequest('POST', '/clientes', {
        nombre: 'Cliente E2E',
        email: 'cliente.e2e@test.com',
        password: 'password123',
        cedula: '123456789',
        telefono: '3111234567'
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body.cliente).to.have.property('id');
        expect(response.body.cliente.nombre).to.eq('Cliente E2E');
      });
    });

    it('should get client by id', () => {
      cy.authRequest('GET', '/clientes/1').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('cliente');
      });
    });

    it('should update client', () => {
      cy.authRequest('PUT', '/clientes/1', {
        telefono: '3229876543'
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });
  });

  describe('Supervisor: Employee Management', () => {
    beforeEach(() => {
      cy.loginAsSupervisor();
    });

    it('should list employees', () => {
      cy.authRequest('GET', '/empleados').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('empleados');
      });
    });

    it('should create employee', () => {
      cy.authRequest('POST', '/empleados', {
        nombre: 'Empleado E2E',
        email: 'empleado-e2e@test.com',
        password: 'password123',
        telefono: '3119999999',
        meta: 3000000
      }).then((response) => {
        expect(response.status).to.eq(201);
      });
    });

    it('should get employee metrics', () => {
      cy.authRequest('GET', '/empleados/1/metricas').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('empleado');
        expect(response.body).to.have.property('clientes');
      });
    });
  });

  describe('Access Control - Cross-role isolation', () => {
    it('employee should not see other employee profiles', () => {
      cy.loginAsEmpleado();
      cy.authRequest('GET', '/empleados/999').then((response) => {
        expect(response.status).to.eq(403);
      });
    });

    it('client should not access other client profiles', () => {
      cy.loginAsCliente();
      cy.authRequest('GET', '/clientes/999').then((response) => {
        expect(response.status).to.eq(403);
      });
    });

    it('employee should not access supervisor endpoints', () => {
      cy.loginAsEmpleado();
      cy.authRequest('GET', '/articulos/bajo-stock').then((response) => {
        expect(response.status).to.eq(403);
      });
    });
  });
});