/**
 * Middleware de Autenticación
 * Verifica el token JWT y añade el usuario al request
 */

import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';

/**
 * Middleware para verificar token JWT
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express
 * @param {Function} next - Función next de Express
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Obtener el token del header Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Acceso denegado',
        message: 'Se requiere token de autenticación'
      });
    }

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'change-me');
    const userId = decoded.id ?? decoded.userId;

    if (userId == null) {
      return res.status(403).json({
        error: 'Token inválido',
        message: 'El token no contiene un identificador de usuario válido'
      });
    }

    // Buscar el usuario en la base de datos
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        activo: true,
        creadoEn: true,
        empleado: {
          select: {
            id: true,
            telefono: true,
            meta: true,
            fechaIngreso: true
          }
        },
        cliente: {
          select: {
            id: true,
            cedula: true,
            telefono: true,
            estado: true,
            fechaRegistro: true
          }
        }
      }
    });

    if (!usuario) {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'El usuario asociado al token no existe'
      });
    }

    if (!usuario.activo) {
      return res.status(401).json({
        error: 'Usuario inactivo',
        message: 'Tu cuenta ha sido desactivada'
      });
    }

    // Añadir información del usuario al request
    req.user = usuario;
    req.usuarioId = usuario.id;
    req.rol = usuario.rol;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({
        error: 'Token inválido',
        message: 'El token proporcionado no es válido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({
        error: 'Token expirado',
        message: 'Tu sesión ha expirado, por favor inicia sesión nuevamente'
      });
    }

    console.error('Error en middleware de autenticación:', error);
    return res.status(500).json({
      error: 'Error de autenticación',
      message: 'Ocurrió un error al verificar tu identidad'
    });
  }
};

const authMiddleware = authenticateToken;

export { authenticateToken, authMiddleware };
