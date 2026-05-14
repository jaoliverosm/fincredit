import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import BaseLayout from './BaseLayout';

const menuItems = [
  { label: 'Dashboard', path: '/supervisor/dashboard', icon: '\uD83D\uDCCA' },
  { label: 'Empleados', path: '/supervisor/empleados', icon: '\uD83D\uDC65' },
  { label: 'Clientes', path: '/supervisor/clientes', icon: '\uD83D\uDC64' },
  { label: 'Pr\u00E9stamos', path: '/supervisor/prestamos', icon: '\uD83D\uDCB0' },
  { label: 'Art\u00EDculos', path: '/supervisor/articulos', icon: '\uD83D\uDCE6' },
  { label: 'Ventas', path: '/supervisor/ventas', icon: '\uD83D\uDED2' },
  { label: 'Solicitudes', path: '/supervisor/solicitudes', icon: '\uD83D\uDCCB' },
  { label: 'Configuraci\u00F3n', path: '/supervisor/configuracion', icon: '\u2699\uFE0F' },
];

export default function SupervisorLayout() {
  const { isAuthenticated, rol } = useAuthStore();

  if (!isAuthenticated) return React.createElement(Navigate, { to: '/login', replace: true });
  if (rol !== 'supervisor') {
    const destino = { empleado: '/empleado/dashboard', cliente: '/cliente/inicio' }[rol] || '/login';
    return React.createElement(Navigate, { to: destino, replace: true });
  }

  return React.createElement(BaseLayout, { menuItems }, React.createElement(Outlet, null));
}
