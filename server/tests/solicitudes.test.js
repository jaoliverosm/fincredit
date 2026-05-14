/**
 * Tests del Controlador de Solicitudes
 * Pruebas unitarias para solicitudes.controller.js
 */

import request from 'supertest';
import app from '../src/app.js';
import { setupTest, teardownTest, getAuthHeaders, closeConnection } from './setup.test.js';

describe('Controlador de Solicitudes', () => {
  let testData;

  beforeAll(async () => {
    testData = await setupTest();
  });

  afterAll(async () => {
    await teardownTest();
    await closeConnection();
  });

  describe('GET /api/solicitudes', () => {
    it('should return solicitudes for supervisor', async () => {
      const headers = getAuthHeaders(testData.supervisor.user);
      const response = await request(app)
        .get('/api/solicitudes')
        .set(headers);

      expect(response.status).toBe(200);
    });

    it('should return solicitudes for employee', async () => {
      const headers = getAuthHeaders(testData.empleado.user);
      const response = await request(app)
        .get('/api/solicitudes')
        .set(headers);

      expect(response.status).toBe(200);
    });

    it('should return solicitudes for client', async () => {
      const headers = getAuthHeaders(testData.cliente.user);
      const response = await request(app)
        .get('/api/solicitudes')
        .set(headers);

      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/solicitudes/pendientes', () => {
    it('should return pending solicitudes for supervisor', async () => {
      const headers = getAuthHeaders(testData.supervisor.user);
      const response = await request(app)
        .get('/api/solicitudes/pendientes')
        .set(headers);

      expect(response.status).toBe(200);
    });

    it('should return pending solicitudes for employee', async () => {
      const headers = getAuthHeaders(testData.empleado.user);
      const response = await request(app)
        .get('/api/solicitudes/pendientes')
        .set(headers);

      expect(response.status).toBe(200);
    });

    it('should reject access for clients', async () => {
      const headers = getAuthHeaders(testData.cliente.user);
      const response = await request(app)
        .get('/api/solicitudes/pendientes')
        .set(headers);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/solicitudes/:id', () => {
    it('should get solicitud by id', async () => {
      const clienteHeaders = getAuthHeaders(testData.cliente.user);

      const createRes = await request(app)
        .post('/api/solicitudes')
        .set(clienteHeaders)
        .send({
          tipo: 'MENSAJE',
          mensaje: 'Solicitud de prueba'
        });

      const solicitudId = createRes.body.datos.id;
      const empHeaders = getAuthHeaders(testData.empleado.user);

      const response = await request(app)
        .get(`/api/solicitudes/${solicitudId}`)
        .set(empHeaders);

      expect(response.status).toBe(200);
      expect(response.body.datos).toHaveProperty('id', solicitudId);
    });
  });

  describe('POST /api/solicitudes', () => {
    it('should create solicitud as client', async () => {
      const headers = getAuthHeaders(testData.cliente.user);
      const response = await request(app)
        .post('/api/solicitudes')
        .set(headers)
        .send({
          tipo: 'MENSAJE',
          mensaje: 'Solicitud de prueba desde tests'
        });

      expect(response.status).toBe(201);
      expect(response.body.datos).toHaveProperty('id');
      expect(response.body.datos.tipo).toBe('MENSAJE');
    });

    it('should create solicitud NUEVO_PRESTAMO', async () => {
      const headers = getAuthHeaders(testData.cliente.user);
      const response = await request(app)
        .post('/api/solicitudes')
        .set(headers)
        .send({
          tipo: 'NUEVO_PRESTAMO',
          monto: 500000,
          cuotas: 12,
          mensaje: 'Necesito un préstamo'
        });

      expect(response.status).toBe(201);
    });

    it('should create solicitud NUEVA_COMPRA', async () => {
      const headers = getAuthHeaders(testData.cliente.user);
      const response = await request(app)
        .post('/api/solicitudes')
        .set(headers)
        .send({
          tipo: 'NUEVA_COMPRA',
          articuloId: testData.articulo.id,
          mensaje: 'Quiero comprar este artículo'
        });

      expect(response.status).toBe(201);
    });

    it('should reject creation with invalid tipo', async () => {
      const headers = getAuthHeaders(testData.cliente.user);
      const response = await request(app)
        .post('/api/solicitudes')
        .set(headers)
        .send({
          tipo: 'INVALIDO',
          mensaje: 'Test'
        });

      expect(response.status).toBe(400);
    });

    it('should reject without tipo', async () => {
      const headers = getAuthHeaders(testData.cliente.user);
      const response = await request(app)
        .post('/api/solicitudes')
        .set(headers)
        .send({ mensaje: 'Sin tipo' });

      expect(response.status).toBe(400);
    });

    it('should reject with NUEVO_PRESTAMO missing monto/cuotas', async () => {
      const headers = getAuthHeaders(testData.cliente.user);
      const response = await request(app)
        .post('/api/solicitudes')
        .set(headers)
        .send({
          tipo: 'NUEVO_PRESTAMO',
          mensaje: 'Quiero un préstamo'
        });

      expect(response.status).toBe(400);
    });

    it('should reject with NUEVA_COMPRA missing articuloId', async () => {
      const headers = getAuthHeaders(testData.cliente.user);
      const response = await request(app)
        .post('/api/solicitudes')
        .set(headers)
        .send({
          tipo: 'NUEVA_COMPRA',
          mensaje: 'Quiero comprar'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/solicitudes/:id/responder', () => {
    it('should approve solicitud as employee', async () => {
      const clienteHeaders = getAuthHeaders(testData.cliente.user);
      const createRes = await request(app)
        .post('/api/solicitudes')
        .set(clienteHeaders)
        .send({ tipo: 'MENSAJE', mensaje: 'Test' });

      const solicitudId = createRes.body.datos.id;
      const empHeaders = getAuthHeaders(testData.empleado.user);

      const response = await request(app)
        .put(`/api/solicitudes/${solicitudId}/responder`)
        .set(empHeaders)
        .send({ estado: 'APROBADO', respuesta: 'Aprobado' });

      expect(response.status).toBe(200);
      expect(response.body.datos.estado).toBe('APROBADO');
    });

    it('should reject solicitud as employee', async () => {
      const clienteHeaders = getAuthHeaders(testData.cliente.user);
      const createRes = await request(app)
        .post('/api/solicitudes')
        .set(clienteHeaders)
        .send({ tipo: 'MENSAJE', mensaje: 'Test' });

      const solicitudId = createRes.body.datos.id;
      const empHeaders = getAuthHeaders(testData.empleado.user);

      const response = await request(app)
        .put(`/api/solicitudes/${solicitudId}/responder`)
        .set(empHeaders)
        .send({ estado: 'RECHAZADO', respuesta: 'Rechazado' });

      expect(response.status).toBe(200);
      expect(response.body.datos.estado).toBe('RECHAZADO');
    });

    it('should reject response without estado/respuesta', async () => {
      const clienteHeaders = getAuthHeaders(testData.cliente.user);
      const createRes = await request(app)
        .post('/api/solicitudes')
        .set(clienteHeaders)
        .send({ tipo: 'MENSAJE', mensaje: 'Test' });

      const solicitudId = createRes.body.datos.id;
      const empHeaders = getAuthHeaders(testData.empleado.user);

      const response = await request(app)
        .put(`/api/solicitudes/${solicitudId}/responder`)
        .set(empHeaders)
        .send({});

      expect(response.status).toBe(400);
    });

    it('should reject response to already processed solicitud', async () => {
      const clienteHeaders = getAuthHeaders(testData.cliente.user);
      const createRes = await request(app)
        .post('/api/solicitudes')
        .set(clienteHeaders)
        .send({ tipo: 'MENSAJE', mensaje: 'Test' });

      const solicitudId = createRes.body.datos.id;
      const empHeaders = getAuthHeaders(testData.empleado.user);

      await request(app)
        .put(`/api/solicitudes/${solicitudId}/responder`)
        .set(empHeaders)
        .send({ estado: 'APROBADO', respuesta: 'Ok' });

      const response = await request(app)
        .put(`/api/solicitudes/${solicitudId}/responder`)
        .set(empHeaders)
        .send({ estado: 'RECHAZADO', respuesta: 'Ya procesado' });

      expect(response.status).toBe(400);
    });
  });
});