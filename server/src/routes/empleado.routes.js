import { Router } from 'express';
import { rolMiddleware } from '../middlewares/rol.middleware.js';
import {
  getEmpleados, createEmpleado, getEmpleadoById,
  updateEmpleado, getEmpleadoMetricas
} from '../controllers/empleado.controller.js';

const router = Router();
router.use(rolMiddleware(['supervisor']));
router.get('/', getEmpleados);
router.post('/', createEmpleado);
router.get('/:id', getEmpleadoById);
router.put('/:id', updateEmpleado);
router.get('/:id/metricas', getEmpleadoMetricas);
export default router;