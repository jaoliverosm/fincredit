# 🏦 FinCredit — Plan Técnico Completo

## 1. Stack Tecnológico

| Capa | Tecnología | Razón |
|---|---|---|
| Frontend | React + Vite | Rápido, moderno, PWA-ready |
| Estilos | Tailwind CSS | Responsive y mobile-first |
| Rutas | React Router v6 | Navegación por roles |
| Estado global | Zustand | Simple, sin boilerplate |
| Gráficas | Recharts | Ligero, compatible React |
| HTTP cliente | Axios | Llamadas a la API |
| Backend | Node.js + Express | Ya lo conoces |
| Base de datos | PostgreSQL | Robusto para finanzas |
| ORM | Prisma | Migraciones limpias, tipado |
| Autenticación | JWT + bcrypt | Sesiones por rol |
| Tareas automáticas | node-cron | Mora automática nocturna |
| PWA | Vite PWA Plugin | Se instala como app |

---

## 2. Estructura de Carpetas

```
fincredit/
│
├── client/                          ← Frontend React
│   ├── public/
│   │   ├── manifest.json            ← Config PWA
│   │   └── icons/                   ← Íconos app
│   └── src/
│       ├── components/
│       │   ├── ui/                  ← Button, Card, Badge, Modal, Table
│       │   ├── layout/              ← Sidebar, Topbar, Layout, BottomNav
│       │   └── charts/              ← Gráficas reutilizables
│       ├── pages/
│       │   ├── auth/
│       │   │   └── Login.jsx
│       │   ├── supervisor/
│       │   │   ├── Dashboard.jsx
│       │   │   ├── Empleados.jsx
│       │   │   ├── Clientes.jsx
│       │   │   ├── Prestamos.jsx
│       │   │   ├── Articulos.jsx    ← Catálogo + stock
│       │   │   ├── Ventas.jsx
│       │   │   ├── Solicitudes.jsx
│       │   │   └── Configuracion.jsx
│       │   ├── empleado/
│       │   │   ├── Dashboard.jsx
│       │   │   ├── MisClientes.jsx
│       │   │   ├── Prestamos.jsx
│       │   │   ├── NuevaVenta.jsx
│       │   │   └── Solicitudes.jsx
│       │   └── cliente/
│       │       ├── Inicio.jsx
│       │       ├── MisPrestamos.jsx
│       │       ├── MisCompras.jsx
│       │       ├── MisPagos.jsx
│       │       └── Solicitar.jsx
│       ├── store/
│       │   ├── authStore.js         ← Usuario, token, rol
│       │   └── dataStore.js         ← Cache de datos
│       ├── services/
│       │   ├── auth.service.js
│       │   ├── clientes.service.js
│       │   ├── prestamos.service.js
│       │   ├── articulos.service.js
│       │   ├── ventas.service.js
│       │   ├── pagos.service.js
│       │   └── solicitudes.service.js
│       ├── hooks/
│       │   ├── useAuth.js
│       │   └── useRol.js
│       ├── utils/
│       │   ├── format.js            ← Moneda, fechas
│       │   └── calculos.js          ← Cuota, interés, mora
│       └── router/
│           ├── AppRouter.jsx
│           └── PrivateRoute.jsx
│
└── server/                          ← Backend Node.js
    ├── prisma/
    │   ├── schema.prisma
    │   └── seed.js                  ← Datos iniciales
    └── src/
        ├── controllers/
        │   ├── auth.controller.js
        │   ├── clientes.controller.js
        │   ├── prestamos.controller.js
        │   ├── articulos.controller.js
        │   ├── ventas.controller.js
        │   ├── pagos.controller.js
        │   ├── solicitudes.controller.js
        │   ├── empleados.controller.js
        │   ├── dashboard.controller.js
        │   └── config.controller.js
        ├── routes/
        │   └── (mismo nombre que controllers)
        ├── middlewares/
        │   ├── auth.middleware.js    ← Verifica JWT
        │   ├── rol.middleware.js     ← Verifica permisos
        │   └── error.middleware.js
        ├── services/
        │   ├── mora.service.js       ← Cron job nocturno
        │   └── calculos.service.js
        ├── jobs/
        │   └── mora.job.js           ← Cron: revisa mora cada noche
        └── app.js
```

