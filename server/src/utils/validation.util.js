/**
 * Utilidades de Validación
 * Validaciones comunes para la API
 */

/**
 * Validar email
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validar cédula colombiana
 */
const isValidCedula = (cedula) => {
  // Validación básica para cédula colombiana (6-10 dígitos)
  const cedulaRegex = /^\d{6,10}$/;
  return cedulaRegex.test(cedula);
};

/**
 * Validar teléfono colombiano
 */
const isValidPhone = (phone) => {
  // Validación para teléfono colombiano (10 dígitos empezando con 3)
  const phoneRegex = /^3\d{9}$/;
  return phoneRegex.test(phone);
};

/**
 * Validar monto positivo
 */
const isValidAmount = (amount) => {
  return typeof amount === 'number' && amount > 0 && Number.isFinite(amount);
};

/**
 * Validar tasa de interés (0-100%)
 */
const isValidInterestRate = (rate) => {
  return typeof rate === 'number' && rate >= 0 && rate <= 100 && Number.isFinite(rate);
};

/**
 * Validar número de cuotas
 */
const isValidInstallments = (installments) => {
  return Number.isInteger(installments) && installments > 0 && installments <= 360; // Máximo 30 años
};

/**
 * Validar stock
 */
const isValidStock = (stock) => {
  return Number.isInteger(stock) && stock >= 0;
};

/**
 * Validar rol de usuario
 */
const isValidRole = (role) => {
  const validRoles = ['SUPERVISOR', 'EMPLEADO', 'CLIENTE'];
  return validRoles.includes(role);
};

/**
 * Validar estado de préstamo/venta
 */
const isValidStatus = (status) => {
  const validStatuses = ['ACTIVO', 'MORA', 'PAGADO', 'INACTIVO'];
  return validStatuses.includes(status);
};

/**
 * Validar método de pago
 */
const isValidPaymentMethod = (method) => {
  const validMethods = ['EFECTIVO', 'TRANSFERENCIA', 'OTRO'];
  return validMethods.includes(method);
};

/**
 * Validar tipo de pago
 */
const isValidPaymentType = (type) => {
  const validTypes = ['PRESTAMO', 'VENTA'];
  return validTypes.includes(type);
};

/**
 * Validar tipo de solicitud
 */
const isValidRequestType = (type) => {
  const validTypes = ['NUEVO_PRESTAMO', 'AMPLIACION', 'NUEVA_COMPRA', 'MENSAJE'];
  return validTypes.includes(type);
};

/**
 * Validar estado de solicitud
 */
const isValidRequestStatus = (status) => {
  const validStatuses = ['PENDIENTE', 'APROBADO', 'RECHAZADO'];
  return validStatuses.includes(status);
};

/**
 * Validar contraseña
 */
const isValidPassword = (password) => {
  // Mínimo 6 caracteres
  return typeof password === 'string' && password.length >= 6;
};

/**
 * Sanitizar string
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/[<>]/g, '');
};

/**
 * Validar objeto de paginación
 */
const isValidPagination = (pagination) => {
  const { page = 1, limit = 10 } = pagination || {};
  
  const isValidPage = Number.isInteger(page) && page > 0;
  const isValidLimit = Number.isInteger(limit) && limit > 0 && limit <= 100;
  
  return isValidPage && isValidLimit;
};

/**
 * Validar fecha
 */
const isValidDate = (date) => {
  if (date instanceof Date) {
    return !isNaN(date.getTime());
  }
  
  if (typeof date === 'string') {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
  }
  
  return false;
};

/**
 * Validar que una fecha no sea futura (para fechas de creación)
 */
const isNotFutureDate = (date) => {
  const inputDate = new Date(date);
  const now = new Date();
  return inputDate <= now;
};

/**
 * Validar que una fecha sea futura (para fechas de vencimiento)
 */
const isFutureDate = (date) => {
  const inputDate = new Date(date);
  const now = new Date();
  return inputDate > now;
};

module.exports = {
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
};
