import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';
import { setGlobalNavigate } from './lib/navigation';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import SupervisorLayout from './layouts/SupervisorLayout';
import EmpleadoLayout from './layouts/EmpleadoLayout';
import ClienteLayout from './layouts/ClienteLayout';
import ProtectedRoute from './router/ProtectedRoute';

const SupervisorDashboard = lazy(() => import('./pages/supervisor/Dashboard'));
const Articulos = lazy(() => import('./pages/supervisor/Articulos'));
const Clientes = lazy(() => import('./pages/supervisor/Clientes'));
const Empleados = lazy(() => import('./pages/supervisor/Empleados'));
const Prestamos = lazy(() => import('./pages/supervisor/Prestamos'));
const Ventas = lazy(() => import('./pages/supervisor/Ventas'));
const Solicitudes = lazy(() => import('./pages/supervisor/Solicitudes'));
const Configuracion = lazy(() => import('./pages/supervisor/Configuracion'));
const Pagos = lazy(() => import('./pages/supervisor/Pagos'));

const EmpleadoDashboard = lazy(() => import('./pages/empleado/Dashboard'));
const MisClientes = lazy(() => import('./pages/empleado/MisClientes'));
const EmpleadoPrestamos = lazy(() => import('./pages/empleado/Prestamos'));
const NuevaVenta = lazy(() => import('./pages/empleado/NuevaVenta'));

const ClienteInicio = lazy(() => import('./pages/cliente/Inicio'));
const MisPrestamos = lazy(() => import('./pages/cliente/MisPrestamos'));
const MisCompras = lazy(() => import('./pages/cliente/MisCompras'));
const MisPagos = lazy(() => import('./pages/cliente/MisPagos'));
const Solicitar = lazy(() => import('./pages/cliente/Solicitar'));
const NotFound = lazy(() => import('./pages/NotFound'));

function RouterAware() {
  const navigate = useNavigate();
  useEffect(() => { setGlobalNavigate(navigate); }, [navigate]);
  return null;
}

function App() {
  return React.createElement(ErrorBoundary, null,
    React.createElement(BrowserRouter, null,
      React.createElement(Toaster, { position: 'top-right', toastOptions: { duration: 3000 } }),
      React.createElement(RouterAware, null),
      React.createElement(Suspense, { fallback: React.createElement('div', { className: 'flex justify-center items-center min-h-screen' },
        React.createElement('div', { className: 'animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600' })
      ) },
        React.createElement(Routes, null,
          React.createElement(Route, { path: '/', element: React.createElement(Navigate, { to: '/login', replace: true }) }),
          React.createElement(Route, { path: '/login', element: React.createElement(Login) }),
          React.createElement(Route, { path: '/register', element: React.createElement(Register) }),
          React.createElement(Route, { path: '/supervisor', element:
            React.createElement(ProtectedRoute, { allowedRoles: ['supervisor'] },
              React.createElement(SupervisorLayout)
            )
          },
            React.createElement(Route, { index: true, element: React.createElement(SupervisorDashboard) }),
            React.createElement(Route, { path: 'dashboard', element: React.createElement(SupervisorDashboard) }),
            React.createElement(Route, { path: 'articulos', element: React.createElement(Articulos) }),
            React.createElement(Route, { path: 'clientes', element: React.createElement(Clientes) }),
            React.createElement(Route, { path: 'empleados', element: React.createElement(Empleados) }),
            React.createElement(Route, { path: 'prestamos', element: React.createElement(Prestamos) }),
            React.createElement(Route, { path: 'prestamos/:id', element: React.createElement(Prestamos) }),
            React.createElement(Route, { path: 'pagos', element: React.createElement(Pagos) }),
            React.createElement(Route, { path: 'ventas', element: React.createElement(Ventas) }),
            React.createElement(Route, { path: 'ventas/:id', element: React.createElement(Ventas) }),
            React.createElement(Route, { path: 'solicitudes', element: React.createElement(Solicitudes) }),
            React.createElement(Route, { path: 'configuracion', element: React.createElement(Configuracion) })
          ),
          React.createElement(Route, { path: '/empleado', element:
            React.createElement(ProtectedRoute, { allowedRoles: ['empleado'] },
              React.createElement(EmpleadoLayout)
            )
          },
            React.createElement(Route, { index: true, element: React.createElement(EmpleadoDashboard) }),
            React.createElement(Route, { path: 'dashboard', element: React.createElement(EmpleadoDashboard) }),
            React.createElement(Route, { path: 'mis-clientes', element: React.createElement(MisClientes) }),
            React.createElement(Route, { path: 'prestamos', element: React.createElement(EmpleadoPrestamos) }),
            React.createElement(Route, { path: 'prestamos/:id', element: React.createElement(EmpleadoPrestamos) }),
            React.createElement(Route, { path: 'nueva-venta', element: React.createElement(NuevaVenta) }),
            React.createElement(Route, { path: 'ventas/:id', element: React.createElement(NuevaVenta) })
          ),
          React.createElement(Route, { path: '/cliente', element:
            React.createElement(ProtectedRoute, { allowedRoles: ['cliente'] },
              React.createElement(ClienteLayout)
            )
          },
            React.createElement(Route, { index: true, element: React.createElement(ClienteInicio) }),
            React.createElement(Route, { path: 'inicio', element: React.createElement(ClienteInicio) }),
            React.createElement(Route, { path: 'mis-prestamos', element: React.createElement(MisPrestamos) }),
            React.createElement(Route, { path: 'mis-compras', element: React.createElement(MisCompras) }),
            React.createElement(Route, { path: 'mis-pagos', element: React.createElement(MisPagos) }),
            React.createElement(Route, { path: 'solicitar', element: React.createElement(Solicitar) })
          ),
          React.createElement(Route, { path: '*', element: React.createElement(NotFound) })
        )
      )
    )
  );
}

export default App;
