/**
 * Tests del Servicio de Cálculos Financieros
 * Pruebas unitarias para calculos.service.js
 */

import {
  calcularCuotaMensual,
  calcularTotalPagar,
  calcularTotalIntereses,
  calcularFechaVencimiento,
  calcularMoraDiaria,
  generarTablaAmortizacion,
  estaEnMora,
  calcularDiasRetraso,
  calcularPrecioVentaCredito,
  validarPoliticasPrestamo
} from '../src/services/calculos.service.js';

describe('Calculos Service', () => {
  describe('calcularCuotaMensual()', () => {
    it('should calculate monthly payment with interest', () => {
      // Préstamo de $1,000,000 a 12 cuotas al 15% anual
      const cuota = calcularCuotaMensual(1000000, 15, 12);
      expect(typeof cuota).toBe('number');
      expect(cuota).toBeGreaterThan(83333); // Más que cuota sin interés
      expect(cuota).toBeLessThan(100000); // Menos que pagar en un mes
    });

    it('should return simple division when rate is 0', () => {
      const cuota = calcularCuotaMensual(120000, 0, 12);
      expect(cuota).toBeCloseTo(10000, 2);
    });

    it('should handle large number of installments', () => {
      const cuota = calcularCuotaMensual(1000000, 15, 36);
      expect(typeof cuota).toBe('number');
      expect(cuota).toBeGreaterThan(0);
    });

    it('should return 0 for invalid installments', () => {
      expect(calcularCuotaMensual(1000000, 15, 0)).toBe(0);
      expect(calcularCuotaMensual(1000000, 15, -5)).toBe(0);
    });
  });

  describe('calcularTotalPagar()', () => {
    it('should calculate total payment correctly', () => {
      const total = calcularTotalPagar(100000, 12);
      expect(total).toBe(1200000);
    });

    it('should handle decimal amounts', () => {
      const total = calcularTotalPagar(100000.50, 12);
      expect(total).toBeCloseTo(1200006, 2);
    });
  });

  describe('calcularTotalIntereses()', () => {
    it('should calculate interest amount', () => {
      const intereses = calcularTotalIntereses(1200000, 1000000);
      expect(intereses).toBe(200000);
    });

    it('should return 0 when no interest', () => {
      const intereses = calcularTotalIntereses(1000000, 1000000);
      expect(intereses).toBe(0);
    });
  });

  describe('calcularFechaVencimiento()', () => {
    it('should calculate correct due date', () => {
      const inicio = new Date('2024-01-15');
      const vencimiento = calcularFechaVencimiento(inicio, 12);
      expect(vencimiento.getMonth()).toBe(0); // January 2025
      expect(vencimiento.getFullYear()).toBe(2025);
    });

    it('should handle 1 month installment', () => {
      const inicio = new Date('2024-06-01');
      const vencimiento = calcularFechaVencimiento(inicio, 1);
      expect(vencimiento.getMonth()).toBe(6); // July 2024
    });

    it('should handle large number of months', () => {
      const inicio = new Date('2024-01-01');
      const vencimiento = calcularFechaVencimiento(inicio, 36);
      expect(vencimiento.getFullYear()).toBe(2027);
    });
  });

  describe('calcularMoraDiaria()', () => {
    it('should calculate daily penalty', () => {
      const mora = calcularMoraDiaria(100000, 2, 5);
      expect(typeof mora).toBe('number');
      expect(mora).toBeGreaterThan(0);
    });

    it('should return 0 for no delay', () => {
      expect(calcularMoraDiaria(100000, 2, 0)).toBe(0);
      expect(calcularMoraDiaria(100000, 2, -5)).toBe(0);
    });

    it('should be proportional to days', () => {
      const mora5 = calcularMoraDiaria(100000, 2, 5);
      const mora10 = calcularMoraDiaria(100000, 2, 10);
      expect(mora10).toBeCloseTo(mora5 * 2, 2);
    });
  });

  describe('generarTablaAmortizacion()', () => {
    it('should generate correct number of rows', () => {
      const tabla = generarTablaAmortizacion(1000000, 15, 12, new Date('2024-01-01'));
      expect(tabla).toHaveLength(12);
    });

    it('should include all required fields', () => {
      const tabla = generarTablaAmortizacion(1000000, 15, 6, new Date('2024-01-01'));
      const row = tabla[0];
      expect(row).toHaveProperty('numeroCuota');
      expect(row).toHaveProperty('fechaVencimiento');
      expect(row).toHaveProperty('cuota');
      expect(row).toHaveProperty('capital');
      expect(row).toHaveProperty('interes');
      expect(row).toHaveProperty('saldo');
      expect(row).toHaveProperty('pagado');
    });

    it('should have decreasing balance', () => {
      const tabla = generarTablaAmortizacion(1000000, 15, 12, new Date('2024-01-01'));
      for (let i = 1; i < tabla.length; i++) {
        expect(tabla[i].saldo).toBeLessThanOrEqual(tabla[i-1].saldo);
      }
    });

    it('should end with zero or near-zero balance', () => {
      const tabla = generarTablaAmortizacion(1000000, 15, 12, new Date('2024-01-01'));
      const lastRow = tabla[tabla.length - 1];
      expect(lastRow.saldo).toBeLessThanOrEqual(1); // Allow rounding
    });

    it('should have correct row count for different installments', () => {
      expect(generarTablaAmortizacion(1000000, 0, 6, new Date()).length).toBe(6);
      expect(generarTablaAmortizacion(1000000, 0, 24, new Date()).length).toBe(24);
    });
  });

  describe('estaEnMora()', () => {
    it('should return true for overdue unpaid loan', () => {
      const ayer = new Date(Date.now() - 86400000);
      expect(estaEnMora(ayer, 0, 1000000)).toBe(true);
    });

    it('should return false for paid loan', () => {
      const ayer = new Date(Date.now() - 86400000);
      expect(estaEnMora(ayer, 1000001, 1000000)).toBe(false);
    });

    it('should return false for future due date', () => {
      const manana = new Date(Date.now() + 86400000);
      expect(estaEnMora(manana, 0, 1000000)).toBe(false);
    });

    it('should return false when exactly paid', () => {
      const ayer = new Date(Date.now() - 86400000);
      expect(estaEnMora(ayer, 1000000, 1000000)).toBe(false);
    });
  });

  describe('calcularDiasRetraso()', () => {
    it('should return 0 for future date', () => {
      const manana = new Date(Date.now() + 86400000);
      expect(calcularDiasRetraso(manana)).toBe(0);
    });

    it('should return correct days for past date', () => {
      const ayer = new Date(Date.now() - 86400000);
      expect(calcularDiasRetraso(ayer)).toBe(1);
    });

    it('should return 0 for today', () => {
      const hoy = new Date();
      expect(calcularDiasRetraso(hoy)).toBe(0);
    });
  });

  describe('calcularPrecioVentaCredito()', () => {
    it('should calculate credit sale price correctly', () => {
      const resultado = calcularPrecioVentaCredito(100000, 2, 15);
      expect(resultado).toHaveProperty('subtotal');
      expect(resultado).toHaveProperty('valorInteres');
      expect(resultado).toHaveProperty('total');
      expect(resultado).toHaveProperty('precioUnitarioConInteres');
      expect(resultado.subtotal).toBe(200000);
    });

    it('should handle zero interest', () => {
      const resultado = calcularPrecioVentaCredito(100000, 1, 0);
      expect(resultado.total).toBe(100000);
      expect(resultado.valorInteres).toBe(0);
    });

    it('should round values correctly', () => {
      const resultado = calcularPrecioVentaCredito(33333.33, 3, 10);
      expect(typeof resultado.total).toBe('number');
      expect(Number.isInteger(resultado.total * 100)).toBe(true);
    });
  });

  describe('validarPoliticasPrestamo()', () => {
    const config = {
      montoMinPrestamo: 100000,
      montoMaxPrestamo: 10000000,
      cuotasMin: 1,
      cuotasMax: 24
    };

    it('should validate valid loan', () => {
      const resultado = validarPoliticasPrestamo(500000, 12, config);
      expect(resultado.valido).toBe(true);
      expect(resultado.errores).toHaveLength(0);
    });

    it('should reject amount below minimum', () => {
      const resultado = validarPoliticasPrestamo(50000, 12, config);
      expect(resultado.valido).toBe(false);
      expect(resultado.errores[0]).toContain('mínimo');
    });

    it('should reject amount above maximum', () => {
      const resultado = validarPoliticasPrestamo(20000000, 12, config);
      expect(resultado.valido).toBe(false);
      expect(resultado.errores[0]).toContain('máximo');
    });

    it('should reject installments below minimum', () => {
      const resultado = validarPoliticasPrestamo(500000, 0, config);
      expect(resultado.valido).toBe(false);
      expect(resultado.errores.some(e => e.includes('cuotas'))).toBe(true);
    });

    it('should reject installments above maximum', () => {
      const resultado = validarPoliticasPrestamo(500000, 30, config);
      expect(resultado.valido).toBe(false);
      expect(resultado.errores.some(e => e.includes('cuotas'))).toBe(true);
    });

    it('should report multiple errors', () => {
      const resultado = validarPoliticasPrestamo(50000, 30, config);
      expect(resultado.errores.length).toBe(2);
    });
  });
});