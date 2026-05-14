import React, { useId } from 'react';

export default function Select({ label, options, error, className, id, ...props }) {
  const genId = useId();
  const selectId = id || genId;
  const errorId = selectId + '-error';
  return React.createElement('div', { className: 'w-full' },
    label && React.createElement('label', { htmlFor: selectId, className: 'block text-sm font-medium text-muted-foreground mb-1' }, label),
    React.createElement('select', {
      id: selectId,
      'aria-invalid': !!error,
      'aria-describedby': error ? errorId : undefined,
      className: 'w-full px-3 py-2 border border-border rounded-[var(--radius)] focus:outline-none focus:ring-2 focus:ring-ring bg-input text-foreground transition ' + (className || ''),
      ...props
    },
      React.createElement('option', { value: '', disabled: true }, 'Seleccionar...'),
      (options || []).map(o => React.createElement('option', { key: o.value, value: o.value }, o.label))
    ),
    error && React.createElement('p', { id: errorId, role: 'alert', className: 'text-destructive text-xs mt-1' }, error)
  );
}
