# FinCredit API Documentation

## Overview
FinCredit es un sistema de gestión de créditos con backend Node.js + Express + Prisma + SQLite.

## Base URL
```
Development: http://localhost:3001/api
Production: https://your-domain.com/api
```

## Authentication
La API utiliza JWT (JSON Web Tokens) para autenticación.

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "nombre": "Juan Pérez",
      "email": "usuario@ejemplo.com",
      "rol": "SUPERVISOR",
      "activo": true
    }
  }
}
```

### Headers para endpoints protegidos
```http
Authorization: Bearer <token>
```

## Roles de Usuario
- **SUPERVISOR**: Acceso completo a todos los recursos
- **EMPLEADO**: Acceso limitado a sus clientes asignados
- **CLIENTE**: Acceso solo a su propia información

## Endpoints

### Autenticación

#### Obtener perfil de usuario
```http
GET /auth/profile
Authorization: Bearer <token>
```

#### Cerrar sesión
```http
POST /auth/logout
Authorization: Bearer <token>
```

#### Verificar token
```http
GET /auth/verify
Authorization: Bearer <token>
```

### Empleados

#### Obtener todos los empleados (Solo Supervisor)
```http
GET /empleados?page=1&limit=10&search=juan&activo=true
Authorization: Bearer <token>
```

#### Obtener empleado por ID
```http
GET /empleados/:id
Authorization: Bearer <token>
```

#### Crear empleado (Solo Supervisor)
```http
POST /empleados
Authorization: Bearer <token>
Content-Type: application/json

{
  "nombre": "María García",
  "email": "maria@ejemplo.com",
  "password": "contraseña123",
  "telefono": "3123456789",
  "meta": 2500000
}
```

#### Actualizar empleado
```http
PUT /empleados/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "nombre": "María García Actualizado",
  "telefono": "3123456789",
  "meta": 3000000,
  "activo": true
}
```

#### Cambiar contraseña de empleado
```http
PUT /empleados/:id/password
Authorization: Bearer <token>
Content-Type: application/json

{
  "passwordActual": "contraseña123",
  "passwordNuevo": "nuevaContraseña456"
}
```

#### Obtener métricas de empleado
```http
GET /empleados/:id/metricas
Authorization: Bearer <token>
```

### Clientes

#### Obtener clientes (con filtrado por rol)
```http
GET /clientes?page=1&limit=10&search=juan&estado=ACTIVO
Authorization: Bearer <token>
```

#### Obtener cliente por ID
```http
GET /clientes/:id
Authorization: Bearer <token>
```

#### Crear cliente
```http
POST /clientes
Authorization: Bearer <token>
Content-Type: application/json

{
  "nombre": "Carlos López",
  "email": "carlos@ejemplo.com",
  "password": "contraseña123",
  "cedula": "123456789",
  "telefono": "3112345678",
  "empleadoId": 1
}
```

#### Actualizar cliente
```http
PUT /clientes/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "nombre": "Carlos López Actualizado",
  "telefono": "3112345678",
  "estado": "ACTIVO"
}
```

### Préstamos

#### Obtener préstamos (con filtrado por rol)
```http
GET /prestamos?page=1&limit=10&estado=ACTIVO&search=carlos
Authorization: Bearer <token>
```

#### Obtener préstamo por ID
```http
GET /prestamos/:id
Authorization: Bearer <token>
```

#### Crear préstamo
```http
POST /prestamos
Authorization: Bearer <token>
Content-Type: application/json

{
  "clienteId": 1,
  "monto": 5000000,
  "interes": 15,
  "cuotas": 12,
  "observacion": "Préstamo para vehículo"
}
```

#### Aprobar préstamo
```http
PUT /prestamos/:id/aprobar
Authorization: Bearer <token>
```

#### Rechazar préstamo
```http
PUT /prestamos/:id/rechazar
Authorization: Bearer <token>
Content-Type: application/json

{
  "motivo": "Capacidad de pago insuficiente"
}
```

### Artículos

#### Obtener artículos
```http
GET /articulos?page=1&limit=10&search=laptop&categoria=Tecnología&activo=true
Authorization: Bearer <token>
```

#### Obtener artículo por ID
```http
GET /articulos/:id
Authorization: Bearer <token>
```

#### Crear artículo (Solo Supervisor/Empleado)
```http
POST /articulos
Authorization: Bearer <token>
Content-Type: application/json

{
  "nombre": "Laptop Dell Inspiron",
  "descripcion": "Laptop de 15 pulgadas, 8GB RAM, 256GB SSD",
  "categoria": "Tecnología",
  "precio": 2500000,
  "stock": 10
}
```

#### Actualizar artículo
```http
PUT /articulos/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "nombre": "Laptop Dell Inspiron 15",
  "precio": 2600000,
  "stock": 8,
  "activo": true
}
```

### Ventas a Crédito

#### Obtener ventas
```http
GET /ventas?page=1&limit=10&estado=ACTIVO&search=laptop
Authorization: Bearer <token>
```

#### Crear venta a crédito
```http
POST /ventas
Authorization: Bearer <token>
Content-Type: application/json

