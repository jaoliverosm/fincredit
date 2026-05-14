import { Router } from 'express';
import { rolMiddleware } from '../middlewares/rol.middleware.js';
import { createPago, getPagosPrestamo, getPagosVenta, getPagosCliente } from '../controllers/pago.controller.js';

const router = Router();
router.use(rolMiddleware(['supervisor', 'empleado']));
router.post('/', createPago);
router.get('/prestamo/:id', getPagosPrestamo);
router.get('/venta/:id', getPagosVenta);
router.get('/cliente/:id', getPagosCliente);
export default router;