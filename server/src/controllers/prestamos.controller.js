/**
 * Controlador de Préstamos
 * Maneja todas las operaciones relacionadas con préstamos
 */

import { PrismaClient } from '@prisma/client';
import { 
  calcularCuotaMensual, 
  calcularFechaVencimiento,
  validarPoliticasPrestamo,
  estaEnMora,
  calcularDiasRetraso
} from '../services/calculos.service.js';
import { success, error, validation, notFound, paginated } from '../utils/response.util.js';
import { asyncHandler } from '../utils/error.util.js';
import { isValidAmount, isValidInterestRate } from '../utils/validation.util.js';

const prisma = new PrismaClient();

/**
 * Obtiene todos los préstamos con filtrado por rol
 * - Supervisor: ve todos los préstamos
 * - Empleado: ve solo los préstamos que gestionó
 * - Cliente: ve solo sus préstamos
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express
 */
const getPrestamos = asyncHandler(async (req, res) => {
  const usuario = req.user;
  const { estado, page = 1, limit = 10, search = '' } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Construir filtros
  const whereCondition = {};
  
  if (estado) {
    whereCondition.estado = estado.toUpperCase();
  }
  
  if (search) {
    whereCondition.cliente = {
      usuario: {
        nombre: { contains: search, mode: 'insensitive' }
      }
    };
  }

  // Filtrar según el rol
  if (usuario.rol === 'EMPLEADO') {
    whereCondition.empleadoId = usuario.empleado.id;
  } else if (usuario.rol === 'CLIENTE') {
    whereCondition.clienteId = usuario.cliente.id;
  }

  const [prestamos, total] = await Promise.all([
    prisma.prestamo.findMany({
      where: whereCondition,
      include: {
        cliente: {
          include: {
            usuario: {
              select: {
                id: true,
                nombre: true,
                email: true
              }
            }
          }
        },
        empleado: {
          select: {
            id: true,
            usuario: {
              select: {
                nombre: true,
                email: true
              }
            }
          }
        },
        pagos: {
          orderBy: {
            fecha: 'desc'
          },
          take: 3
        }
      },
      orderBy: {
        fechaInicio: 'desc'
      },
      skip,
      take: parseInt(limit)
    }),
    prisma.prestamo.count({ where: whereCondition })
  ]);

  return paginated(res, prestamos, {
    page: parseInt(page),
    limit: parseInt(limit),
    total
  }, 'Préstamos obtenidos exitosamente');
});

/**
 * Obtiene un préstamo específico por ID
 * @param {Object} req - Request de Express
 * @param {Object} res - Response of Express
 */
const getPrestamoById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const usuario = req.user;

  let whereCondition = { id: parseInt(id) };
  
  // Filtrar según el rol
  if (usuario.rol === 'EMPLEADO') {
    whereCondition.empleadoId = usuario.empleado.id;
  } else if (usuario.rol === 'CLIENTE') {
    whereCondition.clienteId = usuario.cliente.id;
  }

  const prestamo = await prisma.prestamo.findFirst({
    where: whereCondition,
    include: {
      cliente: {
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              email: true,
              telefono: true
            }
          }
        }
      },
      empleado: {
        select: {
          id: true,
          usuario: {
            select: {
              nombre: true,
              email: true,
              telefono: true
            }
          }
        }
      },
      pagos: {
        orderBy: {
          fecha: 'desc'
        }
      }
    }
  });

  if (!prestamo) {
    return notFound(res, 'Préstamo no encontrado');
  }

  // Calcular información adicional
  const diasRetraso = calcularDiasRetraso(prestamo.fechaVencimiento);
  const enMora = estaEnMora(prestamo.fechaVencimiento, prestamo.pagado, prestamo.monto);
  const porcentajePagado = (prestamo.pagado / prestamo.monto) * 100;

  const prestamoConInfo = {
    ...prestamo,
    diasRetraso,
    enMora,
    porcentajePagado: Math.round(porcentajePagado * 100) / 100,
    saldoPendiente: Math.round((prestamo.monto - prestamo.pagado) * 100) / 100
  };

  return success(res, prestamoConInfo, 'Préstamo obtenido exitosamente');
});

/**
 * Crea un nuevo préstamo
 * @param {Object} req - Request de Express
 * @param {Object} res - Response of Express
 */
