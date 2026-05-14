import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import BaseLayout from './BaseLayout';

const menuItems = [
  { label: 'Dashboard', path: '/empleado/dashboard', icon: '📊' },
  { label: 'Mis Clientes', path: '/empleado/mis-clientes', icon: '👤' },
  { label: 'Préstamos', path: '/empleado/prestamos', icon: '💰' },
  { label: 'Nueva Venta', path: '/empleado/nueva-venta', icon: '🛒' },
];

export default function EmpleadoLayout() {
  const { isAuthenticated, rol } = useAuthStore();

  if (!isAuthenticated) return React.createElement(Navigate, { to: '/login', replace: true });
  if (rol !== 'empleado') {
    const destino = { supervisor: '/supervisor/dashboard', cliente: '/cliente/inicio' }[rol] || '/login';
    return React.createElement(Navigate, { to: destino, replace: true });
  }

  return React.createElement(BaseLayout, { menuItems, rol }, React.createElement(Outlet, null));
}