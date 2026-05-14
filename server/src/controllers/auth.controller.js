/**
 * Controlador de Autenticación
 * Maneja login y verificación de tokens
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';

/**
 * Iniciar sesión
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email y contraseña son requeridos' });

    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: { empleado: true, cliente: true }
    });

    if (!usuario || !usuario.activo) return res.status(401).json({ error: 'Credenciales invalidas' });

    const validPassword = await bcrypt.compare(password, usuario.password);
    if (!validPassword) return res.status(401).json({ error: 'Credenciales invalidas' });

    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol, empleadoId: usuario.empleado?.id, clienteId: usuario.cliente?.id },
      process.env.JWT_SECRET || 'change-me',
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    res.json({
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener información del usuario actual (requiere authMiddleware)
 */
const getMe = async (req, res, next) => {
  try {
    if (req.user) {
      return res.json({ usuario: req.user });
    }
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuarioId },
      include: { empleado: true, cliente: true }
    });
    res.json({ usuario });
  } catch (error) {
    next(error);
  }
};

export { login, getMe };
