import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const ROL_REDIRECT = {
  supervisor: '/supervisor/dashboard',
  empleado: '/empleado/dashboard',
  cliente: '/cliente/inicio'
};

function decodeToken(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

function isTokenExpired(token) {
  const payload = decodeToken(token);
  if (!payload || !payload.exp) return true;
  return payload.exp * 1000 < Date.now();
}

export default function ProtectedRoute({ allowedRoles, children }) {
  const token = useAuthStore(s => s.token);
  const rol = useAuthStore(s => s.rol);

  if (!token || isTokenExpired(token)) {
    return React.createElement(Navigate, { to: '/login', replace: true });
  }

  if (allowedRoles && !allowedRoles.includes(rol)) {
    const target = ROL_REDIRECT[rol] || '/login';
    return React.createElement(Navigate, { to: target, replace: true });
  }

  return children;
}
