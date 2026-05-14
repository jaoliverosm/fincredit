import { Router } from 'express';
import { rolMiddleware } from '../middlewares/rol.middleware.js';
import { getClientes, createCliente, getClienteById, updateCliente } from '../controllers/cliente.controller.js';

const router = Router();
router.use(rolMiddleware(['supervisor', 'empleado', 'cliente']));
router.get('/', getClientes);
router.post('/', rolMiddleware(['supervisor', 'empleado'])(createCliente));
router.get('/:id', getClienteById);
router.put('/:id', rolMiddleware(['supervisor', 'empleado'])(updateCliente));
export default router;