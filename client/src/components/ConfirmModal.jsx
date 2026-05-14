import React from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';

export default function ConfirmModal({ open, onClose, onConfirm, title, message, confirmText = 'Confirmar', cancelText = 'Cancelar', variant = 'danger' }) {
  return React.createElement(Modal, { open, onClose, title: title || 'Confirmar' },
    React.createElement('div', { className: 'space-y-4' },
      React.createElement('p', { className: 'text-gray-600' }, message || '¿Estás seguro?'),
      React.createElement('div', { className: 'flex justify-end gap-3' },
        React.createElement(Button, { variant: 'secondary', onClick: onClose }, cancelText),
        React.createElement(Button, { variant: variant, onClick: () => { onConfirm(); onClose(); } }, confirmText)
      )
    )
  );
}
