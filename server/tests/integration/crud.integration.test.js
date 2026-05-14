/**
 * Tests de Integración - CRUD Operations
 * Pruebas de integración para operaciones CRUD completas
 */

import request from 'supertest';
import app from '../src/app.js';
import { setupTest, teardownTest, getAuthHeaders, cleanDatabase, closeConnection } from './setup.test.js';

describe('Integración: Operaciones CRUD', () => {
  let testData;

  beforeAll(async () => {
    await cleanDatabase();
    testData = await setupTest();
  });

  afterAll(async () => {
    await teardownTest();
    await closeConnection();
  });

  describe('CRUD: Préstamos', () => {
    it('should perform full CRUD cycle for loans', async () => {
      const empHeaders = getAuthHeaders(testData.empleado.user);
      const supHeaders = getAuthHeaders(testData.supervisor.user);

      // CREATE
      const createRes = await request(app)
        .post('/api/prestamos')
        .set(empHeaders)
        .send({
          clienteId: testData.cliente.cliente.id,
          monto: 800000,
          interes: 12,
          cuotas: 12,
          observacion: 'Préstamo de integración'
        });

      expect(createRes.status).toBe(201);
      const loanId = createRes.body.data.id;

      // READ
      const readRes = await request(app)
        .get(`/api/prestamos/${loanId}`)
        .set(supHeaders);

      expect(readRes.status).toBe(200);
      expect(readRes.body.data.monto).toBe(800000);
      expect(readRes.body.data.interes).toBe(12);
      expect(readRes.body.data.cuotas).toBe(12);

      // UPDATE
      const updateRes = await request(app)
        .put(`/api/prestamos/${loanId}`)
        .set(supHeaders)
        .send({ estado: 'MORA', observacion: 'Actualizado' });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.estado).toBe('MORA');

      // VERIFY UPDATE
      const verifyRes = await request(app)
        .get(`/api/prestamos/${loanId}`)
        .set(supHeaders);

      expect(verifyRes.body.data.estado).toBe('MORA');
      expect(verifyRes.body.data.observacion).toBe('Actualizado');
    });

    it('should list all created loans', async () => {
      const empHeaders = getAuthHeaders(testData.empleado.user);

      // Create multiple loans
      await request(app)
        .post('/api/prestamos')
        .set(empHeaders)
        .send({ clienteId: testData.cliente.cliente.id, monto: 100000, interes: 15, cuotas: 6 });

      await request(app)
        .post('/api/prestamos')
        .set(empHeaders)
        .send({ clienteId: testData.cliente.cliente.id, monto: 200000, interes: 12, cuotas: 12 });

      const listRes = await request(app)
        .get('/api/prestamos')
        .set(getAuthHeaders(testData.supervisor.user));

      expect(listRes.status).toBe(200);
      expect(Array.isArray(listRes.body.data)).toBe(true);
    });
  });

  describe('CRUD: Clientes', () => {
    it('should perform full CRUD cycle for clients', async () => {
      const empHeaders = getAuthHeaders(testData.empleado.user);

      // CREATE
      const createRes = await request(app)
        .post('/api/clientes')
        .set(empHeaders)
        .send({
          nombre: 'Cliente Integración',
          email: 'cliente.integracion@test.com',
          password: 'password123',
          cedula: '998877665',
          telefono: '3123456789'
        });

      expect(createRes.status).toBe(201);
      const clienteId = createRes.body.cliente.id;

      // READ
      const readRes = await request(app)
        .get(`/api/clientes/${clienteId}`)
        .set(getAuthHeaders(testData.supervisor.user));

      expect(readRes.status).toBe(200);
      expect(readRes.body.cliente.nombre).toBe('Cliente Integración');

      // UPDATE
      const updateRes = await request(app)
        .put(`/api/clientes/${clienteId}`)
        .set(getAuthHeaders(testData.supervisor.user))
        .send({ telefono: '3129999999' });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.cliente.telefono).toBe('3129999999');
    });
  });

  describe('CRUD: Artículos', () => {
    it('should perform full CRUD cycle for articles', async () => {
      const supHeaders = getAuthHeaders(testData.supervisor.user);

      // CREATE
      const createRes = await request(app)
        .post('/api/articulos')
        .set(supHeaders)
        .send({
          nombre: 'Artículo Integración',
          categoria: 'Categoría Test',
          precio: 75000,
          stock: 25
        });

      expect(createRes.status).toBe(201);
      const articuloId = createRes.body.datos.id;

      // READ
      const readRes = await request(app)
        .get(`/api/articulos/${articuloId}`)
        .set(supHeaders);

      expect(readRes.status).toBe(200);
      expect(readRes.body.datos.nombre).toBe('Artículo Integración');

      // UPDATE
      const updateRes = await request(app)
        .put(`/api/articulos/${articuloId}`)
        .set(supHeaders)
        .send({ nombre: 'Artículo Actualizado' });

      expect(updateRes.status).toBe(200);

      // Stock adjustment
      const stockRes = await request(app)
        .patch(`/api/articulos/${articuloId}/stock`)
        .set(supHeaders)
        .send({ stock: 50, motivo: 'Test de integración' });

      expect(stockRes.status).toBe(200);
      expect(stockRes.body.datos.stock).toBe(50);

      // DELETE (soft delete when has relations)
      const deleteRes = await request(app)
        .delete(`/api/articulos/${articuloId}`)
        .set(supHeaders);

      expect(deleteRes.status).toBe(200);
    });
  });

  describe('CRUD: Ventas', () => {
    it('should perform full sale creation cycle', async () => {
      const empHeaders = getAuthHeaders(testData.empleado.user);

      // Create sale
      const createRes = await request(app)
        .post('/api/ventas')
        .set(empHeaders)
        .send({
          clienteId: testData.cliente.cliente.id,
          articuloId: testData.articulo.id,
          cantidad: 1,
          cuotas: 6,
          interes: 15
        });

      expect(createRes.status).toBe(201);
      const ventaId = createRes.body.datos.id;

      // Read sale
      const readRes = await request(app)
        .get(`/api/ventas/${ventaId}`)
        .set(getAuthHeaders(testData.supervisor.user));

      expect(readRes.status).toBe(200);
      expect(readRes.body.datos.id).toBe(ventaId);
    });
  });

  describe('CRUD: Pagos', () => {
    it('should create payment and verify auto-approval flow', async () => {
      const empHeaders = getAuthHeaders(testData.empleado.user);

      // Create loan
      const loanRes = await request(app)
        .post('/api/prestamos')
        .set(empHeaders)
        .send({
          clienteId: testData.cliente.cliente.id,
          monto: 120000,
          interes: 0,
          cuotas: 1
        });
      const loanId = loanRes.body.data.id;

      // Make payment for full amount (should auto-approve)
      const paymentRes = await request(app)
        .post('/api/pagos')
        .set(empHeaders)
        .send({
          tipo: 'PRESTAMO',
          referenciaId: loanId,
          clienteId: testData.cliente.cliente.id,
          monto: 120000,
          metodo: 'EFECTIVO'
        });

      expect(paymentRes.status).toBe(201);

      // Verify loan is marked as paid
      const verifyRes = await request(app)
        .get(`/api/prestamos/${loanId}`)
        .set(getAuthHeaders(testData.supervisor.user));

      expect(verifyRes.body.data.estado).toBe('PAGADO');
    });
  });

  describe('CRUD: Solicitudes', () => {
    it('should perform full solicitud creation and approval cycle', async () => {
      const cliHeaders = getAuthHeaders(testData.cliente.user);
      const empHeaders = getAuthHeaders(testData.empleado.user);

      // Client creates solicitud
      const createRes = await request(app)
        .post('/api/solicitudes')
        .set(cliHeaders)
        .send({
          tipo: 'MENSAJE',
          mensaje: 'Solicitud de integración'
        });

      expect(createRes.status).toBe(201);
      const solicitudId = createRes.body.datos.id;

      // Employee responds to solicitud
      const respondRes = await request(app)
        .put(`/api/solicitudes/${solicitudId}/responder`)
        .set(empHeaders)
        .send({ estado: 'APROBADO', respuesta: 'Aprobado' });

      expect(respondRes.status).toBe(200);
      expect(respondRes.body.datos.estado).toBe('APROBADO');
    });
  });
});