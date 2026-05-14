/**
 * Tests del Controlador de Configuración
 * Pruebas unitarias para config.controller.js
 */

import request from 'supertest';
import app from '../src/app.js';
import { setupTest, teardownTest, getAuthHeaders, closeConnection } from './setup.test.js';

describe('Controlador de Configuración', () => {
  let testData;

  beforeAll(async () => {
    testData = await setupTest();
  });

  afterAll(async () => {
    await teardownTest();
    await closeConnection();
  });

  describe('GET /api/config', () => {
    it('should return configuration for supervisor', async () => {
      const headers = getAuthHeaders(testData.supervisor.user);
      const response = await request(app)
        .get('/api/config')
        .set(headers);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('config');
      expect(response.body.config).toHaveProperty('tasaDefault');
      expect(response.body.config).toHaveProperty('cuotasMax');
      expect(response.body.config).toHaveProperty('cuotasMin');
      expect(response.body.config).toHaveProperty('montoMaxPrestamo');
      expect(response.body.config).toHaveProperty('nombreEmpresa');
    });

    it('should reject access for employee', async () => {
      const headers = getAuthHeaders(testData.empleado.user);
      const response = await request(app)
        .get('/api/config')
        .set(headers);

      expect(response.status).toBe(403);
    });

    it('should reject access for client', async () => {
      const headers = getAuthHeaders(testData.cliente.user);
      const response = await request(app)
        .get('/api/config')
        .set(headers);

      expect(response.status).toBe(403);
    });
  });

  describe('PUT /api/config', () => {
    it('should update configuration as supervisor', async () => {
      const headers = getAuthHeaders(testData.supervisor.user);
      const response = await request(app)
        .put('/api/config')
        .set(headers)
        .send({
          tasaDefault: 3.5,
          cuotasMax: 48,
          cuotasMin: 3,
          montoMaxPrestamo: 50000000,
          montoMinPrestamo: 100000,
          nombreEmpresa: 'FinCredit Test',
          moneda: 'COP'
        });

      expect(response.status).toBe(200);
      expect(response.body.config.tasaDefault).toBe(3.5);
      expect(response.body.config.cuotasMax).toBe(48);
    });

    it('should update partial configuration', async () => {
      const headers = getAuthHeaders(testData.supervisor.user);
      const response = await request(app)
        .put('/api/config')
        .set(headers)
        .send({
          tasaDefault: 5,
          cuotasMax: 36,
          cuotasMin: 1,
          montoMaxPrestamo: 10000000,
          montoMinPrestamo: 50000,
          nombreEmpresa: 'FinCredit',
          moneda: 'USD'
        });

      expect(response.status).toBe(200);
      expect(response.body.config.moneda).toBe('USD');
    });

    it('should reject update for employee', async () => {
      const headers = getAuthHeaders(testData.empleado.user);
      const response = await request(app)
        .put('/api/config')
        .set(headers)
        .send({ tasaDefault: 5 });

      expect(response.status).toBe(403);
    });
  });
});