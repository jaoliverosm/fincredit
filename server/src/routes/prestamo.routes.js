import { Router } from 'express';
import { rolMiddleware } from '../middlewares/rol.middleware.js';
import {
  getPrestamos, createPrestamo, getPrestamoById,
  updatePrestamo, getPrestamosCliente, aprobarPrestamo
} from '../controllers/prestamo.controller.js';

const router = Router();
router.use(rolMiddleware(['supervisor', 'empleado', 'cliente']));
router.get('/', getPrestamos);
router.post('/', rolMiddleware(['supervisor', 'empleado'])(createPrestamo));
router.get('/:id', getPrestamoById);
router.put('/:id', rolMiddleware(['supervisor', 'empleado'])(updatePrestamo));
router.get('/cliente/:id', getPrestamosCliente);
router.put('/:id/aprobar', rolMiddleware(['supervisor'])(aprobarPrestamo));
export default router;