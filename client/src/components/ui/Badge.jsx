import React from 'react';

function Badge({ children, variant = 'default' }) {
  const styles = {
    default: 'bg-muted text-muted-foreground',
    success: 'bg-accent/10 text-accent-foreground',
    danger: 'bg-destructive/10 text-destructive',
    warning: 'bg-warning-100 text-warning-800',
    info: 'bg-primary/10 text-primary-foreground',
    primary: 'bg-primary text-primary-foreground'
  };
  return React.createElement('span', { className: 'px-2.5 py-0.5 rounded-full text-xs font-semibold ' + (styles[variant] || styles.default) }, children);
}

export default React.memo(Badge);