const createPrestamo = asyncHandler(async (req, res) => {
  const {
    clienteId,
    monto,
    interes,
    cuotas,
    observacion
  } = req.body;

  const usuario = req.user;

  // Validaciones básicas
  if (!clienteId || !monto || !interes || !cuotas) {
    return validation(res, [], 'Se requieren clienteId, monto, interés y cuotas');
  }

  if (!isValidAmount(monto)) {
    return validation(res, [], 'Monto inválido');
  }

  if (!isValidInterestRate(interes)) {
    return validation(res, [], 'Tasa de interés inválida');
  }

  // Obtener configuración para validar políticas
  const configuracion = await prisma.configuracion.findFirst();
  
  // Validar políticas de préstamo
  const validacion = validarPoliticasPrestamo(monto, cuotas, configuracion);
  if (!validacion.valido) {
    return validation(res, [], validacion.errores.join(', '));
  }

  // Verificar si el cliente existe y obtener información
  const cliente = await prisma.cliente.findUnique({
    where: { id: parseInt(clienteId) },
    include: {
      usuario: {
        select: {
          activo: true
        }
      }
    }
  });

  if (!cliente) {
    return notFound(res, 'Cliente no encontrado');
  }

  if (!cliente.usuario.activo) {
    return validation(res, [], 'No se puede crear préstamo para un cliente inactivo');
  }

  // Verificar permisos
  let empleadoId;
  if (usuario.rol === 'SUPERVISOR') {
    empleadoId = req.body.empleadoId || null;
  } else if (usuario.rol === 'EMPLEADO') {
    empleadoId = usuario.empleado.id;
  } else {
    return error(res, 'Solo empleados y supervisores pueden crear préstamos', 403);
  }

  // Calcular cuota mensual y fecha de vencimiento
  const cuotaMensual = calcularCuotaMensual(monto, interes, cuotas);
  const fechaVencimiento = calcularFechaVencimiento(new Date(), cuotas);

  // Crear préstamo
  const nuevoPrestamo = await prisma.prestamo.create({
    data: {
      clienteId: parseInt(clienteId),
      empleadoId,
      monto: parseFloat(monto),
      interes: parseFloat(interes),
      cuotas: parseInt(cuotas),
      cuotaMensual,
      pagado: 0,
      fechaInicio: new Date(),
      fechaVencimiento,
      estado: 'ACTIVO',
      observacion
    },
    include: {
      cliente: {
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              email: true
            }
          }
        }
      },
      empleado: {
        select: {
          id: true,
          usuario: {
            select: {
              nombre: true,
              email: true
            }
          }
        }
      }
    }
  });

  return success(res, nuevoPrestamo, 'Préstamo creado exitosamente', 201);
});

/**
 * Actualiza un préstamo existente
 * @param {Object} req - Request de Express
 * @param {Object} res - Response of Express
 */
const updatePrestamo = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { estado, observacion } = req.body;

  const usuario = req.user;
  const prestamoId = parseInt(id);

  // Verificar permisos y existencia del préstamo
  let whereCondition = { id: prestamoId };
  
  if (usuario.rol === 'EMPLEADO') {
    whereCondition.empleadoId = usuario.empleado.id;
  } else if (usuario.rol === 'CLIENTE') {
    whereCondition.clienteId = usuario.cliente.id;
  }

  const prestamoExistente = await prisma.prestamo.findFirst({
    where: whereCondition
  });

  if (!prestamoExistente) {
    return notFound(res, 'Préstamo no encontrado');
  }

  // Solo supervisor puede cambiar estado
  if (estado && usuario.rol !== 'SUPERVISOR') {
    return error(res, 'Solo los supervisores pueden cambiar el estado de un préstamo', 403);
  }

  // Preparar datos de actualización
  const updateData = {};
  if (estado) updateData.estado = estado;
  if (observacion !== undefined) updateData.observacion = observacion;

  const prestamoActualizado = await prisma.prestamo.update({
    where: { id: prestamoId },
    data: updateData,
    include: {
      cliente: {
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              email: true
            }
          }
        }
      },
      empleado: {
        select: {
          id: true,
          usuario: {
            select: {
              nombre: true,
              email: true
            }
          }
        }
      }
    }
  });

  return success(res, prestamoActualizado, 'Préstamo actualizado exitosamente');
});

/**
 * Obtiene los préstamos de un cliente específico
 * @param {Object} req - Request de Express
 * @param {Object} res - Response of Express
 */
