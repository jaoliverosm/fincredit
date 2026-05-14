import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore(s => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const usuario = await login(email, password);
      const routeMap = { supervisor: '/supervisor/dashboard', empleado: '/empleado/dashboard', cliente: '/cliente/inicio' };
      navigate(routeMap[usuario.rol] || '/supervisor/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return React.createElement('div', { className: 'min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4' },
    React.createElement('div', { className: 'w-full max-w-md' },
      React.createElement('div', { className: 'text-center mb-8' },
        React.createElement('h1', { className: 'text-3xl font-bold text-primary-600 mb-2' }, '🏦 FinCredit' ),
        React.createElement('p', { className: 'text-gray-500' }, 'Sistema de Gestión Financiera' )
      ),
      React.createElement(Card, null,
        React.createElement('h2', { className: 'text-xl font-semibold mb-6 text-center' }, 'Iniciar Sesión'),
        error && React.createElement('div', { role: 'alert', className: 'bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm' }, error),
        React.createElement('form', { onSubmit: handleSubmit, className: 'space-y-4' },
          React.createElement(Input, { label: 'Email', type: 'email', value: email, onChange: e => setEmail(e.target.value), required: true, placeholder: 'usuario@empresa.com', autoComplete: 'email' }),
          React.createElement(Input, { label: 'Contraseña', type: 'password', value: password, onChange: e => setPassword(e.target.value), required: true, placeholder: '••••••••', autoComplete: 'current-password' }),
          React.createElement(Button, { type: 'submit', className: 'w-full', disabled: loading },
            loading ? 'Iniciando...' : 'Iniciar Sesión'
          )
        )
      )
    )
  );
}