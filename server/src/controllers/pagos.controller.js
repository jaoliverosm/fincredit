/**
 * Controlador de Pagos
 * Maneja todas las operaciones para el registro de pagos unificados
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Obtener pagos (filtrado por rol y tipo)
 */
const obtenerPagos = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      tipo,
      metodo,
      clienteId,
      fechaInicio,
      fechaFin,
      ordenarPor = 'fecha',
      orden = 'desc'
    } = req.query;

    // Construir filtros
    let filtros = {};
    
    if (tipo) {
      filtros.tipo = tipo;
    }
    
    if (metodo) {
      filtros.metodo = metodo;
    }
    
    if (clienteId) {
      filtros.clienteId = parseInt(clienteId);
    }
    
    if (fechaInicio || fechaFin) {
      filtros.fecha = {};
      if (fechaInicio) {
        filtros.fecha.gte = new Date(fechaInicio);
      }
      if (fechaFin) {
        filtros.fecha.lte = new Date(fechaFin);
      }
    }

    // Filtrar por rol
    if (req.user.rol === 'CLIENTE') {
      // Cliente solo ve sus pagos
      filtros.clienteId = req.user.cliente.id;
    } else if (req.user.rol === 'EMPLEADO') {
      // Empleado solo ve pagos que registró o de sus clientes
      const clientesIds = await prisma.cliente.findMany({
        where: { empleadoId: req.user.empleado.id },
        select: { id: true }
      });
      
      filtros.OR = [
        { empleadoId: req.user.empleado.id },
        { clienteId: { in: clientesIds.map(c => c.id) } }
      ];
    }
    // Supervisor ve todos los pagos (sin filtros adicionales)

    // Paginación
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Obtener pagos y total
    const [pagos, total] = await Promise.all([
      prisma.pago.findMany({
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
          prestamo: {
            select: {
              id: true,
              monto: true,
              estado: true
            }
          },
          venta: {
            select: {
              id: true,
              precioTotal: true,
              estado: true,
              articulo: {
                select: {
                  nombre: true
                }
              }
            }
          }
        },
        orderBy: {
          [ordenarPor]: orden
        },
        skip,
        take: parseInt(limit)
      }),
      prisma.pago.count({ where: filtros })
    ]);

    res.json({
      mensaje: 'Pagos obtenidos exitosamente',
      datos: pagos,
      paginacion: {
        paginaActual: parseInt(page),
        totalPaginas: Math.ceil(total / parseInt(limit)),
        totalRegistros: total,
        registrosPorPagina: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener pagos:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener los pagos'
    });
  }
};

/**
 * Obtener pagos de un préstamo específico
 */
const obtenerPagosPorPrestamo = async (req, res) => {
  try {
    const { id } = req.params;
    const prestamoId = parseInt(id);

    // Verificar si el préstamo existe y permisos
    const prestamo = await prisma.prestamo.findUnique({
      where: { id: prestamoId },
      include: {
        cliente: {
          select: {
            id: true,
            empleadoId: true
          }
        },
        empleado: {
          select: {
            id: true
          }
        }
      }
    });

    if (!prestamo) {
      return res.status(404).json({
        error: 'Préstamo no encontrado',
        message: 'El préstamo especificado no existe'
      });
    }

    // Verificar permisos
    if (req.user.rol === 'CLIENTE' && prestamo.clienteId !== req.user.cliente.id) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'No tienes permisos para ver estos pagos'
      });
    }

    if (req.user.rol === 'EMPLEADO' && 
        prestamo.empleadoId !== req.user.empleado.id && 
        prestamo.cliente.empleadoId !== req.user.empleado.id) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Este préstamo no está asociado a ti ni a tus clientes'
      });
    }

    // Obtener pagos del préstamo
    const pagos = await prisma.pago.findMany({
      where: {
        tipo: 'PRESTAMO',
        referenciaId: prestamoId
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
      },
      orderBy: {
        fecha: 'desc'
      }
    });

    // Calcular totales
    const totalPagado = pagos.reduce((sum, pago) => sum + pago.monto, 0);
    const saldoPendiente = prestamo.monto - totalPagado;

    res.json({
      mensaje: 'Pagos del préstamo obtenidos exitosamente',
      datos: pagos,
      resumen: {
        totalPagos: pagos.length,
        totalPagado,
        saldoPendiente,
        porcentajePagado: (totalPagado / prestamo.monto) * 100
      }
    });
  } catch (error) {
    console.error('Error al obtener pagos del préstamo:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener los pagos del préstamo'
    });
  }
};

