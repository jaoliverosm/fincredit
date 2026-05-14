import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return React.createElement('div', { className: 'min-h-screen flex items-center justify-center bg-gray-50 p-8' },
        React.createElement('div', { className: 'text-center max-w-md' },
          React.createElement('h1', { className: 'text-2xl font-bold text-red-600 mb-4' }, 'Error inesperado'),
          React.createElement('p', { className: 'text-gray-600 mb-4' }, 'Ocurri\u00F3 un error al cargar la p\u00E1gina. Intenta recargar.'),
          React.createElement('pre', { className: 'bg-red-50 text-red-700 p-4 rounded-lg text-sm overflow-auto max-h-40 mb-4' }, this.state.error?.message),
          React.createElement('button', {
            onClick: () => window.location.reload(),
            className: 'px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition'
          }, 'Recargar p\u00E1gina')
        )
      );
    }
    return this.props.children;
  }
}
