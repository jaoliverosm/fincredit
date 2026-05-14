/**
 * Rutas de Empleados
 * Define todos los endpoints para la gestión de empleados
 */

const express = require('express');
const router = express.Router();

// Importar middlewares
const authenticateToken = require('../middlewares/auth.middleware');
const { esSupervisor, puedeVerEmpleado } = require('../middlewares/rol.middleware');

// Importar controlador
const empleadosController = require('../controllers/empleados.controller');

/**
 * @route   GET /api/empleados
 * @desc    Obtener todos los empleados (solo supervisor)
 * @access  Private (Solo SUPERVISOR)
 */
router.get('/', 
  authenticateToken, 
  esSupervisor, 
  empleadosController.obtenerEmpleados
);

/**
 * @route   GET /api/empleados/:id
 * @desc    Obtener un empleado por ID
 * @access  Private (Supervisor puede ver todos, empleado solo el suyo)
 */
router.get('/:id', 
  authenticateToken, 
  puedeVerEmpleado, 
  empleadosController.obtenerEmpleadoPorId
);

/**
 * @route   POST /api/empleados
 * @desc    Crear un nuevo empleado (solo supervisor)
 * @access  Private (Solo SUPERVISOR)
 */
router.post('/', 
  authenticateToken, 
  esSupervisor, 
  empleadosController.crearEmpleado
);

/**
 * @route   PUT /api/empleados/:id
 * @desc    Actualizar un empleado
 * @access  Private (Supervisor puede actualizar todos, empleado solo el suyo)
 */
router.put('/:id', 
  authenticateToken, 
  puedeVerEmpleado, 
  empleadosController.actualizarEmpleado
);

/**
 * @route   PUT /api/empleados/:id/password
 * @desc    Cambiar contraseña de empleado
 * @access  Private (Supervisor puede cambiar cualquier password, empleado solo el suyo)
 */
router.put('/:id/password', 
  authenticateToken, 
  puedeVerEmpleado, 
  empleadosController.cambiarPassword
);

/**
 * @route   GET /api/empleados/:id/metricas
 * @desc    Obtener métricas de un empleado
 * @access  Private (Supervisor puede ver todas, empleado solo las suyas)
 */
router.get('/:id/metricas', 
  authenticateToken, 
  puedeVerEmpleado, 
  empleadosController.obtenerMetricasEmpleado
);

module.exports = router;