/**
 * Obtener pagos de una venta específica
 */
const obtenerPagosPorVenta = async (req, res) => {
  try {
    const { id } = req.params;
    const ventaId = parseInt(id);

    // Verificar si la venta existe y permisos
    const venta = await prisma.ventaCredito.findUnique({
      where: { id: ventaId },
      include: {
        cliente: {
          select: {
            id: true,
            empleadoId: true
          }
        },
        empleado: {
          select: {
            id: true
          }
        }
      }
    });

    if (!venta) {
      return res.status(404).json({
        error: 'Venta no encontrada',
        message: 'La venta especificada no existe'
      });
    }

    // Verificar permisos
    if (req.user.rol === 'CLIENTE' && venta.clienteId !== req.user.cliente.id) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'No tienes permisos para ver estos pagos'
      });
    }

    if (req.user.rol === 'EMPLEADO' && 
        venta.empleadoId !== req.user.empleado.id && 
        venta.cliente.empleadoId !== req.user.empleado.id) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Esta venta no está asociada a ti ni a tus clientes'
      });
    }

    // Obtener pagos de la venta
    const pagos = await prisma.pago.findMany({
      where: {
        tipo: 'VENTA',
        referenciaId: ventaId
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
      },
      orderBy: {
        fecha: 'desc'
      }
    });

    // Calcular totales
    const totalPagado = pagos.reduce((sum, pago) => sum + pago.monto, 0);
    const saldoPendiente = venta.precioTotal - totalPagado;

    res.json({
      mensaje: 'Pagos de la venta obtenidos exitosamente',
      datos: pagos,
      resumen: {
        totalPagos: pagos.length,
        totalPagado,
        saldoPendiente,
        porcentajePagado: (totalPagado / venta.precioTotal) * 100
      }
    });
  } catch (error) {
    console.error('Error al obtener pagos de la venta:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener los pagos de la venta'
    });
  }
};

/**
 * Obtener pagos de un cliente específico
 */
const obtenerPagosPorCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const clienteId = parseInt(id);

    // Verificar permisos
    if (req.user.rol === 'CLIENTE' && clienteId !== req.user.cliente.id) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Solo puedes ver tus propios pagos'
      });
    }

    if (req.user.rol === 'EMPLEADO') {
      // Verificar que el cliente esté asignado al empleado
      const cliente = await prisma.cliente.findUnique({
        where: { id: clienteId },
        select: { empleadoId: true }
      });

      if (!cliente || cliente.empleadoId !== req.user.empleado.id) {
        return res.status(403).json({
          error: 'Acceso denegado',
          message: 'Este cliente no está asignado a ti'
        });
      }
    }

    // Obtener pagos del cliente
    const pagos = await prisma.pago.findMany({
      where: { clienteId },
      include: {
        prestamo: {
          select: {
            id: true,
            monto: true,
            estado: true
          }
        },
        venta: {
          select: {
            id: true,
            precioTotal: true,
            estado: true,
            articulo: {
              select: {
                nombre: true
              }
            }
          }
        }
      },
      orderBy: {
        fecha: 'desc'
      }
    });

    // Calcular totales
    const totalPagado = pagos.reduce((sum, pago) => sum + pago.monto, 0);

    res.json({
      mensaje: 'Pagos del cliente obtenidos exitosamente',
      datos: pagos,
      resumen: {
        totalPagos: pagos.length,
        totalPagado
      }
    });
  } catch (error) {
    console.error('Error al obtener pagos del cliente:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener los pagos del cliente'
    });
  }
};

/**
 * Registrar un nuevo pago
 */
