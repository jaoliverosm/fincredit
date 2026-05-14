/**
 * Rutas de Artículos
 * Define todos los endpoints para la gestión del catálogo de artículos
 */

const express = require('express');
const router = express.Router();

// Importar middlewares
const authenticateToken = require('../middlewares/auth.middleware');
const { puedeGestionarArticulos } = require('../middlewares/rol.middleware');

// Importar controlador
const articulosController = require('../controllers/articulos.controller');

/**
 * @route   GET /api/articulos
 * @desc    Obtener todos los artículos (todos los roles pueden ver)
 * @access  Private
 */
router.get('/', 
  authenticateToken, 
  articulosController.obtenerArticulos
);

/**
 * @route   GET /api/articulos/bajo-stock
 * @desc    Obtener artículos con bajo stock (solo supervisor)
 * @access  Private (Solo SUPERVISOR)
 */
router.get('/bajo-stock', 
  authenticateToken, 
  puedeGestionarArticulos, 
  articulosController.obtenerArticulosBajoStock
);

/**
 * @route   GET /api/articulos/:id
 * @desc    Obtener un artículo por ID
 * @access  Private
 */
router.get('/:id', 
  authenticateToken, 
  articulosController.obtenerArticuloPorId
);

/**
 * @route   POST /api/articulos
 * @desc    Crear un nuevo artículo (solo supervisor)
 * @access  Private (Solo SUPERVISOR)
 */
router.post('/', 
  authenticateToken, 
  puedeGestionarArticulos, 
  articulosController.crearArticulo
);

/**
 * @route   PUT /api/articulos/:id
 * @desc    Actualizar un artículo (solo supervisor)
 * @access  Private (Solo SUPERVISOR)
 */
router.put('/:id', 
  authenticateToken, 
  puedeGestionarArticulos, 
  articulosController.actualizarArticulo
);

/**
 * @route   DELETE /api/articulos/:id
 * @desc    Eliminar un artículo (solo supervisor)
 * @access  Private (Solo SUPERVISOR)
 */
router.delete('/:id', 
  authenticateToken, 
  puedeGestionarArticulos, 
  articulosController.eliminarArticulo
);

/**
 * @route   PATCH /api/articulos/:id/stock
 * @desc    Ajustar stock de un artículo (solo supervisor)
 * @access  Private (Solo SUPERVISOR)
 */
router.patch('/:id/stock', 
  authenticateToken, 
  puedeGestionarArticulos, 
  articulosController.ajustarStock
);

module.exports = router;
