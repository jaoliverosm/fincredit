/**
 * Tests del Controlador de Empleados
 * Pruebas unitarias para empleados.controller.js
 */

import request from 'supertest';
import app from '../src/app.js';
import { setupTest, teardownTest, getAuthHeaders, closeConnection } from './setup.test.js';

describe('Controlador de Empleados', () => {
  let testData;

  beforeAll(async () => {
    testData = await setupTest();
  });

  afterAll(async () => {
    await teardownTest();
    await closeConnection();
  });

  describe('GET /api/empleados', () => {
    it('should return employees for supervisor', async () => {
      const headers = getAuthHeaders(testData.supervisor.user);
      const response = await request(app)
        .get('/api/empleados')
        .set(headers);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should reject access for client role', async () => {
      const headers = getAuthHeaders(testData.cliente.user);
      const response = await request(app)
        .get('/api/empleados')
        .set(headers);

      expect(response.status).toBe(403);
    });

    it('should reject access for employee role', async () => {
      const headers = getAuthHeaders(testData.empleado.user);
      const response = await request(app)
        .get('/api/empleados')
        .set(headers);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/empleados/:id', () => {
    it('should return own profile for employee', async () => {
      const headers = getAuthHeaders(testData.empleado.user);
      const response = await request(app)
        .get(`/api/empleados/${testData.empleado.empleado.id}`)
        .set(headers);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should reject access to another employee profile', async () => {
      const headers = getAuthHeaders(testData.empleado.user);
      const response = await request(app)
        .get('/api/empleados/99999')
        .set(headers);

      // Empleado no puede ver perfil de otro
      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/empleados', () => {
    it('should create employee as supervisor', async () => {
      const headers = getAuthHeaders(testData.supervisor.user);
      const response = await request(app)
        .post('/api/empleados')
        .set(headers)
        .send({
          nombre: 'Nuevo Empleado',
          email: 'nuevo@email.com',
          password: 'password123',
          telefono: '3111234567',
          meta: 3000000
        });

      expect(response.status).toBe(201);
    });

    it('should reject creation by non-supervisor', async () => {
      const headers = getAuthHeaders(testData.empleado.user);
      const response = await request(app)
        .post('/api/empleados')
        .set(headers)
        .send({
          nombre: 'Test',
          email: 'test2@email.com',
          password: 'password123'
        });

      expect(response.status).toBe(403);
    });

    it('should reject creation with invalid email', async () => {
      const headers = getAuthHeaders(testData.supervisor.user);
      const response = await request(app)
        .post('/api/empleados')
        .set(headers)
        .send({
          nombre: 'Test',
          email: 'invalid-email',
          password: 'password123'
        });

      expect(response.status).toBe(400);
    });

    it('should reject with duplicate email', async () => {
      const headers = getAuthHeaders(testData.supervisor.user);
      const response = await request(app)
        .post('/api/empleados')
        .set(headers)
        .send({
          nombre: 'Test',
          email: 'supervisor@test.com',
          password: 'password123'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/empleados/:id', () => {
    it('should update own profile as employee', async () => {
      const headers = getAuthHeaders(testData.empleado.user);
      const response = await request(app)
        .put(`/api/empleados/${testData.empleado.empleado.id}`)
        .set(headers)
        .send({ nombre: 'Empleado Actualizado' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('PUT /api/empleados/:id/password', () => {
    it('should allow password change for self', async () => {
      const headers = getAuthHeaders(testData.empleado.user);
      const response = await request(app)
        .put(`/api/empleados/${testData.empleado.empleado.id}/password`)
        .set(headers)
        .send({
          passwordActual: 'test123',
          passwordNuevo: 'nuevo123'
        });

      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/empleados/:id/metricas', () => {
    it('should return employee metrics', async () => {
      const headers = getAuthHeaders(testData.supervisor.user);
      const response = await request(app)
        .get(`/api/empleados/${testData.empleado.empleado.id}/metricas`)
        .set(headers);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('empleado');
    });
  });
});