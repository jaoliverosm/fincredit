/**
 * Controlador de Clientes
 * Maneja todas las operaciones CRUD para clientes
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { success, error, validation, notFound, paginated } from '../utils/response.util.js';
import { asyncHandler } from '../utils/error.util.js';
import { isValidEmail, isValidPhone, isValidCedula } from '../utils/validation.util.js';

const prisma = new PrismaClient();

/**
 * Obtiene todos los clientes con filtrado por rol
 * - Supervisor: ve todos los clientes
 * - Empleado: ve solo sus clientes asignados
 * - Cliente: solo ve su propio perfil
 * @param {Object} req - Request de Express
 * @param {Object} res - Response of Express
 */
const getClientes = asyncHandler(async (req, res) => {
  const usuario = req.user;
  const { page = 1, limit = 10, search = '', estado } = req.query;
  
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
  
  if (estado) {
    where.estado = estado;
  }

  if (usuario.rol === 'SUPERVISOR') {
    // Supervisor ve todos los clientes
    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    const [clientesData, total] = await Promise.all([
      prisma.cliente.findMany({
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
          prestamos: {
            select: {
              id: true,
              monto: true,
              estado: true,
              cuotas: true,
              pagado: true,
              fechaInicio: true
            }
          },
          ventas: {
            select: {
              id: true,
              precioTotal: true,
              estado: true,
              cuotas: true,
              pagado: true,
              fechaVenta: true
            }
          },
          solicitudes: {
            select: {
              id: true,
              tipo: true,
              estado: true,
              fecha: true
            }
          },
          _count: {
            select: {
              prestamos: true,
              ventas: true,
              solicitudes: true
            }
          }
        },
        orderBy: {
          fechaRegistro: 'desc'
        },
        skip,
        take
      }),
      prisma.cliente.count({ where })
    ]);

    return paginated(res, clientesData, {
      page: parseInt(page),
      limit: parseInt(limit),
      total
    }, 'Clientes obtenidos exitosamente');
  } else if (usuario.rol === 'EMPLEADO') {
    // Empleado ve solo sus clientes asignados
    where.empleadoId = usuario.empleado.id;
    
    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    const [clientesData, total] = await Promise.all([
      prisma.cliente.findMany({
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
          prestamos: {
            select: {
              id: true,
              monto: true,
              estado: true,
              cuotas: true,
              pagado: true,
              fechaInicio: true
            }
          },
          ventas: {
            select: {
              id: true,
              precioTotal: true,
              estado: true,
              cuotas: true,
              pagado: true,
              fechaVenta: true
            }
          },
          solicitudes: {
            select: {
              id: true,
              tipo: true,
              estado: true,
              fecha: true
            },
            orderBy: {
              fecha: 'desc'
            },
            take: 5
          }
        },
        orderBy: {
          fechaRegistro: 'desc'
        },
        skip,
        take
      }),
      prisma.cliente.count({ where })
    ]);

    return paginated(res, clientesData, {
      page: parseInt(page),
      limit: parseInt(limit),
      total
    }, 'Clientes obtenidos exitosamente');
  } else if (usuario.rol === 'CLIENTE') {
    // Cliente solo ve su propio perfil
    const clientes = await prisma.cliente.findMany({
      where: {
        usuarioId: usuario.id
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
        prestamos: {
          select: {
            id: true,
            monto: true,
            estado: true,
            cuotas: true,
            pagado: true,
            fechaInicio: true,
            fechaVencimiento: true,
            cuotaMensual: true
          }
        },
        ventas: {
          select: {
            id: true,
            precioTotal: true,
            estado: true,
            cuotas: true,
            pagado: true,
            fechaVenta: true,
            fechaVencimiento: true,
            cuotaMensual: true
          }
        },
        solicitudes: {
          select: {
            id: true,
            tipo: true,
            estado: true,
            fecha: true,
            respuesta: true
          },
          orderBy: {
            fecha: 'desc'
          }
        }
      }
    });

    return success(res, clientes, 'Clientes obtenidos exitosamente');
  }
});

/**
 * Obtiene un cliente específico por ID
 * @param {Object} req - Request de Express
 * @param {Object} res - Response of Express
 */
const getClienteById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const usuario = req.user;

  // Verificar permisos según el rol
  let whereCondition = { id: parseInt(id) };
  
  if (usuario.rol === 'CLIENTE') {
    whereCondition.usuarioId = usuario.id;
  } else if (usuario.rol === 'EMPLEADO') {
    whereCondition.empleadoId = usuario.empleado.id;
  }

  const cliente = await prisma.cliente.findFirst({
    where: whereCondition,
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
      prestamos: {
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
      },
      ventas: {
        include: {
          articulo: true,
          pagos: {
            orderBy: {
              fecha: 'desc'
            }
          }
        },
        orderBy: {
          fechaVenta: 'desc'
        }
      },
      solicitudes: {
        orderBy: {
          fecha: 'desc'
        }
      }
    }
  });

  if (!cliente) {
    return notFound(res, 'Cliente no encontrado');
  }

  return success(res, cliente, 'Cliente obtenido exitosamente');
});

/**
 * Crea un nuevo cliente
 * @param {Object} req - Request de Express
 * @param {Object} res - Response of Express
 */