---

## 3. Modelo de Base de Datos Completo

```
Usuario
├── id
├── nombre
├── email
├── password (hash bcrypt)
├── rol          → supervisor | empleado | cliente
├── activo       → boolean
└── creadoEn

Empleado
├── id
├── usuarioId    → FK Usuario
├── telefono
├── meta         → meta mensual en COP
└── fechaIngreso

Cliente
├── id
├── usuarioId    → FK Usuario
├── cedula
├── telefono
├── empleadoId   → FK Usuario (el empleado que lo registró)
├── estado       → activo | mora | pagado | inactivo
└── fechaRegistro

Prestamo
├── id
├── clienteId    → FK Cliente
├── empleadoId   → FK Usuario
├── monto
├── interes      → % anual
├── cuotas       → número de cuotas
├── cuotaMensual → calculada automáticamente
├── pagado       → acumulado de pagos
├── fechaInicio
├── fechaVencimiento
├── estado       → activo | mora | pagado
└── observacion

Articulo
├── id
├── nombre
├── descripcion
├── categoria
├── precio
├── stock        → unidades disponibles
├── imagen       → URL
├── activo       → boolean
└── creadoEn

VentaCredito
├── id
├── clienteId    → FK Cliente
├── empleadoId   → FK Usuario
├── articuloId   → FK Articulo
├── cantidad
├── precioUnitario
├── precioTotal  → cantidad × precioUnitario
├── interes      → % aplicado
├── cuotas
├── cuotaMensual
├── pagado
├── fechaVenta
├── fechaVencimiento
├── estado       → activo | mora | pagado
└── observacion

Pago
├── id
├── tipo         → prestamo | venta
├── referenciaId → FK Prestamo o VentaCredito (según tipo)
├── clienteId    → FK Cliente
├── empleadoId   → FK Usuario
├── monto
├── fecha
├── metodo       → efectivo | transferencia | otro
└── observacion

Solicitud
├── id
├── clienteId    → FK Cliente
├── empleadoId   → FK Usuario (el asignado)
├── tipo         → nuevo_prestamo | ampliacion | nueva_compra | mensaje
├── monto
├── cuotas
├── articuloId   → FK Articulo (si tipo = nueva_compra)
├── mensaje
├── respuesta
├── fecha
└── estado       → pendiente | aprobado | rechazado

Configuracion
├── id (único, solo 1 registro)
├── tasaDefault
├── cuotasMax
├── cuotasMin
├── montoMaxPrestamo
├── montoMinPrestamo
├── nombreEmpresa
└── moneda
```

---

## 4. Permisos por Rol

| Acción | Supervisor | Empleado | Cliente |
|---|---|---|---|
| Ver todos los clientes | ✅ | ❌ solo los suyos | ❌ solo él mismo |
| Crear clientes | ✅ | ✅ | ❌ |
| Aprobar préstamos | ✅ | ❌ | ❌ |
| Registrar préstamos | ✅ | ✅ | ❌ |
| Registrar pagos | ✅ | ✅ | ❌ |
| Ver catálogo artículos | ✅ | ✅ | ✅ |
| Crear/editar artículos | ✅ | ❌ | ❌ |
| Registrar venta crédito | ✅ | ✅ | ❌ |
| Enviar solicitudes | ❌ | ❌ | ✅ |
| Responder solicitudes | ✅ | ✅ | ❌ |
| Crear empleados | ✅ | ❌ | ❌ |
| Ver dashboards globales | ✅ | ❌ solo el suyo | ❌ solo el suyo |
| Editar configuración | ✅ | ❌ | ❌ |
| Mover stock | ✅ | ❌ | ❌ |

---

## 5. Endpoints REST Completos

