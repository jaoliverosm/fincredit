import React from 'react';

function StatCard({ title, value, icon: Icon, color = 'blue', trend }) {
  const colors = {
    blue: 'text-primary bg-primary/10',
    green: 'text-accent bg-accent/10',
    red: 'text-destructive bg-destructive/10',
    yellow: 'text-warning-500 bg-warning-100',
    primary: 'text-primary bg-primary/10',
    success: 'text-accent bg-accent/10',
    danger: 'text-destructive bg-destructive/10',
    warning: 'text-warning-500 bg-warning-100'
  };
  return React.createElement('div', {
    className: 'bg-card text-card-foreground border border-border p-6 rounded-[var(--radius)]',
    style: { boxShadow: 'var(--shadow-sm)' }
  },
    React.createElement('div', { className: 'flex items-center justify-between' },
      React.createElement('div', null,
        React.createElement('p', { className: 'text-sm text-muted-foreground' }, title),
        React.createElement('p', { className: 'text-2xl font-bold mt-1' }, value)
      ),
      React.createElement('div', { className: 'w-12 h-12 rounded-lg flex items-center justify-center ' + (colors[color] || '') },
        Icon && React.createElement(Icon, { size: 24 })
      )
    ),
    trend !== undefined && React.createElement('p', { className: 'text-xs mt-2 ' + (trend > 0 ? 'text-accent' : 'text-destructive') },
      (trend > 0 ? '\u2191 ' : '\u2193 ') + Math.abs(trend) + '%'
    )
  );
}

export default React.memo(StatCard);
