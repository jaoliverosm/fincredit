/**
 * Controlador de Solicitudes
 * Maneja todas las operaciones para el sistema de solicitudes con flujo de aprobación
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Obtener solicitudes (filtrado por rol y estado)
 */
const obtenerSolicitudes = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      estado,
      tipo,
      clienteId,
      ordenarPor = 'fecha',
      orden = 'desc'
    } = req.query;

    // Construir filtros
    let filtros = {};
    
    if (estado) {
      filtros.estado = estado;
    }
    
    if (tipo) {
      filtros.tipo = tipo;
    }
    
    if (clienteId) {
      filtros.clienteId = parseInt(clienteId);
    }

    // Filtrar por rol
    if (req.user.rol === 'CLIENTE') {
      // Cliente solo ve sus solicitudes
      filtros.clienteId = req.user.cliente.id;
    } else if (req.user.rol === 'EMPLEADO') {
      // Empleado solo ve solicitudes de sus clientes asignados
      const clientesIds = await prisma.cliente.findMany({
        where: { empleadoId: req.user.empleado.id },
        select: { id: true }
      });
      
      filtros.clienteId = {
        in: clientesIds.map(c => c.id)
      };
    }
    // Supervisor ve todas las solicitudes (sin filtros adicionales)

    // Paginación
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Obtener solicitudes y total
    const [solicitudes, total] = await Promise.all([
      prisma.solicitud.findMany({
        where: filtros,
        include: {
          cliente: {
            select: {
              id: true,
              cedula: true,
              usuario: {
                select: {
                  nombre: true,
                  email: true
                }
              }
            }
          },
          articulo: {
            select: {
              id: true,
              nombre: true,
              categoria: true,
              precio: true
            }
          }
        },
        orderBy: {
          [ordenarPor]: orden
        },
        skip,
        take: parseInt(limit)
      }),
      prisma.solicitud.count({ where: filtros })
    ]);

    res.json({
      mensaje: 'Solicitudes obtenidas exitosamente',
      datos: solicitudes,
      paginacion: {
        paginaActual: parseInt(page),
        totalPaginas: Math.ceil(total / parseInt(limit)),
        totalRegistros: total,
        registrosPorPagina: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener solicitudes:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener las solicitudes'
    });
  }
};

/**
 * Obtener una solicitud por ID
 */
const obtenerSolicitudPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const solicitud = await prisma.solicitud.findUnique({
      where: { id: parseInt(id) },
      include: {
        cliente: {
          select: {
            id: true,
            cedula: true,
            telefono: true,
            estado: true,
            usuario: {
              select: {
                nombre: true,
                email: true
              }
            }
          }
        },
        articulo: {
          select: {
            id: true,
            nombre: true,
            descripcion: true,
            categoria: true,
            precio: true,
            stock: true,
            imagen: true
          }
        }
      }
    });

    if (!solicitud) {
      return res.status(404).json({
        error: 'Solicitud no encontrada',
        message: 'La solicitud solicitada no existe'
      });
    }

    // Verificar permisos
    if (req.user.rol === 'CLIENTE' && solicitud.clienteId !== req.user.cliente.id) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'No tienes permisos para ver esta solicitud'
      });
    }

    if (req.user.rol === 'EMPLEADO') {
      // Verificar que el cliente esté asignado al empleado
      const cliente = await prisma.cliente.findUnique({
        where: { id: solicitud.clienteId },
        select: { empleadoId: true }
      });

      if (!cliente || cliente.empleadoId !== req.user.empleado.id) {
        return res.status(403).json({
          error: 'Acceso denegado',
          message: 'Esta solicitud no pertenece a tus clientes asignados'
        });
      }
    }

    res.json({
      mensaje: 'Solicitud obtenida exitosamente',
      datos: solicitud
    });
  } catch (error) {
    console.error('Error al obtener solicitud:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo obtener la solicitud'
    });
  }
};

/**
 * Crear una nueva solicitud (solo clientes)
 */
