/**
 * Controlador de Ventas a Crédito
 * Maneja todas las operaciones para ventas a crédito con descuento automático de stock
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Calcular cuota mensual usando fórmula de amortización francesa
 */
const calcularCuotaMensual = (monto, tasaAnual, cuotas) => {
  const tasaMensual = tasaAnual / 12 / 100;
  
  if (tasaMensual === 0) {
    return monto / cuotas;
  }
  
  const cuota = monto * (tasaMensual * Math.pow(1 + tasaMensual, cuotas)) / 
                (Math.pow(1 + tasaMensual, cuotas) - 1);
  
  return Math.round(cuota * 100) / 100; // Redondear a 2 decimales
};

/**
 * Obtener todas las ventas a crédito (filtrado por rol)
 */
const obtenerVentas = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      estado,
      clienteId,
      articuloId,
      ordenarPor = 'fechaVenta',
      orden = 'desc'
    } = req.query;

    // Construir filtros según el rol del usuario
    let filtros = {};
    
    if (estado) {
      filtros.estado = estado;
    }
    
    if (clienteId) {
      filtros.clienteId = parseInt(clienteId);
    }
    
    if (articuloId) {
      filtros.articuloId = parseInt(articuloId);
    }

    // Filtrar por rol
    if (req.user.rol === 'CLIENTE') {
      // Cliente solo ve sus ventas
      filtros.clienteId = req.user.cliente.id;
    } else if (req.user.rol === 'EMPLEADO') {
      // Empleado solo ve sus ventas y las de sus clientes
      const clientesIds = await prisma.cliente.findMany({
        where: { empleadoId: req.user.empleado.id },
        select: { id: true }
      });
      
      filtros.clienteId = {
        in: clientesIds.map(c => c.id)
      };
    }
    // Supervisor ve todas las ventas (sin filtros adicionales)

    // Paginación
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Obtener ventas y total
    const [ventas, total] = await Promise.all([
      prisma.ventaCredito.findMany({
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
          articulo: {
            select: {
              id: true,
              nombre: true,
              categoria: true,
              precio: true
            }
          },
          pagos: {
            select: {
              id: true,
              monto: true,
              fecha: true,
              metodo: true
            },
            orderBy: {
              fecha: 'desc'
            }
          },
          _count: {
            select: {
              pagos: true
            }
          }
        },
        orderBy: {
          [ordenarPor]: orden
        },
        skip,
        take: parseInt(limit)
      }),
      prisma.ventaCredito.count({ where: filtros })
    ]);

    res.json({
      mensaje: 'Ventas obtenidas exitosamente',
      datos: ventas,
      paginacion: {
        paginaActual: parseInt(page),
        totalPaginas: Math.ceil(total / parseInt(limit)),
        totalRegistros: total,
        registrosPorPagina: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener las ventas'
    });
  }
};

/**
 * Obtener una venta por ID
 */
const obtenerVentaPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const venta = await prisma.ventaCredito.findUnique({
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
        articulo: {
          select: {
            id: true,
            nombre: true,
            descripcion: true,
            categoria: true,
            precio: true,
            imagen: true
          }
        },
        pagos: {
          orderBy: {
            fecha: 'desc'
          }
        }
      }
    });

    if (!venta) {
      return res.status(404).json({
        error: 'Venta no encontrada',
        message: 'La venta solicitada no existe'
      });
    }

    // Verificar permisos
    if (req.user.rol === 'CLIENTE' && venta.clienteId !== req.user.cliente.id) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'No tienes permisos para ver esta venta'
      });
    }

    if (req.user.rol === 'EMPLEADO' && venta.empleadoId !== req.user.empleado.id) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Esta venta no fue registrada por ti'
      });
    }

    res.json({
      mensaje: 'Venta obtenida exitosamente',
      datos: venta
    });
  } catch (error) {
    console.error('Error al obtener venta:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo obtener la venta'
    });
  }
};

/**
 * Crear una nueva venta a crédito
 */
