import { Router } from 'express';
import { rolMiddleware } from '../middlewares/rol.middleware.js';
import {
  getArticulos, createArticulo, getArticuloById,
  updateArticulo, deleteArticulo, ajustarStock
} from '../controllers/articulo.controller.js';

const router = Router();
router.use(rolMiddleware(['supervisor', 'empleado', 'cliente']));
router.get('/', getArticulos);
router.get('/:id', getArticuloById);
router.post('/', rolMiddleware(['supervisor'])(createArticulo));
router.put('/:id', rolMiddleware(['supervisor'])(updateArticulo));
router.delete('/:id', rolMiddleware(['supervisor'])(deleteArticulo));
router.patch('/:id/stock', rolMiddleware(['supervisor'])(ajustarStock));
export default router;