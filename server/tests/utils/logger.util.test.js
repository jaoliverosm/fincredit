/**
 * Tests de Utilidades de Logging
 * Pruebas unitarias para logger.util.js
 */

import { logger, httpLogger, errorLogger, dbLogger, authLogger, financeLogger, LOG_LEVELS } from '../src/utils/logger.util.js';

describe('Logger Utilities', () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'debug').mockImplementation(() => {});
    jest.spyOn(Date, 'now').mockImplementation(() => new Date('2024-01-15T10:00:00Z').getTime());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('LOG_LEVELS', () => {
    it('should have all required log levels', () => {
      expect(LOG_LEVELS.ERROR).toBe('ERROR');
      expect(LOG_LEVELS.WARN).toBe('WARN');
      expect(LOG_LEVELS.INFO).toBe('INFO');
      expect(LOG_LEVELS.DEBUG).toBe('DEBUG');
    });
  });

  describe('logger', () => {
    describe('error()', () => {
      it('should log error messages', () => {
        logger.error('Test error', { code: 500 });
        expect(console.error).toHaveBeenCalledWith(
          expect.stringContaining('[2024-01-15T10:00:00.000Z] ERROR: Test error')
        );
      });
    });

    describe('warn()', () => {
      it('should log warning messages', () => {
        logger.warn('Test warning');
        expect(console.warn).toHaveBeenCalledWith(
          expect.stringContaining('[2024-01-15T10:00:00.000Z] WARN: Test warning')
        );
      });
    });

    describe('info()', () => {
      it('should log info messages', () => {
        logger.info('Test info', { user: 'test' });
        expect(console.log).toHaveBeenCalledWith(
          expect.stringContaining('[2024-01-15T10:00:00.000Z] INFO: Test info')
        );
      });
    });

    describe('debug()', () => {
      it('should log debug messages in development mode', () => {
        process.env.NODE_ENV = 'development';
        logger.debug('Debug message', { query: 'SELECT *' });
        expect(console.debug).toHaveBeenCalledWith(
          expect.stringContaining('[2024-01-15T10:00:00.000Z] DEBUG: Debug message')
        );
      });

      it('should NOT log debug messages in production mode', () => {
        process.env.NODE_ENV = 'production';
        logger.debug('Debug message');
        expect(console.debug).not.toHaveBeenCalled();
      });

      it('should NOT log debug if not in development', () => {
        delete process.env.NODE_ENV;
        logger.debug('Debug message');
        expect(console.debug).not.toHaveBeenCalled();
      });
    });
  });

  describe('httpLogger()', () => {
    describe('on request', () => {
      it('should log HTTP request info', () => {
        const req = {
          method: 'GET',
          url: '/api/test',
          ip: '127.0.0.1',
          get: () => 'test-agent'
        };
        const res = { statusCode: 200 };
        const originalEnd = res.end;
        res.end = jest.fn(function(...args) {
          return originalEnd.apply(this, args);
        });

        httpLogger(req, res, () => {});

        expect(console.log).toHaveBeenCalledWith(
          expect.stringContaining('HTTP Request')
        );
        expect(console.log).toHaveBeenCalledWith(
          expect.stringContaining('method')
        );
        expect(console.log).toHaveBeenCalledWith(
          expect.stringContaining('GET')
        );
      });

      it('should include request metadata', () => {
        const req = {
          method: 'POST',
          url: '/api/users',
          ip: '192.168.1.1',
          get: () => 'Mozilla/5.0'
        };
        const res = { statusCode: 200, end: jest.fn() };

        httpLogger(req, res, () => {});

        expect(console.log).toHaveBeenCalledWith(
          expect.stringContaining('POST')
        );
        expect(console.log).toHaveBeenCalledWith(
          expect.stringContaining('/api/users')
        );
      });
    });

    describe('on response', () => {
      it('should log HTTP response with duration', () => {
        jest.spyOn(Date, 'now').mockReturnValue(new Date('2024-01-15T10:00:00.050Z').getTime());
        const req = { method: 'GET', url: '/api/test', ip: '127.0.0.1', get: () => 'test' };
        const res = { statusCode: 200 };
        const originalEnd = res.end;
        res.end = jest.fn(function(...args) {
          expect(res.statusCode).toBe(200);
          return originalEnd ? originalEnd.apply(this, args) : undefined;
        });

        httpLogger(req, res, () => {});

        expect(console.log).toHaveBeenCalledWith(
          expect.stringContaining('HTTP Response')
        );
        expect(console.log).toHaveBeenCalledWith(
          expect.stringContaining('duration')
        );
      });
    });
  });

  describe('errorLogger()', () => {
    it('should log error details', () => {
      const err = new Error('Test error');
      const req = { method: 'GET', url: '/test', ip: '127.0.0.1', get: () => 'test', body: {}, params: {}, query: {} };

      errorLogger(err, req, jest.fn());

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Application Error')
      );
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Test error')
      );
    });
  });

  describe('dbLogger', () => {
    describe('query()', () => {
      it('should log DB queries in debug mode', () => {
        process.env.NODE_ENV = 'development';
        dbLogger.query('SELECT * FROM users', { id: 1 }, 15);
        expect(console.debug).toHaveBeenCalledWith(
          expect.stringContaining('DB Query')
        );
      });

      it('should not log in production', () => {
        process.env.NODE_ENV = 'production';
        dbLogger.query('SELECT * FROM users', { id: 1 }, 15);
        expect(console.debug).not.toHaveBeenCalled();
      });
    });

    describe('error()', () => {
      it('should log DB errors', () => {
        const err = new Error('Connection failed');
        dbLogger.error(err, 'SELECT * FROM users', { id: 1 });
        expect(console.error).toHaveBeenCalledWith(
          expect.stringContaining('DB Error')
        );
      });
    });
  });

  describe('authLogger', () => {
    it('should log successful login', () => {
      authLogger.login(1, 'test@test.com', '127.0.0.1');
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('User Login')
      );
    });

    it('should log logout', () => {
      authLogger.logout(1, 'test@test.com');
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('User Logout')
      );
    });

    it('should log failed login attempts', () => {
      authLogger.failed('test@test.com', '127.0.0.1', 'Invalid password');
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Login Failed')
      );
    });

    it('should log unauthorized access', () => {
      const req = { method: 'GET', url: '/admin', ip: '127.0.0.1', get: () => 'test' };
      authLogger.unauthorized(req, 'Missing token');
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Unauthorized Access')
      );
    });
  });

  describe('financeLogger', () => {
    it('should log loan actions', () => {
      financeLogger.prestamo('created', 1, 10, 1000000);
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Loan created')
      );
    });

    it('should log payment actions', () => {
      financeLogger.pago('created', 1, 'PRESTAMO', 50000);
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Payment created')
      );
    });

    it('should log sale actions', () => {
      financeLogger.venta('created', 1, 10, 1, 500000);
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Sale created')
      );
    });
  });
});