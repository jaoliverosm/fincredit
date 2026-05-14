/**
 * Tests de Utilidades de Validación
 * Pruebas unitarias para validation.util.js
 */

import {
  isValidEmail,
  isValidCedula,
  isValidPhone,
  isValidAmount,
  isValidInterestRate,
  isValidInstallments,
  isValidStock,
  isValidRole,
  isValidStatus,
  isValidPaymentMethod,
  isValidPaymentType,
  isValidRequestType,
  isValidRequestStatus,
  isValidPassword,
  sanitizeString,
  isValidPagination,
  isValidDate,
  isNotFutureDate,
  isFutureDate
} from '../src/utils/validation.util.js';

describe('Validation Utilities', () => {
  describe('isValidEmail()', () => {
    it('should validate correct emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co')).toBe(true);
      expect(isValidEmail('test123@email.com')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('missing@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('test@.com')).toBe(false);
    });
  });

  describe('isValidCedula()', () => {
    it('should validate correct cedulas', () => {
      expect(isValidCedula('123456789')).toBe(true);
      expect(isValidCedula('12345678')).toBe(true);
      expect(isValidCedula('1234567890')).toBe(true);
    });

    it('should reject invalid cedulas', () => {
      expect(isValidCedula('123')).toBe(false);
      expect(isValidCedula('12345678901')).toBe(false);
      expect(isValidCedula('')).toBe(false);
      expect(isValidCedula('abc')).toBe(false);
    });
  });

  describe('isValidPhone()', () => {
    it('should validate correct phones', () => {
      expect(isValidPhone('3001234567')).toBe(true);
      expect(isValidPhone('3109876543')).toBe(true);
    });

    it('should reject invalid phones', () => {
      expect(isValidPhone('1234567890')).toBe(false);
      expect(isValidPhone('300123456')).toBe(false);
      expect(isValidPhone('4001234567')).toBe(false);
      expect(isValidPhone('')).toBe(false);
    });
  });

  describe('isValidAmount()', () => {
    it('should validate positive amounts', () => {
      expect(isValidAmount(1000)).toBe(true);
      expect(isValidAmount(0.01)).toBe(true);
      expect(isValidAmount(9999999)).toBe(true);
    });

    it('should reject invalid amounts', () => {
      expect(isValidAmount(0)).toBe(false);
      expect(isValidAmount(-100)).toBe(false);
      expect(isValidAmount('100')).toBe(false);
      expect(isValidAmount(null)).toBe(false);
      expect(isValidAmount(Infinity)).toBe(false);
      expect(isValidAmount(NaN)).toBe(false);
    });
  });

  describe('isValidInterestRate()', () => {
    it('should validate interest rates 0-100', () => {
      expect(isValidInterestRate(0)).toBe(true);
      expect(isValidInterestRate(15)).toBe(true);
      expect(isValidInterestRate(100)).toBe(true);
      expect(isValidInterestRate(2.5)).toBe(true);
    });

    it('should reject invalid rates', () => {
      expect(isValidInterestRate(-1)).toBe(false);
      expect(isValidInterestRate(101)).toBe(false);
      expect(isValidInterestRate('15')).toBe(false);
    });
  });

  describe('isValidInstallments()', () => {
    it('should validate installments 1-360', () => {
      expect(isValidInstallments(1)).toBe(true);
      expect(isValidInstallments(12)).toBe(true);
      expect(isValidInstallments(360)).toBe(true);
    });

    it('should reject invalid installments', () => {
      expect(isValidInstallments(0)).toBe(false);
      expect(isValidInstallments(361)).toBe(false);
      expect(isValidInstallments(-5)).toBe(false);
      expect(isValidInstallments(12.5)).toBe(false);
    });
  });

  describe('isValidStock()', () => {
    it('should validate stock >= 0', () => {
      expect(isValidStock(0)).toBe(true);
      expect(isValidStock(100)).toBe(true);
    });

    it('should reject invalid stock', () => {
      expect(isValidStock(-1)).toBe(false);
      expect(isValidStock(1.5)).toBe(false);
    });
  });

  describe('isValidRole()', () => {
    it('should validate known roles', () => {
      expect(isValidRole('SUPERVISOR')).toBe(true);
      expect(isValidRole('EMPLEADO')).toBe(true);
      expect(isValidRole('CLIENTE')).toBe(true);
    });

    it('should reject unknown roles', () => {
      expect(isValidRole('ADMIN')).toBe(false);
      expect(isValidRole('')).toBe(false);
    });
  });

  describe('isValidStatus()', () => {
    it('should validate known statuses', () => {
      expect(isValidStatus('ACTIVO')).toBe(true);
      expect(isValidStatus('MORA')).toBe(true);
      expect(isValidStatus('PAGADO')).toBe(true);
      expect(isValidStatus('INACTIVO')).toBe(true);
    });

    it('should reject unknown statuses', () => {
      expect(isValidStatus('DESCONOCIDO')).toBe(false);
      expect(isValidStatus('')).toBe(false);
    });
  });
});