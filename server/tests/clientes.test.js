/**
 * Tests del Controlador de Clientes
 * Pruebas unitarias para clientes.controller.js
 */

import request from 'supertest';
import app from '../src/app.js';
import { setupTest, teardownTest, getAuthHeaders, closeConnection } from './setup.test.js';

describe('Controlador de Clientes', () => {
  let testData;

  beforeAll(async () => {
    testData = await setupTest();
  });

  afterAll(async () => {
    await teardownTest();
    await closeConnection();
  });

  describe('GET /api/clientes', () => {
    it('should return clients for supervisor', async () => {
      const headers = getAuthHeaders(testData.supervisor.user);
      const response = await request(app)
        .get('/api/clientes')
        .set(headers);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('cantidad');
      expect(Array.isArray(response.body.clientes)).toBe(true);
    });

    it('should return clients for employee', async () => {
      const headers = getAuthHeaders(testData.empleado.user);
      const response = await request(app)
        .get('/api/clientes')
        .set(headers);

      expect(response.status).toBe(200);
    });

    it('should return own profile for client', async () => {
      const headers = getAuthHeaders(testData.cliente.user);
      const response = await request(app)
        .get('/api/clientes')
        .set(headers);

      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/clientes/:id', () => {
    it('should return client by id for supervisor', async () => {
      const headers = getAuthHeaders(testData.supervisor.user);
      const response = await request(app)
        .get(`/api/clientes/${testData.cliente.cliente.id}`)
        .set(headers);

      expect(response.status).toBe(200);
      expect(response.body.cliente).toHaveProperty('id');
    });

    it('should return own profile for client', async () => {
      const headers = getAuthHeaders(testData.cliente.user);
      const response = await request(app)
        .get(`/api/clientes/${testData.cliente.cliente.id}`)
        .set(headers);

      expect(response.status).toBe(200);
    });

    it('should reject access to another client profile', async () => {
      const headers = getAuthHeaders(testData.cliente.user);
      const response = await request(app)
        .get('/api/clientes/99999')
        .set(headers);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/clientes/estadisticas', () => {
    it('should return client statistics', async () => {
      const headers = getAuthHeaders(testData.supervisor.user);
      const response = await request(app)
        .get('/api/clientes/estadisticas')
        .set(headers);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('estadisticas');
      expect(response.body.estadisticas).toHaveProperty('total');
    });
  });

  describe('POST /api/clientes', () => {
    it('should create client as employee', async () => {
      const headers = getAuthHeaders(testData.empleado.user);
      const response = await request(app)
        .post('/api/clientes')
        .set(headers)
        .send({
          nombre: 'Nuevo Cliente',
          email: 'nuevocliente@email.com',
          password: 'password123',
          cedula: '987654321'
        });

      expect(response.status).toBe(201);
    });

    it('should reject creation without required fields', async () => {
      const headers = getAuthHeaders(testData.empleado.user);
      const response = await request(app)
        .post('/api/clientes')
        .set(headers)
        .send({ nombre: 'Test' });

      expect(response.status).toBe(400);
    });

    it('should reject creation with invalid email', async () => {
      const headers = getAuthHeaders(testData.empleado.user);
      const response = await request(app)
        .post('/api/clientes')
        .set(headers)
        .send({
          nombre: 'Test',
          email: 'invalid',
          password: 'pass123',
          cedula: '123456789'
        });

      expect(response.status).toBe(400);
    });

    it('should reject creation with client role', async () => {
      const headers = getAuthHeaders(testData.cliente.user);
      const response = await request(app)
        .post('/api/clientes')
        .set(headers)
        .send({
          nombre: 'Test',
          email: 'test123@email.com',
          password: 'pass123',
          cedula: '111222333'
        });

      expect(response.status).toBe(403);
    });
  });

  describe('PUT /api/clientes/:id', () => {
    it('should update client as supervisor', async () => {
      const headers = getAuthHeaders(testData.supervisor.user);
      const response = await request(app)
        .put(`/api/clientes/${testData.cliente.cliente.id}`)
        .set(headers)
        .send({ telefono: '3221234567' });

      expect(response.status).toBe(200);
    });

    it('should allow client to update own profile', async () => {
      const headers = getAuthHeaders(testData.cliente.user);
      const response = await request(app)
        .put(`/api/clientes/${testData.cliente.cliente.id}`)
        .set(headers)
        .send({ telefono: '3119876543' });

      expect(response.status).toBe(200);
    });
  });
});