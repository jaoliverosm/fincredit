/**
 * Configuración de pruebas para FinCredit
 * Setup inicial para tests unitarios y de integración
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Cliente de Prisma para testing
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'file:./dev.db'
    }
  }
});

/**
 * Limpiar base de datos de testing
 */
const cleanDatabase = async () => {
  try {
    // Eliminar datos en orden inverso por relaciones
    await prisma.pago.deleteMany();
    await prisma.solicitud.deleteMany();
    await prisma.ventaCredito.deleteMany();
    await prisma.prestamo.deleteMany();
    await prisma.cliente.deleteMany();
    await prisma.empleado.deleteMany();
    await prisma.articulo.deleteMany();
    await prisma.usuario.deleteMany();
    await prisma.configuracion.deleteMany();
  } catch (error) {
    console.log('Error limpiando base de datos:', error.message);
  }
};

/**
 * Crear datos de prueba
 */
const createTestData = async () => {
  // Crear o actualizar configuración
  const config = await prisma.configuracion.upsert({
    where: { id: 1 },
    update: {},
    create: {
      tasaDefault: 15.0,
      cuotasMax: 24,
      cuotasMin: 1,
      montoMaxPrestamo: 10000000,
      montoMinPrestamo: 100000,
      nombreEmpresa: 'FinCredit Test',
      moneda: 'COP'
    }
  });

  // Crear usuarios de prueba
  const passwordHash = await bcrypt.hash('test123', 10);

  // Supervisor
  const supervisorUser = await prisma.usuario.upsert({
    where: { email: 'supervisor@test.com' },
    update: {},
    create: {
      nombre: 'Supervisor Test',
      email: 'supervisor@test.com',
      password: passwordHash,
      rol: 'SUPERVISOR',
      activo: true
    }
  });

  const supervisor = await prisma.empleado.upsert({
    where: { usuarioId: supervisorUser.id },
    update: {},
    create: {
      usuarioId: supervisorUser.id,
      telefono: '3001234567',
      meta: 5000000,
      fechaIngreso: new Date('2024-01-01')
    }
  });

  // Empleado
  const empleadoUser = await prisma.usuario.upsert({
    where: { email: 'empleado@test.com' },
    update: {},
    create: {
      nombre: 'Empleado Test',
      email: 'empleado@test.com',
      password: passwordHash,
      rol: 'EMPLEADO',
      activo: true
    }
  });

  const empleado = await prisma.empleado.upsert({
    where: { usuarioId: empleadoUser.id },
    update: {},
    create: {
      usuarioId: empleadoUser.id,
      telefono: '3002345678',
      meta: 3000000,
      fechaIngreso: new Date('2024-02-01')
    }
  });

  // Cliente
  const clienteUser = await prisma.usuario.upsert({
    where: { email: 'cliente@test.com' },
    update: {},
    create: {
      nombre: 'Cliente Test',
      email: 'cliente@test.com',
      password: passwordHash,
      rol: 'CLIENTE',
      activo: true
    }
  });

  const cliente = await prisma.cliente.upsert({
    where: { usuarioId: clienteUser.id },
    update: {},
    create: {
      usuarioId: clienteUser.id,
      cedula: '123456789',
      telefono: '3101234567',
      empleadoId: empleado.id,
      estado: 'ACTIVO'
    }
  });

  // Artículo
  const articulo = await prisma.articulo.create({
    data: {
      nombre: 'Artículo Test',
      descripcion: 'Descripción del artículo de prueba',
      categoria: 'Tecnología',
      precio: 1000000,
      stock: 10,
      activo: true
    }
  });

  return {
    supervisor: { user: supervisorUser, empleado: supervisor },
    empleado: { user: empleadoUser, empleado: empleado },
    cliente: { user: clienteUser, cliente: cliente },
    articulo
  };
};

/**
 * Generar token JWT para testing
 */
const generateTestToken = (user) => {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      rol: user.rol 
    },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
};

/**
 * Headers de autenticación para testing
 */
const getAuthHeaders = (user) => {
  const token = generateTestToken(user);
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

/**
 * Configuración inicial antes de cada test
 */
const setupTest = async () => {
  await cleanDatabase();
  const testData = await createTestData();
  return testData;
};

/**
 * Limpieza después de cada test
 */
const teardownTest = async () => {
  // No limpiar completamente para evitar problemas con otros tests
  // Solo limpiar datos de prueba específicos si es necesario
};

/**
 * Cerrar conexión con Prisma
 */
const closeConnection = async () => {
  await prisma.$disconnect();
};

module.exports = {
  prisma,
  cleanDatabase,
  createTestData,
  generateTestToken,
  getAuthHeaders,
  setupTest,
  teardownTest,
  closeConnection
};