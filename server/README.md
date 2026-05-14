# FinCredit Backend

Sistema de gestión de créditos con Node.js, Express, Prisma y SQLite.

## 🚀 Características

- **Autenticación JWT**: Sistema seguro de login con tokens
- **Roles de Usuario**: Supervisor, Empleado, Cliente con permisos específicos
- **CRUD Completo**: Gestión de empleados, clientes, préstamos, artículos, ventas, pagos
- **Cálculos Financieros**: Cuotas, intereses, mora automática
- **Dashboard por Rol**: Métricas específicas según el rol del usuario
- **API RESTful**: Endpoints bien documentados y consistentes
- **Testing**: Suite de pruebas unitarias con Jest
- **Docker**: Contenerización lista para producción
- **Logging**: Sistema de logs estructurado

## 📋 Requisitos

- Node.js 18+
- npm o yarn
- SQLite (incluido)

## 🛠️ Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repositorio-url>
   cd fincredit/server
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   ```
   Editar `.env` con tus configuraciones:
   ```env
   DATABASE_URL="file:./prisma/dev.db"
   JWT_SECRET="tu-super-secret-jwt-key"
   JWT_EXPIRES_IN="8h"
   PORT=3001
   FRONTEND_URL="http://localhost:3000"
   ```

4. **Generar Prisma Client**
   ```bash
   npm run prisma:generate
   ```

5. **Ejecutar migraciones**
   ```bash
   npm run prisma:migrate
   ```

6. **Seed de datos iniciales**
   ```bash
   npm run prisma:seed
   ```

## 🏃‍♂️ Ejecución

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm start
```

## 📊 Base de Datos

### Modelo de Datos
- **Usuario**: Base para todos los roles
- **Empleado**: Extiende Usuario con datos de empleado
- **Cliente**: Extiende Usuario con datos de cliente
- **Préstamo**: Préstamos con cálculo de cuotas
- **Artículo**: Catálogo de productos
- **VentaCredito**: Ventas a crédito
- **Pago**: Registro de pagos
- **Solicitud**: Solicitudes de clientes

### Relaciones
- Usuario → Empleado/Cliente (1:1)
- Empleado → Clientes (1:N)
- Cliente → Préstamos/Ventas/Pagos (1:N)
- Artículo → Ventas (1:N)

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Servidor con hot reload
npm run test             # Ejecutar tests
npm run test:watch       # Tests en modo watch
npm run test:coverage    # Tests con cobertura

# Base de Datos
npm run prisma:generate  # Generar Prisma Client
npm run prisma:migrate    # Ejecutar migraciones
npm run prisma:seed      # Seed de datos

# Producción
npm start                # Iniciar servidor
```

## 🧪 Testing

### Ejecutar todos los tests
```bash
npm test
```

### Ejecutar tests específicos
```bash
npm test -- --testPathPatterns="auth.test.js"
```

### Ver cobertura de código
```bash
npm run test:coverage
```

## 📚 Documentación API

Ver [docs/API.md](docs/API.md) para documentación completa de la API.

## 🐳 Docker

### Build imagen
```bash
docker build -t fincredit-server .
```

### Ejecutar contenedor
```bash
docker run -d \
  --name fincredit-server \
  -p 3001:3001 \
  --env-file .env \
  fincredit-server
```

### Docker Compose
```bash
docker-compose up -d
```

## 🔒 Variables de Entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `DATABASE_URL` | URL de la base de datos | `file:./prisma/dev.db` |
| `JWT_SECRET` | Secreto para JWT tokens | Requerido |
| `JWT_EXPIRES_IN` | Expiración de tokens | `8h` |
| `PORT` | Puerto del servidor | `3001` |
| `FRONTEND_URL` | URL del frontend | `http://localhost:3000` |
| `NODE_ENV` | Entorno de ejecución | `development` |

## 🏗️ Estructura del Proyecto

```
server/
├── src/
│   ├── controllers/     # Controladores de la API
│   ├── middlewares/      # Middlewares (auth, roles, errors)
│   ├── routes/          # Definición de rutas
│   ├── services/        # Lógica de negocio
│   ├── utils/           # Utilidades reutilizables
│   └── app.js           # Aplicación principal
├── prisma/
│   ├── schema.prisma    # Esquema de base de datos
│   └── seed.js          # Datos iniciales
├── tests/               # Tests unitarios
├── docs/                # Documentación
├── scripts/             # Scripts de mantenimiento
└── docker-compose.yml   # Configuración Docker
```

