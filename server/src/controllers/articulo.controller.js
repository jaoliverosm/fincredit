import { prisma } from '../app.js';

export const getArticulos = async (req, res, next) => {
  try {
    const { activo, categoria, search } = req.query;
    const where = {};
    if (activo !== undefined) where.activo = activo === 'true';
    if (categoria) where.categoria = categoria;
    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { descripcion: { contains: search, mode: 'insensitive' } }
      ];
    }
    const articulos = await prisma.articulo.findMany({ where, orderBy: { id: 'desc' } });
    res.json({ articulos });
  } catch (error) { next(error); }
};

export const createArticulo = async (req, res, next) => {
  try {
    const { nombre, descripcion, categoria, precio, stock, imagen } = req.body;
    const articulo = await prisma.articulo.create({
      data: { nombre, descripcion, categoria, precio: parseFloat(precio), stock: parseInt(stock) || 0, imagen }
    });
    res.status(201).json({ articulo });
  } catch (error) { next(error); }
};

export const getArticuloById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const articulo = await prisma.articulo.findUnique({ where: { id: parseInt(id) } });
    if (!articulo) return res.status(404).json({ error: 'Articulo no encontrado' });
    res.json({ articulo });
  } catch (error) { next(error); }
};

export const updateArticulo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, categoria, precio, stock, imagen, activo } = req.body;
    const articulo = await prisma.articulo.update({
      where: { id: parseInt(id) },
      data: { nombre, descripcion, categoria, precio: parseFloat(precio), stock: parseInt(stock), imagen, activo }
    });
    res.json({ articulo });
  } catch (error) { next(error); }
};

export const deleteArticulo = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.articulo.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Articulo eliminado correctamente' });
  } catch (error) { next(error); }
};

export const ajustarStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { cantidad, tipo } = req.body;
    const articulo = await prisma.articulo.findUnique({ where: { id: parseInt(id) } });
    if (!articulo) return res.status(404).json({ error: 'Articulo no encontrado' });

    let nuevoStock = articulo.stock;
    if (tipo === 'sumar') nuevoStock += parseInt(cantidad);
    else if (tipo === 'restar') nuevoStock -= parseInt(cantidad);
    else nuevoStock = parseInt(cantidad);

    if (nuevoStock < 0) return res.status(400).json({ error: 'Stock no puede ser negativo' });

    const updated = await prisma.articulo.update({ where: { id: parseInt(id) }, data: { stock: nuevoStock } });
    res.json({ articulo: updated });
  } catch (error) { next(error); }
};

export const descontarStock = async (articuloId, cantidad) => {
  const articulo = await prisma.articulo.findUnique({ where: { id: articuloId } });
  if (!articulo || articulo.stock < cantidad) return false;
  await prisma.articulo.update({ where: { id: articuloId }, data: { stock: articulo.stock - cantidad } });
  return true;
};