const crearSolicitud = async (req, res) => {
  try {
    const {
      tipo,
      monto,
      cuotas,
      articuloId,
      mensaje
    } = req.body;

    // Validaciones básicas
    if (!tipo || !mensaje) {
      return res.status(400).json({
        error: 'Datos incompletos',
        message: 'Tipo y mensaje son obligatorios'
      });
    }

    if (!['NUEVO_PRESTAMO', 'AMPLIACION', 'NUEVA_COMPRA', 'MENSAJE'].includes(tipo)) {
      return res.status(400).json({
        error: 'Tipo inválido',
        message: 'El tipo debe ser NUEVO_PRESTAMO, AMPLIACION, NUEVA_COMPRA o MENSAJE'
      });
    }

    // Validaciones específicas por tipo
    if (tipo === 'NUEVO_PRESTAMO' || tipo === 'AMPLIACION') {
      if (!monto || !cuotas) {
        return res.status(400).json({
          error: 'Datos incompletos',
          message: 'Para préstamos se requiere monto y cuotas'
        });
      }

      if (monto <= 0) {
        return res.status(400).json({
          error: 'Monto inválido',
          message: 'El monto debe ser mayor a 0'
        });
      }

      if (cuotas <= 0) {
        return res.status(400).json({
          error: 'Cuotas inválidas',
          message: 'El número de cuotas debe ser mayor a 0'
        });
      }
    }

    if (tipo === 'NUEVA_COMPRA' && !articuloId) {
      return res.status(400).json({
        error: 'Datos incompletos',
        message: 'Para compras se requiere el artículo'
      });
    }

    // Obtener información del cliente
    const cliente = await prisma.cliente.findUnique({
      where: { id: req.user.cliente.id },
      include: { empleado: true }
    });

    if (!cliente) {
      return res.status(404).json({
        error: 'Cliente no encontrado',
        message: 'No se encontró información del cliente'
      });
    }

    // Verificar artículo si aplica
    let articulo = null;
    if (tipo === 'NUEVA_COMPRA') {
      articulo = await prisma.articulo.findUnique({
        where: { id: parseInt(articuloId) }
      });

      if (!articulo) {
        return res.status(404).json({
          error: 'Artículo no encontrado',
          message: 'El artículo especificado no existe'
        });
      }

      if (!articulo.activo) {
        return res.status(400).json({
          error: 'Artículo inactivo',
          message: 'El artículo está desactivado y no se puede solicitar'
        });
      }
    }

    // Crear solicitud
    const solicitud = await prisma.solicitud.create({
      data: {
        clienteId: req.user.cliente.id,
        empleadoId: cliente.empleadoId,
        tipo,
        monto: monto ? parseFloat(monto) : null,
        cuotas: cuotas ? parseInt(cuotas) : null,
        articuloId: articuloId ? parseInt(articuloId) : null,
        mensaje
      },
      include: {
        cliente: {
          select: {
            id: true,
            cedula: true,
            usuario: {
              select: {
                nombre: true,
                email: true
              }
            }
          }
        },
        articulo: {
          select: {
            id: true,
            nombre: true,
            categoria: true,
            precio: true
          }
        }
      }
    });

    res.status(201).json({
      mensaje: 'Solicitud creada exitosamente',
      datos: solicitud
    });
  } catch (error) {
    console.error('Error al crear solicitud:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo crear la solicitud'
    });
  }
};

/**
 * Responder a una solicitud (empleados y supervisores)
 */
