import { prisma } from '../app.js';

export const getConfig = async (req, res, next) => {
  try {
    let config = await prisma.configuracion.findFirst({ orderBy: { id: 'desc' } });
    if (!config) {
      config = await prisma.configuracion.create({
        data: { tasaDefault: 2.5, cuotasMax: 36, cuotasMin: 1, montoMaxPrestamo: 50000000, montoMinPrestamo: 100000, nombreEmpresa: 'FinCredit', moneda: 'COP' }
      });
    }
    res.json({ config });
  } catch (error) { next(error); }
};

export const updateConfig = async (req, res, next) => {
  try {
    const { tasaDefault, cuotasMax, cuotasMin, montoMaxPrestamo, montoMinPrestamo, nombreEmpresa, moneda } = req.body;
    const config = await prisma.configuracion.findFirst({ orderBy: { id: 'desc' } });
    const updated = await prisma.configuracion.update({
      where: { id: config.id },
      data: { tasaDefault, cuotasMax: parseInt(cuotasMax), cuotasMin: parseInt(cuotasMin), montoMaxPrestamo: parseFloat(montoMaxPrestamo), montoMinPrestamo: parseFloat(montoMinPrestamo), nombreEmpresa, moneda }
    });
    res.json({ config: updated });
  } catch (error) { next(error); }
};