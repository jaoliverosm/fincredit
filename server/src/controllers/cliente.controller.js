import { prisma } from '../app.js';

const getClientesFilter = (req) => {
  if (req.rol === 'supervisor') return {};
  if (req.rol === 'empleado') return { empleadoId: req.usuario.empleado?.id || 0 };
  return { id: req.usuario.cliente?.id || 0 };
};

export const getClientes = async (req, res, next) => {
  try {
    const where = getClientesFilter(req);
    const clientes = await prisma.cliente.findMany({
      where,
      include: { usuario: true, empleado: { include: { usuario: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ clientes });
  } catch (error) { next(error); }
};

export const createCliente = async (req, res, next) => {
  try {
    const { nombre, email, password, cedula, telefono } = req.body;
    const empleadoId = req.rol === 'empleado' ? req.usuario.empleado?.id : req.body.empleadoId;
    const hashedPassword = await bcrypt.hash(password, 10);

    const usuario = await prisma.usuario.create({
      data: { nombre, email, password: hashedPassword, rol: 'cliente' }
    });

    const cliente = await prisma.cliente.create({
      data: {
        usuarioId: usuario.id, cedula, telefono,
        empleadoId: parseInt(empleadoId) || null
      }
    });

    res.status(201).json({ cliente, usuario });
  } catch (error) { next(error); }
};

export const getClienteById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cliente = await prisma.cliente.findUnique({
      where: { id: parseInt(id) },
      include: { usuario: true, empleado: { include: { usuario: true } } }
    });
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });

    if (req.rol === 'empleado' && cliente.empleadoId !== req.usuario.empleado?.id)
      return res.status(403).json({ error: 'No tiene acceso a este cliente' });
    if (req.rol === 'cliente' && cliente.usuarioId !== req.usuarioId)
      return res.status(403).json({ error: 'No tiene acceso a este cliente' });

    res.json({ cliente });
  } catch (error) { next(error); }
};

export const updateCliente = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { cedula, telefono, estado } = req.body;
    const cliente = await prisma.cliente.update({
      where: { id: parseInt(id) },
      data: { cedula, telefono, estado },
      include: { usuario: true }
    });
    res.json({ cliente });
  } catch (error) { next(error); }
};