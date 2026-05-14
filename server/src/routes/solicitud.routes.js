import { Router } from 'express';
import { rolMiddleware } from '../middlewares/rol.middleware.js';
import { getSolicitudes, createSolicitud, responderSolicitud } from '../controllers/solicitud.controller.js';

const router = Router();
router.use(rolMiddleware(['supervisor', 'empleado', 'cliente']));
router.get('/', getSolicitudes);
router.post('/', rolMiddleware(['cliente'])(createSolicitud));
router.put('/:id/responder', rolMiddleware(['supervisor', 'empleado'])(responderSolicitud));
export default router;