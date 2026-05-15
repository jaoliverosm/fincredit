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
    const { tasaDefault, cuotasMax, cuotasMin, montoMaxPrestamo, montoMinPrestamo, nombreEmpresa, moneda, logoUrl } = req.body;
    const config = await prisma.configuracion.findFirst({ orderBy: { id: 'desc' } });
    const updated = await prisma.configuracion.update({
      where: { id: config.id },
      data: {
        tasaDefault: tasaDefault !== undefined ? parseFloat(tasaDefault) : config.tasaDefault,
        cuotasMax: cuotasMax !== undefined ? parseInt(cuotasMax) : config.cuotasMax,
        cuotasMin: cuotasMin !== undefined ? parseInt(cuotasMin) : config.cuotasMin,
        montoMaxPrestamo: montoMaxPrestamo !== undefined ? parseFloat(montoMaxPrestamo) : config.montoMaxPrestamo,
        montoMinPrestamo: montoMinPrestamo !== undefined ? parseFloat(montoMinPrestamo) : config.montoMinPrestamo,
        nombreEmpresa: nombreEmpresa !== undefined ? nombreEmpresa : config.nombreEmpresa,
        moneda: moneda !== undefined ? moneda : config.moneda,
        logoUrl: logoUrl !== undefined ? logoUrl : config.logoUrl
      }
    });
    res.json({ config: updated });
  } catch (error) { next(error); }
};

export const uploadLogo = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No se ha seleccionado ningún archivo' });

    const logoUrl = '/uploads/' + req.file.filename;
    const config = await prisma.configuracion.findFirst({ orderBy: { id: 'desc' } });
    const updated = await prisma.configuracion.update({
      where: { id: config.id },
      data: { logoUrl }
    });
    res.json({ config: updated, logoUrl });
  } catch (error) { next(error); }
};
