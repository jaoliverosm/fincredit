/**
 * Utilidades de Logging
 * Sistema de logs estructurado para la aplicación
 */

/**
 * Niveles de log
 */
const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

/**
 * Colores para consola
 */
const COLORS = {
  ERROR: '\x1b[31m', // Rojo
  WARN: '\x1b[33m',  // Amarillo
  INFO: '\x1b[36m',  // Cyan
  DEBUG: '\x1b[37m', // Blanco
  RESET: '\x1b[0m'   // Reset
};

/**
 * Formatear timestamp
 */
const getTimestamp = () => {
  return new Date().toISOString();
};

/**
 * Formatear mensaje de log
 */
const formatLogMessage = (level, message, meta = {}) => {
  const timestamp = getTimestamp();
  const color = COLORS[level];
  const reset = COLORS.RESET;
  
  let logMessage = `${color}[${timestamp}] ${level}: ${message}${reset}`;
  
  // Agregar metadata si existe
  if (Object.keys(meta).length > 0) {
    logMessage += ` ${JSON.stringify(meta)}`;
  }
  
  return logMessage;
};

/**
 * Logger principal
 */
const logger = {
  /**
   * Log de error
   */
  error: (message, meta = {}) => {
    console.error(formatLogMessage(LOG_LEVELS.ERROR, message, meta));
  },

  /**
   * Log de advertencia
   */
  warn: (message, meta = {}) => {
    console.warn(formatLogMessage(LOG_LEVELS.WARN, message, meta));
  },

  /**
   * Log de información
   */
  info: (message, meta = {}) => {
    console.log(formatLogMessage(LOG_LEVELS.INFO, message, meta));
  },

  /**
   * Log de debug
   */
  debug: (message, meta = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(formatLogMessage(LOG_LEVELS.DEBUG, message, meta));
    }
  }
};

/**
 * Middleware para logging de requests HTTP
 */
const httpLogger = (req, res, next) => {
  const start = Date.now();
  const timestamp = getTimestamp();
  
  // Log de request
  logger.info('HTTP Request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp
  });
  
  // Sobrescribir res.end para log de response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - start;
    
    logger.info('HTTP Response', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      timestamp: getTimestamp()
    });
    
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

/**
 * Logger para errores de la aplicación
 */
const errorLogger = (err, req, res, next) => {
  logger.error('Application Error', {
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    body: req.body,
    params: req.params,
    query: req.query
  });
  
  next(err);
};

/**
 * Logger para operaciones de base de datos
 */
const dbLogger = {
  query: (query, params, duration) => {
    logger.debug('DB Query', {
      query: query.substring(0, 100) + '...', // Truncar query largo
      params: params ? JSON.stringify(params).substring(0, 100) : null,
      duration: `${duration}ms`
    });
  },
  
  error: (error, query, params) => {
    logger.error('DB Error', {
      error: error.message,
      query: query.substring(0, 100) + '...',
      params: params ? JSON.stringify(params).substring(0, 100) : null
    });
  }
};

/**
 * Logger para operaciones de autenticación
 */
const authLogger = {
  login: (userId, email, ip) => {
    logger.info('User Login', {
      userId,
      email,
      ip,
      timestamp: getTimestamp()
    });
  },
  
  logout: (userId, email) => {
    logger.info('User Logout', {
      userId,
      email,
      timestamp: getTimestamp()
    });
  },
  
  failed: (email, ip, reason) => {
    logger.warn('Login Failed', {
      email,
      ip,
      reason,
      timestamp: getTimestamp()
    });
  },
  
  unauthorized: (req, reason) => {
    logger.warn('Unauthorized Access', {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      reason,
      timestamp: getTimestamp()
    });
  }
};

/**
 * Logger para operaciones financieras
 */
const financeLogger = {
  prestamo: (action, prestamoId, clienteId, monto) => {
    logger.info(`Loan ${action}`, {
      prestamoId,
      clienteId,
      monto,
      timestamp: getTimestamp()
    });
  },
  
  pago: (action, pagoId, tipo, monto) => {
    logger.info(`Payment ${action}`, {
      pagoId,
      tipo,
      monto,
      timestamp: getTimestamp()
    });
  },
  
  venta: (action, ventaId, clienteId, articuloId, monto) => {
    logger.info(`Sale ${action}`, {
      ventaId,
      clienteId,
      articuloId,
      monto,
      timestamp: getTimestamp()
    });
  }
};

module.exports = {
  logger,
  httpLogger,
  errorLogger,
  dbLogger,
  authLogger,
  financeLogger,
  LOG_LEVELS
};
