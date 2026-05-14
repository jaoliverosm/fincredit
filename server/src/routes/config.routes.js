import { Router } from 'express';
import { esSupervisor } from '../middlewares/rol.middleware.js';
import { getConfig, updateConfig } from '../controllers/config.controller.js';

const router = Router();
router.use(esSupervisor);
router.get('/', getConfig);
router.put('/', updateConfig);
export default router;