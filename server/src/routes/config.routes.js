import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { esSupervisor } from '../middlewares/rol.middleware.js';
import { getConfig, updateConfig, uploadLogo } from '../controllers/config.controller.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, 'logo-' + Date.now() + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.png', '.jpg', '.jpeg', '.svg', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  }
});

const router = Router();
router.use(esSupervisor);
router.get('/', getConfig);
router.put('/', updateConfig);
router.post('/logo', upload.single('logo'), uploadLogo);
export default router;
