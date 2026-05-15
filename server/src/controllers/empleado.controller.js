import { prisma } from '../app.js';
import { generateEmail, generatePassword } from '../utils/generateEmail.js';

export const getEmpleados = async (req, res, next) => {
  try {
    const empleados = await prisma.empleado.findMany({
      include: { usuario: true, recursos: true },
      orderBy: { id: 'desc' }
    });
    res.json({ empleados });
  } catch (error) { next(error); }
};

export const createEmpleado = async (req, res, next) => {
  try {
    let { nombre, email, password, telefono, meta, direccion, fechaNacimiento, fotoUrl, hojaDeVidaUrl, cedula } = req.body;

    if (!nombre || nombre.trim().split(/\s+/).length < 2) {
      return res.status(400).json({ error: 'Debe ingresar nombre y al menos un apellido' });
    }

    if (!email) {
      email = generateEmail(nombre);
      let existing = await prisma.usuario.findUnique({ where: { email } });
      if (existing) {
        const base = email.replace(/@.*$/, '');
        email = base + (Math.floor(Math.random() * 999) + 1) + '@fincredit.com';
      }
    }

    if (!password) password = generatePassword(cedula, nombre);
    const hashedPassword = await bcrypt.hash(password, 10);

    const usuario = await prisma.usuario.create({
      data: { nombre, email, password: hashedPassword, rol: 'empleado' }
    });

    const empleado = await prisma.empleado.create({
      data: {
        usuarioId: usuario.id, cedula, telefono, meta: parseFloat(meta) || 0,
        direccion, fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null,
        fotoUrl, hojaDeVidaUrl
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
      include: { usuario: true, recursos: true }
    });
    if (!empleado) return res.status(404).json({ error: 'Empleado no encontrado' });
    res.json({ empleado });
  } catch (error) { next(error); }
};

export const updateEmpleado = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { telefono, meta, direccion, fechaNacimiento, fotoUrl, hojaDeVidaUrl, nombre, email } = req.body;

    if (nombre || email) {
      await prisma.usuario.update({
        where: { id: parseInt(id) },
        data: { ...(nombre && { nombre }), ...(email && { email }) }
      });
    }

    const empleado = await prisma.empleado.update({
      where: { id: parseInt(id) },
      data: {
        ...(telefono !== undefined && { telefono }),
        ...(meta !== undefined && { meta: parseFloat(meta) }),
        ...(direccion !== undefined && { direccion }),
        ...(fechaNacimiento !== undefined && { fechaNacimiento: new Date(fechaNacimiento) }),
        ...(fotoUrl !== undefined && { fotoUrl }),
        ...(hojaDeVidaUrl !== undefined && { hojaDeVidaUrl })
      },
      include: { usuario: true, recursos: true }
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

export const uploadFoto = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No se ha seleccionado ningún archivo' });
    const { id } = req.params;
    const fotoUrl = '/uploads/empleados/' + req.file.filename;
    const empleado = await prisma.empleado.update({
      where: { id: parseInt(id) },
      data: { fotoUrl },
      include: { usuario: true }
    });
    res.json({ empleado, fotoUrl });
  } catch (error) { next(error); }
};

export const uploadHojaDeVida = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No se ha seleccionado ningún archivo' });
    const { id } = req.params;
    const hojaDeVidaUrl = '/uploads/empleados/' + req.file.filename;
    const empleado = await prisma.empleado.update({
      where: { id: parseInt(id) },
      data: { hojaDeVidaUrl },
      include: { usuario: true }
    });
    res.json({ empleado, hojaDeVidaUrl });
  } catch (error) { next(error); }
};

export const generarPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const newPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const empleado = await prisma.empleado.findUnique({
      where: { id: parseInt(id) },
      include: { usuario: true }
    });
    if (!empleado) return res.status(404).json({ error: 'Empleado no encontrado' });

    await prisma.usuario.update({
      where: { id: empleado.usuarioId },
      data: { password: hashedPassword }
    });

    res.json({ password: newPassword });
  } catch (error) { next(error); }
};

export const getRecursos = async (req, res, next) => {
  try {
    const { id } = req.params;
    const recursos = await prisma.recursoAsignado.findMany({
      where: { empleadoId: parseInt(id) },
      orderBy: { fechaAsignacion: 'desc' }
    });
    res.json({ recursos });
  } catch (error) { next(error); }
};

export const createRecurso = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tipo, nombre, descripcion } = req.body;
    if (!tipo || !nombre) return res.status(400).json({ error: 'Tipo y nombre son requeridos' });

    const recurso = await prisma.recursoAsignado.create({
      data: { empleadoId: parseInt(id), tipo, nombre, descripcion }
    });
    res.status(201).json({ recurso });
  } catch (error) { next(error); }
};

export const deleteRecurso = async (req, res, next) => {
  try {
    const { id, recursoId } = req.params;
    await prisma.recursoAsignado.deleteMany({
      where: { id: parseInt(recursoId), empleadoId: parseInt(id) }
    });
    res.json({ message: 'Recurso desasignado' });
  } catch (error) { next(error); }
};
