import React from 'react';

export default function Table({ columns, data, onRowClick, actions }) {
  return React.createElement('div', { className: 'overflow-x-auto rounded-[var(--radius)] border border-border' },
    React.createElement('table', { className: 'w-full text-sm', 'aria-label': 'Tabla de datos' },
      React.createElement('thead', { className: 'bg-muted border-b' },
        React.createElement('tr', null,
          columns.map(c => React.createElement('th', { key: c.key, scope: 'col', className: 'px-4 py-3 text-left font-medium text-muted-foreground ' + (c.className || '') }, c.label))
        )
      ),
      React.createElement('tbody', { className: 'divide-y bg-card' },
        data.length === 0 && React.createElement('tr', null,
          React.createElement('td', { colSpan: columns.length + (actions ? 1 : 0), className: 'px-4 py-8 text-center text-muted-foreground' }, 'No hay registros')
        ),
        data.map((row, i) =>
          React.createElement('tr', {
            key: row.id || i,
            onClick: () => onRowClick && onRowClick(row),
            onKeyDown: onRowClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onRowClick(row); } } : undefined,
            tabIndex: onRowClick ? 0 : undefined,
            role: onRowClick ? 'button' : undefined,
            'aria-label': onRowClick ? 'Ver detalle' : undefined,
            className: 'transition ' + (onRowClick ? 'cursor-pointer hover:bg-muted/40' : 'cursor-default')
          },
            columns.map(c => React.createElement('td', { key: c.key, className: 'px-4 py-3 ' + (c.className || '') },
              c.render ? c.render(row) : row[c.key]
            )),
            actions && React.createElement('td', { className: 'px-4 py-3' }, actions(row))
          )
        )
      )
    )
  );
}
