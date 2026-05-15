import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { api } from '../store/authStore';
import { LogOut, Menu, X, Landmark } from 'lucide-react';
import Badge from '../components/ui/Badge';
import ThemeToggle from '../components/ThemeToggle';
import ConfirmModal from '../components/ConfirmModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function BaseLayout({ menuItems }) {
  const { logout, rol } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [showLogout, setShowLogout] = React.useState(false);
  const [logoUrl, setLogoUrl] = React.useState('');
  const [empresa, setEmpresa] = React.useState('FinCredit');

  React.useEffect(() => {
    api.get('/config').then(res => {
      if (res.data?.config) {
        setLogoUrl(res.data.config.logoUrl || '');
        setEmpresa(res.data.config.nombreEmpresa || 'FinCredit');
      }
    }).catch(() => {});
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return React.createElement('div', { className: 'flex h-screen bg-gray-50' },
    sidebarOpen && React.createElement('div', {
      className: 'fixed inset-0 bg-black/30 z-40 lg:hidden',
      onClick: () => setSidebarOpen(false)
    }),

    React.createElement('aside', {
      className: 'fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transition-transform ' + (sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0')
    },
      React.createElement('div', { className: 'p-4 border-b flex items-center justify-between' },
        React.createElement('div', { className: 'flex items-center gap-2' },
          logoUrl
            ? React.createElement('img', { src: API_URL + logoUrl, alt: empresa, className: 'h-8 w-auto' })
            : React.createElement(Landmark, { className: 'text-primary-600', size: 28 }),
          React.createElement('h1', { className: 'text-xl font-bold text-primary-600' }, empresa)
        ),
        React.createElement('button', { onClick: () => setSidebarOpen(false), className: 'lg:hidden' },
          React.createElement(X, { size: 20 })
        )
      ),
      React.createElement('nav', { className: 'p-2 space-y-1 overflow-y-auto flex-1' },
        menuItems.map((item) =>
          React.createElement('button', {
            key: item.path,
            onClick: () => { navigate(item.path); setSidebarOpen(false); },
            className: 'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition'
          },
            React.createElement('span', null, item.icon),
            item.label
          )
        )
      )
    ),

    React.createElement('div', { className: 'flex-1 flex flex-col overflow-hidden' },
      React.createElement('header', { className: 'bg-white border-b px-4 py-3 flex items-center justify-between' },
        React.createElement('button', { onClick: () => setSidebarOpen(true), className: 'lg:hidden', 'aria-label': 'Abrir men\u00FA' },
          React.createElement(Menu, { size: 24 })
        ),
        React.createElement('h2', { className: 'text-lg font-semibold' }, empresa),
        React.createElement('div', { className: 'flex items-center gap-4' },
          React.createElement(ThemeToggle, null),
          React.createElement(Badge, null, rol?.toUpperCase() ?? ''),
          React.createElement('button', {
            onClick: () => setShowLogout(true),
            className: 'flex items-center gap-1 text-sm text-gray-600 hover:text-red-500 transition'
          },
            React.createElement(LogOut, { size: 16 }),
            'Cerrar sesi\u00F3n'
          )
        )
      ),
      React.createElement('main', { className: 'flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6' },
        React.createElement(Outlet, null)
      )
    ),

    React.createElement(ConfirmModal, {
      open: showLogout,
      onClose: () => setShowLogout(false),
      onConfirm: handleLogout,
      title: 'Cerrar sesi\u00F3n',
      message: '\u00BFEst\u00E1s seguro de que deseas cerrar sesi\u00F3n?',
      confirmText: 'Cerrar sesi\u00F3n',
      variant: 'danger'
    })
  );
}
