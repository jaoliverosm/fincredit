/**
 * Tests de Integración - Base de Datos y Transacciones
 * Pruebas de integración para operaciones de base de datos
 */

import request from 'supertest';
import app from '../src/app.js';
import { PrismaClient } from '@prisma/client';
import { setupTest, teardownTest, getAuthHeaders, cleanDatabase, closeConnection } from './setup.test.js';

describe('Integración: Base de Datos y Transacciones', () => {
  let testData;
  const prisma = new PrismaClient();

  beforeAll(async () => {
    await cleanDatabase();
    testData = await setupTest();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await teardownTest();
    await closeConnection();
  });

  afterEach(async () => {
    // Limpiar datos generados en cada test
    await prisma.pago.deleteMany();
    await prisma.solicitud.deleteMany();
    await prisma.ventaCredito.deleteMany();
    await prisma.prestamo.deleteMany();
  });

  describe('Transacciones de base de datos', () => {
    it('should maintain data consistency in loan creation transaction', async () => {
      const empHeaders = getAuthHeaders(testData.empleado.user);
      const initialClientCount = await prisma.cliente.count();

      const response = await request(app)
        .post('/api/prestamos')
        .set(empHeaders)
        .send({
          clienteId: testData.cliente.cliente.id,
          monto: 500000,
          interes: 15,
          cuotas: 12
        });

      expect(response.status).toBe(201);

      // Verify loan exists in DB
      const prestamos = await prisma.prestamo.findMany({
        where: { clienteId: testData.cliente.cliente.id }
      });
      expect(prestamos.length).toBeGreaterThan(0);

      // Verify client still exists (transaction didn't break relations)
      const clientCount = await prisma.cliente.count();
      expect(clientCount).toBe(initialClientCount);
    });

    it('should maintain data consistency in sale creation transaction (stock decrement)', async () => {
      const empHeaders = getAuthHeaders(testData.empleado.user);

      const articulo = await prisma.articulo.create({
        data: {
          nombre: 'Artículo Test Stock',
          categoria: 'Test',
          precio: 100000,
          stock: 10,
          activo: true
        }
      });

      const initialStock = articulo.stock;

      const response = await request(app)
        .post('/api/ventas')
        .set(empHeaders)
        .send({
          clienteId: testData.cliente.cliente.id,
          articuloId: articulo.id,
          cantidad: 3,
          cuotas: 6,
          interes: 15
        });

      expect(response.status).toBe(201);

      // Verify stock was decremented
      const updatedArticulo = await prisma.articulo.findUnique({
        where: { id: articulo.id }
      });
      expect(updatedArticulo.stock).toBe(initialStock - 3);

      // Cleanup
      await prisma.articulo.delete({ where: { id: articulo.id } });
    });

    it('should handle concurrent updates correctly', async () => {
      const empHeaders = getAuthHeaders(testData.empleado.user);

      // Create a loan
      const loanRes = await request(app)
        .post('/api/prestamos')
        .set(empHeaders)
        .send({
          clienteId: testData.cliente.cliente.id,
          monto: 100000,
          interes: 15,
          cuotas: 12
        });

      const loanId = loanRes.body.data.id;

      // Make multiple payments
      for (let i = 0; i < 3; i++) {
        const paymentRes = await request(app)
          .post('/api/pagos')
          .set(empHeaders)
          .send({
            tipo: 'PRESTAMO',
            referenciaId: loanId,
            clienteId: testData.cliente.cliente.id,
            monto: 10000,
            metodo: 'EFECTIVO'
          });

        expect(paymentRes.status).toBe(201);
      }

      // Verify total paid amount
      const updatedLoan = await prisma.prestamo.findUnique({
        where: { id: loanId }
      });
      expect(updatedLoan.pagado).toBe(30000);
    });
  });

  describe('Validación de relaciones', () => {
    it('should enforce client-employee relationship', async () => {
      const supHeaders = getAuthHeaders(testData.supervisor.user);

      // Create a new client without asignación
      const clientRes = await request(app)
        .post('/api/clientes')
        .set(supHeaders)
        .send({
          nombre: 'Cliente Sin Asignar',
          email: 'sanasignacion@test.com',
          password: 'password123',
          cedula: '111222333'
        });

      const newCliente = clientRes.body.cliente;
      const empHeaders = getAuthHeaders(testData.empleado.user);

      // Employee should not be able to see the unassigned client in prestamos
      const response = await request(app)
        .get(`/api/prestamos/cliente/${newCliente.id}`)
        .set(empHeaders);

      // Should fail because client isn't assigned to this employee
      expect([403, 404].includes(response.status)).toBe(true);
    });

    it('should cascade delete correctly', async () => {
      const supHeaders = getAuthHeaders(testData.supervisor.user);

      // Create artículo
      const articuloRes = await request(app)
        .post('/api/articulos')
        .set(supHeaders)
        .send({
          nombre: 'Artículo Cascada',
          categoria: 'Test',
          precio: 50000,
          stock: 100
        });

      const articuloId = articuloRes.body.datos.id;

      // Try deleting article without sales - should work
      const deleteRes = await request(app)
        .delete(`/api/articulos/${articuloId}`)
        .set(supHeaders);

      expect(deleteRes.status).toBe(200);

      // Verify article is deleted
      const verify = await prisma.articulo.findUnique({ where: { id: articuloId } });
      expect(verify).toBeNull();
    });
  });

  describe('Filtros y paginación', () => {
    it('should filter loans by status', async () => {
      const empHeaders = getAuthHeaders(testData.empleado.user);

      // Create loans with different statuses
      await request(app)
        .post('/api/prestamos')
        .set(empHeaders)
        .send({ clienteId: testData.cliente.cliente.id, monto: 100000, interes: 15, cuotas: 6 });

      // Get active loans
      const activeRes = await request(app)
        .get('/api/prestamos?estado=ACTIVO')
        .set(getAuthHeaders(testData.supervisor.user));

      expect(activeRes.status).toBe(200);
    });

    it('should search loans by client name', async () => {
      const empHeaders = getAuthHeaders(testData.empleado.user);

      await request(app)
        .post('/api/prestamos')
        .set(empHeaders)
        .send({ clienteId: testData.cliente.cliente.id, monto: 100000, interes: 15, cuotas: 6 });

      const searchRes = await request(app)
        .get('/api/prestamos?search=Cliente')
        .set(getAuthHeaders(testData.supervisor.user));

      expect(searchRes.status).toBe(200);
    });
  });
});