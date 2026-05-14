/**
 * Controlador de Empleados
 * Maneja todas las operaciones CRUD para empleados
 */

import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { success, error, validation, notFound, paginated } from '../utils/response.util.js';
import { asyncHandler } from '../utils/error.util.js';
import { isValidEmail, isValidPhone, isValidAmount } from '../utils/validation.util.js';

const prisma = new PrismaClient();

/**
 * Obtener todos los empleados (solo supervisor)
 */
const obtenerEmpleados = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = '', activo } = req.query;
  
  // Construir filtros
  const where = {};
  
  if (search) {
    where.usuario = {
      OR: [
        { nombre: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    };
  }
  
  if (activo !== undefined) {
    where.usuario.activo = activo === 'true';
  }

  const skip = (page - 1) * limit;
  const take = parseInt(limit);

  const [empleados, total] = await Promise.all([
    prisma.empleado.findMany({
      where,
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
            rol: true,
            activo: true,
            creadoEn: true
          }
        },
        _count: {
          select: {
            clientes: true,
            prestamos: true,
            ventas: true
          }
        }
      },
      orderBy: {
        fechaIngreso: 'desc'
      },
      skip,
      take
    }),
    prisma.empleado.count({ where })
  ]);

  return paginated(res, empleados, {
    page: parseInt(page),
    limit: parseInt(limit),
    total
  }, 'Empleados obtenidos exitosamente');
});

/**
 * Obtener un empleado por ID
 */
const obtenerEmpleadoPorId = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const empleado = await prisma.empleado.findUnique({
    where: { id: parseInt(id) },
    include: {
      usuario: {
        select: {
          id: true,
          nombre: true,
          email: true,
          rol: true,
          activo: true,
          creadoEn: true
        }
      },
      clientes: {
        select: {
          id: true,
          cedula: true,
          usuario: {
            select: {
              nombre: true,
              email: true
            }
          },
          estado: true,
          fechaRegistro: true
        },
        orderBy: {
          fechaRegistro: 'desc'
        }
      },
      _count: {
        select: {
          clientes: true,
          prestamos: true,
          ventas: true,
          pagos: true
        }
      }
    }
  });

  if (!empleado) {
    return notFound(res, 'Empleado no encontrado');
  }

  return success(res, empleado, 'Empleado obtenido exitosamente');
});

/**
 * Crear un nuevo empleado (solo supervisor)
 */
const crearEmpleado = asyncHandler(async (req, res) => {
  const {
    nombre,
    email,
    password,
    telefono,
    meta
  } = req.body;

  // Validaciones básicas
  if (!nombre || !email || !password) {
    return validation(res, [], 'Nombre, email y password son obligatorios');
  }

  if (!isValidEmail(email)) {
    return validation(res, [], 'Email inválido');
  }

  if (telefono && !isValidPhone(telefono)) {
    return validation(res, [], 'Teléfono inválido');
  }

  if (meta && !isValidAmount(meta)) {
    return validation(res, [], 'Meta mensual inválida');
  }

  // Verificar si el email ya existe
  const emailExistente = await prisma.usuario.findUnique({
    where: { email }
  });

  if (emailExistente) {
    return validation(res, [], 'El correo electrónico ya está en uso');
  }

  // Encriptar contraseña
  const passwordHash = await bcrypt.hash(password, 10);

  // Crear usuario y empleado en una transacción
  const resultado = await prisma.$transaction(async (tx) => {
    // Crear usuario
    const usuario = await tx.usuario.create({
      data: {
        nombre,
        email,
        password: passwordHash,
        rol: 'EMPLEADO',
        activo: true
      }
    });

    // Crear empleado
    const empleado = await tx.empleado.create({
      data: {
        usuarioId: usuario.id,
        telefono: telefono || null,
        meta: meta ? parseFloat(meta) : null
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
            rol: true,
            creadoEn: true
          }
        }
      }
    });

    return empleado;
  });

  return success(res, resultado, 'Empleado creado exitosamente', 201);
});

/**
 * Actualizar un empleado
 */
const actualizarEmpleado = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    nombre,
    email,
    telefono,
    meta,
    activo
  } = req.body;

    const empleadoId = parseInt(id);

    // Verificar si el empleado existe
    const empleadoExistente = await prisma.empleado.findUnique({
      where: { id: empleadoId },
      include: { usuario: true }
    });

    if (!empleadoExistente) {
      return notFound(res, 'Empleado no encontrado');
    }

    // Verificar permisos
    if (req.user.rol !== 'SUPERVISOR' && req.user.empleado?.id !== empleadoId) {
      return validation(res, [], 'No tienes permisos para modificar este empleado');
    }

    // Validaciones
    if (email && !isValidEmail(email)) {
      return validation(res, [], 'Email inválido');
    }

    if (telefono && !isValidPhone(telefono)) {
      return validation(res, [], 'Teléfono inválido');
    }

    if (meta && !isValidAmount(meta)) {
      return validation(res, [], 'Meta mensual inválida');
    }

    // Si se va a cambiar el email, verificar que no exista
    if (email && email !== empleadoExistente.usuario.email) {
      const emailExistente = await prisma.usuario.findUnique({
        where: { email }
      });

      if (emailExistente) {
        return validation(res, [], 'El correo electrónico ya está en uso');
      }
    }

    // Actualizar datos
    const resultado = await prisma.$transaction(async (tx) => {
      // Actualizar usuario
      const usuarioActualizado = await tx.usuario.update({
        where: { id: empleadoExistente.usuarioId },
        data: {
          ...(nombre && { nombre }),
          ...(email && { email }),
          ...(activo !== undefined && { activo })
        }
      });

      // Actualizar empleado
      const empleadoActualizado = await tx.empleado.update({
        where: { id: empleadoId },
        data: {
          ...(telefono !== undefined && { telefono }),
          ...(meta !== undefined && { meta: meta ? parseFloat(meta) : null })
        },
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              email: true,
              rol: true,
              activo: true,
              creadoEn: true
            }
          }
        }
      });

      return empleadoActualizado;
    });

    return success(res, resultado, 'Empleado actualizado exitosamente');
  });

