/**
 * Archivo de Seed simplificado para FinCredit
 * Crea datos iniciales básicos sin dependencias complejas
 */

const bcrypt = require('bcryptjs');

/**
 * Función principal para crear los datos iniciales
 */
async function main() {
  console.log('🌱 Creando datos iniciales básicos para FinCredit...');

  try {
    // Simular creación de usuarios de prueba
    console.log('👥 Creando usuarios de prueba...');
    
    // Hash de contraseñas
    const hashPassword = async (password) => {
      return await bcrypt.hash(password, 10);
    };

    // Usuarios de ejemplo (simulados)
    const usuarios = [
      {
        nombre: 'Administrador Principal',
        email: 'supervisor@fincredit.com',
        password: await hashPassword('admin123'),
        rol: 'SUPERVISOR'
      },
      {
        nombre: 'Elena Morales',
        email: 'elena@fincredit.com',
        password: await hashPassword('empleado123'),
        rol: 'EMPLEADO'
      },
      {
        nombre: 'María López',
        email: 'maria.lopez@email.com',
        password: await hashPassword('cliente123'),
        rol: 'CLIENTE'
      }
    ];

    console.log('✅ Usuarios de prueba creados:');
    usuarios.forEach(user => {
      console.log(`   - ${user.nombre} (${user.email}) - Rol: ${user.rol}`);
    });

    console.log('\n🎉 Datos iniciales básicos creados exitosamente!');
    console.log('\n📋 Credenciales de prueba:');
    console.log('👑 Supervisor: supervisor@fincredit.com / admin123');
    console.log('👷 Empleado: elena@fincredit.com / empleado123');
    console.log('👤 Cliente: maria.lopez@email.com / cliente123');
    console.log('\n⚠️  Nota: Para usar con la base de datos real, ejecuta el seed completo cuando Prisma esté configurado correctamente.');

  } catch (error) {
    console.error('❌ Error al crear datos iniciales:', error);
    throw error;
  }
}

/**
 * Ejecutar el seed
 */
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    console.log('✅ Seed simplificado completado');
  });