## 🔧 Utilidades Disponibles

### Response Utils
```javascript
import { success, error, validation, paginated } from './utils/response.util.js';

// Respuesta exitosa
return success(res, data, 'Operación exitosa');

// Respuesta de error
return error(res, 'Error del servidor', 500);

// Validación
return validation(res, errors, 'Datos inválidos');

// Paginación
return paginated(res, data, pagination, 'Datos obtenidos');
```

### Validation Utils
```javascript
import { isValidEmail, isValidPhone, isValidAmount } from './utils/validation.util.js';

if (!isValidEmail(email)) {
  return validation(res, [], 'Email inválido');
}
```

### Error Handling
```javascript
import { asyncHandler } from './utils/error.util.js';

const myFunction = asyncHandler(async (req, res) => {
  // Lógica automática de manejo de errores
});
```

## 🎯 Roles y Permisos

### SUPERVISOR
- ✅ Acceso completo a todos los recursos
- ✅ Crear y gestionar empleados
- ✅ Configuración global del sistema
- ✅ Ver todos los clientes y préstamos

### EMPLEADO
- ✅ Gestionar sus clientes asignados
- ✅ Crear y gestionar préstamos/ventas
- ✅ Ver métricas de su desempeño
- ❌ No puede gestionar otros empleados

### CLIENTE
- ✅ Ver su propia información
- ✅ Ver sus préstamos y pagos
- ✅ Crear solicitudes
- ❌ No puede ver otros clientes

## 📈 Métricas y Dashboards

### Dashboard Supervisor
- Total de clientes, empleados, préstamos, ventas
- Cartera total y morosidad
- Actividad reciente

### Dashboard Empleado
- Clientes asignados
- Préstamos y ventas gestionadas
- Metas y comisiones

### Dashboard Cliente
- Resumen de préstamos activos
- Historial de pagos
- Estado de solicitudes

## 🔄 Flujo de Trabajo

1. **Setup inicial**: Instalación y configuración
2. **Seed de datos**: Crear usuarios de prueba
3. **Login**: Obtener token JWT
4. **Operaciones CRUD**: Usar endpoints según rol
5. **Dashboards**: Ver métricas específicas

## 🚨 Manejo de Errores

La API utiliza un formato de error consistente:
```json
{
  "success": false,
  "message": "Descripción del error",
  "error": "ERROR_CODE"
}
```

### Códigos de Error Comunes
- `VALIDATION_ERROR`: Datos inválidos
- `AUTHENTICATION_ERROR`: No autenticado
- `AUTHORIZATION_ERROR`: Sin permisos
- `NOT_FOUND`: Recurso no encontrado
- `INTERNAL_ERROR`: Error del servidor

## 📝 Logging

El sistema incluye logging estructurado:
```javascript
import { authLogger, appLogger } from './utils/logger.util.js';

authLogger.login(userId, email, ip);
appLogger.info('Operación completada', { userId, action });
```

## 🔄 Migraciones y Seed

### Crear nueva migración
```bash
npx prisma migrate dev --name "nombre-migracion"
```

### Resetear base de datos
```bash
npx prisma migrate reset --force
```

### Generar seed
```bash
npm run prisma:seed
```

## 🛡️ Seguridad

- **JWT tokens**: Autenticación segura
- **Password hashing**: bcryptjs
- **Rate limiting**: Límite de solicitudes
- **CORS**: Configuración para frontend
- **Input validation**: Validación de datos

## 📞 Soporte

Para soporte técnico:
1. Revisar logs del servidor
2. Verificar configuración de variables de entorno
3. Consultar documentación de la API
4. Revisar tests para ejemplos de uso

## 🤝 Contribución

1. Fork del repositorio
2. Crear feature branch
3. Hacer commits descriptivos
4. Ejecutar tests
5. Crear Pull Request

## 📄 Licencia

MIT License - Ver archivo LICENSE para detalles.
