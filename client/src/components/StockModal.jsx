import React, { useState } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Input from './ui/Input';

export default function StockModal({ open, onClose, onConfirm, tipo }) {
  const [cantidad, setCantidad] = useState('');

  const handleSubmit = () => {
    const num = parseInt(cantidad);
    if (!num || num <= 0) return;
    onConfirm(num);
    setCantidad('');
    onClose();
  };

  return React.createElement(Modal, { open, onClose, title: tipo === 'sumar' ? 'Agregar Stock' : 'Restar Stock' },
    React.createElement('div', { className: 'space-y-4' },
      React.createElement(Input, {
        label: 'Unidades a ' + (tipo === 'sumar' ? 'agregar' : 'restar'),
        type: 'number',
        min: '1',
        value: cantidad,
        onChange: e => setCantidad(e.target.value),
        required: true
      }),
      React.createElement('div', { className: 'flex justify-end gap-3' },
        React.createElement(Button, { variant: 'secondary', onClick: () => { setCantidad(''); onClose(); } }, 'Cancelar'),
        React.createElement(Button, { variant: 'primary', onClick: handleSubmit, disabled: !cantidad || parseInt(cantidad) <= 0 }, 'Aceptar')
      )
    )
  );
}
