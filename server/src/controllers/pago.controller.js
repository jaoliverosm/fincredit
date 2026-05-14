import { prisma } from '../app.js';

export const createPago = async (req, res, next) => {
  try {
    const { tipo, referenciaId, monto, metodo, observacion } = req.body;
    const clienteId = parseInt(req.body.clienteId);

    if (!['prestamo', 'venta'].includes(tipo)) return res.status(400).json({ error: 'Tipo de pago invalido' });

    let referencia;
    if (tipo === 'prestamo') {
      referencia = await prisma.prestamo.findUnique({ where: { id: parseInt(referenciaId) }, include: { cliente: true } });
    } else {
      referencia = await prisma.ventaCredito.findUnique({ where: { id: parseInt(referenciaId) }, include: { cliente: true } });
    }
    if (!referencia) return res.status(404).json({ error: tipo + ' no encontrado' });

    const refId = parseInt(referenciaId);
    const pago = await prisma.pago.create({
      data: {
        tipo,
        referenciaId: refId,
        prestamoId: tipo === 'prestamo' ? refId : null,
        ventaCreditoId: tipo === 'venta' ? refId : null,
        clienteId,
        empleadoId: req.usuarioId,
        monto: parseFloat(monto),
        metodo,
        observacion
      }
    });

    if (tipo === 'prestamo') {
      await prisma.prestamo.update({ where: { id: parseInt(referenciaId) }, data: { pagado: { increment: parseFloat(monto) } } });
      const prestamoActualizado = await prisma.prestamo.findUnique({ where: { id: parseInt(referenciaId) } });
      if (prestamoActualizado.pagado >= prestamoActualizado.monto) {
        await prisma.prestamo.update({ where: { id: parseInt(referenciaId) }, data: { estado: 'pagado' } });
      }
    } else {
      await prisma.ventaCredito.update({ where: { id: parseInt(referenciaId) }, data: { pagado: { increment: parseFloat(monto) } } });
      const ventaActualizada = await prisma.ventaCredito.findUnique({ where: { id: parseInt(referenciaId) } });
      if (ventaActualizada.pagado >= ventaActualizada.precioTotal) {
        await prisma.ventaCredito.update({ where: { id: parseInt(referenciaId) }, data: { estado: 'pagado' } });
      }
    }

    res.status(201).json({ pago });
  } catch (error) { next(error); }
};

export const getPagosPrestamo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pagos = await prisma.pago.findMany({
      where: { tipo: 'prestamo', referenciaId: parseInt(id) },
      include: { empleado: { include: { usuario: true } }, cliente: { include: { usuario: true } } },
      orderBy: { fecha: 'desc' }
    });
    res.json({ pagos });
  } catch (error) { next(error); }
};

export const getPagosVenta = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pagos = await prisma.pago.findMany({
      where: { tipo: 'venta', referenciaId: parseInt(id) },
      include: { empleado: { include: { usuario: true } }, cliente: { include: { usuario: true } } },
      orderBy: { fecha: 'desc' }
    });
    res.json({ pagos });
  } catch (error) { next(error); }
};

export const getPagosCliente = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pagos = await prisma.pago.findMany({
      where: { clienteId: parseInt(id) },
      include: { empleado: { include: { usuario: true } }, cliente: { include: { usuario: true } } },
      orderBy: { fecha: 'desc' }
    });
    res.json({ pagos });
  } catch (error) { next(error); }
};