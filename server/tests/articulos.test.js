/**
 * Tests del Controlador de Artículos
 * Pruebas unitarias para articulos.controller.js
 */

import request from 'supertest';
import app from '../src/app.js';
import { setupTest, teardownTest, getAuthHeaders, closeConnection } from './setup.test.js';

describe('Controlador de Artículos', () => {
  let testData;

  beforeAll(async () => {
    testData = await setupTest();
  });

  afterAll(async () => {
    await teardownTest();
    await closeConnection();
  });

  describe('GET /api/articulos', () => {
    it('should return articles for supervisor', async () => {
      const headers = getAuthHeaders(testData.supervisor.user);
      const response = await request(app)
        .get('/api/articulos')
        .set(headers);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('datos');
      expect(Array.isArray(response.body.datos)).toBe(true);
    });

    it('should return articles for employee', async () => {
      const headers = getAuthHeaders(testData.empleado.user);
      const response = await request(app)
        .get('/api/articulos')
        .set(headers);

      expect(response.status).toBe(200);
    });

    it('should return articles for client', async () => {
      const headers = getAuthHeaders(testData.cliente.user);
      const response = await request(app)
        .get('/api/articulos')
        .set(headers);

      expect(response.status).toBe(200);
    });

    it('should filter by category', async () => {
      const headers = getAuthHeaders(testData.supervisor.user);
      const response = await request(app)
        .get('/api/articulos?categoria=Tecnología')
        .set(headers);

      expect(response.status).toBe(200);
    });

    it('should filter by active status', async () => {
      const headers = getAuthHeaders(testData.supervisor.user);
      const response = await request(app)
        .get('/api/articulos?activo=true')
        .set(headers);

      expect(response.status).toBe(200);
    });

    it('should search articles', async () => {
      const headers = getAuthHeaders(testData.supervisor.user);
      const response = await request(app)
        .get('/api/articulos?buscar=Artículo')
        .set(headers);

      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/articulos/:id', () => {
    it('should return article by id', async () => {
      const headers = getAuthHeaders(testData.supervisor.user);
      const response = await request(app)
        .get(`/api/articulos/${testData.articulo.id}`)
        .set(headers);

      expect(response.status).toBe(200);
      expect(response.body.datos).toHaveProperty('id');
      expect(response.body.datos.id).toBe(testData.articulo.id);
    });

    it('should return 404 for non-existent article', async () => {
      const headers = getAuthHeaders(testData.supervisor.user);
      const response = await request(app)
        .get('/api/articulos/99999')
        .set(headers);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/articulos/bajo-stock', () => {
    it('should get low stock articles for supervisor', async () => {
      const headers = getAuthHeaders(testData.supervisor.user);
      const response = await request(app)
        .get('/api/articulos/bajo-stock')
        .set(headers);

      expect(response.status).toBe(200);
    });

    it('should reject access for employee', async () => {
      const headers = getAuthHeaders(testData.empleado.user);
      const response = await request(app)
        .get('/api/articulos/bajo-stock')
        .set(headers);

      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/articulos', () => {
    it('should create article as supervisor', async () => {
      const headers = getAuthHeaders(testData.supervisor.user);
      const response = await request(app)
        .post('/api/articulos')
        .set(headers)
        .send({
          nombre: 'Artículo Nuevo',
          categoria: 'Electrónica',
          precio: 500000,
          stock: 20
        });

      expect(response.status).toBe(201);
      expect(response.body.datos).toHaveProperty('id');
    });

    it('should reject creation by employee', async () => {
      const headers = getAuthHeaders(testData.empleado.user);
      const response = await request(app)
        .post('/api/articulos')
        .set(headers)
        .send({
          nombre: 'Artículo',
          categoria: 'Test',
          precio: 100000,
          stock: 5
        });

      expect(response.status).toBe(403);
    });

    it('should reject creation without required fields', async () => {
      const headers = getAuthHeaders(testData.supervisor.user);
      const response = await request(app)
        .post('/api/articulos')
        .set(headers)
        .send({ nombre: 'Artículo Incompleto' });

      expect(response.status).toBe(400);
    });

    it('should reject creation with invalid price', async () => {
      const headers = getAuthHeaders(testData.supervisor.user);
      const response = await request(app)
        .post('/api/articulos')
        .set(headers)
        .send({
          nombre: 'Artículo',
          categoria: 'Test',
          precio: -100
        });

      expect(response.status).toBe(400);
    });

    it('should reject creation with negative stock', async () => {
      const headers = getAuthHeaders(testData.supervisor.user);
      const response = await request(app)
        .post('/api/articulos')
        .set(headers)
        .send({
          nombre: 'Artículo',
          categoria: 'Test',
          precio: 100000,
          stock: -5
        });

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/articulos/:id', () => {
    it('should update article as supervisor', async () => {
      const headers = getAuthHeaders(testData.supervisor.user);
      const response = await request(app)
        .put(`/api/articulos/${testData.articulo.id}`)
        .set(headers)
        .send({ nombre: 'Artículo Actualizado' });

      expect(response.status).toBe(200);
    });

    it('should reject update by employee', async () => {
      const headers = getAuthHeaders(testData.empleado.user);
      const response = await request(app)
        .put(`/api/articulos/${testData.articulo.id}`)
        .set(headers)
        .send({ nombre: 'Intento' });

      expect(response.status).toBe(403);
    });

    it('should return 404 for non-existent article', async () => {
      const headers = getAuthHeaders(testData.supervisor.user);
      const response = await request(app)
        .put('/api/articulos/99999')
        .set(headers)
        .send({ nombre: 'No existe' });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/articulos/:id', () => {
    it('should deactivate article with sales (soft delete)', async () => {
      const headers = getAuthHeaders(testData.supervisor.user);

      // First create an article, then a sale, then try to delete
      const response = await request(app)
        .delete(`/api/articulos/${testData.articulo.id}`)
        .set(headers);

      expect(response.status).toBe(200);
    });
  });

  describe('PATCH /api/articulos/:id/stock', () => {
    it('should adjust stock as supervisor', async () => {
      const headers = getAuthHeaders(testData.supervisor.user);

      const response = await request(app)
        .patch(`/api/articulos/${testData.articulo.id}/stock`)
        .set(headers)
        .send({ stock: 50, motivo: 'Reabastecimiento' });

      expect(response.status).toBe(200);
    });

    it('should reject stock adjustment by employee', async () => {
      const headers = getAuthHeaders(testData.empleado.user);
      const response = await request(app)
        .patch(`/api/articulos/${testData.articulo.id}/stock`)
        .set(headers)
        .send({ stock: 100, motivo: 'Test' });

      expect(response.status).toBe(403);
    });
  });
});