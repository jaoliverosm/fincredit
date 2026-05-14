/**
 * Re-exports de funciones de cálculo desde services
 */

export {
  calcularCuotaMensual,
  calcularTotalPagar,
  calcularTotalIntereses,
  calcularFechaVencimiento,
  calcularMoraDiaria,
  generarTablaAmortizacion,
  estaEnMora,
  calcularDiasRetraso,
  calcularPrecioVentaCredito,
  validarPoliticasPrestamo
} from '../services/calculos.service.js';

import { prisma } from '../db.js';

export async function descontarStock(articuloId, cantidad) {
  const art = await prisma.articulo.findUnique({ where: { id: articuloId } });
  if (!art || art.stock < cantidad) return false;
  await prisma.articulo.update({
    where: { id: articuloId },
    data: { stock: { decrement: cantidad } }
  });
  return true;
}