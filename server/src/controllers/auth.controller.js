/**
 * Controlador de Autenticación
 * Maneja login, registro y verificación de tokens
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { prisma } from '../db.js';
import { sendPasswordResetEmail } from '../utils/email.util.js';

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
 * Registrar nuevo cliente (público)
 */
const register = async (req, res, next) => {
  try {
    const { nombre, email, password, cedula, telefono } = req.body;
    
    if (!nombre || !email || !password || !cedula) {
      return res.status(400).json({ error: 'Nombre, email, contraseña y cédula son requeridos' });
    }

    // Verificar si el email ya existe
    const existingUser = await prisma.usuario.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Verificar si la cédula ya existe
    const existingCliente = await prisma.cliente.findUnique({ where: { cedula } });
    if (existingCliente) {
      return res.status(400).json({ error: 'La cédula ya está registrada' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario y cliente en una transacción
    const result = await prisma.$transaction(async (tx) => {
      const usuario = await tx.usuario.create({
        data: {
          nombre,
          email,
          password: hashedPassword,
          rol: 'cliente',
          activo: true
        }
      });

      const cliente = await tx.cliente.create({
        data: {
          usuarioId: usuario.id,
          cedula,
          telefono: telefono || null,
          estado: 'activo'
        }
      });

      return { usuario, cliente };
    });

    // Generar token
    const token = jwt.sign(
      { id: result.usuario.id, rol: result.usuario.rol, clienteId: result.cliente.id },
      process.env.JWT_SECRET || 'change-me',
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    res.status(201).json({
      token,
      usuario: {
        id: result.usuario.id,
        nombre: result.usuario.nombre,
        email: result.usuario.email,
        rol: result.usuario.rol
      },
      cliente: {
        id: result.cliente.id,
        cedula: result.cliente.cedula,
        telefono: result.cliente.telefono
      }
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

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email es requerido' });

    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) return res.json({ message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña.' });

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000);

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { resetToken: token, resetTokenExpires: expires }
    });

    const result = await sendPasswordResetEmail(email, token);

    if (!result.sent && result.resetLink) {
      console.log('Email no configurado. Token enviado a:', email, 'Link:', result.resetLink);
    }

    res.json({ message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña.' });
  } catch (error) { next(error); }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: 'Token y contraseña son requeridos' });

    const usuario = await prisma.usuario.findFirst({
      where: { resetToken: token, resetTokenExpires: { gt: new Date() } }
    });

    if (!usuario) return res.status(400).json({ error: 'Token inválido o expirado' });

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { password: hashedPassword, resetToken: null, resetTokenExpires: null }
    });

    res.json({ message: 'Contraseña actualizada exitosamente.' });
  } catch (error) { next(error); }
};

export { login, register, getMe, forgotPassword, resetPassword };
