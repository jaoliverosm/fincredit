import { prisma } from '../app.js';
import { generateEmail, generatePassword } from '../utils/generateEmail.js';

export const getEmpleados = async (req, res, next) => {
  try {
    const empleados = await prisma.empleado.findMany({
      include: { usuario: true },
      orderBy: { id: 'desc' }
    });
    res.json({ empleados });
  } catch (error) { next(error); }
};

export const createEmpleado = async (req, res, next) => {
  try {
    let { nombre, email, password, telefono } = req.body;

    if (!nombre || nombre.trim().split(/\s+/).length < 2) {
      return res.status(400).json({ error: 'Debe ingresar nombre y al menos un apellido' });
    }

    if (!email) {
      email = generateEmail(nombre);
      const existing = await prisma.usuario.findUnique({ where: { email } });
      if (existing) {
        email = email.replace('@', (Math.floor(Math.random() * 100) + 1) + '@');
      }
    }

    if (!password) {
      password = generatePassword();
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const usuario = await prisma.usuario.create({
      data: { nombre, email, password: hashedPassword, rol: 'empleado' }
    });

    const empleado = await prisma.empleado.create({
      data: {
        usuarioId: usuario.id,
        telefono,
        meta: parseFloat(req.body.meta) || 0
      }
    });

    res.status(201).json({ empleado, usuario, generatedPassword: password, generatedEmail: email });
  } catch (error) { next(error); }
};

export const getEmpleadoById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const empleado = await prisma.empleado.findUnique({
      where: { id: parseInt(id) },
      include: { usuario: true }
    });
    if (!empleado) return res.status(404).json({ error: 'Empleado no encontrado' });
    res.json({ empleado });
  } catch (error) { next(error); }
};

export const updateEmpleado = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { telefono, meta } = req.body;
    const empleado = await prisma.empleado.update({
      where: { id: parseInt(id) },
      data: { telefono, meta: parseFloat(meta) || 0 },
      include: { usuario: true }
    });
    res.json({ empleado });
  } catch (error) { next(error); }
};

export const getEmpleadoMetricas = async (req, res, next) => {
  try {
    const { id } = req.params;
    const empleadoId = parseInt(id);

    const [prestamos, ventas, clientes, pagos] = await Promise.all([
      prisma.prestamo.count({ where: { empleadoId } }),
      prisma.ventaCredito.count({ where: { empleadoId } }),
      prisma.cliente.count({ where: { empleadoId } }),
      prisma.pago.aggregate({ where: { empleadoId }, _sum: { monto: true } })
    ]);

    res.json({
      prestamosRegistrados: prestamos,
      ventasRegistradas: ventas,
      clientesAsignados: clientes,
      totalPagosRegistrados: pagos._sum.monto || 0
    });
  } catch (error) { next(error); }
};
