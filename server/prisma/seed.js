import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Iniciando seed...');

  // 1. Limpiar datos existentes
  await prisma.pago.deleteMany();
  await prisma.ventaCredito.deleteMany();
  await prisma.prestamo.deleteMany();
  await prisma.solicitud.deleteMany();
  await prisma.empleado.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.articulo.deleteMany();
  await prisma.configuracion.deleteMany();
  await prisma.usuario.deleteMany();

  // 2. Crear configuración
  const config = await prisma.configuracion.create({
    data: {
      tasaDefault: 2.5,
      cuotasMax: 36,
      cuotasMin: 1,
      montoMaxPrestamo: 50000000,
      montoMinPrestamo: 100000,
      nombreEmpresa: 'FinCredit',
      moneda: 'COP'
    }
  });
  console.log('✅ Configuración creada');

  // 3. Crear superusuario
  const hashedPass = await bcrypt.hash('admin123', 10);
  const admin = await prisma.usuario.create({
    data: { nombre: 'Admin', email: 'admin@fincredit.com', password: hashedPass, rol: 'supervisor' }
  });
  console.log('✅ Admin creado: admin@fincredit.com / admin123');

  // 4. Crear empleados
  const pass1 = await bcrypt.hash('empleado1', 10);
  const empUser1 = await prisma.usuario.create({
    data: { nombre: 'Juan Pérez', email: 'juan@fincredit.com', password: pass1, rol: 'empleado' }
  });
  const emp1 = await prisma.empleado.create({ data: { usuarioId: empUser1.id, telefono: '3001234567', meta: 5000000 } });

  const pass2 = await bcrypt.hash('empleado2', 10);
  const empUser2 = await prisma.usuario.create({
    data: { nombre: 'María López', email: 'maria@fincredit.com', password: pass2, rol: 'empleado' }
  });
  const emp2 = await prisma.empleado.create({ data: { usuarioId: empUser2.id, telefono: '3009876543', meta: 5000000 } });

  // 5. Crear clientes
  const passC1 = await bcrypt.hash('cliente1', 10);
  const cli1 = await prisma.usuario.create({
    data: { nombre: 'Carlos García', email: 'carlos@gmail.com', password: passC1, rol: 'cliente' }
  });
  const cliente1 = await prisma.cliente.create({ data: { usuarioId: cli1.id, cedula: '1000000001', telefono: '3101112222', empleadoId: empUser1.id, estado: 'activo' } });

  const passC2 = await bcrypt.hash('cliente2', 10);
  const cli2 = await prisma.usuario.create({
    data: { nombre: 'Ana Martínez', email: 'ana@gmail.com', password: passC2, rol: 'cliente' }
  });
  const cliente2 = await prisma.cliente.create({ data: { usuarioId: cli2.id, cedula: '1000000002', telefono: '3203334444', empleadoId: empUser2.id, estado: 'activo' } });

  console.log('✅ Empleados y clientes creados');

  // 6. Crear artículos
  await prisma.articulo.createMany({
    data: [
      { nombre: 'Laptop HP', descripcion: 'Laptop HP 15 pulgadas', categoria: 'Tecnología', precio: 2500000, stock: 10 },
      { nombre: 'Smartphone Samsung', descripcion: 'Samsung Galaxy A54', categoria: 'Tecnología', precio: 1200000, stock: 20 },
      { nombre: 'Refrigeradora', descripcion: 'Nevera No Frost 430L', categoria: 'Electrodomésticos', precio: 1800000, stock: 5 },
      { nombre: 'Lavadora', descripcion: 'Lavadora de 9kg', categoria: 'Electrodomésticos', precio: 1500000, stock: 8 },
      { nombre: 'Televisor 55"', descripcion: 'Smart TV 55 pulgadas', categoria: 'Tecnología', precio: 1400000, stock: 15 },
      { nombre: 'Motocicleta', descripcion: 'Moto 125cc', categoria: 'Transporte', precio: 4500000, stock: 3 },
      { nombre: 'Bicicleta', descripcion: 'Bicicleta MTB 29"', categoria: 'Deportes', precio: 800000, stock: 12 },
      { nombre: 'Sofá', descripcion: 'Sofá en L cuero sintético', categoria: 'Hogar', precio: 900000, stock: 6 },
      { nombre: 'Juego de Comedor', descripcion: 'Juego mesa + 4 sillas', categoria: 'Hogar', precio: 1100000, stock: 4 },
      { nombre: 'Celular iPhone', descripcion: 'iPhone 13 128GB', categoria: 'Tecnología', precio: 3200000, stock: 7 }
    ]
  });
  console.log('✅ 10 artículos creados');

  // 7. Crear préstamos de muestra
  const inicio = new Date();
  inicio.setMonth(inicio.getMonth() - 2);

  const cuota1 = Math.round(2500000 * (0.025 / 12 * Math.pow(1 + 0.025 / 12, 12)) / (Math.pow(1 + 0.025 / 12, 12) - 1));
  const prest1 = await prisma.prestamo.create({
    data: {
      clienteId: cliente1.id, empleadoId: empUser1.id, monto: 2500000, interes: 2.5, cuotas: 12,
      cuotaMensual: cuota1, fechaInicio: inicio, pagado: cuota1 * 2,
      fechaVencimiento: new Date(inicio.getTime() + 12 * 30 * 86400000), estado: 'activo'
    }
  });

  const cuota2 = Math.round(1200000 * (0.025 / 12 * Math.pow(1 + 0.025 / 12, 24)) / (Math.pow(1 + 0.025 / 12, 24) - 1));
  const prest2 = await prisma.prestamo.create({
    data: {
      clienteId: cliente2.id, empleadoId: empUser2.id, monto: 1200000, interes: 2.5, cuotas: 24,
      cuotaMensual: cuota2, fechaInicio: inicio, pagado: cuota2,
      fechaVencimiento: new Date(inicio.getTime() + 24 * 30 * 86400000), estado: 'activo'
    }
  });

  // Préstamo en mora
  const inicioMora = new Date();
  inicioMora.setMonth(inicioMora.getMonth() - 6);
  const cuota3 = Math.round(3200000 * (0.03 / 12 * Math.pow(1 + 0.03 / 12, 18)) / (Math.pow(1 + 0.03 / 12, 18) - 1));
  const prest3 = await prisma.prestamo.create({
    data: {
      clienteId: cliente1.id, empleadoId: empUser1.id, monto: 3200000, interes: 3, cuotas: 18,
      cuotaMensual: cuota3, fechaInicio: inicioMora, pagado: cuota3,
      fechaVencimiento: new Date(inicioMora.getTime() + 18 * 30 * 86400000), estado: 'activo'
    }
  });

  console.log('✅ Préstamos de muestra creados');

  // 8. Crear ventas de muestra
  const cuotaVenta = Math.round(2500000 * (0.02 / 12 * Math.pow(1 + 0.02 / 12, 12)) / (Math.pow(1 + 0.02 / 12, 12) - 1));
  // obtener un artículo para la venta
  const art1 = await prisma.articulo.findFirst({ where: { nombre: 'Laptop HP' } });
  const venta1 = await prisma.ventaCredito.create({
    data: {
      clienteId: cliente1.id, empleadoId: empUser1.id, articuloId: art1.id, cantidad: 1,
      precioUnitario: 2500000, precioTotal: 2500000, interes: 2, cuotas: 12,
      cuotaMensual: cuotaVenta, pagado: cuotaVenta * 3,
      fechaVencimiento: new Date(Date.now() + 12 * 30 * 86400000), estado: 'activo'
    }
  });

  console.log('✅ Ventas de muestra creadas');

  // 9. Crear pagos de muestra
  await prisma.pago.createMany({
    data: [
      { tipo: 'prestamo', referenciaId: prest1.id, prestamoId: prest1.id, ventaId: null, clienteId: cliente1.id, empleadoId: empUser1.id, monto: cuota1, metodo: 'efectivo', observacion: 'Pago cuota 1' },
      { tipo: 'prestamo', referenciaId: prest1.id, prestamoId: prest1.id, ventaId: null, clienteId: cliente1.id, empleadoId: empUser1.id, monto: cuota1, metodo: 'transferencia', observacion: 'Pago cuota 2' },
      { tipo: 'prestamo', referenciaId: prest2.id, prestamoId: prest2.id, ventaId: null, clienteId: cliente2.id, empleadoId: empUser2.id, monto: cuota2, metodo: 'efectivo', observacion: 'Pago cuota 1' }
    ]
  });
  console.log('✅ Pagos de muestra creados');

  // 10. Crear solicitudes de muestra
  await prisma.solicitud.createMany({
    data: [
      { clienteId: cliente1.id, empleadoId: empUser1.id, creadoPorId: cli1.id, tipo: 'nuevo_prestamo', monto: 5000000, cuotas: 12, mensaje: 'Necesito un préstamo para negocio' },
      { clienteId: cliente2.id, creadoPorId: cli2.id, tipo: 'ampliacion', mensaje: 'Quiero ampliar mi préstamo actual' }
    ]
  });
  console.log('✅ Solicitudes de muestra creadas');

  console.log('\\n🎉 Seed completado exitosamente!');
  console.log('Admin: admin@fincredit.com / admin123');
  console.log('Empleado 1: juan@fincredit.com / empleado1');
  console.log('Empleado 2: maria@fincredit.com / empleado2');
  console.log('Cliente 1: carlos@gmail.com / cliente1');
  console.log('Cliente 2: ana@gmail.com / cliente2');
}

seed()
  .catch(e => { console.error('Error:', e); process.exit(1); })
  .finally(() => process.exit(0));