import { Prisma } from '@prisma/client';
import { prisma } from '../app.js';
import { calcularCuotaMensual, calcularFechaVencimiento } from '../utils/calculos.js';

const getPrestamosFilter = (req) => {
  if (req.rol === 'supervisor') return {};
  if (req.rol === 'empleado') return { empleadoId: req.usuarioId };
  if (req.rol === 'cliente') return { cliente: { usuarioId: req.usuarioId } };
  return {};
};

export const getPrestamos = async (req, res, next) => {
  try {
    const where = getPrestamosFilter(req);
    const prestamos = await prisma.prestamo.findMany({
      where,
      include: { cliente: { include: { usuario: true } }, empleado: true },
      orderBy: { id: 'desc' }
    });
    res.json({ prestamos });
  } catch (error) { next(error); }
};

export const createPrestamo = async (req, res, next) => {
  try {
    const { clienteId, monto, interes, cuotas, observacion, fechaInicio } = req.body;
    const config = await prisma.configuracion.findFirst({ orderBy: { id: 'desc' } });

    if (config) {
      if (parseFloat(monto) > config.montoMaxPrestamo)
        return res.status(400).json({ error: 'Monto excede el maximo permitido: ' + config.montoMaxPrestamo });
      if (parseFloat(monto) < config.montoMinPrestamo)
        return res.status(400).json({ error: 'Monto inferior al minimo permitido: ' + config.montoMinPrestamo });
      if (parseInt(cuotas) > config.cuotasMax || parseInt(cuotas) < config.cuotasMin)
        return res.status(400).json({ error: 'Numero de cuotas debe estar entre ' + config.cuotasMin + ' y ' + config.cuotasMax });
    }

    const cliente = await prisma.cliente.findUnique({ where: { id: parseInt(clienteId) } });
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });

    const tasaReal = parseFloat(interes) || config?.tasaDefault || 2.5;
    const cuotaMensual = calcularCuotaMensual(parseFloat(monto), tasaReal, parseInt(cuotas));
    const startDate = fechaInicio ? new Date(fechaInicio) : new Date();
    const fechaVencimiento = calcularFechaVencimiento(startDate, parseInt(cuotas));

    const prestamo = await prisma.prestamo.create({
      data: {
        clienteId: parseInt(clienteId), empleadoId: req.usuarioId,
        monto: parseFloat(monto), interes: tasaReal, cuotas: parseInt(cuotas),
        cuotaMensual, fechaInicio: startDate, fechaVencimiento, observacion, estado: 'activo'
      },
      include: { cliente: { include: { usuario: true } }, empleado: { include: { usuario: true } } }
    });
    res.status(201).json({ prestamo });
  } catch (error) { next(error); }
};

export const getPrestamoById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const prestamo = await prisma.prestamo.findUnique({
      where: { id: parseInt(id) },
      include: { cliente: { include: { usuario: true } }, empleado: { include: { usuario: true } }, pagos: true }
    });
    if (!prestamo) return res.status(404).json({ error: 'Prestamo no encontrado' });
    res.json({ prestamo });
  } catch (error) { next(error); }
};

export const updatePrestamo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { estado, observacion } = req.body;
    const prestamo = await prisma.prestamo.update({
      where: { id: parseInt(id) },
      data: estado ? { estado } : { observacion },
      include: { cliente: { include: { usuario: true } }, empleado: { include: { usuario: true } } }
    });
    res.json({ prestamo });
  } catch (error) { next(error); }
};

export const getPrestamosCliente = async (req, res, next) => {
  try {
    const { id } = req.params;
    const prestamos = await prisma.prestamo.findMany({
      where: { clienteId: parseInt(id), estado: 'activo' },
      include: { cliente: { include: { usuario: true } } }
    });
    res.json({ prestamos });
  } catch (error) { next(error); }
};

export const aprobarPrestamo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const prestamo = await prisma.prestamo.update({
      where: { id: parseInt(id) },
      data: { estado: 'activo' },
      include: { cliente: { include: { usuario: true } } }
    });
    res.json({ prestamo });
  } catch (error) { next(error); }
};