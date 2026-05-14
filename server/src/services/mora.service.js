/**
 * Servicio de Cálculo Automático de Mora
 * Maneja la lógica para calcular y aplicar mora a préstamos y ventas vencidas
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Calcular y aplicar mora a préstamos vencidos
 */
const calcularMoraPrestamos = async () => {
  try {
    console.log('🔄 Iniciando cálculo de mora para préstamos...');
    
    const hoy = new Date();
    
    // Obtener préstamos activos que deberían estar en mora
    const prestamos = await prisma.prestamo.findMany({
      where: {
        estado: 'ACTIVO',
        fechaVencimiento: {
          lt: hoy
        }
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

    console.log(`📊 Se encontraron ${prestamos.length} préstamos para revisar`);

    let prestamosActualizados = 0;
    
    for (const prestamo of prestamos) {
      // Verificar si ya está en mora
      if (prestamo.estado === 'MORA') {
        continue;
      }

      // Calcular días de mora
      const diasMora = Math.floor((hoy - prestamo.fechaVencimiento) / (1000 * 60 * 60 * 24));
      
      if (diasMora >= 1) {
        // Actualizar estado a mora
        await prisma.prestamo.update({
          where: { id: prestamo.id },
          data: { estado: 'MORA' }
        });

        // TODO: Aquí podríamos calcular intereses de mora y registrarlos
        // Por ahora solo cambiamos el estado

        console.log(`⚠️  Préstamo ${prestamo.id} del cliente ${prestamo.cliente.usuario.nombre} marcado en mora (${diasMora} días)`);
        
        // TODO: Enviar notificación email al cliente y empleado
        // await enviarNotificacionMora(prestamo, diasMora);
        
        prestamosActualizados++;
      }
    }

    console.log(`✅ Se actualizaron ${prestamosActualizados} préstamos a estado de mora`);
    return prestamosActualizados;
  } catch (error) {
    console.error('❌ Error en cálculo de mora de préstamos:', error);
    throw error;
  }
};

/**
 * Calcular y aplicar mora a ventas a crédito vencidas
 */
const calcularMoraVentas = async () => {
  try {
    console.log('🔄 Iniciando cálculo de mora para ventas a crédito...');
    
    const hoy = new Date();
    
    // Obtener ventas activas que deberían estar en mora
    const ventas = await prisma.ventaCredito.findMany({
      where: {
        estado: 'ACTIVO',
        fechaVencimiento: {
          lt: hoy
        }
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
        },
        articulo: {
          select: {
            nombre: true,
            categoria: true
          }
        }
      }
    });

    console.log(`📊 Se encontraron ${ventas.length} ventas para revisar`);

    let ventasActualizadas = 0;
    
    for (const venta of ventas) {
      // Verificar si ya está en mora
      if (venta.estado === 'MORA') {
        continue;
      }

      // Calcular días de mora
      const diasMora = Math.floor((hoy - venta.fechaVencimiento) / (1000 * 60 * 60 * 24));
      
      if (diasMora >= 1) {
        // Actualizar estado a mora
        await prisma.ventaCredito.update({
          where: { id: venta.id },
          data: { estado: 'MORA' }
        });

        // TODO: Aquí podríamos calcular intereses de mora y registrarlos
        // Por ahora solo cambiamos el estado

        console.log(`⚠️  Venta ${venta.id} del cliente ${venta.cliente.usuario.nombre} (${venta.articulo.nombre}) marcada en mora (${diasMora} días)`);
        
        // TODO: Enviar notificación email al cliente y empleado
        // await enviarNotificacionMoraVenta(venta, diasMora);
        
        ventasActualizadas++;
      }
    }

    console.log(`✅ Se actualizaron ${ventasActualizadas} ventas a estado de mora`);
    return ventasActualizadas;
  } catch (error) {
    console.error('❌ Error en cálculo de mora de ventas:', error);
    throw error;
  }
};

/**
 * Función principal que ejecuta todo el proceso de cálculo de mora
 */
const ejecutarCalculoMora = async () => {
  try {
    console.log('🚀 Iniciando proceso automático de cálculo de mora...');
    const inicio = new Date();
    
    // Ejecutar cálculo para préstamos y ventas en paralelo
    const [prestamosActualizados, ventasActualizadas] = await Promise.all([
      calcularMoraPrestamos(),
      calcularMoraVentas()
    ]);
    
    const fin = new Date();
    const duracion = fin - inicio;
    
    console.log(`🎉 Proceso de cálculo de mora completado en ${duracion}ms`);
    console.log(`📈 Resumen: ${prestamosActualizados} préstamos y ${ventasActualizadas} ventas actualizados a mora`);
    
    return {
      fechaEjecucion: inicio,
      duracion,
      prestamosActualizados,
      ventasActualizadas,
      totalActualizados: prestamosActualizados + ventasActualizadas
    };
  } catch (error) {
    console.error('❌ Error en proceso de cálculo de mora:', error);
    throw error;
  }
};

/**
 * Obtener reporte de mora actual
 */
const obtenerReporteMora = async () => {
  try {
    const [
      prestamosMora,
      ventasMora,
      totalPrestamos,
      totalVentas,
      carteraMoraPrestamos,
      carteraMoraVentas
    ] = await Promise.all([
      // Préstamos en mora
      prisma.prestamo.count({
        where: { estado: 'MORA' }
      }),
      
      // Ventas en mora
      prisma.ventaCredito.count({
        where: { estado: 'MORA' }
      }),
      
      // Total de préstamos
      prisma.prestamo.count(),
      
      // Total de ventas
      prisma.ventaCredito.count(),
      
      // Cartera en mora de préstamos
      prisma.prestamo.aggregate({
        where: { estado: 'MORA' },
        _sum: { 
          monto: true,
          pagado: true
        }
      }),
      
      // Cartera en mora de ventas
      prisma.ventaCredito.aggregate({
        where: { estado: 'MORA' },
        _sum: { 
          precioTotal: true,
          pagado: true
        }
      })
    ]);

    const reporte = {
      prestamos: {
        total: totalPrestamos,
        enMora: prestamosMora,
        porcentajeMora: totalPrestamos > 0 ? (prestamosMora / totalPrestamos) * 100 : 0,
        carteraMora: {
          total: carteraMoraPrestamos._sum.monto || 0,
          pagado: carteraMoraPrestamos._sum.pagado || 0,
          pendiente: (carteraMoraPrestamos._sum.monto || 0) - (carteraMoraPrestamos._sum.pagado || 0)
        }
      },
      ventas: {
        total: totalVentas,
        enMora: ventasMora,
        porcentajeMora: totalVentas > 0 ? (ventasMora / totalVentas) * 100 : 0,
        carteraMora: {
          total: carteraMoraVentas._sum.precioTotal || 0,
          pagado: carteraMoraVentas._sum.pagado || 0,
          pendiente: (carteraMoraVentas._sum.precioTotal || 0) - (carteraMoraVentas._sum.pagado || 0)
        }
      },
      resumen: {
        totalOperaciones: totalPrestamos + totalVentas,
        totalMora: prestamosMora + ventasMora,
        porcentajeMoraTotal: (totalPrestamos + totalVentas) > 0 ? 
          ((prestamosMora + ventasMora) / (totalPrestamos + totalVentas)) * 100 : 0,
        carteraMoraTotal: {
          total: (carteraMoraPrestamos._sum.monto || 0) + (carteraMoraVentas._sum.precioTotal || 0),
          pagado: (carteraMoraPrestamos._sum.pagado || 0) + (carteraMoraVentas._sum.pagado || 0),
          pendiente: ((carteraMoraPrestamos._sum.monto || 0) - (carteraMoraPrestamos._sum.pagado || 0)) +
                     ((carteraMoraVentas._sum.precioTotal || 0) - (carteraMoraVentas._sum.pagado || 0))
        }
      }
    };

    return reporte;
  } catch (error) {
    console.error('Error al obtener reporte de mora:', error);
    throw error;
  }
};

module.exports = {
  ejecutarCalculoMora,
  calcularMoraPrestamos,
  calcularMoraVentas,
  obtenerReporteMora
};
