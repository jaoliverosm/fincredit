/**
 * Tests del Controlador de Autenticación
 * Pruebas unitarias para auth.controller.js
 */

// Mock dependencies
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn()
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn()
}));

// Mock db module
const mockFindUnique = jest.fn();
jest.mock('../src/db.js', () => ({
  prisma: {
    usuario: {
      findUnique: mockFindUnique
    }
  }
}));

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { login, getMe } = require('../src/controllers/auth.controller.js');

describe('Auth Controller', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    
    req = {
      body: {},
      usuarioId: null
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();

    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES_IN = '8h';
  });

  describe('login()', () => {
    it('should login successfully with valid credentials', async () => {
      req.body = { email: 'test@test.com', password: 'password123' };

      mockFindUnique.mockResolvedValue({
        id: 1,
        email: 'test@test.com',
        nombre: 'Test User',
        rol: 'EMPLEADO',
        activo: true,
        empleado: { id: 1 },
        cliente: null,
        password: '$2a$10$hashedpassword'
      });
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('test-token');

      await login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          token: 'test-token',
          usuario: expect.objectContaining({ email: 'test@test.com' })
        })
      );
    });

    it('should return 400 when email is missing', async () => {
      req.body = { password: 'password123' };
      await login(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Email y contraseña son requeridos' })
      );
    });

    it('should return 400 when password is missing', async () => {
      req.body = { email: 'test@test.com' };
      await login(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 401 for inactive user', async () => {
      req.body = { email: 'test@test.com', password: 'password123' };
      mockFindUnique.mockResolvedValue({ activo: false });

      await login(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should return 401 for user not found', async () => {
      req.body = { email: 'test@test.com', password: 'password123' };
      mockFindUnique.mockResolvedValue(null);

      await login(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should return 401 for incorrect password', async () => {
      req.body = { email: 'test@test.com', password: 'wrongpass' };
      mockFindUnique.mockResolvedValue({
        id: 1,
        email: 'test@test.com',
        activo: true,
        password: '$2a$10$hashedpassword'
      });
      bcrypt.compare.mockResolvedValue(false);

      await login(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should handle database errors', async () => {
      req.body = { email: 'test@test.com', password: 'pass' };
      mockFindUnique.mockRejectedValue(new Error('DB Error'));

      await login(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('getMe()', () => {
    it('should return current user profile', async () => {
      req.usuarioId = 1;
      mockFindUnique.mockResolvedValue({
        id: 1,
        nombre: 'Test User',
        email: 'test@test.com',
        rol: 'SUPERVISOR',
        empleado: { id: 1, telefono: '3001234567' },
        cliente: null
      });

      await getMe(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          usuario: expect.objectContaining({ nombre: 'Test User' })
        })
      );
    });

    it('should handle user not found', async () => {
      req.usuarioId = 999;
      mockFindUnique.mockResolvedValue(null);

      await getMe(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ usuario: null });
    });

    it('should handle database errors', async () => {
      req.usuarioId = 1;
      mockFindUnique.mockRejectedValue(new Error('DB Error'));

      await getMe(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });
});