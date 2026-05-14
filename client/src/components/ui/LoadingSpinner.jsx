import React from 'react';

function LoadingSpinner({ size = 'md', className }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };
  return React.createElement('div', {
    className: 'flex items-center justify-center ' + (className || ''),
    role: 'status'
  },
    React.createElement('div', {
      className: sizes[size] + ' border-2 border-border rounded-full animate-spin',
      style: { borderTopColor: 'var(--primary)' }
    }),
    React.createElement('span', { className: 'sr-only' }, 'Cargando...')
  );
}

export default React.memo(LoadingSpinner);
