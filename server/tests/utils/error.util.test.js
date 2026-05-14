/**
 * Tests de Utilidades de Manejo de Errores
 * Pruebas unitarias para error.util.js
 */

import {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  DatabaseError,
  AuthenticationError,
  BusinessError,
  asyncHandler,
  handlePrismaError,
  handleJWTError,
  isOperationalError,
  createValidationError,
  throwIfNotFound,
  throwIfNotAuthorized,
  throwIfForbidden
} from '../src/utils/error.util.js';

describe('Error Utilities', () => {
  describe('AppError', () => {
    it('should create AppError with default values', () => {
      const err = new AppError('Test error');
      expect(err.message).toBe('Test error');
      expect(err.statusCode).toBe(500);
      expect(err.code).toBe('INTERNAL_ERROR');
      expect(err.isOperational).toBe(true);
    });

    it('should create AppError with custom values', () => {
      const err = new AppError('Not found', 404, 'NOT_FOUND');
      expect(err.statusCode).toBe(404);
      expect(err.code).toBe('NOT_FOUND');
    });
  });

  describe('ValidationError', () => {
    it('should create with message and errors', () => {
      const err = new ValidationError('Invalid data', ['field1 is required']);
      expect(err.statusCode).toBe(400);
      expect(err.code).toBe('VALIDATION_ERROR');
      expect(err.errors).toEqual(['field1 is required']);
    });

    it('should create with empty errors', () => {
      const err = new ValidationError('Invalid');
      expect(err.errors).toEqual([]);
    });
  });

  describe('NotFoundError', () => {
    it('should create with custom resource name', () => {
      const err = new NotFoundError('Usuario');
      expect(err.message).toBe('Usuario no encontrado');
      expect(err.statusCode).toBe(404);
    });

    it('should use default resource name', () => {
      const err = new NotFoundError();
      expect(err.message).toBe('Recurso no encontrado');
    });
  });

  describe('UnauthorizedError', () => {
    it('should create with custom message', () => {
      const err = new UnauthorizedError('Token expirado');
      expect(err.message).toBe('Token expirado');
      expect(err.statusCode).toBe(401);
    });
  });

  describe('ForbiddenError', () => {
    it('should create with custom message', () => {
      const err = new ForbiddenError('Sin permisos');
      expect(err.message).toBe('Sin permisos');
      expect(err.statusCode).toBe(403);
    });
  });

  describe('ConflictError', () => {
    it('should create with custom message', () => {
      const err = new ConflictError('Email duplicado');
      expect(err.message).toBe('Email duplicado');
      expect(err.statusCode).toBe(409);
    });
  });

  describe('DatabaseError', () => {
    it('should create with custom message', () => {
      const err = new DatabaseError('Connection failed');
      expect(err.message).toBe('Connection failed');
      expect(err.statusCode).toBe(500);
    });
  });

  describe('AuthenticationError', () => {
    it('should create with custom message', () => {
      const err = new AuthenticationError('Invalid token');
      expect(err.message).toBe('Invalid token');
      expect(err.statusCode).toBe(401);
    });
  });

  describe('BusinessError', () => {
    it('should create with custom message', () => {
      const err = new BusinessError('Insufficient funds');
      expect(err.message).toBe('Insufficient funds');
      expect(err.statusCode).toBe(400);
    });
  });

  describe('asyncHandler()', () => {
    it('should pass errors to next()', async () => {
      const next = jest.fn();
      const handler = asyncHandler(async () => {
        throw new Error('Async error');
      });
      await handler({}, {}, next);
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
    });

    it('should not call next on success', async () => {
      const next = jest.fn();
      const handler = asyncHandler(async (req, res) => {
        res.json({ ok: true });
      });
      await handler({ json: jest.fn() }, { json: jest.fn() }, next);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('handlePrismaError()', () => {
    it('should handle unique constraint violation (P2002)', () => {
      const err = { code: 'P2002', meta: { target: ['email'] } };
      const result = handlePrismaError(err);
      expect(result).toBeInstanceOf(ConflictError);
      expect(result.message).toContain('email');
    });

    it('should handle record not found (P2025)', () => {
      const err = { code: 'P2025' };
      const result = handlePrismaError(err);
      expect(result).toBeInstanceOf(NotFoundError);
    });

    it('should handle foreign key violation (P2003)', () => {
      const err = { code: 'P2003' };
      const result = handlePrismaError(err);
      expect(result).toBeInstanceOf(ValidationError);
    });

    it('should handle invalid relation (P2014)', () => {
      const err = { code: 'P2014' };
      const result = handlePrismaError(err);
      expect(result).toBeInstanceOf(ValidationError);
    });

    it('should handle unknown prisma errors', () => {
      const err = { code: 'P9999' };
      const result = handlePrismaError(err);
      expect(result).toBeInstanceOf(DatabaseError);
    });
  });

  describe('handleJWTError()', () => {
    it('should handle JsonWebTokenError', () => {
      const err = { name: 'JsonWebTokenError' };
      const result = handleJWTError(err);
      expect(result).toBeInstanceOf(AuthenticationError);
    });

    it('should handle TokenExpiredError', () => {
      const err = { name: 'TokenExpiredError' };
      const result = handleJWTError(err);
      expect(result).toBeInstanceOf(AuthenticationError);
    });

    it('should handle unknown JWT errors', () => {
      const err = { name: 'UnknownError' };
      const result = handleJWTError(err);
      expect(result).toBeInstanceOf(AuthenticationError);
    });
  });

  describe('isOperationalError()', () => {
    it('should return true for operational errors', () => {
      const err = new AppError('test', 500, 'TEST');
      expect(isOperationalError(err)).toBe(true);
    });

    it('should return false for non-operational errors', () => {
      const err = new Error('test');
      expect(isOperationalError(err)).toBe(false);
    });
  });

  describe('createValidationError()', () => {
    it('should create ValidationError from array', () => {
      const err = createValidationError([{ message: 'Required' }, 'Invalid']);
      expect(err).toBeInstanceOf(ValidationError);
      expect(err.errors).toEqual(['Required', 'Invalid']);
    });
  });

  describe('throwIfNotFound()', () => {
    it('should throw NotFoundError for null values', () => {
      expect(() => throwIfNotFound(null, 'User')).toThrow(NotFoundError);
    });

    it('should return the resource if found', () => {
      const obj = { id: 1 };
      expect(throwIfNotFound(obj, 'User')).toBe(obj);
    });
  });

  describe('throwIfNotAuthorized()', () => {
    it('should throw UnauthorizedError when false', () => {
      expect(() => throwIfNotAuthorized(false, 'Denied')).toThrow(UnauthorizedError);
    });

    it('should not throw when true', () => {
      expect(() => throwIfNotAuthorized(true)).not.toThrow();
    });
  });

  describe('throwIfForbidden()', () => {
    it('should throw ForbiddenError when false', () => {
      expect(() => throwIfForbidden(false, 'Forbidden')).toThrow(ForbiddenError);
    });

    it('should not throw when true', () => {
      expect(() => throwIfForbidden(true)).not.toThrow();
    });
  });
});