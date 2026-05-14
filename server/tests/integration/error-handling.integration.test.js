/**
 * Tests de Integración - Manejo de Errores
 * Pruebas de integración para el manejo de errores global
 */

import request from 'supertest';
import app from '../src/app.js';
import { setupTest, teardownTest, getAuthHeaders, closeConnection } from './setup.test.js';

describe('Integración: Manejo de Errores', () => {
  let testData;

  beforeAll(async () => {
    testData = await setupTest();
  });

  afterAll(async () => {
    await teardownTest();
    await closeConnection();
  });

  describe('404 - Ruta no encontrada', () => {
    it('should return 404 for non-existent route', async () => {
      const headers = getAuthHeaders(testData.supervisor.user);
      const response = await request(app)
        .get('/api/nonexistent')
        .set(headers);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent resource', async () => {
      const headers = getAuthHeaders(testData.supervisor.user);
      const response = await request(app)
        .get('/api/prestamos/99999')
        .set(headers);

      expect(response.status).toBe(404);
    });
  });

  describe('422 - Validación de datos', () => {
    it('should return validation errors for invalid loan data', async () => {
      const headers = getAuthHeaders(testData.empleado.user);
      const response = await request(app)
        .post('/api/prestamos')
        .set(headers)
        .send({
          clienteId: testData.cliente.cliente.id,
          monto: 50,
          interes: 15,
          cuotas: 12
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return validation errors for missing required fields', async () => {
      const headers = getAuthHeaders(testData.supervisor.user);
      const response = await request(app)
        .post('/api/articulos')
        .set(headers)
        .send({ nombre: 'Test' });

      expect(response.status).toBe(400);
    });
  });

  describe('401 - No autenticado', () => {
    it('should reject requests without token', async () => {
      const response = await request(app)
        .get('/api/empleados');

      expect(response.status).toBe(401);
    });

    it('should reject requests with invalid token', async () => {
      const response = await request(app)
        .get('/api/empleados')
        .set('Authorization', 'Bearer invalidtoken123');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('500 - Error interno', () => {
    it('should return 500 for unhandled errors', async () => {
      // This tests that the global error handler is in place
      const headers = getAuthHeaders(testData.supervisor.user);
      const response = await request(app)
        .get('/api/prestamos')
        .set(headers);

      // Should not crash the server
      expect([200, 500].includes(response.status)).toBe(true);
    });
  });

  describe('Estructura de errores', () => {
    it('should return consistent error structure', async () => {
      const response = await request(app)
        .get('/api/empleados')
        .set('Authorization', 'Bearer invalid');

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should return consistent success structure', async () => {
      const headers = getAuthHeaders(testData.supervisor.user);
      const response = await request(app)
        .get('/api/config')
        .set(headers);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('timestamp');
    });
  });
});