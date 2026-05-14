/**
 * Rutas de Pagos
 * Define todos los endpoints para la gestión de pagos unificados
 */

const express = require('express');
const router = express.Router();

// Importar middlewares
const authenticateToken = require('../middlewares/auth.middleware');
const { esEmpleadoOSupervisor, puedeVerCliente } = require('../middlewares/rol.middleware');

// Importar controlador
const pagosController = require('../controllers/pagos.controller');

/**
 * @route   GET /api/pagos
 * @desc    Obtener todos los pagos (filtrado por rol)
 * @access  Private (EMPLEADO, SUPERVISOR, CLIENTE)
 */
router.get('/', 
  authenticateToken, 
  esEmpleadoOSupervisor, 
  pagosController.obtenerPagos
);

/**
 * @route   GET /api/pagos/prestamo/:id
 * @desc    Obtener pagos de un préstamo específico
 * @access  Private (Con permisos según rol)
 */
router.get('/prestamo/:id', 
  authenticateToken, 
  pagosController.obtenerPagosPorPrestamo
);

/**
 * @route   GET /api/pagos/venta/:id
 * @desc    Obtener pagos de una venta específica
 * @access  Private (Con permisos según rol)
 */
router.get('/venta/:id', 
  authenticateToken, 
  pagosController.obtenerPagosPorVenta
);

/**
 * @route   GET /api/pagos/cliente/:id
 * @desc    Obtener pagos de un cliente específico
 * @access  Private (Con permisos según rol)
 */
router.get('/cliente/:id', 
  authenticateToken, 
  puedeVerCliente, 
  pagosController.obtenerPagosPorCliente
);

/**
 * @route   POST /api/pagos
 * @desc    Registrar un nuevo pago
 * @access  Private (EMPLEADO, SUPERVISOR)
 */
router.post('/', 
  authenticateToken, 
  esEmpleadoOSupervisor, 
  pagosController.crearPago
);

module.exports = router;
