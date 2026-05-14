/**
 * Rutas de Préstamos
 * Define los endpoints para gestión de préstamos
 */

const express = require('express');
const router = express.Router();
const prestamosController = require('../controllers/prestamos.controller');
const authenticateToken = require('../middlewares/auth.middleware');
const { puedeVerCliente } = require('../middlewares/rol.middleware');

/**
 * @route   GET /api/prestamos
 * @desc    Obtiene todos los préstamos con filtrado por rol
 * @access  Privado (requiere token)
 * @query   { estado?, pagina?, limite? }
 * @returns { prestamos: Array, paginacion: Object }
 */
router.get('/', authenticateToken, prestamosController.getPrestamos);

/**
 * @route   GET /api/prestamos/estadisticas
 * @desc    Obtiene estadísticas de préstamos para dashboard
 * @access  Privado (requiere token)
 * @returns { estadisticas: Object }
 */
router.get('/estadisticas', authenticateToken, prestamosController.getEstadisticasPrestamos);

/**
 * @route   GET /api/prestamos/cliente/:clienteId
 * @desc    Obtiene los préstamos de un cliente específico
 * @access  Privado (requiere token y permisos)
 * @returns { prestamos: Array, cantidad: number }
 */
router.get('/cliente/:clienteId', authenticateToken, puedeVerCliente, prestamosController.getPrestamosByCliente);

/**
 * @route   GET /api/prestamos/:id
 * @desc    Obtiene un préstamo específico por ID
 * @access  Privado (requiere token y permisos)
 * @returns { prestamo: Object }
 */
router.get('/:id', authenticateToken, prestamosController.getPrestamoById);

/**
 * @route   POST /api/prestamos
 * @desc    Crea un nuevo préstamo
 * @access  Privado (requiere token, empleado o supervisor)
 * @body    { clienteId, monto, interes, cuotas, observacion?, empleadoId? }
 * @returns { prestamo: Object }
 */
router.post('/', authenticateToken, prestamosController.createPrestamo);

/**
 * @route   PUT /api/prestamos/:id
 * @desc    Actualiza un préstamo existente
 * @access  Privado (requiere token y permisos)
 * @body    { estado?, observacion? }
 * @returns { prestamo: Object }
 */
router.put('/:id', authenticateToken, prestamosController.updatePrestamo);

module.exports = router;
