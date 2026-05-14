/**
 * Tests del Servicio de Mora
 * Pruebas unitarias para mora.service.js
 */

import { ejecutarCalculoMora, calcularMoraPrestamos, calcularMoraVentas, obtenerReporteMora } from '../src/services/mora.service.js';

// Mock PrismaClient
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    prestamo: {
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      aggregate: jest.fn(),
      deleteMany: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
      upsert: jest.fn()
    },
    ventaCredito: {
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      aggregate: jest.fn()
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $transaction: jest.fn((cb) => cb({
      prestamo: mockPrisma.prestamo,
      ventaCredito: mockPrisma.ventaCredito
    }))
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

import { PrismaClient } from '@prisma/client';

describe('Mora Service', () => {
  let prisma;

  beforeEach(() => {
    prisma = new PrismaClient();
    jest.clearAllMocks();
  });

  describe('calcularMoraPrestamos()', () => {
    it('should process overdue loans', async () => {
      const prestamosVencidos = [
        { id: 1, estado: 'ACTIVO', fechaVencimiento: new Date('2024-01-01'), cliente: { id: 1, usuario: { nombre: 'Test' } }, empleado: { id: 1, usuario: { nombre: 'Emp' } } },
        { id: 2, estado: 'ACTIVO', fechaVencimiento: new Date('2024-02-01'), cliente: { id: 2, usuario: { nombre: 'Test2' } }, empleado: { id: 1, usuario: { nombre: 'Emp' } } }
      ];

      prisma.prestamo.findMany.mockResolvedValue(prestamosVencidos);
      prisma.prestamo.update.mockResolvedValue({});

      const result = await calcularMoraPrestamos();

      expect(prisma.prestamo.findMany).toHaveBeenCalled();
      expect(prisma.prestamo.update).toHaveBeenCalledTimes(2);
      expect(result).toBe(2);
    });

    it('should skip already overdue loans', async () => {
      const prestamos = [
        { id: 1, estado: 'MORA', fechaVencimiento: new Date('2024-01-01'), cliente: { id: 1 } },
        { id: 2, estado: 'ACTIVO', fechaVencimiento: new Date('2024-02-01'), cliente: { id: 2 } }
      ];

      prisma.prestamo.findMany.mockResolvedValue(prestamos);
      prisma.prestamo.update.mockResolvedValue({});

      const result = await calcularMoraPrestamos();

      expect(prisma.prestamo.update).toHaveBeenCalledTimes(1);
      expect(result).toBe(1);
    });

    it('should skip non-overdue loans', async () => {
      const futureDate = new Date(Date.now() + 86400000 * 30);
      const prestamos = [
        { id: 1, estado: 'ACTIVO', fechaVencimiento: futureDate, cliente: { id: 1 } }
      ];

      prisma.prestamo.findMany.mockResolvedValue(prestamos);

      const result = await calcularMoraPrestamos();

      expect(prisma.prestamo.update).not.toHaveBeenCalled();
      expect(result).toBe(0);
    });
  });

  describe('calcularMoraVentas()', () => {
    it('should process overdue sales', async () => {
      const ventasVencidas = [
        { id: 1, estado: 'ACTIVO', fechaVencimiento: new Date('2024-01-01'), cliente: { id: 1, usuario: { nombre: 'Test' } }, empleado: { id: 1, usuario: { nombre: 'Emp' } }, articulo: { nombre: 'Art1' } },
        { id: 2, estado: 'ACTIVO', fechaVencimiento: new Date('2024-02-01'), cliente: { id: 2, usuario: { nombre: 'Test2' } }, empleado: { id: 1, usuario: { nombre: 'Emp' } }, articulo: { nombre: 'Art2' } }
      ];

      prisma.ventaCredito.findMany.mockResolvedValue(ventasVencidas);
      prisma.ventaCredito.update.mockResolvedValue({});

      const result = await calcularMoraVentas();

      expect(prisma.ventaCredito.findMany).toHaveBeenCalled();
      expect(prisma.ventaCredito.update).toHaveBeenCalledTimes(2);
      expect(result).toBe(2);
    });

    it('should return 0 when no overdue sales', async () => {
      const futureDate = new Date(Date.now() + 86400000 * 30);
      prisma.ventaCredito.findMany.mockResolvedValue([]);

      const result = await calcularMoraVentas();

      expect(result).toBe(0);
    });
  });

  describe('ejecutarCalculoMora()', () => {
    it('should execute mora calculation for both loans and sales', async () => {
      prisma.prestamo.findMany.mockResolvedValue([]);
      prisma.ventaCredito.findMany.mockResolvedValue([]);

      const result = await ejecutarCalculoMora();

      expect(result).toHaveProperty('fechaEjecucion');
      expect(result).toHaveProperty('duracion');
      expect(result).toHaveProperty('prestamosActualizados');
      expect(result).toHaveProperty('ventasActualizadas');
      expect(result).toHaveProperty('totalActualizados');
    });

    it('should count updates correctly', async () => {
      const prestamosVencidos = [
        { id: 1, estado: 'ACTIVO', fechaVencimiento: new Date('2024-01-01'), cliente: {}, empleado: {} }
      ];
      const ventasVencidas = [
        { id: 1, estado: 'ACTIVO', fechaVencimiento: new Date('2024-01-01'), cliente: {}, empleado: {}, articulo: {} }
      ];

      prisma.prestamo.findMany.mockResolvedValue(prestamosVencidos);
      prisma.ventaCredito.findMany.mockResolvedValue(ventasVencidas);
      prisma.prestamo.update.mockResolvedValue({});
      prisma.ventaCredito.update.mockResolvedValue({});

      const result = await ejecutarCalculoMora();

      expect(result.prestamosActualizados).toBe(1);
      expect(result.ventasActualizadas).toBe(1);
      expect(result.totalActualizados).toBe(2);
    });
  });

  describe('obtenerReporteMora()', () => {
    it('should generate mora report', async () => {
      prisma.prestamo.count
        .mockResolvedValueOnce(5)  // prestamosMora
        .mockResolvedValueOnce(3); // totalPrestamos
      prisma.ventaCredito.count
        .mockResolvedValueOnce(2)  // ventasMora
        .mockResolvedValueOnce(8); // totalVentas
      prisma.prestamo.aggregate.mockResolvedValue({ _sum: { monto: 5000000, pagado: 2000000 } });
      prisma.ventaCredito.aggregate.mockResolvedValue({ _sum: { precioTotal: 8000000, pagado: 4000000 } });

      const reporte = await obtenerReporteMora();

      expect(reporte).toHaveProperty('prestamos');
      expect(reporte).toHaveProperty('ventas');
      expect(reporte).toHaveProperty('resumen');
      expect(reporte.prestamos.enMora).toBe(5);
      expect(reporte.ventas.enMora).toBe(2);
      expect(reporte.resumen.totalOperaciones).toBe(13);
    });
  });
});