/**
 * Middleware de Verificación de Roles (valores en minúsculas, alineados con Prisma)
 */

import { prisma } from '../db.js';

const esSupervisor = (req, res, next) => {
  if (req.user.rol !== 'supervisor') {
    return res.status(403).json({
      error: 'Acceso denegado',
      message: 'Se requiere rol de supervisor para realizar esta acción'
    });
  }
  next();
};

const esEmpleadoOSupervisor = (req, res, next) => {
  if (req.user.rol !== 'empleado' && req.user.rol !== 'supervisor') {
    return res.status(403).json({
      error: 'Acceso denegado',
      message: 'Se requiere rol de empleado o supervisor para realizar esta acción'
    });
  }
  next();
};

const esCliente = (req, res, next) => {
  if (req.user.rol !== 'cliente') {
    return res.status(403).json({
      error: 'Acceso denegado',
      message: 'Solo los clientes pueden acceder a este recurso'
    });
  }
  next();
};

/**
 * Uso: router.use(rolMiddleware(['supervisor', 'empleado'])) o router.post('/', rolMiddleware(['cliente'])(handler))
 */
const rolMiddleware = (roles) => {
  const guard = (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado', message: 'Se requiere iniciar sesión' });
    }
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ error: 'Acceso denegado', message: 'No tienes permiso para esta acción' });
    }
    next();
  };

  return (arg1, arg2, arg3) => {
    if (typeof arg1 === 'function' && arg2 === undefined) {
      const handler = arg1;
      return (req, res, next) => {
        if (!req.user) {
          return res.status(401).json({ error: 'No autenticado', message: 'Se requiere iniciar sesión' });
        }
        if (!roles.includes(req.user.rol)) {
          return res.status(403).json({ error: 'Acceso denegado', message: 'No tienes permiso para esta acción' });
        }
        return handler(req, res, next);
      };
    }
    return guard(arg1, arg2, arg3);
  };
};

const puedeVerCliente = async (req, res, next) => {
  try {
    const clienteId = parseInt(req.params.id || req.params.clienteId, 10);
    const usuario = req.user;

    if (usuario.rol === 'supervisor') {
      return next();
    }

    if (usuario.rol === 'cliente') {
      if (!usuario.cliente || usuario.cliente.id !== clienteId) {
        return res.status(403).json({
          error: 'Acceso denegado',
          message: 'Solo puedes ver tu propia información'
        });
      }
      return next();
    }

    if (usuario.rol === 'empleado') {
      const cliente = await prisma.cliente.findUnique({
        where: { id: clienteId },
        select: { empleadoId: true }
      });

      if (!cliente) {
        return res.status(404).json({
          error: 'Cliente no encontrado',
          message: 'El cliente solicitado no existe'
        });
      }

      if (cliente.empleadoId !== usuario.id) {
        return res.status(403).json({
          error: 'Acceso denegado',
          message: 'Este cliente no está asignado a ti'
        });
      }
    }

    next();
  } catch (error) {
    console.error('Error en middleware puedeVerCliente:', error);
    return res.status(500).json({
      error: 'Error de verificación',
      message: 'Ocurrió un error al verificar los permisos'
    });
  }
};

const puedeVerEmpleado = (req, res, next) => {
  const empleadoId = parseInt(req.params.id || req.params.empleadoId, 10);
  const usuario = req.user;

  if (usuario.rol === 'cliente') {
    return res.status(403).json({
      error: 'Acceso denegado',
      message: 'No tienes permisos para ver información de empleados'
    });
  }

  if (usuario.rol === 'supervisor') {
    return next();
  }

  if (usuario.rol === 'empleado' && usuario.empleado && usuario.empleado.id !== empleadoId) {
    return res.status(403).json({
      error: 'Acceso denegado',
      message: 'Solo puedes ver tu propia información'
    });
  }

  next();
};

const puedeGestionarArticulos = (req, res, next) => {
  if (req.user.rol !== 'supervisor') {
    return res.status(403).json({
      error: 'Acceso denegado',
      message: 'Solo los supervisores pueden gestionar el catálogo de artículos'
    });
  }
  next();
};

const puedeResponderSolicitudes = (req, res, next) => {
  if (req.user.rol !== 'empleado' && req.user.rol !== 'supervisor') {
    return res.status(403).json({
      error: 'Acceso denegado',
      message: 'Solo los empleados y supervisores pueden responder solicitudes'
    });
  }
  next();
};

export {
  esSupervisor,
  esEmpleadoOSupervisor,
  esCliente,
  rolMiddleware,
  puedeVerCliente,
  puedeVerEmpleado,
  puedeGestionarArticulos,
  puedeResponderSolicitudes
};
