import { Prisma } from '@prisma/client';
import { prisma } from '../app.js';
import { calcularCuotaMensual, calcularFechaVencimiento, descontarStock } from '../utils/calculos.js';

const getVentasFilter = (req) => {
  if (req.rol === 'supervisor') return {};
  if (req.rol === 'empleado') return { empleadoId: req.usuarioId };
  return { cliente: { usuarioId: req.usuarioId } };
};

export const getVentas = async (req, res, next) => {
  try {
    const where = getVentasFilter(req);
    const ventas = await prisma.ventaCredito.findMany({
      where,
      include: { cliente: { include: { usuario: true } }, empleado: { include: { usuario: true } }, articulo: true, pagos: true },
      orderBy: { id: 'desc' }
    });
    res.json({ ventas });
  } catch (error) { next(error); }
};

export const createVenta = async (req, res, next) => {
  try {
    const { clienteId, articuloId, cantidad, interes, cuotas, observacion } = req.body;

    const articulo = await prisma.articulo.findUnique({ where: { id: parseInt(articuloId) } });
    if (!articulo || !articulo.activo) return res.status(404).json({ error: 'Articulo no encontrado o inactivo' });
    if (articulo.stock < parseInt(cantidad)) return res.status(400).json({ error: 'Stock insuficiente' });

    const cliente = await prisma.cliente.findUnique({ where: { id: parseInt(clienteId) } });
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });

    const precioTotal = parseFloat(articulo.precio) * parseInt(cantidad);
    const tasaReal = parseFloat(interes) || 0;
    const cuotaMensual = calcularCuotaMensual(precioTotal, tasaReal, parseInt(cuotas));
    const fechaVencimiento = calcularFechaVencimiento(new Date(), parseInt(cuotas));

    const stockOk = await descontarStock(parseInt(articuloId), parseInt(cantidad));
    if (!stockOk) return res.status(400).json({ error: 'No se pudo descontar el stock' });

    const venta = await prisma.ventaCredito.create({
      data: {
        clienteId: parseInt(clienteId), empleadoId: req.usuarioId, articuloId: parseInt(articuloId),
        cantidad: parseInt(cantidad), precioUnitario: parseFloat(articulo.precio), precioTotal,
        interes: tasaReal, cuotas: parseInt(cuotas), cuotaMensual, fechaVencimiento, observacion
      },
      include: { cliente: { include: { usuario: true } }, empleado: { include: { usuario: true } }, articulo: true, pagos: true }
    });
    res.status(201).json({ venta });
  } catch (error) { next(error); }
};

export const getVentaById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const venta = await prisma.ventaCredito.findUnique({
      where: { id: parseInt(id) },
      include: { cliente: { include: { usuario: true } }, empleado: { include: { usuario: true } }, articulo: true, pagos: true }
    });
    if (!venta) return res.status(404).json({ error: 'Venta no encontrada' });
    res.json({ venta });
  } catch (error) { next(error); }
};

export const getVentasCliente = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ventas = await prisma.ventaCredito.findMany({
      where: { clienteId: parseInt(id), estado: 'activo' },
      include: { articulo: true, pagos: true }
    });
    res.json({ ventas });
  } catch (error) { next(error); }
};