/**
 * Cambiar contraseña de empleado
 */
const cambiarPassword = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { passwordActual, passwordNuevo } = req.body;

  if (!passwordActual || !passwordNuevo) {
    return validation(res, [], 'Password actual y nuevo son obligatorios');
  }

    const empleadoId = parseInt(id);

    // Obtener empleado con usuario
    const empleado = await prisma.empleado.findUnique({
      where: { id: empleadoId },
      include: { usuario: true }
    });

    if (!empleado) {
      return notFound(res, 'Empleado no encontrado');
    }

    // Verificar permisos
    if (req.user.rol !== 'SUPERVISOR' && req.user.empleado?.id !== empleadoId) {
      return validation(res, [], 'No tienes permisos para modificar este empleado');
    }

    // Verificar password actual (sino es supervisor)
    if (req.user.rol !== 'SUPERVISOR') {
      const passwordValido = await bcrypt.compare(passwordActual, empleado.usuario.password);
      if (!passwordValido) {
        return validation(res, [], 'El password actual es incorrecto');
      }
    }

    // Encriptar nuevo password
    const passwordHash = await bcrypt.hash(passwordNuevo, 10);

    // Actualizar password
    await prisma.usuario.update({
      where: { id: empleado.usuarioId },
      data: { password: passwordHash }
    });

    return success(res, null, 'Password actualizado exitosamente');
  });

/**
 * Obtener métricas de un empleado
 */
const obtenerMetricasEmpleado = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const empleadoId = parseInt(id);

  // Verificar permisos
  if (req.user.rol !== 'SUPERVISOR' && req.user.empleado?.id !== empleadoId) {
    return validation(res, [], 'No tienes permisos para ver estas métricas');
  }

    // Obtener datos del empleado
    const empleado = await prisma.empleado.findUnique({
      where: { id: empleadoId },
      include: {
        usuario: {
          select: {
            nombre: true,
            email: true
          }
        }
      }
    });

    if (!empleado) {
      return res.status(404).json({
        error: 'Empleado no encontrado',
        message: 'El empleado solicitado no existe'
      });
    }

    // Obtener métricas
    const [
      totalClientes,
      clientesActivos,
      totalPrestamos,
      prestamosActivos,
      totalVentas,
      ventasActivas,
      totalPagos,
      sumaPagos,
      metaMensual
    ] = await Promise.all([
      prisma.cliente.count({
        where: { empleadoId }
      }),
      prisma.cliente.count({
        where: { 
          empleadoId,
          estado: 'ACTIVO'
        }
      }),
      prisma.prestamo.count({
        where: { empleadoId }
      }),
      prisma.prestamo.count({
        where: { 
          empleadoId,
          estado: 'ACTIVO'
        }
      }),
      prisma.ventaCredito.count({
        where: { empleadoId }
      }),
      prisma.ventaCredito.count({
        where: { 
          empleadoId,
          estado: 'ACTIVO'
        }
      }),
      prisma.pago.count({
        where: { empleadoId }
      }),
      prisma.pago.aggregate({
        where: { empleadoId },
        _sum: { monto: true }
      }),
      prisma.empleado.findUnique({
        where: { id: empleadoId },
        select: { meta: true }
      })
    ]);

    // Calcular progreso de meta
    const progresoMeta = metaMensual?.meta ? 
      (sumaPagos._sum.monto || 0) / metaMensual.meta * 100 : 0;

    const metricas = {
      empleado,
      clientes: {
        total: totalClientes,
        activos: clientesActivos,
        inactivos: totalClientes - clientesActivos
      },
      prestamos: {
        total: totalPrestamos,
        activos: prestamosActivos,
        finalizados: totalPrestamos - prestamosActivos
      },
      ventas: {
        total: totalVentas,
        activas: ventasActivas,
        finalizadas: totalVentas - ventasActivas
      },
      pagos: {
        total: totalPagos,
        sumaTotal: sumaPagos._sum.monto || 0
      },
      meta: {
        mensual: metaMensual?.meta || 0,
        progreso: Math.min(progresoMeta, 100)
      }
    };

    return success(res, metricas, 'Métricas obtenidas exitosamente');
  });

export {
  obtenerEmpleados,
  obtenerEmpleadoPorId,
  crearEmpleado,
  actualizarEmpleado,
  cambiarPassword,
  obtenerMetricasEmpleado
};