const responderSolicitud = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, respuesta } = req.body;

    if (!estado || !respuesta) {
      return res.status(400).json({
        error: 'Datos incompletos',
        message: 'Estado y respuesta son obligatorios'
      });
    }

    if (!['APROBADO', 'RECHAZADO'].includes(estado)) {
      return res.status(400).json({
        error: 'Estado inválido',
        message: 'El estado debe ser APROBADO o RECHAZADO'
      });
    }

    const solicitudId = parseInt(id);

    // Verificar si la solicitud existe
    const solicitud = await prisma.solicitud.findUnique({
      where: { id: solicitudId },
      include: {
        cliente: {
          select: {
            id: true,
            empleadoId: true
          }
        }
      }
    });

    if (!solicitud) {
      return res.status(404).json({
        error: 'Solicitud no encontrada',
        message: 'La solicitud solicitada no existe'
      });
    }

    if (solicitud.estado !== 'PENDIENTE') {
      return res.status(400).json({
        error: 'Solicitud ya procesada',
        message: 'Esta solicitud ya ha sido respondida'
      });
    }

    // Verificar permisos
    if (req.user.rol === 'EMPLEADO' && solicitud.cliente.empleadoId !== req.user.empleado.id) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Esta solicitud no pertenece a tus clientes asignados'
      });
    }

    // Si es aprobación y es un préstamo grande, requerir aprobación de supervisor
    if (estado === 'APROBADO' && req.user.rol === 'EMPLEADO') {
      const config = await prisma.configuracion.findFirst();
      const montoMaxEmpleado = config?.montoMaxPrestamo || 5000000;

      if (solicitud.tipo === 'NUEVO_PRESTAMO' && 
          solicitud.monto && 
          solicitud.monto > montoMaxEmpleado) {
        return res.status(403).json({
          error: 'Aprobación requerida',
          message: `Los préstamos mayores a ${montoMaxEmpleado} requieren aprobación del supervisor`
        });
      }
    }

    // Actualizar solicitud
    const solicitudActualizada = await prisma.solicitud.update({
      where: { id: solicitudId },
      data: {
        estado,
        respuesta,
        fecha: new Date() // Actualizar fecha de respuesta
      },
      include: {
        cliente: {
          select: {
            id: true,
            cedula: true,
            usuario: {
              select: {
                nombre: true,
                email: true
              }
            }
          }
        },
        articulo: {
          select: {
            id: true,
            nombre: true,
            categoria: true,
            precio: true
          }
        }
      }
    });

    // TODO: Aquí podríamos enviar notificaciones por email
    // Por ahora solo retornamos la respuesta

    res.json({
      mensaje: 'Solicitud respondida exitosamente',
      datos: solicitudActualizada
    });
  } catch (error) {
    console.error('Error al responder solicitud:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo responder la solicitud'
    });
  }
};

/**
 * Obtener solicitudes pendientes (para empleados y supervisores)
 */
const obtenerSolicitudesPendientes = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // Construir filtros
    let filtros = {
      estado: 'PENDIENTE'
    };

    // Filtrar por rol
    if (req.user.rol === 'EMPLEADO') {
      // Empleado solo ve solicitudes de sus clientes asignados
      const clientesIds = await prisma.cliente.findMany({
        where: { empleadoId: req.user.empleado.id },
        select: { id: true }
      });
      
      filtros.clienteId = {
        in: clientesIds.map(c => c.id)
      };
    }
    // Supervisor ve todas las solicitudes pendientes

    // Paginación
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Obtener solicitudes y total
    const [solicitudes, total] = await Promise.all([
      prisma.solicitud.findMany({
        where: filtros,
        include: {
          cliente: {
            select: {
              id: true,
              cedula: true,
              usuario: {
                select: {
                  nombre: true,
                  email: true
                }
              }
            }
          },
          articulo: {
            select: {
              id: true,
              nombre: true,
              categoria: true,
              precio: true
            }
          }
        },
        orderBy: {
          fecha: 'asc'
        },
        skip,
        take: parseInt(limit)
      }),
      prisma.solicitud.count({ where: filtros })
    ]);

    res.json({
      mensaje: 'Solicitudes pendientes obtenidas exitosamente',
      datos: solicitudes,
      paginacion: {
        paginaActual: parseInt(page),
        totalPaginas: Math.ceil(total / parseInt(limit)),
        totalRegistros: total,
        registrosPorPagina: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener solicitudes pendientes:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener las solicitudes pendientes'
    });
  }
};

module.exports = {
  obtenerSolicitudes,
  obtenerSolicitudPorId,
  crearSolicitud,
  responderSolicitud,
  obtenerSolicitudesPendientes
};