```
── AUTH ──────────────────────────────────────
POST   /api/auth/login
GET    /api/auth/me

── EMPLEADOS ─────────────────────────────────
GET    /api/empleados                → supervisor
POST   /api/empleados                → supervisor
GET    /api/empleados/:id
PUT    /api/empleados/:id
GET    /api/empleados/:id/metricas   → supervisor

── CLIENTES ──────────────────────────────────
GET    /api/clientes                 → sup: todos | emp: los suyos
POST   /api/clientes
GET    /api/clientes/:id
PUT    /api/clientes/:id

── PRÉSTAMOS ─────────────────────────────────
GET    /api/prestamos                → filtrado por rol
POST   /api/prestamos
GET    /api/prestamos/:id
PUT    /api/prestamos/:id
GET    /api/prestamos/cliente/:id

── ARTÍCULOS ─────────────────────────────────
GET    /api/articulos                → todos los roles
POST   /api/articulos                → supervisor
GET    /api/articulos/:id
PUT    /api/articulos/:id
DELETE /api/articulos/:id            → supervisor
PATCH  /api/articulos/:id/stock      → supervisor ajusta stock

── VENTAS A CRÉDITO ──────────────────────────
GET    /api/ventas                   → filtrado por rol
POST   /api/ventas                   → empleado / supervisor
GET    /api/ventas/:id
GET    /api/ventas/cliente/:id

── PAGOS ─────────────────────────────────────
POST   /api/pagos                    → empleado registra
GET    /api/pagos/prestamo/:id
GET    /api/pagos/venta/:id
GET    /api/pagos/cliente/:id

── SOLICITUDES ───────────────────────────────
GET    /api/solicitudes              → filtrado por rol
POST   /api/solicitudes              → cliente crea
PUT    /api/solicitudes/:id/responder → empleado / supervisor

── DASHBOARD ─────────────────────────────────
GET    /api/dashboard/supervisor
GET    /api/dashboard/empleado
GET    /api/dashboard/cliente

── CONFIGURACIÓN ─────────────────────────────
GET    /api/config
PUT    /api/config                   → supervisor
```

---

## 6. Lógica de Negocio Clave

**Cuota mensual** — fórmula de amortización francesa:
```
cuota = monto × [r(1+r)^n] / [(1+r)^n - 1]
donde r = tasa anual / 12 / 100
```

**Stock** — al registrar una venta a crédito, el sistema descuenta automáticamente la cantidad del stock del artículo. Si stock = 0, bloquea la venta.

**Mora automática** — cron job que corre cada noche a las 11:59 PM. Revisa todos los préstamos y ventas activos cuya fecha de vencimiento de cuota ya pasó y cambia su estado a mora.

**Flujo de solicitud:**
```
Cliente envía solicitud
    → Empleado asignado recibe notificación
    → Empleado aprueba o rechaza
    → Si aprueba préstamo grande → supervisor confirma
    → Cliente recibe respuesta
```

---

## 7. Flujo de Autenticación

```
Login (email + pass)
  → Backend valida credenciales
  → Genera JWT con { id, rol, empleadoId? }
  → Frontend guarda token en Zustand (memoria)
  → React Router redirige:
       supervisor → /supervisor/dashboard
       empleado   → /empleado/dashboard
       cliente    → /cliente/inicio
  → Cada petición lleva Authorization: Bearer <token>
  → Middleware valida token + rol en cada endpoint
  → Token expira en 8 horas → redirige al login
```

---

## 8. Fases de Construcción

| # | Fase | Qué construimos |
|---|---|---|
| 1 | Base del servidor | Express + Prisma + PostgreSQL + variables de entorno |
| 2 | Autenticación | JWT, bcrypt, login, middleware de roles |
| 3 | Layout base frontend | Login, rutas protegidas, sidebar, topbar |
| 4 | Módulo Clientes | CRUD completo en backend y frontend |
| 5 | Módulo Préstamos | Registro, cálculo de cuotas, pagos |
| 6 | Módulo Artículos | Catálogo, stock, imágenes |
| 7 | Módulo Ventas a Crédito | Venta, cuotas, descuento de stock |
| 8 | Módulo Pagos | Unificado para préstamos y ventas |
| 9 | Módulo Solicitudes | Envío, notificaciones, aprobación |
| 10 | Dashboards | Gráficas, métricas por rol |
| 11 | Mora automática | Cron job nocturno |
| 12 | Configuración global | Panel supervisor |
| 13 | PWA | Manifest, service worker, instalable |

---
