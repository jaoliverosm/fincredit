/**
 * Rutas de Ventas a Crédito
 * Define todos los endpoints para la gestión de ventas a crédito
 */

const express = require('express');
const router = express.Router();

// Importar middlewares
const authenticateToken = require('../middlewares/auth.middleware');
const { esEmpleadoOSupervisor, puedeVerCliente } = require('../middlewares/rol.middleware');

// Importar controlador
const ventasController = require('../controllers/ventas.controller');

/**
 * @route   GET /api/ventas
 * @desc    Obtener todas las ventas a crédito (filtrado por rol)
 * @access  Private (EMPLEADO, SUPERVISOR, CLIENTE)
 */
router.get('/', 
  authenticateToken, 
  esEmpleadoOSupervisor, 
  ventasController.obtenerVentas
);

/**
 * @route   GET /api/ventas/cliente/:id
 * @desc    Obtener ventas de un cliente específico
 * @access  Private (Con permisos según rol)
 */
router.get('/cliente/:id', 
  authenticateToken, 
  puedeVerCliente, 
  ventasController.obtenerVentasPorCliente
);

/**
 * @route   GET /api/ventas/:id
 * @desc    Obtener una venta por ID
 * @access  Private (Con permisos según rol)
 */
router.get('/:id', 
  authenticateToken, 
  ventasController.obtenerVentaPorId
);

/**
 * @route   POST /api/ventas
 * @desc    Crear una nueva venta a crédito
 * @access  Private (EMPLEADO, SUPERVISOR)
 */
router.post('/', 
  authenticateToken, 
  esEmpleadoOSupervisor, 
  ventasController.crearVenta
);

module.exports = router;
