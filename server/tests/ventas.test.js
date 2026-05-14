/**
 * Tests del Controlador de Ventas
 * Pruebas unitarias para ventas.controller.js
 */

import request from 'supertest';
import app from '../src/app.js';
import { setupTest, teardownTest, getAuthHeaders, closeConnection } from './setup.test.js';

describe('Controlador de Ventas', () => {
  let testData;

  beforeAll(async () => {
    testData = await setupTest();
  });

  afterAll(async () => {
    await teardownTest();
    await closeConnection();
  });

  describe('GET /api/ventas', () => {
    it('should return sales for supervisor', async () => {
      const headers = getAuthHeaders(testData.supervisor.user);
      const response = await request(app)
        .get('/api/ventas')
        .set(headers);

      expect(response.status).toBe(200);
    });

    it('should return sales for employee', async () => {
      const headers = getAuthHeaders(testData.empleado.user);
      const response = await request(app)
        .get('/api/ventas')
        .set(headers);

      expect(response.status).toBe(200);
    });

    it('should reject access for clients', async () => {
      const headers = getAuthHeaders(testData.cliente.user);
      const response = await request(app)
        .get('/api/ventas')
        .set(headers);

      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/ventas', () => {
    it('should create a credit sale as employee', async () => {
      const headers = getAuthHeaders(testData.empleado.user);
      const response = await request(app)
        .post('/api/ventas')
        .set(headers)
        .send({
          clienteId: testData.cliente.cliente.id,
          articuloId: testData.articulo.id,
          cantidad: 2,
          cuotas: 6,
          interes: 15
        });

      expect(response.status).toBe(201);
      expect(response.body.datos).toHaveProperty('id');
    });

    it('should reject sale creation for client role', async () => {
      const headers = getAuthHeaders(testData.cliente.user);
      const response = await request(app)
        .post('/api/ventas')
        .set(headers)
        .send({
          clienteId: testData.cliente.cliente.id,
          articuloId: testData.articulo.id,
          cantidad: 1,
          cuotas: 3
        });

      expect(response.status).toBe(403);
    });

    it('should reject sale with insufficient stock', async () => {
      const headers = getAuthHeaders(testData.empleado.user);
      const response = await request(app)
        .post('/api/ventas')
        .set(headers)
        .send({
          clienteId: testData.cliente.cliente.id,
          articuloId: testData.articulo.id,
          cantidad: 999,
          cuotas: 6
        });

      expect(response.status).toBe(400);
    });

    it('should reject sale with invalid client', async () => {
      const headers = getAuthHeaders(testData.empleado.user);
      const response = await request(app)
        .post('/api/ventas')
        .set(headers)
        .send({
          clienteId: 99999,
          articuloId: testData.articulo.id,
          cantidad: 1,
          cuotas: 3
        });

      expect(response.status).toBe(404);
    });

    it('should reject sale exceeding max cuotas', async () => {
      const headers = getAuthHeaders(testData.empleado.user);
      const response = await request(app)
        .post('/api/ventas')
        .set(headers)
        .send({
          clienteId: testData.cliente.cliente.id,
          articuloId: testData.articulo.id,
          cantidad: 1,
          cuotas: 100
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/ventas/:id', () => {
    it('should get sale by id for supervisor', async () => {
      const empHeaders = getAuthHeaders(testData.empleado.user);

      const createRes = await request(app)
        .post('/api/ventas')
        .set(empHeaders)
        .send({
          clienteId: testData.cliente.cliente.id,
          articuloId: testData.articulo.id,
          cantidad: 1,
          cuotas: 3
        });

      const saleId = createRes.body.datos.id;
      const supHeaders = getAuthHeaders(testData.supervisor.user);

      const response = await request(app)
        .get(`/api/ventas/${saleId}`)
        .set(supHeaders);

      expect(response.status).toBe(200);
      expect(response.body.datos).toHaveProperty('id', saleId);
    });
  });

  describe('GET /api/ventas/cliente/:id', () => {
    it('should get sales by client for supervisor', async () => {
      const headers = getAuthHeaders(testData.supervisor.user);
      const response = await request(app)
        .get(`/api/ventas/cliente/${testData.cliente.cliente.id}`)
        .set(headers);

      expect(response.status).toBe(200);
    });
  });
});