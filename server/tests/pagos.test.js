/**
 * Tests del Controlador de Pagos
 * Pruebas unitarias para pagos.controller.js
 */

import request from 'supertest';
import app from '../src/app.js';
import { setupTest, teardownTest, getAuthHeaders, closeConnection } from './setup.test.js';

describe('Controlador de Pagos', () => {
  let testData;
  let createdLoan;
  let createdSale;

  beforeAll(async () => {
    testData = await setupTest();
  });

  afterAll(async () => {
    await teardownTest();
    await closeConnection();
  });

  beforeEach(async () => {
    // Create a loan and a sale for payment tests
    const empHeaders = getAuthHeaders(testData.empleado.user);

    const loanRes = await request(app)
      .post('/api/prestamos')
      .set(empHeaders)
      .send({
        clienteId: testData.cliente.cliente.id,
        monto: 500000,
        interes: 15,
        cuotas: 12
      });
    createdLoan = loanRes.body.data;

    const saleRes = await request(app)
      .post('/api/ventas')
      .set(empHeaders)
      .send({
        clienteId: testData.cliente.cliente.id,
        articuloId: testData.articulo.id,
        cantidad: 1,
        cuotas: 6,
        interes: 15
      });
    createdSale = saleRes.body.data;
  });

  describe('GET /api/pagos', () => {
    it('should return pagos for supervisor', async () => {
      const headers = getAuthHeaders(testData.supervisor.user);
      const response = await request(app)
        .get('/api/pagos')
        .set(headers);

      expect(response.status).toBe(200);
    });

    it('should return pagos for employee', async () => {
      const headers = getAuthHeaders(testData.empleado.user);
      const response = await request(app)
        .get('/api/pagos')
        .set(headers);

      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/pagos/prestamo/:id', () => {
    it('should return pagos for a loan', async () => {
      const headers = getAuthHeaders(testData.supervisor.user);
      const response = await request(app)
        .get(`/api/pagos/prestamo/${createdLoan.id}`)
        .set(headers);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('resumen');
    });
  });

  describe('GET /api/pagos/venta/:id', () => {
    it('should return pagos for a sale', async () => {
      const headers = getAuthHeaders(testData.supervisor.user);
      const response = await request(app)
        .get(`/api/pagos/venta/${createdSale.id}`)
        .set(headers);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('resumen');
    });
  });

  describe('GET /api/pagos/cliente/:id', () => {
    it('should return payments for a client', async () => {
      const headers = getAuthHeaders(testData.supervisor.user);
      const response = await request(app)
        .get(`/api/pagos/cliente/${testData.cliente.cliente.id}`)
        .set(headers);

      expect(response.status).toBe(200);
    });
  });

  describe('POST /api/pagos', () => {
    it('should create a loan payment as employee', async () => {
      const headers = getAuthHeaders(testData.empleado.user);
      const response = await request(app)
        .post('/api/pagos')
        .set(headers)
        .send({
          tipo: 'PRESTAMO',
          referenciaId: createdLoan.id,
          clienteId: testData.cliente.cliente.id,
          monto: 50000,
          metodo: 'EFECTIVO'
        });

      expect(response.status).toBe(201);
    });

    it('should create a sale payment as employee', async () => {
      const headers = getAuthHeaders(testData.empleado.user);
      const response = await request(app)
        .post('/api/pagos')
        .set(headers)
        .send({
          tipo: 'VENTA',
          referenciaId: createdSale.id,
          clienteId: testData.cliente.cliente.id,
          monto: 50000,
          metodo: 'TRANSFERENCIA'
        });

      expect(response.status).toBe(201);
    });

    it('should reject payment with invalid type', async () => {
      const headers = getAuthHeaders(testData.empleado.user);
      const response = await request(app)
        .post('/api/pagos')
        .set(headers)
        .send({
          tipo: 'INVALIDO',
          referenciaId: createdLoan.id,
          clienteId: testData.cliente.cliente.id,
          monto: 50000
        });

      expect(response.status).toBe(400);
    });

    it('should reject payment with invalid amount', async () => {
      const headers = getAuthHeaders(testData.empleado.user);
      const response = await request(app)
        .post('/api/pagos')
        .set(headers)
        .send({
          tipo: 'PRESTAMO',
          referenciaId: createdLoan.id,
          clienteId: testData.cliente.cliente.id,
          monto: -100
        });

      expect(response.status).toBe(400);
    });

    it('should reject auto-approving a fully paid loan', async () => {
      // First pay the full loan amount
      const headers = getAuthHeaders(testData.empleado.user);
      const response = await request(app)
        .post('/api/pagos')
        .set(headers)
        .send({
          tipo: 'PRESTAMO',
          referenciaId: createdLoan.id,
          clienteId: testData.cliente.cliente.id,
          monto: 500000,
          metodo: 'EFECTIVO'
        });

      expect(response.status).toBe(201);

      // Try paying again - should fail because it's fully paid
      const response2 = await request(app)
        .post('/api/pagos')
        .set(headers)
        .send({
          tipo: 'PRESTAMO',
          referenciaId: createdLoan.id,
          clienteId: testData.cliente.cliente.id,
          monto: 10000,
          metodo: 'EFECTIVO'
        });

      expect(response2.status).toBe(400);
    });
  });
});