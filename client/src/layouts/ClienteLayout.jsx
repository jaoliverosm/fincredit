import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import BaseLayout from './BaseLayout';

const menuItems = [
  { label: 'Inicio', path: '/cliente/inicio', icon: '🏠' },
  { label: 'Mis Préstamos', path: '/cliente/mis-prestamos', icon: '💰' },
  { label: 'Mis Compras', path: '/cliente/mis-compras', icon: '🛒' },
  { label: 'Mis Pagos', path: '/cliente/mis-pagos', icon: '💳' },
  { label: 'Solicitar', path: '/cliente/solicitar', icon: '📝' },
];

export default function ClienteLayout() {
  const { isAuthenticated, rol } = useAuthStore();

  if (!isAuthenticated) return React.createElement(Navigate, { to: '/login', replace: true });
  if (rol !== 'cliente') {
    const destino = { supervisor: '/supervisor/dashboard', empleado: '/empleado/dashboard' }[rol] || '/login';
    return React.createElement(Navigate, { to: destino, replace: true });
  }

  return React.createElement(BaseLayout, { menuItems, rol }, React.createElement(Outlet, null));
}