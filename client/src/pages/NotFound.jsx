import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function NotFound() {
  const navigate = useNavigate();
  return React.createElement('div', { className: 'min-h-screen flex items-center justify-center bg-gray-50 p-8' },
    React.createElement('div', { className: 'text-center max-w-md' },
      React.createElement('h1', { className: 'text-6xl font-bold text-gray-200 mb-4' }, '404'),
      React.createElement('h2', { className: 'text-2xl font-semibold text-gray-700 mb-2' }, 'P\u00E1gina no encontrada'),
      React.createElement('p', { className: 'text-gray-500 mb-6' }, 'La p\u00E1gina que buscas no existe o ha sido movida.'),
      React.createElement(Button, { onClick: () => navigate('/', { replace: true }) }, 'Volver al inicio')
    )
  );
}
