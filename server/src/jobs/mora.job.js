import { prisma } from '../app.js';
import cron from 'node-cron';

export const moraJob = {
  task: null,

  async checkMora() {
    try {
      const now = new Date();
      console.log('[Mora Job] Ejecutando revisión de mora...', now.toISOString());

      // Revisar préstamos vencidos
      const prestamosVencidos = await prisma.prestamo.findMany({
        where: {
          estado: 'activo',
          fechaVencimiento: { lt: now },
          pagado: { lt: prisma.prestamo.fields.monto }
        }
      });

      for (const prestamo of prestamosVencidos) {
        await prisma.prestamo.update({
          where: { id: prestamo.id },
          data: { estado: 'mora' }
        });
        console.log(`[Mora] Préstamo #${prestamo.id} marcado como mora`);
      }

      // Revisar ventas vencidas
      const ventasVencidas = await prisma.ventaCredito.findMany({
        where: {
          estado: 'activo',
          fechaVencimiento: { lt: now },
          pagado: { lt: prisma.ventaCredito.fields.precioTotal }
        }
      });

      for (const venta of ventasVencidas) {
        await prisma.ventaCredito.update({
          where: { id: venta.id },
          data: { estado: 'mora' }
        });
        console.log(`[Mora] Venta #${venta.id} marcada como mora`);
      }

      console.log(`[Mora Job] Finalizado. Revisados ${prestamosVencidos.length} préstamos y ${ventasVencidas.length} ventas.`);
    } catch (error) {
      console.error('[Mora Job] Error:', error.message);
    }
  },

  start() {
    // Ejecuta cada noche a las 11:59 PM
    this.task = cron.schedule('59 23 * * *', () => {
      this.checkMora();
    });
    console.log('[Mora Job] Iniciado. Revisión programada cada noche a las 11:59 PM');

    // Ejecutar inmediatamente para pruebas
    this.checkMora();
  },

  stop() {
    if (this.task) {
      this.task.stop();
      console.log('[Mora Job] Detenido');
    }
  }
};