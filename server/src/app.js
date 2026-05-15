import { dirname } from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import { prisma } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Make bcrypt available globally for controllers that need it
global.bcrypt = bcrypt;

// Routes
import authRoutes from './routes/auth.routes.js';
import usuariosRoutes from './routes/usuarios.routes.js';
import empleadoRoutes from './routes/empleado.routes.js';
import clienteRoutes from './routes/cliente.routes.js';
import prestamoRoutes from './routes/prestamo.routes.js';
import articuloRoutes from './routes/articulo.routes.js';
import ventaRoutes from './routes/venta.routes.js';
import pagoRoutes from './routes/pago.routes.js';
import solicitudRoutes from './routes/solicitud.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import configRoutes from './routes/config.routes.js';

// Middlewares
import { authMiddleware } from './middlewares/auth.middleware.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { moraJob } from './jobs/mora.job.js';

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/', limiter);

// Públicas
app.use('/api/auth', authRoutes);

// Protegidas
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/empleados', authMiddleware, empleadoRoutes);
app.use('/api/clientes', authMiddleware, clienteRoutes);
app.use('/api/prestamos', authMiddleware, prestamoRoutes);
app.use('/api/articulos', authMiddleware, articuloRoutes);
app.use('/api/ventas', authMiddleware, ventaRoutes);
app.use('/api/pagos', authMiddleware, pagoRoutes);
app.use('/api/solicitudes', authMiddleware, solicitudRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);
app.use('/api/config', authMiddleware, configRoutes);

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'connected' });
  } catch (e) {
    res.status(500).json({ status: 'error', db: 'disconnected' });
  }
});

// Error handler
app.use(errorHandler);

// Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log('FinCredit servidor corriendo en puerto ' + PORT);
  moraJob.start();
});

export { prisma };