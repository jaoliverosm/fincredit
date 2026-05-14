/**
 * Rutas de Solicitudes
 * Define todos los endpoints para el sistema de solicitudes
 */

const express = require('express');
const router = express.Router();

// Importar middlewares
const authenticateToken = require('../middlewares/auth.middleware');
const { esEmpleadoOSupervisor, puedeResponderSolicitudes } = require('../middlewares/rol.middleware');

// Importar controlador
const solicitudesController = require('../controllers/solicitudes.controller');

/**
 * @route   GET /api/solicitudes
 * @desc    Obtener todas las solicitudes (filtrado por rol)
 * @access  Private (EMPLEADO, SUPERVISOR, CLIENTE)
 */
router.get('/', 
  authenticateToken, 
  solicitudesController.obtenerSolicitudes
);

/**
 * @route   GET /api/solicitudes/pendientes
 * @desc    Obtener solicitudes pendientes (para empleados y supervisores)
 * @access  Private (EMPLEADO, SUPERVISOR)
 */
router.get('/pendientes', 
  authenticateToken, 
  esEmpleadoOSupervisor, 
  solicitudesController.obtenerSolicitudesPendientes
);

/**
 * @route   GET /api/solicitudes/:id
 * @desc    Obtener una solicitud por ID
 * @access  Private (Con permisos según rol)
 */
router.get('/:id', 
  authenticateToken, 
  solicitudesController.obtenerSolicitudPorId
);

/**
 * @route   POST /api/solicitudes
 * @desc    Crear una nueva solicitud (solo clientes)
 * @access  Private (Solo CLIENTE)
 */
router.post('/', 
  authenticateToken, 
  solicitudesController.crearSolicitud
);

/**
 * @route   PUT /api/solicitudes/:id/responder
 * @desc    Responder a una solicitud (empleados y supervisores)
 * @access  Private (EMPLEADO, SUPERVISOR)
 */
router.put('/:id/responder', 
  authenticateToken, 
  puedeResponderSolicitudes, 
  solicitudesController.responderSolicitud
);

module.exports = router;
