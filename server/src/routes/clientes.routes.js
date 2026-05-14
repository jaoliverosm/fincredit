/**
 * Rutas de Clientes
 * Define los endpoints para gestión de clientes
 */

const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientes.controller');
const authenticateToken = require('../middlewares/auth.middleware');
const { puedeVerCliente } = require('../middlewares/rol.middleware');

/**
 * @route   GET /api/clientes
 * @desc    Obtiene todos los clientes con filtrado por rol
 * @access  Privado (requiere token)
 * @returns { clientes: Array, cantidad: number }
 */
router.get('/', authenticateToken, clientesController.getClientes);

/**
 * @route   GET /api/clientes/estadisticas
 * @desc    Obtiene estadísticas de clientes para dashboard
 * @access  Privado (requiere token)
 * @returns { estadisticas: Object }
 */
router.get('/estadisticas', authenticateToken, clientesController.getEstadisticasClientes);

/**
 * @route   GET /api/clientes/:id
 * @desc    Obtiene un cliente específico por ID
 * @access  Privado (requiere token y permisos)
 * @returns { cliente: Object }
 */
router.get('/:id', authenticateToken, puedeVerCliente, clientesController.getClienteById);

/**
 * @route   POST /api/clientes
 * @desc    Crea un nuevo cliente
 * @access  Privado (requiere token, empleado o supervisor)
 * @body    { nombre, email, password, cedula, telefono?, empleadoId? }
 * @returns { cliente: Object }
 */
router.post('/', authenticateToken, clientesController.createCliente);

/**
 * @route   PUT /api/clientes/:id
 * @desc    Actualiza un cliente existente
 * @access  Privado (requiere token y permisos)
 * @body    { nombre?, email?, telefono?, estado?, empleadoId? }
 * @returns { cliente: Object }
 */
router.put('/:id', authenticateToken, puedeVerCliente, clientesController.updateCliente);

module.exports = router;
