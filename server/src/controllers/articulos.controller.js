/**
 * Controlador de Artículos
 * Maneja todas las operaciones CRUD para el catálogo de artículos
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Obtener todos los artículos (todos los roles pueden ver)
 */
const obtenerArticulos = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      categoria, 
      activo, 
      buscar,
      ordenarPor = 'creadoEn',
      orden = 'desc'
    } = req.query;

    // Construir filtros
    const filtros = {};
    
    if (categoria) {
      filtros.categoria = {
        contains: categoria,
        mode: 'insensitive'
      };
    }
    
    if (activo !== undefined) {
      filtros.activo = activo === 'true';
    }
    
    if (buscar) {
      filtros.OR = [
        {
          nombre: {
            contains: buscar,
            mode: 'insensitive'
          }
        },
        {
          descripcion: {
            contains: buscar,
            mode: 'insensitive'
          }
        }
      ];
    }

    // Calcular skip para paginación
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Obtener artículos y total
    const [articulos, total] = await Promise.all([
      prisma.articulo.findMany({
        where: filtros,
        include: {
          _count: {
            select: {
              ventas: true
            }
          }
        },
        orderBy: {
          [ordenarPor]: orden
        },
        skip,
        take: parseInt(limit)
      }),
      prisma.articulo.count({ where: filtros })
    ]);

    // Obtener categorías únicas
    const categorias = await prisma.articulo.findMany({
      select: { categoria: true },
      distinct: ['categoria']
    });

    res.json({
      mensaje: 'Artículos obtenidos exitosamente',
      datos: articulos,
      paginacion: {
        paginaActual: parseInt(page),
        totalPaginas: Math.ceil(total / parseInt(limit)),
        totalRegistros: total,
        registrosPorPagina: parseInt(limit)
      },
      filtros: {
        categorias: categorias.map(c => c.categoria)
      }
    });
  } catch (error) {
    console.error('Error al obtener artículos:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener los artículos'
    });
  }
};

/**
 * Obtener un artículo por ID
 */
const obtenerArticuloPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const articulo = await prisma.articulo.findUnique({
      where: { id: parseInt(id) },
      include: {
        ventas: {
          select: {
            id: true,
            cantidad: true,
            precioTotal: true,
            fechaVenta: true,
            estado: true,
            cliente: {
              select: {
                id: true,
                cedula: true,
                usuario: {
                  select: {
                    nombre: true
                  }
                }
              }
            }
          },
          orderBy: {
            fechaVenta: 'desc'
          },
          take: 10
        },
        _count: {
          select: {
            ventas: true
          }
        }
      }
    });

    if (!articulo) {
      return res.status(404).json({
        error: 'Artículo no encontrado',
        message: 'El artículo solicitado no existe'
      });
    }

    res.json({
      mensaje: 'Artículo obtenido exitosamente',
      datos: articulo
    });
  } catch (error) {
    console.error('Error al obtener artículo:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo obtener el artículo'
    });
  }
};

/**
 * Crear un nuevo artículo (solo supervisor)
 */
const crearArticulo = async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      categoria,
      precio,
      stock,
      imagen
    } = req.body;

    // Validaciones básicas
    if (!nombre || !categoria || !precio) {
      return res.status(400).json({
        error: 'Datos incompletos',
        message: 'Nombre, categoría y precio son obligatorios'
      });
    }

    if (precio <= 0) {
      return res.status(400).json({
        error: 'Precio inválido',
        message: 'El precio debe ser mayor a 0'
      });
    }

    if (stock !== undefined && stock < 0) {
      return res.status(400).json({
        error: 'Stock inválido',
        message: 'El stock no puede ser negativo'
      });
    }

    // Crear artículo
    const articulo = await prisma.articulo.create({
      data: {
        nombre,
        descripcion: descripcion || null,
        categoria,
        precio: parseFloat(precio),
        stock: stock ? parseInt(stock) : 0,
        imagen: imagen || null,
        activo: true
      }
    });

    res.status(201).json({
      mensaje: 'Artículo creado exitosamente',
      datos: articulo
    });
  } catch (error) {
    console.error('Error al crear artículo:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo crear el artículo'
    });
  }
};

/**
 * Actualizar un artículo (solo supervisor)
 */
