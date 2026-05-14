import { Router } from 'express';
import { rolMiddleware } from '../middlewares/rol.middleware.js';
import { getVentas, createVenta, getVentaById, getVentasCliente } from '../controllers/venta.controller.js';

const router = Router();
router.use(rolMiddleware(['supervisor', 'empleado', 'cliente']));
router.get('/', getVentas);
router.post('/', rolMiddleware(['supervisor', 'empleado'])(createVenta));
router.get('/:id', getVentaById);
router.get('/cliente/:id', getVentasCliente);
export default router;