const crearVenta = async (req, res) => {
  try {
    const {
      clienteId,
      articuloId,
      cantidad,
      interes,
      cuotas,
      observacion
    } = req.body;

    // Validaciones básicas
    if (!clienteId || !articuloId || !cantidad || !cuotas) {
      return res.status(400).json({
        error: 'Datos incompletos',
        message: 'Cliente, artículo, cantidad y cuotas son obligatorios'
      });
    }

    if (cantidad <= 0) {
      return res.status(400).json({
        error: 'Cantidad inválida',
        message: 'La cantidad debe ser mayor a 0'
      });
    }

    if (cuotas <= 0) {
      return res.status(400).json({
        error: 'Cuotas inválidas',
        message: 'El número de cuotas debe ser mayor a 0'
      });
    }

    // Obtener configuración para tasas y límites
    const config = await prisma.configuracion.findFirst();
    const tasaDefault = config?.tasaDefault || 15;
    const cuotasMax = config?.cuotasMax || 24;
    const cuotasMin = config?.cuotasMin || 1;

    // Validar límites
    if (cuotas > cuotasMax) {
      return res.status(400).json({
        error: 'Cuotas excedidas',
        message: `El máximo de cuotas permitidas es ${cuotasMax}`
      });
    }

    if (cuotas < cuotasMin) {
      return res.status(400).json({
        error: 'Cuotas insuficientes',
        message: `El mínimo de cuotas permitidas es ${cuotasMin}`
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
    if (req.user.rol === 'EMPLEADO' && cliente.empleadoId !== req.user.empleado.id) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Este cliente no está asignado a ti'
      });
    }

    // Verificar artículo y stock
    const articulo = await prisma.articulo.findUnique({
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
        message: 'El artículo está desactivado y no se puede vender'
      });
    }

    if (articulo.stock < cantidad) {
      return res.status(400).json({
        error: 'Stock insuficiente',
        message: `Solo hay ${articulo.stock} unidades disponibles del artículo ${articulo.nombre}`
      });
    }

    // Calcular valores
    const precioUnitario = articulo.precio;
    const precioTotal = precioUnitario * cantidad;
    const tasaAplicada = interes || tasaDefault;
    const cuotaMensual = calcularCuotaMensual(precioTotal, tasaAplicada, cuotas);
    
    // Calcular fecha de vencimiento (última cuota)
    const fechaVencimiento = new Date();
    fechaVencimiento.setMonth(fechaVencimiento.getMonth() + cuotas);

    // Crear venta en transacción para asegurar consistencia
    const resultado = await prisma.$transaction(async (tx) => {
      // Descontar stock
      await tx.articulo.update({
        where: { id: parseInt(articuloId) },
        data: {
          stock: {
            decrement: parseInt(cantidad)
          }
        }
      });

      // Crear venta
      const venta = await tx.ventaCredito.create({
        data: {
          clienteId: parseInt(clienteId),
          empleadoId: req.user.rol === 'EMPLEADO' ? req.user.empleado.id : parseInt(req.body.empleadoId),
          articuloId: parseInt(articuloId),
          cantidad: parseInt(cantidad),
          precioUnitario,
          precioTotal,
          interes: tasaAplicada,
          cuotas: parseInt(cuotas),
          cuotaMensual,
          fechaVencimiento,
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
          articulo: {
            select: {
              id: true,
              nombre: true,
              categoria: true
            }
          }
        }
      });

      return venta;
    });

    res.status(201).json({
      mensaje: 'Venta creada exitosamente',
      datos: resultado
    });
  } catch (error) {
    console.error('Error al crear venta:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo crear la venta'
    });
  }
};

/**
 * Obtener ventas de un cliente específico
 */
const obtenerVentasPorCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const clienteId = parseInt(id);

    // Verificar permisos
    if (req.user.rol === 'CLIENTE' && clienteId !== req.user.cliente.id) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'Solo puedes ver tus propias ventas'
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

    // Obtener ventas del cliente
    const ventas = await prisma.ventaCredito.findMany({
      where: { clienteId },
      include: {
        articulo: {
          select: {
            id: true,
            nombre: true,
            categoria: true
          }
        },
        pagos: {
          select: {
            id: true,
            monto: true,
            fecha: true,
            metodo: true
          },
          orderBy: {
            fecha: 'desc'
          }
        },
        _count: {
          select: {
            pagos: true
          }
        }
      },
      orderBy: {
        fechaVenta: 'desc'
      }
    });

    res.json({
      mensaje: 'Ventas del cliente obtenidas exitosamente',
      datos: ventas,
      total: ventas.length
    });
  } catch (error) {
    console.error('Error al obtener ventas del cliente:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener las ventas del cliente'
    });
  }
};

module.exports = {
  obtenerVentas,
  obtenerVentaPorId,
  crearVenta,
  obtenerVentasPorCliente
};
