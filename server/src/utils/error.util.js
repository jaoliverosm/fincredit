/**
 * Utilidades de Manejo de Errores
 * Clases y funciones personalizadas para errores
 */

/**
 * Clase base para errores de la aplicación
 */
class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error de validación
 */
class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, 400, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}

/**
 * Error de no encontrado
 */
class NotFoundError extends AppError {
  constructor(resource = 'Recurso') {
    super(`${resource} no encontrado`, 404, 'NOT_FOUND');
  }
}

/**
 * Error de no autorizado
 */
class UnauthorizedError extends AppError {
  constructor(message = 'No autorizado') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

/**
 * Error de prohibido
 */
class ForbiddenError extends AppError {
  constructor(message = 'Acceso prohibido') {
    super(message, 403, 'FORBIDDEN');
  }
}

/**
 * Error de conflicto
 */
class ConflictError extends AppError {
  constructor(message = 'Conflicto de datos') {
    super(message, 409, 'CONFLICT');
  }
}

/**
 * Error de base de datos
 */
class DatabaseError extends AppError {
  constructor(message = 'Error en la base de datos') {
    super(message, 500, 'DATABASE_ERROR');
  }
}

/**
 * Error de autenticación
 */
class AuthenticationError extends AppError {
  constructor(message = 'Error de autenticación') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

/**
 * Error de negocio
 */
class BusinessError extends AppError {
  constructor(message = 'Error de negocio') {
    super(message, 400, 'BUSINESS_ERROR');
  }
}

/**
 * Manejador de errores asíncronos
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Manejador de errores de Prisma
 */
const handlePrismaError = (error) => {
  if (error.code === 'P2002') {
    // Unique constraint violation
    const field = error.meta?.target?.[0] || 'campo';
    return new ConflictError(`El ${field} ya existe`);
  }
  
  if (error.code === 'P2025') {
    // Record not found
    return new NotFoundError('Registro no encontrado');
  }
  
  if (error.code === 'P2003') {
    // Foreign key constraint violation
    return new ValidationError('Relación de datos inválida');
  }
  
  if (error.code === 'P2014') {
    // Invalid relation
    return new ValidationError('Relación inválida entre registros');
  }
  
  // Otros errores de Prisma
  return new DatabaseError('Error en la operación de base de datos');
};

/**
 * Manejador de errores de JWT
 */
const handleJWTError = (error) => {
  if (error.name === 'JsonWebTokenError') {
    return new AuthenticationError('Token inválido');
  }
  
  if (error.name === 'TokenExpiredError') {
    return new AuthenticationError('Token expirado');
  }
  
  return new AuthenticationError('Error de autenticación');
};

/**
 * Manejador de errores de Joi
 */
const handleJoiError = (error) => {
  const errors = error.details.map(detail => ({
    field: detail.path.join('.'),
    message: detail.message,
    value: detail.context?.value
  }));
  
  return new ValidationError('Error de validación', errors);
};

/**
 * Manejador principal de errores
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  
  // Log del error
  console.error('Error:', {
    message: error.message,
    stack: error.stack,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  // Manejar errores específicos
  if (err.name === 'PrismaClientKnownRequestError') {
    error = handlePrismaError(err);
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    error = handleJWTError(err);
  } else if (err.isJoi) {
    error = handleJoiError(err);
  } else if (!error.isOperational) {
    error = new AppError('Error interno del servidor', 500, 'INTERNAL_ERROR');
  }
  
  // Respuesta de error
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message,
    code: error.code || 'INTERNAL_ERROR',
    ...(error.errors && { errors: error.errors }),
    timestamp: new Date().toISOString()
  });
};

/**
 * Validar si un error es operativo
 */
const isOperationalError = (error) => {
  return error.isOperational === true;
};

/**
 * Crear error de validación a partir de un array de errores
 */
const createValidationError = (errors) => {
  const errorMessages = errors.map(err => err.message || err);
  return new ValidationError('Error de validación', errorMessages);
};

/**
 * Validar y lanzar error si no se encuentra
 */
const throwIfNotFound = (resource, resourceName = 'Recurso') => {
  if (!resource) {
    throw new NotFoundError(resourceName);
  }
  return resource;
};

/**
 * Validar y lanzar error si no hay permisos
 */
const throwIfNotAuthorized = (hasPermission, message = 'No autorizado') => {
  if (!hasPermission) {
    throw new UnauthorizedError(message);
  }
};

/**
 * Validar y lanzar error si está prohibido
 */
const throwIfForbidden = (hasPermission, message = 'Acceso prohibido') => {
  if (!hasPermission) {
    throw new ForbiddenError(message);
  }
};

module.exports = {
  // Clases de error
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  DatabaseError,
  AuthenticationError,
  BusinessError,
  
  // Utilidades
  asyncHandler,
  errorHandler,
  handlePrismaError,
  handleJWTError,
  handleJoiError,
  isOperationalError,
  createValidationError,
  throwIfNotFound,
  throwIfNotAuthorized,
  throwIfForbidden
};