const getPrestamosByCliente = asyncHandler(async (req, res) => {
  const { clienteId } = req.params;
  const usuario = req.user;

  // Verificar permisos
  if (usuario.rol === 'CLIENTE' && usuario.cliente.id !== parseInt(clienteId)) {
    return error(res, 'Solo puedes ver tus propios préstamos', 403);
  }

  if (usuario.rol === 'EMPLEADO') {
    // Verificar que el cliente esté asignado al empleado
    const cliente = await prisma.cliente.findUnique({
      where: { id: parseInt(clienteId) }
    });

    if (!cliente || cliente.empleadoId !== usuario.empleado.id) {
      return error(res, 'Este cliente no está asignado a ti', 403);
    }
  }

  const prestamos = await prisma.prestamo.findMany({
    where: { clienteId: parseInt(clienteId) },
    include: {
      pagos: {
        orderBy: {
          fecha: 'desc'
        }
      }
    },
    orderBy: {
      fechaInicio: 'desc'
    }
  });

  // Calcular información adicional
  const prestamosConInfo = prestamos.map(prestamo => {
    const diasRetraso = calcularDiasRetraso(prestamo.fechaVencimiento);
    const enMora = estaEnMora(prestamo.fechaVencimiento, prestamo.pagado, prestamo.monto);
    const porcentajePagado = (prestamo.pagado / prestamo.monto) * 100;

    return {
      ...prestamo,
      diasRetraso,
      enMora,
      porcentajePagado: Math.round(porcentajePagado * 100) / 100,
      saldoPendiente: Math.round((prestamo.monto - prestamo.pagado) * 100) / 100
    };
  });

  return success(res, { prestamos: prestamosConInfo, cantidad: prestamos.length }, 'Préstamos del cliente obtenidos exitosamente');
});

/**
 * Obtiene estadísticas de préstamos para el dashboard
 * @param {Object} req - Request de Express
 * @param {Object} res - Response of Express
 */
const getEstadisticasPrestamos = asyncHandler(async (req, res) => {
  const usuario = req.user;
  let whereCondition = {};

  // Filtrar según el rol
  if (usuario.rol === 'EMPLEADO') {
    whereCondition.empleadoId = usuario.empleado.id;
  } else if (usuario.rol === 'CLIENTE') {
    whereCondition.clienteId = usuario.cliente.id;
  }

  const [
    totalPrestamos,
    prestamosActivos,
    prestamosEnMora,
    prestamosPagados,
    sumaTotal,
    sumaPagada,
    nuevosEsteMes
  ] = await Promise.all([
    // Total de préstamos
    prisma.prestamo.count({ where: whereCondition }),
    
    // Préstamos activos
    prisma.prestamo.count({
      where: { ...whereCondition, estado: 'ACTIVO' }
    }),
    
    // Préstamos en mora
    prisma.prestamo.count({
      where: { ...whereCondition, estado: 'MORA' }
    }),
    
    // Préstamos pagados
    prisma.prestamo.count({
      where: { ...whereCondition, estado: 'PAGADO' }
    }),
    
    // Suma total de préstamos
    prisma.prestamo.aggregate({
      where: whereCondition,
      _sum: { monto: true }
    }),
    
    // Suma total pagada
    prisma.prestamo.aggregate({
      where: whereCondition,
      _sum: { pagado: true }
    }),
    
    // Nuevos préstamos este mes
    prisma.prestamo.count({
      where: {
        ...whereCondition,
        fechaInicio: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    })
  ]);

  const totalSuma = sumaTotal._sum.monto || 0;
  const totalPagada = sumaPagada._sum.pagado || 0;
  const totalPendiente = totalSuma - totalPagada;

  const estadisticas = {
    total: totalPrestamos,
    activos: prestamosActivos,
    enMora: prestamosEnMora,
    pagados: prestamosPagados,
    nuevosEsteMes,
    sumaTotal: Math.round(totalSuma * 100) / 100,
    sumaPagada: Math.round(totalPagada * 100) / 100,
    sumaPendiente: Math.round(totalPendiente * 100) / 100,
    porcentajeActivos: totalPrestamos > 0 ? Math.round((prestamosActivos / totalPrestamos) * 100) : 0,
    porcentajeEnMora: totalPrestamos > 0 ? Math.round((prestamosEnMora / totalPrestamos) * 100) : 0,
    porcentajePagados: totalPrestamos > 0 ? Math.round((prestamosPagados / totalPrestamos) * 100) : 0
  };

  return success(res, estadisticas, 'Estadísticas de préstamos obtenidas exitosamente');
});

export {
  getPrestamos,
  getPrestamoById,
  createPrestamo,
  updatePrestamo,
  getPrestamosByCliente,
  getEstadisticasPrestamos
};