const crearPago = async (req, res) => {
  try {
    const {
      tipo,
      referenciaId,
      clienteId,
      monto,
      metodo,
      observacion
    } = req.body;

    // Validaciones básicas
    if (!tipo || !referenciaId || !clienteId || !monto) {
      return res.status(400).json({
        error: 'Datos incompletos',
        message: 'Tipo, referencia, cliente y monto son obligatorios'
      });
    }

    if (monto <= 0) {
      return res.status(400).json({
        error: 'Monto inválido',
        message: 'El monto debe ser mayor a 0'
      });
    }

    if (!['PRESTAMO', 'VENTA'].includes(tipo)) {
      return res.status(400).json({
        error: 'Tipo inválido',
        message: 'El tipo debe ser PRESTAMO o VENTA'
      });
    }

    // Verificar cliente y permisos
    const cliente = await prisma.cliente.findUnique({
      where: { id: parseInt(clienteId) },
      include: { usuario: true }
    });

    if (!cliente) {
      return res.status(404).json({
        error: 'Cliente no encontrado',
        message: 'El cliente especificado no existe'
      });
    }

    // Verificar permisos de acceso al cliente
    if (req.user.rol === 'empleado' && cliente.empleadoId !== req.user.id) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Este cliente no está asignado a ti'
      });
    }

    // Verificar la referencia (préstamo o venta)
    let referencia;
    if (tipo === 'PRESTAMO') {
      referencia = await prisma.prestamo.findUnique({
        where: { id: parseInt(referenciaId) }
      });
    } else {
      referencia = await prisma.ventaCredito.findUnique({
        where: { id: parseInt(referenciaId) }
      });
    }

    if (!referencia) {
      return res.status(404).json({
        error: 'Referencia no encontrada',
        message: `La ${tipo.toLowerCase()} especificada no existe`
      });
    }

    if (referencia.estado === 'pagado') {
      return res.status(400).json({
        error: 'Referencia ya pagada',
        message: `La ${tipo.toLowerCase()} ya está completamente pagada`
      });
    }

    const refId = parseInt(referenciaId);
    const tipoDb = tipo === 'PRESTAMO' ? 'prestamo' : 'venta';

    // Crear pago en transacción
    const resultado = await prisma.$transaction(async (tx) => {
      // Crear pago
      const pago = await tx.pago.create({
        data: {
          tipo: tipoDb,
          referenciaId: refId,
          prestamoId: tipo === 'PRESTAMO' ? refId : null,
          ventaCreditoId: tipo === 'VENTA' ? refId : null,
          clienteId: parseInt(clienteId),
          empleadoId: req.user.id,
          monto: parseFloat(monto),
          metodo: metodo || 'EFECTIVO',
          observacion: observacion || null
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

      // Actualizar monto pagado en la referencia
      if (tipo === 'PRESTAMO') {
        const prestamoActualizado = await tx.prestamo.update({
          where: { id: parseInt(referenciaId) },
          data: {
            pagado: {
              increment: parseFloat(monto)
            }
          }
        });

        // Verificar si el préstamo está completamente pagado
        if (prestamoActualizado.pagado >= prestamoActualizado.monto) {
          await tx.prestamo.update({
            where: { id: parseInt(referenciaId) },
            data: {
              pagado: prestamoActualizado.monto,
              estado: 'PAGADO'
            }
          });
        }
      } else {
        const ventaActualizada = await tx.ventaCredito.update({
          where: { id: parseInt(referenciaId) },
          data: {
            pagado: {
              increment: parseFloat(monto)
            }
          }
        });

        // Verificar si la venta está completamente pagada
        if (ventaActualizada.pagada >= ventaActualizada.precioTotal) {
          await tx.ventaCredito.update({
            where: { id: parseInt(referenciaId) },
            data: {
              pagado: ventaActualizada.precioTotal,
              estado: 'PAGADO'
            }
          });
        }
      }

      return pago;
    });

    res.status(201).json({
      mensaje: 'Pago registrado exitosamente',
      datos: resultado
    });
  } catch (error) {
    console.error('Error al crear pago:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo registrar el pago'
    });
  }
};

module.exports = {
  obtenerPagos,
  obtenerPagosPorPrestamo,
  obtenerPagosPorVenta,
  obtenerPagosPorCliente,
  crearPago
};
