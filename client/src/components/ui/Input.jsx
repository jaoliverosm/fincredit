import React, { useId } from 'react';

export default function Input({ label, error, className, id, ...props }) {
  const genId = useId();
  const inputId = id || genId;
  const errorId = inputId + '-error';
  return React.createElement('div', { className: 'w-full' },
    label && React.createElement('label', { htmlFor: inputId, className: 'block text-sm font-medium text-muted-foreground mb-1' }, label),
    React.createElement('input', {
      id: inputId,
      'aria-invalid': !!error,
      'aria-describedby': error ? errorId : undefined,
      className: 'w-full px-3 py-2 border border-border rounded-[var(--radius)] focus:outline-none focus:ring-2 focus:ring-ring bg-input text-foreground placeholder:text-muted-foreground transition ' + (error ? 'border-destructive text-destructive' : '') + ' ' + (className || ''),
      ...props
    }),
    error && React.createElement('p', { id: errorId, role: 'alert', className: 'text-destructive text-xs mt-1' }, error)
  );
}
