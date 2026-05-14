/**
 * E2E Tests: Gestión de Artículos
 */

describe('E2E: Artículos', () => {
  const API = Cypress.env('apiUrl');

  describe('Supervisor: CRUD de Artículos', () => {
    let articuloId;

    beforeEach(() => {
      cy.loginAsSupervisor();
    });

    it('should list all articles', () => {
      cy.authRequest('GET', '/articulos').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('datos');
        expect(response.body).to.have.property('paginacion');
      });
    });

    it('should create a new article', () => {
      cy.authRequest('POST', '/articulos', {
        nombre: 'Artículo E2E Test',
        categoria: 'Electrónica',
        precio: 250000,
        stock: 50,
        descripcion: 'Artículo para pruebas E2E'
      }).then((response) => {
        expect(response.status).to.eq(201);
        articuloId = response.body.datos.id;
        expect(response.body.datos.nombre).to.eq('Artículo E2E Test');
        expect(response.body.datos.precio).to.eq(250000);
        expect(response.body.datos.stock).to.eq(50);
      });
    });

    it('should get article by id', () => {
      if (!articuloId) return;

      cy.authRequest(`GET`, `/articulos/${articuloId}`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.datos.id).to.eq(articuloId);
      });
    });

    it('should search articles', () => {
      cy.authRequest('GET', '/articulos?buscar=Artículo E2E').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.datos).to.be.an('array');
      });
    });

    it('should filter by category', () => {
      cy.authRequest('GET', '/articulos?categoria=Electrónica').then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it('should filter by active status', () => {
      cy.authRequest('GET', '/articulos?activo=true').then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it('should update an article', () => {
      if (!articuloId) return;

      cy.authRequest('PUT', `/articulos/${articuloId}`, {
        nombre: 'Artículo E2E Actualizado',
        precio: 300000
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.datos.nombre).to.eq('Artículo E2E Actualizado');
      });
    });

    it('should adjust stock', () => {
      if (!articuloId) return;

      cy.authRequest('PATCH', `/articulos/${articuloId}/stock`, {
        stock: 100,
        motivo: 'Reabastecimiento E2E'
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.datos.stock).to.eq(100);
      });
    });

    it('should soft delete article with relations', () => {
      if (!articuloId) return;

      cy.authRequest('DELETE', `/articulos/${articuloId}`).then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it('should return 404 for non-existent article', () => {
      cy.authRequest('GET', '/articulos/99999').then((response) => {
        expect(response.status).to.eq(404);
      });
    });
  });

  describe('Role-based access control for Articles', () => {
    it('should block employee from creating articles', () => {
      cy.loginAsEmpleado();
      cy.authRequest('POST', '/articulos', {
        nombre: 'Test',
        categoria: 'Test',
        precio: 100000
      }).then((response) => {
        expect(response.status).to.eq(403);
      });
    });

    it('should block employee from adjusting stock', () => {
      cy.loginAsEmpleado();
      cy.authRequest('PATCH', '/articulos/1/stock', {
        stock: 100,
        motivo: 'Test'
      }).then((response) => {
        expect(response.status).to.eq(403);
      });
    });

    it('should allow all roles to view articles', () => {
      // All roles can view articles
      [cy.loginAsSupervisor, cy.loginAsEmpleado, cy.loginAsCliente].forEach((loginFn) => {
        loginFn();
        cy.authRequest('GET', '/articulos').then((response) => {
          expect(response.status).to.eq(200);
        });
      });
    });
  });
});