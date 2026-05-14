/**
 * Tests del Controlador de Préstamos
 * Pruebas unitarias para prestamos.controller.js
 */

import request from 'supertest';
import app from '../src/app.js';
import { setupTest, teardownTest, getAuthHeaders, closeConnection } from './setup.test.js';

describe('Préstamos', () => {
  let testData;

  beforeAll(async () => {
    testData = await setupTest();
  });

  afterAll(async () => {
    await teardownTest();
    await closeConnection();
  });

  describe('POST /api/prestamos', () => {
    it('should create a loan successfully', async () => {
      const headers = getAuthHeaders(testData.empleado.user);

      const loanData = {
        clienteId: testData.cliente.cliente.id,
        monto: 1000000,
        interes: 15,
        cuotas: 12,
        observacion: 'Préstamo de prueba'
      };

      const response = await request(app)
        .post('/api/prestamos')
        .set(headers)
        .send(loanData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.monto).toBe(1000000);
      expect(response.body.data.interes).toBe(15);
      expect(response.body.data.cuotas).toBe(12);
      expect(response.body.data).toHaveProperty('cuotaMensual');
      expect(response.body.data).toHaveProperty('fechaVencimiento');
    });

    it('should reject loan creation for unauthorized role', async () => {
      const headers = getAuthHeaders(testData.cliente.user);

      const loanData = {
        clienteId: testData.cliente.cliente.id,
        monto: 1000000,
        interes: 15,
        cuotas: 12
      };

      const response = await request(app)
        .post('/api/prestamos')
        .set(headers)
        .send(loanData);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should reject loan with invalid amount', async () => {
      const headers = getAuthHeaders(testData.empleado.user);

      const loanData = {
        clienteId: testData.cliente.cliente.id,
        monto: -1000,
        interes: 15,
        cuotas: 12
      };

      const response = await request(app)
        .post('/api/prestamos')
        .set(headers)
        .send(loanData);

      expect(response.status).toBe(400);
    });

    it('should reject loan with invalid interest rate', async () => {
      const headers = getAuthHeaders(testData.empleado.user);

      const loanData = {
        clienteId: testData.cliente.cliente.id,
        monto: 1000000,
        interes: 150,
        cuotas: 12
      };

      const response = await request(app)
        .post('/api/prestamos')
        .set(headers)
        .send(loanData);

      expect(response.status).toBe(400);
    });

    it('should reject loan with invalid installments', async () => {
      const headers = getAuthHeaders(testData.empleado.user);

      const loanData = {
        clienteId: testData.cliente.cliente.id,
        monto: 1000000,
        interes: 15,
        cuotas: 0
      };

      const response = await request(app)
        .post('/api/prestamos')
        .set(headers)
        .send(loanData);

      expect(response.status).toBe(400);
    });

    it('should reject loan with missing required fields', async () => {
      const headers = getAuthHeaders(testData.empleado.user);

      const response = await request(app)
        .post('/api/prestamos')
        .set(headers)
        .send({ monto: 100000 });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/prestamos', () => {
    let createdLoan;

    beforeEach(async () => {
      const headers = getAuthHeaders(testData.empleado.user);

      const loanData = {
        clienteId: testData.cliente.cliente.id,
        monto: 1000000,
        interes: 15,
        cuotas: 12
      };

      const response = await request(app)
        .post('/api/prestamos')
        .set(headers)
        .send(loanData);

      createdLoan = response.body.data;
    });

    it('should get all loans for supervisor', async () => {
      const headers = getAuthHeaders(testData.supervisor.user);

      const response = await request(app)
        .get('/api/prestamos')
        .set(headers);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should get loans for employee', async () => {
      const headers = getAuthHeaders(testData.empleado.user);

      const response = await request(app)
        .get('/api/prestamos')
        .set(headers);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should reject loan listing for client', async () => {
      const headers = getAuthHeaders(testData.cliente.user);

      const response = await request(app)
        .get('/api/prestamos')
        .set(headers);

      expect(response.status).toBe(403);
    });

    it('should filter loans by status', async () => {
      const headers = getAuthHeaders(testData.empleado.user);

      const response = await request(app)
        .get('/api/prestamos?estado=ACTIVO')
        .set(headers);

      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/prestamos/:id', () => {
    it('should get loan by id for supervisor', async () => {
      const headers = getAuthHeaders(testData.empleado.user);

      const loanData = {
        clienteId: testData.cliente.cliente.id,
        monto: 1000000,
        interes: 15,
        cuotas: 12
      };

      const createRes = await request(app)
        .post('/api/prestamos')
        .set(headers)
        .send(loanData);

      const loanId = createRes.body.data.id;
      const supervisorHeaders = getAuthHeaders(testData.supervisor.user);

      const response = await request(app)
        .get(`/api/prestamos/${loanId}`)
        .set(supervisorHeaders);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(loanId);
    });

    it('should return 404 for non-existent loan', async () => {
      const headers = getAuthHeaders(testData.supervisor.user);

      const response = await request(app)
        .get('/api/prestamos/99999')
        .set(headers);

      expect(response.status).toBe(404);
    });

    it('should reject loan access for wrong role', async () => {
      const headers = getAuthHeaders(testData.cliente.user);

      const response = await request(app)
        .get('/api/prestamos/1')
        .set(headers);

      expect(response.status).toBe(403);
    });
  });

  describe('PUT /api/prestamos/:id', () => {
    it('should update loan for supervisor', async () => {
      const empHeaders = getAuthHeaders(testData.empleado.user);

      const loanData = {
        clienteId: testData.cliente.cliente.id,
        monto: 1000000,
        interes: 15,
        cuotas: 12
      };

      const createRes = await request(app)
        .post('/api/prestamos')
        .set(empHeaders)
        .send(loanData);

      const loanId = createRes.body.data.id;
      const supHeaders = getAuthHeaders(testData.supervisor.user);

      const response = await request(app)
        .put(`/api/prestamos/${loanId}`)
        .set(supHeaders)
        .send({ estado: 'MORA', observacion: 'Actualizado' });

      expect(response.status).toBe(200);
      expect(response.body.data.estado).toBe('MORA');
    });

    it('should reject loan update for employee', async () => {
      const empHeaders = getAuthHeaders(testData.empleado.user);

      const loanData = {
        clienteId: testData.cliente.cliente.id,
        monto: 1000000,
        interes: 15,
        cuotas: 12
      };

      const createRes = await request(app)
        .post('/api/prestamos')
        .set(empHeaders)
        .send(loanData);

      const loanId = createRes.body.data.id;

      const response = await request(app)
        .put(`/api/prestamos/${loanId}`)
        .set(empHeaders)
        .send({ observacion: 'Intento' });

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/prestamos/cliente/:clienteId', () => {
    it('should get loans by client for supervisor', async () => {
      const empHeaders = getAuthHeaders(testData.empleado.user);

      const loanData = {
        clienteId: testData.cliente.cliente.id,
        monto: 1000000,
        interes: 15,
        cuotas: 12
      };

      await request(app)
        .post('/api/prestamos')
        .set(empHeaders)
        .send(loanData);

      const supHeaders = getAuthHeaders(testData.supervisor.user);
      const response = await request(app)
        .get(`/api/prestamos/cliente/${testData.cliente.cliente.id}`)
        .set(supHeaders);

      expect(response.status).toBe(200);
    });

    it('should respect client access permissions', async () => {
      const headers = getAuthHeaders(testData.cliente.user);
      const response = await request(app)
        .get(`/api/prestamos/cliente/99999`)
        .set(headers);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/prestamos/estadisticas', () => {
    it('should get loan statistics', async () => {
      const headers = getAuthHeaders(testData.supervisor.user);

      const response = await request(app)
        .get('/api/prestamos/estadisticas')
        .set(headers);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('total');
    });
  });

  describe('DELETE /api/prestamos/:id', () => {
    it('should reject loan deletion via DELETE (not implemented)', async () => {
      const headers = getAuthHeaders(testData.supervisor.user);

      const response = await request(app)
        .delete('/api/prestamos/1')
        .set(headers);

      // DELETE returns 404 because route doesn't exist
      expect(response.status).toBe(404);
    });
  });
});