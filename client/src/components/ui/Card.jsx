import React from 'react';

function Card({ children, className }) {
  return React.createElement('div', {
    className: 'bg-card text-card-foreground border border-border p-6 rounded-[var(--radius)] ' + (className || ''),
    style: { boxShadow: 'var(--shadow-sm)' }
  }, children);
}

export default React.memo(Card);
