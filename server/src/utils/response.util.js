/**
 * Utilidades de Respuesta HTTP
 * Estandariza las respuestas de la API
 */

/**
 * Respuesta exitosa estándar
 */
const success = (res, data, message = 'Operación exitosa', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

/**
 * Respuesta de error estándar
 */
const error = (res, message = 'Error interno del servidor', statusCode = 500, errorDetails = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: errorDetails,
    timestamp: new Date().toISOString()
  });
};

/**
 * Respuesta de validación
 */
const validation = (res, errors, message = 'Error de validación') => {
  return res.status(400).json({
    success: false,
    message,
    errors,
    timestamp: new Date().toISOString()
  });
};

/**
 * Respuesta de no encontrado
 */
const notFound = (res, message = 'Recurso no encontrado') => {
  return res.status(404).json({
    success: false,
    message,
    timestamp: new Date().toISOString()
  });
};

/**
 * Respuesta de no autorizado
 */
const unauthorized = (res, message = 'No autorizado') => {
  return res.status(401).json({
    success: false,
    message,
    timestamp: new Date().toISOString()
  });
};

/**
 * Respuesta de prohibido
 */
const forbidden = (res, message = 'Acceso prohibido') => {
  return res.status(403).json({
    success: false,
    message,
    timestamp: new Date().toISOString()
  });
};

/**
 * Respuesta paginada
 */
const paginated = (res, data, pagination, message = 'Datos obtenidos exitosamente') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: Math.ceil(pagination.total / pagination.limit),
      hasNext: pagination.page < Math.ceil(pagination.total / pagination.limit),
      hasPrev: pagination.page > 1
    },
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  success,
  error,
  validation,
  notFound,
  unauthorized,
  forbidden,
  paginated
};