{
  "clienteId": 1,
  "articuloId": 1,
  "cantidad": 1,
  "interes": 10,
  "cuotas": 6,
  "observacion": "Venta con cuotas mensuales"
}
```

### Pagos

#### Obtener pagos
```http
GET /pagos?page=1&limit=10&tipo=PRESTAMO&search=carlos
Authorization: Bearer <token>
```

#### Registrar pago
```http
POST /pagos
Authorization: Bearer <token>
Content-Type: application/json

{
  "tipo": "PRESTAMO",
  "referenciaId": 1,
  "clienteId": 1,
  "monto": 500000,
  "metodo": "EFECTIVO",
  "observacion": "Pago cuota mensual"
}
```

### Solicitudes

#### Obtener solicitudes
```http
GET /solicitudes?page=1&limit=10&estado=PENDIENTE&tipo=NUEVO_PRESTAMO
Authorization: Bearer <token>
```

#### Crear solicitud
```http
POST /solicitudes
Authorization: Bearer <token>
Content-Type: application/json

{
  "tipo": "NUEVO_PRESTAMO",
  "monto": 3000000,
  "cuotas": 8,
  "mensaje": "Necesito préstamo para reparación de hogar"
}
```

#### Responder solicitud
```http
PUT /solicitudes/:id/responder
Authorization: Bearer <token>
Content-Type: application/json

{
  "respuesta": "Aprobado por capacidad de pago",
  "estado": "APROBADO"
}
```

### Dashboard

#### Obtener dashboard según rol
```http
GET /dashboard
Authorization: Bearer <token>
```

**Response para Supervisor:**
```json
{
  "success": true,
  "data": {
    "resumen": {
      "totalClientes": 150,
      "totalEmpleados": 8,
      "totalPrestamos": 75,
      "totalVentas": 120
    },
    "metricasFinancieras": {
      "totalCartera": 450000000,
      "totalPagado": 234000000,
      "totalPendiente": 216000000,
      "tasaMorosidad": 12.5
    },
    "actividadReciente": {
      "prestamosHoy": 3,
      "ventasHoy": 5,
      "pagosHoy": 12
    }
  }
}
```

### Configuración

#### Obtener configuración global (Solo Supervisor)
```http
GET /config
Authorization: Bearer <token>
```

#### Actualizar configuración (Solo Supervisor)
```http
PUT /config
Authorization: Bearer <token>
Content-Type: application/json

{
  "tasaDefault": 15,
  "cuotasMax": 36,
  "cuotasMin": 1,
  "montoMaxPrestamo": 50000000,
  "montoMinPrestamo": 100000
}
```

## Respuestas Estándar

### Success Response
```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Mensaje de error",
  "error": "ERROR_CODE"
}
```

### Validation Error
```json
{
  "success": false,
  "message": "Error de validación",
  "errors": [
    {
      "field": "email",
      "message": "Email inválido"
    }
  ]
}
```

### Paginated Response
```json
{
  "success": true,
  "message": "Datos obtenidos",
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "totalPages": 15
  }
}
```

## Códigos de Error Comunes

- **400**: Bad Request - Datos inválidos
- **401**: Unauthorized - No autenticado
- **403**: Forbidden - Sin permisos
- **404**: Not Found - Recurso no encontrado
- **500**: Internal Server Error - Error del servidor

## Campos de Búsqueda y Filtros

### Parámetros de consulta comunes:
- `page`: Número de página (default: 1)
- `limit`: Límite de resultados por página (default: 10)
- `search`: Término de búsqueda
- `estado`: Estado del recurso
- `activo`: Filtrar por estado activo (true/false)

### Campos de ordenamiento:
- `sortBy`: Campo para ordenar
- `sortOrder`: `asc` o `desc` (default: `desc`)

## Ejemplo de Integración con Frontend

### JavaScript/React Example:
```javascript
// Login
const login = async (email, password) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  if (data.success) {
    localStorage.setItem('token', data.data.token);
    return data.data.user;
  }
  throw new Error(data.message);
};

// Obtener clientes
const getClientes = async (page = 1, search = '') => {
  const token = localStorage.getItem('token');
  const response = await fetch(`/api/clientes?page=${page}&search=${search}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
};
```

## Rate Limiting
La API tiene un límite de 100 solicitudes por minuto por IP.

## Soporte
Para soporte técnico, contactar al equipo de desarrollo de FinCredit.
