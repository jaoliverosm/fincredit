import { Prisma } from '@prisma/client';
import { prisma } from '../app.js';

const getSolicitudesFilter = (req) => {
  if (req.rol === 'cliente') {
    const cliente = req.user.cliente;
    if (!cliente) return { id: -1 };
    return { clienteId: cliente.id };
  }
  if (req.rol === 'empleado') {
    const empleado = req.user.empleado;
    if (!empleado) return { id: -1 };
    return { empleadoId: empleado.id };
  }
  return {};
};

export const getSolicitudes = async (req, res, next) => {
  try {
    const where = getSolicitudesFilter(req);
    const solicitudes = await prisma.solicitud.findMany({
      where,
      include: { cliente: { include: { usuario: true } }, empleado: { include: { usuario: true } }, articulo: true },
      orderBy: { fecha: 'desc' }
    });
    res.json({ solicitudes });
  } catch (error) { next(error); }
};

export const createSolicitud = async (req, res, next) => {
  try {
    const { tipo, monto, cuotas, articuloId, mensaje } = req.body;
    const cliente = await prisma.cliente.findFirst({ where: { usuarioId: req.usuarioId } });
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });

    const solicitud = await prisma.solicitud.create({
      data: {
        clienteId: cliente.id, tipo,
        monto: monto ? parseFloat(monto) : null,
        cuotas: cuotas ? parseInt(cuotas) : null,
        articuloId: articuloId ? parseInt(articuloId) : null, mensaje
      }
    });
    res.status(201).json({ solicitud });
  } catch (error) { next(error); }
};

export const responderSolicitud = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { respuesta, estado } = req.body;
    const solicitud = await prisma.solicitud.update({
      where: { id: parseInt(id) },
      data: { respuesta, estado: estado || 'pendiente', empleadoId: req.usuario.empleado?.id || null }
    });
    res.json({ solicitud });
  } catch (error) { next(error); }
};