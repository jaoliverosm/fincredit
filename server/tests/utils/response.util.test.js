/**
 * Tests de Utilidades de Respuesta HTTP
 * Pruebas unitarias para response.util.js
 */

import { success, error, validation, notFound, unauthorized, forbidden, paginated } from '../src/utils/response.util.js';

describe('Response Utilities', () => {
  let mockRes;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  describe('success()', () => {
    it('should return success response with default status 200', () => {
      success(mockRes, { id: 1 }, 'Operación exitosa');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Operación exitosa',
          data: { id: 1 }
        })
      );
    });

    it('should return success response with custom status', () => {
      success(mockRes, { id: 1 }, 'Creado', 201);
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it('should include timestamp', () => {
      success(mockRes, null, 'Test');
      const call = mockRes.json.mock.calls[0][0];
      expect(call).toHaveProperty('timestamp');
    });
  });

  describe('error()', () => {
    it('should return error response with default status 500', () => {
      error(mockRes, 'Error interno');
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Error interno'
        })
      );
    });

    it('should return error response with custom status and details', () => {
      error(mockRes, 'No encontrado', 404, 'Detalle del error');
      expect(mockRes.status).toHaveBeenCalledWith(404);
      const result = mockRes.json.mock.calls[0][0];
      expect(result.success).toBe(false);
      expect(result.error).toBe('Detalle del error');
    });

    it('should include timestamp', () => {
      error(mockRes, 'Test error');
      const call = mockRes.json.mock.calls[0][0];
      expect(call).toHaveProperty('timestamp');
    });
  });

  describe('validation()', () => {
    it('should return 400 status with validation errors', () => {
      validation(mockRes, ['Campo requerido'], 'Error de validación');
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Error de validación',
          errors: ['Campo requerido']
        })
      );
    });

    it('should work with empty errors array', () => {
      validation(mockRes, [], 'Error genérico');
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: []
        })
      );
    });

    it('should include timestamp', () => {
      validation(mockRes, [], 'Test');
      const call = mockRes.json.mock.calls[0][0];
      expect(call).toHaveProperty('timestamp');
    });
  });

  describe('notFound()', () => {
    it('should return 404 status with default message', () => {
      notFound(mockRes, 'Recurso no existe');
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Recurso no existe'
        })
      );
    });

    it('should return 404 with default message when none provided', () => {
      notFound(mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      const result = mockRes.json.mock.calls[0][0];
      expect(result.message).toBe('Recurso no encontrado');
    });
  });

  describe('unauthorized()', () => {
    it('should return 401 status', () => {
      unauthorized(mockRes, 'Token inválido');
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Token inválido'
        })
      );
    });
  });

  describe('forbidden()', () => {
    it('should return 403 status', () => {
      forbidden(mockRes, 'Acceso denegado');
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Acceso denegado'
        })
      );
    });
  });

  describe('paginated()', () => {
    it('should return paginated response correctly', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const pagination = { page: 1, limit: 10, total: 2 };
      paginated(mockRes, data, pagination, 'Datos obtenidos');

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Datos obtenidos',
          data,
          pagination: expect.objectContaining({
            page: 1,
            limit: 10,
            total: 2,
            totalPages: 1,
            hasNext: false,
            hasPrev: false
          })
        })
      );
    });

    it('should calculate hasNext correctly', () => {
      const pagination = { page: 1, limit: 10, total: 15 };
      paginated(mockRes, [], pagination);
      const result = mockRes.json.mock.calls[0][0];
      expect(result.pagination.hasNext).toBe(true);
    });

    it('should calculate hasPrev correctly', () => {
      const pagination = { page: 2, limit: 10, total: 15 };
      paginated(mockRes, [], pagination);
      const result = mockRes.json.mock.calls[0][0];
      expect(result.pagination.hasPrev).toBe(true);
    });
  });
});