const actualizarArticulo = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      descripcion,
      categoria,
      precio,
      stock,
      imagen,
      activo
    } = req.body;

    const articuloId = parseInt(id);

    // Verificar si el artículo existe
    const articuloExistente = await prisma.articulo.findUnique({
      where: { id: articuloId }
    });

    if (!articuloExistente) {
      return res.status(404).json({
        error: 'Artículo no encontrado',
        message: 'El artículo solicitado no existe'
      });
    }

    // Validaciones
    if (precio !== undefined && precio <= 0) {
      return res.status(400).json({
        error: 'Precio inválido',
        message: 'El precio debe ser mayor a 0'
      });
    }

    if (stock !== undefined && stock < 0) {
      return res.status(400).json({
        error: 'Stock inválido',
        message: 'El stock no puede ser negativo'
      });
    }

    // Actualizar artículo
    const articuloActualizado = await prisma.articulo.update({
      where: { id: articuloId },
      data: {
        ...(nombre && { nombre }),
        ...(descripcion !== undefined && { descripcion }),
        ...(categoria && { categoria }),
        ...(precio !== undefined && { precio: parseFloat(precio) }),
        ...(stock !== undefined && { stock: parseInt(stock) }),
        ...(imagen !== undefined && { imagen }),
        ...(activo !== undefined && { activo })
      }
    });

    res.json({
      mensaje: 'Artículo actualizado exitosamente',
      datos: articuloActualizado
    });
  } catch (error) {
    console.error('Error al actualizar artículo:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo actualizar el artículo'
    });
  }
};

/**
 * Eliminar un artículo (solo supervisor)
 * En realidad lo desactiva para mantener integridad referencial
 */
const eliminarArticulo = async (req, res) => {
  try {
    const { id } = req.params;
    const articuloId = parseInt(id);

    // Verificar si el artículo existe
    const articulo = await prisma.articulo.findUnique({
      where: { id: articuloId },
      include: {
        _count: {
          select: {
            ventas: true
          }
        }
      }
    });

    if (!articulo) {
      return res.status(404).json({
        error: 'Artículo no encontrado',
        message: 'El artículo solicitado no existe'
      });
    }

    // Si tiene ventas asociadas, solo desactivar
    if (articulo._count.ventas > 0) {
      await prisma.articulo.update({
        where: { id: articuloId },
        data: { activo: false }
      });

      return res.json({
        mensaje: 'Artículo desactivado exitosamente (tiene ventas asociadas)',
        datos: { id: articuloId, activo: false }
      });
    }

    // Si no tiene ventas, se puede eliminar
    await prisma.articulo.delete({
      where: { id: articuloId }
    });

    res.json({
      mensaje: 'Artículo eliminado exitosamente',
      datos: { id: articuloId }
    });
  } catch (error) {
    console.error('Error al eliminar artículo:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo eliminar el artículo'
    });
  }
};

/**
 * Ajustar stock de un artículo (solo supervisor)
 */
const ajustarStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock, motivo } = req.body;

    if (stock === undefined || stock < 0) {
      return res.status(400).json({
        error: 'Stock inválido',
        message: 'El stock debe ser un número mayor o igual a 0'
      });
    }

    const articuloId = parseInt(id);

    // Verificar si el artículo existe
    const articulo = await prisma.articulo.findUnique({
      where: { id: articuloId }
    });

    if (!articulo) {
      return res.status(404).json({
        error: 'Artículo no encontrado',
        message: 'El artículo solicitado no existe'
      });
    }

    // Actualizar stock
    const articuloActualizado = await prisma.articulo.update({
      where: { id: articuloId },
      data: { stock: parseInt(stock) }
    });

    // TODO: Aquí podríamos registrar un log de ajustes de stock
    // Por ahora solo actualizamos

    res.json({
      mensaje: 'Stock ajustado exitosamente',
      datos: {
        id: articuloActualizado.id,
        nombre: articuloActualizado.nombre,
        stockAnterior: articulo.stock,
        stockNuevo: articuloActualizado.stock,
        motivo: motivo || 'Ajuste manual'
      }
    });
  } catch (error) {
    console.error('Error al ajustar stock:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo ajustar el stock'
    });
  }
};

/**
 * Obtener artículos con bajo stock (solo supervisor)
 */
const obtenerArticulosBajoStock = async (req, res) => {
  try {
    const { limite = 5 } = req.query;

    const articulos = await prisma.articulo.findMany({
      where: {
        activo: true,
        stock: {
          lt: parseInt(limite)
        }
      },
      orderBy: {
        stock: 'asc'
      },
      include: {
        _count: {
          select: {
            ventas: true
          }
        }
      }
    });

    res.json({
      mensaje: 'Artículos con bajo stock obtenidos exitosamente',
      datos: articulos,
      total: articulos.length,
      limite: parseInt(limite)
    });
  } catch (error) {
    console.error('Error al obtener artículos con bajo stock:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener los artículos con bajo stock'
    });
  }
};

module.exports = {
  obtenerArticulos,
  obtenerArticuloPorId,
  crearArticulo,
  actualizarArticulo,
  eliminarArticulo,
  ajustarStock,
  obtenerArticulosBajoStock
};