const createCliente = asyncHandler(async (req, res) => {
  const {
    nombre,
    email,
    password,
    cedula,
    telefono,
    empleadoId
  } = req.body;

  // Validaciones básicas
  if (!nombre || !email || !password || !cedula) {
    return validation(res, [], 'Se requieren nombre, email, password y cédula');
  }

  if (!isValidEmail(email)) {
    return validation(res, [], 'Email inválido');
  }

  if (!isValidCedula(cedula)) {
    return validation(res, [], 'Cédula inválida');
  }

  // Verificar si el email ya existe
  const emailExistente = await prisma.usuario.findUnique({
    where: { email: email.toLowerCase() }
  });

  if (emailExistente) {
    return validation(res, [], 'El email proporcionado ya está en uso');
  }

  // Verificar si la cédula ya existe
  const cedulaExistente = await prisma.cliente.findUnique({
    where: { cedula }
  });

  if (cedulaExistente) {
    return validation(res, [], 'La cédula proporcionada ya está en uso');
  }

  // Hash de la contraseña
  const passwordHash = await bcrypt.hash(password, 10);

  // Crear usuario y cliente en una transacción
  const resultado = await prisma.$transaction(async (tx) => {
    // Crear usuario
    const nuevoUsuario = await tx.usuario.create({
      data: {
        nombre,
        email: email.toLowerCase(),
        password: passwordHash,
        rol: 'CLIENTE',
        activo: true
      }
    });

    // Asignar empleado si no se proporciona
    let empleadoAsignado = empleadoId;
    if (!empleadoAsignado && req.user.rol === 'EMPLEADO') {
      empleadoAsignado = req.user.empleado.id;
    }

    // Crear cliente
    const nuevoCliente = await tx.cliente.create({
      data: {
        usuarioId: nuevoUsuario.id,
        cedula,
        telefono,
        empleadoId: empleadoAsignado,
        estado: 'ACTIVO'
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

    return nuevoCliente;
  });

  return success(res, resultado, 'Cliente creado exitosamente', 201);
});

/**
 * Actualiza un cliente existente
 * @param {Object} req - Request de Express
 * @param {Object} res - Response of Express
 */
const updateCliente = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    nombre,
    email,
    telefono,
    estado,
    empleadoId
  } = req.body;

  const usuario = req.user;
  const clienteId = parseInt(id);

  // Verificar permisos
  let whereCondition = { id: clienteId };
  
  if (usuario.rol === 'CLIENTE') {
    whereCondition.usuarioId = usuario.id;
  } else if (usuario.rol === 'EMPLEADO') {
    whereCondition.empleadoId = usuario.empleado.id;
  }

  // Verificar si el cliente existe
  const clienteExistente = await prisma.cliente.findFirst({
    where: whereCondition,
    include: {
      usuario: true
    }
  });

  if (!clienteExistente) {
    return notFound(res, 'Cliente no encontrado');
  }

  // Validar email si se proporciona
  if (email && !isValidEmail(email)) {
    return validation(res, [], 'Email inválido');
  }

  // Preparar datos de actualización
  const updateData = {};
  
  if (telefono !== undefined) updateData.telefono = telefono;
  if (estado !== undefined) updateData.estado = estado;
  if (empleadoId !== undefined && (usuario.rol === 'SUPERVISOR' || usuario.rol === 'EMPLEADO')) {
    updateData.empleadoId = empleadoId;
  }

  // Actualizar cliente y usuario en una transacción
  const resultado = await prisma.$transaction(async (tx) => {
    // Actualizar cliente
    const clienteActualizado = await tx.cliente.update({
      where: { id: clienteId },
      data: updateData,
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

    // Actualizar datos del usuario si se proporcionaron
    if (nombre || email) {
      const usuarioUpdateData = {};
      if (nombre) usuarioUpdateData.nombre = nombre;
      if (email) usuarioUpdateData.email = email.toLowerCase();

      await tx.usuario.update({
        where: { id: clienteExistente.usuarioId },
        data: usuarioUpdateData
      });

      // Refrescar los datos del usuario en la respuesta
      clienteActualizado.usuario.nombre = nombre || clienteActualizado.usuario.nombre;
      clienteActualizado.usuario.email = email || clienteActualizado.usuario.email;
    }

    return clienteActualizado;
  });

  return success(res, resultado, 'Cliente actualizado exitosamente');
});

/**
 * Obtiene las estadísticas de clientes para el dashboard
 * @param {Object} req - Request de Express
 * @param {Object} res - Response of Express
 */
const getEstadisticasClientes = asyncHandler(async (req, res) => {
  const usuario = req.user;
  let whereCondition = {};

  // Filtrar según el rol
  if (usuario.rol === 'EMPLEADO') {
    whereCondition.empleadoId = usuario.empleado.id;
  }

  const [
    totalClientes,
    clientesActivos,
    clientesEnMora,
    clientesPagados,
    nuevosEsteMes
  ] = await Promise.all([
    // Total de clientes
    prisma.cliente.count({ where: whereCondition }),
    
    // Clientes activos
    prisma.cliente.count({
      where: { ...whereCondition, estado: 'ACTIVO' }
    }),
    
    // Clientes en mora
    prisma.cliente.count({
      where: { ...whereCondition, estado: 'MORA' }
    }),
    
    // Clientes pagados
    prisma.cliente.count({
      where: { ...whereCondition, estado: 'PAGADO' }
    }),
    
    // Nuevos clientes este mes
    prisma.cliente.count({
      where: {
        ...whereCondition,
        fechaRegistro: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    })
  ]);

  const estadisticas = {
    total: totalClientes,
    activos: clientesActivos,
    enMora: clientesEnMora,
    pagados: clientesPagados,
    nuevosEsteMes,
    porcentajeActivos: totalClientes > 0 ? Math.round((clientesActivos / totalClientes) * 100) : 0,
    porcentajeEnMora: totalClientes > 0 ? Math.round((clientesEnMora / totalClientes) * 100) : 0
  };

  return success(res, estadisticas, 'Estadísticas de clientes obtenidas exitosamente');
});

export {
  getClientes,
  getClienteById,
  createCliente,
  updateCliente,
  getEstadisticasClientes
};
