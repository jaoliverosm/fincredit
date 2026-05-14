/**
 * Tests de Integración - Autenticación Completa
 * Pruebas de integración para el flujo de autenticación
 */

import request from 'supertest';
import app from '../src/app.js';
import { setupTest, teardownTest, getAuthHeaders, cleanDatabase, closeConnection } from './setup.test.js';

describe('Integración: Autenticación Completa', () => {
  let testData;

  beforeAll(async () => {
    await cleanDatabase();
    testData = await setupTest();
  });

  afterAll(async () => {
    await teardownTest();
    await closeConnection();
  });

  describe('Flujo de autenticación completa', () => {
    it('should register and login a new user successfully', async () => {
      const supervisorHeaders = getAuthHeaders(testData.supervisor.user);

      // Step 1: Crear un nuevo empleado
      const empleadoRes = await request(app)
        .post('/api/empleados')
        .set(supervisorHeaders)
        .send({
          nombre: 'Integracion Test',
          email: 'integracion@test.com',
          password: 'test123',
          telefono: '3111111111',
          meta: 2000000
        });

      expect(empleadoRes.status).toBe(201);
      const empleadoId = empleadoRes.body.data.id;
      expect(empleadoId).toBeGreaterThan(0);

      // Step 2: Login with new credentials
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'integracion@test.com',
          password: 'test123'
        });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.success).toBe(true);
      expect(loginRes.body.data).toHaveProperty('token');
      expect(loginRes.body.data.user.email).toBe('integracion@test.com');

      // Step 3: Access protected endpoint with token
      const token = loginRes.body.data.token;
      const profileRes = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(profileRes.status).toBe(200);
      expect(profileRes.body.data.email).toBe('integracion@test.com');
    });

    it('should reject expired tokens', async () => {
      const jwt = await import('jsonwebtoken');

      const expiredToken = jwt.sign(
        { id: 1, email: 'test@test.com', rol: 'EMPLEADO' },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '-1h' }
      );

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
    });

    it('should handle token tampering', async () => {
      const jwt = await import('jsonwebtoken');

      const tamperedToken = jwt.sign(
        { id: 999, email: 'admin@evil.com', rol: 'SUPERVISOR' },
        'wrong-secret',
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${tamperedToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('Integración de roles', () => {
    it('should enforce role hierarchy correctly', async () => {
      // Supervisor can access everything
      const supRes = await request(app)
        .get('/api/empleados')
        .set(getAuthHeaders(testData.supervisor.user));
      expect(supRes.status).toBe(200);

      // Employee cannot access supervisor endpoints
      const empRes = await request(app)
        .get('/api/empleados')
        .set(getAuthHeaders(testData.empleado.user));
      expect(empRes.status).toBe(403);

      // Client cannot access employee endpoints
      const cliRes = await request(app)
        .get('/api/empleados')
        .set(getAuthHeaders(testData.cliente.user));
      expect(cliRes.status).toBe(403);
    });

    it('should allow cross-role access where permitted', async () => {
      // Client can see own clientes list
      const cliRes = await request(app)
        .get('/api/clientes')
        .set(getAuthHeaders(testData.cliente.user));
      expect(cliRes.status).toBe(200);

      // Employee can see their own dashboard
      const empRes = await request(app)
        .get('/api/dashboard/empleado')
        .set(getAuthHeaders(testData.empleado.user));
      expect(empRes.status).toBe(200);
    });
  });
});