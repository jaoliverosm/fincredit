import { Router } from 'express';
import { getDashboardSupervisor, getDashboardEmpleado, getDashboardCliente } from '../controllers/dashboard.controller.js';
import { esSupervisor, esEmpleadoOSupervisor, esCliente } from '../middlewares/rol.middleware.js';

const router = Router();
router.get('/supervisor', esSupervisor, getDashboardSupervisor);
router.get('/empleado', esEmpleadoOSupervisor, getDashboardEmpleado);
router.get('/cliente', esCliente, getDashboardCliente);
export default router;