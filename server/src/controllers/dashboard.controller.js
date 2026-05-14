import { prisma } from '../db.js';

const getClientesFilter = (rol, usuario) => {
  if (rol === 'supervisor') return {};
  if (rol === 'empleado') return { empleadoId: usuario.empleado?.id || 0 };
  return { id: usuario.cliente?.id || 0 };
};

export const getDashboardSupervisor = async (req, res, next) => {
  try {
    const [totalClientes, totalPrestamos, totalVentas, totalPagos, prestamosMora, ventasMora] = await Promise.all([
      prisma.cliente.count(),
      prisma.prestamo.count(),
      prisma.ventaCredito.count(),
      prisma.pago.aggregate({ _sum: { monto: true } }),
      prisma.prestamo.count({ where: { estado: 'mora' } }),
      prisma.ventaCredito.count({ where: { estado: 'mora' } })
    ]);

    const prestamos = await prisma.prestamo.findMany({
      include: { cliente: { include: { usuario: true } } }, orderBy: { id: 'desc' }, take: 5
    });

    res.json({
      resumen: { totalClientes, totalPrestamos, totalVentas, totalPagos: totalPagos._sum.monto || 0, alertasMora: prestamosMora + ventasMora },
      prestamos
    });
  } catch (error) { next(error); }
};

export const getDashboardEmpleado = async (req, res, next) => {
  try {
    const usuarioId = req.user.id;
    const [clientes, prestamos, ventas, pagos] = await Promise.all([
      prisma.cliente.count({ where: { empleadoId: usuarioId } }),
      prisma.prestamo.count({ where: { empleadoId: usuarioId } }),
      prisma.ventaCredito.count({ where: { empleadoId: usuarioId } }),
      prisma.pago.aggregate({ where: { empleadoId: usuarioId }, _sum: { monto: true } })
    ]);
    res.json({ clientes, prestamos, ventas, comisionesEstimadas: Math.round((pagos._sum.monto || 0) * 0.01) });
  } catch (error) { next(error); }
};

export const getDashboardCliente = async (req, res, next) => {
  try {
    const clienteId = req.user.cliente?.id;
    const [prestamos, ventas, pagos] = await Promise.all([
      prisma.prestamo.findMany({ where: { clienteId, estado: 'activo' }, include: { cliente: { include: { usuario: true } } } }),
      prisma.ventaCredito.findMany({ where: { clienteId, estado: 'activo' }, include: { articulo: true } }),
      prisma.pago.aggregate({ where: { clienteId }, _sum: { monto: true } })
    ]);
    res.json({ prestamos, ventas, totalPagado: pagos._sum.monto || 0 });
  } catch (error) { next(error); }
};