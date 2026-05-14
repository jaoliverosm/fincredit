/**
 * Middleware de Manejo de Errores
 * Captura y procesa errores de la aplicación
 */

/**
 * Middleware global de manejo de errores
 * @param {Error} err - Error capturado
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express
 * @param {Function} next - Función next de Express
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Error de Prisma
  if (err.code === 'P2002') {
    return res.status(400).json({
      error: 'Error de duplicado',
      message: 'El registro ya existe'
    });
  }
  
  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'No encontrado',
      message: 'El registro solicitado no existe'
    });
  }
  
  // Error de validación
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Error de validación',
      message: err.message
    });
  }
  
  // Error por defecto
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'Ocurrió un error inesperado'
  });
};

export { errorHandler };