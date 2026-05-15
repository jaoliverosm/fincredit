import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { rolMiddleware } from '../middlewares/rol.middleware.js';
import {
  getEmpleados, createEmpleado, getEmpleadoById,
  updateEmpleado, getEmpleadoMetricas, uploadFoto, uploadHojaDeVida,
  generarPassword, getRecursos, createRecurso, deleteRecurso
} from '../controllers/empleado.controller.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads/empleados'),
  filename: (req, file, cb) => {
    const prefix = req.path.includes('foto') ? 'foto' : 'cv';
    const ext = path.extname(file.originalname);
    cb(null, prefix + '-' + Date.now() + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const isFoto = req.path.includes('foto');
    const allowedFoto = ['.png', '.jpg', '.jpeg', '.webp'];
    const allowedCV = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, isFoto ? allowedFoto.includes(ext) : allowedCV.includes(ext));
  }
});

const router = Router();
router.use(rolMiddleware(['supervisor']));

router.get('/', getEmpleados);
router.post('/', createEmpleado);
router.get('/:id', getEmpleadoById);
router.put('/:id', updateEmpleado);
router.get('/:id/metricas', getEmpleadoMetricas);
router.post('/:id/foto', upload.single('foto'), uploadFoto);
router.post('/:id/hoja-de-vida', upload.single('hojaDeVida'), uploadHojaDeVida);
router.post('/:id/generar-password', generarPassword);
router.get('/:id/recursos', getRecursos);
router.post('/:id/recursos', createRecurso);
router.delete('/:id/recursos/:recursoId', deleteRecurso);

export default router;
