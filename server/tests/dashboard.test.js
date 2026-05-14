/**
 * Tests del Controlador de Dashboard
 * Pruebas unitarias para dashboard.controller.js
 */

import request from 'supertest';
import app from '../src/app.js';
import { setupTest, teardownTest, getAuthHeaders, closeConnection } from './setup.test.js';

describe('Controlador de Dashboard', () => {
  let testData;

  beforeAll(async () => {
    testData = await setupTest();
  });

  afterAll(async () => {
    await teardownTest();
    await closeConnection();
  });

  describe('GET /api/dashboard/supervisor', () => {
    it('should return supervisor dashboard data', async () => {
      const headers = getAuthHeaders(testData.supervisor.user);
      const response = await request(app)
        .get('/api/dashboard/supervisor')
        .set(headers);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('resumen');
      expect(response.body.resumen).toHaveProperty('totalClientes');
      expect(response.body.resumen).toHaveProperty('totalPrestamos');
      expect(response.body.resumen).toHaveProperty('totalVentas');
      expect(response.body.resumen).toHaveProperty('totalPagos');
      expect(response.body.resumen).toHaveProperty('alertasMora');
    });

    it('should reject access for employee', async () => {
      const headers = getAuthHeaders(testData.empleado.user);
      const response = await request(app)
        .get('/api/dashboard/supervisor')
        .set(headers);

      expect(response.status).toBe(403);
    });

    it('should reject access for client', async () => {
      const headers = getAuthHeaders(testData.cliente.user);
      const response = await request(app)
        .get('/api/dashboard/supervisor')
        .set(headers);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/dashboard/empleado', () => {
    it('should return employee dashboard data', async () => {
      const headers = getAuthHeaders(testData.empleado.user);
      const response = await request(app)
        .get('/api/dashboard/empleado')
        .set(headers);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('clientes');
      expect(response.body).toHaveProperty('prestamos');
      expect(response.body).toHaveProperty('ventas');
      expect(response.body).toHaveProperty('comisionesEstimadas');
    });

    it('should reject access for client', async () => {
      const headers = getAuthHeaders(testData.cliente.user);
      const response = await request(app)
        .get('/api/dashboard/empleado')
        .set(headers);

      expect(response.status).toBe(403);
    });

    it('should reject access for supervisor (not employee)', async () => {
      const headers = getAuthHeaders(testData.supervisor.user);
      const response = await request(app)
        .get('/api/dashboard/empleado')
        .set(headers);

      // Supervisor has different dashboard
      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/dashboard/cliente', () => {
    it('should return client dashboard data', async () => {
      const headers = getAuthHeaders(testData.cliente.user);
      const response = await request(app)
        .get('/api/dashboard/cliente')
        .set(headers);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('prestamos');
      expect(response.body).toHaveProperty('ventas');
      expect(response.body).toHaveProperty('totalPagado');
    });

    it('should reject access for employee', async () => {
      const headers = getAuthHeaders(testData.empleado.user);
      const response = await request(app)
        .get('/api/dashboard/cliente')
        .set(headers);

      expect(response.status).toBe(403);
    });
  });
});